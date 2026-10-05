$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# --- Load original -------------------------------------------------
$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path 'ksa avtar.png'))

# --- Fast pixel scan to find the emblem bounds ---------------------
$rect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, $src.Height)
$data = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $data.Height)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$src.UnlockBits($data)

$minX = $src.Width; $minY = $src.Height; $maxX = -1; $maxY = -1
for ($y = 0; $y -lt $src.Height; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $src.Width; $x++) {
        $i = $row + $x * 4
        if ($bytes[$i + 3] -gt 60 -and ($bytes[$i] -gt 60 -or $bytes[$i + 1] -gt 60 -or $bytes[$i + 2] -gt 60)) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Emblem bounds: ($minX,$minY) - ($maxX,$maxY)  ->  $($maxX - $minX + 1)x$($maxY - $minY + 1) px"

# --- Tight square crop centered on the emblem, ~8% padding ---------
$cx = ($minX + $maxX) / 2.0
$cy = ($minY + $maxY) / 2.0
$side = ([Math]::Max($maxX - $minX, $maxY - $minY) + 1) * 1.16
$size = [int][Math]::Round($side)
$x0 = [int][Math]::Round($cx - $side / 2.0)
$y0 = [int][Math]::Round($cy - $side / 2.0)
if ($x0 -lt 0) { $x0 = 0 }
if ($y0 -lt 0) { $y0 = 0 }
if ($x0 + $size -gt $src.Width) { $size = $src.Width - $x0 }
if ($y0 + $size -gt $src.Height) { $size = $src.Height - $y0 }
Write-Host "Crop: ($x0,$y0) size $size"

# --- Render at 512x512, high quality -------------------------------
$outSize = 512
$bmp = New-Object System.Drawing.Bitmap($outSize, $outSize)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($src,
    (New-Object System.Drawing.Rectangle(0, 0, $outSize, $outSize)),
    (New-Object System.Drawing.Rectangle($x0, $y0, $size, $size)),
    [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save((Join-Path (Get-Location) 'images\ksa-avatar.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()

Write-Host "Saved: images\ksa-avatar.png ($([math]::Round((Get-Item 'images\ksa-avatar.png').Length / 1KB)) KB)"

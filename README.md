# Raspberry Pi — The Field Guide

A professional, self-contained one-page website about the Raspberry Pi:
models, specs comparison, project ideas, a getting-started guide and a photo gallery.

**Made by ABO 3MAD**

🌐 **Live site:** https://zxwxg.github.io/raspberry-pi/

## Files

```
RAS/
├── index.html        ← the website (open this)
├── css/
│   └── style.css     ← design system & layout
├── js/
│   └── main.js       ← nav, animations, lightbox, FAQ, counters
└── images/           ← 11 photos (freely licensed, from Wikimedia Commons)
```

## How to open

- Double-click `index.html` (works directly from the file system), or
- Serve it locally: `python -m http.server 8000` then visit http://localhost:8000

## Features

- Responsive dark design (desktop / tablet / mobile)
- Animated hero, stat counters, scroll-reveal sections
- Interactive spec comparison table
- Gallery with lightbox (keyboard: Esc to close, ←/→ to browse)
- FAQ accordion, mobile menu, copy-to-clipboard terminal block
- Respects `prefers-reduced-motion`

## Content notes

- Prices are indicative USD "from" prices (Oct 2026). Memory prices rose
  sharply through 2025–26; always check raspberrypi.com for current pricing.
- Photo credits (with license links) are listed in the website footer.
  Sources: Wikimedia Commons — CC BY 4.0 / CC BY-SA 4.0 / CC BY 2.0 /
  CC BY-SA 2.0 / CC0, by SimonWaldherr, Laserlicht, Anil Öztas, Profpcde,
  Florian Knodt, RetroEditor and Les Pounder.

## Disclaimer

Unofficial educational fan page. Raspberry Pi is a trademark of
Raspberry Pi Ltd. Not affiliated with or endorsed by Raspberry Pi Ltd.

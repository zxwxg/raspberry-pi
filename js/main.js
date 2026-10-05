/* ============================================================
   Raspberry Pi — The Field Guide
   Interactions: nav, reveal, counters, gallery lightbox, FAQ
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav ---------- */
  const nav = $("#nav");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
    toTop.classList.toggle("show", window.scrollY > 700);
    highlightNav();
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", navLinks).forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") navLinks.classList.remove("open");
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || "0", 10);
          setTimeout(() => el.classList.add("revealed"), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$(".count");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = prefix + value + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          cio.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => {
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      el.textContent =
        (el.dataset.prefix || "") +
        parseFloat(el.dataset.count || "0").toFixed(decimals) +
        (el.dataset.suffix || "");
    });
  }

  /* ---------- Active nav link highlighting ---------- */
  const sections = $$("main section[id]");
  const navAnchors = $$("#navLinks > a:not(.btn)");
  function highlightNav() {
    const pos = window.scrollY + 130;
    let current = "";
    sections.forEach((s) => {
      if (s.offsetTop <= pos) current = s.id;
    });
    navAnchors.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + current)
    );
  }
  highlightNav();

  /* ---------- Hero tilt (subtle, pointer devices only) ---------- */
  const tiltEl = $("#heroTilt");
  if (tiltEl && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const strength = 6;
    tiltEl.addEventListener("mousemove", (e) => {
      const r = tiltEl.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
    });
    tiltEl.addEventListener("mouseleave", () => {
      tiltEl.style.transform = "";
    });
  }

  /* ---------- Terminal copy button ---------- */
  const copyBtn = $("#copyBtn");
  const codeBlock = $("#codeBlock");
  if (copyBtn && codeBlock) {
    copyBtn.addEventListener("click", async () => {
      const text = codeBlock.innerText;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied ✓";
      } catch {
        // Fallback for file:// contexts where clipboard API is restricted
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); copyBtn.textContent = "Copied ✓"; }
        catch { copyBtn.textContent = "Select & copy"; }
        ta.remove();
      }
      setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
    });
  }

  /* ---------- FAQ: one open at a time ---------- */
  const faqItems = $$(".faq details");
  faqItems.forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) faqItems.forEach((other) => (other.open = other === d ? true : false));
    })
  );

  /* ---------- Gallery lightbox ---------- */
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCaption = $("#lbCaption");
  const lbCredit = $("#lbCredit");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  const items = $$(".g-item");
  let current = 0;
  let lastFocus = null;

  function showItem(index) {
    current = (index + items.length) % items.length;
    const fig = items[current];
    const img = $("img", fig);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = fig.dataset.caption || "";
    lbCredit.textContent = fig.dataset.credit ? "· " + fig.dataset.credit : "";
    lbCredit.href = fig.dataset.url || "#";
  }
  function openLightbox(index) {
    lastFocus = document.activeElement;
    showItem(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  items.forEach((fig, i) => {
    fig.addEventListener("click", () => openLightbox(i));
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", "View image: " + (fig.dataset.caption || "photo"));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => showItem(current - 1));
  lbNext.addEventListener("click", () => showItem(current + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showItem(current - 1);
    if (e.key === "ArrowRight") showItem(current + 1);
  });

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  );

  /* ---------- Footer year ---------- */
  $("#year").textContent = String(new Date().getFullYear());

  /* ---------- Init ---------- */
  onScroll();
})();

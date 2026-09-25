(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ===================== LENIS SMOOTH SCROLL ===================== */
  let lenis = null;

  if (!prefersReduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: -70, duration: 1.3 });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      const el = document.querySelector(target);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }

  /* ===================== AOS INIT ===================== */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: false,
      mirror: true,
      offset: 80,
    });
  }

  /* neutral anchors */
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });

  /* ===================== HELPERS ===================== */
  function splitWords(el) {
    if (!el || el.dataset.splitDone) return [];
    const emWords = new Set();
    el.querySelectorAll("em").forEach((em) => {
      em.textContent.split(/\s+/).forEach((w) => emWords.add(w));
    });
    const text = el.textContent.trim();
    el.innerHTML = "";
    const words = text.split(/\s+/);
    const inners = [];
    words.forEach((word, i) => {
      const w = document.createElement("span");
      w.className = "w";
      const wi = document.createElement("span");
      wi.className = "wi" + (emWords.has(word.replace(/[^\w]/g, "")) ? " em" : "");
      wi.textContent = word;
      w.appendChild(wi);
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      inners.push(wi);
    });
    el.dataset.splitDone = "1";
    return inners;
  }

  function splitChars(el, goldRange) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent;
    el.textContent = "";
    const chars = [];
    let ci = 0;
    text.split(/(\s+)/).forEach((token) => {
      if (/^\s+$/.test(token)) {
        const sp = document.createElement("span");
        sp.className = "ch sp";
        sp.style.setProperty("--ci", ci);
        sp.textContent = " ";
        el.appendChild(sp);
        chars.push(sp);
        ci += 1;
        return;
      }
      const w = document.createElement("span");
      w.className = "w-nw";
      token.split("").forEach((c) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.style.setProperty("--ci", ci);
        s.textContent = c;
        w.appendChild(s);
        chars.push(s);
        ci += 1;
      });
      el.appendChild(w);
    });
    if (goldRange) {
      const [start, end] = goldRange;
      chars.forEach((c, i) => {
        if (i >= start && i <= end) c.classList.add("is-gold");
      });
    }
    el.dataset.splitDone = "1";
    return chars;
  }

  document.querySelectorAll("[data-split-words]").forEach((el) => {
    const words = splitWords(el);
    if (!words.length) return;
    gsap.to(words, {
      y: 0,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.055,
      scrollTrigger: { trigger: el, start: "top 78%" },
    });
  });

  /* ===================== SCROLL PROGRESS ===================== */
  const progressBar = document.getElementById("scrollProgress");

  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = p + "%";
  }

  /* ===================== HEADER ===================== */
  const header = document.getElementById("siteHeader");

  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    updateProgress();
    updateActiveNav();
  }

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  updateProgress();

  /* brand click reloads home */
  const brandHome = document.getElementById("brandHome");
  if (brandHome) {
    brandHome.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../index.html";
    });
  }

  /* nav letter wave hover */
  document.querySelectorAll("[data-wave]").forEach((link) => {
    splitChars(link);
    link.addEventListener("mouseenter", () => {
      const chars = link.querySelectorAll(".ch");
      gsap.fromTo(
        chars,
        { y: 0 },
        {
          y: -5,
          duration: 0.32,
          ease: "power2.out",
          stagger: 0.025,
          yoyo: true,
          repeat: 1,
        }
      );
    });
  });

  /* ===================== MOBILE MENU ===================== */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mmClose = document.getElementById("mmClose");
  let menuOpen = false;

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    document.body.classList.add("menu-open");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();

    gsap.set(mobileMenu, { visibility: "visible" });
    const tl = gsap.timeline();
    tl.to(mobileMenu, {
      clipPath: "inset(0 0 0% 0)",
      duration: 0.75,
      ease: "power4.inOut",
    });
    tl.fromTo(
      ".mm-head",
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      "-=0.3"
    );
    tl.fromTo(
      ".mm-link",
      { y: 55, opacity: 0, rotateX: -35 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.045,
      },
      "-=0.25"
    );
    tl.fromTo(
      ".mm-foot",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      "-=0.25"
    );
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    hamburger.setAttribute("aria-expanded", "false");

    gsap.to(mobileMenu, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.6,
      ease: "power4.inOut",
      onComplete: () => {
        gsap.set(mobileMenu, { visibility: "hidden" });
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menu-open");
        if (lenis) lenis.start();
      },
    });
  }

  if (hamburger) hamburger.addEventListener("click", openMenu);
  if (mmClose) mmClose.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ===================== SMOOTH ANCHOR LINKS (LENIS) ===================== */
  document.querySelectorAll("[data-scroll-to]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-scroll-to");
      if (menuOpen) {
        closeMenu();
        setTimeout(() => scrollToTarget(target), 480);
      } else {
        scrollToTarget(target);
      }
    });
  });

  const backTop = document.getElementById("backTop");
  if (backTop) backTop.addEventListener("click", () => scrollToTarget(0));

  /* ===================== ACTIVE NAV LINK ===================== */
  const sectionIds = ["home", "services", "process", "industries", "team", "numbers", "work", "production", "testimonials", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navLinks = document.querySelectorAll("[data-scroll-to]");
  const linkById = {};
  navLinks.forEach((link) => {
    const id = link.getAttribute("data-scroll-to").replace("#", "");
    if (id) linkById[id] = link;
  });

  function setActiveNav(id) {
    navLinks.forEach((link) => link.classList.remove("is-active"));
    if (linkById[id]) linkById[id].classList.add("is-active");
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNav(link.getAttribute("data-scroll-to").replace("#", ""));
    });
  });

  function updateActiveNav() {
    if (!sectionIds.length) return;
    if (window.scrollY < 90) {
      setActiveNav("home");
      return;
    }
    const probe = window.scrollY + window.innerHeight * 0.42;
    let current = sectionIds[0].id;
    for (const sec of sectionIds) {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      if (top <= probe) current = sec.id;
    }
    setActiveNav(current);
  }

  updateActiveNav();

  /* ===================== SECTION 2 — HERO (CINEMATIC LETTERBOX) ===================== */
  const cmHero = document.querySelector(".cm-hero");
  const cmTitle = document.querySelector(".cm-title");
  const cmBarTop = document.querySelector(".cm-bar-top");
  const cmBarBottom = document.querySelector(".cm-bar-bottom");
  const cmBars = gsap.utils.toArray(".cm-bar");
  const barH = cmBarTop ? cmBarTop.offsetHeight : 0;
  const cmChars = cmTitle ? splitChars(cmTitle, [27, 41]) : [];

  if (prefersReduced) {
    gsap.set(".cm-grain", { opacity: 0.05 });
  } else {
    /* close the letterbox to a slit — bars meet at the centre */
    if (cmBarTop && cmBarBottom && cmHero) {
      const heroH = cmHero.offsetHeight;
      const mid = heroH / 2;
      gsap.set(cmBarTop, { y: mid - barH });
      gsap.set(cmBarBottom, { y: -(heroH - barH - mid) });
    }

    gsap.set(".cm-img", { scale: 1.12, filter: "blur(12px)", opacity: 0.92 });
    gsap.set(".cm-grade", { opacity: 0 });
    gsap.set(".cm-grain", { opacity: 0 });
    gsap.set(".cm-leak", { yPercent: -260, opacity: 0 });
    gsap.set(cmChars, { y: "3em", autoAlpha: 0, filter: "blur(10px)", transformOrigin: "50% 100%" });
    gsap.set(".cm-eyebrow, .cm-sub, .cm-actions > *", { y: 26, autoAlpha: 0 });
    gsap.set(".cm-strip, .cm-meta", { y: 12, autoAlpha: 0 });

    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: "power3.out" } });

    /* cinematic push-in + focus pull */
    tl.fromTo(
      ".cm-img",
      { scale: 1.12, filter: "blur(12px)", opacity: 0.92 },
      {
        scale: 1.045,
        filter: "blur(0px)",
        opacity: 1,
        duration: 2.4,
        ease: "power3.inOut",
        onComplete: () => gsap.set(".cm-img", { clearProps: "transform,filter,opacity" }),
      },
      0
    );

    /* grade + film grain settle */
    tl.to(".cm-grade", { opacity: 1, duration: 1.2 }, 0.1);
    tl.to(".cm-grain", { opacity: 0.06, duration: 1.2 }, 0.6);

    /* letterbox opens — top bar travels fully off-screen, bottom settles at base */
    tl.to(cmBarTop, { y: -(barH + 1), duration: 0.95, ease: "power4.inOut" }, 0.25);
    tl.to(cmBarBottom, { y: 0, duration: 0.95, ease: "power4.inOut" }, 0.38);

    /* light leak sweeps down through the frame */
    tl.fromTo(
      ".cm-leak",
      { yPercent: -260, opacity: 0 },
      { yPercent: 150, opacity: 0.9, duration: 1.1, ease: "power2.inOut" },
      0.55
    );
    tl.to(".cm-leak", { opacity: 0, duration: 0.6 }, 1.8);

    /* eyebrow */
    tl.fromTo(".cm-eyebrow", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 1.05);

    /* title chars rise out of the bottom edge */
    tl.to(
      cmChars,
      { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.95, ease: "power4.out", stagger: 0.028 },
      1.18
    );

    tl.fromTo(".cm-sub", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, "-=0.6");
    tl.fromTo(
      ".cm-actions > *",
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.09 },
      "-=0.55"
    );

    /* bars' content settles into place */
    tl.fromTo(
      ".cm-strip, .cm-meta",
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06 },
      1.15
    );

    const initHeroScrubs = () => {
      cmBars.forEach((bar) => {
        gsap.to(bar, {
          height: "44svh",
          ease: "none",
          scrollTrigger: { trigger: ".cm-hero", start: "top top", end: "bottom top", scrub: 1.2 },
        });
      });
      gsap.to(".cm-stage", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".cm-hero", start: "top top", end: "bottom top", scrub: 1.2 },
      });
      gsap.to(".cm-grade", {
        opacity: 0.6,
        ease: "none",
        scrollTrigger: { trigger: ".cm-hero", start: "top top", end: "bottom top", scrub: 1.1 },
      });
      gsap.to(".cm-title", {
        yPercent: -24,
        autoAlpha: 0.25,
        ease: "none",
        scrollTrigger: { trigger: ".cm-hero", start: "top top", end: "bottom top", scrub: 1 },
      });
      gsap.to(".cm-eyebrow, .cm-sub, .cm-actions", {
        yPercent: 20,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: ".cm-hero", start: "top top", end: "bottom top", scrub: 1 },
      });
    };
    tl.eventCallback("onComplete", initHeroScrubs);

    /* pointer parallax — the stage drifts, the numeral drifts opposite */
    if (cmHero && window.matchMedia("(pointer: fine)").matches) {
      const stageEl = document.querySelector(".cm-stage");
      const stX = gsap.quickTo(stageEl, "x", { duration: 1, ease: "power2.out" });
      const stY = gsap.quickTo(stageEl, "y", { duration: 1, ease: "power2.out" });
      cmHero.addEventListener("pointermove", (e) => {
        const r = cmHero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        stX(px * 22);
        stY(py * 16);
      });
      cmHero.addEventListener("pointerleave", () => {
        stX(0);
        stY(0);
      });
    }
  }

  /* ===================== SECTION 3 — CAPABILITIES ===================== */
  gsap.fromTo(
    ".cap-card",
    { y: 70, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      onComplete: () => gsap.set(".cap-card", { clearProps: "transform,opacity" }),
      scrollTrigger: { trigger: ".cap-grid", start: "top 76%" },
    }
  );

  document.querySelectorAll(".cap-card .cap-media img").forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.3 },
      {
        scale: 1,
        duration: 1.3,
        ease: "power3.out",
        onComplete: () => gsap.set(img, { clearProps: "transform" }),
        scrollTrigger: { trigger: img, start: "top 88%" },
      }
    );
  });

  /* ===================== SECTION 4 — PROCESS ===================== */
  gsap.fromTo(
    ".pr-rail::before",
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".pr-track",
        start: "top 70%",
        end: "bottom 60%",
        scrub: 0.8,
      },
    }
  );

  document.querySelectorAll(".pr-step").forEach((step, i) => {
    gsap.fromTo(
      step,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power3.out",
        delay: (i % 5) * 0.08,
        scrollTrigger: { trigger: step, start: "top 82%" },
      }
    );

    const photo = step.querySelector(".pr-photo");
    if (photo) {
      gsap.fromTo(
        photo,
        { scale: 0.5, rotate: -6 },
        {
          scale: 1,
          rotate: 0,
          duration: 0.95,
          ease: "back.out(1.8)",
          onComplete: () => gsap.set(photo, { clearProps: "transform" }),
          scrollTrigger: { trigger: step, start: "top 80%" },
        }
      );
    }
  });

  /* ===================== SECTION 5 — INDUSTRIES (MARQUEE) ===================== */
  const indMarquee = document.querySelector("[data-marquee]");
  if (indMarquee) {
    gsap.fromTo(
      indMarquee.querySelectorAll(".ind-chip"),
      { y: 46, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.05,
        onComplete: () => gsap.set(indMarquee.querySelectorAll(".ind-chip"), { clearProps: "transform,opacity" }),
        scrollTrigger: { trigger: indMarquee, start: "top 82%" },
      }
    );
  }

  /* ===================== SECTION 6 — LEADERSHIP ===================== */
  const ldCards = gsap.utils.toArray("[data-ld-card]");
  if (ldCards.length) {
    ldCards.forEach((card) => {
      const toggle = card.querySelector("[data-ld-toggle]");
      card.querySelectorAll(".ld-meter b").forEach((b) => {
        b.style.setProperty("--lv", (b.dataset.level || 100) + "%");
      });

      const setOpen = (open) => {
        if (open && !card.classList.contains("is-open")) {
          ldCards.forEach((c) => {
            if (c !== card && c.classList.contains("is-open")) {
              c.classList.remove("is-open");
              const t = c.querySelector("[data-ld-toggle]");
              if (t) t.setAttribute("aria-expanded", "false");
            }
          });
          card.classList.add("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "true");
        } else if (!open && card.classList.contains("is-open")) {
          card.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      };

      if (toggle) {
        toggle.addEventListener("click", () => setOpen(!card.classList.contains("is-open")));
        toggle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!card.classList.contains("is-open"));
          }
        });
      }
    });

    gsap.fromTo(
      ".ld-deck",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        onComplete: () => gsap.set(".ld-deck", { clearProps: "transform,opacity" }),
        scrollTrigger: { trigger: ".ld-deck", start: "top 82%" },
      }
    );
  }

  /* ===================== SECTION 7 — NUMBERS ===================== */
  gsap.fromTo(
    ".num-bg",
    { scale: 1.25, yPercent: -8 },
    {
      scale: 1.05,
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".num-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.1,
      },
    }
  );

  gsap.fromTo(
    ".num-cell",
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".num-grid", start: "top 80%" },
    }
  );

  const statNums = document.querySelectorAll("[data-count]");

  statNums.forEach((el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString() + suffix;
          },
          onComplete: () => {
            el.dataset.final = target.toLocaleString() + suffix;
          },
        });
      },
    });
  });

  /* ===================== SECTION 8 — FEATURED WORK ===================== */
  gsap.to(".fw-rule", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".fw-list",
      start: "top 82%",
      end: "bottom 55%",
      scrub: 0.8,
    },
  });

  document.querySelectorAll("[data-fw]").forEach((item) => {
    const media = item.querySelector(".fw-media");
    const num = item.querySelector(".fw-num");

    if (media) {
      gsap.fromTo(
        media,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0% 0)",
          duration: 1.05,
          ease: "power4.inOut",
          scrollTrigger: { trigger: item, start: "top 82%" },
        }
      );
    }

    const img = media ? media.querySelector("img") : null;
    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.3 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          onComplete: () => gsap.set(img, { clearProps: "transform" }),
          scrollTrigger: { trigger: item, start: "top 82%" },
        }
      );
    }

    gsap.fromTo(
      item.querySelectorAll(".fw-tag, .fw-body h3, .fw-body p, .fw-foot"),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.08,
        onComplete: () =>
          gsap.set(item.querySelectorAll(".fw-tag, .fw-body h3, .fw-body p, .fw-foot"), {
            clearProps: "transform,opacity",
          }),
        scrollTrigger: { trigger: item, start: "top 82%" },
      }
    );

    if (num) {
      gsap.fromTo(
        num,
        { opacity: 0, scale: 1.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 82%" },
        }
      );
    }
  });

  /* ===================== SECTION 9 — PRODUCTION ===================== */
  /* live floor clock — JS-driven timecode */
  const pfClockEl = document.getElementById("pfClock");
  if (pfClockEl) {
    let tcSec = 14;
    const pad2 = (n) => String(n).padStart(2, "0");
    setInterval(() => {
      tcSec += 1;
      pfClockEl.textContent = "00:" + pad2(Math.floor(tcSec / 60)) + ":" + pad2(tcSec % 60);
    }, 1000);
  }

  document.querySelectorAll("[data-pf]").forEach((sig, i) => {
    gsap.fromTo(
      sig,
      { x: -70, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power3.out",
        delay: i * 0.08,
        scrollTrigger: { trigger: ".pf-signals", start: "top 78%" },
      }
    );
  });

  const pfCam = document.querySelector("[data-pf-cam]");
  if (pfCam) {
    gsap.fromTo(
      pfCam,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.15,
        ease: "power4.inOut",
        scrollTrigger: { trigger: ".pf-layout", start: "top 76%" },
      }
    );

    const camImg = pfCam.querySelector("img");
    if (camImg) {
      gsap.fromTo(
        camImg,
        { scale: 1.25 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          onComplete: () => gsap.set(camImg, { clearProps: "transform" }),
          scrollTrigger: { trigger: ".pf-layout", start: "top 76%" },
        }
      );
    }
  }

  /* ===================== SECTION 10 — CLIENT NOTES ===================== */
  document.querySelectorAll("[data-testi]").forEach((row) => {
    gsap.fromTo(
      row.querySelector("blockquote"),
      { y: 44, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 84%" },
      }
    );

    gsap.fromTo(
      row.querySelector(".testi-mark"),
      { scale: 0, rotate: -14 },
      {
        scale: 1,
        rotate: 0,
        duration: 0.8,
        ease: "back.out(2)",
        scrollTrigger: { trigger: row, start: "top 84%" },
      }
    );

    const who = row.querySelector(".testi-who");
    gsap.fromTo(
      who,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.12,
        scrollTrigger: { trigger: row, start: "top 84%" },
      }
    );

    const whoImg = who ? who.querySelector("img") : null;
    if (whoImg) {
      gsap.fromTo(
        whoImg,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.7,
          ease: "back.out(2)",
          delay: 0.2,
          scrollTrigger: { trigger: row, start: "top 84%" },
        }
      );
    }
  });

  /* ===================== SECTION 11 — CONTACT / CTA ===================== */
  gsap.fromTo(
    ".scta-bg img",
    { scale: 1.22, yPercent: -8 },
    {
      scale: 1.08,
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".scta-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.1,
      },
    }
  );

  gsap.fromTo(
    ".scta-mini-item",
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".scta-mini", start: "top 88%" },
    }
  );

  /* magnetic buttons */
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    const strength = 0.35;
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      gsap.to(btn, {
        x: mx * strength,
        y: my * strength,
        duration: 0.4,
        ease: "power3.out",
      });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)",
      });
    });
  });

  

  /* ===================== SECTION 12 — FOOTER ===================== */
  document.querySelectorAll("[data-footer-col]").forEach((col, i) => {
    gsap.fromTo(
      col,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power3.out",
        delay: i * 0.1,
        scrollTrigger: { trigger: ".footer-grid", start: "top 85%" },
      }
    );
  });

  /* newsletter */
  const newsForm = document.getElementById("newsForm");
  const newsEmail = document.getElementById("newsEmail");
  const newsNote = document.getElementById("newsNote");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showNewsNote(msg, isError) {
    if (!newsNote) return;
    newsNote.innerHTML = isError
      ? '<i class="fa-solid fa-circle-exclamation"></i>' + msg
      : '<i class="fa-solid fa-circle-check"></i> ' + msg;
    newsNote.classList.add("show");
    if (isError) newsNote.classList.add("is-error");
    else newsNote.classList.remove("is-error");
    clearTimeout(showNewsNote._t);
    showNewsNote._t = setTimeout(() => newsNote.classList.remove("show"), 4000);
  }

  if (newsForm) {
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = (newsEmail ? newsEmail.value : "").trim();
      if (!value) {
        newsForm.classList.add("is-invalid");
        showNewsNote("Please enter your work email.", true);
        if (newsEmail) newsEmail.focus();
        return;
      }
      if (!emailRe.test(value)) {
        newsForm.classList.add("is-invalid");
        showNewsNote("That doesn&rsquo;t look like a valid email address.", true);
        if (newsEmail) newsEmail.focus();
        return;
      }
      newsForm.classList.remove("is-invalid");
      window.location.href = "404.html";
    });

    if (newsEmail) {
      newsEmail.addEventListener("input", () => {
        newsForm.classList.remove("is-invalid");
      });
    }
  }

  /* ===================== REFRESH & RESIZE ===================== */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      gsap.globalTimeline.pause();
    } else {
      gsap.globalTimeline.resume();
    }
  });
})();
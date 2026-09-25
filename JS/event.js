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

  function splitChars(el) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent;
    el.textContent = "";
    const chars = [];
    text.split("").forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--ci", i);
      s.textContent = c === " " ? " " : c;
      el.appendChild(s);
      chars.push(s);
    });
    el.dataset.splitDone = "1";
    return chars;
  }

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
  const sectionIds = ["home", "season", "diary", "venues", "experience", "culinary", "reel", "press", "gauges", "pass"]
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

  /* ===================== MAGNETIC BUTTONS ===================== */
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
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });

  /* ===================== COUNT-UP ===================== */
  function animateCounts(scope) {
    const els = scope
      ? scope.querySelectorAll("[data-count]")
      : document.querySelectorAll("[data-count]");
    els.forEach((el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = Math.round(obj.v) + suffix;
        },
        onComplete: () => {
          el.textContent = target + suffix;
        },
      });
    });
  }

  if (prefersReduced) {
    document.querySelectorAll("[data-count]").forEach((el) => {
      el.textContent = parseInt(el.getAttribute("data-count"), 10) + (el.getAttribute("data-suffix") || "");
    });
    document.querySelectorAll("[data-ggdial]").forEach((el) => {
      el.style.setProperty("--p", el.getAttribute("data-p"));
    });
  } else {
    animateCounts(null);
  }

/* ===================== SECTION 2 - HERO ===================== */
  const ehTitle = document.querySelector(".eh-title");
  const ehDeck = document.getElementById("ehDeck");
const ehPosts = ehDeck ? Array.from(ehDeck.querySelectorAll(".eh-post")) : [];

  if (prefersReduced) {
    ehPosts.forEach((p, i) => {
      const r = [-16, -8, 2, 10, 18][i] || 0;
      gsap.set(p, { rotation: r });
    });
  } else if (ehPosts.length) {
    const targets = [-16, -8, 2, 10, 18];
    const spreadX = [-46, -22, 0, 22, 46];

    gsap.set(ehPosts, { transformOrigin: "50% 86%" });
    gsap.fromTo(
      ehPosts,
      { rotationX: -85, scale: 0.62, y: 90, autoAlpha: 0 },
      {
        rotationX: 0,
        scale: 1,
        y: 0,
        autoAlpha: 1,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.25,
      }
    );
    gsap.to(ehPosts, {
      rotation: (i) => targets[i],
      duration: 1.3,
      ease: "power2.inOut",
      stagger: 0.08,
      delay: 1.15,
    });

    const chars = splitChars(ehTitle);
    if (chars.length) {
      gsap.set(chars, { y: "1.15em", autoAlpha: 0, filter: "blur(10px)" });
      gsap.to(chars, {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.03,
        delay: 0.35,
      });
    }

/* scroll: the fan relaxes and drifts apart while the copy lifts */
    gsap.to(ehPosts, {
      rotation: 0,
      x: (i) => spreadX[i],
      ease: "none",
      scrollTrigger: {
        trigger: ".eh-hero",
        start: "top top",
        end: "bottom top",
scrub: 1.3,
      },
    });
    gsap.to(".eh-deck", {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: ".eh-hero", start: "top top", end: "bottom top", scrub: 1.2 },
    });
    gsap.to(".eh-copy", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".eh-hero", start: "top top", end: "bottom top", scrub: 1.2 },
    });
}

  /* ===================== SECTION 3 - THE SEASON ===================== */
  const snPlates = gsap.utils.toArray(".sn-plate");

  if (!prefersReduced && snPlates.length) {
    snPlates.forEach((plate, i) => {
      const from = [6, -8, 5][i % 3] || 0;
      gsap.fromTo(
        plate,
        { rotation: from, yPercent: 14, scale: 0.97 },
        {
          rotation: 0,
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: plate,
            start: "top 92%",
            end: "top 38%",
            scrub: 1.1,
          },
        }
      );
const img = plate.querySelector(".sn-frame img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.14 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: plate, start: "top 90%", end: "bottom 55%", scrub: 1.1 },
          }
        );
      }
    });
  }
/* ===================== SECTION 4 - BACKSTAGE DIARY ===================== */
  const dyRailFill = document.getElementById("dyRailFill");

  if (!prefersReduced) {
    if (dyRailFill) {
      gsap.fromTo(
        dyRailFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#dyItems",
            start: "top 80%",
            end: "bottom 55%",
            scrub: 1,
          },
        }
      );
    }

    gsap.utils.toArray("[data-dyitem]").forEach((item, i) => {
      gsap.fromTo(
        item,
        { x: 70, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        }
      );
      const thumb = item.querySelector(".dy-thumb img");
      if (thumb) {
        gsap.fromTo(
          thumb,
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 1 },
          }
        );
      }
    });

    gsap.fromTo(
      ".dy-vis",
      { yPercent: 6 },
      {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: ".dy-section", start: "top bottom", end: "bottom top", scrub: 1.2 },
      }
    );
  }

  /* ===================== SECTION 5 - VENUE ROTOSCOPE ===================== */
  const vnStage = document.getElementById("vnStage");
  const vnLayers = vnStage ? Array.from(vnStage.querySelectorAll("[data-vnlayer]")) : [];
  const vnVenue = document.getElementById("vnVenue");
  const vnCity = document.getElementById("vnCity");
  const vnCap = document.getElementById("vnCap");
  const vnCur = document.getElementById("vnCur");

  let vnIdx = 0;

  function setVenue(idx, animate) {
    const layer = vnLayers[idx];
    if (!layer) return;
    vnLayers.forEach((l, i) => l.classList.toggle("is-live", i === idx));
    vnCur.textContent = String(idx + 1).padStart(2, "0");
    if (animate && !prefersReduced) {
      gsap.fromTo(
        ".vn-readout",
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }
      );
    }
    if (vnVenue) vnVenue.textContent = layer.dataset.venue || "";
    if (vnCity) vnCity.textContent = layer.dataset.city || "";
    if (vnCap) vnCap.textContent = layer.dataset.cap || "";
  }

  if (!prefersReduced && vnLayers.length > 1) {
    vnLayers.forEach((layer) => {
      const img = layer.querySelector("img");
      if (!img) return;
      gsap.fromTo(
        img,
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".vn-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        }
      );
    });

    ScrollTrigger.create({
      trigger: ".vn-section",
      start: "top 2%",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        const next = Math.min(vnLayers.length - 1, Math.max(0, Math.round(p * (vnLayers.length - 1))));
        if (next !== vnIdx) {
          vnIdx = next;
          setVenue(vnIdx, true);
        }
      },
    });

    gsap.to(".vn-ring", {
      rotation: 360,
      ease: "none",
      scrollTrigger: { trigger: ".vn-section", start: "top bottom", end: "bottom top", scrub: 1.2 },
    });
  }

  /* ===================== SECTION 6 - THE EXPERIENCE ===================== */
  const xpStage = document.getElementById("xpStage");

  if (!prefersReduced) {
    const xpImg = xpStage ? xpStage.querySelector("img") : null;
    if (xpImg) {
      gsap.fromTo(
        xpImg,
        { scale: 1.16, yPercent: 3 },
        {
          scale: 1.04,
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: ".xp-section", start: "top bottom", end: "bottom top", scrub: 1.2 },
        }
      );
    }

    gsap.fromTo(
      ".xp-hot",
      { autoAlpha: 0, y: 26, scale: 0.4 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: xpHotFirst(), start: "top 82%", toggleActions: "play none none reverse" },
      }
    );
  }

  function xpHotFirst() {
    const hot = document.querySelector(".xp-hot");
    return hot || ".xp-stage";
  }

/* ===================== SECTION 7 - CULINARY CRAFT ===================== */
  if (!prefersReduced) {
    gsap.fromTo(
      ".cu-img-a",
      { yPercent: 8 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: ".cu-frame", start: "top bottom", end: "bottom top", scrub: 1.2 },
      }
    );
    gsap.fromTo(
      ".cu-img-b",
      { yPercent: 10 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: ".cu-frame", start: "top bottom", end: "bottom top", scrub: 1.4 },
      }
    );

    gsap.utils.toArray("[data-curowe]").forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: 44, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

document.querySelectorAll("[data-curowe]").forEach((row) => {
    const toggle = () => {
      const isOpen = row.classList.toggle("is-open");
      row.setAttribute("aria-expanded", String(isOpen));
      document.querySelectorAll("[data-curowe]").forEach((r) => {
        if (r !== row) {
          r.classList.remove("is-open");
          r.setAttribute("aria-expanded", "false");
        }
      });
    };
    row.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      toggle();
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ===================== SECTION 8 - AFTERMOVIE REEL ===================== */
  const rlFrames = document.getElementById("rlFrames");
  const rlFill = document.getElementById("rlFill");
  const rlHead = document.getElementById("rlHead");
  const rlTime = document.getElementById("rlTime");
  const totalSec = 3 * 60 + 24;

  function fmtTime(sec) {
    return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
  }

  function setReel(p) {
    const clamped = gsap.utils.clamp(0, 1, p);
    const canScroll = rlFrames ? rlFrames.scrollWidth - window.innerWidth : 0;
    if (rlFrames && canScroll > 0) {
      rlFrames.style.transform = "translate3d(" + -clamped * canScroll + "px,0,0)";
    }
    if (rlFill) rlFill.style.width = clamped * 100 + "%";
    if (rlHead) rlHead.style.left = clamped * 100 + "%";
    if (rlTime) rlTime.textContent = fmtTime(clamped * totalSec);
    const frames = rlFrames ? Array.from(rlFrames.querySelectorAll("[data-rlframe]")) : [];
    const live = Math.floor(clamped * frames.length);
    frames.forEach((f, i) => f.classList.toggle("is-live", i < live));
  }

  if (!prefersReduced && rlFrames) {
    ScrollTrigger.create({
      trigger: ".rl-stage",
      start: "top 75%",
      end: "bottom 55%",
      scrub: 0.5,
      onUpdate: (self) => setReel(self.progress),
      once: false,
    });
  } else {
    setReel(0);
  }

  /* ===================== SECTION 9 - PRESS & INTERVIEWS ===================== */
  if (!prefersReduced) {
    gsap.utils.toArray("[data-psrow]").forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: i % 2 === 0 ? -40 : 40, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
      const img = row.querySelector(".ps-img img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 1 },
          }
        );
      }
    });
  }

  /* ===================== SECTION 10 - THE GAUGES ===================== */
  if (!prefersReduced) {
    gsap.utils.toArray("[data-ggdial]").forEach((dial, i) => {
      const targetP = parseFloat(dial.getAttribute("data-p")) || 0;
      const proxy = { p: 0 };

      gsap.fromTo(
        dial,
        { y: 60, autoAlpha: 0, scale: 0.92 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: dial,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.to(proxy, {
        p: targetP,
        duration: 1.6,
        ease: "power2.out",
        delay: 0.15 * i,
        scrollTrigger: { trigger: dial, start: "top 85%", once: true },
        onUpdate: () => {
          dial.style.setProperty("--p", proxy.p.toFixed(1));
        },
      });
    });
  }

/* ===================== SECTION 11 - REQUEST A PASS ===================== */
  const pxForm = document.getElementById("pxForm");
  const pxEmail = document.getElementById("pxEmail");
  const pxShow = document.getElementById("pxShow");
  const pxEmailWrap = document.getElementById("pxEmailWrap");
  const pxErrEmail = document.getElementById("pxErrEmail");
  const pxErrShow = document.getElementById("pxErrShow");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function pxSetField(wrap, err, invalid) {
    if (wrap) wrap.classList.toggle("is-invalid", invalid);
    if (err) err.classList.toggle("show", invalid);
    return invalid;
  }

  function pxClearField(wrap, err) {
    if (wrap) wrap.classList.remove("is-invalid");
    if (err) err.classList.remove("show");
  }

  function pxShake(el) {
    if (!el) return;
    gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.45, ease: "elastic.out(1, 0.35)", clearProps: "x" });
  }

  if (!prefersReduced) {
    gsap.fromTo(
      ".px-perks li",
      { x: -30, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".px-perks", start: "top 90%", toggleActions: "play none none reverse" },
      }
    );

    gsap.fromTo(
      ".px-ticket",
      { y: 80, autoAlpha: 0, rotateX: 12 },
      {
        y: 0,
        autoAlpha: 1,
        rotateX: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".px-ticket", start: "top 85%", toggleActions: "play none none reverse" },
      }
    );
  }

if (pxForm) {
    pxForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const badEmail = pxSetField(pxEmailWrap, pxErrEmail, !emailRe.test(pxEmail.value.trim()));
      const badShow = pxSetField(pxShow, pxErrShow, !pxShow.value);

      if (badEmail || badShow) {
        if (badEmail) {
          pxShake(pxEmailWrap);
          pxEmail.focus();
        } else if (badShow) {
          pxShow.focus();
        }
        return;
      }

      gsap.fromTo(pxEmail, { y: -6 }, { y: 0, duration: 0.5, ease: "power3.out" });
      const send = document.getElementById("pxSend");
      if (send) gsap.fromTo(send, { scale: 0.98 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.4)" });
      window.location.href = "404.html";
    });
  }

  if (pxEmail) {
    pxEmail.addEventListener("input", () => pxClearField(pxEmailWrap, pxErrEmail));
    pxEmail.addEventListener("blur", () => pxSetField(pxEmailWrap, pxErrEmail, !emailRe.test(pxEmail.value.trim())));
  }
  if (pxShow) {
    pxShow.addEventListener("change", () => pxClearField(pxShow, pxErrShow));
    pxShow.addEventListener("blur", () => pxSetField(pxShow, pxErrShow, !pxShow.value));
  }

  /* ===================== FOOTER ===================== */
  if (!prefersReduced) {
    gsap.utils.toArray("[data-footer-col]").forEach((col, i) => {
      gsap.fromTo(
        col,
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: ".footer-grid", start: "top 90%", toggleActions: "play none none reverse" },
        }
      );
    });
  }

  /* ===================== NEWSLETTER ===================== */
  const newsForm = document.getElementById("newsForm");
  const newsEmail = document.getElementById("newsEmail");
  const newsNote = document.getElementById("newsNote");
  let newsTimer = null;

function showNewsNote(msg, isError) {
    if (!newsNote) return;
    newsNote.innerHTML = String(msg);
    newsNote.classList.add("show");
    if (isError) newsNote.classList.add("is-error");
    else newsNote.classList.remove("is-error");
    clearTimeout(newsTimer);
    newsTimer = setTimeout(() => newsNote.classList.remove("show"), 4000);
  }

  if (newsForm) {
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = newsEmail.value.trim();
      if (!emailRe.test(val)) {
        showNewsNote("Please enter a valid work email.", false);
        gsap.fromTo(newsEmail, { x: -8 }, { x: 0, duration: 0.45, ease: "elastic.out(1, 0.35)", clearProps: "x" });
} else {
        window.location.href = "404.html";
      }
    });
  }

  /* ===================== RESIZE / VISIBILITY ===================== */
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      ScrollTrigger.getAll().forEach((st) => st.disable());
    } else {
      ScrollTrigger.getAll().forEach((st) => st.enable());
      ScrollTrigger.refresh();
    }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* expose for debugging */
  window.__events = { lenis, ScrollTrigger };
})();
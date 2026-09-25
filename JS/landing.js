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

  function buildSlice(el) {
    const src = el.getAttribute("data-slice");
    const count = parseInt(el.getAttribute("data-slice-count") || "5", 10);
    el.style.setProperty("--count", count);
    for (let i = 0; i < count; i++) {
      const strip = document.createElement("span");
      strip.className = "slice-strip";
      strip.style.setProperty("--i", i);
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      img.style.left = `calc(${-i} * 100%)`;
      strip.appendChild(img);
      el.appendChild(strip);
    }
  }

  document.querySelectorAll("[data-slice]").forEach(buildSlice);

  /* ===================== GENERIC PARALLAX ===================== */
  function initParallax() {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      if (el.closest(".stats") || el.closest(".cta") || el.classList.contains("faq-aside")) return;
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      gsap.fromTo(
        el,
        { y: window.innerHeight * speed },
        {
          y: -window.innerHeight * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        }
      );
    });
  }
  initParallax();

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
      window.location.reload();
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
  const sectionIds = ["home", "services", "events", "about", "contact"]
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

  /* ===================== SECTION 2 — HERO (FULL-WIDTH) ===================== */
  const heroWords = splitWords(document.querySelector(".hero-title"));

  const heroTl = gsap.timeline({ delay: 0.25 });
  heroTl.fromTo(
    ".hero-bg",
    { opacity: 0 },
    { opacity: 1, duration: 0.9, ease: "power2.out" }
  );
  heroTl.fromTo(
    ".hero-bg-img",
    { scale: 1.28 },
    { scale: 1.12, duration: 2.6, ease: "power3.out" },
    "-=0.6"
  );
  heroTl.fromTo(
    ".hero .eyebrow",
    { x: -50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
    "-=1.9"
  );
  heroTl.to(
    heroWords,
    {
      y: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.07,
    },
    "-=0.5"
  );
  heroTl.fromTo(
    ".hero-sub",
    { y: 35, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
    "-=0.55"
  );
  heroTl.fromTo(
    ".hero-actions .btn",
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.65,
      ease: "power3.out",
      stagger: 0.12,
      onComplete: () => gsap.set(".hero-actions .btn", { clearProps: "transform,opacity" }),
    },
    "-=0.4"
  );
  heroTl.fromTo(
    ".hero-stat",
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 },
    "-=0.35"
  );
  heroTl.fromTo(
    ".hero-accent-b",
    { scale: 0, rotate: 10 },
    {
      scale: 1,
      rotate: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      onComplete: () => gsap.set(".hero-accent-b", { clearProps: "transform" }),
    },
    "-=0.55"
  );
  heroTl.fromTo(
    ".hero-marquee",
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
    "-=0.5"
  );

  /* hero scroll — content drifts up, marquee stays pinned bottom */
  gsap.to(".hero-content", {
    y: -70,
    opacity: 0.25,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".hero-grid-lines span", {
    opacity: 0.25,
    duration: 2.4,
    ease: "sine.inOut",
    stagger: { each: 0.4, yoyo: true, repeat: -1 },
  });

  if (!prefersReduced) {
    gsap.to("#heroMarquee", {
      xPercent: -50,
      duration: 24,
      ease: "none",
      repeat: -1,
    });
  }

  /* ===================== GENERIC SPLIT-WORDS TITLES ===================== */
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

  /* ===================== SECTION 3 — ABOUT ===================== */
  gsap.fromTo(
    ".about-img-main .slice-strip",
    { yPercent: (i) => (i % 2 === 0 ? 110 : -110) },
    {
      yPercent: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".about-img-main",
        start: "top 78%",
      },
    }
  );

  gsap.fromTo(
    ".about-img-sub",
    { x: 90, rotate: 6, opacity: 0 },
    {
      x: 0,
      rotate: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".about-visual", start: "top 70%" },
    }
  );

  gsap.fromTo(
    ".about-badge",
    { scale: 0, rotate: -30 },
    {
      scale: 1,
      rotate: 0,
      duration: 0.9,
      ease: "back.out(1.8)",
      scrollTrigger: { trigger: ".about-visual", start: "top 55%" },
    }
  );

  gsap.fromTo(
    ".about-list li",
    { x: -45, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".about-list", start: "top 82%" },
    }
  );

  const aboutTicker = document.getElementById("aboutTicker");
  if (aboutTicker) {
    gsap.to(aboutTicker, {
      x: () => -(aboutTicker.scrollWidth / 2),
      ease: "none",
      scrollTrigger: {
        trigger: ".about-ticker",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });
  }

  /* ===================== SECTION 4 — SERVICES SHOWCASE ===================== */
  gsap.fromTo(
    ".sv-item",
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.08,
      onComplete: () => gsap.set(".sv-item", { clearProps: "transform,opacity" }),
      scrollTrigger: { trigger: ".services-list", start: "top 72%" },
    }
  );

  gsap.fromTo(
    ".services-preview",
    { clipPath: "inset(0 0 100% 0)" },
    {
      clipPath: "inset(0 0 0% 0)",
      duration: 1.15,
      ease: "power4.inOut",
      scrollTrigger: { trigger: ".services-showcase", start: "top 68%" },
    }
  );

  /* preview swap on service hover */
  const svItems = document.querySelectorAll("[data-svc]");
  const svShot = document.querySelector(".sv-shot");
  const svCapTitle = document.querySelector(".sv-cap-title");

  svItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (item.classList.contains("is-active")) return;
      const img = item.getAttribute("data-img");

      if (svShot && img && img !== svShot.getAttribute("src")) {
        gsap.to(svShot, {
          yPercent: 10,
          opacity: 0,
          duration: 0.32,
          ease: "power2.in",
          onComplete: () => {
            svShot.src = img;
            gsap.fromTo(
              svShot,
              { yPercent: -10, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
            );
          },
        });
      }

      const h3 = item.querySelector("h3");
      if (svCapTitle && h3) svCapTitle.textContent = h3.textContent;

      svItems.forEach((s) => s.classList.remove("is-active"));
      item.classList.add("is-active");
    });
  });

  /* ===================== SECTION 5 — SELECTED WORK ===================== */
  document.querySelectorAll("[data-work]").forEach((item, i) => {
    gsap.fromTo(
      item,
      { clipPath: i % 2 === 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0% 0 0% 0)",
        duration: 1.05,
        ease: "power4.inOut",
        scrollTrigger: { trigger: item, start: "top 85%" },
      }
    );

    const img = item.querySelector(".wc-media img");
    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.35 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          onComplete: () => gsap.set(img, { clearProps: "transform" }),
          scrollTrigger: { trigger: item, start: "top 85%" },
        }
      );
    }
  });

  /* ===================== SECTION 6 — CATEGORIES (HORIZONTAL PIN) ===================== */
  const catTrack = document.getElementById("catTrack");
  const catPin = document.getElementById("catPin");
  let catTween = null;

  function setupCategories() {
    if (catTween) {
      catTween.scrollTrigger && catTween.scrollTrigger.kill();
      catTween.kill();
      catTween = null;
      gsap.set(catTrack, { clearProps: "transform" });
    }

    if (!catTrack || !catPin) return;
    if (window.innerWidth <= 900 || prefersReduced) return;

    catTween = gsap.to(catTrack, {
      x: () => -(catTrack.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: catPin,
        start: "top top",
        end: () => "+=" + (catTrack.scrollWidth - window.innerWidth),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }

  setupCategories();

  document.querySelectorAll(".cat-panel h3").forEach((h) => splitChars(h));

  /* ===================== SECTION 7 — STATS ===================== */
  gsap.fromTo(
    ".stats-bg",
    { scale: 1.25, y: -60 },
    {
      scale: 1,
      y: 60,
      ease: "none",
      scrollTrigger: {
        trigger: ".stats",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
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

  /* digit shuffle hover */
  document.querySelectorAll("[data-hover-roll]").forEach((el) => {
    const numEl = el.querySelector("[data-count]");
    let shuffling = false;
    let shuffleTimer = null;

    el.addEventListener("mouseenter", () => {
      if (!numEl || shuffling) return;
      const finalText = numEl.dataset.final || numEl.textContent;
      if (!finalText || finalText === "0") return;
      shuffling = true;
      let ticks = 0;
      const digits = finalText.replace(/[^\d]/g, "").length;

      clearInterval(shuffleTimer);
      shuffleTimer = setInterval(() => {
        ticks++;
        if (ticks > 9) {
          clearInterval(shuffleTimer);
          numEl.textContent = finalText;
          shuffling = false;
          return;
        }
        let rand = "";
        for (let d = 0; d < digits; d++) rand += Math.floor(Math.random() * 10);
        const suffix = finalText.replace(/[\d,]/g, "");
        numEl.textContent = Number(rand).toLocaleString() + suffix;
      }, 45);
    });
  });

  /* ===================== SECTION 8 — PROCESS TIMELINE ===================== */
  gsap.to("#timelineFill", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#timeline",
      start: "top 65%",
      end: "bottom 55%",
      scrub: 0.6,
    },
  });

  document.querySelectorAll("[data-step]").forEach((step, i) => {
    const fromX = step.classList.contains("tl-right") ? 90 : -90;
    gsap.fromTo(
      step,
      { x: fromX, opacity: 0, rotate: step.classList.contains("tl-right") ? 2 : -2 },
      {
        x: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 82%" },
      }
    );

    const dot = step.querySelector(".tl-dot");
    gsap.fromTo(
      dot,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.7,
        ease: "back.out(2)",
        scrollTrigger: { trigger: step, start: "top 80%" },
      }
    );
  });

  /* ===================== SECTION 9 — TEAM ===================== */
  document.querySelectorAll("[data-team-card]").forEach((card, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    gsap.fromTo(
      card,
      { x: 110 * dir, skewX: 6 * dir, opacity: 0 },
      {
        x: 0,
        skewX: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: (i % 4) * 0.07,
        scrollTrigger: { trigger: ".team-grid", start: "top 74%" },
      }
    );
  });

  /* ===================== SECTION 10 — TESTIMONIALS SLIDER ===================== */
  const tmSlides = Array.prototype.slice.call(document.querySelectorAll("[data-tm]"));
  const tmPrev = document.getElementById("tmPrev");
  const tmNext = document.getElementById("tmNext");
  const tmBar = document.getElementById("tmBar");
  const tmCur = document.getElementById("tmCur");
  const tmTotal = document.getElementById("tmTotal");
  const tmStage = document.querySelector(".tm-stage");
  const TM_DUR = 6;

  let tmIdx = 0;
  let tmTween = null;
  let tmHovering = false;

  if (tmTotal) tmTotal.textContent = String(tmSlides.length).padStart(2, "0");

  function tmGo(dir) {
    if (!tmSlides.length) return;
    tmIdx = (tmIdx + dir + tmSlides.length) % tmSlides.length;

    tmSlides.forEach((s) => s.classList.remove("is-active"));
    const cur = tmSlides[tmIdx];
    cur.classList.add("is-active");
    if (tmCur) tmCur.textContent = String(tmIdx + 1).padStart(2, "0");

    const photo = cur.querySelector(".tm-photo");
    const body = cur.querySelector(".tm-body");

    gsap.fromTo(
      photo,
      { x: dir > 0 ? 70 : -70, opacity: 0, rotate: dir > 0 ? 1.2 : -1.2 },
      { x: 0, opacity: 1, rotate: 0, duration: 0.75, ease: "power3.out" }
    );
    gsap.fromTo(
      body,
      { y: 34, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.1, ease: "power3.out" }
    );

    tmRestart();
  }

  function tmRestart() {
    if (tmTween) {
      tmTween.kill();
      tmTween = null;
    }
    if (!tmBar) return;
    gsap.set(tmBar, { scaleX: 0 });
    if (prefersReduced) return;
    tmTween = gsap.to(tmBar, {
      scaleX: 1,
      duration: TM_DUR,
      ease: "none",
      onComplete: () => {
        tmTween = null;
        if (!tmHovering) tmGo(1);
      },
    });
  }

  if (tmNext) tmNext.addEventListener("click", () => tmGo(1));
  if (tmPrev) tmPrev.addEventListener("click", () => tmGo(-1));

  if (tmStage && !prefersReduced) {
    tmStage.addEventListener("mouseenter", () => {
      tmHovering = true;
      if (tmTween) tmTween.pause();
    });
    tmStage.addEventListener("mouseleave", () => {
      tmHovering = false;
      if (tmTween) tmTween.play();
      else tmRestart();
    });
  }

  if (tmCur) tmCur.textContent = "01";
  tmRestart();

  /* ===================== SECTION 11 — ENGAGEMENT MODELS ===================== */
  const modelStrip = document.querySelector(".model-strip");
  const modelCols = Array.prototype.slice.call(document.querySelectorAll(".model-col[data-col]"));

  if (modelStrip) {
    gsap.fromTo(
      modelStrip,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.15,
        ease: "power4.inOut",
        scrollTrigger: { trigger: modelStrip, start: "top 78%" },
      }
    );

    gsap.fromTo(
      modelStrip.querySelector(".model-rule"),
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: modelStrip, start: "top 70%", end: "bottom 55%", scrub: 0.8 },
      }
    );

    gsap.fromTo(
      modelCols,
      { y: 70, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.12,
        onComplete: () => gsap.set(modelCols, { clearProps: "transform,opacity" }),
        scrollTrigger: { trigger: modelStrip, start: "top 74%" },
      }
    );

    modelCols.forEach((col) => {
      const idx = col.querySelector(".model-idx");
      if (idx) {
        gsap.fromTo(
          idx,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: col, start: "top 80%" },
          }
        );
      }
    });
  }

  /* ===================== SECTION 12 — FAQ ===================== */
  const faqImg = document.getElementById("faqImg");
  const faqImgTag = document.getElementById("faqImgTag");

  function swapFaqVisual(img) {
    if (!faqImg || !img || img === faqImg.getAttribute("src")) return;
    gsap.to(faqImg, {
      yPercent: 14,
      opacity: 0,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => {
        faqImg.src = img;
        gsap.fromTo(
          faqImg,
          { yPercent: -14, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      },
    });
  }

  function swapFaqTag(tag) {
    if (!faqImgTag || !tag) return;
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-tag";
    const label = document.createElement("span");
    label.textContent = " " + tag;
    faqImgTag.replaceChildren(icon, label);
    gsap.fromTo(
      faqImgTag,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }

  document.querySelectorAll("[data-faq]").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const ans = item.querySelector(".faq-a");

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll("[data-faq].is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-a").style.maxHeight = "0px";
          openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        ans.style.maxHeight = "0px";
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        ans.style.maxHeight = ans.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
        gsap.fromTo(
          ans.querySelector("p"),
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.1 }
        );
        swapFaqVisual(item.getAttribute("data-img"));
        swapFaqTag(item.getAttribute("data-tag"));
        setTimeout(() => ScrollTrigger.refresh(), 550);
      }
    });
  });

  gsap.fromTo(
    ".faq-item",
    { x: 70, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".faq-list", start: "top 76%" },
    }
  );

  gsap.fromTo(
    ".faq-visual",
    { clipPath: "inset(0 0 100% 0)" },
    {
      clipPath: "inset(0 0 0% 0)",
      duration: 1.1,
      ease: "power4.inOut",
      scrollTrigger: { trigger: ".faq-aside", start: "top 70%" },
    }
  );

  /* ===================== SECTION 13 — CTA ===================== */
  gsap.fromTo(
    ".cta-bg",
    { scale: 1.3 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".cta",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );

  gsap.fromTo(
    ".cta-mini-item",
    { y: 35, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".cta-mini", start: "top 88%" },
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

  /* confetti burst on CTA button */
  const confettiBtn = document.getElementById("ctaConfetti");
  const confettiColors = ["#c9a24b", "#e7c873", "#f4efe6", "#8a6d2f", "#ffffff"];

  function burstConfetti(originEl) {
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 22; i++) {
      const bit = document.createElement("span");
      bit.className = "confetti-bit";
      bit.style.background = confettiColors[i % confettiColors.length];
      bit.style.left = cx + "px";
      bit.style.top = cy + "px";
      document.body.appendChild(bit);

      const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.5;
      const dist = 70 + Math.random() * 110;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 40;

      gsap.fromTo(
        bit,
        { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
        {
          x: tx,
          y: ty + 90,
          rotate: Math.random() * 540 - 270,
          opacity: 0,
          scale: 0.4,
          duration: 1 + Math.random() * 0.6,
          ease: "power2.out",
          onComplete: () => bit.remove(),
        }
      );
    }
  }

  if (confettiBtn) {
    confettiBtn.addEventListener("mouseenter", () => burstConfetti(confettiBtn));
  }

  /* ===================== SECTION 14 — FOOTER ===================== */
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
      window.location.href = "HTML/404.html";
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
      setupCategories();
      ScrollTrigger.refresh();
    }, 250);
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    setupCategories();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      gsap.globalTimeline.pause();
    } else {
      gsap.globalTimeline.resume();
    }
  });
})();
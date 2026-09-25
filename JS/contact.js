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

  /* ===================== SCROLL PROGRESS + HEADER ===================== */
  const progressBar = document.getElementById("scrollProgress");

  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = p + "%";
  }

  const header = document.getElementById("siteHeader");

  function updateActiveNav() {
    const sectionIds = ["home", "channels", "people", "reply", "cities", "relay", "map", "letter", "board", "wave"]
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

  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    updateProgress();
    updateActiveNav();
  }

  document.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

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

  /* ===================== SECTION 2 — HERO (THE SWITCHBOARD) ===================== */
  const cctHero = document.querySelector(".ct-hero");

  if (!prefersReduced) {
    const heroTitle = document.getElementById("ctHeroTitle");
    const heroWords = heroTitle ? heroTitle.querySelectorAll(".ct-w > span") : [];

    if (heroTitle) {
      gsap.set(heroWords, { autoAlpha: 0, yPercent: 70, rotate: 5, transformOrigin: "50% 100%" });
    }

    gsap.set(".ct-hero-sub, .ct-hero-actions > *, .ct-hero-tape", { autoAlpha: 0, y: 26 });
    gsap.set(".ct-hero .section-eyebrow", { autoAlpha: 0, y: 18 });
gsap.set(".ct-rolo-tag", { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });

    tl.to(".ct-hero .section-eyebrow", { autoAlpha: 1, y: 0, duration: 0.4 }, 0)
      .to(
        heroWords,
        {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.12,
        },
        0.15
      )
      .to(
        ".ct-hero-sub, .ct-hero-actions > *, .ct-hero-tape",
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09 },
        0.65
      )
      .to(
        ".ct-rolo-tag",
        { autoAlpha: 1, duration: 0.6, stagger: 0.15 },
        1.1
      );

    /* rolodex desk-stack */
    const roloCards = gsap.utils.toArray(".ct-rolo-card");
    if (roloCards.length) {
      gsap.set(roloCards, { autoAlpha: 0, y: 60 });
      gsap.timeline({ delay: 0.35 })
        .to(roloCards, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: "power3.out",
        })
        .to(
          ".ct-rolo-tag",
          { autoAlpha: 1, duration: 0.6 },
          "-=0.3"
        );

      const rotations = [-7, -1, 5];
      const xo = [-26, 0, 22];
      const yo = [18, 4, -8];
      roloCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { x: xo[i], y: yo[i], rotation: rotations[i] },
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 1.3,
            delay: 0.9 + i * 0.12,
            ease: "elastic.out(1, 0.45)",
          }
        );
      });

      gsap.to(roloCards, {
        y: (i) => yo[i],
        x: (i) => xo[i],
        rotation: (i) => rotations[i],
        ease: "none",
        scrollTrigger: {
          trigger: cctHero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    if (cctHero) {
      gsap.to(".ct-hero-glow", {
        scale: 1.15,
        opacity: 0.7,
        ease: "none",
        scrollTrigger: { trigger: cctHero, start: "top top", end: "bottom top", scrub: 1 },
      });
    }
  }

  /* rolodex spin — click forwards the stack */
  const rolo = document.getElementById("ctRolo");
  const roloTag = document.getElementById("ctRoloTag");
  if (rolo) {
    let front = 2;
    const cards = gsap.utils.toArray(".ct-rolo-card");
    const tags = ["The desk", "The floor", "The room"];

    function settle() {
      cards.forEach((card, i) => {
        const d = (i - front + cards.length) % cards.length;
        gsap.to(card, { zIndex: d === 0 ? 5 : 2, duration: 0.1 });
        gsap.to(card, {
          scale: d === 0 ? 1 : d === 1 ? 0.9 : 0.78,
          x: (i - front) * 14,
          y: d * 16,
          rotation: (i - front) * 10,
          filter: d === 0 ? "brightness(1)" : "brightness(0.55)",
          duration: 0.65,
          ease: "power3.out",
        });
      });
      if (roloTag) {
        gsap.fromTo(
          roloTag,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
        );
      }
    }

    if (prefersReduced) {
      cards.forEach((card, i) => gsap.set(card, { zIndex: i === 2 ? 5 : 2 }));
    } else {
      rolo.addEventListener("click", () => {
        front = (front + 1) % cards.length;
        if (roloTag) roloTag.textContent = tags[front];
        settle();
      });
      settle();
    }
  }

  /* ===================== SECTION 3 — CHANNELS (SLOT REELS) ===================== */
  const chList = document.getElementById("ctChList");
  if (chList && !prefersReduced) {
    gsap.utils.toArray(".ct-chan").forEach((chan, i) => {
      const reel = chan.querySelector(".ct-chan-reel");
      const imgs = reel ? reel.querySelectorAll("img") : [];
      let frame = 0;

      gsap.fromTo(
        chan,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          delay: 0.1 + i * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: chan, start: "top 86%" },
        }
      );

      if (!reel || imgs.length < 2) return;

      const h = 176;
      gsap.set(reel, { y: 0 });

      function spin(next) {
        gsap.to(reel, {
          y: -h * next,
          duration: 1.1,
          ease: "power4.inOut",
          onComplete: () => {
            frame = next;
            gsap.fromTo(
              chan.querySelector(".ct-chan-ico"),
              { rotation: 0, scale: 1 },
              { rotation: -20, scale: 1.3, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }
            );
          },
        });
      }

      chan.addEventListener("mouseenter", () => {
        const next = (frame + 1) % imgs.length;
        spin(next);
      });
    });

    }

  /* ===================== SECTION 4 — THE WINDOW (LOUVERS) ===================== */
  const windows = gsap.utils.toArray(".ct-window");
  if (windows.length && !prefersReduced) {
    windows.forEach((win) => {
      const slats = gsap.utils.toArray(win.querySelectorAll(".ct-lv"));
      gsap.fromTo(
        slats,
        { opacity: 1, transformPerspective: 500, x: 0 },
        {
          opacity: 0.12,
          x: 0,
          duration: 0.9,
          ease: "power3.inOut",
          stagger: 0.07,
          scrollTrigger: { trigger: win, start: "top 78%", once: true },
        }
      );
    });
  }
/* ===================== SECTION 5 — THE TURNAROUND (TURN LEDGER) ===================== */
  const turns = document.getElementById("ctTurns");

  if (turns) {
    const turnRows = gsap.utils.toArray(".ct-turn");

    if (!prefersReduced) {
      gsap.fromTo(
        turnRows,
        { autoAlpha: 0, y: 46 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.16,
          scrollTrigger: { trigger: turns, start: "top 72%" },
        }
      );

      /* elapsed minutes count up */
      turnRows.forEach((row) => {
        const minEl = row.querySelector(".ct-turn-min");
        const target = parseInt(minEl.dataset.min, 10) || 0;
        const meter = { v: 0 };
        gsap.to(meter, {
          v: target,
          duration: 1.4,
          ease: "power2.inOut",
          scrollTrigger: { trigger: row, start: "top 78%" },
          onUpdate: () => {
            minEl.textContent = Math.round(meter.v);
          },
        });

        /* flight arrow glides across on enter */
        const flight = row.querySelector(".ct-turn-flight");
        gsap.fromTo(
          flight,
          { xPercent: -160, autoAlpha: 0 },
          {
            xPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 78%" },
          }
        );

        /* brief and reply slip in from opposite sides */
        const brief = row.querySelector(".ct-turn-brief");
        const reply = row.querySelector(".ct-turn-reply");
        gsap.fromTo(
          brief,
          { x: -38, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 78%" },
          }
        );
        gsap.fromTo(
          reply,
          { x: 38, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 78%" },
          }
        );
      });
    }

    /* clock note */
    const clockNote = document.querySelector(".ct-reply-clock");
    if (clockNote && !prefersReduced) {
      gsap.fromTo(
        clockNote,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: { trigger: turns, start: "top 70%" },
        }
      );
    }
  }

  /* ===================== SECTION 6 — THE DESKS (ROUTE DRAW) ===================== */
  const route = document.getElementById("ctRoute");
  const routeDash = document.getElementById("ctRouteDash");

  if (route) {
    /* route dashed line drawing as it scrolls */
    if (routeDash && !prefersReduced) {
      ScrollTrigger.create({
        trigger: route,
        start: "top 80%",
        end: "bottom 70%",
        scrub: 1,
        onUpdate: (self) => {
          const isMobile = window.innerWidth <= 980;
          const dim = isMobile ? "height" : "width";
          const target = Math.min(1, self.progress * 1.1);
          routeDash.style[dim] = target * 100 + "%";
        },
      });
    }

    if (!prefersReduced) {
      gsap.utils.toArray(".ct-stop").forEach((stop, i) => {
        gsap.fromTo(
          stop,
          { autoAlpha: 0, y: 56 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: 0.35 + i * 0.18,
            ease: "power3.out",
            scrollTrigger: { trigger: stop, start: "top 84%" },
          }
        );
      });

      gsap.utils.toArray(".ct-postcard").forEach((pc, i) => {
        pc.addEventListener("mouseenter", () => {
          gsap.fromTo(
            pc,
            { rotateX: 6 },
            {
              rotateX: 0,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => gsap.set(pc, { clearProps: "transform" }),
            }
          );
        });
      });
    }
  }

  /* ===================== SECTION 7 — THE RELAY (STAMP INK) ===================== */
  const relayTrack = document.getElementById("ctRelayTrack");
  if (relayTrack) {
    if (!prefersReduced) {
gsap.utils.toArray(".ct-stamp").forEach((stamp, i) => {
        gsap.fromTo(
          stamp,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            delay: i * 0.16,
            ease: "power3.out",
            scrollTrigger: { trigger: stamp, start: "top 86%" },
          }
        );
      });
    }
  }

  /* ===================== SECTION 8 — THE MAP (PARALLAX + PIN) ===================== */
  const mapFrame = document.getElementById("ctMapFrame");
  if (mapFrame) {
    if (!prefersReduced) {
gsap.utils.toArray(".ct-map-frame").forEach((mf) => {
        gsap.fromTo(
          mf,
          { y: 56, opacity: 0.6, rotateX: 6 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: mf, start: "top 80%" },
          }
        );
      });

      /* 3D hover tilt toward the cursor */
      const stage = document.getElementById("ctMapStage");
      if (stage) {
        mapFrame.addEventListener("mousemove", (e) => {
          const r = mapFrame.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(mapFrame, {
            rotateY: px * 3,
            rotateX: -py * 3,
            transformPerspective: 900,
            duration: 0.5,
            ease: "power3.out",
          });
        });
        mapFrame.addEventListener("mouseleave", () => {
          gsap.to(mapFrame, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
        });
      }
    }
  }

  /* ===================== SECTION 9 — THE LETTER (FORM + REACTIVE SHEET) ===================== */
  const letterForm = document.getElementById("ctLetterForm");
  const letterNote = document.getElementById("ctLetterNote");
  const sheetImg = document.getElementById("ctSheetImg");
  const sheetWrite = document.getElementById("ctSheetWrite");
  const sigSeal = document.querySelector(".ct-sig-seal");

  const fieldImgs = {
    name: "woman-headshot-white-blazer.webp",
    email: "executive-signing-document-desk.webp",
    date: "elegant-ballroom-event.webp",
    shape: "stage-setup-crew-day.webp",
  };
  const fieldHints = {
    name: "Start with your name, then tell us the date.",
    email: "The work email, not the press contact.",
    date: "Pick the night &mdash; we hold dates on first word.",
    shape: "Tell us the people, the night, the worry.",
  };

  function setFieldReactive(field) {
    if (sheetImg && fieldImgs[field]) {
      gsap.fromTo(
        sheetImg,
        { autoAlpha: 0.15, scale: 1.06 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          onStart: () => {
            sheetImg.src = "../images/" + fieldImgs[field];
          },
        }
      );
    }
    if (sheetWrite) {
      gsap.fromTo(
        sheetWrite,
        { y: 10, autoAlpha: 0.4 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }

const fieldRules = {
    name: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    date: (v) => v.trim().length > 0,
    shape: (v) => v.trim().length >= 12,
  };

  function validateField(wrap) {
    const field = wrap.getAttribute("data-field");
    const input = wrap.querySelector("input, textarea");
    const rule = fieldRules[field];
    const good = rule ? rule(input.value) : true;
    wrap.classList.toggle("ct-field-error", !good);
    return good;
  }

  document.querySelectorAll("[data-field]").forEach((fieldWrap) => {
    const input = fieldWrap.querySelector("input, textarea");
    if (!input) return;
    input.addEventListener("input", () => {
      fieldWrap.classList.remove("ct-field-error");
    });
    input.addEventListener("blur", () => {
      if (input.value.trim()) fieldWrap.classList.remove("ct-field-error");
      else validateField(fieldWrap);
    });
    input.addEventListener("focus", () => {
      setFieldReactive(fieldWrap.getAttribute("data-field"));
    });
  });

  if (letterForm) {
    letterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      let firstBad = null;
      document.querySelectorAll("[data-field]").forEach((f) => {
        const good = validateField(f);
        if (!good) {
          ok = false;
          if (!firstBad) firstBad = f;
        }
      });

      if (!ok) {
        if (letterNote) {
          letterNote.textContent = "A few lines are missing. Check the inked bearings.";
          letterNote.classList.remove("ok");
        }
        if (firstBad) {
          const firstInput = firstBad.querySelector("input, textarea");
          if (firstInput) firstInput.focus();
        }
        return;
      }

if (letterNote) {
        letterNote.textContent = "Posted. The switchboard already has your line.";
        letterNote.classList.add("ok");
      }
      letterForm.reset();

      window.location.href = "404.html";
    });
  }

  /* ===================== SECTION 10 — THE BOARD (PINNED NOTES) ===================== */
  if (!prefersReduced) {
    gsap.utils.toArray(".ct-note").forEach((note, i) => {
      gsap.fromTo(
        note,
        { autoAlpha: 0, y: 42, rotation: i % 2 ? 6 : -6 },
        {
          autoAlpha: 1,
          y: 0,
          rotation: i % 2 ? 1.4 : -1.2,
          duration: 0.7,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: note, start: "top 86%" },
          onComplete: () => gsap.set(note, { clearProps: "transform,opacity,visibility" }),
        }
      );
    });
  }

  /* ===================== SECTION 11 — RING THE BELL (PARALLAX) ===================== */
  const waveImg = document.getElementById("ctWaveImg");
  if (waveImg && !prefersReduced) {
    gsap.fromTo(
      waveImg,
      { scale: 1.18 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#wave",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  }

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
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });

/* ===================== FOOTER — NEWSLETTER ===================== */
  const newsForm = document.getElementById("newsForm");
  const newsEmail = document.getElementById("newsEmail");
  const newsNote = document.getElementById("newsNote");

  function showNewsNote(msg, isError) {
    if (!newsNote) return;
    newsNote.innerHTML = isError
      ? '<i class="fa-solid fa-circle-exclamation"></i>' + msg
      : '<i class="fa-solid fa-circle-check"></i> ' + msg;
    newsNote.classList.remove("is-error");
    if (isError) newsNote.classList.add("is-error");
    newsNote.classList.remove("show");
    void newsNote.offsetWidth;
    newsNote.classList.add("show");
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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

  /* footer year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  ScrollTrigger.refresh();
})();

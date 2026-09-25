/* =============================================================
   404 page — Stackly
   GSAP entrance, lottie searchlight ring, cursor parallax,
   magnetic buttons, and the "Go Back / Back to Home" logic.
   ============================================================= */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasLottie = typeof lottie !== "undefined";
  var g = gsap;

  var stage = document.getElementById("nfStage");
  var eyebrow = document.getElementById("nfEyebrow");
  var center = document.getElementById("nfCenter");
  var glow = document.getElementById("nfGlow");
  var num = document.getElementById("nfNum");
  var digits = num.querySelectorAll(".nf-digit");
  var copy = document.getElementById("nfCopy");
  var actions = document.getElementById("nfActions");
  var meta = document.getElementById("nfMeta");

  /* -------------------------------------------------------------
     Initial state for the entrance timeline.
     ------------------------------------------------------------- */
  if (!reduced) {
    g.set([eyebrow, copy, actions, meta], { autoAlpha: 0, y: 26 });
    g.set(digits, { autoAlpha: 0, y: 46, rotateX: -90, transformOrigin: "50% 100%" });
  }

  /* -------------------------------------------------------------
     Lottie — searchlight ring behind the number.
     ------------------------------------------------------------- */
  function mountLottie() {
    var ring = {
      v: "5.7.4",
      fr: 60,
      ip: 0,
      op: 90,
      w: 360,
      h: 360,
      nm: "404 Searchlight Ring",
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "shell",
          sr: 1,
          ks: {
            o: { a: 0, k: 46 },
            r: { a: 1, k: [
              { i: { x: 0.25, y: 1 }, o: { x: 0.75, y: 0 }, t: 0, s: 0 },
              { i: { x: 0.25, y: 1 }, o: { x: 0.75, y: 0 }, t: 45, s: 360 },
              { t: 90, s: 720 }
            ] },
            p: { a: 0, k: [180, 180, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          },
          ao: 0,
          shapes: [{
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 24 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                or: { a: 0, k: 0 },
                os: { a: 0, k: 0 },
                ix: 1,
                nm: "ring",
                mn: "ADBE Vector Shape - Star",
                hd: false,
                ty: "sr"
              },
              {
                ty: "st",
                c: { a: 0, k: [0.788, 0.635, 0.294, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 2,
                ml: 4,
                nm: "stroke",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
                ty: "st"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                sh: { a: 0, k: 0 },
                nm: "pf",
                o: { a: 0, k: 0 }
              }
            ],
            np: 3,
            nm: "shell",
            mn: "ADBE Vector Group",
            hd: false,
            ty: "gr"
          }],
          ip: 0,
          op: 90,
          st: 0,
          bm: 0
        },
        {
          ddd: 0,
          ind: 2,
          ty: 4,
          nm: "beam",
          sr: 1,
          ks: {
            o: { a: 0, k: 30 },
            r: { a: 1, k: [
              { i: { x: 0.25, y: 1 }, o: { x: 0.75, y: 0 }, t: 0, s: 0 },
              { i: { x: 0.25, y: 1 }, o: { x: 0.75, y: 0 }, t: 45, s: 360 },
              { t: 90, s: 720 }
            ] },
            p: { a: 0, k: [180, 180, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          },
          ao: 0,
          shapes: [{
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [40, 40] },
                p: { a: 0, k: [152, 0] },
                nm: "dot",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false,
                ty: "el"
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.788, 0.635, 0.294, 1] },
                o: { a: 0, k: 100 },
                nm: "fill",
                mn: "ADBE Vector Graphic - Fill",
                hd: false,
                ty: "fl"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                sh: { a: 0, k: 0 },
                nm: "pf",
                o: { a: 0, k: 0 }
              }
            ],
            np: 3,
            nm: "beam",
            mn: "ADBE Vector Group",
            hd: false,
            ty: "gr"
          }],
          ip: 0,
          op: 90,
          st: 0,
          bm: 0
        }
      ],
      markers: []
    };

    var holder = document.getElementById("nfLottie");
    try {
      lottie.loadAnimation({ container: holder, renderer: "svg", loop: true, autoplay: !reduced, animationData: ring });
    } catch (e) {
      /* lottie failed — the design still reads fine without it */
    }
  }

  if (hasLottie) {
    mountLottie();
  }

  /* -------------------------------------------------------------
     Entrance timeline.
     ------------------------------------------------------------- */
  var tl = g.timeline({ defaults: { ease: "power3.out" } });

  if (reduced) {
    g.set([eyebrow, num, copy, actions, meta], { autoAlpha: 1 });
  } else {
    tl.fromTo(glow, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0)
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.25)
      .to(digits, {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12
      }, 0.4)
      .to(copy, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.05)
      .to(actions, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.3)
      .to(meta, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.5)
      .to(num, { rotate: 0.9, duration: 0.3, ease: "sine.inOut" }, 1.9)
      .to(num, { rotate: -0.9, duration: 0.6, ease: "sine.inOut" }, 2.2)
      .to(num, { rotate: 0, duration: 0.4, ease: "power2.out" }, 2.8);
  }

  /* -------------------------------------------------------------
     Cursor parallax — tilt the whole composition slightly.
     ------------------------------------------------------------- */
  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    var bx = 0;
    var by = 0;
    var m = { x: 0, y: 0 };
    var mx = 0, my = 0;

    g.ticker.add(function () {
      mx += (m.x - mx) * 0.08;
      my += (m.y - my) * 0.08;
      bx += (-m.x * 18 - bx) * 0.06;
      by += (-m.y * 12 - by) * 0.06;
      g.set(center, { rotateX: mx * 6, rotateY: my * -6, transformPerspective: 900 });
      g.set(glow, { x: bx, y: by });
    });

    stage.addEventListener("pointermove", function (e) {
      m.x = ((e.clientX / window.innerWidth) - 0.5) * 2;
      m.y = ((e.clientY / window.innerHeight) - 0.5) * 2;
    });
  }

  /* -------------------------------------------------------------
     Magnetic buttons.
     ------------------------------------------------------------- */
  function magnetic(el) {
    el.addEventListener("pointermove", function (e) {
      if (reduced) return;
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
      g.to(el, { x: dx, y: dy, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", function () {
      g.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    });
  }

  magnetic(document.getElementById("nfBack"));
  magnetic(document.getElementById("nfHome"));

  /* -------------------------------------------------------------
     Go Back — return to the last page and its section.
     ------------------------------------------------------------- */
  var back = document.getElementById("nfBack");
  var home = document.getElementById("nfHome");

  back.addEventListener("click", function () {
    var ref = document.referrer;
    var inSite = /index\.html|services\.html|events\.html|about\.html|contact\.html/i.test(ref);
    if (inSite) {
      history.back();
      window.setTimeout(function () {
        if (document.referrer) window.location.href = ref;
      }, 900);
      return;
    }
    if (history.length > 1) {
      history.back();
      return;
    }
    window.location.href = "../index.html";
  });

  home.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "../index.html";
  });
})();
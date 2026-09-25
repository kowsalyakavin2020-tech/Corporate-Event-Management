(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  if (window.gsap && !prefersReduced) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  var lenis = null;
  if (window.Lenis && !prefersReduced) {
    lenis = new window.Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    }
  }

  if (window.AOS && !prefersReduced) {
    window.AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });
  } else if (window.AOS) {
    window.AOS.init({ duration: 0, once: true, offset: 0 });
  }

  var docE = document.documentElement;
  var header = $('#siteHeader');
  var progressBar = $('#scrollProgress');

  function onScroll() {
    var y = window.scrollY || docE.scrollTop;
    if (header) {
      if (y > 40) { header.classList.add('is-scrolled'); } else { header.classList.remove('is-scrolled'); }
    }
    if (progressBar) {
      var max = docE.scrollHeight - window.innerHeight;
      var p = max > 0 ? (y / max) * 100 : 0;
      progressBar.style.width = p + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hamburger = $('#hamburger');
  var mmClose = $('#mmClose');
  var mobileMenu = $('#mobileMenu');
  var menuOpen = false;
  function openMenu() {
    if (!mobileMenu || menuOpen) { return; }
    menuOpen = true;
    document.body.classList.add('menu-open');
    if (hamburger) { hamburger.setAttribute('aria-expanded', 'true'); }
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (lenis) { lenis.stop(); }
    if (window.gsap && !prefersReduced) {
      window.gsap.set(mobileMenu, { visibility: 'visible' });
      window.gsap.timeline()
        .to(mobileMenu, { clipPath: 'inset(0 0 0% 0)', duration: 0.75, ease: 'power4.inOut' })
        .fromTo('.mm-head', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, '-=0.3')
        .fromTo('.mm-link', { y: 55, opacity: 0, rotateX: -35 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.045 }, '-=0.25')
        .fromTo('.mm-foot', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, '-=0.25');
    } else {
      mobileMenu.style.visibility = 'visible';
      mobileMenu.style.clipPath = 'inset(0 0 0% 0)';
    }
  }
  function closeMenu() {
    if (!mobileMenu || !menuOpen) { return; }
    menuOpen = false;
    if (hamburger) { hamburger.setAttribute('aria-expanded', 'false'); }
    if (window.gsap && !prefersReduced) {
      window.gsap.to(mobileMenu, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.6,
        ease: 'power4.inOut',
        onComplete: function () {
          window.gsap.set(mobileMenu, { visibility: 'hidden' });
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('menu-open');
          if (lenis) { lenis.start(); }
        }
      });
    } else {
      mobileMenu.style.clipPath = 'inset(0 0 100% 0)';
      mobileMenu.style.visibility = 'hidden';
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      if (lenis) { lenis.start(); }
    }
  }
  if (hamburger) { hamburger.addEventListener('click', openMenu); }
  if (mmClose) { mmClose.addEventListener('click', closeMenu); }

  function scrollToTarget(target) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) { return; }
    if (lenis) { lenis.scrollTo(el, { offset: -76, duration: 1.2 }); }
    else { el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' }); }
    closeMenu();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-scroll-to]');
    if (link) {
      e.preventDefault();
      scrollToTarget(link.getAttribute('data-scroll-to'));
      return;
    }
    var back = e.target.closest('#backTop');
    if (back) {
      e.preventDefault();
      if (lenis) { lenis.scrollTo(0, { duration: 1.1 }); }
      else { window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }); }
    }
  });

  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  $$('.tp-tile').forEach(function (tile) {
    tile.addEventListener('click', function () {
      var willOpen = !tile.classList.contains('is-open');
      $$('.tp-tile.is-open', tile.parentElement).forEach(function (t) { t.classList.remove('is-open'); });
      if (willOpen) { tile.classList.add('is-open'); }
    });
  });

  var cbBg = $('#cbBg');
  if (!prefersReduced) {
    if (window.gsap) {
      if (cbBg) {
        window.gsap.fromTo(cbBg.querySelector('img'), { scale: 1.18 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: $('#join') || cbBg, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
    }
  }var hdFrame = $('.hd-frame');
  var hdImg = $('#hdImg');

  if (hdFrame && !prefersReduced) {
    setTimeout(function () { hdFrame.classList.add('is-open'); }, 300);
    if (window.gsap) {
      window.gsap.set('.hd-frame', { transformPerspective: 1400 });
      window.gsap.fromTo(hdImg, { filter: 'brightness(0.55) saturate(0.7)' }, {
        filter: 'brightness(1) saturate(1)',
        duration: 1.2,
        delay: 0.35,
        ease: 'power2.out'
      });
    }
    hdFrame.addEventListener('pointermove', function (e) {
      var r = hdFrame.getBoundingClientRect();
      var x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
      var y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
      hdFrame.style.setProperty('--mx', x + '%');
      hdFrame.style.setProperty('--my', y + '%');
    });
  } else if (hdFrame) {
    hdFrame.classList.add('is-open');
  }

  $$('.hd-m').forEach(function (m) {
    if (!prefersReduced && window.gsap) {
      window.gsap.from(m, { yPercent: 115, duration: 1.05, ease: 'power4.out', stagger: 0.12, delay: 0.45 });
    }
  });

  function countUp(el, target, suffix, dur, delay) {
    suffix = suffix || '';
    delay = delay || 0;
    dur = dur || 1400;
    if (prefersReduced) { el.textContent = target + suffix; return; }
    var start = null;
    function step(ts) {
      if (!start) { start = ts; }
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) { window.requestAnimationFrame(step); }
      else { el.textContent = target + suffix; }
    }
    setTimeout(function () { window.requestAnimationFrame(step); }, delay);
  }

  $$('.hd-stat b[data-count]').forEach(function (b) {
    if (!prefersReduced && window.gsap && window.ScrollTrigger) {
      var t = window.gsap.timeline({
        scrollTrigger: { trigger: b, start: 'top 90%', once: true }
      });
      t.call(function () {
        countUp(b, parseInt(b.getAttribute('data-count'), 10), b.getAttribute('data-suffix') || '', 1500);
      });
    } else {
      countUp(b, parseInt(b.getAttribute('data-count'), 10), b.getAttribute('data-suffix') || '');
    }
  });

  var dxList = $('#dxList');
  var dxImg = $('#dxImg');
  var dxChip = $('#dxChip');
  var dxStage = $('#dxStage');
  if (dxList && dxImg) {
    var dxRows = $$('.dx-row', dxList);
    var dxShots = $$('img', dxImg);
    function setDx(idx, force) {
      if (!force && $$('.dx-row.is-active', dxList).length && $$('.dx-row.is-active', dxList)[0].getAttribute('data-dx') === String(idx)) { return; }
      $$('.dx-row.is-active', dxList).forEach(function (r) { r.classList.remove('is-active'); });
      var row = dxList.querySelector('[data-dx="' + idx + '"]');
      if (row) { row.classList.add('is-active'); }
      dxShots.forEach(function (im) {
        im.classList.toggle('is-live', im.getAttribute('data-dximg') === String(idx));
      });
      var rowH = row ? row.querySelector('.dx-txt h3') : null;
      if (dxChip) { dxChip.textContent = 'now viewing \u2014 ' + (rowH ? rowH.textContent : ''); }
      if (dxStage && !prefersReduced) {
        dxStage.classList.remove('is-swipe');
        void dxStage.offsetWidth;
        dxStage.classList.add('is-swipe');
      }
    }
    dxRows.forEach(function (row) {
      ['pointerenter', 'focus'].forEach(function (ev) {
        row.addEventListener(ev, function () { setDx(parseInt(row.getAttribute('data-dx'), 10)); });
      });
    });
    var active = dxList.querySelector('.dx-row.is-active');
    if (!active && dxRows.length) { setDx(0, true); }
  }

  var rtRoyal = $('#rtRoyal');
  var rtCore = $('#rtCore');
  !function (royal, core) {
    if (!royal) { return; }
    if (window.gsap && window.ScrollTrigger && !prefersReduced) {
      window.gsap.timeline({
        scrollTrigger: { trigger: royal, start: 'top 85%', once: true }
      }).call(function () { royal.classList.add('is-live'); });
    } else {
      royal.classList.add('is-live');
    }
    if (core) {
      core.addEventListener('pointerenter', function () { core.classList.add('is-open'); royal.classList.add('is-repel'); });
      core.addEventListener('pointerleave', function () {
        core.classList.remove('is-open');
        royal.classList.remove('is-repel');
      });
      core.addEventListener('click', function () {
        var open = core.classList.toggle('is-open');
        royal.classList.toggle('is-repel', open);
      });
    }
  }(rtRoyal, rtCore);

  var mqTop = $('#mqTop');
  var mqBot = $('#mqBot');
  var mqFrame = $('#mqFrame');
  var mqImgs = mqFrame ? $$('img', mqFrame) : [];

  $$('.mq-word').forEach(function (w) {
    w.addEventListener('pointerenter', function () {
      var idx = w.getAttribute('data-mq');
      $$('.mq-word').forEach(function (o) { o.classList.toggle('is-on', o === w); });
      mqImgs.forEach(function (im) {
        im.classList.toggle('is-on', im.getAttribute('data-mqimg') === idx);
      });
    });
  });

  var mqStage = $('#mqStage');
  var mqPaused = false;
  var mqCycle = null;
  var mqCanCycle = window.matchMedia && window.matchMedia('(min-width: 761px)').matches;
  if (mqStage && mqImgs.length > 1 && mqCanCycle && !prefersReduced) {
    mqStage.addEventListener('pointerenter', function () { mqPaused = true; });
    mqStage.addEventListener('pointerleave', function () { mqPaused = false; });
    function cycleMq() {
      if (mqPaused || !mqVisible || document.hidden) { return; }
      var idx = 0;
      mqImgs.forEach(function (im, i) { if (im.classList.contains('is-on')) { idx = (i + 1) % mqImgs.length; } });
      var key = String(idx);
      $$('.mq-word').forEach(function (o) { o.classList.toggle('is-on', o.getAttribute('data-mq') === key); });
      mqImgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-mqimg') === key); });
    }
    mqCycle = window.setInterval(cycleMq, 4000);
  }

  if (mqTop && mqBot && !prefersReduced) {
    function seed(seg) {
      var total = seg.scrollWidth;
      var clones = [];
      for (var i = 0; i < 2; i++) {
        $$('.mq-word', seg).forEach(function (w) {
          clones.push(w.cloneNode(true));
          seg.appendChild(w.cloneNode(true));
        });
      }
      return clones;
    }
    if (window.gsap) {
      seed(mqTop);
      seed(mqBot);
      var mqVisible = true;
      function mqStart() {
        [mqTop, mqBot].forEach(function (s) {
          if (s && s._mqStart && mqVisible && !document.hidden) { s._mqStart(); }
        });
      }
      if ('IntersectionObserver' in window) {
        var mqObs = new IntersectionObserver(function (entries) {
          var any = entries.some(function (e) { return e.isIntersecting; });
          if (any === mqVisible) { return; }
          mqVisible = any;
          mqStart();
        });
        mqObs.observe(mqTop);
        mqObs.observe(mqBot);
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          [mqTop, mqBot].forEach(function (s) { if (s && s._mqStop) { s._mqStop(); } });
        } else {
          mqStart();
        }
      });
      function marquee(seg, speed, reverse) {
        var word = $$('.mq-word', seg)[0];
        var step = word.offsetWidth;
        var dir = reverse ? -1 : 1;
        var x = 0;
        var running = false;
        function stepOnce() {
          x -= dir * speed;
          if (Math.abs(x) >= step) { x += dir * step; }
          seg.style.transform = 'translate3d(' + x + 'px,0,0)';
          if (mqVisible && !document.hidden) { window.requestAnimationFrame(stepOnce); }
          else { running = false; }
        }
        seg._mqStart = function () {
          if (running) { return; }
          running = true;
          window.requestAnimationFrame(stepOnce);
        };
        seg._mqStop = function () { running = false; };
        if (mqVisible && !document.hidden) { seg._mqStart(); }
      }
      marquee(mqTop, 0.7, false);
      marquee(mqBot, 0.55, true);
    }
  }

  var vsTrack = $('#vsTrack');
  if (vsTrack) {
    var vsCards = $$('.vs-card', vsTrack);
    if (window.gsap && window.ScrollTrigger && !prefersReduced) {
      vsCards.forEach(function (card, i) {
        window.gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 92%', once: true }
        });
      });
      window.gsap.to(vsTrack, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: '.vs-section', start: 'top top', end: 'bottom bottom', scrub: 0.6 }
      });
    }
    if (window.ScrollTrigger) {
      vsCards.forEach(function (card) {
        window.ScrollTrigger.create({
          trigger: card,
          start: 'top center',
          end: 'bottom center',
          onEnter: function () { activate(card); },
          onEnterBack: function () { activate(card); },
          once: false
        });
      });
    }
    function activate(card) {
      vsCards.forEach(function (c) { c.classList.toggle('is-active', c === card); });
    }
    if (!prefersReduced) { activate(vsCards[0]); }
  }

  var rvSlider = $('#rvSlider');
  if (rvSlider) {
    var rvPct = 50;
    var dragging = false;
    function setRVPct(p) {
      rvPct = Math.max(6, Math.min(94, p));
      rvSlider.style.setProperty('--rv', rvPct + '%');
    }
    if (window.gsap && window.ScrollTrigger && !prefersReduced) {
      window.gsap.to(rvSlider, {
        '--rv': 20,
        ease: 'none',
        scrollTrigger: { trigger: rvSlider, start: 'top 85%', end: 'bottom 60%', scrub: 0.4 }
      });
    }
    rvSlider.addEventListener('pointerdown', function (e) {
      dragging = true;
      if (rvSlider.setPointerCapture) { rvSlider.setPointerCapture(e.pointerId); }
      move(e);
    });
    rvSlider.addEventListener('pointermove', function (e) {
      if (dragging) { move(e); }
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      rvSlider.addEventListener(ev, function () { dragging = false; });
    });
    function move(e) {
      var r = rvSlider.getBoundingClientRect();
      setRVPct(((e.clientX - r.left) / r.width) * 100);
    }
    rvSlider.addEventListener('dblclick', function (e) { move(e); });
  }

  var scBoard = $('#scBoard');
  if (scBoard) {
    $$('.sc-num[data-count]', scBoard).forEach(function (num) {
      var target = parseInt(num.getAttribute('data-count'), 10);
      var digits = String(target).split('');
      num.textContent = '';
      var frag = document.createDocumentFragment();
      digits.forEach(function (d, i) {
        var span = document.createElement('span');
        span.className = 'sc-digit';
        span.textContent = d;
        frag.appendChild(span);
      });
      num.appendChild(frag);
      var spans = $$('.sc-digit', num);
      if (window.gsap && window.ScrollTrigger && !prefersReduced) {
        window.gsap.timeline({
          scrollTrigger: { trigger: num, start: 'top 92%', once: true }
        }).set(spans, { translateY: '1.2em' })
          .to(spans, { translateY: '0em', duration: 0.7, ease: 'power4.out', stagger: 0.07, delay: 0.15 })
          .add(function () { spans.forEach(function (s) { s.classList.add('is-set'); }); });
      } else {
        spans.forEach(function (s) { s.classList.add('is-set'); });
      }
    });
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function setNote(note, msg, isError) {
    note.textContent = msg;
    note.classList.toggle('is-error', !!isError);
    note.classList.remove('show');
    void note.offsetWidth;
    note.classList.add('show');
  }
  var cbForm = $('#cbForm');
  if (cbForm) {
    var cbFields = [
      { name: 'name', msg: 'Please fill in your name.', notEmpty: true },
      { name: 'email', msg: 'Please fill in your email.', test: function (v) { return validateEmail(v); }, msgInvalid: 'Enter a valid email address.' },
      { name: 'date', msg: 'Please fill in the event date.', notEmpty: true },
      { name: 'city', msg: 'Please fill in the city.', notEmpty: true },
      { name: 'shape', msg: 'Please fill in the shape of the night.', notEmpty: true }
    ];
    function setFieldError(f, errEl, msg) {
      if (msg) {
        errEl.textContent = msg;
        errEl.classList.add('show');
        f.classList.add('is-invalid');
      } else {
        errEl.textContent = '';
        errEl.classList.remove('show');
        f.classList.remove('is-invalid');
      }
    }
    function cbValidate() {
      var allOk = true;
      var firstBad = null;
      cbFields.forEach(function (rule) {
        var f = cbForm.querySelector('[name="' + rule.name + '"]');
        var errEl = document.getElementById('cbErr' + rule.name.charAt(0).toUpperCase() + rule.name.slice(1));
        if (!f || !errEl) { return; }
        var v = f.value.trim();
        var bad = rule.notEmpty ? v.length === 0 : false;
        if (!bad && rule.test) {
          bad = !rule.test(v);
          setFieldError(f, errEl, bad ? rule.msgInvalid : null);
        } else {
          setFieldError(f, errEl, bad ? rule.msg : null);
        }
        if (bad) { allOk = false; firstBad = firstBad || f; }
      });
      return { allOk: allOk, firstBad: firstBad };
    }
    cbFields.forEach(function (rule) {
      var f = cbForm.querySelector('[name="' + rule.name + '"]');
      if (!f) { return; }
      var errEl = document.getElementById('cbErr' + rule.name.charAt(0).toUpperCase() + rule.name.slice(1));
      f.addEventListener('blur', function () {
        var v = f.value.trim();
        var bad = rule.notEmpty ? v.length === 0 : false;
        if (!bad && rule.test) { bad = !rule.test(v); }
        setFieldError(f, errEl, bad ? (rule.test && !rule.notEmpty ? rule.msgInvalid : rule.msg) : null);
      });
      f.addEventListener('input', function () {
        var v = f.value.trim();
        var bad = rule.notEmpty ? v.length === 0 : false;
        if (!bad && rule.test) { bad = !rule.test(v); }
        if (!bad) { setFieldError(f, errEl, null); }
      });
    });
    cbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = cbValidate();
      if (!res.allOk) {
        if (res.firstBad) { res.firstBad.focus(); }
        return;
      }
      window.location.href = '404.html';
    });
  }
  var newsForm = $('#newsForm');
  var newsNote = $('#newsNote');
  if (newsForm && newsNote) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = newsForm.querySelector('input[type="email"]');
      if (!validateEmail(email.value.trim())) { setNote(newsNote, 'Please enter a work email.', true); email.focus(); return; }
      window.location.href = '404.html';
    });
  }

  if (window.AOS) { window.AOS.refresh(); }
  if (window.gsap && window.ScrollTrigger) { window.setTimeout(function () { window.ScrollTrigger.refresh(); }, 300); }
})();
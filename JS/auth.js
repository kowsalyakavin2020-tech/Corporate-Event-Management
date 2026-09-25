/* =============================================================
   Auth pages — Stackly (login.html + signin.html)
   Shared: validation, password strength bar, eye toggles, toast,
   GSAP entrance, and the Login / Create Account redirects.
   ============================================================= */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var g = typeof gsap !== "undefined" ? gsap : null;

  var isLogin = !!document.getElementById("loginForm");
  var form = isLogin
    ? document.getElementById("loginForm")
    : document.getElementById("signupForm");

  var toast = document.getElementById("authToast");
  var toastTimer = null;

  /* -------------------------------------------------------------
     Helpers
     ------------------------------------------------------------- */
  function isValidEmail(value) {
    // complete e-mail shape, and it must end in @gmail.com
    var trimmed = String(value || "").trim();
    var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(trimmed) && /@gmail\.com$/i.test(trimmed);
  }

  function isAlphabeticName(value) {
    return /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(String(value || "").trim());
  }

  function showToast(message, isError) {
    toast.textContent = message;
    toast.classList.toggle("toast-error", !!isError);
    toast.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function setInvalid(fieldRow, message) {
    if (!fieldRow) return;
    fieldRow.classList.add("is-invalid");
    var err = fieldRow.querySelector("[data-err]");
    if (err) err.textContent = message;
    var ctl = fieldRow.querySelector("input, select");
    if (ctl) ctl.setAttribute("aria-invalid", "true");
  }

  function setValid(fieldRow) {
    if (!fieldRow) return;
    fieldRow.classList.remove("is-invalid");
    var ctl = fieldRow.querySelector("input, select");
    if (ctl) ctl.setAttribute("aria-invalid", "false");
  }

  function fieldRowByName(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function valueOf(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  /* -------------------------------------------------------------
     Eye toggles
     ------------------------------------------------------------- */
  var eyeButtons = form.querySelectorAll("[data-eye]");
  eyeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ctl = btn.closest(".fld-ctl");
      var input = ctl ? ctl.querySelector("input") : null;
      if (!input) return;
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.querySelector("i").className = show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    });
  });

  /* -------------------------------------------------------------
     Password strength (signup)
     ------------------------------------------------------------- */
  var pwInput = form.querySelector('[name="password"]');
  var pwRow = fieldRowByName("password");
  var strength = form.querySelector("[data-strength]");
  var strengthLabel = form.querySelector("[data-strength-label]");
  var strengthPct = form.querySelector("[data-strength-pct]");
  var rules = form.querySelector("[data-pw-rules]");
  var ruleMap = {
    len: "8+ characters",
    upper: "One uppercase letter",
    lower: "One lowercase letter",
    num: "One number",
    spec: "One special character"
  };
  var levelNames = ["", "Too weak", "Weak", "Fair", "Strong", "Excellent"];

  function passwordChecks(value) {
    return {
      len: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      num: /\d/.test(value),
      spec: /[^A-Za-z0-9]/.test(value)
    };
  }

  function updateStrength() {
    if (!strength) return;
    var value = pwInput ? pwInput.value : "";
    var checks = passwordChecks(value);
    var score = 0;
    [checks.len, checks.upper, checks.lower, checks.num, checks.spec].forEach(function (ok) {
      if (ok) score += 1;
    });
    strength.setAttribute("data-level", String(score));
    strengthLabel.textContent = value ? levelNames[score] : "Password strength";
    strengthPct.textContent = score + "/5";
    if (rules) {
      var items = rules.querySelectorAll("li[data-rule]");
      items.forEach(function (li) {
        var key = li.getAttribute("data-rule");
        if (checks[key]) li.classList.add("ok");
        else li.classList.remove("ok");
      });
    }
  }

  if (pwInput && strength) {
    pwInput.addEventListener("input", function () {
      updateStrength();
      if (valueOf("password")) setValid(pwRow);
    });
  }

  /* -------------------------------------------------------------
     Per-field live re-validation
     ------------------------------------------------------------- */
  function validateField(name) {
    var row = fieldRowByName(name);
    var value = valueOf(name);
    var valid = true;
    var message = "";

    if (name === "email") {
      if (!value) {
        valid = false; message = "Email address is required.";
      } else if (!isValidEmail(value)) {
        valid = false; message = "Enter a valid Gmail address (you@gmail.com).";
      }
    }

    if (name === "password") {
      if (!value) {
        valid = false; message = "Password is required.";
      } else if (value.length < 8) {
        valid = false; message = "Password must be at least 8 characters.";
      }
    }

    if (name === "confirm") {
      var match = valueOf("password");
      if (!value) {
        valid = false; message = "Please confirm your password.";
      } else if (value !== match) {
        valid = false; message = "Passwords do not match.";
      }
    }

    if (name === "role") {
      if (!value) {
        valid = false; message = "Please select a role.";
      }
    }

    if (name === "name") {
      if (!value) {
        valid = false; message = "Full name is required.";
      } else if (!isAlphabeticName(value)) {
        valid = false; message = "Use letters only for your full name.";
      } else if (value.length < 2) {
        valid = false; message = "Name must be at least 2 characters.";
      }
    }

    if (valid) setValid(row);
    else setInvalid(row, message);

    return valid;
  }

  var listenFields = ["email", "role"];
  if (!isLogin) listenFields = listenFields.concat(["name", "password", "confirm"]);

  listenFields.forEach(function (name) {
    var row = fieldRowByName(name);
    if (!row) return;
    var el = row.querySelector("input, select");
    if (!el) return;
    el.addEventListener("blur", function () {
      if (el.value.trim()) validateField(name);
    });
    el.addEventListener("input", function () {
      if (row.classList.contains("is-invalid")) validateField(name);
    });
  });

  var termsBox = form.querySelector('[name="terms"]');
  var termsRow = fieldRowByName("terms");
  if (termsBox) {
    termsBox.addEventListener("change", function () {
      if (termsBox.checked) setValid(termsRow);
    });
  }

  /* -------------------------------------------------------------
     Entrances (GSAP)
     ------------------------------------------------------------- */
  function entrance() {
    if (!g) return;
    var media = document.getElementById("authMedia");
    var art = document.querySelector(".auth-media-art");
    var chips = document.querySelectorAll(".am-chip");
    var quote = document.querySelector(".auth-media-quote");
    var home = document.getElementById("authHome");
    var logoWrap = document.querySelector(".auth-logo");
    var head = document.querySelector(".auth-head");
    var fieldEls = form.querySelectorAll(".fld, .fld-row, .auth-submit, .alt-divider, .auth-google");
    var sw = document.querySelector(".auth-switch");

    if (reduced) {
      g.set([media, head, form, sw, home], { autoAlpha: 1 });
      chips.forEach(function (c) { g.set(c, { autoAlpha: 1 }); });
      return;
    }

    var tl = g.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(media,
        { autoAlpha: 0, x: -60 },
        { autoAlpha: 1, x: 0, duration: 1.1 }, 0)
      .fromTo(art,
        { autoAlpha: 0, scale: 0.7, rotate: -30 },
        { autoAlpha: 1, scale: 1, rotate: 0, duration: 1, ease: "back.out(1.6)" }, 0.35)
      .fromTo(quote,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.9 }, 0.55)
      .fromTo(home,
        { autoAlpha: 0, y: -18 },
        { autoAlpha: 1, y: 0, duration: 0.7 }, 0.15)
      .fromTo(logoWrap,
        { autoAlpha: 0, y: -22 },
        { autoAlpha: 1, y: 0, duration: 0.7 }, 0.3)
      .fromTo(head,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.8 }, 0.42)
      .fromTo(fieldEls,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.6)
      .fromTo(sw,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.7 }, 1.05);

    chips.forEach(function (chip, i) {
      g.fromTo(chip,
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.8)", delay: 0.8 + i * 0.12 });
    });

    g.to(".am-ring", { rotation: 360, duration: 60, ease: "none", repeat: -1 });
  }

  entrance();

  /* -------------------------------------------------------------
     Forgot password (login)
     ------------------------------------------------------------- */
  var forgotBtn = form.querySelector("[data-forgot]");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", function () {
      var em = valueOf("email");
      if (!isValidEmail(em)) {
        setInvalid(fieldRowByName("email"), "Enter your Gmail address first, then request a reset.");
        showToast("Enter a valid Gmail address to reset your password.", true);
        return;
      }
      setValid(fieldRowByName("email"));
      showToast("Reset link sent to " + em);
    });
  }

  /* -------------------------------------------------------------
     Google buttons
     ------------------------------------------------------------- */
  var googleBtns = form.querySelectorAll("[data-google]");
  googleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showToast("Continue with Google is coming soon. Use the form for now.");
    });
  });

  /* -------------------------------------------------------------
     Remember Me (login) — checkbox only; never pre-fill fields
     ------------------------------------------------------------- */
  var rememberBox = form.querySelector('[name="remember"]');
  if (rememberBox) {
    rememberBox.addEventListener("change", function () {
      if (rememberBox.checked) {
        var em = valueOf("email");
        try {
          window.localStorage.setItem("stackly_remember", em);
        } catch (e) { /* storage unavailable */ }
      } else {
        try {
          window.localStorage.removeItem("stackly_remember");
        } catch (e) { /* storage unavailable */ }
      }
    });
  }

  /* -------------------------------------------------------------
     Submit — validate everything before allowing action
     ------------------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var firstInvalid = null;
    var names = isLogin ? ["email", "password", "role"] : ["name", "email", "password", "confirm", "role"];
    var allValid = true;

    names.forEach(function (name) {
      var ok = validateField(name);
      if (!ok && !firstInvalid) firstInvalid = name;
      if (!ok) allValid = false;
    });

    if (!isLogin && termsBox) {
      if (!termsBox.checked) {
        setInvalid(termsRow, "You must agree to the Terms and Privacy Policy.");
        if (!firstInvalid) firstInvalid = "terms";
        allValid = false;
      } else {
        setValid(termsRow);
      }
    }

    if (!allValid) {
      showToast("Please fix the highlighted fields to continue.", true);
      if (firstInvalid) {
        var target = fieldRowByName(firstInvalid);
        if (target) {
          var inp = target.querySelector("input, select");
          if (inp) setTimeout(function () { inp.focus(); }, 50);
        }
      }
      return;
    }

    var submit = form.querySelector(".auth-submit");
    var label = submit ? submit.querySelector(".btn-label") : null;
    var icon = submit ? submit.querySelector("i") : null;

    if (submit) {
      submit.disabled = true;
      if (label) label.textContent = isLogin ? "Entering…" : "Creating…";
      if (icon) {
        icon.classList.remove("fa-right-to-bracket", "fa-user-plus");
        icon.classList.add("fa-circle-notch", "fa-spin");
      }
    }

    if (isLogin) {
      var email = valueOf("email");
      var role = valueOf("role");
      var savedName = "";
      try {
        var saved = JSON.parse(window.localStorage.getItem("stackly_account") || "null");
        if (saved && saved.email === email && saved.name) savedName = saved.name;
      } catch (err) { /* storage unavailable */ }

      try {
        window.localStorage.setItem("stacklyUser", JSON.stringify({
          email: email,
          role: role,
          name: savedName || email.split("@")[0].replace(/[._-]+/g, " ")
        }));
      } catch (err) { /* storage unavailable */ }

      showToast("Welcome back. Opening your " + role + " dashboard…");
      window.setTimeout(function () {
        window.location.href = role + ".html";
      }, 900);
    } else {
      var account = {
        name: valueOf("name"),
        email: valueOf("email"),
        role: valueOf("role")
      };
      try {
        window.localStorage.setItem("stackly_account", JSON.stringify(account));
      } catch (err) { /* storage unavailable */ }

      showToast("Account created. Redirecting to the login page…");
      window.setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    }
  });

  /* -------------------------------------------------------------
     Magnetic buttons (login / signup submit + google)
     ------------------------------------------------------------- */
  var magneticBtns = document.querySelectorAll("[data-magnetic]");
  magneticBtns.forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      if (reduced || !g) return;
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
      g.to(el, { x: dx, y: dy, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", function () {
      if (reduced || !g) return;
      g.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    });
  });
})();
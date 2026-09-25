/* ===================== PRELOADER ===================== */
(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const MIN_DELAY = 900;
  const startTime = Date.now();
  const overflowBefore = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  function hidePreloader() {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, MIN_DELAY - elapsed);

    window.setTimeout(() => {
      preloader.classList.add("preloader--hidden");
      document.body.style.overflow = overflowBefore;

      window.setTimeout(() => {
        if (preloader && preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 900);
    }, delay);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    hidePreloader();
  } else {
    window.addEventListener("load", hidePreloader, { once: true });
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && preloader.parentNode) {
      preloader.classList.add("preloader--hidden");
      document.body.style.overflow = overflowBefore;
      preloader.parentNode.removeChild(preloader);
    }
  });
})();
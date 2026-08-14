(function (global) {
  "use strict";

  const CDN = {
    gsap: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
    scrollTrigger: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"
  };

  let loadPromise = null;
  const contexts = [];

  function prefersReduced() {
    return global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isLowPower() {
    const cores = global.navigator.hardwareConcurrency || 8;
    const saveData = global.navigator.connection?.saveData;
    const narrow = global.innerWidth < 768;
    return Boolean(saveData || cores <= 4 || narrow);
  }

  function canUseGsap() {
    return !prefersReduced() && !isLowPower();
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve());
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadGsap() {
    if (!canUseGsap()) return Promise.resolve(null);
    if (global.gsap && global.ScrollTrigger) return Promise.resolve(global.gsap);
    if (!loadPromise) {
      loadPromise = loadScript(CDN.gsap)
        .then(() => loadScript(CDN.scrollTrigger))
        .then(() => {
          global.gsap.registerPlugin(global.ScrollTrigger);
          return global.gsap;
        })
        .catch(() => null);
    }
    return loadPromise;
  }

  function registerContext(ctx) {
    contexts.push(ctx);
  }

  function cleanup() {
    contexts.forEach((ctx) => {
      try {
        ctx.revert();
      } catch (_) { /* noop */ }
    });
    contexts.length = 0;
    if (global.ScrollTrigger) global.ScrollTrigger.getAll().forEach((st) => st.kill());
  }

  function initSections(selector, initFn) {
    if (!canUseGsap()) return;
    const sections = [...document.querySelectorAll(selector)];
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        loadGsap().then((gsap) => {
          if (!gsap) return;
          const ctx = gsap.context(() => initFn(entry.target, gsap, global.ScrollTrigger));
          registerContext(ctx);
        });
      });
    }, { rootMargin: "100px 0px", threshold: 0.05 });

    sections.forEach((section) => observer.observe(section));
  }

  global.addEventListener("pagehide", cleanup);

  global.IBTIKAR_GSAP = {
    canUseGsap,
    loadGsap,
    initSections,
    cleanup,
    prefersReduced,
    isLowPower
  };
})(window);

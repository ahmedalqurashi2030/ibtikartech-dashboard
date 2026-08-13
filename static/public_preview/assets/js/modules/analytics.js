(function (global) {
  "use strict";

  const cfg = global.IBTIKAR_CONFIG || {};
  let initialized = false;

  function track(eventName, params) {
    const payload = { event: eventName, ...params, ts: Date.now() };
    if (global.dataLayer) global.dataLayer.push(payload);
    if (global.gtag) global.gtag("event", eventName, params || {});
  }

  function init() {
    if (initialized) return;
    initialized = true;
    document.addEventListener("click", (event) => {
      const el = event.target.closest("[data-analytics]");
      if (!el) return;
      track(el.dataset.analytics, {
        label: el.dataset.analyticsLabel || el.textContent?.trim()?.slice(0, 80),
        href: el.getAttribute("href") || null
      });
    });

    document.querySelectorAll("a[href*='wa.me']").forEach((link) => {
      if (!link.dataset.analytics) {
        link.dataset.analytics = cfg.events?.whatsappClick || "whatsapp_click";
      }
    });
  }

  global.IBTIKAR_ANALYTICS = { track, init };
})(window);

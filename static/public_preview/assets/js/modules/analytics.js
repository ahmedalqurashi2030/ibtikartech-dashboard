(function (global) {
  "use strict";

  const cfg = global.IBTIKAR_CONFIG || {};
  let initialized = false;

  function track(eventName, params) {
    const payload = { event: eventName, ...params, ts: Date.now() };
    if (global.dataLayer) global.dataLayer.push(payload);
    if (global.gtag) global.gtag("event", eventName, params || {});
    const endpoint = cfg.analytics?.collectEndpoint;
    if (endpoint && eventName) {
      const search = new URLSearchParams(global.location.search);
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        keepalive: true,
        body: JSON.stringify({
          event_name: eventName,
          page_path: global.location.pathname,
          referrer: document.referrer || "",
          utm_source: search.get("utm_source") || "",
          utm_medium: search.get("utm_medium") || "",
          utm_campaign: search.get("utm_campaign") || "",
          metadata: params || {}
        })
      }).catch(() => {});
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    document.addEventListener("click", (event) => {
      const el = event.target.closest("[data-analytics]");
      if (!el) return;
      track(el.dataset.analytics, {
        label: el.dataset.analyticsLabel || el.textContent?.trim()?.slice(0, 80),
        destination: el.dataset.analyticsDestination || el.getAttribute("href") || null
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

(() => {
  const endpoint = "/analytics/events/collect/";
  const params = new URLSearchParams(window.location.search);
  const basePayload = () => ({
    page_path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer: document.referrer.slice(0, 500),
    utm_source: (params.get("utm_source") || "").slice(0, 120),
    utm_medium: (params.get("utm_medium") || "").slice(0, 120),
    utm_campaign: (params.get("utm_campaign") || "").slice(0, 160),
  });

  const track = (eventName, metadata = {}, serviceId = "") => {
    const payload = {
      ...basePayload(),
      event_name: eventName,
      metadata,
    };
    if (serviceId) payload.service_id = serviceId;

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  window.IbtikarAnalytics = { track };

  document.addEventListener("DOMContentLoaded", () => {
    track("page_view");
    document.querySelectorAll("[data-analytics-event]").forEach((element) => {
      element.addEventListener("click", () => {
        track(
          element.dataset.analyticsEvent,
          { label: element.dataset.analyticsLabel || "" },
          element.dataset.serviceId || "",
        );
      });
    });
  });
})();

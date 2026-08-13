(function (global) {
  "use strict";

  const gsapApi = global.IBTIKAR_GSAP;

  function initHomeHero(section, gsap) {
    const orbit = section.querySelector(".service-orbit, .hero-dashboard, .hero-visual");
    if (!orbit) return;
    gsap.to(orbit, {
      y: -24,
      duration: 1.2,
      ease: "power2.out"
    });
  }

  function initTharaaExperience(section, gsap, ScrollTrigger) {
    const mockup = section.querySelector(".browser-mockup, .tharaa-visual");
    if (!mockup) return;
    gsap.from(mockup, {
      y: 40,
      opacity: 0.6,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none reverse"
      }
    });
  }

  function init() {
    if (!gsapApi?.canUseGsap()) return;

    gsapApi.initSections("[data-gsap-section='hero']", (el, gsap) => initHomeHero(el, gsap));
    gsapApi.initSections("[data-gsap-section='tharaa']", (el, gsap, ST) => initTharaaExperience(el, gsap, ST));
    gsapApi.initSections("[data-gsap-section='journey']", (el, gsap, ST) => {
      const steps = el.querySelectorAll(".process-step, .journey-step");
      if (!steps.length) return;
      gsap.from(steps, {
        y: 20,
        opacity: 0.5,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 70%" }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);

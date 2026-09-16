(() => {
  'use strict';

  if (window.__ibtikarRevealRuntime) return;
  window.__ibtikarRevealRuntime = true;

  const items = [...document.querySelectorAll('.reveal')];
  if (!items.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = (item) => item.classList.add('in', 'is-visible', 'visible');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(reveal);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.06,
    rootMargin: '110px 0px -4% 0px',
  });

  items.forEach((item) => observer.observe(item));

  // Safety for first-view content if layout settles after fonts/images.
  window.setTimeout(() => {
    items.forEach((item) => {
      if (item.classList.contains('in') || item.classList.contains('is-visible')) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.25 && rect.bottom > -80) {
        reveal(item);
        observer.unobserve(item);
      }
    });
  }, 1000);
})();

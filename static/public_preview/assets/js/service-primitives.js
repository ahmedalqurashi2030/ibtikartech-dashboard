/*
 * Ibtikar Tech — Service Primitives JS
 * Shared, progressive-enhancement interactions for service pages.
 * Decision tabs intentionally remain owned by commerce-service-detail.js.
 */

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const initInlineNavigation = (root) => {
    const links = [...root.querySelectorAll('.service-page-nav a, .service-page-nav a, .commerce-category-nav a')]
      .filter((link) => link.hash && link.origin === window.location.origin && link.pathname === window.location.pathname);
    if (!links.length || !('IntersectionObserver' in window)) return;

    const targets = links
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter(Boolean);
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;

      links.forEach((link) => {
        const active = link.hash === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'location');
          link.scrollIntoView({
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    targets.forEach((target) => observer.observe(target));
  };

  const initStickyCta = (root) => {
    const stickyCta = root.querySelector('.service-sticky-cta');
    const pageCta = root.querySelector('.page-cta, .page-cta');
    const heroActions = root.querySelector('.service-commerce-actions, .platform-actions, .service-commerce-actions');
    if (!stickyCta || !pageCta || !heroActions || stickyCta.dataset.svcReady === 'true') return;

    stickyCta.dataset.svcReady = 'true';
    let frameRequested = false;

    const setVisible = (visible) => {
      stickyCta.classList.toggle('is-visible', visible);
      stickyCta.setAttribute('aria-hidden', String(!visible));
      stickyCta.toggleAttribute('inert', !visible);
      document.body.classList.toggle('service-sticky-cta-visible', visible);
    };

    const checkVisibility = () => {
      frameRequested = false;
      const heroPassed = heroActions.getBoundingClientRect().bottom < 0;
      const finalCtaBelowViewport = pageCta.getBoundingClientRect().top > window.innerHeight;
      setVisible(heroPassed && finalCtaBelowViewport);
    };

    const requestCheck = () => {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(checkVisibility);
    };

    window.addEventListener('scroll', requestCheck, { passive: true });
    window.addEventListener('resize', requestCheck, { passive: true });
    checkVisibility();
  };

  const initHotspots = (root) => {
    const hotspots = [...root.querySelectorAll('.service-hotspot')];
    if (!hotspots.length) return;

    const infoFor = (hotspot) => {
      const controlledId = hotspot.getAttribute('aria-controls');
      return controlledId ? document.getElementById(controlledId) : hotspot.nextElementSibling;
    };

    const setExpanded = (hotspot, expanded) => {
      const info = infoFor(hotspot);
      hotspot.setAttribute('aria-expanded', String(expanded));
      if (info?.classList.contains('service-hotspot-info')) info.hidden = !expanded;
    };

    const closeAll = (except = null) => {
      hotspots.forEach((hotspot) => {
        if (hotspot !== except) setExpanded(hotspot, false);
      });
    };

    hotspots.forEach((hotspot, index) => {
      if (hotspot.dataset.svcReady === 'true') return;
      hotspot.dataset.svcReady = 'true';
      hotspot.type = 'button';

      const info = infoFor(hotspot);
      if (info?.classList.contains('service-hotspot-info')) {
        if (!info.id) info.id = `service-hotspot-info-${index + 1}`;
        hotspot.setAttribute('aria-controls', info.id);
        info.hidden = hotspot.getAttribute('aria-expanded') !== 'true';
      }

      hotspot.addEventListener('click', (event) => {
        event.stopPropagation();
        const shouldExpand = hotspot.getAttribute('aria-expanded') !== 'true';
        closeAll(hotspot);
        setExpanded(hotspot, shouldExpand);
      });

      hotspot.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        setExpanded(hotspot, false);
        hotspot.focus();
      });
    });

    if (document.body.dataset.svcHotspotDismissReady !== 'true') {
      document.body.dataset.svcHotspotDismissReady = 'true';
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.service-anatomy-layout')) closeAll();
      });
    }
  };

  const initFaqs = (root) => {
    const faqs = [...root.querySelectorAll('details.service-faq-item')];
    faqs.forEach((faq) => {
      if (faq.dataset.svcReady === 'true') return;
      faq.dataset.svcReady = 'true';
      faq.addEventListener('toggle', () => {
        if (!faq.open) return;
        faqs.forEach((otherFaq) => {
          if (otherFaq !== faq) otherFaq.open = false;
        });
      });
    });
  };

  const init = (root = document) => {
    initInlineNavigation(root);
    initStickyCta(root);
    initHotspots(root);
    initFaqs(root);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }

  document.addEventListener('htmx:afterSwap', (event) => init(event.target));
})();

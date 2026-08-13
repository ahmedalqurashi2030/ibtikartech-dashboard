(() => {
  document.documentElement.classList.add('js-ready');

  // Compatibility guard for legacy approved-source canvas drawings. Some old
  // responsive geometry can produce a negative corner radius on narrow screens.
  // Clamp only invalid radii; valid drawings keep their original geometry.
  if (window.CanvasRenderingContext2D && !window.__ibtikarSafeArcTo) {
    window.__ibtikarSafeArcTo = true;
    const proto = CanvasRenderingContext2D.prototype;
    const nativeArcTo = proto.arcTo;
    proto.arcTo = function safeArcTo(x1, y1, x2, y2, radius) {
      const safeRadius = Number.isFinite(Number(radius)) ? Math.max(0, Number(radius)) : 0;
      return nativeArcTo.call(this, x1, y1, x2, y2, safeRadius);
    };
  }

  // Tharaa's preserved legacy animation script still references a removed
  // horizontal-library track on desktop. Provide a non-visual compatibility
  // target so ScrollTrigger never dereferences null; it is excluded from a11y.
  if (document.body.classList.contains('source-tharaa') && !document.querySelector('#libraryTrack')) {
    const guard = document.createElement('div');
    guard.className = 'library ibt-legacy-animation-guard';
    guard.dataset.ibtLegacyAnimationGuard = 'true';
    guard.setAttribute('aria-hidden', 'true');
    guard.style.cssText = 'position:absolute;inset:0 auto auto 0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;';
    const track = document.createElement('div');
    track.id = 'libraryTrack';
    track.style.cssText = 'width:calc(100vw + 320px);height:1px;';
    guard.appendChild(track);
    document.body.appendChild(guard);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('main section:not(:first-child) img').forEach((image) => {
    if (!image.hasAttribute('loading')) image.loading = 'lazy';
    if (!image.hasAttribute('decoding')) image.decoding = 'async';
  });

  document.querySelectorAll('img:not([alt])').forEach((image) => image.setAttribute('alt', ''));

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (revealItems.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('in'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '120px 0px', threshold: 0.04 });

      revealItems.forEach((item) => revealObserver.observe(item));
      window.setTimeout(() => {
        document.querySelectorAll('.reveal:not(.in)').forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.top < window.innerHeight * 1.25) item.classList.add('in');
        });
      }, 1200);
    }
  }

  const announcement = document.querySelector('body.source-home > .ibtx-announcement');
  if (announcement && !announcement.dataset.enhanced) {
    const inner = announcement.querySelector('.ibtx-announcement__inner');
    const message = inner?.querySelector(':scope > span');

    if (inner && message) {
      const viewport = document.createElement('div');
      const track = document.createElement('div');
      const firstSet = document.createElement('span');
      const secondSet = document.createElement('span');
      const pauseButton = document.createElement('button');

      viewport.className = 'ibtx-announcement__viewport';
      track.className = 'ibtx-announcement__track';
      firstSet.className = 'ibtx-announcement__set';
      secondSet.className = 'ibtx-announcement__set';
      pauseButton.className = 'ibtx-announcement__toggle';
      pauseButton.type = 'button';
      pauseButton.textContent = '❚❚';
      pauseButton.setAttribute('aria-label', 'إيقاف الشريط المتحرك');

      const appendMessage = (set, hidden = false) => {
        const copy = message.cloneNode(true);
        const dot = document.createElement('i');
        dot.setAttribute('aria-hidden', 'true');
        set.append(copy, dot);
        if (hidden) set.setAttribute('aria-hidden', 'true');
      };

      appendMessage(firstSet);
      appendMessage(secondSet, true);
      track.append(firstSet, secondSet);
      viewport.append(track);
      message.replaceWith(viewport);
      viewport.after(pauseButton);
      announcement.dataset.enhanced = 'true';

      pauseButton.addEventListener('click', () => {
        const paused = announcement.classList.toggle('is-paused');
        pauseButton.textContent = paused ? '▶' : '❚❚';
        pauseButton.setAttribute('aria-label', paused ? 'تشغيل الشريط المتحرك' : 'إيقاف الشريط المتحرك');
        pauseButton.setAttribute('aria-pressed', String(paused));
      });

      document.addEventListener('visibilitychange', () => {
        announcement.classList.toggle('is-page-hidden', document.hidden);
      });
    }
  }

  document.querySelectorAll('.faq, .faq-item').forEach((item, index) => {
    const button = item.querySelector(':scope > button, :scope > * > button');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;

    if (!answer.id) answer.id = `approved-faq-answer-${index + 1}`;
    button.setAttribute('aria-controls', answer.id);
    answer.setAttribute('role', 'region');

    const syncAccordion = () => {
      const expanded = item.classList.contains('open') || item.classList.contains('active');
      button.setAttribute('aria-expanded', String(expanded));
      answer.setAttribute('aria-hidden', String(!expanded));
    };

    syncAccordion();
    button.addEventListener('click', () => requestAnimationFrame(syncAccordion));
    new MutationObserver(syncAccordion).observe(item, { attributes: true, attributeFilter: ['class'] });
  });

  const studioSwatches = [...document.querySelectorAll('#studioSwatches button[data-studio]')];
  if (studioSwatches.length) {
    const syncSwatches = () => studioSwatches.forEach((swatch) => {
      const color = swatch.dataset.studio || '';
      swatch.setAttribute('aria-label', `اختيار اللون ${color}`);
      swatch.setAttribute('aria-pressed', String(swatch.classList.contains('active')));
    });
    syncSwatches();
    studioSwatches.forEach((swatch) => swatch.addEventListener('click', () => requestAnimationFrame(syncSwatches)));
  }

  const decisionTabs = document.querySelector('.decision-tabs');
  if (decisionTabs) {
    const tabs = [...decisionTabs.querySelectorAll('[data-decision-tab]')];
    const panels = [...document.querySelectorAll('[data-decision-panel]')];
    decisionTabs.setAttribute('role', 'tablist');

    const syncTabs = () => {
      tabs.forEach((tab, index) => {
        const key = tab.dataset.decisionTab;
        const panel = panels.find((candidate) => candidate.dataset.decisionPanel === key);
        const active = tab.classList.contains('is-active');
        if (!tab.id) tab.id = `decision-tab-${index + 1}`;
        if (panel && !panel.id) panel.id = `decision-panel-${index + 1}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (panel) {
          tab.setAttribute('aria-controls', panel.id);
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', tab.id);
          panel.tabIndex = 0;
        }
      });
    };

    syncTabs();
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      requestAnimationFrame(() => {
        syncTabs();
        tab.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      });
    }));

    decisionTabs.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next = current;
      if (event.key === 'ArrowLeft') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowRight') next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === current) return;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });
  }

  if (document.body.classList.contains('source-services')) {
    if (!document.querySelector('link[data-services-experience]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/static/public_preview/assets/css/pages/services-experience.css';
      link.dataset.servicesExperience = 'true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-services-experience]')) {
      const script = document.createElement('script');
      script.src = '/static/public_preview/assets/js/services-experience.js';
      script.async = false;
      script.dataset.servicesExperience = 'true';
      document.body.appendChild(script);
    }
  }

  if (document.body.classList.contains('source-ecommerce')) {
    const detailRoutes = new Map([
      ['service-launch', 'store-launch.html'],
      ['service-customize', 'storefront-customization.html'],
      ['service-redesign', 'store-redesign.html'],
      ['service-product', 'product-page-optimization.html'],
      ['service-growth', 'ecommerce-growth.html'],
      ['service-support', 'ecommerce-support.html']
    ]);

    detailRoutes.forEach((href, id) => {
      const card = document.getElementById(id);
      const serviceLink = card?.querySelector('.commerce-service-card__footer a');
      if (!serviceLink) return;
      serviceLink.href = href;
      serviceLink.textContent = 'تفاصيل الخدمة';
      serviceLink.setAttribute('aria-label', `فتح تفاصيل ${card.querySelector('h3')?.textContent?.trim() || 'الخدمة'}`);
    });

    const platformSection = document.querySelector('#platforms');
    const platformIntro = platformSection?.querySelector('.platform-heading p');
    if (platformIntro) {
      platformIntro.textContent = 'المنصة عامل تنفيذ داخل الخدمة. نحدد الأنسب وفق تشغيل مشروعك وحدود التخصيص، وتظهر خبرة المنصة داخل نطاق الخدمة نفسها.';
    }
    platformSection?.querySelectorAll('.platform-card').forEach((card) => {
      const link = card.querySelector('a');
      if (!link) return;
      link.href = '#subservices';
      link.textContent = 'استكشف الخدمات المناسبة';
      link.setAttribute('aria-label', `استكشف خدمات المتاجر المناسبة لـ ${card.querySelector('h3')?.textContent?.trim() || 'هذه المنصة'}`);
    });

    const finalSecondaryCta = document.querySelector('.page-cta .cta-actions .btn-outline');
    if (finalSecondaryCta) {
      finalSecondaryCta.href = '#platforms';
      finalSecondaryCta.textContent = 'المنصات التي نعمل عليها';
    }

    if (!document.querySelector('link[data-ecommerce-experience]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/static/public_preview/assets/css/pages/ecommerce-experience-lab.css';
      link.dataset.ecommerceExperience = 'true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-ecommerce-experience]')) {
      const script = document.createElement('script');
      script.src = '/static/public_preview/assets/js/ecommerce-category.js';
      script.async = false;
      script.dataset.ecommerceExperience = 'true';
      document.body.appendChild(script);
    }
  }
})();
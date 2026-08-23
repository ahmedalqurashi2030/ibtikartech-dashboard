(() => {
  'use strict';

  const relatedSelectors = '.related-nav, .product-related-section .related-grid, .service-related-grid';
  if (!document.querySelector(relatedSelectors)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const routeCatalog = new Map([
    ['/', ['ابتكار تك', 'ارجع إلى الواجهة الرئيسية لاستكشاف المنظومة والمنتجات والخدمات.', '/static/public_preview/assets/images/showcase/services-experience-source.png']],
    ['/services', ['الحلول والخدمات', 'استعرض منظومة الخدمات كاملة واختر نقطة البداية الأقرب لهدف مشروعك.', '/static/public_preview/assets/images/showcase/services-experience-source.png']],
    ['/ecommerce', ['التجارة الإلكترونية', 'بناء وتطوير المتاجر من الإطلاق والواجهة إلى تجربة الشراء والقياس والنمو.', '/static/public_preview/assets/images/showcase/ecommerce-experience-source.png']],
    ['/websites', ['تجربة الويب', 'مواقع وصفحات هبوط عربية واضحة وسريعة تقود الزائر إلى الإجراء المناسب.', '/static/public_preview/assets/images/services/discovery/web-experience.svg']],
    ['/brand-content', ['الهوية والمحتوى', 'هوية بصرية ومحتوى رقمي متماسك يربط العلامة بكل نقاط الاتصال.', '/static/public_preview/assets/images/services/discovery/brand-content.svg']],
    ['/growth', ['الظهور والنمو', 'SEO وقياس وتحليلات وتحسينات مرتبة حسب البيانات والأثر المتوقع.', '/static/public_preview/assets/images/services/discovery/growth-measurement.svg']],
    ['/custom-systems', ['الأنظمة والأتمتة', 'أنظمة مخصصة وربط وأتمتة تقلل العمل اليدوي وتربط البيانات والعمليات.', '/static/public_preview/assets/images/services/discovery/automation-connect.svg']],
    ['/services/store-launch', ['STORE LAUNCH', 'إطلاق متجر من الهيكل والواجهة والمحتوى حتى الاختبار والاستعداد للنشر.', '/static/public_preview/assets/images/services/ecommerce/store-launch.svg']],
    ['/services/storefront-customization', ['STOREFRONT', 'تخصيص واجهة المتجر والثيم وترتيب الأقسام بما يعكس مستوى وهوية العلامة.', '/static/public_preview/assets/images/services/ecommerce/storefront-customization.svg']],
    ['/services/store-redesign', ['REDESIGN', 'إعادة بناء تجربة متجر قائم عندما تصبح التعديلات الصغيرة غير كافية.', '/static/public_preview/assets/images/services/ecommerce/store-redesign.svg']],
    ['/services/product-page-optimization', ['CONVERSION UX', 'تحسين الصور والمعلومات والثقة والخيارات والإجراء الأساسي في صفحة المنتج.', '/static/public_preview/assets/images/services/ecommerce/product-experience.svg']],
    ['/services/ecommerce-growth', ['CONNECT + GROW', 'ربط القياس والتحليلات وSEO والتكاملات بما يدعم قرارات نمو أوضح.', '/static/public_preview/assets/images/services/ecommerce/connect-growth.svg']],
    ['/services/ecommerce-support', ['CONTINUITY', 'دعم وتطوير مستمر للمتجر ضمن نطاق واضح بدل التعديلات المتفرقة.', '/static/public_preview/assets/images/services/ecommerce/ongoing-support.svg']],
  ]);

  const fallback = [
    'خدمة مرتبطة',
    'مسار مكمل يمكن دمجه مع احتياج مشروعك حسب النطاق والأولوية.',
    '/static/public_preview/assets/images/showcase/services-experience-source.png',
  ];

  function canonicalPath(href) {
    try {
      const url = new URL(href, location.href);
      let pathname = url.pathname.replace(/\/+$/, '') || '/';
      const file = pathname.split('/').pop() || '';
      if (file.endsWith('.html')) {
        const slug = file.slice(0, -5);
        const serviceSlugs = new Set([
          'store-launch', 'storefront-customization', 'store-redesign',
          'product-page-optimization', 'ecommerce-growth', 'ecommerce-support',
        ]);
        if (slug === 'index') pathname = '/';
        else if (serviceSlugs.has(slug)) pathname = `/services/${slug}`;
        else pathname = `/${slug}`;
      }
      return pathname;
    } catch (_) {
      return '';
    }
  }

  function createCard({ href, title, label, description, image, imageAlt = '' }) {
    const article = document.createElement('article');
    article.className = 'service-related-card';
    article.setAttribute('role', 'listitem');

    const link = document.createElement('a');
    link.className = 'service-related-card__link';
    link.href = href;
    link.setAttribute('aria-label', `استكشف ${title}`);

    const media = document.createElement('figure');
    media.className = 'service-related-card__media';
    const img = document.createElement('img');
    img.src = image || fallback[2];
    img.alt = imageAlt || `معاينة توضيحية لخدمة ${title}`;
    img.width = 800;
    img.height = 500;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.appendChild(img);

    const content = document.createElement('div');
    content.className = 'service-related-card__body';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'service-related-card__eyebrow';
    eyebrow.textContent = label || fallback[0];
    const heading = document.createElement('h3');
    heading.textContent = title;
    const copy = document.createElement('p');
    copy.textContent = description || fallback[1];
    const action = document.createElement('span');
    action.className = 'service-related-card__action';
    action.innerHTML = '<span>استكشف الخدمة</span><b aria-hidden="true">←</b>';
    content.append(eyebrow, heading, copy, action);
    link.append(media, content);
    article.appendChild(link);
    return article;
  }

  function descriptorFromLink(link) {
    const catalog = routeCatalog.get(canonicalPath(link.getAttribute('href') || link.href)) || fallback;
    return {
      href: link.getAttribute('href') || link.href,
      title: (link.textContent || '').replace(/\s+/g, ' ').trim() || 'خدمة مرتبطة',
      label: catalog[0],
      description: catalog[1],
      image: catalog[2],
    };
  }

  function createControls(cards) {
    const controls = document.createElement('div');
    controls.className = 'service-related-carousel__controls';
    controls.setAttribute('aria-label', 'التنقل بين الخدمات المرتبطة');
    controls.innerHTML = `
      <div class="service-related-carousel__status" aria-live="polite" aria-atomic="true">
        <strong data-related-current>01</strong><span>/</span><span>${String(cards.length).padStart(2, '0')}</span>
      </div>
      <div class="service-related-carousel__buttons">
        <button type="button" data-related-prev aria-label="الخدمات السابقة">→</button>
        <button type="button" data-related-next aria-label="الخدمات التالية">←</button>
      </div>`;
    return controls;
  }

  function enhanceCarousel(track) {
    if (!track || track.dataset.relatedCarouselReady === 'true') return;
    const cards = [...track.querySelectorAll(':scope > .service-related-card')];
    if (cards.length < 2) return;

    track.dataset.relatedCarouselReady = 'true';
    track.classList.add('service-related-cards--carousel');
    track.tabIndex = 0;
    track.setAttribute('aria-roledescription', 'carousel');
    track.setAttribute('aria-label', track.getAttribute('aria-label') || 'الخدمات المرتبطة — اسحب أو استخدم الأسهم للتنقل');

    cards.forEach((card, index) => {
      card.setAttribute('aria-setsize', String(cards.length));
      card.setAttribute('aria-posinset', String(index + 1));
      card.setAttribute('aria-roledescription', 'شريحة خدمة');
    });

    const controls = createControls(cards);
    const parent = track.parentElement;
    const heading = parent?.querySelector(':scope > .service-detail-heading, :scope > .platform-heading');
    if (heading && !parent.querySelector(':scope > .service-related-carousel__header')) {
      const header = document.createElement('div');
      header.className = 'service-related-carousel__header';
      heading.before(header);
      header.append(heading, controls);
    } else {
      track.before(controls);
    }

    const current = controls.querySelector('[data-related-current]');
    const prev = controls.querySelector('[data-related-prev]');
    const next = controls.querySelector('[data-related-next]');
    let activeIndex = 0;
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;
    let suppressClickUntil = 0;

    const visibleCount = () => {
      const first = cards[0];
      if (!first) return 1;
      const width = first.getBoundingClientRect().width;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      return Math.max(1, Math.min(cards.length, Math.floor((track.clientWidth + gap + 1) / (width + gap))));
    };
    const maxIndex = () => Math.max(0, cards.length - visibleCount());

    function syncState(index) {
      activeIndex = Math.max(0, Math.min(maxIndex(), index));
      if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
      if (prev) prev.disabled = activeIndex <= 0;
      if (next) next.disabled = activeIndex >= maxIndex();
      const count = visibleCount();
      cards.forEach((card, cardIndex) => {
        card.classList.toggle('is-visible-slide', cardIndex >= activeIndex && cardIndex < activeIndex + count);
      });
    }

    function nearestLeadingIndex() {
      const trackRect = track.getBoundingClientRect();
      const rtl = getComputedStyle(track).direction === 'rtl';
      const leading = rtl ? trackRect.right : trackRect.left;
      let nearest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const edge = rtl ? rect.right : rect.left;
        const value = Math.abs(edge - leading);
        if (value < distance) {
          distance = value;
          nearest = index;
        }
      });
      return Math.min(maxIndex(), nearest);
    }

    function goTo(index, focusLink = false) {
      const target = Math.max(0, Math.min(maxIndex(), index));
      const card = cards[target];
      if (!card) return;
      syncState(target);
      card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
      if (focusLink) card.querySelector('a')?.focus({ preventScroll: true });
    }

    prev?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(activeIndex + 1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); goTo(activeIndex - 1); }
      else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      else if (event.key === 'End') { event.preventDefault(); goTo(maxIndex()); }
    });

    let scrollTimer = 0;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => syncState(nearestLeadingIndex()), 70);
    }, { passive: true });

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
      moved = false;
      track.classList.add('is-dragging');
      try { track.setPointerCapture(pointerId); } catch (_) {}
    });
    track.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (!moved) return;
      const rtl = getComputedStyle(track).direction === 'rtl';
      track.scrollLeft = startScrollLeft + (rtl ? dx : -dx);
    });

    function finishDrag(event) {
      if (pointerId === null || (event.pointerId != null && event.pointerId !== pointerId)) return;
      const wasMoved = moved;
      try { track.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
      moved = false;
      track.classList.remove('is-dragging');
      if (wasMoved) {
        suppressClickUntil = performance.now() + 320;
        requestAnimationFrame(() => goTo(nearestLeadingIndex()));
      }
    }
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
    track.addEventListener('lostpointercapture', finishDrag);
    track.addEventListener('click', (event) => {
      if (performance.now() > suppressClickUntil) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => goTo(Math.min(activeIndex, maxIndex())), 100);
    }, { passive: true });
    syncState(0);
  }

  function replaceRelatedNav(nav) {
    if (!nav || nav.dataset.relatedCardsReady === 'true') return;
    const links = [...nav.querySelectorAll(':scope > a[href]')];
    if (!links.length) return;
    const track = document.createElement('div');
    track.className = 'service-related-cards';
    track.setAttribute('role', 'list');
    track.setAttribute('aria-label', nav.getAttribute('aria-label') || 'الخدمات المرتبطة');
    track.dataset.relatedCardsReady = 'true';
    links.map(descriptorFromLink).forEach((item) => track.appendChild(createCard(item)));
    nav.replaceWith(track);
    enhanceCarousel(track);
  }

  function replaceExistingRichGrid(grid) {
    if (!grid || grid.dataset.relatedCardsReady === 'true') return;
    const articles = [...grid.querySelectorAll(':scope > article')];
    if (!articles.length) return;
    const replacement = document.createElement('div');
    replacement.className = 'service-related-cards';
    replacement.setAttribute('role', 'list');
    replacement.setAttribute('aria-label', 'الخدمات المرتبطة');
    replacement.dataset.relatedCardsReady = 'true';

    articles.forEach((article) => {
      const link = article.querySelector('a[href]');
      if (!link) return;
      const catalog = routeCatalog.get(canonicalPath(link.getAttribute('href') || link.href)) || fallback;
      const image = article.querySelector('img');
      replacement.appendChild(createCard({
        href: link.getAttribute('href') || link.href,
        title: article.querySelector('h3')?.textContent?.trim() || link.textContent.trim(),
        label: article.querySelector(':scope > span')?.textContent?.trim() || catalog[0],
        description: article.querySelector('p')?.textContent?.trim() || catalog[1],
        image: image?.getAttribute('src') || catalog[2],
        imageAlt: image?.getAttribute('alt') || '',
      }));
    });

    if (replacement.children.length) {
      grid.replaceWith(replacement);
      enhanceCarousel(replacement);
    }
  }

  document.querySelectorAll('.related-nav').forEach(replaceRelatedNav);
  document.querySelectorAll('.product-related-section .related-grid, .service-related-grid').forEach(replaceExistingRichGrid);
  document.querySelectorAll('.service-related-cards').forEach(enhanceCarousel);
})();

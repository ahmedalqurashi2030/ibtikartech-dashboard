(() => {
  'use strict';

  const body = document.body;
  if (!body) return;

  const categoryPages = new Set(['websites', 'brand-content', 'growth', 'custom-systems']);
  const isSupportedPage = body.classList.contains('service-detail-page') || categoryPages.has(body.dataset.page || '');
  if (!isSupportedPage) return;

  const routeCatalog = new Map([
    ['/', {
      label: 'ابتكار تك',
      description: 'ارجع إلى الواجهة الرئيسية لاستكشاف المنظومة والمنتجات والخدمات.',
      image: '/static/public_preview/assets/images/showcase/services-experience-source.png'
    }],
    ['/services', {
      label: 'الحلول والخدمات',
      description: 'استعرض منظومة الخدمات كاملة واختر نقطة البداية الأقرب لهدف مشروعك.',
      image: '/static/public_preview/assets/images/showcase/services-experience-source.png'
    }],
    ['/ecommerce', {
      label: 'التجارة الإلكترونية',
      description: 'بناء وتطوير المتاجر من الإطلاق والواجهة إلى تجربة الشراء والقياس والنمو.',
      image: '/static/public_preview/assets/images/showcase/ecommerce-experience-source.png'
    }],
    ['/websites', {
      label: 'تجربة الويب',
      description: 'مواقع وصفحات هبوط عربية واضحة وسريعة تقود الزائر إلى الإجراء المناسب.',
      image: '/static/public_preview/assets/images/services/discovery/web-experience.svg'
    }],
    ['/brand-content', {
      label: 'الهوية والمحتوى',
      description: 'هوية بصرية ومحتوى رقمي متماسك يربط العلامة بكل نقاط الاتصال.',
      image: '/static/public_preview/assets/images/services/discovery/brand-content.svg'
    }],
    ['/growth', {
      label: 'الظهور والنمو',
      description: 'SEO وقياس وتحليلات وتحسينات مرتبة حسب البيانات والأثر المتوقع.',
      image: '/static/public_preview/assets/images/services/discovery/growth-measurement.svg'
    }],
    ['/custom-systems', {
      label: 'الأنظمة والأتمتة',
      description: 'أنظمة مخصصة وربط وأتمتة تقلل العمل اليدوي وتربط البيانات والعمليات.',
      image: '/static/public_preview/assets/images/services/discovery/automation-connect.svg'
    }],
    ['/services/store-launch', {
      label: 'STORE LAUNCH',
      description: 'إطلاق متجر من الهيكل والواجهة والمحتوى حتى الاختبار والاستعداد للنشر.',
      image: '/static/public_preview/assets/images/services/ecommerce/store-launch.svg'
    }],
    ['/services/storefront-customization', {
      label: 'STOREFRONT',
      description: 'تخصيص واجهة المتجر والثيم وترتيب الأقسام بما يعكس مستوى وهوية العلامة.',
      image: '/static/public_preview/assets/images/services/ecommerce/storefront-customization.svg'
    }],
    ['/services/store-redesign', {
      label: 'REDESIGN',
      description: 'إعادة بناء تجربة متجر قائم عندما تصبح التعديلات الصغيرة غير كافية.',
      image: '/static/public_preview/assets/images/services/ecommerce/store-redesign.svg'
    }],
    ['/services/product-page-optimization', {
      label: 'CONVERSION UX',
      description: 'تحسين الصور والمعلومات والثقة والخيارات والإجراء الأساسي في صفحة المنتج.',
      image: '/static/public_preview/assets/images/services/ecommerce/product-experience.svg'
    }],
    ['/services/ecommerce-growth', {
      label: 'CONNECT + GROW',
      description: 'ربط القياس والتحليلات وSEO والتكاملات بما يدعم قرارات نمو أوضح.',
      image: '/static/public_preview/assets/images/services/ecommerce/connect-growth.svg'
    }],
    ['/services/ecommerce-support', {
      label: 'CONTINUITY',
      description: 'دعم وتطوير مستمر للمتجر ضمن نطاق واضح بدل التعديلات المتفرقة.',
      image: '/static/public_preview/assets/images/services/ecommerce/ongoing-support.svg'
    }]
  ]);

  const fallback = {
    label: 'خدمة مرتبطة',
    description: 'مسار مكمل يمكن دمجه مع احتياج مشروعك حسب النطاق والأولوية.',
    image: '/static/public_preview/assets/images/showcase/services-experience-source.png'
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canonicalPath = (href) => {
    try {
      const url = new URL(href, location.href);
      let path = url.pathname.replace(/\/+$/, '') || '/';
      const file = path.split('/').pop() || '';
      if (file.endsWith('.html')) {
        const slug = file.slice(0, -5);
        const serviceFiles = new Set([
          'store-launch', 'storefront-customization', 'store-redesign',
          'product-page-optimization', 'ecommerce-growth', 'ecommerce-support'
        ]);
        if (slug === 'index') path = '/';
        else if (serviceFiles.has(slug)) path = `/services/${slug}`;
        else path = `/${slug}`;
      }
      return path;
    } catch (_) {
      return '';
    }
  };

  const createText = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text || '';
    return el;
  };

  const createCard = ({ href, title, label, description, image, imageAlt }) => {
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
    img.src = image || fallback.image;
    img.alt = imageAlt || `معاينة توضيحية لخدمة ${title}`;
    img.width = 800;
    img.height = 500;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.appendChild(img);

    const content = document.createElement('div');
    content.className = 'service-related-card__body';
    content.appendChild(createText('span', 'service-related-card__eyebrow', label || fallback.label));
    content.appendChild(createText('h3', '', title));
    content.appendChild(createText('p', '', description || fallback.description));

    const footer = document.createElement('span');
    footer.className = 'service-related-card__action';
    footer.appendChild(createText('span', '', 'استكشف الخدمة'));
    footer.appendChild(createText('b', '', '←'));
    content.appendChild(footer);

    link.append(media, content);
    article.appendChild(link);
    return article;
  };

  const descriptorFromLink = (link) => {
    const path = canonicalPath(link.getAttribute('href') || link.href);
    const catalog = routeCatalog.get(path) || fallback;
    return {
      href: link.getAttribute('href') || link.href,
      title: (link.textContent || '').replace(/\s+/g, ' ').trim() || 'خدمة مرتبطة',
      label: catalog.label,
      description: catalog.description,
      image: catalog.image
    };
  };

  const createControls = (cards) => {
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
  };

  const enhanceCarousel = (track) => {
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
    let scrollTimer = 0;
    let resizeTimer = 0;
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;
    let suppressClickUntil = 0;

    const visibleCount = () => {
      const first = cards[0];
      if (!first) return 1;
      const cardWidth = first.getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return Math.max(1, Math.min(cards.length, Math.floor((track.clientWidth + gap + 1) / (cardWidth + gap))));
    };

    const maxIndex = () => Math.max(0, cards.length - visibleCount());

    const syncState = (index) => {
      activeIndex = Math.max(0, Math.min(maxIndex(), index));
      if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
      if (prev) prev.disabled = activeIndex <= 0;
      if (next) next.disabled = activeIndex >= maxIndex();
      cards.forEach((card, cardIndex) => {
        const active = cardIndex >= activeIndex && cardIndex < activeIndex + visibleCount();
        card.classList.toggle('is-visible-slide', active);
      });
    };

    const nearestLeadingIndex = () => {
      const trackRect = track.getBoundingClientRect();
      const isRtl = getComputedStyle(track).direction === 'rtl';
      const leadingEdge = isRtl ? trackRect.right : trackRect.left;
      let nearest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardEdge = isRtl ? rect.right : rect.left;
        const value = Math.abs(cardEdge - leadingEdge);
        if (value < distance) {
          distance = value;
          nearest = index;
        }
      });
      return Math.min(maxIndex(), nearest);
    };

    const goTo = (index, { focus = false } = {}) => {
      const target = Math.max(0, Math.min(maxIndex(), index));
      const card = cards[target];
      if (!card) return;
      syncState(target);
      card.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'start'
      });
      if (focus) card.querySelector('a')?.focus({ preventScroll: true });
    };

    prev?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));

    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex + 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(maxIndex());
      }
    });

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
      const isRtl = getComputedStyle(track).direction === 'rtl';
      track.scrollLeft = startScrollLeft + (isRtl ? dx : -dx);
    });

    const finishDrag = (event) => {
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
    };

    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
    track.addEventListener('lostpointercapture', finishDrag);
    track.addEventListener('click', (event) => {
      if (performance.now() > suppressClickUntil) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        syncState(Math.min(activeIndex, maxIndex()));
        goTo(activeIndex);
      }, 100);
    }, { passive: true });

    syncState(0);
  };

  const replaceRelatedNav = (nav) => {
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
  };

  const replaceExistingRichGrid = (grid) => {
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
        label: article.querySelector(':scope > span')?.textContent?.trim() || catalog.label,
        description: article.querySelector('p')?.textContent?.trim() || catalog.description,
        image: image?.getAttribute('src') || catalog.image,
        imageAlt: image?.getAttribute('alt') || ''
      }));
    });

    if (replacement.children.length) {
      grid.replaceWith(replacement);
      enhanceCarousel(replacement);
    }
  };

  document.querySelectorAll('.related-nav').forEach(replaceRelatedNav);
  document.querySelectorAll('.product-related-section .related-grid, .service-related-grid').forEach(replaceExistingRichGrid);
  document.querySelectorAll('.service-related-cards').forEach(enhanceCarousel);
})();

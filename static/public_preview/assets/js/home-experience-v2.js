(() => {
  if (window.__ibtikarHomeExperienceV2) return;
  window.__ibtikarHomeExperienceV2 = true;

  const platformAssets = new Map([
    ['سلة', { key: 'salla', src: '/static/public_preview/assets/images/platforms/salla.svg', label: 'سلة' }],
    ['زد', { key: 'zid', src: '/static/public_preview/assets/images/platforms/zid.svg', label: 'زد' }],
    ['WooCommerce', { key: 'woocommerce', src: '/static/public_preview/assets/images/platforms/woocommerce.svg', label: 'WooCommerce' }],
    ['WordPress', { key: 'wordpress', src: '/static/public_preview/assets/images/platforms/wordpress.svg', label: 'WordPress' }],
    ['Shopify', { key: 'shopify', src: '/static/public_preview/assets/images/platforms/shopify.svg', label: 'Shopify' }],
    ['حلول مخصصة', { key: 'custom', src: '/static/public_preview/assets/images/platforms/custom-solutions.svg', label: 'حلول مخصصة' }]
  ]);

  function enhancePlatformLogos() {
    const track = document.querySelector('.platforms .platform-track');
    if (!track || track.dataset.realLogos === 'true') return;

    [...track.children].forEach((item) => {
      const name = (item.textContent || '').replace(/\s+/g, ' ').trim();
      const asset = platformAssets.get(name);
      if (!asset) return;

      item.dataset.platform = asset.key;
      item.textContent = '';
      const icon = document.createElement('span');
      icon.className = 'platform-logo-card__icon';
      icon.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img');
      image.src = asset.src;
      image.alt = '';
      image.width = 34;
      image.height = 34;
      image.decoding = 'async';
      icon.appendChild(image);
      const label = document.createElement('span');
      label.textContent = asset.label;
      item.append(icon, label);
    });

    track.dataset.realLogos = 'true';
  }

  function retireLegacyServicesMotion(section) {
    if (!section || section.dataset.legacyMotionRetired === 'true') return;
    section.dataset.legacyMotionRetired = 'true';

    const scrollTrigger = window.ScrollTrigger;
    if (!scrollTrigger?.getAll) return;

    scrollTrigger.getAll().forEach((trigger) => {
      const triggerElement = trigger?.trigger || trigger?.vars?.trigger;
      if (triggerElement === section || (triggerElement instanceof Element && section.contains(triggerElement))) {
        try { trigger.kill(false); } catch (_) {}
      }
    });

    requestAnimationFrame(() => {
      try { scrollTrigger.refresh(); } catch (_) {}
    });
  }

  function enhanceServicesSlider() {
    const section = document.querySelector('.services-cinema');
    const deck = section?.querySelector('.services-mobile-deck');
    const track = deck?.querySelector('.services-mobile-track');
    const cards = track ? [...track.querySelectorAll('.services-mobile-card')] : [];
    const toolbar = deck?.querySelector('.home-services-slider__toolbar');
    if (!section || !deck || !track || !toolbar || cards.length < 2 || section.dataset.sliderV2 === 'true') return;

    section.dataset.sliderV2 = 'true';
    section.classList.add('home-services-slider');
    section.setAttribute('aria-label', 'الحلول والخدمات — شرائح قابلة للسحب');
    track.setAttribute('aria-roledescription', 'carousel');
    track.setAttribute('aria-label', 'اسحب أو استخدم الأسهم للتنقل بين خدمات ابتكار تك');
    track.tabIndex = 0;

    retireLegacyServicesMotion(section);

    const current = toolbar.querySelector('[data-home-services-current]');
    const total = toolbar.querySelector('[data-home-services-total]');
    const prev = toolbar.querySelector('[data-home-services-prev]');
    const next = toolbar.querySelector('[data-home-services-next]');
    if (total) total.textContent = String(cards.length).padStart(2, '0');

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let frame = 0;
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    let suppressClickUntil = 0;
    let commandedIndex = null;
    let commandTimer = 0;

    cards.forEach((card, index) => {
      card.setAttribute('aria-setsize', String(cards.length));
      card.setAttribute('aria-posinset', String(index + 1));
      card.setAttribute('aria-roledescription', 'شريحة خدمة');
    });

    const syncState = (index, { announce = true } = {}) => {
      activeIndex = Math.max(0, Math.min(cards.length - 1, index));
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === activeIndex;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-current', active ? 'true' : 'false');
      });
      if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
      if (prev) prev.disabled = activeIndex === 0;
      if (next) next.disabled = activeIndex === cards.length - 1;
      if (!announce && current) current.setAttribute('aria-live', 'off');
      else if (current) current.removeAttribute('aria-live');
    };

    const targetLeft = (index) => {
      const card = cards[index];
      if (!card) return 0;
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const left = card.offsetLeft - cards[0].offsetLeft;
      return Math.max(0, Math.min(max, left));
    };

    const nearestIndex = () => {
      const left = track.scrollLeft;
      let nearest = 0;
      let distance = Infinity;
      cards.forEach((_, index) => {
        const value = Math.abs(targetLeft(index) - left);
        if (value < distance) {
          distance = value;
          nearest = index;
        }
      });
      return nearest;
    };

    const clearCommand = () => {
      commandedIndex = null;
      clearTimeout(commandTimer);
      commandTimer = 0;
    };

    const goTo = (index, { focus = false } = {}) => {
      const target = Math.max(0, Math.min(cards.length - 1, index));
      const left = targetLeft(target);
      commandedIndex = target;
      clearTimeout(commandTimer);
      syncState(target);
      track.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
      if (focus) cards[target].focus({ preventScroll: true });

      commandTimer = window.setTimeout(() => {
        if (commandedIndex !== target) return;
        track.scrollTo({ left, behavior: 'auto' });
        syncState(target, { announce: false });
        clearCommand();
      }, reducedMotion ? 80 : 820);
    };

    const syncFromScroll = () => {
      frame = 0;
      if (pointerId !== null) return;

      if (commandedIndex !== null) {
        const target = targetLeft(commandedIndex);
        if (Math.abs(track.scrollLeft - target) <= 4) {
          const settled = commandedIndex;
          clearCommand();
          syncState(settled, { announce: false });
        }
        return;
      }

      syncState(nearestIndex(), { announce: false });
    };

    track.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(syncFromScroll);
    }, { passive: true });

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
        goTo(cards.length - 1);
      }
    });

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      clearCommand();
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      moved = false;
      track.classList.add('is-dragging');
      track.setPointerCapture?.(pointerId);
    });

    track.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 7) moved = true;
      if (moved) track.scrollLeft = startScroll - dx;
    });

    const finishDrag = (event) => {
      if (pointerId === null || (event.pointerId != null && event.pointerId !== pointerId)) return;
      const wasMoved = moved;
      try { track.releasePointerCapture?.(pointerId); } catch (_) {}
      pointerId = null;
      moved = false;
      track.classList.remove('is-dragging');
      if (wasMoved) {
        suppressClickUntil = performance.now() + 360;
        requestAnimationFrame(() => goTo(nearestIndex()));
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

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        clearCommand();
        track.scrollTo({ left: targetLeft(activeIndex), behavior: 'auto' });
        syncState(activeIndex, { announce: false });
      }, 100);
    }, { passive: true });

    track.scrollLeft = 0;
    syncState(0, { announce: false });
  }

  function init() {
    const page = (document.body?.dataset.page || '').toLowerCase();
    const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (page !== 'index' && pathname !== 'index.html' && pathname !== '') return;
    enhancePlatformLogos();
    enhanceServicesSlider();
    setTimeout(() => {
      enhancePlatformLogos();
      enhanceServicesSlider();
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
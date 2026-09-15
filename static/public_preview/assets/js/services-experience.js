(() => {
  'use strict';

  if (!document.body.classList.contains('source-services')) return;
  if (window.__ibtikarServicesExperienceV7) return;
  window.__ibtikarServicesExperienceV7 = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initPrimaryCinemaNavigation() {
    const lab = document.querySelector('.services-primary-cinema');
    if (!lab) return;

    const items = [...lab.querySelectorAll('.service-item')];
    const buttons = [...lab.querySelectorAll('[data-cinema-chapter]')];
    if (!items.length || !buttons.length) return;

    const setActive = (activeItem) => {
      const activeIndex = Math.max(0, items.indexOf(activeItem));
      buttons.forEach((button, index) => {
        button.setAttribute('aria-current', String(index === activeIndex));
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const item = items[index];
        if (!item) return;
        item.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      });
    });

    const activeObserver = new MutationObserver(() => {
      setActive(items.find((item) => item.classList.contains('active')) || items[0]);
    });
    items.forEach((item) => {
      activeObserver.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
    setActive(items.find((item) => item.classList.contains('active')) || items[0]);
  }

  function initFastDiscovery() {
    const section = document.querySelector('[data-fast-discovery]');
    const track = section?.querySelector('.fast-discovery-track');
    const controls = section?.querySelector('.fast-discovery-controls');
    if (!section || !track || !controls || section.dataset.fastDiscoveryReady === 'true') return;

    const slides = [...track.querySelectorAll('.fast-discovery-slide')];
    const currentLabel = controls.querySelector('[data-fast-current]');
    const previousButton = controls.querySelector('[data-fast-prev]');
    const nextButton = controls.querySelector('[data-fast-next]');
    if (!slides.length || !currentLabel || !previousButton || !nextButton) return;

    section.dataset.fastDiscoveryReady = 'true';
    let activeIndex = 0;
    let dragMoved = false;
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let programmaticScrollUntil = 0;
    let scrollTimer = 0;

    const renderActive = (index) => {
      activeIndex = Math.max(0, Math.min(slides.length - 1, index));
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
      previousButton.disabled = activeIndex === 0;
      nextButton.disabled = activeIndex === slides.length - 1;
    };

    const syncActive = () => {
      if (!slides.length) return;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const scrollLeft = Math.max(0, track.scrollLeft);
      let nearest = 0;

      if (scrollLeft <= 3) {
        nearest = 0;
      } else if (maxScroll - scrollLeft <= 3) {
        nearest = slides.length - 1;
      } else {
        const trackRect = track.getBoundingClientRect();
        const center = trackRect.left + trackRect.width / 2;
        let nearestDistance = Infinity;
        slides.forEach((slide, index) => {
          const rect = slide.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - center);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = index;
          }
        });
      }

      renderActive(nearest);
    };

    const goTo = (index) => {
      const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
      renderActive(nextIndex);
      programmaticScrollUntil = performance.now() + (reducedMotion ? 100 : 420);
      slides[nextIndex]?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    };

    previousButton.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton.addEventListener('click', () => goTo(activeIndex + 1));

    track.addEventListener('scroll', () => {
      if (performance.now() < programmaticScrollUntil) return;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(syncActive, 80);
    }, { passive: true });

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      programmaticScrollUntil = 0;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      dragMoved = false;
      track.classList.add('is-dragging');
      try { track.setPointerCapture(pointerId); } catch (_) {}
    });

    track.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 5) dragMoved = true;
      if (dragMoved) track.scrollLeft = startScroll - delta;
    });

    const endDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      try { track.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
      track.classList.remove('is-dragging');
      window.setTimeout(syncActive, 30);
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', (event) => {
      if (!dragMoved) return;
      event.preventDefault();
      event.stopPropagation();
      dragMoved = false;
    }, true);
    track.addEventListener('wheel', () => { programmaticScrollUntil = 0; }, { passive: true });
    track.addEventListener('touchstart', () => { programmaticScrollUntil = 0; }, { passive: true });
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
        goTo(slides.length - 1);
      }
    });

    renderActive(0);
  }

  initPrimaryCinemaNavigation();
  initFastDiscovery();
})();

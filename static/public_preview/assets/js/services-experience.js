(() => {
  'use strict';

  if (!document.body.classList.contains('source-services')) return;
  if (window.__ibtikarServicesExperienceV6) return;
  window.__ibtikarServicesExperienceV6 = true;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  if (!main) return;

  const PRIMARY_FAMILIES = [
    { mode:'store', index:'01', title:'المتاجر الإلكترونية', href:'ecommerce.html' },
    { mode:'site', index:'02', title:'المواقع وصفحات الهبوط', href:'websites.html' },
    { mode:'brand', index:'03', title:'الهوية والمحتوى', href:'brand-content.html' },
    { mode:'growth', index:'04', title:'الظهور والقياس والنمو', href:'growth.html' },
    { mode:'app', index:'05', title:'الأنظمة والربط والأتمتة', href:'custom-systems.html#apps' }
  ];

  const DISCOVERY_SERVICES = [
    {
      family:'store', index:'01', eyebrow:'COMMERCE / LAUNCH', title:'إطلاق متجر إلكتروني',
      description:'تجهيز المتجر من الهيكل والصفحات والهوية التطبيقية حتى الاختبار قبل الإطلاق.',
      href:'store-launch.html', image:'/static/public_preview/assets/images/services/ecommerce/store-launch.svg',
      imageAlt:'تصميم توضيحي لخدمة إطلاق متجر إلكتروني', tags:['إطلاق','هيكلة','QA']
    },
    {
      family:'store', index:'02', eyebrow:'COMMERCE / UI', title:'تخصيص واجهة المتجر',
      description:'تطوير الواجهة والثيم والجوال بعد فحص الوضع الحالي والتعارضات وحدود المنصة.',
      href:'storefront-customization.html', image:'/static/public_preview/assets/images/services/ecommerce/storefront-customization.svg',
      imageAlt:'تصميم توضيحي لخدمة تخصيص واجهة متجر', tags:['Theme','UI','Mobile']
    },
    {
      family:'store', index:'03', eyebrow:'COMMERCE / REDESIGN', title:'إعادة تصميم متجر قائم',
      description:'إعادة ترتيب تجربة المتجر مع الحفاظ على ما يعمل وتحديد أثر التغيير قبل التنفيذ.',
      href:'store-redesign.html', image:'/static/public_preview/assets/images/services/ecommerce/store-redesign.svg',
      imageAlt:'تصميم توضيحي لخدمة إعادة تصميم متجر قائم', tags:['UX','Redesign','Audit']
    },
    {
      family:'store', index:'04', eyebrow:'CONVERSION UX', title:'تحسين صفحة المنتج',
      description:'ترتيب الصور والمعلومات والخيارات والثقة والإجراء الأساسي حول أسئلة العميل قبل الشراء.',
      href:'product-page-optimization.html', image:'/static/public_preview/assets/images/services/ecommerce/product-experience.svg',
      imageAlt:'تصميم توضيحي لتحسين تجربة صفحة المنتج', tags:['Product UX','CRO','Mobile']
    },
    {
      family:'site', index:'05', eyebrow:'WEB EXPERIENCE', title:'موقع أو صفحة هبوط',
      description:'محتوى وتجربة عربية واضحة تقود الزائر إلى تواصل أو طلب أو إجراء محدد.',
      href:'websites.html', image:'/static/public_preview/assets/images/services/discovery/web-experience.svg',
      imageAlt:'تصميم توضيحي لموقع وصفحة هبوط حديثة', tags:['Web','Landing','RTL']
    },
    {
      family:'brand', index:'06', eyebrow:'BRAND & CONTENT', title:'هوية ومحتوى رقمي',
      description:'نظام بصري ولفظي ومحتوى عربي متماسك يمكن تطبيقه على الموقع والمتجر ونقاط الاتصال.',
      href:'brand-content.html', image:'/static/public_preview/assets/images/services/discovery/brand-content.svg',
      imageAlt:'تصميم توضيحي للهوية والمحتوى الرقمي', tags:['Brand','Arabic','Content']
    },
    {
      family:'growth', index:'07', eyebrow:'VISIBILITY & MEASUREMENT', title:'SEO وقياس وتحسين',
      description:'أساس ظهور وقياس واضح ثم قائمة تحسين مرتبة حسب البيانات والأثر المتوقع.',
      href:'growth.html', image:'/static/public_preview/assets/images/services/discovery/growth-measurement.svg',
      imageAlt:'تصميم توضيحي للقياس والتحليلات والنمو', tags:['SEO','GA4','Backlog']
    },
    {
      family:'auto', index:'08', eyebrow:'AUTOMATION', title:'ربط وأتمتة العمليات',
      description:'ربط القنوات والبيانات والخطوات المتكررة لتقليل العمل اليدوي ضمن تدفق واضح.',
      href:'custom-systems.html#automation', image:'/static/public_preview/assets/images/services/discovery/automation-connect.svg',
      imageAlt:'تصميم توضيحي لربط الأنظمة والأتمتة', tags:['APIs','Automation','Webhooks']
    }
  ];

  function moveBeforeFinalSection(section) {
    const directSections = [...main.children].filter((node) => node.tagName === 'SECTION');
    const finalSection = directSections.at(-1);
    if (finalSection && finalSection !== section && section.nextElementSibling !== finalSection) {
      main.insertBefore(section, finalSection);
    }
  }

  function enhancePrimaryCinema() {
    const lab = main.querySelector('.service-lab');
    if (!lab || lab.dataset.primaryCinemaReady === 'true') return;
    lab.dataset.primaryCinemaReady = 'true';
    lab.classList.add('services-primary-cinema');
    lab.id = 'services';

    const heading = lab.querySelector('.heading');
    const kicker = heading?.querySelector('.kicker');
    const title = heading?.querySelector('h2');
    const description = heading?.querySelector('p');
    if (kicker) kicker.textContent = 'مجالات الخبرة';
    if (title) title.textContent = `${PRIMARY_FAMILIES.length} محاور رئيسية لبناء تجربة رقمية متكاملة.`;
    description?.remove();
    lab.querySelector('.stage-caption small')?.remove();

    const items = [...lab.querySelectorAll('.service-item')];
    items.forEach((item, index) => {
      const family = PRIMARY_FAMILIES[index];
      if (!family) return;
      const link = item.querySelector(':scope > a');
      if (link) {
        link.href = family.href;
        link.textContent = `استكشف ${family.title} ←`;
      }
    });

    if (!heading || heading.querySelector('.cinema-chapters')) return;
    const chapters = document.createElement('nav');
    chapters.className = 'cinema-chapters';
    chapters.setAttribute('aria-label', 'التنقل بين الخدمات الرئيسية');
    chapters.innerHTML = PRIMARY_FAMILIES.map((family, index) => `
      <button type="button" data-cinema-chapter="${index}" aria-current="${index === 0 ? 'true' : 'false'}">
        <span>${family.index}</span><b>${family.title}</b>
      </button>`).join('');
    heading.appendChild(chapters);

    const buttons = [...chapters.querySelectorAll('[data-cinema-chapter]')];
    const setActive = (activeItem) => {
      const activeIndex = Math.max(0, items.indexOf(activeItem));
      buttons.forEach((button, index) => button.setAttribute('aria-current', String(index === activeIndex)));
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const item = items[index];
        if (!item) return;
        item.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });
    const activeObserver = new MutationObserver(() => {
      const active = items.find((item) => item.classList.contains('active')) || items[0];
      if (active) setActive(active);
    });
    items.forEach((item) => activeObserver.observe(item, { attributes:true, attributeFilter:['class'] }));
    if (items[0]) setActive(items[0]);
  }

  function buildFastDiscoverySlides(track) {
    track.innerHTML = DISCOVERY_SERVICES.map((service) => `
      <article class="fast-discovery-slide" data-family="${service.family}">
        <div class="fast-discovery-slide__top">
          <span class="fast-discovery-slide__number">${service.index}</span>
          <small>${service.eyebrow}</small>
        </div>
        <div class="fast-discovery-slide__image">
          <img src="${service.image}" alt="${service.imageAlt}" loading="lazy" decoding="async">
        </div>
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        <div class="fast-discovery-slide__tags">${service.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <a href="${service.href}">فتح تفاصيل الخدمة <span aria-hidden="true">←</span></a>
      </article>`).join('');
  }

  function enhanceFastDiscovery(catalogSection) {
    if (!catalogSection || catalogSection.dataset.fastDiscoveryReady === 'true') return;
    catalogSection.dataset.fastDiscoveryReady = 'true';
    catalogSection.id = 'fast-discovery';
    catalogSection.classList.add('fast-discovery-slider');

    const heading = catalogSection.querySelector('.strategy-head');
    const kicker = heading?.querySelector('.strategy-kicker');
    const title = heading?.querySelector('h2');
    const description = heading?.querySelector('p');
    if (kicker) kicker.textContent = 'بعض خدماتنا المتنوعة';
    if (title) title.textContent = 'خدمات محددة عندما تعرف ما الذي تريد تحسينه.';
    description?.remove();

    catalogSection.querySelector('.strategy-filterbar')?.remove();
    catalogSection.querySelector('.strategy-scope-note')?.remove();

    const track = catalogSection.querySelector('.strategy-service-catalog');
    if (!track) return;
    track.className = 'fast-discovery-track';
    track.setAttribute('aria-label', 'بعض خدمات ابتكار تك المتنوعة');
    track.tabIndex = 0;
    buildFastDiscoverySlides(track);

    const controls = document.createElement('div');
    controls.className = 'fast-discovery-controls';
    controls.innerHTML = `
      <div class="fast-discovery-controls__status" aria-live="polite"><b data-fast-current>01</b><span>/ ${String(DISCOVERY_SERVICES.length).padStart(2,'0')}</span></div>
      <div class="fast-discovery-controls__actions" aria-label="التنقل بين الشرائح">
        <button type="button" data-fast-prev aria-label="الشريحة السابقة">→</button>
        <button type="button" data-fast-next aria-label="الشريحة التالية">←</button>
      </div>`;
    track.before(controls);

    const slides = [...track.querySelectorAll('.fast-discovery-slide')];
    let activeIndex = 0;
    let dragMoved = false;
    let programmaticScrollUntil = 0;

    const renderActive = (index) => {
      activeIndex = Math.max(0, Math.min(slides.length - 1, index));
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeIndex));
      controls.querySelector('[data-fast-current]').textContent = String(activeIndex + 1).padStart(2, '0');
      controls.querySelector('[data-fast-prev]').disabled = activeIndex === 0;
      controls.querySelector('[data-fast-next]').disabled = activeIndex === slides.length - 1;
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
        const rect = track.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        let nearestDistance = Infinity;
        slides.forEach((slide, index) => {
          const slideRect = slide.getBoundingClientRect();
          const distance = Math.abs(slideRect.left + slideRect.width / 2 - center);
          if (distance < nearestDistance) { nearestDistance = distance; nearest = index; }
        });
      }

      renderActive(nearest);
    };

    const goTo = (index) => {
      const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
      renderActive(nextIndex);
      programmaticScrollUntil = performance.now() + (reducedMotion ? 100 : 420);
      slides[nextIndex]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block:'nearest', inline:'nearest' });
    };

    controls.querySelector('[data-fast-prev]').addEventListener('click', () => goTo(activeIndex - 1));
    controls.querySelector('[data-fast-next]').addEventListener('click', () => goTo(activeIndex + 1));

    let scrollTimer = 0;
    track.addEventListener('scroll', () => {
      if (performance.now() < programmaticScrollUntil) return;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(syncActive, 80);
    }, { passive:true });

    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
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
    track.addEventListener('wheel', () => { programmaticScrollUntil = 0; }, { passive:true });
    track.addEventListener('touchstart', () => { programmaticScrollUntil = 0; }, { passive:true });
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(activeIndex + 1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); goTo(activeIndex - 1); }
    });

    moveBeforeFinalSection(catalogSection);
    renderActive(0);
  }

  enhancePrimaryCinema();

  const syncFastDiscovery = () => {
    const catalog = main.querySelector('[data-strategy-service-catalog]');
    if (catalog) enhanceFastDiscovery(catalog);
  };
  syncFastDiscovery();
  const observer = new MutationObserver(() => syncFastDiscovery());
  observer.observe(main, { childList:true, subtree:true });
})();

/* Product-page-only interactions. Shared gallery, decision tabs and scope
 * behavior are owned by commerce-service-detail.js so every commerce service
 * page follows one interaction contract. */
(() => {
  const hotspotCopy = {
    gallery: [
      'معرض الصور',
      'المشكلة: الصور لا تشرح التفاصيل. التعديل: ترتيب الصور وتحديد الأولوية. سبب القرار: العميل يحتاج فهم المنتج بصريًا قبل متابعة الخيارات.'
    ],
    options: [
      'خيارات المنتج',
      'المشكلة: الخيارات مربكة. التعديل: تجميع المقاسات والألوان وحالات عدم التوفر بصورة أسهل للفهم.'
    ],
    trust: [
      'عناصر الثقة',
      'المشكلة: السياسات بعيدة. التعديل: تقريب معلومات الشحن والاستبدال والضمان من قرار الشراء.'
    ],
    cta: [
      'زر الإضافة للسلة',
      'المشكلة: الإجراء الأساسي ينافس عناصر أخرى. التعديل: منحه أولوية ومساحة وحالة واضحة.'
    ]
  };

  const hotspotInfo = document.querySelector('.hotspot-info');
  const hotspotTitle = hotspotInfo?.querySelector('[data-product-hotspot-title]');
  const hotspotText = hotspotInfo?.querySelector('[data-product-hotspot-text]');
  const hotspots = [...document.querySelectorAll('.hotspot')];

  const activateHotspot = (activeButton) => {
    const data = hotspotCopy[activeButton.dataset.id];
    if (!data || !hotspotTitle || !hotspotText) return;

    hotspots.forEach((button) => {
      button.setAttribute('aria-pressed', String(button === activeButton));
    });
    hotspotTitle.textContent = data[0];
    hotspotText.textContent = data[1];
  };

  hotspots.forEach((button) => {
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    if (hotspotInfo?.id) button.setAttribute('aria-controls', hotspotInfo.id);
    button.addEventListener('click', () => activateHotspot(button));
  });
  if (hotspots[0]) activateHotspot(hotspots[0]);

  const sticky = document.querySelector('.sticky-service-cta');
  const hero = document.querySelector('.service-commerce-hero');
  const finalCta = document.querySelector('#service-contact');
  const mobileViewport = window.matchMedia('(max-width: 680px)');
  let frameRequested = false;

  const updateSticky = () => {
    frameRequested = false;
    if (!sticky || !hero || !finalCta) return;

    const shouldShow = mobileViewport.matches
      && hero.getBoundingClientRect().bottom < 0
      && finalCta.getBoundingClientRect().top > window.innerHeight;

    sticky.classList.toggle('is-visible', shouldShow);
    sticky.setAttribute('aria-hidden', String(!shouldShow));
    sticky.toggleAttribute('inert', !shouldShow);
    document.body.classList.toggle('product-sticky-cta-visible', shouldShow);
  };

  const requestStickyUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateSticky);
  };

  if (sticky && hero && finalCta) {
    window.addEventListener('scroll', requestStickyUpdate, { passive: true });
    window.addEventListener('resize', requestStickyUpdate, { passive: true });
    mobileViewport.addEventListener?.('change', requestStickyUpdate);
    requestStickyUpdate();
  }
})();

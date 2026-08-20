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
  document.querySelectorAll('.hotspot').forEach((button) => {
    button.addEventListener('click', () => {
      const data = hotspotCopy[button.dataset.id];
      if (!data || !hotspotInfo) return;
      hotspotInfo.innerHTML = `<h3>${data[0]}</h3><p>${data[1]}</p>`;
    });
  });

  const sticky = document.querySelector('.sticky-service-cta');
  const hero = document.querySelector('.service-commerce-hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      sticky.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: .05 }).observe(hero);
  }
})();

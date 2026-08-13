(() => {
  const headerSlot = document.querySelector('[data-shell-header]');
  const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const pageKey = pathname.replace(/\.html$/,'') || 'index';
  const productPages = new Set(['tharaa.html']);
  const knowledgePages = new Set(['knowledge.html']);
  const retiredRoutes = new Map([
    ['salla.html','ecommerce.html#platforms'],
    ['zid.html','ecommerce.html#platforms'],
    ['shopify.html','ecommerce.html#platforms'],
    ['woocommerce.html','ecommerce.html#platforms'],
    ['wordpress.html','websites.html#capabilities']
  ]);
  let section = document.body.dataset.section || '';

  document.body.dataset.page = pageKey;
  if (productPages.has(pathname)) section = 'products';
  if (knowledgePages.has(pathname)) section = 'knowledge';

  // Tharaa preserves an older desktop ScrollTrigger that expects #libraryTrack
  // to exist before the rest of the inline page scripts initialize. The visual
  // library was removed, so create a fully-contained non-visual target early.
  if (pathname === 'tharaa.html' && !document.querySelector('#libraryTrack')) {
    const guard = document.createElement('div');
    guard.className = 'library ibt-legacy-animation-guard';
    guard.dataset.ibtLegacyAnimationGuard = 'true';
    guard.setAttribute('aria-hidden', 'true');
    guard.style.cssText = 'position:fixed!important;top:0!important;left:0!important;right:auto!important;bottom:auto!important;width:1px!important;max-width:1px!important;height:1px!important;max-height:1px!important;min-width:0!important;min-height:0!important;padding:0!important;margin:0!important;overflow:hidden!important;contain:strict;opacity:0!important;pointer-events:none!important;z-index:-1!important;transform:none!important;';
    const track = document.createElement('div');
    track.id = 'libraryTrack';
    track.style.cssText = 'width:100vw;max-width:none;height:1px;min-height:0;padding:0;margin:0;overflow:hidden;';
    guard.appendChild(track);
    document.body.appendChild(guard);
  }

  const hasFinalStyleCarrier = document.querySelector('link[href$="inner.css"], link[href$="approved-source.css"], link[href$="frontend-final.css"]');
  if (!hasFinalStyleCarrier && !document.querySelector('link[data-frontend-final]')) {
    const finalCss = document.createElement('link');
    finalCss.rel = 'stylesheet';
    finalCss.href = '/static/public_preview/assets/css/pages/frontend-final.css';
    finalCss.dataset.frontendFinal = 'true';
    document.head.appendChild(finalCss);
  }

  if (!document.querySelector('script[data-strategy-enhancements]')) {
    const strategyScript = document.createElement('script');
    strategyScript.src = pathname === 'index.html' || pathname === ''
      ? '/static/public_preview/assets/js/home-enhancements.js'
      : '/static/public_preview/assets/js/strategy-enhancements.js';
    strategyScript.defer = true;
    strategyScript.dataset.strategyEnhancements = 'true';
    document.head.appendChild(strategyScript);
  }

  const headerMarkup = [
    '<header class="ibt-shell-header" id="ibtikarSiteHeader" data-ibtikar-header>',
      '<div class="ibt-shell-nav">',
        '<a class="ibt-shell-brand" href="index.html" aria-label="ابتكار تك - الرئيسية">',
          '<span class="ibt-shell-logo" aria-hidden="true"><i></i><i></i><i></i></span>',
          '<span class="ibt-shell-brand-copy"><strong>ابتكار تك</strong><small>للحلول والخدمات الرقمية</small></span>',
        '</a>',
        '<nav class="ibt-shell-desktop-nav" aria-label="التنقل الرئيسي">',
          '<a class="ibt-shell-nav-link" data-nav-key="home" href="index.html">الرئيسية</a>',
          '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
            '<a class="ibt-shell-nav-link" data-nav-key="services" href="services.html">الحلول والخدمات</a>',
            '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض قائمة الحلول والخدمات" aria-expanded="false" aria-controls="solutionsServicesMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
            '<div class="ibt-shell-mega" id="solutionsServicesMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
              '<a class="ibt-shell-mega-lead" href="services.html#goals"><span>ابدأ من هدفك</span><strong>اختر النتيجة قبل اسم الخدمة</strong><p>إطلاق، تطوير، بناء علامة، ربط عمليات أو نمو — ثم نحدد أقل نطاق صحيح.</p></a>',
              '<a class="ibt-shell-mega-link" href="ecommerce.html"><strong>المتاجر الإلكترونية</strong><span>إطلاق وتخصيص وتجربة وقياس ودعم.</span></a>',
              '<a class="ibt-shell-mega-link" href="websites.html"><strong>المواقع وصفحات الهبوط</strong><span>محتوى وتجربة ويب تقود إلى إجراء واضح.</span></a>',
              '<a class="ibt-shell-mega-link" href="brand-content.html"><strong>الهوية والمحتوى</strong><span>علامة رقمية متماسكة عبر نقاط الاتصال.</span></a>',
              '<a class="ibt-shell-mega-link" href="growth.html"><strong>الظهور والقياس والنمو</strong><span>SEO وقياس وتحسين مبني على البيانات.</span></a>',
              '<a class="ibt-shell-mega-link" href="custom-systems.html"><strong>الأنظمة والأتمتة</strong><span>ربط عمليات وحلول مخصصة عندما لا يكفي الجاهز.</span></a>',
            '</div></div>',
          '</div>',
          '<div class="ibt-shell-nav-group" data-ibt-mega-root>',
            '<a class="ibt-shell-nav-link" data-nav-key="products" href="tharaa.html">منتجاتنا</a>',
            '<button class="ibt-shell-mega-toggle" type="button" aria-label="عرض منتجات ابتكار تك" aria-expanded="false" aria-controls="productsMega" data-ibt-mega-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>',
            '<div class="ibt-shell-mega" id="productsMega" aria-hidden="true" data-ibt-mega-menu><div class="ibt-shell-mega-grid">',
              '<a class="ibt-shell-mega-lead" href="tharaa.html"><span>منتج أصلي من ابتكار تك</span><strong>ثيم ثراء لمتاجر سلة</strong><p>مزايا وتجربة جوال وتخصيص ومعاينات تفاعلية في صفحة منتج مستقلة.</p></a>',
            '</div></div>',
          '</div>',
          '<a class="ibt-shell-nav-link" data-nav-key="portfolio" href="portfolio.html">أعمالنا</a>',
          '<a class="ibt-shell-nav-link" data-nav-key="knowledge" href="knowledge.html">المعرفة</a>',
          '<a class="ibt-shell-nav-link" data-nav-key="about" href="about.html">عن ابتكار</a>',
        '</nav>',
        '<div class="ibt-shell-actions">',
          '<a class="ibt-shell-cta" href="contact.html#quote">ابدأ مشروعك</a>',
          '<button class="ibt-shell-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="ibtikarMobileMenu" data-ibt-menu-toggle><span></span><span></span><span></span></button>',
        '</div>',
      '</div>',
    '</header>',
    '<nav class="ibt-shell-mobile-menu" id="ibtikarMobileMenu" aria-label="قائمة الجوال" aria-hidden="true">',
      '<a data-nav-key="home" href="index.html">الرئيسية</a>',
      '<details class="ibt-shell-mobile-group"><summary>الحلول والخدمات</summary><a href="services.html#goals">ابدأ من هدفك</a><a href="ecommerce.html">المتاجر الإلكترونية</a><a href="websites.html">المواقع وصفحات الهبوط</a><a href="brand-content.html">الهوية والمحتوى</a><a href="growth.html">الظهور والقياس والنمو</a><a href="custom-systems.html">الأنظمة والأتمتة</a></details>',
      '<details class="ibt-shell-mobile-group"><summary>منتجاتنا</summary><a href="tharaa.html">ثيم ثراء</a></details>',
      '<a data-nav-key="portfolio" href="portfolio.html">أعمالنا</a>',
      '<a data-nav-key="knowledge" href="knowledge.html">المعرفة</a>',
      '<a data-nav-key="about" href="about.html">عن ابتكار</a>',
      '<a class="ibt-shell-mobile-cta ibt-shell-cta" href="contact.html#quote">ابدأ مشروعك</a>',
    '</nav>'
  ].join('');

  const footerMarkup = [
    '<footer class="ibt-shell-footer">',
      '<div class="ibt-shell-footer-grid">',
        '<div class="ibt-shell-footer-main"><a class="ibt-shell-brand" href="index.html"><span class="ibt-shell-logo" aria-hidden="true"><i></i><i></i><i></i></span><span class="ibt-shell-brand-copy"><strong>ابتكار تك</strong><small>للحلول والخدمات الرقمية</small></span></a><p>نبني علامات وتجارب ومنتجات رقمية مترابطة تساعد المشاريع على الإطلاق والعمل والنمو ضمن نطاق واضح.</p></div>',
        '<div><h3>الحلول والخدمات</h3><a href="services.html#goals">ابدأ من هدفك</a><a href="ecommerce.html">المتاجر الإلكترونية</a><a href="websites.html">المواقع</a><a href="brand-content.html">الهوية والمحتوى</a><a href="growth.html">الظهور والقياس والنمو</a></div>',
        '<div><h3>المتاجر والمنصات</h3><a href="ecommerce.html#platforms">المنصات التي نعمل عليها</a><div class="ibt-shell-footer-platforms" aria-label="المنصات"><span>سلة</span><span>زد</span><span>Shopify</span><span>WooCommerce</span></div><a href="storefront-customization.html">تخصيص واجهة المتجر</a><a href="product-page-optimization.html">تحسين صفحة المنتج</a></div>',
        '<div><h3>منتجاتنا</h3><a href="tharaa.html">ثيم ثراء</a></div>',
        '<div><h3>ابتكار تك</h3><a href="portfolio.html">أعمالنا</a><a href="knowledge.html">المعرفة</a><a href="about.html">عن ابتكار</a><a href="contact.html#quote">ابدأ مشروعك</a></div>',
      '</div>',
      '<div class="ibt-shell-footer-bottom"><span>© <span id="year"></span> ابتكار تك. جميع الحقوق محفوظة.</span><div><a href="portfolio.html">أعمالنا</a><a href="knowledge.html">المعرفة</a><a href="services.html">الحلول والخدمات</a><a href="tharaa.html">ثيم ثراء</a><a href="contact.html#quote">ابدأ مشروعك</a></div></div>',
    '</footer>'
  ].join('');

  if (headerSlot) {
    headerSlot.insertAdjacentHTML('afterend', headerMarkup);
    headerSlot.remove();
  }

  const injectFooter = () => {
    const footerSlot = document.querySelector('[data-shell-footer]');
    if (!footerSlot) return false;
    footerSlot.insertAdjacentHTML('afterend', footerMarkup);
    footerSlot.remove();
    document.querySelectorAll('#year').forEach((item) => { item.textContent = new Date().getFullYear(); });
    return true;
  };

  if (!injectFooter() && document.readyState === 'loading') {
    const footerObserver = new MutationObserver(() => {
      if (injectFooter()) footerObserver.disconnect();
    });
    footerObserver.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('DOMContentLoaded',() => {
      footerObserver.disconnect();
      injectFooter();
    },{once:true});
  }

  document.querySelectorAll('a[href]').forEach((link) => {
    const raw = link.getAttribute('href') || '';
    const clean = raw.split('#')[0].toLowerCase();
    if (retiredRoutes.has(clean)) link.href = retiredRoutes.get(clean);
  });

  document.querySelectorAll('[data-nav-key]').forEach((link) => {
    const active = link.dataset.navKey === section;
    link.classList.toggle('is-active',active);
    if (active) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });

  const loadContentFinalization = () => {
    if (document.querySelector('script[data-content-finalization]')) return;
    const script = document.createElement('script');
    script.src = '/static/public_preview/assets/js/content-finalization.js';
    script.async = false;
    script.dataset.contentFinalization = 'true';
    document.body.appendChild(script);
  };

  const loadFinalRuntime = () => {
    if (!document.querySelector('script[data-frontend-final]')) {
      const script = document.createElement('script');
      script.src = '/static/public_preview/assets/js/frontend-final.js';
      script.async = false;
      script.dataset.frontendFinal = 'true';
      document.body.appendChild(script);
    }
    loadContentFinalization();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',loadFinalRuntime,{once:true});
  else loadFinalRuntime();
})();

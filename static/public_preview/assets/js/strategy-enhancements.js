(() => {
  'use strict';

  const PATH = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function ensureCss() {
    if ($('link[data-strategy-enhancements]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/public_preview/assets/css/pages/strategy-enhancements.css';
    link.dataset.strategyEnhancements = 'true';
    document.head.appendChild(link);
  }

  function html(markup) {
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    return template.content.firstElementChild;
  }

  function insertBefore(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target);
  }

  function insertAfter(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target.nextSibling);
  }

  function sectionOf(node) {
    return node?.closest?.('section') || node;
  }

  /* ------------------------------------------------------------------------
     SERVICES
     The approved services page owns the cinematic presentation. This layer
     adds only an empty discovery container; services-experience.js fills it
     with the final image-card slider. It also retires legacy fake contact
     routes while preserving the existing final CTA design.
     ------------------------------------------------------------------------ */
  function initServices() {
    if (PATH !== 'services.html') return;
    const main = $('main');
    const goalGrid = $('.goal-grid', main);
    if (!main || !goalGrid) return;

    const goalSection = sectionOf(goalGrid);
    goalSection?.classList.add('strategy-existing-section', 'strategy-existing-section--goals');

    if (!$('[data-strategy-service-catalog]', main)) {
      const catalog = html(`
        <section class="strategy-layer strategy-layer--catalog" data-strategy-service-catalog aria-labelledby="strategyCatalogTitle">
          <div class="strategy-shell">
            <div class="strategy-head">
              <span class="strategy-kicker">بعض خدماتنا المتنوعة</span>
              <h2 id="strategyCatalogTitle">خدمات محددة عندما تعرف ما الذي تريد تحسينه.</h2>
            </div>
            <div class="strategy-service-catalog" aria-live="polite"></div>
          </div>
        </section>`);
      insertAfter(goalSection, catalog);
    }

    const finalCta = $('#contact', main);
    if (finalCta) {
      const actions = $$('.cta-actions a', finalCta);
      if (actions[0]) {
        actions[0].href = 'contact.html#quote';
        actions[0].removeAttribute('target');
        actions[0].removeAttribute('rel');
        actions[0].textContent = 'ابدأ مشروعك';
      }
      if (actions[1]) {
        actions[1].href = 'ecommerce.html';
        actions[1].removeAttribute('target');
        actions[1].removeAttribute('rel');
        actions[1].textContent = 'استكشف حلول المتاجر';
      }
    }
    $$('.whatsapp').forEach((link) => link.remove());
  }

  /* ------------------------------------------------------------------------
     PRODUCT PAGE OPTIMIZATION
     The approved source page keeps its original visual layout. Here we only
     correct legacy navigation and related-service routes so every CTA lands
     on the current information architecture.
     ------------------------------------------------------------------------ */
  function initProductPage() {
    if (PATH !== 'product-page-optimization.html') return;

    const breadcrumb = $('.svc-breadcrumb');
    const breadcrumbLinks = breadcrumb ? $$('a', breadcrumb) : [];
    if (breadcrumbLinks[0]) {
      breadcrumbLinks[0].href = 'index.html';
      breadcrumbLinks[0].textContent = 'الرئيسية';
    }
    if (breadcrumbLinks[1]) {
      breadcrumbLinks[1].href = 'services.html';
      breadcrumbLinks[1].textContent = 'الحلول والخدمات';
    }

    $$('.related-grid article').forEach((card) => {
      const title = (card.querySelector('h3')?.textContent || '').trim();
      const link = card.querySelector('a');
      if (!link) return;
      if (title.includes('تحسين تجربة الجوال')) link.href = 'storefront-customization.html';
      if (title.includes('تصميم البنرات والمحتوى')) link.href = 'brand-content.html';
      if (title.includes('التحليلات والتتبع')) link.href = 'ecommerce-growth.html';
      if (title.includes('تطوير المتجر القائم')) link.href = 'store-redesign.html';
    });

    const contactSection = $('#service-contact');
    if (contactSection) {
      $$('a', contactSection).forEach((link, index) => {
        link.href = 'contact.html#quote';
        link.removeAttribute('target');
        link.removeAttribute('rel');
        if (index === 0) link.textContent = 'ابدأ تقييم صفحة المنتج';
        if (index === 1) link.textContent = 'ابدأ مشروعك';
      });
    }
  }

  /* ------------------------------------------------------------------------
     THARAA
     Keep only two useful merchandising layers that do not depend on missing
     price/version/support metadata: sector fit and launch recipes.
     ------------------------------------------------------------------------ */
  function initTharaa() {
    if (PATH !== 'tharaa.html') return;
    const main = $('main');
    if (!main) return;

    const preview = $('#v4-preview, #preview, [id*="preview"]', main);
    const features = $('#features', main);

    if (preview && !$('[data-strategy-tharaa-fit]', main)) {
      const fit = html(`
        <section class="strategy-layer strategy-layer--tharaa-fit" data-strategy-tharaa-fit>
          <div class="strategy-shell">
            <div class="strategy-compact-head">
              <div><span class="strategy-kicker">مصمم لمن؟</span><h2>ثراء لا يحاول أن يكون ثيمًا لكل متجر.</h2></div>
              <p>تموضعه الأقوى للمتاجر التي تعتمد على الصورة والهوية وتجربة المنتج، خصوصًا العطور والعناية والجمال والهدايا الراقية.</p>
            </div>
            <div class="strategy-fit-grid">
              <article><span>01</span><h3>العطور</h3><p>مجموعات ومنتجات تحتاج عرضًا بصريًا راقيًا وهوية واضحة.</p></article>
              <article><span>02</span><h3>العناية والجمال</h3><p>صور وتفاصيل وثقة وتجربة جوال تؤثر في فهم المنتج.</p></article>
              <article><span>03</span><h3>الهدايا الراقية</h3><p>تجربة تستفيد من تنظيم المناسبات والمجموعات والعرض البصري.</p></article>
              <article><span>04</span><h3>علامات Premium</h3><p>متاجر تريد أن تبدو كعلامة متماسكة لا كقالب مزدحم.</p></article>
            </div>
          </div>
        </section>`);
      insertBefore(preview, fit);
    }

    if (features && !$('[data-strategy-tharaa-recipes]', main)) {
      const recipes = html(`
        <section class="strategy-layer strategy-layer--recipes" data-strategy-tharaa-recipes>
          <div class="strategy-shell">
            <div class="strategy-head">
              <span class="strategy-kicker">LAUNCH RECIPES</span>
              <h2>ترتيبات مقترحة للمكونات حسب نوع المتجر.</h2>
              <p>ليست قوالب جديدة؛ هي أمثلة لاستخدام المكونات الموجودة في تسلسل يخدم الاكتشاف والثقة واتخاذ القرار.</p>
            </div>
            <div class="strategy-recipe-grid">
              <article><b>PERFUME</b><h3>متجر عطور</h3><p>Hero هادئ → مجموعات → منتجات مختارة → قصة العلامة → معلومات ثقة → FAQ.</p></article>
              <article><b>BEAUTY</b><h3>عناية وجمال</h3><p>روابط سريعة → تصنيفات → منتجات → محتوى توضيحي → مراجعات حقيقية عند توفرها → FAQ.</p></article>
              <article><b>GIFTS</b><h3>هدايا راقية</h3><p>مناسبات → مجموعات → اقتراحات → تغليف → شحن وثقة → إجراء واضح.</p></article>
            </div>
          </div>
        </section>`);
      insertAfter(features, recipes);
    }
  }

  function init() {
    ensureCss();
    initServices();
    initProductPage();
    initTharaa();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

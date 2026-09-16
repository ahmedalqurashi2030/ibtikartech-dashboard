(() => {
  const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const page = pathname.replace(/\.html$/,'') || 'index';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const categoryPages = new Set(['websites','brand-content','growth','custom-systems']);
  const retiredRoutes = new Map([
    ['salla.html','ecommerce.html#platforms'],
    ['zid.html','ecommerce.html#platforms'],
    ['shopify.html','ecommerce.html#platforms'],
    ['woocommerce.html','ecommerce.html#platforms'],
    ['wordpress.html','websites.html#capabilities']
  ]);

  document.body.dataset.page = page;
  if (categoryPages.has(page)) document.body.classList.add('category-hub');

  const requestedBasename = location.pathname.split('/').pop()?.toLowerCase();
  if (document.querySelector('.notfound') && retiredRoutes.has(requestedBasename)) {
    location.replace(retiredRoutes.get(requestedBasename));
    return;
  }

  const rewriteLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    const raw = link.getAttribute('href') || '';
    const clean = raw.split('#')[0].toLowerCase();
    if (retiredRoutes.has(clean)) {
      link.href = retiredRoutes.get(clean);
      link.dataset.retiredRouteRewritten = 'true';
    }
    if (link.target === '_blank') {
      const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.rel = [...rel].join(' ');
    }
  };

  const syncDynamicContent = (scope = document) => {
    if (scope instanceof HTMLAnchorElement) rewriteLink(scope);
    scope.querySelectorAll?.('a[href]').forEach(rewriteLink);
    scope.querySelectorAll?.('.breadcrumbs a[href="services.html"], .service-detail-breadcrumb a[href="services.html"]').forEach((link) => {
      link.textContent = 'الحلول والخدمات';
    });

    if (page === 'services') {
      scope.querySelectorAll?.('.strategy-service-card').forEach((card) => {
        const heading = card.querySelector('h3');
        if (!heading || !/خدمات سلة المتخصصة|حلول سلة ضمن المتاجر/.test(heading.textContent || '')) return;
        heading.textContent = 'حلول سلة ضمن المتاجر الإلكترونية';
        const paragraph = card.querySelector('p');
        if (paragraph) paragraph.textContent = 'إطلاق وتخصيص وتجربة وقياس لمتاجر سلة ضمن مسار تجارة إلكترونية متكامل.';
        const link = card.querySelector('a');
        if (link) { link.href = 'ecommerce.html#platforms'; link.textContent = 'استكشف سلة ضمن المتاجر ←'; }
      });
    }
  };

  syncDynamicContent();
  const dynamicObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) syncDynamicContent(node);
    }));
  });
  dynamicObserver.observe(document.body,{childList:true,subtree:true});

  if (page === 'ecommerce') {
    const detailRoutes = new Map([
      ['service-launch','store-launch.html'],
      ['service-customize','storefront-customization.html'],
      ['service-redesign','store-redesign.html'],
      ['service-product','product-page-optimization.html'],
      ['service-growth','ecommerce-growth.html'],
      ['service-support','ecommerce-support.html']
    ]);
    detailRoutes.forEach((href,id) => {
      const card = document.getElementById(id);
      const link = card?.querySelector('.commerce-service-card__footer a');
      if (!link) return;
      link.href = href;
      link.textContent = 'تفاصيل الخدمة';
      link.setAttribute('aria-label', `فتح تفاصيل ${card.querySelector('h3')?.textContent?.trim() || 'الخدمة'}`);
    });

    const platformSection = document.getElementById('platforms');
    const platformIntro = platformSection?.querySelector('.platform-heading p');
    if (platformIntro) platformIntro.textContent = 'نختار المنصة وفق احتياج التشغيل، مستوى التخصيص، سهولة الإدارة، وخطط التوسع.';
    platformSection?.querySelectorAll('.platform-card').forEach((card) => {
      const link = card.querySelector('a');
      if (!link) return;
      link.href = '#subservices';
      link.textContent = 'استكشف الخدمات المناسبة';
      link.setAttribute('aria-label', `استكشف خدمات المتاجر المناسبة لـ ${card.querySelector('h3')?.textContent?.trim() || 'هذه المنصة'}`);
    });
    const finalCta = document.querySelector('.page-cta .cta-actions');
    const secondary = finalCta?.querySelector('.btn-outline');
    if (secondary) { secondary.href = '#platforms'; secondary.textContent = 'المنصات التي نعمل عليها'; }
  }

  if (document.body.classList.contains('inner-page') && !document.body.classList.contains('approved-source-page') && !document.querySelector('.ibt-page-progress')) {
    const progress = document.createElement('div');
    progress.className = 'ibt-page-progress';
    progress.setAttribute('aria-hidden','true');
    progress.innerHTML = '<span></span>';
    document.body.prepend(progress);
    const bar = progress.firstElementChild;
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      bar.style.transform = `scaleX(${Math.max(0,Math.min(1,scrollY/max))})`;
      ticking = false;
    };
    addEventListener('scroll',() => { if (!ticking) { ticking = true; requestAnimationFrame(update); } },{passive:true});
    addEventListener('resize',update,{passive:true});
    update();
  }

  if (categoryPages.has(page)) {
    const signatures = {
      websites: `
        <section class="category-signature" id="category-signature" aria-labelledby="categorySignatureTitle">
          <div class="category-signature__grid"><div class="category-signature__copy"><span>WEBSITE ARCHITECTURE LAB</span><h2 id="categorySignatureTitle">الموقع القوي يبدأ من المعمار، لا من شكل الصفحة الأولى.</h2><p>نربط الرسالة بهندسة المحتوى ومسار المستخدم والأداء والـSEO والتحويل، ثم نختار التقنية التي تخدم هذا النظام بدل أن تقوده.</p><div class="category-signature__chips"><span>Message</span><span>Information Architecture</span><span>Performance</span><span>SEO</span><span>Conversion</span></div></div><div class="signature-stage" aria-hidden="true"><div class="signature-stage__bar"><span>IBTIKAR / WEBSITE BLUEPRINT</span><div class="signature-stage__dots"><i></i><i></i><i></i></div></div><div class="website-blueprint"><div class="website-sitemap"><strong>SITEMAP</strong><span>الرئيسية</span><span>الحلول</span><span>دراسة حالة</span><span>المعرفة</span><span>التواصل</span></div><div class="website-canvas"><div class="website-nav"></div><div class="website-hero-block"></div><div class="website-blocks"><i></i><i></i><i></i></div></div></div></div></div>
        </section>`,
      'brand-content': `
        <section class="category-signature" id="category-signature" aria-labelledby="categorySignatureTitle">
          <div class="category-signature__grid"><div class="category-signature__copy"><span>BRAND SYSTEM STUDIO</span><h2 id="categorySignatureTitle">الهوية ليست شعارًا؛ هي قواعد تجعل العلامة تتصرف بصوت وشكل واحد.</h2><p>نربط الاستراتيجية باللغة البصرية ونبرة المحتوى والواجهات الرقمية، بحيث يستطيع الفريق إنتاج نقاط اتصال جديدة دون أن تبدأ العلامة من الصفر في كل مرة.</p><div class="category-signature__chips"><span>Strategy</span><span>Visual Language</span><span>Voice</span><span>Content</span><span>Digital UI</span></div></div><div class="signature-stage" aria-hidden="true"><div class="signature-stage__bar"><span>IBTIKAR / BRAND SYSTEM</span><div class="signature-stage__dots"><i></i><i></i><i></i></div></div><div class="brand-studio"><div class="brand-board"><div class="brand-palette"><i></i><i></i><i></i><i></i></div><div class="brand-type"><strong>ابتكار تك</strong><span>TYPE / HIERARCHY / RHYTHM</span></div><div class="brand-voice"><span>واضح</span><span>خبير</span><span>عملي</span><span>تقني</span><span>بشري</span></div></div><div class="brand-preview"><div class="brand-preview__mark"></div><strong>نظام واحد</strong><small>BRAND → CONTENT → INTERFACE</small></div></div></div></div>
        </section>`,
      growth: `
        <section class="category-signature" id="category-signature" aria-labelledby="categorySignatureTitle">
          <div class="category-signature__grid"><div class="category-signature__copy"><span>MEASUREMENT LOOP</span><h2 id="categorySignatureTitle">النمو دورة تعلّم، لا قناة إعلانية واحدة.</h2><p>نبدأ من القياس والفرضية، نختار التدخل المناسب، نراقب الإشارة ثم نقرر: نثبت، نعدل أو نتوقف. بهذا يصبح SEO والمحتوى والتحسين أدوات داخل نظام قرار.</p><div class="category-signature__chips"><span>Acquire</span><span>Measure</span><span>Learn</span><span>Improve</span><span>Repeat</span></div></div><div class="signature-stage" aria-hidden="true"><div class="signature-stage__bar"><span>IBTIKAR / GROWTH LOOP</span><div class="signature-stage__dots"><i></i><i></i><i></i></div></div><div class="growth-loop"><div class="growth-ring"><div class="growth-core">MEASURE<br>→ LEARN</div><span class="growth-node"><b>ACQUIRE</b>بحث ومحتوى</span><span class="growth-node"><b>ENGAGE</b>تجربة ورسالة</span><span class="growth-node"><b>CONVERT</b>قرار وإجراء</span><span class="growth-node"><b>IMPROVE</b>فرضية جديدة</span></div><div class="growth-signal"></div></div></div></div>
        </section>`,
      'custom-systems': `
        <section class="category-signature" id="category-signature" aria-labelledby="categorySignatureTitle">
          <div class="category-signature__grid"><div class="category-signature__copy"><span>WORKFLOW ARCHITECTURE</span><h2 id="categorySignatureTitle">الأتمتة الجيدة تبدأ من فهم العملية قبل كتابة الكود.</h2><p>نرسم نقطة البداية والقرار والأنظمة والاستثناءات والأثر المطلوب، ثم نحدد أين يكفي ربط بسيط وأين يحتاج المشروع إلى منطق أو نظام مخصص.</p><div class="category-signature__chips"><span>Trigger</span><span>Rules</span><span>Systems</span><span>Exceptions</span><span>Audit</span></div></div><div class="signature-stage" aria-hidden="true"><div class="signature-stage__bar"><span>IBTIKAR / WORKFLOW MAP</span><div class="signature-stage__dots"><i></i><i></i><i></i></div></div><div class="workflow-map"><div class="workflow-row"><div class="workflow-node"><span><b>01 / INPUT</b>حدث أو طلب</span></div><div class="workflow-node"><span><b>02 / RULE</b>شرط وقرار</span></div><div class="workflow-node"><span><b>03 / CONNECT</b>ربط الأنظمة</span></div><div class="workflow-node"><span><b>04 / EXCEPTION</b>حالة غير عادية</span></div><div class="workflow-node"><span><b>05 / OUTPUT</b>نتيجة موثقة</span></div></div><div class="workflow-audit"><span>صلاحيات محدودة</span><span>Logs وحالات فشل</span><span>Fallback يدوي</span></div></div></div></div>
        </section>`
    };

    const capabilities = document.getElementById('capabilities');
    if (capabilities && signatures[page] && !document.getElementById('category-signature')) capabilities.insertAdjacentHTML('beforebegin',signatures[page]);

    const cards = [...document.querySelectorAll('#capabilities .route-card')];
    cards.forEach((card,index) => {
      if (card.querySelector('.route-card__visual')) return;
      card.dataset.visual = String((index % 6) + 1);
      const visual = document.createElement('div');
      visual.className = 'route-card__visual';
      visual.setAttribute('aria-hidden','true');
      visual.innerHTML = '<span></span><span></span><span></span>';
      const small = card.querySelector('small');
      if (small) small.after(visual); else card.prepend(visual);
    });

  }

  document.querySelectorAll('.related-nav a[href]').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (href && href === pathname) link.setAttribute('aria-current','page');
  });

  document.querySelectorAll('main section:not(:first-of-type) img').forEach((img) => {
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });

  document.querySelectorAll('main section[id], main [id][tabindex="-1"]').forEach((target) => {
    target.style.scrollMarginTop = categoryPages.has(page) ? '150px' : '112px';
  });

  if (!reducedMotion) {
    document.addEventListener('click',(event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href') === '#') return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'',link.getAttribute('href'));
    });
  }
})();

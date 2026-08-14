(() => {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const $ = (selector, scope = document) => scope.querySelector(selector);

  const ensureContentCss = () => {
    if (document.querySelector('link[data-content-finalization-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/public_preview/assets/css/pages/content-finalization.css';
    link.dataset.contentFinalizationCss = 'true';
    document.head.appendChild(link);
  };
  ensureContentCss();

  const setNoIndex = () => {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,follow';
  };

  const replaceUnverifiedContactLinks = () => {
    $$('a[href]').forEach((link) => {
      const href = (link.getAttribute('href') || '').trim();
      const isFakeWhatsapp = href.includes('wa.me/967000000000');
      const isFakeEmail = href.toLowerCase() === 'mailto:hello@ibtikar-tech.com';
      const isFakeTharaaSupport = href.toLowerCase() === 'mailto:support@tharaa.com' || href.includes('t.me/tharaa_theme');
      if (!isFakeWhatsapp && !isFakeEmail && !isFakeTharaaSupport) return;

      link.setAttribute('href', 'contact.html#quote');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      const label = (link.textContent || '').trim();
      if (/واتساب|بريد|email|whatsapp|تيليجرام|telegram|support@/i.test(label)) link.textContent = 'ابدأ مشروعك';
    });
  };

  const normalizeGrowthNaming = () => {
    $$('a, h1, h2, h3, span').forEach((node) => {
      if ((node.textContent || '').trim() === 'التسويق والنمو' && node.children.length === 0) {
        node.textContent = 'الظهور والقياس والنمو';
      }
      if ((node.textContent || '').trim() === 'النمو والقياس' && node.children.length === 0 && path !== 'ecommerce-growth.html') {
        node.textContent = 'الظهور والقياس والنمو';
      }
    });
  };

  const hideUnreadySharedNavigation = () => {
    const shell = $$('.ibt-shell-header, .ibt-shell-mobile-menu, .ibt-shell-footer');
    shell.forEach((root) => {
      $$('a[href="legal.html"]', root).forEach((link) => link.remove());
    });
  };

  const cleanHomepage = () => {
    if (path !== 'index.html' && path !== '') return;
    $('#testimonials')?.remove();
    $$('.command-list .command-item').forEach((button) => {
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.includes('آراء وتجارب العملاء') || text.includes('الباقات والأسعار')) {
        button.remove();
      }
      if (text.includes('أعمالنا المختارة')) {
        button.dataset.target = '';
        button.addEventListener('click', () => { location.href = 'portfolio.html'; }, { once: true });
      }
    });
  };

  const cleanServices = () => {
    if (path !== 'services.html') return;
    const catalog = $('[data-strategy-service-catalog]');
    catalog?.querySelector('.strategy-filterbar')?.remove();
    catalog?.querySelector('.strategy-scope-note')?.remove();
  };

  const cleanProductPageService = () => {
    if (path !== 'product-page-optimization.html') return;

    $('[data-strategy-service-decision]')?.remove();
    $('[data-strategy-service-scope]')?.remove();

    const purchaseRows = $$('.service-purchase-box > div');
    if (purchaseRows[1]) {
      const label = purchaseRows[1].querySelector('small');
      const value = purchaseRows[1].querySelector('strong');
      if (label) label.textContent = 'نقطة البداية';
      if (value) value.textContent = 'مراجعة صفحة المنتج والمحتوى وإمكانات المنصة';
    }

    const resultCopy = [
      'نجمع السعر والمزايا والسياسات والمعلومات الحرجة في تسلسل يساعد العميل على الفهم دون بحث متكرر.',
      'نرتب الصور والمزايا بحيث تشرح المنتج بصريًا وتدعم المحتوى بدل تكراره.',
      'نعرض المقاسات أو الألوان والخيارات المتاحة بطريقة تقلل الالتباس قبل الإضافة للسلة.',
      'نقرّب الشحن والاستبدال والضمان والمعلومات الموثوقة من لحظة اتخاذ القرار.',
      'نعيد ترتيب الأولويات والمسافات والإجراء الأساسي للشاشة الصغيرة بدل ضغط نسخة سطح المكتب.',
      'نحدد أحداثًا قابلة للقياس عند دخول القياس ضمن النطاق حتى يمكن تقييم التغييرات لاحقًا.'
    ];
    $$('.decision-panel[data-decision-panel="results"] .result-grid article p').forEach((paragraph, index) => {
      if (resultCopy[index]) paragraph.textContent = resultCopy[index];
    });
  };

  const cleanStoreLaunch = () => {
    if (path !== 'store-launch.html') return;
    $$('.service-decision-panel[data-service-decision-panel="scope"] .service-scope-grid article').forEach((article) => {
      if ((article.querySelector('h3')?.textContent || '').trim() !== 'التجارة') return;
      const copy = article.querySelector('p');
      if (copy) copy.textContent = 'إعداد وربط خيارات الدفع والشحن والسياسات المتاحة ضمن حسابات العميل وصلاحيات المشروع وموافقات مقدمي الخدمة.';
    });
  };

  const cleanStorefrontCustomization = () => {
    if (path !== 'storefront-customization.html') return;
    const rows = $$('.service-purchase-box > div');
    if (rows[1]) {
      const label = rows[1].querySelector('small');
      const value = rows[1].querySelector('strong');
      if (label) label.textContent = 'فحص قبل التنفيذ';
      if (value) value.textContent = 'الثيم والتطبيقات والتخصيصات السابقة والتعارضات المحتملة';
    }
  };

  const cleanStoreRedesign = () => {
    if (path !== 'store-redesign.html') return;
    if ($('[data-redesign-continuity]')) return;

    const related = $$('.service-detail-section').find((section) => (section.textContent || '').includes('خدمات مرتبطة'));
    if (!related) return;
    related.insertAdjacentHTML('beforebegin', `
      <section class="service-detail-section service-detail-section--soft" data-redesign-continuity>
        <div class="service-detail-shell">
          <div class="service-detail-heading"><span>حماية ما يعمل</span><h2>إعادة التصميم لا تعني فقد الأصول الحالية.</h2><p>قبل التنفيذ نحدد ما يجب الحفاظ عليه وما يمكن تغييره، خصوصًا العناصر التي تؤثر في الوصول والقياس والتشغيل.</p></div>
          <div class="service-scope-grid">
            <article><b>01 / URLS</b><h3>الروابط والبنية</h3><p>نراجع الروابط المهمة وأي تغيير يحتاج Redirect أو تنسيقًا خاصًا حسب المنصة.</p></article>
            <article><b>02 / SEO</b><h3>قابلية الاكتشاف</h3><p>نحافظ قدر الإمكان على العناصر المفيدة للSEO ونراجع أثر أي إعادة هيكلة.</p></article>
            <article><b>03 / ANALYTICS</b><h3>القياس</h3><p>لا نغيّر نقاط القياس أو الأحداث المهمة دون معرفة أثرها على البيانات الحالية.</p></article>
            <article><b>04 / OPERATIONS</b><h3>التشغيل</h3><p>الدفع والشحن والتطبيقات والتكاملات العاملة تدخل في قائمة ما يجب اختباره قبل وبعد التغيير.</p></article>
          </div>
        </div>
      </section>`);
  };

  const cleanEcommerceGrowth = () => {
    if (path !== 'ecommerce-growth.html') return;
    const processHeading = $$('.service-detail-heading h2').find((heading) => (heading.textContent || '').includes('سؤال → بيانات'));
    if (processHeading) processHeading.textContent = 'أساس قياس واضح → قائمة تحسين مرتبة.';
    const priority = $$('.service-result-grid article').find((article) => (article.querySelector('h3')?.textContent || '').includes('قائمة تحسين مرتبة'));
    if (priority) {
      const title = priority.querySelector('h3');
      const copy = priority.querySelector('p');
      if (title) title.textContent = 'Growth Backlog واضح';
      if (copy) copy.textContent = 'نحوّل الملاحظات والبيانات إلى قائمة تحسين مرتبة حسب الأثر والجهد والمعلومة المتاحة.';
    }
  };

  const cleanEcommerceSupport = () => {
    if (path !== 'ecommerce-support.html') return;
    const boxRows = $$('.service-purchase-box > div');
    if (boxRows[1]) {
      const label = boxRows[1].querySelector('small');
      const value = boxRows[1].querySelector('strong');
      if (label) label.textContent = 'سياسة الاستجابة';
      if (value) value.textContent = 'القناة والأولوية وأهداف الاستجابة تُعتمد في اتفاق الخدمة قبل البدء';
    }
  };

  const cleanEcommerce = () => {
    if (path !== 'ecommerce.html') return;

    $('#store-anatomy')?.remove();
    $$('a[href="#store-anatomy"]').forEach((link) => link.remove());

    const platformIntro = $('#platforms .platform-heading p');
    if (platformIntro) {
      platformIntro.textContent = 'المنصة عامل تنفيذ داخل الخدمة. نحدد الأنسب وفق تشغيل مشروعك وحدود التخصيص، وتظهر خبرة المنصة داخل نطاق الخدمة نفسها.';
    }

    $$('p').forEach((paragraph) => {
      const text = (paragraph.textContent || '').trim();
      if (text.includes('ستُبنى عليها بقية صفحات الخدمات') || text.includes('ستبنى عليها بقية صفحات الخدمات')) {
        paragraph.textContent = 'صفحة تحسين تجربة المنتج جزء من منظومة خدمات المتاجر، وتوضح مستوى التفصيل المستخدم في صفحات الخدمات المتخصصة.';
      }
    });
  };

  const cleanTharaa = () => {
    if (path !== 'tharaa.html') return;

    $('[data-strategy-tharaa-decision]')?.remove();
    $('[data-strategy-tharaa-governance]')?.remove();
    $('#compare')?.remove();
    $('footer[data-approved-legacy-shell]')?.remove();

    $$('.library-note').forEach((note) => {
      if ((note.textContent || '').includes('Notion')) {
        note.textContent = 'تظهر لكل مكوّن معاينة بصرية مستقلة توضّح شكل القسم ووظيفته داخل المتجر.';
      }
    });

    const faqIntro = $('.faq-intro p');
    if (faqIntro) faqIntro.textContent = 'إجابات مختصرة عن التوافق والتخصيص والمعاينة ونطاق خدمات التركيب.';
    const faqIntroButton = $('.faq-intro a');
    if (faqIntroButton) {
      faqIntroButton.href = 'contact.html#quote';
      faqIntroButton.textContent = 'ناقش احتياج متجرك';
    }

    $$('.faq-item').forEach((item) => {
      const question = (item.querySelector('button')?.textContent || '').replace(/\s+/g, ' ').trim();
      const answer = item.querySelector('.faq-answer p');
      if (!answer) return;

      if (question.includes('هل يناسب العطور فقط')) {
        answer.textContent = 'ليس حصريًا للعطور، لكن تموضعه الأقوى للمتاجر التي تعتمد على الصورة والهوية وتجربة المنتج، خصوصًا العطور والعناية والجمال والهدايا الراقية.';
      }
      if (question.includes('هل توجد معاينة قبل الطلب')) {
        answer.textContent = 'تعرض الصفحة معاينات تفاعلية للمكوّنات وتجربة الجوال وأساليب التخصيص حتى تتضح طريقة عمل الثيم قبل اتخاذ القرار.';
      }
      if (question.includes('هل يشمل الطلب التركيب والتخصيص')) {
        answer.textContent = 'ترخيص الثيم مستقل عن خدمات التركيب والتخصيص. وعند طلب خدمة إضافية يحدد نطاقها ومخرجاتها بشكل منفصل قبل التنفيذ.';
      }
    });

    const support = $('#support');
    if (support) support.remove();
    $$('a[href="#support"]').forEach((link) => {
      link.setAttribute('href', '#faq');
      if (/دعم|خيارات/.test(link.textContent || '')) link.textContent = 'الأسئلة الشائعة';
    });

    const finalActions = $$('.final-cta .final-actions a');
    if (finalActions[1]) {
      finalActions[1].href = 'contact.html#quote';
      finalActions[1].textContent = 'تركيب وتخصيص ثراء ←';
    }
  };

  const markUnreadyEditorialPages = () => {
    if (['legal.html', 'contact.html'].includes(path)) setNoIndex();
  };

  const apply = () => {
    replaceUnverifiedContactLinks();
    normalizeGrowthNaming();
    hideUnreadySharedNavigation();
    cleanHomepage();
    cleanServices();
    cleanProductPageService();
    cleanStoreLaunch();
    cleanStorefrontCustomization();
    cleanStoreRedesign();
    cleanEcommerceGrowth();
    cleanEcommerceSupport();
    cleanEcommerce();
    cleanTharaa();
    markUnreadyEditorialPages();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      apply();
      setTimeout(apply, 80);
    }, { once: true });
  } else {
    apply();
    setTimeout(apply, 80);
  }
})();

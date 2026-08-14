(() => {
  const page = document.body.classList.contains('source-ecommerce');
  if (!page || document.querySelector('[data-commerce-experience-ready]')) return;
  document.documentElement.dataset.commerceExperienceReady = 'true';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const make = (markup) => {
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    return template.content.firstElementChild;
  };
  const insertAfter = (target, node) => {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target.nextSibling);
  };

  const nav = $('.commerce-category-nav__inner');
  if (nav) {
    const items = [
      ['#commerce-health', 'صحة المتجر'],
      ['#performance-scene', 'السرعة']
    ];
    items.reverse().forEach(([href, label]) => {
      if (nav.querySelector(`a[href="${href}"]`)) return;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      const subservices = nav.querySelector('a[href="#subservices"]');
      nav.insertBefore(link, subservices || null);
    });
  }

  const paths = $('#paths');
  if (paths) {
    const lab = make(`
      <section class="platform-section commerce-health-lab" id="commerce-health" data-commerce-experience-ready aria-labelledby="commerceHealthTitle">
        <div class="container">
          <div class="commerce-expertise-heading reveal">
            <div><span class="section-kicker">COMMERCE HEALTH LAB</span><h2 id="commerceHealthTitle">المتجر القوي منظومة، وليس واجهة جميلة فقط.</h2></div>
          </div>
          <div class="commerce-health-layout reveal">
            <div class="commerce-health-tabs" role="tablist" aria-label="محاور صحة المتجر">
              <button class="commerce-health-tab is-active" type="button" role="tab" aria-selected="true" data-health-target="performance"><b>01</b><span>السرعة والأداء</span><small>PERFORMANCE</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="mobile"><b>02</b><span>تجربة الجوال</span><small>MOBILE UX</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="navigation"><b>03</b><span>الاكتشاف والتنقل</span><small>DISCOVERY</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="product"><b>04</b><span>صفحة المنتج</span><small>PRODUCT UX</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="trust"><b>05</b><span>الثقة والإقناع</span><small>TRUST</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="checkout"><b>06</b><span>السلة والشراء</span><small>CHECKOUT</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="seo"><b>07</b><span>SEO والاكتشاف</span><small>SEO</small></button>
              <button class="commerce-health-tab" type="button" role="tab" aria-selected="false" data-health-target="measurement"><b>08</b><span>القياس والتحسين</span><small>MEASURE</small></button>
            </div>
            <div class="commerce-health-stage">
              <div class="commerce-health-stage__bar"><div class="commerce-health-stage__dots" aria-hidden="true"><i></i><i></i><i></i></div><span>IBTIKAR COMMERCE DIAGNOSTIC</span></div>

              <article class="commerce-health-panel is-active" role="tabpanel" data-health-panel="performance">
                <div class="commerce-health-copy"><small>01 / PERFORMANCE</small><h3>السرعة تبدأ من الوزن، الأولوية، والاستقرار البصري.</h3><p>لا نختزل الأداء في رقم واحد. نراجع الصور والخطوط والسكربتات والمكونات الثقيلة، وما يجب أن يظهر أولًا على الجوال.</p><ul><li>حجم الأصول والصور وطريقة تحميلها</li><li>الأقسام والسكربتات التي تؤخر التفاعل</li><li>ثبات التخطيط أثناء التحميل</li><li>أولوية المحتوى المرئي في أول شاشة</li></ul><a href="#performance-scene">شاهد مشهد قبل/بعد</a></div>
                <div class="commerce-health-visual"><div class="health-performance-flow"><div class="health-resource-stack" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="health-flow-arrow" aria-hidden="true"></span><div class="health-optimized-stack" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="mobile">
                <div class="commerce-health-copy"><small>02 / MOBILE UX</small><h3>Responsive لا يكفي عندما تكون الشاشة هي المتجر الحقيقي.</h3><p>نراجع ترتيب المحتوى، حجم العناصر، ظهور الخيارات، CTA، والمسافات بحيث يصبح القرار مفهومًا بيد واحدة.</p><ul><li>Hero وأولوية المحتوى</li><li>القوائم والبحث والفلاتر</li><li>صور المنتج والخيارات</li><li>CTA ثابت بدون إخفاء المحتوى</li></ul><a href="#service-redesign">الخدمة المرتبطة: تطوير التجربة</a></div>
                <div class="commerce-health-visual"><div class="health-mobile-phone" aria-hidden="true"><div class="health-mobile-screen"><div class="health-mobile-hero"></div><div class="health-mobile-products"><i></i><i></i><i></i><i></i></div><div class="health-mobile-cta"></div></div></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="navigation">
                <div class="commerce-health-copy"><small>03 / DISCOVERY</small><h3>كل نقرة زائدة بين العميل والمنتج تحتاج سببًا.</h3><p>نراجع التصنيفات والبحث والفلاتر والروابط السريعة بحيث يعرف العميل أين يذهب وما الفرق بين الخيارات.</p><ul><li>هندسة التصنيفات</li><li>البحث والاقتراحات</li><li>الفلاتر والترتيب</li><li>الروابط الداخلية بين المجموعات والمنتجات</li></ul><a href="#service-launch">الخدمة المرتبطة: الإطلاق أو إعادة الهيكلة</a></div>
                <div class="commerce-health-visual"><div class="health-journey-map" aria-hidden="true"><span>دخول</span><span>تصنيف</span><span>فلتر</span><span>منتج</span><span>مقارنة</span><span>قرار</span></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="product">
                <div class="commerce-health-copy"><small>04 / PRODUCT UX</small><h3>صفحة المنتج هي أكثر لحظة تحتاج ترتيبًا لا زخرفة.</h3><p>نعيد ترتيب الصور والمعلومات والخيارات والثقة وCTA حول أسئلة العميل قبل الشراء، مع ترك مساحة كافية للمحتوى الحقيقي.</p><ul><li>المعرض والصور</li><li>السعر والخيارات والمخزون</li><li>الثقة والشحن والسياسات</li><li>CTA والمحتوى المكمل</li></ul><a href="product-page-optimization.html">تفاصيل تحسين صفحة المنتج</a></div>
                <div class="commerce-health-visual"><div class="health-product-page" aria-hidden="true"><div class="health-product-gallery"></div><div class="health-product-info"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="trust">
                <div class="commerce-health-copy"><small>05 / TRUST</small><h3>الثقة لا تأتي من أيقونة «دفع آمن» وحدها.</h3><p>نقرب معلومات الشحن والاسترجاع والدفع والمراجعات الحقيقية وهوية العلامة من لحظة القرار بدل دفنها في نهاية الصفحة.</p><ul><li>سياسات واضحة وقابلة للوصول</li><li>مراجعات ومحتوى موثوق</li><li>هوية متماسكة عبر الصفحات</li><li>معلومات المنتج والمتجر بدون تناقض</li></ul><a href="#service-customize">الخدمة المرتبطة: تخصيص الواجهة والثقة</a></div>
                <div class="commerce-health-visual"><div class="health-trust-ring" aria-hidden="true"><div class="health-trust-core">✓</div><span>الشحن</span><span>الدفع</span><span>الاسترجاع</span><span>المراجعات</span></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="checkout">
                <div class="commerce-health-copy"><small>06 / CHECKOUT</small><h3>بعد قرار الشراء تبدأ مرحلة أخرى من الاحتكاك.</h3><p>نراجع السلة والدفع والشحن والحقول وما يظهر قبل الإتمام ضمن الإمكانات التي تسمح بها المنصة.</p><ul><li>وضوح ملخص الطلب</li><li>القسائم والشحن والرسوم</li><li>عدد الخطوات والحقول</li><li>رسائل الخطأ والحالات الحرجة</li></ul><a href="#service-redesign">الخدمة المرتبطة: إعادة تصميم الرحلة</a></div>
                <div class="commerce-health-visual"><div class="health-checkout" aria-hidden="true"><article><b>1</b><i></i><i></i><i></i></article><article><b>2</b><i></i><i></i><i></i></article><article><b>3</b><i></i><i></i><i></i></article></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="seo">
                <div class="commerce-health-copy"><small>07 / SEO</small><h3>قابلية الاكتشاف تبدأ من بنية المتجر قبل الكلمات المفتاحية.</h3><p>التصنيفات والعناوين والمحتوى وصفحات المنتجات والروابط الداخلية تشكل أساسًا يساعد محركات البحث والمستخدم معًا.</p><ul><li>عناوين ووصف الصفحات</li><li>تصنيفات منطقية وروابط داخلية</li><li>محتوى منتجات قابل للفهم</li><li>صفحات أساسية قابلة للفهرسة</li></ul><a href="growth.html">الخدمة المرتبطة: SEO والنمو</a></div>
                <div class="commerce-health-visual"><div class="health-search-scene" aria-hidden="true"><div class="health-search-bar">العطور الرجالية المناسبة للهدايا</div><div class="health-search-results"><article><strong>تصنيف واضح</strong><span></span></article><article><strong>منتج بمحتوى منظم</strong><span></span></article><article><strong>دليل يساعد القرار</strong><span></span></article></div></div></div>
              </article>

              <article class="commerce-health-panel" role="tabpanel" hidden data-health-panel="measurement">
                <div class="commerce-health-copy"><small>08 / MEASUREMENT</small><h3>التحسين الحقيقي يبدأ عندما نعرف أين يحدث الاحتكاك.</h3><p>نحدد الأحداث المهمة ونربط القياس بما يمكن اتخاذ قرار بشأنه، بدل جمع بيانات لا تستخدم.</p><ul><li>مشاهدات المنتجات والتصنيفات</li><li>إضافة للسلة وبدء الدفع</li><li>مصادر الزيارات والحملات</li><li>أولويات التحسين بعد الإطلاق</li></ul><a href="#service-growth">الخدمة المرتبطة: الربط والقياس</a></div>
                <div class="commerce-health-visual"><div class="health-measurement" aria-hidden="true"><div class="health-chart-card"><div class="health-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="health-events-card"><span>view_item <b>●</b></span><span>add_to_cart <b>●</b></span><span>begin_checkout <b>●</b></span><span>purchase <b>●</b></span></div></div></div>
              </article>
            </div>
          </div>
        </div>
      </section>`);
    insertAfter(paths, lab);

    const compare = make(`
      <section class="platform-section commerce-performance-scene" id="performance-scene" aria-labelledby="performanceSceneTitle">
        <div class="container commerce-performance-grid">
          <div class="commerce-performance-copy reveal"><span class="section-kicker">PERFORMANCE SCENE</span><h2 id="performanceSceneTitle">سرعة المتجر ليست رقمًا واحدًا.</h2><p>المشهد التالي تعليمي بصري، وليس قياسًا لمتجر محدد. الهدف أن يوضح الفرق بين تجربة مثقلة بالأصول والمكونات وتجربة تعطي الأولوية لما يحتاجه العميل أولًا.</p><div class="commerce-performance-notes"><span>الصور: المقاس والصيغة وأولوية التحميل</span><span>الخطوط والسكربتات: ما يحتاجه أول عرض فعلًا</span><span>التخطيط: تقليل القفزات أثناء ظهور المحتوى</span><span>الجوال: تجربة فعلية، لا نسخة مصغرة من Desktop</span></div></div>
          <div class="commerce-compare reveal" data-commerce-compare style="--compare:54%"><div class="commerce-compare__layer commerce-compare__layer--slow"><span class="commerce-compare__label">تجربة مثقلة</span><div class="commerce-store-skeleton"><header></header><div class="hero-block"></div><div class="products"><i></i><i></i><i></i></div></div></div><div class="commerce-compare__layer commerce-compare__layer--fast"><span class="commerce-compare__label">تجربة محسّنة</span><div class="commerce-store-skeleton"><header></header><div class="hero-block"></div><div class="products"><i></i><i></i><i></i></div></div></div><div class="commerce-compare__divider" aria-hidden="true"></div><input type="range" min="12" max="88" value="54" aria-label="قارن بصريًا بين تجربة متجر مثقلة وتجربة محسنة" data-commerce-compare-range></div>
        </div>
      </section>`);
    insertAfter(lab, compare);
  }

  const tabs = $$('[data-health-target]');
  const panels = $$('[data-health-panel]');
  tabs.forEach((tab, index) => {
    const key = tab.dataset.healthTarget;
    const panel = panels.find((item) => item.dataset.healthPanel === key);
    if (!tab.id) tab.id = `commerce-health-tab-${index + 1}`;
    if (panel && !panel.id) panel.id = `commerce-health-panel-${index + 1}`;
    if (panel) {
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', tab.id);
    }
    tab.addEventListener('click', () => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((item) => {
        const active = item.dataset.healthPanel === key;
        item.classList.toggle('is-active', active);
        item.hidden = !active;
      });
    });
  });

  $('.commerce-health-tabs')?.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = current;
    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = (current + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === current) return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });

  const compare = $('[data-commerce-compare]');
  const compareRange = $('[data-commerce-compare-range]');
  compareRange?.addEventListener('input', () => compare?.style.setProperty('--compare', `${compareRange.value}%`));

  const anatomyData = {
    header: { kicker: '01 / DISCOVERY', title: 'الهيدر، البحث والتنقل', description: 'أول طبقة توجه العميل. إذا لم يفهم التصنيفات أو يجد البحث بسرعة، تصبح بقية التجربة أصعب مهما كان التصميم جميلًا.', list: ['وضوح القائمة الرئيسية','الوصول للبحث','التصنيفات والروابط السريعة','توازن العلامة مع مساحة التنقل'], href: '#service-launch', link: 'الخدمة المرتبطة: الإطلاق والهيكلة' },
    hero: { kicker: '02 / VALUE', title: 'الرسالة والقيمة في أول شاشة', description: 'الـHero يجب أن يوضح ما الذي يبيعه المتجر ولماذا يستحق الانتباه، دون أن يستهلك الشاشة كلها أو يؤخر الوصول للمنتجات.', list: ['رسالة مختصرة وواضحة','CTA مناسب للمرحلة','صورة لا تعيق القراءة','توازن بين الهوية والبيع'], href: '#service-customize', link: 'الخدمة المرتبطة: تخصيص الواجهة' },
    category: { kicker: '03 / CATEGORY UX', title: 'التصنيفات والاكتشاف', description: 'العميل يحتاج طريقة منطقية للوصول إلى المجموعة المناسبة، خاصة عندما يزداد عدد المنتجات أو الأنواع.', list: ['أسماء تصنيفات مفهومة','فلاتر مرتبطة بالمنتج','ترتيب مفيد لا شكلي','روابط بين المجموعات'], href: '#service-redesign', link: 'الخدمة المرتبطة: إعادة تصميم التجربة' },
    'product-card': { kicker: '04 / LISTING', title: 'بطاقة المنتج قبل صفحة المنتج', description: 'البطاقة الجيدة تساعد المقارنة وتقلل النقرات العشوائية. الصورة والسعر والحالة والخيارات يجب أن تظهر بوضوح مناسب.', list: ['صورة مقروءة بالحجم الصغير','اسم وسعر بدون ازدحام','حالات الخصم أو النفاد','CTA مناسب للسياق'], href: '#service-product', link: 'الخدمة المرتبطة: تحسين تجربة المنتج' },
    'product-page': { kicker: '05 / DECISION', title: 'صفحة المنتج ولحظة القرار', description: 'هنا تتجمع الأسئلة: ماذا سأحصل؟ أي خيار؟ هل أثق؟ متى يصل؟ وما الإجراء التالي؟ ترتيب هذه الإجابات أهم من زيادة المكونات.', list: ['معرض وصور','خيارات ومخزون','ثقة وشحن وسياسات','CTA ومحتوى مكمل'], href: 'product-page-optimization.html', link: 'تفاصيل خدمة تحسين صفحة المنتج' },
    checkout: { kicker: '06 / CHECKOUT', title: 'السلة والدفع', description: 'المستخدم الذي قرر الشراء يمكن أن يتوقف بسبب غموض الشحن أو القسائم أو الحقول أو رسائل الخطأ. نراجع المسار ضمن حدود المنصة.', list: ['ملخص الطلب','الشحن والرسوم','الحقول والخطوات','الأخطاء والحالات الحرجة'], href: '#service-redesign', link: 'الخدمة المرتبطة: تطوير الرحلة' },
    trust: { kicker: '07 / TRUST', title: 'الثقة والسياسات', description: 'الثقة يجب أن تكون قريبة من القرار: دفع، شحن، استرجاع، بيانات المتجر ومراجعات حقيقية — وليس مجرد أيقونات عامة.', list: ['سياسات قابلة للوصول','بيانات متسقة','مراجعات موثوقة','هوية احترافية'], href: '#service-customize', link: 'الخدمة المرتبطة: الهوية والتخصيص' }
  };

  const anatomyButtons = $$('[data-anatomy]');
  const anatomyPanel = $('.commerce-anatomy-panel');
  const syncAnatomy = (key) => {
    const data = anatomyData[key];
    if (!data || !anatomyPanel) return;
    $('[data-anatomy-kicker]', anatomyPanel).textContent = data.kicker;
    $('[data-anatomy-title]', anatomyPanel).textContent = data.title;
    $('[data-anatomy-description]', anatomyPanel).textContent = data.description;
    const list = $('[data-anatomy-list]', anatomyPanel);
    list.innerHTML = data.list.map((item) => `<li>${item}</li>`).join('');
    const link = $('[data-anatomy-link]', anatomyPanel);
    link.href = data.href;
    link.textContent = data.link;
    anatomyButtons.forEach((button) => {
      const active = button.dataset.anatomy === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  anatomyButtons.forEach((button) => button.addEventListener('click', () => syncAnatomy(button.dataset.anatomy)));
  syncAnatomy('header');
})();

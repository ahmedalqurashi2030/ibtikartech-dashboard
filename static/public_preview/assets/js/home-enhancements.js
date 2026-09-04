(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function html(markup) {
    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    return template.content.firstElementChild;
  }

  function sectionOf(node) {
    return node?.closest?.('section') || node;
  }

  function insertBefore(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target);
  }

  function insertAfter(target, node) {
    if (target?.parentNode && node) target.parentNode.insertBefore(node, target.nextSibling);
  }

  function action(href, label, primary = false) {
    return `<a class="strategy-action${primary ? ' strategy-action--primary' : ''}" href="${href}">${label}</a>`;
  }

  function removeLegacyHomeArtifacts() {
    const marker = 'Ibtikar Tech Homepage V7';
    [document.head, document.body, document.documentElement].forEach((root) => {
      if (!root) return;
      [...root.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').includes(marker)) node.remove();
      });
    });
  }

  function retireLegacyBrief() {
    const modal = $('.brief-modal');
    if (modal) {
      modal.hidden = true;
      modal.inert = true;
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('open');
    }

    $$('.whatsapp-float').forEach((link) => link.remove());

    $$('[data-open-brief]').forEach((trigger) => {
      if (trigger instanceof HTMLAnchorElement) trigger.href = 'contact.html#quote';
      trigger.setAttribute('aria-label', 'ابدأ مشروعك عبر نموذج التأهيل');
    });

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest?.('[data-open-brief]');
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      location.href = 'contact.html#quote';
    }, true);
  }

  function repairHomeContact() {
    const contact = $('#contact');
    if (!contact) return;
    const actions = $$('.cta-actions a', contact);
    if (actions[0]) {
      actions[0].href = 'contact.html#quote';
      actions[0].removeAttribute('target');
      actions[0].removeAttribute('rel');
      actions[0].textContent = 'ابدأ مشروعك';
    }
    if (actions[1]) {
      actions[1].href = 'services.html';
      actions[1].removeAttribute('target');
      actions[1].removeAttribute('rel');
      actions[1].textContent = 'استكشف الحلول والخدمات';
    }
  }

  function repairHomeEditorial() {
    const heroStatus = $('.hero-console__status strong');
    if (heroStatus) heroStatus.textContent = 'READY';

    const scenes = $$('.services-cinema .service-scene-copy');
    const growthScene = scenes[3];
    if (growthScene) {
      const heading = $('h3', growthScene);
      const paragraph = $('p', growthScene);
      const chips = $$('.chips span', growthScene);
      if (heading) heading.textContent = 'ظهور وقياس يقودان إلى تحسين أوضح';
      if (paragraph) paragraph.textContent = 'SEO وتحليلات وتتبع وتحسين تحويل؛ نربط البيانات بأسئلة واضحة ثم نرتب فرص التحسين حسب ما يمكن قياسه وتنفيذه.';
      const labels = ['SEO', 'GA4', 'Analytics', 'CRO'];
      chips.forEach((chip, index) => { if (labels[index]) chip.textContent = labels[index]; });
    }

    const mobileCards = $$('.services-mobile-card');
    const mobileGrowth = mobileCards[3];
    if (mobileGrowth) {
      const heading = $('h3', mobileGrowth);
      const paragraph = $('p', mobileGrowth);
      if (heading) heading.textContent = 'الظهور والقياس والنمو';
      if (paragraph) paragraph.textContent = 'SEO وقياس وتتبع وتحسينات مبنية على البيانات المتاحة.';
    }

    const tharaa = $('#tharaa');
    if (tharaa) {
      const primary = $('.ibtx-tharaa-summary__primary', tharaa);
      const secondary = $('.ibtx-tharaa-summary__secondary', tharaa);
      const previewLink = $('.ibtx-preview-toolbar__actions a', tharaa);
      if (primary) {
        primary.href = 'tharaa.html';
        primary.textContent = 'استكشف صفحة ثراء';
      }
      if (secondary) {
        secondary.href = 'contact.html#quote';
        secondary.textContent = 'تركيب وتخصيص ثراء';
      }
      if (previewLink) {
        previewLink.href = 'tharaa.html#v4-preview';
        previewLink.setAttribute('aria-label', 'فتح معاينات ثيم ثراء');
      }
    }

    const faq = $('#faq');
    if (faq) {
      const faqLink = $('.faq-intro a', faq);
      if (faqLink) {
        faqLink.href = 'contact.html#quote';
        faqLink.textContent = 'لدي سؤال عن مشروعي';
      }

      $$('.accordion-item', faq).forEach((item) => {
        const question = (item.querySelector('button')?.textContent || '').replace(/\s+/g, ' ').trim();
        const answer = item.querySelector('.accordion-content p');
        if (!answer) return;

        if (question.includes('كم تستغرق مدة تنفيذ المشروع')) {
          answer.textContent = 'تُحدد المدة بعد اعتماد النطاق والمحتوى والاعتمادات المطلوبة. نوضح الجدول قبل بدء التنفيذ بدل إعطاء مدة عامة لا تناسب كل مشروع.';
        }
        if (question.includes('هل يوجد دعم بعد التسليم')) {
          answer.textContent = 'يمكن أن يدخل الدعم أو الصيانة ضمن العرض أو كخدمة مستقلة حسب المشروع. يوضح الاتفاق ما يشمله الدعم وقناته وأولوياته وما يعد تطويرًا جديدًا.';
        }
        if (question.includes('كيف أبدأ الطلب')) {
          answer.textContent = 'افتح صفحة «ابدأ مشروعك» وجهّز معلومات المشروع واحفظها كمسودة على جهازك.';
        }
      });
    }
  }

  function repairHomeServices(main) {
    const cinema = $('.services-cinema', main);
    if (!cinema || cinema.dataset.homeServicesReady === 'true') return;
    cinema.dataset.homeServicesReady = 'true';
    cinema.classList.add('strategy-existing-section', 'strategy-existing-section--services');

    const routes = [
      { href: 'ecommerce.html', label: 'استكشف المتاجر الإلكترونية' },
      { href: 'websites.html', label: 'استكشف المواقع وصفحات الهبوط' },
      { href: 'brand-content.html', label: 'استكشف الهوية والمحتوى' },
      { href: 'growth.html', label: 'استكشف الظهور والقياس والنمو' },
      { href: 'custom-systems.html#automation', label: 'استكشف الربط والأتمتة' },
      { href: 'custom-systems.html', label: 'استكشف الأنظمة والحلول المخصصة' }
    ];

    $$('.service-scene-copy', cinema).forEach((scene, index) => {
      const route = routes[index];
      if (!route) return;
      const link = $('.scene-link', scene);
      if (!link) return;
      link.href = route.href;
      link.textContent = route.label;
      link.setAttribute('aria-label', route.label);
    });

    $$('.services-mobile-card', cinema).forEach((card, index) => {
      const route = routes[index];
      if (!route) return;
      card.dataset.href = route.href;
      card.setAttribute('role', 'link');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent?.trim() || 'الخدمة'} — ${route.label}`);

      if (!card.querySelector('.home-service-mobile-action')) {
        const cue = document.createElement('span');
        cue.className = 'home-service-mobile-action';
        cue.textContent = `${route.label} ←`;
        cue.setAttribute('aria-hidden', 'true');
        card.appendChild(cue);
      }

      const open = () => { location.href = route.href; };
      card.addEventListener('click', (event) => {
        if (event.target.closest('a,button,input,select,textarea')) return;
        open();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
      });
    });

    const mobileTrack = $('.services-mobile-track', cinema);
    if (mobileTrack) {
      mobileTrack.setAttribute('aria-label', 'الخدمات الرئيسية — اسحب للتنقل بين البطاقات');
      mobileTrack.setAttribute('tabindex', '0');
    }
  }

  function initHome() {
    const main = $('main');
    if (!main || document.body.dataset.strategyHomeClean === 'true') return;

    const needs = sectionOf($('.needs-grid', main));
    const tharaa = sectionOf($('.tharaa-section, #tharaa, .thx', main));
    const faq = sectionOf($('.faq-grid', main));

    document.body.dataset.strategyHomeClean = 'true';

    document.querySelector('[data-strategy-home-v3]')?.remove();
    document.querySelector('[data-strategy-home-knowledge]')?.remove();

    if (needs && !document.querySelector('[data-strategy-stage]')) {
      needs.classList.add('strategy-existing-section', 'strategy-existing-section--goals');
      const stage = html(`
        <section class="strategy-layer strategy-layer--stage" data-strategy-stage>
          <div class="strategy-shell">
            <div class="strategy-head"><span class="strategy-kicker">أين أنت الآن؟</span><h2>ابدأ من حالة مشروعك، ثم نحدد الخدمة المناسبة.</h2><p>لا تحتاج أن تعرف الاسم التقني للحل. اختر الحالة الأقرب، وانتقل مباشرة إلى المسار المناسب.</p></div>
            <div class="strategy-stage-grid">
              <a href="services.html#goals" class="strategy-stage-card"><i>01</i><h3>أطلق مشروعًا جديدًا</h3><p>متجر، موقع أو منتج رقمي يحتاج نقطة بداية واضحة.</p><span>ابدأ من الهدف ←</span></a>
              <a href="services.html#services" class="strategy-stage-card"><i>02</i><h3>طوّر مشروعًا قائمًا</h3><p>نراجع الوضع الحالي ونرتب ما يستحق التحسين أولًا.</p><span>استكشف الخدمات ←</span></a>
              <a href="contact.html#quote" class="strategy-stage-card"><i>03</i><h3>حل مشكلة محددة</h3><p>صفحة، تجربة، ربط أو قياس يحتاج نطاقًا مركزًا.</p><span>ابدأ الطلب ←</span></a>
              <a href="growth.html" class="strategy-stage-card"><i>04</i><h3>حسّن الظهور والقياس</h3><p>SEO وبيانات وتحسينات تساعد على اتخاذ قرار أفضل.</p><span>مسار النمو ←</span></a>
            </div>
          </div>
        </section>`);
      insertAfter(needs, stage);
    }

    repairHomeServices(main);
    repairHomeContact();
    repairHomeEditorial();

    if (tharaa && !document.querySelector('[data-strategy-product-context]')) {
      tharaa.classList.add('strategy-existing-section', 'strategy-existing-section--product');
      const productLabel = html(`
        <div class="strategy-product-context" data-strategy-product-context>
          <div><span class="strategy-kicker">ORIGINAL PRODUCT</span><strong>ثيم ثراء — منتج من ابتكار تك لمتاجر سلة.</strong><p>ثيم يركز على الهوية وتجربة المنتج والجوال للمتاجر التي تعتمد على الصورة والعرض الراقي.</p></div>
          <div class="strategy-actions">${action('tharaa.html','استكشف ثيم ثراء',true)}${action('portfolio.html#tharaa-case','دراسة حالة ثراء')}</div>
        </div>`);
      insertBefore(tharaa, productLabel);
    }

    if (faq) faq.classList.add('strategy-existing-section', 'strategy-existing-section--faq');
  }

  function init() {
    removeLegacyHomeArtifacts();
    retireLegacyBrief();
    initHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

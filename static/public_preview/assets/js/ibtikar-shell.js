(() => {
  document.querySelectorAll('#year').forEach((item) => { item.textContent = new Date().getFullYear(); });
  const megaToggles = [...document.querySelectorAll('[data-ibt-mega-toggle]')];
  const megaRoots = [...document.querySelectorAll('[data-ibt-mega-root]')];
  const managedThemeButtons = [...document.querySelectorAll('[data-ibt-theme-toggle]:not([data-ibt-theme-managed="page"])')];
  const managedMenuButtons = [...document.querySelectorAll('[data-ibt-menu-toggle]:not([data-ibt-menu-managed="page"])')];
  let lastMegaToggle = null;

  const menuFor = (toggle) => toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;

  function applyMegaState(toggle, open) {
    const menu = menuFor(toggle);
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded',String(open));
    if (open) {
      // Keep the approved opacity/transform animation, but do not let the
      // visibility transition delay keyboard focus into the disclosed panel.
      menu.style.transitionProperty = 'opacity, transform';
      menu.style.visibility = 'visible';
    } else {
      menu.style.removeProperty('transition-property');
      menu.style.removeProperty('visibility');
    }
    menu.classList.toggle('is-open',open);
    menu.setAttribute('aria-hidden',String(!open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert','');
    if (open) lastMegaToggle = toggle;
  }

  function closeMega(except = null, restoreFocus = false) {
    megaToggles.forEach((toggle) => {
      if (toggle === except) return;
      const menu = menuFor(toggle);
      const wasOpen = menu?.classList.contains('is-open');
      applyMegaState(toggle,false);
      if (restoreFocus && wasOpen) toggle.focus();
    });
  }

  function setMega(toggle, open) {
    if (!toggle || !menuFor(toggle)) return;
    if (open) closeMega(toggle);
    applyMegaState(toggle,open);
  }

  function focusFirstMegaItem(toggle) {
    const menu = menuFor(toggle);
    if (!menu?.classList.contains('is-open')) return;
    const first = menu.querySelector('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (!first) return;
    const focusIfOpen = () => {
      if (!menu.classList.contains('is-open')) return;
      first.focus({ preventScroll: true });
    };
    focusIfOpen();
    window.setTimeout(() => {
      if (menu.classList.contains('is-open') && !menu.contains(document.activeElement)) focusIfOpen();
    }, 0);
  }

  megaToggles.forEach((toggle) => {
    applyMegaState(toggle,false);
    toggle.addEventListener('click',(event) => {
      event.preventDefault();
      setMega(toggle,toggle.getAttribute('aria-expanded') !== 'true');
    });
    toggle.addEventListener('keydown',(event) => {
      if (!['ArrowDown','Enter',' '].includes(event.key)) return;
      event.preventDefault();
      setMega(toggle,true);
      focusFirstMegaItem(toggle);
    });
  });

  // The label remains a real destination; the adjacent arrow owns expansion.
  megaRoots.forEach((root) => {
    const link = root.querySelector(':scope > .ibt-shell-nav-link');
    const toggle = root.querySelector('[data-ibt-mega-toggle]');
    const menu = menuFor(toggle);
    if (!link || !toggle || !menu) return;
    link.setAttribute('aria-haspopup','true');
    link.setAttribute('aria-controls',menu.id);

    root.addEventListener('focusout',(event) => {
      const next = event.relatedTarget;
      if (next && root.contains(next)) return;
      requestAnimationFrame(() => { if (!root.contains(document.activeElement)) setMega(toggle,false); });
    });
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      root.addEventListener('pointerenter',() => setMega(toggle,true));
      root.addEventListener('pointerleave',() => {
        if (!root.contains(document.activeElement)) setMega(toggle,false);
      });
    }
  });

  document.addEventListener('click',(event) => { if (!event.target.closest('[data-ibt-mega-root]')) closeMega(); });
  document.addEventListener('keydown',(event) => {
    if (event.key === 'Escape' && lastMegaToggle) {
      const open = menuFor(lastMegaToggle)?.classList.contains('is-open');
      closeMega(null,open);
      lastMegaToggle = null;
    }
  });

  managedMenuButtons.forEach((button) => {
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    if (!menu) return;
    let previousOverflow = '';
   const focusables = () => [...menu.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')]
      .filter((item) => !item.hidden && item.getClientRects().length);

    const closeMenu = (restoreFocus = false) => {
      menu.classList.remove('open','is-open');
      menu.setAttribute('aria-hidden','true');
      button.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = previousOverflow;
      if (restoreFocus) button.focus();
    };

    const openMenu = () => {
      closeMega();
      previousOverflow = document.body.style.overflow;
      menu.classList.add('open','is-open');
      menu.setAttribute('aria-hidden','false');
      button.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      const firstItem = menu.querySelector('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])');
      firstItem?.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (!menu.contains(document.activeElement)) firstItem?.focus({ preventScroll: true });
      });
    };

    button.addEventListener('click',() => {
      const open = menu.classList.contains('open');
      if (open) closeMenu(true); else openMenu();
    });
    // Explicitly mirror native button keyboard activation. This keeps Enter and
    // Space reliable in assisted/headless input paths without causing duplicate clicks.
    button.addEventListener('keydown',(event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        button.click();
      } else if (event.key === ' ') {
        event.preventDefault();
      }
    });
    button.addEventListener('keyup',(event) => {
      if (event.key !== ' ') return;
      event.preventDefault();
      button.click();
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click',() => closeMenu()));
    menu.querySelectorAll('details').forEach((details) => {
      details.addEventListener('toggle',() => {
        if (!details.open) return;
        menu.querySelectorAll('details[open]').forEach((other) => { if (other !== details) other.open = false; });
      });
    });
    document.addEventListener('keydown',(event) => {
      if (!menu.classList.contains('open')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize',() => { if (innerWidth > 1180 && menu.classList.contains('open')) closeMenu(); },{passive:true});
  });

  managedThemeButtons.forEach((button) => {
    try {
      const saved = localStorage.getItem('ibtikar-theme');
      if (saved) document.documentElement.dataset.theme = saved;
    } catch {}
    button.addEventListener('click',() => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('ibtikar-theme',next); } catch {}
    });
  });

  /* Shared mobile drawer ------------------------------------------------ */
  const sharedMobileMenus = [...document.querySelectorAll('.ibt-shell-mobile-menu')];
  if (sharedMobileMenus.length) {
    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'ibt-mobile-backdrop';
    backdrop.setAttribute('aria-label','إغلاق القائمة الجانبية');
    backdrop.tabIndex = -1;
    document.body.appendChild(backdrop);

    const syncDrawer = (menu, toggle) => {
      const open = menu.classList.contains('open') || menu.classList.contains('is-open');
      backdrop.classList.toggle('is-open',open);
      backdrop.tabIndex = open ? 0 : -1;
      menu.toggleAttribute('inert',!open);
      toggle?.setAttribute('aria-label',open ? 'إغلاق القائمة' : 'فتح القائمة');
    };

    sharedMobileMenus.forEach((menu) => {
      const toggle = document.querySelector(`[aria-controls="${menu.id}"]`);
      if (!menu.querySelector('.ibt-mobile-menu-head')) {
        const head = document.createElement('div');
        head.className = 'ibt-mobile-menu-head';
        head.innerHTML = '<span><strong>القائمة</strong><small>ابتكار تك للحلول والخدمات الرقمية</small></span><button class="ibt-mobile-menu-close" type="button" aria-label="إغلاق القائمة">×</button>';
        menu.prepend(head);
        head.querySelector('button')?.addEventListener('click',() => {
          if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
        });
      }
      syncDrawer(menu,toggle);
      new MutationObserver(() => syncDrawer(menu,toggle)).observe(menu,{attributes:true,attributeFilter:['class','aria-hidden']});
      backdrop.addEventListener('click',() => {
        if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
      });
    });
  }

  const enhancePageContent = () => {
  /* One accordion behavior for every shared FAQ variant. */
  const faqButtonItems = [...document.querySelectorAll('#faq .accordion-item, #faq .faq-item, #faq .accordion > .faq, #faq .faq-list > .faq')];
  faqButtonItems.forEach((item) => {
    const button = item.querySelector('button');
    if (!button) return;
    button.addEventListener('click',() => requestAnimationFrame(() => {
      const open = item.classList.contains('open') || item.classList.contains('active');
      if (!open) return;
      faqButtonItems.forEach((other) => {
        if (other === item || other.closest('#faq') !== item.closest('#faq')) return;
        other.classList.remove('open','active');
        other.querySelector('button')?.setAttribute('aria-expanded','false');
        const answer = other.querySelector('.faq-answer,.accordion-content');
        if (answer) answer.style.maxHeight = '0px';
      });
    }));
  });

  document.querySelectorAll('#faq details').forEach((details) => {
    details.addEventListener('toggle',() => {
      if (!details.open) return;
      const list = details.parentElement;
      list?.querySelectorAll(':scope > details[open]').forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });

  /* Product-like related-service sliders with a text-link fallback. */
  const relatedData = {
    'services.html': { eyebrow:'ابدأ من الهدف', title:'الحلول والخدمات', description:'اختر المسار حسب النتيجة التي يحتاجها مشروعك، ثم نحدد أقل نطاق صحيح.', image:'/static/public_preview/assets/images/showcase/services-experience-source.png' },
    'ecommerce.html': { eyebrow:'تجارة إلكترونية', title:'حلول المتاجر الإلكترونية', description:'إطلاق وتخصيص وتحسين وقياس ضمن رحلة متجر مترابطة.', image:'/static/public_preview/assets/images/showcase/ecommerce-experience-source.png' },
    'store-launch.html': { eyebrow:'بداية صحيحة', title:'إطلاق متجر جديد', description:'من المنصة والهيكل إلى المحتوى والاختبار قبل أول عملية شراء.', image:'/static/public_preview/assets/images/services/ecommerce/store-launch.svg' },
    'storefront-customization.html': { eyebrow:'هوية وتجربة', title:'تخصيص واجهة المتجر', description:'واجهة تعكس العلامة وتحافظ على وضوح الاكتشاف والشراء.', image:'/static/public_preview/assets/images/services/ecommerce/storefront-customization.svg' },
    'store-redesign.html': { eyebrow:'متجر قائم', title:'إعادة تصميم المتجر', description:'إعادة ترتيب الهيكل والتجربة عندما تصبح التعديلات الجزئية غير كافية.', image:'/static/public_preview/assets/images/services/ecommerce/store-redesign.svg' },
    'product-page-optimization.html': { eyebrow:'قرار الشراء', title:'تحسين صفحة المنتج', description:'تنظيم الصور والمعلومات والخيارات والثقة حول الإجراء الأساسي.', image:'/static/public_preview/assets/images/services/ecommerce/product-experience.svg' },
    'ecommerce-growth.html': { eyebrow:'قياس وتحسين', title:'الربط والقياس والنمو', description:'بيانات أوضح وفرضيات قابلة للاختبار بدل قرارات مبنية على التخمين.', image:'/static/public_preview/assets/images/services/ecommerce/connect-growth.svg' },
    'ecommerce-support.html': { eyebrow:'استمرارية', title:'الدعم والتطوير المستمر', description:'طلبات وأولويات واختبارات موثقة تحافظ على سياق المتجر.', image:'/static/public_preview/assets/images/services/ecommerce/ongoing-support.svg' },
    'websites.html': { eyebrow:'تجربة ويب', title:'المواقع وصفحات الهبوط', description:'مواقع توضح القيمة وتقود العميل إلى الخطوة التالية.', image:'/static/public_preview/assets/images/services/discovery/web-experience.svg' },
    'brand-content.html': { eyebrow:'علامة متماسكة', title:'الهوية والمحتوى', description:'نظام بصري ولغوي يوحّد حضور العلامة عبر نقاط الاتصال.', image:'/static/public_preview/assets/images/services/discovery/brand-content.svg' },
    'growth.html': { eyebrow:'ظهور وقرار', title:'القياس والنمو', description:'SEO ومحتوى وتحسينات تبدأ من سؤال تجاري قابل للقياس.', image:'/static/public_preview/assets/images/services/discovery/growth-measurement.svg' },
    'custom-systems.html': { eyebrow:'ربط وأتمتة', title:'الأنظمة والحلول المخصصة', description:'ربط العمليات وتقليل العمل اليدوي عندما لا يكفي الحل الجاهز.', image:'/static/public_preview/assets/images/services/discovery/custom-systems.svg' },
    'tharaa.html': { eyebrow:'منتج من ابتكار تك', title:'ثيم ثراء لمتاجر سلة', description:'تجربة متجر مرنة توازن بين الهوية والاكتشاف وقرار الشراء.', image:'/static/public_preview/assets/images/showcase/tharaa-experience-source.png' },
    'portfolio.html': { eyebrow:'قرارات وتنفيذ', title:'أعمالنا', description:'حالات توضّح المشكلة والقرار والتنفيذ، لا لقطة الواجهة وحدها.', image:'/static/public_preview/assets/images/showcase/tharaa-product-source.png' },
    'knowledge.html': { eyebrow:'معرفة عملية', title:'الأدلة والمعرفة', description:'محتوى يساعدك على فهم الخيارات وتجهيز القرار التالي.', image:'/static/public_preview/assets/images/showcase/services-experience-source.png' }
  };

  const relatedTracks = [...document.querySelectorAll('.related-nav, .service-related-grid, .related-grid')];
  relatedTracks.forEach((track,index) => {
    if (track.dataset.ibtRelatedReady === 'true') return;
    const items = [...track.children].filter((item) => item.matches('a,article'));
    if (!items.length) return;
    track.dataset.ibtRelatedReady = 'true';
    track.classList.add('ibt-related-track');
    track.setAttribute('aria-label',track.getAttribute('aria-label') || 'خدمات ومسارات مرتبطة');

    items.forEach((item) => {
      item.classList.add('ibt-related-card');
      if (!(item instanceof HTMLAnchorElement) || item.querySelector('.ibt-related-card__body')) return;
      const route = (item.getAttribute('href') || '').split('#')[0].split('/').pop();
      const data = relatedData[route];
      if (!data) return;
      item.textContent = '';
      const media = document.createElement('span');
      media.className = 'ibt-related-card__media';
      media.innerHTML = `<img src="${data.image}" alt="" width="800" height="500" loading="lazy" decoding="async">`;
      const body = document.createElement('span');
      body.className = 'ibt-related-card__body';
      body.innerHTML = `<small>${data.eyebrow}</small><strong>${data.title}</strong><em>${data.description}</em><span class="ibt-related-card__cta">استكشف المسار ←</span>`;
      item.append(media,body);
      item.setAttribute('aria-label',`استكشف ${data.title}`);
    });

    if (items.length < 2) return;
    const controls = document.createElement('div');
    controls.className = 'ibt-related-controls';
    controls.setAttribute('aria-label','التنقل بين الخدمات المرتبطة');
    controls.innerHTML = '<button class="ibt-related-control" type="button" data-related-move="previous" aria-label="الخدمة السابقة">→</button><button class="ibt-related-control" type="button" data-related-move="next" aria-label="الخدمة التالية">←</button>';
    const sectionShell = track.parentElement;
    const heading = sectionShell?.querySelector(':scope > .platform-heading, :scope > .service-detail-heading, :scope > .svc-heading');
    if (heading) {
      const title = heading.querySelector('h2');
      const label = heading.querySelector(':scope > .section-kicker, :scope > span');
      if (title) title.textContent = 'خدمات مرتبطة';
      label?.remove();
      heading.classList.add('ibt-related-heading');

      const header = document.createElement('div');
      header.className = 'ibt-related-header';
      heading.before(header);
      header.append(heading,controls);
    } else {
      track.before(controls);
    }
    let current = 0;
    const syncControls = () => {
      controls.querySelector('[data-related-move="previous"]').disabled = current === 0;
      controls.querySelector('[data-related-move="next"]').disabled = current === items.length - 1;
    };
    const move = (delta) => {
      current = Math.max(0,Math.min(items.length - 1,current + delta));
      items[current].scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'nearest',inline:'start'});
      syncControls();
    };
    controls.querySelector('[data-related-move="previous"]').addEventListener('click',() => move(-1));
    controls.querySelector('[data-related-move="next"]').addEventListener('click',() => move(1));
    syncControls();
    track.id ||= `related-services-${index + 1}`;
    controls.querySelectorAll('button').forEach((button) => button.setAttribute('aria-controls',track.id));
  });

  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',enhancePageContent,{once:true});
  } else {
    enhancePageContent();
  }

  window.IBTIKAR_ANALYTICS?.init?.();
})();

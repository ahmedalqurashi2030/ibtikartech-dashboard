(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('[data-service-commerce-hero]');
  const mainImage = document.querySelector('[data-service-gallery-main]');
  const galleryButtons = [...document.querySelectorAll('[data-service-gallery-src]')];

  document.querySelector('.service-decision-nav:not([aria-label])')?.setAttribute('aria-label','دليل قرار الخدمة');
  document.querySelectorAll('.related-nav:not([aria-label])').forEach((nav) => nav.setAttribute('aria-label','خدمات ومسارات مرتبطة'));

  if (hero && mainImage && window.matchMedia('(pointer:fine)').matches && !reducedMotion) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      hero.style.setProperty('--mx', `${x * 100}%`);
      hero.style.setProperty('--my', `${y * 100}%`);
      mainImage.style.setProperty('--tilt-x', `${(x - .5) * 5}deg`);
      mainImage.style.setProperty('--tilt-y', `${(y - .5) * -4}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mx', '50%');
      hero.style.setProperty('--my', '35%');
      mainImage.style.setProperty('--tilt-x', '0deg');
      mainImage.style.setProperty('--tilt-y', '0deg');
    });
  }

  const activateGallery = (button) => {
    if (!button || !mainImage) return;
    const src = button.dataset.serviceGallerySrc;
    const alt = button.dataset.serviceGalleryAlt || '';
    if (!src) return;
    mainImage.style.opacity = '.25';
    window.setTimeout(() => {
      mainImage.src = src;
      mainImage.alt = alt;
      mainImage.style.opacity = '1';
    }, reducedMotion ? 0 : 120);
    galleryButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  };

  galleryButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
    button.addEventListener('click', () => activateGallery(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index + 1) % galleryButtons.length;
      if (event.key === 'ArrowRight') next = (index - 1 + galleryButtons.length) % galleryButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = galleryButtons.length - 1;
      galleryButtons[next]?.focus();
      activateGallery(galleryButtons[next]);
    });
  });

  document.querySelectorAll('[data-service-decision-tab="results"],[data-service-decision-panel="results"]').forEach((item) => item.remove());
  const tabs = [...document.querySelectorAll('[data-service-decision-tab]')];
  const panels = [...document.querySelectorAll('[data-service-decision-panel]')];
  const tablist = document.querySelector('[data-service-decision-tabs]');

  const activateTab = (key, focus = false) => {
    tabs.forEach((tab, index) => {
      const active = tab.dataset.serviceDecisionTab === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (!tab.id) tab.id = `service-decision-tab-${index + 1}`;
      const panel = panels.find((item) => item.dataset.serviceDecisionPanel === tab.dataset.serviceDecisionTab);
      if (panel) {
        if (!panel.id) panel.id = `service-decision-panel-${index + 1}`;
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.tabIndex = 0;
        panel.hidden = !active;
      }
      if (active && focus) tab.focus();
    });
  };

  if (tablist && tabs.length) {
    tablist.setAttribute('role', 'tablist');
    if (!tablist.hasAttribute('aria-label')) tablist.setAttribute('aria-label','تفاصيل الخدمة');
    tabs.forEach((tab) => {
      tab.setAttribute('role', 'tab');
      tab.addEventListener('click', () => activateTab(tab.dataset.serviceDecisionTab));
    });
    tablist.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = current;
      if (event.key === 'ArrowLeft') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowRight') next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activateTab(tabs[next].dataset.serviceDecisionTab, true);
      tabs[next].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    });
    activateTab(tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.serviceDecisionTab || tabs[0].dataset.serviceDecisionTab);
  }

  document.querySelectorAll('[data-open-service-tab]').forEach((link) => {
    link.addEventListener('click', () => activateTab(link.dataset.openServiceTab));
  });

  const scopeToggle = document.querySelector('[data-service-scope-toggle]');
  scopeToggle?.addEventListener('click', () => {
    const expanded = scopeToggle.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('[data-service-scope-extra]').forEach((item) => { item.hidden = expanded; });
    scopeToggle.setAttribute('aria-expanded', String(!expanded));
    scopeToggle.textContent = expanded ? 'عرض النطاق الكامل' : 'إخفاء التفاصيل الإضافية';
  });

  const hotspots = [...document.querySelectorAll('[data-storefront-hotspot]')];
  const anatomyTitle = document.querySelector('[data-storefront-anatomy-title]');
  const anatomyText = document.querySelector('[data-storefront-anatomy-text]');
  const anatomyList = document.querySelector('[data-storefront-anatomy-list]');
  const anatomyData = {
    header: { title: 'الهيدر والتنقل', text: 'نراجع وضوح الشعار والبحث والتصنيفات والإجراءات الرئيسية حتى لا تستهلك الواجهة أول ثواني العميل في البحث عن الطريق.', points: ['وضوح التنقل','البحث والوصول','أولوية الإجراءات'] },
    hero: { title: 'Hero والرسالة', text: 'نحوّل أول مساحة في المتجر من بنر تجميلي إلى رسالة مرتبطة بالعلامة والمنتج والهدف، مع CTA واضح وغير مزدحم.', points: ['الرسالة والقيمة','الصور والبنرات','CTA واحد واضح'] },
    sections: { title: 'الأقسام والمجموعات', text: 'نعيد ترتيب الأقسام بحسب رحلة الاكتشاف بدل تكديس مكونات الثيم، ونضبط المسافات والإيقاع البصري بين الكتل.', points: ['تسلسل الأقسام','المسافات والهرمية','عرض المجموعات'] },
    cards: { title: 'بطاقات المنتجات', text: 'نضبط الصورة والعنوان والسعر والإجراء لتبدو البطاقات جزءًا من هوية العلامة وتظل سهلة القراءة على الجوال.', points: ['نسبة الصور','وضوح السعر','CTA وحالات البطاقة'] }
  };

  const activateHotspot = (button) => {
    const data = anatomyData[button?.dataset.storefrontHotspot];
    if (!data || !anatomyTitle || !anatomyText || !anatomyList) return;
    hotspots.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    anatomyTitle.textContent = data.title;
    anatomyText.textContent = data.text;
    anatomyList.innerHTML = data.points.map((point) => `<li>${point}</li>`).join('');
  };

  hotspots.forEach((button) => button.addEventListener('click', () => activateHotspot(button)));
  if (hotspots[0]) activateHotspot(hotspots[0]);
})();

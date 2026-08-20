(() => {
  'use strict';

  const body = document.body;
  if (!body) return;

  const categoryPages = new Set(['websites', 'brand-content', 'growth', 'custom-systems']);
  const isSupportedPage = body.classList.contains('service-detail-page') || categoryPages.has(body.dataset.page || '');
  if (!isSupportedPage) return;

  const routeCatalog = new Map([
    ['/', {
      label: 'ابتكار تك',
      description: 'ارجع إلى الواجهة الرئيسية لاستكشاف المنظومة والمنتجات والخدمات.',
      image: '/static/public_preview/assets/images/showcase/services-experience-source.png'
    }],
    ['/services', {
      label: 'الحلول والخدمات',
      description: 'استعرض منظومة الخدمات كاملة واختر نقطة البداية الأقرب لهدف مشروعك.',
      image: '/static/public_preview/assets/images/showcase/services-experience-source.png'
    }],
    ['/ecommerce', {
      label: 'التجارة الإلكترونية',
      description: 'بناء وتطوير المتاجر من الإطلاق والواجهة إلى تجربة الشراء والقياس والنمو.',
      image: '/static/public_preview/assets/images/showcase/ecommerce-experience-source.png'
    }],
    ['/websites', {
      label: 'تجربة الويب',
      description: 'مواقع وصفحات هبوط عربية واضحة وسريعة تقود الزائر إلى الإجراء المناسب.',
      image: '/static/public_preview/assets/images/services/discovery/web-experience.svg'
    }],
    ['/brand-content', {
      label: 'الهوية والمحتوى',
      description: 'هوية بصرية ومحتوى رقمي متماسك يربط العلامة بكل نقاط الاتصال.',
      image: '/static/public_preview/assets/images/services/discovery/brand-content.svg'
    }],
    ['/growth', {
      label: 'الظهور والنمو',
      description: 'SEO وقياس وتحليلات وتحسينات مرتبة حسب البيانات والأثر المتوقع.',
      image: '/static/public_preview/assets/images/services/discovery/growth-measurement.svg'
    }],
    ['/custom-systems', {
      label: 'الأنظمة والأتمتة',
      description: 'أنظمة مخصصة وربط وأتمتة تقلل العمل اليدوي وتربط البيانات والعمليات.',
      image: '/static/public_preview/assets/images/services/discovery/automation-connect.svg'
    }],
    ['/services/store-launch', {
      label: 'STORE LAUNCH',
      description: 'إطلاق متجر من الهيكل والواجهة والمحتوى حتى الاختبار والاستعداد للنشر.',
      image: '/static/public_preview/assets/images/services/ecommerce/store-launch.svg'
    }],
    ['/services/storefront-customization', {
      label: 'STOREFRONT',
      description: 'تخصيص واجهة المتجر والثيم وترتيب الأقسام بما يعكس مستوى وهوية العلامة.',
      image: '/static/public_preview/assets/images/services/ecommerce/storefront-customization.svg'
    }],
    ['/services/store-redesign', {
      label: 'REDESIGN',
      description: 'إعادة بناء تجربة متجر قائم عندما تصبح التعديلات الصغيرة غير كافية.',
      image: '/static/public_preview/assets/images/services/ecommerce/store-redesign.svg'
    }],
    ['/services/product-page-optimization', {
      label: 'CONVERSION UX',
      description: 'تحسين الصور والمعلومات والثقة والخيارات والإجراء الأساسي في صفحة المنتج.',
      image: '/static/public_preview/assets/images/services/ecommerce/product-experience.svg'
    }],
    ['/services/ecommerce-growth', {
      label: 'CONNECT + GROW',
      description: 'ربط القياس والتحليلات وSEO والتكاملات بما يدعم قرارات نمو أوضح.',
      image: '/static/public_preview/assets/images/services/ecommerce/connect-growth.svg'
    }],
    ['/services/ecommerce-support', {
      label: 'CONTINUITY',
      description: 'دعم وتطوير مستمر للمتجر ضمن نطاق واضح بدل التعديلات المتفرقة.',
      image: '/static/public_preview/assets/images/services/ecommerce/ongoing-support.svg'
    }]
  ]);

  const fallback = {
    label: 'خدمة مرتبطة',
    description: 'مسار مكمل يمكن دمجه مع احتياج مشروعك حسب النطاق والأولوية.',
    image: '/static/public_preview/assets/images/showcase/services-experience-source.png'
  };

  const canonicalPath = (href) => {
    try {
      const url = new URL(href, location.href);
      let path = url.pathname.replace(/\/+$/, '') || '/';
      const file = path.split('/').pop() || '';
      if (file.endsWith('.html')) {
        const slug = file.slice(0, -5);
        const serviceFiles = new Set([
          'store-launch', 'storefront-customization', 'store-redesign',
          'product-page-optimization', 'ecommerce-growth', 'ecommerce-support'
        ]);
        if (slug === 'index') path = '/';
        else if (serviceFiles.has(slug)) path = `/services/${slug}`;
        else path = `/${slug}`;
      }
      return path;
    } catch (_) {
      return '';
    }
  };

  const createText = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text || '';
    return el;
  };

  const createCard = ({ href, title, label, description, image, imageAlt }) => {
    const article = document.createElement('article');
    article.className = 'service-related-card';
    article.setAttribute('role', 'listitem');

    const link = document.createElement('a');
    link.className = 'service-related-card__link';
    link.href = href;
    link.setAttribute('aria-label', `استكشف ${title}`);

    const media = document.createElement('figure');
    media.className = 'service-related-card__media';
    const img = document.createElement('img');
    img.src = image || fallback.image;
    img.alt = imageAlt || `معاينة توضيحية لخدمة ${title}`;
    img.width = 800;
    img.height = 500;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.appendChild(img);

    const content = document.createElement('div');
    content.className = 'service-related-card__body';
    content.appendChild(createText('span', 'service-related-card__eyebrow', label || fallback.label));
    content.appendChild(createText('h3', '', title));
    content.appendChild(createText('p', '', description || fallback.description));

    const footer = document.createElement('span');
    footer.className = 'service-related-card__action';
    footer.appendChild(createText('span', '', 'استكشف الخدمة'));
    footer.appendChild(createText('b', '', '←'));
    content.appendChild(footer);

    link.append(media, content);
    article.appendChild(link);
    return article;
  };

  const descriptorFromLink = (link) => {
    const path = canonicalPath(link.getAttribute('href') || link.href);
    const catalog = routeCatalog.get(path) || fallback;
    return {
      href: link.getAttribute('href') || link.href,
      title: (link.textContent || '').replace(/\s+/g, ' ').trim() || 'خدمة مرتبطة',
      label: catalog.label,
      description: catalog.description,
      image: catalog.image
    };
  };

  const replaceRelatedNav = (nav) => {
    if (!nav || nav.dataset.relatedCardsReady === 'true') return;
    const links = [...nav.querySelectorAll(':scope > a[href]')];
    if (!links.length) return;

    const grid = document.createElement('div');
    grid.className = 'service-related-cards';
    grid.setAttribute('role', 'list');
    grid.setAttribute('aria-label', nav.getAttribute('aria-label') || 'الخدمات المرتبطة');
    grid.dataset.relatedCardsReady = 'true';
    links.map(descriptorFromLink).forEach((item) => grid.appendChild(createCard(item)));
    nav.replaceWith(grid);
  };

  const replaceExistingRichGrid = (grid) => {
    if (!grid || grid.dataset.relatedCardsReady === 'true') return;
    const articles = [...grid.querySelectorAll(':scope > article')];
    if (!articles.length) return;

    const replacement = document.createElement('div');
    replacement.className = 'service-related-cards';
    replacement.setAttribute('role', 'list');
    replacement.setAttribute('aria-label', 'الخدمات المرتبطة');
    replacement.dataset.relatedCardsReady = 'true';

    articles.forEach((article) => {
      const link = article.querySelector('a[href]');
      if (!link) return;
      const catalog = routeCatalog.get(canonicalPath(link.getAttribute('href') || link.href)) || fallback;
      const image = article.querySelector('img');
      replacement.appendChild(createCard({
        href: link.getAttribute('href') || link.href,
        title: article.querySelector('h3')?.textContent?.trim() || link.textContent.trim(),
        label: article.querySelector(':scope > span')?.textContent?.trim() || catalog.label,
        description: article.querySelector('p')?.textContent?.trim() || catalog.description,
        image: image?.getAttribute('src') || catalog.image,
        imageAlt: image?.getAttribute('alt') || ''
      }));
    });

    if (replacement.children.length) grid.replaceWith(replacement);
  };

  document.querySelectorAll('.related-nav').forEach(replaceRelatedNav);
  document.querySelectorAll('.product-related-section .related-grid').forEach(replaceExistingRichGrid);
})();

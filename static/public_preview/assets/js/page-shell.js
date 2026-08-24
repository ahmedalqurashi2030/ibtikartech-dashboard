(() => {
  'use strict';

  // Django clean URLs are canonical. Template context supplies a stable page
  // identity so preserved page-specific enhancement logic can keep using its
  // historic page keys internally without exposing .html in browser navigation.
  const pageKey = (document.body.dataset.page || 'index').toLowerCase();
  const pathname = pageKey === 'index' ? 'index.html' : `${pageKey}.html`;
  const productPages = new Set(['tharaa.html']);
  const knowledgePages = new Set(['knowledge.html']);

  const cleanPublicRoutes = new Map([
    ['index.html', '/'],
    ['services.html', '/services/'],
    ['ecommerce.html', '/ecommerce/'],
    ['websites.html', '/websites/'],
    ['brand-content.html', '/brand-content/'],
    ['growth.html', '/growth/'],
    ['custom-systems.html', '/custom-systems/'],
    ['tharaa.html', '/tharaa/'],
    ['portfolio.html', '/portfolio/'],
    ['knowledge.html', '/knowledge/'],
    ['article-store-launch.html', '/knowledge/store-launch/'],
    ['article-product-page.html', '/knowledge/product-page/'],
    ['article-store-redesign.html', '/knowledge/store-redesign/'],
    ['about.html', '/about/'],
    ['contact.html', '/contact/'],
    ['store-launch.html', '/services/store-launch/'],
    ['storefront-customization.html', '/services/storefront-customization/'],
    ['store-redesign.html', '/services/store-redesign/'],
    ['product-page-optimization.html', '/services/product-page-optimization/'],
    ['ecommerce-growth.html', '/services/ecommerce-growth/'],
    ['ecommerce-support.html', '/services/ecommerce-support/'],
    ['404.html', '/404/'],
  ]);

  const retiredRoutes = new Map([
    ['salla.html', '/ecommerce/#platforms'],
    ['zid.html', '/ecommerce/#platforms'],
    ['shopify.html', '/ecommerce/#platforms'],
    ['woocommerce.html', '/ecommerce/#platforms'],
    ['wordpress.html', '/websites/#capabilities'],
  ]);

  const productionOrigin = 'https://ibtikartech.co';
  const previewOrigin = 'https://ibtikar-tech-frontend-rc.dev-sakhr.chatgpt.site/site/';

  const canonicalizePublicHref = (rawValue) => {
    const raw = String(rawValue || '').trim();
    if (!raw || raw.startsWith('#')) return raw;
    if (/^(?:mailto:|tel:|sms:|javascript:|data:|blob:)/i.test(raw)) return raw;

    try {
      const url = new URL(raw, location.href);
      if (url.origin !== location.origin) return raw;

      const basename = url.pathname.split('/').filter(Boolean).pop()?.toLowerCase() || '';
      const mappedPath = cleanPublicRoutes.get(basename) || retiredRoutes.get(basename);
      if (!mappedPath) return raw;

      const mapped = new URL(mappedPath, location.origin);
      // A legacy target may already define a canonical fragment (for example
      // retired platform pages -> #platforms). Preserve an explicit fragment
      // from the original link when present; otherwise keep the mapped one.
      if (url.search) mapped.search = url.search;
      if (url.hash) mapped.hash = url.hash;
      return `${mapped.pathname}${mapped.search}${mapped.hash}`;
    } catch (_) {
      return raw;
    }
  };

  const normalizePublicLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    const raw = link.getAttribute('href') || '';
    const clean = canonicalizePublicHref(raw);
    if (clean !== raw) {
      link.setAttribute('href', clean);
      link.dataset.cleanUrlNormalized = 'true';
    }
  };

  const normalizePublicDataHref = (node) => {
    if (!(node instanceof HTMLElement) || !node.hasAttribute('data-href')) return;
    const raw = node.getAttribute('data-href') || '';
    const clean = canonicalizePublicHref(raw);
    if (clean !== raw) node.setAttribute('data-href', clean);
  };

  const normalizePublicNavigation = (scope = document) => {
    if (scope instanceof HTMLAnchorElement) normalizePublicLink(scope);
    if (scope instanceof HTMLElement) normalizePublicDataHref(scope);
    scope.querySelectorAll?.('a[href]').forEach(normalizePublicLink);
    scope.querySelectorAll?.('[data-href]').forEach(normalizePublicDataHref);
  };

  // Run before preserved enhancement bundles can attach navigation behavior.
  // The observer also catches links/cards created later by those bundles.
  normalizePublicNavigation(document);
  const publicNavigationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        normalizePublicNavigation(mutation.target);
        return;
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) normalizePublicNavigation(node);
      });
    });
  });
  publicNavigationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'data-href'],
  });

  // Two preserved homepage interactions navigate through JavaScript closures
  // rather than an anchor's href. Capture them before the legacy handlers and
  // send them directly to the canonical Django route.
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const briefTrigger = target.closest('[data-open-brief]');
    if (briefTrigger) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.href = '/contact/#quote';
      return;
    }

    const mobileServiceCard = target.closest('.services-mobile-card[data-href]');
    if (!mobileServiceCard || target.closest('a,button,input,select,textarea')) return;
    const destination = canonicalizePublicHref(mobileServiceCard.getAttribute('data-href'));
    if (!destination) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = destination;
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const briefTrigger = target.closest('[data-open-brief]');
    if (briefTrigger) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.href = '/contact/#quote';
      return;
    }

    const mobileServiceCard = target.closest('.services-mobile-card[data-href]');
    if (!mobileServiceCard) return;
    const destination = canonicalizePublicHref(mobileServiceCard.getAttribute('data-href'));
    if (!destination) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = destination;
  }, true);

  const normalizeProductionMetadata = () => {
    const robots = document.querySelector('meta[name="robots"]')?.content?.toLowerCase() || '';
    const indexable = !robots.includes('noindex');
    const browserPath = location.pathname || '/';
    const canonicalPath = browserPath === '/' ? '/' : `${browserPath.replace(/\/+$/, '')}/`;
    const canonicalUrl = `${productionOrigin}${canonicalPath}`;

    if (indexable) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;

      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.content = canonicalUrl;
    }

    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      if (script.textContent?.includes(previewOrigin)) {
        script.textContent = script.textContent.replaceAll(previewOrigin, `${productionOrigin}/`);
      }
    });
  };

  normalizeProductionMetadata();

  let section = document.body.dataset.section || '';
  document.body.dataset.page = pageKey;
  if (productPages.has(pathname)) section = 'products';
  if (knowledgePages.has(pathname)) section = 'knowledge';

  document.querySelectorAll('[data-nav-key]').forEach((link) => {
    const active = link.dataset.navKey === section;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  document.querySelectorAll('#year').forEach((item) => {
    item.textContent = new Date().getFullYear();
  });

  // A preserved desktop Tharaa animation expects this retired track. Keep a
  // contained, non-visual target until the old scene runtime is fully removed.
  if (pathname === 'tharaa.html' && !document.querySelector('#libraryTrack')) {
    const guard = document.createElement('div');
    guard.className = 'library ibt-legacy-animation-guard';
    guard.dataset.ibtLegacyAnimationGuard = 'true';
    guard.setAttribute('aria-hidden', 'true');
    guard.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:1px!important;height:1px!important;overflow:hidden!important;contain:strict;opacity:0!important;pointer-events:none!important;z-index:-1!important;';
    const track = document.createElement('div');
    track.id = 'libraryTrack';
    track.style.cssText = 'width:100vw;height:1px;';
    guard.appendChild(track);
    document.body.appendChild(guard);
  }

  const ensureStylesheet = (href, id) => {
    if (document.getElementById(id) || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const ensureScript = (src, datasetKey) => {
    if (document.querySelector(`script[data-${datasetKey}]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset[datasetKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = 'true';
    document.body.appendChild(script);
  };

  // Shared presentation layers. Dashboard-owned refinements are mirrored into
  // the served assets tree so production Nginx can deliver them with normal static permissions.
  ensureStylesheet('/static/public_preview/assets/css/pages/ux-system-v1.css', 'ibtikar-ux-system-v1');
  ensureStylesheet('/static/public_preview/assets/css/pages/service-category-refinement-v1.css', 'ibtikar-service-category-refinement-v1');

  // Scope each special refinement layer to the relevant approved-source page.
  if (document.body.classList.contains('source-home')) {
    ensureStylesheet('/static/public_preview/assets/css/pages/homepage-refinement-v1.css', 'ibtikar-homepage-refinement-v1');
  }
  if (document.body.classList.contains('source-services')) {
    ensureStylesheet('/static/public_preview/assets/css/pages/services-refinement-v1.css', 'ibtikar-services-refinement-v1');
  }
  if (document.body.classList.contains('source-ecommerce')) {
    ensureStylesheet('/static/public_preview/assets/css/pages/ecommerce-refinement-v1.css', 'ibtikar-ecommerce-refinement-v1');
  }
  if (document.body.classList.contains('source-tharaa')) {
    ensureStylesheet('/static/public_preview/assets/css/pages/tharaa-refinement-v1.css', 'ibtikar-tharaa-refinement-v1');
  }

  const loadEnhancements = () => {
    ensureScript('/static/public_preview/assets/js/continuous-flow.js', 'continuous-flow');
    ensureScript('/static/public_preview/assets/js/frontend-final.js', 'frontend-final');
    if (pathname === 'index.html' || pathname === '') {
      ensureScript('/static/public_preview/assets/js/home-enhancements.js', 'strategy-enhancements');
      ensureScript('/static/public_preview/assets/js/home-experience-v2.js', 'home-experience-v2');
    } else {
      ensureScript('/static/public_preview/assets/js/strategy-enhancements.js', 'strategy-enhancements');
    }

    // Enhancement bundles may synchronously inject legacy relative links.
    // Normalize once more immediately; the observer protects later mutations.
    queueMicrotask(() => normalizePublicNavigation(document));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEnhancements, { once: true });
  } else {
    loadEnhancements();
  }
})();

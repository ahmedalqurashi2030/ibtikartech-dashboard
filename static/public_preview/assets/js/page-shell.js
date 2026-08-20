(() => {
  'use strict';

  const pathname = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const pageKey = pathname.replace(/\.html$/, '') || 'index';
  const productPages = new Set(['tharaa.html']);
  const knowledgePages = new Set(['knowledge.html']);
  const retiredRoutes = new Map([
    ['salla.html', 'ecommerce.html#platforms'],
    ['zid.html', 'ecommerce.html#platforms'],
    ['shopify.html', 'ecommerce.html#platforms'],
    ['woocommerce.html', 'ecommerce.html#platforms'],
    ['wordpress.html', 'websites.html#capabilities'],
  ]);

  const productionOrigin = 'https://ibtikartech.co';
  const previewOrigin = 'https://ibtikar-tech-frontend-rc.dev-sakhr.chatgpt.site/site/';

  const normalizeHomepageLegacyShell = () => {
    if (!document.body.classList.contains('source-home')) return;

    [...document.body.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes('Ibtikar Tech Homepage V7')) {
        node.remove();
      }
    });

    document.querySelector('body.source-home > .announcement')?.remove();
    document.querySelector('body.source-home > .skip-link')?.remove();
  };

  const normalizeProductionMetadata = () => {
    const robots = document.querySelector('meta[name="robots"]')?.content?.toLowerCase() || '';
    const indexable = !robots.includes('noindex');
    const canonicalPath = pathname === 'index.html' || pathname === '' ? '/' : `/${pathname}`;
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
  normalizeHomepageLegacyShell();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizeHomepageLegacyShell, { once: true });
  }

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

  document.querySelectorAll('a[href]').forEach((link) => {
    const raw = link.getAttribute('href') || '';
    const clean = raw.split('#')[0].toLowerCase();
    if (retiredRoutes.has(clean)) link.href = retiredRoutes.get(clean);
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

  // Shared presentation layers. The category layer is safely scoped by data-page,
  // so loading it globally avoids fragile page-specific loader state after imports.
  ensureStylesheet('/static/public_preview/assets/css/pages/ux-system-v1.css', 'ibtikar-ux-system-v1');
  ensureStylesheet('/static/public_preview/dashboard/service-category-refinement-v1.css', 'ibtikar-service-category-refinement-v1');

  // Dashboard-owned page refinements live outside imported assets so source syncs
  // cannot delete them. Scope each special layer to the relevant approved-source page.
  if (document.body.classList.contains('source-home')) {
    ensureStylesheet('/static/public_preview/dashboard/homepage-refinement-v1.css', 'ibtikar-homepage-refinement-v1');
  }
  if (document.body.classList.contains('source-services')) {
    ensureStylesheet('/static/public_preview/dashboard/services-refinement-v1.css', 'ibtikar-services-refinement-v1');
  }
  if (document.body.classList.contains('source-ecommerce')) {
    ensureStylesheet('/static/public_preview/dashboard/ecommerce-refinement-v1.css', 'ibtikar-ecommerce-refinement-v1');
  }
  if (document.body.classList.contains('source-tharaa')) {
    ensureStylesheet('/static/public_preview/dashboard/tharaa-refinement-v1.css', 'ibtikar-tharaa-refinement-v1');
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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEnhancements, { once: true });
  } else {
    loadEnhancements();
  }
})();
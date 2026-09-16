(() => {
  'use strict';

  function normalizeFaq(scope = document) {
    scope
      .querySelectorAll?.('#faq .faq, #faq .faq-item, #faq .accordion-item')
      .forEach((item) => {
        if (!item.hasAttribute('data-faq-item')) {
          item.setAttribute('data-faq-item', '');
        }
      });
  }

  function normalizeNativeServiceSlides(scope = document) {
    const cards = [];
    if (scope instanceof HTMLAnchorElement && scope.matches('.services-mobile-card')) cards.push(scope);
    scope.querySelectorAll?.('a.services-mobile-card').forEach((card) => cards.push(card));

    cards.forEach((card) => {
      // Native links keep native link semantics. Set membership metadata is not
      // valid on role=link and is already communicated by the carousel status.
      card.removeAttribute('aria-setsize');
      card.removeAttribute('aria-posinset');
      card.removeAttribute('aria-roledescription');
      if (card.getAttribute('role') === 'link') card.removeAttribute('role');
    });
  }

  function normalizeNamedSelects(scope = document) {
    const selects = [];
    if (scope instanceof HTMLSelectElement) selects.push(scope);
    scope.querySelectorAll?.('select').forEach((select) => selects.push(select));

    selects.forEach((select) => {
      if (select.labels?.length || select.hasAttribute('aria-label') || select.hasAttribute('aria-labelledby')) return;
      const container = select.closest('.studio-control, .field, .control-group');
      const label = container?.querySelector('label, .control-label');
      const name = (label?.textContent || '').replace(/\s+/g, ' ').trim();
      if (name) select.setAttribute('aria-label', name);
    });
  }

  function normalizeScrollableRegions(scope = document) {
    const regions = [];
    if (scope instanceof HTMLElement && scope.matches('.service-quick-info')) regions.push(scope);
    scope.querySelectorAll?.('.service-quick-info').forEach((region) => regions.push(region));

    regions.forEach((region) => {
      region.setAttribute('role', 'region');
      if (!region.hasAttribute('aria-label')) region.setAttribute('aria-label', 'معلومات الخدمة السريعة');
      if (!region.hasAttribute('tabindex')) region.tabIndex = 0;
    });
  }

  function normalizeDecorativeMockupHeadings(scope = document) {
    const headings = [];
    if (scope instanceof HTMLElement && scope.matches('body.source-tharaa #heroWindow .store-copy h3')) headings.push(scope);
    scope.querySelectorAll?.('body.source-tharaa #heroWindow .store-copy h3').forEach((heading) => headings.push(heading));

    headings.forEach((heading) => {
      // This text belongs to the decorative store preview, not the document
      // outline. Preserve its visual styling while removing false H1→H3 jumps
      // from the accessibility tree.
      heading.setAttribute('role', 'presentation');
    });
  }

  function normalize(scope = document) {
    normalizeFaq(scope);
    normalizeNativeServiceSlides(scope);
    normalizeNamedSelects(scope);
    normalizeScrollableRegions(scope);
    normalizeDecorativeMockupHeadings(scope);
  }

  normalize(document);

  // Some preserved enhancement bundles create or annotate UI after
  // DOMContentLoaded. Keep the final semantic contract correct without taking
  // ownership of their visual presentation or interaction logic.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        normalize(mutation.target);
        return;
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) normalize(node);
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-setsize', 'aria-posinset', 'aria-roledescription', 'role'],
  });
})();

(() => {
  'use strict';

  // Normalize equivalent FAQ markup variants into one behavior-facing contract.
  // Source/page-specific class names remain untouched so approved styling and
  // layout are preserved; shared runtime and QA can rely on data-faq-item.
  document
    .querySelectorAll('#faq .faq, #faq .faq-item, #faq .accordion-item')
    .forEach((item) => {
      if (!item.hasAttribute('data-faq-item')) {
        item.setAttribute('data-faq-item', '');
      }
    });
})();

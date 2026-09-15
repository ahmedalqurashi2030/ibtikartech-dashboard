(() => {
  'use strict';

  if (window.__ibtikarDisclosureRuntime) return;
  window.__ibtikarDisclosureRuntime = true;

  const roots = [...document.querySelectorAll('#faq, .faq-section, .service-faq-grid, [data-faq-accordion]')];
  const rootsToProcess = roots.length ? roots : [document.body];

  rootsToProcess.forEach((root) => {
    const items = [...root.querySelectorAll('.accordion-item, .faq-item, .accordion > .faq, .faq-list > .faq')];
    const getButton = (item) => item.querySelector(':scope > button');
    const getAnswer = (item, button) => {
      const controlsId = button?.getAttribute('aria-controls');
      if (controlsId) return document.getElementById(controlsId);
      return item.querySelector('.faq-answer, .accordion-content');
    };

    const setItemState = (item, open) => {
      const button = getButton(item);
      const answer = getAnswer(item, button);
      if (!button) return;

      item.classList.toggle('open', open);
      item.classList.toggle('active', open);
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));

      if (answer) {
        answer.hidden = !open;
        answer.setAttribute('aria-hidden', String(!open));
        if (item.classList.contains('faq-item') || answer.classList.contains('faq-answer')) {
          answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '0px';
        }
      }

      const icon = button.querySelector('i');
      if (icon && /^[+\-−]$/.test(icon.textContent.trim())) icon.textContent = open ? '−' : '+';
    };

    items.forEach((item) => {
      const button = getButton(item);
      if (!button || button.dataset.ibtDisclosureReady === 'true') return;
      button.dataset.ibtDisclosureReady = 'true';
      if (!button.type) button.type = 'button';

      const initiallyOpen = item.classList.contains('open')
        || item.classList.contains('active')
        || item.classList.contains('is-open')
        || button.getAttribute('aria-expanded') === 'true';
      setItemState(item, initiallyOpen);

      button.addEventListener('click', () => {
        const willOpen = !(item.classList.contains('open') || item.classList.contains('active') || item.classList.contains('is-open'));
        if (willOpen) {
          items.forEach((other) => {
            if (other !== item) setItemState(other, false);
          });
        }
        setItemState(item, willOpen);
      });
    });

    // Native details remains native. We only enforce the existing single-open
    // accordion policy where a FAQ root groups multiple disclosures.
    root.querySelectorAll('details').forEach((details) => {
      if (details.dataset.ibtDisclosureReady === 'true') return;
      details.dataset.ibtDisclosureReady = 'true';
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        root.querySelectorAll('details[open]').forEach((other) => {
          if (other !== details) other.open = false;
        });
      });
    });
  });
})();

(() => {
  if (window.__ibtikarContinuousFlow) return;
  window.__ibtikarContinuousFlow = true;

  const body = document.body;
  const main = document.querySelector('main');
  if (!body || !main) return;

  body.classList.add('ibt-continuous-flow');

  const immersivePattern = /(^|[-_])(hero|cinema|cinematic|lab|preview|studio|showcase|stage|banner|cta)([-_]|$)/i;

  const isImmersive = (section) => {
    const signature = [section.id, section.className].filter(Boolean).join(' ');
    if (immersivePattern.test(signature)) return true;
    if (section.matches('[data-flow-surface="immersive"]')) return true;
    if (section.querySelector(':scope > canvas, :scope > * > canvas')) return true;
    return false;
  };

  const addEdge = (section, side) => {
    if (section.querySelector(`:scope > .ibt-flow-edge--${side}`)) return;
    const edge = document.createElement('span');
    edge.className = `ibt-flow-edge ibt-flow-edge--${side}`;
    edge.setAttribute('aria-hidden', 'true');
    section.appendChild(edge);
  };

  const addTransition = (section) => {
    if (section.querySelector(':scope > .ibt-flow-transition')) return;
    const transition = document.createElement('span');
    transition.className = 'ibt-flow-transition';
    transition.setAttribute('aria-hidden', 'true');
    section.prepend(transition);
  };

  const process = () => {
    const sections = [...main.children].filter((node) => {
      if (!(node instanceof HTMLElement)) return false;
      return node.tagName === 'SECTION' || node.matches('.strategy-product-context,[data-strategy-stage]');
    });

    sections.forEach((section, index) => {
      if (section.dataset.ibtFlowReady === 'true') return;
      section.dataset.ibtFlowReady = 'true';
      section.classList.add('ibt-flow-section');

      if (isImmersive(section)) {
        section.classList.add('ibt-flow-section--immersive');
        if (index > 0) addEdge(section, 'top');
        addEdge(section, 'bottom');
      } else {
        section.classList.add('ibt-flow-section--blend');
        if (index > 0) addTransition(section);
      }
    });
  };

  process();

  const observer = new MutationObserver((records) => {
    if (!records.some((record) => [...record.addedNodes].some((node) => node.nodeType === 1))) return;
    process();
  });
  observer.observe(main, { childList: true });

  window.addEventListener('pageshow', process, { passive: true });
})();

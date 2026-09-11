/* Static templates own layout. Only dynamically inserted sections need registration. */
(() => {
  if (window.__ibtikarContinuousFlow) return;
  window.__ibtikarContinuousFlow = true;
  const main = document.getElementById('main-content');
  if (!main) return;
  const register = () => {
    main.querySelectorAll(':scope > section:not(.ibt-section)').forEach(section => {
      section.classList.add('ibt-section', 'ibt-section--content');
    });
  };
  register();
  new MutationObserver(register).observe(main, { childList: true });
})();

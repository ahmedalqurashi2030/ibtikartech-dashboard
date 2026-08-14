(() => {
  'use strict';
  const section = document.querySelector('.ibtx-tharaa-preview');
  if (!section) return;
  const stage = section.querySelector('.ibtx-preview-stage');
  const buttons = [...section.querySelectorAll('[data-device]')];
  if (!stage || !buttons.length) return;

  const setDevice = device => {
    if (device !== 'desktop' && device !== 'mobile') return;
    stage.dataset.activeDevice = device;
    buttons.forEach(button => {
      const active = button.dataset.device === device;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => setDevice(button.dataset.device));
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? 1 : -1;
      const next = buttons[(index + direction + buttons.length) % buttons.length];
      setDevice(next.dataset.device);
      next.focus();
    });
  });

  section.querySelectorAll('[aria-disabled="true"]').forEach(link => {
    link.addEventListener('click', event => event.preventDefault());
  });

  setDevice(stage.dataset.activeDevice || 'desktop');
})();
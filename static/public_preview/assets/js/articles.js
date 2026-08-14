(() => {
  const filters = [...document.querySelectorAll('[data-article-filter]')];
  const cards = [...document.querySelectorAll('[data-article-card]')];

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.articleFilter || 'all';
      filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      cards.forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  const copyButton = document.querySelector('[data-copy-link]');
  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyButton.dataset.copied = 'true';
      copyButton.textContent = 'تم نسخ الرابط';
      window.setTimeout(() => {
        copyButton.dataset.copied = 'false';
        copyButton.textContent = 'نسخ رابط المقال';
      }, 2200);
    } catch (_) {
      copyButton.textContent = 'انسخ الرابط من المتصفح';
    }
  });

  const tocLinks = [...document.querySelectorAll('.article-toc a[href^="#"]')];
  if (!tocLinks.length || !('IntersectionObserver' in window)) return;
  const sections = tocLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    tocLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-22% 0px -66% 0px' });
  sections.forEach((section) => observer.observe(section));
})();

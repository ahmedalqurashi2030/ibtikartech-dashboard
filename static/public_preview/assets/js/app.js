const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsapGate = window.IBTIKAR_GSAP;

function qs(selector, scope = document) { return scope.querySelector(selector); }
function qsa(selector, scope = document) { return [...scope.querySelectorAll(selector)]; }

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js-ready');

function initHeader() {
  const header = qs('[data-site-header], [data-ibtikar-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    header.classList.toggle('is-scrolled', y > 20);
    const isInner = document.body.classList.contains('inner-page');
    const menuBusy = document.body.classList.contains('menu-open') || header.querySelector('.ibt-shell-mega.is-open');
    const focused = header.contains(document.activeElement);
    const hide = !isInner && !menuBusy && !focused && y > lastY && y > 180;
    header.classList.toggle('hide', hide);
    header.classList.toggle('cinematic-hidden', hide);
    lastY = y;

    const bar = qs('#progressBar');
    if (bar) {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, y / max))})`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function initMobileMenuPage() {
  const menuBtn = qs('#menuBtn, [data-ibt-menu-toggle][data-ibt-menu-managed="page"]');
  const mobileMenu = qs('#mobileMenu, [data-mobile-menu]');
  if (!menuBtn || !mobileMenu) return;

  const close = (restore = false) => {
    mobileMenu.classList.remove('open', 'is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    if (restore) menuBtn.focus();
  };

  menuBtn.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open') && !mobileMenu.classList.contains('is-open');
    if (!open) return close(true);
    mobileMenu.classList.add('open', 'is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    requestAnimationFrame(() => mobileMenu.querySelector('a,button,summary')?.focus());
  });

  qsa('a', mobileMenu).forEach((link) => link.addEventListener('click', () => close()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('open')) close(true);
  });
}

function initReveal() {
  const items = qsa('.reveal');
  if (!items.length || prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible', 'in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible', 'in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '90px 0px -5% 0px' });
  items.forEach((item) => observer.observe(item));
}

function initFAQ() {
  qsa('.faq, [data-faq-item], .accordion-item').forEach((item) => {
    const button = qs('button', item);
    const answer = qs('.faq-answer', item);
    if (!button) return;
    button.addEventListener('click', () => {
      const open = !(item.classList.contains('open') || item.classList.contains('is-open'));
      item.classList.toggle('open', open);
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (answer) answer.setAttribute('aria-hidden', String(!open));
      const icon = qs('i', button);
      if (icon && icon.textContent) icon.textContent = open ? '−' : '+';
    });
  });
}

function initForms() {
  const cfg = window.IBTIKAR_CONFIG || {};
  const honeypot = cfg.forms?.honeypotField || 'ibt_website';

  qsa('[data-mock-form], [data-ibt-form]').forEach((form) => {
    const state = qs('[data-form-state]', form);
    const submit = qs('button[type="submit"]', form);
    let started = false;

    form.addEventListener('input', () => {
      if (started) return;
      started = true;
      window.IBTIKAR_ANALYTICS?.track(cfg.events?.formStart || 'form_start', { form: form.id || form.name });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const hp = qs(`[name="${honeypot}"]`, form);
      if (hp?.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        if (state) {
          state.className = 'form-message is-error';
          state.textContent = 'يرجى إكمال الحقول المطلوبة قبل المتابعة.';
        }
        window.IBTIKAR_ANALYTICS?.track(cfg.events?.formError || 'form_error', { form: form.id });
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent;
        submit.textContent = 'جار الحفظ...';
      }
      if (state) {
        state.className = 'form-message is-loading';
        state.textContent = 'يتم تجهيز نسخة الطلب على هذا الجهاز...';
      }

      window.setTimeout(() => {
        const payload = Object.fromEntries(new FormData(form).entries());
        let saved = false;
        try {
          localStorage.setItem('ibtikar:lastBrief', JSON.stringify({ ...payload, createdAt: new Date().toISOString() }));
          saved = true;
        } catch (_) {
          saved = false;
        }

        if (state) {
          state.className = saved ? 'form-message is-success' : 'form-message is-error';
          state.textContent = saved
            ? 'تم حفظ الطلب على هذا الجهاز للمعاينة. لن يصل إلى الفريق قبل ربط قناة الإرسال الرسمية.'
            : 'تعذر حفظ الطلب محليًا في هذا المتصفح. لم يتم إرسال أي بيانات خارجيًا.';
        }

        if (saved) {
          window.IBTIKAR_ANALYTICS?.track(form.dataset.analytics || cfg.events?.formSubmit || 'form_submit', { form: form.id });
          form.dispatchEvent(new CustomEvent('ibtikar:form-saved', { bubbles: true }));
          form.reset();
          started = false;
        } else {
          window.IBTIKAR_ANALYTICS?.track(cfg.events?.formError || 'form_error', { form: form.id });
        }

        if (submit) {
          submit.disabled = false;
          submit.textContent = submit.dataset.originalText || 'إرسال';
        }
      }, 500);
    });
  });
}

function initContactSteps() {
  const wrap = qs('[data-form-steps]');
  if (!wrap) return;
  const steps = qsa('[data-step]', wrap);
  const panels = qsa('[data-step-panel]', wrap);
  const nextBtns = qsa('[data-step-next]', wrap);
  const prevBtns = qsa('[data-step-prev]', wrap);
  let current = 0;

  function showStep(index, focus = false) {
    current = Math.max(0, Math.min(index, panels.length - 1));
    panels.forEach((panel, i) => {
      const active = i === current;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    steps.forEach((step, i) => {
      const active = i === current;
      step.classList.toggle('is-active', active);
      if (active) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    });
    if (focus) panels[current]?.querySelector('input,select,textarea,button')?.focus({ preventScroll: true });
  }

  nextBtns.forEach((btn) => btn.addEventListener('click', () => {
    const panel = panels[current];
    const required = qsa('input,select,textarea', panel).filter((el) => el.required);
    if (!required.every((el) => el.checkValidity())) {
      panel.querySelector(':invalid')?.reportValidity();
      return;
    }
    showStep(current + 1, true);
  }));

  prevBtns.forEach((btn) => btn.addEventListener('click', () => showStep(current - 1, true)));
  wrap.addEventListener('reset', () => requestAnimationFrame(() => showStep(0)));
  showStep(0);
}

function initCanvas() {
  if (prefersReducedMotion || gsapGate?.isLowPower?.()) return;
  qsa('[data-network-canvas], .hero-canvas, .lab-canvas').forEach((canvas) => {
    if (!canvas.id && !canvas.dataset.networkCanvas) canvas.dataset.networkCanvas = 'true';
    runNetworkCanvas(canvas);
  });
}

function runNetworkCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let points = [];
  let frame = 0;
  let inViewport = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.15 : 1.55);
    width = canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    height = canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const count = window.innerWidth < 760 ? 28 : 52;
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22 * dpr,
      vy: (Math.random() - 0.5) * 0.22 * dpr,
      r: (Math.random() * 1.4 + 0.45) * dpr
    }));
  }

  function shouldRun() { return inViewport && !document.hidden; }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function schedule() {
    if (!shouldRun() || frame) return;
    frame = requestAnimationFrame(draw);
  }

  function draw() {
    frame = 0;
    if (!shouldRun()) return;
    ctx.clearRect(0, 0, width, height);
    const colors = ['16,200,232', '79,125,243', '124,58,237', '236,72,153'];
    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${colors[index % colors.length]}, .5)`;
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = index + 1; j < points.length; j += 1) {
        const other = points[j];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        const limit = 125 * dpr;
        if (distance >= limit) continue;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${colors[index % colors.length]}, ${(1 - distance / limit) * 0.1})`;
        ctx.lineWidth = 0.65 * dpr;
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    });
    schedule();
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting;
    if (shouldRun()) schedule(); else stop();
  }, { rootMargin: '120px' });

  resize();
  visibilityObserver.observe(canvas);
  schedule();
  window.addEventListener('resize', () => { resize(); schedule(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (shouldRun()) schedule(); else stop(); });
}

function initYear() { qsa('#year').forEach((el) => { el.textContent = new Date().getFullYear(); }); }

function initThemePage() {
  const btn = qs('#themeToggle[data-ibt-theme-managed="page"], [data-ibt-theme-toggle][data-ibt-theme-managed="page"]');
  if (!btn) return;
  try {
    const saved = localStorage.getItem('ibtikar-theme');
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (_) {}
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('ibtikar-theme', next); } catch (_) {}
  });
}

function init() {
  initHeader();
  initMobileMenuPage();
  initReveal();
  initFAQ();
  initForms();
  initContactSteps();
  initCanvas();
  initYear();
  initThemePage();
  window.IBTIKAR_ANALYTICS?.init?.();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

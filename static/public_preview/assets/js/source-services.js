/* Ibtikar Tech services runtime — stabilized P0 contract. */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = document.getElementById('progressBar');

  if (bar) {
    let progressFrame = 0;
    addEventListener('scroll', () => {
      if (progressFrame) return;
      progressFrame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        progressFrame = 0;
      });
    }, { passive: true });
  }

  if (reduced) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('in'));
  } else if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealIO.unobserve(entry.target);
    }), { threshold: 0.13 });
    document.querySelectorAll('.reveal').forEach((element) => revealIO.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('in'));
  }

  function renderVisual(mode) {
    const body = document.getElementById('visualBody');
    const shell = document.getElementById('visualShell');
    const stageScreen = document.getElementById('stageScreen');
    if (!body || !shell || !stageScreen) return;

    shell.classList.add('switching');
    setTimeout(() => {
      body.className = 'visual-body';
      let html = '';
      if (mode === 'store') {
        body.classList.add('store-ui');
        html = '<div class="store-main"><div class="store-hero"></div><div class="product-row"><i></i><i></i><i></i></div></div><div class="store-side"><i></i><i></i><i></i></div>';
      } else if (mode === 'site') {
        body.classList.add('site-ui');
        html = '<div class="site-side"></div><div class="site-main"><i></i><i></i><i></i><i></i><i></i></div>';
      } else if (mode === 'app') {
        body.classList.add('app-ui');
        html = '<div class="phone"><div class="phone-screen"><div class="phone-notch"></div><div class="phone-card"></div><div class="phone-grid"><i></i><i></i><i></i><i></i></div></div></div><span class="api-node">API</span><span class="api-node">Dashboard</span><span class="api-node">Users</span>';
      } else if (mode === 'brand') {
        body.classList.add('brand-ui');
        html = '<div class="brand-main"><div class="brand-mark"><i></i><i></i><i></i></div></div><div class="palette"><i></i><i></i><i></i><i></i></div>';
      } else if (mode === 'growth') {
        body.classList.add('growth-ui');
        html = '<div class="metric-row"><i data-v="24"></i><i data-v="38"></i><i data-v="17"></i></div><div class="growth-main"><i style="--h:28%"></i><i style="--h:42%"></i><i style="--h:36%"></i><i style="--h:62%"></i><i style="--h:55%"></i><i style="--h:82%"></i><i style="--h:94%"></i></div>';
      } else {
        body.classList.add('auto-ui');
        html = '<div class="auto-main"><div class="auto-core">Automation</div><span class="auto-node">Store</span><span class="auto-node">CRM</span><span class="auto-node">WhatsApp</span><span class="auto-node">Analytics</span></div>';
      }
      body.innerHTML = html;
      stageScreen.dataset.mode = mode;
      shell.classList.remove('switching');
    }, 260);
  }

  const items = [...document.querySelectorAll('.service-item')];
  const label = document.getElementById('stageLabel');
  const count = document.getElementById('stageCount');
  const title = document.getElementById('visualTitle');
  const caption = document.getElementById('stageCaption');
  const totalLabel = String(items.length).padStart(2, '0');
  let current = items[0]?.dataset.mode || 'store';

  if (items.length) {
    renderVisual(current);
    if (count) count.textContent = `01 / ${totalLabel}`;

    if ('IntersectionObserver' in window) {
      const serviceIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio <= 0.42) return;
          const item = entry.target;
          const mode = item.dataset.mode;
          if (!mode || mode === current) return;

          current = mode;
          items.forEach((candidate) => candidate.classList.toggle('active', candidate === item));
          if (label) label.textContent = item.dataset.label || '';
          if (count) {
            const currentIndex = String(items.indexOf(item) + 1).padStart(2, '0');
            count.textContent = `${currentIndex} / ${totalLabel}`;
          }
          if (title) title.textContent = item.dataset.title || '';
          if (caption) caption.textContent = item.dataset.caption || '';
          renderVisual(mode);
        });
      }, { threshold: [0.42, 0.62], rootMargin: '-12% 0px -28%' });
      items.forEach((item) => serviceIO.observe(item));
    }
  }

  function canvasNetwork(canvas, accentMode) {
    if (reduced || !canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width;
    let height;
    let dpr;
    let points = [];
    let raf = 0;
    let running = false;
    let inView = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.15 : 1.55);
      width = canvas.width = Math.max(1, rect.width * dpr);
      height = canvas.height = Math.max(1, rect.height * dpr);
      points = Array.from({ length: innerWidth < 700 ? 28 : 52 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22 * dpr,
        vy: (Math.random() - 0.5) * 0.22 * dpr,
        r: (Math.random() * 1.5 + 0.45) * dpr,
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      const colors = accentMode
        ? ['26,209,238', '93,131,255', '138,92,246', '242,85,166']
        : ['93,131,255', '138,92,246'];

      points.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${colors[index % colors.length]},.5)`;
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();

        for (let siblingIndex = index + 1; siblingIndex < points.length; siblingIndex += 1) {
          const sibling = points[siblingIndex];
          const dx = point.x - sibling.x;
          const dy = point.y - sibling.y;
          const distance = Math.hypot(dx, dy);
          const limit = 125 * dpr;
          if (distance >= limit) continue;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${colors[index % colors.length]},${(1 - distance / limit) * 0.105})`;
          ctx.lineWidth = 0.65 * dpr;
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(sibling.x, sibling.y);
          ctx.stroke();
        }
      });
      raf = requestAnimationFrame(draw);
    };

    const syncAnimation = () => {
      const shouldRun = inView && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) draw();
      else cancelAnimationFrame(raf);
    };

    resize();
    addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
      const canvasObserver = new IntersectionObserver(([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        syncAnimation();
      }, { rootMargin: '160px 0px' });
      canvasObserver.observe(canvas);
    }
    document.addEventListener('visibilitychange', syncAnimation);
    syncAnimation();
  }

  canvasNetwork(document.getElementById('heroCanvas'), true);
  canvasNetwork(document.getElementById('labCanvas'), false);

  window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis) {
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
        const selector = link.getAttribute('href');
        if (!selector || selector === '#') return;
        const target = document.querySelector(selector);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target);
      }));
    }

    const orbit = document.querySelector('.service-orbit');
    const hero = document.querySelector('.hero');
    if (orbit && hero) {
      gsap.to(orbit, {
        y: -35,
        rotateZ: 0.8,
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  });

  const faqRoot = document.getElementById('faq');
  if (faqRoot) {
    const items = [...faqRoot.querySelectorAll('.faq')];
    items.forEach((item) => {
      const button = item.querySelector(':scope > button');
      const answer = item.querySelector('.faq-answer');
      if (!button || !answer || button.dataset.svcFaqReady === 'true') return;
      button.dataset.svcFaqReady = 'true';
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        items.forEach((candidate) => {
          const candidateBtn = candidate.querySelector(':scope > button');
          const candidateAnswer = candidate.querySelector('.faq-answer');
          if (candidateBtn) candidateBtn.setAttribute('aria-expanded', 'false');
          if (candidateAnswer) candidateAnswer.hidden = true;
        });
        button.setAttribute('aria-expanded', String(!open));
        answer.hidden = !open;
      });
    });
  }
})();

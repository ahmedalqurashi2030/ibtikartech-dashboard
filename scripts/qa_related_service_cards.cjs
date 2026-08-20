const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.DEBUG_PORT || 9444);
const profileDir = path.join(process.cwd(), '.related-cards-qa-chrome');

const routes = [
  '/websites/',
  '/brand-content/',
  '/growth/',
  '/custom-systems/',
  '/services/store-launch/',
  '/services/storefront-customization/',
  '/services/store-redesign/',
  '/services/product-page-optimization/',
  '/services/ecommerce-growth/',
  '/services/ecommerce-support/',
];

const viewports = [
  { name: 'desktop', width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 },
  { name: 'tablet', width: 820, height: 1180, mobile: false, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, mobile: true, deviceScaleFactor: 1 },
];

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function safeRm(target) { try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {} }

async function pollJson(url, attempts = 60) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await wait(200);
    }
  }
  throw lastError;
}

async function connectCdp(wsUrl, onEvent) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP connection timeout')), 5000);
    ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP connection failed')); }, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(String(event.data));
    if (data.id && pending.has(data.id)) {
      const pendingItem = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) pendingItem.reject(new Error(data.error.message || 'CDP command failed'));
      else pendingItem.resolve(data.result);
      return;
    }
    if (data.method) onEvent(data);
  });
  return {
    send(method, params = {}) {
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() { ws.close(); },
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  const result = response?.result;
  if (result?.subtype === 'error') throw new Error(result.description || 'Runtime evaluation error');
  return result?.value;
}

async function inspect(client, route, viewport, runtimeEvents) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await client.send('Page.navigate', { url: `${baseUrl}${route}` });
  await wait(900);
  await evaluate(client, `(() => {
    const related = document.querySelector('.service-related-cards, .service-related-grid, .related-nav');
    related?.scrollIntoView({ block: 'center', inline: 'nearest' });
    return Boolean(related);
  })()`);
  await wait(500);

  const metrics = await evaluate(client, `(() => {
    const tracks = [...document.querySelectorAll('.service-related-cards')];
    const track = tracks[0];
    const cards = track ? [...track.querySelectorAll(':scope > .service-related-card')] : [];
    const controls = document.querySelectorAll('.service-related-carousel__controls');
    const prev = document.querySelector('[data-related-prev]');
    const next = document.querySelector('[data-related-next]');
    const current = document.querySelector('[data-related-current]');
    const style = track ? getComputedStyle(track) : null;
    const cardStyle = cards[0] ? getComputedStyle(cards[0]) : null;
    const images = cards.map((card) => card.querySelector('img'));
    const links = cards.map((card) => card.querySelector('a[href]'));
    const cardsValid = cards.every((card) => Boolean(
      card.querySelector('.service-related-card__media img') &&
      card.querySelector('.service-related-card__eyebrow') &&
      card.querySelector('h3') &&
      card.querySelector('p') &&
      card.querySelector('.service-related-card__action') &&
      card.querySelector('.service-related-card__link')
    ));
    return {
      pathname: location.pathname,
      tracks: tracks.length,
      cards: cards.length,
      controls: controls.length,
      oldRelatedNav: document.querySelectorAll('.related-nav').length,
      cardsValid,
      imagesLoaded: images.every((img) => img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
      imageSources: images.map((img) => img?.getAttribute('src') || ''),
      hrefs: links.map((link) => link?.getAttribute('href') || ''),
      legacyHrefs: links.map((link) => link?.getAttribute('href') || '').filter((href) => /\\.html(?:[?#]|$)/i.test(href)),
      ariaCarousel: track?.getAttribute('aria-roledescription') || '',
      trackTabIndex: track?.tabIndex ?? -99,
      direction: style?.direction || '',
      display: style?.display || '',
      overflowX: style?.overflowX || '',
      snapType: style?.scrollSnapType || '',
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cardWidth: cards[0]?.getBoundingClientRect().width || 0,
      trackWidth: track?.getBoundingClientRect().width || 0,
      prevDisabled: Boolean(prev?.disabled),
      nextDisabled: Boolean(next?.disabled),
      currentText: current?.textContent?.trim() || '',
      statusText: document.querySelector('.service-related-carousel__status')?.textContent?.replace(/\\s+/g, ' ').trim() || '',
      visibleSlides: cards.filter((card) => card.classList.contains('is-visible-slide')).length,
      cardDirection: cardStyle?.direction || '',
    };
  })()`);

  if (viewport.name === 'mobile' && metrics.cards > 1 && !metrics.nextDisabled) {
    metrics.mobileAdvance = await evaluate(client, `(async () => {
      const next = document.querySelector('[data-related-next]');
      const current = document.querySelector('[data-related-current]');
      const track = document.querySelector('.service-related-cards');
      const before = current?.textContent?.trim() || '';
      const beforeScroll = track?.scrollLeft || 0;
      next?.click();
      await new Promise((resolve) => setTimeout(resolve, 650));
      return {
        before,
        after: current?.textContent?.trim() || '',
        beforeScroll,
        afterScroll: track?.scrollLeft || 0,
      };
    })()`);

    await evaluate(client, `(() => {
      const track = document.querySelector('.service-related-cards');
      track?.focus();
      return document.activeElement === track;
    })()`);
    const key = { key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37, nativeVirtualKeyCode: 37 };
    await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
    await wait(500);
    metrics.keyboardCurrent = await evaluate(client, `document.querySelector('[data-related-current]')?.textContent?.trim() || ''`);
  }

  return { route, viewport: viewport.name, metrics, runtimeEvents: [...runtimeEvents] };
}

function validate(result, failures) {
  const { route, viewport, metrics, runtimeEvents } = result;
  const prefix = `${route} [${viewport}]`;
  if (metrics.pathname !== route) failures.push(`${prefix}: pathname changed to ${metrics.pathname}`);
  if (metrics.tracks !== 1) failures.push(`${prefix}: expected one related-service track, found ${metrics.tracks}`);
  if (metrics.cards < 2) failures.push(`${prefix}: expected at least 2 related cards, found ${metrics.cards}`);
  if (metrics.controls !== 1) failures.push(`${prefix}: expected one carousel controls block, found ${metrics.controls}`);
  if (metrics.oldRelatedNav !== 0) failures.push(`${prefix}: old related-nav still present after enhancement`);
  if (!metrics.cardsValid) failures.push(`${prefix}: one or more cards missing image/eyebrow/title/description/action/link`);
  if (!metrics.imagesLoaded) failures.push(`${prefix}: one or more card images failed to load: ${metrics.imageSources.join(', ')}`);
  if (metrics.legacyHrefs.length) failures.push(`${prefix}: legacy .html hrefs found: ${metrics.legacyHrefs.join(', ')}`);
  if (metrics.ariaCarousel !== 'carousel') failures.push(`${prefix}: missing aria-roledescription=carousel`);
  if (metrics.trackTabIndex !== 0) failures.push(`${prefix}: carousel track is not keyboard focusable`);
  if (metrics.direction !== 'rtl' || metrics.cardDirection !== 'rtl') failures.push(`${prefix}: RTL direction not preserved`);
  if (metrics.display !== 'flex') failures.push(`${prefix}: carousel track is not flex`);
  if (!['auto', 'scroll'].includes(metrics.overflowX)) failures.push(`${prefix}: horizontal scrolling disabled (${metrics.overflowX})`);
  if (!metrics.snapType.includes('x')) failures.push(`${prefix}: scroll-snap x is not active (${metrics.snapType})`);
  if (metrics.documentOverflow > 2) failures.push(`${prefix}: page-level horizontal overflow ${metrics.documentOverflow}px`);
  if (metrics.visibleSlides < 1) failures.push(`${prefix}: no card marked as visible slide`);

  if (viewport === 'desktop' && metrics.cardWidth > (metrics.trackWidth / 2.5)) {
    failures.push(`${prefix}: desktop card width suggests fewer than ~3 cards (${metrics.cardWidth}/${metrics.trackWidth})`);
  }
  if (viewport === 'tablet' && metrics.cardWidth > (metrics.trackWidth / 1.7)) {
    failures.push(`${prefix}: tablet card width suggests fewer than ~2 cards (${metrics.cardWidth}/${metrics.trackWidth})`);
  }
  if (viewport === 'mobile' && !(metrics.cardWidth < metrics.trackWidth && metrics.cardWidth > metrics.trackWidth * 0.65)) {
    failures.push(`${prefix}: mobile card width not swipe-friendly (${metrics.cardWidth}/${metrics.trackWidth})`);
  }
  if (viewport === 'mobile' && metrics.mobileAdvance) {
    if (metrics.mobileAdvance.before === metrics.mobileAdvance.after) failures.push(`${prefix}: next button did not advance carousel status`);
    if (metrics.mobileAdvance.beforeScroll === metrics.mobileAdvance.afterScroll) failures.push(`${prefix}: next button did not move carousel`);
  }

  const severeEvents = runtimeEvents.filter((event) => {
    if (/favicon/i.test(event.url || '')) return false;
    if (event.type === 'network') return event.status >= 400;
    return event.type === 'exception' || event.type === 'error';
  });
  if (severeEvents.length) failures.push(`${prefix}: runtime/network errors ${JSON.stringify(severeEvents.slice(0, 5))}`);
}

async function reducedMotionCheck(client, failures) {
  await client.send('Emulation.setDeviceMetricsOverride', viewports[2]);
  await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await client.send('Page.navigate', { url: `${baseUrl}/services/product-page-optimization/` });
  await wait(750);
  const value = await evaluate(client, `(() => {
    const card = document.querySelector('.service-related-card');
    const image = document.querySelector('.service-related-card__media img');
    const button = document.querySelector('.service-related-carousel__buttons button');
    const track = document.querySelector('.service-related-cards');
    return {
      cardDuration: card ? getComputedStyle(card).transitionDuration : '',
      imageDuration: image ? getComputedStyle(image).transitionDuration : '',
      buttonDuration: button ? getComputedStyle(button).transitionDuration : '',
      scrollBehavior: track ? getComputedStyle(track).scrollBehavior : '',
    };
  })()`);
  const durations = [value.cardDuration, value.imageDuration, value.buttonDuration];
  if (durations.some((duration) => !duration.split(',').every((item) => parseFloat(item) === 0))) {
    failures.push(`reduced-motion: transitions remain active ${JSON.stringify(value)}`);
  }
}

(async () => {
  const executable = chromePath();
  if (!executable) throw new Error('Chrome/Chromium executable not found');
  safeRm(profileDir);
  const chrome = spawn(executable, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`, 'about:blank',
  ], { stdio: 'ignore' });

  const failures = [];
  const runtimeEvents = [];
  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === 'page');
    if (!pageTarget) throw new Error('No Chrome page target found');
    const client = await connectCdp(pageTarget.webSocketDebuggerUrl, (event) => {
      if (event.method === 'Runtime.exceptionThrown') {
        runtimeEvents.push({ type: 'exception', text: event.params.exceptionDetails?.text || 'runtime exception', url: event.params.exceptionDetails?.url || '' });
      }
      if (event.method === 'Log.entryAdded' && event.params.entry.level === 'error') {
        runtimeEvents.push({ type: 'error', text: event.params.entry.text, url: event.params.entry.url || '' });
      }
      if (event.method === 'Network.responseReceived') {
        const response = event.params.response;
        if (response.status >= 400) runtimeEvents.push({ type: 'network', status: response.status, url: response.url });
      }
    });
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');
    await client.send('Network.enable');

    let count = 0;
    for (const route of routes) {
      for (const viewport of viewports) {
        runtimeEvents.length = 0;
        const result = await inspect(client, route, viewport, runtimeEvents);
        validate(result, failures);
        count += 1;
        console.log(`✓ ${route} [${viewport.name}] cards=${result.metrics.cards}`);
      }
    }
    await reducedMotionCheck(client, failures);
    client.close();

    if (failures.length) {
      console.error('\nRelated Service Cards QA failed:');
      failures.forEach((failure) => console.error(`✗ ${failure}`));
      process.exitCode = 1;
    } else {
      console.log(`✓ Related Service Cards QA passed: ${count} route/viewport checks + reduced-motion`);
    }
  } finally {
    chrome.kill();
    await wait(300);
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.DEBUG_PORT || 9333);
const profileDir = path.join(process.cwd(), '.clean-url-qa-chrome');

const routes = [
  '/',
  '/services/',
  '/ecommerce/',
  '/websites/',
  '/brand-content/',
  '/growth/',
  '/custom-systems/',
  '/tharaa/',
  '/portfolio/',
  '/knowledge/',
  '/knowledge/store-launch/',
  '/knowledge/product-page/',
  '/knowledge/store-redesign/',
  '/about/',
  '/contact/',
  '/services/store-launch/',
  '/services/storefront-customization/',
  '/services/store-redesign/',
  '/services/product-page-optimization/',
  '/services/ecommerce-growth/',
  '/services/ecommerce-support/',
  '/404/',
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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeRm(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch (_) {
    // Best-effort cleanup only.
  }
}

async function pollJson(url, attempts = 60) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
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
    const timer = setTimeout(() => reject(new Error('CDP WebSocket connection timed out')), 5000);
    ws.addEventListener('open', () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    ws.addEventListener('error', (event) => {
      clearTimeout(timer);
      reject(new Error(`CDP WebSocket error: ${event.message || 'unknown error'}`));
    }, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(String(event.data));
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(new Error(data.error.message || 'CDP command failed'));
      else resolve(data.result);
      return;
    }
    if (data.method) onEvent(data);
  });

  return {
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() {
      ws.close();
    },
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  const result = response?.result;
  if (result?.subtype === 'error') {
    throw new Error(result.description || 'Runtime evaluation error');
  }
  return result?.value;
}

async function keyboardSmoke(client) {
  await evaluate(client, `(() => {
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
    return true;
  })()`);

  const seen = [];
  for (let index = 0; index < 8; index += 1) {
    const key = {
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9,
      nativeVirtualKeyCode: 9,
    };
    await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
    await wait(30);
    seen.push(await evaluate(client, `(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return 'document';
      return [el.tagName, el.id || '', el.getAttribute('href') || '', el.textContent || '']
        .join('|')
        .slice(0, 140);
    })()`));
  }

  const interactive = seen.filter((item) => item && item !== 'document');
  return new Set(interactive).size >= 2;
}

async function inspectPage(client, route, viewport, runtimeEvents) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Page.navigate', { url: `${baseUrl}${route}` });
  await wait(1500);

  const metrics = await evaluate(client, `(() => {
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) !== 0
        && rect.width > 0
        && rect.height > 0;
    };
    const links = [...document.querySelectorAll('a[href]')];
    const visibleLinks = links.filter(visible);
    const htmlLinks = visibleLinks
      .map((a) => a.getAttribute('href') || '')
      .filter((href) => /\\.html(?:[?#]|$)/i.test(href));
    const duplicateIds = [...document.querySelectorAll('[id]')]
      .map((el) => el.id)
      .filter((id, index, all) => id && all.indexOf(id) !== index)
      .filter((id, index, all) => all.indexOf(id) === index);
    const overflowers = [...document.querySelectorAll('body *')]
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          cls: String(el.className || '').slice(0, 90),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.right > innerWidth + 2 || item.left < -2 || item.width > innerWidth + 2)
      .slice(0, 12);
    const internalHrefs = visibleLinks
      .map((a) => a.getAttribute('href') || '')
      .filter((href) => href.startsWith('/') && !href.startsWith('//'));
    return {
      currentPath: window.location.pathname,
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      headerVisible: visible(document.querySelector('.ibt-shell-header')),
      footerVisible: visible(document.querySelector('.ibt-shell-footer')),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowers,
      htmlLinks,
      duplicateIds,
      internalHrefs,
      servicesAxes: document.querySelectorAll('.service-item').length,
      servicesCinema: Boolean(document.querySelector('.services-primary-cinema')),
      productRelatedHrefs: [...document.querySelectorAll('.related-grid article a[href]')]
        .map((a) => a.getAttribute('href') || ''),
      todoVisible: document.body.innerText.includes('[TODO:'),
      contactSubmitLabel: document.querySelector('#quote-form button[type="submit"]')?.textContent?.trim() || '',
      robots: document.querySelector('meta[name="robots"]')?.content || '',
    };
  })()`);

  metrics.keyboardMoved = await keyboardSmoke(client);
  return { route, viewport: viewport.name, metrics, runtimeEvents: [...runtimeEvents] };
}

function validate(result, failures, internalLinks) {
  const { route, viewport, metrics, runtimeEvents } = result;
  const prefix = `${route} [${viewport}]`;

  if (metrics.currentPath !== route) {
    failures.push(`${prefix}: browser pathname became ${metrics.currentPath}`);
  }
  if (!metrics.title) failures.push(`${prefix}: missing document title`);
  if (metrics.h1Count !== 1) failures.push(`${prefix}: expected one H1, found ${metrics.h1Count}`);
  if (!metrics.headerVisible) failures.push(`${prefix}: shared header is not visible`);
  if (!metrics.footerVisible) failures.push(`${prefix}: shared footer is not visible`);
  if (!metrics.keyboardMoved) failures.push(`${prefix}: keyboard Tab did not move across controls`);
  if (metrics.todoVisible) failures.push(`${prefix}: visible TODO placeholder found`);
  if (metrics.duplicateIds.length) {
    failures.push(`${prefix}: duplicate IDs: ${metrics.duplicateIds.join(', ')}`);
  }
  if (metrics.htmlLinks.length) {
    failures.push(`${prefix}: visible legacy .html links: ${metrics.htmlLinks.join(', ')}`);
  }
  if (metrics.scrollWidth > metrics.clientWidth + 2) {
    failures.push(
      `${prefix}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.clientWidth}px; `
      + `elements=${JSON.stringify(metrics.overflowers)}`,
    );
  }

  const severeEvents = runtimeEvents.filter((event) => {
    if (/favicon/i.test(event.url || '')) return false;
    if (event.type === 'network') return event.status >= 400;
    return event.type === 'exception' || event.type === 'error';
  });
  if (severeEvents.length) {
    failures.push(`${prefix}: runtime/network errors ${JSON.stringify(severeEvents.slice(0, 6))}`);
  }

  if (route === '/services/') {
    if (!metrics.servicesCinema) failures.push(`${prefix}: services cinematic block missing`);
    if (metrics.servicesAxes !== 6) failures.push(`${prefix}: expected 6 service axes, found ${metrics.servicesAxes}`);
  }

  if (route === '/services/product-page-optimization/') {
    if (metrics.productRelatedHrefs.length !== 4) {
      failures.push(`${prefix}: expected 4 related service cards, found ${metrics.productRelatedHrefs.length}`);
    }
    const legacyRelated = metrics.productRelatedHrefs.filter((href) => /\\.html(?:[?#]|$)/i.test(href));
    if (legacyRelated.length) {
      failures.push(`${prefix}: related cards expose .html URLs: ${legacyRelated.join(', ')}`);
    }
  }

  if (route === '/contact/') {
    if (!/noindex/i.test(metrics.robots)) {
      failures.push(`${prefix}: contact preview should remain noindex until submission backend is connected`);
    }
    if (metrics.contactSubmitLabel !== 'حفظ مسودة الطلب') {
      failures.push(`${prefix}: unexpected contact submit label: ${metrics.contactSubmitLabel}`);
    }
  }

  for (const href of metrics.internalHrefs) {
    const pathname = href.split('#')[0].split('?')[0];
    if (pathname) internalLinks.add(pathname);
  }
}

async function verifyInternalLinks(internalLinks, failures) {
  const ignoredPrefixes = ['/static/', '/media/', '/django-admin/', '/control/'];
  for (const pathname of [...internalLinks].sort()) {
    if (ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) continue;
    try {
      const response = await fetch(`${baseUrl}${pathname}`, { redirect: 'follow' });
      if (response.status >= 400) {
        failures.push(`internal link ${pathname} returned ${response.status}`);
      }
      if (/\\.html(?:[?#]|$)/i.test(response.url)) {
        failures.push(`internal link ${pathname} ended on legacy .html URL ${response.url}`);
      }
    } catch (error) {
      failures.push(`internal link ${pathname} failed: ${error.message}`);
    }
  }
}

(async () => {
  const executable = chromePath();
  if (!executable) throw new Error('Chrome/Chromium executable not found');
  safeRm(profileDir);

  const chrome = spawn(executable, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  const runtimeEvents = [];
  const failures = [];
  const internalLinks = new Set();

  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === 'page');
    if (!pageTarget) throw new Error('No Chrome page target found');

    const client = await connectCdp(pageTarget.webSocketDebuggerUrl, (event) => {
      if (event.method === 'Runtime.exceptionThrown') {
        const details = event.params.exceptionDetails;
        runtimeEvents.push({
          type: 'exception',
          text: details.exception?.description || details.text,
          url: details.url,
        });
      }
      if (event.method === 'Log.entryAdded' && event.params.entry.level === 'error') {
        runtimeEvents.push({
          type: 'error',
          text: event.params.entry.text,
          url: event.params.entry.url,
        });
      }
      if (event.method === 'Network.responseReceived') {
        const response = event.params.response;
        if (response.status >= 400) {
          runtimeEvents.push({ type: 'network', status: response.status, url: response.url });
        }
      }
    });

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');
    await client.send('Network.enable');

    let inspected = 0;
    for (const route of routes) {
      for (const viewport of viewports) {
        runtimeEvents.length = 0;
        const result = await inspectPage(client, route, viewport, runtimeEvents);
        validate(result, failures, internalLinks);
        inspected += 1;
        console.log(`✓ ${route} [${viewport.name}]`);
      }
    }

    await verifyInternalLinks(internalLinks, failures);
    client.close();

    if (failures.length) {
      console.error('\nClean URL Browser QA failed:');
      for (const failure of failures) console.error(`✗ ${failure}`);
      process.exitCode = 1;
    } else {
      console.log(`✓ Clean URL Browser QA passed: ${inspected} page/viewport checks`);
      console.log(`✓ Verified ${internalLinks.size} unique visible internal routes`);
    }
  } finally {
    chrome.kill();
    await wait(350);
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

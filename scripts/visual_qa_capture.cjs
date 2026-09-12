const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.DEBUG_PORT || 9444);
const outputDir = path.resolve(process.env.VISUAL_QA_OUTPUT || 'artifacts/ui-qa');
const profileDir = path.join(process.cwd(), '.visual-qa-chrome');

const routes = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services/' },
  { name: 'ecommerce', path: '/ecommerce/' },
  { name: 'websites', path: '/websites/' },
  { name: 'brand-content', path: '/brand-content/' },
  { name: 'growth', path: '/growth/' },
  { name: 'custom-systems', path: '/custom-systems/' },
  { name: 'store-launch', path: '/services/store-launch/' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 },
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
  try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {}
}

async function pollJson(url, attempts = 80) {
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
    const timer = setTimeout(() => reject(new Error('CDP WebSocket connection timed out')), 6000);
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
      const pendingCall = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) pendingCall.reject(new Error(data.error.message || 'CDP command failed'));
      else pendingCall.resolve(data.result);
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
    close() { ws.close(); },
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response?.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return response?.result?.value;
}

async function settlePage(client) {
  await evaluate(client, `(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const step = Math.max(320, Math.floor(innerHeight * 0.78));
    for (let y = 0; y <= max; y += step) {
      scrollTo(0, y);
      await sleep(55);
    }
    scrollTo(0, 0);
    await sleep(220);
    return true;
  })()`);
}

async function captureFullPage(client, filename) {
  const layout = await client.send('Page.getLayoutMetrics');
  const size = layout.cssContentSize || layout.contentSize;
  const width = Math.max(1, Math.ceil(size.width));
  const height = Math.max(1, Math.ceil(size.height));
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  fs.writeFileSync(filename, Buffer.from(result.data, 'base64'));
  return { width, height };
}

async function inspect(client) {
  return evaluate(client, `(() => {
    const root = document.documentElement;
    const body = document.body;
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) !== 0 && rect.width > 0 && rect.height > 0;
    };
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
      .slice(0, 16);
    return {
      title: document.title,
      pathname: location.pathname,
      dir: root.getAttribute('dir') || '',
      theme: root.dataset.theme || '',
      h1Count: document.querySelectorAll('h1').length,
      headerVisible: visible(document.querySelector('.ibt-shell-header')),
      footerVisible: visible(document.querySelector('.ibt-shell-footer')),
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      scrollHeight: root.scrollHeight,
      overflowers,
      bodyClass: body.className,
    };
  })()`);
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  safeRm(profileDir);

  const executable = chromePath();
  if (!executable) throw new Error('Chrome/Chromium executable not found');

  const chrome = spawn(executable, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  const runtimeEvents = [];
  const report = [];
  let client;

  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === 'page');
    if (!pageTarget) throw new Error('No Chrome page target found');

    client = await connectCdp(pageTarget.webSocketDebuggerUrl, (event) => {
      if (event.method === 'Runtime.exceptionThrown') {
        runtimeEvents.push({ type: 'exception', details: event.params?.exceptionDetails?.text || 'runtime exception' });
      }
      if (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params?.entry?.level)) {
        runtimeEvents.push({ type: 'console', level: event.params.entry.level, text: event.params.entry.text });
      }
    });

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');

    for (const viewport of viewports) {
      for (const route of routes) {
        runtimeEvents.length = 0;
        await client.send('Emulation.setDeviceMetricsOverride', viewport);
        await client.send('Page.navigate', { url: `${baseUrl}${route.path}` });
        await wait(1500);
        await settlePage(client);
        const metrics = await inspect(client);
        const filename = path.join(outputDir, `${route.name}-${viewport.name}.png`);
        const screenshot = await captureFullPage(client, filename);
        report.push({
          route: route.path,
          name: route.name,
          viewport: viewport.name,
          viewportSize: { width: viewport.width, height: viewport.height },
          screenshot,
          metrics,
          runtimeEvents: [...runtimeEvents].slice(0, 20),
        });
        console.log(`captured ${route.path} [${viewport.name}] -> ${path.relative(process.cwd(), filename)}`);
      }
    }

    fs.writeFileSync(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    const summary = [
      '# Ibtikar Tech Visual QA Capture',
      '',
      `Generated: ${new Date().toISOString()}`,
      `Routes: ${routes.length}`,
      `Viewports: ${viewports.map((item) => item.name).join(', ')}`,
      '',
      '| Route | Viewport | Page size | Horizontal overflow | Runtime events |',
      '| --- | --- | ---: | --- | ---: |',
      ...report.map((item) => {
        const overflow = item.metrics.scrollWidth > item.metrics.clientWidth + 2 ? 'YES' : 'No';
        return `| ${item.route} | ${item.viewport} | ${item.screenshot.width}×${item.screenshot.height} | ${overflow} | ${item.runtimeEvents.length} |`;
      }),
      '',
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, 'SUMMARY.md'), summary);
  } finally {
    try { client?.close(); } catch (_) {}
    try { chrome.kill('SIGTERM'); } catch (_) {}
    await wait(250);
    if (!chrome.killed) {
      try { chrome.kill('SIGKILL'); } catch (_) {}
    }
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(`Visual QA capture failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.RELEASE_A11Y_DEBUG_PORT || 9777);
const axePath = process.env.AXE_PATH;
const outputDir = path.resolve(process.env.RELEASE_QA_OUTPUT || 'artifacts/release-qa');
const profileDir = path.join(process.cwd(), '.release-a11y-chrome');

const routes = [
  '/', '/services/', '/ecommerce/', '/websites/', '/brand-content/', '/growth/',
  '/custom-systems/', '/tharaa/', '/portfolio/', '/knowledge/',
  '/knowledge/store-launch/', '/knowledge/product-page/', '/knowledge/store-redesign/',
  '/about/', '/contact/', '/services/store-launch/', '/services/storefront-customization/',
  '/services/store-redesign/', '/services/product-page-optimization/',
  '/services/ecommerce-growth/', '/services/ecommerce-support/', '/404/',
];

const criticalMobileRoutes = new Set([
  '/', '/services/', '/ecommerce/', '/tharaa/', '/knowledge/', '/contact/',
  '/services/product-page-optimization/',
]);

const desktop = { width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 };
const mobile = { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function safeRm(target) {
  try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {}
}

function chromePath() {
  return [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean).find((candidate) => fs.existsSync(candidate));
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

async function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP connection timed out')), 6000);
    ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP WebSocket error')); }, { once: true });
  });

  let id = 1;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const payload = JSON.parse(String(event.data));
    const call = pending.get(payload.id);
    if (!call) return;
    pending.delete(payload.id);
    if (payload.error) call.reject(new Error(payload.error.message || 'CDP command failed'));
    else call.resolve(payload.result);
  });

  return {
    send(method, params = {}) {
      const callId = id++;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
    },
    close() { try { ws.close(); } catch (_) {} },
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response?.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return response?.result?.value;
}

async function navigate(client, route, viewport) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Page.navigate', { url: `${baseUrl}${route}` });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ready = await evaluate(client, "document.readyState === 'complete'");
    if (ready) break;
    await wait(100);
  }
  await wait(450);
  const pathname = await evaluate(client, 'location.pathname');
  if (pathname !== route) throw new Error(`${route}: browser ended at ${pathname}`);
}

async function audit(client, route, viewportName, viewport) {
  await navigate(client, route, viewport);
  const result = await evaluate(client, `(async()=>{
    if(!window.axe) throw new Error('axe-core was not injected');
    const report = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] },
      resultTypes: ['violations'],
    });
    return report.violations.map((violation)=>({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.slice(0,8).map((node)=>({
        target: node.target,
        html: node.html.slice(0,260),
        failureSummary: node.failureSummary,
      })),
    }));
  })()`);
  return { route, viewport: viewportName, violations: result || [] };
}

(async () => {
  if (!axePath || !fs.existsSync(axePath)) throw new Error(`AXE_PATH is missing or invalid: ${axePath || '(empty)'}`);
  const executable = chromePath();
  if (!executable) throw new Error('Chrome/Chromium executable not found');

  fs.mkdirSync(outputDir, { recursive: true });
  safeRm(profileDir);
  const axeSource = fs.readFileSync(axePath, 'utf8');
  const chrome = spawn(executable, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDir}`, 'about:blank',
  ], { stdio: 'ignore' });

  let client;
  const audits = [];
  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page = targets.find((target) => target.type === 'page');
    if (!page) throw new Error('No Chrome page target found');
    client = await connectCdp(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.addScriptToEvaluateOnNewDocument', { source: axeSource });

    for (const route of routes) {
      audits.push(await audit(client, route, 'desktop', desktop));
      if (criticalMobileRoutes.has(route)) audits.push(await audit(client, route, 'mobile', mobile));
    }

    const blocking = audits.flatMap((entry) => entry.violations
      .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
      .map((violation) => ({ route: entry.route, viewport: entry.viewport, ...violation })));

    const summary = {
      generatedAt: new Date().toISOString(),
      auditedViews: audits.length,
      blockingViolations: blocking.length,
      audits,
    };
    fs.writeFileSync(path.join(outputDir, 'axe-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

    if (blocking.length) {
      console.error(`Accessibility release QA failed with ${blocking.length} serious/critical violation(s).`);
      blocking.forEach((item) => console.error(`✗ ${item.route} [${item.viewport}] ${item.impact} ${item.id}: ${item.help}`));
      process.exitCode = 1;
    } else {
      console.log(`✓ axe-core WCAG release QA passed across ${audits.length} route/viewport views with no serious or critical violations.`);
    }
  } finally {
    client?.close();
    try { chrome.kill('SIGTERM'); } catch (_) {}
    await wait(250);
    try { if (!chrome.killed) chrome.kill('SIGKILL'); } catch (_) {}
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

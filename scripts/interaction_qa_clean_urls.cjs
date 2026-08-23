const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.INTERACTION_DEBUG_PORT || 9444);
const profileDir = path.join(process.cwd(), '.clean-url-interaction-chrome');
const DESKTOP = { width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 };
const MOBILE = { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 };

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function connectCdp(wsUrl) {
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
    if (!data.id || !pending.has(data.id)) return;
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(new Error(data.error.message || 'CDP command failed'));
    else resolve(data.result);
  });

  return {
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() {
      try { ws.close(); } catch (_) {}
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
  if (result?.subtype === 'error') throw new Error(result.description || 'Runtime evaluation error');
  return result?.value;
}

async function waitFor(client, expression, label, attempts = 60, interval = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(client, `Boolean(${expression})`)) return;
    await wait(interval);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function navigate(client, route, viewport, extraSettle = 0) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Page.navigate', { url: `${baseUrl}${route}` });
  await waitFor(client, "document.readyState === 'complete'", `${route} document readiness`);
  if (extraSettle) await wait(extraSettle);
  const pathname = await evaluate(client, 'location.pathname');
  assert(pathname === route, `${route}: browser ended at ${pathname}`);
  assert(!pathname.includes('.html'), `${route}: legacy .html appeared in browser pathname`);
}

async function focus(client, selector, index = 0) {
  const result = await evaluate(client, `(() => {
    const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const el = nodes[${index}];
    if (!el) return {ok:false, reason:'missing', count:nodes.length};
    el.scrollIntoView({block:'center', inline:'center'});
    el.focus({preventScroll:true});
    let ancestor = el.parentElement;
    let inertAncestor = null;
    while (ancestor) {
      if (ancestor.hasAttribute('inert')) {
        inertAncestor = ancestor.tagName.toLowerCase() + (ancestor.id ? '#' + ancestor.id : '');
        break;
      }
      ancestor = ancestor.parentElement;
    }
    return {
      ok: document.activeElement === el,
      count: nodes.length,
      disabled: Boolean(el.disabled),
      tabIndex: el.tabIndex,
      inertAncestor,
      element: el.outerHTML?.slice(0, 220) || '',
    };
  })()`);
  assert(result.ok, `Could not focus ${selector}[${index}]: ${JSON.stringify(result)}`);
}

async function key(client, keyName) {
  const meta = {
    Enter: { key: 'Enter', code: 'Enter', keyCode: 13, text: '\r' },
    ' ': { key: ' ', code: 'Space', keyCode: 32, text: ' ' },
    Escape: { key: 'Escape', code: 'Escape', keyCode: 27 },
    ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
  }[keyName];
  if (!meta) throw new Error(`Unsupported key ${keyName}`);
  const common = {
    key: meta.key,
    code: meta.code,
    windowsVirtualKeyCode: meta.keyCode,
    nativeVirtualKeyCode: meta.keyCode,
  };
  const down = { type: 'keyDown', ...common };
  if (meta.text !== undefined) {
    down.text = meta.text;
    down.unmodifiedText = meta.text;
  }
  await client.send('Input.dispatchKeyEvent', down);
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...common });
}

async function setValue(client, selector, value) {
  const ok = await evaluate(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
    return true;
  })()`);
  assert(ok, `Could not set ${selector}`);
}

async function testDesktopMega(client) {
  await navigate(client, '/', DESKTOP);
  const selector = '[data-ibt-mega-toggle][aria-controls="solutionsServicesMega"]';
  await focus(client, selector);
  await key(client, 'Enter');
  await wait(120);
  let state = await evaluate(client, `(() => {
    const toggle = document.querySelector(${JSON.stringify(selector)});
    const menu = document.getElementById('solutionsServicesMega');
    return {
      expanded: toggle?.getAttribute('aria-expanded'),
      hidden: menu?.getAttribute('aria-hidden'),
      open: menu?.classList.contains('is-open'),
      focusInside: menu?.contains(document.activeElement),
      activeHref: document.activeElement?.getAttribute?.('href') || '',
    };
  })()`);
  assert(state.expanded === 'true' && state.hidden === 'false' && state.open && state.focusInside,
    `Desktop mega Enter failed: ${JSON.stringify(state)}`);
  assert(!/\.html(?:[?#]|$)/i.test(state.activeHref), `Mega focus landed on legacy URL ${state.activeHref}`);

  await key(client, 'Escape');
  await wait(100);
  state = await evaluate(client, `(() => {
    const toggle = document.querySelector(${JSON.stringify(selector)});
    const menu = document.getElementById('solutionsServicesMega');
    return {
      expanded: toggle?.getAttribute('aria-expanded'),
      hidden: menu?.getAttribute('aria-hidden'),
      open: menu?.classList.contains('is-open'),
      focusBack: document.activeElement === toggle,
    };
  })()`);
  assert(state.expanded === 'false' && state.hidden === 'true' && !state.open && state.focusBack,
    `Desktop mega Escape failed: ${JSON.stringify(state)}`);

  await key(client, 'ArrowDown');
  await wait(120);
  state = await evaluate(client, `(() => {
    const toggle = document.querySelector(${JSON.stringify(selector)});
    const menu = document.getElementById('solutionsServicesMega');
    return {expanded:toggle?.getAttribute('aria-expanded'), focusInside:menu?.contains(document.activeElement)};
  })()`);
  assert(state.expanded === 'true' && state.focusInside, `Desktop mega ArrowDown failed: ${JSON.stringify(state)}`);
  await key(client, 'Escape');
  console.log('✓ canonical desktop mega: focus / Enter / ArrowDown / Escape');
}

async function testMobileMenu(client) {
  await navigate(client, '/', MOBILE);
  const selector = '[data-ibt-menu-toggle]:not([data-ibt-menu-managed="page"])';
  await focus(client, selector);
  await key(client, 'Enter');
  await wait(140);
  let state = await evaluate(client, `(() => {
    const toggle = document.querySelector(${JSON.stringify(selector)});
    const menu = document.getElementById('ibtikarMobileMenu');
    return {
      expanded: toggle?.getAttribute('aria-expanded'),
      hidden: menu?.getAttribute('aria-hidden'),
      open: menu?.classList.contains('open') || menu?.classList.contains('is-open'),
      body: document.body.classList.contains('menu-open'),
      focusInside: menu?.contains(document.activeElement),
      inert: menu?.hasAttribute('inert'),
    };
  })()`);
  assert(state.expanded === 'true' && state.hidden === 'false' && state.open && state.body && state.focusInside && !state.inert,
    `Mobile menu open failed: ${JSON.stringify(state)}`);

  await key(client, 'Escape');
  await wait(100);
  state = await evaluate(client, `(() => {
    const toggle = document.querySelector(${JSON.stringify(selector)});
    const menu = document.getElementById('ibtikarMobileMenu');
    return {
      expanded: toggle?.getAttribute('aria-expanded'),
      hidden: menu?.getAttribute('aria-hidden'),
      open: menu?.classList.contains('open') || menu?.classList.contains('is-open'),
      focusBack: document.activeElement === toggle,
      inert: menu?.hasAttribute('inert'),
    };
  })()`);
  assert(state.expanded === 'false' && state.hidden === 'true' && !state.open && state.focusBack && state.inert,
    `Mobile menu Escape failed: ${JSON.stringify(state)}`);
  console.log('✓ canonical mobile menu: open / focus / Escape / inert state');
}

async function testFaq(client) {
  await navigate(client, '/services/', DESKTOP);
  const state = await evaluate(client, `(() => {
    const details = document.querySelector('#faq details');
    if (details) {
      const summary = details.querySelector('summary');
      summary?.focus();
      return {kind:'details', focus:document.activeElement===summary, before:details.open};
    }
    const button = document.querySelector('#faq .accordion-item button, #faq .faq-item button, #faq [data-faq-item] button');
    if (!button) return {kind:'missing'};
    button.focus();
    return {kind:'button', focus:document.activeElement===button, before:button.getAttribute('aria-expanded')};
  })()`);
  assert(state.kind !== 'missing' && state.focus, `FAQ control unavailable: ${JSON.stringify(state)}`);
  await key(client, 'Enter');
  await wait(120);
  const after = await evaluate(client, `(() => {
    const details = document.querySelector('#faq details');
    if (details) return {kind:'details', open:details.open};
    const button = document.querySelector('#faq .accordion-item button, #faq .faq-item button, #faq [data-faq-item] button');
    return {kind:'button', expanded:button?.getAttribute('aria-expanded')};
  })()`);
  if (state.kind === 'details') assert(after.open !== state.before, `FAQ details did not toggle: ${JSON.stringify(after)}`);
  else assert(after.expanded !== state.before, `FAQ button did not toggle: ${JSON.stringify(after)}`);
  console.log('✓ services FAQ keyboard activation');
}

async function testContactSteps(client) {
  await navigate(client, '/contact/', DESKTOP);
  await setValue(client, '#quote-name', 'اختبار جودة');
  await setValue(client, '#quote-phone', '0500000000');
  await focus(client, '[data-step-next]', 0);
  await key(client, 'Enter');
  await wait(120);
  let state = await evaluate(client, `(() => {
    const panels = [...document.querySelectorAll('[data-step-panel]')];
    const steps = [...document.querySelectorAll('[data-step]')];
    return {
      firstHidden: panels[0]?.hidden,
      secondHidden: panels[1]?.hidden,
      activeStep: steps.findIndex((step) => step.classList.contains('is-active')),
      focusInside: panels[1]?.contains(document.activeElement),
    };
  })()`);
  assert(state.firstHidden && !state.secondHidden && state.activeStep === 1 && state.focusInside,
    `Contact step 2 failed: ${JSON.stringify(state)}`);

  await setValue(client, '#quote-goal', 'إطلاق متجر');
  await setValue(client, '#quote-stage', 'جاهز للتنفيذ');
  await focus(client, '[data-step-next]', 1);
  await key(client, 'Enter');
  await wait(120);
  state = await evaluate(client, `(() => {
    const panels = [...document.querySelectorAll('[data-step-panel]')];
    const steps = [...document.querySelectorAll('[data-step]')];
    return {
      secondHidden: panels[1]?.hidden,
      thirdHidden: panels[2]?.hidden,
      activeStep: steps.findIndex((step) => step.classList.contains('is-active')),
      focusInside: panels[2]?.contains(document.activeElement),
    };
  })()`);
  assert(state.secondHidden && !state.thirdHidden && state.activeStep === 2 && state.focusInside,
    `Contact step 3 failed: ${JSON.stringify(state)}`);

  await setValue(client, '#quote-details', 'اختبار تفاعل النموذج داخل بيئة الاختبار المحلية.');
  await focus(client, '#quote-form button[type="submit"]');
  await key(client, 'Enter');
  await waitFor(
    client,
    "document.querySelector('[data-form-state]')?.classList.contains('is-success')",
    'contact success state',
    40,
    100,
  );
  state = await evaluate(client, `(() => {
    const panels = [...document.querySelectorAll('[data-step-panel]')];
    const steps = [...document.querySelectorAll('[data-step]')];
    const message = document.querySelector('[data-form-state]')?.textContent?.trim() || '';
    const submit = document.querySelector('#quote-form button[type="submit"]');
    return {
      message,
      firstVisible: !panels[0]?.hidden,
      activeStep: steps.findIndex((step) => step.classList.contains('is-active')),
      submitEnabled: !submit?.disabled,
    };
  })()`);
  assert(/وصل طلبك إلى الفريق/.test(state.message), `Contact success message missing: ${JSON.stringify(state)}`);
  assert(/رقم المرجع:\s*IBT-[A-Z0-9]+/.test(state.message), `Contact reference missing: ${JSON.stringify(state)}`);
  assert(state.firstVisible && state.activeStep === 0 && state.submitEnabled,
    `Contact reset after submit failed: ${JSON.stringify(state)}`);
  console.log('✓ contact: three steps + live local-test submission + reference');
}

async function testTharaaStudio(client) {
  await navigate(client, '/tharaa/', DESKTOP, 500);
  let state = await evaluate(client, `(() => ({
    sectors: document.querySelectorAll('[data-sector]').length,
    views: document.querySelectorAll('[data-view]').length,
    devices: document.querySelectorAll('[data-device]').length,
  }))()`);
  assert(state.sectors >= 2 && state.views >= 2 && state.devices >= 2,
    `Tharaa studio controls missing: ${JSON.stringify(state)}`);

  await focus(client, '[data-sector]', 1);
  await key(client, 'Enter');
  await wait(120);
  state = await evaluate(client, `(() => {
    const buttons = [...document.querySelectorAll('[data-sector]')];
    return {first:buttons[0]?.getAttribute('aria-selected'), second:buttons[1]?.getAttribute('aria-selected')};
  })()`);
  assert(state.first === 'false' && state.second === 'true', `Tharaa sector keyboard failed: ${JSON.stringify(state)}`);

  await focus(client, '[data-view="product"]');
  await key(client, ' ');
  await wait(120);
  state = await evaluate(client, `(() => ({
    selected: document.querySelector('[data-view="product"]')?.getAttribute('aria-selected'),
    active: document.querySelector('[data-demo-view="product"]')?.classList.contains('active'),
  }))()`);
  assert(state.selected === 'true' && state.active, `Tharaa product view keyboard failed: ${JSON.stringify(state)}`);

  await focus(client, '[data-device="mobile"]');
  await key(client, 'Enter');
  await wait(120);
  state = await evaluate(client, `(() => ({
    pressed: document.querySelector('[data-device="mobile"]')?.getAttribute('aria-pressed'),
  }))()`);
  assert(state.pressed === 'true', `Tharaa mobile device keyboard failed: ${JSON.stringify(state)}`);
  console.log('✓ Tharaa studio: sector / view / device keyboard activation');
}

async function terminateChrome(chrome) {
  if (!chrome?.pid) return;
  try {
    if (process.platform !== 'win32') process.kill(-chrome.pid, 'SIGTERM');
    else chrome.kill('SIGTERM');
  } catch (_) {
    try { chrome.kill('SIGTERM'); } catch (_) {}
  }
  await wait(180);
  try {
    if (process.platform !== 'win32') process.kill(-chrome.pid, 'SIGKILL');
    else chrome.kill('SIGKILL');
  } catch (_) {}
}

async function main() {
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
  ], { stdio: 'ignore', detached: process.platform !== 'win32' });

  let client;
  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const target = targets.find((item) => item.type === 'page');
    assert(target?.webSocketDebuggerUrl, 'No debuggable Chrome page target found');
    client = await connectCdp(target.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Input.setIgnoreInputEvents', { ignore: false });

    const tests = [
      ['desktop mega', testDesktopMega],
      ['mobile menu', testMobileMenu],
      ['FAQ', testFaq],
      ['contact steps', testContactSteps],
      ['Tharaa studio', testTharaaStudio],
    ];

    for (const [name, test] of tests) {
      try {
        await test(client);
      } catch (error) {
        throw new Error(`${name}: ${error.message}`);
      }
    }
    console.log(`✓ Canonical interaction QA passed: ${tests.length} deep scenarios`);
  } finally {
    try { client?.close(); } catch (_) {}
    await terminateChrome(chrome);
    safeRm(profileDir);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`Canonical interaction QA failed: ${error.stack || error.message}`);
    process.exit(1);
  });

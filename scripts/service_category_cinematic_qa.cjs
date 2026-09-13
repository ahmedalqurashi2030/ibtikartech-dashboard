const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.SERVICE_CATEGORY_CINEMA_DEBUG_PORT || 9666);
const outputRoot = path.resolve(process.env.VISUAL_QA_OUTPUT || 'artifacts/ui-qa');
const outputDir = path.join(outputRoot, 'service-category-cinematic');
const profileDir = path.join(process.cwd(), '.service-category-cinematic-qa-chrome');

const routes = [
  { name: 'ecommerce', path: '/ecommerce/' },
  { name: 'websites', path: '/websites/' },
  { name: 'brand-content', path: '/brand-content/' },
  { name: 'growth', path: '/growth/' },
  { name: 'custom-systems', path: '/custom-systems/' },
];

const desktop = { width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 };
const mobile = { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const failIf = (failures, condition, message) => { if (!condition) failures.push(message); };
const safeRm = (target) => { try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {} };

function chromePath() {
  return [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
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
    close() { ws.close(); },
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response?.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Runtime evaluation failed');
  return response?.result?.value;
}

async function screenshot(client, filename) {
  const result = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, Buffer.from(result.data, 'base64'));
}

async function navigate(client, route, viewport, reducedMotion = false) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }],
  });
  await client.send('Page.navigate', { url: `${baseUrl}${route.path}` });
  await wait(850);
  await evaluate(client, `(async()=>{
    if(document.fonts?.ready) await document.fonts.ready;
    const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
    for(let i=0;i<60;i+=1){
      if(document.querySelector('.service-paths-section')&&document.querySelectorAll('.service-path-card').length) break;
      await sleep(50);
    }
    scrollTo(0,0);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    await sleep(280);
    return true;
  })()`);
}

async function inspect(client) {
  return evaluate(client, `(()=>{
    const section=document.querySelector('.service-paths-section');
    const stage=section?.querySelector(':scope > .container');
    const cards=[...(section?.querySelectorAll('.service-path-card')||[])];
    const canvas=section?.querySelector('.service-cinema__canvas');
    const reading=section?.querySelector('.service-cinema__reading');
    const help=section?.querySelector('.service-paths-help');
    const stageRect=stage?.getBoundingClientRect();
    const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.01&&r.width>0&&r.height>0};
    return {
      exists:Boolean(section&&stage&&cards.length),
      initialized:section?.dataset.cinemaInitialized==='true',
      cinematicReady:section?.classList.contains('is-cinematic-ready')||false,
      readingMode:section?.classList.contains('is-reading')||false,
      stagePosition:stage?getComputedStyle(stage).position:'',
      stageHeight:stageRect?.height||0,
      viewportHeight:innerHeight,
      sectionScreens:section?section.offsetHeight/innerHeight:0,
      cardCount:cards.length,
      canvasVisible:visible(canvas),
      readingVisible:visible(reading),
      helpVisible:visible(help),
      horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
      cards:cards.map((card,index)=>{const s=getComputedStyle(card);return {
        index,
        title:card.querySelector('h3')?.textContent?.trim()||'',
        scene:card.dataset.scene||'',
        active:card.classList.contains('is-active'),
        visible:visible(card),
        opacity:Number(s.opacity||0),
        pointerEvents:s.pointerEvents,
        inert:Boolean(card.inert),
        ariaHidden:card.getAttribute('aria-hidden'),
      }}),
    };
  })()`);
}

async function moveToScene(client, index, count, isMobile) {
  const progress = isMobile
    ? Math.min(.985, (index + .46) / count)
    : Math.min(.94, .08 + ((index + .42) / count) * .82);
  await evaluate(client, `(async()=>{
    const section=document.querySelector('.service-paths-section');
    const stage=section?.querySelector(':scope > .container');
    if(!section||!stage) throw new Error('Service category cinematic contract missing');
    const topOffset=parseFloat(getComputedStyle(section).getPropertyValue('--service-cinema-top'))||0;
    const sectionTop=scrollY+section.getBoundingClientRect().top;
    const scrollable=Math.max(1,section.offsetHeight-stage.getBoundingClientRect().height);
    scrollTo(0,sectionTop-topOffset+(scrollable*${progress}));
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    await new Promise(r=>setTimeout(r,220));
    return true;
  })()`);
  return progress;
}

function assertCinematicScene(failures, route, mode, index, metrics) {
  const prefix = `${route.path} ${mode} scene ${index + 1}`;
  const active = metrics.cards.filter((card) => card.active);
  const semantic = metrics.cards.filter((card) => !card.inert && card.ariaHidden !== 'true');
  const target = metrics.cards[index];

  failIf(failures, active.length === 1, `${prefix}: expected exactly one active card, got ${active.length}.`);
  failIf(failures, target?.active, `${prefix}: target card is not active.`);
  failIf(failures, target?.opacity >= .88, `${prefix}: active card opacity is ${target?.opacity ?? 'missing'}.`);
  failIf(failures, target?.pointerEvents === 'auto', `${prefix}: active card is not interactive.`);
  failIf(failures, target?.inert === false && target?.ariaHidden !== 'true', `${prefix}: active card is hidden from accessibility tree.`);
  failIf(failures, semantic.length === 1, `${prefix}: expected one semantic card, got ${semantic.length}.`);

  metrics.cards.forEach((card, cardIndex) => {
    if (cardIndex === index) return;
    failIf(failures, card.inert && card.ariaHidden === 'true', `${prefix}: inactive card ${cardIndex + 1} remains exposed to assistive technology.`);
    failIf(failures, card.pointerEvents === 'none', `${prefix}: inactive card ${cardIndex + 1} accepts pointer input.`);
  });
}

async function verifyCinematicMode(client, report, route, viewport, mode) {
  const isMobile = mode === 'mobile cinematic';
  await navigate(client, route, viewport, false);
  const base = await inspect(client);

  failIf(report.failures, base.exists, `${route.path} ${mode}: service-path contract is incomplete.`);
  failIf(report.failures, base.initialized, `${route.path} ${mode}: cinema runtime did not initialize.`);
  failIf(report.failures, base.cinematicReady, `${route.path} ${mode}: cinematic mode is not active.`);
  failIf(report.failures, base.stagePosition === 'sticky', `${route.path} ${mode}: stage is not sticky (${base.stagePosition || 'missing'}).`);
  failIf(report.failures, base.canvasVisible, `${route.path} ${mode}: cinematic canvas is not visible.`);
  failIf(report.failures, base.readingVisible, `${route.path} ${mode}: reading bypass control is not available.`);
  failIf(report.failures, !base.horizontalOverflow, `${route.path} ${mode}: horizontal overflow detected.`);
  failIf(report.failures, base.cardCount >= 3, `${route.path} ${mode}: expected at least three service paths.`);

  if (isMobile) {
    failIf(report.failures, base.stageHeight >= 540, `${route.path} mobile cinematic: stage is too short (${base.stageHeight}px).`);
    failIf(report.failures, base.stageHeight <= base.viewportHeight, `${route.path} mobile cinematic: stage exceeds viewport height.`);
    failIf(report.failures, base.sectionScreens <= 4.5, `${route.path} mobile cinematic: passive scroll travel is too long (${base.sectionScreens.toFixed(2)} screens).`);
  }

  const scenes = [];
  for (let index = 0; index < base.cardCount; index += 1) {
    const desiredProgress = await moveToScene(client, index, base.cardCount, isMobile);
    const metrics = await inspect(client);
    assertCinematicScene(report.failures, route, mode, index, metrics);
    const filename = path.join(outputDir, route.name, isMobile ? 'mobile' : 'desktop', `${String(index + 1).padStart(2, '0')}.png`);
    await screenshot(client, filename);
    scenes.push({ index, desiredProgress, metrics, screenshot: path.relative(outputRoot, filename) });
  }

  return { base, scenes };
}

async function verifyReadingBypass(client, report, route) {
  await evaluate(client, `(()=>{const button=document.querySelector('.service-cinema__reading');if(!button)throw new Error('Reading bypass missing');button.click();return true;})()`);
  await wait(180);
  const metrics = await inspect(client);
  const accessible = metrics.cards.filter((card) => !card.inert && card.ariaHidden !== 'true');
  failIf(report.failures, metrics.readingMode, `${route.path} mobile reading bypass: reading mode did not activate.`);
  failIf(report.failures, !metrics.cinematicReady, `${route.path} mobile reading bypass: cinematic mode remained active.`);
  failIf(report.failures, metrics.stagePosition !== 'sticky', `${route.path} mobile reading bypass: stage remains sticky.`);
  failIf(report.failures, accessible.length === metrics.cardCount, `${route.path} mobile reading bypass: not all cards are accessible.`);
  failIf(report.failures, !metrics.horizontalOverflow, `${route.path} mobile reading bypass: horizontal overflow detected.`);
  return metrics;
}

async function verifyReducedMotion(client, report, route) {
  await navigate(client, route, mobile, true);
  const metrics = await inspect(client);
  const accessible = metrics.cards.filter((card) => !card.inert && card.ariaHidden !== 'true');
  failIf(report.failures, !metrics.cinematicReady, `${route.path} reduced motion: cinematic mode is still active.`);
  failIf(report.failures, metrics.stagePosition !== 'sticky', `${route.path} reduced motion: content remains sticky.`);
  failIf(report.failures, accessible.length === metrics.cardCount, `${route.path} reduced motion: not all paths are accessible.`);
  failIf(report.failures, !metrics.horizontalOverflow, `${route.path} reduced motion: horizontal overflow detected.`);
  return metrics;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  safeRm(profileDir);
  const executable = chromePath();
  if (!executable) throw new Error('Chrome/Chromium executable not found');

  const chrome = spawn(executable, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDir}`, 'about:blank',
  ], { stdio: 'ignore' });

  let client;
  const report = { generatedAt: new Date().toISOString(), routes: [], failures: [] };

  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page = targets.find((target) => target.type === 'page');
    if (!page) throw new Error('No Chrome page target found');

    client = await connectCdp(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    for (const route of routes) {
      const desktopResult = await verifyCinematicMode(client, report, route, desktop, 'desktop cinematic');
      const mobileResult = await verifyCinematicMode(client, report, route, mobile, 'mobile cinematic');
      const readingBypass = await verifyReadingBypass(client, report, route);
      const reducedMotion = await verifyReducedMotion(client, report, route);
      report.routes.push({
        name: route.name,
        path: route.path,
        desktop: desktopResult,
        mobile: mobileResult,
        readingBypass,
        reducedMotion,
      });
    }

    fs.writeFileSync(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    const rows = report.routes.flatMap((route) => [
      `| ${route.path} | desktop cinematic | ${route.desktop.base.cardCount} | ${route.desktop.base.sectionScreens.toFixed(2)} | ${route.desktop.base.horizontalOverflow ? 'YES' : 'No'} |`,
      `| ${route.path} | mobile cinematic | ${route.mobile.base.cardCount} | ${route.mobile.base.sectionScreens.toFixed(2)} | ${route.mobile.base.horizontalOverflow ? 'YES' : 'No'} |`,
      `| ${route.path} | reduced motion | ${route.reducedMotion.cardCount} | ${route.reducedMotion.sectionScreens.toFixed(2)} | ${route.reducedMotion.horizontalOverflow ? 'YES' : 'No'} |`,
    ]);
    const summary = [
      '# Service Category Cinematic QA', '',
      `Generated: ${report.generatedAt}`,
      `Routes: ${routes.length}`,
      'Desktop: scene-by-scene cinematic verification',
      'Phone: scene-by-scene mobile cinematic verification at 390×844',
      'Reading bypass: complete static accessible flow on demand',
      'Reduced motion: complete static flow verification', '',
      '| Route | Mode | Paths | Section screens | Horizontal overflow |',
      '| --- | --- | ---: | ---: | --- |',
      ...rows, '',
      `Failures: ${report.failures.length}`,
      ...report.failures.map((failure) => `- ${failure}`), '',
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, 'SUMMARY.md'), summary);

    if (report.failures.length) {
      throw new Error(`Service category cinematic QA failed with ${report.failures.length} issue(s):\n${report.failures.join('\n')}`);
    }
    console.log('Service category cinematic QA passed: desktop cinematic, mobile cinematic, inactive card semantics, reading bypass, reduced motion, and overflow verified.');
  } finally {
    try { client?.close(); } catch (_) {}
    try { chrome.kill('SIGTERM'); } catch (_) {}
    await wait(250);
    if (!chrome.killed) { try { chrome.kill('SIGKILL'); } catch (_) {} }
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const debugPort = Number(process.env.MOBILE_CINEMA_DEBUG_PORT || 9555);
const outputRoot = path.resolve(process.env.VISUAL_QA_OUTPUT || 'artifacts/ui-qa');
const outputDir = path.join(outputRoot, 'mobile-cinematic');
const profileDir = path.join(process.cwd(), '.mobile-cinematic-qa-chrome');

const viewport = { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 };
const narrativeLead = 0.22;
const scenes = [
  { slug: '01-discover', expectedIndex: 0, desiredProgress: 0.22 },
  { slug: '02-scope', expectedIndex: 1, desiredProgress: 0.385 },
  { slug: '03-experience', expectedIndex: 2, desiredProgress: 0.57 },
  { slug: '04-deliver', expectedIndex: 3, desiredProgress: 0.755 },
  { slug: '05-improve', expectedIndex: 4, desiredProgress: 0.915 },
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

async function connectCdp(wsUrl) {
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
    if (!data.id || !pending.has(data.id)) return;
    const pendingCall = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) pendingCall.reject(new Error(data.error.message || 'CDP command failed'));
    else pendingCall.resolve(data.result);
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

async function screenshotViewport(client, filename) {
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });
  fs.writeFileSync(filename, Buffer.from(result.data, 'base64'));
}

async function waitForHome(client) {
  await evaluate(client, `(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 0; i < 40; i += 1) {
      if (document.querySelector('#journey.cinematic-story') && document.querySelector('#cinematicCanvas')) break;
      await sleep(50);
    }
    await sleep(350);
    return true;
  })()`);
}

async function inspectBaseContract(client) {
  return evaluate(client, `(() => {
    const story = document.querySelector('#journey.cinematic-story');
    const stage = story?.querySelector('.cinematic-story__stage');
    const canvas = document.querySelector('#cinematicCanvas');
    const fallback = story?.querySelector('.cinematic-story__fallback');
    const rail = story?.querySelector('.cinematic-story__rail');
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
    };
    return {
      exists: Boolean(story && stage && canvas),
      viewport: { width: innerWidth, height: innerHeight },
      storyHeight: story?.offsetHeight || 0,
      storyScreens: story ? story.offsetHeight / innerHeight : 0,
      stagePosition: stage ? getComputedStyle(stage).position : '',
      stageHeight: stage?.getBoundingClientRect().height || 0,
      canvasVisible: visible(canvas),
      fallbackVisible: visible(fallback),
      railVisible: visible(rail),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      noStoryMotion: document.documentElement.classList.contains('no-story-motion'),
    };
  })()`);
}

async function moveToProgress(client, desiredProgress) {
  const rawProgress = Math.max(0, Math.min(1, (desiredProgress - narrativeLead) / (1 - narrativeLead)));
  await evaluate(client, `(async () => {
    const story = document.querySelector('#journey.cinematic-story');
    if (!story) throw new Error('Journey cinematic story missing');
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const rect = story.getBoundingClientRect();
    const storyTop = scrollY + rect.top;
    const travel = Math.max(1, story.offsetHeight - innerHeight);
    const y = storyTop + travel * ${rawProgress};
    if (window.ibtikarLenis?.scrollTo) {
      window.ibtikarLenis.scrollTo(y, { immediate: true, force: true });
    }
    scrollTo(0, y);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await sleep(240);
    return { y: scrollY, target: y };
  })()`);
}

async function inspectScene(client) {
  return evaluate(client, `(() => {
    const captions = [...document.querySelectorAll('#journey .cinematic-cap')];
    const rail = document.querySelector('#cinematicRailProgress');
    const finalAction = document.querySelector('#cinematicFinalAction');
    const story = document.querySelector('#journey.cinematic-story');
    const stage = story?.querySelector('.cinematic-story__stage');
    const canvas = document.querySelector('#cinematicCanvas');
    const captionMetrics = captions.map((el, index) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        index,
        opacity: Number(style.opacity || 0),
        title: el.querySelector('h3')?.textContent?.trim() || '',
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
      };
    });
    const active = captionMetrics.reduce((best, item) => item.opacity > best.opacity ? item : best, { index: -1, opacity: -1 });
    const storyRect = story?.getBoundingClientRect();
    const travel = Math.max(1, (story?.offsetHeight || 0) - innerHeight);
    const raw = storyRect ? Math.max(0, Math.min(1, (-storyRect.top) / travel)) : 0;
    const calculatedProgress = Math.max(0, Math.min(1, ${narrativeLead} + raw * (1 - ${narrativeLead})));
    return {
      active,
      captionMetrics,
      calculatedProgress,
      railHeight: rail?.style.height || '',
      stageTop: stage?.getBoundingClientRect().top || 0,
      stagePosition: stage ? getComputedStyle(stage).position : '',
      canvasRect: canvas ? {
        width: canvas.getBoundingClientRect().width,
        height: canvas.getBoundingClientRect().height,
      } : null,
      finalAction: finalAction ? {
        opacity: Number(getComputedStyle(finalAction).opacity || 0),
        pointerEvents: getComputedStyle(finalAction).pointerEvents,
        visibleWidth: finalAction.getBoundingClientRect().width,
      } : null,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    };
  })()`);
}

function pushFailure(failures, condition, message) {
  if (!condition) failures.push(message);
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

  let client;
  const report = { generatedAt: new Date().toISOString(), viewport, base: null, scenes: [], reducedMotion: null, failures: [] };

  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === 'page');
    if (!pageTarget) throw new Error('No Chrome page target found');

    client = await connectCdp(pageTarget.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', viewport);
    await client.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
    });
    await client.send('Page.navigate', { url: `${baseUrl}/` });
    await wait(1200);
    await waitForHome(client);

    report.base = await inspectBaseContract(client);
    pushFailure(report.failures, report.base.exists, 'Mobile cinematic DOM contract is incomplete.');
    pushFailure(report.failures, report.base.stagePosition === 'sticky', `Expected sticky mobile stage, got ${report.base.stagePosition || 'missing'}.`);
    pushFailure(report.failures, report.base.canvasVisible, 'Cinematic canvas is not visible on mobile.');
    pushFailure(report.failures, !report.base.fallbackVisible, 'Static fallback is visible during normal-motion mobile experience.');
    pushFailure(report.failures, report.base.railVisible, 'Cinematic progress rail is not visible on mobile.');
    pushFailure(report.failures, !report.base.horizontalOverflow, 'Homepage has horizontal overflow at 390px.');
    pushFailure(report.failures, report.base.storyScreens >= 3.8 && report.base.storyScreens <= 5.25, `Mobile cinematic travel is outside the UX budget (${report.base.storyScreens.toFixed(2)} viewport heights).`);
    pushFailure(report.failures, report.base.stageHeight >= viewport.height * 0.92 && report.base.stageHeight <= viewport.height * 1.08, `Sticky stage height is not viewport-sized (${Math.round(report.base.stageHeight)}px).`);

    for (const scene of scenes) {
      await moveToProgress(client, scene.desiredProgress);
      const metrics = await inspectScene(client);
      const filename = path.join(outputDir, `${scene.slug}.png`);
      await screenshotViewport(client, filename);
      report.scenes.push({ ...scene, metrics, screenshot: path.relative(outputRoot, filename) });
      pushFailure(report.failures, metrics.active.index === scene.expectedIndex, `${scene.slug}: expected caption ${scene.expectedIndex + 1}, got ${metrics.active.index + 1}.`);
      pushFailure(report.failures, metrics.active.opacity >= 0.45, `${scene.slug}: active caption opacity is too low (${metrics.active.opacity.toFixed(2)}).`);
      pushFailure(report.failures, metrics.stagePosition === 'sticky', `${scene.slug}: stage stopped being sticky.`);
      pushFailure(report.failures, metrics.canvasRect?.width > 0 && metrics.canvasRect?.height > 0, `${scene.slug}: canvas has no rendered area.`);
      pushFailure(report.failures, !metrics.horizontalOverflow, `${scene.slug}: horizontal overflow detected.`);
    }

    await moveToProgress(client, 0.995);
    const finalMetrics = await inspectScene(client);
    const finalFilename = path.join(outputDir, '06-final-action.png');
    await screenshotViewport(client, finalFilename);
    report.finalAction = { metrics: finalMetrics, screenshot: path.relative(outputRoot, finalFilename) };
    pushFailure(report.failures, finalMetrics.finalAction?.opacity >= 0.75, `Final cinematic CTA opacity is too low (${finalMetrics.finalAction?.opacity ?? 'missing'}).`);
    pushFailure(report.failures, finalMetrics.finalAction?.pointerEvents === 'auto', 'Final cinematic CTA is not interactive at story completion.');

    await client.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await client.send('Page.reload', { ignoreCache: true });
    await wait(1000);
    await waitForHome(client);
    report.reducedMotion = await evaluate(client, `(() => {
      const story = document.querySelector('#journey.cinematic-story');
      const fallback = story?.querySelector('.cinematic-story__fallback');
      const stage = story?.querySelector('.cinematic-story__stage');
      const visible = (el) => {
        if (!el) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
      };
      return {
        prefersReduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
        noStoryMotion: document.documentElement.classList.contains('no-story-motion'),
        fallbackVisible: visible(fallback),
        stagePosition: stage ? getComputedStyle(stage).position : '',
      };
    })()`);
    pushFailure(report.failures, report.reducedMotion.prefersReduce, 'Reduced-motion emulation was not applied.');
    pushFailure(report.failures, report.reducedMotion.noStoryMotion, 'Reduced-motion runtime did not disable immersive story motion.');
    pushFailure(report.failures, report.reducedMotion.fallbackVisible, 'Reduced-motion user does not receive the static journey fallback.');

    fs.writeFileSync(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    const summary = [
      '# Mobile Cinematic QA',
      '',
      `Generated: ${report.generatedAt}`,
      `Viewport: ${viewport.width}×${viewport.height}`,
      `Story travel: ${report.base?.storyScreens?.toFixed(2) || 'n/a'} viewport heights`,
      '',
      '| Scene | Expected | Active | Opacity | Progress | Overflow |',
      '| --- | ---: | ---: | ---: | ---: | --- |',
      ...report.scenes.map((item) => `| ${item.slug} | ${item.expectedIndex + 1} | ${item.metrics.active.index + 1} | ${item.metrics.active.opacity.toFixed(2)} | ${item.metrics.calculatedProgress.toFixed(3)} | ${item.metrics.horizontalOverflow ? 'YES' : 'No'} |`),
      '',
      `Reduced motion fallback: ${report.reducedMotion?.fallbackVisible ? 'PASS' : 'FAIL'}`,
      `Failures: ${report.failures.length}`,
      ...report.failures.map((failure) => `- ${failure}`),
      '',
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, 'SUMMARY.md'), summary);

    if (report.failures.length) {
      throw new Error(`Mobile cinematic QA failed with ${report.failures.length} issue(s):\n${report.failures.join('\n')}`);
    }
    console.log('Mobile cinematic QA passed: all five scenes, final CTA, reduced motion, and mobile geometry verified.');
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
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

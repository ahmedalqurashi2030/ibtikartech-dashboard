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
const safeRm = (target) => { try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {} };
const failIf = (failures, condition, message) => { if (!condition) failures.push(message); };

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
  await wait(1000);
  await evaluate(client, `(async()=>{
    if(document.fonts?.ready) await document.fonts.ready;
    const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
    for(let i=0;i<60;i+=1){
      if(document.querySelector('.service-paths-section')&&document.querySelectorAll('.service-path-card').length) break;
      await sleep(50);
    }
    // CDP reuses the same page target for every route. Explicitly reset scroll
    // so one route cannot leak its cinematic position into the next route.
    scrollTo(0,0);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    await sleep(320);
    return true;
  })()`);
}

async function revealStaticPhoneSection(client) {
  await evaluate(client, `(async()=>{
    const section=document.querySelector('.service-paths-section');
    if(!section) throw new Error('Service paths section missing');
    const top=Math.max(0,scrollY+section.getBoundingClientRect().top-24);
    scrollTo(0,top);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    // The section heading uses the normal reveal observer. Give that observer a
    // deterministic frame after entering the viewport before asserting visibility.
    await new Promise(r=>setTimeout(r,260));
    return true;
  })()`);
}

async function inspectContract(client) {
  return evaluate(client, `(()=>{
    const section=document.querySelector('.service-paths-section');
    const stage=section?.querySelector(':scope > .container');
    const header=section?.querySelector('.service-paths-header');
    const help=section?.querySelector('.service-paths-help');
    const canvas=section?.querySelector('.service-cinema__canvas');
    const reading=section?.querySelector('.service-cinema__reading');
    const cards=[...(section?.querySelectorAll('.service-path-card')||[])];
    const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.01&&r.width>0&&r.height>0};
    const rect=section?.getBoundingClientRect();
    const stageRect=stage?.getBoundingClientRect();
    const headerStyle=header?getComputedStyle(header):null;
    const headerRect=header?.getBoundingClientRect();
    const cardsState=cards.map((card,index)=>{const s=getComputedStyle(card),r=card.getBoundingClientRect();return {
      index,
      title:card.querySelector('h3')?.textContent?.trim()||'',
      scene:card.dataset.scene||'',
      active:card.classList.contains('is-active'),
      visible:visible(card),
      opacity:Number(s.opacity||0),
      pointerEvents:s.pointerEvents,
      inert:Boolean(card.inert),
      ariaHidden:card.getAttribute('aria-hidden'),
      rect:{top:r.top,bottom:r.bottom,width:r.width,height:r.height},
    }});
    return {
      exists:Boolean(section&&stage&&header&&cards.length),
      initialized:section?.dataset.cinemaInitialized==='true',
      cinematicReady:section?.classList.contains('is-cinematic-ready')||false,
      readingMode:section?.classList.contains('is-reading')||false,
      cardCount:cards.length,
      stagePosition:stage?getComputedStyle(stage).position:'',
      stageHeight:stageRect?.height||0,
      sectionHeight:section?.offsetHeight||0,
      sectionScreens:section?section.offsetHeight/innerHeight:0,
      headerVisible:visible(header),
      headerState:header?{
        display:headerStyle.display,
        visibility:headerStyle.visibility,
        opacity:Number(headerStyle.opacity||0),
        rect:{top:headerRect.top,bottom:headerRect.bottom,width:headerRect.width,height:headerRect.height},
      }:null,
      helpVisible:visible(help),
      canvasVisible:visible(canvas),
      readingVisible:visible(reading),
      readingHidden:Boolean(reading?.hidden),
      horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
      cards:cardsState,
      sectionRect:rect?{top:rect.top,bottom:rect.bottom,height:rect.height}:null,
    };
  })()`);
}

async function moveDesktopToCard(client, index, count) {
  const progress = 0.08 + ((index + 0.40) / count) * 0.82;
  await evaluate(client, `(async()=>{
    const section=document.querySelector('.service-paths-section');
    const stage=section?.querySelector(':scope > .container');
    if(!section||!stage) throw new Error('Service category cinematic contract missing');
    const style=getComputedStyle(section);
    const topOffset=parseFloat(style.getPropertyValue('--service-cinema-top'))||0;
    const sectionTop=scrollY+section.getBoundingClientRect().top;
    const scrollable=Math.max(1,section.offsetHeight-stage.getBoundingClientRect().height);
    const y=sectionTop-topOffset+(scrollable*${progress});
    scrollTo(0,y);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    await new Promise(r=>setTimeout(r,180));
    return true;
  })()`);
  return progress;
}

function assertDesktopScene(failures, route, index, metrics) {
  const active = metrics.cards.filter((card) => card.active);
  const semanticVisible = metrics.cards.filter((card) => !card.inert && card.ariaHidden !== 'true');
  const target = metrics.cards[index];
  const prefix = `${route.path} desktop scene ${index + 1}`;
  failIf(failures, active.length === 1, `${prefix}: expected exactly one .is-active card, got ${active.length}.`);
  failIf(failures, target?.active, `${prefix}: target card is not active.`);
  failIf(failures, target?.opacity >= .90, `${prefix}: active card opacity is ${target?.opacity ?? 'missing'}.`);
  failIf(failures, target?.pointerEvents === 'auto', `${prefix}: active card is not interactive.`);
  failIf(failures, target?.inert === false && target?.ariaHidden !== 'true', `${prefix}: active card is hidden from accessibility tree.`);
  failIf(failures, semanticVisible.length === 1, `${prefix}: expected one semantic card, got ${semanticVisible.length}.`);
  metrics.cards.forEach((card, cardIndex) => {
    if (cardIndex === index) return;
    failIf(failures, card.inert && card.ariaHidden === 'true', `${prefix}: inactive card ${cardIndex + 1} remains exposed to assistive technology.`);
    failIf(failures, card.pointerEvents === 'none', `${prefix}: inactive card ${cardIndex + 1} still accepts pointer input.`);
  });
}

(async()=>{
  fs.mkdirSync(outputDir,{recursive:true});
  safeRm(profileDir);
  const executable=chromePath();
  if(!executable) throw new Error('Chrome/Chromium executable not found');
  const chrome=spawn(executable,[
    '--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`,`--user-data-dir=${profileDir}`,'about:blank'
  ],{stdio:'ignore'});
  let client;
  const report={generatedAt:new Date().toISOString(),routes:[],failures:[]};

  try{
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets=await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page=targets.find((target)=>target.type==='page');
    if(!page) throw new Error('No Chrome page target found');
    client=await connectCdp(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    for(const route of routes){
      const routeReport={name:route.name,path:route.path,desktop:null,mobile:null,reducedMotion:null};

      await navigate(client,route,desktop,false);
      const desktopBase=await inspectContract(client);
      failIf(report.failures,desktopBase.exists,`${route.path} desktop: service-path contract is incomplete.`);
      failIf(report.failures,desktopBase.initialized,`${route.path} desktop: cinema runtime did not initialize.`);
      failIf(report.failures,desktopBase.cinematicReady,`${route.path} desktop: cinematic mode is not active.`);
      failIf(report.failures,desktopBase.stagePosition==='sticky',`${route.path} desktop: expected sticky stage, got ${desktopBase.stagePosition||'missing'}.`);
      failIf(report.failures,desktopBase.cardCount>=3,`${route.path} desktop: expected at least three service paths.`);
      failIf(report.failures,!desktopBase.horizontalOverflow,`${route.path} desktop: horizontal overflow detected.`);

      const scenes=[];
      for(let index=0;index<desktopBase.cardCount;index+=1){
        const desiredProgress=await moveDesktopToCard(client,index,desktopBase.cardCount);
        const metrics=await inspectContract(client);
        assertDesktopScene(report.failures,route,index,metrics);
        const filename=path.join(outputDir,route.name,'desktop',`${String(index+1).padStart(2,'0')}.png`);
        await screenshot(client,filename);
        scenes.push({index,desiredProgress,metrics,screenshot:path.relative(outputRoot,filename)});
      }
      routeReport.desktop={base:desktopBase,scenes};

      // Small phones intentionally use the static accessible flow. The CSS has
      // always rendered all cards at <=760px; this assertion prevents JS from
      // hiding those same visible cards from keyboard/assistive-technology users.
      await navigate(client,route,mobile,false);
      await revealStaticPhoneSection(client);
      const mobileMetrics=await inspectContract(client);
      const accessibleCards=mobileMetrics.cards.filter((card)=>!card.inert&&card.ariaHidden!=='true');
      failIf(report.failures,mobileMetrics.exists,`${route.path} mobile: service-path contract is incomplete.`);
      failIf(report.failures,!mobileMetrics.cinematicReady,`${route.path} mobile: immersive cinema should yield to the static phone flow.`);
      failIf(report.failures,mobileMetrics.stagePosition!=='sticky',`${route.path} mobile: phone flow must not trap content in a sticky stage.`);
      failIf(report.failures,mobileMetrics.headerVisible,`${route.path} mobile: section heading is not visible after entering the section (${JSON.stringify(mobileMetrics.headerState)}).`);
      failIf(report.failures,mobileMetrics.helpVisible,`${route.path} mobile: decision/help content is not visible.`);
      failIf(report.failures,accessibleCards.length===mobileMetrics.cardCount,`${route.path} mobile: ${accessibleCards.length}/${mobileMetrics.cardCount} visible cards are exposed to assistive technology.`);
      failIf(report.failures,mobileMetrics.cards.every((card)=>card.visible&&card.opacity>=.90&&card.pointerEvents!=='none'),`${route.path} mobile: one or more static cards are visually or interactively suppressed.`);
      failIf(report.failures,!mobileMetrics.horizontalOverflow,`${route.path} mobile: horizontal overflow detected.`);
      const mobileFilename=path.join(outputDir,route.name,'mobile-static.png');
      await screenshot(client,mobileFilename);
      routeReport.mobile={metrics:mobileMetrics,screenshot:path.relative(outputRoot,mobileFilename)};

      await navigate(client,route,desktop,true);
      const reducedMetrics=await inspectContract(client);
      const reducedAccessible=reducedMetrics.cards.filter((card)=>!card.inert&&card.ariaHidden!=='true');
      failIf(report.failures,!reducedMetrics.cinematicReady,`${route.path} reduced-motion: immersive cinema is still active.`);
      failIf(report.failures,reducedMetrics.stagePosition!=='sticky',`${route.path} reduced-motion: content remains sticky.`);
      failIf(report.failures,reducedAccessible.length===reducedMetrics.cardCount,`${route.path} reduced-motion: not all paths are accessible.`);
      failIf(report.failures,!reducedMetrics.horizontalOverflow,`${route.path} reduced-motion: horizontal overflow detected.`);
      routeReport.reducedMotion=reducedMetrics;

      report.routes.push(routeReport);
    }

    fs.writeFileSync(path.join(outputDir,'report.json'),`${JSON.stringify(report,null,2)}\n`);
    const rows=report.routes.flatMap((route)=>[
      `| ${route.path} | desktop | ${route.desktop?.base.cardCount||0} | ${route.desktop?.base.sectionScreens?.toFixed(2)||'n/a'} | ${route.desktop?.base.horizontalOverflow?'YES':'No'} |`,
      `| ${route.path} | mobile static | ${route.mobile?.metrics.cardCount||0} | ${route.mobile?.metrics.sectionScreens?.toFixed(2)||'n/a'} | ${route.mobile?.metrics.horizontalOverflow?'YES':'No'} |`,
      `| ${route.path} | reduced motion | ${route.reducedMotion?.cardCount||0} | ${route.reducedMotion?.sectionScreens?.toFixed(2)||'n/a'} | ${route.reducedMotion?.horizontalOverflow?'YES':'No'} |`,
    ]);
    const summary=[
      '# Service Category Cinematic QA','',
      `Generated: ${report.generatedAt}`,
      `Routes: ${routes.length}`,
      'Desktop: scene-by-scene cinematic verification',
      'Phone: static accessible flow verification at 390×844',
      'Reduced motion: complete static flow verification','',
      '| Route | Mode | Paths | Section screens | Horizontal overflow |',
      '| --- | --- | ---: | ---: | --- |',
      ...rows,'',
      `Failures: ${report.failures.length}`,
      ...report.failures.map((failure)=>`- ${failure}`),'',
    ].join('\n');
    fs.writeFileSync(path.join(outputDir,'SUMMARY.md'),summary);
    if(report.failures.length) throw new Error(`Service category cinematic QA failed with ${report.failures.length} issue(s):\n${report.failures.join('\n')}`);
    console.log('Service category cinematic QA passed: desktop scenes, mobile static accessibility, reduced motion, and overflow verified.');
  } finally {
    try{client?.close();}catch(_){}
    try{chrome.kill('SIGTERM');}catch(_){}
    await wait(250);
    if(!chrome.killed){try{chrome.kill('SIGKILL');}catch(_){}}
    safeRm(profileDir);
  }
})().catch((error)=>{console.error(error.stack||error.message);process.exitCode=1;});

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
  ['01-discover', 0, 0.22],
  ['02-scope', 1, 0.385],
  ['03-experience', 2, 0.57],
  ['04-deliver', 3, 0.755],
  ['05-improve', 4, 0.915],
].map(([slug, expectedIndex, desiredProgress]) => ({ slug, expectedIndex, desiredProgress }));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safeRm = (target) => { try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {} };
const failIf = (failures, condition, message) => { if (!condition) failures.push(message); };

function chromePath() {
  return [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']
    .filter(Boolean)
    .find((candidate) => fs.existsSync(candidate));
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
  const response = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response?.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Runtime evaluation failed');
  return response?.result?.value;
}

async function screenshot(client, filename) {
  const result = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(filename, Buffer.from(result.data, 'base64'));
}

async function waitForJourney(client) {
  await evaluate(client, `(async()=>{
    if(document.fonts?.ready) await document.fonts.ready;
    const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
    for(let i=0;i<40;i+=1){
      if(document.querySelector('#journey.cinematic-story')&&document.querySelector('#cinematicCanvas')) break;
      await sleep(50);
    }
    await sleep(350);
    return true;
  })()`);
}

async function inspectBase(client) {
  return evaluate(client, `(()=>{
    const story=document.querySelector('#journey.cinematic-story');
    const stage=story?.querySelector('.cinematic-story__stage');
    const canvas=document.querySelector('#cinematicCanvas');
    const fallback=story?.querySelector('.cinematic-story__fallback');
    const rail=story?.querySelector('.cinematic-story__rail');
    const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};
    return {
      exists:Boolean(story&&stage&&canvas),
      storyHeight:story?.offsetHeight||0,
      storyScreens:story?story.offsetHeight/innerHeight:0,
      stagePosition:stage?getComputedStyle(stage).position:'',
      stageHeight:stage?.getBoundingClientRect().height||0,
      canvasVisible:visible(canvas),fallbackVisible:visible(fallback),railVisible:visible(rail),
      horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
      noStoryMotion:document.documentElement.classList.contains('no-story-motion'),
    };
  })()`);
}

async function moveToProgress(client, desiredProgress) {
  const raw = Math.max(0, Math.min(1, (desiredProgress - narrativeLead) / (1 - narrativeLead)));
  await evaluate(client, `(async()=>{
    const story=document.querySelector('#journey.cinematic-story');
    if(!story) throw new Error('Journey cinematic story missing');
    const top=scrollY+story.getBoundingClientRect().top;
    const travel=Math.max(1,story.offsetHeight-innerHeight);
    const y=top+travel*${raw};
    if(window.ibtikarLenis?.scrollTo) window.ibtikarLenis.scrollTo(y,{immediate:true,force:true});
    scrollTo(0,y);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    await new Promise(r=>setTimeout(r,240));
    return true;
  })()`);
}

async function inspectScene(client) {
  return evaluate(client, `(()=>{
    const captions=[...document.querySelectorAll('#journey .cinematic-cap')];
    const finalAction=document.querySelector('#cinematicFinalAction');
    const story=document.querySelector('#journey.cinematic-story');
    const stage=story?.querySelector('.cinematic-story__stage');
    const canvas=document.querySelector('#cinematicCanvas');
    const captionMetrics=captions.map((el,index)=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {index,opacity:Number(s.opacity||0),title:el.querySelector('h3')?.textContent?.trim()||'',rect:{top:r.top,bottom:r.bottom,height:r.height}}});
    const active=captionMetrics.reduce((best,item)=>item.opacity>best.opacity?item:best,{index:-1,opacity:-1});
    const rect=story?.getBoundingClientRect();
    const travel=Math.max(1,(story?.offsetHeight||0)-innerHeight);
    const raw=rect?Math.max(0,Math.min(1,(-rect.top)/travel)):0;
    const progress=Math.max(0,Math.min(1,${narrativeLead}+raw*(1-${narrativeLead})));
    return {
      active,captionMetrics,calculatedProgress:progress,
      stagePosition:stage?getComputedStyle(stage).position:'',
      canvasRect:canvas?{width:canvas.getBoundingClientRect().width,height:canvas.getBoundingClientRect().height}:null,
      finalAction:finalAction?{opacity:Number(getComputedStyle(finalAction).opacity||0),pointerEvents:getComputedStyle(finalAction).pointerEvents,visibleWidth:finalAction.getBoundingClientRect().width}:null,
      horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
    };
  })()`);
}

(async()=>{
  fs.mkdirSync(outputDir,{recursive:true});
  safeRm(profileDir);
  const executable=chromePath();
  if(!executable) throw new Error('Chrome/Chromium executable not found');
  const chrome=spawn(executable,['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--hide-scrollbars',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profileDir}`,'about:blank'],{stdio:'ignore'});
  let client;
  const report={generatedAt:new Date().toISOString(),viewport,base:null,scenes:[],reducedMotion:null,finalAction:null,failures:[]};
  try{
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets=await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page=targets.find((target)=>target.type==='page');
    if(!page) throw new Error('No Chrome page target found');
    client=await connectCdp(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride',viewport);
    await client.send('Emulation.setEmulatedMedia',{media:'screen',features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await client.send('Page.navigate',{url:`${baseUrl}/`});
    await wait(1200);
    await waitForJourney(client);

    report.base=await inspectBase(client);
    failIf(report.failures,report.base.exists,'Mobile cinematic DOM contract is incomplete.');
    failIf(report.failures,report.base.stagePosition==='sticky',`Expected sticky mobile stage, got ${report.base.stagePosition||'missing'}.`);
    failIf(report.failures,report.base.canvasVisible,'Cinematic canvas is not visible on mobile.');
    failIf(report.failures,!report.base.fallbackVisible,'Static fallback is visible during normal-motion mobile experience.');
    failIf(report.failures,report.base.railVisible,'Cinematic progress rail is not visible on mobile.');
    failIf(report.failures,!report.base.horizontalOverflow,'Homepage has horizontal overflow at 390px.');
    // Calibrated from the real 390x844 capture: 3.30 viewport heights gives all
    // five beats full readable holds. Longer passive travel is not inherently
    // better cinematic UX on touch devices.
    failIf(report.failures,report.base.storyScreens>=3.0&&report.base.storyScreens<=4.5,`Mobile cinematic travel is outside the verified UX range (${report.base.storyScreens.toFixed(2)} viewport heights).`);
    failIf(report.failures,report.base.stageHeight>=viewport.height*.92&&report.base.stageHeight<=viewport.height*1.08,`Sticky stage height is not viewport-sized (${Math.round(report.base.stageHeight)}px).`);

    for(const scene of scenes){
      await moveToProgress(client,scene.desiredProgress);
      const metrics=await inspectScene(client);
      const filename=path.join(outputDir,`${scene.slug}.png`);
      await screenshot(client,filename);
      report.scenes.push({...scene,metrics,screenshot:path.relative(outputRoot,filename)});
      failIf(report.failures,metrics.active.index===scene.expectedIndex,`${scene.slug}: expected caption ${scene.expectedIndex+1}, got ${metrics.active.index+1}.`);
      failIf(report.failures,metrics.active.opacity>=.75,`${scene.slug}: active caption opacity is too low (${metrics.active.opacity.toFixed(2)}).`);
      failIf(report.failures,metrics.stagePosition==='sticky',`${scene.slug}: stage stopped being sticky.`);
      failIf(report.failures,metrics.canvasRect?.width>0&&metrics.canvasRect?.height>0,`${scene.slug}: canvas has no rendered area.`);
      failIf(report.failures,!metrics.horizontalOverflow,`${scene.slug}: horizontal overflow detected.`);
    }

    await moveToProgress(client,.995);
    const finalMetrics=await inspectScene(client);
    const finalFilename=path.join(outputDir,'06-final-action.png');
    await screenshot(client,finalFilename);
    report.finalAction={metrics:finalMetrics,screenshot:path.relative(outputRoot,finalFilename)};
    failIf(report.failures,finalMetrics.finalAction?.opacity>=.75,`Final cinematic CTA opacity is too low (${finalMetrics.finalAction?.opacity??'missing'}).`);
    failIf(report.failures,finalMetrics.finalAction?.pointerEvents==='auto','Final cinematic CTA is not interactive at story completion.');

    await client.send('Emulation.setEmulatedMedia',{media:'screen',features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await client.send('Page.reload',{ignoreCache:true});
    await wait(1000);
    await waitForJourney(client);
    report.reducedMotion=await evaluate(client,`(()=>{const story=document.querySelector('#journey.cinematic-story'),fallback=story?.querySelector('.cinematic-story__fallback'),stage=story?.querySelector('.cinematic-story__stage');const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};return {prefersReduce:matchMedia('(prefers-reduced-motion: reduce)').matches,noStoryMotion:document.documentElement.classList.contains('no-story-motion'),fallbackVisible:visible(fallback),stagePosition:stage?getComputedStyle(stage).position:''}})()`);
    failIf(report.failures,report.reducedMotion.prefersReduce,'Reduced-motion emulation was not applied.');
    failIf(report.failures,report.reducedMotion.noStoryMotion,'Reduced-motion runtime did not disable immersive story motion.');
    failIf(report.failures,report.reducedMotion.fallbackVisible,'Reduced-motion user does not receive the static journey fallback.');

    fs.writeFileSync(path.join(outputDir,'report.json'),`${JSON.stringify(report,null,2)}\n`);
    const summary=['# Mobile Cinematic QA','',`Generated: ${report.generatedAt}`,`Viewport: ${viewport.width}×${viewport.height}`,`Story travel: ${report.base?.storyScreens?.toFixed(2)||'n/a'} viewport heights`,'','| Scene | Expected | Active | Opacity | Progress | Overflow |','| --- | ---: | ---: | ---: | ---: | --- |',...report.scenes.map((item)=>`| ${item.slug} | ${item.expectedIndex+1} | ${item.metrics.active.index+1} | ${item.metrics.active.opacity.toFixed(2)} | ${item.metrics.calculatedProgress.toFixed(3)} | ${item.metrics.horizontalOverflow?'YES':'No'} |`),'',`Reduced motion fallback: ${report.reducedMotion?.fallbackVisible?'PASS':'FAIL'}`,`Failures: ${report.failures.length}`,...report.failures.map((failure)=>`- ${failure}`),''].join('\n');
    fs.writeFileSync(path.join(outputDir,'SUMMARY.md'),summary);
    if(report.failures.length) throw new Error(`Mobile cinematic QA failed with ${report.failures.length} issue(s):\n${report.failures.join('\n')}`);
    console.log('Mobile cinematic QA passed: five scenes, final CTA, geometry, overflow, and reduced-motion fallback verified.');
  } finally {
    try{client?.close();}catch(_){}
    try{chrome.kill('SIGTERM');}catch(_){}
    await wait(250);
    if(!chrome.killed){try{chrome.kill('SIGKILL');}catch(_){}}
    safeRm(profileDir);
  }
})().catch((error)=>{console.error(error.stack||error.message);process.exitCode=1;});

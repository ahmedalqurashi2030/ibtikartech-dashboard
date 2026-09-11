// Read-only browser checks. Requires an existing Chromium CDP session.
const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:8013";
const cdpUrl = process.env.QA_CDP_URL || "http://127.0.0.1:9334";
const fs = require('fs');
const path = require('path');
const output = process.env.QA_OUTPUT || path.join(process.env.TEMP || '.', 'ibtikar-cinema-qa');
fs.mkdirSync(output, {recursive:true});
const routes = ['/knowledge/store-launch/','/knowledge/product-page/','/knowledge/store-redesign/','/404/','/','/tharaa/','/about/','/contact/','/portfolio/','/knowledge/','/services/','/ecommerce/','/websites/','/brand-content/','/growth/','/custom-systems/','/services/store-launch/','/services/storefront-customization/','/services/store-redesign/','/services/product-page-optimization/','/services/ecommerce-growth/','/services/ecommerce-support/'];
const wait = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
 const tabs=await (await fetch(cdpUrl + '/json')).json();
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0; const pending=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+(m.params.exceptionDetails.exception?.description||''));});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 if(process.env.QA_INSPECT){
  if(process.env.QA_ROUTE){await send('Page.navigate',{url:baseUrl+process.env.QA_ROUTE});await wait(700);}
  if(process.env.QA_WIDTH)await send('Emulation.setDeviceMetricsOverride',{width:Number(process.env.QA_WIDTH),height:960,deviceScaleFactor:1,mobile:false});
  console.log(JSON.stringify(await ev(process.env.QA_INSPECT),null,2));
  const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:55});fs.writeFileSync(path.join(output,'inspect.jpg'),Buffer.from(shot.data,'base64'));
  ws.close();return;
 }
 const findings=[];
 for(const theme of ['light','dark']) for(const width of [375,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:width===720?375:960,deviceScaleFactor:1,mobile:false});
  console.log('Checking',theme,width);for(const route of routes){
   await send('Page.navigate',{url:baseUrl+route});await wait(900);
   await ev(`document.documentElement.dataset.theme='${theme}';document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible','is-visible'));`);
   const result=await ev(`({overflow:document.documentElement.scrollWidth>innerWidth+2,h1:document.querySelectorAll('h1').length,paths:document.querySelectorAll('.service-path-card').length,scenes:[...document.querySelectorAll('.service-path-card[data-path-card]')].every(e=>!!e.dataset.scene),broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src'))})`);
   findings.push({theme,width,route,...result});
   if(result.overflow) console.log('OVERFLOW',theme,width,route);
   if(width===1440&&route==='/ecommerce/'){
    await ev(`{const s=document.querySelector('.service-paths-section');scrollTo(0,(s.getBoundingClientRect().top+scrollY)+(s.offsetHeight-700)*.24-180)}`);await wait(300);
    const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:65});fs.writeFileSync(path.join(output,`ecommerce-${theme}-desktop.jpg`),Buffer.from(shot.data,'base64'));
    for(const progress of [.18,.4,.65,.98]){
     await ev(`{const s=document.querySelector('.service-paths-section'),stage=s.querySelector(':scope > .container');scrollTo(0,(s.getBoundingClientRect().top+scrollY)-180+(s.offsetHeight-stage.offsetHeight)*${progress})}`);await wait(100);
     const state=await ev(`({active:[...document.querySelectorAll('.service-path-card')].filter(e=>!e.inert).length,hiddenFocusable:[...document.querySelectorAll('.service-path-card')].filter(e=>parseFloat(getComputedStyle(e).opacity)<.5&&!e.inert).length})`);
     if(state.active!==1||state.hiddenFocusable)throw Error('Invalid cinema state '+JSON.stringify(state));
    }
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(350);
    if(!await ev(`[...document.querySelectorAll('.service-path-card')].every(e=>!e.inert&&getComputedStyle(e).opacity==='1')`))throw Error('Reduced motion hides paths');
    await send('Emulation.setEmulatedMedia',{features:[]});
   }
   if(width===375&&route==='/ecommerce/'){
    await ev(`document.querySelector('.service-paths-section').scrollIntoView()`);await wait(150);
    const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:65});fs.writeFileSync(path.join(output,`ecommerce-${theme}-mobile.jpg`),Buffer.from(shot.data,'base64'));
   }
  }
 }
 await send('Emulation.setScriptExecutionDisabled',{value:true});
 await send('Page.navigate',{url:'http://127.0.0.1:8013/services/store-launch/'});await wait(400);
 // Runtime.evaluate still permits inspection while page scripts are disabled.
 const nojs=await ev(`[...document.querySelectorAll('[data-service-decision-panel]')].every(e=>!e.hidden)`);
 await send('Emulation.setScriptExecutionDisabled',{value:false});
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({findings,errors,nojs},null,2));
 const missingImages=[...new Set(findings.flatMap(x=>x.broken))];
 const failures=findings.filter(x=>x.overflow||x.h1!==1||!x.scenes);
 console.log(JSON.stringify({pages:findings.length,failures,missingImages,errors,nojs,output},null,2));
 if(failures.length||errors.length||!nojs||missingImages.length)process.exitCode=1;
 ws.close();
})().catch(e=>{console.error(e);process.exit(1)});

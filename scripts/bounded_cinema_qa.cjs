const fs = require('fs');
const path = require('path');
const output = process.env.QA_OUTPUT || path.join(process.env.TEMP || '.', 'ibtikar-cinema-qa');
fs.mkdirSync(output, {recursive:true});
const routes = ['/services/','/ecommerce/','/websites/','/brand-content/','/growth/','/custom-systems/','/services/store-launch/','/services/storefront-customization/','/services/store-redesign/','/services/product-page-optimization/','/services/ecommerce-growth/','/services/ecommerce-support/'];
const wait = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
 const tabs=await (await fetch((process.env.QA_CDP_URL || 'http://127.0.0.1:9334')+'/json')).json();
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0; const pending=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+(m.params.exceptionDetails.exception?.description||''));});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});

 const results=[];
 for(const [width,height] of [[375,812],[768,960],[1440,960],[720,375]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===375});
  for(const route of ['/ecommerce/','/websites/','/brand-content/','/growth/','/custom-systems/']){
   await send('Page.navigate',{url:(process.env.QA_BASE_URL || 'http://127.0.0.1:8013')+route});await wait(1000);
   await ev('document.fonts.ready');
   for(const theme of ['light','dark']){
    await ev(`document.documentElement.dataset.theme='${theme}';document.documentElement.classList.toggle('dark','${theme}'==='dark')`);
    const states=[];
    for(const progress of [.2,.65]){
     await ev(`{let s=document.querySelector('.service-paths-section'),c=s.querySelector(':scope>.container');scrollTo({top:s.getBoundingClientRect().top+scrollY-88+(s.offsetHeight-c.offsetHeight)*${progress},behavior:"instant"});}`);await wait(500);
     states.push(await ev(`(()=>{let s=document.querySelector('.service-paths-section'),c=s.querySelector(':scope>.container'),r=c.getBoundingClientRect(),a=[...s.querySelectorAll('.service-path-card')].filter(e=>!e.inert);return {ready:s.classList.contains('is-cinematic-ready'),height:r.height,top:r.top,bottom:r.bottom,active:a.length,index:[...s.querySelectorAll(".service-path-card")].indexOf(a[0]),overflow:document.documentElement.scrollWidth>innerWidth+2,nav:!!document.querySelector('.service-page-nav'),clipped:a.some(e=>{let b=e.getBoundingClientRect();return b.top<r.top||b.bottom>r.bottom})}})()`));
    }
    results.push({route,width,height,theme,states});
   }
   await ev(`document.querySelector('.service-cinema__reading').click()`);
   if(!await ev(`[...document.querySelectorAll('.service-path-card')].every(e=>!e.inert)`))throw Error('Reading fallback failed');
  }
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.navigate',{url:(process.env.QA_BASE_URL || 'http://127.0.0.1:8013')+'/ecommerce/'});await wait(1000);
 const reduced=await ev(`!document.querySelector('.is-cinematic-ready')&&[...document.querySelectorAll('.service-path-card')].every(e=>!e.inert)`);
 await send('Emulation.setEmulatedMedia',{features:[]});
 const failures=results.filter(r=>r.states.some(s=>!s.ready||s.height>720||s.bottom>r.height+1||s.top<0||s.active!==1||s.overflow||s.nav||s.clipped)||r.states[0].index===r.states[1].index);
 fs.writeFileSync('docs/ui-ux/CINEMATIC_VIEWPORT_BROWSER_RESULTS.json',JSON.stringify({results,failures,reduced,errors},null,2));
 console.log(JSON.stringify({cases:results.length,failures,reduced,errors},null,2));ws.close();
 if(failures.length||!reduced||errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

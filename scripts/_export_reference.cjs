const fs=require('fs'),path=require('path');
(async()=>{
 const tabs=await(await fetch('http://127.0.0.1:9334/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);m.error?p[1](m.error):p[0](m.result);pending.delete(m.id)}});const send=(method,params={})=>new Promise((a,b)=>{const n=++id;pending.set(n,[a,b]);ws.send(JSON.stringify({id:n,method,params}))});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const url=require('url').pathToFileURL(path.resolve('ibtikar-services-cinematic-mobile-v5 (13).html')).href;
 await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,1400));
 const css=await ev(`Array.from(document.styleSheets).flatMap(s=>Array.from(s.cssRules).map(r=>r.cssText))`);
 const result={css,pages:{}};
 for(const key of ['commerce','websites','brand','growth','automation']){
  result.pages[key]=await ev(`(()=>{if(cinemaCleanup)cinemaCleanup();setupCinema=()=>{};setupCommerceHealthLab=()=>{};current='${key}';render();return {html:document.querySelector('#main').innerHTML,data:SERVICES[current]}})()`);
 }
 fs.mkdirSync('artifacts/services-reference',{recursive:true});fs.writeFileSync('artifacts/services-reference/export.json',JSON.stringify(result));
 await ev(`current='websites';render()`);const shot=await send('Page.captureScreenshot',{format:'jpeg',quality:70});fs.writeFileSync('artifacts/services-reference/reference-websites.jpg',Buffer.from(shot.data,'base64'));
 console.log('Exported',Object.keys(result.pages),css.length,'CSS rules');ws.close();
})().catch(e=>{console.error(e);process.exit(1)});

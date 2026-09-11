(function () {
  "use strict";

  var section = document.querySelector(".service-paths-section");
  if (!section || section.dataset.cinemaInitialized === "true") return;

  var stage = section.querySelector(":scope > .container");
  var header = section.querySelector(".service-paths-header");
  var help = section.querySelector(".service-paths-help");
  var cards = Array.prototype.slice.call(section.querySelectorAll(".service-path-card"));
  if (!stage || !header || !cards.length) return;

  var bodyClass = document.body.className;
  var variants = [
    { match: "category-ecommerce", label: "ECOMMERCE PATHS", accent: "#10c8e8", accent2: "#ec4899", scene: "commerce" },
    { match: "category-websites", label: "WEB PATHS", accent: "#10c8e8", accent2: "#4f7df3", scene: "browser" },
    { match: "category-brand", label: "BRAND & CONTENT", accent: "#9c6bff", accent2: "#ec4899", scene: "identity" },
    { match: "category-growth", label: "GROWTH PATHS", accent: "#11c7e7", accent2: "#20c98b", scene: "growth" },
    { match: "category-systems", label: "SYSTEMS PATHS", accent: "#4f7df3", accent2: "#a855f7", scene: "systems" }
  ];
  var variant = variants.filter(function (item) { return bodyClass.indexOf(item.match) !== -1; })[0] || variants[0];
  var count = cards.length;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  section.dataset.cinemaInitialized = "true";
  section.dataset.count = String(count);
  section.style.setProperty("--service-path-count", String(count));

  var canvasLayer = document.createElement("div");
  canvasLayer.className = "service-cinema__canvas-layer";
  canvasLayer.setAttribute("aria-hidden", "true");
  canvasLayer.innerHTML = '<canvas class="service-cinema__canvas"></canvas><div class="service-cinema__wash"></div><div class="service-cinema__vignette"></div><div class="service-cinema__grain"></div>';

  var top = document.createElement("div");
  top.className = "service-cinema__top";
  top.setAttribute("aria-hidden", "true");
  top.innerHTML = '<span class="service-cinema__index">' + variant.label + ' / 01—' + String(count).padStart(2, "0") + "</span>";

  var rail = document.createElement("div");
  rail.className = "service-cinema__rail";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = '<div class="service-cinema__rail-line"><span></span></div><div class="service-cinema__rail-steps">' + cards.map(function (_, index) {
    return '<span class="service-cinema__rail-step">' + String(index + 1).padStart(2, "0") + "</span>";
  }).join("") + "</div>";

  var cue = document.createElement("div");
  cue.className = "service-cinema__cue";
  cue.setAttribute("aria-hidden", "true");
  cue.innerHTML = "<i></i><span>مرّر لاستكشاف المسارات</span><i></i>";

  stage.insertBefore(canvasLayer, stage.firstChild);
  if (help && help.parentElement === header) stage.insertBefore(help, header.nextSibling);
  stage.appendChild(top);
  stage.appendChild(rail);
  stage.appendChild(cue);
  section.classList.add("is-cinematic-ready");
  cards.forEach(function (card) { card.classList.remove("reveal"); });
  header.classList.remove("reveal");

  var canvas = canvasLayer.querySelector("canvas");
  var context = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var ctx = context;
  var railFill = rail.querySelector(".service-cinema__rail-line span");
  var steps = Array.prototype.slice.call(rail.querySelectorAll(".service-cinema__rail-step"));
  var width = 0;
  var height = 0;
  var ratio = 1;
  var progress = 0;
  var activeIndex = 0;
  var frameRequested = false;
  var inView = true;
  var particles = [];

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function ease(value) { return value * value * (3 - 2 * value); }
  function hexToRgba(hex, alpha) {
    var raw = hex.replace("#", "");
    var number = parseInt(raw, 16);
    return "rgba(" + ((number >> 16) & 255) + "," + ((number >> 8) & 255) + "," + (number & 255) + "," + alpha + ")";
  }

  function seedParticles() {
    particles = [];
    var total = navigator.connection && navigator.connection.saveData ? 0 : Math.min(36, Math.round(width / 40));
    for (var index = 0; index < total; index += 1) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: .45 + Math.random() * 1.45,
        depth: .25 + Math.random() * .75,
        drift: Math.random() * Math.PI * 2
      });
    }
  }

  function resizeCanvas() {
    if (!context || reducedMotion.matches || !inView) return;
    var rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedParticles();
    draw();
  }

  function roundedRect(ctx, x, y, w, h, radius) {
    var r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawGrid(ctx, horizon) {
    ctx.save();
    ctx.strokeStyle = "rgba(104,148,255,.065)";
    ctx.lineWidth = 1;
    for (var row = 0; row < 12; row += 1) {
      var t = row / 11;
      var y = horizon + Math.pow(t, 1.65) * (height - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (var column = -9; column <= 9; column += 1) {
      ctx.beginPath();
      ctx.moveTo(width * .5, horizon);
      ctx.lineTo(width * .5 + column * width * .12, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles(ctx) {
    ctx.save();
    particles.forEach(function (particle) {
      var x = particle.x * width + Math.sin(progress * 6 + particle.drift) * 14 * particle.depth;
      var y = (particle.y * height + progress * 52 * particle.depth) % height;
      ctx.fillStyle = hexToRgba(particle.depth > .62 ? variant.accent : variant.accent2, .1 + particle.depth * .22);
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

 function line(c,x1,y1,x2,y2,color,widthStroke=1,alpha=.22){c.save();c.strokeStyle=hexToRgba(color,alpha);c.lineWidth=widthStroke;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore()}
 function fillRect(c,x,y,w,h,r,fill,stroke=null,shadow=null){c.save();roundedRect(c,x,y,w,h,r);c.fillStyle=fill;if(shadow){c.shadowColor=shadow;c.shadowBlur=22}c.fill();c.shadowBlur=0;if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}c.restore()}
 function drawChip(c,x,y,w,text,fill,stroke,color){fillRect(c,x,y,w,28,14,fill,stroke);c.save();c.fillStyle=color||'rgba(255,255,255,.82)';c.font='700 11px system-ui, sans-serif';c.textAlign='center';c.fillText(text,x+w/2,y+18);c.restore()}
 function drawDots(c,items,color){c.save();items.forEach(([x,y,r=4],i)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=i%2?hexToRgba(variant.accent2,.9):hexToRgba(color||variant.accent,.9);c.shadowColor=i%2?hexToRgba(variant.accent2,.35):hexToRgba(color||variant.accent,.35);c.shadowBlur=14;c.fill()});c.restore()}
 function browserShell(intensity){
  const w=Math.min(width*.50,520),h=w*.58,x=width*.23-w*.5,y=height*.47-h*.5;
  fillRect(ctx,x,y,w,h,20,'rgba(8,15,34,.62)',hexToRgba(variant.accent,.32),hexToRgba(variant.accent,.22));
  line(ctx,x,y+38,x+w,y+38,'ffffff',1,.10);
  [[x+21,y+19,2.7],[x+34,y+19,2.7],[x+47,y+19,2.7]].forEach((d,i)=>{ctx.beginPath();ctx.arc(d[0],d[1],d[2],0,Math.PI*2);ctx.fillStyle=i===0?hexToRgba(variant.accent2,.8):'rgba(255,255,255,.22)';ctx.fill()});
  ctx.globalAlpha=intensity;
  return {x,y,w,h};
 }
 function phoneShell(intensity){
  const w=Math.min(width*.18,128),h=w*1.88,x=width*.23-w*.5,y=height*.50-h*.5;
  fillRect(ctx,x,y,w,h,26,'rgba(9,14,28,.74)',hexToRgba(variant.accent,.32),hexToRgba(variant.accent2,.14));
  fillRect(ctx,x+8,y+12,w-16,h-24,18,'rgba(241,245,255,.05)','rgba(255,255,255,.08)');
  ctx.save();ctx.globalAlpha=intensity;ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x+w*.34,y+8,w*.32,4);ctx.restore();
  return {x,y,w,h};
 }
 function textRows(x,y,widthMax,widths,color){
  widths.forEach((factor,index)=>fillRect(ctx,x,y+index*18,widthMax*factor,8,4,color||'rgba(255,255,255,.08)'));
 }
 function drawStoreLaunch(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+28,b.y+60,b.w*.56,10,5,hexToRgba(variant.accent,.30));
  fillRect(ctx,b.x+b.w*.70,b.y+58,b.w*.14,b.h*.48,14,hexToRgba(variant.accent2,.14),hexToRgba(variant.accent2,.32));
  [0,1,2].forEach(i=>fillRect(ctx,b.x+28+i*(b.w*.18),b.y+b.h*.62,b.w*.14,60,12,'rgba(255,255,255,.06)','rgba(255,255,255,.08)'));
  line(ctx,b.x+b.w*.18,b.y+b.h*.80,b.x+b.w*.32,b.y+b.h*.70,variant.accent2,3,.55);
  line(ctx,b.x+b.w*.32,b.y+b.h*.70,b.x+b.w*.40,b.y+b.h*.76,variant.accent2,3,.55);
  ctx.restore();
 }
 function drawStoreImprove(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  textRows(b.x+28,b.y+62,b.w*.56,[1,.82,.94,.74,.68], 'rgba(255,255,255,.08)');
  fillRect(ctx,b.x+b.w*.65,b.y+64,b.w*.23,b.h*.42,14,'rgba(255,255,255,.04)',hexToRgba(variant.accent2,.22));
  ctx.beginPath();ctx.arc(b.x+b.w*.33,b.y+b.h*.63,34,0,Math.PI*2);ctx.strokeStyle=hexToRgba(variant.accent,.8);ctx.lineWidth=3;ctx.stroke();
  line(ctx,b.x+b.w*.36,b.y+b.h*.68,b.x+b.w*.44,b.y+b.h*.76,variant.accent,4,.7);
  ctx.beginPath();ctx.arc(b.x+b.w*.33,b.y+b.h*.63,10,0,Math.PI*2);ctx.fillStyle=hexToRgba(variant.accent2,.85);ctx.fill();
  ctx.restore();
 }
 function drawProductFocus(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+30,b.y+60,b.w*.34,b.h*.54,16,'rgba(255,255,255,.07)','rgba(255,255,255,.08)');
  fillRect(ctx,b.x+b.w*.42,b.y+60,b.w*.21,b.h*.54,16,'rgba(248,248,255,.92)',null);
  fillRect(ctx,b.x+b.w*.49,b.y+102,b.w*.09,b.h*.26,18,hexToRgba(variant.accent2,.30));
  textRows(b.x+b.w*.69,b.y+80,b.w*.18,[.92,.66,.82,.70,.58], 'rgba(255,255,255,.10)');
  drawChip(ctx,b.x+b.w*.70,b.y+b.h*.70,86,'CTA',hexToRgba(variant.accent,.18),hexToRgba(variant.accent,.28),hexToRgba(variant.accent,.96));
  ctx.restore();
 }
 function drawGrowthTrend(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  const x=width*.06,y=height*.67,w=width*.38,h=height*.28;
  ctx.beginPath();
  for(let p=0;p<7;p++){const px=x+(w/6)*p,py=y-(Math.pow(p/6,1.35)*h+Math.sin(p*1.6)*h*.11);p===0?ctx.moveTo(px,py):ctx.lineTo(px,py)}
  ctx.strokeStyle=variant.accent;ctx.lineWidth=3;ctx.shadowColor=hexToRgba(variant.accent,.45);ctx.shadowBlur=16;ctx.stroke();ctx.shadowBlur=0;
  for(let col=0;col<6;col++){const bh=h*(.17+col*.095);fillRect(ctx,x+col*(w/6),y+28-bh,18,bh,9,hexToRgba(col%2?variant.accent2:variant.accent,.16+col*.03))}
  drawChip(ctx,x+w*.56,y-h*.18,120,'Growth backlog',hexToRgba(variant.accent,.10),hexToRgba(variant.accent,.26));
  ctx.restore();
 }
 function drawCorporateSite(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+26,b.y+58,b.w*.60,74,18,hexToRgba(variant.accent,.10),hexToRgba(variant.accent,.14));
  fillRect(ctx,b.x+b.w*.69,b.y+58,b.w*.16,74,14,hexToRgba(variant.accent2,.12),hexToRgba(variant.accent2,.22));
  [0,1,2].forEach(i=>fillRect(ctx,b.x+26+i*(b.w*.21),b.y+156,b.w*.18,62,14,'rgba(255,255,255,.05)','rgba(255,255,255,.08)'));
  drawChip(ctx,b.x+34,b.y+78,96,'Company',hexToRgba(variant.accent,.15),hexToRgba(variant.accent,.28));
  ctx.restore();
 }
 function drawLandingPage(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+40,b.y+62,b.w*.46,b.h*.60,20,'rgba(255,255,255,.04)','rgba(255,255,255,.08)');
  fillRect(ctx,b.x+60,b.y+84,b.w*.30,12,6,hexToRgba(variant.accent,.32));
  textRows(b.x+60,b.y+110,b.w*.30,[1,.84,.72], 'rgba(255,255,255,.09)');
  drawChip(ctx,b.x+60,b.y+176,110,'CTA',hexToRgba(variant.accent2,.16),hexToRgba(variant.accent2,.30),hexToRgba(variant.accent2,.96));
  line(ctx,b.x+b.w*.57,b.y+b.h*.35,b.x+b.w*.72,b.y+b.h*.35,variant.accent2,2,.55);
  line(ctx,b.x+b.w*.72,b.y+b.h*.35,b.x+b.w*.78,b.y+b.h*.44,variant.accent2,2,.55);
  fillRect(ctx,b.x+b.w*.73,b.y+b.h*.26,88,74,18,hexToRgba(variant.accent2,.11),hexToRgba(variant.accent2,.22));
  ctx.restore();
 }
 function drawRedesignSplit(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,width*.08,height*.28,180,210,20,'rgba(255,255,255,.04)','rgba(255,255,255,.08)');
  fillRect(ctx,width*.18,height*.22,220,250,22,hexToRgba(variant.accent,.08),hexToRgba(variant.accent,.22),hexToRgba(variant.accent,.15));
  drawChip(ctx,width*.10,height*.47,62,'Before','rgba(255,255,255,.06)','rgba(255,255,255,.10)');
  drawChip(ctx,width*.23,height*.44,58,'After',hexToRgba(variant.accent,.15),hexToRgba(variant.accent,.28),hexToRgba(variant.accent,.92));
  textRows(width*.10,height*.33,132,[1,.85,.74],'rgba(255,255,255,.07)');
  textRows(width*.22,height*.30,162,[1,.80,.90,.64],hexToRgba(variant.accent,.16));
  ctx.restore();
 }
 function drawContentLibrary(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  [0,1,2,3].forEach(i=>fillRect(ctx,b.x+28,b.y+60+i*38,b.w*.40,22,10,'rgba(255,255,255,.05)','rgba(255,255,255,.07)'));
  [0,1,2].forEach(i=>fillRect(ctx,b.x+b.w*.55,b.y+72+i*62,b.w*.22,48,14,hexToRgba(i===1?variant.accent2:variant.accent,.12),hexToRgba(i===1?variant.accent2:variant.accent,.22)));
  ctx.restore();
 }
 function drawSaaSStory(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+30,b.y+64,b.w*.24,b.h*.44,16,hexToRgba(variant.accent,.12),hexToRgba(variant.accent,.24));
  fillRect(ctx,b.x+b.w*.31,b.y+64,b.w*.26,b.h*.20,16,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  fillRect(ctx,b.x+b.w*.31,b.y+98,b.w*.26,b.h*.32,16,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  fillRect(ctx,b.x+b.w*.62,b.y+76,b.w*.18,b.h*.20,16,hexToRgba(variant.accent2,.14),hexToRgba(variant.accent2,.28));
  drawDots(ctx,[[b.x+b.w*.26,b.y+b.h*.34,5],[b.x+b.w*.44,b.y+b.h*.25,5],[b.x+b.w*.72,b.y+b.h*.24,5]],variant.accent);
  ctx.restore();
 }
 function drawBilingual(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+28,b.y+60,b.w*.26,b.h*.54,16,hexToRgba(variant.accent,.10),hexToRgba(variant.accent,.24));
  fillRect(ctx,b.x+b.w*.37,b.y+60,b.w*.26,b.h*.54,16,hexToRgba(variant.accent2,.10),hexToRgba(variant.accent2,.24));
  drawChip(ctx,b.x+48,b.y+82,68,'RTL',hexToRgba(variant.accent,.15),hexToRgba(variant.accent,.28),hexToRgba(variant.accent,.96));
  drawChip(ctx,b.x+b.w*.40,b.y+82,68,'LTR',hexToRgba(variant.accent2,.15),hexToRgba(variant.accent2,.28),hexToRgba(variant.accent2,.96));
  textRows(b.x+42,b.y+120,b.w*.18,[1,.72,.88],'rgba(255,255,255,.08)');
  textRows(b.x+b.w*.40,b.y+120,b.w*.18,[1,.82,.68],'rgba(255,255,255,.08)');
  ctx.restore();
 }




 function drawPositioningOrbit(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  const cx=width*.22,cy=height*.47;
  for(let ring=1;ring<=4;ring++){ctx.beginPath();ctx.arc(cx,cy,ring*34,0,Math.PI*2);ctx.strokeStyle=hexToRgba(ring%2?variant.accent:variant.accent2,.08+ring*.04);ctx.lineWidth=1;ctx.stroke();}
  drawDots(ctx,[[cx,cy,8],[cx+88,cy,6],[cx-78,cy-42,6],[cx+24,cy+98,6]],variant.accent);
  drawChip(ctx,cx+118,cy-16,110,'الرسالة',hexToRgba(variant.accent,.15),hexToRgba(variant.accent,.26));
  ctx.restore();
 }
 function drawIdentityKit(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  [0,1,2].forEach((i)=>fillRect(ctx,width*.08+i*56,height*.30+i*18,34,152-i*28,14,i===1?hexToRgba(variant.accent2,.40):hexToRgba(variant.accent,.32),null,hexToRgba(i===1?variant.accent2:variant.accent,.28)));
  fillRect(ctx,width*.28,height*.30,154,90,18,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  fillRect(ctx,width*.28,height*.44,154,90,18,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  [0,1,2,3].forEach(i=>fillRect(ctx,width*.31+i*30,height*.48,20,20,10,[variant.accent,variant.accent2,'#ffffff','#9aa6bf'][i]));
  ctx.restore();
 }
 function drawUISystem(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  [0,1,2,3].forEach(i=>fillRect(ctx,width*.08+(i%2)*140,height*.28+Math.floor(i/2)*118,112,86,18,i%2?hexToRgba(variant.accent2,.08):hexToRgba(variant.accent,.08),i%2?hexToRgba(variant.accent2,.18):hexToRgba(variant.accent,.18)));
  line(ctx,width*.19,height*.37,width*.35,height*.37,variant.accent,2,.22);
  line(ctx,width*.19,height*.50,width*.35,height*.50,variant.accent2,2,.22);
  drawDots(ctx,[[width*.19,height*.37,5],[width*.35,height*.37,5],[width*.19,height*.50,5],[width*.35,height*.50,5]],variant.accent);
  ctx.restore();
 }
 function drawWebCopy(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  textRows(b.x+30,b.y+70,b.w*.46,[1,.94,.84,.72],'rgba(255,255,255,.07)');
  fillRect(ctx,b.x+30,b.y+154,b.w*.34,14,7,hexToRgba(variant.accent2,.18));
  textRows(b.x+30,b.y+178,b.w*.40,[1,.86,.92],'rgba(255,255,255,.08)');
  ctx.restore();
 }
 function drawCommerceCopy(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+28,b.y+64,b.w*.26,b.h*.50,16,'rgba(255,255,255,.06)','rgba(255,255,255,.08)');
  textRows(b.x+b.w*.36,b.y+72,b.w*.22,[1,.82,.92,.74],'rgba(255,255,255,.08)');
  [0,1,2].forEach(i=>drawChip(ctx,b.x+b.w*.36+i*72,b.y+176,64,['ثقة','شحن','ضمان'][i],hexToRgba(i===1?variant.accent2:variant.accent,.12),hexToRgba(i===1?variant.accent2:variant.accent,.22)));
  ctx.restore();
 }
 function drawCampaignAssets(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  [0,1,2].forEach(i=>fillRect(ctx,width*.09+i*96,height*.31+(i%2)*26,82,128,18,i===1?hexToRgba(variant.accent2,.08):hexToRgba(variant.accent,.08),i===1?hexToRgba(variant.accent2,.18):hexToRgba(variant.accent,.18)));
  drawChip(ctx,width*.11,height*.45,72,'Assets',hexToRgba(variant.accent,.14),hexToRgba(variant.accent,.24));
  ctx.restore();
 }
 function drawMeasurementFoundation(intensity){ drawGrowthTrend(intensity); ctx.save();ctx.globalAlpha=intensity; drawChip(ctx,width*.11,height*.28,118,'GA4 · Events',hexToRgba(variant.accent,.12),hexToRgba(variant.accent,.24)); ctx.restore(); }
 function drawTechnicalSEO(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  drawDots(ctx,[[b.x+48,b.y+82,6],[b.x+140,b.y+82,6],[b.x+92,b.y+148,6],[b.x+204,b.y+148,6]],variant.accent);
  line(ctx,b.x+48,b.y+82,b.x+92,b.y+148,variant.accent,2,.3); line(ctx,b.x+140,b.y+82,b.x+92,b.y+148,variant.accent2,2,.3); line(ctx,b.x+92,b.y+148,b.x+204,b.y+148,variant.accent,2,.3);
  drawChip(ctx,b.x+230,b.y+76,88,'Indexing',hexToRgba(variant.accent,.13),hexToRgba(variant.accent,.24));
  ctx.restore();
 }
 function drawContentSEO(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+26,b.y+58,b.w*.48,34,16,'rgba(255,255,255,.06)','rgba(255,255,255,.08)');
  drawChip(ctx,b.x+34,b.y+62,126,'نية البحث',hexToRgba(variant.accent,.14),hexToRgba(variant.accent,.24));
  [0,1,2].forEach(i=>fillRect(ctx,b.x+36,b.y+110+i*42,b.w*.36-(i*26),22,11,'rgba(255,255,255,.05)','rgba(255,255,255,.08)'));
  fillRect(ctx,b.x+b.w*.60,b.y+88,b.w*.20,126,16,hexToRgba(variant.accent2,.10),hexToRgba(variant.accent2,.22));
  ctx.restore();
 }
 function drawTrackingMap(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  const pts=[[width*.10,height*.38],[width*.22,height*.28],[width*.28,height*.48],[width*.40,height*.36]];
  pts.forEach((p,i)=>{if(i<pts.length-1)line(ctx,p[0],p[1],pts[i+1][0],pts[i+1][1],i%2?variant.accent2:variant.accent,2,.3);});
  drawDots(ctx,pts.map(p=>[p[0],p[1],6]),variant.accent);
  [0,1,2,3].forEach(i=>drawChip(ctx,width*.48,height*.24+i*44,118,['view_item','add_to_cart','begin_checkout','purchase'][i],hexToRgba(i%2?variant.accent2:variant.accent,.10),hexToRgba(i%2?variant.accent2:variant.accent,.22)));
  ctx.restore();
 }
 function drawCROFunnel(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  [[width*.08,120],[width*.12,160],[width*.16,210],[width*.20,260]].forEach((d,i)=>fillRect(ctx,d[0],height*.30+i*44,d[1],28,14,hexToRgba(i<2?variant.accent:variant.accent2,.10+i*.02),hexToRgba(i<2?variant.accent:variant.accent2,.20)));
  line(ctx,width*.39,height*.32,width*.47,height*.32,variant.accent,2,.4);
  fillRect(ctx,width*.50,height*.25,104,150,18,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  ctx.restore();
 }
 function drawReportingDashboard(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,width*.08,height*.28,310,214,22,'rgba(255,255,255,.04)','rgba(255,255,255,.08)');
  [0,1,2].forEach(i=>fillRect(ctx,width*.11+i*96,height*.33,82,62,16,i===1?hexToRgba(variant.accent2,.10):hexToRgba(variant.accent,.10),i===1?hexToRgba(variant.accent2,.20):hexToRgba(variant.accent,.20)));
  [0,1,2,3,4].forEach(i=>fillRect(ctx,width*.11+i*28,height*.43,18,40+i*12,9,hexToRgba(i%2?variant.accent2:variant.accent,.18)));
  drawChip(ctx,width*.11,height*.30,92,'Insights',hexToRgba(variant.accent,.12),hexToRgba(variant.accent,.22));
  ctx.restore();
 }
 function drawIntegrationsMap(intensity){ drawSystems(intensity); drawChip(ctx,width*.10,height*.26,128,'API · Data Flow',hexToRgba(variant.accent,.12),hexToRgba(variant.accent,.24)); }
 function drawSystems(intensity){
  const cx=width*.24,cy=height*.48,nodes=[[0,0],[-150,-80],[142,-100],[-128,104],[154,95],[0,154]];
  ctx.save();ctx.globalAlpha=intensity;
  nodes.slice(1).forEach((n,i)=>{line(ctx,cx,cy,cx+n[0],cy+n[1],i%2?variant.accent2:variant.accent,2,.22)});
  nodes.forEach((n,i)=>{ctx.beginPath();ctx.arc(cx+n[0],cy+n[1],i===0?13:7,0,Math.PI*2);ctx.fillStyle=i%2?variant.accent2:variant.accent;ctx.shadowColor=hexToRgba(i%2?variant.accent2:variant.accent,.36);ctx.shadowBlur=18;ctx.fill()});
  ctx.restore();
 }
 function drawAutomationFlow(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  [0,1,2].forEach(i=>fillRect(ctx,width*.08+i*116,height*.38-(i===1?46:0),92,68,18,hexToRgba(i===1?variant.accent2:variant.accent,.10),hexToRgba(i===1?variant.accent2:variant.accent,.22)));
  line(ctx,width*.20,height*.42,width*.28,height*.42,variant.accent,2,.35); line(ctx,width*.44,height*.42,width*.52,height*.42,variant.accent2,2,.35);
  fillRect(ctx,width*.31,height*.52,82,56,16,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  ctx.restore();
 }
 function drawOpsDashboard(intensity){ drawReportingDashboard(intensity); drawChip(ctx,width*.11,height*.30,102,'عمليات يومية',hexToRgba(variant.accent2,.12),hexToRgba(variant.accent2,.22),hexToRgba(variant.accent2,.96)); }
 function drawClientPortal(intensity){
  const b=browserShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,b.x+34,b.y+60,b.w*.20,b.h*.56,16,'rgba(255,255,255,.05)','rgba(255,255,255,.08)');
  [0,1,2].forEach(i=>fillRect(ctx,b.x+b.w*.31,b.y+72+i*50,b.w*.28,36,12,i===1?hexToRgba(variant.accent2,.10):hexToRgba(variant.accent,.08),i===1?hexToRgba(variant.accent2,.20):hexToRgba(variant.accent,.18)));
  fillRect(ctx,b.x+b.w*.67,b.y+80,b.w*.14,b.w*.14,999,hexToRgba(variant.accent2,.16),hexToRgba(variant.accent2,.24));
  ctx.restore();
 }
 function drawEventPulses(intensity){
  ctx.save();ctx.globalAlpha=intensity;
  const cx=width*.22,cy=height*.46;
  for(let ring=1;ring<=3;ring++){ctx.beginPath();ctx.arc(cx,cy,ring*34 + ((progress*120)%34),0,Math.PI*2);ctx.strokeStyle=hexToRgba(ring%2?variant.accent2:variant.accent,.12);ctx.lineWidth=2;ctx.stroke();}
  line(ctx,cx+40,cy,cx+180,cy,variant.accent,2,.3);
  [0,1,2].forEach(i=>drawChip(ctx,width*.36,height*.32+i*52,128,['Webhook','Notification','Retry'][i],hexToRgba(i%2?variant.accent2:variant.accent,.10),hexToRgba(i%2?variant.accent2:variant.accent,.22)));
  ctx.restore();
 }
 function drawMobileApp(intensity){
  const p=phoneShell(intensity);ctx.save();ctx.globalAlpha=intensity;
  fillRect(ctx,p.x+20,p.y+34,p.w-40,58,16,hexToRgba(variant.accent,.14),hexToRgba(variant.accent,.24));
  [0,1,2].forEach(i=>fillRect(ctx,p.x+20,p.y+104+i*42,p.w-40,26,12,i===2?hexToRgba(variant.accent2,.12):'rgba(255,255,255,.06)',i===2?hexToRgba(variant.accent2,.22):'rgba(255,255,255,.08)'));
  drawChip(ctx,p.x+22,p.y+p.h-78,p.w-44,'إشعار · إجراء',hexToRgba(variant.accent2,.16),hexToRgba(variant.accent2,.28),hexToRgba(variant.accent2,.96));
  ctx.restore();
 }

 function drawScene(scene,intensity){
  const type=scene?.type||variant.scene||'store-launch';
  if(type==='store-launch') drawStoreLaunch(intensity);
  else if(type==='store-improve') drawStoreImprove(intensity);
  else if(type==='product-focus') drawProductFocus(intensity);
  else if(type==='growth-trend') drawGrowthTrend(intensity);
  else if(type==='corporate-site') drawCorporateSite(intensity);
  else if(type==='landing-page') drawLandingPage(intensity);
  else if(type==='redesign-split') drawRedesignSplit(intensity);
  else if(type==='content-library') drawContentLibrary(intensity);
  else if(type==='saas-story') drawSaaSStory(intensity);
  else if(type==='bilingual') drawBilingual(intensity);
  else if(type==='positioning-orbit') drawPositioningOrbit(intensity);
  else if(type==='identity-kit') drawIdentityKit(intensity);
  else if(type==='ui-system') drawUISystem(intensity);
  else if(type==='web-copy') drawWebCopy(intensity);
  else if(type==='commerce-copy') drawCommerceCopy(intensity);
  else if(type==='campaign-assets') drawCampaignAssets(intensity);
  else if(type==='measurement-foundation') drawMeasurementFoundation(intensity);
  else if(type==='technical-seo') drawTechnicalSEO(intensity);
  else if(type==='content-seo') drawContentSEO(intensity);
  else if(type==='tracking-map') drawTrackingMap(intensity);
  else if(type==='cro-funnel') drawCROFunnel(intensity);
  else if(type==='reporting-dashboard') drawReportingDashboard(intensity);
  else if(type==='integrations-map') drawIntegrationsMap(intensity);
  else if(type==='automation-flow') drawAutomationFlow(intensity);
  else if(type==='ops-dashboard') drawOpsDashboard(intensity);
  else if(type==='client-portal') drawClientPortal(intensity);
  else if(type==='event-pulses') drawEventPulses(intensity);
  else if(type==='mobile-app') drawMobileApp(intensity);
  else drawStoreLaunch(intensity);
 }

  function draw() {
    if (!context || !width || !height || reducedMotion.matches) return;
    context.clearRect(0, 0, width, height);
    var background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#030611");
    background.addColorStop(.55, "#071027");
    background.addColorStop(1, "#050818");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    var glow = context.createRadialGradient(width * .28, height * .44, 10, width * .28, height * .44, width * .42);
    glow.addColorStop(0, hexToRgba(variant.accent, .15));
    glow.addColorStop(.48, hexToRgba(variant.accent2, .07));
    glow.addColorStop(1, "rgba(3,6,17,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    drawGrid(context, height * .57);
    drawParticles(context);

    var intensity = .38 + Math.sin(clamp(progress, 0, 1) * Math.PI) * .48;
    var selected = cards[activeIndex] || cards[0];
    context.save();
    context.translate(width * .035, 0);
    context.scale(.78, 1);
    drawScene({type: selected.dataset.scene}, intensity);
    context.restore();
  }

  function setVisible(element, visible) {
    element.inert = !visible;
    if (visible) element.removeAttribute("aria-hidden");
    else element.setAttribute("aria-hidden", "true");
  }

  function update() {
    frameRequested = false;
    var isMobile = window.innerWidth < 1000;
    if (reducedMotion.matches || section.classList.contains("is-reading")) {
      section.classList.remove("is-cinematic-ready");
      setVisible(header, true);
      if (help) setVisible(help, true);
      header.style.opacity = "";
      header.style.transform = "";
      if (help) {
        help.style.opacity = "";
        help.style.transform = "";
        help.style.pointerEvents = "";
      }
      cards.forEach(function (card) {
        setVisible(card, true);
        card.style.opacity = "";
        card.style.transform = "";
        card.style.pointerEvents = "";
      });
      return;
    }

    section.classList.add("is-cinematic-ready");
    var rect = section.getBoundingClientRect();
    var stageHeight = stage.getBoundingClientRect().height;
    var scrollable = Math.max(1, section.offsetHeight - stageHeight);
    var topOffset = parseFloat(getComputedStyle(section).getPropertyValue("--service-cinema-top")) || 0;
    progress = clamp((topOffset - rect.top) / scrollable, 0, 1);

    if (isMobile) {
      var mobileStep = Math.floor(progress * count);
      var mobileIndex = Math.min(count - 1, mobileStep);
      header.style.opacity = progress < .05 ? "1" : "0";
      header.style.transform = progress < .05 ? "translateY(0)" : "translateY(-18px)";
      setVisible(header, progress < .05);
      cards.forEach(function (card, index) {
        var isActive = index === mobileIndex;
        card.classList.toggle("is-active", isActive);
        card.style.opacity = isActive ? "1" : "0";
        card.style.transform = isActive ? "translateY(0)" : "translateY(24px)";
        card.style.pointerEvents = isActive ? "auto" : "none";
        setVisible(card, isActive);
      });
      if (help) {
        var helpOpacity = ease(clamp((progress - .85) / .10, 0, 1));
        help.style.opacity = String(helpOpacity);
        help.style.transform = "translateY(" + ((1 - helpOpacity) * 18) + "px)";
        help.style.pointerEvents = helpOpacity >= .5 ? "auto" : "none";
        setVisible(help, helpOpacity >= .5);
      }
      railFill.style.height = (progress * 100) + "%";
      steps.forEach(function (item, index) { item.classList.toggle("is-active", index === mobileIndex); });
      cue.style.opacity = "0";
      draw();
      return;
    }

    // Hold one readable caption at a time; never overlap Arabic text at a stopped scroll position.
    var scaled = clamp((progress - .08) / .82, 0, 1) * count;
    var base = Math.min(count - 1, Math.floor(scaled));
    var blend = base === count - 1 ? 0 : ease(clamp(((scaled - base) - .72) / .28, 0, 1));
    activeIndex = Math.min(count - 1, base + (blend >= .5 ? 1 : 0));
    var introOpacity = 1 - ease(clamp(progress / .07, 0, 1));
    header.style.opacity = String(introOpacity);
    header.style.transform = "translateY(" + (-18 * (1 - introOpacity)) + "px)";
    setVisible(header, progress < .04);
    cards.forEach(function (card, index) {
      var opacity = index === activeIndex ? 1 : 0;
      card.classList.toggle("is-active", index === activeIndex);
      opacity *= ease(clamp((progress - .035) / .045, 0, 1));
      card.style.opacity = String(opacity);
      card.style.transform = "translateY(" + ((1 - opacity) * 22) + "px)";
      card.style.pointerEvents = opacity >= .5 ? "auto" : "none";
      setVisible(card, opacity >= .5);
    });
    if (help) {
      var helpOpacity = ease(clamp((progress - .90) / .07, 0, 1));
      help.style.opacity = String(helpOpacity);
      help.style.transform = "translateY(" + ((1 - helpOpacity) * 18) + "px)";
      help.style.pointerEvents = helpOpacity >= .5 ? "auto" : "none";
      setVisible(help, helpOpacity >= .5);
    }
    railFill.style.height = (progress * 100) + "%";
    steps.forEach(function (item, index) { item.classList.toggle("is-active", index === activeIndex); });
    cue.style.opacity = String(1 - ease(clamp((progress - .82) / .12, 0, 1)));
    draw();
  }

  function requestUpdate() {
    if (frameRequested || !inView || document.hidden) return;
    frameRequested = true;
    window.requestAnimationFrame(update);
  }

  var reading = document.createElement("button");
  reading.type = "button";
  reading.className = "service-cinema__reading";
  reading.textContent = "عرض جميع المسارات";
  reading.addEventListener("click", function () {
    section.classList.add("is-reading");
    update();
    reading.hidden = true;
    header.tabIndex = -1;
    header.focus({preventScroll: true});
    section.scrollIntoView({block: "start", behavior: "instant"});
  });
  stage.insertBefore(reading, stage.firstChild);
  section.addEventListener("focusin", function (event) {
    if (event.target === reading || section.classList.contains("is-reading")) return;
    section.classList.add("is-reading");
    update();
  });
  function revealHash() {
    var target = document.getElementById(location.hash.slice(1));
    if (target && cards.some(function (card) { return card === target || card.contains(target); })) {
      section.classList.add("is-reading");
      update();
      target.scrollIntoView({block: "start"});
    }
  }
  window.addEventListener("hashchange", revealHash);
  if (window.IntersectionObserver) new IntersectionObserver(function (entries) {
    inView = entries[0].isIntersecting;
    if (inView) { resizeCanvas(); requestUpdate(); }
  }).observe(section);
  document.addEventListener("visibilitychange", requestUpdate);
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () { update(); resizeCanvas(); }, { passive: true });
  window.addEventListener("pageshow", requestUpdate);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", function () { update(); resizeCanvas(); });
  if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(stage);
  resizeCanvas();
  requestUpdate();
  revealHash();
}());

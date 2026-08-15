/* Preserved source runtime block 1. */
(function(){
  'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined';
  if(hasGSAP) gsap.registerPlugin(ScrollTrigger);
  let lenis=null;
  if(typeof Lenis!=='undefined'&&hasGSAP&&!reduce){lenis=new Lenis({duration:1.1,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);window.lenis=lenis;}
  const q=(s,p=document)=>p.querySelector(s),qa=(s,p=document)=>Array.from(p.querySelectorAll(s));
  qa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const href=a.getAttribute('href');if(!href||href==='#')return;const t=q(href);if(t){e.preventDefault();mobileMenu.classList.remove('open');document.body.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false');lenis?lenis.scrollTo(t):t.scrollIntoView({behavior:reduce?'auto':'smooth'});}}));
  const header=q('#siteHeader'),progress=q('#pageProgress');
  const updateHeader=()=>{const y=scrollY||document.documentElement.scrollTop;header.classList.toggle('scrolled',y>30);const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?y/max*100:0)+'%';};addEventListener('scroll',updateHeader,{passive:true});updateHeader();
  const menuBtn=q('#menuBtn'),mobileMenu=q('#mobileMenu');menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');document.body.classList.toggle('menu-open',open);menuBtn.setAttribute('aria-expanded',String(open));});
  q('#themeToggle').addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';});
  // modal
  const modal=q('#previewModal');qa('[data-open-preview]').forEach(b=>b.addEventListener('click',()=>{modal.classList.add('open');document.body.style.overflow='hidden';}));q('#closePreview').addEventListener('click',()=>{modal.classList.remove('open');document.body.style.overflow='';});modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('open');document.body.style.overflow='';}});addEventListener('keydown',e=>{if(e.key==='Escape'){modal.classList.remove('open');document.body.style.overflow='';}});
  // canvas helpers
  function sizeCanvas(c){const d=Math.min(innerWidth<700?1.2:1.8,devicePixelRatio||1),r=c.getBoundingClientRect();c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));return {ctx:c.getContext('2d'),w:c.width,h:c.height,d};}
  const heroCanvas=q('#heroCanvas');let hero=sizeCanvas(heroCanvas);let heroPts=[];function resetHero(){hero=sizeCanvas(heroCanvas);heroPts=Array.from({length:innerWidth<700?34:72},()=>({x:Math.random()*hero.w,y:Math.random()*hero.h,vx:(Math.random()-.5)*.22*hero.d,vy:(Math.random()-.5)*.2*hero.d,r:(Math.random()*1.7+.5)*hero.d}));}resetHero();
  function drawHero(){const {ctx,w,h}=hero;ctx.clearRect(0,0,w,h);heroPts.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.fillStyle=i%4===0?'rgba(244,93,172,.62)':i%3===0?'rgba(139,92,246,.58)':'rgba(50,215,239,.55)';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();for(let j=i+1;j<heroPts.length;j++){const q=heroPts[j],dx=p.x-q.x,dy=p.y-q.y,dist=Math.hypot(dx,dy);if(dist<120*hero.d){ctx.beginPath();ctx.strokeStyle='rgba(112,137,220,'+(.12*(1-dist/(120*hero.d)))+')';ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}});if(!reduce)requestAnimationFrame(drawHero);}drawHero();
  const heroStage=q('#heroStage'),heroWindow=q('#heroWindow');if(!reduce&&matchMedia('(pointer:fine)').matches){heroStage.addEventListener('pointermove',e=>{const r=heroStage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroWindow.style.transform=`translate(-50%,-50%) rotateY(${-7+x*9}deg) rotateX(${3-y*7}deg) translate3d(${x*9}px,${y*7}px,0)`;});heroStage.addEventListener('pointerleave',()=>heroWindow.style.transform='translate(-50%,-50%) rotateY(-7deg) rotateX(3deg)');}
  // original story and live-lab sections removed
  // retained customization studio
  qa('#studioSwatches button').forEach(b=>b.addEventListener('click',()=>{qa('#studioSwatches button').forEach(x=>x.classList.remove('active'));b.classList.add('active');q('#studioSite').style.setProperty('--studio-accent',b.dataset.studio);}));
  // FAQ
  qa('.faq-item button').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item'),ans=q('.faq-answer',item),open=item.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));ans.style.maxHeight=open?ans.scrollHeight+'px':'0px';}));
  // form demo
  const requestForm=q('#requestForm');if(requestForm)requestForm.addEventListener('submit',e=>{e.preventDefault();const btn=q('button[type="submit"]',e.currentTarget),old=btn.textContent;btn.textContent='تم استلام الطلب التجريبي ✓';btn.disabled=true;setTimeout(()=>{btn.textContent=old;btn.disabled=false;e.currentTarget.reset();},2800);});
  // reveals
  const reveals=qa('.reveal');if(hasGSAP&&!reduce){reveals.forEach(el=>gsap.fromTo(el,{opacity:0,y:30},{opacity:1,y:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));}else reveals.forEach(el=>{el.style.opacity=1;el.style.transform='none';});
  // library horizontal motion desktop
  if(hasGSAP&&!reduce&&innerWidth>900){const track=q('#libraryTrack');if(track&&track.closest('#sections')){gsap.to(track,{x:()=>Math.min(0,innerWidth-track.scrollWidth-40),ease:'none',scrollTrigger:{trigger:track.closest('.library'),start:'top top',end:()=>'+='+(track.scrollWidth-innerWidth+250),pin:true,scrub:1,invalidateOnRefresh:true}});}}
  addEventListener('resize',()=>{resetHero();if(hasGSAP)ScrollTrigger.refresh();},{passive:true});
  if(hasGSAP){addEventListener('load',()=>ScrollTrigger.refresh());if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>ScrollTrigger.refresh());}
})();
;

/* Preserved source runtime block 2. */
(function(){
  'use strict';
  const root=document.getElementById('v4-transfer');
  if(!root)return;
  const $=(s,p=root)=>p.querySelector(s), $$=(s,p=root)=>Array.from(p.querySelectorAll(s));
  const sectors={
    perfume:{brand:'ثراء للعطور',eyebrow:'مجموعة العود الفاخرة',title:'أناقة تبدأ من التفاصيل',product:'عطر بتفاصيل واضحة',accent:'#9b6a4c',paper:'#fff6ea',ink:'#33231f'},
    beauty:{brand:'ثراء بيوتي',eyebrow:'عناية صُممت لك',title:'جمال واضح في كل تفصيل',product:'منتج عناية واضح الخيارات',accent:'#ec4899',paper:'#fff3f8',ink:'#39232e'},
    fashion:{brand:'ثراء للأزياء',eyebrow:'المجموعة الجديدة',title:'إطلالة تبدأ من الهوية',product:'قطعة بتفاصيل منظمة',accent:'#7c3aed',paper:'#faf4ff',ink:'#2e2138'},
    home:{brand:'ثراء للمنزل',eyebrow:'مساحات تلهمك',title:'تفاصيل تصنع المكان',product:'قطعة منزلية بوصف واضح',accent:'#1e9b8d',paper:'#f1fbf8',ink:'#203632'}
  };
  const studioScreen=$('#v4StudioScreen'),studioDevice=$('#v4StudioDevice');
  $$('[data-sector]').forEach(btn=>btn.addEventListener('click',()=>{
    const data=sectors[btn.dataset.sector]; if(!data)return;
    $$('[data-sector]').forEach(b=>b.setAttribute('aria-selected',String(b===btn)));
    studioScreen.style.setProperty('--demo-accent',data.accent);studioScreen.style.setProperty('--demo-paper',data.paper);studioScreen.style.setProperty('--demo-ink',data.ink);
    $('#v4DemoBrand').textContent=data.brand;$('#v4DemoEyebrow').textContent=data.eyebrow;$('#v4DemoTitle').textContent=data.title;$('#v4ProductTitle').textContent=data.product;
  }));
  $$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('[data-view]').forEach(b=>b.setAttribute('aria-selected',String(b===btn)));
    $$('[data-demo-view]').forEach(v=>v.classList.toggle('active',v.dataset.demoView===btn.dataset.view));
  }));
  $$('[data-device]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    studioDevice.classList.toggle('is-mobile',btn.dataset.device==='mobile');
  }));
  const journey=$('#v4-experience'),scenes=$$('.journey-scene'),steps=$$('.journey-steps span'),line=$('#v4JourneyLine');
  let raf=false; const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const update=()=>{raf=false;if(!journey||innerWidth<821||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const rect=journey.getBoundingClientRect(),distance=Math.max(1,journey.offsetHeight-innerHeight),p=clamp(-rect.top/distance),f=p*(scenes.length-1),active=Math.round(f);
    line.style.height=(p*100)+'%';scenes.forEach((scene,i)=>{const d=Math.abs(i-f),op=clamp(1-d*1.2);scene.style.opacity=op.toFixed(3);scene.style.transform=`translateY(${(i-f)*28}px) scale(${(1-Math.min(d,5)*.035).toFixed(3)})`;scene.classList.toggle('active',i===active);scene.setAttribute('aria-hidden',String(i!==active));});steps.forEach((s,i)=>s.classList.toggle('active',i===active));
  };
  const request=()=>{if(!raf){raf=true;requestAnimationFrame(update)}};
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});update();
})();
;

/* Preserved source runtime block 3. */
(function(){
  const area=document.getElementById('sections');
  if(!area) return;
  const cards=[...area.querySelectorAll('.library-card')];
  const tabs=[...area.querySelectorAll('[data-filter]')];
  const more=area.querySelector('[data-library-more], #libraryMore');
  const count=area.querySelector('#libraryCount');
  let expanded=false, filter='all';
  function render(){
    area.classList.toggle('is-expanded',expanded);
    area.classList.toggle('is-filtering',filter!=='all');
    let matching=0, visible=0;
    cards.forEach((card,index)=>{
      const match=filter==='all'||card.dataset.category===filter;
      if(match) matching++;
      const show=match && (filter!=='all'||expanded||!card.classList.contains('library-card--extra'));
      card.classList.toggle('hidden',!show);
      if(show) visible++;
    });
    tabs.forEach(t=>{const active=t.dataset.filter===filter;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));});
    if(count) count.textContent=filter==='all'&&!expanded?`عرض ${visible} من ${matching}`:`${matching} مكوّنًا`;
    if(more){more.textContent=expanded?'عرض المكوّنات الأساسية':'عرض جميع المكوّنات';more.setAttribute('aria-expanded',String(expanded));more.style.display=filter==='all'?'inline-flex':'none';}
  }
  tabs.forEach(t=>t.addEventListener('click',()=>{filter=t.dataset.filter||'all';render();}));
  if(more) more.addEventListener('click',()=>{expanded=!expanded;render();});
  render();
  const dialog=document.getElementById('componentPreviewDialog');
  const image=document.getElementById('componentPreviewImage');
  const title=document.getElementById('componentPreviewTitle');
  const close=document.getElementById('componentPreviewClose');
  area.querySelectorAll('.library-card__preview').forEach(btn=>btn.addEventListener('click',()=>{
    if(!dialog||!image||!title) return;
    const componentTitle=btn.dataset.componentTitle||'معاينة المكوّن';
    const source=btn.dataset.componentImage||btn.querySelector('img')?.src||'';
    image.src=source; image.alt='معاينة بصرية لمكوّن '+componentTitle+' داخل ثيم ثراء'; title.textContent=componentTitle;
    if(typeof dialog.showModal==='function') dialog.showModal(); else dialog.setAttribute('open','');
  }));
  close?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',e=>{if(e.target===dialog) dialog.close();});
})();
;

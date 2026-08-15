/* Preserved source runtime block 1. */
(() => {
  const body = document.body;
  const header = document.getElementById('site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const themeToggle = document.querySelector('.theme-toggle');
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const allMobileLinks = [...document.querySelectorAll('.mobile-menu a')];

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 14);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    mobileMenu?.classList.remove('open');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const willOpen = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', willOpen);
    mobileMenu.setAttribute('aria-hidden', String(!willOpen));
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    body.classList.toggle('menu-open', willOpen);
  });

  allMobileLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const savedTheme = localStorage.getItem('ibtikar-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('ibtikar-theme', next);
  });

  document.querySelectorAll('.accordion-item button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(entry => {
        entry.classList.remove('open');
        entry.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -50px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { threshold: .25, rootMargin: '-20% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterMessage = document.getElementById('newsletter-message');
  newsletterForm?.addEventListener('submit', event => {
    event.preventDefault();
    const email = new FormData(newsletterForm).get('email')?.toString().trim();
    if (!email) return;
    newsletterMessage.textContent = 'تم تسجيل بريدك بنجاح.';
    newsletterForm.reset();
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href="#"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
})();



// =========================================================
// CREATIVE PRO V2 — advanced interactions
// =========================================================
(() => {
  const root = document.documentElement;
  const progress = document.querySelector('.scroll-progress span');
  const dock = document.querySelector('.quick-dock');
  const command = document.querySelector('.command-palette');
  const commandInput = command?.querySelector('input');
  const commandItems = [...document.querySelectorAll('.command-item')];
  const brief = document.querySelector('.brief-modal');
  const briefForm = document.getElementById('brief-form');
  const briefStatus = brief?.querySelector('.brief-status');
  const pointerFine = matchMedia('(pointer:fine)').matches;
  if (pointerFine) root.classList.add('pointer-fine');

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
    dock?.classList.toggle('show', scrollY > 720);
  };
  updateScrollUI();
  addEventListener('scroll', updateScrollUI, { passive:true });

  // Spotlight follows pointer inside premium cards.
  document.querySelectorAll('.need-card,.service-card,.price-card,.portfolio-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX-r.left}px`);
      card.style.setProperty('--my', `${e.clientY-r.top}px`);
    });
  });

  // Subtle 3D dashboard tilt.
  const dash = document.querySelector('.dashboard-window');
  if (pointerFine && dash) {
    dash.addEventListener('pointermove', e => {
      const r = dash.getBoundingClientRect();
      const px = (e.clientX-r.left)/r.width;
      const py = (e.clientY-r.top)/r.height;
      const ry = (px-.5)*8;
      const rx = (.5-py)*6;
      dash.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      dash.style.setProperty('--dash-x', `${px*100}%`);
      dash.style.setProperty('--dash-y', `${py*100}%`);
    });
    dash.addEventListener('pointerleave', () => dash.style.transform = 'perspective(1200px) rotateY(3deg) rotateX(1deg)');
  }

  // Magnetic CTAs — desktop only.
  if (pointerFine) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX-r.left-r.width/2)*.12;
        const y = (e.clientY-r.top-r.height/2)*.16;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  const openCommand = () => {
    if (!command) return;
    command.classList.add('open');
    command.setAttribute('aria-hidden','false');
    setTimeout(()=>commandInput?.focus(),80);
  };
  const closeCommand = () => {
    command?.classList.remove('open');
    command?.setAttribute('aria-hidden','true');
    if (commandInput) commandInput.value='';
    commandItems.forEach(i=>i.hidden=false);
  };
  document.querySelector('.command-trigger')?.addEventListener('click',openCommand);
  document.querySelector('.dock-search')?.addEventListener('click',openCommand);
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); openCommand(); }
    if (e.key==='Escape') { closeCommand(); closeBrief(); }
  });
  command?.addEventListener('click', e => { if (e.target===command) closeCommand(); });
  commandInput?.addEventListener('input', () => {
    const q = commandInput.value.trim().toLowerCase();
    commandItems.forEach(item => item.hidden = !item.textContent.toLowerCase().includes(q));
  });
  commandItems.forEach(item => item.addEventListener('click', () => {
    if (item.hasAttribute('data-open-brief')) { closeCommand(); openBrief(); return; }
    const target = document.querySelector(item.dataset.target);
    closeCommand();
    target?.scrollIntoView({behavior:'smooth',block:'start'});
  }));

  function openBrief(){
    if (!brief) return;
    brief.classList.add('open'); brief.setAttribute('aria-hidden','false'); document.body.classList.add('menu-open');
    setTimeout(()=>brief.querySelector('input')?.focus(),80);
  }
  function closeBrief(){
    brief?.classList.remove('open'); brief?.setAttribute('aria-hidden','true'); document.body.classList.remove('menu-open');
  }
  document.querySelectorAll('[data-open-brief]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openBrief(); }));
  brief?.querySelector('.modal-close')?.addEventListener('click',closeBrief);
  brief?.addEventListener('click', e => { if (e.target===brief) closeBrief(); });
  briefForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (briefStatus) briefStatus.textContent='تم استلام بياناتك مبدئيًا. اربط النموذج بخدمة البريد أو الـ CRM عند النشر.';
    const button = briefForm.querySelector('button[type="submit"]');
    if (button) { button.textContent='تم الإرسال ✓'; button.disabled=true; }
    setTimeout(()=>{ briefForm.reset(); if(button){button.textContent='إرسال الطلب المبدئي';button.disabled=false;} if(briefStatus) briefStatus.textContent=''; closeBrief(); },2600);
  });

  // Number entrance animation for prominent metrics.
  const counters = [...document.querySelectorAll('.metric-grid strong,.tharaa-meta strong,.why-badge b')];
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      const el = entry.target; const original = el.textContent.trim();
      const match = original.match(/[\d,.]+/); if(!match){el.dataset.done='1';return;}
      const numeric = parseFloat(match[0].replace(/,/g,''));
      const decimals = (match[0].split('.')[1]||'').length;
      const prefix = original.slice(0,match.index); const suffix = original.slice(match.index+match[0].length);
      const start = performance.now(); const duration = 1100;
      const tick = now => {
        const p = Math.min(1,(now-start)/duration); const eased = 1-Math.pow(1-p,3);
        const value = numeric*eased;
        el.textContent = prefix + value.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) + suffix;
        if(p<1) requestAnimationFrame(tick); else {el.textContent=original;el.dataset.done='1';}
      };
      requestAnimationFrame(tick); counterObserver.unobserve(el);
    });
  },{threshold:.7});
  counters.forEach(el=>counterObserver.observe(el));
})();



// =========================================================
// CINEMATIC LANDING ENGINE — Ibtikar Tech V3
// =========================================================
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const lerp = (a,b,t) => a + (b-a)*t;
  const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
  const fadeWindow = (a,b,p) => {
    const m=(a+b)/2;
    return Math.max(0, Math.min(smooth(a,a+(m-a)*.72,p), 1-smooth(m+(b-m)*.28,b,p)));
  };

  document.documentElement.classList.add('cinematic-ready');
  const hero = document.querySelector('.hero');
  const heroGrid = document.querySelector('.hero__grid');
  const heroAura = document.querySelector('.hero-cinema-aura');
  const header = document.getElementById('site-header');
  const ambient = document.querySelector('.cinematic-ambient-bg');

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  // One animation clock: Lenis is driven by GSAP's ticker.
  let lenis = null;
  if (!reduce && hasGSAP && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration:1.12, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.ibtikarLenis = lenis;
    document.querySelectorAll('a[href^="#"]:not([href="#"]):not([data-open-brief])').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset:-92 });
      });
    });
  }

  // Cinematic hero entrance and handoff.
  if (hasGSAP && !reduce) {
    gsap.timeline({ defaults:{ ease:'power3.out' } })
      .fromTo('.hero .eyebrow',{opacity:0,y:20},{opacity:1,y:0,duration:.75},.08)
      .fromTo('.hero h1',{opacity:0,y:48,clipPath:'inset(0 0 100% 0)'},{opacity:1,y:0,clipPath:'inset(0 0 0% 0)',duration:1.15},.2)
      .fromTo('.hero__content>p',{opacity:0,y:24},{opacity:1,y:0,duration:.85},.55)
      .fromTo('.hero__actions,.hero__trust',{opacity:0,y:18},{opacity:1,y:0,duration:.8,stagger:.12},.72)
      .fromTo('.hero-dashboard',{opacity:0,scale:.88,y:55,rotateY:-8},{opacity:1,scale:1,y:0,rotateY:0,duration:1.45},.25);
    gsap.to(heroGrid,{scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true},y:-70,opacity:.12,scale:.96,ease:'none'});
    gsap.to(heroAura,{scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true},scale:1.65,opacity:0,ease:'none'});
  }

  // Header hides while moving down and returns while moving up.
  let lastY = scrollY;
  const updateHeaderDirection = y => {
    const delta = y - lastY;
    if (y > 190 && delta > 2) header?.classList.add('cinematic-hidden');
    if (delta < -2 || y < 120) header?.classList.remove('cinematic-hidden');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', e => updateHeaderDirection(e.animatedScroll));
  else addEventListener('scroll', () => updateHeaderDirection(scrollY), {passive:true});

  // Subtle ambient color changes connect the main beats.
  const ambientMap = [
    ['#home','#071027'], ['#journey','#030611'], ['#why','#f8faff'], ['#services','#050817'],
    ['#portfolio','#f8faff'], ['#tharaa','#090d25'], ['#testimonials','#030611'],
    ['#pricing','#f6f8fc'], ['#faq','#f8faff'], ['#contact','#11113a']
  ];
  const setAmbient = color => {
    document.documentElement.style.setProperty('--cinematic-ambient',color);
    if (ambient && hasGSAP) gsap.to(ambient,{backgroundColor:color,duration:1.1,overwrite:'auto',ease:'power2.out'});
  };
  if (hasGSAP) ambientMap.forEach(([selector,color]) => {
    const section=document.querySelector(selector); if(!section) return;
    ScrollTrigger.create({trigger:section,start:'top 58%',end:'bottom 42%',onEnter:()=>setAmbient(color),onEnterBack:()=>setAmbient(color)});
  });


  // Gentle cinematic treatment for later hero objects.
  if (hasGSAP) gsap.to('.cta-card',{scrollTrigger:{trigger:'#contact',start:'top bottom',end:'center center',scrub:true},rotateX:0,y:-12,ease:'none'});

  if (hasGSAP) {
    addEventListener('load',()=>ScrollTrigger.refresh());
    if(document.fonts?.ready) document.fonts.ready.then(()=>ScrollTrigger.refresh());
  }
})();
;

/* Preserved source runtime block 2. */
(function(){
  'use strict';
  const hasGSAP=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!hasGSAP) document.documentElement.classList.add('no-immersive-motion');
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
  const fade=(a,b,p)=>{const m=(a+b)/2;return Math.min(smooth(a,a+(m-a)*.68,p),1-smooth(m+(b-m)*.35,b,p));};
  const lerp=(a,b,t)=>a+(b-a)*t;

  function setupCanvas(canvas, draw){
    if(!canvas) return null; const ctx=canvas.getContext('2d',{alpha:false}); let w=1,h=1,dpr=1,p=.001;
    const resize=()=>{const host=canvas.parentElement;dpr=Math.min(2,devicePixelRatio||1);w=Math.max(1,host.clientWidth);h=Math.max(1,host.clientHeight);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw(ctx,w,h,p,true);};
    const render=(next,force=false)=>{p=clamp(next);draw(ctx,w,h,p,force)};resize();addEventListener('resize',resize,{passive:true});return {render,resize,get size(){return [w,h]}};
  }
  function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function glow(ctx,x,y,r,c,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.42,`rgba(${c},${a*.28})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function base(ctx,w,h,p,hue=0){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#02040d');g.addColorStop(.52,hue===1?'#071628':hue===2?'#12091d':'#07102a');g.addColorStop(1,'#17091f');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);glow(ctx,w*.73,h*.28,Math.min(w,h)*.5,'66,119,255',.20);glow(ctx,w*.26,h*.72,Math.min(w,h)*.43,'32,210,235',.10);glow(ctx,w*.82,h*.76,Math.min(w,h)*.38,'240,78,168',.09);
    ctx.save();ctx.globalAlpha=.11;ctx.strokeStyle='#7b92dd';ctx.lineWidth=.7;const hz=h*.58;for(let i=-11;i<12;i++){ctx.beginPath();ctx.moveTo(w*.58,hz);ctx.lineTo(w*.58+i*w*.07,h*1.08);ctx.stroke()}for(let i=0;i<12;i++){const y=lerp(hz,h*1.04,(i/11)**2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
    for(let i=0;i<35;i++){const x=((Math.sin(i*12.91)*43758.545)%1+1)%1*w;const y=(((Math.sin(i*8.71)*8731.21)%1+1)%1*h+p*h*.28)%h;ctx.fillStyle=`rgba(${i%3===0?'34,211,238':i%3===1?'139,92,246':'241,91,181'},${.08+(i%5)*.025})`;ctx.beginPath();ctx.arc(x,y,1+(i%3)*.5,0,Math.PI*2);ctx.fill()}
  }
  function weight(center,p,width=.17){return clamp(1-Math.abs(p-center)/width)}

  const services=document.querySelector('.services-cinema');
  const servicesCanvas=document.getElementById('servicesCanvas');
  let lastSP=-1;
  const serviceCenters=[.13,.29,.45,.61,.77,.93];
  const serviceRenderer=setupCanvas(servicesCanvas,(ctx,w,h,p,force)=>{
    if(!force&&Math.abs(p-lastSP)<.0007)return;lastSP=p;base(ctx,w,h,p,0);const cx=w*.66,cy=h*.53,S=Math.min(w,h);
    const ws=serviceCenters.map(c=>weight(c,p,.16));
    // 01 Commerce — storefront + products + cart pulse.
    if(ws[0]>.001){ctx.save();ctx.globalAlpha=ws[0];const bw=Math.min(w*.47,690),bh=Math.min(h*.55,510),x=cx-bw/2,y=cy-bh/2;ctx.fillStyle='rgba(8,16,43,.88)';ctx.strokeStyle='rgba(74,222,255,.34)';ctx.lineWidth=1.2;ctx.shadowColor='rgba(34,211,238,.22)';ctx.shadowBlur=45;rr(ctx,x,y,bw,bh,27);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.06)';rr(ctx,x+18,y+18,bw-36,38,12);ctx.fill();ctx.fillStyle='#22d3ee';rr(ctx,x+30,y+30,82,10,5);ctx.fill();ctx.fillStyle='rgba(91,140,255,.18)';rr(ctx,x+22,y+76,bw-44,bh*.32,18);ctx.fill();for(let i=0;i<3;i++){const pw=(bw-64)/3-10,px=x+22+i*(pw+15);ctx.fillStyle='rgba(255,255,255,.075)';rr(ctx,px,y+bh*.48,pw,bh*.34,15);ctx.fill();ctx.fillStyle=i===1?'rgba(241,91,181,.46)':'rgba(34,211,238,.35)';rr(ctx,px+15,y+bh*.52,pw-30,bh*.16,12);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';rr(ctx,px+15,y+bh*.73,pw*.55,7,4);ctx.fill()}const pulse=1+.08*Math.sin(p*80);glow(ctx,x+bw*.83,y+bh*.22,50*pulse,'53,211,154',.4);ctx.fillStyle='#35d39a';ctx.font='900 22px Arial';ctx.textAlign='center';ctx.fillText('✓',x+bw*.83,y+bh*.235);ctx.restore()}
    // 02 Websites — responsive stack.
    if(ws[1]>.001){ctx.save();ctx.globalAlpha=ws[1];for(let i=0;i<3;i++){const sc=1-i*.11,ox=i*46,oy=i*30,bw=Math.min(w*.45,650)*sc,bh=Math.min(h*.50,460)*sc,x=cx-bw/2-ox*.2,y=cy-bh/2+oy*.25;ctx.fillStyle=`rgba(${8+i*5},${15+i*8},${44+i*11},.9)`;ctx.strokeStyle=`rgba(117,151,255,${.36-i*.08})`;rr(ctx,x,y,bw,bh,24);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.055)';rr(ctx,x+18,y+18,bw-36,34,10);ctx.fill();ctx.fillStyle=i===0?'rgba(91,140,255,.34)':'rgba(139,92,246,.22)';rr(ctx,x+22,y+70,bw*.56,bh*.40,16);ctx.fill();for(let k=0;k<3;k++){ctx.fillStyle='rgba(255,255,255,.075)';rr(ctx,x+bw*.63,y+70+k*(bh*.13+10),bw*.30,bh*.13,12);ctx.fill()}}ctx.restore()}
    // 03 Brand — logo, swatches, curves and type.
    if(ws[2]>.001){ctx.save();ctx.globalAlpha=ws[2];const r=S*.24;for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(${i===0?'34,211,238':i===1?'139,92,246':'241,91,181'},${.35-i*.05})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r*(1-i*.22),0,Math.PI*2);ctx.stroke()}const hb=S*.17,spread=hb*.45;for(let i=0;i<3;i++){const hh=[.72,1.16,.92][i]*hb,bw=hb*.27,x=cx+(i-1)*spread-bw/2,y=cy-hh/2;const gg=ctx.createLinearGradient(x,y,x,y+hh);gg.addColorStop(0,['#22d3ee','#7093ff','#f15bb5'][i]);gg.addColorStop(1,'#7b52e9');ctx.fillStyle=gg;ctx.shadowColor=['#22d3ee','#7093ff','#f15bb5'][i];ctx.shadowBlur=28;rr(ctx,x,y,bw,hh,bw*.28);ctx.fill()}ctx.shadowBlur=0;const colors=['#22d3ee','#5b8cff','#8b5cf6','#f15bb5','#ffb64d'];colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx-r*1.5+i*r*.75,cy+r*1.35,11,0,Math.PI*2);ctx.fill()});ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-r*1.35,cy-r*1.12);ctx.bezierCurveTo(cx-r*.4,cy-r*1.8,cx+r*.35,cy-r*.3,cx+r*1.35,cy-r*1.15);ctx.stroke();ctx.restore()}
    // 04 Growth — analytics and rising graph.
    if(ws[3]>.001){ctx.save();ctx.globalAlpha=ws[3];const bw=Math.min(w*.49,720),bh=Math.min(h*.52,470),x=cx-bw/2,y=cy-bh/2;ctx.fillStyle='rgba(7,15,42,.86)';ctx.strokeStyle='rgba(91,140,255,.3)';rr(ctx,x,y,bw,bh,27);ctx.fill();ctx.stroke();for(let i=1;i<5;i++){ctx.strokeStyle='rgba(255,255,255,.07)';ctx.beginPath();ctx.moveTo(x+30,y+i*bh/5);ctx.lineTo(x+bw-30,y+i*bh/5);ctx.stroke()}const pts=[];for(let i=0;i<9;i++){pts.push([x+42+i*(bw-84)/8,y+bh-50-(i/8)*bh*.58-Math.sin(i*1.25)*bh*.07])}const gr=ctx.createLinearGradient(x,0,x+bw,0);gr.addColorStop(0,'#22d3ee');gr.addColorStop(.5,'#6f8fff');gr.addColorStop(1,'#f15bb5');ctx.strokeStyle=gr;ctx.lineWidth=4;ctx.shadowColor='rgba(91,140,255,.6)';ctx.shadowBlur=22;ctx.beginPath();pts.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.stroke();ctx.shadowBlur=0;pts.forEach(([px,py],i)=>{ctx.fillStyle=i===8?'#fff':i%2?'#8b5cf6':'#22d3ee';ctx.beginPath();ctx.arc(px,py,i===8?6:3.5,0,Math.PI*2);ctx.fill()});['+48%','3.7×','-31%'].forEach((t,i)=>{ctx.fillStyle='rgba(255,255,255,.06)';rr(ctx,x+25+i*(bw/3),y+22,bw/3-35,62,13);ctx.fill();ctx.fillStyle=['#35d39a','#22d3ee','#f15bb5'][i];ctx.font='800 18px Arial';ctx.textAlign='center';ctx.fillText(t,x+25+i*(bw/3)+(bw/3-35)/2,y+60)});ctx.restore()}
    // 05 Automation — network with animated packets.
    if(ws[4]>.001){ctx.save();ctx.globalAlpha=ws[4];const nodes=[[cx,cy],[cx-S*.28,cy-S*.14],[cx+S*.30,cy-S*.15],[cx-S*.24,cy+S*.20],[cx+S*.26,cy+S*.22],[cx,cy-S*.32]];for(let i=1;i<nodes.length;i++){ctx.strokeStyle='rgba(126,157,255,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...nodes[0]);ctx.lineTo(...nodes[i]);ctx.stroke();const t=(p*8+i*.16)%1,px=lerp(nodes[0][0],nodes[i][0],t),py=lerp(nodes[0][1],nodes[i][1],t);glow(ctx,px,py,22,'34,211,238',.55);ctx.fillStyle='#a7f3ff';ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fill()}nodes.forEach(([x,y],i)=>{glow(ctx,x,y,i===0?70:45,i%3===0?'139,92,246':i%3===1?'34,211,238':'241,91,181',i===0?.32:.20);ctx.fillStyle='rgba(9,18,50,.96)';ctx.strokeStyle=i===0?'rgba(255,255,255,.5)':'rgba(129,157,255,.38)';ctx.lineWidth=1.2;rr(ctx,x-(i===0?62:48),y-(i===0?42:34),i===0?124:96,i===0?84:68,16);ctx.fill();ctx.stroke();ctx.fillStyle=i===0?'#fff':'rgba(255,255,255,.72)';ctx.font=`800 ${i===0?14:11}px Arial`;ctx.textAlign='center';ctx.fillText(['CORE','WhatsApp','Sheets','CRM','Orders','Analytics'][i],x,y+4)});ctx.restore()}
    // 06 Custom — modular system assembles.
    if(ws[5]>.001){ctx.save();ctx.globalAlpha=ws[5];const blocks=[[-.25,-.20,.28,.24],[.06,-.24,.32,.18],[-.30,.08,.22,.28],[-.03,.02,.40,.34],[.18,.22,.20,.18]];blocks.forEach((b,i)=>{const bw=S*b[2],bh=S*b[3],targetX=cx+S*b[0],targetY=cy+S*b[1],inT=smooth(.84+i*.015,.94+i*.01,p),x=lerp(cx+(i%2?S*.65:-S*.65),targetX,inT),y=lerp(cy+(i<2?-S*.45:S*.45),targetY,inT);ctx.fillStyle='rgba(8,17,47,.88)';ctx.strokeStyle=['rgba(34,211,238,.45)','rgba(91,140,255,.45)','rgba(139,92,246,.45)','rgba(241,91,181,.45)','rgba(255,182,77,.45)'][i];ctx.lineWidth=1.2;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=18;rr(ctx,x-bw/2,y-bh/2,bw,bh,18);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.08)';rr(ctx,x-bw*.34,y-bh*.18,bw*.68,8,4);ctx.fill()});ctx.font=`900 ${Math.max(18,Math.min(34,w*.024))}px "Tajawal",Arial`;ctx.fillStyle=`rgba(255,255,255,${smooth(.91,.99,p)})`;ctx.textAlign='center';ctx.direction='rtl';ctx.fillText('نظام مصمم حول عملك',cx,cy+S*.36);ctx.restore()}
  });

  const sCopies=[...document.querySelectorAll('.service-scene-copy')],sProg=document.getElementById('servicesProgress'),sSteps=[...document.querySelectorAll('.services-cinema__steps span')],sHeading=document.getElementById('servicesHeading');
  function updateServices(p){if(sHeading){const o=1-smooth(.02,.11,p);sHeading.style.opacity=o;sHeading.style.transform=`translateY(${-28*smooth(.02,.11,p)}px)`}sCopies.forEach(el=>{const o=fade(+el.dataset.a,+el.dataset.b,p);el.style.opacity=o;el.style.transform=`translateY(${28*(1-o)}px)`;el.classList.toggle('active',o>.65)});if(sProg)sProg.style.height=p*100+'%';sSteps.forEach((el,i)=>el.classList.toggle('active',p>=i/(sSteps.length-1)-.03));}
  if(services&&serviceRenderer){if(reduce||!hasGSAP){serviceRenderer.render(.93,true);updateServices(.93)}else ScrollTrigger.create({trigger:services,start:'top top',end:'bottom bottom',scrub:true,onUpdate:s=>{serviceRenderer.render(s.progress);updateServices(s.progress)}})}

  const tharaa=document.querySelector('.tharaa-cinema'),thCanvas=document.getElementById('tharaaCanvas');let lastTP=-1;
  const thRenderer=setupCanvas(thCanvas,(ctx,w,h,p,force)=>{if(!force&&Math.abs(p-lastTP)<.0007)return;lastTP=p;base(ctx,w,h,p,2);const cx=w*.58,cy=h*.49,S=Math.min(w,h);for(let i=0;i<5;i++){ctx.save();ctx.globalAlpha=.12-i*.017;ctx.strokeStyle=['#22d3ee','#5b8cff','#8b5cf6','#f15bb5','#ffb64d'][i];ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,S*(.18+i*.085)+Math.sin(p*18+i)*6,0,Math.PI*2);ctx.stroke();ctx.restore()}for(let i=0;i<22;i++){const a=i/22*Math.PI*2+p*.8,r=S*(.23+(i%4)*.06),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.58;ctx.fillStyle=`rgba(${i%2?'241,91,181':'34,211,238'},${.08+(i%3)*.035})`;ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill()}if(p>.86){glow(ctx,w*.5,h*.5,S*.48,'139,92,246',smooth(.86,1,p)*.23)}});
  const hero=document.getElementById('tharaaHeroCopy'),showcase=document.getElementById('tharaaShowcase'),browser=document.getElementById('tharaaBrowser'),phone=document.getElementById('tharaaPhone'),badge=document.getElementById('tharaaBadge'),views={home:document.querySelector('[data-tharaa-view="home"]'),product:document.querySelector('[data-tharaa-view="product"]'),builder:document.querySelector('[data-tharaa-view="builder"]')},tCaps=[...document.querySelectorAll('.tharaa-cap')],tProg=document.getElementById('tharaaProgress'),tSteps=[...document.querySelectorAll('.tharaa-progress__steps span')],tFinal=document.getElementById('tharaaFinal');
  function setView(el,o,scale=1){if(!el)return;el.style.opacity=o;el.style.transform=`scale(${scale})`;}
  function updateTharaa(p){
    const heroOut=smooth(.04,.18,p);if(hero){hero.style.opacity=1-heroOut;hero.style.transform=`translateY(${-35*heroOut}px)`}
    const showIn=smooth(.07,.20,p),showOut=smooth(.84,.95,p);if(showcase){showcase.style.opacity=showIn*(1-showOut);showcase.style.transform=`translateY(${-46-4*showOut}%) scale(${.92+.08*showIn-.06*showOut})`}
    const home=(1-smooth(.28,.39,p))*smooth(.08,.17,p),product=smooth(.27,.39,p)*(1-smooth(.51,.62,p)),builder=smooth(.50,.63,p)*(1-smooth(.78,.88,p));setView(views.home,home,1+.025*(1-home));setView(views.product,product,1+.025*(1-product));setView(views.builder,builder,1+.025*(1-builder));
    if(browser){const ry=lerp(-8,2,smooth(.07,.78,p)),rx=lerp(3,0,smooth(.07,.55,p)),y=-16*Math.sin(p*Math.PI);browser.style.transform=`perspective(1500px) rotateY(${ry}deg) rotateX(${rx}deg) translate3d(0,${y}px,0)`}
    if(phone){const po=smooth(.38,.55,p)*(1-smooth(.73,.85,p));phone.style.opacity=po;phone.style.transform=`translateY(${40*(1-po)}px) rotate(${lerp(5,-1,po)}deg)`}
    if(badge){const bo=smooth(.42,.57,p)*(1-smooth(.70,.82,p));badge.style.opacity=bo;badge.style.transform=`translateY(${20*(1-bo)}px)`}
    tCaps.forEach(el=>{const o=fade(+el.dataset.a,+el.dataset.b,p);el.style.opacity=o;el.style.transform=`translateY(${25*(1-o)}px)`;el.classList.toggle('active',o>.65)});
    const fo=smooth(.88,.98,p);if(tFinal){tFinal.style.opacity=fo;tFinal.style.pointerEvents=fo>.8?'auto':'none';tFinal.style.transform=`scale(${.96+.04*fo})`}
    if(tProg)tProg.style.height=p*100+'%';tSteps.forEach((el,i)=>el.classList.toggle('active',p>=i/(tSteps.length-1)-.03));
  }
  if(tharaa&&thRenderer){if(reduce||!hasGSAP){thRenderer.render(.94,true);updateTharaa(.94)}else ScrollTrigger.create({trigger:tharaa,start:'top top',end:'bottom bottom',scrub:true,onUpdate:s=>{thRenderer.render(s.progress);updateTharaa(s.progress)}})}

  // Pointer depth on the Tharaa device, without touching the scroll transform channel.
  if(showcase&&browser&&matchMedia('(pointer:fine)').matches&&!reduce){showcase.addEventListener('pointermove',e=>{const r=showcase.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;browser.style.setProperty('--px',nx);browser.style.filter=`drop-shadow(${nx*-18}px ${ny*-14}px 34px rgba(0,0,0,.18))`});showcase.addEventListener('pointerleave',()=>browser.style.filter='none')}
  if(hasGSAP){addEventListener('load',()=>ScrollTrigger.refresh());document.fonts?.ready?.then(()=>ScrollTrigger.refresh())}
})();
;

/* Preserved source runtime block 3. */
// Restored cinematic philosophy journey — V6.
(() => {
  'use strict';
  const story=document.querySelector('.cinematic-story');
  const canvas=document.getElementById('cinematicCanvas');
  if(!story||!canvas) return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Native scroll engine: no GSAP/ScrollTrigger dependency.
  document.documentElement.classList.remove('no-story-motion');
  if(reduce){document.documentElement.classList.add('no-story-motion');return;}
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx){document.documentElement.classList.add('no-story-motion');return;}
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
  const fade=(a,b,p)=>{const m=(a+b)/2;return Math.max(0,Math.min(smooth(a,a+(m-a)*.72,p),1-smooth(m+(b-m)*.30,b,p)))};
  let w=1,h=1,dpr=1,last=-1,progress=0;
  const intro=document.getElementById('cinematicIntro');
  const captions=[...document.querySelectorAll('.cinematic-cap')];
  const rail=document.getElementById('cinematicRailProgress');
  const steps=[...document.querySelectorAll('.cinematic-story__steps span')];
  const finalAction=document.getElementById('cinematicFinalAction');
  const rr=(x,y,rw,rh,r)=>{r=Math.min(r,rw/2,rh/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+rw,y,x+rw,y+rh,r);ctx.arcTo(x+rw,y+rh,x,y+rh,r);ctx.arcTo(x,y+rh,x,y,r);ctx.arcTo(x,y,x+rw,y,r);ctx.closePath()};
  const glow=(x,y,r,c,a)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.4,`rgba(${c},${a*.28})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
  const line=(x1,y1,x2,y2,a=.2,lw=1)=>{ctx.strokeStyle=`rgba(132,164,255,${a})`;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
  function resize(){
    const host=canvas.parentElement;dpr=Math.min(innerWidth<760?1.35:2,devicePixelRatio||1);w=Math.max(1,host.clientWidth);h=Math.max(1,host.clientHeight);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw(progress,true);
  }
  function base(p){
    const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#02040d');bg.addColorStop(.5,'#07102a');bg.addColorStop(1,'#17091f');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    glow(w*.52,h*.48,Math.min(w,h)*.62,'71,116,255',.22);glow(w*.78,h*.24,Math.min(w,h)*.46,'241,91,181',.12);glow(w*.20,h*.72,Math.min(w,h)*.43,'35,213,238',.11);
    ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle='#7895e8';ctx.lineWidth=.7;const hz=h*.57;for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(w*.5,hz);ctx.lineTo(w*.5+i*w*.072,h*1.08);ctx.stroke()}for(let i=0;i<13;i++){const y=lerp(hz,h*1.05,(i/12)**2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
    for(let i=0;i<44;i++){const phase=(i*.137+p*.46)%1,x=(((Math.sin(i*12.9898)*43758.5453)%1)+1)%1*w,base=(((Math.sin(i*7.73)*9821.13)%1)+1)%1,y=((base-phase+1)%1)*h,r=1+(i%4)*.5;ctx.fillStyle=`rgba(${i%3===0?'35,213,238':i%3===1?'139,92,246':'241,91,181'},${.10+(i%5)*.03})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  }
  function draw(p,force=false){
    p=clamp(p);if(!force&&Math.abs(p-last)<.0007)return;last=p;progress=p;base(p);const cx=w*.53,cy=h*.49,S=Math.min(w,h);
    const idea=1-smooth(.08,.23,p),identity=smooth(.10,.31,p)*(1-smooth(.41,.54,p)),experience=smooth(.30,.53,p)*(1-smooth(.62,.75,p)),system=smooth(.50,.74,p)*(1-smooth(.81,.92,p)),growth=smooth(.72,.95,p);
    if(idea>.001){ctx.save();ctx.globalAlpha=idea;const pulse=1+Math.sin(p*32)*.025;glow(cx,cy,S*.23*pulse,'35,213,238',.43);for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(${i===0?'151,232,255':i===1?'139,92,246':'241,91,181'},${.56-i*.12})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,S*(.065+i*.055)*pulse,0,Math.PI*2);ctx.stroke()}ctx.fillStyle='#effdff';ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill();ctx.restore()}
    if(identity>.001){ctx.save();ctx.globalAlpha=identity;const hb=S*.16,spread=hb*.46,heights=[.72,1.16,.92];for(let i=0;i<3;i++){const bh=heights[i]*hb*smooth(.10+i*.025,.27+i*.025,p),bw=hb*.28,x=cx+(i-1)*spread-bw/2,y=cy-bh/2,g=ctx.createLinearGradient(x,y,x,y+bh);g.addColorStop(0,['#2fe7f3','#778eff','#f15bb5'][i]);g.addColorStop(1,'#7652ec');ctx.fillStyle=g;ctx.shadowColor=['#23d5ee','#7c6cff','#f15bb5'][i];ctx.shadowBlur=30;rr(x,y,bw,bh,bw*.28);ctx.fill()}ctx.shadowBlur=0;ctx.restore()}
    if(experience>.001){const cardW=Math.min(w*.64,790),cardH=Math.min(h*.53,480),x=cx-cardW/2,y=cy-cardH/2;ctx.save();ctx.globalAlpha=experience;ctx.fillStyle='rgba(10,18,49,.84)';ctx.strokeStyle='rgba(173,192,255,.40)';ctx.shadowColor='rgba(73,92,229,.38)';ctx.shadowBlur=44;rr(x,y,cardW,cardH,28);ctx.fill();ctx.shadowBlur=0;ctx.stroke();line(x,y+52,x+cardW,y+52,.26);['#ff5d82','#ffc857','#31d7a4'].forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+25+i*17,y+26,4,0,Math.PI*2);ctx.fill()});ctx.fillStyle='rgba(255,255,255,.065)';rr(x+24,y+78,cardW*.24,cardH-104,16);ctx.fill();for(let i=0;i<5;i++){ctx.fillStyle=i===0?'rgba(100,103,255,.68)':'rgba(255,255,255,.07)';rr(x+42,y+103+i*46,cardW*.14,16,8);ctx.fill()}const mainX=x+cardW*.31,mainW=cardW*.64;for(let i=0;i<3;i++){ctx.fillStyle='rgba(255,255,255,.06)';rr(mainX+i*(mainW/3+7),y+82,mainW/3-8,72,14);ctx.fill()}ctx.fillStyle='rgba(74,111,235,.16)';rr(mainX,y+174,mainW,cardH-200,18);ctx.fill();ctx.strokeStyle='rgba(35,213,238,.75)';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<8;i++){const xx=mainX+i*mainW/7,yy=y+cardH*.72-Math.sin(i*.85+p*2)*cardH*.09-i*2;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke();ctx.restore()}
    if(system>.001){ctx.save();ctx.globalAlpha=system;const nodes=[[cx,cy],[cx-S*.28,cy-S*.15],[cx+S*.30,cy-S*.16],[cx-S*.25,cy+S*.21],[cx+S*.27,cy+S*.22],[cx,cy-S*.33]];for(let i=1;i<nodes.length;i++){line(nodes[0][0],nodes[0][1],nodes[i][0],nodes[i][1],.24,1.5);const t=(p*7+i*.17)%1,px=lerp(nodes[0][0],nodes[i][0],t),py=lerp(nodes[0][1],nodes[i][1],t);glow(px,py,20,'35,213,238',.48);ctx.fillStyle='#a7f3ff';ctx.beginPath();ctx.arc(px,py,3.4,0,Math.PI*2);ctx.fill()}nodes.forEach(([x,y],i)=>{glow(x,y,i===0?72:45,i%3===0?'139,92,246':i%3===1?'35,213,238':'241,91,181',i===0?.30:.18);ctx.fillStyle='rgba(9,18,50,.95)';ctx.strokeStyle=i===0?'rgba(255,255,255,.46)':'rgba(129,157,255,.34)';rr(x-(i===0?62:48),y-(i===0?42:34),i===0?124:96,i===0?84:68,16);ctx.fill();ctx.stroke();ctx.fillStyle=i===0?'#fff':'rgba(255,255,255,.72)';ctx.font=`800 ${i===0?14:10}px Arial`;ctx.textAlign='center';ctx.fillText(['CORE','CONTENT','SEARCH','CRM','STORE','ANALYTICS'][i],x,y+4)});ctx.restore()}
    if(growth>.001){ctx.save();ctx.globalAlpha=growth;const graphW=Math.min(w*.66,820),graphH=Math.min(h*.42,370),gx=cx-graphW/2,gy=cy-graphH/2;ctx.fillStyle='rgba(7,14,39,.76)';ctx.strokeStyle='rgba(156,178,255,.28)';rr(gx,gy,graphW,graphH,26);ctx.fill();ctx.stroke();for(let i=1;i<5;i++)line(gx+30,gy+i*graphH/5,gx+graphW-30,gy+i*graphH/5,.10);const pts=[];for(let i=0;i<9;i++){pts.push([gx+45+i*(graphW-90)/8,gy+graphH-55-(i/8)*graphH*.58-Math.sin(i*1.2)*graphH*.08])}const grad=ctx.createLinearGradient(gx,0,gx+graphW,0);grad.addColorStop(0,'#23d5ee');grad.addColorStop(.5,'#748dff');grad.addColorStop(1,'#f15bb5');ctx.strokeStyle=grad;ctx.lineWidth=4;ctx.shadowColor='rgba(104,113,255,.65)';ctx.shadowBlur=22;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.shadowBlur=0;pts.forEach(([x,y],i)=>{ctx.fillStyle=i===8?'#fff':i%2?'#8b5cf6':'#23d5ee';ctx.beginPath();ctx.arc(x,y,i===8?6:3.5,0,Math.PI*2);ctx.fill()});ctx.font=`900 ${Math.max(22,Math.min(48,w*.038))}px "Tajawal",Arial`;ctx.textAlign='center';ctx.direction='rtl';ctx.fillStyle=`rgba(255,255,255,${smooth(.89,.98,p)})`;ctx.fillText('أصل رقمي ينمو معك',cx,gy+graphH+Math.min(72,h*.09));ctx.restore()}
  }
  function update(p){
    if(intro){const t=smooth(.02,.17,p);intro.style.opacity=1-t;intro.style.transform=`translateY(${-44*t}px) scale(${1-.04*t})`}
    captions.forEach(el=>{const o=fade(+el.dataset.a,+el.dataset.b,p);el.style.opacity=o;el.style.transform=`translateY(${26*(1-o)}px)`});
    if(rail)rail.style.height=p*100+'%';steps.forEach((el,i)=>el.classList.toggle('active',p>=i/(steps.length-1)-.025));
    if(finalAction){const o=smooth(.91,.985,p);finalAction.style.opacity=o;finalAction.style.transform=`translate(-50%,${20*(1-o)}px)`;finalAction.style.pointerEvents=o>.78?'auto':'none'}
  }
  let rafId=0;
  const getProgress=()=>{
    const rect=story.getBoundingClientRect();
    const scrollable=Math.max(1,story.offsetHeight-innerHeight);
    return clamp((-rect.top)/scrollable);
  };
  const renderFromScroll=()=>{
    rafId=0;
    const p=getProgress();
    draw(p);
    update(p);
  };
  const requestRender=()=>{
    if(!rafId) rafId=requestAnimationFrame(renderFromScroll);
  };
  const refresh=()=>{
    resize();
    renderFromScroll();
  };
  resize();
  update(0);
  if('ResizeObserver' in window)new ResizeObserver(refresh).observe(canvas.parentElement);
  else addEventListener('resize',refresh,{passive:true});
  addEventListener('scroll',requestRender,{passive:true});
  addEventListener('orientationchange',refresh,{passive:true});
  addEventListener('pageshow',refresh,{passive:true});
  addEventListener('load',refresh,{once:true});
  document.fonts?.ready?.then(refresh);
  renderFromScroll();
})();
;

/* Preserved source runtime block 4. */
// =========================================================
// IBTIKAR TECH V7 — PROGRAMMATIC HERO + CINEMATIC VOICES
// =========================================================
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
  const rr=(c,x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const glow=(c,x,y,r,color,a)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${a})`);g.addColorStop(.45,`rgba(${color},${a*.25})`);g.addColorStop(1,`rgba(${color},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};

  // Hero's living digital system, using GSAP ticker so it shares the page animation clock.
  const heroCanvas=document.getElementById('heroSystemCanvas');
  const heroStage=document.querySelector('.hero-system-stage');
  if(heroCanvas&&heroStage){
    const ctx=heroCanvas.getContext('2d'); let w=1,h=1,dpr=1,t=0,visible=true,px=.5,py=.5;
    const points=Array.from({length:38},(_,i)=>({a:i/38*Math.PI*2,r:.16+(i%7)*.045,s:.10+(i%5)*.035,z:i%3}));
    const resize=()=>{const r=heroStage.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(2,devicePixelRatio||1);heroCanvas.width=Math.round(w*dpr);heroCanvas.height=Math.round(h*dpr);heroCanvas.style.width=w+'px';heroCanvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw();};
    const draw=()=>{ctx.clearRect(0,0,w,h);const cx=w*.5+(px-.5)*18,cy=h*.39+(py-.5)*12,S=Math.min(w,h);glow(ctx,cx,cy,S*.48,'72,105,238',.14);glow(ctx,w*.75,h*.22,S*.28,'34,211,238',.10);glow(ctx,w*.28,h*.66,S*.30,'241,91,181',.07);
      ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle='#7d96ef';ctx.lineWidth=.7;for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(cx,cy,S*(.14+i*.045),0,Math.PI*2);ctx.stroke()}ctx.restore();
      const coords=points.map((p,i)=>{const a=p.a+t*p.s,rad=S*p.r*(1+.035*Math.sin(t*1.7+i));return [cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.72,p.z]});
      coords.forEach((p,i)=>{const q=coords[(i+7)%coords.length];if(Math.hypot(p[0]-q[0],p[1]-q[1])<S*.27){ctx.strokeStyle=`rgba(${p[2]===0?'34,211,238':p[2]===1?'112,126,245':'241,91,181'},.09)`;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke()}ctx.fillStyle=p[2]===0?'rgba(34,211,238,.55)':p[2]===1?'rgba(121,133,255,.48)':'rgba(241,91,181,.45)';ctx.beginPath();ctx.arc(p[0],p[1],1.2+(i%3)*.6,0,Math.PI*2);ctx.fill();});
      for(let i=0;i<5;i++){const a=t*.18+i/5*Math.PI*2,rad=S*.33,x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad*.72;ctx.fillStyle='rgba(7,14,37,.82)';ctx.strokeStyle='rgba(127,158,255,.21)';rr(ctx,x-26,y-11,52,22,11);ctx.fill();ctx.stroke();}
    };
    const tick=time=>{if(!visible||reduce)return;t=time*.001;draw();};
    if(hasGSAP) gsap.ticker.add(tick); else if(!reduce){const raf=ms=>{tick(ms);requestAnimationFrame(raf)};requestAnimationFrame(raf)}
    new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:.05}).observe(heroStage);
    if(matchMedia('(pointer:fine)').matches){heroStage.addEventListener('pointermove',e=>{const r=heroStage.getBoundingClientRect();px=(e.clientX-r.left)/r.width;py=(e.clientY-r.top)/r.height});heroStage.addEventListener('pointerleave',()=>{px=.5;py=.5})}
    addEventListener('resize',resize,{passive:true});resize();
  }

  // Customer voices: scroll narrative on desktop, horizontal accessible cards on mobile.
  const section=document.querySelector('.voices-cinema');
  const canvas=document.getElementById('voicesCanvas');
  const scenes=[...document.querySelectorAll('.voice-scene')];
  const steps=[...document.querySelectorAll('.voices-progress span')];
  const progressLine=document.getElementById('voicesProgress');
  const currentEl=document.getElementById('voiceCurrent');
  const prev=document.getElementById('voicePrev'),next=document.getElementById('voiceNext');
  let active=0,sectionST=null,ctx=null,w=1,h=1,dpr=1,p=.01,last=-1;
  const centers=[.125,.375,.625,.875];
  const fade=(a,b,x)=>{const m=(a+b)/2;return Math.min(smooth(a,a+(m-a)*.66,x),1-smooth(m+(b-m)*.34,b,x));};
  function setActive(index,progress){active=Math.max(0,Math.min(scenes.length-1,index));scenes.forEach((el,i)=>{const o=innerWidth<=760?1:fade(+el.dataset.a,+el.dataset.b,progress);el.style.opacity=o;el.style.transform=innerWidth<=760?'none':`translateY(${30*(1-o)}px) scale(${.97+.03*o})`;el.classList.toggle('active',i===active)});steps.forEach((el,i)=>el.classList.toggle('active',i<=active));if(progressLine)progressLine.style.height=progress*100+'%';if(currentEl)currentEl.textContent=String(active+1).padStart(2,'0');}
  function jump(index){index=(index+scenes.length)%scenes.length;if(innerWidth<=760){scenes[index]?.scrollIntoView({behavior:reduce?'auto':'smooth',inline:'center',block:'nearest'});active=index;if(currentEl)currentEl.textContent=String(active+1).padStart(2,'0');return}if(sectionST){const y=sectionST.start+centers[index]*(sectionST.end-sectionST.start);if(window.ibtikarLenis)window.ibtikarLenis.scrollTo(y,{duration:.9});else scrollTo({top:y,behavior:reduce?'auto':'smooth'})}}
  prev?.addEventListener('click',()=>jump(active-1));next?.addEventListener('click',()=>jump(active+1));
  scenes.forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--vx',`${e.clientX-r.left}px`);el.style.setProperty('--vy',`${e.clientY-r.top}px`)}));

  if(section&&canvas){ctx=canvas.getContext('2d',{alpha:false});const resize=()=>{const host=canvas.parentElement;w=host.clientWidth;h=host.clientHeight;dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw(p,true)};
    function draw(nextP,force=false){p=clamp(nextP);if(!force&&Math.abs(p-last)<.001)return;last=p;const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#02040c');g.addColorStop(.48,'#071027');g.addColorStop(1,'#17091f');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);const phase=p*Math.PI*7;glow(ctx,w*(.75-.12*Math.sin(phase)),h*(.25+.08*Math.cos(phase)),Math.min(w,h)*.55,'73,99,231',.17);glow(ctx,w*(.25+.08*Math.cos(phase*.7)),h*.72,Math.min(w,h)*.42,'34,211,238',.08);glow(ctx,w*.82,h*.76,Math.min(w,h)*.34,'241,91,181',.075);
      ctx.save();ctx.globalAlpha=.10;ctx.strokeStyle='#7588cc';ctx.lineWidth=.6;const hz=h*.60;for(let i=-12;i<13;i++){ctx.beginPath();ctx.moveTo(w*.55,hz);ctx.lineTo(w*.55+i*w*.075,h*1.06);ctx.stroke()}for(let i=0;i<12;i++){const y=lerp(hz,h*1.04,(i/11)**2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
      // Voice wave across the scene.
      ctx.save();ctx.translate(0,h*.49);ctx.strokeStyle='rgba(92,139,255,.16)';ctx.lineWidth=1.2;ctx.beginPath();for(let x=0;x<=w;x+=4){const amp=h*(.018+.026*Math.sin(p*Math.PI));const y=Math.sin(x*.018+phase)*amp+Math.sin(x*.041-phase*.7)*amp*.35;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.strokeStyle='rgba(34,211,238,.22)';ctx.beginPath();for(let x=0;x<=w;x+=4){const y=Math.sin(x*.014-phase*1.2)*h*.012;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.restore();
      for(let i=0;i<42;i++){const x=(((Math.sin(i*12.7)*43758.5)%1+1)%1)*w,y=((((Math.sin(i*7.9)*9713.2)%1+1)%1)*h+p*h*.16)%h;ctx.fillStyle=`rgba(${i%3===0?'34,211,238':i%3===1?'126,139,255':'241,91,181'},${.06+(i%4)*.025})`;ctx.beginPath();ctx.arc(x,y,1+(i%3)*.45,0,Math.PI*2);ctx.fill()}
    }
    addEventListener('resize',resize,{passive:true});resize();
    if(innerWidth<=760||reduce||!hasGSAP){draw(.65,true);setActive(0,.01)}else{sectionST=ScrollTrigger.create({trigger:section,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>{draw(self.progress);const idx=Math.min(3,Math.floor(self.progress*4));setActive(idx,self.progress)}});setActive(0,.01)}
  }
  if(hasGSAP){addEventListener('load',()=>ScrollTrigger.refresh());document.fonts?.ready?.then(()=>ScrollTrigger.refresh())}
})();
;

/* Preserved source runtime block 5. */
// V8 — Tharaa immersive theme lab.
(() => {
  'use strict';
  const section=document.querySelector('.thx'),canvas=document.getElementById('thxCanvas');
  if(!section||!canvas)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP=typeof window.gsap!=='undefined'&&typeof window.ScrollTrigger!=='undefined';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
  const fade=(a,b,p)=>{const m=(a+b)/2;return Math.max(0,Math.min(smooth(a,a+(m-a)*.68,p),1-smooth(m+(b-m)*.34,b,p)))};
  const intro=document.getElementById('thxIntro'),lab=document.getElementById('thxLab'),browser=document.getElementById('thxBrowser'),phone=document.getElementById('thxPhone');
  const views={home:document.querySelector('[data-thx-view="home"]'),product:document.querySelector('[data-thx-view="product"]'),cart:document.querySelector('[data-thx-view="cart"]'),builder:document.querySelector('[data-thx-view="builder"]')};
  const caps=[...document.querySelectorAll('.thx-cap')],progressEl=document.getElementById('thxProgress'),steps=[...document.querySelectorAll('.thx-progress__steps span')],finalEl=document.getElementById('thxFinal');
  const mobileCard=document.getElementById('thxMobileCard'),conversionCard=document.getElementById('thxConversionCard'),supportCard=document.getElementById('thxSupportCard'),palette=document.getElementById('thxPalette');
  const navButtons=[...document.querySelectorAll('[data-thx-step]')];
  let progress=0,ctx=canvas.getContext('2d',{alpha:false}),w=1,h=1,dpr=1,last=-1,scrollTrigger=null;
  function resize(){const host=canvas.parentElement;dpr=Math.min(innerWidth<760?1.3:2,devicePixelRatio||1);w=Math.max(1,host.clientWidth);h=Math.max(1,host.clientHeight);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw(progress,true)}
  function glow(x,y,r,c,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.45,`rgba(${c},${a*.24})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  function draw(p,force=false){if(!ctx||(!force&&Math.abs(p-last)<.001))return;last=p;const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#02040d');g.addColorStop(.52,'#071027');g.addColorStop(1,'#17091f');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);const S=Math.min(w,h),cx=w*.59,cy=h*.49;glow(cx,cy,S*.62,'92,110,255',.18);glow(w*.78,h*.22,S*.45,'241,91,181',.10);glow(w*.18,h*.76,S*.42,'34,211,238',.10);
    ctx.save();ctx.globalAlpha=.10;ctx.strokeStyle='#7894e5';ctx.lineWidth=.65;const hz=h*.58;for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(w*.5,hz);ctx.lineTo(w*.5+i*w*.075,h*1.08);ctx.stroke()}for(let i=0;i<12;i++){const y=lerp(hz,h*1.06,(i/11)**2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
    for(let i=0;i<31;i++){const a=i/31*Math.PI*2+p*.9,r=S*(.22+(i%5)*.055),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.56;ctx.fillStyle=`rgba(${i%3===0?'241,91,181':i%3===1?'34,211,238':'130,112,255'},${.055+(i%4)*.018})`;ctx.beginPath();ctx.arc(x,y,1+(i%3),0,Math.PI*2);ctx.fill()}
    const pulse=.5+.5*Math.sin(p*Math.PI*10);ctx.strokeStyle=`rgba(148,168,255,${.12+pulse*.05})`;ctx.lineWidth=1;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(cx,cy,S*(.18+i*.085)+Math.sin(p*15+i)*5,0,Math.PI*2);ctx.stroke()}
    if(p>.88)glow(w*.5,h*.5,S*.55,'124,92,255',smooth(.88,1,p)*.24);
  }
  function setView(el,o,scale=1){if(!el)return;el.style.opacity=o;el.style.transform=`scale(${scale})`}
  function setCard(el,o,dx=0,dy=18){if(!el)return;el.style.opacity=o;el.style.transform=`translate(${dx*(1-o)}px,${dy*(1-o)}px)`}
  function update(p){progress=p;draw(p);
    const introOut=smooth(.035,.16,p);if(intro){intro.style.opacity=1-introOut;intro.style.transform=`translateY(${-34*introOut}px)`}
    const labIn=smooth(.07,.19,p),labOut=smooth(.89,.97,p);if(lab){lab.style.opacity=labIn*(1-labOut);lab.style.transform=`translateY(${-43-4*labOut}%) scale(${.92+.08*labIn-.055*labOut})`}
    const home=smooth(.075,.16,p)*(1-smooth(.25,.34,p));const product=smooth(.24,.34,p)*(1-smooth(.43,.52,p));const cart=smooth(.42,.52,p)*(1-smooth(.59,.68,p));const builder=smooth(.68,.79,p)*(1-smooth(.86,.93,p));setView(views.home,home,1+.025*(1-home));setView(views.product,product,1+.025*(1-product));setView(views.cart,cart,1+.025*(1-cart));setView(views.builder,builder,1+.025*(1-builder));
    if(browser){const ry=lerp(-8,2,smooth(.08,.82,p)),rx=lerp(3,0,smooth(.08,.55,p)),y=-13*Math.sin(p*Math.PI);browser.style.transform=`perspective(1500px) rotateY(${ry}deg) rotateX(${rx}deg) translate3d(0,${y}px,0)`}
    if(phone){const po=smooth(.40,.51,p)*(1-smooth(.64,.72,p));phone.style.opacity=po;phone.style.transform=`translateY(${46*(1-po)}px) rotate(${lerp(5,-1,po)}deg)`}
    const mo=smooth(.43,.54,p)*(1-smooth(.61,.70,p));setCard(mobileCard,mo,-18,28);const co=smooth(.27,.37,p)*(1-smooth(.50,.58,p));setCard(conversionCard,co,18,-20);const so=smooth(.73,.82,p)*(1-smooth(.88,.94,p));setCard(supportCard,so,-15,-18);
    if(palette){const po=smooth(.58,.68,p)*(1-smooth(.79,.87,p));palette.style.opacity=po;palette.style.transform=`translateY(${18*(1-po)}px)`}
    caps.forEach(el=>{const o=fade(+el.dataset.a,+el.dataset.b,p);el.style.opacity=o;el.style.transform=`translateY(${25*(1-o)}px)`;el.classList.toggle('active',o>.62)});
    const fo=smooth(.91,.985,p);if(finalEl){finalEl.style.opacity=fo;finalEl.style.pointerEvents=fo>.82?'auto':'none';finalEl.style.transform=`scale(${.965+.035*fo})`}
    if(progressEl)progressEl.style.height=p*100+'%';steps.forEach((el,i)=>el.classList.toggle('active',p>=i/(steps.length-1)-.025));
    const centers=[.13,.33,.52,.70,.86];let active=centers.reduce((best,c,i)=>Math.abs(c-p)<Math.abs(centers[best]-p)?i:best,0);navButtons.forEach((b,i)=>b.classList.toggle('active',i===active));
    if(p>.61&&p<.78&&!section.dataset.paletteLocked){section.dataset.palette=p<.67?'beauty':p<.72?'fashion':'tech';syncPaletteButtons()}
  }
  function syncPaletteButtons(){document.querySelectorAll('[data-thx-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.thxPalette===section.dataset.palette)))}
  document.querySelectorAll('[data-thx-palette]').forEach(btn=>btn.addEventListener('click',()=>{section.dataset.palette=btn.dataset.thxPalette;section.dataset.paletteLocked='1';syncPaletteButtons()}));
  const desktopBtn=document.getElementById('thxDesktopBtn'),mobileBtn=document.getElementById('thxMobileBtn');
  function setDevice(mobile){section.classList.toggle('is-mobile-preview',mobile);desktopBtn?.setAttribute('aria-pressed',String(!mobile));mobileBtn?.setAttribute('aria-pressed',String(mobile))}
  desktopBtn?.addEventListener('click',()=>setDevice(false));mobileBtn?.addEventListener('click',()=>setDevice(true));
  document.getElementById('thxFullscreenBtn')?.addEventListener('click',()=>{if(!document.fullscreenElement)browser?.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.()});
  navButtons.forEach(btn=>btn.addEventListener('click',()=>{const target=+btn.dataset.thxStep;if(scrollTrigger){const y=scrollTrigger.start+target*(scrollTrigger.end-scrollTrigger.start);if(window.lenis)window.lenis.scrollTo(y,{duration:1.1});else scrollTo({top:y,behavior:'smooth'})}}));
  if(matchMedia('(pointer:fine)').matches&&!reduce&&lab&&browser){lab.addEventListener('pointermove',e=>{const r=lab.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;browser.style.filter=`drop-shadow(${nx*-15}px ${ny*-12}px 32px rgba(0,0,0,.18))`});lab.addEventListener('pointerleave',()=>browser.style.filter='none')}
  if(reduce||!hasGSAP){document.documentElement.classList.add('no-thx-motion');setView(views.home,1,1);if(intro){intro.style.opacity=1;intro.style.transform='none'}if(lab){lab.style.opacity=1}if(finalEl){finalEl.style.opacity=1;finalEl.style.pointerEvents='auto'}resize();return}
  gsap.registerPlugin(ScrollTrigger);resize();addEventListener('resize',resize,{passive:true});scrollTrigger=ScrollTrigger.create({trigger:section,start:'top top',end:'bottom bottom',scrub:true,onUpdate:s=>update(s.progress)});addEventListener('load',()=>ScrollTrigger.refresh());document.fonts?.ready?.then(()=>ScrollTrigger.refresh());
})();
;

/* Preserved source runtime block 6. */
(() => {
  const items = [...document.querySelectorAll('.ibtx-menu-item')];
  const drawer = document.querySelector('.ibtx-drawer');
  const toggle = document.querySelector('.ibtx-mobile-toggle');
  const closeButton = document.querySelector('[data-ibtx-close]');
  const backdrop = document.querySelector('.ibtx-drawer__backdrop');

  const closeMenus = (except = null) => {
    items.forEach(item => {
      if (item !== except) {
        item.classList.remove('ibtx-open');
        item.querySelector('.ibtx-menu-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
  };

  items.forEach(item => {
    const trigger = item.querySelector('.ibtx-menu-trigger');
    trigger?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const open = !item.classList.contains('ibtx-open');
      closeMenus(item);
      item.classList.toggle('ibtx-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  document.addEventListener('click', () => closeMenus());

  const openDrawer = () => {
    drawer?.classList.add('ibtx-open');
    drawer?.setAttribute('aria-hidden', 'false');
    toggle?.setAttribute('aria-expanded', 'true');
  };
  const closeDrawer = () => {
    drawer?.classList.remove('ibtx-open');
    drawer?.setAttribute('aria-hidden', 'true');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', event => {
    event.stopImmediatePropagation();
    openDrawer();
  });
  closeButton?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  drawer?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenus();
      closeDrawer();
    }
  });
})();
;

/* Preserved source runtime block 7. */
(() => {
  const section = document.querySelector('.ibtx-tharaa-preview');
  if (!section) return;

  const tabs = [...section.querySelectorAll('.ibtx-device-tab, .ibtx-toolbar-device')];
  const previews = [...section.querySelectorAll('[data-preview]')];
  const stage = section.querySelector('.ibtx-preview-stage');
function showDevice(device) {
    tabs.forEach(tab => {
      const active = tab.dataset.device === device;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    previews.forEach(preview => {
      preview.classList.toggle('is-visible', preview.dataset.preview === device);
    });

    if (stage) stage.dataset.activeDevice = device;
}

  tabs.forEach(tab => {
    tab.addEventListener('click', () => showDevice(tab.dataset.device));
  });
})();
;

/* Preserved source runtime block 8. */
(() => {
  'use strict';

  // Never let placeholder links jump unexpectedly to the top.
  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', event => event.preventDefault());
  });

  // Keep external animation dependency failures from hiding content.
  const hasGSAP = typeof window.gsap !== 'undefined' &&
                  typeof window.ScrollTrigger !== 'undefined';

  if (!hasGSAP) {
    document.documentElement.classList.add('no-immersive-motion');
  }

  // Add descriptive labels to icon-only controls where missing.
  const labels = new Map([
    ['.theme-toggle', 'تبديل الوضع الفاتح والداكن'],
    ['.ibtx-mobile-toggle', 'فتح قائمة الجوال'],
    ['[data-ibtx-close]', 'إغلاق قائمة الجوال']
  ]);

  labels.forEach((label, selector) => {
    document.querySelectorAll(selector).forEach(element => {
      if (!element.getAttribute('aria-label')) {
        element.setAttribute('aria-label', label);
      }
    });
  });

  // Prevent stale open menus after breakpoint changes.
  const closeResponsiveMenus = () => {
    if (window.innerWidth > 1120) {
      document.querySelector('.ibtx-drawer')?.classList.remove('ibtx-open');
      document.body.classList.remove('menu-open', 'ibtx-menu-open');
      document.querySelector('.ibtx-mobile-toggle')
        ?.setAttribute('aria-expanded', 'false');
    }
  };

  window.addEventListener('resize', closeResponsiveMenus, { passive: true });

  // Refresh ScrollTrigger after fonts/layout settle, when available.
  const refreshMotionLayout = () => {
    try {
      window.ScrollTrigger?.refresh();
    } catch (_) {}
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(refreshMotionLayout);
  }
  window.addEventListener('load', () => {
    requestAnimationFrame(() => requestAnimationFrame(refreshMotionLayout));
  }, { once: true });

  // Ensure device preview state is valid on first load.
  const tharaa = document.querySelector('.ibtx-tharaa-preview');
  if (tharaa) {
    const activeTab = tharaa.querySelector(
      '.ibtx-toolbar-device.is-active, .ibtx-device-tab.is-active'
    );
    const device = activeTab?.dataset.device || 'desktop';
    tharaa.querySelectorAll('[data-preview]').forEach(preview => {
      preview.classList.toggle('is-visible', preview.dataset.preview === device);
    });
  }
})();
;

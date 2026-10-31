/* V2 / KINETIC — independent motion controller.
   One frame loop, passive scroll/pointer input, intersection culling, reduced-motion support.
   No external libraries, no duplicate animation engines. */
(() => {
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(pointer: fine)');
  const hero=document.querySelector('.v2-hero');
  const nav=document.querySelector('.navigation');
  const menu=document.querySelector('.menu-toggle');
  const field=document.querySelector('.v2-floating-schedule');
  const work=document.querySelector('.work-section');
  const cards=Array.from(document.querySelectorAll('.work-card'));
  const sections=Array.from(document.querySelectorAll('.section'));
  const reveals=Array.from(document.querySelectorAll('.reveal'));
  let visibleHero=true, visibleSections=new Set();
  let px=0,py=0,tx=0,ty=0;
  let running=false,last=0;
  let hidden=document.hidden;

  // Navigation works even when reduced motion is enabled.
  if(nav&&menu){
    menu.addEventListener('click',()=>{
      const open=nav.dataset.open!=='true';
      nav.dataset.open=String(open);
      menu.setAttribute('aria-expanded',String(open));
    });
    nav.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
      nav.dataset.open='false';menu.setAttribute('aria-expanded','false');
    }));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && nav.dataset.open==='true'){
        nav.dataset.open='false';menu.setAttribute('aria-expanded','false');menu.focus();
      }
    });
  }

  // Human name fallback: letter-by-letter wordmark, not a giant V tile.
  const signature=document.querySelector('.signature-name');
  if(signature){
    const name=signature.textContent.trim();
    signature.textContent='';
    [...name].forEach((ch,i)=>{
      const span=document.createElement('span');
      span.className='sig-letter';
      span.textContent=ch===''?' ':ch;
      span.style.setProperty('--i',String(i));
      span.style.setProperty('--wave-y',String(i%3*-3)+'px');
      span.setAttribute('aria-hidden','true');
      signature.appendChild(span);
    });
    signature.setAttribute('aria-label',name);
  }

  // Split the existing section titles without replacing the words or adding fake content.
  const splitWords=el=>{
    if(!el || el.dataset.wordsReady)return;
    el.dataset.wordsReady='1';
    let i=0;
    const walk=node=>{
      [...node.childNodes].forEach(child=>{
        if(child.nodeType===Node.TEXT_NODE){
          const value=child.textContent;
          const pieces=value.match(/\S+\s*|\s+/g);
          if(!pieces)return;
          const frag=document.createDocumentFragment();
          pieces.forEach(piece=>{
            if(!piece.trim()){frag.append(document.createTextNode(piece));return}
            const span=document.createElement('span');
            span.className='kinetic-word';
            span.style.setProperty('--word-index',String(Math.min(i++,8)));
            span.textContent=piece;
            frag.append(span);
          });
          child.replaceWith(frag);
        } else if(child.nodeType===Node.ELEMENT_NODE && child.tagName!=='SCRIPT') walk(child);
      });
    };
    walk(el);
  };
  document.querySelectorAll('.section-heading h2,.about-intro h2,.contact-title').forEach(splitWords);

  // Respect immediately visible content; never hide the hero on load.
  if(reduce.matches || !('IntersectionObserver' in window)){
    reveals.forEach(el=>el.classList.add('in-view'));
  } else {
    const ro=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('in-view');ro.unobserve(entry.target)}
      });
    },{threshold:.055,rootMargin:'0px 0px 105px 0px'});
    reveals.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top<innerHeight+90)el.classList.add('in-view');
      else ro.observe(el);
    });
  }

  // Cursor depth on backdrop and floating fields only; nothing jumps aggressively.
  if(hero && fine.matches && !reduce.matches){
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)*2-1));
      ty=Math.max(-1,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)*2-1));
      ensureFrame();
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{tx=0;ty=0;ensureFrame()},{passive:true});
  }

  if(!reduce.matches){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.target===hero)visibleHero=e.isIntersecting;
        if(e.isIntersecting)visibleSections.add(e.target);
        else visibleSections.delete(e.target);
      });
      ensureFrame();
    },{rootMargin:'20% 0px 20% 0px',threshold:0});
    sections.forEach(s=>io.observe(s));
    if(hero)io.observe(hero);
  }

  function updateScrollDepth(){
    if(reduce.matches)return;
    const vh=innerHeight;
    for(const section of visibleSections){
      const r=section.getBoundingClientRect();
      if(r.bottom<0||r.top>vh)continue;
      const p=Math.max(-1,Math.min(1,(r.top+r.height*.5-vh*.5)/Math.max(vh,r.height)));
      section.style.setProperty('--section-shift',(p*-35).toFixed(2)+'px');
      section.style.setProperty('--edge-shift',(p*-24).toFixed(2)+'px');
      if(section===work) {
        section.style.setProperty('--orb-x',(p*31).toFixed(2)+'px');
        cards.forEach((card,index)=>{
          const cr=card.getBoundingClientRect();
          if(cr.bottom<0||cr.top>vh)return;
          const cp=(cr.top+cr.height/2-vh/2)/Math.max(vh,cr.height);
          card.style.setProperty('--card-shift',(Math.max(-12,Math.min(12,-cp*(6+index%3*3)))).toFixed(1)+'px');
        });
      }
    }
  }

  // Single rAF loop: the ribbing flows even when the pointer is still.
  function frame(time){
    running=false;
    if(hidden||reduce.matches)return;
    const dt=Math.min(.05,Math.max(.001,(time-last)/1000||.016));
    last=time;
    const lerp=1-Math.exp(-7.6*dt);
    px+=(tx-px)*lerp;py+=(ty-py)*lerp;
    if(visibleHero && hero){
      const r=hero.getBoundingClientRect();
      const progress=Math.max(-1,Math.min(1,-r.top/Math.max(1,r.height)));
      hero.style.setProperty('--mx',(px*26).toFixed(2)+'px');
      hero.style.setProperty('--my',(py*17+progress*13).toFixed(2)+'px');
      hero.style.setProperty('--sx',(px*-11).toFixed(2)+'px');
      hero.style.setProperty('--sy',(py*-8+progress*-21).toFixed(2)+'px');
      hero.style.setProperty('--rib',(Math.sin(time*.00026)*4.2+px*2).toFixed(2)+'px');
      hero.style.setProperty('--hero-turn',(px*.34).toFixed(2)+'deg');
      if(field){
        field.style.setProperty('--field-x',(px*-13).toFixed(2)+'px');
        field.style.setProperty('--field-y',(py*-10+progress*12).toFixed(2)+'px');
        field.style.setProperty('--field-rx',(py*2).toFixed(2)+'deg');
        field.style.setProperty('--field-ry',(px*-2.5).toFixed(2)+'deg');
      }
    }
    updateScrollDepth();
    // Animation is paused completely when the hero is offscreen and no input is pending.
    if(visibleHero)ensureFrame();
  }
  function ensureFrame(){
    if(!running&&!hidden&&!reduce.matches){running=true;requestAnimationFrame(frame)}
  }
  document.addEventListener('visibilitychange',()=>{
    hidden=document.hidden;
    if(!hidden){last=performance.now();ensureFrame()}
  });
  window.addEventListener('scroll',ensureFrame,{passive:true});
  window.addEventListener('resize',ensureFrame,{passive:true});

  // Glass cards gain real 3D response. Hover light tracks the cursor.
  if(fine.matches && !reduce.matches){
    cards.forEach(card=>{
      let sx=0,sy=0;
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        sx=Math.max(-1,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)*2-1));
        sy=Math.max(-1,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)*2-1));
        card.style.setProperty('--tilt-x',(sy*-3).toFixed(2)+'deg');
        card.style.setProperty('--tilt-y',(sx*3).toFixed(2)+'deg');
        card.style.setProperty('--sheen-x',(sx*15).toFixed(1)+'px');
        card.style.setProperty('--border-angle',((Math.atan2(sy,sx)*180/Math.PI)+135).toFixed(1)+'deg');
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');
        card.style.setProperty('--sheen-x','0px');
      },{passive:true});
    });
    document.querySelectorAll('.v2-main-action').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        el.style.setProperty('--mag-x',(((e.clientX-r.left)/r.width-.5)*8).toFixed(2)+'px');
        el.style.setProperty('--mag-y',(((e.clientY-r.top)/r.height-.5)*5).toFixed(2)+'px');
      },{passive:true});
      el.addEventListener('pointerleave',()=>{
        el.style.setProperty('--mag-x','0px');el.style.setProperty('--mag-y','0px');
      },{passive:true});
    });
  }

  // Intentional micro-interaction from the existing portfolio: scramble *on hover*.
  // No auto-scramble that leaves the headline unreadable while loading.
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function scramble(el){
    if(el.dataset.scrambling)return;
    const original=el.textContent;
    const started=performance.now();
    el.dataset.scrambling='1';
    const animate=now=>{
      const t=Math.min(1,(now-started)/410);
      const fixed=Math.floor(original.length*t);
      el.textContent=[...original].map((c,i)=>(i<fixed||/\s|[.&-]/.test(c))?c:chars[(i*13+Math.floor(now/41))%chars.length]).join('');
      if(t<1)requestAnimationFrame(animate);
      else{el.textContent=original;delete el.dataset.scrambling}
    };
    requestAnimationFrame(animate);
  }
  if(fine.matches && !reduce.matches){
    document.querySelectorAll('.hero-title-line').forEach(el=>{
      el.addEventListener('pointerenter',()=>scramble(el));
    });
    const logo=document.querySelector('.brand');
    if(logo){logo.addEventListener('pointerenter',()=>{const el=logo.firstChild;if(el && el.nodeType===Node.TEXT_NODE){
      // Keep the nav brand's text node intact; scramble the About signature instead.
      const name=document.querySelector('.signature-name');
      if(name)name.querySelectorAll('.sig-letter').forEach((span,i)=>{
        span.style.transitionDelay=i*18+'ms';
      });
    }})}
  }
  if(!reduce.matches)root.classList.add('motion-ready');
  ensureFrame();
})();
'use strict';
// ══════════════════════════════════════════════════════════
//  THE CIRCUIT BREAKERS — Main JS
// ══════════════════════════════════════════════════════════

/* ─── MOUSE TRACKING ─── */
let MX = window.innerWidth/2, MY = window.innerHeight/2;
document.addEventListener('mousemove', e => { MX = e.clientX; MY = e.clientY; });

/* ─── CURSOR ─── */
const curDot  = document.getElementById('cur-dot');
const curRing = document.getElementById('cur-ring');
document.addEventListener('mousemove', e => {
  curDot.style.left  = e.clientX + 'px';
  curDot.style.top   = e.clientY + 'px';
  setTimeout(() => {
    curRing.style.left = e.clientX + 'px';
    curRing.style.top  = e.clientY + 'px';
  }, 70);
});
document.querySelectorAll('a,button,[data-tilt],.mem-card,.proj-card').forEach(el => {
  el.addEventListener('mouseenter', () => { curDot.style.transform = 'translate(-50%,-50%) scale(2)'; curRing.style.transform = 'translate(-50%,-50%) scale(0.6)'; });
  el.addEventListener('mouseleave', () => { curDot.style.transform = 'translate(-50%,-50%) scale(1)'; curRing.style.transform = 'translate(-50%,-50%) scale(1)'; });
});

/* ─── LOADER ─── */
(function() {
  const fill   = document.getElementById('ld-fill');
  const pct    = document.getElementById('ld-pct');
  const status = document.getElementById('ld-status');
  const loader = document.getElementById('loader');
  const msgs   = ['INITIALIZING SYSTEMS...','LOADING PCB RENDERER...','CALIBRATING OSCILLOSCOPE...','SYNCING LAB MODULES...','READY.'];
  let p = 0, mi = 0;
  const t = setInterval(() => {
    p += Math.random() * 14 + 2;
    if (p > 100) p = 100;
    fill.style.width = p + '%';
    pct.textContent  = Math.floor(p) + '%';
    if (p >= (mi+1)*25 && mi < msgs.length-1) status.textContent = msgs[++mi];
    if (p >= 100) {
      clearInterval(t);
      setTimeout(() => {
        loader.style.transition = 'opacity 0.5s';
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
      }, 400);
    }
  }, 80);
})();

/* ─── CANVAS SETUP ─── */
function setupCanvas(id) {
  const c = document.getElementById(id);
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  window.addEventListener('resize', () => { c.width = window.innerWidth; c.height = window.innerHeight; });
  return { c, ctx: c.getContext('2d') };
}

/* ─── PCB BACKGROUND ─── */
(function() {
  const { c, ctx } = setupCanvas('c-pcb');
  let traces=[], nodes=[], signals=[];

  function build() {
    traces=[]; nodes=[]; signals=[];
    const W=c.width, H=c.height;
    for(let i=0;i<40;i++){
      const x1=Math.random()*W, y1=Math.random()*H;
      const h=Math.random()>.5, len=80+Math.random()*240;
      traces.push({x1,y1,x2:h?x1+len:x1,y2:h?y1:y1+len,a:0.06+Math.random()*0.12});
    }
    for(let i=0;i<25;i++) nodes.push({x:Math.random()*W,y:Math.random()*H,r:2+Math.random()*4,p:Math.random()*Math.PI*2});
    for(let i=0;i<12;i++){
      const ti=Math.floor(Math.random()*traces.length);
      signals.push({tr:traces[ti],t:Math.random(),spd:0.002+Math.random()*0.004});
    }
  }
  build();
  window.addEventListener('resize',build);

  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    traces.forEach(tr => {
      ctx.beginPath(); ctx.moveTo(tr.x1,tr.y1); ctx.lineTo(tr.x2,tr.y2);
      ctx.strokeStyle=`rgba(79,195,247,${tr.a})`; ctx.lineWidth=1; ctx.stroke();
    });
    nodes.forEach(n => {
      n.p+=0.016;
      const g=0.22+0.18*Math.sin(n.p);
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(52,211,153,${g})`; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r+4+3*Math.sin(n.p),0,Math.PI*2);
      ctx.strokeStyle=`rgba(52,211,153,${g*0.25})`; ctx.lineWidth=1; ctx.stroke();
    });
    signals.forEach(s => {
      s.t+=s.spd; if(s.t>1){s.t=0;const i=Math.floor(Math.random()*traces.length);s.tr=traces[i];}
      const x=s.tr.x1+(s.tr.x2-s.tr.x1)*s.t, y=s.tr.y1+(s.tr.y2-s.tr.y1)*s.t;
      ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2);
      ctx.fillStyle='#4fc3f7'; ctx.shadowBlur=14; ctx.shadowColor='#4fc3f7'; ctx.fill(); ctx.shadowBlur=0;
    });
  }
  window._drawPCB = draw;
})();

/* ─── OSCILLOSCOPE ─── */
(function() {
  const { c, ctx } = setupCanvas('c-scope');
  let ph=0;
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    // Wave 1
    ctx.beginPath();
    for(let x=0;x<c.width;x++){
      const y=c.height/2+Math.sin(x*0.018+ph)*70+Math.sin(x*0.045+ph*1.4)*22;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle='#34d399'; ctx.lineWidth=1.5; ctx.stroke();
    // Wave 2
    ctx.beginPath();
    for(let x=0;x<c.width;x++){
      const y=c.height*0.28+Math.sin(x*0.012+ph*0.75)*32;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1; ctx.stroke();
    ph+=0.022;
  }
  window._drawScope = draw;
})();

/* ─── SPARKS ─── */
(function() {
  const { c, ctx } = setupCanvas('c-spark');
  const sparks=[];
  document.addEventListener('mousemove',()=>{
    if(Math.random()>.32)return;
    sparks.push({x:MX,y:MY,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7-1.5,life:1});
  });
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    for(let i=sparks.length-1;i>=0;i--){
      const s=sparks[i];
      s.x+=s.vx; s.y+=s.vy; s.vy+=0.18; s.life-=0.055;
      if(s.life<=0){sparks.splice(i,1);continue;}
      ctx.beginPath(); ctx.arc(s.x,s.y,s.life*2.2,0,Math.PI*2);
      ctx.fillStyle=`rgba(79,195,247,${s.life*0.75})`;
      ctx.shadowBlur=10; ctx.shadowColor='#4fc3f7'; ctx.fill(); ctx.shadowBlur=0;
    }
  }
  window._drawSpark = draw;
})();

/* ─── MAIN ANIMATION LOOP ─── */
function loop() {
  window._drawPCB && window._drawPCB();
  window._drawScope && window._drawScope();
  window._drawSpark && window._drawSpark();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ─── BINARY RAIN ─── */
(function() {
  const el = document.getElementById('bin-rain');
  const style = document.createElement('style');
  style.textContent = '@keyframes bf{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}';
  document.head.appendChild(style);
  function build() {
    el.innerHTML='';
    const cols=Math.floor(window.innerWidth/14);
    for(let i=0;i<cols;i++){
      const c=document.createElement('div');
      c.style.cssText=`position:absolute;top:0;left:${i*14}px;width:14px;height:100%;overflow:hidden;`;
      const inn=document.createElement('div');
      const dur=(3+Math.random()*6).toFixed(1);
      const del=(-Math.random()*12).toFixed(1);
      inn.style.cssText=`animation:bf ${dur}s linear ${del}s infinite;font-size:12px;line-height:20px;color:var(--green)`;
      let t='';
      for(let j=0;j<60;j++) t+=(Math.random()>.5?'1':'0')+'<br>';
      inn.innerHTML=t; c.appendChild(inn); el.appendChild(c);
    }
  }
  build(); window.addEventListener('resize', build);
})();

/* ─── SCROLL REVEAL ─── */
const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:0.1});
document.querySelectorAll('.r,.rl,.rr,.rz,.ev-item').forEach(el=>revObs.observe(el));

/* ─── COUNTERS ─── */
const cntObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target, target=+el.dataset.target, sfx=el.dataset.suffix||'';
    let cur=0; const step=target/70;
    const t=setInterval(()=>{
      cur+=step; if(cur>=target){cur=target;clearInterval(t);}
      el.textContent=Math.floor(cur)+sfx;
    },16);
    cntObs.unobserve(el);
  });
},{threshold:0.5});
document.querySelectorAll('.cnt-num[data-target]').forEach(el=>cntObs.observe(el));

/* ─── 3D TILT ─── */
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const rx=((e.clientY-r.top-r.height/2)/(r.height/2))*-14;
    const ry=((e.clientX-r.left-r.width/2)/(r.width/2))*14;
    card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(12px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* ─── RIPPLE ─── */
function addRipple(btn, e, col='rgba(79,195,247,0.3)') {
  const r=btn.getBoundingClientRect();
  const el=document.createElement('span');
  el.className='ripple';
  el.style.cssText=`width:${r.width}px;height:${r.width}px;left:${e.clientX-r.left-r.width/2}px;top:${e.clientY-r.top-r.width/2}px;background:${col}`;
  btn.appendChild(el); setTimeout(()=>el.remove(),600);
}
document.querySelectorAll('.btn,.form-sub').forEach(b=>{
  b.addEventListener('click',e=>addRipple(b,e));
});

/* ─── THEME TOGGLE ─── */
document.getElementById('theme-sw').addEventListener('click',function(){
  document.body.classList.toggle('light');
  this.classList.toggle('on');
});

/* ─── HELPERS ─── */
window.smoothTo = (id,btn,e)=>{ addRipple(btn,e); setTimeout(()=>document.getElementById(id).scrollIntoView({behavior:'smooth'}),150); };
window.submitForm = (btn,e)=>{
  addRipple(btn,e);
  btn.textContent='✅ APPLICATION TRANSMITTED!';
  btn.style.background='linear-gradient(105deg,var(--green),#1a4a30)';
  setTimeout(()=>{ btn.textContent='TRANSMIT APPLICATION ⚡'; btn.style.background=''; },3200);
};

/* ─── ANTI-GRAVITY LAB MODE ─── */
let labActive=false, floaters=[], labRaf=null;
const labBtn   = document.getElementById('lab-btn');
const resetBtn = document.getElementById('reset-btn');
const notif    = document.getElementById('grav-notif');

function playLabSound() {
  try {
    const a=new(window.AudioContext||window.webkitAudioContext)();
    const o=a.createOscillator(), g=a.createGain();
    o.connect(g); g.connect(a.destination);
    o.frequency.setValueAtTime(180,a.currentTime);
    o.frequency.exponentialRampToValueAtTime(900,a.currentTime+0.25);
    g.gain.setValueAtTime(0.28,a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.6);
    o.start(); o.stop(a.currentTime+0.6);
  } catch(_){}
}

function activateLab() {
  labActive=true; labBtn.classList.add('active');
  labBtn.textContent='⚡ LAB MODE ON';
  resetBtn.style.display='block';
  notif.classList.add('show'); setTimeout(()=>notif.classList.remove('show'),2200);
  playLabSound();

  const els=document.querySelectorAll('.proj-card,.mem-card,.cnt-card,.ev-body,.nav-logo');
  floaters=[];
  els.forEach(el=>{
    const rect=el.getBoundingClientRect();
    const cl=el.cloneNode(true);
    cl.style.cssText=`position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;margin:0;z-index:300;cursor:grab;pointer-events:all;transition:box-shadow 0.2s;`;
    document.body.appendChild(cl); el.style.opacity='0';
    const f={cl,orig:el,x:rect.left,y:rect.top,w:rect.width,h:rect.height,
              vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5-2,
              vr:(Math.random()-.5)*2.5,rot:0,drag:false,ox:0,oy:0};
    cl.addEventListener('mousedown',e=>{
      f.drag=true; f.ox=e.clientX-f.x; f.oy=e.clientY-f.y;
      f.vx=0; f.vy=0; cl.style.cursor='grabbing'; cl.classList.add('dragging');
      e.stopPropagation();
    });
    floaters.push(f);
  });
  document.addEventListener('mousemove',onDrag);
  document.addEventListener('mouseup',onDrop);
  labRaf=requestAnimationFrame(tickGrav);
}

function onDrag(e) { floaters.forEach(f=>{ if(f.drag){f.x=e.clientX-f.ox;f.y=e.clientY-f.oy;} }); }
function onDrop()  { floaters.forEach(f=>{ if(f.drag){f.vx=(Math.random()-.5)*7;f.vy=-3.5;f.drag=false;f.cl.style.cursor='grab';f.cl.classList.remove('dragging');} }); }

function tickGrav() {
  if(!labActive)return;
  const W=window.innerWidth, H=window.innerHeight;
  floaters.forEach(f=>{
    if(f.drag){f.cl.style.left=f.x+'px';f.cl.style.top=f.y+'px';f.cl.style.transform='none';return;}
    f.vy+=0.06; f.x+=f.vx; f.y+=f.vy; f.rot+=f.vr;
    if(f.x<0){f.x=0;f.vx=Math.abs(f.vx)*0.8;f.vr*=-0.8;}
    if(f.x+f.w>W){f.x=W-f.w;f.vx=-Math.abs(f.vx)*0.8;f.vr*=-0.8;}
    if(f.y<0){f.y=0;f.vy=Math.abs(f.vy)*0.8;}
    if(f.y+f.h>H){f.y=H-f.h;f.vy=-Math.abs(f.vy)*0.9;f.vx*=0.98;f.vr*=0.9;}
    floaters.forEach(f2=>{
      if(f2===f)return;
      const ox=(f.x+f.w/2)-(f2.x+f2.w/2), oy=(f.y+f.h/2)-(f2.y+f2.h/2);
      const d=Math.hypot(ox,oy), mn=(f.w+f2.w)/3;
      if(d>0&&d<mn){const nx=ox/d,ny=oy/d,rv=(f.vx-f2.vx)*nx+(f.vy-f2.vy)*ny;
        if(rv<0){f.vx-=rv*nx*0.5;f.vy-=rv*ny*0.5;f2.vx+=rv*nx*0.5;f2.vy+=rv*ny*0.5;}}
    });
    f.cl.style.left=f.x+'px'; f.cl.style.top=f.y+'px';
    f.cl.style.transform=`rotate(${f.rot}deg)`;
  });
  labRaf=requestAnimationFrame(tickGrav);
}

function resetLab() {
  labActive=false; cancelAnimationFrame(labRaf);
  labBtn.classList.remove('active'); labBtn.textContent='⚡ ACTIVATE LAB MODE';
  resetBtn.style.display='none';
  document.removeEventListener('mousemove',onDrag);
  document.removeEventListener('mouseup',onDrop);
  floaters.forEach(f=>{f.cl.remove();f.orig.style.opacity='';});
  floaters=[];
}

labBtn.addEventListener('click',e=>{labActive?resetLab():activateLab();addRipple(labBtn,e,'rgba(167,139,250,0.3)');});
resetBtn.addEventListener('click',e=>{resetLab();addRipple(resetBtn,e,'rgba(52,211,153,0.3)');});

/* ─── CLICK FLOAT EFFECT ─── */
document.addEventListener('click',e=>{
  if(e.target.closest('#lab-panel')||e.target.tagName==='BUTTON')return;
  document.querySelectorAll('h1,h2,.cnt-card,.proj-card,.mem-card').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)<450){
      el.style.transition='transform 0.3s ease';
      el.style.transform='translateY(-10px) scale(1.02)';
      setTimeout(()=>{el.style.transform='';},320);
    }
  });
});

/* ─── ACTIVE NAV HIGHLIGHT ─── */
const secIds=['about','projects','events','members','join'];
const navAs=document.querySelectorAll('.nav-links a');
secIds.forEach(id=>{
  const el=document.getElementById(id);
  if(!el)return;
  new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
      navAs.forEach(a=>a.style.color='');
      const a=document.querySelector(`.nav-links a[href="#${id}"]`);
      if(a)a.style.color='var(--blue)';
    }
  },{threshold:0.35}).observe(el);
});

/* ─── EASTER EGG — OHM123 ─── */
let eggBuffer='';
document.addEventListener('keydown',e=>{
  eggBuffer=(eggBuffer+e.key).slice(-6).toUpperCase();
  if(eggBuffer==='OHM123') triggerEgg(true);
  if(eggBuffer==='NORMAL') triggerEgg(false);
});
const easterFlash = document.getElementById('easter-flash');
const crtMsg      = document.getElementById('crt-msg');
function triggerEgg(on) {
  eggBuffer='';
  if(on) {
    easterFlash.classList.add('flash');
    setTimeout(()=>easterFlash.classList.remove('flash'),700);
    crtMsg.innerHTML='&gt; CRT_MODE_ENABLED<br>&gt; BOOTING RETRO TERMINAL...<br>&gt; WELCOME, HACKER.';
    crtMsg.classList.add('show');
    setTimeout(()=>{crtMsg.classList.remove('show');document.body.classList.add('crt');},1200);
  } else {
    document.body.classList.remove('crt');
    crtMsg.innerHTML='&gt; NORMAL MODE RESTORED';
    crtMsg.classList.add('show');
    setTimeout(()=>crtMsg.classList.remove('show'),1500);
  }
}

/* ─── PARALLAX ─── */
window.addEventListener('scroll',()=>{
  const sy=window.scrollY;
  const hero=document.getElementById('hero');
  if(hero) hero.style.backgroundPositionY = (sy*0.4)+'px';
  document.querySelectorAll('.pulse-ring').forEach((r,i)=>{
    r.style.transform=`translate(-50%,-50%) translateY(${sy*(0.1*(i+1))}px) scale(1)`;
  });
});

/* ─── FORM INPUT FOCUS EFFECTS ─── */
document.querySelectorAll('.form-in,.form-sel,.form-ta').forEach(inp=>{
  inp.addEventListener('focus',()=>inp.style.borderColor='var(--blue)');
  inp.addEventListener('blur',()=>inp.style.borderColor='');
});

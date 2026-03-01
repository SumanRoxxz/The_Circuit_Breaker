'use strict';
/* ── GLOBALS ── */
let MX = window.innerWidth / 2, MY = window.innerHeight / 2;
document.addEventListener('mousemove', e => { MX = e.clientX; MY = e.clientY; });

/* ── CURSOR ── */
const cur = document.getElementById('cur'), curR = document.getElementById('cur-ring');
// Hide custom cursor on touch devices
if (window.matchMedia('(hover:none)').matches) { cur.style.display = 'none'; curR.style.display = 'none'; }
let cx = MX, cy = MY;
(function tick() {
    cx += (MX - cx) * .16; cy += (MY - cy) * .16;
    cur.style.left = MX + 'px'; cur.style.top = MY + 'px';
    curR.style.left = cx + 'px'; curR.style.top = cy + 'px';
    requestAnimationFrame(tick);
})();
document.querySelectorAll('a,button,[data-tilt],.mc,.pc,.pview,.soc-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.style.transform = 'translate(-50%,-50%) scale(2)'; curR.style.transform = 'translate(-50%,-50%) scale(.55)'; curR.style.borderColor = 'rgba(0,229,255,.9)'; });
    el.addEventListener('mouseleave', () => { cur.style.transform = 'translate(-50%,-50%) scale(1)'; curR.style.transform = 'translate(-50%,-50%) scale(1)'; curR.style.borderColor = ''; });
});

/* ── CANVAS INIT ── */
function mkC(id) {
    const c = document.getElementById(id);
    const r = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    r(); window.addEventListener('resize', r);
    return { c, ctx: c.getContext('2d') };
}

/* ── PCB BACKGROUND ── */
(function () {
    const { c, ctx } = mkC('cvBg');
    let T = [], N = [], S = [];
    function build() {
        T = []; N = []; S = [];
        const W = c.width, H = c.height;
        const isMobile = window.innerWidth < 680;
        for (let i = 0; i < (isMobile ? 28 : 55); i++) {
            const x1 = Math.random() * W, y1 = Math.random() * H, h = Math.random() > .5, l = 80 + Math.random() * 260;
            T.push({ x1, y1, x2: h ? x1 + l : x1, y2: h ? y1 : y1 + l, a: .042 + Math.random() * .09 });
        }
        for (let i = 0; i < (isMobile ? 16 : 32); i++) N.push({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3.5, p: Math.random() * Math.PI * 2, col: Math.random() > .7 ? [168, 85, 247] : [0, 229, 255] });
        for (let i = 0; i < (isMobile ? 8 : 16); i++) { const t = T[Math.floor(Math.random() * T.length)]; S.push({ t, prog: Math.random(), spd: .002 + Math.random() * .004 }); }
    }
    build(); window.addEventListener('resize', build);
    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        T.forEach(t => { ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.strokeStyle = `rgba(0,229,255,${t.a})`; ctx.lineWidth = 1; ctx.stroke(); });
        N.forEach(n => {
            n.p += .013; const g = .18 + .16 * Math.sin(n.p);
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${n.col.join(',')},${g})`; ctx.fill();
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5 + 4 * Math.sin(n.p), 0, Math.PI * 2); ctx.strokeStyle = `rgba(${n.col.join(',')},${g * .2})`; ctx.lineWidth = 1; ctx.stroke();
        });
        S.forEach(s => {
            s.prog += s.spd; if (s.prog > 1) { s.prog = 0; s.t = T[Math.floor(Math.random() * T.length)]; }
            const x = s.t.x1 + (s.t.x2 - s.t.x1) * s.prog, y = s.t.y1 + (s.t.y2 - s.t.y1) * s.prog;
            ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fillStyle = '#00e5ff'; ctx.shadowBlur = 18; ctx.shadowColor = '#00e5ff'; ctx.fill(); ctx.shadowBlur = 0;
        });
    }
    window._drawPCB = draw;
})();

/* ── PARTICLES ── */
(function () {
    const { c, ctx } = mkC('cvPar');
    const COLS = ['#00e5ff', '#a855f7', '#06b6d4', '#22d3ee'];
    let P = [];
    function build() {
        P = []; const W = c.width, H = c.height; const isMob = W < 680;
        for (let i = 0; i < (isMob ? 45 : 100); i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .48, vy: (Math.random() - .5) * .48, r: .8 + Math.random() * 2, a: .18 + Math.random() * .45, col: COLS[Math.floor(Math.random() * COLS.length)] });
    }
    build(); window.addEventListener('resize', build);
    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        P.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
            if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
            const dx = p.x - MX, dy = p.y - MY, d = Math.hypot(dx, dy);
            if (d < 95 && d > 0) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
        });
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
            const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
            if (d < 82) { ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 82) * .09})`; ctx.lineWidth = .5; ctx.stroke(); }
        }
    }
    window._drawPar = draw;
})();

/* ── OSCILLOSCOPE ── */
(function () {
    const { c, ctx } = mkC('cvScope');
    let ph = 0;
    const spd = () => window._labActive ? 0.065 : 0.022;
    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
        for (let x = 0; x < c.width; x++) { const y = c.height / 2 + Math.sin(x * .016 + ph) * 82 + Math.sin(x * .042 + ph * 1.6) * 26; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath();
        for (let x = 0; x < c.width; x++) { const y = c.height * .24 + Math.sin(x * .01 + ph * .68) * 36; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1; ctx.stroke();
        ph += spd();
    }
    window._drawScope = draw;
})();

/* ── SPARKS ── */
(function () {
    const { c, ctx } = mkC('cvSpark');
    const sparks = [];
    document.addEventListener('mousemove', () => {
        if (Math.random() > .28) return;
        sparks.push({ x: MX, y: MY, vx: (Math.random() - .5) * 9, vy: (Math.random() - .5) * 9 - 1.5, life: 1, col: Math.random() > .5 ? '0,229,255' : '168,85,247' });
    });
    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += .22; s.life -= .052;
            if (s.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.beginPath(); ctx.arc(s.x, s.y, s.life * 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.col},${s.life * .8})`; ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${s.col},1)`; ctx.fill(); ctx.shadowBlur = 0;
        }
    }
    window._drawSpark = draw;
})();

/* ── MINI SCOPE (funcgen card) ── */
(function () {
    const c = document.getElementById('scopeMini');
    if (!c) return;
    c.width = c.parentElement.offsetWidth || 300; c.height = 38;
    const ctx = c.getContext('2d'); let ph = 0;
    (function draw() { ctx.clearRect(0, 0, c.width, c.height); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = 0; x < c.width; x++) { const y = c.height / 2 + Math.sin(x * .085 + ph) * 14; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); ph += .065; requestAnimationFrame(draw); })();
})();

/* ── MASTER LOOP ── */
(function loop() { window._drawPCB && window._drawPCB(); window._drawPar && window._drawPar(); window._drawScope && window._drawScope(); window._drawSpark && window._drawSpark(); requestAnimationFrame(loop); })();

/* ── HERO MAGNETIC DISTORTION ── */
document.getElementById('hero').addEventListener('mousemove', e => {
    const px = (e.clientX / window.innerWidth * 100).toFixed(1), py = (e.clientY / window.innerHeight * 100).toFixed(1);
    document.getElementById('magLayer').style.background = `radial-gradient(ellipse 52% 52% at ${px}% ${py}%,rgba(0,229,255,.065) 0%,transparent 65%)`;
});

/* ── BINARY RAIN ── */
(function () {
    const el = document.getElementById('binRain');
    const st = document.createElement('style'); st.textContent = '@keyframes bRain{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}'; document.head.appendChild(st);
    function build() {
        el.innerHTML = ''; const cols = Math.floor(window.innerWidth / 14);
        for (let i = 0; i < cols; i++) {
            const c = document.createElement('div'); c.style.cssText = `position:absolute;top:0;left:${i * 14}px;width:14px;height:100%;overflow:hidden;`;
            const inn = document.createElement('div'); inn.style.cssText = `animation:bRain ${(3 + Math.random() * 7).toFixed(1)}s linear ${(-Math.random() * 12).toFixed(1)}s infinite;font-size:11px;line-height:18px;`;
            let t = ''; for (let j = 0; j < 72; j++)t += (Math.random() > .5 ? '1' : '0') + '<br>';
            inn.innerHTML = t; c.appendChild(inn); el.appendChild(c);
        }
    }
    build(); window.addEventListener('resize', build);
})();

/* ── BOOT SEQUENCE ── */
(function () {
    const boot = document.getElementById('boot');
    const fill = document.getElementById('bootFill');
    const pct = document.getElementById('bootPct');
    let p = 0;
    const t = setInterval(() => {
        p += Math.random() * 13 + 4; if (p > 100) p = 100;
        fill.style.width = p + '%'; pct.textContent = Math.floor(p) + '%';
        if (p >= 100) { clearInterval(t); setTimeout(() => { boot.style.transition = 'opacity .65s ease'; boot.style.opacity = '0'; setTimeout(() => boot.style.display = 'none', 680); }, 450); }
    }, 65);
})();

/* ── SCROLL REVEAL ── */
const rvObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }); }, { threshold: .1 });
document.querySelectorAll('.rv,.rvl,.rvr,.rvz,.ev').forEach(el => rvObs.observe(el));

/* ── COUNTERS (7-segment style) ── */
const cntObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, t = +el.dataset.target, sfx = el.dataset.suffix || '';
        let cur = 0; const step = t / 75;
        const ti = setInterval(() => { cur += step; if (cur >= t) { cur = t; clearInterval(ti); } el.textContent = Math.floor(cur) + sfx; }, 14);
        cntObs.unobserve(el);
    });
}, { threshold: .5 });
document.querySelectorAll('.sc-num[data-target]').forEach(el => cntObs.observe(el));

/* ── VOLTAGE METER ── */
(function () {
    const bars = document.querySelectorAll('.vsb');
    const val = document.querySelector('.vVal');
    setInterval(() => {
        const v = (47.8 + Math.random() * .5).toFixed(1);
        if (val) val.textContent = v + 'V';
        bars.forEach((b, i) => b.classList.toggle('lit', i < ((+v - 47) * 10 + 3.5)));
    }, 900);
})();

/* ── 3D TILT ── */
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -16;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 16;
        card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(16px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ── RIPPLE ── */
function ripple(btn, e, col = 'rgba(0,229,255,.28)') {
    const r = btn.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'rip'; s.style.cssText = `width:${r.width}px;height:${r.width}px;left:${e.clientX - r.left - r.width / 2}px;top:${e.clientY - r.top - r.width / 2}px;background:${col}`;
    btn.appendChild(s); setTimeout(() => s.remove(), 500);
}
document.querySelectorAll('.btn,.fsub').forEach(b => b.addEventListener('click', e => ripple(b, e)));

/* ── CLICK FLOAT ── */
document.addEventListener('click', e => {
    if (e.target.closest('#labPanel') || e.target.tagName === 'BUTTON') return;
    document.querySelectorAll('h1,h2,.sc,.pc,.mc').forEach(el => {
        const r = el.getBoundingClientRect();
        if (Math.hypot(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2) < 500) {
            el.style.transition = 'transform .35s ease'; el.style.transform = 'translateY(-10px) scale(1.025)';
            setTimeout(() => el.style.transform = '', 360);
        }
    });
});

/* ── NAV ── */
window.goTo = (href, btn, e) => { ripple(btn, e); setTimeout(() => document.querySelector(href).scrollIntoView({ behavior: 'smooth' }), 120); };

/* ── FORM ── */
window.formSubmit = (btn, e) => {
    ripple(btn, e, 'rgba(34,211,238,.3)');
    btn.textContent = '✅ SIGNAL TRANSMITTED SUCCESSFULLY';
    btn.style.background = 'linear-gradient(110deg,rgba(34,211,238,.2),rgba(0,229,255,.1))';
    btn.style.borderColor = 'var(--green)'; btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = 'TRANSMIT APPLICATION ⚡'; btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }, 3500);
};

/* ── MODAL DATA ── */
const MDATA = {
    esp32: { title: 'ESP32 WIFI SURVEILLANCE CAR', body: `<p>A fully autonomous WiFi-controlled surveillance vehicle built with the ESP32-CAM.</p><br><p><strong>Technical Stack:</strong> ESP32-CAM paired with a custom FreeRTOS scheduler managing motor control PWM, dual ultrasonic sensor arrays, and WebSocket streams simultaneously on dual cores.</p><br><p><strong>Features:</strong> 720p live streaming at 30fps, sub-50ms control latency, automatic obstacle avoidance with servo-steered sweep, React mobile dashboard with gamepad API support.</p><br><p><strong>PCB:</strong> Custom 4-layer KiCad board with isolated motor driver, 3.3V LDO, and integrated battery management IC.</p>` },
    drone: { title: 'AUTONOMOUS DRONE WITH GPS', body: `<p>Research-grade autonomous UAV built entirely by the NEXUS team.</p><br><p><strong>Flight Controller:</strong> Custom PID cascaded-loop controller on STM32H7 at 1kHz. Attitude estimation via complementary filter on 6-DOF IMU.</p><br><p><strong>Vision:</strong> Raspberry Pi 4 running YOLOv8n at 18fps for real-time obstacle classification.</p><br><p><strong>Navigation:</strong> ublox M9N multi-band GNSS with centimeter-level RTK correction via LoRa 868MHz base-station uplink. Mission planning via MAVLink.</p><br><p>Winner — National Drone Innovation Challenge 2024.</p>` },
    funcgen: { title: 'CUSTOM DDS FUNCTION GENERATOR', body: `<p>Professional-grade dual-channel signal generator, designed and fabricated in-house.</p><br><p><strong>Core:</strong> AD9833 Direct Digital Synthesis IC. Frequency range 0.1 Hz to 20 MHz with 28-bit resolution. Sine, square, triangle, ramp, and arbitrary waveforms from 8k-point SRAM buffer.</p><br><p><strong>Interface:</strong> 1.3" OLED with multi-level menu system. 24-detent rotary encoder, USB-C for serial scripting and firmware update.</p><br><p><strong>PCB:</strong> Custom 6-layer KiCad board with separated analog/digital GND planes, 50Ω-controlled signal traces, filtered precision voltage reference, and optional SMA output connectors.</p><br><p>Featured in Electronics For You, March 2025.</p>` },
    robotics: { title: 'EMG ROBOTICS & EMBEDDED LAB', body: `<p>Surface EMG-driven 6-DOF robotic arm with on-device machine learning.</p><br><p><strong>Signal Chain:</strong> Differential surface electrodes → INA128 instrumentation amplifier (CMRR 94dB) → 24-bit sigma-delta ADC → custom DSP pipeline in fixed-point arithmetic.</p><br><p><strong>ML Model:</strong> TinyML gesture classifier (TensorFlow Lite for Microcontrollers) on ARM Cortex-M33 with CMSIS-DSP SIMD acceleration. 12 gesture classes, 94.3% accuracy, 12ms end-to-end latency.</p><br><p><strong>Mechanics:</strong> 6 high-torque servo joints, custom PLA/carbon-fiber composite structure designed in Fusion 360. 650g payload at full extension.</p>` }
};
window.mOpen = function (k) {
    const d = MDATA[k]; if (!d) return;
    document.getElementById('mTitle').textContent = d.title;
    document.getElementById('mBody').innerHTML = d.body;
    document.getElementById('mOverlay').classList.add('open');
};
window.mClose = function (e) { if (e.target === document.getElementById('mOverlay')) document.getElementById('mOverlay').classList.remove('open'); };

/* ── ACTIVE NAV ── */
['about', 'projects', 'events', 'members', 'join'].forEach(id => {
    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            document.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
            const a = document.querySelector(`.nav-links a[href="#${id}"]`); if (a) a.style.color = 'var(--cyan)';
        }
    }, { threshold: .35 }).observe(document.getElementById(id));
});

/* ── PARALLAX ── */
let lastSY = 0;
window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (Math.abs(sy - lastSY) < 2) return; lastSY = sy;
    document.querySelectorAll('.heroRings .ring').forEach((r, i) => { r.style.transform = `translate(-50%,-50%) translateY(${sy * (0.07 * (i + 1))}px)`; });
    document.querySelector('.chip3d').style.transform = `translate(-50%,-50%) rotate(${sy * .022}deg)`;
});

/* ── ZERO-GRAVITY LAB MODE ── */
let labOn = false, floaters = [], labRaf = null, gravTimer = null;
window._labActive = false;
const labBtn = document.getElementById('labBtn');
const resetBtn = document.getElementById('resetBtn');
const gravNotif = document.getElementById('gravNotif');

function beep(f1 = 180, f2 = 900, dur = .7) {
    try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.setValueAtTime(f1, a.currentTime); o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + .3); g.gain.setValueAtTime(.22, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + dur); o.start(); o.stop(a.currentTime + dur); } catch (_) { }
}
function ambientBeep() {
    try { const a = new (window.AudioContext || window.webkitAudioContext)(); const osc = a.createOscillator(); const g = a.createGain(); osc.connect(g); g.connect(a.destination); osc.type = 'sine'; osc.frequency.setValueAtTime(60, a.currentTime); osc.frequency.setValueAtTime(80, a.currentTime + .5); g.gain.setValueAtTime(.08, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + 1.5); osc.start(); osc.stop(a.currentTime + 1.5); } catch (_) { }
}

function labStart() {
    labOn = true; window._labActive = true;
    labBtn.classList.add('active'); labBtn.textContent = '⚡ ZERO-GRAVITY ACTIVE';
    resetBtn.style.display = 'block';
    gravNotif.classList.add('show'); setTimeout(() => gravNotif.classList.remove('show'), 2600);
    beep(180, 900, .75);

    const els = document.querySelectorAll('.pc,.mc,.sc,.evBody,.nav-logo');
    floaters = [];
    els.forEach(el => {
        const r = el.getBoundingClientRect();
        const cl = el.cloneNode(true);
        cl.style.cssText = `position:fixed;top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:400;cursor:grab;pointer-events:all;box-sizing:border-box;overflow:hidden;will-change:transform;`;
        document.body.appendChild(cl); el.style.opacity = '0';
        const f = { cl, orig: el, x: r.left, y: r.top, w: r.width, h: r.height, vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 6 - 3, vr: (Math.random() - .5) * 3, rot: 0, drag: false, ox: 0, oy: 0 };
        cl.addEventListener('mousedown', e => { f.drag = true; f.ox = e.clientX - f.x; f.oy = e.clientY - f.y; f.vx = 0; f.vy = 0; cl.style.cursor = 'grabbing'; cl.style.zIndex = '450'; e.stopPropagation(); }, { passive: true });
        cl.addEventListener('touchstart', e => { const t = e.touches[0]; f.drag = true; f.ox = t.clientX - f.x; f.oy = t.clientY - f.y; f.vx = 0; f.vy = 0; cl.style.zIndex = '450'; e.preventDefault(); }, { passive: false });
        floaters.push(f);
    });
    document.addEventListener('mousemove', onDrag, { passive: true });
    document.addEventListener('touchmove', onTouchDrag, { passive: true });
    document.addEventListener('mouseup', onDrop);
    document.addEventListener('touchend', onTouchDrop);
    labRaf = requestAnimationFrame(physTick);

    gravTimer = setTimeout(() => {
        if (!labOn) return;
        gravNotif.textContent = '⏱ RESTORING GRAVITY IN 5s...'; gravNotif.classList.add('show');
        setTimeout(() => { gravNotif.classList.remove('show'); labStop(); }, 5000);
    }, 15000);
}

function labStop() {
    labOn = false; window._labActive = false;
    cancelAnimationFrame(labRaf); clearTimeout(gravTimer);
    labBtn.classList.remove('active'); labBtn.textContent = '⚡ ACTIVATE ZERO-GRAVITY LAB';
    resetBtn.style.display = 'none';
    gravNotif.textContent = '⚡ ZERO-GRAVITY SIMULATION — PHYSICS ENGINE ACTIVE';
    document.removeEventListener('mousemove', onDrag); document.removeEventListener('mouseup', onDrop);
    document.removeEventListener('touchmove', onTouchDrag); document.removeEventListener('touchend', onTouchDrop);
    floaters.forEach(f => { f.cl.remove(); f.orig.style.opacity = ''; }); floaters = [];
    beep(900, 180, .5);
}

function onDrag(e) { floaters.forEach(f => { if (f.drag) { f.x = e.clientX - f.ox; f.y = e.clientY - f.oy; } }); }
function onDrop() { floaters.forEach(f => { if (f.drag) { f.vx = (Math.random() - .5) * 9; f.vy = -5; f.drag = false; f.cl.style.cursor = 'grab'; f.cl.style.zIndex = '400'; } }); }
function onTouchDrag(e) { const t = e.touches[0]; floaters.forEach(f => { if (f.drag) { f.x = t.clientX - f.ox; f.y = t.clientY - f.oy; } }); }
function onTouchDrop() { floaters.forEach(f => { if (f.drag) { f.vx = (Math.random() - .5) * 7; f.vy = -4; f.drag = false; f.cl.style.zIndex = '400'; } }); }

function physTick() {
    if (!labOn) return;
    const W = window.innerWidth, H = window.innerHeight;
    floaters.forEach(f => {
        if (f.drag) { f.cl.style.left = f.x + 'px'; f.cl.style.top = f.y + 'px'; f.cl.style.transform = 'none'; return; }
        f.vy += .055; f.x += f.vx; f.y += f.vy; f.rot += f.vr;
        if (f.x < 0) { f.x = 0; f.vx = Math.abs(f.vx) * .8; f.vr *= -.8; }
        if (f.x + f.w > W) { f.x = W - f.w; f.vx = -Math.abs(f.vx) * .8; f.vr *= -.8; }
        if (f.y < 0) { f.y = 0; f.vy = Math.abs(f.vy) * .8; }
        if (f.y + f.h > H) { f.y = H - f.h; f.vy = -Math.abs(f.vy) * .88; f.vx *= .97; f.vr *= .9; }
        // Collisions
        floaters.forEach(f2 => {
            if (f2 === f) return;
            const ox = (f.x + f.w / 2) - (f2.x + f2.w / 2), oy = (f.y + f.h / 2) - (f2.y + f2.h / 2);
            const d = Math.hypot(ox, oy), mn = (f.w + f2.w) / 3.4;
            if (d > 0 && d < mn) {
                const nx = ox / d, ny = oy / d, rv = (f.vx - f2.vx) * nx + (f.vy - f2.vy) * ny;
                if (rv < 0) { const j = rv * .52; f.vx -= j * nx; f.vy -= j * ny; f2.vx += j * nx; f2.vy += j * ny; }
            }
        });
        f.cl.style.left = f.x + 'px'; f.cl.style.top = f.y + 'px';
        f.cl.style.transform = `rotate(${f.rot}deg)`;
        f.cl.style.boxShadow = '0 0 28px rgba(0,229,255,.14)';
    });
    labRaf = requestAnimationFrame(physTick);
}

labBtn.addEventListener('click', e => { ripple(labBtn, e, 'rgba(168,85,247,.3)'); labOn ? labStop() : labStart(); });
resetBtn.addEventListener('click', e => { ripple(resetBtn, e, 'rgba(34,211,238,.3)'); labStop(); });

/* ── EASTER EGG — OHM123 ── */
let egg = '';
document.addEventListener('keydown', e => {
    egg = (egg + e.key).slice(-6).toUpperCase();
    if (egg === 'OHM123') trigEgg(true);
    if (egg === 'NORMAL') trigEgg(false);
});
const crtFlash = document.getElementById('crtFlash');
const crtTerm = document.getElementById('crtTerm');

function trigEgg(on) {
    egg = '';
    if (on) {
        crtFlash.classList.add('pop'); setTimeout(() => crtFlash.classList.remove('pop'), 900);
        beep(80, 180, 1.8);
        const lines = ['> ACCESSING ARCHIVED ENGINEERING DATABASE...', '> DECRYPTION KEY: OHM-123-ALPHA ✓', '> CLASSIFIED RECORDS: 2,847 FILES UNLOCKED', '> LOADING RETRO LAB INTERFACE...', '> BOOTING CRT TERMINAL MODE', '', '  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗', '  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝', '  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗', '  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║', '  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║', '', '> CRT_MODE ENABLED. TYPE "NORMAL" TO EXIT.'];
        crtTerm.innerHTML = ''; crtTerm.classList.add('show');
        lines.forEach((l, i) => { setTimeout(() => { const d = document.createElement('div'); d.textContent = l || '\u00a0'; crtTerm.appendChild(d); }, i * 110); });
        setTimeout(() => { document.body.classList.add('crt'); setTimeout(() => crtTerm.classList.remove('show'), 3000); }, lines.length * 110 + 350);
    } else {
        document.body.classList.remove('crt');
        crtTerm.innerHTML = '> NORMAL MODE RESTORED. WELCOME BACK, ENGINEER.';
        crtTerm.classList.add('show');
        setTimeout(() => crtTerm.classList.remove('show'), 2200);
        beep(400, 800, .4);
    }
}

/* ── AMBIENT AUDIO (Web Audio API synthesizer) ── */
let ambCtx = null, ambNodes = [], ambOn = false;
window.toggleAudio = function () {
    const btn = document.getElementById('audioBtn');
    if (!ambCtx) ambCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (ambOn) {
        ambNodes.forEach(n => { try { n.stop(); } catch (_) { } }); ambNodes = []; ambOn = false; btn.textContent = '🔇'; return;
    }
    // Synthesize lab hum
    [60, 120, 180].forEach((freq, i) => {
        const osc = ambCtx.createOscillator(), gain = ambCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.value = .012 / (i + 1);
        osc.connect(gain); gain.connect(ambCtx.destination); osc.start(); ambNodes.push(osc);
    });
    ambOn = true; btn.textContent = '🔊';
};

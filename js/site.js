// ─────────────────────────────────────────────────────────────
//  Page behaviour: boot sequence, football bots, custom cursor, project cards,
//  sections from data.js, scroll reveals, and the My Academy games.
// ─────────────────────────────────────────────────────────────
import { PROJECTS, EXPERIENCE, STACK, CERTS, BEYOND, RULES } from './data.js';
import { Academy } from './academy/academy.js';

const $ = (s, r = document) => r.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k);
  return e;
};
const ext = { target: '_blank', rel: 'noopener' };
const host = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// ───────── boot sequence: once per visit, skippable ─────────
(function boot() {
  const el = $('#boot');
  let seen = false;
  try { seen = sessionStorage.getItem('zain-boot') === '1'; } catch {}
  if (seen || reduced) { el.classList.add('is-gone'); return; }
  document.body.classList.add('is-locked');
  const n = $('#boot-n'), steps = [...el.querySelectorAll('[data-step]')];
  const total = 1700, t0 = performance.now();
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    try { sessionStorage.setItem('zain-boot', '1'); } catch {}
    n.textContent = '100';
    steps.forEach((s) => { s.classList.add('is-ok'); s.querySelector('b').textContent = 'OK'; });
    setTimeout(() => { el.classList.add('is-done'); document.body.classList.remove('is-locked'); }, 220);
    setTimeout(() => el.classList.add('is-gone'), 1200);
  };
  const tick = (t) => {
    if (done) return;
    const k = Math.min(1, (t - t0) / total);
    const eased = 1 - Math.pow(1 - k, 2.2);
    n.textContent = String(Math.round(eased * 100));
    steps.forEach((s, i) => { if (eased > (i + 1) / 5 && !s.classList.contains('is-ok')) { s.classList.add('is-ok'); s.querySelector('b').textContent = 'OK'; } });
    if (k < 1) requestAnimationFrame(tick); else finish();
  };
  requestAnimationFrame(tick);
  el.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
})();

// ───────── hero: two bots passing a football ─────────
// Not interactive. A side-on mini pitch: one bot winds up and kicks, the ball
// rolls (or is lobbed) across, the other traps it and plays it back.
(function pitch() {
  const cv = $('#pitch'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 520, H = 270, GY = 236, R = 11, OFF = 20;   // logical canvas, ground line, ball radius; OFF trims the empty space above the bots
  const INK = '#1b1919', FOREST = '#23473a', MINT = '#6fdc9f';
  const bots = [
    { x: 118, face: 1, color: INK, num: '01', blinkAt: 1.3, blink: 0, flash: 0 },
    { x: 402, face: -1, color: FOREST, num: '02', blinkAt: 2.6, blink: 0, flash: 0 },
  ];
  const footX = (b) => b.x + b.face * 40;
  const counter = $('#passes');
  let dpr = 1, scale = 1, passes = 0, kicker = 0, phase = 'hold', pt = 0, lob = false, last = 0, time = 0;
  const ball = { x: footX(bots[0]), y: GY - R, spin: 0, x0: 0, x1: 0 };
  const dust = [];
  const HOLD = 0.62, FLY = 1.25, FLY_LOB = 1.5;

  const size = () => {
    const w = cv.parentElement.clientWidth; dpr = Math.min(2, devicePixelRatio || 1);
    scale = w / W; cv.width = Math.round(w * dpr); cv.height = Math.round(H * scale * dpr);
    cv.style.width = w + 'px'; cv.style.height = Math.round(H * scale) + 'px';
  };
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const ease = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // leg angle (radians, + = forward) for a bot at this moment
  const legOf = (i) => {
    const flyDur = lob ? FLY_LOB : FLY;
    if (phase === 'hold') {
      if (i !== kicker) return 0;
      const t = pt / HOLD;
      if (t < .78) return -0.65 * ease(t / .78) + 0.22 * (1 - t / .78) * (pt < .15 ? 1 : 0);
      return -0.65 + 1.45 * ease((t - .78) / .22);           // snap through the ball
    }
    if (i === kicker) return pt < .32 ? 0.8 * (1 - ease(pt / .32)) : 0;
    const left = flyDur - pt;                                   // receiver lifts a foot to trap
    return left < .28 ? 0.22 * ease(1 - left / .28) : 0;
  };

  const kick = () => {
    passes += 1; if (counter) counter.textContent = String(passes).padStart(3, '0');
    const k = bots[kicker]; k.flash = 0.45;
    lob = passes % 3 === 0;
    ball.x0 = footX(k); ball.x1 = footX(bots[1 - kicker]);
    for (let n = 0; n < 7; n++) dust.push({ x: ball.x0, y: GY - 2, vx: (Math.random() - .5) * 60 - k.face * 25, vy: -Math.random() * 40 - 10, life: 0.5, r: 2 + Math.random() * 3 });
    phase = 'fly'; pt = 0;
  };

  const step = (dt) => {
    time += dt; pt += dt;
    bots.forEach((b) => {
      b.flash = Math.max(0, b.flash - dt);
      if (time > b.blinkAt) { b.blink = 0.14; b.blinkAt = time + 2.2 + Math.random() * 2.6; }
      b.blink = Math.max(0, b.blink - dt);
    });
    if (phase === 'hold') {
      ball.x = footX(bots[kicker]); ball.y = GY - R;
      if (pt >= HOLD) kick();
    } else {
      const dur = lob ? FLY_LOB : FLY, t = clamp(pt / dur, 0, 1);
      const px = ball.x;
      if (lob) {
        ball.x = ball.x0 + (ball.x1 - ball.x0) * (t < .82 ? t / .82 * .93 : .93 + .07 * ease((t - .82) / .18));
        const a = t < .82 ? t / .82 : 0, b2 = t >= .82 ? (t - .82) / .18 : 0;
        ball.y = GY - R - (t < .82 ? 4 * 92 * a * (1 - a) : 4 * 12 * b2 * (1 - b2));
      } else {
        ball.x = ball.x0 + (ball.x1 - ball.x0) * (1 - Math.pow(1 - t, 1.8));
        ball.y = GY - R - Math.abs(Math.sin(t * Math.PI * 2)) * 10 * Math.pow(1 - t, 2);
      }
      ball.spin += (ball.x - px) / R;
      if (pt >= dur) { kicker = 1 - kicker; phase = 'hold'; pt = 0; }
    }
    for (let n = dust.length - 1; n >= 0; n--) { const d = dust[n]; d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 90 * dt; if (d.life <= 0) dust.splice(n, 1); }
  };

  // ── the crowd: a three-tier stand of thoroughly bored people ──
  // AI plays, humans watch and wait. Not interactive; every pose moves a little.
  const SKIN = ['#f2cba8', '#e2ae80', '#c98d5e', '#ab734b', '#8b5b3c', '#6a432f'];
  const HAIR = ['#1d1916', '#3a2a20', '#5b4131', '#2a2a2a', '#8c8278', '#a0662f'];
  const SHIRT = ['#5b6b7a', '#8a7f72', '#3e5641', '#a0553f', '#c9a24a', '#4a5a8a', '#6f6c69', '#b8b0a4', '#7a4a5a', '#2f4858', '#d2c7b8'];
  const SEAT = ['#cfc7bd', '#c4bcb1'];
  const POSES = ['chin', 'phone', 'sleep', 'yawn', 'slouch', 'stare', 'chin', 'phone', 'sleep'];
  const seed = (() => { let x = 31337; return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); })();
  const pick = (a) => a[Math.floor(seed() * a.length)];
  const TIERS = [0, 1, 2].map((k) => {
    const y = GY - 46 - k * 23, s = 1.22 - k * .1, x0 = 58 - 26 - k * 16, x1 = W - 58 + 26 + k * 16, gap = 25 * s;
    const n = Math.floor((x1 - x0) / gap), off = (x1 - x0 - (n - 1) * gap) / 2;
    const people = Array.from({ length: n }, (_, i) => seed() < .24 ? null : ({
      x: x0 + off + i * gap + (seed() - .5) * 2, skin: pick(SKIN), hair: pick(HAIR), shirt: pick(SHIRT),
      pose: pick(POSES), ph: seed() * 10, bald: seed() < .12, long: seed() < .28, cap: seed() < .1,
    }));
    return { y, s, x0, x1, people, seats: n, gap, off };
  });

  const drawPerson = (p, y, s) => {
    const t = time + p.ph;
    ctx.save(); ctx.translate(p.x, y); ctx.scale(s, s);
    let hx = 0, hy = -24, tilt = 0, eyes = 'half', torsoY = -17;
    if (p.pose === 'chin') { tilt = .18 + Math.sin(t * .6) * .04; hx = 1; hy = -23; }
    if (p.pose === 'phone') { hy = -21; hx = -1; tilt = -.12; eyes = 'down'; }
    if (p.pose === 'sleep') { tilt = .5 + Math.sin(t * .9) * .06; hx = 3; hy = -21 + Math.sin(t * .9) * .6; eyes = 'shut'; }
    if (p.pose === 'slouch') { torsoY = -15; hy = -21; tilt = Math.sin(t * .4) * .05; }
    if (p.pose === 'stare') { tilt = Math.sin(t * .3) * .03; eyes = 'blank'; }
    const yawning = p.pose === 'yawn' && (t % 7) < 1.6;
    if (p.pose === 'yawn') { tilt = yawning ? -.22 : .06; eyes = yawning ? 'shut' : 'half'; }
    // torso + arms
    ctx.fillStyle = p.shirt; ctx.beginPath(); ctx.roundRect(-6.5, torsoY, 13, 16, [5, 5, 2, 2]); ctx.fill();
    ctx.strokeStyle = p.shirt; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    if (p.pose === 'chin') { ctx.beginPath(); ctx.moveTo(5, torsoY + 10); ctx.lineTo(3.5, hy + 6); ctx.stroke(); }
    if (p.pose === 'phone') { ctx.beginPath(); ctx.moveTo(-5, torsoY + 6); ctx.lineTo(-1, torsoY + 9); ctx.moveTo(5, torsoY + 6); ctx.lineTo(2, torsoY + 9); ctx.stroke(); }
    if (p.pose === 'slouch') { ctx.beginPath(); ctx.moveTo(-5.5, torsoY + 8); ctx.lineTo(5.5, torsoY + 9); ctx.stroke(); }
    if (yawning) { ctx.beginPath(); ctx.moveTo(-5, torsoY + 3); ctx.lineTo(-8, hy - 6); ctx.moveTo(5, torsoY + 3); ctx.lineTo(8, hy - 6); ctx.stroke(); }
    // head
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt);
    if (p.long && !p.cap) { ctx.fillStyle = p.hair; ctx.beginPath(); ctx.roundRect(-6, -5, 12, 12, 5); ctx.fill(); }
    ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(0, 0, 5.4, 0, Math.PI * 2); ctx.fill();
    if (p.cap) { ctx.fillStyle = p.shirt === '#c9a24a' ? '#23473a' : '#c9a24a'; ctx.beginPath(); ctx.arc(0, -1, 5.6, Math.PI, 0); ctx.fill(); ctx.fillRect(-1, -1.6, 8, 1.8); }
    else if (!p.bald) { ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(0, -.6, 5.6, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); }
    ctx.strokeStyle = '#2a2220'; ctx.fillStyle = '#2a2220'; ctx.lineWidth = .9;
    if (eyes === 'half') { ctx.beginPath(); ctx.moveTo(-3, .4); ctx.lineTo(-1.2, .4); ctx.moveTo(1.2, .4); ctx.lineTo(3, .4); ctx.stroke(); }
    if (eyes === 'shut') { ctx.beginPath(); ctx.arc(-2.1, .2, 1, 0, Math.PI); ctx.moveTo(3.1, .2); ctx.arc(2.1, .2, 1, 0, Math.PI); ctx.stroke(); }
    if (eyes === 'down') { ctx.beginPath(); ctx.arc(-2, 1.4, .7, 0, Math.PI * 2); ctx.arc(2, 1.4, .7, 0, Math.PI * 2); ctx.fill(); }
    if (eyes === 'blank') { ctx.beginPath(); ctx.arc(-2, 0, .7, 0, Math.PI * 2); ctx.arc(2, 0, .7, 0, Math.PI * 2); ctx.fill(); }
    if (yawning) { ctx.beginPath(); ctx.ellipse(0, 2.8, 1.5, 1.9 + Math.sin((t % 7) / 1.6 * Math.PI) * .6, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-1.4, 3); ctx.lineTo(1.4, 3); ctx.stroke(); }    // flat, unimpressed mouth
    ctx.restore();
    if (p.pose === 'chin') { ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(3, hy + 5.4, 2.1, 0, Math.PI * 2); ctx.fill(); }
    if (p.pose === 'phone') {                                         // a phone, glowing, obviously more interesting
      ctx.shadowColor = 'rgba(160,200,255,.9)'; ctx.shadowBlur = 6; ctx.fillStyle = '#dfeaff';
      ctx.beginPath(); ctx.roundRect(-2.4, torsoY + 6.6, 5, 3.4, .8); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(-2.4, torsoY + 9.6, 1.3, 0, Math.PI * 2); ctx.arc(2.8, torsoY + 9.6, 1.3, 0, Math.PI * 2); ctx.fill();
    }
    if (p.pose === 'sleep') {                                         // drifting z's, drawn as zig-zags
      ctx.strokeStyle = 'rgba(42,34,32,.55)'; ctx.lineWidth = .9; ctx.lineJoin = 'miter';
      for (let k = 0; k < 2; k++) {
        const q = ((t * .45 + k * .5) % 1), zx = hx + 6 + q * 6, zy = hy - 6 - q * 14, zs = 1.6 + q * 1.4;
        ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.moveTo(zx - zs, zy - zs); ctx.lineTo(zx + zs, zy - zs); ctx.lineTo(zx - zs, zy + zs); ctx.lineTo(zx + zs, zy + zs); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  const drawStands = () => {
    for (let k = TIERS.length - 1; k >= 0; k--) {
      const T = TIERS[k];
      // tier step: tread + riser
      ctx.fillStyle = '#efe9e2'; ctx.beginPath(); ctx.roundRect(T.x0 - 6, T.y - 20 * T.s, T.x1 - T.x0 + 12, 20 * T.s, 3); ctx.fill();
      ctx.fillStyle = '#ddd5cb'; ctx.fillRect(T.x0 - 6, T.y - 2, T.x1 - T.x0 + 12, 6 * T.s + 2);
      // seat backs, filled or empty
      for (let i = 0; i < T.seats; i++) {
        const x = T.x0 + T.off + i * T.gap;
        ctx.fillStyle = SEAT[i % 2]; ctx.beginPath(); ctx.roundRect(x - 7.5 * T.s, T.y - 19 * T.s, 15 * T.s, 15 * T.s, 3 * T.s); ctx.fill();
      }
      T.people.forEach((p) => p && drawPerson(p, T.y - 1, T.s));
    }
    // pitch-side wall with plain panels
    const y = GY - 46 + 4, x0 = 58 - 30, x1 = W - 58 + 30, n = 9, w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#23473a' : '#e8e2da'; ctx.fillRect(x0 + i * w, y, w + .5, 7); }
    ctx.fillStyle = 'rgba(21,19,19,.08)'; ctx.fillRect(x0, y + 7, x1 - x0, 1.5);
  };

  // a 3D-looking pitch floating on the page: perspective stripes, a slab edge,
  // a soft shadow, and goal frames with nets at both ends (no card, no sky)
  const BY = GY - 40, FY = GY + 34, BL = 60, BR = W - 60, FL = 12, FR = W - 12, SLAB = 9;
  const at = (u, d) => [BL + (BR - BL) * u + ((FL + (FR - FL) * u) - (BL + (BR - BL) * u)) * d, BY + (FY - BY) * d];
  const poly = (pts) => { ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  const drawGoal = (u, out) => {
    const p1 = at(u, .3), p2 = at(u, .7), h1 = 44, h2 = 50, depth = 18 * out;
    const b1 = [p1[0] + depth, p1[1] + 3], b2 = [p2[0] + depth * 1.15, p2[1] + 3];
    // net: back frame + mesh, drawn behind the front posts
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    poly([[p1[0], p1[1] - h1], [p2[0], p2[1] - h2], [b2[0], b2[1] - h2 * .78], [b1[0], b1[1] - h1 * .78]]); ctx.fill();
    poly([[b1[0], b1[1]], [b2[0], b2[1]], [b2[0], b2[1] - h2 * .78], [b1[0], b1[1] - h1 * .78]]); ctx.fill();
    ctx.strokeStyle = 'rgba(27,25,25,.18)'; ctx.lineWidth = .8;
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      ctx.beginPath(); ctx.moveTo(b1[0] + (b2[0] - b1[0]) * t, b1[1] + (b2[1] - b1[1]) * t); ctx.lineTo(b1[0] + (b2[0] - b1[0]) * t, b1[1] + (b2[1] - b1[1]) * t - (h1 + (h2 - h1) * t) * .78); ctx.stroke();
    }
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      ctx.beginPath(); ctx.moveTo(b1[0], b1[1] - h1 * .78 * t); ctx.lineTo(b2[0], b2[1] - h2 * .78 * t); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(27,25,25,.3)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b1[0], b1[1] - h1 * .78); ctx.lineTo(b2[0], b2[1] - h2 * .78); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
    // front frame: two posts and the crossbar
    ctx.strokeStyle = '#2b2827'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p1[0], p1[1] - h1); ctx.lineTo(p2[0], p2[1] - h2); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p1[0] - .8, p1[1] - 2); ctx.lineTo(p1[0] - .8, p1[1] - h1 + 2); ctx.stroke();
  };
  const drawPitch = () => {
    // soft shadow the slab casts on the page
    const sh = ctx.createRadialGradient(W / 2, FY + SLAB + 4, 10, W / 2, FY + SLAB + 4, W * .5);
    sh.addColorStop(0, 'rgba(21,19,19,.16)'); sh.addColorStop(1, 'rgba(21,19,19,0)');
    ctx.fillStyle = sh; ctx.save(); ctx.translate(W / 2, FY + SLAB + 4); ctx.scale(1, .07); ctx.translate(-W / 2, -(FY + SLAB + 4));
    ctx.beginPath(); ctx.arc(W / 2, FY + SLAB + 4, W * .5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // slab edge (front + the two visible sides)
    ctx.fillStyle = '#8fb89a'; poly([[FL, FY], [FR, FY], [FR, FY + SLAB], [FL, FY + SLAB]]); ctx.fill();
    ctx.fillStyle = '#a7c9b0'; poly([[BL, BY], [FL, FY], [FL, FY + SLAB], [BL, BY + SLAB * .6]]); ctx.fill();
    poly([[BR, BY], [FR, FY], [FR, FY + SLAB], [BR, BY + SLAB * .6]]); ctx.fill();
    // grass with mowing stripes in perspective
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? '#cfe4d4' : '#dcecdf';
      poly([at(i / 12, 0), at((i + 1) / 12, 0), at((i + 1) / 12, 1), at(i / 12, 1)]); ctx.fill();
    }
    const fade = ctx.createLinearGradient(0, BY, 0, FY);           // a touch of depth: far side lighter
    fade.addColorStop(0, 'rgba(255,255,255,.28)'); fade.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = fade; poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)]); ctx.fill();
    // markings
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
    poly([at(.025, .07), at(.975, .07), at(.975, .93), at(.025, .93)]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...at(.5, .07)); ctx.lineTo(...at(.5, .93)); ctx.stroke();
    const c = at(.5, .5); ctx.beginPath(); ctx.ellipse(c[0], c[1], 46, 11, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(c[0], c[1], 2.6, 1, 0, 0, Math.PI * 2); ctx.fill();
    [[.025, 1], [.975, -1]].forEach(([u, dir]) => {                // penalty boxes
      const a1 = at(u, .3), a2 = at(u, .7), b1 = at(u + dir * .1, .3), b2 = at(u + dir * .1, .7);
      ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.lineTo(...b2); ctx.lineTo(...a2); ctx.stroke();
    });
    drawGoal(.025, -1); drawGoal(.975, 1);
  };

  const drawBot = (b, i) => {
    const leg = legOf(i), bob = Math.sin(time * 5 + i * 2) * 1.6, hipY = -38;
    const eye = clamp(((ball.x - b.x) * b.face) / 70, -1, 1) * 3;
    ctx.save(); ctx.translate(b.x, GY); ctx.scale(b.face, 1);
    // shadow
    ctx.fillStyle = 'rgba(21,19,19,.12)'; ctx.beginPath(); ctx.ellipse(4, 2, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
    const limb = (ang, px, len, w, footOut) => {
      ctx.save(); ctx.translate(px, hipY + bob * .3); ctx.rotate(-ang);
      ctx.fillStyle = b.color; rr(-w / 2, 0, w, len, w / 2); ctx.fill();
      if (footOut) { rr(-w / 2 - 2, len - 7, w + 15, 10, 5); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(-w / 2 - 2, len, w + 15, 3, 2); ctx.fill(); }
      ctx.restore();
    };
    limb(0, -11, 36, 12, true);                                   // standing leg
    // body
    const by = hipY - 50 + bob;
    ctx.fillStyle = b.color; rr(-28, by, 56, 54, 16); ctx.fill();
    // arms swing against the kicking leg
    [[-30, 1], [30, -1]].forEach(([ax, s]) => {
      ctx.save(); ctx.translate(ax * .93, by + 12); ctx.rotate(leg * .55 * s + Math.sin(time * 5 + i) * .05);
      ctx.fillStyle = b.color; rr(-5, 0, 10, 30, 5); ctx.fill(); ctx.restore();
    });
    limb(leg, 11, 36, 12, true);                                  // kicking leg, in front
    // neck + head
    const hy = by - 48;
    ctx.fillStyle = b.color; rr(-7, hy + 40, 14, 10, 3); ctx.fill();
    rr(-33, hy, 66, 44, 15); ctx.fill();
    ctx.fillStyle = '#0c0b0b'; rr(-25, hy + 8, 50, 26, 10); ctx.fill();
    const open = b.blink > 0 ? 0.15 : 1;
    ctx.fillStyle = MINT; ctx.shadowColor = MINT; ctx.shadowBlur = 8;
    [-10, 10].forEach((ex) => { const eh = 10 * open; rr(ex - 4 + eye, hy + 21 - eh / 2, 8, Math.max(1.5, eh), 3); ctx.fill(); });
    ctx.shadowBlur = 0;
    // antenna
    ctx.strokeStyle = b.color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(-4, hy - 14); ctx.stroke();
    ctx.fillStyle = b.flash > 0 ? MINT : '#cfd8d2'; if (b.flash > 0) { ctx.shadowColor = MINT; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(-4, hy - 17, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawBall = () => {
    const h = GY - R - ball.y;
    ctx.fillStyle = `rgba(21,19,19,${.16 - Math.min(.1, h / 900)})`;
    ctx.beginPath(); ctx.ellipse(ball.x, GY + 1, R * (1 - Math.min(.45, h / 220)), 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(ball.x, ball.y);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.clip();
    ctx.rotate(ball.spin); ctx.fillStyle = INK;
    const pent = (cx, cy, r, rot) => { ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = rot + k * Math.PI * 2 / 5; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); };
    pent(0, 0, R * .36, -Math.PI / 2);
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5 + Math.PI / 5; pent(Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.02, R * .34, a); }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-R * .35, -R * .4, R * .22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  // ── me, at the bottom-left corner: watching, then noting every pass on a clipboard ──
  const ME = { x: 66, y: GY + 31, s: 1.05 };
  const drawMe = () => {
    const t = time;
    // looks up at the play for a while, then down at the sheet to write
    const cycle = t % 5.2, writing = cycle > 3.1;
    const look = writing ? 0 : clamp((ball.x - ME.x) / 300, 0, 1);
    const pen = writing ? Math.sin(t * 22) * 1.3 : 0;
    ctx.save(); ctx.translate(ME.x, ME.y); ctx.scale(ME.s, ME.s);
    ctx.fillStyle = 'rgba(21,19,19,.16)'; ctx.beginPath(); ctx.ellipse(2, 1, 17, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    // legs + shoes
    ctx.fillStyle = '#2b2f3a'; ctx.beginPath(); ctx.roundRect(-6.5, -26, 6, 26, 2.5); ctx.roundRect(1.5, -26, 6, 26, 2.5); ctx.fill();
    ctx.fillStyle = '#151313'; ctx.beginPath(); ctx.roundRect(-8, -3, 9, 4, 2); ctx.roundRect(1, -3, 10, 4, 2); ctx.fill();
    // torso (white tee with a dark stripe, like the photo)
    ctx.fillStyle = '#ece8e2'; ctx.beginPath(); ctx.roundRect(-9, -50, 19, 26, [7, 7, 3, 3]); ctx.fill();
    ctx.fillStyle = '#2b2827'; ctx.fillRect(-9, -40, 19, 2.2);
    // back arm holding the clipboard up in front of the chest
    ctx.strokeStyle = '#ece8e2'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, -46); ctx.lineTo(1, -36); ctx.stroke();
    // clipboard, tilted toward the viewer, with a tally of passes
    ctx.save(); ctx.translate(9, -40); ctx.rotate(-.18);
    ctx.fillStyle = '#9a6b3f'; ctx.beginPath(); ctx.roundRect(-1, -9, 15, 19, 2); ctx.fill();
    ctx.fillStyle = '#fbfaf7'; ctx.fillRect(1, -6, 11, 14);
    ctx.fillStyle = '#5c5552'; ctx.fillRect(4, -10.5, 5, 3);
    ctx.strokeStyle = '#23473a'; ctx.lineWidth = .9;
    const marks = passes % 10;
    for (let k = 0; k < marks; k++) {
      const row = k < 5 ? 0 : 1, col = k % 5;
      ctx.beginPath(); ctx.moveTo(2.6 + col * 2, -3.5 + row * 6); ctx.lineTo(2.6 + col * 2, .5 + row * 6); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(92,85,82,.35)'; ctx.lineWidth = .6;
    for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(2.2, 2 + k * 6 - 6 + 9); ctx.lineTo(11, 2 + k * 6 - 6 + 9); ctx.stroke(); }
    ctx.restore();
    // front arm + pen
    ctx.strokeStyle = '#ece8e2'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(7, -46); ctx.lineTo(13 + pen * .4, -38 + pen * .3); ctx.stroke();
    ctx.fillStyle = '#c98f63'; ctx.beginPath(); ctx.arc(14 + pen * .4, -37.5 + pen * .3, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#151313'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(14 + pen * .4, -37 + pen * .3); ctx.lineTo(17 + pen * .4, -42 + pen * .3); ctx.stroke();
    // head: tilts down to write, turns toward the ball to watch
    ctx.save(); ctx.translate(1.5, -56); ctx.rotate(writing ? .32 : -.06 - look * .08);
    ctx.fillStyle = '#c98f63'; ctx.beginPath(); ctx.roundRect(-2.6, 2, 5.2, 5, 1.5); ctx.fill();          // neck
    ctx.beginPath(); ctx.arc(0, -2, 7.4, 0, Math.PI * 2); ctx.fill();                                      // face
    ctx.fillStyle = '#1d1916'; ctx.beginPath(); ctx.arc(0, 1.5, 6.6, .15 * Math.PI, .85 * Math.PI); ctx.fill(); // beard
    ctx.fillStyle = '#151313'; ctx.beginPath(); ctx.arc(0, -3.8, 7.6, Math.PI, 0); ctx.fill();            // cap
    ctx.beginPath(); ctx.roundRect(0, -5, 11, 2.6, 1.3); ctx.fill();                                        // cap brim, facing the play
    ctx.fillStyle = '#1d1916'; ctx.beginPath(); ctx.arc(2.6 + look, -1 + (writing ? 1 : 0), .95, 0, Math.PI * 2); ctx.arc(5.6 + look, -1 + (writing ? 1 : 0), .95, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  const draw = () => {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, -OFF * dpr * scale);
    ctx.clearRect(0, 0, W, H + OFF);
    drawStands();
    drawPitch();
    dust.forEach((d) => { ctx.fillStyle = `rgba(120,140,125,${d.life * 1.2})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); });
    drawBot(bots[0], 0); drawBot(bots[1], 1);
    drawMe();
    drawBall();
  };

  let on = true;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(cv);
  const loop = (now) => {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!on || document.hidden) return;
    step(dt); draw();
  };
  size(); step(0); draw();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); draw(); }, 120); });
  if (!reduced) requestAnimationFrame(loop);
})();

// ───────── profile card: rows open on click/tap, one at a time ─────────
(function idcard() {
  // fit ZAIN-UL-ABIDEEN to the width of the card, on one line
  const fit = document.querySelector('.idcard__fit');
  const fitName = () => {
    if (!fit) return;
    const box = fit.parentElement.clientWidth;
    fit.style.fontSize = '100px';
    const w = fit.scrollWidth;
    fit.style.fontSize = Math.max(22, Math.min(64, Math.floor(100 * box / w * 0.99))) + 'px';
  };
  fitName();
  document.fonts?.ready.then(fitName);
  addEventListener('resize', fitName);
  const rows = [...document.querySelectorAll('.idrow')]; if (!rows.length) return;
  const set = (r, open) => { r.classList.toggle('is-open', open); r.setAttribute('aria-expanded', String(open)); };
  const toggle = (r) => { const open = !r.classList.contains('is-open'); rows.forEach((x) => set(x, false)); set(r, open); };
  rows.forEach((r) => {
    r.addEventListener('click', (e) => { if (!e.target.closest('a')) toggle(r); });   // "Open to" links still work
    r.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === r) { e.preventDefault(); toggle(r); } });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.idcard')) rows.forEach((x) => set(x, false)); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') rows.forEach((x) => set(x, false)); });
})();

// ───────── custom cursor: a crosshair that opens into a ring over anything clickable ─────────
(function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reduced) return;
  const dot = h('div', { class: 'cur', 'aria-hidden': 'true' }), ring = h('div', { class: 'cur-ring', 'aria-hidden': 'true' });
  document.body.append(ring, dot);
  document.documentElement.classList.add('has-cur', 'cur-out');
  let x = -100, y = -100, rx = -100, ry = -100;
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const hot = e.target.closest?.('a, button, [role="tab"], input, label, summary, .ac-card, video');
    document.documentElement.classList.toggle('cur-hot', !!hot);
    document.documentElement.classList.remove('cur-out');
  }, { passive: true });
  addEventListener('pointerdown', () => document.documentElement.classList.add('cur-down'));
  addEventListener('pointerup', () => document.documentElement.classList.remove('cur-down'));
  document.addEventListener('pointerleave', () => document.documentElement.classList.add('cur-out'));
  const follow = () => {
    rx += (x - rx) * .2; ry += (y - ry) * .2;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
})();

// ───────── projects ─────────
// Desktop: the section pins to the screen; scrolling plays the projects one
// by one (copy swaps on the left, screenshots slide up and stack on the right)
// and the page only moves on after the last one. Phones: plain cards.
(function projects() {
  const metricEl = (p) => p.metric ? [
    h('p', { class: 'metric' }, p.metric.from ? [h('s', {}, p.metric.from), h('i', { 'aria-hidden': 'true' }, '→')] : null, h('b', {}, p.metric.to)),
    h('p', { class: 'metric__label' }, p.metric.label),
  ] : null;
  const linksEl = (p) => {
    const l = [];
    if (p.live) l.push(h('a', { href: p.live, ...ext }, 'Live ', h('span', { 'aria-hidden': 'true' }, '↗')));
    if (p.repo) l.push(h('a', { href: p.repo, ...ext }, 'GitHub ', h('span', { 'aria-hidden': 'true' }, '↗')));
    if (p.note) l.push(h('a', { href: p.note, class: 'is-note' }, 'Write-up ', h('span', { 'aria-hidden': 'true' }, '→')));
    return h('div', { class: 'pcard__links' }, l);
  };
  const visualEl = (p) => p.shot
    ? h('a', { class: 'shot', href: p.live, ...ext, 'aria-label': `Open ${p.name}` },
        h('div', { class: 'shot__bar' }, h('i'), h('i'), h('i'), h('span', {}, host(p.live))),
        h('img', { src: p.shot, alt: `${p.name} home page`, loading: 'lazy', width: 800, height: 506 }))
    : h('ol', { class: 'pipe', 'aria-label': `${p.name} pipeline` }, p.pipeline.map((s, k) => h('li', {}, h('span', {}, `STEP ${k + 1}`), s)));
  const copyEl = (p, i) => [
    h('p', { class: 'pcard__top' }, h('span', {}, String(i + 1).padStart(2, '0') + ' · ' + p.kind), h('span', {}, p.live ? 'Live' : 'Open source')),
    h('h3', { class: 'pcard__name' }, p.name),
    h('p', { class: 'pcard__tag' }, p.tagline),
    metricEl(p),
    h('ul', { class: 'pcard__points' }, p.points.map((t) => h('li', {}, t))),
    h('div', { class: 'pcard__foot' }, h('ul', { class: 'tags' }, p.tech.map((t) => h('li', {}, t))), linksEl(p)),
  ];

  // plain cards (phones / short screens)
  const list = $('#projects');
  PROJECTS.forEach((p, i) => list.append(h('article', { class: 'pcard' },
    h('div', { class: 'pcard__copy' }, copyEl(p, i)),
    h('div', { class: `pcard__visual tint-${p.tint}` }, visualEl(p)))));

  // pinned player (laptop and phone), after refactr.net: the stage holds still, the copy
  // wipes from one project to the next, and each screenshot rises from below
  // the screen and covers the one before it (a thin edge of it stays visible).
  const N = PROJECTS.length;
  const pin = $('#pin'), copyBox = $('#pin-copy'), visBox = $('#pin-visuals');
  pin.style.setProperty('--n', N);
  const pinCopy = (p, i) => [
    h('p', { class: 'pin__kicker' }, String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0') + ' · ' + p.kind),
    h('h3', { class: 'pin__name' }, p.name),
    h('p', { class: 'pin__tag' }, p.tagline),
    p.metric ? h('p', { class: 'pin__metric' }, p.metric.from ? [h('s', {}, p.metric.from), ' → '] : null, h('b', {}, p.metric.to), h('span', {}, p.metric.label)) : null,
    h('div', { class: 'pin__links' }, linksEl(p)),
  ];
  const copies = PROJECTS.map((p, i) => {
    const c = h('article', { class: 'pin__item' + (i === 0 ? ' is-on' : ''), 'aria-hidden': String(i !== 0) },
      pinCopy(p, i).filter(Boolean).map((n, k) => h('div', { class: 'pin__line', style: `--d:${k * 55}ms` }, n)));
    copyBox.append(c); return c;
  });
  const cards = PROJECTS.map((p, i) => {
    const v = h('div', { class: `pin__card tint-${p.tint}`, style: `--k:${i}` }, visualEl(p)); visBox.append(v); return v;
  });

  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const clamp = (x) => Math.min(1, Math.max(0, x));
  const stacked = matchMedia('(max-width: 640px), (max-width: 1000px) and (orientation: portrait)');
  let active = 0;
  const update = () => {
    if (getComputedStyle(pin).display === 'none') return;
    const r = pin.getBoundingClientRect(), span = pin.offsetHeight - innerHeight;
    const t = clamp(-r.top / span) * (N - 1);       // 0 … N-1
    // desktop: rise from below the screen; phones: rise from the bottom of the clipped screenshot window
    const lift = stacked.matches ? visBox.offsetHeight + 24 : innerHeight - visBox.getBoundingClientRect().top + 20;
    cards.forEach((c, k) => {
      // card k rises during the middle of the step before it, then holds
      const enter = k === 0 ? 1 : ease(clamp((t - (k - 1) - 0.2) / 0.6));
      const covered = clamp(t - k - 0.2);
      c.style.transform = `translate3d(0, ${((1 - enter) * lift).toFixed(1)}px, 0)`;
      c.style.filter = covered > 0.01 ? `brightness(${(1 - covered * 0.12).toFixed(3)})` : '';
    });
    const now = Math.min(N - 1, Math.floor(t + 0.45));
    if (now !== active) {
      copies[active].classList.remove('is-on'); copies[active].classList.add(now > active ? 'is-out-up' : 'is-out-down');
      copies[active].setAttribute('aria-hidden', 'true');
      const prev = copies[active]; setTimeout(() => prev.classList.remove('is-out-up', 'is-out-down'), 600);
      copies[now].classList.remove('is-out-up', 'is-out-down');
      copies[now].classList.add('is-on'); copies[now].setAttribute('aria-hidden', 'false');
      active = now;
    }
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

// ───────── experience, stack, certifications ─────────
$('#timeline').append(...EXPERIENCE.map((x) => h('li', { class: 'tl reveal' },
  h('div', { class: 'tl__side' },
    x.logo ? h('img', { class: 'tl__logo', src: x.logo, alt: `${x.org} logo`, width: 56, height: 56, loading: 'lazy' }) : null,
    h('p', { class: 'tl__when' }, x.when)),
  h('div', {},
    h('h3', { class: 'tl__role' }, x.role),
    h('p', { class: 'tl__org' }, x.href ? h('a', { href: x.href, ...ext }, x.org) : x.org, ` · ${x.where}`),
    h('ul', {}, x.points.map((t) => h('li', {}, t))),
  ),
)));
$('#skills').append(...STACK.map(([g, list, used]) => h('div', { class: 'skill reveal' },
  h('h3', {}, g),
  h('div', {}, h('ul', { class: 'tags' }, list.map((t) => h('li', {}, t))),
    used ? h('p', { class: 'skill__used' }, h('span', {}, 'Used in'), used.join(' · ')) : null))));
$('#rules').append(...RULES.map((r, i) => h('li', { class: 'rule reveal', style: `--i:${i}` },
  h('p', { class: 'rule__n' }, String(i + 1).padStart(2, '0')),
  h('h3', { class: 'rule__t' }, r.title),
  h('p', { class: 'rule__b' }, r.body),
  h('p', { class: 'rule__proof' }, h('b', {}, r.proof), r.fact))));
$('#certs').append(...CERTS.map((c) => h('li', { class: 'reveal' }, h('a', { href: c.href, ...ext }, h('b', {}, c.title), h('span', {}, c.issuer), h('em', { 'aria-hidden': 'true' }, '↗')))));

// ───────── beyond the code: tabs + accordion ─────────
(function beyond() {
  const tabs = $('#tabs'), acc = $('#acc');
  const show = (id) => {
    const g = BEYOND.find((x) => x.id === id);
    tabs.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.id === id)));
    acc.replaceChildren(...g.items.map((it, k) => {
      const qId = `q-${id}-${k}`;
      const body = h('div', { class: `acc__body${it.wide ? ' acc__body--wide' : ''}${!it.photo ? ' acc__body--full' : ''}` },
        h('div', {},
          h('p', {}, it.a),
          it.quote ? h('blockquote', { class: 'quote' }, h('p', {}, `“${it.quote}”`), h('cite', {}, `— ${it.by}`)) : null,
          it.stadiums ? h('div', { class: 'stadia' }, it.stadiums.map((s) => h('figure', {}, h('img', { src: s.img, alt: s.name, loading: 'lazy' }), h('figcaption', {}, s.name)))) : null,
          it.compare ? h('img', { class: 'acc__compare', src: it.compare, alt: 'The purple Beyond Mini 4WD toy car next to its 3D replica in the arena portfolio', loading: 'lazy' }) : null,
          it.link ? h('a', { class: 'acc__link', href: it.link.href, ...ext }, it.link.label, h('span', { 'aria-hidden': 'true' }, '↗')) : null,
        ),
        it.photo ? h('img', { class: 'acc__photo', src: it.photo, alt: it.photoAlt, loading: 'lazy' }) : null,
      );
      const btn = h('button', { class: 'acc__q', type: 'button', 'aria-expanded': String(k === 0), 'aria-controls': qId },
        it.img ? h('img', { src: it.img, alt: '', loading: 'lazy', class: it.darkLogo ? 'is-dark' : null }) : null, it.q);
      btn.addEventListener('click', () => btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true')));
      return h('div', { class: 'acc__item' }, btn, h('div', { class: 'acc__a', id: qId }, h('div', {}, body)));
    }));
  };
  BEYOND.forEach((g, i) => {
    const t = h('button', { class: 'tab', type: 'button', role: 'tab', 'data-id': g.id, 'aria-selected': String(i === 0) }, g.tab, h('small', {}, g.sub));
    t.addEventListener('click', () => show(g.id));
    tabs.append(t);
  });
  show(BEYOND[0].id);
})();

// ───────── scroll reveals + active nav link ─────────
(function reveals() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  // scroll-spy: the last section whose top has passed 35% of the screen is "here".
  // Works for very tall sections (the pinned projects) and ones with no menu item
  // (credentials counts as Stack). At the very bottom, the last item wins.
  const links = [...document.querySelectorAll('.nav__links a[href^="#"], .mmenu a[href^="#"]')];
  const SECTIONS = [['top', 'top'], ['academy', 'academy'], ['work', 'work'], ['approach', 'approach'],
    ['experience', 'experience'], ['stack', 'stack'], ['credentials', 'stack'], ['beyond', 'beyond'], ['contact', 'contact']]
    .map(([id, nav]) => [document.getElementById(id), nav]).filter(([el]) => el);
  let here = '';
  const spy = () => {
    const probe = innerHeight * .35;
    let cur = 'top';
    for (const [el, nav] of SECTIONS) if (el.getBoundingClientRect().top <= probe) cur = nav;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = 'contact';
    if (cur === here) return;
    here = cur;
    links.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === `#${cur}`));
  };
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; spy(); }); }, { passive: true });
  addEventListener('resize', spy);
  spy();
})();

// ───────── demo video: play only while visible ─────────
(function video() {
  const v = $('#demo');
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !reduced) v.play().catch(() => {}); else v.pause(); }, { threshold: .35 }).observe(v);
})();

// ───────── My Academy overlay ─────────
const academy = new Academy();
academy.onClose = () => { document.body.classList.remove('is-locked'); $('#demo').play().catch(() => {}); };
$('#open-academy').addEventListener('click', () => {
  document.body.classList.add('is-locked');
  $('#demo').pause();
  academy.open();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && academy.isOpen) academy.back(); });

// ───────── mobile menu + year ─────────
const menuBtn = $('.nav__menu'), menu = $('#mobile-menu');
menuBtn.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); });
menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); } });
$('#year').textContent = new Date().getFullYear();

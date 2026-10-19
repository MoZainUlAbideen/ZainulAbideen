// ─────────────────────────────────────────────────────────────
//  Page behaviour: boot sequence, football bots, custom cursor, project cards,
//  sections from data.js, scroll reveals, and the My Academy games.
// ─────────────────────────────────────────────────────────────
import { PROJECTS, EXPERIENCE, STACK, CERTS, BEYOND } from './data.js';
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
  const W = 520, H = 290, GY = 236, R = 11;              // logical canvas, ground line, ball radius
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

  const drawPitch = () => {
    const sky = ctx.createLinearGradient(0, 0, 0, GY);
    sky.addColorStop(0, '#ffffff'); sky.addColorStop(1, '#f4f1ec');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // grass band with mowing stripes
    const top = GY - 16;
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#d5e7d9' : '#e0eee3'; ctx.fillRect(i * W / 10, top, W / 10 + 1, H - top); }
    ctx.fillStyle = 'rgba(35,71,58,.08)'; ctx.fillRect(0, top, W, 2);
    // halfway line + spot, faint
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, top + 3); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(W / 2, GY + 18, 46, 10, 0, 0, Math.PI * 2); ctx.stroke();
    // little goals behind each bot
    [[22, 1], [W - 22, -1]].forEach(([gx, d]) => {
      ctx.strokeStyle = 'rgba(27,25,25,.16)'; ctx.lineWidth = 1;
      for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(gx, GY - k * 15); ctx.lineTo(gx - d * 14, GY - k * 15 + 4); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(27,25,25,.35)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(gx, GY); ctx.lineTo(gx, GY - 76); ctx.lineTo(gx - d * 14, GY - 72); ctx.lineTo(gx - d * 14, GY + 2); ctx.stroke();
    });
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

  const draw = () => {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    drawPitch();
    dust.forEach((d) => { ctx.fillStyle = `rgba(120,140,125,${d.life * 1.2})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); });
    drawBot(bots[0], 0); drawBot(bots[1], 1);
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

  // pinned player (desktop), after refactr.net: the stage holds still, the copy
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
  let active = 0;
  const update = () => {
    if (getComputedStyle(pin).display === 'none') return;
    const r = pin.getBoundingClientRect(), span = pin.offsetHeight - innerHeight;
    const t = clamp(-r.top / span) * (N - 1);       // 0 … N-1
    const lift = visBox.offsetHeight + innerHeight * 0.1;   // start just below the screen
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
$('#skills').append(...STACK.map(([g, list]) => h('div', { class: 'skill reveal' }, h('h3', {}, g), h('ul', { class: 'tags' }, list.map((t) => h('li', {}, t))))));
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
  const links = [...document.querySelectorAll('.nav__links a[href^="#"]')];
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'academy', 'experience', 'stack', 'beyond'].forEach((id) => spy.observe(document.getElementById(id)));
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

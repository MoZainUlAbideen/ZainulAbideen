// ─────────────────────────────────────────────────────────────
//  Page behaviour: boot sequence, contribution snake, custom cursor, project cards,
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

// ───────── hero: contribution graph with a snake eating its way through ─────────
// Not interactive. The snake path-finds (BFS) to the nearest commit, eats it,
// and when the board is clear a fresh year of commits fades back in.
(function snake() {
  const cv = $('#snake'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const LEVELS = ['#ebe6e1', '#c3dfcc', '#86bf9b', '#3f8f63', '#23473a'];
  const ROWS = 7;
  let cols = 0, cell = 0, gap = 0, dpr = 1, grid = [], fade = [], body = [], path = [], last = 0, stepMs = 120, prog = 0, wait = 0;
  const rnd = (() => { let x = 20260619; return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); })();
  const fill = () => {
    grid = Array.from({ length: ROWS * cols }, () => { const r = rnd(); return r < .38 ? 0 : r < .62 ? 1 : r < .8 ? 2 : r < .93 ? 3 : 4; });
    fade = grid.map(() => 0);
  };
  const layout = () => {
    const w = cv.parentElement.clientWidth;
    gap = w < 420 ? 3 : 4;
    cell = w < 420 ? 13 : w < 560 ? 19 : 22;
    cols = Math.max(12, Math.floor((w + gap) / (cell + gap)));
    cell = (w - gap * (cols - 1)) / cols;                // stretch to the exact width
    const hgt = ROWS * cell + (ROWS - 1) * gap;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(hgt * dpr);
    cv.style.width = w + 'px'; cv.style.height = hgt + 'px';
    fill();
    const r = 3; body = Array.from({ length: 6 }, (_, k) => ({ c: 5 - k, r })); path = [];
  };
  const idx = (c, r) => r * cols + c;
  const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < ROWS && !body.slice(0, -1).some((b) => b.c === c && b.r === r);
  const plan = () => {
    const h = body[0], seen = new Map([[idx(h.c, h.r), null]]), q = [h];
    while (q.length) {
      const p = q.shift();
      if ((p !== h) && grid[idx(p.c, p.r)] > 0) { const out = []; let k = idx(p.c, p.r); while (k !== idx(h.c, h.r)) { out.unshift({ c: k % cols, r: (k / cols) | 0 }); k = seen.get(k); } return out; }
      for (const [dc, dr] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const n = { c: p.c + dc, r: p.r + dr }, k = idx(n.c, n.r);
        if (free(n.c, n.r) && !seen.has(k)) { seen.set(k, idx(p.c, p.r)); q.push(n); }
      }
    }
    return [];
  };
  const step = () => {
    if (wait > 0) { wait--; return; }
    if (!path.length) path = plan();
    if (!path.length) {                                  // board cleared: new commits fade in
      if (grid.every((v) => v === 0)) { fill(); fade = grid.map(() => 1); wait = 4; }
      return;
    }
    const n = path.shift();
    body.unshift(n); body.pop();
    const k = idx(n.c, n.r);
    if (grid[k] > 0) { grid[k] = 0; if (body.length < 11) body.push({ ...body[body.length - 1] }); }
  };
  const rr = (x, y, w, hh, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, hh, r); ctx.fill(); };
  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const rad = Math.max(2, cell * .2);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols; c++) {
      const k = idx(c, r), f = fade[k];
      ctx.fillStyle = LEVELS[0]; rr(c * (cell + gap), r * (cell + gap), cell, cell, rad);
      if (grid[k] > 0) { ctx.globalAlpha = 1 - f; ctx.fillStyle = LEVELS[grid[k]]; rr(c * (cell + gap), r * (cell + gap), cell, cell, rad); ctx.globalAlpha = 1; }
      if (f > 0) fade[k] = Math.max(0, f - .03 - (c / cols) * .01);
    }
    // the snake: one thick rounded line through the segment centres; the head
    // and tail glide between cells so the motion is continuous
    const C = (q) => ({ x: q.c * (cell + gap) + cell / 2, y: q.r * (cell + gap) + cell / 2 });
    const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    const n = body.length, pts = [lerp(C(body[1]), C(body[0]), prog)];
    for (let i = 1; i < n - 1; i++) pts.push(C(body[i]));
    pts.push(lerp(C(body[n - 1]), C(body[n - 2]), prog));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(21,19,19,.14)'; ctx.lineWidth = cell * .78;
    ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y + 2) : ctx.moveTo(q.x, q.y + 2))); ctx.stroke();
    ctx.strokeStyle = '#151313'; ctx.lineWidth = cell * .66;
    ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
    const hd = pts[0], nx = pts[1], ang = Math.atan2(hd.y - nx.y, hd.x - nx.x);
    ctx.fillStyle = '#151313'; ctx.beginPath(); ctx.arc(hd.x, hd.y, cell * .42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fffdfc';
    for (const side of [-1, 1]) {
      const ex = hd.x + Math.cos(ang) * cell * .14 + Math.cos(ang + side * Math.PI / 2) * cell * .17;
      const ey = hd.y + Math.sin(ang) * cell * .14 + Math.sin(ang + side * Math.PI / 2) * cell * .17;
      ctx.beginPath(); ctx.arc(ex, ey, Math.max(1.2, cell * .075), 0, Math.PI * 2); ctx.fill();
    }
  };
  let on = true;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(cv);
  const loop = (t) => {
    requestAnimationFrame(loop);
    if (!on) { last = t; return; }
    if (!last) last = t;
    prog += (t - last) / stepMs; last = t;
    while (prog >= 1) { prog -= 1; step(); }
    draw();
  };
  layout(); draw();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); draw(); }, 150); });
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

// ─────────────────────────────────────────────────────────────
//  Page behaviour: boot sequence, live portrait, project cards,
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

// ───────── live portrait ─────────
(function portrait() {
  const fig = $('#portrait'), card = $('.portrait__card'), img = $('.portrait__img');
  // Islamabad clock
  const time = $('#pk-time');
  const clock = () => { time.textContent = `Islamabad ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date())}`; };
  clock(); setInterval(clock, 20000);
  if (reduced) return;

  // tilt + glare + parallax follow the pointer
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    fig.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${(x - .5) * 10}deg`);
      card.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
      card.style.setProperty('--glare', '1');
      img.style.setProperty('--px', `${(x - .5) * -10}px`);
      img.style.setProperty('--py', `${(y - .5) * -6}px`);
    });
    fig.addEventListener('pointerleave', () => {
      ['--rx', '--ry', '--glare'].forEach((p) => card.style.removeProperty(p));
      img.style.removeProperty('--px'); img.style.removeProperty('--py');
    });
  }

  // film grain that keeps the dithered photo "breathing"; paused off-screen
  const cv = $('.portrait__grain'), ctx = cv.getContext('2d');
  const W = 180, H = 225; cv.width = W; cv.height = H;
  const frame = ctx.createImageData(W, H);
  let on = true, last = 0;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(card);
  const grain = (t) => {
    requestAnimationFrame(grain);
    if (!on || t - last < 80) return; last = t;
    const d = frame.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    ctx.putImageData(frame, 0, 0);
  };
  requestAnimationFrame(grain);
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

  // pinned player (desktop)
  const N = PROJECTS.length;
  const pin = $('#pin'), copyBox = $('#pin-copy'), visBox = $('#pin-visuals'), nav = $('#pin-nav');
  pin.style.setProperty('--n', N);
  const copies = PROJECTS.map((p, i) => { const c = h('article', { class: 'pin__item', 'aria-hidden': String(i !== 0) }, copyEl(p, i)); copyBox.append(c); return c; });
  const cards = PROJECTS.map((p, i) => { const v = h('div', { class: `pin__card tint-${p.tint}` }, visualEl(p)); visBox.append(v); return v; });
  const dots = PROJECTS.map((p, i) => {
    const b = h('button', { type: 'button' }, h('span', {}, String(i + 1).padStart(2, '0')), p.name);
    b.addEventListener('click', () => {
      const r = pin.getBoundingClientRect(), span = pin.offsetHeight - innerHeight;
      scrollTo({ top: scrollY + r.top + span * (i / (N - 1)) + 2, behavior: reduced ? 'auto' : 'smooth' });
    });
    nav.append(h('li', {}, b));
    return b;
  });

  const ease = (x) => x * x * (3 - 2 * x);
  let active = -1;
  const update = () => {
    if (getComputedStyle(pin).display === 'none') return;
    const r = pin.getBoundingClientRect(), span = pin.offsetHeight - innerHeight;
    const prog = Math.min(1, Math.max(0, -r.top / span));
    const t = prog * (N - 1);                       // 0 … N-1
    cards.forEach((c, k) => {
      // card k slides up from below during the half-step before it becomes active
      const enter = k === 0 ? 1 : ease(Math.min(1, Math.max(0, (t - (k - 1) - 0.3) / 0.55)));
      const covered = Math.min(1, Math.max(0, t - k));   // how far the next card has come over it
      const y = (1 - enter) * 104;
      const s = 1 - Math.min(covered, 1) * 0.06;
      c.style.transform = `translate3d(0, ${y}%, 0) scale(${s})`;
      c.style.filter = covered > 0.02 ? `brightness(${1 - covered * 0.15})` : '';
      c.style.zIndex = String(k + 1);
    });
    const now = Math.min(N - 1, Math.round(t));
    if (now !== active) {
      active = now;
      copies.forEach((c, k) => { c.classList.toggle('is-on', k === now); c.setAttribute('aria-hidden', String(k !== now)); });
      dots.forEach((d, k) => d.classList.toggle('is-on', k === now));
    }
    nav.style.setProperty('--prog', String(prog));
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

// ───────── experience, stack, certifications ─────────
$('#timeline').append(...EXPERIENCE.map((x) => h('li', { class: 'tl reveal' },
  h('p', { class: 'tl__when' }, x.when),
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

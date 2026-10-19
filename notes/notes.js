// reading-progress bar, reveal on scroll, bar-chart tooltips
const bar = document.getElementById('bar');
const onScroll = () => { const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
const tip = document.getElementById('tip');
document.querySelectorAll('[data-tip]').forEach((row) => {
  row.addEventListener('pointermove', (e) => { tip.textContent = row.dataset.tip; tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = (e.clientY + 16) + 'px'; tip.classList.add('on'); });
  row.addEventListener('pointerleave', () => tip.classList.remove('on'));
});

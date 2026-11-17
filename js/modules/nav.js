// Top bar: hides while scrolling down, returns on the way up, marks the
// current section and drives the thin progress line.

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const bar = document.querySelector('[data-progress]');
  const links = [...document.querySelectorAll('[data-nav-link]')];
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle('is-stuck', y > 24);
    nav.classList.toggle('is-hidden', y > lastY && y > 320);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();

  // Keyboard users should never lose the bar.
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  if (!('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove('is-current'));
        byId.get(entry.target.id)?.classList.add('is-current');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  });
}

// Light and dark themes. Follows the system until the visitor picks one;
// the switch wipes outward from the button where the browser supports it.

export function initTheme({ reducedMotion }) {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  const system = window.matchMedia('(prefers-color-scheme: dark)');

  const current = () => root.dataset.theme || (system.matches ? 'dark' : 'light');

  const apply = (theme) => {
    root.dataset.theme = theme;
    button?.setAttribute('aria-pressed', String(theme === 'dark'));
    // The 3D pieces relight themselves when this fires.
    root.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  };

  const toggle = () => {
    const next = current() === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition || reducedMotion) {
      apply(next);
      return;
    }

    const box = button?.getBoundingClientRect();
    if (box) {
      root.style.setProperty('--tx', `${box.left + box.width / 2}px`);
      root.style.setProperty('--ty', `${box.top + box.height / 2}px`);
    }
    document.startViewTransition(() => apply(next));
  };

  let picked = false;
  apply(current());
  button?.addEventListener('click', () => {
    picked = true;
    toggle();
  });
  system.addEventListener('change', (event) => {
    if (!picked) apply(event.matches ? 'dark' : 'light');
  });

  return { toggle, current };
}

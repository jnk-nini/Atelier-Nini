// Shows the current time in Manila next to the location.
export function initClock() {
  const el = document.querySelector('[data-clock]');
  if (!el) return;

  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tick = () => {
    el.textContent = `${format.format(new Date())} PHT`;
  };
  tick();
  setInterval(tick, 15000);
}

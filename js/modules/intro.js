// Opening curtain: counts up while fonts load, then lifts.

const MIN_TIME = 900;
const MAX_WAIT = 2200;

export function runIntro({ reducedMotion }) {
  const root = document.documentElement;
  const counter = document.querySelector('[data-loader-count]');

  if (reducedMotion || !counter) {
    root.classList.add('is-ready');
    return Promise.resolve();
  }

  const fonts = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((done) => setTimeout(done, MAX_WAIT)),
  ]);

  const count = new Promise((done) => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / MIN_TIME, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      counter.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      if (t < 1) requestAnimationFrame(tick);
      else done();
    };
    requestAnimationFrame(tick);
  });

  return Promise.all([fonts, count]).then(
    () =>
      new Promise((done) => {
        root.classList.add('is-ready');
        // Let the curtain get most of the way up before the hero starts moving.
        setTimeout(done, 450);
      }),
  );
}

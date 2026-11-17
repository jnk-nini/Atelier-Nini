import Lenis from '../../vendor/lenis.mjs';

// Smooth wheel scrolling on desktop. Touch devices keep native scrolling,
// and reduced-motion users get the browser default.
export function initScroll({ reducedMotion }) {
  const header = 72;

  if (reducedMotion) {
    return {
      to: (target) => document.querySelector(target)?.scrollIntoView(),
      stop() {},
      start() {},
    };
  }

  const lenis = new Lenis({
    lerp: 0.11,
    anchors: { offset: -header },
  });

  const frame = (time) => {
    lenis.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    to: (target) => lenis.scrollTo(target, { offset: target === '#top' ? 0 : -header }),
    stop: () => lenis.stop(),
    start: () => lenis.start(),
  };
}

import { runIntro } from './modules/intro.js';
import { initScroll } from './modules/scroll.js';
import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initWork } from './modules/work.js';
import { initContact } from './modules/contact.js';
import { initTheme } from './modules/theme.js';
import { initPalette } from './modules/palette.js';
import { initPortrait } from './modules/portrait.js';
import { initMagnetic } from './modules/magnetic.js';
import { initClock } from './modules/clock.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Content first, so nothing below has to wait for missing nodes.
initWork({ finePointer });
initContact();

const scroll = initScroll({ reducedMotion });
const theme = initTheme({ reducedMotion });
initNav();
initPalette({ scroll, theme });
initClock();

if (finePointer && !reducedMotion) {
  initMagnetic();
  initPortrait();
}

// Reveals start once the curtain is up, so the hero animates in view.
runIntro({ reducedMotion }).then(() => initReveal());

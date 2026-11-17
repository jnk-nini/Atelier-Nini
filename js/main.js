import { runIntro } from './modules/intro.js';
import { initScroll } from './modules/scroll.js';
import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initWork } from './modules/work.js';
import { initContact } from './modules/contact.js';
import { initTheme } from './modules/theme.js';
import { initPalette } from './modules/palette.js';
import { initPortrait } from './modules/portrait.js';
import { initClock } from './modules/clock.js';
import { initKeyboard } from './modules/keyboard.js';
import { initSound } from './modules/sound.js';
import { initRooms } from './modules/rooms.js';
import { initPearls } from './modules/pearls.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Content first, so nothing below has to wait for missing nodes.
initWork({ finePointer });
initKeyboard({ reducedMotion, finePointer });
initRooms({ finePointer });
initContact();

const scroll = initScroll({ reducedMotion });
const theme = initTheme({ reducedMotion });
initNav();
initPalette({ scroll, theme });
initClock();
initSound();

if (finePointer && !reducedMotion) initPortrait();

// Reveals start once the curtain is up, so the hero animates in view.
runIntro({ reducedMotion }).then(() => initReveal());

// The pearls bring Three.js with them, so they load last and never block the page.
initPearls({ reducedMotion, finePointer });

import { keys, blankKeys } from '../data/projects.js';
import { filterWork } from './work.js';
import { playNote } from './sound.js';

// The skill keyboard. Keys are plain buttons laid out in CSS 3D; pressing one
// filters the work list, plays its note and sends a ripple through the board.

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>';

const place = (key) => `--x:${key.x}; --y:${key.y}${key.w ? `; --w:${key.w}` : ''}`;
const sides = '<i class="key__front"></i><i class="key__side"></i>';

export function initKeyboard({ reducedMotion, finePointer }) {
  const board = document.querySelector('[data-kb]');
  const status = document.querySelector('[data-key-status]');
  if (!board) return;

  board.innerHTML =
    keys
      .map(
        (key, i) =>
          `<button class="key key--${key.tone}" style="${place(key)}" type="button" data-key="${key.id}" data-note="${i}" aria-pressed="false" aria-label="${key.name}"><span class="key__top">${key.label}</span>${sides}</button>`,
      )
      .join('') +
    blankKeys
      .map(
        (key) =>
          `<span class="key key--blank key--${key.tone}" style="${place(key)}" aria-hidden="true"><span class="key__top">${key.star ? STAR : ''}</span>${sides}</span>`,
      )
      .join('');

  const all = [...board.querySelectorAll('.key')];
  const live = all.filter((key) => key.dataset.key);
  const position = (key) => [
    Number(key.style.getPropertyValue('--x')),
    Number(key.style.getPropertyValue('--y')),
  ];

  // Neighbouring keys dip one after another, further ones later.
  const ripple = (from) => {
    if (reducedMotion) return;
    const [fx, fy] = position(from);
    all.forEach((key) => {
      if (key === from) return;
      const [x, y] = position(key);
      try {
        key.animate([{ '--h': '7px', offset: 0.4 }], {
          duration: 460,
          delay: Math.hypot(x - fx, y - fy) * 65,
          easing: 'ease-out',
        });
      } catch {
        // Browsers that cannot animate the custom property skip the wave.
      }
    });
  };

  const select = (key) => {
    live.forEach((other) => other.setAttribute('aria-pressed', String(other === key)));
    if (!key) {
      filterWork(null);
      if (status) status.textContent = '';
      return;
    }
    const data = keys.find((item) => item.id === key.dataset.key);
    const hits = filterWork(data.id, data.name);
    if (status) {
      status.textContent = `${hits} ${hits === 1 ? 'project uses' : 'projects use'} ${data.name}. Scroll down to the binder.`;
    }
  };

  const press = (key) => {
    const wasPressed = key.getAttribute('aria-pressed') === 'true';
    playNote(Number(key.dataset.note));
    ripple(key);
    select(wasPressed ? null : key);
  };

  // A key sinks while it is held, so the pointer is often over a different
  // element by the time it lifts and the browser never sends a click. Remember
  // the key that went down and fire it on release, unless the finger travelled
  // (which means the visitor was scrolling, not pressing).
  let held = null;
  board.addEventListener('pointerdown', (event) => {
    const key = event.target.closest('[data-key]');
    held = key ? { key, x: event.clientX, y: event.clientY } : null;
  });
  window.addEventListener('pointerup', (event) => {
    if (!held) return;
    const travelled = Math.hypot(event.clientX - held.x, event.clientY - held.y);
    if (travelled < 12) press(held.key);
    held = null;
  });
  window.addEventListener('pointercancel', () => {
    held = null;
  });
  // Keyboard activation arrives as a click with no pointer behind it.
  board.addEventListener('click', (event) => {
    const key = event.target.closest('[data-key]');
    if (key && event.detail === 0) press(key);
  });

  // The "Clear" button in the work bar releases the key too.
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-clear-filter]')) select(null);
  });

  // The whole board leans toward the pointer.
  const tilt = document.querySelector('[data-kb-tilt]');
  const scene = tilt?.parentElement;
  if (!tilt || !finePointer || reducedMotion) return;

  scene.addEventListener('pointermove', (event) => {
    const box = scene.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    tilt.style.transform = `rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
  });
  scene.addEventListener('pointerleave', () => {
    tilt.style.transform = '';
  });
}

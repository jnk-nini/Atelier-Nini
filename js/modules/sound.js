// Key sounds, off until the visitor turns them on. Each key plays one note
// of a pentatonic scale, so any order of presses sounds fine.

const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
let enabled = false;
let context = null;

export function playNote(index) {
  if (!enabled) return;
  try {
    context = context || new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    osc.type = 'triangle';
    osc.frequency.value = NOTES[index % NOTES.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(now + 0.6);
  } catch {
    // Sound is a nicety. If the browser refuses, carry on silently.
  }
}

export function initSound() {
  const button = document.querySelector('[data-sound-toggle]');
  if (!button) return;

  button.addEventListener('click', () => {
    enabled = !enabled;
    button.setAttribute('aria-pressed', String(enabled));
    if (enabled) playNote(2);
  });
}

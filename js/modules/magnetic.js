// Buttons lean a few pixels toward the pointer, and their label a little less,
// which gives the two layers some depth.
export function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const label = el.querySelector('span');
    const pull = 0.22;

    el.addEventListener('pointermove', (event) => {
      const box = el.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * pull;
      const y = (event.clientY - box.top - box.height / 2) * pull;
      el.style.translate = `${x}px ${y}px`;
      if (label) label.style.translate = `${x * 0.35}px ${y * 0.35}px`;
    });

    el.addEventListener('pointerleave', () => {
      const settle = { duration: 600, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)' };
      el.animate({ translate: [el.style.translate, '0px 0px'] }, settle);
      label?.animate({ translate: [label.style.translate, '0px 0px'] }, settle);
      el.style.translate = '';
      if (label) label.style.translate = '';
    });
  });
}

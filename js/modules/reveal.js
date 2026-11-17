// Scroll reveals. Elements marked data-reveal fade up; headings marked
// data-split are cut into words that rise out of a mask one after another.

function splitWords(heading) {
  let index = 0;

  const wrap = (node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.append(' ');
        return;
      }
      const outer = document.createElement('span');
      const inner = document.createElement('span');
      outer.className = 'word';
      // Optional hand kerning, set in the markup with data-kern.
      const kern = node.parentElement.dataset.kern;
      if (kern) outer.classList.add(`kern-${kern}`);
      inner.textContent = part;
      inner.style.setProperty('--i', index++);
      outer.append(inner);
      frag.append(outer);
    });
    node.replaceWith(frag);
  };

  // Screen readers get the sentence once, not word by word.
  heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());

  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(wrap);
}

export function initReveal() {
  const headings = document.querySelectorAll('[data-split]');
  headings.forEach(splitWords);

  const targets = [...document.querySelectorAll('[data-reveal]'), ...headings];

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );

  targets.forEach((el) => {
    // Anything already on screen (the hero) comes in straight away.
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
    else observer.observe(el);
  });
}

import { projects } from '../data/projects.js';

// Builds the work list from js/data/projects.js, then wires up the behaviours
// around it: opening a binder spread, the hover preview and the key filter.

const pad = (n) => String(n).padStart(2, '0');

const ARROW =
  '<svg class="ico" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function swatch(project, index) {
  const [bg, ink] = project.swatch;
  return `
    <div class="swatch" style="--sw: ${bg}; --sw-ink: ${ink}">
      <span class="label">No. ${pad(index + 1)} / ${project.kind}</span>
      <span class="display">${project.name}</span>
    </div>`;
}

function image(img, lazy = true) {
  return `<img src="${img.src}" width="${img.w}" height="${img.h}" alt="${img.alt}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
}

function pieceTemplate(project, index) {
  // Left column: screenshots if there are any, a code sample if the project
  // has one, otherwise the brief itself set large.
  let lead = `<p class="piece__brief piece__brief--lead">${project.brief}</p>`;
  let brief = '';
  if (project.images.length) {
    lead = project.images.map((img) => image(img)).join('');
    brief = `<p class="piece__brief">${project.brief}</p>`;
  } else if (project.sample) {
    lead = `<figure class="sample"><figcaption class="label">${project.sample.label}</figcaption><pre><code>${project.sample.code}</code></pre></figure>`;
    brief = `<p class="piece__brief">${project.brief}</p>`;
  }

  const links = project.links
    .map(
      (link, i) =>
        `<a class="btn${i === 0 ? ' btn--solid' : ''}" href="${link.href}" target="_blank" rel="noopener"><span>${link.label}</span>${ARROW}</a>`,
    )
    .join('');

  return `
    <li class="piece" data-piece="${project.id}" data-keys="${project.keys.join(' ')}" data-reveal>
      <h3>
        <button class="piece__row" type="button" aria-expanded="false" aria-controls="panel-${project.id}">
          <span class="label piece__no">${pad(index + 1)}</span>
          <span>
            <span class="display piece__name">${project.name}</span>
            <span class="piece__tag">${project.tagline}</span>
            <span class="piece__pin label">uses your key</span>
          </span>
          <span class="label piece__kind">${project.kind}</span>
          <span class="label piece__year">${project.year}</span>
          <span class="piece__plus" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="piece__panel" id="panel-${project.id}" inert>
        <div class="piece__clip">
          <div class="piece__detail spread">
            <div class="spread__page spread__page--left">
              <span class="spread__no">Page ${pad(index + 1)}</span>
              ${lead}
            </div>
            <div class="spread__rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <div class="spread__page spread__page--right">
              <span class="spread__no">Notes</span>
              ${brief}
              <ul class="piece__built">${project.built.map((item) => `<li>${item}</li>`).join('')}</ul>
              <dl class="piece__spec">
                <dt class="label">Role</dt><dd>${project.role}</dd>
                <dt class="label">Built with</dt><dd>${project.stack.join(', ')}</dd>
              </dl>
              <div class="piece__links">${links}</div>
            </div>
          </div>
        </div>
      </div>
    </li>`;
}

function initAccordion(list) {
  const setOpen = (piece, open) => {
    piece.classList.toggle('is-open', open);
    piece.querySelector('.piece__row').setAttribute('aria-expanded', String(open));
    piece.querySelector('.piece__panel').toggleAttribute('inert', !open);
  };

  list.addEventListener('click', (event) => {
    const row = event.target.closest('.piece__row');
    if (!row) return;
    const piece = row.closest('.piece');
    const willOpen = !piece.classList.contains('is-open');

    list.querySelectorAll('.piece.is-open').forEach((other) => setOpen(other, false));
    setOpen(piece, willOpen);
    list.dispatchEvent(new CustomEvent('piece:toggle', { detail: { open: willOpen } }));
  });
}

// Called by the keyboard. Pass a key id to light up the matching projects,
// or nothing to clear. Returns how many projects matched.
export function filterWork(keyId, name) {
  const list = document.querySelector('[data-work-list]');
  const count = document.querySelector('[data-work-count]');
  const status = document.querySelector('[data-work-filter]');
  if (!list) return 0;

  let hits = 0;
  list.querySelectorAll('.piece').forEach((piece) => {
    const match = !keyId || piece.dataset.keys.split(' ').includes(keyId);
    piece.classList.toggle('is-dim', !match);
    piece.classList.toggle('is-hit', Boolean(keyId) && match);
    if (match) hits += 1;
  });

  if (count) count.textContent = pad(hits);
  if (status) {
    status.innerHTML = keyId
      ? `Filtered by <strong>${name}</strong> <button type="button" data-clear-filter>Clear</button>`
      : 'Showing everything. <a href="#skills">Press a key</a> to filter.';
  }
  return hits;
}

// A small card that trails the pointer while it is over the list.
function initPreview(list) {
  const preview = document.querySelector('[data-preview]');
  const inner = document.querySelector('[data-preview-inner]');
  if (!preview || !inner) return;

  inner.innerHTML = projects
    .map((project, index) => {
      const cover = project.images[0];
      return `<div class="preview__item" data-preview-for="${project.id}">${cover ? image(cover, false) : swatch(project, index)}</div>`;
    })
    .join('');

  const items = new Map(
    [...inner.children].map((item) => [item.dataset.previewFor, item]),
  );

  const pos = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let tilt = 0;
  let running = false;
  let visible = false;

  const frame = () => {
    const dx = target.x - pos.x;
    pos.x += dx * 0.14;
    pos.y += (target.y - pos.y) * 0.14;
    // Lean into the direction of travel, like a card being dragged.
    tilt += (Math.max(-9, Math.min(9, dx * 0.06)) - tilt) * 0.12;

    preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt.toFixed(2)}deg)`;

    const settled = Math.abs(dx) < 0.1 && Math.abs(target.y - pos.y) < 0.1 && Math.abs(tilt) < 0.05;
    if (visible || !settled) requestAnimationFrame(frame);
    else running = false;
  };

  const show = (id) => {
    items.forEach((item, key) => item.classList.toggle('is-active', key === id));
    if (!visible) {
      // Start where the pointer is, not where the card was last seen.
      pos.x = target.x;
      pos.y = target.y;
    }
    visible = true;
    preview.classList.add('is-on');
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  const hide = () => {
    visible = false;
    preview.classList.remove('is-on');
  };

  list.addEventListener('pointermove', (event) => {
    const width = preview.offsetWidth;
    const height = preview.offsetHeight;
    // Sit to the right of the pointer, flipping left near the edge.
    const right = event.clientX + 28 + width < window.innerWidth;
    target.x = right ? event.clientX + 28 : event.clientX - 28 - width;
    target.y = Math.min(event.clientY - height / 2, window.innerHeight - height - 16);

    const row = event.target.closest('.piece__row');
    const piece = row?.closest('.piece');
    if (piece && !piece.classList.contains('is-open')) show(piece.dataset.piece);
    else hide();
  });
  list.addEventListener('pointerleave', hide);
  list.addEventListener('piece:toggle', hide);
  window.addEventListener('scroll', hide, { passive: true });
}

export function initWork({ finePointer }) {
  const list = document.querySelector('[data-work-list]');
  if (!list) return;

  list.innerHTML = projects.map(pieceTemplate).join('');

  initAccordion(list);
  filterWork(null);
  if (finePointer) initPreview(list);
}

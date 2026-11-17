import { projects, disciplines } from '../data/projects.js';

// Builds the work list from js/data/projects.js, then wires up the three
// behaviours around it: open/close, the discipline filter and the hover preview.

const pad = (n) => String(n).padStart(2, '0');

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
        `<a class="btn${i === 0 ? ' btn--solid' : ''}" href="${link.href}" target="_blank" rel="noopener"><span>${link.label} ↗</span></a>`,
    )
    .join('');

  return `
    <li class="piece" data-piece="${project.id}" data-tags="${project.tags.join(' ')}" data-reveal>
      <h3>
        <button class="piece__row" type="button" aria-expanded="false" aria-controls="panel-${project.id}">
          <span class="label piece__no">${pad(index + 1)}</span>
          <span>
            <span class="display piece__name">${project.name}</span>
            <span class="piece__tag">${project.tagline}</span>
          </span>
          <span class="label piece__kind">${project.kind}</span>
          <span class="label piece__year">${project.year}</span>
          <span class="piece__plus" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="piece__panel" id="panel-${project.id}" inert>
        <div class="piece__clip">
          <div class="piece__detail">
            <div class="piece__media">${lead}</div>
            <div class="piece__info">
              ${brief}
              <ul class="piece__built">${project.built.map((item) => `<li>${item}</li>`).join('')}</ul>
              <dl class="piece__spec">
                <dt class="label">Role</dt><dd>${project.role}</dd>
                <dt class="label">Composition</dt><dd>${project.stack.join(', ')}</dd>
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

function initFilters(list) {
  const group = document.querySelector('[data-filters]');
  const count = document.querySelector('[data-work-count]');
  if (!group) return;

  group.innerHTML = [{ id: 'all', label: 'All' }, ...disciplines]
    .map(
      (item) =>
        `<button class="filter" type="button" data-filter="${item.id}" aria-pressed="${item.id === 'all'}">${item.label}</button>`,
    )
    .join('');

  group.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const active = button.dataset.filter;

    group.querySelectorAll('[data-filter]').forEach((other) => {
      other.setAttribute('aria-pressed', String(other === button));
    });

    let shown = 0;
    list.querySelectorAll('.piece').forEach((piece) => {
      const match = active === 'all' || piece.dataset.tags.split(' ').includes(active);
      piece.classList.toggle('is-dim', !match);
      if (match) shown += 1;
    });
    if (count) count.textContent = pad(shown);
  });
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
  initFilters(list);
  if (finePointer) initPreview(list);
}

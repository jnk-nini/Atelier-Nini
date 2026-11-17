import { contact } from '../data/site.js';

// Command palette on Cmd/Ctrl+K (or "/"). On small screens the same dialog
// is the site menu, opened from the Menu button.

export function initPalette({ scroll, theme }) {
  const dialog = document.querySelector('[data-palette]');
  const input = document.querySelector('[data-palette-input]');
  const list = document.querySelector('[data-palette-list]');
  const toast = document.querySelector('[data-toast]');
  if (!dialog || !dialog.showModal) return;

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  document.querySelectorAll('[data-shortcut]').forEach((el) => {
    el.textContent = isMac ? '⌘K' : 'Ctrl K';
  });

  const say = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(say.timer);
    say.timer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };

  const go = (target) => () => scroll.to(target);
  const open = (href) => () => window.open(href, '_blank', 'noopener');

  const commands = [
    { label: 'Work', hint: 'Section', run: go('#work') },
    { label: 'Services', hint: 'Section', run: go('#services') },
    { label: 'Process and tools', hint: 'Section', run: go('#process') },
    { label: 'About', hint: 'Section', run: go('#about') },
    { label: 'Contact', hint: 'Section', run: go('#contact') },
    { label: 'Back to top', hint: 'Section', run: go('#top') },
    { label: 'Switch colour theme', hint: 'Action', run: () => theme.toggle() },
    contact.email && {
      label: 'Copy email address',
      hint: 'Action',
      run: () =>
        navigator.clipboard
          .writeText(contact.email)
          .then(() => say('Email copied'))
          .catch(() => say(contact.email)),
    },
    contact.github && { label: 'Open GitHub profile', hint: 'Link', run: open(contact.github) },
    contact.linkedin && { label: 'Open LinkedIn', hint: 'Link', run: open(contact.linkedin) },
    contact.resume && { label: 'Download resume', hint: 'Link', run: open(contact.resume) },
    contact.source && { label: 'Read the source of this site', hint: 'Link', run: open(contact.source) },
  ].filter(Boolean);

  let matches = commands;
  let selected = 0;

  const render = () => {
    if (!matches.length) {
      list.innerHTML = '<li class="palette__empty">Nothing matches that.</li>';
      return;
    }
    list.innerHTML = matches
      .map(
        (command, i) =>
          `<li class="palette__item" role="option" data-index="${i}" aria-selected="${i === selected}"><span>${command.label}</span><span class="label">${command.hint}</span></li>`,
      )
      .join('');
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    matches = commands.filter((command) =>
      `${command.label} ${command.hint}`.toLowerCase().includes(query),
    );
    selected = 0;
    render();
  };

  const show = () => {
    if (dialog.open) return;
    input.value = '';
    filter();
    scroll.stop();
    dialog.showModal();
  };

  const run = (command) => {
    dialog.close();
    // Wait for the dialog to give the page back before scrolling it.
    requestAnimationFrame(() => command.run());
  };

  dialog.addEventListener('close', () => scroll.start());
  input.addEventListener('input', filter);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!matches.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      selected = (selected + step + matches.length) % matches.length;
      render();
    } else if (event.key === 'Enter' && matches[selected]) {
      event.preventDefault();
      run(matches[selected]);
    }
  });

  list.addEventListener('click', (event) => {
    const item = event.target.closest('[data-index]');
    if (item) run(matches[Number(item.dataset.index)]);
  });
  list.addEventListener('pointermove', (event) => {
    const item = event.target.closest('[data-index]');
    if (!item || Number(item.dataset.index) === selected) return;
    selected = Number(item.dataset.index);
    list.querySelectorAll('[data-index]').forEach((el, i) => {
      el.setAttribute('aria-selected', String(i === selected));
    });
  });

  // Click on the backdrop closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.querySelectorAll('[data-palette-open]').forEach((button) => {
    button.addEventListener('click', show);
  });

  window.addEventListener('keydown', (event) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    const combo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (combo || (event.key === '/' && !typing)) {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else show();
    }
  });
}

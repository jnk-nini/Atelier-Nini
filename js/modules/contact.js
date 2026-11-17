import { contact } from '../data/site.js';

const ARROW =
  '<svg class="ico" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Adds the contact rows that have a value in js/data/site.js.
export function initContact() {
  const list = document.querySelector('[data-contact-links]');
  if (!list) return;

  const rows = [];
  if (contact.email) {
    rows.push({ label: 'Email', value: contact.email, href: `mailto:${contact.email}` });
  }
  if (contact.linkedin) {
    rows.push({
      label: 'LinkedIn',
      value: contact.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
      href: contact.linkedin,
    });
  }
  if (contact.resume) {
    rows.push({ label: 'Resume', value: 'Download the PDF', href: contact.resume });
  }

  const html = rows
    .map(
      (row) => `
      <li data-reveal>
        <a href="${row.href}"${row.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
          <span class="label">${row.label}</span>
          <span class="contact__value">${row.value}</span>
          <span class="arrow">${ARROW}</span>
        </a>
      </li>`,
    )
    .join('');

  // Email goes first, the links already in the page follow.
  list.insertAdjacentHTML('afterbegin', html);
}

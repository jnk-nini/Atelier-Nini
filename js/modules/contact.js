import { contact } from '../data/site.js';

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
    rows.push({ label: 'Resume', value: 'Download the PDF', href: contact.resume, arrow: '↓' });
  }

  const html = rows
    .map(
      (row) => `
      <li data-reveal>
        <a href="${row.href}"${row.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
          <span class="label">${row.label}</span>
          <span class="contact__value">${row.value}</span>
          <span class="arrow" aria-hidden="true">${row.arrow || '↗'}</span>
        </a>
      </li>`,
    )
    .join('');

  // Email goes first, the links already in the page follow.
  list.insertAdjacentHTML('afterbegin', html);
}

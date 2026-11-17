// The work list is rendered from this file. To add a project, add an entry here.
// `tags` must use the ids from `disciplines` so the filter can find it.

export const disciplines = [
  { id: 'frontend', label: 'Front end' },
  { id: 'backend', label: 'Back end' },
  { id: 'data', label: 'Database' },
  { id: '3d', label: '3D / WebGL' },
  { id: 'testing', label: 'Tested' },
];

export const projects = [
  {
    id: 'reserba',
    name: 'ReserBa',
    tagline: 'Amenity booking for homeowners associations, with no double bookings',
    kind: 'Full-stack app',
    year: '2026',
    role: 'Team project, Software Engineering',
    tags: ['frontend', 'backend', 'data'],
    images: [{ src: 'assets/img/reserba-cover.webp', w: 1200, h: 630, alt: 'ReserBa cover: The clubhouse, the court, and the pool. Reserved properly.' }],
    swatch: ['#1f3d2c', '#efe6d6'],
    brief:
      'Subdivision associations take court, clubhouse and pool reservations over chat and paper, so overlaps happen and payments get lost. ReserBa gives residents a calendar to book from and gives the office one place to approve, record and report.',
    built: [
      'Three roles with their own screens: residents, administrators and the guard at the gate',
      'Schedule conflict detection, so two requests can never hold the same slot',
      'Requests, walk-ins, payment ledger, printable slips, reports and an audit trail',
      'All 30 functional requirements delivered, backed by 14 database migrations',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'FullCalendar', 'Vercel'],
    links: [{ label: 'Source', href: 'https://github.com/jnk-nini/ReserBa' }],
  },
  {
    id: 'aegisneo',
    name: 'AegisNEO API',
    tagline: 'A REST API that tracks real near-Earth asteroids',
    kind: 'API and database',
    year: '2026',
    role: 'Design, build, deploy',
    tags: ['backend', 'data', 'testing'],
    images: [],
    sample: {
      label: 'A real request',
      code: `GET /api/v1/asteroids?hazardous=true&min_diameter=1&sort=diameter&order=desc&limit=3
x-api-key: ********

200 OK
{
  "count": 3,
  "matched": 219,
  "total": 33511,
  "asteroids": [
    {
      "neo_reference_id": "2003122",
      "name": "3122 Florence (1981 ET3)",
      "estimated_diameter_km": 6.5094,
      "is_potentially_hazardous": true,
      "close_approach_date": "1936-12-05",
      "miss_distance_km": 58055238.369
    },
    ...
  ]
}`,
    },
    swatch: ['#2b0e13', '#ecc4c3'],
    brief:
      'A public API over NASA near-Earth object records, built so that other sites can depend on it. It has documented endpoints, strict validation and three levels of access, and it already powers two separate products.',
    built: [
      'Guest, signed-in and partner access: JWT login for users, API keys for partner sites',
      'Search, filters, sorting and statistics over the catalogue, every query in hand-written SQL',
      '70 Pytest tests covering reads, writes, validation, security and reliability',
      'Interactive docs, a schema with constraints and indexes, and a least-privilege database role',
    ],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Neon', 'psycopg 3', 'JWT', 'Pytest', 'Vercel'],
    links: [
      { label: 'Live docs', href: 'https://aegisneo-api.vercel.app/docs' },
      { label: 'Source', href: 'https://github.com/jnk-nini/aegisneo-api' },
    ],
  },
  {
    id: 'impactor',
    name: 'Impactor',
    tagline: 'A 3D asteroid impact simulator on a live globe',
    kind: 'Interactive 3D',
    year: '2026',
    role: 'Design, build, deploy',
    tags: ['frontend', '3d', 'testing'],
    images: [
      { src: 'assets/img/impactor-impact.webp', w: 1280, h: 800, alt: 'Impactor mid-simulation: an asteroid striking the surface' },
      { src: 'assets/img/impactor-results.webp', w: 1280, h: 800, alt: 'Impactor results panel with crater size, energy and damage zones' },
    ],
    swatch: ['#3a2a22', '#f0d9c4'],
    brief:
      'Pick a real asteroid, aim it anywhere on a 3D Earth and watch the approach, the impact and the blast wave. The numbers follow a published model (Collins, Melosh and Marcus, 2005), and the asteroid data comes from the AegisNEO API.',
    built: [
      'A globe with satellite imagery, real day and night, city lights, clouds and atmosphere',
      'An impact sequence with entry glow, airburst or ground strike, crater and ejecta',
      'Texture painting moved to a Web Worker so the frame rate holds on phones',
      '83 unit tests and a CI pipeline that lints, tests and builds every push',
    ],
    stack: ['React', 'Three.js', 'React Three Fiber', 'Zustand', 'D3-geo', 'Vite', 'Vitest', 'GitHub Actions'],
    links: [
      { label: 'Live site', href: 'https://aegisneo-impactor.vercel.app' },
      { label: 'Source', href: 'https://github.com/jnk-nini/aegisneo-impactor' },
    ],
  },
  {
    id: 'neo-atlas',
    name: 'NEO Atlas',
    tagline: 'Your birthday as a constellation of real asteroids',
    kind: 'Mobile-first app',
    year: '2026',
    role: 'Design, build, deploy',
    tags: ['frontend', 'testing'],
    images: [
      { src: 'assets/img/neo-atlas-cover.webp', w: 1200, h: 630, alt: 'NEO Atlas cover: near-Earth asteroids, charted like stars' },
      { src: 'assets/img/neo-atlas-chart.webp', w: 1280, h: 800, alt: 'NEO Atlas star chart with an asteroid detail card open' },
    ],
    swatch: ['#101a3a', '#e9d9b0'],
    brief:
      'Made for phones. Enter a birthday and the atlas reveals the asteroids that passed Earth that day, joins the biggest into a constellation and turns it into a postcard you can send.',
    built: [
      'One question on the first screen, one main button per screen, tap targets of 44px or more',
      'Postcards as share links, including sealed ones that count down to the birthday',
      'Star Match: two birthdays joined into one constellation with a reply card',
      'Zoomable chart drawn with D3, plus 64 unit tests around the data and sharing rules',
    ],
    stack: ['React', 'D3', 'Vite', 'Vitest', 'ESLint', 'Vercel'],
    links: [
      { label: 'Live site', href: 'https://neo-atlas-pearl.vercel.app' },
      { label: 'Source', href: 'https://github.com/jnk-nini/neo-atlas' },
    ],
  },
  {
    id: 'commutayo',
    name: 'CommuTayo',
    tagline: 'A commute planner for jeepney and UV routes in Cavite',
    kind: 'Web app, in progress',
    year: '2026',
    role: 'Design and build',
    tags: ['frontend', 'data', 'testing'],
    images: [],
    swatch: ['#575527', '#f3eee8'],
    brief:
      'Most route apps stop at the city line. CommuTayo maps the Aguinaldo Highway corridor stop by stop, so a commuter can see which ride to take, where to stand and what the fare should be.',
    built: [
      'A routing engine over stops and routes ingested from OpenStreetMap',
      'Fares worked out from road distance, with student, senior and PWD discounts',
      'A live map with geolocation and trip progress, pinned to the actual waiting shed',
      'Unit tests around routing direction and fare rules',
    ],
    stack: ['React', 'TypeScript', 'Leaflet', 'Supabase', 'Tailwind CSS', 'Vite'],
    links: [{ label: 'Source', href: 'https://github.com/jnk-nini/commutayo' }],
  },
  {
    id: 'reviewers',
    name: 'Reviewers',
    tagline: 'Study reviewers that install like apps and work offline',
    kind: 'PWA suite',
    year: '2026',
    role: 'Design, build, deploy',
    tags: ['frontend'],
    images: [],
    swatch: ['#b97d7b', '#2b0e13'],
    brief:
      'I study better from something I built myself. Each course gets a small installable site with notes, a cheat sheet, a question bank and a recall mode, and it keeps working with no signal in the classroom.',
    built: [
      'Eight course reviewers from one shared template, each deployed on its own',
      'Service worker caching so every page opens offline after the first visit',
      'Plain HTML, CSS and JavaScript with no build step, so a new one ships in an evening',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Service Worker', 'Web App Manifest', 'Vercel'],
    links: [
      { label: 'Live example', href: 'https://cscn07c-reviewer.vercel.app' },
      { label: 'Source', href: 'https://github.com/jnk-nini/Ninis-Reviewers' },
    ],
  },
];

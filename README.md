# Atelier Nini

Portfolio of Jenny Joy "Nini" Latagan, full-stack developer.

Plain HTML, CSS and JavaScript modules. There is no framework and no build step, so the
repository is the site.

## Run it

Any static server works, for example:

```
python3 -m http.server 4173
```

Then open http://localhost:4173. (Opening `index.html` straight from disk will not work,
because browsers block ES modules on `file://`.)

## Layout

```
index.html            page structure and copy
css/base.css          fonts, colour tokens, reset, shared pieces, reveal styles
css/site.css          every section, top to bottom, then the breakpoints
js/main.js            entry point, starts each module
js/data/projects.js   the work list (edit this to add or change a project)
js/data/site.js       contact links (email, LinkedIn, resume)
js/modules/           one file per behaviour
assets/               fonts, images, favicon
vendor/lenis.mjs      smooth scrolling (Lenis 1.3.27)
```

## Editing content

- **Projects:** add an entry to `js/data/projects.js`. Screenshots go in `assets/img`.
  A project with no screenshot shows its brief as the lead instead.
- **Contact:** fill in `email`, `linkedin` and `resume` in `js/data/site.js`. Empty
  values are hidden on the page and in the command palette.
- **Colours:** both themes are defined once at the top of `css/base.css`.

## Notes

- Light and dark themes follow the system setting until the toggle is used.
- `Cmd/Ctrl + K` (or `/`) opens the command palette. On phones it is the menu.
- The hero portrait is drawn with a small WebGL shader on desktop and falls back to the
  plain image everywhere else.
- With "reduce motion" turned on, the intro, smooth scrolling and pointer effects are off.

Fonts: Bodoni Moda, Instrument Sans and DM Mono (SIL Open Font License).

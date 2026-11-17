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
css/base.css          fonts, colour tokens, reset, shared pieces
css/site.css          every section, top to bottom, then the breakpoints
js/main.js            entry point, starts each module
js/data/projects.js   the work list and the skill keys
js/data/site.js       contact links (email, LinkedIn, resume)
js/modules/           one file per behaviour
assets/               fonts, images, favicon
vendor/               Lenis 1.3.27 (smooth scrolling), Three.js r128 (hero pearls)
```

## What is on the page

- **Hero:** the lily opens behind the portrait and a strand of 3D pearls drapes around it.
  The portrait itself is drawn through a small WebGL shader on desktop.
- **Skills:** a 3D keyboard built in CSS. Pressing a key filters the work list, and plays a
  note if sound is switched on (it is off by default).
- **Work:** each project opens as a ring-binder spread.
- **Creative corner:** three rooms that open on hover or tap.

## Editing content

- **Projects:** add an entry to `js/data/projects.js`. Screenshots go in `assets/img`.
  A project with no screenshot shows its brief as the lead instead. List the skill keys
  it uses under `keys` so the keyboard can find it.
- **Skill keys:** the `keys` list at the top of the same file. Each has a column and row
  on the 6 by 3 board.
- **Contact:** fill in `email`, `linkedin` and `resume` in `js/data/site.js`. Empty
  values are hidden on the page and in the command palette.
- **Colours:** both themes are defined once at the top of `css/base.css`.

## Notes

- Light and dark themes follow the system setting until the toggle is used.
- `Cmd/Ctrl + K` (or `/`) opens the command palette. On phones it is the menu.
- Three.js is only loaded for the pearls, after the page is already usable. Without WebGL
  the hero simply shows the lily and portrait.
- With "reduce motion" turned on, the intro, smooth scrolling and pointer effects are off
  and the pearls render as a still.
- Checked at 375, 820, 1024 and 1440 px wide, in both themes.

Fonts: Bodoni Moda, Instrument Sans and DM Mono (SIL Open Font License).

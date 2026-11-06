# Shubham Gupta: site prototypes

Static prototypes for Shubham Gupta's personal site, published with GitHub Pages:
https://shubham-gupta-coder.github.io/site-prototypes/ (index of every version).

**Current work: `v9/shutter/`** (in progress). Direction and content rules: `docs/NEXT-DIRECTION.md`. History and taste: `docs/HANDOFF.md`.

## Run locally
No build step. Every page is plain HTML + ES modules; three.js and Lenis load from jsDelivr.

```bash
git clone https://github.com/Shubham-Gupta-coder/site-prototypes.git
cd site-prototypes
python3 -m http.server 8765
# open http://127.0.0.1:8765/v9/shutter/   (or v7/shutter/, v8/shutter/ ...)
```

Use a real server (not file://): modules and workers need http.

## Folder map
| Path | What |
|---|---|
| `v9/shutter/` | Current build (see its README) |
| `v8/shutter/` | v8 "Switchyard" (rejected theme and content, kept for reference) |
| `v7/shutter/` | v7 "The Shutter: the Apparatus" (the world v9 evolves) |
| `v6/`, `v5/shutter/` | Earlier dot-film versions |
| `v5/shutter-benchmark-1/`, `v5/shutter-benchmark-2/` | Frozen benchmarks. Never edit |
| `v2/`, `v3/`, `v4/`, `option-1..3/` | Earlier rounds |
| `docs/` | Handoff and direction notes |

## Rules
- Public repo: never commit secrets, private notes, client details or business figures.
- Never edit frozen benchmarks or older versions; start a new `vN/` folder for a new direction.
- Bump the cache key (`?v=...` on every module and asset in that version's `index.html`) when you change a published version.

## Publish
Push to `main`; GitHub Pages deploys the repo root (a `.nojekyll` file is present). Check the Actions tab ("pages-build-deployment") and then open the page.

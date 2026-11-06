# v8 "The Switchyard" (v8a, local build)

A continuous scroll film through a machine world of solid graphite structures, followed by a normal (not scrubbed) "What I build" and contact ending. Built from SCRIPT-v5 (approved 6 Nov 2026). Cache key `?v=v8a` on every module and still image.

Preview: `http://127.0.0.1:8765/v8/shutter/index.html` (box server on 8765 serves the repo). Not published.

## Story (film time T 0..100, scroll through `#film`, 1500vh)
| T | Scene | What acts |
|---|---|---|
| 0-5 | Opening | Static HTML/SVG headline "I build the machinery behind AI agents." + "Scroll to explore", painted before WebGL; the 3D district fades up behind it |
| 6-30 | Switchyard (personal agent system) | Signal enters on the primary lane, primary drops, backup takes over; memory core lights on write; agent bays light as the signal sweeps; one service housing restarts |
| 30-54 | Evidence press (research) | Signal rides the rail into the press; six source pylons feed it; card A traces to a stored slab and is stamped verified; card B fails its trace and is downgraded, kept |
| 54-75 | Command deck (MX, built prototype, parked) | Card A docks in the phone as "Research brief"; an outgoing send waits at the amber gate; approve, sent, and an undo window for that step |
| 71-79 | Sky link | The approved action leaves the phone top as the signal and draws a cyan line to the platform; the camera follows the signal |
| 77-92 | Platform (Verslay, labelled supporting proof) | Signal leaves the phone and climbs the tower spine; sockets and cables light |
| 92-100 | Horizon | Signal runs to the amber horizon line: "Always learning. Always building." |
Then the DOM ending: four capability cards with small SVG animations (play when scrolled into view, replay on hover/focus), and "Get in touch." with one link to the public LinkedIn profile.

## Files
- `index.html`: markup, CSS, captions (`.cap[data-t="a,b"]`), the still sequence (`#still`), the ending (`.end#build`, `.contact`), card animation script. A head script picks `html.film` or `html.still` (reduced motion, no WebGL2, or `?still=1`).
- `film.js`: tiny loader; imports `engine.js` only in film mode, falls back to stills on failure.
- `engine.js`: renderer, lights, haze points, camera keyframes `K` (T, position, look), bloom, adaptive levels `LV`, captions and projected SVG labels, scroll to T (Lenis + critically damped spring), test hook.
- `world.js`: `buildWorld` (all structures) and `updateWorld(W,T,time)` (everything a pure function of T; the signal route is `ROUTE`; labels with their T windows are `W.labels`).
- `ui.js`: canvas UI drawn onto 3D surfaces (claim cards, the phone screen).
- `stills/`: five frames rendered from the film for the reduced-motion and no-WebGL page (regenerate with `shubham-site-notes/gen8/stills.py`).
- `fonts/`: Tourney, IBM Plex Sans, IBM Plex Mono (Latin subsets, woff) with their SIL OFL 1.1 licences.

## Layout notes
- Desktop (min-width 900px, landscape): the agent, research and deck captions sit in a left column with a soft gradient scrim; the 3D image is shifted right with `camera.setViewOffset` (`SIDEW` windows and `sideShift()` in `engine.js`), so labels still project correctly. Phones keep top captions over the scene.
- On phones the VERSLAY plate only shows before its caption arrives (avoids collision).
- The horizon caption has a radial scrim and a slight exposure lift at T 92-97.

## How to change things
- Retime a scene: shift its `K` camera keys in `engine.js`, its `ss()` windows in `updateWorld`, its `ROUTE` segment, its `W.labels` windows, and its caption `data-t`. Keep everything a function of T.
- Copy: edit the caption in `index.html`; run `python3 shubham-site-notes/gen8/copycheck.py` (no digits, banned words, exact founder line, one link labelled "Get in touch").
- Performance: `LV` levels (dpr, bloom, image-based environment). The loop steps down a level when 30 frames average over 26 ms. `?fixlv` disables stepping (tests).

## Test hooks
`?T=40` freezes the film at T; `?hud` shows T/level and exposes debug handles; `?still=1` forces the still page. `window.__film = {ready, level(), set(T,clock), release(), bench(level)}`.
Tests: `shubham-site-notes/gen8/test8.py` (film frames desktop and phone every 2 T, caption audit, DOM ending, keyboard, reduced motion, no WebGL, resources, console, fps), `shot.py` (single frames), `stills.py`, `copycheck.py`.

## Fonts and libraries
Tourney (Tyler Finck, Etcetera Type Co.) and IBM Plex Sans/Mono (IBM), SIL Open Font License 1.1, self-hosted. three.js 0.170 and Lenis 1.1.18 from jsDelivr.

# v9.1: SVG objects in the Apparatus

This separate review build evolves v9's rendering, not its story. Earlier builds are preserved.

## What changed
- Thirteen original, editable SVG illustrations: server rack cassettes, app workspace, agent controller, memory cabinet, machined drive wheel, context core, five tool interfaces, report interface, linking deck.
- SVG object faces are mounted on shaded depth-tested steel/brass housings in the original Three.js world. These are actual world objects, not fullscreen banners and not SVGs converted to dots.
- Server silhouettes, app towers, memory stores, workflow machinery, central core, linking bridges, track, islands and viaduct now have solid structure.
- Exact part tags (groups 28 through 39) suppress replaced dots as vector surfaces assemble. Source and destination masks are independent during morphs. Atmospheric dust, flowing packets, the waveform, human approval interaction, lettering, drawing and halo remain particles.
- Assembly, gear movement, dissolves and lights follow the same scroll-derived film position. The story timings are preserved. The existing agent and memory shots now aim at their corresponding objects, and the matching caption anchors are corrected. Phone caption boxes no longer overflow.
- Fresh vector-world stills support the unchanged reduced-motion/noWebGL sequence.

## What did not change
Approved v9 problem-led copy, story, fonts and their OFL licenses, normal problems/contact ending, professional contact route and paused video work.

## Start locally
From repository root: `python3 -m http.server 8765`, then open `/v9.1/shutter/`.
Run `python3 v9.1/shutter/validate.py` and `node v9.1/shutter/timeline.mjs 10 100`.
Use `?dots=32768&hud` for deterministic low-tier QA; use the default tier on actual devices.
Use `await window.__film.set(T)` for scene review and `window.__film.release()` to return to scroll.

## Editing
`v9.1/shutter/README.md` retains the v9 guide and adds the vector integration guide.
`assets/*.svg` are native path/gradient source. `vector-world.js` controls their placement and reveal.
`shapes.js` groups 28..39 identify replaced surfaces; `film.js` fades those groups only when SVGs have loaded.
Cache version is `v9_1a` throughout the new build. Do not edit frozen v9 while iterating.

## Limitations
WebGL textures rasterize the native SVGs at their declared dimensions; extreme zoom is not infinitely sharp.
Headless software-WebGL QA is not evidence of real-device performance. Test a midrange phone and laptop before making smoothness claims.
Three.js and Lenis retain the original CDN dependency. If SVG assets fail, the original particle world remains available.
No video, domain, private brief, client details or new business claims are introduced.

# v9.2 — Connected systems

A separate rendering and editorial refinement of the v9 mechanical-world film. The same scene order and stable particle-ID transition chain remain. This version changes the material treatment, compositions, authored SVG artwork, local operation and copy; it is not a new sequence of project demos.

## Open locally

From the repository root: `python3 -m http.server 8882`, then open `/v9.2/shutter/?v=v9_2a`. An HTTP server is required for modules/workers. The Three.js and Lenis versions are pinned in `index.html`; their CDN requires network access. No analytics, form submission, messaging API or tracking is added.

## Modules

- `film.js`: one Points transition draw call, resident target textures, camera keys, scroll spring, caption projection and particle-domain suppression. `uTime` is film T, never wall time. Deterministic camera drift and seeded state builds preserve a fixed-scroll image.
- `shapes.js`: original state registry and target topology. Replacement tags do not resample SVGs into dots. Every state build restores its seeded random generator afterward.
- `vector-world.js`: depth-tested solid apparatus and native editable SVG surface maps in the same world coordinates. Bevelled nickel bodies, open extruded gears, smoked surfaces, precision routes, engraved surfaces. All poses/reveals are functions of T.
- `studio.js`: locally generated softbox environment, key/rim travel, depth haze, seamless rough floor and contact shadows. No external environment image or time loop.
- `assets/*.svg`: fifteen original editable illustrations. They are used as browser-loaded SVG textures on actual world objects, not as point-cloud source images. Three-dimensional occlusion comes from the solid bodies supporting those textures.
- `copy.js`: caption and canvas-fallback wording. `index.html` contains the normal page, still descriptions and contact.
- `polish.css`: ink/porcelain/nickel art direction and restrained normal-page hover/focus responses. Film has no CSS loops.
- `stills/`: six fresh stills from this version for reduced motion and no WebGL2.
- `timeline.mjs`: read-only key/envelope index, including SVG operations and studio envelopes. Example: `node timeline.mjs 38 54`.

## Operation, not idle animation

Scroll advances rack read scans; software layer hand-off; physically turning gears and controller routing; memory read collars; a context bus; source-record retrieval; a paper/check/release sequence; source-pane reads; a source-to-hub planning trace; and conductor routing in the completed system. Camera parallax and travelling studio light reframe these operations. On phones the separated source decks use a compact shared layout in both the worker and solid renderer, with matching caption anchors. Small UI labels use a normal-width system face; the licensed display and reading fonts remain. At a fixed T, all stop. The normal ending is ordinary document flow with keyboard-visible focus and small hover/focus responses, not another scrubbed scene.

## Replacement masks

`__vectors.loaded` becomes true only after every SVG has loaded and geometry has been built. `__vectors.fades` exposes 18 channels:

| Channel | Particle tag | Replacement |
|---|---|---|
| 0..3 | 28..31 | compute / software / rails / control-and-memory |
| 4..11 | 32..39 | hub / links / context bus / tool decks / run surfaces / carriers / valve / memory graph |
| 12..16 | 40..44 | plan / conductor halo / ground / engraved words / opening plate |
| 17 | 24 | routed signal, replacing the original moving spine packets |

Run channel 8 also suppresses the old semantic moving marks 15..18, now replaced by solid records, routed paper and a human-check mark. Masks use the same world-domain fade as their objects. A settled fade of 1 means original particles contribute zero alpha in that domain. Atmosphere and transition paths remain points. If any SVG fails, every replacement mask stays zero and the original particle world remains available; the page does not go blank.

## QA and editing

Run `python3 validate.py` here for static/copy/contact checks. The standalone review artifact also includes `qa/render.py` for headless desktop/phone rendering. Native SVGs can be edited directly; preserve their viewBox and anchor mapping. Use `timeline.mjs` before changing a scene envelope. Bump **every module, worker, asset and still query** together on a later publication; this version uses `v9_2a`.

The exact founder sentence is retained. The sole contact CTA opens the user-provided WhatsApp link, with no prefilled message and no automatic send. Reduced-motion/no-WebGL visitors receive the same argument as stills plus the normal page. The skip link reaches the normal page directly.

## Fonts and licences

Big Shoulders Display by The Big Shoulders Project Authors; Source Serif 4 by Adobe. Font files and their SIL Open Font License texts are preserved in `fonts/`. Native illustrations and procedural geometry are authored for this revision; no stock image or external HDRI is bundled.

## Honest limits

The studio uses analytic contact shadows rather than ray-traced occlusion or physically simulated light. The mechanism is an explanatory illustration, not a simulation of a particular product. Small illustration labels are secondary; main captions and the normal page carry the meaning. A phone cannot show the entire apparatus at desktop detail. Headless software-renderer timings do not establish smoothness on real iOS/Safari, Android, low-power laptops or accessibility zoom; physical-device review remains necessary. CDN failure still limits the animated path, though normal HTML and the static narrative remain available.

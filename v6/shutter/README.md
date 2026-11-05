# The Shutter: developer guide

> **v6 (this folder)**: built from `../../v5/shutter/` for gen6 SCRIPT-v3 (authority and proof first). Preview `http://127.0.0.1:8765/v6/shutter/index.html`, cache `?v=v6a`. Changes vs v5:
> - Copy: `copy.js` rewritten (hero, craft range, founder line, agents trio, close card with offer and Book a call). Copy gate: `python3 /workspace/shubham-site-notes/gen6/copycheck.py index.html`.
> - New `craft` state (T 11 to 16.6): five dot objects on the table with stack tags (`CRAFT`, `TAG_WH`, `tagPose`, `craftObject` in shapes.js). Captions may carry `t2:[a,b]` in CARDS (second window); `timeline.mjs` lists them.
> - `agents` state redone (voice note to calendar, chat to order and payment link, ledger to dues with an approve valve; constants `PY`, `CAP`, `VC`, `SHX`, `PLX`, `VX`, `ENV`). Engine wall gains a faint learned memory graph (bg part, trimmed first).
> - Film timing: new CAM/LOOK and SEG chain in film.js; `UNIT_VH` 22 desktop, 20 mobile.
> The v5 notes below still describe the engine; scene T ranges below are v5 ones (run `node timeline.mjs` for v6 anchors).

Hand-coded scroll film (three.js 0.170 + custom GLSL, Lenis). ~131k to 1.3M dots draw every scene and re-form into the next. Master guide: `../../docs/HANDOFF.md`. **This folder is the source of truth**: edit here, preview at `http://127.0.0.1:8765/v5/shutter/index.html` (the box server on 8765 serves the whole `proto-serve` repo). `/workspace/shubham-site-notes/gen5/build/` is an old dev snapshot; do not edit it. The frozen benchmarks are `../shutter-benchmark-1/` and `../shutter-benchmark-2/`; never edit them.

## Files
| File | Role |
|---|---|
| `index.html` | CSS, captions (`p.t` with `data-t`), close block (Book a call, clause, "Shubham Gupta. Delhi.") |
| `film.js` | Engine: tier probe, swarm shader, `SEG` morphs, `CAM`/`LOOK` splines, lights, `HOOKS`, `REV`, captions, scroll spring, adaptive quality, `window.__film` |
| `shapes.js` | Art: `STATES[K]` builders, canvases (sign, chat, app windows, ledger, clock), layout constants (`TABLE`, `WINPOS`, `ER`, `CAP`, `DESK8`...), `CARDS`/`CARDS2` crisp textures |
| `lib.js` | `Part` point buffers, samplers (box, cyl, sphere, tube, dust), noise |
| `worker.js` | Builds states off the main thread |
| `copy.js` | Every word on screen (`COPY` map by key) |
| `bake.mjs` | `node bake.mjs` writes `copy.js` into `index.html` |
| `timeline.mjs` | Read only: `node timeline.mjs 42 57` lists every timing anchor in that T window, across all files |

## Scene table (film T = 0..100, scroll maps linearly to T)
| # | T range | State(s) | Objects | Carried from previous |
|---|---|---|---|---|
| 1 Signboard | 0-10.5 | `dust` -> `front` -> `warehouse` | Dust settles into SHUBHAM GUPTA on the tin sign, bulb, padlock; shutter rolls up | (opening) dust |
| 2 Warehouse | 10.5-20 | `warehouse` | Racks, cartons, packing table, ledger, phone | the shutter drum and front frame |
| 3 Everything rings | 16.5-36 | `phone`, `windows` | Phone lifts, WhatsApp-style chat; Shopify, Razorpay, sheet, inbox windows peel off | the phone on the table |
| 4 Night shift | 36-46 | `night` | Windows fall on the table, red copy strokes, ledger, clock, chair, tea | the windows |
| 5 Blueprint | 47-56 | `lines`, `blueprint` | Strokes straighten into ruled lines, tools become boxes on a system drawing | the strokes and the windows (as boxes) |
| 6 Engine room | 56-68 | `engine` | Drawing extrudes into racks, cables, database wall; packets flow | the drawing |
| 7 Agents | 64-80 | `agents` | Three agents on one pipeline: order -> box off shelf, payment link -> PAID, voice note -> calendar slot, approval tick | the packets |
| 8 It runs | 80-89 | `calm` | Calm warehouse/counter, ledger closed, "The month closes itself." | what the pipelines carried |
| 9 Invitation | 86-100 | `shutterDown`, `sign2` | Shutter comes down with industries slat; sign repaints "Bring the operation."; close | the sign from scene 1 |

States are named: `defState('name',()=>({parts,fill}))` in `shapes.js` registers `K.name`. Exact morph windows are the `SEG` list in `film.js` (`S(K.a,K.b,t0,t1,...)`, one line each with a comment).

## Copy map
- Words live only in `copy.js` (`COPY` map by key). After editing it run `node bake.mjs` so `index.html` carries the text without JS (the page also fills from `copy.js` at load).
- Caption placement is in `index.html`: `<p class="t" data-copy="key" data-t="a,b">` (`data-t` visible T range, `data-anchor` 3D point, `data-manchor` mobile, `data-dy` pixel nudge, `data-span` width fit). Sign text is painted in `shapes.js` (`drawSign`/`signText`, from `COPY.sign`).
- Rules: keep the founder line, the clause (word for word), "Book a call" link and Delhi line; no numbers; run `python3 /workspace/shubham-site-notes/gen4/copycheck.py index.html`.

## How to tweak
- Timing: shift a caption's `data-t`, a `SEG` t0/t1, and matching `CAM`/`LOOK` keys together.
- Camera: edit `CAM`/`LOOK` keys (Catmull-Rom Hermite spline, never stops between keys).
- Morph feel: `spread` (front sharpness), `noise` (keep low, high = cloudy), `arc`, `snap` (lattice), `axes` (staged moves).
- Dots and scenes: see the two sections below.
- Debug: `window.__film.set(T)`, `.N`, `.TIER`, `.NS`, `.NSLOT`, `.level()`. Add `?hud` to the URL for a live readout (dots, level, fps, dpr, probe ms, reasons, renderer).

## Change the dot count
The swarm is one draw call. Dot `i` is `gl_VertexID` and keeps its ID in every state, which is what makes things morph instead of cross-fade. All counts are in `film.js` unless noted.

**Where the count comes from (`pickTier`)**
1. `TIERS`: the candidate counts, biggest first. Desktop `[1310720,655360,262144,131072]`, phone `[131072,65536,32768]` (`MOBILE` = short side < 768 and width < 900).
2. Caps: a software renderer gets the last tier; `maxTex<8192`, low `deviceMemory`, and few cores lower `cap`. Memory and core counts are ignored when `masked` (Brave, or a renderer string with no known GPU vendor), because those browsers fake them.
3. `gpuProbe`: times a probe draw (median of 5) minus the readback latency (median of a 1024-point draw), so slow `readPixels` on some drivers does not count as slow drawing. A tier is accepted when `per*t` is under 7 ms (desktop) or 6 ms (phone).
4. Strong-GPU floor: Macs and named desktop GPUs (apple, nvidia, geforce, radeon, rtx, arc) never go below 655360 when `cap` allows it. Brave on a Mac hides the GPU name, so the Mac check uses the user agent.
5. `?dots=N` overrides everything (rounded to a multiple of 2048, clamped to 8192..4194304). Use it for testing a count before you put it in `TIERS`.

**Checklist**
- [ ] Every tier is a multiple of `TW` (2048). The page logs a console error if not (the state textures are `TW` wide, `ROWS=N/TW`).
- [ ] Try the new count with `?dots=N&hud` first: smooth scroll, no console errors, `window.__film.NSLOT` as expected.
- [ ] Edit `TIERS`. If you add a tier above 655360, also look at the caps in `pickTier` (they are plain numbers like 655360 and 262144) and the strong-GPU floor (`N=655360`).
- [ ] Shapes need no edit: every part count is written for 131072 dots and multiplied by `SCALE=N/131072` (`Math.round(7000*SCALE)`). Canvas art gets sharper with `RES` above 262144 dots.
- [ ] Re-check adaptive quality: `FLOOR` (78000 desktop, 19000 phone) and `DROPS` decide how far a struggling device can thin the swarm.
- [ ] Bump `?v=` (see Cache busting) and publish.

**Pitfalls**
- Memory: each resident state costs `N*20` bytes. `NSLOT=min(NS,max(4,floor(56e6/(N*20))))`, so at 1.3M dots only 4 states stay resident and the worker rebuilds the rest as the reader scrolls (cards and morphs wait on the nearest built state). At 4M dots that floor of 4 is still about 335 MB of textures.
- Build time grows with `N`; `window.__film.BUILD_MS` shows it. The first two states (`SEG[0]`) must build before the page shows anything.
- Point size: `uSzK=(131072/N)^0.42` shrinks dots as the count rises and `uMinPx` (1.0 above 262144) keeps them visible. If a new tier looks too dense or too dusty, tune these, not the shapes.
- Adaptive quality only steps in after `WARM_MS` and once all states are built. A frame-time average over 40 ms counts as slow, so a steady 30 fps does not thin the swarm. Step 1 drops the pixel ratio to 1, later steps hide `DROPS` fractions of the dots.

## Change scenes (add, remove, reorder, retime)
A scene is one **state** (a dot layout) plus the **timeline** around it. The engine (shader, morph, worker, scroll, quality) does not change.

**Pieces**
- State, in `shapes.js`: `defState('name',()=>({parts,fill}))`. `parts` is a list of `Part` point buffers (`lib.js` samplers: box, cyl, sphere, tube, dust, `sampleCanvas`); `fill(part,n)` pads the rest of the dots (usually dust). `assemble` places pinned parts (`part.at`), fills the rest, trims `bg` parts first when over budget, and sorts the rest spatially. `K.name` is the state's index.
- Morph, in `film.js` `SEG`: `S(K.a,K.b,t0,t1,mode,o,dir,spread,noise,{arc,snap,axes,useB})` morphs state a into b from T `t0` to `t1`. Between morphs the film holds on `b`.
- Timeline, all in absolute film T (0..`FILM_END`): camera `CAM`/`LOOK`, `SIZE`, lights `BULB1`/`BULB2`/`AMB`/`TOP`/`BOT`, mobile camera `MK`/`MLY`/`MLX`, offsets `OFFA`/`OFFB`/`OFFC`, reveals `REV`, inline T numbers in `HOOKS` and `frame()` (clock hands, ledger page, flows), crisp cards `t:[in0,in1,out0,out1]` in `CARDS`/`CARDS2` (`shapes.js`), and captions `data-t` (`index.html`).
- `node timeline.mjs A B` prints every one of those anchors between T=A and T=B with file and line. Run it before and after any retime.

**Add a scene**
1. In `shapes.js`, add `defState('myScene',()=>{const parts=[];...;return{parts,fill:fillDust(...)}})` where it belongs in film order (the order only matters for the loading fallback). Size parts for 131072 dots times `SCALE`.
2. In `SEG`, split one morph into two: `S(K.calm,K.shutterDown,86.4,90,...)` becomes `S(K.calm,K.myScene,86.4,88,...)` and `S(K.myScene,K.shutterDown,88.4,90,...)`.
3. Point the camera at it: add `CAM`/`LOOK` keys (and `MK`/`MLY`/`MLX` for phones) in that window, then `SIZE` and light keys if the mood changes.
4. Add its caption to `copy.js`, a `<p class="t" data-copy="key" data-t="a,b">` in `index.html`, run `node bake.mjs`.
5. Keep one element that carries over from the scene before (pin it with `part.at`, see pitfalls).

**Remove a scene**
1. Join its two morphs in `SEG`: `S(K.night,K.lines,...)` + `S(K.lines,K.blueprint,...)` becomes `S(K.night,K.blueprint,42.4,50.5,...)`.
2. Delete only its `defState('name',...)` statement. Leave the constants and helpers around it (`Y0`, `BP`, `BOXES6`...): other states use them. If you keep the state, the console warns "states built but not in SEG" and it still costs build time and memory.
3. Remove or move its captions, cards, `REV` groups and inline hook times (`node timeline.mjs` over its old window lists them).

**Reorder**: reorder the `SEG` lines so the chain still reads a->b, b->c in rising T, then retime. Optionally move the `defState` blocks into the new film order.

**Retime**
- One scene: move every anchor that `node timeline.mjs` lists in its window together.
- Whole film slower or faster: change `UNIT_VH` (viewport heights of scroll per film unit) instead of touching T values.
- Longer film: raise `FILM_END` and add keys past 100. The close block fades in on the extra scroll after the film ends (`closeTarget`), and the last caption (`95,101`) runs past the old end, so move it too.

**Checklist**
- [ ] `SEG` is one chain: each line starts on the previous line's `B`, `t1>t0`, and no overlap. The page logs a console warning when it is not.
- [ ] Every state is used in `SEG` (no "built but not in SEG" warning).
- [ ] `node timeline.mjs` over the changed window: camera, lights, captions, cards and hooks all moved.
- [ ] `node bake.mjs` after copy edits; `python3 /workspace/shubham-site-notes/gen4/copycheck.py index.html`.
- [ ] Headless check: no console errors, frames at desktop and phone size (see Verify).
- [ ] Bump `?v=` everywhere and publish.

**Pitfalls**
- Stable dot IDs: a dot morphs to whatever sits at the same index in the next state. Unpinned parts are spread by position, so an object that must visibly travel between scenes needs the same `part.at` start in both states. Current pins (in 131072 units, scaled by `SCALE`): 0 (shutter, roll, windows, pile, boxes), 60000 (phone), 80000 (chat bubbles, strokes). Pinned ranges must not overlap within a state.
- Group ids live in the integer part of the point's `.w`: 1 dust, 2-15 reveal windows (`REV`/`uWin`), 4 blink, 6-7 clock hands, 8 ledger page, 9-10 bulbs, 12 twinkle, 16-23 offsets (`uOff`), 24-27 flows (`uFlow`). Reuse a group only for the same behaviour, or pick a free one, or the new dots will blink, swing or slide.
- Worker build order: the worker builds `SEG[0]`'s two states first, then the states near the reader, then the rest if they fit. Until a state is built the morph holds on the nearest built state by index, which is why `defState` order should follow the film.
- `NS` is `STATES.length`. More states means more build time and more memory; at high dot counts only `NSLOT` are resident.
- Copy: text edited in `index.html` is overwritten by `node bake.mjs`. Edit `copy.js`.
- No em dashes in copy.

## Verify before publishing
`/home/box/.venvs/bulbul-dash/bin/python /workspace/shubham-site-notes/gen5/build/test.py http://127.0.0.1:8765/v5/shutter/index.html all 0.02` (pass the URL; the default points at an old path) (2% frames at 1440 and 390, text audit, console errors, fps), then a filmstrip with `montage.py`. See HANDOFF.md section 6.

## Cache busting
All relative module URLs (index.html scripts, imports in film.js, shapes.js, worker.js, and the Worker URL) carry `?v=<version>`. GitHub Pages caches files for 10 minutes and browsers can mix old and new modules, so bump the version everywhere on every publish: `sed -i -E "s#\?v=[a-z0-9]+#?v=NEW#g" index.html film.js shapes.js worker.js`, then `grep -o '?v=[a-z0-9]*' *.js index.html | sort | uniq -c` should show a single version. Current: `s6`.

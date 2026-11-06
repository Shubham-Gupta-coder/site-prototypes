# v9: AI, put to work (developer guide)

A scroll film in dots, then a normal page. The film (an evolved version of the v7 machine world) tells one idea:
AI is powerful, but it only does real work when models, data, apps and cloud are joined into one system.
The page after the film lists the broad problems Shubham solves and ends with one contact route.

Open locally: from the repo root run `python3 -m http.server 8765` and open http://127.0.0.1:8765/v9/shutter/.
Live: https://shubham-gupta-coder.github.io/site-prototypes/v9/shutter/

## Page structure (top to bottom)
1. `#intro` (static HTML, visible on first paint): name, headline, one line, "Scroll to explore". It fades out over film T 0.3 to 2.2 (`frame()` in `film.js`).
2. The film: a fixed `<canvas id="gl">` plus fixed captions (`p.t`), driven by scroll over `#spacer` (`FILM_END*UNIT_VH+130` viewport heights).
3. `main.end#problems`: normal page flow that scrolls up over the canvas after the film (problems, how I work, proof, contact, footer). Its SVG micro-animations are CSS only, started by an IntersectionObserver that adds `.in` to each `.row`. Once the ending covers the screen the film stops drawing.
4. `#still`: six images with captions, shown instead of the film when WebGL2 is missing, the reader prefers reduced motion, or the engine fails to load (the page adds `body.nogl`). The engine is then never downloaded.

The skip link ("Skip to the problems I solve") is the first Tab stop and jumps to `#problems`. Each problem row is focusable.

## Scene table (film T 0..100, scroll maps linearly to T)
| T | Morph (`SEG`) | What you see | Captions (`copy.js` keys) |
|---|---|---|---|
| 0-12 | `ash`->`forge`->`world` | Dust becomes the nameplate, which sinks into the hub; territories rise | (intro, then the nameplate) |
| 12-27 | `world`->`citadel` | Cloud racks, app towers, agent rail, memory systems; bridges lock to the hub | `cloud` `web` `agents` `systems` `needs` `platform` |
| 35-52 | `citadel`->`runs` | Three runs on the viaduct: voice to meeting, question to record, a sensitive step waits at the valve | `voice` `order` `dues` `shipped` |
| 52-64 | `runs`->`outer` | Separate islands: chat, docs, sheets, inbox, calendar | `meet` `lChat`..`lCal` `glue` |
| 64-74 | `outer`->`etch` | Everything falls flat into one drawing | `method` `signed` `loop` |
| 74-86 | `etch`->`live` | The drawing stands up and runs; islands dock | `build` `learns` |
| 86-100 | `live`->`whole` | A halo of light over the hub threads down to every part; the camera rises to a wide aerial | `finale` |

T 0 to about 85 is the v7 world with new copy and type; the `whole` state, its camera and the whole page after it are new in v9.

## Files
| File | Role |
|---|---|
| `index.html` | All CSS, the intro, captions (`p.t` with `data-t`), the still sequence, the ending, the engine loader |
| `copy.js` | Words used by the film (`COPY` map). The ending text is plain HTML in `index.html` |
| `film.js` | Engine: tier probe, swarm shader, `SEG` morphs, `CAM`/`LOOK` splines, lights, `HOOKS`, `REV`, captions, scroll spring, adaptive quality, intro fade, `window.__film` |
| `shapes.js` | Art: `defState` builders (`ash` ... `whole`), canvases painted into dots (nameplate, chat, docs, report card, island windows), `CARDS` crisp textures, `FONT` |
| `lib.js` | `Part` point buffers, samplers, `assemble` (pins, budget, spatial sort) |
| `worker.js` | Builds states off the main thread (loads the display font itself) |
| `bake.mjs` | `node bake.mjs` writes `copy.js` text into `index.html` (fails on an unknown key) |
| `timeline.mjs` | Read only: `node timeline.mjs 42 57` lists every timing anchor in that T window |
| `fonts/` | Big Shoulders Display (variable, subset) for display, Source Serif 4 for reading; OFL licences beside them |
| `stills/` | The six fallback images (1600x900 JPEG) |

## Edit the copy
- Film captions and words painted into the dots: edit `copy.js`, then `node v9/shutter/bake.mjs`. Keep captions short; they sit over moving art.
- Intro: `introH`, `introP`, `introCue` in `copy.js` (baked into `#intro`).
- Ending (problems, how I work, proof, contact) and the still captions: edit `index.html` directly.
- Painted text (nameplate, chat, docs window, report card, drum plaques) is drawn in `shapes.js` from `COPY.sign`, `chatApp`, `chatAsk`, `payTitle`, `payButton`, `payBrand`, `plaques`, `paid`. After changing these, check the frames: long words can overflow a canvas.
- Rules (checked by `tools/validate.py`): no digits in visible text, the founder line exactly once and word for word, one external link (LinkedIn), no commerce or payment words, no em dashes.
- Caption placement: `data-t` (visible T range), `data-anchor` (3D point the caption follows), `data-manchor` (phone), `data-dy`, `data-span`. Classes: `carve` (territory label), `ttl` (title), `fin` (finale size), `low`/`top` (pinned), `note`, `tick`, `label`, `tblock`.

## Edit the fonts
- Display face: `fonts/BigShouldersDisplay.woff` (variable weight 100-900). It is used in three places: CSS `--disp` and the `@font-face` in `index.html`, `FONT` in `shapes.js` (canvas art), and the worker font load in `film.js` (search `BigShouldersDisplay`). Change all three together, plus the preload link in the head.
- The woff is a Latin subset. If you add characters outside it (for example another script), re-subset from the full font: `pyftsubset BigShouldersDisplay[wght].ttf --unicodes="U+0020-007E,U+00A0-00FF,U+2018-201F,U+2026,U+00B7,U+2192" --flavor=woff --output-file=BigShouldersDisplay.woff` (`pip install fonttools`).
- Reading face: `fonts/SourceSerif4*.woff`, CSS `--read`.

## Edit the finale and ending
- `whole` state: `defState('whole',...)` in `shapes.js` (`HALO` radius and height, `TERR` thread targets). Halo rings are hero points; the threads are a backdrop part (`new Part(n,true)`) that is thinned first on small tiers.
- Finale camera: last keys of `CAM` and `LOOK` (T 85.5 to 100), phone distance `MK` (`[90,1.3],[100,1.12]`), lights `BULB2`, dot size `SIZE`.
- Film-to-page hand-off: spacer height in `layout()` (`+130` vh holds the last frame a little before the page rises); the ending's soft top edge is `.end:before`.

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
- Timeline, all in absolute film T (0..`FILM_END`): camera `CAM`/`LOOK`, `SIZE`, lights `BULB1`/`BULB2`/`AMB`/`TOP`/`BOT`, mobile camera `MK`/`MLY`/`MLX`, offsets `OFF*`, reveals `REV`, inline T numbers in `HOOKS` and `frame()` (flows, valve, packets), crisp cards `t:[in0,in1,out0,out1]` in `CARDS`/`CARDS2` (`shapes.js`), and captions `data-t` (`index.html`).
- `node timeline.mjs A B` prints every one of those anchors between T=A and T=B with file and line. Run it before and after any retime.

**Add a scene**
1. In `shapes.js`, add `defState('myScene',()=>{const parts=[];...;return{parts,fill:fillDust(...)}})` where it belongs in film order (the order only matters for the loading fallback). Size parts for 131072 dots times `SCALE`.
2. In `SEG`, split one morph into two: `S(K.live,K.whole,86.4,92,...)` becomes `S(K.live,K.myScene,86.4,89,...)` and `S(K.myScene,K.whole,89.4,92,...)`.
3. Point the camera at it: add `CAM`/`LOOK` keys (and `MK`/`MLY`/`MLX` for phones) in that window, then `SIZE` and light keys if the mood changes.
4. Add its caption to `copy.js`, a `<p class="t" data-copy="key" data-t="a,b">` in `index.html`, run `node bake.mjs`.
5. Keep one element that carries over from the scene before (pin it with `part.at`, see pitfalls).

**Remove a scene**
1. Join its two morphs in `SEG`: `S(K.outer,K.etch,...)` + `S(K.etch,K.live,...)` becomes `S(K.outer,K.live,64,79,...)`.
2. Delete only its `defState('name',...)` statement. Leave the constants and helpers around it (`HUB`, `ISL`, `TRUNKS`...): other states use them. If you keep the state, the console warns "states built but not in SEG" and it still costs build time and memory.
3. Remove or move its captions, cards, `REV` groups and inline hook times (`node timeline.mjs` over its old window lists them).

**Reorder**: reorder the `SEG` lines so the chain still reads a->b, b->c in rising T, then retime. Optionally move the `defState` blocks into the new film order.

**Retime**
- One scene: move every anchor that `node timeline.mjs` lists in its window together.
- Whole film slower or faster: change `UNIT_VH` (viewport heights of scroll per film unit) instead of touching T values.
- Longer film: raise `FILM_END` and add keys past 100. The last caption (`finale`, `92.6,101`) runs past the end, so move it too. The ending (`main.end`) follows the spacer automatically.

**Checklist**
- [ ] `SEG` is one chain: each line starts on the previous line's `B`, `t1>t0`, and no overlap. The page logs a console warning when it is not.
- [ ] Every state is used in `SEG` (no "built but not in SEG" warning).
- [ ] `node timeline.mjs` over the changed window: camera, lights, captions, cards and hooks all moved.
- [ ] `node bake.mjs` after copy edits, then `python3 tools/validate.py` from the repo root.
- [ ] Headless check: no console errors, frames at desktop and phone size (see Verify).
- [ ] Bump `?v=` everywhere and publish.

**Pitfalls**
- Stable dot IDs: a dot morphs to whatever sits at the same index in the next state. Unpinned parts are spread by position, so an object that must visibly travel between scenes needs the same `part.at` start in both states. Current pins (in 131072 units, scaled by `SCALE`): 0 nameplate (14000), 15000 hub (10000), 26000 valve (3000), 30000 spine (10000), 41000 trains (6000), 47000 world (56000). Pinned ranges must not overlap within a state.
- Group ids live in the integer part of the point's `.w`: 1 dust, 2-15 reveal windows (`REV`/`uWin`), 4 blink, 6-7 clock hands, 8 ledger page, 9-10 bulbs, 12 twinkle, 16-23 offsets (`uOff`), 24-27 flows (`uFlow`). Reuse a group only for the same behaviour, or pick a free one, or the new dots will blink, swing or slide.
- Worker build order: the worker builds `SEG[0]`'s two states first, then the states near the reader, then the rest if they fit. Until a state is built the morph holds on the nearest built state by index, which is why `defState` order should follow the film.
- `NS` is `STATES.length`. More states means more build time and more memory; at high dot counts only `NSLOT` are resident.
- Copy: text edited in `index.html` is overwritten by `node bake.mjs`. Edit `copy.js`.
- No em dashes in copy.


## Verify
From the repo root:
```bash
python3 tools/validate.py              # stdlib only: copy rules, copy keys, assets, cache version, licences
node v9/shutter/bake.mjs              # after editing copy.js (works from any folder)
python3 -m http.server 8765 &          # then, optional, with Playwright installed:
python3 tools/smoke.py                 # desktop, phone, reduced motion: errors, failed requests, skip link, screenshots in smoke-out/
```
`smoke.py` uses software WebGL in headless Chrome. It proves the page works; its frame times say nothing about real devices.
For visual review: `window.__film.set(T)` in the console renders any moment (await it), `window.__film.release()` hands control back to scroll.

## Cache busting
Every relative module and asset URL carries `?v=v9a` (index.html, film.js, shapes.js, lib.js, worker.js). GitHub Pages caches for about 10 minutes and browsers can mix old and new modules, so bump it on every publish:
`cd v9/shutter && sed -i -E "s#\?v=v9[a-z]#?v=v9b#g" index.html film.js shapes.js lib.js worker.js`, then `python3 ../../tools/validate.py` (fails on mixed versions). On macOS write `sed -i "" -E ...`.

## Performance
The dot count is picked per device (`pickTier`): up to 1310720 dots on desktop, 131072 on phones, less when a GPU probe is slow, and adaptive quality thins the swarm further if frames stay slow. Numbers here come from code, not from device testing: the film has only been checked in headless Chrome with software WebGL (correct frames, slow). Test on a real phone and a mid-range laptop before calling it smooth.

## Known weaknesses
- Not tested on real phones or GPUs in this round; headless software rendering only.
- Two stretches have no caption (T 34 to 39 trains leave for the viaduct, T 64 to 69 the world falls flat). They are visual beats; add a line if they feel empty.
- The `whole` halo threads are thin at small tiers by design (they are the first points trimmed).
- The still images are rendered at 1600x900 only (no phone crops); on phones they are letterboxed by width.
- Three.js and Lenis load from jsDelivr. If the CDN is blocked, the page waits up to 12 seconds, then shows the stills.
- `SEAL` in `shapes.js` is an unused constant left from v7.

## Next steps
- [ ] Check on a real phone and laptop (Chrome, Safari): scroll feel, dot tier (`?hud`), caption legibility.
- [ ] Read the ending copy aloud; tighten any row that sounds generic.
- [ ] Decide whether the two uncaptioned stretches need a line.
- [ ] Optional: phone-cropped stills (`<picture>` with a 9:16 source).
- [ ] Bump `?v=`, run `tools/validate.py`, publish.


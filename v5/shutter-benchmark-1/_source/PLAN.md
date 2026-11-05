# Round 5 plan: one object, one take, one causal chain

Status: PLAN ONLY. Nothing built, no paid runs. Shubham reviews this first.

## What went wrong in rounds 3 and 4 (his critique, and the cause)

| His critique | Cause in the code | Fix in this plan |
|---|---|---|
| 3D elements are random, they do not match the words | Each scene got its own new object (drops, plates, crystals, tools) chosen for looks | One hero material that is the story itself. Every shape it takes is named by the words on screen |
| Scroll only changes when the next section arrives | ScrollTrigger section enter/leave tweens with holds in between | One progress value `p`; every property is a pure function of `p`; no dead zones |
| Laggy | Many meshes, many lights, DPR 2, DOM text animating layout and filters | One renderer, one particle draw call, DPR capped at 1.5, DOM moves by transform/opacity only |
| No consistent story | Scenes were independent ideas | A Spider-Man style chain: every scene is grown from an element of the scene before it, and the "carried element" is named in the table |

---

## A) Story spine and hero

**Spine (one line):** A company collects tools that do not remember each other, a person becomes the glue, and Shubham builds the one memory that lets the business run on its own.

That is his belief from WHO.md, word for word in spirit: "AI capability is not the bottleneck. Orchestration is. ... The operator becomes the glue. He builds the layer that removes the glue."

**Why ONE hero object.** The critique is that things feel random. Randomness comes from introducing new objects. If one material is on screen from the first pixel to the last, and only its shape changes, the visitor reads every change as cause and effect. Like the Spider-Man chain (spider, web, mask, suit), each scene is the previous scene's material reorganised, so a transformation can never feel unmotivated.

### Candidate hero concepts

1. **Dust and Lamp (RECOMMENDED).** The hero is one field of 65,536 particles of dust lit by one warm lamp. Dust is the business's scattered information; the lamp is him (human trace, never a person, FEEL.md). The dust forms his name, scatters into separate tools that do not touch, is carried between them by hand along oxide traces (the glue), settles into one bound memory, runs as a working system, does three jobs, and finally becomes the window with the lamp burning in it at night (a loved pick). Rationale: this is literally his belief told as physics. Information that is scattered becomes information that remembers. Dust in a beam and a lamp in a window are already in FEEL.md and the loved picks, so it is on brief, and it is not mercury, plates, crystals or thread. Technically it is the best fit for "every cm changes": a fixed particle count can morph from any shape to any shape continuously, scrubbed forward and back like video, in a single draw call.

2. **The Ingot.** One bar of brushed steel. His name is stamped into it (the press pick), it is sawn into separate plates (the tools), clamped together by one bracket (him as glue), fused back into one block (the memory), machined into a press that stamps three outcomes, and ends as a nameplate beside a door. Rationale: steel matches "quiet machinery", and the arc of cutting and fusing is clear. Weaker because rigid metal cannot morph continuously without looking like a cut, and it sits close to the existing steel film.

3. **The Sheet.** One sheet of fibred paper. It is a business's sheet that tears into slips (tools that do not agree, WORK.md: "sheets that do not agree, pulled into one place"), slips are carried and pinned by hand, then folded and bound into one ledger (the memory), whose pages fold into three working objects, and the last page becomes the card that carries the clause. Rationale: paper and oxide is his earlier draft's palette and the story is honest. Weaker in 3D wow, paper folding is costly to simulate and reads as craft rather than machine.

**Recommendation: Dust and Lamp.** It carries the story most literally, it is the most original against everything built so far, it is the cheapest to run smoothly, and it is the only one where morphing is truly continuous.

---

## B) Dust and Lamp: the scene chain

Global facts for every scene:
- Hero: 65,536 dust particles (16,384 on mobile), bone and warm ivory, lit from one lamp. Points sprite with soft falloff, size by depth, grain.
- The lamp: one warm point (2700K) with a volumetric beam. It is the only warm source on the page. It is him.
- Page length: about 1400vh desktop, 1100vh mobile. One continuous camera spline.
- Accent: oxide red `#7E2A18` for hairlines only (the glue traces, the Book a call underline).
- Type: Playfair Display for display, a condensed grotesk for the tiny lower-third lines. Display words are either built from dust (WebGL) or set in DOM with `background-clip: text` filled by the lit-dust texture so the letters look made of the same material.

### Scene table

| # | Scroll `p` | Starts as | Ends as | How it morphs | Carried element (persists, becomes the seed of the next) | Story meaning | On-screen words, and how type is the graphic | Camera | Background / shader | Parallax layers |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 Dust | 0 to 12% | Loose dust floating in a single lamp beam in a dark plaster room. The lamp at frame right. | The dust has settled into the letters SHUBHAM GUPTA, standing in the beam, a third of the frame wide | Every particle interpolates from a random beam volume to points sampled on Playfair glyph outlines and fills (canvas sampled at load). Staggered by x so the name assembles left to right as the light rakes across | **The name, made of dust** | He starts in the room. The lamp (him) finds the material, and the material becomes a name. The loud thing is the name, per FEEL.md | SHUBHAM GUPTA is the dust itself. Lower third, small grotesk, fades in at 8%: "I build the AI that runs businesses." | Slow dolly in from 9m to 6m, slight drift right toward the lamp | Warm plaster wall, grain, vignette, beam cone shader with dust scattering | L0 wall 0.2x, L1 name 1x, L2 near motes in focus blur 1.6x, L3 the lower third line 1.1x |
| 2 Tools | 12 to 26% | The name of dust | Eight separate dust islands, each the silhouette of a business tool: a ledger page, a chat bubble, a cart, a calendar page, a storefront, an inbox envelope, a chart, a phone. Gaps of dark between them | Letters pull apart along their own vectors. Each glyph's particles are reassigned to one island (fixed mapping, so it is the same dust). Each island gets its own faint cold glow (4000K, low), only the lamp stays warm | **Eight islands that do not touch** | A company collects tools. None of them remember the others. The name breaking into tools says he came from the business side first: he knows these tools | "A company collects tools." then at 20%: "None of them remember the others." Set in Playfair, each phrase clipped by the dust texture, placed in the dark gap between islands, so the words sit where the missing connection should be | Pull back and tilt down to see the islands spread on a dark floor like a plan view | Wall cools, warm beam narrows to the lamp only, small cold halos per island | L0 wall, L1 islands, L2 a few loose motes drifting between islands (the gap made visible), L3 type in the gaps |
| 3 Glue | 26 to 40% | Eight separate islands | Eight islands joined by a tangle of oxide hairline traces that loop, double back and overlap | The lamp leaves its spot and travels island to island along a spline. Behind it, 15% of the particles peel off each island and line up along its path as oxide traces. The path visibly repeats (same islands visited again) | **The oxide traces (the glue), and the lamp now among the islands** | The operator becomes the glue. A person carrying information between tools by hand. He did this job, he learned how a company sells before he built the machine (WHO.md) | "The operator becomes the glue." then at 35%: "I did that job first." The second line is written by the trace itself, one stroke drawn in oxide dust that resolves into Playfair italic | Follows the lamp at low height, a tracking shot between the islands, slight handheld sway as a function of `p` (not time) | Darker, oxide hairlines glow faintly, beam now a moving cone | L1 islands, L2 traces at mid depth, foreground islands pass close to camera (strong parallax), L3 the hand-drawn line |
| 4 Memory | 40 to 54% | The tangle of traces with islands at the ends | One bound volume at the centre: a block of fine strata, like a ledger seen edge on, built from all the traces. The islands now sit around it, each tied to it by one straight filament | The tangled traces contract to the centre and lay down as horizontal strata, layer by layer (stack height = scroll). The loops straighten into eight single filaments. Lamp returns above the block and lights it from the top | **The strata block (one memory) and its eight straight filaments** | He builds the layer that removes the glue: one memory. The mess of hand carrying becomes a single structure everything writes to | "So I built one memory." Engraved into the edge of the strata block (troika SDF text in 3D, lit by the lamp, raking light finds the letters) | Crane up and over the block, settling at a three-quarter view | Beam becomes a downlight onto the block, wall recedes to near black, warm tone returns | L0 wall, L1 block and islands, L2 dust settling onto the block from above, L3 none (the words are in the object) |
| 5 Running | 54 to 68% | The memory block with eight static filaments | A running system: pulses of light travel along the filaments, islands shrink to small sockets, and a tool forms at a filament end only when a pulse reaches it, then dissolves back into the filament | Pulses are particles sliding along filament curves, offset by `p`. Tool shapes (from scene 2) re-form at the filament end at a pulse and fall back, so you see "tools arrive when the work needs them". Strata block slowly rotates 40 degrees | **Pulses travelling outward along three of the filaments** | A company that runs. Work moving without him typing. Tools load on demand. This is Verslay, which he built end to end | "Tools arrive when the work needs them." Then, at 63%, the subline across the lower third: "Verslay's only technical founder. I built the entire platform. My co-founder runs sales." The subline sits on a dark plate so it is always readable | Slow orbit around the block, 40 degrees, holding the lamp in frame | Faint cool night tone enters the far wall (the window to come), pulses warm | L1 system, L2 pulses near camera, L3 subline 1.05x |
| 6 Three jobs | 68 to 86% | Three pulses leaving the system along three long filaments | Three working objects at the ends of those filaments, each doing one thing: (a) a ledger page that fills and turns shut, a month closing; (b) a voice waveform that folds into a calendar block and slides one slot, after a small oxide tick (the approval); (c) a field of small points that answer in a wave, a fleet replying | Each pulse grows into its object from the pulse particles (no new material). The camera visits them one by one (68 to 74, 74 to 80, 80 to 86). Each object completes its action fully inside its range, scrubbed | **Three finished outcomes, each still connected by its filament back to the memory** | The miracles, from the outside only (SPEC.md): a store's month closing itself, a voice that moves a calendar, a fleet that answers. No depth, no client names | One short line per object, set beside it in Playfair: "A store's month closes itself." / "A voice moves a calendar. A person says yes first." / "A fleet answers." One small grotesk line under the third: "Apparel. D2C. Gifting. Textiles and B2B." | Travelling shot along the filaments from object to object, then a slow pull back at 84 to 86 to show all three tied to the one memory | Night blue grows on the wall behind; the wall begins to read as a window frame | L0 window glass with blue night, L1 objects, L2 filament nearest camera sweeps past, L3 type |
| 7 The lamp in the window | 86 to 100% | The whole system: memory, filaments, three outcomes | A window at night seen from outside, its frame made of the dust, and one lamp burning inside. Book a call on the sill | All particles fold inward: outcomes and filaments retract into the memory, the memory compresses into the lamp's glow, and the remaining dust draws the window frame and mullions. Camera passes out through the window glass and turns back | **The lamp, the same warm point as scene 1** (the loop closes: it was in the room at the start) | The system runs, the lights are on, he is implied by the lamp. The ask: if you have an operation, he can build the one that runs yours | "Bring the operation." in Playfair, filled by the lamp's warm glow via background-clip. Under it: **Book a call** (oxide underline, links to LinkedIn). "The appointment sits on LinkedIn." Then the clause, verbatim, dark ink on a bone card on the sill: "Some of the work on this site was built through Verslay, for Verslay's clients. Those businesses are Verslay's clients, not my personal clients, so they are described by industry rather than by name." | Dolly back out through the window to a fixed final frame. The last screen holds from 97 to 100 | Deep blue night outside, warm lamp inside, grain, no glow except the lamp | L0 night sky, L1 window frame of dust, L2 a few motes in the lamp light, L3 close text on the card |

### The chain in one read (Spider-Man style)

Dust in a beam -> the dust forms his name -> the name breaks into eight tools -> the lamp carries dust between tools, leaving oxide glue -> the glue lays down into one memory with eight filaments -> pulses run along the filaments -> three pulses grow into three finished jobs -> everything folds back into the lamp, and the dust becomes the window it burns in.

Every scene's first frame is literally the previous scene's last frame (same particle positions, same camera pose).

### Copy check (AGENTS.md)

All words on the page, in order:
1. SHUBHAM GUPTA / I build the AI that runs businesses.
2. A company collects tools. / None of them remember the others.
3. The operator becomes the glue. / I did that job first.
4. So I built one memory.
5. Tools arrive when the work needs them. / Verslay's only technical founder. I built the entire platform. My co-founder runs sales.
6. A store's month closes itself. / A voice moves a calendar. A person says yes first. / A fleet answers. / Apparel. D2C. Gifting. Textiles and B2B.
7. Bring the operation. / Book a call / The appointment sits on LinkedIn. / the clause verbatim.

No em dashes, no emoji, no exclamation marks, no client names, no numbers (the "40+ Indian businesses booked a Verslay demo" line is held in reserve, not used), no banned words. Book a call goes to https://www.linkedin.com/in/expert-shubham-gupta/. Run `gen4/copycheck.py` on the built page.

---

## C) Continuity and smoothness spec

**One clock.**
- `raw = scrollY / (scrollHeight - innerHeight)`. Lenis smooths the wheel and touch input (lerp 0.09, smoothWheel on, syncTouch off on iOS).
- A second critically damped spring on `p` (omega about 9 per second) inside the render loop removes jitter from trackpads.
- One `requestAnimationFrame` loop. No ScrollTrigger, no GSAP tweens, no IntersectionObserver triggers, no `setTimeout`.

**Everything is f(p).**
- A timeline module holds keyframe tracks: `track(name, [[p, value, ease], ...])`, sampled every frame. Camera position, camera target, FOV, morph segment and weight, lamp position, beam angle, wall colour temperature, night amount, and every text block's opacity and translate are tracks.
- Scrolling back plays it backward exactly, like scrubbing video.
- The only time-based motion is a tiny ambient breath on dust (amplitude under 1% of scene size). It never carries meaning.
- **Slope rule.** In any 0.5% window of `p`, the camera or the morph must change. No flat plateaus, so every cm of scroll moves something. Text holds overlap camera drift, so the picture keeps moving while words stay readable.

**Morphing.**
- Shape point sets are precomputed at load into float textures (256 x 256 RGBA32F, one per state): beam volume, name glyphs (Playfair sampled from canvas after `document.fonts.load`), eight tool silhouettes, trace paths, strata block plus filaments, the running layout, the three outcomes, and the window frame.
- Particle `i` keeps the same identity across all states, with fixed mapping tables, so the same speck travels the whole film.
- The vertex shader samples state A and state B for the current segment and mixes with `smoothstep`, plus a per-particle delay (`delay = f(position, seed)`) so morphs sweep like a wave instead of popping. Mid-morph curl-noise lift (a function of the local weight) makes the transition look like dust in air.
- No per-frame CPU work on particles: the CPU only writes about 12 uniforms per frame.

**Performance budget.**
- One `WebGLRenderer`, `powerPreference: high-performance`, `antialias: false`, DPR `min(devicePixelRatio, 1.5)`.
- Draw calls under 10:
  - the particles (one `Points`);
  - the beam cone (one additive mesh);
  - the wall (a full-screen quad shader with grain, plaster noise, vignette and colour temperature);
  - the engraved troika text;
  - one composite pass with ACES tone map and grain.
- Half-resolution bloom on desktop only, for the lamp.
- No real-time shadows. Shading is baked into the particle shader from the lamp position.
- Adaptive quality: if the average frame time goes over 20 ms for 1 second, step down to DPR 1.0, then to half the particles.
- DOM text uses `transform` and `opacity` only, with `will-change` set during its range. `background-clip: text` fills are static textures; their glow moves by `transform` on a pseudo-element, never by animating `background-position`. No layout reads inside the loop.
- Target: 60 fps on a mid laptop and 45+ fps on a mid Android.

**Mobile fallback (under 768px).**
- 16,384 particles, DPR 1, no bloom.
- FOV widened so the name fits at 390px, and all lines move to the lower third on a dark plate.
- `prefers-reduced-motion` or no WebGL2 shows seven still frames (pre-rendered PNGs of each scene's end state) with the same words, plus the close.

**Readable text, always.**
- Each text block has an in-ramp (0.8% of `p`), a hold, and an out-ramp (0.8%). No two text blocks are on screen at once.
- Optional settle (off by default): if scrolling stops inside a ramp, Lenis eases to the hold edge after 300 ms.
- Behind every DOM line, the wall shader darkens a soft local plate. Body lines get contrast of at least 7:1 and display lines at least 4.5:1.
- Minimum sizes: 18px for lower-third lines, 15px for the clause.

---

## D) Build approach

**Hand-coded, not OpenDesign Haiku.** The Haiku runs gave section-triggered tweens and picked objects for looks. This film depends on one timeline and on fixed particle identity across states, which needs tight control.

- Stack: three.js (ESM from CDN), Lenis, troika-three-text, a single `index.html` with `film.js`, `shapes.js` and `timeline.js`. Playfair Display from Google Fonts, with `noindex` kept.
- Publish to `site-prototypes/v5/dust/`.
- Stages, each checked with a filmstrip of 50 screenshots at `p` = 0, 2, 4 ... 100% at 1440 and 390 widths, plus a performance trace:
  1. Engine: Lenis, the `p` spring, the timeline, and particles morphing through 8 placeholder shapes. Prove continuity and fps first.
  2. Real shapes and the camera spline for all seven scenes. **Checkpoint: send Shubham the filmstrip.**
  3. Lamp, beam, wall shader, night window, grain, tone map.
  4. Type: dust name, clipped Playfair lines, engraved memory line, close card, Book a call.
  5. Mobile, reduced motion, the copy check, and an fps pass.
- Cost: $0 in paid generation, because no OpenDesign or Haiku runs are needed. Time: about 5 to 7 hours of build work across the five stages, with a reviewable filmstrip after stage 2 (about 2 to 3 hours in).
- Optional, only if he wants it: one Haiku run (about $1 to $2) for a static style frame of scene 1 as a mood check. It is not needed.

## Open questions for Shubham (short)

1. Dust and Lamp, or the Ingot or the Sheet?
2. Scene 3 line "I did that job first.": keep it, or drop it?
3. Use the one allowed figure ("40+ Indian businesses booked a Verslay demo") in scene 5, or leave the page with no numbers?

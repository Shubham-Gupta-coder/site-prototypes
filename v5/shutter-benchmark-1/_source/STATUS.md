# Round 5 The Shutter: STATUS
- 08:22 IST start. Stage A (engine + scenes 1-4). Reading AGENTS.md, gen4 scripts.
- Design decisions (stage A): one big state texture stack (K0 dust, K1 godown front, K2 warehouse, K3 phone chat, K4 tool windows, K5 night shift, K6 ruled lines), gl_VertexID lookup, per-point group+reveal (wT.w), sweep-delay morph + mid-morph noise, all f(p). Art = canvas illustrations + procedural boxes/cylinders sampled in-browser at load. DOM type projected onto 3D anchors.
- Files: build/index.html, build/film.js (engine), build/shapes.js (art), build/test.py (shots/fps)

## 08:43 IST: Stage A built and pushed
- build/: film.js (engine), lib.js, shapes.js, index.html, test.py, montage.py
- Audit (scenes3-style, 2% steps, 1440 and 390): clean, no console errors. copycheck: only MISSING delhi (expected).
- FPS (SwiftShader CPU, no GPU): desktop ~35 avg (adaptive dropped to level 2), mobile emu 59.7.
- Filmstrip: gen5/filmstrip-1-4.png (24 frames, q 0 to 0.92)
- Published: proto-serve/v5/shutter/ (commit 2831f35 + heading fix). Waiting for Pages.
- 08:44 IST: Pages live, /v5/shutter/ HTTP 200. STOP: awaiting filmstrip review before scenes 5-9.

## 08:50 IST: Round 5b started (Phase 1 sharpen 1-4, Phase 2 scenes 5-9)
- Backup of Stage A at gen5/build-stageA/.
- Plan P1: crisp canvas "cards" (textured planes, halftone dissolve = f(T)) over window/pile dots; structured morphs (ordered sweep, staged axis moves, lattice snap, arc lift; low noise); chair+tea bigger/lit; mobile 4-window column; priority budget (bg parts trimmed first, heroes kept); TW 1024; CPU per-frame trims; line+dot cue.
- Delhi line per gen2/NARRATIVE.md footer: "Shubham Gupta. Delhi." (goes in the close, phase 2).

## 2026-11-05 09:03 IST  Phase 1 (scenes 1-4 sharpened) PUBLISHED, commit 19c44d5
- Windows: crisp CanvasTexture cards (Shopify grid, Razorpay payment card, WhatsApp chat, generic sheet grid, generic inbox) with halftone dissolve; dots assemble/dissolve them. 5 window cards + 8 pile cards = 13 extra draw calls besides the swarm.
- Morphs: structured shader (axis staging, lattice snap, arcs, ordered sweeps). Chair moved to [1.95,-3.5,-3.85] in frame; tea glass amber with sparse fluted skin + saucer.
- Mobile: 4-window column (chat hidden), phone at [0.66,-2.78]. Hint is a line+dot cue, no words.
- Verify: 2% both widths, no console errors, audit clean. FPS (SwiftShader software GL): desktop 29.3 avg (level 2), mobile 59.6; JS 0.2 ms/frame median.
- Filmstrip: gen5/filmstrip-1-4-v2.png. Copycheck only flags missing "delhi" (Phase 2 close).
- NEXT: Phase 2 (K7-K11, FILM_END 100, close copy).

## Phase 2 checkpoint (Nov 5, in progress)
- Code written (not yet verified/published): shapes.js K7 blueprint, K8 engine room, K9 three jobs, K10 calm counter, K11 shutter down, K12 signboard two lines, CARDS2; film.js FILM_END 100 + SEG/CAM/LOOK/lights/REV/HOOKS; index.html scene 5-9 text, close rewritten (founder line, Shubham Gupta. Delhi., no placeholder), inline scroll listener removed.
- Backups of Phase 1 build: /tmp/shapes.phase1.js /tmp/film.phase1.js /tmp/index.phase1.html (published Phase 1 = proto-serve v5/shutter commit 19c44d5).
- Next: shotT checks at 48..100, fix, test.py both widths, filmstrip-full.png, publish, report.

## Phase 2 DONE (Nov 5, 09:26 IST)
- Published proto-serve commit 35e9a54 -> https://shubham-gupta-coder.github.io/site-prototypes/v5/shutter/ (200, contains "Bring the operation." and "Shubham Gupta. Delhi.", placeholder gone).
- Verify: every 2% at 1440x900 and 390x844, 0 console errors, 0 audit flags desktop (mobile tblock min font raised to 15px after last run). Shots: shots/p2-{d,m}-000..100.png.
- Filmstrips: filmstrip-full.png (36 desktop), filmstrip-full-mobile.png (36 mobile).
- FPS (SwiftShader headless): desktop 29.9 avg, median 33.3ms, p95 50ms, adaptive level 2; mobile 59.9, median 16.7ms; JS frame() median 0.2ms.
- Point budgets: states 2,3,5,6,10 over budget -> background parts trimmed (keepB .67-.91 desktop); state 2 heroes trimmed 5% (pre-existing).
- Weaknesses: morph midpoints cloudy (66, 81, 88); mobile scene 7 stations small; warehouse shelf reads as orange dot grid; rack cables read as stylised zigzags; scene 8 dark.

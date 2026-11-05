# The Shutter: developer guide

Hand-coded scroll film (three.js 0.170 + custom GLSL, Lenis). ~131k to 1.3M dots draw every scene and re-form into the next. Master guide: `../../docs/HANDOFF.md`. Dev copy: `/workspace/shubham-site-notes/gen5/build/` (served at `127.0.0.1:8765`); this folder is the published copy. The frozen benchmark is `../shutter-benchmark-1/`; never edit it.

## Files
| File | Role |
|---|---|
| `index.html` | CSS, captions (`p.t` with `data-t`), close block (Book a call, clause, "Shubham Gupta. Delhi.") |
| `film.js` | Engine: tier probe, swarm shader, `SEG` morphs, `CAM`/`LOOK` splines, lights, `HOOKS`, `REV`, captions, scroll spring, adaptive quality, `window.__film` |
| `shapes.js` | Art: `STATES[K]` builders, canvases (sign, chat, app windows, ledger, clock), layout constants (`TABLE`, `WINPOS`, `ER`, `CAP`, `DESK8`...), `CARDS`/`CARDS2` crisp textures |
| `lib.js` | `Part` point buffers, samplers (box, cyl, sphere, tube, dust), noise |
| `worker.js` | Builds states off the main thread |

## Scene table (film T = 0..100, scroll maps linearly to T)
| # | T range | State(s) | Objects | Carried from previous |
|---|---|---|---|---|
| 1 Signboard | 0-10.5 | K0 dust -> K1 godown front -> K2 | Dust settles into SHUBHAM GUPTA on the tin sign, bulb, padlock; shutter rolls up | (opening) dust |
| 2 Warehouse | 10.5-20 | K2 | Racks, cartons, packing table, ledger, phone | the shutter drum and front frame |
| 3 Everything rings | 16.5-36 | K3 phone chat, K4 tool windows | Phone lifts, WhatsApp-style chat; Shopify, Razorpay, sheet, inbox windows peel off | the phone on the table |
| 4 Night shift | 36-46 | K5 | Windows fall on the table, red copy strokes, ledger, clock, chair, tea | the windows |
| 5 Blueprint | 47-56 | K6 ruled lines, K7 blueprint | Strokes straighten into ruled lines, tools become boxes on a system drawing | the strokes and the windows (as boxes) |
| 6 Engine room | 56-68 | K8 | Drawing extrudes into racks, cables, database wall; packets flow | the drawing |
| 7 Agents | 64-80 | K9 | Three agents on one pipeline: order -> box off shelf, payment link -> PAID, voice note -> calendar slot, approval tick | the packets |
| 8 It runs | 80-89 | K10 | Calm warehouse/counter, ledger closed, "The month closes itself." | what the pipelines carried |
| 9 Invitation | 86-100 | K11 shutter down, K12 signboard | Shutter comes down with industries slat; sign repaints "Bring the operation."; close | the sign from scene 1 |

Exact morph windows are the `SEG` list in `film.js` (`S(A,B,t0,t1,...)`, one line each with a comment).

## Copy map
- Published version: captions are in `index.html` lines ~65-92 (`data-t="a,b"` visible T range, `data-anchor` 3D point, `data-manchor` mobile, `data-dy` pixel nudge, `data-span` width fit). Sign text is painted in `shapes.js` (`drawSign`/`signText`).
- Polish build: all words move to `copy.js` (`COPY` map by key). Edit only there once it lands.
- Rules: keep the founder line, the clause (word for word), "Book a call" link and Delhi line; no numbers; run `python3 /workspace/shubham-site-notes/gen4/copycheck.py index.html`.

## How to tweak
- Timing: shift a caption's `data-t`, a `SEG` t0/t1, and matching `CAM`/`LOOK` keys together.
- Camera: edit `CAM`/`LOOK` keys (Catmull-Rom Hermite spline, never stops between keys).
- Morph feel: `spread` (front sharpness), `noise` (keep low, high = cloudy), `arc`, `snap` (lattice), `axes` (staged moves).
- New scene: add `STATES.push(()=>({parts,fill}))` in `shapes.js`, a `SEG` entry, camera keys, lights, `SIZE`, captions. Keep everything a pure function of T and carry one element over.
- Dots: `?dots=N` forces a count; tiers in `TIERS` in `film.js`; budgets per part scale by `SCALE`.
- Debug: `window.__film.set(T)`, `.N`, `.TIER`, `.level()`.

## Verify before publishing
`/home/box/.venvs/bulbul-dash/bin/python /workspace/shubham-site-notes/gen5/build/test.py - all 0.02` (2% frames at 1440 and 390, text audit, console errors, fps), then a filmstrip with `montage.py`. See HANDOFF.md section 6.

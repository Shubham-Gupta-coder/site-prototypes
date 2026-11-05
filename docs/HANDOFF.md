# Handoff: Shubham Gupta's personal site (read this first)

Written 2026-11-05 from the actual state of the box. If you are an agent picking this up: read this file, then `/workspace/shubham-site-notes/gen5/STATUS.md` (live state), then `v5/shutter/README.md` (code guide). To change the dot count or the scenes, go straight to the README sections **Change the dot count** and **Change scenes (add, remove, reorder, retime)**.

## 1. Goal and his taste
Shubham Gupta (GitHub `Shubham-Gupta-coder`, Asia/Calcutta) wants a personal site that establishes him as the person who joins AI tech and business: he builds the AI that runs businesses, and he is **Verslay's only technical founder** (he owns product and engineering; his co-founder runs sales).

Standing preferences:
- Award-level, cinematic, story-like, premium. It should feel like a film.
- Real 3D that morphs with scroll like a video, every cm of scroll changes the picture.
- Little text, all of it readable, integrated into the graphics (text as part of the art). Faint subtext is a failure.
- Playfair Display. He loves the **sandy, dot-formed Playfair type** of The Shutter's opening scenes.
- Story, vision and approach, not facts and numbers. Keep it **number-free**.
- Original designs: inspired by references, never similar to them.
- Copy must be warm and respectful (the tools are the problem, never the people), and say more about him.
- Say "One System", not "one memory" or "one brain".

## 2. Repo and folder map
| Where | What | Rules |
|---|---|---|
| `/workspace/shubham-site` | Main repo: `AGENTS.md`, `docs/` (FEEL, SPEC, WHO, WORK, OFFER, PROOF, VOICE), `picks/`, `skills/`, `site/` (`site/film/` steel film, `site/index.html` paper draft) | Source of truth for facts and rules. **Do not push without his say-so.** |
| `/workspace/proto-serve` | Public repo `Shubham-Gupta-coder/site-prototypes`, GitHub Pages | All prototypes live here. Public: no secrets. |
| `/workspace/shubham-site-notes/gen1..gen5` | Working notes, prompts, scripts, budgets, screenshots per round | Index: `/workspace/shubham-site-notes/README.md` |
| `/workspace/open-design` | OpenDesign v0.25.1 | See section 9 |

Live URLs (base `https://shubham-gupta-coder.github.io/site-prototypes/`, index lists them all):
- `v5/shutter/` The Shutter (working copy, **current direction**)
- `v5/shutter-benchmark-1/`, `v5/shutter-benchmark-2/` frozen benchmarks, never edit
- `v4/quicksilver/`, `v4/keeper/`, `v4/geode/` round 4
- `v3/thread/` The Thread (round 3)
- `v2/option-1..3/` round 2; `option-1..3/` round 1

## 3. AGENTS.md hard rules (summary; source: `/workspace/shubham-site/AGENTS.md`, details in its `docs/`)
- One action, one label everywhere: **Book a call** (LinkedIn link `https://www.linkedin.com/in/expert-shubham-gupta/`).
- "Verslay's only technical founder. ... My co-founder runs sales." always, that way.
- Only figures/names/results in `docs/PROOF.md`; strongest true sentence, never invented facts.
- No age, school, student status, grades, start year. No "available for projects", no WhatsApp as CTA, no emoji, no CLASSIFIED stamps, no fake terminal/code blocks.
- No "freelance", "parked", "pitched", "proposed". Clients by industry only. Never name the open-source base of his agent system. No SOC 2/ISO/bank-level/enterprise, no revenue or customer counts.
- The discretion clause stays in the close **word for word** from `docs/OFFER.md`.
- Brand names allowed: Shopify, Razorpay, WhatsApp. Excel, Tally, Gmail, Google Sheets stay as **generic icons** (his decision).
- Copy lint: `gen4/copycheck.py` (banned words, dashes, `!`, emoji, required lines, links, numbers not in `gen2/NARRATIVE.md`).

## 4. History of rounds (what was tried, what he said)
| Round | Notes | What it was | His verdict |
|---|---|---|---|
| 1 | gen1, `option-1..3/` | OpenDesign/Haiku hero-ish prototypes | Thin: "no content, no storytelling, no animations, no personal touch". Cost $11.15 |
| 2 | gen2, `v2/` | Full-site prototypes, scroll animation | Loved scroll unfolding; wanted more illustration/SVG/3D, less complexity, story not numbers. Ranked The Thread > Run Time > One Order. Cost $6.77 |
| 3 | gen3, `v3/thread/` | The Thread: one continuous red thread, Playfair, quilt with "Textiles and B2B" | "Too much text, subtext unreadable; text is good when part of the graphics." Wanted shaders, real 3D. Cost $7.37 |
| 4 | gen4, `v4/` | Quicksilver, The Keeper, Geode (3D, Haiku) | Rejected: 3D elements random, fail the story; scroll only changes when the next page arrives; laggy; no consistent story. Cost $12.04 |
| 5 | gen5, `v5/shutter/` | **The Shutter**, hand-coded dot film | "Beautiful and amazing... animation and storytelling is brilliant." Benchmarked. Needs polish, 10x dots, sandy fonts later, warmer copy. Cost $0 (hand code) |

Key critique to never regress on:
1. Objects must be relevant to the story; random 3D fails.
2. Scroll must be continuous: every cm changes the frame, no section triggers.
3. No lag.
4. Each scene's objects transform **gradually** into the next scene's, and every scene carries an element of the previous one. His Spider-Man example: spider, web, mask, suit, Spider-Man with web, buildings, saving people.
5. "Dust and Lamp" plan was "too basic"; he wants thousands of small dots drawing realistic graphics, technical + business story, "One System".
6. Number-free; dropped "I did that job first."
7. Copy (Nov 5): "sometimes feels rude", needs to talk more about him. Phone layout "okay, could be better".

Story and scene docs: `gen5/SCRIPT.md` (the script), `gen5/PLAN.md` (earlier Dust and Lamp plan), `gen5/COPY-v2.md` (A/B rewrite awaiting his picks).

## 5. The Shutter architecture (benchmark direction)
Files in `v5/shutter/`. **This folder is the source of truth**: edit it in place and preview at `http://127.0.0.1:8765/v5/shutter/index.html` (the box server on 8765 serves the whole `proto-serve` repo). `/workspace/shubham-site-notes/gen5/build/` is an older dev snapshot (no cache-busting, no device-quality fixes); do not edit or publish from it.
- `index.html` markup, CSS, captions as `<p class="t" data-t="a,b" data-anchor="x,y,z">`, the close block. three.js 0.170 via importmap, Playfair via Google Fonts, Lenis.
- `film.js` engine: renderer, swarm shader, scroll timeline, camera, lights, captions, adaptive quality.
- `shapes.js` the art: named state builders `defState('name',...)` registering `K.name` (`K.dust` ... `K.sign2`), canvases (signs, chat, app windows), procedural parts (boxes, cylinders, racks), card textures.
- `lib.js` helpers (Part, box/cyl/sphere/tube samplers, noise). `worker.js` builds states off the main thread.
- `copy.js`: one `COPY` map, every on-screen word by key; `node bake.mjs` writes it into `index.html`. `timeline.mjs`: read-only lister of every timing anchor in a T window (`node timeline.mjs 42 57`).

Timeline: film time `T` = 0..`FILM_END` (100). `targetT()` maps scroll (Lenis `animatedScroll`) to T; the loop runs a critically damped spring (`w=9`) so T glides, never jumps. Everything (camera spline `CAM`/`LOOK`, `SEG` morphs, `SIZE`, lights `BULB1/2`, `AMB/TOP/BOT`, `HOOKS`, `REV` reveals, caption opacity) is a **pure function of T**. No timed animations, no ScrollTrigger sections. `settleT` eases a stopped reader out of a half-faded caption. The close panel follows the film (`closeTarget`).

Morphs: each state K is a list of N points (position, color, group, reveal) written into a texture; the vertex shader looks up its dot by `gl_VertexID` in state A and B, so **dot IDs are stable** and each dot travels from its A spot to its B spot. `SEG` entries `S(A,B,t0,t1,mode,origin,dir,spread,noise,{arc,snap,axes,useB})` define a travelling sweep front, arcs, lattice snapping and per-axis staging, so transitions read as organised, not cloudy. Crisp UI screens are canvas "cards" that dots assemble into and dissolve out of.

Scenes (T ranges approx.; see README for the full table): 1 sign 0-10.5, 2 warehouse 10.5-20, 3 phone/windows 16.5-36, 4 night shift 36-46, 5 blueprint 47-56, 6 engine room 56-68, 7 agents 64-80, 8 calm warehouse 80-89, 9 shutter down + "Bring the operation." 86-100, then close.

Copy: words in `copy.js` only, then `node bake.mjs`; placement in `index.html` (`data-t` = visible T range, `data-anchor` 3D point, `data-manchor` mobile anchor, `data-dy` px offset). Safe change: edit the string, keep length similar, run copycheck + the 2% audit at both widths, look at the frames around its `data-t`.

Add/remove/reorder/retime a scene: follow README **Change scenes**. In short: `defState('name',...)` in `shapes.js`, chain it into `SEG` with `S(K.a,K.name,...)`/`S(K.name,K.b,...)`, move every anchor `node timeline.mjs` lists for that window (camera, lights, captions, cards, hooks). The page warns in the console if `SEG` is not one chain or a state is unused. Keep every new value a function of T; carry one element from the previous scene (pin it with `part.at`).

Quality: tiers chosen by a GPU probe (`pickTier`): desktop 1,310,720 / 655,360 / 262,144 / 131,072; mobile 131,072 / 65,536 / 32,768; software renderer gets the lowest. `?dots=N` forces a count. At runtime the loop drops DPR to 1, then thins the swarm (`uDrop`) in levels, never below ~78k (desktop) / ~19k (phone). Debug handle: `window.__film` (`set(T,c)`, `N`, `TIER`, `NS`, `NSLOT`, `level()`, `ready`). To change counts follow README **Change the dot count**.

Device-quality changes made 2026-11-05 (commits 13ca5af, 15912e7, 1e4fcb0; `?v=s3`..`s5`):
- Fair GPU probe: `gpuProbe` subtracts the readback latency (median 1024-point draw) from the probe time, so drivers with slow `readPixels` are not mistaken for slow GPUs.
- Strong-GPU floor: Macs (by user agent) and named desktop GPUs (apple, nvidia, geforce, radeon, rtx, arc) start at 655,360 when nothing caps them lower. Brave hides the GPU name, which is why Macs are detected from the user agent.
- `masked` (Brave, or no known GPU vendor in the renderer string): faked `deviceMemory` and `hardwareConcurrency` are ignored.
- `?hud` shows dots, level, fps, dpr, probe ms, reasons and renderer. Ask him to open `?hud` on a device that feels slow.
- No downgrade while shapes are still building (`allBuilt`, `WARM_MS`).
- A steady 30 fps no longer thins the swarm: a frame-time average over 40 ms counts as slow. When thinning does happen, dots grow less (`uSzK` uses `(1-drop)^0.3`).

Performance rules: no allocation in the frame loop; one draw call for the swarm plus a few cards; states built in the worker; JS frame median ~0.2 ms; test with SwiftShader (box has no GPU: ~30 fps desktop, ~60 mobile at 131k).

## 6. Verification
Python venv: `/home/box/.venvs/bulbul-dash/bin/python` (playwright). Chrome: `/usr/bin/google-chrome` with SwiftShader.
```
cd /workspace/shubham-site-notes/gen5/build                # test scripts live here; the page under test is v5/shutter
(cd /workspace/proto-serve && python3 -m http.server 8765 --bind 127.0.0.1 &)   # if not already running
U=http://127.0.0.1:8765/v5/shutter/index.html
cp audit.txt /tmp/audit.txt                               # test.py exec()s /tmp/audit.txt (faint/offscreen/overlap text check)
/home/box/.venvs/bulbul-dash/bin/python test.py $U all 0.02 > /tmp/t.json   # shots every 2% at 1440x900 (d) and 390x844 (m) + fps
PRE=p3- ONLY=d /home/box/.venvs/bulbul-dash/bin/python test.py $U frames 0.02
Q='?dots=655360' /home/box/.venvs/bulbul-dash/bin/python test.py $U fps
python3 /workspace/shubham-site-notes/gen4/copycheck.py /workspace/proto-serve/v5/shutter/index.html   # copy lint ("clean" or issues)
/home/box/.venvs/bulbul-dash/bin/python montage.py ../filmstrip.png 6 ../shots/p2-d-0*.png   # filmstrip
```
Output JSON: `errors` (console), `audit` (text problems per frame), `fps` (avg, median, p95, adaptive level). Shots land in `gen5/shots/`. Always look at the filmstrip yourself before reporting.

## 7. Publishing
```
cd /workspace/proto-serve
git pull --rebase                      # another worker may have pushed
# edit v5/shutter/ in place, keep <meta name="robots" content="noindex,nofollow"> on every page
# bump ?v= in index.html film.js shapes.js worker.js on EVERY publish (README, Cache busting); current s6
git add -A && git commit -m "v5 shutter: ..."   # author already set: Shubham Gupta <Shubham-Gupta-coder@users.noreply.github.com>
git -c credential.helper= -c credential.helper='!/usr/local/bin/gh auth git-credential' push
```
Check the build: `gh api repos/Shubham-Gupta-coder/site-prototypes/pages/builds/latest --jq '.status,.commit'` should say `built` for your commit. Pages takes ~10-15 min; check with `curl -sI <url>`. Stale waiting deploys can be cancelled (`gh run list/cancel -R Shubham-Gupta-coder/site-prototypes`). `.nojekyll` is in the repo root. Cloudflare quick tunnels are blocked and localtunnel is unreliable here, so Pages is the only share path.

## 8. Checkpoints
- Frozen: `v5/shutter-benchmark-1/` (never modify), git tag `shutter-benchmark-v1` (eca0b46), archive `/workspace/shutter-benchmark-v1.tgz`.
- Frozen: `v5/shutter-benchmark-2/` (never modify), git tag `shutter-benchmark-v2` (f39b50b, polished, sandy type, tiers up to 1.3M).
- New benchmark: `cp -r v5/shutter v5/shutter-benchmark-N` (+ script/plan/tests beside it), commit "Benchmark: The Shutter vN", `git tag shutter-benchmark-vN && git push origin shutter-benchmark-vN`, `tar czf /workspace/shutter-benchmark-vN.tgz ...`, add a link on `index.html`.

## 9. OpenDesign (when generating with AI)
- Setup: `/workspace/open-design`, Node 24 at `/workspace/node24`, Claude Code CLI `/home/box/.local/bin/claude`, **Haiku only, max effort** (his rule).
- Restart: `cd /workspace/open-design && export PATH=/home/box/.local/bin:/workspace/node24/bin:$PATH COREPACK_HOME=$HOME/.cache/corepack && pnpm tools-dev run web` (log `/workspace/open-design-dev.log`; URLs change on restart).
- Lessons: first run in a new project often only plans, follow up with `gen4/cont.sh NAME PROMPT PROJECTID`; stage prompts to stay under the 128k output cap; prompts over 100k tokens bill 5x, so use a fresh project per step; report the cost of **every** run.
- Cost tracking: `gen4/budget.py RUNID` reads a run's cost; `gen4/addcost.py STEP RUNID` appends to `budget.json`. Pipeline helpers: `step.sh`, `chain.sh`, `after.sh`, `publish.sh`.

| Round | File | Runs | Cost |
|---|---|---|---|
| 1 | gen1/budget.json | 10 | $11.15 |
| 2 | gen2/budget-round2.json | 12 | $6.77 |
| 3 | gen3/budget-round3.json | 9 | $7.37 |
| 4 | gen4/budget.json | 10 | $12.04 |
| 5 | hand code | 0 | $0 |

When to use which: OpenDesign is fine for quick, varied first drafts. For a coherent scroll film (continuous morphs, story-linked objects, performance) **hand-coding won**: Haiku output produced random, section-by-section motion.

## 10. Working style
- Short, crisp questions, batched together; keep working while waiting for answers.
- Checkpoint often: sessions get cut off around 50 minutes. Write progress to the round's `STATUS.md` with IST timestamps, and commit locally at each step.
- Report costs, links, screenshots/filmstrip, and honest weaknesses.

## 11. Open items (as of 2026-11-05)
- Polish + 10x dots round is done and frozen as benchmark 2; device-quality fixes followed (section 5). He loves it but says it "has issues"; ask which before big changes.
- He "might" change the scenes later: the engine is set up so that only `shapes.js` states, the `SEG` chain and the timeline tables change (README **Change scenes**).
- Later idea (his, not started): an alternate low-animation version for slow devices, chosen when the probe lands on the lowest tier or the browser has no WebGL2. The static `nogl` fallback in `index.html` is the starting point.
- Copy v2 (`gen5/COPY-v2.md`): his A/B picks pending; he will also send his own copy changes.
- The "why I started" line must come from him.
- Known weaknesses: cloudy morph midpoints (~66, 81, 88), shelf reads as dot grid, cables zigzag, scene 8 dark, cramped mobile scene 7.

## 11b. v6 (gen6 script, 2026-11-05)
- `v6/shutter/` is a new preview built from SCRIPT-v3 (`/workspace/shubham-site-notes/gen6/`). Live: https://shubham-gupta-coder.github.io/site-prototypes/v6/shutter/ . Cache `?v=v6a`.
- v5/shutter is unchanged and remains the previous reference; benchmarks untouched.
- Copy gate for v6 is `gen6/copycheck.py` (founder line without "only"). Status log: `gen6/STATUS.md`. What changed: top of `v6/shutter/README.md`.

## 12. Security
Never print or echo `ANTHROPIC_API_KEY` or any token. This repo is public: no secrets, no credentials in commits.

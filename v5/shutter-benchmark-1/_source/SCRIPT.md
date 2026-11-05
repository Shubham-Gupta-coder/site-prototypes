# Round 5 script: THE SHUTTER

Status: PLAN ONLY. No build, no paid runs. Replaces PLAN.md (Dust and Lamp, judged too basic).

Medium: one swarm of tiny dots (131,072 on desktop) that assembles into realistic, detailed, coloured objects on the spot, works, and dissolves into the next object. Never abstract blobs. Every object is something a shop owner would recognise.

---

## 1) Title and logline

**Title:** THE SHUTTER

**Logline:** At closing time in an Indian shop, the counter is still buried in work. The phone keeps ringing with orders, payments sit in one app, stock in another, the ledger in a third, and nothing talks to anything else. Every night the operator re-keys it all by hand. Then Shubham Gupta, Verslay's only technical founder, draws one system under the whole business: pipes, a database, a server room and agents. They take the order, collect the payment, move the stock and close the month on their own. The shutter comes down on a shop that keeps running, and his name on the signboard opens into an invitation.

**Story arc (three acts):**
- **Act I, Chaos** (scenes 1 to 4). His name is on the signboard. The shutter rises on a real counter, every tool on it starts shouting, and the operator's night of copying becomes unbearable.
- **Act II, The System** (scenes 5 to 7). The mess straightens into a blueprint, the blueprint becomes a working data centre, and agents run the pipelines.
- **Act III, It Runs** (scenes 8 to 9). Back at the same counter, now calm. The shutter comes down with the lights still on, and the signboard turns into the call.

The story is grounded in WHO.md and WORK.md: "A company collects tools. None of them remember the others. The operator becomes the glue." The scenes draw on cart recovery tied to payments, WhatsApp order updates, sheets that do not agree, dues engines with human approval, and Verslay's platform. Every object on screen is something the words name.

---

## 2) The script

Conventions:
- `p` is the page scroll from 0 to 100%.
- Dots are coloured per point from their source illustration.
- Palette: near-black night, one warm tungsten source (the shop bulb), oxide red `#7E2A18` for the copy strokes and the call, and night blue outside.
- Display type is Playfair Display. Each display line is either formed by dots or set in DOM with `background-clip: text` filled by the live dot texture of that scene, so the words look made of the same matter.
- No digits anywhere on the page. Register screens, rows and dashboards use bars, ticks and blurred glyph shapes, never readable figures.

---

### SCENE 1. EXT. MARKET LANE, NIGHT. THE SIGNBOARD
**Scroll:** 0 to 9%

**VISUAL.** Black frame with a light drift of dots like dust under a streetlight. The dots fly in and assemble a painted shop signboard: a wide tin board with a riveted border, the paint slightly chipped, a single bulb on a bent bracket above it. On the board, the dots draw SHUBHAM GUPTA in large Playfair, as if hand-painted in bone on deep oxide. Below the board, a rolled-down steel shutter forms slat by slat, ribbed, with a padlock at the bottom. The bulb flickers on, from a curve on `p`, and warm light falls across the slats.

**WORDS.**
- The name *is* the signboard paint, made of dots.
- In the lower third, small, painted on the shutter's bottom slat as if stencilled: "I build the AI that runs businesses."

**CARRIED into scene 2:** the shutter, its slats and its padlock.

**TRANSFORMATION, 6 to 9%.**
1. The padlock dots unclip and fall away as a small spill of dots.
2. The shutter's slats roll up one by one, each slat a band of dots, sliding up and compressing into a roll under the signboard.
3. Behind it, the dark interior starts to resolve at low density: the outline of a counter.

**CAMERA.** Wide on the shopfront, slow push in and down to the shutter's midline.

**LIGHT.** Night blue lane, one warm bulb, dust in its cone.

**BEAT.** Silence, one bulb hum, a metal rattle as the shutter goes up.

---

### SCENE 2. INT. SHOP, NIGHT. THE COUNTER
**Scroll:** 9 to 20%

**VISUAL.** The counter fills in at full density:
- a wooden counter with a glass display front, folded garments inside (apparel, his strongest industry thread);
- on top: a billing machine and cash register with a paper roll, a fat cloth-bound ledger (khata), a calculator, a stack of brown parcels with tape, and a phone lying face up.

Every object is realistic and coloured: wood grain from dot colour, a glint on the register keys. A receipt prints out of the register, a strip of dots feeding upward with blurred glyph rows and no digits.

**WORDS.**
- "Every business starts at a counter." Playfair, filled by the wood-grain dot texture, set along the front edge of the counter like a carved line.

**CARRIED into scene 3:** the phone on the counter.

**TRANSFORMATION, 17 to 20%.**
1. The phone screen lights, and its dots brighten.
2. The phone lifts and turns toward camera as the counter recedes and loses density, becoming a dim backdrop that stays visible.
3. The phone grows to fill a third of the frame, and its screen dots re-sort into an app layout.

**CAMERA.** Settles at counter height facing the counter, then a slow dolly onto the phone.

**LIGHT.** Warm bulb from above left. The glass case reflects a soft band.

**BEAT.** The register's paper roll ticking, then a single notification chime.

---

### SCENE 3. INT. SHOP. EVERYTHING RINGS
**Scroll:** 20 to 34%

**VISUAL.**
- The phone shows a chat app in WhatsApp-style green: chat bubbles stack in, built from dots. They are customer order messages with blurred text and small product thumbnails.
- More bubbles arrive faster, and the chat scrolls.
- Then windows peel off the phone and float around the counter, each a realistic tool screen made of dots:
  - a storefront admin with an order list (Shopify-style);
  - a payment gateway screen with a payment-received card (Razorpay-style);
  - a green spreadsheet grid with mismatched cells;
  - an email inbox with unread rows;
  - a desktop accounting ledger screen.
- Each window has its own tint and its own blinking unread dot.
- The windows overlap and fight for space, and edges clip.

**WORDS.**
- "Orders on chat." appears as a chat bubble the dots form, the same bubble style.
- "Payments in another app." appears as the headline of the payment card.
- "Stock in a sheet." appears as text inside a spreadsheet cell.
- At the end, larger, Playfair across the gap between windows, filled by the noisy multi-colour dot texture: "None of them talk to each other."

**CARRIED into scene 4:** the floating tool windows, still unconnected.

**TRANSFORMATION, 30 to 34%.**
1. Windows multiply, each spawning a duplicate slightly offset.
2. They tilt and fall flat onto the counter like papers.
3. The unread dots turn oxide red and start to blink out of sync.

**CAMERA.** Pulls back from the phone to frame the swarm of windows around the counter, with a slight upward tilt.

**LIGHT.** The warm bulb is now competing with the cold screen light from each window. The room gets noisier and cooler.

**BEAT.** Chimes overlapping, faster, until they blur into one tone.

---

### SCENE 4. INT. SHOP, LATE. THE NIGHT SHIFT
**Scroll:** 34 to 46%

**VISUAL.**
- The windows are now a pile of screens and printouts on the counter, with the ledger open on top.
- Oxide red strokes, like copy-and-paste traces, jump from window to window: from a chat bubble to the ledger, from the payment card to the sheet, from the sheet to the storefront.
- Each stroke is a moving line of dots that writes a smudged row into the destination.
- Strokes repeat the same trips and tangle.
- The ledger pages flip by themselves, one page per few percent of scroll.
- A wall clock forms above the counter, a real analogue clock with hands and no numerals, and its hands sweep forward as you scroll.
- The bulb flickers.
- No person, only the evidence of one: a chair pushed back, a tea glass on the ledger, half full.

**WORDS.**
- "So someone copies it all by hand." Written by an oxide stroke into the ledger's open page, in Playfair italic, like ink.
- Then, smaller, on the clock face where the numerals would be: "Every night."

**CARRIED into scene 5:** the oxide strokes, the tangle of connections drawn by hand.

**TRANSFORMATION, 42 to 46%.**
1. The room's dots dim and drop out, so the counter, clock and chair fade to a faint outline while the strokes stay bright.
2. The tangled strokes slow down.
3. Each stroke snaps segment by segment into straight horizontal and vertical lines, the hand trace turning into ruled lines.
4. The piled windows flatten into rectangles with labels.

**CAMERA.** Rises slowly from counter height to overhead, looking straight down on the counter.

**LIGHT.** The bulb flickers twice and goes to an ember. Oxide is the brightest thing in frame.

**BEAT.** A clock tick getting louder, then stopping.

---

### SCENE 5. OVERHEAD. THE BLUEPRINT (THE TURN)
**Scroll:** 46 to 56%

**VISUAL.**
- Seen from above, the scene becomes a technical drawing on dark blueprint paper, with a fine grid made of dots.
- The flattened windows are boxes with simple tool icons inside: a chat bubble, a storefront bag, a payment card, a sheet grid, an envelope and a ledger.
- The straightened strokes route into a single thick bus line across the middle of the sheet.
- New elements draw themselves along the bus as clean diagram parts:
  - an API gateway block;
  - a queue drawn as stacked chevrons;
  - a database cylinder;
  - a row of small agent nodes;
  - an approval gate drawn as a valve symbol.
- Every tool box gets exactly one clean connector to the bus.
- Dimension lines and leader lines appear like an engineer's drawing.

**WORDS.**
- "I build one system under all of it." Set in Playfair as the drawing's title block in the bottom right corner, the way a blueprint is signed, with the dot grid showing through the letters (background-clip of the blueprint texture).
- In the same title block, small grotesk: "Shubham Gupta. Verslay's only technical founder."

**CARRIED into scene 6:** the bus line, the database cylinder and the connector lines.

**TRANSFORMATION, 52 to 56%.**
1. The blueprint tilts from overhead to a low three-quarter view.
2. Each diagram element extrudes upward: the bus becomes a cable tray, the connectors become cables with thickness, the database cylinder rises as a real storage unit, and the agent nodes rise as slim server racks.
3. The blueprint grid stays as the floor of the room that forms.

**CAMERA.** Overhead, slow rotation of a few degrees while the drawing draws, then tilts down into perspective.

**LIGHT.** Cool even blueprint light, with oxide only on the bus at first.

**BEAT.** Silence, the scratch of a pen, one deep note when the bus connects.

---

### SCENE 6. INT. THE ENGINE ROOM
**Scroll:** 56 to 68%

**VISUAL.**
- A realistic small data centre, entirely of dots:
  - two rows of server racks with front grilles, cable trays overhead carrying the bus, and patch panels with cables plugged in;
  - status LEDs blinking green and amber.
- At the far end of the aisle sits the database, shown as a glass wall of tables. Each table is a grid of rows, and new rows fill in from left to right as bars, never digits.
- Along the cable tray, packets of light travel from the tool icons (still visible at the cable ends, mounted on the racks like faceplates) into the database.
- The tool names appear on the rack faceplates as small dot-built wordmarks, for example WhatsApp, Shopify and Razorpay. See the brand notes below.

**WORDS.**
- "One system. Every tool plugged in." Engraved into the top rack's brushed faceplate, lit by the LEDs, as troika SDF text in 3D.
- At 64 to 68%, on the glass database wall, in Playfair clipped by the moving row texture: "Verslay's only technical founder. I built the entire platform. My co-founder runs sales."

**CARRIED into scene 7:** the light packets on the cables.

**TRANSFORMATION, 64 to 68%.**
1. The packets slow down and swell.
2. Each one grows into a small agent token, a rounded capsule of dots with an icon of its job (a chat bubble, a payment card, a box).
3. The cables they ride straighten into pipelines that extend out of the room toward the dark.

**CAMERA.** A tracking dolly down the aisle between the racks, at rack height, steady, toward the database wall.

**LIGHT.** Cool room, LED points of green and amber, and one warm task light over the database wall. The warm light carries the bulb from scene 1, now inside the system.

**BEAT.** Fan hum, LED blink ticks timed to scroll, the low thump of packets landing.

---

### SCENE 7. PIPELINES. AGENTS AT WORK
**Scroll:** 68 to 80%

**VISUAL.**
- The pipelines run out of the server room into three short sequences, one after another. The camera rides along the pipes, and each sequence is a realistic object built from dots:
  1. **Order.** A chat bubble arrives ("Is this in medium?"). An agent token reads it, a stock check pulses down the pipe to a warehouse shelf that assembles (metal racking, labelled boxes, a barcode on each box), and one box lights and slides forward. A reply bubble goes back.
  2. **Payment.** The agent sends a payment link card. The card turns to a "paid" tick shown as a stamp, not a number, and a new row writes into the database.
  3. **Approval.** A dues email to a store is drafted as an envelope with a document inside. It stops at the approval valve from the blueprint, waits, a tick lights in oxide, and the envelope goes out.
- A dashboard forms behind the pipelines: line charts drawing themselves and status tiles turning green.

**WORDS.**
- "Agents take the order." on the reply bubble, Playfair inside the bubble.
- "They check the stock and send the link." on the shelf's box label.
- "A person approves what matters." on the approval valve, the words lit as the tick lights.

**CARRIED into scene 8:** the dashboard's green status tiles, the box from the shelf, and the reply bubble.

**TRANSFORMATION, 76 to 80%.**
1. The pipelines retract back toward the camera, pulling the dashboard, the box and the bubble with them.
2. The dashboard shrinks onto the cash register's screen, the box lands on the parcel stack with a printed label, and the bubble lands on the phone.
3. The counter reassembles at full density around them: the same counter as scene 2.

**CAMERA.** Rides alongside the pipe, then a pull back that ends at the same counter-height pose as scene 2.

**LIGHT.** Warm returns. The dashboard green and the oxide tick are the only accents.

**BEAT.** Three clean beats, one per completed job, then a long held note.

---

### SCENE 8. INT. SHOP, NIGHT. IT RUNS
**Scroll:** 80 to 91%

**VISUAL.**
- The same counter, now calm:
  - the phone shows replies already sent, with ticks;
  - the register screen shows a small dashboard with every tile green;
  - the parcels are taped, labelled and stacked neat;
  - the ledger is closed, with a stamped tick on its cover.
- The clock from scene 4 is back on the wall, its hands moving gently.
- The chair is pushed in and the tea glass is empty.
- Faint glints on the register keys show the system still working: a parcel label prints by itself, and a bubble gets a reply by itself.
- Then the camera pulls back out of the shop, and the shutter starts to come down, slat by slat.

**WORDS.**
- "The month closes itself." Stamped on the ledger cover, the same oxide ink as the strokes, now orderly.
- Then, painted on a shutter slat as it comes down, in small grotesk: "Apparel. D2C. Gifting. Textiles and B2B."

**CARRIED into scene 9:** the shutter coming down, and the signboard above it.

**TRANSFORMATION, 88 to 91%.**
1. The shutter closes fully, but a strip of warm light shows under it and the bulb stays on.
2. Through the shutter's ventilation slots, small green LED points blink: the system is still running inside.
3. The camera rises toward the signboard.

**CAMERA.** Counter height, slow pull back out through the doorway into the lane, rising.

**LIGHT.** Warm inside, night blue outside, green LED glints through the slots.

**BEAT.** Quiet, then the shutter rolling down, then the bulb hum from scene 1 returns.

---

### SCENE 9. EXT. MARKET LANE, NIGHT. THE INVITATION
**Scroll:** 91 to 100% (the final frame holds from 97 to 100%)

**VISUAL.**
- The signboard again. Its painted dots lift slightly off the tin and re-sort, letter by letter: SHUBHAM GUPTA stays as the board's top line, and a second line paints itself below it.
- The shutter below becomes the surface for the close: a bone-coloured paper notice pasted on the slats, the way shops post a notice. Dots form its fibre and edge.
- The bulb stays lit.

**WORDS.**
- On the board's second line, Playfair filled with the warm bulb glow via background-clip: "Bring the operation."
- On the pasted notice:
  - **Book a call** (oxide underline, links to https://www.linkedin.com/in/expert-shubham-gupta/);
  - "The appointment sits on LinkedIn.";
  - the clause verbatim in dark ink: "Some of the work on this site was built through Verslay, for Verslay's clients. Those businesses are Verslay's clients, not my personal clients, so they are described by industry rather than by name."

**CARRIED:** this is the same signboard and shutter as scene 1, so the film closes its loop.

**CAMERA.** Settles square-on to the shopfront, the same pose as scene 1, and holds.

**LIGHT.** The bulb, the night, and green glints through the slots.

**BEAT.** One soft final chime, then silence.

---

### The chain in one read (Spider-Man style)

Signboard and shutter -> the shutter rolls up onto a counter -> the counter's phone lights up -> the phone spills tool windows -> the windows pile up under red copy strokes -> the strokes straighten into a blueprint -> the blueprint extrudes into a server room -> server packets become agents on pipelines -> the agents' work lands back on the same counter, calm -> the shutter comes down, lit -> the signboard paints the invitation.

### All on-screen words, in order (copy check)

1. SHUBHAM GUPTA / I build the AI that runs businesses.
2. Every business starts at a counter.
3. Orders on chat. / Payments in another app. / Stock in a sheet. / None of them talk to each other.
4. So someone copies it all by hand. / Every night.
5. I build one system under all of it. / Shubham Gupta. Verslay's only technical founder.
6. One system. Every tool plugged in. / Verslay's only technical founder. I built the entire platform. My co-founder runs sales.
7. Agents take the order. / They check the stock and send the link. / A person approves what matters.
8. The month closes itself. / Apparel. D2C. Gifting. Textiles and B2B.
9. Bring the operation. / Book a call / The appointment sits on LinkedIn. / the clause verbatim.

Checks:
- No numbers, no em dashes, no emoji, no exclamation marks.
- No client names, and no banned words.
- "I did that job first." is dropped, and so is the 40+ line.
- Every line is short. Run `gen4/copycheck.py` on the build.

### Brand-name notes and doubts

- **Rules that bite.** AGENTS.md bans client names, not tool names. But SPEC.md and VOICE.md ban a "logo wall" and a "stack logo wall as the identity". The practice-frame skill says "a figure, a client result, a logo, or a certification that is not in docs/PROOF.md is a defect".
- **Safe to name.** Shopify and Razorpay are in PROOF.md as commerce tools he has built against. WhatsApp is named throughout WORK.md and OFFER.md as an operating channel; only "WhatsApp as the call to action" is banned, and here it is never the call.
- **Doubtful.** Excel appears in WORK.md only as text ("Excel in the client's own layout"). Tally, Gmail and Google Sheets are not in the docs at all.
- **Plan.**
  - Show Shopify, Razorpay and WhatsApp as small dot-built wordmarks in their generic, recognisable colours (WhatsApp-style green bubbles, a storefront bag, a payment card), only in use inside scenes 3 and 6, never in a row of logos.
  - Show Excel, Tally, Gmail and Sheets as generic icons only: a green grid, a ledger screen, an envelope, a sheet.
  - Use no exact trademark logos anywhere, only drawn-style wordmarks or icons, to avoid trademark and "trusted by" readings.
  - Needs his yes before any of the doubtful names appear.
- **Not used.** No Verslay product logo (SPEC.md bans Verslay's product brand with his name on it), and never the name of the open-source base of his agent system.

---

## 3) Tech note: making dots look real

**Sources of shapes** (all made at build time, cached as binary point files):
- **Illustrated silhouettes.** Hand-built SVG illustrations of each object (counter, register, ledger, phone UI, tool windows, shelf, racks, clock, signboard, shutter). Rasterise them to a canvas at 2048px and sample points by luminance and edge weight with blue-noise (Poisson disc) so edges and details get more dots. Each SVG has 3 to 6 depth layers, and each layer gets its own z, so objects have real parallax and volume.
- **Procedural geometry.** Racks, cable trays, shelves, shutter slats and the database wall are simple three.js meshes. Sample points over their surfaces with `MeshSurfaceSampler`, which gives true 3D.
- **Text and glyphs.** Playfair rendered to canvas after `document.fonts.load` and sampled the same way, for the dot-built name and lines.
- **Per-point colour.** Each point stores the RGB of its source pixel, giving wood grain, WhatsApp green, LED green and amber, and paper bone. Emissive points (LEDs, screens, the bulb) have a flag and blink phase so they glow.

**Same particle IDs across shapes.**
- There is one pool of 131,072 particles (256 x 512 float textures).
- Every shape is resampled to exactly the pool size. Unused points park as faint dust in the room, so nothing pops in or out.
- To keep moves short and graceful, points in each shape are ordered along a 3D Hilbert curve, so particle `i` maps between nearby regions of consecutive shapes. Key carried elements (shutter, phone, strokes, packets, dashboard) are pinned to fixed ID ranges, so the same dots literally carry from scene to scene.

**In-between "processing" states.** During each transformation span, the vertex shader mixes shape A to shape B with a per-particle delay (a sweep direction set per scene, such as bottom-up for the shutter or along the stroke for the blueprint). It adds curl noise whose strength peaks mid-morph and is zero at both ends. Mid-morph points briefly tint toward oxide or cool white, so the swarm reads as data being processed, then settles crisp.

**Everything is a function of scroll.**
- One `p` (Lenis plus a critically damped spring) drives shape index and weight, camera spline position and target, lights, and text opacity and transforms.
- No section triggers and no timed tweens.
- Slope rule: within any 0.5% of `p`, either the camera or the swarm changes.
- Only LED blink and dust breath run on time, at tiny amplitude.

**Particle budget per scene (desktop active count; the rest is parked dust):**

| Scene | Active dots |
|---|---|
| 1 Signboard and shutter | about 70k |
| 2 Counter | about 120k |
| 3 Phone and tool windows | about 120k |
| 4 Night shift | about 110k |
| 5 Blueprint | about 90k |
| 6 Engine room | about 131k (full pool) |
| 7 Pipelines and agents | about 120k |
| 8 Calm counter | about 120k |
| 9 Invitation | about 80k |

**Mobile (under 768px).**
- Pool of 32,768 dots, with the same shapes resampled. Detail is held by bigger dot size and fewer depth layers.
- DPR 1, no bloom, wider FOV, all lines in the lower third on a darkened plate.
- `prefers-reduced-motion` or no WebGL2 shows nine still frames with the same words.

**60fps budget.**
- One renderer and one `Points` draw call for the swarm, sampling two shape textures per frame.
- About 12 uniforms written from the CPU per frame, and no CPU work per particle.
- DPR capped at 1.5, `antialias` off, and half-resolution bloom on desktop only, for the bulb and LEDs.
- Troika text for engraved lines.
- DOM type moves by `transform` and `opacity` only. Background-clip fills are static textures, and their shimmer comes from a transformed pseudo-element.
- Adaptive quality: average frame time over 20 ms drops DPR to 1.0, then halves the active count.
- Point files are about 1.5 MB each at float16. Load scenes 1 and 2 first and stream the rest while the visitor reads.

**Readability.** One text block on screen at a time, with ramps of 0.8% of `p`, holds in between, and a darkened local plate behind each line. Contrast is at least 7:1 for small lines and 4.5:1 for display. Small lines are at least 18px, and the clause is at least 15px.

**Build approach (for when he says go).**
- Hand-coded three.js with a single timeline, with no OpenDesign or Haiku and $0 paid generation.
- About 10 to 14 hours, most of it drawing the SVG illustrations so the dots look real.
- Stages:
  1. engine with placeholder shapes;
  2. scenes 1 to 4 with real art, plus a filmstrip for his review;
  3. scenes 5 to 9;
  4. type, light and mobile;
  5. fps and copy pass.

---

## 4) Two alternative scene ideas he could swap in

1. **Swap scene 2 for THE GODOWN.** Instead of a counter, the shutter rises on a warehouse godown: steel racking, sacks and cartons, and a loading register on a clipboard. The phone rings on a packing table, which fits textiles and B2B and refurbished electronics as well as apparel.
2. **Swap scene 7's approval beat for THE VOICE NOTE.** A voice-note waveform from the phone travels the pipeline, folds into a calendar grid, waits at the approval valve for its oxide tick, and slides a block into a new slot. Words: "A voice note moves the calendar."

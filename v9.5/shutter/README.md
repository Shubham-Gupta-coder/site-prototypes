# v9.5 — a connected experience

Review `/v9.5/shutter/?v=v9_5a`. This additive responsive refinement keeps the approved v9.4 identity, native SVG world, story and deterministic local operations. Composition, captions, loader, navigation and ordinary document adapt to available dimensions rather than treating pointer input as a camera mode. The supplied Verslay infrastructure/team proof replaces the previous platform-only sentence; no new story or biography is introduced.

## Local review and validation

Serve the repository root with `python3 -m http.server 8884`, open the review path, then run `python3 v9.4/shutter/validate.py`. The standalone delivery includes more extensive QA scripts/captures outside the public version. Chrome viewport/software tests do not certify physical device performance.

## Source map

- `index.html`: semantic shell, early readiness fail-safe, personal sections, native radio controls and inline editable atlas. CSS is baked inline to avoid unstyled first paint. Film caption slots are still baked.
- `experience.css`: the approved normal-document art direction, material surfaces, 2D traces, native selected/focus/hover states, hero/progress presentation and reduced-motion rules. No ending scroll reveal, parallax, scroll timeline, pinning, perspective or new canvas.
- `personal.css`: prior identity/loader/responsive foundation. `polish.css`: approved film styling. Run `python3 sync-styles.py` after editing any of these, to synchronize the inline first-paint styles.
- `site.js`: readiness, anchor/disclosure behavior, hero/film/ending shell state and pause-on-hidden CSS class. Its scroll listener changes only navbar/progress visibility; it never drives the ending’s content or ornamental motion. There is no IntersectionObserver.
- `film.js`: unchanged world/timeline plus the previous safe readiness/navigation adapter. The existing smoothed T also drives `__shell.update(T)`. Responsive camera framing is now independent of input/quality, with eight-corner primary envelopes and semantic resize preservation; no new clock, worker or per-point loop.
- `assets/capability-atlas.svg`: independently renderable native 2D drawing. Its inline counterpart in HTML supports the native radio selection. Both have the same editable geometry. `etched-grain.svg`: bounded static material texture, not a particle field or filter.
- `vector-world.js`, `studio.js`, `shapes.js`, `lib.js`: approved world, geometry and operation logic, changed only by cache key. All fifteen world SVGs are retained byte-for-byte. Images are never resampled into dots.
- `copy.js` / `node bake.mjs`: approved film and opening copy. Personal prose is in HTML. `timeline.mjs` remains the read-only retiming index. `package.json` declares ES modules for local developer commands.
- `vendor/`, `fonts/`: existing local pinned distributions and original licences. No new dependency or external runtime service. Three.js 0.170.0 and Lenis 1.1.18 remain MIT. Big Shoulders Display and Source Serif 4 retain their SIL OFL licences.

- `responsive.css`: intrinsic/shrink-safe document geometry, viewport-height-aware hero/loader/captions, selected-route feedback and content-container method composition. The root page does not clip horizontal overflow.

## Two separate motion contracts

**Film:** every world property remains a function of the existing smoothed scroll value T. The 2px progress line uses that exact value and exposes a meaningful progressbar name and min/max/current value without a live announcement. It is hidden during the hero, ordinary ending and every static mode. There is no displayed fake percentage.

**Ordinary document:** all text is immediately present, without reveal/entry/scroll effects. Only sparse CSS trace packets, a small registration arc beside the belief and a 2D experience signal run autonomously. They do not move text or the layout. Native capability radios illuminate a route and its relation; essential explanations never depend on selecting or hovering. Labels are touch-sized, native arrow-key selection works, and selection still works without JavaScript through CSS `:has`. Hover is optional. There is no custom cursor, focus trap, continuous JavaScript loop or fullscreen blur. Animated SVG paint is contained in eight small composited surfaces; removing that isolation can make a browser repaint the whole folio. Reduced motion releases those layer hints. Browser tab visibility may pause these CSS animations; scrolling never starts or reveals them. Reduced motion removes ornamental animation/transitions and keeps the same crafted surfaces and content.

## Hero-only navigation and accessibility

Navigation is available in the hero and while loading. It leaves as the opening finishes, remains absent throughout the film and ordinary ending, and restores on returning to the hero. Hiding makes the whole header hidden, inert and aria-hidden; the disclosure closes and any focus inside is moved to a sensible visible region. No invisible menu items remain tabbable. The normal ending has a real Back to the film link; contact has one WhatsApp action and one LinkedIn action.

In static/no-JavaScript reading, the header is placed at the actual document hero rather than stuck over later sections. Deep normal-section hashes do not flash a navbar or import the heavy engine. Native anchor margins no longer reserve a nonexistent fixed ending header. Early inline skip/back handling works before the main module arrives.

## Readiness and recovery

The inline-styled loader and immediate skip remain. The engine stays hidden until essential fonts, all fifteen world SVG resources, required resident targets and the first complete frame are ready, followed by two presentation frames. No minimum loading delay or fake percentage. A ten-second ceiling chooses the readable still edition on failure or excessive delay; late dependencies cannot revive the animation or trap the reader. Stopping the engine also destroys Lenis and releases its wheel listeners. Reduced motion, no WebGL and no JavaScript have six readable narrative stills plus the complete ordinary site. The new inline atlas needs no network request before it can display.

Diagnostics: `window.__site`, `__film.firstFrame`, `__film.ready`, `__vectors.loaded`, `__vectors.fades`, `__vectors.operations`, `__shell.T` and `__shell.zone`. `__film.set(T)` freezes the film for inspection; ordinary ending CSS motion is deliberately independent. `__film.release()` resumes scrolling. `?dots=32768` forces a diagnostic tier; omit it for normal quality selection.

## Copy and contacts

The exact belief and supplied Verslay role/experience remain. Five short relation labels describe the existing mechanisms; no extra employer, stack, client, metric or result is invented. Both contact destinations are supplied personal URLs. They are ordinary links, not integrations, automatic messages or analytics.

## Production checklist / limits

This version remains a noindex review, without a production canonical or configured domain. Choose the real production root/domain first; then configure HTTPS/root mapping, add the correct canonical and og:url, update absolute social-image URLs, and deliberately remove noindex only on that chosen page. Do not replace the archive root or remove earlier reviews during this additive integration. Verify actual hosted resource hashes/MIME types and cache keys after publishing.

Real iOS Safari/Android, address-bar/safe-area changes, assistive technology, zoom and hardware rendering still need physical review. Software rasterization is slow; do not call it proof of hardware smoothness. Some fine illustration detail is secondary to the readable DOM prose. The ten-second fallback intentionally chooses usability on slow/failing connections. No custom domain, analytics, form backend or new service is configured.

## v9.5 fluid responsive rules

Composition depends continuously on current available layout width, height and aspect—not a phone/tablet name or pointer type. Compact framing fits a conservative primary mechanism envelope into space reserved for its active captions. At larger widths it blends back to the approved camera, rather than snapping at a device breakpoint. Sparse atmospheric/structural edges may remain intentionally cropped, but the primary mechanism is framed. Native SVG and particle geometry share one immutable world arrangement per load; rotation never rebuilds targets or changes their stable IDs. Input/quality selection is separate. The framebuffer is capped at roughly 2.2 million pixels (and the previous conservative DPR ceilings); resize may lower but does not raise runtime quality. Diagnostic `__film.viewport` and `__film.subjectBounds()` expose that contract.

The active film T is preserved when the stable viewport changes; the scroll span is rebased without reloading or reentering the loader. Normal document reading is not pulled back into the film. Header navigation switches to its native disclosure when links need more room, remains hero-only, and has a locally scrollable menu on short displays. Hero/loader typography also considers height. The ordinary site uses shrink-safe intrinsic grids, content-container method layout, bounded art and naturally wrapping text. Page-level horizontal clipping is deliberately absent. Native capability radios expose “Selected connection” beside their explanation, so a selection is useful even when the full diagram is elsewhere in the narrow flow. No ending scroll effects or new 3D.

The Verslay infrastructure/five-or-fewer team statement is explicitly user-supplied, not an independently verified metric. The supplied autonomous-systems/across-India statement is retained. No other biography is expanded.

Representative viewport/breakpoint sweeps, short landscape, text scaling and zoom-equivalent reflow are documented in the separate QA delivery. They do not certify every possible screen or physical device. Before final launch inspect real phones/tablets with Safari/Android, browser bars, notches, text preferences, pinch/desktop zoom, keyboard/assistive technology and hardware rendering. This remains a noindex review until the production root/domain, canonical and social URLs are deliberately chosen.

The constrained plan shot compensates only the extra optical fog caused by camera pullback (T64–79). The original wide-camera atmosphere and all artwork remain unchanged; a short screen must not turn the whole-system drawing into invisible ink.

Caption rails reserve/release their space over the existing fade interval before/after visibility, so responsive camera framing does not pop when a caption crosses an opacity threshold. Active primary captions retain full space.

Ordinary-section resize preserves the currently read semantic section and its relative position, rather than reusing a document Y invalidated by the film spacer’s new viewport height. This is resize-only reading continuity, not a scroll animation. Disposed/fallback engines ignore later resize events.

Portrait aerial finale (T87–100): the primary-world envelope tightens and the view gains a small, scroll-derived elevation so the apparatus remains significant rather than horizon-flattened. Added fog from the fitted camera distance is normalized to the original shot’s optical depth. Both changes ease in over87–93, depend on aspect rather than touch input, and vanish for landscape/wide views. Native art, material lighting, narrative and particle/native replacement masks are unchanged.

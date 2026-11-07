# v9.4 — a connected experience

Review `/v9.4/shutter/?v=v9_4a`. This additive refinement preserves the v9.3 film’s art, story, personal copy, native SVG replacement masks, material style and deterministic local operations. It replaces the ordinary ending’s pale list with a bespoke ink/nickel signal folio: asymmetric editorial composition, tactile belief inset, connected method traces, an interactive two-dimensional capability atlas, a Verslay maker’s imprint and two contact actions. It does not add another 3D scene or a project gallery.

## Local review and validation

Serve the repository root with `python3 -m http.server 8884`, open the review path, then run `python3 v9.4/shutter/validate.py`. The standalone delivery includes more extensive QA scripts/captures outside the public version. Chrome viewport/software tests do not certify physical device performance.

## Source map

- `index.html`: semantic shell, early readiness fail-safe, personal sections, native radio controls and inline editable atlas. CSS is baked inline to avoid unstyled first paint. Film caption slots are still baked.
- `experience.css`: the new normal-document art direction, material surfaces, 2D traces, native selected/focus/hover states, hero/progress presentation and reduced-motion rules. No ending scroll reveal, parallax, scroll timeline, pinning, perspective or new canvas.
- `personal.css`: prior identity/loader/responsive foundation. `polish.css`: approved film styling. Run `python3 sync-styles.py` after editing any of these, to synchronize the inline first-paint styles.
- `site.js`: readiness, anchor/disclosure behavior, hero/film/ending shell state and pause-on-hidden CSS class. Its scroll listener changes only navbar/progress visibility; it never drives the ending’s content or ornamental motion. There is no IntersectionObserver.
- `film.js`: unchanged world/timeline plus the previous safe readiness/navigation adapter. One lightweight `__shell.update(T)` call in `frame` exposes the existing smoothed position. No second progress clock, worker or per-point loop is added.
- `assets/capability-atlas.svg`: independently renderable native 2D drawing. Its inline counterpart in HTML supports the native radio selection. Both have the same editable geometry. `etched-grain.svg`: bounded static material texture, not a particle field or filter.
- `vector-world.js`, `studio.js`, `shapes.js`, `lib.js`: approved world, geometry and operation logic, changed only by cache key. All fifteen world SVGs are retained byte-for-byte. Images are never resampled into dots.
- `copy.js` / `node bake.mjs`: approved film and opening copy. Personal prose is in HTML. `timeline.mjs` remains the read-only retiming index. `package.json` declares ES modules for local developer commands.
- `vendor/`, `fonts/`: existing local pinned distributions and original licences. No new dependency or external runtime service. Three.js 0.170.0 and Lenis 1.1.18 remain MIT. Big Shoulders Display and Source Serif 4 retain their SIL OFL licences.

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

# v9.3 — Shubham Gupta, personal site review

This is a restrained personal-site refinement of the approved v9.2 film. Its palette, native SVG artwork, scene order, local operations and stable particle-ID morph chain are preserved. The film is still the majority of the page. A small identity/navigation shell and normal approach, expertise, experience and contact sections make it work as a personal site.

## Review locally

Serve the repository root with `python3 -m http.server 8883`, then open `/v9.3/shutter/?v=v9_3a`. This is a review path, not a configured custom domain. The review remains `noindex, nofollow`; there is intentionally no production canonical yet.

## Files and editing

- `index.html`: semantic shell and personal prose, local metadata/icons, immediate loader, early fail-safe, baked film captions and still alternatives. CSS is embedded for a styled first paint without a stylesheet request.
- `personal.css`: editable personal-site/loader/responsive styles. `polish.css`: approved world art direction. After changing either run `python3 sync-styles.py` to update the inline copy. The approved base CSS is retained at the beginning of the inline block.
- `site.js`: accessible anchor navigation, mobile disclosure behavior and readiness gate. No framework or analytics.
- `film.js`: the original scroll engine, with a first-complete-frame promise, disposal, safe anchor navigation, stable viewport measurement and header-aware caption clearance.
- `vector-world.js`, `studio.js`, `shapes.js`: the approved world and its fifteen native SVG surfaces. No illustration is resampled into dots. Settled original object domains are masked; points remain for atmosphere and transitions.
- `copy.js`: film/painted-surface wording; `node bake.mjs` bakes those slots into HTML. Personal-site prose is edited directly in HTML.
- `vendor/`: unmodified Three.js 0.170.0 and Lenis 1.1.18 distributions, now local. Both MIT licences and attribution are included. Runtime needs no CDN or new service.
- `assets/`: native world SVGs, local SG favicon and social card. `stills/`: six scene alternatives.
- `timeline.mjs`: read-only retiming index. `node timeline.mjs 38 54` includes mechanical/vector envelope timings.
- `validate.py`: syntax, copy, contact, metadata, local dependency, cache, asset and readiness checks. Run `python3 validate.py`.

The standalone review bundle contains headless QA scripts and captures separately from the public version. No installer runs those capture scripts against a repository.

## First-load contract

The loader is an immediate, inline CSS/SVG composition. Its connection trace may animate only while loading; it reports no percentage or fake progress. Header/navigation and “Skip animation · Read the site” remain usable. It is not a modal and never locks focus or the document.

The film is hidden until essential licensed fonts, all fifteen SVG resources, resident initial targets and the first complete render at the current position are ready. Two animation frames allow that completed render to be presented before reveal. There is no minimum artificial loading delay. GPU probe draws, empty buffers and partly built objects stay behind the loading surface.

The early fail-safe has a ten-second ceiling, independent of the main controller. If dependencies, fonts, artwork or startup fail, the page commits to a readable still edition and normal content. It does not later switch back or move the reader when a late module finishes. Choosing a content anchor during loading immediately chooses that edition. Deep links to the normal sections start there without importing the heavy film. Reduced motion, no WebGL2 and no JavaScript are readable from first paint.

`window.__site` is a read-only-by-convention diagnostic record of mode, reason and readiness time. `__film.firstFrame`, `__vectors.loaded`, `__vectors.fades` and `__vectors.operations` support verification. `__film.stop()` halts the draw loop/worker and disposes resources after fallback. `__film.navigate(y)` coordinates anchor jumps with the engine; returning to the first scene hides a missing resident frame until its targets are ready.

## Responsive behavior

Stable `svh` determines film progress and the reserved scroll height; the drawing surface uses the actual dynamic viewport. Browser-control height changes do not retime the film. Orientation updates its size; coarse pointers and short landscape phones retain the mobile camera/layout. Header safe-area padding, section anchor margins, 44px-or-larger navigation targets and compact phone source staging are built in. Caption clamps reserve the header’s real measured height. The menu is a native disclosure, closes on selection/outside pointer/Escape, and returns focus on Escape. Normal site text is never hidden pending entry animations.

The film remains deterministic at fixed scroll. Only loading and ordinary hover/focus responses use CSS time animation. Phone simulation is not a physical Safari performance certification.

## Copy and supplied experience

The prominent belief is: “To me the tech doesn’t matter, solving the problem does.” Experience is one Verslay block: Technical founder; “Built autonomous AI systems for businesses across India.”; “I built the entire platform.” No dates, counts, extra employers, stack claims or invented outcomes are added. The sole external contact action is the supplied direct WhatsApp link, with no prefilled text and no automatic message.

## Production checklist

1. Choose the actual production root/domain and test it. No custom domain is configured by this version.
2. Update absolute Open Graph/Twitter image URLs to that final location; keep the local image dimensions/alt. Add the correct canonical and `og:url` only once that URL exists.
3. Remove `noindex, nofollow` only for the chosen production page. Keep version/archive review pages noindex unless deliberately publishing them to search.
4. Confirm HTTPS, MIME types, caching and all local module/worker/font/SVG/image URLs on the real host; bump every version query together for a later change.
5. Test real iOS Safari, Android, touch orientation, address-bar changes, low-power GPU performance, zoom and assistive technology. Automated Chromium/viewport checks do not replace this.
6. Verify the direct contact destination and personal copy. No form or inbox integration is configured.
7. Keep font and vendor licences. Do not replace the repository’s archive index or delete older versions when choosing production hosting.

## Licences and honest limits

Big Shoulders Display (The Big Shoulders Project Authors) and Source Serif 4 (Adobe), SIL OFL, are retained in `fonts/`. Existing Three.js and Lenis are MIT, with original notices in `vendor/`. Original SVG illustrations and procedural studio art are retained; no stock image or external HDRI is added.

This is explanatory machinery, not a physical simulation. Contact shadows are analytic. Small illustration details cannot all be read on phones; main captions and normal DOM copy carry the meaning. Software-renderer performance is slow and is not a claim of hardware smoothness. A timeout chooses usability over waiting indefinitely; on very slow connections a visitor may receive the complete still edition rather than animation.

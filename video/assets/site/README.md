# v9.6 — a small-screen experience, not a smaller film

Review `/v9.6/shutter/?v=v9_6a`. The approved desktop film and personal ending remain. Phones and narrow screens now receive an authored, normal-flow illustrated story by default: context, action with evidence and human review, then the connected whole. This is not a stack of desktop screenshots.

## Route before rendering

The HTML defaults to the light story, including with JavaScript disabled. A tiny head bootstrap chooses the film only when width is **greater than 820 CSS pixels**, and the device is not both coarse-pointer and **600 CSS pixels or less on its short side**. Reduced motion, direct section links and unavailable WebGL also choose the light story. No user-agent sniffing.

Small-screen routing occurs **before the WebGL probe**. It creates no active canvas, WebGL context or worker, and does not request Three.js, Lenis, film code, dot data or world SVG resources. The hero is inline native SVG; two later illustrated compositions load lazily. There is no animation loader or tall film spacer in this route. Local fonts swap without gating readable content.

The light mode is sticky for this page lifetime: rotating or widening cannot unexpectedly initialize the film. Widen and refresh to select the desktop film. Narrowing an active desktop film stops its engine/worker/Lenis, switches to the story, and maps the current chapter; ordinary reading positions survive resize semantically. No automatic reload. Film-only progress is absent from the story. The navbar belongs to the hero and never returns over the ending.

## Source map

- `index.html`: early routing, default-readable markup, inline first-paint styles, hero apparatus, native intent/evidence/review controls, approved ending and metadata. NoJS uses the same deliberate narrative, without the obsolete six-still stack.
- `mobile.css`: fluid native-document layouts and sparse autonomous 2D trace motion. There is **no mobile scroll animation, camera, pinning, parallax, canvas or 3D**. A selection illuminates the matching route; its short explanation is adjacent to the control. All essential descriptions are always visible. Native radios work with touch, keyboard and no JavaScript through CSS `:has`.
- `assets/mobile-apparatus.svg`, `mobile-source.svg`, `mobile-routing.svg`, `mobile-whole.svg`: self-contained editable SVG compositions assembled from the approved native apparatus. The hero and interactive routing drawing are inline for immediate rendering and CSS selection. If editing their standalone counterparts, also update the inline copies with unique IDs. Illustration engraving is decorative; meaningful prose and image alternatives are outside it.
- `site.js`: readiness, native anchors/menu, hero/progress visibility, conditional Lenis/film import and semantic resize. No new animation loop, viewport reveal observer or scroll-driven mobile/ending visual property.
- `experience.css`, `responsive.css`, `personal.css`, `polish.css`: approved ending, responsive foundation, personal shell/loader and film style. Run `python3 sync-styles.py` after CSS edits to bake all five layers plus `mobile.css` into first paint.
- `film.js`, `vector-world.js`, `studio.js`, geometry, worker and timeline: approved deterministic film; only this version’s cache key changes. The original world SVGs, stills, local vendors, fonts and licences retain their original bytes. Three.js 0.170.0 / Lenis 1.1.18 remain MIT; the two font families retain SIL OFL licences. No new dependencies or services.
- `copy.js`: film/opening copy. Run `node bake.mjs` after edits. Mobile chapter and personal prose are semantic HTML. The supplied Verslay infrastructure/five-or-fewer statement appears once, with the autonomous-systems claim and exact personal belief retained.

## Motion and accessibility

Desktop film remains a pure function of smoothed scroll T, including its real 2px progress indicator. The mobile narrative and ordinary ending are normal document flow: sparse autonomous CSS/SVG traces or native selection/hover/focus effects only. Reduced motion removes all ornamental animation and transitions. No essential information needs tapping, hovering or animation. Navigation has real anchors, visible keyboard focus and touch-sized controls. Modern CSS `:has` is needed for enhanced selected-route styling; basic radio semantics and all prose survive without it.

## Review locally

From repository root: `python3 -m http.server 8886`, then open `/v9.6/shutter/`. Validate with `python3 v9.6/shutter/validate.py`. For this standalone payload, serve its directory and run `python3 validate.py` inside it. More extensive Playwright scripts and review images are in the delivery’s **non-public** QA folder, not this version.

## Before the real launch

This separate review is intentionally `noindex, nofollow`. Choose the production root/domain, set the canonical and absolute social-image URL to that destination, remove noindex only there, and verify redirects/HTTPS/social previews. No custom domain is configured by this revision. Test real iOS Safari/Android and tablets, dynamic browser controls, VoiceOver/TalkBack, text-size settings and hardware smoothness. Viewport/software-GPU tests are useful layout evidence, not physical-device certification. Larger tablets can still select the approved film; a wide-to-narrow session stays light until refresh.

# Local runtime dependencies

The existing runtime dependencies are bundled locally, with no version upgrade:

- Three.js 0.170.0, `three.module.js`, MIT. Original distribution: https://www.npmjs.com/package/three/v/0.170.0 . Licence: `THREE-LICENSE.txt`.
- Lenis 1.1.18, `lenis.min.js`, MIT, copyright 2024 darkroom.engineering. Original distribution: https://www.npmjs.com/package/lenis/v/1.1.18 . Licence: `LENIS-LICENSE.txt`.

These are unmodified public distributions. Local hosting removes a CDN dependency from first load. No telemetry, account, new service or additional runtime library is introduced. Font licences remain separately in `../fonts/`.

# Deploy the final personal site on Vercel

Import `Shubham-Gupta-coder/site-prototypes`, branch `main`.

| Setting | Value |
|---|---|
| Root Directory | repository root (`.`; leave the field empty if the UI uses empty for root) |
| Framework Preset | Other |
| Install Command | skipped (empty string in `vercel.json`) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 22.x or 24.x |

`vercel.json` defines framework/build/install/output explicitly. Clear stale
project overrides if they conflict, and especially ensure Root Directory is the
repository root, not `video/` or `v9.6/shutter/`. Root Directory is a dashboard
setting, not a valid `vercel.json` key. Redeploy the latest `main` commit after
updating an existing project; an old deployment does not acquire new files.
No environment variables, framework adapter, external CDN or dependencies are
required. Both `bun install` and `npm install` work at the repository root;
Vercel skips installation entirely because this build needs only Node built-ins.

## What gets served

`npm run build` copies only final `v9.6/shutter/` runtime files and its assets,
fonts, stills and licensed vendor files into a fresh `dist/`. At `/` visitors
see the final personal site, not the prototype index. Asset paths, module imports,
workers and fonts retain their original relative layout. No SPA catch-all rewrite
is needed: navigation uses in-page anchors and unknown file paths should be 404.

Archives, other versions, documentation, source tooling and videos remain in Git
but are not in the public output. `.vercelignore` also excludes large historical
inputs from CLI uploads; the build allowlist is the public-output boundary.
Do not change output to `.` or deploy the entire repository as static files.

## Local checks

```sh
npm install
npm run build
npm test
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`. Bun users can run `bun install` and `bun run build`.
The dependency-free test checks byte identity, referenced HTML/CSS resources and
required JS/worker/vendor files, excludes archive/tooling files and preserves
`noindex`. Desktop uses the existing film; narrow screens and reduced-motion use
the existing authored light fallback. No design, film or copy changes are made.

The existing `noindex, nofollow` and relative social-image metadata are unchanged.
No domain/canonical/indexing decision is inferred. GitHub Pages remains disabled.
Repository readiness does not establish successful Vercel deployment: existing
project connection, account access and dashboard root settings must be verified
in Vercel separately. No Vercel account-side settings were changed by this commit.

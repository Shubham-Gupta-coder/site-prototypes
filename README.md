# Shubham Gupta — personal website archive

**Final website: [`v9.6/shutter/`](v9.6/shutter/).**
All earlier preview versions and their history remain preserved.

**GitHub Pages hosting has been retired at the owner’s request.** Historical
preview links in older handoffs and in the video are no longer live. Pushing to
`main` must not be treated as a hosting instruction. No production domain was
selected; the final website retains its existing `noindex` setting.

## Vercel production build

See [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md). Import from the repository
root; `npm run build` emits only the final personal site to `dist/`, served at `/`.
The archive index and video sources are not public deployment output.

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/v9.6/shutter/`. See that directory’s README and
`V9_6_HANDOFF.md` for the final device fallback and implementation guide.

## Final video and handoff

- [`video/README.md`](video/README.md): editable native Hyperframes project,
  browser-tour adapter, frozen website source, reproduction and QA.
- [Release downloads](https://github.com/Shubham-Gupta-coder/site-prototypes/releases/tag/v9.6-handoff):
  final 1080p MP4 and full-resolution editable capture track, outside Git history.
- [`FINAL_HANDOFF.md`](FINAL_HANDOFF.md): hosting scope and archive inventory.

Older `V9_*_HANDOFF.md` and `docs/` files are historical development records;
their publication instructions and “current version” labels are superseded here.

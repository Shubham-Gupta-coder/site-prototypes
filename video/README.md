# Final website browser tour

64 seconds, 1920 × 1080, 30 fps, silent H.264. Nothing posted to X.

Download the final MP4 and editable full-resolution source track from the
[v9.6 handoff release](https://github.com/Shubham-Gupta-coder/site-prototypes/releases/tag/v9.6-handoff).
Put `shubham-gupta-site-tour.mp4` here and `browser-tour-capture.mp4` in `assets/`.
Large videos are release assets, not Git blobs.

## What this is
Faithful offline deterministic rendering of the actual v9.6 website with authored
neutral browser chrome, cursor and pacing—not an uninterrupted real-time screen
recording or hardware-performance proof. The last second deliberately holds the
mobile Review composition. All original site art, copy, libraries and licences
are preserved in `assets/site/`; `source-manifest.json` fingerprints 62 files from
website commit `55291e8a44939c9f74f84220136e692b01c0d20c`.
Historical preview addresses shown in the recording are now retired.

## Timing
0–2s hero; 2–44.5s film; 44.5–49s approach; 49–52s expertise and retrieval
interaction; 52–58s Verslay/contact; 58–63s actual responsive light route;
63–64s mobile hold.

## Reproduce / edit
Requirements: Python 3, Playwright and Pillow (`pip install playwright pillow`),
Google Chrome at `/usr/bin/google-chrome`, FFmpeg/FFprobe and Node/npm.
Create `review/` and `assets/` if absent. Work from this directory.

1. Keep `assets/site/` unchanged; edit `tour.js` and `capture/browser-template.html`.
2. `python3 capture/build.py`
3. `python3 capture/render.py` (or `--benchmark` for a two-second sample).
   Fresh unsigned-in Chromium is used. Only localhost port 8896 is allowed.
4. The raw capture includes an obsolete desktop return at 63s. Match the approved
   ending before exporting (input is renamed so it is never overwritten in place):

```sh
mv assets/browser-tour-capture.mp4 assets/browser-tour-raw.mp4
ffmpeg -i assets/browser-tour-raw.mp4 -vf 'trim=duration=63,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1' -t 64 -r 30 -an -c:v libx264 -crf 10 -pix_fmt yuv420p -movflags +faststart assets/browser-tour-capture.mp4
```

5. `npx --yes hyperframes@0.9.21 check --budget 3m`
6. `npx --yes hyperframes@0.9.21 render --fps 30 --workers 1 --low-memory-mode --video-frame-format png --quality looks --max-bitrate 16M --keyframe-interval 2 -o shubham-gupta-site-tour.mp4`
7. `python3 verify.py` verifies decoding, format, all-frame blank checks and site
   fingerprints and regenerates poster/contact sheet/manifest/checksums.

`index.html` is the editable native Hyperframes project using the source track.
The release source track already includes the ending fix: steps 2–4 are only
needed when recapturing. Reproduction preserves timing/content, not byte-identical
encoding across browser, GPU and encoder versions. QA metadata under `review/`
describes the delivered export, not physical-device performance. X upload and
recompression acceptance remain untested.

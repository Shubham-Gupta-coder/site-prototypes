#!/usr/bin/env python3
"""Optional browser smoke test (needs: pip install playwright && python -m playwright install chromium).

Usage:  python3 -m http.server 8765        # from the repo root, in another terminal
        python3 tools/smoke.py [--url http://localhost:8765/v9/shutter/] [--chrome /path/to/chrome] [--out smoke-out]

Loads the page on desktop and phone sizes, with WebGL and with reduced motion, checks for console
errors and failed requests, tests the skip link, and saves screenshots of film moments and the ending.
Headless software WebGL is slow: frame times here say nothing about real devices.
"""
import argparse, asyncio, pathlib, sys
try:
    from playwright.async_api import async_playwright
except ImportError:
    sys.exit('playwright is not installed: pip install playwright && python -m playwright install chromium')

ap = argparse.ArgumentParser()
ap.add_argument('--url', default='http://localhost:8765/v9/shutter/')
ap.add_argument('--chrome', default=None, help='optional Chrome binary; default is Playwright chromium')
ap.add_argument('--out', default='smoke-out')
a = ap.parse_args()
OUT = pathlib.Path(a.out); OUT.mkdir(exist_ok=True)
GL = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox']
MOMENTS = [0, 14, 30, 46, 60, 71, 80, 97]

async def run(p, tag, w, h, mobile, reduced=False):
    b = await p.chromium.launch(executable_path=a.chrome, args=GL)
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                              is_mobile=mobile, has_touch=mobile, reduced_motion='reduce' if reduced else 'no-preference')
    pg = await ctx.new_page(); errs, bad = [], []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('response', lambda r: bad.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    await pg.goto(a.url); await pg.wait_for_timeout(2000)
    nogl = await pg.evaluate("document.body.classList.contains('nogl')")
    if not nogl:
        await pg.wait_for_function('window.__film && window.__film.ready', timeout=180000)
        for T in MOMENTS:
            await pg.evaluate(f'window.__film.set({T})'); await pg.wait_for_timeout(200)
            await pg.evaluate(f'window.__film.set({T})'); await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(OUT / f'{tag}-T{T:03d}.png'))
        await pg.evaluate('window.__film.release()')
    else:
        await pg.screenshot(path=str(OUT / f'{tag}-static.png'))
    await pg.keyboard.press('Tab')
    skip = await pg.evaluate('document.activeElement.getAttribute("href")')
    await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
    await pg.screenshot(path=str(OUT / f'{tag}-ending.png'))
    await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); await pg.wait_for_timeout(1500)
    await pg.screenshot(path=str(OUT / f'{tag}-contact.png'))
    ok = not errs and not bad and skip == '#problems'
    print(f"{'ok ' if ok else 'FAIL'} {tag}: static={nogl} skip={skip} errors={errs} failed={bad}")
    await b.close(); return ok

async def main():
    async with async_playwright() as p:
        r = [await run(p, 'desktop', 1440, 900, False), await run(p, 'phone', 390, 844, True),
             await run(p, 'reduced', 1440, 900, False, reduced=True)]
    print('screenshots in', OUT.resolve()); sys.exit(0 if all(r) else 1)
asyncio.run(main())

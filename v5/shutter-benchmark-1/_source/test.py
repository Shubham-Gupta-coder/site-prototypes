import sys, asyncio, json, os
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/index.html'
OUT='/workspace/shubham-site-notes/gen5/shots'
MODE=sys.argv[2] if len(sys.argv)>2 else 'all'   # all | frames | fps
STEP=float(sys.argv[3]) if len(sys.argv)>3 else 0.02
exec(open('/tmp/audit.txt').read())
PRE=os.environ.get('PRE','')
async def run(b,w,h,tag,mobile):
    ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=(2 if mobile else 1),is_mobile=mobile,has_touch=mobile)
    pg=await ctx.new_page(); e=[]; logs=[]
    pg.on('console', lambda m: (e.append(m.text) if m.type=='error' else logs.append(m.type+': '+m.text)))
    pg.on('pageerror', lambda x: e.append(str(x)))
    await pg.goto(URL); 
    await pg.wait_for_function('window.__film && window.__film.built>=window.__film.NS', timeout=180000)
    await pg.wait_for_timeout(800)
    r={'errors':e,'logs':logs[:30],'audit':{},'stats':await pg.evaluate('window.__film.stats')}
    if MODE in('all','frames'):
        n=int(round(1/STEP))
        for i in range(n+1):
            q=i*STEP
            FE=await pg.evaluate('window.__film.FILM_END')
            if q<=0.94: T=q/0.94*FE; c=0
            else: T=FE; c=min(1,(q-0.94)/0.02)
            T=await pg.evaluate(f'window.__film.settleT({T})')
            await pg.evaluate(f'window.__film.set({T},{c})'); await pg.wait_for_timeout(60)
            await pg.evaluate(f'window.__film.set({T},{c})'); await pg.wait_for_timeout(120)
            await pg.screenshot(path=f'{OUT}/{PRE}{tag}-{int(round(q*100)):03d}.png')
            a=await pg.evaluate(AUDIT)
            if a: r['audit'][f'{q:.2f}']=a[:4]
    if MODE in('all','fps'):
        await pg.evaluate('window.__film.release(); window.scrollTo(0,0)'); await pg.wait_for_timeout(1000)
        await pg.evaluate('window.__ft.length=0; window.__js.length=0')
        H=await pg.evaluate('document.documentElement.scrollHeight')
        await pg.mouse.move(w/2,h/2)
        for k in range(80):
            await pg.mouse.wheel(0,H/100); await pg.wait_for_timeout(100)
        ft=await pg.evaluate('window.__ft.slice()'); js=sorted(await pg.evaluate('window.__js.slice(5)'))
        ft=sorted(ft[5:]); 
        if ft: r['fps']={'frames':len(ft),'avg_fps':round(1000/(sum(ft)/len(ft)),1),'median_ms':round(ft[len(ft)//2],1),'p95_ms':round(ft[int(len(ft)*.95)],1),'level':await pg.evaluate('window.__film.level()'),'T_end':await pg.evaluate('window.__film.T'),'js_median_ms':round(js[len(js)//2],2) if js else None,'js_p95_ms':round(js[int(len(js)*.95)],2) if js else None}
    await ctx.close(); return r
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        res={}
        for w,h,tag,mob in [(1440,900,'d',False),(390,844,'m',True)]:
            if os.environ.get('ONLY') and os.environ['ONLY']!=tag: continue
            res[tag]=await run(b,w,h,tag,mob)
        await b.close(); print(json.dumps(res,indent=1))
asyncio.run(main())

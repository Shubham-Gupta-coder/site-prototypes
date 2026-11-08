"""Offline media rendering only: fresh unsigned-in headless context, local preserved site.
No connection to a desktop session/profile. Capture source code is not published.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,time,json,sys,threading,http.server,functools
B=Path(__file__).resolve().parent.parent;benchmark='--benchmark' in sys.argv;FPS=30;START=18 if benchmark else 0;DURATION=2 if benchmark else 64;OUT=B/('review/offline-benchmark.mp4' if benchmark else 'assets/browser-tour-capture.mp4')
Handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(B))
class Quiet(Handler.func):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',8896),functools.partial(Quiet,directory=str(B)));threading.Thread(target=server.serve_forever,daemon=True).start()
proc=None;start=time.perf_counter();samples=[];errors=[];console=[];bad=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage'])
 c=browser.new_context(viewport={'width':1920,'height':1080},device_scale_factor=1)
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8896/') else r.abort())
 pg=c.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda m:console.append(m.text) if m.type=='error' else None);pg.on('response',lambda r:bad.append([r.url,r.status]) if r.status>=400 else None)
 pg.goto('http://127.0.0.1:8896/capture/offline.html',wait_until='domcontentloaded');pg.evaluate('window.__offlineReady');assert pg.evaluate('__tour.ready')
 for t in [0,13,24,43,48,50.9,51.8,54,57,58.5,62.5,63.5]:
  pg.evaluate('t=>__offlineDraw(t)',t);pg.screenshot(path=str(B/'review'/f'offline-{t:04.1f}.png'))
 print('Ready native site, frame route',pg.evaluate('__tour.routes'),'initialization+preview seconds',round(time.perf_counter()-start,2),flush=True)
 cmd=['ffmpeg','-y','-loglevel','warning','-f','image2pipe','-framerate',str(FPS),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','10','-profile:v','high','-pix_fmt','yuv420p','-threads','2','-g','30','-movflags','+faststart',str(OUT)]
 log=(B/'review'/('offline-benchmark-encode.log' if benchmark else 'offline-capture-encode.log')).open('w');proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
 try:
  for i in range(round(DURATION*FPS)):
   t=START+i/FPS;result=pg.evaluate('t=>__offlineDraw(t)',t);data=pg.screenshot(type='png',animations='allow');proc.stdin.write(data)
   if i%30==0:
    elapsed=time.perf_counter()-start;print(f'CAPTURE {i}/{DURATION*FPS} t={t:.3f} elapsed={elapsed:.1f}s',flush=True);samples.append({'i':i,'t':t,'T':result['T'],'elapsed':elapsed})
   if errors or console or bad:raise RuntimeError({'pageErrors':errors,'consoleErrors':console,'badResponses':bad})
  proc.stdin.close();code=proc.wait(timeout=120);assert code==0,code
 finally:
  if proc.poll() is None:proc.kill()
  browser.close();server.shutdown();log.close()
report={'source':'Byte-preserved v9.6 site, offline fresh Chromium context; reconstructed neutral browser chrome','width':1920,'height':1080,'fps':FPS,'duration':DURATION,'frames':DURATION*FPS,'output':str(OUT.relative_to(B)),'elapsedSeconds':time.perf_counter()-start,'pageErrors':errors,'consoleErrors':console,'badResponses':bad,'samples':samples}
(B/'review'/('offline-benchmark-report.json' if benchmark else 'capture-report.json')).write_text(json.dumps(report,indent=2)+'\n');print('CAPTURE COMPLETE',report['output'],round(report['elapsedSeconds'],1),'seconds',flush=True)

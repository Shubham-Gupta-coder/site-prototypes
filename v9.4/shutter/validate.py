#!/usr/bin/env python3
"""Read-only validation of this personal-site review version."""
from pathlib import Path
from html.parser import HTMLParser
import re,sys,subprocess,xml.etree.ElementTree as E
D=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent
class H(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.data=[];self.scripts=[]
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  if t=='a':self.links.append(a.get('href',''))
  if t=='script' and 'src' in a:self.scripts.append(a['src'])
 def handle_data(self,s):self.data.append(s)
h=H();html=(D/'index.html').read_text();h.feed(html);plain=re.sub(r'\s+',' ',' '.join(h.data))
assert len(h.ids)==len(set(h.ids)), 'Duplicate ID'
assert {'film','approach','expertise','experience','contact','site-loader','site-main','film-progress','skill-agents','skill-data','skill-web','skill-cloud','skill-tools'}<=set(h.ids)
assert all(v[1:] in h.ids for v in h.links if v.startswith('#'))
assert [x for x in h.links if x.startswith('http')]==['https://wa.me/918077215310','https://www.linkedin.com/in/expert-shubham-gupta/']
assert 'To me the tech doesn’t matter, solving the problem does.' in plain
assert plain.count('Built autonomous AI systems for businesses across India.')==1
assert plain.count('I built the entire platform.')==1 and 'Technical founder' in plain
assert '<section class="proof"' not in html
assert 'noindex, nofollow' in html and 'rel="canonical"' not in html
assert 'og:image:width' in html and '1200' in html and 'twitter:card' in html
assert not any(x.startswith('http') for x in h.scripts)
assert 'cdn.jsdelivr.net' not in html
for f in [*D.glob('*.js'),D/'index.html',D/'personal.css',D/'polish.css']:
 s=f.read_text()
 for q in re.findall(r'\?v=([\w.]+)',s):assert q=='v9_4a',(f.name,q)
for f in D.glob('*.js'):
 r=subprocess.run(['node','--input-type=module','--check'],input=f.read_text(),text=True,capture_output=True);assert r.returncode==0,(f.name,r.stderr)
assets=['capability-atlas','etched-grain','compute-rack','workspace','agent-control','memory','machined-gear','context-core','chat','docs','sheet','inbox','calendar','report','bridge-deck','system-plan','hub-mark']
for name in assets+['favicon']:assert 'viewBox' in E.parse(D/f'assets/{name}.svg').getroot().attrib
for f in ['assets/social-card.jpg','assets/favicon-32.png','assets/apple-touch-icon.png','vendor/three.module.js','vendor/lenis.min.js','vendor/THREE-LICENSE.txt','vendor/LENIS-LICENSE.txt']:assert (D/f).stat().st_size>100
for n in ['rise','joined','runs','scattered','plan','whole']:assert (D/f'stills/{n}.jpg').stat().st_size>10000
film=(D/'film.js').read_text();site=(D/'site.js').read_text();vector=(D/'vector-world.js').read_text()
assert 'firstFrame' in film and 'await vectors.ready' in film and 'resolveFirstFrame' in film
assert 'await Promise.all([fonts,engine])' in site and "root.dataset.siteState='ready'" in site
assert '10000' in html and 'window.__siteEarlyFallback' in html
assert 'lenis?.destroy()' in film
assert 'stableHeight' in film and 'headerInset' in film and 'builderWorker?.terminate()' in film
assert 'U.uTime.value=T;' in film and 'Float32Array(18)' in film
assert not re.search(r'Date\.now|setInterval|requestAnimationFrame',vector+(D/'studio.js').read_text())
assert 'stroke-dashoffset' in (D/'personal.css').read_text()
css=(D/'experience.css').read_text()
assert not re.search(r'animation-timeline|scroll-timeline|view-timeline|perspective\s*:|rotate[XY]\s*\(',css)
assert 'IntersectionObserver' not in site
assert 'header.inert=!show' in site and 'progress.hidden=next' in site
assert 'window.__shell?.update(T)' in film
assert 'role="progressbar"' in html and 'aria-valuemax="100"' in html
assert html.count('name="capability"')==5 and ':has(#skill-cloud:checked)' in css
assert 'prefers-reduced-motion' in css
assert 'solving the problem' in (D/'COPY_AUDIT.md').read_text()
print('PASS: personal copy, two authorized contacts, anchors, local licences/assets, cache, readiness, deterministic film, hero/progress hooks, native controls and 2D motion constraints')

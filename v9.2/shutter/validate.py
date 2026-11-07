#!/usr/bin/env python3
"""Read-only, stdlib validation of the standalone version payload."""
import re,json,hashlib,subprocess,sys,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
HERE=Path(__file__).resolve().parent
D=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else (HERE if (HERE/'index.html').exists() else HERE/'payload')
class H(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.links=[]
 def handle_data(self,s):self.text.append(s)
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='a':self.links.append(a.get('href',''))
h=H();html=(D/'index.html').read_text();h.feed(html)
plain=re.sub(r'\s+',' ',' '.join(h.text))
assert 'Verslay’s technical founder. I built the entire platform. My co-founder runs sales.' in plain
assert [v for v in h.links if v.startswith('http')]==['https://wa.me/918077215310']
for p in list(D.glob('*.js'))+[D/'index.html',D/'polish.css',D/'README.md']:
 s=p.read_text();assert not re.search('linkedin',s,re.I),str(p)
 assert not re.search(r'(?:/workspace/|user_query|BEGIN .*PRIVATE KEY)',s,re.I),str(p)
 for q in re.findall(r'\?v=([\w.]+)',s):assert q=='v9_2a',(p,q)
for p in D.glob('*.js'):
 r=subprocess.run(['node','--input-type=module','--check'],input=p.read_text(),text=True,capture_output=True);assert r.returncode==0,(p,r.stderr)
assets=list((D/'assets').glob('*.svg'));assert len(assets)==15,len(assets)
for p in assets:
 root=ET.parse(p).getroot();assert 'viewBox' in root.attrib
 assert not re.search(r'<script|<foreignObject|https?://(?!www.w3.org)',p.read_text()),p
for n in ['rise','joined','runs','scattered','plan','whole']:assert (D/f'stills/{n}.jpg').stat().st_size>10000
v=(D/'vector-world.js').read_text();f=(D/'film.js').read_text();s=(D/'shapes.js').read_text()
assert 'length:18' in v and 'Float32Array(18)' in f and 'uVector[18]' in f
assert 'Math.random=rng(1709+i*997)' in s
assert 'U.uTime.value=T;' in f and 'gA<45' in f
assert 'gA>=15&&gA<=18?uVector[8]' in f
assert 'QUALITY_STEPS' in f
assert not re.search(r'Date\.now|setInterval|requestAnimationFrame',v+(D/'studio.js').read_text())
for p in (D/'fonts').glob('*'):assert p.stat().st_size>0
assert len(list((D/'fonts').glob('*OFL*')))+len(list((D/'fonts').glob('*LICENSE*')))>0
print('PASS: module syntax, copy/contact, native SVG assets, cache key, masks, deterministic operation, static alternatives and licences')

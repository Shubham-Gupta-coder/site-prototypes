#!/usr/bin/env python3
"""Public-safe stdlib validation of the separate v9.1 artifact."""
from pathlib import Path
from html.parser import HTMLParser
import re,xml.etree.ElementTree as ET
D=Path(__file__).resolve().parent
errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
for name in ['index.html','film.js','shapes.js','lib.js','worker.js','copy.js','vector-world.js']:
 s=(D/name).read_text()
 versions=set(re.findall(r'\?v=([\w]+)',s))
 check(not versions or versions=={'v9_1a'},f'{name}: inconsistent cache versions {versions}')
 for target in re.findall(r"(?:from\s*|import\s*\()\s*['\"](\./[^'\"?]+)",s):check((D/target).is_file(),f'{name}: missing {target}')
check(len(list((D/'assets').glob('*.svg')))==13,'Expected thirteen native SVG assets')
for f in (D/'assets').glob('*.svg'):
 root=ET.parse(f).getroot();check('viewBox' in root.attrib,f'{f.name}: missing viewBox')
 s=f.read_text();check(not re.search(r'<(?:script|image|foreignObject)\b',s),f'{f.name}: must be self-contained editable vectors')
 check(not re.search(r'(?:href|src)=[\"\']https?://',s),f'{f.name}: external resource')
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ignore=0;self.visible=[];self.links=[]
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.ignore+=1
  if t=='a':self.links.extend(v for k,v in a if k=='href' and v.startswith('http'))
 def handle_endtag(self,t):
  if t in ['script','style']:self.ignore-=1
 def handle_data(self,d):
  if not self.ignore:self.visible.append(d)
p=Page();p.feed((D/'index.html').read_text());text=' '.join(p.visible)
check(not re.search(r'\d',text),'Digit in visible copy')
check('—' not in text,'Em dash in visible copy')
check(len(p.links)==1 and 'linkedin.com' in p.links[0],'Expected one unchanged LinkedIn external link')
check(not re.search(r'\b(retail|ecommerce|payment|payments|dues)\b',text,re.I),'Commerce wording in visible copy')
check('Scroll to explore' in text,'Scroll cue missing')
check('id="problems"' in (D/'index.html').read_text(),'Normal ending missing')
check(len(list((D/'fonts').glob('*OFL*')))+len(list((D/'fonts').glob('*LICEN*')))>0,'Font licenses missing')
for f in ['rise','joined','runs','scattered','plan','whole']:check((D/f'stills/{f}.jpg').is_file(),f'Missing fallback {f}')
if errors:raise SystemExit('\n'.join(errors))
print('PASS: SVGs, local imports, cache key, copy, ending, fallback stills and font licenses')

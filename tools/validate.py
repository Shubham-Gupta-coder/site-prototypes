#!/usr/bin/env python3
"""Lightweight, dependency-free checks for a site build (default: v9/shutter).

Usage:  python3 tools/validate.py [v9/shutter]
Checks: visible copy (no digits, banned words, exact founder line, one contact link),
        copy keys baked into index.html, local assets exist, one cache-bust version,
        font licences present. Exit code 1 on any failure.
"""
import re, sys, pathlib
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'v9/shutter')
FOUNDER = 'Verslay’s technical founder. I built the entire platform. My co-founder runs sales.'
CONTACT = 'https://www.linkedin.com/in/expert-shubham-gupta/'
BANNED = ['payment', 'checkout', 'whatsapp', 'shopify', 'razorpay', 'cinzel', 'tourney', 'only technical founder',
          'calendly', 'lorem', 'todo']
fails, notes = [], []
def bad(m): fails.append(m)

html = (SITE / 'index.html').read_text(encoding='utf-8')
copy = (SITE / 'copy.js').read_text(encoding='utf-8')

class Text(HTMLParser):
    def __init__(s): super().__init__(); s.skip = 0; s.out = []; s.links = []; s.alts = []
    def handle_starttag(s, t, a):
        a = dict(a)
        if t in ('script', 'style', 'noscript'): s.skip += 1
        if t == 'a' and a.get('href', '').startswith('http'): s.links.append(a['href'])
        if t == 'img': s.alts.append(a.get('alt', ''))
    def handle_endtag(s, t):
        if t in ('script', 'style', 'noscript'): s.skip -= 1
    def handle_data(s, d):
        if not s.skip: s.out.append(d)
p = Text(); p.feed(html)
text = re.sub(r'\s+', ' ', ' '.join(p.out + p.alts)).strip()
title = re.search(r'<title>(.*?)</title>', html).group(1)

# copy
if re.search(r'\d', text): bad('visible digits: ' + ', '.join(sorted(set(re.findall(r'\S*\d\S*', text)))))
low = text.lower() + ' ' + copy.lower()
for w in BANNED:
    if w in low: bad(f'banned word present: {w!r}')
if re.search(r'\border(s|ed|ing)?\b', text.lower()): bad('commerce word "order" in visible copy')
if text.count(FOUNDER) != 1: bad(f'founder line must appear exactly once (found {text.count(FOUNDER)})')
if 'Verslay' in text.replace(FOUNDER, ''): bad('Verslay mentioned outside the founder line')
ext = [l for l in p.links]
if ext != [CONTACT]: bad(f'expected exactly one external link to LinkedIn, found {ext}')
notes.append(f'name mentions (visible): {text.count("Shubham")}; words: {len(text.split())}; title: {title}')

# copy keys
keys = set(re.findall(r"^\s*(\w+)\s*:", copy.split('export const COPY')[1].split('};')[0], re.M)) if 'export const COPY' in copy else set()
for k in set(re.findall(r'data-copy="(\w+)"', html)):
    if keys and k not in keys: bad(f'data-copy key not in copy.js: {k}')

# assets + cache-bust
refs = re.findall(r'(?:src|href)=["\'](\./[^"\'#]+)', html)
refs += re.findall(r"url\(\"?(\./[^\")]+)", html)
refs += re.findall(r"import\('(\./[^']+)'\)", html)
for f in sorted(SITE.glob('*.js')):
    refs += [m for m in re.findall(r"['\"](\./[^'\"]+\.(?:js|woff2?|png|jpg|svg))", f.read_text(encoding='utf-8'))]
vers = set()
for r in set(refs):
    path, _, q = r.partition('?')
    if q.startswith('v='): vers.add(q[2:])
    if not (SITE / path).exists(): bad(f'missing asset: {r}')
if len(vers) > 1: bad(f'mixed cache-bust versions: {sorted(vers)}')
notes.append(f'local refs checked: {len(set(refs))}; cache version: {", ".join(sorted(vers)) or "none"}')
for f in (SITE / 'fonts').glob('*.woff*'):
    pass
if not list((SITE / 'fonts').glob('OFL*.txt')): bad('font licence files missing in fonts/')

for n in notes: print('  ' + n)
if fails:
    print('FAIL'); [print('  - ' + f) for f in fails]; sys.exit(1)
print('OK', SITE.relative_to(ROOT))

#!/usr/bin/env python3
"""Keep the first-paint inline styles in sync with their editable source files."""
from pathlib import Path
import re
D=Path(__file__).resolve().parent;p=D/'index.html';h=p.read_text();m=re.search(r'<style>(.*?)</style>',h,re.S);assert m
marker='/* v9.2: the same world'
assert marker in m[1], 'Approved base-style boundary missing'
base=m[1].split(marker,1)[0]
css=base+(D/'polish.css').read_text()+'\n'+(D/'personal.css').read_text()
p.write_text(h[:m.start(1)]+css+h[m.end(1):]);print('Synced inline first-paint styles')

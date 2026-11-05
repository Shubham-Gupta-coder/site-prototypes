// Bakes copy.js into index.html so the page reads without JS and the copy check sees the words.
// copy.js stays the single source: edit it, then run `node bake.mjs`. The page also fills from copy.js at load.
import {readFileSync,writeFileSync} from 'node:fs';
import {COPY} from './copy.js';
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let h=readFileSync(new URL('./index.html',import.meta.url),'utf8');let n=0;
h=h.replace(/(<(\w+)([^>]*?)\sdata-copy="(\w+)"([^>]*)>)([^<]*)(<\/\2>)/g,(m,open,tag,a,k,b,inner,close)=>{if(!(k in COPY))throw new Error('no copy key '+k);n++;return open+esc(COPY[k])+close});
h=h.replace(/data-copy-href="(\w+)" href="[^"]*"/g,(m,k)=>{n++;return `data-copy-href="${k}" href="${esc(COPY[k])}"`});
writeFileSync(new URL('./index.html',import.meta.url),h);console.log('baked',n,'slots');

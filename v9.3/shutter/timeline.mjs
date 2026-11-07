// Lists every timing anchor (film T) in the film, so a scene can be retimed without missing a key.
// Read only. Usage: node timeline.mjs [fromT] [toT]      e.g. node timeline.mjs 42 57
// Covers: film.js key tables (CAM, LOOK, SIZE, BULB1/2, AMB, TOP, BOT, MK, MLY, MLX, OFF*, REV), SEG t0/t1,
// inline T thresholds in HOOKS and frame() (T>56.5, ramp(70,70.7,T), T-33 ...), CARDS t:[in0,in1,out0,out1] in shapes.js,
// caption data-t in index.html. Anything it prints inside your window must move with the scene.
import {readFileSync} from 'node:fs';
const [lo,hi]=[+(process.argv[2]??0),+(process.argv[3]??105)];
const rd=f=>readFileSync(new URL('./'+f,import.meta.url),'utf8').split('\n');
const out=[];const add=(T,file,ln,what)=>{if(T>=lo&&T<=hi)out.push({T,file,ln,what})};
let cur='';
rd('film.js').forEach((l,i)=>{const ln=i+1;
 const m=/^\s*(?:const|let)\s+([A-Z][A-Z0-9_]*)\s*=/.exec(l);if(m)cur=['CAM','LOOK','SIZE','BULB1','BULB2','AMB','TOP','BOT','MK','MLY','MLX','OFFA','OFFB','OFFC','REV','HOOKS','SEG'].includes(m[1])?m[1]:'';
 if(/^const (VS|FS|CARD_VS|CARD_FS|BG)=/.test(l))cur='';
 const seg=/S\((K\.\w+|\d+),(K\.\w+|\d+),([\d.]+),([\d.]+)/.exec(l);
 if(seg){add(+seg[3],'film.js',ln,`SEG ${seg[1]}->${seg[2]} t0`);add(+seg[4],'film.js',ln,`SEG ${seg[1]}->${seg[2]} t1`);return}
 if(['CAM','LOOK','SIZE','BULB1','BULB2','AMB','TOP','BOT','MK','MLY','MLX','OFFA','OFFB','OFFC','REV'].includes(cur)||/^(const )?(OFFA|REV)/.test(l))
  for(const k of l.matchAll(/\[\[?(-?[\d.]+),/g))add(+k[1],'film.js',ln,`${cur} key`);
 for(const k of l.matchAll(/T\s*(?:>=|<=|>|<)\s*([\d.]+)|\(T-([\d.]+)\)|T-([\d.]+)|ramp\(([\d.]+),([\d.]+),T\)/g)){
  const v=[k[1],k[2],k[3],k[4],k[5]].filter(x=>x!=null);for(const x of v)add(+x,'film.js',ln,'inline T in '+(cur||'frame')+': '+k[0])}});
rd('shapes.js').forEach((l,i)=>{for(const k of l.matchAll(/\bt2?:\[([\d.]+),([\d.]+),([\d.]+),([\d.]+)\]/g))[1,2,3,4].forEach(j=>add(+k[j],'shapes.js',i+1,`card t:[${k[1]},${k[2]},${k[3]},${k[4]}]`))});
rd('index.html').forEach((l,i)=>{const m=/data-t="([\d.]+),([\d.]+)"/.exec(l);if(m){const c=/data-copy="(\w+)"/.exec(l);add(+m[1],'index.html',i+1,`caption ${c?c[1]:''} in`);add(+m[2],'index.html',i+1,`caption ${c?c[1]:''} out`)}});
// v9.2 authored-object assembly and scroll-derived mechanical poses.
rd('vector-world.js').forEach((l,i)=>{
 for(const m of l.matchAll(/T\s*(?:>=|<=|>|<)\s*([\d.]+)/g))add(+m[1],'vector-world.js',i+1,'SVG bridge/pose threshold');
 for(const m of l.matchAll(/hold\(T,([\d.]+),([\d.]+)(?:,([\d.]+),([\d.]+))?\)/g))for(const v of m.slice(1).filter(Boolean))add(+v,'vector-world.js',i+1,'SVG assembly/dissolve');
 for(const m of l.matchAll(/smooth\(([\d.]+),([\d.]+),T\)/g))for(const v of m.slice(1))add(+v,'vector-world.js',i+1,'SVG scroll-derived pose');
});
rd('studio.js').forEach((l,i)=>{for(const m of l.matchAll(/smooth\(([\d.]+),([\d.]+),T\)/g))for(const v of m.slice(1))add(+v,'studio.js',i+1,'studio light/material envelope');});
out.sort((a,b)=>a.T-b.T||a.file.localeCompare(b.file));
for(const o of out)console.log(String(o.T).padStart(6),' ',(o.file+':'+o.ln).padEnd(16),o.what);
console.log(`${out.length} anchors in T ${lo}..${hi}`);

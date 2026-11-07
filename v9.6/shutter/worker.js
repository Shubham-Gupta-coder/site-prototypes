// State builder: samples every scene into the dot pool off the main thread.
import {setScale,setRes,STATS} from './lib.js?v=v9_6a';
import {buildState,mobileLayout} from './shapes.js?v=v9_6a';
let N=0;
// local, licensed fonts (SIL OFL, files in ./fonts) so canvas type in the worker matches the page
async function loadFonts(list){await Promise.all((list||[]).map(o=>new FontFace(o.f,`url(${o.u})`,{weight:o.w||'400'}).load().then(ff=>self.fonts.add(ff)).catch(()=>{})))}
onmessage=async e=>{const m=e.data;
 if(m.init){N=m.N;setScale(m.scale);setRes(m.res);if(m.mobile)mobileLayout();await loadFonts(m.fonts);postMessage({ready:1});return}
 const t0=performance.now();const {P,C}=buildState(m.i,N);const st=STATS[STATS.length-1];
 postMessage({i:m.i,P,C,ms:Math.round(performance.now()-t0),stat:st},[P.buffer,C.buffer])};

// State builder: samples every scene into the dot pool off the main thread.
import {setScale,setRes,STATS} from './lib.js?v=s2';
import {buildState,mobileLayout} from './shapes.js?v=s2';
let N=0;
async function loadFonts(css){try{const t=await (await fetch(css)).text();const re=/@font-face\s*{([^}]*)}/g;let m;const out=[];
 while((m=re.exec(t))){const b=m[1];const fam=/font-family:\s*'([^']+)'/.exec(b),st=/font-style:\s*(\w+)/.exec(b),wt=/font-weight:\s*(\d+)/.exec(b),src=/url\(([^)]+)\)/.exec(b),ur=/unicode-range:\s*([^;]+)/.exec(b);
  if(!fam||!src)continue;if(ur&&!/U\+0000-00FF/.test(ur[1]))continue;
  const f=new FontFace(fam[1],`url(${src[1]})`,{style:st?st[1]:'normal',weight:wt?wt[1]:'400'});out.push(f.load().then(ff=>self.fonts.add(ff)).catch(()=>{}))}
 await Promise.all(out)}catch(e){}}
onmessage=async e=>{const m=e.data;
 if(m.init){N=m.N;setScale(m.scale);setRes(m.res);if(m.mobile)mobileLayout();await loadFonts(m.css);postMessage({ready:1});return}
 const t0=performance.now();const {P,C}=buildState(m.i,N);const st=STATS[STATS.length-1];
 postMessage({i:m.i,P,C,ms:Math.round(performance.now()-t0),stat:st},[P.buffer,C.buffer])};

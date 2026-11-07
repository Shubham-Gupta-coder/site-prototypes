import {COPY} from './copy.js?v=v9_6a';
import {Part,getCanvas,sampleCanvas,plane,box,cyl,tube,sphere,dust,assemble,fbm,vnoise,rotY,rotX,rng,SCALE} from './lib.js?v=v9_6a';
/* THE SHUTTER v7: the Apparatus. One dark-metal world under the business.
   GROUPS: 0 solid, 1 dust, 4 unread blink, 6 big gear (turns with scroll), 11 drawn connectors (reveal), 12 LED twinkle,
           13 bridges (reveal grows), 15 approval tick, 16 carton slide, 17 envelope, 18 calendar block, 24 spine packets, 25 voice wave
   PINS (131072 units): NAME 0, HUB 15000, VALVE 26000, SPINE 30000, TRAIN 41000, WORLD 47000..~103000. These dot ranges travel scene to scene.
   WORLD is generated from a fixed seed, so the territories keep every dot in place across scenes (floor dust in the forge, risen in the world, flat in the drawing). */
const C=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const J=(c,j=0.08)=>{const k=1+(Math.random()-0.5)*2*j;return[c[0]*k,c[1]*k,c[2]*k]};
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const sc=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
const R=()=>Math.random(),TAU=Math.PI*2;
const STEEL=C('#7d929f'),IRON=C('#354e60'),DARK=C('#152a3b'),BRASS=C('#aebfc6'),BONE=C('#e2ebed'),WARM=C('#e9cba2'),AMBER=C('#d6b584'),LED=C('#5fe09a'),COOL=C('#a7c2ce'),OX=C('#b89772'),ETCH=C('#a1bac6'),ETCHB=C('#dce9e9');
const FONT='"Big Shoulders Display", "Source Serif 4", Georgia, serif';
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function bar(ctx,x,y,w,h,col){ctx.fillStyle=col;rr(ctx,x,y,w,h,Math.min(h/2,w/2));ctx.fill()}

/* ================= layout (shared with film.js for camera + captions) ================= */
export const HUB={r:2.6,h:1.0};
export const TER={cloud:[-12,0,-8],app:[12,0,-8],gears:[11,0,7],data:[-11,0,7]};
export const RAIL={r:6.2,y:1.7};
export const TRAINS=[-0.75,0.75,2.7]; // ring angles
export const VALVE=[0,RAIL.y+0.75,RAIL.r];
export const RUN={y:2.2,z:5.5,x:[-6,0,6]};
export const GEAR0=[TER.gears[0]-1.6,2.9,TER.gears[2]];
export const ISL=[{k:'chat',c:[-10,4.4,17],ry:0.35},{k:'pay',c:[-5,6.4,20.5],ry:0.18},{k:'sheet',c:[0,3.6,23],ry:0},{k:'inbox',c:[5,6.2,20.5],ry:-0.18},{k:'cal',c:[10,4.2,17],ry:-0.35}];
export const ISLD=[-1.05,-0.52,0,0.52,1.05].map(a=>[16.5*Math.sin(a),0.9,16.5*Math.cos(a)]); // docked positions in the live scene
export const WIN_WH=[2.6,1.75];
export const SEAL={c:[0,4.6,0],r:4.3,R:5.0};
export const PEAKS=[[TER.cloud[0]-2.3,TER.cloud[2]-0.4],[TER.cloud[0]+3.2,TER.cloud[2]+0.8]];
let compactLayout=false;
export function mobileLayout(){if(compactLayout)return;compactLayout=true;
 const c=[[-4.6,4,18],[-2.7,7,19.8],[0,1.8,22.2],[2.7,7,19.8],[4.6,4,18]];
 ISL.forEach((q,i)=>{q.c.splice(0,3,...c[i]);q.ry*=.55});
}

/* ================= canvases ================= */
function nameDraw(ctx,W,H){ctx.font=`900 ${Math.round(H*0.74)}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
 const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#edf2f0');g.addColorStop(0.35,'#b7c9ce');g.addColorStop(0.6,'#eef2ef');g.addColorStop(1,'#b8c9ce');
 const t=COPY.sign;let fs=H*0.74,sp=H*0.06;let tw=0;for(const ch of t)tw+=ctx.measureText(ch).width+sp;tw-=sp;const k=Math.min(1,W*0.95/tw);fs*=k;sp*=k;ctx.font=`900 ${Math.round(fs)}px ${FONT}`;
 tw=0;for(const ch of t)tw+=ctx.measureText(ch).width+sp;tw-=sp;let x=W/2-tw/2;ctx.fillStyle=g;
 for(const ch of t){const w=ctx.measureText(ch).width;ctx.fillText(ch,x+w/2,H*0.54);x+=w+sp}}
const nameCv=()=>getCanvas('name',2800,400,nameDraw);
function plateDraw(ctx,W,H){ // brushed steel nameplate, riveted border, recessed band
 ctx.fillStyle='#49616f';ctx.fillRect(0,0,W,H);
 for(let y=0;y<H;y+=2){const k=0.75+0.35*vnoise(1,y/9)+0.12*Math.random();ctx.fillStyle=`rgba(${120*k|0},${128*k|0},${138*k|0},.55)`;ctx.fillRect(0,y,W,2)}
 ctx.fillStyle='rgba(12,14,17,.72)';rr(ctx,W*0.05,H*0.2,W*0.9,H*0.6,H*0.05);ctx.fill();
 ctx.strokeStyle='#aebfc6';ctx.lineWidth=H*0.03;ctx.strokeRect(H*0.06,H*0.06,W-H*0.12,H-H*0.12);
 ctx.strokeStyle='rgba(20,22,26,.9)';ctx.lineWidth=H*0.012;ctx.strokeRect(H*0.11,H*0.11,W-H*0.22,H-H*0.22);
 for(let x=H*0.09;x<=W-H*0.08;x+=W/22)for(const y of[H*0.035,H*0.965]){ctx.fillStyle='#1a1c20';ctx.beginPath();ctx.arc(x,y,H*0.022,0,7);ctx.fill();ctx.fillStyle='#d9c08a';ctx.beginPath();ctx.arc(x-1,y-1,H*0.014,0,7);ctx.fill()}}
function browserDraw(ctx,W,H){ctx.fillStyle='#10151c';ctx.fillRect(0,0,W,H);ctx.fillStyle='#232b36';ctx.fillRect(0,0,W,H*0.14);
 for(let i=0;i<3;i++){ctx.fillStyle=['#e0603a','#f2b04e','#5fe09a'][i];ctx.beginPath();ctx.arc(W*(0.04+i*0.04),H*0.07,H*0.03,0,7);ctx.fill()}
 bar(ctx,W*0.2,H*0.035,W*0.6,H*0.07,'#3a4554');
 bar(ctx,W*0.08,H*0.24,W*0.5,H*0.08,'#e2ebed');bar(ctx,W*0.08,H*0.36,W*0.35,H*0.05,'#8fa3b8');bar(ctx,W*0.08,H*0.46,W*0.18,H*0.08,'#b89772');
 for(let i=0;i<3;i++){ctx.fillStyle='#1d2632';rr(ctx,W*(0.08+i*0.3),H*0.62,W*0.26,H*0.3,8);ctx.fill();bar(ctx,W*(0.1+i*0.3),H*0.66,W*0.14,H*0.04,'#a7c2ce');bar(ctx,W*(0.1+i*0.3),H*0.74,W*0.2,H*0.03,'#55606e')}
 ctx.fillStyle='#2a3a52';rr(ctx,W*0.66,H*0.22,W*0.27,H*0.34,10);ctx.fill();ctx.strokeStyle='#a7c2ce';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<=10;i++){const x=W*(0.68+i*0.023),y=H*(0.5-0.2*Math.abs(Math.sin(i*0.9))*i/10);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
function winFrame(ctx,W,H,title){ctx.fillStyle='#0f141a';ctx.fillRect(0,0,W,H);ctx.fillStyle='#202833';ctx.fillRect(0,0,W,H*0.13);
 for(let i=0;i<3;i++){ctx.fillStyle='#4a5563';ctx.beginPath();ctx.arc(W*(0.04+i*0.035),H*0.065,H*0.025,0,7);ctx.fill()}
 ctx.strokeStyle='rgba(200,215,230,.35)';ctx.lineWidth=4;ctx.strokeRect(2,2,W-4,H-4);if(title){ctx.fillStyle='#c9d4de';ctx.font=`600 ${Math.round(H*0.07)}px ${FONT}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(title,W*0.16,H*0.067)}}
const WINS={
 chat(c,W,H){winFrame(c,W,H,COPY.chatApp);c.fillStyle='#0b141a';c.fillRect(4,H*0.13,W-8,H*0.85);
  [[0.2,0.55,0],[0.34,0.42,1],[0.48,0.6,0],[0.62,0.35,1],[0.76,0.5,0]].forEach(([y,w,o])=>{c.fillStyle=o?'#2a3a52':'#202c33';rr(c,o?W*(0.95-w):W*0.05,H*y,W*w,H*0.1,14);c.fill();bar(c,(o?W*(0.95-w):W*0.05)+20,H*y+H*0.04,W*w*0.6,H*0.025,'#d6dde2')})},
 pay(c,W,H){winFrame(c,W,H,'');c.fillStyle='#ece6d8';c.fillRect(W*0.2,H*0.17,W*0.6,H*0.8);c.fillStyle='#d9d1c0';c.fillRect(W*0.24,H*0.21,W*0.52,H*0.08);
  for(let i=0;i<9;i++)bar(c,W*0.25,H*(0.36+i*0.065),W*(0.5-((i*37)%5)*0.05),H*0.022,i%4===0?'#8a7350':'#7d8590');c.fillStyle='#aebfc6';c.fillRect(W*0.2,H*0.17,W*0.012,H*0.8)},
 sheet(c,W,H){winFrame(c,W,H,'');c.fillStyle='#f3f5f2';c.fillRect(W*0.04,H*0.18,W*0.92,H*0.76);c.strokeStyle='#b7c3b9';c.lineWidth=3;
  for(let i=0;i<=8;i++){c.beginPath();c.moveTo(W*0.04,H*(0.18+i*0.095));c.lineTo(W*0.96,H*(0.18+i*0.095));c.stroke()}for(let j=0;j<=6;j++){c.beginPath();c.moveTo(W*(0.04+j*0.153),H*0.18);c.lineTo(W*(0.04+j*0.153),H*0.94);c.stroke()}
  c.fillStyle='#1d7a43';c.fillRect(W*0.04,H*0.18,W*0.92,H*0.095);for(let i=1;i<8;i++)for(let j=0;j<6;j++){if((i*7+j*3)%4)bar(c,W*(0.055+j*0.153),H*(0.21+i*0.095),W*(0.05+((i*j)%5)*0.018),H*0.03,'#3b4a40')}},
 inbox(c,W,H){winFrame(c,W,H,'');c.fillStyle='#141a21';c.fillRect(4,H*0.13,W*0.22,H*0.85);for(let i=0;i<6;i++){const y=H*(0.18+i*0.13);c.fillStyle=i%2?'#161d25':'#1a222c';c.fillRect(W*0.27,y,W*0.7,H*0.12);
  if(i<3){c.fillStyle='#b89772';c.beginPath();c.arc(W*0.3,y+H*0.06,H*0.018,0,7);c.fill()}bar(c,W*0.33,y+H*0.03,W*0.22,H*0.03,i<3?'#e6edf3':'#8fa3b8');bar(c,W*0.33,y+H*0.075,W*0.5,H*0.022,'#55606e')}
  for(let i=0;i<5;i++)bar(c,W*0.03,H*(0.2+i*0.08),W*0.15,H*0.03,'#55606e')},
 cal(c,W,H){calDraw(c,W,H,false)}};
function calDraw(c,W,H,seated){winFrame(c,W,H,'');c.fillStyle='#f4f1ea';c.fillRect(W*0.04,H*0.17,W*0.92,H*0.78);c.strokeStyle='#c9c2b2';c.lineWidth=3;
 const x0=W*0.04,y0=H*0.26,cw=W*0.92/7,ch=H*0.69/5;c.fillStyle='#3b4652';c.fillRect(W*0.04,H*0.17,W*0.92,H*0.09);
 for(let i=0;i<=5;i++){c.beginPath();c.moveTo(x0,y0+i*ch);c.lineTo(x0+7*cw,y0+i*ch);c.stroke()}for(let j=0;j<=7;j++){c.beginPath();c.moveTo(x0+j*cw,y0);c.lineTo(x0+j*cw,y0+5*ch);c.stroke()}
 [[1,0],[3,1],[0,2],[4,2],[2,3],[6,1],[1,4],[5,3]].forEach(([j,i])=>{c.fillStyle='#8fa3b8';c.fillRect(x0+j*cw+8,y0+i*ch+10,cw-16,ch*0.35)});
 if(seated){c.fillStyle='#e8892f';c.fillRect(x0+5*cw+6,y0+1*ch+8,cw-12,ch-16);c.strokeStyle='#7a3410';c.lineWidth=5;c.strokeRect(x0+5*cw+6,y0+1*ch+8,cw-12,ch-16)}}
const winCv=k=>getCanvas('win-'+k,780,520,WINS[k]);
function chatCardDraw(c,W,H){c.fillStyle='#0b141a';c.fillRect(0,0,W,H);c.fillStyle='#1f2c34';c.fillRect(0,0,W,H*0.2);
 c.fillStyle='#aebfc6';c.beginPath();c.arc(W*0.08,H*0.1,H*0.06,0,7);c.fill();c.fillStyle='#e9edef';c.font=`600 ${Math.round(H*0.08)}px ${FONT}`;c.textBaseline='middle';c.fillText(COPY.chatApp,W*0.15,H*0.1);
 c.fillStyle='#202c33';rr(c,W*0.05,H*0.3,W*0.66,H*0.2,18);c.fill();c.fillStyle='#e9edef';c.font=`600 ${Math.round(H*0.085)}px ${FONT}`;c.fillText(COPY.chatAsk,W*0.08,H*0.4);
 c.fillStyle='#2a3a52';rr(c,W*0.36,H*0.58,W*0.59,H*0.2,18);c.fill();bar(c,W*0.4,H*0.645,W*0.42,H*0.03,'#cfe9df');bar(c,W*0.4,H*0.7,W*0.28,H*0.03,'#cfe9df')}
function payCardDraw(c,W,H,paid){c.fillStyle='#f5f2ea';c.fillRect(0,0,W,H);c.fillStyle='#0c2a4f';c.fillRect(0,0,W,H*0.24);c.fillStyle='#f5f2ea';c.font=`700 ${Math.round(H*0.085)}px ${FONT}`;c.textBaseline='middle';c.fillText(COPY.payBrand,W*0.07,H*0.12);
 c.fillStyle='#13213d';c.font=`700 ${Math.round(H*0.1)}px ${FONT}`;c.fillText(COPY.payTitle,W*0.07,H*0.38);bar(c,W*0.07,H*0.5,W*0.6,H*0.04,'#9aa6b5');bar(c,W*0.07,H*0.58,W*0.4,H*0.04,'#9aa6b5');
 c.fillStyle='#3d7bdb';rr(c,W*0.07,H*0.7,W*0.86,H*0.17,10);c.fill();c.fillStyle='#fff';c.textAlign='center';c.fillText(COPY.payButton,W*0.5,H*0.785);c.textAlign='left';
 if(paid){c.save();c.translate(W*0.6,H*0.5);c.rotate(-0.25);c.strokeStyle='#b3261e';c.lineWidth=H*0.025;c.strokeRect(-W*0.3,-H*0.13,W*0.6,H*0.26);c.fillStyle='#b3261e';c.font=`900 ${Math.round(H*0.17)}px ${FONT}`;c.textAlign='center';c.fillText(COPY.paid,0,H*0.01);c.restore()}}
function plaqueDraw(t){return(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#253e50');g.addColorStop(1,'#1c2024');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#aebfc6';c.lineWidth=H*0.06;c.strokeRect(H*0.05,H*0.05,W-H*0.1,H-H*0.1);
 c.fillStyle='#e2ebed';c.font=`700 ${Math.round(H*0.42)}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(t,W/2,H*0.53)}}

/* ================= samplers ================= */
const _uv=new Map();
function nameUV(n){const k='n'+n;if(!_uv.has(k))_uv.set(k,sampleCanvas(nameCv(),n,{edge:0.6,rand:rng(7)}));return _uv.get(k)}
// the name keeps the same dot for the same spot of every letter, so it travels as one piece between scenes
function namePart({c,Rv=[1,0,0],Uv=[0,1,0],w,h,col=null,em=0.15,zj=0.03,group=0}){const n=Math.round(14000*SCALE);const p=new Part(n+8);const Nn=[Rv[1]*Uv[2]-Rv[2]*Uv[1],Rv[2]*Uv[0]-Rv[0]*Uv[2],Rv[0]*Uv[1]-Rv[1]*Uv[0]];
 for(const[u,v,r,g,b]of nameUV(n)){const a=(u-0.5)*w,bb=(0.5-v)*h,z=(R()-0.5)*zj;const cc=col?J(col,0.06):[r,g,b];
  p.push(c[0]+Rv[0]*a+Uv[0]*bb+Nn[0]*z,c[1]+Rv[1]*a+Uv[1]*bb+Nn[1]*z,c[2]+Rv[2]*a+Uv[2]*bb+Nn[2]*z,cc[0],cc[1],cc[2],group,0,em)}
 p.at=0;return vectorTag(p,43)}
function pin(p,at,max){const m=Math.round(max*SCALE);if(p.n>m)p.n=m;p.at=at;return p}
const NM=n=>Math.round(n*SCALE);
// Mark exact replacement surfaces without changing stable IDs or coordinates.
// Offsets, packets, waveform and human approval marks retain their original groups.
function vectorTag(p,group,start=0){for(let i=start;i<p.n;i++){const k=i*4;p.p[k+3]=group+(p.p[k+3]%1)}return p}
function tagRange(p,group,start=0){for(let i=start;i<p.n;i++){const k=i*4;const old=Math.floor(p.p[k+3]);if(old===0)p.p[k+3]=group+(p.p[k+3]%1)}return p}

function capsule(p,n,{c,len=1.7,r=0.33,ry=0,lit=0,dim=1}){n=NM(n);for(let i=0;i<n;i++){let x,y,z;const t=R();
 if(t<0.8){const a=R()*TAU;x=(R()-0.5)*len;y=Math.cos(a)*r;z=Math.sin(a)*r}else{const s=R()<0.5?-1:1;let dx=R()*2-1,dy=R()*2-1,dz=R()*2-1;const l=Math.hypot(dx,dy,dz)||1;x=s*(len/2+Math.abs(dx/l)*r);y=dy/l*r;z=dz/l*r}
 const win=Math.abs(y-r*0.25)<r*0.22&&Math.abs(x)<len*0.42&&((x*6+10)%1)<0.7;const sh=0.55+0.45*Math.max(0,y/r*0.6+z/r*0.5+0.3);
 const col=win?(lit?WARM:sc(DARK,0.7)):sc(C('#b9bec5'),sh);const q=rotY([x,y,z],ry);p.push(c[0]+q[0],c[1]+q[1],c[2]+q[2],col[0]*dim,col[1]*dim,col[2]*dim,0,0,win&&lit?lit:0)}}
function ringPts(p,n,{c,r,y=0,w=0.03,col,em=0,group=0,reveal=null,plane='xz',a0=0,a1=TAU}){n=NM(n);for(let i=0;i<n;i++){const a=a0+R()*(a1-a0),rr2=r+(R()-0.5)*w;const cc=J(col,0.05);
 if(plane==='xz')p.push(c[0]+Math.sin(a)*rr2,c[1]+y+(R()-0.5)*w*0.3,c[2]+Math.cos(a)*rr2,cc[0],cc[1],cc[2],group,reveal?reveal(a):0,em);
 else p.push(c[0]+Math.cos(a)*rr2,c[1]+Math.sin(a)*rr2,c[2]+(R()-0.5)*w*0.4,cc[0],cc[1],cc[2],group,reveal?reveal(a):0,em)}}
function lineP(p,n,a,b,{w=0.03,col,em=0,group=0,r0=0,r1=1}){n=NM(n);for(let i=0;i<n;i++){const t=R();const cc=J(col,0.05);p.push(a[0]+(b[0]-a[0])*t+(R()-0.5)*w,a[1]+(b[1]-a[1])*t+(R()-0.5)*w*0.3,a[2]+(b[2]-a[2])*t+(R()-0.5)*w,cc[0],cc[1],cc[2],group,r0+(r1-r0)*t,em)}}
function rectP(p,n,cx,cz,w,d,{y=0.02,col=ETCH,group=0,em=0.35}){const per=n/4;const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;const tot=2*(w+d);
 lineP(p,n*w/tot,[x0,y,z0],[x1,y,z0],{col,group,em});lineP(p,n*w/tot,[x0,y,z1],[x1,y,z1],{col,group,em});lineP(p,n*d/tot,[x0,y,z0],[x0,y,z1],{col,group,em});lineP(p,n*d/tot,[x1,y,z0],[x1,y,z1],{col,group,em})}

/* ================= world pieces ================= */
function ground(parts,{k=1,dim=1,r=27,col=C('#253e50')}={}){const p=new Part(NM(12000*k)+10,true);const n=NM(12000*k);
 for(let i=0;i<n;i++){const a=R()*TAU,rad=Math.sqrt(R())*r;const x=Math.sin(a)*rad,z=Math.cos(a)*rad;const seam=(Math.abs(((x+100)%2.4)-1.2)>1.13)||(Math.abs(((z+100)%2.4)-1.2)>1.13);
  const f=(0.55+0.45*fbm(x*0.3+9,z*0.3))*(1-0.55*rad/r)*dim;const cc=seam?sc(C('#3f5c70'),f):sc(col,f*0.8);p.push(x,-0.02,z,cc[0],cc[1],cc[2],0,0,0)}parts.push(vectorTag(p,42))}
function mist(parts,k=1){const m=new Part(NM(2500*k)+10,true);dust(m,2500*k,{min:[TER.cloud[0]-7,3.5,TER.cloud[2]-4],max:[TER.cloud[0]+7,8,TER.cloud[2]+4],color:[110,130,160]});parts.push(m)}
function rackH(x,z){return 0.5+6.2*Math.exp(-((x+2.3)**2/6+(z+0.4)**2/4.5))+4.6*Math.exp(-((x-3.2)**2/4.5+(z-0.8)**2/5))+1.0*fbm(x*0.4+3,z*0.4)}
const RACKS=(()=>{const L=[];for(let x=-6.5;x<=6.51;x+=0.62)for(let z=-3.6;z<=3.61;z+=0.8){const h=rackH(x,z);if(h>0.85)L.push({x,z,h})}return L})();
// Cloud range: mountains made of server racks. Line-drawn: slot rows, front edges, roofs; a few LEDs
function cloudInto(p,{dim=1,lit=0.6}={}){const [cx,,cz]=TER.cloud;const tot=RACKS.reduce((a,q)=>a+q.h,0);
 for(const q of RACKS){const n=NM(16000*q.h/tot);const x0=cx+q.x,z0=cz+q.z,H=q.h,fz=z0+0.31;const nl=Math.max(1,Math.floor(H/0.2));
  for(let i=0;i<n;i++){const s=R();let x,y,z,cc,em=0,g=0;
   if(s<0.5){const li=Math.floor(R()*nl);y=(li+0.5)*H/nl;x=x0+(R()-0.5)*0.44;z=fz;cc=C('#8b939c');if(R()<0.07){cc=R()<0.7?LED:AMBER;em=lit;g=12}}
   else if(s<0.72){x=x0+(R()<0.5?-0.25:0.25);y=R()*H;z=fz;cc=C('#b9c0c8')}
   else if(s<0.84){x=x0+(R()-0.5)*0.5;z=z0+(R()-0.5)*0.62;y=H;cc=C('#717880')}
   else{x=x0+0.25;y=R()*H;z=z0+(R()-0.5)*0.62;cc=C('#363b42')}
   p.push(x,y,z,cc[0]*dim,cc[1]*dim,cc[2]*dim,g,0,em*dim)}}
 for(const [px,pz] of PEAKS){const h=rackH(px-cx,pz-cz);tube(p,250,{pts:[[px,h,pz],[px,h+0.9,pz]],rad:0.04,color:STEEL,dim});sphere(p,700,{c:[px,h+1.0,pz],r:0.75,squash:[1,0.28,1],color:()=>C('#aab1b9'),dim})}}
const TOWERS=(()=>{const L=[];const r=rng(31);for(let a=0;a<4;a++)for(let b=0;b<4;b++){const h=(2.6+5.4*r())*(1.18-b*0.16);L.push({x:(a-1.5)*2.5,z:(b-1.5)*2.3,h,seed:a*4+b})}return L})();
// App city: towers of floor plates. Corner edges, slab outlines, lit windows; browser screens on the three tallest
function appInto(p,{dim=1,lit=0.8}={}){const [cx,,cz]=TER.app;const fw=1.6,hw=fw/2,FL=0.42;const tot=TOWERS.reduce((a,t)=>a+t.h,0);const tall=[...TOWERS].sort((a,b)=>b.h-a.h).slice(0,3);
 for(const t of TOWERS){const n=NM(14000*t.h/tot);const nf=Math.max(1,Math.floor(t.h/FL));const X=cx+t.x,Z=cz+t.z;
  for(let i=0;i<n;i++){const s=R();let x,y,z,cc,em=0;
   if(s<0.22){const c=(R()*4)|0;x=X+(c&1?hw:-hw);z=Z+(c&2?hw:-hw);y=R()*t.h;cc=C('#aeb5bd')}
   else if(s<0.58){const fl=Math.floor(R()*(nf+1));y=Math.min(t.h,fl*FL);const e=R()*4*fw;const side=Math.floor(e/fw),u=(e%fw)-hw;
    if(side===0){x=X+u;z=Z+hw}else if(side===1){x=X+hw;z=Z+u}else if(side===2){x=X+u;z=Z-hw}else{x=X-hw;z=Z+u}cc=C('#7d929f')}
   else if(s<0.92){const side=(R()*2)|0;const fl=Math.floor(R()*nf),col=Math.floor(R()*6);const h=Math.abs(Math.sin(fl*12.9898+col*78.233+t.seed*37.7+side*5.1)*43758.5)%1;
    y=(fl+0.3+R()*0.45)*FL;const u=-hw+(col+0.2+R()*0.6)*fw/6;if(side===0){x=X+u;z=Z+hw+0.01}else{x=X+hw+0.01;z=Z+u}
    if(h>0.6){cc=h>0.88?COOL:WARM;em=lit*(0.6+0.4*h)}else cc=C('#20262e')}
   else{x=X+(R()-0.5)*fw;z=Z+(R()-0.5)*fw;y=t.h;cc=C('#4c535b')}
   p.push(x,y,z,cc[0]*dim,cc[1]*dim,cc[2]*dim,0,0,em*dim)}
  if(tall.includes(t))plane(p,getCanvas('browser',900,600,browserDraw),600,{c:[X,t.h-1.0,Z+hw+0.03],w:1.45,h:0.97,em:0.55*lit*dim,dim})}}
function railsInto(p,{dim=1}={}){const {r,y}=RAIL;
 for(const s of[-0.2,0.2])ringPts(p,1500,{c:[0,0,0],r:r+s,y,w:0.05,col:sc(C('#a7adb4'),dim)});
 for(let a=0;a<TAU;a+=TAU/120)lineP(p,10,[Math.sin(a)*(r-0.32),y-0.06,Math.cos(a)*(r-0.32)],[Math.sin(a)*(r+0.32),y-0.06,Math.cos(a)*(r+0.32)],{w:0.05,col:sc(C('#6a5a48'),dim)});
 for(let a=0;a<TAU;a+=TAU/18)box(p,70,{c:[Math.sin(a)*r,y/2-0.05,Math.cos(a)*r],s:[0.22,y-0.1,0.22],dim,color:()=>C('#5a6068')})}
function gear(p,n,{c,r,teeth,group=0,dim=1,col=C('#9a845a')}){n=NM(n);for(let i=0;i<n;i++){const s=R();let a=R()*TAU,rad;const z=(R()-0.5)*0.32;let cc=col;
 if(s<0.55){const tooth=((a/TAU*teeth)%1)<0.5;rad=r*0.8+R()*(r*0.2+(tooth?0.22:0));}else if(s<0.72){const sp=Math.floor(R()*5);a=sp/5*TAU+(R()-0.5)*0.08;rad=r*0.22+R()*r*0.6}else if(s<0.86){rad=Math.sqrt(R())*r*0.22;cc=BRASS}else{rad=r*0.5+(R()-0.5)*0.05;cc=sc(col,1.2)}
 const sh=0.6+0.4*Math.cos(a-0.8);p.push(c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad,c[2]+z,cc[0]*sh*dim,cc[1]*sh*dim,cc[2]*sh*dim,group,0,0)}}
const GEARS=[{c:GEAR0,r:2.4,t:22,g:6},{c:[GEAR0[0]+3.6,GEAR0[1]-1.35,GEAR0[2]+0.35],r:1.45,t:13,g:0},{c:[GEAR0[0]+1.7,GEAR0[1]+2.95,GEAR0[2]-0.35],r:1.0,t:9,g:0}];
const DBS=[{c:[TER.data[0]-1.9,0,TER.data[2]-1.0],r:0.9,h:4.4},{c:[TER.data[0]+0.4,0,TER.data[2]+0.8],r:1.05,h:5.2},{c:[TER.data[0]+2.5,0,TER.data[2]-1.2],r:0.75,h:3.6}];
// Systems: gear trains (the big one turns with scroll), cable drum, memory cylinders with lit rows, valve houses
function systemsInto(p,{dim=1,lit=0.6,turn=true}={}){
 for(const g of GEARS)gear(p,g.r*1500,{c:g.c,r:g.r,teeth:g.t,group:turn?g.g:0,dim});
 box(p,900,{c:[TER.gears[0]+0.4,0.25,TER.gears[2]],s:[7.5,0.5,2.2],dim,color:()=>C('#253e50')});
 cyl(p,900,{c:[TER.gears[0]+1.4,0.75,TER.gears[2]+2.0],r:0.6,len:2.2,axis:'x',dim,color:(f,u)=>f==='side'&&(u*30)%1<0.5?C('#6a5a40'):C('#3a3f45')});
 for(const d of DBS){cyl(p,d.h*400,{c:[d.c[0],d.h/2,d.c[2]],r:d.r,len:d.h,axis:'y',dim,color:(f,u,v)=>f==='side'?((v*d.h*2.4)%1<0.16?C('#a1bac4'):C('#2a3846')):C('#5d6670')});
  ringPts(p,260,{c:[d.c[0],0,d.c[2]],r:d.r+0.03,y:d.h*0.7,w:0.04,col:sc(COOL,dim),em:lit*dim})}
 for(const [dx,dz] of[[-0.6,2.2],[1.6,2.4]])box(p,350,{c:[TER.data[0]+dx,0.5,TER.data[2]+dz],s:[1.0,1.0,0.8],dim,color:()=>C('#454b53')})}
// WORLD: every territory in one pinned part from a fixed seed. mode 'full' stands it up, 'floor' lays it as dust on the floor, 'flat' draws it as a plan
function worldPart({mode='full',dim=1,lit=0.6,turn=true}={}){const old=Math.random;Math.random=rng(1234);const p=new Part(NM(56000)+200);
 try{let start=p.n;cloudInto(p,{dim,lit});vectorTag(p,28,start);
 start=p.n;appInto(p,{dim,lit:lit+0.2});vectorTag(p,29,start);
 start=p.n;railsInto(p,{dim});vectorTag(p,30,start);
 start=p.n;systemsInto(p,{dim,lit,turn});vectorTag(p,31,start)}finally{Math.random=old}
 if(mode!=='full'){const fl=mode==='flat';for(let i=0;i<p.n;i++){const k=i*4;const h=p.p[k+1];p.p[k+1]=fl?0.03:0.015;p.p[k+3]=p.p[k+3]%1;
  const t=Math.min(1,h/6);const cc=fl?mix(sc(ETCH,0.45),ETCH,0.25+0.75*t):mix([70,62,52],[120,104,82],R());const e=fl?0.18+0.3*t:0;p.c[k]=cc[0];p.c[k+1]=cc[1];p.c[k+2]=cc[2];p.c[k+3]=Math.round(e*255)}}
 if(mode==='floor')vectorTag(p,42);return pin(p,47000,56000)}
function world(parts,o={}){const {mode='full',bg=true}=o;parts.push(worldPart(o));if(bg&&mode==='full'){ground(parts,{dim:o.dim??1});mist(parts)}}
function hubDrum({dim=1,lit=0}={}){const p=new Part(NM(10000)+20);
 cyl(p,5500,{c:[0,HUB.h/2,0],r:HUB.r,len:HUB.h,axis:'y',caps:false,dim,color:(f,u,v)=>{const band=v<0.12||v>0.88;const seam=(u*48)%1<0.05;const riv=band&&((u*96)%1<0.25);return riv?BRASS:band?sc(BRASS,0.6):seam?sc(STEEL,0.9):J(IRON,0.05)}});
 const n=NM(4500);for(let i=0;i<n;i++){const a=R()*TAU,rad=Math.sqrt(R())*HUB.r;const edge=rad>HUB.r-0.16,ring=Math.abs(rad-1.15)<0.04||Math.abs(rad-1.95)<0.03;const cc=edge?BRASS:ring?sc(STEEL,1.1):J(sc(IRON,0.8),0.06);
  p.push(Math.sin(a)*rad,HUB.h+0.005,Math.cos(a)*rad,cc[0]*dim,cc[1]*dim,cc[2]*dim,0,0,lit&&ring?0.4*lit:0)}
 return pin(vectorTag(p,32),15000,10000)}
// spine: four cable trunks from the hub rim to each territory. reveal runs from the territory end (0) to the hub end (1), so bridges grow inward
const TRUNKS=Object.values(TER).map(t=>{const d=Math.hypot(t[0],t[2]);const u=[t[0]/d,0,t[2]/d];return{a:[u[0]*2.7,0.35,u[2]*2.7],b:[u[0]*(d-4.8),0.35,u[2]*(d-4.8)],u}});
function spineWorld({dim=1,lit=0,group=13}={}){const p=new Part(NM(10000)+20);const per=10000/4;
 for(const t of TRUNKS){const side=[-t.u[2],0,t.u[0]];for(const o of[-0.22,0,0.22]){const off=v=>[v[0]+side[0]*o,v[1]+(o===0?0.06:0),v[2]+side[2]*o];
   lineP(p,per*0.26,off(t.b),off(t.a),{w:0.05,col:o===0?(lit?WARM:sc(BRASS,0.8)):sc(C('#8a9098'),1),group,em:o===0?lit*0.7:0,r0:0,r1:1})}
  lineP(p,per*0.22,[t.b[0],0.22,t.b[2]],[t.a[0],0.22,t.a[2]],{w:0.55,col:sc(C('#3e444c'),dim),group,r0:0,r1:1})}
 return pin(vectorTag(p,33),30000,10000)}
function spineFlow(parts,n=3000){const p=new Part(NM(n)+10);for(const t of TRUNKS)lineP(p,n/4,t.a,t.b,{w:0.06,col:WARM,em:1,group:24});parts.push(p)}
function trainsRing({lit=0,dim=1}={}){const p=new Part(NM(6000)+10);for(const a of TRAINS)capsule(p,2000,{c:[Math.sin(a)*RAIL.r,RAIL.y+0.36,Math.cos(a)*RAIL.r],ry:a,lit,dim});return pin(vectorTag(p,37),41000,6000)}
function valveWheel({c,lit=0,dim=1,stem=true}){const p=new Part(NM(3000)+10);const col=lit?mix(OX,WARM,0.3):C('#8a7a5a');
 ringPts(p,1500,{c,r:0.42,w:0.07,col:sc(col,dim),em:lit*0.6,plane:'xy'});for(let s=0;s<4;s++){const a=s*Math.PI/2;lineP(p,120,[c[0],c[1],c[2]],[c[0]+Math.cos(a)*0.42,c[1]+Math.sin(a)*0.42,c[2]],{w:0.05,col:sc(col,dim),em:lit*0.5})}
 sphere(p,200,{c,r:0.09,color:()=>BRASS,dim});if(stem)lineP(p,400,[c[0],c[1]-0.05,c[2]-0.08],[c[0],c[1]-0.75,c[2]-0.08],{w:0.08,col:sc(IRON,dim)});return pin(vectorTag(p,38),26000,3000)}
function core(parts,{lit=1}={}){const p=new Part(NM(5000)+10);const c=[0,0,-1.2];
 cyl(p,2600,{c:[0,HUB.h+2.1,c[2]],r:0.75,len:4.2,axis:'y',caps:false,color:(f,u,v)=>((v*4.2*2.2)%1<0.2&&((u*9+v*3)%1)<0.55+0.35*Math.sin(v*9))?WARM:C('#2a3846')});
 const rows=NM(800);for(let i=0;i<rows;i++){const v=R(),a=R()*TAU;p.push(Math.sin(a)*0.76,HUB.h+v*4.2,c[2]+Math.cos(a)*0.76,255,208,140,0,0,((v*9.24)%1<0.2)?lit:0)}
 for(let i=0;i<6;i++){const a=Math.PI*0.62+i*Math.PI*0.152;box(p,250,{c:[Math.sin(a)*2.0,HUB.h+0.55,Math.cos(a)*2.0],s:[0.5,1.1,0.5],ry:a,color:(f,u,v)=>f==='pz'&&(v*6)%1<0.2?LED:C('#2c3138')})}
 parts.push(vectorTag(p,34))}
function graphCloud(parts,{lit=1}={}){const p=new Part(NM(3200)+10);const r=rng(55);const nodes=[];for(let i=0;i<46;i++){const a=r()*TAU,b=(r()-0.5)*1.4,d=1.0+r()*1.6;nodes.push([Math.cos(a)*d,6.3+b*1.4,-1.2+Math.sin(a)*d*0.7])}
 for(const q of nodes)sphere(p,26,{c:q,r:0.06,color:()=>BONE,em:lit*0.8});
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];if(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<1.15)lineP(p,22,a,b,{w:0.012,col:sc(COOL,0.9),em:lit*0.45,group:12})}
 parts.push(vectorTag(p,39))}

/* ================= islands (tools that never meet) ================= */
function island(parts,{c,ry=0,kind,dim=1,lit=0,trace=false,frame=null,win=true,ww=WIN_WH,nk=1}){const p=new Part(NM(5200*nk)+20);const Rv=rotY([1,0,0],ry),Uv=[0,1,0];
 const n=NM(2000*nk);for(let i=0;i<n;i++){const top=R()<0.45;let x=(R()-0.5)*3.4,z=(R()-0.5)*2.4,y=0;if(!top){const d=Math.max(Math.abs(x)/1.7,Math.abs(z)/1.2);const depth=(1-d)*1.4*(0.6+0.4*fbm(x*1.3+c[0],z*1.3));y=-0.25-R()*depth}
  const q=rotY([x,y,z],ry);const cc=top?J(sc(C('#354e60'),dim),0.1):sc(C('#2b2f34'),dim*(0.6+0.4*R()));p.push(c[0]+q[0],c[1]+q[1],c[2]+q[2],cc[0],cc[1],cc[2],0,0,0)}
 const wc=[c[0],c[1]+0.25+ww[1]/2,c[2]-0.5];
 if(win){plane(p,winCv(kind),2000*nk,{c:wc,R:Rv,U:Uv,w:ww[0],h:ww[1],dim:dim*(lit?1:0.85),em:lit?0.5*lit:0.2,edge:0.5});
  const b=[wc[0]+Rv[0]*ww[0]*0.47,wc[1]+ww[1]*0.45,wc[2]+Rv[2]*ww[0]*0.47];sphere(p,120,{c:b,r:0.09,color:()=>OX,em:1,group:lit?0:4})}
 if(trace){const t=[c[0]+0.9,c[1],c[2]+0.4];box(p,300,{c:[t[0],t[1]+0.45,t[2]],s:[0.5,0.06,0.5],dim,color:()=>C('#6b4528')});box(p,300,{c:[t[0],t[1]+0.85,t[2]+0.3],s:[0.5,0.8,0.06],rx:-0.25,dim,color:()=>C('#5e3a1f')});
  for(const[dx,dz]of[[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]])box(p,40,{c:[t[0]+dx,t[1]+0.22,t[2]+dz],s:[0.04,0.44,0.04],dim,color:()=>C('#3a2414')});
  cyl(p,220,{c:[c[0]-0.7,c[1]+0.12,c[2]+0.55],r:0.09,len:0.24,axis:'y',dim,color:(f,u,v)=>v<0.55?C('#c8823a'):C('#d8dde0')});box(p,500,{c:[c[0]-1.25,c[1]+0.06,c[2]+0.5],s:[0.8,0.12,0.55],ry:0.2,dim,color:(f)=>f==='py'?C('#8e1f1c'):C('#e6dcc2')})}
 parts.push(vectorTag(p,35));
 if(frame){const P=frame;const hw=ww[0]/2+0.05,hh=ww[1]/2+0.05;const cr=(a,b)=>[wc[0]+Rv[0]*a,wc[1]+b,wc[2]+Rv[2]*a];const col=lit?WARM:sc(C('#b9c4cf'),dim);
  lineP(P,500,cr(-hw,-hh),cr(hw,-hh),{w:0.05,col,em:lit*0.5});lineP(P,500,cr(-hw,hh),cr(hw,hh),{w:0.05,col,em:lit*0.5});lineP(P,330,cr(-hw,-hh),cr(-hw,hh),{w:0.05,col,em:lit*0.5});lineP(P,330,cr(hw,-hh),cr(hw,hh),{w:0.05,col,em:lit*0.5})}}

/* ================= STATES ================= */
export const STATES=[];export const K={};
function defState(name,build){if(name in K)throw new Error('duplicate state '+name);K[name]=STATES.length;STATES.push(build)}
function fillDust(min,max,col){return(f,n)=>dust(f,n/SCALE,{min,max,color:col})}
const FORGE={c:[0,1.75,0],w:9.6,h:2.6};

// ash: fine metal dust drifting in the dark, warm toward the forge light
defState('ash',()=>{const parts=[];const d=new Part(NM(131072)+10);const n=NM(131072);
 for(let i=0;i<n;i++){const t=R();let x,y,z;if(t<0.6){const a=R()*TAU,rad=Math.pow(R(),0.6)*7;x=Math.cos(a)*rad*1.3;y=1.75+Math.sin(a)*rad*0.45+(R()-0.5)*1.2;z=(R()-0.5)*4}else{x=(R()-0.5)*26;y=-0.2+R()*9;z=-6+R()*12}
  const j=0.5+R()*0.6;const w=Math.exp(-((x/5)**2+((y-1.75)/2)**2));d.push(x,y,z,(150+80*w)*j,(130+50*w)*j,(110+10*w)*j,1,R(),0)}
 parts.push(d);return{parts,fill:fillDust([-12,-0.2,-6],[12,8,6],[150,135,115])}});
// forge: the dust settles into a heavy steel nameplate. SHUBHAM GUPTA in Big Shoulders Display, the plate body is the future hub.
defState('forge',()=>{const parts=[];parts.push(namePart({c:[FORGE.c[0],FORGE.c[1]-0.02,0.09],w:8.2,h:1.17,em:0.2}));
 const pb=new Part(NM(15000)+10);plane(pb,getCanvas('plate',1600,434,plateDraw),10000,{c:FORGE.c,w:FORGE.w,h:FORGE.h,edge:0.8});parts.push(pin(vectorTag(pb,44),15000,10000));
 const e=new Part(NM(6000)+10);box(e,3000,{c:[0,FORGE.c[1],-0.12],s:[FORGE.w+0.1,FORGE.h+0.1,0.22],faces:['px','nx','py','ny'],color:()=>C('#4b525a')});
 box(e,2500,{c:[0,0.25,0],s:[10.6,0.5,1.2],color:(f)=>f==='py'?C('#3d434a'):C('#152a3b')});parts.push(vectorTag(e,44));
 ground(parts,{k:1.2,r:16,col:C('#142837')});world(parts,{mode:'floor'});
 const ring=new Part(NM(9000)+10);const nr=NM(9000);for(let i=0;i<nr;i++){const a=R()*TAU,rad=5.2+(R()-0.5)*1.3;const j=0.6+R()*0.5;ring.push(Math.cos(a)*rad*1.15,0.05+Math.pow(R(),2)*0.9,Math.sin(a)*rad*0.6,190*j,160*j,120*j,1,R(),0)}parts.push(ring);
 const sp=new Part(NM(500)+10);const ns=NM(500);for(let i=0;i<ns;i++){sp.push((R()-0.5)*9,R()*5,0.3+R()*1.5,255,190,110,0,0,0.7)}parts.push(vectorTag(sp,44));
 return{parts,fill:fillDust([-12,0,-6],[12,8,6],[120,110,95])}});
// world: the plate sinks into the hub; four territories rise around it. bridges reach toward the hub but do not meet yet
defState('world',()=>{const parts=[];parts.push(namePart({c:[0,HUB.h+0.03,0.55],Uv:[0,0,-1],w:4.4,h:0.63,em:0.25}));parts.push(hubDrum());
 parts.push(valveWheel({c:VALVE}));parts.push(spineWorld());parts.push(trainsRing());world(parts);
 return{parts,fill:fillDust([-20,0,-18],[20,9,18],[90,95,105])}});
// citadel: bridges lock, the spine lights, the memory core rises out of the hub. tools plug in as faceplates on the drum
defState('citadel',()=>{const parts=[];parts.push(namePart({c:[0,HUB.h+0.03,0.55],Uv:[0,0,-1],w:4.4,h:0.63,em:0.35}));parts.push(hubDrum({lit:1}));
 parts.push(valveWheel({c:VALVE,lit:0.5}));parts.push(spineWorld({lit:1}));parts.push(trainsRing({lit:0.9}));spineFlow(parts);core(parts);world(parts,{lit:0.8});
 return{parts,fill:fillDust([-20,0,-18],[20,9,18],[90,95,105])}});
// runs: three shipped runs leave the hub on one viaduct. voice to calendar, chat to order and payment, dues held at the valve
export const ST={cal:[RUN.x[0]+0.4,RUN.y+2.75,RUN.z-1.1],chat:[RUN.x[1]-0.75,RUN.y+2.55,RUN.z-1.1],shelf:[RUN.x[1]+1.35,RUN.y+0.05,RUN.z-0.9],pay:[RUN.x[1]+1.45,RUN.y+3.05,RUN.z-0.7],ledger:[RUN.x[2]-1.0,RUN.y+0.75,RUN.z-0.4],valve:[RUN.x[2]+1.1,RUN.y+1.25,RUN.z+0.05]};
export const CALSLOT=[ST.cal[0]+(0.04+5.5*0.92/7-0.5)*2.6,ST.cal[1]+(0.5-(0.26+1.5*0.138))*1.9,ST.cal[2]+0.05];
defState('runs',()=>{const parts=[];parts.push(namePart({c:[0,HUB.h+0.03,0.55],Uv:[0,0,-1],w:4.4,h:0.63,em:0.2}));parts.push(hubDrum({dim:0.6}));
 // viaduct (spine dots)
 const v=new Part(NM(10000)+10);for(const s of[-0.3,0.3])lineP(v,2600,[-11,RUN.y+0.12,RUN.z+s],[11,RUN.y+0.12,RUN.z+s],{w:0.05,col:C('#c3c8cf')});
 box(v,2600,{c:[0,RUN.y-0.05,RUN.z],s:[22,0.22,1.1],faces:['py','pz'],color:(f,u)=>(u*44)%1<0.1?C('#5a4a3a'):C('#3b4148')});
 for(let x=-10;x<=10.1;x+=2.5)box(v,280,{c:[x,RUN.y/2-0.1,RUN.z],s:[0.25,RUN.y-0.2,0.25],color:()=>C('#454b53')});parts.push(pin(vectorTag(v,33),30000,10000));
 const tp=new Part(NM(6000)+10);RUN.x.forEach((x,i)=>capsule(tp,2000,{c:[x-1.7,RUN.y+0.47,RUN.z],ry:0,lit:0.9}));parts.push(pin(vectorTag(tp,37),41000,6000));
 parts.push(valveWheel({c:ST.valve,lit:0.8,stem:false}));
 const p=new Part(NM(26000)+50);
 // voice: a waveform rises off the train and folds into the calendar
 for(let i=0;i<34;i++){const x=RUN.x[0]-1.55+i*0.09,h=0.15+1.1*Math.abs(Math.sin(i*0.55)*Math.sin(i*0.17+0.4));lineP(p,60,[x,RUN.y+0.9,RUN.z-0.2],[x,RUN.y+0.9+h,RUN.z-0.2],{w:0.035,col:WARM,em:0.9})}
 const runStart=p.n;
 plane(p,getCanvas('calW',780,520,(c,W,H)=>calDraw(c,W,H,false)),3600,{c:ST.cal,w:2.6,h:1.9,em:0.35,edge:0.5});
 box(p,300,{c:CALSLOT,s:[0.3,0.22,0.06],color:()=>C('#e8892f'),group:18,em:0.8});
 // chat to order: bubble screen, a shelf, one carton slides forward, then the payment link
 plane(p,getCanvas('chatW',780,520,WINS.chat),3000,{c:ST.chat,w:2.2,h:1.5,em:0.35,edge:0.5});
 const sh=ST.shelf;for(const y of[0,0.75,1.5])box(p,500,{c:[sh[0],sh[1]+y,sh[2]],s:[1.7,0.06,0.7],color:()=>C('#5a616a')});for(const x of[-0.85,0.85])box(p,300,{c:[sh[0]+x,sh[1]+0.9,sh[2]],s:[0.06,1.8,0.7],color:()=>C('#454b53')});
 for(const y of[0,0.75,1.5])for(let i=0;i<3;i++){const sl=y===0.75&&i===1;box(p,260,{c:[sh[0]-0.5+i*0.5,sh[1]+y+0.2,sh[2]+(sl?0.08:0)],s:[0.4,0.34,0.4],group:sl?16:0,color:(f,u,v)=>f==='py'&&Math.abs(u-0.5)<0.06?C('#d8c79a'):C('#b07a44')})}
 // dues: an open ledger drafts the envelope; it waits at the valve until a person ticks
 const L=ST.ledger;for(const s of[-1,1]){const n=NM(1100);for(let i=0;i<n;i++){const u=R(),w=R();const x=L[0]+s*(0.05+u*0.75),y=L[1]+u*0.12*1+0.0,z=L[2]+(w-0.5)*0.95;const line=(w*12)%1<0.12;const cc=line?C('#9aa6b5'):C('#ece3cc');p.push(x,y+(s>0?0:0),z,cc[0],cc[1],cc[2],0,0,0.15)}}
 box(p,500,{c:[L[0],L[1]-0.1,L[2]],s:[1.7,0.14,1.05],color:()=>C('#8e1f1c')});
 box(p,500,{c:[ST.valve[0]-0.65,ST.valve[1],ST.valve[2]+0.05],s:[0.55,0.36,0.04],group:17,em:0.2,color:(f,u,v)=>Math.abs(v-0.72+Math.abs(u-0.5)*0.55)<0.05?C('#9a8a6a'):C('#efe6d2')});
 lineP(p,90,[ST.valve[0]+0.5,ST.valve[1]+0.35,ST.valve[2]+0.1],[ST.valve[0]+0.62,ST.valve[1]+0.22,ST.valve[2]+0.1],{w:0.05,col:OX,em:1,group:15,r0:0.5,r1:0.5});
 lineP(p,160,[ST.valve[0]+0.62,ST.valve[1]+0.22,ST.valve[2]+0.1],[ST.valve[0]+0.9,ST.valve[1]+0.62,ST.valve[2]+0.1],{w:0.05,col:OX,em:1,group:15,r0:0.5,r1:0.5});
 parts.push(tagRange(p,36,0));
 world(parts,{dim:0.4,lit:0.35});
 return{parts,fill:fillDust([-20,0,-18],[20,9,18],[70,75,85])}});
// outer: past the joined machine, cold tool islands float apart. rails reach for them and stop short. a chair, a tea glass, a cloth ledger.
defState('outer',()=>{const parts=[];parts.push(namePart({c:[0,HUB.h+0.03,0.55],Uv:[0,0,-1],w:4.4,h:0.63,em:0.3}));parts.push(hubDrum({lit:0.6}));
 parts.push(valveWheel({c:VALVE,lit:0.4}));
 const s=new Part(NM(10000)+10);for(const q of ISL){const d=[q.c[0],0,q.c[2]];const L=Math.hypot(d[0],d[2]);const u=[d[0]/L,0,d[2]/L];const a=[u[0]*7,RAIL.y,u[2]*7],b=[a[0]+(q.c[0]-a[0])*0.5,RAIL.y+(q.c[1]-1-RAIL.y)*0.5,a[2]+(q.c[2]-a[2])*0.5];
  for(const o of[-0.2,0.2]){const sd=[-u[2]*o,0,u[0]*o];lineP(s,820,[a[0]+sd[0],a[1],a[2]+sd[2]],[b[0]+sd[0],b[1],b[2]+sd[2]],{w:0.05,col:C('#a7adb4')})}lineP(s,350,b,[b[0]+u[0]*0.6+0.2,b[1]-0.2,b[2]+u[2]*0.6],{w:0.2,col:C('#5a616a')})}parts.push(pin(vectorTag(s,33),30000,10000));
 const fr=new Part(NM(6000)+10);ISL.forEach((q,i)=>island(parts,{c:q.c,ry:q.ry,kind:q.k,trace:q.k==='sheet',frame:i<3||i===4?fr:null,dim:0.95}));parts.push(pin(vectorTag(fr,35),41000,6000));
 world(parts,{lit:0.9});spineFlow(parts,1500);
 const m=new Part(NM(3000)+10,true);dust(m,3000,{min:[-16,1,12],max:[16,9,26],color:[90,110,140]});parts.push(m);
 return{parts,fill:fillDust([-22,0,-18],[22,10,28],[70,78,92])}});
// etch: the whole world falls flat into one drawing on dark steel. ruled joins draw themselves from every island to the spine.
defState('etch',()=>{const parts=[];parts.push(namePart({c:[0,0.05,0.55],Uv:[0,0,-1],w:4.4,h:0.63,col:ETCHB,em:0.6}));
 const h=new Part(NM(10000)+10);for(const r of[HUB.r,HUB.r-0.16,1.95,1.15])ringPts(h,r*650,{c:[0,0,0],r,y:0.03,w:0.035,col:ETCHB,em:0.55});for(let a=0;a<TAU;a+=TAU/72)lineP(h,25,[Math.sin(a)*2.62,0.03,Math.cos(a)*2.62],[Math.sin(a)*2.9,0.03,Math.cos(a)*2.9],{col:ETCH,em:0.4});
 lineP(h,800,[-3.4,0.03,0],[3.4,0.03,0],{col:sc(ETCH,0.6),em:0.3});lineP(h,800,[0,0.03,-3.4],[0,0.03,3.4],{col:sc(ETCH,0.6),em:0.3});parts.push(pin(h,15000,10000));
 const vv=new Part(NM(3000)+10);ringPts(vv,1600,{c:[VALVE[0],0,VALVE[2]],r:1.0,y:0.04,w:0.04,col:OX,em:0.9});ringPts(vv,800,{c:[VALVE[0],0,VALVE[2]],r:0.42,y:0.04,w:0.04,col:OX,em:0.9});lineP(vv,600,[0.7,0.04,VALVE[2]+0.7],[5.5,0.04,VALVE[2]+4.6],{col:OX,em:0.8});parts.push(pin(vv,26000,3000));
 const s=new Part(NM(10000)+10);for(const t of TRUNKS){const sd=[-t.u[2],0,t.u[0]];for(const o of[-0.22,0.22])lineP(s,1100,[t.a[0]+sd[0]*o,0.03,t.a[2]+sd[2]*o],[t.b[0]+sd[0]*o,0.03,t.b[2]+sd[2]*o],{col:ETCHB,em:0.6});lineP(s,250,[t.a[0],0.03,t.a[2]],[t.b[0],0.03,t.b[2]],{col:sc(ETCH,0.6),em:0.3})}parts.push(pin(s,30000,10000));
 const tr=new Part(NM(6000)+10);for(const a of TRAINS){const c=[Math.sin(a)*RAIL.r,0.04,Math.cos(a)*RAIL.r];const R1=rotY([1,0,0],a),U1=rotY([0,0,1],a);const cr=(x,z)=>[c[0]+R1[0]*x+U1[0]*z,0.04,c[2]+R1[2]*x+U1[2]*z];
  lineP(tr,700,cr(-0.85,-0.33),cr(0.85,-0.33),{col:ETCHB,em:0.6});lineP(tr,700,cr(-0.85,0.33),cr(0.85,0.33),{col:ETCHB,em:0.6});lineP(tr,300,cr(-0.85,-0.33),cr(-0.85,0.33),{col:ETCHB,em:0.6});lineP(tr,300,cr(0.85,-0.33),cr(0.85,0.33),{col:ETCHB,em:0.6})}parts.push(pin(tr,41000,6000));
 const p=new Part(NM(30000)+50);
 world(parts,{mode:'flat'});
 // islands as labelled boxes where they floated, with ruled joins to the nearest trunk or the rail ring (group 11, drawn in order)
 for(const q of ISL){rectP(p,900,q.c[0],q.c[2],3.4,2.4,{col:ETCHB,em:0.6});rectP(p,500,q.c[0],q.c[2]-0.1,2.4,1.3,{col:sc(ETCH,0.7),em:0.35});
  const L=Math.hypot(q.c[0],q.c[2]),u=[q.c[0]/L,q.c[2]/L];const end=[u[0]*(RAIL.r+0.3),u[1]*(RAIL.r+0.3)];const mid=[q.c[0],end[1]+(q.c[2]-1.2-end[1])*0.0];
  const st=[q.c[0],q.c[2]-1.2];const corner=[st[0],end[1]+2.2];lineP(p,700,[st[0],0.04,st[1]],[corner[0],0.04,corner[1]],{w:0.05,col:OX,em:1,group:11,r0:0,r1:0.5});lineP(p,700,[corner[0],0.04,corner[1]],[end[0],0.04,end[1]],{w:0.05,col:OX,em:1,group:11,r0:0.5,r1:1})}
 // dimension lines with ticks, no numbers; title block bottom right
 const dim=(a,b)=>{lineP(p,500,a,b,{col:sc(ETCH,0.6),em:0.3});for(const e of[a,b])lineP(p,40,[e[0],0.03,e[2]-0.4],[e[0],0.03,e[2]+0.4],{col:sc(ETCH,0.6),em:0.3})};
 dim([-18,0.03,-14.2],[-6,0.03,-14.2]);dim([6,0.03,-14.2],[18,0.03,-14.2]);dim([-20.5,0.03,-12],[-20.5,0.03,4]);
 rectP(p,1600,19.5,22.2,8.5,3.4,{col:ETCHB,em:0.6});lineP(p,400,[15.25,0.03,21.4],[23.75,0.03,21.4],{col:ETCH,em:0.4});
 const n=NM(9000);for(let i=0;i<n;i++){const x=(R()-0.5)*56,z=-18+R()*44;const g=(Math.abs(((x+100)%2)-1)>0.97)||(Math.abs(((z+100)%2)-1)>0.97);const cc=g?C('#253e4b'):C('#0c1d2a');p.push(x,-0.01,z,cc[0],cc[1],cc[2],0,0,g?0.25:0.08)}
 parts.push(p);for(const part of parts)vectorTag(part,40);return{parts,fill:fillDust([-26,-0.05,-18],[26,0.0,26],[25,40,62])}});
// live: the drawing stands up running. islands dock on bridges, packets flow, the memory learns, the valve is lit for a person
defState('live',()=>{const parts=[];parts.push(namePart({c:[0,HUB.h+0.03,0.55],Uv:[0,0,-1],w:4.4,h:0.63,em:0.4}));parts.push(hubDrum({lit:1}));
 parts.push(valveWheel({c:VALVE,lit:1}));parts.push(spineWorld({lit:1}));parts.push(trainsRing({lit:1}));spineFlow(parts);core(parts);graphCloud(parts);
 const b=new Part(NM(3200)+10);
 ISL.forEach((q,i)=>{const c=ISLD[i];island(parts,{c,ry:-Math.atan2(c[0],c[2])*0.6,kind:q.k,lit:0.8,ww:[2.0,1.35],nk:0.55});
  const L=Math.hypot(c[0],c[2]),u=[c[0]/L,c[2]/L];lineP(b,600,[u[0]*(RAIL.r+0.3),RAIL.y,u[1]*(RAIL.r+0.3)],[c[0]-u[0]*1.3,c[1]+0.05,c[2]-u[1]*1.3],{w:0.12,col:WARM,em:0.6})});
 parts.push(vectorTag(b,33));
 world(parts,{lit:1});
 return{parts,fill:fillDust([-22,0,-18],[22,10,20],[90,95,105])}});
// whole: the live machine stays lit; a halo of warm light rises over the hub and threads down to every island and territory.
export const HALO={y:8.6,r:7.2};
const TERR=[[-14.3,6.2,-8.4],[12,6.4,-8],[4.23,2.4,4.54],[9.6,4.6,7],[-9.6,4.6,7]];
defState('whole',()=>{const parts=[];parts.push(namePart({c:[0,HUB.h+0.03,0.55],Uv:[0,0,-1],w:4.4,h:0.63,em:0.55}));parts.push(hubDrum({lit:1}));
 parts.push(valveWheel({c:VALVE,lit:1}));parts.push(spineWorld({lit:1}));parts.push(trainsRing({lit:1}));spineFlow(parts);core(parts);graphCloud(parts);
 const b=new Part(NM(3200)+10);
 ISL.forEach((q,i)=>{const c=ISLD[i];island(parts,{c,ry:-Math.atan2(c[0],c[2])*0.6,kind:q.k,lit:1,ww:[2.0,1.35],nk:0.55});
  const L=Math.hypot(c[0],c[2]),u=[c[0]/L,c[2]/L];lineP(b,600,[u[0]*(RAIL.r+0.3),RAIL.y,u[1]*(RAIL.r+0.3)],[c[0]-u[0]*1.3,c[1]+0.05,c[2]-u[1]*1.3],{w:0.12,col:WARM,em:0.8})});
 parts.push(vectorTag(b,33));
 world(parts,{lit:1});
 // budget: the halo rings are hero points; the threads are backdrop points, thinned first on smaller tiers
 const hl=new Part(NM(6000)+20),th=new Part(NM(4000)+20,true);const H0=[0,HALO.y,0];
 ringPts(hl,NM(2600),{c:H0,r:HALO.r,w:0.09,col:WARM,em:1});ringPts(hl,NM(1100),{c:H0,r:HALO.r-0.45,w:0.04,col:C('#d9c08a'),em:0.75});ringPts(hl,NM(800),{c:H0,r:HALO.r+0.4,w:0.03,col:C('#f3dba8'),em:0.6});
 const down=(t,n)=>{const L=Math.hypot(t[0],t[2])||1;const a=[t[0]/L*HALO.r,HALO.y,t[2]/L*HALO.r];lineP(th,n,a,t,{w:0.035,col:WARM,em:0.9})};
 ISLD.forEach(c=>down([c[0],c[1]+1.7,c[2]],NM(320)));TERR.forEach(t=>down(t,NM(320)));parts.push(vectorTag(th,41));
 for(let k=0;k<12;k++){const a=k/12*TAU;lineP(hl,NM(90),[Math.sin(a)*HALO.r,HALO.y,Math.cos(a)*HALO.r],[Math.sin(a)*HUB.r*0.9,HUB.h+0.4,Math.cos(a)*HUB.r*0.9],{w:0.02,col:C('#d9c08a'),em:0.55})}
 parts.push(vectorTag(hl,41));
 return{parts,fill:fillDust([-24,0,-20],[24,14,24],[90,95,105])}});

export function buildState(i,N){const previous=Math.random;Math.random=rng(1709+i*997);try{const {parts,fill}=STATES[i]();const tot=parts.reduce((a,p)=>a+p.n,0);return assemble(N,parts,fill)}finally{Math.random=previous}}
// crisp card overlays: tool faceplates on the drum, the three runs, the island windows
export function CARDS(){const out=[];
 [[COPY.plaques[0],-0.42],[COPY.plaques[1],0],[COPY.plaques[2],0.42]].forEach(([t,a])=>{const R1=rotY([1,0,0],a);out.push({canvas:getCanvas('pl-'+t,420,140,plaqueDraw(t)).c,c:[Math.sin(a)*(HUB.r+0.02),0.5,Math.cos(a)*(HUB.r+0.02)],R:R1,U:[0,1,0],w:0.95,h:0.32,t:[30.2,31.2,35.6,36.4],t2:[78.6,79.6,86.4,87.4],sweep:[1,0],lift:0.01,light:()=>0.95})});
 out.push({canvas:getCanvas('calSeat',780,520,(c,W,H)=>calDraw(c,W,H,true)).c,c:ST.cal,R:[1,0,0],U:[0,1,0],w:2.6,h:1.9,t:[41.6,42.4,51.6,52.6],sweep:[1,0],lift:0.02,light:()=>0.95});
 out.push({canvas:getCanvas('chatCard',840,440,chatCardDraw).c,c:ST.chat,R:[1,0,0],U:[0,1,0],w:2.2,h:1.15,t:[42.6,43.4,51.6,52.6],sweep:[-1,0],lift:0.03,light:()=>1});
 out.push({canvas:getCanvas('payCard',600,520,(c,W,H)=>payCardDraw(c,W,H,false)).c,c:ST.pay,R:[1,0,0],U:[0,1,0],w:1.35,h:1.17,t:[45.2,45.9,46.7,46.9],sweep:[0,-1],lift:0.03,light:()=>1});
 out.push({canvas:getCanvas('paidCard',600,520,(c,W,H)=>payCardDraw(c,W,H,true)).c,c:ST.pay,R:[1,0,0],U:[0,1,0],w:1.35,h:1.17,t:[46.7,46.9,51.6,52.6],sweep:[0,-1],lift:0.035,light:()=>1});
 for(const q of ISL){const R1=rotY([1,0,0],q.ry);out.push({canvas:winCv(q.k).c,c:[q.c[0],q.c[1]+0.25+WIN_WH[1]/2,q.c[2]-0.5],R:R1,U:[0,1,0],w:WIN_WH[0],h:WIN_WH[1],t:[57.2,58.2,64.6,65.6],sweep:[0,1],lift:0.03,light:()=>0.82})}
 return out}

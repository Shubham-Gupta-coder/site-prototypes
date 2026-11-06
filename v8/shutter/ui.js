// Vector UI painted onto 3D surfaces (phone screen, claim cards). Pure functions of film T; redrawn only when the drawn state changes.
const ION='#5fe1ff',AMB='#ffb547',INK='#e6eef6',SOFT='#a9b8c8',DIM='#5c6d80',BG='#070b11',ROW='#0e1620',LINE='#1f2f40';
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const ss=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t)};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const mono=(px,w=500)=>`${w} ${px}px "IBM Plex Mono", monospace`,sans=(px,w=400)=>`${w} ${px}px "IBM Plex Sans", sans-serif`,disp=(px,w=700)=>`${w} ${px}px Tourney, sans-serif`;
function track(c,t,x,y,sp){let cx=x;for(const ch of t){c.fillText(ch,cx,y);cx+=c.measureText(ch).width+sp}return cx-x}
function check(c,x,y,s,col,lw){c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x-s*.45,y);c.lineTo(x-s*.12,y+s*.32);c.lineTo(x+s*.5,y-s*.36);c.stroke()}

export function cardUI(g,state,title,sub){const key=state+sub;if(g.userData.state===key)return;g.userData.state=key;
 const c=g.userData.cv.getContext('2d'),W=1024,H=640;c.clearRect(0,0,W,H);
 const col=state==='verified'?ION:state==='downgraded'?AMB:'#7d93a8';
 rr(c,8,8,W-16,H-16,26);c.fillStyle='#0a1118';c.fill();c.lineWidth=state==='claim'?4:8;c.strokeStyle=col;c.stroke();
 c.fillStyle=DIM;c.font=mono(34);track(c,title.toUpperCase(),56,92,8);
 c.fillStyle='#22313f';[[56,150,820],[56,214,900],[56,278,640]].forEach(([x,y,w])=>{rr(c,x,y,w,26,8);c.fill()});
 c.fillStyle='#2b4053';rr(c,56,350,520,22,8);c.fill();
 if(state==='verified'){c.fillStyle='rgba(95,225,255,.18)';rr(c,56,346,520,30,8);c.fill();c.beginPath();c.arc(868,128,64,0,7);c.strokeStyle=ION;c.lineWidth=8;c.stroke();check(c,868,132,74,ION,12);c.fillStyle=ION;c.font=mono(40);track(c,'VERIFIED',56,500,10)}
 else if(state==='downgraded'){c.fillStyle=AMB;c.font=mono(40);track(c,'UNVERIFIED',56,500,10);c.strokeStyle=AMB;c.lineWidth=6;c.beginPath();c.moveTo(56,363);c.lineTo(576,363);c.stroke()}
 else{c.fillStyle='#7d93a8';c.font=mono(40);track(c,'CHECKING',56,500,10)}
 c.fillStyle=SOFT;c.font=sans(36);c.fillText(sub,56,568);g.userData.tx.needsUpdate=true}

let lastKey='';
export function screenUI(W,T){
 const q=x=>Math.round(x*20)/20;const key=T<59?'a':T>75?'z'+(T>79?1:0):'k'+q(T);if(key===lastKey)return;lastKey=key;const t=T<59?58:T>75?75:T;
 const c=W.scv.getContext('2d'),w=900,h=1840;c.clearRect(0,0,w,h);rr(c,0,0,w,h,70);c.fillStyle=BG;c.fill();
 // header
 c.fillStyle=INK;c.font=disp(54);c.fillText('COMMAND DECK',64,150);c.fillStyle=DIM;c.font=mono(26);track(c,'AGENTS · QUEUE',66,200,6);
 c.fillStyle=LINE;c.fillRect(64,236,w-128,2);
 // queue
 const docked=ss(60.2,60.8,t);const rows=[['Research brief',docked>.5?'Verified · from research':'Incoming',docked>.5?ION:DIM],['Reply to thread','Agent · inbox',DIM],['Publish note','Agent · writer',DIM]];
 const gateOn=ss(61.4,62.4,t),sent=ss(66.6,67.6,t),lift=ss(67.2,68.6,t);
 let y=290;c.fillStyle=DIM;c.font=mono(24);track(c,'QUEUE',66,y-14+0,6);
 rows.forEach(([a,b,cc],i)=>{const isAct=i===1;const yy=y+i*176;if(isAct&&gateOn>0)return;
  rr(c,64,yy,w-128,148,22);c.fillStyle=ROW;c.fill();c.strokeStyle=i===0&&docked>.5?'rgba(95,225,255,.55)':LINE;c.lineWidth=3;c.stroke();
  if(i===0&&docked<.5){c.setLineDash([14,12]);c.strokeStyle='#2c4054';c.stroke();c.setLineDash([])}
  c.fillStyle=INK;c.font=sans(40,500);c.fillText(a,104,yy+66);c.fillStyle=cc;c.font=mono(26);track(c,b.toUpperCase(),104,yy+112,4);
  if(i===0&&docked>.5)check(c,w-130,yy+74,40,ION,7)});
 // gate panel for the outgoing action
 if(gateOn>0){const py=lerp(1080,830,lift);const a=gateOn;c.globalAlpha=a;
  rr(c,48,py,w-96,440,30);c.fillStyle='#0d141c';c.fill();c.lineWidth=5;c.strokeStyle=sent>.5?ION:AMB;c.stroke();
  c.fillStyle=sent>.5?ION:AMB;c.font=mono(26);track(c,sent>.5?'SENT':'OUTGOING · SEND',90,py+70,6);
  c.fillStyle=INK;c.font=sans(44,500);c.fillText('Reply to thread',90,py+140);c.fillStyle=SOFT;c.font=sans(32);c.fillText(sent>.5?'Approved and sent.':'Waiting for approval.',90,py+192);
  if(sent<.5){const gb=1-ss(65.6,66.6,t);c.fillStyle=AMB;c.fillRect(90,py+232,(w-180)*gb,10);
   const pr=ss(64.4,65.2,t);rr(c,90,py+290,330,96,18);c.fillStyle=pr>.5?AMB:'transparent';c.fill();c.lineWidth=4;c.strokeStyle=AMB;c.stroke();c.fillStyle=pr>.5?'#140d02':AMB;c.font=mono(30);track(c,'APPROVE',150,py+350,6);
   rr(c,452,py+290,330,96,18);c.strokeStyle='#3a4b5d';c.stroke();c.fillStyle=SOFT;c.font=mono(30);track(c,'HOLD',560,py+350,6);
   const tap=ss(64.2,65.2,t)*(1-ss(65.2,66,t));if(tap>0){c.globalAlpha=a*tap;c.beginPath();c.arc(255,py+338,40+90*ss(64.2,65.6,t),0,7);c.strokeStyle=AMB;c.lineWidth=5;c.stroke();c.globalAlpha=a}}
  else{check(c,w-150,py+120,52,ION,8);
   const u=ss(68.4,69.2,t),run=ss(69.2,74.5,t);if(u>0){c.globalAlpha=a*u;rr(c,90,py+290,280,96,18);c.lineWidth=4;c.strokeStyle=ION;c.stroke();c.fillStyle=ION;c.font=mono(30);track(c,'UNDO',176,py+350,6);
    c.beginPath();c.arc(440,py+338,34,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-run));c.strokeStyle=ION;c.lineWidth=6;c.stroke();c.fillStyle=SOFT;c.font=sans(28);c.fillText('This step supports undo.',500,py+348);c.globalAlpha=a}}
  c.globalAlpha=1}
 // footer bar
 c.fillStyle=LINE;c.fillRect(w/2-90,h-60,180,8);
 W.stx.needsUpdate=true}
const lerp=(a,b,t)=>a+(b-a)*t;

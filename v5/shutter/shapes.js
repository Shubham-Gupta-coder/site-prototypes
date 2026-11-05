import {Part,getCanvas,plane,box,cyl,tube,sphere,dust,assemble,hex,vnoise,fbm,rotY,rotX,SCALE} from './lib.js';
// GROUPS: 0 solid,1 dust,2 receipt print,3 chat bubbles,4 unread blink,5 copy strokes,6 hour hand,7 minute hand,8 ledger page,9 bulb out,10 bulb in,11 ruled lines,12 windows reveal
const BONE='#efe6d2',OX='#7E2A18';
const J=(c,j=0.08)=>{const k=1+(Math.random()-0.5)*2*j;return[c[0]*k,c[1]*k,c[2]*k]};
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function bars(ctx,x,y,w,h,col,R){ctx.fillStyle=col;rr(ctx,x,y,w,h,Math.min(h/2,R??h/2));ctx.fill()}

/* ================= ART: canvases ================= */
function drawSign(ctx,W,H,boost){
 if(boost){ctx.fillStyle='#fff';signText(ctx,W,H);return}
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8a321b');g.addColorStop(1,'#6a2412');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // mottled tin + rust
 for(let i=0;i<900;i++){const x=Math.random()*W,y=Math.random()*H,r=4+Math.random()*30;ctx.fillStyle=`rgba(${Math.random()<0.5?'40,12,6':'160,70,40'},${0.05+Math.random()*0.1})`;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
 // chipped paint (bare tin)
 for(let i=0;i<26;i++){const x=Math.random()*W,y=Math.random()<0.5?Math.random()*H*0.25:H*0.75+Math.random()*H*0.25;ctx.fillStyle='#8f8b80';ctx.beginPath();ctx.moveTo(x,y);for(let k=0;k<7;k++)ctx.lineTo(x+(Math.random()-0.5)*60,y+(Math.random()-0.5)*26);ctx.fill();ctx.strokeStyle='rgba(70,30,10,.7)';ctx.lineWidth=3;ctx.stroke()}
 // border + rivets
 ctx.strokeStyle='#d8ccb3';ctx.lineWidth=H*0.028;ctx.strokeRect(H*0.07,H*0.07,W-H*0.14,H-H*0.14);
 ctx.lineWidth=H*0.01;ctx.strokeRect(H*0.115,H*0.115,W-H*0.23,H-H*0.23);
 for(let x=H*0.07;x<=W-H*0.06;x+=W/26)for(const y of[H*0.035,H*0.965]){ctx.fillStyle='#3a1a0e';ctx.beginPath();ctx.arc(x,y,H*0.022,0,7);ctx.fill();ctx.fillStyle='#bdb2a0';ctx.beginPath();ctx.arc(x-1,y-1,H*0.015,0,7);ctx.fill()}
 // painted name with shadow
 ctx.fillStyle='rgba(20,6,2,.75)';ctx.save();ctx.translate(H*0.02,H*0.025);signText(ctx,W,H);ctx.restore();
 ctx.fillStyle=BONE;signText(ctx,W,H);
 // paint wear inside letters
 ctx.globalCompositeOperation='source-atop';for(let i=0;i<500;i++){ctx.fillStyle=`rgba(${Math.random()<0.6?'190,170,140':'120,50,30'},${0.25+Math.random()*0.4})`;ctx.fillRect(Math.random()*W,Math.random()*H,2+Math.random()*7,1+Math.random()*3)}
 ctx.globalCompositeOperation='source-over';
}
function signText(ctx,W,H){ctx.font=`700 ${Math.round(H*0.5)}px "Playfair Display", Georgia, serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 const t='SHUBHAM GUPTA';const sp=H*0.035;let tw=0;for(const ch of t)tw+=ctx.measureText(ch).width+sp;tw-=sp;let x=W/2-tw/2;
 for(const ch of t){const w=ctx.measureText(ch).width;ctx.fillText(ch,x+w/2,H*0.53);x+=w+sp}}

function drawFacade(ctx,W,H){ // 18 x 10.5 world; opening x -5.2..5.2 (y -4.5..2.9) ; sign region x -6.1..6.1 y 2.85..5.35
 const X=x=>(x+9)/18*W,Y=y=>(6-y)/10.5*H;
 ctx.fillStyle='#a8987a';ctx.fillRect(0,0,W,H);
 const img=ctx.getImageData(0,0,W,H),d=img.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4;const n=fbm(x/90,y/90),m=fbm(x/22+5,y/22);let c=[168,152,122];
  // lower painted band (faded indigo distemper)
  if(y>H*0.82)c=[70,78,92];
  const grime=Math.pow(y/H,2.2)*0.55;const br=0.62+0.5*n-grime+0.12*(m-0.5);
  // exposed brick where plaster fell
  if(n>0.62&&m>0.45){const bx=Math.floor((x+(Math.floor(y/14)%2)*16)/32),by=Math.floor(y/14);const mort=(x+(by%2)*16)%32<3||y%14<3;c=mort?[120,110,95]:[128+((bx*37+by*13)%30),62,44]}
  const streak=0.85+0.15*vnoise(x/6,y/300);d[k]=c[0]*br*streak;d[k+1]=c[1]*br*streak;d[k+2]=c[2]*br*streak;d[k+3]=255}
 ctx.putImageData(img,0,0);
 // shop number plate would be a digit: skip. Electric conduit + junction box
 ctx.strokeStyle='#3b3b38';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(X(-8.4),Y(6));ctx.lineTo(X(-8.4),Y(-1.5));ctx.stroke();ctx.fillStyle='#4a4a46';ctx.fillRect(X(-8.75),Y(-1.4),X(-8.05)-X(-8.75),Y(-2.4)-Y(-1.4));
 ctx.clearRect(X(-5.25),Y(2.95),X(5.25)-X(-5.25),Y(-4.5)-Y(2.95));ctx.clearRect(X(-6.15),Y(5.4),X(6.15)-X(-6.15),Y(2.85)-Y(5.4));
}
function drawLane(ctx,W,H){ // ground 22 x 8, v=0 far (z=0) v=1 near (z=8)
 for(let y=0;y<H;y++){for(let x=0;x<W;x+=1){const n=fbm(x/40,y/40);const pool=Math.exp(-(((x/W-0.5)*3)**2)-((y/H-0.15)*2.5)**2);
  const c=mix([28,28,30],[120,88,52],pool*0.8);const b=0.6+0.6*n;ctx.fillStyle=`rgb(${c[0]*b|0},${c[1]*b|0},${c[2]*b|0})`;ctx.fillRect(x,y,1,1)}}
 ctx.fillStyle='#4e4a44';ctx.fillRect(0,H*0.0,W,H*0.07); // step / plinth
 ctx.fillStyle='#1a1a1b';ctx.fillRect(0,H*0.07,W,H*0.025); // drain
}
function drawCorrugated(ctx,W,H){for(let x=0;x<W;x++){const s=0.65+0.35*Math.sin(x/W*Math.PI*70);for(let y=0;y<H;y+=2){const n=fbm(x/60,y/60);const r=0.8+0.4*n;ctx.fillStyle=`rgb(${78*s*r|0},${86*s*r|0},${92*s*r|0})`;ctx.fillRect(x,y,1,2)}}
 // clerestory windows: night blue
 for(let i=0;i<6;i++){const x=W*(0.06+i*0.155);ctx.fillStyle='#1d3a66';ctx.fillRect(x,H*0.05,W*0.12,H*0.13);ctx.fillStyle='#0d1b33';ctx.fillRect(x+W*0.058,H*0.05,W*0.006,H*0.13)}}
function drawFloor(ctx,W,H){for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const n=fbm(x/50,y/50),s=vnoise(x/9,y/9);const b=0.55+0.5*n+0.1*s;ctx.fillStyle=`rgb(${100*b|0},${98*b|0},${92*b|0})`;ctx.fillRect(x,y,2,2)}
 ctx.fillStyle='#c9a227';for(const fx of[0.215,0.785]){ctx.fillRect(W*fx-W*0.006,0,W*0.012,H)}
 for(let i=0;i<14;i++){ctx.fillStyle=`rgba(30,25,20,${0.15+Math.random()*0.2})`;ctx.beginPath();ctx.ellipse(Math.random()*W,Math.random()*H,20+Math.random()*60,10+Math.random()*30,0,0,7);ctx.fill()}}

function drawChat(ctx,W,H){ // phone screen, dark mode WhatsApp-style
 ctx.fillStyle='#0b141a';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(120,140,140,.12)';ctx.lineWidth=3;for(let i=0;i<70;i++){const x=Math.random()*W,y=H*0.12+Math.random()*H*0.8;ctx.beginPath();ctx.arc(x,y,6+Math.random()*12,0,Math.PI*(1+Math.random()));ctx.stroke()}
 ctx.fillStyle='#1f2c34';ctx.fillRect(0,0,W,H*0.115);ctx.fillStyle='#202c33';ctx.fillRect(0,0,W,H*0.03);
 ctx.fillStyle='#aebac1';ctx.beginPath();ctx.moveTo(W*0.08,H*0.072);ctx.lineTo(W*0.05,H*0.072);ctx.lineTo(W*0.065,H*0.06);ctx.fill();
 ctx.fillStyle='#00a884';ctx.beginPath();ctx.arc(W*0.19,H*0.072,H*0.028,0,7);ctx.fill(); // store avatar: awning
 ctx.fillStyle='#e9edef';ctx.fillRect(W*0.16,H*0.064,W*0.06,H*0.014);for(let i=0;i<3;i++){ctx.fillRect(W*(0.163+i*0.02),H*0.077,W*0.012,H*0.012)}
 bars(ctx,W*0.27,H*0.058,W*0.34,H*0.016,'#e9edef');bars(ctx,W*0.27,H*0.08,W*0.2,H*0.011,'#8696a0');
 ctx.fillStyle='#aebac1';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(W*0.93,H*(0.058+i*0.012),W*0.008,0,7);ctx.fill()}
 // input bar
 bars(ctx,W*0.04,H*0.925,W*0.74,H*0.05,'#2a3942');ctx.fillStyle='#00a884';ctx.beginPath();ctx.arc(W*0.88,H*0.95,H*0.027,0,7);ctx.fill();
 ctx.fillStyle='#111b21';ctx.fillRect(W*0.872,H*0.938,W*0.016,H*0.02);
}
// bubbles drawn separately so they can carry reveal order: returns list of {x,y,w,h,out,thumb}
export const CHAT_BUBBLES=[{y:0.15,h:0.07,w:0.6,out:0},{y:0.235,h:0.15,w:0.55,out:0,thumb:'#b33a3a'},{y:0.4,h:0.06,w:0.5,out:1},{y:0.475,h:0.06,w:0.64,out:0},{y:0.55,h:0.15,w:0.55,out:0,thumb:'#2f5d8a'},{y:0.715,h:0.06,w:0.45,out:0},{y:0.79,h:0.11,w:0.62,out:1}];
function drawBubble(ctx,W,H,b){const x=b.out?W*(0.96-b.w):W*0.04,y=H*b.y,w=W*b.w,h=H*b.h;ctx.fillStyle=b.out?'#005c4b':'#202c33';rr(ctx,x,y,w,h,W*0.03);ctx.fill();
 let ty=y+H*0.018;if(b.thumb){ctx.fillStyle='#e9e2d0';rr(ctx,x+W*0.02,ty,w-W*0.04,h*0.58,W*0.02);ctx.fill();drawTee(ctx,x+w/2,ty+h*0.29,h*0.45,b.thumb);ty+=h*0.64}
 const lines=Math.max(1,Math.round((y+h-ty)/(H*0.022))-1);for(let i=0;i<lines;i++)bars(ctx,x+W*0.035,ty+i*H*0.022,(w-W*0.07)*(i===lines-1?0.55:0.92),H*0.011,b.out?'#a9d5c8':'#c5cdd1');
 ctx.strokeStyle=b.out?'#53bdeb':'#8696a0';ctx.lineWidth=W*0.006;ctx.beginPath();const tx=x+w-W*0.06,tyy=y+h-H*0.012;ctx.moveTo(tx,tyy-4);ctx.lineTo(tx+6,tyy);ctx.lineTo(tx+16,tyy-12);if(b.out){ctx.moveTo(tx+8,tyy-2);ctx.lineTo(tx+10,tyy);ctx.lineTo(tx+22,tyy-12)}ctx.stroke()}
function drawTee(ctx,cx,cy,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx-s*0.25,cy-s*0.45);ctx.lineTo(cx-s*0.55,cy-s*0.25);ctx.lineTo(cx-s*0.45,cy-s*0.02);ctx.lineTo(cx-s*0.3,cy-s*0.1);ctx.lineTo(cx-s*0.3,cy+s*0.45);ctx.lineTo(cx+s*0.3,cy+s*0.45);ctx.lineTo(cx+s*0.3,cy-s*0.1);ctx.lineTo(cx+s*0.45,cy-s*0.02);ctx.lineTo(cx+s*0.55,cy-s*0.25);ctx.lineTo(cx+s*0.25,cy-s*0.45);ctx.quadraticCurveTo(cx,cy-s*0.28,cx-s*0.25,cy-s*0.45);ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(cx-s*0.3,cy+s*0.1,s*0.6,s*0.04)}

// ---- tool windows: crisp UI screens (cards) + the same art sampled as dots ----
// brand marks only for Shopify, Razorpay, WhatsApp; everything else generic
const FONT='"Helvetica Neue",Helvetica,Arial,system-ui,sans-serif';
function winFrame(ctx,W,H,bar,light){ctx.fillStyle='#0f1114';rr(ctx,0,0,W,H,20);ctx.fill();ctx.save();rr(ctx,5,5,W-10,H-10,16);ctx.clip();ctx.fillStyle=bar;ctx.fillRect(0,0,W,H*0.062);
 for(let i=0;i<3;i++){ctx.fillStyle=['#e0605a','#e2b94b','#5fbf5a'][i];ctx.beginPath();ctx.arc(28+i*24,H*0.031,7,0,7);ctx.fill()}
 bars(ctx,W*0.3,H*0.014,W*0.4,H*0.034,light?'rgba(0,0,0,.12)':'rgba(255,255,255,.12)')}
function endFrame(ctx){ctx.restore()}
function tick(ctx,x,y,s,col,lw){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x-s*0.5,y);ctx.lineTo(x-s*0.12,y+s*0.38);ctx.lineTo(x+s*0.55,y-s*0.4);ctx.stroke();ctx.lineCap='butt'}
function drawKurta(ctx,cx,cy,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx-s*0.18,cy-s*0.5);ctx.lineTo(cx-s*0.48,cy-s*0.36);ctx.lineTo(cx-s*0.42,cy-s*0.12);ctx.lineTo(cx-s*0.27,cy-s*0.2);ctx.lineTo(cx-s*0.34,cy+s*0.55);ctx.lineTo(cx+s*0.34,cy+s*0.55);ctx.lineTo(cx+s*0.27,cy-s*0.2);ctx.lineTo(cx+s*0.42,cy-s*0.12);ctx.lineTo(cx+s*0.48,cy-s*0.36);ctx.lineTo(cx+s*0.18,cy-s*0.5);ctx.lineTo(cx,cy-s*0.3);ctx.closePath();ctx.fill();
 ctx.fillStyle='rgba(255,230,160,.7)';ctx.fillRect(cx-s*0.02,cy-s*0.3,s*0.04,s*0.3);ctx.fillRect(cx-s*0.34,cy+s*0.45,s*0.68,s*0.05)}
function drawScarf(ctx,cx,cy,s,col){for(let i=0;i<3;i++){ctx.fillStyle=i%2?col:mixHex(col,0.75);rr(ctx,cx-s*0.45,cy-s*0.3+i*s*0.2,s*0.9,s*0.22,s*0.05);ctx.fill()}
 ctx.strokeStyle='rgba(255,240,200,.8)';ctx.lineWidth=s*0.03;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(cx-s*0.45+i*s*0.06,cy+s*0.32);ctx.lineTo(cx-s*0.45+i*s*0.06,cy+s*0.45);ctx.stroke()}}
function drawTote(ctx,cx,cy,s,col){ctx.strokeStyle=col;ctx.lineWidth=s*0.06;ctx.beginPath();ctx.arc(cx,cy-s*0.15,s*0.2,Math.PI,0);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx-s*0.38,cy-s*0.15);ctx.lineTo(cx+s*0.38,cy-s*0.15);ctx.lineTo(cx+s*0.32,cy+s*0.5);ctx.lineTo(cx-s*0.32,cy+s*0.5);ctx.fill()}
function mixHex(h,k){const c=hex(h);return`rgb(${c[0]*k|0},${c[1]*k|0},${c[2]*k|0})`}
function waLogo(ctx,x,y,r){ctx.fillStyle='#25d366';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(x-r*0.75,y+r*0.95);ctx.lineTo(x-r*0.55,y+r*0.35);ctx.lineTo(x-r*0.1,y+r*0.75);ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r*0.74,0,7);ctx.fill();ctx.fillStyle='#25d366';ctx.beginPath();ctx.arc(x,y,r*0.6,0,7);ctx.fill();
 ctx.fillStyle='#fff';ctx.save();ctx.translate(x,y);ctx.rotate(-0.7);rr(ctx,-r*0.12,-r*0.38,r*0.24,r*0.76,r*0.1);ctx.fill();ctx.fillRect(-r*0.22,-r*0.4,r*0.44,r*0.14);ctx.fillRect(-r*0.22,r*0.26,r*0.44,r*0.14);ctx.restore()}
function shopBag(ctx,x,y,s){ctx.fillStyle='#95bf47';ctx.beginPath();ctx.moveTo(x-s*0.42,y-s*0.22);ctx.lineTo(x+s*0.42,y-s*0.3);ctx.lineTo(x+s*0.5,y+s*0.5);ctx.lineTo(x-s*0.5,y+s*0.5);ctx.closePath();ctx.fill();
 ctx.fillStyle='#5e8e3e';ctx.beginPath();ctx.moveTo(x+s*0.1,y-s*0.27);ctx.lineTo(x+s*0.42,y-s*0.3);ctx.lineTo(x+s*0.5,y+s*0.5);ctx.lineTo(x+s*0.2,y+s*0.5);ctx.fill();
 ctx.strokeStyle='#95bf47';ctx.lineWidth=s*0.09;ctx.beginPath();ctx.arc(x-s*0.02,y-s*0.27,s*0.2,Math.PI*1.05,-0.05);ctx.stroke();
 ctx.fillStyle='#fff';ctx.font=`700 ${s*0.62}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('S',x-s*0.05,y+s*0.13);ctx.textAlign='left'}
function rzpMark(ctx,x,y,s){ctx.fillStyle='#3395ff';ctx.beginPath();ctx.moveTo(x+s*0.05,y+s*0.5);ctx.lineTo(x+s*0.3,y-s*0.15);ctx.lineTo(x+s*0.05,y-s*0.05);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(x-s*0.25,y+s*0.5);ctx.lineTo(x+s*0.02,y-s*0.42);ctx.lineTo(x+s*0.55,y-s*0.6);ctx.lineTo(x+s*0.3,y-s*0.15);ctx.lineTo(x+s*0.15,y-s*0.25);ctx.lineTo(x-s*0.02,y+s*0.5);ctx.closePath();ctx.fill()}
const WINDOWS={
 chat(ctx,W,H){winFrame(ctx,W,H,'#f0f2f5',1);
  ctx.fillStyle='#008069';ctx.fillRect(0,H*0.062,W,H*0.12);waLogo(ctx,W*0.05,H*0.122,H*0.04);
  ctx.fillStyle='#fff';ctx.font=`700 ${H*0.064}px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText('WhatsApp',W*0.085,H*0.124);
  ctx.fillStyle='#ffffff';ctx.fillRect(0,H*0.182,W*0.33,H);ctx.strokeStyle='#e9edef';ctx.lineWidth=2;
  const av=['#c26a4a','#4a7ac2','#7ab05a','#b0a05a','#8a5ab0','#5ab0a8'];
  for(let i=0;i<6;i++){const y=H*(0.24+i*0.125);ctx.fillStyle=av[i];ctx.beginPath();ctx.arc(W*0.05,y+H*0.03,H*0.038,0,7);ctx.fill();
   bars(ctx,W*0.095,y+H*0.004,W*(0.12+((i*5)%3)*0.03),H*0.024,'#111b21');bars(ctx,W*0.095,y+H*0.045,W*0.16,H*0.02,'#8696a0');
   if(i<3){ctx.fillStyle='#25d366';ctx.beginPath();ctx.arc(W*0.3,y+H*0.05,H*0.022,0,7);ctx.fill()}
   ctx.beginPath();ctx.moveTo(W*0.095,y+H*0.1);ctx.lineTo(W*0.33,y+H*0.1);ctx.stroke()}
  ctx.fillStyle='#efeae2';ctx.fillRect(W*0.33,H*0.182,W,H);ctx.strokeStyle='rgba(120,110,90,.10)';ctx.lineWidth=3;
  for(let i=0;i<40;i++){const x=W*0.34+((i*97)%66)/66*W*0.65,y=H*0.2+((i*53)%71)/71*H*0.7;ctx.beginPath();ctx.arc(x,y,8+(i%4)*4,0,Math.PI*(1+(i%3)*0.4));ctx.stroke()}
  ctx.fillStyle='#f0f2f5';ctx.fillRect(W*0.33,H*0.182,W,H*0.09);ctx.fillStyle=av[0];ctx.beginPath();ctx.arc(W*0.37,H*0.227,H*0.03,0,7);ctx.fill();bars(ctx,W*0.405,H*0.215,W*0.16,H*0.024,'#111b21');
  const B=[[0,0.3,0.42,0.075,0],[0,0.39,0.36,0.2,1],[1,0.61,0.3,0.075,0],[0,0.7,0.46,0.075,0],[1,0.79,0.34,0.075,0]];
  for(const[o,y,w,h,th]of B){const x=o?W*(0.97-w):W*0.36;ctx.fillStyle=o?'#d9fdd3':'#ffffff';rr(ctx,x,H*y,W*w,H*h,10);ctx.fill();
   if(th){ctx.fillStyle='#ece6da';rr(ctx,x+8,H*y+8,W*w-16,H*h*0.72,8);ctx.fill();drawKurta(ctx,x+W*w*0.3,H*(y+h*0.37),H*h*0.6,'#9c2f3a');drawTee(ctx,x+W*w*0.72,H*(y+h*0.37),H*h*0.55,'#2f5d8a');bars(ctx,x+16,H*(y+h*0.82),W*w*0.5,H*0.02,'#667781')}
   else{bars(ctx,x+16,H*(y+h*0.38),W*w*0.7,H*0.022,'#3b4a54')}
   if(o)tick(ctx,x+W*w-30,H*(y+h*0.7),14,'#53bdeb',3)}
  ctx.fillStyle='#f0f2f5';ctx.fillRect(W*0.33,H*0.9,W,H*0.1);bars(ctx,W*0.37,H*0.918,W*0.5,H*0.055,'#ffffff');ctx.fillStyle='#008069';ctx.beginPath();ctx.arc(W*0.93,H*0.945,H*0.033,0,7);ctx.fill();
  endFrame(ctx)},
 pay(ctx,W,H){winFrame(ctx,W,H,'#08142f');ctx.fillStyle='#0b1b3f';ctx.fillRect(0,H*0.062,W*0.26,H);
  rzpMark(ctx,W*0.045,H*0.15,H*0.07);ctx.fillStyle='#fff';ctx.font=`700 ${H*0.062}px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText('Razorpay',W*0.075,H*0.152);
  for(let i=0;i<6;i++){if(i===1){ctx.fillStyle='rgba(51,149,255,.22)';ctx.fillRect(W*0.015,H*(0.255+i*0.085),W*0.23,H*0.07)}ctx.fillStyle=i===1?'#3395ff':'#4c6390';rr(ctx,W*0.035,H*(0.272+i*0.085),H*0.036,H*0.036,5);ctx.fill();bars(ctx,W*0.075,H*(0.278+i*0.085),W*(0.09+((i*3)%4)*0.02),H*0.024,i===1?'#e6f0ff':'#7f90b3')}
  ctx.fillStyle='#eef2f9';ctx.fillRect(W*0.26,H*0.062,W,H);bars(ctx,W*0.3,H*0.11,W*0.22,H*0.04,'#0b1b3f');bars(ctx,W*0.82,H*0.1,W*0.14,H*0.06,'#3395ff',8);
  // payment card
  ctx.fillStyle='#ffffff';rr(ctx,W*0.3,H*0.2,W*0.66,H*0.48,16);ctx.fill();ctx.strokeStyle='#dfe5ef';ctx.lineWidth=2;ctx.stroke();
  const g=ctx.createLinearGradient(W*0.33,H*0.25,W*0.6,H*0.62);g.addColorStop(0,'#1f5fd6');g.addColorStop(1,'#0b1b3f');ctx.fillStyle=g;rr(ctx,W*0.33,H*0.25,W*0.27,H*0.37,14);ctx.fill();
  ctx.fillStyle='#e3c46a';rr(ctx,W*0.355,H*0.31,W*0.045,H*0.06,5);ctx.fill();ctx.strokeStyle='#b8973f';ctx.lineWidth=1.5;ctx.strokeRect(W*0.362,H*0.322,W*0.031,H*0.036);
  for(let k=0;k<4;k++){ctx.fillStyle='rgba(255,255,255,.85)';for(let j=0;j<4;j++){ctx.beginPath();ctx.arc(W*(0.358+k*0.056+j*0.011),H*0.45,H*0.008,0,7);ctx.fill()}}
  bars(ctx,W*0.355,H*0.52,W*0.1,H*0.022,'rgba(255,255,255,.7)');ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(W*0.545,H*0.545,H*0.03,0,7);ctx.fill();ctx.fillStyle='rgba(255,200,120,.6)';ctx.beginPath();ctx.arc(W*0.565,H*0.545,H*0.03,0,7);ctx.fill();
  ctx.fillStyle='#16a34a';ctx.beginPath();ctx.arc(W*0.69,H*0.32,H*0.06,0,7);ctx.fill();tick(ctx,W*0.69,H*0.322,H*0.06,'#fff',7);
  bars(ctx,W*0.75,H*0.29,W*0.15,H*0.034,'#0b1b3f');bars(ctx,W*0.75,H*0.345,W*0.1,H*0.022,'#8a94a6');
  for(let i=0;i<3;i++){bars(ctx,W*0.65,H*(0.44+i*0.07),W*0.1,H*0.022,'#8a94a6');bars(ctx,W*0.8,H*(0.44+i*0.07),W*0.12,H*0.022,'#0b1b3f')}
  for(let i=0;i<3;i++){const y=H*(0.72+i*0.085);ctx.fillStyle='#ffffff';rr(ctx,W*0.3,y,W*0.66,H*0.07,8);ctx.fill();ctx.fillStyle=['#16a34a','#e2a400','#16a34a'][i];rr(ctx,W*0.32,y+H*0.02,W*0.07,H*0.03,12);ctx.fill();bars(ctx,W*0.42,y+H*0.024,W*0.24,H*0.022,'#5b6880');bars(ctx,W*0.84,y+H*0.024,W*0.09,H*0.022,'#0b1b3f')}
  endFrame(ctx)},
 sheet(ctx,W,H){winFrame(ctx,W,H,'#e9ecef',1);ctx.fillStyle='#f8f9fa';ctx.fillRect(0,H*0.062,W,H*0.13);
  ctx.fillStyle='#188038';rr(ctx,W*0.025,H*0.08,H*0.07,H*0.09,6);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(W*0.025+H*0.015,H*0.1,H*0.04,H*0.05);ctx.beginPath();ctx.moveTo(W*0.025+H*0.015,H*0.125);ctx.lineTo(W*0.025+H*0.055,H*0.125);ctx.moveTo(W*0.025+H*0.035,H*0.1);ctx.lineTo(W*0.025+H*0.035,H*0.15);ctx.stroke();
  bars(ctx,W*0.09,H*0.088,W*0.18,H*0.03,'#3c4043');for(let i=0;i<6;i++)bars(ctx,W*(0.09+i*0.05),H*0.138,W*0.035,H*0.02,'#80868b');
  ctx.fillStyle='#eef1f4';ctx.fillRect(0,H*0.192,W,H*0.05);for(let i=0;i<14;i++){ctx.fillStyle='#9aa0a6';rr(ctx,W*(0.02+i*0.032),H*0.203,W*0.02,H*0.028,4);ctx.fill()}
  const x0=W*0.045,y0=H*0.25,cols=7,rows=12,cw=(W-x0)/cols,ch=(H-y0)/rows;ctx.fillStyle='#ffffff';ctx.fillRect(0,y0,W,H);
  ctx.fillStyle='#f1f3f4';ctx.fillRect(0,y0,W,ch);ctx.fillRect(0,y0,x0,H);
  ctx.font=`600 ${ch*0.5}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#5f6368';for(let c=0;c<cols;c++)ctx.fillText('ABCDEFG'[c],x0+cw*(c+0.5),y0+ch/2);ctx.textAlign='left';
  for(let r=1;r<rows;r++){ctx.fillStyle='#c4c7c5';ctx.fillRect(x0*0.3,y0+r*ch+ch*0.4,x0*0.4,ch*0.2);
   for(let c=0;c<cols;c++){const x=x0+c*cw,y=y0+r*ch;const bad=(r*3+c*5)%11===0&&c>0,warn=(r+c*2)%13===0&&c>0;if(bad){ctx.fillStyle='#fad2cf';ctx.fillRect(x,y,cw,ch)}else if(warn){ctx.fillStyle='#feefc3';ctx.fillRect(x,y,cw,ch)}
    if(c===0){ctx.fillStyle=TEX[r%TEX.length];rr(ctx,x+cw*0.08,y+ch*0.2,ch*0.6,ch*0.6,3);ctx.fill();bars(ctx,x+cw*0.08+ch*0.8,y+ch*0.36,cw*0.5,ch*0.28,'#3c4043',3)}
    else bars(ctx,x+cw*0.12,y+ch*0.36,cw*(0.3+((r*7+c*3)%5)/9),ch*0.28,bad?'#b3261e':'#5f6368',3)}}
  ctx.strokeStyle='#e2e3e3';ctx.lineWidth=1.5;for(let c=0;c<=cols;c++){ctx.beginPath();ctx.moveTo(x0+c*cw,y0);ctx.lineTo(x0+c*cw,H);ctx.stroke()}for(let r=0;r<=rows;r++){ctx.beginPath();ctx.moveTo(0,y0+r*ch);ctx.lineTo(W,y0+r*ch);ctx.stroke()}
  ctx.strokeStyle='#188038';ctx.lineWidth=5;ctx.strokeRect(x0+cw*2,y0+ch*3,cw,ch);ctx.fillStyle='#188038';ctx.fillRect(x0+cw*3-6,y0+ch*4-6,10,10);
  endFrame(ctx)},
 inbox(ctx,W,H){winFrame(ctx,W,H,'#e9eef6',1);ctx.fillStyle='#f6f8fc';ctx.fillRect(0,H*0.062,W,H);
  // generic envelope mark
  ctx.fillStyle='#3b6fd8';rr(ctx,W*0.025,H*0.09,H*0.1,H*0.075,6);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(W*0.025+6,H*0.1);ctx.lineTo(W*0.025+H*0.05,H*0.14);ctx.lineTo(W*0.025+H*0.1-6,H*0.1);ctx.stroke();
  bars(ctx,W*0.1,H*0.11,W*0.08,H*0.034,'#5f6368');bars(ctx,W*0.24,H*0.09,W*0.5,H*0.07,'#e3e9f3',20);ctx.fillStyle='#9aa0a6';ctx.beginPath();ctx.arc(W*0.27,H*0.125,H*0.016,0,7);ctx.fill();
  ctx.fillStyle='#c2e7ff';rr(ctx,W*0.02,H*0.21,W*0.15,H*0.08,18);ctx.fill();bars(ctx,W*0.06,H*0.24,W*0.08,H*0.024,'#001d35');
  for(let i=0;i<6;i++){if(i===0){ctx.fillStyle='#d3e3fd';rr(ctx,W*0.01,H*(0.315+i*0.068),W*0.19,H*0.055,14);ctx.fill()}ctx.fillStyle='#444746';rr(ctx,W*0.03,H*(0.33+i*0.068),H*0.026,H*0.026,4);ctx.fill();bars(ctx,W*0.065,H*(0.332+i*0.068),W*(0.07+((i*3)%4)*0.015),H*0.022,i===0?'#041e49':'#444746')}
  ctx.fillStyle='#ffffff';rr(ctx,W*0.21,H*0.19,W*0.775,H*0.8,14);ctx.fill();
  for(let i=0;i<9;i++){const y=H*(0.21+i*0.085),un=i<4||i===6;ctx.fillStyle=un?'#ffffff':'#f2f6fc';ctx.fillRect(W*0.215,y,W*0.765,H*0.08);ctx.strokeStyle='#e8eaed';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(W*0.215,y+H*0.082);ctx.lineTo(W*0.98,y+H*0.082);ctx.stroke();
   ctx.strokeStyle='#9aa0a6';ctx.lineWidth=2;ctx.strokeRect(W*0.23,y+H*0.028,H*0.026,H*0.026);ctx.fillStyle=i===2?'#f4b400':'#d0d3d6';star(ctx,W*0.272,y+H*0.041,H*0.017);
   bars(ctx,W*0.3,y+H*0.03,W*0.13,H*0.024,un?'#1f1f1f':'#5f6368');bars(ctx,W*0.46,y+H*0.03,W*(0.25+((i*7)%3)*0.05),H*0.024,un?'#1f1f1f':'#80868b');
   if(i===1||i===5){ctx.fillStyle='#fce8b2';rr(ctx,W*0.46,y+H*0.058,W*0.08,H*0.02,6);ctx.fill()}bars(ctx,W*0.9,y+H*0.032,W*0.055,H*0.02,un?'#1f1f1f':'#80868b')}
  endFrame(ctx)},
 store(ctx,W,H){winFrame(ctx,W,H,'#1a1a1a');ctx.fillStyle='#1a1a1a';ctx.fillRect(0,H*0.062,W,H*0.11);shopBag(ctx,W*0.045,H*0.115,H*0.07);
  ctx.fillStyle='#ffffff';ctx.font=`700 ${H*0.062}px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText('shopify',W*0.08,H*0.118);bars(ctx,W*0.38,H*0.09,W*0.32,H*0.05,'#303030',10);
  ctx.fillStyle='#ebebeb';ctx.fillRect(0,H*0.172,W*0.2,H);for(let i=0;i<8;i++){if(i===2){ctx.fillStyle='#ffffff';rr(ctx,W*0.01,H*(0.2+i*0.07),W*0.18,H*0.055,8);ctx.fill()}ctx.fillStyle='#4a4a4a';rr(ctx,W*0.025,H*(0.213+i*0.07),H*0.028,H*0.028,4);ctx.fill();bars(ctx,W*0.06,H*(0.216+i*0.07),W*(0.07+((i*5)%3)*0.02),H*0.022,i===2?'#1a1a1a':'#616161')}
  ctx.fillStyle='#f1f1f1';ctx.fillRect(W*0.2,H*0.172,W,H);bars(ctx,W*0.23,H*0.21,W*0.18,H*0.04,'#1a1a1a');ctx.fillStyle='#1a1a1a';rr(ctx,W*0.82,H*0.2,W*0.15,H*0.06,10);ctx.fill();bars(ctx,W*0.845,H*0.219,W*0.1,H*0.022,'#ffffff');
  const items=[[drawTee,'#b33a3a'],[drawKurta,'#2f5d8a'],[drawScarf,'#c9932b'],[drawTote,'#3c7a4e'],[drawKurta,'#7a1f2b'],[drawTee,'#e8dcc4'],[drawScarf,'#6b4a8c'],[drawTee,'#2f6b5a']];
  const gx=W*0.23,gy=H*0.3,cw=(W*0.75)/4,chh=(H*0.66)/2;
  items.forEach(([fn,col],i)=>{const x=gx+(i%4)*cw,y=gy+Math.floor(i/4)*chh;ctx.fillStyle='#ffffff';rr(ctx,x+6,y+6,cw-12,chh-12,12);ctx.fill();
   ctx.fillStyle='#f4f1ea';rr(ctx,x+14,y+14,cw-28,chh*0.58,8);ctx.fill();fn(ctx,x+cw/2,y+14+chh*0.29,chh*0.42,col);
   bars(ctx,x+16,y+chh*0.69,cw*0.6,H*0.022,'#303030');bars(ctx,x+16,y+chh*0.79,cw*0.32,H*0.02,'#616161');
   const oos=i===2||i===5;ctx.fillStyle=oos?'#fed1d7':'#cdfee1';rr(ctx,x+cw*0.58,y+chh*0.78,cw*0.3,H*0.03,9);ctx.fill();bars(ctx,x+cw*0.62,y+chh*0.788,cw*0.2,H*0.014,oos?'#8e1f0b':'#0c5132')});
  endFrame(ctx)},
};
function star(ctx,x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*0.45:r;ctx.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}ctx.closePath();ctx.fill()}
const WSIZE=[1024,672];
export function winCanvas(k){return getCanvas('win-'+k,WSIZE[0],WSIZE[1],(c,W,H)=>WINDOWS[k](c,W,H))}
function iconCanvas(k){return getCanvas('icon-'+k,400,300,(ctx,W,H)=>{ctx.strokeStyle='#cfe0f0';ctx.lineWidth=7;rr(ctx,8,8,W-16,H-16,14);ctx.stroke();ctx.lineWidth=9;ctx.strokeStyle='#e6eef7';const cx=W/2,cy=H/2;ctx.beginPath();
 if(k==='chat'){rr(ctx,cx-70,cy-50,140,85,22);ctx.moveTo(cx-40,cy+35);ctx.lineTo(cx-55,cy+65);ctx.lineTo(cx-10,cy+35)}
 if(k==='store'){ctx.rect(cx-55,cy-25,110,85);ctx.moveTo(cx-28,cy-25);ctx.arc(cx,cy-25,28,Math.PI,0)}
 if(k==='pay'){rr(ctx,cx-80,cy-50,160,100,12);ctx.moveTo(cx-80,cy-20);ctx.lineTo(cx+80,cy-20);ctx.moveTo(cx-55,cy+20);ctx.lineTo(cx-10,cy+20)}
 if(k==='sheet'){ctx.rect(cx-75,cy-55,150,110);for(let i=1;i<3;i++){ctx.moveTo(cx-75+i*50,cy-55);ctx.lineTo(cx-75+i*50,cy+55)}for(let i=1;i<4;i++){ctx.moveTo(cx-75,cy-55+i*27.5);ctx.lineTo(cx+75,cy-55+i*27.5)}}
 if(k==='mail'){ctx.rect(cx-80,cy-50,160,100);ctx.moveTo(cx-80,cy-50);ctx.lineTo(cx,cy+10);ctx.lineTo(cx+80,cy-50)}
 if(k==='books'){ctx.rect(cx-75,cy-55,150,110);ctx.moveTo(cx,cy-55);ctx.lineTo(cx,cy+55);for(let i=1;i<4;i++){ctx.moveTo(cx-65,cy-55+i*27);ctx.lineTo(cx-10,cy-55+i*27);ctx.moveTo(cx+10,cy-55+i*27);ctx.lineTo(cx+65,cy-55+i*27)}}
 ctx.stroke()})}
function ledgerPage(side){return getCanvas('lp'+side,360,480,(ctx,W,H)=>{ctx.fillStyle='#ece2c8';ctx.fillRect(0,0,W,H);for(let i=0;i<300;i++){ctx.fillStyle='rgba(150,120,80,.06)';ctx.fillRect(Math.random()*W,Math.random()*H,3,3)}
 ctx.strokeStyle='#8fa7c0';ctx.lineWidth=1.6;for(let y=40;y<H;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.strokeStyle='#b8473a';ctx.lineWidth=2.5;for(const x of[side?40:W-40,W*0.62,W*0.8]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 ctx.strokeStyle='#2a3550';ctx.lineWidth=2.2;for(let y=58;y<H-20;y+=22){if(Math.random()<0.25)continue;ctx.beginPath();let x=side?52:14;ctx.moveTo(x,y);const e=x+W*(0.25+Math.random()*0.3);while(x<e){x+=6;ctx.lineTo(x,y-3+Math.sin(x*0.7)*3)}ctx.stroke();ctx.beginPath();ctx.moveTo(W*0.65,y);ctx.lineTo(W*0.75,y-2);ctx.stroke()}})}
function clockCanvas(){return getCanvas('clock',400,400,(ctx,W,H)=>{const c=W/2;ctx.fillStyle='#2b2220';ctx.beginPath();ctx.arc(c,c,c-2,0,7);ctx.fill();ctx.fillStyle='#ece4d0';ctx.beginPath();ctx.arc(c,c,c*0.86,0,7);ctx.fill();
 const g=ctx.createRadialGradient(c*0.8,c*0.7,10,c,c,c);g.addColorStop(0,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(0,0,0,.12)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c,c,c*0.86,0,7);ctx.fill();
 for(let i=0;i<60;i++){const a=i/60*Math.PI*2,big=i%5===0;ctx.strokeStyle='#2a2320';ctx.lineWidth=big?8:3;ctx.beginPath();ctx.moveTo(c+Math.cos(a)*c*0.8,c+Math.sin(a)*c*0.8);ctx.lineTo(c+Math.cos(a)*c*(big?0.66:0.74),c+Math.sin(a)*c*(big?0.66:0.74));ctx.stroke()}})}

/* ================= SCENE BUILDERS ================= */
const C=(h)=>hex(h);
function facade(parts,dim=1,nScale=1){
 const fw=new Part(Math.round(18000*SCALE*nScale)+10,nScale<1);plane(fw,getCanvas('facade',1080,630,drawFacade),16000*nScale,{c:[0,0.75,-0.02],w:18,h:10.5,edge:0.6,zj:0.04,dim});parts.push(fw);
 // signboard
 const sg=new Part(Math.round(30000*SCALE*nScale)+10);const sc=getCanvas('sign',2000,400,(c,W,H)=>drawSign(c,W,H,false));const sb=getCanvas('signB',2000,400,(c,W,H)=>drawSign(c,W,H,true));
 plane(sg,sc,24000*nScale,{c:[0,4.1,0.12],w:12.2,h:2.44,edge:1.4,boost:{cv:sb,k:2.2},zj:0.02,dim});
 box(sg,2500*nScale,{c:[0,4.1,0.05],s:[12.3,2.54,0.12],color:()=>J(C('#3b170c')),faces:['py','ny','px','nx'],dim});parts.push(sg);
 return sg;
}
function bulbOut(parts,dim=1,on=1){const b=new Part(Math.round(5000*SCALE)+10);
 tube(b,700,{pts:[[0,5.35,0.05],[0,6.1,0.05],[0,6.25,0.35],[0,6.2,0.95],[0,6.0,1.1]],rad:0.025,color:C('#2a2826'),dim});
 cyl(b,1300,{c:[0,5.88,1.1],r:0.06,r2:0.42,len:0.3,axis:'y',color:(f)=>f==='capA'?C('#1f3b2c'):C('#2e5a40'),caps:false,dim});
 sphere(b,1300,{c:[0,5.66,1.1],r:0.12,color:()=>C('#ffd089'),em:on,group:9});parts.push(b)}
function shutter(parts,{dim=1,n=42000}={}){const s=new Part(Math.round((n+4000)*SCALE)+10);const N=Math.round(n*SCALE);
 const y0=-4.5,y1=2.9,sl=0.26;
 for(let i=0;i<N;i++){const x=(Math.random()-0.5)*10.4;let y=y0+Math.random()*(y1-y0);if(Math.random()<0.3)y=y1-Math.floor((y1-y)/sl)*sl-0.012-Math.random()*0.02;
  const u=((y1-y)/sl)%1,slat=Math.floor((y1-y)/sl);const groove=u<0.09||u>0.95;const z=0.05*Math.sin(Math.PI*u)+0.02;
  const n1=fbm(x*0.6+slat*0.37,y*0.4);const rust=Math.max(0,fbm(x*1.7,y*0.3+3)-0.58)*3;let c=[118,126,132];c=mix(c,[120,62,32],Math.min(1,rust));
  const sh=groove?0.28:(0.62+0.42*Math.sin(Math.PI*Math.min(1,u*1.3))*(0.85+0.3*n1))*(0.92+0.16*((slat*7)%5)/4);
  s.push(x,y,z,c[0]*sh*dim,c[1]*sh*dim,c[2]*sh*dim,0,(y-y0)/(y1-y0),0)}
 // bottom bar, guides, housing, handles
 box(s,1600,{c:[0,-4.42,0.08],s:[10.4,0.18,0.16],color:()=>J(C('#5d6266')),dim});
 for(const gx of[-5.25,5.25])box(s,1200,{c:[gx,-0.8,0.06],s:[0.16,7.4,0.18],color:()=>J(C('#3d4144')),dim});
 cyl(s,1800,{c:[0,3.05,0.25],r:0.28,len:10.8,axis:'x',color:()=>J(C('#4c5452'),0.1),dim});
 for(const hx of[-2.6,2.6])tube(s,200,{pts:[[hx-0.2,-4.3,0.18],[hx-0.2,-4.18,0.28],[hx+0.2,-4.18,0.28],[hx+0.2,-4.3,0.18]],rad:0.02,color:C('#808a90'),dim});
 parts.push(s);return s}
function padlock(parts,dim=1){const p=new Part(Math.round(2400*SCALE)+10);
 box(p,500,{c:[0,-4.18,0.2],s:[0.36,0.16,0.04],color:()=>C('#7d858b'),dim});
 box(p,1200,{c:[0,-4.34,0.26],s:[0.3,0.32,0.12],color:(f,u,v)=>{const b=C('#b38b3c');return v>0.8&&f==='pz'?mix(b,[240,210,140],0.5):J(b,0.05)},dim});
 const pts=[];for(let i=0;i<=20;i++){const a=Math.PI*i/20;pts.push([Math.cos(a)*0.09,-4.18+Math.sin(a)*0.14,0.26])}tube(p,500,{pts,rad:0.018,color:C('#c6ccd0'),dim});
 parts.push(p)}
function lane(parts,dim=1){const g=new Part(Math.round(9000*SCALE)+10,dim<1);const cv=getCanvas('lane',440,160,drawLane);
 plane(g,cv,8000,{c:[0,-4.52,4],R:[1,0,0],U:[0,0,-1],w:22,h:8,edge:0.3,dim});parts.push(g)}

// ---- warehouse ----
function carton(p,n,c,s,dim){const kraft=mix(C('#b48a5a'),C('#9a7146'),Math.random());box(p,n,{c,s,dim,color:(f,u,v)=>{let k=J(kraft,0.04);
 if(f==='py'&&Math.abs(u-0.5)<0.07)k=mix(k,[205,170,115],0.7);
 if((f==='px'||f==='nx'||f==='pz')&&Math.abs(u-0.5)<0.06&&v>0.8)k=mix(k,[205,170,115],0.7);
 if((f==='px'||f==='nx'||f==='pz')&&u>0.2&&u<0.55&&v>0.25&&v<0.55){k=[232,228,218];if(v<0.4&&Math.sin(u*180)>0.1)k=[30,30,30]}
 return k}})}
function bolt(p,n,c,len,r,col,dim){cyl(p,n,{c,r,len,axis:'x',dim,color:(f,u,v)=>{const b=hex(col);if(f!=='side'){const ring=Math.sin(u*60)*0.12+0.9;return[b[0]*ring,b[1]*ring,b[2]*ring]}return J(b,0.05)}})}
function sack(p,n,c,dim){sphere(p,n,{c,r:0.42,squash:[0.75,0.55,0.62],dim,color:()=>J(C('#b9a074'),0.1)})}
const TEX=['#2b3a6b','#7a1f2b','#c9932b','#e8dcc4','#2f6b5a','#8a4f8c','#b24a2a'];
function racks(parts,{dim=1,nScale=1,seed=7}={}){const p=new Part(Math.round(62000*SCALE*nScale)+50,dim<0.9);let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
 const nS=nScale*0.24;const levels=[-4.45,-2.75,-1.05,0.65];
 for(const side of[-1,1]){const xf=side*4.3,xb=side*6.1,xc=side*5.2;
  for(let b=0;b<=5;b++){const z=-1.4-b*2.35;for(const x of[xf,xb])box(p,520*nS,{c:[x,-1.4,z],s:[0.09,6.4,0.09],dim,color:(f,u,v)=>{const k=C('#2c4f8f');return(Math.floor(v*40)%3===0)?mix(k,[20,30,50],0.5):k}});}
  for(let b=0;b<5;b++){const zc=-1.4-(b+0.5)*2.35;
   for(const ly of levels.concat([2.35])){for(const x of[xf,xb])box(p,380*nS,{c:[x,ly-0.06,zc],s:[0.08,0.14,2.3],dim,color:()=>J(C('#d4702a'),0.05)})}
   for(let li=0;li<4;li++){const ly=levels[li];const kind=(b+li*2+(side>0?1:0))%4;let zz=zc-1.05;
    while(zz<zc+0.95){if(kind===1){const r=0.17;for(let row=0;row<3;row++){if(zz+r*2>zc+1.05)break;for(let st=0;st<4-row%2;st++)bolt(p,260*nS,[xc,ly+0.02+r+st*r*1.95+(row%2)*0.0,zz+r],1.7,r,TEX[Math.floor(R()*TEX.length)],dim);zz+=r*2.05}}
     else if(kind===3){sack(p,700*nS,[xc,ly+0.3,zz+0.42],dim);sack(p,600*nS,[xc,ly+0.8,zz+0.45],dim);zz+=0.9}
     else{const w=0.5+R()*0.35,h=0.45+R()*0.45;carton(p,Math.round(900*nS*w*h/0.25),[xc+(R()-0.5)*0.15,ly+0.02+h/2,zz+w/2],[1.4,h,w*0.96],dim);if(h<0.7&&R()<0.7){const h2=0.35+R()*0.3;carton(p,Math.round(700*nS*w*h2/0.25),[xc,ly+0.04+h+h2/2,zz+w/2],[1.3,h2,w*0.9],dim)}zz+=w}}}
  }}
 parts.push(p);return p}
function shell(parts,{dim=1,nScale=1}={}){const p=new Part(Math.round(22000*SCALE*nScale)+20,dim<0.9);
 plane(p,getCanvas('floor',600,700,drawFloor),9000*nScale,{c:[0,-4.5,-7.2],R:[1,0,0],U:[0,0,-1],w:13,h:14.4,edge:0.4,dim});
 plane(p,getCanvas('corr',700,360,drawCorrugated),6000*nScale,{c:[0,0.4,-14.3],w:13,h:9.8,edge:0.3,dim});
 // structural column behind table + interior bulb wire
 box(p,1400*nScale,{c:[0,-0.2,-7.7],s:[0.36,8.6,0.36],dim,color:(f,u,v)=>v<0.12?C('#c9a227'):J(C('#6c7276'),0.05)});
 parts.push(p);return p}
function bulbIn(parts,{dim=1,on=1}={}){const b=new Part(Math.round(3600*SCALE)+10);tube(b,600,{pts:[[0,4.8,-5.1],[0,1.75,-5.1]],rad:0.012,color:C('#1d1c1a'),dim});
 cyl(b,1300,{c:[0,1.6,-5.1],r:0.05,r2:0.4,len:0.28,axis:'y',color:()=>C('#2e5a40'),caps:false,dim});sphere(b,1200,{c:[0,1.38,-5.1],r:0.11,color:()=>C('#ffd089'),em:on,group:10});parts.push(b)}
const TABLE={c:[0,-2.76,-5.2],s:[4.6,0.1,1.7],top:-2.71};
function table(parts,{dim=1,nScale=1}={}){const p=new Part(Math.round(14000*SCALE*nScale)+20,dim<0.5);
 box(p,7000*nScale,{c:TABLE.c,s:TABLE.s,dim,color:(f,u,v)=>{const g=Math.sin(u*90+fbm(u*8,v*3)*9)*0.5+0.5;return mix(C('#8b5a33'),C('#5e3a1f'),g*0.6)}});
 for(const x of[-2.15,2.15])for(const z of[-4.45,-5.95])box(p,500*nScale,{c:[x,-3.63,z],s:[0.1,1.75,0.1],dim,color:()=>C('#4a2f1a')});
 box(p,2200*nScale,{c:[0,-4.1,-5.2],s:[4.3,0.06,1.5],dim,faces:['py','pz'],color:(f,u,v)=>J(C('#6b4528'))});
 for(let i=0;i<4;i++)box(p,500*nScale,{c:[-1.2+i*0.12,-3.98-0.0+i*0.02,-5.2],s:[1.5,0.03,1.1],dim,ry:0.05*i,color:()=>J(C('#a98055'))});
 parts.push(p);return p}
function tableItems(parts,{dim=1,nScale=1,phone=true,ledgerClosed=true,receipt=true}={}){const p=new Part(Math.round(16000*SCALE*nScale)+20);const T=TABLE.top;
 // receipt printer + paper strip (printing = reveal)
 box(p,1600*nScale,{c:[1.6,T+0.14,-5.05],s:[0.55,0.28,0.48],dim,color:(f,u,v)=>f==='py'&&v>0.6&&v<0.68?C('#0a0a0a'):f==='pz'&&u>0.75&&v>0.4&&v<0.5?C('#2fd06a'):J(C('#2b2c30'),0.04)});
 if(receipt){const n=Math.round(2600*SCALE*nScale);for(let i=0;i<n;i++){const t=Math.random(),w=(Math.random()-0.5)*0.34;const y=T+0.3+t*1.0,z=-5.0-0.25*t*t;
  const row=Math.floor(t*30),inRow=(t*30)%1;const glyph=inRow>0.35&&inRow<0.65&&Math.abs(w)<0.13*(0.5+((row*7)%5)/8)&&row%5!==0;
  const c=glyph?[70,70,70]:[236,234,226];p.push(1.6+w,y,z,c[0]*dim,c[1]*dim,c[2]*dim,2,t,0)}}
 // ledger: red cloth khata, white string
 if(ledgerClosed){box(p,2200*nScale,{c:[-1.25,T+0.08,-5.05],s:[1.0,0.15,0.7],dim,color:(f,u,v)=>{if(f==='py'){const bd=u<0.05||u>0.95||v<0.07||v>0.93;return bd?C('#c9a24a'):J(C('#8e1f1c'),0.06)}if(f==='pz'||f==='px')return v>0.15&&v<0.85?C('#e6dcc2'):C('#7a1a17');return C('#7a1a17')}});
  tube(p,250*nScale,{pts:[[-1.25,T+0.16,-5.4],[-1.25,T+0.16,-4.7],[-1.1,T+0.12,-4.6]],rad:0.006,color:[235,230,220],dim})}
 // tape roll + parcels on table
 cyl(p,700*nScale,{c:[-0.35,T+0.05,-5.55],r:0.13,len:0.09,axis:'y',dim,color:(f,u)=>f==='side'?C('#a57a44'):(u<0.55?C('#3a2a1a'):C('#b58a52'))});
 carton(p,1500*nScale,[-1.85,T+0.22,-5.6],[0.75,0.44,0.5],dim);carton(p,1100*nScale,[-1.8,T+0.6,-5.6],[0.6,0.32,0.42],dim);
 if(phone){} parts.push(p);return p}
function phoneFlat(parts,{dim=1,at=60000}={}){const p=new Part(Math.round(2600*SCALE)+10);const T=TABLE.top;
 box(p,2600,{c:[0.25,T+0.02,-4.75],s:[0.42,0.03,0.86],ry:-0.15,dim,color:(f,u,v)=>f==='py'&&u>0.06&&u<0.94&&v>0.04&&v<0.96?mix(C('#0c1418'),C('#30424a'),Math.max(0,1-Math.abs(u-v)*4)*0.5):C('#1a1a1c')});
 p.at=at;parts.push(p);return p}

/* ================= STATES ================= */
export const STATES=[];
function fillDust(min,max,col){return(f,n)=>dust(f,n/SCALE,{min,max,color:col})}

// K0: dust in the lane under the (unlit) bulb
STATES.push(()=>{const parts=[];const d=new Part(Math.round(131072*SCALE)+10);
 const n=Math.round(131072*SCALE);for(let i=0;i<n;i++){const t=Math.random();let x,y,z;if(t<0.55){const h=Math.random();y=5.6-h*10;const r=Math.sqrt(Math.random())*(0.3+h*4.2);const a=Math.random()*7;x=Math.cos(a)*r;z=1.1+Math.sin(a)*r*0.6}else{x=(Math.random()-0.5)*24;y=-4.5+Math.random()*11;z=-1+Math.random()*7}
  const j=0.6+Math.random()*0.5;d.push(x,y,z,170*j,150*j,120*j,1,Math.random(),0)}
 parts.push(d);return{parts,fill:fillDust([-12,-5,-1],[12,6,6],[160,140,110])}});
// K1: godown front at night, shutter down, padlock, bulb
STATES.push(()=>{const parts=[];const sh=shutter(parts);sh.at=0;facade(parts);bulbOut(parts);padlock(parts);lane(parts);
 return{parts,fill:fillDust([-6,-4.5,0.3],[6,6,5],[170,150,118])}});
// K2: warehouse inside; shutter rolled into its drum; front frame thinned
STATES.push(()=>{const parts=[];const roll=new Part(Math.round(7000*SCALE)+10);cyl(roll,7000,{c:[0,3.05,0.25],r:0.42,len:10.6,axis:'x',color:(f,u)=>J(mix(C('#6f777c'),C('#3a3f42'),(Math.sin(u*200)*0.5+0.5)),0.08)});roll.at=0;parts.push(roll);
 facade(parts,1,0.45);bulbOut(parts);lane(parts,0.7);racks(parts);shell(parts);bulbIn(parts);table(parts);tableItems(parts);phoneFlat(parts);
 const pad=new Part(Math.round(900*SCALE)+10);box(pad,900,{c:[0.6,-4.45,0.6],s:[0.3,0.1,0.3],ry:0.6,color:()=>C('#b38b3c')});parts.push(pad);
 return{parts,fill:fillDust([-4,-4.4,-12],[4,4,0],[150,130,100])}});
// K3: phone lifted and lit, chat stacking in; warehouse dimmed behind
export const PHONE3={c:[0,-1.2,-1.6],w:0.86,h:1.78};
STATES.push(()=>{const parts=[];const ph=new Part(Math.round(52000*SCALE)+20);const {c,w,h}=PHONE3;
 box(ph,6000,{c:[c[0],c[1],c[2]-0.035],s:[w+0.06,h+0.06,0.06],color:(f,u,v)=>f==='pz'?C('#121315'):C('#2a2c30')});
 const scr=getCanvas('chat',430,890,drawChat);plane(ph,scr,22000,{c:[c[0],c[1],c[2]+0.001],w,h,edge:0.8,em:0.85});
 CHAT_BUBBLES.forEach((b,i)=>{const bc=getCanvas('bub'+i,430,890,(ctx,W,H)=>drawBubble(ctx,W,H,b));plane(ph,bc,3300*(b.h/0.08),{c:[c[0],c[1],c[2]+0.006],w,h,edge:1.2,em:0.9,group:3,reveal:()=>(i+0.5)/CHAT_BUBBLES.length})});
 ph.at=60000;parts.push(ph);
 racks(parts,{dim:0.32,nScale:0.85});shell(parts,{dim:0.3,nScale:0.7});table(parts,{dim:0.4});tableItems(parts,{dim:0.4,receipt:true});bulbIn(parts,{dim:0.8});
 return{parts,fill:fillDust([-5,-4.4,-12],[5,3,0],[110,110,120])}});
// K4: tool windows peel off the phone and float, unread dots blinking
export const WINPOS=[{k:'store',c:[-2.75,0.55,-3.3],ry:0.38,rx:0.04},{k:'pay',c:[2.75,0.6,-3.1],ry:-0.38,rx:0.04},{k:'sheet',c:[-2.45,-1.75,-2.3],ry:0.3,rx:-0.12},{k:'inbox',c:[2.5,-1.7,-2.45],ry:-0.3,rx:-0.1},{k:'chat',c:[0.05,1.45,-4.6],ry:0.02,rx:0.06}];
export const WIN_WH=[2.05,1.35];
export const PHONE4={c:[0,-0.85,-1.6],s:1};
// mobile (390 wide): four windows in an overlapping column, chat stays in the phone
export function mobileLayout(){const M={store:[[-0.28,2.12,-3.25],0.14,0.03],pay:[[0.3,0.74,-2.95],-0.14,0.02],sheet:[[-0.3,-0.62,-2.65],0.12,-0.03],inbox:[[0.28,-1.98,-2.95],-0.12,-0.05]};
 for(const W of WINPOS){const m=M[W.k];if(!m){W.hide=1;continue}W.c=m[0];W.ry=m[1];W.rx=m[2]}PHONE4.c=[0.66,-2.78,-1.3];PHONE4.s=0.6}
const winBasis=W=>[rotY(rotX([1,0,0],W.rx),W.ry),rotY(rotX([0,1,0],W.rx),W.ry)];
STATES.push(()=>{const parts=[];const wp=new Part(Math.round(42000*SCALE)+50);
 for(const W of WINPOS){if(W.hide)continue;const[R,U]=winBasis(W);plane(wp,winCanvas(W.k),7000,{c:W.c,R,U,w:WIN_WH[0],h:WIN_WH[1],edge:1.8,em:0.8});
  // unread badge
  const bc=[W.c[0]+R[0]*0.98+U[0]*0.64,W.c[1]+R[1]*0.98+U[1]*0.64,W.c[2]+R[2]*0.98+U[2]*0.64+0.03];sphere(wp,500,{c:bc,r:0.07,color:()=>C(W.k==='sheet'?'#e0533a':'#f2523f'),em:1,group:4})}
 wp.at=0;parts.push(wp);
 const ph=new Part(Math.round(14000*SCALE)+20);const pc=PHONE4.c,k=PHONE4.s;box(ph,2500,{c:[pc[0],pc[1],pc[2]-0.03],s:[0.66*k,1.36*k,0.05],color:(f)=>f==='pz'?C('#121315'):C('#2a2c30')});
 plane(ph,getCanvas('chat',430,890,drawChat),7000,{c:[pc[0],pc[1],pc[2]+0.001],w:0.62*k,h:1.3*k,em:0.85});
 CHAT_BUBBLES.forEach((b,i)=>plane(ph,getCanvas('bub'+i,430,890,()=>{}),900*(b.h/0.08),{c:[pc[0],pc[1],pc[2]+0.006],w:0.62*k,h:1.3*k,em:0.9}));ph.at=80000;parts.push(ph);
 racks(parts,{dim:0.22,nScale:0.55});shell(parts,{dim:0.2,nScale:0.5});table(parts,{dim:0.28,nScale:0.6});bulbIn(parts,{dim:0.6});
 return{parts,fill:fillDust([-6,-4,-8],[6,3,1],[90,100,120])}});
// K5: night shift; windows fallen flat on the packing table, ledger open, red copy strokes, clock, chair, tea
export const LEDGER5={c:[0.05,TABLE.top+0.05,-4.95],spine:0.05};
export const CLOCK5={c:[0,0.15,-7.48],r:0.62};
export const CHAIR5={c:[1.95,-3.5,-3.85],ry:-0.5};
export const TEA5=[0.92,TABLE.top,-4.55];
const PILE=[];{let s=11;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};const ks=['store','pay','sheet','inbox','chat','sheet','pay','store'];
 const spots=[[-1.65,-5.35],[1.55,-5.45],[-1.5,-4.75],[1.85,-4.78],[-0.75,-5.55],[0.85,-5.6],[-2.0,-5.05],[2.0,-5.1]];
 ks.forEach((k,i)=>PILE.push({k,x:spots[i][0],z:spots[i][1],ry:(R()-0.5)*0.7,y:TABLE.top+0.006+i*0.006}))}
export {PILE};
function strokePaths(){const P=[];let s=5;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
 const trips=[[2,0],[1,3],[3,6],[0,5],[2,7],[6,1],[4,2],[5,3],[0,1],[7,4],[3,0],[1,6]];
 for(const[a,b]of trips){const A=PILE[a],B=PILE[b];const pa=[A.x+(R()-0.5)*0.4,TABLE.top+0.06,A.z+(R()-0.5)*0.25],pb=[B.x+(R()-0.5)*0.4,TABLE.top+0.06,B.z+(R()-0.5)*0.25];
  const h=0.45+R()*0.9;const pts=[];for(let i=0;i<=40;i++){const t=i/40;const wob=Math.sin(t*Math.PI*3+a)*0.06;pts.push([pa[0]+(pb[0]-pa[0])*t+wob,pa[1]+(pb[1]-pa[1])*t+Math.sin(Math.PI*t)*h,pa[2]+(pb[2]-pa[2])*t+Math.sin(t*Math.PI*2)*0.15])}
  // landing scribble: smudged row written into the destination
  for(let i=0;i<14;i++){const t=i/13;pts.push([pb[0]+t*0.35,pb[1]-0.04+Math.sin(t*20)*0.015,pb[2]])}P.push(pts)}return P}
export const STROKES=strokePaths();
STATES.push(()=>{const parts=[];
 const pile=new Part(Math.round(46000*SCALE)+50);PILE.forEach((q,i)=>{const R=rotY([1,0,0],q.ry),U=rotY([0,0,-1],q.ry);plane(pile,winCanvas(q.k),3600,{c:[q.x,q.y,q.z],R,U,w:1.25,h:0.82,edge:0.7,em:0.35,dim:0.85})});pile.at=0;parts.push(pile);
 // open ledger: two pages + flipping page (group 8 rotates about spine)
 const L=new Part(Math.round(16000*SCALE)+20);const lc=LEDGER5.c;
 box(L,1800,{c:[lc[0],lc[1]-0.03,lc[2]],s:[1.5,0.04,0.95],color:()=>J(C('#7a1a17'),0.05),faces:['py','pz','px','nx']});
 plane(L,ledgerPage(0),4200,{c:[lc[0]-0.37,lc[1],lc[2]],R:[1,0,0],U:[0,0,-1],w:0.72,h:0.9,edge:1});
 plane(L,ledgerPage(1),4200,{c:[lc[0]+0.37,lc[1],lc[2]],R:[1,0,0],U:[0,0,-1],w:0.72,h:0.9,edge:1});
 plane(L,ledgerPage(1),3200,{c:[lc[0]+0.37,lc[1]+0.01,lc[2]],R:[1,0,0],U:[0,0,-1],w:0.72,h:0.9,edge:1,group:8});
 // tea glass (cutting chai): fluted, tapered, half full, beside the ledger
 {const g=TEA5;
  // amber tea first (dense, warm), then a sparse fluted glass skin so the tea reads through it
  cyl(L,1700,{c:[g[0],g[1]+0.09,g[2]],r:0.082,r2:0.096,len:0.17,axis:'y',em:0.55,color:(f)=>f==='capB'?C('#e2a65e'):J(C('#b8691e'),0.06)});
  cyl(L,700,{c:[g[0],g[1]+0.15,g[2]],r:0.11,r2:0.125,len:0.3,axis:'y',caps:false,em:0.2,color:(f,u)=>{const fl=0.55+0.45*Math.max(0,Math.cos(u*Math.PI*2*12));return[150*fl,165*fl,172*fl]}});
  cyl(L,300,{c:[g[0],g[1]+0.005,g[2]],r:0.09,len:0.012,axis:'y',em:0.3,color:()=>[170,180,186]});
  cyl(L,320,{c:[g[0],g[1]+0.3,g[2]],r:0.125,len:0.008,axis:'y',caps:false,em:0.7,color:()=>[235,240,242]});
  // saucer under the glass
  cyl(L,500,{c:[g[0],g[1]+0.0,g[2]],r:0.2,len:0.006,axis:'y',em:0.2,color:()=>C('#d8cfc0')})}
 parts.push(L);
 // copy strokes: oxide, written trip after trip (group 5, reveal along trips)
 const S=new Part(Math.round(17000*SCALE)+20);STROKES.forEach((pts,i)=>tube(S,1350,{pts,rad:0.011,color:C('#d0502e'),group:5,r0:i/STROKES.length,r1:(i+0.98)/STROKES.length,em:0.9}));S.at=80000;parts.push(S);
 // wall clock on the column: face, rim, hands (group 6/7)
 const K=new Part(Math.round(13000*SCALE)+20);plane(K,clockCanvas(),10000,{c:CLOCK5.c,w:CLOCK5.r*2,h:CLOCK5.r*2,edge:1.2});
 tube(K,900,{pts:[[CLOCK5.c[0],CLOCK5.c[1],CLOCK5.c[2]+0.03],[CLOCK5.c[0],CLOCK5.c[1]+0.3,CLOCK5.c[2]+0.03]],rad:0.03,color:[24,20,18],group:6});
 tube(K,900,{pts:[[CLOCK5.c[0],CLOCK5.c[1],CLOCK5.c[2]+0.04],[CLOCK5.c[0],CLOCK5.c[1]+0.47,CLOCK5.c[2]+0.04]],rad:0.022,color:[24,20,18],group:7});
 parts.push(K);
 // wooden chair, slatted back, pushed back from the table and turned
 const ch=new Part(Math.round(11000*SCALE)+20);const cc=CHAIR5.c,ry=CHAIR5.ry;
 const wood=(f,u,v)=>{const g=Math.sin(u*70+fbm(u*6,v*2)*6)*0.5+0.5;return mix(C('#b98250'),C('#8a5a32'),g*0.55)};
 const CB=(o,s,n)=>{const q=rotY(o,ry);box(ch,n,{c:[cc[0]+q[0],cc[1]+q[1],cc[2]+q[2]],s,ry,color:wood,faces:['px','nx','py','pz','nz','ny']})};
 CB([0,0,0],[0.95,0.07,0.88],2250); // seat
 for(const x of[-0.42,0.42])for(const z of[-0.38,0.38])CB([x,-0.5,z],[0.075,1.0,0.075],480); // legs
 for(const z of[-0.38,0.38])CB([0,-0.72,z],[0.84,0.05,0.05],225);for(const x of[-0.42,0.42])CB([x,-0.72,0],[0.05,0.05,0.76],225); // stretchers
 for(const x of[-0.42,0.42])CB([x,0.58,-0.4],[0.08,1.1,0.08],630); // back posts
 CB([0,1.08,-0.4],[0.95,0.14,0.07],630);for(const y of[0.55,0.78])CB([0,y,-0.4],[0.84,0.07,0.05],390); // top rail + back slats
 for(const x of[-0.2,0,0.2])CB([x,0.38,-0.4],[0.06,0.55,0.04],240); // spindles
 parts.push(ch);
 racks(parts,{dim:0.26,nScale:0.6});shell(parts,{dim:0.3,nScale:0.6});table(parts,{dim:0.75,nScale:0.8});bulbIn(parts,{dim:1});
 const pr=new Part(Math.round(2500*SCALE)+10);box(pr,1500,{c:[1.6+0.75,TABLE.top+0.14,-4.75],s:[0.5,0.26,0.44],color:()=>J(C('#2b2c30'),0.04),dim:0.8});parts.push(pr);
 return{parts,fill:fillDust([-4,-4.4,-9],[4,2,-1],[120,100,90])}});
// K6: strokes straightened into ruled lines; windows flattened into labelled boxes; first blueprint grid
export const BOXES6=[{k:'chat',x:-1.75,z:-4.6},{k:'store',x:-0.6,z:-4.6},{k:'pay',x:0.55,z:-4.6},{k:'sheet',x:1.7,z:-4.6},{k:'mail',x:-1.15,z:-5.85},{k:'books',x:1.1,z:-5.85}];
STATES.push(()=>{const parts=[];const T=TABLE.top+0.02;
 const bx=new Part(Math.round(50000*SCALE)+50);BOXES6.forEach(b=>plane(bx,iconCanvas(b.k),7600,{c:[b.x,T,b.z],R:[1,0,0],U:[0,0,-1],w:0.95,h:0.72,edge:1.4,em:0.75,tint:[0.85,0.95,1.05]}));bx.at=0;parts.push(bx);
 // ruled lines: manhattan routes between boxes, plus bus line through the middle
 const S=new Part(Math.round(17000*SCALE)+20);const zBus=-5.22;const routes=[];
 BOXES6.forEach((b,i)=>{const z0=b.z+(b.z>-5?-0.36:0.36);routes.push([[b.x,T,z0],[b.x,T,zBus]])});
 routes.push([[-2.3,T,zBus],[2.3,T,zBus]]);routes.push([[-2.3,T,zBus-0.05],[2.3,T,zBus-0.05]]);
 for(let i=0;i<12;i++){const r=routes[i%routes.length];tube(S,1350,{pts:r,rad:0.008,color:C('#d0502e'),group:11,r0:0,r1:1,em:0.9})}
 S.at=80000;parts.push(S);
 const g=new Part(Math.round(30000*SCALE)+20);const n=Math.round(26000*SCALE);for(let i=0;i<n;i++){const gx=Math.round((Math.random()-0.5)*44)/4,gz=-5.2+Math.round((Math.random()-0.5)*28)/4;const along=Math.random()<0.5;const x=along?gx+(Math.random()-0.5)*0.25:gx,z=along?gz:gz+(Math.random()-0.5)*0.25;g.push(x,TABLE.top-0.01,z,40,70,118,0,0,0.5)}parts.push(g);
 racks(parts,{dim:0.12,nScale:0.45});table(parts,{dim:0.25,nScale:0.5});shell(parts,{dim:0.12,nScale:0.4});
 return{parts,fill:fillDust([-5,-4.4,-9],[5,2,-1],[50,70,110])}});

export function buildState(i,N){const {parts,fill}=STATES[i]();const drops=parts.filter(p=>p.drop).map(p=>p.n+'+'+p.drop);if(drops.length)console.warn('state',i,'dropped',drops.join(' '));const tot=parts.reduce((a,p)=>a+p.n,0);console.log('state',i,'pts',tot,'of',N);return assemble(N,parts,fill)}

// crisp card overlays (drawn by film.js): window screens in K4, the fallen pile in K5
export function CARDS(){const out=[];
 for(const W of WINPOS){if(W.hide)continue;const[R,U]=winBasis(W);out.push({canvas:winCanvas(W.k).c,c:W.c,R,U,w:WIN_WH[0],h:WIN_WH[1],t:[25.5,26.5,33.5,34.3],sweep:[0,1],lift:0.012})}
 for(const q of PILE){const R=rotY([1,0,0],q.ry),U=rotY([0,0,-1],q.ry);out.push({canvas:winCanvas(q.k).c,c:[q.x,q.y,q.z],R,U,w:1.25,h:0.82,t:[35.9,36.8,42.4,43.4],sweep:[-1,0],lift:0.01,light:(T,l1,l2)=>0.42+0.3*l2})}
 return out}

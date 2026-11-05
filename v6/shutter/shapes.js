import {COPY} from './copy.js?v=v6a';
import {Part,getCanvas,plane,box,cyl,tube,sphere,dust,assemble,hex,vnoise,fbm,rotY,rotX,SCALE} from './lib.js?v=v6a';
// GROUPS: 0 solid,1 dust,2 receipt print,3 chat bubbles,4 unread blink,5 copy strokes,6 hour hand,7 minute hand,8 ledger page,9 bulb out,10 bulb in,11 ruled lines,12 windows reveal
const BONE='#efe6d2',OX='#7E2A18';
const J=(c,j=0.08)=>{const k=1+(Math.random()-0.5)*2*j;return[c[0]*k,c[1]*k,c[2]*k]};
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function bars(ctx,x,y,w,h,col,R){ctx.fillStyle=col;rr(ctx,x,y,w,h,Math.min(h/2,R??h/2));ctx.fill()}

/* ================= ART: canvases ================= */
function drawSign(ctx,W,H,boost,two){const fs=two?0.32:0.5,ty=two?0.31:0.53;
 if(boost){ctx.fillStyle='#fff';signText(ctx,W,H,fs,ty);return}
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
 ctx.fillStyle='rgba(20,6,2,.75)';ctx.save();ctx.translate(H*0.02,H*0.025);signText(ctx,W,H,fs,ty);ctx.restore();
 ctx.fillStyle=BONE;signText(ctx,W,H,fs,ty);
 if(two){ctx.fillStyle='rgba(30,8,3,.55)';ctx.fillRect(H*0.2,H*0.52,W-H*0.4,H*0.33);ctx.strokeStyle='rgba(216,204,179,.55)';ctx.lineWidth=H*0.008;ctx.strokeRect(H*0.2,H*0.52,W-H*0.4,H*0.33)}
 // paint wear inside letters
 ctx.globalCompositeOperation='source-atop';for(let i=0;i<500;i++){ctx.fillStyle=`rgba(${Math.random()<0.6?'190,170,140':'120,50,30'},${0.25+Math.random()*0.4})`;ctx.fillRect(Math.random()*W,Math.random()*H,2+Math.random()*7,1+Math.random()*3)}
 ctx.globalCompositeOperation='source-over';
}
function signText(ctx,W,H,fs=0.5,ty=0.53){ctx.font=`700 ${Math.round(H*fs)}px "Playfair Display", Georgia, serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 const t=COPY.sign;const sp=H*0.035;let tw=0;for(const ch of t)tw+=ctx.measureText(ch).width+sp;tw-=sp;let x=W/2-tw/2;
 for(const ch of t){const w=ctx.measureText(ch).width;ctx.fillText(ch,x+w/2,H*ty);x+=w+sp}}

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
function fitFont(ctx,t,wt,px,maxW){ctx.font=`${wt} ${px}px ${FONT}`;const w=ctx.measureText(t).width;if(w>maxW){px*=maxW/w;ctx.font=`${wt} ${px}px ${FONT}`}return px}
function rzpMark(ctx,x,y,s){ctx.fillStyle='#3395ff';ctx.beginPath();ctx.moveTo(x+s*0.05,y+s*0.5);ctx.lineTo(x+s*0.3,y-s*0.15);ctx.lineTo(x+s*0.05,y-s*0.05);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(x-s*0.25,y+s*0.5);ctx.lineTo(x+s*0.02,y-s*0.42);ctx.lineTo(x+s*0.55,y-s*0.6);ctx.lineTo(x+s*0.3,y-s*0.15);ctx.lineTo(x+s*0.15,y-s*0.25);ctx.lineTo(x-s*0.02,y+s*0.5);ctx.closePath();ctx.fill()}
const WINDOWS={
 chat(ctx,W,H){winFrame(ctx,W,H,'#f0f2f5',1);
  ctx.fillStyle='#008069';ctx.fillRect(0,H*0.062,W,H*0.12);waLogo(ctx,W*0.05,H*0.122,H*0.04);
  ctx.fillStyle='#fff';fitFont(ctx,COPY.chatApp,700,H*0.064,W*0.3);ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(COPY.chatApp,W*0.085,H*0.124);
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
  rzpMark(ctx,W*0.045,H*0.15,H*0.07);ctx.fillStyle='#fff';fitFont(ctx,COPY.payBrand,700,H*0.062,W*0.17);ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(COPY.payBrand,W*0.075,H*0.152);
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
 cal(ctx,W,H){winFrame(ctx,W,H,'#eef1f5',1);ctx.fillStyle='#ffffff';ctx.fillRect(0,H*0.062,W,H);
  // generic calendar: header, mini month on the left, week grid with blocks
  ctx.fillStyle='#4a7ad8';rr(ctx,W*0.025,H*0.085,H*0.075,H*0.075,8);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(W*0.025+H*0.015,H*0.085+H*0.03,H*0.045,H*0.03);
  bars(ctx,W*0.09,H*0.105,W*0.12,H*0.032,'#3c4043');bars(ctx,W*0.62,H*0.1,W*0.1,H*0.045,'#e8eaed',10);bars(ctx,W*0.75,H*0.1,W*0.1,H*0.045,'#e8eaed',10);
  ctx.fillStyle='#c2e7ff';rr(ctx,W*0.02,H*0.2,W*0.14,H*0.07,16);ctx.fill();bars(ctx,W*0.05,H*0.225,W*0.07,H*0.022,'#001d35');
  for(let r=0;r<5;r++)for(let c=0;c<7;c++){ctx.fillStyle=(r===2&&c===3)?'#1a73e8':'#9aa0a6';ctx.beginPath();ctx.arc(W*(0.03+c*0.019),H*(0.33+r*0.045),H*0.008,0,7);ctx.fill()}
  const x0=W*0.2,y0=H*0.2,cw=(W*0.78)/7,rh=(H*0.78)/9;ctx.strokeStyle='#e3e5e8';ctx.lineWidth=2;
  for(let c=0;c<7;c++){bars(ctx,x0+c*cw+cw*0.3,y0-H*0.075,cw*0.4,H*0.02,'#70757a');ctx.fillStyle=c===3?'#1a73e8':'#3c4043';ctx.beginPath();ctx.arc(x0+c*cw+cw*0.5,y0-H*0.025,H*0.022,0,7);ctx.fill()}
  for(let c=0;c<=7;c++){ctx.beginPath();ctx.moveTo(x0+c*cw,y0);ctx.lineTo(x0+c*cw,H);ctx.stroke()}for(let r=0;r<=9;r++){ctx.beginPath();ctx.moveTo(x0,y0+r*rh);ctx.lineTo(W,y0+r*rh);ctx.stroke()}
  const EV=[[0,1,2,'#7986cb'],[1,3,1,'#33b679'],[2,0,2,'#f6bf26'],[3,2,3,'#e67c73'],[4,5,2,'#7986cb'],[5,1,1,'#33b679'],[6,4,2,'#8e24aa'],[1,6,2,'#039be5'],[4,1,1,'#f4511e'],[2,6,1,'#33b679']];
  for(const[c,r,h,col]of EV){ctx.fillStyle=col;rr(ctx,x0+c*cw+4,y0+r*rh+4,cw-8,h*rh-8,8);ctx.fill();bars(ctx,x0+c*cw+12,y0+r*rh+12,cw*0.6,H*0.018,'rgba(255,255,255,.9)')}
  ctx.strokeStyle='#ea4335';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0+3*cw,y0+rh*4.4);ctx.lineTo(x0+4*cw,y0+rh*4.4);ctx.stroke();ctx.fillStyle='#ea4335';ctx.beginPath();ctx.arc(x0+3*cw,y0+rh*4.4,7,0,7);ctx.fill();
  endFrame(ctx)},
 contacts(ctx,W,H){winFrame(ctx,W,H,'#e9eef3',1);ctx.fillStyle='#f5f7fa';ctx.fillRect(0,H*0.062,W,H);
  // generic contacts board: columns of lead cards
  ctx.fillStyle='#2f6b5a';rr(ctx,W*0.025,H*0.085,H*0.075,H*0.075,8);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(W*0.025+H*0.0375,H*0.112,H*0.015,0,7);ctx.fill();ctx.fillRect(W*0.025+H*0.017,H*0.13,H*0.041,H*0.018);
  bars(ctx,W*0.09,H*0.105,W*0.14,H*0.032,'#3c4043');bars(ctx,W*0.3,H*0.095,W*0.4,H*0.05,'#e3e8ee',14);ctx.fillStyle='#2f6b5a';rr(ctx,W*0.84,H*0.09,W*0.13,H*0.055,10);ctx.fill();
  const cols=['#9aa0a6','#4a7ad8','#e2a400','#2f9d62'];const av=['#c26a4a','#4a7ac2','#7ab05a','#b0a05a','#8a5ab0','#5ab0a8','#b05a7a'];
  for(let c=0;c<4;c++){const x=W*(0.025+c*0.243),w=W*0.225;ctx.fillStyle='#e9edf2';rr(ctx,x,H*0.19,w,H*0.79,12);ctx.fill();ctx.fillStyle=cols[c];rr(ctx,x+10,H*0.21,w-20,H*0.012,4);ctx.fill();bars(ctx,x+14,H*0.24,w*0.45,H*0.026,'#3c4043');
   const n=[4,3,3,2][c];for(let i=0;i<n;i++){const y=H*(0.3+i*0.165);ctx.fillStyle='#ffffff';rr(ctx,x+10,y,w-20,H*0.145,10);ctx.fill();ctx.fillStyle=av[(c*3+i)%7];ctx.beginPath();ctx.arc(x+34,y+H*0.045,H*0.026,0,7);ctx.fill();
    bars(ctx,x+60,y+H*0.03,w*0.45,H*0.022,'#202124');bars(ctx,x+60,y+H*0.065,w*0.32,H*0.018,'#80868b');bars(ctx,x+20,y+H*0.105,w*0.3,H*0.018,cols[c]);bars(ctx,x+w*0.62,y+H*0.105,w*0.2,H*0.018,'#bdc1c6')}}
  endFrame(ctx)},
 store(ctx,W,H){winFrame(ctx,W,H,'#1a1a1a');ctx.fillStyle='#1a1a1a';ctx.fillRect(0,H*0.062,W,H*0.11);shopBag(ctx,W*0.045,H*0.115,H*0.07);
  ctx.fillStyle='#ffffff';ctx.font=`700 ${H*0.062}px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(COPY.shopBrand,W*0.08,H*0.118);bars(ctx,W*0.38,H*0.09,W*0.32,H*0.05,'#303030',10);
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
 if(k==='cal'){rr(ctx,cx-75,cy-55,150,115,10);ctx.moveTo(cx-75,cy-25);ctx.lineTo(cx+75,cy-25);ctx.moveTo(cx-40,cy-70);ctx.lineTo(cx-40,cy-45);ctx.moveTo(cx+40,cy-70);ctx.lineTo(cx+40,cy-45);for(let i=0;i<3;i++)for(let j=0;j<2;j++){ctx.moveTo(cx-45+i*45+6,cy+5+j*30);ctx.arc(cx-45+i*45,cy+5+j*30,6,0,7)}}
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
function facade(parts,dim=1,nScale=1,two=false){
 const fw=new Part(Math.round(18000*SCALE*nScale)+10,nScale<1);plane(fw,getCanvas('facade',1080,630,drawFacade,false),16000*nScale,{c:[0,0.75,-0.02],w:18,h:10.5,edge:0.6,zj:0.04,dim});parts.push(fw);
 // signboard
 const sg=new Part(Math.round(30000*SCALE*nScale)+10);const sc=getCanvas(two?'sign2':'sign',2000,400,(c,W,H)=>drawSign(c,W,H,false,two));const sb=getCanvas(two?'sign2B':'signB',2000,400,(c,W,H)=>drawSign(c,W,H,true,two));
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
function lane(parts,dim=1){const g=new Part(Math.round(9000*SCALE)+10,dim<1);const cv=getCanvas('lane',440,160,drawLane,false);
 plane(g,cv,8000,{c:[0,-4.52,4],R:[1,0,0],U:[0,0,-1],w:22,h:8,edge:0.3,dim});parts.push(g)}

// ---- warehouse ----
function carton(p,n,c,s,dim){const kraft=mix(C('#cf9f68'),C('#ad8050'),Math.random()),af=c[0]<0?'px':'nx',lab=Math.random(),stn=Math.floor(Math.random()*3);
 box(p,n*1.25,{c,s,dim,faces:[af,'pz','py'],color:(f,u,v)=>{let k=J(kraft,0.035);const sh=f===af?1:f==='pz'?0.78:0.66;
  const e=Math.min(u,1-u,v,1-v);if(e<0.035)k=mix(k,[60,40,22],0.6);           // carton edges
  if(f==='py'&&Math.abs(u-0.5)<0.06)k=mix(k,[214,182,128],0.75);              // tape on top
  if(f!=='py'&&Math.abs(u-0.5)<0.05&&v>0.82)k=mix(k,[214,182,128],0.75);      // tape over the lip
  if(f===af||f==='pz'){// shipping label: white sticker, black header bar, barcode
   const LW=f===af?0.46:0.3,LH=0.42,lx=0.08+lab*0.08,ly=0.18;if(u>lx&&u<lx+LW&&v>ly&&v<ly+LH){k=[242,238,228];const lu=(u-lx)/LW,lv=(v-ly)/LH;
    if(lv>0.72&&lv<0.9&&lu>0.08&&lu<0.92)k=[34,32,30];
    else if(lv>0.12&&lv<0.42&&lu>0.08&&lu<0.92&&Math.sin(lu*140+lab*9)>0.15)k=[28,28,28];
    else if(lv>0.5&&lv<0.62&&lu>0.08&&lu<0.6)k=[90,88,84]}
   // stencil marks on the right: up arrows or a fragile glass
   if(u>0.66&&u<0.88&&v>0.55&&v<0.85){const mu=(u-0.66)/0.22,mv=(v-0.55)/0.3;
    if(stn===0&&((Math.abs(mu-0.3)<0.06&&mv<0.7)||(Math.abs(mu-0.75)<0.06&&mv<0.7)||(mv>0.62&&Math.abs(mu-0.3)<(1-mv)*0.5+0.02&&mv<0.95)||(mv>0.62&&Math.abs(mu-0.75)<(1-mv)*0.5+0.02&&mv<0.95)))k=[40,28,18];
    if(stn===1&&((mv>0.45&&Math.hypot((mu-0.5)*1.4,(mv-0.72)*1.6)<0.28)||(Math.abs(mu-0.5)<0.05&&mv>0.12&&mv<0.5)||(mv<0.14&&Math.abs(mu-0.5)<0.22)))k=[40,28,18]}}
  return[k[0]*sh,k[1]*sh,k[2]*sh]}})}
function bolt(p,n,c,len,r,col,dim){cyl(p,n,{c,r,len,axis:'x',dim,color:(f,u,v)=>{const b=hex(col);if(f!=='side'){const ring=Math.sin(u*60)*0.12+0.9;return[b[0]*ring,b[1]*ring,b[2]*ring]}return J(b,0.05)}})}
function sack(p,n,c,dim){sphere(p,n,{c,r:0.42,squash:[0.75,0.55,0.62],dim,color:()=>J(C('#b9a074'),0.1)})}
const TEX=['#2b3a6b','#7a1f2b','#c9932b','#e8dcc4','#2f6b5a','#8a4f8c','#b24a2a'];
function binders(p,n,c,w,dim,R){let z=c[2]-w/2;const cols=['#2b3442','#3d4b5c','#1f2328','#5a4a3a','#36505a','#2b3442'];while(z<c[2]+w/2-0.08){const t=0.08+R()*0.04,h=0.36+R()*0.08,col=C(cols[Math.floor(R()*cols.length)]);
 box(p,Math.round(n*t/0.1),{c:[c[0],c[1]+h/2,z+t/2],s:[0.42,h,t*0.92],dim,faces:['px','nx','py'],color:(f,u,v)=>(f!=='py'&&v>0.62&&v<0.8&&u>0.25&&u<0.75)?[226,218,200]:(f!=='py'&&v<0.2&&Math.abs(u-0.5)<0.12)?[30,30,30]:J(col,0.05)});z+=t}}
function racks(parts,{dim=1,nScale=1,seed=7,neutral=false}={}){const p=new Part(Math.round(62000*SCALE*nScale)+50,dim<0.9);let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
 const nS=nScale*0.24;const levels=[-4.45,-2.75,-1.05,0.65];
 for(const side of[-1,1]){const xf=side*4.3,xb=side*6.1,xc=side*5.2;
  for(let b=0;b<=5;b++){const z=-1.4-b*2.35;for(const x of[xf,xb])box(p,520*nS,{c:[x,-1.4,z],s:[0.09,6.4,0.09],dim,color:(f,u,v)=>{const k=C('#2c4f8f');return(Math.floor(v*40)%3===0)?mix(k,[20,30,50],0.5):k}});}
  for(let b=0;b<5;b++){const zc=-1.4-(b+0.5)*2.35;
   for(const ly of levels.concat([2.35])){for(const x of[xf,xb])box(p,380*nS,{c:[x,ly-0.06,zc],s:[0.08,0.14,2.3],dim,color:()=>J(C('#d4702a'),0.05)})}
   for(let li=0;li<4;li++){const ly=levels[li];const kind=(b+li*2+(side>0?1:0))%4;let zz=zc-1.05;
    while(zz<zc+0.95){if(neutral&&kind===1){binders(p,240*nS,[xc,ly+0.02,zz+0.45],0.9,dim,R);zz+=0.95}
     else if(neutral&&kind===3){const w=0.7;carton(p,Math.round(900*nS*w*0.5/0.25),[xc,ly+0.27,zz+w/2],[1.3,0.5,w*0.96],dim);zz+=w}
     else if(kind===1){const r=0.17;for(let row=0;row<3;row++){if(zz+r*2>zc+1.05)break;for(let st=0;st<4-row%2;st++)bolt(p,260*nS,[xc,ly+0.02+r+st*r*1.95+(row%2)*0.0,zz+r],1.7,r,TEX[Math.floor(R()*TEX.length)],dim);zz+=r*2.05}}
     else if(kind===3){sack(p,700*nS,[xc,ly+0.3,zz+0.42],dim);sack(p,600*nS,[xc,ly+0.8,zz+0.45],dim);zz+=0.9}
     else{const w=0.5+R()*0.35,h=0.45+R()*0.45;carton(p,Math.round(900*nS*w*h/0.25),[xc+(R()-0.5)*0.15,ly+0.02+h/2,zz+w/2],[1.4,h,w*0.96],dim);if(h<0.7&&R()<0.7){const h2=0.35+R()*0.3;carton(p,Math.round(700*nS*w*h2/0.25),[xc,ly+0.04+h+h2/2,zz+w/2],[1.3,h2,w*0.9],dim)}zz+=w}}}
  }}
 parts.push(p);return p}
function shell(parts,{dim=1,nScale=1}={}){const p=new Part(Math.round(22000*SCALE*nScale)+20,dim<0.9);
 plane(p,getCanvas('floor',600,700,drawFloor,false),9000*nScale,{c:[0,-4.5,-7.2],R:[1,0,0],U:[0,0,-1],w:13,h:14.4,edge:0.4,dim});
 plane(p,getCanvas('corr',700,360,drawCorrugated,false),6000*nScale,{c:[0,0.4,-14.3],w:13,h:9.8,edge:0.3,dim});
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
// K: state index by name. film.js refers to states only as K.name, so a state can be inserted, removed or reordered here without renumbering anything.
// The array order only sets the build fallback ("nearest built state") while loading; keep it in film order.
export const K={};
function defState(name,build){if(name in K)throw new Error('duplicate state '+name);K[name]=STATES.length;STATES.push(build)}
function fillDust(min,max,col){return(f,n)=>dust(f,n/SCALE,{min,max,color:col})}

// K0: dust in the lane under the (unlit) bulb
defState('dust',()=>{const parts=[];const d=new Part(Math.round(131072*SCALE)+10);
 const n=Math.round(131072*SCALE);for(let i=0;i<n;i++){const t=Math.random();let x,y,z;if(t<0.55){const h=Math.random();y=5.6-h*10;const r=Math.sqrt(Math.random())*(0.3+h*4.2);const a=Math.random()*7;x=Math.cos(a)*r;z=1.1+Math.sin(a)*r*0.6}else{x=(Math.random()-0.5)*24;y=-4.5+Math.random()*11;z=-1+Math.random()*7}
  const j=0.6+Math.random()*0.5;d.push(x,y,z,170*j,150*j,120*j,1,Math.random(),0)}
 parts.push(d);return{parts,fill:fillDust([-12,-5,-1],[12,6,6],[160,140,110])}});
// K1: godown front at night, shutter down, padlock, bulb
defState('front',()=>{const parts=[];const sh=shutter(parts);sh.at=0;facade(parts);bulbOut(parts);padlock(parts);lane(parts);
 return{parts,fill:fillDust([-6,-4.5,0.3],[6,6,5],[170,150,118])}});
// K2: the craft table. The shutter metal reassembles into five working objects, each with its stack tag.
export const CRAFT=[{k:'cloud',x:-3.15,z:-4.85,tag:'Docker'},{k:'web',x:-1.58,z:-5.3,tag:'Next.js'},{k:'agents',x:0,z:-5.5,tag:'Python'},{k:'memory',x:1.58,z:-5.3,tag:'PostgreSQL'},{k:'auto',x:3.15,z:-4.85,tag:'FastAPI'}];
const CRAFT_CAMZ=3.0;let CRAFT_K=1;
for(const o of CRAFT)o.a=Math.atan2(-o.x,CRAFT_CAMZ-o.z)*0.85;
function craftMobile(){const M={cloud:[-0.95,-4.15],web:[0.0,-6.55],agents:[0,-5.35],memory:[0.95,-4.15],auto:[0,-3.05]};
 // mobile: a tight diamond so five objects fit a narrow screen
 const P={cloud:[-0.98,-5.0],web:[0.98,-5.0],agents:[0,-5.95],memory:[-0.98,-3.75],auto:[0.98,-3.75]};for(const o of CRAFT){o.x=P[o.k][0];o.z=P[o.k][1];o.a=Math.atan2(-o.x,6-o.z)*0.6}CRAFT_K=0.82}
// local -> world for one craft object (lx right, ly up from table, lz toward camera), scaled by CRAFT_K
function cw(o,lx,ly,lz){const k=CRAFT_K,q=rotY([lx*k,0,lz*k],o.a);return[o.x+q[0],TABLE.top+ly*k,o.z+q[2]]}
const CRAFT_TABLE={c:[0,TABLE.top-0.05,-5.1],s:[8.9,0.1,2.9]};
function drawBrowser(ctx,W,H){ctx.fillStyle='#16191e';rr(ctx,0,0,W,H,22);ctx.fill();ctx.save();rr(ctx,6,6,W-12,H-12,18);ctx.clip();
 ctx.fillStyle='#262a31';ctx.fillRect(0,0,W,78);for(const[i,c]of[['#ff5f57'],['#febc2e'],['#28c840']].entries()){ctx.fillStyle=c[0];ctx.beginPath();ctx.arc(34+i*28,30,9,0,7);ctx.fill()}
 ctx.fillStyle='#343944';rr(ctx,130,12,220,40,10);ctx.fill();bars(ctx,150,26,150,12,'#c9cfd8');bars(ctx,370,24,110,12,'#5d6470');
 ctx.fillStyle='#1b1e24';rr(ctx,30,52,W-60,22,11);ctx.fill();ctx.fillStyle='#7fd3a0';ctx.fillRect(46,58,10,10);bars(ctx,66,58,280,10,'#8a93a0');
 ctx.fillStyle='#f3f5f8';ctx.fillRect(0,78,W,H);ctx.fillStyle='#1d2633';ctx.fillRect(0,78,W*0.17,H);
 ctx.fillStyle='#e8c27a';rr(ctx,22,100,40,40,10);ctx.fill();bars(ctx,72,112,90,16,'#e6e9ee');
 for(let i=0;i<7;i++){const y=172+i*58;if(i===1){ctx.fillStyle='#2c3a4f';rr(ctx,10,y-12,W*0.17-20,44,10);ctx.fill()}ctx.fillStyle=i===1?'#e8c27a':'#6c7a8e';rr(ctx,26,y,20,20,5);ctx.fill();bars(ctx,58,y+4,70+(i*23)%40,12,i===1?'#f3f5f8':'#8d9ab0')}
 const x0=W*0.17+28,ww=W-x0-28;bars(ctx,x0,104,220,26,'#1b2433');ctx.fillStyle='#a83a1c';rr(ctx,W-190,98,162,40,20);ctx.fill();bars(ctx,W-160,112,100,12,'#fff');
 const kw=(ww-40)/3;for(let i=0;i<3;i++){const x=x0+i*(kw+20);ctx.fillStyle='#ffffff';rr(ctx,x,160,kw,110,14);ctx.fill();bars(ctx,x+18,180,kw*0.4,12,'#8a94a6');bars(ctx,x+18,206,kw*0.55,26,'#1b2433');
  ctx.strokeStyle=['#2f9d62','#3d7fd6','#a83a1c'][i];ctx.lineWidth=4;ctx.beginPath();for(let s=0;s<=20;s++){const xx=x+kw*0.62+s*kw*0.3/20,yy=240-s*1.6-Math.sin(s*0.9+i)*8;s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke()}
 ctx.fillStyle='#ffffff';rr(ctx,x0,290,ww*0.62,H-318,14);ctx.fill();bars(ctx,x0+20,308,160,14,'#1b2433');
 {const cx0=x0+20,cy1=H-50,cw2=ww*0.62-40,ch=H-390;ctx.strokeStyle='#e6e9ee';ctx.lineWidth=2;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(cx0,cy1-k*ch/3);ctx.lineTo(cx0+cw2,cy1-k*ch/3);ctx.stroke()}
  ctx.beginPath();for(let s=0;s<=40;s++){const xx=cx0+s*cw2/40,yy=cy1-ch*(0.2+0.6*s/40)-Math.sin(s*0.5)*ch*0.1;s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.strokeStyle='#3d7fd6';ctx.lineWidth=6;ctx.stroke();ctx.lineTo(cx0+cw2,cy1);ctx.lineTo(cx0,cy1);ctx.closePath();ctx.fillStyle='rgba(61,127,214,.14)';ctx.fill()}
 {const x=x0+ww*0.62+20,w=ww*0.38-20;ctx.fillStyle='#ffffff';rr(ctx,x,290,w,H-318,14);ctx.fill();for(let i=0;i<6;i++){const y=316+i*48;ctx.fillStyle=['#c26a4a','#4a7ac2','#7ab05a','#b0a05a','#8a5ab0','#5ab0a8'][i];ctx.beginPath();ctx.arc(x+28,y+12,12,0,7);ctx.fill();bars(ctx,x+50,y+6,w*0.4,12,'#3c4043');ctx.fillStyle=i%3===1?'#feefc3':'#cdfee1';rr(ctx,x+w-80,y+2,60,20,10);ctx.fill()}}
 ctx.restore()}
function tagCanvas(word){return getCanvas('tag-'+word,640,150,(ctx,W,H)=>{ctx.fillStyle='#2a221c';rr(ctx,4,4,W-8,H-8,18);ctx.fill();ctx.strokeStyle='rgba(246,214,160,.95)';ctx.lineWidth=4;rr(ctx,12,12,W-24,H-24,12);ctx.stroke();
 ctx.fillStyle='#d0502e';ctx.beginPath();ctx.arc(52,H/2,13,0,7);ctx.fill();
 ctx.fillStyle='#fbe9c4';let px=88;ctx.font=`700 ${px}px "Helvetica Neue",Helvetica,Arial,sans-serif`;const w=ctx.measureText(word).width;if(w>W-120){px*=(W-120)/w;ctx.font=`700 ${px}px "Helvetica Neue",Helvetica,Arial,sans-serif`}
 ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(word,86,H/2+3)})}
export const TAG_WH=[0.98,0.23];
export function tagPose(o){const k=CRAFT_K;const c=cw(o,0,0.0,0.6);c[1]=TABLE.top+0.13*k;const R=rotY([1,0,0],o.a),U=rotY([0,0.94,0.34],o.a);return{c,R,U,w:TAG_WH[0]*k,h:TAG_WH[1]*k}}
export function browserPose(){const o=CRAFT.find(q=>q.k==='web');const k=CRAFT_K;return{c:cw(o,0,0.82,0.03),R:rotY([1,0,0],o.a),U:[0,1,0],w:1.36*k,h:0.89*k}}
function craftObject(p,o){const k=CRAFT_K,R=rotY([1,0,0],o.a);const P=(lx,ly,lz)=>cw(o,lx,ly,lz);
 if(o.k==='cloud'){
  // small server rack, LEDs blink (group 12)
  box(p,1500,{c:P(0,0.33,0),s:[0.52*k,0.66*k,0.42*k],ry:o.a,color:(f)=>J(C(f==='py'?'#3a4046':'#262b31'),0.05),em:0.15});
  plane(p,rackFront(4),1300,{c:P(0,0.33,0.212),R,U:[0,1,0],w:0.48*k,h:0.62*k,em:0.35});
  for(let i=0;i<9;i++){const q=P(-0.17+(i%3)*0.02,0.12+i*0.06,0.22);const col=i%4===0?[255,176,60]:[70,240,130];for(let j=0;j<Math.round(14*SCALE)+1;j++)p.push(q[0]+(Math.random()-0.5)*0.012,q[1]+(Math.random()-0.5)*0.012,q[2],col[0],col[1],col[2],12,0,1)}
  // up chevrons from the rack into the cloud
  for(let i=0;i<3;i++){const y=0.74+i*0.075;tube(p,180,{pts:[P(-0.1,y,0.05),P(0,y+0.05,0.05),P(0.1,y,0.05)],rad:0.009*k,color:C('#ffd38a'),em:1})}
  // the cloud: soft lobes, flat underside
  const L=[[-0.36,1.1,0,0.25],[0,1.24,0,0.33],[0.34,1.12,0,0.26],[-0.17,1.02,0.1,0.23],[0.17,1.02,0.1,0.23],[0.05,1.16,0.14,0.22]];
  for(const[x,y,z,r]of L){const c=P(x,y,z);sphere(p,900,{c,r:r*k,squash:[1,0.82,0.75],em:0.55,color:(nx,ny,nz)=>{const t=0.5+0.5*ny;return mix([120,140,170],[236,240,246],t)}})}
 }
 if(o.k==='web'){
  const sc=P(0,0.82,0.03);plane(p,getCanvas('browser',1040,680,drawBrowser),5200,{c:sc,R,U:[0,1,0],w:1.36*k,h:0.89*k,edge:1.2,em:0.8});
  box(p,700,{c:P(0,0.82,-0.0),s:[1.4*k,0.93*k,0.04*k],ry:o.a,faces:['px','nx','py','nz'],color:()=>J(C('#1a1d22'),0.04),em:0.1});
  box(p,300,{c:P(0,0.2,-0.02),s:[0.08*k,0.34*k,0.05*k],ry:o.a,color:()=>J(C('#3a3f46'),0.04)});
  box(p,450,{c:P(0,0.02,0.02),s:[0.56*k,0.035*k,0.28*k],ry:o.a,color:()=>J(C('#3a3f46'),0.04)});
 }
 if(o.k==='agents'){
  const S=1.1;const caps=[[-0.4,0.27,0.04,'chat'],[0.4,0.27,0.04,'cal'],[0,0.75,-0.02,'box']];
  const hub=P(0,0.45,0.0);sphere(p,260,{c:hub,r:0.06*k,em:1,color:()=>C('#ffd38a')});
  for(const[x,y,z,ic]of caps){const c=P(x,y,z);tube(p,220,{pts:[c,hub],rad:0.012*k,color:C('#d0502e'),em:0.9});capsuleK(p,c,ic,0,S*k)}
  // little base plate
  cyl(p,500,{c:P(0,0.01,0),r:0.62*k,len:0.02,axis:'y',em:0.1,color:(f,u)=>f==='side'?C('#2a2420'):J(C('#3a3029'),0.05)});
 }
 if(o.k==='memory'){
  const r=0.4*k,h=1.05*k,c=P(0,0.56,0);
  cyl(p,1500,{c,r,len:h,axis:'y',caps:false,em:0.3,color:(f,u)=>{const fl=0.5+0.5*Math.max(0,Math.cos(u*Math.PI*2*10));return[90+50*fl,120+50*fl,150+60*fl]}});
  for(const yy of[0.04,0.39,0.74,1.08]){const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push([c[0]+Math.cos(a)*r,TABLE.top+yy*k,c[2]+Math.sin(a)*r])}tube(p,420,{pts,rad:0.008*k,color:[205,228,248],em:0.95})}
  {const n=Math.round(500*SCALE);for(let i=0;i<n;i++){const a=Math.random()*7,rr2=Math.sqrt(Math.random())*r;p.push(c[0]+Math.cos(a)*rr2,TABLE.top+1.08*k,c[2]+Math.sin(a)*rr2,120,160,200,0,0,0.5)}}
  // rows inside, filling as bars (group 14)
  const Rv=R;for(let row=0;row<9;row++){const y=TABLE.top+(0.14+row*0.1)*k;for(const[a0,a1]of[[-0.27,-0.1],[-0.06,0.1],[0.14,0.27]]){const w=(a1-a0)*(0.6+0.4*(((row*7+a0*30)|0)%4)/3);const m=Math.round(70*SCALE);
   for(let i=0;i<m;i++){const u=Math.random();const lx=(a0+u*w)*k;const q=[c[0]+Rv[0]*lx,y+(Math.random()-0.5)*0.03*k,c[2]+Rv[2]*lx+0.02];p.push(q[0],q[1],q[2],236,201,147,14,Math.min(0.999,(row+(a0+0.27)/0.6)/9),0.95)}}}
  cyl(p,400,{c:P(0,0.0,0),r:r*1.12,len:0.02,axis:'y',em:0.1,color:()=>J(C('#2a2f36'),0.05)});
 }
 if(o.k==='auto'){
  const pa=P(-0.64,0.3,0),pb=P(0.64,0.3,0);tube(p,1100,{pts:[pa,pb],rad:0.045*k,color:C('#7b8792'),em:0.3});
  for(const x of[-0.5,0.5])box(p,160,{c:P(x,0.14,0),s:[0.05*k,0.28*k,0.1*k],ry:o.a,color:()=>C('#3a4148')});
  // packets on the bus (flow group 24)
  tube(p,500,{pts:[P(-0.64,0.3,0.03),P(0.64,0.3,0.03)],rad:0.05*k,color:C('#ffe2ad'),group:24,em:1});
  // API node blocks
  for(const x of[-0.42,0.02]){box(p,800,{c:P(x,0.66,0),s:[0.3*k,0.24*k,0.24*k],ry:o.a,color:(f,u,v)=>f==='pz'&&v>0.7&&v<0.82&&u>0.15&&u<0.85?C('#e8c27a'):f==='pz'&&v<0.3&&u>0.7&&u<0.85?C('#111417'):J(C('#2b3036'),0.05),em:0.25});
   tube(p,120,{pts:[P(x,0.54,0),P(x,0.33,0)],rad:0.015*k,color:C('#d0502e'),em:0.9});
   const q=P(x-0.09,0.6,0.125);for(let j=0;j<Math.round(30*SCALE)+1;j++)p.push(q[0]+(Math.random()-0.5)*0.015,q[1]+(Math.random()-0.5)*0.015,q[2],70,240,130,12,0,1)}
  // valve wheel on the bus
  {const vc=P(0.42,0.62,0.02),rv=0.14*k;tube(p,140,{pts:[P(0.42,0.33,0.02),vc],rad:0.014*k,color:C('#8d969e'),em:0.3});
   const pts=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;pts.push([vc[0]+R[0]*Math.cos(a)*rv,vc[1]+Math.sin(a)*rv,vc[2]+R[2]*Math.cos(a)*rv])}tube(p,450,{pts,rad:0.016*k,color:C('#d0502e'),em:0.9});
   for(let i=0;i<4;i++){const a=i*Math.PI/4;tube(p,60,{pts:[[vc[0]-R[0]*Math.cos(a)*rv,vc[1]-Math.sin(a)*rv,vc[2]-R[2]*Math.cos(a)*rv],[vc[0]+R[0]*Math.cos(a)*rv,vc[1]+Math.sin(a)*rv,vc[2]+R[2]*Math.cos(a)*rv]],rad:0.008*k,color:C('#c0c6cc'),em:0.4})}}
 }
}
function capsuleK(p,c,icon,group,k){const L=0.46*k,r=0.13*k,col=()=>J(C('#ece4d2'),0.04);
 cyl(p,1300,{c,r,len:L,axis:'x',caps:false,group,em:0.55,color:col});for(const s of[-1,1])sphere(p,380,{c:[c[0]+s*L/2,c[1],c[2]],r,group,em:0.55,color:col});
 plane(p,capIcon(icon),600,{c:[c[0],c[1],c[2]+r+0.006],w:0.3*k,h:0.2*k,em:1,group})}
defState('craft',()=>{const parts=[];
 const ob=new Part(Math.round(52000*SCALE)+200);for(const o of CRAFT)craftObject(ob,o);ob.at=0;parts.push(ob);
 // stack tags in front of each object, and faint pipe stubs reaching toward the centre
 const tg=new Part(Math.round(6000*SCALE)+50);for(const o of CRAFT){const t=tagPose(o);plane(tg,tagCanvas(o.tag),700,{c:t.c,R:t.R,U:t.U,w:t.w,h:t.h,edge:1.4,em:0.9});
  const a=cw(o,0,0.02,0.2),hub=[0,TABLE.top+0.02,-4.05];tube(tg,260,{pts:[a,[a[0]+(hub[0]-a[0])*0.62,a[1],a[2]+(hub[2]-a[2])*0.62]],rad:0.008,color:C('#d0502e'),em:0.75})}parts.push(tg);
 const tb=new Part(Math.round(12000*SCALE)+20,true);const T2=CRAFT_TABLE;box(tb,9000,{c:T2.c,s:T2.s,faces:['py','pz'],color:(f,u,v)=>{const g=Math.sin(u*120+fbm(u*10,v*3)*9)*0.5+0.5;return f==='py'?mix(C('#3a2a1e'),C('#24190f'),g*0.7):J(C('#1e150d'),0.05)}});
 for(const x of[-4.2,4.2])box(tb,500,{c:[x,TABLE.top-1.0,-3.9],s:[0.12,1.9,0.12],color:()=>C('#1a120b')});parts.push(tb);
 facade(parts,0.8,0.4);bulbOut(parts);lane(parts,0.6);shell(parts,{dim:0.55,nScale:0.7});bulbIn(parts);
 return{parts,fill:fillDust([-5,-4.4,-12],[5,4,0],[140,125,100])}});
// K4: tool windows peel off the phone and float, unread dots blinking
export const WINPOS=[{k:'contacts',c:[-4.35,1.75,-5.6],ry:0.5,rx:0.06},{k:'cal',c:[-2.75,0.55,-3.3],ry:0.38,rx:0.04},{k:'pay',c:[2.75,0.6,-3.1],ry:-0.38,rx:0.04},{k:'sheet',c:[-2.45,-1.75,-2.3],ry:0.3,rx:-0.12},{k:'inbox',c:[2.5,-1.7,-2.45],ry:-0.3,rx:-0.1},{k:'chat',c:[0.05,1.45,-4.6],ry:0.02,rx:0.06}];
export const WIN_WH=[2.05,1.35];
export const PHONE4={c:[0,-0.85,-1.6],s:1};
// mobile (390 wide): four windows in an overlapping column, chat stays in the phone
export function mobileLayout(){craftMobile();const M={cal:[[-0.28,2.12,-3.25],0.14,0.03],pay:[[0.3,0.74,-2.95],-0.14,0.02],sheet:[[-0.3,-0.62,-2.65],0.12,-0.03],inbox:[[0.28,-1.98,-2.95],-0.12,-0.05]};
 for(const W of WINPOS){const m=M[W.k];if(!m){W.hide=1;continue}W.c=m[0];W.ry=m[1];W.rx=m[2]}PHONE4.c=[0.66,-2.78,-1.3];PHONE4.s=0.6}
function deskProps(parts,dim=1){const p=new Part(Math.round(4000*SCALE)+20);const T=TABLE.top;
 carton(p,1500,[-1.85,T+0.22,-5.6],[0.75,0.44,0.5],dim);
 box(p,900,{c:[-0.9,T+0.02,-4.85],s:[0.62,0.04,0.82],ry:0.18,dim,color:(f,u,v)=>f==='py'?(u<0.08?C('#2b3442'):(Math.floor(v*22)%2?J(C('#e9e2cf'),0.03):C('#cfc6b0'))):C('#2b3442')});
 parts.push(p)}
const winBasis=W=>[rotY(rotX([1,0,0],W.rx),W.ry),rotY(rotX([0,1,0],W.rx),W.ry)];
defState('windows',()=>{const parts=[];const wp=new Part(Math.round(42000*SCALE)+50);
 for(const W of WINPOS){if(W.hide)continue;const[R,U]=winBasis(W);plane(wp,winCanvas(W.k),7000,{c:W.c,R,U,w:WIN_WH[0],h:WIN_WH[1],edge:1.8,em:0.8});
  // unread badge
  const bc=[W.c[0]+R[0]*0.98+U[0]*0.64,W.c[1]+R[1]*0.98+U[1]*0.64,W.c[2]+R[2]*0.98+U[2]*0.64+0.03];sphere(wp,500,{c:bc,r:0.07,color:()=>C(W.k==='sheet'?'#e0533a':'#f2523f'),em:1,group:4})}
 wp.at=0;parts.push(wp);
 const ph=new Part(Math.round(14000*SCALE)+20);const pc=PHONE4.c,k=PHONE4.s;box(ph,2500,{c:[pc[0],pc[1],pc[2]-0.03],s:[0.66*k,1.36*k,0.05],color:(f)=>f==='pz'?C('#121315'):C('#2a2c30')});
 plane(ph,getCanvas('chat',430,890,drawChat),7000,{c:[pc[0],pc[1],pc[2]+0.001],w:0.62*k,h:1.3*k,em:0.85});
 CHAT_BUBBLES.forEach((b,i)=>plane(ph,getCanvas('bub'+i,430,890,(ctx,W,H)=>drawBubble(ctx,W,H,b)),900*(b.h/0.08),{c:[pc[0],pc[1],pc[2]+0.006],w:0.62*k,h:1.3*k,em:0.9}));ph.at=80000;parts.push(ph);
 racks(parts,{dim:0.22,nScale:0.55,neutral:true});shell(parts,{dim:0.2,nScale:0.5});table(parts,{dim:0.28,nScale:0.6});bulbIn(parts,{dim:0.6});deskProps(parts,0.35);
 return{parts,fill:fillDust([-6,-4,-8],[6,3,1],[90,100,120])}});
// K5: night shift; windows fallen flat on the packing table, ledger open, red copy strokes, clock, chair, tea
export const LEDGER5={c:[0.05,TABLE.top+0.05,-4.95],spine:0.05};
export const CLOCK5={c:[0,0.15,-7.48],r:0.62};
export const CHAIR5={c:[1.95,-3.5,-3.85],ry:-0.5};
export const TEA5=[0.92,TABLE.top,-4.55];
const PILE=[];{let s=11;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};const ks=['cal','pay','sheet','inbox','chat','sheet','contacts','cal'];
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
defState('night',()=>{const parts=[];
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
 racks(parts,{dim:0.26,nScale:0.6,neutral:true});shell(parts,{dim:0.3,nScale:0.6});table(parts,{dim:0.75,nScale:0.8});bulbIn(parts,{dim:1});
 const pr=new Part(Math.round(2500*SCALE)+10);box(pr,1500,{c:[1.6+0.75,TABLE.top+0.14,-4.75],s:[0.5,0.26,0.44],color:()=>J(C('#2b2c30'),0.04),dim:0.8});parts.push(pr);
 return{parts,fill:fillDust([-4,-4.4,-9],[4,2,-1],[120,100,90])}});
// K6: strokes straightened into ruled lines; windows flattened into labelled boxes; first blueprint grid
export const BOXES6=[{k:'chat',x:-1.75,z:-4.6},{k:'cal',x:-0.6,z:-4.6},{k:'pay',x:0.55,z:-4.6},{k:'sheet',x:1.7,z:-4.6},{k:'mail',x:-1.15,z:-5.85},{k:'books',x:1.1,z:-5.85}];
defState('lines',()=>{const parts=[];const T=TABLE.top+0.02;
 const bx=new Part(Math.round(50000*SCALE)+50);BOXES6.forEach(b=>plane(bx,iconCanvas(b.k),7600,{c:[b.x,T,b.z],R:[1,0,0],U:[0,0,-1],w:0.95,h:0.72,edge:1.4,em:0.75,tint:[0.85,0.95,1.05]}));bx.at=0;parts.push(bx);
 // ruled lines: manhattan routes between boxes, plus bus line through the middle
 const S=new Part(Math.round(17000*SCALE)+20);const zBus=-5.22;const routes=[];
 BOXES6.forEach((b,i)=>{const z0=b.z+(b.z>-5?-0.36:0.36);routes.push([[b.x,T,z0],[b.x,T,zBus]])});
 routes.push([[-2.3,T,zBus],[2.3,T,zBus]]);routes.push([[-2.3,T,zBus-0.05],[2.3,T,zBus-0.05]]);
 for(let i=0;i<12;i++){const r=routes[i%routes.length];tube(S,1350,{pts:r,rad:0.008,color:C('#d0502e'),group:11,r0:0,r1:1,em:0.9})}
 S.at=80000;parts.push(S);
 const g=new Part(Math.round(30000*SCALE)+20);const n=Math.round(26000*SCALE);for(let i=0;i<n;i++){const gx=Math.round((Math.random()-0.5)*44)/4,gz=-5.2+Math.round((Math.random()-0.5)*28)/4;const along=Math.random()<0.5;const x=along?gx+(Math.random()-0.5)*0.25:gx,z=along?gz:gz+(Math.random()-0.5)*0.25;g.push(x,TABLE.top-0.01,z,40,70,118,0,0,0.5)}parts.push(g);
 racks(parts,{dim:0.12,nScale:0.45,neutral:true});table(parts,{dim:0.25,nScale:0.5});shell(parts,{dim:0.12,nScale:0.4});
 return{parts,fill:fillDust([-5,-4.4,-9],[5,2,-1],[50,70,110])}});

/* ================= PHASE 2: scenes 5 to 9 ================= */
const Y0=TABLE.top;
// ---- scene 5: the blueprint ----
const BP={x0:-3.7,x1:3.7,z0:-7.3,z1:-2.9},ZB=-5.22;
export const BOXES7=[{k:'chat',x:-2.5,z:-4.15},{k:'cal',x:-0.85,z:-4.15},{k:'pay',x:0.85,z:-4.15},{k:'sheet',x:2.5,z:-4.15},{k:'mail',x:-2.5,z:-6.3},{k:'books',x:2.5,z:-6.3}];
function drawBlueprint(ctx,W,H){const X=x=>(x-BP.x0)/(BP.x1-BP.x0)*W,Z=z=>(z-BP.z0)/(BP.z1-BP.z0)*H,S=W/(BP.x1-BP.x0);
 ctx.strokeStyle=ctx.fillStyle='#dce8f5';ctx.lineJoin='round';ctx.lineCap='round';
 const L=(pts,w=4)=>{ctx.lineWidth=w;ctx.beginPath();pts.forEach(([x,z],i)=>i?ctx.lineTo(X(x),Z(z)):ctx.moveTo(X(x),Z(z)));ctx.stroke()};
 const R=(x0,z0,x1,z1,w=4)=>L([[x0,z0],[x1,z0],[x1,z1],[x0,z1],[x0,z0]],w);
 R(-3.6,-7.2,3.6,-3.0,6);R(-3.52,-7.12,3.52,-3.08,2);
 ctx.setLineDash([16,12]);for(const b of BOXES7){const near=b.z>ZB;L([[b.x,b.z+(near?-0.37:0.37)],[b.x,ZB+(near?0.08:-0.08)]],4)}ctx.setLineDash([]);
 // gateway: block at the head of the bus with three inlet arrows
 R(-3.42,ZB-0.4,-3.04,ZB+0.4,5);for(const dz of[-0.22,0,0.22]){L([[-3.36,ZB+dz],[-3.12,ZB+dz]],3);L([[-3.19,ZB+dz-0.05],[-3.12,ZB+dz],[-3.19,ZB+dz+0.05]],3)}
 // queue chevrons on the bus
 for(let i=0;i<4;i++){const x=-1.98+i*0.18;L([[x,ZB-0.17],[x+0.12,ZB],[x,ZB+0.17]],5)}
 // database cylinder on the bus
 {const cx=X(1.7),cz=Z(ZB),rw=0.3*S,rh=0.09*S,hh=0.3*S;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(cx,cz-hh,rw,rh,0,0,7);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-rw,cz-hh);ctx.lineTo(cx-rw,cz+hh);ctx.ellipse(cx,cz+hh,rw,rh,0,Math.PI,0,true);ctx.lineTo(cx+rw,cz-hh);ctx.stroke();
  for(const k of[-0.33,0.33]){ctx.beginPath();ctx.ellipse(cx,cz+k*hh,rw,rh,0,0,Math.PI);ctx.stroke()}}
 // agent branch: valve, manifold, four agent nodes
 L([[0,ZB-0.06],[0,-5.95]],5);L([[-1.2,-5.95],[1.2,-5.95]],4);
 for(let i=0;i<4;i++){const x=-1.2+i*0.8;L([[x,-5.95],[x,-6.19]],4);ctx.lineWidth=5;ctx.beginPath();ctx.arc(X(x),Z(-6.38),0.19*S,0,7);ctx.stroke();ctx.beginPath();ctx.arc(X(x),Z(-6.38),0.065*S,0,7);ctx.fill()}
 {const z=-5.58;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(X(-0.13),Z(z-0.17));ctx.lineTo(X(0.13),Z(z-0.17));ctx.lineTo(X(-0.13),Z(z+0.17));ctx.lineTo(X(0.13),Z(z+0.17));ctx.closePath();ctx.stroke();L([[0,z],[0.32,z]],3);L([[0.32,z-0.09],[0.32,z+0.09]],6)}
 // label bars under each element (no words)
 ctx.globalAlpha=0.75;for(const[x,z,w]of[[-3.23,ZB+0.55,0.42],[-1.7,ZB+0.36,0.5],[1.7,ZB+0.62,0.46],[0.62,-5.58,0.36]]){ctx.fillRect(X(x-w/2),Z(z),w*S,0.05*S)}ctx.globalAlpha=1;
 // dimension lines
 const dim=(a,b,horiz)=>{if(horiz){L([[a[0],a[1]],[b[0],b[1]]],3);for(const p of[a,b]){L([[p[0],p[1]-0.09],[p[0],p[1]+0.09]],3)}L([[a[0]+0.12,a[1]-0.05],[a[0],a[1]],[a[0]+0.12,a[1]+0.05]],3);L([[b[0]-0.12,b[1]-0.05],[b[0],b[1]],[b[0]-0.12,b[1]+0.05]],3)}
  else{L([[a[0],a[1]],[b[0],b[1]]],3);for(const p of[a,b]){L([[p[0]-0.09,p[1]],[p[0]+0.09,p[1]]],3)}L([[a[0]-0.05,a[1]-0.12],[a[0],a[1]],[a[0]+0.05,a[1]-0.12]],3);L([[b[0]-0.05,b[1]+0.12],[b[0],b[1]],[b[0]+0.05,b[1]+0.12]],3)}};
 dim([-2.5,-6.92],[2.5,-6.92],1);ctx.clearRect(X(-0.3),Z(-6.98),0.6*S,0.12*S);ctx.fillRect(X(-0.22),Z(-6.94),0.44*S,0.04*S);
 dim([3.3,-6.3],[3.3,-4.15],0);
 // title block
 R(1.05,-3.62,3.46,-3.12,3);L([[2.1,-3.62],[2.1,-3.12]],2);L([[2.1,-3.37],[3.46,-3.37]],2);
 // north arrow
 {const cx=X(-3.2),cz=Z(-3.38),r=0.16*S;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cz,r,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cz-r*1.3);ctx.lineTo(cx-r*0.35,cz+r*0.3);ctx.lineTo(cx+r*0.35,cz+r*0.3);ctx.closePath();ctx.fill()}
}
defState('blueprint',()=>{const parts=[];const T=Y0+0.02;
 const bx=new Part(Math.round(50000*SCALE)+50);BOXES7.forEach(b=>plane(bx,iconCanvas(b.k),7600,{c:[b.x,T,b.z],R:[1,0,0],U:[0,0,-1],w:0.95,h:0.72,edge:1.4,em:0.75,tint:[0.85,0.95,1.05]}));bx.at=0;parts.push(bx);
 // the bus: three oxide strands (same ids as the ruled lines before)
 const S=new Part(Math.round(17000*SCALE)+20);for(let i=0;i<12;i++){const st=i%3,pc=Math.floor(i/3);const x0=-3.04+pc*1.585,z=ZB+(st-1)*0.035;tube(S,1350,{pts:[[x0,T+0.004,z],[x0+1.585,T+0.004,z]],rad:0.01,color:C('#d0502e'),em:0.95})}S.at=80000;parts.push(S);
 // the drawing itself, drawn left to right (group 13)
 const art=new Part(Math.round(32000*SCALE)+20);plane(art,getCanvas('bp',2220,1320,drawBlueprint),30000,{c:[0,T,(BP.z0+BP.z1)/2],R:[1,0,0],U:[0,0,-1],w:7.4,h:4.4,edge:0.3,em:0.85,group:13,reveal:(u,v)=>u*0.85+(1-v)*0.14});parts.push(art);
 const g=new Part(Math.round(36000*SCALE)+20,true);let n=Math.round(26000*SCALE);for(let i=0;i<n;i++){const gx=Math.round((Math.random()-0.5)*44)/4,gz=-5.2+Math.round((Math.random()-0.5)*28)/4;const along=Math.random()<0.5;const x=along?gx+(Math.random()-0.5)*0.25:gx,z=along?gz:gz+(Math.random()-0.5)*0.25;g.push(x,Y0-0.01,z,40,70,118,0,0,0.5)}
 n=Math.round(8000*SCALE);for(let i=0;i<n;i++){const gx=BP.x0+0.1+Math.round(Math.random()*72)/10,gz=BP.z0+0.1+Math.round(Math.random()*42)/10;const along=Math.random()<0.5;g.push(along?gx+(Math.random()-0.5)*0.1:gx,Y0,along?gz:gz+(Math.random()-0.5)*0.1,34,58,96,0,0,0.5)}parts.push(g);
 return{parts,fill:fillDust([-5,-4.4,-9],[5,2,-1],[50,70,110])}});

// ---- scene 6: the engine room ----
export const ER={xr:1.32,zs:[-3.35,-4.0,-4.65,-5.3,-5.95,-6.6,-7.25],h:2.15,dz:0.6,dx:0.9,db:-8.3,yt:Y0+2.45};
const FPLATES=[['wa',-1,0],['shop',-1,1],['rzp',-1,2],['web',-1,3],['sheet',1,0],['mail',1,1],['books',1,2],['cloud',1,3]];
function rackFront(v){return getCanvas('rack'+v,240,860,(ctx,W,H)=>{ctx.fillStyle='#22272c';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#59616a';ctx.lineWidth=8;ctx.strokeRect(4,4,W-8,H-8);
 let y=70,i=v*3;while(y<H-30){const u=[1,2,1,3,2,1,1,2][(i++)%8];const h=u*30-5;ctx.fillStyle=['#434b53','#3a4148','#4b545c'][i%3];ctx.fillRect(16,y,W-32,h);
  ctx.fillStyle='#111417';if(u>=2){for(let yy=y+7;yy<y+h-6;yy+=9)for(let xx=44;xx<W-44;xx+=9)ctx.fillRect(xx,yy,5,5)}else{for(let xx=30;xx<W-46;xx+=17)ctx.fillRect(xx,y+8,12,10)}
  ctx.fillStyle='#a8b0b8';ctx.fillRect(20,y+h/2-7,6,14);ctx.fillRect(W-26,y+h/2-7,6,14);y+=h+5}})}
function plateCanvas(k){return getCanvas('plate-'+k,560,200,(ctx,W,H)=>{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c3c9cf');g.addColorStop(0.5,'#9aa2aa');g.addColorStop(1,'#b7bec5');ctx.fillStyle=g;rr(ctx,0,0,W,H,14);ctx.fill();
 for(let y=4;y<H;y+=3){ctx.fillStyle=`rgba(255,255,255,${0.05+Math.random()*0.08})`;ctx.fillRect(6,y,W-12,1)}
 for(const[x,y]of[[18,18],[W-18,18],[18,H-18],[W-18,H-18]]){ctx.fillStyle='#5d656c';ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill()}
 ctx.fillStyle='#1d2329';rr(ctx,36,36,128,128,18);ctx.fill();const cx=100,cy=100;
 ctx.font=`700 62px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#1b1f23';
 if(k==='wa'){waLogo(ctx,cx,cy,44);fitFont(ctx,COPY.chatApp,700,62,350);ctx.fillText(COPY.chatApp,186,104)}
 else if(k==='shop'){shopBag(ctx,cx,cy+4,80);ctx.fillStyle='#1b1f23';fitFont(ctx,COPY.shopBrand,700,66,350);ctx.fillText(COPY.shopBrand,186,100)}
 else if(k==='rzp'){ctx.fillStyle='#0b1b3f';rr(ctx,36,36,128,128,18);ctx.fill();rzpMark(ctx,cx-6,cy+4,80);ctx.fillStyle='#1b1f23';fitFont(ctx,COPY.payBrand,700,62,350);ctx.fillText(COPY.payBrand,186,104)}
 else{ctx.strokeStyle='#e6eef7';ctx.lineWidth=7;ctx.lineJoin='round';ctx.beginPath();
  if(k==='sheet'){ctx.rect(cx-44,cy-34,88,68);ctx.moveTo(cx-14,cy-34);ctx.lineTo(cx-14,cy+34);ctx.moveTo(cx+16,cy-34);ctx.lineTo(cx+16,cy+34);ctx.moveTo(cx-44,cy-11);ctx.lineTo(cx+44,cy-11);ctx.moveTo(cx-44,cy+12);ctx.lineTo(cx+44,cy+12)}
  if(k==='mail'){ctx.rect(cx-46,cy-30,92,60);ctx.moveTo(cx-46,cy-30);ctx.lineTo(cx,cy+6);ctx.lineTo(cx+46,cy-30)}
  if(k==='web'){rr(ctx,cx-46,cy-34,92,68,8);ctx.moveTo(cx-46,cy-16);ctx.lineTo(cx+46,cy-16);ctx.moveTo(cx-34,cy-25);ctx.arc(cx-36,cy-25,2,0,7);ctx.moveTo(cx-30,cy+2);ctx.lineTo(cx+10,cy+2);ctx.moveTo(cx-30,cy+18);ctx.lineTo(cx+24,cy+18)}
  if(k==='cloud'){ctx.moveTo(cx-40,cy+24);ctx.arc(cx-26,cy+6,18,Math.PI*0.5,Math.PI*1.5);ctx.arc(cx,cy-10,26,Math.PI,0);ctx.arc(cx+28,cy+6,18,Math.PI*1.5,Math.PI*0.5);ctx.closePath();ctx.moveTo(cx,cy+16);ctx.lineTo(cx,cy-4);ctx.moveTo(cx-9,cy+5);ctx.lineTo(cx,cy-5);ctx.lineTo(cx+9,cy+5)}
  if(k==='books'){ctx.rect(cx-44,cy-34,88,68);ctx.moveTo(cx,cy-34);ctx.lineTo(cx,cy+34);for(let i=1;i<4;i++){ctx.moveTo(cx-38,cy-34+i*17);ctx.lineTo(cx-8,cy-34+i*17);ctx.moveTo(cx+8,cy-34+i*17);ctx.lineTo(cx+38,cy-34+i*17)}}
  ctx.stroke();bars(ctx,186,78,250,26,'#1b1f23');bars(ctx,186,122,170,20,'#4a525a')}})}
function rackAt(p,side,z,v,nS=1){const xr=side*ER.xr,fx=xr-side*ER.dx/2,nx=-side,h=ER.h;
 box(p,1300*nS,{c:[xr,Y0+h/2,z],s:[ER.dx,h,ER.dz-0.03],faces:['py','pz','nz'],color:(f,u,v2)=>J(C(f==='py'?'#3a4046':'#2b3036'),0.06)});
 plane(p,rackFront(v),2600*nS,{c:[fx+nx*0.004,Y0+h/2,z],R:side<0?[0,0,-1]:[0,0,1],U:[0,1,0],w:ER.dz-0.04,h:h-0.02,edge:0.8,em:0.3});
 // status LEDs (group 12 blink)
 for(let k=0;k<26;k++){const y=Y0+0.12+k*0.075+(v*0.013)%0.03,zz=z+(side<0?-1:1)*(0.2+((k*7+v)%3)*0.025);const amber=((k*5+v*3)%7)===0,blue=((k*3+v)%11)===0;const col=amber?[255,176,60]:blue?[90,170,255]:[70,240,130];
  for(let i=0;i<Math.round(9*SCALE)+1;i++)p.push(fx+nx*0.012+(Math.random()-0.5)*0.008,y+(Math.random()-0.5)*0.014,zz+(Math.random()-0.5)*0.014,col[0],col[1],col[2],12,0,1)}
 // patch cables: plugged into a port, drooping in a soft catenary to the cable manager at the rack edge
 const cc=[C('#3d7fd6'),C('#e2b94b'),C('#3d7fd6'),C('#8a939c'),C('#d0502e'),C('#3d7fd6'),C('#e2b94b'),C('#8a939c')];
 const nC=SCALE>3?8:SCALE>1.5?6:4,sz=side<0?-1:1,zEdge=z+sz*0.255;
 for(let k=0;k<nC;k++){const y1=Y0+0.42+k*(1.5/nC),z1=z-sz*(0.17-((k*5)%nC)*(0.22/nC)),y2=y1-0.05-0.03*(k%3),sag=0.07+0.03*(k%2);
  const pts=[];for(let q=0;q<=18;q++){const t=q/18,bow=Math.sin(Math.PI*t);
   pts.push([fx+nx*(0.012+0.035*Math.sin(Math.PI*Math.min(1,t*1.6))),y1+(y2-y1)*t-sag*bow*bow*0.9-sag*0.4*t*t,z1+(zEdge-z1)*(1-Math.pow(1-t,1.6))])}
  // run down inside the manager
  pts.push([fx+nx*0.03,Y0+0.18,zEdge]);
  tube(p,Math.round(150*nS*(4/nC)*2.4),{pts,rad:0.0032,color:cc[k],em:0.35});
  // plug boot at the port
  box(p,Math.round(24*nS),{c:[fx+nx*0.014,y1,z1],s:[0.026,0.016,0.014],color:()=>J([200,205,210],0.05)})}
 // vertical cable manager strip
 box(p,Math.round(160*nS),{c:[fx+nx*0.03,Y0+h/2,zEdge],s:[0.02,h-0.1,0.03],faces:['px','nx'],color:()=>J(C('#1a1e22'),0.05)})}
defState('engine',()=>{const parts=[];const p=new Part(Math.round(100000*SCALE)+100);
 ER.zs.forEach((z,i)=>{rackAt(p,-1,z,i);rackAt(p,1,z,i+3)});parts.push(p);
 // faceplates: dot copy under the crisp cards
 const fp=new Part(Math.round(5000*SCALE)+20);for(const[k,side,i]of FPLATES){const z=ER.zs[i],fx=side*ER.xr-side*ER.dx/2;plane(fp,plateCanvas(k),700,{c:[fx-side*0.02,Y0+ER.h-0.17,z],R:side<0?[0,0,-1]:[0,0,1],U:[0,1,0],w:0.54,h:0.19,em:0.6})}parts.push(fp);
 // cable tray overhead with the bus in it, drops into each rack, trunk into the database wall
 const tr=new Part(Math.round(16000*SCALE)+50);const yt=ER.yt,zA=-2.7,zB=-8.1;
 for(const x of[-0.28,0.28])tube(tr,700,{pts:[[x,yt,zA],[x,yt,zB]],rad:0.012,color:C('#8d969e'),em:0.15});
 for(let z=zA;z>zB;z-=0.25)tube(tr,40,{pts:[[-0.28,yt-0.01,z],[0.28,yt-0.01,z]],rad:0.006,color:C('#6c757d'),em:0.1});
 for(const x of[-0.1,0,0.1])tube(tr,800,{pts:[[x,yt+0.03,zA],[x,yt+0.03,zB],[x*0.5,yt-0.05,zB-0.12],[x*0.5,Y0+2.3,ER.db+0.05]],rad:0.014,color:C('#d0502e'),em:0.85});
 for(const z of ER.zs)for(const side of[-1,1])tube(tr,170,{pts:[[side*0.28,yt,z],[side*1.0,yt,z],[side*1.0,Y0+ER.h,z]],rad:0.01,color:C('#3a4148'),em:0.1});
 parts.push(tr);
 // packets of light (flow group 24)
 const pk=new Part(Math.round(7000*SCALE)+50);tube(pk,3000,{pts:[[0,yt+0.05,zA],[0,yt+0.05,zB],[0,yt-0.05,zB-0.12],[0,Y0+2.3,ER.db+0.05]],rad:0.032,color:C('#ffe2ad'),group:24,em:1});
 FPLATES.forEach(([k,side,i])=>{const z=ER.zs[i];tube(pk,350,{pts:[[side*1.0,Y0+ER.h,z],[side*1.0,yt,z],[side*0.28,yt,z]],rad:0.024,color:C('#ffe2ad'),group:24,em:1})});parts.push(pk);
 // the database: a glass wall of tables, rows fill left to right (group 14)
 const db=new Part(Math.round(30000*SCALE)+50);const zd=ER.db,yb=Y0+0.05,yT=Y0+2.32;
 for(const x of[-1.75,-0.585,0.585,1.75])tube(db,500,{pts:[[x,yb,zd],[x,yT,zd]],rad:0.012,color:C('#9fb4c8'),em:0.4});
 for(const y of[yb,yT])tube(db,900,{pts:[[-1.75,y,zd],[1.75,y,zd]],rad:0.012,color:C('#9fb4c8'),em:0.4});
 const gb=new Part(Math.round(9000*SCALE)+50,true);{const n=Math.round(2600*SCALE);for(let i=0;i<n;i++){const x=(Math.random()-0.5)*3.5,y=yb+Math.random()*(yT-yb);gb.push(x,y,zd-0.02,40,70,100,0,0,0.35)}}
 for(let ti=0;ti<3;ti++){const cx=-1.17+ti*1.17,x0=cx-0.48,x1=cx+0.48,top=Y0+2.08;
  // header
  {const n=Math.round(600*SCALE);for(let i=0;i<n;i++)db.push(x0+Math.random()*(x1-x0),top+(Math.random()-0.5)*0.07,zd+0.01,120,170,215,0,0,0.9)}
  for(let r=0;r<14;r++){const y=top-0.14-r*0.122;const old=r<4;const cells=[[0,0.3],[0.36,0.66],[0.72,0.95]];
   tube(db,90,{pts:[[x0,y-0.055,zd+0.01],[x1,y-0.055,zd+0.01]],rad:0.003,color:[70,95,125],em:0.4});
   for(const[a,b]of cells){const w=(b-a)*(0.55+0.4*(((r*7+ti*3+a*10)|0)%5)/4);const n=Math.round(120*SCALE);
    for(let i=0;i<n;i++){const u=Math.random();const x=x0+(a+u*w)*(x1-x0);const rv=old?0:Math.min(0.999,(ti*10+(r-4)+(a+u*w)*0.9)/30);
     db.push(x,y+(Math.random()-0.5)*0.035,zd+0.012,old?150:205,old?185:228,old?215:246,old?0:14,rv,0.95)}}}}
 // learned memory: a faint graph of nodes and links behind the tables (nodes twinkle, group 12)
 {let sd=9;const Rn=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};const N=[];for(let i=0;i<26;i++)N.push([-1.65+Rn()*3.3,yb+0.12+Rn()*(yT-yb-0.24)]);
  for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const d=Math.hypot(N[i][0]-N[j][0],N[i][1]-N[j][1]);if(d<0.62)tube(gb,Math.round(30+d*50),{pts:[[N[i][0],N[i][1],zd-0.05],[N[j][0],N[j][1],zd-0.05]],rad:0.004,color:[150,120,200],em:0.55})}
  for(const[x,y]of N){const m=Math.round(30*SCALE)+2;for(let i=0;i<m;i++)gb.push(x+(Math.random()-0.5)*0.03,y+(Math.random()-0.5)*0.03,zd-0.05,210,170,255,12,0,1)}}parts.push(gb);
 // warm task light over the wall
 cyl(db,900,{c:[0,Y0+2.66,zd+0.35],r:0.05,r2:0.28,len:0.2,axis:'y',caps:false,color:()=>C('#2e5a40')});sphere(db,800,{c:[0,Y0+2.5,zd+0.35],r:0.08,color:()=>C('#ffd089'),em:1,group:10});
 parts.push(db);
 // raised floor tiles
 const fl=new Part(Math.round(9000*SCALE)+20,true);{const n=Math.round(8000*SCALE);for(let i=0;i<n;i++){const al=Math.random()<0.5;const gx=-2.1+Math.round(Math.random()*7)*0.6,gz=-2.6-Math.round(Math.random()*9.5)*0.6;
  const x=al?gx:-2.1+Math.random()*4.2,z=al?-2.6-Math.random()*5.7:gz;fl.push(x,Y0,z,60,72,88,0,0,0.25)}}parts.push(fl);
 return{parts,fill:fillDust([-2.2,Y0,-8.4],[2.2,Y0+2.6,-2.6],[60,70,90])}});

// ---- scene 7: agents on pipelines, three jobs ----
export const PY=Y0+0.85,Z9=-9.6,ZS=-10.15;
export const CAP={a:[-0.95,PY,Z9],b:[2.95,PY,Z9],c:[8.35,PY,Z9]};
const VC={cx:0.75,w:1.35,h:0.95};
export const CALSLOT=[VC.cx-VC.w/2+5.5*VC.w/7,PY+0.98+VC.h/2-0.16-1.5*(VC.h-0.16)/4,ZS+0.02];
const SHX=5.0,PLX=6.65,VX=11.4;
// the dues envelope: drafted beside the ledger, carried to the valve, then out
export const ENV={c:[11.05,PY+0.3,Z9+0.12],from:[10.2,PY+0.42,ZS+0.12]};
function capIcon(k){return getCanvas('cap-'+k,300,200,(ctx,W,H)=>{ctx.strokeStyle='#a83a1c';ctx.fillStyle='#a83a1c';ctx.lineWidth=12;ctx.lineJoin=ctx.lineCap='round';const cx=W/2,cy=H/2;ctx.beginPath();
 if(k==='chat'){rr(ctx,cx-60,cy-45,120,72,20);ctx.moveTo(cx-30,cy+27);ctx.lineTo(cx-45,cy+55);ctx.lineTo(cx-5,cy+27)}
 if(k==='pay'){rr(ctx,cx-70,cy-45,140,90,12);ctx.moveTo(cx-70,cy-18);ctx.lineTo(cx+70,cy-18);ctx.moveTo(cx-48,cy+20);ctx.lineTo(cx-10,cy+20)}
 if(k==='mic'){rr(ctx,cx-22,cy-60,44,80,22);ctx.moveTo(cx-45,cy-5);ctx.quadraticCurveTo(cx-45,cy+45,cx,cy+45);ctx.quadraticCurveTo(cx+45,cy+45,cx+45,cy-5);ctx.moveTo(cx,cy+45);ctx.lineTo(cx,cy+70)}
 if(k==='cal'){rr(ctx,cx-60,cy-48,120,100,10);ctx.moveTo(cx-60,cy-20);ctx.lineTo(cx+60,cy-20);ctx.moveTo(cx-30,cy-62);ctx.lineTo(cx-30,cy-38);ctx.moveTo(cx+30,cy-62);ctx.lineTo(cx+30,cy-38);ctx.moveTo(cx-28,cy+10);ctx.lineTo(cx-12,cy+10);ctx.moveTo(cx+12,cy+24);ctx.lineTo(cx+28,cy+24)}
 if(k==='box'){ctx.moveTo(cx-60,cy-25);ctx.lineTo(cx,cy-55);ctx.lineTo(cx+60,cy-25);ctx.lineTo(cx+60,cy+40);ctx.lineTo(cx,cy+68);ctx.lineTo(cx-60,cy+40);ctx.closePath();ctx.moveTo(cx-60,cy-25);ctx.lineTo(cx,cy+3);ctx.lineTo(cx+60,cy-25);ctx.moveTo(cx,cy+3);ctx.lineTo(cx,cy+68)}
 if(k==='mail'){rr(ctx,cx-70,cy-45,140,90,10);ctx.moveTo(cx-70,cy-45);ctx.lineTo(cx,cy+8);ctx.lineTo(cx+70,cy-45)}
 ctx.stroke()})}
function capsule(p,c,icon,group){const L=0.46,r=0.13,col=()=>J(C('#ece4d2'),0.04);
 cyl(p,1500,{c,r,len:L,axis:'x',caps:false,group,em:0.55,color:col});for(const s of[-1,1])sphere(p,450,{c:[c[0]+s*L/2,c[1],c[2]],r,group,em:0.55,color:col});
 plane(p,capIcon(icon),700,{c:[c[0],c[1],c[2]+r+0.006],w:0.3,h:0.2,em:1,group})}
function lbox(p,n,c,s,{group=0,em=0}={}){const kraft=mix(C('#b48a5a'),C('#9a7146'),Math.random());box(p,n,{c,s,group,em,color:(f,u,v)=>{let k=J(kraft,0.04);
 if(f==='py'&&Math.abs(u-0.5)<0.07)k=mix(k,[205,170,115],0.7);
 if(f==='pz'&&u>0.15&&u<0.85&&v>0.22&&v<0.62){k=[240,236,226];if(v<0.4&&u>0.22&&u<0.78&&Math.sin(u*220)>0.1)k=[25,25,25];if(v>0.47&&v<0.55&&u>0.22&&u<0.6)k=[90,90,90]}
 return k}})}
function drawBubIn(ctx,W,H){ctx.fillStyle='#ffffff';rr(ctx,24,8,W-32,H-28,26);ctx.fill();ctx.beginPath();ctx.moveTo(24,H-60);ctx.lineTo(4,H-14);ctx.lineTo(70,H-22);ctx.fill();
 ctx.fillStyle='#ece6da';rr(ctx,46,30,190,H-80,16);ctx.fill();drawKurta(ctx,141,(H-50)/2+8,H*0.55,'#9c2f3a');
 ctx.fillStyle='#111b21';ctx.font=`600 64px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(COPY.chatAsk,262,H*0.42);
 bars(ctx,W-150,H-70,90,16,'#8696a0');}
function drawPayLink(ctx,W,H){ctx.fillStyle='#ffffff';rr(ctx,6,6,W-12,H-12,26);ctx.fill();ctx.save();rr(ctx,6,6,W-12,H-12,26);ctx.clip();ctx.fillStyle='#0b1b3f';ctx.fillRect(0,0,W,120);ctx.restore();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=9;ctx.lineCap='round';for(const d of[0,1]){ctx.save();ctx.translate(70+d*26,64);ctx.rotate(-0.78);rr(ctx,-26,-14,52,28,14);ctx.stroke();ctx.restore()}
 ctx.fillStyle='#fff';ctx.font=`700 46px ${FONT}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(COPY.payTitle,138,64);
 ctx.fillStyle='#f4f1ea';rr(ctx,40,150,180,180,16);ctx.fill();drawKurta(ctx,130,240,140,'#9c2f3a');
 bars(ctx,250,170,300,30,'#1b2433');bars(ctx,250,222,200,24,'#7d8796');bars(ctx,250,272,240,24,'#7d8796');
 ctx.strokeStyle='#e3e7ee';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(40,370);ctx.lineTo(W-40,370);ctx.stroke();bars(ctx,40,400,220,26,'#7d8796');bars(ctx,W-200,396,160,34,'#1b2433');
 ctx.fillStyle='#3395ff';rr(ctx,40,470,W-80,96,48);ctx.fill();ctx.fillStyle='#fff';ctx.font=`700 52px ${FONT}`;ctx.textAlign='center';ctx.fillText(COPY.payButton,W/2,519);ctx.textAlign='left'}
function stampCanvas(col,word){return getCanvas('stamp-'+col+word,400,400,(ctx,W,H)=>{ctx.strokeStyle=ctx.fillStyle=col;const c=W/2;ctx.lineWidth=16;ctx.beginPath();ctx.arc(c,c,c-14,0,7);ctx.stroke();ctx.lineWidth=6;ctx.beginPath();ctx.arc(c,c,c-40,0,7);ctx.stroke();
 tick(ctx,c,word?c-30:c,word?150:190,col,30);if(word){ctx.font=`800 70px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(word,c,c+95)}
 // worn ink
 ctx.globalCompositeOperation='destination-out';for(let i=0;i<260;i++){ctx.fillStyle=`rgba(0,0,0,${0.3+Math.random()*0.5})`;ctx.fillRect(Math.random()*W,Math.random()*H,2+Math.random()*7,2+Math.random()*4)}ctx.globalCompositeOperation='source-over'})}
function drawDash(ctx,W,H,green){ctx.fillStyle='#0f151b';rr(ctx,0,0,W,H,24);ctx.fill();const pw=W/7;
 for(let i=0;i<7;i++){const x=i*pw+14,w=pw-28;ctx.fillStyle='#17202a';rr(ctx,x,16,w,H-32,14);ctx.fill();
  if(i%2===0){for(let k=0;k<4;k++){const tx=x+12+(k%2)*(w-24)/2,ty=28+Math.floor(k/2)*(H-56)/2,tw=(w-36)/2,th=(H-70)/2;ctx.fillStyle=green?'#1f9d55':'#2c353f';rr(ctx,tx,ty,tw,th,10);ctx.fill();
    if(green)tick(ctx,tx+tw/2,ty+th/2,th*0.45,'#e9fff1',9);else bars(ctx,tx+tw*0.2,ty+th*0.45,tw*0.6,th*0.12,'#45505c')}}
  else{ctx.strokeStyle='#2c353f';ctx.lineWidth=3;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(x+16,16+k*(H-32)/4);ctx.lineTo(x+w-16,16+k*(H-32)/4);ctx.stroke()}
   if(green){ctx.beginPath();for(let s=0;s<=40;s++){const xx=x+20+s*(w-40)/40,yy=H*0.75-(s/40)*H*0.38-Math.sin(s*0.7+i)*H*0.06;s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.strokeStyle='#7fd3a0';ctx.lineWidth=7;ctx.stroke();
    ctx.lineTo(x+w-20,H-24);ctx.lineTo(x+20,H-24);ctx.closePath();ctx.fillStyle='rgba(127,211,160,.15)';ctx.fill()}}}}
function drawEnvelope(ctx,W,H){ctx.fillStyle='#efe6cf';rr(ctx,4,4,W-8,H-8,10);ctx.fill();ctx.strokeStyle='#b9a77f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(8,10);ctx.lineTo(W/2,H*0.55);ctx.lineTo(W-8,10);ctx.stroke();
 ctx.beginPath();ctx.moveTo(8,H-8);ctx.lineTo(W*0.4,H*0.48);ctx.moveTo(W-8,H-8);ctx.lineTo(W*0.6,H*0.48);ctx.stroke();
 ctx.fillStyle='#a83a1c';rr(ctx,W-78,18,56,62,4);ctx.fill();ctx.strokeStyle='#efe6cf';ctx.lineWidth=3;rr(ctx,W-72,24,44,50,3);ctx.stroke();
 bars(ctx,W*0.3,H*0.66,W*0.4,14,'#4a3b2a');bars(ctx,W*0.3,H*0.78,W*0.28,12,'#7d6b55')}
function drawLedgerOpen(ctx,W,H){ctx.fillStyle='#6e1814';rr(ctx,0,0,W,H,16);ctx.fill();
 for(const s of[0,1]){const x0=s?W/2+4:14,w=W/2-18;ctx.fillStyle='#efe3c4';rr(ctx,x0,14,w,H-28,8);ctx.fill();
  ctx.strokeStyle='rgba(60,110,150,.55)';ctx.lineWidth=2;for(let y=70;y<H-30;y+=34){ctx.beginPath();ctx.moveTo(x0+10,y);ctx.lineTo(x0+w-10,y);ctx.stroke()}
  ctx.strokeStyle='rgba(176,52,36,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0+w*0.18,22);ctx.lineTo(x0+w*0.18,H-22);ctx.moveTo(x0+w*0.72,22);ctx.lineTo(x0+w*0.72,H-22);ctx.stroke();
  for(let r=0;r<11;r++){const y=70+r*34-10;bars(ctx,x0+w*0.22,y,w*(0.25+0.2*((r*5+s*3)%4)/3),12,'#3a2c22');if(r%3!==2)bars(ctx,x0+w*0.76,y,w*0.16,12,r===7&&s?'#a83a1c':'#3a2c22')}}
 ctx.fillStyle='#4a0f0c';ctx.fillRect(W/2-4,10,8,H-20)}
function drawDuesSheet(ctx,W,H){ctx.fillStyle='#fbfdf9';rr(ctx,0,0,W,H,12);ctx.fill();ctx.fillStyle='#1d7a43';ctx.fillRect(0,0,W,54);bars(ctx,20,18,W*0.4,18,'#e9f7ee');
 const rows=7,ch=(H-70)/rows;for(let r=0;r<rows;r++){const y=62+r*ch;ctx.fillStyle=r%2?'#f1f6f2':'#ffffff';ctx.fillRect(0,y,W,ch);bars(ctx,18,y+ch*0.35,W*0.32,ch*0.3,'#5f6368');bars(ctx,W*0.45,y+ch*0.35,W*0.18,ch*0.3,'#5f6368');
  if(r===5){ctx.fillStyle='#feefc3';ctx.fillRect(W*0.7,y,W*0.3,ch)}bars(ctx,W*0.74,y+ch*0.35,W*0.18,ch*0.3,r===5?'#a85a00':'#1d7a43')}
 ctx.strokeStyle='#d7dcd8';ctx.lineWidth=2;for(const x of[W*0.42,W*0.7]){ctx.beginPath();ctx.moveTo(x,54);ctx.lineTo(x,H);ctx.stroke()}}
defState('agents',()=>{const parts=[];const p=new Part(Math.round(100000*SCALE)+100);
 // pipelines out of the room, along the camera's ride
 for(const[dy,rad]of[[0,0.03],[-0.3,0.022],[-0.42,0.022]])tube(p,3600,{pts:[[-2.8,PY+dy,Z9],[14,PY+dy,Z9]],rad,color:C('#7b8792'),em:0.25});
 for(let x=-2.2;x<14;x+=1.6)tube(p,120,{pts:[[x,PY+0.06,Z9-0.02],[x,PY-0.48,Z9-0.02]],rad:0.01,color:C('#5b6670'),em:0.1});
 parts.push(p);
 const fl=new Part(Math.round(5000*SCALE)+20,true);{const n=Math.round(4500*SCALE);for(let i=0;i<n;i++){const al=Math.random()<0.5;const x=al?-3+Math.random()*17.5:-3+Math.round(Math.random()*29)*0.6,z=al?-8.6-Math.round(Math.random()*6)*0.6:-8.6-Math.random()*3.6;fl.push(x,Y0,z,50,62,78,0,0,0.2)}}parts.push(fl);
 const pk=new Part(Math.round(6000*SCALE)+20);tube(pk,2600,{pts:[[-2.8,PY+0.045,Z9+0.02],[14,PY+0.045,Z9+0.02]],rad:0.03,color:C('#ffe2ad'),group:25,em:1});
 tube(pk,700,{pts:[[CAP.b[0]+0.6,PY,Z9-0.02],[SHX-0.7,PY-0.18,-9.78],[SHX-0.25,Y0+1.0,-9.95]],rad:0.03,color:C('#ffe2ad'),group:26,em:1});
 tube(pk,700,{pts:[[10.55,PY+0.72,ZS+0.06],[10.45,PY+0.55,ZS+0.08],[ENV.from[0],ENV.from[1]+0.1,ENV.from[2]]],rad:0.03,color:C('#ffe2ad'),group:27,em:1});parts.push(pk);
 // agent capsules (offset groups move them along the pipe): voice, chat, dues
 const cp=new Part(Math.round(10000*SCALE)+20);capsule(cp,CAP.a,'mic',16);capsule(cp,CAP.b,'chat',18);capsule(cp,CAP.c,'mail',19);parts.push(cp);
 // 1. voice: a waveform wipes into a calendar (group 3, window 0.5); a booking block slides into its slot (group 20)
 const V1=new Part(Math.round(16000*SCALE)+50);{const cx=VC.cx,cy=PY+0.98,w=VC.w,h=VC.h;
  for(let i=0;i<46;i++){const u=(i+0.5)/46,x=cx-w/2+u*w;const amp=0.06+0.34*Math.abs(Math.sin(i*0.55)*Math.sin(i*0.17+1))*(1-Math.abs(u-0.5));const m=Math.round(90*SCALE);
   for(let k=0;k<m;k++){V1.push(x+(Math.random()-0.5)*0.014,cy+(Math.random()-0.5)*2*amp,ZS,235,200,160,3,u*0.499,0.95)}}
  const pushC=(x,y,col,em)=>V1.push(x,y,ZS,col[0],col[1],col[2],3,Math.min(0.999,0.5+0.5*((x-(cx-w/2))/w)),em);
  const seg=(x0,y0,x1,y1,n)=>{for(let i=0;i<Math.round(n*SCALE);i++){const t=Math.random();pushC(x0+(x1-x0)*t,y0+(y1-y0)*t,[220,228,236],0.9)}};
  const l=cx-w/2,r=cx+w/2,t=cy+h/2,b=cy-h/2;seg(l,t,r,t,260);seg(l,b,r,b,260);seg(l,t,l,b,200);seg(r,t,r,b,200);
  {const m=Math.round(1400*SCALE);for(let i=0;i<m;i++)pushC(l+Math.random()*w,t-Math.random()*0.16,[208,80,46],0.9)}
  for(let c=1;c<7;c++)seg(l+c*w/7,t-0.16,l+c*w/7,b,110);for(let k=1;k<4;k++)seg(l,t-0.16-k*(h-0.16)/4,r,t-0.16-k*(h-0.16)/4,200);
  const cw2=w/7,ch=(h-0.16)/4;for(const[c,k]of[[0,0],[2,1],[3,3],[6,2],[1,3]]){const x=l+c*cw2+0.03,y=t-0.16-k*ch-0.05;const m=Math.round(60*SCALE);for(let i=0;i<m;i++)pushC(x+Math.random()*cw2*0.6,y-Math.random()*0.025,[150,170,190],0.8)}
  {const x=l+5*cw2,y=t-0.16-1*ch;const m=Math.round(260*SCALE);for(let i=0;i<m;i++){const e=Math.random()*4|0,s=Math.random();const px=e<2?x+s*cw2:x+(e===2?0:cw2),py=e<2?y-(e?ch:0):y-s*ch;pushC(px,py,[90,230,140],1)}}
  box(V1,900,{c:[CALSLOT[0],CALSLOT[1],ZS+0.03],s:[cw2*0.86,ch*0.8,0.03],group:20,em:0.9,color:()=>J(C('#d0502e'),0.05)})}
 parts.push(V1);
 // 2. chat to order: the question, the shelf with one box that slides out (group 17), the payment link and its stamp (group 15)
 const A=new Part(Math.round(34000*SCALE)+50);plane(A,getCanvas('bubIn',900,300,drawBubIn),3500,{c:[3.2,PY+0.98,ZS],w:1.5,h:0.5,em:0.85});
 {const cx=SHX,cz=-10.4,lv=[0.04,0.6,1.16,1.72];for(const x of[-0.75,0.75])for(const z of[-0.28,0.28])box(A,500,{c:[cx+x,Y0+0.9,cz+z],s:[0.06,1.8,0.06],color:(f,u,v)=>C('#2c4f8f'),em:0.15});
  for(const y of lv)for(const z of[-0.28,0.28])box(A,420,{c:[cx,Y0+y,cz+z],s:[1.56,0.07,0.06],color:()=>J(C('#d4702a'),0.05),em:0.15});
  for(let l=0;l<3;l++)for(let i=0;i<3;i++){const h=0.36+((l*3+i)%3)*0.05,c=[cx-0.48+i*0.48,Y0+lv[l]+0.04+h/2,cz];if(l===1&&i===1)continue;lbox(A,900,c,[0.4,h,0.46],{em:0.12})}
  lbox(A,1200,[cx,Y0+lv[1]+0.04+0.2,cz],[0.4,0.4,0.46],{group:17,em:0.45})}
 plane(A,getCanvas('paylink',630,630,drawPayLink),5000,{c:[PLX,PY+0.92,ZS],w:1.05,h:1.05,em:0.85});
 {const a=-0.25,R=[Math.cos(a),Math.sin(a),0],U=[-Math.sin(a),Math.cos(a),0];plane(A,stampCanvas('#1f9d55',COPY.paid),3000,{c:[PLX+0.37,PY+0.6,ZS+0.06],R,U,w:0.62,h:0.62,em:0.95,group:15,reveal:(u,v)=>Math.min(0.999,Math.atan2(v-0.5,u-0.5)/(2*Math.PI)+0.5)})}
 parts.push(A);
 // 3. dues: open ledger and a dues sheet, an envelope drafted (offset group 21), stopped at the valve until a person ticks (group 5), then sent
 const D3=new Part(Math.round(22000*SCALE)+50);{const lx=9.3,ly=PY+0.95;
  plane(D3,getCanvas('ledgerOpen',840,600,drawLedgerOpen),7000,{c:[lx,ly,ZS],w:1.4,h:1.0,em:0.8});
  plane(D3,getCanvas('dues',420,480,drawDuesSheet),2600,{c:[10.6,PY+1.08,ZS],w:0.62,h:0.72,em:0.8});
  plane(D3,getCanvas('env',420,260,drawEnvelope),2200,{c:ENV.c,w:0.46,h:0.29,em:0.85,group:21});
  // approval valve on the main pipe, with a tick that lights (group 5)
  const vx=VX;for(const s of[-1,1]){const n=Math.round(500*SCALE);for(let i=0;i<n;i++){const t=Math.random(),q=(Math.random()-0.5)*2*0.12*t;D3.push(vx+s*t*0.14,PY+q,Z9+0.05,170,180,190,0,0,0.4)}}
  tube(D3,300,{pts:[[vx,PY,Z9+0.05],[vx,PY+0.22,Z9+0.05]],rad:0.01,color:C('#8d969e'),em:0.3});cyl(D3,400,{c:[vx,PY+0.24,Z9+0.05],r:0.09,len:0.01,axis:'z',caps:false,color:()=>C('#b0b8c0'),em:0.4});
  const tk=[];for(let i=0;i<=20;i++){const s=i/20;tk.push(s<0.35?[vx+0.18+s/0.35*0.06,PY+0.42-s/0.35*0.07,Z9+0.06]:[vx+0.24+(s-0.35)/0.65*0.16,PY+0.35+(s-0.35)/0.65*0.17,Z9+0.06])}
  tube(D3,700,{pts:tk,rad:0.012,color:C('#e0603a'),group:5,em:1})}
 parts.push(D3);
 // dashboard behind the pipelines (dots under the crisp cards)
 const D=new Part(Math.round(10000*SCALE)+20,true);plane(D,getCanvas('dash0',2800,340,(c,W,H)=>drawDash(c,W,H,false)),9000,{c:[5.6,Y0+2.6,-12.4],w:14.6,h:1.7,em:0.45,dim:0.85});parts.push(D);
 return{parts,fill:fillDust([-3,Y0,-13],[14,Y0+3.5,-8.5],[60,70,90])}});

// ---- scene 8: the same counter, calm ----
function drawPhoneDone(ctx,W,H){drawChat(ctx,W,H);[{y:0.15,h:0.07,w:0.6,out:0},{y:0.235,h:0.07,w:0.5,out:1},{y:0.32,h:0.15,w:0.55,out:0,thumb:'#9c2f3a'},{y:0.49,h:0.07,w:0.55,out:1},{y:0.575,h:0.06,w:0.5,out:0},{y:0.65,h:0.07,w:0.6,out:1},{y:0.74,h:0.06,w:0.45,out:0},{y:0.815,h:0.07,w:0.56,out:1}].forEach(b=>drawBubble(ctx,W,H,b))}
function drawRegDash(ctx,W,H){ctx.fillStyle='#0f151b';ctx.fillRect(0,0,W,H);for(let k=0;k<6;k++){const x=14+(k%3)*(W-28)/3,y=14+Math.floor(k/3)*(H-28)/2,w=(W-28)/3-12,h=(H-28)/2-12;ctx.fillStyle='#1f9d55';rr(ctx,x,y,w,h,10);ctx.fill();tick(ctx,x+w/2,y+h/2,h*0.45,'#e9fff1',8)}}
export const DESK8={mon:{c:[0.9,TABLE.top+0.5,-5.72],w:0.86,h:0.5},phone:{c:[0.25,TABLE.top+0.04,-4.75],ry:-0.15,w:0.38,h:0.8}};
defState('calm',()=>{const parts=[];const roll=new Part(Math.round(7000*SCALE)+10);cyl(roll,7000,{c:[0,3.05,0.25],r:0.42,len:10.6,axis:'x',color:(f,u)=>J(mix(C('#6f777c'),C('#3a3f42'),(Math.sin(u*200)*0.5+0.5)),0.08)});roll.at=0;parts.push(roll);
 facade(parts,1,0.3);bulbOut(parts);lane(parts,0.7);racks(parts,{dim:0.8,nScale:0.7,neutral:true});shell(parts,{nScale:0.75});bulbIn(parts);table(parts,{nScale:0.85});
 const T=TABLE.top,p=new Part(Math.round(30000*SCALE)+50);
 // receipt printer printing a label by itself (group 13)
 box(p,1400,{c:[1.6,T+0.14,-5.05],s:[0.55,0.28,0.48],color:(f,u,v)=>f==='py'&&v>0.6&&v<0.68?C('#0a0a0a'):f==='pz'&&u>0.75&&v>0.4&&v<0.5?C('#2fd06a'):J(C('#2b2c30'),0.04)});
 {const n=Math.round(1600*SCALE);for(let i=0;i<n;i++){const t=Math.random(),w=(Math.random()-0.5)*0.34;const y=T+0.3+t*0.5,z=-5.0-0.1*t*t;const row=Math.floor(t*15),inRow=(t*15)%1;const gl=inRow>0.35&&inRow<0.65&&Math.abs(w)<0.13&&row%4!==0;const c=gl?[60,60,60]:[236,234,226];p.push(1.6+w,y,z,c[0],c[1],c[2],13,t,0.2)}}
 // ledger, closed, stamped
 box(p,2200,{c:[-1.25,T+0.08,-5.05],s:[1.0,0.15,0.7],color:(f,u,v)=>{if(f==='py'){const bd=u<0.05||u>0.95||v<0.07||v>0.93;return bd?C('#c9a24a'):J(C('#8e1f1c'),0.06)}if(f==='pz'||f==='px')return v>0.15&&v<0.85?C('#e6dcc2'):C('#7a1a17');return C('#7a1a17')}});
 plane(p,stampCanvas('#e8c27a',''),900,{c:[-1.05,T+0.158,-5.0],R:[1,0,0],U:[0,0,-1],w:0.42,h:0.42,em:0.7});
 // one sealed carton, a closed notebook, a pen
 lbox(p,1300,[-1.95,T+0.21,-5.6],[0.62,0.4,0.5]);
 box(p,900,{c:[-0.35,T+0.03,-5.55],s:[0.5,0.05,0.68],ry:0.12,color:(f,u,v)=>f==='py'?(u<0.1?C('#1f2328'):J(C('#2b3442'),0.04)):C('#e9e2cf')});
 tube(p,120,{pts:[[-0.05,T+0.065,-5.75],[-0.02,T+0.065,-5.3]],rad:0.012,color:C('#c9a24a'),em:0.3});
 // register screen with the small dashboard, every tile green
 {const m=DESK8.mon;box(p,900,{c:[m.c[0],m.c[1],m.c[2]-0.03],s:[m.w+0.06,m.h+0.06,0.05],color:()=>C('#1b1d20')});box(p,300,{c:[m.c[0],T+0.12,m.c[2]-0.05],s:[0.08,0.22,0.06],color:()=>C('#2a2c30')});box(p,300,{c:[m.c[0],T+0.015,m.c[2]-0.05],s:[0.36,0.03,0.22],color:()=>C('#2a2c30')});
  plane(p,getCanvas('regdash',360,210,drawRegDash),2200,{c:[m.c[0],m.c[1],m.c[2]+0.001],w:m.w,h:m.h,em:0.9})}
 // phone with replies sent
 {const ph=DESK8.phone;const R=rotY([1,0,0],ph.ry),U=rotY([0,0,-1],ph.ry);box(p,900,{c:[ph.c[0],T+0.02,ph.c[2]],s:[0.42,0.03,0.86],ry:ph.ry,color:()=>C('#1a1a1c')});plane(p,getCanvas('phoneDone',430,890,drawPhoneDone),2600,{c:ph.c,R,U,w:ph.w,h:ph.h,em:0.85})}
 // tea glass, empty, on its saucer
 {const g=TEA5;cyl(p,600,{c:[g[0],g[1]+0.15,g[2]],r:0.11,r2:0.125,len:0.3,axis:'y',caps:false,em:0.2,color:(f,u)=>{const fl=0.55+0.45*Math.max(0,Math.cos(u*Math.PI*2*12));return[150*fl,165*fl,172*fl]}});
  cyl(p,250,{c:[g[0],g[1]+0.005,g[2]],r:0.09,len:0.012,axis:'y',em:0.3,color:()=>[170,180,186]});cyl(p,300,{c:[g[0],g[1]+0.3,g[2]],r:0.125,len:0.008,axis:'y',caps:false,em:0.7,color:()=>[235,240,242]});cyl(p,450,{c:[g[0],g[1],g[2]],r:0.2,len:0.006,axis:'y',em:0.2,color:()=>C('#d8cfc0')});
  cyl(p,120,{c:[g[0],g[1]+0.012,g[2]],r:0.07,len:0.004,axis:'y',caps:true,em:0.4,color:()=>C('#b8691e')})}
 parts.push(p);
 // the clock, hands moving gently
 const K=new Part(Math.round(8000*SCALE)+20);plane(K,clockCanvas(),5600,{c:CLOCK5.c,w:CLOCK5.r*2,h:CLOCK5.r*2,edge:1.2});
 tube(K,700,{pts:[[CLOCK5.c[0],CLOCK5.c[1],CLOCK5.c[2]+0.03],[CLOCK5.c[0],CLOCK5.c[1]+0.3,CLOCK5.c[2]+0.03]],rad:0.03,color:[24,20,18],group:6});
 tube(K,700,{pts:[[CLOCK5.c[0],CLOCK5.c[1],CLOCK5.c[2]+0.04],[CLOCK5.c[0],CLOCK5.c[1]+0.47,CLOCK5.c[2]+0.04]],rad:0.022,color:[24,20,18],group:7});parts.push(K);
 // chair pushed in at the end of the table
 const ch=new Part(Math.round(7000*SCALE)+20);const cc=[2.55,-3.5,-5.2],ry=-Math.PI/2;
 const wood=(f,u,v)=>{const g=Math.sin(u*70+fbm(u*6,v*2)*6)*0.5+0.5;return mix(C('#b98250'),C('#8a5a32'),g*0.55)};
 const CB=(o,s,n)=>{const q=rotY(o,ry);box(ch,n,{c:[cc[0]+q[0],cc[1]+q[1],cc[2]+q[2]],s,ry,color:wood,faces:['px','nx','py','pz','nz','ny']})};
 CB([0,0,0],[0.95,0.07,0.88],1400);for(const x of[-0.42,0.42])for(const z of[-0.38,0.38])CB([x,-0.5,z],[0.075,1.0,0.075],300);
 for(const x of[-0.42,0.42])CB([x,0.58,-0.4],[0.08,1.1,0.08],400);CB([0,1.08,-0.4],[0.95,0.14,0.07],400);for(const y of[0.55,0.78])CB([0,y,-0.4],[0.84,0.07,0.05],250);parts.push(ch);
 return{parts,fill:fillDust([-4,-4.4,-12],[4,4,0],[150,130,100])}});

// ---- scene 8 to 9: shutter down, system still running ----
function glints(parts){const p=new Part(Math.round(5000*SCALE)+20);let s=3;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
 for(let i=0;i<70;i++){const x=(R()-0.5)*9.6,k=2+Math.floor(R()*25),y=2.9-k*0.26-0.012;const amber=R()<0.2;const col=amber?[255,176,60]:[70,240,130];for(let j=0;j<Math.round(22*SCALE)+1;j++)p.push(x+(Math.random()-0.5)*0.03,y+(Math.random()-0.5)*0.01,0.1,col[0],col[1],col[2],12,0,1)}
 // warm strip of light under the shutter, spilling onto the lane
 {const n=Math.round(2400*SCALE);for(let i=0;i<n;i++){const x=(Math.random()-0.5)*10.2,sp=Math.pow(Math.random(),2.5);const ground=Math.random()<0.6;p.push(x,ground?-4.515:-4.505+Math.random()*0.012,ground?0.18+sp*1.3:0.17,255,196,120,0,0,ground?0.7*(1-sp):1)}}
 parts.push(p)}
defState('shutterDown',()=>{const parts=[];const sh=shutter(parts);sh.at=0;facade(parts);bulbOut(parts);lane(parts);glints(parts);
 return{parts,fill:fillDust([-6,-4.5,0.3],[6,6,5],[170,150,118])}});
// ---- scene 9: the board repaints with a second line ----
defState('sign2',()=>{const parts=[];const sh=shutter(parts);sh.at=0;facade(parts,1,1,true);bulbOut(parts);lane(parts);glints(parts);
 return{parts,fill:fillDust([-6,-4.5,0.3],[6,6,5],[170,150,118])}});

export function CARDS2(){const out=[];
 for(const[k,side,i]of FPLATES){const z=ER.zs[i],fx=side*ER.xr-side*ER.dx/2;out.push({canvas:plateCanvas(k).c,c:[fx-side*0.02,Y0+ER.h-0.17,z],R:side<0?[0,0,-1]:[0,0,1],U:[0,1,0],w:0.54,h:0.19,t:[27.8,29,34.2,35.4],t2:[80.2,81.4,86.4,87.4],sweep:[1,0],lift:0.006,light:(T,l1,l2)=>0.75+0.25*l2})}
 out.push({canvas:getCanvas('bubIn',900,300,drawBubIn).c,c:[3.2,PY+0.98,ZS],R:[1,0,0],U:[0,1,0],w:1.5,h:0.5,t:[41.6,42.6,50.4,51.4],sweep:[-1,0],lift:0.01,light:()=>0.95});
 out.push({canvas:getCanvas('paylink',630,630,drawPayLink).c,c:[PLX,PY+0.92,ZS],R:[1,0,0],U:[0,1,0],w:1.05,h:1.05,t:[44.4,45.2,50.4,51.4],sweep:[0,-1],lift:0.01,light:()=>0.95});
 out.push({canvas:getCanvas('dash0',2800,340,(c,W,H)=>drawDash(c,W,H,false)).c,c:[5.6,Y0+2.6,-12.4],R:[1,0,0],U:[0,1,0],w:14.6,h:1.7,t:[37.6,39.2,50.6,51.6],sweep:[1,0],lift:0.01,light:()=>0.8});
 out.push({canvas:getCanvas('dash1',2800,340,(c,W,H)=>drawDash(c,W,H,true)).c,c:[5.6,Y0+2.6,-12.4],R:[1,0,0],U:[0,1,0],w:14.6,h:1.7,t:[39.4,49.6,50.6,51.6],sweep:[1,0],lift:0.03,light:()=>0.9});
 const m=DESK8.mon;out.push({canvas:getCanvas('regdash',360,210,drawRegDash).c,c:m.c,R:[1,0,0],U:[0,1,0],w:m.w,h:m.h,t:[89.2,90.2,92.6,93.6],sweep:[1,0],lift:0.006,light:(T,l1,l2)=>0.6+0.35*l2});
 const ph=DESK8.phone;out.push({canvas:getCanvas('phoneDone',430,890,drawPhoneDone).c,c:ph.c,R:rotY([1,0,0],ph.ry),U:rotY([0,0,-1],ph.ry),w:ph.w,h:ph.h,t:[89.2,90.2,92.6,93.6],sweep:[0,-1],lift:0.006,light:(T,l1,l2)=>0.6+0.35*l2});
 return out}

export function buildState(i,N){const {parts,fill}=STATES[i]();const drops=parts.filter(p=>p.drop).map(p=>p.n+'+'+p.drop);if(drops.length)console.warn('state',i,'dropped',drops.join(' '));const tot=parts.reduce((a,p)=>a+p.n,0);console.log('state',i,'pts',tot,'of',N);return assemble(N,parts,fill)}

// crisp card overlays (drawn by film.js): window screens in K4, the fallen pile in K5
export function CARDS(){const out=[];
 for(const W of WINPOS){if(W.hide)continue;const[R,U]=winBasis(W);out.push({canvas:winCanvas(W.k).c,c:W.c,R,U,w:WIN_WH[0],h:WIN_WH[1],t:[52.6,53.6,59.4,60.2],sweep:[0,1],lift:0.012})}
 for(const q of PILE){const R=rotY([1,0,0],q.ry),U=rotY([0,0,-1],q.ry);out.push({canvas:winCanvas(q.k).c,c:[q.x,q.y,q.z],R,U,w:1.25,h:0.82,t:[62.0,62.9,67.8,68.8],sweep:[-1,0],lift:0.01,light:(T,l1,l2)=>0.42+0.3*l2})}
 // craft: the browser screen and the five stack tags
 {const b=browserPose();out.push({canvas:getCanvas('browser',1040,680,drawBrowser).c,c:b.c,R:b.R,U:b.U,w:b.w,h:b.h,t:[10.4,11.4,16.8,17.8],sweep:[1,0],lift:0.008,light:(T,l1,l2)=>0.7+0.3*l2})}
 for(const o of CRAFT){const q=tagPose(o);out.push({canvas:tagCanvas(o.tag).c,c:q.c,R:q.R,U:q.U,w:q.w,h:q.h,t:[11.0,12.0,16.8,17.8],sweep:[1,0],lift:0.006,light:(T,l1,l2)=>0.8+0.2*l2})}
 return out.concat(CARDS2())}

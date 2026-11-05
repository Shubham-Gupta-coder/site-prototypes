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

// ---- tool windows (generic, drawn) ----
function winFrame(ctx,W,H,bar){ctx.fillStyle='#16181b';rr(ctx,0,0,W,H,18);ctx.fill();ctx.fillStyle=bar;ctx.fillRect(4,4,W-8,H*0.075);for(let i=0;i<3;i++){ctx.fillStyle=['#e0605a','#e2b94b','#5fbf5a'][i];ctx.beginPath();ctx.arc(22+i*20,4+H*0.0375,6,0,7);ctx.fill()}}
const WINDOWS={
 store(ctx,W,H){winFrame(ctx,W,H,'#2b2d31');ctx.fillStyle='#f1f1f1';ctx.fillRect(4,H*0.08,W*0.22,H*0.91);ctx.fillStyle='#ffffff';ctx.fillRect(W*0.225,H*0.08,W*0.77,H*0.91);
  // bag icon + small drawn wordmark
  ctx.fillStyle='#5e8e3e';rr(ctx,W*0.03,H*0.115,W*0.045,H*0.06,5);ctx.fill();ctx.strokeStyle='#5e8e3e';ctx.lineWidth=4;ctx.beginPath();ctx.arc(W*0.0525,H*0.115,W*0.013,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#2f3b2a';ctx.font=`600 ${H*0.05}px system-ui,sans-serif`;ctx.textBaseline='middle';ctx.fillText('shopify',W*0.085,H*0.147);
  for(let i=0;i<7;i++)bars(ctx,W*0.03,H*(0.25+i*0.08),W*0.15*(0.6+0.4*((i*7)%3)/2),H*0.022,i===1?'#2f6f3a':'#9aa0a6');
  bars(ctx,W*0.26,H*0.12,W*0.25,H*0.04,'#202223');bars(ctx,W*0.82,H*0.11,W*0.14,H*0.06,'#1f6f43',6);
  for(let i=0;i<7;i++){const y=H*(0.22+i*0.105);ctx.fillStyle=i%2?'#ffffff':'#f7f7f7';ctx.fillRect(W*0.24,y,W*0.74,H*0.095);ctx.fillStyle=['#c23b3b','#2f5d8a','#d9a441','#3c7a4e','#6b4a8c','#b5653a','#2f5d8a'][i];rr(ctx,W*0.25,y+H*0.015,H*0.065,H*0.065,4);ctx.fill();
   bars(ctx,W*0.32,y+H*0.025,W*0.2,H*0.02,'#303030');bars(ctx,W*0.32,y+H*0.058,W*0.13,H*0.016,'#9aa0a6');bars(ctx,W*0.62,y+H*0.035,W*0.12,H*0.032,i%3===0?'#ffd79d':'#aee9d1');bars(ctx,W*0.78,y+H*0.035,W*0.12,H*0.032,i%2?'#ffd79d':'#e4e5e7')}},
 pay(ctx,W,H){winFrame(ctx,W,H,'#0a1a38');ctx.fillStyle='#0c2451';ctx.fillRect(4,H*0.08,W-8,H*0.91);
  ctx.fillStyle='#3395ff';ctx.beginPath();ctx.moveTo(W*0.04,H*0.2);ctx.lineTo(W*0.065,H*0.11);ctx.lineTo(W*0.08,H*0.11);ctx.lineTo(W*0.055,H*0.2);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.font=`700 ${H*0.05}px system-ui,sans-serif`;ctx.textBaseline='middle';ctx.fillText('razorpay',W*0.09,H*0.155);
  for(let i=0;i<5;i++)bars(ctx,W*0.04,H*(0.3+i*0.1),W*0.16,H*0.025,i===0?'#3395ff':'#4c6390');
  ctx.fillStyle='#f6f8fb';rr(ctx,W*0.27,H*0.14,W*0.68,H*0.78,16);ctx.fill();
  ctx.fillStyle='#16a34a';ctx.beginPath();ctx.arc(W*0.36,H*0.3,H*0.07,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(W*0.335,H*0.3);ctx.lineTo(W*0.355,H*0.33);ctx.lineTo(W*0.39,H*0.27);ctx.stroke();
  bars(ctx,W*0.45,H*0.25,W*0.32,H*0.045,'#0c2451');bars(ctx,W*0.45,H*0.32,W*0.2,H*0.028,'#8a94a6');
  // UPI style QR block
  const qx=W*0.72,qy=H*0.46,qs=H*0.36;ctx.fillStyle='#fff';ctx.fillRect(qx,qy,qs,qs);for(let i=0;i<21;i++)for(let j=0;j<21;j++){const f=(i<7&&j<7)||(i>13&&j<7)||(i<7&&j>13);const on=f?((i%6===0||j%6===0||(i>1&&i<5&&j>1&&j<5)||(i>15&&i<19&&j>1&&j<5)||(i>1&&i<5&&j>15&&j<19))&&!((i===1||i===5)&&j>0&&j<6&&false)):Math.random()<0.5;if(on){ctx.fillStyle='#0c2451';ctx.fillRect(qx+i*qs/21,qy+j*qs/21,qs/21+0.5,qs/21+0.5)}}
  for(let i=0;i<4;i++){bars(ctx,W*0.31,H*(0.48+i*0.1),W*0.18,H*0.025,'#8a94a6');bars(ctx,W*0.52,H*(0.48+i*0.1),W*0.14,H*0.025,'#0c2451')}},
 sheet(ctx,W,H){winFrame(ctx,W,H,'#1e7145');ctx.fillStyle='#f3f6f4';ctx.fillRect(4,H*0.08,W-8,H*0.08);for(let i=0;i<9;i++)bars(ctx,W*(0.03+i*0.05),H*0.105,W*0.03,H*0.03,'#7a8a80',4);
  ctx.fillStyle='#ffffff';ctx.fillRect(4,H*0.16,W-8,H*0.83);const cols=7,rows=11,cw=(W-8-W*0.05)/cols,ch=(H*0.8)/rows;
  ctx.fillStyle='#e8efe9';ctx.fillRect(4,H*0.16,W-8,ch);ctx.fillStyle='#e8efe9';ctx.fillRect(4,H*0.16,W*0.05,H*0.83);
  ctx.font=`600 ${ch*0.55}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#55665b';for(let c=0;c<cols;c++)ctx.fillText('ABCDEFG'[c],4+W*0.05+cw*(c+0.5),H*0.16+ch/2);
  for(let r=1;r<rows;r++)for(let c=0;c<cols;c++){const x=4+W*0.05+c*cw,y=H*0.16+r*ch;const bad=(r*3+c*5)%11===0,warn=(r+c*2)%13===0;if(bad){ctx.fillStyle='#f6c7c3';ctx.fillRect(x,y,cw,ch)}else if(warn){ctx.fillStyle='#fde9a8';ctx.fillRect(x,y,cw,ch)}
   bars(ctx,x+cw*0.1,y+ch*0.35,cw*(0.35+((r*7+c*3)%5)/8),ch*0.3,bad?'#a1302a':'#5b5b5b',3)}
  ctx.strokeStyle='#d5ddd7';ctx.lineWidth=1.5;for(let c=0;c<=cols;c++){ctx.beginPath();ctx.moveTo(4+W*0.05+c*cw,H*0.16);ctx.lineTo(4+W*0.05+c*cw,H);ctx.stroke()}for(let r=0;r<=rows;r++){ctx.beginPath();ctx.moveTo(4,H*0.16+r*ch);ctx.lineTo(W,H*0.16+r*ch);ctx.stroke()}
  ctx.strokeStyle='#1e7145';ctx.lineWidth=4;ctx.strokeRect(4+W*0.05+cw,H*0.16+ch*3,cw*2,ch)},
 inbox(ctx,W,H){winFrame(ctx,W,H,'#2b2d31');ctx.fillStyle='#f6f8fc';ctx.fillRect(4,H*0.08,W-8,H*0.91);
  ctx.fillStyle='#d93025';ctx.beginPath();ctx.moveTo(W*0.03,H*0.12);ctx.lineTo(W*0.1,H*0.12);ctx.lineTo(W*0.1,H*0.19);ctx.lineTo(W*0.03,H*0.19);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(W*0.03,H*0.12);ctx.lineTo(W*0.065,H*0.16);ctx.lineTo(W*0.1,H*0.12);ctx.stroke();
  bars(ctx,W*0.03,H*0.24,W*0.14,H*0.06,'#c2e7ff',12);for(let i=0;i<6;i++)bars(ctx,W*0.03,H*(0.34+i*0.07),W*0.13,H*0.022,i===0?'#d93025':'#8a8f98');
  bars(ctx,W*0.24,H*0.11,W*0.5,H*0.06,'#e9eef6',14);
  for(let i=0;i<8;i++){const y=H*(0.21+i*0.095),un=i<4||i===6;ctx.fillStyle=un?'#ffffff':'#f2f6fc';ctx.fillRect(W*0.22,y,W*0.76,H*0.088);ctx.strokeStyle='#e3e7ee';ctx.beginPath();ctx.moveTo(W*0.22,y+H*0.088);ctx.lineTo(W*0.98,y+H*0.088);ctx.stroke();
   ctx.fillStyle=un?'#f4b400':'#c4c7c5';ctx.fillRect(W*0.24,y+H*0.03,H*0.03,H*0.03);bars(ctx,W*0.29,y+H*0.03,W*0.14,H*0.025,un?'#1f1f1f':'#6b6f76');bars(ctx,W*0.47,y+H*0.03,W*0.36,H*0.025,un?'#3c4043':'#9aa0a6');bars(ctx,W*0.88,y+H*0.03,W*0.06,H*0.022,'#9aa0a6')}},
 books(ctx,W,H){winFrame(ctx,W,H,'#1d5f6e');ctx.fillStyle='#efe9d2';ctx.fillRect(4,H*0.08,W-8,H*0.91);ctx.fillStyle='#1d5f6e';ctx.fillRect(4,H*0.08,W-8,H*0.07);bars(ctx,W*0.03,H*0.1,W*0.2,H*0.03,'#e8f0f0');
  ctx.fillStyle='#d8e4e6';ctx.fillRect(W*0.78,H*0.15,W*0.21,H*0.84);for(let i=0;i<9;i++)bars(ctx,W*0.8,H*(0.2+i*0.08),W*0.15,H*0.025,i===2?'#1d5f6e':'#6d8a90');
  ctx.font=`700 ${H*0.045}px Georgia,serif`;ctx.fillStyle='#1d3a40';ctx.textBaseline='middle';ctx.fillText('Dr',W*0.5,H*0.2);ctx.fillText('Cr',W*0.65,H*0.2);
  ctx.strokeStyle='#9eb2b5';ctx.lineWidth=2;for(let i=0;i<11;i++){const y=H*(0.25+i*0.065);if(i===4){ctx.fillStyle='#f3d36b';ctx.fillRect(W*0.03,y-H*0.025,W*0.74,H*0.055)}bars(ctx,W*0.05,y-H*0.01,W*(0.18+((i*5)%4)*0.05),H*0.02,'#3a4a4c');if(i%3!==1)bars(ctx,W*0.5,y-H*0.01,W*0.08,H*0.02,'#3a4a4c');if(i%3===1)bars(ctx,W*0.65,y-H*0.01,W*0.08,H*0.02,'#7a2a20');ctx.beginPath();ctx.moveTo(W*0.03,y+H*0.03);ctx.lineTo(W*0.77,y+H*0.03);ctx.stroke()}},
};
const WSIZE=[760,500];
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
 const fw=new Part(Math.round(18000*SCALE*nScale)+10);plane(fw,getCanvas('facade',1080,630,drawFacade),16000*nScale,{c:[0,0.75,-0.02],w:18,h:10.5,edge:0.6,zj:0.04,dim});parts.push(fw);
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
function lane(parts,dim=1){const g=new Part(Math.round(9000*SCALE)+10);const cv=getCanvas('lane',440,160,drawLane);
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
function racks(parts,{dim=1,nScale=1,seed=7}={}){const p=new Part(Math.round(62000*SCALE*nScale)+50);let s=seed;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
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
function shell(parts,{dim=1,nScale=1}={}){const p=new Part(Math.round(22000*SCALE*nScale)+20);
 plane(p,getCanvas('floor',600,700,drawFloor),9000*nScale,{c:[0,-4.5,-7.2],R:[1,0,0],U:[0,0,-1],w:13,h:14.4,edge:0.4,dim});
 plane(p,getCanvas('corr',700,360,drawCorrugated),6000*nScale,{c:[0,0.4,-14.3],w:13,h:9.8,edge:0.3,dim});
 // structural column behind table + interior bulb wire
 box(p,1400*nScale,{c:[0,-0.2,-7.7],s:[0.36,8.6,0.36],dim,color:(f,u,v)=>v<0.12?C('#c9a227'):J(C('#6c7276'),0.05)});
 parts.push(p);return p}
function bulbIn(parts,{dim=1,on=1}={}){const b=new Part(Math.round(3600*SCALE)+10);tube(b,600,{pts:[[0,4.8,-5.1],[0,1.75,-5.1]],rad:0.012,color:C('#1d1c1a'),dim});
 cyl(b,1300,{c:[0,1.6,-5.1],r:0.05,r2:0.4,len:0.28,axis:'y',color:()=>C('#2e5a40'),caps:false,dim});sphere(b,1200,{c:[0,1.38,-5.1],r:0.11,color:()=>C('#ffd089'),em:on,group:10});parts.push(b)}
const TABLE={c:[0,-2.76,-5.2],s:[4.6,0.1,1.7],top:-2.71};
function table(parts,{dim=1,nScale=1}={}){const p=new Part(Math.round(14000*SCALE*nScale)+20);
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
export const WINPOS=[{k:'store',c:[-2.75,0.55,-3.3],ry:0.38,rx:0.04},{k:'pay',c:[2.75,0.6,-3.1],ry:-0.38,rx:0.04},{k:'sheet',c:[-2.45,-1.75,-2.3],ry:0.3,rx:-0.12},{k:'inbox',c:[2.5,-1.7,-2.45],ry:-0.3,rx:-0.1},{k:'books',c:[0.05,1.45,-4.6],ry:0.02,rx:0.06}];
export const WIN_WH=[2.05,1.35];
export function mobileLayout(){for(const W of WINPOS){W.c=[W.c[0]*0.52,W.c[1]*1.35+(W.c[1]<0?-0.1:0),W.c[2]];W.ry*=0.6}}
STATES.push(()=>{const parts=[];const wp=new Part(Math.round(76000*SCALE)+50);
 for(const W of WINPOS){const R=rotY(rotX([1,0,0],W.rx),W.ry),U=rotY(rotX([0,1,0],W.rx),W.ry);plane(wp,winCanvas(W.k),13600,{c:W.c,R,U,w:WIN_WH[0],h:WIN_WH[1],edge:0.9,em:0.8});
  // unread badge
  const bc=[W.c[0]+R[0]*0.98+U[0]*0.64,W.c[1]+R[1]*0.98+U[1]*0.64,W.c[2]+R[2]*0.98+U[2]*0.64+0.02];sphere(wp,500,{c:bc,r:0.07,color:()=>C(W.k==='sheet'?'#e0533a':'#f2523f'),em:1,group:4})}
 wp.at=0;parts.push(wp);
 const ph=new Part(Math.round(14000*SCALE)+20);const pc=[0,-0.85,-1.6];box(ph,2500,{c:[pc[0],pc[1],pc[2]-0.03],s:[0.66,1.36,0.05],color:(f)=>f==='pz'?C('#121315'):C('#2a2c30')});
 plane(ph,getCanvas('chat',430,890,drawChat),7000,{c:[pc[0],pc[1],pc[2]+0.001],w:0.62,h:1.3,em:0.85});
 CHAT_BUBBLES.forEach((b,i)=>plane(ph,getCanvas('bub'+i,430,890,()=>{}),900*(b.h/0.08),{c:[pc[0],pc[1],pc[2]+0.006],w:0.62,h:1.3,em:0.9}));ph.at=80000;parts.push(ph);
 racks(parts,{dim:0.22,nScale:0.55});shell(parts,{dim:0.2,nScale:0.5});table(parts,{dim:0.28,nScale:0.6});bulbIn(parts,{dim:0.6});
 return{parts,fill:fillDust([-6,-4,-8],[6,3,1],[90,100,120])}});
// K5: night shift; windows fallen flat on the packing table, ledger open, red copy strokes, clock, chair, tea
export const LEDGER5={c:[0.05,TABLE.top+0.05,-4.95],spine:0.05};
export const CLOCK5={c:[0,0.15,-7.48],r:0.62};
const PILE=[];{let s=11;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};const ks=['store','pay','sheet','inbox','books','sheet','pay','store'];
 const spots=[[-1.65,-5.35],[1.55,-5.45],[-1.5,-4.75],[1.65,-4.7],[-0.75,-5.55],[0.85,-5.6],[-2.0,-5.05],[2.0,-5.1]];
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
 const pile=new Part(Math.round(46000*SCALE)+50);PILE.forEach((q,i)=>{const R=rotY([1,0,0],q.ry),U=rotY([0,0,-1],q.ry);plane(pile,winCanvas(q.k),5200,{c:[q.x,q.y,q.z],R,U,w:1.25,h:0.82,edge:0.7,em:0.35,dim:0.85})});pile.at=0;parts.push(pile);
 // open ledger: two pages + flipping page (group 8 rotates about spine)
 const L=new Part(Math.round(16000*SCALE)+20);const lc=LEDGER5.c;
 box(L,1800,{c:[lc[0],lc[1]-0.03,lc[2]],s:[1.5,0.04,0.95],color:()=>J(C('#7a1a17'),0.05),faces:['py','pz','px','nx']});
 plane(L,ledgerPage(0),4200,{c:[lc[0]-0.37,lc[1],lc[2]],R:[1,0,0],U:[0,0,-1],w:0.72,h:0.9,edge:1});
 plane(L,ledgerPage(1),4200,{c:[lc[0]+0.37,lc[1],lc[2]],R:[1,0,0],U:[0,0,-1],w:0.72,h:0.9,edge:1});
 plane(L,ledgerPage(1),3200,{c:[lc[0]+0.37,lc[1]+0.01,lc[2]],R:[1,0,0],U:[0,0,-1],w:0.72,h:0.9,edge:1,group:8});
 // tea glass (cutting chai) on the ledger corner, half full
 cyl(L,700,{c:[lc[0]+0.62,lc[1]+0.09,lc[2]-0.3],r:0.065,r2:0.08,len:0.18,axis:'y',caps:false,color:()=>[200,210,215]});cyl(L,600,{c:[lc[0]+0.62,lc[1]+0.05,lc[2]-0.3],r:0.062,r2:0.068,len:0.09,axis:'y',color:()=>J(C('#b8742c'),0.05)});
 parts.push(L);
 // copy strokes: oxide, written trip after trip (group 5, reveal along trips)
 const S=new Part(Math.round(17000*SCALE)+20);STROKES.forEach((pts,i)=>tube(S,1350,{pts,rad:0.011,color:C('#d0502e'),group:5,r0:i/STROKES.length,r1:(i+0.98)/STROKES.length,em:0.9}));S.at=80000;parts.push(S);
 // wall clock on the column: face, rim, hands (group 6/7)
 const K=new Part(Math.round(13000*SCALE)+20);plane(K,clockCanvas(),10000,{c:CLOCK5.c,w:CLOCK5.r*2,h:CLOCK5.r*2,edge:1.2});
 tube(K,900,{pts:[[CLOCK5.c[0],CLOCK5.c[1],CLOCK5.c[2]+0.03],[CLOCK5.c[0],CLOCK5.c[1]+0.3,CLOCK5.c[2]+0.03]],rad:0.03,color:[24,20,18],group:6});
 tube(K,900,{pts:[[CLOCK5.c[0],CLOCK5.c[1],CLOCK5.c[2]+0.04],[CLOCK5.c[0],CLOCK5.c[1]+0.47,CLOCK5.c[2]+0.04]],rad:0.022,color:[24,20,18],group:7});
 parts.push(K);
 // chair pushed back (monobloc), turned away
 const ch=new Part(Math.round(5000*SCALE)+20);const cc=[1.75,-3.75,-3.35],ry=-0.75;const cw=C('#d6d0c2');
 const CB=(o,s)=>{const q=rotY(o,ry);box(ch,Math.round(1400*s[0]*s[2]+900*(s[1])),{c:[cc[0]+q[0],cc[1]+q[1],cc[2]+q[2]],s,ry,color:()=>J(cw,0.04)})};
 CB([0,0,0],[0.85,0.06,0.8]);CB([0,0.55,-0.38],[0.85,1.0,0.06]);for(const x of[-0.38,0.38])for(const z of[-0.35,0.35])CB([x,-0.38,z],[0.07,0.75,0.07]);CB([0,0.35,-0.36],[0.6,0.05,0.07]);
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

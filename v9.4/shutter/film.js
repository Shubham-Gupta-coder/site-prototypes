import * as THREE from 'three';
import {createVectorWorld} from './vector-world.js?v=v9_4a';
import {setScale,setRes,STATS} from './lib.js?v=v9_4a';
import {buildState,STATES,K,mobileLayout,CARDS as CARD_DEFS,CALSLOT,RUN,ST,GEAR0,VALVE} from './shapes.js?v=v9_4a';

if(window.__siteEarlyStopped)throw new Error('Film skipped');
const MOBILE=matchMedia('(pointer: coarse)').matches||(Math.min(innerWidth,innerHeight)<600&&innerWidth<1200);
let stopped=false,builderWorker=null,navSequence=0,headerInset=88;
const FILM_END=100; // film T 0..100 (percent of the film)
const UNIT_VH=MOBILE?20:22; // viewport heights of scroll per film unit
const NS=STATES.length, TW=2048;

/* ---------- renderer ---------- */
const canvas=document.getElementById('gl');
const gl2=canvas.getContext('webgl2',{antialias:true,powerPreference:'high-performance'});
if(!gl2||matchMedia('(prefers-reduced-motion: reduce)').matches){document.body.classList.add('nogl');throw new Error('static mode')}

/* ---------- dot tier: GPU probe picks how many dots this device draws (?dots=N forces a count) ---------- */
const TIERS=MOBILE?[131072,65536,32768]:[1310720,655360,262144,131072];
TIERS.forEach(t=>{if(t%TW)console.error("TIERS: "+t+" is not a multiple of "+TW)}); // every tier must fill whole texture rows
function gpuProbe(gl,n){ // ms for one draw of n points that fetch 3 float texels each, like the film shader
 const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o};
 const pr=gl.createProgram();
 const vs=sh(gl.VERTEX_SHADER,`#version 300 es
precision highp float;precision highp int;uniform highp sampler2D t;void main(){int id=gl_VertexID;vec4 a=texelFetch(t,ivec2(id%1024,(id/1024)%256),0);vec4 b=texelFetch(t,ivec2((id*7)%1024,(id/512)%256),0);vec4 c=texelFetch(t,ivec2((id*3)%1024,(id/256)%256),0);
vec2 p=fract(a.xy+b.zw*0.5+c.xy*0.25+vec2(float(id)*0.000123,float(id)*0.000731))*1.8-0.9;gl_Position=vec4(p,0.5+0.1*sin(a.z+b.x),1.);gl_PointSize=2.5;}`);
 const fs=sh(gl.FRAGMENT_SHADER,`#version 300 es
precision mediump float;out vec4 o;void main(){vec2 q=gl_PointCoord-0.5;if(dot(q,q)>0.25)discard;o=vec4(1.);}`);
 gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return 1e9;
 const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);const d=new Float32Array(1024*256*4);for(let i=0;i<d.length;i++)d[i]=Math.random();
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,1024,256,0,gl.RGBA,gl.FLOAT,d);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 canvas.width=Math.round(innerWidth*Math.min(devicePixelRatio||1,1.5));canvas.height=Math.round(innerHeight*Math.min(devicePixelRatio||1,1.5));gl.viewport(0,0,canvas.width,canvas.height);
 gl.useProgram(pr);gl.enable(gl.DEPTH_TEST);const run=k=>{gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.POINTS,0,k);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4))};
 run(Math.min(n,16384));run(n);const ts=[],t0s=[];for(let r=0;r<5;r++){let t0=performance.now();run(1024);t0s.push(performance.now()-t0);t0=performance.now();run(n);ts.push(performance.now()-t0)}
 gl.useProgram(null);gl.bindTexture(gl.TEXTURE_2D,null);gl.deleteTexture(tx);gl.deleteProgram(pr);gl.deleteShader(vs);gl.deleteShader(fs);gl.disable(gl.DEPTH_TEST);
 ts.sort((a,b)=>a-b);t0s.sort((a,b)=>a-b);return Math.max(0.05,ts[2]-t0s[2])}
function pickTier(gl){
 const ext=gl.getExtension('WEBGL_debug_renderer_info');const ren=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));
 const soft=/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(ren);
 // Brave and some privacy modes hide the GPU name and fake memory/core counts, so ignore those numbers there
 const masked=!!navigator.brave||!/apple|nvidia|geforce|radeon|intel|adreno|mali|powervr|rtx|\barc\b|amd/i.test(ren);
 const mac=/Macintosh|Mac OS X/.test(navigator.userAgent)&&!('ontouchend' in document&&navigator.maxTouchPoints>1);
 const maxTex=gl.getParameter(gl.MAX_TEXTURE_SIZE),mem=masked?0:(navigator.deviceMemory||0),cores=masked?0:(navigator.hardwareConcurrency||0);
 let cap=TIERS[0];const why=[];
 if(soft){cap=TIERS[TIERS.length-1];why.push('software renderer')}
 if(maxTex<8192){cap=Math.min(cap,MOBILE?65536:262144);why.push('maxTex '+maxTex)}
 if(mem&&mem<4){cap=Math.min(cap,MOBILE?32768:262144);why.push('deviceMemory '+mem)}
 if(mem&&mem<=2){cap=Math.min(cap,MOBILE?32768:131072)}
 if(cores&&cores<=4){cap=Math.min(cap,MOBILE?65536:655360);why.push('cores '+cores)}
 const n=soft?32768:(MOBILE?65536:262144);let ms=0;try{ms=gpuProbe(gl,n)}catch(e){ms=1e9}
 // the film shader does ~3x the probe's work per dot; keep the swarm under ~7 ms (desktop) / 6 ms (phone) of GPU time
 const per=ms/n*3,budget=MOBILE?6:7;let N=TIERS[TIERS.length-1];
 for(const t of TIERS)if(t<=cap&&per*t<budget){N=t;break}
 const strong=!MOBILE&&!soft&&(mac||/apple|nvidia|geforce|radeon|rtx|\barc\b/i.test(ren));if(strong&&N<655360&&cap>=655360){N=655360;why.push('strong gpu floor')}
 const q=+new URLSearchParams(location.search).get('dots');let forced=false;
 if(q>0){N=Math.min(4194304,Math.max(8192,Math.round(q/TW)*TW));forced=true}
 return {N,ren,soft,masked,mac,maxTex,mem,cores,probeMs:+ms.toFixed(2),probeN:n,cap,why,forced}}
const TIER=pickTier(gl2);const N=TIER.N,ROWS=N/TW,SCALE=N/131072,RES=SCALE>2?Math.min(2,Math.sqrt(SCALE/2)):1;
setScale(SCALE);setRes(RES);if(MOBILE)mobileLayout();
console.info('dots',N,'tier',JSON.stringify(TIER));
const renderer=new THREE.WebGLRenderer({canvas,context:gl2,antialias:true});
renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.autoClear=true;
let DPR=Math.min(devicePixelRatio||1,1.5);if(MOBILE)DPR=Math.min(DPR,1.25);
renderer.setPixelRatio(DPR);
const scene=new THREE.Scene();
const vectors=createVectorWorld(scene,renderer);
window.__vectors=vectors;
const camera=new THREE.PerspectiveCamera(MOBILE?50:35,innerWidth/innerHeight,0.05,200);

/* ---------- state textures: a ring of NSLOT layers; every state when it fits, else the ones near the reader ---------- */
const NSLOT=Math.min(NS,Math.max(4,Math.floor(56e6/(N*20))));
const posTex=new THREE.DataArrayTexture(new Float32Array(N*4*NSLOT),TW,ROWS,NSLOT);posTex.format=THREE.RGBAFormat;posTex.type=THREE.FloatType;
const colTex=new THREE.DataArrayTexture(new Uint8Array(N*4*NSLOT),TW,ROWS,NSLOT);colTex.format=THREE.RGBAFormat;colTex.type=THREE.UnsignedByteType;
for(const t of[posTex,colTex]){t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.unpackAlignment=4}
const slotOf=new Int16Array(NS).fill(-1),slotSt=new Int16Array(NSLOT).fill(-1),slotUse=new Float64Array(NSLOT);
const BUILD_MS=new Array(NS).fill(0),everBuilt=new Set();let built=0,ready=false,busy=-1,builder=null;const pending=new Map(),pinned=new Set();
let pT=0,vT=0,frozen=false,closeK=0;
function segAt(T){let s=0;for(let i=0;i<SEG.length;i++)if(T>=SEG[i].t0)s=i;return s}
function wantAt(T){const s=segAt(T),L=[SEG[s].A,SEG[s].B];if(s+1<SEG.length)L.push(SEG[s+1].B);if(s>0)L.push(SEG[s-1].A);return L}
function install(i,P,C,ms){const need=new Set([...pinned,...wantAt(pT)]);let s=slotSt.indexOf(-1);
 if(s<0){let bu=Infinity;for(let k=0;k<NSLOT;k++)if(!need.has(slotSt[k])&&slotUse[k]<bu){bu=slotUse[k];s=k}
  if(s<0){for(let k=0;k<NSLOT;k++)if(slotUse[k]<bu){bu=slotUse[k];s=k}}slotOf[slotSt[s]]=-1}
 posTex.image.data.set(P,s*N*4);colTex.image.data.set(C,s*N*4);posTex.addLayerUpdate(s);colTex.addLayerUpdate(s);posTex.needsUpdate=colTex.needsUpdate=true;
 slotSt[s]=i;slotOf[i]=s;slotUse[s]=performance.now();BUILD_MS[i]=ms;if(!everBuilt.has(i)){everBuilt.add(i);built=everBuilt.size}
 const w=pending.get(i);if(w){pending.delete(i);w.forEach(f=>f())}}
function pump(){if(stopped||busy>=0||!builder)return;const L=[...pinned,...wantAt(pT)];let nx=L.find(i=>slotOf[i]<0);
 if(nx===undefined&&NSLOT>=NS)for(let i=0;i<NS;i++)if(slotOf[i]<0){nx=i;break}
 if(nx===undefined){if(NSLOT>=NS&&built>=NS)document.body.classList.add('built');return}
 busy=nx;builder(nx)}
function done(i,P,C,ms){if(stopped)return;busy=-1;install(i,P,C,ms);pump()}
function ensure(list){return Promise.all(list.map(i=>slotOf[i]>=0?null:new Promise(r=>{if(!pending.has(i))pending.set(i,[]);pending.get(i).push(r)}))).then(()=>{})}
function mainBuilder(i){setTimeout(()=>{const t0=performance.now();const {P,C}=buildState(i,N);done(i,P,C,Math.round(performance.now()-t0))},0)}
function startBuilder(){return new Promise(res=>{let w=null,ok=false;const fall=()=>{if(ok)return;ok=true;try{w&&w.terminate()}catch(e){}builder=mainBuilder;console.info('builder: main thread');res()};
 try{if(typeof OffscreenCanvas==='undefined')throw 0;w=new Worker(new URL('./worker.js?v=v9_4a',import.meta.url),{type:'module'});builderWorker=w;
  w.onerror=fall;w.onmessage=e=>{const m=e.data;if(m.ready){if(ok)return;ok=true;builder=i=>w.postMessage({i});console.info('builder: worker');res();return}
   if(m.stat)STATS[m.i]=m.stat;done(m.i,m.P,m.C,m.ms)};
  w.postMessage({init:1,N,scale:SCALE,res:RES,mobile:MOBILE,fonts:[{f:'Big Shoulders Display',u:new URL('./fonts/BigShouldersDisplay.woff?v=v9_4a',import.meta.url).href,w:'100 900'}]});setTimeout(fall,15000)}catch(e){fall()}})}

const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));
geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e4);
const U={uVector:{value:new Float32Array(18)},uPos:{value:posTex},uCol:{value:colTex},uA:{value:0},uB:{value:0},uW:{value:0},
 uSwO:{value:new THREE.Vector3()},uSwD:{value:new THREE.Vector3(1,0,0)},uSwM:{value:0},uSpread:{value:1},uNoise:{value:0},
 uRev:{value:new Array(16).fill(1)},uWin:{value:new Array(16).fill(9)},uAngH:{value:0},uAngM:{value:0},uPage:{value:0},
 uClock:{value:new THREE.Vector3(...GEAR0)},uSpine:{value:new THREE.Vector3(0,-50,0)},
 uDust:{value:1},uTime:{value:0},uSize:{value:0.02},uPx:{value:1000},uDrop:{value:0},uSzK:{value:Math.pow(131072/N,0.42)},uMinPx:{value:N>262144?1.0:1.2},
 uBulb:{value:new THREE.Vector3(0,5.66,1.1)},uBulbI:{value:0},uBulb2:{value:new THREE.Vector3(0,3.2,1.5)},uBulb2I:{value:0},
 uAmb:{value:new THREE.Vector3(.1,.12,.18)},uEmK:{value:1},uProc:{value:new THREE.Vector3(.8,.88,1)},
 uArc:{value:new THREE.Vector3()},uSnap:{value:new THREE.Vector3()},uAxes:{value:0},uUseB:{value:0},
 uOff:{value:Array.from({length:8},()=>new THREE.Vector3())},uFlow:{value:new Array(4).fill(0)},uFlowK:{value:new Array(4).fill(6)}};
const VS=`precision highp float;precision highp int;
uniform highp sampler2DArray uPos;uniform highp sampler2DArray uCol;uniform int uA,uB;uniform float uW,uSpread,uNoise,uSwM,uAxes,uUseB;uniform vec3 uSwO,uSwD,uArc,uSnap;
uniform float uVector[18];uniform float uDust;
uniform float uRev[16];uniform float uWin[16];uniform float uAngH,uAngM,uPage,uTime,uSize,uPx,uDrop,uBulbI,uBulb2I,uEmK,uSzK,uMinPx;
uniform vec3 uClock,uSpine,uBulb,uBulb2,uAmb,uProc;uniform vec3 uOff[8];uniform float uFlow[4];uniform float uFlowK[4];
out vec3 vC;out float vA;
float h1(float n){return fract(sin(n*12.9898)*43758.5453);}
vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}
vec3 xf(vec3 p,int g){
 if(g==6){p.xy=uClock.xy+rot(p.xy-uClock.xy,-uAngH);}
 else if(g==7){p.xy=uClock.xy+rot(p.xy-uClock.xy,-uAngM);}
 else if(g==8){vec2 q=vec2(p.x-uSpine.x,p.y-uSpine.y);q=rot(q,uPage);p.x=uSpine.x+q.x;p.y=uSpine.y+q.y+0.01;}
 else if(g>=16&&g<24){p+=uOff[g-16];}
 return p;}
float vis(int g,float r){
 if(g>=24&&g<28){int k=g-24;return step(fract(r*uFlowK[k]-uFlow[k]),0.16)*step(0.001,uFlow[k]);}
 if(g<2||g>15)return 1.0;float R=uRev[g];return (r<=R&&r>=R-uWin[g])?1.0:0.0;}
void main(){
 int id=gl_VertexID;float h3=h1(float(id)*2.11+7.);
 if(h3<uDrop){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;vC=vec3(0.);vA=0.;return;} // adaptive quality thins the swarm before any texture work
 ivec3 ia=ivec3(id%${TW},id/${TW},uA),ib=ivec3(id%${TW},id/${TW},uB);
 vec4 A=texelFetch(uPos,ia,0),B=texelFetch(uPos,ib,0);vec4 cA=texelFetch(uCol,ia,0),cB=texelFetch(uCol,ib,0);
 int gA=int(floor(A.w)),gB=int(floor(B.w));float rA=fract(A.w),rB=fract(B.w);
 vec3 pA=xf(A.xyz,gA),pB=xf(B.xyz,gB);
 float hh=h1(float(id)*0.618+0.1),h2=h1(float(id)*1.37+3.);
 // ordered sweep: the front passes through the object along a direction (or radius); small per-dot jitter keeps the edge soft
 vec3 S=uUseB>0.5?B.xyz:A.xyz;
 float d=uSwM<0.5?dot(S-uSwO,uSwD):length(S-uSwO)*uSwD.x;d=clamp(d,0.,1.)*0.9+hh*0.1;
 float t=clamp(uW*(1.+uSpread)-d*uSpread,0.,1.);float ts=t*t*(3.-2.*t);
 float mid=sin(3.14159*t);
 vec3 w3=vec3(ts);
 if(uAxes>0.5){w3=vec3(smoothstep(0.2,0.75,t),smoothstep(0.,0.55,t),smoothstep(0.45,1.,t));}
 else if(uAxes<-0.5){w3=vec3(smoothstep(0.,0.55,t),smoothstep(0.45,1.,t),smoothstep(0.2,0.75,t));}
 vec3 p=pA+(pB-pA)*w3;
 p+=uArc*mid*(0.65+0.35*hh);
 // lattice: travelling dots slide onto grid lines (only on the snapped axes)
 vec3 q=p;if(uSnap.x>0.)q.x=floor(p.x/uSnap.x+0.5)*uSnap.x;if(uSnap.y>0.)q.y=floor(p.y/uSnap.y+0.5)*uSnap.y;if(uSnap.z>0.)q.z=floor(p.z/uSnap.z+0.5)*uSnap.z;
 p=mix(p,q,clamp(mid*1.8,0.,1.)*0.9);
 vec3 n=vec3(sin(A.y*1.3+h2*6.283+t*3.),sin(A.z*1.1+h3*6.283+t*2.),sin(A.x*1.2+hh*6.283+t*2.5));
 p+=n*mid*uNoise*(0.4+hh);
 if(gA==1||gB==1)p+=vec3(sin(uTime*.21+hh*40.),sin(uTime*.17+h2*40.),cos(uTime*.19+h3*40.))*0.035;
 float va=vis(gA,rA)*(gA==1?.16*uDust:1.),vb=vis(gB,rB)*(gB==1?.16*uDust:1.);
 // Domain tags 28..44 identify only surfaces replaced by actual SVG solids.
 float fa=(gA>=28&&gA<45)?uVector[gA-28]:(gA==24?uVector[17]:(gA>=15&&gA<=18?uVector[8]:0.));
 float fb=(gB>=28&&gB<45)?uVector[gB-28]:(gB==24?uVector[17]:(gB>=15&&gB<=18?uVector[8]:0.));
 float a=mix(va*(1.-fa),vb*(1.-fb),ts);
 vec3 alb=mix(cA.rgb,cB.rgb,ts);float em=mix(cA.a,cB.a,ts);
 alb=mix(alb,uProc,mid*0.14);
 float d1=distance(p,uBulb),d2=distance(p,uBulb2);
 vec3 warm=vec3(.86,.95,1.);
 vec3 lit=uAmb+warm*(uBulbI*1.7/(1.+d1*d1*0.03)+uBulb2I*1.7/(1.+d2*d2*0.035));
 vec3 col=alb*mix(lit,vec3(uEmK*1.15),em);
 int g=t<0.5?gA:gB;
 if(g==4)col*=0.55+0.75*step(0.45,fract(uTime*0.7+hh));
 if(g==12)col*=0.35+0.9*step(0.5,fract(uTime*(0.35+hh*0.6)+h2));
 if(g==9)col=alb*(0.18+1.5*uBulbI);if(g==10)col=alb*(0.18+1.5*uBulb2I);
 vC=col;vA=a;
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 float sz=uSize*(0.75+0.5*h2)*(g==1?0.45:1.)*(1.+em*0.2)*(g==12?1.6:1.);
 gl_PointSize=clamp(sz*uSzK*uPx/-mv.z,uMinPx,9.);
 if(a<0.01)gl_Position=vec4(2.,2.,2.,1.);
}`;
const FS=`precision highp float;in vec3 vC;in float vA;out vec4 o;
void main(){vec2 q=gl_PointCoord-0.5;float r=dot(q,q);if(r>0.25)discard;
 if(vA<0.99){float n=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);if(vA<n)discard;}
 o=vec4(vC*(1.04-r*0.7),1.);}`;
const mat=new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms:U,vertexShader:VS,fragmentShader:FS,depthTest:true,depthWrite:true});
const points=new THREE.Points(geo,mat);points.frustumCulled=false;scene.add(points);

/* background: night lane / warm interior / blueprint, bulb glow and beam */
const BG={uTop:{value:new THREE.Vector3()},uBot:{value:new THREE.Vector3()},uGlow:{value:new THREE.Vector3(0.5,0.9,0)},uRes:{value:new THREE.Vector2(1,1)},uBeam:{value:0}};
const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms:BG,depthTest:false,depthWrite:false,
 vertexShader:`out vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.);}`,
 fragmentShader:`precision highp float;in vec2 vUv;out vec4 o;uniform vec3 uTop,uBot,uGlow;uniform vec2 uRes;uniform float uBeam;
 void main(){
 vec2 p=(vUv-.5)*vec2(uRes.x/uRes.y,1.);
 vec3 c=mix(vec3(.022,.046,.063),vec3(.008,.018,.030),smoothstep(.05,.95,vUv.y));
 float horizon=exp(-pow((vUv.y-.36)*5.,2.));
 float softbox=exp(-pow((p.x+.48)*1.25,2.)-pow((vUv.y-.64)*3.,2.));
 c+=vec3(.025,.045,.058)*horizon+vec3(.023,.032,.038)*softbox;
 o=vec4(c,1.);}` }));
bg.frustumCulled=false;bg.renderOrder=-1;scene.add(bg);

const V=(...a)=>new THREE.Vector3(...a);
/* ---------- cards: crisp UI screens the dots assemble into and dissolve out of ---------- */
const CARD_VS=`out vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const CARD_FS=`precision highp float;in vec2 vUv;out vec4 o;uniform sampler2D map;uniform float uK,uL;uniform vec2 uCells,uDir;
void main(){vec2 g=vUv*uCells;vec2 ci=floor(g);vec2 f=fract(g)-0.5;float h=fract(sin(dot(ci,vec2(12.9898,78.233)))*43758.5453);
 float s=clamp(dot((ci+0.5)/uCells-0.5,uDir)+0.5,0.,1.);float r=clamp((uK*1.35-(s*0.75+h*0.25))*5.,0.,1.);
 if(r<1.&&length(f)>r*0.74)discard;o=vec4(texture(map,vUv).rgb*uL,1.);}`;
const CARDS=[];const maxAniso=renderer.capabilities.getMaxAnisotropy();
function ramp(a,b,T){return Math.min(1,Math.max(0,(T-a)/(b-a)))}
for(const d of CARD_DEFS()){
 const replaced=d.t[0]===57.2?7:(d.t[0]>=41&&d.t[0]<=47)?8:-1;
 const tex=new THREE.CanvasTexture(d.canvas);tex.colorSpace=THREE.NoColorSpace;tex.anisotropy=Math.min(8,maxAniso);tex.generateMipmaps=true;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const u={map:{value:tex},uK:{value:0},uL:{value:1},uCells:{value:new THREE.Vector2(Math.round(d.w/0.018),Math.round(d.h/0.018))},uDir:{value:new THREE.Vector2(...(d.sweep||[0,-1]))}};
 const m=new THREE.Mesh(new THREE.PlaneGeometry(d.w,d.h),new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms:u,vertexShader:CARD_VS,fragmentShader:CARD_FS,side:THREE.DoubleSide}));
 const R=V(...d.R).normalize(),Up=V(...d.U).normalize(),Nn=V().crossVectors(R,Up).normalize();
 m.matrixAutoUpdate=false;m.matrix.makeBasis(R,Up,Nn).setPosition(V(...d.c).addScaledVector(Nn,d.lift??0.012));m.matrixWorldNeedsUpdate=true;m.visible=false;scene.add(m);
 const [a0,a1,b0,b1]=d.t,t2=d.t2;
 CARDS.push({update(T,l1,l2){let k=Math.min(ramp(a0,a1,T),1-ramp(b0,b1,T));if(t2)k=Math.max(k,Math.min(ramp(t2[0],t2[1],T),1-ramp(t2[2],t2[3],T)));if(replaced>=0)k*=1-U.uVector.value[replaced];m.visible=k>0.001;if(!m.visible)return;u.uK.value=k;
  u.uL.value=d.light?d.light(T,l1,l2):1}});
}

/* ---------- timeline: everything is f(T) ---------- */
function lin(keys,T){if(T<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(T<=keys[i][0]){const[a,va]=keys[i-1],[b,vb]=keys[i];const f=(T-a)/(b-a);return va+(vb-va)*f}return keys[keys.length-1][1]}
function linV(keys,T,out){if(T<=keys[0][0])return out.copy(keys[0][1]);for(let i=1;i<keys.length;i++)if(T<=keys[i][0]){const[a,va]=keys[i-1],[b,vb]=keys[i];return out.copy(va).lerp(vb,(T-a)/(b-a))}return out.copy(keys[keys.length-1][1])}
const _m0=V(),_m1=V(),_t=V();
function tanInto(keys,k,out){const n=keys.length,a=keys[Math.max(0,k-1)],b=keys[Math.min(n-1,k+1)];return out.copy(b[1]).sub(a[1]).multiplyScalar(1/(b[0]-a[0]))}
function spline(keys,T,out){ // cubic Hermite, Catmull-Rom tangents (never stops between keys); allocation free
 const n=keys.length;if(T<=keys[0][0])return out.copy(keys[0][1]);if(T>=keys[n-1][0])return out.copy(keys[n-1][1]);
 let i=1;while(keys[i][0]<T)i++;const[t0,p0]=keys[i-1],[t1,p1]=keys[i];const h=t1-t0,s=(T-t0)/h;
 tanInto(keys,i-1,_m0).multiplyScalar(h);tanInto(keys,i,_m1).multiplyScalar(h);const s2=s*s,s3=s2*s;
 out.copy(p0).multiplyScalar(2*s3-3*s2+1).addScaledVector(_m0,s3-2*s2+s).addScaledVector(p1,-2*s3+3*s2).addScaledVector(_m1,s3-s2);return out}
const CAM=[[0,V(0,2.2,17)],[3.5,V(0,1.95,12.6)],[6.5,V(0,1.85,10.4)],[9,V(0,4.2,13.5)],[11.5,V(0,10,24)],[13.5,V(-5,9,10)],[15.5,V(-9,7.6,4.2)],[17.2,V(1.5,9.2,1.5)],[18.8,V(7.6,6.8,3.4)],
 [20.3,V(9,4.4,15.6)],[21.8,V(-9,4.4,15.6)],[23.5,V(4,10,21)],[26,V(0,7,13.5)],[28,V(-.7,4.8,11.6)],[31,V(.6,4.4,10.8)],[34,V(1.1,4.2,10.5)],
 [36,V(-2,5,14)],[38.5,V(-5.6,3.9,12.6)],[41.6,V(-5.3,3.9,12.2)],[43.2,V(0,3.8,12.6)],[46.8,V(0.3,3.8,12.2)],[48.2,V(6,3.7,12.6)],[51,V(6.3,3.6,12.2)],
 [53,V(3,6,20)],[56,V(0,8.5,34)],[59,V(0,8.6,38)],[62,V(-0.6,6.6,33.5)],[64,V(0,7.2,34)],[66.5,V(0,30,31)],[69,V(0,58,17.5)],[73,V(0,56,16)],
 [75,V(0,40,27)],[78,V(0,12.5,23)],[80.5,V(0,8.2,15.5)],[83,V(-3,6.2,10.5)],[85.5,V(2,4.6,11.2)],[88,V(0,8,22)],[91.5,V(-7,15,31)],[95.5,V(-4,23,39)],[100,V(0,27,43)]];
const LOOK=[[0,V(0,1.7,0)],[3.5,V(0,1.65,0)],[6.5,V(0,1.6,0)],[9,V(0,0.9,0)],[11.5,V(0,1.2,-2)],[13.5,V(-12,3.2,-8)],[15.5,V(-13,3.6,-9)],[17.2,V(12,3.6,-8)],[18.8,V(13,4,-9)],
 [20.3,V(11,2.8,7)],[21.8,V(-11,2.8,7)],[23.5,V(0,1,0)],[26,V(0,1.2,0)],[28,V(0,2.6,-.5)],[31,V(0,2.7,-.6)],[34,V(0,2.7,-.8)],
 [36,V(-3,2.6,4)],[38.5,V(-5.6,3.5,4.5)],[41.6,V(-5.3,3.5,4.5)],[43.2,V(0,3.4,4.5)],[46.8,V(0.3,3.4,4.5)],[48.2,V(6,3.3,4.5)],[51,V(6.3,3.2,4.5)],
 [53,V(2,3,4)],[56,V(0,3.5,8)],[59,V(0,3.6,10)],[62,V(0,3.5,16)],[64,V(0,3,14)],[66.5,V(0,0,6)],[69,V(0,0,3.6)],[73,V(0,0,3.6)],
 [75,V(0,0,2)],[78,V(0,1.5,0)],[80.5,V(0,2.2,0)],[83,V(0,3.2,-0.6)],[85.5,V(0,2.0,3)],[88,V(0,4.6,0)],[91.5,V(0,5,0)],[95.5,V(0,4.2,0)],[100,V(0,3.6,1)]];
// morph segments. sweep: lin = dot(p-o,dir), rad = |p-o|*dir.x. spread: how sharp the travelling front is.
// arc: lift along the path at mid flight. snap: per-axis lattice the dots slide along in flight. axes: staged per-axis moves (1: y first, -1: y last).
const S=(A,B,t0,t1,mode,o,dir,spread,noise,x={})=>({A,B,t0,t1,mode,o,dir,spread,noise,arc:x.arc||V(),snap:x.snap||V(),axes:x.axes||0,useB:x.useB?1:0});
const SEG=[
 S(K.ash,K.forge,0,4,0,V(-8,0,0),V(1/16,0,0),2.2,0.3),                                              // dust settles into the plate, left to right
 S(K.forge,K.world,7,12,1,V(0,1,0),V(1/24,0,0),3.0,0.02,{axes:-1,useB:1}),                         // plate sinks into the hub; territories rise outward, height last
 S(K.world,K.citadel,22,27,1,V(0,1,0),V(1/20,0,0),2.5,0.01,{useB:1}),                              // bridges lock from the hub out, the core rises
 S(K.citadel,K.runs,35,40,0,V(-12,0,0),V(1/24,0,0),3.0,0.02,{arc:V(0,0.6,0),axes:1}),               // trains leave the ring for the viaduct, left to right
 S(K.runs,K.outer,52.4,56.8,1,V(0,2,0),V(1/30,0,0),4.0,0.01,{arc:V(0,0.5,0),axes:1,useB:1}),           // the cards cool and drift out into separate islands
 S(K.outer,K.etch,64,69,0,V(0,10,0),V(0,-1/10,0),2.5,0.01,{axes:1}),                               // everything falls flat into one drawing, tallest first
 S(K.etch,K.live,74,79,1,V(0,0,0),V(1/24,0,0),2.5,0.01,{axes:-1,useB:1}),                          // the drawing stands up and runs; islands dock
 S(K.live,K.whole,86.4,92,1,V(0,9,0),V(1/12,0,0),3.0,0.0,{arc:V(0,0.8,0),useB:1})];                // a halo of light rises over the hub and threads down to every part
// sanity check (dev aid, no effect on the picture): SEG must chain A->B->B... in time order, and every state should be used
SEG.forEach((g,i)=>{if(g.A==null||g.B==null||g.A<0||g.B>=NS)console.warn('SEG',i,'unknown state',g.A,g.B);if(!(g.t1>g.t0))console.warn('SEG',i,'t1 must be > t0');
 if(i&&g.A!==SEG[i-1].B)console.warn('SEG',i,'starts from',g.A,'but the previous segment ends on',SEG[i-1].B);if(i&&g.t0<SEG[i-1].t1)console.warn('SEG',i,'overlaps the previous segment')});
{const used=new Set(SEG.flatMap(g=>[g.A,g.B]));const un=Object.keys(K).filter(n=>!used.has(K[n]));if(un.length)console.warn('states built but not in SEG:',un.join(', '))}
const SIZE=[[0,0.03],[4,0.028],[7,0.028],[12,0.05],[22,0.05],[27,0.034],[35,0.032],[40,0.024],[52,0.024],[58,0.05],[64,0.05],[69,0.095],[74,0.095],[79,0.045],[86,0.04],[92,0.04],[100,0.044]];
const BULB1=[[0,0.25],[3,0.9],[6,1],[12,0.8],[22,0.8],[27,1],[35,1],[40,0.9],[52,0.9],[58,0.55],[64,0.55],[68,0],[74,0],[79,0.9],[90,1],[100,1]];
const BULB2=[[0,0],[12,0],[22,0.2],[27,1],[35,1],[40,0.4],[52,0.4],[58,0.8],[64,0.8],[68,0],[74,0],[79,1],[88,1],[100,1]];
const BULBP=[[0,V(0,4.6,4.5)],[7,V(0,4.6,4.5)],[12,V(0,9,5)],[35,V(0,9,5)],[38,V(0,7,10)],[52,V(0,7,10)],[58,V(0,9,14)],[86,V(0,9,8)],[90,V(0,8.5,9)],[100,V(0,8.5,9)]];
const AMB=[[0,V(.14,.15,.19)],[7,V(.16,.17,.2)],[12,V(.5,.52,.58)],[35,V(.5,.52,.58)],[40,V(.45,.47,.53)],[52,V(.45,.47,.53)],[58,V(.42,.45,.55)],[64,V(.42,.45,.55)],[69,V(.6,.65,.75)],[74,V(.6,.65,.75)],[79,V(.5,.5,.52)],[86,V(.5,.5,.52)],[92,V(.45,.46,.5)],[100,V(.45,.46,.5)]];
const TOP=[[0,V(.03,.03,.04)],[7,V(.045,.037,.03)],[12,V(.035,.045,.065)],[52,V(.035,.045,.065)],[58,V(.03,.04,.07)],[64,V(.03,.04,.07)],[69,V(.03,.07,.13)],[74,V(.03,.07,.13)],[79,V(.045,.04,.045)],[100,V(.035,.035,.045)]];
const BOT=[[0,V(.008,.008,.01)],[12,V(.01,.012,.018)],[64,V(.01,.012,.02)],[69,V(.01,.025,.05)],[74,V(.01,.025,.05)],[79,V(.012,.01,.01)],[100,V(.01,.01,.012)]];
const MCY=[[0,0],[23,0],[26.5,3.2],[35,3.2],[38,0],[100,0]];
const MK=[[0,2.2],[7,2.3],[10,1.6],[12,1.25],[23,1.25],[27,1.5],[35,1.5],[38,1.15],[52,1.15],[58,1.5],[64,1.5],[69,1.3],[74,1.3],[79,1.3],[86,1.3],[90,1.3],[100,1.38]];
const sstep=k=>k*k*(3-2*k);
const _bp=V(),_env0=V(ST.ledger[0],ST.ledger[1]+0.3,ST.ledger[2]),_envB=V(ST.valve[0]-0.65,ST.valve[1],ST.valve[2]+0.05),_wave=V(RUN.x[0],RUN.y+2.1,RUN.z-0.2);
const HOOKS=[ // per-scene uniform drivers (offsets, flows, gear turn), each a pure function of T
 (T,U)=>{linV(BULBP,T,_bp);U.uBulb.value.copy(_bp)},
 (T,U)=>{const o=U.uOff.value;o[0].set(0,0,0.55*sstep(ramp(44.6,45.4,T)));
  const e1=sstep(ramp(47.4,48.2,T)),e2=sstep(ramp(49.6,50.6,T));o[1].set((_env0.x-_envB.x)*(1-e1)+3.2*e2,(_env0.y-_envB.y)*(1-e1)+0.4*e2,(_env0.z-_envB.z)*(1-e1));
  const e=sstep(ramp(40.4,41.4,T));o[2].set((_wave.x-CALSLOT[0])*(1-e),(_wave.y-CALSLOT[1])*(1-e),(_wave.z-CALSLOT[2])*(1-e))},
 (T,U)=>{const f=U.uFlow.value,FK=U.uFlowK.value;FK[0]=5;f[0]=T>22&&T<37?0.01+(T-22)*1.2:T>56&&T<92?0.01+(T-56)*1.2:0;U.uAngH.value=T*0.12;U.uAngM.value=0}];
const MLY=[[0,0],[100,0]],MLX=[[0,0],[100,0]];
const REV={13:[[0,0.25],[9,0.25],[13,0.45],[21.5,0.5],[26,1]],11:[[0,0],[67.5,0],[72,1]],15:[[0,0],[48.6,0],[49.1,1]]};

/* ---------- DOM type anchored to the 3D scene ---------- */
const TXT=[...document.querySelectorAll('[data-t]')].map(el=>{const[a,b]=el.dataset.t.split(',').map(Number);const src=(MOBILE&&el.dataset.manchor)||el.dataset.anchor;const an=src?V(...src.split(',').map(Number)):null;
 return{el,a,b,an,dx:+(el.dataset.dx||0),dy:+(el.dataset.dy||0),w:0,h:0,on:-1,span:+(el.dataset.span||0),w100:0,fs:0}});
const RAMP=0.55;
function txtOp(t,T){if(T<t.a||T>t.b)return 0;return Math.min(1,(T-t.a)/RAMP,(t.b-T)/RAMP)}
function measure(){for(const t of TXT){if(t.span){const v=t.el.style.visibility;t.el.style.fontSize='100px';t.w100=t.el.offsetWidth;t.fs=100}t.w=t.el.offsetWidth;t.h=t.el.offsetHeight}}
const _fa=V(),_fb=V();
// settle: if the reader stops inside a fade, ease to the nearest fully-visible edge
export function settleT(T){for(const t of TXT){if(T>t.a&&T<t.a+RAMP)return (T-t.a<RAMP*0.5)?t.a-0.01:t.a+RAMP+0.01;if(T<t.b&&T>t.b-RAMP)return (t.b-T<RAMP*0.5)?t.b+0.01:t.b-RAMP-0.01}return T}

/* ---------- scroll: Lenis + critically damped spring ---------- */
const spacer=document.getElementById('spacer');const stableHeight=()=>document.getElementById('viewport-unit')?.getBoundingClientRect().height||innerHeight;let VH=stableHeight(),VW=innerWidth;
function layout(){VH=stableHeight();spacer.style.height=(FILM_END*UNIT_VH+130)+(CSS.supports('height','1svh')?'svh':'vh');}
layout();
let lenis=null;try{lenis=new window.Lenis({lerp:0.1,smoothWheel:true,syncTouch:false});}catch(e){}
const filmPx=()=>FILM_END*UNIT_VH/100*VH;
function targetT(){const y=lenis?lenis.animatedScroll:scrollY;return Math.min(FILM_END,Math.max(0,y/filmPx()*FILM_END))}
function closeTarget(){const y=lenis?lenis.animatedScroll:scrollY;return Math.min(1,Math.max(0,(y-filmPx())/(0.75*VH)))}
let still=0,lastY=-1;

const close=null,intro=document.getElementById('intro');let introO=-1;
const tmpV=V(),tmpL=V(),proj=V();
function frame(T,cK,time){
 window.__shell?.update(T); // existing smoothed film position; no second animation clock
 U.uTime.value=T; // all film animation, including atmosphere, is scroll-derived
 U.uVector.value.set(vectors.update(T));U.uDust.value=1-.84*ramp(6,12,T);
 // morph segment
 let A=0,B=1,W=0,seg=SEG[0];
 for(const g of SEG){if(T>=g.t0){A=g.A;B=g.B;W=Math.min(1,(T-g.t0)/(g.t1-g.t0));seg=g}}
 if(W>=1){A=B;W=0}
 // residency: a state that is not built yet holds the morph on the nearest one that is
 let sA=slotOf[A],sB=slotOf[B];
 if(sA>=0&&sB<0){sB=sA;W=0}else if(sA<0&&sB>=0){sA=sB;W=0}
 else if(sA<0){let bd=99;for(let i=0;i<NS;i++)if(slotOf[i]>=0&&Math.abs(i-A)<bd){bd=Math.abs(i-A);sA=sB=slotOf[i]}W=0}
 points.visible=sA>=0;if(sA>=0){const now=performance.now();slotUse[sA]=now;slotUse[sB]=now}
 U.uA.value=Math.max(0,sA);U.uB.value=Math.max(0,sB);U.uW.value=W;U.uSwM.value=seg.mode;U.uSwO.value.copy(seg.o);U.uSwD.value.copy(seg.dir);U.uSpread.value=seg.spread;U.uNoise.value=seg.noise;
 U.uArc.value.copy(seg.arc);U.uSnap.value.copy(seg.snap);U.uAxes.value=seg.axes;U.uUseB.value=seg.useB;
 for(const f of HOOKS)f(T,U,time);
 for(const g in REV)U.uRev.value[g]=lin(REV[g],T);
 const b1=lin(BULB1,T),b2=lin(BULB2,T);U.uBulbI.value=b1;U.uBulb2I.value=b2;
 linV(AMB,T,U.uAmb.value);U.uSize.value=lin(SIZE,T)*(MOBILE?1.35:1);
 linV(TOP,T,BG.uTop.value);linV(BOT,T,BG.uBot.value);
 // camera
 spline(CAM,T,tmpV);spline(LOOK,T,tmpL);
 if(MOBILE){tmpV.sub(tmpL).multiplyScalar(lin(MK,T)).add(tmpL);const ly=lin(MLY,T),lx=lin(MLX,T);tmpV.y+=lin(MCY,T);tmpV.y+=ly;tmpL.y+=ly;tmpV.x+=lx;tmpL.x+=lx}
 // A gentle dolly travels around each mechanism while its local process advances.
 const arc=.12*Math.sin(T*.29);tmpV.x+=arc;tmpV.y+=.06*Math.cos(T*.23);
 camera.position.copy(tmpV);camera.lookAt(tmpL);camera.updateMatrixWorld();
 // bulb glow on screen
 const useIn=b2>b1*0.6;proj.copy(useIn?U.uBulb2.value:U.uBulb.value).project(camera);
 BG.uGlow.value.set(proj.x*0.5+0.5,proj.y*0.5+0.5,proj.z<1?(useIn?b2*0.8:b1):0);BG.uBeam.value=useIn?0.6:1;
 // type
 for(const t of TXT){let o=txtOp(t,T);if(t.el===close)o=cK;
  if(o<=0.001){if(t.on!==0){t.el.style.visibility='hidden';t.el.style.opacity=0;t.on=0;t.os=''}continue}
  if(t.on!==1){t.el.style.visibility='visible';t.on=1}
  const os=o.toFixed(3);if(os!==t.os){t.el.style.opacity=os;t.os=os}
  if(t.span&&t.an){_fa.copy(t.an).x-=t.span/2;_fb.copy(t.an).x+=t.span/2;_fa.project(camera);_fb.project(camera);const pw=Math.abs(_fb.x-_fa.x)*0.5*VW;
   const fs=Math.max(15,Math.min(160,100*pw/Math.max(1,t.w100)));if(Math.abs(fs-t.fs)>0.4){t.el.style.fontSize=fs.toFixed(1)+'px';t.fs=fs;t.w=t.el.offsetWidth;t.h=t.el.offsetHeight}}
  if(t.an){proj.copy(t.an).project(camera);let x=(proj.x*0.5+0.5)*VW+t.dx*(MOBILE?0.5:1),y=(-proj.y*0.5+0.5)*VH+t.dy;
   const m=14;x=Math.max(t.w/2+m,Math.min(VW-t.w/2-m,x));y=Math.max(t.h/2+headerInset,Math.min(innerHeight-t.h/2-m,y));
   const lift=(1-o)*10;const tr=`translate3d(${(x-t.w/2).toFixed(1)}px,${(y-t.h/2+lift).toFixed(1)}px,0)`;if(tr!==t.tr){t.el.style.transform=tr;t.tr=tr}}}
 // opening: the static HTML headline fades as the film starts
 const io=Math.round((1-Math.min(1,Math.max(0,(T-0.3)/1.9)))*100)/100;if(io!==introO){introO=io;intro.style.opacity=io;intro.style.visibility=io>0?'visible':'hidden'}
 for(const c of CARDS)c.update(T,b1,b2);
 renderer.render(scene,camera);
}
function resize(){VW=innerWidth;VH=stableHeight();headerInset=(document.querySelector('.site-header')?.getBoundingClientRect().bottom||72)+12;
 renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 U.uPx.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));BG.uRes.value.set(innerWidth,innerHeight);measure()}
addEventListener('resize',()=>{resize();layout()});resize();

/* ---------- loop + adaptive quality ---------- */
let last=performance.now(),ema=16,slow=0,level=0;const WARM_MS=performance.now()+8000;
function allBuilt(){return built>=NS||performance.now()>WARM_MS+30000}
// runtime downgrade: DPR 1 first, then thin the swarm, never below ~78k dots (desktop) / ~20k (phone)
const FLOOR=MOBILE?19000:78000,DROPS=[0.4,0.6,0.8,0.9].filter(d=>N*(1-d)>=FLOOR*0.99);const QUALITY_STEPS=[...(DPR>1?[{dpr:1}]:[]),...DROPS.map(drop=>({drop}))],LEVELS=QUALITY_STEPS.length;const ft=[],js=[];window.__ft=ft;window.__js=js;
function loop(now){if(stopped)return;requestAnimationFrame(loop);const dt=Math.min(0.1,(now-last)/1000);last=now;
 ft.push(dt*1000);if(ft.length>600)ft.shift();
 if(lenis)lenis.raf(now);
 if(!frozen){const tgt=targetT();const w=9;const n=Math.ceil(dt/0.008),h=dt/n;for(let k=0;k<n;k++){const a=-w*w*(pT-tgt)-2*w*vT;vT+=a*h;pT+=vT*h}pT=Math.min(FILM_END,Math.max(0,pT));if(Math.abs(pT-tgt)<1e-4&&Math.abs(vT)<1e-3){pT=tgt;vT=0}
  closeK+= (closeTarget()-closeK)*(1-Math.exp(-dt*8));
  const y=lenis?lenis.animatedScroll:scrollY;if(Math.abs(y-lastY)<0.5)still+=dt;else still=0;lastY=y;
  if(still>0.35&&still<0.4&&lenis&&pT<FILM_END){const s=settleT(pT);if(Math.abs(s-pT)>0.002)lenis.scrollTo(s/FILM_END*filmPx(),{duration:0.6})}}
 const warm=now<WARM_MS||!allBuilt()||document.hidden||dt>=0.1;if(!warm){ema=ema*0.95+dt*1000*0.05;if(ema>40)slow++;else slow=Math.max(0,slow-2);}
 if(slow>90&&level<LEVELS){const step=QUALITY_STEPS[level++];slow=0;if(step.dpr){renderer.setPixelRatio(step.dpr);resize()}else{const dr=step.drop;U.uDrop.value=dr;U.uSzK.value=Math.pow(131072/N,0.42)/Math.pow(1-dr,0.3)}}
 if(!frozen)pump();
 // the ending covers the canvas past the film: stop drawing there
 if(!frozen&&(lenis?lenis.animatedScroll:scrollY)>filmPx()+VH*1.3+4)return;
 const j0=performance.now();frame(pT,closeK,now/1000);js.push(performance.now()-j0);if(js.length>600)js.shift();
}
// test hook: render a given film position directly
let resolveFirstFrame,rejectFirstFrame;const firstFrame=new Promise((res,rej)=>{resolveFirstFrame=res;rejectFirstFrame=rej});
window.__film={firstFrame,stop(){if(stopped)return;stopped=true;lenis?.destroy();builderWorker?.terminate();vectors.dispose();renderer.dispose()},async navigate(y){const seq=++navSequence;lenis?.scrollTo(y,{immediate:true});scrollTo({top:y,behavior:'instant'});const at=targetT();pT=at;vT=0;frozen=true;if(at<2.2){document.documentElement.classList.add('film-seeking');intro.style.visibility='visible';intro.style.opacity='1'}const seg=SEG[segAt(at)];pump();await ensure([seg.A,seg.B]);if(seq!==navSequence||stopped)return;frame(at,0,at);frozen=false;document.documentElement.classList.remove('film-seeking')},async set(T,c=0){frozen=true;pT=T;closeK=c;const s=segAt(T);const L=[SEG[s].A,SEG[s].B];pinned.clear();L.forEach(i=>pinned.add(i));pump();await ensure(L);await vectors.ready;pinned.clear();frame(T,c,T)},
 release(){frozen=false},get T(){return pT},get built(){return built},get ready(){return ready},N,TIER,NSLOT,BUILD_MS,slots:()=>Array.from(slotSt),settleT,level:()=>level,FILM_END,UNIT_VH,NS,get stats(){return STATS}};

/* ---------- boot: dust first, then build states while the reader starts ---------- */
async function boot(){const t0=performance.now();try{await document.fonts.load('900 100px "Big Shoulders Display"');await document.fonts.load('600 40px "Big Shoulders Display"');}catch(e){}
 if(stopped)return;await startBuilder();if(stopped)return;pump();await ensure([SEG[0].A,SEG[0].B]);await vectors.ready;if(stopped)return;if(!vectors.loaded)throw new Error('Essential artwork unavailable');
 const initial=targetT();await window.__film.set(initial);if(stopped)return;frozen=false;ready=true;window.__film.bootMs=Math.round(performance.now()-t0);
 resolveFirstFrame({T:initial,vectors:true});requestAnimationFrame(loop);document.body.classList.add('ready')}
boot().catch(error=>rejectFirstFrame(error));

/* ---------- ?hud shows the dot count, quality level and frame rate (for checking a device) ---------- */
if(new URLSearchParams(location.search).has('hud')){const d=document.createElement('div');d.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;font:12px/1.4 monospace;color:#fff;background:rgba(0,0,0,.7);padding:6px 8px;border-radius:4px;pointer-events:none';document.body.appendChild(d);
 setInterval(()=>{const f=window.__ft||[];const a=f.slice(-120);const m=a.length?a.reduce((x,y)=>x+y,0)/a.length:0;const lv=window.__film?window.__film.level():0;d.textContent=`dots ${N} | level ${lv} | ${m?Math.round(1000/m):0} fps | dpr ${renderer.getPixelRatio()} | probe ${TIER.probeMs}ms | ${TIER.why.join(', ')||'ok'} | ${TIER.ren.slice(0,40)}`},1000)}

canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();window.__siteEarlyFallback?.('context-lost')});

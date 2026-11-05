import * as THREE from 'three';
import {setScale,setRes,STATS} from './lib.js?v=v6a';
import {buildState,STATES,K,LEDGER5,CLOCK5,mobileLayout,CARDS as CARD_DEFS,CAP,CALSLOT,ER,PY,ENV} from './shapes.js?v=v6a';
const Y0=-2.71;

const MOBILE=Math.min(innerWidth,innerHeight)<768&&innerWidth<900;
const FILM_END=100; // film T 0..100 (percent of the film)
const UNIT_VH=MOBILE?20:22; // viewport heights of scroll per film unit
const NS=STATES.length, TW=2048;

/* ---------- renderer ---------- */
const canvas=document.getElementById('gl');
const gl2=canvas.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
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
const renderer=new THREE.WebGLRenderer({canvas,context:gl2,antialias:false});
renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.autoClear=true;
let DPR=Math.min(devicePixelRatio||1,1.5);if(MOBILE)DPR=Math.min(DPR,1.25);
renderer.setPixelRatio(DPR);
const scene=new THREE.Scene();
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
function pump(){if(busy>=0||!builder)return;const L=[...pinned,...wantAt(pT)];let nx=L.find(i=>slotOf[i]<0);
 if(nx===undefined&&NSLOT>=NS)for(let i=0;i<NS;i++)if(slotOf[i]<0){nx=i;break}
 if(nx===undefined){if(NSLOT>=NS&&built>=NS)document.body.classList.add('built');return}
 busy=nx;builder(nx)}
function done(i,P,C,ms){busy=-1;install(i,P,C,ms);pump()}
function ensure(list){return Promise.all(list.map(i=>slotOf[i]>=0?null:new Promise(r=>{if(!pending.has(i))pending.set(i,[]);pending.get(i).push(r)}))).then(()=>{})}
function mainBuilder(i){setTimeout(()=>{const t0=performance.now();const {P,C}=buildState(i,N);done(i,P,C,Math.round(performance.now()-t0))},0)}
function startBuilder(){return new Promise(res=>{let w=null,ok=false;const fall=()=>{if(ok)return;ok=true;try{w&&w.terminate()}catch(e){}builder=mainBuilder;console.info('builder: main thread');res()};
 try{if(typeof OffscreenCanvas==='undefined')throw 0;w=new Worker(new URL('./worker.js?v=v6a',import.meta.url),{type:'module'});
  w.onerror=fall;w.onmessage=e=>{const m=e.data;if(m.ready){if(ok)return;ok=true;builder=i=>w.postMessage({i});console.info('builder: worker');res();return}
   if(m.stat)STATS[m.i]=m.stat;done(m.i,m.P,m.C,m.ms)};
  w.postMessage({init:1,N,scale:SCALE,res:RES,mobile:MOBILE,css:document.querySelector('link[href*="fonts.googleapis.com/css2"]').href});setTimeout(fall,15000)}catch(e){fall()}})}

const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));
geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e4);
const U={uPos:{value:posTex},uCol:{value:colTex},uA:{value:0},uB:{value:0},uW:{value:0},
 uSwO:{value:new THREE.Vector3()},uSwD:{value:new THREE.Vector3(1,0,0)},uSwM:{value:0},uSpread:{value:1},uNoise:{value:0},
 uRev:{value:new Array(16).fill(1)},uWin:{value:new Array(16).fill(9)},uAngH:{value:0},uAngM:{value:0},uPage:{value:0},
 uClock:{value:new THREE.Vector3(...CLOCK5.c)},uSpine:{value:new THREE.Vector3(LEDGER5.c[0],LEDGER5.c[1],LEDGER5.c[2])},
 uTime:{value:0},uSize:{value:0.02},uPx:{value:1000},uDrop:{value:0},uSzK:{value:Math.pow(131072/N,0.42)},uMinPx:{value:N>262144?1.0:1.2},
 uBulb:{value:new THREE.Vector3(0,5.66,1.1)},uBulbI:{value:0},uBulb2:{value:new THREE.Vector3(0,1.38,-5.1)},uBulb2I:{value:0},
 uAmb:{value:new THREE.Vector3(.1,.12,.18)},uEmK:{value:1},uProc:{value:new THREE.Vector3(.8,.88,1)},
 uArc:{value:new THREE.Vector3()},uSnap:{value:new THREE.Vector3()},uAxes:{value:0},uUseB:{value:0},
 uOff:{value:Array.from({length:8},()=>new THREE.Vector3())},uFlow:{value:new Array(4).fill(0)},uFlowK:{value:new Array(4).fill(6)}};
const VS=`precision highp float;precision highp int;
uniform highp sampler2DArray uPos;uniform highp sampler2DArray uCol;uniform int uA,uB;uniform float uW,uSpread,uNoise,uSwM,uAxes,uUseB;uniform vec3 uSwO,uSwD,uArc,uSnap;
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
 float va=vis(gA,rA)*(gA==1?0.38:1.),vb=vis(gB,rB)*(gB==1?0.38:1.);
 float a=mix(va,vb,ts);
 vec3 alb=mix(cA.rgb,cB.rgb,ts);float em=mix(cA.a,cB.a,ts);
 alb=mix(alb,uProc,mid*0.14);
 float d1=distance(p,uBulb),d2=distance(p,uBulb2);
 vec3 warm=vec3(1.,.78,.52);
 vec3 lit=uAmb+warm*(uBulbI*1.7/(1.+d1*d1*0.03)+uBulb2I*1.7/(1.+d2*d2*0.035));
 vec3 col=alb*mix(lit,vec3(uEmK*1.15),em);
 int g=t<0.5?gA:gB;
 if(g==4)col*=0.55+0.75*step(0.45,fract(uTime*0.7+hh));
 if(g==12)col*=0.35+0.9*step(0.5,fract(uTime*(0.35+hh*0.6)+h2));
 if(g==9)col=alb*(0.18+1.5*uBulbI);if(g==10)col=alb*(0.18+1.5*uBulb2I);
 vC=col;vA=a;
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 float sz=uSize*(0.75+0.5*h2)*(g==1?0.7:1.)*(1.+em*0.2)*(g==12?1.6:1.);
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
 void main(){vec3 c=mix(uBot,uTop,smoothstep(0.,1.,vUv.y));vec2 a=vec2(uRes.x/uRes.y,1.);vec2 d=(vUv-uGlow.xy)*a;float r=length(d);
 c+=vec3(1.,.72,.42)*uGlow.z*(0.22*exp(-r*5.)+0.06*exp(-r*1.6));
 if(d.y<0.){float ang=abs(atan(d.x,-d.y));c+=vec3(1.,.75,.45)*uGlow.z*uBeam*0.07*exp(-ang*ang*9.)*exp(-r*0.9);}
 float v=length((vUv-.5)*vec2(1.1,1.));c*=1.-0.55*smoothstep(.35,.85,v);
 float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);c+=(g-.5)*0.025;o=vec4(c,1.);}`}));
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
 const tex=new THREE.CanvasTexture(d.canvas);tex.colorSpace=THREE.NoColorSpace;tex.anisotropy=Math.min(8,maxAniso);tex.generateMipmaps=true;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const u={map:{value:tex},uK:{value:0},uL:{value:1},uCells:{value:new THREE.Vector2(Math.round(d.w/0.018),Math.round(d.h/0.018))},uDir:{value:new THREE.Vector2(...(d.sweep||[0,-1]))}};
 const m=new THREE.Mesh(new THREE.PlaneGeometry(d.w,d.h),new THREE.ShaderMaterial({glslVersion:THREE.GLSL3,uniforms:u,vertexShader:CARD_VS,fragmentShader:CARD_FS,side:THREE.DoubleSide}));
 const R=V(...d.R).normalize(),Up=V(...d.U).normalize(),Nn=V().crossVectors(R,Up).normalize();
 m.matrixAutoUpdate=false;m.matrix.makeBasis(R,Up,Nn).setPosition(V(...d.c).addScaledVector(Nn,d.lift??0.012));m.matrixWorldNeedsUpdate=true;m.visible=false;scene.add(m);
 const [a0,a1,b0,b1]=d.t,t2=d.t2;
 CARDS.push({update(T,l1,l2){let k=Math.min(ramp(a0,a1,T),1-ramp(b0,b1,T));if(t2)k=Math.max(k,Math.min(ramp(t2[0],t2[1],T),1-ramp(t2[2],t2[3],T)));m.visible=k>0.001;if(!m.visible)return;u.uK.value=k;
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
const CAM=[[0,V(0,1.4,24)],[3.4,V(0,1.0,20.5)],[5.6,V(0,0.4,17.5)],[8,V(0,0.1,11.5)],[10.5,V(0,-0.1,7.4)],[12.6,V(0.3,-0.5,2.6)],[16.6,V(-0.3,-0.62,2.1)],
 [19.5,V(0,3.6,-1.2)],[21,V(0.25,5.6,-3.0)],[24.2,V(0.55,5.5,-3.2)],[26.6,V(0.25,1.4,-0.6)],[28.6,V(0,Y0+1.3,-0.9)],[31.5,V(0.04,Y0+1.25,-2.0)],[34.4,V(0,Y0+1.2,-3.1)],
 [36.2,V(-0.2,PY+0.85,-4.9)],[38,V(0.1,PY+0.95,-3.9)],[41.4,V(0.7,PY+0.9,-3.9)],[43.2,V(4.6,PY+0.95,-3.9)],[46.2,V(5.4,PY+0.9,-3.9)],[47.6,V(9.6,PY+0.95,-3.9)],[49.4,V(10.3,PY+0.9,-3.9)],
 [50.6,V(5.2,PY+1.2,-1.0)],[53.6,V(0,-0.6,5.4)],[56.5,V(0.35,-0.5,5.8)],[59.4,V(-0.2,-0.35,5.6)],[62.4,V(0,-0.2,1.3)],[65.2,V(0.2,-0.1,1.0)],[67.4,V(0.1,-0.35,0.2)],[68.8,V(0,0.9,-0.4)],
 [70.4,V(0,4.6,-2.3)],[71,V(0,4.9,-2.5)],[73.6,V(0.25,5.6,-3.0)],[77.2,V(0.55,5.5,-3.2)],[79.2,V(0.25,1.4,-0.6)],[81,V(0,Y0+1.3,-0.9)],[83.6,V(0.04,Y0+1.25,-2.0)],[86.4,V(0,Y0+1.2,-3.1)],
 [88.2,V(0,-0.2,-0.5)],[89.6,V(0.3,-0.75,1.9)],[92.2,V(0.15,-0.85,1.3)],[93.6,V(0,-0.3,6.5)],[95,V(0,1.0,15.2)],[96.4,V(0,1.3,16.2)],[98.8,V(0,2.1,17.6)],[100,V(0,2.4,18.2)]];
const LOOK=[[0,V(0,1.2,0)],[3.4,V(0,1.0,0)],[5.6,V(0,0.2,0)],[8,V(0,-0.9,-3)],[10.5,V(0,-1.5,-6)],[12.6,V(0,-2.0,-5.2)],[16.6,V(0,-2.05,-5.2)],
 [19.5,V(0,-2.6,-5.0)],[21,V(0.05,Y0,-5.15)],[24.2,V(0.1,Y0,-5.2)],[26.6,V(0,Y0+0.7,-6.2)],[28.6,V(0,Y0+1.05,-8.3)],[31.5,V(0,Y0+1.1,-8.3)],[34.4,V(0,Y0+1.15,-8.3)],
 [36.2,V(-0.2,PY+0.55,-9.9)],[38,V(0.1,PY+0.62,-10.1)],[41.4,V(0.7,PY+0.58,-10.1)],[43.2,V(4.6,PY+0.62,-10.1)],[46.2,V(5.4,PY+0.58,-10.1)],[47.6,V(9.6,PY+0.62,-10.1)],[49.4,V(10.3,PY+0.58,-10.1)],
 [50.6,V(5.2,PY+0.4,-10.1)],[53.6,V(0,-0.6,-2.6)],[56.5,V(0,-0.55,-2.7)],[59.4,V(0,-0.8,-3)],[62.4,V(0,-1.6,-5.8)],[65.2,V(0,-1.7,-5.9)],[67.4,V(0,-1.3,-6.6)],[68.8,V(0,-2.3,-5.4)],
 [70.4,V(0,-2.7,-5.25)],[71,V(0,-2.7,-5.26)],[73.6,V(0.05,Y0,-5.15)],[77.2,V(0.1,Y0,-5.2)],[79.2,V(0,Y0+0.7,-6.2)],[81,V(0,Y0+1.05,-8.3)],[83.6,V(0,Y0+1.1,-8.3)],[86.4,V(0,Y0+1.15,-8.3)],
 [88.2,V(0,-2.0,-6.0)],[89.6,V(0.05,-2.4,-5.0)],[92.2,V(0,-2.45,-5.0)],[93.6,V(0,-1.6,-2)],[95,V(0,0.5,0)],[96.4,V(0,1.0,0)],[98.8,V(0,2.25,0)],[100,V(0,2.4,0)]];
// morph segments. sweep: lin = dot(p-o,dir), rad = |p-o|*dir.x. spread: how sharp the travelling front is.
// arc: lift along the path at mid flight. snap: per-axis lattice the dots slide along in flight. axes: staged per-axis moves.
const S=(A,B,t0,t1,mode,o,dir,spread,noise,x={})=>({A,B,t0,t1,mode,o,dir,spread,noise,arc:x.arc||V(),snap:x.snap||V(),axes:x.axes||0,useB:x.useB?1:0});
const SEG=[
 S(K.dust,K.front,0,3.4,0,V(-8,0,0),V(1/16,0,0),2.2,0.35,{snap:V(0,0.11,0)}),            // dust settles onto slat lines, left to right
 S(K.front,K.craft,5.6,10.5,0,V(0,2.9,0),V(0,-1/7.4,0),3.0,0.06,{arc:V(0,0,0.35)}),       // shutter lifts; its metal settles into five working objects on the table
 S(K.craft,K.blueprint,17,20.5,0,V(-3.7,0,0),V(1/7.4,0,0),3.0,0.03,{snap:V(0.15,0,0.15),arc:V(0,0.2,0)}), // the objects flatten into their places on one drawing
 S(K.blueprint,K.engine,24.5,28.5,0,V(0,0,-2.6),V(0,0,-1/6),2.5,0.03,{axes:-1,useB:1}),            // the drawing extrudes into the room
 S(K.engine,K.agents,34.5,37.5,1,V(0,Y0+1.2,-8.3),V(1/9,0,0),5.5,0.015,{arc:V(0,0.15,0),snap:V(0,0.14,0.2),axes:-1}), // packets swell into agents
 S(K.agents,K.windows,50.5,53.5,1,V(5,PY,-10),V(1/14,0,0),5.0,0.02,{arc:V(0,0.5,0.6),snap:V(0.16,0.16,0),axes:1}), // proof pulls back: most businesses still run on separate tools
 S(K.windows,K.night,59.6,62.4,0,V(0,2.4,0),V(0,-1/5,0),3.0,0.05,{arc:V(0,0.35,0),axes:1}),   // windows fall onto the desk, top rows first
 S(K.night,K.lines,67.8,70.4,0,V(-2.4,0,0),V(1/4.8,0,0),3.0,0.04,{snap:V(0.2,0,0.2),axes:1}), // pile slides into ruled lines
 S(K.lines,K.blueprint,70.8,73.6,0,V(-3.7,0,0),V(1/7.4,0,0),2.5,0.03,{snap:V(0.15,0,0.15)}),        // ruled lines become the bus
 S(K.blueprint,K.engine,77.6,81,0,V(0,0,-2.6),V(0,0,-1/6),2.5,0.03,{axes:-1,useB:1}),            // the drawing extrudes again: built
 S(K.engine,K.calm,86.6,89.4,1,V(0,Y0+1.2,-8.3),V(-1/9,0,0),5.0,0.02,{arc:V(0,0.4,0.5),snap:V(0.16,0.16,0),axes:1}),          // the room folds back into a calm counter
 S(K.calm,K.shutterDown,92.2,95,0,V(0,2.9,0),V(0,-1/7.4,0),6.0,0.02,{useB:1,snap:V(0,0.11,0),axes:-1}),                  // the shutter comes down, slat by slat
 S(K.shutterDown,K.sign2,96.2,98.8,0,V(-6.2,0,0),V(1/12.4,0,0),3.2,0.02,{snap:V(0.12,0,0)})];       // the board repaints, letter by letter
// sanity check (dev aid, no effect on the picture): SEG must chain A->B->B... in time order, and every state should be used
SEG.forEach((g,i)=>{if(g.A==null||g.B==null||g.A<0||g.B>=NS)console.warn('SEG',i,'unknown state',g.A,g.B);if(!(g.t1>g.t0))console.warn('SEG',i,'t1 must be > t0');
 if(i&&g.A!==SEG[i-1].B)console.warn('SEG',i,'starts from',g.A,'but the previous segment ends on',SEG[i-1].B);if(i&&g.t0<SEG[i-1].t1)console.warn('SEG',i,'overlaps the previous segment')});
{const used=new Set(SEG.flatMap(g=>[g.A,g.B]));const un=Object.keys(K).filter(n=>!used.has(K[n]));if(un.length)console.warn('states built but not in SEG:',un.join(', '))}
const SIZE=[[0,0.034],[5.6,0.032],[10.5,0.024],[17,0.021],[20.5,0.02],[24.5,0.02],[28.5,0.0115],[34.5,0.011],[37.5,0.012],[49.5,0.013],[50.6,0.016],[53.5,0.025],[59.6,0.025],[62.4,0.021],[67.8,0.021],[70.4,0.022],[71,0.022],[77.6,0.02],[81,0.0115],[86.6,0.0115],[89.4,0.019],[92.2,0.019],[95,0.03],[100,0.032]];
const BULB1=[[0,0],[0.8,0.12],[1.2,0.02],[1.7,0.55],[2.0,0.2],[2.6,0.95],[3.0,0.6],[3.5,1],[9,1],[13,0.25],[16,0],[92.2,0],[94.2,0.7],[95.4,1],[100,1]];
const BULB2=[[7,0],[10.5,1],[17,1],[19.5,0.1],[26.6,0],[28.6,0.9],[34.4,0.9],[36.4,0.3],[50.4,0.3],[51,0.05],[53.5,0.5],[59.6,0.5],[62.4,0.95],[63.6,0.6],[64.2,0.95],[66.2,0.5],[66.7,0.9],[68.8,0.35],[70.4,0.1],[71,0.08],[73.6,0],[79.2,0],[81,0.9],[86.4,0.9],[88.6,1],[92.6,1],[95,0.2],[96.4,0]];
const AMB=[[0,V(.12,.14,.21)],[5,V(.12,.14,.2)],[10.5,V(.15,.15,.16)],[17,V(.15,.15,.16)],[20.5,V(.16,.2,.3)],[24.5,V(.16,.2,.3)],[28.5,V(.13,.15,.2)],[34.5,V(.13,.15,.2)],[37.5,V(.15,.17,.23)],[50.5,V(.15,.17,.23)],[53.5,V(.16,.17,.22)],[59.6,V(.16,.17,.22)],[62.4,V(.14,.12,.11)],[67.8,V(.12,.11,.1)],[70.4,V(.16,.2,.3)],[77.6,V(.16,.2,.3)],[81,V(.13,.15,.2)],[86.6,V(.13,.15,.2)],[89.4,V(.17,.15,.13)],[92.2,V(.17,.15,.13)],[95,V(.12,.14,.2)],[100,V(.12,.14,.21)]];
const TOP=[[0,V(.035,.06,.11)],[6,V(.03,.05,.09)],[10.5,V(.05,.045,.04)],[17,V(.05,.045,.04)],[20.5,V(.03,.06,.11)],[24.5,V(.03,.06,.11)],[28.5,V(.02,.03,.045)],[50.5,V(.02,.03,.05)],[53.5,V(.035,.04,.055)],[59.6,V(.035,.04,.055)],[62.4,V(.045,.03,.025)],[67.8,V(.03,.025,.025)],[70.4,V(.03,.06,.11)],[77.6,V(.03,.06,.11)],[81,V(.02,.03,.045)],[86.6,V(.02,.03,.05)],[89.4,V(.06,.045,.03)],[92.2,V(.06,.045,.03)],[95,V(.035,.06,.11)]];
const BOT=[[0,V(.01,.012,.02)],[10.5,V(.016,.013,.012)],[17,V(.016,.013,.012)],[20.5,V(.01,.02,.04)],[24.5,V(.01,.02,.04)],[28.5,V(.006,.008,.012)],[50.5,V(.006,.008,.012)],[53.5,V(.01,.012,.018)],[59.6,V(.01,.012,.018)],[62.4,V(.015,.01,.008)],[67.8,V(.015,.01,.008)],[70.4,V(.01,.02,.04)],[77.6,V(.01,.02,.04)],[81,V(.006,.008,.012)],[86.6,V(.006,.008,.012)],[89.4,V(.02,.014,.01)],[92.2,V(.02,.014,.01)],[95,V(.01,.012,.02)]];
const MK=[[0,1.5],[5.6,1.8],[8,2.0],[10.5,1.6],[17,1.6],[20.5,1.95],[24.5,1.95],[28.5,1.0],[34.5,1.0],[37,1.3],[49.5,1.3],[50.6,1.25],[53.5,1.0],[59.6,1.0],[62.4,1.7],[67.8,1.7],[70.4,1.6],[71,1.6],[73.6,1.95],[77.6,1.95],[81,1.0],[86.6,1.0],[89.4,1.3],[92.2,1.3],[94.6,1.6],[95.4,2.3],[98.8,2.4],[100,2.4]];
const _b2a=V(0,1.38,-5.1),_b2b=V(0,Y0+2.5,ER.db+0.35);
const OFFA=[[34.5,-2.4],[38.2,0]],OFFB=[[34.5,4],[42.4,4],[43.6,0]],OFFC=[[34.5,4],[46.4,4],[47.6,0]];
const sstep=k=>k*k*(3-2*k);
const HOOKS=[ // per-scene uniform drivers (offsets, flows), each a pure function of T
 (T,U)=>{U.uBulb2.value.copy((T>=24.5&&T<51)||(T>=77.6&&T<88)?_b2b:_b2a);U.uWin.value[3]=0.5},
 (T,U)=>{const o=U.uOff.value;o[0].set(lin(OFFA,T),0,0);o[1].set(0,0,0.42*ramp(44.2,44.9,T));o[2].set(lin(OFFB,T),0,0);o[3].set(lin(OFFC,T),0,0);
  // the booking block rides on the voice agent, then slides into its slot
  const cx=CAP.a[0]+o[0].x,e=sstep(ramp(40.6,41.3,T));o[4].set((cx-CALSLOT[0])*(1-e),(CAP.a[1]-CALSLOT[1])*(1-e),(CAP.a[2]+0.14-CALSLOT[2])*(1-e));
  // the dues envelope: drafted by the ledger, carried to the valve, held, then sent once a person ticks
  const e1=sstep(ramp(47.6,48.3,T)),e2=sstep(ramp(48.9,49.6,T));o[5].set((ENV.from[0]-ENV.c[0])*(1-e1)+2.0*e2,(ENV.from[1]-ENV.c[1])*(1-e1),(ENV.from[2]-ENV.c[2])*(1-e1))},
 (T,U)=>{const f=U.uFlow.value,FK=U.uFlowK.value;FK[0]=5;FK[1]=8;FK[2]=1;FK[3]=1;
  f[0]=T>10.5&&T<17?0.01+(T-10.5)*1.6:T>28.5&&T<36?0.01+(T-28.5)*1.6:T>81&&T<88?0.01+(T-81)*1.6:0;f[1]=T>36&&T<51?0.01+(T-36)*1.3:0;
  f[2]=T>44&&T<44.7?0.01+(T-44)/0.7*0.84:0;f[3]=T>47.2&&T<47.7?0.01+(T-47.2)/0.5*0.84:0}];
const MLY=[[0,0],[34.5,0],[37.5,0.2],[49.5,0.2],[51,0.4],[53.5,0.75],[59.6,0.75],[62.4,-0.3],[67.8,-0.3],[70.4,0],[86.6,0],[89.4,-0.05],[92.2,-0.05],[95,0]]; // mobile: vertical framing shift per scene
const MLX=[[0,0],[34.5,0],[37,-0.35],[40.6,-0.4],[42.6,0.15],[45.5,0],[100,0]]; // mobile: horizontal framing shift
const REV={3:[[38.8,0.5],[40.4,1]],5:[[36,0],[48.4,0],[48.9,1],[51,1],[51.01,0],[61.4,0],[67,1],[71,1],[71.01,0]],
 13:[[17.4,0],[21.2,1],[28.6,1],[28.61,0],[70.6,0],[73.8,1],[81.2,1],[81.21,0],[89,0],[92,1]],14:[[10.8,0],[15.5,1],[17,1],[24.4,0.12],[28.8,0.12],[34,1],[77.5,1],[77.51,0.12],[81.2,0.12],[86,1]],15:[[45.2,0],[45.9,1]]};

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
const spacer=document.getElementById('spacer');let VH=innerHeight,VW=innerWidth;
function layout(){VH=document.documentElement.clientHeight;spacer.style.height=(FILM_END*UNIT_VH+120)+'vh';}
layout();
let lenis=null;try{lenis=new window.Lenis({lerp:0.1,smoothWheel:true,syncTouch:false});}catch(e){}
const filmPx=()=>FILM_END*UNIT_VH/100*VH;
function targetT(){const y=lenis?lenis.animatedScroll:scrollY;return Math.min(FILM_END,Math.max(0,y/filmPx()*FILM_END))}
function closeTarget(){const y=lenis?lenis.animatedScroll:scrollY;return Math.min(1,Math.max(0,(y-filmPx())/(0.75*VH)))}
let still=0,lastY=-1;

const close=document.getElementById('close');let cueOn=null;
const tmpV=V(),tmpL=V(),proj=V();
function frame(T,cK,time){
 U.uTime.value=time;
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
 U.uAngM.value=0.85*Math.min(Math.max(0,T-59.6),14)+0.25*Math.max(0,T-73.6);U.uAngH.value=1.2+U.uAngM.value/12;
 U.uPage.value=T<62.4?0:Math.PI*Math.min(1,((T-62.4)/1.5)%1*1.15);
 const b1=lin(BULB1,T),b2=lin(BULB2,T);U.uBulbI.value=b1;U.uBulb2I.value=b2;
 linV(AMB,T,U.uAmb.value);U.uSize.value=lin(SIZE,T)*(MOBILE?1.35:1);
 linV(TOP,T,BG.uTop.value);linV(BOT,T,BG.uBot.value);
 // camera
 spline(CAM,T,tmpV);spline(LOOK,T,tmpL);
 if(MOBILE){tmpV.sub(tmpL).multiplyScalar(lin(MK,T)).add(tmpL);const ly=lin(MLY,T),lx=lin(MLX,T);tmpV.y+=ly;tmpL.y+=ly;tmpV.x+=lx;tmpL.x+=lx}
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
   const m=14;x=Math.max(t.w/2+m,Math.min(VW-t.w/2-m,x));y=Math.max(t.h/2+m,Math.min(VH-t.h/2-m,y));
   const lift=(1-o)*10;const tr=`translate3d(${(x-t.w/2).toFixed(1)}px,${(y-t.h/2+lift).toFixed(1)}px,0)`;if(tr!==t.tr){t.el.style.transform=tr;t.tr=tr}}}
 const cue=T<0.5;if(cue!==cueOn){cueOn=cue;document.body.classList.toggle('moved',!cue)}
 for(const c of CARDS)c.update(T,b1,b2);
 renderer.render(scene,camera);
}
function resize(){VW=innerWidth;const h=document.documentElement.clientHeight;if(Math.abs(h-VH)>120||!VH)VH=h;
 renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 U.uPx.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));BG.uRes.value.set(innerWidth,innerHeight);measure()}
addEventListener('resize',()=>{resize();layout()});resize();

/* ---------- loop + adaptive quality ---------- */
let last=performance.now(),ema=16,slow=0,level=0;const WARM_MS=performance.now()+8000;
function allBuilt(){return built>=NS||performance.now()>WARM_MS+30000}
// runtime downgrade: DPR 1 first, then thin the swarm, never below ~78k dots (desktop) / ~20k (phone)
const FLOOR=MOBILE?19000:78000,DROPS=[0.4,0.6,0.8,0.9].filter(d=>N*(1-d)>=FLOOR*0.99);const LEVELS=1+DROPS.length;const ft=[],js=[];window.__ft=ft;window.__js=js;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(0.1,(now-last)/1000);last=now;
 ft.push(dt*1000);if(ft.length>600)ft.shift();
 if(lenis)lenis.raf(now);
 if(!frozen){const tgt=targetT();const w=9;const n=Math.ceil(dt/0.008),h=dt/n;for(let k=0;k<n;k++){const a=-w*w*(pT-tgt)-2*w*vT;vT+=a*h;pT+=vT*h}pT=Math.min(FILM_END,Math.max(0,pT));if(Math.abs(pT-tgt)<1e-4&&Math.abs(vT)<1e-3){pT=tgt;vT=0}
  closeK+= (closeTarget()-closeK)*(1-Math.exp(-dt*8));
  const y=lenis?lenis.animatedScroll:scrollY;if(Math.abs(y-lastY)<0.5)still+=dt;else still=0;lastY=y;
  if(still>0.35&&still<0.4&&lenis&&pT<FILM_END){const s=settleT(pT);if(Math.abs(s-pT)>0.002)lenis.scrollTo(s/FILM_END*filmPx(),{duration:0.6})}}
 const warm=now<WARM_MS||!allBuilt()||document.hidden||dt>=0.1;if(!warm){ema=ema*0.95+dt*1000*0.05;if(ema>40)slow++;else slow=Math.max(0,slow-2);}
 if(slow>90&&level<LEVELS){level++;slow=0;if(level===1&&DPR>1){renderer.setPixelRatio(1);resize()}else{const dr=DROPS[Math.min(DROPS.length-1,level-1)];U.uDrop.value=dr;U.uSzK.value=Math.pow(131072/N,0.42)/Math.pow(1-dr,0.3)}}
 if(!frozen)pump();
 const j0=performance.now();frame(pT,closeK,now/1000);js.push(performance.now()-j0);if(js.length>600)js.shift();
}
// test hook: render a given film position directly
window.__film={async set(T,c=0){frozen=true;pT=T;closeK=c;const s=segAt(T);const L=[SEG[s].A,SEG[s].B];pinned.clear();L.forEach(i=>pinned.add(i));pump();await ensure(L);pinned.clear();frame(T,c,performance.now()/1000)},
 release(){frozen=false},get T(){return pT},get built(){return built},get ready(){return ready},N,TIER,NSLOT,BUILD_MS,slots:()=>Array.from(slotSt),settleT,level:()=>level,FILM_END,UNIT_VH,NS,get stats(){return STATS}};

/* ---------- boot: dust first, then build states while the reader starts ---------- */
async function boot(){const t0=performance.now();try{await document.fonts.load('700 100px "Playfair Display"');}catch(e){}
 await startBuilder();pump();await ensure([SEG[0].A,SEG[0].B]);ready=true;window.__film.bootMs=Math.round(performance.now()-t0);
 requestAnimationFrame(loop);document.body.classList.add('ready')}
boot();

/* ---------- ?hud shows the dot count, quality level and frame rate (for checking a device) ---------- */
if(new URLSearchParams(location.search).has('hud')){const d=document.createElement('div');d.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;font:12px/1.4 monospace;color:#fff;background:rgba(0,0,0,.7);padding:6px 8px;border-radius:4px;pointer-events:none';document.body.appendChild(d);
 setInterval(()=>{const f=window.__ft||[];const a=f.slice(-120);const m=a.length?a.reduce((x,y)=>x+y,0)/a.length:0;const lv=window.__film?window.__film.level():0;d.textContent=`dots ${N} | level ${lv} | ${m?Math.round(1000/m):0} fps | dpr ${renderer.getPixelRatio()} | probe ${TIER.probeMs}ms | ${TIER.why.join(', ')||'ok'} | ${TIER.ren.slice(0,40)}`},1000)}

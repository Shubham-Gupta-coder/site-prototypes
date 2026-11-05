import * as THREE from 'three';
import {setScale,STATS} from './lib.js';
import {buildState,STATES,LEDGER5,CLOCK5,mobileLayout,CARDS as CARD_DEFS} from './shapes.js';

const MOBILE=Math.min(innerWidth,innerHeight)<768&&innerWidth<900;
const N=MOBILE?32768:131072, TW=1024, ROWS=N/TW, NS=STATES.length;
setScale(N/131072);if(MOBILE)mobileLayout();
const FILM_END=47; // stage A covers film T 0..47 (percent of full film)
const UNIT_VH=MOBILE?19:21; // viewport heights of scroll per film unit

/* ---------- renderer ---------- */
const canvas=document.getElementById('gl');
const gl2=canvas.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
if(!gl2||matchMedia('(prefers-reduced-motion: reduce)').matches){document.body.classList.add('nogl');throw new Error('static mode')}
const renderer=new THREE.WebGLRenderer({canvas,context:gl2,antialias:false});
renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.autoClear=true;
let DPR=Math.min(devicePixelRatio||1,1.5);if(MOBILE)DPR=Math.min(DPR,1.25);
renderer.setPixelRatio(DPR);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(MOBILE?50:35,innerWidth/innerHeight,0.05,200);

/* ---------- state textures ---------- */
const posData=new Float32Array(N*4*NS),colData=new Uint8Array(N*4*NS);
const posTex=new THREE.DataTexture(posData,TW,ROWS*NS,THREE.RGBAFormat,THREE.FloatType);
const colTex=new THREE.DataTexture(colData,TW,ROWS*NS,THREE.RGBAFormat,THREE.UnsignedByteType);
for(const t of[posTex,colTex]){t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false}
let built=0;
function buildNext(){const {P,C}=buildState(built,N);posData.set(P,built*N*4);colData.set(C,built*N*4);posTex.needsUpdate=colTex.needsUpdate=true;built++}

const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));
geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e4);
const U={uPos:{value:posTex},uCol:{value:colTex},uA:{value:0},uB:{value:1},uW:{value:0},uRows:{value:ROWS},
 uSwO:{value:new THREE.Vector3()},uSwD:{value:new THREE.Vector3(1,0,0)},uSwM:{value:0},uSpread:{value:1},uNoise:{value:0},
 uRev:{value:new Array(16).fill(1)},uWin:{value:new Array(16).fill(9)},uAngH:{value:0},uAngM:{value:0},uPage:{value:0},
 uClock:{value:new THREE.Vector3(...CLOCK5.c)},uSpine:{value:new THREE.Vector3(LEDGER5.c[0],LEDGER5.c[1],LEDGER5.c[2])},
 uTime:{value:0},uSize:{value:0.02},uPx:{value:1000},uDrop:{value:0},
 uBulb:{value:new THREE.Vector3(0,5.66,1.1)},uBulbI:{value:0},uBulb2:{value:new THREE.Vector3(0,1.38,-5.1)},uBulb2I:{value:0},
 uAmb:{value:new THREE.Vector3(.1,.12,.18)},uEmK:{value:1},uProc:{value:new THREE.Vector3(.8,.88,1)},
 uArc:{value:new THREE.Vector3()},uSnap:{value:new THREE.Vector3()},uAxes:{value:0},uUseB:{value:0},
 uOff:{value:Array.from({length:8},()=>new THREE.Vector3())},uFlow:{value:new Array(4).fill(0)},uFlowK:{value:new Array(4).fill(6)}};
const VS=`precision highp float;precision highp int;
uniform highp sampler2D uPos;uniform sampler2D uCol;uniform int uA,uB,uRows;uniform float uW,uSpread,uNoise,uSwM,uAxes,uUseB;uniform vec3 uSwO,uSwD,uArc,uSnap;
uniform float uRev[16];uniform float uWin[16];uniform float uAngH,uAngM,uPage,uTime,uSize,uPx,uDrop,uBulbI,uBulb2I,uEmK;
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
 int id=gl_VertexID;ivec2 ia=ivec2(id%1024,id/1024+uA*uRows),ib=ivec2(id%1024,id/1024+uB*uRows);
 vec4 A=texelFetch(uPos,ia,0),B=texelFetch(uPos,ib,0);vec4 cA=texelFetch(uCol,ia,0),cB=texelFetch(uCol,ib,0);
 int gA=int(floor(A.w)),gB=int(floor(B.w));float rA=fract(A.w),rB=fract(B.w);
 vec3 pA=xf(A.xyz,gA),pB=xf(B.xyz,gB);
 float hh=h1(float(id)*0.618+0.1),h2=h1(float(id)*1.37+3.),h3=h1(float(id)*2.11+7.);
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
 float a=mix(va,vb,ts);if(h3<uDrop)a=0.;
 vec3 alb=mix(cA.rgb,cB.rgb,ts);float em=mix(cA.a,cB.a,ts);
 alb=mix(alb,uProc,mid*0.3);
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
 gl_PointSize=clamp(sz*uPx/-mv.z,1.2,9.);
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
 const [a0,a1,b0,b1]=d.t;
 CARDS.push({update(T,l1,l2){const k=Math.min(ramp(a0,a1,T),1-ramp(b0,b1,T));m.visible=k>0.001;if(!m.visible)return;u.uK.value=k;
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
const CAM=[[0,V(0,1.4,24)],[3.4,V(0,1.0,20.5)],[5.6,V(0,0.4,17.5)],[8,V(0,0.1,11.5)],[10.5,V(0,-0.1,7.4)],[13.5,V(0.35,-0.55,4.6)],[16.5,V(0.25,-0.95,1.4)],
 [20,V(0,-1.05,3.4)],[23.8,V(0.1,-1.0,2.95)],[26.4,V(0,-0.6,5.4)],[30,V(0.35,-0.5,5.8)],[33.5,V(-0.2,-0.35,5.6)],[36.4,V(0,-0.2,1.3)],[39.5,V(0.2,-0.1,1.0)],[41.2,V(0.1,-0.35,0.2)],[42.4,V(0,0.9,-0.4)],[46.4,V(0,4.6,-2.3)],[47,V(0,4.9,-2.5)]];
const LOOK=[[0,V(0,1.2,0)],[3.4,V(0,1.0,0)],[5.6,V(0,0.2,0)],[8,V(0,-0.9,-3)],[10.5,V(0,-1.5,-6)],[13.5,V(0,-2.1,-5.6)],[16.5,V(0.1,-2.45,-5)],
 [20,V(0,-1.2,-1.6)],[23.8,V(0,-1.2,-1.6)],[26.4,V(0,-0.6,-2.6)],[30,V(0,-0.55,-2.7)],[33.5,V(0,-0.8,-3)],[36.4,V(0,-1.6,-5.8)],[39.5,V(0,-1.7,-5.9)],[41.2,V(0,-1.3,-6.6)],[42.4,V(0,-2.3,-5.4)],[46.4,V(0,-2.7,-5.25)],[47,V(0,-2.7,-5.26)]];
// morph segments. sweep: lin = dot(p-o,dir), rad = |p-o|*dir.x. spread: how sharp the travelling front is.
// arc: lift along the path at mid flight. snap: per-axis lattice the dots slide along in flight. axes: staged per-axis moves.
const S=(A,B,t0,t1,mode,o,dir,spread,noise,x={})=>({A,B,t0,t1,mode,o,dir,spread,noise,arc:x.arc||V(),snap:x.snap||V(),axes:x.axes||0,useB:x.useB?1:0});
const SEG=[
 S(0,1,0,3.4,0,V(-8,0,0),V(1/16,0,0),2.2,0.35,{snap:V(0,0.11,0)}),            // dust settles onto slat lines, left to right
 S(1,2,5.6,10.5,0,V(0,2.9,0),V(0,-1/7.4,0),3.0,0.06,{arc:V(0,0,0.25)}),       // shutter rolls up, top first
 S(2,3,16.5,20,1,V(0.25,-2.7,-4.75),V(1/9,0,0),3.0,0.06,{arc:V(0,0.7,0.5)}), // phone lifts off the counter, nearest first
 S(3,4,23.8,26.4,1,V(0,-1.2,-1.6),V(1/5.5,0,0),3.2,0.05,{axes:-1,snap:V(0,0,0.18)}), // windows peel out of the phone: sideways, then up, on depth rails
 S(4,5,33.5,36.4,0,V(0,2.4,0),V(0,-1/5,0),3.0,0.05,{arc:V(0,0.35,0),axes:1}),   // windows fall onto the desk, top rows first
 S(5,6,42.4,46.4,0,V(-2.4,0,0),V(1/4.8,0,0),3.0,0.04,{snap:V(0.2,0,0.2),axes:1})]; // pile slides into ruled lines
const SIZE=[[0,0.034],[5.6,0.032],[10.5,0.026],[16.5,0.019],[20,0.0135],[23.8,0.014],[26.4,0.025],[33.5,0.025],[36.4,0.021],[42.4,0.021],[46.4,0.022],[47,0.022]];
const BULB1=[[0,0],[0.8,0.12],[1.2,0.02],[1.7,0.55],[2.0,0.2],[2.6,0.95],[3.0,0.6],[3.5,1],[9,1],[13,0.25],[16,0]];
const BULB2=[[7,0],[10.5,1],[17,1],[20,0.55],[33,0.5],[36.4,0.95],[37.6,0.6],[38.2,0.95],[40.2,0.5],[40.7,0.9],[42.4,0.35],[44,0.12],[47,0.08]];
const AMB=[[0,V(.12,.14,.21)],[5,V(.12,.14,.2)],[10.5,V(.17,.15,.13)],[16.5,V(.17,.15,.13)],[20,V(.16,.17,.22)],[33.5,V(.16,.17,.22)],[36.4,V(.14,.12,.11)],[42.4,V(.12,.11,.1)],[46.4,V(.16,.2,.3)]];
const TOP=[[0,V(.035,.06,.11)],[6,V(.03,.05,.09)],[10.5,V(.06,.045,.03)],[20,V(.035,.04,.055)],[33.5,V(.035,.04,.055)],[36.4,V(.045,.03,.025)],[42.4,V(.03,.025,.025)],[46.4,V(.03,.06,.11)]];
const BOT=[[0,V(.01,.012,.02)],[10.5,V(.02,.014,.01)],[20,V(.01,.012,.018)],[36.4,V(.015,.01,.008)],[46.4,V(.01,.02,.04)]];
const MK=[[0,1.5],[5.6,1.4],[10.5,1.35],[16.5,1.2],[20,1.0],[23.8,1.0],[26.4,1.0],[33.5,1.0],[36.4,1.8],[42.4,1.8],[46.4,1.6]];
const HOOKS=[]; // per-scene uniform drivers (offsets, flows), each a pure function of T
const MLY=[[0,0],[23.8,0],[26.4,0.75],[33.5,0.75],[36.4,0]]; // mobile: lift view to the window column
const REV={2:[[10.5,0],[16,1]],3:[[19.3,0],[23.3,1]],5:[[35.4,0],[41.8,1]]};

/* ---------- DOM type anchored to the 3D scene ---------- */
const TXT=[...document.querySelectorAll('[data-t]')].map(el=>{const[a,b]=el.dataset.t.split(',').map(Number);const src=(MOBILE&&el.dataset.manchor)||el.dataset.anchor;const an=src?V(...src.split(',').map(Number)):null;
 return{el,a,b,an,dx:+(el.dataset.dx||0),dy:+(el.dataset.dy||0),w:0,h:0,on:-1}});
const RAMP=0.55;
function txtOp(t,T){if(T<t.a||T>t.b)return 0;return Math.min(1,(T-t.a)/RAMP,(t.b-T)/RAMP)}
function measure(){for(const t of TXT){t.w=t.el.offsetWidth;t.h=t.el.offsetHeight}}
// settle: if the reader stops inside a fade, ease to the nearest fully-visible edge
export function settleT(T){for(const t of TXT){if(T>t.a&&T<t.a+RAMP)return (T-t.a<RAMP*0.5)?t.a-0.01:t.a+RAMP+0.01;if(T<t.b&&T>t.b-RAMP)return (t.b-T<RAMP*0.5)?t.b+0.01:t.b-RAMP-0.01}return T}

/* ---------- scroll: Lenis + critically damped spring ---------- */
const spacer=document.getElementById('spacer');let VH=innerHeight,VW=innerWidth;
function layout(){VH=document.documentElement.clientHeight;spacer.style.height=(FILM_END*UNIT_VH+120)+'vh';}
layout();
let lenis=null;try{lenis=new window.Lenis({lerp:0.1,smoothWheel:true,syncTouch:false});}catch(e){}
let pT=0,vT=0,frozen=false,closeK=0;
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
 const maxS=built-1;if(B>maxS){B=Math.max(0,maxS);A=Math.min(A,B);W=A===B?0:W}
 if(W>=1){A=B;W=0}
 U.uA.value=A;U.uB.value=B;U.uW.value=W;U.uSwM.value=seg.mode;U.uSwO.value.copy(seg.o);U.uSwD.value.copy(seg.dir);U.uSpread.value=seg.spread;U.uNoise.value=seg.noise;
 U.uArc.value.copy(seg.arc);U.uSnap.value.copy(seg.snap);U.uAxes.value=seg.axes;U.uUseB.value=seg.useB;
 for(const f of HOOKS)f(T,U,time);
 for(const g in REV)U.uRev.value[g]=lin(REV[g],T);
 U.uAngM.value=Math.max(0,T-33)*0.85;U.uAngH.value=1.2+U.uAngM.value/12;
 U.uPage.value=T<36.4?0:Math.PI*Math.min(1,((T-36.4)/1.5)%1*1.15);
 const b1=lin(BULB1,T),b2=lin(BULB2,T);U.uBulbI.value=b1;U.uBulb2I.value=b2;
 linV(AMB,T,U.uAmb.value);U.uSize.value=lin(SIZE,T)*(MOBILE?1.35:1);
 linV(TOP,T,BG.uTop.value);linV(BOT,T,BG.uBot.value);
 // camera
 spline(CAM,T,tmpV);spline(LOOK,T,tmpL);
 if(MOBILE){tmpV.sub(tmpL).multiplyScalar(lin(MK,T)).add(tmpL);const ly=lin(MLY,T);tmpV.y+=ly;tmpL.y+=ly}
 camera.position.copy(tmpV);camera.lookAt(tmpL);camera.updateMatrixWorld();
 // bulb glow on screen
 const useIn=b2>b1*0.6;proj.copy(useIn?U.uBulb2.value:U.uBulb.value).project(camera);
 BG.uGlow.value.set(proj.x*0.5+0.5,proj.y*0.5+0.5,proj.z<1?(useIn?b2*0.8:b1):0);BG.uBeam.value=useIn?0.6:1;
 // type
 for(const t of TXT){let o=txtOp(t,T);if(t.el===close)o=cK;
  if(o<=0.001){if(t.on!==0){t.el.style.visibility='hidden';t.el.style.opacity=0;t.on=0;t.os=''}continue}
  if(t.on!==1){t.el.style.visibility='visible';t.on=1}
  const os=o.toFixed(3);if(os!==t.os){t.el.style.opacity=os;t.os=os}
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
let last=performance.now(),ema=16,slow=0,level=0;const ft=[],js=[];window.__ft=ft;window.__js=js;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(0.1,(now-last)/1000);last=now;
 ft.push(dt*1000);if(ft.length>600)ft.shift();
 if(lenis)lenis.raf(now);
 if(!frozen){const tgt=targetT();const w=9;const a=-w*w*(pT-tgt)-2*w*vT;vT+=a*dt;pT+=vT*dt;if(Math.abs(pT-tgt)<1e-4&&Math.abs(vT)<1e-3){pT=tgt;vT=0}
  closeK+= (closeTarget()-closeK)*(1-Math.exp(-dt*8));
  const y=lenis?lenis.animatedScroll:scrollY;if(Math.abs(y-lastY)<0.5)still+=dt;else still=0;lastY=y;
  if(still>0.35&&still<0.4&&lenis&&pT<FILM_END){const s=settleT(pT);if(Math.abs(s-pT)>0.002)lenis.scrollTo(s/FILM_END*filmPx(),{duration:0.6})}}
 ema=ema*0.95+dt*1000*0.05;if(ema>21)slow++;else slow=Math.max(0,slow-2);
 if(slow>90&&level<2){level++;slow=0;if(level===1){renderer.setPixelRatio(1);resize()}else U.uDrop.value=0.4}
 const j0=performance.now();frame(pT,closeK,now/1000);js.push(performance.now()-j0);if(js.length>600)js.shift();
}
// test hook: render a given film position directly
window.__film={set(T,c=0){frozen=true;pT=T;closeK=c;frame(T,c,performance.now()/1000)},release(){frozen=false},get T(){return pT},get built(){return built},N,settleT,level:()=>level,FILM_END,UNIT_VH,NS,get stats(){return STATS}};

/* ---------- boot: dust first, then build states while the reader starts ---------- */
async function boot(){try{await document.fonts.load('700 100px "Playfair Display"');}catch(e){}
 buildNext();buildNext();requestAnimationFrame(loop);document.body.classList.add('ready');
 const step=()=>{if(built<NS){buildNext();setTimeout(step,30)}else document.body.classList.add('built')};setTimeout(step,60)}
boot();

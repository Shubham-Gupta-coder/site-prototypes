// v8 film engine: scroll position -> film T (0..100) -> camera, world, captions, labels. Pure function of T (haze drift and the signal pulse use the clock).
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildWorld,updateWorld,cl,ss,win} from './world.js?v=v8a';

const root=document.documentElement;

const Q=new URLSearchParams(location.search);
const PHONE=()=>innerWidth<760||innerWidth/innerHeight<.8;

const canvas=document.getElementById('gl');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'})}catch(e){root.className='still';throw e}
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.setClearColor(0x05070b,1);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x05080d,.0105);
const pmrem=new THREE.PMREMGenerator(renderer);const envTex=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();scene.environmentIntensity=.45;
const hemi=new THREE.HemisphereLight(0x7d9cbc,0x05070b,.55);scene.add(hemi);
const key=new THREE.DirectionalLight(0xcfe6ff,1.6);key.position.set(-30,60,40);scene.add(key);
const rim=new THREE.DirectionalLight(0x5fe1ff,.55);rim.position.set(40,20,-80);scene.add(rim);
const warm=new THREE.DirectionalLight(0xffb06a,0);warm.position.set(0,10,-400);scene.add(warm);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,1.2,1400);

const W=buildWorld(scene);

// haze: atmosphere only (drifts slowly; brighter in beams near the floor)
const HZ=PHONE()?5000:14000;const hg=new THREE.BufferGeometry();const hp=new Float32Array(HZ*3),hs=new Float32Array(HZ);
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
for(let i=0;i<HZ;i++){hp[i*3]=-90+rnd()*180;hp[i*3+1]=Math.pow(rnd(),2.2)*46;hp[i*3+2]=-230+rnd()*300;hs[i]=rnd()}
hg.setAttribute('position',new THREE.BufferAttribute(hp,3));hg.setAttribute('seed',new THREE.BufferAttribute(hs,1));
const hm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uPx:{value:1},uO:{value:1}},
 vertexShader:`attribute float seed;uniform float uTime,uPx;varying float vA;void main(){vec3 p=position;p.x+=sin(uTime*.07+seed*40.)*1.6;p.y+=sin(uTime*.05+seed*17.)*.8;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;gl_PointSize=clamp(uPx*(1.+seed*1.6)*60./d,0.,4.*uPx);vA=(.25+.75*seed)*smoothstep(260.,20.,d)*smoothstep(.5,3.,d);}`,
 fragmentShader:`varying float vA;uniform float uO;void main(){vec2 q=gl_PointCoord-.5;float r=dot(q,q);if(r>.25)discard;gl_FragColor=vec4(vec3(.62,.82,.95)*vA*.35*uO,1.);}`});
scene.add(new THREE.Points(hg,hm));

// ---------- camera path (pos, look) ----------
const K=[
 [0,  [0,7,62],     [0,5,0]],
 [5,  [0,5.5,46],   [0,3.4,0]],
 [9,  [8.5,3.6,25], [0,.8,11]],
 [13, [10,3.8,19],  [1.6,.6,8]],
 [17, [11,7.4,13],  [0,5,0]],
 [21, [8,13,13],    [0,7,0]],
 [25, [0,19,25],    [0,1.6,-1]],
 [29, [-8,15,6],    [0,9,-24]],
 [34, [-6,7.4,-46], [0,3.8,-64]],
 [40, [-4.2,5.8,-52],[-3.4,3.2,-68]],
 [46, [4.2,5.8,-52],[2.6,3,-68]],
 [52, [0,7.6,-50],  [0,3.4,-70]],
 [54.6,[0,17,-74],  [0,5.6,-118]],
 [57, [0,8.6,-104], [0,6.8,-132]],
 [62, [0,6.6,-111.4],[0,5.8,-132]],
 [70, [1.2,6.6,-111.8],[0,5.7,-132]],
 [75, [-5,12.5,-104],[9,15.5,-121]],
 [77.4,[-3,17,-86],[25,10.5,-102]],
 [80, [-4,24,-62],  [30,12,-104]],
 [86, [8,30,-58],   [34,22,-104]],
 [92, [-36,40,22],  [8,6,-84]],
 [100,[-46,58,74],  [0,4,-170]],
];
const PK={0:[0,0],57:[0,0],62:[0,0],70:[0,0]}; // desktop look offsets (x) to leave room for a side caption: none
const kP=K.map(k=>new THREE.Vector3(...k[1])),kL=K.map(k=>new THREE.Vector3(...k[2])),kT=K.map(k=>k[0]);
const cP=new THREE.CatmullRomCurve3(kP,false,'centripetal'),cL=new THREE.CatmullRomCurve3(kL,false,'centripetal');
function camAt(T){let i=0;while(i<kT.length-2&&T>kT[i+1])i++;const u=cl((T-kT[i])/(kT[i+1]-kT[i]));const e=u*u*(3-2*u)*.6+u*.4;const f=(i+e)/(kT.length-1);
 const p=cP.getPoint(f),l=cL.getPoint(f);
 if(PHONE()){const k=1.55+.25*ss(55,60,T)*(1-ss(74,78,T));p.sub(l).multiplyScalar(k).add(l);p.y+=1.2}
 return[p,l]}

// ---------- post ----------
let composer,bloom,level=0;const LV=[{dpr:1.5,bloom:1,env:1},{dpr:1.15,bloom:1,env:1},{dpr:1,bloom:1,env:0},{dpr:.8,bloom:0,env:0}];
function setup(){const L=LV[level];scene.environment=L.env?envTex:null;hemi.intensity=L.env?.55:1.05;const dpr=Math.min(devicePixelRatio||1,PHONE()?1.75:2,L.dpr*(PHONE()?1.2:1));renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight,false);
 camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<.8?54:40;camera.updateProjectionMatrix();hm.uniforms.uPx.value=dpr;
 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 if(L.bloom){bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.85,.55,.62);composer.addPass(bloom)}
 composer.addPass(new OutputPass());composer.setPixelRatio(dpr);composer.setSize(innerWidth,innerHeight)}
setup();addEventListener('resize',()=>{setup();frame(sT,clock())});

// ---------- captions + labels (real DOM / SVG text) ----------
const caps=[...document.querySelectorAll('.cap')].map(el=>{const[a,b]=el.dataset.t.split(',').map(Number);return{el,a,b,side:el.classList.contains('side')}});const sideMQ=matchMedia('(min-width:900px) and (min-aspect-ratio:6/5)');
const intro=document.getElementById('intro');const ov=document.getElementById('ov');const NS='http://www.w3.org/2000/svg';
const labs=W.labels.map(l=>{const g=document.createElementNS(NS,'g');const t=document.createElementNS(NS,'text');t.textContent=l.text.toUpperCase();
 if(l.cls==='plate'){t.setAttribute('class','vplate');t.setAttribute('text-anchor','middle');const r=document.createElementNS(NS,'rect');r.setAttribute('class','vbox');g.appendChild(r)}else{t.setAttribute('class','lbl '+l.cls);const ln=document.createElementNS(NS,'line');ln.setAttribute('x1',0);ln.setAttribute('y1',4);ln.setAttribute('x2',0);ln.setAttribute('y2',22);ln.setAttribute('stroke',l.cls==='a'?'#ffb547':l.cls==='c'?'#5fe1ff':'#5c6d80');g.appendChild(ln);t.setAttribute('x',8);t.setAttribute('y',0)}
 g.appendChild(t);ov.appendChild(g);return{...l,g,tx:t}});
const tmp=new THREE.Vector3();
function overlays(T){
 intro.style.opacity=1-ss(.6,4.6,T);intro.style.transform=`translateY(${-ss(.6,4.6,T)*6}vh)`;intro.style.visibility=T>5?'hidden':'visible';
 for(const c of caps){const o=win(T,c.a,c.b,1.4);c.el.style.opacity=o;const dy=(1-ss(c.a,c.a+1.4,T))*14;c.el.style.transform=c.side&&sideMQ.matches?`translateY(calc(-50% + ${dy}px))`:`translateX(-50%) translateY(${dy}px)`;c.el.style.visibility=o>0.01?'visible':'hidden'}
 for(const l of labs){const tw=l.cls==='plate'&&PHONE()?[l.t[0],80.4]:l.t;const o=win(T,tw[0],tw[1],1);if(o<.01){l.g.style.display='none';continue}
  tmp.copy(l.pos).project(camera);if(tmp.z>1){l.g.style.display='none';continue}
  let x=(tmp.x*.5+.5)*innerWidth;const y=(-tmp.y*.5+.5)*innerHeight;if(l.cls!=='plate'){l.g.style.display='';const w=l.w||(l.w=l.tx.getComputedTextLength()+14);x=Math.max(10,Math.min(x,innerWidth-w-10))}l.g.style.display='';l.g.setAttribute('transform',`translate(${x.toFixed(1)},${y.toFixed(1)})`);l.g.style.opacity=o;
  if(l.cls==='plate'){const bb=l.tx.getBBox();const r=l.g.firstChild;r.setAttribute('x',bb.x-18);r.setAttribute('y',bb.y-10);r.setAttribute('width',bb.width+36);r.setAttribute('height',bb.height+20);r.setAttribute('fill','rgba(5,8,12,.72)');r.setAttribute('stroke','#5fe1ff');r.setAttribute('stroke-opacity','.6')}}
}

// ---------- frame ----------
const t0=performance.now();const clock=()=>(performance.now()-t0)/1000;
const SIDEW=[[7.5,29.5],[34,54],[58.5,75]];
function sideShift(T){if(!sideMQ.matches)return 0;let w=0;for(const[a,b]of SIDEW)w=Math.max(w,ss(a-1.5,a+.5,T)*(1-ss(b-.5,b+1.5,T)));return w}
function frame(T,time){updateWorld(W,T,time);const[p,l]=camAt(T);{const w=ss(71.5,73.5,T)*(1-ss(78,80,T));const q=W.sigAt(T);if(q&&w>0)l.lerp(q,w*.85)}const sh=sideShift(T)*innerWidth*.17;if(sh>.5)camera.setViewOffset(innerWidth,innerHeight,-sh,0,innerWidth,innerHeight);else camera.clearViewOffset();camera.position.copy(p);camera.lookAt(l);
 hm.uniforms.uTime.value=time;
 warm.intensity=1.2*ss(88,98,T);scene.fog.density=.0105-.004*ss(84,96,T);
 renderer.toneMappingExposure=(.62+.53*ss(.5,7,T))+.18*ss(92,97,T)-.12*ss(98.5,100,T);
 composer.render();overlays(T)}

// ---------- scroll -> T (Lenis smooth scroll + critically damped spring) ----------
const film=document.getElementById('film');
let lenis=null;if(window.Lenis){lenis=new Lenis({lerp:.1,smoothWheel:true,wheelMultiplier:.9});}
const targetT=()=>{const r=film.getBoundingClientRect();const span=film.offsetHeight-innerHeight;return cl(-r.top/span)*100};
let sT=targetT(),vT=0,frozen=Q.has('T'),last=performance.now(),inView=true;
new IntersectionObserver(es=>{inView=es[0].isIntersecting}).observe(film);
const ft=[];let lvlCheck=0;
function loop(now){requestAnimationFrame(loop);if(lenis)lenis.raf(now);
 const raw=now-last;const dt=Math.min(.05,raw/1000);last=now;if(frozen||!inView||document.hidden){ft.length=0;return}
 const tt=targetT();const k=60,d=2*Math.sqrt(k);const a=k*(tt-sT)-d*vT;vT+=a*dt;sT+=vT*dt;if(Math.abs(tt-sT)<.002&&Math.abs(vT)<.002){sT=tt;vT=0}
 frame(sT,clock());if(raw<1000)ft.push(raw); // real frame interval (GPU work is async, so time the rAF cadence)
 if(ft.length>=30||(ft.length>=8&&ft.reduce((x,y)=>x+y,0)>900)){const avg=ft.reduce((x,y)=>x+y,0)/ft.length;ft.length=0;if(avg>26&&!Q.has('fixlv')&&level<LV.length-1&&++lvlCheck>=1){level++;setup();ft.length=0}}
 if(Q.has('hud')){const h=document.getElementById('hud');h.style.display='block';h.textContent=`T ${sT.toFixed(1)} · level ${level} · dpr ${renderer.getPixelRatio().toFixed(2)}`}}

// ---------- boot: fonts for canvas UI, then first frame, then reveal ----------
await Promise.all([document.fonts.load('500 30px "IBM Plex Mono"'),document.fonts.load('400 30px "IBM Plex Sans"'),document.fonts.load('700 50px Tourney')]).catch(()=>{});
if(Q.has('T'))sT=+Q.get('T');
frame(sT,clock());canvas.classList.add('on');requestAnimationFrame(loop);
window.__film={ready:true,level:()=>level,set(T,clk){frozen=true;sT=T;frame(T,clk??clock())},release(){frozen=false},
 dbg:Q.has('hud')?{scene,renderer,THREE,camera}:null,
 bench(lv){if(lv!=null&&lv!==level){level=lv;setup()}renderer.info.autoReset=false;renderer.info.reset();frame(sT,clock());const r=renderer.info.render;const o={level,calls:r.calls,tris:r.triangles,points:r.points};renderer.info.autoReset=true;return o}};

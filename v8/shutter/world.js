// v8 "The Switchyard": every structure and every moving part is a pure function of film T (0..100).
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {screenUI, cardUI} from './ui.js?v=v8a';

export const C={void:0x05070b,graph:0x151c25,dark:0x0b1017,edge:0x2f4a60,ion:0x5fe1ff,amber:0xffb547,ink:0xe6eef6};
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const ss=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t)};
export const win=(T,a,b,f=1.2)=>ss(a,a+f,T)*(1-ss(b-f,b,T)); // on between a and b with soft edges
const lerp=(a,b,t)=>a+(b-a)*t;

// ---------- materials ----------
const M={
 graph:new THREE.MeshStandardMaterial({color:C.graph,metalness:.62,roughness:.38}),
 dark:new THREE.MeshStandardMaterial({color:C.dark,metalness:.5,roughness:.55}),
 plinth:new THREE.MeshStandardMaterial({color:0x10161e,metalness:.4,roughness:.7}),
 floor:new THREE.MeshStandardMaterial({color:0x080c12,metalness:.35,roughness:.6,envMapIntensity:.08}),
 glass:new THREE.MeshStandardMaterial({color:0x223446,metalness:.2,roughness:.1,transparent:true,opacity:.16,depthWrite:false}),
 edge:new THREE.LineBasicMaterial({color:C.edge,transparent:true,opacity:.55}),
};
const glow=(c,o=1)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,toneMapped:false});
function solid(geo,mat,pos,edges=true){const g=new THREE.Group();const m=new THREE.Mesh(geo,mat);g.add(m);
 if(edges){const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo,30),M.edge);g.add(e)}g.position.copy(pos);return g}
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function tube(points,r,mat,seg=200){const cu=new THREE.CatmullRomCurve3(points,false,'catmullrom',.2);const g=new THREE.TubeGeometry(cu,seg,r,8,false);const m=new THREE.Mesh(g,mat);m.userData.total=g.index.count;m.userData.curve=cu;return m}
const grow=(m,f)=>{const n=m.userData.total;m.geometry.setDrawRange(0,Math.floor(cl(f)*n/6)*6);m.visible=f>0.001};

export function buildWorld(scene,opts){
 const W={scene};const add=o=>{scene.add(o);return o};
 // ---------- ground ----------
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),M.floor);floor.rotation.x=-Math.PI/2;add(floor);
 const grid=new THREE.GridHelper(1200,240,0x16324a,0x0d1d2b);grid.material.transparent=true;grid.material.opacity=.42;grid.position.y=.01;add(grid);

 // ---------- 1. SWITCHYARD (personal agent system) ----------
 const SW=new THREE.Group();add(SW);
 // memory core: open frame, glass skin, lattice of memory nodes inside
 const core=new THREE.Group();SW.add(core);
 core.add(solid(box(5,0.8,5),M.graph,V(0,0.4,0)),solid(box(5,0.8,5),M.graph,V(0,10.4,0)));
 for(const[x,z]of[[-2.3,-2.3],[2.3,-2.3],[-2.3,2.3],[2.3,2.3]])core.add(solid(box(.4,9.2,.4),M.graph,V(x,5.4,z)));
 const skin=new THREE.Mesh(box(4.6,9.2,4.6),M.glass);skin.position.set(0,5.4,0);core.add(skin);
 const NX=5,NY=11,NZ=5,nodes=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.13),glow(0xffffff),NX*NY*NZ);
 const dummy=new THREE.Object3D();let k=0;const nodeY=[];
 for(let y=0;y<NY;y++)for(let x=0;x<NX;x++)for(let z=0;z<NZ;z++){dummy.position.set((x-2)*.82,1.4+y*.8,(z-2)*.82);dummy.updateMatrix();nodes.setMatrixAt(k,dummy.matrix);nodeY.push(y+((x*7+z*3)%5)*.15);k++}
 nodes.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(k*3),3);core.add(nodes);
 const latt=[];for(let y=0;y<NY;y++){const p=[];for(let i=0;i<=4;i++)p.push(V(-1.64+i*.82,1.4+y*.8,-1.64),V(-1.64+i*.82,1.4+y*.8,1.64));latt.push(...p)}
 const lattL=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(latt),new THREE.LineBasicMaterial({color:0x1f3a50,transparent:true,opacity:.6}));core.add(lattL);
 const seams=[];for(const[x,z,ry]of[[0,2.32,0],[0,-2.32,0],[2.32,0,Math.PI/2],[-2.32,0,Math.PI/2]]){const s=new THREE.Mesh(box(.12,9.2,.02),glow(C.ion,.0));s.position.set(x,5.4,z);s.rotation.y=ry;core.add(s);seams.push(s)}
 // agent bays on a ring, each with an LED strip facing the core
 const bays=[];const RB=11.5;
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;const g=new THREE.Group();g.position.set(Math.sin(a)*RB,0,Math.cos(a)*RB);g.rotation.y=a+Math.PI;
  g.add(solid(box(3.2,.5,2.6),M.plinth,V(0,.25,0)),solid(box(2.6,1.9,2),M.graph,V(0,1.45,0)),solid(box(2.2,.5,1.6),M.dark,V(0,2.65,0)));
  const led=new THREE.Mesh(box(2.2,.1,.04),glow(C.ion,.12));led.position.set(0,1.9,1.02);g.add(led);
  const led2=new THREE.Mesh(box(1.4,.06,.04),glow(C.ion,.08));led2.position.set(-.3,1.5,1.02);g.add(led2);
  SW.add(g);bays.push({g,led,led2,a})}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(RB-2.2,.05,6,160),glow(C.ion,.18));ring.rotation.x=Math.PI/2;ring.position.y=.06;SW.add(ring);
 const spokes=[];for(const b of bays){const t=tube([V(0,.08,0),V(Math.sin(b.a)*(RB-1.8),.08,Math.cos(b.a)*(RB-1.8))],.04,glow(C.ion,.2),20);SW.add(t);spokes.push(t)}
 // router junction with a primary lane (drops) and a backup lane (takes over)
 const junc=solid(new RoundedBoxGeometry(3,1.2,2.4,3,.18),M.graph,V(0,.6,15.5));SW.add(junc);
 const jLed=new THREE.Mesh(box(2.4,.08,.04),glow(C.ion,.5));jLed.position.set(0,1.0,16.72);SW.add(jLed);
 const inRail=tube([V(0,.18,52),V(0,.18,34),V(0,.18,16.7)],.07,glow(C.ion,.28),60);SW.add(inRail);
 const primary=tube([V(0,.18,14.3),V(0,.18,9),V(0,.18,2.6)],.09,glow(C.ion,.9),60);SW.add(primary);
 const backup=tube([V(1.2,.18,14.6),V(4.6,.18,12),V(5.6,.18,7),V(3.6,.18,3.4),V(2.6,.18,2.6)],.09,glow(C.ion,.9),120);SW.add(backup);
 const breakMark=new THREE.Group();SW.add(breakMark);breakMark.position.set(0,.2,8.2);
 for(const s of[-1,1]){const m=new THREE.Mesh(box(.9,.06,.06),glow(0x7a8899,.9));m.rotation.y=s*Math.PI/4;breakMark.add(m)}
 // service housings behind the core, status lights
 const svc=[];for(let i=0;i<6;i++){const x=-11.25+i*4.5;const g=solid(box(3,3.2,2),M.graph,V(x,1.6,-9));SW.add(g);
  const l=new THREE.Mesh(new THREE.SphereGeometry(.14,12,8),glow(C.ion,.9));l.position.set(x+1,2.7,-7.98);SW.add(l);svc.push(l)}
 const svcBus=tube([V(-12,.12,-7.6),V(12,.12,-7.6)],.05,glow(C.ion,.25),40);SW.add(svcBus);

 // ---------- elevated rail to the press ----------
 const railPts=[V(0,11.2,0),V(0,12.5,-14),V(0,9,-34),V(0,6.2,-52),V(0,4.2,-60)];
 const rail=tube(railPts,.08,glow(C.ion,.55),200);add(rail);
 const pylonsR=[];for(let z=-14;z>=-52;z-=9.5){const y=lerp(12.5,6.2,(-14-z)/38);const p=solid(box(.5,y-.3,.5),M.dark,V(0,(y-.3)/2,z),false);add(p);pylonsR.push(p)}

 // ---------- 2. EVIDENCE PRESS (research system) ----------
 const PZ=-66;const PR=new THREE.Group();add(PR);
 PR.add(solid(box(.6,8,1.2),M.graph,V(-6.6,4,PZ+3)),solid(box(.6,8,1.2),M.graph,V(6.6,4,PZ+3)),solid(box(13.8,.8,1.4),M.graph,V(0,8.3,PZ+3)));
 const scanBar=new THREE.Mesh(box(12.6,.06,.06),glow(C.ion,.0));scanBar.position.set(0,4,PZ+3.3);PR.add(scanBar);
 // archive racks: instanced slabs (stored snapshots)
 const slabG=box(3.4,.16,1.6);const slabs=new THREE.InstancedMesh(slabG,M.graph,2*7*7);const slabIdx={};let si=0;
 const rackG=[];for(const side of[-1,1])for(let r=0;r<7;r++){const z=PZ-4-r*3.2,x=side*8;
  rackG.push(solid(box(.18,6.4,.18),M.dark,V(x-side*1.8,3.2,z-.9),false),solid(box(.18,6.4,.18),M.dark,V(x-side*1.8,3.2,z+.9),false),solid(box(.18,6.4,.18),M.dark,V(x+side*1.8,3.2,z),false));
  for(let s=0;s<7;s++){dummy.position.set(x,.5+s*.9,z);dummy.rotation.set(0,0,0);dummy.updateMatrix();slabs.setMatrixAt(si,dummy.matrix);slabIdx[`${side},${r},${s}`]=si;si++}}
 rackG.forEach(g=>PR.add(g));PR.add(slabs);
 const slabEdges=new THREE.InstancedMesh(new THREE.BoxGeometry(3.42,.02,1.62),glow(0x2a5470,.7),si);for(let i=0;i<si;i++){const m=new THREE.Matrix4();slabs.getMatrixAt(i,m);m.multiply(new THREE.Matrix4().makeTranslation(0,.09,0));slabEdges.setMatrixAt(i,m)}PR.add(slabEdges);
 const hitA=new THREE.Mesh(box(3.5,.2,1.7),glow(C.ion,0));const hA=new THREE.Matrix4();slabs.getMatrixAt(slabIdx['-1,2,3'],hA);hitA.position.setFromMatrixPosition(hA);PR.add(hitA);
 // source pylons on the horizon + conduits into the press
 const SRC=[['web',-38,-96,20],['filings',-27,-104,16],['audio',-15,-100,22],['video',14,-98,18],['social',21,-88,21],['papers',27,-80,15]];
 const conduits=[];const srcLabels=[];
 for(const[n,x,z,h]of SRC){PR.add(solid(box(1.6,h,1.6),M.graph,V(x,h/2,z)),solid(box(2.6,.6,2.6),M.dark,V(x,h+.3,z)));
  const c=tube([V(x,h+.5,z),V(x*.6,h*.9,lerp(z,PZ,.45)),V(x*.15,9.6,PZ+1),V(0,8.9,PZ+3)],.05,glow(C.ion,.35),120);PR.add(c);conduits.push(c);srcLabels.push({text:n,pos:V(x,h+2.2,z)})}
 // claim cards (vector UI on a solid slate)
 const mkCard=()=>{const cv=document.createElement('canvas');cv.width=1024;cv.height=640;const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=8;
  const g=new THREE.Group();const slate=new THREE.Mesh(new RoundedBoxGeometry(2.8,1.75,.12,3,.06),M.dark);g.add(slate);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.65),new THREE.MeshBasicMaterial({map:tx,transparent:true,toneMapped:false}));face.position.z=.065;g.add(face);g.userData={cv,tx,state:''};return g};
 const cardA=mkCard(),cardB=mkCard();add(cardA);add(cardB);
 const traceA=tube([V(-1.2,3.2,PZ+3.6),V(-4,3.6,PZ+1),V(-6.8,3.6,PZ-5),hitA.position.clone()],.04,glow(C.ion,.95),120);PR.add(traceA);
 const traceB=tube([V(1.2,3.2,PZ+3.6),V(4,3.4,PZ+1),V(6.6,3.0,PZ-6),V(7.2,2.6,PZ-14),V(7.4,2.4,PZ-20)],.035,glow(0x9fb3c6,.7),160);PR.add(traceB);

 // ---------- 3. COMMAND DECK (MX) ----------
 const DZ=-132;const DK=new THREE.Group();add(DK);
 DK.add(solid(box(9,.6,6),M.plinth,V(0,.3,DZ)),solid(box(6,.5,3),M.graph,V(0,.85,DZ)));
 const phone=solid(new RoundedBoxGeometry(5.2,10.4,.5,6,.55),M.graph,V(0,6.3,DZ));DK.add(phone);
 const scv=document.createElement('canvas');scv.width=900;scv.height=1840;const stx=new THREE.CanvasTexture(scv);stx.colorSpace=THREE.SRGBColorSpace;stx.anisotropy=8;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.6,9.4),new THREE.MeshBasicMaterial({map:stx,toneMapped:false}));screen.position.set(0,6.3,DZ+.27);DK.add(screen);
 const gate=new THREE.Group();DK.add(gate);gate.position.set(0,0,DZ+4.2);
 const gPostL=solid(box(.35,2.4,.35),M.graph,V(-3.4,1.2,0)),gPostR=solid(box(.35,2.4,.35),M.graph,V(3.4,1.2,0));gate.add(gPostL,gPostR);
 const gBar=new THREE.Mesh(box(6.4,.22,.22),glow(C.amber,1));gBar.position.set(0,2.1,0);gate.add(gBar);
 const deckRail=tube([V(-4.2,.14,PZ-24),V(-4.6,.14,-100),V(-3.6,.14,DZ+5),V(-2.4,.62,DZ+2.6)],.06,glow(C.ion,.4),160);add(deckRail);

 // ---------- 4. PLATFORM (Verslay, labelled) ----------
 const TX=36,TZ=-104;const PL=new THREE.Group();add(PL);
 PL.add(solid(box(14,3,14),M.plinth,V(TX,1.5,TZ)),solid(box(10,16,10),M.graph,V(TX,11,TZ)),solid(box(7.6,14,7.6),M.graph,V(TX,26,TZ)),solid(box(5,8,5),M.graph,V(TX,37,TZ)),solid(box(2,4,2),M.dark,V(TX,43,TZ)));
 const wins=new THREE.InstancedMesh(box(1.1,.12,.04),glow(0x6fbfe0,.35),160);let wi=0;
 for(let f=0;f<4;f++)for(let y=0;y<10;y++)for(let i=0;i<4;i++){const a=f*Math.PI/2;const off=(i-1.5)*2;const d=5.03;const yy=4.5+y*1.4;dummy.position.set(TX+Math.sin(a)*d+Math.cos(a)*off,yy,TZ+Math.cos(a)*d-Math.sin(a)*off);dummy.rotation.set(0,a,0);dummy.updateMatrix();if(wi<160)wins.setMatrixAt(wi++,dummy.matrix)}
 PL.add(wins);
 const spine=tube([V(TX,3,TZ+5.1),V(TX,19,TZ+5.1),V(TX,19.2,TZ+3.9),V(TX,33,TZ+3.9),V(TX,33.2,TZ+2.6),V(TX,42,TZ+2.6)],.16,glow(C.ion,1),200);PL.add(spine);
 const sockets=[];const cables=[];const srcs=[V(2.6,.15,-2),V(8.6,.15,PZ),V(3.2,.15,DZ+2),V(-24,.15,-40),V(-30,.15,-70),V(14,.15,-150)];
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.4;const p=V(TX+Math.sin(a)*9.2,.5,TZ+Math.cos(a)*9.2);const s=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,1,20),M.graph);s.position.copy(p);PL.add(s);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.06,20),glow(C.ion,.0));cap.position.copy(p).add(V(0,.53,0));PL.add(cap);sockets.push(cap);
  const src=srcs[i];const mid=src.clone().lerp(p,.5);mid.y=.15;const cb=tube([src,V(lerp(src.x,p.x,.3),.15,lerp(src.z,p.z,.15)),mid,V(lerp(src.x,p.x,.85),.15,lerp(src.z,p.z,.9)),p.clone().setY(.4)],.07,glow(C.ion,.75),160);PL.add(cb);cables.push(cb)}
 // early learning outlines at the district edge
 const LRN=new THREE.Group();add(LRN);for(let i=0;i<14;i++){const w=1.2+((i*37)%5)*.4,h=.8+((i*53)%7)*.5;const g=new THREE.LineSegments(new THREE.EdgesGeometry(box(w,h,w)),new THREE.LineBasicMaterial({color:0x35546e,transparent:true,opacity:0}));g.position.set(-52+(i%7)*4.2,h/2,-20-Math.floor(i/7)*5-(i*13)%3);LRN.add(g)}
 // horizon: amber line at the vanishing point + glow band
 const horizonLine=new THREE.Mesh(box(.12,60,.12),glow(C.amber,.0));horizonLine.position.set(0,30,-420);add(horizonLine);
 const band=new THREE.Mesh(new THREE.PlaneGeometry(1400,90),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uO:{value:.0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float uO;void main(){float g=exp(-pow((v.y-.06)*7.,2.));gl_FragColor=vec4(mix(vec3(.04,.09,.13),vec3(1.,.62,.24),g*.55)*g,g*uO);}'}));band.position.set(0,40,-440);add(band);

 // ---------- the signal (one bright packet + trail) ----------
 const sig=new THREE.Mesh(new THREE.SphereGeometry(.28,20,14),glow(0xdffaff,1));add(sig);
 const sigLight=new THREE.PointLight(C.ion,12,12,1.8);add(sigLight);
 const TRN=48;const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TRN*3),3));trailGeo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(TRN*3),3));
 const trail=new THREE.Points(trailGeo,new THREE.PointsMaterial({size:.22,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));add(trail);
 // signal route: segments of film T mapped to curves
 const cv3=p=>new THREE.CatmullRomCurve3(p,false,'catmullrom',.3);
 // sky link: the approved action leaves the phone and draws a line to the platform
 const skyCurve=cv3([V(0,11.6,DZ),V(0,16,DZ+6),V(14,18,-118),V(TX-6,8,TZ+8),V(TX,3.2,TZ+5.3)]);
 const skyLink=tube(skyCurve.getPoints(80),.07,glow(C.ion,.85),240);add(skyLink);
 const ROUTE=[
  [6,12.2,cv3([V(0,.5,52),V(0,.5,34),V(0,.6,16.8)])],
  [12.2,17,backup.userData.curve],
  [17,21.5,cv3([V(2.6,.4,2.6),V(1.2,.6,1.2),V(0,1.4,0),V(0,5,0),V(0,9.6,0)])],
  [21.5,27,{getPointAt:u=>{const a=u*Math.PI*2*1.06+Math.PI;return V(Math.sin(a)*(RB-.2)*ss(0,.12,u)+0,lerp(9.6,2.2,ss(0,.12,u)),Math.cos(a)*(RB-.2)*ss(0,.12,u))}}],
  [27,34,cv3([V(0,2.2,-RB),V(0,7,-6),V(0,11.2,0),V(0,12.5,-14),V(0,9,-34),V(0,6.2,-52),V(0,4.2,-60)])],
  [71,79,skyCurve],
  [79,84.5,spine.userData.curve],
  [84.5,92,{getPointAt:()=>V(TX,42,TZ+2.6)}],
  [92,99,cv3([V(TX,43,TZ),V(20,50,-200),V(0,30,-420)])],
 ];
 const sigAt=T=>{for(const[a,b,c]of ROUTE)if(T>=a&&T<=b)return c.getPointAt(cl((T-a)/(b-a)));return null};

 Object.assign(W,{skyLink,nodes,nodeY,seams,bays,ring,spokes,junc,jLed,inRail,primary,backup,breakMark,svc,svcBus,rail,scanBar,slabs,hitA,conduits,cardA,cardB,traceA,traceB,screen,stx,scv,gate,gBar,deckRail,spine,sockets,cables,wins,LRN,horizonLine,band,sig,sigLight,trail,sigAt,PZ,DZ,TX,TZ});
 W.labels=[
  {text:'primary',pos:V(-1.6,.6,9.6),t:[9,19],cls:''},{text:'backup',pos:V(6.8,.6,10),t:[11,19],cls:'c'},
  {text:'memory',pos:V(0,11.6,2.8),t:[16.5,24],cls:'c'},{text:'agents',pos:V(-12.5,3.6,4),t:[21.5,29],cls:''},{text:'services',pos:V(-12,4,-9),t:[22,29],cls:''},
  ...srcLabels.map(s=>({...s,t:[33,46],cls:''})),
  {text:'stored source',pos:V(-8,7.2,PZ-6.4),t:[38,45],cls:'c'},{text:'no source found',pos:V(7.6,6.9,PZ-16),t:[46,53],cls:'a'},
  {text:'approval gate',pos:V(4.6,2.6,DZ+4.2),t:[61,69],cls:'a'},
  {text:'verslay',pos:V(TX,46.5,TZ),t:[78,92],cls:'plate'},
 ];
 return W;
}

// ---------- per-frame update: everything from T ----------
const col=new THREE.Color();
export function updateWorld(W,T,time){
 // signal
 {const u=cl((T-71)/8);const g=W.skyLink.geometry;g.setDrawRange(0,Math.floor(g.index.count*u/6)*6);W.skyLink.visible=u>0&&T<88;W.skyLink.material.opacity=.85*(1-ss(83,88,T))}
 const p=W.sigAt(T);const vis=!!p&&T<99;W.sig.visible=vis;W.sigLight.visible=vis;
 if(p){W.sig.position.copy(p);W.sigLight.position.copy(p);const s=1+.18*Math.sin(time*6);W.sig.scale.setScalar(s)}
 const pa=W.trail.geometry.attributes.position,ca=W.trail.geometry.attributes.color;
 for(let i=0;i<pa.count;i++){const q=W.sigAt(T-i*.045);if(q&&vis){pa.setXYZ(i,q.x,q.y,q.z);const f=Math.pow(1-i/pa.count,1.6);ca.setXYZ(i,.37*f,.88*f,f)}else{pa.setXYZ(i,0,-50,0);ca.setXYZ(i,0,0,0)}}
 pa.needsUpdate=true;ca.needsUpdate=true;

 // 1. switchyard
 const inc=ss(5,9,T);W.inRail.material.opacity=.15+.4*inc;
 const drop=ss(10.2,11.4,T);const flick=T>10.2&&T<11.6?(Math.sin(T*90)>0?1:.25):1;
 W.primary.material.color.set(C.ion).lerp(col.set(0x24313f),drop);W.primary.material.opacity=lerp(.9,.6,drop)*flick;
 W.breakMark.visible=drop>.5;W.breakMark.children.forEach(m=>m.material.opacity=.9*drop);
 W.backup.material.opacity=.12+.85*ss(11.6,12.6,T);
 W.jLed.material.color.set(T>11.2&&T<12.4?0x9fb3c6:C.ion);
 const write=ss(17.5,21.5,T);// memory write climbs the lattice
 const ny=W.nodeY;for(let i=0;i<ny.length;i++){const lvl=ny[i]/11;const on=ss(lvl-.06,lvl+.04,write);const base=.12;const v=base+on*.88;col.setRGB(.37*v+.05*(1-on),.88*v,v);W.nodes.setColorAt(i,col)}W.nodes.instanceColor.needsUpdate=true;
 W.seams.forEach(s=>s.material.opacity=.15*ss(17,19,T)+.6*ss(19,22,T)*(1-.3*ss(30,40,T)));
 const ringU=cl((T-21.5)/5.5);const sigA=ringU*Math.PI*2*1.06;
 W.bays.forEach((b,i)=>{let ang=((b.a-Math.PI)%(Math.PI*2)+Math.PI*4)%(Math.PI*2);const lit=T>21.5?ss(ang-.05,ang+.35,sigA):0;const v=.1+.9*lit;b.led.material.opacity=v;b.led2.material.opacity=.06+.5*lit*(.6+.4*Math.sin(time*3+i));W.spokes[i].material.opacity=.08+.5*lit});
 W.ring.material.opacity=.1+.35*ss(21,23,T);
 W.svc.forEach((l,i)=>{let o=.85;if(i===3){const r=T>23.5&&T<25.8;o=r?(T<24.5?.05:.25+.6*ss(24.5,25.8,T)):.85}l.material.opacity=o*ss(18,22,T)+.08});
 W.svcBus.material.opacity=.08+.25*ss(20,23,T);
 W.rail.material.opacity=.2+.45*ss(26,29,T);

 // 2. press
 const PZ=W.PZ;W.conduits.forEach((c,i)=>{c.material.opacity=.1+.4*ss(31+i*.4,34+i*.4,T)});
 W.scanBar.material.opacity=win(T,34,44,1)*.9;W.scanBar.position.y=4+2.6*Math.sin(T*1.7);
 // card A: born from the signal at the press, stamped verified, then carried to the deck
 const A=W.cardA,B=W.cardB;
 const aBorn=ss(33.6,35,T);A.visible=T>33.6&&T<61.2;
 if(T<=54){A.position.set(lerp(0,-1.4,ss(35,37,T)),lerp(4.2,3.2,ss(34,36.5,T)),PZ+3.6);A.rotation.set(0,lerp(0,.12,ss(36,38,T)),0);A.scale.setScalar(.2+.8*aBorn)}
 else{const u=ss(54,60.6,T);const path=new THREE.CatmullRomCurve3([V(-1.4,3.2,PZ+3.6),V(-.5,5.2,-80),V(0,6.4,-112),V(0,8.1,W.DZ+.45)]);A.position.copy(path.getPointAt(u));A.rotation.set(0,lerp(.12,0,u),0);A.scale.setScalar(lerp(1,.62,ss(57,60.6,T)))}
 grow(W.traceA,ss(37.6,40.6,T));W.traceA.material.opacity=.95*(1-ss(52,55,T));
 W.hitA.material.opacity=.85*ss(40.2,41,T)*(1-ss(53,56,T));
 const aState=T>=41.2?'verified':'claim';cardUI(A,aState,'Claim','Source span found');
 // card B: trace finds nothing, card is downgraded and drops one shelf, but stays
 B.visible=T>43.4&&T<92;B.scale.setScalar(.2+.8*ss(43.4,44.8,T));
 B.position.set(lerp(0,1.6,ss(44,46,T)),lerp(4.2,3.2,ss(44,46,T))-1.1*ss(49.2,51,T),PZ+3.6);B.rotation.set(0,lerp(0,-.12,ss(45,47,T)),0);
 grow(W.traceB,ss(45.4,48.4,T));W.traceB.material.opacity=(T>48.2&&T<49.2?(Math.sin(T*80)>0?.7:.15):.55)*(1-ss(50.5,53,T));
 cardUI(B,T>=48.8?'downgraded':'claim','Claim',T>=48.8?'Kept, marked unverified':'Searching sources');

 // 3. deck
 screenUI(W,T);
 const gDown=1-ss(65.6,67.2,T);W.gBar.position.y=lerp(2.9,2.1,gDown)+0;W.gBar.scale.x=lerp(.02,1,gDown);W.gBar.material.opacity=ss(60,61.5,T)*(gDown>.03?1:0);
 W.deckRail.material.opacity=.1+.35*ss(53,57,T);

 // 4. platform: signal climbs the spine, cables plug in, sockets light
 grow(W.spine,ss(79,84.5,T)*.999+.001);W.spine.material.opacity=ss(78.8,79.4,T);
 W.cables.forEach((c,i)=>{const a=80.5+i*.9;grow(c,ss(a,a+3,T));W.sockets[i].material.opacity=ss(a+2.7,a+3.1,T)});
 W.wins.material.opacity=.12+.4*ss(80,86,T);
 // 5. horizon
 W.LRN.children.forEach((g,i)=>g.material.opacity=.7*ss(87+i*.25,89+i*.25,T));
 W.horizonLine.material.opacity=ss(90,94,T);W.band.material.uniforms.uO.value=ss(88,96,T);
}

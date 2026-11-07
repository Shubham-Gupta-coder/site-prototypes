/* v9.2: authored SVG surfaces on depth-tested, shaded world geometry.
 * No SVG is sampled into particles. Every pose and reveal is f(film T).
 * Coordinates are shared with shapes.js; camera and all operation poses are scroll-derived.
 */
import * as THREE from 'three';
import {TER,RAIL,HUB,ISL,ISLD,RUN,ST,GEAR0,VALVE,TRAINS} from './shapes.js?v=v9_5a';
import {rng} from './lib.js?v=v9_5a';
import {createStudio} from './studio.js?v=v9_5a';
const ASSETS=['compute-rack','workspace','agent-control','memory','machined-gear','context-core','chat','docs','sheet','inbox','calendar','report','bridge-deck','system-plan','hub-mark'];
const smooth=(a,b,t)=>{const k=Math.max(0,Math.min(1,(t-a)/(b-a)));return k*k*(3-2*k)};
const hold=(t,a,b,c=101,d=102)=>smooth(a,b,t)*(1-smooth(c,d,t));
const V=(...v)=>new THREE.Vector3(...v);
export function createVectorWorld(scene,renderer){
 const root=new THREE.Group();root.name='SVG apparatus';root.visible=false;scene.add(root);
 const studio=createStudio(scene,renderer);
 const operationState={};
 const materials=[],geometries=[],textures=new Map(),domains=Array.from({length:18},()=>[]),updates=[];
 const M=(c,metal=.5)=>new THREE.MeshPhysicalMaterial({color:c,metalness:metal,roughness:.32,clearcoat:.25,clearcoatRoughness:.25,envMapIntensity:1.15});
 const steel=M(0x778993,.76),dark=M(0x142732,.35),brass=M(0xb7c6cb,.78),edge=M(0xcbd6d8,.72),porcelain=M(0xb9c6c9,.12);
 const signal=new THREE.MeshStandardMaterial({color:0xf0c891,emissive:0xc28132,emissiveIntensity:.4,roughness:.33,metalness:.22});
 const geometryCache=new Map();
 let loaded=false,disposed=false;
 // A moving machined-edge dissolve, not a time tween or a flat alpha billboard.
 // Each material receives the same fade as its tagged particle source group.
 function tracked(material){
  const m=material.clone();const u={value:0};m.userData.vectorK=u;
  m.onBeforeCompile=s=>{s.uniforms.uVectorK=u;
   s.vertexShader='varying vec3 vVectorPosition;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvVectorPosition=position;');
   s.fragmentShader='uniform float uVectorK; varying vec3 vVectorPosition;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
    float vv=fract(sin(dot(floor(vVectorPosition*36.),vec3(12.9898,78.233,31.17)))*43758.5453);
    float scan=clamp(vVectorPosition.y*.065+.48,0.,1.);
    if(uVectorK<.999 && uVectorK*1.25 < scan*.65+vv*.35) discard;
   `);
  };m.customProgramCacheKey=()=> 'v9_5a-vector-dissolve';materials.push(m);return m;
 }
 function group(domain,parent=root){const g=new THREE.Group();g.userData.materials=new Set();g.userData.k=0;domains[domain].push(g);parent.add(g);return g}
 function mesh(g,geometry,material,xyz=[0,0,0],ry=0){const m=new THREE.Mesh(geometry,tracked(material));m.position.set(...xyz);m.rotation.y=ry;g.add(m);g.userData.materials.add(m.material);geometries.push(geometry);return m}
 function box(g,x,y,z,w,h,d,m=steel,ry=0){
  let geo;const key=[w,h,d].join(',');
  if(geometryCache.has(key))geo=geometryCache.get(key);
  else if(w>.6&&h>.12&&d>.10){
   const r=Math.min(.055,w*.06,h*.06,d*.10),s=new THREE.Shape();
   s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
   geo=new THREE.ExtrudeGeometry(s,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,steps:1,curveSegments:3});geo.translate(0,0,-(d-r*2)/2);
  }else geo=new THREE.BoxGeometry(w,h,d);
  geometryCache.set(key,geo);return mesh(g,geo,m,[x,y,z],ry);
 }
 const cyl=(g,x,y,z,r,h,m=steel)=>mesh(g,new THREE.CylinderGeometry(r,r,h,32,1),m,[x,y,z]);
 function torus(g,x,y,z,r,t,m=brass,flat=true){const a=mesh(g,new THREE.TorusGeometry(r,t,8,64),m,[x,y,z]);if(flat)a.rotation.x=Math.PI/2;return a}
 function svg(g,name,x,y,z,w,h,ry=0,rx=0){const m=new THREE.MeshStandardMaterial({map:textures.get(name),transparent:true,alphaTest:.08,side:THREE.DoubleSide,color:0xffffff,roughness:.43,metalness:.12,envMapIntensity:.55});const a=mesh(g,new THREE.PlaneGeometry(w,h),m,[x,y,z],ry);a.rotation.x=rx;return a}
 function beam(g,a,b,r=.035,mat=brass){const va=V(...a),vb=V(...b),dir=vb.clone().sub(va);const m=mesh(g,new THREE.CylinderGeometry(r,r,dir.length(),7),mat,va.clone().add(vb).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());return m}
 function bolts(g,w,d,y){for(const x of[-w/2+.16,w/2-.16])for(const z of[-d/2+.16,d/2-.16])cyl(g,x,y,z,.065,.035,brass)}
 function rack(g,x,z,h,w=.95,d=1.0){box(g,x,h/2,z,w,h,d,dark);svg(g,'compute-rack',x,h/2,z+d/2+.008,w,h);svg(g,'compute-rack',x+w/2+.008,h/2,z,d,h,Math.PI/2);box(g,x,h+.025,z,w+.035,.05,d+.035,porcelain);for(const dx of[-w/2,w/2])box(g,x+dx,h/2,z+d/2+.025,.025,h,.035,brass);}
 function bridge(g,a,b,w=.85){const va=V(...a),vb=V(...b),mid=va.clone().add(vb).multiplyScalar(.5),len=va.distanceTo(vb);const sub=new THREE.Group();g.add(sub);sub.position.copy(mid);sub.rotation.y=Math.atan2(vb.x-va.x,vb.z-va.z);
  // group uses inherited domain materials; children geometry uses local coordinates.
  const deck=mesh(g,new THREE.BoxGeometry(w,.18,len),steel);g.remove(deck);sub.add(deck);
  const skin=svg(g,'bridge-deck',0,.095,0,len,w,0,-Math.PI/2);g.remove(skin);sub.add(skin);skin.rotation.z=Math.PI/2;
  for(const x of[-w/2,w/2]){const a=mesh(g,new THREE.BoxGeometry(.035,.045,len),brass,[x,.18,0]);g.remove(a);sub.add(a)}
  for(let z=-len/2+.6;z<len/2;z+=1.4){const a=mesh(g,new THREE.BoxGeometry(w*.8,.65,.09),dark,[0,-.39,z]);g.remove(a);sub.add(a)}
  return sub;
 }
 function route(g,pts,radius=.03,token=.06,rate=.6){
  const vertices=pts.map(p=>V(...p));if(vertices[0].equals(vertices[vertices.length-1]))vertices.pop();
  const curve=new THREE.CurvePath();for(let i=0;i<vertices.length;i++)curve.add(new THREE.LineCurve3(vertices[i],vertices[(i+1)%vertices.length]));
  if(g.userData.solidRoute)mesh(g,new THREE.TubeGeometry(curve,64,radius*.34,5,true),steel);
  const courier=box(g,0,0,0,token*2,token,token,signal);
  updates.push(T=>{const phase=(T*rate*.1)%1;curve.getPointAt(phase,courier.position);const tangent=curve.getTangentAt(phase);courier.quaternion.setFromUnitVectors(V(1,0,0),tangent);operationState.routePhase=phase});return courier;
 }
 function build(){
  const engraving=group(15);svg(engraving,'hub-mark',0,1.045,.55,4.4,.83,0,-Math.PI/2);
  engraving.userData.extra=T=>hold(T,11.5,12.9,63.5,66.4)+hold(T,78,79.8);
  const openingType=group(15);svg(openingType,'hub-mark',0,1.73,.205,8.2,1.54);openingType.userData.extra=T=>hold(T,3.5,4.3,6.8,8.2);
  const openingPlate=group(16);box(openingPlate,0,1.75,-.03,9.6,2.6,.30,steel);box(openingPlate,0,1.75,.135,9.25,2.25,.055,dark);
  for(const y of [.49,3.01])box(openingPlate,0,y,.148,9.4,.045,.025,edge);
  for(const x of [-4.7,4.7])box(openingPlate,x,1.75,.148,.045,2.48,.025,edge);
  for(const x of [-4.47,4.47])for(const y of [.72,2.78]){const screw=cyl(openingPlate,x,y,.185,.035,.022,brass);screw.rotation.x=Math.PI/2}
  box(openingPlate,0,.25,0,10.6,.5,1.2,dark);box(openingPlate,0,.52,0,10.7,.045,1.24,steel);
  for(const x of [-3.5,3.5])box(openingPlate,x,.58,-.07,.21,.35,.3,steel);
  const flow=group(17);flow.userData.solidRoute=true;for(const t of Object.values(TER)){const d=Math.hypot(t[0],t[2]),u=[t[0]/d,t[2]/d];route(flow,[[u[0]*2.8,.47,u[1]*2.8],[u[0]*(d-4.8),.47,u[1]*(d-4.8)],[u[0]*(d-4.8)+.12,.47,u[1]*(d-4.8)+.12],[u[0]*2.8+.12,.47,u[1]*2.8+.12]],.025,.075,.65)}
  // CLOUD. Fifteen large, individually legible racks retain the two peaks of v9.
  const cloud=group(0);cloud.position.set(...TER.cloud);
  box(cloud,0,-.08,0,13.6,.18,7.9,dark);bolts(cloud,13.6,7.9,.03);
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){
   const x=(col-2)*2.18,z=(row-1)*2.28;
   const h=1.05+5.9*Math.exp(-((x+2.3)**2/8+(z+.4)**2/7))+4.4*Math.exp(-((x-3.2)**2/6+(z-.8)**2/7));
   rack(cloud,x,z,h,1.32,1.36);
   const scanner=box(cloud,x,.3,z+.71,1.0,.025,.025,signal);
   updates.push(T=>{scanner.position.y=.25+(h-.5)*(.5+.5*Math.sin(T*.68+row*.8+col*.5));operationState.computeRead=scanner.position.y});
  }
  for(const x of[-5.4,5.4]){box(cloud,x,.23,3.6,1.4,.4,.38,steel);beam(cloud,[x,.45,3.6],[x,1.2,3.6],.06,brass)}
  // APPS: one architectural work surface, a source layer and the path between them.
  const apps=group(1);apps.position.set(...TER.app);box(apps,0,.05,0,11,.16,8,dark);
  box(apps,.8,3.7,-.1,6.4,7.1,1.25,dark);box(apps,.8,7.3,-.1,6.55,.12,1.4,porcelain);
  for(const x of[-2.45,4.05])box(apps,x,3.7,.6,.08,7.1,.10,edge);
  for(let y=.7;y<3.2;y+=.32)box(apps,.8,y,.62,6.3,.035,.07,steel);
  svg(apps,'workspace',.8,4.75,.67,6.3,4.38);
  box(apps,-3.6,2.6,1.1,2.25,4.9,.6,porcelain);svg(apps,'docs',-3.6,3,1.42,2.1,3.2);
  box(apps,.4,.38,1.35,9.7,.55,2.5,steel);
  const sourceSlide=box(apps,-3.6,.9,1.4,1.8,.09,1.5,porcelain);
  updates.push(T=>{const p=.5+.5*Math.sin(T*.65);sourceSlide.position.x=-3.6+p*3.1;operationState.appHandoff=p});
  route(apps,[[-3.6,1,1.85],[-1.8,1,1.85],[-1.8,2.9,.8],[.7,2.9,.8],[.7,5,.8],[3,5,.8],[3,1,1.85],[-3.6,1,1.85]],.055,.11,.62);
  // AGENTS. Mechanical wheels and a legible logical workflow share one machine.
  const agents=group(3);agents.position.set(...TER.gears);box(agents,.4,.25,0,8,.5,3.3,dark);
  const gearSpecs=[[-1.6,2.9,0,2.4,1],[2,1.55,.35,1.45,-1.65],[.1,5.85,-.35,1,-2.4]];
  for(const [x,y,z,r,speed]of gearSpecs){
   const rotor=new THREE.Group();agents.add(rotor);rotor.position.set(x,y,z);
   const shape=new THREE.Shape(),teeth=28;
   for(let i=0;i<=teeth*4;i++){const a=i/(teeth*4)*Math.PI*2,rr=r*(i%4===1||i%4===2?1:.94);const xx=Math.cos(a)*rr,yy=Math.sin(a)*rr;i?shape.lineTo(xx,yy):shape.moveTo(xx,yy)}
   const hole=new THREE.Path();hole.absarc(0,0,r*.73,0,Math.PI*2,true);shape.holes.push(hole);
   const body=mesh(agents,new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.028,bevelThickness:.025,bevelSegments:2,steps:1}),steel);agents.remove(body);rotor.add(body);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;const spoke=box(agents,Math.cos(a)*r*.42,Math.sin(a)*r*.42,.08,r*.68,.13,.13,edge);agents.remove(spoke);rotor.add(spoke);spoke.rotation.z=a;}
   const bearing=torus(agents,0,0,.10,r*.20,.06,edge,false);agents.remove(bearing);rotor.add(bearing);
   const face=svg(agents,'machined-gear',0,0,.205,r*2.02,r*2.02);agents.remove(face);rotor.add(face);
   updates.push(T=>{rotor.rotation.z=-T*.11*speed;operationState.drive=rotor.rotation.z});
   beam(agents,[x,.4,-.4],[x,y,-.4],.11,steel);
  }
  box(agents,1,2.8,1.35,4.9,3.7,.25,dark);svg(agents,'agent-control',1,2.8,1.49,4.8,3.6);
  for(const x of[-.7,2.7])beam(agents,[x,.5,1.25],[x,1.1,1.25],.055,steel);
  const cv=(px,py)=>[1+(px/1440-.5)*4.8,2.8+(.5-py/1080)*3.6,1.54];
  route(agents,[cv(160,342),cv(460,342),cv(778,342),cv(778,675),cv(1210,675),cv(1150,879),cv(460,879),cv(460,342),cv(160,342)],.034,.065,.82);
  const gate=box(agents,...cv(1110,675),.04,.36,.04,porcelain);
  updates.push(T=>{const p=.5+.5*Math.sin(T*.82);gate.position.y=cv(1110,675)[1]+p*.28;operationState.reviewGate=p});
  // MEMORY. Solid cylindrical stores plus curved banding, front SVG address panels.
  const memory=group(3);memory.position.set(...TER.data);box(memory,.2,.07,0,7,.14,5.2,dark);
  for(const [x,z,h,r]of[[-1.9,-1,4.4,.9],[.4,.8,5.2,1.05],[2.5,-1.2,3.6,.75]]){
   cyl(memory,x,h/2,z,r,h,dark);
   for(let y=.18;y<h;y+=.48){cyl(memory,x,y,z,r+.04,.055,edge);torus(memory,x,y+.035,z,r+.045,.018,brass)}
   cyl(memory,x,h+.025,z,r+.055,.08,steel);svg(memory,'memory',x,h/2,z+r+.09,r*1.7,h*.95);
   for(const dx of[-r*.85,r*.85])beam(memory,[x+dx,.12,z+r+.06],[x+dx,h-.12,z+r+.06],.027,edge);
   const head=torus(memory,x,.4,z,r+.09,.032,steel);const indicator=box(memory,x,.4,z+r+.14,r*1.3,.035,.035,signal);
   updates.push(T=>{const p=.5+.5*Math.sin(T*.43+x*.4);head.position.y=indicator.position.y=.35+(h-.7)*p;operationState.memoryRead=p});

  }
  // HUB. The drum is now machined solid metal. Dot name and original plaques survive.
  const hub=group(4);cyl(hub,0,.5,0,HUB.r,1,steel);cyl(hub,0,1.005,0,HUB.r-.12,.025,dark);
  for(const y of[.08,.92,1.04])torus(hub,0,y,0,HUB.r,.035,brass);
  for(const r of[1.15,1.95])torus(hub,0,1.03,0,r,.018,edge);
  for(let i=0;i<48;i++){const a=i*Math.PI/24;cyl(hub,Math.sin(a)*2.48,1.06,Math.cos(a)*2.48,.038,.025,brass)}
  // LINKING APPARATUS. Depth-tested curved track and structural bridges, not line dots.
  const track=group(2); // same fade as agents, world-space separate group
  for(const r of[RAIL.r-.2,RAIL.r+.2])torus(track,0,RAIL.y,0,r,.045,edge);
  for(let i=0;i<64;i++){const a=i*Math.PI/32;const sl=box(track,Math.sin(a)*RAIL.r,RAIL.y-.07,Math.cos(a)*RAIL.r,.08,.09,.65,brass,-a+Math.PI/2);}
  for(let i=0;i<18;i++){const a=i*Math.PI/9;box(track,Math.sin(a)*RAIL.r,RAIL.y/2-.06,Math.cos(a)*RAIL.r,.18,RAIL.y-.12,.18,dark)}
  const links=group(5);for(const t of Object.values(TER)){const d=Math.hypot(t[0],t[2]),u=[t[0]/d,t[2]/d];
   const a=V(u[0]*2.7,.35,u[1]*2.7),b=V(u[0]*(d-4.8),.35,u[1]*(d-4.8));
   const span=bridge(links,a.toArray(),b.toArray(),.8),direction=b.clone().sub(a);
   // Match original REV group 13: the territories reach halfway, then lock at T 26.
   updates.push(T=>{let r=T<=9?.25:T<13?.25+(T-9)/4*.2:T<21.5?.45+(T-13)/8.5*.05:T<26?.5+(T-21.5)/4.5*.5:1;span.scale.z=r;span.position.copy(b).addScaledVector(direction,-r*.5)});
  }
  links.userData.extra=T=>hold(T,11.5,12.8,35.1,37.5)+hold(T,78.3,79.8);
  const viaduct=group(5);bridge(viaduct,[-11,RUN.y,RUN.z],[11,RUN.y,RUN.z],1.1);
  for(let x=-10;x<=10;x+=2.5)box(viaduct,x,RUN.y/2-.1,RUN.z,.22,RUN.y-.2,.22,steel);
  viaduct.userData.extra=T=>hold(T,38.7,40.2,52,54);
  const broken=group(5);broken.userData.extra=T=>hold(T,56.7,58.3,64.1,66.2);
  for(const q of ISL){const L=Math.hypot(q.c[0],q.c[2]),u=[q.c[0]/L,q.c[2]/L];const a=[u[0]*7,RAIL.y,u[1]*7],b=[a[0]+(q.c[0]-a[0])*.5,RAIL.y+(q.c[1]-1-RAIL.y)*.5,a[2]+(q.c[2]-a[2])*.5];bridge(broken,a,b,.7)}
  // CONTEXT core is a real structural column with SVG chambers, metal fins and crown.
  const core=group(6);cyl(core,0,3.1,-1.2,.76,4.2,dark);
  for(let y=1.05;y<5.4;y+=.55)torus(core,0,y,-1.2,.79,.035,brass);
  svg(core,'context-core',0,3.15,-.30,1.4,4.3);svg(core,'context-core',.9,3.15,-1.2,1.4,4.3,Math.PI/2);
  for(const x of[-.92,.92])beam(core,[x,1.05,-1.2],[x,5.4,-1.2],.06,edge);
  torus(core,0,5.42,-1.2,1.0,.035,edge);
  route(core,[[-.55,1.15,-.24],[-.55,4.7,-.24],[.55,4.7,-.24],[.55,1.15,-.24],[-.55,1.15,-.24]],.035,.075,.68);
  for(let i=0;i<3;i++){const carriage=box(core,0,1.8+i*1.2,-.20,.92,.06,.07,porcelain);updates.push(T=>{carriage.position.y=1.6+i*1.15+Math.sin(T*.55+i)*.14;operationState.contextBus=carriage.position.y});}

  // Pods follow the original ring-to-viaduct journey. Solid housings, SVG control face.
  const pods=group(9);
  TRAINS.forEach((a,i)=>{const g=new THREE.Group();pods.add(g);
   const hull=mesh(pods,new THREE.CapsuleGeometry(.33,1.7,4,16),steel);pods.remove(hull);g.add(hull);hull.rotation.z=Math.PI/2;
   const face=svg(pods,'agent-control',0,.02,.336,1.35,.48);pods.remove(face);g.add(face);
   for(const x of[-.8,.8]){const ring=torus(pods,x,0,0,.34,.025,brass,false);pods.remove(ring);g.add(ring);ring.rotation.y=Math.PI/2;}
   updates.push(T=>{const r=smooth(35,40,T),back=smooth(74,79,T);let k=r*(1-back);g.position.set(Math.sin(a)*RAIL.r*(1-k)+(RUN.x[i]-1.7)*k,(RAIL.y+.36)*(1-k)+(RUN.y+.47)*k,Math.cos(a)*RAIL.r*(1-k)+RUN.z*k);g.rotation.y=a*(1-k)});
  });
  const valve=group(10);const wheel=svg(valve,'machined-gear',0,0,0,.88,.88);beam(valve,[0,-.05,-.08],[0,-.75,-.08],.05,steel);
  updates.push(T=>{const k=smooth(35,40,T)*(1-smooth(52,57,T));valve.position.set(VALVE[0]+(ST.valve[0]-VALVE[0])*k,VALVE[1]+(ST.valve[1]-VALVE[1])*k,VALVE[2]+(ST.valve[2]-VALVE[2])*k);wheel.rotation.z=-smooth(48.5,49.2,T)*Math.PI*.45});
  const dockLinks=group(5);dockLinks.userData.extra=T=>hold(T,78.3,79.8);
  for(const c of ISLD){const d=Math.hypot(c[0],c[2]),u=[c[0]/d,c[2]/d];bridge(dockLinks,[u[0]*(RAIL.r+.3),RAIL.y,u[1]*(RAIL.r+.3)],[c[0]-u[0]*1.3,c[1]+.05,c[2]-u[1]*1.3],.34)}
  const graph=group(11);const rnd=rng(55),nodes=[];
  for(let i=0;i<46;i++){const a=rnd()*Math.PI*2,b=(rnd()-.5)*1.4,d=1+rnd()*1.6;nodes.push([Math.cos(a)*d,6.3+b*1.4,-1.2+Math.sin(a)*d*.7])}
  for(const q of nodes)mesh(graph,new THREE.SphereGeometry(.047,6,6),brass,q);
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(V(...nodes[i]).distanceTo(V(...nodes[j]))<1.15)beam(graph,nodes[i],nodes[j],.008,edge);
  // TOOL islands: proper decks and SVG screens, never a flat screen-filling banner.
  ISL.forEach((q,i)=>{const g=group(7);const dock=ISLD[i];const name={chat:'chat',pay:'docs',sheet:'sheet',inbox:'inbox',cal:'calendar'}[q.k];
   box(g,0,-.1,0,3.4,.2,2.4,steel);box(g,0,-.38,0,2.85,.35,1.8,dark);bolts(g,3.4,2.4,.015);
   box(g,0,.25+1.75/2,-.56,2.7,1.85,.14,dark);svg(g,name,0,.25+1.75/2,-.48,2.6,1.75);
   for(const x of[-1,1])beam(g,[x,.05,-.55],[x,.34,-.55],.05,brass);
   if(q.k==='sheet'){
    box(g,-.5,.04,.65,.85,.055,.62,porcelain,.16);box(g,-.45,.075,.65,.80,.025,.58,edge,.08);
    const pen=beam(g,[.45,.08,.45],[1.1,.08,.7],.022,dark);
   }
   const reading=box(g,-1,.65,-.465,.035,.38,.02,signal);
   updates.push(T=>{reading.position.x=-1.05+((T*.17+i*.19)%1)*2.1;operationState['source'+i]=reading.position.x});
   updates.push(T=>{const d=smooth(74,79,T),scale=1-.23*d;g.position.set(q.c[0]+(dock[0]-q.c[0])*d,q.c[1]+(dock[1]-q.c[1])*d,q.c[2]+(dock[2]-q.c[2])*d);g.rotation.y=q.ry+(-Math.atan2(dock[0],dock[2])*.6-q.ry)*d;g.scale.set(scale,scale,scale)});
  });
  // VIADUCT examples. Original narrative and all existing canvas card text stay.
  const runs=group(8);
  for(const [name,c,w,h]of[['calendar',ST.cal,2.6,1.9],['chat',ST.chat,2.2,1.5]]){
   box(runs,c[0],c[1],c[2]-.07,w+.12,h+.12,.17,dark);svg(runs,name,c[0],c[1],c[2]+.065,w,h);
  }
  const sh=ST.shelf;
  for(const x of[-.85,.85])box(runs,sh[0]+x,sh[1]+.9,sh[2],.055,1.8,.7,edge);
  for(const y of[0,.75,1.5]){box(runs,sh[0],sh[1]+y,sh[2],1.7,.06,.7,steel);for(let i=0;i<3;i++){
   const record=box(runs,sh[0]-.5+i*.5,sh[1]+y+.2,sh[2],.4,.34,.4,porcelain);
   if(y===.75&&i===1)updates.push(T=>{record.position.z=sh[2]+.08+.55*smooth(44.6,45.4,T);operationState.recordRetrieved=record.position.z});
  }}
  const L=ST.ledger;box(runs,L[0],L[1]-.1,L[2],1.7,.14,1.05,dark);svg(runs,'docs',L[0],L[1]+.02,L[2],1.7,1.05,0,-Math.PI/2);
  const review=svg(runs,'report',ST.pay[0],ST.pay[1],ST.pay[2]+.09,1.75,1.25);
  const reviewMesh=box(runs,ST.pay[0],ST.pay[1],ST.pay[2]-.03,1.85,1.35,.14,dark);
  updates.push(T=>{review.visible=reviewMesh.visible=T>=45.2&&T<=52.6;operationState.runCheck=smooth(48.2,49.4,T)});
  const pointer=box(runs,ST.cal[0]-1,ST.cal[1]-.2,ST.cal[2]+.10,.07,.07,.03,signal);
  updates.push(T=>{pointer.position.x=ST.cal[0]-1+smooth(39.4,42.8,T)*1.85;operationState.intentHandoff=pointer.position.x});
  const paper=box(runs,0,0,0,.55,.36,.04,porcelain);
  updates.push(T=>{const e1=smooth(47.4,48.2,T),e2=smooth(49.6,50.6,T);paper.position.set(ST.ledger[0]*(1-e1)+(ST.valve[0]-.65)*e1+3.2*e2,(ST.ledger[1]+.3)*(1-e1)+ST.valve[1]*e1+.4*e2,ST.ledger[2]*(1-e1)+(ST.valve[2]+.05)*e1);operationState.reviewRouting=e1+e2});
  const checkGroup=new THREE.Group();runs.add(checkGroup);
  for(const [a,b] of [[[ST.valve[0]+.5,ST.valve[1]+.35,ST.valve[2]+.1],[ST.valve[0]+.62,ST.valve[1]+.22,ST.valve[2]+.1]],[[ST.valve[0]+.62,ST.valve[1]+.22,ST.valve[2]+.1],[ST.valve[0]+.9,ST.valve[1]+.62,ST.valve[2]+.1]]]){const m=beam(runs,a,b,.025,signal);runs.remove(m);checkGroup.add(m)}
  updates.push(T=>{checkGroup.scale.setScalar(smooth(48.6,49.1,T));operationState.humanCheck=smooth(48.6,49.1,T)});
  route(runs,[[ST.chat[0]-.7,ST.chat[1]-.3,ST.chat[2]+.08],[ST.chat[0]+.8,ST.chat[1]-.3,ST.chat[2]+.08],[ST.shelf[0],ST.shelf[1]+.3,ST.shelf[2]+.5],[ST.chat[0]-.7,ST.chat[1]-.3,ST.chat[2]+.08]],.035,.07,.7);
  // The technical drawing settles as crisp native vector on the same world plane.
  const plan=group(12);svg(plan,'system-plan',0,.095,4,52,44,0,-Math.PI/2);
  const planPath=new THREE.CurvePath();const study=[[-10,17],[-10,8],[0,0],[-5,8],[-5,20.5],[-5,8],[0,0],[0,8],[0,23],[0,8],[0,0],[5,8],[5,20.5],[5,8],[0,0],[10,8],[10,17]];
  for(let i=1;i<study.length;i++)planPath.add(new THREE.LineCurve3(V(study[i-1][0],.18,study[i-1][1]),V(study[i][0],.18,study[i][1])));
  const stylus=box(plan,0,.18,0,.34,.09,.34,signal);
  updates.push(T=>{const phase=smooth(69,74,T);planPath.getPointAt(phase,stylus.position);operationState.planningTrace=phase});
  // The final ring and threads become solid conductors after their particle assembly.
  const halo=group(13);torus(halo,0,8.6,0,7.2,.027,edge);torus(halo,0,8.6,0,6.75,.012,steel);
  for(const target of [...ISLD.map(c=>[c[0],c[1]+1.7,c[2]]),[-14.3,6.2,-8.4],[12,6.4,-8],[-9.6,4.6,7],[9.6,4.6,7]]){
   const d=Math.hypot(target[0],target[2]),a=[target[0]/d*7.2,8.6,target[2]/d*7.2];beam(halo,a,target,.008,edge);
   const marker=mesh(halo,new THREE.SphereGeometry(.045,8,6),signal);updates.push(T=>{const p=(T*.11+d*.01)%1;marker.position.copy(V(...a)).lerp(V(...target),p);operationState.finalRoute=p});
  }
  const orbit=mesh(halo,new THREE.SphereGeometry(.055,8,6),signal);updates.push(T=>{const a=T*.32;orbit.position.set(Math.sin(a)*7.2,8.6,Math.cos(a)*7.2);operationState.sharedSignal=a});

 }
 const ready=Promise.all(ASSETS.map(name=>new Promise((resolve,reject)=>{
  new THREE.TextureLoader().load(new URL(`./assets/${name}.svg?v=v9_5a`,import.meta.url).href,t=>{
   if(disposed){t.dispose();resolve();return}t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;textures.set(name,t);resolve();},undefined,reject);
 }))).then(()=>{if(!disposed){build();loaded=true;root.visible=true}}).catch(error=>{root.visible=false;console.warn('Vector surfaces unavailable; original particle world retained.',error);});
 const fades=new Float32Array(18);
 function update(T){
  fades.fill(0);studio.update(T);if(!loaded)return fades;
  const world=hold(T,10.8,12.5,63.5,66.4)+hold(T,77.6,79.5);
  fades[0]=fades[1]=fades[2]=fades[3]=fades[4]=Math.min(1,world);
  fades[5]=Math.min(1,hold(T,11.5,12.8,35.1,37.5)+hold(T,38.7,40.2,52,54)+hold(T,56.7,58.3,64.1,66.2)+hold(T,78.3,79.8));
  fades[6]=Math.min(1,hold(T,25.6,27.5,35.1,37.5)+hold(T,78.4,80));
  fades[7]=Math.min(1,hold(T,56.7,58.3,64.1,66.2)+hold(T,78.4,80));
  fades[8]=hold(T,38.7,40.2,52,54);
  fades[9]=Math.min(1,hold(T,10.8,12.5,52,54)+hold(T,77.6,79.5));
  fades[10]=Math.min(1,world);
  fades[11]=hold(T,78.4,80);
  fades[12]=hold(T,68.5,69.8,73.9,75.3);
  fades[13]=hold(T,91.7,93.1);
  fades[14]=Math.min(1,world+hold(T,3.5,4.3,6.8,8.2));
  fades[15]=Math.min(1,hold(T,3.5,4.3,6.8,8.2)+hold(T,11.5,12.9,63.5,66.4)+hold(T,78,79.8));
  fades[16]=hold(T,3.5,4.3,6.8,8.2);
  fades[17]=Math.min(1,hold(T,25.5,27,35.1,37.5)+hold(T,56.7,58.3,64.1,66.2)+hold(T,78.3,80));
  for(let d=0;d<domains.length;d++)for(const g of domains[d]){
   const k=g.userData.extra?Math.min(1,g.userData.extra(T)):fades[d];g.visible=k>.001;g.userData.k=k;
   if(g.visible)for(const m of g.userData.materials)m.userData.vectorK.value=k;
  }
  for(const fn of updates)fn(T);
  return fades;
 }
 return {ready,update,root,get loaded(){return loaded},get fades(){return Array.from(fades)},get objects(){return domains.map(a=>a.length)},get operations(){return {...operationState}},dispose(){disposed=true;studio.dispose();root.removeFromParent();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();for(const t of textures.values())t.dispose();steel.dispose();dark.dispose();brass.dispose();edge.dispose();porcelain.dispose();signal.dispose();}};
}

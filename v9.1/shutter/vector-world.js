/* v9.1: authored SVG surfaces on depth-tested, shaded world geometry.
 * No SVG is sampled into particles. Every pose and reveal is f(film T).
 * Coordinates are shared with shapes.js; the original camera is unmodified.
 */
import * as THREE from 'three';
import {TER,RAIL,HUB,ISL,ISLD,RUN,ST,GEAR0,VALVE,TRAINS} from './shapes.js?v=v9_1a';
import {rng} from './lib.js?v=v9_1a';
const ASSETS=['compute-rack','workspace','agent-control','memory','machined-gear','context-core','chat','docs','sheet','inbox','calendar','report','bridge-deck'];
const smooth=(a,b,t)=>{const k=Math.max(0,Math.min(1,(t-a)/(b-a)));return k*k*(3-2*k)};
const hold=(t,a,b,c=101,d=102)=>smooth(a,b,t)*(1-smooth(c,d,t));
const V=(...v)=>new THREE.Vector3(...v);
export function createVectorWorld(scene,renderer){
 const root=new THREE.Group();root.name='SVG apparatus';root.visible=false;scene.add(root);
 const lights=new THREE.Group();lights.add(new THREE.HemisphereLight(0xc4cdd2,0x292019,2.0));
 const key=new THREE.DirectionalLight(0xffdfab,3.5);key.position.set(-12,20,16);lights.add(key);
 const rim=new THREE.DirectionalLight(0xa8bdcf,2.1);rim.position.set(15,9,-12);lights.add(rim);root.add(lights);
 const materials=[],geometries=[],textures=new Map(),domains=Array.from({length:12},()=>[]),updates=[];
 const M=(c,metal=.5)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:.48});
 const steel=M(0x48535f,.62),dark=M(0x1a2530,.42),brass=M(0xb39762,.7),edge=M(0x899599,.62);
 let loaded=false,disposed=false;
 // A moving machined-edge dissolve, not a time tween or a flat alpha billboard.
 // Each material receives the same fade as its tagged particle source group.
 function tracked(material){
  const m=material.clone();const u={value:0};m.userData.vectorK=u;
  m.onBeforeCompile=s=>{s.uniforms.uVectorK=u;
   s.vertexShader='varying vec3 vVectorPosition;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvVectorPosition=position;');
   s.fragmentShader='uniform float uVectorK; varying vec3 vVectorPosition;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <colorspace_fragment>', 'gl_FragColor.rgb=pow(max(gl_FragColor.rgb,vec3(0.)),vec3(1./2.2));');
   s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
    float vv=fract(sin(dot(floor(vVectorPosition*36.),vec3(12.9898,78.233,31.17)))*43758.5453);
    float scan=clamp(vVectorPosition.y*.065+.48,0.,1.);
    if(uVectorK<.999 && uVectorK*1.25 < scan*.65+vv*.35) discard;
   `);
  };m.customProgramCacheKey=()=> 'v9_1a-vector-dissolve';materials.push(m);return m;
 }
 function group(domain,parent=root){const g=new THREE.Group();g.userData.materials=new Set();g.userData.k=0;domains[domain].push(g);parent.add(g);return g}
 function mesh(g,geometry,material,xyz=[0,0,0],ry=0){const m=new THREE.Mesh(geometry,tracked(material));m.position.set(...xyz);m.rotation.y=ry;g.add(m);g.userData.materials.add(m.material);geometries.push(geometry);return m}
 const box=(g,x,y,z,w,h,d,m=steel,ry=0)=>mesh(g,new THREE.BoxGeometry(w,h,d),m,[x,y,z],ry);
 const cyl=(g,x,y,z,r,h,m=steel)=>mesh(g,new THREE.CylinderGeometry(r,r,h,32,1),m,[x,y,z]);
 function torus(g,x,y,z,r,t,m=brass,flat=true){const a=mesh(g,new THREE.TorusGeometry(r,t,8,64),m,[x,y,z]);if(flat)a.rotation.x=Math.PI/2;return a}
 function svg(g,name,x,y,z,w,h,ry=0,rx=0){const m=new THREE.MeshBasicMaterial({map:textures.get(name),transparent:true,alphaTest:.08,side:THREE.DoubleSide,color:0xd8d1c4,toneMapped:false});const a=mesh(g,new THREE.PlaneGeometry(w,h),m,[x,y,z],ry);a.rotation.x=rx;return a}
 function beam(g,a,b,r=.035,mat=brass){const va=V(...a),vb=V(...b),dir=vb.clone().sub(va);const m=mesh(g,new THREE.CylinderGeometry(r,r,dir.length(),7),mat,va.clone().add(vb).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());return m}
 function bolts(g,w,d,y){for(const x of[-w/2+.16,w/2-.16])for(const z of[-d/2+.16,d/2-.16])cyl(g,x,y,z,.065,.035,brass)}
 function rack(g,x,z,h,w=.95,d=1.0){box(g,x,h/2,z,w,h,d,dark);svg(g,'compute-rack',x,h/2,z+d/2+.008,w,h);svg(g,'compute-rack',x+w/2+.008,h/2,z,d,h,Math.PI/2);box(g,x,h+.025,z,w+.035,.05,d+.035,edge);for(const dx of[-w/2,w/2])box(g,x+dx,h/2,z+d/2+.025,.025,h,.035,brass);}
 function bridge(g,a,b,w=.85){const va=V(...a),vb=V(...b),mid=va.clone().add(vb).multiplyScalar(.5),len=va.distanceTo(vb);const sub=new THREE.Group();g.add(sub);sub.position.copy(mid);sub.rotation.y=Math.atan2(vb.x-va.x,vb.z-va.z);
  // group uses inherited domain materials; children geometry uses local coordinates.
  const deck=mesh(g,new THREE.BoxGeometry(w,.18,len),steel);g.remove(deck);sub.add(deck);
  const skin=svg(g,'bridge-deck',0,.095,0,len,w,0,-Math.PI/2);g.remove(skin);sub.add(skin);skin.rotation.z=Math.PI/2;
  for(const x of[-w/2,w/2]){const a=mesh(g,new THREE.BoxGeometry(.035,.045,len),brass,[x,.18,0]);g.remove(a);sub.add(a)}
  for(let z=-len/2+.6;z<len/2;z+=1.4){const a=mesh(g,new THREE.BoxGeometry(w*.8,.65,.09),dark,[0,-.39,z]);g.remove(a);sub.add(a)}
  return sub;
 }
 function build(){
  // CLOUD. Twenty-eight large, individually legible racks retain the two peaks of v9.
  const cloud=group(0);cloud.position.set(...TER.cloud);
  box(cloud,0,-.08,0,13.6,.18,7.9,dark);bolts(cloud,13.6,7.9,.03);
  for(let row=0;row<4;row++)for(let col=0;col<7;col++){
   const x=(col-3)*1.72,z=(row-1.5)*1.8;
   const h=1.05+5.9*Math.exp(-((x+2.3)**2/8+(z+.4)**2/7))+4.4*Math.exp(-((x-3.2)**2/6+(z-.8)**2/7));
   rack(cloud,x,z,h,.98,1.12);
  }
  for(const x of[-5.4,5.4]){box(cloud,x,.23,3.6,1.4,.4,.38,steel);beam(cloud,[x,.45,3.6],[x,1.2,3.6],.06,brass)}
  // APPS. Full interfaces sit in real tower housings with backs, mullions and terraces.
  const apps=group(1);apps.position.set(...TER.app);box(apps,0,-.1,0,11,.2,9,dark);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const x=(col-1)*3.4,z=(row-.5)*4.0,h=4.0+(2-row)*.9+(col===1?1.4:0);
   box(apps,x,h/2,z,2.65,h,1.45,dark);box(apps,x,h+.06,z,2.9,.13,1.7,edge);
   for(let y=.6;y<h-.3;y+=.85)box(apps,x,y,z+.76,2.7,.045,.1,brass);
   svg(apps,'workspace',x,h-1.28,z+.83,2.85,2.05);
   for(const dx of[-1.32,1.32])box(apps,x+dx,h/2,z+.8,.045,h,.06,edge);
   svg(apps,'workspace',x+1.36,h/2,z,1.38,2.5,Math.PI/2);
  }
  // AGENTS. Mechanical wheels and a legible logical workflow share one machine.
  const agents=group(3);agents.position.set(...TER.gears);box(agents,.4,.25,0,8,.5,3.3,dark);
  const gearSpecs=[[-1.6,2.9,0,2.4,1],[2,1.55,.35,1.45,-1.65],[.1,5.85,-.35,1,-2.4]];
  for(const [x,y,z,r,speed]of gearSpecs){const housing=cyl(agents,x,y,z,r,.18,dark);housing.rotation.x=Math.PI/2;
   const face=svg(agents,'machined-gear',x,y,z+.12,r*2.1,r*2.1);updates.push(T=>{face.rotation.z=-T*.12*speed});
   beam(agents,[x,.4,-.4],[x,y,-.4],.13,steel);
  }
  box(agents,1.0,2.7,1.35,4.1,3.2,.22,dark);svg(agents,'agent-control',1.0,2.7,1.48,4.1,3.2);
  for(const x of[-.5,2.5])beam(agents,[x,.5,1.25],[x,1.1,1.25],.06,brass);
  // MEMORY. Solid cylindrical stores plus curved banding, front SVG address panels.
  const memory=group(3);memory.position.set(...TER.data);box(memory,.2,.07,0,7,.14,5.2,dark);
  for(const [x,z,h,r]of[[-1.9,-1,4.4,.9],[.4,.8,5.2,1.05],[2.5,-1.2,3.6,.75]]){
   cyl(memory,x,h/2,z,r,h,dark);
   for(let y=.18;y<h;y+=.48){cyl(memory,x,y,z,r+.04,.055,edge);torus(memory,x,y+.035,z,r+.045,.018,brass)}
   cyl(memory,x,h+.025,z,r+.055,.08,steel);svg(memory,'memory',x,h/2,z+r+.09,r*1.7,h*.95);
   for(const dx of[-r*.85,r*.85])beam(memory,[x+dx,.12,z+r+.06],[x+dx,h-.12,z+r+.06],.035,brass);
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
  torus(core,0,5.42,-1.2,1.0,.055,brass);
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
    const wood=M(0x624329,.1),pages=M(0xd8cdb0,.1),cloth=M(0x571d1d,.05);
    box(g,.9,.45,.4,.5,.06,.5,wood);const back=box(g,.9,.85,.7,.5,.8,.06,wood);back.rotation.x=-.25;
    for(const x of[.7,1.1])for(const z of[.2,.6])box(g,x,.22,z,.04,.44,.04,wood);
    cyl(g,-.7,.12,.55,.09,.24,edge);cyl(g,-.7,.14,.55,.082,.12,brass);
    box(g,-1.25,.06,.5,.8,.12,.55,cloth,.2);box(g,-1.25,.08,.5,.77,.07,.52,pages,.2);
    wood.dispose();pages.dispose();cloth.dispose();
   }
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
   if(y===.75&&i===1)continue; // the original moving record remains group 16
   box(runs,sh[0]-.5+i*.5,sh[1]+y+.2,sh[2],.4,.34,.4,brass);
  }}
  const L=ST.ledger;box(runs,L[0],L[1]-.1,L[2],1.7,.14,1.05,dark);svg(runs,'docs',L[0],L[1]+.02,L[2],1.7,1.05,0,-Math.PI/2);
  // The report and DONE stamp use the existing crisp card overlays rather than
  // covering their approved changing copy with a competing static drawing.
 }
 const ready=Promise.all(ASSETS.map(name=>new Promise((resolve,reject)=>{
  new THREE.TextureLoader().load(new URL(`./assets/${name}.svg?v=v9_1a`,import.meta.url).href,t=>{
   if(disposed){t.dispose();resolve();return}t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;textures.set(name,t);resolve();},undefined,reject);
 }))).then(()=>{if(!disposed){build();loaded=true;root.visible=true}}).catch(error=>{root.visible=false;console.warn('Vector surfaces unavailable; original particle world retained.',error);});
 const fades=new Float32Array(12);
 function update(T){
  fades.fill(0);if(!loaded)return fades;
  const world=hold(T,10.8,12.5,63.5,66.4)+hold(T,77.6,79.5);
  fades[0]=fades[1]=fades[2]=fades[3]=fades[4]=Math.min(1,world);
  fades[5]=Math.min(1,hold(T,11.5,12.8,35.1,37.5)+hold(T,38.7,40.2,52,54)+hold(T,56.7,58.3,64.1,66.2)+hold(T,78.3,79.8));
  fades[6]=Math.min(1,hold(T,25.6,27.5,35.1,37.5)+hold(T,78.4,80));
  fades[7]=Math.min(1,hold(T,56.7,58.3,64.1,66.2)+hold(T,78.4,80));
  fades[8]=hold(T,38.7,40.2,52,54);
  fades[9]=Math.min(1,hold(T,10.8,12.5,52,54)+hold(T,77.6,79.5));
  fades[10]=Math.min(1,world);
  fades[11]=hold(T,78.4,80);
  for(let d=0;d<domains.length;d++)for(const g of domains[d]){
   const k=g.userData.extra?Math.min(1,g.userData.extra(T)):fades[d];g.visible=k>.001;g.userData.k=k;
   if(g.visible)for(const m of g.userData.materials)m.userData.vectorK.value=k;
  }
  for(const fn of updates)fn(T);
  return fades;
 }
 return {ready,update,root,get loaded(){return loaded},get fades(){return Array.from(fades)},get objects(){return domains.map(a=>a.length)},dispose(){disposed=true;root.removeFromParent();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();for(const t of textures.values())t.dispose();steel.dispose();dark.dispose();brass.dispose();edge.dispose();}};
}

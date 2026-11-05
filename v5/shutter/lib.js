// Sampling library: every shape is a list of parts; each part is a set of points
// with xyz, rgb, group, reveal, emissive. Same pool size for every state.
export function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const hex=(h)=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
function hash2(x,y){let h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)}
export function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
export function fbm(x,y){return 0.5*vnoise(x,y)+0.25*vnoise(x*2.03,y*2.03)+0.125*vnoise(x*4.1,y*4.1)+0.0625*vnoise(x*8.3,y*8.3)}

export class Part{
 // growable point list. bg=true marks backdrop parts that are trimmed first when a state is over budget
 constructor(n=1024,bg=false){this.cap=Math.max(16,n|0);this.n=0;this.drop=0;this.bg=bg;this.p=new Float32Array(this.cap*4);this.c=new Uint8Array(this.cap*4);this.at=null;}
 grow(){this.cap*=2;const p=new Float32Array(this.cap*4);p.set(this.p);this.p=p;const c=new Uint8Array(this.cap*4);c.set(this.c);this.c=c}
 push(x,y,z,r,g,b,group=0,reveal=0,em=0){if(this.n>=this.cap)this.grow();const i=this.n++*4;this.p[i]=x;this.p[i+1]=y;this.p[i+2]=z;
  this.p[i+3]=group+Math.min(0.999,Math.max(0,reveal));this.c[i]=r<0?0:r>255?255:r;this.c[i+1]=g<0?0:g>255?255:g;this.c[i+2]=b<0?0:b>255?255:b;this.c[i+3]=Math.round(em*255);}
}
export let SCALE=1; export function setScale(s){SCALE=s}
// RES: extra canvas resolution for hi-detail art at the higher dot tiers (logical W,H stay the same)
export let RES=1; export function setRes(r){RES=r}
const HAS_DOC=typeof document!=='undefined';
function mkCanvas(W,H){if(HAS_DOC){const c=document.createElement('canvas');c.width=W;c.height=H;return c}return new OffscreenCanvas(W,H)}
const canvasCache=new Map();
export function getCanvas(key,W,H,draw,hi=true){
 if(canvasCache.has(key))return canvasCache.get(key);
 const k=hi?Math.max(1,Math.min(RES,4096/Math.max(W,H),Math.sqrt(6e6/(W*H)))):1;
 const c=mkCanvas(Math.round(W*k),Math.round(H*k));const ctx=c.getContext('2d',{willReadFrequently:true});if(k!==1)ctx.scale(c.width/W,c.height/H);draw(ctx,W,H);
 const d=ctx.getImageData(0,0,c.width,c.height).data;const o={c,W:c.width,H:c.height,d};canvasCache.set(key,o);return o;
}
// weighted pixel sampling: returns arrays of u,v,r,g,b
const cumCache=new WeakMap();
export function sampleCanvas(cv,n,opt={}){
 const {W,H,d}=cv;const edge=opt.edge??1;const boost=opt.boost;const N=W*H;
 const ck=edge+'|'+(boost?boost.k:'')+'|'+(opt.lumW?1:0);let cm=cumCache.get(cv);if(!cm){cm=new Map();cumCache.set(cv,cm)}
 let cum=cm.get(ck),tot=0;
 if(cum){tot=cum[N-1]}else{cum=new Float64Array(N);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,k=i*4;const a=d[k+3]/255;let w=0;
  if(a>0.04){const L=(d[k]*0.3+d[k+1]*0.59+d[k+2]*0.11);const xr=x<W-1?k+4:k,yd=y<H-1?k+W*4:k;
   const g=Math.abs(L-(d[xr]*0.3+d[xr+1]*0.59+d[xr+2]*0.11))+Math.abs(L-(d[yd]*0.3+d[yd+1]*0.59+d[yd+2]*0.11));
   w=a*(1+edge*Math.min(g,80)/20);if(boost)w*=1+boost.k*boost.cv.d[k+3]/255;if(opt.lumW)w*=0.25+L/255;}
  tot+=w;cum[i]=tot;}
 if(N<=2.5e6)cm.set(ck,cum)}
 const r=opt.rand||Math.random;const out=[];
 for(let s=0;s<n;s++){const t=r()*tot;let lo=0,hi=N-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<t)lo=m+1;else hi=m}
  const x=lo%W,y=(lo/W)|0,k=lo*4;out.push([(x+r())/W,(y+r())/H,d[k],d[k+1],d[k+2]]);}
 return out;
}
// place canvas samples on a plane in 3D. o: origin center, R,U unit vectors, w,h world size
export function plane(part,cv,n,{c,R=[1,0,0],U=[0,1,0],w,h,edge=1,boost,zj=0,N=null,group=0,em=0,dim=1,reveal=null,tint=null,lumW=false}){
 n=Math.round(n*SCALE);const S=sampleCanvas(cv,n,{edge,boost,lumW});const Nn=N||cross(R,U);
 for(const[u,v,r,g,b]of S){const a=(u-0.5)*w,bb=(0.5-v)*h,z=(Math.random()-0.5)*zj;
  let cr=r*dim,cg=g*dim,cb=b*dim;if(tint){cr=cr*tint[0];cg*=tint[1];cb*=tint[2]}
  part.push(c[0]+R[0]*a+U[0]*bb+Nn[0]*z,c[1]+R[1]*a+U[1]*bb+Nn[1]*z,c[2]+R[2]*a+U[2]*bb+Nn[2]*z,cr,cg,cb,group,reveal?reveal(u,v):0,em);}
}
export function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
export function rotY(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]}
export function rotX(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]}
// box: c center, s size, colorFn(face,u,v)->[r,g,b], faces: which faces (default visible ones), ry rotation
const FACES={px:[[0,0,-1],[0,1,0],[1,0,0]],nx:[[0,0,1],[0,1,0],[-1,0,0]],py:[[1,0,0],[0,0,-1],[0,1,0]],ny:[[1,0,0],[0,0,1],[0,-1,0]],pz:[[1,0,0],[0,1,0],[0,0,1]],nz:[[-1,0,0],[0,1,0],[0,0,-1]]};
const SHADE={px:0.78,nx:0.72,py:1.0,ny:0.45,pz:0.88,nz:0.6};
export function box(part,n,{c,s,color,faces=['px','nx','py','pz','nz'],ry=0,group=0,em=0,dim=1,reveal=null,rx=0}){
 n=Math.round(n*SCALE);const areas=faces.map(f=>{const[R,U,N]=FACES[f];const w=Math.abs(R[0]*s[0]+R[1]*s[1]+R[2]*s[2]),h=Math.abs(U[0]*s[0]+U[1]*s[1]+U[2]*s[2]);return w*h});
 const tot=areas.reduce((a,b)=>a+b,0);
 faces.forEach((f,fi)=>{const[R,U,N]=FACES[f];const w=Math.abs(R[0]*s[0]+R[1]*s[1]+R[2]*s[2]),h=Math.abs(U[0]*s[0]+U[1]*s[1]+U[2]*s[2]),dd=Math.abs(N[0]*s[0]+N[1]*s[1]+N[2]*s[2]);
  const k=Math.round(n*areas[fi]/tot);
  for(let i=0;i<k;i++){const u=Math.random(),v=Math.random();let p=[R[0]*(u-0.5)*w+U[0]*(v-0.5)*h+N[0]*dd/2,R[1]*(u-0.5)*w+U[1]*(v-0.5)*h+N[1]*dd/2,R[2]*(u-0.5)*w+U[2]*(v-0.5)*h+N[2]*dd/2];
   if(rx)p=rotX(p,rx);if(ry)p=rotY(p,ry);const col=color(f,u,v);const sh=SHADE[f]*dim;
   part.push(c[0]+p[0],c[1]+p[1],c[2]+p[2],col[0]*sh,col[1]*sh,col[2]*sh,group,reveal?reveal(f,u,v):0,em);}
 });
}
// cylinder along axis 'x','y' or 'z'
export function cyl(part,n,{c,r,len,axis='y',color,caps=true,group=0,em=0,dim=1,r2=null,arc=[0,Math.PI*2]}){
 n=Math.round(n*SCALE);const rr2=r2??r;const side=Math.PI*(r+rr2)*len,cap=caps?Math.PI*(r*r+rr2*rr2):0;
 for(let i=0;i<n;i++){let x,y,z,sh,u,v,face;
  if(Math.random()<side/(side+cap)){const a=arc[0]+Math.random()*(arc[1]-arc[0]);v=Math.random();const rad=r+(rr2-r)*v;x=Math.cos(a)*rad;z=Math.sin(a)*rad;y=(v-0.5)*len;sh=0.55+0.45*Math.max(0,Math.cos(a-0.9));u=a/(Math.PI*2);face='side'}
  else{const a=Math.random()*Math.PI*2,rad=Math.sqrt(Math.random());const top=Math.random()<r*r/(r*r+rr2*rr2)?-1:1;const R0=top<0?r:rr2;x=Math.cos(a)*rad*R0;z=Math.sin(a)*rad*R0;y=top*len/2;sh=0.95;u=rad;v=a;face=top<0?'capA':'capB'}
  let p=axis==='y'?[x,y,z]:axis==='x'?[y,x,z]:[x,z,y];const col=color(face,u,v);
  part.push(c[0]+p[0],c[1]+p[1],c[2]+p[2],col[0]*sh*dim,col[1]*sh*dim,col[2]*sh*dim,group,0,em);}
}
// polyline tube: pts array of [x,y,z], reveal along length
export function tube(part,n,{pts,rad=0.01,color,group=0,em=0,r0=0,r1=1,dim=1}){
 n=Math.round(n*SCALE);const L=[0];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]))}
 const T=L[L.length-1];
 for(let k=0;k<n;k++){const t=Math.random()*T;let i=1;while(i<L.length-1&&L[i]<t)i++;const a=pts[i-1],b=pts[i];const f=(t-L[i-1])/((L[i]-L[i-1])||1);
  const jx=(Math.random()-0.5)*2*rad,jy=(Math.random()-0.5)*2*rad,jz=(Math.random()-0.5)*2*rad;const col=typeof color==='function'?color(t/T):color;
  part.push(a[0]+(b[0]-a[0])*f+jx,a[1]+(b[1]-a[1])*f+jy,a[2]+(b[2]-a[2])*f+jz,col[0]*dim,col[1]*dim,col[2]*dim,group,r0+(r1-r0)*t/T,em);}
}
export function sphere(part,n,{c,r,color,em=0,group=0,dim=1,squash=[1,1,1]}){n=Math.round(n*SCALE);
 for(let i=0;i<n;i++){let x=Math.random()*2-1,y=Math.random()*2-1,z=Math.random()*2-1;const l=Math.hypot(x,y,z)||1;x/=l;y/=l;z/=l;
  const sh=0.5+0.5*Math.max(0,0.3*x+0.6*y+0.7*z);const col=color(x,y,z);part.push(c[0]+x*r*squash[0],c[1]+y*r*squash[1],c[2]+z*r*squash[2],col[0]*sh*dim,col[1]*sh*dim,col[2]*sh*dim,group,0,em)}}
export function dust(part,n,{min,max,color=[150,135,115],group=1}){n=Math.round(n*SCALE);for(let i=0;i<n;i++){const j=0.7+Math.random()*0.5;
 part.push(min[0]+Math.random()*(max[0]-min[0]),min[1]+Math.random()*(max[1]-min[1]),min[2]+Math.random()*(max[2]-min[2]),color[0]*j,color[1]*j,color[2]*j,group,Math.random(),0)}}

// assemble parts into one state of exactly N points. pinned parts keep fixed ID ranges.
const spread=(v)=>{v&=1023;v=(v|(v<<16))&0x030000FF;v=(v|(v<<8))&0x0300F00F;v=(v|(v<<4))&0x030C30C3;v=(v|(v<<2))&0x09249249;return v};
export const STATS=[];
// stable LSD radix sort of 30-bit keys -> index order (fast at a million points)
function radixOrder(key){const n=key.length;let a=new Uint32Array(n),b=new Uint32Array(n);for(let i=0;i<n;i++)a[i]=i;const cnt=new Uint32Array(1024);
 for(let sh=0;sh<30;sh+=10){cnt.fill(0);for(let i=0;i<n;i++)cnt[(key[a[i]]>>>sh)&1023]++;let s=0;for(let k=0;k<1024;k++){const c=cnt[k];cnt[k]=s;s+=c}
  for(let i=0;i<n;i++){const v=a[i];b[cnt[(key[v]>>>sh)&1023]++]=v}const t=a;a=b;b=t}return a}
export function assemble(N,parts,fill){
 const P=new Float32Array(N*4),C=new Uint8Array(N*4),used=new Uint8Array(N);
 for(const pt of parts){if(pt.at==null)continue;const at=Math.round(pt.at*SCALE);const m=Math.min(pt.n,N-at);P.set(pt.p.subarray(0,m*4),at*4);C.set(pt.c.subarray(0,m*4),at*4);used.fill(1,at,at+m)}
 let free=0;for(let i=0;i<N;i++)if(!used[i])free++;
 let rest=parts.filter(p=>p.at==null);let tot=rest.reduce((a,p)=>a+p.n,0);
 if(tot<free){const f=new Part(free-tot,true);fill(f,free-tot);rest=rest.concat([f]);tot+=f.n}
 // budget: keep hero parts whole, trim backdrop parts evenly (every k-th point) when over budget
 let hero=rest.filter(p=>!p.bg),bgp=rest.filter(p=>p.bg);const nh=hero.reduce((a,p)=>a+p.n,0),nb=tot-nh;
 let keepH=1,keepB=1;if(tot>free){if(nh<=free){keepB=(free-nh)/Math.max(1,nb)}else{keepB=0;keepH=free/nh;console.warn('heroes over budget',nh,free)}}
 const RP=new Float32Array(free*4),RC=new Uint8Array(free*4);let o=0;
 const take=(p,k)=>{let acc=0;for(let i=0;i<p.n&&o<free;i++){acc+=k;if(acc>=1){acc-=1;RP.set(p.p.subarray(i*4,i*4+4),o*4);RC.set(p.c.subarray(i*4,i*4+4),o*4);o++}}};
 for(const p of hero)take(p,keepH);for(const p of bgp)take(p,keepB);
 // pad if rounding left a gap: duplicate earlier points (invisible difference)
 for(let i=o;i<free;i++){const s=(i*7919)%Math.max(1,o);RP.set(RP.subarray(s*4,s*4+4),i*4);RC.set(RC.subarray(s*4,s*4+4),i*4)}
 STATS.push({tot,free,nh,nb,keepB:+keepB.toFixed(3),keepH});
 const idx=new Uint32Array(free);for(let i=0;i<free;i++)idx[i]=i;
 let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const i of idx)for(let a=0;a<3;a++){const v=RP[i*4+a];if(v<mn[a])mn[a]=v;if(v>mx[a])mx[a]=v}
 const key=new Uint32Array(idx.length);for(let k=0;k<idx.length;k++){const i=idx[k];const q=a=>Math.floor(1023*(RP[i*4+a]-mn[a])/((mx[a]-mn[a])||1));key[k]=(spread(q(0))<<2)|(spread(q(1))<<1)|spread(q(2)>>1)}
 const ord=radixOrder(key);
 let k=0;for(let i=0;i<N;i++){if(used[i])continue;const s=idx[ord[k++]];P.set(RP.subarray(s*4,s*4+4),i*4);C.set(RC.subarray(s*4,s*4+4),i*4)}
 return{P,C};
}

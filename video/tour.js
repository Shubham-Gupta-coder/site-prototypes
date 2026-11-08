(()=>{
/* Capture-only adapter. The preserved website itself is never rewritten.
   Hyperframes awaits every async frame; neither time nor GPU speed drives the film. */
const root=document.getElementById('tour'),desktop=document.getElementById('desktop'),mobile=document.getElementById('mobile');
const cursor=document.getElementById('cursor'),ring=document.getElementById('click-ring'),matte=document.getElementById('mobile-matte'),mark=document.getElementById('viewport-mark');
const smooth=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)};
const blend=(a,b,u)=>a+(b-a)*smooth(u);
const points=[[0,0],[2,0],[6,14],[11,26],[16,34],[21,43.5],[26,51.5],[31,64],[36,74],[40,85],[43,96],[44.5,98],[46.5,100]];
function filmAt(t){for(let i=1;i<points.length;i++)if(t<=points[i][0]){const[a,x]=points[i-1],[b,y]=points[i];return blend(x,y,(t-a)/(b-a))}return 100}
const state={ready:false,frameCount:0,errors:[],samples:[],routes:null};window.__tour=state;
function waitFor(test,timeout=25000){return new Promise((resolve,reject)=>{let attempts=0;const tick=()=>{try{const v=test();if(v)return resolve(v)}catch{}if(++attempts>Math.ceil(timeout/30))return reject(new Error('Website readiness exceeded deadline'));setTimeout(tick,30)};tick()})}
function cssAt(w,t){for(const a of w.document.getAnimations()){try{if(a instanceof w.CSSTransition){a.finish();continue}a.pause();a.currentTime=t*1000}catch{}}}
function sectionTop(w,id){const e=w.document.getElementById(id);return e.getBoundingClientRect().top+w.scrollY}
function sectionY(w,id){return Math.max(0,sectionTop(w,id)-45)}
async function initialize(){
 const d=desktop.contentWindow,m=mobile.contentWindow;
 await waitFor(()=>d.__site?.mode==='ready'&&d.__vectors?.loaded&&m.__site?.mode==='static');
 await Promise.all([d.document.fonts.ready,m.document.fonts.ready]);
 if(d.document.documentElement.dataset.experience!=='film'||m.document.documentElement.dataset.experience!=='light')throw new Error('Wrong final site route');
 for(const w of[d,m]){w.addEventListener('error',e=>state.errors.push(e.message));w.addEventListener('unhandledrejection',e=>state.errors.push(String(e.reason)));}
 /* Disable only the film's free-running RAF loop, not worker construction or explicit set(). */
 const original=d.requestAnimationFrame.bind(d);d.requestAnimationFrame=cb=>cb.name==='loop'?0:original(cb);
 for(const img of m.document.images)img.loading='eager';await Promise.all([...m.document.images].map(i=>i.decode().catch(()=>{})));
 await d.__film.set(0);cssAt(d,0);cssAt(m,0);state.routes={desktop:d.document.documentElement.dataset.experience,mobile:m.document.documentElement.dataset.experience,vectors:d.__vectors.loaded};state.ready=true;
}
function pointer(x,y){cursor.style.transform=`translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`}
function elementPoint(frame,w,selector){const r=w.document.querySelector(selector).getBoundingClientRect();return {x:parseFloat(getComputedStyle(frame).left)+r.left+Math.min(r.width*.6,220),y:80+r.top+r.height*.5}}
function aim(a,b,u){return {x:blend(a.x,b.x,u),y:blend(a.y,b.y,u)}}
function selected(w,id){const el=w.document.getElementById(id);if(el&&!el.checked){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}}
function mobileY(w,t){if(t<59.5)return 0;if(t<60.5)return blend(0,sectionY(w,'context'),t-59.5);if(t<61)return sectionY(w,'context');const action=sectionTop(w,'action')+w.document.querySelector('.mobile-controls').offsetTop-100;if(t<61.8)return blend(sectionY(w,'context'),action,(t-61)/.8);return action}
let lastDrawnT=null;
async function draw(t){
 // Final edit: hold the last mobile frame; never snap back to desktop.
 t=Math.min(t,62+29/30);
 const d=desktop.contentWindow,m=mobile.contentWindow;const paint=async T=>{if(lastDrawnT!==T){await d.__film.set(T);lastDrawnT=T}};const mobileOn=t>=58&&t<63;
 mobile.style.opacity=mobileOn?'1':'0';matte.style.opacity=mobileOn?'1':'0';mark.style.opacity=mobileOn?'1':'0';
 let T=filmAt(t),y=0;
 const px=d.__film.FILM_END*d.__film.UNIT_VH/100*d.__film.viewport.stableHeight;
 if(t<=44.5){y=T/100*px;d.scrollTo(0,y);await paint(T)}
 else if(t<46.5){y=blend(.98*px,sectionY(d,'approach'),(t-44.5)/2);d.scrollTo(0,y);await paint(T)}
 else{
  const approach=sectionY(d,'approach'),expertise=sectionY(d,'expertise'),experience=sectionY(d,'experience'),contact=Math.min(sectionY(d,'contact'),d.document.getElementById('site-main').getBoundingClientRect().bottom+d.scrollY-1000);
  if(t<49)y=approach;
  else if(t<50.3)y=blend(approach,expertise,(t-49)/1.3);
  else if(t<51.1)y=expertise;
  else if(t<52)y=blend(expertise,expertise+260,(t-51.1)/.9);
  else if(t<53)y=blend(expertise+260,experience,t-52);
  else if(t<55)y=experience;
  else if(t<56)y=blend(experience,contact,t-55);
  else y=contact;
  d.scrollTo(0,y);await paint(100);
 }
 selected(d,t>=50.8?'skill-data':'skill-agents');
 if(mobileOn){m.scrollTo(0,mobileY(m,t));const input=m.document.querySelector('[name="mobile-route"][value="'+(t>=62.15?'review':'intent')+'"]');input.checked=true;m.__shell.measure();}
 d.__shell.measure();cssAt(d,t);cssAt(m,t);
 let p={x:1740,y:790};
 if(t<2)p=aim({x:1640,y:720},{x:1740,y:790},t/2);
 else if(t<49)p={x:1740+8*Math.sin(t*.23),y:790+6*Math.sin(t*.31)};
 else if(t<52){const dest=elementPoint(desktop,d,'label[for="skill-data"]');p=aim({x:1740,y:790},dest,(t-49)/1.6);if(t>50.65&&t<51.1){const f=(t-50.65)/.45;ring.style.opacity=String(1-f);ring.style.transform=`translate(${dest.x-18}px,${dest.y-18}px) scale(${.7+f*.5})`}}
 else if(t<58)p=aim({x:1350,y:500},{x:1740,y:790},(t-52)/2);
 else if(mobileOn){p={x:1240,y:790};if(t>61.5){const dest=elementPoint(mobile,m,'.m-option:has(input[value="review"])');p=aim(p,dest,(t-61.5)/.65);if(t>=62.05&&t<62.5){const f=(t-62.05)/.45;ring.style.opacity=String(1-f);ring.style.transform=`translate(${dest.x-18}px,${dest.y-18}px) scale(${.7+f*.5})`}}}
 if(!(t>50.65&&t<51.1)&&!(t>=62.05&&t<62.5))ring.style.opacity='0';pointer(p.x,p.y);state.frameCount++;if(state.samples.length<80&&Math.abs(t-Math.round(t))<.005)state.samples.push({t,T,y,mode:mobileOn?'mobile':'desktop'});
 if(state.errors.length)throw new Error(state.errors.join('; '));
}
if(!window.__hyperframes?.registerFrameSource)throw new Error('Native asynchronous frame-source API unavailable');
window.__hyperframes.registerFrameSource({element:root,ready:initialize(),render:draw,dispose:()=>{try{desktop.contentWindow.__film?.stop()}catch{}}});

})();

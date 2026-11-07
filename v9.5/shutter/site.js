/* Site shell only. Loading may animate; the film remains f(scroll). */
const root=document.documentElement,menu=document.getElementById('site-menu'),intro=document.getElementById('intro'),loader=document.getElementById('site-loader');
const ids=new Set(['film','approach','expertise','experience','contact']);
const metrics={started:performance.now(),ready:false,mode:root.dataset.siteState,reason:null};window.__site=metrics;
function hashTarget(hash){let id;try{id=decodeURIComponent((hash||'').slice(1))}catch{return null}return ids.has(id)?document.getElementById(id):null}
function go(hash,focus=true){const target=hashTarget(hash);if(!target)return;for(const a of document.querySelectorAll('nav a[href^="#"]')){if(a.getAttribute('href')===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}const y=hash==='#film'?0:Math.max(0,target.getBoundingClientRect().top+scrollY-24);if(window.__film&&root.dataset.siteState==='ready')__film.navigate(y);else scrollTo({top:y,behavior:'instant'});window.__shell?.measure();if(focus)target.focus({preventScroll:true});}
function fallback(reason){const focused=loader.contains(document.activeElement);window.__siteEarlyFallback(reason);intro.removeAttribute('aria-hidden');metrics.ready=false;metrics.mode='static';metrics.reason=reason;loader.setAttribute('aria-hidden','true');if(focused)document.getElementById('film').focus({preventScroll:true});}
window.addEventListener('site:fallback',e=>{metrics.mode='static';metrics.reason=e.detail;intro.removeAttribute('aria-hidden');loader.setAttribute('aria-hidden','true');});
function closeMenu(focus=false){if(menu.open){menu.open=false;if(focus)menu.querySelector('summary').focus()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){e.preventDefault();closeMenu(true)}});
document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))closeMenu()});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href');if(!hashTarget(h))return;e.preventDefault();if(root.dataset.siteState==='loading')fallback('navigation');closeMenu();if(location.hash!==h)history.pushState(null,'',h);go(h);});
window.addEventListener('hashchange',()=>{if(root.dataset.siteState==='loading')fallback('navigation');go(location.hash,false)});
window.addEventListener('popstate',()=>{if(root.dataset.siteState==='loading')fallback('navigation');go(location.hash||'#film',false)});
/* Shell visibility only; the ordinary ending has no scroll-driven presentation. */
const header=document.querySelector('.site-header'),progress=document.getElementById('film-progress'),fill=progress.firstElementChild,end=document.getElementById('site-main');
let filmT=0,endingY=Infinity,heroBottom=innerHeight,zone=null,lastValue=-1,reading=null;
function shellZone(next){
 if(next===zone)return;zone=next;const show=next==='hero';
 if(!show){closeMenu();if(header.contains(document.activeElement)){const target=next==='ending'?document.getElementById('approach'):document.getElementById('film');target.focus({preventScroll:true})}}
 header.inert=!show;header.hidden=!show;header.setAttribute('aria-hidden',String(!show));progress.hidden=next!=='film';root.dataset.shell=next;
}
function rememberReading(){if(zone!=='ending')return;if(scrollY+innerHeight>=document.documentElement.scrollHeight-3){reading={bottom:true};return}const y=scrollY+24,sections=['approach','expertise','experience','contact'].map(id=>document.getElementById(id));let el=sections[0];for(const node of sections)if(node.getBoundingClientRect().top+scrollY<=y)el=node;const top=el.getBoundingClientRect().top+scrollY;reading=y<top?{id:el.id,before:(top-y)/innerHeight}:{id:el.id,fraction:Math.max(0,Math.min(1,(y-top)/Math.max(1,el.offsetHeight)))}}
function shellSync(){
 if(root.dataset.siteState==='loading'){shellZone('hero');return}
 if(root.dataset.siteState==='static'){shellZone(scrollY<heroBottom-80?'hero':scrollY+innerHeight*.92>=endingY?'ending':'still');return}
 shellZone(scrollY+innerHeight*.92>=endingY?'ending':filmT<2.2?'hero':'film');rememberReading();
}
function shellMeasure(){endingY=end.getBoundingClientRect().top+scrollY;heroBottom=intro.getBoundingClientRect().bottom+scrollY;shellSync()}
window.__shell={update(T){filmT=Math.max(0,Math.min(100,T));fill.style.transform=`scaleX(${filmT/100})`;const value=Math.round(filmT);if(value!==lastValue){lastValue=value;progress.setAttribute('aria-valuenow',String(value))}shellSync()},measure:shellMeasure,get T(){return filmT},get zone(){return zone},get reading(){return reading&&{...reading}}};
function navLayout(){if(header.hidden)return;const active=document.activeElement;if(getComputedStyle(menu).display==='none'){const had=menu.contains(active);closeMenu();if(had)header.querySelector('.brand').focus()}else if(header.querySelector('.desktop-nav').contains(active)){closeMenu();menu.querySelector('summary').focus()}}
addEventListener('scroll',shellSync,{passive:true});addEventListener('resize',()=>requestAnimationFrame(()=>{navLayout();shellMeasure()}));
addEventListener('site:fallback',()=>requestAnimationFrame(shellMeasure));
document.addEventListener('visibilitychange',()=>root.classList.toggle('page-hidden',document.hidden));
shellZone(root.dataset.shell||'hero');if(root.dataset.siteState!=='static'||!hashTarget(location.hash))shellMeasure();
const reduce=matchMedia('(prefers-reduced-motion: reduce)');reduce.addEventListener?.('change',e=>{if(e.matches)fallback('reduced-motion')});
const fonts=Promise.all([document.fonts.load('600 72px "Big Shoulders Display"'),document.fonts.load('400 20px "Source Serif 4"')]).then(v=>{if(v.some(x=>!x.length))throw new Error('Essential font unavailable');return document.fonts.ready});
if(root.dataset.siteState==='static'){
 metrics.mode='static';metrics.reason=window.__siteFallbackReason||window.__SITE_START.reason;document.body.classList.add('nogl');loader.setAttribute('aria-hidden','true');
 fonts.catch(()=>{}).finally(()=>{if(hashTarget(location.hash))go(location.hash,false);shellMeasure()});
}else{
 intro.setAttribute('aria-hidden','true');
 (async()=>{try{
  const engine=import('./film.js?v=v9_5a').then(()=>window.__film.firstFrame);
  await Promise.all([fonts,engine]);
  if(window.__siteEarlyStopped||root.dataset.siteState!=='loading'){window.__film?.stop();return}
  if(!window.__vectors.loaded)throw new Error('Essential artwork unavailable');
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(window.__siteEarlyStopped)return;
  const focused=loader.contains(document.activeElement);clearTimeout(window.__siteDeadline);root.dataset.siteState='ready';metrics.ready=true;metrics.mode='ready';metrics.readyMs=Math.round(performance.now()-window.__SITE_START.at);intro.removeAttribute('aria-hidden');loader.setAttribute('aria-hidden','true');shellMeasure();if(focused)document.getElementById('film').focus({preventScroll:true});
 }catch(error){if(!window.__siteEarlyStopped)fallback('unavailable');}})();
}

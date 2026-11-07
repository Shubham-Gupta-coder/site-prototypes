/* Site shell only. Loading may animate; the film remains f(scroll). */
const root=document.documentElement,menu=document.getElementById('site-menu'),intro=document.getElementById('intro'),loader=document.getElementById('site-loader');
const ids=new Set(['film','approach','expertise','experience','contact']);
const metrics={started:performance.now(),ready:false,mode:root.dataset.siteState,reason:null};window.__site=metrics;
function hashTarget(hash){const id=decodeURIComponent((hash||'').slice(1));return ids.has(id)?document.getElementById(id):null}
function go(hash,focus=true){const target=hashTarget(hash);if(!target)return;for(const a of document.querySelectorAll('nav a[href^="#"]')){if(a.getAttribute('href')===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}const y=hash==='#film'?0:Math.max(0,target.getBoundingClientRect().top+scrollY-document.querySelector('.site-header').getBoundingClientRect().height-24);if(window.__film&&root.dataset.siteState==='ready')__film.navigate(y);else scrollTo({top:y,behavior:'instant'});if(focus)target.focus({preventScroll:true});}
function fallback(reason){const focused=loader.contains(document.activeElement);window.__siteEarlyFallback(reason);intro.removeAttribute('aria-hidden');metrics.ready=false;metrics.mode='static';metrics.reason=reason;loader.setAttribute('aria-hidden','true');if(focused)document.getElementById('film').focus({preventScroll:true});}
window.addEventListener('site:fallback',e=>{metrics.mode='static';metrics.reason=e.detail;intro.removeAttribute('aria-hidden');loader.setAttribute('aria-hidden','true');});
function closeMenu(focus=false){if(menu.open){menu.open=false;if(focus)menu.querySelector('summary').focus()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){e.preventDefault();closeMenu(true)}});
document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))closeMenu()});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href');if(!hashTarget(h))return;e.preventDefault();if(root.dataset.siteState==='loading')fallback('navigation');closeMenu();if(location.hash!==h)history.pushState(null,'',h);go(h);});
window.addEventListener('hashchange',()=>{if(root.dataset.siteState==='loading')fallback('navigation');go(location.hash,false)});
window.addEventListener('popstate',()=>{if(root.dataset.siteState==='loading')fallback('navigation');go(location.hash||'#film',false)});
const nav=[...document.querySelectorAll('nav a[href^="#"]')];
const observe=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const h='#'+e.target.id;for(const a of nav){if(a.getAttribute('href')===h)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}}},{rootMargin:'-18% 0px -55% 0px',threshold:0});for(const id of ids){const el=document.getElementById(id);if(el)observe.observe(el)}
const reduce=matchMedia('(prefers-reduced-motion: reduce)');reduce.addEventListener?.('change',e=>{if(e.matches)fallback('reduced-motion')});
const fonts=Promise.all([document.fonts.load('600 72px "Big Shoulders Display"'),document.fonts.load('400 20px "Source Serif 4"')]).then(v=>{if(v.some(x=>!x.length))throw new Error('Essential font unavailable');return document.fonts.ready});
if(root.dataset.siteState==='static'){
 metrics.mode='static';metrics.reason=window.__siteFallbackReason||window.__SITE_START.reason;document.body.classList.add('nogl');loader.setAttribute('aria-hidden','true');
 fonts.catch(()=>{}).finally(()=>{if(hashTarget(location.hash))go(location.hash,false)});
}else{
 intro.setAttribute('aria-hidden','true');
 (async()=>{try{
  const engine=import('./film.js?v=v9_3a').then(()=>window.__film.firstFrame);
  await Promise.all([fonts,engine]);
  if(window.__siteEarlyStopped||root.dataset.siteState!=='loading'){window.__film?.stop();return}
  if(!window.__vectors.loaded)throw new Error('Essential artwork unavailable');
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(window.__siteEarlyStopped)return;
  const focused=loader.contains(document.activeElement);clearTimeout(window.__siteDeadline);root.dataset.siteState='ready';metrics.ready=true;metrics.mode='ready';metrics.readyMs=Math.round(performance.now()-window.__SITE_START.at);intro.removeAttribute('aria-hidden');loader.setAttribute('aria-hidden','true');if(focused)document.getElementById('film').focus({preventScroll:true});
 }catch(error){if(!window.__siteEarlyStopped)fallback('unavailable');}})();
}

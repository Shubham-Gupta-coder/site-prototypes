// v8 loader: the WebGL film only loads when motion is allowed and WebGL2 exists; otherwise the still sequence in index.html is the page.
if(document.documentElement.className==='film'){import('./engine.js?v=v8a').catch(e=>{console.warn('film unavailable, showing stills',e&&e.message);document.documentElement.className='still'})}

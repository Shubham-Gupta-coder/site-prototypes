// Every word on screen lives here. Edit film text in this one file; markup and scenes read it by key. Then run `node bake.mjs`. The ending section is plain HTML in index.html.
export const COPY={
 // opening (static, painted before WebGL)
 introH:'AI can think. Most of it never reaches the work.',
 introP:'I build the systems that connect it: models, data, apps and cloud, working as one.',
 introCue:'Scroll to explore',
 // film captions, in order (DOM)
 cloud:'Cloud',
 web:'Apps',
 agents:'Agents and models',
 systems:'Data and memory',
 needs:'Each one is powerful alone.',
 platform:'The work is making them one system.',
 voice:'Speech becomes a scheduled meeting.',
 order:'A question finds the right record, and an answer.',
 dues:'Sensitive steps wait for a person.',
 shipped:'A demo works once. A system has to work every day.',
 meet:'What the work needs to know is scattered.',
 lChat:'Chat.',
 lPay:'Docs.',
 lSheet:'Sheets.',
 lInbox:'Inbox.',
 lCal:'Calendar.',
 glue:'So the model can\'t see it, and people become the glue.',
 method:'I listen first. Then I draw one system under the work.',
 signed:'One plan. Every piece.',
 loop:'Context reaches every step.',
 build:'I design it. I build it. I stay till it runs.',
 learns:'It learns from its own runs.',
 finale:'AI, put to work.',
 srTitle:'Shubham Gupta builds AI systems that join models, data, apps and cloud into one system that does real work.',
 // words painted inside the dot scenes (nameplate, screens, plaques)
 sign:'SHUBHAM GUPTA',
 chatApp:'Team chat',
 chatAsk:'Where is the signed contract?',
 payTitle:'Weekly report',
 payButton:'Send',
 payBrand:'Report',
 plaques:['MODELS','DATA','APPS'],
 paid:'DONE'
};
if(typeof document!=='undefined'){
 for(const el of document.querySelectorAll('[data-copy]')){const k=el.dataset.copy;if(k in COPY)el.textContent=COPY[k]}
 for(const el of document.querySelectorAll('[data-copy-href]')){const k=el.dataset.copyHref;if(k in COPY)el.setAttribute('href',COPY[k])}
}

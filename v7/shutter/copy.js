// Every word on screen lives here. Edit text in this one file; markup and scenes read it by key. Then run `node bake.mjs`.
export const COPY={
 // film captions, in order (DOM)
 hero:'I build the AI that runs businesses.',
 cloud:'Cloud',
 web:'Web apps',
 agents:'Agents',
 systems:'Systems',
 needs:'Whatever the work needs.',
 platform:'One platform under the whole company.',
 drawn:'Drawn by Shubham Gupta',
 founder:"Verslay's technical founder. I built the entire platform. My co-founder runs sales.",
 voice:'A voice note moves the calendar.',
 order:'Chat becomes an order. Stock checked. Link sent.',
 dues:'Dues leave only after you approve.',
 shipped:'Work I have already shipped.',
 meet:'Most businesses run on tools that never meet.',
 lChat:'Chat.',
 lPay:'Payments.',
 lSheet:'Sheets.',
 lInbox:'Inbox.',
 lCal:'Calendar.',
 glue:'So the people who run them become the glue.',
 method:'I listen first. Then I draw one system under the work.',
 signed:'Shubham Gupta. Delhi.',
 loop:'A person stays in the loop.',
 build:'I design it. I build it. I stay till it runs.',
 learns:'The system learns from its own runs.',
 control:'You approve what matters. The rest keeps moving.',
 industries:'Trade. Retail. Education. Creators. Wellness.',
 bring:'Bring the operation.',
 // closing card
 closeName:'Shubham Gupta',
 closeLine:'I build AI systems that run businesses.',
 closeFounder:"Verslay's technical founder. I built the entire platform. My co-founder runs sales.",
 closeOffer:'Bring the operation. I will tell you whether it should run on Verslay, or be built around the tools you already have.',
 closeLearn:'Always learning. Always building.',
 closeCta:'Book a call',
 closeCtaHref:'https://www.linkedin.com/in/expert-shubham-gupta/',
 closeNote:'The appointment sits on LinkedIn.',
 closeFine:"Some of the work on this site was built through Verslay, for Verslay's clients. Those businesses are Verslay's clients, not my personal clients, so they are described by industry rather than by name.",
 closeSig:'Shubham Gupta. Delhi.',
 srTitle:"Shubham Gupta builds AI systems that run businesses. Verslay's technical founder.",
 // words painted inside the dot scenes (nameplate, screens, stamps)
 sign:'SHUBHAM GUPTA',
 chatApp:'WhatsApp',
 chatAsk:'Is this in medium?',
 payTitle:'Payment link',
 payButton:'Pay',
 payBrand:'Razorpay',
 shopBrand:'Shopify',
 paid:'PAID'
};
if(typeof document!=='undefined'){
 for(const el of document.querySelectorAll('[data-copy]')){const k=el.dataset.copy;if(k in COPY)el.textContent=COPY[k]}
 for(const el of document.querySelectorAll('[data-copy-href]')){const k=el.dataset.copyHref;if(k in COPY)el.setAttribute('href',COPY[k])}
}

// Every word on screen lives here. Edit text in this one file; markup and scenes read it by key.
export const COPY={
 // film captions, in order (DOM)
 hero:'I build the AI that runs businesses.',
 shelf:'Every business starts with stock on a shelf.',
 chat:'Orders on chat.',
 pay:'Payments in another app.',
 sheet:'Stock in a sheet.',
 apart:'None of them talk to each other.',
 copies:'So someone copies it all by hand.',
 night:'Every night.',
 under:'I build one system under all of it.',
 drawn:'Drawn by Shubham Gupta',
 plugged:'One system. Every tool plugged in.',
 founder:"Verslay's only technical founder. I built the entire platform. My co-founder runs sales.",
 agents:'Agents take the order.',
 link:'They check the stock and send the link.',
 voice:'A voice note moves the calendar.',
 approve:'A person approves what matters.',
 month:'The month closes itself.',
 industries:'Apparel. D2C. Gifting. Textiles and B2B.',
 bring:'Bring the operation.',
 // closing card
 closeName:'Shubham Gupta',
 closeLine:"Verslay's only technical founder. I built the entire platform. My co-founder runs sales.",
 closeCta:'Book a call',
 closeCtaHref:'https://www.linkedin.com/in/expert-shubham-gupta/',
 closeNote:'The appointment sits on LinkedIn.',
 closeFine:"Some of the work on this site was built through Verslay, for Verslay's clients. Those businesses are Verslay's clients, not my personal clients, so they are described by industry rather than by name.",
 closeSig:'Shubham Gupta. Delhi.',
 srTitle:"Shubham Gupta builds the AI that runs businesses. Verslay's only technical founder.",
 // words painted inside the dot scenes (signboard, app screens, stamps)
 sign:'SHUBHAM GUPTA',
 chatApp:'WhatsApp',
 chatAsk:'Is this in medium?',
 payTitle:'Payment link',
 payButton:'Pay',
 payBrand:'Razorpay',
 shopBrand:'shopify',
 paid:'PAID'
};
if(typeof document!=='undefined'){
 for(const el of document.querySelectorAll('[data-copy]')){const k=el.dataset.copy;if(k in COPY)el.textContent=COPY[k]}
 for(const el of document.querySelectorAll('[data-copy-href]')){const k=el.dataset.copyHref;if(k in COPY)el.setAttribute('href',COPY[k])}
}

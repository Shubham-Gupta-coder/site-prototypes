// Film and painted-surface copy. Page prose is in index.html.
export const COPY={
  "introH": "An AI model is only the beginning.",
  "introP": "I build what connects it to your knowledge, your software and the decisions that matter.",
  "introCue": "Scroll to see the connections",
  "cloud": "A place to run.",
  "web": "A way to use it.",
  "agents": "From intent to action.",
  "systems": "The right context.",
  "needs": "Useful parts. One shared purpose.",
  "platform": "Give every part a shared context.",
  "voice": "Turn intent into a clear next step.",
  "order": "Find the source. Then form the answer.",
  "dues": "Keep consequential decisions in human hands.",
  "shipped": "Build in checks. Leave a way back.",
  "meet": "The information is there. The connections aren’t.",
  "lChat": "Conversation",
  "lPay": "Sources",
  "lSheet": "Structure",
  "lInbox": "Correspondence",
  "lCal": "Next steps",
  "glue": "Bring the context together. Keep its source.",
  "method": "Understand the work. Design the whole system.",
  "signed": "One clear plan.",
  "loop": "Sources stay with the answer.",
  "build": "Build it. Test the edges. Make it usable.",
  "learns": "Use each run to improve the next.",
  "finale": "More than a model.",
  "srTitle": "Shubham Gupta designs and builds connected AI systems: knowledge, software and human judgement in one working flow.",
  "sign": "AI, CONNECTED",
  "chatApp": "Context",
  "chatAsk": "What do we know?",
  "payTitle": "Ready for review",
  "payButton": "Review",
  "payBrand": "Check",
  "plaques": [
    "MODELS",
    "CONTEXT",
    "SOFTWARE"
  ],
  "paid": "CHECKED"
};
if(typeof document!=='undefined'){
 for(const el of document.querySelectorAll('[data-copy]')){const k=el.dataset.copy;if(k in COPY)el.textContent=COPY[k]}
}

const $=s=>document.querySelector(s);
const CFG={mode:'ai',bot:4,theme:'classic',human:'w',tc:600,q:'auto',snd:1,vib:1,hints:1,shake:1,blast:1,flip:0,kfx:1};
try{const o=JSON.parse(localStorage.getItem('gambit.cfg')||'{}');for(const k in CFG)if(k in o&&typeof o[k]==typeof CFG[k])CFG[k]=o[k]}catch(e){}
CFG.bot=Math.max(0,Math.min(9,CFG.bot|0));if(CFG.theme!='mc')CFG.theme='classic';
const saveCfg=()=>{try{localStorage.setItem('gambit.cfg',JSON.stringify(CFG))}catch(e){}};
const vib=p=>{try{if(CFG.vib&&navigator.vibrate)navigator.vibrate(p)}catch(e){}};
const mo=(el,kf,o)=>{try{return Motion.animate(el,kf,o||{})}catch(e){el.style.opacity=1}};
const V={p:1,n:3,b:3,r:5,q:9,k:0};
const SYM={w:{p:'♙',n:'♘',b:'♗',r:'♖',q:'♕',k:'♔'},b:{p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'}};
const FN=t=>({p:'',n:'N',b:'B',r:'R',q:'Q',k:'K'})[t];
const sqn=(x,y)=>'abcdefgh'[x]+(y+1);
const opp=c=>c=='w'?'b':'w';
const pos=(x,y)=>[x-3.5,3.5-y];
const fmt=s=>CFG.tc?String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'):'--:--';


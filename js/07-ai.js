/* ---------- AI: js/engine.js searches in a Web Worker so the board never freezes ---------- */
let EW=null,EWn=0;const EWq=new Map();
function mainEngine(o){return new Promise(res=>{const go=()=>{try{res(GambitEngine.think(o))}catch(e){res(null)}};
  if(window.GambitEngine)return setTimeout(go,30);const s=document.createElement('script');s.src='js/engine.js';s.onload=()=>setTimeout(go,30);s.onerror=()=>res(null);document.head.appendChild(s)})}
function spawnEngine(){try{EW=new Worker('js/engine.js');
  EW.onmessage=e=>{const q=EWq.get(e.data.id);if(q){EWq.delete(e.data.id);q.res(e.data.r)}};
  EW.onerror=e=>{if(e&&e.preventDefault)e.preventDefault();EW=null;EWq.forEach(q=>mainEngine(q.o).then(q.res));EWq.clear()}}catch(e){EW=null}}
spawnEngine();
function engineReset(){if(EW&&EWq.size){EW.terminate();EWq.forEach(q=>q.res(null));EWq.clear();spawnEngine()}}
function engineThink(o){if(!EW)return mainEngine(o);return new Promise(res=>{const id=++EWn;EWq.set(id,{o,res});EW.postMessage(Object.assign({id},o))})}
function anyLegal(c){const L=[];for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=B[j][i];if(q&&q.c==c)for(const m of legal(B,i,j))L.push([i,j,m,'q'])}return L[Math.random()*L.length|0]}
function aiTurn(){const c=aiC();if(!c||over||turn!=c)return;busy=true;status();const id=G,bt=BOTS[lvl],t0=Date.now();
  let budget=bt.t*(MOB?.8:1);if(CFG.tc&&budget)budget=Math.min(budget,Math.max(250,time[c]*1000/35));
  setTimeout(async()=>{if(id!=G||over)return;
    const r=await engineThink({moves:ML.slice(),depth:bt.d,time:budget,noise:bt.r,vary:bt.v||0,blunder:bt.b,qs:bt.qs!==0});
    if(id!=G||over)return;
    let mv=null;if(r&&r.f){const m=legal(B,r.f[0],r.f[1]).find(m=>m[0]==r.t[0]&&m[1]==r.t[1]);if(m)mv=[r.f[0],r.f[1],m,r.p||'q']}
    if(!mv)mv=anyLegal(c);if(!mv)return;
    const go=()=>{if(id!=G||over)return;if(paused)return setTimeout(go,250);move(mv[0],mv[1],mv[2],mv[3])};
    setTimeout(go,Math.max(0,bt.ms-(Date.now()-t0)))},300)}

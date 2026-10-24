/* ---------- AI ---------- */
const PV={p:100,n:320,b:330,r:500,q:900,k:20000};
function evalB(b){let s=0;for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=b[j][i];if(!q)continue;let v=PV[q.t];const cd=Math.abs(i-3.5)+Math.abs(j-3.5);
  if(q.t=='n'||q.t=='b')v+=(7-cd)*5;else if(q.t=='p')v+=(q.c=='w'?j:7-j)*8+(7-cd)*2;else if(q.t=='q')v+=(7-cd)*1.5;
  s+=q.c=='w'?v:-v}return s}
function gen(b,c){const r=[];for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=b[j][i];if(q&&q.c==c)for(const m of pm(b,i,j))r.push([i,j,m[0],m[1]])}
  const sc=m=>{const t=b[m[3]][m[2]];return t?PV[t.t]*10-PV[b[m[1]][m[0]].t]:0};return r.sort((a,d)=>sc(d)-sc(a))}
function app(b,m){const nb=b.map(r=>r.slice());let p=nb[m[1]][m[0]];if(p.t=='p'&&(m[3]==0||m[3]==7))p={t:'q',c:p.c};nb[m[3]][m[2]]=p;nb[m[1]][m[0]]=null;return nb}
function qs(b,a,be,c,q){const st=(c=='w'?1:-1)*evalB(b);if(q==0||st>=be)return st;if(st>a)a=st;
  for(const m of gen(b,c)){const t=b[m[3]][m[2]];if(!t)continue;if(t.t=='k')return 1e5;const v=-qs(app(b,m),-be,-a,opp(c),q-1);if(v>=be)return v;if(v>a)a=v}return a}
let DL=0,NC=0,QD=2;const TO={};
function nega(b,d,a,be,c){if((++NC&1023)==0&&DL&&Date.now()>DL)throw TO;if(d==0)return qs(b,a,be,c,QD);let best=-1e9;
  for(const m of gen(b,c)){const t=b[m[3]][m[2]];if(t&&t.t=='k')return 1e5+d;const v=-nega(app(b,m),d-1,-be,-a,opp(c));if(v>best)best=v;if(v>a)a=v;if(a>=be)break}return best}
async function aiPick(c,id){const bt=BOTS[lvl];QD=bt.qd;const root=[];
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=B[j][i];if(q&&q.c==c)for(const m of legal(B,i,j))root.push({i,j,m,s:0})}
  if(!root.length)return null;
  if(Math.random()<bt.b){const r=root[Math.random()*root.length|0];return [r.i,r.j,r.m]}
  DL=bt.t?Date.now()+bt.t*(MOB?.7:1):0;NC=0;let pick=null,sl=Date.now();
  for(let d=1;d<=bt.d;d++){let bs=-1e9;
    try{for(const r of root){const v=-nega(app(B,[r.i,r.j,r.m[0],r.m[1]]),d-1,-1e9,bt.r>5?1e9:-bs,opp(c));r.s=v;if(v>bs)bs=v;
        if(Date.now()-sl>10){await new Promise(z=>setTimeout(z,0));sl=Date.now();if(id!=G)return null}}}
    catch(e){if(e!==TO)throw e;break}
    root.sort((x,y)=>y.s-x.s);pick=root.map(r=>({r,s:r.s+Math.random()*bt.r})).sort((x,y)=>y.s-x.s)[0].r}
  DL=0;if(!pick)pick=root[0];return [pick.i,pick.j,pick.m]}
function aiTurn(){const c=aiC();if(!c||over||turn!=c)return;busy=true;status();const id=G;
  setTimeout(async()=>{if(id!=G||over)return;const t0=Date.now(),m=await aiPick(c,id);if(!m||id!=G||over)return;
    setTimeout(()=>{if(id==G&&!over)move(m[0],m[1],m[2])},Math.max(0,BOTS[lvl].ms-(Date.now()-t0)))},350)}


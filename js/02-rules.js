/* ---------- chess rules ---------- */
const inb=(x,y)=>x>=0&&x<8&&y>=0&&y<8;
const N=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]],K=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
function pm(b,x,y,att){const p=b[y][x],c=p.c,r=[];
  const add=(a,d)=>{if(!inb(a,d))return 0;const q=b[d][a];if(!q){r.push([a,d]);return 1}if(q.c!==c)r.push([a,d]);return 0};
  if(p.t=='p'){const d=c=='w'?1:-1;
    if(!att&&inb(x,y+d)&&!b[y+d][x]){r.push([x,y+d]);if(y==(c=='w'?1:6)&&!b[y+2*d][x])r.push([x,y+2*d])}
    for(const dx of[-1,1]){const a=x+dx,e=y+d;if(inb(a,e)&&(att||(b[e][a]&&b[e][a].c!=c)))r.push([a,e])}}
  else if(p.t=='n')N.forEach(([a,d])=>add(x+a,y+d));
  else if(p.t=='k')K.forEach(([a,d])=>add(x+a,y+d));
  else{const D=p.t=='r'?K.slice(0,4):p.t=='b'?K.slice(4):K;D.forEach(([a,d])=>{let i=1;while(add(x+a*i,y+d*i))i++})}
  return r}
function attacked(b,x,y,by){for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=b[j][i];if(q&&q.c==by&&pm(b,i,j,1).some(m=>m[0]==x&&m[1]==y))return 1}return 0}
function kingPos(b,c){for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=b[j][i];if(q&&q.t=='k'&&q.c==c)return[i,j]}}
const inChk=(b,c)=>{const k=kingPos(b,c);return attacked(b,k[0],k[1],opp(c))};
function legal(b,x,y){const p=b[y][x],out=[];
  for(const m of pm(b,x,y)){const nb=b.map(r=>r.slice());nb[m[1]][m[0]]=p;nb[y][x]=null;if(!inChk(nb,p.c))out.push(m)}
  if(p.t=='k'&&!p.m&&!inChk(b,p.c)){const o=opp(p.c);
    [[7,[5,6],[5,6],6],[0,[1,2,3],[2,3],2]].forEach(([rx,em,sf,tx])=>{const r=b[y][rx];
      if(r&&r.t=='r'&&!r.m&&em.every(i=>!b[y][i])&&sf.every(i=>!attacked(b,i,y,o)))out.push([tx,y,'c'])})}
  return out}
const anyMove=(b,c)=>{for(let j=0;j<8;j++)for(let i=0;i<8;i++)if(b[j][i]&&b[j][i].c==c&&legal(b,i,j).length)return 1;return 0};


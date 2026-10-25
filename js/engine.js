/* ---------- Gambit engine: 0x88 board, PVS + TT + null move + LMR. Runs in a Web Worker, falls back to the page ---------- */
(function(root){
'use strict';
const P=1,N=2,BI=3,R=4,Q=5,K=6;
const INF=32000,MATE=30000,MW=MATE-256,MAXP=128;
const bd=new Int8Array(128),ksq=new Int32Array(2);
let stm=0,ep=-1,cr=0,half=0,hlo=0,hhi=0,hn=0,useQS=true;

let seed=0x2545F491;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed|0};
const ZL=new Int32Array(16*128),ZH=new Int32Array(16*128);for(let i=0;i<ZL.length;i++){ZL[i]=rnd();ZH[i]=rnd()}
const ZSL=rnd(),ZSH=rnd();
const ZCL=new Int32Array(16),ZCH=new Int32Array(16);for(let i=0;i<16;i++){ZCL[i]=rnd();ZCH[i]=rnd()}
const ZEL=new Int32Array(128),ZEH=new Int32Array(128);for(let i=0;i<128;i++){ZEL[i]=rnd();ZEH[i]=rnd()}
const CM=new Int8Array(128).fill(15);CM[0]=13;CM[7]=14;CM[4]=12;CM[112]=7;CM[119]=11;CM[116]=3;

const ND=[33,31,18,14,-33,-31,-18,-14],BD=[17,15,-17,-15],RD=[16,1,-16,-1],KD=[17,15,-17,-15,16,1,-16,-1];
const VAL=[0,100,320,330,500,900,2000,0];

function put(sq,pc){bd[sq]=pc;hlo^=ZL[pc*128+sq];hhi^=ZH[pc*128+sq]}
function rem(sq){const pc=bd[sq];hlo^=ZL[pc*128+sq];hhi^=ZH[pc*128+sq];bd[sq]=0}

function attacked(sq,by){const c=by<<3;let s;
  if(by==0){s=sq-15;if(!(s&0x88)&&bd[s]==P)return true;s=sq-17;if(!(s&0x88)&&bd[s]==P)return true}
  else{s=sq+15;if(!(s&0x88)&&bd[s]==(P|8))return true;s=sq+17;if(!(s&0x88)&&bd[s]==(P|8))return true}
  for(let i=0;i<8;i++){s=sq+ND[i];if(!(s&0x88)&&bd[s]==(N|c))return true;s=sq+KD[i];if(!(s&0x88)&&bd[s]==(K|c))return true}
  for(let i=0;i<4;i++){const d=BD[i];s=sq+d;while(!(s&0x88)){const p=bd[s];if(p){if(p==(BI|c)||p==(Q|c))return true;break}s+=d}}
  for(let i=0;i<4;i++){const d=RD[i];s=sq+d;while(!(s&0x88)){const p=bd[s];if(p){if(p==(R|c)||p==(Q|c))return true;break}s+=d}}
  return false}

/* move = from | to<<7 | promo<<14 | flag<<17   (flag 1 = en passant, 2 = castle, 4 = double push) */
const MS=new Int32Array(MAXP*256),SC=new Int32Array(MAXP*256);
function gen(ply,caps){const base=ply*256;let n=base;const us=stm,c=us<<3,them=c^8;
  for(let sq=0;sq<120;sq++){if(sq&0x88){sq+=7;continue}const pc=bd[sq];if(!pc||(pc&8)!=c)continue;const t=pc&7;
    if(t==P){const fw=us?-16:16,start=us?6:1,last=us?0:7;let to=sq+fw;
      if(!(to&0x88)&&!bd[to]){
        if((to>>4)==last){MS[n++]=sq|to<<7|Q<<14;if(!caps){MS[n++]=sq|to<<7|N<<14;MS[n++]=sq|to<<7|R<<14;MS[n++]=sq|to<<7|BI<<14}}
        else if(!caps){MS[n++]=sq|to<<7;if((sq>>4)==start&&!bd[to+fw])MS[n++]=sq|(to+fw)<<7|4<<17}}
      for(let k=0;k<2;k++){to=sq+fw+(k?1:-1);if(to&0x88)continue;const tp=bd[to];
        if(tp&&(tp&8)==them){if((to>>4)==last){MS[n++]=sq|to<<7|Q<<14;if(!caps){MS[n++]=sq|to<<7|N<<14;MS[n++]=sq|to<<7|R<<14;MS[n++]=sq|to<<7|BI<<14}}else MS[n++]=sq|to<<7}
        else if(to==ep)MS[n++]=sq|to<<7|1<<17}}
    else if(t==N||t==K){const D=t==N?ND:KD;for(let i=0;i<8;i++){const to=sq+D[i];if(to&0x88)continue;const tp=bd[to];if(tp?(tp&8)==them:!caps)MS[n++]=sq|to<<7}
      if(t==K&&!caps){const o=us?112:0,by=us^1;
        if(cr&(us?4:1)&&!bd[o+5]&&!bd[o+6]&&bd[o+7]==(R|c)&&!attacked(o+4,by)&&!attacked(o+5,by)&&!attacked(o+6,by))MS[n++]=(o+4)|(o+6)<<7|2<<17;
        if(cr&(us?8:2)&&!bd[o+1]&&!bd[o+2]&&!bd[o+3]&&bd[o]==(R|c)&&!attacked(o+4,by)&&!attacked(o+3,by)&&!attacked(o+2,by))MS[n++]=(o+4)|(o+2)<<7|2<<17}}
    else{const D=t==BI?BD:t==R?RD:KD;for(let i=0;i<D.length;i++){const d=D[i];let to=sq+d;
      while(!(to&0x88)){const tp=bd[to];if(!tp){if(!caps)MS[n++]=sq|to<<7}else{if((tp&8)==them)MS[n++]=sq|to<<7;break}to+=d}}}}
  return n-base}

const U_cap=new Int8Array(MAXP),U_cr=new Int8Array(MAXP),U_ep=new Int16Array(MAXP),U_half=new Int16Array(MAXP),U_lo=new Int32Array(MAXP),U_hi=new Int32Array(MAXP);
const HL=new Int32Array(4096),HH=new Int32Array(4096);
function make(m,ply){const fr=m&127,to=(m>>7)&127,pr=(m>>14)&7,fl=m>>>17,pc=bd[fr],cap=bd[to];
  U_cap[ply]=cap;U_cr[ply]=cr;U_ep[ply]=ep;U_half[ply]=half;U_lo[ply]=hlo;U_hi[ply]=hhi;HL[hn]=hlo;HH[hn]=hhi;hn++;
  if(ep>=0){hlo^=ZEL[ep];hhi^=ZEH[ep]}hlo^=ZCL[cr];hhi^=ZCH[cr];
  if(cap)rem(to);rem(fr);put(to,pr?(pr|(pc&8)):pc);
  if(fl&1){const cs=stm?to+16:to-16;U_cap[ply]=bd[cs];rem(cs)}
  if(fl&2){if(to>fr){const r=bd[fr+3];rem(fr+3);put(fr+1,r)}else{const r=bd[fr-4];rem(fr-4);put(fr-1,r)}}
  ep=-1;if(fl&4){ep=(fr+to)>>1;hlo^=ZEL[ep];hhi^=ZEH[ep]}
  cr&=CM[fr]&CM[to];hlo^=ZCL[cr];hhi^=ZCH[cr];
  half=((pc&7)==P||cap||(fl&1))?0:half+1;
  if((pc&7)==K)ksq[stm]=to;
  stm^=1;hlo^=ZSL;hhi^=ZSH;
  if(attacked(ksq[stm^1],stm)){unmake(m,ply);return false}
  return true}
function unmake(m,ply){const fr=m&127,to=(m>>7)&127,pr=(m>>14)&7,fl=m>>>17;
  stm^=1;hn--;let pc=bd[to];if(pr)pc=P|(pc&8);
  bd[fr]=pc;
  if(fl&1){bd[to]=0;bd[stm?to+16:to-16]=U_cap[ply]}else bd[to]=U_cap[ply];
  if(fl&2){if(to>fr){bd[fr+3]=bd[fr+1];bd[fr+1]=0}else{bd[fr-4]=bd[fr-1];bd[fr-1]=0}}
  if((pc&7)==K)ksq[stm]=fr;
  cr=U_cr[ply];ep=U_ep[ply];half=U_half[ply];hlo=U_lo[ply];hhi=U_hi[ply]}
function makeNull(ply){U_ep[ply]=ep;U_lo[ply]=hlo;U_hi[ply]=hhi;U_half[ply]=half;HL[hn]=hlo;HH[hn]=hhi;hn++;
  if(ep>=0){hlo^=ZEL[ep];hhi^=ZEH[ep]}ep=-1;stm^=1;hlo^=ZSL;hhi^=ZSH;half=0}
function unNull(ply){stm^=1;hn--;ep=U_ep[ply];hlo=U_lo[ply];hhi=U_hi[ply];half=U_half[ply]}
function isRep(){for(let i=hn-2,lim=Math.max(0,hn-half);i>=lim;i-=2)if(HL[i]==hlo&&HH[i]==hhi)return true;return false}

/* ---------- evaluation: PeSTO tapered piece-square tables + pawn structure + mop-up ---------- */
const MGV=[0,82,337,365,477,1025,0],EGV=[0,94,281,297,512,936,0],PHW=[0,0,1,1,2,4,0];
const MGT=[[],
[0,0,0,0,0,0,0,0,98,134,61,95,68,126,34,-11,-6,7,26,31,65,56,25,-20,-14,13,6,21,23,12,17,-23,-27,-2,-5,12,17,6,10,-25,-26,-4,-4,-10,3,3,33,-12,-35,-1,-20,-23,-15,24,38,-22,0,0,0,0,0,0,0,0],
[-167,-89,-34,-49,61,-97,-15,-107,-73,-41,72,36,23,62,7,-17,-47,60,37,65,84,129,73,44,-9,17,19,53,37,69,18,22,-13,4,16,13,28,19,21,-8,-23,-9,12,10,19,17,25,-16,-29,-53,-12,-3,-1,18,-14,-19,-105,-21,-58,-33,-17,-28,-19,-23],
[-29,4,-82,-37,-25,-42,7,-8,-26,16,-18,-13,30,59,18,-47,-16,37,43,40,35,50,37,-2,-4,5,19,50,37,37,7,-2,-6,13,13,26,34,12,10,4,0,15,15,15,14,27,18,10,4,15,16,0,7,21,33,1,-33,-3,-14,-21,-13,-12,-39,-21],
[32,42,32,51,63,9,31,43,27,32,58,62,80,67,26,44,-5,19,26,36,17,45,61,16,-24,-11,7,26,24,35,-8,-20,-36,-26,-12,-1,9,-7,6,-23,-45,-25,-16,-17,3,0,-5,-33,-44,-16,-20,-9,-1,11,-6,-71,-19,-13,1,17,16,7,-37,-26],
[-28,0,29,12,59,44,43,45,-24,-39,-5,1,-16,57,28,54,-13,-17,7,8,29,56,47,57,-27,-27,-16,-16,-1,17,-2,1,-9,-26,-9,-10,-2,-4,3,-3,-14,2,-11,-2,-5,2,14,5,-35,-8,11,2,8,15,-3,1,-1,-18,-9,10,-15,-25,-31,-50],
[-65,23,16,-15,-56,-34,2,13,29,-1,-20,-7,-8,-4,-38,-29,-9,24,2,-16,-20,6,22,-22,-17,-20,-12,-27,-30,-25,-14,-36,-49,-1,-27,-39,-46,-44,-33,-51,-14,-14,-22,-46,-44,-30,-15,-27,1,7,-8,-64,-43,-16,9,8,-15,36,12,-54,8,-28,24,14]];
const EGT=[[],
[0,0,0,0,0,0,0,0,178,173,158,134,147,132,165,187,94,100,85,67,56,53,82,84,32,24,13,5,-2,4,17,17,13,9,-3,-7,-7,-8,3,-1,4,7,-6,1,0,-5,-1,-8,13,8,8,10,13,0,2,-7,0,0,0,0,0,0,0,0],
[-58,-38,-13,-28,-31,-27,-63,-99,-25,-8,-25,-2,-9,-25,-24,-52,-24,-20,10,9,-1,-9,-19,-41,-17,3,22,22,22,11,8,-18,-18,-6,16,25,16,17,4,-18,-23,-3,-1,15,10,-3,-20,-22,-42,-20,-10,-5,-2,-20,-23,-44,-29,-51,-23,-15,-22,-18,-50,-64],
[-14,-21,-11,-8,-7,-9,-17,-24,-8,-4,7,-12,-3,-13,-4,-14,2,-8,0,-1,-2,6,0,4,-3,9,12,9,14,10,3,2,-6,3,13,19,7,10,-3,-9,-12,-3,8,10,13,3,-7,-15,-14,-18,-7,-1,4,-9,-15,-27,-23,-9,-23,-5,-9,-16,-5,-17],
[13,10,18,15,12,12,8,5,11,13,13,11,-3,3,8,3,7,7,7,5,4,-3,-5,-3,4,3,13,1,2,1,-1,2,3,5,8,4,-5,-6,-8,-11,-4,0,-5,-1,-7,-12,-8,-16,-6,-6,0,2,-9,-9,-11,-3,-9,2,3,-1,-5,-13,4,-20],
[-9,22,22,27,27,19,10,20,-17,20,32,41,58,25,30,0,-20,6,9,49,47,35,19,9,3,22,24,45,57,40,57,36,-18,28,19,47,31,34,39,23,-16,-27,15,6,9,17,10,5,-22,-23,-30,-16,-16,-23,-36,-32,-33,-28,-22,-43,-5,-32,-20,-41],
[-74,-35,-18,-18,-11,15,4,-17,-12,17,14,17,17,38,23,11,10,17,23,15,20,45,44,13,-8,22,24,27,26,33,26,3,-18,-4,21,24,27,23,9,-11,-19,-3,11,21,23,16,7,-9,-27,-11,4,13,14,4,-5,-17,-53,-34,-21,-11,-28,-14,-24,-43]];
const PMG=new Int16Array(16*128),PEG=new Int16Array(16*128);
for(let t=1;t<=6;t++)for(let sq=0;sq<128;sq++){if(sq&0x88)continue;const r=sq>>4,f=sq&7;
  PMG[t*128+sq]=MGV[t]+MGT[t][(7-r)*8+f];PEG[t*128+sq]=EGV[t]+EGT[t][(7-r)*8+f];
  PMG[(t|8)*128+sq]=MGV[t]+MGT[t][r*8+f];PEG[(t|8)*128+sq]=EGV[t]+EGT[t][r*8+f]}
const PASS=[0,5,12,24,42,70,110,0];
const pc0=new Int8Array(8),pc1=new Int8Array(8),wMin=new Int8Array(8),bMax=new Int8Array(8);
function evaluate(){let mg0=0,mg1=0,eg0=0,eg1=0,ph=0,b0=0,b1=0,np0=0,np1=0,p0=0,p1=0;
  pc0.fill(0);pc1.fill(0);wMin.fill(8);bMax.fill(-1);
  for(let sq=0;sq<120;sq++){if(sq&0x88){sq+=7;continue}const pc=bd[sq];if(!pc)continue;const t=pc&7,f=sq&7,r=sq>>4;
    if(pc&8){mg1+=PMG[pc*128+sq];eg1+=PEG[pc*128+sq];if(t==P){pc1[f]++;if(r>bMax[f])bMax[f]=r;p1++}else if(t!=K){np1+=VAL[t];if(t==BI)b1++}}
    else{mg0+=PMG[pc*128+sq];eg0+=PEG[pc*128+sq];if(t==P){pc0[f]++;if(r<wMin[f])wMin[f]=r;p0++}else if(t!=K){np0+=VAL[t];if(t==BI)b0++}}
    ph+=PHW[t]}
  if(!p0&&!p1&&np0<=330&&np1<=330)return 0;
  if(b0>1){mg0+=30;eg0+=50}if(b1>1){mg1+=30;eg1+=50}
  for(let sq=0;sq<120;sq++){if(sq&0x88){sq+=7;continue}const pc=bd[sq];if(!pc)continue;const t=pc&7,f=sq&7,r=sq>>4;
    if(t==P){const L=f>0?f-1:f,Rr=f<7?f+1:f;
      if(pc&8){if(!(f>0&&pc1[f-1])&&!(f<7&&pc1[f+1])){mg1-=10;eg1-=14}
        let pass=true;for(let x=L;x<=Rr;x++)if(wMin[x]<r){pass=false;break}if(pass){mg1+=PASS[7-r]>>1;eg1+=PASS[7-r]}}
      else{if(!(f>0&&pc0[f-1])&&!(f<7&&pc0[f+1])){mg0-=10;eg0-=14}
        let pass=true;for(let x=L;x<=Rr;x++)if(bMax[x]>r){pass=false;break}if(pass){mg0+=PASS[r]>>1;eg0+=PASS[r]}}}
    else if(t==R){const own=pc&8?pc1[f]:pc0[f],oth=pc&8?pc0[f]:pc1[f];const v=!own?(!oth?25:12):0;if(pc&8)mg1+=v;else mg0+=v}}
  for(let f=0;f<8;f++){if(pc0[f]>1){mg0-=12*(pc0[f]-1);eg0-=18*(pc0[f]-1)}if(pc1[f]>1){mg1-=12*(pc1[f]-1);eg1-=18*(pc1[f]-1)}}
  /* king shelter while the queens are on */
  for(let s=0;s<2;s++){const k=ksq[s],kr=k>>4,kf=k&7,home=s?7:0;if(kr!==home&&kr!==home+(s?-1:1))continue;let sh=0;
    for(let df=-1;df<=1;df++){const f=kf+df;if(f<0||f>7)continue;for(let dr=1;dr<=2;dr++){const sq=(kr+(s?-dr:dr))*16+f;if(!(sq&0x88)&&bd[sq]==(P|(s<<3))){sh+=dr==1?14:8;break}}}
    if(s)mg1+=sh;else mg0+=sh}
  if(ph>24)ph=24;
  let sc=((mg0-mg1)*ph+(eg0-eg1)*(24-ph))/24|0;
  /* mop-up: drive a bare king into the corner so the winning side can actually mate */
  const diff=(np0+p0*100)-(np1+p1*100);
  if(ph<=8&&Math.abs(diff)>=300){const w=diff>0?0:1,lk=ksq[w^1],wk=ksq[w],lr=lk>>4,lf=lk&7;
    const cd=Math.max(3-lr,lr-4)+Math.max(3-lf,lf-4),kd=Math.abs((wk>>4)-lr)+Math.abs((wk&7)-lf);
    const mu=cd*12+(14-kd)*5;sc+=w?-mu:mu}
  return (stm?-sc:sc)+10}

/* ---------- search ---------- */
const TB=20,TM=(1<<TB)-1,TK=new Int32Array(1<<TB),TMV=new Int32Array(1<<TB),TS=new Int16Array(1<<TB),TD=new Int8Array(1<<TB),TF=new Int8Array(1<<TB);
const EX=1,LO=2,UP=3;
const KL=new Int32Array(MAXP*2),HS=new Int32Array(16*128);
let nodes=0,stop=false,deadline=0,nodeCap=0;
function tick(){if((nodes&2047)==0&&((deadline&&Date.now()>deadline)||(nodeCap&&nodes>nodeCap)))stop=true}
function scoreMoves(base,n,ttm,ply){const k1=KL[ply*2],k2=KL[ply*2+1];
  for(let i=base;i<base+n;i++){const m=MS[i];if(m==ttm){SC[i]=4e6;continue}const to=(m>>7)&127,pr=(m>>14)&7,fl=m>>>17,cap=bd[to];
    if(cap||(fl&1))SC[i]=2e6+VAL[cap?cap&7:P]*10-VAL[bd[m&127]&7];
    else if(pr)SC[i]=pr==Q?1.9e6:-1e5;
    else if(m==k1)SC[i]=1.5e6;else if(m==k2)SC[i]=1.4e6;
    else SC[i]=HS[bd[m&127]*128+to]}}
function pickNext(i,end){let b=i;for(let j=i+1;j<end;j++)if(SC[j]>SC[b])b=j;if(b!=i){const m=MS[i],s=SC[i];MS[i]=MS[b];SC[i]=SC[b];MS[b]=m;SC[b]=s}}
function hasPieces(s){const c=s<<3;for(let sq=0;sq<120;sq++){if(sq&0x88){sq+=7;continue}const p=bd[sq];if(p&&(p&8)==c&&(p&7)!=P&&(p&7)!=K)return true}return false}

function qs(a,b,ply){nodes++;tick();if(stop)return 0;
  let best=evaluate();if(!useQS||ply>=MAXP-1||best>=b)return best;if(best>a)a=best;
  const base=ply*256,n=gen(ply,true),end=base+n;scoreMoves(base,n,0,ply);
  for(let i=base;i<end;i++){pickNext(i,end);const m=MS[i],to=(m>>7)&127,pr=(m>>14)&7;
    const vic=(m>>>17)&1?P:(bd[to]&7);if(!pr&&best+VAL[vic]+200<a)continue;
    if(!make(m,ply))continue;const s=-qs(-b,-a,ply+1);unmake(m,ply);if(stop)return 0;
    if(s>best){best=s;if(s>a){a=s;if(s>=b)break}}}
  return best}

function search(a,b,d,ply,nul){const pv=b-a>1;
  if(ply){if(half>=100||isRep())return 0;const ma=-MATE+ply,mb=MATE-ply-1;if(a<ma)a=ma;if(b>mb)b=mb;if(a>=b)return a}
  const inC=attacked(ksq[stm],stm^1);if(inC)d++;
  if(d<=0)return qs(a,b,ply);
  nodes++;tick();if(stop)return 0;
  if(ply>=MAXP-2)return evaluate();
  const idx=hlo&TM;let ttm=0;
  if(TK[idx]==hhi){ttm=TMV[idx];if(!pv&&TD[idx]>=d){let s=TS[idx];if(s>MW)s-=ply;else if(s<-MW)s+=ply;const f=TF[idx];if(f==EX||(f==LO&&s>=b)||(f==UP&&s<=a))return s}}
  let ev=0;
  if(!inC&&!pv){ev=evaluate();
    if(d<=3&&ev-110*d>=b&&Math.abs(b)<MW)return ev;
    if(nul&&d>=3&&ev>=b&&hasPieces(stm)){makeNull(ply);const s=-search(-b,-b+1,d-1-(d>6?3:2),ply+1,false);unNull(ply);if(stop)return 0;if(s>=b)return s>MW?b:s}}
  const fut=!inC&&!pv&&d<=2&&Math.abs(a)<MW&&ev+(d==1?200:420)<=a;
  const base=ply*256,n=gen(ply,false),end=base+n;scoreMoves(base,n,ttm,ply);
  let best=-INF,bm=0,legal=0;const a0=a;
  for(let i=base;i<end;i++){pickNext(i,end);const m=MS[i],fr=m&127,to=(m>>7)&127;
    const quiet=!bd[to]&&!((m>>14)&7)&&!((m>>>17)&1);
    if(!make(m,ply))continue;legal++;
    const gc=attacked(ksq[stm],stm^1);
    if(fut&&quiet&&legal>1&&!gc){unmake(m,ply);continue}
    let s;
    if(legal==1)s=-search(-b,-a,d-1,ply+1,true);
    else{let r=0;if(d>=3&&quiet&&!inC&&!gc&&legal>3){r=1+(legal>8?1:0)+(d>=7?1:0);if(pv)r--;if(r>d-2)r=d-2;if(r<0)r=0}
      s=-search(-a-1,-a,d-1-r,ply+1,true);
      if(s>a&&r)s=-search(-a-1,-a,d-1,ply+1,true);
      if(s>a&&s<b)s=-search(-b,-a,d-1,ply+1,true)}
    unmake(m,ply);if(stop)return 0;
    if(s>best){best=s;bm=m;if(s>a){a=s;if(s>=b){if(quiet){if(KL[ply*2]!=m){KL[ply*2+1]=KL[ply*2];KL[ply*2]=m}const h=bd[fr]*128+to;HS[h]+=d*d;if(HS[h]>1e6)for(let j=0;j<HS.length;j++)HS[j]>>=1}break}}}}
  if(!legal)return inC?-MATE+ply:0;
  TK[idx]=hhi;TMV[idx]=bm;TS[idx]=best>MW?best+ply:best<-MW?best-ply:best;TD[idx]=d;TF[idx]=best>=b?LO:best>a0?EX:UP;
  return best}

/* ---------- setup ---------- */
function rehash(){hlo=hhi=0;for(let sq=0;sq<120;sq++){if(sq&0x88){sq+=7;continue}if(bd[sq]){hlo^=ZL[bd[sq]*128+sq];hhi^=ZH[bd[sq]*128+sq]}}
  if(stm){hlo^=ZSL;hhi^=ZSH}hlo^=ZCL[cr];hhi^=ZCH[cr];if(ep>=0){hlo^=ZEL[ep];hhi^=ZEH[ep]}}
function startPos(){bd.fill(0);const o=[R,N,BI,Q,K,BI,N,R];
  for(let f=0;f<8;f++){bd[f]=o[f];bd[16+f]=P;bd[96+f]=P|8;bd[112+f]=o[f]|8}
  stm=0;ep=-1;cr=15;half=0;hn=0;ksq[0]=4;ksq[1]=116;rehash()}
const PCH='pnbrqk';
function findMove(fr,to,pr){const n=gen(0,false);for(let i=0;i<n;i++){const m=MS[i];if((m&127)==fr&&((m>>7)&127)==to&&((m>>14)&7)==pr)return m}return 0}
function load(ml){startPos();
  for(const v of ml){const fr=v[1]*16+v[0],to=v[3]*16+v[2];let pr=v[4]?PCH.indexOf(v[4])+1:0;
    if(!pr&&(bd[fr]&7)==P&&((to>>4)==0||(to>>4)==7))pr=Q;
    const m=findMove(fr,to,pr);if(!m||!make(m,0))throw new Error('bad move '+v.join(','))}}
function fen(f){bd.fill(0);const [b,s,c,e,h]=f.split(' ');let r=7,x=0;
  for(const ch of b){if(ch=='/'){r--;x=0}else if(ch>='1'&&ch<='8')x+=+ch;else{const t=PCH.indexOf(ch.toLowerCase())+1,pc=t|(ch==ch.toLowerCase()?8:0);bd[r*16+x]=pc;if(t==K)ksq[pc>>3]=r*16+x;x++}}
  stm=s=='b'?1:0;cr=(c.includes('K')?1:0)|(c.includes('Q')?2:0)|(c.includes('k')?4:0)|(c.includes('q')?8:0);
  ep=e&&e!='-'?(+e[1]-1)*16+e.charCodeAt(0)-97:-1;half=+h||0;hn=0;rehash()}
function perft(d,ply){if(!d)return 1;const n=gen(ply,false),base=ply*256;let c=0;
  for(let i=base;i<base+n;i++){const m=MS[i];if(!make(m,ply))continue;c+=perft(d-1,ply+1);unmake(m,ply)}return c}

/* ---------- root: strong bots play the best move, weaker ones add noise and blunders ---------- */
function think(o){load(o.moves||[]);useQS=o.qs!==false;
  const t0=Date.now();nodes=0;stop=false;deadline=o.time?t0+o.time:0;nodeCap=o.nodes||0;KL.fill(0);for(let j=0;j<HS.length;j++)HS[j]>>=2;
  const rm=[],n=gen(0,false);for(let i=0;i<n;i++){const m=MS[i];if(make(m,0)){unmake(m,0);rm.push(m)}}
  if(!rm.length)return null;
  const out=(m,s,d)=>({f:[m&7,(m&127)>>4],t:[(m>>7)&7,((m>>7)&127)>>4],p:(m>>14)&7?PCH[((m>>14)&7)-1]:'',s,d,nodes});
  if(rm.length==1)return out(rm[0],0,0);
  if(o.blunder&&Math.random()<o.blunder)return out(rm[Math.random()*rm.length|0],0,0);
  const noise=o.noise||(hn<12?o.vary||0:0),margin=noise?noise*3+60:0,maxD=Math.min(o.depth||64,MAXP-10);
  let order=rm.map(m=>({m,s:-INF})),done=null,depth=0;
  for(let d=1;d<=maxD;d++){let a=-INF,best=-INF,i=0;
    for(;i<order.length;i++){const r=order[i];make(r.m,0);let s;
      if(noise){const lo=best==-INF?-INF:best-margin;s=-search(-INF,-lo,d-1,1,true)}
      else if(i==0)s=-search(-INF,INF,d-1,1,true);
      else{s=-search(-a-1,-a,d-1,1,true);if(s>a&&!stop)s=-search(-INF,-a,d-1,1,true)}
      unmake(r.m,0);if(stop)break;
      r.s=s;if(s>best)best=s;if(s>a)a=s}
    if(stop){if(!noise&&done&&i>0){const bb=order.slice(0,i).sort((x,y)=>y.s-x.s)[0];done=[{m:bb.m,s:bb.s}].concat(done.filter(x=>x.m!=bb.m))}break}
    order.sort((x,y)=>y.s-x.s);done=order.map(x=>({m:x.m,s:x.s}));depth=d;
    if(Math.abs(done[0].s)>MW&&d>=4)break;
    if(deadline&&Date.now()-t0>(deadline-t0)*.5)break}
  if(!done)done=order.map(x=>({m:x.m,s:0}));
  let pick=done[0];
  if(noise){const top=done[0].s;let bs=-Infinity;for(const c of done){if(c.s<top-margin)continue;const v=c.s+Math.random()*noise;if(v>bs){bs=v;pick=c}}}
  return out(pick.m,pick.s,depth)}

const API={think,_perft:(f,d)=>{fen(f);return perft(d,0)},_eval:f=>{fen(f);return evaluate()}};
if(typeof WorkerGlobalScope!=='undefined'&&root instanceof WorkerGlobalScope){
  root.onmessage=e=>{let r=null;try{r=think(e.data)}catch(err){r={error:String(err&&err.message||err)}}root.postMessage({id:e.data.id,r})}}
else root.GambitEngine=API;
if(typeof module!=='undefined')module.exports=API;
})(typeof self!=='undefined'?self:globalThis);

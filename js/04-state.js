/* ---------- state ---------- */
let B,P,pcs=[],turn,sel,legalM,busy=true,over=false,started=false,moves=0,caps,score,time,last=[],chk=null;
const wins={w:0,b:0};
let mode=CFG.mode,lvl=CFG.bot,human=CFG.human=='r'?'w':CFG.human,G=0,paused=false,demo=true,dirty=false,hudOn=false,shHold=4,prCap=1,prCur=1,ft=.0167,fc=0,qKey='',booted=false,hist=[],resTxt='',selG=null,bk='';const aiC=()=>mode=='ai'?opp(human):null;const BOTS=[
 {n:'Pip',e:250,g:'♟',c:'#8fb7a0',q:'“Is this the pointy horse?”',d:1,r:420,b:.45,qd:0,ms:500,t:0,tier:'Beginner'},
 {n:'Nora',e:400,g:'♟',c:'#b9a27a',q:'“I just like capturing things.”',d:1,r:300,b:.3,qd:0,ms:600,t:0,tier:'Beginner'},
 {n:'Biscuit',e:600,g:'♞',c:'#c98f6b',q:'“Snacks first, strategy later.”',d:1,r:180,b:.18,qd:1,ms:700,t:0,tier:'Beginner'},
 {n:'Otto',e:800,g:'♞',c:'#7fa0c9',q:'“I know the openings. Mostly.”',d:1,r:100,b:.1,qd:2,ms:800,t:0,tier:'Casual'},
 {n:'Mira',e:1000,g:'♝',c:'#a58cc9',q:'“Keep an eye on the diagonals.”',d:2,r:80,b:.05,qd:2,ms:900,t:0,tier:'Casual'},
 {n:'Dev',e:1200,g:'♜',c:'#d1a06a',q:'“Solid. Patient. Annoying.”',d:2,r:45,b:.02,qd:2,ms:1000,t:0,tier:'Casual'},
 {n:'Sasha',e:1500,g:'♝',c:'#7fc9b3',q:'“Your queen looks nervous.”',d:2,r:20,b:0,qd:3,ms:1100,t:0,tier:'Club'},
 {n:'Kai',e:1800,g:'♛',c:'#e08a7a',q:'“I calculate three moves ahead.”',d:3,r:12,b:0,qd:2,ms:1100,t:1000,tier:'Club'},
 {n:'Elara',e:2100,g:'♛',c:'#e8c982',q:'“Resign early. It saves time.”',d:4,r:4,b:0,qd:3,ms:1200,t:1400,tier:'Master'},
 {n:'Grandmaster',e:2400,g:'♚',c:'#d9505f',q:'“Good luck. You will need it.”',d:6,r:0,b:0,qd:3,ms:1400,t:2200,tier:'Master'}];
function put(t,c,x,y){B[y][x]={t,c,m:0};const g=mk(t,c),[wx,wz]=pos(x,y);g.position.set(wx,0,wz);g.userData={pc:1,x,y};P[y][x]=g;S.add(g);pcs.push(g)}
function newGame(){resetWreck();pcs.forEach(g=>S.remove(g));pcs=[];clr();
  B=Array.from({length:8},()=>Array(8).fill(null));P=Array.from({length:8},()=>Array(8).fill(null));
  const o='rnbqkbnr';for(let x=0;x<8;x++){put(o[x],'w',x,0);put('p','w',x,1);put('p','b',x,6);put(o[x],'b',x,7)}
  turn='w';sel=null;legalM=[];busy=true;over=false;started=false;moves=0;caps={w:[],b:[]};score={w:0,b:0};time={w:CFG.tc,b:CFG.tc};last=[];chk=null;
  hist=[];resTxt='';selG=null;$('#ov').style.display='none';paint();ui();status();drawSheet();penRest();chkFx();tilesIn();
  pcs.forEach((g,i)=>{g.position.y=7;g.scale.set(.01,.01,.01);
    anime({targets:g.position,y:0,duration:900,delay:650+i*28,easing:'easeOutBounce'});
    anime({targets:g.scale,x:1,y:1,z:1,duration:600,delay:650+i*28,easing:'easeOutBack'})});
  const id=++G;camSide();setTimeout(()=>{if(id==G&&!demo){busy=false;aiTurn()}},2600)}
function camSide(){const t=mode=='ai'&&human=='b'?Math.PI:0,k=t+Math.round((cs.th-t)/(2*Math.PI))*2*Math.PI;if(booted)anime({targets:cs,th:k,ph:.95,rad:baseRad(),duration:1200,easing:'easeInOutCubic',update:setCam})}

/* ---------- 3D scoresheet ---------- */
const pivot=new THREE.Group();S.add(pivot);const sheet=new THREE.Group();sheet.rotation.y=.06;pivot.add(sheet);
const cvs=document.createElement('canvas');cvs.width=640;cvs.height=880;const cx=cvs.getContext('2d');cx.scale(.625,.625);let lastDS=0;
const tex=new THREE.CanvasTexture(cvs);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
const clipb=new THREE.Mesh(new THREE.BoxGeometry(3.7,.12,5.0),new THREE.MeshStandardMaterial({color:0x3a2a22,roughness:.7}));clipb.position.y=.06;clipb.castShadow=clipb.receiveShadow=true;sheet.add(clipb);
const paper=new THREE.Mesh(new THREE.PlaneGeometry(3.3,4.55),new THREE.MeshStandardMaterial({map:tex,roughness:.92}));paper.rotation.x=-Math.PI/2;paper.position.set(0,.125,.08);paper.receiveShadow=true;sheet.add(paper);
const metal=new THREE.Mesh(new THREE.BoxGeometry(1.3,.1,.34),new THREE.MeshStandardMaterial({color:0xb8bcc8,metalness:.9,roughness:.3}));metal.position.set(0,.2,-2.36);metal.castShadow=true;sheet.add(metal);
const pen=new THREE.Group();
const pbody=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1.2,14),new THREE.MeshStandardMaterial({color:0x1d2a6b,metalness:.5,roughness:.3}));pbody.rotation.z=Math.PI/2;pbody.position.x=.66;pbody.castShadow=true;
const ptip=new THREE.Mesh(new THREE.ConeGeometry(.045,.14,14),new THREE.MeshStandardMaterial({color:0xcccccc,metalness:.8,roughness:.3}));ptip.rotation.z=Math.PI/2;ptip.position.x=-.04;
pen.add(pbody,ptip);pen.rotation.set(0,.55,.28);sheet.add(pen);
const cell=(px,py)=>[(px/1024-.5)*3.3,.08+(py/1408-.5)*4.55];
function penRest(){const [x,z]=cell(820,1190);pen.position.set(x,.15,z)}
const bgc=document.createElement('canvas');bgc.width=1024;bgc.height=1408;
(function(){const c=bgc.getContext('2d');c.fillStyle='#f6f1e3';c.fillRect(0,0,1024,1408);for(let i=0;i<2600;i++){c.fillStyle='rgba(120,100,60,'+Math.random()*.06+')';c.fillRect(Math.random()*1024,Math.random()*1408,2,2)}})();
const RV={v:1},RY=442,RH=40,INK='#1c3a8a',LN='#cfc9b4';
const nameOf=c=>aiC()==c?BOTS[lvl].n+' ('+BOTS[lvl].e+')':mode=='ai'?'You':c=='w'?'Player 1':'Player 2';
function drawSheet(){const c=cx,pd=n=>String(n).padStart(2,'0');c.drawImage(bgc,0,0);c.textAlign='left';
  c.fillStyle='#2a1a12';c.font='600 52px "Pixelify Sans",sans-serif';c.fillText('Gambit Club',64,100);c.fillStyle='#8e2a35';c.font='500 24px "Pixelify Sans",sans-serif';c.fillText('official scoresheet',470,100);c.strokeStyle='#c8a05a';c.lineWidth=3;c.beginPath();c.moveTo(64,118);c.lineTo(960,118);c.stroke();c.lineWidth=1;c.beginPath();c.moveTo(64,126);c.lineTo(960,126);c.stroke();
  c.font='400 24px "Pixelify Sans",sans-serif';c.fillStyle='#6a6658';c.fillText('Board 1   Game '+(wins.w+wins.b+(over?0:1)),64,162);c.textAlign='right';c.fillText(new Date().toDateString(),960,162);c.textAlign='left';
  c.fillStyle='#2a2a2e';c.font='600 26px "Pixelify Sans",sans-serif';
  [['White','w',230],['Black','b',300]].forEach(([l,k,y])=>{c.fillStyle='#2a2a2e';c.font='600 26px "Pixelify Sans",sans-serif';c.fillText(l,64,y);
    c.strokeStyle=LN;c.lineWidth=2;c.beginPath();c.moveTo(170,y+10);c.lineTo(740,y+10);c.moveTo(800,y+10);c.lineTo(960,y+10);c.stroke();
    c.font='400 22px "Pixelify Sans",sans-serif';c.fillStyle='#6a6658';c.fillText('Pts',760,y);
    c.font='600 44px Caveat,cursive';c.fillStyle=INK;c.fillText(nameOf(k),190,y+4);c.fillText(pd(score[k]),815,y+4)});
  c.fillStyle='#e9e2cc';c.fillRect(64,RY-52,896,52);c.fillStyle='#2a2a2e';c.font='600 26px "Pixelify Sans",sans-serif';c.fillText('No.',84,RY-16);c.fillText('White',175,RY-16);c.fillText('Black',585,RY-16);
  c.strokeStyle=LN;c.lineWidth=2;
  for(let r=0;r<=20;r++){c.beginPath();c.moveTo(64,RY+r*RH);c.lineTo(960,RY+r*RH);c.stroke()}
  [64,150,560,960].forEach(x=>{c.beginPath();c.moveTo(x,RY-52);c.lineTo(x,RY+800);c.stroke()});
  const pg=Math.floor(Math.max(0,hist.length-1)/40);
  for(let r=0;r<20;r++){const n=pg*20+r+1,y=RY+r*RH+30;c.fillStyle='#8a8574';c.font='400 22px "Pixelify Sans",sans-serif';c.fillText(n,84,y-2);
    for(let t=0;t<2;t++){const k=(n-1)*2+t,m=hist[k];if(!m)continue;const x=t?585:175;c.font='600 36px Caveat,cursive';c.fillStyle=INK;
      if(k==hist.length-1&&RV.v<1){c.save();c.beginPath();c.rect(x-4,y-40,(c.measureText(m).width+10)*RV.v,56);c.clip();c.fillText(m,x,y);c.restore()}else c.fillText(m,x,y)}}
  c.fillStyle='#2a2a2e';c.font='600 26px "Pixelify Sans",sans-serif';c.fillText('Result',64,1318);c.strokeStyle=LN;c.beginPath();c.moveTo(170,1326);c.lineTo(440,1326);c.stroke();
  c.font='600 48px Caveat,cursive';c.fillStyle=INK;c.fillText(resTxt,185,1318);
  c.font='400 24px "Pixelify Sans",sans-serif';c.fillStyle='#6a6658';c.fillText('Captured  W '+pd(score.w)+'   B '+pd(score.b),520,1318);
  c.fillText('Sign (W) ____________    Sign (B) ____________',64,1382);
  if(BURN.v>0)drawBurn(c);tex.needsUpdate=true}
function write(n){hist.push(n);const k=hist.length-1,r=Math.floor((k%40)/2),[x,z]=cell(k%2?600:190,RY+r*RH+34);
  RV.v=0;anime.remove(RV);anime.remove(pen.position);drawSheet();
  anime({targets:pen.position,x,z,duration:450,easing:'easeInOutCubic'});
  anime({targets:pen.position,y:[{value:.45,duration:200,easing:'easeOutQuad'},{value:.15,duration:250,easing:'easeInQuad'}]});
  anime({targets:pen.position,x:[x,x+.5],duration:700,delay:450,easing:'easeInOutSine'});
  anime({targets:RV,v:1,duration:700,delay:450,easing:'easeInOutSine',update:()=>{const n=performance.now();if(n-lastDS>70){lastDS=n;drawSheet()}},complete:drawSheet});
  anime({targets:sheet.rotation,x:[{value:.02,duration:120},{value:0,duration:600,easing:'easeOutElastic(1,.5)'}]})}
if(document.fonts)Promise.all([document.fonts.load('600 36px Caveat'),document.fonts.load('600 26px "Pixelify Sans"'),document.fonts.load('600 40px "Pixelify Sans"')]).then(()=>{if(score)drawSheet()}).catch(()=>{});


/* ---------- ui ---------- */
let tt;function toast(s){const e=$('#toast');e.textContent=s;e.style.display='inline-block';mo(e,{opacity:[0,1],y:[-24,0],scale:[.8,1]},{duration:.4});
  clearTimeout(tt);tt=setTimeout(()=>{const a=mo(e,{opacity:[1,0]},{duration:.4});setTimeout(()=>e.style.display='none',420)},1300)}
function setFl(el,t){t=String(t);if(el.dataset.v===t)return;const fresh=el.children.length!=t.length;el.dataset.v=t;
  if(fresh)el.innerHTML=[...t].map(ch=>'<span'+(ch==':'?' class="c"':'')+'>'+ch+'</span>').join('');
  else[...t].forEach((ch,i)=>{const sp=el.children[i];if(sp.textContent!==ch){sp.textContent=ch;mo(sp,{rotateX:[-85,0],opacity:[.2,1]},{duration:.4})}})}
function status(){const s=$('#st'),nm=turn=='w'?'White':'Black';s.className=chk?'chk':'';
  const th=!over&&aiC()==turn;s.classList.toggle('think',th);s.textContent=over?'Game over':chk?'Check, '+nm+' to move':th?BOTS[lvl].n+' is thinking':mode=='ai'&&turn==human?'Your move':nm+"'s move";$('#brs').style.display=over||demo?'none':''}
function ui(){['w','b'].forEach(c=>{$('#n'+c).textContent=aiC()==c?BOTS[lvl].n+' · '+BOTS[lvl].e:mode=='ai'?'You':c=='w'?'White':'Black';
  setFl($('#s'+c),String(score[c]).padStart(2,'0'));setFl($('#t'+c),fmt(time[c]));$('#t'+c).classList.toggle('low',CFG.tc>0&&started&&time[c]<=30);
  const df=score[c]-score[opp(c)],ord='qrbnp';$('#c'+c).innerHTML=caps[c].slice().sort((a,b)=>ord.indexOf(a)-ord.indexOf(b)).map(t=>SYM[opp(c)][t]+'\uFE0E').join('')+(df>0?'<em>+'+df+'</em>':'');$('#w'+c).textContent=wins[c];$('#p'+c).classList.toggle('on',turn==c&&!over)});
  setFl($('#mv'),String(moves).padStart(2,'0'));
  const k2=turn+over;if(k2!=bk){bk=k2;bars.forEach((b,i)=>{const on=!over&&turn==(i?'b':'w');anime.remove(b.material);anime({targets:b.material,emissiveIntensity:on?1.5:.08,duration:500,easing:'easeOutQuad'})})}}
setInterval(()=>{if(started&&!over&&!paused&&CFG.tc&&!document.hidden){time[turn]--;if(time[turn]<=0){time[turn]=0;if(noMate(B,opp(turn)))finish(null,'Time out, but no mating material left');else finish(opp(turn),'Time out')}ui()}},1000);
$('#bn').onclick=()=>startGame();$('#ob').onclick=()=>startGame();$('#obb').onclick=()=>{$('#ov').style.display='none';openBots()};
let rsT;$('#brs').onclick=()=>{const b=$('#brs');if(over||demo)return;if(!b.classList.contains('sure')){b.classList.add('sure');b.textContent='Sure? Tap again';clearTimeout(rsT);rsT=setTimeout(()=>{b.classList.remove('sure');b.textContent='Resign'},2600);return}
  clearTimeout(rsT);b.classList.remove('sure');b.textContent='Resign';const loser=mode=='ai'?human:turn;finish(opp(loser),(mode=='ai'?'You resigned':(loser=='w'?'White':'Black')+' resigned'))};
$('#bf').onclick=()=>anime({targets:cs,th:cs.th+Math.PI,duration:1000,easing:'easeInOutQuart',update:setCam});

/* ---------- camera + input ---------- */
const cs={th:-1.5,ph:.25,rad:34},sh={v:0};
const baseRad=()=>{const a=innerWidth/innerHeight;return a>=1?Math.max(12.5,8.6/(.414*a)):Math.min(30,Math.max(12.5,5.4/(.414*a)))};
let shK=0;
function setCam(){cam.position.set(cs.rad*Math.sin(cs.ph)*Math.sin(cs.th),cs.rad*Math.cos(cs.ph),cs.rad*Math.sin(cs.ph)*Math.cos(cs.th));const jj=sh.v*CFG.shake;cam.position.x+=(Math.random()-.5)*jj;cam.position.y+=(Math.random()-.5)*jj;cam.lookAt(0,.3,0);
  const k=Math.round(cs.th/Math.PI)*Math.PI;if(k!==shK){shK=k;anime.remove(pivot.rotation);anime({targets:pivot.rotation,y:k,duration:900,easing:'easeInOutCubic'})}}
function resize(){R.setSize(innerWidth,innerHeight,false);const a=innerWidth/innerHeight;cam.aspect=a;cam.updateProjectionMatrix();
  if(a>=1){sheet.position.set(6.9,0,0);sheet.scale.setScalar(1)}else{sheet.position.set(0,0,8.2);sheet.scale.setScalar(.9)}setCam()}
let rzT,oa=innerWidth>=innerHeight;addEventListener('resize',()=>{resize();clearTimeout(rzT);rzT=setTimeout(()=>{const na=innerWidth>=innerHeight;if(na!==oa){oa=na;anime({targets:cs,rad:baseRad(),duration:600,easing:'easeOutQuad',update:setCam})}},300)});resize();cv.addEventListener('contextmenu',e=>e.preventDefault());
const RC=new THREE.Raycaster(),mv=new THREE.Vector2();
function pick(e){mv.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);RC.setFromCamera(mv,cam);
  for(const h of RC.intersectObjects([...tl,...pcs],true)){let o=h.object;
    while(o){if(o.userData.sq)return click(o.userData.sq[0],o.userData.sq[1]);if(o.userData.pc)return click(o.userData.x,o.userData.y);o=o.parent}}}
const ptr=new Map();let moved=0,pd=0;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,e);moved=0;if(ptr.size==2){const [a,b]=[...ptr.values()];pd=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}});
cv.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;const o=ptr.get(e.pointerId);
  if(ptr.size==1){const dx=e.clientX-o.clientX,dy=e.clientY-o.clientY;moved+=Math.abs(dx)+Math.abs(dy);
    if(moved>6){cs.th-=dx*.006;cs.ph=Math.min(1.45,Math.max(.25,cs.ph-dy*.005));setCam()}}
  else{moved+=9;ptr.set(e.pointerId,e);const [a,b]=[...ptr.values()],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    cs.rad=Math.min(34,Math.max(7,cs.rad*pd/d));pd=d;setCam()}
  ptr.set(e.pointerId,e)});
const up=e=>{if(ptr.size==1&&moved<=6&&e.type=='pointerup')pick(e);ptr.delete(e.pointerId)};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();cs.rad=Math.min(34,Math.max(7,cs.rad*(1+e.deltaY*.001)));setCam()},{passive:false});


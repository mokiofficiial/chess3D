/* ---------- boot ---------- */
let lt=0,fcSkip=0;(function loop(t){requestAnimationFrame(loop);const dr=(t-lt)/1000||0;fxStep(Math.min(.05,dr));lt=t;adapt(dr);if(demo&&booted){cs.th+=Math.min(dr,.05)*.14;setCam()}if(anime.running.length||wreck||FE.length)shHold=4;if(shHold>0){R.shadowMap.needsUpdate=true;shHold--}if(cloudG.visible)cloudG.rotation.y+=Math.min(dr,.05)*.012;t*=.0006;
  dust.rotation.y=t*.4;dust.position.y=Math.sin(t*2)*.25;L1.position.set(Math.cos(t)*7,5,Math.sin(t)*7);L2.position.set(-Math.cos(t*.8)*7,5,-Math.sin(t*.8)*7);if(!(demo&&booted&&!anime.running.length&&!wreck&&!FE.length&&(fcSkip^=1)))R.render(S,cam)})(0);
/* ---------- graphics quality (phone friendly) ---------- */
const QP={low:{pr:1,sh:0,ss:512,pp:120,dust:0,lt:0,an:1},med:{pr:1.5,sh:1,ss:1024,pp:240,dust:1,lt:1,an:2},high:{pr:1.5,sh:1,ss:1024,pp:360,dust:1,lt:1,an:4}};
let lastW=0,lastH=0;function setPR(v){if(v===prCur&&innerWidth===lastW&&innerHeight===lastH)return;prCur=v;lastW=innerWidth;lastH=innerHeight;R.setPixelRatio(v);R.setSize(innerWidth,innerHeight,false)}
function applyQ(){let k=CFG.q;if(k=='auto')k=(MOB||(window.devicePixelRatio||1)>=2)?'med':'high';const q=QP[k];prCap=Math.min(window.devicePixelRatio||1,q.pr);setPR(prCap);
  if(k!==qKey){qKey=k;R.shadowMap.enabled=!!q.sh;R.shadowMap.type=k=='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;sun.castShadow=!!q.sh;
    if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}sun.shadow.mapSize.set(q.ss,q.ss);
    dust.visible=!!q.dust&&CFG.theme!='mc';L1.visible=L2.visible=!!q.lt&&CFG.theme!='mc';PPN=q.pp;PP.forEach((pp,i)=>{if(i>=PPN){pp.on=0;pp.sp.visible=false}});tex.anisotropy=q.an;shHold=4;
    S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{m.needsUpdate=true})})}}
let qStreak=0,qCool=0;function adapt(d){if(d>.2)return;ft=ft*.96+d*.04;if(++fc%120||CFG.q!='auto')return;
  const fl=MOB?.9:1;if(qCool){qCool--;qStreak=0;return}
  qStreak=(ft>.026)?qStreak-1:(ft<.0185)?qStreak+1:0;
  if(qStreak<=-2&&prCur>fl){setPR(Math.max(fl,prCur-.15));qStreak=0;qCool=2}
  else if(qStreak>=3&&prCur<prCap-.01){setPR(Math.min(prCap,prCur+.1));qStreak=0;qCool=2}}
/* ---------- settings page ---------- */
const OFF_ON=[[1,'On'],[0,'Off']];
const ROWS=[['Theme','theme',[['classic','Classic'],['mc','Minecraft']]],['Opponent','mode',[['ai','Computer'],['2p','Friend']],1],['Bot','bot',[],1,'ai'],['You play','human',[['w','White'],['b','Black'],['r','Random']],1,'ai'],
  ['Clock','tc',[[180,'3 min'],[300,'5 min'],[600,'10 min'],[900,'15 min'],[0,'Off']],1],['Graphics','q',[['auto','Auto'],['low','Low'],['med','Medium'],['high','High']]],
  ['Sound','snd',OFF_ON],['Vibration','vib',OFF_ON,0,'',!navigator.vibrate],['Move hints','hints',OFF_ON],['Camera shake','shake',OFF_ON],['Kill effects','kfx',OFF_ON],['Final explosion','blast',OFF_ON],['Turn board each move','flip',OFF_ON,0,'2p']];
function renderSet(){const box=$('#setRows');box.innerHTML='';
  ROWS.forEach(([lb,key,opts,ng,only,hide])=>{if(hide||(only&&CFG.mode!=only))return;
    const r=document.createElement('div');r.className='sr';r.innerHTML='<label>'+lb+'</label><div class="seg"></div>';const sg=r.lastChild;
    if(key=='bot'){const bb=document.createElement('button');bb.className='mb';bb.style.width='100%';bb.textContent=BOTS[lvl].n+'  ('+BOTS[lvl].e+')';bb.onclick=openBots;sg.appendChild(bb);box.appendChild(r);return}
    opts.forEach(([v,t])=>{const b=document.createElement('button');b.textContent=t;if(CFG[key]===v)b.className='on';
      b.onclick=()=>{CFG[key]=v;mode=CFG.mode;lvl=CFG.bot;human=CFG.human=='r'?'w':CFG.human;saveCfg();if(ng)dirty=true;if(key=='q')applyQ();if(key=='theme')applyTheme();if(key=='tc')ui();renderSet()};sg.appendChild(b)});
    box.appendChild(r)})}
/* ---------- bot picker ---------- */
const avatar=b=>'<span class="av" style="background:radial-gradient(circle at 35% 30%,'+b.c+',#2a1a12)">'+b.g+'\uFE0E</span>';
function renderBots(){const L=$('#botList');L.innerHTML='';let tier='';
  BOTS.forEach((b,i)=>{if(b.tier!==tier){tier=b.tier;const h=document.createElement('div');h.className='th';h.textContent=tier;L.appendChild(h)}
    const d=document.createElement('div');d.className='bt'+(i==lvl?' on':'');
    d.innerHTML=avatar(b)+'<div class="bi"><div class="bn">'+b.n+' <span class="be">'+b.e+'</span></div><div class="bq">'+b.q+'</div><div class="lv"><i style="width:'+Math.round((b.e-250)/21.5)+'%"></i></div></div>';
    d.onclick=()=>{CFG.bot=lvl=i;saveCfg();renderBots()};L.appendChild(d)});
  const sg=$('#botSide');sg.innerHTML='';
  [['w','White'],['b','Black'],['r','Random']].forEach(([v,t])=>{const x=document.createElement('button');x.textContent=t;if(CFG.human===v)x.className='on';x.onclick=()=>{CFG.human=v;human=v=='r'?'w':v;saveCfg();renderBots()};sg.appendChild(x)});
  const on=L.querySelector('.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'})}
function openBots(){$('#bots').style.display='flex';renderBots()}
$('#botGo').onclick=()=>{$('#bots').style.display='none';$('#set').style.display='none';startGame('ai')};
$('#botBack').onclick=()=>{$('#bots').style.display='none'};
let sayT;function say(t,i){const b=BOTS[i],e=$('#say'),av=$('#sayAv');av.style.background='radial-gradient(circle at 35% 30%,'+b.c+',#2a1a12)';av.textContent=b.g+'\uFE0E';$('#sayTx').textContent=b.n+': '+t;
  e.style.display='flex';mo(e,{opacity:[0,1],y:[16,0]},{duration:.4});clearTimeout(sayT);sayT=setTimeout(()=>{anime({targets:e,opacity:0,duration:400,complete:()=>{e.style.display='none'}})},3400)}
/* ---------- menu ---------- */
function openMenu(inGame){paused=!demo;$('#mResume').style.display=(inGame&&!over)?'':'none';const sp=$('#sp');sp.style.display='flex';sp.style.pointerEvents='auto';anime.remove(sp);anime({targets:sp,opacity:[0,1],duration:350,easing:'easeOutQuad'})}
function closeMenu(){const sp=$('#sp');sp.style.pointerEvents='none';anime.remove(sp);anime({targets:sp,opacity:0,duration:500,easing:'easeInOutQuad',complete:()=>{sp.style.display='none'}});paused=false}
function startGame(m){if(m){mode=CFG.mode=m;saveCfg()}human=CFG.human=='r'?(Math.random()<.5?'w':'b'):CFG.human;demo=false;paused=false;dirty=false;closeMenu();$('#ov').style.display='none';newGame();const gid=G;if(mode=='ai')setTimeout(()=>{if(gid==G)say(BOTS[lvl].q,lvl)},3000);
  if(!hudOn){hudOn=true;mo($('#hud'),{opacity:[0,1],y:[-30,0]},{duration:.8,delay:.5});mo($('#bar'),{opacity:[0,1],y:[30,0]},{duration:.8,delay:.7})}}
$('#mAi').onclick=openBots;$('#m2p').onclick=()=>startGame('2p');$('#mResume').onclick=closeMenu;
$('#mSet').onclick=()=>{renderSet();$('#set').style.display='flex'};
$('#setDone').onclick=()=>{$('#set').style.display='none';if(dirty){dirty=false;if(!demo)startGame()}};
$('#setReset').onclick=()=>{const k=['mode','bot','human','tc'].map(x=>CFG[x]).join();Object.assign(CFG,{mode:'ai',bot:4,theme:'classic',human:'w',tc:600,q:'auto',snd:1,vib:1,hints:1,shake:1,blast:1,flip:0,kfx:1});mode=CFG.mode;lvl=CFG.bot;human=CFG.human;saveCfg();applyQ();applyTheme();if(k!='ai,4,w,600')dirty=true;renderSet()};
$('#mHow').onclick=()=>{$('#how').style.display='flex'};$('#howDone').onclick=()=>{$('#how').style.display='none'};
$('#mCred').onclick=()=>{$('#cred').style.display='flex'};$('#credDone').onclick=()=>{$('#cred').style.display='none'};
$('#bmenu').onclick=()=>openMenu(true);
/* ---------- boot: live board behind the menu ---------- */
applyQ();applyTheme();
$('#wm').innerHTML=[...'Gambit'].map(c=>'<span>'+c+'</span>').join('');
anime({targets:'#wm span',translateY:[50,0],opacity:[0,1],delay:anime.stagger(100,{start:200}),duration:1100,easing:'easeOutExpo'});
anime({targets:'#sp .r8,#sp p,#sp .mbtns>*,#sp .duo .mb',opacity:[0,1],translateY:[14,0],delay:anime.stagger(110,{start:800}),duration:700,easing:'easeOutQuad'});
newGame();Object.assign(cs,{th:-.5,ph:1.0,rad:baseRad()*1.15});setCam();booted=true;

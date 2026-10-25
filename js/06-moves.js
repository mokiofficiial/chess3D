/* ---------- moves ---------- */
/* ---------- per-piece movement + kill effects ---------- */
const UP=new THREE.Vector3(0,1,0);
const MV={p:{d:520,h:.45},r:{d:560,h:.05},n:{d:780,h:1.7},b:{d:660,h:.2},q:{d:720,h:.9},k:{d:820,h:.38}};
const GEO={box:new THREE.BoxGeometry(.13,.13,.13),oct:new THREE.OctahedronGeometry(.11),coin:new THREE.CylinderGeometry(.1,.1,.03,16)};
const STONE=new THREE.MeshStandardMaterial({color:0x8d8678,roughness:.95}),GOLD=new THREE.MeshStandardMaterial({color:0xe8c982,metalness:.9,roughness:.25,emissive:0x6a4a10,emissiveIntensity:.5});
const SHARD={w:new THREE.MeshStandardMaterial({color:0xf3e7cc,roughness:.4}),b:new THREE.MeshStandardMaterial({color:0x4a2e22,roughness:.4})};
const glow=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o==null?.9:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
function addM(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);S.add(m);return m}
function fade(m,dur,delay){anime({targets:m.material,opacity:0,duration:dur,delay:delay||0,easing:'linear',complete:()=>S.remove(m)})}
function puff(x,z){const m=addM(PG,new THREE.MeshBasicMaterial({color:0xcbbf9f,transparent:true,opacity:.55,depthWrite:false}),x,.12,z);m.scale.setScalar(2);anime({targets:m.scale,x:6,y:6,z:6,duration:700,easing:'easeOutQuad'});fade(m,700)}
function streak(ax,az,bx,bz,col,w,dur,op,y){const len=Math.hypot(bx-ax,bz-az)||.01,m=addM(new THREE.PlaneGeometry(len,w),glow(col,op||.8),(ax+bx)/2,y||.07,(az+bz)/2);
  m.rotation.x=-Math.PI/2;m.rotateOnWorldAxis(UP,-Math.atan2(bz-az,bx-ax));m.scale.y=.2;
  anime({targets:m.scale,y:1,duration:dur*.25,easing:'easeOutQuad'});fade(m,dur*.75,dur*.25)}
function shock(x,z,col,sz,dur){const m=addM(new THREE.RingGeometry(.2,.3,48),glow(col,.85),x,.07,z);m.rotation.x=-Math.PI/2;m.scale.setScalar(.5);anime({targets:m.scale,x:sz,y:sz,duration:dur,easing:'easeOutQuad'});fade(m,dur)}
function halo(x,z,col,top){const m=addM(new THREE.TorusGeometry(.42,.025,8,40),glow(col,.9),x,.25,z);m.rotation.x=Math.PI/2;anime({targets:m.position,y:top,duration:900,easing:'easeOutQuad'});anime({targets:m.scale,x:2,y:2,z:2,duration:900,easing:'easeOutQuad'});fade(m,500,500)}
function pillar(x,z,col,r,h,dur){const m=addM(new THREE.CylinderGeometry(r,r,h,24,1,true),glow(col,.75),x,h*1.6,z);
  anime({targets:m.position,y:h/2,duration:320,easing:'easeInQuad'});anime({targets:m.scale,x:[1,1.8],z:[1,1.8],duration:dur,delay:320,easing:'easeOutQuad'});fade(m,dur*.6,320+dur*.2)}
function debris(x,z,n,geo,mat,spr,up,dur,keep){for(let i=0;i<n;i++){const m=addM(geo,mat,x,.3,z),a=Math.random()*6.283,d=spr*(.4+Math.random()),h=up*(.6+Math.random()*.8);
  m.rotation.set(Math.random()*6,Math.random()*6,0);m.scale.setScalar(.6+Math.random()*.9);m.castShadow=true;
  anime({targets:m.position,x:x+Math.cos(a)*d,z:z+Math.sin(a)*d,duration:dur,easing:'easeOutQuad'});
  anime({targets:m.position,y:[{value:h,duration:dur*.4,easing:'easeOutQuad'},{value:.07,duration:dur*.6,easing:'easeOutBounce'}]});
  anime({targets:m.rotation,x:'+='+(Math.random()*12),z:'+='+(Math.random()*12),duration:dur,easing:'easeOutQuad'});
  if(keep)WR.push(m);else anime({targets:m.scale,x:0,y:0,z:0,delay:dur+300,duration:500,easing:'easeInQuad',complete:()=>S.remove(m)})}}
function motes(x,z,n,col,rise,dur,spin){for(let i=0;i<n;i++){const m=addM(PG,glow(col,.95),x,.1,z),a=Math.random()*6.283,r=.15+Math.random()*.3;m.scale.setScalar(1+Math.random()*1.5);
  anime({targets:m.position,x:[x+Math.cos(a)*r,x+Math.cos(a+spin)*r*.6],z:[z+Math.sin(a)*r,z+Math.sin(a+spin)*r*.6],y:[.1,rise*(.6+Math.random()*.6)],duration:dur*(.7+Math.random()*.5),delay:Math.random()*300,easing:'easeOutQuad'});
  fade(m,500,dur*.6)}}
function ghost(g){g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true}})}
function fadeG(g,dur,delay,rm){const ms=[];g.traverse(o=>{if(o.isMesh)ms.push(o.material)});anime({targets:ms,opacity:0,duration:dur,delay:delay,easing:'linear',complete:rm})}
function tilt(g,ax,az,ang,dur){const q0=g.quaternion.clone(),axis=new THREE.Vector3(az,0,-ax).normalize(),o={a:0};
  anime({targets:o,a:ang,duration:dur,easing:'easeInQuad',update:()=>{g.quaternion.copy(q0).premultiply(new THREE.Quaternion().setFromAxisAngle(axis,o.a))}})}

function hop(g,x,y,t,done,hh){const [wx,wz]=pos(x,y),ox=g.userData.x,oy=g.userData.y,[sx,sz]=pos(ox,oy),d=MV[t].d;
  g.userData.x=x;g.userData.y=y;anime.remove(g.position);anime.remove(g.rotation);
  anime({targets:g.position,x:wx,z:wz,duration:d,easing:t=='r'||t=='k'?'easeInOutQuad':'easeInOutCubic'});
  anime({targets:g.position,y:[{value:hh||MV[t].h,duration:d*.45,easing:'easeOutQuad'},{value:0,duration:d*.55,easing:'easeInQuad'}],
    complete:()=>{ring(wx,wz);clk(.35);if(t=='k')shake(.12);if(t=='r'){shake(.1);puff(wx,wz)}if(t=='q')shock(wx,wz,0xe8c982,2.6,600);done&&done()}});
  if(t=='n'||t=='q')anime({targets:g.rotation,y:'+='+6.2832,duration:d,easing:'easeInOutCubic'});
  if(t=='b'){const l=Math.sign(x-ox)||1;anime({targets:g.rotation,z:[{value:-.28*l,duration:d*.5},{value:0,duration:d*.5}],easing:'easeInOutSine'})}
  if(t=='r')for(let i=1;i<=5;i++)setTimeout(()=>puff(sx+(wx-sx)*i/6,sz+(wz-sz)*i/6),d*i/6);
  if(t=='b'||t=='q')streak(sx,sz,wx,wz,t=='q'?0xe8c982:0xfff2c8,.16,900,.7,.06)}

const KILL={
 /* pawn: one short diagonal jab, victim is shoved back and topples */
 p:({g,x,z,dx,dz,vc,rm})=>{streak(x-dx*.8,z-dz*.8,x+dx*.5,z+dz*.5,0xfff2c8,.1,500,.95,.4);burst(x,z,vc);tilt(g,dx,dz,1.45,420);
   anime({targets:g.position,x:x+dx*1.1,z:z+dz*1.1,duration:600,easing:'easeOutCubic'});
   anime({targets:g.position,y:[{value:.35,duration:200,easing:'easeOutQuad'},{value:0,duration:400,easing:'easeOutBounce'}]});
   fadeG(g,500,550,rm);shake(.12)},
 /* rook: battering ram down a straight line, victim is flattened, stone debris */
 r:({g,x,z,dx,dz,ox,oz,rm})=>{streak(ox,oz,x+dx*5,z+dz*5,0xcbbf9f,.5,800,.5,.05);shock(x,z,0xcbbf9f,5,800);
   anime({targets:g.scale,x:1.5,y:.12,z:1.5,duration:160,easing:'easeOutQuad'});
   debris(x,z,16,GEO.box,STONE,1.7,1.5,950);for(let i=0;i<6;i++)setTimeout(()=>puff(x+(Math.random()-.5)*1.2,z+(Math.random()-.5)*1.2),i*50);
   fadeG(g,300,400,rm);shake(.45)},
 /* knight: stomp from the jump, then the victim is kicked away along an L path */
 n:({g,x,z,ox,oz,rm})=>{const rx=x-ox,rz=z-oz,mj=Math.abs(rx)>Math.abs(rz)?[Math.sign(rx),0]:[0,Math.sign(rz)],mn=mj[0]?[0,Math.sign(rz)]:[Math.sign(rx),0];
   shock(x,z,0xe8c982,3.2,650);burst(x,z,0xe8c982);shake(.3);
   const tm=anime.timeline({easing:'easeOutQuad'});
   tm.add({targets:g.scale,x:1.4,y:.15,z:1.4,duration:140}).add({targets:g.scale,x:1,y:1,z:1,duration:160,easing:'easeOutBack'})
     .add({targets:g.position,x:x+mj[0]*1.8,z:z+mj[1]*1.8,y:2.2,duration:380},'-=60')
     .add({targets:g.position,x:x+mj[0]*1.8+mn[0]*1.1,z:z+mj[1]*1.8+mn[1]*1.1,y:.3,duration:320,easing:'easeInQuad'})
     .add({targets:g.scale,x:0,y:0,z:0,duration:250,easing:'easeInBack',complete:rm});
   anime({targets:g.rotation,y:'+=18',duration:1100,easing:'linear'})},
 /* bishop: holy diagonal beam, victim dissolves into rising light */
 b:({g,x,z,dx,dz,rm})=>{streak(x-dx*6,z-dz*6,x+dx*6,z+dz*6,0xfff2c8,.4,1000,.8,.08);streak(x-dx*6,z-dz*6,x+dx*6,z+dz*6,0xffffff,.1,1000,.95,.09);
   anime({targets:g.position,y:2.6,duration:900,easing:'easeInQuad'});anime({targets:g.rotation,y:'+=9',duration:900,easing:'easeInQuad'});
   fadeG(g,600,300,rm);motes(x,z,34,0xfff2c8,3.2,1000,3.5);halo(x,z,0xfff2c8,2.8);flash('rgba(255,242,200,.4)',.7);shake(.12)},
 /* queen: royal nova in all 8 directions, victim spins up and shatters into shards */
 q:({g,x,z,vm,rm})=>{for(let i=0;i<8;i++){const a=i*Math.PI/4;streak(x,z,x+Math.cos(a)*6,z+Math.sin(a)*6,i%2?0xe8c982:0xfff2c8,.22,900,.85,.08)}
   shock(x,z,0xe8c982,6,900);shock(x,z,0xffffff,3.5,600);
   anime({targets:g.position,y:1.3,duration:300,easing:'easeOutQuad'});anime({targets:g.rotation,y:'+=20',duration:420,easing:'easeInQuad'});anime({targets:g.scale,x:1.3,y:1.3,z:1.3,duration:380,easing:'easeInQuad'});
   setTimeout(()=>{rm();debris(x,z,18,CFG.theme=='mc'?GEO.box:GEO.oct,CFG.theme=='mc'?MCM[vm][0]:SHARD[vm],2.4,2.6,1100);debris(x,z,14,GEO.oct,GOLD,2.6,2.8,1100);motes(x,z,20,0xe8c982,2.5,900,2);halo(x,z,0xe8c982,2.4);flash('rgba(232,201,130,.5)',.9);shake(.4)},380)},
 /* king: a pillar of judgement, the 8 squares around glow in turn, victim turns to coins */
 k:({g,x,z,rm})=>{for(let i=0;i<8;i++){const a=i*Math.PI/4,m=addM(new THREE.PlaneGeometry(.9,.9),glow(0xe8c982,0),x+Math.round(Math.cos(a)),.06,z+Math.round(Math.sin(a)));m.rotation.x=-Math.PI/2;
     anime({targets:m.material,opacity:[{value:.7,duration:160},{value:0,duration:500}],delay:i*70,complete:()=>S.remove(m)})}
   pillar(x,z,0xfff2c8,.42,7,900);anime({targets:g.scale,x:1.5,y:.05,z:1.5,duration:200,delay:300,easing:'easeInQuad'});
   setTimeout(()=>{rm();debris(x,z,18,GEO.coin,GOLD,1.9,1.7,1000);shock(x,z,0xe8c982,4,800);flash('rgba(232,201,130,.55)',.9);shake(.3)},480)}
};
function kill(g,t,a,fx,fy,tx,ty){snd(.14);vib(24);anime.remove(g.position);anime.remove(g.rotation);const i=pcs.indexOf(g);if(i>=0)pcs.splice(i,1);
  if(!CFG.kfx){S.remove(g);return}
  ghost(g);
  const [x,z]=pos(tx,ty),[ox,oz]=pos(fx,fy);let dx=x-ox,dz=z-oz;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  KILL[a]({g,x,z,dx,dz,ox,oz,vc:t.c=='w'?0xf3e7cc:0x6b4630,vm:t.c,rm:()=>S.remove(g)});if(CFG.theme=='mc')mcBreak(x,z,t.c)}
/* minecraft: the victim breaks into its own blocks, then the white mob-death poof */
const POOF=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false});
function mcBreak(x,z,c){debris(x,z,14,GEO.box,MCM[c][0],1.3,1.6,850);
  setTimeout(()=>{for(let i=0;i<12;i++){const m=addM(GEO.box,POOF.clone(),x+(Math.random()-.5)*.7,.2+Math.random()*.5,z+(Math.random()-.5)*.7);m.scale.setScalar(1.2+Math.random()*1.6);
    anime({targets:m.position,y:'+='+(.6+Math.random()*.9),duration:900,easing:'easeOutQuad'});anime({targets:m.scale,x:.2,y:.2,z:.2,duration:900,easing:'easeInQuad'});fade(m,900)}},260)}
/* ---------- the big boom (a queen is captured) ---------- */
const BLOB=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const PP=[];let pi=0,PPN=360;for(let i=0;i<360;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:BLOB,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.visible=false;S.add(sp);PP.push({sp,on:0,age:0,life:1,vx:0,vy:0,vz:0,s0:1,s1:0,k:0})}
const FE=[],BK={id:0},EM={v:0},BURN={v:0},_v=new THREE.Vector3(),CHAR=new THREE.MeshStandardMaterial({color:0x1a120c,roughness:.9});
let WR=[],wreck=false,wrp=0,burnBlobs=[],glT=null,bf=0,AC=null;
const rot2=()=>Math.round(Math.random()*4-2)*6.2832,GL_IDS=['sw','tw','mv','sb','tb'],GL_TXT=['sys//fail','█▓▒░ ERR','0xDEAD','reboot…','boom','no signal'];
function at(ms,f){const id=BK.id;setTimeout(()=>{if(id===BK.id&&wreck)f()},ms)}
function clk(v){if(!CFG.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();const t=AC.currentTime,n=AC.createBuffer(1,AC.sampleRate*.07,AC.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  const sr=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();sr.buffer=n;f.type='bandpass';f.frequency.value=1500;g.gain.value=v;sr.connect(f);f.connect(g);g.connect(AC.destination);sr.start(t)}catch(e){}}
function faceSide(c){const t=c=='b'?Math.PI:0,k=t+Math.round((cs.th-t)/(2*Math.PI))*2*Math.PI;anime({targets:cs,th:k,duration:900,easing:'easeInOutCubic',update:setCam})}
function snd(v){if(!CFG.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type='sine';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(30,t+.5);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.65);
  const n=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
  const sr=AC.createBufferSource(),f=AC.createBiquadFilter(),g2=AC.createGain();sr.buffer=n;f.type='lowpass';f.frequency.value=900;g2.gain.value=v*.8;sr.connect(f);f.connect(g2);g2.connect(AC.destination);sr.start(t)}catch(e){}}
function emit(x,y,z,k,s){const p=PP[pi=(pi+1)%PPN],sp=p.sp;p.on=1;p.age=0;p.k=k;sp.visible=true;sp.position.set(x,y,z);s=s||1;
  if(k==1){p.life=1.6+Math.random();p.vx=(Math.random()-.5)*.3;p.vy=.5+Math.random()*.4;p.vz=(Math.random()-.5)*.3;p.s0=.3*s;p.s1=1.3*s;sp.material.blending=THREE.NormalBlending}
  else if(k==2){p.life=.5+Math.random()*.5;const a=Math.random()*6.283,b=Math.random()*3.14-1.5,v=1.5+Math.random()*3;p.vx=Math.cos(a)*v;p.vz=Math.sin(a)*v;p.vy=Math.sin(b)*v+1;p.s0=s*(.6+Math.random()*.6);p.s1=0;sp.material.blending=THREE.AdditiveBlending}
  else{p.life=.6+Math.random()*.5;p.vx=(Math.random()-.5)*.3;p.vy=.9+Math.random()*.9;p.vz=(Math.random()-.5)*.3;p.s0=(.3+Math.random()*.2)*s;p.s1=0;sp.material.blending=THREE.AdditiveBlending}}
function fxStep(dt){for(const e of FE){e.acc=(e.acc||0)+dt*e.rate;while(e.acc>=1){e.acc--;if(e.obj){_v.set(e.lx,e.ly,e.lz);e.obj.localToWorld(_v)}else _v.set(e.x,e.y,e.z);
    emit(_v.x+(Math.random()-.5)*.25,_v.y,_v.z+(Math.random()-.5)*.25,0,e.s||1);if(Math.random()<.22)emit(_v.x,_v.y+.5,_v.z,1,1)}}
  for(const p of PP){if(!p.on)continue;p.age+=dt;const u=p.age/p.life;if(u>=1){p.on=0;p.sp.visible=false;continue}
    const sp=p.sp;sp.position.x+=p.vx*dt;sp.position.y+=p.vy*dt;sp.position.z+=p.vz*dt;let sc,o;
    if(p.k==1){sc=p.s0+(p.s1-p.s0)*u;o=.38*(1-u);sp.material.color.setRGB(.18,.17,.16)}
    else{sc=p.k==2?p.s0*(1+u*1.3):p.s0*(1-u*.7);o=1-u;sp.material.color.setRGB(1,Math.max(.12,.9-u*.9),Math.max(.04,.35-u*.5))}
    sp.scale.set(sc,sc,1);sp.material.opacity=o}
  if(FE.length)FL.intensity=2.2+Math.random()*1.4}
function scorch(t,k){const m=t.material;anime.remove(m.color);anime({targets:m.color,r:k,g:k*.9,b:k*.8,duration:700,easing:'easeOutQuad'});
  m.emissive.setHex(0xff3a00);m.emissiveIntensity=1;anime.remove(m);anime({targets:m,emissiveIntensity:.08,duration:1800,easing:'easeOutQuad'})}
function fireball(x,y,z,s){for(let i=0;i<10;i++)emit(x,y,z,2,s);for(let i=0;i<4;i++)emit(x,y+.3,z,1,s)}
function boomAt(x,y,z,s){const m=Math.min(s,3);fireball(x,y,z,s);shock(x,z,0xff9a3c,2+s*2.4,700);snd(.25*Math.min(s,2));
  BL.position.set(x,1.3,z);anime.remove(BL);anime({targets:BL,intensity:[{value:5*m,duration:60},{value:0,duration:380}]});shake(.12+.1*m);
  const gx=Math.round(x+3.5),gy=Math.round(3.5-z);if(inb(gx,gy)){const t=T[gy][gx];anime.remove(t.position);anime({targets:t.position,y:[{value:-.1+.45*Math.min(s,2),duration:130,easing:'easeOutQuad'},{value:-.1,duration:500,easing:'easeOutBounce'}]});scorch(t,.3)}
  debris(x,z,5,GEO.box,CHAR,1.6,1.8,900,Math.random()<.5)}
function explodePiece(g){const x=g.position.x,z=g.position.z;boomAt(x,.5,z,1.1);
  g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();const m=o.material;m.emissive.setHex(0xff3a00);m.emissiveIntensity=1;
    anime({targets:m.color,r:.14,g:.1,b:.08,duration:900,easing:'easeOutQuad'});anime({targets:m,emissiveIntensity:.15,duration:1600,easing:'easeOutQuad'})}});
  const a=Math.random()*6.283,d=1.5+Math.random()*4.5,tx=x+Math.cos(a)*d,tz=z+Math.sin(a)*d,h=2.5+Math.random()*3.5,inB=Math.abs(tx)<4.6&&Math.abs(tz)<4.6,lie=Math.random()<.6,gy=(inB?-.1:-.55)+(lie?.32:0),sg=Math.random()<.5?1:-1;
  g.rotation.order='YXZ';anime.remove(g.position);anime.remove(g.rotation);anime.remove(g.scale);g.scale.set(1,1,1);
  anime({targets:g.position,x:tx,z:tz,duration:1500,easing:'easeOutQuad'});
  anime({targets:g.position,y:[{value:h,duration:620,easing:'easeOutQuad'},{value:gy,duration:880,easing:'easeOutBounce'}]});
  anime({targets:g.rotation,x:(lie?sg*1.57:(Math.random()-.5)*.3)+rot2(),y:Math.random()*6.28+rot2(),z:(lie?0:(Math.random()-.5)*.3)+rot2(),duration:1500,easing:'easeOutQuad'});
  if(Math.random()<.45)at(1500,()=>FE.push({x:tx,y:gy+.45,z:tz,rate:13,s:1}))}
function drawBurn(c){burnBlobs.forEach(b=>{const r=b.r*Math.max(0,BURN.v*1.4-b.d);if(r<4)return;const g=c.createRadialGradient(b.x,b.y,0,b.x,b.y,r);
  g.addColorStop(0,'#0b0603');g.addColorStop(.72,'#1d0f07');g.addColorStop(.88,'#ff6a10');g.addColorStop(.95,'rgba(255,170,40,.6)');g.addColorStop(1,'rgba(255,120,20,0)');c.fillStyle=g;c.beginPath();c.arc(b.x,b.y,r,0,6.283);c.fill()})}
function sheetFire(){burnBlobs=[];for(let i=0;i<16;i++)burnBlobs.push({x:Math.random()*1024,y:Math.random()*1408,r:110+Math.random()*230,d:Math.random()*.55});
  [[0,0],[1024,0],[0,1408],[1024,1408]].forEach(q=>burnBlobs.push({x:q[0],y:q[1],r:420,d:0}));
  BURN.v=0;anime.remove(BURN);anime({targets:BURN,v:1,duration:7000,easing:'easeInQuad',update:()=>{if(bf++%6==0)drawSheet()},complete:drawSheet});
  clipb.material.color.setHex(0x1b120c);anime({targets:sheet.rotation,z:[{value:.03,duration:90},{value:0,duration:700,easing:'easeOutElastic(1,.5)'}]});
  for(let i=0;i<9;i++)at(Math.random()*3500,()=>FE.push({obj:sheet,lx:(Math.random()-.5)*2.9,ly:.2,lz:(Math.random()-.5)*4.2,rate:9,s:.9}));
  FE.push({obj:sheet,lx:0,ly:.2,lz:0,rate:12,s:1.1})}
function glitchStart(){const h=$('#hud');h.classList.add('glitch');clearInterval(glT);glT=setInterval(()=>{
  GL_IDS.forEach(id=>[...$('#'+id).children].forEach(sp=>{if(sp.className!='c'&&Math.random()<.6)sp.textContent='0123456789#@%&?▓░'[Math.random()*17|0]}));
  if(Math.random()<.5)$('#st').textContent=GL_TXT[Math.random()*GL_TXT.length|0];
  if(Math.random()<.2)['nw','nb'].forEach(id=>{$('#'+id).textContent=['W̶h̶i̶t̶e','B1ack','█████','Wh!te','ERR'][Math.random()*5|0]});
  h.style.opacity=Math.random()<.07?.3:1},110)}
function glitchStop(){clearInterval(glT);glT=null;const h=$('#hud');h.classList.remove('glitch');h.style.opacity=1;GL_IDS.forEach(id=>{delete $('#'+id).dataset.v})}
function finale(){vib([80,40,140,40,220]);flash('rgba(255,210,140,.95)',1);shake(1.2);snd(.7);BL.position.set(0,2,0);anime.remove(BL);anime({targets:BL,intensity:[{value:16,duration:80},{value:0,duration:1000}]});
  for(let i=0;i<3;i++)fireball((Math.random()-.5)*3,.6,(Math.random()-.5)*3,4);shock(0,0,0xffe0a0,13,1000);shock(0,0,0xff6a1a,9,1400);
  tl.forEach(t=>{const x0=t.position.x,z0=t.position.z;
    if(Math.random()<.42){anime.remove(t.position);anime({targets:t.position,y:[{value:.4+Math.random()*.4,duration:260,easing:'easeOutQuad'},{value:-.1-Math.random()*.06,duration:700,easing:'easeOutBounce'}]});
      anime({targets:t.rotation,x:(Math.random()-.5)*.4,z:(Math.random()-.5)*.4,duration:900,easing:'easeOutElastic(1,.6)'});scorch(t,.2);if(Math.random()<.3)at(900,()=>FE.push({x:x0,y:.1,z:z0,rate:10,s:.9}))}
    else{const a=Math.atan2(z0,x0)+(Math.random()-.5)*.9,d=3+Math.random()*6,tx=x0+Math.cos(a)*d,tz=z0+Math.sin(a)*d,h=3+Math.random()*5,inB=Math.abs(tx)<4.6&&Math.abs(tz)<4.6;
      t.rotation.order='YXZ';anime.remove(t.position);anime.remove(t.rotation);
      anime({targets:t.position,x:tx,z:tz,duration:1700,easing:'easeOutCubic'});
      anime({targets:t.position,y:[{value:h,duration:700,easing:'easeOutQuad'},{value:(inB?-.1:-.55)+.1,duration:1000,easing:'easeOutBounce'}]});
      anime({targets:t.rotation,x:Math.round(Math.random()*2)*3.1416+(Math.random()-.5)*.2+rot2(),y:Math.random()*6.28+rot2(),z:(Math.random()-.5)*.3+rot2(),duration:1700,easing:'easeOutQuad'});scorch(t,.28)}});
  base.material.color.setHex(0x3a2a22);anime({targets:base.rotation,x:.02,z:-.018,duration:1200,easing:'easeOutElastic(1,.5)'});
  edge.material.emissive.setHex(0xff3300);edge.material.color.setHex(0x5a3a20);
  FE.push({x:0,y:0,z:0,rate:14,s:1.4},{x:-2.5,y:0,z:2,rate:10,s:1.2},{x:2.2,y:0,z:-1.5,rate:10,s:1.2},{x:-1,y:0,z:-3,rate:9,s:1.1});
  anime({targets:cs,ph:.82,rad:cs.rad*1.15,duration:2600,easing:'easeInOutCubic',update:setCam});sheetFire()}
function blast(cx,cz){wreck=true;wrp=prCur;setPR(Math.max(.75,prCur-.3));const ps=pcs.slice().sort((a,b)=>Math.hypot(a.position.x-cx,a.position.z-cz)-Math.hypot(b.position.x-cx,b.position.z-cz));
  const mats=[...PM.w,...PM.b,...MCM.w,...MCM.b];mats.forEach(m=>m.emissive.setHex(0xff2a00));anime.remove(EM);
  anime({targets:EM,v:[.1,1],duration:260,direction:'alternate',loop:true,easing:'easeInOutSine',update:()=>mats.forEach(m=>{m.emissiveIntensity=EM.v*.8})});
  bars.forEach(b=>{b.material.emissive.setHex(0xff2200);anime.remove(b.material);anime({targets:b.material,emissiveIntensity:[.2,2],duration:180,direction:'alternate',loop:true})});
  FL.position.set(0,2.6,0);glitchStart();anime({targets:sh,v:[0,.14],duration:1600,easing:'easeInQuad',update:setCam});
  const T0=500,span=2800;
  ps.forEach((g,i)=>at(T0+i*span/ps.length+Math.random()*60,()=>explodePiece(g)));
  for(let i=0;i<12;i++)at(T0+Math.random()*span,()=>boomAt((Math.random()-.5)*8,.4,(Math.random()-.5)*8,.8));
  at(T0+span+500,finale)}
function resetWreck(){wreck=false;if(wrp){setPR(Math.min(prCap,wrp));wrp=0}BK.id++;FE.length=0;PP.forEach(q=>{q.on=0;q.sp.visible=false});WR.forEach(m=>S.remove(m));WR=[];
  anime.remove(BL);BL.intensity=0;FL.intensity=0;anime.remove(EM);[...PM.w,...PM.b,...MCM.w,...MCM.b].forEach(m=>{m.emissive.setHex(0);m.emissiveIntensity=0});
  tl.forEach(t=>{anime.remove(t.position);anime.remove(t.rotation);anime.remove(t.material.color);anime.remove(t.material);t.rotation.order='XYZ';t.rotation.set(0,0,0);t.scale.set(1,1,1);t.position.set(t.userData.sq[0]-3.5,-.1,3.5-t.userData.sq[1]);t.material.color.setHex(0xffffff);t.material.emissive.setHex(0);t.material.emissiveIntensity=1});
  anime.remove(base.rotation);base.rotation.set(0,0,0);base.material.color.setHex(0xffffff);edgeReset();
  bars.forEach(b=>{anime.remove(b.material);b.material.emissive.setHex(0xe8c982);b.material.emissiveIntensity=.1});bk='';
  clipb.material.color.setHex(0x3a2a22);anime.remove(BURN);BURN.v=0;burnBlobs=[];glitchStop();anime.remove(sh);sh.v=0}

function posKey(){let s='';for(let y=0;y<8;y++)for(let x=0;x<8;x++){const q=B[y][x];s+=q?(q.c=='w'?q.t.toUpperCase():q.t)+(q.t=='k'||q.t=='r'?q.m:''):'.'}return s+turn+(EP?EP.join(''):'')}
function promoClose(){promoAsk=null;const e=$('#promo');if(e)e.style.display='none'}
function promoOpen(c,cb){const e=$('#promo');promoAsk=cb;e.innerHTML='<div class="pc"><p>Promote to</p><div class="pr"></div></div>';const r=e.querySelector('.pr');
  [['q','Queen'],['r','Rook'],['b','Bishop'],['n','Knight']].forEach(([t,nm])=>{const b=document.createElement('button');b.innerHTML='<span>'+SYM[c][t]+'︎</span><small>'+nm+'</small>';
    b.onclick=ev=>{ev.stopPropagation();const f=promoAsk;promoClose();if(f)f(t)};r.appendChild(b)});
  e.onclick=()=>{promoClose();lift(selG,0);selG=null;sel=null;legalM=[];clr();paint()};e.style.display='grid';mo(e.firstChild,{opacity:[0,1],scale:[.85,1]},{duration:.25})}
function click(x,y){if(busy||over||demo||paused||promoAsk||turn==aiC())return;const p=B[y][x];
  if(sel){const m=legalM.find(m=>m[0]==x&&m[1]==y);if(m){const [sx,sy]=sel,sp=B[sy][sx];if(sp.t=='p'&&(y==0||y==7))return promoOpen(sp.c,t=>move(sx,sy,m,t));return move(sx,sy,m)}}
  if(p&&p.c==turn){lift(selG,0);sel=[x,y];selG=P[y][x];lift(selG,.28);legalM=legal(B,x,y);showHL()}else{lift(selG,0);selG=null;sel=null;legalM=[];clr()}
  paint()}
function san(fx,fy,tx,ty,fl,p,tg,pr){if(fl=='c')return tx==6?'O-O':'O-O-O';const cap=tg||fl=='e';
  if(p.t=='p')return (cap?'abcdefgh'[fx]+'x':'')+sqn(tx,ty)+((ty==0||ty==7)?'='+FN(pr):'');
  let d='';if(p.t!='k'){const o=[];for(let j=0;j<8;j++)for(let i=0;i<8;i++){const q=B[j][i];if(q&&q!==p&&q.t==p.t&&q.c==p.c&&legal(B,i,j).some(m=>m[0]==tx&&m[1]==ty))o.push([i,j])}
    if(o.length)d=!o.some(q=>q[0]==fx)?'abcdefgh'[fx]:!o.some(q=>q[1]==fy)?String(fy+1):sqn(fx,fy)}
  return FN(p.t)+d+(cap?'x':'')+sqn(tx,ty)}
function promote(g,p,tx,ty,pr){p.t=pr;const i=pcs.indexOf(g);if(i>=0)pcs.splice(i,1);anime.remove(g.scale);anime({targets:g.scale,x:0,y:0,z:0,duration:220,easing:'easeInBack',complete:()=>S.remove(g)});
  const q=mk(pr,p.c),[wx,wz]=pos(tx,ty);q.position.set(wx,0,wz);q.userData={pc:1,x:tx,y:ty};q.scale.set(.01,.01,.01);S.add(q);pcs.push(q);P[ty][tx]=q;
  anime({targets:q.scale,x:1,y:1,z:1,duration:800,delay:120,easing:'easeOutElastic(1,.5)'});anime({targets:q.rotation,y:'+='+6.2832,duration:900,easing:'easeOutCubic'});
  pillar(wx,wz,0xfff2c8,.4,5,700);burst(wx,wz,0xe8c982);shock(wx,wz,0xe8c982,3,600);snd(.08)}
function move(fx,fy,m,pr){const [tx,ty,fl]=m,gid=G;busy=true;promoClose();sel=null;selG=null;legalM=[];clr();pr=pr||'q';
  const p=B[fy][fx],g=P[fy][fx],cy=fl=='e'?fy:ty,tg=B[cy][tx],tgG=P[cy][tx],pc=p.t,prom=pc=='p'&&(ty==0||ty==7);
  const note=san(fx,fy,tx,ty,fl,p,tg,pr);ML.push([fx,fy,tx,ty,prom?pr:'']);
  B[cy][tx]=null;P[cy][tx]=null;B[fy][fx]=null;P[fy][fx]=null;B[ty][tx]=p;P[ty][tx]=g;p.m=1;
  EP=pc=='p'&&Math.abs(ty-fy)==2?[fx,(fy+ty)/2]:null;HM=(pc=='p'||tg)?0:HM+1;
  if(fl=='c'){const rx=tx==6?7:0,nx=tx==6?5:3;B[ty][nx]=B[ty][rx];P[ty][nx]=P[ty][rx];B[ty][rx]=null;P[ty][rx]=null;B[ty][nx].m=1;const rg=P[ty][nx];setTimeout(()=>{if(gid===G)hop(rg,nx,ty,'r',null,.95)},140)}
  if(tgG){caps[p.c].push(tg.t);score[p.c]+=V[tg.t];setTimeout(()=>{if(gid===G)kill(tgG,tg,pc,fx,fy,tx,cy)},Math.round(MV[pc].d*(pc=='k'?.55:.88)))}
  hop(g,tx,ty,pc,()=>{if(gid!==G)return;
    if(prom)promote(g,p,tx,ty,pr);
    moves++;started=true;last=[[fx,fy],[tx,ty]];turn=opp(turn);
    const key=posKey();RP[key]=(RP[key]||0)+1;
    chk=inChk(B,turn)?kingPos(B,turn):null;busy=false;
    const nm=!anyMove(B,turn);
    write(note+(chk?(nm?'#':'+'):''));wave(tx,ty);chkFx();
    if(nm){if(chk){const k=P[chk[1]][chk[0]];anime({targets:k.rotation,z:1.5,duration:900,easing:'easeInQuad'});anime({targets:cs,rad:cs.rad*.82,ph:.8,duration:1800,easing:'easeInOutCubic',update:setCam});finish(opp(turn),'Checkmate, the king has fallen',CFG.blast?pos(chk[0],chk[1]):0)}else finish(null,'Stalemate')}
    else if(RP[key]>=3)finish(null,'Draw by threefold repetition');
    else if(HM>=100)finish(null,'Draw by the 50-move rule');
    else if(noMate(B))finish(null,'Draw, nobody can checkmate');
    else if(chk){toast('Check!');vib(50)}
    paint();ui();status();
    if(!over){mo($('#p'+turn),{scale:[1.05,1]},{duration:.4});aiTurn();if(mode=='2p'&&CFG.flip)faceSide(turn)}})}
function winTxt(w){if(!w)return 'A draw, honours even';if(mode=='ai')return w==human?'You win!':BOTS[lvl].n+' wins';return (w=='w'?'White':'Black')+' takes the game'}
function finish(w,why,bl){if(over)return;over=true;busy=true;promoClose();if(w)wins[w]++;resTxt=w?(w=='w'?'1 - 0':'0 - 1'):'1/2 - 1/2';ui();status();drawSheet();const gid=G;
  if(mode=='ai'&&w)setTimeout(()=>{if(gid===G)say(w==aiC()?'Good game. Come back when you are ready.':'Well played. I will remember that.',lvl)},bl?9800:2300);
  if(w&&!bl&&(mode!='ai'||w==human)){confetti();flash('rgba(232,201,130,.5)',.9);shake(.25)}
  if(bl)setTimeout(()=>{if(gid===G)blast(bl[0],bl[1])},900);
  setTimeout(()=>{if(gid!==G)return;$('#ov').className=bl?'low':'';$('#ot').textContent=winTxt(w);$('#os').textContent=why;$('.seal').textContent=w?(w=='w'?'♔':'♚'):'½';
    $('#obb').style.display=mode=='ai'?'':'none';
    const o=$('#ov');o.style.display='grid';mo(o.firstElementChild,{opacity:[0,1],scale:[.7,1]},{type:'spring',stiffness:260,damping:18})},bl?8200:1100)}

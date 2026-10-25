/* ---------- effects ---------- */
function lift(g,h){if(!g)return;anime.remove(g.position);anime({targets:g.position,y:h,duration:550,easing:'easeOutElastic(1,.6)'})}
function wave(x,y){tl.forEach(t=>{const [sx,sy]=t.userData.sq,d=Math.hypot(sx-x,sy-y);if(d>3.4)return;anime.remove(t.position);
  anime({targets:t.position,y:[{value:-.1+.22/(1+d*.4),duration:200,easing:'easeOutQuad'},{value:-.1,duration:500,easing:'easeOutBounce'}],delay:d*60})})}
function tilesIn(){tl.forEach(t=>{const [x,y]=t.userData.sq;anime.remove(t.position);t.position.y=-4;anime({targets:t.position,y:-.1,duration:900,delay:(x+y)*45,easing:'easeOutBack'})})}
function shake(a){anime.remove(sh);sh.v=a;anime({targets:sh,v:0,duration:500,easing:'easeOutQuad',update:setCam})}
function flash(col,a){const e=$('#fx');e.style.background='radial-gradient(circle at center,transparent 38%,'+col+' 100%)';anime.remove(e);anime({targets:e,opacity:[a,0],duration:750,easing:'easeOutQuad'})}
function chkFx(){anime.remove(CL);if(!chk){CL.intensity=0;return}const [wx,wz]=pos(chk[0],chk[1]);CL.position.set(wx,1.2,wz);
  anime({targets:CL,intensity:[0,3.5],duration:380,direction:'alternate',loop:true,easing:'easeInOutSine'})}
function confetti(){const cols=[0xe8c982,0xefe6d0,0xd9505f,0x3fae8f,0xffb866];for(let i=0;i<90;i++){
  const m=new THREE.Mesh(new THREE.BoxGeometry(.12,.02,.07),new THREE.MeshBasicMaterial({color:cols[i%5]}));
  m.position.set((Math.random()-.5)*7,7+Math.random()*3,(Math.random()-.5)*7);m.rotation.set(Math.random()*6,Math.random()*6,0);S.add(m);
  anime({targets:m.position,y:0,x:m.position.x+(Math.random()-.5)*3,duration:2200+Math.random()*1500,delay:Math.random()*600,easing:'easeOutQuad'});
  anime({targets:m.rotation,x:'+='+(Math.random()*20),z:'+='+(Math.random()*20),duration:4400,easing:'linear',complete:()=>S.remove(m)})}}

/* ---------- visuals ---------- */
const PG=new THREE.SphereGeometry(.06,8,8);
function ring(x,z){const m=new THREE.MeshBasicMaterial({color:0xe8c982,transparent:true,opacity:.8,side:THREE.DoubleSide});
  const r=new THREE.Mesh(new THREE.RingGeometry(.2,.26,40),m);r.rotation.x=-Math.PI/2;r.position.set(x,.05,z);S.add(r);
  anime({targets:r.scale,x:4,y:4,duration:700,easing:'easeOutQuad'});anime({targets:m,opacity:0,duration:700,easing:'linear',complete:()=>S.remove(r)})}
function burst(x,z,col){for(let i=0;i<16;i++){const s=new THREE.Mesh(PG,new THREE.MeshBasicMaterial({color:i%2?col:0xe8c982}));s.position.set(x,.5,z);S.add(s);
  const a=Math.random()*6.28,d=.6+Math.random()*1.3;
  anime({targets:s.position,x:x+Math.cos(a)*d,z:z+Math.sin(a)*d,y:[.5,.4+Math.random()*1.6],duration:800,easing:'easeOutCubic'});
  anime({targets:s.scale,x:0,y:0,z:0,duration:900,easing:'easeInQuad',complete:()=>S.remove(s)})}}
function paint(){for(let y=0;y<8;y++)for(let x=0;x<8;x++){let e=0;
  if(last.some(l=>l[0]==x&&l[1]==y))e=0x5a3d12;
  if(chk&&chk[0]==x&&chk[1]==y)e=0xa02020;
  if(sel&&sel[0]==x&&sel[1]==y)e=0xb8892b;
  T[y][x].material.emissive.setHex(e)}}
function clr(){while(hl.children.length)hl.remove(hl.children[0])}
const HLG={dot:new THREE.CylinderGeometry(.16,.16,.04,24),ring:new THREE.TorusGeometry(.38,.05,8,32),sq:new THREE.BoxGeometry(.3,.05,.3),frame:new THREE.TorusGeometry(.42,.06,2,4)};
function showHL(){clr();if(!CFG.hints)return;const mc=CFG.theme=='mc';legalM.forEach(m=>{const cp=B[m[1]][m[0]]||m[2]=='e';
  const h=new THREE.Mesh(mc?(cp?HLG.frame:HLG.sq):(cp?HLG.ring:HLG.dot),new THREE.MeshBasicMaterial({color:cp?(mc?0xff4040:0xd9505f):(mc?0xffff55:0xe8c982),transparent:true,opacity:.9}));
  const [wx,wz]=pos(m[0],m[1]);h.position.set(wx,.05,wz);if(cp){h.rotation.x=Math.PI/2;if(mc)h.rotation.z=Math.PI/4}hl.add(h);
  anime({targets:h.scale,x:[0,1],y:[0,1],z:[0,1],duration:450,easing:'easeOutElastic(1,.6)'})})}


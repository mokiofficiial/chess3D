/* ---------- three.js scene ---------- */
const MOB=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&Math.min(innerWidth,innerHeight)<820);
const cv=$('#c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:!(MOB&&devicePixelRatio>=2),powerPreference:'high-performance'});
R.setPixelRatio(1);R.shadowMap.enabled=true;R.shadowMap.autoUpdate=false;R.shadowMap.needsUpdate=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;
const S=new THREE.Scene();S.background=new THREE.Color(0x0d0907);S.fog=new THREE.Fog(0x0d0907,22,50);
const cam=new THREE.PerspectiveCamera(45,1,.1,100);
const hemi=new THREE.HemisphereLight(0xffe8c8,0x1a0f0a,.55);S.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,.8);sun.position.set(5,12,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:34});S.add(sun);
const L1=new THREE.PointLight(0xffbf73,1.2,22),L2=new THREE.PointLight(0xff8a5c,.8,22);S.add(L1,L2);
function woodTex(base,seed){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
  let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let i=0;i<46;i++){const y=rnd()*256;g.strokeStyle='rgba(30,15,5,'+(.04+rnd()*.12)+')';g.lineWidth=.6+rnd()*2.2;g.beginPath();g.moveTo(0,y);for(let x=0;x<=256;x+=16)g.lineTo(x,y+Math.sin(x*.03+i)*4*rnd()+(rnd()-.5)*2);g.stroke()}
  for(let i=0;i<900;i++){g.fillStyle='rgba(255,240,210,'+rnd()*.05+')';g.fillRect(rnd()*256,rnd()*256,1.5,1.5)}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
function feltTex(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#14402f';g.fillRect(0,0,256,256);
  for(let i=0;i<7000;i++){g.fillStyle=Math.random()<.5?'rgba(0,0,0,.09)':'rgba(120,200,160,.06)';g.fillRect(Math.random()*256,Math.random()*256,1.5,1.5)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,12);t.encoding=THREE.sRGBEncoding;return t}
const TW=[[woodTex('#58381f',3),woodTex('#4e3019',11)],[woodTex('#dcc08f',5),woodTex('#d2b27c',13)]];
function pieceWood(base,seed,ln,hi,k){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
  let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let i=0;i<64;i++){const x=rnd()*256,ph=rnd()*6,amp=1+rnd()*4;g.strokeStyle='rgba('+ln+','+(.06+rnd()*.18)+')';g.lineWidth=.6+rnd()*2.4;
    for(const o of[-256,0,256]){g.beginPath();for(let y=0;y<=256;y+=8){const xx=x+o+Math.sin(y*.04+ph)*amp;y?g.lineTo(xx,y):g.moveTo(xx,y)}g.stroke()}}
  for(let i=0;i<34;i++){g.fillStyle='rgba('+hi+','+(k*(.03+rnd()*.05))+')';g.fillRect(rnd()*256,0,1+rnd()*3,256)}
  for(let i=0;i<500;i++){g.fillStyle='rgba(0,0,0,'+rnd()*.06+')';g.fillRect(rnd()*256,rnd()*256,1,2)}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
const pmat=t=>new THREE.MeshStandardMaterial({map:t,roughness:.4,metalness:.05,side:THREE.DoubleSide});
const PM={w:[pmat(pieceWood('#ead5a4',21,'120,80,30','255,245,215',1)),pmat(pieceWood('#dfc58f',37,'110,70,25','255,240,205',1))],
  b:[pmat(pieceWood('#3b251b',53,'8,3,1','175,115,75',1.7)),pmat(pieceWood('#33201a',71,'8,3,1','160,100,65',1.7))]};
const FELT=feltTex(),BASEW=woodTex('#2b1a11',7);
function pixTex(cols,seed,rep){const w=16,c=document.createElement('canvas');c.width=c.height=w;const g=c.getContext('2d');let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){g.fillStyle=cols[Math.floor(rnd()*cols.length)];g.fillRect(x,y,1,1)}
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.encoding=THREE.sRGBEncoding;
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep)}return t}
const PAL={grass:['#5a9e33','#4f8f2b','#62a83a','#4a8528','#6bb544','#559a30'],dirt:['#8b5a2b','#7a4e24','#946236','#6e4520','#a06d3f','#6b4423'],plank:['#a77c46','#9c7240','#b08850','#8e6638'],
  quartz:['#f2eee6','#e8e4da','#fffdf8','#ddd8cc','#f6f2ea'],obs:['#2b2433','#1f1a26','#3a3044','#18141f','#2a2030'],gold:['#f6d84a','#e8c32e','#fbe97a','#d9b020']};
const MCT=[[pixTex(PAL.dirt,3),pixTex(PAL.dirt,9)],[pixTex(PAL.grass,5),pixTex(PAL.grass,13)]],GRASSF=pixTex(PAL.grass,21,68),PLANKS=pixTex(PAL.plank,7);
const mcmat=t=>new THREE.MeshStandardMaterial({map:t,roughness:1,metalness:0});
const MCM={w:[mcmat(pixTex(PAL.quartz,31)),mcmat(pixTex(PAL.quartz,47))],b:[mcmat(pixTex(PAL.obs,53)),mcmat(pixTex(PAL.obs,71))]},MCG=mcmat(pixTex(PAL.gold,5));
const cloudG=new THREE.Group(),cm=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92,fog:false});
for(let i=0;i<14;i++){const a=i/14*6.283+Math.random(),r=17+Math.random()*10,m=new THREE.Mesh(new THREE.BoxGeometry(3+Math.random()*4,.9,2+Math.random()*3),cm);m.position.set(Math.cos(a)*r,11+Math.random()*4,Math.sin(a)*r);cloudG.add(m)}
const sunB=new THREE.Mesh(new THREE.BoxGeometry(4,4,.5),new THREE.MeshBasicMaterial({color:0xfff2a0,fog:false}));sunB.position.set(-22,19,-28);sunB.lookAt(0,0,0);
cloudG.visible=sunB.visible=false;S.add(cloudG,sunB);
function mkMC(t,c){const g=new THREE.Group(),m=MCM[c][Math.random()*2|0];
  const bx=(w,h,d,x,y,z,mat)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||m);me.position.set(x,y+h/2,z);me.castShadow=true;g.add(me);return me};
  const K4=[[-1,-1],[1,-1],[-1,1],[1,1]];bx(.74,.14,.74,0,0,0);
  if(t=='p'){bx(.34,.34,.34,0,.14,0);bx(.42,.38,.42,0,.48,0)}
  if(t=='r'){bx(.5,.56,.5,0,.14,0);bx(.66,.14,.66,0,.7,0);K4.forEach(([a,b])=>bx(.16,.16,.16,a*.25,.84,b*.25))}
  if(t=='n'){bx(.46,.5,.46,0,.14,0);bx(.4,.4,.4,0,.64,0);bx(.28,.22,.36,0,.66,.3);bx(.1,.16,.1,-.12,1.04,-.05);bx(.1,.16,.1,.12,1.04,-.05);bx(.1,.5,.1,0,.74,-.2);g.rotation.y=c=='w'?Math.PI:0}
  if(t=='b'){bx(.4,.6,.4,0,.14,0);bx(.34,.34,.34,0,.74,0);bx(.14,.14,.14,0,1.08,0).rotation.y=Math.PI/4}
  if(t=='q'){bx(.46,.78,.46,0,.14,0);bx(.62,.14,.62,0,.92,0);K4.forEach(([a,b])=>bx(.12,.2,.12,a*.25,1.06,b*.25));bx(.18,.18,.18,0,1.06,0,MCG)}
  if(t=='k'){bx(.5,.86,.5,0,.14,0);bx(.64,.14,.64,0,1.0,0);bx(.12,.36,.12,0,1.14,0,MCG);bx(.34,.12,.12,0,1.26,0,MCG)}
  return g}
function edgeReset(){const mc=CFG.theme=='mc';edge.material.emissive.setHex(mc?0x8a6a00:0x8a6528);edge.material.color.setHex(mc?0xe8c32e:0xc8a05a)}
function rebuildPieces(){if(!B||wreck)return;for(let y=0;y<8;y++)for(let x=0;x<8;x++){const og=P[y][x],p=B[y][x];if(!og||!p)continue;
  const ng=mk(p.t,p.c);ng.position.copy(og.position);ng.rotation.copy(og.rotation);ng.scale.copy(og.scale);ng.userData=og.userData;S.remove(og);S.add(ng);
  const i=pcs.indexOf(og);if(i>=0)pcs[i]=ng;P[y][x]=ng;if(selG===og)selG=ng}}
function applyTheme(){const mc=CFG.theme=='mc',q=QP[qKey]||QP.med;document.documentElement.classList.toggle('mc',mc);
  S.background.setHex(mc?0x7cb8ff:0x0d0907);S.fog.color.setHex(mc?0xa6d0ff:0x0d0907);S.fog.near=mc?34:22;S.fog.far=mc?80:50;
  hemi.color.setHex(mc?0xdcebff:0xffe8c8);hemi.groundColor.setHex(mc?0x7a9a58:0x1a0f0a);hemi.intensity=mc?.8:.55;sun.color.setHex(mc?0xffffff:0xfff0d8);sun.intensity=mc?.95:.8;
  floor.material.map=mc?GRASSF:FELT;base.material.map=mc?PLANKS:BASEW;edgeReset();
  tl.forEach(t=>{const [x,y]=t.userData.sq;t.material.map=mc?MCT[(x+y)%2][(x*3+y)%2]:TW[(x+y)%2][(x*3+y)%2];t.material.needsUpdate=true});
  cloudG.visible=sunB.visible=mc;dust.visible=!mc&&!!q.dust;L1.visible=L2.visible=!mc&&!!q.lt;rebuildPieces();
  S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{m.needsUpdate=true})});shHold=4}
const floor=new THREE.Mesh(new THREE.CircleGeometry(34,64),new THREE.MeshStandardMaterial({map:FELT,roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.55;floor.receiveShadow=true;S.add(floor);
const base=new THREE.Mesh(new THREE.BoxGeometry(9.2,.5,9.2),new THREE.MeshStandardMaterial({map:BASEW,roughness:.55,metalness:.1}));base.position.y=-.35;base.receiveShadow=true;S.add(base);
const edge=new THREE.Mesh(new THREE.BoxGeometry(9.35,.06,9.35),new THREE.MeshStandardMaterial({color:0xc8a05a,emissive:0x8a6528,emissiveIntensity:.5,metalness:.8,roughness:.35}));edge.position.y=-.22;S.add(edge);
const bars=[0,1].map(i=>{const m=new THREE.Mesh(new THREE.BoxGeometry(8.2,.06,.12),new THREE.MeshStandardMaterial({color:0xe8c982,emissive:0xe8c982,emissiveIntensity:.1}));m.position.set(0,-.2,i?-4.8:4.8);S.add(m);return m});
const dG=new THREE.BufferGeometry(),dp=new Float32Array(900);for(let i=0;i<300;i++){dp[i*3]=(Math.random()-.5)*28;dp[i*3+1]=Math.random()*9;dp[i*3+2]=(Math.random()-.5)*28}
dG.setAttribute('position',new THREE.BufferAttribute(dp,3));
const dust=new THREE.Points(dG,new THREE.PointsMaterial({color:0xffe3b8,size:.07,transparent:true,opacity:.5,depthWrite:false}));S.add(dust);
const XL=new THREE.PointLight(0xff5a14,0,14);S.add(XL);const CL=XL,BL=XL,FL=XL;
const T=[],tl=[];
for(let y=0;y<8;y++){T[y]=[];for(let x=0;x<8;x++){
  const m=new THREE.Mesh(new THREE.BoxGeometry(1,.2,1),new THREE.MeshStandardMaterial({map:TW[(x+y)%2][(x*3+y)%2],roughness:.5,metalness:.05}));
  const [wx,wz]=pos(x,y);m.position.set(wx,-.1,wz);m.receiveShadow=true;m.userData.sq=[x,y];S.add(m);T[y][x]=m;tl.push(m)}}
const hl=new THREE.Group();S.add(hl);

function mk(t,c){return CFG.theme=='mc'?mkMC(t,c):mkC(t,c)}
function mkC(t,c){const g=new THREE.Group();
  const m=PM[c][Math.random()*2|0];
  const L=pts=>{const me=new THREE.Mesh(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),28),m);g.add(me);return me};
  const add=(geo,x,y,z,rx,ry,rz)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.rotation.set(rx||0,ry||0,rz||0);g.add(me);return me};
  const sp=r=>new THREE.SphereGeometry(r,24,16),bx=(a,b,d)=>new THREE.BoxGeometry(a,b,d);
  const B0=[[0,0],[.36,0],[.38,.06],[.34,.12],[.26,.16]];
  if(t=='p'){L([...B0,[.14,.3],[.12,.42],[.2,.46],[0,.46]]);add(sp(.2),0,.62,0)}
  if(t=='r'){L([...B0,[.24,.3],[.24,.6],[.34,.66],[.34,.82],[0,.82]]);for(let i=0;i<6;i++){const a=i*Math.PI/3;add(bx(.14,.14,.14),Math.cos(a)*.27,.89,Math.sin(a)*.27,0,-a)}}
  if(t=='n'){L([...B0,[.22,.3],[0,.3]]);add(bx(.34,.7,.3),0,.62,-.04,.25);add(bx(.28,.28,.5),0,1.0,.14,-.3);add(bx(.08,.14,.08),-.09,1.2,-.06);add(bx(.08,.14,.08),.09,1.2,-.06);g.rotation.y=c=='w'?Math.PI:0}
  if(t=='b'){L([...B0,[.18,.3],[.12,.6],[.2,.68],[.12,.74],[0,.74]]);add(sp(.17),0,.9,0).scale.y=1.35;add(sp(.06),0,1.2,0)}
  if(t=='q'){L([...B0,[.2,.34],[.13,.7],[.24,.9],[.3,1.0],[.2,1.02],[0,1.02]]);add(new THREE.TorusGeometry(.26,.04,10,24),0,1.04,0,Math.PI/2);for(let i=0;i<6;i++){const a=i*Math.PI/3;add(sp(.05),Math.cos(a)*.26,1.1,Math.sin(a)*.26)}add(sp(.09),0,1.18,0)}
  if(t=='k'){L([...B0,[.22,.34],[.14,.8],[.26,1.0],[.26,1.08],[0,1.08]]);add(bx(.1,.34,.1),0,1.3,0);add(bx(.28,.1,.1),0,1.33,0)}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}


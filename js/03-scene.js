/* ---------- three.js scene ---------- */
const MOB=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&Math.min(innerWidth,innerHeight)<820);
const cv=$('#c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:!(MOB&&devicePixelRatio>=2),powerPreference:'high-performance'});
R.setPixelRatio(1);R.shadowMap.enabled=true;R.shadowMap.autoUpdate=false;R.shadowMap.needsUpdate=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;
const S=new THREE.Scene(),BGC=new THREE.Color(0x0d0907);S.background=BGC;S.fog=new THREE.Fog(0x0d0907,22,50);
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
let WATER=null;const TORCH=[];
const PM={w:[pmat(pieceWood('#ead5a4',21,'120,80,30','255,245,215',1)),pmat(pieceWood('#dfc58f',37,'110,70,25','255,240,205',1))],
  b:[pmat(pieceWood('#3b251b',53,'8,3,1','175,115,75',1.7)),pmat(pieceWood('#33201a',71,'8,3,1','160,100,65',1.7))]};
const FELT=feltTex(),BASEW=woodTex('#2b1a11',7);
function pixTex(cols,seed,rep){const w=16,c=document.createElement('canvas');c.width=c.height=w;const g=c.getContext('2d');let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){g.fillStyle=cols[Math.floor(rnd()*cols.length)];g.fillRect(x,y,1,1)}
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.encoding=THREE.sRGBEncoding;
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep)}return t}
/* ---------- Minecraft look: hand-drawn 16px block textures ---------- */
function pxT(fn,seed,rep){const w=16,c=document.createElement('canvas');c.width=c.height=w;const g=c.getContext('2d');let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){const col=fn(x,y,rnd);if(col){g.fillStyle=col;g.fillRect(x,y,1,1)}}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep)}return t}
const pk=(a,r)=>a[r()*a.length|0];
const PAL={grass:['#5a9e33','#4f8f2b','#62a83a','#55962f','#6bb544','#4c8a29'],dirt:['#8b5a2b','#7a4e24','#946236','#6e4520','#a06d3f','#86562a'],
  plank:['#b8945f','#a98551','#ad8a56','#9f7d4b'],quartz:['#f2eee6','#ece7dd','#f6f2ea','#efeae1'],obs:['#14101c','#1b1526','#221a30','#100c16','#181220'],
  gold:['#f6d84a','#f1cf3a','#fbe36a','#efc934'],dia:['#5decf5','#4ad8e3','#8ff4f8','#55e2ec'],bark:['#6b5030','#5e4528','#735634','#654b2c'],
  leaf:['#3f8a2a','#4a9a32','#367a22','#55a83a','#438f2c'],water:['#3f6fe0','#3a66d4','#4b7cec','#4470e2'],sand:['#e0d39a','#d8ca8d','#e8dca6','#dccf94']};
const TX={
  grass:(x,y,r)=>r()<.08?'#3f7a22':pk(PAL.grass,r),
  dirt:(x,y,r)=>r()<.07?'#5a3a1a':r()<.05?'#b08050':pk(PAL.dirt,r),
  side:(x,y,r)=>(y<3||(y==3&&r()<.55)||(y==4&&r()<.18))?pk(PAL.grass,r):TX.dirt(x,y,r),
  plank:(x,y,r)=>{const row=y>>2;if(y%4==3)return '#6b5232';if(x==((row*7+3)&15))return '#7a5e3a';return (x+row*3)%6==0?'#94733f':pk(PAL.plank,r)},
  quartz:(x,y,r)=>x==0||y==0?'#fffdf8':x==15||y==15?'#cbc4b6':(x==1||y==1)&&r()<.5?'#f9f6ef':pk(PAL.quartz,r),
  obs:(x,y,r)=>{const v=r();return v<.05?'#5b3f8a':v<.07?'#8a6bc2':pk(PAL.obs,r)},
  gold:(x,y,r)=>x==0||y==0?'#fff7a8':x==15||y==15?'#b8860b':((x+y)%9==0&&r()<.7)?'#fffbd0':pk(PAL.gold,r),
  dia:(x,y,r)=>x==0||y==0?'#d8ffff':x==15||y==15?'#1f9fb0':((x-y+16)%7==0&&r()<.7)?'#e6ffff':pk(PAL.dia,r),
  bark:(x,y,r)=>x%4==0&&r()<.8?'#4a3720':pk(PAL.bark,r),
  leaf:(x,y,r)=>r()<.14?'#24501a':pk(PAL.leaf,r),
  water:(x,y,r)=>(y+x*2)%11==0?'#6f97ff':pk(PAL.water,r),
  sand:(x,y,r)=>pk(PAL.sand,r),
  blade:(x,y,r)=>{const b=[2,5,8,11,13][x%5];return ((x%3==0)&&y>b-((x*7)%5))?(y>12?'#3f7a22':'#5fae3a'):null}};
const MCT=[[pxT(TX.dirt,3),pxT(TX.dirt,9)],[pxT(TX.grass,5),pxT(TX.grass,13)]],GRASSF=pxT(TX.grass,21,68),PLANKS=pxT(TX.plank,7,6);
const mcmat=t=>new THREE.MeshStandardMaterial({map:t,roughness:1,metalness:0});
const MCM={w:[mcmat(pxT(TX.quartz,31)),mcmat(pxT(TX.quartz,47))],b:[mcmat(pxT(TX.obs,53)),mcmat(pxT(TX.obs,71))]};
const MCG=new THREE.MeshStandardMaterial({map:pxT(TX.gold,5),roughness:.45,metalness:.55}),MCD=new THREE.MeshStandardMaterial({map:pxT(TX.dia,9),roughness:.35,metalness:.2,emissive:0x0a5a66,emissiveIntensity:.35});
const EYE={w:new THREE.MeshStandardMaterial({color:0x1d1d22,roughness:1}),b:new THREE.MeshStandardMaterial({color:0xd06cff,emissive:0xb040ff,emissiveIntensity:1.4})},DOOR=new THREE.MeshStandardMaterial({map:pxT(TX.plank,17),color:0x8a7a6a,roughness:1});
/* sky: gradient behind everything */
const SKY=(()=>{const c=document.createElement('canvas');c.width=2;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#5d8ef0');gr.addColorStop(.55,'#93bcff');gr.addColorStop(1,'#cfe4ff');g.fillStyle=gr;g.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t})();
const cloudG=new THREE.Group(),cm=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.55,transparent:true,opacity:.95,fog:false});
for(let i=0;i<16;i++){const a=i/16*6.283+Math.random()*.3,r=18+Math.random()*12,cx=Math.cos(a)*r,cz=Math.sin(a)*r,y=12+Math.random()*4;
  for(let k=0;k<3;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(2+Math.random()*3,.8,1.5+Math.random()*2.5),cm);m.position.set(cx+(Math.random()-.5)*3,y,cz+(Math.random()-.5)*3);cloudG.add(m)}}
const sunB=new THREE.Mesh(new THREE.BoxGeometry(4,4,.5),new THREE.MeshBasicMaterial({color:0xfff2a0,fog:false}));sunB.position.set(-22,19,-28);sunB.lookAt(0,0,0);
/* the meadow around the board: trees, hills, flowers, grass, a pond and four torches */
const mcW=new THREE.Group();
(function(){let r=91;const rnd=()=>(r=(r*16807)%2147483647)/2147483647,FY=-.55,BX=new THREE.BoxGeometry(1,1,1),M4=new THREE.Matrix4(),Q4=new THREE.Quaternion(),S3=new THREE.Vector3(),P3=new THREE.Vector3(),UPV=new THREE.Vector3(0,1,0);
  const free=(x,z)=>{const d=Math.hypot(x,z);if(d<7.2)return false;if(x>3.5&&x<11&&Math.abs(z)<4.5)return false;if(z>5&&z<12.5&&Math.abs(x)<3.6)return false;return true};
  const inst=(geo,mat,list)=>{const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((p,i)=>{Q4.setFromAxisAngle(UPV,p[3]||0);const sc=p[4]||[1,1,1];S3.set(sc[0],sc[1],sc[2]);P3.set(p[0],p[1],p[2]);im.setMatrixAt(i,M4.compose(P3,Q4,S3))});mcW.add(im);return im};
  const logs=[],leaves=[];
  [[-9,-8],[9,-11],[-14,1],[14,-3],[-6,-15],[3,-17],[-17,-9],[17,7],[-13,10],[12,13],[-20,4],[20,-12]].forEach(([x,z],i)=>{const h=4+(i%3);
    for(let y=0;y<h;y++)logs.push([x,FY+.5+y,z]);
    for(let ly=h-2;ly<=h+1;ly++){const rr=ly<h?2:1;for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){if(!dx&&!dz&&ly<h)continue;if(Math.abs(dx)==rr&&Math.abs(dz)==rr&&(rr==2?rnd()<.7:ly==h+1))continue;leaves.push([x+dx,FY+.5+ly,z+dz])}}});
  inst(BX,mcmat(pxT(TX.bark,33)),logs);inst(BX,mcmat(pxT(TX.leaf,41)),leaves);
  const hills=[],side=mcmat(pxT(TX.side,29)),top=mcmat(pxT(TX.grass,61)),dirt=mcmat(pxT(TX.dirt,19));
  for(let a=0;a<6.283;a+=.085){const rad=27+rnd()*5,h=Math.max(0,Math.round(1.6+Math.sin(a*3)*1.4+Math.sin(a*7+1)*.9+rnd()*.8));
    for(let y=0;y<h;y++)hills.push([Math.cos(a)*rad,FY+1+y*2,Math.sin(a)*rad,a,[2,2,2]])}
  inst(BX,[side,side,top,dirt,side,side],hills);
  const st=[],red=[],yel=[],tufts=[];
  for(let i=0;i<220;i++){const a=rnd()*6.283,d=7.5+rnd()*15,x=Math.cos(a)*d,z=Math.sin(a)*d;if(!free(x,z))continue;
    if(i%5==0){st.push([x,FY+.18,z,0,[.06,.36,.06]]);(i%2?red:yel).push([x,FY+.4,z,rnd()*3,[.16,.12,.16]])}else{tufts.push([x,FY+.25,z,rnd()*3,[.55,.5,.55]]);tufts.push([x,FY+.25,z,rnd()*3+1.57,[.55,.5,.55]])}}
  inst(BX,new THREE.MeshLambertMaterial({color:0x3f8a2a}),st);inst(BX,new THREE.MeshLambertMaterial({color:0xd0302a}),red);inst(BX,new THREE.MeshLambertMaterial({color:0xf2d22e}),yel);
  inst(new THREE.PlaneGeometry(1,1),new THREE.MeshLambertMaterial({map:pxT(TX.blade,77),alphaTest:.5,side:THREE.DoubleSide}),tufts);
  const sand=[];for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)if(Math.abs(x)==3||Math.abs(z)==2)sand.push([-11+x,FY+.02,6+z,0,[1,.12,1]]);
  inst(BX,mcmat(pxT(TX.sand,55)),sand);
  WATER=pxT(TX.water,8,1);WATER.repeat.set(5,3);const wm=new THREE.Mesh(new THREE.BoxGeometry(5,.1,3),new THREE.MeshStandardMaterial({map:WATER,transparent:true,opacity:.82,roughness:.15,metalness:.1}));wm.position.set(-11,FY+.02,6);mcW.add(wm);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const t=new THREE.Group(),stick=new THREE.Mesh(new THREE.BoxGeometry(.12,.62,.12),mcmat(pxT(TX.plank,23)));stick.position.y=.31;
    const fl=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.16),new THREE.MeshStandardMaterial({color:0xffd060,emissive:0xff9a20,emissiveIntensity:2}));fl.position.y=.68;t.add(stick,fl);t.position.set(a*4.85,-.1,b*4.85);TORCH.push(fl.material);mcW.add(t)})})();
mcW.visible=cloudG.visible=sunB.visible=false;S.add(cloudG,sunB,mcW);
function mcTick(t){if(WATER)WATER.offset.set(t*.00004,t*.00007);TORCH.forEach((m,i)=>{m.emissiveIntensity=1.7+Math.sin(t*.011+i*2)*.25+Math.sin(t*.031+i)*.15})}
function mkMC(t,c){const g=new THREE.Group(),m=MCM[c][Math.random()*2|0],eye=EYE[c];
  const bx=(w,h,d,x,y,z,mat)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||m);me.position.set(x,y+h/2,z);me.castShadow=true;g.add(me);return me};
  const eyes=(y,z,sp)=>{bx(.08,.08,.03,-sp,y,z,eye);bx(.08,.08,.03,sp,y,z,eye)};
  const K4=[[-1,-1],[1,-1],[-1,1],[1,1]];bx(.74,.14,.74,0,0,0);bx(.6,.06,.6,0,.14,0);
  if(t=='p'){bx(.34,.32,.34,0,.2,0);bx(.44,.4,.44,0,.52,0);eyes(.68,.225,.1)}
  if(t=='r'){bx(.52,.6,.52,0,.2,0);bx(.68,.14,.68,0,.8,0);K4.forEach(([a,b])=>bx(.18,.18,.18,a*.25,.94,b*.25));bx(.16,.24,.03,0,.2,.27,DOOR);bx(.06,.14,.03,0,.56,.27,EYE.w)}
  if(t=='n'){bx(.46,.5,.46,0,.2,0);bx(.4,.42,.42,0,.7,-.02);bx(.3,.24,.36,0,.72,.32);bx(.1,.16,.1,-.12,1.12,-.08);bx(.1,.16,.1,.12,1.12,-.08);bx(.12,.52,.12,0,.66,-.24,EYE.w);
    bx(.03,.08,.08,-.205,.9,.1,eye);bx(.03,.08,.08,.205,.9,.1,eye);bx(.06,.05,.03,-.07,.78,.505,EYE.w);bx(.06,.05,.03,.07,.78,.505,EYE.w)}
  if(t=='b'){bx(.42,.62,.42,0,.2,0);bx(.36,.36,.36,0,.82,0);bx(.04,.3,.37,.05,.86,0,EYE.w).rotation.z=.5;const gm=bx(.14,.14,.14,0,1.2,0,MCD);gm.rotation.set(.6,.78,0)}
  if(t=='q'){bx(.48,.8,.48,0,.2,0);bx(.64,.14,.64,0,1.0,0,MCG);K4.forEach(([a,b])=>bx(.12,.22,.12,a*.26,1.14,b*.26,MCG));bx(.2,.2,.2,0,1.14,0,MCD)}
  if(t=='k'){bx(.52,.88,.52,0,.2,0);bx(.66,.14,.66,0,1.08,0,MCG);K4.forEach(([a,b])=>bx(.1,.14,.1,a*.27,1.22,b*.27,MCG));bx(.12,.4,.12,0,1.22,0,MCG);bx(.36,.12,.12,0,1.36,0,MCG);bx(.12,.12,.13,0,1.36,0,MCD)}
  g.rotation.y=c=='w'?Math.PI:0;return g}
function edgeReset(){const mc=CFG.theme=='mc';edge.material.emissive.setHex(mc?0x8a6a00:0x8a6528);edge.material.color.setHex(mc?0xe8c32e:0xc8a05a)}
function rebuildPieces(){if(!B||wreck)return;for(let y=0;y<8;y++)for(let x=0;x<8;x++){const og=P[y][x],p=B[y][x];if(!og||!p)continue;
  const ng=mk(p.t,p.c);ng.position.copy(og.position);ng.rotation.copy(og.rotation);ng.scale.copy(og.scale);ng.userData=og.userData;S.remove(og);S.add(ng);
  const i=pcs.indexOf(og);if(i>=0)pcs[i]=ng;P[y][x]=ng;if(selG===og)selG=ng}}
function applyTheme(){const mc=CFG.theme=='mc',q=QP[qKey]||QP.med;document.documentElement.classList.toggle('mc',mc);
  S.background=mc?SKY:BGC;S.fog.color.setHex(mc?0xa6d0ff:0x0d0907);S.fog.near=mc?34:22;S.fog.far=mc?80:50;
  hemi.color.setHex(mc?0xdcebff:0xffe8c8);hemi.groundColor.setHex(mc?0x7a9a58:0x1a0f0a);hemi.intensity=mc?.8:.55;sun.color.setHex(mc?0xffffff:0xfff0d8);sun.intensity=mc?.95:.8;
  floor.material.map=mc?GRASSF:FELT;base.material.map=mc?PLANKS:BASEW;edgeReset();
  tl.forEach(t=>{const [x,y]=t.userData.sq;t.material.map=mc?MCT[(x+y)%2][(x*3+y)%2]:TW[(x+y)%2][(x*3+y)%2];t.material.needsUpdate=true});
  cloudG.visible=sunB.visible=mcW.visible=mc;dust.visible=!mc&&!!q.dust;L1.visible=L2.visible=!mc&&!!q.lt;rebuildPieces();
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


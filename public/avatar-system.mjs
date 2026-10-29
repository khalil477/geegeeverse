import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {normalizeAppearance,AVATAR_DEFAULTS} from './avatar-options.mjs';
// Original GeeGeeVerse procedural character geometry. Does not embed third-party model assets.
const shirtColors={coral:0xef927b,mint:0x72c7ae,lavender:0xa998e7,gold:0xf5c46b,sky:0x75bde4};
const skinColors={sunrise:0xf5cbb1,peach:0xe8ad8c,olive:0xc79975,amber:0xa97555,cocoa:0x784f3d,deep:0x51372c};
const pantsColors={denim:0x405d88,forest:0x315b55,charcoal:0x353c49};
const mat=(c,rough=.78)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:.02});
function oval(parent,material,x,y,z,sx,sy,sz,detail=16){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,detail,Math.max(10,detail-4)),material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh}
function cube(parent,material,x,y,z,sx,sy,sz,r=0){const g=new THREE.BoxGeometry(sx,sy,sz);const m=new THREE.Mesh(g,material);m.position.set(x,y,z);parent.add(m);return m}
function tube(parent,material,from,to,radius=.06){const vector=new THREE.Vector3().subVectors(new THREE.Vector3(...to),new THREE.Vector3(...from));const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,vector.length(),9),material);m.position.copy(new THREE.Vector3(...from).addScaledVector(vector,.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector.normalize());parent.add(m);return m}
function textLabel(group,name){const canvas=document.createElement('canvas');canvas.width=384;canvas.height=80;const g=canvas.getContext('2d');g.fillStyle='rgba(20,55,51,.86)';g.beginPath();g.roundRect(4,4,376,70,18);g.fill();g.fillStyle='#fffef0';g.font='bold 34px system-ui';g.textAlign='center';g.fillText(String(name||'Explorer').slice(0,19),192,50,345);const tex=new THREE.CanvasTexture(canvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));sprite.position.y=5.18;sprite.scale.set(4.7,.98,1);group.add(sprite);}
export function createAvatar(name='Explorer',appearance=AVATAR_DEFAULTS,{isMe=false,preview=false}={}){
 const a=normalizeAppearance(appearance), root=new THREE.Group();
 const skin=mat(skinColors[a.skin]);const shirt=mat(shirtColors[a.color]);const shirtDark=mat(new THREE.Color(shirtColors[a.color]).multiplyScalar(.81));const hair=mat(0x352d31);
 const pants=mat(pantsColors[a.pants]);const sneakers=mat(0xf8f2e7),soles=mat(0x555c69),white=mat(0xffffff),eyes=mat(0x2e3036),pink=mat(0x985c59);
 const limbs={arms:[],legs:[]};
 // Rounded silhouette: fitted torso and separate pivoted limbs.
 oval(root,shirt,0,2.30,0,.79,.94,.53,20);
 oval(root,shirt,0,2.93,0,.7,.28,.46);
 oval(root,pants,0,1.46,0,.72,.34,.48);
 if(a.style==='hoodie'){
  oval(root,shirtDark,0,3.03,-.33,.63,.30,.27);
  oval(root,shirtDark,0,2.15,.523,.22,.23,.045);
  tube(root,white,[-.12,2.99,.47],[-.10,2.64,.5],.022);
  tube(root,white,[.12,2.99,.47],[.10,2.64,.5],.022);
 }else if(a.style==='jacket'){
  oval(root,shirtDark,0,2.28,.52,.12,.72,.035);
  tube(root,sneakers,[0,2.95,.55],[0,1.75,.56],.023);
  oval(root,white,0,3.02,.36,.26,.13,.15);
 }else{
  oval(root,shirtDark,0,2.95,.2,.43,.08,.37);
 }
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.83,2.91,0);root.add(arm);
  oval(arm,shirt,side*.06,-.35,0,.27,.51,.3);
  oval(arm,skin,side*.075,-.90,0,.23,.36,.25);
  oval(arm,skin,side*.075,-1.14,.02,.22,.22,.24);limbs.arms.push({pivot:arm,side});
  const leg=new THREE.Group();leg.position.set(side*.4,1.41,0);root.add(leg);
  oval(leg,pants,0,-.52,0,.32,.68,.33);
  oval(leg,pants,0,-1.02,.02,.29,.37,.3);
  oval(leg,soles,0,-1.33,.15,.35,.18,.51);
  oval(leg,sneakers,0,-1.27,.20,.34,.17,.49);limbs.legs.push({pivot:leg,side});
 }
 oval(root,skin,0,3.37,0,.22,.31,.2);
 // Rounded face with gentle, understated features.
 oval(root,skin,0,3.93,0,.65,.73,.58,24);
 oval(root,skin,-.62,3.88,0,.14,.23,.16);
 oval(root,skin,.62,3.88,0,.14,.23,.16);
 for(const s of [-1,1]){
  oval(root,white,s*.245,3.96,.526,.17,.17,.085);
  oval(root,eyes,s*.245,3.945,.60,.075,.09,.038);
  oval(root,white,s*.224,3.985,.631,.025,.028,.011);
  oval(root,hair,s*.25,4.235,.505,.19,.039,.025);
 }
 oval(root,skin,0,3.78,.591,.09,.16,.11);
 oval(root,pink,0,3.60,.549,.18,.037,.025);
 // Distinct hair silhouettes. Facing forward is positive Z.
 if(a.hair==='short'){
   oval(root,hair,0,4.49,-.04,.67,.34,.62);
   oval(root,hair,-.35,4.40,.30,.32,.22,.34);
   oval(root,hair,.25,4.45,.35,.37,.2,.26);
 }else if(a.hair==='bob'){
   oval(root,hair,0,4.49,-.02,.72,.31,.65);
   oval(root,hair,-.61,3.98,-.05,.20,.51,.48);
   oval(root,hair,.61,3.98,-.05,.20,.51,.48);
 }else if(a.hair==='curls'){
   for(let i=0;i<15;i++){const angle=i*Math.PI*2/15,rad=i%3===0?.5:.59;
     oval(root,hair,Math.cos(angle)*rad,4.43+(i%2)*.13,Math.sin(angle)*rad*.85,.26,.28,.27,10)}
   oval(root,hair,0,4.61,0,.50,.29,.52,10);
 }else if(a.hair==='bun'){
   oval(root,hair,0,4.51,0,.69,.27,.60);
   oval(root,hair,0,4.72,-.35,.30,.33,.31);
   oval(root,hair,0,4.42,.30,.57,.17,.30);
 }else if(a.hair==='cap'){
   oval(root,hair,0,4.34,0,.58,.15,.56);
   const cap=mat(0x436f79);
   oval(root,cap,0,4.53,-.01,.69,.29,.63);
   oval(root,cap,0,4.37,.61,.58,.075,.38);
 }
 if(a.accessory==='glasses'){
   const lens=mat(0x263d45),glass=mat(0xc5f4fd,.20);
   for(const side of [-1,1]){
     const outline=oval(root,lens,side*.255,3.96,.637,.235,.20,.045);
     oval(root,glass,side*.255,3.96,.677,.185,.155,.014);
     tube(root,lens,[side*.45,3.975,.60],[side*.65,4,.16],.027);
   }tube(root,lens,[-.04,3.985,.67],[.04,3.985,.67],.032);
 }else if(a.accessory==='headphones'){
   const band=mat(0x263c55);const g=new THREE.TorusGeometry(.73,.09,9,26,Math.PI);
   const arch=new THREE.Mesh(g,band);arch.position.set(0,4.25,-.04);arch.rotation.z=0;root.add(arch);
   for(const side of [-1,1])oval(root,band,side*.69,3.91,0,.20,.39,.36);
 }else if(a.accessory==='backpack'){
   const bag=mat(0x395a65),strap=mat(0x2c454a);
   oval(root,bag,0,2.24,-.68,.67,.79,.40);
   oval(root,shirtDark,0,1.88,-.99,.41,.30,.06);
   for(const side of [-1,1])tube(root,strap,[side*.5,2.97,-.38],[side*.55,1.94,-.44],.085);
 }
 // Simple in-world interaction indicator for your own character.
 if(isMe && !preview){const ring=new THREE.Mesh(new THREE.RingGeometry(.92,1.02,28),new THREE.MeshBasicMaterial({color:0xf7de97,transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.055;root.add(ring)}
 if(!preview)textLabel(root,name);
 root.userData.appearance=a;root.userData.anim={limbs,phase:0};
 return root;
}
export function animateAvatar(root,dt,{speed=0,elapsed=0,jump=0}={}){
 if(!root?.userData?.anim)return;
 const {limbs}=root.userData.anim;
 const moving=THREE.MathUtils.clamp(speed/7,0,1);
 const swing=Math.sin(elapsed*12)*.6*moving;
 for(const {pivot,side} of limbs.legs){pivot.rotation.x=-side*swing;pivot.rotation.z=side*.028}
 for(const {pivot,side} of limbs.arms){pivot.rotation.x=side*swing*.85 + (jump>0?-.65:0);pivot.rotation.z=side*.09}
 const torso=root.children[0];if(torso)torso.rotation.z=Math.sin(elapsed*7)*.018*moving;
}
export function disposeAvatar(root){if(!root)return;root.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});}

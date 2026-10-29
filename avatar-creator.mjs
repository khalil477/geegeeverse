import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createAvatar,animateAvatar,disposeAvatar} from './avatar-system.mjs';
import {AVATAR_DEFAULTS,AVATAR_OPTIONS,normalizeAppearance} from './avatar-options.mjs';
const LABELS={color:'Outfit colour',skin:'Skin tone',hair:'Hairstyle',style:'Clothing',accessory:'Accessory',pants:'Pants'};
const NAMES={coral:'Coral',mint:'Mint',lavender:'Lavender',gold:'Gold',sky:'Sky',sunrise:'Sunrise',peach:'Peach',olive:'Olive',amber:'Amber',cocoa:'Cocoa',deep:'Deep',short:'Short',bob:'Bob',curls:'Curls',bun:'Bun',cap:'Cap',hoodie:'Hoodie',jacket:'Jacket',tee:'T-shirt',none:'None',backpack:'Backpack',glasses:'Glasses',headphones:'Headphones',denim:'Denim',forest:'Forest',charcoal:'Charcoal'};
export function mountAvatarCreator(onChange){
 const root=document.getElementById('avatar-creator');if(!root)return{get:()=>({...AVATAR_DEFAULTS})};
 let appearance;try{appearance=normalizeAppearance(JSON.parse(localStorage.getItem('ggv-avatar-v1')||'{}'));}catch{appearance={...AVATAR_DEFAULTS}}
 let renderer=null,scene=null,camera=null,model=null,angle=0,prev=0;
 const canvas=root.querySelector('canvas');
 const controls=root.querySelector('#avatar-custom-controls');
 const SWATCH={coral:'#ef927b',mint:'#72c7ae',lavender:'#a998e7',gold:'#f5c46b',sky:'#75bde4',sunrise:'#f5cbb1',peach:'#e8ad8c',olive:'#c79975',amber:'#a97555',cocoa:'#784f3d',deep:'#51372c',denim:'#405d88',forest:'#315b55',charcoal:'#353c49'};
 for(const [key,options] of Object.entries(AVATAR_OPTIONS)){
  const field=document.createElement('fieldset');field.className='avatar-field';const legend=document.createElement('legend');legend.textContent=LABELS[key];field.append(legend);
  const choices=document.createElement('div');choices.className='avatar-choice-row';field.append(choices);
  for(const value of options){const b=document.createElement('button');b.type='button';b.dataset.avatarKey=key;b.dataset.avatarValue=value;b.className='avatar-choice';b.textContent=NAMES[value];if(SWATCH[value]){const dot=document.createElement('i');dot.className='avatar-dot';dot.style.background=SWATCH[value];b.prepend(dot)}choices.append(b);b.addEventListener('click',()=>{appearance[key]=value;appearance=normalizeAppearance(appearance);renderOptions();rebuildPreview();try{localStorage.setItem('ggv-avatar-v1',JSON.stringify(appearance));}catch{}onChange({...appearance});});}
  controls.append(field);
 }
 function renderOptions(){root.querySelectorAll('[data-avatar-key]').forEach(btn=>{const chosen=appearance[btn.dataset.avatarKey]===btn.dataset.avatarValue;btn.classList.toggle('chosen',chosen);btn.setAttribute('aria-pressed',String(chosen));});}
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));renderer.setSize(220,270,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x859faf,2.7));const keyLight=new THREE.DirectionalLight(0xffdfb0,2.5);keyLight.position.set(-4,9,8);scene.add(keyLight);
  camera=new THREE.PerspectiveCamera(36,220/270,.1,40);camera.position.set(0,3.15,11);camera.lookAt(0,2.5,0);
 }catch(err){console.warn('Avatar preview WebGL unavailable',err);root.querySelector('.avatar-preview-fallback').hidden=false;canvas.hidden=true;}
 function rebuildPreview(){if(!scene)return;if(model){scene.remove(model);disposeAvatar(model)}model=createAvatar('Preview',appearance,{preview:true});scene.add(model);}
 function frame(t){const dt=Math.min(.05,(t-(prev||t))/1000);prev=t;if(renderer&&scene&&model&&!root.closest('[hidden]')){angle+=dt*.4;model.rotation.y=Math.sin(t*.00032)*.55;animateAvatar(model,dt,{speed:0,elapsed:t/1000});renderer.render(scene,camera);}requestAnimationFrame(frame);}
 renderOptions();rebuildPreview();requestAnimationFrame(frame);onChange({...appearance});
 return{get:()=>({...appearance})};
}

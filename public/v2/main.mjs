import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {buildCampusWorld} from './world.mjs';
import {EYE_HEIGHT,START_POSITION,START_ROTUNDA,ZONES,movePlayer,nearbyAction,groundHeightFor,V2_VERSION} from './game-config.mjs';

const $=(selector)=>document.querySelector(selector);
const canvas=$('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.22;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(73,1,.08,240);
camera.rotation.order='YXZ';
const world=buildCampusWorld(THREE,scene);
const settings={zone:'campus',position:{...START_POSITION},yaw:0,pitch:-.035,started:false,quality:'balanced',moving:false,feet:0};
const held=new Set();
const touch={forward:0,right:0};
const keyMap={KeyW:'forward+',ArrowUp:'forward+',KeyS:'forward-',ArrowDown:'forward-',KeyA:'right-',KeyD:'right+'};
let dragging=false,lastPointer=null,fpsFrames=0,fpsLast=performance.now(),last=performance.now();
const supportsFinePointer=matchMedia('(pointer:fine)').matches;
function setQuality(level){
  settings.quality=level;
  const ratio=level==='high'?1.65:level==='low'?.85:1.2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,ratio));
  renderer.shadowMap.enabled=level!=='low';
  renderer.shadowMap.needsUpdate=true;
  renderer.toneMappingExposure=level==='low'?1.35:1.22;
  $('#quality').value=level;
  onResize();
}
function onResize(){
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function isHeld(...keys){return keys.some(key=>held.has(key));}
function movementInput(){
  return {
    forward:(isHeld('KeyW','ArrowUp')?1:0)-(isHeld('KeyS','ArrowDown')?1:0)+touch.forward,
    right:(isHeld('KeyD')?1:0)-(isHeld('KeyA')?1:0)+touch.right
  };
}
function enterZone(zone){
  if(zone!=='campus'&&zone!=='rotunda')return;
  settings.zone=zone;
  settings.position={...(zone==='campus'?START_POSITION:START_ROTUNDA)};
  if(zone==='campus'){settings.position.z=15.4;settings.yaw=0;settings.pitch=-.055;}
  else {settings.yaw=0;settings.pitch=.07;}
  world.setZone(zone);
  $('#location').textContent=ZONES[zone];
  $('#location-sub').textContent=zone==='campus'?'An independent architectural study of uOttawa':'A stylized, unmeasured public-space preview';
  $('#building').textContent=zone==='campus'?'TABARET HALL · EXTERIOR':'TABARET HALL · ROTUNDA';
  $('#mission').textContent=zone==='campus'?'Walk to the grand entrance and press E.':'Explore the Rotunda. Return through the entrance behind you.';
  $('#coords').textContent='0.0, 0.0';
  $('#action').hidden=true;
  $('#hint').textContent=zone==='campus'?'Walk toward Tabaret’s six-column entrance.':'Explore the lower floor; upper galleries are visual previews.';
  if(zone==='campus')announce('Welcome to Tabaret Lawn');
  else announce('Entered the Tabaret Rotunda');
}
function announce(message){
  const el=$('#toast');el.textContent=message;el.hidden=false;
  clearTimeout(announce.timer);
  announce.timer=setTimeout(()=>el.hidden=true,2800);
}
function interact(){
  const action=nearbyAction(settings.zone,settings.position.x,settings.position.z);
  if(action)enterZone(action.target);
  else announce(settings.zone==='campus'?'Walk closer to the front entrance.':'Walk to the exit at the back of the Rotunda.');
}
function look(dx,dy){
  settings.yaw+=dx*.0021;
  settings.pitch=THREE.MathUtils.clamp(settings.pitch-dy*.0021,-1.22,1.22);
}
function setStarted(value){
  settings.started=value;
  $('#welcome').hidden=value;
  $('#hud').hidden=!value;
  if(value){last=performance.now();canvas.focus();}
  else {held.clear();touch.forward=0;touch.right=0;}
}
function onKey(event,down){
  if(event.target instanceof HTMLElement&&/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;
  if(keyMap[event.code]||event.code==='Space')event.preventDefault();
  if(down)held.add(event.code);else held.delete(event.code);
  if(down&&!event.repeat){
    if(event.code==='KeyE'&&settings.started)interact();
    if(event.code==='Escape'&&document.pointerLockElement!==canvas&&settings.started){
      setStarted(false);
    }
    if(event.code==='KeyH')$('#help').hidden=!$('#help').hidden;
  }
}
window.addEventListener('keydown',e=>onKey(e,true));
window.addEventListener('keyup',e=>onKey(e,false));
window.addEventListener('blur',()=>{held.clear();touch.forward=0;touch.right=0;});
window.addEventListener('resize',onResize);
document.addEventListener('visibilitychange',()=>{last=performance.now();});
canvas.addEventListener('pointerdown',e=>{
  if(!settings.started)return;
  if(e.pointerType==='mouse'){
    dragging=true;lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);
  } else if(e.pointerType==='touch'){
    lastPointer={x:e.clientX,y:e.clientY,id:e.pointerId};
  }
});
canvas.addEventListener('pointermove',e=>{
  if(!settings.started)return;
  if(document.pointerLockElement===canvas){return;}
  if(!lastPointer)return;
  if(e.pointerType==='mouse'&&!dragging)return;
  if(lastPointer.id!=null&&lastPointer.id!==e.pointerId)return;
  look(e.clientX-lastPointer.x,e.clientY-lastPointer.y);
  lastPointer={x:e.clientX,y:e.clientY,id:lastPointer.id};
});
canvas.addEventListener('pointerup',()=>{dragging=false;lastPointer=null;});
canvas.addEventListener('pointercancel',()=>{dragging=false;lastPointer=null;});
document.addEventListener('mousemove',e=>{
  if(settings.started&&document.pointerLockElement===canvas)look(e.movementX,e.movementY);
});
document.addEventListener('pointerlockchange',()=>{
  $('#capture').textContent=document.pointerLockElement===canvas?'Release mouse (Esc)':'Capture mouse';
  $('#capture').setAttribute('aria-pressed',String(document.pointerLockElement===canvas));
});
$('#begin').addEventListener('click',()=>setStarted(true));
$('#capture').addEventListener('click',()=>{
  if(document.pointerLockElement===canvas)document.exitPointerLock();
  else if(canvas.requestPointerLock)canvas.requestPointerLock();
});
$('#action').addEventListener('click',interact);
$('#quality').addEventListener('change',e=>setQuality(e.target.value));
$('#help-toggle').addEventListener('click',()=>$('#help').hidden=!$('#help').hidden);
$('#close-help').addEventListener('click',()=>$('#help').hidden=true);
$('#reset').addEventListener('click',()=>{
  settings.position={...(settings.zone==='campus'?START_POSITION:START_ROTUNDA)};
  settings.yaw=0;settings.pitch=0;
  announce('Position reset');
});
for(const btn of document.querySelectorAll('[data-touch]')){
  const value=btn.dataset.touch;
  const start=e=>{e.preventDefault();btn.setPointerCapture?.(e.pointerId);setTouch(value,true);};
  const stop=e=>{e.preventDefault();setTouch(value,false);};
  btn.addEventListener('pointerdown',start);
  btn.addEventListener('pointerup',stop);
  btn.addEventListener('pointercancel',stop);
}
function setTouch(name,pressed){
  const value=pressed?1:0;
  if(name==='up')touch.forward=value;
  if(name==='down')touch.forward=-value;
  if(name==='left')touch.right=-value;
  if(name==='right')touch.right=value;
}
function render(now){
  requestAnimationFrame(render);
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(settings.started){
    // Arrow keys are also usable to turn without pointer capture.
    if(isHeld('KeyQ'))settings.yaw-=dt*1.6;
    if(isHeld('KeyR'))settings.yaw+=dt*1.6;
    const next=movePlayer(settings.position,settings.zone,settings.yaw,movementInput(),dt,isHeld('ShiftLeft','ShiftRight'));
    settings.position={x:next.x,z:next.z};settings.moving=next.moving;
    settings.feet+=next.moving?dt*(isHeld('ShiftLeft','ShiftRight')?15:10):0;
    camera.position.set(next.x,EYE_HEIGHT+groundHeightFor(settings.zone,next.x,next.z)+(next.moving?Math.sin(settings.feet)*.023:0),next.z);
    camera.rotation.set(settings.pitch,settings.yaw,0);
    const action=nearbyAction(settings.zone,next.x,next.z);
    $('#action').hidden=!action;
    if(action)$('#action').textContent='E · '+action.label;
    $('#coords').textContent=next.x.toFixed(1)+' m, '+next.z.toFixed(1)+' m';
    fpsFrames++;
    if(now-fpsLast>1100){
      $('#fps').textContent=Math.round(fpsFrames*1000/(now-fpsLast))+' FPS';
      fpsFrames=0;fpsLast=now;
    }
  }else{
    camera.position.set(settings.position.x,EYE_HEIGHT+groundHeightFor(settings.zone,settings.position.x,settings.position.z),settings.position.z);
    camera.rotation.set(settings.pitch,settings.yaw,0);
  }
  renderer.render(scene,camera);
}
setQuality('balanced');
$('#build').textContent='V2 · '+V2_VERSION+' · EARLY PROTOTYPE';
$('#mobile-pad').hidden=supportsFinePointer;
setStarted(false);
requestAnimationFrame(render);

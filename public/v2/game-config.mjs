/**
 * GeeGeeVerse V2 — pure gameplay rules.
 * Metres are game-world units, but campus building dimensions are estimates.
 * This module is environment-independent so Node can test it without WebGL.
 */
export const V2_VERSION='0.1.0';
export const WALK_SPEED=4.1;
export const RUN_SPEED=6.8;
export const EYE_HEIGHT=1.7;
export const START_POSITION=Object.freeze({x:0,z:36});
export const START_ROTUNDA=Object.freeze({x:0,z:7.4});
export const ZONES=Object.freeze({campus:'Tabaret Lawn',rotunda:'Tabaret Rotunda'});
export const FACADES=Object.freeze({
  tabaret:{x:0,z:-17,width:72,depth:34,modelHeight:21,accuracy:'photo-inspired, not surveyed'}
});

export function canOccupy(zone,x,z){
  if(!Number.isFinite(x)||!Number.isFinite(z))return false;
  if(zone==='rotunda'){
    // Ground floor only. Public stair/upper-gallery paths are not yet surveyed.
    return Math.hypot(x,z)<10.7 || (Math.abs(x)<3.5&&z>=0&&z<9.7);
  }
  if(zone!=='campus')return false;
  if(Math.abs(x)>79||Math.abs(z)>79)return false;
  // Historic hall mass, including its rear volumes.
  if(Math.abs(x)<37.5 && z<1.6 && z>-38.5)return false;
  return true;
}

export function movePlayer(position,zone,yaw,input,delta,sprinting=false){
  const dt=Math.max(0,Math.min(.06,Number.isFinite(delta)?delta:0));
  const forward=Math.max(-1,Math.min(1,Number(input.forward)||0));
  const right=Math.max(-1,Math.min(1,Number(input.right)||0));
  const length=Math.hypot(forward,right);
  if(!length)return {...position,moving:false};
  const factor=1/Math.max(1,length);
  const speed=(sprinting?RUN_SPEED:WALK_SPEED)*dt*factor;
  const dx=(forward*Math.sin(yaw)+right*Math.cos(yaw))*speed;
  const dz=(-forward*Math.cos(yaw)+right*Math.sin(yaw))*speed;
  const next={x:position.x,z:position.z,moving:true};
  if(canOccupy(zone,next.x+dx,next.z))next.x+=dx;
  if(canOccupy(zone,next.x,next.z+dz))next.z+=dz;
  return next;
}

export function nearbyAction(zone,x,z){
  if(zone==='campus'&&Math.hypot(x,z-7)<9.2)
    return {label:'Enter Tabaret Rotunda',target:'rotunda'};
  if(zone==='rotunda'&&z>6.4&&Math.abs(x)<4.3)
    return {label:'Exit to Tabaret Lawn',target:'campus'};
  return null;
}

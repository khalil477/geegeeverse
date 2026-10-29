/**
 * GeeGeeVerse Motion Controller (beta).
 * Movement direction normalization, jump cooldown and facing interpolation adapted
 * with user-reported author permission from:
 * https://github.com/larvuz2/physics-character-controller
 * Original project: larvuz2/physics-character-controller (2025).
 * This lightweight adapter is not a full Rapier physics integration; terrain is
 * flat and campus extrusions remain non-colliding until surveyed geometry exists.
 */
export const DEFAULTS = Object.freeze({
  walkSpeed: 9, outdoorSpeed: 17, sprintMultiplier: 1.65,
  acceleration: 12, stopping: 16, gravity: 24, jumpSpeed: 8.1,
  jumpCooldown: 0.24, turnSpeed: 14,
});
export class MotionController {
  constructor(opts={}){
    this.options={...DEFAULTS,...opts};
    this.x=0;this.z=0;this.y=0;this.vx=0;this.vz=0;this.vy=0;
    this.grounded=true;this.facing=0;this.jumpCooldown=0;
    this.jumpHeld=false;
  }
  teleport(x,z){
    if(!Number.isFinite(x)||!Number.isFinite(z))throw Error('Invalid teleport');
    this.x=x;this.z=z;this.y=0;
    this.vx=this.vz=this.vy=0;this.grounded=true;
    this.jumpCooldown=0;this.jumpHeld=false;
  }
  step(seconds,input={},canWalk=()=>true){
    const dt=Math.max(0,Math.min(.05,Number(seconds)||0));
    if(!dt)return this.state();
    const o=this.options;
    const x=Number(input.right)||0, forward=Number(input.forward)||0;
    // Diagonal movement stays the same speed as cardinal movement.
    const magnitude=Math.hypot(x,forward), ax=magnitude?x/Math.max(1,magnitude):0;
    const az=magnitude?forward/Math.max(1,magnitude):0;
    const yaw=Number(input.yaw)||0,c=Math.cos(yaw),s=Math.sin(yaw);
    const speed=(input.outdoors?o.outdoorSpeed:o.walkSpeed)*(input.sprint?o.sprintMultiplier:1);
    const targetX=(ax*c+az*s)*speed,targetZ=(az*c-ax*s)*speed;
    const movement=!!magnitude;
    const smoothing=1-Math.exp(-(movement?o.acceleration:o.stopping)*dt);
    this.vx+=(targetX-this.vx)*smoothing;
    this.vz+=(targetZ-this.vz)*smoothing;
    const limit=Number.isFinite(input.limit)?input.limit:Infinity;
    const nx=Math.max(-limit,Math.min(limit,this.x+this.vx*dt));
    const nz=Math.max(-limit,Math.min(limit,this.z+this.vz*dt));
    // Sliding on obstacles: each axis checked independently.
    if(canWalk(nx,this.z))this.x=nx;else this.vx=0;
    if(canWalk(this.x,nz))this.z=nz;else this.vz=0;
    if(movement&&Math.hypot(this.vx,this.vz)>.1){
      const target=Math.atan2(this.vx,this.vz)+Math.PI;
      const delta=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing));
      this.facing+=delta*(1-Math.exp(-o.turnSpeed*dt));
    }
    this.jumpCooldown=Math.max(0,this.jumpCooldown-dt);
    const requested=!!input.jump;
    if(requested&&!this.jumpHeld&&this.grounded&&this.jumpCooldown===0){
      this.vy=o.jumpSpeed;this.grounded=false;this.jumpCooldown=o.jumpCooldown;
    }
    this.jumpHeld=requested;
    if(!this.grounded){
      this.vy-=o.gravity*dt;
      this.y+=this.vy*dt;
      if(this.y<=0){this.y=0;this.vy=0;this.grounded=true;}
    }
    return this.state();
  }
  state(){return {x:this.x,z:this.z,y:this.y,vx:this.vx,vz:this.vz,vy:this.vy,facing:this.facing,grounded:this.grounded};}
}

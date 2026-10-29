import test from 'node:test';
import assert from 'node:assert/strict';
import { MotionController } from '../public/motion-controller.mjs';
const advance=(c,input,steps=60)=>{for(let i=0;i<steps;i++)c.step(1/60,input);return c.state()};
test('move forward and left, diagonal speed normalized',()=>{
 const a=new MotionController(),b=new MotionController();
 advance(a,{forward:-1},120);advance(b,{forward:-1,right:-1},120);
 assert(a.z < -10);assert(b.x<0&&b.z<0);
 assert(Math.abs(Math.hypot(a.vx,a.vz)-Math.hypot(b.vx,b.vz))<.1);
});
test('jump once while held, lands, and can jump again after release',()=>{
 const c=new MotionController();let top=0;
 for(let i=0;i<90;i++){const s=c.step(1/60,{jump:true});top=Math.max(top,s.y);}
 assert(top>0.5);assert.equal(c.y,0);
 c.step(1/60,{jump:false});c.step(1/60,{jump:true});assert(c.y>0);
});
test('teleport clears speed and jump',()=>{
 const c=new MotionController();advance(c,{forward:-1,jump:true},10);c.teleport(10,20);
 assert.deepEqual([c.x,c.z,c.y,c.vx,c.vz,c.vy],[10,20,0,0,0,0]);
});
test('collision check allows sideways slide',()=>{
 const c=new MotionController();c.teleport(0,0);
 advance(c,{forward:-1,right:1},120);
 assert(c.x>5);
});
test('bounds and collision prevent movement through a wall',()=>{
 const c=new MotionController();
 for(let i=0;i<120;i++)c.step(1/60,{forward:-1,limit:5},(_,z)=>z>=-3);
 assert(c.z>=-3);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EYE_HEIGHT, START_POSITION, START_ROTUNDA, WALK_SPEED, RUN_SPEED,
  canOccupy, nearbyAction, movePlayer, groundHeightFor, ZONES
} from '../public/v2/game-config.mjs';

test('new V2 spawns in traversable ground, not inside Tabaret model',()=>{
 assert.equal(EYE_HEIGHT,1.7);
 assert.ok(canOccupy('campus',START_POSITION.x,START_POSITION.z));
 assert.ok(canOccupy('rotunda',START_ROTUNDA.x,START_ROTUNDA.z));
 assert.equal(canOccupy('campus',0,-5),false);
 assert.equal(canOccupy('rotunda',20,0),false);
 assert.equal(canOccupy('other',0,0),false);
 assert.equal(ZONES.rotunda,'Tabaret Rotunda');
});
test('player movement is normalized, bounded and blocks facade penetration',()=>{
 const start={x:0,z:21};
 const next=movePlayer(start,'campus',0,{forward:1,right:0},1,false);
 assert.ok(next.z<start.z);
 assert.ok(start.z-next.z<=WALK_SPEED*.06+.0001,'movement clamps long frame');
 const diagonal=movePlayer(start,'campus',0,{forward:1,right:1},.06,false);
 assert.ok(Math.hypot(diagonal.x,diagonal.z-start.z)<=WALK_SPEED*.06+.0001);
 const sprint=movePlayer(start,'campus',0,{forward:1,right:0},.06,true);
 assert.ok(start.z-sprint.z>start.z-next.z);
 assert.ok(start.z-sprint.z<=RUN_SPEED*.06+.0001);
 let pos={x:0,z:2.1};
 for(let i=0;i<200;i++)pos=movePlayer(pos,'campus',0,{forward:1,right:0},.06,true);
 assert.ok(pos.z>=1.6,'must not cross main facade collider');
});
test('stair camera follows estimated approach elevation',()=>{
 assert.equal(groundHeightFor('campus',0,14),0);
 assert.ok(groundHeightFor('campus',0,8)>1);
 assert.equal(groundHeightFor('rotunda',0,8),0);
 assert.equal(groundHeightFor('campus',25,8),0);
});
test('outdoor portal and Rotunda exit require proximity',()=>{
 assert.equal(nearbyAction('campus',0,10).target,'rotunda');
 assert.equal(nearbyAction('campus',0,35),null);
 assert.equal(nearbyAction('rotunda',0,START_ROTUNDA.z),null,'newly entered visitor should not immediately exit');
 assert.equal(nearbyAction('rotunda',0,8.3).target,'campus');
 assert.equal(nearbyAction('rotunda',9,8.3),null);
});
test('movement guards invalid or unknown input',()=>{
 assert.equal(canOccupy('campus',NaN,2),false);
 assert.equal(canOccupy('rotunda',0,Infinity),false);
 assert.deepEqual(movePlayer({x:0,z:15},'campus',0,{forward:0,right:0},.01),{x:0,z:15,moving:false});
});

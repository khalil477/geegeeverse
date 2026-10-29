import test from 'node:test';
import assert from 'node:assert/strict';
import { canStandAt, findSafePosition } from '../public/spawn-utils.mjs';
import { pointInPolygon, CAMPUS_SQUARE } from '../public/geo-utils.mjs';
const building={rings:[[{x:-65,z:86},{x:-30,z:86},{x:-30,z:130},{x:-65,z:130},{x:-65,z:86}]],bounds:{minx:-65,maxx:-30,minz:86,maxz:130}};
test('hard-coded FSS spawn is recognized as blocked and moved outside',()=>{
  assert.equal(canStandAt(-42,110,[building]),false);
  const safe=findSafePosition(-42,110,[building]);
  assert.equal(safe.found,true);
  assert.equal(safe.moved,true);
  assert.equal(canStandAt(safe.x,safe.z,[building],3.5),true);
  assert.equal(pointInPolygon(safe.x,safe.z,building.rings),false);
});
test('safe outdoor spawn remains unchanged',()=>{
 const point={x:CAMPUS_SQUARE.x,z:CAMPUS_SQUARE.z};
 assert.deepEqual(findSafePosition(point.x,point.z,[building]),{...point,moved:false,found:true});
});
test('coordinates stay in world bounds and cannot spawn in footprint',()=>{
 assert.equal(canStandAt(Infinity,0),false);
 assert.equal(canStandAt(3000,0),false);
 const safe=findSafePosition(-42,110,[building],{clearance:8});
 assert.equal(canStandAt(safe.x,safe.z,[building],8),true);
});

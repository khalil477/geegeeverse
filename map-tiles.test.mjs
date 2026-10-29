import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tilePosition,tileLon,tileLat,tileWorldBounds,tilesNear} from '../public/map-tiles.mjs';
import {project} from '../public/geo-utils.mjs';
test('slippy tile round trip retains Ottawa coordinates',()=>{
  const lon=-75.6831,lat=45.4225,z=17;
  const t=tilePosition(lon,lat,z);
  assert.ok(Math.abs(tileLon(t.x,z)-lon)<1e-9);
  assert.ok(Math.abs(tileLat(t.y,z)-lat)<1e-9);
  const b=tileWorldBounds(z,Math.floor(t.x),Math.floor(t.y),project);
  const p=project(lon,lat);
  assert.ok(b.west<p.x&&p.x<b.east);
  assert.ok(b.north<p.z&&p.z<b.south);
});
test('tile viewport never preloads the entire campus',()=>{
  const arr=tilesNear(-75.6831,45.4225,17,50);
  assert.ok(arr.length>=1 && arr.length<=9);
  assert.ok(arr.every(t=>t.z===17));
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ORIGIN,CAMPUS_LANDMARKS,project,unproject,projectedPolygons,pointInPolygon,polygonBounds,CAMPUS_SQUARE} from '../public/geo-utils.mjs';
import {getCampusGeodata} from '../campus-data.mjs';

test('geographic projection is accurate locally and north stays up',()=>{
  const {x,z}=project(-75.68045,45.42026);
  assert.ok(x>0&&z>0,'STEM should lie east and south of map origin');
  const p=unproject(x,z);assert.ok(Math.abs(p.lon+75.68045)<1e-9);assert.ok(Math.abs(p.lat-45.42026)<1e-9);
  const t=CAMPUS_LANDMARKS.find(x=>x.abbr==='TBT');
  const m=CAMPUS_LANDMARKS.find(x=>x.abbr==='MRT');
  const s=CAMPUS_LANDMARKS.find(x=>x.abbr==='STM');
  assert.ok(t.x<m.x);assert.ok(t.z<m.z);
  assert.ok(s.z>m.z);assert.ok(CAMPUS_SQUARE.x>-30&&CAMPUS_SQUARE.x<30);
});

test('polygon footprints project to a real-size collision surface',()=>{
  const coords=[[-75.6832,45.4226],[-75.6830,45.4226],[-75.6830,45.4224],[-75.6832,45.4224],[-75.6832,45.4226]];
  const poly=projectedPolygons({geometry:{type:'Polygon',coordinates:[coords]}})[0];
  assert.equal(poly.length,1);assert.ok(pointInPolygon(0,0,poly));assert.equal(pointInPolygon(35,35,poly),false);
  const box=polygonBounds(poly[0]);assert.ok(box.maxx-box.minx>12&&box.maxz-box.minz>20);
});

test('city GIS adapter deduplicates repeated polygons across tiles',async()=>{
 const square=[[-75.6832,45.4226],[-75.6830,45.4226],[-75.6830,45.4224],[-75.6832,45.4224],[-75.6832,45.4226]];
 const stub=async()=>({ok:true,json:async()=>({type:'FeatureCollection',features:[{type:'Feature',id:44,properties:{OBJECTID:44},geometry:{type:'Polygon',coordinates:[square]}}]})});
 const data=await getCampusGeodata(stub);assert.equal(data.ok,true);
 for(const k of ['buildings','sidewalks','paths']){assert.equal(data.layers[k].length,1);assert.equal(data.failures[k].successfulTiles,4);}
});

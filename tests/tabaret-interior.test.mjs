import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTabaretInterior } from '../public/tabaret-interior.mjs';

function mockThree(){
 const pos=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}});
 class Node {constructor(){this.children=[];this.position=pos();this.rotation={x:0,y:0,z:0};this.quaternion={setFromUnitVectors(){}};}add(x){this.children.push(x);}}
 class Geometry {constructor(...args){this.args=args;}}
 class Mesh extends Node {constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
 class Vector3 {constructor(x,y,z){Object.assign(this,{x,y,z});}length(){return Math.hypot(this.x,this.y,this.z);}normalize(){const len=this.length()||1;this.x/=len;this.y/=len;this.z/=len;return this;}}
 class HemisphereLight extends Node {}
 class Color {constructor(value){this.value=value;}}
 class CanvasTexture {constructor(canvas){this.canvas=canvas;}}
 class Material {constructor(props){Object.assign(this,props);}}
 return {THREE:{Mesh,BoxGeometry:Geometry,PlaneGeometry:class PlaneGeometry extends Geometry {},CylinderGeometry:Geometry,TorusGeometry:Geometry,RingGeometry:class RingGeometry extends Geometry{},SphereGeometry:class SphereGeometry extends Geometry{},Color,Vector3,HemisphereLight,CanvasTexture,MeshStandardMaterial:Material,DoubleSide:2,SRGBColorSpace:'srgb'},Node};
}

test('Tabaret Rotunda is walkable with reference-based architectural features',()=>{
 const previous=globalThis.document;
 globalThis.document={createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(){return {fillStyle:'',fillRect(){}};}}}};
 try{
  const {THREE,Node}=mockThree(),scene=new Node(),labels=[];
  const data=buildTabaretInterior({THREE,scene,sign:(...args)=>labels.push(args)});
  assert.equal(data.space,'tabaret');
  assert.ok(data.features.includes('skylight'));
  assert.ok(data.features.includes('balconies'));
  assert.ok(data.features.includes('checker-floor'));
  assert.ok(scene.children.length>450,'rotunda columns, railings, floor and benches should be present');
  assert.ok(scene.children.length<750,'avoid thousands of unbatched floor-tile meshes');
  assert.ok(scene.children.some(x=>x instanceof THREE.Mesh && x.geometry instanceof THREE.PlaneGeometry),'floor should use a single checkered plane');
  assert.ok(scene.children.some(x=>x instanceof THREE.Mesh && x.geometry instanceof THREE.SphereGeometry),'glass dome should exist');
  assert.ok(labels.some(l=>l[0]==='EXIT TO CAMPUS'));
  assert.ok(labels.some(l=>l[0]==='ROTUNDA'));
  assert.ok(labels.some(l=>l[0]==='HUGUETTE LABELLE'));
  assert.ok(labels.some(l=>l[0]==='TBT 333'), 'upper-floor classroom preview marker remains present');
  assert.equal(scene.children.filter(x=>x instanceof THREE.Mesh && x.geometry instanceof THREE.RingGeometry).length,3,'upper galleries keep a circular open well');
 }finally{globalThis.document=previous;}
});

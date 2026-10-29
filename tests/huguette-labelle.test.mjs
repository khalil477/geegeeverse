import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHuguetteLabelle } from '../public/huguette-labelle.mjs';

const pos=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}});
class Node {constructor(){this.children=[];this.position=pos();this.rotation={x:0,y:0,z:0};}add(mesh){this.children.push(mesh);}}
class Geometry {constructor(...args){this.args=args;}}
class Mesh extends Node {constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
class CanvasTexture {constructor(canvas){this.canvas=canvas;}}
class Material {constructor(props){Object.assign(this,props);}}
const THREE={Mesh,BoxGeometry:Geometry,CylinderGeometry:Geometry,
 PlaneGeometry:class PlaneGeometry extends Geometry {},
 CanvasTexture,MeshStandardMaterial:Material,
 HemisphereLight:class HemisphereLight extends Node {},
 PointLight:class PointLight extends Node {},
 DoubleSide:2,SRGBColorSpace:'srgb'};

test('TBT112 event hall reflects documented area and recognisable architectural features',()=>{
 const previous=globalThis.document;
 globalThis.document={createElement(tag){
  assert.equal(tag,'canvas');
  return {width:0,height:0,getContext(){return {fillStyle:'',fillRect(){}}}};
 }};
 try {
  const scene=new Node(),labels=[];
  const result=buildHuguetteLabelle({THREE,scene,sign:(...values)=>labels.push(values)});
  assert.equal(result.room,'tabaret112');
  assert.equal(result.verifiedAreaSqM,287.3);
  assert.ok(Math.abs(result.modelAreaSqM-result.verifiedAreaSqM)<1);
  assert.equal(result.dimensionsEstimated,true);
  assert.equal(result.stainedGlass,true);
  assert.equal(result.cofferedCeiling,true);
  assert.equal(result.stage,true);
  assert.ok(result.seatCount>40);
  assert.ok(scene.children.length>200);
  assert.ok(labels.some(([label])=>label==='ROTUNDA'));
  assert.ok(labels.some(([label])=>label==='HUGUETTE LABELLE'));
 } finally {globalThis.document=previous;}
});

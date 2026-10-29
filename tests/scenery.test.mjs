import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCampusScenery } from '../public/campus-scenery.mjs';
import { CAMPUS_LANDMARKS, CAMPUS_SQUARE } from '../public/geo-utils.mjs';

const position=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}});
class Node {constructor(){this.children=[];this.position=position();this.rotation={x:0,y:0,z:0};} add(o){this.children.push(o);}}
class Mesh extends Node {constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
class Geometry {constructor(...args){this.args=args;}}
class Color {constructor(value){this.value=value;}}
class Shape {constructor(){this.points=[];}moveTo(x,y){this.points.push([x,y]);}lineTo(x,y){this.points.push([x,y]);}}
const THREE={
  Mesh, Group:Node, BoxGeometry:Geometry, CylinderGeometry:Geometry,
  IcosahedronGeometry:Geometry, Shape, ExtrudeGeometry:Geometry,
  MeshStandardMaterial:class{constructor(properties){this.properties=properties;}},
  Color, Fog:class{constructor(...args){this.args=args;}}
};

test('unified scenery preserves landmarks and classroom entrance markers',()=>{
  const scene=new Node(),labels=[];
  const result=buildCampusScenery({
    THREE,scene,landmarks:CAMPUS_LANDMARKS,square:CAMPUS_SQUARE,
    landingOutside:b=>({x:b.x+7,z:b.z+21}),
    sign:(...args)=>labels.push(args)
  });
  assert.equal(result.landmarks,CAMPUS_LANDMARKS.length);
  for(const landmark of CAMPUS_LANDMARKS)assert.ok(labels.some(l=>l[0]===landmark.name));
  assert.equal(labels.filter(l=>l[0]==='ENTER · E').length,CAMPUS_LANDMARKS.filter(b=>b.room).length);
  assert.ok(scene.children.length>100);
});

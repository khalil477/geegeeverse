import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTabaretExterior} from '../public/tabaret-architecture.mjs';

const p=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}});
class Group {
  constructor(){this.position=p();this.rotation={x:0,y:0,z:0};this.children=[];}
  add(o){this.children.push(o);}
}
class CylinderGeometry {constructor(a,b,h,segments){this.a=a;this.b=b;this.h=h;this.segments=segments;}}
class ExtrudeGeometry {constructor(shape,options){this.shape=shape;this.options=options;}}
class Shape {constructor(){this.vertices=[];}moveTo(x,y){this.vertices.push([x,y]);}lineTo(x,y){this.vertices.push([x,y]);}}
class Mesh extends Group {constructor(geometry,mat){super();this.geometry=geometry;this.material=mat;}}
test('Tabaret reference facade includes six columns, pediment and east orientation',()=>{
  const THREE={Mesh,CylinderGeometry,ExtrudeGeometry,Shape};
  const group=new Group();
  const box=(w,h,d,x,y,z,color,parent)=>{const o=new Mesh({type:'box',w,h,d},{color});o.position.set(x,y,z);parent.add(o);return o;};
  const result=buildTabaretExterior({THREE,group,box,material:hex=>({hex}),width:54,height:19,depth:38});
  assert.equal(result.columns,6);
  assert.equal(result.eastFacing,true);
  assert.equal(group.rotation.y,Math.PI/2);
  assert.equal(group.children.filter(o=>o.geometry instanceof CylinderGeometry&&o.geometry.a===.73).length,6);
  const pediment=group.children.find(o=>o.geometry instanceof ExtrudeGeometry);
  assert.ok(pediment);
  assert.ok(pediment.geometry.shape.vertices.length>=4);
});

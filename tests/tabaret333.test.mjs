import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTabaret333 } from '../public/tabaret333.mjs';

const position=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}});
class Scene {constructor(){this.children=[];this.position=position();this.rotation={x:0,y:0,z:0};}add(item){this.children.push(item);}}
class Geometry {constructor(...args){this.args=args;}}
class Mesh extends Scene {constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
class Material {constructor(args){Object.assign(this,args);}}
class Color {constructor(rgb){this.rgb=rgb;}}
const THREE={Mesh,BoxGeometry:Geometry,PlaneGeometry:Geometry,MeshStandardMaterial:Material,Color,DoubleSide:2,HemisphereLight:Scene};

test('TBT333 classroom preview has curved seating, blue chairs and return portal',()=>{
 const scene=new Scene(),labels=[];
 const result=buildTabaret333({THREE,scene,sign:(...args)=>labels.push(args)});
 assert.equal(result.room,'tabaret333');
 assert.equal(result.photoBased,true);
 assert.equal(result.dimensionsEstimated,true);
 assert.ok(result.chairs>=40);
 assert.ok(scene.children.length>=200);
 assert.ok(labels.some(([label])=>label==='TBT 333'));
 assert.ok(labels.some(([label])=>label==='ROTUNDA'));
});

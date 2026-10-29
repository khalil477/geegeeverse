/**
 * Tabaret Hall TBT 333 teaching space — public-photo-inspired preview.
 * University reference: https://www.uottawa.ca/about-us/information-technology/services/classrooms-and-equipment/tabaret-hall-teaching-spaces-layout-0
 * The official TBT333 panorama shows curved white writing tables, blue chairs,
 * a projection screen and overhead rectangular light panels.
 * Desk count, exact curvature, aisle widths, dimensions and location of the doors
 * are NOT verified. Original meshes only; no copyrighted photo is embedded.
 */
export function buildTabaret333({THREE,scene,sign}){
 if(!THREE||!scene||!sign)throw Error('TBT333 needs Three.js and a scene');
 const mats=new Map(),geo=new Map();
 const m=(hex)=>{if(!mats.has(hex))mats.set(hex,new THREE.MeshStandardMaterial({color:hex,roughness:.83}));return mats.get(hex)};
 const box=(w,h,d,x,y,z,hex,rotation=0)=>{
  const key=[w,h,d].join('/');if(!geo.has(key))geo.set(key,new THREE.BoxGeometry(w,h,d));
  const mesh=new THREE.Mesh(geo.get(key),m(hex));
  mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.receiveShadow=true;scene.add(mesh);return mesh;
 };
 scene.background=new THREE.Color(0xf1efe9);scene.fog=null;
 box(21,.34,20.5,0,-.27,0,0xd6c8b0);
 box(21.2,7.1,.4,0,3.55,-10.25,0xeceae5);
 for(const x of [-10.55,10.55])box(.35,7.1,20.5,x,3.55,0,0xeceae5);
 for(const x of [-6.6,6.6])box(8,7.1,.4,x,3.55,10.25,0xeceae5);
 box(5.2,2.7,.4,0,5.75,10.25,0xeceae5);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20.8,20.2),new THREE.MeshStandardMaterial({color:0xb5a990,roughness:.88}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.07;scene.add(floor);
 // Left and right front chalkboards plus projected central screen.
 box(5.5,3.2,.16,-6.6,3.7,-10,0x467066);
 box(5.5,3.2,.16,6.6,3.7,-10,0x467066);
 box(6.1,3.8,.19,0,3.9,-9.9,0xf5f4f0);
 box(6.7,.25,.35,0,6.08,-9.9,0x939e9d);
 // Instructor table and display console.
 box(3.4,.20,1.1,2.7,1.35,-7.75,0xd7d4c8);
 box(1.0,1.3,.8,-3.4,.65,-7.2,0x677780);
 box(1.1,.62,.12,-3.4,1.56,-7.2,0x404c58);
 // Series of curved writing surfaces; student seating is illustrative.
 let chairs=0;
 const deskTop=0xe5e3d9,seat=0x375e90,legs=0x6e7074;
 for(let row=0;row<4;row++){
  const radius=4.4+row*1.5;
  for(let j=0;j<13;j++){
   const a=-1.05+j*2.1/12;
   const x=Math.sin(a)*radius,z=-7.4+Math.cos(a)*radius;
   if(Math.abs(x)>9.1||z>7.1)continue;
   // The desks are straight segments approximating a curved classroom row.
   box(.95,.16,.52,x,.95,z,deskTop,a);
   box(.065,.88,.065,x,.44,z,legs);
   const bx=x+Math.sin(a)*.46,bz=z+Math.cos(a)*.62;
   box(.72,.19,.65,bx,.53,bz,seat,a);
   box(.72,.72,.16,bx,.98,bz+.30,seat,a);
   chairs++;
  }
 }
 // Ceiling grid: the panoramic image shows fluorescent rectangular panels.
 box(21,.25,20.5,0,7.14,0,0xe8e8e4);
 for(let x=-8.4;x<=8.5;x+=2.8)for(let z=-8.0;z<=8.0;z+=4.0)
  box(1.5,.075,2.65,x,6.98,z,0xfaf9e5);
 // A simple projector, no reproduced source slides.
 box(.8,.55,.7,0,6.1,0,0x555e64);
 box(.12,1.0,.12,0,6.62,0,0x555e64);
 // Frosted side windows on one exterior wall.
 for(let z=-5;z<=5;z+=3.3){
  box(.15,2.2,2.1,10.35,3.8,z,0x98c0cc);
  box(.18,.12,2.15,10.28,4.9,z,0xe7e3d7);
 }
 sign('TBT 333','Lecture space · photo-inspired preview',0,6.0,-8.6,19);
 sign('ROTUNDA','Preview exit · press E',0,3.0,8.1,17);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8d9387,1.35));
 return {room:'tabaret333',chairs,photoBased:true,dimensionsEstimated:true};
}

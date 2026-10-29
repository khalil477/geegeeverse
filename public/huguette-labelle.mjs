/**
 * Huguette Labelle Hall (TBT 112): public event-space visual reconstruction.
 * Reference: https://www.uottawa.ca/about-us/reservations/spaces/special-event/huguette-labelle
 * Publicly verified: 287.3 m² room area, former chapel, coffered ceiling,
 * tall pilasters, stained-glass windows, balcony, stage and event seating.
 * The 18 x 16 m rectangle matches the *area* (~288 m²), not surveyed dimensions.
 * Stage, galleries and doors are illustrative; no restricted spaces modelled.
 */
export function buildHuguetteLabelle({THREE,scene,sign}) {
  if(!THREE||!scene||typeof sign!=='function')throw Error('Hall renderer requires Three.js, scene and sign');
  const palettes=new Map(),geometry=new Map(),room={width:18,depth:16,height:13.5,area:287.3};
  const material=(color,props={})=>{
    const k=color+'/'+JSON.stringify(props);
    if(!palettes.has(k))palettes.set(k,new THREE.MeshStandardMaterial({color,roughness:.82,...props}));
    return palettes.get(k);
  };
  const ivory=material(0xf1e9e0),white=material(0xfff8ec),gold=material(0xd5b890);
  const stone=material(0xd8c8b3),oak=material(0x624f43),curtain=material(0x7d7177);
  const windowMat=material(0x94c5cc,{emissive:0x537990,emissiveIntensity:.24,roughness:.3});
  const box=(w,h,d,x,y,z,m,rotate=0)=>{
    const k=[w,h,d].join(':');
    if(!geometry.has(k))geometry.set(k,new THREE.BoxGeometry(w,h,d));
    const o=new THREE.Mesh(geometry.get(k),m);
    o.position.set(x,y,z);o.rotation.y=rotate;o.receiveShadow=true;scene.add(o);return o;
  };
  const cyl=(r1,r2,h,x,y,z,m,sides=12)=>{
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,sides),m);
    o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);return o;
  };
  const grid=document.createElement('canvas');grid.width=768;grid.height=768;
  const g=grid.getContext('2d');const tiles=24,px=grid.width/tiles;
  for(let x=0;x<tiles;x++)for(let z=0;z<tiles;z++){
    g.fillStyle=(x+z)%2?'#e6dfd5':'#c7b8a7';g.fillRect(x*px,z*px,px,px);
    g.fillStyle='#bca998';g.fillRect(x*px+1,z*px+1,px-2,1);
  }
  const tileTexture=new THREE.CanvasTexture(grid);tileTexture.colorSpace=THREE.SRGBColorSpace;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(room.width,room.depth),new THREE.MeshStandardMaterial({map:tileTexture,roughness:.9,side:THREE.DoubleSide}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.07;floor.receiveShadow=true;scene.add(floor);
  box(18.4,.36,16.4,0,-.36,0,stone);
  box(.45,room.height,16.5,-9.3,room.height/2,0,ivory);
  box(.45,room.height,16.5,9.3,room.height/2,0,ivory);
  box(18.5,room.height,.38,0,room.height/2,-8.15,ivory);
  // Southern entrance has an open doorway and exterior lobby illusion.
  for(const x of [-5.5,5.5])box(7.4,room.height,.38,x,room.height/2,8.12,ivory);
  box(4,room.height-5.2,.38,0,(room.height+5.2)/2,8.12,ivory);
  // Coffered ceiling: panels, gold-moulded beams and pendant fixtures.
  box(18.4,.38,16.4,0,13.7,0,ivory);
  for(let x=-7.9;x<=7.9;x+=3.16)box(.19,.35,16.15,x,13.37,0,gold);
  for(let z=-6.4;z<=6.4;z+=3.2)box(18.2,.35,.19,0,13.37,z,gold);
  for(let x=-6.3;x<=6.3;x+=3.16)for(let z=-4.8;z<=4.8;z+=3.2)
    box(2.36,.06,2.36,x,13.18,z,material(0xe2dbd4));
  // Pilasters and arches along the walls, inspired by photo references.
  for(let side of [-1,1])for(let z=-6.3;z<=6.3;z+=3.15){
    const x=side*8.82;
    box(.75,11.4,.73,x,5.7,z,white);
    box(1.1,.45,1.06,x,11.6,z,gold);
    box(1.1,.37,1.12,x,.36,z,stone);
    const glass=box(.11,5.15,1.78,side*9.08,5.6,z+1.5,windowMat);
    glass.material.side=THREE.DoubleSide;
    // Stained glass bands: abstract geometry, not copied real-world artwork.
    for(let j=0;j<4;j++){
      const stripe=material([0x94aaac,0xc2ab87,0x939ea3,0xddd0b9][j]);
      box(.12,.15,1.78,side*9.16,3.6+j*1.1,z+1.5,stripe);
    }
  }
  // Rear upper gallery: decor only, with carved white parapet and vertical balusters.
  box(17.5,.5,3,0,8.9,6.35,ivory);
  for(let x=-8;x<=8;x+=.9)box(.18,2.15,.2,x,10.17,4.65,stone);
  box(17.5,.3,.5,0,11.22,4.65,white);
  for(let x of [-6.3,0,6.3])box(1.1,2.5,.55,x,10.1,4.7,ivory);
  // Stage and familiar curtain arrangement at the north end.
  box(17.5,.75,4.1,0,.37,-5.85,stone);
  for(let step=0;step<3;step++)box(16.5,.20,1.1,0,.15+step*.20,-3.85-step*.68,stone);
  for(let x=-8.2;x<=8.2;x+=3.28){
    box(.78,11.8,.9,x,5.9,-7.65,white);
    box(1.12,.52,1.05,x,12.0,-7.65,gold);
  }
  box(7.1,7.5,.3,0,5.05,-7.8,curtain);
  box(7.6,.55,.6,0,9.05,-7.65,gold);
  // A few rows of event seating, leaving a central aisle for walking.
  const chair=material(0x44474d),metal=material(0x36393d,{metalness:.25});
  let count=0;
  for(let z=-1.6;z<=4.6;z+=1.55)for(let x=-7.4;x<=7.4;x+=1.15){
    if(Math.abs(x)<1.12)continue;
    box(.86,.23,.68,x,.56,z,chair);
    box(.86,.78,.16,x,.94,z-.36,chair);
    for(const dx of [-.29,.29])box(.08,.45,.08,x+dx,.23,z,metal);
    count++;
  }
  // Single simplified concert piano, without licensed insignia.
  box(2.2,1.12,1.45,-4.1,1.25,-6,material(0x2e2b2a,{metalness:.24}));
  for(let k=0;k<12;k++)box(.115,.025,.48,-5.05+k*.16,1.86,-5.45,k%3===0?metal:white);
  box(1.0,1.5,.8,3.3,1.12,-6.1,oak);
  box(1.25,.15,1,3.3,1.95,-6.1,oak);
  sign('HUGUETTE LABELLE','TABARET 112 · HISTORIC EVENT HALL',0,5.3,-6.75,20);
  sign('ROTUNDA','Return to Tabaret · press E',0,3.7,7.55,17);
  scene.add(new THREE.HemisphereLight(0xfff5db,0xa49f91,1.1));
  for(const x of [-5,0,5])for(const z of [-2,4]) {
    const light=new THREE.PointLight(0xffe7ca,.9,13);
    light.position.set(x,10.7,z);scene.add(light);
    cyl(.21,.21,.14,x,10.8,z,white);
  }
  return {room:'tabaret112',verifiedAreaSqM:287.3,modelAreaSqM:288,dimensionsEstimated:true,seatCount:count,stainedGlass:true,cofferedCeiling:true,stage:true};
}

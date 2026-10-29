/**
 * GeeGeeVerse V2: independent, photo-inspired architectural prototype.
 * This renders only original procedural geometry, not scraped photography.
 * No building footprint, interior route or elevation is claimed as surveyed.
 */
export function buildCampusWorld(THREE,scene){
  const outdoors=new THREE.Group(),rotunda=new THREE.Group();
  scene.add(outdoors,rotunda);
  const materials=new Map(),geometries=new Map(),lights=[];
  const mat=(hex,props={})=>{
    const key=hex+'|'+JSON.stringify(props);
    if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color:hex,roughness:.86,...props}));
    return materials.get(key);
  };
  const basic=(w,h,d,x,y,z,color,group=outdoors,props={})=>{
    const key=[w,h,d].join('/');
    if(!geometries.has(key))geometries.set(key,new THREE.BoxGeometry(w,h,d));
    const mesh=new THREE.Mesh(geometries.get(key),typeof color==='number'?mat(color,props):color);
    mesh.position.set(x,y,z);mesh.castShadow=h>.6;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const cylinder=(radiusTop,radiusBottom,h,x,y,z,color,group=outdoors,sides=22)=>{
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,h,sides),typeof color==='number'?mat(color):color);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const orb=(radius,x,y,z,color,group=outdoors,width=14,height=10)=>{
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,width,height),typeof color==='number'?mat(color):color);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const plane=(w,d,x,y,z,material,group=outdoors)=>{
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material);mesh.rotation.x=-Math.PI/2;
    mesh.position.set(x,y,z);mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const texture=(colors,lines=false)=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const g=canvas.getContext('2d'),scale=16;
    for(let iy=0;iy<16;iy++)for(let ix=0;ix<16;ix++){
      let n=(ix*11+iy*23+ix*iy*7+Math.floor(Math.sin(ix*3+iy*7)*9));
      n=Math.abs(n)%colors.length;
      g.fillStyle=colors[n];g.fillRect(ix*scale,iy*scale,scale+1,scale+1);
      if(lines){g.fillStyle='rgba(50,45,37,.08)';g.fillRect(ix*scale,iy*scale,scale+1,1);}
    }
    const map=new THREE.CanvasTexture(canvas);map.wrapS=THREE.RepeatWrapping;map.wrapT=THREE.RepeatWrapping;
    map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
  };
  const grassMap=texture(['#526f4f','#577756','#607e5b','#628560','#58774f','#658464']);
  grassMap.repeat.set(24,24);
  const stoneMap=texture(['#bdb5a5','#c6bcaa','#c9bfaf','#bdb3a1','#d2c7b4','#b9b2a5'],true);
  stoneMap.repeat.set(5,2);
  const pathMap=texture(['#b6b0a2','#c4bdb0','#b8b0a4','#cbc2b6','#b8b4aa'],true);
  pathMap.repeat.set(10,10);
  const grass=mat(0xffffff,{map:grassMap,roughness:1});
  const limestone=mat(0xffffff,{map:stoneMap,roughness:.9});
  const paving=mat(0xffffff,{map:pathMap,roughness:.93});
  const trim=mat(0xe8decc),lightTrim=mat(0xf7e8d0),slate=mat(0x4c5358,{roughness:.72});
  const windowGlass=mat(0x607580,{metalness:.14,roughness:.26});
  const windowFrame=mat(0xe7ded0),shadowMetal=mat(0x343a3b,{metalness:.28,roughness:.5});
  const entryGlass=mat(0x3b555b,{metalness:.22,roughness:.19,transparent:true,opacity:.86});
  plane(170,170,0,-.12,0,grass);
  basic(170,.2,6,0,-.22,59,0x606b70);
  basic(170,.2,6,0,-.22,-59,0x606b70);
  plane(11,45,0,-.085,29,paving);
  plane(41,9.4,0,-.07,13,paving);
  plane(8,58,-51,-.075,12,paving);
  plane(8,58,51,-.075,12,paving);
  // Named but intentionally modelled only as a photographic study.
  const tabaret=new THREE.Group();outdoors.add(tabaret);
  const box=(w,h,d,x,y,z,color)=>basic(w,h,d,x,y,z,color,tabaret);
  const col=(rt,rb,h,x,y,z,color,s=22)=>cylinder(rt,rb,h,x,y,z,color,tabaret,s);
  // Massive neoclassical limestone wings and an elevated central portico.
  box(72,16.6,33.8,0,11.5,-16.7,limestone);
  box(73.1,1.2,35.0,0,20.35,-16.7,trim);
  box(72.5,.9,35.1,0,19.33,-16.7,lightTrim);
  box(75,.45,36.1,0,3.1,-16.7,trim);
  box(75,.55,36.1,0,2.66,-16.7,limestone);
  box(74,.65,35.2,0,21.2,-16.7,slate);
  box(16,4,25,0,22.6,-18,slate);
  box(22,2,16,-26,22,-17,slate);
  box(22,2,16,26,22,-17,slate);
  // The two wings get recessed arched windows and cream lintels.
  const arches=[-32,-26.5,-21,-15.5,15.5,21,26.5,32];
  for(const x of arches){
    for(const y of [7.0,14.25]){
      box(3.0,4.35,.14,x,y,.42,trim);
      box(2.58,3.7,.18,x,y,.55,windowGlass);
      box(.17,3.8,.25,x,y,.75,windowFrame);
      box(2.6,.18,.29,x,y+.35,.77,windowFrame);
      box(3.35,.34,.36,x,y+2.43,.63,lightTrim);
      box(3.3,.30,.42,x,y-2.32,.63,trim);
    }
  }
  // A six-column central porch, broad stair and triangular pediment.
  box(35,3.3,10,0,3.05,4.25,limestone);
  for(let step=0;step<7;step++)
    box(34.5+step*.25,.28,1.18,0,.2+step*.42,11.2-step*.83,step%2?trim:limestone);
  const columnX=[-14.1,-8.45,-2.8,2.8,8.45,14.1];
  for(const x of columnX){
    box(2.65,.5,2.7,x,4.95,5.65,trim);
    col(.85,.96,12.2,x,11.3,5.65,lightTrim,24);
    col(1.16,.92,.65,x,17.67,5.65,trim,24);
    box(2.8,.4,2.4,x,18.15,5.65,trim);
    // Low-cost fluting: discrete ribs visible at architectural scale.
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      col(.052,.052,11.4,x+Math.sin(a)*.93,11.2,5.65+Math.cos(a)*.93,trim,6);
    }
  }
  box(36.9,1.1,10.1,0,18.9,4.35,lightTrim);
  box(38.4,1.0,11.0,0,19.92,4.35,trim);
  const triangle=new THREE.Shape();
  triangle.moveTo(-19.5,0);triangle.lineTo(19.5,0);triangle.lineTo(0,6.3);triangle.closePath();
  const pediment=new THREE.Mesh(new THREE.ExtrudeGeometry(triangle,{depth:1.0,bevelEnabled:false}),trim);
  pediment.position.set(0,20.42,8.65);pediment.castShadow=true;tabaret.add(pediment);
  const insetShape=new THREE.Shape();
  insetShape.moveTo(-15.8,0);insetShape.lineTo(15.8,0);insetShape.lineTo(0,5.0);insetShape.closePath();
  const inset=new THREE.Mesh(new THREE.ExtrudeGeometry(insetShape,{depth:.11,bevelEnabled:false}),mat(0xb6aa95));
  inset.position.set(0,20.8,9.73);tabaret.add(inset);
  // Recessed public entrance; invisible trigger is handled in game-config.
  box(7.1,8.2,.2,0,7.4,.57,shadowMetal);
  box(5.8,7.2,.27,0,7.3,.78,entryGlass);
  box(.19,7.3,.27,0,7.3,.99,lightTrim);
  box(5.8,.19,.28,0,9.1,1.0,lightTrim);
  box(8.2,.65,1.1,0,11.7,1.15,trim);
  // Roof seam stripes and masonry courses.
  for(let y=5.0;y<19;y+=3.2)box(72.2,.14,.25,0,y,.6,trim);
  for(let x=-35;x<=35;x+=4.8){
    const vertical=box(.1,15.8,.25,x,11.1,-.05,trim);
    vertical.castShadow=false;
  }
  // A landscaped campus lawn, benches and light posts.
  function tree(x,z,scale){
    col(.23*scale,.32*scale,3.8*scale,x,1.9*scale,z,0x655143,10);
    const green=[0x385b43,0x45674b,0x547750,0x466b4a,0x688056];
    for(let j=0;j<7;j++){
      const a=j*2.4+scale;
      const dx=Math.sin(a)*1.1*scale,dz=Math.cos(a)*1.05*scale;
      const crown=orb((1.2+(j%3)*.16)*scale,x+dx,(4.45+(j%4)*.31)*scale,z+dz,green[j%green.length]);
      crown.scale.y=1.12;
    }
  }
  [[-43,17,1.3],[-43,37,1.15],[-30,39,1.25],[-63,11,1.45],[-57,48,1.35],
   [43,18,1.2],[43,37,1.15],[30,41,1.25],[63,10,1.55],[58,48,1.3],
   [-30,-42,1.25],[30,-43,1.25],[-61,-31,1.55],[62,-32,1.4]].forEach(p=>tree(...p));
  for(const x of [-20,20])for(const z of [21,41]){
    // Seat plus slatted timber back.
    basic(3.2,.18,1.1,x,.64,z,0x745c45);
    for(const dx of [-1.25,1.25])basic(.18,.72,.72,x+dx,.34,z,shadowMetal);
    for(const y of [1.12,1.37])basic(3.2,.15,.14,x,y,z-.56,0x745c45);
  }
  for(const x of [-18,18])for(const z of [16,32]){
    cylinder(.09,.15,4.1,x,2.05,z,shadowMetal);
    orb(.4,x,4.2,z,mat(0xffefd5,{emissive:0xffdb9f,emissiveIntensity:.8}));
  }
  // Rotunda approximation is a standalone scene; upper levels are decorative.
  plane(26,26,0,-.2,0,mat(0xded3bd),rotunda);
  const tileMap=texture(['#c7bcad','#e7dece','#ddd3c3','#f4ead8'],true);
  tileMap.repeat.set(5,5);
  plane(23,23,0,-.11,0,mat(0xffffff,{map:tileMap,roughness:.9}),rotunda);
  const innerWall=mat(0xe8dcc9,{side:THREE.BackSide});
  cylinder(11.5,11.5,22,0,11,0,innerWall,rotunda,48);
  const cream=mat(0xe7deca),white=mat(0xf8f1df),gold=mat(0xb9aa91,{metalness:.13});
  for(let j=0;j<12;j++){
    const a=j*Math.PI/6,x=Math.cos(a)*9,z=Math.sin(a)*9;
    cylinder(.43,.49,14.6,x,7.3,z,cream,rotunda,18);
    cylinder(.71,.49,.6,x,14.8,z,white,rotunda,16);
    cylinder(.56,.58,.5,x,.25,z,gold,rotunda,16);
  }
  // Galleries with a real central void. Not yet physically walkable.
  for(const y of [6.1,11.9,17.7]){
    const ring=new THREE.Mesh(new THREE.RingGeometry(5.9,11.2,72),mat(0xd0c4af,{side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.y=y;ring.receiveShadow=true;rotunda.add(ring);
    const rail=new THREE.Mesh(new THREE.TorusGeometry(5.9,.12,7,72),gold);
    rail.rotation.x=Math.PI/2;rail.position.y=y+1.25;rotunda.add(rail);
    for(let i=0;i<48;i++){
      const a=i*Math.PI/24;
      cylinder(.055,.055,1.2,Math.sin(a)*5.9,y+.58,Math.cos(a)*5.9,gold,rotunda,7);
    }
  }
  // Skylight: tinted hemispherical glass with metal ribs.
  const glass=new THREE.Mesh(new THREE.SphereGeometry(9.2,48,18,0,Math.PI*2,0,Math.PI/2),
    mat(0x9cbdc7,{metalness:.08,roughness:.17,transparent:true,opacity:.47,side:THREE.DoubleSide}));
  glass.position.y=21.6;rotunda.add(glass);
  for(let j=0;j<12;j++){
    const a=j*Math.PI/6;
    const curve=new THREE.EllipseCurve(0,0,9.1,9.1,0,Math.PI/2,false,0);
    const points=curve.getPoints(20).map(p=>new THREE.Vector3(Math.cos(a)*p.x,21.6+p.y,Math.sin(a)*p.x));
    const rib=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.07,5,false),gold);
    rotunda.add(rib);
  }
  // Approximate grand stair study, decorative only until measured and collision-safe.
  for(let i=0;i<11;i++)basic(4.1,.16,.7,-5.2,i*.22,7.5-i*.62,cream,rotunda);
  basic(5.2,2.8,.3,0,2.2,-10.6,white,rotunda);
  basic(4.25,3.5,.22,0,2.0,10.6,mat(0x4e666d,{roughness:.28}),rotunda);
  basic(.22,4,.3,0,2,10.5,gold,rotunda);
  // Illumination separately toggled by setZone.
  const sun=new THREE.DirectionalLight(0xffead5,3);
  sun.position.set(-23,47,32);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-95;sun.shadow.camera.right=95;sun.shadow.camera.top=95;sun.shadow.camera.bottom=-95;
  sun.shadow.camera.near=1;sun.shadow.camera.far=180;
  sun.shadow.bias=-.0001;scene.add(sun);lights.push(sun);
  const ambient=new THREE.HemisphereLight(0xe6f1ff,0x7e7a69,1.75);scene.add(ambient);lights.push(ambient);
  const interiorAmbient=new THREE.HemisphereLight(0xf8ebd6,0x978f80,1.2);
  scene.add(interiorAmbient);lights.push(interiorAmbient);
  const glow=new THREE.PointLight(0xffe8c9,85,37,1.7);
  glow.position.set(0,17,0);rotunda.add(glow);
  const setZone=(zone)=>{
    outdoors.visible=zone==='campus';
    rotunda.visible=zone==='rotunda';
    sun.visible=zone==='campus';
    ambient.visible=zone==='campus';
    interiorAmbient.visible=zone==='rotunda';
    scene.background=new THREE.Color(zone==='campus'?0xc4dae5:0xeadbc6);
    scene.fog=zone==='campus'?new THREE.Fog(0xc4dae5,65,155):new THREE.Fog(0xeadbc6,25,45);
  };
  setZone('campus');
  return {setZone,dispose(){
    scene.remove(outdoors,rotunda);for(const light of lights)scene.remove(light);
    for(const obj of [outdoors,rotunda])obj.traverse(mesh=>{
      if(mesh.geometry)mesh.geometry.dispose();
    });
    for(const material of materials.values()){material.map?.dispose();material.dispose();}
  }};
}

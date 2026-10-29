/*
 * GeeGeeVerse scenery bridge: brings the cartoon Campus Explorer visual style
 * into the existing GPS-anchored, multiplayer campus scene.
 * Only illustrative geometry is generated; real entrances and paths are not surveyed.
 * No keyboard handlers, networking, avatars, classroom logic, or server code here.
 */
export function buildCampusScenery({THREE, scene, landmarks, square, landingOutside, sign}) {
  if (!THREE || !scene || !Array.isArray(landmarks) || !square) throw new Error('Campus scenery needs Three.js and landmark positions');
  scene.background = new THREE.Color(0xb5ddf2);
  scene.fog = new THREE.Fog(0xb5ddf2, 250, 1000);

  const materials = new Map(), geometries = new Map();
  const material = (hex) => {
    if (!materials.has(hex)) materials.set(hex, new THREE.MeshStandardMaterial({color:hex, roughness:.88}));
    return materials.get(hex);
  };
  function box(w,h,d,x,y,z,color,parent=scene,shadow=false) {
    const key = [w,h,d].join(':');
    if (!geometries.has(key)) geometries.set(key, new THREE.BoxGeometry(w,h,d));
    const mesh = new THREE.Mesh(geometries.get(key), material(color));
    mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=shadow;parent.add(mesh);
    return mesh;
  }
  function cylinder(r1,r2,height,x,y,z,color,segments=9) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,height,segments),material(color));
    mesh.position.set(x,y,z);mesh.castShadow=true;scene.add(mesh);return mesh;
  }
  function canopy(radius,x,y,z,color) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius,1),material(color));
    mesh.position.set(x,y,z);mesh.castShadow=true;scene.add(mesh);
  }
  // Paths stay on the ground; the selected landmark coordinates are geographic,
  // but these connections are visual guides and are NOT verified walkways.
  const paths=[];
  function path(x1,z1,x2,z2,width,color=0xdad1bd) {
    const distance = Math.hypot(x2-x1,z2-z1);
    if (distance<.5)return;
    const walkway = box(width,.11,distance,(x1+x2)/2,-.08,(z1+z2)/2,color);
    walkway.rotation.y = Math.atan2(x2-x1,z2-z1);
    paths.push({x1,z1,x2,z2,width});
  }
  box(1180,.25,1180,0,-.37,0,0x82b28e);
  const hub={x:square.x,z:square.z};
  // Wider central plaza and pedestrian spine.
  box(46,.15,42,hub.x,-.14,hub.z,0xdad1bd);
  const north=landmarks.find(b=>b.id==='mrt')||landmarks[0];
  const east=landmarks.find(b=>b.id==='stm')||landmarks.at(-1);
  if (north) path(hub.x,hub.z,north.x,north.z,8.5);
  if (east) path(hub.x,hub.z,east.x,east.z,8.5);

  const exterior=[];
  for (const b of landmarks) {
    const h = b.id==='mrt' ? Math.max(b.h,48) : b.h;
    const w=b.w,d=b.d,group=new THREE.Group();
    group.position.set(b.x,0,b.z);scene.add(group);
    // Coloured façades, glass windows and contrasting roof trim mirror the demo.
    box(w,h,d,0,h/2,0,b.color,group,true);
    box(w+1.5,.95,d+1.5,0,h+.46,0,b.kind==='heritage'?0x685452:0x405c62,group,true);
    box(w+1.8,.38,d+1.8,0,.26,0,0xddd3c3,group);
    const front=d/2+.13;
    const rows=Math.max(2,Math.min(8,Math.floor((h-2)/5.8)));
    const cols=Math.max(3,Math.floor(w/7.2));
    for(let floor=0;floor<rows;floor++){
      for(let col=0;col<cols;col++){
        const wx=-w/2+(col+1)*w/(cols+1);
        const wy=5.9+floor*(h-9)/Math.max(1,rows-1);
        if(wy>h-2)continue;
        if(floor===0&&Math.abs(wx)<4)continue;
        box(3.4,2.9,.16,wx,wy,front,0x527e97,group);
        // A narrow window trim adds definition in the third-person camera.
        box(3.65,.17,.19,wx,wy+1.55,front+.04,0xe0e2da,group);
      }
    }
    box(6.4,5.6,.35,0,2.8,front+.25,b.room?0x245b55:0x3c4d55,group);
    box(8,.65,2.7,0,6,front+1,0xded5c4,group);
    if(b.kind==='heritage'){
      // Tabaret's visible classical columns and cornice.
      for(let k=-3;k<=3;k++){
        const col=new THREE.Mesh(new THREE.CylinderGeometry(.8,.92,14,12),material(0xf1e4d2));
        col.position.set(k*6.6,8,front+2.4);col.castShadow=true;group.add(col);
      }
      box(w*.85,1.6,5,0,16,front+2.4,0xe2d1b5,group);
    }
    sign(b.name,b.room?'CLASS / SPACE · E TO ENTER':'STYLIZED LANDMARK',b.x,h+9,b.z,b.name.length>20?34:28);
    exterior.push({id:b.id,x:b.x,z:b.z,w,d});
    if(b.room){
      const landing=landingOutside(b);
      const ring=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.2,.18,20),material(0x8ce0b5));
      ring.position.set(landing.x,.13,landing.z);scene.add(ring);
      sign('ENTER · E',b.abbr+' learning room',landing.x,6.8,landing.z,19);
      path(landing.x,landing.z,b.x, b.z+d/2+6,5.5,0xe4d6b9);
    }
    if(b.id!=='mrt' && b.id!=='stm'){
      const gate=landingOutside(b);path(hub.x,hub.z,gate.x,gate.z,4.5);
    }
  }
  // A deterministic scattering of simple cartoon-style trees, avoiding buildings,
  // the main square, and visually generated footpaths.
  let seed=234501;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  const greens=[0x398653,0x5aa065,0x79ac70];
  function nearPath(x,z,p){
    const vx=p.x2-p.x1,vz=p.z2-p.z1,den=vx*vx+vz*vz;
    const t=den?Math.min(1,Math.max(0,((x-p.x1)*vx+(z-p.z1)*vz)/den)):0;
    return Math.hypot(x-(p.x1+t*vx),z-(p.z1+t*vz))<p.width/2+3;
  }
  for(let i=0;i<190;i++){
    const x=(rand()-.5)*940,z=(rand()-.5)*870;
    if(Math.hypot(x-hub.x,z-hub.z)<36)continue;
    if(exterior.some(b=>Math.abs(x-b.x)<b.w/2+12&&Math.abs(z-b.z)<b.d/2+12))continue;
    if(paths.some(p=>nearPath(x,z,p)))continue;
    const size=.68+rand()*.56;
    cylinder(.38*size,.49*size,5.6*size,x,2.8*size,z,0x896747);
    canopy(4.5*size,x,7.5*size,z,greens[Math.floor(rand()*greens.length)]);
  }
  for(const dx of [-18,18])for(const dz of [-13,13]){
    box(5,.4,1.6,hub.x+dx,1.1,hub.z+dz,0x916e4f);
    box(5,1.4,.34,hub.x+dx,1.8,hub.z+dz-.65,0x916e4f);
  }
  sign('GEEGEEVERSE','Shared multiplayer campus · stylized preview',hub.x,15,hub.z,40);
  return {buildings:exterior,landmarks:landmarks.length,paths:paths.length};
}

/**
 * GeeGeeVerse — Tabaret Hall public Rotunda study.
 * Visual references: https://www.uottawa.ca/en/news-all/celebrating-indigenous-art-heart-tabaret-hall
 * https://www.uottawa.ca/about-us/administration-services/facilities/campus-maps/building/tabaret-hall
 * https://www.uottawa.ca/faculty-arts/music/events
 *
 * This is NOT an architectural drawing or a 1:1 interior survey.
 * Publicly documented motifs: rotunda, warm columns, circular balconies,
 * wrought-iron railings, tiled floor, benches, staircase, skylight and wall art.
 * The room arrangement, dimensions, paths and art frames are conceptual.
 * Does not reproduce copyrighted artwork, secure offices or nonpublic floor plans.
 */
export function buildTabaretInterior({THREE, scene, sign}) {
  if(!THREE || !scene || typeof sign!=='function') throw new Error('Tabaret interior needs a scene, Three.js and labels');
  const mats=new Map();
  const mat=(hex,props={})=>{
    const key=hex+'-'+JSON.stringify(props);
    if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color:hex,roughness:.81,...props}));
    return mats.get(key);
  };
  const matStone=mat(0xece1cd),matCream=mat(0xf4e9d9),matTrim=mat(0xcab598);
  const matRail=mat(0x2e3435,{metalness:.67,roughness:.38}),matWalnut=mat(0x5a453a);
  const matBench=mat(0x3d3537),matGlass=mat(0xb6e0eb,{transparent:true,opacity:.56,metalness:.18,roughness:.2,depthWrite:false});
  const cream=0xf1e6d4;
  const boxGeo=new Map();
  const box=(w,h,d,x,y,z,m,parent=scene)=>{
    const key=[w,h,d].join('-');
    if(!boxGeo.has(key))boxGeo.set(key,new THREE.BoxGeometry(w,h,d));
    const o=new THREE.Mesh(boxGeo.get(key),m);o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;
  };
  const cylinder=(r1,r2,h,x,y,z,m,parent=scene,segments=14)=>{
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),m);
    o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;
  };
  function beam(from,to,radius,m,parent=scene){
    const delta=new THREE.Vector3(to[0]-from[0],to[1]-from[1],to[2]-from[2]);
    const o=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),8),m);
    o.position.set((from[0]+to[0])/2,(from[1]+to[1])/2,(from[2]+to[2])/2);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    parent.add(o);return o;
  }
  function curveRing(radius,tube,y,material,radial=64){
    const o=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,7,radial),material);
    o.rotation.x=-Math.PI/2;o.position.y=y;scene.add(o);return o;
  }
  // The walkable level is a single open room. 1 unit ~ 1 m for consistent avatar scale.
  box(29.6,.48,29.6,0,-.35,0,mat(0xb9a98c));
  // Beige and white checked tile, similar to the publicly photographed rotunda.
  // Tiles are flush with the ground and purely decorative.
  const tileLight=mat(0xeae5dc),tileDark=mat(0xbdb5aa);
  const tileGeo=new THREE.BoxGeometry(1.2,.045,1.2);
  for(let ix=-12;ix<12;ix++)for(let iz=-12;iz<12;iz++){
    const tile=new THREE.Mesh(tileGeo,(ix+iz)%2?tileLight:tileDark);
    tile.position.set((ix+.5)*1.2,-.075,(iz+.5)*1.2);
    tile.receiveShadow=true;scene.add(tile);
  }
  // Faceted circular walls leave a clearly marked entrance gap at southern end.
  const R=12.35,N=40,wallH=22.5;
  const wallMat=mat(0xe6d8c7);
  const archMat=mat(0xd6c3ab);
  for(let i=0;i<N;i++){
    const ang=(i+.5)*Math.PI*2/N;
    const x=Math.sin(ang)*R,z=Math.cos(ang)*R;
    const isEntrance=(ang<.27||ang>2*Math.PI-.27);
    if(isEntrance)continue;
    const wall=box(2*Math.PI*R/N+.2,wallH,.44,x,wallH/2,z,wallMat);
    wall.rotation.y=ang;
    for(const level of [5.6,11.9,18.1]) {
      const panel=box(2*Math.PI*R/N+.12,.23,.65,x,level,z,archMat);
      panel.rotation.y=ang;
    }
  }
  // Straight entrance lobby, readable from the spawn point.
  for(const x of [-9.2,9.2]){
    box(.42,10,7.0,x,5,11.2,matStone);
    box(2.1,10,.58,x/2,5,14.3,matStone);
  }
  box(19,.4,7,0,10.3,11.2,matStone);
  box(13,.45,7,0,.12,11.2,mat(0xc5b1a0));
  box(17,1.0,.55,0,8.8,14.5,matTrim);
  // Decorative doorway columns; no access to private office interiors.
  for(const x of [-6.6,6.6]){
    cylinder(.48,.55,8.4,x,4.2,13.6,matCream);
    box(1.45,.5,1.2,x,8.7,13.6,matTrim);
  }
  sign('TABARET HALL','ROTUNDA · PUBLIC-AREA STUDY',0,6.1,11.2,21);
  sign('EXIT TO CAMPUS','Walk to the doors · E',0,4.1,14.0,20);

  // Four upper-level colonnades, parapets and balconies are recognizable motifs,
  // but we do NOT imply that every gallery or staircase is accessible in-game.
  for(let floor=0;floor<3;floor++){
    const y=6.15+floor*6.0;
    curveRing(10.95,.27,y,matTrim);
    curveRing(10.95,.19,y+.75,matRail);
    curveRing(10.95,.13,y+2.1,matRail);
    const count=44;
    for(let j=0;j<count;j++){
      const a=j*2*Math.PI/count,x=Math.sin(a)*10.95,z=Math.cos(a)*10.95;
      beam([x,y+.75,z],[x,y+2.1,z],.046,matRail);
      // Curled scrollwork-inspired crossbars, intentionally simple.
      if(j%2===0){
        const b=a+.065;
        beam([x,y+1,z],[Math.sin(b)*10.95,y+1.65,Math.cos(b)*10.95],.042,matRail);
      }
    }
  }
  // Tall cream columns with inset capitals and bases.
  const colCount=12;
  for(let i=0;i<colCount;i++){
    const a=i*2*Math.PI/colCount,x=Math.sin(a)*11.2,z=Math.cos(a)*11.2;
    cylinder(.58,.66,19.3,x,9.8,z,matCream,scene,16);
    cylinder(.94,.94,.3,x,.2,z,matTrim);
    cylinder(.92,.92,.36,x,19.58,z,matTrim);
    box(2.0,.32,2.0,x,19.9,z,matCream);
  }
  // Ceiling and daylight dome: translucent bowl, stone trim, radial ribs, oculus.
  curveRing(12.1,.6,21.4,matCream);
  curveRing(8.8,.52,23.0,matTrim);
  const dome=new THREE.Mesh(
    new THREE.SphereGeometry(8.9,36,13,0,Math.PI*2,0,Math.PI/2),
    matGlass
  );
  dome.position.set(0,23.0,0);dome.material.side=THREE.DoubleSide;scene.add(dome);
  for(let j=0;j<20;j++){
    const a=j*Math.PI*2/20;
    for(let k=0;k<5;k++){
      const t0=k*Math.PI/2/5,t1=(k+1)*Math.PI/2/5;
      const point=t=>[Math.sin(a)*8.9*Math.cos(t),23+8.9*Math.sin(t),Math.cos(a)*8.9*Math.cos(t)];
      beam(point(t0),point(t1),.065,mat(0xa8aa9c));
    }
  }
  for(const y of [24.35,26.1,28.3]){
    const rad=Math.sqrt(Math.max(0,8.9**2-(y-23)**2));
    curveRing(rad,.055,y,mat(0xa7ada5));
  }
  scene.add(new THREE.HemisphereLight(0xf6eddb,0x8b7f68,.9));
  // Architectural staircase inspired by published views of the Rotunda.
  // It is a visual stair study (not functioning as an upper-floor path).
  const stair=mat(0xc1b39f),rail=matRail;
  for(let step=0;step<11;step++){
    const rise=(step+1)*.42,run=7.5+step*.58;
    box(5.2,.38,.95,-6.6,rise-.19,-8.3+step*.72,stair);
  }
  for(const x of [-9.45,-3.75]){
    beam([x,.4,-8.4],[x,5.2,-.9],.10,rail);
    for(let j=0;j<8;j++){
      const z=-8.4+j*.9,y=.4+j*.58;
      beam([x,y-.25,z],[x,y+.7,z],.055,rail);
    }
  }
  // Curved benches: matches the public seating concept without copying artwork.
  for(let i=0;i<2;i++){
    const center=i===0?Math.PI*.37:Math.PI*1.36;
    for(let j=-3;j<=3;j++){
      const a=center+j*.115,x=Math.sin(a)*6.2,z=Math.cos(a)*6.2;
      const seat=box(1.1,.25,1.8,x,.62,z,matBench);
      seat.rotation.y=a;
      const back=box(1.1,.85,.24,x,1.13,z,matBench);
      back.rotation.y=a;
    }
  }
  // Wall-light motif from the Rotunda photographs.
  const amber=mat(0xffe4ac,{emissive:0xffc877,emissiveIntensity:.32});
  for(const a of [Math.PI*.18,Math.PI*.78,Math.PI*1.22,Math.PI*1.76]){
    const x=Math.sin(a)*11.9,z=Math.cos(a)*11.9;
    box(.6,1.5,.42,x,3.8,z,amber);
  }
  // Frames are deliberately blank: real Indigenous works must not be fabricated
  // or copied into the game without suitable references/permissions.
  for(const a of [Math.PI*.55,Math.PI*1.47]){
    const x=Math.sin(a)*11.8,z=Math.cos(a)*11.8;
    const frame=box(2.7,2.4,.12,x,3.7,z,matWalnut);frame.rotation.y=a;
    const blank=box(2.25,1.95,.14,x,3.7,z,mat(0xe3d5bc));blank.rotation.y=a;
  }
  sign('ROTUNDA','Recognizable architecture · estimated scale',0,3.1,-10.2,20);
  sign('PUBLIC-AREA PREVIEW','Upper galleries are visual only',0,7.2,-11.0,19);
  return {space:'tabaret',features:['rotunda','checker-floor','column-ring','balconies','skylight','stair-study','benches'],walkableLevel:0};
}

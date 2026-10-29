/**
 * Tabaret Hall exterior study for GeeGeeVerse.
 * Visual architecture is based on public uOttawa photographs and building information.
 * 1 world unit approximately equals 1 metre. Exact facade measurements are not verified.
 * Portico faces east towards Tabaret Lawn; no fabricated interior is represented.
 */
export function buildTabaretExterior({THREE, group, box, material, width, height, depth}) {
  if (!group || !THREE || typeof box !== 'function') throw new Error('Missing Tabaret geometry context');
  // In the shared scene local +Z is a building's main front.
  // East is +X, so rotate the facade ninety degrees.
  group.rotation.y = Math.PI / 2;
  const front=depth/2;
  const stone=0xe7d8c2, stoneLight=0xf0e3d0, stoneShade=0xc2b8a8;
  const glass=0x5c7986, glassFrame=0xa69b8b, door=0x5f5246;
  // Limestone base, evenly spaced stone courses and a classical cornice.
  box(width,.7,depth+.5,0,.45,0,stoneShade,group);
  for(const level of [3.55,9.3,14.9,18.2]){
    box(width+.5,.42,depth+.5,0,level,0,stoneLight,group);
  }
  box(width+1.3,1.05,depth+1.4,0,height+.4,0,stoneShade,group);
  // Four floors are documented; visible facade floors here are simplified.
  for(const x of [-width/2+4.8,-width/2+10.8,width/2-10.8,width/2-4.8]){
    for(const y of [5.8,11.6,16.2]){
      box(2.8,3.5,.2,x,y,front+.18,glassFrame,group);
      box(2.38,3.08,.22,x,y,front+.33,glass,group);
      box(.15,3.12,.27,x,y,front+.46,stoneLight,group);
      box(2.52,.15,.3,x,y,front+.48,stoneLight,group);
    }
  }
  // Broad raised front terrace and the iconic staircase.
  box(32,3.1,6.4,0,1.55,front+3.1,stoneShade,group);
  for(let i=0;i<10;i++){
    const rise=3.0-i*.285;
    box(33,rise,1.42,0,rise/2,front+6.6+i*1.38, i%2?0xc8bfb3:0xd5cdc0,group);
  }
  // Portico windows and the tall central entrance.
  for(const x of [-10.5,-5.9,5.9,10.5]){
    for(const y of [8,13.8]){
      box(2.55,3.5,.24,x,y,front+.21,glassFrame,group);
      box(2.22,3.16,.28,x,y,front+.34,glass,group);
    }
  }
  box(4.9,6.7,.28,0,6.45,front+.26,stoneLight,group);
  box(3.95,5.7,.31,0,6.25,front+.43,door,group);
  box(.14,5.5,.34,0,6.3,front+.63,stoneShade,group);
  box(3.95,1.3,.36,0,9.2,front+.48,glass,group);
  // Six tall Ionic-inspired limestone columns, with capitals and plinths.
  const columnHeight=12.8,columns=6;
  for(let i=0;i<columns;i++){
    const x=(i-(columns-1)/2)*5.3;
    const col=new THREE.Mesh(
      new THREE.CylinderGeometry(.73,.82,columnHeight,16),
      material(stoneLight)
    );
    col.position.set(x,3.25+columnHeight/2,front+3.0);
    col.castShadow=true;group.add(col);
    box(2.0,.55,2.0,x,3.45,front+3.0,stoneShade,group);
    box(2.3,.6,2.1,x,16.4,front+3.0,stoneLight,group);
    box(2.55,.35,2.4,x,16.88,front+3.0,stoneShade,group);
  }
  // Entablature, cornice and true triangular pediment (not a flat box roof).
  box(35.4,1.25,5.3,0,17.6,front+2.85,stoneLight,group);
  box(36.1,.35,5.9,0,18.4,front+2.85,stoneShade,group);
  const pedimentShape=new THREE.Shape();
  pedimentShape.moveTo(-18.2,18.65);
  pedimentShape.lineTo(0,23.5);
  pedimentShape.lineTo(18.2,18.65);
  pedimentShape.lineTo(-18.2,18.65);
  const pediment=new THREE.Mesh(
    new THREE.ExtrudeGeometry(pedimentShape,{depth:1.1,bevelEnabled:false}),
    material(stoneLight)
  );
  pediment.position.z=front+5.0;
  pediment.castShadow=true;group.add(pediment);
  // Decorative round relief, intentionally not a reproduction of the uOttawa crest.
  const medallion=new THREE.Mesh(
    new THREE.CylinderGeometry(1.15,1.15,.28,18),
    material(0xcbbba3)
  );
  medallion.rotation.x=Math.PI/2;
  medallion.position.set(0,20.1,front+6.2);
  group.add(medallion);
  // Low stone retaining walls frame the major staircase.
  for(const x of [-18,18]){
    box(3.5,3.1,16,x,1.55,front+11.0,stoneShade,group);
  }
  return {columns, hasPediment:true, eastFacing:true};
}

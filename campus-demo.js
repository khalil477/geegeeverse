/**
 * GeeGeeVerse 3D Campus Explorer — self-contained test scene.
 * Three.js is loaded from a CDN; buildings, roads, windows,
 * labels, trees and sky are all created in code (no model assets).
 * This is a separate experiment and DOES NOT override world3d.js.
 * The illustrated campus is deliberately NOT geo-accurate.
 */
(async () => {
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
  } catch (err) {
    console.error('Three.js failed to load', err);
    document.querySelector('#error').style.display = 'grid';
    return;
  }

  const canvas = document.querySelector('#campus-canvas');
  const status = document.querySelector('#status');
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xb8ddea, 140, 420);
  const camera = new THREE.PerspectiveCamera(72, 1, .1, 750);
  camera.position.set(0, 3, 120);
  camera.rotation.order = 'YXZ';

  // Procedural sky gradient, with no photo or texture dependencies.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: `varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec3 v;void main(){float h=smoothstep(-.3,.85,normalize(v).y);gl_FragColor=vec4(mix(vec3(.83,.93,.96),vec3(.30,.59,.89),h),1.);}`
    })
  );
  scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xeaf5ff, 0x728b75, 2.2));
  const sunlight = new THREE.DirectionalLight(0xffeed1, 3.1);
  sunlight.position.set(-80, 150, 85);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048,2048);
  sunlight.shadow.camera.left = sunlight.shadow.camera.bottom = -220;
  sunlight.shadow.camera.right = sunlight.shadow.camera.top = 220;
  scene.add(sunlight);

  const mat = (color, roughness=0.92)=>new THREE.MeshStandardMaterial({color,roughness});
  const grass=mat(0x7eb18b), stone=mat(0xd4cab2), asphalt=mat(0x6b777e), trim=mat(0xf0e2c9), dark=mat(0x3b555b);
  const windowMat=mat(0x537c94,.38);
  function box(w,h,d,x,y,z,material,parent=scene) {
    const obj=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    obj.position.set(x,y,z); obj.receiveShadow=true; obj.castShadow=true; parent.add(obj); return obj;
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(520,520),grass);
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  function road(x,z,w,d,material=stone){const r=box(w,.07,d,x,.025,z,material);r.castShadow=false;return r;}
  road(0,0,13,440);road(0,-24,350,13);road(0,82,350,13);road(-220,0,19,510,asphalt);road(220,0,19,510,asphalt);road(0,-225,500,19,asphalt);road(0,50,58,48);

  // Crisp billboard labels (generated with canvas, not image files).
  function label(name,x,y,z) {
    const c=document.createElement('canvas');c.width=1024;c.height=150;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#163e39';ctx.beginPath();ctx.roundRect(8,8,1008,134,30);ctx.fill();
    ctx.strokeStyle='#bfe8ca';ctx.lineWidth=5;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 49px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,512,75,955);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
    sprite.scale.set(34,5,1);sprite.position.set(x,y,z);scene.add(sprite);
  }

  const buildings=[];
  function building(name,x,z,w,h,d,color,levels=3){
    const group = new THREE.Group();group.position.set(x,0,z);scene.add(group);
    const base=box(w,h,d,0,h/2,0,mat(color),group);
    box(w+1.3,.9,d+1.3,0,h+.45,0,dark,group);
    const cols=Math.max(3,Math.floor(w/7));
    const floors=Math.min(levels,9);
    for(let fl=0;fl<floors;fl++)for(let col=0;col<cols;col++) {
      const px=-w/2+(col+1)*w/(cols+1);
      const py=4.7+fl*(h-7)/Math.max(1,floors);
      box(2.9,2.7,.14,px,Math.min(py,h-2),d/2+.1,windowMat,group).castShadow=false;
    }
    box(5.7,5.6,.3,0,2.8,d/2+.25,dark,group);
    box(7.2,.6,1.8,0,5.9,d/2+.9,trim,group);
    label(name,x,h+9,z);
    buildings.push({name,x,z,w,h,d});
    return group;
  }

  const tabaret=building('TABARET HALL',0,-83,64,23,35,0xd7b998,3);
  // Seven columns make Tabaret recognizable even in low-poly form.
  for(let i=-3;i<=3;i++) {
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.78,.9,15.5,12),trim);
    col.position.set(i*7,9,19);col.castShadow=true;tabaret.add(col);
  }
  box(55,1.7,4,0,17.5,19,trim,tabaret);
  building('MORISSET LIBRARY',-100,-130,44,62,39,0xa6b4b2,9);
  building('JOCK TURCOT UNIVERSITY CENTRE',102,-79,76,25,45,0xc9ab8d,3);
  building('STEM COMPLEX',-108,69,55,37,38,0x92b8c7,5);
  building('SITE BUILDING',113,77,51,35,38,0x98abb9,5);
  building('DESMARAIS BUILDING',-172,8,46,43,38,0xb7a79b,6);
  building('FSS BUILDING',176,-6,45,55,36,0xa9b7b0,8);
  building('CRX LEARNING CROSSROADS',83,-167,52,30,30,0xc8bca8,4);
  building('MONTPETIT HALL',-166,-84,52,29,39,0xc9a58c,4);

  // Seeded low-poly trees placed away from roads and buildings.
  let seed=20261029;
  function rand(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  const leaves=[mat(0x3b8155),mat(0x509d60),mat(0x6baa68)];
  function tree(x,z,s){
    const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35*s,.48*s,5.3*s,7),mat(0x876b4f));trunk.position.y=2.65*s;trunk.castShadow=true;g.add(trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(4*s,1),leaves[Math.floor(rand()*3)]);
    crown.position.y=7.5*s;crown.castShadow=true;g.add(crown);
  }
  for(let i=0;i<130;i++){
    const x=(rand()-.5)*420, z=(rand()-.5)*405;
    if(Math.abs(x)<16||Math.abs(z+24)<14||Math.abs(z-82)<14)continue;
    if(buildings.some(b=>Math.abs(x-b.x)<b.w/2+8&&Math.abs(z-b.z)<b.d/2+8))continue;
    tree(x,z,.65+rand()*.55);
  }
  // Benches on the plaza.
  const wood=mat(0x936c50);
  for(const x of [-24,24])for(const z of [33,54]){
    box(5,.4,1.4,x,1,z,wood);box(5,1.2,.3,x,1.65,z-.56,wood);
  }

  // First-person movement. Collision is deliberately disabled
  // in this temporary prototype to avoid trapping the player.
  const keys=new Set(); const velocity=new THREE.Vector3();
  let yaw=0,pitch=0,last=performance.now();
  const activeKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'];
  document.addEventListener('keydown',e=>{
    if(activeKeys.includes(e.code)){e.preventDefault();keys.add(e.code);}
  });
  document.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>keys.clear());
  document.querySelectorAll('[data-key]').forEach(button=>{
    const key=button.dataset.key;
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(key)});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(key));
  });
  canvas.addEventListener('click',()=>{if(!document.pointerLockElement&&canvas.requestPointerLock)canvas.requestPointerLock().catch(()=>{});});
  document.addEventListener('mousemove',e=>{
    if(document.pointerLockElement!==canvas)return;
    yaw-=e.movementX*.0023;pitch=Math.max(-1.4,Math.min(1.4,pitch-e.movementY*.0023));
  });
  function resize(){
    const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize);resize();

  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min(.04,(now-last)/1000);last=now;
    if(keys.has('ArrowLeft'))yaw+=dt*1.5;
    if(keys.has('ArrowRight'))yaw-=dt*1.5;
    camera.rotation.set(pitch,yaw,0);
    const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
    const r=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
    const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight'))?25:13;
    const target=new THREE.Vector3(-Math.sin(yaw)*f+Math.cos(yaw)*r,0,-Math.cos(yaw)*f-Math.sin(yaw)*r);
    if(target.lengthSq()>0)target.normalize().multiplyScalar(speed);
    velocity.lerp(target,1-Math.exp(-10*dt));camera.position.addScaledVector(velocity,dt);
    camera.position.x=THREE.MathUtils.clamp(camera.position.x,-230,230);
    camera.position.z=THREE.MathUtils.clamp(camera.position.z,-230,230);
    camera.position.y=3;sky.position.copy(camera.position);
    status.textContent=`Campus Explorer · ${camera.position.x.toFixed(0)}, ${camera.position.z.toFixed(0)}`;
    renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
})();

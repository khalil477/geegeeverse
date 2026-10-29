/* GeeGeeVerse standalone campus explorer. This does not modify the main game. */
(async () => {
  const error = document.getElementById('error');
  const status = document.getElementById('status');
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    const canvas = document.getElementById('campus-canvas');
    const renderer = new THREE.WebGLRenderer({canvas,antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb5ddf2);
    scene.fog = new THREE.Fog(0xb5ddf2,155,440);
    const camera = new THREE.PerspectiveCamera(73,1,.1,800);
    camera.position.set(0,3,120);
    camera.rotation.order = 'YXZ';
    scene.add(new THREE.HemisphereLight(0xe8f4ff,0x769079,2));
    const sun = new THREE.DirectionalLight(0xffe9c5,2.6);
    sun.position.set(-80,150,85);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-220;sun.shadow.camera.right=220;
    sun.shadow.camera.top=220;sun.shadow.camera.bottom=-220;
    scene.add(sun);
    const mat = c => new THREE.MeshStandardMaterial({color:c,roughness:.88});
    const grass=mat(0x82ad86),walkway=mat(0xd4c9b4),roadMat=mat(0x657a81);
    const glass=mat(0x467c97),dark=mat(0x3c5059),trim=mat(0xede1ce);
    function block(w,h,d,x,y,z,m,parent=scene){
      const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
      o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
    }
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(520,520),grass);
    ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
    function path(x,z,w,d,m=walkway){const o=block(w,.08,d,x,.04,z,m);o.castShadow=false;}
    path(0,0,13,440);path(0,-24,350,13);path(0,82,350,13);
    path(0,50,58,48);path(-220,0,19,510,roadMat);path(220,0,19,510,roadMat);
    path(0,-225,500,19,roadMat);
    function label(name,x,y,z){
      const c=document.createElement('canvas');c.width=1024;c.height=150;
      const ctx=c.getContext('2d');
      ctx.fillStyle='#163e39';ctx.beginPath();ctx.roundRect(8,8,1008,134,24);ctx.fill();
      ctx.strokeStyle='#bfe8ca';ctx.lineWidth=5;ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 48px Arial';ctx.textAlign='center';
      ctx.textBaseline='middle';ctx.fillText(name,512,75,965);
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));
      sprite.scale.set(34,5,1);sprite.position.set(x,y,z);scene.add(sprite);
    }
    const footprints=[];
    function building(name,x,z,w,h,d,color,floors=3){
      const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
      block(w,h,d,0,h/2,0,mat(color),g);
      block(w+1.4,.9,d+1.4,0,h+.45,0,dark,g);
      const cols=Math.max(3,Math.floor(w/7)),rows=Math.min(9,floors);
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const wx=-w/2+(col+1)*w/(cols+1);
        const wy=Math.min(4.7+row*(h-7)/Math.max(rows,1),h-2);
        const win=block(2.9,2.7,.14,wx,wy,d/2+.1,glass,g);win.castShadow=false;
      }
      block(5.7,5.6,.3,0,2.8,d/2+.25,dark,g);
      block(7.2,.6,1.8,0,5.9,d/2+.9,trim,g);
      label(name,x,h+9,z);footprints.push({x,z,w,d});return g;
    }
    const tabaret=building('TABARET HALL',0,-83,64,23,35,0xd7b998);
    for(let i=-3;i<=3;i++){
      const column=new THREE.Mesh(new THREE.CylinderGeometry(.78,.9,15.5,12),trim);
      column.position.set(i*7,9,19);column.castShadow=true;tabaret.add(column);
    }
    block(55,1.7,4,0,17.5,19,trim,tabaret);
    building('MORISSET LIBRARY',-100,-130,44,62,39,0xa6b4b2,9);
    building('JOCK TURCOT UNIVERSITY CENTRE',102,-79,76,25,45,0xc9ab8d,3);
    building('STEM COMPLEX',-108,69,55,37,38,0x92b8c7,5);
    building('SITE BUILDING',113,77,51,35,38,0x98abb9,5);
    building('DESMARAIS BUILDING',-172,8,46,43,38,0xb7a79b,6);
    building('FSS BUILDING',176,-6,45,55,36,0xa9b7b0,8);
    building('CRX LEARNING CROSSROADS',83,-167,52,30,30,0xc8bca8,4);
    building('MONTPETIT HALL',-166,-84,52,29,39,0xc9a58c,4);
    let seed=20261029;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
    const leaves=[mat(0x3b8155),mat(0x509d60),mat(0x6baa68)],wood=mat(0x876b4f);
    for(let i=0;i<130;i++){
      const x=(rand()-.5)*420,z=(rand()-.5)*405;
      if(Math.abs(x)<16||Math.abs(z+24)<14||Math.abs(z-82)<14)continue;
      if(footprints.some(b=>Math.abs(x-b.x)<b.w/2+8&&Math.abs(z-b.z)<b.d/2+8))continue;
      const scale=.65+rand()*.55;
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35*scale,.48*scale,5.3*scale,7),wood);
      trunk.position.set(x,2.65*scale,z);trunk.castShadow=true;scene.add(trunk);
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(4*scale,1),leaves[Math.floor(rand()*3)]);
      crown.position.set(x,7.5*scale,z);crown.castShadow=true;scene.add(crown);
    }
    for(const x of [-24,24])for(const z of [33,54]){
      block(5,.4,1.4,x,1,z,wood);block(5,1.2,.3,x,1.65,z-.56,wood);
    }
    const keys=new Set(),velocity=new THREE.Vector3(),target=new THREE.Vector3();
    let yaw=0,pitch=0,last=performance.now();
    const usable=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'];
    document.addEventListener('keydown',e=>{if(usable.includes(e.code)){e.preventDefault();keys.add(e.code);}});
    document.addEventListener('keyup',e=>keys.delete(e.code));
    window.addEventListener('blur',()=>keys.clear());
    document.querySelectorAll('[data-key]').forEach(b=>{
      const key=b.dataset.key;
      b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);});
      for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(key));
    });
    canvas.addEventListener('click',()=>{
      if(!document.pointerLockElement&&canvas.requestPointerLock){
        const promise=canvas.requestPointerLock();if(promise&&promise.catch)promise.catch(()=>{});
      }
    });
    document.addEventListener('mousemove',e=>{
      if(document.pointerLockElement!==canvas)return;
      yaw-=e.movementX*.0023;pitch=Math.max(-1.4,Math.min(1.4,pitch-e.movementY*.0023));
    });
    function resize(){
      const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);
      camera.aspect=w/h;camera.updateProjectionMatrix();
    }
    window.addEventListener('resize',resize);resize();
    function animate(now){
      requestAnimationFrame(animate);
      const dt=Math.min(.04,(now-last)/1000);last=now;
      if(keys.has('ArrowLeft'))yaw+=dt*1.5;
      if(keys.has('ArrowRight'))yaw-=dt*1.5;
      camera.rotation.set(pitch,yaw,0);
      const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
      const r=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
      const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight'))?25:13;
      target.set(-Math.sin(yaw)*f+Math.cos(yaw)*r,0,-Math.cos(yaw)*f-Math.sin(yaw)*r);
      if(target.lengthSq()>0)target.normalize().multiplyScalar(speed);
      velocity.lerp(target,1-Math.exp(-10*dt));
      camera.position.addScaledVector(velocity,dt);
      camera.position.x=THREE.MathUtils.clamp(camera.position.x,-230,230);
      camera.position.z=THREE.MathUtils.clamp(camera.position.z,-230,230);
      camera.position.y=3;
      status.textContent='Campus Explorer · '+camera.position.x.toFixed(0)+', '+camera.position.z.toFixed(0);
      renderer.render(scene,camera);
    }
    requestAnimationFrame(animate);
  }catch(err){
    console.error('3D Campus Explorer failed:',err);
    error.style.display='grid';
    const p=error.querySelector('p');
    if(p)p.textContent='The 3D campus could not start. Check your internet connection and try refreshing. Your main GeeGeeVerse game is unaffected.';
  }
})();

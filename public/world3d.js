import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { buildCampusScenery } from './campus-scenery.mjs';
import { MotionController } from './motion-controller.mjs';
import { createAvatar,animateAvatar,disposeAvatar } from './avatar-system.mjs';
import { mountAvatarCreator } from './avatar-creator.mjs';
import { normalizeAppearance,appearanceKey,AVATAR_DEFAULTS } from './avatar-options.mjs';
import { CAMPUS_LANDMARKS, CAMPUS_SQUARE, CAMPUS_BOUNDS, WORLD_BOUND, project, unproject, projectedPolygons, polygonBounds, pointInPolygon, simplifyRing } from './geo-utils.mjs';
import { tilePosition, tileWorldBounds, tilesNear } from './map-tiles.mjs';
import { canStandAt, findSafePosition } from './spawn-utils.mjs';
import { canWalkInBounds, shouldHideNearbyBuilding, outdoorLanding } from './recovery-utils.mjs';
/* GeeGeeVerse 3D alpha: campus-inspired landmarks, multiplayer, shared classroom boards, opt-in WebRTC voice. */
const $=sel=>document.querySelector(sel), $$=sel=>[...document.querySelectorAll(sel)];
const colors={coral:'#ef9f82',mint:'#92dab6',lavender:'#aca5ee',gold:'#f2cc7f',sky:'#81c9f1'};
const rooms={plaza:{name:'Main Campus',detail:'Go anywhere · explore together',icon:'✳'},study:{name:'Morisset Library',detail:'The study hall',icon:'📚'},lounge:{name:'University Centre',detail:'Student lounge',icon:'☕'},dorm:{name:'My Study Nook',detail:'Decorate your personal dorm room',icon:'🛏️'},chm1311:{name:'CHM 1311',detail:'Introduction to Chemistry · practice class',icon:'🧪'},bio1140:{name:'BIO 1140',detail:'Cell biology · practice class',icon:'🧬'},psy1101:{name:'PSY 1101',detail:'Psychology · practice class',icon:'🧠'},mat1320:{name:'MAT 1320',detail:'Calculus · practice class',icon:'✏️'}};
// Building CENTRES use verified coordinates. Real footprint geometry is fetched from City of Ottawa.
const landmarks=CAMPUS_LANDMARKS;
const cityMap={loaded:false,source:'not loaded',buildings:[],sidewalks:[],paths:[],polygons:[],meshes:[],counts:{}};
async function loadGeographicMap(){
  const status=document.querySelector('#map-accuracy');
  if(status)status.textContent='Loading City of Ottawa building footprints…';
  try {
    const response=await fetch('/api/campus-geo',{headers:{accept:'application/json'}});
    if(!response.ok)throw new Error(`Map service ${response.status}`);
    const data=await response.json();
    if(!data.ok||!data.layers?.buildings?.length)throw new Error('Geographic layer unavailable');
    for(const kind of ['buildings','sidewalks','paths'])cityMap[kind]=(data.layers[kind]||[]).flatMap(f=>projectedPolygons(f).map(rings=>({rings:rings.map(r=>simplifyRing(r)),bounds:polygonBounds(rings[0])})));
    cityMap.polygons=cityMap.buildings;
    cityMap.loaded=true;cityMap.source='City of Ottawa';
    cityMap.counts={buildings:cityMap.buildings.length,sidewalks:cityMap.sidewalks.length,paths:cityMap.paths.length};
    if(status)status.textContent=`City data available for safer spawn points (${cityMap.buildings.length} footprints). Outdoor scenery remains stylized.`;
    if(app.room==='plaza'){ensureSafeSpawn({notifyUser:app.joined});if(state3d.scene)buildWorld();}
  }catch(err){console.warn('Geographic city data not available; using labelled approximate fallback.',err);
    if(status)status.textContent='City footprint data unavailable; stylized outdoor buildings still work.';
  }
}
const motion=new MotionController();
let mobileJumpQueued=false;
const app={ws:null,id:null,joined:false,connected:false,room:'plaza',name:'Explorer',color:'coral',appearance:{...AVATAR_DEFAULTS},players:new Map(),counts:{},questions:[],posts:[],board:[],xp:0,answered:new Set(),x:CAMPUS_SQUARE.x,z:CAMPUS_SQUARE.z,cameraYaw:0,cameraDist:22,cameraPitch:.70,near:null,jump:0,jumpVelocity:0,velocityX:0,velocityZ:0};
const state3d={scene:null,camera:null,renderer:null,avatar:null,actors:new Map(),buildings:[],interiorObjects:[],questionTexture:null,boardMesh:null,firstFrame:false,ground:null,npcs:[],desk:null,occluders:[],tiles:new Map(),tileLoader:null};
let keyset=new Set(),touchKey=null,movingTarget=null,lastAt=0,lastSent=0,dragging=false,prevPointer=null,toastTimeout,voiceStream=null,voiceConnections=new Map(),voiceEnabled=false,nearbyBuildingsHidden=true,lastVisibilityUpdate=0;
const audioBin=document.createElement('div');audioBin.id='webrtc-audio';audioBin.hidden=true;document.body.append(audioBin);
const occlusionRay = new THREE.Raycaster();
const questionRoom={chm1311:'CHM 1311',bio1140:'BIO 1140',psy1101:'PSY 1101',mat1320:'MAT 1320'};
function notify(t){const el=$('#notice');el.textContent=t;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),3500)}
function send(o){if(app.joined&&app.ws?.readyState===1)app.ws.send(JSON.stringify(o));}
function clean(s){return String(s||'').trim().slice(0,180)}
function setTab(t){$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));for(const v of ['board','chat','community'])$('#tab-'+v).hidden=v!==t;}
function setupUI(){
 $('#start').addEventListener('click',()=>{if(!app.connected){notify('Connecting to the campus server…');return;}app.name=clean($('#nickname').value).slice(0,20)||'Explorer';if(app.joined){send({type:'profile',...app.appearance,name:app.name});replaceMyAvatar();$('#player-label').textContent=app.name;$('#welcome').hidden=true;notify('Your avatar look is updated!');return;}app.joined=true;sendJoin();$('#welcome').hidden=true;});
 $('#nickname').addEventListener('keydown',e=>{if(e.key==='Enter')$('#start').click()});
 // Avatar Studio supplies sanitized selections via onChange; preview remains separate from campus renderer.
 $('#profile-btn').addEventListener('click',()=>{$('#nickname').value=app.name;$('#welcome').hidden=false;$('#start').textContent=app.joined?'Save my avatar':'Enter the 3D world →';});
 $('#help-btn').addEventListener('click',()=>$('#help').hidden=false);
 window.GGVSolo?.init({notify,goRoom,room:()=>app.room,onDecor:()=>{if(app.room==='dorm')buildWorld()}});document.addEventListener('ggv:learnupdate',()=>{if(app.room in questionRoom)draw3DBoard()});
 $('#close-help').addEventListener('click',()=>$('#help').hidden=true);
 $$('.tabs button').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
 $('#return-campus').addEventListener('click',()=>goRoom('plaza'));
 $('#map-toggle').addEventListener('click',()=>$('#map-panel').hidden=!$('#map-panel').hidden);
 $('#unstuck').addEventListener('click',()=>resetToCampus());
 $('#wall-visibility').addEventListener('click',()=>{nearbyBuildingsHidden=!nearbyBuildingsHidden;$('#wall-visibility').textContent=nearbyBuildingsHidden?'👁 Show nearby walls':'👁 Hide nearby walls';refreshVisibility(true);notify(nearbyBuildingsHidden?'Close-up buildings hidden while exploring.':'Showing all building massing.');});
 $('#mobile-enter').addEventListener('click',enterNearby);
 $('#chat-form').addEventListener('submit',e=>{e.preventDefault();const t=clean($('#chat-text').value);if(t){send({type:'chat',body:t});$('#chat-text').value='';}});
 $('#post-form').addEventListener('submit',e=>{e.preventDefault();const body=clean($('#post-text').value);if(body.length<5){notify('Write at least five characters.');return;}send({type:'post',course:$('#post-course').value,body});$('#post-text').value='';});
 $('#solution-form').addEventListener('submit',e=>{e.preventDefault();const content=clean($('#solution-input').value);if(content.length<2)return;send({type:'board_submit',content});$('#solution-input').value='';});
 $('#mic-toggle').addEventListener('click',()=>voiceEnabled?stopVoice():startVoice());
 for(const b of $$('[data-move]')){b.addEventListener('pointerdown',e=>{e.preventDefault();touchKey=b.dataset.move;b.setPointerCapture(e.pointerId);});b.addEventListener('pointerup',()=>touchKey=null);b.addEventListener('pointercancel',()=>touchKey=null);b.addEventListener('lostpointercapture',()=>touchKey=null)}
 window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keyset.add(k);e.preventDefault()}if(k==='r'){resetToCampus();e.preventDefault();}if(k==='e')enterNearby();if(k==='f'&&app.room in questionRoom){if(Math.hypot(app.x+11,app.z+7)<12)window.GGVSolo?.talk();else notify('Walk closer to your professor or click Talk in Learn.');}if(k===' '){keyset.add('space');e.preventDefault()}if(k==='shift')keyset.add('shift');});
 window.addEventListener('keyup',e=>{const key=e.key===' '?'space':e.key.toLowerCase();keyset.delete(key);});window.addEventListener('blur',()=>{keyset.clear();touchKey=null;});
 const mobileExtras=document.querySelector('.touch-controls>div');if(mobileExtras){const jump=document.createElement('button');jump.id='mobile-jump';jump.textContent='⤒';jump.title='Jump';jump.setAttribute('aria-label','Jump');jump.addEventListener('click',()=>{mobileJumpQueued=true});mobileExtras.append(jump);const sprint=document.createElement('button');sprint.id='mobile-sprint';sprint.textContent='⚡';sprint.title='Sprint';sprint.setAttribute('aria-label','Toggle sprint');sprint.addEventListener('click',()=>{sprint.classList.toggle('active');if(sprint.classList.contains('active'))keyset.add('shift');else keyset.delete('shift')});mobileExtras.append(sprint);}
 buildDirectory();renderClass();renderChat();renderPosts();
}
function buildDirectory(){const destinations=$('#destinations');destinations.replaceChildren();const sections=[{heading:'YOUR WORLD',items:[{room:'plaza',name:'Main Campus',abbr:'MAP',icon:'🏛',detail:'Open campus'}]},{heading:'CLASSES',items:[{room:'chm1311',name:'CHM 1311',icon:'🧪',detail:'STEM · Chemistry'},{room:'bio1140',name:'BIO 1140',icon:'🧬',detail:'Gendron · Biology'},{room:'psy1101',name:'PSY 1101',icon:'🧠',detail:'FSS · Psychology'},{room:'mat1320',name:'MAT 1320',icon:'📐',detail:'SITE · Calculus'}]},{heading:'SPACES',items:[{room:'study',name:'Morisset',icon:'📚',detail:'Study Hall'},{room:'lounge',name:'University Centre',icon:'☕',detail:'Lounge'},{room:'dorm',name:'My Study Nook',icon:'🛏️',detail:'Private solo room'}]}];for(const section of sections){const heading=document.createElement('div');heading.className='dest-group';heading.textContent=section.heading;destinations.append(heading);for(const item of section.items){const b=document.createElement('button');b.className='destination';b.dataset.room=item.room;const ico=document.createElement('span');ico.className='desticon';ico.textContent=item.icon;const labels=document.createElement('span');const name=document.createElement('b');name.textContent=item.name;const sub=document.createElement('small');sub.textContent=item.detail;labels.append(name,sub);b.append(ico,labels);b.addEventListener('click',()=>goRoom(item.room));destinations.append(b);}}const heading=document.createElement('div');heading.className='dest-group';heading.textContent='REAL CAMPUS LANDMARKS · MAP';destinations.append(heading);for(const item of landmarks){const b=document.createElement('button');b.className='destination';b.title='Navigate to the approximate building centre; entrances are not surveyed.';const ico=document.createElement('span');ico.className='desticon';ico.textContent='📍';const labels=document.createElement('span');const name=document.createElement('b');name.textContent=item.name;const sub=document.createElement('small');sub.textContent=item.abbr+' · locate in 3D';labels.append(name,sub);b.append(ico,labels);b.addEventListener('click',()=>{if(!app.joined)return notify('Enter the world first.');if(app.room!=='plaza'){notify('Return to campus first.');return;}const landing=landingOutside(item);if(item.id==='tbt'){app.cameraYaw=Math.PI/2;app.cameraDist=27;app.cameraPitch=.55;}teleportTo(landing.x,landing.z);notify('Now near '+item.name+' · entrance position is approximate.');});destinations.append(b);}}
function sendJoin(){if(app.ws?.readyState===1)app.ws.send(JSON.stringify({type:'join',name:app.name,...app.appearance}));}
function connect(){const ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws`);app.ws=ws;ws.addEventListener('open',()=>{app.connected=true;$('#status').textContent='Connected';$('#status-dot').classList.add('online');if(app.joined)sendJoin();});ws.addEventListener('close',()=>{app.connected=false;$('#status').textContent='Reconnecting…';$('#status-dot').classList.remove('online');app.players.clear();stopVoice();setTimeout(connect,2000)});ws.addEventListener('message',e=>{try{handle(JSON.parse(e.data))}catch(err){console.warn('message',err)}});}
function handle(m){
 if(m.type==='welcome'){app.id=m.id;app.room='plaza';app.questions=m.questions||[];app.posts=m.posts||[];app.xp=m.xp||0;app.counts=m.counts||{};app.players=new Map((m.players||[]).map(p=>[p.id,p]));app.x=CAMPUS_SQUARE.x;app.z=CAMPUS_SQUARE.z;motion.teleport(app.x,app.z);ensureSafeSpawn();window.GGVSolo?.begin();window.GGVSolo?.enter('plaza');$('#player-label').textContent=app.name;buildWorld();renderPosts();renderClass();setRoomLabel();updateCounts();notify('Welcome to the 3D campus, '+app.name+'!');}
 else if(m.type==='room'){stopVoice();app.room=m.room;app.players=new Map((m.players||[]).map(p=>[p.id,p]));app.board=m.board||[];app.x=0;app.z=2;app.velocityX=0;app.velocityZ=0;motion.teleport(app.x,app.z);window.GGVSolo?.enter(app.room);buildWorld();renderClass();setRoomLabel();renderChat();updateCounts();notify('Entered '+rooms[app.room].name);}
 else if(m.type==='presence'){app.players=new Map((m.players||[]).map(p=>[p.id,p]));syncVoices();updateCounts();}
 else if(m.type==='counts'){app.counts=m.counts;updateCounts();}
 else if(m.type==='profile'){const p=app.players.get(m.id);if(p){Object.assign(p,m.profile);p.name=m.name||p.name;}}
 else if(m.type==='moved'){const p=app.players.get(m.id);if(p){p.x=m.x;p.z=m.z;}}
 else if(m.type==='chat'){const wrap=$('#chats');const div=document.createElement('div');div.className='chat-message';const author=document.createElement('b');author.textContent=m.author;const body=document.createElement('p');body.textContent=m.body;div.append(author,body);wrap.append(div);if(wrap.children.length>40)wrap.firstChild.remove();wrap.scrollTop=wrap.scrollHeight;}
 else if(m.type==='post'){app.posts.unshift(m.post);renderPosts();}
 else if(m.type==='reply'){const p=app.posts.find(x=>x.id===m.postId);if(p){p.replies.push(m.reply);renderPosts();}}
 else if(m.type==='board_entry'){if(m.room!==app.room)return;app.board.push(m.entry);app.board=app.board.slice(-20);renderBoardEntries();draw3DBoard();}
 else if(m.type==='quizResult'){app.answered.add(m.id);renderClass(m);notify((m.correct?'Correct! ':'Not quite. ')+m.why+(m.reward?' +'+m.reward+' XP':''));}
 else if(m.type==='signal')acceptSignal(m.from,m.signal);
 else if(m.type==='voice_limit'){notify('Voice room is full (8 participants).');stopVoice();}
}
function setRoomLabel(){const r=rooms[app.room];$('#room-name').textContent=r.name;$('#room-detail').textContent=r.detail;$('#room-icon').textContent=r.icon;$('#return-campus').hidden=app.room==='plaza';$('#chat-room').textContent='# '+app.room;$$('.destination').forEach(b=>b.classList.toggle('active',b.dataset.room===app.room));$('#nearby').hidden=true;}
function updateCounts(){const count=Object.values(app.counts||{}).reduce((a,b)=>a+b,0);$('#online-count').textContent=count+' online';}
function goRoom(room){if(!app.joined)return notify('Create your avatar first.');if(app.room===room)return;if(!rooms[room])return;send({type:'room',room});}
function renderChat(){$('#chats').replaceChildren();const p=document.createElement('div');p.className='muted';p.textContent='Chat is live only within this room. Keep it kind.';$('#chats').append(p);}
function renderPosts(){const box=$('#posts');box.replaceChildren();for(const p of app.posts.slice(0,15)){const card=document.createElement('div');card.className='post-card';const label=document.createElement('small');label.textContent=p.course+' · '+p.author;const body=document.createElement('p');body.textContent=p.body;card.append(label,body);box.append(card);}if(!app.posts.length){const el=document.createElement('p');el.className='muted';el.textContent='No posts yet.';box.append(el)}}
function courseQuestion(){const code=questionRoom[app.room];return app.questions.find(q=>q.course===code) || null;}
function renderClass(result){const room=app.room,course=questionRoom[room];$('#course-title').textContent=course||'Visit a classroom';$('#course-intro').textContent=course?'Students in this room see the same problem. Explain your thinking on the shared wall.':'Walk into a course room to see a practice problem on the 3D whiteboard, or choose a class from the left.';
 const q=courseQuestion();$('#task-card').hidden=!q;$('#shared-area').hidden=!q;
 if(!q)return;$('#task-question').textContent=q.q;$('#task-options').replaceChildren();
 for(const [i,choice] of q.choices.entries()){const b=document.createElement('button');b.className='task-option';b.textContent=String.fromCharCode(65+i)+'. '+choice;const done=app.answered.has(q.id);if(done)b.disabled=true;if(result?.id===q.id&&result.choice===i)b.classList.add(result.correct?'correct':'wrong');b.addEventListener('click',()=>send({type:'quiz',id:q.id,choice:i}));$('#task-options').append(b);}
 $('#task-foot').textContent=result?.id===q.id?result.why:'Pick an answer or discuss your approach first. Each correct question awards XP once.';renderBoardEntries();draw3DBoard();}
function renderBoardEntries(){const wrap=$('#solutions');wrap.replaceChildren();if(!app.board.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='No hints yet. Be the first to start solving together.';wrap.append(empty);}for(const e of app.board.slice(-10)){const c=document.createElement('div');c.className='solution';const who=document.createElement('b');who.textContent=e.author;const text=document.createElement('p');text.textContent=e.content;c.append(who,text);wrap.append(c);}wrap.scrollTop=wrap.scrollHeight;}
function landingOutside(b){
 const options=b.id==='tbt'?[{x:b.x+b.d/2+32,z:b.z},{x:b.x+b.d/2+40,z:b.z+12}]:[{x:b.x,z:b.z+b.d/2+12},{x:b.x+b.w/2+12,z:b.z},{x:b.x-b.w/2-12,z:b.z},{x:b.x,z:b.z-b.d/2-12}];
 const safe=options.map(p=>findSafePosition(p.x,p.z,cityMap.polygons,{clearance:4,maxRadius:120})).find(p=>p.found);
 return safe||findSafePosition(CAMPUS_SQUARE.x,CAMPUS_SQUARE.z,cityMap.polygons,{clearance:4});
}
function teleportTo(x,z){
 app.x=x;app.z=z;app.velocityX=0;app.velocityZ=0;app.jump=0;app.jumpVelocity=0;movingTarget=null;
 motion.teleport(x,z);if(state3d.avatar)state3d.avatar.position.set(x,0,z);
 if(state3d.camera){
   const horizontal=app.cameraDist*Math.cos(app.cameraPitch);
   const target=new THREE.Vector3(x+Math.sin(app.cameraYaw)*horizontal,4+app.cameraDist*Math.sin(app.cameraPitch),z+Math.cos(app.cameraYaw)*horizontal);
   const focus=new THREE.Vector3(x,2.7,z);
   state3d.camera.position.copy(keepCameraOutOfBuildings(focus,target));
   state3d.camera.lookAt(focus);
 }
 send({type:'move',x,z});
}
function ensureSafeSpawn({notifyUser=false}={}){
 if(app.room!=='plaza')return false;
 if(!cityMap.loaded)return true; // Wait until City footprints are known before declaring a point outdoors.
 const safe=outdoorLanding(app.x,app.z,cityMap.polygons,{clearance:11,maxRadius:380});
 if(safe.moved){teleportTo(safe.x,safe.z);if(notifyUser)notify('Moved you to an outdoor location. Buildings do not block walking in this beta.');}
 return safe.found;
}
function resetToCampus(){
 if(!app.joined)return notify('Enter the world first.');
 if(app.room!=='plaza'){goRoom('plaza');return;}
 // Never fail to rescue the player; terrain is intentionally non-blocking in the current alpha.
 const safe=outdoorLanding(CAMPUS_SQUARE.x,CAMPUS_SQUARE.z,cityMap.polygons,{clearance:11,maxRadius:450});
 app.cameraYaw=0;app.cameraDist=24;app.cameraPitch=.7;
 teleportTo(safe.x,safe.z);refreshVisibility(true);
 notify(safe.found?'Teleported outside! Walking is unlocked.':'Rescued to the campus map. Walk anywhere with WASD.');
}
function nearClassroom(){return landmarks.filter(b=>b.room).find(b=>{const landing=landingOutside(b);return Math.hypot(app.x-landing.x,app.z-landing.z)<24;});}
function enterNearby(){if(app.room!=='plaza'){if(app.z>7)goRoom('plaza');else notify('Walk toward the exit at the back of the room or use ← Campus.');return;}const near=nearClassroom();if(near)goRoom(near.room);else notify('Walk near a classroom doorway or choose a building in the directory.');}
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});const materials={grass:mat(0x8ec0a0),pave:mat(0xddd4bf),road:mat(0x778c8d),tree:mat(0x4e956c),leaf:mat(0x77b282),wood:mat(0xb38d6a),roof:mat(0x78938f),classWall:mat(0xdad9c2)};
function mesh(geom,material,x=0,y=0,z=0,receive=false){const o=new THREE.Mesh(geom,material);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=receive;state3d.scene.add(o);return o;}
function box(w,h,d,material,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,true)}
function cyl(r1,r2,h,material,x,y,z,n=8){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),material,x,y,z)}
function sphere(r,material,x,y,z){return mesh(new THREE.SphereGeometry(r,10,8),material,x,y,z)}
function makeTextCanvas(title,subtitle,width=512){const c=document.createElement('canvas');c.width=width;c.height=144;const g=c.getContext('2d');g.fillStyle='#1c4845';g.beginPath();g.roundRect(6,6,width-12,132,18);g.fill();g.strokeStyle='#d1eccf';g.lineWidth=4;g.stroke();g.fillStyle='#f8f4dd';g.textAlign='center';g.font='bold 42px system-ui';g.fillText(title,width/2,65, width-35);g.fillStyle='#a9d6bd';g.font='bold 22px system-ui';g.fillText(subtitle,width/2,100,width-35);return new THREE.CanvasTexture(c)}
function sign(title,subtitle,x,y,z,w=23){const tex=makeTextCanvas(title,subtitle);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false});const sp=new THREE.Sprite(m);sp.position.set(x,y,z);sp.scale.set(w,w*144/512,1);state3d.scene.add(sp);}
function createBuilding(b){const m=mat(b.color);box(b.w,b.h,b.d,m,b.x,b.h/2,b.z);const roof=box(b.w+1,.8,b.d+1,mat(b.kind==='heritage'?0x896b61:0x718f8c),b.x,b.h+.35,b.z);if(b.kind==='heritage'){for(let i=-1;i<=1;i++){cyl(1.1,1.1,b.h*.65,mat(0xf3e7d5),b.x+i*8,b.h*.325,b.z+b.d/2+1,10)}box(b.w*.75,2,b.d*.25,mat(0xe5c9a5),b.x,b.h+1.5,b.z);}const frontZ=b.z+b.d/2+.18;const glass=mat(0x548d99,.25);for(let floor=0;floor<Math.min(6,Math.floor(b.h/5));floor++){for(let ix=-Math.floor((b.w-8)/7)/2;ix<=Math.floor((b.w-8)/7)/2;ix++){const px=b.x+ix*7;if(Math.abs(px-b.x)<4&&floor===0)continue;const win=box(4.4,2.8,.15,glass,px,3.9+floor*4.8,frontZ);}}
 box(7,9,.35,mat(b.room?0x235d59:0x435b64),b.x,4.5,frontZ+0.2);if(b.room){const p=box(8,.3,4,mat(0xe7ce96),b.x,.17,frontZ+3);const t=box(7,0.1,2,mat(0xa9dfb0),b.x,.22,frontZ+3);t.material.emissive=new THREE.Color(0x164632);}
 sign(b.abbr,b.room?'ENTER CLASS / SPACE':'CAMPUS LANDMARK',b.x,b.h+9,b.z,wFor(b));state3d.buildings.push(b);
}
function wFor(b){return b.name.length>15?27:22}
function tree(x,z,r=2.6){cyl(.36,.52,6.5,mat(0x826b4b),x,3.25,z,7);sphere(r,materials.tree,x,8,z);sphere(r*.7,materials.leaf,x-1.2,8.9,z-.4)}
function drawGeoShape(rings,material,height,asSurface=false){
  if(!rings?.[0]||rings[0].length<4)return null;
  const shape=new THREE.Shape();
  rings.forEach((ring,idx)=>{
    const target=idx===0?shape:new THREE.Path();
    ring.forEach((p,j)=>j?target.lineTo(p.x,-p.z):target.moveTo(p.x,-p.z));
    if(idx>0)shape.holes.push(target);
  });
  const geom=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1,curveSegments:1});
  geom.rotateX(-Math.PI/2);
  const o=new THREE.Mesh(geom,material);o.receiveShadow=true;
  o.position.y=asSurface?.065:0;
  state3d.scene.add(o);
  return o;
}
function estimatedHeight(poly){
  const b=poly.bounds,mx=(b.minx+b.maxx)/2,mz=(b.minz+b.maxz)/2;
  const nearest=landmarks.slice().sort((a,b)=>Math.hypot(a.x-mx,a.z-mz)-Math.hypot(b.x-mx,b.z-mz))[0];
  return nearest&&Math.hypot(nearest.x-mx,nearest.z-mz)<33?nearest.h:13;
}

// Human-viewed OpenStreetMap tiles are requested only around the active player, never bulk downloaded.
// This is a real *street map*, not satellite imagery or a photorealistic 3D city.
const OSM_ZOOM=17;
let lastTileCheckX=Infinity,lastTileCheckZ=Infinity;
function syncGroundTiles(force=false){
  if(!app.joined || app.room!=='plaza' || !state3d.scene)return;
  if(!force && Math.hypot(app.x-lastTileCheckX,app.z-lastTileCheckZ)<24)return;
  lastTileCheckX=app.x;lastTileCheckZ=app.z;
  const center=unproject(app.x,app.z);
  const needed=tilesNear(center.lon,center.lat,OSM_ZOOM,50);
  const keys=new Set(needed.map(t=>`${t.z}/${t.x}/${t.y}`));
  for(const [key,entry] of state3d.tiles){
    if(!keys.has(key)){
      state3d.scene.remove(entry.mesh);
      entry.mesh.geometry.dispose();entry.mesh.material.dispose();entry.texture?.dispose();
      state3d.tiles.delete(key);
    }
  }
  const loader=state3d.tileLoader ||= new THREE.TextureLoader();
  for(const t of needed){
    const key=`${t.z}/${t.x}/${t.y}`;
    if(state3d.tiles.has(key))continue;
    const bounds=tileWorldBounds(t.z,t.x,t.y,project);
    const width=bounds.east-bounds.west,depth=bounds.south-bounds.north;
    const geom=new THREE.PlaneGeometry(width,depth);
    const material=new THREE.MeshBasicMaterial({color:0x9dbca5,side:THREE.DoubleSide,depthWrite:true});
    const surface=new THREE.Mesh(geom,material);
    surface.rotation.x=-Math.PI/2;
    surface.position.set((bounds.west+bounds.east)/2,-.2,(bounds.north+bounds.south)/2);
    surface.renderOrder=0;
    state3d.scene.add(surface);
    const entry={mesh:surface,texture:null};state3d.tiles.set(key,entry);
    const url=`https://tile.openstreetmap.org/${t.z}/${t.x}/${t.y}.png`;
    loader.load(url,tex=>{
      if(!state3d.tiles.has(key)||state3d.tiles.get(key)!==entry){tex.dispose();return;}
      tex.colorSpace=THREE.SRGBColorSpace;
      entry.texture=tex;material.map=tex;material.color.set(0xffffff);material.needsUpdate=true;
      const status=document.querySelector('#base-map-status');
      if(status)status.textContent='Street map loaded · building exteriors are still simplified';
    },undefined,()=>{
      const status=document.querySelector('#base-map-status');
      if(status)status.textContent='Street tiles blocked or unavailable · see official map link';
    });
  }
}

function geographicCampus(){
  state3d.scene.background=new THREE.Color(0xc9e4e4);state3d.scene.fog=new THREE.Fog(0xc9e4e4,360,920);
  // 1 scene unit ≈ 1 metre; buildings and walking areas use City of Ottawa polygons.
  box(1180,.24,1150,mat(0x91b59a),0,-.36,0);
  const paving=mat(0xd6d5ca),walk=mat(0xe8e2d6);
  for(const poly of cityMap.sidewalks)drawGeoShape(poly.rings,paving,.06,true);
  for(const poly of cityMap.paths)drawGeoShape(poly.rings,walk,.075,true);
  const normal=mat(0xb7c1c1),campusColor=mat(0xc2b6a7),glass=mat(0x85aaa9);
  // No invented windows here: these are deliberately simple massing models over accurate footprints.
  for(const poly of cityMap.buildings){
    const b=poly.bounds,x=(b.minx+b.maxx)/2,z=(b.minz+b.maxz)/2;
    const nearest=landmarks.find(l=>Math.hypot(l.x-x,l.z-z)<33);
    const material=nearest?campusColor:normal;
    const footprintMesh=drawGeoShape(poly.rings,material,estimatedHeight(poly));
    if(footprintMesh){footprintMesh.userData.footprintBounds=poly.bounds;state3d.occluders.push(footprintMesh);}
  }
  for(const b of landmarks){
    sign(b.name,b.room?'CLASS / SPACE · PRESS E':'MAPPED LANDMARK',b.x,b.h+9,b.z,b.name.length>17?33:28);
    if(b.room){const landing=landingOutside(b);const disc=cyl(4.3,4.3,.16,mat(0x8ce4b7),landing.x,.17,landing.z,20);disc.material.emissive.set(0x1d624b);disc.material.emissiveIntensity=.2;sign('ENTER · E',b.abbr+' learning portal',landing.x,6.5,landing.z,19);}
  }
  sign('GEEGEEVERSE','City GIS footprints · simplified 3D massing',CAMPUS_SQUARE.x,12,CAMPUS_SQUARE.z,38);
}
function fallbackCampus(){
  state3d.scene.background=new THREE.Color(0xc9e4e4);
  state3d.scene.fog=new THREE.Fog(0xc9e4e4,360,920);
  box(1180,.2,1150,mat(0x91b59a),0,-.36,0);
  // Deliberately do not draw invented rectangular buildings when GIS fails.
  // The separately labelled OpenStreetMap street surface provides real context.
  for(const b of landmarks){
    sign(b.abbr, 'BUILDING LOCATION · APPROX.',b.x,10,b.z,25);
    if(b.room){const landing=landingOutside(b);cyl(3.5,3.5,.18,mat(0x8ce4b7),landing.x,.13,landing.z,16);
      sign('ENTER · E',b.abbr+' learning portal',landing.x,6.5,landing.z,18);}
  }
  sign('CAMPUS PREVIEW','Buildings hidden until real footprints load',CAMPUS_SQUARE.x,15,CAMPUS_SQUARE.z,44);
}
function campus(){
  // This shares the existing player coordinates, portals and multiplayer room system.
  // Geographic renderers remain above for future accurate-geometry work.
  buildCampusScenery({THREE,scene:state3d.scene,landmarks,square:CAMPUS_SQUARE,landingOutside,sign});
  const status=document.querySelector('#base-map-status');
  if(status)status.textContent='Stylized 3D scenery · paths and façades are illustrative';
}
function wrapLines(ctx,text,maxWidth){const out=[];let line='';for(const word of text.split(/\s+/)){const t=(line?line+' ':'')+word;if(ctx.measureText(t).width>maxWidth&&line){out.push(line);line=word}else line=t}if(line)out.push(line);return out}
function draw3DBoard(){const m=state3d.boardMesh;if(!m)return;const c=document.createElement('canvas');c.width=1024;c.height=576;const g=c.getContext('2d');g.fillStyle='#204f46';g.fillRect(0,0,1024,576);g.strokeStyle='#c8b992';g.lineWidth=16;g.strokeRect(10,10,1004,556);g.fillStyle='#a9d9b0';g.font='700 31px system-ui';g.fillText((questionRoom[app.room]||'LEARN TOGETHER')+'  ·  TODAY’S PRACTICE',45,60);
 const question=courseQuestion();g.fillStyle='#f4f4df';g.font='bold 47px system-ui';let yy=143;for(const line of wrapLines(g,window.GGVSolo?.getBoardQuestion?.()||question?.q||'Discuss a problem with your classmates.',920).slice(0,4)){g.fillText(line,45,yy);yy+=60;}
 g.fillStyle='#a4ceb7';g.font='27px system-ui';g.fillText('What is your reasoning?',45,Math.max(340,yy+15));g.fillStyle='#f1e6cc';g.font='24px system-ui';const entries=app.board.slice(-2);let y=430;for(const entry of entries){const txt=entry.author+': '+entry.content;for(const line of wrapLines(g,txt,920).slice(0,2)){g.fillText(line,45,y);y+=32;}}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const old=m.material.map;m.material.map=tex;m.material.needsUpdate=true;if(old)old.dispose();}
function interior(){const room=app.room;state3d.scene.background=new THREE.Color(room==='lounge'?0xd7c3aa:0xc2d4c8);state3d.scene.fog=null;box(29,.3,29,mat(room==='lounge'?0xc3a488:0xd5c4aa),0,-.22,0);box(29,10,.5,mat(room==='lounge'?0xaf9684:0x9dbeb3),0,5,-14.5);box(.5,10,29,mat(0xb6ccc1),-14.5,5,0);box(.5,10,29,mat(0xb6ccc1),14.5,5,0);
 const board=box(16,8,.2,mat(0x215246),0,5.8,-14.0);state3d.boardMesh=board;if(room in questionRoom){draw3DBoard();const prof=createAvatar(room==='chm1311'?'Professor Nova':'Course Mentor',{color:'gold',skin:'cocoa',hair:'bun',style:'jacket',accessory:'glasses',pants:'forest'});prof.position.set(-11,0,-7);state3d.scene.add(prof);state3d.npcs.push({name:'Professor Nova',mesh:prof,x:-11,z:-7,roam:0});sign('TALK TO PROFESSOR','Press F · Get a hint',-10,9,-7,17)}else{sign(room==='study'?'STUDY HALL':room==='dorm'?'YOUR STUDY NOOK':'STUDENT LOUNGE',room==='study'?'Grab a seat and review':room==='dorm'?'Personalize your space':'Hang out with students',0,7.4,-12.7,23);}
 for(const [x,z] of [[-8,-3],[8,-3],[-8,7],[8,7]]){box(7,.55,3,materials.wood,x,1.5,z);for(const dx of [-2.6,2.6])for(const dz of [-1,1])box(.35,2.1,.35,mat(0x8b7058),x+dx,.5,z+dz)}
 for(let x of [-10,10])for(let z of [-9,2,10]){box(2,.8,2,mat(room==='lounge'?0x7b8c92:0x749f98),x,.5,z)}
 if(room==='dorm'){const pal={mint:0x93cfa7,coral:0xf0a99c,lavender:0xb7a2e3,gold:0xe8ce87};const c=window.GGVSolo?.getDecor()||'mint';const top=box(8,.6,4,mat(pal[c]||pal.mint),0,1.6,-5);state3d.desk=top;box(9,2,4,mat(0xb29377),0,.5,-5);box(4,1.5,2,mat(0xcddfbf),4,2,-6);sphere(1.8,mat(0xe6d5a2),-7,1.7,-4);sign('YOUR DESK','Change colours from Learn',0,5,-4,16);}
 // physical portal back to the main campus, accessible with E
 box(7,8,.7,mat(0x295b59),0,4,14.15);sign('EXIT','Press E · back to campus',0,11,13.4,18);
}
function replaceMyAvatar(){if(!state3d.scene||!state3d.avatar)return;const old=state3d.avatar;const mesh=createAvatar(app.name,app.appearance,{isMe:true});mesh.position.copy(old.position);mesh.rotation.copy(old.rotation);state3d.scene.remove(old);disposeAvatar(old);state3d.scene.add(mesh);state3d.avatar=mesh;}
function buildWorld(){if(!state3d.renderer)return;const old=state3d.scene;if(old){old.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){for(const m of Array.isArray(obj.material)?obj.material:[obj.material]){m.map?.dispose();m.dispose();}}});}
 state3d.tiles.clear();state3d.tileLoader=null;lastTileCheckX=Infinity;lastTileCheckZ=Infinity;const scene=new THREE.Scene();state3d.scene=scene;state3d.boardMesh=null;state3d.buildings=[];state3d.npcs=[];state3d.desk=null;state3d.occluders=[];state3d.actors.clear();scene.add(new THREE.HemisphereLight(0xffffff,0x679289,2.2));const sun=new THREE.DirectionalLight(0xffefd3,2.1);sun.position.set(-80,130,20);scene.add(sun);if(app.room==='plaza')campus();else interior();/* Standalone OpenStreetMap street tiles remain available but are not overlaid on stylized scenery. */const avatar=createAvatar(app.name,app.appearance,{isMe:true});scene.add(avatar);state3d.avatar=avatar;app.near=null;
 const limit=app.room==='plaza'?WORLD_BOUND:11;app.x=THREE.MathUtils.clamp(app.x,-limit,limit);app.z=THREE.MathUtils.clamp(app.z,-limit,limit);avatar.position.set(app.x,0,app.z);ensureSafeSpawn();
 const focus=new THREE.Vector3(app.x,2.7+app.jump,app.z);const h=app.cameraDist*Math.cos(app.cameraPitch);
 state3d.camera.position.copy(keepCameraOutOfBuildings(focus,new THREE.Vector3(app.x+Math.sin(app.cameraYaw)*h,4+app.cameraDist*Math.sin(app.cameraPitch)+app.jump,app.z+Math.cos(app.cameraYaw)*h)));state3d.camera.lookAt(focus);refreshVisibility(true);}
function init3D(){window.GGV_THREE_STARTED=true;const canvas=$('#world');const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;state3d.renderer=renderer;state3d.camera=new THREE.PerspectiveCamera(59,1,.1,1600);resize();window.addEventListener('resize',resize);buildWorld();canvas.addEventListener('pointerdown',e=>{dragging=true;prevPointer=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(dragging&&prevPointer){const dx=e.clientX-prevPointer[0],dy=e.clientY-prevPointer[1];app.cameraYaw-=dx*.006;app.cameraPitch=THREE.MathUtils.clamp(app.cameraPitch+dy*.003,.18,.94);prevPointer=[e.clientX,e.clientY]}});canvas.addEventListener('pointerup',()=>{dragging=false;prevPointer=null});canvas.addEventListener('pointercancel',()=>dragging=false);canvas.addEventListener('click',e=>{if(!state3d.boardMesh||!app.joined||!(app.room in questionRoom))return;const r=canvas.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,state3d.camera);if(ray.intersectObject(state3d.boardMesh).length){setTab('board');notify('The problem is ready in the Learn panel.')}});canvas.addEventListener('wheel',e=>{e.preventDefault();app.cameraDist=THREE.MathUtils.clamp(app.cameraDist+e.deltaY*.02,8,50)},{passive:false});requestAnimationFrame(loop);$('#loading').style.display='none';loadGeographicMap();}
function resize(){if(!state3d.renderer)return;const v=$('#viewport');const w=v.clientWidth,h=v.clientHeight;state3d.renderer.setSize(w,h,false);state3d.camera.aspect=w/h;state3d.camera.updateProjectionMatrix();}
function syncActors(t,dt){if(!state3d.scene)return;const ids=new Set();for(const p of app.players.values()){if(p.id===app.id)continue;ids.add(p.id);let mesh=state3d.actors.get(p.id);const key=appearanceKey(p)+'|'+p.name;if(mesh&&mesh.userData.profileKey!==key){state3d.scene.remove(mesh);disposeAvatar(mesh);state3d.actors.delete(p.id);mesh=null;}
 if(!mesh){mesh=createAvatar(p.name,p);mesh.userData.profileKey=key;mesh.position.set(p.x,0,p.z);state3d.actors.set(p.id,mesh);state3d.scene.add(mesh)}
 const previous=mesh.position.clone();mesh.position.lerp(new THREE.Vector3(p.x,0,p.z),1-Math.exp(-11*dt));const delta=mesh.position.clone().sub(previous);const speed=Math.hypot(delta.x,delta.z)/Math.max(.01,dt);if(speed>.1)mesh.rotation.y=Math.atan2(delta.x,delta.z);animateAvatar(mesh,dt,{speed,elapsed:t/1000});}
 for(const [id,obj] of [...state3d.actors.entries()])if(!ids.has(id)){state3d.scene.remove(obj);disposeAvatar(obj);state3d.actors.delete(id);}}
function canStand(x,z){
 // FIX: The GIS layer is not a trustworthy gameplay collider. It previously trapped
 // avatars inside approximated/extruded buildings with no validated entrances.
 // Real building collision will return only after real navigable terrain is modelled.
 return app.room!=='plaza' || canWalkInBounds(x,z);
}
// Free navigation / safety visualization: hide nearby unmodelled building massing
// rather than let it fill the whole screen as opaque walls.
function refreshVisibility(force=false){
 if(app.room!=='plaza'||!state3d.scene)return;
 for(const building of state3d.occluders){
  const bounds=building.userData.footprintBounds;
  if(!bounds)continue;
  const cam=state3d.camera?.position;
  const near=shouldHideNearbyBuilding(app.x,app.z,bounds,18) || (cam && shouldHideNearbyBuilding(cam.x,cam.z,bounds,12));
  building.visible=!(nearbyBuildingsHidden && near);
 }
}
function keepCameraOutOfBuildings(focus,desired){
 // FIX: GIS extrusions are deliberately not camera colliders in alpha.
 // Free camera + hide nearby massing avoids seeing only the inside of a wall.
 if(app.room==='plaza')return desired;
 if(app.room!=='plaza'||!state3d.occluders.length)return desired;
 const rayDir=desired.clone().sub(focus),distance=rayDir.length();
 if(distance<.01)return desired;
 rayDir.normalize();
 const minx=Math.min(focus.x,desired.x)-2,maxx=Math.max(focus.x,desired.x)+2;
 const minz=Math.min(focus.z,desired.z)-2,maxz=Math.max(focus.z,desired.z)+2;
 const nearby=state3d.occluders.filter(m=>{const b=m.userData.footprintBounds;return b&&b.maxx>=minx&&b.minx<=maxx&&b.maxz>=minz&&b.minz<=maxz;});
 if(!nearby.length)return desired;
 occlusionRay.set(focus,rayDir);occlusionRay.near=.2;occlusionRay.far=distance;
 const hit=occlusionRay.intersectObjects(nearby,false)[0];
 return hit?focus.clone().addScaledVector(rayDir,Math.max(1.2,hit.distance-.7)):desired;
}
function update(dt,t){if(!app.joined)return;
 const s=keyset;let lx=0,lz=0;
 if(s.has('w')||s.has('arrowup')||touchKey==='up')lz--;
 if(s.has('s')||s.has('arrowdown')||touchKey==='down')lz++;
 if(s.has('a')||s.has('arrowleft')||touchKey==='left')lx--;
 if(s.has('d')||s.has('arrowright')||touchKey==='right')lx++;
 const jump=mobileJumpQueued||s.has('space');mobileJumpQueued=false;
 const next=motion.step(dt,{right:lx,forward:lz,yaw:app.cameraYaw,
   sprint:s.has('shift'),jump,outdoors:app.room==='plaza',
   limit:app.room==='plaza'?WORLD_BOUND:11},canStand);
 const moving=Math.hypot(next.vx,next.vz)>.12;
 app.x=next.x;app.z=next.z;app.jump=next.y;
 app.velocityX=next.vx;app.velocityZ=next.vz;
 if(state3d.avatar){state3d.avatar.position.set(app.x,app.jump,app.z);
  animateAvatar(state3d.avatar,dt,{speed:Math.hypot(next.vx,next.vz),elapsed:t/1000,jump:app.jump});
  if(moving)state3d.avatar.rotation.y=next.facing;}
 if(t-lastVisibilityUpdate>130){refreshVisibility();lastVisibilityUpdate=t;}
 const camera=state3d.camera,yaw=app.cameraYaw;
 const horizontal=app.cameraDist*Math.cos(app.cameraPitch),height=4+app.cameraDist*Math.sin(app.cameraPitch);
 const focus=new THREE.Vector3(app.x,2.7+app.jump,app.z);
 const target=keepCameraOutOfBuildings(focus,new THREE.Vector3(app.x+Math.sin(yaw)*horizontal,height+app.jump,app.z+Math.cos(yaw)*horizontal));
 camera.position.lerp(target,1-Math.exp(-12*dt));
 camera.position.copy(keepCameraOutOfBuildings(focus,camera.position));
 camera.lookAt(focus);
 if(t-lastSent>110){send({type:'move',x:app.x,z:app.z});lastSent=t;}
 if(app.room==='plaza'){
  // No map tiles over the new cartoon pathways.
  app.near=nearClassroom();
  $('#nearby').hidden=!app.near;
  if(app.near)$('#nearby').textContent='E · Enter '+app.near.name+(app.near.room in questionRoom?' · '+questionRoom[app.near.room]:'');
 }else{
  const exitNear=app.z>7;$('#nearby').hidden=!exitNear;
  if(exitNear)$('#nearby').textContent='E · Return to campus';
 }
 if(state3d.npcs.length){for(let i=0;i<state3d.npcs.length;i++){const npc=state3d.npcs[i];if(npc.name==='Professor Nova'){npc.mesh.rotation.y=Math.sin(t*.0005)*.15;continue;}npc.mesh.position.x=npc.x+Math.sin(t*.00035+i)*npc.roam;npc.mesh.position.z=npc.z+Math.cos(t*.00035+i)*npc.roam*.65;npc.mesh.rotation.y=Math.atan2(Math.cos(t*.00035+i),-Math.sin(t*.00035+i));}}
 $('#position').textContent=app.room==='plaza'?`${unproject(app.x,app.z).lat.toFixed(5)}° N, ${Math.abs(unproject(app.x,app.z).lon).toFixed(5)}° W`:`Classroom · ${Math.round(app.x)}, ${Math.round(app.z)}`;
 syncActors(t,dt);
}
function loop(t){const dt=Math.min(.06,(t-(lastAt||t))/1000);lastAt=t;update(dt,t);if(state3d.renderer&&state3d.scene)state3d.renderer.render(state3d.scene,state3d.camera);drawMinimap();requestAnimationFrame(loop);}
function drawMinimap(){
 const c=$('#minimap'),g=c.getContext('2d'),W=c.width,H=c.height;
 const minx=-550,maxx=550,minz=-520,maxz=530;
 const tx=x=>(x-minx)/(maxx-minx)*W,tz=z=>(z-minz)/(maxz-minz)*H;
 g.fillStyle='#739e84';g.fillRect(0,0,W,H);
 if(cityMap.loaded){
  function polygons(items,color){g.fillStyle=color;for(const poly of items){g.beginPath();for(const ring of poly.rings){ring.forEach((p,i)=>i?g.lineTo(tx(p.x),tz(p.z)):g.moveTo(tx(p.x),tz(p.z)));g.closePath();}g.fill('evenodd');}}
  polygons(cityMap.sidewalks,'#d8d5c8');polygons(cityMap.paths,'#ebe0c9');polygons(cityMap.buildings,'#778f95');
 }else{
  // Building points only when the City GIS dataset failed; no pretend rectangles.
  for(const b of landmarks){g.fillStyle='#344d51';g.beginPath();g.arc(tx(b.x),tz(b.z),2.4,0,Math.PI*2);g.fill();}
 }
 for(const b of landmarks){const x=tx(b.x),z=tz(b.z);g.fillStyle='#f4efde';g.font='bold 8px system-ui';g.textAlign='center';g.strokeStyle='#36565b';g.lineWidth=2;g.strokeText(b.abbr,x,z-4);g.fillText(b.abbr,x,z-4);}
 if(app.room==='plaza'){g.fillStyle='#ffb38e';g.beginPath();g.arc(tx(app.x),tz(app.z),4.5,0,2*Math.PI);g.fill();g.strokeStyle='#123f3e';g.lineWidth=1;g.stroke();}
 else {g.fillStyle='#f7ebce';g.font='bold 13px system-ui';g.fillText(rooms[app.room].name,W/2,H/2);}
 g.fillStyle='#173e40';g.font='bold 10px system-ui';g.textAlign='right';g.fillText('N ↑',W-8,13);
}
// WebRTC audio: mutual opt-in, peer mesh within one room; uses public STUN, TURN required for some networks.
async function startVoice(){if(!app.joined)return notify('Enter the game first.');if(!navigator.mediaDevices?.getUserMedia)return notify('Mic needs HTTPS or localhost on a supported browser.');try{voiceStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});voiceEnabled=true;$('#mic-toggle').textContent='🔇 Leave room voice';$('#voice-peers').textContent='Microphone active. Waiting for consenting classmates…';send({type:'voice_state',enabled:true});}catch(err){notify('Microphone permission wasn’t granted.');}}
function closePeers(){for(const [id,v] of voiceConnections){v.pc.close();v.audio.remove()}voiceConnections.clear();}
function stopVoice(){if(voiceEnabled)send({type:'voice_state',enabled:false});voiceEnabled=false;voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;closePeers();$('#mic-toggle').textContent='🎙 Join room voice (off)';$('#voice-peers').textContent='Voice off. Nobody hears you.';}
function peerConnection(id){if(voiceConnections.has(id))return voiceConnections.get(id);const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});const audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audioBin.append(audio);const item={pc,audio,queue:[]};voiceConnections.set(id,item);voiceStream?.getTracks().forEach(track=>pc.addTrack(track,voiceStream));pc.onicecandidate=e=>{if(e.candidate)send({type:'signal',to:id,signal:{type:'candidate',candidate:e.candidate.toJSON()}})};pc.ontrack=e=>{audio.srcObject=e.streams[0];audio.play().catch(()=>notify('Tap the page to allow incoming audio playback.'))};pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'||pc.connectionState==='closed'){pc.close();audio.remove();voiceConnections.delete(id)}};return item;}
async function initiate(id){try{const item=peerConnection(id),pc=item.pc;if(pc.signalingState!=='stable')return;const offer=await pc.createOffer();await pc.setLocalDescription(offer);send({type:'signal',to:id,signal:{type:'offer',sdp:pc.localDescription.sdp}});}catch(e){console.warn('voice offer',e)}}
async function acceptSignal(id,s){if(!voiceEnabled||!app.players.get(id)?.voice)return;try{const item=peerConnection(id),pc=item.pc;if(s.type==='offer'){if(pc.signalingState!=='stable')return;await pc.setRemoteDescription({type:'offer',sdp:s.sdp});const answer=await pc.createAnswer();await pc.setLocalDescription(answer);send({type:'signal',to:id,signal:{type:'answer',sdp:pc.localDescription.sdp}});}else if(s.type==='answer'){if(pc.signalingState==='have-local-offer')await pc.setRemoteDescription({type:'answer',sdp:s.sdp});}else if(s.type==='candidate'){if(!pc.remoteDescription){item.queue.push(s.candidate);return;}await pc.addIceCandidate(s.candidate);}if(pc.remoteDescription){for(const candidate of item.queue.splice(0))await pc.addIceCandidate(candidate);}}catch(e){console.warn('voice signaling',e)}}
function syncVoices(){if(!voiceEnabled)return;const active=new Set([...app.players.values()].filter(p=>p.voice&&p.id!==app.id).map(p=>p.id));for(const [id,item] of voiceConnections)if(!active.has(id)){item.pc.close();item.audio.remove();voiceConnections.delete(id);}for(const id of active)if(app.id<id&&!voiceConnections.has(id))initiate(id);$('#voice-peers').textContent=active.size?`Voice peers enabled: ${active.size}. Some networks need a TURN relay.`:'Microphone active. Waiting for consenting classmates…';}
mountAvatarCreator(appearance=>{app.appearance=normalizeAppearance(appearance);app.color=app.appearance.color;if(app.joined)replaceMyAvatar();});setupUI();init3D();connect();

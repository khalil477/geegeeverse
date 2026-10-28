/** GeeGeeVerse prototype server — Node 20+, zero npm packages. */
import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT) || 3030;
const ROOT = resolve(import.meta.dirname, 'public');
const DATA = resolve(import.meta.dirname, 'data.json');
// In production, an invite code must be configured before any student can enter.
const INVITE_CODE = process.env.INVITE_CODE || '';
if (process.env.NODE_ENV === 'production' && INVITE_CODE.length < 12) {
  console.error('Set INVITE_CODE to a unique value of at least 12 characters before deploying.');
  process.exit(1);
}
const inviteCookie = INVITE_CODE ? createHmac('sha256', INVITE_CODE).update('GeeGeeVerse-invite-v1').digest('hex') : null;
function invited(req) {
  if (!inviteCookie) return true;
  const cookie = (req.headers.cookie || '').split(';').map(v=>v.trim()).find(v=>v.startsWith('ggv_invite='));
  if (!cookie) return false;
  const actual = Buffer.from(cookie.slice('ggv_invite='.length));
  const expected = Buffer.from(inviteCookie);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function gatePage(invalid=false){
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GeeGeeVerse · Private Beta</title><style>
  :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,#d2e5d5 0%,#eff3e8 60%);font:16px/1.5 system-ui,sans-serif;color:#213f37;padding:24px}main{width:min(420px,100%);background:#fffaf0;padding:35px 28px;border-radius:24px;box-shadow:0 16px 70px #29534418}h1{font-size:30px;letter-spacing:-.05em;line-height:1.12;margin:0 0 12px}p{color:#526e64;margin:0 0 22px}.mark{font-size:28px;margin-bottom:12px}label{display:block;font-weight:650;margin-bottom:8px}input{width:100%;font:inherit;padding:13px;border:1px solid #a6b8ad;border-radius:12px;outline-offset:3px}button{margin-top:14px;width:100%;padding:14px;background:#205d4f;border:0;border-radius:13px;color:white;font:700 16px system-ui;cursor:pointer}button:hover{background:#17473d}.error{color:#ae3333;font-weight:600;margin-top:12px}.note{font-size:12px;margin-top:18px;margin-bottom:0}</style></head><body><main><div class="mark">🎮 ✦</div><h1>Welcome to GeeGeeVerse</h1><p>A little universe for university students. This early multiplayer prototype is invite-only.</p><form action="/enter" method="POST"><label for="code">Your invite code</label><input id="code" name="code" type="password" autocomplete="off" maxlength="128" required autofocus><button>Enter the campus</button></form>${invalid?'<div class="error" role="alert">That code didn’t work. Please try again.</div>':''}<p class="note">For private testing only. Don’t share personal information in public chat or posts.</p></main></body></html>`;
}
const gateHeaders={'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
const gateAttempts=new Map();
function limited(req){const key=String(req.socket.remoteAddress || 'visitor');const now=Date.now();const attempt=gateAttempts.get(key)||{n:0,since:now};if(now-attempt.since>15*60*1000){attempt.n=0;attempt.since=now;}attempt.n++;gateAttempts.set(key,attempt);return attempt.n>20;}

const ROOMS = ['plaza','study','lounge','chm1311','bio1140','psy1101','mat1320'];
const CLASS_ROOMS = new Set(['chm1311','bio1140','psy1101','mat1320']);
const whiteboards = Object.fromEntries([...CLASS_ROOMS].map(room => [room, []]));
const questions = [
  {id:'q1',course:'CHM 1311',q:'Which piece of glassware is designed to deliver a precise, fixed volume of liquid?',choices:['Beaker','Volumetric pipette','Erlenmeyer flask'],answer:1,why:'A volumetric pipette is calibrated to deliver one specific volume accurately.'},
  {id:'q2',course:'CHM 1311',q:'In gravity filtration, which part of a mixture usually passes through the filter paper?',choices:['The filtrate (liquid)','All the solid crystals','Only the filter paper'],answer:0,why:'The liquid filtrate passes through; insoluble solids are retained on the filter.'},
  {id:'q3',course:'BIO 1140',q:'Which organelle is most closely associated with producing ATP in eukaryotic cells?',choices:['Nucleus','Golgi apparatus','Mitochondrion'],answer:2,why:'Mitochondria generate most ATP through cellular respiration.'},
  {id:'q4',course:'PSY 1101',q:'A memory strategy that spaces practice over several days is called…',choices:['Distributed practice','Massed practice','Sensory adaptation'],answer:0,why:'Distributed (spaced) practice generally improves long-term retention.'},
  {id:'q5',course:'MAT 1320',q:'If f(x) = x² + 3x, what is f′(x)?',choices:['x + 3','2x + 3','2x'],answer:1,why:'Differentiate term by term: d(x²)/dx = 2x and d(3x)/dx = 3.'}
];
const demoPosts = [
  {id:'demo1',course:'CHM 1311',author:'Campus guide',body:'Anyone reviewing filtration this week? Visit the Study Hall for a quick practice challenge.',likes:6,likedBy:[],created:Date.now()-7200000,replies:[{author:'Campus guide',body:'Tip: know the difference between filtrate and residue!',created:Date.now()-3600000}],demo:true},
  {id:'demo2',course:'General',author:'Campus guide',body:'Welcome to GeeGeeVerse! This is a prototype board, not a live feed from Reddit.',likes:9,likedBy:[],created:Date.now()-30000000,replies:[],demo:true},
  {id:'demo3',course:'PSY 1101',author:'Campus guide',body:'What study techniques help you remember material after a week?',likes:4,likedBy:[],created:Date.now()-13000000,replies:[],demo:true}
];
let db = {posts:demoPosts};
try { if (existsSync(DATA)) { const parsed=JSON.parse(await readFile(DATA,'utf8')); if (Array.isArray(parsed.posts)) db=parsed; } } catch(err){ console.warn('Could not load posts:',err.message); }
let saveQueue = Promise.resolve();
function save(){ saveQueue=saveQueue.then(()=>writeFile(DATA,JSON.stringify(db,null,2))).catch(console.error); }
function clean(v,max=200){return String(v??'').replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
const clients=new Map();
function publicPlayer(p){return {id:p.id,name:p.name,color:p.color,hair:p.hair,x:p.x,z:p.z,room:p.room,xp:p.xp,voice:!!p.voice};}
function roomPlayers(room){return [...clients.values()].filter(p=>p.ready && p.room===room).map(publicPlayer);}
function roomsCount(){return Object.fromEntries(ROOMS.map(r=>[r,roomPlayers(r).length]));}
function send(ws,msg){if(ws.destroyed||!ws.writable) return;const payload=Buffer.from(JSON.stringify(msg));let header;if(payload.length<126){header=Buffer.from([0x81,payload.length]);}else if(payload.length<65536){header=Buffer.alloc(4);header[0]=0x81;header[1]=126;header.writeUInt16BE(payload.length,2);}else return;try{ws.write(Buffer.concat([header,payload]));}catch{}}
function broadcast(room,msg,except){for(const p of clients.values())if(p.ready&&p.room===room && p.socket!==except) send(p.socket,msg);}
function announce(){const info={type:'counts',counts:roomsCount()};for(const p of clients.values())if(p.ready)send(p.socket,info);}
function publishState(room){broadcast(room,{type:'presence',players:roomPlayers(room)});announce();}
function decodeFrames(p,chunk){p.buffer=Buffer.concat([p.buffer,chunk]);if(p.buffer.length>128*1024){p.socket.destroy();return;}while(p.buffer.length>=2){const b0=p.buffer[0],b1=p.buffer[1];let length=b1&127,offset=2;if(length===126){if(p.buffer.length<4)return;length=p.buffer.readUInt16BE(2);offset=4;}if(length===127 || length>16*1024){p.socket.destroy();return;}if(!(b1&128)){p.socket.destroy();return;}if(p.buffer.length<offset+4+length)return;const mask=p.buffer.subarray(offset,offset+4);const payload=Buffer.from(p.buffer.subarray(offset+4,offset+4+length));p.buffer=p.buffer.subarray(offset+4+length);for(let i=0;i<payload.length;i++) payload[i]^=mask[i%4];const opcode=b0&0x0f;if(opcode===8){p.socket.end();return;}if(opcode===9){const pong=Buffer.concat([Buffer.from([0x8a,payload.length]),payload]);p.socket.write(pong);continue;}if(opcode!==1 || !(b0&0x80))continue;let msg;try{msg=JSON.parse(payload.toString('utf8'));}catch{continue;}handle(p,msg);}}
function allowed(p,key,gap){const now=Date.now();const last=p.limits.get(key)||0;if(now-last<gap)return false;p.limits.set(key,now);return true;}
function handle(p,m){if(!m||typeof m!=='object')return;
  if(m.type==='join'){
    const oldRoom = p.ready ? p.room : null;
    p.name=clean(m.name,20)||'Guest';p.color=['coral','mint','lavender','gold','sky'].includes(m.color)?m.color:'coral';p.hair=['short','curly','bun','cap'].includes(m.hair)?m.hair:'short';p.ready=true;p.room='plaza';p.voice=false;
    send(p.socket,{type:'welcome',id:p.id,players:roomPlayers(p.room),posts:db.posts.slice(-80).reverse(),questions:questions.map(({answer,...q})=>q),counts:roomsCount(),xp:p.xp,board:[]});publishState('plaza');if(oldRoom&&oldRoom!=='plaza')publishState(oldRoom);return;
  }
  if(!p.ready)return;
  if(m.type==='move'&&allowed(p,'move',55)){const x=Number(m.x),z=Number(m.z);if(!Number.isFinite(x)||!Number.isFinite(z))return;const bound=p.room==='plaza'?170:12;p.x=Math.max(-bound,Math.min(bound,x));p.z=Math.max(-bound,Math.min(bound,z));broadcast(p.room,{type:'moved',id:p.id,x:p.x,z:p.z},p.socket);}
  else if(m.type==='room'&&allowed(p,'room',650)&&ROOMS.includes(m.room)) {const old=p.room;p.room=m.room;p.voice=false;p.x=0;p.z=2;send(p.socket,{type:'room',room:p.room,players:roomPlayers(p.room),board:whiteboards[p.room]||[]});publishState(old);publishState(p.room);}
  else if(m.type==='chat'&&allowed(p,'chat',950)){const body=clean(m.body,220);if(!body)return;broadcast(p.room,{type:'chat',id:randomUUID(),author:p.name,color:p.color,body,at:Date.now()},null);}
  else if(m.type==='post'&&allowed(p,'post',12000)){const body=clean(m.body,340);if(body.length<5)return;const course=['General','CHM 1311','BIO 1140','PSY 1101'].includes(m.course)?m.course:'General';const post={id:randomUUID(),course,author:p.name,body,likes:0,likedBy:[],created:Date.now(),replies:[],demo:false};db.posts.push(post);db.posts=db.posts.slice(-150);save();for(const c of clients.values())if(c.ready)send(c.socket,{type:'post',post});}
  else if(m.type==='reply'&&allowed(p,'reply',3000)){const post=db.posts.find(q=>q.id===m.postId);const body=clean(m.body,180);if(!post||body.length<2||post.replies.length>=50)return;const reply={author:p.name,body,created:Date.now()};post.replies.push(reply);save();for(const c of clients.values())if(c.ready)send(c.socket,{type:'reply',postId:post.id,reply});}
  else if(m.type==='like'&&allowed(p,'like',500)){const post=db.posts.find(q=>q.id===m.postId);if(!post)return;post.likedBy ||= [];if(post.likedBy.includes(p.id))return;post.likedBy.push(p.id);post.likes++;save();for(const c of clients.values())if(c.ready)send(c.socket,{type:'liked',postId:post.id,likes:post.likes});}
  else if(m.type==='board_submit' && CLASS_ROOMS.has(p.room) && allowed(p,'board_submit',2500)){
    const content=clean(m.content,180);if(content.length<2)return;
    const entry={id:randomUUID(),author:p.name,color:p.color,content,at:Date.now()};
    whiteboards[p.room].push(entry);whiteboards[p.room]=whiteboards[p.room].slice(-20);
    broadcast(p.room,{type:'board_entry',room:p.room,entry},null);
  }
  else if(m.type==='voice_state' && allowed(p,'voice_state',300)){
    const voiceCount=roomPlayers(p.room).filter(q=>q.voice).length;
    if(m.enabled && !p.voice && voiceCount>=8){send(p.socket,{type:'voice_limit'});return;}
    p.voice=m.enabled===true;publishState(p.room);
  }
  else if(m.type==='signal' && p.voice && allowed(p,'signal',5)){
    const recipient=[...clients.values()].find(c=>c.id===m.to&&c.ready&&c.room===p.room);
    if(!recipient||!recipient.voice||!m.signal||typeof m.signal!=='object')return;
    const kind=m.signal.type;
    if(!['offer','answer','candidate'].includes(kind))return;
    const signal={type:kind};
    if(kind==='candidate'){const cand=m.signal.candidate;if(!cand||typeof cand!=='object'||typeof cand.candidate!=='string'||cand.candidate.length>2400)return;signal.candidate={candidate:cand.candidate,sdpMid:typeof cand.sdpMid==='string'?cand.sdpMid.slice(0,50):null,sdpMLineIndex:Number.isInteger(cand.sdpMLineIndex)?cand.sdpMLineIndex:null};}
    else {if(typeof m.signal.sdp!=='string'||m.signal.sdp.length>11000)return;signal.sdp=m.signal.sdp;}
    send(recipient.socket,{type:'signal',from:p.id,signal});
  }
  else if(m.type==='quiz'&&allowed(p,'quiz',450)){const q=questions.find(q=>q.id===m.id);if(!q||!Number.isInteger(m.choice))return;const correct=q.answer===m.choice;let reward=0;if(correct&&!p.completed.has(q.id)){p.completed.add(q.id);p.xp+=25;reward=25;}send(p.socket,{type:'quizResult',id:q.id,choice:m.choice,correct,why:q.why,reward,xp:p.xp});}
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{try{
  if (req.url==='/health' && req.method==='GET') {res.writeHead(200,{'content-type':'text/plain','cache-control':'no-store'}).end('ok');return;}
  if (req.url==='/enter' && req.method==='POST' && inviteCookie) {
    if(limited(req)){res.writeHead(429,{'content-type':'text/plain'}).end('Too many attempts');return;}
    let body='';for await(const chunk of req){body+=chunk.toString('utf8');if(body.length>2048){res.writeHead(413).end();return;}}
    const candidate=new URLSearchParams(body).get('code')||'';const a=Buffer.from(candidate),b=Buffer.from(INVITE_CODE);
    if(a.length===b.length && timingSafeEqual(a,b)){
      const secure=(req.headers['x-forwarded-proto']==='https' || req.socket.encrypted)?'; Secure':'';
      res.writeHead(303,{'location':'/','set-cookie':`ggv_invite=${inviteCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`,'cache-control':'no-store'}).end();return;
    }
    res.writeHead(401,gateHeaders).end(gatePage(true));return;
  }
  if (!invited(req)) {res.writeHead(403,gateHeaders).end(gatePage(false));return;}
  if (req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405).end();return;}
  const url=new URL(req.url,'http://localhost');const pathname=decodeURIComponent(url.pathname);const rel=pathname==='/'?'/index.html':pathname;if(!/^\/[a-zA-Z0-9_./-]+$/.test(rel)||rel.includes('..')){res.writeHead(400).end();return;}const path=resolve(ROOT,'.'+rel);if(!path.startsWith(ROOT+'/')){res.writeHead(403).end();return;}const buf=await readFile(path);res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream','cache-control':'no-cache','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; connect-src 'self' ws: wss:; style-src 'self' 'unsafe-inline'; script-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'"});res.end(buf);}catch(err){res.writeHead(404,{'content-type':'text/plain'}).end('Not found');}});
server.on('upgrade',(req,socket)=>{if(req.url!=='/ws'||!invited(req)){socket.destroy();return;}const key=req.headers['sec-websocket-key'];if(!key||!/^[A-Za-z0-9+/]{22}==$/.test(key)){socket.destroy();return;}const accept=createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');const p={id:randomUUID(),socket,buffer:Buffer.alloc(0),ready:false,room:'plaza',name:'Guest',color:'coral',hair:'short',x:0,z:2,xp:0,voice:false,completed:new Set(),limits:new Map()};clients.set(socket,p);socket.on('data',chunk=>{try{decodeFrames(p,chunk);}catch{socket.destroy();}});const cleanup=()=>{if(!clients.has(socket))return;clients.delete(socket);if(p.ready)publishState(p.room);};socket.on('close',cleanup);socket.on('end',cleanup);socket.on('error',cleanup);});
server.listen(PORT,'0.0.0.0',()=>console.log(`\n🏫 GeeGeeVerse is running!\n   Open http://localhost:${PORT}\n   Open two tabs to test multiplayer.\n   Ctrl+C to stop.\n`));

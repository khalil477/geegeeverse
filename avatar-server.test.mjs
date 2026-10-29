import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';

test('multiplayer avatar appearance is visible to other players and validates updates',async()=>{
 const port=35000+Math.floor(Math.random()*900);
 const server=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),NODE_ENV:'development',INVITE_CODE:''},stdio:'ignore'});
 const peers=[];
 function wait(ws,type,check=()=>true){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.removeEventListener('message',handler);reject(new Error('Expected '+type))},3000);function handler(ev){const d=JSON.parse(ev.data);if(d.type===type&&check(d)){clearTimeout(timer);ws.removeEventListener('message',handler);resolve(d);}}ws.addEventListener('message',handler);})}
 async function connect(){const ws=new WebSocket(`ws://127.0.0.1:${port}/ws`);peers.push(ws);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});return ws}
 try{
  let ready=false;for(let i=0;i<60;i++){try{ready=(await fetch(`http://127.0.0.1:${port}/health`)).ok;if(ready)break}catch{}await delay(35);}assert.equal(ready,true);
  const a=await connect();const b=await connect();
  const w=wait(a,'welcome');a.send(JSON.stringify({type:'join',name:'A',color:'mint',skin:'peach',hair:'bob',style:'jacket',accessory:'glasses',pants:'forest'}));const wa=await w;
  const wbWait=wait(b,'welcome');b.send(JSON.stringify({type:'join',name:'B'}));const wb=await wbWait;
  assert.deepEqual(Object.fromEntries(['color','skin','hair','style','accessory','pants'].map(k=>[k,wb.players.find(p=>p.id===wa.id)[k]])),{color:'mint',skin:'peach',hair:'bob',style:'jacket',accessory:'glasses',pants:'forest'});
  const update=wait(b,'presence',m=>m.players.some(p=>p.id===wa.id&&p.hair==='curls'));
  a.send(JSON.stringify({type:'profile',name:'A',color:'sky',hair:'curls',skin:'INVALID',style:'hoodie',accessory:'backpack',pants:'denim'}));
  const after=await update;const x=after.players.find(p=>p.id===wa.id);
  assert.equal(x.hair,'curls');assert.equal(x.color,'sky');assert.equal(x.skin,'amber');
 }finally{peers.forEach(ws=>ws.close());server.kill();}
});

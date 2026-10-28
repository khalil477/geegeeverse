import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const port=31000+Math.floor(Math.random()*999);
const server=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port)},stdio:'pipe'});
server.stderr.on('data',d=>process.stderr.write(d));
process.on('exit',()=>server.kill());
async function waitForStartup(){for(let n=0;n<40;n++){try{const r=await fetch(`http://127.0.0.1:${port}/health`);if(r.ok)return;}catch{}await delay(60);}throw Error('Server not reachable')}
function expectMessage(ws,type,filter=()=>true,ms=2500){return new Promise((res,rej)=>{const timer=setTimeout(()=>{ws.removeEventListener('message',handle);rej(Error('Missing '+type))},ms);function handle(e){const m=JSON.parse(e.data);if(m.type===type&&filter(m)){clearTimeout(timer);ws.removeEventListener('message',handle);res(m)}}ws.addEventListener('message',handle);})}
async function open(){const ws=new WebSocket(`ws://127.0.0.1:${port}/ws`);await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});return ws}
async function call(ws,msg,type,filter){const reply=expectMessage(ws,type,filter);ws.send(JSON.stringify(msg));return reply;}
test('Campus 3D multiplayer: classrooms, board, voice signals',async()=>{await waitForStartup();const a=await open(),b=await open();try{
const wa=await call(a,{type:'join',name:'Learner A',color:'sky'},'welcome');const wb=await call(b,{type:'join',name:'Learner B',color:'mint'},'welcome');assert.equal(wa.questions.length,5);assert.equal(wb.players.length,2);
let ra=await call(a,{type:'room',room:'chm1311'},'room');let rb=await call(b,{type:'room',room:'chm1311'},'room');assert.equal(ra.room,'chm1311');assert.deepEqual(rb.board,[]);
await delay(680);const msg=expectMessage(b,'board_entry');a.send(JSON.stringify({type:'board_submit',content:'A volumetric pipette provides a fixed accurate volume.'}));assert.match((await msg).entry.content,/volumetric pipette/);
const result=await call(a,{type:'quiz',id:'q1',choice:1},'quizResult');assert.equal(result.correct,true);assert.equal(result.reward,25);
const state=expectMessage(b,'presence',x=>x.players.some(p=>p.id===wa.id&&p.voice));a.send(JSON.stringify({type:'voice_state',enabled:true}));await state;
await call(b,{type:'voice_state',enabled:true},'presence',x=>x.players.some(p=>p.id===wb.id&&p.voice));
const signal=expectMessage(b,'signal');a.send(JSON.stringify({type:'signal',to:wb.id,signal:{type:'offer',sdp:'v=0\r\n'}}));assert.equal((await signal).signal.type,'offer');
}finally{a.close();b.close();server.kill();}});

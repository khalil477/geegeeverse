/* GeeGeeVerse solo adventures. No credentials or personal details are saved.
   Save data stays on the player's own browser; online multiplayer is separate. */
(()=>{
'use strict';
const STORAGE='ggv-solo-v04';
const courses={
 chm1311:{title:'CHM 1311',name:'The Filtration Mission',mentor:'Professor Nova',intro:'Learn to separate a sand-and-water mixture. Explore the concepts, then try the 3D lab adventure.',questions:[
  {q:'What does the filter paper hold back during gravity filtration?',options:['The insoluble solid','All the water','Only dissolved salt'],correct:0,hint:'Think about which particles are too large to pass through.',why:'The insoluble solid (residue) remains on the paper; the liquid filtrate flows through.'},
  {q:'Which equipment supports the filter paper during gravity filtration?',options:['Funnel','Thermometer','Bunsen burner'],correct:0,hint:'Imagine a cone-shaped holder that directs the flowing liquid.',why:'A funnel supports the paper and directs the liquid into a receiving container.'},
  {q:'Why rinse the container after transferring the mixture?',options:['To wash remaining solid onto the filter','To make the paper completely dry','To change the solid into a gas'],correct:0,hint:'Some particles may cling to the original container.',why:'Rinsing helps transfer the remaining solid for a more complete separation.'},
 ]},
 bio1140:{title:'BIO 1140',name:'Cell Explorer',mentor:'Professor Cedar',intro:'Explore the jobs of organelles and how cells make energy.',questions:[
  {q:'Which organelle makes most ATP during aerobic respiration?',options:['Mitochondrion','Nucleus','Golgi apparatus'],correct:0,hint:'It is sometimes called the cell’s powerhouse.',why:'Mitochondria convert energy from nutrients into ATP using respiration.'},
  {q:'What controls the movement of many substances in and out of a cell?',options:['Cell membrane','Ribosomes','Nucleolus'],correct:0,hint:'Think of the selective boundary of the cell.',why:'The cell membrane is selectively permeable and controls transport.'},
  {q:'What is a major function of ribosomes?',options:['Make proteins','Store genetic instructions only','Digest all nutrients'],correct:0,hint:'They read instructions to build an essential kind of molecule.',why:'Ribosomes assemble amino acids into proteins.'},
 ]},
 psy1101:{title:'PSY 1101',name:'Memory Detective',mentor:'Professor Sage',intro:'Learn simple strategies from cognitive psychology.',questions:[
  {q:'Which method usually supports long-term remembering?',options:['Spaced practice','All-night cramming','Never reviewing'],correct:0,hint:'Short reviews spread across several days work surprisingly well.',why:'Spacing practice over time strengthens long-term retention.'},
  {q:'Retrieval practice means…',options:['Trying to recall information from memory','Only rereading notes','Highlighting every line'],correct:0,hint:'Imagine testing yourself without looking at the answer.',why:'Actively recalling information can improve later memory.'},
  {q:'A student recalls a term better when connecting it to a real example. This is…',options:['Elaborative encoding','Sensory adaptation','Random guessing'],correct:0,hint:'The word suggests adding meaningful connections.',why:'Elaborating creates richer associations that make memories easier to retrieve.'},
 ]},
 mat1320:{title:'MAT 1320',name:'Derivative Quest',mentor:'Professor Vector',intro:'Practice rates of change with mini challenges.',questions:[
  {q:'What is the derivative of x²?',options:['2x','x³','2'],correct:0,hint:'Apply the power rule to x raised to the power 2.',why:'The power rule gives d(x²)/dx = 2x.'},
  {q:'What is the derivative of the constant 7?',options:['0','7','x'],correct:0,hint:'A constant does not change as x changes.',why:'The derivative measures change. A constant has a rate of change of zero.'},
  {q:'At a point, the derivative describes…',options:['Instantaneous rate of change','Only total area under a curve','The number of graph labels'],correct:0,hint:'Think of the slope of a tangent line.',why:'The derivative is the slope of the tangent line and an instantaneous rate of change.'},
 ]}
};
const labSteps=[
 {title:'Set up the apparatus',desc:'Choose the equipment that belongs inside the funnel.',options:['Folded filter paper','A metal spoon','An empty test tube'],correct:0,why:'Folded filter paper fits inside the funnel and provides the filtering surface.'},
 {title:'Transfer the mixture',desc:'What should you do with the sand-and-water suspension?',options:['Pour it carefully into the funnel','Pour it directly into the sink','Seal it in a closed bottle'],correct:0,why:'Careful pouring allows liquid to pass through the paper while solid is retained.'},
 {title:'Recover the solid',desc:'Some sand remains on the sides of the beaker. What should you do?',options:['Rinse the remaining particles into the funnel','Ignore the remaining sand','Remove the filter paper immediately'],correct:0,why:'A gentle rinse helps transfer residual material to the filter.'},
 {title:'Observe the result',desc:'Where is the sand after filtration?',options:['On the filter paper','Dissolved in the water','Inside the thermometer'],correct:0,why:'Sand is an insoluble solid and is retained as the residue.'}
];
const missions=[
 {id:'arrive',title:'Welcome to campus',detail:'Enter GeeGeeVerse with an avatar',xp:30},
 {id:'chem',title:'Find your chemistry class',detail:'Visit CHM 1311 in the STEM complex',xp:40},
 {id:'mentor',title:'Meet Professor Nova',detail:'Talk to the NPC chemistry professor',xp:30},
 {id:'quiz',title:'Solve the board',detail:'Finish three CHM 1311 learning questions',xp:75},
 {id:'lab',title:'Junior Lab Explorer',detail:'Complete the gravity filtration activity',xp:100},
 {id:'dorm',title:'Make it yours',detail:'Visit your dorm study nook and change its decor',xp:35}
];
let data,api={notify:()=>{},goRoom:()=>{},room:()=> 'plaza'},current='plaza',view='practice',selected=null,labStage=0,labFeedback='',hint=false,feedback='';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
function load(){try{const p=JSON.parse(localStorage.getItem(STORAGE)||'{}');return {completed:p.completed||{},finished:p.finished||{},xp:Number(p.xp)||0,decor:p.decor||'mint',lab:Number(p.lab)||0}}catch{return {completed:{},finished:{},xp:0,decor:'mint',lab:0}}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(data))}catch{}}
function reward(key,amount){if(data.finished[key])return false;data.finished[key]=true;data.xp+=amount;save();api.notify('✨ +'+amount+' XP · Adventure progress saved');renderQuest();return true}
function mission(id){if(data.completed[id])return;data.completed[id]=true;const m=missions.find(m=>m.id===id);if(m)reward('mission:'+id,m.xp);save();renderQuest()}
function init(options){api={...api,...options};data=load();document.querySelector('#quests-btn')?.addEventListener('click',()=>toggleQuests(true));document.querySelector('#close-quests')?.addEventListener('click',()=>toggleQuests(false));renderQuest();updateXP();}
function toggleQuests(open){const m=document.getElementById('quests');if(m)m.hidden=!open;renderQuest()}
function updateXP(){const label=document.getElementById('solo-xp');if(label)label.textContent=data.xp+' XP';}
function renderQuest(){if(!data)return;updateXP();const toast=document.getElementById('quest-toast');if(toast){const next=missions.find(m=>!data.completed[m.id]);toast.textContent=next?'✦ Your quest: '+next.title:'🏆 All starter quests complete!';}const root=document.querySelector('#quest-list');if(!root)return;root.replaceChildren();const done=missions.filter(m=>data.completed[m.id]).length;
 const head=el('div','quest-progress');head.append(el('b',null,done+' of '+missions.length+' missions complete'),el('span',null,data.xp+' XP earned'));root.append(head);
 const bar=el('div','quest-track');const fill=el('div','quest-fill');fill.style.width=(done/missions.length*100)+'%';bar.append(fill);root.append(bar);
 missions.forEach((m,i)=>{const row=el('div','mission-row'+(data.completed[m.id]?' done':''));row.append(el('span','mission-icon',data.completed[m.id]?'✓':String(i+1)),el('div','mission-copy'));row.children[1].append(el('b',null,m.title),el('small',null,m.detail));row.append(el('span','mission-xp','+'+m.xp));root.append(row)});
}
function enter(room){current=room;selected=null;hint=false;feedback='';labFeedback='';if(room==='chm1311')mission('chem');if(room==='dorm')mission('dorm-visit');render();}
function begin(){mission('arrive');render()}
function talk(){if(current!=='chm1311'&&!(current in courses)){api.notify('Find a professor in a classroom first.');return}if(current==='chm1311')mission('mentor');const c=courses[current];api.notify(`${c.mentor}: ${c.intro} Start with a hint if you get stuck!`);render()}
function heading(root,title,sub){root.append(el('div','solo-eyebrow','✦ PERSONAL LEARNING PATH'));root.append(el('h2','solo-title',title));root.append(el('p','solo-subtitle',sub))}
function btn(text,cl,action){const b=el('button',cl,text);b.type='button';b.addEventListener('click',action);return b}
function render(){if(!data)return;updateXP();document.dispatchEvent(new Event('ggv:learnupdate'));const root=document.querySelector('#solo-panel');if(!root)return;root.replaceChildren();const c=courses[current];
 if(current==='plaza'){heading(root,'Your campus adventure','Explore at your own pace. Even if nobody else is online, your quests are ready.');const card=el('div','solo-feature');card.append(el('span','solo-emoji','🧪'),el('b',null,'Start your chemistry story'),el('p',null,'Meet Professor Nova in the STEM complex, solve problems and run your first virtual lab.'));card.append(btn('Go to CHM 1311 →','solo-primary',()=>api.goRoom('chm1311')));root.append(card);root.append(btn('✨ Open my quest book','solo-secondary',()=>toggleQuests(true)));return}
 if(current==='study'){heading(root,'Study Hall','Take a break, review a topic, or head to a classroom to tackle your next mission.');root.append(btn('🧪 Practice chemistry','solo-primary',()=>api.goRoom('chm1311')));root.append(btn('✨ View quest progress','solo-secondary',()=>toggleQuests(true)));return}
 if(current==='lounge'){heading(root,'Student lounge','Catch your breath! This space is open even when you are the only person online.');root.append(el('p','solo-blurb','Explore, send a message, or step into a class. Your progress stays saved in this browser.'));root.append(btn('Visit your personal study nook','solo-primary',()=>api.goRoom('dorm')));return}
 if(current==='dorm'){
 heading(root,'My Study Nook','Decorate your room as you learn. Your choices are saved in this browser.');root.append(el('div','solo-eyebrow','DESK COLOUR'));
 const colors=[['mint','🌿 Sage'],['lavender','💜 Lilac'],['coral','🧡 Peach'],['gold','☀️ Sunshine']];const row=el('div','decor-row');colors.forEach(([value,label])=>{const b=btn(label,'decor-choice'+(data.decor===value?' selected':''),()=>{data.decor=value;save();mission('dorm');api.onDecor?.(value);render()});row.append(b)});root.append(row);
 root.append(el('p','solo-blurb','Earn XP in classes to make your study nook feel like home. More furniture unlocks can be added later.'));root.append(btn('Open my mission book','solo-secondary',()=>toggleQuests(true)));return;
 }
 if(!c){heading(root,'Discover campus','Choose a course from the map.');return}
 heading(root,c.title,c.intro);
 const mentor=el('div','mentor-box');mentor.append(el('span','mentor-avatar','👩‍🏫'));const mid=el('div','mentor-info');mid.append(el('b',null,c.mentor),el('small',null,'Friendly NPC · always available'));mentor.append(mid);mentor.append(btn('Talk','mentor-button',talk));root.append(mentor);
 const tabs=el('div','solo-switch');tabs.append(btn('📖 Board problems','solo-choice'+(view==='practice'?' active':''),()=>{view='practice';feedback='';hint=false;render()}));if(current==='chm1311')tabs.append(btn('🧪 Virtual lab','solo-choice'+(view==='lab'?' active':''),()=>{view='lab';labFeedback='';render()}));root.append(tabs);
 if(view==='lab'&&current==='chm1311'){renderLab(root);return}
 renderPractice(root,c);
}
function renderPractice(root,c){const done=c.questions.filter((q,i)=>data.finished['q:'+current+':'+i]).length;const summary=el('div','lesson-header');summary.append(el('b',null,`Challenge board · ${done}/${c.questions.length} mastered`));summary.append(el('span',null,'+25 XP per new answer'));root.append(summary);
 const activeIndex=selected===null?Math.min(done,c.questions.length-1):selected;
 const selector=el('div','lesson-selector');c.questions.forEach((q,i)=>{const b=btn(data.finished['q:'+current+':'+i]?'✓ '+(i+1):'0'+(i+1),'lesson-chip'+(activeIndex===i?' active':''),()=>{selected=i;hint=false;feedback='';render()});selector.append(b)});root.append(selector);
 const q=c.questions[activeIndex];const box=el('div','problem-card');box.append(el('div','problem-label','ON THE CLASSROOM BOARD'));box.append(el('div','problem-question',q.q));const answers=el('div','problem-options');q.options.forEach((option,i)=>{const b=btn(String.fromCharCode(65+i)+'. '+option,'problem-option',()=>{
 const correct=i===q.correct;selected=activeIndex;feedback=correct?'✓ Correct! '+q.why:'Not quite. '+(hint?q.why:'Think it through and try again.');if(correct){reward('q:'+current+':'+activeIndex,25);if(current==='chm1311'&&c.questions.every((a,j)=>data.finished['q:'+current+':'+j]))mission('quiz');}render();
 });answers.append(b)});box.append(answers);
 if(feedback)box.append(el('div','lesson-feedback',feedback));
 if(hint)box.append(el('p','hint-text','💡 Hint: '+q.hint));
 box.append(btn(hint?'Hide hint':'💡 Need a hint?','hint-button',()=>{hint=!hint;render()}));root.append(box);if(data.finished['q:'+current+':'+activeIndex]&&activeIndex<c.questions.length-1)root.append(btn('Next board question →','solo-primary',()=>{selected=activeIndex+1;hint=false;feedback='';render()}));
 root.append(btn('✨ My progress','solo-secondary',()=>toggleQuests(true)));
}
function renderLab(root){const finished=data.lab>=labSteps.length;const wrap=el('div','lab-card');const progress=el('div','lab-topline');progress.append(el('b',null,'Gravity filtration · Interactive lab'),el('span',null,finished?'Completed':`Step ${labStage+1} / ${labSteps.length}`));wrap.append(progress);
 const visual=el('div','lab-visual');visual.innerHTML=`<svg viewBox="0 0 330 138" width="100%" xmlns="http://www.w3.org/2000/svg" aria-label="Illustration of beaker, funnel, filter paper and receiving flask"><rect width="330" height="138" rx="12" fill="#eaf1e9"/><path d="M36 51h45l-5 48Q58 109 41 99Z" fill="#bbdbdb" stroke="#578a85" stroke-width="2"/><path d="M42 75h34l-3 22Q58 104 44 96Z" fill="#c9a179"/><path d="M93 57l41 16" stroke="#74918c" stroke-width="3" stroke-dasharray="5 4"/><path d="M146 38h81l-34 39v24" fill="#d6e9e3" stroke="#548580" stroke-width="3"/><path d="M163 43h48l-24 26Z" fill="#fbf7ec" stroke="#bdc7b8"/><path d="M175 50h24l-12 15Z" fill="#c8a179"/><path d="M175 102h38l-4 22h-30Z" fill="#b5d9df" stroke="#548580" stroke-width="2"/><path d="M179 113h30" stroke="#8bc0cc" stroke-width="6"/><text x="57" y="122" font-size="12" text-anchor="middle" fill="#46675d">Beaker</text><text x="188" y="20" font-size="12" text-anchor="middle" fill="#46675d">Funnel + paper</text><text x="276" y="65" font-size="30" fill="#537f71">✦</text><text x="276" y="84" font-size="11" fill="#537f71" text-anchor="middle">Learning lab</text></svg>`;wrap.append(visual);
 if(finished){wrap.append(el('h3',null,'🏆 Lab Explorer unlocked!'));wrap.append(el('p','solo-blurb','You completed the virtual filtration sequence. You can replay the simulation anytime.'));wrap.append(btn('↻ Replay the lab','solo-primary',()=>{labStage=0;labFeedback='';data.lab=0;save();render()}));root.append(wrap);return;}
 const s=labSteps[labStage];wrap.append(el('h3',null,s.title));wrap.append(el('p','solo-blurb',s.desc));const opt=el('div','problem-options');s.options.forEach((o,i)=>{opt.append(btn(o,'problem-option',()=>{if(i===s.correct){labFeedback='✓ '+s.why;reward('labstep:'+labStage,20);data.lab=Math.max(data.lab,labStage+1);save();if(data.lab>=labSteps.length)mission('lab');}else labFeedback='Try again. Remember what the apparatus is meant to do.';render()}))});wrap.append(opt);
 if(labFeedback){wrap.append(el('p','lesson-feedback',labFeedback));if(data.lab>labStage)wrap.append(btn(labStage===labSteps.length-1?'Finish lab →':'Continue →','solo-primary',()=>{labStage+=1;labFeedback='';if(labStage>=labSteps.length){mission('lab');}render()}));}
 root.append(wrap);
}
function getDecor(){return data?.decor||'mint'}
function getBoardQuestion(){const c=courses[current];if(!c)return '';const done=c.questions.filter((q,i)=>data?.finished?.['q:'+current+':'+i]).length;return c.questions[selected===null?Math.min(done,c.questions.length-1):selected]?.q||c.questions[0].q}
window.GGVSolo={init,begin,enter,talk,render,toggleQuests,getDecor,getBoardQuestion,missions,loadSnapshot:()=>({...data}),courseData:courses};
})();

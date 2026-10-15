/* Диколесье — патч: смерть с выпадением всего, чума, море+лодка, ледники, Азия+самурай, D-коин, ломание стен, дерево 10, выброс предметов, ESC */
const fs=require('fs'),path=require('path');const R=String.raw;const DIR=__dirname;const MARK='DIKOLES-PATCH-1';
const FILES=['engine.cjs','world.cjs','room.cjs','index.html'];
if(process.argv.includes('--undo')){for(const f of FILES){const p=path.join(DIR,f);if(fs.existsSync(p+'.bak')){fs.copyFileSync(p+'.bak',p);console.log('Восстановлен '+f)}}console.log('Откат выполнен.');process.exit(0)}

/* ===== общие куски кода ===== */
const BIOMES=R`const BIOMES=[
{id:'main',name:'Лесные земли',x:6500,y:6500,w:10000,h:10000,spawn:true,ground:'#8caf68',patch:'#789f56',tree:'#51814b'},
{id:'winter',name:'Зима',x:0,y:8250,w:6500,h:6500,spawn:true,ground:'#d9e8e9',patch:'#c4dadd',tree:'#62867b'},
{id:'swamp',name:'Болота',x:16500,y:8250,w:6500,h:6500,spawn:false,ground:'#6b8270',patch:'#526d61',tree:'#506e55'},
{id:'jungle',name:'Джунгли',x:8250,y:0,w:6500,h:6500,spawn:false,ground:'#5b9369',patch:'#427c58',tree:'#286247'},
{id:'desert',name:'Пустыня',x:8250,y:16500,w:6500,h:6500,spawn:true,ground:'#d8bb7d',patch:'#c9a768',tree:'#819762'},
{id:'glacier',name:'Ледники',x:1400,y:1500,w:3000,h:2600,spawn:false,ground:'#e9f4f7',patch:'#cfe5ec',tree:'#9bbcc6'},
{id:'glacier',name:'Ледники',x:4000,y:5200,w:2600,h:1900,spawn:false,ground:'#e9f4f7',patch:'#cfe5ec',tree:'#9bbcc6'},
{id:'glacier',name:'Ледники',x:1400,y:16300,w:3000,h:2600,spawn:false,ground:'#e9f4f7',patch:'#cfe5ec',tree:'#9bbcc6'},
{id:'glacier',name:'Ледники',x:4000,y:19800,w:2600,h:2000,spawn:false,ground:'#e9f4f7',patch:'#cfe5ec',tree:'#9bbcc6'},
{id:'plague',name:'Чумной лес',x:14750,y:0,w:8250,h:8250,spawn:false,ground:'#5d6b4a',patch:'#4c5a3b',tree:'#3d4a32'},
{id:'asia',name:'Азия',x:14750,y:14750,w:8250,h:8250,spawn:false,ground:'#9fb873',patch:'#8ca863',tree:'#d98fa8'},
{id:'ocean',name:'Глубокое море',x:0,y:0,w:8250,h:8250,spawn:false,water:true,ground:'#2f6f8f',patch:'#3d82a3',tree:'#2f6f8f'},
{id:'ocean',name:'Глубокое море',x:0,y:14750,w:8250,h:8250,spawn:false,water:true,ground:'#2f6f8f',patch:'#3d82a3',tree:'#2f6f8f'}];`;

const MOBS=R`{plague_rat:{name:'Чумная крыса',biome:'plague',base:'wolf',hp:70,speed:1.3,color:'#7c8a5a',shape:'hare'},
ghoul:{name:'Гниющий упырь',biome:'plague',base:'wolf',hp:170,speed:.95,color:'#8fa37a',shape:'feline'},
plague_slime:{name:'Чумной слизень',biome:'plague',base:'slime',hp:120,speed:.9,color:'#a6c24a',shape:'slime'},
ice_seal:{name:'Ледяной тюлень',biome:'glacier',base:'boar',hp:120,speed:.7,color:'#cfe3ea',shape:'croc'},
frost_wolf:{name:'Инеистый волк',biome:'glacier',base:'wolf',hp:140,speed:1.15,color:'#bcd7e6',shape:'canine'},
snow_owl:{name:'Снежная сова',biome:'glacier',base:'bird',hp:30,speed:1.2,color:'#f2f5f0',shape:'parrot'},
tanuki:{name:'Тануки',biome:'asia',base:'boar',hp:90,speed:1.1,color:'#8b6d4f',shape:'canine'},
crane:{name:'Журавль',biome:'asia',base:'bird',hp:35,speed:1.2,color:'#eeeae0',shape:'parrot'},
tiger:{name:'Тигр',biome:'asia',base:'wolf',hp:150,speed:1.2,color:'#e08a3c',shape:'feline'}}`;

const ITEMS_ADD=R`
for(const[id,name]of[['ice','Лёд'],['frost','Морозник']])ITEMS[id]={id,name,kind:'material',stack:9999,sprite:id};
ITEMS.medicine={id:'medicine',name:'Лекарство от чумы',kind:'heal',stack:20,sprite:'medicine'};
ITEMS.boat={id:'boat',name:'Лодка',kind:'gear',stack:1,sprite:'boat'};
weapon('ice_sword','Ледяной меч','icesword',58,.28,{iron_sword:1,ice:14,frost:8},{range:100});
wear('plague_mask','Античумная маска','mask','head',{leather:6,cloth:6,crystal:2},{armor:.06});
wear('samurai_armor','Доспех самурая','armor','body',null,{armor:.32,speed:.05});
`;
const WALL_ADD=R`const WALL_VALUE={wood:1,fiber:1,stone:2,coal:2,cloth:3,leather:3,iron:5,gold:6,crystal:10};
for(const w of Object.values(WALLS))w.hp=50+25*Object.entries(w.cost).reduce((n,[k,q])=>n+(WALL_VALUE[k]||1)*q,0);
`;
const RECIPE_ADD=R`
RECIPES.push({id:'medicine',name:'Лекарство от чумы ×2',qty:2,cost:{berries:6,fiber:4,water:1},cat:'supplies'},{id:'boat',name:'Лодка',qty:1,cost:{wood:40,fiber:12,leather:4},cat:'tools'});
`;
const SHARED=[
 {n:'новые предметы',f:/ITEMS\.torch=\{[^;]*?\};/,mode:'after',r:ITEMS_ADD},
 {n:'прочность стен по цене',f:R`for(const[id,w]of Object.entries(WALLS)){ITEMS[id]=`,mode:'before',r:WALL_ADD},
 {n:'рецепты лекарства и лодки',f:/RECIPES\.push\(\{id:'torch'[^;]*?\);/,mode:'after',r:RECIPE_ADD}];

/* ===== сервер: новые функции ===== */
const SERVER_FUNCS=R`function respawn(){const p=state.p,dx=p.x,dy=p.y;fxNear({kind:'death',x:dx,y:dy,victim:p.id,player:{appearance:p.appearance,equipment:p.equipment,angle:p.angle}});for(let i=0;i<SLOT_COUNT;i++){const s=p.slots[i];if(s){const a=rand(0,Math.PI*2),r=rand(10,70);addDrop(s.id,s.qty,dx+Math.cos(a)*r,dy+Math.sin(a)*r);p.slots[i]=null}}
const starterKit=[{id:'stone_pick',qty:1},{id:'stone_axe',qty:1},{id:'club',qty:1}];starterKit.forEach((s,i)=>p.slots[i]=s);p.active=0;
Object.assign(p,randomSpawn());repairPoint(p);Object.assign(p,{hp:p.maxHp,hunger:80,thirst:80,stamina:100,flash:2,spawnShield:5,cd:.35,swing:0,exhausted:false,guardExhausted:false,blocking:false,plague:false,deaths:(p.deaths||0)+1});state.deaths++;resetInput();updateCounts();toast('Ты погиб! Все вещи выпали на месте гибели — их может подобрать любой.');}
function fxNear(m){for(const v of activePlayers())if(Math.hypot(v.x-m.x,v.y-m.y)<1400)notify(v.id,{type:'fx',...m});}
function updateSamurai(e,dt){const p=nearestPlayer(e);if(!p||e.hp<=0)return;setContext(p);e.homeX??=SAMURAI_HOME.x;e.homeY??=SAMURAI_HOME.y;e.cd=Math.max(0,e.cd-dt);e.flash=Math.max(0,e.flash-dt);e.dodge=Math.max(0,(e.dodge||0)-dt);e.t=(e.t||0)-dt;
const d=dist(e,p),h=Math.atan2(p.y-e.y,p.x-e.x),rage=e.hp<e.maxHp*.4?1.35:1;e.moving=false;
const go=(a,s)=>{const x=e.x,y=e.y;move(e,Math.cos(a)*s*dt,Math.sin(a)*s*dt,38);const m=Math.hypot(e.x-x,e.y-y);e.moving=m>.2;if(e.moving)e.walk=(e.walk||0)+dt*7;return m};
const far=Math.hypot(e.x-e.homeX,e.y-e.homeY);
if(d>950||far>2200||p.spawnShield>0){e.mode='idle';if(far>60){e.dir=Math.atan2(e.homeY-e.y,e.homeX-e.x);go(e.dir,110)}e.hp=Math.min(e.maxHp,e.hp+dt*20);return}
if(!e.dodge&&e.mode!=='dash'){const b=state.projectiles.find(b=>!b.enemy&&b.life>0&&Math.hypot(b.x-e.x,b.y-e.y)<260&&(e.x-b.x)*b.vx+(e.y-b.y)*b.vy>0);if(b){e.dodge=1.4;e.mode='dodge';e.t=.28;e.side=Math.atan2(b.vy,b.vx)+(Math.random()<.5?1:-1)*Math.PI/2}}
switch(e.mode){
case'dodge':go(e.side,520);if(e.t<=0)e.mode='stalk';break;
case'windup':turnTo(e,h,dt*.6);if(e.t<=0){e.mode='slash';e.t=.18;if(d<165&&Math.cos(h-e.dir)>.3&&canSee(e,p))hurt(70,e)}break;
case'slash':if(e.t<=0){e.mode='recover';e.t=.55/rage}break;
case'dashwind':turnTo(e,h,dt*2);if(e.t<=0){e.mode='dash';e.t=.38;e.hitDone=false}break;
case'dash':go(e.dir,720*rage);if(!e.hitDone&&dist(e,p)<120){e.hitDone=true;hurt(70,e)}if(e.t<=0){e.mode='recover';e.t=.8/rage}break;
case'recover':go(h+Math.PI/2*(e.strafe||1),60);if(e.t<=0)e.mode='stalk';break;
default:{e.mode='stalk';const lx=p.x+(p._input?.dx||0)*120,ly=p.y+(p._input?.dy||0)*120;turnTo(e,Math.atan2(ly-e.y,lx-e.x),dt*1.4);
if(d<150&&!e.cd){e.mode='windup';e.t=.5/rage;e.cd=1.1/rage}
else if(d>230&&d<480&&!e.cd&&canSee(e,p)){e.mode='dashwind';e.dir=h;e.t=.45/rage;e.cd=2.4/rage}
else if(d>140){if(go(e.dir,150*rage)<.1){e.strafe=-(e.strafe||1);go(e.dir+e.strafe*1.2,150)}}
else{if(Math.random()<dt*.6)e.strafe=-(e.strafe||1);go(h+Math.PI/2*(e.strafe||1),130*rage)}}}
const wall=state.builds.find(b=>isWall(b)&&b.hp>0&&dist(b,e)<90);if(wall&&e.mode==='stalk'&&!e.cd){wall.hp-=150;wall.hit=.15;e.cd=.9;emitSound('break',wall)}}
`;

/* ===== клиент: новый код в конец скрипта ===== */
const CLIENT_END=R`
function deep(x,y){return !!(typeof biomeAt==='function'&&biomeAt(x,y)?.water)}
try{if(typeof MOB_SPECIES!=='undefined')Object.assign(MOB_SPECIES,`+MOBS+R`)}catch(err){console.warn(err)}
let localFx=[];
function addFx(m){localFx.push({...m,born:performance.now()});if(localFx.length>40)localFx.shift();if(m.kind==='death'&&typeof netId!=='undefined'&&m.victim===netId)toast('Ты погиб! Все вещи остались на месте гибели');}
function drawFx(){const now=performance.now();localFx=localFx.filter(f=>now-f.born<1100);for(const f of localFx){const a=(now-f.born)/1000;
 if(f.kind==='break'){ctx.save();ctx.globalAlpha=Math.max(0,1-a*1.2);for(let i=0;i<9;i++){const g=i*.7,d=a*90;rounded(f.x+Math.cos(g)*d-5,f.y+Math.sin(g)*d-5+a*a*60,10,10,2,f.color||'#a9884f','#3c3a30',1)}ctx.restore();continue}
 const k=Math.max(0,1-a/.9);ctx.save();ctx.globalAlpha=k;ctx.translate(f.x,f.y);ctx.rotate(a*5);ctx.scale(.4+k*.6,.4+k*.6);ctx.translate(-f.x,-f.y);
 try{if(f.player){const own=state.p;state.p={...f.player,x:f.x,y:f.y,flash:1,slots:Array(40).fill(null),active:0};try{playerSprite(state.p)}finally{state.p=own}}
 else if(f.type==='samurai')drawSamurai({...f,hp:0,maxHp:1100,renderDir:f.dir});
 else sprite(f.type,f.x,f.y,visualTime,true,{...f,hp:0,maxHp:1,renderDir:f.dir})}catch(err){}
 ctx.restore();ctx.save();ctx.globalAlpha=Math.max(0,1-a);for(let i=0;i<10;i++){const g=i/10*6.283,d=20+a*90;circle(f.x+Math.cos(g)*d,f.y+Math.sin(g)*d,4*(1-a)+1,i%2?'#f4e3b0':'#e86b4f')}ctx.restore()}}
function wallCracks(o){if(!o.maxHp)return;const r=1-o.hp/o.maxHp;ctx.save();ctx.translate(o.x,o.y);
 if(o.hit>0){ctx.fillStyle='#ffffff45';ctx.fillRect(-23,-23,46,46)}
 if(r>=.55){line([[-18,-20],[-8,-8],[-12,2],[-4,10]],'#2b2a24',1.8);line([[14,-22],[8,-10],[16,-2]],'#2b2a24',1.6);line([[-8,-8],[2,-12]],'#2b2a24',1.2)}
 if(r>=.9){line([[20,18],[6,6],[10,-4],[-2,-10]],'#1e1d19',2);line([[-20,14],[-6,4],[4,18]],'#1e1d19',1.8);line([[-22,-4],[-10,-2]],'#1e1d19',1.4);line([[6,6],[-2,22]],'#1e1d19',1.4);ctx.fillStyle='#00000055';ctx.fillRect(14,14,9,9);ctx.fillRect(-23,-23,7,6)}ctx.restore()}
function drawSamurai(o){ctx.save();ctx.translate(o.x,o.y);orb(0,10,90,50,'#0003','#000',0);ctx.scale(4,4);ctx.rotate(o.renderDir??o.dir??0);const w=o.mode==='windup'||o.mode==='dashwind',f=o.flash>0;
 poly([[-10,-20],[-30,-24],[-34,0],[-30,24],[-10,20]],'#5a1418','#2a0a0c',1.2);
 rounded(-14,-30,20,12,3,f?'#fff':'#8e1d22','#3a0e10',1.2);rounded(-14,18,20,12,3,f?'#fff':'#8e1d22','#3a0e10',1.2);line([[-12,-26],[4,-26]],'#d8b45a',1);line([[-12,26],[4,26]],'#d8b45a',1);
 orb(-2,0,16,19,f?'#eee':'#2b2b33','#111',1.4);line([[-14,-6],[10,-6]],'#8e1d22',2);line([[-14,6],[10,6]],'#8e1d22',2);
 orb(12,-14,5,5,'#c9a27a','#5b4030',1);orb(12,14,5,5,'#c9a27a','#5b4030',1);
 ctx.save();ctx.translate(14,14);ctx.rotate(w?-1.1:o.mode==='slash'?.9:-.2);line([[0,0],[8,0]],'#222',3);line([[8,-3],[8,3]],'#d8b45a',2);line([[8,0],[40,-2]],w?'#ffc4c4':'#dfe7ea',2.2);ctx.restore();
 orb(4,0,11,11,'#1c1c22','#000',1.2);poly([[-4,-10],[4,-15],[12,-21],[8,-11]],'#d8b45a','#7a5b1a',.8);poly([[-4,10],[4,15],[12,21],[8,11]],'#d8b45a','#7a5b1a',.8);orb(10,0,5,7,'#6b1216','#2a0a0c',.8);
 ctx.shadowColor='#ff2020';ctx.shadowBlur=10;circle(12,-3.5,1.7,'#ff2a2a');circle(12,3.5,1.7,'#ff2a2a');ctx.shadowBlur=0;
 if(w){ctx.strokeStyle='#ff505088';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,42,-.9,.9);ctx.stroke()}ctx.restore();
 if(o.hp>0){rounded(o.x-70,o.y-125,140,9,4,'#3a1a1a','#000',1);rounded(o.x-70,o.y-125,140*clamp(o.hp/o.maxHp,0,1),9,4,'#e0453a','#e0453a',0);text('Самурай Красноглазый',o.x,o.y-133,'#ffd9c9',14)}}
function drawShrine(o){ctx.save();ctx.translate(o.x,o.y);orb(0,14,72,28,'#0003','#000',0);rounded(-50,-30,100,70,4,'#b8483a','#4a1a14',3);
 poly([[-78,-30],[78,-30],[56,-62],[-56,-62]],'#2f3b3f','#151c1e',3);poly([[-50,-62],[50,-62],[34,-86],[-34,-86]],'#2f3b3f','#151c1e',3);line([[-78,-30],[-88,-40]],'#151c1e',3);line([[78,-30],[88,-40]],'#151c1e',3);
 rounded(-12,8,24,32,2,'#3a2214','#1a0e08',2);text(o.cd>0?'обыскано':'E — обыскать',0,60,o.cd>0?'#cfcfcf':'#ffe9b0',13);ctx.restore()}
function drawExtra(o){const t=o.type;if(t==='samurai'){drawSamurai(o);return true}if(t==='shrine'){drawShrine(o);return true}
 if(!(t==='ice'||t==='frost'||t==='tree'&&(o.biome==='asia'||o.biome==='plague')))return false;
 ctx.save();ctx.translate(o.x+(o.hit>0?Math.sin(performance.now()/20)*2:0),o.y);
 if(t==='ice'){poly([[-24,10],[-16,-18],[0,-30],[18,-14],[26,10],[4,18]],'#bfe6f2','#5f9fb5',2.5);poly([[-6,-4],[0,-24],[10,-8]],'#effbff','#effbff',0)}
 else if(t==='frost'){for(const[a,b]of[[-10,0],[8,-6],[4,10],[-4,-12]]){line([[a,b+10],[a,b]],'#5d8a7a',2);orb(a,b,7,7,'#8fd3f5','#3f86a8',1.5);circle(a,b,2.5,'#f4fdff')}}
 else if(o.biome==='asia'){line([[0,18],[0,-4]],'#5a3b2a',7);line([[0,0],[-14,-14]],'#5a3b2a',4);line([[0,-2],[14,-16]],'#5a3b2a',4);for(const[a,b,r]of[[-18,-18,16],[16,-20,16],[0,-30,18],[-4,-12,14]])orb(a,b,r,r*.85,'#f2a7c3','#b5607f',2);for(let i=0;i<5;i++)circle(Math.sin(i*2.3)*20,-20+Math.cos(i*1.7)*12,2.2,'#fff0f6')}
 else{line([[0,18],[0,-10],[-12,-26]],'#3a3328',6);line([[0,-6],[14,-22],[22,-20]],'#3a3328',4);orb(0,-22,26,16,'#4f5e38aa','#2c3620',1.5);const tt=performance.now()/1000;ctx.globalAlpha=.6;for(let i=0;i<6;i++){const a=i*1.1+tt*.6;circle(Math.cos(a)*24,-14+Math.sin(a*1.3)*16,3+i%2*2,'#9fd04a')}ctx.globalAlpha=1}
 ctx.restore();return true}
function drawItemExtra(s,c){if(!['boat','mask','medicine','ice','frost','icesword'].includes(s))return false;c.save();c.lineJoin='round';c.lineCap='round';
 if(s==='boat'){rounded(2,-10,48,22,10,'#8a5a34','#4a2f1c',2.5,c);rounded(9,-5,34,12,6,'#a8774a','#4a2f1c',1.5,c)}
 else if(s==='mask'){orb(24,0,20,16,'#3b3b36','#1d1d1a',2.5,c);poly([[38,-4],[56,6],[38,8]],'#e9dfc2','#6e6347',2,c);orb(22,-5,4,4,'#9fd04a','#2c3620',1,c)}
 else if(s==='medicine'){rounded(14,-14,22,30,5,'#e9f0e4','#5b6b55',2,c);rounded(17,-20,16,8,2,'#c94b3c','#6b2219',1.5,c);line([[25,-6],[25,8]],'#c94b3c',3,c);line([[18,1],[32,1]],'#c94b3c',3,c)}
 else if(s==='ice'){poly([[4,10],[12,-14],[26,-22],[42,-8],[46,12],[24,18]],'#bfe6f2','#5f9fb5',2.5,c)}
 else if(s==='frost'){for(const[a,b]of[[16,0],[30,-8],[28,10]]){orb(a,b,7,7,'#8fd3f5','#3f86a8',1.5,c)}}
 else{line([[0,0],[12,0]],'#3a4a55',5,c);line([[12,-7],[12,7]],'#9bd4ea',3,c);poly([[14,-4],[62,-2],[70,0],[62,2],[14,4]],'#c9f0ff','#5fa6c4',1.8,c)}
 c.restore();return true}
function dcoinURL(size=64){const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d'),r=size/2,gr=g.createRadialGradient(r*.7,r*.6,r*.1,r,r,r);gr.addColorStop(0,'#fff3a8');gr.addColorStop(.55,'#f2c23a');gr.addColorStop(1,'#b07a12');g.fillStyle=gr;g.beginPath();g.arc(r,r,r-2,0,7);g.fill();g.lineWidth=size*.06;g.strokeStyle='#7a4f08';g.stroke();g.beginPath();g.arc(r,r,r*.72,0,7);g.strokeStyle='#c99320';g.lineWidth=size*.04;g.stroke();g.font='900 '+(size*.56)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=size*.08;g.strokeText('D',r,r+size*.03);g.fillStyle='#fff6c8';g.fillText('D',r,r+size*.03);return cv.toDataURL()}
try{const di=document.getElementById('dcoinImg');if(di)di.src=dcoinURL();
 const cnv=document.querySelector('canvas');if(cnv){cnv.addEventListener('dragover',e=>e.preventDefault());cnv.addEventListener('drop',e=>{e.preventDefault();if(typeof dragSlot!=='undefined'&&Number.isInteger(dragSlot)){netAction('drop',{index:dragSlot});dragSlot=null}})}
 addEventListener('keydown',e=>{if(e.code!=='Escape'||(typeof chatOpen!=='undefined'&&chatOpen))return;const md=document.getElementById('modal');if(md&&md.classList.contains('open')){e.preventDefault();e.stopImmediatePropagation();closeModal();return}const pk=document.getElementById('backpack'),cb=document.getElementById('closePack');if(pk&&!pk.hidden&&cb){e.preventDefault();e.stopImmediatePropagation();cb.click()}},true);
}catch(err){console.warn('patch init',err)}
`;

/* ===== план правок ===== */
const PLAN={
'world.cjs':[
 {n:'новые биомы',f:/const BIOMES=\[[\s\S]*?\];/,r:BIOMES},
 {n:'глубокая вода и новые мобы',f:/module\.exports\s*=\s*\{/,r:R`function deep(x,y){return !!biomeAt(x,y)?.water}
Object.assign(MOB_SPECIES,`+MOBS+R`);
module.exports={deep,`}],
'room.cjs':[
 {n:'передача анимации самурая',f:R`'species','biome'`,r:R`'species','biome','mode'`}],
'engine.cjs':[...SHARED,
 {n:'импорт deep',f:/const\s*\{([^}]*)\}\s*=\s*require\((['"])\.\/world\.cjs\2\);?/,r:t=>t.replace('{','{deep,')+'\nconst SAMURAI_HOME={x:18875,y:18875};\n'},
 {n:'в море нет ресурсов',f:R`if(!bio||!land(x,y,60)||inWater(x,y)`,r:R`if(!bio||bio.water||!land(x,y,60)||inWater(x,y)`},
 {n:'ресурсы ледников и чумы',f:R`insertNode({x,y,type,hp,max:hp,`,r:R`const t2=bio.id==='glacier'?(a<.4?'ice':a<.65?'frost':a<.85?'stone':'crystal'):bio.id==='plague'&&type==='stone'&&a>.5?(a<.75?'gold':'crystal'):type,h2=t2==='tree'?6:t2==='berries'?2:8;insertNode({x,y,type:t2,hp:h2,max:h2,`},
 {n:'домики в Азии',f:R`state.lakes.push({x,y,rx:90+random()*50,ry:70+random()*30});}`,r:R`state.lakes.push({x,y,rx:90+random()*50,ry:70+random()*30});{const sx=x0+400,sy=y0+400;if(biomeAt(sx,sy)?.id==='asia'&&random()<.35&&!nearNodes(sx,sy,130).length)state.builds.push({id:'b'+(++buildId),owner:'world',type:'shrine',x:sx,y:sy,hp:999,maxHp:999,cd:0});}}`},
 {n:'спавн мобов по биомам',f:R`const options=Object.entries(MOB_SPECIES).filter(([,s])=>s.biome===region.id);const[id,sp]=options[Math.floor(rand(0,options.length))];`,r:R`if(!region||region.water||region.id==='glacier'&&Math.random()<.8)continue;const options=Object.entries(MOB_SPECIES).filter(([,s])=>s.biome===region.id);if(!options.length)continue;const[id,sp]=options[Math.floor(rand(0,options.length))];`},
 {n:'смерть: выпадает всё + самурай',f:'function respawn(',r:SERVER_FUNCS+'function respawnOld('},
 {n:'глубокая вода непроходима',f:R`function solid(x,y,r=18){if(!land(x,y,r))return true;`,r:R`function solid(x,y,r=18,boat=false){if(!land(x,y,r))return true;if(!boat&&deep(x,y))return true;`},
 {n:'лодка в движении',f:R`function move(e,dx,dy,r=18){if(e.type==='bird'){Object.assign(e,projectLand(e.x+dx,e.y+dy,12));return}`,r:R`function move(e,dx,dy,r=18){if(e.type==='bird'){Object.assign(e,projectLand(e.x+dx,e.y+dy,12));return}const boat=!e.type&&(e.slots?.some(s=>s?.id==='boat')||deep(e.x,e.y));`},
 {n:'лодка: шаг X',f:R`solid(e.x+dx/steps,e.y,r)`,r:R`solid(e.x+dx/steps,e.y,r,boat)`,all:true},
 {n:'лодка: шаг Y',f:R`solid(e.x,e.y+dy/steps,r)`,r:R`solid(e.x,e.y+dy/steps,r,boat)`,all:true},
 {n:'чума и утопление',f:R`else if(p.hunger>70&&p.thirst>60)p.hp=Math.min(p.maxHp,p.hp+dt*.3);if(p.hp<=0){respawn();return}`,r:R`else if(p.hunger>70&&p.thirst>60)p.hp=Math.min(p.maxHp,p.hp+dt*.3);p.cure=Math.max(0,(p.cure||0)-dt);const plagueNow=biomeAt(p.x,p.y)?.id==='plague'&&p.equipment.head!=='plague_mask'&&!p.cure;if(plagueNow){if(!p.plague)toast('Чума! Нужно лекарство или античумная маска');p.hp-=dt*3.5}p.plague=plagueNow;if(deep(p.x,p.y)&&!itemCount('boat')){p.hp-=dt*6;if(Math.random()<dt*.5)toast('Ты тонешь! Нужна лодка')}if(p.hp<=0){respawn();return}`},
 {n:'лекарство',f:R`function useItem(id){if(!itemCount(id))return;const p=state.p;`,mode:'after',r:R`if(id==='medicine'){consume(id);p.cure=240;toast('Иммунитет к чуме: 4 минуты');return}`},
 {n:'1 дерево за удар',f:R`if(n.hp>0){`,from:'function hitNode',mode:'after',r:R`if(matching&&n.type==='tree')receive('wood',1,n.x,n.y);`},
 {n:'10 дерева при сломе',f:R`id==='wood'?7:id==='crystal'?3`,r:R`id==='wood'?10:id==='crystal'||id==='frost'?3`},
 {n:'ломать свои стены',f:R`isWall(b)&&b.hp>0&&canRaid(p,b)&&`,r:R`isWall(b)&&b.hp>0&&(b.owner===p.id||canRaid(p,b))&&`},
 {n:'урон по стенам, звук',f:R`if(wall)wall.hp-=d.damage||4;`,r:R`if(wall){wall.hp-=d.kind==='tool'?Math.max(d.damage,d.mine*15):(d.damage||4);wall.hit=.15;emitSound(wall.hp>0?'crack':'break',wall);if(wall.hp<=0)fxNear({kind:'break',x:wall.x,y:wall.y,color:WALLS[wall.type].color})}`},
 {n:'ледяной меч замедляет',f:R`targets.forEach(e=>{damage(`,from:'function attack',r:R`targets.forEach(e=>{if(d.id==='ice_sword')e.slow=1.5;damage(`,opt:true},
 {n:'замедление мобов',f:R`if(e.phase>2.8)speed*=2.3}e.moving=false;`,r:R`if(e.phase>2.8)speed*=2.3}if(e.slow>0){e.slow-=dt;speed*=.5}e.moving=false;`,opt:true},
 {n:'урон мобов +20%',f:R`hurt(e.type==='boss'?24:e.type==='boarking'?20:e.type==='wolf'?13:9,e)`,r:R`hurt(Math.round((e.type==='boss'?24:e.type==='boarking'?20:e.type==='wolf'?13:9)*1.2),e)`},
 {n:'урон костей +20%',f:R`damage:10,enemy:true,kind:'bone'`,r:R`damage:12,enemy:true,kind:'bone'`,opt:true},
 {n:'урон магии +20%',f:R`damage:18,enemy:true,kind:'magic'`,r:R`damage:22,enemy:true,kind:'magic'`,opt:true},
 {n:'анимация смерти мобов и лут',f:R`receive('crystal',25,e.x,e.y);state.victoryPending=true}beep(700);}`,r:R`receive('crystal',25,e.x,e.y);state.victoryPending=true}if(e.type==='samurai'){state.samuraiCd=600;receive('katana',1,e.x,e.y);receive('samurai_armor',1,e.x,e.y);receive('gold',25,e.x,e.y);toast('Самурай Красноглазый повержен!')}if(e.biome==='plague'&&Math.random()<.5)receive(Math.random()<.5?'gold':'crystal',2,e.x,e.y);if(e.biome==='glacier')receive('frost',2,e.x,e.y);fxNear({kind:'death',x:e.x,y:e.y,type:e.type,species:e.species,dir:e.dir});beep(700);}`},
 {n:'монеты за самурая',f:R`boarking:5,boss:10}[e.type]`,r:R`boarking:5,boss:10,samurai:15}[e.type]`,opt:true},
 {n:'HP самурая 1100',f:R`boss:1800,boarking:520}[type]`,r:R`boss:1800,boarking:520,samurai:1100}[type]`},
 {n:'размер самурая',f:R`e.type==='boss'?40:e.type==='boarking'?36:23`,r:R`e.type==='samurai'?60:e.type==='boss'?40:e.type==='boarking'?36:23`,opt:true},
 {n:'ИИ самурая',f:R`for(const e of state.entities){const p=nearestPlayer(e);if(!p)continue;`,from:'function updateEnemies',r:R`for(const e of state.entities){if(e.type==='samurai'){updateSamurai(e,dt);continue}const p=nearestPlayer(e);if(!p)continue;`},
 {n:'появление самурая',f:R`updateEnemies(dt,night);`,r:R`state.samuraiCd=Math.max(0,(state.samuraiCd||0)-dt);if(!state.samuraiCd&&!state.entities.some(e=>e.type==='samurai')&&active.some(p=>Math.hypot(p.x-SAMURAI_HOME.x,p.y-SAMURAI_HOME.y)<1600)){if(spawnEntity('samurai',SAMURAI_HOME.x,SAMURAI_HOME.y)){const s=state.entities.at(-1);s.homeX=s.x;s.homeY=s.y;s.mode='stalk';for(const v of active)if(dist(v,s)<2000)notify(v.id,{type:'toast',text:'Самурай Красноглазый пробудился!'})}else state.samuraiCd=5}updateEnemies(dt,night);`},
 {n:'турели бьют самурая',f:R`['wolf','slime','skeleton','boss','boarking'].includes(e.type)&&dist(e,b)<380`,r:R`['wolf','slime','skeleton','boss','boarking','samurai'].includes(e.type)&&dist(e,b)<380`,opt:true},
 {n:'тряска блоков, домики',f:R`for(const b of state.builds){const owner=findPlayer(b.owner);`,r:R`for(const b of state.builds){b.hit=Math.max(0,(b.hit||0)-dt);if(b.type==='shrine'){b.cd=Math.max(0,(b.cd||0)-dt);continue}const owner=findPlayer(b.owner);`},
 {n:'обыск домиков',f:R`const chest=state.builds.find(b=>b.type==='chest'`,from:'function interact',mode:'before',r:R`const shrine=state.builds.find(b=>b.type==='shrine'&&dist(b,p)<110);if(shrine){if(shrine.cd>0){toast('Уже обыскано. Снова через '+Math.ceil(shrine.cd/60)+' мин');return}shrine.cd=480;receive('gold',3+Math.floor(rand(0,5)),shrine.x,shrine.y);receive('iron',6,shrine.x,shrine.y);receive('cloth',4,shrine.x,shrine.y);if(Math.random()<.25)receive('katana',1,shrine.x,shrine.y);else receive('arrows',15,shrine.x,shrine.y);return}`},
 {n:'сохранение ресурсов',f:R`['tree','stone','berries','iron','gold','crystal'].includes(n.type)`,r:R`['tree','stone','berries','iron','gold','crystal','ice','frost'].includes(n.type)`,opt:true},
 {n:'сохранение самурая',f:R`['rabbit','bird','boar','wolf','slime','skeleton','boss','boarking'].includes(e.type)`,r:R`['rabbit','bird','boar','wolf','slime','skeleton','boss','boarking','samurai'].includes(e.type)`,opt:true},
 {n:'сохранение домиков',f:R`['wall','turret','fire'].includes(b.type)`,r:R`['wall','turret','fire','shrine'].includes(b.type)`,opt:true},
 {n:'версия мира',f:R`return{version:3,worldSize:WORLD,`,r:R`return{version:3,biomeVersion:3,worldSize:WORLD,`},
 {n:'дозаполнение старого мира',f:/state\.chunks=Array\.isArray\(world\.chunks\)\?[^;]*;/,mode:'after',r:R`if(world.biomeVersion!==3)state.chunks=state.chunks.filter(k=>{const[cx,cy]=String(k).split(',').map(Number);return['main','winter','swamp','jungle','desert'].includes(biomeAt(cx*800+400,cy*800+400)?.id)});`}],
'index.html':[
 {n:'новые биомы',f:/const BIOMES=\[[\s\S]*?\];/,r:BIOMES},
 ...SHARED,
 {n:'монетка D-коин',f:R`🪙 <strong id="coinCount">`,r:R`<img id="dcoinImg" width="26" height="26" alt="D-коин" style="vertical-align:middle"> <strong id="coinCount">`,opt:true},
 {n:'зелёная дымка чумы',f:'</style>',mode:'before',r:R`body.in-plague::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(transparent 45%,#6f9a2c77)}
`},
 {n:'рисование новых объектов и трещин',f:R`sprite(o.type,o.x,o.y,visualTime,o.flash>0,o);`,r:R`if(!drawExtra(o))sprite(o.type,o.x,o.y,visualTime,o.flash>0,o);if(isWall(o.type))wallCracks(o);`},
 {n:'анимации смерти',f:R`function netRemoteSprites(){`,mode:'after',r:'drawFx();'},
 {n:'приём эффектов',f:R`if(m.type==='sfx')playEffect(m);`,mode:'after',r:R`if(m.type==='fx')addFx(m);`},
 {n:'экран чумы',f:R`state.p={...previous,...m.p};`,mode:'after',r:R`document.body.classList.toggle('in-plague',!!state.p.plague);`,opt:true},
 {n:'звук ломания',f:R`const durations={`,mode:'after',r:'crack:.09,break:.26,',opt:true},
 {n:'тихий звук ломания',f:R`g.gain.setValueAtTime(Math.max(.0001,volume*.32),now);`,r:R`g.gain.setValueAtTime(Math.max(.0001,volume*(m.kind==='crack'||m.kind==='break'?.14:.32)),now);`,opt:true},
 {n:'G — выбросить',f:R`if(e.code==='KeyX')dismantle()`,r:R`if(e.code==='KeyG')netAction('drop',{index:slot-1});if(e.code==='KeyX')dismantle()`,opt:true},
 {n:'иконки новых предметов',f:R`function drawItem(id,c=ctx){const d=ITEMS[id];if(!d)return;const s=d.sprite;`,mode:'after',r:'if(drawItemExtra(s,c))return;'},
 {n:'лодка под игроком',f:R`function playerSprite(p){ctx.save();ctx.translate(p.x,p.y);`,mode:'after',r:R`if(deep(p.x,p.y)){ctx.save();ctx.rotate(p.renderAngle??p.angle??0);rounded(-40,-22,80,44,20,'#8a5a34','#4a2f1c',3);rounded(-30,-14,60,28,12,'#a8774a','#4a2f1c',1.5);ctx.restore()}`,opt:true},
 {n:'клиент: вода',f:R`function solid(x,y,r=18){if(!land(x,y,r))return true;`,r:R`function solid(x,y,r=18,boat=false){if(!land(x,y,r))return true;if(!boat&&deep(x,y))return true;`,opt:true},
 {n:'клиент: лодка',f:R`function move(e,dx,dy,r=18){if(e.type==='bird'){Object.assign(e,projectLand(e.x+dx,e.y+dy,12));return}`,mode:'after',r:R`const boat=!e.type&&(e.slots?.some(s=>s?.id==='boat')||deep(e.x,e.y));`,opt:true},
 {n:'клиент: шаг X',f:R`solid(e.x+dx/steps,e.y,r)`,r:R`solid(e.x+dx/steps,e.y,r,typeof boat!=='undefined'&&boat)`,all:true,opt:true},
 {n:'клиент: шаг Y',f:R`solid(e.x,e.y+dy/steps,r)`,r:R`solid(e.x,e.y+dy/steps,r,typeof boat!=='undefined'&&boat)`,all:true,opt:true},
 {n:'новый код (анимации, самурай, монета, ESC)',f:'})();',last:true,mode:'before',r:CLIENT_END}]};

/* ===== движок патча ===== */
function out(t,st){return st.mode==='after'?t+st.r:st.mode==='before'?st.r+t:typeof st.r==='function'?st.r(t):st.r}
function apply(src,st){
 if(st.f instanceof RegExp){const m=st.f.exec(src);if(!m)return null;return src.slice(0,m.index)+out(m[0],st)+src.slice(m.index+m[0].length)}
 if(st.all){if(!src.includes(st.f))return null;return src.split(st.f).join(out(st.f,st))}
 let base=0;if(st.from){base=src.indexOf(st.from);if(base<0)return null}
 const i=st.last?src.lastIndexOf(st.f):src.indexOf(st.f,base);if(i<0)return null;
 return src.slice(0,i)+out(st.f,st)+src.slice(i+st.f.length)}
const results=[];let failed=0;
for(const[f,steps]of Object.entries(PLAN)){const p=path.join(DIR,f);
 if(!fs.existsSync(p)){console.log('✖ Не найден файл '+f+' — положи скрипт в папку с игрой');failed++;continue}
 const orig=fs.readFileSync(p,'utf8');if(orig.includes(MARK)){console.log('• '+f+' уже обновлён — пропускаю');continue}
 let s=orig;console.log('\n'+f+':');
 for(const st of steps){const n=apply(s,st);
  if(n==null){if(st.opt)console.log('  ~ пропущено (не страшно): '+st.n);else{console.log('  ✖ НЕ НАЙДЕНО: '+st.n);failed++}}
  else{s=n;console.log('  ✓ '+st.n)}}
 s+=f.endsWith('.html')?'\n<!--'+MARK+'-->\n':'\n/*'+MARK+'*/\n';results.push({p,orig,s})}
if(failed){console.log('\nНичего не изменено: не найдено мест — '+failed+'.\nСкопируй весь этот текст и отправь в чат — поправлю скрипт.');process.exit(1)}
for(const{p,orig,s}of results){fs.writeFileSync(p+'.bak',orig);fs.writeFileSync(p,s)}
console.log('\nГотово! Перезапусти сервер игры.\nОткатить всё обратно: node apply-patch.cjs --undo');

'use strict';
const WORLD_SIZE=23000,LAYOUT_VERSION=2;
const BIOMES=[
{id:'main',name:'Лесные земли',x:6500,y:6500,w:10000,h:10000,spawn:true,ground:'#8caf68',patch:'#789f56',tree:'#51814b'},
{id:'winter',name:'Зима',x:0,y:8250,w:6500,h:6500,spawn:true,ground:'#d9e8e9',patch:'#c4dadd',tree:'#62867b'},
{id:'swamp',name:'Болота',x:16500,y:8250,w:6500,h:6500,spawn:false,ground:'#6b8270',patch:'#526d61',tree:'#506e55'},
{id:'jungle',name:'Джунгли',x:8250,y:0,w:6500,h:6500,spawn:false,ground:'#5b9369',patch:'#427c58',tree:'#286247'},
{id:'desert',name:'Пустыня',x:8250,y:16500,w:6500,h:6500,spawn:true,ground:'#d8bb7d',patch:'#c9a768',tree:'#819762'}];
function biomeAt(x,y){return BIOMES.find(b=>x>=b.x&&y>=b.y&&x<b.x+b.w&&y<b.y+b.h)||null}
function land(x,y,r=0){return !!biomeAt(x-r,y-r)&&!!biomeAt(x+r,y-r)&&!!biomeAt(x-r,y+r)&&!!biomeAt(x+r,y+r)}
function projectLand(x,y,r=24){if(land(x,y,r))return{x,y};let best=null,d=Infinity;for(const b of BIOMES){const p={x:Math.max(b.x+r,Math.min(b.x+b.w-r,x)),y:Math.max(b.y+r,Math.min(b.y+b.h-r,y))},n=Math.hypot(x-p.x,y-p.y);if(n<d){d=n;best=p}}return best}
const MOB_SPECIES={
forest_wolf:{name:'Лесной волк',biome:'main',base:'wolf',hp:80,speed:1,color:'#84988c',shape:'canine'},stag:{name:'Олень',biome:'main',base:'boar',hp:75,speed:1.25,color:'#b39363',shape:'stag'},forest_hare:{name:'Лесной заяц',biome:'main',base:'rabbit',hp:24,speed:1.1,color:'#b1aa8a',shape:'hare'},
snow_wolf:{name:'Полярный волк',biome:'winter',base:'wolf',hp:100,speed:1.1,color:'#dce9e9',shape:'canine'},snow_hare:{name:'Снежный заяц',biome:'winter',base:'rabbit',hp:30,speed:1.25,color:'#eef4ef',shape:'hare'},yak:{name:'Тундровый як',biome:'winter',base:'boar',hp:150,speed:.8,color:'#847466',shape:'yak'},
crocodile:{name:'Крокодил',biome:'swamp',base:'wolf',hp:145,speed:.85,color:'#72825b',shape:'croc'},marsh_slime:{name:'Болотный слизень',biome:'swamp',base:'slime',hp:85,speed:.9,color:'#97ac65',shape:'slime'},mosquito:{name:'Болотная стрекоза',biome:'swamp',base:'bird',hp:32,speed:1.4,color:'#a4c2bd',shape:'insect'},
jaguar:{name:'Ягуар',biome:'jungle',base:'wolf',hp:115,speed:1.2,color:'#dbb36c',shape:'feline'},jungle_boar:{name:'Дикий кабан',biome:'jungle',base:'boar',hp:110,speed:1.1,color:'#9d7961',shape:'yak'},parrot:{name:'Попугай',biome:'jungle',base:'bird',hp:28,speed:1.3,color:'#76b884',shape:'parrot'},
scorpion:{name:'Скорпион',biome:'desert',base:'wolf',hp:90,speed:1,color:'#a98963',shape:'scorpion'},sand_serpent:{name:'Песчаная змея',biome:'desert',base:'slime',hp:65,speed:1.4,color:'#d9bc73',shape:'snake'},scarab:{name:'Скарабей',biome:'desert',base:'boar',hp:100,speed:1.1,color:'#5b887e',shape:'beetle'}};
module.exports={WORLD_SIZE,LAYOUT_VERSION,BIOMES,biomeAt,land,projectLand,MOB_SPECIES};

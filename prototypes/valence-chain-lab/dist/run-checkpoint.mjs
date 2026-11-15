import {BASE_ABILITIES,ABILITIES,MATERIALS,RECIPES,MAX_LEVEL} from './catalog.mjs';
import {ACCESSORIES,MUZZLES} from './equipment.mjs';
import {Condenser} from './condenser.mjs';
import {DEFAULT_CHARACTER,isCharacterId} from './characters.mjs';
const copy=value=>JSON.parse(JSON.stringify(value));
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const keys=(v,list)=>object(v)&&Object.keys(v).every(k=>list.includes(k))&&list.every(k=>Object.hasOwn(v,k));
const number=(v,min=0,max=1e12)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const integer=(v,min=0,max=1e9)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const known=(v,defs)=>typeof v==='string'&&Object.hasOwn(defs,v);
const ids=(v,defs,max=1000)=>Array.isArray(v)&&v.length<=max&&v.every(x=>known(x,defs));
const stock=v=>keys(v,Object.keys(MATERIALS))&&Object.values(v).every(n=>integer(n));
const charge=v=>object(v)&&Object.entries(v).every(([k,n])=>known(k,ACCESSORIES)&&number(n,0,1e9));
const counts=['xp','level','diamonds','kills','damageDone','burnDamage','burnHits','picked'];
export function captureBuild(r){
 r.saveWeapon();
 return copy({characterId:r.characterId,hp:r.hp,abilities:r.abilities,lab:Object.fromEntries(['inventory','furnace','products','discoveries','history','ignition'].map(k=>[k,r.lab[k]])),selectedWeapon:r.selectedWeapon,weapons:r.weapons.map(w=>({gun:w.gun,attachments:w.attachments,muzzle:w.muzzle,accessoryCharge:w.accessoryCharge,condenser:{charge:w.condenser.charge,equipped:w.condenser.equipped},evolutionShots:w.evolutionShots||0})),...Object.fromEntries(counts.map(k=>[k,r[k]]))});
}
export function validBuild(b){
 const hasCharacter=object(b)&&Object.hasOwn(b,'characterId');
 if(!keys(b,['hp','abilities','lab','selectedWeapon','weapons',...counts,...(hasCharacter?['characterId']:[])])||(hasCharacter&&!isCharacterId(b.characterId))||!keys(b.abilities,Object.keys(BASE_ABILITIES)))return false;
 if(!Object.values(b.abilities).every(v=>number(v))||Object.entries(BASE_ABILITIES).some(([k,min])=>b.abilities[k]<min)||b.abilities.defense>.600001||b.abilities.dodge>.400001||b.abilities.crit>.800001||!number(b.hp,.000001,b.abilities.maxHp))return false;
 if(!counts.every(k=>number(b[k]))||!integer(b.level,1)||!integer(b.xp)||!integer(b.diamonds)||![0,1].includes(b.selectedWeapon))return false;
 const lab=b.lab;if(!keys(lab,['inventory','furnace','products','discoveries','history','ignition'])||!['inventory','furnace','products'].every(k=>stock(lab[k]))||!ids(lab.discoveries,RECIPES)||typeof lab.ignition!=='boolean'||!Array.isArray(lab.history)||lab.history.length>100000||!lab.history.every(v=>keys(v,['id','level'])&&known(v.id,RECIPES)&&integer(v.level,1,MAX_LEVEL)))return false;
 if(!Array.isArray(b.weapons)||b.weapons.length!==2)return false;
 return b.weapons.every(w=>{
  if(!keys(w,['gun','attachments','muzzle','accessoryCharge','condenser','evolutionShots'])||!Array.isArray(w.attachments)||w.attachments.length>2||!w.attachments.every(id=>id===null||known(id,ACCESSORIES))||new Set(w.attachments.filter(Boolean)).size!==w.attachments.filter(Boolean).length||!(w.muzzle===null||known(w.muzzle,MUZZLES))||!charge(w.accessoryCharge)||!keys(w.condenser,['charge','equipped'])||!number(w.condenser.charge,0,1)||typeof w.condenser.equipped!=='boolean'||!integer(w.evolutionShots))return false;
  return w.gun===null||(keys(w.gun,['type','level','rank'])&&(w.gun.type==='normal'||known(w.gun.type,RECIPES))&&integer(w.gun.level,w.gun.type==='normal'?0:1,MAX_LEVEL)&&integer(w.gun.rank,0,10));
 });
}
export function restoreBuild(r,b){
 const saved=copy(b);r.characterId=Object.hasOwn(saved,'characterId')?saved.characterId:DEFAULT_CHARACTER;r.abilities=saved.abilities;r.hp=saved.hp;Object.assign(r.lab,saved.lab);for(const k of counts)r[k]=saved[k];
 for(let i=0;i<2;i++){const w=r.weapons[i],s=saved.weapons[i];Object.assign(w,s);w.condenser=new Condenser();Object.assign(w.condenser,s.condenser);w.shot=0;w.waterParticles=[];w.waterImpacts=[];w.targetId=null;}
 r.loadWeapon(saved.selectedWeapon);
}
const outcomes={training:'trainingSuccess',industrial:'missionSuccess',mine:'missionSuccess',ecology:'missionSuccess'};
export function captureCheckpoint(r){return copy({version:1,missionId:r.missionId,quick:r.quick,completedMissions:r.completedMissions,state:r.state,returningToBase:!!r.returningToBase,outcome:r.missionOutcome,build:captureBuild(r),pending:{loot:r.pendingLoot,gun:r.pendingGun,upgradeChoices:r.upgradeChoices,rewardChoices:r.rewardChoices,rewardKind:r.rewardKind,rewardTaken:r.rewardTaken,intermissionActive:r.intermissionActive}})}
export function validCheckpoint(c,profile){
 if(!keys(c,['version','missionId','quick','completedMissions','state','returningToBase','outcome','build','pending'])||c.version!==1||!known(c.missionId,outcomes)||c.outcome!==outcomes[c.missionId]||typeof c.quick!=='boolean'||typeof c.returningToBase!=='boolean'||!['menu','won','upgrade','gunReward','reward'].includes(c.state)||!validBuild(c.build))return false;
 if(!ids(c.completedMissions,outcomes,4)||new Set(c.completedMissions).size!==c.completedMissions.length||c.completedMissions[0]!=='training'||c.completedMissions.at(-1)!==c.missionId||!profile.data.training)return false;
 for(const id of c.completedMissions)if(id!=='training'&&!profile.data.relics.includes(({industrial:'ceramic-shell',mine:'conductive-crystal',ecology:'steady-capsule'})[id]))return false;
 const p=c.pending;
 if(!keys(p,['loot','gun','upgradeChoices','rewardChoices','rewardKind','rewardTaken','intermissionActive'])||!Array.isArray(p.loot)||p.loot.length>1000||!p.loot.every(item=>keys(item,item.kind==='gun'?['kind','gunType']:['kind','rewardKind'])&&(item.kind==='gun'?known(item.gunType,RECIPES):item.kind==='equipment'&&['accessory','muzzle'].includes(item.rewardKind)))||!(p.gun===null||known(p.gun,RECIPES))||!ids(p.upgradeChoices,ABILITIES,3)||!Array.isArray(p.rewardChoices)||p.rewardChoices.length>3||!p.rewardChoices.every(id=>known(id,p.rewardKind==='accessory'?ACCESSORIES:MUZZLES))||!(p.rewardKind===null||['accessory','muzzle'].includes(p.rewardKind))||typeof p.rewardTaken!=='boolean'||typeof p.intermissionActive!=='boolean')return false;
 if(c.state==='won'&&(c.returningToBase||p.intermissionActive||p.gun||p.upgradeChoices.length))return false;
 if(['upgrade','gunReward','reward'].includes(c.state)&&!p.intermissionActive)return false;
 if(c.state==='menu'&&(c.returningToBase||p.intermissionActive||p.loot.length||p.gun||p.upgradeChoices.length||c.build.xp>=8+(c.build.level-1)*5))return false;
 if(c.state==='upgrade'&&(!c.returningToBase||!p.upgradeChoices.length||c.build.xp<8+(c.build.level-1)*5))return false;
 if(c.state==='gunReward'&&(!c.returningToBase||!p.gun))return false;
 if(c.state==='reward'&&(!c.returningToBase||!p.rewardChoices.length||!p.rewardKind||!p.rewardTaken))return false;
 return true;
}
export function restoreCheckpoint(r,c){
 r.reset();restoreBuild(r,c.build);r.missionId=c.missionId;r.quick=c.quick;r.completedMissions=[...c.completedMissions];r.runActive=true;r.state=c.state;r.returningToBase=c.returningToBase;r.missionOutcome=c.outcome;r.missionSettled=true;r.wave=10;
 const p=copy(c.pending);r.pendingLoot=p.loot;r.pendingGun=p.gun;r.upgradeChoices=p.upgradeChoices;r.upgradeReturn='lab';r.rewardChoices=p.rewardChoices;r.rewardKind=p.rewardKind;r.rewardTaken=p.rewardTaken;r.intermissionActive=p.intermissionActive;
}

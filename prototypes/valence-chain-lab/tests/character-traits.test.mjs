import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BASE_ABILITIES} from '../dist/catalog.mjs';
import {CHARACTERS,CHARACTER_IDS,CHARACTER_TRAITS,characterBaseAbilities,applyCharacterTraits,favoriteWeaponMultiplier} from '../dist/characters.mjs';
import {MissionRun} from '../dist/mission-run.mjs';
import {DualRun} from '../dist/dual-run.mjs';
import {CampaignProfile} from '../dist/progression.mjs';
import {captureBuild,validBuild,restoreBuild} from '../dist/run-checkpoint.mjs';
import {updateAccessories} from '../dist/equipment.mjs';
import {ARENA_BOUNDS} from '../dist/view.mjs';
const make=storage=>new MissionRun(()=>.99,new CampaignProfile(storage??null));
const win=r=>{r.wave=10;r.hit(r.spawnEnemy(6,600,100,{special:true,hp:1,maxHp:1}),1e9);r.returnToBase()};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('three exact role baselines expose two positive deltas, one negative, and one favorite',()=>{
 const expected={daqi:{maxHp:120,defense:.05,speed:210},johnny:{attackSpeed:1.08,crit:.05,maxHp:90},duoduo:{speed:240,magnet:150,attackSpeed:.95}};
 for(const id of CHARACTER_IDS){const t=CHARACTER_TRAITS[id];assert.equal(CHARACTERS[id].traits,t);assert.equal(t.increases.length,2);assert.ok(t.increases.every(x=>x.amount>0&&x.label));assert.ok(t.decrease.amount<0&&t.decrease.label);assert.equal(t.weapon.multiplier,1.05);assert.deepEqual(characterBaseAbilities(id),{...BASE_ABILITIES,...expected[id]});const a=characterBaseAbilities(id);a.speed=0;assert.ok(characterBaseAbilities(id).speed>0);for(const gun of ['normal','flame','water','acid','gas','electric','iron'])assert.equal(favoriteWeaponMultiplier(id,gun),gun===t.weapon.type?1.05:1);}
 assert.deepEqual(characterBaseAbilities('invalid'),BASE_ABILITIES);assert.equal(favoriteWeaponMultiplier(null,'iron'),1);
 const grown={...BASE_ABILITIES,maxHp:180,damage:30,defense:.6,crit:.8};const copy={...grown};assert.equal(applyCharacterTraits(grown,'daqi').maxHp,200);assert.equal(applyCharacterTraits(grown,'daqi').defense,.6);assert.equal(applyCharacterTraits(grown,'johnny').crit,.8);assert.deepEqual(grown,copy);
});
test('start HP, incoming armor, movement, rate, crit and pickup radius use the chosen abilities',()=>{
 for(const id of CHARACTER_IDS){const r=make();r.startNewRun({characterId:id});assert.deepEqual(r.abilities,characterBaseAbilities(id));assert.equal(r.hp,r.abilities.maxHp);assert.equal(r.characterTraitsVersion,1);near(r.hurt(20),20*(1-r.abilities.defense));const x=r.x;r.step(.1,{x:1});near(r.x-x,r.abilities.speed*.1);near(r.stats.crit,r.abilities.crit);near(r.stats.interval,.42/r.abilities.attackSpeed);assert.equal(r.abilities.magnet,characterBaseAbilities(id).magnet);r.endCurrentRun();assert.equal(r.characterTraitsVersion,0);}
});
test('favorite scales final direct damage and flame burn in either slot, including quick, levels, ranks and muzzle',()=>{
 for(const id of CHARACTER_IDS)for(const quick of [false,true])for(const slot of [0,1])for(const type of ['normal','flame','water','acid','gas','electric','iron']){const r=make();r.startNewRun({characterId:id,quick});r.weapons[slot].gun={type,level:type==='normal'?0:4,rank:6};r.loadWeapon(slot);r.muzzle='focus';const plain=new DualRun(()=>.99);plain.start(type);plain.abilities={...r.abilities};plain.lab.gun.level=r.lab.gun.level;plain.lab.gun.rank=6;plain.muzzle='focus';const mult=favoriteWeaponMultiplier(id,type)*(quick?100:1);near(r.stats.damage,plain.stats.damage*mult);near(r.stats.burnDps,plain.stats.burnDps*mult);assert.equal(r.stats.crit,plain.stats.crit);assert.equal(r.stats.corrosionStrength,plain.stats.corrosionStrength);}
});
test('favorite primary attacks reach enemies but independent accessory damage does not inherit the bonus',()=>{
 const r=make();r.startNewRun({characterId:'johnny',gun:'flame'});const e=r.spawnEnemy(0,r.x+80,r.y,{hp:1000,maxHp:1000});const hp=e.hp;r.firePrimary(r.stats,[e],e,ARENA_BOUNDS);near(hp-e.hp,r.stats.damage);near(e.burnDps,r.stats.burnDps);
 r.pickupGun('acid');r.selectWeapon(1);r.attachments=['hydrogen'];r.accessoryCharge={hydrogen:1};r.events=['shot'];const before=e.hp;updateAccessories(r,.01,ARENA_BOUNDS);near(before-e.hp,24);near(e.burnDps,12);
});
test('traits and learned growth survive acts, capture, import and reload exactly once',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 for(const id of CHARACTER_IDS){const r=make(storage);r.endCurrentRun();r.startNewRun({characterId:id});r.abilities.damage+=6;r.abilities.maxHp+=20;r.hp=37;win(r);const expected={...r.abilities};assert.equal(captureBuild(r).characterTraitsVersion,1);for(let n=0;n<3;n++){const loaded=make(storage);assert.deepEqual(loaded.abilities,expected);assert.equal(loaded.hp,37);assert.ok(loaded.importArchive(loaded.exportArchive()));assert.deepEqual(loaded.abilities,expected);}assert.ok(r.startMission('mine'));assert.deepEqual(r.abilities,expected);assert.equal(r.hp,expected.maxHp);}
});
test('legacy migration preserves growth, caps, injured HP and normalizes durable archives',()=>{
 for(const id of CHARACTER_IDS){const r=make();r.startNewRun();win(r);const archive=JSON.parse(r.exportArchive()),b=archive.checkpoint.build;delete b.characterTraitsVersion;b.characterId=id;b.abilities={...BASE_ABILITIES,maxHp:140,damage:27,defense:.6,crit:.8};b.hp=140;assert.ok(validBuild(b));assert.ok(r.importArchive(JSON.stringify(archive)));assert.deepEqual(r.abilities,applyCharacterTraits(b.abilities,id));assert.equal(r.hp,Math.min(140,r.abilities.maxHp));const exported=JSON.parse(r.exportArchive());assert.equal(exported.checkpoint.build.characterTraitsVersion,1);const expected={...r.abilities};assert.ok(r.importArchive(JSON.stringify(exported)));assert.deepEqual(r.abilities,expected);const bad={...b,abilities:{...characterBaseAbilities(id)},characterTraitsVersion:1};bad.abilities.maxHp=1;assert.equal(validBuild(bad),false);}
 const r=make();r.startNewRun();win(r);const old=JSON.parse(r.exportArchive());delete old.checkpoint.build.characterTraitsVersion;delete old.checkpoint.build.characterId;old.checkpoint.build.abilities={...BASE_ABILITIES};old.checkpoint.build.hp=43;assert.ok(r.importArchive(JSON.stringify(old)));assert.equal(r.characterId,'daqi');assert.equal(r.hp,43);assert.equal(r.abilities.maxHp,120);
});
test('invalid versions and identities reject atomically, including direct restore',()=>{
 const r=make();r.startNewRun();win(r);const good=r.exportArchive();for(const version of [0,2,1.5,null,'1']){const a=JSON.parse(good);a.checkpoint.build.characterTraitsVersion=version;assert.equal(r.importArchive(JSON.stringify(a)),false);assert.equal(r.exportArchive(),good);const before=JSON.stringify(r);assert.equal(restoreBuild(r,a.checkpoint.build),false);assert.equal(JSON.stringify(r),before);}
 const a=JSON.parse(good);delete a.checkpoint.build.characterId;assert.equal(validBuild(a.checkpoint.build),false);assert.equal(r.importArchive(JSON.stringify(a)),false);
});

test('Johnny crit executes on direct attacks and Duoduo attracts drops from the wider radius',()=>{
 for(const id of ['daqi','johnny']){const r=make();r.startNewRun({characterId:id,gun:'flame'});r.random=()=>.04;const e=r.spawnEnemy(0,r.x+80,r.y,{hp:1000,maxHp:1000});const before=e.hp;r.firePrimary(r.stats,[e],e,ARENA_BOUNDS);near(before-e.hp,r.stats.damage*(id==='johnny'?2:1));}
 for(const id of ['daqi','duoduo']){const r=make();r.startNewRun({characterId:id});r.spawn=999;r.shot=999;const drop={kind:'diamond',x:r.x+140,y:r.y,value:1};r.drops=[drop];const x=drop.x;r.step(.01);assert.equal(drop.x<x,id==='duoduo');}
});
test('legacy checkpoint loaded from storage is durably migrated before the next reload',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};const r=make(storage);r.startNewRun({characterId:'johnny'});win(r);const old=JSON.parse(r.exportArchive()).checkpoint;delete old.build.characterTraitsVersion;old.build.abilities={...BASE_ABILITIES,maxHp:140,damage:24};old.build.hp=140;storage.setItem(r.checkpointKey,JSON.stringify(old));const first=make(storage);assert.equal(first.abilities.maxHp,130);assert.equal(first.hp,130);assert.equal(JSON.parse(storage.getItem(r.checkpointKey)).build.characterTraitsVersion,1);const next=make(storage);assert.deepEqual(next.abilities,first.abilities);assert.equal(next.hp,130);
});

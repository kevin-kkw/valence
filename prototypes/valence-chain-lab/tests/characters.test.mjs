import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MissionRun} from '../dist/mission-run.mjs';
import {CampaignProfile} from '../dist/progression.mjs';
import {CHARACTERS,CHARACTER_IDS,DEFAULT_CHARACTER,characterBaseAbilities} from '../dist/characters.mjs';
import {captureBuild,validBuild,captureCheckpoint,validCheckpoint} from '../dist/run-checkpoint.mjs';
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};
const create=storage=>new MissionRun(()=>.99,new CampaignProfile(storage??null));
const win=r=>{r.wave=10;const boss=r.spawnEnemy(6,600,120,{special:true,hp:10,maxHp:10});r.hit(boss,1e6)};
const train=r=>{win(r);assert.ok(r.returnToBase());assert.equal(r.state,'menu')};

test('selection is idle, cancellable, and preserves the permanent profile',()=>{
 const r=create();r.profile.complete('training');const profile=r.profile.exportSave();
 assert.equal(r.characterId,null);assert.equal(r.character,null);
 assert.ok(r.beginCharacterSelection({quick:true}));assert.equal(r.state,'character');assert.equal(r.selectionQuick,true);assert.equal(r.runActive,false);
 const before={elapsed:r.elapsed,hp:r.hp,x:r.x,y:r.y,enemies:r.enemies.length};r.step(.1,{x:1,shoot:true});
 assert.deepEqual({elapsed:r.elapsed,hp:r.hp,x:r.x,y:r.y,enemies:r.enemies.length},before);
 r.saveCheckpoint();assert.equal(r._checkpoint,null);assert.ok(r.cancelCharacterSelection());assert.equal(r.state,'menu');assert.equal(r.selectionQuick,false);assert.equal(r.characterId,null);assert.equal(r.profile.exportSave(),profile);
});

test('all three identities start with the same ordinary gun and role abilities in normal and quick training',()=>{
 for(const quick of [false,true]){for(const characterId of CHARACTER_IDS){const r=create();r.beginCharacterSelection({quick});assert.ok(r.startNewRun({quick,characterId}));assert.equal(r.characterId,characterId);assert.equal(r.character,CHARACTERS[characterId]);assert.equal(r.state,'playing');assert.equal(r.selectionQuick,false);assert.equal(r.weapons[0].gun.type,'normal');assert.equal(r.weapons[1].gun,null);assert.deepEqual(r.abilities,characterBaseAbilities(characterId));assert.equal(r.stats.damage,quick?1800:18);}}
 assert.ok(create().startNewRun());const r=create();r.start();assert.equal(r.characterId,DEFAULT_CHARACTER);
});

test('invalid IDs reject atomically, and an active run cannot select, cancel, or switch identity',()=>{
 const r=create();r.beginCharacterSelection({quick:true});
 for(const characterId of ['bad','__proto__','constructor','',null,17]){const before=JSON.stringify(r);assert.equal(r.startNewRun({characterId}),false);assert.equal(JSON.stringify(r),before);}
 assert.ok(r.startMission('training',{characterId:'johnny'}));assert.equal(r.characterId,'johnny');
 for(const action of [()=>r.beginCharacterSelection(),()=>r.cancelCharacterSelection(),()=>r.startNewRun({characterId:'duoduo'})]){const before=JSON.stringify(r);assert.equal(action(),false);assert.equal(JSON.stringify(r),before);}
 train(r);const before=JSON.stringify(r);assert.equal(r.beginCharacterSelection(),false);assert.equal(JSON.stringify(r),before);
 r.endCurrentRun();assert.equal(r.characterId,null);assert.equal(r.character,null);r.startNewRun({characterId:'duoduo'});r.hp=0;r.state='dead';r.settleMission();assert.equal(r.characterId,'duoduo');assert.ok(r.beginCharacterSelection());assert.equal(r.characterId,null);
});

test('identity survives every act, field results, and the final result',()=>{
 const r=create();r.startNewRun({characterId:'duoduo'});train(r);
 for(const id of ['mine','industrial','ecology']){assert.ok(r.startMission(id));assert.equal(r.characterId,'duoduo');assert.equal(captureBuild(r).characterId,'duoduo');win(r);assert.equal(r.characterId,'duoduo');assert.equal(r.missionOutcome,'missionSuccess');r.returnToBase();}
 assert.ok(r.startMission('core'));assert.equal(r.characterId,'duoduo');const boss=r.enemies.find(e=>e.id===r.coreBossId);r.hit(boss,1e9);const core=r.drops[0];r.x=core.x;r.y=core.y;r.step(.01);assert.equal(r.missionOutcome,'trueEnding');assert.equal(r.character.name,'朵朵');r.endCurrentRun();assert.equal(r.characterId,null);
});

test('checkpoint reload and archive import retain identity; legacy builds default to Daqi',()=>{
 const storage=memory(),r=create(storage);r.startNewRun({characterId:'johnny',quick:true});train(r);
 assert.equal(captureCheckpoint(r).build.characterId,'johnny');const reloaded=create(storage);assert.equal(reloaded.characterId,'johnny');assert.equal(reloaded.state,'menu');assert.equal(reloaded.beginCharacterSelection(),false);
 const imported=create();assert.ok(imported.importArchive(r.exportArchive()));assert.equal(imported.characterId,'johnny');assert.ok(imported.startMission('mine'));assert.equal(imported.characterId,'johnny');
 const legacy=JSON.parse(r.exportArchive());delete legacy.checkpoint.build.characterId;delete legacy.checkpoint.build.characterTraitsVersion;legacy.checkpoint.build.abilities={...characterBaseAbilities()};legacy.checkpoint.build.hp=43;assert.ok(validBuild(legacy.checkpoint.build));assert.ok(validCheckpoint(legacy.checkpoint,r.profile));assert.ok(imported.importArchive(JSON.stringify(legacy)));assert.equal(imported.characterId,DEFAULT_CHARACTER);
 storage.setItem(r.checkpointKey,JSON.stringify(legacy.checkpoint));assert.equal(create(storage).characterId,DEFAULT_CHARACTER);
});

test('invalid checkpoint identity rejects import without modifying the current run or profile',()=>{
 const r=create();r.startNewRun({characterId:'duoduo'});train(r);const good=r.exportArchive();
 for(const characterId of ['bad','__proto__',null,17]){const archive=JSON.parse(good);archive.checkpoint.build.characterId=characterId;assert.equal(validBuild(archive.checkpoint.build),false);const before=JSON.stringify(r);assert.equal(r.importArchive(JSON.stringify(archive)),false);assert.equal(JSON.stringify(r),before);}
 const unknown=JSON.parse(good);unknown.checkpoint.build.extra=true;assert.equal(r.importArchive(JSON.stringify(unknown)),false);
 r.reset();assert.equal(r.characterId,null);assert.equal(r.selectionQuick,false);
});

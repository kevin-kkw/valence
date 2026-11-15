import {mapSpawnExtras,updateMapMonster,onMapMonsterDeath,mapMonsterDamage} from './map-monsters.mjs';
import {DualRun} from './dual-run.mjs';
import {RECIPES} from './catalog.mjs';
import {WAVE_SECONDS} from './campaign.mjs';
import {CampaignProfile,MISSIONS} from './progression.mjs';
import {resetWorld,updateWorld} from './worlds.mjs';
import {captureBuild,restoreBuild,captureCheckpoint,validCheckpoint,restoreCheckpoint} from './run-checkpoint.mjs';
import {CHARACTERS,DEFAULT_CHARACTER,isCharacterId,applyCharacterTraits,favoriteWeaponMultiplier} from './characters.mjs';
export const QUICK_SECONDS=[8,9,10,11,12,12,12,12,12,16];
export class MissionRun extends DualRun{
 constructor(random=Math.random,profile=new CampaignProfile()){
  super(random);this.profile=profile;this.missionId='training';this.quick=false;this.runActive=false;this.completedMissions=[];this.returningToBase=false;this._checkpoint=null;this.sessionStorageAvailable=!!profile.storage;
  try{const raw=profile.storage?.getItem(this.checkpointKey);if(raw){const c=JSON.parse(raw);if(c&&validCheckpoint(c,profile)){restoreCheckpoint(this,c);this._checkpoint=captureCheckpoint(this);this.persistCheckpoint();resetWorld(this)}}}catch{this.sessionStorageAvailable=false}
 }
 get checkpointKey(){return this.profile.key+'.run.v1'}
 // Run's constructor calls reset dynamically: keep profile/world work in start methods.
 reset(){super.reset();this.characterId=null;this.characterTraitsVersion=0;this.selectionQuick=false;this.sampleRecovered=false;this.coreRecovered=false;this.coreDefeated=false;this.coreBossId=null;this.missionOutcome=null;this.missionSettled=false;this.returningToBase=false;this.isEquipmentTest=false}
 get character(){return isCharacterId(this.characterId)?CHARACTERS[this.characterId]:null}
 get mission(){return MISSIONS[this.missionId]||MISSIONS.training}
 get duration(){if(this.missionId==='core')return Infinity;return this.quick?QUICK_SECONDS[this.wave-1]:super.duration}
 get attackMultiplier(){return this.missionId==='training'&&this.quick?100:1}
 get stats(){const stats=super.stats,multiplier=this.attackMultiplier*favoriteWeaponMultiplier(this.characterId,this.lab.gun.type);return {...stats,damage:stats.damage*multiplier,burnDps:stats.burnDps*multiplier}}
 canTravel(id){
  if(id==='training')return !this.runActive;
  return this.runActive&&this.state==='menu'&&this.completedMissions.includes('training')&&!this.completedMissions.includes(id)&&this.profile.unlocked(id)&&!this.intermissionActive&&!this.pendingLoot.length&&!this.pendingGun&&!this.pendingAbilityCount;
 }
 start(gun='normal'){return this.startNewRun({quick:!!this.quick,gun})}
 beginCharacterSelection({quick=false}={}){
  if(this.runActive)return false;
  this.endCurrentRun();this.state='character';this.selectionQuick=!!quick;return true;
 }
 cancelCharacterSelection(){
  if(this.runActive||this.state!=='character')return false;
  this.state='menu';this.selectionQuick=false;return true;
 }
 startNewRun({quick=false,gun='normal',characterId=DEFAULT_CHARACTER}={}){
  if(this.runActive||!isCharacterId(characterId)||(gun!=='normal'&&!Object.hasOwn(RECIPES,gun)))return false;
  this._checkpoint=null;this.persistCheckpoint();
  if(!super.start(gun))return false;
  this.characterId=characterId;this.abilities=applyCharacterTraits(this.abilities,characterId);this.hp=this.abilities.maxHp;this.characterTraitsVersion=1;this.runActive=true;this.completedMissions=[];this.configureAct('training',quick);return true;
 }
 configureAct(id,quick){
  this.missionId=id;this.quick=!!quick;this.isEquipmentTest=false;
  this.guaranteedGunTimes=Object.fromEntries([1,3].map(w=>[w,(this.quick?QUICK_SECONDS[w-1]:WAVE_SECONDS[w-1])*(.5+Math.min(.999999,Math.max(0,this.random()))*.35)]));
  resetWorld(this);
  if(id==='core'){
   this.wave=10;this.spawn=Infinity;this.specialSpawned=true;this.recurringEliteSpawned=true;
   const boss=this.spawnEnemy(6,600,240,{special:true,hp:6000,maxHp:6000,damage:34});this.coreBossId=boss.id;this.specialId=boss.id;
  }
 }
 startMission(id,{quick=false,gun='normal',characterId=DEFAULT_CHARACTER}={}){
  if(id==='training')return this.startNewRun({quick,gun,characterId});
  if(!this.canTravel(id))return false;
  this.saveCheckpoint();const build=captureBuild(this);this.reset();restoreBuild(this,build);this.hp=this.abilities.maxHp;this.state='playing';this.configureAct(id,quick);return true;
 }
 persistCheckpoint(){
  if(!this.profile.storage){this.sessionStorageAvailable=false;return}
  try{this.profile.storage.setItem(this.checkpointKey,JSON.stringify(this._checkpoint));this.sessionStorageAvailable=true}catch{this.sessionStorageAvailable=false}
 }
 saveCheckpoint(){if(this.runActive&&this.missionSettled&&!this.isEquipmentTest){this._checkpoint=captureCheckpoint(this);this.persistCheckpoint()}}
 endCurrentRun(){this.runActive=false;this.completedMissions=[];this.returningToBase=false;this._checkpoint=null;this.persistCheckpoint();this.reset();this.state='menu';return true}
 returnToBase(){
  if(this.isEquipmentTest||!this.runActive){this.endCurrentRun();return true}
  if(!this.missionSettled||!['trainingSuccess','missionSuccess'].includes(this.missionOutcome))return false;
  this.returningToBase=true;this.state='lab';this.intermissionActive=true;this.advanceIntermission();this.saveCheckpoint();return true;
 }
 advanceIntermission(){
  super.advanceIntermission();
  if(this.returningToBase&&!this.intermissionActive&&this.state==='lab'){this.returningToBase=false;this.state='menu';this.upgradeChoices=[];this.rewardChoices=[];this.rewardKind=null}
  if(this.returningToBase||this.state==='menu')this.saveCheckpoint();
 }
 chooseAbility(id){const result=super.chooseAbility(id);if(result)this.saveCheckpoint();return result}
 chooseReward(id,position=null){const result=super.chooseReward(id,position);if(result)this.saveCheckpoint();return result}
 resolveGunPickup(index){const result=super.resolveGunPickup(index);if(result)this.saveCheckpoint();return result}
 exportArchive(){return JSON.stringify({version:1,profile:this.profile.data,checkpoint:this.runActive?this._checkpoint:null})}
 importArchive(text){
  try{
   if(typeof text!=='string'||text.length>2000000)return false;
   const archive=JSON.parse(text),legacy=archive&&Object.hasOwn(archive,'training'),profileData=legacy?archive:archive?.profile;
   if(!legacy&&(!archive||Object.keys(archive).sort().join(',')!=='checkpoint,profile,version'||archive.version!==1))return false;
   const probe=new CampaignProfile(null);if(!probe.importSave(JSON.stringify(profileData)))return false;
   const checkpoint=legacy?null:archive.checkpoint;if(checkpoint!==null&&!validCheckpoint(checkpoint,probe))return false;
   this.profile.importSave(JSON.stringify(profileData));this.reset();this.runActive=false;this.completedMissions=[];this.missionId='training';this.quick=false;this._checkpoint=checkpoint;
   if(checkpoint){restoreCheckpoint(this,checkpoint);this._checkpoint=captureCheckpoint(this);resetWorld(this)}this.persistCheckpoint();return true;
  }catch{return false}
 }
 clearArchive(){this.endCurrentRun();this.profile.reset();return true}
 spawnEnemy(type,x,y,extra={}){
  const e=super.spawnEnemy(type,x,y,mapSpawnExtras(this.missionId,type,extra,this.wave));if(!e)return e;
  const boss=type===4||type===6;
  if(this.quick){e.hp*=boss?.25:.55;e.maxHp*=boss?.25:.55;e.damage*=.6}
  if(boss&&e.special&&this.missionId&&this.missionId!=='training'){e.missionBoss=this.missionId;e.missionBossTier=this.wave===9?'fore':'guardian';e.displayName=this.wave===9?({industrial:'排放巡检机',mine:'巡层晶簇',ecology:'循环看守体',core:'身份校验单元'}[this.missionId]):this.mission.bossName}
  return e;
 }
 settleMission(){
  if(this.missionSettled||!['won','dead'].includes(this.state))return;
  if(this.missionId==='core'&&this.state==='won'&&this.hp>0&&!this.coreRecovered)return;
  this.missionSettled=true;
  if(this.isEquipmentTest){this.missionOutcome='equipmentTest';this.runActive=false;this._checkpoint=null;this.persistCheckpoint();return}
  if(this.state==='dead'||this.hp<=0){this.state='dead';this.missionOutcome='lost';this.sampleRecovered=false;this.runActive=false;this._checkpoint=null;this.persistCheckpoint();return}
  if(this.missionId!=='core'){
   // The last guardian ends combat immediately; recover only equipment, as at other wave ends.
   this.state='playing';for(const d of this.drops)if(['gun','equipment'].includes(d.kind)&&!d.collected)this.collect(d);this.state='won';this.drops=[];
  }
  this.missionOutcome=this.profile.complete(this.missionId,{sample:this.coreRecovered});
  if(this.missionOutcome==='finalFailure'){this.state='dead';this.events=this.events.filter(e=>e!=='victory');this.events.push('finalFailure')}
  if(['trueEnding','finalFailure'].includes(this.missionOutcome)){this.runActive=false;this._checkpoint=null;this.persistCheckpoint()}
  else{if(!this.completedMissions.includes(this.missionId))this.completedMissions.push(this.missionId);this.saveCheckpoint()}
 }
 updateMapEnemy(e,dt,bounds){return updateMapMonster(this,e,dt,bounds)}
 hit(enemy,damage,burn=false){
  const wasAlive=enemy.hp>0;super.hit(enemy,mapMonsterDamage(this,enemy,damage,burn),burn);
  if(wasAlive&&enemy.hp<=0)onMapMonsterDeath(this,enemy);
  if(this.missionId==='core'&&enemy.id===this.coreBossId&&wasAlive&&enemy.hp<=0){
   if(this.hp<=0){this.state='dead';this.settleMission();return}
   this.coreDefeated=true;this.state='playing';this.clearCoreCombat();
   this.drops=[{kind:'aiCore',x:enemy.x,y:enemy.y,collected:false}];this.events=this.events.filter(e=>e!=='victory');this.events.push('aiCoreDropped');return;
  }
  if(this.state==='won')this.settleMission();
 }
 clearCoreCombat(){
  this.enemies=[];this.enemyBullets=[];this.hazards=[];this.worldHazards=[];this.bullets=[];this.accessoryZones=[];this.accessoryProjectiles=[];this.evolutionZones=[];this.weaponEffects=[];this.accessoryFx=[];this.particles=[];this.texts=[];this.waterParticles=[];this.waterImpacts=[];this.waterMuzzle=null;
  for(const w of this.weapons){w.waterParticles=[];w.waterImpacts=[];w.waterMuzzle=null;w.condenser.particles=[];w.condenser.impacts=[];w.condenser.muzzle=null}
 }
 hurt(damage,options={}){if(this.missionId==='core'&&this.coreDefeated&&this.hp>0)return 0;return super.hurt(damage,options)}
 collect(drop){
  if(drop.kind!=='aiCore')return super.collect(drop);
  if(this.state!=='playing'||this.hp<=0||!this.coreDefeated||drop.collected||!this.drops.includes(drop)||Math.hypot(this.x-drop.x,this.y-drop.y)>=28)return false;
  drop.collected=true;this.coreRecovered=true;this.drops=[];this.state='won';this.events.push('aiRepaired','victory');this.settleMission();return true;
 }
 canEndWave(){return this.missionId==='core'?false:super.canEndWave()}
 nextWave(){return this.missionId==='core'?false:super.nextWave()}
 endWave(){
  if(this.missionId==='core'||this.missionSettled||this.state!=='playing'||this.hp<=0)return;
  const clue=this.wave===5?this.mission.clue:null;
  super.endWave();
  if(clue&&!this.isEquipmentTest&&this.profile.discover(clue.id))this.events.push('clueFound');
  this.settleMission();
 }
 step(dt,input={}){
  if(this.state==='character')return;
  if(this.missionId==='core'&&this.coreDefeated&&this.state==='playing'){
   if(this.hp<=0){this.state='dead';this.settleMission();return}
   this.events=[];const elapsed=Math.min(.1,Math.max(0,dt)),x=input.x||0,y=input.y||0,n=Math.max(1,Math.hypot(x,y));this.elapsed+=elapsed;
   this.x=Math.max(28,Math.min(1172,this.x+x/n*this.abilities.speed*elapsed));this.y=Math.max(28,Math.min(772,this.y+y/n*this.abilities.speed*elapsed));
   for(const drop of this.drops)this.collect(drop);return;
  }
  super.step(dt,input);
  if(this.missionId==='core'&&this.coreDefeated)this.clearCoreCombat();
  if(this.state==='playing'){updateWorld(this,Math.min(.1,Math.max(0,dt)));if(this.hp<=0)this.state='dead'}
  this.settleMission();
 }
}

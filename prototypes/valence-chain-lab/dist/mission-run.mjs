import {DualRun} from './dual-run.mjs';
import {RECIPES} from './catalog.mjs';
import {WAVE_SECONDS} from './campaign.mjs';
import {CampaignProfile,MISSIONS} from './progression.mjs';
import {resetWorld,updateWorld} from './worlds.mjs';
export const QUICK_SECONDS=[8,9,10,11,12,12,12,12,12,16];
export class MissionRun extends DualRun{
 constructor(random=Math.random,profile=new CampaignProfile()){
  super(random);this.profile=profile;this.missionId='training';this.quick=false;
 }
 // Run's constructor calls reset dynamically: keep profile/world work in startMission.
 reset(){super.reset();this.sampleRecovered=false;this.missionOutcome=null;this.missionSettled=false}
 get mission(){return MISSIONS[this.missionId]||MISSIONS.training}
 get duration(){return this.quick?QUICK_SECONDS[this.wave-1]:super.duration}
 start(gun='normal'){return this.startMission(this.missionId||'training',{quick:!!this.quick,gun})}
 startMission(id,{quick=false,gun='normal'}={}){
  if(!this.profile.unlocked(id)||(gun!=='normal'&&!Object.hasOwn(RECIPES,gun)))return false;
  if(!super.start(gun))return false;
  this.missionId=id;this.quick=!!quick;this.isEquipmentTest=false;
  if(id==='training'&&this.quick)this.abilities.damage*=100;
  this.guaranteedGunTimes=Object.fromEntries([1,3].map(w=>[w,(this.quick?QUICK_SECONDS[w-1]:WAVE_SECONDS[w-1])*(.5+Math.min(.999999,Math.max(0,this.random()))*.35)]));
  resetWorld(this);return true;
 }
 spawnEnemy(type,x,y,extra={}){
  const e=super.spawnEnemy(type,x,y,extra);if(!e)return e;
  const boss=type===4||type===6;
  if(this.quick){e.hp*=boss?.25:.55;e.maxHp*=boss?.25:.55;e.damage*=.6}
  if(boss&&e.special&&this.missionId&&this.missionId!=='training'){e.missionBoss=this.missionId;e.missionBossTier=this.wave===9?'fore':'guardian';e.displayName=this.wave===9?({industrial:'排放巡检机',mine:'巡层晶簇',ecology:'循环看守体',core:'身份校验单元'}[this.missionId]):this.mission.bossName}
  return e;
 }
 settleMission(){
  if(this.missionSettled||!['won','dead'].includes(this.state))return;
  this.missionSettled=true;if(this.isEquipmentTest){this.missionOutcome='equipmentTest';return}
  if(this.state==='dead'||this.hp<=0){this.state='dead';this.missionOutcome='lost';return}
  this.missionOutcome=this.profile.complete(this.missionId,{sample:this.sampleRecovered});
  if(this.missionOutcome==='finalFailure'){this.state='dead';this.events=this.events.filter(e=>e!=='victory');this.events.push('finalFailure')}
 }
 hit(enemy,damage,burn=false){super.hit(enemy,damage,burn);if(this.state==='won')this.settleMission()}
 endWave(){
  if(this.missionSettled||this.state!=='playing'||this.hp<=0)return;
  const clue=this.wave===5?this.mission.clue:null;
  super.endWave();
  if(clue&&this.profile.discover(clue.id))this.events.push('clueFound');
  this.settleMission();
 }
 step(dt,input={}){
  super.step(dt,input);
  if(this.state==='playing'){updateWorld(this,Math.min(.1,Math.max(0,dt)));if(this.hp<=0)this.state='dead'}
  this.settleMission();
 }
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Run} from '../dist/model.mjs';
import {updateAccessories,triggerWaterChain} from '../dist/equipment.mjs';
const bounds={left:22,top:22,right:1178,bottom:778};
function setup(gun,id,damage=18,rate=1){const r=new Run(()=>.99);r.start(gun);r.attachments=[id];r.abilities.damage=damage;r.abilities.attackSpeed=rate;r.events=['shot'];r.accessoryCharge[id]=1;return r}
function enemy(r,x=700,y=400){return r.spawnEnemy(2,x,y,{hp:10000,maxHp:10000,speed:0})}
for(const [gun,id] of [['water','freeze'],['iron','shards'],['acid','hydrogen'],['gas','expansion'],['gas','pressure'],['electric','capacitor'],['flame','heat']])test(`${id} damage doubles with character damage; control durations stay fixed`,()=>{
 const runs=[18,36].map(d=>{const r=setup(gun,id,d);const e=enemy(r,id==='shards'?660:700);updateAccessories(r,.01,bounds);r.events=[];for(let i=0;i<30;i++)updateAccessories(r,.02,bounds);return {r,e,damage:10000-e.hp}});
 assert.ok(runs[0].damage>0);assert.ok(Math.abs(runs[1].damage/runs[0].damage-2)<1e-7);
 if(id==='hydrogen'){assert.equal(runs[1].e.burnDps,24);assert.equal(runs[1].e.burn,2.5)}
 if(['freeze','expansion'].includes(id)){assert.equal(runs[1].e.slow,3);assert.equal(runs[1].e.slowFactor,.45)}
});
test('water hit chain inherits damage, shorter cooldown and matching charge progress',()=>{const r=setup('water','conductive',36,2),e=enemy(r);assert.equal(triggerWaterChain(r,e,bounds),true);assert.equal(e.hp,9980);assert.equal(r.waterChainReady,.45);r.elapsed=.225;r.events=[];updateAccessories(r,0,bounds);assert.ok(Math.abs(r.accessoryCharge.conductive-.5)<1e-8);assert.equal(triggerWaterChain(r,e,bounds),false);r.elapsed=.45;assert.equal(triggerWaterChain(r,e,bounds),true)});
test('shot modules charge faster at higher rate without free idle charge',()=>{
 for(const [gun,id] of [['water','freeze'],['acid','foam'],['acid','hydrogen'],['electric','capacitor'],['electric','magnetic'],['iron','shards']]){
  const charges=[1,2].map(rate=>{const r=setup(gun,id,18,rate);r.accessoryCharge[id]=0;for(let i=0;i<Math.round(rate*2);i++)updateAccessories(r,.01,bounds);return r.accessoryCharge[id]});
  assert.ok(charges[1]>charges[0]*1.9,id);const r=setup(gun,id,18,2);r.accessoryCharge[id]=0;r.events=[];updateAccessories(r,1,bounds);assert.equal(r.accessoryCharge[id],0);
 }
});
test('water pack inherits damage and rate only in collection, drains even at extreme rate',()=>{
 const r=setup('flame','condenser',36,99);r.weaponEffects=[{type:'flame',life:10}];r.condenser.charge=.2;r.condenser.step(.5,r,bounds);assert.ok(Math.abs(r.condenser.charge-.4)<1e-8);
 r.condenser.charge=.8;r.condenser.spraying=true;const e=enemy(r,540);r.condenser.step(.1,r,bounds);assert.ok(r.condenser.charge<.8);assert.ok(Math.abs((10000-e.hp)-15)<1e-8);assert.ok(Math.abs(r.condenser.clock-.025)<1e-8);
 r.weaponEffects=[];const before=r.condenser.charge;r.condenser.step(.1,r,bounds);assert.ok(Math.abs(before-r.condenser.charge-.1/1.8)<1e-8);
 r.condenser.charge=0;r.condenser.spraying=false;r.condenser.step(.1,r,bounds);assert.equal(r.condenser.charge,0);assert.equal(r.condenser.spraying,false);
});
test('character ability selection scales accessories once, without gun or muzzle damage stacking',()=>{const r=setup('water','conductive');r.state='upgrade';r.upgradeChoices=['damage'];r.xp=r.needed;assert.equal(r.chooseAbility('damage'),true);r.lab.gun.level=10;r.muzzle='focus';const e=enemy(r);triggerWaterChain(r,e,bounds);assert.ok(Math.abs((10000-e.hp)-10*21/18)<1e-8)});
test('rate caps bound charge speed and inactive equipment never charges',()=>{
 const charges=[3,30].map(rate=>{const r=setup('electric','magnetic',18,rate);r.accessoryCharge.magnetic=0;for(let i=0;i<rate;i++)updateAccessories(r,1/rate,bounds);return r.accessoryCharge.magnetic});assert.ok(Math.abs(charges[0]-charges[1])<1e-8);
 const r=setup('flame','freeze',36,3);r.accessoryCharge.freeze=0;updateAccessories(r,.1,bounds);assert.equal(r.accessoryCharge.freeze,0);assert.equal(r.accessoryProjectiles.length,0);
});
test('stationary fire ring charges by firing time and rate; duration remains five seconds',()=>{const charges=[1,2].map(rate=>{const r=setup('flame','heat',18,rate);r.accessoryCharge.heat=0;r.weaponEffects=[{type:'flame',life:1}];updateAccessories(r,1,bounds);return r.accessoryCharge.heat});assert.equal(charges[1],charges[0]*2);const r=setup('flame','heat',18,3);updateAccessories(r,.01,bounds);assert.equal(r.accessoryZones[0].life,5)});

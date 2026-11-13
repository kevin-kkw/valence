import {Condenser} from './condenser.mjs';
import {combatBounds,visibleInCombat,ARENA_BOUNDS} from './view.mjs';
import {MATERIALS,RECIPES,emptyStock,MAX_LEVEL,BASE_ABILITIES,ABILITIES,DROP_RATES,ENEMY_TYPES,DIFFICULTY,waveScaling,WEAPON_PROFILES} from './catalog.mjs';
export function gunStats(gun,abilities=BASE_ABILITIES){
 const level=Math.max(1,gun.level),p=WEAPON_PROFILES[gun.type]||WEAPON_PROFILES.normal;
 return {range:p.range+p.rangePerLevel*(level-1),halfAngle:p.halfAngle+(p.anglePerLevel||0)*(level-1),damage:abilities.damage*(p.damageMultiplier||1)*(1+(p.damagePerLevel||0)*(level-1)),interval:(gun.type==='water'?Math.max(.12,.42/(1+.45*level)):(p.interval||.42))/abilities.attackSpeed,burnDps:gun.type==='flame'?7+level*5:0,burnTime:gun.type==='flame'?2.5:0,crit:abilities.crit,corrosionStrength:(p.corrosionStep||0)+(p.corrosionPerLevel||0)*(level-1),knockback:(p.knockback||0)+(p.knockbackPerLevel||0)*(level-1),chainCount:gun.type==='electric'?3+Math.floor((level-1)/2):0,chainRange:(p.chainRange||0)+(p.chainRangePerLevel||0)*(level-1),pierce:gun.type==='iron'?2+Math.floor((level-1)/2):1,projectileSpeed:p.projectileSpeed||600};
}
export class Lab{
 constructor(){this.inventory=emptyStock();this.furnace=emptyStock();this.gun={type:'normal',level:0};this.products=emptyStock();this.ignition=true;this.discoveries=[];this.history=[]}
 moveMaterial(id,to){if(!Object.hasOwn(MATERIALS,id)||!['furnace','inventory'].includes(to))return false;let from=to==='furnace'?'inventory':'furnace';if(this[from][id]<1)return false;this[from][id]--;this[to][id]++;return true}
 returnAll(){for(const id of Object.keys(MATERIALS)){this.inventory[id]=(this.inventory[id]||0)+(this.furnace[id]||0);this.furnace[id]=0}}
 recipeInfo(id){const r=RECIPES[id];if(!r)return null;let missing={};for(const [key,n]of Object.entries(r.cost)){let diff=n-(this.furnace[key]||0)-(this.inventory[key]||0);if(diff>0)missing[key]=diff}return {recipe:r,missing,maxed:this.gun.type===id&&this.gun.level>=MAX_LEVEL,ready:Object.keys(missing).length===0,replace:this.gun.type!=='normal'&&this.gun.type!==id}}
 craft(id,confirm=false){const info=this.recipeInfo(id);if(!info)return {ok:false,reason:'unknown'};if(info.maxed)return {ok:false,reason:'maxed'};if(!info.ready)return {ok:false,reason:'materials'};if(id==='flame'&&!this.ignition)return {ok:false,reason:'ignition'};if(info.replace&&!confirm)return {ok:false,reason:'replace'};
 for(const [key,n]of Object.entries(info.recipe.cost)){const staged=Math.min(n,this.furnace[key]);this.furnace[key]-=staged;this.inventory[key]-=n-staged}
 this.gun={type:id,level:this.gun.type===id?this.gun.level+1:1};for(const [key,n]of Object.entries(info.recipe.products))this.products[key]+=n;
 if(!this.discoveries.includes(id))this.discoveries.push(id);this.history.push({id,level:this.gun.level});this.returnAll();return {ok:true,gun:this.gun,equation:info.recipe.equation}
 }
}
export class Run{
 constructor(random=Math.random){this.random=random;this.dropMode='standard';this.startingGun='water';this.reset()}
 reset(){Object.assign(this,{lab:new Lab(),condenser:new Condenser(),abilities:{...BASE_ABILITIES},state:'menu',wave:1,waveTime:0,elapsed:0,x:600,y:400,hp:100,kills:0,damageDone:0,burnDamage:0,burnHits:0,picked:0,xp:0,diamonds:0,level:1,upgradeChoices:[],upgradeReturn:'playing',bossSpawned:false,bossDefeated:false,hazards:[],weaponEffects:[],waterParticles:[],waterImpacts:[],waterEmissionCarry:0,waterStreamId:0,waterNextId:1,waterEmitting:false,waterMuzzle:null,waterLastAngle:0,enemies:[],bullets:[],drops:[],particles:[],texts:[],events:[],supply:emptyStock(),spawn:0,spawnCount:0,shot:0,inv:0,nextId:1,angle:0})}
 get needed(){return 8+(this.level-1)*5}
 get stats(){return gunStats(this.lab.gun,this.abilities)}
 setDropMode(mode){if(this.state!=='menu'||!Object.hasOwn(DROP_RATES,mode))return false;this.dropMode=mode;return true}
 selectStartingGun(gun){if(this.state!=='menu'||!Object.hasOwn(RECIPES,gun))return false;this.startingGun=gun;return true}
 start(gun=this.startingGun){if(gun!=='normal'&&!Object.hasOwn(RECIPES,gun))return false;this.reset();this.lab.gun={type:gun,level:gun==='normal'?0:1};this.state='playing';return true}
 craft(id,confirm=false){return this.state==='lab'?this.lab.craft(id,confirm):{ok:false,reason:'phase'}}
 nextWave(){if(this.state!=='lab'||this.lab.gun.type==='normal')return false;this.lab.returnAll();this.wave=2;this.waveTime=0;this.spawn=0;this.shot=0;this.hp=Math.min(this.abilities.maxHp,this.hp+35);this.state='playing';return true}
 burst(x,y,color,count=8){for(let i=0;i<count;i++){let a=this.random()*Math.PI*2,s=25+this.random()*100;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color,life:.3+this.random()*.3})}}
 collect(drop){if(drop.kind==='diamond'){const value=drop.value||1;this.xp+=value;this.diamonds+=value;this.events.push('diamond');this.burst(drop.x,drop.y,'#efeec2',4);return}if(!MATERIALS[drop.material])return;this.lab.inventory[drop.material]=(this.lab.inventory[drop.material]||0)+1;this.picked++;this.events.push('pickup');this.burst(drop.x,drop.y,MATERIALS[drop.material].color,5)}
 checkUpgrade(){if(!['playing','lab'].includes(this.state)||this.xp<this.needed)return;this.upgradeReturn=this.state;let pool=Object.keys(ABILITIES).filter(id=>{const d=ABILITIES[id];return !d.max||this.abilities[d.stat]<d.max-1e-8});for(let i=pool.length-1;i>0;i--){let j=Math.floor(this.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}this.upgradeChoices=pool.slice(0,3);this.state='upgrade';this.events.push('level')}
 chooseAbility(id){if(this.state!=='upgrade'||!this.upgradeChoices.includes(id)||!ABILITIES[id])return false;const d=ABILITIES[id];this.abilities[d.stat]=Math.min(d.max??Infinity,this.abilities[d.stat]+d.step);if(id==='health')this.hp=Math.min(this.abilities.maxHp,this.hp+d.step);this.xp-=this.needed;this.level++;this.upgradeChoices=[];this.state=this.upgradeReturn;this.checkUpgrade();return true}
 spawnEnemy(type,x,y,extra={}){const d=ENEMY_TYPES[type];if(!d||this.enemies.filter(e=>e.hp>0).length>=100&&type!==4)return null;const e={id:this.nextId++,x,y,type,hp:d.hp,maxHp:d.hp,r:d.r,speed:d.speed+(this.wave-1)*10,burn:0,burnDps:0,flash:0,age:0,summon:4,phase:1,skillTimer:2.5,skillIndex:0,...extra};const scale=waveScaling(this.wave);e.hp=Math.round((extra.hp??d.hp)*scale.health);e.maxHp=Math.round((extra.maxHp??d.hp)*scale.health);e.damage=Number(((extra.damage??d.damage)*scale.damage).toFixed(1));this.enemies.push(e);if(type===4){this.bossSpawned=true;this.events.push('boss')}return e}
 hurt(damage){if(this.inv>0)return;this.hp=Math.max(0,this.hp-damage*(1-this.abilities.defense));this.inv=.8;this.events.push('hurt');this.burst(this.x,this.y,'#ed878a',12)}
 hit(enemy,damage,burn=false){if(enemy.hp<=0)return;if(!burn&&enemy.corrosionTime>0)damage*=1+(enemy.corrosionStacks||0)*(enemy.corrosionStrength||0);let dealt=Math.min(enemy.hp,damage);enemy.hp-=damage;if(!burn)enemy.flash=.08;this.damageDone+=dealt;if(burn){this.burnDamage+=dealt;enemy.burnTextDamage=(enemy.burnTextDamage||0)+dealt;if(enemy.burnTextDamage>=3||enemy.hp<=0)this.flushBurnText(enemy)}else this.texts.push({x:enemy.x,y:enemy.y-22,value:Math.round(damage),color:'#f4e8c4',life:.55});if(enemy.hp>0)return;this.kills++;
 const d=ENEMY_TYPES[enemy.type]||ENEMY_TYPES[0],value=enemy.child?1:d.diamonds;this.drops.push({kind:'diamond',value,x:enemy.x-9,y:enemy.y});
 if(this.random()<DROP_RATES[this.dropMode]){const ids=Object.keys(MATERIALS),material=ids[Math.floor(this.random()*ids.length)];this.drops.push({kind:'substance',x:enemy.x+10,y:enemy.y,material})}
 if(enemy.type===3&&!enemy.child){for(const dx of [-20,20])this.spawnEnemy(3,enemy.x+dx,enemy.y,{child:true,hp:16,maxHp:16,r:12,speed:85})}
 if(enemy.type===4)this.bossDefeated=true;this.burst(enemy.x,enemy.y,enemy.type===1?'#d69fa9':'#c6dd90',12);this.events.push('kill')}
 flushBurnText(enemy){const total=enemy.burnTextDamage||0;if(total<=0)return;const value=total>=1?Math.round(total):Number(total.toFixed(1))||'<1';this.texts.push({kind:'burn',x:enemy.x,y:enemy.y-enemy.r-20,value:`灼烧 -${value}`,color:'#ffd698',life:.85});enemy.burnTextDamage=0}
 castBossSkill(boss){
  const index=boss.skillIndex||0,phase=boss.phase||1;boss.skillIndex=index+1;
  if(index%2===0){const gapAngle=Math.atan2(this.y-boss.y,this.x-boss.x)+Math.PI/2;for(let i=0;i<(phase===3?2:1);i++){const warning=DIFFICULTY.ringWarning+i*.8,speed=150+phase*10;this.hazards.push({type:'ring',sourceId:boss.id,x:boss.x,y:boss.y,elapsed:0,warning,life:warning+520/speed,radius:0,width:12,speed,maxRadius:520,gapAngle,gapHalfAngle:DIFFICULTY.ringGapHalfAngle,damage:boss.damage*1.1,hit:false})}this.events.push('bossRing')}
  else{const offsets=phase===1?[0]:phase===2?[-70,70]:[-100,0,100];for(const offset of offsets){this.hazards.push({type:'zone',sourceId:boss.id,x:Math.max(90,Math.min(1110,this.x+offset)),y:Math.max(90,Math.min(710,this.y)),elapsed:0,warning:DIFFICULTY.zoneWarning,life:DIFFICULTY.zoneWarning+.8,radius:65,damage:boss.damage*1.3,hit:false})}this.events.push('bossZone')}
  this.hazards=this.hazards.slice(-24);
 }
 updateHazards(dt){
  this.hazards=this.hazards.filter(h=>this.enemies.some(e=>e.id===h.sourceId&&e.hp>0));
  for(const h of this.hazards){const before=h.elapsed;h.elapsed+=dt;if(h.elapsed<h.warning||before>=h.life||h.hit)continue;const distance=Math.hypot(this.x-h.x,this.y-h.y);let intersects=false;
   if(h.type==='zone')intersects=distance<h.radius+18;
   else{const oldRadius=Math.max(0,(before-h.warning)*h.speed),radius=Math.min(h.maxRadius,Math.max(0,(h.elapsed-h.warning)*h.speed));h.radius=radius;const angle=Math.atan2(this.y-h.y,this.x-h.x),difference=Math.abs(Math.atan2(Math.sin(angle-h.gapAngle),Math.cos(angle-h.gapAngle)));intersects=distance>=oldRadius-h.width/2-18&&distance<=radius+h.width/2+18&&difference>h.gapHalfAngle}
   if(intersects){this.hurt(h.damage);h.hit=true}
  }
  this.hazards=this.hazards.filter(h=>h.elapsed<h.life);
 }
 updateWaterFlow(dt,previous,stats,hasTarget,bounds){
  for(const impact of this.waterImpacts)impact.life-=dt;this.waterImpacts=this.waterImpacts.filter(p=>p.life>0);
  const advance=(p,time)=>{const x=p.x,y=p.y,step=Math.min(600*time,p.maxDistance-p.travelled);p.x+=p.vx/600*step;p.y+=p.vy/600*step;p.travelled+=step;p.age+=time;
   for(const enemy of this.enemies){if(enemy.hp<=0||!visibleInCombat(enemy,bounds))continue;const dx=p.x-x,dy=p.y-y,t=Math.max(0,Math.min(1,((enemy.x-x)*dx+(enemy.y-y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(enemy.x-(x+dx*t),enemy.y-(y+dy*t))<enemy.r+4){this.waterImpacts.push({x:x+dx*t,y:y+dy*t,life:.16});return false}}
   return p.travelled<p.maxDistance&&p.x>=bounds.left&&p.x<=bounds.right&&p.y>=bounds.top&&p.y<=bounds.bottom;
  };
  this.waterParticles=this.waterParticles.filter(p=>advance(p,dt));
  const emit=this.lab.gun.type==='water'&&hasTarget;
  if(!emit){this.waterEmitting=false;this.waterEmissionCarry=0;this.waterMuzzle=null;this.waterImpacts=this.waterImpacts.slice(-12);return}
  const turn=Math.abs(Math.atan2(Math.sin(this.angle-this.waterLastAngle),Math.cos(this.angle-this.waterLastAngle)));
  if(!this.waterEmitting||turn>.65){this.waterStreamId++;this.waterEmissionCarry=0}this.waterEmitting=true;this.waterLastAngle=this.angle;
  const vx=Math.cos(this.angle)*600,vy=Math.sin(this.angle)*600;this.waterMuzzle={x:this.x+vx/600*22,y:this.y+vy/600*22,streamId:this.waterStreamId};this.waterEmissionCarry+=dt;
  while(this.waterEmissionCarry>=1/60){this.waterEmissionCarry-=1/60;const age=this.waterEmissionCarry,t=dt?1-age/dt:1;const p={id:this.waterNextId++,streamId:this.waterStreamId,x:previous.x+(this.x-previous.x)*t+vx/600*22,y:previous.y+(this.y-previous.y)*t+vy/600*22,vx,vy,age:0,travelled:0,maxDistance:stats.range-22};if(advance(p,age))this.waterParticles.push(p)}
  this.waterParticles=this.waterParticles.slice(-100);this.waterImpacts=this.waterImpacts.slice(-12);
 }
 endWave(){this.condenser.particles=[];this.condenser.impacts=[];this.condenser.muzzle=null;for(const d of this.drops)this.collect(d);this.drops=[];this.enemies=[];this.hazards=[];this.weaponEffects=[];this.waterParticles=[];this.waterImpacts=[];this.waterEmitting=false;this.waterMuzzle=null;this.bullets=[];this.particles=[];this.texts=[];if(this.wave===2){this.state='won';return}const minimum=this.dropMode==='high'?{water:6,hydrogen:6,oxygen:3,acid:3,carbon_dioxide:3,salt:3,iron:6}:{water:1,hydrogen:2,oxygen:1};for(const [id,n]of Object.entries(RECIPES[this.lab.gun.type]?.cost||{}))minimum[id]=Math.max(minimum[id]||0,n);for(const id of Object.keys(minimum)){this.supply[id]=Math.max(0,minimum[id]-this.lab.inventory[id]);this.lab.inventory[id]+=this.supply[id]}this.state='lab';this.checkUpgrade()}
 step(dt,input={}){
  if(this.state!=='playing')return;dt=Math.min(.1,Math.max(0,dt));this.events=[];if(this.hp<=0){this.state='dead';return}
  this.elapsed+=dt;this.waveTime=Math.min(60,this.waveTime+dt);if(this.waveTime>=60-1e-8&&(this.wave===1||this.bossDefeated)){this.endWave();return}
  this.hp=Math.min(this.abilities.maxHp,this.hp+this.abilities.regen*dt);for(const effect of this.weaponEffects)effect.life-=dt;this.weaponEffects=this.weaponEffects.filter(e=>e.life>0);
  const previousPlayer={x:this.x,y:this.y};
  let ix=input.x||0,iy=input.y||0,n=Math.hypot(ix,iy);if(n>1){ix/=n;iy/=n}this.x=Math.max(28,Math.min(1172,this.x+ix*this.abilities.speed*dt));this.y=Math.max(28,Math.min(772,this.y+iy*this.abilities.speed*dt));
  const viewport=input.viewport||{width:1200,height:800},bounds=combatBounds(viewport.width,viewport.height,this.x,this.y);
  this.inv=Math.max(0,this.inv-dt);this.spawn-=dt;this.shot-=dt;
  if(this.wave===2&&this.waveTime>=25&&!this.bossSpawned)this.spawnEnemy(4,600,100);
  if(this.spawn<=0&&this.waveTime<60&&this.enemies.length<95){let a=this.random()*Math.PI*2,type=this.spawnCount<4?this.spawnCount:Math.floor(this.random()*4);this.spawnCount++;this.spawnEnemy(type,600+Math.cos(a)*740,400+Math.sin(a)*550);this.spawn=Math.max(.35,(this.wave===1?1.05:.8)-this.waveTime*.002)}
  const stats=this.stats,targets=this.enemies.filter(e=>e.hp>0&&visibleInCombat(e,bounds)&&Math.hypot(e.x-this.x,e.y-this.y)<=stats.range);
  if(this.shot<=0&&targets.length){
   const target=targets.reduce((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)<Math.hypot(b.x-this.x,b.y-this.y)?a:b);this.angle=Math.atan2(target.y-this.y,target.x-this.x);const type=this.lab.gun.type;
   if(type==='flame'||type==='gas'){
    const duration=type==='gas'?.32:Math.min(.45,Math.max(.2,stats.interval*1.1));this.weaponEffects.push({type,visual:'cone',x:this.x,y:this.y,originX:this.x,originY:this.y,angle:this.angle,length:stats.range,halfAngle:stats.halfAngle,life:duration,duration,born:this.elapsed});this.weaponEffects=this.weaponEffects.slice(-32);
    for(const e of [...targets]){const angle=Math.atan2(e.y-this.y,e.x-this.x),diff=Math.abs(Math.atan2(Math.sin(angle-this.angle),Math.cos(angle-this.angle)));if(diff>stats.halfAngle)continue;const critical=stats.crit>0&&this.random()<stats.crit;this.hit(e,stats.damage*(critical?2:1));if(e.hp>0&&type==='flame'){e.burn=stats.burnTime;e.burnDps=stats.burnDps;this.burnHits++}if(e.hp>0&&type==='gas'){const d=Math.hypot(e.x-this.x,e.y-this.y)||1,push=stats.knockback*(e.type===4?.2:1);e.x=Math.max(ARENA_BOUNDS.left+e.r,Math.min(ARENA_BOUNDS.right-e.r,e.x+(e.x-this.x)/d*push));e.y=Math.max(ARENA_BOUNDS.top+e.r,Math.min(ARENA_BOUNDS.bottom-e.r,e.y+(e.y-this.y)/d*push))}this.burst(e.x,e.y,type==='gas'?'#d4eef1':'#bed9ff',5)}
   }else if(type==='electric'){
    const pool=this.enemies.filter(e=>e.hp>0&&visibleInCombat(e,bounds)),used=new Set(),nodes=[{x:this.x,y:this.y}];let next=target;
    for(let jump=0;jump<stats.chainCount&&next;jump++){used.add(next.id);nodes.push({x:next.x,y:next.y});const critical=stats.crit>0&&this.random()<stats.crit;this.hit(next,stats.damage*.8**jump*(critical?2:1));const previous=next;next=pool.filter(e=>e.hp>0&&!used.has(e.id)&&Math.hypot(e.x-previous.x,e.y-previous.y)<=stats.chainRange).sort((a,b)=>Math.hypot(a.x-previous.x,a.y-previous.y)-Math.hypot(b.x-previous.x,b.y-previous.y))[0]}
    this.weaponEffects.push({type:'electric',nodes,life:.18,duration:.18,born:this.elapsed});this.weaponEffects=this.weaponEffects.slice(-32);
   }else{const x=this.x+Math.cos(this.angle)*22,y=this.y+Math.sin(this.angle)*22;this.bullets.push({x,y,originX:x,originY:y,vx:Math.cos(this.angle)*stats.projectileSpeed,vy:Math.sin(this.angle)*stats.projectileSpeed,life:stats.range/stats.projectileSpeed+.15,remaining:stats.range-22,type,stats,piercesRemaining:stats.pierce,hitIds:[]})}
   this.shot=stats.interval;this.events.push('shot');
  }
  for(const e of [...this.enemies]){if(e.hp<=0)continue;const def=ENEMY_TYPES[e.type]||ENEMY_TYPES[0];e.age=(e.age||0)+dt;let dx=this.x-e.x,dy=this.y-e.y,d=Math.hypot(dx,dy)||1;const dash=e.type===1&&e.age%3<.5?1.9:1;e.dashing=dash>1;e.x+=dx/d*e.speed*dt*dash;e.y+=dy/d*e.speed*dt*dash;e.flash=Math.max(0,(e.flash||0)-dt);if(e.corrosionTime>0){e.corrosionTime=Math.max(0,e.corrosionTime-dt);if(e.corrosionTime===0){e.corrosionStacks=0;e.corrosionStrength=0}}
   if(e.type===4){const phase=e.hp/e.maxHp>.65?1:e.hp/e.maxHp>.3?2:3;if(phase!==e.phase){e.phase=phase;e.summon=0;e.skillTimer=Math.min(e.skillTimer,.9);if(phase===3)this.events.push('overdrive')}e.summon-=dt;if(e.summon<=0){const type=e.phase===1?0:e.phase===2?1:3;for(const offset of [-50,50])this.spawnEnemy(type,e.x+offset,e.y+40);e.summon=6-e.phase}e.skillTimer-=dt;if(e.skillTimer<=0){this.castBossSkill(e);e.skillTimer=8-e.phase*1.2}}
   if(e.burn>0){this.hit(e,e.burnDps*Math.min(dt,e.burn),true);e.burn=Math.max(0,e.burn-dt);if(e.burn===0)this.flushBurnText(e)}
   const range=e.type===0?90:e.r+18;if(e.hp>0&&visibleInCombat(e,bounds)&&d<range)this.hurt(e.damage??def.damage);
  }
  for(const bullet of this.bullets){
   const ox=bullet.x,oy=bullet.y,speed=Math.hypot(bullet.vx,bullet.vy),travel=Math.min(speed*dt,bullet.remaining??Infinity),fraction=travel/(speed*dt||1);bullet.x+=bullet.vx*dt*fraction;bullet.y+=bullet.vy*dt*fraction;if(bullet.remaining!==undefined)bullet.remaining-=travel;bullet.life-=dt;bullet.hitIds??=[];bullet.piercesRemaining??=1;
   const dx=bullet.x-ox,dy=bullet.y-oy,candidates=this.enemies.filter(e=>e.hp>0&&visibleInCombat(e,bounds)&&!bullet.hitIds.includes(e.id)).map(e=>{const t=Math.max(0,Math.min(1,((e.x-ox)*dx+(e.y-oy)*dy)/(dx*dx+dy*dy||1)));return {enemy:e,t,distance:Math.hypot(e.x-(ox+t*dx),e.y-(oy+t*dy))}}).filter(h=>h.distance<h.enemy.r+6).sort((a,b)=>a.t-b.t);
   for(const hit of candidates){if(bullet.life<=0)break;const e=hit.enemy,critical=bullet.stats.crit>0&&this.random()<bullet.stats.crit;bullet.hitIds.push(e.id);this.hit(e,bullet.stats.damage*(critical?2:1));
    if(e.hp>0&&bullet.type==='acid'){e.corrosionStacks=Math.min(3,(e.corrosionStacks||0)+1);e.corrosionStrength=bullet.stats.corrosionStrength;e.corrosionTime=3}
    if(e.hp>0&&bullet.type==='flame'){e.burn=bullet.stats.burnTime;e.burnDps=bullet.stats.burnDps;this.burnHits++}
    if(bullet.type==='acid')this.weaponEffects.push({type:'acidSplash',x:e.x,y:e.y,radius:22,life:.22,duration:.22,born:this.elapsed});
    this.burst(e.x,e.y,bullet.type==='water'?'#77d9f5':bullet.type==='acid'?'#a6e66f':bullet.type==='iron'?'#e5edff':'#e4d8a6',6);bullet.piercesRemaining--;if(bullet.piercesRemaining<=0){bullet.life=0;break}
   }
   if(bullet.remaining<=0)bullet.life=0;
  }
  this.enemies=this.enemies.filter(e=>e.hp>0);this.bullets=this.bullets.filter(b=>b.life>0&&b.x>=bounds.left&&b.x<=bounds.right&&b.y>=bounds.top&&b.y<=bounds.bottom);
  this.updateWaterFlow(dt,previousPlayer,stats,targets.some(e=>e.hp>0),bounds);
  this.condenser.step(dt,this,bounds);
  this.enemies=this.enemies.filter(e=>e.hp>0);
  this.weaponEffects=this.weaponEffects.slice(-32);
  this.updateHazards(dt);
  this.drops=this.drops.filter(drop=>{let dx=this.x-drop.x,dy=this.y-drop.y,n=Math.hypot(dx,dy);if(n<this.abilities.magnet){let s=Math.min(n,460*dt);drop.x+=dx/(n||1)*s;drop.y+=dy/(n||1)*s}if(n<24){this.collect(drop);return false}return true});
  for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0).slice(-350);for(const t of this.texts){t.y-=27*dt;t.life-=dt}this.texts=this.texts.filter(t=>t.life>0).slice(-90);if(this.hp<=0)this.state='dead';else this.checkUpgrade();
 }
}

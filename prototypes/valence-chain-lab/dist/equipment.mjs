import {visibleInCombat,ARENA_BOUNDS} from './view.mjs';
export const ACCESSORIES=Object.freeze({
 condenser:{name:'冷凝水包',gun:'flame',description:'收集燃烧产水，满后侧后方喷水，边喷边补。',science:'氢氧燃烧生成水；冷凝与喷水由机械结构完成。'},
 heat:{name:'余热护环',gun:'flame',description:'喷火积热，在脚下留下持续燃烧5秒的驻场火环。',science:'利用燃烧放出的热量，护环为游戏机械结构。'},
 conductive:{name:'电源模块',gun:'water',description:'水流命中后触发闪电链，最多跳跃3个目标。',science:'电能来自电源，含离子的水作导电介质。'},
 freeze:{name:'制冷模块',gun:'water',description:'积蓄后射出冰弹，飞行命中才造成伤害并减速。',science:'制冷结构使部分水凝固，冻结效果为游戏化处理。'},
 foam:{name:'泡沫反应包',gun:'acid',description:'酸液反应积气，投出持续减速泡沫区。',science:'酸与碳酸氢钠反应产CO₂，额外介质稳定泡沫。'},
 hydrogen:{name:'铁粒反应包',gun:'acid',description:'分流酸液制氢，蓄满后追加短促燃烧。',science:'Fe + 2HCl → FeCl₂ + H₂；配件自带供氧与点火结构。'},
 pressure:{name:'集气包',gun:'gas',description:'积存主枪气体，周期性环形击退。',science:'推力来自机械加压，不是CO₂的化学反应。'},
 expansion:{name:'制冷膨胀模块',gun:'gas',description:'主喷流周期性扩散冷雾，减速一片敌人。',science:'加压气体膨胀降温，减速是游戏效果。'},
 capacitor:{name:'电容模块',gun:'electric',description:'积存主枪电能，周期性强化连锁放电。',science:'电容储存电能，能量来自枪械电源。'},
 magnetic:{name:'电磁护环',gun:'electric',description:'充电后展开护环，偏转附近金属弹。',science:'只作用于金属弹体，不影响酸液、气浪或地面攻击。'},
 rail:{name:'磁轨模块',gun:'iron',description:'电磁加速主枪铁弹，提升弹速和贯穿。',science:'机械供电磁轨加速铁弹，不发生化学反应。'},
 shards:{name:'碎片回收盒',gun:'iron',description:'回收攻击过程的铁屑，蓄满后释放近身碎片。',science:'机械收集与再发射，铁屑产量是游戏抽象。'}
});
export const MUZZLES=Object.freeze({focus:{name:'聚束枪口',description:'射程+35%，直接伤害+10%。'},spread:{name:'扩散枪口',description:'扩大攻击覆盖；电弧跳距+40%，目标数+1。'},rapid:{name:'连发枪口',description:'攻击间隔缩短25%，保持完整单发伤害。'},fork:{name:'分叉枪口',description:'双方向发射，每路完整伤害。'}});
export function equipmentStats(base,gun,slots,muzzle){const s={...base};if(muzzle==='focus'){s.range*=1.35;s.damage*=1.1}if(muzzle==='spread'){s.halfAngle*=1.5;s.radius=13;s.chainRange*=1.4;s.chainCount+=1}if(muzzle==='rapid')s.interval*=.75;if(slots.includes('rail')&&gun==='iron'){s.projectileSpeed*=1.35;s.pierce+=1}return s}
export function offerAccessories(gun,slots,random){const available=Object.keys(ACCESSORIES).filter(k=>!slots.includes(k));const own=available.filter(k=>ACCESSORIES[k].gun===gun),other=available.filter(k=>ACCESSORIES[k].gun!==gun);for(let i=other.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[other[i],other[j]]=[other[j],other[i]]}return [...own,...other].slice(0,3)}
export function updateAccessories(r,dt,bounds){
 const slots=r.attachments,gun=r.lab.gun.type;const active=id=>slots.includes(id)&&ACCESSORIES[id].gun===gun;const firing=r.events.includes('shot')||r.weaponEffects.some(e=>e.type===gun&&e.life>0);r.condenser.equipped=active('condenser');r.condenser.step(dt,r,bounds);
 for(const z of r.accessoryZones){z.life-=dt;if(z.kind==='heat')for(const e of r.enemies){if(e.hp>0&&visibleInCombat(e,bounds)&&Math.abs(Math.hypot(e.x-z.x,e.y-z.y)-z.radius)<e.r+24)r.hit(e,16*dt,true)}if(z.kind==='foam')for(const e of r.enemies)if(Math.hypot(e.x-z.x,e.y-z.y)<z.radius+e.r){e.slow=1.5;e.slowFactor=.45}}
 r.accessoryZones=r.accessoryZones.filter(z=>z.life>0);r.accessoryFx=r.accessoryFx.filter(z=>(z.life-=dt)>0);r.magneticTime=Math.max(0,r.magneticTime-dt);
 for(const id of slots){if(id==='conductive'){if(active(id))r.accessoryCharge[id]=Math.max(0,Math.min(1,1-((r.waterChainReady||0)-r.elapsed)/.9));continue}if(!active(id)||id==='condenser'||id==='rail')continue;let energy=firing?dt:0;if(['conductive','freeze','foam','hydrogen','capacitor','magnetic','shards'].includes(id))energy=r.events.includes('shot')?Math.max(.2,r.stats.interval):0;r.accessoryCharge[id]=(r.accessoryCharge[id]||0)+energy/5;if(r.accessoryCharge[id]<1)continue;r.accessoryCharge[id]=0;
 const targets=r.enemies.filter(e=>e.hp>0&&visibleInCombat(e,bounds)).sort((a,b)=>Math.hypot(a.x-r.x,a.y-r.y)-Math.hypot(b.x-r.x,b.y-r.y)),target=targets[0];
 if(id==='magnetic'){r.magneticTime=3;r.accessoryFx.push({kind:'magnetic',x:r.x,y:r.y,radius:105,life:3});continue}
 if(id==='heat'){r.accessoryZones.push({kind:'heat',x:r.x,y:r.y,radius:120,life:5});continue}
 if(id==='foam'){if(target)r.accessoryZones.push({kind:'foam',x:target.x,y:target.y,radius:85,life:4});continue}
 const angle=target?Math.atan2(target.y-r.y,target.x-r.x):r.angle;
 if(id==='freeze'){r.accessoryProjectiles.push({kind:'ice',x:r.x+Math.cos(angle)*24,y:r.y+Math.sin(angle)*24,vx:Math.cos(angle)*560,vy:Math.sin(angle)*560,life:.85,damage:24,radius:7});continue}
 if(id==='shards'){for(let i=0;i<12;i++){const a=r.angle+i*Math.PI/6;r.accessoryProjectiles.push({kind:'shard',x:r.x+Math.cos(a)*20,y:r.y+Math.sin(a)*20,vx:Math.cos(a)*340,vy:Math.sin(a)*340,life:.6,damage:8,radius:3})}continue}
 if(id==='hydrogen'||id==='expansion'){const length=id==='hydrogen'?220:240,halfAngle=id==='hydrogen'?.5:.65;if(id==='hydrogen')r.weaponEffects.push({type:'flame',source:'hydrogen',visual:'cone',x:r.x,y:r.y,originX:r.x,originY:r.y,angle,length,halfAngle,life:.5,duration:.5});else r.accessoryFx.push({kind:'coldCone',x:r.x,y:r.y,angle,length,halfAngle,life:.7,duration:.7});for(const e of targets){const a=Math.atan2(e.y-r.y,e.x-r.x),diff=Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)));if(Math.hypot(e.x-r.x,e.y-r.y)>length||diff>halfAngle)continue;if(id==='hydrogen'){e.burn=2.5;e.burnDps=12}else{e.slow=3;e.slowFactor=.45}r.hit(e,id==='hydrogen'?24:12)}continue}
 if(id==='capacitor'){let current=targets.find(e=>Math.hypot(e.x-r.x,e.y-r.y)<=r.stats.range);if(!current){r.accessoryCharge[id]=1;continue}const nodes=[{x:r.x,y:r.y}],used=new Set();for(let jump=0;jump<5&&current;jump++){used.add(current.id);nodes.push({x:current.x,y:current.y});r.hit(current,35*.8**jump);const previous=current;current=targets.filter(e=>e.hp>0&&!used.has(e.id)&&Math.hypot(e.x-previous.x,e.y-previous.y)<=160).sort((a,b)=>Math.hypot(a.x-previous.x,a.y-previous.y)-Math.hypot(b.x-previous.x,b.y-previous.y))[0]}r.weaponEffects.push({type:'electric',source:'capacitor',nodes,life:.45,duration:.45});continue}
 if(id==='pressure'){r.accessoryFx.push({kind:'pressure',x:r.x,y:r.y,radius:130,life:.5,duration:.5});for(const e of targets){const d=Math.hypot(e.x-r.x,e.y-r.y);if(d>130)continue;const a=Math.atan2(e.y-r.y,e.x-r.x),k=e.type===4||e.type===6?.2:1;e.x=Math.max(ARENA_BOUNDS.left+e.r,Math.min(ARENA_BOUNDS.right-e.r,e.x+Math.cos(a)*100*k));e.y=Math.max(ARENA_BOUNDS.top+e.r,Math.min(ARENA_BOUNDS.bottom-e.r,e.y+Math.sin(a)*100*k));r.hit(e,12)}}

 }
 updateAccessoryProjectiles(r,dt,bounds);
 r.accessoryZones=r.accessoryZones.slice(-8);r.accessoryFx=r.accessoryFx.slice(-16);
}

export function triggerWaterChain(r,first,bounds){
 if(r.legacy||r.lab.gun.type!=='water'||!r.attachments.includes('conductive')||r.elapsed<(r.waterChainReady||0))return false;
 r.waterChainReady=r.elapsed+.9;const used=new Set([first.id]),nodes=[{x:first.x-8,y:first.y-14},{x:first.x,y:first.y}];if(first.hp>0)r.hit(first,10);let previous=first;
 for(let i=1;i<3;i++){const next=r.enemies.filter(e=>e.hp>0&&!used.has(e.id)&&visibleInCombat(e,bounds)&&Math.hypot(e.x-previous.x,e.y-previous.y)<=145).sort((a,b)=>Math.hypot(a.x-previous.x,a.y-previous.y)-Math.hypot(b.x-previous.x,b.y-previous.y))[0];if(!next)break;used.add(next.id);nodes.push({x:next.x,y:next.y});r.hit(next,10*.8**i);previous=next}
 r.weaponEffects.push({type:'electric',source:'conductive',nodes,life:.42,duration:.42});r.accessoryCharge.conductive=0;return true;
}

function updateAccessoryProjectiles(r,dt,bounds){for(const p of r.accessoryProjectiles){const ox=p.x,oy=p.y,travelTime=Math.min(dt,p.life);p.x+=p.vx*travelTime;p.y+=p.vy*travelTime;p.life-=dt;const dx=p.x-ox,dy=p.y-oy;const hits=r.enemies.filter(e=>e.hp>0&&visibleInCombat(e,bounds)).map(e=>{const t=Math.max(0,Math.min(1,((e.x-ox)*dx+(e.y-oy)*dy)/(dx*dx+dy*dy||1)));return {e,t,d:Math.hypot(e.x-ox-t*dx,e.y-oy-t*dy)}}).filter(h=>h.d<h.e.r+p.radius).sort((a,b)=>a.t-b.t);const hit=hits[0];if(hit){r.hit(hit.e,p.damage);if(p.kind==='ice'&&hit.e.hp>0){hit.e.slow=3;hit.e.slowFactor=.45}r.burst(ox+dx*hit.t,oy+dy*hit.t,p.kind==='ice'?'#c0eeff':'#e3e8dc',p.kind==='ice'?9:4);p.life=0}}r.accessoryProjectiles=r.accessoryProjectiles.filter(p=>p.life>0&&p.x>=bounds.left&&p.x<=bounds.right&&p.y>=bounds.top&&p.y<=bounds.bottom).slice(-100)}

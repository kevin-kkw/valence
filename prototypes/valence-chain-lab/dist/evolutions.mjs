import {RECIPES} from './catalog.mjs';
export const EVOLUTIONS={
 water:[['高压水刀','更粗的高压水流，贯穿更多目标'],['脉冲水炮','周期性发射粗大贯穿水波并推开敌人']],
 flame:[['烈焰喷射器','宽幅喷焰，在命中处留下燃烧地面'],['熔火龙息','每四次喷射追加长距离龙息与燃烧路径']],
 acid:[['腐蚀榴弹枪','酸弹扩大溅射，腐蚀成片敌人'],['酸蚀蜂群','爆开后分出寻敌酸滴，优先寻找未腐蚀目标']],
 gas:[['压缩气炮','每三次喷射追加直线强压气团'],['风暴发生器','气团变为移动旋涡，聚怪后爆散']],
 electric:[['雷链枪','主电链命中点分出额外支链'],['雷暴网络','命中目标短暂成为节点，周期性追加放电']],
 iron:[['穿甲轨道枪','贯穿命中后向两侧飞出铁屑'],['裂星轨道炮','每四次射击发出巨型贯穿弹，沿途连续释放侧向铁屑']]
};
export function weaponName(gun){return gun.type==='normal'?'普通枪':gun.rank>=10?EVOLUTIONS[gun.type][1][0]:gun.rank>=5?EVOLUTIONS[gun.type][0][0]:RECIPES[gun.type].name}
export function evolutionDescription(gun){return gun.rank>=10?EVOLUTIONS[gun.type]?.[1][1]:gun.rank>=5?EVOLUTIONS[gun.type]?.[0][1]:'同名枪进阶：每阶伤害+8%；+5 / +10改变形态'}
export function evolutionStats(base,gun){const rank=Math.max(0,Math.min(10,gun.rank||0));if(!rank)return base;const s={...base,damage:base.damage*(1+.08*rank),burnDps:base.burnDps*(1+.08*rank),rank};if(rank>=5){if(gun.type==='water'){s.pierce+=3;s.radius=9;s.waterWidth=1.5}if(gun.type==='flame')s.halfAngle+=.16;if(gun.type==='acid')s.splashRadius=110;if(gun.type==='iron')s.pierce+=2}return s}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const live=(r,b)=>r.enemies.filter(e=>e.hp>0&&e.x>=b.left&&e.x<=b.right&&e.y>=b.top&&e.y<=b.bottom);
function projectile(r,type,stats,angle,extra={}){const x=r.x+Math.cos(angle)*24,y=r.y+Math.sin(angle)*24;r.bullets.push({type,x,y,originX:x,originY:y,vx:Math.cos(angle)*stats.projectileSpeed,vy:Math.sin(angle)*stats.projectileSpeed,remaining:stats.range,life:stats.range/stats.projectileSpeed+.2,stats:{...stats},piercesRemaining:stats.pierce,hitIds:[],weaponSlot:r.selectedWeapon,...extra})}
function sector(r,angle,length,halfAngle,damage,bounds,burn=false){for(const e of live(r,bounds)){const a=Math.atan2(e.y-r.y,e.x-r.x);if(distance(e,r)>length||Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)))>halfAngle)continue;r.hit(e,damage);if(burn&&e.hp>0){e.burn=2.5;e.burnDps=Math.max(e.burnDps||0,r.stats.burnDps)}}}
export function afterEvolutionShot(r,bounds){const gun=r.lab.gun,rank=gun.rank||0;if(rank<5||!r.events.includes('shot'))return;r.evolutionShots=(r.evolutionShots||0)+1;const s=r.stats,slot=r.selectedWeapon;
 if(gun.type==='water'&&rank>=10&&r.evolutionShots%4===0)projectile(r,'water',{...s,damage:s.damage*2,radius:20,pierce:12,projectileSpeed:450},r.angle,{evolution:'waterPulse'});
 if(gun.type==='flame'){
  const cone=r.weaponEffects.filter(e=>e.type==='flame'&&!e.source&&e.born===r.elapsed).at(-1);if(cone){const targets=live(r,bounds).filter(e=>distance(e,r)<=s.range&&Math.abs(Math.atan2(Math.sin(Math.atan2(e.y-r.y,e.x-r.x)-r.angle),Math.cos(Math.atan2(e.y-r.y,e.x-r.x)-r.angle)))<=s.halfAngle);for(const e of targets.slice(0,3))r.evolutionZones.push({kind:'fire',x:e.x,y:e.y,radius:30,life:2.5,damage:s.burnDps*.3,slot})}
  if(rank>=10&&r.evolutionShots%4===0){const length=s.range*1.8;sector(r,r.angle,length,s.halfAngle*.6,s.damage*1.8,bounds,true);r.weaponEffects.push({type:'flame',source:'dragon',x:r.x,y:r.y,originX:r.x,originY:r.y,angle:r.angle,length,halfAngle:s.halfAngle*.6,life:.65,duration:.65,weaponSlot:slot});for(let i=1;i<=5;i++)r.evolutionZones.push({kind:'fire',x:r.x+Math.cos(r.angle)*length*i/5,y:r.y+Math.sin(r.angle)*length*i/5,radius:35,life:3,damage:s.burnDps*.4,slot})}
 }
 if(gun.type==='gas'&&r.evolutionShots%3===0)r.evolutionZones.push({kind:rank>=10?'vortex':'gasOrb',x:r.x,y:r.y,vx:Math.cos(r.angle)*180,vy:Math.sin(r.angle)*180,radius:rank>=10?80:28,life:rank>=10?1.8:1.5,damage:s.damage*2,hitIds:[],slot});
 if(gun.type==='electric'){
  const effect=r.weaponEffects.filter(e=>e.type==='electric'&&!e.source&&e.born===r.elapsed).at(-1);if(effect){const used=new Set(effect.nodes.map(n=>n.x+':'+n.y));for(const node of effect.nodes.slice(1,4)){const e=live(r,bounds).find(e=>!used.has(e.x+':'+e.y)&&distance(e,node)<s.chainRange);if(e){used.add(e.x+':'+e.y);r.hit(e,s.damage*.5);r.weaponEffects.push({type:'electric',source:'branch',nodes:[node,{x:e.x,y:e.y}],life:.22,duration:.22,weaponSlot:slot})}}
   if(rank>=10)for(const node of effect.nodes.slice(1,4)){const e=live(r,bounds).find(e=>distance(e,node)<2);if(e&&!r.evolutionZones.some(z=>z.kind==='node'&&z.enemyId===e.id&&z.slot===slot))r.evolutionZones.push({kind:'node',enemyId:e.id,x:e.x,y:e.y,radius:8,life:2.2,tick:.6,damage:s.damage*.4,slot})}
  }
 }
 if(gun.type==='iron'&&rank>=10&&r.evolutionShots%4===0)projectile(r,'iron',{...s,damage:s.damage*2.5,radius:15,pierce:20},r.angle,{evolution:'giantRail',fragmentTimer:.12});
 r.evolutionZones=r.evolutionZones.slice(-60);
}
function shards(r,b,x,y){const angle=Math.atan2(b.vy,b.vx);for(const side of [-1,1]){const a=angle+side*Math.PI/2;r.bullets.push({type:'iron',x,y,originX:x,originY:y,vx:Math.cos(a)*450,vy:Math.sin(a)*450,life:.35,remaining:155,stats:{...b.stats,damage:b.stats.damage*.25,radius:3},piercesRemaining:1,hitIds:[],secondary:true,weaponSlot:b.weaponSlot,evolution:'railShard'})}}
export function evolutionHit(r,b,e,bounds){if(b.secondary)return;if(b.type==='iron'&&b.stats.rank>=5)shards(r,b,e.x,e.y);if(b.evolution==='waterPulse'&&e.hp>0){const k=e.type===4||e.type===6?.2:1;e.x=Math.max(22+e.r,Math.min(1178-e.r,e.x+b.vx/450*45*k));e.y=Math.max(22+e.r,Math.min(778-e.r,e.y+b.vy/450*45*k))}}
export function acidSwarm(r,b,e,bounds){if((b.stats.rank||0)<10||b.swarmed||b.secondary)return;b.swarmed=true;const targets=live(r,bounds).filter(t=>t.id!==e.id&&distance(t,e)<260).sort((a,b)=>(a.corrosionStacks||0)-(b.corrosionStacks||0)||distance(a,e)-distance(b,e));for(let i=0;i<Math.min(4,targets.length);i++){const t=targets[i],a=Math.atan2(t.y-e.y,t.x-e.x);r.bullets.push({type:'acid',x:e.x,y:e.y,originX:e.x,originY:e.y,vx:Math.cos(a)*360,vy:Math.sin(a)*360,life:1.2,remaining:420,stats:{...b.stats,damage:b.stats.damage*.35,radius:4},piercesRemaining:1,hitIds:[e.id],secondary:true,homingId:t.id,weaponSlot:b.weaponSlot,evolution:'acidSwarm'})}}
export function updateEvolutions(r,dt,bounds){
 for(const b of [...r.bullets]){if(b.homingId){const e=r.enemies.find(e=>e.id===b.homingId&&e.hp>0);if(e){const a=Math.atan2(e.y-b.y,e.x-b.x);b.vx=Math.cos(a)*360;b.vy=Math.sin(a)*360}}if(b.evolution==='giantRail'){b.fragmentTimer-=dt;if(b.fragmentTimer<=0){b.fragmentTimer=.12;shards(r,b,b.x,b.y)}}}
 for(const z of r.evolutionZones){z.life-=dt;if(z.kind==='fire'){for(const e of live(r,bounds))if(distance(e,z)<z.radius+e.r)r.hit(e,z.damage*dt,true)}
  if(z.kind==='node'){const host=r.enemies.find(e=>e.id===z.enemyId&&e.hp>0);if(!host){z.life=0;continue}z.x=host.x;z.y=host.y;z.tick-=dt;if(z.tick<=0){z.tick=.6;const targets=live(r,bounds).filter(e=>e.id!==host.id&&distance(e,z)<150).sort((a,b)=>distance(a,z)-distance(b,z)).slice(0,2);for(const e of targets){r.hit(e,z.damage);r.weaponEffects.push({type:'electric',source:'node',nodes:[{x:z.x,y:z.y},{x:e.x,y:e.y}],life:.2,duration:.2,weaponSlot:z.slot})}}}
  if(z.kind==='gasOrb'||z.kind==='vortex'){z.x+=z.vx*dt;z.y+=z.vy*dt;for(const e of live(r,bounds)){const d=distance(e,z),boss=e.type===4||e.type===6;if(z.kind==='vortex'&&d<z.radius+e.r&&d>8){const pull=Math.min(d,100*dt)*(boss?.15:1);e.x+=(z.x-e.x)/d*pull;e.y+=(z.y-e.y)/d*pull}if(z.kind==='gasOrb'&&d<e.r+z.radius&&!z.hitIds.includes(e.id)){z.hitIds.push(e.id);r.hit(e,z.damage);e.x=Math.max(22+e.r,Math.min(1178-e.r,e.x+z.vx/180*65*(boss?.2:1)));e.y=Math.max(22+e.r,Math.min(778-e.r,e.y+z.vy/180*65*(boss?.2:1)))}}
   if(z.life<=0&&z.kind==='vortex'){for(const e of live(r,bounds))if(distance(e,z)<z.radius+e.r)r.hit(e,z.damage*2);r.accessoryFx.push({kind:'pressure',x:z.x,y:z.y,radius:z.radius,life:.5,duration:.5})}
  }
 }
 r.evolutionZones=r.evolutionZones.filter(z=>z.life>0&&z.x>=bounds.left-100&&z.x<=bounds.right+100&&z.y>=bounds.top-100&&z.y<=bounds.bottom+100).slice(-60);r.bullets=r.bullets.slice(-300);
}

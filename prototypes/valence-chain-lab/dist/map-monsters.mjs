import {ENEMY_TYPES} from './catalog.mjs';
import {ARENA_BOUNDS,visibleInCombat} from './view.mjs';
const roles=[0,5,1,3,2,7,8,9];
const entries={
 industrial:[['leak-barrel','泄漏桶怪','缓慢追踪，预警泄漏区','#bfbd62','◉',32,44,18,4,2],['rivet-drone','铆钉巡检机','侧移瞄准，短促铆钉连射','#92b9cb','✣',44,38,17,11,4],['piston-runner','活塞冲压机','锁定方向冲刺，碰撞后恢复','#edac72','➤',30,78,15,9,2],['scrap-baler','废料压团','沉重追踪，死亡预警破裂','#b69e88','▣',62,43,24,9,3],['pressure-tank','高压储罐','蓄压后释放近身压力','#e6c67c','◎',100,31,25,14,5],['exhaust-stack','排放烟囱','缓慢移动，定向长距排放','#9ba1a6','▥',58,30,21,12,3],['arc-welder','电弧焊机','停步锁定窄幅电弧','#8bcde0','ϟ',65,36,20,13,4],['crawler-furnace','履带熔炉','履带推进，短程扇形火花','#ef9060','▰',86,40,26,14,4]],
 mine:[['shard-crawler','碎晶爬虫','交替折线前进','#b6c2ec','◇',32,55,17,4,2],['crystal-lancer','晶针投手','瞄准细长晶针，射后停顿','#b9a0ed','↑',46,30,18,12,4],['burrow-spike','潜地晶刺','标记落点后迁移并爆晶','#95bade','△',34,60,17,9,2],['geode-cluster','晶簇团','死亡预警后释放慢速碎晶','#c2a7d9','❖',58,45,24,8,3],['crystal-sentinel','晶壳守卫','硬壳减伤三成，暴露后追踪','#90ccd3','⬡',98,34,26,14,5],['resonance-prism','共振晶柱','缓慢移动，宽间隔共振环','#c7a2eb','♢',56,25,22,12,3],['prism-refractor','折射棱镜','交替锁定交叉窄射线','#a3e4ee','⋈',66,32,21,13,4],['lodestone','磁辉矿核','标记分离的延迟落晶区','#d6b2ed','✦',84,39,25,14,4]],
 ecology:[['gel-droplet','胶滴爬行体','弹性跃进的小型胶滴','#9bdca2','●',32,52,18,4,2],['seed-spitter','喷籽植株','后退瞄准并喷出慢速种籽','#c1da81','♧',46,35,18,11,4],['thorn-leaper','棘刺跃兽','短步横移，标记扑击后恢复','#d6bd7f','✶',30,72,16,9,2],['budding-slime','出芽胶团','死亡生成两只不可分裂的胶滴','#8bd4b6','♧',52,48,24,8,3],['root-carrier','根甲行者','缓慢追踪，栽种预警根区','#99b878','♜',96,32,26,14,5],['spore-sac','膨胀孢囊','近身警告后自爆，可提前击败','#d9b3a0','◌',48,43,21,12,3],['vine-weaver','织蔓花','退避并标记短线生长区','#a4d68b','❀',62,38,21,13,4],['brood-mother','育群母体','有上限地繁育本地胶滴','#b5ce87','♧',82,37,27,14,4]]
};
export const MAP_SPECIES=Object.fromEntries(Object.entries(entries).map(([map,rows])=>[map,rows.map(([slug,name,description,color,icon,hp,speed,r,damage,diamonds])=>Object.freeze({id:`${map}-${slug}`,name,description,color,icon,hp,speed,r,damage,diamonds}))]));
export function mapSpeciesFor(map,type){const list=Object.hasOwn(MAP_SPECIES,map)?MAP_SPECIES[map]:null;if(!list||type===4||type===6)return null;const i=roles.indexOf(type);return list[i<0?(type===10?2:type===11?7:0):i]}
export function mapSpawnExtras(map,type,extra={},wave=1){const d=mapSpeciesFor(map,type);if(!d)return extra;const base=ENEMY_TYPES[type]||ENEMY_TYPES[0],hpRatio=(extra.hp??base.hp)/base.hp,maxRatio=(extra.maxHp??extra.hp??base.hp)/base.hp,speedBase=base.speed+(wave-1)*4,speedRatio=(extra.speed??speedBase)/speedBase;return {...extra,speciesId:d.id,speciesMap:map,speciesIndex:MAP_SPECIES[map].indexOf(d),displayName:d.name,diamonds:extra.child?1:d.diamonds,hp:d.hp*hpRatio,maxHp:d.hp*maxRatio,speed:(d.speed+(wave-1)*4)*speedRatio,damage:d.damage*((extra.damage??base.damage)/base.damage),r:d.r*((extra.r??base.r)/base.r),mapAction:'idle',mapWarning:0,mapWarningTotal:0,mapRecovery:0,mapDashTime:0}}
export function mapMonsterDamage(run,e,damage,burn){return e.speciesId&&e.speciesMap==='mine'&&e.speciesIndex===4&&e.mapAction==='armored'?damage*.7:damage}
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function point(x,y,r=30){return {x:clamp(x,ARENA_BOUNDS.left+r,ARENA_BOUNDS.right-r),y:clamp(y,ARENA_BOUNDS.top+r,ARENA_BOUNDS.bottom-r)}}
function hazard(r,e,params){if(params?.type==='beam'){const beams=r.hazards.filter(h=>h.mapMonster&&h.type==='beam'&&h.elapsed<h.life);if(beams.length>=3||(!beams.some(h=>h.sourceId===e.id)&&new Set(beams.map(h=>h.sourceId)).size>=2))return false}if(r.hazards.filter(h=>h.mapMonster&&h.elapsed<h.life).length>=8)return false;r.hazards.push({type:'zone',sourceId:e.id,x:e.x,y:e.y,elapsed:0,warning:1,life:1.7,radius:48,damage:e.damage,hit:false,mapMonster:true,speciesMap:e.speciesMap,speciesIndex:e.speciesIndex,color:MAP_SPECIES[e.speciesMap][e.speciesIndex].color,...params});return true}
function shot(r,e,a,speed=160,life=3){if(r.enemyBullets.filter(b=>b.speciesMap&&b.life>0).length>=36)return;r.enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,damage:e.damage*.8,speciesMap:e.speciesMap,speciesIndex:e.speciesIndex,color:MAP_SPECIES[e.speciesMap][e.speciesIndex].color,metal:e.speciesMap==='industrial'})}
function children(r,e,n){if(e.child)return;const alive=r.enemies.filter(x=>x.hp>0);if(alive.length>=120)return;for(let i=0;i<n&&alive.length+i<120;i++){if(r.enemies.filter(x=>x.hp>0&&x.child).length>=16)break;const d=ENEMY_TYPES[0],p=point(e.x+(i%2?28:-28),e.y+28,12);r.spawnEnemy(0,p.x,p.y,{child:true,parentId:e.id,hp:d.hp*.45,maxHp:d.hp*.45,r:d.r*.65,speed:(d.speed+(r.wave-1)*4)*1.2})}}
export function onMapMonsterDeath(r,e){if(!e.speciesId||e.mapDeathHandled)return;e.mapDeathHandled=true;if(e.speciesIndex!==3||e.child)return;if(e.speciesMap==='ecology'){children(r,e,2);return}hazard(r,e,{radius:64,warning:1,life:1.7});if(e.speciesMap==='mine'){
 // Delayed death fragments share the zone warning; emitted by the ranged updater after it expires.
 const h=r.hazards.at(-1);if(h?.sourceId===e.id)h.mapShards={...e};
}}
function attack(r,e){const i=e.speciesIndex,m=e.speciesMap,a=e.mapAim;
 if((m==='industrial'||m==='ecology')&&i===2){e.mapAction='dash';e.mapDashTime=.55;return}
 if(m==='mine'&&i===2){e.x=e.mapTarget.x;e.y=e.mapTarget.y;hazard(r,e,{warning:.8,radius:45});}
 if(i===1){for(const o of m==='industrial'?[-.1,0,.1]:[0])shot(r,e,a+o,m==='mine'?230:m==='ecology'?125:195,3.5)}
 if(m==='industrial'&&i===5)hazard(r,e,{type:'beam',angle:a,width:24,length:500,warning:.8,life:1.25});
 if(i===6&&m!=='ecology'){for(const o of m==='mine'?[-.35,.35]:[0])hazard(r,e,{type:'beam',angle:a+o+(m==='mine'?(e.mapCycle%2)*Math.PI/2:0),width:16,length:540,warning:.8,life:1.25})}
 if(m==='industrial'&&i===7)for(const o of [-.5,0,.5])shot(r,e,a+o,135,1.5);
 if(m==='mine'&&i===5)for(let j=0;j<6;j++)shot(r,e,a+j*Math.PI/3,110,3);
 if(m==='mine'&&i===7)for(const o of [-85,85])hazard(r,e,{...point(e.mapTarget.x+o,e.mapTarget.y),radius:35,warning:1.1,life:1.7});
 if(m==='industrial'&&(i===0||i===4))hazard(r,e,{radius:i===0?45:78});
 if(m==='ecology'&&i===4)hazard(r,e,{...e.mapTarget,radius:48,warning:1,life:2.1});
 if(m==='ecology'&&i===5){hazard(r,e,{radius:80,warning:.8,life:1.4});r.hit(e,e.hp+1)}
 if(m==='ecology'&&i===6)for(const t of [60,120,180])hazard(r,e,{...point(e.x+Math.cos(a)*t,e.y+Math.sin(a)*t),radius:28,warning:1.1,life:1.8});
 if(m==='ecology'&&i===7)children(r,e,2);
 e.mapAction='recover';e.mapRecovery=i===1?1.1:.65;
}
export function updateMapMonster(r,e,dt,bounds){
 if(!e.speciesId)return false;const i=e.speciesIndex,m=e.speciesMap;e.age=(e.age||0)+dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(e.corrosionTime>0){e.corrosionTime=Math.max(0,e.corrosionTime-dt);if(!e.corrosionTime){e.corrosionStacks=0;e.corrosionStrength=0}}if(e.burn>0){r.hit(e,e.burnDps*Math.min(dt,e.burn),true);e.burn=Math.max(0,e.burn-dt);if(!e.burn)r.flushBurnText(e)}if(e.hp<=0)return true;
 const visible=visibleInCombat(e,bounds),dx=r.x-e.x,dy=r.y-e.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);let move=1,angle=a;
 e.mapCycle??=0;
 if(e.mapAction==='warning'){e.mapWarning=Math.max(0,e.mapWarning-dt);move=0;if(!e.mapWarning){if(visible)attack(r,e);else{e.mapAction='idle';e.mapClock=1}}}
 else if(e.mapAction==='dash'){move=3.2;angle=e.mapAim;e.mapDashTime=Math.max(0,e.mapDashTime-dt);if(!e.mapDashTime){e.mapAction='recover';e.mapRecovery=2;move=0}}
 else if(e.mapRecovery>0){e.mapAction='recover';e.mapRecovery=Math.max(0,e.mapRecovery-dt);move=0}
 else{
  e.mapAction=m==='mine'&&i===4?(e.age%6<3?'armored':'exposed'):'idle';
  if(m==='mine'&&i===4&&e.mapAction==='armored')move=.35;
  if(m==='mine'&&i===0)angle+=Math.sin(e.age*4)>0?.65:-.65;
  if(m==='ecology'&&i===0)move=.35+Math.max(0,Math.sin(e.age*6))*1.6;
  if(m==='industrial'&&i===1)angle+=Math.sin(e.age*2)>.0?1:-1;
  if(m==='ecology'&&(i===1||i===6)&&d<270)move=-.65;
  if(m==='ecology'&&i===2)angle+=Math.sin(e.age*5)*.8;
  if(i===1&&d<320&&m!=='ecology')move=.2;
  e.mapClock=(e.mapClock??1.3+(e.id%5)*.23)-dt;
  const passive=i===3||(m==='mine'&&(i===0||i===4))||(m==='ecology'&&i===0);
  if(!passive&&visible&&d<600&&e.mapClock<=0&&!(m==='ecology'&&i===5&&d>155)&&r.enemies.filter(x=>x.hp>0&&x.mapAction==='warning').length<3){
   e.mapAction='warning';e.mapWarning=e.mapWarningTotal=i===6?1.2:1;e.mapAim=a;e.mapTarget=point(r.x,r.y,45);if(m==='mine'&&i===2)e.mapTarget=point(r.x+Math.cos(e.id)*105,r.y+Math.sin(e.id)*105,45);e.mapCycle++;e.mapClock=(i===7?5:3.7)/(e.attackRate||1);move=0;
  }
 }
 const step=e.speed*dt*move*(e.slow>0?(e.slowFactor||.45):1);e.x+=Math.cos(angle)*step;e.y+=Math.sin(angle)*step;
 // Spawned enemies enter from outside; clamp only once they reach the arena.
 if(e.x>=ARENA_BOUNDS.left&&e.x<=ARENA_BOUNDS.right&&e.y>=ARENA_BOUNDS.top&&e.y<=ARENA_BOUNDS.bottom){const p=point(e.x,e.y,e.r);e.x=p.x;e.y=p.y}
 if(e.hp>0&&visible&&e.mapAction!=='recover'&&Math.hypot(e.x-r.x,e.y-r.y)<e.r+18){const dealt=r.hurt(e.damage);if(dealt>0&&e.mapAction==='dash'){e.mapAction='recover';e.mapRecovery=2;e.mapDashTime=0}}
 return true;
}
// Called with the normal hostile-projectile clock so fragments continue after their source dies.
export function updateMapFragments(r,dt){for(const h of r.hazards){if(!h.mapShards||h.mapShardsFired||h.elapsed+dt<h.warning)continue;h.mapShardsFired=true;for(let j=0;j<6;j++)shot(r,h.mapShards,j*Math.PI/3,100,2.4)}}

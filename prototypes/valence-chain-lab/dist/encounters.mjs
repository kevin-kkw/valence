import {visibleInCombat,ARENA_BOUNDS} from './view.mjs';
export const WAVE_NEW_TYPES=[0,5,1,3,2,7,8,9,10,11];
export const FORM_NAMES=['束缚核心','双生裂变','熵灭化身'];
export function spawnPacing(wave){return {interval:Math.max(.27,1.1-(wave-1)*.09),batch:1+Math.floor((wave-1)/3),cap:Math.min(145,38+wave*10)}}
export function shot(r,e,angle,speed=180,metal=false){r.enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage:e.damage*.8,metal,life:6})}
export function updateNewMonster(r,e,dt,bounds){
 if(!visibleInCombat(e,bounds))return;
 if(e.elite){e.elitePulse=(e.elitePulse??3)-dt;if(e.elitePulse<=0){const a=Math.atan2(r.y-e.y,r.x-e.x);for(const offset of [-.25,0,.25])shot(r,e,a+offset,200,e.type===1||e.type===2);e.elitePulse=2.3}}
 if(e.type<7||!visibleInCombat(e,bounds))return;e.attackClock=(e.attackClock??1.4)-dt;if(e.attackClock>0)return;e.attackClock=e.elite?1.1:2.6;
 const a=Math.atan2(r.y-e.y,r.x-e.x);
 if(e.type===7){r.hazards.push({type:'zone',sourceId:e.id,x:r.x,y:r.y,elapsed:0,warning:1.1,life:1.9,radius:48,damage:e.damage,hit:false})}
 if(e.type===8){for(const o of [-.25,0,.25])shot(r,e,a+o,160,false)}
 if(e.type===9){e.lunge=.4;for(const o of [-.1,.1])shot(r,e,a+o,130,false)}
 if(e.type===10){r.hazards.push({type:'zone',sourceId:e.id,x:e.x,y:e.y,elapsed:0,warning:.9,life:1.6,radius:65,damage:e.damage,hit:false});e.teleportTarget={x:Math.max(60,Math.min(1140,r.x+Math.cos(e.id)*150)),y:Math.max(60,Math.min(740,r.y+Math.sin(e.id)*150))};e.teleportWarning=.8}
 if(e.type===11)for(let i=0;i<8;i++)shot(r,e,a+i*Math.PI/4,145,false);
}
function beam(r,e,angle,width=22,warning=1){r.hazards.push({type:'beam',sourceId:e.id,x:e.x,y:e.y,angle,width,length:1250,elapsed:0,warning,life:warning+.7,damage:e.damage*1.05,hit:false})}
export function updateFinalBoss(r,e,dt,bounds){
 const phase=e.hp/e.maxHp>.7?1:e.hp/e.maxHp>.35?2:3;
 if(phase!==e.phase){e.phase=phase;e.skillTimer=1.3;e.phaseGrace=1.2;e.r=phase===3?65:phase===2?54:48;r.hazards=r.hazards.filter(h=>h.sourceId!==e.id);r.enemyBullets=[];r.events.push('finalTransform');r.burst(e.x,e.y,phase===3?'#ff719b':'#d4aaff',35)}
 e.phaseGrace=Math.max(0,(e.phaseGrace||0)-dt);e.orbit=(e.orbit||0)+dt;e.skillTimer-=dt;e.volleyClock=(e.volleyClock??2)-dt;
 if(e.dashWarning>0){e.dashWarning-=dt;if(e.dashWarning<=0){e.dashTime=.45;const a=Math.atan2(e.dashTarget.y-e.y,e.dashTarget.x-e.x);e.dashAngle=a}}
 if(e.dashTime>0){e.dashTime-=dt;e.x=Math.max(ARENA_BOUNDS.left+e.r,Math.min(ARENA_BOUNDS.right-e.r,e.x+Math.cos(e.dashAngle)*530*dt));e.y=Math.max(ARENA_BOUNDS.top+e.r,Math.min(ARENA_BOUNDS.bottom-e.r,e.y+Math.sin(e.dashAngle)*530*dt))}
 if(e.phaseGrace>0||!visibleInCombat(e,bounds))return;
 if(e.volleyClock<=0){if(phase===1){const a=Math.atan2(r.y-e.y,r.x-e.x);for(const o of [-.42,-.21,0,.21,.42])shot(r,e,a+o,170)}else{const count=phase===2?12:18;for(let i=0;i<count;i++){if(i%6===0)continue;shot(r,e,e.orbit*.9+i*Math.PI*2/count,phase===3?190:150)}}e.volleyClock=phase===1?3:phase===2?2.6:1.9}
 if(e.skillTimer>0)return;const index=e.skillIndex||0;e.skillIndex=index+1;const a=Math.atan2(r.y-e.y,r.x-e.x);
 if(phase===1){beam(r,e,a,24,1.1);if(index%2===1)for(const offset of [-90,90])r.hazards.push({type:'zone',sourceId:e.id,x:Math.max(80,Math.min(1120,r.x+offset)),y:r.y,elapsed:0,warning:1.2,life:2,radius:60,damage:e.damage,hit:false});e.skillTimer=3.8}
 else if(phase===2){for(let i=0;i<4;i++)beam(r,e,a+.25+i*Math.PI/2,20,1.2);if(r.enemies.length<110)for(const o of [-70,70])r.spawnEnemy(8,e.x+o,e.y+70,{hp:45,maxHp:45});e.skillTimer=3.3}
 else{for(let i=0;i<3;i++)beam(r,e,a+.45+i*Math.PI*2/3,18,1);e.dashTarget={x:r.x,y:r.y};e.dashWarning=.85;r.hazards.push({type:'zone',sourceId:e.id,x:r.x,y:r.y,elapsed:0,warning:1,life:1.7,radius:75,damage:e.damage*1.15,hit:false});e.skillTimer=2.4}
 r.hazards=r.hazards.slice(-60);
}

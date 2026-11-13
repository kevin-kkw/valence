import {accessoryDamageScale,accessoryRateScale} from './accessory-growth.mjs';
import {visibleInCombat,ARENA_BOUNDS} from './view.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const difference=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
export class Condenser{
 constructor(){this.equipped=true;this.clear()}
 clear(){this.charge=0;this.spraying=false;this.particles=[];this.impacts=[];this.clock=0;this.bursts=0;this.stream=0;this.lastAngle=0;this.damage=0;this.muzzle=null;this.collecting=false}
 toggle(){this.equipped=!this.equipped;this.clear()}
 step(dt,run,bounds){
  const collectionRate=.2*accessoryRateScale(run,2),damage=1.5*accessoryDamageScale(run);
  this.collecting=this.equipped&&run.lab.gun.type==='flame'&&run.weaponEffects.some(e=>e.type==='flame'&&e.life>0);
  if(!this.equipped||run.lab.gun.type!=='flame'){this.charge=0;this.spraying=false;this.particles=[];this.impacts=[];this.muzzle=null;return}
  if(this.spraying){this.charge=Math.max(0,this.charge+dt*(this.collecting?collectionRate:0)-dt/1.8);if(this.charge<=1e-9){this.charge=0;this.spraying=false;this.muzzle=null}}
  else if(this.collecting){this.charge=Math.min(1,this.charge+dt*collectionRate);if(this.charge>=1-1e-9){this.charge=1;this.spraying=true;this.clock=0;this.bursts++;run.events.push('condenserBurst')}}
  if(this.spraying){this.clock-=dt;while(this.clock<=0){this.clock+=.025;const pool=run.enemies.filter(e=>e.hp>0&&visibleInCombat(e,bounds)&&Math.hypot(e.x-run.x,e.y-run.y)<330&&difference(Math.atan2(e.y-run.y,e.x-run.x),run.angle)>Math.PI/3);const target=pool.sort((a,b)=>Math.hypot(a.x-run.x,a.y-run.y)-Math.hypot(b.x-run.x,b.y-run.y))[0];const angle=target?Math.atan2(target.y-run.y,target.x-run.x):run.angle+Math.PI;if(difference(angle,this.lastAngle)>.65)this.stream++;this.lastAngle=angle;const x=run.x-Math.cos(run.angle)*18,y=run.y-Math.sin(run.angle)*18;this.muzzle={x,y,streamId:this.stream};this.particles.push({x,y,vx:Math.cos(angle)*510,vy:Math.sin(angle)*510,life:.64,streamId:this.stream,damage,hit:false})}}else this.muzzle=null;
  for(const p of this.particles){const ox=p.x,oy=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.hit)continue;const dx=p.x-ox,dy=p.y-oy;for(const e of run.enemies){if(e.hp<=0||!visibleInCombat(e,bounds))continue;const u=clamp(((e.x-ox)*dx+(e.y-oy)*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(e.x-ox-u*dx,e.y-oy-u*dy)>e.r+5)continue;const dealt=Math.min(e.hp,p.damage);run.hit(e,p.damage);this.damage+=dealt;p.hit=true;this.impacts.push({x:e.x,y:e.y,life:.16});if(e.hp>0){const k=e.type===4||e.type===6?.2:1;e.x=clamp(e.x+p.vx*.006*k,ARENA_BOUNDS.left+e.r,ARENA_BOUNDS.right-e.r);e.y=clamp(e.y+p.vy*.006*k,ARENA_BOUNDS.top+e.r,ARENA_BOUNDS.bottom-e.r)}break}}
  this.particles=this.particles.filter(p=>p.life>0&&p.x>=bounds.left&&p.x<=bounds.right&&p.y>=bounds.top&&p.y<=bounds.bottom).slice(-60);for(const p of this.impacts)p.life-=dt;this.impacts=this.impacts.filter(p=>p.life>0).slice(-12);
 }
}

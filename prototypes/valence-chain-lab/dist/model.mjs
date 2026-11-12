import {MATERIALS,RECIPES,emptyStock,MAX_LEVEL} from './catalog.mjs';
export function gunStats(gun){const level=Math.max(1,gun.level);return {damage:18,interval:gun.type==='water'?Math.max(.12,.42/(1+.45*level)):.42,burnDps:gun.type==='flame'?7+level*5:0,burnTime:gun.type==='flame'?2.5:0}}
export class Lab{
 constructor(){this.inventory=emptyStock();this.furnace=emptyStock();this.gun={type:'normal',level:0};this.products=emptyStock();this.ignition=true;this.discoveries=[];this.history=[]}
 moveMaterial(id,to){if(!Object.hasOwn(MATERIALS,id)||!['furnace','inventory'].includes(to))return false;let from=to==='furnace'?'inventory':'furnace';if(this[from][id]<1)return false;this[from][id]--;this[to][id]++;return true}
 returnAll(){for(const id of Object.keys(MATERIALS)){this.inventory[id]+=this.furnace[id];this.furnace[id]=0}}
 recipeInfo(id){const r=RECIPES[id];if(!r)return null;let missing={};for(const [key,n]of Object.entries(r.cost)){let diff=n-this.furnace[key];if(diff>0)missing[key]=diff}return {recipe:r,missing,maxed:this.gun.type===id&&this.gun.level>=MAX_LEVEL,ready:Object.keys(missing).length===0,replace:this.gun.type!=='normal'&&this.gun.type!==id}}
 craft(id,confirm=false){const info=this.recipeInfo(id);if(!info)return {ok:false,reason:'unknown'};if(info.maxed)return {ok:false,reason:'maxed'};if(!info.ready)return {ok:false,reason:'materials'};if(id==='flame'&&!this.ignition)return {ok:false,reason:'ignition'};if(info.replace&&!confirm)return {ok:false,reason:'replace'};
 for(const [key,n]of Object.entries(info.recipe.cost))this.furnace[key]-=n;
 this.gun={type:id,level:this.gun.type===id?this.gun.level+1:1};for(const [key,n]of Object.entries(info.recipe.products))this.products[key]+=n;
 if(!this.discoveries.includes(id))this.discoveries.push(id);this.history.push({id,level:this.gun.level});this.returnAll();return {ok:true,gun:this.gun,equation:info.recipe.equation}
 }
}
export class Run{
 constructor(random=Math.random){this.random=random;this.reset();this.state='menu'}
 reset(){Object.assign(this,{lab:new Lab(),state:'menu',wave:1,waveTime:0,elapsed:0,x:600,y:400,hp:100,kills:0,damageDone:0,burnDamage:0,burnHits:0,picked:0,enemies:[],bullets:[],drops:[],particles:[],texts:[],events:[],supply:emptyStock(),spawn:0,shot:0,inv:0,nextId:1,angle:0})}
 start(){this.reset();this.state='playing'}
 craft(id,confirm=false){if(this.state!=='lab')return {ok:false,reason:'phase'};return this.lab.craft(id,confirm)}
 nextWave(){if(this.state!=='lab'||this.lab.gun.type==='normal')return false;this.lab.returnAll();this.wave=2;this.waveTime=0;this.spawn=0;this.shot=0;this.hp=Math.min(100,this.hp+35);this.state='playing';return true}
 burst(x,y,color,count=8){for(let i=0;i<count;i++){let a=this.random()*Math.PI*2,s=25+this.random()*100;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color,life:.3+this.random()*.3})}}
 collect(drop){this.lab.inventory[drop.material]++;this.picked++;this.events.push('pickup');this.burst(drop.x,drop.y,MATERIALS[drop.material].color,5)}
 hit(enemy,damage,burn=false){if(enemy.hp<=0)return;let dealt=Math.min(enemy.hp,damage);enemy.hp-=damage;enemy.flash=.08;this.damageDone+=dealt;if(burn)this.burnDamage+=dealt;this.texts.push({x:enemy.x,y:enemy.y-22,value:burn?dealt.toFixed(0):damage,color:burn?'#bdcaff':'#f4e8c4',life:.55});if(enemy.hp<=0){this.kills++;const material=['water','hydrogen','oxygen'][Math.floor(this.random()*3)];this.drops.push({x:enemy.x,y:enemy.y,material});this.burst(enemy.x,enemy.y,enemy.type===1?'#d69fa9':'#c6dd90',12);this.events.push('kill')}}
 endWave(){for(const d of this.drops)this.collect(d);this.drops=[];this.enemies=[];this.bullets=[];this.particles=[];this.texts=[];if(this.wave===2){this.state='won';return}let minimum={water:4,hydrogen:6,oxygen:3};for(const id of Object.keys(minimum)){this.supply[id]=Math.max(0,minimum[id]-this.lab.inventory[id]);this.lab.inventory[id]+=this.supply[id]}this.state='lab'}
 step(dt,input={}){
 if(this.state!=='playing')return;dt=Math.min(.1,Math.max(0,dt));this.events=[];if(this.hp<=0){this.state='dead';return}
 this.elapsed+=dt;this.waveTime=Math.min(60,this.waveTime+dt);if(this.waveTime>=60-1e-8){this.endWave();return}
 let ix=input.x||0,iy=input.y||0,n=Math.hypot(ix,iy);if(n>1){ix/=n;iy/=n}this.x=Math.max(28,Math.min(1172,this.x+ix*225*dt));this.y=Math.max(28,Math.min(772,this.y+iy*225*dt));
 this.inv=Math.max(0,this.inv-dt);this.spawn-=dt;this.shot-=dt;
 if(this.spawn<=0&&this.enemies.length<100){let a=this.random()*Math.PI*2,type=this.random()<.2?1:0;this.enemies.push({id:this.nextId++,x:600+Math.cos(a)*740,y:400+Math.sin(a)*550,type,hp:type?24:36,maxHp:type?24:36,r:type?13:18,speed:(type?102:65)+(this.wave-1)*16,burn:0,burnDps:0,flash:0});this.spawn=Math.max(.25,(this.wave===1?.75:.47)-this.waveTime*.002)}
 let stats=gunStats(this.lab.gun);if(this.shot<=0&&this.enemies.length){let e=this.enemies.reduce((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)<Math.hypot(b.x-this.x,b.y-this.y)?a:b);let dist=Math.hypot(e.x-this.x,e.y-this.y);this.angle=Math.atan2(e.y-this.y,e.x-this.x);if(dist<660){this.bullets.push({x:this.x+Math.cos(this.angle)*22,y:this.y+Math.sin(this.angle)*22,vx:Math.cos(this.angle)*600,vy:Math.sin(this.angle)*600,life:1.25,type:this.lab.gun.type,stats});this.shot=stats.interval;this.events.push('shot')}}
 for(const e of this.enemies){if(e.hp<=0)continue;let dx=this.x-e.x,dy=this.y-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;e.flash=Math.max(0,e.flash-dt);if(e.burn>0){this.hit(e,e.burnDps*Math.min(dt,e.burn),true);e.burn=Math.max(0,e.burn-dt)}if(e.hp>0&&d<e.r+18&&this.inv===0){this.hp=Math.max(0,this.hp-9);this.inv=.8;this.events.push('hurt');this.burst(this.x,this.y,'#ed878a',16)}}
 for(const b of this.bullets){let ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const e of this.enemies){let dx=b.x-ox,dy=b.y-oy,t=Math.max(0,Math.min(1,((e.x-ox)*dx+(e.y-oy)*dy)/(dx*dx+dy*dy||1)));if(e.hp>0&&b.life>0&&Math.hypot(e.x-(ox+t*dx),e.y-(oy+t*dy))<e.r+6){this.hit(e,b.stats.damage);if(e.hp>0&&b.type==='flame'){e.burn=b.stats.burnTime;e.burnDps=b.stats.burnDps;this.burnHits++}this.burst(b.x,b.y,b.type==='water'?'#77d9f5':b.type==='flame'?'#aebcff':'#e4d8a6',6);b.life=0;break}}}
 this.enemies=this.enemies.filter(e=>e.hp>0);this.bullets=this.bullets.filter(b=>b.life>0);
 this.drops=this.drops.filter(d=>{let dx=this.x-d.x,dy=this.y-d.y,n=Math.hypot(dx,dy);if(n<125){let s=Math.min(n,460*dt);d.x+=dx/(n||1)*s;d.y+=dy/(n||1)*s}if(n<24){this.collect(d);return false}return true});
 for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0).slice(-350);for(const t of this.texts){t.y-=27*dt;t.life-=dt}this.texts=this.texts.filter(t=>t.life>0).slice(-90);if(this.hp<=0)this.state='dead';
 }
}

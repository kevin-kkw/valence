export class Game {
 constructor(){this.state='menu';this.reset()}
 reset(){Object.assign(this,{x:600,y:400,hp:100,maxHp:100,time:0,kills:0,xp:0,level:1,damage:18,speed:210,rate:.45,magnet:90,shot:0,spawn:0,inv:0,enemies:[],bullets:[],gems:[],particles:[],texts:[],events:[]})}
 start(){this.reset();this.state='playing'}
 get needed(){return 7+this.level*4}
 upgrade(id){if(this.state!=='upgrade')return;if(id==='damage')this.damage+=8;if(id==='rate')this.rate=Math.max(.1,this.rate*.82);if(id==='speed')this.speed+=25;if(id==='health'){this.maxHp+=20;this.hp=Math.min(this.maxHp,this.hp+40)}if(id==='magnet')this.magnet+=45;this.state='playing'}
 burst(x,y,color,n=9){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,s=40+Math.random()*130;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.3+Math.random()*.3,color})}}
 tick(dt,input={}){
 if(this.state!=='playing')return;
 dt=Math.min(.1,Math.max(0,dt));this.events=[];
 if(this.hp<=0){this.state='dead';return}
 this.time=Math.min(180,this.time+dt);if(this.time>=180){this.state='won';return}
 let ix=input.x||0,iy=input.y||0,n=Math.hypot(ix,iy);if(n>1){ix/=n;iy/=n}
 this.x=Math.max(30,Math.min(1170,this.x+ix*this.speed*dt));this.y=Math.max(30,Math.min(770,this.y+iy*this.speed*dt));
 this.inv=Math.max(0,this.inv-dt);this.shot-=dt;this.spawn-=dt;
 if(this.spawn<=0&&this.enemies.length<150){let a=Math.random()*Math.PI*2;let type=Math.random()<.18+this.time/650?1:0;let hp=(type?55:27)+this.time*.28;this.enemies.push({x:600+Math.cos(a)*760,y:400+Math.sin(a)*560,hp,maxHp:hp,type,r:type?23:16,speed:(type?43:67)+this.time*.27,hit:0});this.spawn=Math.max(.12,.7-this.time*.0032)}
 if(this.shot<=0&&this.enemies.length){let nearest=null,dist=Infinity;for(let e of this.enemies){let d=Math.hypot(e.x-this.x,e.y-this.y);if(d<dist){dist=d;nearest=e}}if(dist<650){let a=Math.atan2(nearest.y-this.y,nearest.x-this.x);this.bullets.push({x:this.x,y:this.y,vx:Math.cos(a)*660,vy:Math.sin(a)*660,life:1.2});this.shot=this.rate;this.events.push('shot')}}
 for(let e of this.enemies){let dx=this.x-e.x,dy=this.y-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;e.hit=Math.max(0,(e.hit||0)-dt);if(d<e.r+19&&this.inv===0){this.hp=Math.max(0,this.hp-(e.type?16:9));this.inv=.85;this.events.push('hurt');this.burst(this.x,this.y,'#f76a47',14)}}
 for(let b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(let e of this.enemies){if(e.hp>0&&b.life>0&&Math.hypot(b.x-e.x,b.y-e.y)<e.r+7){e.hp-=this.damage;e.hit=.1;b.life=0;this.texts.push({x:e.x,y:e.y-20,value:this.damage,life:.65});this.burst(b.x,b.y,'#ffd481',5);if(e.hp<=0){this.kills++;this.gems.push({x:e.x,y:e.y,value:e.type?3:1});this.burst(e.x,e.y,e.type?'#cd8df4':'#b6ce73',9);this.events.push('kill')}break}}}
 this.bullets=this.bullets.filter(b=>b.life>0);this.enemies=this.enemies.filter(e=>e.hp>0);
 for(let gem of this.gems){let dx=this.x-gem.x,dy=this.y-gem.y,d=Math.hypot(dx,dy);if(d<this.magnet){let step=Math.min(d,440*dt);gem.x+=dx/(d||1)*step;gem.y+=dy/(d||1)*step}if(d<25){this.xp+=gem.value;gem.value=0;this.events.push('pickup')}}this.gems=this.gems.filter(g=>g.value>0);
 for(let p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0);
 for(let t of this.texts){t.y-=32*dt;t.life-=dt}this.texts=this.texts.filter(t=>t.life>0);
 if(this.hp<=0){this.state='dead';return}if(this.xp>=this.needed){this.xp-=this.needed;this.level++;this.state='upgrade';this.events.push('level')}
 }
}

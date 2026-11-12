import {test} from 'node:test';
import assert from 'node:assert/strict';
const {Game}=await import('../dist/engine.mjs').catch(()=>({}));
test('new round starts healthy',()=>{assert.equal(typeof Game,'function');let g=new Game;g.start();assert.equal(g.hp,100);assert.equal(g.time,0);assert.equal(g.state,'playing')});
test('diagonal movement normalized and arena clamped',()=>{let a=new Game,b=new Game;a.start();b.start();a.tick(.1,{x:1,y:0});b.tick(.1,{x:1,y:1});assert.ok(Math.abs(Math.hypot(a.x-600,a.y-400)-Math.hypot(b.x-600,b.y-400))<.01);for(let i=0;i<100;i++)a.tick(.1,{x:1,y:0});assert.ok(a.x<=1170)});
test('automatic fire kills and drops XP',()=>{let g=new Game;g.start();g.enemies.push({x:630,y:400,hp:1,r:14,speed:0,type:0,hit:0});for(let i=0;i<10;i++)g.tick(.03,{});assert.equal(g.kills,1);assert.ok(g.xp>0||g.gems.length>0)});
test('upgrade freezes action and choice resumes',()=>{let g=new Game;g.start();g.xp=100;g.tick(.01,{});assert.equal(g.state,'upgrade');let t=g.time;g.tick(1,{});assert.equal(g.time,t);let d=g.damage;g.upgrade('damage');assert.ok(g.damage>d);assert.equal(g.state,'playing')});
test('terminal states freeze and restart clears round',()=>{let g=new Game;g.start();g.time=179.99;g.tick(.02,{});assert.equal(g.state,'won');let t=g.time;g.tick(1,{});assert.equal(g.time,t);g.start();g.hp=0;g.tick(.01,{});assert.equal(g.state,'dead');g.start();assert.equal(g.kills,0);assert.equal(g.hp,100)});

test('paused state freezes all simulation',()=>{let g=new Game;g.start();g.state='paused';g.tick(.1,{x:1});assert.equal(g.time,0);assert.equal(g.x,600);assert.equal(g.enemies.length,0)});

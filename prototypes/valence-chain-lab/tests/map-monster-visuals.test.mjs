import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../dist/render.mjs';
const visuals=await import('../dist/map-monster-visuals.mjs').catch(()=>null);
const maps=['industrial','mine','ecology'];
function canvas(){const calls=[],labels=[];let depth=0;const c=new Proxy({calls,labels,get depth(){return depth},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})}, {get(o,k){if(k in o)return o[k];return (...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`${String(k)} received ${a}`);if(k==='save')depth++;if(k==='restore')depth--;if(k==='fillText')labels.push(args[0]);calls.push([k,...args])}},set(o,k,v){o[k]=v;return true}});return c}
function specimen(map,index,extra={}){return {speciesId:map+'-species-'+index,speciesMap:map,speciesIndex:index,x:300,y:200,r:20,hp:100,maxHp:100,id:42,mapAim:.3,...extra}}
test('24 field species dispatch with distinct animated silhouettes and balanced finite canvas operations',()=>{assert.equal(typeof visuals?.drawMapMonster,'function');const signatures=new Set();for(const map of maps)for(let i=0;i<8;i++){const c=canvas(),e=specimen(map,i);assert.equal(visuals.drawMapMonster(c,e,0),true);assert.equal(c.depth,0);assert.ok(c.calls.length>12,`${map}/${i} has a visible body`);signatures.add(JSON.stringify(c.calls));const moving=canvas();visuals.drawMapMonster(moving,e,.7);assert.notDeepEqual(moving.calls,c.calls,`${map}/${i} animates`);for(const action of ['warning','dash','recover','armored','exposed']){const actionCanvas=canvas();visuals.drawMapMonster(actionCanvas,{...e,mapAction:action,mapWarning:.4,mapWarningTotal:1,mapRecovery:1,mapTarget:{x:420,y:310}},1);assert.equal(actionCanvas.depth,0)}}assert.equal(signatures.size,24,'bodies differ geometrically, without relying on color')});
test('unknown and original enemies and bullets fall back without canvas mutations',()=>{assert.ok(visuals);for(const e of [{type:0},{type:1},{type:6},specimen('core',0),specimen('industrial',8)]){const c=canvas();assert.equal(visuals.drawMapMonster(c,e,0),false);assert.equal(c.calls.length,0)}const c=canvas();assert.equal(visuals.drawMapBullet(c,{x:1,y:2,vx:3,vy:4},0),false);assert.equal(c.calls.length,0)});
test('world bullets use species metadata and preserve canvas state',()=>{assert.ok(visuals);const forms=new Set();for(const map of maps)for(let i=0;i<8;i++){const c=canvas();assert.equal(visuals.drawMapBullet(c,{...specimen(map,i),vx:2,vy:1,color:'#abcdef'},.3),true);assert.equal(c.depth,0);forms.add(JSON.stringify(c.calls))}assert.ok(forms.size>=8)});
test('renderer uses local elite name, skips legacy acid/rush, and supports every original role',()=>{assert.ok(visuals);for(const e of [specimen('industrial',0,{type:0,elite:true,displayName:'泄漏桶怪'}),specimen('mine',2,{type:1,dashWarning:.5,dashWarningTotal:1}),...[0,1,2,3,4,5,6,7,8,9].map(type=>({type,r:20,x:200,y:200,hp:100,maxHp:100,id:type,elite:true}))]){const c=canvas(),target={width:1200,height:800,getContext:()=>c,getBoundingClientRect:()=>({width:1200,height:800})};new Renderer(target).draw({state:'playing',missionId:'training',x:600,y:400,angle:0,enemies:[e],enemyBullets:[],drops:[],bullets:[],particles:[],texts:[],lab:{gun:{type:'normal',rank:0}},elapsed:1},1);assert.equal(c.depth,0);if(e.displayName)assert.ok(c.labels.includes('精英 · '+e.displayName));if(e.speciesId){assert.ok(!c.calls.some(a=>a[0]==='arc'&&a[3]>=83&&a[3]<=89),'no legacy acid aura');assert.ok(!c.labels.includes('!'),'no legacy type1 prelude')}}});
test('lodestone and vine warnings show the same clamped impact centers as their edge hazards',()=>{
 const cases=[
  ['mine',7,{x:1118,y:200,mapTarget:{x:1133,y:200},mapAim:0},35,[[1048,200],[1148,200]]],
  ['mine',7,{x:82,y:200,mapTarget:{x:67,y:200},mapAim:Math.PI},35,[[52,200],[152,200]]],
  ['mine',7,{x:600,y:60,mapTarget:{x:600,y:30},mapAim:0},35,[[515,52],[685,52]]],
  ['mine',7,{x:600,y:740,mapTarget:{x:600,y:770},mapAim:0},35,[[515,748],[685,748]]],
  ['ecology',6,{x:1118,y:200,mapAim:0},28,[[1148,200],[1148,200],[1148,200]]],
  ['ecology',6,{x:1118,y:718,mapAim:Math.PI/4},28,[[1148,748],[1148,748],[1148,748]]],
  ['ecology',6,{x:82,y:82,mapAim:Math.PI*1.25},28,[[52,52],[52,52],[52,52]]],
  ['ecology',6,{x:82,y:718,mapAim:Math.PI*.75},28,[[52,748],[52,748],[52,748]]],
  ['ecology',6,{x:1118,y:82,mapAim:-Math.PI/4},28,[[1148,52],[1148,52],[1148,52]]],
  ['ecology',6,{x:600,y:400,mapAim:0},28,[[660,400],[720,400],[780,400]]]
 ];
 for(const [map,index,extra,radius,expected]of cases){const c=canvas(),e=specimen(map,index,{...extra,mapAction:'warning',mapWarning:.5,mapWarningTotal:1});visuals.drawMapMonster(c,e,1);const centers=c.calls.filter(call=>call[0]==='arc'&&call[3]===radius).map(call=>[call[1]+e.x,call[2]+e.y]);assert.deepEqual(centers,expected,`${map} warning at ${e.x},${e.y}`)}
});

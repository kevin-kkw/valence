import assert from 'node:assert/strict';
const elements=new Map(),events=new Map(),frames=[];
const context=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
function element(id){if(elements.has(id))return elements.get(id);const e={id,width:0,height:0,style:{},dataset:{},disabled:false,checked:true,textContent:'',innerHTML:'',classList:{values:new Set(['labView','dialogOverlay','toast','supplyNote'].includes(id)?['hidden']:[]),add(x){this.values.add(x)},remove(x){this.values.delete(x)},contains(x){return this.values.has(x)},toggle(x,b){if(b===undefined)b=!this.contains(x);b?this.add(x):this.remove(x)}},getContext:()=>context,getBoundingClientRect:()=>({width:900,height:610,left:0,top:0}),setAttribute(){},setPointerCapture(){},focus(){document.activeElement=e},addEventListener(n,f){events.set(`${id}:${n}`,f)},querySelector(){return element('fakeFocus')},querySelectorAll(){return [element('fakeFocus')]}};elements.set(id,e);return e}
globalThis.document={getElementById:element,activeElement:null,hidden:false,addEventListener(n,f){events.set(`document:${n}`,f)}};
globalThis.window={addEventListener(n,f){events.set(`window:${n}`,f)}};globalThis.requestAnimationFrame=f=>frames.push(f);globalThis.devicePixelRatio=1;
const {run}=await import('../dist/app.mjs');
let clock=performance.now();function tick(){clock+=40;frames.shift()(clock)}
function click(id){assert.equal(element(id).disabled,false,id);assert.equal(typeof element(id).onclick,'function',id);element(id).onclick()}
function emit(id,type,event){events.get(`${id}:${type}`)(event)}
assert.match(element('screenCard').innerHTML,/普通枪/);assert.doesNotMatch(element('screenCard').innerHTML,/data-start-gun/);
click('dropMode');click('start');assert.equal(run.lab.gun.type,'normal');assert.equal(run.state,'playing');run.spawn=999;tick();click('pause');click('resume');assert.equal(run.state,'playing');click('openLog');assert.equal(run.state,'paused');click('cancelDialog');assert.equal(run.state,'playing');
run.waveTime=run.guaranteedGunTimes[1];const e=run.spawnEnemy(2,680,400,{hp:1,speed:0});run.hit(e,100);const d=run.drops.find(d=>d.kind==='gun');assert.ok(d);run.x=d.x;run.y=d.y;tick();assert.notEqual(run.lab.gun.type,'normal');
run.state='lab';run.hp=37;run.lab.inventory.water=20;tick();assert.equal(element('backpack').classList.contains('hidden'),false);click('weaponSlot0');
// Same-family upgrading preserves rank; different-family change still confirms.
run.lab.gun={type:'water',level:2,rank:5};run.saveWeapon();click('weaponSlot0');click('craft');assert.equal(run.lab.gun.level,3);assert.equal(run.lab.gun.rank,5);
click('labMedicalTab');assert.equal(element('medicalRoom').classList.contains('hidden'),false);emit('medicalMaterials','click',{target:{closest:s=>s==='[data-med-all]'?{dataset:{medAll:'water'}}:null}});assert.match(element('medicalSelected').textContent,/3 \/ 3/);click('medicalBuy');assert.equal(run.hp,42);
click('nextWave');assert.equal(run.hp,42);assert.equal(element('equipmentPane').classList.contains('hidden'),false);emit('window','blur',{});assert.equal(run.state,'paused');click('resume');run.hp=0;tick();assert.equal(run.state,'dead');assert.match(element('screenCard').innerHTML,/实验中止|实验记录/);assert.equal(element('screenOverlay').classList.contains('result-loss'),true);click('restart');assert.equal(run.lab.gun.type,'normal');assert.equal(run.wave,1);
run.state='won';tick();assert.equal(element('screenOverlay').classList.contains('result-win'),true);assert.match(element('screenCard').innerHTML,/反应完成/);click('back');assert.equal(run.state,'menu');assert.equal(element('screenOverlay').classList.contains('result-win'),false);
console.log('Local dual UI smoke PASS: normal menu, start, physical gun pickup, pause/log, lab rank-preserving upgrade, medical add-all, no free healing, results and restart. DOM/Canvas mock, not pixels.');

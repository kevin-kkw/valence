// DOM/canvas smoke harness: verifies UI lifecycle without a browser renderer.
import assert from 'node:assert/strict';
const handlers={},elements=new Map,frames=[];
const context=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>t[k]??(()=>{})});
function element(id){if(elements.has(id))return elements.get(id);let e={id,width:0,height:0,style:{},dataset:{},textContent:'',innerHTML:'',classList:{values:new Set(id==='play'||id==='overlay'?['hidden']:[]),add(x){this.values.add(x)},remove(x){this.values.delete(x)},contains(x){return this.values.has(x)},toggle(x,b){b?this.add(x):this.remove(x)}},getContext:()=>context,getBoundingClientRect:()=>({width:1100,height:730,left:0,top:0}),focus(){},setAttribute(){},setPointerCapture(){},addEventListener(n,f){handlers[`${id}:${n}`]=f},querySelector:()=>({style:{},focus(){}}),querySelectorAll:()=>[]};elements.set(id,e);return e}
globalThis.document={getElementById:element,body:element('body'),hidden:false,addEventListener(n,f){handlers[n]=f}};globalThis.window={addEventListener(n,f){handlers[n]=f}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=f=>frames.push(f);
await import('../dist/game.mjs');
frames.shift()(100);
assert.equal(typeof element('start').onclick,'function');element('start').onclick();assert.equal(element('play').classList.contains('hidden'),false);assert.equal(element('home').classList.contains('hidden'),true);
frames.shift()(116);assert.equal(element('timer').textContent,'03:00');assert.equal(element('hpText').textContent,'100 / 100');element('pause').onclick();assert.equal(element('overlay').classList.contains('hidden'),false);assert.match(element('modal').innerHTML,/继续游戏/);element('resume').onclick();assert.equal(element('overlay').classList.contains('hidden'),true);handlers.blur();assert.equal(element('overlay').classList.contains('hidden'),false);element('back').onclick();assert.equal(element('home').classList.contains('hidden'),false);frames.shift()(132);
console.log('UI smoke PASS: poster, start, canvas frame, HUD, pause/resume, blur, home');

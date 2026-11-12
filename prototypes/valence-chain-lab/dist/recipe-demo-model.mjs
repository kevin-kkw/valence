// Isolated design spike. Its inventory and draft assembly costs do not alter Run.
export const DEMO_MATERIALS=Object.freeze({
 iron:{name:'铁',formula:'Fe',color:'#d4deed',atoms:{Fe:1}},
 acid:{name:'稀盐酸',formula:'HCl(aq)',color:'#b7e68c',atoms:{H:1,Cl:1}},
 hydrogen:{name:'氢气',formula:'H₂',color:'#b8c9ff',atoms:{H:2}},
 ferrous_chloride:{name:'氯化亚铁溶液',formula:'FeCl₂(aq)',color:'#a3c8ae',atoms:{Fe:1,Cl:2}},
 carbon:{name:'碳',formula:'C',color:'#b7b7ae',atoms:{C:1}},
 oxygen:{name:'氧气',formula:'O₂',color:'#9ce3b5',atoms:{O:2}},
 carbon_dioxide:{name:'二氧化碳',formula:'CO₂',color:'#d2e8ea',atoms:{C:1,O:2}}
});
export const PREPARATIONS=Object.freeze({
 hydrogen:{name:'制备氢气',cost:{iron:1,acid:2},products:{ferrous_chloride:1,hydrogen:1},equation:'Fe + 2HCl → FeCl₂ + H₂↑',condition:'稀盐酸',fact:'铁与稀盐酸反应，生成氯化亚铁和氢气。两种产物均保留在演示库存中。'},
 carbon_dioxide:{name:'制备二氧化碳',cost:{carbon:1,oxygen:1},products:{carbon_dioxide:1},equation:'C + O₂ → CO₂',condition:'点燃',fact:'本演示登记的是碳在氧气中充分燃烧生成二氧化碳的路线，需要点火条件。'}
});
export const DEMO_GUNS=Object.freeze({
 iron:{name:'铁弹枪',cost:{iron:2},color:'#d4deed',summary:'直接用铁装配 · 远程贯穿',note:'装备装配属于游戏规则，不发生新的化学反应。'},
 flame:{name:'氢燃烧枪',cost:{hydrogen:1},color:'#b8c9ff',summary:'先制备氢气，再装填 · 近程灼烧',note:'此演示以氢气装填已有测试枪，枪自带点火模块，环境空气含氧；装配时不触发燃烧。'},
 gas:{name:'气压枪',cost:{carbon_dioxide:1},color:'#d2e8ea',summary:'先制备CO₂，再装配 · 扇形击退',note:'供气与压缩模块由游戏测试台提供，装配不是化学反应。'}
});
export class RecipeDemo{
 constructor(){this.reset()}
 reset(){this.inventory=Object.fromEntries(Object.keys(DEMO_MATERIALS).map(id=>[id,0]));Object.assign(this.inventory,{iron:2,acid:4,carbon:1,oxygen:1});this.guns=[];this.selected=null;this.history=[];this.ignition=true}
 missing(cost){return Object.fromEntries(Object.entries(cost).map(([id,n])=>[id,Math.max(0,n-(this.inventory[id]||0))]).filter(([,n])=>n>0))}
 prepare(id){const r=PREPARATIONS[id];if(!r)return {ok:false,reason:'unknown'};const missing=this.missing(r.cost);if(Object.keys(missing).length)return {ok:false,reason:'materials',missing};if(id==='carbon_dioxide'&&!this.ignition)return {ok:false,reason:'ignition'};for(const[k,n]of Object.entries(r.cost))this.inventory[k]-=n;for(const[k,n]of Object.entries(r.products))this.inventory[k]+=n;const event={kind:'prepare',id,name:r.name,cost:{...r.cost},products:{...r.products},equation:r.equation};this.history.push(event);return {ok:true,event}}
 assemble(id){const r=DEMO_GUNS[id];if(!r)return {ok:false,reason:'unknown'};if(this.guns.includes(id))return {ok:false,reason:'owned'};const missing=this.missing(r.cost);if(Object.keys(missing).length)return {ok:false,reason:'materials',missing};for(const[k,n]of Object.entries(r.cost))this.inventory[k]-=n;this.guns.push(id);this.selected=id;const event={kind:'assemble',id,name:r.name,cost:{...r.cost},products:{}};this.history.push(event);return {ok:true,event}}
 select(id){if(!this.guns.includes(id))return false;this.selected=id;return true}
}

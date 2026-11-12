export const MAX_LEVEL=5;
export const MATERIALS=Object.freeze({
 water:{name:'水',formula:'H₂O',color:'#77d9f5',label:'装填介质',atoms:{H:2,O:1},fact:'水可作冷却介质。这里装填水来改装枪，不发生化学反应。'},
 hydrogen:{name:'氢气',formula:'H₂',color:'#bac0ff',label:'可燃物',atoms:{H:2},fact:'氢气具有可燃性；燃烧需要氧化剂和点火条件。'},
 oxygen:{name:'氧气',formula:'O₂',color:'#9ce3b5',label:'氧化剂',atoms:{O:2},fact:'氧气支持燃烧，自身不是燃料；环境空气也含有氧气。'}
});
export const RECIPES=Object.freeze({
 water:{name:'水枪',family:'水系',tag:'装填改装',cost:{water:1},products:{},color:'#77d9f5',equation:null,effect:'提高攻击速度；单发伤害不变。',fact:'装填水是装备制造机制，不是化学反应。'},
 flame:{name:'氢燃烧枪',family:'燃烧系',tag:'燃烧试验',cost:{hydrogen:2,oxygen:1},products:{water:2},color:'#b9c5ff',equation:'2H₂ + O₂ → 2H₂O',effect:'命中附带持续灼烧；同系升级提高灼烧伤害。',fact:'氢气是燃料，氧气是氧化剂；炉内点火触发反应，氢焰通常呈淡蓝色。'}
});
export const emptyStock=()=>({water:0,hydrogen:0,oxygen:0});
export function atomTotals(stock){let out={H:0,O:0};for(const [id,n]of Object.entries(stock))for(const [a,v]of Object.entries(MATERIALS[id]?.atoms||{}))out[a]+=n*v;return out}

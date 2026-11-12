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
export const DROP_RATES=Object.freeze({standard:.18,high:.75});
export const BASE_ABILITIES=Object.freeze({maxHp:100,damage:18,attackSpeed:1,defense:0,speed:225,magnet:125,regen:0,crit:0});
export const ABILITIES=Object.freeze({
 health:{name:'更强体魄',stat:'maxHp',step:20,unit:'',description:'最大生命 +20，并恢复20生命',icon:'♥'},
 rate:{name:'快速装填',stat:'attackSpeed',step:.12,unit:'×',description:'全枪型基础攻速加成 +12%',icon:'ϟ'},
 damage:{name:'精准打击',stat:'damage',step:3,unit:'',description:'直接命中伤害 +3',icon:'✴'},
 defense:{name:'防护涂层',stat:'defense',step:.05,max:.6,unit:'%',description:'受到伤害减少5个百分点',icon:'⬡'},
 speed:{name:'轻盈步伐',stat:'speed',step:15,unit:'',description:'移动速度 +15',icon:'➜'},
 magnet:{name:'收集力场',stat:'magnet',step:25,unit:'',description:'拾取范围 +25',icon:'◇'},
 regen:{name:'自我修复',stat:'regen',step:.5,unit:'/s',description:'每秒恢复生命 +0.5',icon:'✚'},
 crit:{name:'弱点洞察',stat:'crit',step:.08,max:.8,unit:'%',description:'直接命中暴击率 +8%，暴击伤害2倍',icon:'⌖'}
});
export const ENEMY_TYPES=Object.freeze([
 {id:'acid',name:'酸雾团',hp:32,speed:55,r:18,diamonds:2,damage:4,behavior:'acid',description:'在近距离释放酸雾，持续威胁周围区域'},
 {id:'metal',name:'活泼金属小怪',hp:24,speed:95,r:13,diamonds:1,damage:9,behavior:'dash',description:'高速接近并短暂冲刺，生命较低'},
 {id:'crystal',name:'晶体甲壳兽',hp:90,speed:36,r:25,diamonds:5,damage:14,behavior:'shell',description:'厚血低速，半血后外壳破裂'},
 {id:'colloid',name:'胶体集群',hp:45,speed:57,r:22,diamonds:3,damage:8,behavior:'split',description:'击败后分裂成两个小型胶体'},
 {id:'reactor',name:'失控反应釜',hp:800,speed:28,r:44,diamonds:16,damage:22,behavior:'boss',description:'第二波出现；召唤样本、缺口冲击环、地面锁定爆发，低血过载'}
]);
export const DIFFICULTY=Object.freeze({healthPerWave:1.35,damagePerWave:1.2,bossHealth:800,ringWarning:1.2,zoneWarning:1.1,ringGapHalfAngle:.55});
export function waveScaling(wave){const level=Math.max(0,Math.floor(wave)-1);return {health:DIFFICULTY.healthPerWave**level,damage:DIFFICULTY.damagePerWave**level}}

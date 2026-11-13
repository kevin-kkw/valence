export const MAX_LEVEL=5;
export const ELEMENTS=Object.freeze({H:'氢',O:'氧',C:'碳',Na:'钠',Cl:'氯',Fe:'铁'});
export const MATERIALS=Object.freeze({
 water:{name:'水',formula:'H₂O',color:'#77d9f5',label:'装填介质',atoms:{H:2,O:1},fact:'水可作冷却介质。这里装填水来改装枪，不发生化学反应。'},
 hydrogen:{name:'氢气',formula:'H₂',color:'#bac0ff',label:'可燃物',atoms:{H:2},fact:'氢气具有可燃性；燃烧需要氧化剂和点火条件。'},
 oxygen:{name:'氧气',formula:'O₂',color:'#9ce3b5',label:'氧化剂',atoms:{O:2},fact:'氧气支持燃烧，自身不是燃料；环境空气也含有氧气。'},
 acid:{name:'盐酸',formula:'HCl(aq)',color:'#a6e66f',label:'酸性溶液',atoms:{H:1,Cl:1},fact:'盐酸是氯化氢的水溶液；HCl(aq)表示溶液中的溶质，不把整份溶液当成一个分子。腐蚀增伤是游戏状态，不代表酸能腐蚀所有物质。'},
 carbon_dioxide:{name:'二氧化碳',formula:'CO₂',color:'#d4eef1',label:'气体介质',atoms:{C:1,O:2},fact:'二氧化碳是由碳和氧组成的化合物。此处用枪械压缩模块产生推力，击退是游戏效果；本轮不加入灭火或属性克制。'},
 salt:{name:'氯化钠',formula:'NaCl',color:'#d6c6ff',label:'离子化合物',atoms:{Na:1,Cl:1},fact:'氯化钠是离子化合物，NaCl表示组成比。其水溶液能导电；电弧枪由枪械电源供电，盐水是导电介质。'},
 iron:{name:'铁',formula:'Fe',color:'#d0d8e6',label:'金属单质',atoms:{Fe:1},fact:'铁是金属单质，Fe是元素符号。磁轨由枪械供电并加速铁弹；贯穿与伤害是游戏规则，不是化学反应。'}
});
export const RECIPES=Object.freeze({
 water:{name:'水枪',family:'水系',tag:'装填改装',cost:{water:1},products:{},color:'#77d9f5',icon:'≋',displayFormula:'H₂O',assemblyText:'装填水 / 改装水枪模块',summary:'流动水柱 · 升级喷得更远',equation:null,effect:'提高攻击速度，枪等级越高水柱越远；单发伤害不变。',fact:'装填水是装备制造机制，不是化学反应。'},
 flame:{name:'氢燃烧枪',family:'燃烧系',tag:'燃烧试验',cost:{hydrogen:2,oxygen:1},products:{water:2},color:'#b9c5ff',icon:'♨',displayFormula:'H₂ + O₂',summary:'近距扇形 · 持续灼烧',equation:'2H₂ + O₂ → 2H₂O',effect:'近距宽扇形喷焰，可同时命中多目标并持续灼烧；同系升级增强喷射与灼烧。',fact:'氢气是燃料，氧气是氧化剂；炉内点火触发反应，氢焰通常呈淡蓝色。'},
 acid:{name:'酸液枪',family:'腐蚀系',tag:'溶液装填',cost:{acid:1},products:{},color:'#a6e66f',icon:'◌',displayFormula:'HCl(aq)',assemblyText:'装填盐酸 / 酸液模块',summary:'酸液弹 · 叠加腐蚀增伤',equation:null,effect:'酸液命中叠加最多3层腐蚀，暂时提高后续直接命中伤害；不是持续灼烧。',fact:'盐酸为氯化氢水溶液，装填不列化学反应式。腐蚀增伤是统一游戏状态，本轮没有按怪物材质设置酸克制。'},
 gas:{name:'二氧化碳气压枪',family:'气压系',tag:'压缩装配',cost:{carbon_dioxide:1},products:{},color:'#d4eef1',icon:'◉',displayFormula:'CO₂',assemblyText:'装配二氧化碳介质 / 压缩模块',summary:'短程扩散 · 击退多目标',equation:null,effect:'扩散气流同时击退多个近处目标；升级提高射程和击退力，Boss只受较弱击退。',fact:'压力由枪械压缩模块提供。击退属于游戏设计，不是二氧化碳发生了化学变化。'},
 electric:{name:'盐水电弧枪',family:'电弧系',tag:'溶解与装配',cost:{salt:1,water:1},products:{},color:'#d6b8ff',icon:'ϟ',displayFormula:'NaCl(aq)',assemblyText:'盐溶于水 / 装配枪械电源',summary:'连锁电弧 · 跳跃伤害',equation:null,effect:'电弧在附近不同目标间跳跃，逐次伤害降低；升级提高跳跃次数与距离。',fact:'氯化钠溶于水形成可导电溶液；枪械电源提供能量，盐水仅作为导电介质。此配方是溶解与装备装配，不列生成新物质的反应式。'},
 iron:{name:'铁弹枪',family:'磁轨系',tag:'磁轨改装',cost:{iron:2},products:{},color:'#d0d8e6',icon:'➤',displayFormula:'Fe',assemblyText:'装配铁弹 / 枪械供电磁轨',summary:'远程重击 · 有限贯穿',equation:null,effect:'射程长、射速低、单发重击，贯穿有限数量目标；同一颗弹不会重复命中同一目标。',fact:'铁是单质。装配和电磁加速属于装备机制；这里不声称发生了新的化学反应。'}
});
export const emptyStock=()=>Object.fromEntries(Object.keys(MATERIALS).map(id=>[id,0]));
export function atomTotals(stock){let out={H:0,O:0};for(const [id,n]of Object.entries(stock))for(const [a,v]of Object.entries(MATERIALS[id]?.atoms||{}))out[a]=(out[a]||0)+n*v;return out}
export const DROP_RATES=Object.freeze({standard:.18,high:.75});
export const BASE_ABILITIES=Object.freeze({maxHp:100,damage:18,attackSpeed:1,defense:0,speed:225,magnet:125,regen:0,crit:0});
export const ABILITIES=Object.freeze({
 health:{name:'更强体魄',stat:'maxHp',step:20,unit:'',description:'最大生命 +20，并恢复20生命',icon:'♥'},
 rate:{name:'快速装填',stat:'attackSpeed',step:.12,unit:'×',description:'全枪型基础攻速加成 +12%',icon:'ϟ'},
 damage:{name:'精准打击',stat:'damage',step:3,unit:'',description:'基础伤害 +3（枪型系数另计）',icon:'✴'},
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
 {id:'reactor',name:'失控反应釜',hp:800,speed:28,r:44,diamonds:16,damage:22,behavior:'boss',description:'第9关前哨Boss；召唤样本、缺口冲击环、地面锁定爆发，低血过载'},
 {id:'shooter',name:'磁性铁屑怪',hp:48,speed:28,r:17,diamonds:4,damage:12,behavior:'ranged',description:'停步蓄力，锁定方向发射可躲避金属弹'},
 {id:'core',name:'失控实验核心',hp:2400,speed:24,r:51,diamonds:30,damage:24,behavior:'boss',description:'最终Boss：缺口冲击、地面爆发、召唤与过载'}
]);
export const DIFFICULTY=Object.freeze({healthPerWave:1.35,damagePerWave:1.2,bossHealth:800,ringWarning:1.2,zoneWarning:1.1,ringGapHalfAngle:.55});
export function waveScaling(wave){const level=Math.max(0,Math.floor(wave)-1);return {health:DIFFICULTY.healthPerWave**level,damage:DIFFICULTY.damagePerWave**level}}
export const WEAPON_PROFILES=Object.freeze({
 normal:{range:600,rangePerLevel:0,halfAngle:0},water:{range:260,rangePerLevel:55,halfAngle:0},flame:{range:160,rangePerLevel:15,halfAngle:.45,anglePerLevel:.02},
 acid:{range:340,rangePerLevel:25,halfAngle:0,interval:.55,damageMultiplier:.75,corrosionStep:.08,corrosionPerLevel:.02},
 gas:{range:190,rangePerLevel:20,halfAngle:.55,anglePerLevel:.02,interval:.7,damageMultiplier:.55,knockback:65,knockbackPerLevel:10},
 electric:{range:250,rangePerLevel:20,halfAngle:0,interval:.65,damageMultiplier:.8,chainRange:110,chainRangePerLevel:5},
 iron:{range:640,rangePerLevel:30,halfAngle:0,interval:.85,damageMultiplier:1.8,damagePerLevel:.12,projectileSpeed:900}
});

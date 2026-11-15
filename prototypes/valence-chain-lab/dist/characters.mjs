import {BASE_ABILITIES} from './catalog.mjs';
const trait=(increases,decrease,weapon)=>Object.freeze({increases:Object.freeze(increases.map(Object.freeze)),decrease:Object.freeze(decrease),weapon:Object.freeze(weapon)});
export const CHARACTER_TRAITS=Object.freeze({
 daqi:trait([{stat:'maxHp',amount:20,label:'生命上限 +20'},{stat:'defense',amount:.05,label:'减伤 +5 个百分点'}],{stat:'speed',amount:-15,label:'移动速度 -15'},{type:'iron',multiplier:1.05,label:'铁弹枪伤害 +5%'}),
 johnny:trait([{stat:'attackSpeed',amount:.08,label:'攻击速度 +8%'},{stat:'crit',amount:.05,label:'暴击率 +5 个百分点'}],{stat:'maxHp',amount:-10,label:'生命上限 -10'},{type:'flame',multiplier:1.05,label:'氢燃烧枪直伤与灼烧 +5%'}),
 duoduo:trait([{stat:'speed',amount:15,label:'移动速度 +15'},{stat:'magnet',amount:25,label:'拾取范围 +25'}],{stat:'attackSpeed',amount:-.05,label:'攻击速度 -5%'},{type:'water',multiplier:1.05,label:'水枪伤害 +5%'})
});
export const CHARACTERS=Object.freeze({
 daqi:Object.freeze({id:'daqi',traits:CHARACTER_TRAITS.daqi,name:'大奇',profession:'材料工程师',gender:'male',age:17,specialty:'铁与金属材料 · 磁轨装备',color:'#e5b777',portraitPosition:'0% 24%',biography:'青年实验项目的材料组成员。大奇喜欢拆开旧设备，把还能使用的零件收进工具箱。他报名参加新型装备测试，想验证自己的材料笔记，也想弄明白 VELA 提供的那些陌生零件来自哪里。'}),
 johnny:Object.freeze({id:'johnny',traits:CHARACTER_TRAITS.johnny,name:'强尼',profession:'燃烧技师',gender:'male',age:17,specialty:'氢氧燃烧 · 灼烧与余热',color:'#e79e7f',portraitPosition:'50% 24%',biography:'青年实验项目的热能组成员。强尼总把护目镜挂在额头上，喜欢研究反应装置启动时细微的变化。听说这次能测试全新的便携装备，他第一个交了申请表，还认真记下了 VELA 的每一句测试提示。'}),
 duoduo:Object.freeze({id:'duoduo',traits:CHARACTER_TRAITS.duoduo,name:'朵朵',profession:'溶液研究员',gender:'female',age:17,specialty:'水与电解质 · 导电联动',color:'#93d4c5',portraitPosition:'100% 24%',biography:'青年实验项目的溶液组成员。朵朵的采样包上贴满手写标签，里面总留着一个空瓶。她把装备测试当作一次难得的现场观察：收集样本、核对记录，再把那些看似普通的小现象，拼成自己的发现。'})
});
export const CHARACTER_IDS=Object.freeze(Object.keys(CHARACTERS));
export const DEFAULT_CHARACTER='daqi';
export const isCharacterId=id=>typeof id==='string'&&Object.hasOwn(CHARACTERS,id);

export function applyCharacterTraits(abilities,id){
 const result={...abilities},traits=isCharacterId(id)?CHARACTER_TRAITS[id]:null;
 if(traits)for(const {stat,amount} of [...traits.increases,traits.decrease])result[stat]+=amount;
 result.defense=Math.min(.6,result.defense);result.crit=Math.min(.8,result.crit);return result;
}
export const characterBaseAbilities=id=>applyCharacterTraits(BASE_ABILITIES,id);
export const favoriteWeaponMultiplier=(id,gunType)=>isCharacterId(id)&&CHARACTER_TRAITS[id].weapon.type===gunType?CHARACTER_TRAITS[id].weapon.multiplier:1;

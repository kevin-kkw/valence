// Long-term knowledge and extracted relics only; combat equipment stays in each run.
export const MISSIONS={
 training:{id:'training',name:'装备测试',subtitle:'实验室 · 十关生存',description:'测试新型装备与反应组合。完成十关测试后开放外勤任务。',color:'#a6d9e5',relic:null,clue:null,bossName:'安全测试核心'},
 industrial:{id:'industrial',name:'化学工业城',subtitle:'外勤 · 恢复停机装置',description:'穿过排放管网，在定向泄漏中稳定失控设备。',color:'#e8b375',relic:{id:'ceramic-shell',name:'陶瓷隔离壳',description:'从恢复安全的反应装置中回收的独立封装部件。'},clue:{id:'isolated-encapsulation',title:'独立封装记录',text:'装置记录显示：异常沿相连部件扩散时，独立封装内的对照材料仍保持原状。隔离壳外侧有损伤，内侧检测没有变化。'},bossName:'工业失控反应装置'},
 mine:{id:'mine',name:'异质矿区',subtitle:'外勤 · 调查矿源异常',description:'避开裂开的晶簇与碎晶冲击，回收矿层中的采样设备。',color:'#af9eea',relic:{id:'conductive-crystal',name:'导电晶核',description:'从晶冠内部回收的传导组件，表面留着中断的连接纹路。'},clue:{id:'disconnected-network',title:'断开的传导纹路',text:'这片矿层的异常痕迹沿导电网络连续分布；脱离网络的碎片却保留了原有结构。记录中的差异，与晶体大小无关。'},bossName:'矿脉晶冠'},
 ecology:{id:'ecology',name:'封闭生态基地',subtitle:'外勤 · 恢复循环平衡',description:'在迁移的胶体覆盖中保持走位，清理被占据的循环核心。',color:'#93c9a0',relic:{id:'steady-capsule',name:'稳态胶囊',description:'从循环核心带回的稳态组件，保留了独立支路的历史记录。'},clue:{id:'stopped-branch',title:'停用支路的留样',text:'主循环的留样陆续发生异常。一条早已停用、与主循环隔开的支路中，原始样本仍完整保存。维护记录没有写下进一步的解释。'},bossName:'循环母体'},
 core:{id:'core',name:'微观核心',subtitle:'最终决战 · AI 核心修复',description:'三件遗物组成的维护钥匙激活了新的任务入口。进入后立即挑战被侵染的 AI。无时间限制，击败首领并回收核心，完成修复。',color:'#e9a0b8',relic:null,clue:null,bossName:'失联的实验助理'}
};
const empty=()=>({version:1,training:false,relics:[],clues:[],trueEnding:false,attempts:0});
const relicIds=Object.values(MISSIONS).flatMap(m=>m.relic?[m.relic.id]:[]),clueIds=Object.values(MISSIONS).flatMap(m=>m.clue?[m.clue.id]:[]);
const clone=data=>({...data,relics:[...data.relics],clues:[...data.clues]});
function validate(data){
 if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).sort().join(',')!==Object.keys(empty()).sort().join(','))return false;
 if(data.version!==1||typeof data.training!=='boolean'||typeof data.trueEnding!=='boolean'||!Number.isSafeInteger(data.attempts)||data.attempts<0)return false;
 for(const [key,ids] of [['relics',relicIds],['clues',clueIds]])if(!Array.isArray(data[key])||data[key].some(id=>!ids.includes(id))||new Set(data[key]).size!==data[key].length)return false;
 return (!data.relics.length||data.training)&&(!data.trueEnding||data.relics.length===3);
}
function browserStorage(){try{return globalThis.localStorage??null}catch{return null}}
export class CampaignProfile{
 constructor(storage=browserStorage(),key='valence.campaign.v5'){
  this.storage=storage;this.key=key;this._data=empty();this.storageAvailable=!!storage;
  if(storage){try{const raw=storage.getItem(key);if(raw!==null){const parsed=JSON.parse(raw);if(validate(parsed))this._data=clone(parsed)}}catch{/* Invalid saves never prevent play. */}this.persist()}
 }
 get data(){return clone(this._data)}
 get keyReady(){return this._data.relics.length===3}
 get aiStage(){return this._data.trueEnding?0:this._data.relics.length}
 unlocked(id){return Object.hasOwn(MISSIONS,id)&&(id==='training'||(id==='core'?this.keyReady:this._data.training))}
 persist(){if(!this.storage)return;try{this.storage.setItem(this.key,this.exportSave());this.storageAvailable=true}catch{this.storageAvailable=false}}
 discover(id){if(!clueIds.includes(id)||this._data.clues.includes(id))return false;this._data.clues.push(id);this.persist();return true}
 complete(id,{sample=false}={}){
  if(!this.unlocked(id))return null;
  this._data.attempts++;let outcome;
  if(id==='training'){this._data.training=true;outcome='trainingSuccess'}
  else if(id==='core'){outcome=sample?'trueEnding':'finalFailure';if(sample)this._data.trueEnding=true}
  else{const relic=MISSIONS[id].relic.id;if(!this._data.relics.includes(relic))this._data.relics.push(relic);outcome='missionSuccess'}
  this.persist();return outcome;
 }
 exportSave(){return JSON.stringify(this._data)}
 importSave(text){try{if(typeof text!=='string'||text.length>10000)return false;const parsed=JSON.parse(text);if(!validate(parsed))return false;this._data=clone(parsed);this.persist();return true}catch{return false}}
 reset(){this._data=empty();this.persist()}
}
export function aiMessage(stage){return ['我是实验助理 VELA。设备已就绪，我会记录你的实验结果。','外勤记录已接收。正在核对……正在核对。','记录……接收。请继……续。','ERROR // assistant signal unavailable'][Math.max(0,Math.min(3,Math.floor(stage)||0))]}

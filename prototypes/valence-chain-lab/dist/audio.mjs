// Small synthesized arcade effects. No downloads, audio assets, or game RNG use.
const tone=(from,to,duration,amp=.07,wave='sine',delay=0)=>({from,to,duration,amp,wave,delay});
const noise=(filter,from,to,duration,amp=.12,delay=0)=>({noise:true,filter,from,to,duration,amp,delay});
const cue=(parts,cooldown=.12,priority=false)=>({parts,cooldown,priority});
export const PROFILES={
 normal:cue([tone(320,100,.07,.06,'triangle'),noise('highpass',2000,800,.035,.055)],.075),
 water:cue([noise('bandpass',1600,650,.15,.16),tone(700,320,.07,.025)],.09),
 flame:cue([noise('lowpass',1600,260,.22,.2),tone(95,55,.17,.025,'sawtooth')],.14),
 acid:cue([tone(430,125,.12,.09),tone(780,260,.08,.04,'sine',.04),noise('bandpass',2700,900,.07,.06)],.12),
 gas:cue([noise('highpass',1300,180,.2,.18),tone(150,55,.14,.06,'triangle')],.14),
 electric:cue([tone(1300,260,.065,.045,'square'),noise('bandpass',4200,1600,.1,.1),tone(1800,700,.04,.025,'sawtooth',.05)],.12),
 iron:cue([tone(180,48,.16,.11,'triangle'),tone(2400,1100,.055,.035,'square'),noise('highpass',3500,1100,.055,.07)],.12),
 diamond:cue([tone(1300,1700,.055,.035)],.1),
 pickup:cue([tone(650,1000,.08,.05,'triangle'),tone(1100,1400,.07,.035,'sine',.06)],.13),
 gunPickup:cue([tone(440,660,.13),tone(660,880,.13,.07,'triangle',.09),tone(990,1100,.18,.05,'sine',.18)],.25,true),
 heal:cue([tone(520,660,.12,.06),tone(780,1040,.2,.05,'sine',.09)],.2,true),
 hurt:cue([tone(160,48,.17,.12,'triangle'),noise('lowpass',850,180,.12,.13)],.25,true),
 level:cue([tone(520,660,.1),tone(780,880,.14,.06,'sine',.09)],.3,true),
 evolve:cue([tone(330,660,.19,.07,'triangle'),tone(660,990,.2,.07,'triangle',.13),tone(1320,1760,.3,.05,'sine',.29)],.5,true),
 craft:cue([tone(360,720,.15,.055,'triangle'),tone(900,1100,.2,.055,'sine',.12)],.15,true),
 click:cue([tone(520,700,.045,.04,'triangle')],.05),
 start:cue([tone(220,440,.15,.06,'triangle'),tone(660,880,.2,.05,'sine',.12)],.3,true),
 warning:cue([tone(620,920,.13,.085,'triangle'),tone(620,920,.13,.085,'triangle',.19)],.55,true),
 boss:cue([tone(130,65,.5,.1,'sawtooth'),tone(260,130,.45,.045,'triangle',.1)],.7,true),
 transform:cue([noise('bandpass',400,3000,.45,.12),tone(180,720,.5,.07,'sawtooth')],.7,true),
 burst:cue([noise('bandpass',1800,500,.25,.15),tone(450,180,.17,.05)],.3),
 victory:cue([tone(523,523,.2,.07,'triangle'),tone(659,659,.2,.07,'triangle',.15),tone(784,784,.22,.07,'triangle',.3),tone(1047,1047,.6,.06,'sine',.45)],1,true),
 defeat:cue([tone(330,280,.23,.06,'triangle'),tone(247,200,.25,.06,'triangle',.2),tone(165,82,.5,.07,'sine',.43)],1,true)
};
const EVENT_SOUNDS={diamond:'diamond',pickup:'pickup',gunPickup:'gunPickup',lootQueued:'pickup',healthPickup:'heal',hurt:'hurt',level:'level',elite:'warning',boss:'boss',bossRing:'warning',bossZone:'warning',overdrive:'transform',finalTransform:'transform',condenserBurst:'burst'};
export class GameAudio{
 constructor({createContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)()}={}){this.createContext=createContext;this.enabled=true;this.context=null;this.master=null;this.voices=new Set();this.lastPlayed=new Map();this.previous=[];this.previousState='menu';this.previousTime=0;this.hazards=new WeakSet();this.dashing=new Set()}
 unlock(){if(!this.enabled)return;try{if(!this.context){this.context=this.createContext();const c=this.context;this.master=c.createGain();this.master.gain.value=.7;const compressor=c.createDynamicsCompressor();compressor.threshold.value=-16;compressor.knee.value=20;compressor.ratio.value=6;compressor.attack.value=.003;compressor.release.value=.15;this.master.connect(compressor);compressor.connect(c.destination);const buffer=c.createBuffer(1,c.sampleRate,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer}const promise=this.context.resume?.();promise?.catch?.(()=>{})}catch{this.context=null}}
 setEnabled(value){this.enabled=Boolean(value);if(!this.enabled)this.stop();if(this.master)this.master.gain.value=this.enabled?.7:0;if(this.enabled)this.unlock()}
 stop(){for(const voice of this.voices){try{voice.source.stop();voice.source.disconnect();voice.gain.disconnect();voice.filter?.disconnect()}catch{}}this.voices.clear();this.lastPlayed.clear()}
 play(id,key=id){const p=PROFILES[id],c=this.context;if(!this.enabled||!c||!p||(c.state==='suspended'&&!c.startRendering)||c.state==='closed')return false;const now=c.currentTime;if(now-(this.lastPlayed.get(key)??-Infinity)<p.cooldown)return false;const cap=p.priority?24:18;if(this.voices.size+p.parts.length>cap)return false;this.lastPlayed.set(key,now);try{for(const part of p.parts){const start=now+(part.delay||0),end=start+part.duration,source=part.noise?c.createBufferSource():c.createOscillator(),gain=c.createGain();let filter;if(part.noise){source.buffer=this.noiseBuffer;filter=c.createBiquadFilter();filter.type=part.filter;filter.Q.value=.8;filter.frequency.setValueAtTime(part.from,start);filter.frequency.exponentialRampToValueAtTime(part.to,end);source.connect(filter);filter.connect(gain)}else{source.type=part.wave;source.frequency.setValueAtTime(part.from,start);source.frequency.exponentialRampToValueAtTime(part.to,end);source.connect(gain)}gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(part.amp*2.2,start+.006);gain.gain.exponentialRampToValueAtTime(.0001,end);gain.connect(this.master);const voice={source,gain,filter};this.voices.add(voice);source.onended=()=>{this.voices.delete(voice);source.disconnect();gain.disconnect();filter?.disconnect()};source.start(start);source.stop(end+.01)}return true}catch{return false}}
 update(r){if(r.elapsed<this.previousTime){this.previous=[];this.hazards=new WeakSet();this.dashing.clear()}this.previousTime=r.elapsed;
  if(r.state!==this.previousState){if(this.previousState==='playing'||['paused','dead','won','menu'].includes(r.state))this.stop();if(r.state==='won')this.play('victory');if(r.state==='dead')this.play('defeat');this.previousState=r.state}
  const guns=(r.weapons||[]).map(w=>w.gun?{type:w.gun.type,rank:w.gun.rank||0}:null);let evolved=false;for(let i=0;i<guns.length;i++){const a=this.previous[i],b=guns[i];if(a&&b&&a.type===b.type&&[3,6].some(n=>a.rank<n&&b.rank>=n))evolved=true}this.previous=guns;
  if(evolved)this.play('evolve');const events=new Set(r.events||[]);for(const event of events){if(evolved&&event==='gunPickup')continue;const id=EVENT_SOUNDS[event];if(id)this.play(id)}
  if(r.state==='playing'&&events.has('shot'))for(const slot of r.weaponShots||[]){const type=guns[slot]?.type;if(type)this.play(type,'weapon-'+slot)}
  if(r.state==='playing'){const bosses=(r.enemies||[]).filter(e=>e.type===4||e.type===6),ids=new Set(bosses.map(e=>e.id));let warning=false;for(const h of r.hazards||[])if(!this.hazards.has(h)){this.hazards.add(h);if(ids.has(h.sourceId))warning=true}const dashing=new Set(bosses.filter(e=>e.dashWarning>0).map(e=>e.id));if([...dashing].some(id=>!this.dashing.has(id)))warning=true;this.dashing=dashing;if(warning)this.play('warning')}
 }
}

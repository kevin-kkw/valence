import {MATERIALS} from './catalog.mjs';
export function treatmentQuote(run,selection={}){
 const cost=run.wave+2,healing=Math.max(0,Math.min(5,run.abilities.maxHp-run.hp));
 if(!selection||typeof selection!=='object'||Array.isArray(selection))return {ok:false,reason:'selection',cost,healing,total:0};
 let total=0,valid=true;for(const [id,n]of Object.entries(selection)){if(!Object.hasOwn(MATERIALS,id)||!Number.isInteger(n)||n<0){valid=false;continue}total+=n;if(n>(run.lab.inventory[id]||0))valid=false}
 const reason=run.state!=='lab'?'phase':healing<=0?'full':!valid?'inventory':total!==cost?'quantity':null;
 return {ok:reason===null,reason,cost,healing,total,after:Math.min(run.abilities.maxHp,run.hp+healing)};
}
export function purchaseTreatment(run,selection){const quote=treatmentQuote(run,selection);if(!quote.ok)return quote;for(const [id,n]of Object.entries(selection))run.lab.inventory[id]-=n;const healed=run.heal(5);return {...quote,healed}}

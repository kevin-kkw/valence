import {BASE_ABILITIES} from './catalog.mjs';
// Character growth only: gun level and muzzle modifiers belong to primary attacks.
export const accessoryDamageScale=run=>run.legacy?1:run.abilities.damage/BASE_ABILITIES.damage;
export const accessoryRateScale=(run,limit=3)=>run.legacy?1:Math.min(limit,Math.max(1,run.abilities.attackSpeed));
export const waterChainCooldown=run=>.9/accessoryRateScale(run);

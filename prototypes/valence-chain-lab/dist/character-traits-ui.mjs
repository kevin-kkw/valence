import {CHARACTER_TRAITS} from './characters.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function characterTraitsHtml(id){const t=Object.hasOwn(CHARACTER_TRAITS,id)?CHARACTER_TRAITS[id]:null;if(!t)return '';return `<span class="character-traits" aria-label="人物属性差异">${t.increases.map(x=>`<span class="trait-increase">↑ ${esc(x.label)}</span>`).join('')}<span class="trait-decrease">↓ ${esc(t.decrease.label)}</span><strong class="trait-weapon">${esc(t.weapon.label)}</strong></span>`}

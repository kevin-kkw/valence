import {characterTraitsHtml} from './character-traits-ui.mjs';
import {CHARACTERS,CHARACTER_IDS,isCharacterId} from './characters.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderCharacterSelection({run,$,onConfirm,onCancel}){
 if(run.state!=='character')return;
 let selected=null;
 $('screenCard').innerHTML=`<section class="character-selection" role="dialog" aria-modal="true" aria-labelledby="characterSelectionTitle"><div class="character-selection-heading"><div><div class="eyebrow">YOUTH RESEARCH PROGRAM / 青年实验项目</div><h2 id="characterSelectionTitle">谁来参加这场<span>实验？</span></h2><p>选择本局角色，带着各自的好奇心，从装备测试出发。</p></div><span class="character-mode">${run.selectionQuick?'快速装备测试':'标准装备测试'} · 新一局</span></div><div class="character-cards" role="group" aria-label="选择本局角色">${CHARACTER_IDS.map(id=>{const c=CHARACTERS[id];return `<button type="button" class="character-choice" id="character-${id}" aria-pressed="false" aria-labelledby="character-${id}-name character-${id}-job" aria-describedby="character-${id}-specialty character-${id}-traits character-${id}-bio" style="--character-color:${esc(c.color)}"><span class="character-portrait" role="img" aria-label="${esc(c.name)}的角色肖像" style="background-position:${esc(c.portraitPosition)}"><span class="character-program" aria-hidden="true">YOUTH LAB / 17</span></span><span class="character-copy"><span class="character-identity"><strong id="character-${id}-name">${esc(c.name)}</strong><span class="character-choice-state" aria-hidden="true">选择角色</span></span><span class="character-job" id="character-${id}-job">${esc(c.profession)}</span><span class="character-specialty" id="character-${id}-specialty"><small>研究专长</small>${esc(c.specialty)}</span>${characterTraitsHtml(id).replace('<span class="character-traits"',`<span id="character-${id}-traits" class="character-traits"`)}<span class="character-biography" id="character-${id}-bio">${esc(c.biography)}</span></span></button>`}).join('')}</div><div class="character-selection-actions"><div><p id="characterSelectionStatus" role="status" aria-live="polite">请选择一位角色</p><small>本局各幕沿用同一角色。</small></div><button type="button" class="base-secondary" id="cancelCharacter">返回基地</button><button type="button" class="primary" id="confirmCharacter" disabled>确认角色，开始测试 <span aria-hidden="true">↗</span></button></div></section>`;
 $('confirmCharacter').disabled=true;
 for(const id of CHARACTER_IDS)$('character-'+id).onclick=()=>{
  if(run.state!=='character')return;
  selected=id;
  for(const other of CHARACTER_IDS){const button=$('character-'+other);button.setAttribute('aria-pressed',String(other===selected));button.classList.toggle('selected',other===selected)}
  $('characterSelectionStatus').textContent=`已选择 ${CHARACTERS[id].name} · ${CHARACTERS[id].profession}`;
  $('confirmCharacter').disabled=false;
 };
 $('confirmCharacter').onclick=()=>{if(run.state==='character'&&isCharacterId(selected))onConfirm(selected)};
 $('cancelCharacter').onclick=()=>{if(run.state==='character')onCancel()};
}

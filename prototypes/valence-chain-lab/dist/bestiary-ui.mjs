import {drawMapMonster} from './map-monster-visuals.mjs';
import {MAP_SPECIES} from './map-monsters.mjs';
export const MAP_TACTICS=Object.freeze({
 industrial:'机械推进、定向排放与压力释放。观察喷口和蓄压预警，换方向绕过火力。',
 mine:'晶体折射、碎裂与共振。留意硬壳开合和落晶标记，在晶阵间穿行。',
 ecology:'胶体分裂、孢子扩散与幼体繁殖。优先处理母体，给自己留出移动空间。'
});
export function bestiaryBriefing(map){const species=Object.hasOwn(MAP_SPECIES,map)?MAP_SPECIES[map]:null;if(!species)return '';return `<section class="bestiary-brief" aria-label="本区异常体"><div class="bestiary-caption"><b>本区异常体</b><small>8种专属怪物 · 前8关逐步出现</small></div><p>${MAP_TACTICS[map]}</p><div class="bestiary-grid">${species.map((s,i)=>`<div class="bestiary-chip" title="${s.description}"><canvas width="64" height="64" data-species-preview="${s.id}" aria-label="${s.name}"></canvas><span><small>第${i+1}关</small><b>${s.name}</b></span></div>`).join('')}</div></section>`}
export function bestiaryLog(map){const species=Object.hasOwn(MAP_SPECIES,map)?MAP_SPECIES[map]:null;if(!species)return '';return `<div class="log-entry local-bestiary"><h3>本区异常体 · 独立生态</h3><p>${MAP_TACTICS[map]}</p>${species.map((s,i)=>`<div class="bestiary-record"><canvas width="96" height="96" data-species-preview="${s.id}" aria-label="${s.name}"></canvas><div><strong>${s.name}</strong><small>第${i+1}关起出现${[3,5,7].includes(i+1)?' · 本关有强化精英':''}</small><p>${s.description}</p></div></div>`).join('')}<p>这些是受化学与场景启发的虚构异常体；战斗能力不代表现实物质的全部性质。</p></div>`}

export function paintBestiaryPreviews(root,map){const list=Object.hasOwn(MAP_SPECIES,map)?MAP_SPECIES[map]:null;if(!list||!root?.querySelectorAll)return;for(const canvas of root.querySelectorAll('[data-species-preview]')){const index=list.findIndex(s=>s.id===canvas.dataset?.speciesPreview);if(index<0)continue;const def=list[index],c=canvas.getContext('2d');if(!c)continue;c.save();c.clearRect(0,0,canvas.width,canvas.height);c.translate(canvas.width/2,canvas.height/2);c.scale(canvas.width/75,canvas.height/75);drawMapMonster(c,{id:index+1,speciesId:def.id,speciesMap:map,speciesIndex:index,displayName:def.name,r:18,hp:def.hp,maxHp:def.hp,flash:0,age:0,mapAction:'idle'},1.2);c.restore()}}

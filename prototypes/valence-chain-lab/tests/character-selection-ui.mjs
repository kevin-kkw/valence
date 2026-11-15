import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHARACTERS,CHARACTER_IDS} from '../dist/characters.mjs';
import {renderCharacterSelection} from '../dist/character-selection.mjs';
const elements=new Map();
const $=id=>{if(!elements.has(id)){const classes=new Set();elements.set(id,{innerHTML:'',textContent:'',disabled:false,attributes:{},classList:{toggle(name,on){on?classes.add(name):classes.delete(name)},contains:name=>classes.has(name)},setAttribute(name,value){this.attributes[name]=value}})}return elements.get(id)};
const run={state:'character',selectionQuick:false};let confirmed=[],cancelled=0;
const render=()=>renderCharacterSelection({run,$,onConfirm:id=>confirmed.push(id),onCancel:()=>cancelled++});
render();
assert.equal($('confirmCharacter').disabled,true);
$('confirmCharacter').onclick();assert.deepEqual(confirmed,[]);
for(const id of CHARACTER_IDS){const c=CHARACTERS[id],html=$('screenCard').innerHTML;assert.ok(html.includes(`id="character-${id}"`));for(const text of [c.name,c.profession,c.specialty,c.biography,c.portraitPosition])assert.ok(html.includes(text),text);assert.ok(html.includes(`aria-label="${c.name}的角色肖像"`));assert.ok(html.includes(`aria-labelledby="character-${id}-name character-${id}-job"`));}
assert.equal(($('screenCard').innerHTML.match(/aria-pressed="false"/g)||[]).length,3);
assert.equal(($('screenCard').innerHTML.match(/class="trait-increase"/g)||[]).length,6);assert.equal(($('screenCard').innerHTML.match(/class="trait-decrease"/g)||[]).length,3);assert.match($('screenCard').innerHTML,/氢燃烧枪直伤与灼烧 \+5%/);
for(const id of CHARACTER_IDS){$('character-'+id).onclick();assert.equal($('confirmCharacter').disabled,false);for(const other of CHARACTER_IDS){assert.equal($('character-'+other).attributes['aria-pressed'],String(other===id));assert.equal($('character-'+other).classList.contains('selected'),other===id)}$('confirmCharacter').onclick();assert.equal(confirmed.at(-1),id);}
$('cancelCharacter').onclick();assert.equal(cancelled,1);
assert.equal(run.state,'character');assert.equal(run.characterId,undefined);
render();assert.equal($('confirmCharacter').disabled,true);$('confirmCharacter').onclick();assert.equal(confirmed.length,3);
run.selectionQuick=true;render();assert.match($('screenCard').innerHTML,/快速装备测试/);
run.state='playing';$('character-daqi').onclick();$('confirmCharacter').onclick();$('cancelCharacter').onclick();assert.equal(confirmed.length,3);assert.equal(cancelled,1);
const previous=$('screenCard').innerHTML;render();assert.equal($('screenCard').innerHTML,previous);
const css=await readFile(new URL('../dist/style.css',import.meta.url),'utf8');
for(const rule of [/html:has\(.character-screen\)/,/\.field-panel:has\(.character-screen\)/,/\.screen-overlay\.character-screen\{[^}]*position:fixed[^}]*overflow-y:auto/,/\.character-cards\{[^}]*repeat\(3,minmax\(0,1fr\)\)/,/@media\(max-width:760px\)\{[^]*?\.character-cards\{grid-template-columns:1fr/,/\.character-portrait\{[^}]*background-color:[^}]*background-image:url\('assets\/characters.webp'\)[^}]*background-size:300% auto/,/\.character-choice:focus-visible\{[^}]*outline:3px solid/,/\.character-choice\.selected/])assert.match(css,rule);
console.log('Character selection UI PASS: all metadata, explicit single choice, confirm/cancel guards, fresh mount, quick label, accessible portraits, responsive/fullscreen/fallback CSS. DOM mock; actual geometry requires separate browser verification.');

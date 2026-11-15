import assert from 'node:assert/strict';
import {CampaignShell} from '../dist/campaign-shell.mjs';
import {CampaignProfile} from '../dist/progression.mjs';
import {MissionRun} from '../dist/mission-run.mjs';
const profile=new CampaignProfile(null),run=new MissionRun(()=>.9,profile),elements=new Map();
const $=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id)};
const card={innerHTML:''},shell=new CampaignShell({run,profile,$,soundEnabled:()=>true});
for(const active of [false,true]){
 if(active){run.startNewRun({characterId:'daqi'});run.completedMissions=['training'];run.state='menu'}
 shell.renderBase(card);
 assert.doesNotMatch(card.innerHTML,/id="base(?:Brand|Sound|Archive)"/,'base must share the global brand, sound and archive controls');
 assert.doesNotMatch(card.innerHTML,/V5\./,'version belongs in the global header');
 assert.match(card.innerHTML,/id="manageSave"/,'save management remains reachable');
 assert.equal(typeof $('manageSave').onclick,'function');
 assert.match(card.innerHTML,/id="equipmentTest"/);
}
console.log('Base header PASS: fresh and continuing runs share one header; save and debug remain reachable.');

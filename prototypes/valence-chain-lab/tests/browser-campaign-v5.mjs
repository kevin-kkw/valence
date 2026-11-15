import {mkdir,writeFile} from 'node:fs/promises';
const [cdpBase,gameUrl,screenshotDir]=process.argv.slice(2);if(!cdpBase||!gameUrl)throw Error('Usage: node tests/browser-loot-layout.mjs <CDP base URL> <game URL>');
const tabs=await (await fetch(cdpBase+'/json')).json(),tab=tabs.find(t=>t.type==='page');
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let n=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const p=JSON.parse(e.data);if(p.id){const entry=pending.get(p.id);pending.delete(p.id);p.error?entry.reject(p.error):entry.resolve(p.result)}if(p.method==='Runtime.exceptionThrown')errors.push(p.params.exceptionDetails.text+' '+p.params.exceptionDetails.exception?.description)};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1365,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:gameUrl});await new Promise(r=>setTimeout(r,2500));
const evalJS=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};

try{
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const load=async()=>{await pause(1000);await evalJS(`(async()=>{const m=await import(document.querySelector('script[type=module]').src);globalThis.__campaignApp=m})()`)};
 const check=async(c,label)=>{if(!await evalJS(c))throw Error(label)};
 const click=async id=>{await evalJS(`{const b=document.getElementById('${id}');if(!b||b.disabled)throw Error('Unavailable ${id}');b.click()}`);await pause(80)};
 const snap=async name=>{if(!screenshotDir)return;await mkdir(screenshotDir,{recursive:true});const s=await call('Page.captureScreenshot',{format:'png'});await writeFile(screenshotDir+'/'+name+'.png',Buffer.from(s.data,'base64'))};
 await load();await evalJS(`__campaignApp.run.clearArchive()`);await call('Page.reload');await load();
 await check(`!document.querySelector('#mission-core')`,'Core initially hidden');await click('startQuick');
 await evalJS(`{const r=__campaignApp.run;r.spawn=999;r.shot=999;r.pickupGun('flame');r.pickupGun('water');r.weapons[0].gun.level=4;r.weapons[0].gun.rank=6;r.attachments=['heat','condenser'];r.muzzle='fork';r.saveWeapon();r.weapons[1].attachments=['freeze','hydrogen'];r.weapons[1].muzzle='focus';r.weapons[1].gun.level=3;r.weapons[1].gun.rank=3;r.lab.inventory.iron=7;r.lab.furnace.water=2;r.abilities.damage=21;r.abilities.maxHp=120;r.hp=43;r.xp=5;r.level=2;r.diamonds=19}`);
 const build=`(()=>{const r=__campaignApp.run;return JSON.stringify({weapons:r.weapons.map(w=>({gun:w.gun,attachments:w.attachments,muzzle:w.muzzle})),hp:r.hp,materials:Object.fromEntries(Object.keys(r.lab.inventory).map(k=>[k,r.lab.inventory[k]+r.lab.furnace[k]])),abilities:r.abilities,xp:r.xp,level:r.level,diamonds:r.diamonds})})()`;
 const savedBuild=await evalJS(build);
 async function win(){await evalJS(`{const r=__campaignApp.run;r.enemies=[];r.drops=[];r.spawn=999;r.shot=999;r.wave=5;r.endWave();while(r.state==='upgrade')r.chooseAbility(r.upgradeChoices.find(id=>id!=='health'));while(r.state==='reward')r.chooseReward(r.rewardChoices[0],{weapon:0,slot:0});if(r.state==='lab')r.nextWave();r.wave=10;r.hit(r.spawnEnemy(6,600,100,{special:true,hp:1,maxHp:1}),1e9)}`);await pause(80)}
 async function base(){await click('back');await check(`__campaignApp.run.state==='menu'&&__campaignApp.run.runActive`,'Return to continuing run');if(await evalJS(build)!==savedBuild)throw Error('Build changed between acts '+JSON.stringify({before:JSON.parse(savedBuild),after:JSON.parse(await evalJS(build))}));}
 await win();await base();await check(`__campaignApp.profile.data.training&&__campaignApp.run.attackMultiplier===100`,'Training complete');await snap('01-carry-base');
 const save=await evalJS(`__campaignApp.run.exportArchive()`);await call('Page.reload');await load();await check(`__campaignApp.run.runActive&&__campaignApp.run.quick`,'Reload active quick run');if(await evalJS(build)!==savedBuild)throw Error('Reload lost carried build');
 for(const [i,id]of ['industrial','mine','ecology'].entries()){
  await click('mission-'+id);await click('deployMission');await check(`__campaignApp.run.missionId==='${id}'&&__campaignApp.run.attackMultiplier===1`,'Act launch');
  await evalJS(`{const r=__campaignApp.run;r.spawn=999;r.shot=999;r.state='paused'}`);if(await evalJS(build)!==savedBuild)throw Error('Departure reset build '+id);await snap('02-world-'+id);
  await evalJS(`__campaignApp.run.state='playing'`);await win();await check(`__campaignApp.run.missionOutcome==='missionSuccess'&&__campaignApp.profile.data.relics.length===${i+1}`,'Relic success');await base();await check(`document.querySelector('#mission-${id}').disabled`,'Completed act cannot repeat');if(i<2)await check(`!document.querySelector('#mission-core')`,'Premature core');
 }
 await check(`!!document.querySelector('#mission-core')`,'Core unlock');await snap('03-key');const coreSave=await evalJS(`__campaignApp.run.exportArchive()`);
 await click('mission-core');await click('deployMission');await win();await check(`__campaignApp.run.missionOutcome==='finalFailure'&&!__campaignApp.run.runActive`,'Final failure ends run');await snap('04-failure');
 await click('restart');await check(`__campaignApp.run.missionId==='training'&&__campaignApp.run.hp===100&&__campaignApp.run.weapons[0].gun.type==='normal'&&__campaignApp.run.weapons[1].gun===null`,'Fresh run reset only after end');
 await evalJS(`__campaignApp.run.importArchive(${JSON.stringify(coreSave)})`);await call('Page.reload');await load();await click('mission-core');await click('deployMission');await evalJS(`{const r=__campaignApp.run;r.spawn=999;r.shot=999;r.x=110;r.y=660}`);await pause(80);await check(`__campaignApp.run.sampleRecovered`,'Hidden sample');await win();await check(`__campaignApp.run.missionOutcome==='trueEnding'&&!__campaignApp.run.runActive&&__campaignApp.profile.data.trueEnding`,'True ending');await snap('05-ending');
 await click('back');await check(`!!document.querySelector('#start')&&!document.querySelector('#mission-core')`,'Next run needs training');
 await evalJS(`__campaignApp.run.importArchive(${JSON.stringify(save)})`);await call('Page.reload');await load();await click('mission-industrial');await click('deployMission');await evalJS(`{const r=__campaignApp.run;r.hp=0;r.step(.01)}`);await pause(80);await check(`!__campaignApp.run.runActive&&__campaignApp.run.missionOutcome==='lost'&&__campaignApp.profile.data.relics.length===0`,'Death ends run without banking');await click('back');
 if(errors.length)throw Error(errors.join('\n'));console.log('Campaign browser PASS: continuous build/HP/materials, quick boost isolation, reload, all field successes, unlock, death, finale failure and true ending.');
}finally{ws.close()}

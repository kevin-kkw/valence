import {mkdir,writeFile} from 'node:fs/promises';
const [cdpBase,gameUrl,screenshotDir]=process.argv.slice(2);if(!cdpBase||!gameUrl)throw Error('Usage: node tests/browser-loot-layout.mjs <CDP base URL> <game URL>');
const tabs=await (await fetch(cdpBase+'/json')).json(),tab=tabs.find(t=>t.type==='page');
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let n=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const p=JSON.parse(e.data);if(p.id){const entry=pending.get(p.id);pending.delete(p.id);p.error?entry.reject(p.error):entry.resolve(p.result)}if(p.method==='Runtime.exceptionThrown')errors.push(p.params.exceptionDetails.text+' '+p.params.exceptionDetails.exception?.description)};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1365,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:gameUrl});await new Promise(r=>setTimeout(r,2500));
const evalJS=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};

try{
 const reports=[];const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const rectScript=`(()=>{const rect=id=>{const q=document.querySelector(id).getBoundingClientRect();return [q.x,q.y,q.width,q.height].map(n=>Math.round(n*100)/100)};return {canvas:rect('#arena'),stage:rect('#stage'),field:rect('.field-panel')}})()`;
 for(const [width,height]of [[1365,900],[1280,720],[390,844]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await call('Page.navigate',{url:new URL('/VALENCE-baseline-v4.11.html',gameUrl).href});await pause(1100);await evalJS(`(async()=>{for(let i=0;i<200;i++){const b=document.querySelector('#start');if(b){b.click();return}await new Promise(r=>setTimeout(r,50))}throw Error('No start')})()`);await pause(80);const original=await evalJS(rectScript);
  await call('Page.navigate',{url:gameUrl});await pause(1100);await evalJS(`(async()=>{const {run}=await import(document.querySelector('script[type=module]').src);run.clearArchive()})()`);await call('Page.reload');await pause(1100);await evalJS(`(async()=>{for(let i=0;i<200;i++){const b=document.querySelector('#start');if(b){b.click();return}await new Promise(r=>setTimeout(r,50))}throw Error('No start')})()`);await pause(80);
  for(const id of ['training','industrial','mine','ecology','core']){if(id!=='training')await evalJS(`(async()=>{const {run:r,profile:p}=await import(document.querySelector('script[type=module]').src);r.enemies=[];r.wave=10;r.hit(r.spawnEnemy(6,600,100,{special:true,hp:1,maxHp:1}),1e9);r.returnToBase();while(r.state==='upgrade')r.chooseAbility(r.upgradeChoices[0]);while(r.state==='reward')r.chooseReward(r.rewardChoices[0],{weapon:0,slot:0});if('${id}'==='core')for(const x of ['industrial','mine','ecology'])p.complete(x);if(!r.startMission('${id}'))throw Error('Failed test launch ${id}');r.state='paused'})()`);await pause(100);const current=await evalJS(rectScript);if(JSON.stringify(current)!==JSON.stringify(original))throw Error(id+' geometry differs at '+width+': '+JSON.stringify({original,current}));reports.push({width,height,map:id,canvas:current.canvas})}
 }
 if(errors.length)throw Error(errors.join('\n'));console.log('ALL maps V4.11 geometry PASS',JSON.stringify(reports));
}finally{ws.close()}

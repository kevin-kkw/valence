import {mkdir,writeFile} from 'node:fs/promises';
const [cdpBase,gameUrl,screenshotDir]=process.argv.slice(2);if(!cdpBase||!gameUrl)throw Error('Usage: node tests/browser-loot-layout.mjs <CDP base URL> <game URL>');
const tabs=await (await fetch(cdpBase+'/json')).json(),tab=tabs.find(t=>t.type==='page');
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let n=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const p=JSON.parse(e.data);if(p.id){const entry=pending.get(p.id);pending.delete(p.id);p.error?entry.reject(p.error):entry.resolve(p.result)}if(p.method==='Runtime.exceptionThrown')errors.push(p.params.exceptionDetails.text+' '+p.params.exceptionDetails.exception?.description)};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1365,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:gameUrl});await new Promise(r=>setTimeout(r,2500));
const evalJS=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};

try{
 const report=await evalJS(`(async()=>{const {run:r}=await import(document.querySelector('script[type=module]').src);r.clearArchive();r.startNewRun();r.pickupGun('water');r.muzzle='fork';r.saveWeapon();r.spawn=999;r.shot=0;const e=r.spawnEnemy(2,r.x+230,r.y,{hp:9999,maxHp:9999,speed:0,r:12});r.fireWeapons(.02,{left:22,top:22,right:1178,bottom:778});const angles=r.bullets.map(b=>Math.atan2(b.vy,b.vx));for(let i=0;i<35;i++)r.step(.02);r.state='paused';return {angles,hp:e.hp,damage:9999-e.hp,gun:r.lab.gun,muzzle:r.muzzle}})()`);if(report.angles.length!==2||Math.abs(report.angles[0])>1e-8||report.damage<=0)throw Error(JSON.stringify(report));if(errors.length)throw Error(errors.join('\n'));console.log('Water fork browser PASS',JSON.stringify(report));
}finally{ws.close()}

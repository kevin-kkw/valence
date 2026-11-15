import {mkdir,writeFile} from 'node:fs/promises';
const [cdpBase,gameUrl,screenshotDir]=process.argv.slice(2);if(!cdpBase||!gameUrl)throw Error('Usage: node tests/browser-loot-layout.mjs <CDP base URL> <game URL>');
const tabs=await (await fetch(cdpBase+'/json')).json(),tab=tabs.find(t=>t.type==='page');
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let n=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const p=JSON.parse(e.data);if(p.id){const entry=pending.get(p.id);pending.delete(p.id);p.error?entry.reject(p.error):entry.resolve(p.result)}if(p.method==='Runtime.exceptionThrown')errors.push(p.params.exceptionDetails.text+' '+p.params.exceptionDetails.exception?.description)};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1365,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:gameUrl});await new Promise(r=>setTimeout(r,2500));
const evalJS=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};

try{
 const reports=[];
 for(const [width,height]of [[1365,900],[1280,720],[390,844]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});const views=[];
  for(const url of [new URL('/VALENCE-baseline-v4.11.html',gameUrl).href,gameUrl]){await call('Page.navigate',{url});await new Promise(r=>setTimeout(r,1100));await evalJS(`(async()=>{for(let i=0;i<120;i++){const b=document.querySelector('#start');if(b){b.click();return}await new Promise(r=>setTimeout(r,50))}throw Error('Start button unavailable: '+location.href)})()`);await new Promise(r=>setTimeout(r,60));views.push(await evalJS(`(async()=>{const {run}=await import(document.querySelector('script[type=module]').src);run.enemies=[];run.bullets=[];run.drops=[];run.state='paused';run.spawn=999;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const canvas=document.querySelector('#arena'),c=canvas.getContext('2d');const rect=id=>{const q=document.querySelector(id).getBoundingClientRect();return [q.x,q.y,q.width,q.height].map(n=>Math.round(n*100)/100)};const pixel=(x,y)=>[...c.getImageData(Math.round(canvas.width*x),Math.round(canvas.height*y),1,1).data];return {canvas:rect('#arena'),stage:rect('#stage'),field:rect('.field-panel'),pixels:[[.15,.2],[.7,.4],[.25,.75]].map(([x,y])=>pixel(x,y))}})()`))}
  if(JSON.stringify(views[0])!==JSON.stringify(views[1]))throw Error('Training changed at '+width+': '+JSON.stringify(views));reports.push({width,height,matched:true,canvas:views[0].canvas})
 }
 console.log('Original training appearance and canvas dimensions PASS',JSON.stringify(reports));if(errors.length)throw Error(errors.join('\n'));
}finally{ws.close()}

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
 await evalJS(`(async()=>{globalThis.app=await import(document.querySelector('script[type=module]').src);app.run.clearArchive();app.run.endCurrentRun()})()`);await pause(100);
 for(const [width,height]of [[1280,837],[1052,1280],[1024,600],[768,1024],[390,844],[320,568]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});
  for(const state of ['menu','character']){
   await evalJS(`{app.run.endCurrentRun();if('${state}'==='character')app.run.beginCharacterSelection()}`);await pause(120);
   const result=await evalJS(`(()=>{const side=document.querySelector('.sidebar'),overlay=document.querySelector('#screenOverlay'),r=overlay.getBoundingClientRect(),field=document.querySelector('.field-panel').getBoundingClientRect();return {side:getComputedStyle(side).display,width:innerWidth,scroll:document.documentElement.scrollWidth,left:r.left,right:r.right,fieldWidth:field.width,overlayWidth:r.width,bottom:r.bottom,fieldBottom:field.bottom,footerTop:document.querySelector('main>footer').getBoundingClientRect().top,position:getComputedStyle(overlay).position}})()`);
   if(result.side!=='none'||result.scroll>width+1||result.left<0||result.right>width+1||Math.abs(result.fieldWidth-result.overlayWidth)>3||result.position!=='relative'||result.fieldBottom<result.bottom-1||result.footerTop<result.bottom-1)throw Error(state+' '+JSON.stringify(result));
   const target=state==='character'?'#confirmCharacter':'.task-card:last-child';await evalJS(`document.querySelector('${target}').scrollIntoView({block:'center'})`);await pause(60);
   if(!await evalJS(`(()=>{const e=document.querySelector('${target}'),r=e.getBoundingClientRect(),x=Math.max(r.left+3,Math.min(r.right-3,innerWidth/2)),y=Math.max(r.top+3,Math.min(r.bottom-3,innerHeight/2));return e.contains(document.elementFromPoint(x,y))})()`))throw Error('Occluded '+state+' '+width);
   if(screenshotDir){await mkdir(screenshotDir,{recursive:true});const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(screenshotDir+'/'+state+'-'+width+'.png',Buffer.from(shot.data,'base64'))}
  }
 }
 await evalJS(`{app.run.startNewRun({characterId:'daqi'});app.run.spawn=Infinity}`);await pause(120);
 if(!await evalJS(`getComputedStyle(document.querySelector('.sidebar')).display!=='none'&&!document.documentElement.classList.contains('selection-layout')`))throw Error('Battle sidebar not restored');
 if(errors.length)throw Error(errors.join('\n'));console.log('Selection layout browser PASS: 6 viewports, base/character sidebar hidden, full width, no clipping, controls hit-test, battle sidebar restored.');
}finally{ws.close()}

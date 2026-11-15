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
 await evalJS(`(async()=>{globalThis.app=await import(document.querySelector('script[type=module]').src);app.run.clearArchive()})()`);
 let cases=0;
 for(const [width,height]of [[1920,1080],[1052,1280],[1280,720],[390,844],[320,568],[844,390]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});
  for(const mode of ['menu','activeBase','character','reward','upgrade','playing']){
   await evalJS(`app.run.endCurrentRun()`);await pause(40);
   await evalJS(`{const r=app.run;if('${mode}'==='character')r.beginCharacterSelection();else if('${mode}'!=='menu'){r.startNewRun({characterId:'daqi'});r.spawn=Infinity;r.shot=Infinity;r.enemies=[];if('${mode}'==='activeBase'){r.completedMissions=['training'];r.state='menu'}else if('${mode}'==='reward'){r.rewardKind='accessory';r.rewardChoices=['heat','conductive','expansion'];r.state='reward'}else if('${mode}'==='upgrade'){r.upgradeChoices=['health','speed','dodge'];r.state='upgrade'}}}`);await pause(65);await evalJS('scrollTo(0,0)');
   const report=await evalJS(`({headers:document.querySelectorAll('.header').length,logos:document.querySelectorAll('.logo,.base-brand').length,sound:document.querySelectorAll('#sound,#baseSound').length,archive:document.querySelectorAll('#openArchive,#baseArchive').length,versions:document.querySelectorAll('.prototype').length,baseVersion:document.querySelector('.base-footer')?.innerText.match(/V5\./),doc:document.documentElement.scrollWidth,w:innerWidth})`);
   if(report.headers!==1||report.logos!==1||report.sound!==1||report.archive!==1||report.versions!==1||report.baseVersion||report.doc>report.w+1)throw Error(mode+' '+JSON.stringify(report));
   const before=await evalJS(`document.querySelector('#sound').getAttribute('aria-pressed')`);await evalJS(`document.querySelector('#sound').click()`);if(await evalJS(`document.querySelector('#sound').getAttribute('aria-pressed')`)===before)throw Error('Sound toggle');await evalJS(`document.querySelector('#sound').click();document.querySelector('#openArchive').click()`);await pause(35);if(!await evalJS(`!document.querySelector('#dialogOverlay').classList.contains('hidden')&&!!document.querySelector('#closeArchive')`))throw Error('Archive unavailable');await evalJS(`document.querySelector('#closeArchive').click()`);await pause(35);
   if(['menu','activeBase'].includes(mode)){await evalJS(`document.querySelector('#manageSave').scrollIntoView({block:'center'});document.querySelector('#manageSave').click()`);await pause(35);if(!await evalJS(`!!document.querySelector('#saveExport')&&!!document.querySelector('#closeSave')`))throw Error('Save unavailable');await evalJS(`document.querySelector('#closeSave').click()`)}
   if(screenshotDir&&width===1052&&['menu','activeBase'].includes(mode)){await evalJS('scrollTo(0,0)');await mkdir(screenshotDir,{recursive:true});const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(screenshotDir+'/'+mode+'.png',Buffer.from(shot.data,'base64'))}cases++;
  }
 }
 if(errors.length)throw Error(errors.join('\n'));console.log('Shared header browser PASS',JSON.stringify({cases,viewports:6,oneLogo:true,oneSound:true,oneArchive:true,oneVersion:true,soundArchiveSaveWorking:true}));
}finally{ws.close()}

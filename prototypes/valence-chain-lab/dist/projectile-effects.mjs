// Deterministic, presentation-only geometry. Damage lives in model.mjs.
export function projectileVisual(b,time){
 const kind=b.type||'normal',angle=b.angle??Math.atan2(b.vy||0,b.vx||1);let x=b.originX??b.x-(b.vx||0)*.09,y=b.originY??b.y-(b.vy||0)*.09;
 let length=b.visual==='cone'?b.length:Math.hypot(b.x-x,b.y-y);if(kind==='normal'){length=Math.min(16,length);x=b.x-Math.cos(angle)*length;y=b.y-Math.sin(angle)*length}
 const phase=time*24+x*.03+y*.02,width=kind==='flame'?(b.visual==='cone'?Math.tan(b.halfAngle)*length*2:32):kind==='water'?9:4;
 const droplets=kind==='water'?Array.from({length:9},(_,i)=>({x:((i/9+time*2.4)%1)*length,y:Math.sin(phase+i*2)*3,r:1.3+i%3*.4})):[];
 const tongues=kind==='flame'?Array.from({length:9},(_,i)=>{let u=.2+i/11;return {x:length*u,y:Math.sin(phase+i*2.7)*width*u*.32,length:12+Math.sin(phase*.8+i)*6+i*1.2,width:3+i*.5}}):[];
 const halfAngle=b.halfAngle??.45,envelope=kind==='flame'?[[0,0],...Array.from({length:17},(_,i)=>{const a=-halfAngle+i/16*halfAngle*2,r=length*(.94+.06*Math.sin(phase+i*1.7));return [Math.cos(a)*r,Math.sin(a)*r]})]:[];
 const wisps=kind==='flame'?Array.from({length:32},(_,i)=>{const u=.12+((i*.6180339+time*1.8)%1)*.86,a=halfAngle*Math.sin(i*2.4+time*3)*.86;return {x:Math.cos(a)*length*u,y:Math.sin(a)*length*u,length:14+u*25,width:3+u*10,phase:phase+i*2.1,u}}):[];
 return {wisps,envelope,halfAngle,kind,x,y,angle,length:Math.max(0,length),width,phase,droplets,tongues,alpha:b.visual==='cone'?Math.min(1,b.life/Math.max(.05,b.duration)*2.8):1};
}
export function drawProjectile(c,b,time){const v=projectileVisual(b,time);if(v.length<1)return;c.save();c.translate(v.x,v.y);c.rotate(v.angle);c.globalAlpha=v.alpha;c.lineCap='round';
 if(v.kind==='water'){
  // A connected pressurised column, with a rippled edge and moving highlights.
  const path=()=>{c.beginPath();c.moveTo(0,0);c.bezierCurveTo(v.length*.3,Math.sin(v.phase)*2,v.length*.7,Math.sin(v.phase+2)*3,v.length,0)};
  path();c.strokeStyle='#45bde555';c.lineWidth=16;c.stroke();path();c.strokeStyle='#6ed9efaa';c.lineWidth=9;c.stroke();path();c.strokeStyle='#d2f9ffcc';c.lineWidth=3;c.stroke();
  for(const d of v.droplets){c.beginPath();c.ellipse(d.x,d.y,d.r*2,d.r,0,0,Math.PI*2);c.fillStyle='#e4ffffbb';c.fill()}
  for(let i=0;i<5;i++){const a=v.phase+i*1.25;c.beginPath();c.moveTo(v.length,0);c.lineTo(v.length+Math.cos(a)*8,Math.sin(a)*9);c.strokeStyle='#a7edff99';c.lineWidth=1.5;c.stroke()}
 }else if(v.kind==='flame'){
  // A turbulent hydrogen plume, not a translucent fan: rolling blue edges,
  // luminous white cores and fast moving, curved tongues. Everything is clipped
  // to the actual sector so visible fire never promises extra damage area.
  c.beginPath();v.envelope.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.save();c.clip();
  const glow=c.createRadialGradient(v.length*.35,0,4,v.length*.45,0,v.length*.8);glow.addColorStop(0,'#d6f4ff66');glow.addColorStop(.5,'#768dff33');glow.addColorStop(1,'#536aff00');c.fillStyle=glow;c.fillRect(0,-v.width,v.length+10,v.width*2);
  c.globalCompositeOperation='lighter';
  for(const f of v.wisps){
   const bend=Math.sin(f.phase)*f.width*.8,tip=f.x+f.length;
   c.beginPath();c.moveTo(f.x-f.length*.8,f.y);c.bezierCurveTo(f.x-f.length*.4,f.y-f.width*1.5,f.x+f.length*.6,f.y-f.width+bend,tip,f.y+bend);c.bezierCurveTo(f.x+f.length*.3,f.y+f.width*.7,f.x-f.length*.5,f.y+f.width,f.x-f.length*.8,f.y);c.fillStyle='#6c8dff55';c.fill();
   c.beginPath();c.moveTo(f.x-f.length*.65,f.y);c.bezierCurveTo(f.x,f.y-f.width*.75,f.x+f.length*.5,f.y+bend*.4,tip,f.y+bend);c.bezierCurveTo(f.x+f.length*.1,f.y+f.width*.6,f.x-f.length*.4,f.y+f.width*.6,f.x-f.length*.65,f.y);c.fillStyle='#c4e8ff99';c.fill();
   c.beginPath();c.moveTo(f.x-f.length*.4,f.y);c.quadraticCurveTo(f.x+f.length*.2,f.y-f.width*.35,f.x+f.length*.7,f.y+bend*.5);c.quadraticCurveTo(f.x,f.y+f.width*.3,f.x-f.length*.4,f.y);c.fillStyle='#f5fcffcc';c.fill();
  }
  // A bright pulsing nozzle joins the plume to the weapon.
  c.beginPath();c.ellipse(28,0,18+Math.sin(v.phase)*3,5,0,0,Math.PI*2);c.fillStyle='#edfbff';c.fill();c.restore();
 }else{c.beginPath();c.moveTo(0,0);c.lineTo(v.length,0);c.strokeStyle='#e9ddb4';c.lineWidth=4;c.stroke()}
 c.restore();
}

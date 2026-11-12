// Deterministic, presentation-only geometry. Damage lives in model.mjs.
export function projectileVisual(b,time){
 const kind=b.type||'normal',angle=b.angle??Math.atan2(b.vy||0,b.vx||1);let x=b.originX??b.x-(b.vx||0)*.09,y=b.originY??b.y-(b.vy||0)*.09;
 let length=b.visual==='cone'?b.length:Math.hypot(b.x-x,b.y-y);if(kind==='normal'){length=Math.min(16,length);x=b.x-Math.cos(angle)*length;y=b.y-Math.sin(angle)*length}
 const phase=time*24+x*.03+y*.02,width=kind==='flame'?(b.visual==='cone'?Math.tan(b.halfAngle)*length*2:32):kind==='water'?9:4;
 const droplets=kind==='water'?Array.from({length:9},(_,i)=>({x:((i/9+time*2.4)%1)*length,y:Math.sin(phase+i*2)*3,r:1.3+i%3*.4})):[];
 const tongues=kind==='flame'?Array.from({length:9},(_,i)=>{let u=.2+i/11;return {x:length*u,y:Math.sin(phase+i*2.7)*width*u*.32,length:12+Math.sin(phase*.8+i)*6+i*1.2,width:3+i*.5}}):[];
 const halfAngle=b.halfAngle??.45,envelope=kind==='flame'?[[0,0],...Array.from({length:17},(_,i)=>{const a=-halfAngle+i/16*halfAngle*2,r=length*(.94+.06*Math.sin(phase+i*1.7));return [Math.cos(a)*r,Math.sin(a)*r]})]:[];
 return {envelope,halfAngle,kind,x,y,angle,length:Math.max(0,length),width,phase,droplets,tongues,alpha:b.visual==='cone'?Math.min(1,b.life/Math.max(.05,b.duration)*1.5):1};
}
export function drawProjectile(c,b,time){const v=projectileVisual(b,time);if(v.length<1)return;c.save();c.translate(v.x,v.y);c.rotate(v.angle);c.globalAlpha=v.alpha;c.lineCap='round';
 if(v.kind==='water'){
  // A connected pressurised column, with a rippled edge and moving highlights.
  const path=()=>{c.beginPath();c.moveTo(0,0);c.bezierCurveTo(v.length*.3,Math.sin(v.phase)*2,v.length*.7,Math.sin(v.phase+2)*3,v.length,0)};
  path();c.strokeStyle='#45bde555';c.lineWidth=16;c.stroke();path();c.strokeStyle='#6ed9efaa';c.lineWidth=9;c.stroke();path();c.strokeStyle='#d2f9ffcc';c.lineWidth=3;c.stroke();
  for(const d of v.droplets){c.beginPath();c.ellipse(d.x,d.y,d.r*2,d.r,0,0,Math.PI*2);c.fillStyle='#e4ffffbb';c.fill()}
  for(let i=0;i<5;i++){const a=v.phase+i*1.25;c.beginPath();c.moveTo(v.length,0);c.lineTo(v.length+Math.cos(a)*8,Math.sin(a)*9);c.strokeStyle='#a7edff99';c.lineWidth=1.5;c.stroke()}
 }else if(v.kind==='flame'){
  // Pale-blue hydrogen flame: broad, flickering envelope and white-hot tongues.
  c.beginPath();v.envelope.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle='#6f8eff66';c.fill();c.save();c.clip();
  c.beginPath();c.moveTo(0,0);for(let i=0;i<=12;i++){const a=-v.halfAngle*.55+i/12*v.halfAngle*1.1,r=v.length*(.83+.08*Math.sin(v.phase+i));c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fillStyle='#b7e4ffbb';c.fill();
  for(const f of v.tongues){c.beginPath();c.moveTo(f.x-f.length,f.y);c.bezierCurveTo(f.x-f.length*.3,f.y-f.width,f.x+f.length*.3,f.y-f.width*.6,f.x+f.length,f.y+Math.sin(v.phase+f.x)*3);c.bezierCurveTo(f.x+f.length*.2,f.y+f.width,f.x-f.length*.4,f.y+f.width,f.x-f.length,f.y);c.fillStyle='#eef9ffcc';c.fill()}c.restore();
 }else{c.beginPath();c.moveTo(0,0);c.lineTo(v.length,0);c.strokeStyle='#e9ddb4';c.lineWidth=4;c.stroke()}
 c.restore();
}

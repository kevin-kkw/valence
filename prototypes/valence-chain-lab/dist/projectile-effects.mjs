// Deterministic, presentation-only geometry. Damage lives in model.mjs.
export function projectileVisual(b,time){
 const kind=b.type||'normal',angle=b.angle??Math.atan2(b.vy||0,b.vx||1);let x=b.originX??b.x-(b.vx||0)*.09,y=b.originY??b.y-(b.vy||0)*.09;
 let length=b.visual==='cone'?b.length:Math.hypot(b.x-x,b.y-y);if(kind==='water'){length=Math.min(36,length);x=b.x-Math.cos(angle)*length;y=b.y-Math.sin(angle)*length}if(kind==='acid'||kind==='iron'){length=Math.min(kind==='iron'?58:24,length);x=b.x-Math.cos(angle)*length;y=b.y-Math.sin(angle)*length}if(kind==='normal'){length=Math.min(16,length);x=b.x-Math.cos(angle)*length;y=b.y-Math.sin(angle)*length}
 const phase=time*24+x*.03+y*.02,width=kind==='flame'?(b.visual==='cone'?Math.tan(b.halfAngle)*length*2:32):kind==='water'?9:4;
 const droplets=kind==='water'?Array.from({length:9},(_,i)=>({x:((i/9+time*2.4)%1)*length,y:Math.sin(phase+i*2)*3,r:1.3+i%3*.4})):[];
 const tongues=kind==='flame'?Array.from({length:9},(_,i)=>{let u=.2+i/11;return {x:length*u,y:Math.sin(phase+i*2.7)*width*u*.32,length:12+Math.sin(phase*.8+i)*6+i*1.2,width:3+i*.5}}):[];
 const halfAngle=b.halfAngle??.45,envelope=kind==='flame'?[[0,0],...Array.from({length:17},(_,i)=>{const a=-halfAngle+i/16*halfAngle*2,r=length*(.94+.06*Math.sin(phase+i*1.7));return [Math.cos(a)*r,Math.sin(a)*r]})]:[];
 const wisps=kind==='flame'?Array.from({length:32},(_,i)=>{const u=.12+((i*.6180339+time*1.8)%1)*.86,a=halfAngle*Math.sin(i*2.4+time*3)*.86;return {x:Math.cos(a)*length*u,y:Math.sin(a)*length*u,length:14+u*25,width:3+u*10,phase:phase+i*2.1,u}}):[];
 return {wisps,envelope,halfAngle,kind,x,y,angle,length:Math.max(0,length),width,phase,droplets,tongues,alpha:b.visual==='cone'?Math.min(1,b.life/Math.max(.05,b.duration)*2.8):1};
}
export function drawProjectile(c,b,time){if(['gas','electric','acidSplash'].includes(b.type)){drawWeaponEffect(c,b,time);return}const v=projectileVisual(b,time);if(v.length<1)return;c.save();c.translate(v.x,v.y);c.rotate(v.angle);c.globalAlpha=v.alpha;c.lineCap='round';
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
 }else if(v.kind==='acid'){c.strokeStyle='#a6e45e88';c.lineWidth=5;c.beginPath();c.moveTo(0,0);c.lineTo(v.length,0);c.stroke();for(let i=0;i<4;i++){c.beginPath();c.arc(v.length*i/3,Math.sin(v.phase+i)*2,2+i*.65,0,Math.PI*2);c.fillStyle=i===3?'#d9ffa3':'#a4de6588';c.fill();c.strokeStyle='#e7ffbe';c.lineWidth=.8;c.stroke()}}else if(v.kind==='iron'){c.beginPath();c.moveTo(0,0);c.lineTo(v.length,0);c.strokeStyle='#becddd88';c.lineWidth=6;c.stroke();c.beginPath();c.moveTo(v.length*.2,0);c.lineTo(v.length,0);c.strokeStyle='#f5faff';c.lineWidth=2;c.stroke();c.fillStyle='#a6b6c4';c.fillRect(v.length-7,-2,9,4)}else{c.beginPath();c.moveTo(0,0);c.lineTo(v.length,0);c.strokeStyle='#e9ddb4';c.lineWidth=4;c.stroke()}
 c.restore();
}

// Trace current fluid positions, never a fixed historical muzzle-to-head tether.
export function waterFlowSegments(particles,muzzle=null){
 const points=[...particles].reverse(),segments=[];if(muzzle&&points.length&&points[0].streamId===muzzle.streamId&&Math.hypot(points[0].x-muzzle.x,points[0].y-muzzle.y)<48)points.unshift(muzzle);
 for(const point of points){let line=segments[segments.length-1],last=line?.[line.length-1];if(!last||last.streamId!==point.streamId||Math.hypot(point.x-last.x,point.y-last.y)>48){line=[];segments.push(line)}line.push(point)}
 return segments;
}
export function drawWaterFlow(c,particles,muzzle,time,impacts=[],widthScale=1){
 c.save();c.lineCap='round';c.lineJoin='round';
 for(const line of waterFlowSegments(particles,muzzle)){
  if(line.length<2)continue;const path=()=>{c.beginPath();c.moveTo(line[0].x,line[0].y);for(let i=1;i<line.length-1;i++){const a=line[i],b=line[i+1];c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2)}const end=line[line.length-1];c.lineTo(end.x,end.y)};
  path();c.strokeStyle='#36bce644';c.lineWidth=15*widthScale;c.stroke();path();c.strokeStyle='#65d4edbb';c.lineWidth=8*widthScale;c.stroke();path();c.strokeStyle='#d9fbffbb';c.lineWidth=2.2;c.stroke();
  for(let i=1;i<line.length;i+=3){const p=line[i],prev=line[i-1],angle=Math.atan2(p.y-prev.y,p.x-prev.x);c.save();c.translate(p.x,p.y);c.rotate(angle);c.beginPath();c.ellipse(0,Math.sin(time*20+i)*1.5,3.5,1.3,0,0,Math.PI*2);c.fillStyle='#edffffcc';c.fill();c.restore()}
 }
 for(let i=0;i<impacts.length;i++){const p=impacts[i],radius=3+(1-p.life/.16)*12;c.globalAlpha=Math.max(0,p.life/.16);c.strokeStyle='#bdefff';c.lineWidth=1.5;for(let j=0;j<5;j++){const a=j*Math.PI*2/5+i;c.beginPath();c.moveTo(p.x+Math.cos(a)*3,p.y+Math.sin(a)*3);c.lineTo(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius);c.stroke()}}
 c.restore();
}

// World-space deterministic chain points; every hit node remains an exact endpoint.
export function electricArcSegments(nodes,time=0){return (nodes||[]).slice(1).map((node,i)=>{const from=nodes[i],dx=node.x-from.x,dy=node.y-from.y,length=Math.hypot(dx,dy),steps=Math.max(2,Math.ceil(length/13));return Array.from({length:steps+1},(_,j)=>{const u=j/steps,bend=j===0||j===steps?0:Math.sin(j*2.37+i*4.1+time*39)*Math.min(8,length*.1);return {x:from.x+dx*u-(length?dy/length:0)*bend,y:from.y+dy*u+(length?dx/length:0)*bend}})})}
// Local cloud centres sit inside the actual cone. Drawing also clips their edges.
export function gasClouds(effect,time=0){const length=Math.max(0,effect.length||0),half=effect.halfAngle??.5;return Array.from({length:15},(_,i)=>{const u=.16+((i*.6180339+time*.8)%1)*.78,a=Math.sin(i*2.1+time*2)*half*.8;return {x:Math.cos(a)*length*u,y:Math.sin(a)*length*u,r:8+u*18}})}
function drawWeaponEffect(c,b,time){c.save();c.globalAlpha=Math.max(0,Math.min(1,b.life/Math.max(.01,b.duration||.22)));
 if(b.type==='electric'){c.lineJoin='round';c.lineCap='round';for(const points of electricArcSegments(b.nodes,time)){const path=()=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y))};path();c.strokeStyle='#bd8dff66';c.lineWidth=9;c.stroke();path();c.strokeStyle='#c6a4ff';c.lineWidth=3.5;c.stroke();path();c.strokeStyle='#faf4ff';c.lineWidth=1.2;c.stroke()}}
 else if(b.type==='gas'){c.translate(b.originX??b.x,b.originY??b.y);c.rotate(b.angle||0);const half=b.halfAngle??.5,length=b.length||0;c.beginPath();c.moveTo(0,0);c.arc(0,0,length,-half,half);c.closePath();c.clip();for(const cloud of gasClouds(b,time)){const gradient=c.createRadialGradient(cloud.x,cloud.y,0,cloud.x,cloud.y,cloud.r);gradient.addColorStop(0,'#f0f6d977');gradient.addColorStop(.7,'#c5d6ba44');gradient.addColorStop(1,'#b8d3c000');c.fillStyle=gradient;c.beginPath();c.ellipse(cloud.x,cloud.y,cloud.r,cloud.r*.8,0,0,Math.PI*2);c.fill()}c.strokeStyle='#e2f3d577';c.lineWidth=2;for(let i=0;i<3;i++){const r=length*(.3+i*.25);c.beginPath();c.arc(0,0,r,-half*.75,half*.75);c.stroke()}}
 else{c.translate(b.x,b.y);const progress=1-Math.max(0,b.life/(b.duration||.22)),radius=b.radius||22;for(let i=0;i<8;i++){const angle=i*Math.PI/4,dist=radius*progress*.8;c.beginPath();c.arc(Math.cos(angle)*dist,Math.sin(angle)*dist,2+(i%3),0,Math.PI*2);c.fillStyle='#b2ed6966';c.fill();c.strokeStyle='#d9ffa7';c.lineWidth=1;c.stroke()}}
 c.restore()}

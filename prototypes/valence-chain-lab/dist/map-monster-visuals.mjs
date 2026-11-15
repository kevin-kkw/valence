import {ARENA_BOUNDS} from './view.mjs';
// Field-only vector bestiaries. Coordinates are local to the enemy, in 20px units.
const TAU=Math.PI*2;
const palettes={industrial:['#aa8563','#edbd78','#34474c'],mine:['#938ac4','#d9e7ff','#3c3e65'],ecology:['#80ac72','#d3eaa2','#354b47']};
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.7;c.stroke()}}
function oval(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.6;c.stroke()}}
function box(c,x,y,w,h,fill,stroke){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=1.6;c.strokeRect(x,y,w,h)}}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function gem(c,x,y,w,h,fill,stroke){poly(c,[[x,y-h],[x+w,y-h*.2],[x+w*.65,y+h],[x-w*.65,y+h],[x-w,y-h*.2]],fill,stroke);line(c,[[x,y-h],[x-w*.2,y+h*.2],[x+w*.65,y+h]],stroke,1)}
function legs(c,n,width,y,t,col){for(let i=0;i<n;i++){const x=(i-(n-1)/2)*width;line(c,[[x,y-5],[x+Math.sin(t*7+i)*3,y+4],[x-4,y+10]],col,3)}}
const bodies={
 industrial:[
  (c,t,a,b,d)=>{oval(c,0,18,24,7,d);box(c,-17,-18,34,36,a,b);oval(c,0,-18,17,6,d,b);oval(c,0,17,17,5,a,b);for(const y of [-10,11])box(c,-19,y,38,4,d,b);poly(c,[[-6,-5],[3,-8],[7,1],[0,8],[-8,3]],'#b8e178',b);oval(c,19+Math.sin(t*3)*2,14,6,4,'#b8d77e');},
  (c,t,a,b,d)=>{for(const x of [-25,25]){line(c,[[0,-4],[x,-12]],b,3);oval(c,x,-14,12,3,d,b);line(c,[[x-15,-14+Math.sin(t*18)*2],[x+15,-14-Math.sin(t*18)*2]],b)}poly(c,[[-17,-5],[0,-15],[18,-5],[12,12],[-12,12]],a,b);oval(c,0,-2,8,7,d,b);oval(c,0,-2,3,3,b);box(c,8,7,22,5,d,b);},
  (c,t,a,b,d)=>{legs(c,2,25,12,t,d);box(c,-16,-13,26,27,a,b);box(c,9,-8,13+Math.sin(t*5)*3,14,d,b);box(c,22+Math.sin(t*5)*3,-17,10,32,a,b);box(c,-22,-17,8,30,d,b);for(let i=0;i<3;i++)line(c,[[-10,-9+i*8],[5,-9+i*8]],b);},
  (c,t,a,b,d)=>{legs(c,4,10,15,t,d);poly(c,[[-23,-9],[-12,-22],[12,-19],[25,-1],[16,20],[-12,23],[-25,8]],a,b);for(const [x,y,q]of [[-9,-9,.4],[7,-5,-.5],[-4,9,.8]]){c.save();c.translate(x,y);c.rotate(q+Math.sin(t*2)*.05);box(c,-10,-5,20,10,d,b);c.restore()}line(c,[[-25,3],[23,3]],b,4);},
  (c,t,a,b,d)=>{oval(c,0,0,19,27,a,b);box(c,-21,-7,42,7,d,b);box(c,-10,23,6,8,d);box(c,7,23,6,8,d);box(c,-7,-33,14,9,a,b);line(c,[[0,-24],[0,-31]],b,3);oval(c,0,-4,8,8,d,b);line(c,[[0,-4],[Math.sin(t*3)*5,-9]],b);},
  (c,t,a,b,d)=>{box(c,-22,14,44,12,d,b);box(c,-15,-24,30,40,a,b);box(c,-19,-28,38,8,d,b);box(c,8,-7,19,12,a,b);for(let i=0;i<3;i++)oval(c,-4+Math.sin(t*2+i)*5,-35-i*10-(t*6%8),8+i*2,5+i,'#b1b49a66');for(let i=0;i<3;i++)box(c,-10,2+i*4,17,2,d);},
  (c,t,a,b,d)=>{for(const x of [-19,19]){oval(c,x,17,8,8,d,b);line(c,[[x,10],[x,-9],[Math.sign(x)*30,-17]],a,5)}box(c,-14,-18,28,35,d,b);box(c,-10,-12,20,13,a,b);poly(c,[[-7,4],[1,-2],[-1,7],[8,1],[0,17],[1,8]],b);line(c,[[28,-17],[34,-10],[30,-5+Math.sin(t*9)*3]],'#defaff',2);},
  (c,t,a,b,d)=>{oval(c,0,19,31,10,d,b);for(let i=0;i<5;i++)oval(c,-22+i*11,19,5,5,a,b);poly(c,[[-25,-14],[19,-20],[28,9],[-26,10]],a,b);box(c,-16,-9,32,17,d,b);for(let i=0;i<4;i++){const h=9+Math.sin(t*8+i)*4;poly(c,[[-11+i*7,6],[-10+i*7,-h],[-6+i*7,6]],'#ffbe74')}box(c,10,-30,9,14,d,b);}
 ],
 mine:[
  (c,t,a,b,d)=>{for(const side of [-1,1])for(let i=0;i<3;i++)line(c,[[side*8,-7+i*8],[side*(24+Math.sin(t*8+i)*3),-10+i*9],[side*28,1+i*9]],d,3);gem(c,0,0,13,18,a,b);gem(c,-5,-8,6,12,b,a);},
  (c,t,a,b,d)=>{legs(c,2,18,15,t,d);poly(c,[[-17,-13],[6,-20],[16,6],[0,19],[-17,6]],a,b);gem(c,-4,-20,6,12,b,a);line(c,[[4,2],[27,-6]],d,5);poly(c,[[9,0],[35,-13],[30,0],[12,6]],b,a);},
  (c,t,a,b,d)=>{oval(c,0,16,26,10,d,b);for(const [x,h]of [[-15,15],[0,38],[15,22]])gem(c,x,3,8,h+Math.sin(t*3+x)*2,a,b);line(c,[[-28,20],[-18,23],[-6,20],[4,24],[22,20]],b);},
  (c,t,a,b,d)=>{poly(c,[[-25,4],[-19,-17],[0,-24],[20,-15],[26,8],[10,24],[-13,23]],d,a);oval(c,0,1,19,18,'#242b46',b);for(let i=0;i<6;i++){const q=i*TAU/6;gem(c,Math.cos(q)*12,Math.sin(q)*12,6,8+Math.sin(t*2+i),a,b)}gem(c,0,0,5,9,b,a);},
  (c,t,a,b,d,e)=>{legs(c,2,23,20,t,d);poly(c,[[-27,-9],[-17,-26],[17,-26],[27,-9],[23,22],[-23,22]],e.mapAction==='exposed'?d:a,b);poly(c,[[-19,-12],[0,-20],[19,-12],[0,20]],d,b);gem(c,0,0,e.mapAction==='exposed'?11:6,15,b,a);for(const x of [-25,25])gem(c,x,1,7,14,a,b);},
  (c,t,a,b,d)=>{oval(c,0,23,21,7,d,b);gem(c,0,-3,15,31,a,b);line(c,[[0,-34],[0,20]],b);for(const y of [-13,8]){c.beginPath();c.ellipse(0,y,24,7,Math.sin(t*2)*.15,0,TAU);c.strokeStyle=b;c.lineWidth=2;c.stroke()}},
  (c,t,a,b,d)=>{for(const x of [-24,24])gem(c,x,8+Math.sin(t*3+x)*3,7,13,a,b);poly(c,[[0,-27],[25,17],[-25,17]],a,b);poly(c,[[0,-27],[0,8],[-25,17]],d,b);poly(c,[[0,-27],[25,17],[0,8]],'#c6b4ec',b);oval(c,0,6,4,4,b);},
  (c,t,a,b,d)=>{oval(c,0,0,18,18,d,b);for(let i=0;i<5;i++){const q=i*TAU/5+t*.2;c.save();c.rotate(q);gem(c,28,0,7,11,a,b);c.restore()}gem(c,0,0,10,14,a,b);line(c,[[-6,-3],[4,-8],[0,3],[7,2],[-3,11]],b,2);}
 ],
 ecology:[
  (c,t,a,b,d)=>{const w=Math.sin(t*5)*3;oval(c,0,14,27+w,9,a,b);oval(c,-3,1,17-w,16,a,b);oval(c,-7,-5,5,4,'#e6f6c177');oval(c,4,0,3,4,d);oval(c,13,4,2,3,d);},
  (c,t,a,b,d)=>{line(c,[[0,19],[Math.sin(t*3)*3,-9]],d,7);for(const s of [-1,1])poly(c,[[0,12],[s*24,0],[s*20,16],[0,20]],a,b);oval(c,0,-15,18,13,a,b);oval(c,11,-17,13,8,d,b);oval(c,18,-17,5,6,'#d5b872',b);},
  (c,t,a,b,d)=>{for(const s of [-1,1]){line(c,[[s*9,4],[s*26,12+Math.sin(t*8)*3],[s*14,22]],a,7);poly(c,[[s*9,-1],[s*23,-21],[s*21,5]],b,d)}oval(c,0,0,16,12,a,d);poly(c,[[-12,-5],[0,-20],[12,-5]],a,b);oval(c,-6,-4,3,3,d);oval(c,6,-4,3,3,d);},
  (c,t,a,b,d)=>{oval(c,0,8,23,18,a,b);oval(c,-17,-6+Math.sin(t*4)*2,11,12,a,b);oval(c,17,-1,9,10,'#a8be8c',b);oval(c,0,-11,13,13,a,b);for(const [x,y]of [[-3,-11],[7,3],[-8,10]])oval(c,x,y,4,4,b);oval(c,-4,-12,2,3,d);},
  (c,t,a,b,d)=>{for(let i=0;i<5;i++){const x=(i-2)*9;line(c,[[x*.7,9],[x,20],[x+Math.sin(t*3+i)*4,29]],d,4)}poly(c,[[-22,9],[-19,-15],[0,-26],[22,-10],[24,14],[0,23]],a,b);for(const s of [-1,1])line(c,[[s*19,-10],[s*3,0],[s*17,13]],d,3);oval(c,0,-6,6,5,b);},
  (c,t,a,b,d)=>{for(let i=0;i<7;i++){const q=i*TAU/7;line(c,[[Math.cos(q)*18,Math.sin(q)*20],[Math.cos(q)*28,Math.sin(q)*30]],d,3)}oval(c,0,0,21+Math.sin(t*3)*2,25+Math.sin(t*3)*2,a,b);for(const [x,y]of [[-9,-10],[7,-14],[10,9],[-7,14]])oval(c,x,y,5,6,'#d9c897',b);line(c,[[0,-20],[-5,-5],[3,2],[-1,20]],d);},
  (c,t,a,b,d)=>{for(let i=0;i<4;i++){const q=i*TAU/4+t*.2;c.save();c.rotate(q);oval(c,18,0,17,8,a,b);line(c,[[9,0],[30,Math.sin(t*3+i)*3]],d);c.restore()}oval(c,0,0,12,12,d,b);oval(c,0,0,6,6,'#e7ca99');for(const s of [-1,1])line(c,[[s*5,12],[s*19,24],[s*30,17],[s*26,8]],a,4);},
  (c,t,a,b,d)=>{for(const s of [-1,1])for(let i=0;i<3;i++)line(c,[[s*13,-8+i*10],[s*29,-13+i*12],[s*33,Math.sin(t*5+i)*3+i*12]],d,4);oval(c,0,8,25,24,a,b);oval(c,0,-17,15,12,d,b);for(const [x,y]of [[-12,0],[9,3],[-5,17],[14,19]]){oval(c,x,y,7,8,'#c0cf91',b);oval(c,x,y,2,3,d)}oval(c,-5,-19,3,3,b);oval(c,5,-19,3,3,b);}
 ]
};
function valid(e){return !!palettes[e.speciesMap]&&Number.isInteger(e.speciesIndex)&&e.speciesIndex>=0&&e.speciesIndex<8}
function warnings(c,e,t){
 const r=e.r||20,aim=e.mapAim||0,i=e.speciesIndex,m=e.speciesMap;
 if(e.mapAction==='warning'||e.mapWarning>0){
  const total=Math.max(.01,e.mapWarningTotal||1),progress=Math.max(0,Math.min(1,1-(e.mapWarning||0)/total));
  // Match backend point()'s default 30px margin before converting to local space.
  const impactRing=(x,y,radius)=>ring(Math.max(ARENA_BOUNDS.left+30,Math.min(ARENA_BOUNDS.right-30,x))-(e.x||0),Math.max(ARENA_BOUNDS.top+30,Math.min(ARENA_BOUNDS.bottom-30,y))-(e.y||0),radius);
  const ring=(x,y,radius)=>{c.beginPath();c.arc(x,y,radius,0,TAU);c.stroke()};
  const ray=(angle,length)=>line(c,[[Math.cos(angle)*(r+7),Math.sin(angle)*(r+7)],[Math.cos(angle)*length,Math.sin(angle)*length]],'#ffe0a1',2);
  c.strokeStyle='#ffe0a1';c.lineWidth=2;c.setLineDash([5,4]);ring(0,0,r+10);c.setLineDash([]);
  c.lineWidth=3;c.beginPath();c.arc(0,0,r+14,-Math.PI/2,-Math.PI/2+TAU*progress);c.stroke();
  c.lineWidth=2;c.setLineDash([7,5]);
  if(m==='industrial'&&(i===0||i===4))ring(0,0,i===0?45:78);
  else if(m==='ecology'&&i===5)ring(0,0,80);
  else if(e.mapTarget&&((m==='mine'&&(i===2||i===7))||(m==='ecology'&&i===4))){
   const x=e.mapTarget.x-(e.x||0),y=e.mapTarget.y-(e.y||0);
   if(m==='mine'&&i===7){for(const offset of [-85,85])impactRing(e.mapTarget.x+offset,e.mapTarget.y,35)}else ring(x,y,m==='mine'?45:48);
   line(c,[[0,0],[x,y]],'#ffe0a188');
  }else if(m==='ecology'&&i===6){for(const distance of [60,120,180])impactRing((e.x||0)+Math.cos(aim)*distance,(e.y||0)+Math.sin(aim)*distance,28)}
  else if(m==='mine'&&i===6){for(const offset of [-.35,.35])ray(aim+offset+((e.mapCycle||0)%2)*Math.PI/2,540)}
  else if(m==='mine'&&i===5){for(let j=0;j<6;j++)ray(aim+j*Math.PI/3,120)}
  else if(i===1||i===2||i===5||i===6||i===7){ray(aim,i===6?540:i===5?500:200);if(i===7){ray(aim-.5,150);ray(aim+.5,150)}}
  c.setLineDash([]);
 }
 if(e.mapAction==='dash'){c.save();c.rotate(aim);for(let i=0;i<3;i++)line(c,[[-r-5,-9+i*9],[-r-30-Math.sin(t*18+i)*5,-9+i*9]],'#fbe2b1aa');c.restore()}
 if(e.mapAction==='recover'||e.mapRecovery>0){c.fillStyle='#c0e4e4';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText('硬直',0,-r-12)}
}
export function drawMapMonster(c,e,time=0){if(!e.speciesId||!valid(e))return false;c.save();warnings(c,e,time);const [base,accent,dark]=palettes[e.speciesMap];c.scale((e.r||20)/20,(e.r||20)/20);const phase=time+(e.id||0)*.37;c.translate(0,Math.sin(phase*3)*.7);bodies[e.speciesMap][e.speciesIndex](c,phase,e.flash>0?'#fff7df':base,accent,dark,e);c.restore();return true}
export function drawMapBullet(c,b,time=0){if(!valid(b))return false;c.save();c.translate(b.x,b.y);c.rotate(Math.atan2(b.vy||0,b.vx||0));const [base,accent,dark]=palettes[b.speciesMap],col=b.deflected?'#ddbdff':b.color||accent,i=b.speciesIndex;if(b.speciesMap==='industrial'){if(i===6){line(c,[[-17,-2],[-7,3],[0,-4],[14,0]],col,3)}else if(i===1){box(c,-9,-2,18,4,col);box(c,6,-4,3,8,dark)}else{poly(c,[[-10,-3],[5,-5],[11,0],[3,5],[-7,3]],col,dark);line(c,[[-20,0],[-10,0]],base)}}else if(b.speciesMap==='mine'){if(i===6){line(c,[[-20,0],[19,0]],col,3);line(c,[[-10,-4],[10,4]],'#f3f5ff',1)}else{poly(c,[[-12,0],[-4,-4-i*.25],[13+i,0],[-4,4+i*.25]],col,dark);line(c,[[-6,0],[11+i,0]],'#ffffffaa',1)}}else{if(i===6){line(c,[[-15,Math.sin(time*9)*3],[-5,-4],[5,4],[14,0]],col,4)}else{oval(c,0,0,8+i*.4,4+i*.2,col,dark);line(c,[[-4,0],[5,0]],dark,1);if(i===5)for(const y of [-6,6])oval(c,-5,y,2,2,col)}}c.restore();return true}

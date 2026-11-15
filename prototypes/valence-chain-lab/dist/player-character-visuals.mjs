import {isCharacterId} from './characters.mjs';
const OUTLINE='#263d39',SKIN='#edbb94',HAIR='#302c29';
function oval(c,x,y,rx,ry,fill,stroke=OUTLINE){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}}
function box(c,x,y,w,h,fill,stroke){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.strokeRect(x,y,w,h)}}
function shape(c,points,fill){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=OUTLINE;c.lineWidth=1.5;c.stroke()}
function body(c,id,t){
 const step=Math.sin(t*11)*2,sturdy=id==='daqi',mint=id==='duoduo',coat=mint?'#9bd8c4':sturdy?'#d7a342':'#ed8d40',width=sturdy?18:15;
 oval(c,0,22,24,8,'#081d17aa',null);
 if(id==='johnny'){
  // Compact reactor backpack protrudes behind his narrow orange jacket.
  box(c,-22,-8,12,27,'#d4dace',OUTLINE);box(c,-20,-5,4,18,'#56d9d3');box(c,-23,-4,3,7,'#e99a44');box(c,-23,10,3,6,'#e99a44');
 }
 if(mint){
  // A tied ponytail remains visible beside both the head and shoulder.
  oval(c,17,-8,7,8,HAIR);shape(c,[[18,-5],[25,0],[24,14],[18,20],[15,8]],HAIR);box(c,16,-6,7,3,'#91c8b9');
 }
 for(const [x,s] of [[-12,step],[4,-step]]){box(c,x,12+s,8,11,'#35495a');box(c,x-1,21+s,10,5,'#263b39')}
 oval(c,0,2,width,19,coat);
 // Open jackets and white inner layer match the portraits without mature styling.
 shape(c,[[-6,-13],[6,-13],[8,16],[-7,16]],mint?'#f0eee0':'#36465a');
 shape(c,[[-10,-13],[-3,-10],[-4,2],[-11,-5]],mint?'#f3f2e5':'#f3d9a6');shape(c,[[9,-13],[3,-10],[4,2],[11,-5]],mint?'#f3f2e5':'#f3d9a6');
 oval(c,-width+2,5,5,11,coat);oval(c,-width+2,14,4,4,SKIN);
 if(sturdy){
  box(c,-18,4,8,8,'#a6b7b5',OUTLINE);box(c,10,5,8,7,'#a6b7b5',OUTLINE);
  box(c,-16,12,32,4,'#514638');box(c,-4,11,7,6,'#ddd0a1',OUTLINE);box(c,-14,15,8,9,'#a17742',OUTLINE);
  // Toolbox silhouette hangs on the free side, away from the aiming gun.
  box(c,-26,10,10,4,'#465452',OUTLINE);box(c,-28,14,17,12,'#4e6064',OUTLINE);box(c,-28,16,17,3,'#ddb35c');box(c,-23,17,4,5,'#c1cccc');
 }else if(mint){
  shape(c,[[-10,-12],[-6,-13],[14,13],[10,15]],'#776b4e');box(c,-2,10,20,14,'#b5ad86',OUTLINE);box(c,0,12,16,4,'#ded7ad');
  for(const [x,color] of [[1,'#85d3e0'],[6,'#e5c879'],[11,'#a8d5b0']])box(c,x,18,4,4,color);
  box(c,17,12,4,9,'#c1e2e0',OUTLINE);box(c,17,10,4,3,'#4e7d9b');
 }else{
  shape(c,[[-12,-12],[-8,-13],[-5,15],[-10,16]],'#485957');box(c,7,5,7,7,'#be622d',OUTLINE);box(c,9,3,2,5,'#8cd8de');
 }
}
function head(c,id){
 const sturdy=id==='daqi',mint=id==='duoduo',rx=sturdy?15:14;
 oval(c,0,-14,rx,14,SKIN);oval(c,-rx,-12,2.5,4,SKIN);oval(c,rx,-12,2.5,4,SKIN);
 if(sturdy){
  shape(c,[[-15,-15],[-16,-24],[-11,-23],[-12,-29],[-5,-27],[0,-31],[4,-27],[11,-29],[11,-25],[16,-24],[14,-16],[10,-22],[5,-20],[1,-24],[-3,-20],[-8,-23],[-11,-16]],HAIR);
 }else if(mint){
  shape(c,[[-14,-10],[-17,-19],[-11,-27],[-3,-29],[7,-28],[14,-22],[15,-9],[11,-12],[8,-23],[4,-21],[0,-25],[-4,-17],[-8,-22],[-11,-12]],HAIR);
 }else{
  shape(c,[[-14,-11],[-18,-18],[-14,-23],[-18,-25],[-9,-26],[-5,-31],[0,-28],[7,-30],[9,-26],[17,-24],[14,-20],[17,-15],[12,-12],[9,-21],[2,-20],[-2,-24],[-8,-18],[-11,-19]],'#4b3426');
  // Two pale blue lenses sit on the forehead, never across his eyes.
  box(c,-14,-27,28,4,'#4c5559',OUTLINE);box(c,-12,-29,10,8,'#b3dae0',OUTLINE);box(c,2,-29,10,8,'#b3dae0',OUTLINE);box(c,-10,-28,3,4,'#e5f4e9');box(c,4,-28,3,4,'#e5f4e9');
 }
 // Large readable eyes and a simple smile keep all three visibly youthful.
 oval(c,-5,-13,2,2.6,'#303733',null);oval(c,5,-13,2,2.6,'#303733',null);
 box(c,-5.5,-14,1,1,'#fff5e2');box(c,4.5,-14,1,1,'#fff5e2');
 c.beginPath();c.moveTo(-3,-6);c.quadraticCurveTo(0,-3,4,-6);c.strokeStyle='#976b56';c.lineWidth=1.2;c.stroke();
}
/** Draw a portrait-matched battle sprite in world units (about 40px wide).
 * layer='body' draws behind the unchanged aiming weapon; layer='head' above it.
 * Default 'all' is a standalone gallery sprite. Returns false without drawing
 * for unknown identities, allowing the renderer's original robot fallback.
 */
export function drawPlayerCharacter(c,{characterId,x=0,y=0,time=0,inv=0,layer='all'}={}){
 if(!isCharacterId(characterId))return false;
 c.save();c.translate(x,y);if(inv>0&&Math.floor(time*16)%2===0)c.globalAlpha=.45;
 if(layer==='all'||layer==='body')body(c,characterId,time);
 if(layer==='all'||layer==='head')head(c,characterId);
 c.restore();return true;
}

export function camera(width,height,playerX,playerY){
 if(width/height>=1.2)return {scale:Math.min(width/1200,height/800),x:600,y:400};
 const scale=Math.max(width/850,height/800),halfW=width/scale/2,halfH=height/scale/2;
 return {scale,x:Math.max(halfW,Math.min(1200-halfW,playerX)),y:Math.max(halfH,Math.min(800-halfH,playerY))};
}
export const ARENA_BOUNDS=Object.freeze({left:22,top:22,right:1178,bottom:778});
export function combatBounds(width,height,playerX,playerY){
 const v=camera(width,height,playerX,playerY),halfW=width/v.scale/2,halfH=height/v.scale/2;
 return {left:Math.max(ARENA_BOUNDS.left,v.x-halfW),top:Math.max(ARENA_BOUNDS.top,v.y-halfH),right:Math.min(ARENA_BOUNDS.right,v.x+halfW),bottom:Math.min(ARENA_BOUNDS.bottom,v.y+halfH)};
}
export function visibleInCombat(entity,bounds){const r=entity.r||0;return entity.x-r>=bounds.left&&entity.x+r<=bounds.right&&entity.y-r>=bounds.top&&entity.y+r<=bounds.bottom}

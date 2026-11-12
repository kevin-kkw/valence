export function camera(width,height,playerX,playerY){
 if(width/height>=1.2)return {scale:Math.min(width/1200,height/800),x:600,y:400};
 const scale=Math.max(width/850,height/800),halfW=width/scale/2,halfH=height/scale/2;
 return {scale,x:Math.max(halfW,Math.min(1200-halfW,playerX)),y:Math.max(halfH,Math.min(800-halfH,playerY))};
}

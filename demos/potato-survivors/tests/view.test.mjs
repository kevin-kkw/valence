import {test} from 'node:test';import assert from 'node:assert/strict';
const {camera}=await import('../dist/view.mjs').catch(()=>({}));
test('portrait camera fills screen and keeps all four arena corners visible when approached',()=>{assert.equal(typeof camera,'function');for(let [w,h]of [[360,480],[390,600],[667,165]])for(let [x,y]of [[30,30],[1170,30],[30,770],[1170,770]]){let v=camera(w,h,x,y);let sx=(x-v.x)*v.scale+w/2,sy=(y-v.y)*v.scale+h/2;assert.ok(sx>=0&&sx<=w&&sy>=0&&sy<=h);if(w/h<1.2){assert.ok(v.y-h/v.scale/2>=-.001);assert.ok(v.y+h/v.scale/2<=800.001)}}});

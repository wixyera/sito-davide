import test from 'node:test';import assert from 'node:assert/strict';
import {createEntranceSculpture} from '../js/entrance-scene.js';
test('the entrance sculpture remains finite and bounded under time and pointer input',()=>{
 const sculpture=createEntranceSculpture();let vertices=0;
 for(const time of [0,1,60,3600]){
  sculpture.update(time,.9,-.9);sculpture.group.updateMatrixWorld(true);
  sculpture.group.traverse(object=>{
   if(!object.geometry)return;const data=object.geometry.attributes.position.array;vertices+=data.length;
   assert.ok(data.every(Number.isFinite));assert.ok(object.matrixWorld.elements.every(Number.isFinite));object.geometry.computeBoundingSphere();assert.ok(object.geometry.boundingSphere.radius<4);
  });
 }
 assert.ok(vertices>1000);
});

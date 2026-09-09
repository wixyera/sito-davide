import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from '../vendor/three.module.js';import {createMuseum} from '../js/museum.js';
test('museum has seven finite 3D works and never navigates private modules before login',()=>{
 const makeEl=()=>{const children=new Map();return {classList:{add(){},remove(){},contains(){return false}},removeAttribute(){},setAttribute(){},append(){},addEventListener(){},querySelector(key){if(!children.has(key))children.set(key,makeEl());return children.get(key)},get childMap(){return children}}};
 const panels=[],welcome=makeEl(),hero=makeEl(),authArt=makeEl();welcome.append=el=>panels.push(el);hero.append=el=>panels.push(el);
 globalThis.matchMedia=()=>({matches:false});globalThis.document={querySelector:()=>welcome,getElementById:id=>id==='authArt'?authArt:hero,querySelectorAll:()=>[],createElement:makeEl};
 let signedIn=false,navigated=[];globalThis.window={showModule:id=>navigated.push(id)};
 const scene=new THREE.Scene(),group=new THREE.Group(),globe=new THREE.Mesh(new THREE.SphereGeometry(1)),orbit=new THREE.Group();scene.add(group);group.add(globe,orbit);
 const museum=createMuseum(THREE,{scene,group,globe,orbit,chrome:new THREE.MeshStandardMaterial(),accent:new THREE.MeshStandardMaterial(),camera:new THREE.PerspectiveCamera(),renderStill(){},overlay:{classList:{contains:()=>signedIn}},holders:new Map([['home',hero]])});
 const rooms=['home','calendario','percorso','contatti','wishlist','spese','esperimenti'];assert.equal(group.children.length,7);
 for(const room of rooms){museum.selectModule(room);museum.tick(.016,2,false);assert.equal(group.children.filter(x=>x.visible).length,1)}
 group.traverse(o=>{if(o.isMesh){const a=o.geometry.getAttribute('position');for(const value of a.array)assert.ok(Number.isFinite(value))}});
 panels[0].querySelector('[data-art="next"]').onclick();assert.deepEqual(navigated,[]);
 signedIn=true;museum.selectModule('home');panels[0].querySelector('[data-art="next"]').onclick();assert.deepEqual(navigated,['calendario']);
 panels[0].querySelector('[data-art="pause"]').onclick();assert.equal(museum.paused,true);
});

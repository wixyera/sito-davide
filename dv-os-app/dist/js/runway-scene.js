import * as T from '../vendor/three.module.js';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:0));
export function runwayPose(time,index=0){
 const t=Number.isFinite(time)?time:0,phase=t*2.7+index*Math.PI;
 return {stride:Math.sin(phase)*.31,knee:Math.max(0,Math.cos(phase))*.36,bob:Math.cos(phase*2)*.015,z:10-((8-t*.63+index*9)%36+36)%36};
}
export function cameraPose(progress=0,mode='tour',compact=false){
 const p=clamp(progress);return mode==='intro'?{x:Math.sin(p*Math.PI)*1.7,y:1.6+p*.45,z:13-p*7,lookZ:-8+p*5}:mode==='cover'?{x:compact?2.1:3.4,y:2.5,z:11,lookZ:-7}:{x:Math.sin(p*Math.PI*1.8)*(compact?1.4:3.3),y:2.4-Math.sin(p*Math.PI)*.55,z:13-p*11,lookZ:-9-p*8};
}
export function createRunwayWorld({compact=false}={}){
 const scene=new T.Scene();scene.background=new T.Color(0x100d0e);scene.fog=new T.FogExp2(0x100d0e,.026);
 const group=new T.Group();scene.add(group);
 const materials={floor:new T.MeshStandardMaterial({color:0x282125,metalness:.48,roughness:.32}),black:new T.MeshStandardMaterial({color:0x18141a,roughness:.8}),skin:new T.MeshStandardMaterial({color:0xc6a991,metalness:.55,roughness:.32}),ivory:new T.MeshStandardMaterial({color:0xe9dfce,roughness:.76}),red:new T.MeshStandardMaterial({color:0x702537,roughness:.8}),gold:new T.MeshStandardMaterial({color:0xc9a273,metalness:.7,roughness:.3})};
 const boxGeo=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,compact?12:18,12),cylinderGeo=new T.CylinderGeometry(1,1,1,compact?10:16);
 function box(w,h,d,mat,x,y,z,parent=group){const m=new T.Mesh(boxGeo,mat);m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m}
 function sphere(x,y,z,sx,sy,sz,mat,parent=group){const m=new T.Mesh(sphereGeo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
 box(45,.15,65,materials.black,0,-.31,-12);box(5.2,.28,39,materials.floor,0,-.12,-8);
 const edge=new T.MeshBasicMaterial({color:0xf7dbc3});for(const x of [-2.64,2.64])box(.035,.025,39,edge,x,.035,-8);
 const warm=new T.MeshBasicMaterial({color:0xffe9d1});const redGlow=new T.MeshBasicMaterial({color:0xb4404b});
 // Receding architectural portals and ceiling lighting.
 for(let z=5;z>=-25;z-=5){for(const x of [-5.2,5.2]){box(.08,7,.08,materials.gold,x,3.5,z);box(.035,4.5,.035,warm,x*.98,4.5,z)}box(10.5,.045,.045,warm,0,7,z);box(4.5,.04,.8,materials.black,0,7.06,z)}
 box(20,10,.35,materials.black,0,4.6,-28);
 // Pleated velvet curtains around the backstage opening.
 const curtainGeometry=new T.CylinderGeometry(.32,.38,8.5,10);for(const side of [-1,1])for(let i=0;i<17;i++){const fold=new T.Mesh(curtainGeometry,materials.red);fold.scale.z=.65;fold.position.set(side*(2.4+i*.43),4.2,-27.5+Math.sin(i)*.15);group.add(fold)}
 box(4.2,6,.1,redGlow,0,3,-28);box(3.6,5.7,.13,materials.black,0,2.8,-27.9);
 // Two rows of seated silhouettes. Shared geometry keeps the audience inexpensive.
 const seats=compact?18:28,total=seats*4,bodyInst=new T.InstancedMesh(sphereGeo,materials.black,total),headInst=new T.InstancedMesh(sphereGeo,new T.MeshStandardMaterial({color:0x4c3b36,roughness:1}),total);
 const dummy=new T.Object3D();let n=0;
 for(const side of [-1,1])for(let row=0;row<2;row++)for(let i=0;i<seats;i++){
  const x=side*(3.9+row*1.4),z=6-i*(30/seats);dummy.position.set(x,.73,z);dummy.scale.set(.34,.48,.25);dummy.updateMatrix();bodyInst.setMatrixAt(n,dummy.matrix);dummy.position.y=1.33;dummy.scale.set(.14,.19,.15);dummy.updateMatrix();headInst.setMatrixAt(n,dummy.matrix);n++;
  box(.58,.48,.53,materials.black,x,.22,z);if(i%5===0&&row===0)box(.08,.12,.02,warm,x-side*.2,1.02,z+.19);
 }
 bodyInst.name='audience-body';headInst.name='audience-head';group.add(bodyInst,headInst);
 // Original sculptural couture mannequins with articulated walk cycles.
 const walkers=[];
 for(let i=0;i<4;i++){
  const root=new T.Group();group.add(root);const garment=[materials.ivory,materials.black,materials.red,materials.gold][i];
  const torso=new T.Mesh(new T.CylinderGeometry(.29,.23,.64,12),garment);torso.position.y=1.42;torso.scale.z=.62;root.add(torso);
  sphere(0,1.96,0,.14,.2,.14,materials.skin,root);box(.10,.14,.1,materials.skin,0,1.76,0,root);
  // Shoulders, lapels and a fitted belt create a readable couture silhouette.
  box(.69,.14,.3,garment,0,1.68,0,root);box(.48,.06,.27,materials.gold,0,1.16,0,root);
  for(const s of [-1,1]){const lapel=box(.095,.43,.035,i===1?materials.ivory:materials.black,s*.12,1.46,.17,root);lapel.rotation.z=s*-.2;}
  if(i%2===0){const skirt=new T.Mesh(new T.CylinderGeometry(.23,.47,.78,16,1,true),garment);skirt.position.y=.80;skirt.scale.z=.72;root.add(skirt)}
  else {for(const s of [-1,1]){const tail=box(.22,.67,.11,garment,s*.22,.88,-.12,root);tail.rotation.z=s*.06;}}
  const arms=[],legs=[],knees=[];
  for(const s of [-1,1]){
   const arm=new T.Group();arm.position.set(s*.36,1.64,0);root.add(arm);const sleeve=box(.14,.49,.17,garment,0,-.22,0,arm);sleeve.rotation.z=s*.035;box(.09,.32,.10,materials.skin,0,-.58,0,arm);sphere(0,-.76,0,.052,.09,.04,materials.skin,arm);arms.push(arm);
   const leg=new T.Group();leg.position.set(s*.125,1.04,0);root.add(leg);box(.16,.48,.19,materials.black,0,-.24,0,leg);
   const knee=new T.Group();knee.position.y=-.48;leg.add(knee);box(.125,.45,.14,materials.black,0,-.225,0,knee);box(.16,.10,.31,materials.black,0,-.46,.07,knee);legs.push(leg);knees.push(knee);
  }
  walkers.push({root,arms,legs,knees});
 }
 const ambient=new T.HemisphereLight(0xf5dac8,0x20152b,2);scene.add(ambient);
 const key=new T.DirectionalLight(0xffe0c0,3.8);key.position.set(-3,6,7);scene.add(key);const rim=new T.DirectionalLight(0xbd889e,2.3);rim.position.set(4,5,-12);scene.add(rim);
 for(const z of [2,-8,-18]){const light=new T.PointLight(0xffdfba,compact?12:18,14,2);light.position.set(0,4,z);scene.add(light)}
 const beamMat=new T.MeshBasicMaterial({color:0xc9a287,transparent:true,opacity:.035,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 for(const z of [2,-8,-18])for(const x of [-4,4]){const beam=new T.Mesh(new T.ConeGeometry(1.8,7,16,1,true),beamMat);beam.position.set(x*.5,3.3,z);beam.rotation.z=x>0?-.30:.30;group.add(beam)}
 // Batch static architecture by shared geometry/material to reduce mobile draw calls.
 const batches=new Map();for(const object of [...group.children]){if(!object.isMesh||object.isInstancedMesh)continue;const key=object.geometry.uuid+object.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(object)}
 for(const objects of batches.values()){if(objects.length<2)continue;const mesh=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);objects.forEach((object,i)=>{object.updateMatrix();mesh.setMatrixAt(i,object.matrix);group.remove(object)});group.add(mesh)}
 function update(time){walkers.forEach((w,i)=>{const p=runwayPose(time,i);w.root.position.set(i%2===0?-.5:.5,p.bob,p.z);w.root.rotation.y=.025*Math.sin(time*2.7+i);w.legs[0].rotation.x=p.stride;w.legs[1].rotation.x=-p.stride;w.knees[0].rotation.x=-p.knee;w.knees[1].rotation.x=-Math.max(0,-Math.cos(time*2.7+i*Math.PI))*.36;w.arms[0].rotation.x=-p.stride*.65;w.arms[1].rotation.x=p.stride*.65;});}
 update(0);
 function dispose(){const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
 return {scene,walkers,update,dispose};
}
export function mountRunway(host){
 const compact=matchMedia('(max-width:760px)').matches;let renderer;
 try{renderer=new T.WebGLRenderer({antialias:!compact,alpha:false,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,compact?1.2:1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const world=createRunwayWorld({compact}),camera=new T.PerspectiveCamera(compact?55:46,1,.1,100);let current=host,mode='cover',progress=0,time=0,last=0,frame=0,visible=false,active=true,lost=false,disposed=false;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');const paused=()=>reduced.matches||document.body.classList.contains('motion-paused');
 function draw(){if(disposed||lost)return;const p=cameraPose(paused()?0:progress,mode,current.clientWidth<760);camera.position.set(p.x,p.y,p.z);camera.lookAt(0,1.5,p.lookZ);renderer.render(world.scene,camera);}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
 function tick(now){frame=0;if(!active||!visible||document.hidden||paused()||lost||disposed)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;world.update(time);draw();frame=requestAnimationFrame(tick);}
 function start(){if(!frame&&active&&visible&&!document.hidden&&!paused()&&!lost&&!disposed)frame=requestAnimationFrame(tick);}
 function resize(){const r=current.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);draw();}
 const ro=new ResizeObserver(resize),io=new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;if(visible){resize();start()}else stop()});
 function attach(next){if(disposed)return;current.classList.remove('runway-ready');ro.disconnect();io.disconnect();current=next;current.append(renderer.domElement);current.classList.add('runway-ready');ro.observe(current);io.observe(current);resize();}
 function sync(){if(document.hidden||paused())stop();else start();draw()}
 renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;stop();current.classList.remove('runway-ready')});renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;current.classList.add('runway-ready');resize();start()});
 document.addEventListener('visibilitychange',sync);addEventListener('space:motion',sync);reduced.addEventListener('change',sync);attach(host);
 function dispose(){if(disposed)return;disposed=true;stop();ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',sync);removeEventListener('space:motion',sync);reduced.removeEventListener('change',sync);world.dispose();renderer.dispose();renderer.domElement.remove();current.classList.remove('runway-ready')}
 addEventListener('pagehide',e=>{if(e.persisted)stop();else dispose()});addEventListener('pageshow',sync);
 return {attach,setState(nextMode,p=0,on=true){mode=nextMode;progress=clamp(p);active=on;if(!on)stop();else start();if(paused()||!visible)draw()},dispose};
}

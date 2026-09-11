import * as THREE from '../vendor/three.module.js';

// An abstract kinetic sculpture; all geometry and lighting are local.
export function createEntranceSculpture() {
  const group = new THREE.Group();
  const chrome = new THREE.MeshStandardMaterial({color:0xdce8f3,metalness:1,roughness:.14,envMapIntensity:1.8});
  const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.24,.36,176,24,2,3),chrome);
  core.rotation.set(.35,-.2,.1);group.add(core);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.1,.013,8,180),new THREE.MeshBasicMaterial({color:0x8ce9ff,transparent:true,opacity:.58}));
  halo.rotation.set(.95,.4,-.35);group.add(halo);
  const satellite = new THREE.Mesh(new THREE.IcosahedronGeometry(.105,2),new THREE.MeshStandardMaterial({color:0xff885c,emissive:0xc94e27,emissiveIntensity:.5,metalness:.5,roughness:.3}));
  group.add(satellite);
  function update(time, x = 0, y = 0) {
    core.rotation.y = time*.11 + x*.16;
    core.rotation.x = .35 + Math.sin(time*.23)*.15 + y*.13;
    core.rotation.z = Math.sin(time*.16)*.12;
    core.position.y = Math.sin(time*.7)*.07;
    halo.rotation.z = -.35 + time*.055;
    satellite.position.set(Math.cos(time*.36)*2.1,Math.sin(time*.36)*1.3,Math.sin(time*.36)*1.65);
    group.rotation.y = x*.06;
  }
  update(0);
  return {group,core,halo,update};
}
export function mountEntranceScene(host) {
  let renderer;
  try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});} catch {return null;}
  const compact=matchMedia('(max-width:760px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,compact?1.25:1.65));
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,40);
  camera.position.set(0,0,8.2);
  const environment=new THREE.Scene();environment.background=new THREE.Color(0x131c28);
  const lights=[];
  for(const [x,y,z,sx,sy,color] of [[-3,3,3,3,5,0xeaf6ff],[4,1,1,2,7,0x6ed9ff],[0,-4,2,6,2,0xffae89],[0,4,-3,7,3,0xffffff]]) {
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(sx,sy),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
    panel.position.set(x,y,z);panel.lookAt(0,0,0);environment.add(panel);lights.push(panel);
  }
  const generator=new THREE.PMREMGenerator(renderer);
  const environmentTarget=generator.fromScene(environment,.06);scene.environment=environmentTarget.texture;
  generator.dispose();lights.forEach(panel=>{panel.geometry.dispose();panel.material.dispose();});
  const sculpture=createEntranceSculpture();scene.add(sculpture.group);
  const fill=new THREE.DirectionalLight(0xb5e8ff,2);fill.position.set(2,4,5);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xff9d76,1);rim.position.set(-3,-2,2);scene.add(rim);
  let frame=0,last=0,time=0,visible=true,paused=document.body.classList.contains('motion-paused'),lost=false;
  let tx=0,ty=0,x=0,y=0;
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  function render(){if(!lost)renderer.render(scene,camera);}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function animate(now){
    frame=0;if(!visible||paused||motion.matches||document.hidden||lost)return;
    const delta=last?Math.min((now-last)/1000,.04):0;last=now;time+=delta;
    x+=(tx-x)*(1-Math.exp(-delta*3));y+=(ty-y)*(1-Math.exp(-delta*3));
    sculpture.update(time,x,y);render();frame=requestAnimationFrame(animate);
  }
  function start(){if(!frame&&visible&&!paused&&!motion.matches&&!document.hidden&&!lost)frame=requestAnimationFrame(animate);}
  function resize(){
    const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;
    camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();
    sculpture.group.scale.setScalar(camera.aspect<.8?.82:1);
    renderer.setSize(rect.width,rect.height,false);render();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){resize();start();}else stop();});visibilityObserver.observe(host);
  const pointerTarget=host.closest('.auth-welcome');
  function pointer(event){if(paused||motion.matches)return;const rect=host.getBoundingClientRect();tx=(event.clientX-rect.left)/rect.width*2-1;ty=(event.clientY-rect.top)/rect.height*2-1;}
  function leave(){tx=0;ty=0;}
  if(matchMedia('(pointer:fine)').matches){pointerTarget.addEventListener('pointermove',pointer,{passive:true});pointerTarget.addEventListener('pointerleave',leave);}
  function sync(){paused=document.body.classList.contains('motion-paused')||motion.matches;if(paused||document.hidden)stop();else start();}
  document.addEventListener('visibilitychange',sync);window.addEventListener('space:motion',sync);motion.addEventListener('change',sync);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();host.classList.remove('ready');pointerTarget.classList.remove('has-live-art');});
  host.appendChild(renderer.domElement);resize();host.classList.add('ready');pointerTarget.classList.add('has-live-art');start();
  function dispose(){
    stop();resizeObserver.disconnect();visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange',sync);window.removeEventListener('space:motion',sync);motion.removeEventListener('change',sync);
    pointerTarget.removeEventListener('pointermove',pointer);pointerTarget.removeEventListener('pointerleave',leave);
    sculpture.group.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});environmentTarget.dispose();renderer.dispose();renderer.domElement.remove();
  }
  window.addEventListener('pagehide',event=>{if(event.persisted)stop();else dispose();});
  window.addEventListener('pageshow',sync);
  return {dispose};
}

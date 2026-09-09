import * as THREE from '../vendor/three.module.js';
import {createMuseum} from './museum.js';
export function mountGallery({stage,host,dialog,paused=false}) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(43,1,.1,100);
  camera.position.set(0,.25,8.5);
  scene.add(new THREE.HemisphereLight('#e9f5dc','#253b12',2.1));
  const key=new THREE.DirectionalLight('#ffffff',3.8);key.position.set(-3,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight('#d6fc52',3);rim.position.set(4,1,-2);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const globe=new THREE.Mesh(new THREE.SphereGeometry(1.6,48,32),new THREE.MeshStandardMaterial({color:'#dbe8c9',roughness:.45,metalness:.15}));
  const orbit=new THREE.Group();
  const chrome=new THREE.MeshStandardMaterial({color:'#d9e4d0',metalness:.7,roughness:.22});
  const accent=new THREE.MeshStandardMaterial({color:'#d6fc52',metalness:.35,roughness:.23});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.018,8,100),accent);ring.rotation.set(1,.5,0);orbit.add(ring);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.18,.012,8,100),chrome);ring2.rotation.set(.4,1,0);orbit.add(ring2);
  let museum,active=false,contextLost=false,frame=0,last=0,time=0;
  function renderStill(){if(!contextLost&&dialog.open)renderer.render(scene,camera);}
  const open=document.createElement('button');open.type='button';open.className='gallery-link';open.textContent='Apri questa sezione ↗';
  dialog.querySelector('.gallery-hint').append(open);
  museum=createMuseum(THREE,{scene,group,globe,orbit,chrome,accent,camera,renderStill,overlay:document.getElementById('authOverlay'),holders:new Map(),controlsHosts:[stage],dragHosts:[host],navigate:false,onSelect:name=>{open.onclick=()=>{window.showModule(name);dialog.close()}}});
  museum.setPaused(paused);
  new THREE.TextureLoader().load(new URL('../assets/earth.jpg',import.meta.url).href,texture=>{texture.colorSpace=THREE.SRGBColorSpace;globe.material.map=texture;globe.material.needsUpdate=true;renderStill()});
  function resize(){if(!dialog.open)return;const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height,false);renderStill()}
  const observer=new ResizeObserver(resize);observer.observe(host);
  function tick(now){
    if(!active||document.hidden||contextLost)return;
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!museum.paused)time+=dt;
    museum.tick(dt,time,false);renderStill();
    frame=requestAnimationFrame(tick);
  }
  function start(){if(active)return;active=true;last=0;resize();frame=requestAnimationFrame(tick)}
  function stop(){active=false;cancelAnimationFrame(frame);last=0}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(dialog.open)start()});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;stop();const msg=document.getElementById('galleryLoading');msg.textContent='La visualizzazione 3D è stata interrotta. Ricarica la pagina per riaprirla.';msg.hidden=false;});
  return {start,stop,setPaused:value=>museum.setPaused(value)};
}

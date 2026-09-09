import * as THREE from '../vendor/three.module.js';

const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const overlay=document.getElementById('authOverlay');
const authArt=document.getElementById('authArt');
const homeArt=document.getElementById('homeArt');
const holders=new Map([['home',homeArt]]);
for(const el of document.querySelectorAll('.page-hero')){const holder=document.createElement('div');holder.className='cinema-art';holder.setAttribute('aria-hidden','true');el.append(holder);holders.set(el.closest('.module').id.replace('mod-',''),holder)}
const wipe=document.createElement('div');wipe.className='scene-wipe';wipe.setAttribute('aria-hidden','true');document.body.append(wipe);
let current='home',host=authArt,visible=true,renderer;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(0,0,8.5);
scene.add(new THREE.HemisphereLight(0xddeeff,0x323991,2.8));
const key=new THREE.DirectionalLight(0xffffff,3.7);key.position.set(-3,5,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xf298e0,4.5);rim.position.set(5,0,-3);scene.add(rim);
const group=new THREE.Group();group.rotation.z=-.19;scene.add(group);
const orbit=new THREE.Group();group.add(orbit);
const earthMaterial=new THREE.MeshStandardMaterial({color:'#cce6ff',metalness:.22,roughness:.48});
const globe=new THREE.Mesh(new THREE.SphereGeometry(1.68,64,48),earthMaterial);globe.rotation.y=2;group.add(globe);
const loader=new THREE.TextureLoader();loader.load('../assets/earth.jpg',texture=>{texture.colorSpace=THREE.SRGBColorSpace;earthMaterial.map=texture;earthMaterial.needsUpdate=true;renderStill()},undefined,()=>{earthMaterial.color.set('#4386e4');renderStill()});
const chrome=new THREE.MeshStandardMaterial({color:'#dbedff',metalness:.8,roughness:.17});
loader.load('../assets/backgrounds/chrome-liquid.jpg',texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;scene.environment=texture;chrome.envMapIntensity=1.3;renderStill()},undefined,()=>{});
const accent=new THREE.MeshStandardMaterial({color:'#bdff81',metalness:.35,roughness:.24});
function ring(radius,tube,mat,rx,ry){const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,110),mat);m.rotation.set(rx,ry,0);orbit.add(m);return m}
ring(2.07,.055,chrome,1.1,.1);ring(2.12,.015,accent,-.7,.5);
const satellites=[];
for(let i=0;i<12;i++){const mat=i%3===0?accent:chrome;const mesh=new THREE.Mesh(i%3?new THREE.IcosahedronGeometry(.10+i%3*.055,0):new THREE.TorusGeometry(.16,.044,8,28),mat);mesh.userData.angle=i*Math.PI*2/12;mesh.userData.radius=2.25+(i%3)*.3;mesh.userData.height=(i%4-1.5)*.68;orbit.add(mesh);satellites.push(mesh)}
const stars=new THREE.Group();scene.add(stars);for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.018+(i%3)*.012),chrome);m.position.set(Math.sin(i*23)*4,Math.cos(i*7)*2.4,Math.sin(i*13)*2-2);stars.add(m)}
const moods={orbit:{earth:'#cce6ff',accent:'#bdff81',rim:'#f298e0'},pink:{earth:'#ffe3ef',accent:'#b12a64',rim:'#ff4b99'},night:{earth:'#c6efdf',accent:'#dfff8e',rim:'#6972ff'}};
function setMood(name){const mood=moods[name]||moods.orbit;document.body.dataset.mood=name;earthMaterial.color.set(mood.earth);accent.color.set(mood.accent);rim.color.set(mood.rim);document.querySelectorAll('.mood-controls button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mood===name)));renderStill()}
document.querySelectorAll('.mood-controls button').forEach(b=>b.addEventListener('click',()=>setMood(b.dataset.mood)));
let pointerX=0,pointerY=0,scroll=0,last=0,time=0;
addEventListener('pointermove',e=>{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5},{passive:true});
addEventListener('scroll',()=>{scroll=Math.min(scrollY/Math.max(innerHeight*.8,1),1);document.documentElement.style.setProperty('--hero-progress',String(scroll));if(reduce.matches)renderStill()},{passive:true});
function resize(){if(!renderer||!host)return;const r=host.getBoundingClientRect();if(r.width<1||r.height<1)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);renderStill()}
function renderStill(){if(renderer){renderer.render(scene,camera)}}
const observation=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.target===host)visible=entry.isIntersecting},{rootMargin:'70px'});
function updateHost(){const authenticated=overlay.classList.contains('hidden');const next=authenticated?(holders.get(current)||homeArt):authArt;
 document.body.classList.toggle('auth-pending',!authenticated);
 for(const el of document.querySelectorAll('body>header,body>main,body>footer,#musicWidget,#searchOverlay'))el.inert=!authenticated;
 if(host!==next){observation.unobserve(host);host=next;host.append(renderer?.domElement||document.createComment('3D'));observation.observe(host);visible=true;resize()}
 if(authenticated)setMood(current==='contatti'?'pink':current==='esperimenti'?'night':'orbit');
}
new MutationObserver(updateHost).observe(overlay,{attributes:true,attributeFilter:['class']});
addEventListener('workspace:module',e=>{current=e.detail;updateHost();if(!reduce.matches){wipe.classList.remove('playing');void wipe.offsetWidth;wipe.classList.add('playing')}resize()});
try{
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;authArt.append(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);renderer.domElement.style.display='none'});
 observation.observe(host);current=document.querySelector('.module.active')?.id.replace('mod-','')||'home';updateHost();resize();
 renderer.setAnimationLoop(now=>{if(!visible||document.hidden)return;if(reduce.matches){if(now-last<1000)return;last=now;renderStill();return}const dt=Math.min((now-last)/1000,.04);last=now;time+=dt;const targetX=pointerX*.25,targetY=pointerY*.15;
  globe.rotation.y+=dt*.075;orbit.rotation.y=time*.16;group.rotation.y+=(targetX-group.rotation.y)*.04;group.rotation.x+=(targetY-group.rotation.x)*.04;
  group.position.y=Math.sin(time*.65)*.08-(host===homeArt?scroll*.5:0);group.rotation.z=-.19+Math.sin(time*.28)*.035+(host===homeArt?scroll*.25:0);
  const compact=host!==authArt&&host!==homeArt;group.scale.setScalar(compact?.76:1);
  for(const s of satellites){const a=s.userData.angle;s.position.set(Math.cos(a)*s.userData.radius,s.userData.height+Math.sin(time*.6+a)*.08,Math.sin(a)*s.userData.radius*.55);s.rotation.x=time*.2+a;s.rotation.z=time*.1+a}
  stars.rotation.z=time*.012;renderer.render(scene,camera);
 });
 addEventListener('resize',resize);new ResizeObserver(resize).observe(authArt);new ResizeObserver(resize).observe(homeArt);
}catch(error){console.warn('La grafica 3D non è disponibile. Tutte le funzioni restano utilizzabili.',error);updateHost()}

// Keep focus inside the original login/recovery controls until a real session exists.
overlay.addEventListener('keydown',e=>{if(e.key!=='Tab'||overlay.classList.contains('hidden'))return;const list=[...overlay.querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);if(!list.length)return;const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});

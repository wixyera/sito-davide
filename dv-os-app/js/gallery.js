import * as THREE from '../vendor/three.module.js';
import {createMuseum} from './museum.js';

const ROOMS = [
  ['home', 'Orbita terrestre', 'Il punto da cui tutto comincia.'],
  ['calendario', 'Il ritmo del tempo', 'Dai spazio ai tuoi prossimi giorni.'],
  ['percorso', 'Ascensione', 'Ogni esperienza costruisce la successiva.'],
  ['contatti', 'Costellazioni umane', 'Le connessioni che danno forma al tuo mondo.'],
  ['wishlist', 'Desideri in movimento', 'Le possibilità ancora da esplorare.'],
  ['spese', 'Equilibrio', 'Una prospettiva sulle tue risorse.'],
  ['esperimenti', 'Materia delle idee', 'Il luogo in cui la curiosità prende forma.']
];

const isOpen = dialog => Boolean(dialog?.open || dialog?.hasAttribute?.('open'));
const raf = callback => (globalThis.requestAnimationFrame ? requestAnimationFrame(callback) : setTimeout(() => callback(performance.now()), 16));
const cancelRaf = id => (globalThis.cancelAnimationFrame ? cancelAnimationFrame(id) : clearTimeout(id));

function addGalleryLink(dialog, getRoom) {
  const hint = dialog.querySelector('.gallery-hint');
  let link = hint?.querySelector('.gallery-link');
  if (!link && hint) {
    link = document.createElement('button');
    link.type = 'button';
    link.className = 'gallery-link';
    hint.append(link);
  }
  if (link) {
    link.textContent = 'Apri questa sezione ↗';
    link.onclick = () => {
      const moduleName = getRoom();
      if (typeof window.showModule === 'function') window.showModule(moduleName);
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    };
  }
  return link;
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2', {powerPreference: 'low-power'}) || canvas.getContext('webgl', {powerPreference: 'low-power'}) || canvas.getContext('experimental-webgl'));
  } catch (_) {
    return false;
  }
}

/**
 * A lightweight CSS gallery for browsers which block WebGL (privacy mode,
 * older iOS, remote desktops). It keeps the exact same rooms and controls so
 * the experience never degrades into an error message.
 */
function mountFallbackGallery({stage, host, dialog, paused = false}) {
  host.replaceChildren();
  host.classList.add('gallery-art-fallback');
  const visual = document.createElement('div');
  visual.className = 'gallery-fallback';
  visual.innerHTML = `
    <div class="fallback-stars" aria-hidden="true"></div>
    <div class="fallback-halo" aria-hidden="true"></div>
    <div class="fallback-orbit fallback-orbit-a" aria-hidden="true"></div>
    <div class="fallback-orbit fallback-orbit-b" aria-hidden="true"></div>
    <div class="fallback-orbit fallback-orbit-c" aria-hidden="true"></div>
    <div class="fallback-core" aria-hidden="true"><span></span><i></i></div>
    <div class="fallback-scan" aria-hidden="true"></div>
    <div class="fallback-console">
      <div class="museum-caption"><span class="museum-count"></span><strong></strong><small></small></div>
      <div class="museum-buttons">
        <button type="button" data-art="prev" aria-label="Sala precedente">←</button>
        <button type="button" data-art="next" aria-label="Sala successiva">→</button>
        <button type="button" data-art="pause" aria-label="Ferma le animazioni" aria-pressed="false">Ⅱ</button>
      </div>
    </div>
    <span class="fallback-badge">Trascina per esplorare</span>`;
  host.append(visual);
  const loading = document.getElementById('galleryLoading');
  if (loading) loading.hidden = true;

  let selected = 0;
  let running = false;
  let localPaused = Boolean(paused);
  let frame = 0;
  let time = 0;
  let last = 0;
  let angle = 0;
  let tilt = 0;
  let drag = null;
  const title = visual.querySelector('.museum-caption strong');
  const copy = visual.querySelector('.museum-caption small');
  const count = visual.querySelector('.museum-count');
  const pauseButton = visual.querySelector('[data-art="pause"]');
  const update = () => {
    const room = ROOMS[selected];
    count.textContent = `SALA ${String(selected + 1).padStart(2, '0')} / 07 · MUSEO PERSONALE`;
    title.textContent = room[1];
    copy.textContent = room[2];
    pauseButton.textContent = localPaused ? '▷' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', localPaused ? 'Riprendi le animazioni' : 'Ferma le animazioni');
    pauseButton.setAttribute('aria-pressed', String(localPaused));
    visual.dataset.room = String(selected);
    visual.classList.toggle('fallback-paused', localPaused);
    visual.style.setProperty('--fallback-angle', `${angle}deg`);
    visual.style.setProperty('--fallback-tilt', `${tilt}deg`);
    addGalleryLink(dialog, () => room[0]);
  };
  const choose = step => {
    selected = (selected + step + ROOMS.length) % ROOMS.length;
    update();
  };
  visual.querySelector('[data-art="prev"]').onclick = () => choose(-1);
  visual.querySelector('[data-art="next"]').onclick = () => choose(1);
  pauseButton.onclick = () => {
    localPaused = !localPaused;
    update();
    window.dispatchEvent(new CustomEvent('space:gallery-motion', {detail: {paused: localPaused}}));
  };
  host.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
    host.setPointerCapture?.(event.pointerId);
    host.classList.add('dragging');
  });
  host.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    angle += (event.clientX - drag.x) * 0.32;
    tilt = Math.max(-14, Math.min(14, tilt + (event.clientY - drag.y) * 0.16));
    drag.x = event.clientX; drag.y = event.clientY;
    update();
  });
  const release = () => { drag = null; host.classList.remove('dragging'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => host.addEventListener(type, release));

  const tick = now => {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!localPaused && !document.hidden) {
      time += dt;
      visual.style.setProperty('--fallback-time', String(time));
    }
    frame = raf(tick);
  };
  const start = () => { if (!running) { running = true; last = 0; frame = raf(tick); } };
  const stop = () => { running = false; cancelRaf(frame); last = 0; };
  const setPaused = value => { localPaused = Boolean(value); update(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (isOpen(dialog)) start(); });
  update();
  return {start, stop, setPaused, get paused() { return localPaused; }};
}

function mountWebGLGallery({stage, host, dialog, paused = false}) {
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.replaceChildren(renderer.domElement);
  host.classList.remove('gallery-art-fallback');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 100);
  camera.position.set(0, .25, 8.5);
  scene.add(new THREE.HemisphereLight('#e9f5dc', '#253b12', 2.1));
  const key = new THREE.DirectionalLight('#ffffff', 3.8); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#d6fc52', 3); rim.position.set(4, 1, -2); scene.add(rim);
  const group = new THREE.Group(); scene.add(group);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 32), new THREE.MeshStandardMaterial({color: '#dbe8c9', roughness: .45, metalness: .15}));
  const orbit = new THREE.Group();
  const chrome = new THREE.MeshStandardMaterial({color: '#d9e4d0', metalness: .7, roughness: .22});
  const accent = new THREE.MeshStandardMaterial({color: '#d6fc52', metalness: .35, roughness: .23});
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2, .018, 8, 100), accent); ring.rotation.set(1, .5, 0); orbit.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.18, .012, 8, 100), chrome); ring2.rotation.set(.4, 1, 0); orbit.add(ring2);
  let museum;
  let active = false;
  let contextLost = false;
  let frame = 0;
  let last = 0;
  let time = 0;
  let selectedName = 'home';
  let fallbackApi = null;
  const renderStill = () => { if (!contextLost && isOpen(dialog)) renderer.render(scene, camera); };
  addGalleryLink(dialog, () => selectedName);
  museum = createMuseum(THREE, {
    scene, group, globe, orbit, chrome, accent, camera, renderStill,
    overlay: document.getElementById('authOverlay'), holders: new Map(),
    controlsHosts: [stage], dragHosts: [host], navigate: false,
    onSelect: name => { selectedName = name; addGalleryLink(dialog, () => selectedName); }
  });
  museum.setPaused(paused);
  new THREE.TextureLoader().load(new URL('../assets/earth.jpg', import.meta.url).href, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    globe.material.map = texture;
    globe.material.needsUpdate = true;
    renderStill();
  });
  const resize = () => {
    if (!isOpen(dialog)) return;
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
    renderStill();
  };
  const observer = globalThis.ResizeObserver ? new ResizeObserver(resize) : null;
  if (observer) observer.observe(host); else window.addEventListener('resize', resize, {passive: true});
  const tick = now => {
    if (!active || document.hidden || contextLost) return;
    const dt = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now;
    if (!museum.paused) time += dt;
    museum.tick(dt, time, false);
    renderStill();
    frame = raf(tick);
  };
  const start = () => { if (!active) { active = true; last = 0; resize(); frame = raf(tick); } };
  const stop = () => { active = false; cancelRaf(frame); last = 0; };
  const recover = () => {
    if (fallbackApi) return;
    contextLost = true;
    stop();
    observer?.disconnect();
    fallbackApi = mountFallbackGallery({stage, host, dialog, paused: museum.paused});
    fallbackApi.start();
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (isOpen(dialog)) start(); });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); recover(); });
  return {
    start: () => (fallbackApi ? fallbackApi.start() : start()),
    stop: () => (fallbackApi ? fallbackApi.stop() : stop()),
    setPaused: value => (fallbackApi ? fallbackApi.setPaused(value) : museum.setPaused(value)),
    get paused() { return fallbackApi ? fallbackApi.paused : museum.paused; }
  };
}

export function mountGallery(options) {
  try {
    if (!canUseWebGL()) throw new Error('WebGL non disponibile');
    return mountWebGLGallery(options);
  } catch (error) {
    console.info('SPACE gallery: uso il fallback visuale', error);
    return mountFallbackGallery(options);
  }
}

/* ===================================================================
   EFFETTO RIPPLE SUI PULSANTI (feedback visivo al click)
   =================================================================== */
document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  btn.classList.remove('rippling');
  void btn.offsetWidth;
  btn.classList.add('rippling');
  setTimeout(() => btn.classList.remove('rippling'), 550);
});

/* ===================================================================
   LOADER, CURSORE PERSONALIZZATO
   =================================================================== */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

const loader = document.getElementById('loader');
const loaderText = document.getElementById('loaderText');
const bootMsgs = ['INIZIALIZZAZIONE SISTEMA...', 'CARICAMENTO MODULI... OK', 'SINCRONIZZAZIONE DATI...', 'PRONTO'];
if (reducedMotion) {
  loader.classList.add('hide');
} else {
  let mi = 0;
  const bootInterval = setInterval(() => {
    mi++;
    if (mi < bootMsgs.length) loaderText.textContent = bootMsgs[mi];
    else { clearInterval(bootInterval); setTimeout(() => loader.classList.add('hide'), 400); }
  }, 420);
}

if (!isTouch && !reducedMotion) {
  const ret = document.getElementById('reticle');
  let rx = 0, ry = 0, mx = 0, my = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() { rx += (mx - rx) * .2; ry += (my - ry) * .2; ret.style.left = rx + 'px'; ret.style.top = ry + 'px'; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => { if (e.target.closest('a,button,.track-item,.cal-day:not(.empty)')) ret.classList.add('grow'); });
  document.addEventListener('mouseout', e => { if (e.target.closest('a,button,.track-item,.cal-day:not(.empty)')) ret.classList.remove('grow'); });
} else {
  document.body.classList.add('no-cursor');
}

/* ===================================================================
   OROLOGIO + SALUTO HOME (dinamico in base all'utente)
   =================================================================== */
const dowNames = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function updateClock() {
  const now = new Date();
  document.getElementById('clockTime').textContent = now.toLocaleTimeString('it-IT');
  document.getElementById('clockDate').textContent = `${dowNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  const h = now.getHours();
  const name = window.jarvisDisplayName || 'UTENTE';
  let saluto;
  if (h >= 5 && h < 12) saluto = `Buongiorno, ${name}`;
  else if (h >= 12 && h < 18) saluto = `Buon pomeriggio, ${name}`;
  else if (h >= 18 && h < 23) saluto = `Buonasera, ${name}`;
  else saluto = `Buonanotte, ${name}`;
  document.getElementById('greetingText').textContent = saluto;
}
updateClock();
setInterval(updateClock, 1000);

/* ===================================================================
   NAVIGAZIONE TRA MODULI
   =================================================================== */
const tabBtns = document.querySelectorAll('.tab-btn');
const modules = document.querySelectorAll('.module');

function showModule(name) {
  modules.forEach(m => m.classList.toggle('active', m.id === 'mod-' + name));
  tabBtns.forEach(b => b.classList.toggle('active', b.dataset.module === name));
  document.body.classList.remove('landing-mode');
  document.getElementById('tabNav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
}
tabBtns.forEach(b => b.addEventListener('click', () => showModule(b.dataset.module)));
document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => showModule(b.dataset.goto)));
document.getElementById('navToggle').addEventListener('click', () => document.getElementById('tabNav').classList.toggle('open'));

/* HOME riporta sempre alla schermata JARVIS */
(function () {
  function jarvisHome() {
    document.body.classList.add('landing-mode');
    modules.forEach(m => m.classList.toggle('active', m.id === 'mod-home'));
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.module === 'home'));
    const zone = document.getElementById('landingOrbZone');
    if (zone) zone.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.tab-btn[data-module="home"]');
    if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation(); jarvisHome();
  }, true);
})();

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.body.classList.add('landing-mode');
    modules.forEach(m => m.classList.toggle('active', m.id === 'mod-home'));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
});

/* ===================================================================
   LANDING JARVIS: SALUTO + OROLOGIO DINAMICI
   =================================================================== */
const landingOrbZone = document.getElementById('landingOrbZone');
const landingOrb = document.getElementById('landingOrb');
const landingGreeting = document.getElementById('landingGreeting');
const landingClock = document.getElementById('landingClock');
const landingDate = document.getElementById('landingDate');

function updateLandingClock() {
  const now = new Date();
  const h = now.getHours();
  const greetingWord = h < 12 ? 'BUONGIORNO' : (h < 18 ? 'BUON POMERIGGIO' : 'BUONASERA');
  const name = window.jarvisDisplayName || 'UTENTE';
  if (landingGreeting) landingGreeting.innerHTML = `${greetingWord}, <span class="lj-name">${name}</span>`;
  if (landingClock) landingClock.textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (landingDate) landingDate.textContent = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}
updateLandingClock();
setInterval(updateLandingClock, 1000);

landingOrb?.addEventListener('click', e => { e.stopPropagation(); landingOrbZone.classList.toggle('open'); });
document.querySelectorAll('[data-landing]').forEach(b => b.addEventListener('click', () => {
  showModule(b.dataset.landing);
  landingOrbZone.classList.remove('open');
}));


/* ---------- Icone SVG condivise per i bottoni azione (EDIT/DEL/ICS) ---------- */
const ICON_EDIT = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DEL = '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
const ICON_ICS = '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/></svg>';

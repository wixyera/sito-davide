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
   LOADER
   =================================================================== */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const loader = document.getElementById('loader');
if (reducedMotion) {
  loader.classList.add('hide');
} else {
  setTimeout(() => loader.classList.add('hide'), 650);
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

const MODULE_TITLES = {
  home: 'Home', calendario: 'Calendario', percorso: 'Percorso', contatti: 'Contatti',
  wishlist: 'Wishlist', spese: 'Spese', esperimenti: 'Progetti'
};

function showModule(name) {
  modules.forEach(m => m.classList.toggle('active', m.id === 'mod-' + name));
  tabBtns.forEach(b => {
    const active = b.dataset.module === name;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
    b.setAttribute('tabindex', active ? '0' : '-1');
  });
  document.getElementById('tabNav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  document.title = MODULE_TITLES[name] ? `${MODULE_TITLES[name]} — Davide Villano` : 'Davide Villano — Personal Workspace';
  try { localStorage.setItem('dv_os_last_module', name); } catch (_) {}
  // sposta il focus sul contenuto del modulo appena aperto: utile per chi
  // naviga con lettore di schermo o solo tastiera, senza rubare il focus
  // quando il cambio parte da un click col mouse.
  const panel = document.getElementById('mod-' + name);
  if (panel && document.activeElement && document.activeElement.matches('.tab-btn, [data-goto]')) {
    setTimeout(() => panel.focus({ preventScroll: true }), reducedMotion ? 0 : 350);
  }
}
tabBtns.forEach(b => b.addEventListener('click', () => showModule(b.dataset.module)));
document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => showModule(b.dataset.goto)));
document.getElementById('navToggle').addEventListener('click', () => document.getElementById('tabNav').classList.toggle('open'));

/* Frecce sinistra/destra per muoversi tra i tab quando uno di essi ha il focus,
   come da comportamento standard ARIA per role="tablist" */
document.getElementById('tabNav').addEventListener('keydown', e => {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
  const list = Array.from(tabBtns);
  const i = list.indexOf(document.activeElement);
  if (i === -1) return;
  e.preventDefault();
  let next;
  if (e.key === 'ArrowRight') next = list[(i + 1) % list.length];
  else if (e.key === 'ArrowLeft') next = list[(i - 1 + list.length) % list.length];
  else if (e.key === 'Home') next = list[0];
  else next = list[list.length - 1];
  next.focus();
  showModule(next.dataset.module);
});

/* ---------- Icone SVG condivise per i bottoni azione (EDIT/DEL/ICS) ---------- */
const ICON_EDIT = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICON_DEL = '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
const ICON_ICS = '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/></svg>';

/* ===================================================================
   TOAST — notifiche non invasive al posto di alert()/confirm() per gli
   errori di salvataggio. Restano visibili qualche secondo e si possono
   chiudere subito col tasto x.
   =================================================================== */
let toastStack = document.getElementById('toastStack');
if (!toastStack) {
  toastStack = document.createElement('div');
  toastStack.id = 'toastStack';
  toastStack.setAttribute('aria-live', 'polite');
  toastStack.setAttribute('role', 'status');
  document.body.appendChild(toastStack);
}

function showToast(message, type = 'info', duration = 4200) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-msg"></span><button type="button" class="toast-close" aria-label="Chiudi">×</button>`;
  el.querySelector('.toast-msg').textContent = message;
  el.querySelector('.toast-close').addEventListener('click', () => removeToast(el));
  toastStack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  const timer = setTimeout(() => removeToast(el), duration);
  el.dataset.timer = timer;
  return el;
}
function removeToast(el) {
  clearTimeout(el.dataset.timer);
  el.classList.remove('in');
  el.classList.add('out');
  setTimeout(() => el.remove(), 260);
}

/* Wrapper compatibili con il vecchio stile "alert('Errore nel salvataggio: ' + err.message)" */
function toastError(message) { return showToast(message, 'error'); }
function toastSuccess(message) { return showToast(message, 'success'); }
function toastInfo(message) { return showToast(message, 'info'); }

/* ===================================================================
   BANNER OFFLINE — avvisa quando la connessione cade DAVVERO e quando
   torna, in coppia col fallback offline del service worker (dati in
   cache).
   FIX: prima ci si fidava solo di navigator.onLine, ma quella proprietà
   dice solo se il dispositivo ha un'interfaccia di rete attiva, non se
   internet funziona davvero — in molti browser/webview/anteprime può
   restare bloccata su false anche quando la connessione c'è, e il
   banner finiva per restare acceso per sempre. Ora, oltre a reagire
   agli eventi online/offline, verifichiamo la connettività reale con
   una piccola richiesta di rete: il banner si accende solo se quella
   richiesta fallisce per davvero, e si spegne appena una va a buon
   fine (richiesta HEAD, cache:'no-store', così bypassa anche la cache
   del service worker invece di darci un falso "online").
   =================================================================== */
const offlineBanner = document.getElementById('offlineBanner');
let isReallyOffline = false;
let offlineFirstCheck = true;

function setOfflineUI(offline) {
  const changed = offline !== isReallyOffline;
  isReallyOffline = offline;
  if (offlineBanner) offlineBanner.classList.toggle('show', offline);
  if (changed && !offlineFirstCheck) {
    if (offline) showToast('Sei offline: stai vedendo l\u2019ultima versione salvata.', 'info', 5000);
    else showToast('Connessione ripristinata.', 'success', 3000);
  }
  offlineFirstCheck = false;
}

let probeInFlight = false;
async function probeConnectivity() {
  if (probeInFlight) return;
  probeInFlight = true;
  // Se il dispositivo dichiara di non avere alcuna interfaccia di rete, fidati subito
  // (nessuna richiesta potrebbe comunque partire).
  if (!navigator.onLine) { setOfflineUI(true); probeInFlight = false; return; }
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5000);
    await fetch('manifest.json?_probe=' + Date.now(), { method: 'HEAD', cache: 'no-store', signal: ctrl.signal });
    clearTimeout(timeout);
    setOfflineUI(false);
  } catch (_) {
    setOfflineUI(true);
  } finally {
    probeInFlight = false;
  }
}

window.addEventListener('online', probeConnectivity);
window.addEventListener('offline', probeConnectivity); // ri-verifica sempre con una richiesta reale
document.addEventListener('visibilitychange', () => { if (!document.hidden) probeConnectivity(); });
setInterval(probeConnectivity, 20000);
probeConnectivity();

/* ===================================================================
   SKELETON LOADING — placeholder animati mostrati mentre un modulo
   sta caricando i suoi dati per la prima volta.
   =================================================================== */
function showSkeleton(container, rows = 4) {
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('is-skeleton');
  for (let i = 0; i < rows; i++) {
    const row = document.createElement('div');
    row.className = 'skeleton-row';
    row.innerHTML = '<span class="sk-a"></span><span class="sk-b"></span>';
    container.appendChild(row);
  }
}
function clearSkeleton(container) {
  if (container) container.classList.remove('is-skeleton');
}

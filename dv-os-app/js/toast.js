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
   BANNER OFFLINE — avvisa quando la connessione cade e quando torna,
   in coppia col fallback offline del service worker (dati in cache).
   =================================================================== */
const offlineBanner = document.getElementById('offlineBanner');
function syncOnlineStatus() {
  if (!offlineBanner) return;
  if (navigator.onLine) {
    offlineBanner.classList.remove('show');
  } else {
    offlineBanner.classList.add('show');
  }
}
window.addEventListener('online', () => { syncOnlineStatus(); showToast('Connessione ripristinata.', 'success', 3000); });
window.addEventListener('offline', () => { syncOnlineStatus(); showToast('Sei offline: stai vedendo l\u2019ultima versione salvata.', 'info', 5000); });
syncOnlineStatus();

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

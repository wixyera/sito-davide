/* ===================================================================
   CONFIG SUPABASE
   =================================================================== */
const SUPABASE_URL = "https://ggysihcemzsoqxyzkfnh.supabase.co";
const SUPABASE_KEY = "sb_publishable_P7ov5aG3JO553Pp-YnTL5Q_YWLb92md";
const EVENTS_ENDPOINT = `${SUPABASE_URL}/rest/v1/events`;
const CAREER_ENDPOINT = `${SUPABASE_URL}/rest/v1/career_entries`;
const CONTACTS_ENDPOINT = `${SUPABASE_URL}/rest/v1/contacts`;
const WISHLIST_ENDPOINT = `${SUPABASE_URL}/rest/v1/wishlist_items`;
const EXPENSES_ENDPOINT = `${SUPABASE_URL}/rest/v1/expenses`;
const AUTH_ENDPOINT = `${SUPABASE_URL}/auth/v1`;
let accessToken = localStorage.getItem('dv_os_access_token') || null;
let currentUser = null;
let refreshInFlight = null;
let sessionExpiredHandled = false;

function saveSession(session) {
  if (!session?.access_token) throw new Error('Il server non ha restituito una sessione valida.');
  accessToken = session.access_token;
  localStorage.setItem('dv_os_access_token', accessToken);
  if (session.refresh_token) localStorage.setItem('dv_os_refresh_token', session.refresh_token);
  else localStorage.removeItem('dv_os_refresh_token');
  const expiry = session.expires_at ? Number(session.expires_at) * 1000 : session.expires_in ? Date.now() + Number(session.expires_in) * 1000 : 0;
  localStorage.setItem('dv_os_expires_at', String(expiry));
  currentUser = null;
  sessionExpiredHandled = false;
}
function clearSession() {
  accessToken = null; currentUser = null;
  if(typeof resetPersonalPreferences === 'function')resetPersonalPreferences();
  ['dv_os_access_token', 'dv_os_refresh_token', 'dv_os_expires_at'].forEach(key => localStorage.removeItem(key));
}
async function authRequest(path, options = {}) {
  const res = await fetch(`${AUTH_ENDPOINT}${path}`, { ...options, cache: 'no-store', signal: options.signal || AbortSignal.timeout(20000), headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error_description || data.msg || data.message || `Errore ${res.status}`);
    err.status = res.status; throw err;
  }
  return data;
}
async function refreshSession(force = false) {
  const expiry = Number(localStorage.getItem('dv_os_expires_at') || 0);
  if (!force && (!expiry || Date.now() < expiry - 60000)) return;
  if (refreshInFlight) return refreshInFlight;
  const attemptedToken = accessToken;
  const renew = async () => {
    // Another tab may have refreshed while this tab waited for the lock.
    const stored = localStorage.getItem('dv_os_access_token');
    if (stored && stored !== attemptedToken) { accessToken = stored; currentUser = null; return; }
    const token = localStorage.getItem('dv_os_refresh_token');
    if (!token) { if (force) handleExpiredSession(); return; }
    try {
      saveSession(await authRequest('/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: token }) }));
    } catch (err) {
      if ([400, 401, 403].includes(err.status)) handleExpiredSession();
      throw err;
    }
  };
  refreshInFlight = (navigator.locks?.request ? navigator.locks.request('dv-space-session', renew) : renew()).finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}
async function authorizedFetch(url, options = {}) {
  await refreshSession();
  const send = () => fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(20000), headers: { ...options.headers, apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });
  let response = await send();
  if (response.status === 401) {
    await refreshSession(true);
    if (accessToken) response = await send();
    if (response.status === 401) handleExpiredSession();
  }
  return response;
}
async function getCurrentUser() {
  if (!accessToken) return null;
  await refreshSession();
  if (currentUser) return currentUser;
  const response = await authorizedFetch(`${AUTH_ENDPOINT}/user`, { cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 401 ? 'Sessione non valida. Accedi di nuovo.' : 'Impossibile verificare l’account. Controlla la connessione e riprova.');
  currentUser = await response.json();
  return currentUser;
}
function handleExpiredSession() {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true; clearSession();
  document.getElementById('authOverlay')?.classList.remove('hidden');
  if (typeof setAuthMessage === 'function') setAuthMessage('Sessione scaduta. Accedi nuovamente.', true);
}
async function tableRequest(endpoint, path = '', options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const user = await getCurrentUser();
  if (!user) throw new Error('Devi effettuare l’accesso.');
  const url = new URL(endpoint + path);
  if (['GET', 'PATCH', 'DELETE'].includes(method)) url.searchParams.set('user_id', `eq.${user.id}`);
  if (['POST','PATCH'].includes(method) && options.body) {
    const body = JSON.parse(options.body);
    (Array.isArray(body) ? body : [body]).forEach(item => { item.user_id = user.id; });
    options = { ...options, body: JSON.stringify(body) };
  }
  const res = await authorizedFetch(url.toString(), { ...options, headers: { 'Content-Type': 'application/json', Prefer: 'return=representation', ...options.headers } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 403) throw new Error('Accesso ai dati negato. Verifica le autorizzazioni del database.');
    if (res.status === 404 || data.code === '42P01' || data.code === 'PGRST205') throw new Error('Questa sezione non è ancora configurata nel database. Consulta la guida inclusa nel sito.');
    throw new Error(data.message || `Errore ${res.status}. Riprova.`);
  }
  if (res.status === 204) return null;
  const content = await res.text();
  return content ? JSON.parse(content) : null;
}
const supabaseRequest = (path, options) => tableRequest(EVENTS_ENDPOINT, path, options);
const careerRequest = (path, options) => tableRequest(CAREER_ENDPOINT, path, options);
const contactsRequest = (path, options) => tableRequest(CONTACTS_ENDPOINT, path, options);
const wishlistRequest = (path, options) => tableRequest(WISHLIST_ENDPOINT, path, options);
const expensesRequest = (path, options) => tableRequest(EXPENSES_ENDPOINT, path, options);
window.addEventListener('storage', event => {
  if (event.key !== 'dv_os_access_token') return;
  accessToken = event.newValue; currentUser = null;
  // Remove the previous account's rendered data before any new session starts.
  location.reload();
});

/* ===================================================================
   SALUTO DINAMICO: mostra il nome dell'utente loggato ovunque
   =================================================================== */
window.jarvisDisplayName = 'UTENTE';

function applyDisplayName(user) {
  const raw =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Utente');
  const safe = String(raw).trim().split(/\s+/)[0];
  window.jarvisDisplayName = safe || 'UTENTE';
  updateClock();
}

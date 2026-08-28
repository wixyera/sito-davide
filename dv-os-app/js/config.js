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

/* ===================================================================
   RICHIESTE DI AUTENTICAZIONE
   =================================================================== */
async function authRequest(path, options = {}) {
  const res = await fetch(`${AUTH_ENDPOINT}${path}`, { ...options, headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.msg || data.message || `Errore ${res.status}`);
  return data;
}

/* ===================================================================
   UTENTE CORRENTE (unica fonte di verità, con cache)
   =================================================================== */
let currentUser = null;

async function getCurrentUser() {
  if (currentUser) return currentUser;
  if (!accessToken) return null;
  const r = await fetch(`${AUTH_ENDPOINT}/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) {
    if (r.status === 401 || r.status === 403) handleExpiredSession();
    throw new Error('Sessione non valida. Effettua nuovamente l\u2019accesso.');
  }
  currentUser = await r.json();
  return currentUser;
}

/* ===================================================================
   SESSIONE SCADUTA (mid-uso) — se un token valido all'apertura scade
   mentre l'app è già in uso (es. rimasta aperta per ore), le richieste
   successive ricevono 401 dalla API. Invece di un errore criptico
   ("JWT expired") mostriamo un messaggio chiaro e riportiamo l'utente
   al login, una sola volta anche se più richieste falliscono insieme.
   =================================================================== */
let sessionExpiredHandled = false;
function handleExpiredSession() {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  accessToken = null;
  currentUser = null;
  localStorage.removeItem('dv_os_access_token');
  if (typeof toastError === 'function') toastError('Sessione scaduta. Stai per essere riportato al login.');
  setTimeout(() => location.reload(), 1600);
}

/* ===================================================================
   RICHIESTE GENERICHE VERSO LE TABELLE "events", "career_entries" e
   "contacts", TUTTE ISOLATE PER UTENTE (ogni utente vede/modifica solo
   le proprie righe, grazie al filtro su user_id + alle policy RLS).
   =================================================================== */
async function tableRequest(endpoint, path = '', options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const user = await getCurrentUser();
  if (!user) throw new Error('Devi effettuare l\u2019accesso.');

  let finalPath = path;

  if (method === 'GET') {
    const sep = finalPath.includes('?') ? '&' : '?';
    finalPath = `${finalPath}${sep}user_id=eq.${user.id}`;
  }

  if (method === 'POST' && options.body) {
    const body = JSON.parse(options.body);
    if (Array.isArray(body)) {
      body.forEach(item => { item.user_id = user.id; });
    } else {
      body.user_id = user.id;
    }
    options = { ...options, body: JSON.stringify(body) };
  }

  if (method === 'PATCH' || method === 'DELETE') {
    const sep = finalPath.includes('?') ? '&' : '?';
    finalPath = `${finalPath}${sep}user_id=eq.${user.id}`;
  }

  const res = await fetch(`${endpoint}${finalPath}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: options.headers?.Prefer || 'return=representation',
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      handleExpiredSession();
      throw new Error('Sessione scaduta.');
    }
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch (_) { detail = await res.text(); }
    throw new Error(detail || `Errore ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const supabaseRequest = (path, options) => tableRequest(EVENTS_ENDPOINT, path, options);
const careerRequest   = (path, options) => tableRequest(CAREER_ENDPOINT, path, options);
const contactsRequest = (path, options) => tableRequest(CONTACTS_ENDPOINT, path, options);
const wishlistRequest = (path, options) => tableRequest(WISHLIST_ENDPOINT, path, options);
const expensesRequest = (path, options) => tableRequest(EXPENSES_ENDPOINT, path, options);

/* ===================================================================
   SALUTO DINAMICO: mostra il nome dell'utente loggato ovunque
   =================================================================== */
window.jarvisDisplayName = 'UTENTE';

function applyDisplayName(user) {
  const raw =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'Utente');
  const safe = String(raw).trim().split(/\s+/)[0].toUpperCase();
  window.jarvisDisplayName = safe || 'UTENTE';
  updateClock();
}

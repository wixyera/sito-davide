/* ===================================================================
   LOGIN / SIGNUP / LOGOUT
   =================================================================== */
function setAuthMessage(msg, error = false) {
  const el = document.getElementById('authMsg');
  el.textContent = msg;
  el.style.color = error ? '#e2555c' : 'var(--accent-soft)';
}

async function login() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email || !password) return setAuthMessage('Inserisci email e password.', true);
  try {
    setAuthMessage('ACCESSO IN CORSO...');
    const d = await authRequest('/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
    accessToken = d.access_token;
    localStorage.setItem('dv_os_access_token', accessToken);
    currentUser = null;
    await startApp();
  } catch (e) {
    setAuthMessage(e.message, true);
  }
}

/* Genera un codice di recupero casuale (16 byte, esadecimale, in gruppi
   da 4) e lo hasha con SHA-256 insieme all'email: solo l'hash viene
   salvato lato server, il codice in chiaro viene mostrato UNA SOLA
   volta all'utente subito dopo la registrazione. */
function generateRecoveryCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return hex.match(/.{1,4}/g).join('-');
}

async function hashRecoveryCode(email, code) {
  const norm = `${String(email).trim().toLowerCase()}::${String(code).trim().toUpperCase()}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

let pendingRecoveryCode = '';

async function signup() {
  const nameEl = document.getElementById('authName');
  const name = nameEl ? nameEl.value.trim() : '';
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email || !password) return setAuthMessage('Inserisci email e password.', true);
  if (password.length < 6) return setAuthMessage('La password deve avere almeno 6 caratteri.', true);
  try {
    setAuthMessage('CREAZIONE ACCOUNT...');
    const code = generateRecoveryCode();
    const recovery_code_hash = await hashRecoveryCode(email, code);
    const d = await authRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: name || email.split('@')[0], recovery_code_hash } })
    });
    if (d.access_token) {
      accessToken = d.access_token;
      localStorage.setItem('dv_os_access_token', accessToken);
      currentUser = null;
      pendingRecoveryCode = code;
      document.getElementById('recoveryCodeBox').textContent = code;
      showAuthView('authViewRecoveryCode');
    } else {
      setAuthMessage('Account creato. Controlla la tua email per confermare, poi accedi.');
    }
  } catch (e) {
    setAuthMessage(/email rate limit/i.test(String(e.message || '')) ? 'Limite email raggiunto: attendi e riprova.' : e.message, true);
  }
}

async function logout() {
  try {
    if (accessToken) await authRequest('/logout', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  } catch (_) {}
  accessToken = null;
  currentUser = null;
  localStorage.removeItem('dv_os_access_token');
  location.reload();
}

async function startApp() {
  document.getElementById('authOverlay').classList.add('hidden');
  document.getElementById('logoutBtn').style.display = 'block';
  const user = await getCurrentUser();
  if (user) applyDisplayName(user);
  await loadEvents();
  await loadCareer();
  await loadContacts();
  await loadWishlist();
  await loadExpenses();

  // riapre l'ultimo modulo che stavi usando, invece di tornare sempre
  // alla Home ad ogni refresh — comodo per un'app che usi ogni giorno.
  try {
    const last = localStorage.getItem('dv_os_last_module');
    if (last && last !== 'home' && document.getElementById('mod-' + last)) showModule(last);
  } catch (_) {}
}

document.getElementById('loginBtn')?.addEventListener('click', login);
document.getElementById('authPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('signupBtn')?.addEventListener('click', signup);
document.getElementById('logoutBtn')?.addEventListener('click', logout);

document.getElementById('recoveryCodeContinueBtn')?.addEventListener('click', async () => {
  pendingRecoveryCode = '';
  showAuthView('authViewLogin');
  await startApp();
});
document.getElementById('copyRecoveryCodeBtn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(pendingRecoveryCode);
    if (typeof toastSuccess === 'function') toastSuccess('Codice copiato negli appunti.');
  } catch (_) {
    if (typeof toastError === 'function') toastError('Copia non riuscita: seleziona e copia il codice manualmente.');
  }
});

/* ===================================================================
   RESET PASSWORD — TUTTO SUL SITO, NESSUNA EMAIL IN USCITA.
   Necessario perché molti account (creati da amici per prova) hanno
   email non reali/non raggiungibili: un reset via email non
   funzionerebbe per loro.

   Al posto della vecchia "domanda di sicurezza" (indovinabile: città
   natale, nome del cane...) ogni account riceve, una sola volta in
   fase di registrazione, un CODICE DI RECUPERO casuale a 128 bit.
   Solo il suo hash SHA-256 viene salvato lato server; il codice in
   chiaro esiste solo nel browser dell'utente per il tempo necessario
   a copiarlo.

   La verifica vera e propria (hash del codice + reset password) deve
   avvenire lato server con la service role key di Supabase, quindi
   passa da un'unica Edge Function ("password-reset"): il file
   supabase-functions/password-reset.ts incluso in questo pacchetto va
   (ri)caricato sul progetto Supabase per sostituire la vecchia
   versione basata sulla domanda di sicurezza.
   =================================================================== */
const PASSWORD_RESET_ENDPOINT = `${SUPABASE_URL}/functions/v1/password-reset`;
function showAuthView(view) {
  ['authViewLogin', 'authViewForgot', 'authViewRecoveryCode'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hidden', id !== view);
  });
}

document.getElementById('forgotLink')?.addEventListener('click', () => {
  document.getElementById('forgotEmail').value = document.getElementById('authEmail').value.trim();
  document.getElementById('recoveryCodeInput').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('forgotMsg').textContent = '';
  showAuthView('authViewForgot');
});
document.getElementById('forgotBackBtn')?.addEventListener('click', () => showAuthView('authViewLogin'));

function setForgotMessage(msg, error = false) {
  const el = document.getElementById('forgotMsg');
  el.textContent = msg;
  el.style.color = error ? '#e2555c' : 'var(--accent-soft)';
}

async function resetPasswordWithCode() {
  const email = document.getElementById('forgotEmail').value.trim();
  const code = document.getElementById('recoveryCodeInput').value.trim();
  const password = document.getElementById('newPassword').value;
  if (!email || !code) return setForgotMessage('Inserisci email e codice di recupero.', true);
  if (!password || password.length < 6) return setForgotMessage('La nuova password deve avere almeno 6 caratteri.', true);
  try {
    setForgotMessage('VERIFICA IN CORSO...');
    const res = await fetch(PASSWORD_RESET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ email, code, newPassword: password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'Codice non valido o richiesta non corretta.');
    setForgotMessage('Password aggiornata! Accesso in corso...');
    document.getElementById('authEmail').value = email;
    document.getElementById('authPassword').value = password;
    showAuthView('authViewLogin');
    await login();
  } catch (e) {
    setForgotMessage(e.message, true);
  }
}
document.getElementById('forgotSendBtn')?.addEventListener('click', resetPasswordWithCode);
document.getElementById('newPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') resetPasswordWithCode(); });

/* Toggle tra modalità login/registrazione: mostra il campo nome solo in signup */
let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  const nameWrap = document.getElementById('nameFieldWrap');
  if (nameWrap) nameWrap.style.display = mode === 'signup' ? 'block' : 'none';
}
document.getElementById('signupBtn')?.addEventListener('click', () => {
  if (authMode !== 'signup') setAuthMode('signup');
});
document.getElementById('loginBtn')?.addEventListener('click', () => {
  if (authMode !== 'login') setAuthMode('login');
});


/* ===================================================================
   LOGIN / SIGNUP / LOGOUT
   =================================================================== */
function setAuthMessage(msg, error = false) {
  const el = document.getElementById('authMsg');
  el.textContent = msg;
  el.style.color = error ? '#e2555c' : 'var(--accent-soft)';
}

async function login() {
  if (authMode !== 'login') { setAuthMode('login'); return; }
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email || !password) return setAuthMessage('Inserisci email e password.', true);
  try {
    setAuthMessage('ACCESSO IN CORSO...');
    const d = await authRequest('/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
    saveSession(d);
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
  if (authMode !== 'signup') { setAuthMode('signup'); return; }
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
    const d = await authRequest('/signup?redirect_to=' + encodeURIComponent(location.origin + location.pathname), {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: name || email.split('@')[0], recovery_code_hash } })
    });
    if (d.identities && d.identities.length === 0) {
      setAuthMessage('Controlla la tua email. Se hai già un account, accedi o recupera la password.');
      return;
    }
    if (d.access_token) saveSession(d);
    else clearSession();
    pendingRecoveryCode = code;
    document.getElementById('recoveryCodeBox').textContent = code;
    document.getElementById('recoveryCodeContinueBtn').textContent = d.access_token ? 'Ho salvato il codice, continua' : 'Ho salvato il codice, torna al login';
    showAuthView('authViewRecoveryCode');
  } catch (e) {
    setAuthMessage(/email rate limit/i.test(String(e.message || '')) ? 'Limite email raggiunto: attendi e riprova.' : e.message, true);
  }
}

async function logout() {
  try {
    if (accessToken) await authRequest('/logout', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  } catch (_) {}
  clearSession();
  if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_PERSONAL_CACHE' });
  location.reload();
}

async function startApp() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Accedi per continuare.');
  if (typeof resetWorkspaceState === 'function') resetWorkspaceState();
  document.getElementById('authOverlay').classList.add('hidden');
  document.getElementById('logoutBtn').style.display = 'block';
  if (user) applyDisplayName(user);
  await Promise.allSettled([loadEvents(), loadCareer(), loadContacts(), loadWishlist(), loadExpenses()]);

  // riapre l'ultimo modulo che stavi usando, invece di tornare sempre
  // alla Home ad ogni refresh — comodo per un'app che usi ogni giorno.
  try {
    const last = localStorage.getItem('dv_os_last_module');
    if (last && last !== 'home' && document.getElementById('mod-' + last)) showModule(last);
  } catch (_) {}
}

document.getElementById('loginBtn')?.addEventListener('click', () => runAuthAction(login));
document.getElementById('authPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') { runAuthAction(authMode === 'signup' ? signup : login); } });
document.getElementById('signupBtn')?.addEventListener('click', () => runAuthAction(signup));
document.getElementById('logoutBtn')?.addEventListener('click', logout);

document.getElementById('recoveryCodeContinueBtn')?.addEventListener('click', async () => {
  pendingRecoveryCode = '';
  showAuthView('authViewLogin');
  if (accessToken) {
    try { await startApp(); } catch (err) { setAuthMessage(err.message, true); }
  } else {
    setAuthMode('login');
    setAuthMessage('Controlla la tua email e conferma l’account prima di accedere.');
  }
});
document.getElementById('copyRecoveryCodeBtn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(pendingRecoveryCode);
    if (typeof toastSuccess === 'function') toastSuccess('Codice copiato negli appunti.');
  } catch (_) {
    if (typeof toastError === 'function') toastError('Copia non riuscita: seleziona e copia il codice manualmente.');
  }
});

/* Recovery-code verification is server-side in supabase/functions/password-reset.
   The email recovery flow below uses Supabase Auth directly. */
const PASSWORD_RESET_ENDPOINT = `${SUPABASE_URL}/functions/v1/password-reset`;
function showAuthView(view) {
  ['authViewLogin', 'authViewForgot', 'authViewRecoveryCode', 'authViewNewPassword'].forEach(id => {
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
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email, code, newPassword: password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'Codice non valido o richiesta non corretta.');
    setForgotMessage('Password aggiornata! Accesso in corso...');
    document.getElementById('authEmail').value = email;
    document.getElementById('authPassword').value = password;
    setAuthMode('login');
    showAuthView('authViewLogin');
    await login();
  } catch (e) {
    setForgotMessage(e.message, true);
  }
}
document.getElementById('forgotSendBtn')?.addEventListener('click', () => runAuthAction(resetPasswordWithCode));
document.getElementById('newPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') runAuthAction(resetPasswordWithCode); });

/* Toggle tra modalità login/registrazione: mostra il campo nome solo in signup */
let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  const card = document.querySelector('.auth-card');
  if (card?.dataset) card.dataset.mode = mode;
  const intro = document.getElementById('authIntro');
  if (intro) intro.textContent = mode === 'signup' ? 'Crea il tuo account e dai un posto a impegni, progetti e nuove idee.' : 'Accedi e riparti da dove avevi lasciato. Le tue idee ti aspettano qui.';
  document.querySelector('#authViewLogin h2').textContent = mode === 'signup' ? 'Il tuo prossimo inizio.' : 'Bentornato.';
  document.getElementById('authPassword').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  document.getElementById('signupBtn').textContent = mode === 'signup' ? 'Crea il tuo account ↗' : 'Non hai un account? Registrati';
  document.getElementById('loginBtn').textContent = mode === 'signup' ? 'Ho già un account' : 'Entra nel tuo spazio ↗';
  setAuthMessage('');
  const nameWrap = document.getElementById('nameFieldWrap');
  if (nameWrap) nameWrap.style.display = mode === 'signup' ? 'block' : 'none';
}

// Prevent duplicate submissions while the same authentication request is running.
let authBusy = false;
async function runAuthAction(action) {
  if (authBusy) return;
  authBusy = true;
  const buttons = ['loginBtn','signupBtn','forgotSendBtn','emailRecoveryBtn','saveNewPasswordBtn'].map(id => document.getElementById(id)).filter(Boolean);
  buttons.forEach(button => { button.disabled = true; });
  try { await action(); }
  finally { authBusy = false; buttons.forEach(button => { button.disabled = false; }); }
}
async function sendRecoveryEmail() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return setForgotMessage('Inserisci la tua email.', true);
  try {
    await authRequest('/recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { method:'POST', body:JSON.stringify({email}) });
    setForgotMessage('Se l’account esiste, riceverai un’email con il link per scegliere una nuova password. Controlla anche lo spam.');
  } catch (error) { setForgotMessage(error.message, true); }
}
async function saveNewPassword() {
  const password = document.getElementById('emailNewPassword').value;
  const confirmation = document.getElementById('emailConfirmPassword').value;
  const msg = document.getElementById('newPasswordMsg');
  if (password.length < 6) { msg.textContent = 'Inserisci almeno 6 caratteri.'; return; }
  if (password !== confirmation) { msg.textContent = 'Le password non coincidono.'; return; }
  try {
    await authRequest('/user', { method:'PUT', headers:{Authorization:`Bearer ${accessToken}`}, body:JSON.stringify({password}) });
    await logout();
  } catch (error) { msg.textContent = error.message; }
}
document.getElementById('emailRecoveryBtn')?.addEventListener('click', () => runAuthAction(sendRecoveryEmail));
document.getElementById('saveNewPasswordBtn')?.addEventListener('click', () => runAuthAction(saveNewPassword));
document.getElementById('cancelEmailReset')?.addEventListener('click', logout);

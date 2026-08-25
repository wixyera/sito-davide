/* ===================================================================
   LOGIN / SIGNUP / LOGOUT
   =================================================================== */
function setAuthMessage(msg, error = false) {
  const el = document.getElementById('authMsg');
  el.textContent = msg;
  el.style.color = error ? '#ff2463' : 'var(--cyan2)';
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

/* Hash normalizzato (email + risposta) con SHA-256, usato sia in fase di
   registrazione (per salvare la risposta) sia in fase di reset (lato
   server) per verificarla, senza mai salvare la risposta in chiaro. */
async function hashSecurityAnswer(email, answer) {
  const norm = `${String(email).trim().toLowerCase()}::${String(answer).trim().toLowerCase()}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signup() {
  const nameEl = document.getElementById('authName');
  const name = nameEl ? nameEl.value.trim() : '';
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const secQuestion = document.getElementById('secQuestion').value;
  const secAnswer = document.getElementById('secAnswer').value.trim();
  if (!email || !password) return setAuthMessage('Inserisci email e password.', true);
  if (password.length < 6) return setAuthMessage('La password deve avere almeno 6 caratteri.', true);
  if (!secAnswer) return setAuthMessage('Rispondi alla domanda di sicurezza: serve per il reset password senza email.', true);
  try {
    setAuthMessage('CREAZIONE ACCOUNT...');
    const secAnswerHash = await hashSecurityAnswer(email, secAnswer);
    const d = await authRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: name || email.split('@')[0], security_question: secQuestion, security_answer_hash: secAnswerHash } })
    });
    if (d.access_token) {
      accessToken = d.access_token;
      localStorage.setItem('dv_os_access_token', accessToken);
      currentUser = null;
      await startApp();
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
  document.getElementById('secQuestionBtn').style.display = 'block';
  const user = await getCurrentUser();
  if (user) applyDisplayName(user);
  await loadEvents();
  await loadCareer();
  await loadContacts();
  await loadWishlist();
}

/* Permette di impostare/aggiornare in qualunque momento la domanda di
   sicurezza usata dal reset password senza email (utile per chi aveva
   già un account prima di questa funzione, o vuole cambiare risposta). */
async function updateSecurityQuestion() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return;
  const questions = [
    'Come si chiamava il tuo primo animale domestico?',
    'Qual è la tua città natale?',
    'Qual è il nome della tua scuola elementare?',
    'Qual è il tuo piatto preferito?',
    'Qual è il soprannome che ti davano da piccolo?'
  ];
  const list = questions.map((q, i) => `${i + 1}) ${q}`).join('\n');
  const choice = prompt(`Scegli una domanda di sicurezza (scrivi il numero):\n${list}`, '1');
  if (!choice) return;
  const idx = parseInt(choice, 10) - 1;
  const question = questions[idx];
  if (!question) return alert('Scelta non valida.');
  const answer = prompt(`Domanda scelta: "${question}"\nScrivi la risposta segreta (la ricorderai per il reset password):`);
  if (!answer || !answer.trim()) return alert('Risposta non valida, operazione annullata.');
  try {
    const security_answer_hash = await hashSecurityAnswer(user.email, answer);
    const res = await fetch(`${AUTH_ENDPOINT}/user`, {
      method: 'PUT',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { security_question: question, security_answer_hash } })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error_description || data.msg || data.message || `Errore ${res.status}`);
    currentUser = null;
    alert('Domanda di sicurezza salvata! Potrai usarla per reimpostare la password senza email.');
  } catch (e) {
    alert('Errore nel salvataggio: ' + e.message);
  }
}
document.getElementById('secQuestionBtn')?.addEventListener('click', updateSecurityQuestion);

document.getElementById('loginBtn')?.addEventListener('click', login);
document.getElementById('authPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('signupBtn')?.addEventListener('click', signup);
document.getElementById('logoutBtn')?.addEventListener('click', logout);

/* ===================================================================
   RESET PASSWORD — TUTTO SUL SITO, NESSUNA EMAIL IN USCITA.
   Gestito da un'unica Supabase Edge Function ("password-reset"), che
   fa due cose in base al campo "action" nel body:
   - action:"question" → dato l'indirizzo email, restituisce SOLO la
     domanda di sicurezza scelta in fase di registrazione (mai la
     risposta, che è salvata solo come hash).
   - action:"reset"    → verifica la risposta (confrontando gli hash)
     e, se corretta, imposta subito la nuova password.
   La service role key di Supabase non tocca mai il browser: vive solo
   dentro l'Edge Function, iniettata automaticamente da Supabase.
   =================================================================== */
const PASSWORD_RESET_ENDPOINT = `${SUPABASE_URL}/functions/v1/password-reset`;
function showAuthView(view) {
  ['authViewLogin', 'authViewForgot', 'authViewNewPass'].forEach(id => {
    document.getElementById(id)?.classList.toggle('hidden', id !== view);
  });
}

document.getElementById('forgotLink')?.addEventListener('click', () => {
  document.getElementById('forgotEmail').value = document.getElementById('authEmail').value.trim();
  document.getElementById('forgotMsg').textContent = '';
  showAuthView('authViewForgot');
});
document.getElementById('forgotBackBtn')?.addEventListener('click', () => showAuthView('authViewLogin'));
document.getElementById('newPassBackBtn')?.addEventListener('click', () => showAuthView('authViewLogin'));

function setForgotMessage(msg, error = false) {
  const el = document.getElementById('forgotMsg');
  el.textContent = msg;
  el.style.color = error ? '#ff2463' : 'var(--cyan2)';
}

let resetEmail = '';

async function requestSecurityQuestion() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return setForgotMessage('Inserisci la tua email.', true);
  try {
    setForgotMessage('RICERCA ACCOUNT...');
    const res = await fetch(PASSWORD_RESET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ action: 'question', email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.question) throw new Error(data.error || 'Nessun account trovato con questa email.');
    resetEmail = email;
    document.getElementById('newPassQuestionLabel').textContent = data.question;
    document.getElementById('secAnswerReset').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newPassMsg').textContent = '';
    showAuthView('authViewNewPass');
  } catch (e) {
    setForgotMessage(e.message, true);
  }
}
document.getElementById('forgotSendBtn')?.addEventListener('click', requestSecurityQuestion);
document.getElementById('forgotEmail')?.addEventListener('keydown', e => { if (e.key === 'Enter') requestSecurityQuestion(); });

function setNewPassMessage(msg, error = false) {
  const el = document.getElementById('newPassMsg');
  el.textContent = msg;
  el.style.color = error ? '#ff2463' : 'var(--cyan2)';
}

async function saveNewPassword() {
  const answer = document.getElementById('secAnswerReset').value.trim();
  const password = document.getElementById('newPassword').value;
  if (!answer) return setNewPassMessage('Inserisci la risposta alla domanda di sicurezza.', true);
  if (!password || password.length < 6) return setNewPassMessage('La password deve avere almeno 6 caratteri.', true);
  try {
    setNewPassMessage('VERIFICA IN CORSO...');
    const res = await fetch(PASSWORD_RESET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ action: 'reset', email: resetEmail, answer, newPassword: password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'Risposta errata o richiesta non valida.');
    setNewPassMessage('Password aggiornata! Accesso in corso...');
    document.getElementById('authEmail').value = resetEmail;
    document.getElementById('authPassword').value = password;
    showAuthView('authViewLogin');
    await login();
  } catch (e) {
    setNewPassMessage(e.message, true);
  }
}
document.getElementById('newPasswordBtn')?.addEventListener('click', saveNewPassword);
document.getElementById('newPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') saveNewPassword(); });

/* Toggle tra modalità login/registrazione: mostra il campo nome solo in signup */
let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  const nameWrap = document.getElementById('nameFieldWrap');
  const secWrap = document.getElementById('secQuestionWrap');
  if (nameWrap) nameWrap.style.display = mode === 'signup' ? 'block' : 'none';
  if (secWrap) secWrap.style.display = mode === 'signup' ? 'block' : 'none';
}
document.getElementById('signupBtn')?.addEventListener('click', () => {
  if (authMode !== 'signup') setAuthMode('signup');
});
document.getElementById('loginBtn')?.addEventListener('click', () => {
  if (authMode !== 'login') setAuthMode('login');
});


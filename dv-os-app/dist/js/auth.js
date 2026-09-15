/* DV / SPACE — authentication and recovery by email through Supabase Auth. */
let authMode = 'login';
let authBusy = false;
let confirmationEmail = '';
const emailRequests = new Map();
const authViews = ['authViewLogin','authViewForgot','authViewEmailSent','authViewNewPassword'];
const authElement = id => document.getElementById(id);
function authError(error) {
  const text = String(error?.message || 'Richiesta non riuscita. Riprova.');
  if (/invalid login credentials/i.test(text)) return 'Email o password non corrette.';
  if (/email not confirmed/i.test(text)) return 'Conferma il tuo indirizzo email prima di accedere.';
  if (/rate limit|too many|security purposes/i.test(text) || error?.status === 429) return 'Hai fatto troppe richieste. Attendi qualche minuto prima di riprovare.';
  if (/failed to fetch|network|timeout|aborted/i.test(text)) return 'Connessione non disponibile. Controlla la rete e riprova.';
  return text;
}
function setAuthMessage(message, error = false) {
  const el = authElement('authMsg'); el.textContent = message;
  el.style.color = error ? 'var(--red)' : 'var(--accent-soft)';
}
function setForgotMessage(message, error = false) {
  const el = authElement('forgotMsg'); el.textContent = message;
  el.style.color = error ? 'var(--red)' : 'var(--accent-soft)';
}
function showAuthView(view) {
  authViews.forEach(id => authElement(id)?.classList.toggle('hidden', id !== view));
  authElement('authOverlay').dataset.view = view;
}
function authReturnUrl() {
  // A stable root URL avoids a different allow-list entry for /index.html.
  return new URL('./', location.origin + location.pathname).href;
}
function validAuthEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function canSendEmail(kind, email) {
  const last = emailRequests.get(kind + ':' + email.toLowerCase());
  if (last && Date.now() - last < 60000) throw new Error('Attendi ' + Math.ceil((60000 - Date.now() + last) / 1000) + ' secondi prima di richiedere una nuova email.');
}
function markEmailSent(kind, email) { emailRequests.set(kind + ':' + email.toLowerCase(), Date.now()); }
function setAuthMode(mode) {
  authMode = mode;
  const card = document.querySelector('.auth-card'); if (card?.dataset) card.dataset.mode = mode;
  authElement('nameFieldWrap').style.display = mode === 'signup' ? 'block' : 'none';
  document.querySelector('#authViewLogin h2').textContent = mode === 'signup' ? 'Crea il tuo spazio.' : 'Bentornato.';
  authElement('authIntro').textContent = mode === 'signup' ? 'Registrati con la tua email. Ti invieremo un link per confermare l’account.' : 'Le tue idee, i tuoi impegni. Riparti da qui.';
  authElement('authPassword').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  authElement('authPassword').placeholder = mode === 'signup' ? 'Almeno 8 caratteri' : 'La tua password';
  authElement('signupBtn').textContent = mode === 'signup' ? 'Crea il tuo account ↗' : 'Non hai un account? Registrati';
  authElement('loginBtn').textContent = mode === 'signup' ? 'Ho già un account' : 'Entra nel tuo spazio ↗';
  authElement('forgotLink').hidden = mode === 'signup';
  authElement('resendConfirmationBtn').hidden = mode === 'signup';
  setAuthMessage('');
}
async function runAuthAction(action) {
  if (authBusy) return;
  authBusy = true;
  const buttons = [...document.querySelectorAll('.auth-card button')];
  buttons.forEach(button => { button.disabled = true; });
  authElement('authOverlay').setAttribute('aria-busy','true');
  try { await action(); }
  finally {
    authBusy = false; buttons.forEach(button => { button.disabled = false; });
    authElement('authOverlay').setAttribute('aria-busy','false');
  }
}
async function login() {
  if (authMode !== 'login') { setAuthMode('login'); return; }
  const email = authElement('authEmail').value.trim(), password = authElement('authPassword').value;
  if (!validAuthEmail(email) || !password) return setAuthMessage('Inserisci un indirizzo email valido e la password.', true);
  try {
    setAuthMessage('Accesso in corso…');
    saveSession(await authRequest('/token?grant_type=password', {method:'POST',body:JSON.stringify({email,password})}));
    sessionStorage.removeItem('dv-space-email-recovery');
    await startApp();
  } catch (error) { setAuthMessage(authError(error), true); }
}
async function signup() {
  if (authMode !== 'signup') { setAuthMode('signup'); return; }
  const email = authElement('authEmail').value.trim(), password = authElement('authPassword').value;
  const name = authElement('authName').value.trim();
  if (!validAuthEmail(email)) return setAuthMessage('Inserisci un indirizzo email valido.', true);
  if (password.length < 8) return setAuthMessage('Scegli una password di almeno 8 caratteri.', true);
  try {
    canSendEmail('signup',email); setAuthMessage('Creazione account…');
    const data = await authRequest('/signup?redirect_to=' + encodeURIComponent(authReturnUrl()), {method:'POST',body:JSON.stringify({email,password,data:{full_name:name || email.split('@')[0]}})});
    markEmailSent('signup',email);
    // If Confirm email is disabled in Supabase, do not claim an email was sent.
    if (data.access_token) {
      saveSession(data); setAuthMode('login');
      setAuthMessage('Account creato e già attivo. Puoi accedere con email e password.');
      return;
    }
    clearSession(); confirmationEmail = email;
    authElement('sentEmailAddress').textContent = email;
    authElement('sentEmailMsg').textContent = 'Se l’indirizzo può essere registrato, riceverai il link di conferma. Se hai già un account, torna al login.';
    authElement('authPassword').value = '';
    showAuthView('authViewEmailSent');
  } catch (error) { setAuthMessage(authError(error),true); }
}
async function resendConfirmation(fromSuccess = false) {
  const email = fromSuccess ? confirmationEmail : authElement('authEmail').value.trim();
  const report = fromSuccess ? message => {authElement('sentEmailMsg').textContent = message;} : message => setAuthMessage(message);
  if (!validAuthEmail(email)) return report('Inserisci la tua email nel campo qui sopra.');
  try {
    canSendEmail('signup',email);
    await authRequest('/resend?redirect_to=' + encodeURIComponent(authReturnUrl()), {method:'POST',body:JSON.stringify({type:'signup',email})});
    markEmailSent('signup',email);
    report('Se l’account è in attesa di conferma, riceverai una nuova email. Controlla anche lo spam.');
  } catch (error) { report(authError(error)); }
}
async function sendRecoveryEmail() {
  const email = authElement('forgotEmail').value.trim();
  if (!validAuthEmail(email)) return setForgotMessage('Inserisci un indirizzo email valido.', true);
  try {
    canSendEmail('recovery',email); setForgotMessage('Invio della richiesta…');
    await authRequest('/recover?redirect_to=' + encodeURIComponent(authReturnUrl()), {method:'POST',body:JSON.stringify({email})});
    markEmailSent('recovery',email);
    setForgotMessage('Controlla la posta. Se l’account esiste, riceverai un link per scegliere una nuova password. Controlla anche lo spam.');
  } catch (error) { setForgotMessage(authError(error),true); }
}
async function saveNewPassword() {
  const password = authElement('emailNewPassword').value, confirmation = authElement('emailConfirmPassword').value;
  const msg = authElement('newPasswordMsg');
  if (password.length < 8) {msg.textContent = 'Scegli una password di almeno 8 caratteri.';return;}
  if (password !== confirmation) {msg.textContent = 'Le due password non coincidono.';return;}
  try {
    msg.textContent = 'Salvataggio della password…';
    await refreshSession();
    await authRequest('/user', {method:'PUT',headers:{Authorization:`Bearer ${accessToken}`},body:JSON.stringify({password})});
    sessionStorage.setItem('dv-space-auth-notice','Password aggiornata. Accedi con la nuova password.');
    await logout();
  } catch (error) {msg.textContent = authError(error);}
}
async function logout() {
  try {if (accessToken) await authRequest('/logout',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`}});} catch (_) {}
  sessionStorage.removeItem('dv-space-email-recovery'); clearSession();
  navigator.serviceWorker?.controller?.postMessage({type:'CLEAR_PERSONAL_CACHE'});
  location.reload();
}
async function startApp() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Accedi per continuare.');
  if (typeof resetWorkspaceState === 'function') resetWorkspaceState();
  const personal = typeof initializePersonalPreferences === 'function' ? initializePersonalPreferences(user) : null;
  authElement('authOverlay').classList.add('hidden');
  authElement('logoutBtn').style.display = 'block'; applyDisplayName(user);
  await Promise.allSettled([loadEvents(),loadCareer(),loadContacts(),loadWishlist(),loadExpenses()]);
  if(personal) showModule(personal.start);
  else {try {const last=localStorage.getItem('dv_os_last_module');if(last && last!=='home' && authElement('mod-'+last))showModule(last);} catch (_) {}}
}
authElement('loginBtn').addEventListener('click',()=>runAuthAction(login));
authElement('signupBtn').addEventListener('click',()=>runAuthAction(signup));
authElement('logoutBtn').addEventListener('click',logout);
authElement('authPassword').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();runAuthAction(authMode==='signup'?signup:login);}});
authElement('forgotLink').addEventListener('click',()=>{authElement('forgotEmail').value=authElement('authEmail').value.trim();setForgotMessage('');showAuthView('authViewForgot');authElement('forgotEmail').focus();});
authElement('forgotBackBtn').addEventListener('click',()=>showAuthView('authViewLogin'));
authElement('emailRecoveryBtn').addEventListener('click',()=>runAuthAction(sendRecoveryEmail));
authElement('forgotEmail').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();runAuthAction(sendRecoveryEmail);}});
authElement('saveNewPasswordBtn').addEventListener('click',()=>runAuthAction(saveNewPassword));
authElement('emailConfirmPassword').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();runAuthAction(saveNewPassword);}});
authElement('cancelEmailReset').addEventListener('click',logout);
authElement('resendConfirmationBtn').addEventListener('click',()=>runAuthAction(()=>resendConfirmation(false)));
authElement('resendSignupBtn').addEventListener('click',()=>runAuthAction(()=>resendConfirmation(true)));
authElement('sentBackBtn').addEventListener('click',()=>{setAuthMode('login');showAuthView('authViewLogin');});

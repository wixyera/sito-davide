/* Consume the Supabase email links, then verify the session before showing data. */
async function initializeAuth() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const recoveryLink = hash.get('type') === 'recovery';
  const notice = sessionStorage.getItem('dv-space-auth-notice');
  if (notice) {sessionStorage.removeItem('dv-space-auth-notice');setAuthMessage(notice);}
  if (hash.has('error') || hash.has('error_description')) {
    sessionStorage.removeItem('dv-space-email-recovery');
    showAuthView('authViewLogin');
    setAuthMessage('Il link non è valido o è scaduto. Richiedi una nuova email di conferma o recupero.',true);
    history.replaceState(null,'',location.pathname+location.search);return;
  }
  if (hash.get('access_token')) {
    saveSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_in:Number(hash.get('expires_in')||3600)});
    if(recoveryLink)sessionStorage.setItem('dv-space-email-recovery','pending');
    else sessionStorage.removeItem('dv-space-email-recovery');
    history.replaceState(null,'',location.pathname+location.search);
  }
  if (!accessToken) {sessionStorage.removeItem('dv-space-email-recovery');return;}
  try {
    if(sessionStorage.getItem('dv-space-email-recovery')==='pending') {
      await getCurrentUser();showAuthView('authViewNewPassword');
      authElement('emailNewPassword').focus();
    } else await startApp();
  } catch(error) {
    authElement('authOverlay').classList.remove('hidden');showAuthView('authViewLogin');
    setAuthMessage(authError(error),true);
  }
}
initializeAuth();

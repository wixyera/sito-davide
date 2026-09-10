/* Restore sessions and consume Supabase email confirmation/recovery callbacks. */
(async () => {
  const hash = new URLSearchParams(location.hash.slice(1));
  const recovery = hash.get('type') === 'recovery';
  if (hash.has('error') || hash.has('error_description')) {
    setAuthMessage(hash.get('error_description') || 'Link non valido o scaduto. Richiedine uno nuovo.', true);
    history.replaceState(null, '', location.pathname + location.search);
    return;
  }
  if (hash.get('access_token')) {
    saveSession({access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_in:Number(hash.get('expires_in') || 3600)});
    history.replaceState(null, '', location.pathname + location.search);
  }
  if (!accessToken) return;
  try {
    if (recovery) { await getCurrentUser(); showAuthView('authViewNewPassword'); }
    else await startApp();
  } catch (error) {
    document.getElementById('authOverlay').classList.remove('hidden');
    setAuthMessage(error.message || 'Connessione non disponibile. Riprova tra poco.', true);
  }
})();

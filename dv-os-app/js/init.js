/* ===================================================================
   AVVIO APP: se esiste già un token salvato, ripristina la sessione
   e mostra subito il nome utente corretto.
   =================================================================== */
if (accessToken) {
  startApp().catch(err => {
    console.error(err);
    localStorage.removeItem('dv_os_access_token');
    accessToken = null;
    currentUser = null;
    setAuthMessage('Sessione non valida. Accedi di nuovo.', true);
  });
}

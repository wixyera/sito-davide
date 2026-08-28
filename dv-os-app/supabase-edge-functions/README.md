# Reset password senza email — cosa fare sul progetto Supabase

Il sito ora genera, ad ogni registrazione, un **codice di recupero** casuale
(mostrato una sola volta all'utente) invece della vecchia "domanda di
sicurezza". La verifica di quel codice e il reset della password devono
però avvenire lato server (serve la service role key, che non deve mai
finire nel browser): per questo passano dalla Edge Function
`password-reset`.

## Da fare (una tantum)

1. Sostituisci il contenuto della funzione `password-reset` già presente
   sul tuo progetto Supabase con quello di `password-reset/index.ts` in
   questa cartella.
2. Ripubblicala:
   ```
   supabase functions deploy password-reset
   ```
   Le variabili `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono già
   disponibili in automatico nell'ambiente delle Edge Function: non vanno
   configurate a mano.

## Nota sugli account creati prima di questo cambiamento

Gli account già registrati con il vecchio sistema hanno
`security_question` / `security_answer_hash` nei metadati, non
`recovery_code_hash`. Per loro il reset non funzionerà finché non
faranno un nuovo login e — se vuoi aggiungere questo passaggio in
futuro — non genereranno un codice di recupero (ad esempio la prima
volta che accedono di nuovo). Per un'app con pochi utenti/amici è
probabilmente più semplice avvisarli direttamente.

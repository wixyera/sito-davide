# Recupero password

Questa cartella conserva la struttura originale. La copia principale per il deploy CLI è ora in `supabase/functions/password-reset/index.ts`, con la configurazione in `supabase/config.toml`.

Consulta `LEGGIMI.txt`, sezione 4. Le due copie del codice della funzione sono identiche. La funzione verifica il codice personale e non richiede una sessione di login già attiva. Non inserire la service role key nel browser.

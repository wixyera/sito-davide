# Email: configurazione una sola volta

Il sito utilizza esclusivamente Supabase Auth per registrazione e recupero password. **Non devi pubblicare la Edge Function `password-reset` e non devi incollare TypeScript nel SQL Editor.**

## 1. Conferma account

Apri il tuo progetto Supabase → Authentication → impostazioni del provider Email (Sign In / Providers). Mantieni Email attivo e abilita **Confirm email**. Un account nuovo deve confermare l’indirizzo prima di accedere. Se la conferma resta disattivata, Supabase può creare un account già attivo senza inviare quella mail: il sito non finge che sia stata inviata.

## 2. Indirizzo del sito

In Authentication → URL Configuration, inserisci in **Site URL** l’indirizzo reale della home (per esempio il tuo dominio gratuito `pages.dev`, con `/` finale). Inserisci lo stesso URL in **Redirect URLs**. Il sito normalizza `/index.html` alla cartella principale. Per un sito in una sottocartella, autorizza anche quella cartella con lo slash finale.

Per prove locali aggiungi `http://127.0.0.1:4173/`. Non copiare un URL segnaposto: utilizza quello del tuo progetto. [Guida Supabase](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. Invio SMTP

In Authentication → Email / SMTP Settings configura il provider che utilizzi per spedire: host, porta, username, password e indirizzo mittente autorizzato. Se lo hai già configurato e funziona, mantieni quei valori. I dati SMTP vanno soltanto nel pannello Supabase.

Il servizio email predefinito di Supabase ha restrizioni sui destinatari e sui volumi. Per inviare mail agli utenti del sito usa un SMTP configurato e verifica il mittente presso quel provider. [Documentazione SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## 4. Email già impaginate

Apri Authentication → Email Templates. Apri i file con un editor di testo, copia il codice HTML e sostituisci il corpo del template corrispondente.

| Template Supabase | File incluso | Oggetto suggerito |
| --- | --- | --- |
| Confirm sign up | `email-templates/conferma-account.html` | Conferma il tuo account DV / SPACE |
| Reset password | `email-templates/recupero-password.html` | Scegli una nuova password per DV / SPACE |
| Password changed | `email-templates/password-modificata.html` | La tua password DV / SPACE è stata modificata |

Conserva letteralmente `{{ .ConfirmationURL }}` nei primi due template: Supabase lo sostituirà con il link personale. Non sostituirlo con l’indirizzo generico del sito. Il terzo usa `{{ .SiteURL }}`.

Per ricevere anche la mail dopo il cambio password, **abilita la notifica di sicurezza Password changed** nelle impostazioni delle email. Personalizzare il testo da solo non attiva la notifica. [Template e notifiche Supabase](https://supabase.com/docs/guides/auth/auth-email-templates).

## 5. La vecchia funzione

La nuova versione non chiama più la Edge Function `password-reset` e non genera codici di recupero. Se l’avevi già pubblicata, dopo aver verificato il nuovo flusso email puoi rimuoverla dal pannello Edge Functions. Aggiornare il sito non cancella automaticamente una funzione già pubblicata. Gli account esistenti continuano a usare la stessa email e password; non è necessario ricrearli. Per gli account creati con email inventate, il proprietario del progetto dovrà prima correggere l’indirizzo tramite Supabase.

## 6. Prova reale

1. Registra un account di prova con un’email che puoi leggere.
2. Apri la mail di conferma e premi il pulsante: tornerai al sito.
3. Esci e premi Password dimenticata?, inserisci l’email e richiedi il link.
4. Apri la nuova mail e imposta una password di almeno 8 caratteri.
5. Accedi con la nuova password e controlla la notifica Password changed, se abilitata.

Se una mail non arriva, controlla spam, Auth Logs di Supabase e log del provider SMTP. Se appare un link scaduto, richiedi una nuova email. Se compare un limite di invio, attendi: ripetere rapidamente la richiesta non lo risolve.

**Preparato nel pacchetto:** codice e template. **Da attivare nel tuo account:** Confirm email, SMTP, URL autorizzati e notifica Password changed. Il recapito reale delle email non è stato verificato da questa sessione.

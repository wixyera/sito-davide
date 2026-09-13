# DV / SPACE 4 — Kinetic

Apri **APRI-QUI.html** oppure **LEGGIMI.txt** per iniziare.

Questa versione aggiunge una scultura 3D reattiva all’ingresso, titoli animati, transizioni tra sezioni, profondità allo scorrimento e microinterazioni. La navigazione mantiene lo scrolling nativo e le funzioni originali. Le animazioni possono essere messe in pausa e rispettano le preferenze del dispositivo. Con WebGL indisponibile viene usata l’immagine inclusa.

L’autenticazione utilizza **solo email e password con Supabase Auth**. Il recupero avviene tramite link email. Non sono più richiesti codici personali o la Edge Function `password-reset`.

## Configurazione email

Segui **EMAIL-SUPABASE.md**. Attiva Confirm email, configura SMTP e URL autorizzati, carica i template inclusi. Per la mail dopo il cambio password abilita anche la notifica Password changed in Supabase. Gli account e il database originali sono conservati. [Template Supabase](https://supabase.com/docs/guides/auth/auth-email-templates).

## Pubblicazione

Mantieni la cartella `dv-os-app` del repository oppure caricane il contenuto nella radice. In Cloudflare Pages usa `npm run build` e output `dist`; Root directory deve indicare la cartella con `package.json`. Le API in `functions` richiedono pubblicazione Git o Wrangler. [Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/).

## Avvio e verifiche

Node.js 22 o superiore; nessuna dipendenza npm da installare.

```sh
npm run dev
npm test
npm run build
```

Il server locale usa `http://127.0.0.1:4173`. Per leggere un `.env` locale:

```sh
node --env-file=.env serve.mjs
```

Il doppio clic su `index.html` non avvia i servizi del sito. `.env.example` contiene i nomi delle variabili per le tre API originali; non inserire segreti nei file pubblici.

## Struttura

- `js/auth.js`, `js/init.js`: login, registrazione, reinvio conferma e recupero via email.
- `js/entrance-scene.js`, `js/kinetic.js`, `css/kinetic.css`: nuovo ingresso e animazioni.
- `email-templates`: HTML da incollare nei template del pannello Supabase. Non vengono pubblicati da `build.mjs`.
- `sql/SETUP_COMPLETO.sql`: schema delle cinque sezioni, necessario solo se il database non è già configurato.
- `functions/api`: API originali Cloudflare per Oracolo, Spotify e prodotti.
- `dist`: copia pubblica generata. Non modificare questa cartella direttamente.

## Limiti delle verifiche

Test di codice e flussi email simulati, controllo asset e build. Nessun invio reale di email o accesso amministrativo ai tuoi servizi; nessun test visivo in browser in questa sessione. Gli esperimenti che dipendono da servizi terzi richiedono rete e disponibilità del fornitore. Le ricorrenze ICS non supportate vengono segnalate prima dell’importazione.

Three.js è incluso con licenza MIT in `vendor`. Immagini e contenuti originali sono riutilizzati; la nuova scultura è geometria locale, senza download aggiuntivi.

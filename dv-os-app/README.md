# DV / SPACE 3

Il sito di Davide, aggiornato con un’interfaccia scura e azzurra, superfici più leggibili, immagini cromate, transizioni più leggere e layout adattati a telefono e PC. Tutte le sezioni originali sono conservate.

**Apri prima `LEGGIMI.txt`**: contiene la procedura per aggiornare GitHub / Cloudflare Pages e completare Supabase.

## Contenuto

- `index.html`, `css`, `js`, `assets`, `experiments`, `vendor`: sorgenti e immagini del sito.
- `functions/api`: le tre API Cloudflare Pages originali.
- `supabase/functions/password-reset/index.ts`: recupero con codice personale.
- `supabase/config.toml`: configurazione della funzione di recupero per utenti non autenticati. Il codice viene verificato nella funzione.
- `sql/SETUP_COMPLETO.sql`: configurazione delle cinque tabelle con regole per proprietario; non cancella righe.
- `dist`: copia pubblica generata, già inclusa per comodità. Per pubblicare tutte le API usa l’integrazione Git oppure Wrangler, come nella guida.
- `VERIFICHE.md`: modifiche, controlli eseguiti e limiti della verifica.

## Comandi locali

Richiede Node.js 22 o superiore. Non ci sono dipendenze npm da installare.

```sh
npm run dev
npm test
npm run build
```

`npm run dev` serve il sito su `http://127.0.0.1:4173`. In locale le API leggono le variabili dell’ambiente del terminale. Per caricare un file `.env` con Node:

```sh
node --env-file=.env serve.mjs
```

Usa `.env.example` come schema. Il normale doppio clic su `index.html` non è sufficiente per moduli JavaScript, API e autenticazione: usa il server locale o Cloudflare.

## Servizi

La configurazione pubblica Supabase originale è conservata in `js/config.js`. Non sono state cambiate le credenziali o modificati i dati del progetto remoto. Il salvataggio dei dati richiede Supabase attivo, tabelle e policy compatibili. La registrazione e il recupero via email richiedono gli URL di ritorno autorizzati e un servizio email configurato in Supabase. [Sessioni Supabase](https://supabase.com/docs/guides/auth/sessions), [URL di ritorno](https://supabase.com/docs/guides/auth/redirect-urls), [autenticazione con password](https://supabase.com/docs/guides/auth/passwords).

Le chiavi private di OpenAI e Spotify vanno nelle variabili server di Cloudflare, mai nel frontend o nel repository. Le Pages Functions vengono pubblicate tramite Git o Wrangler: il caricamento diretto dal pannello Cloudflare non pubblica questa cartella di funzioni. [Documentazione Cloudflare](https://developers.cloudflare.com/pages/functions/get-started/).

## Asset

Sono riutilizzati gli asset inclusi nel progetto originale. Three.js mantiene la licenza MIT in `vendor/THREE-LICENSE.txt`. Alcuni esperimenti caricano librerie e dati esterni e richiedono una connessione. Il timer e la galleria principale caricano i propri moduli e Three.js dal progetto.

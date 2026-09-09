# Davide Villano — Personal Space

Il sito originale completo, con nuova grafica ispirata ai due video: globo 3D animato, titoli grandi, atmosfere cromatiche e transizioni tra le sezioni.

## 1. Caricare su GitHub

1. Estrai lo ZIP.
2. Apri la cartella `sito-davide`.
3. Carica **il contenuto della cartella** nel repository GitHub: `index.html`, `package.json`, `functions`, `assets`, `js`, `css` e le altre cartelle devono trovarsi nella radice del repository.

Non caricare soltanto lo ZIP su GitHub: Cloudflare deve poter leggere i file estratti.

## 2. Collegare Cloudflare Pages

Crea un progetto **Pages**, collega GitHub e seleziona il repository. Se il vecchio sito usa già Cloudflare Pages, puoi aggiornare quel repository e mantenere il progetto esistente.

Impostazioni di build:

| Campo | Valore |
| --- | --- |
| Framework preset | None / Nessuno |
| Production branch | Il ramo su cui hai caricato i file, normalmente `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Lascia vuoto se i file sono nella radice del repository |

Il build copia soltanto i file pubblici in `dist`. La cartella `functions` deve restare nella radice del progetto: Cloudflare Pages la usa per compilare le API `/api/oracolo`, `/api/spotify-search` e `/api/fetch-product`.

Se hai caricato nel repository l'intera cartella `sito-davide`, anziché il suo contenuto, imposta **Root directory** su `sito-davide`.

Documentazione ufficiale: [collegamento Git](https://developers.cloudflare.com/pages/get-started/git-integration/), [configurazione build](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/).

## 3. Mantenere tutti i servizi

Sono inclusi autenticazione e registrazione Supabase, recupero password tramite codice, calendario con importazione/esportazione ICS, percorso, contatti, wishlist, spese, ricerca, musica e tutte le demo originali.

Il collegamento al progetto Supabase originale è conservato in `js/config.js`. Gli utenti e i dati restano nel progetto Supabase esistente, non dentro lo ZIP. Devono rimanere attive le tabelle, le policy di accesso per utente e la funzione Supabase `password-reset` già previste dal sito originale. Il relativo codice è incluso nella cartella `supabase-edge-functions`.

Per ricerca Spotify e Oracolo, sul progetto Cloudflare devono essere impostati i segreti originali:

- `OPENAI_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Se aggiorni lo stesso progetto Pages, conserva le impostazioni già presenti. Se ne crei uno nuovo, riconfigura quei valori come segreti sul nuovo progetto e pubblica di nuovo. Non caricare chiavi segrete nel repository. Il file `.env.example` contiene soltanto i nomi, senza valori.

La configurazione del recupero account e dell’eventuale conferma email dipende dal progetto Supabase originale. Non sono stati creati account o modificati dati durante la preparazione.

## Avvio locale e verifiche

Con Node.js installato:

```sh
npm run dev
```

Apri http://127.0.0.1:4173. Per usare localmente anche i servizi con chiavi, copia `.env.example` in `.env`, valorizzalo e avvia `node --env-file=.env serve.mjs`.

`npm run build` prepara la cartella pubblica. `npm test` verifica i casi critici dell’accesso con risposte simulate e l’adattamento delle API. Il login reale e le operazioni sui dati vanno verificati con il tuo account e le configurazioni originali.

Three.js è incluso localmente con licenza MIT in `vendor`. La texture terrestre proviene dagli [esempi ufficiali Three.js](https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg). Gli altri asset sono quelli del sito fornito. I video di riferimento non sono inclusi.

## Tour del museo — nuova versione

Sette sale con opere 3D diverse, piedistalli, portali, luci e ombre. Usa le frecce sopra le opere per cambiare sala; dopo il login aprono i moduli originali corrispondenti. Prima del login mostrano soltanto le opere, senza accesso ai dati. Trascina un’opera per ruotarla; il pulsante pausa arresta il movimento 3D. Il cursore nativo è sempre visibile. La preferenza di sistema per ridurre le animazioni viene rispettata.

# DV / SPACE

Lo spazio personale di Davide Villano è stato ridisegnato da zero con una direzione visiva **Obsidian & Electric Lime**: accesso editoriale, navigazione laterale, dashboard operativa, timer Focus, galleria 3D e laboratorio con 25 esperimenti interattivi.

Le funzioni originali restano disponibili:

- login, registrazione e recupero password con codice;
- calendario personale con importazione/esportazione `.ics`;
- percorso professionale, contatti, wishlist e spese, isolati per utente;
- ricerca globale, player Spotify, PWA/offline e API Pages Functions;
- tutti gli esperimenti presenti nel progetto originale.

## Caricamento su GitHub e Cloudflare Pages

1. Estrai lo ZIP e carica **il contenuto di questa cartella** nella radice del repository GitHub.
2. In Cloudflare Pages crea un progetto collegato al repository.
3. Usa queste impostazioni:

| Campo | Valore |
| --- | --- |
| Framework preset | None / Nessuno |
| Production branch | `main` (o il ramo scelto) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | vuota, se il progetto è nella radice del repository |

La cartella `functions` deve restare nella radice del repository: Pages la usa per le API `/api/oracolo`, `/api/spotify-search` e `/api/fetch-product`.

Cloudflare documenta [l’integrazione Git](https://developers.cloudflare.com/pages/get-started/git-integration/), la [configurazione della build](https://developers.cloudflare.com/pages/configuration/build-configuration/) e le [Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/).

## Configurazione dei servizi

Il progetto continua a usare la configurazione Supabase già presente in `js/config.js`. Non sono stati modificati account, tabelle o dati personali.

Per Oracolo IA e ricerca Spotify conserva nel progetto Pages i segreti già esistenti:

- `OPENAI_API_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Non inserire mai i valori reali nel repository. `.env.example` contiene solo i nomi delle variabili.

## Avvio locale

```sh
npm run dev
```

Apri `http://127.0.0.1:4173`. Per generare la cartella pubblica usa `npm run build`; per eseguire le verifiche usa `npm test`.

Il timer Focus è locale al browser e non scrive dati nel database. La galleria 3D viene caricata solo quando viene aperta, così la dashboard resta veloce anche su dispositivi meno potenti.

## Asset e licenze

La nuova opera cromata è un asset originale creato per DV / SPACE. Three.js è incluso localmente con licenza MIT in `vendor`; la texture terrestre proviene dagli [esempi ufficiali Three.js](https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg).

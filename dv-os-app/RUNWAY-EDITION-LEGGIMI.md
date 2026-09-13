# DV / THE RUNWAY — Collection 2026

Questa versione estende la Fashion Edition con una passerella 3D in tempo reale. È la guida più recente e sostituisce le indicazioni sulla sola intro video della precedente edizione.

## Esperienza

- Sipario bordeaux all'ingresso, regia della camera e titoli da sfilata. Intro saltabile, richiamabile dal menu e disattivata sui link email di recupero.
- Una passerella architettonica con portali luminosi, fondale in velluto, pubblico seduto, luci sceniche e quattro figure originali con camminata articolata.
- Figure stilizzate come manichini da atelier, con abiti avorio, nero, bordeaux e oro: non sono persone fotorealistiche o riprese di una Fashion Week reale.
- La scena è visibile già sulla copertina di accesso. Nella home diventa un percorso guidato dallo scroll: sei uscite per calendario, percorso, contatti, wishlist, spese e laboratorio.
- Ogni uscita apre la sezione operativa originale. I numeri permettono di raggiungere un'altra uscita; “Vai ai tuoi strumenti” salta la sfilata.
- Audio ambientale elettronico originale, generato localmente e attivato solo premendo “Audio off”. Si spegne quando esci dalla home, torni al login o nascondi la scheda.
- Un unico renderer passa fra intro, copertina e home. Rendering sospeso quando la scena non è visibile; risoluzione e geometria ridotte su mobile. Nessuno scroll artificiale o gesture verticali intercettate.
- Pausa scena, preferenza di movimento ridotto e alternativa fotografica se WebGL non funziona. Il precedente MP4 resta come alternativa dell'intro.

## Aggiornamento del sito

Mantieni le impostazioni attuali di Supabase e Cloudflare. Sostituisci il progetto con il contenuto aggiornato di `sito-davide-main/dv-os-app` e usa il normale flusso di pubblicazione.

Build: `npm run build`. Output: `dist`. Pages Functions: `functions`, nella posizione originale. Sono inclusi sorgenti e `dist` già aggiornato.

Non sostituire soltanto l'HTML: la scena richiede `css/runway.css`, `js/runway.js`, `js/runway-scene.js`, il modulo Three.js già incluso in `vendor` e gli asset della Fashion Edition.

Il service worker ha una nuova versione. Dopo il caricamento chiudi e riapri il sito; se compare ancora la vecchia grafica, verifica in una scheda privata.

## Verifiche

45 test automatici superati: autenticazione, recupero email, sessioni, dati e API, intro, pose finite e limiti della camera, qualità desktop/mobile e struttura della scena. Build completata. Non sono stati inviati messaggi email o modificati dati del tuo account.

La preview locale è stata bloccata dal browser di verifica dell'ambiente (`ERR_BLOCKED_BY_CLIENT`). Non è quindi stata eseguita una verifica visiva nel browser né una prova touch su dispositivo reale. I test della scena sono controlli della geometria e delle animazioni, non una misura dei fotogrammi al secondo sul tuo telefono.

Dopo la pubblicazione: prova intro e “Salta intro”, scorri fino al login, accedi e attraversa le sei uscite, apri wishlist/calendario, prova il menu, pausa/riprendi, audio e “Vai ai tuoi strumenti”. Verifica anche movimento ridotto, rotazione dello schermo e ritorno alla scheda dopo aver cambiato app.

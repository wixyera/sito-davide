# SPACE — Fashion Edition

Restyle editoriale completo: avorio, nero e bordeaux, titoli serif, copertina fotografica, pagine interne coordinate, menu a tutto schermo, transizioni e dettagli animati. Il tema scuro resta selezionabile; la preferenza esistente viene rispettata.

## Intro

Filmato MP4 H.264 locale di 10 secondi (1280 × 720, circa 580 KB), senza audio. È un montaggio animato della fotografia editoriale originale, con movimenti di camera digitali, stacco in bianco e nero e titoli HTML sincronizzati; non è una ripresa reale di una sfilata. Include pulsante “Salta intro”, chiusura automatica, Escape, riproduzione inline e immagine alternativa. Il filmato si carica soltanto quando serve. L'intro appare una volta per sessione ed è rivedibile dal menu; non interrompe i link di recupero email o l'accesso con movimento ridotto.

## Mobile

- Login nel normale flusso del documento: rimosso il vincolo del contenitore fisso e del blocco dello scroll del body durante l'accesso.
- Pulsante “Accedi” in copertina per raggiungere subito il form.
- Griglie responsive, controlli touch, form a 16 px, menu scorrevole e margini per le aree sicure del telefono.
- Dopo login/logout la pagina riparte dall'alto; i pannelli di recupero email restano raggiungibili.
- Nessun intercettamento del gesto verticale di scroll.

## Caricamento

Il progetto mantiene la struttura originale `sito-davide-main/dv-os-app`.

Se il sito è già collegato a GitHub e Cloudflare Pages, aggiorna il contenuto del progetto con questa cartella e pubblica con le impostazioni esistenti. Il comando è `npm run build`, l'output è `dist`; le Pages Functions sono in `functions`, come prima. È inclusa anche una copia `dist` già aggiornata.

Non sono richieste modifiche alle tabelle, alle impostazioni di autenticazione Supabase o alle variabili di Cloudflare per questo restyle. Mantieni le configurazioni esistenti.

Non caricare soltanto `index.html`: servono anche i nuovi CSS, JS e `assets/editorial`. Non aggiungere i nuovi file sopra una vecchia cartella `dist` senza aggiornare l'intero output.

Se il telefono mostra ancora la vecchia grafica, chiudi e riapri il sito dopo il caricamento; il service worker ha una nuova versione. Se persiste, prova in una scheda privata o cancella i dati del sito.

## Verifiche eseguite

38 test esistenti passati: autenticazione e recupero email, sessioni, calendario, import/export, timer, galleria e API. Altri 4 test passati per chiusura dell'intro, Escape, autoplay/storage bloccati e ingresso con link di recupero o movimento ridotto. Build completata e file MP4 verificato con ffprobe.

Non è stato possibile eseguire una verifica visiva con browser o un test touch su un dispositivo reale in questo ambiente. Non sono stati inviati messaggi email reali né modificati dati del tuo account.

Controllo rapido dopo il caricamento: su Safari iPhone e Chrome Android, salta l'intro, scorri dalla copertina al form, accedi, scorri la home fino al fondo, apri e chiudi il menu e prova calendario e wishlist. Verifica anche la tastiera aperta e il ritorno dallo sfondo.

## Immagine originale

Creata con ImageGen integrato. File incluso: `assets/editorial/runway.jpg`; montaggio: `assets/editorial/fashion-film.mp4`.

Prompt: “Use case: photorealistic-natural. Create a cinematic luxury fashion editorial photograph for a personal fashion magazine website. Wide landscape 1536x1024. An adult androgynous male fashion model with slick black hair, angular cheekbones wearing dramatic oversized black tailored coat, ivory shirt and black trousers, walking toward camera on an architectural runway, full body visible. Model placed at right third, left half atmospheric negative space of warm ivory concrete walls and long angular shadows for large editorial typography. A massive rich oxblood red fabric curtain in the background on right, spotlight from upper left, film grain, severe couture tailoring, architectural minimalism, flash photography texture, sophisticated Milan fashion week campaign mood. No logos, no text, no watermark. Restrained ivory black and oxblood palette. Photoreal high quality.”

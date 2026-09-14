# Outfit 3D e Bologna & Napoli

## Outfit 3D

Apri Outfit 3D dal menu o dalla home. Scegli Sopra, Giacca, Sotto o Scarpe; incolla il link del negozio e premi Leggi il prodotto, oppure seleziona un elemento della tua wishlist. Verifica nome e foto, scegli la forma e il colore e premi Applica al manichino. Ruota trascinando in orizzontale oppure usa i pulsanti. Dai un nome alla combinazione e salvala nel tuo account; puoi conservare, riaprire, modificare ed eliminare fino a 12 outfit.

Il manichino è una rappresentazione indicativa con geometrie generiche e colori scelti manualmente. Non ricostruisce la forma esatta del prodotto, le stampe, il tessuto, la taglia o la vestibilità sul corpo. Le foto dei capi originali sono mostrate separatamente come riferimenti con link ai negozi. Non richiede tue fotografie. Quando un negozio impedisce l’importazione, puoi compilare il prodotto manualmente.

Gli outfit sono salvati nel campo saved_outfits dei metadati del tuo account Supabase. Non servono nuove tabelle o SQL. Non usare questi metadati per autorizzazioni o ruoli. Il 3D viene caricato soltanto all’apertura della sezione e renderizzato durante modifiche o rotazioni, senza un ciclo di animazione continuo. Se WebGL non è disponibile, rimangono utilizzabili riferimenti e salvataggi.

## Bologna & Napoli

La pagina presenta una rassegna di titoli da Google News, fino a 30 per squadra, ordinati per data quando disponibile, con fonte e link all’articolo originale. I filtri mostrano Bologna, Napoli o entrambe. Aggiorna ripete la richiesta; il feed può rimanere in cache fino a 5 minuti. La rassegna non include necessariamente ogni notizia pubblicata e dipende dalla disponibilità del servizio esterno. Non richiede una chiave API.

La nuova Function è functions/api/football-news.js. L’accesso parte dal server Cloudflare e non direttamente dal browser. Le URL upstream sono fisse; gli utenti non possono scegliere server arbitrari. Un errore o un feed vuoto mostra un messaggio esplicito, mai titoli simulati. Restano disponibili i link alle fonti ufficiali https://www.bolognafc.it/ e https://sscnapoli.it/ .

All’ingresso viene riprodotta una breve animazione vettoriale stilizzata di un calciatore che tira e segna, non un filmato realistico. Puoi saltarla, chiuderla con Esc o rivederla. Non parte se le animazioni sono in pausa o il dispositivo richiede movimento ridotto. I due precedenti video Runway restano inclusi; non sono state avviate nuove generazioni video.

## Pubblicazione

Carica il progetto completo su Cloudflare Pages come nelle versioni precedenti: npm run build, output dist, directory functions nella radice del progetto. La dist inclusa è aggiornata. Caricare solo l’HTML o soltanto file statici senza le Functions non abilita importazione prodotti e notizie. Non è stata effettuata la pubblicazione online in questa sessione.

## Verifiche e limiti

64 test automatizzati superati e build completata. Verificati geometrie finite dei capi, normalizzazione degli outfit, parsing RSS, attribuzione fonti, gestione dei feed guasti, vincoli sugli URL importati e le regressioni precedenti. I test del feed usano risposte controllate: non attestano l’accesso live da Cloudflare. Le richieste di prova ai feed ufficiali dei club hanno restituito 403 in questo ambiente; la rassegna implementata usa Google News. Non è stato completato un collaudo visivo nel browser, su telefono reale o con account Supabase reali. Verificare queste integrazioni dopo il deploy.

Per i tuoi recapiti pubblici rimane da compilare js/public-contact.js.

> Nuovo aggiornamento: leggi `00-OUTFIT-E-CALCIO.md` per il manichino 3D e la pagina Bologna & Napoli.

# DV / Fashion Week Edition

Un sito personale con direzione visiva ispirata alla settimana della moda: non presenta date, sponsor o affiliazioni ufficiali inventate.

## Questa versione

- Home personale prima della passerella: pass con nome e monogramma, firma, prossimo appuntamento, numero di pezzi in wishlist e spese del mese, ricavati dai dati dell’account.
- Profilo: nome, firma (160 caratteri), tre stili di monogramma, quattro colori, tema, animazioni, pagina iniziale, home completa o essenziale.
- Modalità automatica: sotto gli 800 px, con risparmio dati o preferenza per movimento ridotto, il tour usa il poster e non inizializza WebGL. La modalità completa resta selezionabile. Scroll nativo, pinch zoom e intro saltabile.
- Wishlist: immagini, taglia, colore, priorità, stato acquistato, ricerca e filtri. L’eliminazione attende 8 secondi; Annulla, logout o uscita dalla pagina la cancellano prima della richiesta al server. Dopo la scadenza viene eseguita la normale cancellazione.
- Due filmati Runway già integrati: sfilata realistica nell’intro, nero/oro nella sezione editoriale. Non è stata richiesta un’altra generazione in questo aggiornamento.
- Contatta Davide è separato dalla rubrica privata e non è modificabile dalle impostazioni dei visitatori.

## Recapiti di Davide — unico contenuto ancora da compilare

Inserisci solo i tuoi recapiti pubblici in `js/public-contact.js`: email, URL Instagram e URL portfolio. I campi vuoti non producono link; finché sono tutti vuoti la sezione indica che i recapiti saranno disponibili. Non sono stati inseriti recapiti inventati né pubblicati contatti della rubrica privata.

## Dati esistenti

Non occorrono nuove colonne o tabelle. I dettagli della wishlist sono serializzati con il prefisso versionato `DV-WISHLIST/1` nella colonna notes esistente; le vecchie note di testo restano leggibili e conservate. Per integrazioni esterne, usare le funzioni `wishlistDetails` / `packWishlistDetails` per leggere o scrivere quella colonna.

Le preferenze sono salvate nei metadati del proprio account Supabase. I dati personali continuano a utilizzare filtri user_id e RLS del progetto. I metadati non concedono privilegi. Il database remoto non è stato modificato né verificato con account reali.

## Aggiornare il sito

Sostituisci il progetto completo `sito-davide-main/dv-os-app` sul tuo repository Cloudflare Pages. Comando build: `npm run build`; cartella output: `dist`; Functions: `functions` nella radice del progetto. La dist inclusa è aggiornata. Questa consegna non pubblica automaticamente il sito online.

## Verifica

56 test automatizzati superati e build completata, inclusi isolamento delle preferenze, compatibilità delle note, validazione dei dettagli e annullamento/cambio account durante una cancellazione. Nessuna verifica visiva completa nel browser o prova touch su dispositivo reale: prima della pubblicazione controllare login, scroll, menu, profilo e wishlist su telefono, oltre alle policy RLS con due account di prova.

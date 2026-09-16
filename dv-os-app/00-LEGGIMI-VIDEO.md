> Per lo stato più recente leggi `00-GOLD-EDITION.md`: i video sono stati scambiati e le foto outfit sono ora applicate alle sagome.

# Sito aggiornato con i due video di Runway

Questa guida è la più recente e sostituisce lo stato provvisorio riportato nelle guide precedenti.

## Video integrati

1. Intro principale: sfilata fotorealistica con modella in abito lilla, 8 secondi, 1280×720. Il filmato ora sostituisce la scena 3D nell'intro: nessun manichino o sipario lo copre. Puoi saltarlo, attivare l'audio o rivederlo dal menu. Si chiude quando il video termina, con un limite di attesa se la riproduzione viene bloccata.
2. Sezione editoriale della home: animazione astratta nera e oro, 10 secondi, 1280×720, con controlli di riproduzione. Non parte automaticamente.

Entrambi sono i video già generati nel tuo account Runway: non sono state avviate altre generazioni o consumati nuovi crediti. I file MP4 sono inclusi localmente in `assets/editorial`, senza URL temporanei o collegamenti che scadono. Sono stati ottimizzati per il web conservando la risoluzione nativa e l'audio. Sono contenuti generati con IA, non riprese documentarie di una sfilata reale.

Su mobile l'intro mantiene l'intera inquadratura, con bande quando necessarie, per evitare ulteriori tagli al soggetto. Il video è inline e muto all'avvio; l'audio richiede un tocco. Il poster rimane visibile se il browser non riproduce il video. La precedente passerella 3D resta nella copertina di accesso e nella navigazione della home.

## Utenti

Dal menu “Personalizza” puoi salvare nome, tema, colore, animazioni e pagina iniziale nel tuo account. Wishlist, calendario, percorso e spese sono gestiti per utente, con i filtri e le policy RLS già previsti dal progetto. La configurazione del database remoto non è stata modificata né verificata in questa sessione.

Contatti: aggiunta “Contatta Davide”, separata dalla rubrica privata. Inserire i recapiti pubblici in `js/public-contact.js`. Vedi `00-FASHION-WEEK-EDITION.md` per le novità più recenti.

## Pubblicazione

Aggiorna tutti i file di `sito-davide-main/dv-os-app`, non soltanto l'HTML. Usa le impostazioni esistenti di Cloudflare: comando `npm run build`, output `dist`, Pages Functions in `functions`. La cartella `dist` inclusa è già aggiornata. Non servono nuove tabelle per le preferenze o per i video.

Il service worker ha una nuova versione. Dopo il caricamento chiudi e riapri il sito; se visualizzi ancora la vecchia intro, prova in una scheda privata.

## Verifiche

56 test passati, build completata; verificati risoluzione, durata e fotogrammi campione dei due video. Non è stata effettuata una verifica visiva completa del sito nel browser né una prova touch su telefono reale. Verifica sul tuo telefono: salta/rivedi intro, audio, scroll fino al login, navigazione, personalizzazione e riproduzione del video nero/oro.

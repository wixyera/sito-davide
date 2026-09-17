# Aggiornamento Portfolio Plus

Nuova home con copertina scura, griglia di progetti illustrati e filtri Web / Sistemi IT. Aggiunte competenze, metodo di lavoro, progetto Zabbix e collegamenti rapidi a Letture, area personale e demo. I pulsanti 01–04 permettono di raggiungere i capitoli della scena; con movimento ridotto restano le sezioni statiche.

Il pulsante ◐ cambia il tema delle pagine pubbliche e conserva la scelta in questo browser. Le preferenze dell'area personale restano separate.

In Letture il pulsante Salva conserva fino a 100 titoli e collegamenti. La vista Salvati rispetta la testata selezionata e la ricerca. I preferiti sono locali al browser, condivisi tra chi lo utilizza, e non sono sincronizzati con account o abbonamenti. Non vengono salvati testi integrali o credenziali dei giornali. Se la rassegna non risponde, i preferiti restano consultabili.

Non serve cambiare variabili Cloudflare, credenziali PayPal o database Supabase: esegui un nuovo deploy dei file. Il checkout Sandbox è invariato rispetto a quello già provato. Le illustrazioni delle schede sono schemi originali, non screenshot o telemetria reale.

Verifica automatica: 103 test superati e build riuscita. L'anteprima browser locale resta indisponibile nell'ambiente: non sono dichiarati controlli visivi su browser o telefono. Prima di pubblicare per altri, verifica la home nelle due palette, lo scroll, il menu mobile e i link.

---

# Davide — Portfolio e area personale

Questa versione sostituisce la precedente home Fashion Week.

- `index.html`: portfolio pubblico, senza login. Presentazione legata allo scroll con prospettiva CSS 3D e quattro capitoli. Nessun asset o marchio Apple copiato: il riferimento riguarda la sequenza di racconto. Non è un rendering fotorealistico di un prodotto.
- `workspace.html`: area personale con login, calendario, percorso, rubrica, wishlist, spese, laboratorio, calcio e Shop Demo. Il manichino e la sezione Outfit non sono più caricati. Gli eventuali outfit già salvati nei metadati non sono cancellati.
- `letture.html`: rassegna Gazzetta dello Sport e Repubblica con ricerca e filtro testata. Mostra titoli da Google News e rimanda agli articoli. Non importa né conserva credenziali degli abbonamenti e non incorpora il testo degli articoli premium. Per leggerli accedi sul sito del giornale con il tuo abbonamento, nello stesso browser.
- `paypal-sandbox.html`: negozio dimostrativo riutilizzabile; vedi `01-PAYPAL-PASSO-PASSO.md`.

## Pubblicazione
Sostituisci i file del progetto con questa versione. Su Cloudflare Pages mantieni `npm run build` e `dist` come directory di output. La cartella `functions` deve restare alla radice del progetto. Non caricare soltanto l'HTML: feed e checkout dipendono dalle Functions. Non sono richieste modifiche al database Supabase.

I link email che tornano alla home vengono inoltrati all'area personale preservando i parametri di autenticazione. Mantieni la configurazione Supabase del dominio già funzionante. I token non sono inseriti nelle pagine pubbliche o nelle richieste ai giornali.

## Personalizzazione
I progetti sono brevi descrizioni del lavoro IT, senza dati di clienti, credenziali o metriche inventate. Sostituisci o amplia i testi in `index.html`. Per pubblicare i tuoi contatti inserisci solo recapiti pubblici in `js/public-contact.js`: quelli presenti nel progetto erano vuoti, quindi non sono stati inventati. Il CV non è incluso perché non fa parte dei file di questa versione.

Il portfolio usa una palette neutra e blu. I colori dell'area personale restano personalizzabili. La modalità a movimento ridotto e il pulsante Pausa mostrano i capitoli come sezioni statiche. Lo scroll è nativo: nessun blocco wheel/touch. Sui display bassi viene usata la presentazione statica per evitare sezioni tagliate.

## Verifiche e limiti
Build e test automatici su autenticazione, dati, PayPal e nuove route. I feed possono non essere disponibili: la pagina mostra un messaggio e mantiene i collegamenti ai giornali. Il browser di anteprima dell'ambiente non raggiunge il server locale (ERR_BLOCKED_BY_CLIENT), quindi layout e interazioni vanno controllati dopo il deploy su desktop e telefono. Nessun checkout reale o accesso agli abbonamenti dei giornali è stato effettuato.

## Da provare dopo il deploy
1. Apri la home senza login, scorri tutti i capitoli e prova Pausa movimento.
2. Apri Area personale, accedi e verifica calendario e menu da telefono.
3. Apri Letture, cambia testata e apri un articolo.
4. Segui la guida PayPal e completa un acquisto Sandbox.

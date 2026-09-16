# Aggiornamento Shop Demo e carrello

Nel menu **Shop Demo** scegli T-shirt Studio (1 EUR simulato) e Felpa Club (5 EUR simulati). Puoi aggiungerle al carrello, cambiare le quantità da 1 a 10 per articolo e rimuoverle. Premi **Procedi con PayPal Sandbox** e paga il totale della selezione con un conto acquirente Sandbox.

Il carrello è salvato in questo browser, separato per account. Dopo aver caricato PayPal, usa **Modifica carrello** per cambiare la selezione e creare un nuovo checkout. Se hai interrotto un pagamento, verifica prima il precedente ordine. Il carrello si svuota soltanto dopo una cattura verificata come completata. Il server accetta solo articoli del catalogo e ricalcola il totale: prezzi e totale inviati dal browser non vengono usati.

Sono articoli dimostrativi, senza spedizione e senza denaro reale. Non si acquistano prodotti dei negozi esterni presenti nella wishlist. Le credenziali Cloudflare restano le stesse e non occorrono modifiche a Supabase. Il kit riutilizzabile incluso contiene anche il nuovo carrello.

# DV / Payment Studio

Nuova sezione nel menu del sito e pagina autonoma `paypal-sandbox.html`. Checkout adattabile a mobile, percorso dell'ordine visibile, recupero dello stato dopo interruzioni, registro locale degli ultimi 30 test ed esportazione JSON. Conserva le funzioni Workspace Pro della precedente versione.

## Attivazione su Cloudflare Pages
1. In PayPal Developer accedi al Dashboard e scegli **Sandbox**. Crea un'app associata a un conto Business Sandbox e copia il Client ID e il Secret di quell'app.
2. Nel progetto Cloudflare Pages aggiungi `PAYPAL_SANDBOX_CLIENT_ID` e `PAYPAL_SANDBOX_CLIENT_SECRET` alle variabili disponibili alle Functions. Conserva il Secret come segreto server. Non inserirlo in HTML, JavaScript pubblico o Git.
3. Pubblica questa versione con il sistema Pages già usato: comando `npm run build`, directory `dist`, Functions nella cartella `functions` alla radice del progetto. Le variabili devono appartenere all'ambiente Cloudflare che vuoi provare; anche un deploy Cloudflare “Production” usa esclusivamente PayPal Sandbox con questo codice.
4. Apri Payment Studio. Premi “Carica PayPal Sandbox” e poi il pulsante PayPal. Usa un account **Personal Sandbox diverso dal venditore**, creato nella sezione Sandbox Accounts di PayPal Developer.
5. Approva il test. Il sito mostrerà riuscito solo un ordine con cattura COMPLETED e importo/valuta corrispondenti. Se la finestra viene interrotta, premi “Verifica ordine”.

Non occorrono modifiche a Supabase per questa aggiunta. In assenza di credenziali il checkout rimane disabilitato e indica come configurarlo. Non usare le credenziali Live. Gli importi di 1 e 5 EUR sono simulati; il server decide il prezzo.

## Riutilizzo
Da Payment Studio scarica `paypal-sandbox-starter.zip`: contiene pagina autonoma, CSS, JavaScript, due Pages Functions e il modulo server condiviso. Puoi anche prelevarlo da `assets/downloads`. Il kit è indipendente da Supabase. Su un altro hosting occorre adattare le due route server mantenendo le chiavi private sul server.

## Comportamento e limiti
- Endpoint PayPal Sandbox fisso; nessuna modalità Live e nessun movimento di denaro reale.
- SDK PayPal caricato solo dopo il clic. Il Client ID è pubblico; Secret e token OAuth non sono inviati al browser.
- Ticket firmato con scadenza di un'ora, legato all'origine, al prodotto e all'ordine. Le richieste di creazione/cattura usano identificativi idempotenti.
- Registro nel browser separato per account del sito. La pagina autonoma ha un registro locale condiviso da chi usa quel browser: non è un servizio multiutente autenticato. Non conserva dati del compratore, password o dati di carte.
- Questo è un laboratorio pubblico Sandbox, non un negozio pronto a incassare: mancano archivio persistente degli ordini, rate limiting, webhook verificati, riconciliazione, rimborsi e gli aspetti commerciali del negozio. I log locali non sono ricevute fiscali e non sono un audit immutabile.
- In caso di errore di rete non viene dichiarato il successo: verificare l'ordine. Dopo la scadenza del ticket controllare il conto Sandbox nel Dashboard PayPal.

## Verifiche
Test automatici con risposte PayPal simulate: importi decisi dal server, firma e scadenza ticket, origine, cattura incompleta, ordine non approvato, idempotenza, segreti non esposti e chiamate limitate a Sandbox. Build statica e controllo sintattico. Non è stato eseguito un checkout effettivo con account PayPal: servono le tue credenziali Sandbox. Anteprima browser non verificabile nell'ambiente di lavoro; controllare desktop e telefono dopo il deploy.

Documentazione ufficiale: [integrazione Standard](https://developer.paypal.com/studio/checkout/standard/integrate), [account Sandbox](https://developer.paypal.com/sandbox-testing/accounts), [idempotenza](https://developer.paypal.com/api/rest/reference/idempotency/).

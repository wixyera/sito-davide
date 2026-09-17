# PayPal Sandbox, passo passo

Usiamo soltanto denaro finto. Il conto PayPal normale serve per entrare in Developer; nel checkout userai invece un acquirente Sandbox.

## 1. Apri PayPal Developer
Vai su https://developer.paypal.com/ e premi **Log in to Dashboard**. Accedi al tuo account. Apri **Apps & Credentials** e assicurati di selezionare **Sandbox**, non Live.

## 2. Crea l'app
Premi **Create App**, scegli un nome come `Davide Shop Demo` e associa un account Business Sandbox. Apri l'app creata: troverai **Client ID** e **Secret**. Il Client ID identifica l'app; il Secret deve restare privato. Non inviare il Secret in chat e non scriverlo nei file JavaScript pubblici.

## 3. Inserisci le credenziali in Cloudflare
Apri Cloudflare → **Workers & Pages** → il progetto Pages del sito → **Settings** → **Variables and Secrets** → **Add**. Scegli l'ambiente del deploy che utilizzi, normalmente Production per il sito principale. “Production” qui è l'ambiente Cloudflare: le credenziali PayPal devono comunque essere Sandbox.

Aggiungi queste due variabili, con i nomi esatti:

| Nome | Valore | Tipo |
| --- | --- | --- |
| PAYPAL_SANDBOX_CLIENT_ID | Il Client ID dell'app Sandbox | Testo |
| PAYPAL_SANDBOX_CLIENT_SECRET | Il Secret della stessa app Sandbox | Secret / Encrypt |

Salva. Le credenziali devono essere disponibili alle Pages Functions. Se vuoi provare anche i deploy Preview, impostale anche in quell'ambiente.

## 4. Pubblica di nuovo
Esegui un nuovo deploy dopo aver salvato le variabili. Usa il progetto completo, comando `npm run build`, directory di output `dist`; la cartella `functions` resta alla radice. La copia dei soli file statici non attiva i servizi PayPal.

## 5. Recupera l'acquirente di prova
Torna su PayPal Developer → **Testing Tools** → **Sandbox Accounts**. Scegli un account **Personal**, distinto dal Business venditore. Se manca, crealo. Apri i dettagli dell'account per vedere email e password di prova. Sono queste le credenziali da usare nella finestra del checkout, non quelle del tuo PayPal reale.

## 6. Prova l'acquisto
Apri il sito → Area personale → **Shop Demo**, oppure apri la demo pubblica dalla sezione Progetti. Aggiungi un articolo, cambia la quantità e premi **Procedi con PayPal Sandbox**. Poi premi il pulsante PayPal, accedi con il conto Personal Sandbox e approva.

Il sito verifica la cattura sul server: se è completata con importo e valuta corretti, mostra l'esito positivo e svuota il carrello. Nessun prodotto viene spedito e nessun denaro reale viene trasferito.

## 7. Se qualcosa non funziona
- **Da configurare**: controlla nomi delle variabili, ambiente Cloudflare e nuovo deploy.
- **Credenziali rifiutate**: controlla che entrambe appartengano alla stessa app Sandbox.
- **Login acquirente non riuscito**: usa email/password del conto Personal Sandbox.
- **Finestra bloccata**: consenti il popup PayPal e riprova.
- **Risposta interrotta o esito incerto**: premi **Verifica ordine** prima di avviare un altro checkout. Controlla anche l'attività del conto Sandbox nel Dashboard.

Non serve modificare Supabase. Questo progetto non è abilitato a incassare pagamenti reali: il passaggio a un negozio Live richiede ulteriori componenti e verifiche, descritti in `00-PAYPAL-STUDIO.md`.

Fonti ufficiali:
- https://developer.paypal.com/api/rest
- https://developer.paypal.com/sandbox-testing/accounts
- https://developers.cloudflare.com/pages/functions/bindings/

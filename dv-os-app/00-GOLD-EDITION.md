> Ultimo aggiornamento: `00-WORKSPACE-PRO.md`.

# DV / Gold Edition — aggiornamento finale

## Video e stile

Il filmato nero e oro esistente apre ora il sito. Il filmato della sfilata è nella sezione editoriale della home, con controlli di riproduzione. Nessuna nuova generazione Runway: il tentativo precedente non è stato avviato per crediti insufficienti e, su tua richiesta, sono stati riutilizzati i due filmati esistenti.

La palette predefinita è avorio, nero caldo e oro champagne. Aggiornati menu, login, schede, wishlist, tipografia, spaziature, bordi e controlli. Le preferenze già salvate non vengono sovrascritte: per adottare l’oro anche su un account esistente scegli Personalizza → Oro champagne → Salva.

## Colori personali

Apri Personalizza dal menu o Il mio profilo dalla home. Puoi scegliere Oro champagne, Bordeaux, Verde bosco, Blu notte, Rame o Il mio colore; il selettore permette un colore libero. Salva nel mio account applica e conserva la scelta. Il colore personalizzato riguarda accenti, pulsanti e dettagli: i fondi chiari/scuri rimangono neutri e la leggibilità del testo viene corretta in base al contrasto. I colori squadra Bologna/Napoli rimangono riconoscibili.

## Gol

Migliorata l’animazione vettoriale esistente: luci stadio, pubblico, rincorsa, movimento delle braccia, tiro, ombra del pallone, portiere in tuffo e rete in movimento. Dura circa 3,8 secondi, è saltabile e non parte con movimento ridotto o animazioni in pausa. È un’animazione stilizzata, non un nuovo filmato fotorealistico.

## Foto sull’outfit

Le foto dei capi ora vengono caricate come texture e applicate alle sagome del manichino, tramite la nuova Function product-image che risolve i comuni blocchi CORS del browser. Le foto nei riferimenti rimangono disponibili. Se il negozio rifiuta la foto, compare un messaggio e resta il colore scelto, senza fingere un caricamento riuscito.

Limite: una foto di catalogo non contiene una geometria 3D. La sagoma resta generica; la foto può ripetersi o deformarsi sulle superfici e lo sfondo dell’immagine può comparire sul materiale. Non è un modello fedele della scarpa/capo né una simulazione di vestibilità. Per una vera replica servono asset 3D del prodotto o un servizio specifico di ricostruzione/virtual try-on, non incluso. Le immagini non vengono automaticamente scontornate.

## Installazione e verifiche

Non servono nuove tabelle Supabase. Aggiorna tutto il progetto su Cloudflare Pages includendo functions/api/product-image.js. Comando npm run build, output dist. La cartella dist è aggiornata. Le nuove foto sul 3D richiedono il deploy della Function; aprire solo l’HTML locale non basta.

69 test automatizzati superati: comportamento precedente, contrasto dei colori, isolamento delle preferenze, applicazione delle texture, validazione e trasporto delle immagini. Build completata. Non è stato completato un collaudo visivo nel browser, su telefono reale, sui negozi esterni o sul database remoto. Dopo il deploy controlla intro, film interno, personalizzazione colori, foto outfit e gol sul tuo dispositivo.

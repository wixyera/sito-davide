# Modifiche e verifiche

## Correzioni

- Percorsi degli import dinamici corretti: Focus e galleria ora cercano i moduli nella cartella effettiva del file JavaScript, eliminando i riferimenti `js/js/...`.
- Rinnovo della sessione con refresh token, deduplicazione delle richieste concorrenti e coordinamento tra schede dove Web Locks è disponibile. Gli errori di rete non eliminano le credenziali.
- Gli errori di autorizzazione del database non vengono più interpretati automaticamente come logout.
- Il recupero password riconosce i link email Supabase; il codice personale viene mostrato anche quando la registrazione richiede conferma email.
- Eliminati listener doppi sui pulsanti di autenticazione e bloccati invii ripetuti durante la richiesta.
- Azzeramento delle viste del precedente account prima di mostrare il nuovo spazio.
- Caricamento indipendente dei cinque moduli e messaggi con pulsante Riprova per gli errori.
- Wishlist: totali separati per valuta, validazione di prezzi e URL, pulsante carrello protetto dai doppi clic e stato ripristinato correttamente in caso di errore.
- ICS: UTC e fusi IANA, descrizioni, luoghi, durate, giorni interi e righe Unicode lunghe. Eventi ricorrenti o formati non supportati generano un messaggio prima di importare, senza importazione parziale. Reinserire lo stesso file può creare duplicati.
- Il calendario permette una data finale e mantiene gli orari importati che non sono multipli di 15 minuti.
- Rimosso l'effetto che sovrascriveva l'avanzamento reale dell'anello Focus.
- Il player Spotify carica l'embed all'apertura del pannello.
- Generatore password: casualità crittografica, messaggio per selezioni impossibili e nessun ciclo infinito con caratteri unici insufficienti.
- Cache aggiornata per i nuovi asset; una pagina non disponibile offline non viene sostituita dalla home come se fosse il contenuto richiesto.
- Script SQL completo con isolamento per proprietario anche in presenza di vecchie policy permissive; funzione di recupero con paginazione degli account, timeout e gestione errori.

## Verifiche eseguite

28 test automatici superati (`node --test tests/*.test.mjs`). Coprono sessioni, autenticazione simulata, isolamento nelle richieste, calendario, ICS, Focus, costruzione delle sette opere della galleria, API e asset precache.

Controllo della sintassi dei file JavaScript e degli script inline HTML; controllo dei riferimenti ai file locali. Build Cloudflare Pages completata e output `dist` prodotto.

I test di calendario e ICS vengono eseguiti anche con fuso Europe/Rome per controllare le conversioni locali.

## Da verificare online

Configurazione effettiva di Supabase/RLS, login con credenziali reali, recapito email, deploy della Edge Function, API OpenAI/Spotify e fornitori esterni. Non sono state effettuate scritture sui servizi remoti né prove visive o interazioni in browser. Il codice SQL è fornito ma non è stato eseguito su un database PostgreSQL in questa sessione.

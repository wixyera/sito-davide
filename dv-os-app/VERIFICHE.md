# Verifiche della versione 4

## Email

Il sito non genera più codici di recupero e non chiama più `functions/v1/password-reset`. Registrazione, reinvio della conferma e recupero passano dalle API native Supabase. Il link di recupero verifica la sessione, apre il modulo nuova password e rimuove i token dalla barra degli indirizzi. Ricaricare quella pagina conserva il recupero in corso. I link scaduti restituiscono un messaggio; gli errori di invio non vengono mostrati come successi. La mail Password changed è una notifica server da attivare in Supabase.

## Animazioni

Ingresso con scultura tridimensionale locale, illuminazione ambientale, risposta morbida al puntatore, titoli con comparsa progressiva, transizioni di navigazione, comparsa delle schede allo scorrimento, pulsanti reattivi e profondità della copertina. La scena usa una risoluzione limitata su mobile e si ferma quando non visibile, in pausa o con scheda in background. Il movimento ridotto mantiene tutti i contenuti leggibili. Il fallback usa l'immagine originale inclusa.

Le transizioni native sono riservate ai clic di navigazione: le azioni operative, come creare un evento o aprire un risultato, mantengono il cambio sezione sincrono.

## Controlli

38 test automatici: autenticazione e flussi email simulati, persistenza del recupero dopo un refresh, sessioni, isolamento richieste, calendario e ICS, timer Focus, moduli dinamici, galleria, geometria della nuova scultura, API e cache degli asset. Sono mantenute le correzioni funzionali della versione precedente.

Controllati sintassi JavaScript, script inline e riferimenti ai file locali. Build Cloudflare Pages generata.

## Non verificato da questa sessione

Recapito email reale, impostazioni SMTP e notifiche nel progetto remoto, scritture su Supabase, credenziali delle API esterne e resa visiva/interazioni in un browser. I test della scultura verificano la geometria e le trasformazioni, non il rendering su una GPU reale. Nessuna modifica è stata pubblicata automaticamente nel tuo ambiente Cloudflare o Supabase.

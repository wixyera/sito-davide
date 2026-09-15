# DV / Workspace Pro

Le novità sono già integrate nel sito. Questa versione mantiene i video, i colori personali, il gol e l’outfit dell’ultima Gold Edition.

## Da scoprire

- Spese: budget per mese salvato nell’account, barra di utilizzo, importo residuo/superato, ricerca e filtro categoria. Il budget e i totali considerano tutte le spese del mese, indipendentemente dai filtri. Puoi esportare il singolo mese in CSV.
- Dati e strumenti: dal menu o dalla barra laterale apri Il mio spazio. Vedi l’esito dei caricamenti, puoi ricaricare i dati e scaricare una copia JSON o CSV di spese e wishlist. La copia JSON legge tutte le pagine delle cinque tabelle e include profilo, outfit, preferenze e articoli locali salvati. Se una tabella fallisce, non viene prodotto un file parziale presentato come completo. Non è incluso un ripristino automatico della copia JSON.
- Bozze: calendario, wishlist e spese conservano ciò che scrivi sul dispositivo. Puoi riprendere o eliminare la bozza. Solo Salva la invia all’account; la bozza viene rimossa dopo un salvataggio riuscito. Le bozze non contengono password e sono separate per account. Non vengono incluse nella copia dei dati salvati sul server.
- Calcio: Leggi dopo salva gli articoli; il filtro Salvati li ritrova anche quando escono dalla rassegna. Questi preferiti sono salvati nel browser per account, non sincronizzati tra dispositivi. Per conservarli fuori dal browser usa la copia JSON. Anche le bozze sono locali: cancellare i dati del browser elimina entrambi.
- Ricerca: comprende outfit e articoli salvati, riconosce più parole e accenti. I risultati aprono direttamente la voce da modificare, il relativo mese/giorno o l’articolo. Ctrl/Cmd+K e frecce permettono la navigazione da tastiera.
- Mobile: barra inferiore per Home, Agenda, Wishlist, Calcio e menu completo.

## Correzioni

Gli importi accettano virgola italiana, punto decimale e migliaia in formato italiano (esempio 1.234,56); importi negativi, non numerici o malformati sono rifiutati. I totali delle spese e i budget vengono calcolati in centesimi. Una spesa richiede un importo maggiore di zero; la wishlist consente anche zero o prezzo vuoto.

Le nuove spese usano la data locale del dispositivo, non quella UTC. La home mostra sempre le spese del mese corrente anche se nella pagina Spese stai consultando un altro mese. Le risposte dei dati vengono verificate nuovamente rispetto all’account prima di essere consegnate all’interfaccia. I CSV neutralizzano i contenuti che Excel potrebbe interpretare come formule.

## Aggiornamento

Nessuna nuova tabella, SQL o chiave Supabase. I budget occupano una piccola voce workspace_tools nei metadati del proprio account. Gli articoli restano locali per non ingrandire i token di autenticazione con contenuti e URL.

Sostituisci il progetto completo su Cloudflare Pages, incluse le Functions già presenti. Usa npm run build e dist come output; la dist inclusa è aggiornata. Nessuna pubblicazione automatica è stata effettuata.

## Verifiche

81 test automatizzati superati; build e controllo sintassi completati. I nuovi test coprono importi, date, centesimi, esportazione paginata, interruzione dell’export al cambio account, errori di tabella, assenza di token nelle copie, isolamento dei preferiti e salvataggi budget concorrenti.

Il browser di verifica ha rifiutato l’indirizzo del server locale con ERR_BLOCKED_BY_CLIENT. Non è stato quindi possibile completare una verifica visuale interattiva. Non sono stati usati account reali, modificati dati remoti né verificati negozi/feed in produzione. Dopo il deploy prova sul tuo telefono login, creazione/modifica spese, ripresa bozza, budget, download e salvataggio di un articolo.

I limiti precedenti dell’outfit restano: le immagini vengono applicate a sagome generiche, non ricostruite in modelli fedeli. Nessun nuovo filmato generato e nessun acquisto di crediti.

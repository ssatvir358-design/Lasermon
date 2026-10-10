# Lasermon — gioco locale

Questa distribuzione contiene il gioco browser e i suoi asset. Non richiede account, password, PIN o servizi online.

## Avvio

Scarica lo ZIP del repository, estrailo completamente e apri `main/index.html` con un browser moderno. Mantieni insieme le cartelle `main`, `Script`, `CSS`, `style`, `Sprite` e `Audio`.

Se il browser limita i file locali o i salvataggi, dalla cartella del gioco puoi avviare un server locale con Python:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Su Windows puoi usare `py -3` al posto di `python`. Apri poi `http://127.0.0.1:8000/main/index.html`. Il server rimane sul tuo PC.

## Progressi

I salvataggi sono conservati nel browser: tre slot manuali, checkpoint sulla mappa, Hall of Fame, progressi Challenge e preferenze. Un combattimento interrotto riparte dal checkpoint.

Per passare a un altro PC, usa **Impostazioni → Salvataggi → Esporta backup**, trasferisci il file JSON e importalo sul secondo PC. L'importazione sostituisce i progressi locali dopo conferma. Esporta prima quelli da conservare.

Questa versione usa un solo giocatore locale. Non sincronizza i progressi del sito online e non importa i backup cifrati degli account. Il file JSON locale non è cifrato. Cancellare i dati del browser elimina i progressi non esportati.

## Distribuzione

Backend, autenticazione, generazione PIN, configurazioni di deploy e documentazione interna non fanno parte di questa distribuzione. Gli script eseguiti dal browser sono leggibili: non è possibile eseguirli sul dispositivo del giocatore garantendone contemporaneamente la segretezza.

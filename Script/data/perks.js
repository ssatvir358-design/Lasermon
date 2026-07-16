// ==========================================================
// perks.js \u2014 Database delle abilit\u00e0 passive (Perk)
// Si sbloccano al raggiungimento dei level cap: Lv.45 (Tier 1) e Lv.100 (Tier 2).
// La categoria offerta \u00e8 determinata dalla statistica in gioco pi\u00f9 alta del Pok\u00e9mon.
// ==========================================================

// ----------------------------------------------------------
// LIVELLI CAP \u2014 modifica questi valori per cambiare i threshold
// ----------------------------------------------------------
const CONFIG_PERK_LEVEL_CAP = {
    tier1: 45,   // Livello a cui si sblocca la scelta Tier 1
    tier2: 100   // Livello a cui si sblocca la scelta Tier 2
};

// ----------------------------------------------------------
// DATABASE PERK
// Struttura per categoria:
//   tier1.opzioni[]: le 2 scelte offerte al Lv.45
//   tier2[idPerkTier1]: evoluzione del perk selezionato al Lv.100
//
// Campi di ogni opzione:
//   id        \u2014 identificativo univoco usato dal codice di battaglia
//   nome      \u2014 nome visualizzato nella UI
//   emoji     \u2014 icona decorativa
//   descrizione \u2014 testo mostrato nella schermata di scelta
// ----------------------------------------------------------
const PERK_DB = {

    // ==========================================================
    // \u2764\ufe0f VITA \u2014 si sblocca se hpMax \u00e8 la statistica pi\u00f9 alta
    // ==========================================================
    vita: {
        nome: "VITA",
        emoji: "\u2764\ufe0f",
        colore: "#e74c3c",
        tier1: {
            opzioni: [
                {
                    id: "salvavita",
                    nome: "SALVAVITA",
                    emoji: "\u{1f6e1}\ufe0f",
                    descrizione: "Per una volta per fight, quando gli HP scendono a 0, sopravvivi con 1 HP invece di andare KO."
                },
                {
                    id: "rigenerazione",
                    nome: "RIGENERAZIONE",
                    emoji: "\u{1f49a}",
                    descrizione: "Recupera il 10% degli HP massimi dopo ogni stanza completata."
                }
            ]
        },
        tier2: {
            // Evoluzione di SALVAVITA
            salvavita: {
                id: "salvavita_2",
                nome: "SALVAVITA+",
                emoji: "\u{1f6e1}\ufe0f\u2728",
                descrizione: "SALVAVITA si attiva ora DUE volte per fight invece di una sola."
            },
            // Evoluzione di RIGENERAZIONE
            rigenerazione: {
                id: "rigenerazione_2",
                nome: "RIGENERAZIONE+",
                emoji: "\u{1f49a}\u2728",
                descrizione: "La cura post-stanza sale al 20% degli HP massimi. Inoltre il Pok\u00e9mon diventa immune alla bruciatura."
            }
        }
    },

    // ==========================================================
    // \u2694\ufe0f ATTACCO \u2014 si sblocca se atk \u00e8 la statistica pi\u00f9 alta
    // ==========================================================
    attacco: {
        nome: "ATTACCO",
        emoji: "\u2694\ufe0f",
        colore: "#e67e22",
        tier1: {
            opzioni: [
                {
                    id: "sfondamento",
                    nome: "SFONDAMENTO",
                    emoji: "\u{1f4a5}",
                    descrizione: "Tutti gli attacchi ignorano il 25% della difesa nemica prima del calcolo del danno."
                },
                {
                    id: "full_counter",
                    nome: "FULL COUNTER",
                    emoji: "\u{1f504}",
                    descrizione: "Quando subisce un colpo, restituisce automaticamente il 30% del danno subito al nemico (ignora la difesa)."
                }
            ]
        },
        tier2: {
            sfondamento: {
                id: "sfondamento_2",
                nome: "SFONDAMENTO+",
                emoji: "\u{1f4a5}\u2728",
                descrizione: "La percentuale di difesa ignorata sale al 50%."
            },
            full_counter: {
                id: "full_counter_2",
                nome: "FULL COUNTER+",
                emoji: "\u{1f504}\u2728",
                descrizione: "La percentuale di danno restituito sale al 60%."
            }
        }
    },

    // ==========================================================
    // \u{1f6e1}\ufe0f DIFESA \u2014 si sblocca se def \u00e8 la statistica pi\u00f9 alta
    // ==========================================================
    difesa: {
        nome: "DIFESA",
        emoji: "\u{1f6e1}\ufe0f",
        colore: "#2980b9",
        tier1: {
            opzioni: [
                {
                    id: "scudo",
                    nome: "SCUDO",
                    emoji: "\u{1f535}",
                    // Il contatore viene resettato ogni combattimento; scatta ogni N turni (vedi CONFIG_PERK_SCUDO)
                    descrizione: "Para completamente un attacco nemico ogni 3 turni di combattimento."
                },
                {
                    id: "spine",
                    nome: "SPINE",
                    emoji: "\u{1f335}",
                    // Danno di ritorno = 3 + floor(DEF_attuale / 15)
                    descrizione: "Quando subisce un colpo, il nemico riceve automaticamente 3 + (DEF/15) danni, ignorando la sua difesa."
                }
            ]
        },
        tier2: {
            scudo: {
                id: "scudo_2",
                nome: "SCUDO+",
                emoji: "\u{1f535}\u2728",
                descrizione: "Lo Scudo ora si ricarica ogni 2 turni invece di 3."
            },
            spine: {
                id: "spine_2",
                nome: "SPINE+",
                emoji: "\u{1f335}\u2728",
                // Danno di ritorno = 7 + floor(DEF_attuale / 8)
                descrizione: "Il danno di ritorsione aumenta a 7 + (DEF/8), ignorando la difesa nemica."
            }
        }
    },

    // ==========================================================
    // \u{1f4a8} VELOCITA' \u2014 si sblocca se vel \u00e8 la statistica pi\u00f9 alta
    // ==========================================================
    velocita: {
        nome: "VELOCITA'",
        emoji: "\u{1f4a8}",
        colore: "#8e44ad",
        tier1: {
            opzioni: [
                {
                    id: "schivata_aumentata",
                    nome: "SCHIVATA AUMENTATA",
                    emoji: "\u{1f300}",
                    // Il cap di schivata viene moltiplicato \u{00d71}.35 dalla formula base dell'elemento
                    descrizione: "Aumenta il cap di schivata del 35% rispetto al valore calcolato dalla formula base."
                },
                {
                    id: "doppio_attacco",
                    nome: "DOPPIO ATTACCO",
                    emoji: "\u26a1",
                    // 15% prob; il secondo colpo fa il 50% del danno base del turno
                    descrizione: "Hai il 15% di probabilit\u00e0 di sferrare un secondo attacco nello stesso turno. Il secondo colpo infligge il 50% del danno base."
                }
            ]
        },
        tier2: {
            schivata_aumentata: {
                id: "schivata_aumentata_2",
                nome: "SCHIVATA AUMENTATA+",
                emoji: "\u{1f300}\u2728",
                // Moltiplicatore ulteriore \u{00d71}.45 applicato sul valore gi\u00e0 aumentato del Tier 1
                descrizione: "Il cap di schivata aumenta di un ulteriore 45% rispetto al valore del Tier 1 (\u{00d71}.35 \u00d7 \u{00d71}.45)."
            },
            doppio_attacco: {
                id: "doppio_attacco_2",
                nome: "DOPPIO ATTACCO+",
                emoji: "\u26a1\u2728",
                // 30% prob; il secondo colpo fa sempre il 50% del danno base
                descrizione: "La probabilit\u00e0 del secondo attacco sale al 30%. Il secondo colpo infligge ancora il 50% del danno base."
            }
        }
    }
};

// ----------------------------------------------------------
// CONFIG PERK \u2014 parametri numerici modificabili separatamente
// ----------------------------------------------------------
const CONFIG_PERK = {
    // SCUDO: ogni quanti turni si attiva (Tier 1 e Tier 2)
    scudoTurniTier1: 3,
    scudoTurniTier2: 2,

    // RIGENERAZIONE: percentuale di cura post-stanza
    rigenerazionePercTier1: 0.10,
    rigenerazionePercTier2: 0.20,

    // SFONDAMENTO: percentuale di difesa ignorata
    sfondamentoPercTier1: 0.25,
    sfondamentoPercTier2: 0.50,

    // FULL COUNTER: percentuale del danno subito restituita
    fullCounterPercTier1: 0.30,
    fullCounterPercTier2: 0.60,

    // SPINE: formula danno ritorno = base + floor(DEF / divisore)
    spineDannoBaseTier1: 3,
    spineDivisoreTier1:  15,
    spineDannoBaseTier2: 7,
    spineDivisoreTier2:  8,

    // SCHIVATA AUMENTATA: moltiplicatori cumulativi
    schivataAumentataMultTier1: 1.35,
    schivataAumentataMultTier2: 1.45,  // applicato SUL risultato Tier 1 gi\u00e0 moltiplicato

    // DOPPIO ATTACCO: probabilit\u00e0 e percentuale danno secondo colpo
    doppioAttaccoProbTier1:    0.15,
    doppioAttaccoProbTier2:    0.30,
    doppioAttaccoDannoPerc:    0.50,   // secondo colpo = 50% del danno base (uguale per entrambi i tier)

    // SALVAVITA: numero massimo di attivazioni per fight
    salvavitaUsiTier1: 1,
    salvavitaUsiTier2: 2
};

// ----------------------------------------------------------
// CONFIG SCHIVATA \u2014 moltiplicatori formula per elemento
// Formula: Math.floor( (Vel * moltiplicatore) / (Vel + 60) )
// ----------------------------------------------------------
const CONFIG_SCHIVATA_ELEMENTO = {
    "fuoco":  30,
    "erga":   30,  // typo guard
    "erba":   30,
    "acqua":  30,
    "luce":   30,
    "buio":   40   // il Buio ha un moltiplicatore pi\u00f9 alto per design
};

// ----------------------------------------------------------
// HELPER: restituisce il record del perk dato un ID
// Cerca in tutti i tier di tutte le categorie
// ----------------------------------------------------------
function getPerkDaId(perkId) {
    if (!perkId) return null;
    for (const cat of Object.values(PERK_DB)) {
        // Tier 1
        for (const op of cat.tier1.opzioni) {
            if (op.id === perkId) return { ...op, categoria: cat.nome, livelloTier: 1 };
        }
        // Tier 2
        for (const evo of Object.values(cat.tier2)) {
            if (evo.id === perkId) return { ...evo, categoria: cat.nome, livelloTier: 2 };
        }
    }
    return null;
}

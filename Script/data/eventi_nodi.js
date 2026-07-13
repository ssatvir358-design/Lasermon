// ==========================================================
// eventi_nodi.js — Database dei tipi di evento spawnable sui nodi mappa
//
// Ogni evento ha tre parametri:
//   PianoMin         → dal quale piano (incluso) può comparire questo evento.
//                      1 = primo piano giocabile (dopo START).
//   PianoMax         → fino a quale piano (incluso) può comparire.
//                      Usa 99 come "infinito" (nessun limite superiore).
//   QuantitaMaxPerMappa → quante volte al massimo può apparire in una singola mappa.
//                         -1 = nessun limite (funziona anche da "riempitivo" se
//                              tutti gli altri eventi limitati sono esauriti).
//
// REGOLE DI GENERAZIONE (vedi mappa.js > generaMappaProcedurale):
//   1. Per ogni nodo, viene costruito un pool di eventi "eligibili" per quel piano.
//   2. Dal pool vengono esclusi gli eventi che hanno già raggiunto QuantitaMaxPerMappa.
//   3. Se il pool risultante è vuoto, il generatore cade sul fallback: usa solo
//      gli eventi con QuantitaMaxPerMappa === -1 (garantiti infiniti).
//
// COME MODIFICARE:
//   • Per aggiungere un nuovo tipo di evento, aggiungi una chiave qui sotto
//     e assicurati di gestirla in avviaEvento() (mappa.js).
//   • Per cambiare quando appare un evento, basta modificare PianoMin/PianoMax.
//   • Per renderlo più o meno raro, abbassa/alza QuantitaMaxPerMappa.
// ==========================================================

const DB_EVENTI_NODI = {

    // ---- EVENTI INFINITI (riempitivi garantiti) ----

    "cespuglio": {
        PianoMin:          1,   // Appare dal primo piano
        PianoMax:          99,  // Senza limite superiore
        QuantitaMaxPerMappa: -1 // Nessun limite: è l'evento di default
    },
    "npc": {
        PianoMin:          1,
        PianoMax:          99,
        QuantitaMaxPerMappa: -1 // Nessun limite: è un evento di default
    },

    // ---- EVENTI LIMITATI ----

    "pokeball": {
        PianoMin:          1,
        PianoMax:          99,
        QuantitaMaxPerMappa: -1
    },
    "scambio": {
        PianoMin:          1,
        PianoMax:          99,
        QuantitaMaxPerMappa: -1
    },
    "disco": {
        PianoMin:          1,
        PianoMax:          99,
        QuantitaMaxPerMappa: -1
    },
    "mistero": {
        PianoMin:          1,
        PianoMax:          99,
        QuantitaMaxPerMappa: -1
    },
    "item": {
        PianoMin:          1,   
        PianoMax:          99,
        QuantitaMaxPerMappa: -1
    }

    // ---- TEMPLATE PER NUOVI EVENTI ----
    // Decommentare e personalizzare per aggiungere nuovi tipi:
    //
    // "altare-energetico": {
    //     PianoMin:          4,   // Solo dal piano 4 in poi
    //     PianoMax:          8,   // Fino al piano 8 (es. penultimo)
    //     QuantitaMaxPerMappa: 1
    // },
};

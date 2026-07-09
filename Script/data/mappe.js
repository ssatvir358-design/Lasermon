// ==========================================================
// mappe.js — Archivio configurazione mappe del gioco
// Estratto da script.js (righe 224-333)
// ==========================================================

const ARCHIVIO_MAPPE = {
    "mappa1": {
        sfondo: "../Sprite/mappe/1.png",
        livelloMin: 1,
        livelloMaxRelativo: 5,  // Massimo fino a metà mappa
        livelloMaxMassimo: 10,  // Massimo nella seconda metà
        mossaMin: 1,
        mossaMaxRel: 1,         // Fino a metà mappa escono mosse solo a liv 1
        mossaMaxMax: 2,         // Nella seconda metà possono uscire mosse di liv 1 o 2
        idBoss: "1",            // Tudor
        RaritaMin: "comune",
        RaritaMax: "non comune"
    },
    "mappa2": {
        sfondo: "../Sprite/mappe/2.png",
        livelloMin: 10,
        livelloMaxRelativo: 15,
        livelloMaxMassimo: 20,
        mossaMin: 1,
        mossaMaxRel: 2,         // Nella prima metà mosse liv 1 o 2
        mossaMaxMax: 2,         // Nella seconda metà mosse fisse a liv 2 (min 2, max 2)
        idBoss: "2",            // Solieri
        RaritaMin: "comune",
        RaritaMax: "raro"
    },
    "mappa3": {
        sfondo: "../Sprite/mappe/3.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 1,
        mossaMaxRel: 2,
        mossaMaxMax: 3,         // Inizia a comparire il livello mossa 3 nella seconda metà
        idBoss: "3",            // Donato
        RaritaMin: "comune",
        RaritaMax: "epico"
    },
    "mappa4": {
        sfondo: "../Sprite/mappe/4.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 2,
        mossaMaxMax: 3,
        idBoss: "4",
        RaritaMin: "non comune",
        RaritaMax: "epico"
    },
    "mappa5": {
        sfondo: "../Sprite/mappe/5.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "5",
        RaritaMin: "non comune",
        RaritaMax: "epico"
    },
    "mappa6": {
        sfondo: "../Sprite/mappe/6.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "6",
        RaritaMin: "non comune",
        RaritaMax: "leggendario"
    },
    "mappa7": {
        sfondo: "../Sprite/mappe/7.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "7",
        RaritaMin: "raro",
        RaritaMax: "leggendario"
    },
    "mappa8": {
        sfondo: "../Sprite/mappe/8.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,         // Mosse fisse al livello 3
        idBoss: "8",
        RaritaMin: "raro",
        RaritaMax: "leggendario"
    },
    "mappa9": {
        sfondo: "../Sprite/mappe/9.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "13",
        RaritaMin: "epico",
        RaritaMax: "leggendario"
    }
};

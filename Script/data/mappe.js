// ==========================================================
// mappe.js \u2014 Archivio configurazione mappe del gioco
// Estratto da script.js (righe 224-333)
// ==========================================================

const ARCHIVIO_MAPPE = {
    "mappa1": {
        sfondoMappa: "../Sprite/mappe/1.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento1.png",
        livelloMin: 1,
        livelloMaxRelativo: 5,  // Massimo fino a met\u00e0 mappa
        livelloMaxMassimo: 10,  // Massimo nella seconda met\u00e0
        mossaMin: 1,
        mossaMaxRel: 1,         // Fino a met\u00e0 mappa escono mosse solo a liv 1
        mossaMaxMax: 2,         // Nella seconda met\u00e0 possono uscire mosse di liv 1 o 2
        idBoss: "1",            // Tudor
        RaritaMin: "comune",
        RaritaMax: "non comune"
    },
    "mappa2": {
        sfondoMappa: "../Sprite/mappe/1.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento1.png",
        livelloMin: 10,
        livelloMaxRelativo: 15,
        livelloMaxMassimo: 20,
        mossaMin: 1,
        mossaMaxRel: 2,         // Nella prima met\u00e0 mosse liv 1 o 2
        mossaMaxMax: 2,         // Nella seconda met\u00e0 mosse fisse a liv 2 (min 2, max 2)
        idBoss: "2",            // Solieri
        RaritaMin: "comune",
        RaritaMax: "raro"
    },
    "mappa3": {
        sfondoMappa: "../Sprite/mappe/1.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento1.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 1,
        mossaMaxRel: 2,
        mossaMaxMax: 3,         // Inizia a comparire il livello mossa 3 nella seconda met\u00e0
        idBoss: "3",            // Donato
        RaritaMin: "comune",
        RaritaMax: "epico"
    },
    "mappa4": {
        sfondoMappa: "../Sprite/mappe/2.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento2.png",
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
        sfondoMappa: "../Sprite/mappe/2.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento2.png",
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
        sfondoMappa: "../Sprite/mappe/2.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento2.png",
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
        sfondoMappa: "../Sprite/mappe/3.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento3.png",
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
        sfondoMappa: "../Sprite/mappe/3.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento3.png",
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
        sfondoMappa: "../Sprite/mappe/4.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento4.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "13",
        RaritaMin: "epico",
        RaritaMax: "leggendario"
    },
    "mappa10": {
        sfondoMappa: "../Sprite/mappe/5.png",
        sfondoBattaglia: "../Sprite/UI/Combattimento/Combattimento5.png",
        livelloMin: 100,
        livelloMaxRelativo: 100,
        livelloMaxMassimo: 100,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "10",
        RaritaMin: "leggendario",
        RaritaMax: "leggendario"
    }
};
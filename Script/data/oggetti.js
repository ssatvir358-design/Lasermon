// ==========================================================
// oggetti.js — Database completo di tutti gli oggetti del gioco
//
// STRUTTURA DI OGNI OGGETTO:
//   id               → stringa univoca identificativa
//   nome             → nome visualizzato
//   icona            → path sprite PNG (../Sprite/item/...)
//   iconaFallback    → emoji mostrata se il PNG non è ancora presente
//   mappeAbilitate   → array di numeri mappa dove l'item appare (negozio o spawn)
//                      [] = non appare (solo tramite eventi)
//   descrizione      → testo descrittivo dell'effetto
//   categoria        → "consumabile"    = si usa e sparisce
//                      "equipaggiabile" = occupa uno slot Pokémon (permanente)
//   acquistabile     → true = appare nel negozio del centro medico
//   stat             → statistica impattata: "hp","atk","def","vel","tutto",null
//   valore           → quantità di impatto
//   valoreType       → "flat"    = valore fisso assoluto
//                      "percent" = percentuale degli HP max / della stat base
//   costo            → costo in monete (rilevante solo se acquistabile: true)
//   consumabile      → true = si rimuove dallo zaino dopo l'uso
//   effettoSpeciale  → null | "rimuovi_bruciatura" | "rimuovi_debuff" | "rimuovi_tutto"
//                           | "atk_boost_temporaneo"
//   usabileInBattaglia → true = può essere usato premendo ITEM durante la battaglia
//   limiteUtilizziPerFight → null = nessun limite
//                            N    = massimo N utilizzi per scontro (per futuri item one-shot)
//   durataInTurni    → null = effetto istantaneo | N = dura N turni (per buff temporanei)
//
// CAMPI AGGIUNTIVI SOLO PER EQUIPAGGIABILI (trovati per terra):
//   spawnPerc        → percentuale di spawn sul nodo mappa (null = non ancora definita)
//   itemSpeciale     → true = item speciale (effetti unici / cursed), false = normale
//   raritaItem       → "comune" | "raro" | "epico" | null (non ancora definita)
//   maledetto        → true = ha effetti negativi insieme ai positivi
//
// COME AGGIUNGERE NUOVI OGGETTI:
//   1. Aggiungi un nuovo record rispettando la struttura sopra.
//   2. Se è acquistabile, specifica mappeAbilitate e costo.
//   3. Se ha un effetto speciale, aggiungi il caso in applicaEffettoItem() in negozio.js.
//   4. Se è equipaggiabile, gestiscine l'applicazione in aggiornaStatsLivello() / pokemon_factory.js.
// ==========================================================

const DB_OGGETTI = [

    // ========================================================
    // SEZIONE A — CONSUMABILI
    // Acquistabili nel negozio del Centro Medico.
    // Si usano in battaglia o fuori e si consumano (scompaiono dallo zaino).
    // ========================================================

    // --- Ripristino PV fisso ---

    {
        id:                   "caffe_macchinetta",
        nome:                 "Caffè alla Macchinetta",
        icona:                "../Sprite/item/comprabili/caffe_macchinetta.png",
        iconaFallback:        "☕",
        mappeAbilitate:       [1, 2],
        descrizione:          "Il classico caffè annacquato della macchinetta. Recupera 20 PV al Pokémon selezionato.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               20,
        valoreType:           "flat",
        costo:                2,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "energy_drink",
        nome:                 "Energy Drink",
        icona:                "../Sprite/item/comprabili/energy_drink.png",
        iconaFallback:        "⚡",
        mappeAbilitate:       [3, 4],
        descrizione:          "Bevanda energizzante al taurina. Recupera 150 PV al Pokémon selezionato.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               150,
        valoreType:           "flat",
        costo:                5,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "shake_proteico",
        nome:                 "Shake Proteico",
        icona:                "../Sprite/item/comprabili/shake_proteico.png",
        iconaFallback:        "🥤",
        mappeAbilitate:       [5, 6, 7],
        descrizione:          "Shake ricco di proteine da palestra. Recupera 300 PV al Pokémon selezionato.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               300,
        valoreType:           "flat",
        costo:                10,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "integratore_avanzato",
        nome:                 "Integratore Avanzato",
        icona:                "../Sprite/item/comprabili/integratore_avanzato.png",
        iconaFallback:        "💊",
        mappeAbilitate:       [8, 9],
        descrizione:          "Formula scientifica da laboratorio. Recupera 450 PV al Pokémon selezionato.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               450,
        valoreType:           "flat",
        costo:                12,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    // --- Ripristino PV percentuale ---

    {
        id:                   "snack_al_volo",
        nome:                 "Snack al Volo",
        icona:                "../Sprite/item/comprabili/snack_al_volo.png",
        iconaFallback:        "🍿",
        mappeAbilitate:       [3, 4],
        descrizione:          "Uno snack veloce tra un evento e l'altro. Recupera il 20% dei PV massimi.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               0.20,
        valoreType:           "percent",
        costo:                3,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "trancio_pizza",
        nome:                 "Trancio di Pizza",
        icona:                "../Sprite/item/comprabili/trancio_pizza.png",
        iconaFallback:        "🍕",
        mappeAbilitate:       [3, 4],
        descrizione:          "Un trancio caldo dalla pizzeria sotto l'ufficio. Recupera il 40% dei PV massimi.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               0.40,
        valoreType:           "percent",
        costo:                7,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "kebab",
        nome:                 "Kebab",
        icona:                "../Sprite/item/comprabili/kebab.png",
        iconaFallback:        "🥙",
        mappeAbilitate:       [5, 6, 7],
        descrizione:          "Il kebab del chiosco di fiducia. Recupera il 60% dei PV massimi.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               0.60,
        valoreType:           "percent",
        costo:                12,
        consumabile:          true,
        effettoSpeciale:      null,
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    // --- Cura + effetto speciale ---

    {
        id:                   "acqua_fresca",
        nome:                 "Acqua Fresca",
        icona:                "../Sprite/item/comprabili/acqua_fresca.png",
        iconaFallback:        "💧",
        mappeAbilitate:       [3, 4],
        descrizione:          "Acqua freschissima di fonte. Recupera 50 PV e rimuove la bruciatura.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               50,
        valoreType:           "flat",
        costo:                6,
        consumabile:          true,
        effettoSpeciale:      "rimuovi_bruciatura",
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "creatina",
        nome:                 "Creatina",
        icona:                "../Sprite/item/comprabili/creatina.png",
        iconaFallback:        "💪",
        mappeAbilitate:       [5, 6, 7],
        descrizione:          "Integratore sportivo professionale. Recupera 150 PV e rimuove tutti i debuff attivi.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               150,
        valoreType:           "flat",
        costo:                10,
        consumabile:          true,
        effettoSpeciale:      "rimuovi_debuff",
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    {
        id:                   "grigliata_aziendale",
        nome:                 "Grigliata Aziendale",
        icona:                "../Sprite/item/comprabili/grigliata_aziendale.png",
        iconaFallback:        "🍖",
        mappeAbilitate:       [8, 9],
        descrizione:          "Il banchetto del team building. Ripristina il 100% dei PV e rimuove ogni debuff e alterazione di stato.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "hp",
        valore:               1.0,
        valoreType:           "percent",
        costo:                25,
        consumabile:          true,
        effettoSpeciale:      "rimuovi_tutto",
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: null,
        durataInTurni:        null
    },

    // --- Buff temporanei in battaglia ---

    {
        id:                   "contratto_determinato",
        nome:                 "Contratto Determinato",
        icona:                "../Sprite/item/comprabili/contratto_determinato.png",
        iconaFallback:        "📋",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "Un contratto a termine che motiva il Pokémon. In battaglia aumenta l'ATK del 20% per 3 turni.",
        categoria:            "consumabile",
        acquistabile:         true,
        stat:                 "atk",
        valore:               0.20,
        valoreType:           "percent",
        costo:                15,
        consumabile:          true,
        effettoSpeciale:      "atk_boost_temporaneo",
        usabileInBattaglia:   true,
        limiteUtilizziPerFight: 1,   // Può essere usato al massimo 1 volta per fight
        durataInTurni:        3
    },

    // ========================================================
    // SEZIONE B — EQUIPAGGIABILI
    // Trovati in nodi speciali sulla mappa (non acquistabili).
    // Si equipaggiano al Pokémon e restano permanentemente.
    // Icona generica: ../Sprite/nodi/item.png (da aggiornare con sprite dedicati)
    //
    // I campi spawnPerc, itemSpeciale, raritaItem, maledetto
    // sono da completare quando sarà definito il sistema di spawn.
    // ========================================================

    // ---- Mappe 1-3: item di primo livello (bonus flat modesti) ----

    {
        id:                   "bracciale_laser",
        nome:                 "Braccialetto Laser",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "⌚",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Un braccialetto aziendale con circuiti laser integrati. Conferisce +20 HP massimi.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "hp",
        valore:               20,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        // --- Campi spawn (da definire) ---
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "anello_leone",
        nome:                 "Anello del Leone",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🦁",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Un anello con il simbolo del leone. Conferisce +8 ATK.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               8,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "tshirt_laser",
        nome:                 "T-Shirt Laser",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "👕",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "La classica T-shirt da lavoro con il logo Laser. Conferisce +6 DEF.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "def",
        valore:               6,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "ciabatte_birk",
        nome:                 "Ciabatte Birk",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🩴",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Le famose ciabatte comode. Conferisce +6 VEL.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "vel",
        valore:               6,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    // --- Bonus percentuale mappe 1-3 ---

    {
        id:                   "caffe_lungo",
        nome:                 "Caffè Lungo della Macchinetta",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "☕",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Un caffè lungo extra-forte trovato dimenticato. Aumenta i PV massimi del 10%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "hp",
        valore:               0.10,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "foglio_permesso",
        nome:                 "Foglio di Permesso",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "📄",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Un foglio di permesso firmato che dà sicurezza. Aumenta la DEF del 10%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "def",
        valore:               0.10,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "mail_sollecito",
        nome:                 "Mail di Sollecito",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "📧",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Una mail di sollecito che fa scattare l'adrenalina. Aumenta l'ATK del 10%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               0.10,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "smartphone",
        nome:                 "Smartphone",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "📱",
        mappeAbilitate:       [1, 2, 3],
        descrizione:          "Uno smartphone aziendale trovato per terra. Aumenta la VEL del 10%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "vel",
        valore:               0.10,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    // ---- Mappe 4-6: item di secondo livello (bonus flat medi) ----

    {
        id:                   "cintura_responsabile",
        nome:                 "Cintura del Responsabile",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🥋",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "La cintura del responsabile di reparto. Conferisce +50 HP massimi.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "hp",
        valore:               50,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "spada_leone",
        nome:                 "Spada del Leone",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "⚔️",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Una spada con la testa del leone incisa. Conferisce +22 ATK.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               22,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "pantaloni_laser",
        nome:                 "Pantaloni Laser",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "👖",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Pantaloni rinforzati con fibra Laser. Conferisce +25 DEF.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "def",
        valore:               25,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "tacchi_leonessa",
        nome:                 "Tacchi della Leonessa",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "👠",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Tacchi eleganti con suola anti-scivolo. Conferisce +20 VEL.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "vel",
        valore:               20,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    // --- Bonus percentuale mappe 4-6 ---

    {
        id:                   "the_macchinetta",
        nome:                 "Tè della Macchinetta",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🍵",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Un tè inaspettatamente buono. Aumenta i PV massimi del 15%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "hp",
        valore:               0.15,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "giubbino_laser",
        nome:                 "Giubbino Laser",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🧥",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Un giubbino antiproiettile con logo Laser. Aumenta la DEF del 15%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "def",
        valore:               0.15,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "tabellone_ticket",
        nome:                 "Tabellone Ticket",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🎫",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Il tabellone dei ticket con tutti gli obiettivi raggiunti. Aumenta l'ATK del 15%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               0.15,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "auto_aziendale",
        nome:                 "Auto Aziendale",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🚗",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "Una berlina aziendale parcheggiata fuori. Aumenta la VEL del 15%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "vel",
        valore:               0.15,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    // --- Cursed item mappe 4-6 ---

    {
        id:                   "cornetto_reception",
        nome:                 "Cornetto della Reception (Maledetto)",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🥐",
        mappeAbilitate:       [4, 5, 6],
        descrizione:          "⚠️ MALEDETTO — Un cornetto avanzato trovato in reception. +20 HP massimi ma -15 VEL.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        // Effetto doppio: hp flat +20, vel flat -15
        // Il campo "stat" gestisce solo il bonus positivo; il malus è in effettoSpeciale
        stat:                 "hp",
        valore:               20,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      "malus_vel_flat",  // Handler custom: applica -15 VEL
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         true,
        raritaItem:           null,
        maledetto:            true,
        // Valori extra per il malus (letti da applicaEffettoItem)
        malusStatistica:      "vel",
        malusValore:          -15,
        malusValoreType:      "flat"
    },

    // ---- Mappe 7-9: item di terzo livello (bonus alti) ----

    {
        id:                   "cappello_laser",
        nome:                 "Cappello Laser",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🧢",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "Un cappello da direttore con visiera a LED. Conferisce +120 HP massimi.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "hp",
        valore:               120,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "lancia_leone",
        nome:                 "Lancia Divina del Leone",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🗡️",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "Una lancia leggendaria forgiata con le zanne del leone. Conferisce +60 ATK.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               60,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "scarpe_antinfortunio",
        nome:                 "Scarpe Anti-Infortunistiche",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "👟",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "Scarpe antinfortunistiche certificate. Conferisce +70 DEF.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "def",
        valore:               70,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    {
        id:                   "infradito_amministrativo",
        nome:                 "Infradito Amministrativo",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🩴",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "Un infradito aerodinamico trovato nella sala conferenze. Conferisce +40 VEL.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "vel",
        valore:               40,
        valoreType:           "flat",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      null,
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false
    },

    // --- Bonus percentuale mappe 7-9 (doppi) ---

    {
        id:                   "tessera_sindacato",
        nome:                 "Tessera del Sindacato",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🪪",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "La tessera sindacale che protegge da tutto. Aumenta HP massimi e DEF del 20%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        // Effetto doppio: hp% e def%
        stat:                 "hp",
        valore:               0.20,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      "bonus_aggiuntivo_def_percent",  // Handler: applica anche +20% DEF
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false,
        // Bonus aggiuntivo
        bonusStatistica:      "def",
        bonusValore:          0.20,
        bonusValoreType:      "percent"
    },

    {
        id:                   "contratto_indeterminato",
        nome:                 "Contratto Indeterminato",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "📜",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "Il mitico contratto a tempo indeterminato. Aumenta ATK e VEL del 25%.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               0.25,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      "bonus_aggiuntivo_vel_percent",  // Handler: applica anche +25% VEL
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         false,
        raritaItem:           null,
        maledetto:            false,
        bonusStatistica:      "vel",
        bonusValore:          0.25,
        bonusValoreType:      "percent"
    },

    // --- Cursed item mappe 7-9 ---

    {
        id:                   "sedia_ergonomica",
        nome:                 "Sedia Ergonomica (Maledetta)",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "🪑",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "⚠️ MALEDETTA — Una sedia ergonomica lussuosa. +30% DEF ma -20% VEL.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "def",
        valore:               0.30,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      "malus_vel_percent",  // Handler custom: applica -20% VEL
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         true,
        raritaItem:           null,
        maledetto:            true,
        malusStatistica:      "vel",
        malusValore:          -0.20,
        malusValoreType:      "percent"
    },

    {
        id:                   "bonus_straordinario",
        nome:                 "Bonus Straordinario (Maledetto)",
        icona:                "../Sprite/nodi/item.png",
        iconaFallback:        "💰",
        mappeAbilitate:       [7, 8, 9],
        descrizione:          "⚠️ MALEDETTO — Un bonus in busta paga inaspettato. +30% ATK ma -20% DEF.",
        categoria:            "equipaggiabile",
        acquistabile:         false,
        stat:                 "atk",
        valore:               0.30,
        valoreType:           "percent",
        costo:                0,
        consumabile:          false,
        effettoSpeciale:      "malus_def_percent",  // Handler custom: applica -20% DEF
        usabileInBattaglia:   false,
        limiteUtilizziPerFight: null,
        durataInTurni:        null,
        spawnPerc:            null,
        itemSpeciale:         true,
        raritaItem:           null,
        maledetto:            true,
        malusStatistica:      "def",
        malusValore:          -0.20,
        malusValoreType:      "percent"
    },

    // --------------------------------------------------------
    // TEMPLATE PER NUOVI OGGETTI:
    // {
    //     id:                   "nuovo_oggetto",
    //     nome:                 "Nome Oggetto",
    //     icona:                "../Sprite/item/categoria/filename.png",
    //     iconaFallback:        "🎁",
    //     mappeAbilitate:       [1, 2, 3],
    //     descrizione:          "Descrizione effetto",
    //     categoria:            "consumabile",   // o "equipaggiabile"
    //     acquistabile:         true,            // false per quelli a terra
    //     stat:                 "hp",
    //     valore:               100,
    //     valoreType:           "flat",          // o "percent"
    //     costo:                10,              // 0 se non acquistabile
    //     consumabile:          true,            // false per equipaggiabili
    //     effettoSpeciale:      null,
    //     usabileInBattaglia:   true,
    //     limiteUtilizziPerFight: null,
    //     durataInTurni:        null,
    //     // Solo equipaggiabili:
    //     spawnPerc:            null,
    //     itemSpeciale:         false,
    //     raritaItem:           null,
    //     maledetto:            false
    // },
    // --------------------------------------------------------
];

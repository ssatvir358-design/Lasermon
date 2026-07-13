// ==========================================================
// pokemon_factory.js — Funzioni pure per creare e manipolare Pokémon
// Dipendenze: config.js, stato.js
// ==========================================================

// ----------------------------------------------------------
// FORMULA DELLE STATISTICHE
// ----------------------------------------------------------
// Tutte le stat (tranne HP) usano questa formula:
//
//   ROUND( statBase + (livello × moltiplicatoreElemento × moltiplicatoreRarità) / 0.75 )
//
// Gli HP usano invece:
//
//   ROUND( hpBase + (livello × moltiplicatoreElemento_hp × moltiplicatoreRarità) / 0.25 ) + livello
//
// Per modificare il bilanciamento in futuro:
//   • Cambia 0.75 (divisore stat normali) per scalare più o meno rapidamente ATK/DEF/VEL
//   • Cambia 0.25 (divisore HP) per scalare più o meno rapidamente gli HP
//   • Il "+ livello" finale sugli HP aggiunge un bonus lineare al crescere del livello
//   • I valori base si trovano in pokemonDatabase (hpBase, atkBase, defBase, velBase)
//   • I moltiplicatori per elemento sono in CONFIG_STAT_ELEMENTO (config.js)
//   • I moltiplicatori per rarità sono in CONFIG_MOLTIPLICATORE_RARITA (config.js)
// ----------------------------------------------------------

/**
 * Calcola una singola statistica (non HP) dal livello con la formula attuale.
 * @param {number} statBase  - Valore base della stat nel DB
 * @param {number} livello   - Livello del Pokémon
 * @param {number} molElem   - Moltiplicatore elemento (CONFIG_STAT_ELEMENTO)
 * @param {number} molRar    - Moltiplicatore rarità (CONFIG_MOLTIPLICATORE_RARITA)
 * @returns {number}         - Valore arrotondato della stat
 */
function calcolaStat(statBase, livello, molElem, molRar) {
    // Formula: ROUND(statBase + (livello × molElem × molRar) / 0.75)
    // Modifica il divisore 0.75 per cambiare lo scaling di ATK/DEF/VEL
    return Math.round(statBase + (livello * molElem * molRar) / 0.75);
}

/**
 * Calcola gli HP dal livello con la formula attuale.
 * @param {number} hpBase  - HP base nel DB
 * @param {number} livello - Livello del Pokémon
 * @param {number} molElem - Moltiplicatore elemento HP (CONFIG_STAT_ELEMENTO.hp)
 * @param {number} molRar  - Moltiplicatore rarità (CONFIG_MOLTIPLICATORE_RARITA)
 * @returns {number}       - Valore arrotondato degli HP
 */
function calcolaHP(hpBase, livello, molElem, molRar) {
    // Formula: ROUND(hpBase + (livello × molElem × molRar) / 0.25) + livello
    // Modifica il divisore 0.25 per cambiare lo scaling degli HP
    // Il "+ livello" aggiunge un bonus lineare per livello
    return Math.round(hpBase + (livello * molElem * molRar) / 0.25) + livello;
}

// Calcola il livello e il livello mossa appropriati per un nodo della mappa corrente
function calcolaLivelloEMossaMappa(piano, tipoEvento) {
    const configMappa = ARCHIVIO_MAPPE[mappaAttuale];
    
    let indiceMappa = 1;
    if (mappaAttuale && mappaAttuale.startsWith("mappa")) {
        indiceMappa = parseInt(mappaAttuale.replace("mappa", "")) || 1;
    }
    
    // Per eventuali mappe non definite usa Mappa 1 come fallback
    const configLivelli = CONFIG_LIVELLI_MAPPE[indiceMappa] || CONFIG_LIVELLI_MAPPE[1];
    
    let lvIngresso = configLivelli.ingresso;
    let lvBoss = configLivelli.boss;
    
    let livelloGenerato = 1;
    
    if (tipoEvento === "boss") {
        livelloGenerato = lvBoss;
    } else if (tipoEvento === "npc" || tipoEvento === "allenatore") {
        let randomOffset = Math.floor(Math.random() * 2); // 0 o +1
        let baseCalc = lvIngresso + (((lvBoss - lvIngresso) / 6) * piano * 0.45);
        let calc = Math.round(baseCalc) + randomOffset;
        livelloGenerato = Math.min(lvBoss - 3, calc);
    } else {
        // Erba o default (cespuglio, ecc.)
        let randomOffset = Math.floor(Math.random() * 2) - 1; // -1 o 0
        let baseCalc = lvIngresso + (((lvBoss - lvIngresso) / 6) * piano * 0.15);
        let calc = Math.round(baseCalc) + randomOffset;
        livelloGenerato = Math.min(lvBoss - 5, calc);
    }
    
    // Protezione per evitare livelli negativi o a zero
    livelloGenerato = Math.max(1, livelloGenerato);

    // Calcolo Livello Mossa (invariato)
    let minMossa = 1, maxMossa = 1;
    if (configMappa) {
        let metaMappa = Math.floor(schemaAlbero.length / 2);
        if (piano <= metaMappa) {
            minMossa = configMappa.mossaMin || 1;
            maxMossa = configMappa.mossaMaxRel || 1;
        } else {
            minMossa = configMappa.mossaMaxRel || 1;
            maxMossa = configMappa.mossaMaxMax || 2;
        }
    }
    
    let mossaGenerata = Math.floor(Math.random() * (maxMossa - minMossa + 1)) + minMossa;
    mossaGenerata = Math.max(1, Math.min(3, mossaGenerata));

    return { livello: livelloGenerato, livelloMossa: mossaGenerata };
}

// Helper: genera l'HTML del badge elemento (icona + nome)
function getHtmlElemento(elementoNome, isGrande = false) {
    if (!elementoNome) elementoNome = "fuoco";
    const nomeMinuscolo = elementoNome.toLowerCase();
    const classeIcona = isGrande ? "icona-elemento-grande" : "icona-elemento";
    return `
        <span class="badge-elemento testo-${nomeMinuscolo}">
            <img src="../Sprite/elementi/${nomeMinuscolo}.png" alt="${nomeMinuscolo}" class="${classeIcona}">
            ${nomeMinuscolo}
        </span>
    `;
}

/**
 * Crea un'istanza di Pokémon con tutte le statistiche calcolate dal livello.
 * Usa la formula definita nelle funzioni calcolaStat() e calcolaHP() qui sopra.
 * @param {object} infoBase     - Record dal pokemonDatabase
 * @param {number} livello      - Livello da assegnare al Pokémon
 * @param {number} livelloMossa - Livello della mossa (1, 2 o 3)
 * @returns {object}            - Istanza Pokémon pronta all'uso
 */
function creaPokemon(infoBase, livello, livelloMossa = 1) {
    const molRar    = CONFIG_MOLTIPLICATORE_RARITA[infoBase.raritaTipo.toLowerCase()] || 1.0;
    const elementoPkm = (infoBase.elemento || "fuoco").toLowerCase();
    const statsElem = CONFIG_STAT_ELEMENTO[elementoPkm] || { hp: 1, atk: 1, def: 1, vel: 1 };

    const molEvo = infoBase.moltiplicatoreEvoluzione || 1.0;
    
    // Calcolo statistiche con le formule definite sopra
<<<<<<< HEAD
    const hpMax = calcolaHP(infoBase.hpBase,  livello, statsElem.hp,  molRar);
    const atk   = calcolaStat(infoBase.atkBase, livello, statsElem.atk, molRar);
    const def   = calcolaStat(infoBase.defBase, livello, statsElem.def, molRar);
    const vel   = calcolaStat(infoBase.velBase, livello, statsElem.vel, molRar);
=======
    const hpMax = calcolaHP(infoBase.hpBase,  livello, statsElem.hp,  molRar, molEvo);
    const atk   = calcolaStat(infoBase.atkBase, livello, statsElem.atk, molRar, molEvo);
    const def   = calcolaStat(infoBase.defBase, livello, statsElem.def, molRar, molEvo);
    const atkSpec = calcolaStat(infoBase.atkSpec || infoBase.atkBase, livello, statsElem.atkSpec || statsElem.atk, molRar, molEvo);
    const defSpec = calcolaStat(infoBase.defSpec || infoBase.defBase, livello, statsElem.defSpec || statsElem.def, molRar, molEvo);
    const vel   = calcolaStat(infoBase.velBase, livello, statsElem.vel, molRar, molEvo);
>>>>>>> origin

    const p = {
        nome:         infoBase.nome,
        livello:      livello,
        livelloMossa: livelloMossa,
        // Valori Base (senza item)
        baseHpMax:    hpMax,
        baseAtk:      atk,
        baseDef:      def,
        baseVel:      vel,
        // Valori finali (inizializzati con i base, aggiornati da applicaBonusOggetti)
        hpMax:        hpMax,
        hpAttuali:    hpMax, // Attenzione: applicaBonusOggetti potrebbe aumentare questo proporzionalmente
        atk:          atk,
        def:          def,
        vel:          vel,
        raritaTipo:   infoBase.raritaTipo,
        elemento:     elementoPkm,
        immagine:     infoBase.immagine,
        immagineAtk:  infoBase.immagineAtk,
        mossaLvl1:    infoBase.mossaLvl1,
        mossaLvl2:    infoBase.mossaLvl2,
        mossaLvl3:    infoBase.mossaLvl3,
        numFrameUlt:  infoBase.numFrameUlt || 3,
        mossaULT:     infoBase.mossaULT || infoBase.mossaLvl3 || "Mossa Finale",
        infoBase:     infoBase,
        colore:       CONFIG_RARITA[infoBase.raritaTipo]?.colore || "#ffe066",
        boss:         infoBase.boss || false,
        oggetti:      [],
        perkId:       null,
        perkTier:     0
    };
    
    applicaBonusOggetti(p);
    // Assicura che gli hp attuali siano al massimo (per la factory iniziale)
    p.hpAttuali = p.hpMax;
    
    return p;
}

/**
 * Ricalcola atk, def, vel, hpMax sommando i bonus degli oggetti.
 * Salva i bonus calcolati in p.bonus per l'UI.
 */
function applicaBonusOggetti(p) {
    if (!p) return;
    
    // 1. Ripristina statistiche ai valori base (dal livello)
    p.hpMax = p.baseHpMax;
    p.atk   = p.baseAtk;
    p.def   = p.baseDef;
    p.vel   = p.baseVel;
    
    p.bonus = { hp: 0, atk: 0, def: 0, vel: 0 };
    
    if (!p.oggetti || p.oggetti.length === 0) return;
    
    // Helper per sommare flat/percent
    const addStat = (statName, valType, val) => {
        let baseVal = 0;
        if (statName === "hp") baseVal = p.baseHpMax;
        if (statName === "atk") baseVal = p.baseAtk;
        if (statName === "def") baseVal = p.baseDef;
        if (statName === "vel") baseVal = p.baseVel;
        
        let diff = 0;
        if (valType === "percent") {
            diff = Math.round(baseVal * val);
        } else {
            diff = val;
        }
        
        if (statName === "hp") p.bonus.hp += diff;
        if (statName === "atk") p.bonus.atk += diff;
        if (statName === "def") p.bonus.def += diff;
        if (statName === "vel") p.bonus.vel += diff;
    };
    
    // 2. Calcola i bonus dagli oggetti
    p.oggetti.forEach(item => {
        // Cerca l'item completo nel DB (se l'array oggetti contiene solo l'ID o l'oggetto intero)
        // Se contiene l'oggetto intero:
        let obj = item;
        if (typeof item === 'string') {
            obj = (typeof DB_OGGETTI !== 'undefined') ? DB_OGGETTI.find(o => o.id === item) : null;
        }
        
        if (obj) {
            // Stat primaria
            if (obj.stat && obj.stat !== "tutto") {
                addStat(obj.stat, obj.valoreType, obj.valore);
            }
            // Multi-stat (tutte)
            if (obj.stat === "tutto") {
                addStat("hp", obj.valoreType, obj.valore);
                addStat("atk", obj.valoreType, obj.valore);
                addStat("def", obj.valoreType, obj.valore);
                addStat("vel", obj.valoreType, obj.valore);
            }
            // Stat bonus extra
            if (obj.bonusStatistica) {
                addStat(obj.bonusStatistica, obj.bonusValoreType, obj.bonusValore);
            }
            // Malus (oggetti maledetti)
            if (obj.malusStatistica) {
                addStat(obj.malusStatistica, obj.malusValoreType, obj.malusValore); // malusValore è già negativo nel DB
            }
        }
    });
    
    // 3. Applica i bonus alle statistiche finali
    p.hpMax += p.bonus.hp;
    p.atk   += p.bonus.atk;
    p.def   += p.bonus.def;
    p.vel   += p.bonus.vel;
    
    // Evita valori negativi o nulli per errore
    if (p.hpMax < 1) p.hpMax = 1;
    if (p.atk < 0) p.atk = 0;
    if (p.def < 0) p.def = 0;
    if (p.vel < 0) p.vel = 0;
    
    // Assicurati che gli HP attuali non superino il nuovo max
    if (p.hpAttuali > p.hpMax) {
        p.hpAttuali = p.hpMax;
    }
}

/**
 * Ricalcola e aggiorna le statistiche di un Pokémon esistente dopo N level-up.
 * Ricalcola dall'inizio con la nuova formula (non accumula), quindi è immune
 * a errori di arrotondamento multipli.
 * @param {object} p            - L'istanza Pokémon da aggiornare (modificata in-place)
 * @param {number} nuoviLivelli - Quanti livelli aggiungere
 */

// ============================================================
// CONFIG — Comportamento HP al level-up
// Cambia questi valori per modificare come funziona il level-up.
// ============================================================
const CONFIG_LEVEL_UP_CURA = {
    // Se true, i PG vengono curati proporzionalmente al guadagno HP (comportamento originale).
    // Se false, gli HP attuali NON vengono toccati dal level-up.
    curaAlLevelUp: false,

    // Se true, un PG con 0 HP viene revivato (con 1 HP) al level-up.
    // Se false, i PG KO restano KO anche dopo il level-up.
    revivaKO: false,
};

function aggiornaStatsLivello(p, nuoviLivelli) {
    let nuovoLivello = p.livello + nuoviLivelli;

    // Applica il Level Cap Globale (100)
    const MAX_LEVEL = typeof CONFIG_PERK_LEVEL_CAP !== "undefined" ? CONFIG_PERK_LEVEL_CAP.tier2 : 100;
    if (nuovoLivello > MAX_LEVEL) {
        nuovoLivello = MAX_LEVEL;
    }

    const molRar    = CONFIG_MOLTIPLICATORE_RARITA[p.infoBase.raritaTipo.toLowerCase()] || 1.0;
    const elementoPkm = (p.elemento || "fuoco").toLowerCase();
    const statsElem = CONFIG_STAT_ELEMENTO[elementoPkm] || { hp: 1, atk: 1, def: 1, vel: 1 };

    // Calcola i nuovi valori ricalcolando da zero (formula diretta, niente loop)
    const nuovoHpMax = calcolaHP(p.infoBase.hpBase,  nuovoLivello, statsElem.hp,  molRar);
    const nuovoAtk   = calcolaStat(p.infoBase.atkBase, nuovoLivello, statsElem.atk, molRar);
    const nuovoDef   = calcolaStat(p.infoBase.defBase, nuovoLivello, statsElem.def, molRar);
    const nuovaVel   = calcolaStat(p.infoBase.velBase, nuovoLivello, statsElem.vel, molRar);

    // -------------------------------------------------------------------
    // Gestione HP attuali al level-up.
    // Il comportamento dipende da CONFIG_LEVEL_UP_CURA (vedi sopra).
    // -------------------------------------------------------------------
    if (p.hpAttuali <= 0) {
        // PG attualmente KO
        if (CONFIG_LEVEL_UP_CURA.revivaKO) {
            // Reviva con 1 HP (comportamento opzionale)
            p.hpAttuali = 1;
        }
        // else: resta KO (hpAttuali rimane 0 o negativo)
    } else if (CONFIG_LEVEL_UP_CURA.curaAlLevelUp) {
        // PG vivo: applica il guadagno HP proporzionalmente
        const guadagnoHp = nuovoHpMax - p.hpMax;
        p.hpAttuali = Math.min(nuovoHpMax, p.hpAttuali + guadagnoHp);
    }
    // else: hpAttuali rimane invariato (nessuna cura, nessun reviva)

    // Aggiorna tutte le stat base
    p.livello = nuovoLivello;
    p.baseHpMax   = nuovoHpMax;
    p.baseAtk     = nuovoAtk;
    p.baseDef     = nuovoDef;
    p.baseVel     = nuovaVel;
    
    // Riapplica i bonus oggetti per calcolare le finali
    applicaBonusOggetti(p);
}

/**
 * [DevTool] Forza il livello di un Pokémon ricalcolando tutte le statistiche da zero.
 * Funziona anche se il livello era già stato modificato manualmente.
 * Uso in console: forzaLivello(miaSquadra[0], 44)
 */
function forzaLivello(p, nuovoLivello) {
    if (!p || !p.infoBase) { console.error("[forzaLivello] Pokémon non valido"); return; }
    
    // Applica il Level Cap Globale (100)
    const MAX_LEVEL = typeof CONFIG_PERK_LEVEL_CAP !== "undefined" ? CONFIG_PERK_LEVEL_CAP.tier2 : 100;
    if (nuovoLivello > MAX_LEVEL) {
        console.warn(`[DevTool] Livello ${nuovoLivello} oltre il cap. Forzato a ${MAX_LEVEL}.`);
        nuovoLivello = MAX_LEVEL;
    }

    const molRar    = CONFIG_MOLTIPLICATORE_RARITA[p.infoBase.raritaTipo.toLowerCase()] || 1.0;
    const elementoPkm = (p.elemento || "fuoco").toLowerCase();
    const statsElem = CONFIG_STAT_ELEMENTO[elementoPkm] || { hp: 1, atk: 1, def: 1, vel: 1 };
    
    const molEvo = p.infoBase.moltiplicatoreEvoluzione || 1.0;

    // Ricalcola SEMPRE da zero, ignorando il livello corrente
    p.livello    = nuovoLivello;
<<<<<<< HEAD
    p.baseHpMax  = calcolaHP   (p.infoBase.hpBase,  nuovoLivello, statsElem.hp,  molRar);
    p.baseAtk    = calcolaStat (p.infoBase.atkBase, nuovoLivello, statsElem.atk, molRar);
    p.baseDef    = calcolaStat (p.infoBase.defBase, nuovoLivello, statsElem.def, molRar);
    p.baseVel    = calcolaStat (p.infoBase.velBase, nuovoLivello, statsElem.vel, molRar);
=======
    p.baseHpMax  = calcolaHP   (p.infoBase.hpBase,  nuovoLivello, statsElem.hp,  molRar, molEvo);
    p.baseAtk    = calcolaStat (p.infoBase.atkBase, nuovoLivello, statsElem.atk, molRar, molEvo);
    p.baseDef    = calcolaStat (p.infoBase.defBase, nuovoLivello, statsElem.def, molRar, molEvo);
    p.baseAtkSpec = calcolaStat(p.infoBase.atkSpec || p.infoBase.atkBase, nuovoLivello, statsElem.atkSpec || statsElem.atk, molRar, molEvo);
    p.baseDefSpec = calcolaStat(p.infoBase.defSpec || p.infoBase.defBase, nuovoLivello, statsElem.defSpec || statsElem.def, molRar, molEvo);
    p.baseVel    = calcolaStat (p.infoBase.velBase, nuovoLivello, statsElem.vel, molRar, molEvo);
>>>>>>> origin
    
    applicaBonusOggetti(p);
    p.hpAttuali  = p.hpMax;
    console.log(`[DevTool] ${p.nome} → Lv.${p.livello} | HP:${p.hpMax} ATK:${p.atk} DEF:${p.def} VEL:${p.vel}`);
}

// Restituisce il nome della mossa attiva in base al livello mossa corrente
function getNomeMossaAttuale(p) {
    if (p.livelloMossa === 3) return p.mossaLvl3;
    if (p.livelloMossa === 2) return p.mossaLvl2;
    return p.mossaLvl1;
}

// ----------------------------------------------------------
// PERK: Statistica dominante e schivata
// ----------------------------------------------------------

/**
 * Calcola quale statistica è la più alta in gioco per un Pokémon.
 * Confronta i valori reali (hpMax, atk, def, vel).
 * Restituisce la chiave della categoria perk corrispondente:
 * "vita" | "attacco" | "difesa" | "velocita"
 *
 * @param {object} p - Istanza Pokémon
 * @returns {string}
 */
function calcolaStatDominante(p) {
    // 1. Recupero i moltiplicatori di base necessari
    const molRar = CONFIG_MOLTIPLICATORE_RARITA[p.infoBase.raritaTipo.toLowerCase()] || 1.0;
    const elementoPkm = (p.elemento || "fuoco").toLowerCase();
    const statsElem = CONFIG_STAT_ELEMENTO[elementoPkm] || { hp: 1, atk: 1, def: 1, vel: 1 };
    
    // 2. Recupero il moltiplicatore evoluzione (default a 1 se non gestito)
    const molEvo = p.moltiplicatoreEvoluzione || 1.0;

    /**
     * Helper interno che applica la tua formula esatta per una singola statistica.
     */
    function applicaFormulaAvanzata(statBase, molElem) {
        const statBaseLivello = statBase +
            (((p.livello * molElem * molRar) / 0.75) * molEvo);

        const statArrotondata = Math.round(statBaseLivello);

        let bonusItemFlat = 0;
        let bonusItemPerc = 0;

        const bonusTotale =
            bonusItemFlat +
            Math.ceil(statArrotondata * bonusItemPerc);

        return statArrotondata + bonusTotale;
    }

    // 3. Calcolo di tutte le statistiche in tempo reale con la nuova formula
    const statsCalcolate = {
        vita:     applicaFormulaAvanzata(p.infoBase.hpBase, statsElem.hp),
        attacco:  applicaFormulaAvanzata(p.infoBase.atkBase, statsElem.atk),
        difesa:   applicaFormulaAvanzata(p.infoBase.defBase, statsElem.def),
        velocita: applicaFormulaAvanzata(p.infoBase.velBase, statsElem.vel),
    };

    // 4. Trova e restituisce la chiave con il valore massimo calcolato
    return Object.entries(statsCalcolate).reduce((max, [key, val]) =>
        val > max.val ? { key, val } : max,
        { key: "vita", val: -Infinity }
    ).key;
}

/**
 * Calcola la percentuale di schivata base di un Pokémon
 * in base alla sua velocità e al suo elemento.
 * Se ha il Perk "schivata_aumentata" applica il moltiplicatore Tier 1.
 * Se ha il Perk "schivata_aumentata_2" applica anche il moltiplicatore Tier 2.
 *
 * Formula base: Math.floor( (Vel * moltiplicatoreElemento) / (Vel + 60) )
 * I moltiplicatori per elemento sono in CONFIG_SCHIVATA_ELEMENTO (perks.js).
 *
 * @param {object} p - Istanza Pokémon
 * @returns {number} - Percentuale schivata (intero, es. 23 = 23%)
 */
function calcolaSchivata(p) {
    const elemento = (p.elemento || "fuoco").toLowerCase();
    const mult = CONFIG_SCHIVATA_ELEMENTO[elemento] || 30;
    const vel  = p.vel || 0;

    // Formula base: arrotondamento al difetto (Math.floor)
    let schivata = Math.floor((vel * mult) / (vel + 60));

    // Perk Tier 1: SCHIVATA AUMENTATA (×1.35)
    if (p.perkId === "schivata_aumentata" || p.perkId === "schivata_aumentata_2") {
        schivata = Math.floor(schivata * CONFIG_PERK.schivataAumentataMultTier1);
    }
    // Perk Tier 2: SCHIVATA AUMENTATA+ (ulteriore ×1.45 sul valore già aumentato)
    if (p.perkId === "schivata_aumentata_2") {
        schivata = Math.floor(schivata * CONFIG_PERK.schivataAumentataMultTier2);
    }

    return schivata;
}

// Pesca un Pokémon casuale dal database rispettando rarità e range della mappa corrente
function pescaPokemonCasuale(esclusioniNomi = [], elementoFiltro = null) {
    // Pesi base per rarità (più è raro, meno probabile è)
    const pesi = { "comune": 22, "non comune": 18, "raro": 16, "epico": 14, "leggendario": 12, "special": 10, "bombers": 8 };

    let poolDisponibili = pokemonDatabase.filter(p => !p.boss && !p.isEvoluzione && !esclusioniNomi.includes(p.nome));

    // Applica il filtro per elemento se specificato
    if (elementoFiltro) {
        let poolElemento = poolDisponibili.filter(p => p.elemento && p.elemento.toLowerCase() === elementoFiltro.toLowerCase());
        if (poolElemento.length > 0) {
            poolDisponibili = poolElemento;
        } else {
            // Paracadute: cerca in tutto il DB ignorando le esclusioni
            poolElemento = pokemonDatabase.filter(p => p.elemento && p.elemento.toLowerCase() === elementoFiltro.toLowerCase());
            if (poolElemento.length > 0) poolDisponibili = poolElemento;
        }
    }

    // Applica il filtro rarità della mappa corrente
    if (mappaAttuale && ARCHIVIO_MAPPE[mappaAttuale]) {
        const mappaConfig = ARCHIVIO_MAPPE[mappaAttuale];
        if (mappaConfig.RaritaMin && mappaConfig.RaritaMax) {
            const minVal = SCALA_RARITA_MAPPA[mappaConfig.RaritaMin.toLowerCase()] || 1;
            const maxVal = SCALA_RARITA_MAPPA[mappaConfig.RaritaMax.toLowerCase()] || 7;
            const poolFiltrato = poolDisponibili.filter(p => {
                const pVal = SCALA_RARITA_MAPPA[p.raritaTipo.toLowerCase()] || 1;
                return pVal >= minVal && pVal <= maxVal;
            });
            // Usa il pool filtrato solo se non è vuoto
            if (poolFiltrato.length > 0) poolDisponibili = poolFiltrato;
        }
    }

    // Paracadute: se il pool è ancora vuoto, usa tutti i non-boss
    if (poolDisponibili.length === 0) {
        poolDisponibili = pokemonDatabase.filter(p => !p.boss && !p.isEvoluzione);
    }

    // Selezione pesata: estrae un elemento rispettando i pesi di rarità
    let pesoTotale = 0;
    poolDisponibili.forEach(p => pesoTotale += pesi[p.raritaTipo] || 1);
    let random = Math.random() * pesoTotale;
    let parziale = 0;

    for (const p of poolDisponibili) {
        parziale += pesi[p.raritaTipo] || 1;
        if (random <= parziale) return p;
    }

    return poolDisponibili[0];
}

// Genera HTML compatto di una card Pokémon (usata in vari punti della UI)
function generaHtmlCard(pokemon) {
    return `
        <div class="card-pokemon" style="background-color: ${pokemon.colore}; border: 2px solid #333; padding: 10px; border-radius: 8px;">
            <h3>${pokemon.nome}</h3>
            <p>LVL: ${pokemon.livello}</p>
            <p>HP: ${pokemon.hpAttuali}/${pokemon.hpMax}</p>
            <p>ATK: ${pokemon.atk}</p>
            <p>DEF: ${pokemon.def}</p>
            <p>VEL: ${pokemon.vel}</p>
            <p style="font-size: 0.8em; font-weight: bold; text-transform: uppercase;">${pokemon.raritaTipo}</p>
        </div>
    `;
}

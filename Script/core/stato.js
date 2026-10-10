// ==========================================================
// stato.js \u2014 Stato globale del gioco (variabili mutabili)
// NOTA: caricare DOPO i file data/, PRIMA di tutto il resto.
// ==========================================================

// ==========================================================
// VARIABILI MODALITA' SANDBOX
// ==========================================================
let isSandboxAttiva = false;
let sandboxConfig = {
    mioPokemon: null,
    nemicoPokemon: null
};

// ==========================================================
// VARIABILI MODALITA' RUN VELOCE (AUTO-BATTLE)
// ==========================================================
let isRunVeloce = false;

// ----------------------------------------------------------
// CONFIGURAZIONE SLOT ITEM PER POK\u00c9MON
// Cambia questo numero per variare gli slot item equipaggiabili
// disponibili su ogni singolo Pok\u00e9mon della squadra.
// ----------------------------------------------------------
const CONFIG_SLOT_ITEM_PER_POKEMON = 1;

// ----------------------------------------------------------
// CONFIGURAZIONE GUADAGNO MONETE POST-INCONTRO
// Modifica questi range/valori per cambiare le monete guadagnate.
// I valori "min"/"max" generano un numero casuale nel range [min, max].
// ----------------------------------------------------------
const CONFIG_MONETE_GUADAGNO = {
    cespuglio: { min: 1, max: 3  },  // Erba alta: 1\u{20133} monete
    npc:       { min: 3, max: 6  },  // Allenatore: 3\u{20136} monete
    boss:      { fisso: 15        }  // Boss: sempre 15 monete
};

// --- Squadra e combattimento ---
let miaSquadra = [];
let mioPokemon;           // Il Pok\u00e9mon attualmente in campo (giocatore)
let indiceMioPokemonAttuale = 0;
let nemiciIncontro = [];  // Nemici ancora in coda nello scontro corrente
let nemicoPokemon;        // Il Pok\u00e9mon nemico attualmente in campo
let isBossFight = false;
let haUsatoUltGiocatore = false;
let haUsatoUltNemico    = false;
let chiAttaccaPerPrimo  = "giocatore";

// Tipo dell'evento in corso \u2014 usato da gestisciVittoriaIncontro per level-up e monete
let tipoEventoAttuale = "cespuglio";

// --- Economia ---
// Monete totali del giocatore
let monete = 0;

// Zaino: array di { dbId: string, quantita: number }
// Un entry per tipo di oggetto; quantita = quante copie possiede il giocatore.
// Per futuri oggetti equipaggiabili si estender\u00e0 con { dbId, quantita, equipaggiatoDa }
let zaino = [];

// --- Item in battaglia ---
// Quante volte ogni item \u00e8 stato usato nello scontro corrente.
// Struttura: { [dbId]: N } \u2014 confrontato con limiteUtilizziPerFight del DB_OGGETTI.
// Viene azzerato da resettaItemFight() all'inizio di ogni nuovo scontro.
let itemUsatiInFight = {};

// true = il giocatore ha gi\u00e0 usato un item in questo turno (limite: 1 per turno).
// Viene resettato a false ogni volta che ritorna il turno del giocatore.
let itemUsatiQuestoTurno = false;

// ==========================================================
// EFFETTI DI STATO TEMPORANEI ATTIVI IN BATTAGLIA
// Ogni slot ha la forma: { durata: N, valore: X }
// La durata \u00e8 decrementata ogni turno; a 0 l'effetto scade.
// ==========================================================
let effettiAttivi = {
    nemico: {
        bruciatura: null,       // FUOCO
        bagnato: null,          // ACQUA: { stack: 0, turniSenzaBagnato: 0 }
        livido: null,           // LOTTA: { stack: 0 }
        shock: null,            // ELETTRO: { durata: X }
        ipnotizzato: null,      // PSICO: { durata: X }
        congelato: null,        // GHIACCIO: { durata: X }
        ombra: null,            // BUIO: { durata: X, stack: 0 }
        benedizione: null,      // LUCE: { durata: X }
        ammaliato: null,        // FOLLETTO: { durata: X }
        veleno: null            // VELENO: { durata: X }
    },
    giocatore: {
        bruciatura: null,       
        bagnato: null,          
        livido: null,           
        shock: null,            
        ipnotizzato: null,      
        congelato: null,        
        ombra: null,            
        benedizione: null,      
        ammaliato: null,        
        veleno: null,           
        
        volo: null,             // VENTO: { durata: 1 } (giocatore invulnerabile al prox turno)
        scudoSabbia: null,      // TERRA: { attiva: true }
        atkBoost: null          // Mantenuto per compatibilità
    }
};

// --- Mappa procedurale ---
let schemaAlbero = [1, 3, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 3, 1]; // Nodi per piano
let alberoMappa = [];
let pianoAttuale = 0;
let nodoSceltoAttuale = 0;
let mappaEventi = {};
let mappaAttuale = "mappa1";
let maxLvlTeamInizioMappa = 1;
let variazioneSeedMappa = 0;
let tentativiSenzaLeggendari = 0;

// --- UI / Impostazioni ---
let isSkipAttivo         = false;
let isAutoskipAbilitato  = false;
let volumePrecedente     = 0.25;
let indicePokemonInDettaglio = null;

// --- Stato scambio ---
let indicePokemonDaScambiare = null;
let pokemonPropostoScambio   = null;
let pokemonOffertoPerScambio = null;

// ----------------------------------------------------------
// FUNZIONI DI RESET STATE
// ----------------------------------------------------------

// Resetta tutti gli effetti di stato attivi (inizio di ogni incontro)
function resettaEffettiAttivi() {
    effettiAttivi = {
        nemico: {
            bruciatura: null,
            bagnato: null,
            livido: null,
            shock: null,
            ipnotizzato: null,
            congelato: null,
            ombra: null,
            benedizione: null,
            ammaliato: null,
            veleno: null
        },
        giocatore: {
            bruciatura: null,
            bagnato: null,
            livido: null,
            shock: null,
            ipnotizzato: null,
            congelato: null,
            ombra: null,
            benedizione: null,
            ammaliato: null,
            veleno: null,
            volo: null,
            scudoSabbia: null,
            atkBoost: null
        }
    };
}

// Azzera gli effetti su un singolo target (es. quando cambia Pok\u00e9mon)
function resettaEffettiSuTarget(target) {
    if (target === "nemico") {
        effettiAttivi.nemico = {
            bruciatura: null,
            bagnato: null,
            livido: null,
            shock: null,
            ipnotizzato: null,
            congelato: null,
            ombra: null,
            benedizione: null,
            ammaliato: null,
            veleno: null
        };
    } else {
        effettiAttivi.giocatore = {
            bruciatura: null,
            bagnato: null,
            livido: null,
            shock: null,
            ipnotizzato: null,
            congelato: null,
            ombra: null,
            benedizione: null,
            ammaliato: null,
            veleno: null,
            volo: null,
            scudoSabbia: null,
            atkBoost: null
        };
    }
}

// Azzera il tracking degli item usati per fight (chiamare a inizio scontro)
function resettaItemFight() {
    ItemSystem.beginFight();
    itemUsatiInFight    = {};
    itemUsatiQuestoTurno = false;
}

// ----------------------------------------------------------
// Resetta il flag "item gi\u00e0 usato questo turno" \u2014 chiamare quando torna il turno giocatore
function resettaItemTurno() {
    itemUsatiQuestoTurno = false;
}



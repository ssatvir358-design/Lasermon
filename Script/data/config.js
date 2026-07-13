// ==========================================================
// config.js — Costanti di bilanciamento del gioco
// Estratto da script.js (righe 65-112 + 214-222)
// ==========================================================

const CONFIG_STARTER = ["Fabio", "Gian", "Arman"];

// Moltiplicatore globale per rarità: più raro = cresce più in fretta per livello
const CONFIG_MOLTIPLICATORE_RARITA = {
    "comune": 1.00,
    "non comune": 1.12,
    "raro": 1.30,
    "epico": 1.55,
    "leggendario": 1.80,
    "bombers": 2.10,
    "special": 2.30
};

// Scaling delle statistiche base in funzione dell'elemento
const CONFIG_STAT_ELEMENTO = {
    "fuoco":  { hp: 1, atk: 1.05, def: 0.98, atkSpec: 1.05, defSpec: 0.98, vel: 1 },
    "erba":  { hp: 1.04, atk: 1, def: 1, atkSpec: 1, defSpec: 1.04, vel: 0.98 },
    "acqua":  { hp: 1, atk: 0.98, def: 1.05, atkSpec: 0.98, defSpec: 1.05, vel: 1 },
    "ghiaccio":  { hp: 1, atk: 0.95, def: 0.95, atkSpec: 1.06, defSpec: 1.04, vel: 1 },
    "volante":  { hp: 0.95, atk: 1.05, def: 0.98, atkSpec: 0.95, defSpec: 0.95, vel: 1.12 },
    "veleno":  { hp: 1.04, atk: 0.96, def: 1, atkSpec: 1.02, defSpec: 1.02, vel: 0.96 },
    "elettro":  { hp: 0.95, atk: 0.95, def: 0.94, atkSpec: 1.1, defSpec: 1, vel: 1.06 },
    "terra":  { hp: 1.06, atk: 1.04, def: 1.12, atkSpec: 0.85, defSpec: 0.95, vel: 0.98 },
    "lotta":  { hp: 1.04, atk: 1.12, def: 1, atkSpec: 0.85, defSpec: 0.95, vel: 1.04 },
    "normale":  { hp: 1, atk: 1, def: 1, atkSpec: 1, defSpec: 1, vel: 1 },
    "luce":  { hp: 1, atk: 1.1, def: 1, atkSpec: 1.1, defSpec: 1, vel: 1 },
    "buio":  { hp: 1, atk: 1.1, def: 1, atkSpec: 1.1, defSpec: 1, vel: 1 }
};

// Moltiplicatori di danno (Attaccante >> Difensore)
const CONFIG_DEBOLEZZE = {
    "fuoco": { "erba": 1.5, "acqua": 0.5, "terra": 0.5, "ghiaccio": 1.5, "luce": 0.75 },
    "erba": { "fuoco": 0.5, "acqua": 1.5, "volante": 0.5, "terra": 1.5, "ghiaccio": 0.5, "luce": 0.75 },
    "acqua": { "fuoco": 1.5, "erba": 0.5, "terra": 1.5, "elettro": 0.5, "luce": 0.75 },
    "volante": { "erba": 1.5, "ghiaccio": 0.5, "elettro": 0.5, "lotta": 1.5, "luce": 0.75 },
    "terra": { "fuoco": 1.5, "erba": 0.5, "acqua": 0.5, "volante": 0.25, "elettro": 1.5, "luce": 0.75 },
    "ghiaccio": { "fuoco": 0.5, "erba": 1.5, "volante": 1.5, "lotta": 0.5, "luce": 0.75 },
    "elettro": { "erba": 0.5, "acqua": 1.5, "volante": 1.5, "terra": 0.5, "ghiaccio": 0.25, "luce": 0.75 },
    "veleno": { "erba": 1.5, "terra": 0.5, "ghiaccio": 0.25, "lotta": 1.5, "luce": 0.75 },
    "lotta": { "volante": 0.5, "ghiaccio": 1.5, "veleno": 0.5, "normale": 1.5, "luce": 0.75 },
    "normale": { "lotta": 0.5 },
    "luce": { "buio": 1.5 },
    "buio": { "luce": 1.5 }
};

// Probabilità di spawn e colore badge per ogni rarità
const CONFIG_RARITA = {
    "comune": { chance: 0.22, colore: "#9e9e9e" },
    "non comune": { chance: 0.18, colore: "#4caf50" },
    "raro": { chance: 0.16, colore: "#00bcd4" },
    "epico": { chance: 0.14, colore: "#9c27b0" },
    "leggendario": { chance: 0.12, colore: "#ffeb3b" },
    "special": { chance: 0.10, colore: "#ff9800" },
    "bombers": {chance: 0.08, colore: "#ff0000"}
};

// Moltiplicatori danno per livello mossa (1 = normale, 2 = potenziato, 3 = massimo)
const CONFIG_MOSSE = {
    1: 1.0,  
    2: 1.25,
    3: 1.25 //Invece dell'aumento, un effetto speciale della mossa in base al tipo del pg
};

// Dizionario di conversione rarità → numero (per confronti matematici nei filtri mappa)
const SCALA_RARITA_MAPPA = {
    "comune": 1,
    "non comune": 2,
    "raro": 3,
    "epico": 4,
    "leggendario": 5,
    "special": 6,
    "bombers": 7
};

// ==========================================================
// Livelli Generazione Mappe
// ==========================================================
const CONFIG_LIVELLI_MAPPE = {
    1: { ingresso: 1,  boss: 10 },
    2: { ingresso: 10, boss: 21 },
    3: { ingresso: 21, boss: 32 },
    4: { ingresso: 32, boss: 43 },
    5: { ingresso: 43, boss: 54 },
    6: { ingresso: 54, boss: 65 },
    7: { ingresso: 65, boss: 76 },
    8: { ingresso: 76, boss: 87 },
    9: { ingresso: 87, boss: 100 },
    10: { ingresso: 100, boss: 100 }
};

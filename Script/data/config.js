// ==========================================================
// config.js \u2014 Costanti di bilanciamento del gioco
// Estratto da script.js (righe 65-112 + 214-222)
// ==========================================================

const CONFIG_STARTER = ["Fabio", "Gian", "Arman"];

// Moltiplicatore globale per rarit\u00e0: pi\u00f9 raro = cresce pi\u00f9 in fretta per livello
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
    "normale":  { hp: 1.00, atk: 1.00, def: 1.00, atkSpec: 1.00, defSpec: 1.00, vel: 1.00 },
    "fuoco":    { hp: 1.00, atk: 1.06, def: 0.98, atkSpec: 1.06, defSpec: 0.98, vel: 0.92 },
    "acqua":    { hp: 1.00, atk: 0.98, def: 1.06, atkSpec: 0.98, defSpec: 1.06, vel: 0.92 },
    "erba":     { hp: 1.04, atk: 0.96, def: 1.04, atkSpec: 0.96, defSpec: 1.04, vel: 0.96 },
    "elettro":  { hp: 0.94, atk: 0.95, def: 0.94, atkSpec: 1.12, defSpec: 0.95, vel: 1.10 },
    "ghiaccio": { hp: 1.02, atk: 0.95, def: 1.04, atkSpec: 1.04, defSpec: 1.03, vel: 0.92 },
    "lotta":    { hp: 1.04, atk: 1.10, def: 0.94, atkSpec: 0.98, defSpec: 0.84, vel: 1.10 },
    "veleno":   { hp: 1.06, atk: 1.04, def: 1.14, atkSpec: 0.86, defSpec: 0.92, vel: 0.98 },
    "terra":    { hp: 0.95, atk: 1.05, def: 0.98, atkSpec: 0.95, defSpec: 1.02, vel: 1.05 },
    "vento":    { hp: 1.00, atk: 1.14, def: 0.90, atkSpec: 0.86, defSpec: 0.92, vel: 1.18 },
    "psico":    { hp: 0.95, atk: 0.92, def: 0.92, atkSpec: 1.14, defSpec: 1.06, vel: 1.01 },
    "drago":    { hp: 1.05, atk: 1.10, def: 1.04, atkSpec: 0.91, defSpec: 0.91, vel: 0.99 },
    "folletto": { hp: 1.04, atk: 0.88, def: 0.92, atkSpec: 1.02, defSpec: 1.14, vel: 1.00 },
    "luce":     { hp: 1.05, atk: 1.15, def: 1.15, atkSpec: 0.85, defSpec: 0.85, vel: 0.95 },
    "buio":     { hp: 0.95, atk: 0.85, def: 0.85, atkSpec: 1.15, defSpec: 1.15, vel: 1.05 }
};

// Moltiplicatori di danno (Attaccante >> Difensore)
const CONFIG_DEBOLEZZE = {
    "normale": { "luce": 0.75 },
    "fuoco": { "acqua": 0.5, "erba": 1.5, "ghiaccio": 1.5, "lotta": 0.5, "veleno": 1.5, "terra": 0.5, "luce": 0.75 },
    "acqua": { "fuoco": 1.5, "erba": 0.5, "ghiaccio": 1.5, "veleno": 0.5, "terra": 1.5, "vento": 0, "luce": 0.75 },
    "erba": { "fuoco": 0.5, "acqua": 1.5, "lotta": 1.5, "terra": 0.5, "vento": 1.5, "psico": 0, "folletto": 0.5, "luce": 0.75 },
    "elettro": { "ghiaccio": 0.5, "lotta": 1.5, "terra": 0, "vento": 1.5, "psico": 1.5, "drago": 0.5, "luce": 0.75 },
    "ghiaccio": { "fuoco": 0.5, "acqua": 0.5, "elettro": 1.5, "vento": 1.5, "psico": 1.5, "drago": 0.5, "folletto": 0, "luce": 0.75 },
    "lotta": { "normale": 1.5, "fuoco": 1.5, "erba": 0.5, "elettro": 0.5, "veleno": 0.5, "psico": 1.5, "luce": 0.75 },
    "veleno": { "fuoco": 0.5, "acqua": 1.5, "lotta": 1.5, "terra": 0.5, "drago": 0, "folletto": 1.5, "luce": 0.75 },
    "terra": { "fuoco": 1.5, "acqua": 0.5, "erba": 1.5, "elettro": 1.5, "veleno": 1.5, "vento": 0, "folletto": 0.5, "luce": 0.75 },
    "vento": { "acqua": 1.5, "erba": 0.5, "elettro": 1.5, "ghiaccio": 0.5, "terra": 0, "psico": 0.5, "drago": 1.5, "luce": 0.75 },
    "psico": { "elettro": 0.5, "ghiaccio": 0.5, "lotta": 0, "vento": 1.5, "drago": 1.5, "folletto": 1.5, "luce": 0.75 },
    "drago": { "elettro": 1.5, "ghiaccio": 1.5, "veleno": 1.5, "vento": 0.5, "psico": 0.5, "folletto": 0.5, "luce": 0.75 },
    "folletto": { "erba": 1.5, "veleno": 0.5, "terra": 1.5, "psico": 0.5, "drago": 1.5, "luce": 0.75 },
    "luce": { "buio": 2 },
    "buio": { 
        "normale": 1.25, "fuoco": 1.25, "acqua": 1.25, "erba": 1.25, "elettro": 1.25, "ghiaccio": 1.25,
        "lotta": 1.25, "veleno": 1.25, "terra": 1.25, "vento": 1.25, "psico": 1.25, "drago": 1.25, "folletto": 1.25,
        "luce": 2
    }
};

// Probabilit\u00e0 di spawn e colore badge per ogni rarit\u00e0
const CONFIG_RARITA = {
    "comune": { chance: 0.22, colore: "#9e9e9e" },
    "non comune": { chance: 0.18, colore: "#4caf50" },
    "raro": { chance: 0.16, colore: "#00bcd4" },
    "epico": { chance: 0.14, colore: "#9c27b0" },
    "leggendario": { chance: 0.12, colore: "#ffeb3b" },
    "bombers": { chance: 0.10, colore: "#ff0000" },
    "special": { chance: 0.08, colore: "#ff9800" }
};

// Moltiplicatori danno per livello mossa (1 = normale, 2 = potenziato, 3 = massimo)
const CONFIG_MOSSE = {
    1: 1.0,  
    2: 1.25,
    3: 1.25 //Invece dell'aumento, un effetto speciale della mossa in base al tipo del pg
};

// Dizionario di conversione rarit\u00e0 \u2192 numero (per confronti matematici nei filtri mappa)
const SCALA_RARITA_MAPPA = {
    "comune": 1,
    "non comune": 2,
    "raro": 3,
    "epico": 4,
    "leggendario": 5,
    "bombers": 6,
    "special": 7
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

// ==========================================================
// config.js — Costanti di bilanciamento del gioco
// Estratto da script.js (righe 65-112 + 214-222)
// ==========================================================

// Moltiplicatore globale per rarità: più raro = cresce più in fretta per livello
const CONFIG_MOLTIPLICATORE_RARITA = {
    "comune": 1.00,
    "non comune": 1.12,
    "raro": 1.3,
    "epico": 1.55,
    "leggendario": 1.8,
    "bombers": 2.1,      
    "special": 2.3    
};

// Scaling delle statistiche base in funzione dell'elemento
const CONFIG_STAT_ELEMENTO = {
    "fuoco": { hp: 1.00,  atk: 1.05,  def: 0.98,  vel: 1.00 },
    "erba":  { hp: 1.04,  atk: 1.00,  def: 1.00,  vel: 0.98 },
    "acqua": { hp: 1.00,  atk: 0.98,  def: 1.05,  vel: 1.00 },
    "luce":  { hp: 1.05,  atk: 0.95,  def: 1.05,  vel: 1.00 },
    "buio":  { hp: 0.95,  atk: 1.04,  def: 0.94,  vel: 1.05 }
};

// Moltiplicatori di danno (Attaccante >> Difensore)
// Se uno scontro non è in questa lista (es. Fuoco vs Fuoco), il moltiplicatore è 1.0 (Normale)
const CONFIG_DEBOLEZZE = {
    "fuoco": { "erba": 1.5, "acqua": 0.5, "buio": 1.25, "luce": 0.5 },
    "erba":  { "acqua": 1.5, "fuoco": 0.5, "buio": 1.25, "luce": 0.5 },
    "acqua": { "fuoco": 1.5, "erba": 0.5, "buio": 1.25, "luce": 0.5 },
    "buio":  { "luce": 1.5, "fuoco": 1.5, "erba": 1.5, "acqua": 1.5 },
    "luce":  { "buio": 1.5, "fuoco": 0.75, "erba": 0.75, "acqua": 0.75 }
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

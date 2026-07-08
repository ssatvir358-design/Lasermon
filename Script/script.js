const pokemonDatabase = [
  { nome: "Fabio", hpBase: 4, atkBase: 3, defBase: 3, velBase: 2, raritaTipo: "comune", elemento: "erba", immagine: "Fabio.jpeg", immagineAtk: "Fabio_atk.jpeg", mossaLvl1: "Colpo Fabio", mossaLvl2: "Super Fabio", mossaLvl3: "Iper Fabio", boss: false },
  { nome: "Falco", hpBase: 3, atkBase: 2, defBase: 4, velBase: 3, raritaTipo: "comune", elemento: "acqua", immagine: "Falco.jpeg", immagineAtk: "Falco_atk.jpeg", mossaLvl1: "Mogging", mossaLvl2: "Riavviato pc ora ok", mossaLvl3: "Picchiata", boss: false },
  { nome: "Gian", hpBase: 3, atkBase: 4, defBase: 2, velBase: 3, raritaTipo: "comune", elemento: "fuoco", immagine: "Gian.jpeg", immagineAtk: "Gian_atk.jpeg", mossaLvl1: "Parlo", mossaLvl2: "Rido", mossaLvl3: "Snitcho", boss: false },
  { nome: "Monica", hpBase: 3, atkBase: 5, defBase: 3, velBase: 4, raritaTipo: "non comune", elemento: "fuoco", immagine: "Monica.jpeg", immagineAtk: "Monica_atk.jpeg", mossaLvl1: "Parlo", mossaLvl2: "Rido", mossaLvl3: "Snitcho", boss: false },
  { nome: "Ruggiero", hpBase: 4, atkBase: 3, defBase: 4, velBase: 3, raritaTipo: "non comune", elemento: "erba", immagine: "Ruggiero.jpeg", immagineAtk: "Ruggiero_atk.jpeg", mossaLvl1: "Invio corrispettivi", mossaLvl2: "Sfuriata mail", mossaLvl3: "Divieto di parcheggio", boss: false },
  { nome: "Bussolotti", hpBase: 4, atkBase: 2, defBase: 5, velBase: 2, raritaTipo: "non comune", elemento: "acqua", immagine: "Bussolotti.jpeg", immagineAtk: "Bussolotti_atk.jpeg", mossaLvl1: "Discord", mossaLvl2: "LOL Player", mossaLvl3: "Malattia", boss: false },
  { nome: "Bellini", hpBase: 4, atkBase: 2, defBase: 5, velBase: 4, raritaTipo: "non comune", elemento: "acqua", immagine: "Bellini.jpeg", immagineAtk: "Bellini_atk.jpeg", mossaLvl1: "Attacco snack", mossaLvl2: "Non sei un bodybuilder", mossaLvl3: "Richiesta consulenza tecn. interni", boss: false },
  { nome: "Tudor", hpBase: 6, atkBase: 3, defBase: 5, velBase: 5, raritaTipo: "raro", elemento: "erba", immagine: "Tudor.jpeg", immagineAtk: "Tudor_atk.jpeg", mossaLvl1: "Scoreggia", mossaLvl2: "Sono un tuo superiore", mossaLvl3: "Lancio di tessera", boss: true, mossaULT: "Tessera Nucleare", numFrameUlt: 3 },
  { nome: "Solieri", hpBase: 4, atkBase: 6, defBase: 4, velBase: 2, raritaTipo: "raro", elemento: "fuoco", immagine: "Solieri.jpeg", immagineAtk: "Solieri_atk.jpeg", mossaLvl1: "Isolamento", mossaLvl2: "Bestemmia", mossaLvl3: "Battuta di merda", boss: true, mossaULT: "Apocalisse Padana", numFrameUlt: 2 },
  { nome: "Donato", hpBase: 4, atkBase: 6, defBase: 3, velBase: 4, raritaTipo: "raro", elemento: "fuoco", immagine: "Donato.jpeg", immagineAtk: "Donato_atk.jpeg", mossaLvl1: "Falco rispondi!", mossaLvl2: "Da ora sei il suo referente", mossaLvl3: "Preventivo eccessivo", boss: true, mossaULT: "Referente Supremo", numFrameUlt: 3 },
  { nome: "Venturini", hpBase: 5, atkBase: 4, defBase: 7, velBase: 5, raritaTipo: "epico", elemento: "acqua", immagine: "Venturini.jpeg", immagineAtk: "Venturini_atk.jpeg", mossaLvl1: "Uscita da Tesla", mossaLvl2: "Pelata accecante", mossaLvl3: "Camminata finocchia", boss: false },
  { nome: "Carra", hpBase: 3, atkBase: 8, defBase: 4, velBase: 6, raritaTipo: "epico", elemento: "fuoco", immagine: "Carra.jpeg", immagineAtk: "Carra_atk.jpeg", mossaLvl1: "Corso sicurezza", mossaLvl2: "Raccolta di penna", mossaLvl3: "Sniffata", boss: false },
  { nome: "Giulio", hpBase: 7, atkBase: 4, defBase: 6, velBase: 4, raritaTipo: "epico", elemento: "acqua", immagine: "Giulio.jpeg", immagineAtk: "Giulio_atk.jpeg", mossaLvl1: "Impiccione", mossaLvl2: "Finta di fare chiamata", mossaLvl3: "Imparo a volare", boss: true, mossaULT: "Occhio Onnipresente", numFrameUlt: 4 },
  { nome: "Mattia", hpBase: 5, atkBase: 7, defBase: 4, velBase: 5, raritaTipo: "epico", elemento: "fuoco", immagine: "Mattia.jpeg", immagineAtk: "Mattia_atk.jpeg", mossaLvl1: "Non ti rispondo", mossaLvl2: "Chat GPT", mossaLvl3: "Non sono cazzi miei", boss: false },
  { nome: "Paolo", hpBase: 9, atkBase: 4, defBase: 8, velBase: 3, raritaTipo: "leggendario", elemento: "erba", immagine: "Paolo.jpeg", immagineAtk: "Paolo_atk.jpeg", mossaLvl1: "Giovaneehh il telefonoooh", mossaLvl2: "Forfora Beam", mossaLvl3: "Alitata", boss: true, mossaULT: "Urlo del Capo Supremo", numFrameUlt: 4 },
  { nome: "Lanza", hpBase: 5, atkBase: 5, defBase: 10, velBase: 4, raritaTipo: "leggendario", elemento: "acqua", immagine: "Lanza.jpeg", immagineAtk: "Lanza_atk.jpeg", mossaLvl1: "Lavata di capo", mossaLvl2: "Precedenza a Cagna", mossaLvl3: "Cago il cazzo", boss: true, mossaULT: "Rimprovero Infinito", numFrameUlt: 7 },
  { nome: "DiNicola", hpBase: 4, atkBase: 11, defBase: 4, velBase: 5, raritaTipo: "leggendario", elemento: "fuoco", immagine: "DiNicola.jpeg", immagineAtk: "DiNicola_atk.jpeg", mossaLvl1: "Stronzata micidiale", mossaLvl2: "Ingegneria fasulla", mossaLvl3: "Urlata in faccia", boss: true, mossaULT: "Collasso Strutturale", numFrameUlt: 3 },
  { nome: "Filippo", hpBase: 7, atkBase: 6, defBase: 6, velBase: 5, raritaTipo: "leggendario", elemento: "erba", immagine: "Filippo.jpeg", immagineAtk: "Filippo_atk.jpeg", mossaLvl1: "Scomparsa", mossaLvl2: "Sì Sì lo faremo", mossaLvl3: "Volere di donna come assistente", boss: true, mossaULT: "Promessa Eterna", numFrameUlt: 1 },
  { nome: "Nicolas", hpBase: 1, atkBase: 10, defBase: 1, velBase: 1, raritaTipo: "leggendario", elemento: "fuoco", immagine: "Nicolas.jpeg", immagineAtk: "Nicolas_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: false },
  { nome: "Max", hpBase: 7, atkBase: 7, defBase: 7, velBase: 7, raritaTipo: "special", elemento: "buio"/*luce*/, immagine: "Max.jpeg", immagineAtk: "Max_atk.jpeg", mossaLvl1: "Nulla di scritto", mossaLvl2: "No Callbell", mossaLvl3: "Tutti al centralino", boss: true, mossaULT: "Centralino Universale", numFrameUlt: 4 },
  { nome: "Gio", hpBase: 4, atkBase: 10, defBase: 3, velBase: 0, raritaTipo: "bombers", elemento: "buio", immagine: "Gio.jpeg", immagineAtk: "Gio_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Bombardamento Totale", numFrameUlt: 2 },
  { nome: "Sat", hpBase: 5, atkBase: 11, defBase: 4, velBase: 6, raritaTipo: "bombers", elemento: "buio", immagine: "Sat.jpeg", immagineAtk: "Sat_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Maremoto del Bomber", numFrameUlt: 3 },
  { nome: "Kul", hpBase: 4, atkBase: 6, defBase: 6, velBase: 10, raritaTipo: "bombers", elemento: "luce", immagine: "Kul.jpeg", immagineAtk: "Kul_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Velocità Assoluta", numFrameUlt: 1 },
  { nome: "Edo", hpBase: 10, atkBase: 6, defBase: 7, velBase: 3, raritaTipo: "bombers", elemento: "luce", immagine: "Edo.jpeg", immagineAtk: "Edo_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Esecuzione Lussuriosa", numFrameUlt: 4 }
];

const DB_EVENTI_MISTERIOSI = [
    {
        nome: "Antico Altare Energetico",
        descrizione: "Trovi una roccia fluttuante colma di rune. La squadra recupera istantaneamente il 30% degli HP massimi!",
        mappeAbilitate: [1, 2, 3], // Può capitare in mappa 1, 2 e 3
        percentuale: 40, // 40% di probabilità all'interno della categoria mistero
        azione: () => {
            miaSquadra.forEach(p => {
                if(p) p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + Math.round(p.hpMax * 0.30));
            });
        }
    },
    {
        nome: "Il Ladro di Monete",
        descrizione: "Un bizzarro figuro sbuca dalle ombre e ti regala un boost di potenza per il tuo primo Pokémon!",
        mappeAbilitate: [1, 2], // Solo nelle prime due mappe
        percentuale: 35,
        azione: () => {
            if (miaSquadra[0]) {
                miaSquadra[0].atk += 2;
            }
        }
    },
    {
        nome: "Capsula del Tempo Smarrita",
        descrizione: "Trovi un vecchio contenitore tecnologico sigillato contenente caramelle rare.",
        mappeAbilitate: [2, 3], // Solo in mappa 2 e mappa 3
        percentuale: 25,
        azione: () => {
            if (miaSquadra[0]) {
                miaSquadra[0].livello += 1;
            }
        }
    }
];


// ==========================================================
// BILANCIAMENTO ATTRIBUTI, STATISTICHE ED ELEMENTI
// ==========================================================

const CONFIG_MOLTIPLICATORE_RARITA = {
    "comune": 1.00,
    "non comune": 1.01,
    "raro": 1.02,
    "epico": 1.03,
    "leggendario": 1.04,
    "bombers": 1.05,      
    "special": 1.07    
};

// SCALING DELLE STATISTICHE BASE IN FUNZIONE DELL'ELEMENTO
const CONFIG_STAT_ELEMENTO = {
    "fuoco": { hp: 1.00,  atk: 1.05,  def: 0.98,  vel: 1.00 },
    "erba":  { hp: 1.04,  atk: 1.00,  def: 1.00,  vel: 0.98 },
    "acqua": { hp: 1.00,  atk: 0.98,  def: 1.05,  vel: 1.00 },
    "luce":  { hp: 1.05,  atk: 0.95,  def: 1.05,  vel: 1.00 },
    "buio":  { hp: 0.95,  atk: 1.04,  def: 0.94,  vel: 1.05 }
};

// MOLTIPLICATORI DI DANNO (Attaccante >> Difensore)
// Se uno scontro non è in questa lista (es. Fuoco vs Fuoco), il moltiplicatore è 1.0 (Normale)
const CONFIG_DEBOLEZZE = {
    "fuoco": { "erba": 1.5, "acqua": 0.5, "buio": 1.25, "luce": 0.5 },
    "erba":  { "acqua": 1.5, "fuoco": 0.5, "buio": 1.25, "luce": 0.5 },
    "acqua": { "fuoco": 1.5, "erba": 0.5, "buio": 1.25, "luce": 0.5 },
    "buio":  { "luce": 1.5, "fuoco": 1.5, "erba": 1.5, "acqua": 1.5 },
    "luce":  { "buio": 1.5, "fuoco": 0.75, "erba": 0.75, "acqua": 0.75 }
};

const CONFIG_RARITA = {
    "comune": { chance: 0.22, colore: "#9e9e9e" },
    "non comune": { chance: 0.18, colore: "#4caf50" },
    "raro": { chance: 0.16, colore: "#00bcd4" },
    "epico": { chance: 0.14, colore: "#9c27b0" },
    "leggendario": { chance: 0.12, colore: "#ffeb3b" },
    "special": { chance: 0.10, colore: "#ff9800" },
    "bombers": {chance: 0.08, colore: "#ff0000"}
};

const CONFIG_MOSSE = {
    1: 1.0,  
    2: 1.25, // <-- Modificato a 1.25 come richiesto
    3: 1.50  // <-- Ti consiglio di abbassare a 1.50 anche il livello 3 per mantenerlo bilanciato
};

const ARCHIVIO_BOSS = {
    "1": {
        nome: "GABRIEL FATE",
        iconaChibi: "TudorChibi.jpeg",
        immagine: "TudorBoss.jpeg",
        soundtrack: "SongTudorULT.mp3",
        squadra: [{ nome: "Tudor", livello: 12 }]
    },
    "2": {
        nome: "WATCH MAN",
        iconaChibi: "SolieriChibi.jpeg",
        immagine: "SolieriBoss.jpeg",
        soundtrack: "SongSolieriULT.mp3",
        squadra: [{ nome: "Solieri", livello: 22 }]
    },
    "3": {
        nome: "ONE COPPINO MAN",
        iconaChibi: "DonatoChibi.jpeg",
        immagine: "DonatoBoss.jpeg",
        soundtrack: "SongDonatoULT.mp3",
        squadra: [{ nome: "Donato", livello: 32 }]
    },
    "4": {
        nome: "CARNEVALI'S CORONA",
        iconaChibi: "GiulioChibi.jpeg",
        immagine: "GiulioBoss.jpeg",
        soundtrack: "SongGiulioULT.mp3",
        squadra: [{ nome: "Giulio", livello: 42 }]
    },
    "5": {
        nome: "PAULTWITCH",
        iconaChibi: "PaoloChibi.jpeg",
        immagine: "PaoloBoss.png",
        soundtrack: "SongPaoloULT.mpeg",
        squadra: [{ nome: "Paolo", livello: 52 }]
    },
    "6": {
        nome: "NICOTAURUS",
        iconaChibi: "DiNicolaChibi.jpeg",
        immagine: "DiNicolaBoss.jpeg",
        soundtrack: "SongDiNicolaULT.mp3",
        squadra: [{ nome: "DiNicola", livello: 62 }]
    },
    "7": {
        nome: "COSMIC LANZA",
        iconaChibi: "LanzaChibi.jpeg",
        immagine: "LanzaBoss.jpeg",
        soundtrack: "SongLanzaULT.mp3",
        squadra: [{ nome: "Lanza", livello: 72 }]
    },
    "8": {
        nome: "KONGFIL",
        iconaChibi: "FilippoChibi.jpeg",
        immagine: "FilippoBoss.jpeg",
        soundtrack: "SongFilippoULT.mp3",
        squadra: [{ nome: "Filippo", livello: 82 }]
    },

    // Incredibili 4
    "9": {
        nome: "KUL, PECCATO D'ACCIDIA",
        iconaChibi: "KulChibi.jpeg",
        immagine: "KulBoss.jpeg",
        soundtrack: "SongKulULT.mp3",
        squadra: [{ nome: "Kul", livello: 90 }]
    },
    "10": {
        nome: "GIO, PECCATO D'IRA",
        iconaChibi: "GioChibi.jpeg",
        immagine: "GioBoss.jpeg",
        soundtrack: "SongGioULT.mp3",
        squadra: [{ nome: "Gio", livello: 90 }]
    },
    "11": {
        nome: "SAT, PECCATO DI SUPERBIA",
        iconaChibi: "SatChibi.jpeg",
        immagine: "SatBoss.jpeg",
        soundtrack: "SongSatULT.mp3",
        squadra: [{ nome: "Sat", livello: 90 }]
    },
    "12": {
        nome: "EDO, PECCATO DI LUSSURIA",
        iconaChibi: "EdoChibi.jpeg",
        immagine: "EdoBoss.jpeg",
        soundtrack: "SongEdoULT.mp3",
        squadra: [{ nome: "Edo", livello: 90 }]
    },
    "13": {
        nome: "MAX, IL PRIMO PECCATORE",
        iconaChibi: "MaxChibi.jpeg",
        immagine: "MaxBoss.jpeg",
        soundtrack: "SongMaxULT.mp3",
        squadra: [{ nome: "Max", livello: 95 }]
    }
};

// =========================================================================
// 1. DIZIONARIO DI CONVERSIONE DELLA RARITÀ
// Traduce le stringhe in numeri per fare controlli matematici (es: 3 per "raro")
// =========================================================================
const SCALA_RARITA_MAPPA = {
    "comune": 1,
    "non comune": 2,
    "raro": 3,
    "epico": 4,
    "leggendario": 5,
    "special": 6,
    "bombers": 7
};

const ARCHIVIO_MAPPE = {
    "mappa1": {
        sfondo: "1.png",
        livelloMin: 5,
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
        sfondo: "2.png",
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
        sfondo: "3.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 1,
        mossaMaxRel: 2,
        mossaMaxMax: 3,         // Inizia a comparire il livello mossa 3 nella seconda metà
        idBoss: "3",            // Bovi (Paolo)
        RaritaMin: "raro",      // <-- COME RICHIESTO
        RaritaMax: "epico"      // <-- COME RICHIESTO
    },
    "mappa4": {
        sfondo: "4.png",
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
        sfondo: "5.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "5",
        RaritaMin: "raro",
        RaritaMax: "leggendario"
    },
    "mappa6": {
        sfondo: "6.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "6",
        RaritaMin: "epico",
        RaritaMax: "leggendario"
    },
    "mappa7": {
        sfondo: "7.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "7",
        RaritaMin: "epico",
        RaritaMax: "special"
    },
    "mappa8": {
        sfondo: "8.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,         // Mosse fisse al livello 3
        idBoss: "8",
        RaritaMin: "leggendario",
        RaritaMax: "bombers"
    },
    "mappa9": {
        sfondo: "9.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "13",
        RaritaMin: "leggendario",
        RaritaMax: "bombers"
    }
};

let mappaAttuale = "mappa1";

function calcolaLivelloEMossaMappa(piano) {
    const configMappa = ARCHIVIO_MAPPE[mappaAttuale];
    let metaMappa = Math.floor(schemaAlbero.length / 2); // Trova il giro di boa dell'albero dei nodi
    
    let minLiv, maxLiv;
    let minMossa, maxMossa;
    
    if (piano <= metaMappa) {
        // --- PRIMA METÀ DELLA MAPPA ---
        minLiv = configMappa.livelloMin;
        maxLiv = configMappa.livelloMaxRelativo;
        
        minMossa = configMappa.mossaMin;
        maxMossa = configMappa.mossaMaxRel;
    } else {
        // --- SECONDA METÀ DELLA MAPPA ---
        // Il massimo relativo diventa il nuovo minimo sia per i livelli che per le mosse
        minLiv = configMappa.livelloMaxRelativo;
        maxLiv = configMappa.livelloMaxMassimo;
        
        minMossa = configMappa.mossaMaxRel;
        maxMossa = configMappa.mossaMaxMax;
    }
    
    // Calcolo randomico finale inclusivo (es: tra mossaMin 1 e mossaMaxRel 2 può uscire 1 o 2)
    let livelloGenerato = Math.floor(Math.random() * (maxLiv - minLiv + 1)) + minLiv;
    let mossaGenerata = Math.floor(Math.random() * (maxMossa - minMossa + 1)) + minMossa;
    
    // Protezione di sicurezza per le mosse (non possono scendere sotto 1 o superare il livello 3)
    mossaGenerata = Math.max(1, Math.min(3, mossaGenerata));
    
    return { livello: livelloGenerato, livelloMossa: mossaGenerata };
}


// Funzione Helper per generare l'HTML dell'elemento con Icona e Colore
function getHtmlElemento(elementoNome, isGrande = false) {
    if (!elementoNome) elementoNome = "fuoco"; // Fallback di sicurezza
    const nomeMinuscolo = elementoNome.toLowerCase();
    const classeIcona = isGrande ? "icona-elemento-grande" : "icona-elemento";
    
    // Genera il tag con l'immagine (es: fuoco.png, acqua.png, erba.png, luce.png, buio.png)
    return `
        <span class="badge-elemento testo-${nomeMinuscolo}">
            <img src="${nomeMinuscolo}.png" alt="${nomeMinuscolo}" class="${classeIcona}">
            ${nomeMinuscolo}
        </span>
    `;
}

// ==============================================================================

let miaSquadra = [];
let mioPokemon;      
let nemiciIncontro = []; 
let nemicoPokemon;   
let isBossFight = false;
let haUsatoUltGiocatore = false;
let haUsatoUltNemico = false;
const schemaAlbero = [1, 3, 4, 5, 4, 5, 4, 3, 1];
let pianoAttuale = 0;     
let nodoSceltoAttuale = 0; 
let mappaEventi = {}; 
let isSkipAttivo = false;
let isAutoskipAbilitato = false;
let volumePrecedente = 0.5;
let indicePokemonInDettaglio = null; 

function creaPokemon(infoBase, livello, livelloMossa = 1) {
    let moltiplicatoreRarita = CONFIG_MOLTIPLICATORE_RARITA[infoBase.raritaTipo.toLowerCase()] || 1.0;
    let elementoPkm = infoBase.elemento ? infoBase.elemento.toLowerCase() : "fuoco";
    let statsElem = CONFIG_STAT_ELEMENTO[elementoPkm] || { hp: 1, atk: 1, def: 1, vel: 1 };

    let hpMax = infoBase.hpBase;
    let atk = infoBase.atkBase;
    let def = infoBase.defBase;
    let vel = infoBase.velBase;

    for (let lvl = 2; lvl <= livello; lvl++) {
        hpMax = hpMax + ((lvl - 1) * statsElem.hp) * moltiplicatoreRarita;
        atk = atk + ((lvl - 1) * statsElem.atk) * moltiplicatoreRarita;
        def = def + ((lvl - 1) * statsElem.def) * moltiplicatoreRarita;
        vel = vel + ((lvl - 1) * statsElem.vel) * moltiplicatoreRarita;
    }

    hpMax = Math.round(hpMax);
    atk = Math.round(atk);
    def = Math.round(def);
    vel = Math.round(vel);
    
    return {
        nome: infoBase.nome, livello: livello, livelloMossa: livelloMossa, 
        hpMax: hpMax, hpAttuali: hpMax, atk: atk, def: def, vel: vel,
        raritaTipo: infoBase.raritaTipo, elemento: elementoPkm, 
        immagine: infoBase.immagine, immagineAtk: infoBase.immagineAtk,
        mossaLvl1: infoBase.mossaLvl1, mossaLvl2: infoBase.mossaLvl2, mossaLvl3: infoBase.mossaLvl3,
        numFrameUlt: infoBase.numFrameUlt || 3, mossaULT: infoBase.mossaULT || infoBase.mossaLvl3 || "Mossa Finale", 
        infoBase: infoBase, colore: CONFIG_RARITA[infoBase.raritaTipo]?.colore || "#ffe066", boss: infoBase.boss
    };
}

function aggiornaStatsLivello(p, nuoviLivelli) {
    let vecchiaHpMax = p.hpMax;
    let livelloPartenza = p.livello;
    p.livello += nuoviLivelli;
    
    let moltiplicatoreRarita = CONFIG_MOLTIPLICATORE_RARITA[p.infoBase.raritaTipo.toLowerCase()] || 1.0;
    let elementoPkm = p.elemento ? p.elemento.toLowerCase() : "fuoco";
    let statsElem = CONFIG_STAT_ELEMENTO[elementoPkm] || { hp: 1, atk: 1, def: 1, vel: 1 };

    for (let lvl = livelloPartenza + 1; lvl <= p.livello; lvl++) {
        p.hpMax = p.hpMax + ((lvl - 1) * statsElem.hp) * moltiplicatoreRarita;
        p.atk = p.atk + ((lvl - 1) * statsElem.atk) * moltiplicatoreRarita;
        p.def = p.def + ((lvl - 1) * statsElem.def) * moltiplicatoreRarita;
        p.vel = p.vel + ((lvl - 1) * statsElem.vel) * moltiplicatoreRarita;
    }

    p.hpMax = Math.round(p.hpMax);
    p.atk = Math.round(p.atk);
    p.def = Math.round(p.def);
    p.vel = Math.round(p.vel);
}

function getNomeMossaAttuale(p) {
    if (p.livelloMossa === 3) return p.mossaLvl3;
    if (p.livelloMossa === 2) return p.mossaLvl2;
    return p.mossaLvl1;
}

function mostraSelezione() {
    cambiaSchermata("schermata-start", "schermata-selezione");
    document.getElementById("titolo-selezione").innerText = "Scegli il tuo Pokémon Iniziale";
    
    const contenitore = document.getElementById("contenitore-starter");
    contenitore.innerHTML = "";
    
    // Prendiamo esattamente i primi 3 elementi fissi dall'inizio del database
    for (let i = 0; i < 3; i++) {
        let infoBase = pokemonDatabase[i]; 

        // Gli starter ora partono al livello 5 con mossa a livello 1, 
        // calcolando le statistiche in modo dinamico e proporzionale tramite creaPokemon!
        let p = creaPokemon(infoBase, 5, 1); 

        let colonna = document.createElement("div");
        colonna.className = "colonna-starter";
        colonna.innerHTML = `
            <div class="blocco-foto" style="background-color: ${p.colore}; flex-direction: column;">
                <img src="${p.immagine}" alt="${p.nome}" class="sprite-pokemon">
            </div>
            <div class="blocco-stats">
                <strong>${p.nome}</strong> (${p.raritaTipo.toUpperCase()})<br>
                • Elemento: ${getHtmlElemento(p.elemento)}<br>
                • Livello: ${p.livello}<br>
                • HP: ${p.hpMax}<br>
                • ATK: ${p.atk}<br>
                • DEF: ${p.def}<br>
                • VEL: ${p.vel}<br>
                • Mossa: ${getNomeMossaAttuale(p)} (Lvl 1)
            </div>
            <div class="blocco-pulsante">
                <button class="btn-scegli" onclick="aggiungiASquadra(${JSON.stringify(p).replace(/"/g, '&quot;')})">SCEGLI</button>
            </div>
        `;
        contenitore.appendChild(colonna);
    }
}

// Assicura che i Pokémon pescati (selvatici, trade, pokeball) rispettino i range della mappa
function pescaPokemonCasuale(esclusioniNomi = []) {
    const pesi = { "comune": 22, "non comune": 18, "raro": 16, "epico": 14, "leggendario": 12, "special": 10, "bombers": 8 };
    let poolDisponibili = pokemonDatabase.filter(p => !p.boss && !esclusioniNomi.includes(p.nome));

    // FILTRO RARITA' DELLA MAPPA GLOBALE
    if (mappaAttuale && ARCHIVIO_MAPPE[mappaAttuale]) {
        let mappaConfig = ARCHIVIO_MAPPE[mappaAttuale];
        if (mappaConfig.RaritaMin && mappaConfig.RaritaMax) {
            let minVal = SCALA_RARITA_MAPPA[mappaConfig.RaritaMin.toLowerCase()] || 1;
            let maxVal = SCALA_RARITA_MAPPA[mappaConfig.RaritaMax.toLowerCase()] || 7;
            let poolFiltrato = poolDisponibili.filter(p => {
                let pVal = SCALA_RARITA_MAPPA[p.raritaTipo.toLowerCase()] || 1;
                return pVal >= minVal && pVal <= maxVal;
            });
            if (poolFiltrato.length > 0) poolDisponibili = poolFiltrato; // Applica solo se non svuota l'array
        }
    }

    if (poolDisponibili.length === 0) poolDisponibili = pokemonDatabase.filter(p => !p.boss); // Paracadute emergenza

    let pesoTotale = 0;
    poolDisponibili.forEach(p => pesoTotale += pesi[p.raritaTipo] || 1);
    let random = Math.random() * pesoTotale;
    let parziale = 0;

    for (let p of poolDisponibili) {
        parziale += pesi[p.raritaTipo] || 1;
        if (random <= parziale) return p;
    }
    return poolDisponibili[0]; 
}

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

function generaOpzioniPokemon(quanti, isStarter) {
    if (isStarter) return;

    const contenitore = document.getElementById("contenitore-starter");
    contenitore.innerHTML = "";
    
    let nomiEstratti = []; // Tiene traccia di chi è già uscito

    for (let i = 0; i < quanti; i++) {
        // Pesca escludendo i doppioni
        let infoBase = pescaPokemonCasuale(nomiEstratti); 
        nomiEstratti.push(infoBase.nome);
        
        // Applica le nuove regole di livello e mossa della mappa attuale
        let configGenerata = calcolaLivelloEMossaMappa(pianoAttuale);

        let p = creaPokemon(infoBase, configGenerata.livello, configGenerata.livelloMossa);

        let colonna = document.createElement("div");
        colonna.className = "colonna-starter";
        
        let bloccoAzioneHTML = "";
        if (miaSquadra.length >= 6) {
            let opzioniSostituzione = `<option value="keep">Lascia nella Pokéball (Tienilo così)</option>`;
            miaSquadra.forEach((membro, idx) => {
                opzioniSostituzione += `<option value="${idx}">Sostituisci ${membro.nome} (Lvl ${membro.livello})</option>`;
            });
            
            bloccoAzioneHTML = `
                <div style="padding: 0 10px; text-align: left; font-size: 11px;">
                    <label style="font-weight:bold;">Squadra piena! Gestisci:</label>
                    <select id="select-sostituisci-${i}" style="width:100%; margin: 4px 0; font-family:monospace; font-size:11px;">
                        ${opzioniSostituzione}
                    </select>
                </div>
                <div class="blocco-pulsante">
                    <button class="btn-scegli" onclick="confermaSceltaConSostituzione(${i}, ${JSON.stringify(p).replace(/"/g, '&quot;')})">CONFERMA</button>
                </div>
            `;
        } else {
            bloccoAzioneHTML = `
                <div class="blocco-pulsante">
                    <button class="btn-scegli" onclick="aggiungiASquadra(${JSON.stringify(p).replace(/"/g, '&quot;')})">SCEGLI</button>
                </div>
            `;
        }

        colonna.innerHTML = `
            <div class="blocco-foto" style="background-color: ${p.colore}; flex-direction: column;">
                <img src="${p.immagine}" alt="${p.nome}" class="sprite-pokemon">
            </div>
            <div class="blocco-stats">
                <strong>${p.nome}</strong><br>
                • Livello: ${p.livello}<br>
                • ATK: ${p.atk}<br>
                • HP: ${p.hpMax}<br>
                • Mossa: ${getNomeMossaAttuale(p)} (Lvl ${p.livelloMossa})
            </div>
            ${bloccoAzioneHTML}
        `;
        contenitore.appendChild(colonna);
    }
}

function confermaSceltaConSostituzione(indiceOpzione, nuovoPokemon) {
    const select = document.getElementById(`select-sostituisci-${indiceOpzione}`);
    const valoreScelto = select.value;
    if (valoreScelto !== "keep") {
        let idxDaRimuovere = parseInt(valoreScelto);
        miaSquadra[idxDaRimuovere] = nuovoPokemon;
    }
    cambiaSchermata("schermata-selezione", "schermata-mappa");
    generaMappaAlbero();
    aggiornaSquadraMappa();
}

function aggiungiASquadra(pObiettivo) {
    miaSquadra.push(pObiettivo);
    cambiaSchermata("schermata-selezione", "schermata-mappa");
    if (miaSquadra.length === 1) {
        generaMappaProcedurale(); 
    }
    generaMappaAlbero();
    aggiornaSquadraMappa();
}

function generaMappaProcedurale() {
    alberoMappa = [];
    mappaEventi = {};

    // Scegliamo un indice casuale (0, 1 o 2) per posizionare l'unico Centro Medico del penultimo piano
    let indiceMedicoUnico = Math.floor(Math.random() * 3); 

    for (let pianoIndex = 0; pianoIndex < schemaAlbero.length; pianoIndex++) {
        let numNodi = schemaAlbero[pianoIndex];
        mappaEventi[pianoIndex] = [];
        let nodiDelPiano = [];

        for (let i = 0; i < numNodi; i++) {
            let tipoEvento = "cespuglio";
            
            if (pianoIndex === schemaAlbero.length - 1) {
                tipoEvento = "boss";
            } else if (pianoIndex === schemaAlbero.length - 2) {
                // Penultimo piano: un solo centro medico a caso, gli altri sono nemici normali
                tipoEvento = (i === indiceMedicoUnico) ? "centro-medico" : "npc";
            } else if (pianoIndex === 3 && i === 2) {
                tipoEvento = "mistero"; // Nodo centrale fisso del quarto livello (indice 2 su 5)
            } else if (pianoIndex > 0) {
                const poolNormale = ["cespuglio", "npc", "pokeball", "scambio"];
                const poolAvanzata = ["cespuglio", "npc", "pokeball", "scambio", "mistero"];
                
                if (pianoIndex <= 3) {
                    tipoEvento = poolNormale[Math.floor(Math.random() * poolNormale.length)];
                } else {
                    tipoEvento = poolAvanzata[Math.floor(Math.random() * poolAvanzata.length)];
                }
            }

            mappaEventi[pianoIndex].push(tipoEvento);
            nodiDelPiano.push({ id: `p${pianoIndex}-n${i}`, piano: pianoIndex, index: i, tipo: tipoEvento, figli: [] });
        }
        alberoMappa.push(nodiDelPiano);
    }

    for (let p = 0; p < alberoMappa.length - 1; p++) {
        let pianoAttuale = alberoMappa[p];
        let pianoSuccessivo = alberoMappa[p + 1];
        let numAttuale = pianoAttuale.length;
        let numSucc = pianoSuccessivo.length;

        pianoAttuale.forEach((nodo, i) => {
            if (numAttuale === 1) {
                pianoSuccessivo.forEach(figlio => nodo.figli.push(figlio.id));
            } else if (numSucc === 1) {
                nodo.figli.push(pianoSuccessivo[0].id);
            } else if (numSucc === numAttuale + 1) {
                nodo.figli.push(pianoSuccessivo[i].id);
                nodo.figli.push(pianoSuccessivo[i + 1].id);
            } else if (numSucc === numAttuale - 1) {
                if (i > 0) nodo.figli.push(pianoSuccessivo[i - 1].id);
                if (i < numSucc) nodo.figli.push(pianoSuccessivo[i].id);
            }
        });
    }
}

function isFiglioValido(pianoIndex, indiceA, indiceB) {
    // Ora controlla ESATTAMENTE se il nodo B è stato registrato come figlio del nodo A
    let nodoAttuale = alberoMappa[pianoIndex][indiceA];
    let idFiglioDesiderato = `p${pianoIndex + 1}-n${indiceB}`;
    return nodoAttuale.figli.includes(idFiglioDesiderato);
}

function generaMappaAlbero() {
    const contenitore = document.getElementById("albero-container");
    contenitore.innerHTML = "";

    schemaAlbero.forEach((numNodi, pianoIndex) => {
        let divPiano = document.createElement("div");
        divPiano.className = "piano";

        for (let i = 0; i < numNodi; i++) {
            if (pianoIndex === 0) {
                let radice = document.createElement("div");
                radice.className = "radice-mappa";
                radice.id = `p${pianoIndex}-n${i}`; // FONDAMENTALE PER LE LINEE
                radice.innerText = "START";
                divPiano.appendChild(radice);
            } else {
                let tipoEvento = mappaEventi[pianoIndex][i];
                let bottone = document.createElement("button");
                bottone.id = `p${pianoIndex}-n${i}`; // FONDAMENTALE PER LE LINEE
                bottone.className = `nodo-bottone evento-${tipoEvento}`;
                
                if (pianoIndex === schemaAlbero.length - 1 || tipoEvento === "boss") {
                    let idBossCorrente = ARCHIVIO_MAPPE[mappaAttuale].idBoss;
                    let imgChibi = ARCHIVIO_BOSS[idBossCorrente].iconaChibi;
                    bottone.style.backgroundImage = `url('${imgChibi}')`;
                    bottone.style.backgroundSize = "cover";
                    bottone.classList.remove(`evento-${tipoEvento}`); 
                    bottone.classList.add("nodo-boss"); // Affidiamo la grandezza al CSS, non all'inline
                }
                
                if (pianoIndex === pianoAttuale + 1 && isFiglioValido(pianoAttuale, nodoSceltoAttuale, i)) {
                    bottone.classList.add("nodo-selezionabile");
                    bottone.disabled = false;
                } else if (pianoIndex <= pianoAttuale) {
                    bottone.classList.add("nodo-passato");
                    bottone.disabled = true;
                } else {
                    bottone.disabled = true;
                }

                bottone.onclick = () => avviaEvento(pianoIndex, i, tipoEvento);
                divPiano.appendChild(bottone);
            }
        }
        contenitore.appendChild(divPiano);
    });
    setTimeout(disegnaLineeMappa, 100);
}

function avviaEvento(pianoSelezionato, indiceNodo, tipoEvento) {
    pianoAttuale = pianoSelezionato;
    nodoSceltoAttuale = indiceNodo;
    
    // Intercettiamo l'ultimo nodo o eventi espliciti "boss"
    if (pianoSelezionato === schemaAlbero.length - 1 || tipoEvento === "boss") {
        // LEGGE IL BOSS DALLA MAPPA CORRENTE INVECE DI "boss_finale" HARDCODED
        let idBossCorrente = ARCHIVIO_MAPPE[mappaAttuale].idBoss;
        avviaBossBattle(idBossCorrente);
        return;
    }
    
    // FIX SICUREZZA: Accetta sia "medico" che "centro-medico" per evitare bug grafici della mappa
    if (tipoEvento === "medico" || tipoEvento === "centro-medico") {
        miaSquadra.forEach(p => p.hpAttuali = p.hpMax); // Cura tutti
        
        // Genera la grafica della squadra curata
        let contenitoreMedico = document.getElementById("contenitore-medico-squadra");
        if (contenitoreMedico) {
            contenitoreMedico.innerHTML = "";
            miaSquadra.forEach(p => {
                let scheda = document.createElement("div");
                scheda.className = "scheda-disco-pokemon"; // Usiamo lo stesso stile del disco
                scheda.style.backgroundColor = p.colore || "#ffffff";
                scheda.style.cursor = "default"; // Togliamo il puntatore cliccabile
                scheda.style.transform = "none"; // Disattiviamo l'hover effect
                scheda.style.boxShadow = "5px 5px 0px #2f3640";

                scheda.innerHTML = `
                    <div class="foto-disco-pkm" style="border-color: #4cd137;">
                        <img src="${p.immagine}" alt="${p.nome}">
                    </div>
                    <div class="info-disco-pkm">
                        <div class="nome-disco-pkm">${p.nome}</div>
                        <div style="font-family: monospace; font-size: 14px; color: #718093;">Lvl. ${p.livello}</div>
                        <div style="margin-top: 10px; color: #2ecc71; font-weight: bold; font-size: 18px;">
                            ${p.hpAttuali} / ${p.hpMax} HP
                        </div>
                    </div>
                    <div style="font-size: 12px; font-weight: bold; background: #2ecc71; color: #fff; padding: 4px 10px; border-radius: 20px; text-align: center; width: 80%;">
                        CURATO
                    </div>
                `;
                contenitoreMedico.appendChild(scheda);
            });
        }
        
        cambiaSchermata("schermata-mappa", "schermata-centro-medico");
    }
    // MODIFICA AGGIORNATA: Ora devia sulla nuova schermata regalo Pokeball con tasto annulla
    else if (tipoEvento === "pokeball") {
        generaOpzioniPokeball(); 
    } 
    else if (tipoEvento === "disco") {
        apriSchermataDiscoMossa();
    }
    // 🔥 NUOVO EVENTO 1: SCAMBIO POKÉMON
    else if (tipoEvento === "scambio") {
        avviaEventoScambio();
    }
    // 🔥 NUOVO EVENTO 2: EVENTO MISTERIOSO
    else if (tipoEvento === "mistero") {
        avviaEventoMisterioso();
    }
    else {
        cambiaSchermata("schermata-mappa", "schermata-gioco");
        document.getElementById("titolo-incontro").innerText = tipoEvento === "cespuglio" ? `Erba Alta - Piano ${pianoAttuale}` : `Sfida Allenatore - Piano ${pianoAttuale}`;
        preparaIncontroBattaglia(tipoEvento);
    }
}

function apriSchermataDiscoMossa() {
    let contenitore = document.getElementById("contenitore-opzioni-disco");
    if (!contenitore) return;
    
    contenitore.innerHTML = ""; 

    miaSquadra.forEach((p, index) => {
        let lvlMossa = p.livelloMossa || 1; 
        let nomeMossa = getNomeMossaAttuale(p);

        let scheda = document.createElement("div");
        scheda.className = "scheda-disco-pokemon";
        scheda.style.backgroundColor = p.colore || "#ffffff";

        scheda.onclick = function() {
            potenziiaMossaPokemon(index); 
        };

        scheda.innerHTML = `
            <div class="foto-disco-pkm">
                <img src="${p.immagine}" alt="${p.nome}">
            </div>
            <div class="info-disco-pkm">
                <div class="nome-disco-pkm">${p.nome}</div>
                <div style="font-family: monospace; font-size: 14px; color: #718093;">Lvl. ${p.livello}</div>
                <div class="mossa-disco-pkm">
                    <strong>${nomeMossa}</strong><br>
                    <span style="color: #e67e22; font-size: 12px;">Mossa Lvl: ${lvlMossa}/3</span>
                </div>
            </div>
            <div style="font-size: 12px; font-weight: bold; background: #2f3640; color: #fff; padding: 4px 10px; border-radius: 20px; text-align: center; width: 80%;">
                POTENZIA
            </div>
        `;
        contenitore.appendChild(scheda);
    });

    cambiaSchermata("schermata-mappa", "schermata-disco");
}

function potenziiaMossaPokemon(index) {
    let p = miaSquadra[index];
    if(p.livelloMossa < 3) {
        p.livelloMossa += 1;
    }
    tornaAllaMappaDaDisco();
}

function tornaAllaMappaDaDisco() {
    isBossFight = false; // Reset del flag quando finisce l'incontro
    cambiaSchermata("schermata-disco", "schermata-mappa");
    generaMappaAlbero();
    aggiornaSquadraMappa();
    document.getElementById("btn-attacco").style.display = "inline-block";
    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-torna-mappa").style.display = "none";
}

function preparaIncontroBattaglia(tipoEvento) {
    haUsatoUltGiocatore = false; 
    haUsatoUltNemico = false;
    nemiciIncontro = [];
    
    // Ottiene la configurazione dei livelli basata sulla mappa attuale
    let configGenerata = calcolaLivelloEMossaMappa(pianoAttuale);
    let livNemico = configGenerata.livello;
    let livMossaNemico = configGenerata.livelloMossa;
    
    // 🔥 FIX QUANTITÀ NEMICI
    if (tipoEvento === "cespuglio") {
        // Cespuglio: Sempre e solo 1 nemico
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
    } else if (tipoEvento === "npc") {
        // Allenatore NPC: Sempre fissi 2 nemici
        for (let i = 0; i < 2; i++) {
            nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
        }
    } else {
        // Fallback di sicurezza
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
    }
    
    nemicoPokemon = nemiciIncontro.shift(); 

    if (!mandaInCampoMioPokemon()) return;

    // CAMBIO DELLO SFONDO DINAMICO
    const schermataGioco = document.getElementById("schermata-gioco");
    if (schermataGioco) {
        schermataGioco.style.backgroundImage = `url('${ARCHIVIO_MAPPE[mappaAttuale].sfondo}')`;
        schermataGioco.style.backgroundSize = "cover";
        schermataGioco.style.backgroundPosition = "center";
    }

    const divVS = document.getElementById("intro-vs");
    const imgVSGio = document.getElementById("img-vs-giocatore");
    const imgVSNem = document.getElementById("img-vs-nemico");
    const testoVS = document.querySelector(".scritta-vs");
    const latoGio = document.querySelector(".lato-giocatore");
    const latoNem = document.querySelector(".lato-nemico");

    imgVSGio.src = `${mioPokemon.nome}VS.jpeg`;
    imgVSNem.src = `${nemicoPokemon.nome}VS.jpeg`;

    latoGio.classList.remove("entra");
    latoNem.classList.remove("entra");
    testoVS.classList.remove("attiva");

    divVS.style.display = "block";

    setTimeout(() => {
        latoGio.classList.add("entra");
        latoNem.classList.add("entra");
        testoVS.classList.add("attiva");
    }, 50);

    setTimeout(() => {
        divVS.style.display = "none";
        cambiaSchermata("schermata-mappa", "schermata-gioco");

        mandaInCampoMioPokemon(); 
        aggiornaGrafica();

        if (nemicoPokemon.vel > mioPokemon.vel) {
            chiAttaccaPerPrimo = "nemico";
            document.getElementById("console-log").innerHTML = `Il nemico è più veloce! ${nemicoPokemon.nome} attacca per primo!`;
            document.getElementById("btn-attacco").disabled = true;
            setTimeout(turnoNemico, 1500); 
        } else {
            chiAttaccaPerPrimo = "giocatore";
            document.getElementById("console-log").innerHTML = `Sei più veloce! Tocca a ${mioPokemon.nome}.`;
            document.getElementById("btn-attacco").disabled = false;
        }

        document.getElementById("console-log").innerHTML = tipoEvento === "cespuglio" 
            ? `Un ${nemicoPokemon.nome} selvatico appare!` 
            : `L'allenatore manda in campo ${nemicoPokemon.nome}!`;

    }, 2000);
}

function mandaInCampoMioPokemon() {
    mioPokemon = miaSquadra.find(p => p.hpAttuali > 0);

    if (!mioPokemon) {
        let goDiv = document.getElementById("schermata-gameover");
        riproduciMusica("gameover.mp3");
        document.getElementById("schermata-gioco").style.display = "none";
        goDiv.style.setProperty("display", "flex", "important"); 
        return false; 
    }

    document.getElementById("schermata-gameover").style.display = "none";
    document.getElementById("btn-attacco").style.display = "inline-block";
    document.getElementById("btn-attacco").disabled = false;
    
    if (document.getElementById("img-giocatore")) {
        document.getElementById("img-giocatore").src = mioPokemon.immagine;
    }
    
    return true; 
}

function aggiornaGrafica() {
    if (mioPokemon) {
        // Nome + Icona dell'Elemento + Tag del Livello e Mossa
        document.getElementById("nome-giocatore").innerHTML = `
            ${mioPokemon.nome} ${getHtmlElemento(mioPokemon.elemento)} 
            <span class="lvl-tag">Lvl.${mioPokemon.livello}</span><br>
            <span class="mossa-tag">Mossa: ${getNomeMossaAttuale(mioPokemon)}</span>
        `;
        document.getElementById("hp-giocatore").innerText = `${mioPokemon.hpAttuali}/${mioPokemon.hpMax}`;
        
        let pctGiocatore = Math.max(0, (mioPokemon.hpAttuali / mioPokemon.hpMax) * 100);
        let barraG = document.getElementById("barra-giocatore");
        if (barraG) {
            barraG.style.width = `${pctGiocatore}%`;
            if (pctGiocatore <= 20) barraG.style.backgroundColor = "#ff3838";
            else if (pctGiocatore <= 50) barraG.style.backgroundColor = "#ffb300";
            else barraG.style.backgroundColor = "#4cd137";
        }

        let vivi = miaSquadra.filter(p => p.hpAttuali > 0).length;
        document.getElementById("rimanenti-giocatore").innerText = `In Squadra: ${vivi}`;
        document.getElementById("img-giocatore").src = mioPokemon.immagine;
    }

    if (nemicoPokemon) {
        // Nome + Icona dell'Elemento + Tag del Livello e Mossa del Nemico
        document.getElementById("nome-nemico").innerHTML = `
            ${nemicoPokemon.nome} ${getHtmlElemento(nemicoPokemon.elemento)} 
            <span class="lvl-tag">Lvl.${nemicoPokemon.livello}</span><br>
            <span class="mossa-tag">Mossa: ${getNomeMossaAttuale(nemicoPokemon)}</span>
        `;
        document.getElementById("hp-nemico").innerText = `${nemicoPokemon.hpAttuali}/${nemicoPokemon.hpMax}`;
        
        let pctNemico = Math.max(0, (nemicoPokemon.hpAttuali / nemicoPokemon.hpMax) * 100);
        let barraN = document.getElementById("barra-nemico");
        if (barraN) {
            barraN.style.width = `${pctNemico}%`;
            if (pctNemico <= 20) barraN.style.backgroundColor = "#ff3838";
            else if (pctNemico <= 50) barraN.style.backgroundColor = "#ffb300";
            else barraN.style.backgroundColor = "#4cd137";
        }

        document.getElementById("rimanenti-nemico").innerText = `In attesa: ${nemiciIncontro.length}`;
        document.getElementById("img-nemico").src = nemicoPokemon.immagine;
    }
}

// Funzione Helper per stampare a schermo se l'attacco è superefficace o meno
function getMessaggioEfficacia(moltiplicatore) {
    if (moltiplicatore > 1) return "<br><span style='color:#e1b12c; font-weight:bold;'>È superefficace!</span>";
    if (moltiplicatore < 1) return "<br><span style='color:#7f8fa6; font-style:italic;'>Non è molto efficace...</span>";
    return "";
}

function turnoGiocatore() {
    // --- CONTROLLO DI SICUREZZA (EVITA IL CRASH) ---
    if (typeof mioPokemon === 'undefined' || !mioPokemon) {
        console.error("Errore: mioPokemon non è definito!");
        document.getElementById("console-log").innerHTML = "Errore critico: Pokémon non trovato.";
        return;
    }

    if (document.getElementById("btn-attacco").disabled) return;
    document.getElementById("btn-attacco").disabled = true;

    // --- CONTROLLO ULT BOMBERS (5% probabilità) ---
    let usaUlt = false;
    // Controllo aggiunto: verifichiamo che mioPokemon esista prima di leggere la proprietà
    if (mioPokemon.raritaTipo === "bombers" && !haUsatoUltGiocatore && Math.random() <= 0.05) {
        usaUlt = true;
        haUsatoUltGiocatore = true;
    }

    if (usaUlt) {
        document.getElementById("console-log").innerHTML = `⚠️ ${mioPokemon.nome} accumula un'energia devastante...`;
        
        eseguiAnimazioneUlt(mioPokemon, "img-giocatore", () => {
            // Nota: qui assicurati che calcolaEdEseguiDannoGiocatore sia definita sopra
            calcolaEdEseguiDannoGiocatore(3.0, mioPokemon.mossaULT || "ULTIMATE");
        }); 
    } else {
        // Animazione Attacco normale
        document.getElementById("img-giocatore").src = mioPokemon.immagineAtk;
        setTimeout(() => {
            document.getElementById("img-giocatore").src = mioPokemon.immagine;
            calcolaEdEseguiDannoGiocatore(CONFIG_MOSSE[mioPokemon.livelloMossa] || 1.0, getNomeMossaAttuale(mioPokemon));
        }, isSkipAttivo ? 750 : 1500);
    }
}

function calcolaEdEseguiDannoNemico(moltMossa, nomeMossaUsata) {
    let moltiplicatoreTipo = CONFIG_DEBOLEZZE[nemicoPokemon.elemento]?.[mioPokemon.elemento] || 1.0;
    
    let dannoBase = (nemicoPokemon.atk * nemicoPokemon.atk) / (nemicoPokemon.atk + mioPokemon.def);
    let dannoSubito = Math.max(1, Math.round(dannoBase * moltiplicatoreTipo * moltMossa));
    
    mioPokemon.hpAttuali = Math.max(0, mioPokemon.hpAttuali - dannoSubito);
    
    let msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
    document.getElementById("console-log").innerHTML = `${nemicoPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoSubito} danni!${msgEfficacia}`;
    aggiornaGrafica();

    if (mioPokemon.hpAttuali <= 0) {
        // Logica KO Giocatore...
        gestisciKOGiocatore();
    } else {
        document.getElementById("btn-attacco").disabled = false;
    }
}

// Funzione che gestisce il turno di attacco del nemico/boss
function turnoNemico() {
    // Controllo di sicurezza: se il nemico è morto, o non esiste, o non c'è il nostro Pokemon, interrompe il turno
    if (!nemicoPokemon || nemicoPokemon.hpAttuali <= 0 || !mioPokemon) return;

    let usaUlt = false;           // Variabile che decide se il nemico userà la mossa finale
    let messaggioSpeciale = "";   // Variabile per salvare un testo di trama (es. "Filippo si infuria")

    // --- 1. GESTIONE GIMMICK E CONDIZIONI DEI BOSS ---
    // Controlla se il nemico è un boss e non ha ancora usato la sua Ultimate
    if (nemicoPokemon.boss === true && !haUsatoUltNemico) {
        let nomeBossCorrente = nemicoPokemon.nome.toLowerCase(); // Trasforma il nome in minuscolo per evitare errori di battitura

        // CASO A: Il Boss è Filippo
        if (nomeBossCorrente === "filippo" || nomeBossCorrente === "filippo fase 2") {
            // Controlla nell'array della tua squadra se esiste l'oggetto e se si chiama Carra
            let ceCarraNelTeam = miaSquadra.some(p => p && p.nome.toLowerCase() === "carra");

            if (ceCarraNelTeam) {
                usaUlt = true; // Spara subito la ULT al primo turno
                messaggioSpeciale = "<br>🚨 <strong>Filippo nota Carra sul campo di battaglia e si infuria all'istante!</strong>";
            } else if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) {
                usaUlt = true; // Se Carra non c'è, Filippo usa la ULT normalmente sotto il 50% di vita
            }
        }

        // CASO B: Il Boss è Lanza
        else if (nomeBossCorrente === "lanza" || nomeBossCorrente === "lanza fase 2") {
            // Usa la mossa finale SOLO se la sua vita scende sotto il 15% (0.15)
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * 0.15) {
                usaUlt = true;
            }
        }

        // CASO C: Tutti gli altri Boss (Max, ecc.)
        else {
            // Regola standard: mossa finale quando gli HP scendono sotto o pari alla metà (50%)
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) {
                usaUlt = true;
            }
        }
    }

    // --- 2. ESECUZIONE ATTACCO O CAMBIO FASE ---
    if (usaUlt) {
        haUsatoUltNemico = true; // Segna che il boss ha consumato la sua mossa finale

        // AUTOMAZIONE FASE 2: Controlla se il boss non è già in "Fase 2"
        if (!nemicoPokemon.nome.includes("Fase 2")) {
            // Crea il nome da cercare nel DB (es: "Max" diventa "Max Fase 2")
            let nomeFase2Cerca = nemicoPokemon.nome + " Fase 2"; 
            
            // Cerca nel database dei pokemon se esiste l'oggetto Fase 2
            let datiFase2 = pokemonDatabase.find(p => p.nome.toLowerCase() === nomeFase2Cerca.toLowerCase());
            
            // Se esiste nel database, esegue la trasformazione ricalcolando le statistiche
            // Se esiste nel database, esegue la trasformazione ricalcolando le statistiche
            if (datiFase2) {
                let lvl = nemicoPokemon.livello || 1; 
                
                // --- CONTROLLO CURA FASE 2 ---
                // Modifica questo valore: 0.50 = 50%, 0.80 = 80%, 1.0 = 100%
                let percentualeCuraFase2 = 0.50; 
                
                let nuoviHpMax = Math.round(datiFase2.hpBase * (1 + (lvl * 0.2)));
                let hpDopoCura = Math.max(1, Math.round(nuoviHpMax * percentualeCuraFase2));

                // Sovrascrive l'oggetto nemicoPokemon con i nuovi dati
                nemicoPokemon = {
                    nome: datiFase2.nome,
                    livello: lvl,
                    hpMax: nuoviHpMax,
                    hpAttuali: hpDopoCura, // Usa la percentuale decisa
                    atk: Math.round(datiFase2.atkBase * (1 + (lvl * 0.2))),
                    def: Math.round(datiFase2.defBase * (1 + (lvl * 0.2))),
                    vel: Math.round(datiFase2.velBase * (1 + (lvl * 0.2))),
                    immagine: datiFase2.immagine,
                    immagineAtk: datiFase2.immagineAtk,
                    mossaLvl1: datiFase2.mossaLvl1,
                    mossaLvl2: datiFase2.mossaLvl2,
                    mossaLvl3: datiFase2.mossaLvl3,
                    mossaULT: datiFase2.mossaULT || datiFase2.mossaLvl3,
                    numFrameUlt: datiFase2.numFrameUlt || 3,
                    elemento: datiFase2.elemento,
                    boss: true,
                    raritaTipo: datiFase2.raritaTipo
                };
                messaggioSpeciale += `<br>✨ <strong>Fase Shift! Il boss muta forma e recupera il ${percentualeCuraFase2 * 100}% della vita!</strong> ✨`;
                aggiornaGrafica(); 
            }
        }

        // Stampa a console/schermo il messaggio di preparazione dell'attacco
        document.getElementById("console-log").innerHTML = `⚠️ IL BOSS SI INFURIA! ${nemicoPokemon.nome} prepara l'attacco finale!${messaggioSpeciale}`;
        
        // Fa partire l'animazione grafica dell'Ultimate per il nemico
        eseguiAnimazioneUlt(nemicoPokemon, "img-nemico", () => {
            // Infligge il danno (moltiplicatore 3.0) al termine dell'animazione
            calcolaEdEseguiDannoNemico(3.0, nemicoPokemon.mossaULT);
        });
        
    } else {
        // ATTACCO NORMALE (Non usa la Ultimate)
        // Cambia l'immagine del nemico nella sua posa di attacco, se esiste
        if (nemicoPokemon.immagineAtk) document.getElementById("img-nemico").src = nemicoPokemon.immagineAtk;
        
        // Mette in pausa il gioco per qualche istante per mostrare l'attacco
        setTimeout(() => {
            if (!mioPokemon) return; // Controllo di sicurezza
            
            // Ripristina l'immagine normale finita l'animazione
            document.getElementById("img-nemico").src = nemicoPokemon.immagine;
            
            // Calcola il danno basato sul livello mossa attuale del nemico e lo esegue
            calcolaEdEseguiDannoNemico(CONFIG_MOSSE[nemicoPokemon.livelloMossa] || 1.0, getNomeMossaAttuale(nemicoPokemon));
            
        }, isSkipAttivo ? 750 : 1500); // 750ms se il giocatore ha premuto skip, 1500ms normale
    }
}

// Funzione scatenata alla fine della battaglia quando gli HP del nemico vanno a 0
function gestisciVittoriaIncontro() {
    document.getElementById("console-log").innerHTML = "Hai vinto la battaglia!";
    
    // CONTROLLO BOSS
    if (isBossFight) {
        isBossFight = false; 
        
        const chiaviMappe = Object.keys(ARCHIVIO_MAPPE);
        let indiceAttuale = chiaviMappe.indexOf(mappaAttuale);
        
        indiceAttuale++; 
        
        if (indiceAttuale >= chiaviMappe.length) {
            document.getElementById("console-log").innerHTML = "🏆 COMPLIMENTI! Hai completato tutte le mappe del gioco! 🏆";
            return; 
        }
        
        mappaAttuale = chiaviMappe[indiceAttuale];
        document.getElementById("console-log").innerHTML += `<br><strong>Boss Sconfitto! Sei passato a ${mappaAttuale.toUpperCase()}! La tua squadra è stata curata.</strong>`;
        
        // Cura il team
        miaSquadra.forEach(p => { if (p) p.hpAttuali = p.hpMax; });

        // Resetta l'albero per la nuova mappa
        pianoAttuale = 0;
        nodoSceltoAttuale = 0;
        generaMappaProcedurale();
    }
    
    // Cambio schermata e aggiornamento HUD
    cambiaSchermata("schermata-gioco", "schermata-mappa");
    aggiornaGrafica();
    
    // 🔥 FIX FONDAMENTALE: Ridisegna l'albero della mappa per sbloccare i nodi successivi!
    generaMappaAlbero();
}

function tornaAllaMappa() {
    cambiaSchermata("schermata-gioco", "schermata-mappa");
    cambiaSchermata("schermata-centro-medico", "schermata-mappa");
    generaMappaAlbero(); 
    aggiornaSquadraMappa();
    
    document.getElementById("btn-attacco").style.display = "inline-block";
    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-torna-mappa").style.display = "none";
}

function aggiornaSquadraMappa() {
    const griglia = document.getElementById("griglia-squadra");
    if(!griglia) return;
    griglia.innerHTML = "";
    
    miaSquadra.forEach((p, index) => {
        let quadratino = document.createElement("div");
        quadratino.className = "icona-squadra";
        if (index === 0) quadratino.classList.add("primo-posto"); 
        
        quadratino.setAttribute("data-rarita", p.raritaTipo);
        quadratino.style.borderColor = p.colore; 
        quadratino.style.backgroundImage = `url('${p.immagine}')`;
        quadratino.style.opacity = p.hpAttuali <= 0 ? "0.4" : "1"; 
        
        quadratino.onclick = () => mostraDettaglioPokemon(index);
        griglia.appendChild(quadratino);
    });
}

function mostraDettaglioPokemon(index) {
    let p = miaSquadra[index]; 
    if (!p) return;
    
    indicePokemonInDettaglio = index;

    // 1. Dati in alto
    document.getElementById("dettaglio-img").src = p.immagine; 
    document.getElementById("dettaglio-nome").innerText = p.nome;
    document.getElementById("dettaglio-rarita").innerText = p.raritaTipo.toUpperCase();
    
    // 2. Gestione Tipo (Iniettato come primo elemento dentro .valori-stats)
    let bloccoStats = document.querySelector("#schermata-dettaglio .valori-stats");
    if (bloccoStats) {
        let vecchioBadge = document.getElementById("dettaglio-elemento-badge");
        if (vecchioBadge) vecchioBadge.remove();

        let divElemento = document.createElement("div");
        divElemento.id = "dettaglio-elemento-badge";
        divElemento.innerHTML = `TIPO: ${getHtmlElemento(p.elemento, false)}`;
        
        bloccoStats.insertBefore(divElemento, bloccoStats.firstChild);
    }

    // 3. Caricamento statistiche numeriche
    document.getElementById("dettaglio-livello").innerText = p.livello;
    document.getElementById("dettaglio-hp").innerText = `${p.hpAttuali}/${p.hpMax}`;
    document.getElementById("dettaglio-atk").innerText = p.atk;
    document.getElementById("dettaglio-def").innerText = p.def;
    document.getElementById("dettaglio-vel").innerText = p.vel;
    document.getElementById("dettaglio-mossa").innerText = `${getNomeMossaAttuale(p)} (Lvl ${p.livelloMossa})`;

    // 4. Rigenerazione opzioni tendina posizione
    let select = document.getElementById("select-posizione");
    if (select) {
        select.innerHTML = "";
        for (let i = 0; i < miaSquadra.length; i++) {
            let opzione = document.createElement("option");
            opzione.value = i;
            opzione.text = `Posizione ${i + 1} (${miaSquadra[i].nome})`;
            if (i === index) opzione.selected = true;
            select.appendChild(opzione);
        }
    }

    cambiaSchermata("schermata-mappa", "schermata-dettaglio");
}

function eseguiScambioPosizione() {
    let selectPos = document.getElementById("select-posizione");
    if (!selectPos || indicePokemonInDettaglio === null) return;

    let nuovaPosizione = parseInt(selectPos.value);
    if (nuovaPosizione === indicePokemonInDettaglio) return; 

    let temp = miaSquadra[indicePokemonInDettaglio];
    miaSquadra[indicePokemonInDettaglio] = miaSquadra[nuovaPosizione];
    miaSquadra[nuovaPosizione] = temp;

    if (typeof aggiornaSquadraMappa === "function") aggiornaSquadraMappa();
    cambiaSchermata("schermata-dettaglio", "schermata-mappa");
}

function chiudiDettaglio() { 
    cambiaSchermata("schermata-dettaglio", "schermata-mappa"); 
    aggiornaSquadraMappa();
}

function cambiaSchermata(idNascondi, idMostra) {
    const elementoNascondi = document.getElementById(idNascondi);
    const elementoMostra = document.getElementById(idMostra);
    if(elementoNascondi) elementoNascondi.classList.remove("attiva");
    if(elementoMostra) elementoMostra.classList.add("attiva");
}

function disegnaLineeMappa() {
    const container = document.getElementById("albero-container");
    if (!container) {
        console.error("Il container albero-container non esiste nel DOM!");
        return;
    }

    // 1. Rimuovi vecchio SVG se esiste (per evitare duplicati)
    const oldSvg = document.getElementById("mappa-svg");
    if (oldSvg) oldSvg.remove();

    // 2. Crea un NUOVO elemento SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "mappa-svg";
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none"; // Fondamentale per cliccare i bottoni
    svg.style.zIndex = "0"; 
    
    // Aggiungilo al container
    container.appendChild(svg);

    // 3. Ora disegna le linee usando le posizioni corrette
    alberoMappa.forEach(piano => {
        piano.forEach(nodo => {
            const elA = document.getElementById(nodo.id);
            if (!elA) return;

            nodo.figli.forEach(figlioId => {
                const elB = document.getElementById(figlioId);
                if (!elB) return;

                const rectA = elA.getBoundingClientRect();
                const rectB = elB.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
                linea.setAttribute("x1", rectA.left + rectA.width/2 - containerRect.left);
                linea.setAttribute("y1", rectA.top + rectA.height/2 - containerRect.top);
                linea.setAttribute("x2", rectB.left + rectB.width/2 - containerRect.left);
                linea.setAttribute("y2", rectB.top + rectB.height/2 - containerRect.top);
                
                linea.setAttribute("stroke", "#000000");
                linea.setAttribute("stroke-width", "2.5");
                linea.setAttribute("stroke-dasharray", "4,4");
                
                svg.appendChild(linea);
            });
        });
    });
}

function riproduciMusica(nomeFile) {
    const audio = document.getElementById("musica-gioco");
    if (!audio) return;
    if (audio.src.includes(nomeFile)) return; 
    
    audio.src = nomeFile;
    audio.play().catch(e => console.log("Audio in attesa di sblocco interazione utente."));
}

const vecchioCambiaSchermata = cambiaSchermata;
cambiaSchermata = function(idNascondi, idMostra) {
    vecchioCambiaSchermata(idNascondi, idMostra);
    if (idMostra === "schermata-start") riproduciMusica("lobby.mp3");
    if (idMostra === "schermata-mappa") riproduciMusica("mappa.mp3");
    if (idMostra === "schermata-gioco") {
        // Riproduce la musica normale SOLO se non è una Boss Fight
        if (!isBossFight) {
            riproduciMusica("combattimento.mp3");
        }
    }
};

function apriModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "block";
}
function chiudiModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "none";
}

function regolaVolume(valore) {
    const audio = document.getElementById("musica-gioco");
    if (audio) {
        audio.volume = valore;
        if (valore > 0) {
            document.getElementById("chk-muto").checked = false;
        }
    }
}
function toggleMuto(isMuto) {
    const audio = document.getElementById("musica-gioco");
    const slider = document.getElementById("slider-volume");
    if (!audio) return;

    if (isMuto) {
        volumePrecedente = audio.volume;
        audio.volume = 0;
        slider.value = 0;
    } else {
        audio.volume = volumePrecedente > 0 ? volumePrecedente : 0.5;
        slider.value = audio.volume;
    }
}

function toggleAutoskip(valore) {
    isAutoskipAbilitato = valore;
}

function attivaSkip() {
    isSkipAttivo = true;
    const btnSkip = document.getElementById("btn-skip");
    if (btnSkip) btnSkip.disabled = true;
}

function apriModalInfo() {
    const modal = document.getElementById("modal-info");
    const header = document.getElementById("info-header");
    const griglia = document.getElementById("info-griglia-schede");
    
    if (!modal || !header || !griglia) return;

    let stringaRarita = "";
    Object.keys(CONFIG_RARITA).forEach((chiave, index) => {
        let info = CONFIG_RARITA[chiave];
        let percent = (info.chance * 100).toFixed(0) + "%";
        stringaRarita += `<span style="color: ${info.colore}; font-weight: bold;">${chiave.toUpperCase()}</span>: ${percent}`;
        if (index < Object.keys(CONFIG_RARITA).length - 1) {
            stringaRarita += " | ";
        }
    });
    header.innerHTML = stringaRarita;

    griglia.innerHTML = "";
    pokemonDatabase.forEach(pBase => {
        let coloreRarita = CONFIG_RARITA[pBase.raritaTipo]?.colore || "#ffe066";
        
        let scheda = document.createElement("div");
        scheda.className = "scheda-info-pokedex";
        scheda.style.backgroundColor = coloreRarita;

        scheda.innerHTML = `
            <div class="blocco-foto-pokedex">
                <img src="${pBase.immagine}" alt="${pBase.nome}">
            </div>
            <div class="blocco-stats-pokedex">
                <div class="info-titolo">
                    <span class="nome-pkm">${pBase.nome}</span><br>
                    <span class="rarita-pkm">[${pBase.raritaTipo.toUpperCase()}]</span><br>
                    <div style="margin-top:2px;">${getHtmlElemento(pBase.elemento)}</div>
                </div>
                <hr class="separatore-pkm">
                <div class="valori-stats">
                    • HP Base: ${pBase.hpBase}<br>
                    • ATK Base: ${pBase.atkBase}<br>
                    • DEF Base: ${pBase.defBase}<br>
                    • VEL Base: ${pBase.velBase}<br>
                </div>
                <hr class="separatore-pkm" style="border-top: 1px dashed rgba(0,0,0,0.2); margin: 5px 0;">
                <div class="valori-mosse" style="font-size: 15px; line-height: 1.3; font-family: monospace; color: #2f3640;">
                    <strong style="font-size: 10px; display: block; margin-bottom: 2px; color: #111;">MOSSE DISPONIBILI:</strong>
                    • M1: ${pBase.mossaLvl1 || 'Nessuna'}<br>
                    • M2: ${pBase.mossaLvl2 || 'Nessuna'}<br>
                    • M3: ${pBase.mossaLvl3 || 'Nessuna'}
                </div>
            </div>
        `;
        griglia.appendChild(scheda);
    });
    modal.style.display = "block";
}

function chiudiModalInfo() {
    document.getElementById("modal-info").style.display = "none";
}

document.getElementById("info-griglia-schede").addEventListener("wheel", (evt) => {
    evt.preventDefault();
    document.getElementById("info-griglia-schede").scrollLeft += evt.deltaY;
});

function avviaBossBattle(idBoss) {
    haUsatoUltGiocatore = false; 
    haUsatoUltNemico = false;
    
    if (idBoss === "boss_finale") idBoss = "5";
    
    const datiBoss = ARCHIVIO_BOSS[idBoss];
    if (!datiBoss) return;

    isBossFight = true;
    nemiciIncontro = [];

    datiBoss.squadra.forEach(pBoss => {
        let base = pokemonDatabase.find(p => p.nome.toLowerCase() === pBoss.nome.toLowerCase());
        if (base) {
            let lvl = pBoss.livello;
            nemiciIncontro.push({
                nome: base.nome,
                livello: lvl,
                // --- SCALING BOSS ---
                // Modifica il valore 0.2 qui sotto per cambiare la potenza dei boss.
                // 0.2 = scaling standard. 0.3 = boss molto più forti. 0.1 = boss più deboli.
                hpMax: Math.round(base.hpBase * (1 + (lvl * 0.2))),
                hpAttuali: Math.round(base.hpBase * (1 + (lvl * 0.2))),
                atk: Math.round(base.atkBase * (1 + (lvl * 0.2))),
                def: Math.round(base.defBase * (1 + (lvl * 0.2))),
                vel: Math.round(base.velBase * (1 + (lvl * 0.2))),
                immagine: base.immagine,
                immagineAtk: base.immagineAtk,
                mossaLvl1: base.mossaLvl1,
                mossaLvl2: base.mossaLvl2,
                mossaLvl3: base.mossaLvl3,
                mossaULT: base.mossaULT || base.mossaLvl3,
                numFrameUlt: base.numFrameUlt || 3,
                elemento: base.elemento || "fuoco",
                boss: true,
                raritaTipo: base.raritaTipo
            });
        }
    });

    nemicoPokemon = nemiciIncontro.shift();
    
    if (!mandaInCampoMioPokemon()) {
        console.error("Non ho trovato Pokémon da mandare in campo!");
        return;
    }

    // --- LOGICA INTRO BOSS BATTLE ---
    const introBossDiv = document.getElementById("intro-boss");
    const imgBossBg = document.getElementById("img-boss-background");
    
    if (introBossDiv && imgBossBg) {
        // Assegna l'immagine specifica del boss (NomeBoss.jpeg) prelevata dal DB
        imgBossBg.src = datiBoss.immagine; 
        introBossDiv.style.display = "block";
        
        if (datiBoss.soundtrack) {
            riproduciMusica(datiBoss.soundtrack);
        }

        // Timer di 3 secondi per mostrare l'animazione prima di andare nell'arena
        setTimeout(() => {
            introBossDiv.style.display = "none";
            cambiaSchermata("schermata-mappa", "schermata-gioco");
            aggiornaGrafica();
            
            // Determina chi attacca per primo dopo la fine dell'intro
            if (nemicoPokemon.vel > mioPokemon.vel) {
                chiAttaccaPerPrimo = "nemico";
                document.getElementById("console-log").innerHTML = `Il Boss <strong>${nemicoPokemon.nome}</strong> è più veloce e attacca per primo!`;
                document.getElementById("btn-attacco").disabled = true;
                setTimeout(turnoNemico, 1500); 
            } else {
                chiAttaccaPerPrimo = "giocatore";
                document.getElementById("console-log").innerHTML = `Sei più veloce! Tocca a ${mioPokemon.nome}.`;
                document.getElementById("btn-attacco").disabled = false;
            }
        }, 3000); 
    }
}

// SBLOCCO AUDIO RETROATTIVO PER DISPOSITIVI/BROWSER
document.addEventListener("click", function() {
    const audio = document.getElementById("musica-gioco");
    if (audio && (!audio.src || audio.paused) && document.getElementById("schermata-start").classList.contains("attiva")) {
        riproduciMusica("lobby.mp3");
    }
}, { once: true });

function eseguiAnimazioneUlt(pokemon, idElementoImg, callbackDanno) {
    // Recupera il numero di frame personalizzato, altrimenti usa 3 come fallback di sicurezza
    let totalFrames = pokemon.numFrameUlt || 3;
    let currentFrame = 1;
    let elementoImg = document.getElementById(idElementoImg);

    if (!elementoImg) {
        callbackDanno();
        return;
    }

    function mostraProssimoFrame() {
        if (currentFrame <= totalFrames) {
            // Cambia l'immagine per il frame corrente (es. NomeUlt1.jpeg)
            elementoImg.src = `${pokemon.nome}Ult${currentFrame}.jpeg`;
            currentFrame++;
            
            // =========================================================================
            // COSA CAMBIARE PER LA DURATA DA QUI:
            // =========================================================================
            // Il valore '350' sono i millisecondi (0.35 secondi) tra un frame e l'altro.
            // Se hai 3 frame, la durata totale sarà 350ms × 3 = 1050ms (circa 1 secondo).
            //
            // - Per VELOCIZZARE la ULT: Riduci 350 a 150 o 200.
            // - Per RALLENTARE la ULT: Aumenta 350 a 500 o 600.
            // =========================================================================
            setTimeout(mostraProssimoFrame, isSkipAttivo ? 500 : 1000);
            
        } else {
            // Finita l'animazione, torna allo sprite standard e applica il danno
            elementoImg.src = pokemon.immagine;
            callbackDanno();
        }
    }

    // Avvia il ciclo dei frame
    mostraProssimoFrame();
}

function calcolaEdEseguiDannoGiocatore(moltMossa, nomeMossaUsata) {
    let moltiplicatoreTipo = CONFIG_DEBOLEZZE[mioPokemon.elemento]?.[nemicoPokemon.elemento] || 1.0;
    
    let dannoBase = (mioPokemon.atk * mioPokemon.atk) / (mioPokemon.atk + nemicoPokemon.def);
    let dannoFatto = Math.max(1, Math.round(dannoBase * moltiplicatoreTipo * moltMossa));
    
    nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoFatto);
    
    let msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
    document.getElementById("console-log").innerHTML = `${mioPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoFatto} danni!${msgEfficacia}`;
    aggiornaGrafica();

    if (nemicoPokemon.hpAttuali <= 0) {
        // Mostra il Pokémon nemico KO
        let imgNemico = document.getElementById("img-nemico");
        if (imgNemico) imgNemico.src = `${nemicoPokemon.nome}KO.jpeg`; 

        setTimeout(() => {
            // CONTROLLO: Ci sono altri nemici in attesa nell'array?
            if (nemiciIncontro.length > 0) {
                nemicoPokemon = nemiciIncontro.shift(); // Prende il prossimo
                haUsatoUltNemico = false; // Resetta la flag della ULT per il nuovo nemico
                document.getElementById("console-log").innerHTML = `Il nemico manda in campo <strong>${nemicoPokemon.nome}</strong>! Tocca a te!`;
                aggiornaGrafica();
                document.getElementById("btn-attacco").disabled = false; // Riattiva il turno
            } else {
                // Se l'array è vuoto, hai sconfitto l'intero team NPC o il Boss
                gestisciVittoriaIncontro();
            }
        }, 2000); 
    } else {
        setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
    }
}

function gestisciKOGiocatore() {
    // 1. Controlliamo quanti Pokémon della squadra hanno ancora HP maggiori di 0
    let pokemonVivi = miaSquadra.filter(p => p.hpAttuali > 0);

    if (pokemonVivi.length > 0) {
        // 2. C'è ancora qualcuno vivo!
        document.getElementById("console-log").innerHTML = `<strong>${mioPokemon.nome}</strong> è esausto! Mandi in campo il prossimo!`;
        
        // Manda automaticamente in campo il prossimo Pokémon vivo
        mandaInCampoMioPokemon();
        aggiornaGrafica();
        
        // Ridà il turno al giocatore
        document.getElementById("btn-attacco").disabled = false;
        
    } else {
        // 3. Tutti i Pokémon sono morti. Adesso è veramente GAME OVER.
        let goDiv = document.getElementById("schermata-gameover");
        if (goDiv) {
            riproduciMusica("gameover.mp3");
            document.getElementById("schermata-gioco").style.display = "none";
            goDiv.style.setProperty("display", "flex", "important"); 
        }
    }
}



// =========================================================================
// 2. FUNZIONE GENERATRICE DEI NEMICI SELVATICI
// Parametro 'isSecondaMeta': passa 'true' se il nodo si trova nella seconda metà della mappa, altrimenti 'false'
// =========================================================================
function generaNemicoMappa(isSecondaMeta) {
    
    // Controllo di sicurezza: se la mappa attuale non è caricata in memoria, si ferma per evitare crash
    if (typeof mappaAttuale === 'undefined' || !mappaAttuale) {
        console.error("Errore: Impossibile generare il nemico perché 'mappaAttuale' non è definita.");
        return;
    }

    // A. FILTRO ESSERI: Esclude tutti i boss dal database per non farli spawnare come selvatici
    let poolDisponibili = pokemonDatabase.filter(p => !p.boss);

    // B. FILTRO RARITÀ: Controlla se la mappa corrente definisce un range di rarità
    if (mappaAttuale.RaritaMin && mappaAttuale.RaritaMax) {
        // Converte le stringhe della mappa attuale nei rispettivi numeri della scala
        let valoreMinimo = SCALA_RARITA_MAPPA[mappaAttuale.RaritaMin.toLowerCase()] || 1;
        let valoreMassimo = SCALA_RARITA_MAPPA[mappaAttuale.RaritaMax.toLowerCase()] || 7;

        // Mantiene nel pool solo i Pokémon che rientrano nel range di rarità della mappa
        poolDisponibili = poolDisponibili.filter(p => {
            let raritaPokemon = p.raritaTipo ? p.raritaTipo.toLowerCase() : "comune";
            let valoreRaritaP = SCALA_RARITA_MAPPA[raritaPokemon] || 1;
            return valoreRaritaP >= valoreMinimo && valoreRaritaP <= valoreMassimo;
        });
    }

    // Paracadute di emergenza: se il filtro svuota il pool (errore nel DB), ricarica tutti i non-boss per non bloccare il gioco
    if (poolDisponibili.length === 0) {
        poolDisponibili = pokemonDatabase.filter(p => !p.boss);
    }

    // C. SELEZIONE CASUALE: Estrae un Pokémon a caso dalla lista finale filtrata
    let base = poolDisponibili[Math.floor(Math.random() * poolDisponibili.length)];

    // D. CALCOLO LIVELLO: Sceglie il tetto massimo di livello in base alla metà mappa in cui si trova il nodo
    let livMin = mappaAttuale.livelloMin || 1;
    let livMax = isSecondaMeta ? (mappaAttuale.livelloMaxMassimo || livMin) : (mappaAttuale.livelloMaxRelativo || livMin);
    // Genera un livello intero casuale compreso tra livMin e livMax (inclusi)
    let livelloCalcolato = Math.floor(Math.random() * (livMax - livMin + 1)) + livMin;

    // E. CALCOLO LIVELLO MOSSA: Sceglie il livello mossa (1, 2 o 3) in base alla metà mappa
    let mossaMin = mappaAttuale.mossaMin || 1;
    let mossaMax = isSecondaMeta ? (mappaAttuale.mossaMaxMax || mossaMin) : (mappaAttuale.mossaMaxRel || mossaMin);
    // Genera un livello mossa casuale compreso tra mossaMin e mossaMax (inclusi)
    let livelloMossaCalcolato = Math.floor(Math.random() * (mossaMax - mossaMin + 1)) + mossaMin;

    // F. COSTRUZIONE ISTANZA: Salva il nemico nella variabile globale del gioco applicando i modificatori di livello
    nemicoPokemon = {
        nome: base.nome,
        livello: livelloCalcolato,
        livelloMossa: livelloMossaCalcolato, // Proprietà fondamentale per far decidere al turno del nemico quale mossa lanciare
        hpMax: Math.round(base.hpBase * (1 + (livelloCalcolato * 0.2))),
        hpAttuali: Math.round(base.hpBase * (1 + (livelloCalcolato * 0.2))),
        atk: Math.round(base.atkBase * (1 + (livelloCalcolato * 0.2))),
        def: Math.round(base.defBase * (1 + (livelloCalcolato * 0.2))),
        vel: Math.round(base.velBase * (1 + (livelloCalcolato * 0.2))),
        immagine: base.immagine,
        immagineAtk: base.immagineAtk,
        mossaLvl1: base.mossaLvl1,
        mossaLvl2: base.mossaLvl2,
        mossaLvl3: base.mossaLvl3,
        elemento: base.elemento || "fuoco",
        boss: false,
        raritaTipo: base.raritaTipo
    };
}

// =========================================================================
// AGGIORNAMENTO DINAMICO LINEE MAPPA AL RESIZE DELLA FINESTRA
// =========================================================================
window.addEventListener("resize", () => {
    // Ridisegna le linee solo se la schermata della mappa è attualmente visibile
    let mappaElement = document.getElementById("schermata-mappa");
    if (mappaElement && mappaElement.classList.contains("attiva")) {
        disegnaLineeMappa();
    }
});

let indicePokemonDaScambiare = null;
let pokemonPropostoScambio = null;
let pokemonOffertoPerScambio = null; // Variabile di supporto temporanea

// ================= EVENTO SCAMBIO =================
function avviaEventoScambio() {
    document.getElementById("scambio-fase-selezione").style.display = "block";
    document.getElementById("scambio-fase-risultato").style.display = "none";

    let contenitoreSquadra = document.getElementById("scambio-squadra-list");
    contenitoreSquadra.innerHTML = "";

    // Genera la griglia della squadra cliccabile
    miaSquadra.forEach((p, index) => {
        let scheda = document.createElement("div");
        scheda.className = "scheda-disco-pokemon"; 
        scheda.style.backgroundColor = p.colore || "#ffffff";
        scheda.style.transform = "scale(0.8)"; // Rimpicciolita per farle stare tutte
        scheda.style.height = "auto";
        scheda.style.cursor = "pointer";
        scheda.onclick = () => eseguiScambioDiretto(index);
        
        scheda.innerHTML = `
            <div class="foto-disco-pkm"><img src="${p.immagine}"></div>
            <div class="info-disco-pkm">
                <div class="nome-disco-pkm" style="font-size: 16px;">${p.nome}</div>
                <div style="font-family: monospace;">Lvl. ${p.livello}</div>
            </div>
        `;
        contenitoreSquadra.appendChild(scheda);
    });

    cambiaSchermata("schermata-mappa", "schermata-scambio");
}

function eseguiScambioDiretto(indexDaScambiare) {
    let vecchioPkm = miaSquadra[indexDaScambiare];

    // PARAMETRO REGOLABILE: Quanti livelli in più ottiene il Pokémon scambiato rispetto al tuo!
    let bonusLivelli = 2; 
    let nuovoLivello = vecchioPkm.livello + bonusLivelli;

    // Genera il nuovo Pokémon estraendo dalla mappa e assegnandogli il livello potenziato
    let nuovoInfoBase = pescaPokemonCasuale([vecchioPkm.nome]); 
    let mossaLvl = calcolaLivelloEMossaMappa(pianoAttuale).livelloMossa;
    let nuovoPkm = creaPokemon(nuovoInfoBase, nuovoLivello, mossaLvl);

    // Esegue lo scambio nell'array
    miaSquadra[indexDaScambiare] = nuovoPkm;

    // Mostra il risultato a schermo
    document.getElementById("scambio-fase-selezione").style.display = "none";
    document.getElementById("scambio-fase-risultato").style.display = "block";
    document.getElementById("testo-risultato-scambio").innerHTML = `Hai scambiato ${vecchioPkm.nome} (Lvl ${vecchioPkm.livello}) per un <strong>${nuovoPkm.nome} (Lvl ${nuovoPkm.livello})</strong>!`;

    // Crea la card visiva del nuovo pokemon ricevuto
    let contenitoreCard = document.getElementById("card-nuovo-pokemon");
    contenitoreCard.innerHTML = `
        <div class="scheda-disco-pokemon" style="background-color: ${nuovoPkm.colore}; cursor: default; transform: scale(0.9); height: auto;">
            <div class="foto-disco-pkm"><img src="${nuovoPkm.immagine}"></div>
            <div class="info-disco-pkm">
                <div class="nome-disco-pkm">${nuovoPkm.nome}</div>
                <div style="font-family: monospace; font-size: 16px;">Lvl. ${nuovoPkm.livello}</div>
                <div style="font-size: 13px; color: #27ae60; font-weight: bold; margin-top: 5px;">TIPO: ${nuovoPkm.elemento.toUpperCase()}</div>
            </div>
        </div>
    `;
}

function annullaScambio() {
    cambiaSchermata("schermata-scambio", "schermata-mappa");
    generaMappaAlbero(); // Tasto "No Grazie", sblocca la strada per proseguire senza scambiare
}

function chiudiEventoScambio() {
    cambiaSchermata("schermata-scambio", "schermata-mappa");
    aggiornaSquadraMappa(); // Aggiorna graficamente le facce del team in alto a sinistra
    generaMappaAlbero();    // Sblocca la mappa successiva
}

//=============================================================================================================================================================================================================
//===================================================                                            FUNZIONI DI RISERVA                                            ===============================================
//=============================================================================================================================================================================================================

function generaPropostaScambio(indexSquadra) {
    indicePokemonDaScambiare = indexSquadra;
    let mioP = miaSquadra[indexSquadra];
    
    // --- MODIFICATORE LIVELLO SCAMBIO ---
    // Puoi cambiare questo +2 per decidere quanti livelli in più avrà il Pokémon offerto
    let incrementoLivello = 2; 
    let livelloNuovo = mioP.livello + incrementoLivello;
    
    let nomeCasuale = pescaPokemonCasuale();
    // Generiamo l'istanza del Pokémon proposto calcolando i punti statistica corretti per il suo livello
    let configGenerata = calcolaLivelloEMossaMappa(pianoAttuale); 
    pokemonPropostoScambio = creaPokemon(nomeCasuale, livelloNuovo, configGenerata.livelloMossa);
    
    document.getElementById("btn-scambio-annulla-generale").style.display = "none";
    let boxProposta = document.getElementById("scambio-proposta-box");
    boxProposta.style.display = "block";
    
    document.getElementById("testo-proposta-scambio").innerHTML = `
        In cambio del tuo <strong>${mioP.nome}</strong> (Lvl.${mioP.livello}),<br>
        ti viene offerto un: <span style="color:#3498db;">${pokemonPropostoScambio.nome}</span> di <strong>Livello ${pokemonPropostoScambio.livello}</strong>!
    `;
}

function confermaScambioEffettivo() {
    if (indicePokemonDaScambiare !== null && pokemonPropostoScambio !== null) {
        let vecchioNome = miaSquadra[indicePokemonDaScambiare].nome;
        miaSquadra[indicePokemonDaScambiare] = pokemonPropostoScambio;
        
        alert(`Scambio effettuato! Hai ceduto ${vecchioNome} in cambio di ${pokemonPropostoScambio.nome}!`);
        cambiaSchermata("schermata-scambio", "schermata-mappa");
        aggiornaGrafica();
    }
}

//=============================================================================================================================================================================================================
//
//=============================================================================================================================================================================================================

// ================= EVENTO MISTERO =================
function avviaEventoMisterioso() {
    let numeroMappaCorrente = parseInt(mappaAttuale.replace("mappa", "")) || 1;
    let eventiFiltrati = DB_EVENTI_MISTERIOSI.filter(ev => ev.mappeAbilitate.includes(numeroMappaCorrente));
    
    if (eventiFiltrati.length === 0) eventiFiltrati = DB_EVENTI_MISTERIOSI;
    
    let sommaPercentuali = eventiFiltrati.reduce((sum, ev) => sum + ev.percentuale, 0);
    let rand = Math.random() * sommaPercentuali;
    let eventoEstratto = eventiFiltrati[0];
    let contatore = 0;
    
    for (let ev of eventiFiltrati) {
        contatore += ev.percentuale;
        if (rand <= contatore) {
            eventoEstratto = ev; break;
        }
    }
    
    document.getElementById("mistero-titolo-evento").innerText = eventoEstratto.nome;
    document.getElementById("mistero-descrizione").innerText = eventoEstratto.descrizione;
    
    // Attiva il bonus sulle statistiche in background
    eventoEstratto.azione ? eventoEstratto.azione() : null;
    
    cambiaSchermata("schermata-mappa", "schermata-mistero");
}

function chiudiEventoMistero() {
    cambiaSchermata("schermata-mistero", "schermata-mappa");
    aggiornaSquadraMappa(); // Riflette i buff sugli HP della squadra
    generaMappaAlbero();    // Sblocca i nodi successivi!
}

function generaOpzioniPokeball() {
    // Passiamo alla schermata
    cambiaSchermata("schermata-mappa", "schermata-selezione");
    
    // Assicuriamoci che il titolo sia corretto
    let titolo = document.getElementById("titolo-selezione");
    if (titolo) titolo.innerText = "Una Pokéball! Scegli chi unire alla squadra o prosegui.";
    
    // Genera i 3 personaggi
    generaOpzioniPokemon(3, false);

    // CERCHIAMO IL CONTENITORE O LO CREIAMO SE NON ESISTE
    let contenitore = document.getElementById("opzioni-pokemon-container");
    
    // Se il contenitore non esiste nell'HTML, lo cerchiamo tramite classe o lo creiamo
    if (!contenitore) {
        contenitore = document.querySelector(".schermata-selezione");
        // Se non trovi nemmeno quello, crea un div specifico
        if (!contenitore) {
            console.error("Errore: contenitore schermata-selezione non trovato!");
            return;
        }
    }
    
    // Rimuoviamo il vecchio tasto "No grazie" se presente
    let vecchioBtn = document.getElementById("btn-annulla-pokeball");
    if (vecchioBtn) vecchioBtn.remove();

    let btnAnnulla = document.createElement("button");
    btnAnnulla.id = "btn-annulla-pokeball";
    btnAnnulla.className = "btn-battle";
    btnAnnulla.style.marginTop = "20px";
    btnAnnulla.style.backgroundColor = "#e74c3c";
    btnAnnulla.innerText = "No, Grazie";
    btnAnnulla.onclick = () => cambiaSchermata("schermata-selezione", "schermata-mappa");
    
    contenitore.appendChild(btnAnnulla); // Ora contenitore è garantito non essere null
}
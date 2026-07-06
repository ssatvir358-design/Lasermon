const pokemonDatabase = [
    { 
        nome: "Fabio", hpBase: 2, atkBase: 2, defBase: 2, velBase: 4, raritaTipo: "comune", immagine: "Fabio.jpeg", immagineAtk: "Fabio_atk.jpeg",
        mossaLvl1: "Colpo Fabio", mossaLvl2: "Super Fabio", mossaLvl3: "Iper Fabio", boss: false
    },
    { 
        nome: "Falco", hpBase: 2, atkBase: 4, defBase: 1, velBase: 3, raritaTipo: "comune", immagine: "Falco.jpeg", immagineAtk: "Falco_atk.jpeg",
        mossaLvl1: "Mogging", mossaLvl2: "Riavviato pc ora ok", mossaLvl3: "Picchiata", boss: false
    },
    { 
        nome: "Gian", hpBase: 3, atkBase: 2, defBase: 3, velBase: 2, raritaTipo: "comune", immagine: "Gian.jpeg", immagineAtk: "Gian_atk.jpeg",
        mossaLvl1: "Parlo", mossaLvl2: "Rido", mossaLvl3: "Snitcho", boss: false
    },
    { 
        nome: "Monica", hpBase: 2, atkBase: 3, defBase: 2, velBase: 5, raritaTipo: "non comune", immagine: "Monica.jpeg", immagineAtk: "Monica_atk.jpeg",
        mossaLvl1: "Parlo", mossaLvl2: "Rido", mossaLvl3: "Snitcho", boss: false
    },
    { 
        nome: "Ruggero", hpBase: 3, atkBase: 3, defBase: 3, velBase: 3, raritaTipo: "non comune", immagine: "Ruggero.jpeg", immagineAtk: "Ruggero_atk.jpeg",
        mossaLvl1: "Invio corrispettivi", mossaLvl2: "Sfuriata mail", mossaLvl3: "Divieto di parcheggio", boss: false
    },
    { 
        nome: "Bussolotti", hpBase: 5, atkBase: 2, defBase: 4, velBase: 1, raritaTipo: "non comune", immagine: "Bussolotti.jpeg", immagineAtk: "Bussolotti_atk.jpeg",
        mossaLvl1: "Discord", mossaLvl2: "LOL Player", mossaLvl3: "Malattia", boss: false
    },
    { 
        nome: "Bellini", hpBase: 3, atkBase: 4, defBase: 2, velBase: 3, raritaTipo: "non comune", immagine: "Bellini.jpeg", immagineAtk: "Bellini_atk.jpeg",
        mossaLvl1: "Attacco snack", mossaLvl2: "Non sei un bodybuilder", mossaLvl3: "Richiesta consulenza tecn. interni", boss: false
    },
    { 
        nome: "Tudor", hpBase: 3, atkBase: 4, defBase: 5, velBase: 2, raritaTipo: "raro", immagine: "Tudor.jpeg", immagineAtk: "Tudor_atk.jpeg",
        mossaLvl1: "Scoreggia", mossaLvl2: "Sono un tuo superiore", mossaLvl3: "Lancio di tessera", boss: true
    },
    { 
        nome: "Solieri", hpBase: 7, atkBase: 3, defBase: 3, velBase: 1, raritaTipo: "raro", immagine: "Solieri.jpeg", immagineAtk: "Solieri_atk.jpeg",
        mossaLvl1: "Isolamento", mossaLvl2: "Bestemmia", mossaLvl3: "Battuta di merda", boss: true
    },
    { 
        nome: "Donato", hpBase: 5, atkBase: 5, defBase: 2, velBase: 2, raritaTipo: "raro", immagine: "Donato.jpeg", immagineAtk: "Donato_atk.jpeg",
        mossaLvl1: "Falco rispondi!", mossaLvl2: "Da ora sei il suo referente", mossaLvl3: "50KG di alzate laterali", boss: true
    },
    { 
        nome: "Venturini", hpBase: 3, atkBase: 3, defBase: 5, velBase: 6, raritaTipo: "epico", immagine: "Venturini.jpeg", immagineAtk: "Venturini_atk.jpeg",
        mossaLvl1: "Uscita da Tesla", mossaLvl2: "Pelata accecante", mossaLvl3: "Camminata finocchia", boss: false
    },
    { 
        nome: "Carra", hpBase: 3, atkBase: 6, defBase: 3, velBase: 5, raritaTipo: "epico", immagine: "Carra.jpeg", immagineAtk: "Carra_atk.jpeg",
        mossaLvl1: "Corso sicurezza", mossaLvl2: "Raccolta di penna", mossaLvl3: "Sniffata", boss: false
    },
    { 
        nome: "Giulio", hpBase: 3, atkBase: 5, defBase: 5, velBase: 4, raritaTipo: "epico", immagine: "Giulio.jpeg", immagineAtk: "Giulio_atk.jpeg",
        mossaLvl1: "Impiccione", mossaLvl2: "Finta di fare chiamata", mossaLvl3: "Imparo a volare", boss: true
    },
    { 
        nome: "Mattia", hpBase: 7, atkBase: 4, defBase: 5, velBase: 1, raritaTipo: "epico", immagine: "Mattia.jpeg", immagineAtk: "Mattia_atk.jpeg",
        mossaLvl1: "Non ti rispondo", mossaLvl2: "Chat GPT", mossaLvl3: "Non sono cazzi miei", boss: false
    },
    { 
        nome: "Paolo", hpBase: 9, atkBase: 4, defBase: 5, velBase: 2, raritaTipo: "leggendario", immagine: "Paolo.jpeg", immagineAtk: "Paolo_atk.jpeg",
        mossaLvl1: "Giovaneehh il telefonoooh", mossaLvl2: "Forfora Beam", mossaLvl3: "Alitata", boss: true
    },
    { 
        nome: "Lanza", hpBase: 10, atkBase: 1, defBase: 9, velBase: 0, raritaTipo: "leggendario", immagine: "Lanza.jpeg", immagineAtk: "Lanza_atk.jpeg",
        mossaLvl1: "Lavata di capo", mossaLvl2: "Precedenza a Cagna", mossaLvl3: "Cago il cazzo", boss: true
    },
    { 
        nome: "DiNicola", hpBase: 6, atkBase: 7, defBase: 4, velBase: 3, raritaTipo: "leggendario", immagine: "DiNicola.jpeg", immagineAtk: "DiNicola_atk.jpeg",
        mossaLvl1: "Stronzata micidiale", mossaLvl2: "Ingegneria fasulla", mossaLvl3: "Urlata in faccia", boss: true
    },
    { 
        nome: "Filippo", hpBase: 5, atkBase: 5, defBase: 7, velBase: 3, raritaTipo: "leggendario", immagine: "Filippo.jpeg", immagineAtk: "Filippo_atk.jpeg",
        mossaLvl1: "Scomparsa", mossaLvl2: "Sì Sì lo faremo", mossaLvl3: "Volere di donna come assistente", boss: true
    },
    { 
        nome: "Nicolas", hpBase: 1, atkBase: 14, defBase: 1, velBase: 1, raritaTipo: "leggendario", immagine: "Nicolas.jpeg", immagineAtk: "Nicolas_atk.jpeg",
        mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: false
    },
    { 
        nome: "Max", hpBase: 6, atkBase: 6, defBase: 2, velBase: 10, raritaTipo: "special", immagine: "Max.jpeg", immagineAtk: "Max_atk.jpeg",
        mossaLvl1: "Nulla di scritto", mossaLvl2: "No Callbell", mossaLvl3: "Tutti al centralino", boss: true
    },
    { 
        nome: "Gio", hpBase: 8, atkBase: 13, defBase: 6, velBase: 8, raritaTipo: "dream team", immagine: "Gio.jpeg", immagineAtk: "Gio_atk.jpeg",
        mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true
    },
    { 
        nome: "Sat", hpBase: 7, atkBase: 15, defBase: 7, velBase: 6, raritaTipo: "dream team", immagine: "Sat.jpeg", immagineAtk: "Sat_atk.jpeg",
        mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true
    },
    { 
        nome: "Kul", hpBase: 6, atkBase: 9, defBase: 6, velBase: 14, raritaTipo: "dream team", immagine: "Kul.jpeg", immagineAtk: "Kul_atk.jpeg",
        mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true
    },
    { 
        nome: "Edo", hpBase: 14, atkBase: 4, defBase: 11, velBase: 5, raritaTipo: "dream team", immagine: "Edo.jpeg", immagineAtk: "Edo_atk.jpeg",
        mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true
    }
];

const CONFIG_RARITA = {
    "comune": { chance: 0.22, colore: "#9e9e9e" },       
    "non comune": { chance: 0.18, colore: "#4caf50" },   
    "raro": { chance: 0.16, colore: "#00bcd4" },         
    "epico": { chance: 0.14, colore: "#9c27b0" },        
    "leggendario": { chance: 0.12, colore: "#ffeb3b" },   
    "special": { chance: 0.10, colore: "#ff9800" },
    "dream team": {chance: 0.08, colore: "#ff0000"}   
};

const CONFIG_MOSSE = {
    1: 1.0,  
    2: 1.3,  
    3: 1.7   
};


/*
1 Fabian
2 Esoli
3 Donato
4 Giulio
5 Paolo
6 Di Nicola
7 Lanza
8 Filippo
const ATTRIBUTI = {
    f,
    a,
    e
};
*/
const ARCHIVIO_BOSS = {
    "1": {
        nome: "TUDOR",
        immagine: "TudorULT.png",
        soundtrack: "SongTudorULT.mpeg",
        squadra: [{ nome: "Tudor", livello: 12 }]
    },
    "2": {
        nome: "SOLIERI",
        immagine: "SolieriULT.png",
        soundtrack: "SongSolieriULT.mp3",
        squadra: [{ nome: "Solieri", livello: 22 }]
    },
    "3": {
        nome: "DONATO",
        immagine: "DonatoULT.png",
        soundtrack: "SongDonatoULT.mp3",
        squadra: [{ nome: "Donato", livello: 32 }]
    },
    "4": {
        nome: "GIUILIO",
        immagine: "GiulioULT.png",
        soundtrack: "SongGiulioULT.mp3",
        squadra: [{ nome: "Giulio", livello: 42 }]
    },
    "5": {
        nome: "BOVI",
        immagine: "PaoloULT.png",
        soundtrack: "SongPaulULT.mpeg",
        squadra: [{ nome: "Paolo", livello: 52 }]
    },
    "6": {
        nome: "INGEGNERE DI ALTO LIVELLO, DI NICOLA",
        immagine: "DiNicolaULT.png",
        soundtrack: "SongDiNicolaULT.mp3",
        squadra: [{ nome: "DiNicola", livello: 62 }]
    },
    "7": {
        nome: "LANZALOTTA",
        immagine: "LanzaULT.png",
        soundtrack: "SongLanzaULT.mp3",
        squadra: [{ nome: "Lanza", livello: 72 }]
    },
    "8": {
        nome: "FILIPPO GODZILLA",
        immagine: "FilippoULT.png",
        soundtrack: "SongFilippoULT.mp3",
        squadra: [{ nome: "Filippo", livello: 82 }]
    },

    //incredibili 4
    "9": {
        nome: "KUL, PECCATO D'ACCIDIA",
        immagine: "KulULT.png",
        soundtrack: "SongKulULT.mp3",
        squadra: [{ nome: "Kul", livello: 90 }]
    },
    "10": {
        nome: "GIO, PECCATO D'IRA",
        immagine: "GioULT.png",
        soundtrack: "SongGioULT.mp3",
        squadra: [{ nome: "Gio", livello: 90 }]
    },
    "11": {
        nome: "SAT, PECCATO DI SUPERBIA",
        immagine: "SatULT.png",
        soundtrack: "SongSatULT.mp3",
        squadra: [{ nome: "Sat", livello: 90 }]
    },
    "12": {
        nome: "EDO, PECCATO DI LUSSURIA",
        immagine: "EdoULT.png",
        soundtrack: "SongEdoULT.mp3",
        squadra: [{ nome: "Edo", livello: 90 }]
    },
    "13": {
        nome: "MAX, IL PRIMO PECCATORE",
        immagine: "MaxULT.png",
        soundtrack: "SongMaxULT.mp3",
        squadra: [{ nome: "Max", livello: 95 }]
    },

};

const ARCHIVIO_MAPPE = {
    "mappa1": {
        sfondo: "1.png",
        livelloMin: 1,
        livelloMaxRelativo: 5,  // Massimo fino a metà mappa
        livelloMaxMassimo: 10,   // Massimo nella seconda metà
        mossaMin: 1,
        mossaMaxRel: 1,         // Fino a metà mappa escono mosse solo a liv 1
        mossaMaxMax: 2,         // Nella seconda metà possono uscire mosse di liv 1 o 2
        idBoss: "1"              // Tudor
    },
    "mappa2": {
        sfondo: "2.png",
        livelloMin: 10,
        livelloMaxRelativo: 15,
        livelloMaxMassimo: 20,
        mossaMin: 1,
        mossaMaxRel: 2,         // Nella prima metà mosse liv 1 o 2
        mossaMaxMax: 2,         // Nella seconda metà mosse fisse a liv 2 (min 2, max 2)
        idBoss: "2"              // Solieri
    },
    "mappa3": {
        sfondo: "3.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 1,
        mossaMaxRel: 2,
        mossaMaxMax: 3,         // Inizia a comparire il livello mossa 3 nella seconda metà
        idBoss: "3"              // Bovi (Paolo)
    },
    "mappa4": {
        sfondo: "4.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 2,
        mossaMaxMax: 3,
        idBoss: "4"
    },
    "mappa5": {
        sfondo: "5.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "5"
    },
    "mappa6": {
        sfondo: "6.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "6"
    },
    "mappa7": {
        sfondo: "7.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 2,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "7"
    },
    "mappa8": {
        sfondo: "8.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,         // Mosse fisse al livello 3
        idBoss: "8"
    },
    "mappa9": {
        sfondo: "9.png",
        livelloMin: 20,
        livelloMaxRelativo: 25,
        livelloMaxMassimo: 30,
        mossaMin: 3,
        mossaMaxRel: 3,
        mossaMaxMax: 3,
        idBoss: "13"
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

// ==============================================================================

let miaSquadra = [];
let mioPokemon;      
let nemiciIncontro = []; 
let nemicoPokemon;   
let isBossFight = false;
const schemaAlbero = [1, 2, 3, 4, 3, 4, 3, 2, 1]; 
let pianoAttuale = 0;     
let nodoSceltoAttuale = 0; 
let mappaEventi = {}; 
let isSkipAttivo = false;
let isAutoskipAbilitato = false;
let volumePrecedente = 0.5;
let indicePokemonInDettaglio = null; 

function creaPokemon(infoBase, livello, livelloMossa = 1) {
    let moltiplicatore = 1 + (livello - 1) * 0.2;               //Cambiando 0.2 (che significa +20% di statistiche per ogni livello oltre il primo), puoi rendere la crescita più o meno ripida.
    let hpMax = Math.round(infoBase.hpBase * moltiplicatore);
    let atk = Math.round(infoBase.atkBase * moltiplicatore);
    let def = Math.round(infoBase.defBase * moltiplicatore);
    let vel = Math.round(infoBase.velBase * moltiplicatore);
    
    return {
        nome: infoBase.nome,
        livello: livello,
        livelloMossa: livelloMossa, 
        hpMax: hpMax,
        hpAttuali: hpMax,
        atk: atk,
        def: def,
        vel: vel,
        raritaTipo: infoBase.raritaTipo,
        immagine: infoBase.immagine, 
        immagineAtk: infoBase.immagineAtk,
        mossaLvl1: infoBase.mossaLvl1,
        mossaLvl2: infoBase.mossaLvl2,
        mossaLvl3: infoBase.mossaLvl3,
        infoBase: infoBase,
        colore: CONFIG_RARITA[infoBase.raritaTipo]?.colore || "#ffe066"
    };
}

function getNomeMossaAttuale(p) {
    if (p.livelloMossa === 3) return p.mossaLvl3;
    if (p.livelloMossa === 2) return p.mossaLvl2;
    return p.mossaLvl1;
}

function aggiornaStatsLivello(p, nuoviLivelli) {
    let vecchiaHpMax = p.hpMax;
    p.livello += nuoviLivelli;
    let moltiplicatore = 1 + (p.livello - 1) * 0.2;
    p.hpMax = Math.round(p.infoBase.hpBase * moltiplicatore);
    p.atk = Math.round(p.infoBase.atkBase * moltiplicatore);
    if (p.hpAttuali > 0) {
        p.hpAttuali += (p.hpMax - vecchiaHpMax);
    }
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

function pescaPokemonCasuale(esclusioniNomi = []) {
    const pesi = {
        "comune": 22,
        "non comune": 18,
        "raro": 16,
        "epico": 14,
        "leggendario": 12,
        "special": 10,
        "dream team": 8
    };

    // FILTRO: Esclude i boss E i Pokémon già estratti in questa tornata
    const pokemonDisponibili = pokemonDatabase.filter(p => p.boss === false && !esclusioniNomi.includes(p.nome));

    // Fallback di sicurezza: se per qualche motivo abbiamo escluso tutti, ignoriamo le esclusioni
    const pool = pokemonDisponibili.length > 0 ? pokemonDisponibili : pokemonDatabase.filter(p => p.boss === false);

    let pesoTotale = 0;
    pool.forEach(p => {
        pesoTotale += pesi[p.raritaTipo] || 1;
    });

    let random = Math.random() * pesoTotale;
    let parziale = 0;

    for (let p of pool) {
        parziale += pesi[p.raritaTipo] || 1;
        if (random <= parziale) {
            return p;
        }
    }
    return pool[0]; 
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
    mappaEventi = {};
    schemaAlbero.forEach((numNodi, pianoIndex) => {
        if (pianoIndex === 0) return; 
        
        mappaEventi[pianoIndex] = [];
        let centroMedicoInseritoNelPiano = false;

        for (let i = 0; i < numNodi; i++) {
            if (pianoIndex === schemaAlbero.length - 1) {
                // Forziamo il tipo evento su "boss" nell'ultimo piano
                mappaEventi[pianoIndex].push("boss"); 
            } else {
                let r = Math.random();
                let evento;
                
                if (r < 0.40) evento = "cespuglio";
                else if (r < 0.60) evento = "npc";
                else if (r < 0.75) evento = "pokeball";
                else if (r < 0.88) evento = "disco"; 
                else {
                    if (!centroMedicoInseritoNelPiano) {
                        evento = "medico";
                        centroMedicoInseritoNelPiano = true;
                    } else {
                        evento = "cespuglio";
                    }
                }
                mappaEventi[pianoIndex].push(evento);
            }
        }
    });
}

function isFiglioValido(pianoPadre, indexPadre, indexFiglio) {
    if (pianoPadre === 0) return true; 

    let nodiPadre = schemaAlbero[pianoPadre];
    let nodiFiglio = schemaAlbero[pianoPadre + 1]; 

    if (nodiFiglio > nodiPadre) {
        return indexFiglio === indexPadre || indexFiglio === indexPadre + 1;
    } else if (nodiFiglio < nodiPadre) {
        return indexFiglio === indexPadre || indexFiglio === indexPadre - 1;
    } else {
        return indexFiglio === indexPadre;
    }
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
                radice.innerText = "START";
                divPiano.appendChild(radice);
            } else {
                let tipoEvento = mappaEventi[pianoIndex][i];
                let bottone = document.createElement("button");
                bottone.className = `nodo-bottone evento-${tipoEvento}`;
                
                if (pianoIndex === pianoAttuale + 1 && isFiglioValido(pianoAttuale, nodoSceltoAttuale, i)) {
                    bottone.classList.add("nodo-selezionabile");
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
    disegnaLineeMappa();
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
    
    if (tipoEvento === "medico") {
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
    else if (tipoEvento === "pokeball") {
        cambiaSchermata("schermata-mappa", "schermata-selezione");
        document.getElementById("titolo-selezione").innerText = "Una Pokéball! Scegli un personaggio da unire alla squadra";
        generaOpzioniPokemon(3, false);
    } 
    else if (tipoEvento === "disco") {
        apriSchermataDiscoMossa();
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
    nemiciIncontro = [];
    
    // Ottiene la configurazione dei livelli basata sulla mappa attuale e sul piano attuale
    let configGenerata = calcolaLivelloEMossaMappa(pianoAttuale);
    let livNemico = configGenerata.livello;
    let livMossaNemico = configGenerata.livelloMossa;
    
    if (tipoEvento === "cespuglio") {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
    } else {
        let quantiNemici = pianoAttuale <= 5 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < quantiNemici; i++) {
            nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
        }
    }
    
    nemicoPokemon = nemiciIncontro.shift(); 

    if (!mandaInCampoMioPokemon()) return;

    // CAMBIO DELLO SFONDO DINAMICO: Applica lo sfondo della mappa alla schermata di gioco
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
        document.getElementById("nome-giocatore").innerHTML = `${mioPokemon.nome} <span class="lvl-tag">Lvl.${mioPokemon.livello}</span><br><span class="mossa-tag">Mossa: ${getNomeMossaAttuale(mioPokemon)}</span>`;
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
        document.getElementById("nome-nemico").innerHTML = `${nemicoPokemon.nome} <span class="lvl-tag">Lvl.${nemicoPokemon.livello}</span><br><span class="mossa-tag">Mossa: ${getNomeMossaAttuale(nemicoPokemon)}</span>`;
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

function turnoGiocatore() {
    if (document.getElementById("btn-attacco").disabled) return;
    document.getElementById("btn-attacco").disabled = true;

    document.getElementById("img-giocatore").src = mioPokemon.immagineAtk;

    let durataAttacco = isSkipAttivo ? 750 : 1500; 
    let pausaSuccessiva = isSkipAttivo ? 500 : 1000;

    setTimeout(() => {
        document.getElementById("img-giocatore").src = mioPokemon.immagine;

        let moltiplicatoreMossaMio = CONFIG_MOSSE[mioPokemon.livelloMossa] || 1.0;
        let dannoGrezzo = Math.round(mioPokemon.atk * moltiplicatoreMossaMio);
        let dannoFatto = Math.max(1, dannoGrezzo - nemicoPokemon.def);
        
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoFatto);
        
        document.getElementById("console-log").innerHTML = `${mioPokemon.nome} usa <strong>${getNomeMossaAttuale(mioPokemon)}</strong> ed infligge ${dannoFatto} danni!`;
        aggiornaGrafica();

        if (nemicoPokemon.hpAttuali <= 0) {
            if (nemiciIncontro.length > 0) {
                setTimeout(() => {
                    nemicoPokemon = nemiciIncontro.shift();
                    document.getElementById("console-log").innerHTML = `Nemico Sconfitto! Entra ${nemicoPokemon.nome}!`;
                    aggiornaGrafica();
                    
                    if (nemicoPokemon.vel > mioPokemon.vel) {
                        setTimeout(turnoNemico, durataAttacco);
                    } else {
                        document.getElementById("btn-attacco").disabled = false;
                    }
                }, pausaSuccessiva);
            } else {
                gestisciVittoriaIncontro();
            }
            return;
        }
        setTimeout(turnoNemico, pausaSuccessiva);
    }, durataAttacco);
}

function turnoNemico() {
    if (!nemicoPokemon || nemicoPokemon.hpAttuali <= 0 || !mioPokemon) return;

    if (nemicoPokemon.immagineAtk) {
        document.getElementById("img-nemico").src = nemicoPokemon.immagineAtk;
    }

    let durataAttacco = isSkipAttivo ? 750 : 1500;

    setTimeout(() => {
        if (!mioPokemon) return;

        document.getElementById("img-nemico").src = nemicoPokemon.immagine;

        let moltiplicatoreMossaNemico = CONFIG_MOSSE[nemicoPokemon.livelloMossa] || 1.0;
        let dannoGrezzoNemico = Math.round(nemicoPokemon.atk * moltiplicatoreMossaNemico);
        let dannoSubito = Math.max(1, dannoGrezzoNemico - mioPokemon.def);
        
        mioPokemon.hpAttuali = Math.max(0, mioPokemon.hpAttuali - dannoSubito);
        
        document.getElementById("console-log").innerHTML = `${nemicoPokemon.nome} risponde con <strong>${getNomeMossaAttuale(nemicoPokemon)}</strong> facendo ${dannoSubito} danni!`;
        aggiornaGrafica();

        if (mioPokemon.hpAttuali <= 0) {
            document.getElementById("console-log").innerHTML = `${mioPokemon.nome} è esausto!`;
            let pokemonDisponibile = mandaInCampoMioPokemon(); 
            
            if (pokemonDisponibile) {
                document.getElementById("console-log").innerHTML += `<br>Entra in campo ${mioPokemon.nome}!`;
                document.getElementById("btn-attacco").disabled = false;
            } else {
                document.getElementById("btn-attacco").disabled = true;
                return; 
            }
        } else {
            document.getElementById("btn-attacco").disabled = false;
        }
    }, durataAttacco);
}

function gestisciVittoriaIncontro() {
    let tipoEventoEseguito = mappaEventi[pianoAttuale][nodoSceltoAttuale]; 
    let livelliGuadagnati = (tipoEventoEseguito === "cespuglio") ? 1 : 2;

    miaSquadra.forEach(p => aggiornaStatsLivello(p, livelliGuadagnati));
    riproduciMusica("Victory.mp3");
    document.getElementById("console-log").innerHTML = `<strong>Vittoria Incontro!</strong> Tutta la squadra guadagna +${livelliGuadagnati} Livelli!`;
    document.getElementById("btn-attacco").style.display = "none";
    
    if (pianoAttuale === schemaAlbero.length - 1) {
        document.getElementById("console-log").innerHTML = `<strong>COMPLIMENTI!</strong> Hai completato la mappa e annientato il Boss Finale!`;
    } else {
        document.getElementById("btn-torna-mappa").style.display = "inline-block";
    }
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

    document.getElementById("dettaglio-nome").innerText = p.nome;
    document.getElementById("dettaglio-rarita").innerText = `(${p.raritaTipo.toUpperCase()})`;
    document.getElementById("dettaglio-livello").innerText = p.livello;
    document.getElementById("dettaglio-hp").innerText = `${p.hpAttuali}/${p.hpMax}`;
    document.getElementById("dettaglio-atk").innerText = p.atk;
    document.getElementById("dettaglio-def").innerText = p.def;
    document.getElementById("dettaglio-vel").innerText = p.vel;
    document.getElementById("dettaglio-mossa").innerText = getNomeMossaAttuale(p);
    document.getElementById("dettaglio-img").src = p.immagine;

    let scheda = document.querySelector(".info-scheda-dettaglio");
    if (scheda) {
        scheda.style.backgroundColor = p.colore || "#f5f6fa";
    }

    let selectPos = document.getElementById("select-posizione");
    if (selectPos) {
        selectPos.innerHTML = ""; 
        miaSquadra.forEach((_, i) => {
            let opt = document.createElement("option");
            opt.value = i;
            opt.innerText = `${i + 1}° Posto ${i === 0 ? "(In Campo)" : ""}`;
            if (i === index) opt.selected = true; 
            selectPos.appendChild(opt);
        });
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
    const svg = document.getElementById("mappa-collegamenti");
    if (!svg) return;
    svg.innerHTML = "";

    const nodiPiani = document.querySelectorAll("#albero-container .piano");
    const svgRect = svg.getBoundingClientRect();

    for (let p = 0; p < nodiPiani.length - 1; p++) {
        const bottoniPadre = nodiPiani[p].querySelectorAll(".nodo-bottone, .radice-mappa");
        const bottoniFiglio = nodiPiani[p + 1].querySelectorAll(".nodo-bottone");

        bottoniPadre.forEach((padre, idxPadre) => {
            const padreRect = padre.getBoundingClientRect();
            const x1 = padreRect.left + padreRect.width / 2 - svgRect.left;
            const y1 = padreRect.top + padreRect.height / 2 - svgRect.top;

            bottoniFiglio.forEach((figlio, idxFiglio) => {
                if (isFiglioValido(p, idxPadre, idxFiglio)) {
                    const figlioRect =Access = figlio.getBoundingClientRect();
                    const x2 = figlioRect.left + figlioRect.width / 2 - svgRect.left;
                    const y2 = figlioRect.top + figlioRect.height / 2 - svgRect.top;

                    const èIlPercorsoAttivo = (p === pianoAttuale && idxPadre === nodoSceltoAttuale);
                    const coloreLinea = èIlPercorsoAttivo ? "#ffcc00" : "#222"; 
                    const spessore = èIlPercorsoAttivo ? "2.5" : "1.5";

                    const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    linea.setAttribute("x1", x1);
                    linea.setAttribute("y1", y1);
                    linea.setAttribute("x2", x2);
                    linea.setAttribute("y2", y2);
                    linea.setAttribute("stroke", coloreLinea);
                    linea.setAttribute("stroke-width", spessore);
                    linea.setAttribute("stroke-dasharray", "4,5");

                    svg.appendChild(linea);
                }
            });
        });
    }
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
                    <span class="rarita-pkm">[${pBase.raritaTipo.toUpperCase()}]</span>
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
    // SE IL GIOCO CERCA ANCORA IL VECCHIO ID, LO PORTIAMO AUTOMATICAMENTE AL NUMERO 5 (BOVI)
    if (idBoss === "boss_finale") {
        idBoss = "5";
    }
    const datiBoss = ARCHIVIO_BOSS[idBoss];
    if (!datiBoss) {
        console.error("Boss non trovato nell'archivio:", idBoss);
        return;
    }

    isBossFight = true; // Attiviamo il flag del Boss

    nemiciIncontro = [];
    datiBoss.squadra.forEach(pBoss => {
        let base = pokemonDatabase.find(p => p.nome.toLowerCase() === pBoss.nome.toLowerCase());
        if (base) {
            let lvl = pBoss.livello;
            nemiciIncontro.push({
                nome: base.nome,
                livello: lvl,
                hpMax: base.hpBase + (lvl * 5),
                hpAttuali: base.hpBase + (lvl * 5),
                atk: base.atkBase + (lvl * 2),
                def: base.defBase + (lvl * 1),
                vel: base.velBase + (lvl * 1),
                immagine: base.immagine,
                immagineAtk: base.immagineAtk || base.immagine,
                mossaLvl1: base.mossaLvl1,
                mossaLvl2: base.mossaLvl2,
                mossaLvl3: base.mossaLvl3,
                mossaLivello: 1 
            });
        }
    });

    nemicoPokemon = nemiciIncontro.shift();

    let nomeFileSenzaEstensione = datiBoss.immagine.substring(0, datiBoss.immagine.lastIndexOf('.'));
    let urlSfondoUlt = nomeFileSenzaEstensione + ".png";

    document.getElementById("img-boss-background").src = urlSfondoUlt;
    
    let divIntroBoss = document.getElementById("intro-boss");
    if (divIntroBoss) divIntroBoss.style.display = "block";

    document.getElementById("console-log").innerHTML = `🚨 Scontro Decisivo! È apparso il Boss: <strong>${datiBoss.nome}</strong>!`;

    // SINCRONIZZAZIONE AUDIO: Fa partire la traccia dopo 800ms (quando la scritta appare a schermo)
    setTimeout(() => {
        if (datiBoss.soundtrack) {
            riproduciMusica(datiBoss.soundtrack);
        }
    }, 800);

    setTimeout(() => {
        if (divIntroBoss) divIntroBoss.style.display = "none";
        
        cambiaSchermata("schermata-mappa", "schermata-gioco");
        document.getElementById("titolo-incontro").innerText = `⚠️ BOSS FIGHT: ${datiBoss.nome} ⚠️`;

        if (!mandaInCampoMioPokemon()) return;
        aggiornaGrafica();

        if (nemicoPokemon.vel > mioPokemon.vel) {
            chiAttaccaPerPrimo = "nemico";
            document.getElementById("console-log").innerHTML = `Il Boss è troppo veloce! ${nemicoPokemon.nome} attacca per primo!`;
            document.getElementById("btn-attacco").disabled = true;
            setTimeout(turnoNemico, 1500); 
        } else {
            chiAttaccaPerPrimo = "giocatore";
            document.getElementById("console-log").innerHTML = `Sei più veloce del Boss! Tocca a ${mioPokemon.nome}.`;
            document.getElementById("btn-attacco").disabled = false;
        }
    }, 3500); // <-- Durata totale della schermata di Intro (3.5 secondi)
}

// SBLOCCO AUDIO RETROATTIVO PER DISPOSITIVI/BROWSER
document.addEventListener("click", function() {
    const audio = document.getElementById("musica-gioco");
    if (audio && (!audio.src || audio.paused) && document.getElementById("schermata-start").classList.contains("attiva")) {
        riproduciMusica("lobby.mp3");
    }
}, { once: true });
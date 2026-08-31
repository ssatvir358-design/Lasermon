const trasformazioniKulViste = new Set();
// ==========================================================
// battaglia.js — Sistema di combattimento
// Dipendenze: stato.js, pokemon_factory.js, schermate.js, audio.js, negozio.js
// ==========================================================

// Helper globale: normalizza il nome cartella/file per gli sprite
const getSpriteName = (nome) => nome ? nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3').replace(/\s+/g, '') : '';

// ==========================================================
// CONFIGURAZIONE LEVEL-UP POST-INCONTRO
// Modifica questi valori per cambiare i livelli guadagnati.
// ==========================================================
const CONFIG_LEVEL_UP = {
    cespuglio: 1,  // +1 livello dopo erba alta
    npc:       2,  // +2 livelli dopo sfida allenatore
    boss:      1   // +1 livello dopo boss
};


// ----------------------------------------------------------
// HELPERS: messaggi efficacia e grafica arena
// ----------------------------------------------------------

function getMessaggioEfficacia(moltiplicatore) {
    if (moltiplicatore === 0) {
        return "<br><span style='color: #ff4757; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255, 71, 87, 0.8); padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>❌ Non ha alcun effetto! (Immunità) ❌</span>";
    }
    if (moltiplicatore > 1) {
        return `<br><span style='color: #2ecc71; font-weight: bold; text-shadow: 0 0 5px rgba(46, 204, 113, 0.6); padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>💥 È superefficace! (x${moltiplicatore}) 💥</span>`;
    }
    if (moltiplicatore < 1) {
        return `<br><span style='color: #f39c12; font-style: italic; opacity: 0.9; padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>🔻 Non è molto efficace... (x${moltiplicatore}) 🔻</span>`;
    }
    return "";
}

function generaHtmlPokeball(conteggio) {
    let html = "";
    for (let i = 0; i < conteggio; i++) {
        html += `<img src="../Sprite/UI/Combattimento/pokeball.png" style="width: 26px; height: 26px; margin-right: 4px; image-rendering: pixelated; vertical-align: middle;">`;
    }
    const vuote = 5 - conteggio;
    for (let i = 0; i < vuote; i++) {
        html += `<div style="display: inline-block; width: 22px; height: 22px; border: 2px solid #718093; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></div>`;
    }
    return html;
}

// Aggiorna tutta la grafica dell'arena (barre HP, nomi, immagini, contatori)
function aggiornaGrafica() {
    function generaStatusEmojiHTML(targetId) {
        let html = "";
        if (effettiAttivi && effettiAttivi[targetId]) {
            let eff = effettiAttivi[targetId];
            if (eff.bruciatura) html += "🔥";
            if (eff.veleno) html += "☠️";
            if (eff.semeSanguisuga) html += "🌱";
            if (eff.paralisi) html += "⚡";
            if (eff.congelamento) html += "❄️";
            if (eff.cecita) html += "🪨";
            if (eff.paura) html += "🌑";
            if (eff.velRidotta) html += "💧";
            if (eff.provocato) html += "😡";
            if (eff.difesaRidotta) html += "✨";
        }
        return html ? `<span style="margin-left: 5px; font-size: 1.2em;">${html}</span>` : "";
    }

    if (mioPokemon) {
        let statusG = generaStatusEmojiHTML("giocatore");
        if (mioPokemon.bruciato && (!effettiAttivi || !effettiAttivi.giocatore || !effettiAttivi.giocatore.bruciatura)) {
            statusG = `<span style="margin-left: 5px; font-size: 1.2em;">🔥</span>` + statusG;
        }

        document.getElementById("nome-giocatore").innerHTML = `
            ${mioPokemon.nome} ${getHtmlElemento(mioPokemon.elemento)} ${statusG}
            <span class="lvl-tag">Lvl.${mioPokemon.livello}</span><br>
            <span class="mossa-tag">Mossa: ${getNomeMossaAttuale(mioPokemon)}</span>
        `;
        document.getElementById("hp-giocatore").innerText = `${mioPokemon.hpAttuali}/${mioPokemon.hpMax}`;

        const pctG = Math.max(0, (mioPokemon.hpAttuali / mioPokemon.hpMax) * 100);
        const barraG = document.getElementById("barra-giocatore");
        if (barraG) {
            barraG.style.width = `${pctG}%`;
            if (pctG <= 20)      barraG.style.backgroundColor = "#ff3838";
            else if (pctG <= 50) barraG.style.backgroundColor = "#ffb300";
            else                  barraG.style.backgroundColor = "#4cd137";
        }

        const vivi = Math.max(0, miaSquadra.filter(p => p.hpAttuali > 0).length - 1);
        document.getElementById("rimanenti-giocatore").innerHTML = generaHtmlPokeball(vivi);
        
        // Evita di resettare lo sprite se è KO
        if (mioPokemon.hpAttuali > 0) {
            document.getElementById("img-giocatore").src = mioPokemon.immagine;
        }
    }

    if (nemicoPokemon) {
        let statusN = generaStatusEmojiHTML("nemico");
        document.getElementById("nome-nemico").innerHTML = `
            ${nemicoPokemon.nome} ${getHtmlElemento(nemicoPokemon.elemento)} ${statusN}
            <span class="lvl-tag">Lvl.${nemicoPokemon.livello}</span><br>
            <span class="mossa-tag">Mossa: ${getNomeMossaAttuale(nemicoPokemon)}</span>
        `;
        document.getElementById("hp-nemico").innerText = `${nemicoPokemon.hpAttuali}/${nemicoPokemon.hpMax}`;

        const pctN = Math.max(0, (nemicoPokemon.hpAttuali / nemicoPokemon.hpMax) * 100);
        const barraN = document.getElementById("barra-nemico");
        if (barraN) {
            barraN.style.width = `${pctN}%`;
            if (pctN <= 20)      barraN.style.backgroundColor = "#ff3838";
            else if (pctN <= 50) barraN.style.backgroundColor = "#ffb300";
            else                  barraN.style.backgroundColor = "#4cd137";
        }

        document.getElementById("rimanenti-nemico").innerHTML = generaHtmlPokeball(nemiciIncontro.length);
        
        // Evita di resettare lo sprite se è KO
        if (nemicoPokemon.hpAttuali > 0) {
            document.getElementById("img-nemico").src = nemicoPokemon.immagine;
        }
    }
}

// Manda in campo il primo Pok\u00e9mon vivo della squadra
function mandaInCampoMioPokemon() {
    mioPokemon = miaSquadra.find(p => p.hpAttuali > 0);

    if (!mioPokemon) {
        riproduciMusica("gameover.mp3");
        document.getElementById("schermata-gioco").style.display = "none";
        document.getElementById("schermata-gameover").style.setProperty("display", "flex", "important");
        return false;
    }

    document.getElementById("schermata-gameover").style.display = "none";
    if (typeof isRunVeloce !== "undefined" && isRunVeloce) {
        document.getElementById("btn-attacco").style.display = "none";
        if (document.getElementById("btn-item")) document.getElementById("btn-item").style.display = "none";
        if (document.getElementById("btn-pokemon")) document.getElementById("btn-pokemon").style.display = "none";
        if (document.getElementById("btn-fuga")) document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
    } else {
        document.getElementById("btn-attacco").style.display = "";
        if (document.getElementById("btn-item")) document.getElementById("btn-item").style.display = "";
        if (document.getElementById("btn-pokemon")) document.getElementById("btn-pokemon").style.display = "";
        if (document.getElementById("btn-fuga")) document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
    }
    document.getElementById("btn-attacco").disabled             = false;
    document.getElementById("img-giocatore").src                = mioPokemon.immagine;
    return true;
}

let isAutoBattlePaused = false;

function togglePausaAutoBattle() {
    isAutoBattlePaused = !isAutoBattlePaused;
    const btn = document.getElementById("btn-pausa-auto-fixed");
    if (isAutoBattlePaused) {
        btn.classList.add("attivo");
        btn.innerHTML = "&#9654; RIPRENDI";
    } else {
        btn.classList.remove("attivo");
        btn.innerHTML = "&#10074;&#10074; PAUSA AUTO";
    }
    
    // Se stavamo aspettando il turno giocatore, sblocchiamo subito i controlli
    if (document.getElementById("btn-pausa-auto-fixed").style.display !== "none") {
        abilitaControlliGiocatore();
    }
}

// ----------------------------------------------------------
// CONTROLLI GIOCATORE
// Abilita i controlli del turno giocatore (attacco + item)
// Da chiamare ogni volta che ritorna il turno al giocatore.
// ----------------------------------------------------------
function abilitaControlliGiocatore() {
    if (typeof isRunVeloce !== "undefined" && isRunVeloce) {
        // Mostra il bottone della pausa
        const btnPausa = document.getElementById("btn-pausa-auto-fixed");
        if (btnPausa) btnPausa.style.display = "block";

        if (!isAutoBattlePaused) {
            // Nascondi pulsanti per sicurezza in Auto-Battle
            document.getElementById("btn-attacco").style.display = "none";
            if (document.getElementById("btn-item")) document.getElementById("btn-item").style.display = "none";
            if (document.getElementById("btn-pokemon")) document.getElementById("btn-pokemon").style.display = "none";
            if (document.getElementById("btn-fuga")) document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
            
            // Sblocca i pulsanti per far funzionare l'auto-attacco e la fuga
            document.getElementById("btn-attacco").disabled = false;
            if (document.getElementById("btn-fuga")) document.getElementById("btn-fuga").disabled = false;

            // Esegui automaticamente il turno con piccolo ritardo
            setTimeout(turnoGiocatore, isSkipAttivo ? 500 : 1000);
            return;
        } else {
            // Se in pausa, mostra i controlli normali
            document.getElementById("btn-attacco").style.display = "";
            if (document.getElementById("btn-item")) document.getElementById("btn-item").style.display = "";
            if (document.getElementById("btn-pokemon")) document.getElementById("btn-pokemon").style.display = "";
            if (document.getElementById("btn-fuga")) document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
        }
    } else {
        const btnPausa = document.getElementById("btn-pausa-auto-fixed");
        if (btnPausa) btnPausa.style.display = "none";
    }

    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-pokemon").disabled = false;
    document.getElementById("btn-fuga").disabled = false;
    resettaItemTurno();      // Resetta il flag "item già usato"
    aggiornaStatoBtnItem();  // Aggiorna stato bottone item
}




// ----------------------------------------------------------
// PREPARAZIONE INCONTRO
// ----------------------------------------------------------

function preparaIncontroBattaglia(tipoEvento, elementoFiltro = null) {
    haUsatoUltGiocatore = false;
    haUsatoUltNemico    = false;
    nemiciIncontro      = [];
    isSkipAttivo        = isAutoskipAbilitato;
    
    // Azzera esplicitamente il log ad ogni nuovo scontro
    const logEl = document.getElementById("console-log");
    if (logEl) logEl.innerHTML = "Scontro iniziato! Preparati alla battaglia.";
    
    // Reset UI per lo skip
    const btnSkipFixed = document.getElementById("btn-skip-fixed");
    if (btnSkipFixed) {
        if (isSkipAttivo) btnSkipFixed.classList.add("attivo");
        else              btnSkipFixed.classList.remove("attivo");
    }

    resettaEffettiAttivi();
    resettaItemFight();   // Azzera tracking item per questo scontro
    resettaPerkFight();   // Azzera tracking perk (salvavita, scudo) per questo scontro
    chiudiPannelloItemBattaglia(); // Assicura che il pannello item sia chiuso

    let livNemico = 1;
    let livMossaNemico = 1;
    const nodoObj = (typeof alberoMappa !== "undefined" && alberoMappa[pianoAttuale] && alberoMappa[pianoAttuale][nodoSceltoAttuale]) 
        ? alberoMappa[pianoAttuale][nodoSceltoAttuale] 
        : null;
        
    if (nodoObj && nodoObj.livello && (tipoEvento === "npc" || tipoEvento === "cespuglio")) {
        livNemico = nodoObj.livello;
        livMossaNemico = nodoObj.livelloMossa || 1;
    } else {
        const configGenerata = calcolaLivelloEMossaMappa(pianoAttuale, tipoEvento);
        livNemico      = configGenerata.livello;
        livMossaNemico = configGenerata.livelloMossa;
    }

    if (tipoEvento === "cespuglio") {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico, true));
    } else if (tipoEvento === "npc") {
        const npcChibiMap = {
            "acqua": "Evren",
            "drago": "Maelis",
            "elettro": "Elyra",
            "erba": "Aster",
            "folletto": "Bob",
            "fuoco": "Soraya",
            "ghiaccio": "Nerys",
            "lotta": "Kit",
            "normale": "Nelly",
            "psico": "Virea",
            "terra": "Mauro",
            "veleno": "Caelum",
            "vento": "Mariel"
        };
        
        const elemento = elementoFiltro ? elementoFiltro.toLowerCase() : "";
        const nomeChibi = npcChibiMap[elemento];
        let pChibi = null;
        
        if (nomeChibi) {
            pChibi = pokemonDatabase.find(p => p.nome.toLowerCase() === nomeChibi.toLowerCase());
        }
        
        if (pChibi) {
            nemiciIncontro.push(creaPokemon(pChibi, livNemico, livMossaNemico, true));
        } else {
            nemiciIncontro.push(creaPokemon(pescaPokemonCasuale([], elementoFiltro), livNemico, livMossaNemico, true));
        }
        
        // Secondo personaggio è casuale, ma escludiamo il chibi appena inserito
        const esclusioni = pChibi ? [pChibi.nome] : [];
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(esclusioni, elementoFiltro), livNemico, livMossaNemico, true));
    } else if (tipoEvento === "miniboss") {
        let numMappa = 1;
        if (typeof mappaAttuale !== "undefined" && mappaAttuale.startsWith("mappa")) {
            numMappa = parseInt(mappaAttuale.replace("mappa", "")) || 1;
        }
        // Nomi esatti dal DB (senza suffisso F1 — le versioni base si chiamano semplicemente col nome)
        let idMiniboss = "Maccioni";
        if (numMappa === 2) idMiniboss = Math.random() < 0.5 ? "Danilo" : "Graziani";
        else if (numMappa === 4) idMiniboss = "Mattia";
        else if (numMappa === 6) idMiniboss = "Savina";
        else if (numMappa === 8) idMiniboss = "Maccioni";
        
        let mb = creaPokemon(idMiniboss, livNemico, livMossaNemico, true);
        if (!mb) mb = creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico, true);
        mb.isMiniboss = true;
        mb.inFase2 = false;
        nemiciIncontro.push(mb);
    } else {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico, true));
    }

    nemicoPokemon = nemiciIncontro.shift();
    if (!mandaInCampoMioPokemon()) return;

    // Sfondo dinamico
    const schermataGioco = document.getElementById("schermata-gioco");
    if (schermataGioco && ARCHIVIO_MAPPE[mappaAttuale]) {
        // Applica sfondo specifico della mappa al combattimento
        schermataGioco.style.backgroundImage    = `url('${ARCHIVIO_MAPPE[mappaAttuale].sfondoBattaglia}')`;
        schermataGioco.style.backgroundSize    = "cover";
        schermataGioco.style.backgroundPosition = "center";
    }

    // Animazione VS pre-battaglia
    const divVS    = document.getElementById("intro-vs");
    const imgVSGio = document.getElementById("img-vs-giocatore");
    const imgVSNem = document.getElementById("img-vs-nemico");
    const testoVS  = document.querySelector(".scritta-vs");
    const latoGio  = document.querySelector(".lato-giocatore");
    const latoNem  = document.querySelector(".lato-nemico");

    function getVsImgPath(p) {
        if (!p) return "";
        if (p.immagineVS) return p.immagineVS;
        if (p.immagine) {
            const lastSlash = p.immagine.lastIndexOf('/');
            if (lastSlash !== -1) {
                const folder = p.immagine.substring(0, lastSlash);
                const folderName = folder.substring(folder.lastIndexOf('/') + 1);
                return `${folder}/${folderName}VS.png`;
            }
        }
        const f = getSpriteName(p.nome);
        return `../Sprite/personaggi/${f}/${f}VS.png`;
    }

    imgVSGio.onerror = function() { if (this.src.endsWith('.png')) this.src = this.src.replace('.png', '.jpeg'); };
    imgVSNem.onerror = function() { if (this.src.endsWith('.png')) this.src = this.src.replace('.png', '.jpeg'); };

    imgVSGio.src = getVsImgPath(mioPokemon);
    imgVSNem.src = getVsImgPath(nemicoPokemon);

    latoGio.classList.remove("entra");
    latoNem.classList.remove("entra");
    testoVS.classList.remove("attiva");
    document.querySelector(".sfondo-vs-custom").classList.remove("attiva");
    divVS.style.display = "block";

    setTimeout(() => {
        latoGio.classList.add("entra");
        latoNem.classList.add("entra");
        testoVS.classList.add("attiva");
        document.querySelector(".sfondo-vs-custom").classList.add("attiva");
    }, 50);

    setTimeout(() => {
        document.querySelector(".sfondo-vs-custom").classList.remove("attiva");
        divVS.style.display = "none";
        cambiaSchermata("schermata-mappa", "schermata-gioco");
        mandaInCampoMioPokemon();
        aggiornaGrafica();

        if (nemicoPokemon.vel > mioPokemon.vel) {
            chiAttaccaPerPrimo = "nemico";
            document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `Il nemico \u00e8 pi\u00f9 veloce! ${nemicoPokemon.nome} attacca per primo!`;
            document.getElementById("btn-attacco").disabled = true;
            document.getElementById("btn-pokemon").disabled = true;
            document.getElementById("btn-fuga").disabled = true;
            aggiornaStatoBtnItem();
            setTimeout(turnoNemico, 1500);
        } else {
            chiAttaccaPerPrimo = "giocatore";
            document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + tipoEvento === "cespuglio"
                ? `Un ${nemicoPokemon.nome} selvatico appare!`
                : `L'allenatore manda in campo ${nemicoPokemon.nome}!`;
            abilitaControlliGiocatore();
        }
    }, 2000);
}


// ----------------------------------------------------------
// TURNO GIOCATORE
// ----------------------------------------------------------

function turnoGiocatore() {
    if (!mioPokemon) return;
    
    if (processaEffettiInizioTurno(mioPokemon, false)) {
        // Salta il turno
        processaEffettiFineTurno(mioPokemon, false);
        if (mioPokemon.hpAttuali <= 0 || nemicoPokemon.hpAttuali <= 0) {
            if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
            if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
        } else {
            setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
        }
        return;
    }
    if (document.getElementById("btn-attacco").disabled) return;
    document.getElementById("btn-attacco").disabled = true;
    document.getElementById("btn-pokemon").disabled = true;
    document.getElementById("btn-fuga").disabled = true;
    aggiornaStatoBtnItem(); // Disabilita item button mentre attacca

    // Controlla ULT bombers (5% prob)
    if (mioPokemon.raritaTipo === "bombers" && !haUsatoUltGiocatore && Math.random() <= 0.05) {
        haUsatoUltGiocatore = true;
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `\u26a0\ufe0f ${mioPokemon.nome} accumula un'energia devastante...`;
        eseguiAnimazioneUlt(mioPokemon, "img-giocatore", () => {
            calcolaEdEseguiDannoGiocatore(3.0, mioPokemon.mossaULT || "ULTIMATE");
        });
        return;
    }

    // Attacco normale
    eseguiAnimazioneAttaccoNormale(mioPokemon, true, () => {
        const moltMossa = CONFIG_MOSSE[mioPokemon.livelloMossa] || 1.0;
        calcolaEdEseguiDannoGiocatore(moltMossa, getNomeMossaAttuale(mioPokemon));
    });
}


// ----------------------------------------------------------
// CALCOLO DANNO GIOCATORE \u2192 NEMICO
// ----------------------------------------------------------

function calcolaEdEseguiDannoGiocatore(moltMossa, nomeMossaUsata) {
    if (nemicoPokemon.isInvulnerable) {
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `🛡️ L'attacco rimbalza! Il nemico è invulnerabile!`;
        setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
        return;
    }

    const moltiplicatoreTipo = CONFIG_DEBOLEZZE[mioPokemon.elemento.toLowerCase()]?.[nemicoPokemon.elemento.toLowerCase()] ?? 1.0;

    // --- SCHIVATA NEMICO ---
    const isUlt = moltMossa >= 3.0;
    let schivataNemica = calcolaSchivata(nemicoPokemon);
    if (nemicoPokemon.boss && nemicoPokemon.nome.toLowerCase() === "kul" && nemicoPokemon.kulForm === "gattino") {
        schivataNemica = 70;
    }
    if (!isUlt && schivataNemica > 0 && Math.random() * 100 < schivataNemica) {
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `\u{1f4a8} ${nemicoPokemon.nome} <strong>schiva l'attacco!</strong> (${schivataNemica}% schivata)`;
        
        processaEffettiFineTurno(mioPokemon, false);
        if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
            if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
            if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
        } else {
            setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
        }
        return;
    }

    // Identifica se l'attacco \u00e8 fisico o speciale in base alla statistica maggiore del giocatore
    const isSpecial = mioPokemon.atkSpec > mioPokemon.atk;
    
    // ATK/ATKSPEC giocatore modificato da eventuale buff temporaneo (Contratto Determinato)
    // e DEF/DEFSPEC nemico modificata da eventuale debuff (LUCE Lv3)
    let atkEffettivo = 0;
    let defEffettiva = 0;
    
    if (isSpecial) {
        atkEffettivo = calcolaStatConEffetti(mioPokemon.atkSpec, null, effettiAttivi.giocatore.atkBoost);
        defEffettiva = calcolaStatConEffetti(nemicoPokemon.defSpec, effettiAttivi.nemico.defRidotta, null);
    } else {
        atkEffettivo = calcolaStatConEffetti(mioPokemon.atk, null, effettiAttivi.giocatore.atkBoost);
        defEffettiva = calcolaStatConEffetti(nemicoPokemon.def, effettiAttivi.nemico.defRidotta, null);
    }

    // --- PERK SFONDAMENTO ---
    if (mioPokemon.perkId === "sfondamento") {
        defEffettiva = Math.round(defEffettiva * (1 - CONFIG_PERK.sfondamentoPercTier1));
    } else if (mioPokemon.perkId === "sfondamento_2") {
        defEffettiva = Math.round(defEffettiva * (1 - CONFIG_PERK.sfondamentoPercTier2));
    }

    // Calcolo Danno Base
    const dannoBase = (atkEffettivo * atkEffettivo) / (atkEffettivo + defEffettiva);
    
    // Modificatori buff/debuff
    let modDanno = 1.0;
    if (effettiAttivi.giocatore.difesaRidotta) modDanno -= effettiAttivi.giocatore.difesaRidotta.percentuale;
    if (effettiAttivi.nemico.provocato) modDanno += effettiAttivi.nemico.provocato.percentuale;
    
    let dannoFatto = Math.round(dannoBase * moltiplicatoreTipo * moltMossa * modDanno);
    if (dannoFatto < 1 && moltiplicatoreTipo > 0) dannoFatto = 1;

    // --- MECCANICHE EDO (Gyatt) ---
    if (nemicoPokemon.boss && nemicoPokemon.nome.toLowerCase() === "edo") {
        if (dannoFatto > 0) {
            nemicoPokemon.attacchiSubitiEdo = (nemicoPokemon.attacchiSubitiEdo || 0) + 1;
            
            // Para il 10% dei danni
            const dannoParato = Math.round(dannoFatto * 0.10);
            dannoFatto -= dannoParato;
            
            // Assorbe il 5% del danno (Life Steal)
            const cura = Math.max(1, Math.round(dannoFatto * 0.05));
            nemicoPokemon.hpAttuali = Math.min(nemicoPokemon.hpMax, nemicoPokemon.hpAttuali + cura);
            
            document.getElementById("console-log").innerHTML += `<br>\u{1f351} Il GYATT di Edo assorbe il colpo! (-${dannoParato} danni, +${cura} HP). Cariche: ${nemicoPokemon.attacchiSubitiEdo}/5`;
        }
    }

    // Decrementa boost ATK temporaneo (Contratto Determinato) dopo l'attacco
    if (effettiAttivi.giocatore.atkBoost) {
        effettiAttivi.giocatore.atkBoost.durata--;
        if (effettiAttivi.giocatore.atkBoost.durata <= 0) {
            effettiAttivi.giocatore.atkBoost = null;
        }
    }

    // Rimuove scudo nemico se presente
    if (nemicoPokemon.scudoPassivo > 0) {
        dannoFatto = 0;
        nemicoPokemon.scudoPassivo = 0;
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `\u{1f6e1}\ufe0f ${nemicoPokemon.nome} usa il suo Scudo per bloccare l'attacco!`;
        aggiornaGrafica();
    } else {
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoFatto);
        const msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `${mioPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoFatto} danni!${msgEfficacia}`;
        aggiornaGrafica();
    }

    // --- PERK DOPPIO ATTACCO ---
    const probDoppio = mioPokemon.perkId === "doppio_attacco_2"
        ? CONFIG_PERK.doppioAttaccoProbTier2
        : mioPokemon.perkId === "doppio_attacco"
            ? CONFIG_PERK.doppioAttaccoProbTier1
            : 0;
    if (probDoppio > 0 && Math.random() < probDoppio && nemicoPokemon.hpAttuali > 0 && nemicoPokemon.scudoPassivo === 0) {
        const dannoSecondo = Math.max(1, Math.round(dannoFatto * CONFIG_PERK.doppioAttaccoDannoPerc));
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoSecondo);
        document.getElementById("console-log").innerHTML +=
            `<br>\u2694\ufe0f <strong>Doppio Attacco!</strong> Secondo colpo: ${dannoSecondo} danni!`;
        aggiornaGrafica();
    }

    let msgEffettiLv3 = "";
    if (mioPokemon.livelloMossa >= 3 && Math.random() < 0.30) {
        msgEffettiLv3 = applicaEffettoElementaleLv3(mioPokemon, nemicoPokemon, mioPokemon.elemento);
    }
    if (msgEffettiLv3 !== "") {
        document.getElementById("console-log").innerHTML += msgEffettiLv3;
        aggiornaGrafica();
    }

    processaEffettiFineTurno(mioPokemon, false);
    
    // Controlla trigger Fase 2 Nemico (Boss e Miniboss)
    if ((nemicoPokemon.isMiniboss || nemicoPokemon.boss) && !nemicoPokemon.inFase2 && nemicoPokemon.hpAttuali > 0 && nemicoPokemon.hpAttuali <= (nemicoPokemon.hpMax / 2)) {
        if (attivaFase2MiniBoss()) {
            return; // Interrompe il normale flusso (la fase 2 gestirà il proseguo)
        }
    }

    // Controlla trigger fase Challenge (es. Reo Fase 2 -> Fase 3 al 60% HP)
    if (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) {
        if (typeof controllaTriggerChallenge === 'function' && controllaTriggerChallenge()) {
            return; // Il cambio fase gestisce il proseguo
        }
    }
    
    if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
        if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
        if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
    } else {
        setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
    }
}

function attivaFase2MiniBoss() {
    let idF2 = null;
    let videoTrasformazione = null;
    if (nemicoPokemon.nome === "Maccioni") idF2 = "Maccioni F2";
    else if (nemicoPokemon.nome === "Savina") {
        idF2 = "Savina F2";
        videoTrasformazione = "../Sprite/personaggi/Savina/SavinaULT.mp4";
    }
    else if (nemicoPokemon.nome === "Mattia") idF2 = "Mattia F2";
    else if (nemicoPokemon.nome === "Danilo") idF2 = "Danilo F2";
    else if (nemicoPokemon.nome === "DiNicola") {
        idF2 = "DiNicola F2";
        videoTrasformazione = "../Sprite/personaggi/DiNicola/DiNicolaULT.mp4";
    }
    
    if (!idF2) return false; // Graziani o altri senza F2
    
    // Crea il nuovo pokemon F2
    let f2 = creaPokemon(idF2, nemicoPokemon.livello, nemicoPokemon.livelloMossa, true);
    f2.isMiniboss = true;
    f2.inFase2 = true;
    
    // Mantiene la stessa percentuale di HP
    let perc = nemicoPokemon.hpAttuali / nemicoPokemon.hpMax;
    f2.hpAttuali = Math.max(1, Math.round(f2.hpMax * perc));
    
    // Sostituisce il nemico
    nemicoPokemon = f2;
    resettaEffettiSuTarget("nemico");
    
    document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `<span style="color: #e74c3c; font-weight: bold; font-size: 1.2em;">\u26A0\uFE0F IL MINI BOSS PASSA ALLA FASE 2! \u26A0\uFE0F</span><br>Le sue statistiche e il suo elemento sono cambiati!`;
        
    aggiornaGrafica();
    
    // Prosegue col turno nemico, eventuale video di trasformazione
    if (videoTrasformazione && !isSkipAttivo) {
        riproduciVideoSchermoIntero(videoTrasformazione, () => {
            setTimeout(turnoNemico, 500);
        });
    } else {
        setTimeout(turnoNemico, isSkipAttivo ? 1000 : 2000);
    }
    return true;
}

function cambiaFormaKul(forma) {
    const baseData = pokemonDatabase.find(p => p.nome.toLowerCase() === "kul");
    if (!baseData) return;
    const lvl = nemicoPokemon.livello || 1;
    // Base stats calculated normally
    const baseAtk = Math.round(baseData.atkBase * (1 + (lvl * 0.2)));
    const baseDef = Math.round(baseData.defBase * (1 + (lvl * 0.2)));
    const baseVel = Math.round(baseData.velBase * (1 + (lvl * 0.2)));
    const baseAtkSpec = Math.round((baseData.atkSpecBase || baseData.atkBase) * (1 + (lvl * 0.2)));
    const baseDefSpec = Math.round((baseData.defSpecBase || baseData.defBase) * (1 + (lvl * 0.2)));

    nemicoPokemon.kulForm = forma;
    
    if (forma === "gattino") {
        nemicoPokemon.atk = Math.round(baseAtk * 0.30); // -70%
        nemicoPokemon.atkSpec = Math.round(baseAtkSpec * 0.30);
        nemicoPokemon.def = baseDef;
        nemicoPokemon.defSpec = baseDefSpec;
        nemicoPokemon.vel = baseVel;
        nemicoPokemon.immagine = "../Sprite/personaggi/KulF2/KulF2_gattino.jpeg";
        nemicoPokemon.immagineAtk = "../Sprite/personaggi/KulF2/KulF2_gattino_atk.jpeg";
        nemicoPokemon.frameAtk = 1;
        // Recupera 5% HP max
        const cura = Math.round(nemicoPokemon.hpMax * 0.05);
        nemicoPokemon.hpAttuali = Math.min(nemicoPokemon.hpMax, nemicoPokemon.hpAttuali + cura);
        document.getElementById("console-log").innerHTML += `<br>\u{1f408} Kul diventa un <strong>Gattino</strong>! (Schivata+, Attacco---, Recupera ${cura} HP)`;
    } else if (forma === "jaguar") {
        nemicoPokemon.atk = Math.round(baseAtk * 1.13); // +13%
        nemicoPokemon.atkSpec = Math.round(baseAtkSpec * 1.13);
        nemicoPokemon.def = Math.round(baseDef * 1.10); // +10%
        nemicoPokemon.defSpec = Math.round(baseDefSpec * 1.10);
        nemicoPokemon.vel = Math.round(baseVel * 1.25); // +25%
        nemicoPokemon.immagine = "../Sprite/personaggi/KulF2/KulF2_jaguar.jpeg";
        nemicoPokemon.immagineAtk = "../Sprite/personaggi/KulF2/KulF2_jaguar_atk.jpeg";
        nemicoPokemon.frameAtk = 2;
        document.getElementById("console-log").innerHTML += `<br>\u{1f406} Kul diventa <strong>Jaguar</strong>! (Tutte le stats incrementate)`;
    } else {
        // umano
        nemicoPokemon.atk = baseAtk;
        nemicoPokemon.atkSpec = baseAtkSpec;
        nemicoPokemon.def = baseDef;
        nemicoPokemon.defSpec = baseDefSpec;
        nemicoPokemon.vel = baseVel;
        nemicoPokemon.immagine = baseData.immagine;
        nemicoPokemon.immagineAtk = baseData.immagineAtk;
        nemicoPokemon.frameAtk = baseData.frameAtk || 1;
        document.getElementById("console-log").innerHTML += `<br>\u{1f468}\u200d\u{1f4bc} Kul resta nella sua <strong>Forma Umana</strong>!`;
    }
    aggiornaGrafica();
}

function turnoNemico() {
    if (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) {
        if (typeof eseguiTurnoBossChallenge === 'function') {
            return eseguiTurnoBossChallenge();
        }
    }
    if (!nemicoPokemon || nemicoPokemon.hpAttuali <= 0 || !mioPokemon) return;

    if (processaEffettiInizioTurno(nemicoPokemon, true)) {
        // Il nemico salta il turno
        processaEffettiFineTurno(nemicoPokemon, true);
        if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
            if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
            if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
        } else {
            abilitaControlliGiocatore();
        }
        return;
    }

    let usaUlt = false;
    let messaggioSpeciale = "";

    // Logica gimmick boss
    if (nemicoPokemon.boss === true && (!haUsatoUltNemico || nemicoPokemon.nome.toLowerCase().startsWith("max"))) {
        const nomeBoss = nemicoPokemon.nome.toLowerCase();
        
        // --- MECCANICHE KUL ---
        if (nomeBoss === "kul") {
            const vecchiaForma = nemicoPokemon.kulForm || "umano";
            const rnd = Math.random();
            let nuovaForma;
            if (rnd < 0.40) nuovaForma = "gattino";
            else if (rnd < 0.80) nuovaForma = "umano";
            else nuovaForma = "jaguar";

            const cambiaEAttacca = () => {
                cambiaFormaKul(nuovaForma);
                eseguiAttaccoNormaleNemico();
            };

            if (vecchiaForma !== nuovaForma) {
                // Forma cambiata: mostra WARNING poi video (la prima volta), poi cambia e attacca
                const transizioneKey = `${vecchiaForma}_a_${nuovaForma}`;
                const videoFile = `../Sprite/personaggi/KulF2/trasformazioni/${transizioneKey}.mp4`;
                const warningDiv = document.getElementById("warning-overlay");

                if (!trasformazioniKulViste.has(transizioneKey)) {
                    trasformazioniKulViste.add(transizioneKey);
                    // Prima volta: mostra warning 3s poi video poi attacca
                    if (warningDiv) {
                        warningDiv.style.display = "flex";
                        setTimeout(() => {
                            warningDiv.style.display = "none";
                            riproduciVideoSchermoIntero(videoFile, cambiaEAttacca);
                        }, 3000);
                    } else {
                        riproduciVideoSchermoIntero(videoFile, cambiaEAttacca);
                    }
                } else {
                    // Vista già: cambio forma istantaneo e attacca
                    cambiaEAttacca();
                }
            } else {
                // Stessa forma: nessun video, attacca direttamente
                cambiaFormaKul(nuovaForma);
                eseguiAttaccoNormaleNemico();
            }
            return; // Il flusso prosegue in cambiaEAttacca / eseguiAttaccoNormaleNemico
        } else if (nomeBoss === "filippo" || nomeBoss === "filippo fase 2") {
            const ceCarraNelTeam = miaSquadra.some(p => p && p.nome.toLowerCase() === "carra");
            if (ceCarraNelTeam) {
                usaUlt = true;
                messaggioSpeciale = "<br>\u{1f6a8} <strong>Filippo nota Carra e si infuria!</strong>";
            } else if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) {
                usaUlt = true;
            }
        } else if (nomeBoss === "lanza" || nomeBoss === "lanza fase 2") {
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * 0.15) usaUlt = true;
        } else if (nomeBoss === "sat") {
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) {
                usaUlt = true;
                messaggioSpeciale = "<br>\u2694\ufe0f <strong>Sat sfodera la sua Katana e passa alla Fase 2!</strong>";
            }
        } else if (nomeBoss === "edo") {
            if ((nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2 || nemicoPokemon.attacchiSubitiEdo >= 5) && !nemicoPokemon.edoInFase2) {
                usaUlt = true;
                messaggioSpeciale = "<br>\u2728 <strong>Il GYATT di Edo sprigiona energia e si trasforma in Oro e Rosa!</strong>";
            }
        } else if (nomeBoss === "gio") {
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) {
                usaUlt = true;
                messaggioSpeciale = "<br>\u2728 <strong>Gio afferra la sua Lancia e passa alla Fase 2!</strong>";
            }
        } else {
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) usaUlt = true;
        }
    }

    if (usaUlt) {
        haUsatoUltNemico = true;
        let fase2Attivata = false;

        // Trasformazione Fase 2
        if (nemicoPokemon.nome.toLowerCase().startsWith("max")) {
            if (!nemicoPokemon.maxFase3 && nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * (1/3)) {
                nemicoPokemon.maxFase3 = true;
                const datiFase3 = pokemonDatabase.find(p => p.nome.toLowerCase() === "max f3");
                if (datiFase3) {
                    const nuovoP = creaPokemon(datiFase3, nemicoPokemon.livello, nemicoPokemon.livelloMossa, true);
                    const vecchiHpMax = nemicoPokemon.hpMax;
                    const vecchiHpAttuali = nemicoPokemon.hpAttuali;
                    Object.assign(nemicoPokemon, {
                        nome: "MAX F3",
                        atk: nuovoP.atk, atkSpec: nuovoP.atkSpec, def: nuovoP.def, defSpec: nuovoP.defSpec, vel: nuovoP.vel,
                        hpMax: nuovoP.hpMax, elemento: nuovoP.elemento,
                        immagine: nuovoP.immagine, immagineAtk: nuovoP.immagineAtk, frameAtk: 1, mossaULT: datiFase3.mossaLvl3 || "Attacco 1"
                    });
                    nemicoPokemon.hpAttuali = Math.max(1, Math.round((vecchiHpAttuali / vecchiHpMax) * nemicoPokemon.hpMax));
                }
                fase2Attivata = true;
            } else if (!nemicoPokemon.maxFase2 && !nemicoPokemon.maxFase3 && nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * (2/3)) {
                nemicoPokemon.maxFase2 = true;
                const datiFase2 = pokemonDatabase.find(p => p.nome.toLowerCase() === "max f2");
                if (datiFase2) {
                    const nuovoP = creaPokemon(datiFase2, nemicoPokemon.livello, nemicoPokemon.livelloMossa, true);
                    const vecchiHpMax = nemicoPokemon.hpMax;
                    const vecchiHpAttuali = nemicoPokemon.hpAttuali;
                    Object.assign(nemicoPokemon, {
                        nome: "MAX F2",
                        atk: nuovoP.atk, atkSpec: nuovoP.atkSpec, def: nuovoP.def, defSpec: nuovoP.defSpec, vel: nuovoP.vel,
                        hpMax: nuovoP.hpMax, elemento: nuovoP.elemento,
                        immagine: nuovoP.immagine, immagineAtk: nuovoP.immagineAtk, frameAtk: 1, mossaULT: datiFase2.mossaLvl3 || "Attacco 1"
                    });
                    nemicoPokemon.hpAttuali = Math.max(1, Math.round((vecchiHpAttuali / vecchiHpMax) * nemicoPokemon.hpMax));
                }
                fase2Attivata = true;
            }
        } else if (nemicoPokemon.nome.toLowerCase() === "sat" && !nemicoPokemon.satInFase2) {
            nemicoPokemon.satInFase2 = true;
            nemicoPokemon.vel = Math.round(nemicoPokemon.vel * 1.25);
            nemicoPokemon.hpAttuali = Math.min(nemicoPokemon.hpMax, nemicoPokemon.hpAttuali + Math.round(nemicoPokemon.hpMax * 0.30));
            nemicoPokemon.immagine = "../Sprite/personaggi/SatF2/SatF2.jpeg";
            nemicoPokemon.immagineAtk = "../Sprite/personaggi/SatF2/SatF2_atk.jpeg";
            nemicoPokemon.frameAtk = 3;
            if (effettiAttivi.nemico.defRidotta && effettiAttivi.nemico.defRidotta.isSatCustom) {
                effettiAttivi.nemico.defRidotta = null;
            }
            fase2Attivata = true;
        } else if (nemicoPokemon.nome.toLowerCase() === "edo" && !nemicoPokemon.edoInFase2) {
            nemicoPokemon.edoInFase2 = true;
            nemicoPokemon.atk = Math.round(nemicoPokemon.atk * 1.35);
            nemicoPokemon.atkSpec = Math.round((nemicoPokemon.atkSpec || nemicoPokemon.atk) * 1.35);
            nemicoPokemon.def = Math.round(nemicoPokemon.def * 0.50);
            nemicoPokemon.defSpec = Math.round((nemicoPokemon.defSpec || nemicoPokemon.def) * 0.50);
            nemicoPokemon.immagine = "../Sprite/personaggi/EdoF2/EdoF2.jpeg";
            nemicoPokemon.immagineAtk = "../Sprite/personaggi/EdoF2/EdoF2_atk.jpeg";
            nemicoPokemon.frameAtk = 1;
            fase2Attivata = true;
        } else if (nemicoPokemon.nome.toLowerCase() === "gio" && !nemicoPokemon.gioInFase2) {
            nemicoPokemon.gioInFase2 = true;
            nemicoPokemon.atk = Math.round(nemicoPokemon.atk * 1.15);
            nemicoPokemon.atkSpec = Math.round((nemicoPokemon.atkSpec || nemicoPokemon.atk) * 1.15);
            nemicoPokemon.def = Math.round(nemicoPokemon.def * 0.80);
            nemicoPokemon.defSpec = Math.round((nemicoPokemon.defSpec || nemicoPokemon.def) * 0.80);
            nemicoPokemon.immagine = "../Sprite/personaggi/GioF2/GioF2.jpeg";
            nemicoPokemon.immagineAtk = "../Sprite/personaggi/GioF2/GioF2_Lancia.jpeg";
            nemicoPokemon.frameAtk = 4;
            fase2Attivata = true;
        } else if (!nemicoPokemon.nome.includes("Fase 2")) {
            const nomeFase2  = nemicoPokemon.nome + " Fase 2";
            const datiFase2  = pokemonDatabase.find(p => p.nome.toLowerCase() === nomeFase2.toLowerCase());
            if (datiFase2) {
                const lvl = nemicoPokemon.livello || 1;
                const nuoviHpMax = Math.round(datiFase2.hpBase * (1 + (lvl * 0.2)));
                nemicoPokemon = {
                    nome: datiFase2.nome, livello: lvl,
                    hpMax: nuoviHpMax, hpAttuali: Math.max(1, Math.round(nuoviHpMax * 0.50)),
                    atk: Math.round(datiFase2.atkBase * (1 + (lvl * 0.2))),
                    def: Math.round(datiFase2.defBase * (1 + (lvl * 0.2))),
                    vel: Math.round(datiFase2.velBase * (1 + (lvl * 0.2))),
                    immagine: datiFase2.immagine, immagineAtk: datiFase2.immagineAtk, frameAtk: datiFase2.frameAtk || 1,
                    mossaLvl1: datiFase2.mossaLvl1, mossaLvl2: datiFase2.mossaLvl2,
                    mossaLvl3: datiFase2.mossaLvl3,
                    mossaULT:  datiFase2.mossaULT || datiFase2.mossaLvl3,
                    numFrameUlt: datiFase2.numFrameUlt || 3,
                    elemento: datiFase2.elemento, boss: true,
                    raritaTipo: datiFase2.raritaTipo, livelloMossa: 3
                };
                messaggioSpeciale += `<br>\u2728 <strong>Fase Shift! Il boss recupera il 50% della vita!</strong> \u2728`;
                fase2Attivata = true;
            }
        }

        const eseguiUlt = () => {
            document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `\u26a0\ufe0f IL BOSS SI INFURIA! ${nemicoPokemon.nome} prepara l'attacco finale!${messaggioSpeciale}`;
            eseguiAnimazioneUlt(nemicoPokemon, "img-nemico", () => {
                const mossaSat = nemicoPokemon.nome.toLowerCase().includes("sat") ? "Maremoto del Bomber" : nemicoPokemon.mossaULT;
                calcolaEdEseguiDannoNemico(3.0, mossaSat || nemicoPokemon.mossaULT, false);
            });
            aggiornaGrafica();
        };

        if (fase2Attivata) {
            mostraWarningBoss(eseguiUlt, nemicoPokemon.nome);
        } else {
            eseguiUlt();
        }
        return;
    } else {
        eseguiAttaccoNormaleNemico();
    }
}

function eseguiAttaccoNormaleNemico() {
    if (!nemicoPokemon || nemicoPokemon.hpAttuali <= 0 || !mioPokemon) return;

    let isSplashSat = false;
    let atkImgBackup = null;
    let originalFrameAtk = nemicoPokemon.frameAtk || 1;
    let customMoltMossa = null;
    let nomeMossa = getNomeMossaAttuale(nemicoPokemon);

    if (nemicoPokemon.nome.toLowerCase().startsWith("max")) {
        if (!nemicoPokemon.maxFase3 && nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * (1/3)) {
            nemicoPokemon.maxFase3 = true;
            const datiFase3 = pokemonDatabase.find(p => p.nome.toLowerCase() === "max f3");
            if (datiFase3) {
                const nuovoP = creaPokemon(datiFase3, nemicoPokemon.livello, nemicoPokemon.livelloMossa, true);
                const vecchiHpMax = nemicoPokemon.hpMax;
                const vecchiHpAttuali = nemicoPokemon.hpAttuali;
                Object.assign(nemicoPokemon, {
                    nome: "MAX F3",
                    atk: nuovoP.atk, atkSpec: nuovoP.atkSpec, def: nuovoP.def, defSpec: nuovoP.defSpec, vel: nuovoP.vel,
                    hpMax: nuovoP.hpMax, elemento: nuovoP.elemento,
                    immagine: nuovoP.immagine, immagineAtk: nuovoP.immagineAtk, frameAtk: 1, mossaULT: datiFase3.mossaLvl3 || "Attacco 1"
                });
                nemicoPokemon.hpAttuali = Math.max(1, Math.round((vecchiHpAttuali / vecchiHpMax) * nemicoPokemon.hpMax));
            }
            fase2Attivata = true;
        } else if (!nemicoPokemon.maxFase2 && !nemicoPokemon.maxFase3 && nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * (2/3)) {
            nemicoPokemon.maxFase2 = true;
            const datiFase2 = pokemonDatabase.find(p => p.nome.toLowerCase() === "max f2");
            if (datiFase2) {
                const nuovoP = creaPokemon(datiFase2, nemicoPokemon.livello, nemicoPokemon.livelloMossa, true);
                const vecchiHpMax = nemicoPokemon.hpMax;
                const vecchiHpAttuali = nemicoPokemon.hpAttuali;
                Object.assign(nemicoPokemon, {
                    nome: "MAX F2",
                    atk: nuovoP.atk, atkSpec: nuovoP.atkSpec, def: nuovoP.def, defSpec: nuovoP.defSpec, vel: nuovoP.vel,
                    hpMax: nuovoP.hpMax, elemento: nuovoP.elemento,
                    immagine: nuovoP.immagine, immagineAtk: nuovoP.immagineAtk, frameAtk: 1, mossaULT: datiFase2.mossaLvl3 || "Attacco 1"
                });
                nemicoPokemon.hpAttuali = Math.max(1, Math.round((vecchiHpAttuali / vecchiHpMax) * nemicoPokemon.hpMax));
            }
            fase2Attivata = true;
        }
    } else if (nemicoPokemon.nome.toLowerCase() === "sat" && !nemicoPokemon.satInFase2) {
        if (Math.random() < 0.30) {
            isSplashSat = true;
            atkImgBackup = nemicoPokemon.immagineAtk;
            nemicoPokemon.immagineAtk = "../Sprite/personaggi/Sat/Sat_atkAOE.jpeg";
            nemicoPokemon.frameAtk = 4;
            effettiAttivi.nemico.defRidotta = { percentuale: 0.15, durata: 1, isSatCustom: true };
        }
    } else if (nemicoPokemon.nome.toLowerCase() === "gio") {
        atkImgBackup = nemicoPokemon.immagineAtk;
        const rand = Math.random();
        if (nemicoPokemon.gioInFase2) {
            if (rand < 0.5) {
                nomeMossa = "Lancia";
                customMoltMossa = 1.20;
                nemicoPokemon.immagineAtk = "../Sprite/personaggi/GioF2/GioF2_Lancia.jpeg";
                nemicoPokemon.frameAtk = 4;
            } else {
                nomeMossa = "Raggio";
                customMoltMossa = 1.50;
                nemicoPokemon.immagineAtk = "../Sprite/personaggi/GioF2/GioF2_Raggio.jpeg";
                nemicoPokemon.frameAtk = 3;
            }
        } else {
            if (rand < 0.33) {
                nomeMossa = "Pugni";
                customMoltMossa = 0.80;
                nemicoPokemon.immagineAtk = "../Sprite/personaggi/Gio/Gio_Pugno.jpeg";
                nemicoPokemon.frameAtk = 2;
            } else if (rand < 0.66) {
                nomeMossa = "Sfera";
                customMoltMossa = 1.25;
                nemicoPokemon.immagineAtk = "../Sprite/personaggi/Gio/Gio_Sfera.jpeg";
                nemicoPokemon.frameAtk = 3;
            } else {
                nomeMossa = "Raggio";
                customMoltMossa = 1.00;
                nemicoPokemon.immagineAtk = "../Sprite/personaggi/Gio/Gio_Raggio.jpeg";
                nemicoPokemon.frameAtk = 3;
            }
        }
    }

    if (nemicoPokemon.satInFase2) {
         nomeMossa = "Colpo di Katana";
    } else if (isSplashSat) {
         nomeMossa = "Colpo Potente Splash";
    }

    eseguiAnimazioneAttaccoNormale(nemicoPokemon, false, () => {
        if (atkImgBackup) {
            nemicoPokemon.immagineAtk = atkImgBackup;
            nemicoPokemon.frameAtk = originalFrameAtk;
        }
        if (!mioPokemon) return;
        const moltMossa = customMoltMossa !== null ? customMoltMossa : (CONFIG_MOSSE[nemicoPokemon.livelloMossa] || 1.0);
        calcolaEdEseguiDannoNemico(moltMossa, nomeMossa, isSplashSat);
    });
}

function calcolaEdEseguiDannoNemico(moltMossa, nomeMossaUsata, isSplashSat = false) {
    const moltiplicatoreTipo = CONFIG_DEBOLEZZE[nemicoPokemon.elemento.toLowerCase()]?.[mioPokemon.elemento.toLowerCase()] ?? 1.0;

    // --- SCHIVATA GIOCATORE ---
    const isUlt = moltMossa >= 3.0;
    const schivataGiocatore = calcolaSchivata(mioPokemon);
    if (!isUlt && schivataGiocatore > 0 && Math.random() * 100 < schivataGiocatore) {
        document.getElementById("console-log").innerHTML +=
            `<br>\u{1f4a8} ${mioPokemon.nome} <strong>schiva l'attacco!</strong> (${schivataGiocatore}% schivata)`;
        
        processaEffettiFineTurno(nemicoPokemon, true);
        if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
            if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
            if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
        } else {
            abilitaControlliGiocatore();
        }
        return;
    }

    // --- LANZA ONE-SHOT GIMMICK ---
    if (isUlt && nemicoPokemon.boss && nemicoPokemon.nome.toLowerCase().includes("lanza")) {
        miaSquadra.forEach((p, index) => {
            if (p) {
                if (p === mioPokemon) {
                    p.hpAttuali = 0;
                } else {
                    p.hpAttuali -= Math.floor(p.hpAttuali * 0.5);
                }
            }
        });
        document.getElementById("console-log").innerHTML += `<br>\u2620\ufe0f <strong>${nemicoPokemon.nome} usa la sua Gimmick Finale!</strong>`;
        aggiornaGrafica();
        
        processaEffettiFineTurno(nemicoPokemon, true);
        gestisciKOGiocatore();
        return;
    }

    // Identifica se l'attacco \u00e8 fisico o speciale in base alla statistica maggiore del nemico
    const isSpecial = (nemicoPokemon.atkSpec || 0) > (nemicoPokemon.atk || 0);
    
    let atkEffettivo = 0;
    let defEffettiva = 0;
    
    if (isSpecial) {
        atkEffettivo = calcolaStatConEffetti(nemicoPokemon.atkSpec, null, effettiAttivi.nemico.atkBoost);
        defEffettiva = calcolaStatConEffetti(mioPokemon.defSpec, effettiAttivi.giocatore.defRidotta, null);
    } else {
        atkEffettivo = calcolaStatConEffetti(nemicoPokemon.atk, null, effettiAttivi.nemico.atkBoost);
        defEffettiva = calcolaStatConEffetti(mioPokemon.def, effettiAttivi.giocatore.defRidotta, null);
    }

    // Calcolo Danno Base
    const dannoBase = (atkEffettivo * atkEffettivo) / (atkEffettivo + defEffettiva);
    
    // Modificatori buff/debuff
    let modDanno = 1.0;
    if (effettiAttivi.nemico.difesaRidotta && !effettiAttivi.nemico.difesaRidotta.isSatCustom) modDanno -= effettiAttivi.nemico.difesaRidotta.percentuale;
    if (effettiAttivi.giocatore.provocato) modDanno += effettiAttivi.giocatore.provocato.percentuale;
    
    let dannoFatto = Math.round(dannoBase * moltiplicatoreTipo * moltMossa * modDanno);
    if (dannoFatto < 1 && moltiplicatoreTipo > 0) dannoFatto = 1;

    let dannoSingoloPanchina = 0;
    if (isSplashSat) {
        let dannoAttivo = Math.round(dannoFatto * 0.8);
        let dannoPanchina = dannoFatto - dannoAttivo;
        dannoFatto = dannoAttivo;

        let panchinari = miaSquadra.filter(p => p && p !== mioPokemon && p.hpAttuali > 0);
        if (panchinari.length > 0) {
            dannoSingoloPanchina = Math.max(1, Math.round(dannoPanchina / panchinari.length));
        }
    }

    // Decrementa boost ATK temporaneo
    if (effettiAttivi.nemico.atkBoost) {
        effettiAttivi.nemico.atkBoost.durata--;
        if (effettiAttivi.nemico.atkBoost.durata <= 0) {
            effettiAttivi.nemico.atkBoost = null;
        }
    }

    // Rimuove scudo giocatore se presente
    if (mioPokemon.scudoPassivo > 0) {
        dannoFatto = 0;
        mioPokemon.scudoPassivo = 0;
        document.getElementById("console-log").innerHTML +=
            `<br>\u{1f6e1}\ufe0f ${mioPokemon.nome} usa il suo Scudo per bloccare l'attacco!`;
        aggiornaGrafica();
    } else {
        mioPokemon.hpAttuali = Math.max(0, mioPokemon.hpAttuali - dannoFatto);
        const msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
        document.getElementById("console-log").innerHTML +=
            `<br>${nemicoPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoFatto} danni!${msgEfficacia}`;
        
        // --- STUN EDO ---
        if (dannoFatto > 0 && nemicoPokemon.boss && nemicoPokemon.nome.toLowerCase() === "edo") {
            if (Math.random() < 0.15) {
                if (!effettiAttivi.giocatore) effettiAttivi.giocatore = {};
                effettiAttivi.giocatore.stordito = { durata: 1 };
                document.getElementById("console-log").innerHTML += `<br>\u{1f351} L'imponenza del GYATT ti stordisce! (Salta il turno)`;
            }
        }
        
        aggiornaGrafica();
    }

    if (dannoSingoloPanchina > 0) {
        let panchinari = miaSquadra.filter(p => p && p !== mioPokemon && p.hpAttuali > 0);
        panchinari.forEach(p => {
            p.hpAttuali = Math.max(0, p.hpAttuali - dannoSingoloPanchina);
        });
        document.getElementById("console-log").innerHTML += `<br>\u{1f30a} Lo splash colpisce la panchina! (${dannoSingoloPanchina} danni a testa)`;
        aggiornaGrafica();
    }

    let msgEffettiLv3 = "";
    if (nemicoPokemon.livelloMossa >= 3 && Math.random() < 0.30) {
        msgEffettiLv3 = applicaEffettoElementaleLv3(nemicoPokemon, mioPokemon, nemicoPokemon.elemento);
    }
    if (msgEffettiLv3 !== "") {
        document.getElementById("console-log").innerHTML += msgEffettiLv3;
        aggiornaGrafica();
    }

    processaEffettiFineTurno(nemicoPokemon, true);

    if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
        if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
        if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
    } else {
        abilitaControlliGiocatore();
    }
}


// ----------------------------------------------------------
// KO GIOCATORE E VITTORIA
// ----------------------------------------------------------

function gestisciKOGiocatore() {
    if (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) {
        if (typeof gestisciKOGiocatoreChallenge === 'function') {
            return gestisciKOGiocatoreChallenge();
        }
    }
    // Mostra immagine KO del Pok\u00e9mon corrente
    const imgGiocatore = document.getElementById("img-giocatore");
    if (imgGiocatore && mioPokemon) {
        const fName = getSpriteName(mioPokemon.nome);
        let folderPath = `../Sprite/personaggi/${fName}`;
        if (mioPokemon.immagine) {
            const lastSlash = mioPokemon.immagine.lastIndexOf('/');
            if (lastSlash !== -1) {
                folderPath = mioPokemon.immagine.substring(0, lastSlash);
            }
        }
        imgGiocatore.src = `${folderPath}/${fName}KO.jpeg`;
    }

    // --- PERK SALVAVITA ---
    // Se il Pok\u00e9mon ha il Perk Salvavita e ha ancora utilizzi disponibili, sopravvive con 1 HP.
    if (mioPokemon && (mioPokemon.perkId === "salvavita" || mioPokemon.perkId === "salvavita_2")) {
        const maxUsi = mioPokemon.perkId === "salvavita_2"
            ? CONFIG_PERK.salvavitaUsiTier2
            : CONFIG_PERK.salvavitaUsiTier1;
        if (perkBattagliaGiocatore.salvavitaUsati < maxUsi) {
            perkBattagliaGiocatore.salvavitaUsati++;
            mioPokemon.hpAttuali = 1; // sopravvive con 1 HP!
            document.getElementById("console-log").innerHTML +=
                `<br>\u{1f6e1}\ufe0f <strong>SALVAVITA!</strong> ${mioPokemon.nome} sopravvive con 1 HP! (${perkBattagliaGiocatore.salvavitaUsati}/${maxUsi})`;
            aggiornaGrafica();
            abilitaControlliGiocatore();
            return; // NON procede con il KO
        }
    }

    const pokemonVivi = miaSquadra.filter(p => p.hpAttuali > 0);

    if (pokemonVivi.length > 0) {
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `<strong>${mioPokemon.nome}</strong> \u00e8 esausto! Mandi in campo il prossimo!`;

        setTimeout(() => {
            resettaEffettiSuTarget("giocatore");
            mandaInCampoMioPokemon();
            aggiornaGrafica();
            abilitaControlliGiocatore();
        }, isSkipAttivo ? 800 : 1500);
    } else {
        // Tutta la squadra KO
        setTimeout(() => {
            // In sandbox: mostra schermata risultato senza game over definitivo
            if (typeof isSandboxAttiva !== 'undefined' && isSandboxAttiva) {
                if (typeof terminaSandbox === 'function') terminaSandbox("Sconfitta");
                return;
            }
            riproduciMusica("gameover.mp3");
            document.getElementById("schermata-gioco").style.display = "none";
            document.getElementById("schermata-gameover").style.setProperty("display", "flex", "important");
        }, isSkipAttivo ? 800 : 1500);
    }
}

/**
 * Gestisce la vittoria di un incontro.
 * Assegna level-up e monete in base al tipo di evento.
 */
function gestisciVittoriaIncontro() {
    // In sandbox: la vittoria non assegna level-up né monete, mostra solo il risultato
    if (typeof isSandboxAttiva !== 'undefined' && isSandboxAttiva) {
        document.getElementById("console-log").innerHTML +=
            "<br><strong style='color:#4cd137'>Nemico sconfitto!</strong>";
        if (typeof terminaSandbox === 'function') terminaSandbox("Vittoria");
        return;
    }

    // --- SALVA LIVELLI PRE-LEVEL-UP (per verificare i level cap perk) ---
    const livPreBattle = miaSquadra.map(p => ({ pokemon: p, livelloPre: p ? p.livello : 0 }));

    // --- LEVEL UP ---
    let livUpGuadagnati = 0;
    if (isBossFight) {
        livUpGuadagnati = CONFIG_LEVEL_UP.boss;
    } else if (tipoEventoAttuale === "miniboss") {
        livUpGuadagnati = 3; // I mini boss danno +3 livelli a tutta la squadra
        // Cura tutta la squadra al 100% dopo un miniboss
        miaSquadra.forEach(p => { if (p) p.hpAttuali = p.hpMax; });
    } else if (tipoEventoAttuale === "cespuglio") {
        livUpGuadagnati = CONFIG_LEVEL_UP.cespuglio;
    } else if (tipoEventoAttuale === "npc") {
        livUpGuadagnati = CONFIG_LEVEL_UP.npc;
    }

    if (livUpGuadagnati > 0) {
        miaSquadra.forEach(p => { if (p) aggiornaStatsLivello(p, livUpGuadagnati); });
    }

    // --- PERK RIGENERAZIONE: cura post-stanza ---
    // Applicata qui perch\u00e9 la stanza \u00e8 appena stata completata.
    miaSquadra.forEach(p => {
        if (!p || p.hpAttuali <= 0) return;
        const percCura = p.perkId === "rigenerazione_2"
            ? CONFIG_PERK.rigenerazionePercTier2
            : p.perkId === "rigenerazione"
                ? CONFIG_PERK.rigenerazionePercTier1
                : 0;
        if (percCura > 0) {
            const cura = Math.round(p.hpMax * percCura);
            p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + cura);
        }
    });

    // --- CURA TOTALE DOPO BOSS FIGHT ---
    if (isBossFight) {
        miaSquadra.forEach(p => {
            if (p) {
                p.hpAttuali = p.hpMax;
            }
        });
    }

    // --- GUADAGNO MONETE ---
    // I range/valori sono configurati in CONFIG_MONETE_GUADAGNO (stato.js)
    let moneteGuadagnate = 0;
    if (isBossFight) {
        moneteGuadagnate = CONFIG_MONETE_GUADAGNO.boss.fisso;
    } else if (tipoEventoAttuale === "miniboss") {
        moneteGuadagnate = 10; // I miniboss danno un bel po' di monete
    } else if (tipoEventoAttuale === "cespuglio") {
        const { min, max } = CONFIG_MONETE_GUADAGNO.cespuglio;
        moneteGuadagnate = Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (tipoEventoAttuale === "npc") {
        const { min, max } = CONFIG_MONETE_GUADAGNO.npc;
        moneteGuadagnate = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (nemicoPokemon && nemicoPokemon.isElite) {
        moneteGuadagnate *= 2;
    }

    if (isRunVeloce) {
        moneteGuadagnate = 0;
    }
    monete += moneteGuadagnate;
    aggiornaDisplayMonete();

    // --- MESSAGGIO VITTORIA ---
    let msgVittoria = "Hai vinto la battaglia!";
    if (livUpGuadagnati > 0) {
        msgVittoria += ` \u{1f389} +${livUpGuadagnati} LVL alla squadra!`;
    }
    if (moneteGuadagnate > 0) {
        msgVittoria += ` \u{1f4b0} +${moneteGuadagnate} monete!`;
    }
    document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + msgVittoria;

    // --- GESTIONE BOSS (avanzamento mappa) ---
    if (isBossFight) {
        isBossFight = false;

        // Se c'è un callback post-vittoria boss (es. sequenza Bombers), invocalo
        if (typeof _dopoVittoriaBoss === "function") {
            const cb = _dopoVittoriaBoss;
            _dopoVittoriaBoss = null;
            setTimeout(() => {
                // Ripristina pulsanti per il prossimo scontro
                document.getElementById("btn-attacco").style.display = "";
                document.getElementById("btn-item").style.display = "";
                document.getElementById("btn-pokemon").style.display = "";
                document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
                cb();
            }, isSkipAttivo ? 1500 : 3000);
            return;
        }

        // Altrimenti: avanzamento mappa normale
        const chiaviMappe    = Object.keys(ARCHIVIO_MAPPE);
        const indiceProssimo = chiaviMappe.indexOf(mappaAttuale) + 1;

        if (indiceProssimo >= chiaviMappe.length) {
            document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + "🏆 COMPLIMENTI! Hai completato tutte le mappe! 🏆";
            
            // --- INSERIMENTO HALL OF FAME ---
            if (typeof salvaInHallOfFame === "function") {
                salvaInHallOfFame();
            }

            const modale = document.getElementById("modal-vittoria-finale");
            if (modale) modale.style.display = "flex";
            return;
        }

        mappaAttuale = chiaviMappe[indiceProssimo];
        document.getElementById("console-log").innerHTML +=
            `<br><strong>Boss sconfitto! Sei in ${mappaAttuale.toUpperCase()}. Squadra curata!</strong>`;
        miaSquadra.forEach(p => { if (p) p.hpAttuali = p.hpMax; });
        pianoAttuale      = 0;
        nodoSceltoAttuale = 0;
        generaMappaProcedurale();
    }

    // Mostra "TORNA ALLA MAPPA" e nasconde tutti gli altri
    document.getElementById("btn-attacco").style.display    = "none";
    document.getElementById("btn-item").style.display       = "none";
    document.getElementById("btn-pokemon").style.display    = "none";
    document.getElementById("btn-fuga").style.display       = "none";
    // Torna alla mappa rimosso in quanto buggato e automatico
    aggiornaGrafica();

    // --- VERIFICA PERK POST-BATTAGLIA ---
    // Controlla se qualche Pok\u00e9mon ha superato il level cap e deve scegliere un Perk.
    // La callback \u00e8 il ritorno normale alla mappa (eseguita dopo che tutti i Perk sono scelti).
    setTimeout(() => {
        verificaEAvviaPerk(livPreBattle, () => {
            // Callback: ritorno alla mappa
            cambiaSchermata("schermata-gioco", "schermata-mappa");
            aggiornaGrafica();
            aggiornaSquadraMappa();
            generaMappaAlbero();
            document.getElementById("btn-attacco").style.display = "";
            document.getElementById("btn-item").style.display = "";
            document.getElementById("btn-pokemon").style.display = "";
            document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
            // Torna alla mappa rimosso in quanto buggato e automatico
        });
    }, isSkipAttivo ? 1500 : 3000);
}


// ----------------------------------------------------------
// ANIMAZIONE ULT
// ----------------------------------------------------------

function eseguiAnimazioneUlt(pokemon, idElementoImg, callbackDanno) {
    const videoMap = ["sat", "edo", "mattia", "savina", "maccioni", "dinicola", "donato", "gio", "max"];
    let baseName = pokemon.nome.toLowerCase().replace(/ fase 2/g, "").replace(/ f[23]/g, "").replace(/\s+/g, "");
    if (baseName.includes("dinicola")) baseName = "dinicola";
    if (baseName.includes("max")) baseName = "max";
    
    if (videoMap.includes(baseName)) {
        // Questi boss hanno un video MP4, non usare i frame .jpeg
        if (callbackDanno) callbackDanno();
        return;
    }

    const totalFrames = pokemon.numFrameUlt || 3;
    let currentFrame  = 1;
    const elementoImg = document.getElementById(idElementoImg);

    if (!elementoImg) { callbackDanno(); return; }

    function mostraProssimoFrame() {
        if (currentFrame <= totalFrames) {
            const folder = getSpriteName(pokemon.nome);
            elementoImg.src = `../Sprite/personaggi/${folder}/${folder}Ult${currentFrame}.jpeg`;
            currentFrame++;
            setTimeout(mostraProssimoFrame, isSkipAttivo ? 500 : 1000);
        } else {
            elementoImg.src = pokemon.immagine;
            callbackDanno();
        }
    }
    mostraProssimoFrame();
}


// ----------------------------------------------------------
// BOSS BATTLE
// ----------------------------------------------------------

function avviaBossBattle(idBoss) {
    haUsatoUltGiocatore = false;
    haUsatoUltNemico    = false;
    resettaEffettiAttivi();
    resettaItemFight();

    if (idBoss === "boss_finale") idBoss = "5";

    const datiBoss = ARCHIVIO_BOSS[idBoss];
    if (!datiBoss) return;

    isBossFight    = true;
    nemiciIncontro = [];

    datiBoss.squadra.forEach(pBoss => {
        const base = pokemonDatabase.find(p => p.nome.toLowerCase() === pBoss.nome.toLowerCase());
        if (!base) return;
        
        let lvl = pBoss.livello;
        let indiceMappa = 1;
        if (mappaAttuale && mappaAttuale.startsWith("mappa")) {
            indiceMappa = parseInt(mappaAttuale.replace("mappa", "")) || 1;
        }
        
        const configLivelli = CONFIG_LIVELLI_MAPPE[indiceMappa] || CONFIG_LIVELLI_MAPPE[1];
        let lvIngresso = configLivelli.ingresso;
        let lvBossConfig = configLivelli.boss;
        
        let maxTeamLvl = (typeof maxLvlTeamInizioMappa !== "undefined") ? maxLvlTeamInizioMappa : 1;
        if (maxTeamLvl === 1 && typeof miaSquadra !== "undefined" && miaSquadra.length > 0) {
            maxTeamLvl = Math.max(...miaSquadra.filter(p => p).map(p => p.livello));
        }
        
        let delta_livello = 11;
        let variazione_seed = (typeof variazioneSeedMappa !== "undefined") ? variazioneSeedMappa : 0;
        let lvBossCalculated = Math.floor(maxTeamLvl + delta_livello + variazione_seed);
        
        let finalLvl = lvBossCalculated || lvl;
        if (mappaAttuale === "mappa9") {
            if (pBoss.nome.toLowerCase() === "max") {
                finalLvl = Math.min(100, lvBossCalculated);
            } else {
                finalLvl = Math.max(1, lvBossCalculated - 5);
            }
        }
        
        let p = creaPokemon(base, finalLvl, 3, true);
        p.boss = true;
        nemiciIncontro.push(p);
    });

    nemicoPokemon = nemiciIncontro.shift();
    if (!mandaInCampoMioPokemon()) return;

    const introBossDiv = document.getElementById("intro-boss");
    const imgBossBg    = document.getElementById("img-boss-background");

    if (introBossDiv && imgBossBg) {
        imgBossBg.src = datiBoss.immagine;
        introBossDiv.style.display = "block";
        if (datiBoss.soundtrack) riproduciMusica(datiBoss.soundtrack);

        setTimeout(() => {
            introBossDiv.style.display = "none";
            cambiaSchermata("schermata-mappa", "schermata-gioco");
            aggiornaGrafica();

            if (nemicoPokemon.vel > mioPokemon.vel) {
                chiAttaccaPerPrimo = "nemico";
                document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `Il Boss <strong>${nemicoPokemon.nome}</strong> \u00e8 pi\u00f9 veloce e attacca per primo!`;
                document.getElementById("btn-attacco").disabled = true;
                document.getElementById("btn-pokemon").disabled = true;
                document.getElementById("btn-fuga").disabled = true;
                aggiornaStatoBtnItem();
                setTimeout(turnoNemico, 1500);
            } else {
                chiAttaccaPerPrimo = "giocatore";
                document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `Sei pi\u00f9 veloce! Tocca a ${mioPokemon.nome}.`;
                abilitaControlliGiocatore();
            }
        }, 3000);
    }
}


// ==========================================================
// EFFETTI ELEMENTALI MOSSA LV3
// ==========================================================
// Ogni elemento ha un effetto unico quando usa la mossa di livello 3.
// Moltiplicatore danno = 1.25x (uguale al Lv2) + effetto bonus.
//
// FUOCO  \u2192 Bruciatura (DOT): ATK \u00d7 0.25 per 5 turni
// ERBA   \u2192 Rigenerazione: cura 15% del danno inflitto
// ACQUA  \u2192 Rallentamento: velocit\u00e0 nemico -15% per 3 turni
// BUIO   \u2192 Critico 25%: danno \u{00d72} con probabilit\u00e0 25%
// LUCE   \u2192 Debuff difesa: difesa nemico -15% per 3 turni
// ==========================================================





/** Applica il DOT bruciatura al target se attivo, decrementa la durata. */

/**
 * Calcola il valore effettivo di una stat con debuff/buff applicati.
 * @param {number} statBase   - Valore base della stat
 * @param {object|null} debuff - { durata, percentuale } riduzione (es. defRidotta)
 * @param {object|null} buff   - { durata, percentuale } aumento (es. atkBoost)
 */
function calcolaStatConEffetti(statBase, debuff, buff) {
    let val = statBase;
    if (debuff && debuff.durata > 0) val = Math.round(val * (1 - debuff.percentuale));
    if (buff   && buff.durata   > 0) val = Math.round(val * (1 + buff.percentuale));
    return val;
}

/** Decrementa la durata dei debuff velocit\u00e0 e difesa su un target. */


// ----------------------------------------------------------
// UI BATTAGLIA (skip, impostazioni, audio)
// ----------------------------------------------------------

/** Attiva la modalit\u00e0 skip (animazioni accelerate). La classe CSS segnala visivamente. */
function attivaSkip() {
    isSkipAttivo = !isSkipAttivo; // Toggle: ri-cliccando si disattiva
    const btn = document.getElementById("btn-skip-fixed");
    if (btn) btn.classList.toggle("attivo", isSkipAttivo);
}

// ----------------------------------------------------------
// FUGA DALLA BATTAGLIA
// ----------------------------------------------------------
function fugaBattaglia() {
    // Non \u00e8 possibile fuggire dalle Boss Fight
    if (isBossFight || (typeof tipoEventoAttuale !== 'undefined' && tipoEventoAttuale === "boss")) {
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + "<br><span style='color:#e1b12c; font-weight:bold;'>Non puoi fuggire da una Boss Fight!</span>";
        return;
    }

    // Successo al 100%
    document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + "<br><span style='color:#4cd137; font-weight:bold;'>Fuga riuscita con successo!</span>";
    
    // Disabilita i controlli mentre si fugge
    document.getElementById("btn-attacco").disabled = true;
    const btnItem = document.getElementById("btn-item");
    if (btnItem) btnItem.disabled = true;
    const btnFuga = document.getElementById("btn-fuga");
    if (btnFuga) btnFuga.disabled = true;
    const btnPokemon = document.getElementById("btn-pokemon");
    if (btnPokemon) btnPokemon.disabled = true;

    // Torna alla mappa dopo 1.5 secondi
    setTimeout(() => {
        if (typeof tornaAllaMappa === "function") {
            tornaAllaMappa();
        }
    }, 1500);
}



function gestisciKONemico() {
    if (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) {
        if (typeof gestisciKOBossChallenge === 'function') {
            return gestisciKOBossChallenge();
        }
    }
    
    document.getElementById("img-nemico").classList.add("danno-subito");
    const fNem = getSpriteName(nemicoPokemon.nome);
    let folderPathNem = `../Sprite/personaggi/${fNem}`;
    if (nemicoPokemon.immagine) {
        const lastSlash = nemicoPokemon.immagine.lastIndexOf('/');
        if (lastSlash !== -1) {
            folderPathNem = nemicoPokemon.immagine.substring(0, lastSlash);
        }
    }
    document.getElementById("img-nemico").src = `${folderPathNem}/${fNem}KO.jpeg`;

    setTimeout(() => {
        if (nemiciIncontro.length > 0) {
            nemicoPokemon = nemiciIncontro.shift();
            haUsatoUltNemico = false;
            resettaEffettiSuTarget("nemico");
            document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `Il nemico manda in campo <strong>${nemicoPokemon.nome}</strong>! Tocca a te!`;
            aggiornaGrafica();
            abilitaControlliGiocatore();
        } else {
            gestisciVittoriaIncontro();
        }
    }, isSkipAttivo ? 1000 : 2000);
}


// ==========================================================
// EFFETTI ELEMENTALI LIVELLO 3
// ==========================================================
function applicaEffettoElementaleLv3(attaccante, bersaglio, elemento) {
    let targetId = (bersaglio === nemicoPokemon) ? "nemico" : "giocatore";
    let attId = (attaccante === mioPokemon) ? "giocatore" : "nemico";
    let msg = "";
    if (bersaglio.isImmune === 1) {
        const buffPersonali = ["VOLANTE", "BUIO", "NORMALE", "SPETTRO", "ACCIAIO", "DRAGO", "COLEOTTERO", "FOLLETTO"];
        if (!buffPersonali.includes(elemento.toUpperCase())) {
            let actionName = "applicare l'effetto di stato";
            const el = elemento.toUpperCase();
            if (el === "VELENO") actionName = "avvelenamento";
            else if (el === "FUOCO") actionName = "scottatura";
            else if (el === "ELETTRO") actionName = "paralisi";
            else if (el === "GHIACCIO") actionName = "congelamento";
            else if (el === "ERBA") actionName = "seme sanguisuga";
            else if (el === "PSICO") actionName = "stordimento";
            
            return `<br>🛡️ Tentato ${actionName}, ma ${bersaglio.nome} è immune!`;
        }
    }

    switch(elemento.toUpperCase()) {
        case "FUOCO":
            // Bruciatura: 10% max HP per 3 turni
            effettiAttivi[targetId].bruciatura = { durata: 3, dannoFisso: Math.max(1, Math.round(bersaglio.hpMax * 0.10)) };
            msg = `<br>\u{1f525} ${bersaglio.nome} ha subito una scottatura!`;
            break;
        case "ERBA":
            // Seme Sanguisuga: Ruba 10% hp per 3 turni
            effettiAttivi[targetId].semeSanguisuga = { durata: 3, drainFisso: Math.max(1, Math.round(bersaglio.hpMax * 0.10)), origin: attId };
            msg = `<br>\u{1f33f} Piantato un seme sanguisuga su ${bersaglio.nome}!`;
            break;
        case "ACQUA":
            // Bagnato: -20% velocit\u00e0 per 3 turni
            effettiAttivi[targetId].velRidotta = { durata: 3, percentuale: 0.20 };
            msg = `<br>\u{1f4a7} ${bersaglio.nome} \u00e8 stato inzuppato! (Velocit\u00e0 ridotta)`;
            break;
        case "ELETTRO":
            // Paralisi: 25% prob di saltare il turno per 3 turni
            effettiAttivi[targetId].paralisi = { durata: 3 };
            msg = `<br>&#9889; <strong style="color:#f9ca24">${bersaglio.nome} è paralizzato! (Potrebbe tentennare)</strong>`;
            break;
        case "GHIACCIO":
            // Congelamento: 10% prob di saltare turno per 3 turni
            effettiAttivi[targetId].congelamento = { durata: 3 };
            msg = `<br>\u2744\ufe0f ${bersaglio.nome} sta congelando!`;
            break;
        case "TERRA":
            // Cecit\u00e0: 20% miss chance per 3 turni
            effettiAttivi[targetId].cecita = { durata: 3 };
            msg = `<br>\u{1faa8} ${bersaglio.nome} \u00e8 stato accecato dalla sabbia!`;
            break;
        case "VOLANTE":
            // Vento in coda: buff velocit\u00e0 20% all'attaccante per 3 turni
            effettiAttivi[attId].ventoInCoda = { durata: 3, percentuale: 0.20 };
            msg = `<br>\u{1f32a}\ufe0f Il vento soffia a favore di ${attaccante.nome}! (Velocit\u00e0 aumentata)`;
            break;
        case "VELENO":
            // Avvelenamento: 15% max HP per 3 turni
            effettiAttivi[targetId].veleno = { durata: 3, dannoFisso: Math.max(1, Math.round(bersaglio.hpMax * 0.15)) };
            msg = `<br>\u2620\ufe0f ${bersaglio.nome} \u00e8 stato avvelenato!`;
            break;
        case "LOTTA":
            // Provocazione: bersaglio prende +15% danni per 3 turni
            effettiAttivi[targetId].provocato = { durata: 3, percentuale: 0.15 };
            msg = `<br>\u{1f94a} ${bersaglio.nome} \u00e8 stato provocato! (Difese abbassate)`;
            break;
        case "LUCE":
            // Difesa ridotta: bersaglio fa -15% danni per 3 turni
            effettiAttivi[targetId].difesaRidotta = { durata: 3, percentuale: 0.15 };
            msg = `<br>\u2728 ${bersaglio.nome} \u00e8 stato accecato dalla luce! (Attacco ridotto)`;
            break;
        case "BUIO":
            // Paura: bersaglio ha 15% prob di saltare turno per 3 turni
            effettiAttivi[targetId].paura = { durata: 3 };
            msg = `<br>\u{1f311} ${bersaglio.nome} \u00e8 terrorizzato!`;
            break;
        case "NORMALE":
            // Nessun effetto speciale
            break;
    }
    return msg;
}

function processaEffettiInizioTurno(pokemon, isNemico) {
    let targetId = isNemico ? "nemico" : "giocatore";
    let saltato = false;
    let msg = "";
    
    if (!effettiAttivi || !effettiAttivi[targetId]) return false;

    // Stordimento (100% skip turn)
    if (effettiAttivi[targetId].stordito && effettiAttivi[targetId].stordito.durata > 0) {
        effettiAttivi[targetId].stordito.durata--;
        if (!saltato) {
            msg += `<br>\u{1f4ab} ${pokemon.nome} è stordito e salta il turno!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].stordito.durata === 0) effettiAttivi[targetId].stordito = null;
    }

    // Paralisi (25% di skip)
    if (effettiAttivi[targetId].paralisi && effettiAttivi[targetId].paralisi.durata > 0) {
        effettiAttivi[targetId].paralisi.durata--;
        if (!saltato && Math.random() < 0.25) {
            msg += `<br>&#9889; <strong style="color:#f9ca24">${pokemon.nome} tentenna!</strong>`;
            const imgTargetId = isNemico ? "img-nemico" : "img-giocatore";
            const imgEl = document.getElementById(imgTargetId);
            if (imgEl) {
                imgEl.classList.remove("animazione-tentenna");
                void imgEl.offsetWidth; // Trigger reflow per riavviare l'animazione
                imgEl.classList.add("animazione-tentenna");
            }
            saltato = true;
        }
        if (effettiAttivi[targetId].paralisi.durata === 0) effettiAttivi[targetId].paralisi = null;
    }
    
    // Congelamento (10% di skip)
    if (effettiAttivi[targetId].congelamento && effettiAttivi[targetId].congelamento.durata > 0) {
        effettiAttivi[targetId].congelamento.durata--;
        if (!saltato && Math.random() < 0.10) {
            msg += `<br>\u2744\ufe0f ${pokemon.nome} è congelato solido!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].congelamento.durata === 0) effettiAttivi[targetId].congelamento = null;
    }

    // Paura (15% di skip)
    if (effettiAttivi[targetId].paura && effettiAttivi[targetId].paura.durata > 0) {
        effettiAttivi[targetId].paura.durata--;
        if (!saltato && Math.random() < 0.15) {
            msg += `<br>\u{1f311} ${pokemon.nome} trema per la paura e non attacca!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].paura.durata === 0) effettiAttivi[targetId].paura = null;
    }

    // Cecità (20% miss) -> non salta il turno, ma facciamo finta missi l'attacco
    if (effettiAttivi[targetId].cecita && effettiAttivi[targetId].cecita.durata > 0) {
        effettiAttivi[targetId].cecita.durata--;
        if (!saltato && Math.random() < 0.20) {
            msg += `<br>\u{1faa8} A causa della sabbia negli occhi, l'attacco di ${pokemon.nome} fallisce!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].cecita.durata === 0) effettiAttivi[targetId].cecita = null;
    }

    if (msg !== "") {
        document.getElementById("console-log").innerHTML += msg;
    }
    
    // Aggiorniamo sempre la grafica a inizio turno per rimuovere eventuali icone di stati scaduti (durata === 0)
    aggiornaGrafica();
    
    return saltato;
}

function processaEffettiFineTurno(pokemon, isNemico) {
    let targetId = isNemico ? "nemico" : "giocatore";
    let msg = "";

    if (effettiAttivi[targetId].bruciatura && effettiAttivi[targetId].bruciatura.durata > 0) {
        let dmg = effettiAttivi[targetId].bruciatura.dannoFisso;
        pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - dmg);
        effettiAttivi[targetId].bruciatura.durata--;
        msg += `<br>\u{1f525} ${pokemon.nome} subisce ${dmg} danni da scottatura.`;
        if (effettiAttivi[targetId].bruciatura.durata === 0) effettiAttivi[targetId].bruciatura = null;
    }

    if (effettiAttivi[targetId].veleno && effettiAttivi[targetId].veleno.durata > 0) {
        let dmg = effettiAttivi[targetId].veleno.dannoFisso;
        pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - dmg);
        effettiAttivi[targetId].veleno.durata--;
        msg += `<br>\u2620\ufe0f ${pokemon.nome} subisce ${dmg} danni da avvelenamento.`;
        if (effettiAttivi[targetId].veleno.durata === 0) effettiAttivi[targetId].veleno = null;
    }

    if (effettiAttivi[targetId].semeSanguisuga && effettiAttivi[targetId].semeSanguisuga.durata > 0) {
        let dmg = effettiAttivi[targetId].semeSanguisuga.drainFisso;
        pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - dmg);
        let origId = effettiAttivi[targetId].semeSanguisuga.origin;
        let pkmOrig = origId === "giocatore" ? mioPokemon : nemicoPokemon;
        if (pkmOrig && pkmOrig.hpAttuali > 0) {
            pkmOrig.hpAttuali = Math.min(pkmOrig.hpMax, pkmOrig.hpAttuali + dmg);
        }
        effettiAttivi[targetId].semeSanguisuga.durata--;
        msg += `<br>\u{1f33f} Le radici prosciugano ${dmg} HP da ${pokemon.nome}!`;
        if (effettiAttivi[targetId].semeSanguisuga.durata === 0) effettiAttivi[targetId].semeSanguisuga = null;
    }

    // Decremento turni passivi (buff/debuff statici)
    const statici = ["velRidotta", "ventoInCoda", "difesaRidotta", "provocato", "defRidotta"];
    statici.forEach(eff => {
        if (effettiAttivi[targetId][eff] && effettiAttivi[targetId][eff].durata > 0) {
            effettiAttivi[targetId][eff].durata--;
            if (effettiAttivi[targetId][eff].durata === 0) effettiAttivi[targetId][eff] = null;
        }
    });

    if (msg !== "") {
        document.getElementById("console-log").innerHTML += msg;
    }
    
    // Aggiorniamo sempre la grafica a fine turno per rimuovere eventuali icone di stati scaduti
    aggiornaGrafica();
}

// Funzione per animazione multi-frame o singola
function eseguiAnimazioneAttaccoNormale(pokemon, isGiocatore, callback) {
    const totalFrames = pokemon.frameAtk || 1;
    const imgElement = document.getElementById(isGiocatore ? "img-giocatore" : "img-nemico");
    const durataTotale = isSkipAttivo ? 750 : 1500;
    
    if (totalFrames <= 1) {
        if (pokemon.immagineAtk) {
            imgElement.src = pokemon.immagineAtk;
        }
        setTimeout(() => {
            imgElement.src = pokemon.immagine;
            if (callback) callback();
        }, durataTotale);
    } else {
        // Multi-frame
        const frameDuration = Math.max(50, Math.floor(durataTotale / (totalFrames + 1)));
        let currentFrame = 1;
        
        let basePath = pokemon.immagineAtk;
        let extIndex = basePath.lastIndexOf('.');
        let baseName = basePath.substring(0, extIndex);
        let ext = basePath.substring(extIndex);
        
        let interval = setInterval(() => {
            if (currentFrame <= totalFrames) {
                imgElement.src = baseName + currentFrame + ext;
                currentFrame++;
            } else {
                clearInterval(interval);
                imgElement.src = pokemon.immagine;
                if (callback) callback();
            }
        }, frameDuration);
    }
}


// Mostra overlay warning boss
function riproduciVideoSchermoIntero(src, callback) {
    if (!src) {
        if (callback) callback();
        return;
    }
    
    let videoOverlay = document.getElementById("video-ult-overlay");
    if (!videoOverlay) {
        videoOverlay = document.createElement("div");
        videoOverlay.id = "video-ult-overlay";
        videoOverlay.style.position = "fixed";
        videoOverlay.style.top = "0";
        videoOverlay.style.left = "0";
        videoOverlay.style.width = "100%";
        videoOverlay.style.height = "100%";
        videoOverlay.style.backgroundColor = "black";
        videoOverlay.style.zIndex = "9999";
        videoOverlay.style.display = "flex";
        videoOverlay.style.justifyContent = "center";
        videoOverlay.style.alignItems = "center";
        
        const video = document.createElement("video");
        video.id = "video-ult-player";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "contain";
        videoOverlay.appendChild(video);
        document.body.appendChild(videoOverlay);
    }

    const videoPlayer = document.getElementById("video-ult-player");
    videoPlayer.src = src;
    videoPlayer.onended = () => {
        setTimeout(() => {
            videoOverlay.style.display = "none";
            if (callback) callback();
        }, 1000);
    };
    videoOverlay.style.display = "flex";
    videoPlayer.play().catch(e => {
        console.error("Autoplay video bloccato:", e);
        videoOverlay.style.display = "none";
        if (callback) callback();
    });
}

function mostraWarningBoss(callback, nomeBoss) {
    const warningDiv = document.getElementById("warning-overlay");
    
    let videoPath = null;
    if (nomeBoss) {
        let base = nomeBoss.toLowerCase().replace(/ fase 2/g, "").replace(/\s+/g, "");
        if (!base.startsWith("max")) {
            base = base.replace(/f[23]/g, "");
        }
        
        const videoMap = {
            "sat": "../Sprite/personaggi/Sat/SatULT.mp4",
            "edo": "../Sprite/personaggi/Edo/EdoULT.mp4",
            "mattia": "../Sprite/personaggi/Mattia/MattiaULT.mp4",
            "savina": "../Sprite/personaggi/Savina/SavinaULT.mp4",
            "maccioni": "../Sprite/personaggi/Maccioni/MaccioniULT.mp4",
            "dinicola": "../Sprite/personaggi/DiNicola/DiNicolaULT.mp4",
            "donato": "../Sprite/personaggi/Donato/DonatoULT.mp4",
            "gio": "../Sprite/personaggi/Gio/GioULT.mp4",
            "max": "../Sprite/personaggi/Max/MaxULT.mp4",
            "maxf2": "../Sprite/personaggi/Max/MaxULT.mp4",
            "maxf3": "../Sprite/personaggi/MaxF2/MaxF2ULT.mp4"
        };
        if (videoMap[base]) {
            videoPath = videoMap[base];
        }
    }

    const riproduciVideo = () => {
        riproduciVideoSchermoIntero(videoPath, callback);
    };

    if (warningDiv) {
        warningDiv.style.display = "flex";
        setTimeout(() => {
            warningDiv.style.display = "none";
            riproduciVideo();
        }, 3000);
    } else {
        riproduciVideo();
    }
}

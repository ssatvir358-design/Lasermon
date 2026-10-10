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
        return "<br><span style='color: #ff4757; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255, 71, 87, 0.8); padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>🛡️ Non ha alcun effetto! (Immunità) 🛡️</span>";
    }
    if (moltiplicatore >= 1.5) {
        return `<br><span style='color: #2ecc71; font-weight: bold; text-shadow: 0 0 5px rgba(46, 204, 113, 0.6); padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>💪 🎯 superefficace! (x${moltiplicatore}) 💪</span>`;
    }
    if (moltiplicatore > 1) {
        return `<br><span style='color: #3498db; font-weight: bold; text-shadow: 0 0 5px rgba(52, 152, 219, 0.6); padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>⚡ Efficace! (x${moltiplicatore}) ⚡</span>`;
    }
    if (moltiplicatore < 1) {
        return `<br><span style='color: #f39c12; font-style: italic; opacity: 0.9; padding: 2px 5px; background: rgba(0,0,0,0.5); border-radius: 4px; display: inline-block; margin-top: 5px;'>📉 Non è molto efficace... (x${moltiplicatore}) 📉</span>`;
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
    if (window.BattleFX) BattleFX.observeHealth();
    function generaStatusEmojiHTML(targetId) {
        let html = "";
        if (typeof effettiAttivi !== 'undefined' && effettiAttivi && effettiAttivi[targetId]) {
            let eff = effettiAttivi[targetId];
            if (eff.bruciatura) html += "🔥";
            if (eff.veleno) html += "☠️";
            if (eff.semeSanguisuga) html += "🌱";
            if (eff.paralisi) html += "⚡";
            if (eff.congelamento) html += "❄️";
            if (eff.cecita) html += "👁️";
            if (eff.paura) html += "👻";
            if (eff.velRidotta) html += "🐢";
            if (eff.provocato) html += "😡";
            if (eff.difesaRidotta) html += "🛡️";
        }
        return html ? `<span style="margin-left: 5px; font-size: 1.2em;">${html}</span>` : "";
    }

    if (mioPokemon) {
        let statusG = generaStatusEmojiHTML("giocatore");
        if (mioPokemon.bruciato && (typeof effettiAttivi === 'undefined' || !effettiAttivi || !effettiAttivi.giocatore || !effettiAttivi.giocatore.bruciatura)) {
            statusG = `<span style="margin-left: 5px; font-size: 1.2em;">🔥</span>` + statusG;
        }

        const nomeG = document.getElementById("nome-giocatore");
        const lvlG = document.getElementById("lvl-giocatore");
        if (nomeG) nomeG.innerHTML = `${mioPokemon.nome} ${typeof getHtmlElemento === 'function' ? getHtmlElemento(mioPokemon.elemento) : ''} ${statusG}`;
        if (lvlG) lvlG.innerText = `L.${mioPokemon.livello}`;
        
        const hpG = document.getElementById("hp-giocatore");
        if (hpG) hpG.innerText = `${Math.floor(mioPokemon.hpAttuali)}/${mioPokemon.hpMax}`;

        const pctG = Math.max(0, (mioPokemon.hpAttuali / mioPokemon.hpMax) * 100);
        const barraG = document.getElementById("barra-giocatore");
        if (barraG) {
            barraG.style.width = `${pctG}%`;
            if (pctG <= 20)      barraG.style.backgroundColor = "#ff3838";
            else if (pctG <= 50) barraG.style.backgroundColor = "#ffb300";
            else                 barraG.style.backgroundColor = "#2ecc71";
        }

        if (typeof miaSquadra !== 'undefined') {
            const vivi = Math.max(0, miaSquadra.filter(p => p.hpAttuali > 0).length - 1);
            const rimG = document.getElementById("trainer-pokeballs");
            if (rimG && typeof generaHtmlPokeball === 'function') rimG.innerHTML = generaHtmlPokeball(vivi);
        }
        
        if (mioPokemon.hpAttuali > 0) {
            const imgG = document.getElementById("img-giocatore");
            if (imgG && !imgG.dataset.attackAnimating) imgG.src = mioPokemon.immagine;
        }
    }

    if (typeof nemicoPokemon !== 'undefined' && nemicoPokemon) {
        let statusN = generaStatusEmojiHTML("nemico");
        
        const nomeN = document.getElementById("nome-nemico");
        const lvlN = document.getElementById("lvl-nemico");
        if (nomeN) nomeN.innerHTML = `${nemicoPokemon.nome} ${typeof getHtmlElemento === 'function' ? getHtmlElemento(nemicoPokemon.elemento) : ''} ${statusN}`;
        if (lvlN) lvlN.innerText = `L.${nemicoPokemon.livello}`;
        
        const hpN = document.getElementById("hp-nemico");
        if (hpN) hpN.innerText = `${Math.floor(nemicoPokemon.hpAttuali)}/${nemicoPokemon.hpMax}`;

        const pctN = Math.max(0, (nemicoPokemon.hpAttuali / nemicoPokemon.hpMax) * 100);
        const barraN = document.getElementById("barra-nemico");
        if (barraN) {
            barraN.style.width = `${pctN}%`;
            if (pctN <= 20)      barraN.style.backgroundColor = "#ff3838";
            else if (pctN <= 50) barraN.style.backgroundColor = "#ffb300";
            else                 barraN.style.backgroundColor = "#2ecc71";
        }
        
        if (typeof aggiornaFasiBoss === 'function') aggiornaFasiBoss(nemicoPokemon);
        
        if (nemicoPokemon.hpAttuali > 0) {
            const imgN = document.getElementById("img-nemico");
            if (imgN && !imgN.dataset.attackAnimating) imgN.src = nemicoPokemon.immagine;
        }
    }
}

// Manda in campo il primo Pok\u00e9mon vivo della squadra
function mandaInCampoMioPokemon() {
    mioPokemon = miaSquadra.find(p => p.hpAttuali > 0);
    indiceMioPokemonAttuale = miaSquadra.indexOf(mioPokemon);

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
    if (typeof aggiornaGrafica === "function") aggiornaGrafica();
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
    resettaItemTurno();
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

    const vsFallback = pokemon => function() {
        if (this.src.endsWith('.png')) this.src = this.src.replace('.png', '.jpeg');
        else { this.onerror = null; this.src = pokemon.immagine; }
    };
    imgVSGio.onerror = vsFallback(mioPokemon);
    imgVSNem.onerror = vsFallback(nemicoPokemon);

    imgVSGio.src = getVsImgPath(mioPokemon);
    imgVSNem.src = getVsImgPath(nemicoPokemon);
    precaricaFrameAttacco(mioPokemon);
    precaricaFrameAttacco(nemicoPokemon);
    if (typeof GamePresentation !== 'undefined') GamePresentation.syncFighters();

    latoGio.classList.remove("entra");
    latoNem.classList.remove("entra");
    testoVS.classList.remove("attiva");
    document.querySelector(".sfondo-vs-custom").classList.remove("attiva", "vs-exit");
    divVS.style.display = "block";

    setTimeout(() => {
        latoGio.classList.add("entra");
        latoNem.classList.add("entra");
        testoVS.classList.add("attiva");
        document.querySelector(".sfondo-vs-custom").classList.add("attiva");
    }, 50);

    setTimeout(() => {
        if (divVS.style.display !== "none") document.querySelector(".sfondo-vs-custom").classList.add("vs-exit");
    }, 1800);

    setTimeout(() => {
        document.querySelector(".sfondo-vs-custom").classList.remove("attiva", "vs-exit");
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
            document.getElementById("console-log").innerHTML += "<hr>" + (tipoEvento === "cespuglio" ? `Un ${nemicoPokemon.nome} selvatico appare!` : `L'allenatore manda in campo ${nemicoPokemon.nome}!`);
            abilitaControlliGiocatore();
        }
    }, 2000);
}


// ----------------------------------------------------------
// TURNO GIOCATORE
// ----------------------------------------------------------

function turnoGiocatore() {
    if (!mioPokemon || document.getElementById("btn-attacco").disabled) return;
    
    ItemSystem.beginTurn(mioPokemon);
    if (processaEffettiInizioTurno(mioPokemon, false)) {
        // A blocked action still ends the turn; disable input before its timer.
        ["btn-attacco", "btn-pokemon", "btn-item", "btn-fuga"].forEach(id => document.getElementById(id).disabled = true);
        UltimateActions.complete(mioPokemon, false, false);
        return;
    }
    if (document.getElementById("btn-attacco").disabled) return;
    document.getElementById("btn-attacco").disabled = true;
    document.getElementById("btn-pokemon").disabled = true;
    document.getElementById("btn-fuga").disabled = true;
    aggiornaStatoBtnItem(); // Disabilita item button mentre attacca

    if (tipoAttaccoInCorso === 'speciale') {
        UltimateActions.player();
        return;
    }
    if (tipoAttaccoInCorso === 'elementale') {
        if (!UltimateSystem.availability(mioPokemon, 'elementale').ok) { abilitaControlliGiocatore(); return; }
        mioPokemon.elementalUses--;
        UltimateSystem.log(`${mioPokemon.nome}: utilizzi elementali ${mioPokemon.elementalUses}/10.`, 'risorse');
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

﻿function getMoltStatBagnato(target) {
    if (effettiAttivi[target] && effettiAttivi[target].bagnato) {
        return Math.max(0.5, 1.0 - (0.10 * effettiAttivi[target].bagnato.stack));
    }
    return 1.0;
}

function getMoltStatOmbra(target) {
    if (effettiAttivi[target] && effettiAttivi[target].ombra && effettiAttivi[target].ombra.durata > 0) {
        return Math.max(0.4, 1.0 - (0.15 + (effettiAttivi[target].ombra.extraSteal || 0) + (0.15 * effettiAttivi[target].ombra.stack)));
    }
    return 1.0;
}

function applicaModificatoriStatBase(valore, target) {
    let moltB = getMoltStatBagnato(target);
    let moltO = getMoltStatOmbra(target);
    return Math.round(valore * moltB * moltO);
}

function calcolaEdEseguiDannoGiocatore(moltMossa, nomeMossaUsata) {
    const hpNemicoPrimaFX = nemicoPokemon.hpAttuali;
    if (nemicoPokemon.isInvulnerable) {
        if (window.BattleFX) BattleFX.hit({source:'player',label:'SCUDO'});
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + "L'attacco rimbalza! Il nemico e invulnerabile!";
        if (!continuaAttaccoItem(moltMossa,nomeMossaUsata)) { processaEffettiFineTurno(mioPokemon,false); setTimeout(turnoNemico,isSkipAttivo?500:1000); }
        return;
    }

    let moltiplicatoreTipo = ItemSystem.efficacy(mioPokemon,nemicoPokemon,CONFIG_DEBOLEZZE[mioPokemon.elemento.toLowerCase()]?.[nemicoPokemon.elemento.toLowerCase()] ?? 1.0);

    const isUlt = moltMossa >= 3.0;
    let schivataNemica = calcolaSchivata(nemicoPokemon);
    if (ItemSystem.evade(nemicoPokemon,schivataNemica,isUlt)) {
        if (window.BattleFX) BattleFX.hit({source:'player',label:'SCHIVATO'});
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + nemicoPokemon.nome + " schiva l'attacco!";
        if (continuaAttaccoItem(moltMossa,nomeMossaUsata)) return;
        processaEffettiFineTurno(mioPokemon, false);
        if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
            if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
            if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
        } else {
            setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
        }
        return;
    }

    let dragoBonus = 1.0;
    if (tipoAttaccoInCorso === 'elementale' && mioPokemon.elemento.toLowerCase() === "drago") {
        let percHP = mioPokemon.hpAttuali / mioPokemon.hpMax;
        if (percHP >= 0.50 && percHP <= 0.79) dragoBonus = 1.15;
        else if (percHP >= 0.30 && percHP <= 0.49) dragoBonus = 1.35;
        else if (percHP >= 0.02 && percHP <= 0.29) dragoBonus = 1.50;
        else if (percHP < 0.02) dragoBonus = 2.0;
    }

    const isSpecial = ItemSystem.stat(mioPokemon, 'atkSpec') > ItemSystem.stat(mioPokemon, 'atk');
    
    let baseAtkGioc = applicaModificatoriStatBase(ItemSystem.stat(mioPokemon,isSpecial?"atkSpec":"atk"), "giocatore");
    let baseDefNem = applicaModificatoriStatBase(ItemSystem.stat(nemicoPokemon,isSpecial?"defSpec":"def"), "nemico");

    let atkEffettivo = calcolaStatConEffetti(baseAtkGioc, null, effettiAttivi.giocatore.atkBoost);
    let defEffettiva = calcolaStatConEffetti(baseDefNem, effettiAttivi.nemico.defRidotta, null);

    let dannoBase = (atkEffettivo * atkEffettivo) / (atkEffettivo + defEffettiva);

    let modDanno = 1.0;
    if (effettiAttivi.nemico.livido && effettiAttivi.nemico.livido.stack > 0) {
        modDanno += 0.15 * effettiAttivi.nemico.livido.stack;
    }
    if (effettiAttivi.nemico.congelato && effettiAttivi.nemico.congelato.durata > 0) {
        if (mioPokemon.elemento.toLowerCase() === "lotta") modDanno += 1.0;
        else if (mioPokemon.elemento.toLowerCase() === "fuoco") modDanno += 0.15;
        else modDanno += 0.20;
    }
    if (effettiAttivi.nemico.shock && effettiAttivi.nemico.shock.durata > 0) {
        if (Math.random() < 0.50) modDanno += 0.22;
    }

    let dannoFatto = ItemSystem.mitigation(nemicoPokemon,ItemSystem.damage(mioPokemon,nemicoPokemon,dannoBase * moltiplicatoreTipo * moltMossa * modDanno * dragoBonus,moltiplicatoreTipo,isUlt?"ultimate":tipoAttaccoInCorso));

    if (effettiAttivi.nemico.congelato && effettiAttivi.nemico.congelato.durata > 0) {
        effettiAttivi.nemico.congelato.durata = 0;
        if (mioPokemon.elemento.toLowerCase() === "fuoco") {
            effettiAttivi.nemico.bagnato = { stack: 1, turniSenzaBagnato: 0 };
            document.getElementById("console-log").innerHTML += "<br>Il fuoco scioglie il ghiaccio e bagna " + nemicoPokemon.nome + "!";
        } else {
            document.getElementById("console-log").innerHTML += "<br>Il ghiaccio si infrange per il colpo!";
        }
    }

    if (dannoFatto < 1 && moltiplicatoreTipo > 0) dannoFatto = 1;

    let dannoAttivo = dannoFatto;
    if (isUlt && mioPokemon.raritaTipo === "bombers" && mioPokemon.nome.toLowerCase().includes("lanza") && !nemicoPokemon.isInvulnerable) {
        dannoAttivo = Math.max(9999, nemicoPokemon.hpMax * 2);
    }
    
    if (effettiAttivi.nemico.ombra && effettiAttivi.nemico.ombra.durata > 0) {
        if (Math.random() < 0.50) {
            let curaO = Math.round(dannoAttivo * 0.24);
            nemicoPokemon.hpAttuali = Math.min(nemicoPokemon.hpMax, nemicoPokemon.hpAttuali + curaO);
            if (window.BattleFX) BattleFX.heal('enemy', nemicoPokemon.hpAttuali - hpNemicoPrimaFX);
            dannoAttivo = 0;
            document.getElementById("console-log").innerHTML += "<br>L'Ombra assorbe il colpo e cura " + nemicoPokemon.nome + " di " + curaO + " HP!";
        } else {
            dannoAttivo *= 2;
            effettiAttivi.nemico.ombra.stack = Math.min(3, effettiAttivi.nemico.ombra.stack + 1);
            document.getElementById("console-log").innerHTML += "<br>L'Ombra implode! Danni raddoppiati ma ruba stat!";
        }
    }

    if (dannoAttivo > 0) {
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoAttivo);
    }

    if (window.BattleFX) BattleFX.hit({source:'player',element:mioPokemon.elemento,damage:Math.max(0,hpNemicoPrimaFX-nemicoPokemon.hpAttuali),efficacy:moltiplicatoreTipo,kind:isUlt?'ultimate':tipoAttaccoInCorso==='elementale'?'elementale':'base'});

    if (isUlt && mioPokemon.nome.toLowerCase().includes("lanza")) {
        miaSquadra.forEach((p, index) => {
            if (p) {
                if (p === mioPokemon) p.hpAttuali = 0;
                else p.hpAttuali = Math.max(0, p.hpAttuali - Math.round(p.hpMax * 0.25));
            }
        });
        nemicoPokemon.hpAttuali = 0;
    }

    let msgElementale = "";
    if (tipoAttaccoInCorso === 'elementale') {
        msgElementale = applicaEffettoElementaleLv3(mioPokemon, nemicoPokemon, mioPokemon.elemento);
    }
    if (msgElementale !== "") {
        document.getElementById("console-log").innerHTML += msgElementale;
    }

    let effMsg = getMessaggioEfficacia(moltiplicatoreTipo, dannoAttivo);
    if (moltiplicatoreTipo === 0) {
        effMsg = "<br>Il bersaglio e immune!";
        dannoAttivo = 0;
    }
    document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" +
        mioPokemon.nome + " usa " + nomeMossaUsata + "! " + effMsg + "<br>" + nemicoPokemon.nome + " subisce " + Math.round(dannoAttivo) + " danni!";

    if (continuaAttaccoItem(moltMossa,nomeMossaUsata)) return;
        processaEffettiFineTurno(mioPokemon, false);

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
    UltimateSystem.inheritPhase(nemicoPokemon, f2);
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

let attaccoRubatoItem = false;
function continuaAttaccoItem(multiplier,name) {
    if (mioPokemon?.hpAttuali>0 && nemicoPokemon?.hpAttuali>0 && ItemSystem.repeat(mioPokemon)) {
        tipoAttaccoInCorso="auto";
        eseguiAnimazioneAttaccoNormale(mioPokemon,true,()=>calcolaEdEseguiDannoGiocatore(CONFIG_MOSSE[mioPokemon.livelloMossa]||1,getNomeMossaAttuale(mioPokemon)));
        return true;
    }
    if(attaccoRubatoItem){
        attaccoRubatoItem=false;processaEffettiFineTurno(mioPokemon,false);
        if(nemicoPokemon.hpAttuali<=0)gestisciKONemico();
        else if(mioPokemon.hpAttuali<=0)gestisciKOGiocatore();
        else abilitaControlliGiocatore();
        return true;
    }
    return false;
}
function eseguiAttaccoRubatoItem() {
    attaccoRubatoItem=true;tipoAttaccoInCorso='auto';ItemSystem.beginTurn(mioPokemon);
    UltimateSystem.log(`${mioPokemon.nome}: agisce durante il turno nemico rubato, poi avrà il proprio turno normale.`, 'turni');
    if (processaEffettiInizioTurno(mioPokemon,false)) {
        attaccoRubatoItem=false;
        processaEffettiFineTurno(mioPokemon,false);
        if(mioPokemon.hpAttuali<=0)gestisciKOGiocatore();
        else if(nemicoPokemon.hpAttuali<=0)gestisciKONemico();
        else abilitaControlliGiocatore();
        return;
    }
    eseguiAnimazioneAttaccoNormale(mioPokemon,true,()=>calcolaEdEseguiDannoGiocatore(CONFIG_MOSSE[mioPokemon.livelloMossa]||1,getNomeMossaAttuale(mioPokemon)));
}

function turnoNemico() {
    ["btn-attacco", "btn-pokemon", "btn-item", "btn-fuga"].forEach(id => document.getElementById(id).disabled = true);
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
            if(ItemSystem.takeBattery(mioPokemon)) eseguiAttaccoRubatoItem();
            else abilitaControlliGiocatore();
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

    if (usaUlt && nemicoPokemon.raritaTipo === "bombers" && nemicoPokemon.livello >= 50 && (nemicoPokemon.legacyUltimateUses ?? 3) > 0) {
        nemicoPokemon.legacyUltimateUses = (nemicoPokemon.legacyUltimateUses ?? 3) - 1;
        UltimateSystem.log(`${nemicoPokemon.nome}: usi della mossa boss dedicata ${nemicoPokemon.legacyUltimateUses}/3.`, "risorse");
        haUsatoUltNemico = true;
        nemicoPokemon._selectedMoveKind = "speciale";
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
            const datiFase2  = pokemonDatabase.find(p => p.nome.toLowerCase() === nomeFase2.toLowerCase() || p.nome.toLowerCase() === (nemicoPokemon.nome + " F2").toLowerCase());
            if (datiFase2) {
                const lvl = nemicoPokemon.livello || 1;
                const nuoviHpMax = Math.round(datiFase2.hpBase * (1 + (lvl * 0.2)));
                const precedenteFase = nemicoPokemon;
                nemicoPokemon = Object.assign(creaPokemon(datiFase2, lvl, 3, true), {
                    nome: datiFase2.nome, livello: lvl, inFase2: true,
                    hpMax: nuoviHpMax, hpAttuali: Math.max(1, Math.round(nuoviHpMax * 0.50)),
                    atk: Math.round(datiFase2.atkBase * (1 + (lvl * 0.2))),
                    def: Math.round(datiFase2.defBase * (1 + (lvl * 0.2))),
                    atkSpec: Math.round((datiFase2.atkSpec || datiFase2.atkBase) * (1 + (lvl * 0.2))),
                    defSpec: Math.round((datiFase2.defSpec || datiFase2.defBase) * (1 + (lvl * 0.2))),
                    vel: Math.round(datiFase2.velBase * (1 + (lvl * 0.2))),
                    immagine: datiFase2.immagine, immagineAtk: datiFase2.immagineAtk, frameAtk: datiFase2.frameAtk || 1,
                    mossaLvl1: datiFase2.mossaLvl1, mossaLvl2: datiFase2.mossaLvl2,
                    mossaLvl3: datiFase2.mossaLvl3,
                    mossaULT:  datiFase2.mossaULT || datiFase2.mossaLvl3,
                    numFrameUlt: datiFase2.numFrameUlt || 3,
                    elemento: datiFase2.elemento, boss: true,
                    raritaTipo: datiFase2.raritaTipo, livelloMossa: 3
                });
                UltimateSystem.inheritPhase(precedenteFase, nemicoPokemon);
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
    nemicoPokemon._selectedMoveKind = UltimateSystem.availability(nemicoPokemon, 'elementale', true).ok && Math.random() < .30 ? 'elementale' : 'auto';
    if(nemicoPokemon._selectedMoveKind === 'elementale') {
        nemicoPokemon.elementalUses--;
        UltimateSystem.log(`${nemicoPokemon.nome}: usi elementali ${nemicoPokemon.elementalUses}/10.`, 'risorse');
    }

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
    }, {kind:nemicoPokemon._selectedMoveKind==='elementale'?'elementale':'base',move:nomeMossa});
}

function calcolaEdEseguiDannoNemico(moltMossa, nomeMossaUsata, tipoEffettoSpeciale) {
    const hpGiocatorePrimaFX = mioPokemon.hpAttuali;
    if (mioPokemon.isInvulnerable) {
        if (window.BattleFX) BattleFX.hit({source:'enemy',label:'SCUDO'});
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + "L'attacco rimbalza!";
        processaEffettiFineTurno(nemicoPokemon,true);
        abilitaControlliGiocatore();
        return;
    }

    let moltiplicatoreTipo = ItemSystem.efficacy(nemicoPokemon,mioPokemon,CONFIG_DEBOLEZZE[nemicoPokemon.elemento.toLowerCase()]?.[mioPokemon.elemento.toLowerCase()] ?? 1.0);

    const isUlt = moltMossa >= 3.0;
    let schivataGiocatore = calcolaSchivata(mioPokemon);
    if (ItemSystem.evade(mioPokemon,schivataGiocatore,isUlt)) {
        if (window.BattleFX) BattleFX.hit({source:'enemy',label:'SCHIVATO'});
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + mioPokemon.nome + " schiva l'attacco!";
        processaEffettiFineTurno(nemicoPokemon, true);
        if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
        else abilitaControlliGiocatore();
        return;
    }

    const isSpecial = ItemSystem.stat(nemicoPokemon, 'atkSpec') > ItemSystem.stat(nemicoPokemon, 'atk');
    
    let baseAtkNem = applicaModificatoriStatBase(ItemSystem.stat(nemicoPokemon,isSpecial?"atkSpec":"atk"), "nemico");
    let baseDefGioc = applicaModificatoriStatBase(ItemSystem.stat(mioPokemon,isSpecial?"defSpec":"def"), "giocatore");

    let atkEffettivo = calcolaStatConEffetti(baseAtkNem, effettiAttivi.nemico.atkRidotto, effettiAttivi.nemico.atkBoost);
    let defEffettiva = calcolaStatConEffetti(baseDefGioc, effettiAttivi.giocatore.defRidotta, effettiAttivi.giocatore.defBoost);

    let dannoBase = (atkEffettivo * atkEffettivo) / (atkEffettivo + defEffettiva);

    let modDanno = 1.0;
    if (effettiAttivi.giocatore.livido && effettiAttivi.giocatore.livido.stack > 0) modDanno += 0.15 * effettiAttivi.giocatore.livido.stack;
    
    if (effettiAttivi.giocatore.congelato && effettiAttivi.giocatore.congelato.durata > 0) {
        if (nemicoPokemon.elemento.toLowerCase() === "lotta") modDanno += 1.0;
        else if (nemicoPokemon.elemento.toLowerCase() === "fuoco") modDanno += 0.15;
        else modDanno += 0.20;
    }
    if (effettiAttivi.giocatore.shock && effettiAttivi.giocatore.shock.durata > 0) {
        if (Math.random() < 0.50) modDanno += 0.22;
    }
    let modEdo = 1.0;
    if (mioPokemon.nome === "Edo" && ["normale", "luce", "buio"].includes(nemicoPokemon.elemento.toLowerCase())) modEdo = 0.5;

    let dannoFatto = ItemSystem.mitigation(mioPokemon,ItemSystem.damage(nemicoPokemon,mioPokemon,dannoBase * moltiplicatoreTipo * moltMossa * modDanno * modEdo,moltiplicatoreTipo,isUlt?"ultimate":nemicoPokemon._selectedMoveKind));
    
    if (effettiAttivi.giocatore.congelato && effettiAttivi.giocatore.congelato.durata > 0) {
        effettiAttivi.giocatore.congelato.durata = 0;
        if (nemicoPokemon.elemento.toLowerCase() === "fuoco") {
            effettiAttivi.giocatore.bagnato = { stack: 1, turniSenzaBagnato: 0 };
            document.getElementById("console-log").innerHTML += "<br>Il fuoco scioglie il ghiaccio e ti bagna!";
        } else {
            document.getElementById("console-log").innerHTML += "<br>Il ghiaccio si infrange!";
        }
    }

    if (dannoFatto < 1 && moltiplicatoreTipo > 0) dannoFatto = 1;

    let dannoAttivo = dannoFatto;
    
    if (effettiAttivi.giocatore.ombra && effettiAttivi.giocatore.ombra.durata > 0) {
        if (Math.random() < 0.50) {
            let curaO = Math.round(dannoAttivo * 0.24);
            mioPokemon.hpAttuali = Math.min(mioPokemon.hpMax, mioPokemon.hpAttuali + curaO);
            if (window.BattleFX) BattleFX.heal('player', mioPokemon.hpAttuali - hpGiocatorePrimaFX);
            dannoAttivo = 0;
            document.getElementById("console-log").innerHTML += "<br>La tua Ombra assorbe il colpo curandoti di " + curaO + " HP!";
        } else {
            dannoAttivo *= 2;
            effettiAttivi.giocatore.ombra.stack = Math.min(3, effettiAttivi.giocatore.ombra.stack + 1);
            document.getElementById("console-log").innerHTML += "<br>L'Ombra implode! Prendi danni doppi ma rubi stat!";
        }
    }

    if (dannoAttivo > 0) {
        if (effettiAttivi.giocatore.scudoSabbia && effettiAttivi.giocatore.scudoSabbia.attiva) {
            if (Math.random() < 0.60) {
                let dado = Math.floor(Math.random() * 20) + 1;
                let percRimbalzo = 0;
                if (dado >= 1 && dado <= 9) percRimbalzo = 0.08;
                else if (dado >= 10 && dado <= 17) percRimbalzo = 0.15;
                else if (dado >= 18 && dado <= 19) percRimbalzo = 0.50;
                else if (dado === 20) percRimbalzo = 1.0;
                
                let dannoRiflesso = Math.round(dannoAttivo * percRimbalzo);
                if (dannoRiflesso > 0) {
                    const hpPrimaRiflessoFX = nemicoPokemon.hpAttuali;
                    UltimateSystem.damage(mioPokemon, nemicoPokemon, dannoRiflesso, {pure:true,reflection:true,label:"Scudo di Sabbia"});

                    document.getElementById("console-log").innerHTML += "<br>Lo scudo di sabbia riflette " + dannoRiflesso + " danni al nemico!";
                }
            }
            effettiAttivi.giocatore.scudoSabbia = null;
        }
        UltimateSystem.damage(nemicoPokemon, mioPokemon, dannoAttivo, {kind:isUlt?"ultimate":nemicoPokemon._selectedMoveKind,basic:nemicoPokemon._selectedMoveKind==="auto",label:nomeMossaUsata});
    }



    let msgElementale = "";
    if (nemicoPokemon._selectedMoveKind === 'elementale' || (isUlt && Math.random() < .30)) {
        msgElementale = applicaEffettoElementaleLv3(nemicoPokemon, mioPokemon, nemicoPokemon.elemento);
    }
    if (msgElementale !== "") {
        document.getElementById("console-log").innerHTML += msgElementale;
    }

    let effMsg = getMessaggioEfficacia(moltiplicatoreTipo, dannoAttivo);
    if (moltiplicatoreTipo === 0) {
        effMsg = "<br>Sei immune!";
        dannoAttivo = 0;
    }
    document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" +
        nemicoPokemon.nome + " usa " + nomeMossaUsata + "! " + effMsg + "<br>" + mioPokemon.nome + " subisce " + Math.round(dannoAttivo) + " danni!";

    processaEffettiFineTurno(nemicoPokemon, true);

    if (mioPokemon.hpAttuali <= 0 || nemicoPokemon.hpAttuali <= 0) {
        if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
        if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
    } else {
        abilitaControlliGiocatore();
    }
}


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

    setTimeout(() => {
        cambiaSchermata("schermata-gioco", "schermata-mappa");
        aggiornaGrafica();
        aggiornaSquadraMappa();
        generaMappaAlbero();
        document.getElementById("btn-attacco").style.display = "";
        document.getElementById("btn-item").style.display = "";
        document.getElementById("btn-pokemon").style.display = "";
        document.getElementById("btn-fuga").style.display = (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) ? "none" : "";
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
    const folder = getSpriteName(pokemon.nome);
    eseguiAnimazioneAttaccoNormale({
        ...pokemon,
        immagineAtk: `../Sprite/personaggi/${folder}/${folder}Ult${totalFrames === 1 ? '1' : ''}.jpeg`,
        frameAtk: totalFrames
    }, idElementoImg === 'img-giocatore', callbackDanno, {
        kind: 'ultimate', duration: totalFrames * (isSkipAttivo ? 500 : 1000)
    });
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
    if (nemicoPokemon && typeof CONFIG_FASI_BOSS !== 'undefined' && CONFIG_FASI_BOSS[nemicoPokemon.nome]) {
        const config = CONFIG_FASI_BOSS[nemicoPokemon.nome];
        let faseAttuale = nemicoPokemon.faseAttuale || 0;
        
        if (faseAttuale < config.fasi.length - 1) {
            nemicoPokemon.faseAttuale = faseAttuale + 1;
            const nuovaFase = config.fasi[nemicoPokemon.faseAttuale];
            nemicoPokemon.hpMax = nuovaFase.hpMax;
            nemicoPokemon.hpAttuali = nuovaFase.hpMax;
            
            document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + `<strong>${nemicoPokemon.nome}</strong> entra nella ${nemicoPokemon.faseAttuale + 1}&deg; Fase!`;
            
            resettaEffettiSuTarget("nemico");
            
            aggiornaGrafica();
            
            if (typeof isRunVeloce !== 'undefined' && isRunVeloce && !isAutoBattlePaused) {
                setTimeout(turnoGiocatore, (typeof isSkipAttivo !== 'undefined' && isSkipAttivo) ? 500 : 1000);
            } else {
                abilitaControlliGiocatore();
            }
            return;
        }
    }

    if (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) {
        if (typeof gestisciKOBossChallenge === 'function') {
            if(currentChallengePhase >= CHALLENGE_BOSSES[currentChallengeBossId].fasi) ItemSystem.defeat(nemicoPokemon);
            return gestisciKOBossChallenge();
        }
    }
    
    ItemSystem.defeat(nemicoPokemon);
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

    if (bersaglio.isImmune === 1) return "<br>L'attacco elementale non ha effetto!";

    const blockedKey={elettro:'shock',ghiaccio:'congelato',psico:'ipnotizzato',folletto:'ammaliato'}[String(elemento).toLowerCase()];
    if(blockedKey && ItemSystem.immune(bersaglio,blockedKey)) return '<br>Amuleto della Resistenza: alterazione bloccata!';
    const rand = Math.random();
    let el = elemento.toUpperCase();

    switch(el) {
        case "FUOCO":
            effettiAttivi[targetId].bruciatura = { durata: 3 };
            msg = "<br>Il bersaglio ha subito una scottatura!";
            break;
            
        case "ERBA":
            if (rand <= 0.35) {
                let dado = Math.floor(Math.random() * 20) + 1;
                let atkBase = attaccante.baseAtk || 1;
                let danno = 0; let cura = 0;
                if (dado >= 1 && dado <= 9) cura = Math.round(atkBase * 0.25);
                else if (dado >= 10 && dado <= 17) { danno = Math.round(atkBase * 0.25); cura = Math.round(atkBase * 0.25); }
                else if (dado >= 18 && dado <= 19) { danno = Math.round(atkBase * 0.50); cura = Math.round(atkBase * 0.50); }
                else if (dado === 20) { danno = Math.round(atkBase * 1.0); cura = Math.round(atkBase * 1.0); }
                
                if (danno > 0) UltimateSystem.damage(attaccante, bersaglio, danno, {element:elemento,kind:"elementale",label:"Effetto Erba"});
                if (cura > 0) attaccante.hpAttuali = Math.min(attaccante.hpMax, attaccante.hpAttuali + cura);
                msg = "<br>Effetto Erba (Dado " + dado + ")! Infligge " + danno + " danni e cura " + cura + " HP!";
            }
            break;

        case "ACQUA":
            let currBagnato = effettiAttivi[targetId].bagnato || { stack: 0, turniSenzaBagnato: 0 };
            let prob = [0.60, 0.35, 0.25, 0.15, 0.05][currBagnato.stack] || 0;
            if (rand <= prob && currBagnato.stack < 5) {
                currBagnato.stack++;
                currBagnato.turniSenzaBagnato = 0;
                effettiAttivi[targetId].bagnato = currBagnato;
                msg = "<br>Bersaglio Bagnato! (Stack: " + currBagnato.stack + "/5)";
            } else if (currBagnato.stack > 0) {
                currBagnato.turniSenzaBagnato++;
                effettiAttivi[targetId].bagnato = currBagnato;
            }
            break;

        case "LOTTA":
            if (rand <= 0.55) {
                let currLivido = effettiAttivi[targetId].livido || { stack: 0 };
                if (currLivido.stack < 2) {
                    currLivido.stack++;
                    effettiAttivi[targetId].livido = currLivido;
                    msg = "<br>Livido applicato! (Stack: " + currLivido.stack + "/2)";
                } else {
                    let maxLividoDmg = Math.round((attaccante.baseAtk || 1) * 1.5 * 2.0); // 1.5 * 2
                    UltimateSystem.damage(attaccante, bersaglio, maxLividoDmg, {element:elemento,kind:"elementale",label:"Terzo Livido"});
                    effettiAttivi[targetId].livido = null;
                    msg = "<br>Terzo Livido! Danno devastante extra: " + maxLividoDmg;
                }
            } else {
                effettiAttivi[targetId].livido = null;
            }
            break;
            
        case "ELETTRO":
            if (rand <= 0.35) {
                effettiAttivi[targetId].shock = { durata: 3 };
                msg = "<br>Bersaglio in Shock!";
            }
            break;
            
        case "TERRA":
            if (attId === "giocatore") {
                effettiAttivi.giocatore.scudoSabbia = { attiva: true };
                msg = "<br>Scudo di Sabbia preparato!";
            }
            break;
            
        case "VENTO":
            if (rand <= 0.25) {
                effettiAttivi[attId].volo = { durata: 1 };
                attaccante.isInvulnerable = true;
                msg = "<br>" + attaccante.nome + " prende il volo!";
            }
            break;
            
        case "VELENO":
            if (rand <= 0.35) {
                effettiAttivi[targetId].veleno = { durata: 3 };
                msg = "<br>Bersaglio avvelenato gravemente!";
            }
            break;
            
        case "GHIACCIO":
            if (rand <= 0.35) {
                effettiAttivi[targetId].congelato = { durata: 2 };
                msg = "<br>Bersaglio Congelato!";
            }
            break;
            
        case "PSICO":
            if (rand <= 0.35) {
                effettiAttivi[targetId].ipnotizzato = { durata: 2 };
                msg = "<br>Bersaglio Ipnotizzato!";
            }
            break;
            
        case "FOLLETTO":
            if (rand <= 0.40) {
                effettiAttivi[targetId].ammaliato = { durata: 1 };
                msg = "<br>Bersaglio Ammaliato!";
            }
            break;
            
        case "BUIO":
            if (rand <= 0.35) {
                effettiAttivi[targetId].ombra = { durata: 2, stack: 0 };
                msg = "<br>Ombra applicata sul bersaglio!";
            }
            break;
            
        case "LUCE":
            if (rand <= 0.28) {
                effettiAttivi[targetId].benedizione = { durata: 2 };
                msg = "<br>Luce accecante! Benedizione applicata.";
            }
            break;
    }
    const key={fuoco:'bruciatura',veleno:'veleno',buio:'ombra',acqua:'bagnato'}[String(elemento).toLowerCase()];
    if(key && msg) ItemSystem.stamp(attaccante,bersaglio,key);
    return msg;
}



function processaEffettiInizioTurno(pokemon, isNemico) {
    let targetId = isNemico ? "nemico" : "giocatore";
    if(ItemSystem.skip(pokemon,isNemico)) return true;
    for(const key of ['shock','congelato','ipnotizzato','ammaliato']) if(ItemSystem.immune(pokemon,key)) effettiAttivi[targetId][key]=null;
    let saltato = false;
    let msg = "";

    if (!effettiAttivi || !effettiAttivi[targetId]) return false;

    if (effettiAttivi[targetId].volo && effettiAttivi[targetId].volo.durata > 0) {
        effettiAttivi[targetId].volo.durata--;
        if (effettiAttivi[targetId].volo.durata === 0) {
            effettiAttivi[targetId].volo = null;
            pokemon.isInvulnerable = false;
            msg += "<br>" + pokemon.nome + " scende in picchiata dal cielo!";
        }
    }
    
    if (effettiAttivi[targetId].shock && effettiAttivi[targetId].shock.durata > 0) {
        effettiAttivi[targetId].shock.durata--;
        msg += "<br>" + pokemon.nome + " e bloccato dallo Shock e salta il turno!";
        saltato = true;
        ItemSystem.shock(pokemon,isNemico);
        if (effettiAttivi[targetId].shock.durata === 0) effettiAttivi[targetId].shock = null;
    } else if (effettiAttivi[targetId].congelato && effettiAttivi[targetId].congelato.durata > 0) {
        effettiAttivi[targetId].congelato.durata--;
        msg += "<br>" + pokemon.nome + " e congelato solido e non puo muoversi!";
        saltato = true;
        if (effettiAttivi[targetId].congelato.durata === 0) effettiAttivi[targetId].congelato = null;
    } else if (effettiAttivi[targetId].benedizione && effettiAttivi[targetId].benedizione.durata > 0) {
        effettiAttivi[targetId].benedizione.durata--;
        msg += "<br>" + pokemon.nome + " e accecato dalla Benedizione e non puo attaccare!";
        if (effettiAttivi[targetId].benedizione.durata === 1) {
            // Primo turno: prova a forzare switch se e il nemico e ha panchinari
            if (isNemico && typeof nemiciIncontro !== 'undefined' && nemiciIncontro.length > 0) {
                nemiciIncontro.push(nemicoPokemon);
                nemicoPokemon = nemiciIncontro.shift();
                msg += "<br>" + pokemon.nome + " e forzato a scambiarsi con " + nemicoPokemon.nome + "!";
                aggiornaGrafica();
            } else if (isNemico) {
                msg += "<br>Il nemico non ha sostituti!";
            }
        }
        saltato = true;
        if (effettiAttivi[targetId].benedizione.durata === 0) effettiAttivi[targetId].benedizione = null;
    } else if (effettiAttivi[targetId].ipnotizzato && effettiAttivi[targetId].ipnotizzato.durata > 0) {
        effettiAttivi[targetId].ipnotizzato.durata--;
        let randI = Math.random();
        if (randI < 0.40) {
            msg += "<br>" + pokemon.nome + " si addormenta profondamente per colpa dell'ipnosi!";
            saltato = true;
        } else if (randI < 0.80) {
            let dmg = Math.round((pokemon.atk || 1) * 0.75);
            pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - dmg);
            msg += "<br>" + pokemon.nome + " nella confusione si colpisce da solo per " + dmg + " danni!";
            saltato = true;
        } else {
            msg += "<br>" + pokemon.nome + " ignora l'ipnosi!";
        }
        if (effettiAttivi[targetId].ipnotizzato.durata === 0) effettiAttivi[targetId].ipnotizzato = null;
    } else if (effettiAttivi[targetId].ammaliato && effettiAttivi[targetId].ammaliato.durata > 0) {
        effettiAttivi[targetId].ammaliato.durata--;
        let bersId = isNemico ? "giocatore" : "nemico";
        let attO = isNemico ? nemicoPokemon : mioPokemon;
        let difO = isNemico ? mioPokemon : nemicoPokemon;
        
        let targetBench = isNemico ? miaSquadra.filter(p => p && p !== mioPokemon && p.hpAttuali > 0) : (typeof nemiciIncontro !== 'undefined' ? nemiciIncontro : []);
        
        let randA = Math.random();
        if (targetBench.length > 0) {
            if (randA < 0.30) {
                let dmg = Math.round((attO.atk || 1) * 0.30);
                let randT = targetBench[Math.floor(Math.random() * targetBench.length)];
                randT.hpAttuali = Math.max(0, randT.hpAttuali - dmg);
                msg += "<br>" + pokemon.nome + " per l'ammaliamento attacca " + randT.nome + " in panchina per " + dmg + "!";
                saltato = true;
            } else if (randA < 0.40) {
                let dmg = Math.round((attO.atk || 1) * 0.10);
                difO.hpAttuali = Math.max(0, difO.hpAttuali - dmg);
                msg += "<br>" + pokemon.nome + " ammalitato fa solo il 10% di danno: " + dmg + "!";
                saltato = true;
            } else if (randA < 0.70) {
                let cura = Math.round((attO.atk || 1) * 0.30);
                difO.hpAttuali = Math.min(difO.hpMax, difO.hpAttuali + cura);
                msg += "<br>" + pokemon.nome + " invece di attaccare cura " + difO.nome + " di " + cura + " HP!";
                saltato = true;
            }
        } else {
            if (randA < 0.50) {
                let dmg = Math.round((attO.atk || 1) * 0.10);
                difO.hpAttuali = Math.max(0, difO.hpAttuali - dmg);
                msg += "<br>" + pokemon.nome + " ammalitato fa solo il 10% di danno: " + dmg + "!";
                saltato = true;
            } else {
                let cura = Math.round((attO.atk || 1) * 0.30);
                difO.hpAttuali = Math.min(difO.hpMax, difO.hpAttuali + cura);
                msg += "<br>" + pokemon.nome + " invece di attaccare cura " + difO.nome + " di " + cura + " HP!";
                saltato = true;
            }
        }
        if (effettiAttivi[targetId].ammaliato.durata === 0) effettiAttivi[targetId].ammaliato = null;
    }

    if (msg !== "") document.getElementById("console-log").innerHTML += msg;
    aggiornaGrafica();
    return saltato;
}



function processaEffettiFineTurno(pokemon, isNemico) {
    let targetId = isNemico ? "nemico" : "giocatore";
    let msg = "";

    if (effettiAttivi[targetId].bruciatura && effettiAttivi[targetId].bruciatura.durata > 0) {
        let dmg = 5;
        if (pokemon.hpAttuali >= 41 && pokemon.hpAttuali <= 60) dmg = 8;
        else if (pokemon.hpAttuali >= 61 && pokemon.hpAttuali <= 90) dmg = 11;
        else if (pokemon.hpAttuali >= 91 && pokemon.hpAttuali <= 120) dmg = 14;
        else if (pokemon.hpAttuali >= 121 && pokemon.hpAttuali <= 200) dmg = Math.round(pokemon.hpAttuali * 0.06);
        else if (pokemon.hpAttuali >= 201 && pokemon.hpAttuali <= 350) dmg = Math.round(pokemon.hpAttuali * 0.04);
        else if (pokemon.hpAttuali > 351) dmg = Math.round(pokemon.hpAttuali * 0.035);

        dmg *= effettiAttivi[targetId].bruciatura.itemMultiplier || 1;
        if(window.BattleFX)BattleFX.hit({source:isNemico?'player':'enemy',element:'fuoco',damage:Math.min(pokemon.hpAttuali,dmg),kind:'elementale'});
        pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - dmg);
        effettiAttivi[targetId].bruciatura.durata--;
        msg += "<br>Fuoco consuma " + pokemon.nome + " per " + dmg + " danni.";
        if (effettiAttivi[targetId].bruciatura.durata === 0) effettiAttivi[targetId].bruciatura = null;
    }

    if (effettiAttivi[targetId].veleno && effettiAttivi[targetId].veleno.durata > 0) {
        let perc = pokemon.hpAttuali / pokemon.hpMax;
        let pDmg = 0.12;
        if (perc >= 0.70 && perc <= 0.88) pDmg = 0.10;
        else if (perc >= 0.50 && perc <= 0.69) pDmg = 0.08;
        else if (perc >= 0.20 && perc <= 0.49) pDmg = 0.05;
        else if (perc < 0.20) pDmg = 0.03;
        
        let dmg = Math.max(1, Math.round(pokemon.hpMax * pDmg));
        dmg *= effettiAttivi[targetId].veleno.itemMultiplier || 1;
        if(window.BattleFX)BattleFX.hit({source:isNemico?'player':'enemy',element:'veleno',damage:Math.min(pokemon.hpAttuali,dmg),kind:'elementale'});
        pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - dmg);
        effettiAttivi[targetId].veleno.durata--;
        msg += "<br>Veleno corrode " + pokemon.nome + " per " + dmg + " danni.";
        if (effettiAttivi[targetId].veleno.durata === 0) effettiAttivi[targetId].veleno = null;
    }

    if (effettiAttivi[targetId].bagnato && effettiAttivi[targetId].bagnato.turniSenzaBagnato >= 2 && Math.random() >= (effettiAttivi[targetId].bagnato.retainBonus || 0)) {
        msg += "<br>" + pokemon.nome + " si e asciugato! Statistiche ripristinate.";
        effettiAttivi[targetId].bagnato = null;
    }

    if (effettiAttivi[targetId].ombra && effettiAttivi[targetId].ombra.durata > 0) {
        effettiAttivi[targetId].ombra.durata--;
        if (effettiAttivi[targetId].ombra.durata === 0) effettiAttivi[targetId].ombra = null;
    }

    if (msg !== "") document.getElementById("console-log").innerHTML += msg;
    ItemSystem.finish(pokemon,isNemico);
    aggiornaGrafica();
}

const battleAttackImages = new Map();
let battleAttackSerial = 0;
function frameAttaccoPaths(pokemon) {
    const base=pokemon?.immagineAtk||pokemon?.immagine;
    if(!base)return [];
    const count=Math.max(1,pokemon.frameAtk||1),dot=base.lastIndexOf('.');
    return count<=1?[base]:Array.from({length:count},(_,i)=>base.slice(0,dot)+(i+1)+base.slice(dot));
}
function caricaFrameAttacco(src) {
    if(!battleAttackImages.has(src))battleAttackImages.set(src,new Promise(resolve=>{
        const image=new Image();let done=false;
        const finish=ok=>{if(done)return;done=true;clearTimeout(timer);if(!ok)battleAttackImages.delete(src);resolve(ok?src:null);};
        // Network failures must remain retryable; a timeout cannot poison the cache.
        const timer=setTimeout(()=>finish(false),10000);
        image.onload=()=>finish(true);image.onerror=()=>finish(false);image.src=src;
    }));
    return battleAttackImages.get(src);
}
function precaricaFrameAttacco(pokemon) {
    return Promise.all(frameAttaccoPaths(pokemon).map(caricaFrameAttacco));
}
function eseguiAnimazioneAttaccoNormale(pokemon, isGiocatore, callback, presentation = {}) {
    const imgElement=document.getElementById(isGiocatore?'img-giocatore':'img-nemico');
    if(!imgElement){if(callback)callback();return;}
    const token=String(++battleAttackSerial),totalFrames=pokemon.frameAtk||1;
    imgElement.dataset.attackAnimating=token;
    const duration=presentation.duration||(isSkipAttivo?750:1500);
    const kind=presentation.kind||(isGiocatore&&tipoAttaccoInCorso==='elementale'?'elementale':!isGiocatore&&pokemon.livelloMossa>=3?'elementale':'base');
    precaricaFrameAttacco(pokemon).then(loaded=>{
        if(imgElement.dataset.attackAnimating!==token)return;
        const visible=loaded.filter(Boolean);if(!visible.length)visible.push(pokemon.immagine);
        if(window.BattleFX)BattleFX.cast(pokemon,isGiocatore,duration,kind,presentation.move);
        const direction=isGiocatore?1:-1,reduced=window.BattleFX?.reduced();
        const motion=!reduced?imgElement.animate([
            {translate:'0 0',scale:'1',offset:0},
            {translate:(-direction*8)+'px 3px',scale:kind==='elementale'?'1.07':'1.02',offset:.25},
            {translate:(direction*(kind==='elementale'?28:18))+'px -4px',scale:'1.04',offset:.6},
            {translate:'0 0',scale:'1',offset:1}
        ],{duration,easing:'cubic-bezier(.3,0,.2,1)'}):null;
        let index=0;
        const next=()=>{
            if(imgElement.dataset.attackAnimating!==token){motion?.cancel();return;}
            if(index<visible.length){imgElement.src=visible[index++];setTimeout(next,duration/visible.length);return;}
            delete imgElement.dataset.attackAnimating;motion?.cancel();imgElement.src=pokemon.immagine;
            if(callback)callback();
        };
        next();
    });
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
            "sat": "../Sprite/personaggi/Sat/SatUlt.mp4",
            "edo": "../Sprite/personaggi/Edo/EdoULT.mp4",
            "mattia": "../Sprite/personaggi/Mattia/MattiaULT.mp4",
            "savina": "../Sprite/personaggi/Savina/SavinaULT.mp4",
            "maccioni": "../Sprite/personaggi/Maccioni/MaccioniULT.mp4",
            "dinicola": "../Sprite/personaggi/DiNicola/DiNicolaULT.mp4",
            "donato": "../Sprite/personaggi/Donato/DonatoULT.mp4",
            "gio": "../Sprite/personaggi/Gio/GioULT.mp4",
            "max": "../Sprite/personaggi/Max/MaxULT.mp4",
            "maxf2": "../Sprite/personaggi/Max/MaxULT.mp4",
            "maxf3": "../Sprite/personaggi/Maxf2/MaxF2ULT.mp4"
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

// Auto-scroll console-log
document.addEventListener('DOMContentLoaded', () => {
    const consoleLog = document.getElementById('console-log');
    if (consoleLog) {
        const observer = new MutationObserver(() => {
            consoleLog.scrollTop = consoleLog.scrollHeight;
        });
        observer.observe(consoleLog, { childList: true, subtree: true, characterData: true });
    }
});
// ----------------------------------------------------------
// PANNELLO SELEZIONE ATTACCO (3 CERCHI)
// ----------------------------------------------------------
let tipoAttaccoInCorso = "auto";

function apriPannelloSelezioneAttacco() {
    if (document.getElementById("btn-attacco").disabled) return;
    document.getElementById("pannello-selezione-attacco").style.display = "flex";
    
    // Aggiorna lo stato del bottone elementale
    let btnElem = document.getElementById("btn-attacco-elementale");
    let spanElem = document.getElementById("label-attacco-elementale");
    
    if (mioPokemon && mioPokemon.livelloMossa >= 3) {
        btnElem.className = "cerchio-attacco elementale";
        btnElem.style.cursor = "pointer";
        btnElem.style.background = "#3498db";
        btnElem.style.border = "3px solid #2980b9";
        btnElem.onclick = function() { eseguiSceltaAttacco('elementale'); };
        
        let el = mioPokemon.elemento.toUpperCase();
        spanElem.innerHTML = "ELEM<br><span style='font-size:10px'>" + el + "</span>";
    } else {
        btnElem.className = "cerchio-attacco elementale disabilitato";
        btnElem.style.cursor = "not-allowed";
        btnElem.style.background = "#7f8c8d";
        btnElem.style.border = "3px solid #95a5a6";
        btnElem.onclick = null;
        spanElem.innerHTML = "BLOCCATO";
    }
}

function chiudiPannelloSelezioneAttacco() {
    document.getElementById("pannello-selezione-attacco").style.display = "none";
}

function eseguiSceltaAttacco(tipo) {
    if (tipo === 'elementale' && (!mioPokemon || mioPokemon.livelloMossa < 3)) {
        return; // Non sbloccato
    }
    if (tipo === 'speciale') {
        return; // PRESTO
    }
    
    chiudiPannelloSelezioneAttacco();
    tipoAttaccoInCorso = tipo;
    turnoGiocatore();
}

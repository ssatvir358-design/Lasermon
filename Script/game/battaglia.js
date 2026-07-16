// ==========================================================
// battaglia.js \u2014 Sistema di combattimento
// Dipendenze: stato.js, pokemon_factory.js, schermate.js, audio.js, negozio.js
// ==========================================================

// ==========================================================
// CONFIGURAZIONE LEVEL-UP POST-INCONTRO
// Modifica questi valori per cambiare i livelli guadagnati.
// ==========================================================
const CONFIG_LEVEL_UP = {
    cespuglio: 1,  // +1 livello dopo erba alta
    npc:       2,  // +2 livelli dopo sfida allenatore
    boss:      3   // +3 livelli dopo boss
};


// ----------------------------------------------------------
// HELPERS: messaggi efficacia e grafica arena
// ----------------------------------------------------------

function getMessaggioEfficacia(moltiplicatore) {
    if (moltiplicatore > 1) return "<br><span style='color:#e1b12c; font-weight:bold;'>\u00c8 superefficace!</span>";
    if (moltiplicatore < 1) return "<br><span style='color:#7f8fa6; font-style:italic;'>Non \u00e8 molto efficace...</span>";
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
    if (mioPokemon) {
        document.getElementById("nome-giocatore").innerHTML = `
            ${mioPokemon.nome} ${getHtmlElemento(mioPokemon.elemento)}
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
        
        // Evita di resettare lo sprite se \u00e8 KO
        if (mioPokemon.hpAttuali > 0) {
            document.getElementById("img-giocatore").src = mioPokemon.immagine;
        }
    }

    if (nemicoPokemon) {
        document.getElementById("nome-nemico").innerHTML = `
            ${nemicoPokemon.nome} ${getHtmlElemento(nemicoPokemon.elemento)}
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
        
        // Evita di resettare lo sprite se \u00e8 KO
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
    document.getElementById("btn-attacco").style.display        = "inline-block";
    document.getElementById("btn-attacco").disabled             = false;
    document.getElementById("img-giocatore").src                = mioPokemon.immagine;
    return true;
}

// ----------------------------------------------------------
// Abilita i controlli del turno giocatore (attacco + item)
// Da chiamare ogni volta che ritorna il turno al giocatore.
// ----------------------------------------------------------
function abilitaControlliGiocatore() {
    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-pokemon").disabled = false;
    document.getElementById("btn-fuga").disabled = false;
    resettaItemTurno();      // Resetta il flag "item gi\u00e0 usato"
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
        
    if (nodoObj && nodoObj.livello) {
        livNemico = nodoObj.livello;
        livMossaNemico = nodoObj.livelloMossa || 1;
    } else {
        const configGenerata = calcolaLivelloEMossaMappa(pianoAttuale, tipoEvento);
        livNemico      = configGenerata.livello;
        livMossaNemico = configGenerata.livelloMossa;
    }

    if (tipoEvento === "cespuglio") {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
    } else if (tipoEvento === "npc") {
        for (let i = 0; i < 2; i++) {
            nemiciIncontro.push(creaPokemon(pescaPokemonCasuale([], elementoFiltro), livNemico, livMossaNemico));
        }
    } else {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
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

    const folderGio = mioPokemon.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
    const folderNem = nemicoPokemon.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
    imgVSGio.src = `../Sprite/personaggi/${folderGio}/${mioPokemon.nome}VS.jpeg`;
    imgVSNem.src = `../Sprite/personaggi/${folderNem}/${nemicoPokemon.nome}VS.jpeg`;

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
            document.getElementById("console-log").innerHTML =
                `Il nemico \u00e8 pi\u00f9 veloce! ${nemicoPokemon.nome} attacca per primo!`;
            document.getElementById("btn-attacco").disabled = true;
            document.getElementById("btn-pokemon").disabled = true;
            document.getElementById("btn-fuga").disabled = true;
            aggiornaStatoBtnItem();
            setTimeout(turnoNemico, 1500);
        } else {
            chiAttaccaPerPrimo = "giocatore";
            document.getElementById("console-log").innerHTML = tipoEvento === "cespuglio"
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
        document.getElementById("console-log").innerHTML =
            `\u26a0\ufe0f ${mioPokemon.nome} accumula un'energia devastante...`;
        eseguiAnimazioneUlt(mioPokemon, "img-giocatore", () => {
            calcolaEdEseguiDannoGiocatore(3.0, mioPokemon.mossaULT || "ULTIMATE");
        });
        return;
    }

    // Attacco normale
    document.getElementById("img-giocatore").src = mioPokemon.immagineAtk;
    setTimeout(() => {
        document.getElementById("img-giocatore").src = mioPokemon.immagine;
        const moltMossa = CONFIG_MOSSE[mioPokemon.livelloMossa] || 1.0;
        calcolaEdEseguiDannoGiocatore(moltMossa, getNomeMossaAttuale(mioPokemon));
    }, isSkipAttivo ? 750 : 1500);
}


// ----------------------------------------------------------
// CALCOLO DANNO GIOCATORE \u2192 NEMICO
// ----------------------------------------------------------

function calcolaEdEseguiDannoGiocatore(moltMossa, nomeMossaUsata) {
    const moltiplicatoreTipo = CONFIG_DEBOLEZZE[mioPokemon.elemento]?.[nemicoPokemon.elemento] || 1.0;

    // --- SCHIVATA NEMICO ---
    const schivataNemica = calcolaSchivata(nemicoPokemon);
    if (schivataNemica > 0 && Math.random() * 100 < schivataNemica) {
        document.getElementById("console-log").innerHTML =
            `\u{1f4a8} ${nemicoPokemon.nome} <strong>schiva l'attacco!</strong> (${schivataNemica}% schivata)`;
        
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
    
    let dannoFatto = Math.max(1, Math.round(dannoBase * moltiplicatoreTipo * moltMossa * modDanno));

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
        document.getElementById("console-log").innerHTML =
            `\u{1f6e1}\ufe0f ${nemicoPokemon.nome} usa il suo Scudo per bloccare l'attacco!`;
        aggiornaGrafica();
    } else {
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoFatto);
        const msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
        document.getElementById("console-log").innerHTML =
            `${mioPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoFatto} danni!${msgEfficacia}`;
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
    
    if (nemicoPokemon.hpAttuali <= 0 || mioPokemon.hpAttuali <= 0) {
        if (nemicoPokemon.hpAttuali <= 0) gestisciKONemico();
        if (mioPokemon.hpAttuali <= 0) gestisciKOGiocatore();
    } else {
        setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
    }
}

function turnoNemico() {
    if (!nemicoPokemon || nemicoPokemon.hpAttuali <= 0 || !mioPokemon) return;

    let usaUlt = false;
    let messaggioSpeciale = "";

    // Logica gimmick boss
    if (nemicoPokemon.boss === true && !haUsatoUltNemico) {
        const nomeBoss = nemicoPokemon.nome.toLowerCase();
        if (nomeBoss === "filippo" || nomeBoss === "filippo fase 2") {
            const ceCarraNelTeam = miaSquadra.some(p => p && p.nome.toLowerCase() === "carra");
            if (ceCarraNelTeam) {
                usaUlt = true;
                messaggioSpeciale = "<br>\u{1f6a8} <strong>Filippo nota Carra e si infuria!</strong>";
            } else if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) {
                usaUlt = true;
            }
        } else if (nomeBoss === "lanza" || nomeBoss === "lanza fase 2") {
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * 0.15) usaUlt = true;
        } else {
            if (nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax / 2) usaUlt = true;
        }
    }

    if (usaUlt) {
        haUsatoUltNemico = true;

        // Trasformazione Fase 2
        if (!nemicoPokemon.nome.includes("Fase 2")) {
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
                    immagine: datiFase2.immagine, immagineAtk: datiFase2.immagineAtk,
                    mossaLvl1: datiFase2.mossaLvl1, mossaLvl2: datiFase2.mossaLvl2,
                    mossaLvl3: datiFase2.mossaLvl3,
                    mossaULT:  datiFase2.mossaULT || datiFase2.mossaLvl3,
                    numFrameUlt: datiFase2.numFrameUlt || 3,
                    elemento: datiFase2.elemento, boss: true,
                    raritaTipo: datiFase2.raritaTipo, livelloMossa: 3
                };
                messaggioSpeciale += `<br>\u2728 <strong>Fase Shift! Il boss recupera il 50% della vita!</strong> \u2728`;
                aggiornaGrafica();
            }
        }

        document.getElementById("console-log").innerHTML =
            `\u26a0\ufe0f IL BOSS SI INFURIA! ${nemicoPokemon.nome} prepara l'attacco finale!${messaggioSpeciale}`;
        eseguiAnimazioneUlt(nemicoPokemon, "img-nemico", () => {
            calcolaEdEseguiDannoNemico(3.0, nemicoPokemon.mossaULT);
        });

    } else {
        // Attacco normale
        if (nemicoPokemon.immagineAtk) {
            document.getElementById("img-nemico").src = nemicoPokemon.immagineAtk;
        }
        setTimeout(() => {
            if (!mioPokemon) return;
            document.getElementById("img-nemico").src = nemicoPokemon.immagine;
            const moltMossa = CONFIG_MOSSE[nemicoPokemon.livelloMossa] || 1.0;
            calcolaEdEseguiDannoNemico(moltMossa, getNomeMossaAttuale(nemicoPokemon));
        }, isSkipAttivo ? 750 : 1500);
    }
}

function calcolaEdEseguiDannoNemico(moltMossa, nomeMossaUsata) {
    const moltiplicatoreTipo = CONFIG_DEBOLEZZE[nemicoPokemon.elemento]?.[mioPokemon.elemento] || 1.0;

    // --- SCHIVATA GIOCATORE ---
    const schivataGiocatore = calcolaSchivata(mioPokemon);
    if (schivataGiocatore > 0 && Math.random() * 100 < schivataGiocatore) {
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

    // --- PERK SFONDAMENTO PER GIOCATORE ---
    // (I nemici non hanno perk sfondamento, a meno che non l'abbiano. Lo ometto per i nemici)

    // Calcolo Danno Base
    const dannoBase = (atkEffettivo * atkEffettivo) / (atkEffettivo + defEffettiva);
    
    // Modificatori buff/debuff
    let modDanno = 1.0;
    if (effettiAttivi.nemico.difesaRidotta) modDanno -= effettiAttivi.nemico.difesaRidotta.percentuale;
    if (effettiAttivi.giocatore.provocato) modDanno += effettiAttivi.giocatore.provocato.percentuale;
    
    let dannoFatto = Math.max(1, Math.round(dannoBase * moltiplicatoreTipo * moltMossa * modDanno));

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
    // Mostra immagine KO del Pok\u00e9mon corrente
    const imgGiocatore = document.getElementById("img-giocatore");
    if (imgGiocatore && mioPokemon) {
        const folderGio = mioPokemon.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
        imgGiocatore.src = `../Sprite/personaggi/${folderGio}/${mioPokemon.nome}KO.jpeg`;
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
        document.getElementById("console-log").innerHTML =
            `<strong>${mioPokemon.nome}</strong> \u00e8 esausto! Mandi in campo il prossimo!`;

        setTimeout(() => {
            resettaEffettiSuTarget("giocatore");
            mandaInCampoMioPokemon();
            aggiornaGrafica();
            abilitaControlliGiocatore();
        }, isSkipAttivo ? 800 : 1500);
    } else {
        // Tutta la squadra KO: game over
        setTimeout(() => {
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
    // --- SALVA LIVELLI PRE-LEVEL-UP (per verificare i level cap perk) ---
    const livPreBattle = miaSquadra.map(p => ({ pokemon: p, livelloPre: p ? p.livello : 0 }));

    // --- LEVEL UP ---
    let livUpGuadagnati = 0;
    if (isBossFight) {
        livUpGuadagnati = CONFIG_LEVEL_UP.boss;
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

    // --- GUADAGNO MONETE ---
    // I range/valori sono configurati in CONFIG_MONETE_GUADAGNO (stato.js)
    let moneteGuadagnate = 0;
    if (isBossFight) {
        moneteGuadagnate = CONFIG_MONETE_GUADAGNO.boss.fisso;
    } else if (tipoEventoAttuale === "cespuglio") {
        const { min, max } = CONFIG_MONETE_GUADAGNO.cespuglio;
        moneteGuadagnate = Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (tipoEventoAttuale === "npc") {
        const { min, max } = CONFIG_MONETE_GUADAGNO.npc;
        moneteGuadagnate = Math.floor(Math.random() * (max - min + 1)) + min;
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
    document.getElementById("console-log").innerHTML = msgVittoria;

    // --- GESTIONE BOSS (avanzamento mappa) ---
    if (isBossFight) {
        // Se siamo in mappa 9 e il gauntlet non \u00e8 finito
        if (mappaAttuale === "mappa9" && indiceGauntlet >= 0 && indiceGauntlet < GAUNTLET_MAPPA9.length - 1) {
            indiceGauntlet++;
            document.getElementById("console-log").innerHTML += `<br><strong>${nemicoPokemon.nome} sconfitto! Preparati al prossimo Incredibile... Squadra curata!</strong>`;
            miaSquadra.forEach(p => { if (p) p.hpAttuali = p.hpMax; });
            
            setTimeout(() => {
                // Non finisce la boss fight, riavvia subito la prossima
                cambiaSchermata("schermata-gioco", "schermata-gioco"); // forza restare in gioco
                avviaBossBattle(GAUNTLET_MAPPA9[indiceGauntlet]);
            }, 3000);
            return; // Interrompe il normale flusso di vittoria boss
        }

        // Se arrivo qui, o non \u00e8 mappa9, oppure il gauntlet di mappa 9 \u00e8 concluso (Max sconfitto)
        indiceGauntlet = -1;
        isBossFight = false;
        const chiaviMappe    = Object.keys(ARCHIVIO_MAPPE);
        const indiceProssimo = chiaviMappe.indexOf(mappaAttuale) + 1;

        if (indiceProssimo >= chiaviMappe.length) {
            document.getElementById("console-log").innerHTML =
                "\u{1f3c6} COMPLIMENTI! Hai completato tutte le mappe! \u{1f3c6}";
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
            document.getElementById("btn-attacco").style.display    = "inline-block";
            document.getElementById("btn-item").style.display       = "inline-block";
            document.getElementById("btn-pokemon").style.display    = "inline-block";
            document.getElementById("btn-fuga").style.display       = "inline-block";
            // Torna alla mappa rimosso in quanto buggato e automatico
        });
    }, isSkipAttivo ? 1500 : 3000);
}


// ----------------------------------------------------------
// ANIMAZIONE ULT
// ----------------------------------------------------------

function eseguiAnimazioneUlt(pokemon, idElementoImg, callbackDanno) {
    const totalFrames = pokemon.numFrameUlt || 3;
    let currentFrame  = 1;
    const elementoImg = document.getElementById(idElementoImg);

    if (!elementoImg) { callbackDanno(); return; }

    function mostraProssimoFrame() {
        if (currentFrame <= totalFrames) {
            const folder = pokemon.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
            elementoImg.src = `../Sprite/personaggi/${folder}/${pokemon.nome}Ult${currentFrame}.jpeg`;
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

const GAUNTLET_MAPPA9 = ["9", "12", "11", "10", "13"]; // Kul, Edo, Sat, Gio, Max
let indiceGauntlet = -1;

function avviaBossBattle(idBoss) {
    haUsatoUltGiocatore = false;
    haUsatoUltNemico    = false;
    resettaEffettiAttivi();
    resettaItemFight();

    if (idBoss === "boss_finale") idBoss = "5";

    // Gestione Gauntlet Mappa 9
    if (mappaAttuale === "mappa9") {
        if (indiceGauntlet === -1) indiceGauntlet = 0; // Inizia il gauntlet
        idBoss = GAUNTLET_MAPPA9[indiceGauntlet];
    } else {
        indiceGauntlet = -1; // Resetta per sicurezza
    }

    const datiBoss = ARCHIVIO_BOSS[idBoss];
    if (!datiBoss) return;

    isBossFight    = true;
    nemiciIncontro = [];

    datiBoss.squadra.forEach(pBoss => {
        const base = pokemonDatabase.find(p => p.nome.toLowerCase() === pBoss.nome.toLowerCase());
        if (!base) return;
        const lvl = pBoss.livello;
        let p = creaPokemon(base, lvl, 3);
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
                document.getElementById("console-log").innerHTML =
                    `Il Boss <strong>${nemicoPokemon.nome}</strong> \u00e8 pi\u00f9 veloce e attacca per primo!`;
                document.getElementById("btn-attacco").disabled = true;
                document.getElementById("btn-pokemon").disabled = true;
                document.getElementById("btn-fuga").disabled = true;
                aggiornaStatoBtnItem();
                setTimeout(turnoNemico, 1500);
            } else {
                chiAttaccaPerPrimo = "giocatore";
                document.getElementById("console-log").innerHTML =
                    `Sei pi\u00f9 veloce! Tocca a ${mioPokemon.nome}.`;
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
        document.getElementById("console-log").innerHTML = "<br><span style='color:#e1b12c; font-weight:bold;'>Non puoi fuggire da una Boss Fight!</span>";
        return;
    }

    // Successo al 100%
    document.getElementById("console-log").innerHTML = "<br><span style='color:#4cd137; font-weight:bold;'>Fuga riuscita con successo!</span>";
    
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
    const folderNem = nemicoPokemon.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
    document.getElementById("img-nemico").src =
        `../Sprite/personaggi/${folderNem}/${nemicoPokemon.nome}KO.jpeg`;

    setTimeout(() => {
        if (nemiciIncontro.length > 0) {
            nemicoPokemon = nemiciIncontro.shift();
            haUsatoUltNemico = false;
            resettaEffettiSuTarget("nemico");
            document.getElementById("console-log").innerHTML =
                `Il nemico manda in campo <strong>${nemicoPokemon.nome}</strong>! Tocca a te!`;
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
            msg = `<br>\u26a1 ${bersaglio.nome} \u00e8 paralizzato!`;
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

    // Paralisi (25% di skip)
    if (effettiAttivi[targetId].paralisi && effettiAttivi[targetId].paralisi.durata > 0) {
        effettiAttivi[targetId].paralisi.durata--;
        if (Math.random() < 0.25) {
            msg += `<br>\u26a1 ${pokemon.nome} \u00e8 paralizzato e non pu\u00f2 muoversi!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].paralisi.durata === 0) effettiAttivi[targetId].paralisi = null;
    }
    
    // Congelamento (10% di skip)
    if (!saltato && effettiAttivi[targetId].congelamento && effettiAttivi[targetId].congelamento.durata > 0) {
        effettiAttivi[targetId].congelamento.durata--;
        if (Math.random() < 0.10) {
            msg += `<br>\u2744\ufe0f ${pokemon.nome} \u00e8 congelato solido!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].congelamento.durata === 0) effettiAttivi[targetId].congelamento = null;
    }

    // Paura (15% di skip)
    if (!saltato && effettiAttivi[targetId].paura && effettiAttivi[targetId].paura.durata > 0) {
        effettiAttivi[targetId].paura.durata--;
        if (Math.random() < 0.15) {
            msg += `<br>\u{1f311} ${pokemon.nome} trema per la paura e non attacca!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].paura.durata === 0) effettiAttivi[targetId].paura = null;
    }

    // Cecit\u00e0 (20% miss) -> non salta il turno, ma facciamo finta missi l'attacco
    if (!saltato && effettiAttivi[targetId].cecita && effettiAttivi[targetId].cecita.durata > 0) {
        effettiAttivi[targetId].cecita.durata--;
        if (Math.random() < 0.20) {
            msg += `<br>\u{1faa8} A causa della sabbia negli occhi, l'attacco di ${pokemon.nome} fallisce!`;
            saltato = true;
        }
        if (effettiAttivi[targetId].cecita.durata === 0) effettiAttivi[targetId].cecita = null;
    }

    if (msg !== "") {
        document.getElementById("console-log").innerHTML += msg;
        aggiornaGrafica();
    }
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
    const statici = ["velRidotta", "ventoInCoda", "difesaRidotta", "provocato"];
    statici.forEach(eff => {
        if (effettiAttivi[targetId][eff] && effettiAttivi[targetId][eff].durata > 0) {
            effettiAttivi[targetId][eff].durata--;
            if (effettiAttivi[targetId][eff].durata === 0) effettiAttivi[targetId][eff] = null;
        }
    });

    if (msg !== "") {
        document.getElementById("console-log").innerHTML += msg;
        aggiornaGrafica();
    }
}

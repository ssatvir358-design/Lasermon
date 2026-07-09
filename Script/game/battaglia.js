// ==========================================================
// battaglia.js — Sistema di combattimento
// Dipendenze: stato.js, pokemon_factory.js, schermate.js, audio.js, negozio.js
// ==========================================================

// ==========================================================
// CONFIGURAZIONE LEVEL-UP POST-INCONTRO
// Modifica questi valori per cambiare i livelli guadagnati.
// ==========================================================
const CONFIG_LEVEL_UP = {
    cespuglio: 1,  // +1 livello dopo erba alta
    npc:       2,  // +2 livelli dopo sfida allenatore
    boss:      2   // +2 livelli dopo boss (separato da npc per futura personalizzazione)
};


// ----------------------------------------------------------
// HELPERS: messaggi efficacia e grafica arena
// ----------------------------------------------------------

function getMessaggioEfficacia(moltiplicatore) {
    if (moltiplicatore > 1) return "<br><span style='color:#e1b12c; font-weight:bold;'>È superefficace!</span>";
    if (moltiplicatore < 1) return "<br><span style='color:#7f8fa6; font-style:italic;'>Non è molto efficace...</span>";
    return "";
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

        const vivi = miaSquadra.filter(p => p.hpAttuali > 0).length;
        document.getElementById("rimanenti-giocatore").innerText = `In Squadra: ${vivi}`;
        
        // Evita di resettare lo sprite se è KO
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

        document.getElementById("rimanenti-nemico").innerText = `In attesa: ${nemiciIncontro.length}`;
        
        // Evita di resettare lo sprite se è KO
        if (nemicoPokemon.hpAttuali > 0) {
            document.getElementById("img-nemico").src = nemicoPokemon.immagine;
        }
    }
}

// Manda in campo il primo Pokémon vivo della squadra
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
    resettaItemTurno();      // Resetta il flag "item già usato"
    aggiornaStatoBtnItem();  // Aggiorna stato bottone item
}


// ----------------------------------------------------------
// PREPARAZIONE INCONTRO
// ----------------------------------------------------------

function preparaIncontroBattaglia(tipoEvento) {
    haUsatoUltGiocatore = false;
    haUsatoUltNemico    = false;
    nemiciIncontro      = [];
    isSkipAttivo        = false;
    resettaEffettiAttivi();
    resettaItemFight();   // Azzera tracking item per questo scontro
    resettaPerkFight();   // Azzera tracking perk (salvavita, scudo) per questo scontro
    chiudiPannelloItemBattaglia(); // Assicura che il pannello item sia chiuso

    const configGenerata = calcolaLivelloEMossaMappa(pianoAttuale);
    const livNemico      = configGenerata.livello;
    const livMossaNemico = configGenerata.livelloMossa;

    if (tipoEvento === "cespuglio") {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
    } else if (tipoEvento === "npc") {
        for (let i = 0; i < 2; i++) {
            nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
        }
    } else {
        nemiciIncontro.push(creaPokemon(pescaPokemonCasuale(), livNemico, livMossaNemico));
    }

    nemicoPokemon = nemiciIncontro.shift();
    if (!mandaInCampoMioPokemon()) return;

    // Sfondo dinamico
    const schermataGioco = document.getElementById("schermata-gioco");
    if (schermataGioco && ARCHIVIO_MAPPE[mappaAttuale]) {
        schermataGioco.style.backgroundImage    = `url('${ARCHIVIO_MAPPE[mappaAttuale].sfondo}')`;
        schermataGioco.style.backgroundSize     = "cover";
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
                `Il nemico è più veloce! ${nemicoPokemon.nome} attacca per primo!`;
            document.getElementById("btn-attacco").disabled = true;
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
    if (document.getElementById("btn-attacco").disabled) return;
    document.getElementById("btn-attacco").disabled = true;
    aggiornaStatoBtnItem(); // Disabilita item button mentre attacca

    // Controlla ULT bombers (5% prob)
    if (mioPokemon.raritaTipo === "bombers" && !haUsatoUltGiocatore && Math.random() <= 0.05) {
        haUsatoUltGiocatore = true;
        document.getElementById("console-log").innerHTML =
            `⚠️ ${mioPokemon.nome} accumula un'energia devastante...`;
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
// CALCOLO DANNO GIOCATORE → NEMICO
// ----------------------------------------------------------

function calcolaEdEseguiDannoGiocatore(moltMossa, nomeMossaUsata) {
    const moltiplicatoreTipo = CONFIG_DEBOLEZZE[mioPokemon.elemento]?.[nemicoPokemon.elemento] || 1.0;

    // --- SCHIVATA NEMICO ---
    // Ogni attacco subito dal nemico ha una possibilità di essere schivato
    // in base alla sua velocità e all'eventuale Perk SCHIVATA AUMENTATA.
    const schivataNemica = calcolaSchivata(nemicoPokemon);
    if (schivataNemica > 0 && Math.random() * 100 < schivataNemica) {
        document.getElementById("console-log").innerHTML =
            `&#x1F4A8; ${nemicoPokemon.nome} <strong>schiva l'attacco!</strong> (${schivataNemica}% schivata)`;
        // Anche dopo una schivata: DOT e debuff continuano, poi è il turno del nemico
        applicaDotSeAttivo("nemico");
        decrementaDebuffTurno("nemico");
        setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
        return;
    }

    // ATK giocatore modificato da eventuale buff temporaneo (Contratto Determinato)
    // e DEF nemico modificata da eventuale debuff (LUCE Lv3)
    const atkEffettivo  = calcolaStatConEffetti(mioPokemon.atk,    null, effettiAttivi.giocatore.atkBoost);
    let   defEffettiva  = calcolaStatConEffetti(nemicoPokemon.def, effettiAttivi.nemico.defRidotta, null);

    // --- PERK SFONDAMENTO ---
    // Riduce la difesa nemica effettiva del 25% (Tier 1) o del 50% (Tier 2)
    // prima del calcolo del danno base.
    if (mioPokemon.perkId === "sfondamento") {
        defEffettiva = Math.round(defEffettiva * (1 - CONFIG_PERK.sfondamentoPercTier1));
    } else if (mioPokemon.perkId === "sfondamento_2") {
        defEffettiva = Math.round(defEffettiva * (1 - CONFIG_PERK.sfondamentoPercTier2));
    }

    const dannoBase = (atkEffettivo * atkEffettivo) / (atkEffettivo + defEffettiva);
    let dannoFatto  = Math.max(1, Math.round(dannoBase * moltiplicatoreTipo * moltMossa));

    let msgEffetti = "";

    // Effetti mossa Lv3 elementali del giocatore
    if (mioPokemon.livelloMossa === 3) {
        const ris = applicaEffettoElementaleSuNemico(mioPokemon, dannoFatto);
        dannoFatto = ris.dannoFinale;
        msgEffetti = ris.messaggio;
    }

    // Decrementa boost ATK temporaneo (Contratto Determinato) dopo l'attacco
    if (effettiAttivi.giocatore.atkBoost) {
        effettiAttivi.giocatore.atkBoost.durata--;
        if (effettiAttivi.giocatore.atkBoost.durata <= 0) {
            effettiAttivi.giocatore.atkBoost = null;
            msgEffetti += "<br>📋 Il Contratto Determinato è scaduto!";
        }
    }

    nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoFatto);

    const msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
    document.getElementById("console-log").innerHTML =
        `${mioPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoFatto} danni!${msgEfficacia}${msgEffetti}`;
    aggiornaGrafica();

    // --- PERK DOPPIO ATTACCO ---
    // Probabilità di un secondo colpo (50% del danno base) nello stesso turno.
    const probDoppio = mioPokemon.perkId === "doppio_attacco_2"
        ? CONFIG_PERK.doppioAttaccoProbTier2
        : mioPokemon.perkId === "doppio_attacco"
            ? CONFIG_PERK.doppioAttaccoProbTier1
            : 0;
    if (probDoppio > 0 && Math.random() < probDoppio && nemicoPokemon.hpAttuali > 0) {
        const dannoSecondo = Math.max(1, Math.round(dannoFatto * CONFIG_PERK.doppioAttaccoDannoPerc));
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoSecondo);
        document.getElementById("console-log").innerHTML +=
            `<br>⚡ <strong>Doppio Attacco!</strong> Secondo colpo: ${dannoSecondo} danni!`;
        aggiornaGrafica();
    }

    if (nemicoPokemon.hpAttuali <= 0) {
        // Mostra immagine KO del nemico
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
    } else {
        // Applica DOT bruciatura sul nemico se attiva (FUOCO Lv3)
        applicaDotSeAttivo("nemico");
        // Decrementa durata debuff velocità nemico
        decrementaDebuffTurno("nemico");
        setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
    }
}


// ----------------------------------------------------------
// CALCOLO DANNO NEMICO → GIOCATORE
// ----------------------------------------------------------

function calcolaEdEseguiDannoNemico(moltMossa, nomeMossaUsata) {
    const moltiplicatoreTipo = CONFIG_DEBOLEZZE[nemicoPokemon.elemento]?.[mioPokemon.elemento] || 1.0;

    // --- SCHIVATA GIOCATORE ---
    // La schivata del giocatore viene calcolata sulla sua velocità e perk.
    const schivataGiocatore = calcolaSchivata(mioPokemon);
    if (schivataGiocatore > 0 && Math.random() * 100 < schivataGiocatore) {
        document.getElementById("console-log").innerHTML =
            `&#x1F4A8; ${mioPokemon.nome} <strong>schiva l'attacco nemico!</strong> (${schivataGiocatore}% schivata)`;
        // Anche dopo una schivata: DOT e debuff continuano, poi il turno torna al giocatore
        applicaDotSeAttivo("giocatore");
        decrementaDebuffTurno("giocatore");
        // Incrementa counter scudo (anche se non viene colpito)
        perkBattagliaGiocatore.scudoTurniPassati++;
        abilitaControlliGiocatore();
        return;
    }

    // --- PERK SCUDO ---
    // Ogni N turni, para completamente un attacco (danno azzerato).
    const turniScudo = mioPokemon.perkId === "scudo_2"
        ? CONFIG_PERK.scudoTurniTier2
        : CONFIG_PERK.scudoTurniTier1;
    if ((mioPokemon.perkId === "scudo" || mioPokemon.perkId === "scudo_2")) {
        perkBattagliaGiocatore.scudoTurniPassati++;
        if (perkBattagliaGiocatore.scudoTurniPassati >= turniScudo) {
            perkBattagliaGiocatore.scudoTurniPassati = 0; // resetta il contatore
            document.getElementById("console-log").innerHTML =
                `🔵 <strong>SCUDO!</strong> ${mioPokemon.nome} para completamente l'attacco!`;
            aggiornaGrafica();
            applicaDotSeAttivo("giocatore");
            decrementaDebuffTurno("giocatore");
            abilitaControlliGiocatore();
            return;
        }
    }

    // DEF giocatore con eventuale debuff (LUCE Lv3 nemico)
    const defEffettiva = calcolaStatConEffetti(mioPokemon.def, effettiAttivi.giocatore.defRidotta, null);

    const dannoBase = (nemicoPokemon.atk * nemicoPokemon.atk) / (nemicoPokemon.atk + defEffettiva);
    let dannoSubito = Math.max(1, Math.round(dannoBase * moltiplicatoreTipo * moltMossa));

    let msgEffetti = "";

    // Effetti mossa Lv3 elementali del nemico
    if (nemicoPokemon.livelloMossa === 3) {
        const ris = applicaEffettoElementaleSuGiocatore(nemicoPokemon, dannoSubito);
        dannoSubito = ris.dannoFinale;
        msgEffetti  = ris.messaggio;
    }

    // --- PERK RIGENERAZIONE TIER 2: immunità bruciatura ---
    if ((mioPokemon.perkId === "rigenerazione_2") && effettiAttivi.giocatore.bruciatura) {
        effettiAttivi.giocatore.bruciatura = null;
        msgEffetti += "<br>🟢 Immune alla bruciatura!";
    }

    mioPokemon.hpAttuali = Math.max(0, mioPokemon.hpAttuali - dannoSubito);

    // --- PERK FULL COUNTER ---
    // Restituisce una percentuale del danno subito al nemico, ignorando la difesa.
    const percCounter = mioPokemon.perkId === "full_counter_2"
        ? CONFIG_PERK.fullCounterPercTier2
        : mioPokemon.perkId === "full_counter"
            ? CONFIG_PERK.fullCounterPercTier1
            : 0;
    if (percCounter > 0 && dannoSubito > 0) {
        const dannoCounter = Math.max(1, Math.round(dannoSubito * percCounter));
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoCounter);
        msgEffetti += `<br>🔄 <strong>Full Counter!</strong> ${mioPokemon.nome} restituisce ${dannoCounter} danni!`;
    }

    // --- PERK SPINE ---
    // Danno di ritorsione fisso basato sulla DEF attuale, ignora la difesa nemica.
    const spineDannoBase = mioPokemon.perkId === "spine_2"
        ? CONFIG_PERK.spineDannoBaseTier2
        : CONFIG_PERK.spineDannoBaseTier1;
    const spineDivisore = mioPokemon.perkId === "spine_2"
        ? CONFIG_PERK.spineDivisoreTier2
        : CONFIG_PERK.spineDivisoreTier1;
    if ((mioPokemon.perkId === "spine" || mioPokemon.perkId === "spine_2") && dannoSubito > 0) {
        const dannoSpine = spineDannoBase + Math.floor(mioPokemon.def / spineDivisore);
        nemicoPokemon.hpAttuali = Math.max(0, nemicoPokemon.hpAttuali - dannoSpine);
        msgEffetti += `<br>🌵 <strong>Spine!</strong> ${mioPokemon.nome} infligge ${dannoSpine} danni di ritorsione!`;
    }

    const msgEfficacia = getMessaggioEfficacia(moltiplicatoreTipo);
    document.getElementById("console-log").innerHTML =
        `${nemicoPokemon.nome} usa <strong>${nomeMossaUsata}</strong> ed infligge ${dannoSubito} danni!${msgEfficacia}${msgEffetti}`;
    aggiornaGrafica();

    if (mioPokemon.hpAttuali <= 0) {
        gestisciKOGiocatore();
    } else {
        // Applica DOT bruciatura sul giocatore se attiva
        applicaDotSeAttivo("giocatore");
        decrementaDebuffTurno("giocatore");
        abilitaControlliGiocatore(); // Ritorna il turno al giocatore
    }
}


// ----------------------------------------------------------
// TURNO NEMICO
// ----------------------------------------------------------

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
                messaggioSpeciale = "<br>🚨 <strong>Filippo nota Carra e si infuria!</strong>";
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
                messaggioSpeciale += `<br>✨ <strong>Fase Shift! Il boss recupera il 50% della vita!</strong> ✨`;
                aggiornaGrafica();
            }
        }

        document.getElementById("console-log").innerHTML =
            `⚠️ IL BOSS SI INFURIA! ${nemicoPokemon.nome} prepara l'attacco finale!${messaggioSpeciale}`;
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


// ----------------------------------------------------------
// KO GIOCATORE E VITTORIA
// ----------------------------------------------------------

function gestisciKOGiocatore() {
    // Mostra immagine KO del Pokémon corrente
    const imgGiocatore = document.getElementById("img-giocatore");
    if (imgGiocatore && mioPokemon) {
        const folderGio = mioPokemon.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
        imgGiocatore.src = `../Sprite/personaggi/${folderGio}/${mioPokemon.nome}KO.jpeg`;
    }

    // --- PERK SALVAVITA ---
    // Se il Pokémon ha il Perk Salvavita e ha ancora utilizzi disponibili, sopravvive con 1 HP.
    if (mioPokemon && (mioPokemon.perkId === "salvavita" || mioPokemon.perkId === "salvavita_2")) {
        const maxUsi = mioPokemon.perkId === "salvavita_2"
            ? CONFIG_PERK.salvavitaUsiTier2
            : CONFIG_PERK.salvavitaUsiTier1;
        if (perkBattagliaGiocatore.salvavitaUsati < maxUsi) {
            perkBattagliaGiocatore.salvavitaUsati++;
            mioPokemon.hpAttuali = 1; // sopravvive con 1 HP!
            document.getElementById("console-log").innerHTML +=
                `<br>🛡️ <strong>SALVAVITA!</strong> ${mioPokemon.nome} sopravvive con 1 HP! (${perkBattagliaGiocatore.salvavitaUsati}/${maxUsi})`;
            aggiornaGrafica();
            abilitaControlliGiocatore();
            return; // NON procede con il KO
        }
    }

    const pokemonVivi = miaSquadra.filter(p => p.hpAttuali > 0);

    if (pokemonVivi.length > 0) {
        document.getElementById("console-log").innerHTML =
            `<strong>${mioPokemon.nome}</strong> è esausto! Mandi in campo il prossimo!`;

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
    // Applicata qui perché la stanza è appena stata completata.
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
        msgVittoria += ` 🎉 +${livUpGuadagnati} LVL alla squadra!`;
    }
    if (moneteGuadagnate > 0) {
        msgVittoria += ` 💰 +${moneteGuadagnate} monete!`;
    }
    document.getElementById("console-log").innerHTML = msgVittoria;

    // --- GESTIONE BOSS (avanzamento mappa) ---
    if (isBossFight) {
        // Se siamo in mappa 9 e il gauntlet non è finito
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

        // Se arrivo qui, o non è mappa9, oppure il gauntlet di mappa 9 è concluso (Max sconfitto)
        indiceGauntlet = -1;
        isBossFight = false;
        const chiaviMappe    = Object.keys(ARCHIVIO_MAPPE);
        const indiceProssimo = chiaviMappe.indexOf(mappaAttuale) + 1;

        if (indiceProssimo >= chiaviMappe.length) {
            document.getElementById("console-log").innerHTML =
                "🏆 COMPLIMENTI! Hai completato tutte le mappe! 🏆";
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

    // Mostra "TORNA ALLA MAPPA" e nasconde ATTACCA
    document.getElementById("btn-attacco").style.display    = "none";
    document.getElementById("btn-item").style.display       = "none";
    document.getElementById("btn-torna-mappa").style.display = "inline-block";
    aggiornaGrafica();

    // --- VERIFICA PERK POST-BATTAGLIA ---
    // Controlla se qualche Pokémon ha superato il level cap e deve scegliere un Perk.
    // La callback è il ritorno normale alla mappa (eseguita dopo che tutti i Perk sono scelti).
    setTimeout(() => {
        verificaEAvviaPerk(livPreBattle, () => {
            // Callback: ritorno alla mappa
            cambiaSchermata("schermata-gioco", "schermata-mappa");
            aggiornaGrafica();
            aggiornaSquadraMappa();
            generaMappaAlbero();
            document.getElementById("btn-attacco").style.display    = "inline-block";
            document.getElementById("btn-item").style.display       = "inline-block";
            document.getElementById("btn-torna-mappa").style.display = "none";
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
                    `Il Boss <strong>${nemicoPokemon.nome}</strong> è più veloce e attacca per primo!`;
                document.getElementById("btn-attacco").disabled = true;
                aggiornaStatoBtnItem();
                setTimeout(turnoNemico, 1500);
            } else {
                chiAttaccaPerPrimo = "giocatore";
                document.getElementById("console-log").innerHTML =
                    `Sei più veloce! Tocca a ${mioPokemon.nome}.`;
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
// FUOCO  → Bruciatura (DOT): ATK × 0.25 per 5 turni
// ERBA   → Rigenerazione: cura 15% del danno inflitto
// ACQUA  → Rallentamento: velocità nemico -15% per 3 turni
// BUIO   → Critico 25%: danno ×2 con probabilità 25%
// LUCE   → Debuff difesa: difesa nemico -15% per 3 turni
// ==========================================================

function applicaEffettoElementaleSuNemico(attaccante, dannoBase) {
    let dannoFinale = dannoBase;
    let messaggio   = "";
    const elem = attaccante.elemento;

    if (elem === "fuoco") {
        const dannoFuoco = Math.round(attaccante.atk * 0.25);
        effettiAttivi.nemico.bruciatura = { durata: 5, dannoFisso: dannoFuoco };
        messaggio = `<br>🔥 <strong>Bruciatura applicata!</strong> ${dannoFuoco} danni/turno per 5 turni!`;
    } else if (elem === "erba") {
        const cura = Math.round(dannoBase * 0.15);
        mioPokemon.hpAttuali = Math.min(mioPokemon.hpMax, mioPokemon.hpAttuali + cura);
        messaggio = `<br>🌿 <strong>Rigenerazione!</strong> ${attaccante.nome} recupera ${cura} HP!`;
    } else if (elem === "acqua") {
        effettiAttivi.nemico.velRidotta = { durata: 3, percentuale: 0.15 };
        messaggio = `<br>💧 <strong>Rallentamento!</strong> Velocità nemica -15% per 3 turni!`;
    } else if (elem === "buio") {
        if (Math.random() < 0.25) {
            dannoFinale = dannoBase * 2;
            messaggio   = `<br>🌑 <strong>COLPO CRITICO!</strong> Danno raddoppiato! (${dannoFinale} totali)`;
        }
    } else if (elem === "luce") {
        effettiAttivi.nemico.defRidotta = { durata: 3, percentuale: 0.15 };
        messaggio = `<br>✨ <strong>Difesa indebolita!</strong> Difesa nemica -15% per 3 turni!`;
    }

    return { dannoFinale, messaggio };
}

function applicaEffettoElementaleSuGiocatore(attaccante, dannoBase) {
    let dannoFinale = dannoBase;
    let messaggio   = "";
    const elem = attaccante.elemento;

    if (elem === "fuoco") {
        const dannoFuoco = Math.round(attaccante.atk * 0.25);
        effettiAttivi.giocatore.bruciatura = { durata: 5, dannoFisso: dannoFuoco };
        messaggio = `<br>🔥 <strong>Bruciatura!</strong> Il tuo Pokémon perderà ${dannoFuoco} HP per 5 turni!`;
    } else if (elem === "erba") {
        const cura = Math.round(dannoBase * 0.15);
        nemicoPokemon.hpAttuali = Math.min(nemicoPokemon.hpMax, nemicoPokemon.hpAttuali + cura);
        messaggio = `<br>🌿 <strong>Rigenerazione!</strong> ${attaccante.nome} recupera ${cura} HP!`;
    } else if (elem === "acqua") {
        effettiAttivi.giocatore.velRidotta = { durata: 3, percentuale: 0.15 };
        messaggio = `<br>💧 <strong>Rallentamento!</strong> La tua velocità è ridotta del 15%!`;
    } else if (elem === "buio") {
        if (Math.random() < 0.25) {
            dannoFinale = dannoBase * 2;
            messaggio   = `<br>🌑 <strong>COLPO CRITICO!</strong> Danno raddoppiato! (${dannoFinale} totali)`;
        }
    } else if (elem === "luce") {
        effettiAttivi.giocatore.defRidotta = { durata: 3, percentuale: 0.15 };
        messaggio = `<br>✨ <strong>Difesa indebolita!</strong> La tua difesa è ridotta del 15%!`;
    }

    return { dannoFinale, messaggio };
}

/** Applica il DOT bruciatura al target se attivo, decrementa la durata. */
function applicaDotSeAttivo(target) {
    const effetto = effettiAttivi[target].bruciatura;
    if (!effetto || effetto.durata <= 0) return;

    const pokemon = target === "nemico" ? nemicoPokemon : mioPokemon;
    pokemon.hpAttuali = Math.max(0, pokemon.hpAttuali - effetto.dannoFisso);
    effetto.durata--;

    const msg = effetto.durata <= 0
        ? `<br>🔥 Bruciatura: ${pokemon.nome} -${effetto.dannoFisso} HP (effetto terminato)`
        : `<br>🔥 Bruciatura: ${pokemon.nome} -${effetto.dannoFisso} HP (${effetto.durata} turni)`;
    document.getElementById("console-log").innerHTML += msg;

    if (effetto.durata <= 0) effettiAttivi[target].bruciatura = null;
    aggiornaGrafica();
}

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

/** Decrementa la durata dei debuff velocità e difesa su un target. */
function decrementaDebuffTurno(target) {
    const e = effettiAttivi[target];
    if (e.velRidotta) { e.velRidotta.durata--; if (e.velRidotta.durata <= 0) e.velRidotta = null; }
    if (e.defRidotta) { e.defRidotta.durata--; if (e.defRidotta.durata <= 0) e.defRidotta = null; }
}


// ----------------------------------------------------------
// UI BATTAGLIA (skip, impostazioni, audio)
// ----------------------------------------------------------

/** Attiva la modalità skip (animazioni accelerate). La classe CSS segnala visivamente. */
function attivaSkip() {
    isSkipAttivo = !isSkipAttivo; // Toggle: ri-cliccando si disattiva
    const btn = document.getElementById("btn-skip-fixed");
    if (btn) btn.classList.toggle("attivo", isSkipAttivo);
}

function apriModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "block";
}

function chiudiModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "none";
}

function regolaVolume(val) {
    const audio = document.getElementById("musica-gioco");
    if (audio) audio.volume = parseFloat(val);
    volumePrecedente = parseFloat(val);
}

function toggleMuto(isMuto) {
    const audio = document.getElementById("musica-gioco");
    if (!audio) return;
    if (isMuto) { volumePrecedente = audio.volume; audio.volume = 0; }
    else          { audio.volume = volumePrecedente; }
}

function toggleAutoskip(attivo) {
    isAutoskipAbilitato = attivo;
    isSkipAttivo        = attivo;
    const btn = document.getElementById("btn-skip-fixed");
    if (btn) btn.classList.toggle("attivo", attivo);
}

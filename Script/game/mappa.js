// ==========================================================
// mappa.js — Generazione e rendering della mappa procedurale
// Dipendenze: stato.js, pokemon_factory.js, schermate.js, audio.js,
//             eventi_nodi.js (DB_EVENTI_NODI)
// ==========================================================

// ----------------------------------------------------------
// GENERAZIONE PROCEDURALE DELLA MAPPA
// ----------------------------------------------------------
// Algoritmo:
//   1. Per ogni piano (riga), si costruisce un pool di eventi eligibili
//      leggendo DB_EVENTI_NODI (PianoMin <= piano <= PianoMax).
//   2. Gli eventi che hanno già raggiunto QuantitaMaxPerMappa vengono esclusi.
//   3. Se il pool risulta vuoto (tutti i limitati sono esauriti), usa solo
//      gli eventi con QuantitaMaxPerMappa === -1 come fallback garantito.
//   4. Ultimi due piani: penultimo fisso (centro-medico + npc), ultimo fisso (boss).
// ----------------------------------------------------------

function generaMappaProcedurale() {
    alberoMappa = [];
    mappaEventi = {};

    // Contatore di quante volte ogni tipo di evento è già stato piazzato in questa mappa
    const contatoreEventi = {};
    Object.keys(DB_EVENTI_NODI).forEach(tipo => contatoreEventi[tipo] = 0);

    const ultimoPiano      = schemaAlbero.length - 1; // Piano boss
    const penultimoPiano   = schemaAlbero.length - 2; // Piano medico/npc

    // Centro medico: posizione casuale tra i nodi del penultimo piano
    const indiceMedicoUnico = Math.floor(Math.random() * schemaAlbero[penultimoPiano]);

    for (let pianoIndex = 0; pianoIndex < schemaAlbero.length; pianoIndex++) {
        const numNodi = schemaAlbero[pianoIndex];
        mappaEventi[pianoIndex] = [];
        const nodiDelPiano = [];

        for (let i = 0; i < numNodi; i++) {
            let tipoEvento;

            if (pianoIndex === 0) {
                // Piano START: nessun evento, gestito come radice visiva
                tipoEvento = "start";

            } else if (pianoIndex === ultimoPiano) {
                // Ultimo piano: sempre boss
                tipoEvento = "boss";

            } else if (pianoIndex === penultimoPiano) {
                // Penultimo piano: un unico centro-medico, gli altri npc
                tipoEvento = (i === indiceMedicoUnico) ? "centro-medico" : "npc";
                contatoreEventi["npc"] = (contatoreEventi["npc"] || 0) + (tipoEvento === "npc" ? 1 : 0);

            } else {
                // Piani intermedi: usa il DB_EVENTI_NODI
                tipoEvento = selezionaEventoPerPiano(pianoIndex, contatoreEventi);
                contatoreEventi[tipoEvento] = (contatoreEventi[tipoEvento] || 0) + 1;
            }

            mappaEventi[pianoIndex].push(tipoEvento);
            nodiDelPiano.push({
                id:    `p${pianoIndex}-n${i}`,
                piano: pianoIndex,
                index: i,
                tipo:  tipoEvento,
                figli: []
            });
        }

        alberoMappa.push(nodiDelPiano);
    }

    // Costruzione connessioni padre → figlio tra piani adiacenti
    for (let p = 0; p < alberoMappa.length - 1; p++) {
        const pianoCorr = alberoMappa[p];
        const pianoSucc = alberoMappa[p + 1];
        const numAttuale = pianoCorr.length;
        const numSucc    = pianoSucc.length;

        pianoCorr.forEach((nodo, i) => {
            if (numAttuale === 1) {
                // Nodo singolo: si connette a tutti i successivi
                pianoSucc.forEach(figlio => nodo.figli.push(figlio.id));
            } else if (numSucc === 1) {
                // Piano successivo singolo: tutti si collegano a lui
                nodo.figli.push(pianoSucc[0].id);
            } else if (numSucc === numAttuale + 1) {
                // Piano successivo più largo: ogni nodo prende i due adiacenti
                nodo.figli.push(pianoSucc[i].id);
                nodo.figli.push(pianoSucc[i + 1].id);
            } else if (numSucc === numAttuale - 1) {
                // Piano successivo più stretto: condivisione dei nodi
                if (i > 0)       nodo.figli.push(pianoSucc[i - 1].id);
                if (i < numSucc) nodo.figli.push(pianoSucc[i].id);
            } else {
                // Stessa larghezza: connessione 1:1
                if (pianoSucc[i]) nodo.figli.push(pianoSucc[i].id);
            }
        });
    }
}

/**
 * Seleziona il tipo di evento più appropriato per un dato piano,
 * rispettando i limiti del DB_EVENTI_NODI.
 * @param {number} pianoIndex       - Il piano corrente (1-based logicamente)
 * @param {object} contatoreEventi  - Quante volte ogni evento è già comparso
 * @returns {string}                - Il tipo di evento scelto
 */
function selezionaEventoPerPiano(pianoIndex, contatoreEventi) {
    // 1. Costruisce il pool degli eventi eligibili per questo piano
    const poolEligibili = Object.keys(DB_EVENTI_NODI).filter(tipo => {
        const cfg = DB_EVENTI_NODI[tipo];
        // Deve rientrare nel range di piani
        if (pianoIndex < cfg.PianoMin || pianoIndex > cfg.PianoMax) return false;
        // Deve non aver ancora raggiunto il limite (se -1 è sempre ok)
        if (cfg.QuantitaMaxPerMappa !== -1 && contatoreEventi[tipo] >= cfg.QuantitaMaxPerMappa) return false;
        return true;
    });

    // 2. Se il pool è vuoto, fallback agli eventi infiniti (QuantitaMaxPerMappa === -1)
    if (poolEligibili.length === 0) {
        const fallback = Object.keys(DB_EVENTI_NODI).filter(tipo =>
            DB_EVENTI_NODI[tipo].QuantitaMaxPerMappa === -1 &&
            pianoIndex >= DB_EVENTI_NODI[tipo].PianoMin &&
            pianoIndex <= DB_EVENTI_NODI[tipo].PianoMax
        );
        // Se anche il fallback è vuoto (configurazione errata), usa cespuglio
        return fallback.length > 0
            ? fallback[Math.floor(Math.random() * fallback.length)]
            : "cespuglio";
    }

    // 3. Scelta casuale uniforme tra tutti gli eligibili
    return poolEligibili[Math.floor(Math.random() * poolEligibili.length)];
}

// Controlla se il nodo B (piano+1, indiceB) è figlio registrato del nodo A
function isFiglioValido(pianoIndex, indiceA, indiceB) {
    const nodoA = alberoMappa[pianoIndex][indiceA];
    const idFiglioDesiderato = `p${pianoIndex + 1}-n${indiceB}`;
    return nodoA.figli.includes(idFiglioDesiderato);
}

// Renderizza visivamente l'albero della mappa nel DOM
function generaMappaAlbero() {
    const contenitore = document.getElementById("albero-container");
    contenitore.innerHTML = "";

    schemaAlbero.forEach((numNodi, pianoIndex) => {
        const divPiano = document.createElement("div");
        divPiano.className = "piano";

        for (let i = 0; i < numNodi; i++) {
            if (pianoIndex === 0) {
                // Nodo radice (START)
                const radice = document.createElement("div");
                radice.className = "radice-mappa";
                radice.id = `p${pianoIndex}-n${i}`;
                radice.innerText = "START";
                divPiano.appendChild(radice);
            } else {
                const tipoEvento = mappaEventi[pianoIndex][i];
                const bottone = document.createElement("button");
                bottone.id = `p${pianoIndex}-n${i}`;
                bottone.className = `nodo-bottone evento-${tipoEvento}`;

                // Nodo boss: usa l'immagine chibi del boss corrente
                if (tipoEvento === "boss") {
                    const idBossCorrente = ARCHIVIO_MAPPE[mappaAttuale].idBoss;
                    let imgChibi = ARCHIVIO_BOSS[idBossCorrente].iconaChibi;
                    if (mappaAttuale === "mappa9") {
                        imgChibi = "../Sprite/nodi/4Chibi.png";
                    }
                    bottone.style.backgroundImage = `url('${imgChibi}')`;
                    bottone.style.backgroundSize  = "cover";
                    bottone.classList.remove(`evento-boss`);
                    bottone.classList.add("nodo-boss");
                }

                // Stato del nodo: selezionabile, passato, o bloccato
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

// Disegna le linee SVG di collegamento tra i nodi della mappa
function disegnaLineeMappa() {
    const container = document.getElementById("albero-container");
    if (!container) {
        console.error("Il container albero-container non esiste nel DOM!");
        return;
    }

    // Rimuove il vecchio SVG per evitare duplicati
    const oldSvg = document.getElementById("mappa-svg");
    if (oldSvg) oldSvg.remove();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "mappa-svg";
    Object.assign(svg.style, {
        position: "absolute", top: "0", left: "0",
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: "0"
    });
    container.appendChild(svg);

    alberoMappa.forEach(piano => {
        piano.forEach(nodo => {
            const elA = document.getElementById(nodo.id);
            if (!elA) return;

            nodo.figli.forEach(figlioId => {
                const elB = document.getElementById(figlioId);
                if (!elB) return;

                const rectA = elA.getBoundingClientRect();
                const rectB = elB.getBoundingClientRect();
                const cRect = container.getBoundingClientRect();

                const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
                linea.setAttribute("x1", rectA.left + rectA.width / 2 - cRect.left);
                linea.setAttribute("y1", rectA.top  + rectA.height / 2 - cRect.top);
                linea.setAttribute("x2", rectB.left + rectB.width / 2 - cRect.left);
                linea.setAttribute("y2", rectB.top  + rectB.height / 2 - cRect.top);
                linea.setAttribute("stroke",           "#000000");
                linea.setAttribute("stroke-width",     "2.5");
                linea.setAttribute("stroke-dasharray", "4,4");
                svg.appendChild(linea);
            });
        });
    });
}

// Ridisegna le linee al resize della finestra (solo se la mappa è visibile)
window.addEventListener("resize", () => {
    const mappaElement = document.getElementById("schermata-mappa");
    if (mappaElement && mappaElement.classList.contains("attiva")) {
        disegnaLineeMappa();
    }
});

// Smista il clic su un nodo verso il gestore dell'evento corretto
function avviaEvento(pianoSelezionato, indiceNodo, tipoEvento) {
    pianoAttuale       = pianoSelezionato;
    nodoSceltoAttuale  = indiceNodo;
    tipoEventoAttuale  = tipoEvento; // Salva per il level-up post-vittoria

    // Nodo boss (ultimo piano)
    if (tipoEvento === "boss") {
        document.getElementById("titolo-incontro").innerText = `SFIDA BOSS\n-- PIANO ${pianoAttuale} --`;
        const idBossCorrente = ARCHIVIO_MAPPE[mappaAttuale].idBoss;
        avviaBossBattle(idBossCorrente);
        return;
    }

    // Centro medico: mostra la scelta (cura squadra o vai al negozio)
    if (tipoEvento === "centro-medico") {
        apriCentroMedico(); // Definita in negozio.js
        return;
    }

    if (tipoEvento === "pokeball") {
        generaOpzioniPokeball();
        return;
    }

    if (tipoEvento === "disco") {
        apriSchermataDiscoMossa();
        return;
    }

    if (tipoEvento === "scambio") {
        avviaEventoScambio();
        return;
    }

    if (tipoEvento === "mistero") {
        avviaEventoMisterioso();
        return;
    }

    if (tipoEvento === "item") {
        avviaEventoItem();
        return;
    }

    // Default: combattimento (cespuglio o npc)
    cambiaSchermata("schermata-mappa", "schermata-gioco");
    document.getElementById("titolo-incontro").innerText = tipoEvento === "cespuglio"
        ? `ERBA ALTA\n-- PIANO ${pianoAttuale} --`
        : `SFIDA ALLENATORE\n-- PIANO ${pianoAttuale} --`;
    preparaIncontroBattaglia(tipoEvento);
}

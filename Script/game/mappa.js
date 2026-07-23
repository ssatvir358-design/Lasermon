// ==========================================================
// mappa.js \u2014 Generazione e rendering della mappa procedurale
// Dipendenze: stato.js, pokemon_factory.js, schermate.js, audio.js,
//             eventi_nodi.js (DB_EVENTI_NODI)
// ==========================================================

// ----------------------------------------------------------
// GENERAZIONE PROCEDURALE DELLA MAPPA
// ----------------------------------------------------------
// Algoritmo:
//   1. Per ogni piano (riga), si costruisce un pool di eventi eligibili
//      leggendo DB_EVENTI_NODI (PianoMin <= piano <= PianoMax).
//   2. Gli eventi che hanno gi\u00e0 raggiunto QuantitaMaxPerMappa vengono esclusi.
//   3. Se il pool risulta vuoto (tutti i limitati sono esauriti), usa solo
//      gli eventi con QuantitaMaxPerMappa === -1 come fallback garantito.
//   4. Ultimi due piani: penultimo fisso (centro-medico + npc), ultimo fisso (boss).
// ----------------------------------------------------------

function generaMappaProcedurale() {
    alberoMappa = [];
    mappaEventi = {};
    
    // Genera limiti randomizzati per la mappa corrente
    window.limitiEventiRandom = {};
    if (typeof DB_EVENTI_NODI !== "undefined") {
        Object.keys(DB_EVENTI_NODI).forEach(tipo => {
            const maxVal = DB_EVENTI_NODI[tipo].QuantitaMaxPerMappa;
            if (maxVal > 0) {
                // Scegli a caso tra met del limite e il limite (es. se max 8, tra 4 e 8)
                window.limitiEventiRandom[tipo] = Math.floor(Math.random() * (maxVal - Math.ceil(maxVal/2) + 1)) + Math.ceil(maxVal/2);
            } else {
                window.limitiEventiRandom[tipo] = maxVal;
            }
        });
    }
    // Salva il livello massimo del team all'inizio della mappa per i reclutamenti
    maxLvlTeamInizioMappa = miaSquadra && miaSquadra.length > 0 
        ? Math.max(...miaSquadra.filter(p => p).map(p => p.livello)) 
        : 1;

    // Genera la variazione seed per questa mappa (-1, 0, or 1)
    variazioneSeedMappa = Math.floor(Math.random() * 3) - 1;

    // Contatore di quante volte ogni tipo di evento \u00e8 gi\u00e0 stato piazzato in questa mappa
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
                // Nodo radice (START)
                tipoEvento = "start"; // Dummy
            } else if (pianoIndex === ultimoPiano) {
                // Ultimo piano: sempre boss
                tipoEvento = "boss";
            } else if (pianoIndex === penultimoPiano) {
                // Penultimo piano: un unico centro-medico, gli altri npc
                tipoEvento = (i === indiceMedicoUnico) ? "centro-medico" : "npc";
                contatoreEventi["npc"] = (contatoreEventi["npc"] || 0) + (tipoEvento === "npc" ? 1 : 0);
            } else if (pianoIndex === 1) {
                // Primo piano giocabile: estremo sinistro pokeball, estremo destro cespuglio, centro random
                if (i === 0) {
                    tipoEvento = "pokeball";
                } else if (i === numNodi - 1 && numNodi > 1) {
                    tipoEvento = "cespuglio";
                } else {
                    tipoEvento = selezionaEventoPerPiano(pianoIndex, contatoreEventi);
                }
                contatoreEventi[tipoEvento] = (contatoreEventi[tipoEvento] || 0) + 1;
            } else if (pianoIndex === 7) {
                // Piano 8 (indice 7): miniboss SOLO al centro e SOLO su mappe 2,4,6,8
                const numMappaCorrente = parseInt(mappaAttuale.replace("mappa", ""));
                const mappeConMiniboss = [2, 4, 6, 8];
                if (mappeConMiniboss.includes(numMappaCorrente) && i === Math.floor(numNodi / 2)) {
                    tipoEvento = "miniboss";
                    console.log(`[MiniBoss] Spawned su ${mappaAttuale} al piano ${pianoIndex}, nodo ${i}`);
                } else {
                    tipoEvento = selezionaEventoPerPiano(pianoIndex, contatoreEventi);
                }
                contatoreEventi[tipoEvento] = (contatoreEventi[tipoEvento] || 0) + 1;
            } else {
                // Piani intermedi: usa il DB_EVENTI_NODI
                tipoEvento = selezionaEventoPerPiano(pianoIndex, contatoreEventi);
                contatoreEventi[tipoEvento] = (contatoreEventi[tipoEvento] || 0) + 1;
            }

            let elementoNpc = null;
            if (tipoEvento === "npc") {
                // Calcola i tipi possibili scansionando il database reale (escludendo luce e buio)
                const tipiPresenti = new Set();
                if (typeof pokemonDatabase !== "undefined") {
                    pokemonDatabase.forEach(p => {
                        if (p && p.elemento) {
                            const el = p.elemento.toLowerCase();
                            if (el !== "luce" && el !== "buio") {
                                tipiPresenti.add(el);
                            }
                        }
                    });
                }
                const elementiPossibili = Array.from(tipiPresenti);
                if (elementiPossibili.length === 0) elementiPossibili.push("normale"); // Fallback di sicurezza
                
                elementoNpc = elementiPossibili[Math.floor(Math.random() * elementiPossibili.length)];
            }

            let livello = 1;
            let livelloMossa = 1;
            if (tipoEvento === "npc" || tipoEvento === "cespuglio") {
                const configGen = calcolaLivelloEMossaMappa(pianoIndex, tipoEvento);
                livello = configGen.livello;
                livelloMossa = configGen.livelloMossa;
            }

            mappaEventi[pianoIndex].push(tipoEvento);
            nodiDelPiano.push({
                id:    `p${pianoIndex}-n${i}`,
                piano: pianoIndex,
                index: i,
                tipo:  tipoEvento,
                elementoNpc: elementoNpc,
                livello: livello,
                livelloMossa: livelloMossa,
                figli: []
            });
        }

        alberoMappa.push(nodiDelPiano);
    }

    // Costruzione connessioni padre \u2192 figlio tra piani adiacenti
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
                // Piano successivo pi\u00f9 largo: ogni nodo prende i due adiacenti
                nodo.figli.push(pianoSucc[i].id);
                nodo.figli.push(pianoSucc[i + 1].id);
            } else if (numSucc === numAttuale - 1) {
                // Piano successivo pi\u00f9 stretto: condivisione dei nodi
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
 * Seleziona il tipo di evento pi\u00f9 appropriato per un dato piano,
 * rispettando i limiti del DB_EVENTI_NODI.
 * @param {number} pianoIndex       - Il piano corrente (1-based logicamente)
 * @param {object} contatoreEventi  - Quante volte ogni evento \u00e8 gi\u00e0 comparso
 * @returns {string}                - Il tipo di evento scelto
 */
function selezionaEventoPerPiano(pianoIndex, contatoreEventi) {
    // 1. Costruisce il pool degli eventi eligibili per questo piano
    const poolEligibili = Object.keys(DB_EVENTI_NODI).filter(tipo => {
        const cfg = DB_EVENTI_NODI[tipo];
        // Escludi esplicitamente eventi che non devono apparire casualmente
        if (cfg.Peso === 0) return false;
        // Deve rientrare nel range di piani
        if (pianoIndex < cfg.PianoMin || pianoIndex > cfg.PianoMax) return false;
        // Deve non aver ancora raggiunto il limite randomizzato
        const maxConsentito = (window.limitiEventiRandom && window.limitiEventiRandom[tipo]) ? window.limitiEventiRandom[tipo] : cfg.QuantitaMaxPerMappa;
        if (cfg.QuantitaMaxPerMappa !== -1 && contatoreEventi[tipo] >= maxConsentito) return false;
        return true;
    });

    // 2. Se il pool è vuoto, fallback agli eventi infiniti (QuantitaMaxPerMappa === -1)
    if (poolEligibili.length === 0) {
        const fallback = Object.keys(DB_EVENTI_NODI).filter(tipo =>
            DB_EVENTI_NODI[tipo].QuantitaMaxPerMappa === -1 &&
            pianoIndex >= DB_EVENTI_NODI[tipo].PianoMin &&
            pianoIndex <= DB_EVENTI_NODI[tipo].PianoMax
        );
        // Se anche il fallback \u00e8 vuoto (configurazione errata), usa cespuglio
        return fallback.length > 0
            ? fallback[Math.floor(Math.random() * fallback.length)]
            : "cespuglio";
    }

    // 3. Scelta casuale pesata tra tutti gli eligibili
    let pesoTotale = 0;
    const pesi = poolEligibili.map(tipo => {
        const peso = DB_EVENTI_NODI[tipo].Peso || 1;
        pesoTotale += peso;
        return { tipo, peso };
    });
    
    let rand = Math.random() * pesoTotale;
    for (let i = 0; i < pesi.length; i++) {
        rand -= pesi[i].peso;
        if (rand <= 0) return pesi[i].tipo;
    }
    
    return poolEligibili[0];
}

// Controlla se il nodo B (piano+1, indiceB) \u00e8 figlio registrato del nodo A
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

                if (tipoEvento === "npc") {
                    const nodoObj = alberoMappa[pianoIndex][i];
                    if (nodoObj && nodoObj.elementoNpc) {
                        bottone.setAttribute("data-tooltip", `Tipo: ${nodoObj.elementoNpc.toUpperCase()}\n+2 Lvl`);
                        
                        // Rimuoviamo il background standard per non interferire
                        bottone.style.setProperty('background-image', 'none', 'important');
                        bottone.style.setProperty('background-color', 'transparent', 'important');
                        bottone.style.position = 'relative';
                        // Permettiamo al contenuto interno di fuoriuscire dai bordi 50x50
                        bottone.style.overflow = 'visible';
                        
                        let imgChibi = document.createElement("img");
                        imgChibi.src = `../Sprite/nodi/Chibi NPC/chibi_${nodoObj.elementoNpc.toLowerCase()}_1.png`;
                        imgChibi.style.position = "absolute";
                        imgChibi.style.width = "120px";
                        imgChibi.style.height = "120px";
                        // Centriamo l'immagine 80x80 nel bottone 50x50 ( (80-50)/2 = 15 )
                        imgChibi.style.top = "-35px";
                        imgChibi.style.left = "-35px";
                        // Fondamentale: i click passano attraverso l'immagine fino al bottone
                        imgChibi.style.pointerEvents = "none";
                        // Aggiungiamo l'ombra per farla sembrare un nodo
                        imgChibi.style.filter = "drop-shadow(0px 4px 6px rgba(0,0,0,0.5))";
                        
                        // Compensa le differenze di dimensione nei file sorgente degli sprite
                        let scaleFactor = 1;
                        switch (nodoObj.elementoNpc.toLowerCase()) {
                            case "ghiaccio":
                            case "erba":
                            case "fuoco":
                            case "lotta":
                            case "veleno":
                                scaleFactor = 1.35; // Aumenta molto la dimensione
                                break;
                            case "elettro":
                                scaleFactor = 1.15; // Aumenta leggermente
                                break;
                        }
                        if (scaleFactor !== 1) {
                            imgChibi.style.transform = `scale(${scaleFactor})`;
                        }
                        
                        bottone.appendChild(imgChibi);
                    }
                }

                if (tipoEvento === "cespuglio") {
                    const nodoObj = alberoMappa[pianoIndex][i];
                    if (nodoObj) {
                        bottone.setAttribute("data-tooltip", "+1 Lvl");
                    }
                }

                // Nodo boss: usa l'immagine chibi del boss corrente
                if (tipoEvento === "boss") {
                    bottone.setAttribute("data-tooltip", "+3 Lvl");
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
    const mappaElement = document.getElementById("contenitore-mappa-gioco");
    if (!container || !mappaElement) {
        console.error("Manca il container della mappa per disegnare le linee!");
        return;
    }

    // Calcoliamo lo scale ESATTO basandoci sulla larghezza reale (900px CSS) del contenitore padre scalato
    const mappaRect = mappaElement.getBoundingClientRect();
    const exactScale = mappaRect.width / 900 || 1;

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
                const scale = exactScale;

                const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
                linea.setAttribute("x1", (rectA.left + rectA.width / 2 - cRect.left) / scale);
                linea.setAttribute("y1", (rectA.top  + rectA.height / 2 - cRect.top) / scale);
                linea.setAttribute("x2", (rectB.left + rectB.width / 2 - cRect.left) / scale);
                linea.setAttribute("y2", (rectB.top  + rectB.height / 2 - cRect.top) / scale);
                linea.setAttribute("stroke",           "#000000");
                linea.setAttribute("stroke-width",     "2.5");
                linea.setAttribute("stroke-dasharray", "4,4");
                svg.appendChild(linea);
            });
        });
    });
}

// Ridisegna le linee al resize della finestra (solo se la mappa \u00e8 visibile)
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
        
    let elementoFiltro = null;
    if (tipoEvento === "npc" && alberoMappa[pianoAttuale] && alberoMappa[pianoAttuale][nodoSceltoAttuale]) {
        elementoFiltro = alberoMappa[pianoAttuale][nodoSceltoAttuale].elementoNpc;
    }
    
    preparaIncontroBattaglia(tipoEvento, elementoFiltro);
}

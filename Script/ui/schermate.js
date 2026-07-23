// ==========================================================
// schermate.js \u2014 Gestione navigazione tra schermate e UI generale
// Estratto da script.js (righe 466-503, 1256-1354, 1427-1438, 1481-1545)
// Dipendenze: stato.js, pokemon_factory.js, audio.js
// Array globale per contenere temporaneamente i Pokémon generati per la scelta
let opzioniSceltaPokemon = [];

// ==========================================================
// FUNZIONI MODALE DI AVVISO CUSTOM
// ==========================================================
function mostraAvviso(messaggio) {
    const modale = document.getElementById("custom-alert-modal");
    const testom = document.getElementById("custom-alert-msg");
    if (testom) testom.innerHTML = messaggio;
    if (modale) modale.style.display = "flex";
}

function chiudiAvviso() {
    const modale = document.getElementById("custom-alert-modal");
    if (modale) modale.style.display = "none";
}

// Cambia visibilità tra due schermate (aggiunge/rimuove classe "attiva")
// Viene poi "wrappata" più in basso per agganciare la musica automatica
function cambiaSchermata(idNascondi, idMostra) {
    const elementoNascondi = document.getElementById(idNascondi);
    const elementoMostra = document.getElementById(idMostra);
    if(elementoNascondi) elementoNascondi.classList.remove("attiva");
    if(elementoMostra) elementoMostra.classList.add("attiva");
}

// Wrap di cambiaSchermata: aggancia automaticamente la musica al cambio schermata
const _cambiaSchermataBase = cambiaSchermata;
cambiaSchermata = function(idNascondi, idMostra) {
    _cambiaSchermataBase(idNascondi, idMostra);
    if (idMostra === "schermata-start") riproduciMusica("lobby.mp3");
    if (idMostra === "schermata-mappa") {
        riproduciMusica("mappa.mp3");
        // Imposta sfondo mappa dinamicamente
        const elm = document.getElementById("contenitore-mappa-gioco");
        if (elm && typeof ARCHIVIO_MAPPE !== "undefined" && ARCHIVIO_MAPPE[mappaAttuale]) {
            elm.style.backgroundImage = `url('${ARCHIVIO_MAPPE[mappaAttuale].sfondoMappa}')`;
            elm.style.backgroundSize = "cover";
            elm.style.backgroundPosition = "center";
        }
        
        // Assicurati che lo zaino persistente sia aggiornato
        if (typeof aggiornaPannelloZainoMappa === "function") {
            aggiornaPannelloZainoMappa();
        }
    }
    if (idMostra === "schermata-gioco") {
        // Riproduce la musica normale SOLO se non \u00e8 una Boss Fight
        // Riproduce la musica normale SOLO se non è una Boss Fight
        if (!isBossFight) {
            riproduciMusica("combattimento.mp3");
        }
    }
};

// Apre la modale di selezione modalità (Run Normale / Run Veloce)
function apriSelezioneModalita() {
    // Se il giocatore ha già una squadra, torna direttamente alla mappa
    if (typeof miaSquadra !== "undefined" && miaSquadra.length > 0) {
        cambiaSchermata("schermata-start", "schermata-mappa");
        return;
    }
    // Mostra la modale
    const modal = document.getElementById("modal-selezione-modalita");
    if (modal) {
        modal.style.display = "flex";
    }
}

// Sceglie la modalità e procede alla selezione starter
function scegliModalita(tipo) {
    const modal = document.getElementById("modal-selezione-modalita");
    if (modal) modal.style.display = "none";

    if (tipo === "veloce") {
        isRunVeloce = true;
        applicaOverrideRunVeloce();
        console.log("[Modalità] Run Veloce selezionata.");
        const topRightUi = document.getElementById("top-right-ui");
        if (topRightUi) topRightUi.style.display = "none";
    } else {
        isRunVeloce = false;
        console.log("[Modalità] Run Normale selezionata.");
        const topRightUi = document.getElementById("top-right-ui");
        if (topRightUi) topRightUi.style.display = "block";
    }

    mostraSelezione();
}

// Mostra la schermata di selezione starter (i primi 3 Pokémon del DB)
function mostraSelezione() {
    if (typeof miaSquadra !== "undefined" && miaSquadra.length > 0) {
        cambiaSchermata("schermata-start", "schermata-mappa");
        return;
    }
    cambiaSchermata("schermata-start", "schermata-selezione");
    document.getElementById("titolo-selezione").innerText = "Scegli il tuo Pok\u00e9mon Iniziale";
    
    let btnTornaLobby = document.getElementById("btn-torna-lobby");
    if (btnTornaLobby) btnTornaLobby.style.display = "block";
    
    const contenitore = document.getElementById("contenitore-starter");
    contenitore.innerHTML = "";
    
    // Cerca i personaggi definiti come starter in CONFIG_STARTER
    let starerDisponibili = pokemonDatabase.filter(p => CONFIG_STARTER.map(n => n.toLowerCase()).includes(p.nome.toLowerCase()));
    
    // Per sicurezza, se non ne trova 3, prende i primi 3
    if (starerDisponibili.length < 3) {
        starerDisponibili = pokemonDatabase.slice(0, 3);
    }
    
    opzioniSceltaPokemon = []; // Reset
    for (let i = 0; i < 3; i++) {
        let infoBase = starerDisponibili[i];
        let p = creaPokemon(infoBase, 5, 1); // Starter: livello 5, mossa 1
        opzioniSceltaPokemon[i] = p;

        let colonna = document.createElement("div");
        colonna.className = "colonna-starter";
        colonna.innerHTML = `
            <div class="blocco-foto" style="background-color: ${p.colore}; flex-direction: column;">
                <img src="${p.immagine}" alt="${p.nome}" class="sprite-pokemon">
            </div>
            <div class="blocco-stats">
                <strong>${p.nome}</strong> (${p.raritaTipo.toUpperCase()})<br>
                \u2022 Elemento: ${getHtmlElemento(p.elemento)}<br>
                \u2022 Livello: ${p.livello}<br>
                \u2022 HP: ${p.hpMax}<br>
                \u2022 ATK: ${p.atk}<br>
                \u2022 DEF: ${p.def}<br>
                \u2022 VEL: ${p.vel}<br>
                \u2022 Mossa: ${getNomeMossaAttuale(p)} (Lvl 1)
            </div>
            <div class="blocco-pulsante">
                <button class="btn-scegli" onclick="aggiungiASquadraDaIndice(${i})">SCEGLI</button>
            </div>
        `;
        contenitore.appendChild(colonna);
    }
}

// // Genera le opzioni Pokémon da scegliere (per Pokéball, non per starter)
function generaOpzioniPokemon(quanti, isStarter) {
    if (isStarter) return;

    const contenitore = document.getElementById("contenitore-starter");
    contenitore.innerHTML = "";
    
    let nomiEstratti = [];
    opzioniSceltaPokemon = []; // Reset

    let trovatoLeggendario = false;

    for (let i = 0; i < quanti; i++) {
        let infoBase = pescaPokemonPokeball(nomiEstratti); 
        nomiEstratti.push(infoBase.nome);
        
        if (infoBase.raritaTipo && infoBase.raritaTipo.toLowerCase() === "leggendario") {
            trovatoLeggendario = true;
        }
        
        let configGenerata = calcolaLivelloEMossaMappa(pianoAttuale);
        
        // Calcolo livello reclutamento: Math.max(Lvl_iniziale_mappa_del_pg_max_del_team, livello_max_lvl_team - 20%)
        let maxLvlTeam = miaSquadra.length > 0 ? Math.max(...miaSquadra.filter(m => m).map(m => m.livello)) : 1;
        let decurtazione = Math.round(maxLvlTeam * 0.20);
        let lvlReclutamento = Math.max(maxLvlTeamInizioMappa, maxLvlTeam - decurtazione);

        let p = creaPokemon(infoBase, lvlReclutamento, configGenerata.livelloMossa);
        opzioniSceltaPokemon[i] = p;

        let colonna = document.createElement("div");
        colonna.className = "colonna-starter";
        
        let bloccoAzioneHTML = "";
        if (miaSquadra.length >= 6) {
            // Squadra piena: mostra select per scegliere chi sostituire
            let opzioniSostituzione = "";
            miaSquadra.forEach((membro, idx) => {
                let elemento = membro.elemento ? membro.elemento.toUpperCase() : "FUOCO";
                opzioniSostituzione += `<option value="${idx}">Sostituisci ${membro.nome} (${elemento}) | Lvl.${membro.livello} | HP:${membro.hpAttuali}/${membro.hpMax} | ATK:${membro.atk} DEF:${membro.def} VEL:${membro.vel} SP.ATK:${membro.atkSpec} SP.DEF:${membro.defSpec}</option>`;
            });
            
            bloccoAzioneHTML = `
                <select id="select-sostituisci-${i}" style="margin-top: 10px; width: 100%; font-size: 14px; padding: 5px;">
                    ${opzioniSostituzione}
                </select>
                <button class="btn-scegli" style="margin-top: 5px; width: 100%;" onclick="confermaSceltaConSostituzioneDaIndice(${i})">CONFERMA</button>
            `;
        } else {
            // C'è spazio, semplice tasto Scegli
            bloccoAzioneHTML = `<button class="btn-scegli" onclick="aggiungiASquadraDaIndice(${i})">Scegli</button>`;
        }

        colonna.innerHTML = `
            <div class="blocco-foto" style="background-color: ${p.colore}; flex-direction: column;">
                <img src="${p.immagine}" alt="${p.nome}" class="sprite-pokemon">
            </div>
            <div class="blocco-stats">
                <strong>${p.nome}</strong> (${p.raritaTipo.toUpperCase()})<br>
                Elemento: ${getHtmlElemento(p.elemento)}<br>
                Livello: ${p.livello}<br>
                HP: ${p.hpMax}<br>
                ATK: ${p.atk}<br>
                DEF: ${p.def}<br>
                VEL: ${p.vel}<br>
                <br>
                <span class="mossa-tag">${getNomeMossaAttuale(p)} (Lvl ${p.livelloMossa})</span>
            </div>
            <div class="blocco-pulsante">
                ${bloccoAzioneHTML}
            </div>
        `;
        contenitore.appendChild(colonna);
    }

    // Aggiornamento soft pity leggendari
    if (trovatoLeggendario) {
        tentativiSenzaLeggendari = 0;
        console.log("[Soft Pity] Legendary rolled! Counter reset to 0.");
    } else {
        tentativiSenzaLeggendari++;
        console.log(`[Soft Pity] No legendary rolled. Counter incremented to ${tentativiSenzaLeggendari}.`);
    }
}

// Aggiunge alla squadra da indice dell'array temporaneo
function aggiungiASquadraDaIndice(idx) {
    const p = opzioniSceltaPokemon[idx];
    if (p) {
        aggiungiASquadra(p);
    }
}

// Conferma scelta con sostituzione da indice dell'array temporaneo
function confermaSceltaConSostituzioneDaIndice(indiceOpzione) {
    const select = document.getElementById(`select-sostituisci-${indiceOpzione}`);
    if (!select) return;
    const valoreScelto = select.value;
    const nuovoPokemon = opzioniSceltaPokemon[indiceOpzione];
    if (!nuovoPokemon) return;

    if (valoreScelto !== "keep") {
        let idxDaRimuovere = parseInt(valoreScelto);
        miaSquadra[idxDaRimuovere] = nuovoPokemon;
        
        // Verifica se il nuovo Pokemon ha diritto a un perk e mostra la schermata
        verificaPerkDopoEvento(nuovoPokemon, () => {
            cambiaSchermata("schermata-selezione", "schermata-mappa");
            generaMappaAlbero();
            aggiornaSquadraMappa();
        });
    } else {
        cambiaSchermata("schermata-selezione", "schermata-mappa");
        generaMappaAlbero();
        aggiornaSquadraMappa();
    }
}

// ----------------------------------------------------------
// ZAINO MAPPA (UI PERSISTENTE)
// ----------------------------------------------------------
function aggiornaPannelloZainoMappa() {
    const contenitore = document.getElementById("zaino-mappa-lista");
    const capacitaCounter = document.getElementById("zaino-capacita-counter");
    if (!contenitore) return;
    
    // Calcola il numero di slot occupati (somma delle quantità)
    let slotOccupati = 0;
    zaino.forEach(item => {
        slotOccupati += (item.quantita || 1);
    });
    const maxSlot = 20; // Capacità fittizia per ora
    
    if (capacitaCounter) {
        capacitaCounter.textContent = `${slotOccupati}/${maxSlot}`;
        if (slotOccupati > maxSlot) {
            capacitaCounter.style.color = "#e74c3c"; // Rosso se supera
        } else {
            capacitaCounter.style.color = "#bbb";
        }
    }
    
    contenitore.innerHTML = "";
    
    // Generiamo esattamente 20 celle (maxSlot) per mantenere l'ordine visivo
    for (let i = 0; i < maxSlot; i++) {
        const cella = document.createElement("div");
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.height = "70px";
        wrapper.style.width = "100%";
        
        if (i < zaino.length) {
            // Cella piena
            const item = zaino[i];
            const fullItem = item.dbId ? (typeof getOggettoDb === "function" ? getOggettoDb(item.dbId) : DB_OGGETTI.find(o => o.id === item.dbId)) : item;
            const quantitaStr = item.quantita && item.quantita > 1 ? `x${item.quantita}` : "x1";
            const itemNome = fullItem ? fullItem.nome : "Sconosciuto";
            const itemCat = fullItem ? fullItem.categoria : "";
            const itemDesc = fullItem && fullItem.descrizione ? fullItem.descrizione : "";
            
            cella.className = "zaino-cella piena";
            let isConsumabileCura = itemCat === "consumabile" && fullItem.stat === "hp" && (!fullItem.effettoSpeciale || !fullItem.effettoSpeciale.includes("rimuovi"));
            if (itemCat === "equipaggiabile") {
                cella.onclick = () => apriAssegnazioneOggetto(i, false);
            } else if (isConsumabileCura) {
                cella.onclick = () => apriAssegnazioneOggetto(i, true);
            }
            
            cella.innerHTML = `
                <div class="zaino-cella-header">
                    <div class="zaino-cella-nome">${itemNome}</div>
                    <div class="zaino-cella-qty">${quantitaStr}</div>
                </div>
                <div class="zaino-cella-desc">${itemDesc}</div>
            `;
        } else {
            // Cella vuota
            cella.className = "zaino-cella vuota";
            cella.innerHTML = `<div style="color: rgba(255,255,255,0.2); font-size: 20px;">+</div>`;
        }
        
        wrapper.appendChild(cella);
        contenitore.appendChild(wrapper);
    }
}

// ----------------------------------------------------------
// VISTA ASSEGNAZIONE OGGETTO (DENTRO LO ZAINO)
// ----------------------------------------------------------
function apriAssegnazioneOggetto(indexZaino, isCura = false) {
    const vistaPrincipale = document.getElementById("zaino-mappa-lista");
    const vistaAssegnazione = document.getElementById("zaino-vista-assegnazione");
    const listaAssegnazione = document.getElementById("zaino-assegnazione-lista");
    
    if (!vistaPrincipale || !vistaAssegnazione || !listaAssegnazione) return;
    
    vistaPrincipale.style.display = "none";
    vistaAssegnazione.style.display = "flex";
    
    const titolo = document.getElementById("zaino-assegnazione-titolo");
    if (titolo) {
        titolo.innerText = isCura ? "USA SU:" : "ASSEGNA A:";
    }
    
    listaAssegnazione.innerHTML = "";
    
    miaSquadra.forEach((p, i) => {
        const row = document.createElement("div");
        row.className = "zaino-pokemon-row";
        
        const folder = p.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
        const iconSrc = `../Sprite/personaggi/${folder}/${p.nome}VS.png`;
        const haItem = p.oggetti && p.oggetti.length > 0 ? " ⭐" : "";
        
        row.onclick = () => confermaAssegnazioneOggetto(indexZaino, i, isCura);
        
        row.innerHTML = `
            <div class="zaino-pokemon-icon" style="background-image: url('${iconSrc}');"></div>
            <div class="zaino-pokemon-info">
                <span style="font-weight: bold; font-size: 13px;">${p.nome}${haItem}</span>
                <span>Lv. ${p.livello} | HP: ${p.hpAttuali}/${p.hpMax}</span>
            </div>
        `;
        
        listaAssegnazione.appendChild(row);
    });
}

function annullaAssegnazioneOggetto() {
    const vistaPrincipale = document.getElementById("zaino-mappa-lista");
    const vistaAssegnazione = document.getElementById("zaino-vista-assegnazione");
    
    if (vistaPrincipale) vistaPrincipale.style.display = "grid";
    if (vistaAssegnazione) vistaAssegnazione.style.display = "none";
}

function confermaAssegnazioneOggetto(indexZaino, indexPokemon, isCura = false) {
    let itemInZaino = zaino[indexZaino];
    if (!itemInZaino) return;
    
    let fullItem = itemInZaino.dbId ? (typeof getOggettoDb === "function" ? getOggettoDb(itemInZaino.dbId) : DB_OGGETTI.find(o => o.id === itemInZaino.dbId)) : itemInZaino;

    let p = miaSquadra[indexPokemon];
    if (!p) return;
    
    if (isCura) {
        if (fullItem.effettoSpeciale === "revive") {
            if (p.hpAttuali > 0) {
                mostraAvviso("Questo Pokémon non è KO!");
                return;
            }
        } else {
            if (p.hpAttuali <= 0) {
                mostraAvviso("Questo Pokémon è KO! Usa un oggetto per rianimarlo.");
                return;
            }
            if (p.hpAttuali >= p.hpMax && (!fullItem.effettoSpeciale || !fullItem.effettoSpeciale.includes("rimuovi"))) {
                mostraAvviso("Questo Pokémon ha già i PS al massimo!");
                return;
            }
        }
        
        let cura = fullItem.valore || 0;
        if (fullItem.valoreType === "percent") {
            cura = Math.floor(p.hpMax * fullItem.valore);
        }
        
        p.hpAttuali += cura;
        if (p.hpAttuali > p.hpMax) p.hpAttuali = p.hpMax;
        
        let extraMsg = "";
        if (fullItem.effettoSpeciale) {
            if (fullItem.effettoSpeciale === "rimuovi_bruciatura") {
                p.bruciato = false;
                extraMsg = " (Bruciatura rimossa!)";
            } else if (fullItem.effettoSpeciale === "rimuovi_debuff") {
                extraMsg = " (Malus rimossi!)";
            } else if (fullItem.effettoSpeciale === "rimuovi_tutto") {
                p.bruciato = false;
                extraMsg = " (Status rimossi!)";
            } else if (fullItem.effettoSpeciale === "revive") {
                extraMsg = " (Rianimato!)";
            }
        }
        
        let log = document.getElementById("console-log-zaino") || document.getElementById("console-log");
        if (log) log.innerHTML = `💊 ${fullItem.nome} usato su ${p.nome}!${extraMsg}`;
    } else {
        if (!fullItem || fullItem.categoria !== "equipaggiabile") return;

        if (!p.oggetti) p.oggetti = [];
        if (p.oggetti.length >= 1) {
            mostraAvviso("Questo Pokémon ha già il massimo degli oggetti equipaggiati (1)!");
            return;
        }
        
        // Equipaggia
        p.oggetti.push(fullItem);
        
        // Ricalcola le statistiche e i bonus
        if (typeof applicaBonusOggetti === "function") {
            applicaBonusOggetti(p);
        }
        
        // Notifica visiva (opzionale)
        let log = document.getElementById("console-log-zaino") || document.getElementById("console-log");
        if (log) log.innerHTML = `🛡️ ${fullItem.nome} equipaggiato a ${p.nome}!`;
    }
    
    // Rimuovi l'item dallo zaino
    if (itemInZaino.quantita && itemInZaino.quantita > 1) {
        itemInZaino.quantita--;
    } else {
        zaino.splice(indexZaino, 1);
    }
    
    // Ricarica la schermata
    aggiornaSquadraMappa();
    
    // Torna alla vista zaino
    annullaAssegnazioneOggetto();
    aggiornaPannelloZainoMappa();
}


// Aggiunge un Pokémon alla squadra e va alla mappa
let nomeStarterOriginale = null;

function aggiungiASquadra(pObiettivo) {
    if (miaSquadra.length === 0) {
        nomeStarterOriginale = pObiettivo.nome;
    }
    miaSquadra.push(pObiettivo);
    
    const onFatto = () => {
        cambiaSchermata("schermata-selezione", "schermata-mappa");
        if (miaSquadra.length === 1) {
            generaMappaProcedurale(); // Genera la mappa solo al primo Pok\u00e9mon scelto
        }
        generaMappaAlbero();
        aggiornaSquadraMappa();
    };
    
    verificaPerkDopoEvento(pObiettivo, onFatto);
}

// Resetta la run corrente mantenendo il primo starter azzerato
function resettaRunConStarter() {
    if (!miaSquadra || miaSquadra.length === 0) return;
    
    
    // Recupera l'infoBase dello starter originale, o in fallback del primo pokemon in squadra
    const starterCorrente = nomeStarterOriginale || miaSquadra[0].nome;
    const infoBase = pokemonDatabase.find(p => p.nome === starterCorrente);
    
    if (!infoBase) return;
    
    // Reset variabili globali (stato.js e mappa.js)
    miaSquadra = [];
    let p = creaPokemon(infoBase, 5, 1);
    miaSquadra.push(p);
    
    pianoAttuale = 0;
    nodoSceltoAttuale = 0;
    mappaAttuale = "mappa1";
    monete = 0;
    zaino = [];
    if (typeof PerkAttivi !== "undefined") PerkAttivi = [];
    isSkipAttivo = false;
    if (typeof tentativiSenzaLeggendari !== "undefined") tentativiSenzaLeggendari = 0;
    
    // Aggiorna UI
    const moneteDispMappa = document.getElementById("monete-display-mappa");
    if (moneteDispMappa) moneteDispMappa.innerText = `\u{1f4b0} ${monete}`;
    const moneteDispGio = document.getElementById("monete-giocatore");
    if (moneteDispGio) moneteDispGio.innerText = monete;
    
    // Rigenera mappa e ui
    generaMappaProcedurale();
    generaMappaAlbero();
    aggiornaSquadraMappa();
    
    // Torna alla schermata mappa se non ci siamo (dovremmo esserci, ma per sicurezza)
    const attive = document.querySelectorAll(".schermata.attiva");
    if (attive.length > 0) {
        cambiaSchermata(attive[0].id, "schermata-mappa");
    }
    
    // Aggiorna pannello zaino
    if (typeof aggiornaPannelloZainoMappa === "function") {
        aggiornaPannelloZainoMappa();
    }
    if (typeof annullaAssegnazioneOggetto === "function") {
        annullaAssegnazioneOggetto();
    }
}

// Aggiorna la griglia icone della squadra visibile sulla mappa
function aggiornaSquadraMappa() {
    const griglia = document.getElementById("griglia-squadra");
    if(!griglia) return;
    griglia.innerHTML = "";
    
    const mapElementoColore = {
        "normale": "#a8a878",
        "fuoco": "#ff4d4d",
        "acqua": "#3498db",
        "erba": "#2ecc71",
        "elettro": "#ffcc00",
        "ghiaccio": "#98d8d8",
        "lotta": "#c03028",
        "veleno": "#a040a0",
        "terra": "#e0c068",
        "vento": "#a890f0",
        "psico": "#f85888",
        "drago": "#7038f8",
        "folletto": "#ee99ac",
        "luce": "#f1c40f",
        "buio": "#9b59b6"
    };

    miaSquadra.forEach((p, index) => {
        let quadratino = document.createElement("div");
        quadratino.className = "icona-squadra";
        if (index === 0) quadratino.classList.add("primo-posto"); 
        
        quadratino.setAttribute("data-rarita", p.raritaTipo);
        
        let col = p.elemento ? mapElementoColore[p.elemento.toLowerCase()] || p.colore : p.colore;
        
        quadratino.innerHTML = `
            <div class="icona-squadra-info">
                <div class="info-nome">${p.nome}</div>
                <div class="info-dettagli">Lv.${p.livello} &bull; ${p.elemento ? p.elemento.toUpperCase() : "???"}</div>
                <div class="info-hp" style="font-size: 0.8em; font-weight: bold; margin-top: 2px; color: ${p.hpAttuali <= 0 ? '#e74c3c' : (p.hpAttuali / p.hpMax > 0.5 ? '#2ecc71' : '#f1c40f')};">❤️ ${p.hpAttuali} / ${p.hpMax}</div>
            </div>
            <div class="icona-squadra-img" style="border-color: ${col}; box-shadow: 0 0 25px 8px ${col}, inset 0 0 15px ${col}; background-image: url('${p.immagine}');">
                <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:70%; height:8px; background:#222; border-radius:4px; border:2px solid #000; overflow:hidden; z-index:10; box-sizing:border-box;">
                    <div style="height:100%; width:${Math.max(0, (p.hpAttuali / p.hpMax) * 100)}%; background:${p.hpAttuali <= 0 ? '#e74c3c' : (p.hpAttuali / p.hpMax > 0.5 ? '#2ecc71' : '#f1c40f')};"></div>
                </div>
            </div>
        `;
        quadratino.style.opacity = p.hpAttuali <= 0 ? "0.4" : "1"; 
        
        // Rendi l'icona trascinabile (Drag & Drop)
        quadratino.draggable = true;
        
        quadratino.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", index);
            e.dataTransfer.effectAllowed = "move";
            quadratino.style.opacity = "0.5";
        });
        
        quadratino.addEventListener("dragend", (e) => {
            quadratino.style.opacity = p.hpAttuali <= 0 ? "0.4" : "1";
        });
        
        quadratino.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });
        
        quadratino.addEventListener("drop", (e) => {
            e.preventDefault();
            const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
            const targetIndex = index;
            if (sourceIndex !== targetIndex && !isNaN(sourceIndex)) {
                let temp = miaSquadra[sourceIndex];
                miaSquadra[sourceIndex] = miaSquadra[targetIndex];
                miaSquadra[targetIndex] = temp;
                
                // Aggiorna la squadra
                aggiornaSquadraMappa();
                
                // Chiude dettaglio se \u00e8 aperto
                let dettaglio = document.getElementById("schermata-dettaglio");
                if (dettaglio && dettaglio.classList.contains("attiva")) {
                    cambiaSchermata("schermata-dettaglio", "schermata-mappa");
                }
            }
        });
        
        quadratino.onclick = () => mostraDettaglioPokemon(index);
        
        // Se ha oggetti equipaggiati, mostra l'icona
        if (p.oggetti && p.oggetti.length > 0) {
            let zainetto = document.createElement("div");
            zainetto.innerText = "\u{1f392}";
            zainetto.style.position = "absolute";
            zainetto.style.bottom = "-5px";
            zainetto.style.right = "-5px";
            zainetto.style.fontSize = "16px";
            zainetto.style.filter = "drop-shadow(1px 1px 1px black)";
            quadratino.style.position = "relative"; 
            quadratino.appendChild(zainetto);
        }
        
        griglia.appendChild(quadratino);
    });
}

// Apre la schermata dettaglio di un Pok\u00e9mon della squadra
function rimuoviOggettoDaPokemon(pIndex, indexOgg) {
    let p = miaSquadra[pIndex];
    if (!p || !p.oggetti || p.oggetti.length <= indexOgg) return;
    
    // Rimuovi l'oggetto e mettilo nello zaino
    let itemRimossa = p.oggetti.splice(indexOgg, 1)[0];
    zaino.push(itemRimossa);
    
    // Ricalcola le stats senza quell'oggetto
    if (typeof applicaBonusOggetti === "function") {
        applicaBonusOggetti(p);
    }
    
    // Aggiorna visivamente il dettaglio e la mappa
    mostraDettaglioPokemon(pIndex);
    aggiornaSquadraMappa();
}

function mostraDettaglioPokemon(index) {
    let p = miaSquadra[index]; 
    if (!p) return;
    
    indicePokemonInDettaglio = index;

    document.getElementById("dettaglio-img").src = p.immagineVS; 
    document.getElementById("dettaglio-nome").innerText = p.nome;
    document.getElementById("dettaglio-rarita").innerText = p.raritaTipo.toUpperCase();
    
    // Inietta il badge elemento nelle statistiche
    let bloccoStats = document.querySelector("#schermata-dettaglio .valori-stats");
    if (bloccoStats) {
        let vecchioBadge = document.getElementById("dettaglio-elemento-badge");
        if (vecchioBadge) vecchioBadge.remove();

        let divElemento = document.createElement("div");
        divElemento.id = "dettaglio-elemento-badge";
        divElemento.innerHTML = `TIPO: ${getHtmlElemento(p.elemento, false)}`;
        
        bloccoStats.insertBefore(divElemento, bloccoStats.firstChild);
    }

    document.getElementById("dettaglio-livello").innerText = p.livello;
    
    const getStatString = (statName, val) => {
        if (p.bonus && p.bonus[statName]) {
            const b = p.bonus[statName];
            const sign = b > 0 ? "+" : "";
            return `${val} (${sign}${b})`;
        }
        return val;
    };
    
    document.getElementById("dettaglio-hp").innerText = `${p.hpAttuali}/${getStatString("hp", p.hpMax)}`;
    document.getElementById("dettaglio-atk").innerText = getStatString("atk", p.atk);
    document.getElementById("dettaglio-def").innerText = getStatString("def", p.def);
    
    // ATK SP. and DIF SP. (if elements exist)
    let elSpAtk = document.getElementById("dettaglio-spatk");
    if (elSpAtk) elSpAtk.innerText = getStatString("atkSpec", p.atkSpec);
    let elSpDef = document.getElementById("dettaglio-spdef");
    if (elSpDef) elSpDef.innerText = getStatString("defSpec", p.defSpec);
    
    document.getElementById("dettaglio-vel").innerText = getStatString("vel", p.vel);
    
    document.getElementById("dettaglio-mossa").innerText = `${getNomeMossaAttuale(p)} (Lvl ${p.livelloMossa})`;
    
    // Renderizza gli oggetti equipaggiati
    let divOggetti = document.getElementById("dettaglio-oggetti");
    if (divOggetti) {
        divOggetti.innerHTML = "";
        if (p.oggetti && p.oggetti.length > 0) {
            let titoloOgg = document.createElement("div");
            titoloOgg.innerText = "OGGETTI EQUIPAGGIATI:";
            titoloOgg.style.fontWeight = "bold";
            titoloOgg.style.color = "#34495e";
            titoloOgg.style.fontSize = "13px";
            titoloOgg.style.marginBottom = "5px";
            divOggetti.appendChild(titoloOgg);
            
            p.oggetti.forEach((item, indexOgg) => {
                let card = document.createElement("div");
                card.style.display = "flex";
                card.style.alignItems = "center";
                card.style.justifyContent = "space-between";
                card.style.backgroundColor = "#ecf0f1";
                card.style.padding = "5px";
                card.style.borderRadius = "4px";
                card.style.marginBottom = "5px";
                card.style.fontSize = "12px";
                card.style.border = "1px solid #bdc3c7";
                
                let info = document.createElement("div");
                info.style.color = "#2c3e50";
                info.innerHTML = `<strong>${item.nome}</strong><br><span style="font-size:10px; color:#7f8c8d;">${item.descrizione}</span>`;
                
                let btn = document.createElement("button");
                btn.innerText = "RIMUOVI";
                btn.style.backgroundColor = "#e74c3c";
                btn.style.color = "white";
                btn.style.border = "none";
                btn.style.padding = "3px 6px";
                btn.style.borderRadius = "3px";
                btn.style.cursor = "pointer";
                btn.style.fontSize = "10px";
                btn.onclick = () => rimuoviOggettoDaPokemon(index, indexOgg);
                
                card.appendChild(info);
                card.appendChild(btn);
                divOggetti.appendChild(card);
            });
        }
    }
    
    // Blocco cambio posizione rimosso in quanto sostituito dal drag-and-drop sulla mappa
    let bloccoMappa = document.querySelector(".blocco-cambio-posizione");
    let bloccoBattaglia = document.getElementById("blocco-cambio-in-battaglia");
    if (bloccoMappa) bloccoMappa.style.display = "none";
    if (typeof inBattleSwapMode !== "undefined" && inBattleSwapMode) {
        if(bloccoBattaglia) bloccoBattaglia.style.display = "block";
        let btn = document.getElementById("btn-esegui-cambio-battaglia");
        if(btn) btn.disabled = (index === 0 || p.hpAttuali <= 0);
    } else {
        if(bloccoBattaglia) bloccoBattaglia.style.display = "none";
    }

    let idCorrente = document.querySelector(".schermata.attiva").id;
    if (idCorrente !== "schermata-dettaglio") {
        cambiaSchermata(idCorrente, "schermata-dettaglio");
    }
}

let inBattleSwapMode = false;

function apriSchermataPokemonBattaglia() {
    if (document.getElementById("btn-pokemon").disabled) return;
    document.getElementById("schermata-scambio-battaglia").style.display = "flex";
    
    // Popola lista sinistra
    let contenitore = document.getElementById("scambio-battaglia-lista");
    contenitore.innerHTML = "";
    document.getElementById("scambio-battaglia-dettaglio").innerHTML = `<p style="color:#ccc; font-size:16px; text-align:center; margin-top:60px;">&#x2190; Seleziona un Pok\u00e9mon per i dettagli.</p>`;
    
    miaSquadra.forEach((p, index) => {
        if (index === 0 || p.hpAttuali <= 0) return; // Salta il corrente e i morti

        let riga = document.createElement("div");
        riga.style.display = "flex";
        riga.style.alignItems = "center";
        riga.style.background = "#2c3e50";
        riga.style.padding = "10px";
        riga.style.borderRadius = "8px";
        riga.style.cursor = "pointer";
        riga.style.border = "2px solid transparent";
        
        let col = p.colore || "#ffffff";
        
        riga.innerHTML = `
            <div style="width:50px; height:50px; border-radius:50%; background:url('${p.immagine}') center/cover; border:2px solid ${col}; margin-right:15px;"></div>
            <div style="flex:1;">
                <div style="color:white; font-size:16px; font-weight:bold;">${p.nome} <span style="font-size:12px; color:${col}">(${p.elemento.toUpperCase()})</span></div>
                <div style="color:#bdc3c7; font-size:12px;">Lvl.${p.livello} | HP: ${p.hpAttuali}/${p.hpMax}</div>
            </div>
        `;
        
        riga.onclick = () => mostraDettaglioScambioBattaglia(index);
        contenitore.appendChild(riga);
    });
}

function chiudiScambioBattaglia() {
    document.getElementById("schermata-scambio-battaglia").style.display = "none";
}

function mostraDettaglioScambioBattaglia(index) {
    let p = miaSquadra[index];
    let dest = document.getElementById("scambio-battaglia-dettaglio");
    let col = p.colore || "#fff";
    
    let htmlOggetti = "";
    if (p.oggetti && p.oggetti.length > 0) {
        htmlOggetti += `<div style="margin-top:10px; border-top:1px dashed #34495e; padding-top:10px;">`;
        htmlOggetti += `<div style="color:#f1c40f; font-weight:bold; margin-bottom:5px; font-size:13px;">\u{1f392} Oggetti Equipaggiati:</div>`;
        p.oggetti.forEach(ogg => {
            htmlOggetti += `<div style="color:#ecf0f1; font-size:12px; margin-bottom:3px;">\u2022 ${ogg.nome}</div>`;
        });
        htmlOggetti += `</div>`;
    }

    const folder = p.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
    const immagineVS = `../Sprite/personaggi/${folder}/${p.nome}VS.png`;

    dest.innerHTML = `
        <div style="width:240px; height:240px; border-radius:50%; background:url('${immagineVS}') center/cover; border:6px solid ${col}; box-shadow:0 0 25px ${col}; margin-bottom:10px;"></div>
        <h2 style="color:white; margin:0;">${p.nome}</h2>
        <div style="color:${col}; font-weight:bold; margin-bottom:15px;">${p.elemento.toUpperCase()}</div>
        
        <div style="background:#1a1a2e; padding:15px; border-radius:8px; width:80%; text-align:left; color:#bdc3c7; font-size:14px; line-height:1.6;">
            <div><strong>Lvl:</strong> ${p.livello}</div>
            <div><strong>HP:</strong> ${p.hpAttuali}/${p.hpMax}</div>
            <div style="margin-top:10px; display:flex; justify-content:space-between;">
                <span><strong>ATK:</strong> ${p.atk}</span>
                <span><strong>DEF:</strong> ${p.def}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span><strong>SP.ATK:</strong> ${p.atkSpec}</span>
                <span><strong>SP.DEF:</strong> ${p.defSpec}</span>
            </div>
            <div><strong>VEL:</strong> ${p.vel}</div>
            <div style="margin-top:10px; color:#2ecc71;"><strong>Mossa:</strong> ${getNomeMossaAttuale(p)} (Lvl ${p.livelloMossa})</div>
            ${htmlOggetti}
        </div>
        
        <button onclick="eseguiCambioInBattagliaVero(${index})" style="background:#f39c12; color:white; border:none; border-radius:8px; padding:15px 30px; font-family:monospace; font-weight:bold; font-size:20px; cursor:pointer; margin-top:20px; box-shadow:0 4px 6px rgba(0,0,0,0.5); width:80%;">MANDA IN CAMPO</button>
    `;
}

function eseguiCambioInBattagliaVero(index) {
    let target = miaSquadra[index];
    if (!target || target.hpAttuali <= 0) return;
    
    let temp = miaSquadra[0];
    miaSquadra[0] = target;
    miaSquadra[index] = temp;
    
    // Aggiorna il riferimento globale
    if (typeof mioPokemon !== "undefined") {
        mioPokemon = target;
    }
    
    chiudiScambioBattaglia();
    
    let log = document.getElementById("console-log");
    if(log) {
        log.innerHTML += `<br>\u{1f504} <strong>${temp.nome}</strong> torna indietro! Vai <strong>${target.nome}</strong>!`;
    }
    
    document.getElementById("btn-attacco").disabled = true;
    document.getElementById("btn-item").disabled = true;
    document.getElementById("btn-pokemon").disabled = true;
    document.getElementById("btn-fuga").disabled = true;
    
    if (typeof aggiornaGrafica === "function") aggiornaGrafica();
    setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
}



// Chiude la schermata dettaglio e torna alla mappa/battaglia
function chiudiDettaglio() { 
    if (typeof inBattleSwapMode !== "undefined" && inBattleSwapMode) {
        cambiaSchermata("schermata-dettaglio", "schermata-gioco");
        inBattleSwapMode = false;
    } else {
        cambiaSchermata("schermata-dettaglio", "schermata-mappa"); 
        aggiornaSquadraMappa();
    }
}

// Torna alla mappa dalla schermata di gioco o dal centro medico
function tornaAllaMappa() {
    cambiaSchermata("schermata-gioco", "schermata-mappa");
    cambiaSchermata("schermata-centro-medico", "schermata-mappa");
    generaMappaAlbero(); 
    aggiornaSquadraMappa();
    if (typeof aggiornaDisplayMonete === "function") aggiornaDisplayMonete();
    
    document.getElementById("btn-attacco").style.display = "flex";
    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-torna-mappa").style.display = "none";
    // Ripristina btn-item visibile e disabilitato (sar\u00e0 ri-abilitato a inizio prossimo incontro)
    const btnItem = document.getElementById("btn-item");
    if (btnItem) { btnItem.style.display = "flex"; btnItem.disabled = true; }
    const btnPokemon = document.getElementById("btn-pokemon");
    if (btnPokemon) { btnPokemon.style.display = "flex"; btnPokemon.disabled = true; }
    const btnFuga = document.getElementById("btn-fuga");
    if (btnFuga) { btnFuga.style.display = "flex"; btnFuga.disabled = false; }
}

// Torna alla mappa dopo aver usato un disco mossa
function tornaAllaMappaDaDisco() {
    isBossFight = false;
    cambiaSchermata("schermata-disco", "schermata-mappa");
    generaMappaAlbero();
    aggiornaSquadraMappa();
    if (typeof aggiornaDisplayMonete === "function") aggiornaDisplayMonete();
    document.getElementById("btn-attacco").style.display = "flex";
    document.getElementById("btn-attacco").disabled = false;
    const btnTornaMappa = document.getElementById("btn-torna-mappa");
    if (btnTornaMappa) btnTornaMappa.style.display = "none";
    const btnItem = document.getElementById("btn-item");
    if (btnItem) { btnItem.style.display = "flex"; btnItem.disabled = true; }
    const btnPokemon = document.getElementById("btn-pokemon");
    if (btnPokemon) { btnPokemon.style.display = "flex"; btnPokemon.disabled = true; }
    const btnFuga = document.getElementById("btn-fuga");
    if (btnFuga) { btnFuga.style.display = "flex"; btnFuga.disabled = false; }
}

// Apre la schermata disco mossa con la lista della squadra cliccabile
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

        let btnText = lvlMossa >= 3 ? "MAX" : "POTENZIA";
        let btnColor = lvlMossa >= 3 ? "#718093" : "#2f3640";
        
        if (lvlMossa >= 3) {
            scheda.style.opacity = "0.6";
            scheda.style.cursor = "not-allowed";
        } else {
            scheda.onclick = function() {
                potenziiaMossaPokemon(index); 
            };
        }

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
            <div style="font-size: 12px; font-weight: bold; background: ${btnColor}; color: #fff; padding: 4px 10px; border-radius: 20px; text-align: center; width: 80%;">
                ${btnText}
            </div>
        `;
        contenitore.appendChild(scheda);
    });

    cambiaSchermata("schermata-mappa", "schermata-disco");
}

// Aumenta il livello mossa di un Pokémon (max 3)
function potenziiaMossaPokemon(index) {
    let p = miaSquadra[index];
    if(p.livelloMossa < 3) {
        p.livelloMossa += 1;
    }
    tornaAllaMappaDaDisco();
}

let filtroRaritaPokedex = "tutti";
let filtroElementoPokedex = "tutti";

// Apre il modal info con il Pokédex completo
function apriModalInfo() {
    const modal = document.getElementById("modal-info");
    const header = document.getElementById("info-header");
    
    if (!modal || !header) return;

    // Reset filtri all'apertura
    filtroRaritaPokedex = "tutti";
    filtroElementoPokedex = "tutti";
    
    const selectElem = document.getElementById("filtro-elemento-pokedex");
    if (selectElem) selectElem.value = "tutti";

    // Pulisci l'header (prima conteneva le percentuali)
    header.innerHTML = "";

    aggiornaTabsRaritaPokedex();
    applicaFiltriPokedex();

    modal.style.display = "flex";
}

// Chiude il modal info Pokédex
function chiudiModalInfo() {
    document.getElementById("modal-info").style.display = "none";
}

function cambiaElementoPokedex(val) {
    filtroElementoPokedex = val;
    applicaFiltriPokedex();
}

function cambiaRaritaPokedex(val) {
    filtroRaritaPokedex = val;
    aggiornaTabsRaritaPokedex();
    applicaFiltriPokedex();
}

function aggiornaTabsRaritaPokedex() {
    const container = document.getElementById("pokedex-rarita-tabs");
    if (!container) return;
    container.innerHTML = "";

    const listRarita = [
        { id: "tutti", label: "TUTTI", colore: "#3498db" },
        { id: "comune", label: "COMUNI", colore: CONFIG_RARITA["comune"].colore },
        { id: "non comune", label: "NON COMUNI", colore: CONFIG_RARITA["non comune"].colore },
        { id: "raro", label: "RARI", colore: CONFIG_RARITA["raro"].colore },
        { id: "epico", label: "EPICI", colore: CONFIG_RARITA["epico"].colore },
        { id: "leggendario", label: "LEGGENDARI", colore: CONFIG_RARITA["leggendario"].colore },
        { id: "bombers", label: "BOMBERS", colore: CONFIG_RARITA["bombers"].colore },
        { id: "special", label: "SPECIALI", colore: CONFIG_RARITA["special"].colore }
    ];

    listRarita.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "btn-rarita-tab";
        btn.textContent = item.label;
        
        if (filtroRaritaPokedex === item.id) {
            btn.classList.add("attivo");
            btn.style.backgroundColor = item.colore;
        }
        
        btn.onclick = () => cambiaRaritaPokedex(item.id);
        container.appendChild(btn);
    });
}

function applicaFiltriPokedex() {
    const griglia = document.getElementById("info-griglia-schede");
    if (!griglia) return;
    griglia.innerHTML = "";

    const pDatabaseFiltrato = pokemonDatabase
        .filter(p => !p.isEvoluzione)
        .filter(p => {
            if (filtroRaritaPokedex !== "tutti" && p.raritaTipo.toLowerCase() !== filtroRaritaPokedex) {
                return false;
            }
            if (filtroElementoPokedex !== "tutti" && p.elemento.toLowerCase() !== filtroElementoPokedex) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            const valA = (typeof SCALA_RARITA_MAPPA !== "undefined" && SCALA_RARITA_MAPPA[a.raritaTipo.toLowerCase()]) || 0;
            const valB = (typeof SCALA_RARITA_MAPPA !== "undefined" && SCALA_RARITA_MAPPA[b.raritaTipo.toLowerCase()]) || 0;
            return valA - valB;
        });

    if (pDatabaseFiltrato.length === 0) {
        griglia.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #bdc3c7; font-size: 16px; padding: 40px;">Nessun personaggio corrisponde ai filtri selezionati.</div>`;
        return;
    }

    pDatabaseFiltrato.forEach(pBase => {
        let coloreRarita = CONFIG_RARITA[pBase.raritaTipo]?.colore || "#ffe066";
        
        const folder = pBase.nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
        const immagineVS = `../Sprite/personaggi/${folder}/${pBase.nome}VS.png`;

        let scheda = document.createElement("div");
        scheda.className = "scheda-info-pokedex";
        scheda.style.backgroundColor = coloreRarita;

        scheda.innerHTML = `
            <div class="blocco-foto-pokedex">
                <img src="${immagineVS}" alt="${pBase.nome}">
            </div>
            <div class="blocco-stats-pokedex">
                <div class="info-titolo">
                    <span class="nome-pkm">${pBase.nome}</span><br>
                    <span class="rarita-pkm">[${pBase.raritaTipo.toUpperCase()}]</span><br>
                    <div style="margin-top:2px;">${getHtmlElemento(pBase.elemento)}</div>
                </div>
                <hr class="separatore-pkm">
                <div class="pokedex-lore" style="font-size:12px; line-height:1.4; font-family:sans-serif; color:#1e272e; flex-grow:1; overflow-y:auto; text-align:left; padding:8px; background:rgba(255,255,255,0.5); border-radius:4px; box-sizing:border-box; border:1px solid rgba(0,0,0,0.1); margin-top:5px;">
                    ${pBase.lore || '<em>Nessuna lore disponibile per questo personaggio.</em>'}
                </div>
            </div>
        `;
        griglia.appendChild(scheda);
    });
}

// ==========================================================
// SCALING DEL CONTENITORE GIOCO (STILE POKELIKE 900x1281)
// ==========================================================
function adattaRisoluzioneGioco() {
    const container = document.getElementById("contenitore-mappa-gioco");
    if (!container) return;
    
    const baseWidth = 900;
    const baseHeight = 1281;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calcola il fattore di scala mantenendo le proporzioni
    const scalaX = windowWidth / baseWidth;
    const scalaY = windowHeight / baseHeight;
    const scala = Math.min(scalaX, scalaY);
    
    // Centra e scala il container
    container.style.transform = `translate(-50%, -50%) scale(${scala})`;
    
    // Esponi la larghezza e altezza scalata per la UI esterna
    document.documentElement.style.setProperty('--map-scaled-width', (baseWidth * scala) + 'px');
    document.documentElement.style.setProperty('--map-scaled-height', (baseHeight * scala) + 'px');
}

// Registra i trigger
window.addEventListener("resize", adattaRisoluzioneGioco);
window.addEventListener("load", adattaRisoluzioneGioco);
document.addEventListener("DOMContentLoaded", adattaRisoluzioneGioco);

// Esegui subito all'avvio dello script
adattaRisoluzioneGioco();

// Ritorno in Lobby
function tornaALobbyDaMappa() {
    const modal = document.getElementById('modal-conferma-lobby');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Fallback se il modal non c'è
        if (confirm('Vuoi davvero abbandonare la run in corso e tornare alla lobby?')) {
            location.reload();
        }
    }
}

function tornaAllaLobbyDaVittoria() {
    location.reload();
}


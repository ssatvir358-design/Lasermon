// ==========================================================
// schermate.js — Gestione navigazione tra schermate e UI generale
// Estratto da script.js (righe 466-503, 1256-1354, 1427-1438, 1481-1545)
// Dipendenze: stato.js, pokemon_factory.js, audio.js
// ==========================================================

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
    if (idMostra === "schermata-mappa") riproduciMusica("mappa.mp3");
    if (idMostra === "schermata-gioco") {
        // Riproduce la musica normale SOLO se non è una Boss Fight
        if (!isBossFight) {
            riproduciMusica("combattimento.mp3");
        }
    }
};

// Mostra la schermata di selezione starter (i primi 3 Pokémon del DB)
function mostraSelezione() {
    cambiaSchermata("schermata-start", "schermata-selezione");
    document.getElementById("titolo-selezione").innerText = "Scegli il tuo Pokémon Iniziale";
    
    const contenitore = document.getElementById("contenitore-starter");
    contenitore.innerHTML = "";
    
    // I primi 3 elementi del DB sono fissi come starter
    for (let i = 0; i < 3; i++) {
        let infoBase = pokemonDatabase[i]; 
        let p = creaPokemon(infoBase, 5, 1); // Starter: livello 5, mossa 1

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

// Genera le opzioni Pokémon da scegliere (per Pokéball, non per starter)
function generaOpzioniPokemon(quanti, isStarter) {
    if (isStarter) return;

    const contenitore = document.getElementById("contenitore-starter");
    contenitore.innerHTML = "";
    
    let nomiEstratti = [];

    for (let i = 0; i < quanti; i++) {
        let infoBase = pescaPokemonCasuale(nomiEstratti); 
        nomiEstratti.push(infoBase.nome);
        
        let configGenerata = calcolaLivelloEMossaMappa(pianoAttuale);
        let p = creaPokemon(infoBase, configGenerata.livello, configGenerata.livelloMossa);

        let colonna = document.createElement("div");
        colonna.className = "colonna-starter";
        
        let bloccoAzioneHTML = "";
        if (miaSquadra.length >= 6) {
            // Squadra piena: mostra select per scegliere chi sostituire
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

// Conferma scelta con sostituzione (quando la squadra è piena)
function confermaSceltaConSostituzione(indiceOpzione, nuovoPokemon) {
    const select = document.getElementById(`select-sostituisci-${indiceOpzione}`);
    const valoreScelto = select.value;
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
// ZAINO MAPPA (SOLO VISIVO)
// ----------------------------------------------------------
function apriPannelloZainoMappa() {
    const modale = document.getElementById("modale-zaino-mappa");
    const contenitore = document.getElementById("zaino-mappa-lista");
    if (!modale || !contenitore) return;
    
    contenitore.innerHTML = "";
    
    if (zaino.length === 0) {
        contenitore.innerHTML = "<p style='color: white; width: 100%; text-align: center;'>Lo zaino è vuoto.</p>";
    } else {
        zaino.forEach(item => {
            const divItem = document.createElement("div");
            divItem.className = "card-item-shop";
            divItem.style.cursor = "default";
            
            divItem.innerHTML = `
                <div style="font-weight: bold; color: #f1c40f;">${item.nome}</div>
                <div style="font-size: 12px; margin: 5px 0; color: #ddd;">${item.descrizione || "Nessuna descrizione."}</div>
            `;
            contenitore.appendChild(divItem);
        });
    }
    
    modale.style.display = "flex";
}

function chiudiPannelloZainoMappa() {
    const modale = document.getElementById("modale-zaino-mappa");
    if (modale) modale.style.display = "none";
}

// Aggiunge un Pokémon alla squadra e va alla mappa
function aggiungiASquadra(pObiettivo) {
    miaSquadra.push(pObiettivo);
    
    const onFatto = () => {
        cambiaSchermata("schermata-selezione", "schermata-mappa");
        if (miaSquadra.length === 1) {
            generaMappaProcedurale(); // Genera la mappa solo al primo Pokémon scelto
        }
        generaMappaAlbero();
        aggiornaSquadraMappa();
    };
    
    verificaPerkDopoEvento(pObiettivo, onFatto);
}

// Aggiorna la griglia icone della squadra visibile sulla mappa
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
        
        // Se ha oggetti equipaggiati, mostra l'icona
        if (p.oggetti && p.oggetti.length > 0) {
            let zainetto = document.createElement("div");
            zainetto.innerText = "🎒";
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

// Apre la schermata dettaglio di un Pokémon della squadra
function mostraDettaglioPokemon(index) {
    let p = miaSquadra[index]; 
    if (!p) return;
    
    indicePokemonInDettaglio = index;

    document.getElementById("dettaglio-img").src = p.immagine; 
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
    document.getElementById("dettaglio-hp").innerText = `${p.hpAttuali}/${p.hpMax}`;
    document.getElementById("dettaglio-atk").innerText = p.atk;
    document.getElementById("dettaglio-def").innerText = p.def;
    document.getElementById("dettaglio-vel").innerText = p.vel;
    document.getElementById("dettaglio-mossa").innerText = `${getNomeMossaAttuale(p)} (Lvl ${p.livelloMossa})`;

    // Popola il select per cambiare la posizione in squadra
    let select = document.getElementById("select-posizione");
    if (select) {
        select.innerHTML = "";
        for (let i = 0; i < miaSquadra.length; i++) {
            let pSquadra = miaSquadra[i];
            let hasItem = (pSquadra.oggetti && pSquadra.oggetti.length > 0) ? " 🎒" : "";
            let opzione = document.createElement("option");
            opzione.value = i;
            opzione.text = `Posizione ${i + 1} (${pSquadra.nome}${hasItem})`;
            if (i === index) opzione.selected = true;
            select.appendChild(opzione);
        }
    }

    cambiaSchermata("schermata-mappa", "schermata-dettaglio");
}

// Esegue lo scambio di posizione in squadra scelto dal select
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

// Chiude la schermata dettaglio e torna alla mappa
function chiudiDettaglio() { 
    cambiaSchermata("schermata-dettaglio", "schermata-mappa"); 
    aggiornaSquadraMappa();
}

// Torna alla mappa dalla schermata di gioco o dal centro medico
function tornaAllaMappa() {
    cambiaSchermata("schermata-gioco", "schermata-mappa");
    cambiaSchermata("schermata-centro-medico", "schermata-mappa");
    generaMappaAlbero(); 
    aggiornaSquadraMappa();
    if (typeof aggiornaDisplayMonete === "function") aggiornaDisplayMonete();
    
    document.getElementById("btn-attacco").style.display = "inline-block";
    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-torna-mappa").style.display = "none";
    // Ripristina btn-item visibile e disabilitato (sarà ri-abilitato a inizio prossimo incontro)
    const btnItem = document.getElementById("btn-item");
    if (btnItem) { btnItem.style.display = "inline-block"; btnItem.disabled = true; }
}

// Torna alla mappa dopo aver usato un disco mossa
function tornaAllaMappaDaDisco() {
    isBossFight = false;
    cambiaSchermata("schermata-disco", "schermata-mappa");
    generaMappaAlbero();
    aggiornaSquadraMappa();
    if (typeof aggiornaDisplayMonete === "function") aggiornaDisplayMonete();
    document.getElementById("btn-attacco").style.display = "inline-block";
    document.getElementById("btn-attacco").disabled = false;
    document.getElementById("btn-torna-mappa").style.display = "none";
    const btnItem = document.getElementById("btn-item");
    if (btnItem) { btnItem.style.display = "inline-block"; btnItem.disabled = true; }
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

// Aumenta il livello mossa di un Pokémon (max 3)
function potenziiaMossaPokemon(index) {
    let p = miaSquadra[index];
    if(p.livelloMossa < 3) {
        p.livelloMossa += 1;
    }
    tornaAllaMappaDaDisco();
}

// Apre il modal info con il Pokédex completo
function apriModalInfo() {
    const modal = document.getElementById("modal-info");
    const header = document.getElementById("info-header");
    const griglia = document.getElementById("info-griglia-schede");
    
    if (!modal || !header || !griglia) return;

    // Intestazione con le probabilità di rarità
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

// Chiude il modal info Pokédex
function chiudiModalInfo() {
    document.getElementById("modal-info").style.display = "none";
}

// Scroll orizzontale nella griglia info con la rotella del mouse
document.getElementById("info-griglia-schede").addEventListener("wheel", (evt) => {
    evt.preventDefault();
    document.getElementById("info-griglia-schede").scrollLeft += evt.deltaY;
});

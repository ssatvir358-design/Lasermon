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
    
    let btnTornaLobby = document.getElementById("btn-torna-lobby");
    if (btnTornaLobby) btnTornaLobby.style.display = "block";
    
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
                opzioniSostituzione += `<option value="${idx}">Sostituisci ${membro.nome} (Lvl.${membro.livello})</option>`;
            });
            
            bloccoAzioneHTML = `
                <select id="select-sostituisci-${i}" style="margin-top: 10px; width: 100%; font-size: 14px; padding: 5px;">
                    ${opzioniSostituzione}
                </select>
                <button class="btn-scegli" style="margin-top: 5px; width: 100%;" onclick='confermaSceltaConSostituzione(${i}, ${JSON.stringify(p).replace(/'/g, "\\'")})'>CONFERMA</button>
            `;
        } else {
            // C'è spazio, semplice tasto Scegli
            bloccoAzioneHTML = `<button class="btn-scegli" onclick='aggiungiASquadra(${JSON.stringify(p).replace(/'/g, "\\'")})'>Scegli</button>`;
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
        zaino.forEach((item, indexZaino) => {
            const divItem = document.createElement("div");
            divItem.className = "card-item-shop";
            divItem.style.cursor = "default";
            
            let htmlInner = `
                <div style="font-weight: bold; color: #f1c40f;">${item.nome}</div>
                <div style="font-size: 12px; margin: 5px 0; color: #ddd;">${item.descrizione || "Nessuna descrizione."}</div>
            `;
            
            if (item.categoria === "equipaggiabile") {
                let opzioni = miaSquadra.map((p, i) => `<option value="${i}">${p.nome}</option>`).join("");
                htmlInner += `
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <select id="select-equip-${indexZaino}" style="flex: 1; padding: 5px; background: #2c3e50; color: white; border: 1px solid #34495e; border-radius: 4px;">
                            ${opzioni}
                        </select>
                        <button class="btn-scegli" onclick="equipaggiaDaZaino(${indexZaino})" style="padding: 5px 10px; font-size: 12px;">DAI</button>
                    </div>
                `;
            }
            
            divItem.innerHTML = htmlInner;
            contenitore.appendChild(divItem);
        });
    }
    
    modale.style.display = "flex";
}

function chiudiPannelloZainoMappa() {
    const modale = document.getElementById("modale-zaino-mappa");
    if (modale) modale.style.display = "none";
}

function equipaggiaDaZaino(indexZaino) {
    const select = document.getElementById(`select-equip-${indexZaino}`);
    if (!select) return;
    
    let pIndex = parseInt(select.value);
    let p = miaSquadra[pIndex];
    let item = zaino[indexZaino];
    
    // Controlla se il pokemon ha già raggiunto il limite di oggetti (es. 1 o 2)
    // Per ora non c'è limite, ma volendo si può aggiungere un check
    
    // Aggiungi l'item al pokemon
    p.oggetti.push(item);
    
    // Rimuovi l'item dallo zaino
    zaino.splice(indexZaino, 1);
    
    // Riapplica i bonus statistici
    if (typeof applicaBonusOggetti === "function") {
        applicaBonusOggetti(p);
    }
    
    // Notifica visiva (opzionale)
    let log = document.getElementById("console-log");
    if (log) log.innerHTML = `✅ ${item.nome} equipaggiato a ${p.nome}!`;
    
    // Ricarica la schermata
    aggiornaSquadraMappa();
    apriPannelloZainoMappa();
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
    
    const mapElementoColore = {
        "fuoco": "#ff4d4d",
        "acqua": "#3498db",
        "erba": "#2ecc71",
        "luce": "#f1c40f",
        "buio": "#9b59b6"
    };

    miaSquadra.forEach((p, index) => {
        let quadratino = document.createElement("div");
        quadratino.className = "icona-squadra";
        if (index === 0) quadratino.classList.add("primo-posto"); 
        
        quadratino.setAttribute("data-rarita", p.raritaTipo);
        
        let col = p.elemento ? mapElementoColore[p.elemento.toLowerCase()] || p.colore : p.colore;
        quadratino.style.borderColor = col;
        // Glow molto intenso sia all'esterno che all'interno del bordo
        quadratino.style.boxShadow = `0 0 25px 8px ${col}, inset 0 0 15px ${col}`;
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

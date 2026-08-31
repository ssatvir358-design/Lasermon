// ==========================================================
// negozio.js \u2014 Logica negozio, zaino e uso item in battaglia
// Dipendenze: stato.js, oggetti.js, pokemon_factory.js, schermate.js
// ==========================================================

// ==========================================================
// HELPERS ZAINO
// Funzioni per gestire l'inventario del giocatore.
// Il zaino \u00e8 un array di { dbId: string, quantita: number }.
// ==========================================================

// Il zaino è un array di { dbId: string, quantita: number }.
// ==========================================================

/** Restituisce la quantità posseduta di un item nello zaino (0 se assente). */
function getQuantitaZaino(dbId) {
    const entry = zaino.find(e => e.dbId === dbId);
    return entry ? entry.quantita : 0;
}

/** Aggiunge 1 unità di un item allo zaino (raggruppa con eventuali esistenti). */
function aggiungiAZaino(dbId, qty = 1) {
    // Se è stato passato il nome dell'oggetto anziché l'ID, lo cerchiamo
    let veroItem = getOggettoDb(dbId);
    if (!veroItem) {
        veroItem = DB_OGGETTI.find(o => o.nome.toLowerCase() === dbId.toLowerCase());
        if (veroItem) dbId = veroItem.id;
    }

    if (typeof isRunVeloce !== "undefined" && isRunVeloce) {
        const itemObj = getOggettoDb(dbId);
        if (itemObj && itemObj.categoria === "consumabile") {
            // Cerca il primo pokemon vivo (che abbia bisogno di cure se possibile)
            let target = miaSquadra.find(p => p.hpAttuali > 0 && p.hpAttuali < p.hpMax);
            if (!target) target = miaSquadra.find(p => p.hpAttuali > 0); // fallback al primo vivo
            
            if (target) {
                const msg = applicaEffettoItem(itemObj, target);
                // Aggiorna l'esito a schermo (per eventi mistero)
                const misteroText = document.getElementById("mistero-esitotesto");
                if (misteroText) {
                    misteroText.innerHTML += `<br>✨ (Run Veloce) Hai usato subito ${itemObj.nome}! ${msg}`;
                }
                aggiornaGrafica();
                return; // Non aggiunge allo zaino
            }
        }
    }

    const entry = zaino.find(e => e.dbId === dbId);
    if (entry) {
        entry.quantita += qty;
    } else {
        zaino.push({ dbId, quantita: qty });
    }
    
    // Aggiorna l'interfaccia persistente dello zaino se siamo sulla mappa
    if (typeof aggiornaPannelloZainoMappa === "function") {
        aggiornaPannelloZainoMappa();
    }
}

/**
 * Rimuove 1 unit\u00e0 di un item dallo zaino.
 * Rimuove 1 unità di un item dallo zaino.
 * Se la quantità arriva a 0, rimuove l'entry completamente.
 * @returns {boolean} true se la rimozione ha avuto successo
 */
function rimuoviDaZaino(dbId) {
    const idx = zaino.findIndex(e => e.dbId === dbId);
    if (idx === -1) return false;
    zaino[idx].quantita--;
    if (zaino[idx].quantita <= 0) zaino.splice(idx, 1);
    
    // Aggiorna l'interfaccia persistente dello zaino se siamo sulla mappa
    if (typeof aggiornaPannelloZainoMappa === "function") {
        aggiornaPannelloZainoMappa();
    }
    
    return true;
}

function vendiItem(dbId, quantita = 1) {
    const item = getOggettoDb(dbId);
    if (!item) return;
    
    const quantitaPosseduta = getQuantitaZaino(dbId);
    if (quantitaPosseduta < quantita) {
        mostraAvviso("Non possiedi abbastanza unità di questo oggetto!");
        return;
    }
    
    const ricavoSingolo = Math.floor(item.costo * 0.5);
    const ricavoTotale = ricavoSingolo * quantita;

    monete += ricavoTotale;
    
    for (let i = 0; i < quantita; i++) {
        rimuoviDaZaino(dbId);
    }
    
    aggiornaDisplayMonete();
    _aggiornaDettaglioNegozio();
    
    if (typeof aggiornaPannelloZainoMappa === "function") {
        aggiornaPannelloZainoMappa();
    }
}

/** Recupera il record completo di un item dal DB_OGGETTI tramite id. */
function getOggettoDb(dbId) {
    return DB_OGGETTI.find(o => o.id === dbId) || null;
}

// ==========================================================
// DISPLAY MONETE
// Aggiorna tutti i widget monete visibili nell'interfaccia.
// ==========================================================

/**
 * Aggiorna tutte le visualizzazioni di monete nella UI.
 * Da chiamare ogni volta che `monete` cambia.
 */
function aggiornaDisplayMonete() {
    // Display sulla mappa
    const elMappa = document.getElementById("monete-display-mappa");
    if (elMappa) elMappa.innerText = `\u{1f4b0} ${monete}`;

    // Display nell'header del negozio
    const elNegozio = document.getElementById("negozio-monete-header");
    if (elNegozio) elNegozio.innerText = `\u{1f4b0} ${monete}`;
}

// ==========================================================
// CENTRO MEDICO \u2014 Logica scelta iniziale
// ==========================================================

let haCuratoInVisita = false;

/** Mostra la fase di scelta del Centro Medico (cura vs negozio).
 *  Chiude anche l'eventuale negozio rimasto aperto per sicurezza. */
function apriCentroMedico() {
    // Forza chiusura del negozio overlay (se rimasto aperto da una sessione precedente)
    const elNeg = document.getElementById("schermata-negozio");
    if (elNeg) elNeg.style.display = "none";

    // Mostra la fase scelta (display:flex), nasconde la fase cura
    document.getElementById("centro-fase-scelta").style.display = "flex";
    document.getElementById("centro-fase-cura").style.display   = "none";
    
    // Nascondi o mostra il negozio
    const btnNegozio = document.querySelector(".btn-negozio");
    if (btnNegozio) {
        btnNegozio.style.display = (typeof isRunVeloce !== "undefined" && isRunVeloce) ? "none" : "";
    }

    // Ripristina stato pulsante cura
    haCuratoInVisita = false;
    const btnCura = document.getElementById("btn-cura-squadra");
    const txtCura = document.getElementById("testo-cura-squadra");
    if (btnCura) {
        btnCura.disabled = false;
        btnCura.style.opacity = "1";
        btnCura.style.cursor = "pointer";
    }
    if (txtCura) txtCura.innerText = "Ripristina tutti gli HP";
    
    cambiaSchermata("schermata-mappa", "schermata-centro-medico");
}

/** Cura tutta la squadra e mostra il team curato. */
function scegliCura() {
    if (haCuratoInVisita) return;
    miaSquadra.forEach(p => p.hpAttuali = p.hpMax);
    
    haCuratoInVisita = true;
    const btnCura = document.getElementById("btn-cura-squadra");
    const txtCura = document.getElementById("testo-cura-squadra");
    if (btnCura) {
        btnCura.disabled = true;
        btnCura.style.opacity = "0.5";
        btnCura.style.cursor = "not-allowed";
    }
    if (txtCura) txtCura.innerText = "Squadra Curata!";
    
    // Mostriamo solo un toast invece di chiudere la schermata
    let log = document.getElementById("console-log-zaino") || document.getElementById("console-log");
    if (log) log.innerHTML = `🏥 Tutti i Pokémon sono stati curati!`;


    const contenitore = document.getElementById("contenitore-medico-squadra");
    if (!contenitore) return;
    contenitore.innerHTML = "";

    miaSquadra.forEach(p => {
        const scheda = document.createElement("div");
        scheda.className       = "scheda-disco-pokemon";
        scheda.style.backgroundColor = p.colore || "#ffffff";
        scheda.style.cursor    = "default";
        scheda.style.transform = "none";
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
        contenitore.appendChild(scheda);
    });
}

/** Torna alla mappa dal Centro Medico. */
function tornaAllaMappaDaCentro() {
    cambiaSchermata("schermata-centro-medico", "schermata-mappa");
    aggiornaSquadraMappa();
    generaMappaAlbero();
}

// ==========================================================
// NEGOZIO \u2014 Apertura e rendering
// ==========================================================

const CONFIG_NEGOZIO = {
    // Numero massimo di acquisti consentiti in una singola visita al centro medico
    maxAcquistiPerVisita: 999, 
    // Se true, mostra i pulsanti + e - per comprare pi\u00f9 item alla volta
    abilitaQuantitaMultipla: true,
    // Se true, il semplice fatto di chiudere il negozio rimanda alla mappa,
    // chiudendo definitivamente il nodo del centro medico (impedendo la cura).
    chiudiCentroDopoNegozio: true
};

// dbId dell'item attualmente selezionato nella lista negozio
let _itemSelezionatoNegozio = null;
let _acquistiFattiInVisita = 0;
let _quantitaSelezionataNegozio = 1;

/** Apre il negozio con gli item disponibili per la mappa corrente. */
function apriNegozio() {
    _itemSelezionatoNegozio = null;
    _acquistiFattiInVisita = 0;
    _quantitaSelezionataNegozio = 1;

    // Calcola il numero mappa corrente (es. "mappa3" \u2192 3)
    const numMappa = parseInt(mappaAttuale.replace("mappa", "")) || 1;

    // Filtra gli item acquistabili e disponibili in questa mappa
    let itemDisponibili = DB_OGGETTI.filter(o =>
        o.acquistabile && o.mappeAbilitate.includes(numMappa)
    );

    if (typeof isRunVeloce !== "undefined" && isRunVeloce) {
        return; // Il negozio è completamente disabilitato in Run Veloce
    }

    _popolaListaNegozio(itemDisponibili);
    _svuotaDettaglioNegozio();
    aggiornaDisplayMonete();

    // OVERLAY: apre il negozio come div fisso sopra qualsiasi schermata.
    // Non usa cambiaSchermata per non interferire con il sistema .attiva.
    const el = document.getElementById("schermata-negozio");
    if (el) el.style.display = "flex";
}

/**
 * Popola la colonna sinistra del negozio con i card degli item.
 * @param {object[]} items - Array di record di DB_OGGETTI
 */
function _popolaListaNegozio(items) {
    const lista = document.getElementById("negozio-lista");
    if (!lista) return;
    lista.innerHTML = "";

    if (items.length === 0) {
        lista.innerHTML = `<div class="pannello-item-vuoto">Nessun articolo disponibile in questa zona.</div>`;
        return;
    }

    items.forEach(item => {
        const puoAcquistare = monete >= item.costo;

        const row = document.createElement("div");
        row.className    = "negozio-item-row";
        row.dataset.dbid = item.id;

        // Render icona: img con fallback emoji in caso di 404
        const iconaHtml = `
            <img src="${item.icona}" class="item-icona"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
                 alt="${item.nome}">
            <span class="item-icona-fallback" style="display:none; font-size:26px; line-height:1;">${item.iconaFallback}</span>
        `;

        row.innerHTML = `
            ${iconaHtml}
            <span class="item-nome">${item.nome}</span>
            <span class="item-costo ${puoAcquistare ? '' : 'non-acquistabile'}">
                ${item.costo} \u{1f4b0}
            </span>
        `;
        row.onclick = () => _mostraDettaglioItem(item.id, items);
        lista.appendChild(row);
    });
}

/**
 * Mostra il dettaglio di un item nella colonna destra del negozio.
 * Evidenzia la riga selezionata nella lista sinistra.
 */
function _mostraDettaglioItem(dbId, itemsDisponibili) {
    _itemSelezionatoNegozio = dbId;
    _quantitaSelezionataNegozio = 1; // Resetta la quantit\u00e0
    
    _aggiornaDettaglioNegozio();
}

/** Cambia la quantit\u00e0 selezionata dal selettore + / - */
function _cambiaQuantitaItem(delta) {
    const nuovaQuantita = _quantitaSelezionataNegozio + delta;
    if (nuovaQuantita >= 1) {
        _quantitaSelezionataNegozio = nuovaQuantita;
        _aggiornaDettaglioNegozio();
    }
}

/** Aggiorna il pannello di dettaglio (utile se cambia l'item o la quantit\u00e0) */
function _aggiornaDettaglioNegozio() {
    const item = getOggettoDb(_itemSelezionatoNegozio);
    if (!item) return;
    
    if (!CONFIG_NEGOZIO.abilitaQuantitaMultipla) {
        _quantitaSelezionataNegozio = 1;
    }
    
    const acquistiRimasti = CONFIG_NEGOZIO.maxAcquistiPerVisita - _acquistiFattiInVisita;
    const costoTotale = item.costo * _quantitaSelezionataNegozio;
    const puoAcquistare = (monete >= costoTotale) && (acquistiRimasti >= _quantitaSelezionataNegozio);

    // Evidenzia la riga nella lista
    document.querySelectorAll(".negozio-item-row").forEach(r => {
        r.classList.toggle("selezionato", r.dataset.dbid === _itemSelezionatoNegozio);
    });

    const det = document.getElementById("negozio-dettaglio");
    if (!det) return;

    const quantitaZaino = getQuantitaZaino(item.id);
    const valoreVenditaSingolo = Math.floor(item.costo * 0.5);
    const ricavoTotale = valoreVenditaSingolo * _quantitaSelezionataNegozio;
    const puoVendere = quantitaZaino >= _quantitaSelezionataNegozio;

    det.innerHTML = `
        <div>
            <div id="negozio-dettaglio-nome">${item.iconaFallback} ${item.nome}</div>
            <div id="negozio-dettaglio-desc">${item.descrizione}</div>
            <div style="color:#aaa; font-size:12px; text-align:center; margin-top:5px;">Nello zaino: ${quantitaZaino}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <div style="display: ${CONFIG_NEGOZIO.abilitaQuantitaMultipla ? 'flex' : 'none'}; align-items: center; gap: 15px; font-size: 20px; color: #fff;">
                <button onclick="_cambiaQuantitaItem(-1)" style="padding: 5px 15px; cursor: pointer; background: #333; color: white; border: 2px solid #555; border-radius: 5px;">-</button>
                <span>${_quantitaSelezionataNegozio}</span>
                <button onclick="_cambiaQuantitaItem(1)" style="padding: 5px 15px; cursor: pointer; background: #333; color: white; border: 2px solid #555; border-radius: 5px;">+</button>
            </div>
            
            <div style="display: flex; justify-content: space-between; width: 100%; gap: 10px; align-items: stretch;">
                <div style="flex:1; display:flex; flex-direction:column;">
                    <div style="text-align:center; font-weight:bold; color:#e74c3c;">-${costoTotale} \u{1f4b0}</div>
                    <button id="btn-acquista"
                            onclick="acquistaItem('${item.id}', ${_quantitaSelezionataNegozio})"
                            ${puoAcquistare ? '' : 'disabled'}
                            style="width: 100%; height:100%; padding: 10px 5px; font-size: 14px;">
                        ${puoAcquistare ? '\u2705 COMPRA' : (acquistiRimasti < _quantitaSelezionataNegozio ? '\u274c Max' : '\u274c No Monete')}
                    </button>
                </div>
                
                <div style="flex:1; display:flex; flex-direction:column;">
                    <div style="text-align:center; font-weight:bold; color:#2ecc71;">+${ricavoTotale} \u{1f4b0}</div>
                    <button id="btn-vendi"
                            onclick="vendiItem('${item.id}', ${_quantitaSelezionataNegozio})"
                            ${puoVendere ? '' : 'disabled'}
                            style="width: 100%; height:100%; padding: 10px 5px; font-size: 14px;">
                        ${puoVendere ? '\u{1f4e6} VENDI' : '\u274c Non possiedi'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

/** Svuota la colonna destra del negozio (stato iniziale). */
function _svuotaDettaglioNegozio() {
    const det = document.getElementById("negozio-dettaglio");
    if (det) det.innerHTML = `<div class="pannello-item-vuoto" style="color:#666; font-size:14px; text-align:center; margin-top:60px;">
        Seleziona un articolo dalla lista per vedere i dettagli.
    </div>`;
}

// ==========================================================
// NEGOZIO \u2014 Acquisto
// ==========================================================

/**
 * Acquista un item: scala le monete e lo aggiunge allo zaino.
 * Aggiorna poi la UI del negozio.
 */
function acquistaItem(dbId, quantita = 1) {
    const item = getOggettoDb(dbId);
    if (!item) return;
    
    const costoTotale = item.costo * quantita;
    if (monete < costoTotale) {
        mostraAvviso("Monete insufficienti!");
        return;
    }
    
    const acquistiRimasti = CONFIG_NEGOZIO.maxAcquistiPerVisita - _acquistiFattiInVisita;
    if (quantita > acquistiRimasti) {
        mostraAvviso(`Puoi acquistare al massimo ancora ${acquistiRimasti} item!`);
        return;
    }

    monete -= costoTotale;
    for (let i = 0; i < quantita; i++) {
        aggiungiAZaino(dbId);
    }
    aggiornaDisplayMonete();
    
    _acquistiFattiInVisita += quantita;    // Feedback visivo immediato
    const det = document.getElementById("negozio-dettaglio");
    if (det) {
        const feedback = document.createElement("div");
        feedback.style.cssText = "color:#2ecc71; font-family:monospace; font-weight:bold; font-size:14px; margin-top:8px; text-align: center;";
        feedback.innerText     = `✅ ${quantita > 1 ? quantita + 'x ' : ''}${item.nome} aggiunto allo zaino! Torno alla mappa...`;
        det.appendChild(feedback);
    }
    
    // Disabilita e nasconde il bottone per evitare doppi click
    const btnAcquista = document.getElementById("btn-acquista");
    if (btnAcquista) {
        btnAcquista.disabled = true;
        btnAcquista.style.display = "none";
    }
    
    // Rimanda alla mappa automaticamente dopo l'acquisto
    setTimeout(() => {
        chiudiNegozio();
        tornaAllaMappaDaCentro();
    }, 1000);
}

/** Chiude il negozio (nasconde l'overlay) e aggiorna la mappa. */
function chiudiNegozio() {
    // OVERLAY: chiude il div fisso senza toccare il sistema .attiva.
    const el = document.getElementById("schermata-negozio");
    if (el) el.style.display = "none";
    // Se il giocatore ha effettuato almeno un acquisto, oppure la configurazione forza la chiusura, 
    // risolve il nodo e torna alla mappa
    if (_acquistiFattiInVisita > 0 || CONFIG_NEGOZIO.chiudiCentroDopoNegozio) {
        tornaAllaMappaDaCentro();
    }

    // Aggiorna la mappa sottostante
    if (typeof aggiornaSquadraMappa === "function") aggiornaSquadraMappa();
    if (typeof generaMappaAlbero    === "function") generaMappaAlbero();
    if (typeof aggiornaDisplayMonete === "function") aggiornaDisplayMonete();
}

// ==========================================================
// ITEM IN BATTAGLIA \u2014 Pannello e utilizzo
// ==========================================================

/** Apre il pannello item durante il combattimento (turno giocatore). */
function apriPannelloItemBattaglia() {
    // Sicurezza: apri solo se \u00e8 il turno del giocatore e non ha gi\u00e0 usato un item
    if (itemUsatiQuestoTurno) return;
    if (document.getElementById("btn-attacco")?.disabled) return;

    const pannello = document.getElementById("pannello-item-battaglia");
    if (!pannello) return;

    // Toggle: se gi\u00e0 aperto, chiudi
    if (pannello.style.display === "block") {
        chiudiPannelloItemBattaglia();
        return;
    }

    _renderPannelloItemBattaglia();
    pannello.style.display = "block";
}

/** Chiude il pannello item in battaglia. */
function chiudiPannelloItemBattaglia() {
    const pannello = document.getElementById("pannello-item-battaglia");
    if (pannello) pannello.style.display = "none";
}

/**
 * Popola il pannello item in battaglia con gli item usabili del zaino.
 * Mostra solo item con usabileInBattaglia:true e che non abbiano superato
 * il loro limiteUtilizziPerFight (se presente).
 */
function _renderPannelloItemBattaglia() {
    const pannello = document.getElementById("pannello-item-battaglia");
    if (!pannello) return;

    // Filtra zaino: solo item usabili in battaglia non esauriti per fight
    const itemsBattaglia = zaino.filter(entry => {
        const cfg = getOggettoDb(entry.dbId);
        if (!cfg || !cfg.usabileInBattaglia) return false;
        // Controlla limite utilizzi per fight (null = nessun limite)
        if (cfg.limiteUtilizziPerFight !== null) {
            const usati = itemUsatiInFight[entry.dbId] || 0;
            if (usati >= cfg.limiteUtilizziPerFight) return false;
        }
        return true;
    });

    let contenuto = `
        <div class="pannello-item-titolo">
            \u{1f392} ZAINO
            <span onclick="chiudiPannelloItemBattaglia()" style="cursor:pointer; font-size:14px; color:#aaa;">\u2715</span>
        </div>
    `;

    if (itemsBattaglia.length === 0) {
        contenuto += `<div class="pannello-item-vuoto">Nessun item usabile in battaglia.</div>`;
    } else {
        itemsBattaglia.forEach(entry => {
            const cfg = getOggettoDb(entry.dbId);
            if (!cfg) return;
            contenuto += `
                <div class="pannello-item-row" onclick="preparaUsoItemInBattaglia('${entry.dbId}')">
                    <img src="${cfg.icona}" class="p-icona"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
                         alt="${cfg.nome}">
                    <span class="p-icona-fb" style="display:none; font-size:20px;">${cfg.iconaFallback}</span>
                    <span class="p-nome">${cfg.nome}</span>
                    <span class="p-qty">\u00d7${entry.quantita}</span>
                </div>
            `;
        });
    }

    pannello.innerHTML = contenuto;
}

/**
 * Mostra la schermata di selezione del Pokémon a cui applicare l'oggetto in battaglia.
 * @param {string} dbId - id dell'item da usare
 */
function preparaUsoItemInBattaglia(dbId) {
    const cfg = getOggettoDb(dbId);
    if (!cfg) return;

    const pannello = document.getElementById("pannello-item-battaglia");
    if (!pannello) return;

    let contenuto = `
        <div class="pannello-item-titolo">
            \u{1f392} USA SU:
            <span onclick="apriPannelloItemBattaglia()" style="cursor:pointer; font-size:14px; color:#aaa;">\u2B05 INDIETRO</span>
        </div>
    `;

    miaSquadra.forEach((p, i) => {
        if (!p) return;
        
        let pathImmagine = p.immagine;
        let pName = p.nome;
        let hpStr = `HP: ${p.hpAttuali}/${p.hpMax}`;

        // Controlla se il target è KO o con HP massimi
        let canUse = true;
        let msgError = "";
        
        if (cfg.effettoSpeciale === "revive") {
            if (p.hpAttuali > 0) {
                canUse = false;
                msgError = "Non \u00e8 KO";
            }
        } else {
            if (p.hpAttuali <= 0) {
                canUse = false;
                msgError = "Il Pok\u00e9mon \u00e8 KO";
            } else if (cfg.stat === "hp" && p.hpAttuali >= p.hpMax && (!cfg.effettoSpeciale || !cfg.effettoSpeciale.includes("rimuovi"))) {
                canUse = false;
                msgError = "HP gi\u00e0 al max";
            }
        }

        const opacity = canUse ? "1" : "0.5";
        const onclickAttr = canUse ? `onclick="confermaUsoItemInBattaglia('${dbId}', ${i})"` : "";
        const styleText = canUse ? "" : `text-decoration: line-through; color: #888;`;

        contenuto += `
            <div class="zaino-battaglia-row" style="opacity: ${opacity};" ${onclickAttr}>
                <div class="zaino-battaglia-icon" style="background-image: url('${pathImmagine}');"></div>
                <div class="zaino-battaglia-info">
                    <span style="font-weight: bold; ${styleText}">${pName}</span>
                    <span>${hpStr}</span>
                    ${msgError ? `<span style="color:#ff6b6b; font-size:10px;">${msgError}</span>` : ""}
                </div>
            </div>
        `;
    });

    pannello.innerHTML = contenuto;
}

/**
 * Usa un item dallo zaino in battaglia su un Pokémon specifico.
 * @param {string} dbId - id dell'item da usare
 * @param {number} indexPokemon - Indice in miaSquadra del Pokémon bersaglio
 */
function confermaUsoItemInBattaglia(dbId, indexPokemon) {
    if (itemUsatiQuestoTurno) return; // Blocco anti-spam/doppio click
    
    const cfg = getOggettoDb(dbId);
    if (!cfg) return;
    
    let target = miaSquadra[indexPokemon];
    if (!target) return;

    if (!rimuoviDaZaino(dbId)) return; // Fallback sicurezza

    // Traccia utilizzo per fight
    itemUsatiInFight[dbId] = (itemUsatiInFight[dbId] || 0) + 1;

    // Applica effetto
    const msg = applicaEffettoItem(cfg, target);

    // Aggiorna flag turno (1 item per turno)
    itemUsatiQuestoTurno = true;
    aggiornaStatoBtnItem();

    // Messaggio in console-log
    const logEl = document.getElementById("console-log");
    if (logEl) {
        logEl.innerHTML += `<br>\u{1f392} <strong>${cfg.nome}</strong> usato su ${target.nome}! ${msg}`;
    }

    // Se stiamo curando il pokémon attualmente in campo, o un pokemon nella squadra, aggiorniamo la grafica
    aggiornaGrafica();
    
    // Chiudi il pannello (che ora è una finestra modale al centro dello schermo)
    chiudiPannelloItemBattaglia();
}

/**
 * Applica un bonus (o malus) a una statistica specifica (atk, def, vel).
 * Usato internamente da applicaEffettoItem.
 * @param {object} target   - Istanza Pok\u00e9mon
 * @param {string} stat     - "atk" | "def" | "vel"
 * @param {number} valore   - Valore del bonus (positivo = bonus, negativo = malus)
 * @param {string} type     - "flat" | "percent"
 */
function _applicaBonusStatistica(target, stat, valore, type) {
    if (!(stat in target)) return;
    if (type === "flat") {
        target[stat] = Math.max(0, target[stat] + valore);
    } else if (type === "percent") {
        const delta = Math.round(target[stat] * Math.abs(valore));
        target[stat] = Math.max(0, valore >= 0
            ? target[stat] + delta
            : target[stat] - delta
        );
    }
}

/**
 * Applica l'effetto di un oggetto consumabile a un Pok\u00e9mon target.
 * @param {object} cfg - Record del DB_OGGETTI
 * @param {object} target - Il Pok\u00e9mon su cui applicare l'effetto
 * @returns {string} Messaggio descrittivo dell'effetto applicato
 */
function applicaEffettoItem(cfg, target) {
    let msg = "";

    // 1. Applica bonus principale (stat + valore)
    if (cfg.valore !== 0 && cfg.valore !== null && cfg.valore !== undefined) {
        if (cfg.stat === "hp") {
            // Recupero / bonus HP
            let cura = 0;
            if (cfg.valoreType === "flat") {
                if (cfg.categoria === "equipaggiabile") {
                    // Equipaggiabili: aumenta hpMax permanentemente e aggiunge anche gli HP attuali
                    target.hpMax    += cfg.valore;
                    target.hpAttuali = Math.min(target.hpMax, target.hpAttuali + cfg.valore);
                    msg += `HP massimi +${cfg.valore}. `;
                } else {
                    // Consumabili: cura semplice
                    cura = cfg.valore;
                    target.hpAttuali = Math.min(target.hpMax, target.hpAttuali + cura);
                    msg += `${target.nome} recupera ${cura} PV. `;
                }
            } else if (cfg.valoreType === "percent") {
                if (cfg.categoria === "equipaggiabile") {
                    const bonus = Math.round(target.hpMax * cfg.valore);
                    target.hpMax    += bonus;
                    target.hpAttuali = Math.min(target.hpMax, target.hpAttuali + bonus);
                    msg += `HP massimi +${Math.round(cfg.valore * 100)}%. `;
                } else {
                    cura = Math.round(target.hpMax * cfg.valore);
                    target.hpAttuali = Math.min(target.hpMax, target.hpAttuali + cura);
                    msg += `${target.nome} recupera ${cura} PV. `;
                }
            }
        } else if (cfg.stat === "atk") {
            _applicaBonusStatistica(target, "atk", cfg.valore, cfg.valoreType);
            const etichetta = cfg.valoreType === "percent" ? `+${Math.round(cfg.valore * 100)}%` : `+${cfg.valore}`;
            msg += `ATK ${etichetta}. `;
        } else if (cfg.stat === "def") {
            _applicaBonusStatistica(target, "def", cfg.valore, cfg.valoreType);
            const etichetta = cfg.valoreType === "percent" ? `+${Math.round(cfg.valore * 100)}%` : `+${cfg.valore}`;
            msg += `DEF ${etichetta}. `;
        } else if (cfg.stat === "vel") {
            _applicaBonusStatistica(target, "vel", cfg.valore, cfg.valoreType);
            const etichetta = cfg.valoreType === "percent" ? `+${Math.round(cfg.valore * 100)}%` : `+${cfg.valore}`;
            msg += `VEL ${etichetta}. `;
        }
    }

    // 2. Effetti speciali
    switch (cfg.effettoSpeciale) {

        case "rimuovi_bruciatura":
            // Rimuove solo il DOT bruciatura sul giocatore
            effettiAttivi.giocatore.bruciatura = null;
            msg += "Bruciatura rimossa! ";
            break;

        case "rimuovi_debuff":
            // Rimuove velocit\u00e0 ridotta e difesa ridotta sul giocatore
            effettiAttivi.giocatore.velRidotta = null;
            effettiAttivi.giocatore.defRidotta = null;
            msg += "Tutti i debuff rimossi! ";
            break;

        case "rimuovi_tutto":
            // Rimuove bruciatura + tutti i debuff sul giocatore
            effettiAttivi.giocatore.bruciatura = null;
            effettiAttivi.giocatore.velRidotta = null;
            effettiAttivi.giocatore.defRidotta = null;
            msg += "Tutti gli status negativi rimossi! ";
            break;

        case "atk_boost_temporaneo":
            // Applica boost ATK temporaneo (Contratto Determinato)
            // Sovrascrive un eventuale boost gi\u00e0 attivo
            effettiAttivi.giocatore.atkBoost = {
                durata:     cfg.durataInTurni || 3,
                percentuale: cfg.valore        // es. 0.20 = +20%
            };
            msg += `ATK aumentato del ${Math.round(cfg.valore * 100)}% per ${cfg.durataInTurni} turni! `;
            break;

        // ----------------------------------------------------------
        // EQUIPAGGIABILI \u2014 Bonus su seconda statistica
        // ----------------------------------------------------------

        case "bonus_aggiuntivo_def_percent":
            // Tessera del Sindacato: +20% HP (gi\u00e0 applicato sopra) + +20% DEF
            if (cfg.bonusStatistica && cfg.bonusValore) {
                _applicaBonusStatistica(target, cfg.bonusStatistica, cfg.bonusValore, cfg.bonusValoreType);
                msg += `DEF aumentata del ${Math.round(cfg.bonusValore * 100)}%! `;
            }
            break;

        case "bonus_aggiuntivo_vel_percent":
            // Contratto Indeterminato: +25% ATK (gi\u00e0 applicato sopra) + +25% VEL
            if (cfg.bonusStatistica && cfg.bonusValore) {
                _applicaBonusStatistica(target, cfg.bonusStatistica, cfg.bonusValore, cfg.bonusValoreType);
                msg += `VEL aumentata del ${Math.round(cfg.bonusValore * 100)}%! `;
            }
            break;

        // ----------------------------------------------------------
        // EQUIPAGGIABILI MALEDETTI \u2014 Malus su statistica secondaria
        // ----------------------------------------------------------

        case "malus_vel_flat":
            // Cornetto della Reception: +20 HP (gi\u00e0 applicato) -15 VEL fisso
            target.vel = Math.max(0, target.vel + (cfg.malusValore || -15));
            msg += `\u26a0\ufe0f VEL ridotta di ${Math.abs(cfg.malusValore || 15)}! `;
            break;

        case "malus_vel_percent":
            // Sedia Ergonomica: +30% DEF (gi\u00e0 applicato) -20% VEL
            if (cfg.malusValore) {
                const ridVel = Math.round(target.vel * Math.abs(cfg.malusValore));
                target.vel  = Math.max(0, target.vel - ridVel);
                msg += `\u26a0\ufe0f VEL ridotta del ${Math.round(Math.abs(cfg.malusValore) * 100)}%! `;
            }
            break;

        case "malus_def_percent":
            // Bonus Straordinario: +30% ATK (gi\u00e0 applicato) -20% DEF
            if (cfg.malusValore) {
                const ridDef = Math.round(target.def * Math.abs(cfg.malusValore));
                target.def  = Math.max(0, target.def - ridDef);
                msg += `\u26a0\ufe0f DEF ridotta del ${Math.round(Math.abs(cfg.malusValore) * 100)}%! `;
            }
            break;
    }

    return msg || "Effetto applicato.";
}

// ==========================================================
// STATO BOTTONE ITEM IN BATTAGLIA
// ==========================================================

/**
 * Aggiorna lo stato del pulsante ITEM in base alle condizioni correnti.
 * Deve essere chiamato ogni volta che cambia qualcosa di rilevante:
 * - Cambio turno
 * - Uso di un item
 * - Fine incontro
 */
function aggiornaStatoBtnItem() {
    const btn = document.getElementById("btn-item");
    if (!btn) return;

    const turnoGiocatore = !document.getElementById("btn-attacco")?.disabled;
    const haItemUsabili  = zaino.some(entry => {
        const cfg = getOggettoDb(entry.dbId);
        return cfg && cfg.usabileInBattaglia;
    });

    // Disabilitato se: non \u00e8 il turno del giocatore, gi\u00e0 usato item questo turno, zaino vuoto
    btn.disabled = !turnoGiocatore || itemUsatiQuestoTurno || !haItemUsabili;

    // Stile visivo per evidenziare lo stato
    btn.style.opacity = btn.disabled ? "0.5" : "1";
}

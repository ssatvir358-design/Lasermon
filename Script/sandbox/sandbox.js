// ==========================================================================
// sandbox.js — Debugger / Simulatore di Battaglie
// NOTA: carica DOPO stato.js, pokemon_factory.js e battaglia.js
// ==========================================================================
//
// ARCHITETTURA:
//  - Le formule delle stat nel sandbox sono LOCALI a questo file (_calcolaStatSB,
//    _calcolaHPSB). NON si appoggiano a calcolaStat/calcolaHP del game engine:
//    questo evita che la modifica di una formula rompa l'altra.
//  - Le funzioni del game engine (battaglia.js) vengono riutilizzate senza
//    modifiche perché gestiscono il combattimento vero e proprio (turni, effetti,
//    danni). L'unico hook sono `gestisciKOGiocatore` e `gestisciVittoriaIncontro`
//    che in modalità sandbox chiamano `terminaSandbox()` al posto del normale
//    flusso mappa.
// ==========================================================================


// ----------------------------------------------------------
// FORMULE STAT LOCALI AL SANDBOX
// Queste usano un "coefficiente" divisore custom (coeffStat)
// che permette ai tester di tweakare lo scaling manualmente.
// Se coeffStat == 0, usa il divisore di default del game engine.
// ----------------------------------------------------------

/**
 * @param {number} statBase
 * @param {number} livello
 * @param {number} molElem
 * @param {number} molRar
 * @param {number} coeffStat - Divisore custom (0 = usa default 0.75)
 */
function _calcolaStatSB(statBase, livello, molElem, molRar, coeffStat) {
    const divisore = (coeffStat && coeffStat > 0) ? coeffStat : 0.75;
    return Math.round(statBase + (livello * molElem * molRar) / divisore);
}

/**
 * @param {number} hpBase
 * @param {number} livello
 * @param {number} molElem
 * @param {number} molRar
 * @param {number} coeffStat - Divisore custom (0 = usa default 0.25)
 */
function _calcolaHPSB(hpBase, livello, molElem, molRar, coeffStat) {
    const divisore = (coeffStat && coeffStat > 0) ? coeffStat : 0.25;
    return Math.round(hpBase + (livello * molElem * molRar) / divisore) + livello;
}


// ----------------------------------------------------------
// TOGGLE MANUALE RARITÀ
// tipo: 'gio' | 'nem'
// ----------------------------------------------------------
function toggleManualRarita(tipo) {
    const isChecked = document.getElementById(`chk-m-rarita-${tipo}`).checked;
    const inputRarita = document.getElementById(`sb-${tipo}-molt-rarita`);
    inputRarita.readOnly = !isChecked;

    if (!isChecked) {
        inputRarita.value = document.getElementById(`sb-${tipo}-nome`).dataset.raritaBase;
    }
    calcolaStatsSandbox(tipo);
}

// ----------------------------------------------------------
// TOGGLE MANUALE SCHIVATA
// ----------------------------------------------------------
function toggleManualSchivata(tipo) {
    const isChecked = document.getElementById(`chk-m-schivata-${tipo}`).checked;
    const inputSchivata = document.getElementById(`sb-${tipo}-molt-schivata`);
    inputSchivata.readOnly = !isChecked;

    if (!isChecked) {
        const nomeEl = document.getElementById(`sb-${tipo}-nome`);
        inputSchivata.value = nomeEl.dataset.schivataBase || 30;
    }
    calcolaStatsSandbox(tipo);
}

// ----------------------------------------------------------
// TOGGLE MANUALE MOLTIPLICATORE ELEMENTO
// NOTA: l'ID include `tipo` per separare gio e nem.
// HTML atteso: chk-m-elem-{tipo}-{stat}
// ----------------------------------------------------------
function toggleManualElem(stat, tipo) {
    const isChecked = document.getElementById(`chk-m-elem-${tipo}-${stat}`).checked;
    const inputElem = document.getElementById(`sb-${tipo}-elem-${stat}`);

    inputElem.readOnly = !isChecked;

    if (!isChecked) {
        const baseData = JSON.parse(document.getElementById(`sb-${tipo}-nome`).dataset.statsBase);
        const mapStats = {
            'hp': 'hp',
            'atk': 'atk',
            'atk-spec': 'atkSpec',
            'def': 'def',
            'def-spec': 'defSpec',
            'vel': 'vel'
        };
        const configStat = mapStats[stat];
        inputElem.value = baseData.statElemBase[configStat] || 1.0;
    }
    calcolaStatsSandbox(tipo);
}


// ----------------------------------------------------------
// AGGIORNA DATI SANDBOX quando si seleziona un Pokémon
// ----------------------------------------------------------
function aggiornaDatiSandbox(tipo) {
    const nomeSelezionato = document.getElementById(`sb-${tipo}-nome`).value;
    const pokemonData = pokemonDatabase.find(p => p.nome === nomeSelezionato);
    if (!pokemonData) return;

    const moltRaritaBase = CONFIG_MOLTIPLICATORE_RARITA[pokemonData.raritaTipo] || 1.0;
    const statElemBase = CONFIG_STAT_ELEMENTO[pokemonData.elemento] ||
        { hp: 1, atk: 1, def: 1, atkSpec: 1, defSpec: 1, vel: 1 };

    const elementoPkm = (pokemonData.elemento || "fuoco").toLowerCase();
    const moltSchivataBase = CONFIG_SCHIVATA_ELEMENTO[elementoPkm] || 30;

    const nomeEl = document.getElementById(`sb-${tipo}-nome`);
    nomeEl.dataset.raritaBase   = moltRaritaBase;
    nomeEl.dataset.schivataBase = moltSchivataBase;
    nomeEl.dataset.statsBase = JSON.stringify({ ...pokemonData, statElemBase });

    document.getElementById(`sb-${tipo}-elemento`).innerText = pokemonData.elemento || "-";
    document.getElementById(`sb-${tipo}-rarita`).innerText   = pokemonData.raritaTipo || "-";

    // Aggiorna select mossa
    const selectMossa = document.getElementById(`sb-${tipo}-lvl-mossa`);
    if (selectMossa) {
        const mossa1 = pokemonData.lvl1 || pokemonData.mossaLvl1 || 'Attacco 1';
        const mossa2 = pokemonData.lvl2 || pokemonData.mossaLvl2 || 'Attacco 2';
        const mossa3 = pokemonData.lvl3 || pokemonData.mossaLvl3 || pokemonData.mossaULT || 'Attacco 3';
        selectMossa.options[0].text = `LVL 1 - ${mossa1}`;
        selectMossa.options[1].text = `LVL 2 - ${mossa2}`;
        selectMossa.options[2].text = `LVL 3 - ${mossa3}`;
    }

    // Ripristina rarità se non sbloccata manualmente
    const chkRarita = document.getElementById(`chk-m-rarita-${tipo}`);
    if (!chkRarita || !chkRarita.checked) {
        document.getElementById(`sb-${tipo}-molt-rarita`).value = moltRaritaBase;
    }

    // Ripristina schivata se non sbloccata manualmente
    const chkSchivata = document.getElementById(`chk-m-schivata-${tipo}`);
    if (!chkSchivata || !chkSchivata.checked) {
        const inputSchivata = document.getElementById(`sb-${tipo}-molt-schivata`);
        if (inputSchivata) inputSchivata.value = moltSchivataBase;
    }

    // Ripristina moltiplicatori elemento
    const mapStats = {
        'hp': 'hp', 'atk': 'atk', 'atk-spec': 'atkSpec',
        'def': 'def', 'def-spec': 'defSpec', 'vel': 'vel'
    };
    for (const [idStat, configStat] of Object.entries(mapStats)) {
        const chkElem = document.getElementById(`chk-m-elem-${tipo}-${idStat}`);
        if (!chkElem || !chkElem.checked) {
            const inputEl = document.getElementById(`sb-${tipo}-elem-${idStat}`);
            if (inputEl) inputEl.value = statElemBase[configStat] || 1.0;
        }
    }

    calcolaStatsSandbox(tipo);
}


// ----------------------------------------------------------
// CALCOLA STATISTICHE SANDBOX — usa formule locali _calcolaStatSB
// ----------------------------------------------------------
function calcolaStatsSandbox(tipo) {
    const nomeEl = document.getElementById(`sb-${tipo}-nome`);
    if (!nomeEl || !nomeEl.dataset.statsBase) return;

    const baseData   = JSON.parse(nomeEl.dataset.statsBase);
    const lvl        = parseInt(document.getElementById(`sb-${tipo}-lvl`).value) || 1;
    const moltRarita = parseFloat(document.getElementById(`sb-${tipo}-molt-rarita`).value) || 1.0;

    let bFlat = { hp: 0, atk: 0, def: 0, atkSpec: 0, defSpec: 0, vel: 0 };
    let bPct  = { hp: 0, atk: 0, def: 0, atkSpec: 0, defSpec: 0, vel: 0 };

    // Bonus da oggetto equipaggiato
    const selectOggetto = document.getElementById(`sb-${tipo}-item`);
    const inputValore   = document.getElementById(`sb-${tipo}-val-item`);
    if (selectOggetto && selectOggetto.value) {
        const itemData = DB_OGGETTI.find(o => o.id === selectOggetto.value);
        if (itemData) {
            const valoreDaUsare = (inputValore && inputValore.value !== "")
                ? parseFloat(inputValore.value)
                : itemData.valore;
            const targetStat = itemData.stat;
            if (itemData.valoreType === "flat") {
                bFlat[targetStat] = (bFlat[targetStat] || 0) + valoreDaUsare;
            } else if (itemData.valoreType === "percent") {
                const valPercent = (inputValore && inputValore.value !== "")
                    ? valoreDaUsare / 100
                    : valoreDaUsare;
                bPct[targetStat] = (bPct[targetStat] || 0) + valPercent;
            }
        }
    }

    // Usa formule locali sandbox: non dipende da calcolaStat/calcolaHP del game engine
    const config = [
        { key: 'hp',      base: baseData.hpBase,                                 id: 'hp',      fn: _calcolaHPSB },
        { key: 'atk',     base: baseData.atkBase,                                id: 'atk',     fn: _calcolaStatSB },
        { key: 'atkSpec', base: baseData.atkSpec || baseData.atkBase,            id: 'atk-spec',fn: _calcolaStatSB },
        { key: 'def',     base: baseData.defBase,                                id: 'def',     fn: _calcolaStatSB },
        { key: 'defSpec', base: baseData.defSpec || baseData.defBase,            id: 'def-spec',fn: _calcolaStatSB },
        { key: 'vel',     base: baseData.velBase,                                id: 'vel',     fn: _calcolaStatSB }
    ];

    let finalVel = 1;

    config.forEach(s => {
        const idInputElem = `sb-${tipo}-elem-${s.id}`;
        const moltElem    = parseFloat(document.getElementById(idInputElem)?.value) || 1.0;

        const idInputCoeff = `sb-${tipo}-m-${s.id}`;
        const inputCoeff   = document.getElementById(idInputCoeff);
        const coeffStat    = inputCoeff ? parseFloat(inputCoeff.value) || 0 : 0;

        const statBaseCalcolata = s.fn(s.base, lvl, moltElem, moltRarita, coeffStat);

        const bonusFlat = bFlat[s.key] || 0;
        const bonusPct  = bPct[s.key]  || 0;
        const finalStat = Math.round((statBaseCalcolata * (1 + bonusPct)) + bonusFlat);

        if (s.key === 'vel') finalVel = finalStat;

        const resInput = document.getElementById(`sb-${tipo}-${s.id}`);
        if (resInput) {
            resInput.value = finalStat;

            // Tooltip con la formula usata
            const container = resInput.parentElement;
            const divNomeFn = s.key === 'hp' ? 'HP' : 'Stat';
            const divDefault = s.key === 'hp' ? '0.25' : '0.75';
            const divUsato   = (coeffStat > 0) ? coeffStat : divDefault;
            const tooltipFormula = `Base ${divNomeFn}: ${s.base}
Livello: ${lvl}
Molt. Rarit\u00e0: ${moltRarita}
Molt. Elemento: ${moltElem}
Divisore: ${divUsato}${coeffStat > 0 ? ' (custom)' : ' (default)'}
Bonus Item%: ${(bonusPct * 100).toFixed(0)}%
Bonus Item Flat: ${bonusFlat}

--- FORMULA ---
(${s.base} + (${lvl} * ${moltElem} * ${moltRarita}) / ${divUsato}) * (1 + ${bonusPct}) + ${bonusFlat} = ${finalStat}`;
            container.dataset.formula = tooltipFormula;
            resInput.style.cursor     = "help";
        }
    });

    // Calcola % schivata
    const moltSchivata = parseFloat(document.getElementById(`sb-${tipo}-molt-schivata`)?.value) || 30;
    const percSchivata = Math.floor((finalVel * moltSchivata) / (finalVel + 60));
    const resSchivata  = document.getElementById(`sb-${tipo}-res-schivata`);
    if (resSchivata) resSchivata.innerText = isNaN(percSchivata) ? 0 : percSchivata;
}


// ----------------------------------------------------------
// TOGGLE VALORE ITEM (mostra/nasconde input valore custom)
// ----------------------------------------------------------
function toggleValore(element, targetId) {
    const valoreInput = document.getElementById(targetId);
    valoreInput.style.display = element.value !== "" ? "block" : "none";
}

// ----------------------------------------------------------
// AGGIORNA TOOLTIP PERK/OGGETTO nella sandbox
// ----------------------------------------------------------
function aggiornaTooltip(selectElement, tipo) {
    const prefix      = selectElement.id.split('-')[1];
    const selectedId  = selectElement.value;
    const infoIcon    = selectElement.previousElementSibling;
    if (!infoIcon) return;

    const valInput       = document.getElementById(`sb-${prefix}-val-${tipo}`);
    const valoreInserito = valInput ? valInput.value : "";

    const db      = (tipo === 'perk') ? PERK_DB : DB_OGGETTI;
    const elemento = (tipo === 'perk')
        ? (typeof getPerkDaId === 'function' ? getPerkDaId(selectedId) : null)
        : db.find(i => i.id === selectedId);

    let descrizioneOriginale = elemento ? elemento.descrizione : "Seleziona un elemento.";

    if (elemento && valoreInserito !== "") {
        let nuovaDesc = descrizioneOriginale;
        if (tipo === 'perk') {
            if (elemento.id.includes("spine")) {
                nuovaDesc = nuovaDesc.replace(/\d+(?=\s*\+)/, valoreInserito);
            } else if (nuovaDesc.includes("%")) {
                nuovaDesc = nuovaDesc.replace(/\d+(?=%)/g, valoreInserito);
            } else {
                nuovaDesc = nuovaDesc.replace(/\b\d+\b/, valoreInserito);
            }
        } else {
            if (nuovaDesc.includes("%")) {
                nuovaDesc = nuovaDesc.replace(/\d+(?=%)/g, valoreInserito);
            } else {
                nuovaDesc = nuovaDesc.replace(/(\+\s*)?\d+/, (match) =>
                    match.includes('+') ? `+${valoreInserito}` : valoreInserito);
            }
        }
        infoIcon.setAttribute("title", nuovaDesc);
    } else {
        infoIcon.setAttribute("title", descrizioneOriginale);
    }
}


// ----------------------------------------------------------
// CREA OGGETTO POKÉMON DAI CAMPI HTML DELLA SANDBOX
// ----------------------------------------------------------
function creaPokemonDaSandbox(prefisso) {
    const selectNome  = document.getElementById(`sb-${prefisso}-nome`);
    const nomePokemon = selectNome.options[selectNome.selectedIndex]
        ? selectNome.options[selectNome.selectedIndex].text
        : "MissingNo";
    const elemento = document.getElementById(`sb-${prefisso}-elemento`).innerText || "NORMALE";

    // Copia i campi del DB originale (mosse, lore, ecc.) come base
    const baseData = pokemonDatabase.find(p => p.nome === nomePokemon) || {};

    const hp = parseInt(document.getElementById(`sb-${prefisso}-hp`).value) || 10;

    return {
        ...baseData,
        nome:          nomePokemon,
        elemento:      elemento,
        livello:       parseInt(document.getElementById(`sb-${prefisso}-lvl`).value) || 1,
        hpMax:         hp,
        hpAttuali:     hp,
        atk:           parseInt(document.getElementById(`sb-${prefisso}-atk`).value)      || 10,
        atkSpec:       parseInt(document.getElementById(`sb-${prefisso}-atk-spec`).value)  || 10,
        def:           parseInt(document.getElementById(`sb-${prefisso}-def`).value)      || 10,
        defSpec:       parseInt(document.getElementById(`sb-${prefisso}-def-spec`).value)  || 10,
        vel:           parseInt(document.getElementById(`sb-${prefisso}-vel`).value)      || 10,
        livelloMossa:  parseInt(document.getElementById(`sb-${prefisso}-lvl-mossa`).value) || 1,
        schivataSandbox: parseFloat(document.getElementById(`sb-${prefisso}-res-schivata`).innerText) || 0,
        scudoPassivo:  0,
        immagine:      baseData.immagine      || `../Sprite/personaggi/${nomePokemon.replace(/ /g,'')}/${nomePokemon}Lobby.jpeg`,
        immagineAtk:   baseData.immagineAtk   || `../Sprite/personaggi/${nomePokemon.replace(/ /g,'')}/${nomePokemon}Atk.jpeg`
    };
}


// ----------------------------------------------------------
// AVVIA LA SIMULAZIONE SANDBOX
// ----------------------------------------------------------
function avviaSandbox() {
    isSandboxAttiva = true;

    // Costruisce i pokemon dai campi della sandbox
    mioPokemon    = creaPokemonDaSandbox("gio");
    nemicoPokemon = creaPokemonDaSandbox("nem");

    // Minimo stato necessario per battaglia.js
    miaSquadra    = [mioPokemon];
    nemiciIncontro = [];          // Nessun nemico in coda: uno scontro 1v1

    resettaEffettiAttivi();
    resettaItemFight();
    resettaPerkFight();

    // Transizione UI: nascondi sandbox, mostra schermata battaglia
    document.getElementById("schermata-sandbox").style.display = "none";
    document.getElementById("schermata-gioco").style.display   = "block";

    // In sandbox: fuga non ha senso, nascondi il bottone
    const btnFuga = document.getElementById("btn-fuga");
    if (btnFuga) btnFuga.style.display = "none";

    aggiornaGrafica();

    document.getElementById("console-log").innerHTML =
        "<div style='color:#3498db; text-align:center;'><b>--- SIMULAZIONE SANDBOX AVVIATA ---</b></div><br>";

    if (nemicoPokemon.vel > mioPokemon.vel) {
        chiAttaccaPerPrimo = "nemico";
        document.getElementById("console-log").innerHTML +=
            `${nemicoPokemon.nome} \u00e8 pi\u00f9 veloce! Attacca per primo.`;
        document.getElementById("btn-attacco").disabled = true;
        document.getElementById("btn-pokemon").disabled = true;
        aggiornaStatoBtnItem();
        setTimeout(turnoNemico, 1000);
    } else {
        chiAttaccaPerPrimo = "giocatore";
        document.getElementById("console-log").innerHTML +=
            `Sei pi\u00f9 veloce! Tocca a te.`;
        abilitaControlliGiocatore();
    }
}


// ----------------------------------------------------------
// TERMINA LA SIMULAZIONE SANDBOX (KO di uno dei due)
// Chiamata da gestisciKOGiocatoreSandbox / gestisciVittoriaSandbox
// ----------------------------------------------------------
function terminaSandbox(risultato) {
    const colore = risultato === "Vittoria" ? "#4cd137" : "#e84118";
    document.getElementById("console-log").innerHTML +=
        `<br><br><div style='color:${colore}; text-align:center; font-size:18px;'><b>--- SIMULAZIONE TERMINATA: ${risultato.toUpperCase()} ---</b></div>`;

    // Nascondi tutti i bottoni di battaglia
    ["btn-attacco", "btn-item", "btn-pokemon", "btn-fuga"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Crea dinamicamente un bottone per uscire inserendolo nei controlli di arena
    const controlliArea = document.getElementById("controlli-arena");
    const btnEsci = document.createElement("button");
    btnEsci.id = "btn-esci-sandbox";
    btnEsci.className = "btn-action";
    btnEsci.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; font-size: 22px; font-weight: bold; background: #3498db; color: white; border: 3px solid white; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;";
    btnEsci.innerText = "🚪 ESCI DALLA SIMULAZIONE";
    btnEsci.onclick = function() {
        isSandboxAttiva = false;
        btnEsci.remove(); // Rimuove il pulsante
        document.getElementById("schermata-gioco").style.display   = "none";
        document.getElementById("schermata-sandbox").style.display = "flex";

        // Ripristina i bottoni di battaglia per la prossima partita normale
        ["btn-attacco", "btn-item", "btn-pokemon", "btn-fuga"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = "inline-block";
                el.disabled      = false;
            }
        });
    };
    if (controlliArea) {
        controlliArea.appendChild(btnEsci);
    }
}


// ----------------------------------------------------------
// INIZIALIZZA I MENU DROPDOWN DELLA SANDBOX
// (popola la lista Pokémon e oggetti)
// ----------------------------------------------------------
function inizializzaSandbox() {
    if (typeof pokemonDatabase === 'undefined' || typeof DB_OGGETTI === 'undefined') {
        setTimeout(inizializzaSandbox, 200);
        return;
    }

    const selectGio = document.getElementById("sb-gio-nome");
    const selectNem = document.getElementById("sb-nem-nome");
    if (!selectGio || !selectNem) return; // HTML sandbox non ancora nel DOM

    selectGio.innerHTML = "";
    selectNem.innerHTML = "";

    pokemonDatabase.forEach(p => {
        const opt = `<option value="${p.nome}">${p.nome}</option>`;
        selectGio.innerHTML += opt;
        selectNem.innerHTML += opt;
    });

    // Dropdown oggetti equipaggiabili
    const opzioniIniziali = '<option value="">Nessun Oggetto</option>';
    const selectItemGio = document.getElementById("sb-gio-item");
    const selectItemNem = document.getElementById("sb-nem-item");
    if (selectItemGio) selectItemGio.innerHTML = opzioniIniziali;
    if (selectItemNem) selectItemNem.innerHTML = opzioniIniziali;

    DB_OGGETTI.filter(i => i.categoria === "equipaggiabile").forEach(i => {
        const opt = `<option value="${i.id}">${i.nome}</option>`;
        if (selectItemGio) selectItemGio.innerHTML += opt;
        if (selectItemNem) selectItemNem.innerHTML += opt;
    });

    aggiornaDatiSandbox('gio');
    aggiornaDatiSandbox('nem');
}


// ----------------------------------------------------------
// DOMContentLoaded: apre sandbox se l'URL ha ?sandbox
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('sandbox')) {
        isSandboxAttiva = true;
        document.querySelectorAll('.schermata').forEach(s => s.style.display = 'none');
        const sb = document.getElementById('schermata-sandbox');
        if (sb) sb.style.display = 'flex';
    }
    inizializzaSandbox();
});
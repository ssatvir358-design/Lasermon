// ==========================================================
// perk_ui.js — Gestione UI e logica della selezione Perk
// Dipendenze: perks.js, stato.js, pokemon_factory.js, schermate.js
// ==========================================================

// ----------------------------------------------------------
// STATO INTERNO DELLA CODA PERK
// ----------------------------------------------------------

// Stato interno coda
let _codaPerk = [];
let _callbackDopoTuttiIPerk = null;
let _indiceCodaPerk = 0;
let _totaleCodaPerk  = 0;  // Totale fisso all'inizio della coda, per il contatore "X di N"


// ----------------------------------------------------------
// VERIFICA POST-BATTAGLIA — chiamata da gestisciVittoriaIncontro
// ----------------------------------------------------------

/**
 * Controlla se qualche Pokémon della squadra ha superato un level cap
 * durante questa battaglia. Se sì, costruisce la coda e avvia la UI.
 *
 * @param {object[]} livPreBattle - Array con i livelli PRIMA del level-up,
 *                                  formato: [{ pokemon, livelloPre }]
 * @param {Function} callbackFine - Funzione da chiamare quando tutti i Perk
 *                                  sono stati assegnati (ritorno alla mappa).
 */
function verificaEAvviaPerk(livPreBattle, callbackFine) {
    _codaPerk = [];
    _callbackDopoTuttiIPerk = callbackFine;
    _indiceCodaPerk = 0;
    _totaleCodaPerk  = 0;

    const caps = [CONFIG_PERK_LEVEL_CAP.tier1, CONFIG_PERK_LEVEL_CAP.tier2];

    livPreBattle.forEach(({ pokemon, livelloPre }) => {
        if (!pokemon || pokemon.hpAttuali <= 0) return;

        caps.forEach(cap => {
            const haAttraversato = livelloPre < cap && pokemon.livello >= cap;
            if (!haAttraversato) return;

            const tier = cap === CONFIG_PERK_LEVEL_CAP.tier1 ? 1 : 2;
            if (tier === 2 && !pokemon.perkId) return;

            const giàInCoda = _codaPerk.some(e => e.pokemon === pokemon && e.tier === tier);
            if (!giàInCoda) _codaPerk.push({ pokemon, tier });
        });
    });

    _totaleCodaPerk = _codaPerk.length;  // Salva il totale prima di consumare la coda

    if (_codaPerk.length === 0) {
        callbackFine();
        return;
    }

    _avanzaCodaPerk();
}

/**
 * Variante standalone per eventi fuori dalla battaglia (es. scambio).
 * Controlla se il Pokémon appena ottenuto supera un level cap e avvia i perk.
 * @param {object} nuovoPokemon  - Il Pokémon appena ottenuto
 * @param {Function} callbackFine - Chiamata dopo la selezione (o subito se nessun perk)
 */
function verificaPerkDopoEvento(nuovoPokemon, callbackFine) {
    // Costruiamo una livPreBattle fittizia: il Pokémon era a livello 0 "prima"
    // così attraversa sicuramente qualsiasi cap ≤ del livello attuale
    const livPreFittizio = [{ pokemon: nuovoPokemon, livelloPre: 0 }];
    verificaEAvviaPerk(livPreFittizio, callbackFine);
}


// ----------------------------------------------------------
// APERTURA SCHERMATA PERK (prende il prossimo dalla coda)
// ----------------------------------------------------------

function _avanzaCodaPerk() {
    if (_codaPerk.length === 0) {
        // Coda esaurita: torna al flusso normale (es. mappa)
        cambiaSchermata("schermata-perk", "schermata-mappa");
        if (_callbackDopoTuttiIPerk) _callbackDopoTuttiIPerk();
        return;
    }

    // Prende il prossimo dalla coda senza rimuoverlo ancora
    const { pokemon, tier } = _codaPerk[0];
    _indiceCodaPerk++;

    _mostraSchermaPerk(pokemon, tier);
}


/**
 * Popola e mostra la schermata di selezione Perk per un Pokémon.
 * @param {object} pokemon - Istanza Pokémon giocatore
 * @param {number} tier    - 1 = Lv.45, 2 = Lv.100
 */
function _mostraSchermaPerk(pokemon, tier) {
    // --- Determina categoria e opzioni ---
    const categoria = calcolaStatDominante(pokemon);
    const catDB = PERK_DB[categoria];

    let opzioni;
    if (tier === 1) {
        opzioni = catDB.tier1.opzioni;
    } else {
        // Tier 2: mostra solo l'evoluzione del Perk già scelto
        const perkTier1Id = _getPerkBaseTier1(pokemon.perkId);
        opzioni = perkTier1Id ? [catDB.tier2[perkTier1Id]] : catDB.tier1.opzioni;
    }

    // --- Aggiorna header ---
    document.getElementById("perk-header-sub").textContent =
        tier === 1
            ? `Livello ${CONFIG_PERK_LEVEL_CAP.tier1} raggiunto! Scegli la tua abilità passiva`
            : `Livello ${CONFIG_PERK_LEVEL_CAP.tier2} raggiunto! Evolvi la tua abilità`;

    // --- Aggiorna info Pokémon ---
    document.getElementById("perk-pokemon-img").src   = pokemon.immagine;
    document.getElementById("perk-pokemon-nome").textContent = pokemon.nome;
    document.getElementById("perk-pokemon-lvl").textContent  = `Lv. ${pokemon.livello}`;

    const badge = document.getElementById("perk-stat-badge");
    badge.textContent  = `${catDB.emoji} Stat. dominante: ${catDB.nome}`;
    badge.className    = `perk-stat-badge perk-stat-${categoria}`;

    // --- Coda info ---
    // Il giocatore ha chiesto esplicitamente di rimuovere la scritta "Pokémon 1 di 2"
    const infoEl = document.getElementById("perk-coda-info");
    if (infoEl) {
        infoEl.textContent = "";
    }

    // --- Genera le card opzioni ---
    const contenitore = document.getElementById("perk-opzioni");
    contenitore.innerHTML = "";

    opzioni.forEach(op => {
        if (!op) return;
        const btnText = tier === 2 ? "✨ EVOLVI" : "✅ SCEGLI";
        const card = document.createElement("div");
        card.className = "perk-card";
        // Se è tier 2 e c'è solo un'opzione, aggiungi una classe per centrarla o evidenziarla se serve
        if (tier === 2) card.classList.add("perk-card-singola");
        card.innerHTML = `
            <div class="perk-card-emoji">${op.emoji}</div>
            <div class="perk-card-nome">${op.nome}</div>
            <div class="perk-card-desc">${op.descrizione}</div>
            <button class="perk-card-scegli" onclick="selezionaPerk('${op.id}')">${btnText}</button>
        `;
        // Clic su tutta la card = stessa azione del pulsante
        card.onclick = () => selezionaPerk(op.id);
        contenitore.appendChild(card);
    });

    // --- Apri la schermata ---
    // Determina la schermata corrente (solitamente schermata-gioco post-battaglia o schermata-scambio)
    const schermataDa = document.querySelector(".schermata.attiva")?.id || "schermata-gioco";
    cambiaSchermata(schermataDa, "schermata-perk");
}


// ----------------------------------------------------------
// SELEZIONE DEL PERK
// ----------------------------------------------------------

/**
 * Assegna il perk selezionato al Pokémon corrente e avanza la coda.
 * @param {string} perkId - ID del perk scelto (da PERK_DB)
 */
function selezionaPerk(perkId) {
    if (_codaPerk.length === 0) return;

    const { pokemon, tier } = _codaPerk.shift(); // rimuove dalla coda

    // Assegna perk all'istanza Pokémon
    pokemon.perkId   = perkId;
    pokemon.perkTier = tier;

    // Feedback visivo momentaneo sulla card selezionata
    document.querySelectorAll(".perk-card").forEach(c => {
        const btnScegli = c.querySelector(".perk-card-scegli");
        if (btnScegli && btnScegli.getAttribute("onclick")?.includes(perkId)) {
            c.classList.add("selezionato");
        }
    });

    const perkInfo = getPerkDaId(perkId);
    console.log(`[PERK] ${pokemon.nome} → ${perkInfo?.nome || perkId} (Tier ${tier})`);

    // Breve pausa di conferma poi avanza
    setTimeout(() => {
        _avanzaCodaPerk();
    }, 600);
}


// ----------------------------------------------------------
// HELPER: recupera l'ID base (tier 1) da un ID tier 2
// ----------------------------------------------------------

/**
 * Data l'ID di un Perk Tier 2, restituisce la chiave (ID Tier 1) del genitore.
 * Es. "salvavita_2" → "salvavita"
 * @param {string|null} perkTier2Id
 * @returns {string|null}
 */
function _getPerkBaseTier1(perkTier2Id) {
    if (!perkTier2Id) return null;
    for (const cat of Object.values(PERK_DB)) {
        for (const [baseTier1Id, evoData] of Object.entries(cat.tier2)) {
            if (evoData.id === perkTier2Id || baseTier1Id === perkTier2Id) {
                return baseTier1Id;
            }
        }
    }
    // Se è già un Tier 1, restituisce se stesso (es. pokemon che va direttamente al Tier 2 selezionando)
    return perkTier2Id;
}

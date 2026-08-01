// ==========================================================
// salvataggio.js — Sistema di salvataggio run su localStorage
// Dipendenze: stato.js, pokemon_factory.js
// Caricare DOPO stato.js e pokemon_factory.js, PRIMA di schermate.js
// ==========================================================

const SAVE_KEY_PREFIX = 'laserpoke_save_';
const NUM_SLOT = 3;

// Slot attualmente selezionato (impostato quando si carica una partita)
let slotAttivoCorrente = null;

// ==========================================================
// SALVA PARTITA
// ==========================================================
function salvaPartita(slot) {
    const now = new Date();
    const timestamp = now.toLocaleDateString('it-IT') + ' ' + now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    // Serializza la squadra salvando solo le proprietà dati (no funzioni)
    const squadraSalvata = miaSquadra.filter(p => p).map(p => ({
        nome:        p.nome,
        livello:     p.livello,
        hpAttuali:   p.hpAttuali,
        hpMax:       p.hpMax,
        atk:         p.atk,
        def:         p.def,
        vel:         p.vel,
        atkSpec:     p.atkSpec,
        defSpec:     p.defSpec,
        livelloMossa: p.livelloMossa,
        elemento:    p.elemento,
        raritaTipo:  p.raritaTipo,
        immagine:    p.immagine,
        immagineAtk: p.immagineAtk,
        immagineVS:  p.immagineVS,
        colore:      p.colore,
        boss:        p.boss,
        isEvoluzione: p.isEvoluzione,
        mossaLvl1:   p.mossaLvl1,
        mossaLvl2:   p.mossaLvl2,
        mossaLvl3:   p.mossaLvl3,
        mossaULT:    p.mossaULT,
        numFrameUlt: p.numFrameUlt,
        lore:        p.lore,
        itemEquipaggiati: p.itemEquipaggiati || [],
        perkEquipaggiati: p.perkEquipaggiati || [],
        perkSlot:    p.perkSlot || [],
        salvavitaUsati: p.salvavitaUsati || 0,
    }));

    const saveData = {
        // Meta
        timestamp,
        slotNum: slot,
        isRunVeloce,

        // Squadra
        squadra: squadraSalvata,

        // Economia
        monete,
        zaino: JSON.parse(JSON.stringify(zaino)),

        // Stato mappa
        mappaAttuale,
        pianoAttuale,
        nodoSceltoAttuale,
        alberoMappa:        JSON.parse(JSON.stringify(alberoMappa)),
        mappaEventi:        JSON.parse(JSON.stringify(mappaEventi)),
        variazioneSeedMappa,
        maxLvlTeamInizioMappa,
        tentativiSenzaLeggendari,
    };

    try {
        localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(saveData));
        slotAttivoCorrente = slot;
        console.log(`[Salvataggio] Slot ${slot} salvato con successo.`);
        return true;
    } catch (e) {
        console.error('[Salvataggio] Errore nel salvataggio:', e);
        return false;
    }
}

// ==========================================================
// CARICA PARTITA
// ==========================================================
function caricaPartita(slot) {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
    if (!raw) { console.warn('[Salvataggio] Slot vuoto:', slot); return false; }

    try {
        const save = JSON.parse(raw);

        // Ripristina stato globale
        isRunVeloce            = save.isRunVeloce || false;
        monete                 = save.monete || 0;
        zaino                  = save.zaino || [];
        mappaAttuale           = save.mappaAttuale || 'mappa1';
        pianoAttuale           = save.pianoAttuale || 0;
        nodoSceltoAttuale      = save.nodoSceltoAttuale || 0;
        alberoMappa            = save.alberoMappa || [];
        mappaEventi            = save.mappaEventi || {};
        variazioneSeedMappa    = save.variazioneSeedMappa || 0;
        maxLvlTeamInizioMappa  = save.maxLvlTeamInizioMappa || 1;
        tentativiSenzaLeggendari = save.tentativiSenzaLeggendari || 0;
        slotAttivoCorrente     = slot;

        // Ripristina la squadra usando creaPokemon e poi riscrivendo i valori salvati
        miaSquadra = save.squadra.map(dati => {
            const infoBase = pokemonDatabase.find(db => db.nome === dati.nome);
            if (!infoBase) {
                // Fallback: usa i dati salvati come struttura base
                return Object.assign({}, dati);
            }
            const p = creaPokemon(infoBase, dati.livello, dati.livelloMossa);
            // Sovrascrivi i valori effettivi salvati (HP, item, perk, ecc.)
            p.hpAttuali          = dati.hpAttuali;
            p.hpMax              = dati.hpMax;
            p.itemEquipaggiati   = dati.itemEquipaggiati || [];
            p.perkEquipaggiati   = dati.perkEquipaggiati || [];
            p.perkSlot           = dati.perkSlot || [];
            p.salvavitaUsati     = dati.salvavitaUsati || 0;
            return p;
        });

        mioPokemon = miaSquadra[0] || null;

        console.log(`[Salvataggio] Slot ${slot} caricato con successo.`);
        return true;
    } catch (e) {
        console.error('[Salvataggio] Errore nel caricamento:', e);
        return false;
    }
}

// ==========================================================
// CANCELLA SALVATAGGIO
// ==========================================================
function cancellaSalvataggio(slot) {
    localStorage.removeItem(SAVE_KEY_PREFIX + slot);
    console.log(`[Salvataggio] Slot ${slot} cancellato.`);
}

// ==========================================================
// INFO SALVATAGGIO (per anteprima UI)
// ==========================================================
function getSalvataggioInfo(slot) {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
    if (!raw) return null;
    try {
        const save = JSON.parse(raw);
        return {
            slot,
            timestamp:   save.timestamp,
            mappa:       save.mappaAttuale,
            piano:       save.pianoAttuale,
            isRunVeloce: save.isRunVeloce,
            squadra:     save.squadra.map(p => ({ nome: p.nome, immagine: p.immagine, hpAttuali: p.hpAttuali, hpMax: p.hpMax })),
        };
    } catch (e) { return null; }
}

// Ritorna true se esiste almeno un salvataggio
function haAlmenoUnSalvataggio() {
    for (let i = 1; i <= NUM_SLOT; i++) {
        if (localStorage.getItem(SAVE_KEY_PREFIX + i)) return true;
    }
    return false;
}

// ==========================================================
// UI — Apri schermata salvataggi
// ==========================================================
function apriSchermataSlot(modalita) {
    // modalita: 'salva' | 'carica'
    const overlay = document.getElementById('schermata-salvataggi');
    if (!overlay) return;

    const titolo = document.getElementById('salvataggi-titolo');
    if (titolo) titolo.textContent = modalita === 'salva' ? '💾 SALVA PARTITA' : '📂 CARICA PARTITA';

    overlay.dataset.modalita = modalita;
    renderSlotCards(modalita);
    overlay.style.display = 'flex';
}

function chiudiSchermataSlot() {
    const overlay = document.getElementById('schermata-salvataggi');
    if (overlay) overlay.style.display = 'none';
}

function renderSlotCards(modalita) {
    const container = document.getElementById('salvataggi-slots-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= NUM_SLOT; i++) {
        const info = getSalvataggioInfo(i);
        const card = document.createElement('div');
        card.className = 'save-slot-card';

        if (info) {
            // Slot occupato
            const mappaNum = info.mappa.replace('mappa', '');
            const squadraHTML = info.squadra.slice(0, 6).map(p =>
                `<img src="${p.immagine}" title="${p.nome}" style="width:38px;height:38px;object-fit:contain;border-radius:4px;background:rgba(0,0,0,0.3);">`
            ).join('');

            card.innerHTML = `
                <div class="save-slot-header">
                    <span class="save-slot-num">SLOT ${i}</span>
                    <span class="save-slot-badge">${info.isRunVeloce ? '⚡ VELOCE' : '🗺 NORMALE'}</span>
                </div>
                <div class="save-slot-mappa">Mappa ${mappaNum} — Piano ${info.piano}</div>
                <div class="save-slot-squadra">${squadraHTML}</div>
                <div class="save-slot-time">🕐 ${info.timestamp}</div>
                <div class="save-slot-actions">
                    ${modalita === 'carica'
                        ? `<button class="save-btn save-btn-primary" onclick="eseguiCarica(${i})">▶ CARICA</button>`
                        : `<button class="save-btn save-btn-primary" onclick="eseguiSalva(${i})">💾 SOVRASCRIVI</button>`
                    }
                    <button class="save-btn save-btn-danger" onclick="eseguiCancella(${i})">🗑</button>
                </div>
            `;
        } else {
            // Slot vuoto
            card.classList.add('save-slot-empty');
            card.innerHTML = `
                <div class="save-slot-header">
                    <span class="save-slot-num">SLOT ${i}</span>
                </div>
                <div class="save-slot-vuoto-icon">➕</div>
                <div class="save-slot-mappa">Slot vuoto</div>
                ${modalita === 'salva'
                    ? `<div class="save-slot-actions"><button class="save-btn save-btn-primary" onclick="eseguiSalva(${i})">💾 SALVA QUI</button></div>`
                    : ''
                }
            `;
        }

        container.appendChild(card);
    }
}

function eseguiSalva(slot) {
    const ok = salvaPartita(slot);
    if (ok) {
        mostraAvviso(`✅ Partita salvata nello Slot ${slot}!`);
        chiudiSchermataSlot();
    } else {
        mostraAvviso('❌ Errore nel salvataggio. Riprova.');
    }
}

function eseguiCarica(slot) {
    const ok = caricaPartita(slot);
    if (ok) {
        chiudiSchermataSlot();
        // Aggiorna UI e vai alla mappa
        if (typeof aggiornaSquadraMappa === 'function') aggiornaSquadraMappa();
        if (typeof aggiornaDisplayMonete === 'function') aggiornaDisplayMonete();
        if (typeof generaMappaAlbero === 'function') generaMappaAlbero();
        if (typeof aggiornaPannelloZainoMappa === 'function') aggiornaPannelloZainoMappa();

        // Aggiorna pulsante Continua nella lobby nel caso ci fossero altri slot
        if (typeof aggiornaBottoneContinua === 'function') aggiornaBottoneContinua();

        cambiaSchermata('schermata-start', 'schermata-mappa');
    } else {
        mostraAvviso('❌ Errore nel caricamento. Il file di salvataggio potrebbe essere corrotto.');
    }
}

function eseguiCancella(slot) {
    cancellaSalvataggio(slot);
    const modalita = document.getElementById('schermata-salvataggi')?.dataset.modalita || 'salva';
    renderSlotCards(modalita);
    // Aggiorna bottone Continua
    if (typeof aggiornaBottoneContinua === 'function') aggiornaBottoneContinua();
}

// ==========================================================
// Aggiorna visibilità del bottone "Continua Run" nella lobby
// ==========================================================
function aggiornaBottoneContinua() {
    const btn = document.getElementById('btn-continua-run');
    if (!btn) return;
    btn.style.display = haAlmenoUnSalvataggio() ? 'inline-block' : 'none';
}

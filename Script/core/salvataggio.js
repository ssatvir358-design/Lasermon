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
    slot = slot ?? slotAttivoCorrente ?? 1;
    if (![1, 2, 3, "auto"].includes(slot) || !miaSquadra.length) return false;
    if (slot !== "auto" && !document.getElementById("schermata-mappa").classList.contains("attiva")) {
        const checkpoint = AppStorage.getItem(SAVE_KEY_PREFIX + "auto");
        if (!checkpoint) return false;
        const data = JSON.parse(checkpoint);
        data.slotNum = slot;
        AppStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(data));
        slotAttivoCorrente = slot;
        return true;
    }
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
        oggetti:     ItemSystem.equipment(p).map(x=>x.id),
        dragonKills: Math.max(0, Number(p.dragonKills)||0),
        sesso: p.sesso,
        elementalUses: p.elementalUses,
        ultimateUses: {...p.ultimateUses},
        salvavitaUsati: p.salvavitaUsati || 0,
        baseHpMax: p.baseHpMax, baseAtk: p.baseAtk, baseDef: p.baseDef,
        baseAtkSpec: p.baseAtkSpec, baseDefSpec: p.baseDefSpec, baseVel: p.baseVel,
    }));

    const saveData = {
        itemCatalogVersion: 2,
        // Meta
        timestamp,
        slotNum: slot,
        isRunVeloce,
        nomeStarterOriginale: typeof nomeStarterOriginale !== "undefined" ? nomeStarterOriginale : null,

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
        AppStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(saveData));
        if (slot !== "auto") slotAttivoCorrente = slot;
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
    const raw = AppStorage.getItem(SAVE_KEY_PREFIX + slot);
    if (!raw) { console.warn('[Salvataggio] Slot vuoto:', slot); return false; }

    try {
        const save = JSON.parse(raw);

        // Ripristina stato globale
        isRunVeloce            = save.isRunVeloce || false;
        monete                 = save.monete || 0;
        zaino                  = ItemSystem.migrateBag(save.zaino);
        mappaAttuale           = save.mappaAttuale || 'mappa1';
        pianoAttuale           = save.pianoAttuale || 0;
        nodoSceltoAttuale      = save.nodoSceltoAttuale || 0;
        alberoMappa            = save.alberoMappa || [];
        mappaEventi            = save.mappaEventi || {};
        variazioneSeedMappa    = save.variazioneSeedMappa || 0;
        maxLvlTeamInizioMappa  = save.maxLvlTeamInizioMappa || 1;
        tentativiSenzaLeggendari = save.tentativiSenzaLeggendari || 0;
        slotAttivoCorrente     = slot === "auto" ? null : slot;
        if (typeof nomeStarterOriginale !== "undefined") nomeStarterOriginale = save.nomeStarterOriginale || save.squadra[0]?.nome || null;
        if (isRunVeloce && typeof applicaOverrideRunVeloce === "function") applicaOverrideRunVeloce();

        // Ripristina la squadra usando creaPokemon e poi riscrivendo i valori salvati
        miaSquadra = save.squadra.map(dati => {
            const infoBase = pokemonDatabase.find(db => db.nome === (dati.nome === "VESPER, LA TABULA RASA DEL CAPITALE" ? "Vesper Witch of Darkness" : dati.nome));
            const p = infoBase ? creaPokemon(infoBase,dati.livello,dati.livelloMossa) : Object.assign({},dati);
            for (const key of ['baseHpMax','baseAtk','baseDef','baseAtkSpec','baseDefSpec','baseVel']) {
                if(Number.isFinite(dati[key]))p[key]=dati[key];
            }
            p.hpMax=dati.hpMax||p.hpMax;p.hpAttuali=dati.hpAttuali;
            p.oggetti=ItemSystem.migrateEquipment(dati.oggetti||dati.itemEquipaggiati);
            p.dragonKills=Math.max(0,Number(dati.dragonKills)||0);
            p.salvavitaUsati=dati.salvavitaUsati||0;
            p.sesso=dati.sesso||p.infoBase?.sesso||p.sesso;
            if(dati.elementalUses!==undefined)p.elementalUses=Math.max(0,Number(dati.elementalUses)||0);
            if(dati.ultimateUses)p.ultimateUses={...dati.ultimateUses};
            UltimateSystem.init(p);
            return p;

        });

        miaSquadra.forEach(p=>{
            let equipped=0;
            p.oggetti=p.oggetti.filter(item=>{
                if(!ItemSystem.eligible(item,p) && equipped<CONFIG_SLOT_ITEM_PER_POKEMON){equipped++;return true;}
                aggiungiAZaino(item.id);return false;
            });
            applicaBonusOggetti(p);
        });
        ItemSystem.beginFight();
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
    AppStorage.removeItem(SAVE_KEY_PREFIX + slot);
    console.log(`[Salvataggio] Slot ${slot} cancellato.`);
}

// ==========================================================
// INFO SALVATAGGIO (per anteprima UI)
// ==========================================================
function getSalvataggioInfo(slot) {
    const raw = AppStorage.getItem(SAVE_KEY_PREFIX + slot);
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
    if (AppStorage.getItem(SAVE_KEY_PREFIX + "auto")) return true;
    for (let i = 1; i <= NUM_SLOT; i++) {
        if (AppStorage.getItem(SAVE_KEY_PREFIX + i)) return true;
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
    const autoInfo = getSalvataggioInfo("auto");
    if (modalita === 'carica' && autoInfo) {
        const card = document.createElement('div');
        card.className = 'save-slot-card';
        const title = document.createElement('h3');
        title.textContent = 'AUTOSALVATAGGIO';
        const detail = document.createElement('p');
        detail.textContent = autoInfo.timestamp + ' · ' + autoInfo.mappa + ' · Piano ' + autoInfo.piano;
        const button = document.createElement('button');
        button.className = 'save-btn save-btn-primary';
        button.textContent = 'RIPRENDI RUN';
        button.onclick = () => eseguiCarica('auto');
        card.append(title, detail, button);
        container.append(card);
    }

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
    if (![1, 2, 3, "auto"].includes(slot) || !AppStorage.getItem(SAVE_KEY_PREFIX + slot)) {
        mostraAvviso('Salvataggio non disponibile.'); return;
    }
    // Reload clears combat animation callbacks before replacing the run.
    sessionStorage.setItem('laserpoke_resume', JSON.stringify({prefix: AppStorage.getPrefix(), slot}));
    location.reload();
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
    const disponibile = haAlmenoUnSalvataggio();
    if (document.body.classList.contains('camp-theme')) {
        btn.style.display = 'block';
        btn.disabled = !disponibile;
        btn.querySelector('small').textContent = disponibile ? 'Riprendi la tua avventura' : 'Nessuna run salvata';
        btn.title = disponibile ? 'Apri i salvataggi del profilo corrente' : 'Inizia una nuova Run dal portale';
    } else {
        btn.style.display = disponibile ? 'inline-block' : 'none';
    }
}




// Stable checkpoints are saved on the map, after each completed event.
let checkpointTimer = null;
function salvaCheckpointLocale() {
    const map = document.getElementById('schermata-mappa');
    if (!map?.classList.contains('attiva') || !miaSquadra.length || !alberoMappa.length || (typeof isSandboxAttiva !== 'undefined' && isSandboxAttiva) || (typeof isChallengeBattle !== 'undefined' && isChallengeBattle)) return false;
    const result = salvaPartita('auto');
    if (result && typeof aggiornaBottoneContinua === 'function') aggiornaBottoneContinua();
    return result;
}
function caricaCheckpointLocale() {
    if (!AppStorage.getItem(SAVE_KEY_PREFIX + 'auto')) return false;
    eseguiCarica('auto');
    return true;
}
document.addEventListener('DOMContentLoaded', () => {
    const raw = sessionStorage.getItem('laserpoke_resume');
    sessionStorage.removeItem('laserpoke_resume');
    if (raw) {
        try {
            const request = JSON.parse(raw);
            if (request.prefix === AppStorage.getPrefix() && caricaPartita(request.slot)) {
                document.querySelectorAll('.schermata.attiva').forEach(el => el.classList.remove('attiva'));
                document.getElementById('schermata-mappa').classList.add('attiva');
                generaMappaAlbero(); aggiornaSquadraMappa(); aggiornaPannelloZainoMappa();
                aggiornaDisplayMonete();
                riproduciMusica('mappa.mp3');
            }
        } catch (error) { console.warn('Impossibile ripristinare il checkpoint', error); }
    }
    const map = document.getElementById('schermata-mappa');
    new MutationObserver(() => {
        clearTimeout(checkpointTimer);
        checkpointTimer = setTimeout(salvaCheckpointLocale, 250);
    }).observe(map, {attributes:true,childList:true,subtree:true,characterData:true});
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') salvaCheckpointLocale();
    });
    window.addEventListener('pagehide', salvaCheckpointLocale);
});

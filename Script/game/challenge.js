/* ==========================================================
   CHALLENGE MODE LOGIC
   ========================================================== */

// --- DATI DEI BOSS (MOCK - in attesa dei dati reali) ---
const CHALLENGE_BOSSES = {
    "reo": {
        id: "reo",
        nome: "REO",
        elemento: "buio",
        lore: "Misterioso e implacabile. Nessuno conosce le sue vere origini, ma la sua potenza sul campo di battaglia \u00e8 innegabile.",
        immagine: "../Sprite/personaggi/Reo/REO_SCHEDA.png",
        fasi: 4,
        indizi: [
            "Fase 1: Evita di usare attacchi speciali.",
            "Fase 2: Usa mosse difensive quando si carica.",
            "Fase 3: Attento al suo attacco finale.",
            "Fase 4: Colpisci duro e velocemente!"
        ]
    },
    "epicmmt": {
        id: "epicmmt",
        nome: "EPIC MMT",
        elemento: "luce",
        lore: "Il dominatore delle tempeste. Con la sua stazza imponente controlla il campo di battaglia a suo piacimento.",
        immagine: "../Sprite/personaggi/EpicMMT/EPICMMT_SCHEDA.png",
        fasi: 4,
        indizi: [
            "Fase 1: Concentrati sulla difesa magica.",
            "Fase 2: Usa status alterati per rallentarlo.",
            "Fase 3: Attenzione al contrattacco.",
            "Fase 4: L'esplosione finale \u00e8 vicina, curati!"
        ]
    },
    "zayco": {
        id: "zayco",
        nome: "ZAYCO",
        elemento: "buio",
        lore: "Una creatura nata dall'ombra. I suoi attacchi sono rapidi e letali. Solo i pi\u00f9 veloci possono sperare di sopravvivere.",
        immagine: "../Sprite/personaggi/Zayco/ZAYCO_SCHEDA.png",
        fasi: 4,
        indizi: [
            "Fase 1: Zayco \u00e8 vulnerabile agli attacchi fisici.",
            "Fase 2: Mantieni alti i tuoi HP.",
            "Fase 3: Interrompi le sue cure se possibile.",
            "Fase 4: Preparati a resistere a danni massicci."
        ]
    }
};

let challengeProgress = {
    bossFought: {},
    bossMaxPhase: {}
};
try {
    const rawProg = localStorage.getItem('laserpoke_challenge_progress');
    if(rawProg && rawProg !== "undefined") {
        let parsed = JSON.parse(rawProg);
        challengeProgress.bossFought = parsed.bossFought || {};
        challengeProgress.bossMaxPhase = parsed.bossMaxPhase || {};
    }
} catch(e) {
    console.warn("Errore parsing challenge progress", e);
}

let currentChallengeBossId = null;

function salvaProgressiChallenge() {
    localStorage.setItem('laserpoke_challenge_progress', JSON.stringify(challengeProgress));
}

// Genera HTML per l'immagine "frammentata"
function getBossImageHTML(bossId, isDetail = false) {
    const boss = CHALLENGE_BOSSES[bossId];
    const maxPhase = challengeProgress.bossMaxPhase[bossId] || 0;
    
    if (maxPhase === 0) {
        return `<div class="question-mark">?</div>`;
    }

    let html = `<div class="puzzle-container">`;
    // Fino a 4 frammenti (in base a maxPhase)
    for(let i=1; i<=4; i++) {
        if(maxPhase >= i) {
            html += `<div class="puzzle-piece pezzo-${i} ${maxPhase === 4 ? 'puzzle-completo' : ''}" style="background-image: url('${boss.immagine}')"></div>`;
        }
    }
    html += `</div>`;
    return html;
}

function apriChallengeList() {
    cambiaSchermata("schermata-start", "schermata-challenge-list");
    renderChallengeCards();
}

function chiudiChallengeList() {
    cambiaSchermata("schermata-challenge-list", "schermata-start");
}

function renderChallengeCards() {
    const container = document.getElementById("challenge-cards-container");
    container.innerHTML = "";

    Object.values(CHALLENGE_BOSSES).forEach(boss => {
        const card = document.createElement("div");
        card.className = `challenge-card element-glow-${boss.elemento}`;
        card.onclick = () => apriDettaglioChallenge(boss.id);

        card.innerHTML = getBossImageHTML(boss.id);
        container.appendChild(card);
    });
}

function apriDettaglioChallenge(bossId) {
    currentChallengeBossId = bossId;
    const boss = CHALLENGE_BOSSES[bossId];
    const maxPhase = challengeProgress.bossMaxPhase[bossId] || 0;

    // Sfondo Dinamico
    const detailScreen = document.getElementById("schermata-challenge-detail");
    detailScreen.className = `schermata background-aura-${boss.elemento}`;

    // Titolo e Lore
    document.getElementById("challenge-detail-title").innerHTML = `${boss.nome} <img src="../Sprite/elementi/${boss.elemento}.png" class="boss-element-icon" alt="${boss.elemento}">`;
    document.getElementById("challenge-detail-lore").innerText = boss.lore;

    // Immagine Sinistra
    const imgDiv = document.querySelector(".challenge-detail-left");
    imgDiv.className = `challenge-detail-left element-border-${boss.elemento}`;
    imgDiv.innerHTML = getBossImageHTML(bossId, true);

    // Indizi e Timeline Fasi
    const hintsList = document.getElementById("challenge-detail-hints-list");
    hintsList.innerHTML = "";
    
    boss.indizi.forEach((hint, index) => {
        const phaseRequired = index + 1;
        const isUnlocked = maxPhase >= phaseRequired;
        
        const li = document.createElement("div");
        li.className = `timeline-step ${isUnlocked ? 'unlocked glow-' + boss.elemento : 'locked'}`;
        
        li.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h4>FASE ${phaseRequired}</h4>
                <p>${isUnlocked ? hint : '<em>[ Sconfiggi la fase precedente per sbloccare l\'indizio ]</em>'}</p>
            </div>
        `;
        hintsList.appendChild(li);
    });

    cambiaSchermata("schermata-challenge-list", "schermata-challenge-detail");
}

function tornaAChallengeList() {
    cambiaSchermata("schermata-challenge-detail", "schermata-challenge-list");
}

// ==========================================
// FUNZIONI UI - SALVATAGGI
// ==========================================

function apriSalvataggiChallenge() {
    // Apri modale
    document.getElementById("modal-challenge-saves").style.display = "flex";
    
    const container = document.getElementById("challenge-slots-container");
    container.innerHTML = "";

    // Leggiamo i 3 slot della challenge (laserpoke_challenge_save_1_reo, ecc.)
    for (let i = 1; i <= 3; i++) {
        const saveKey = `laserpoke_challenge_save_${i}`;
        const slotDataStr = localStorage.getItem(saveKey);
        const slotData = slotDataStr ? JSON.parse(slotDataStr) : null;

        const slotDiv = document.createElement("div");
        slotDiv.className = "challenge-slot " + (slotData ? "" : "empty");
        
        if (slotData && slotData.bossId === currentChallengeBossId) {
            slotDiv.innerHTML = `SLOT ${i}: ${slotData.date} - FASE ${slotData.phase}`;
            slotDiv.onclick = () => caricaSalvataggioChallenge(i);
        } else if (slotData && slotData.bossId !== currentChallengeBossId) {
            slotDiv.innerHTML = `SLOT ${i}: Occupato da un altro Boss`;
            slotDiv.style.opacity = "0.5";
            slotDiv.style.cursor = "not-allowed";
        } else {
            slotDiv.innerHTML = `SLOT ${i}: Vuoto`;
            slotDiv.onclick = () => alert("Nessun salvataggio in questo slot per questo boss.");
        }

        container.appendChild(slotDiv);
    }
}

function chiudiSalvataggiChallenge() {
    document.getElementById("modal-challenge-saves").style.display = "none";
}

function caricaSalvataggioChallenge(slotIndex) {
    const saveKey = `laserpoke_challenge_save_${slotIndex}`;
    const slotDataStr = localStorage.getItem(saveKey);
    if (!slotDataStr) return;
    
    // WIP: Qui caricheremo lo stato della partita e lanceremo la battaglia
    alert("WIP: Caricamento Salvataggio Challenge dallo slot " + slotIndex);
    chiudiSalvataggiChallenge();
}

// ==========================================
// FUNZIONI GAMEPLAY - NUOVO SCONTRO
// ==========================================

function iniziaNuovoCombattimentoChallenge() {
    if (confirm("Vuoi iniziare un nuovo scontro? I progressi non salvati andranno persi.")) {
        // WIP: Setta lo stato per iniziare la boss fight
        alert("WIP: Inizio nuovo combattimento contro " + currentChallengeBossId + ". Qui partirà la vera Boss Fight!");
        
        // La logica reale aggiornerà challengeProgress.bossMaxPhase 
        // DOPO aver effettivamente sconfitto una fase in battaglia.
    }
}

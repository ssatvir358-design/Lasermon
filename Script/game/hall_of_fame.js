// ==========================================
// HALL OF FAME & CHALLENGE TEAM DRAFTING
// ==========================================

let hallOfFameData = [];
try {
    const rawData = localStorage.getItem("laserpoke_hall_of_fame");
    if (rawData && rawData !== "undefined") {
        hallOfFameData = JSON.parse(rawData);
    }
} catch (e) {
    console.warn("Errore nel caricamento della Hall of Fame", e);
}
let challengeDraftTeam = [];

// ------------------------------------------
// SALVATAGGIO IN HALL OF FAME (Chiamato a fine run normale)
// ------------------------------------------
function salvaInHallOfFame() {
    if (typeof miaSquadra === 'undefined' || !miaSquadra || miaSquadra.length === 0) return;

    let salvataggiNuovi = 0;
    
    miaSquadra.forEach(pg => {
        // Controlla se il pg esiste già nella HoF (per ID o Nome base) evitando undefined === undefined
        const giaPresente = hallOfFameData.some(h => 
            (h.id && pg.id && h.id === pg.id) || (h.nome === pg.nome)
        );
        
        if (!giaPresente) {
            hallOfFameData.push({
                id: pg.id,
                nome: pg.nome,
                immagine: pg.immagine,
                elemento: pg.elemento
            });
            salvataggiNuovi++;
        }
    });

    if (salvataggiNuovi > 0) {
        localStorage.setItem("laserpoke_hall_of_fame", JSON.stringify(hallOfFameData));
        console.log("[Hall of Fame] Aggiunti " + salvataggiNuovi + " nuovi eroi!");
    }
}

// ------------------------------------------
// UI - GALLERIA HALL OF FAME (Lobby)
// ------------------------------------------
function apriHallOfFame() {
    cambiaSchermata("schermata-start", "schermata-hall-of-fame");
    renderHallOfFameGallery();
}

function renderHallOfFameGallery() {
    const container = document.getElementById("hof-gallery-container");
    container.innerHTML = "";

    if (hallOfFameData.length === 0) {
        container.innerHTML = `<div style="color: #fff; width: 100%; text-align: center; margin-top: 50px; font-family: monospace; font-size: 20px;">Non hai ancora sbloccato nessun personaggio. <br><br> Completa una run classica per aggiungere la tua squadra vincente alla Hall of Fame!</div>`;
        return;
    }

    hallOfFameData.forEach(pg => {
        const card = document.createElement("div");
        card.className = "hof-card";
        
        let elemImg = "";
        if(pg.elemento) {
            elemImg = `<img src="../Sprite/elementi/${pg.elemento}.png" class="hof-element-icon" alt="${pg.elemento}">`;
        }

        card.innerHTML = `
            <img src="${pg.immagine}" class="hof-pg-img" onerror="this.src='../Sprite/ui/placeholder.png';">
            <div class="hof-pg-name">${pg.nome} ${elemImg}</div>
        `;
        container.appendChild(card);
    });
}

// ------------------------------------------
// UI - SELEZIONE TEAM CHALLENGE (DRAFT)
// ------------------------------------------

function iniziaDraftChallenge() {
    if (hallOfFameData.length === 0) {
        alert("La tua Hall of Fame è vuota! Devi completare almeno una run normale per sbloccare dei personaggi prima di poter affrontare i Boss della Challenge Mode.");
        return;
    }

    challengeDraftTeam = []; // Resetta team selezionato
    cambiaSchermata("schermata-challenge-detail", "schermata-challenge-draft");
    renderDraftRoster();
    renderDraftSquadra();
}

function renderDraftRoster() {
    const container = document.getElementById("draft-roster-container");
    container.innerHTML = "";

    hallOfFameData.forEach(pg => {
        // Se è già in squadra, opacizzalo e togli click
        const isInTeam = challengeDraftTeam.some(t => 
            (t.id && pg.id && t.id === pg.id) || (t.nome === pg.nome)
        );
        
        const card = document.createElement("div");
        card.className = `draft-card ${isInTeam ? 'draft-card-disabled' : ''}`;
        
        if (!isInTeam) {
            card.onclick = () => {
                if (challengeDraftTeam.length < 6) {
                    challengeDraftTeam.push(pg);
                    renderDraftRoster();
                    renderDraftSquadra();
                } else {
                    alert("Hai già raggiunto il limite di 6 personaggi!");
                }
            };
        }

        card.innerHTML = `<img src="${pg.immagine}" onerror="this.src='../Sprite/ui/placeholder.png';">`;
        container.appendChild(card);
    });
}

function renderDraftSquadra() {
    const container = document.getElementById("draft-squadra-container");
    container.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const slot = document.createElement("div");
        slot.className = "draft-slot";
        
        if (i < challengeDraftTeam.length) {
            const pg = challengeDraftTeam[i];
            slot.innerHTML = `<img src="${pg.immagine}" onerror="this.src='../Sprite/ui/placeholder.png';">`;
            
            // Clicca sullo slot per rimuoverlo dal team
            slot.onclick = () => {
                challengeDraftTeam.splice(i, 1);
                renderDraftRoster();
                renderDraftSquadra();
            };
        } else {
            slot.innerHTML = `<div class="draft-slot-empty">+</div>`;
        }
        
        container.appendChild(slot);
    }

    const btnStart = document.getElementById("btn-start-challenge-fight");
    if (challengeDraftTeam.length > 0) {
        btnStart.style.display = "block";
    } else {
        btnStart.style.display = "none";
    }
}

function avviaVeraChallengeFight() {
    if (challengeDraftTeam.length === 0) return;

    if (confirm(`Sei sicuro di voler sfidare ${currentChallengeBossId.toUpperCase()} con questo team?`)) {
        alert("Engine di battaglia in arrivo... Generazione personaggi al Lv 100 in corso!");
    }
}

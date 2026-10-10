// ==========================================
// CHALLENGE BATTLE ENGINE
// ==========================================

let isChallengeBattle = false;
let currentChallengePhase = 1;
let runPrimaDellaChallenge = null;

function terminaChallengeAllaLobby() {
    UltimateSystem.endFight();
    isChallengeBattle=false;isBossFight=false;currentChallengePhase=1;
    if(window.BattleFX)BattleFX.clear();
    for(const id of ['img-giocatore','img-nemico']){
        const img=document.getElementById(id);
        if(img){delete img.dataset.attackAnimating;img.getAnimations().forEach(a=>a.cancel());}
    }
    if(runPrimaDellaChallenge){
        miaSquadra=runPrimaDellaChallenge.squadra;zaino=runPrimaDellaChallenge.zaino;monete=runPrimaDellaChallenge.monete;
        isRunVeloce=runPrimaDellaChallenge.veloce;mioPokemon=runPrimaDellaChallenge.attivo;nemicoPokemon=runPrimaDellaChallenge.nemico;
        nemiciIncontro=runPrimaDellaChallenge.coda;indiceMioPokemonAttuale=runPrimaDellaChallenge.indice;
        runPrimaDellaChallenge=null;
    }
    resettaEffettiAttivi();resettaItemFight();isAutoBattlePaused=false;
    for(const id of ['schermata-gioco','schermata-challenge-list','schermata-challenge-detail','schermata-challenge-draft']){
        const el=document.getElementById(id);if(el){el.classList.remove('attiva');el.style.removeProperty('display');}
    }
    for(const id of ['challenge-video-overlay','intro-vs']){const el=document.getElementById(id);if(el)el.style.display='none';}
    document.querySelector('#challenge-video-overlay video')?.pause();
    document.getElementById('btn-fuga').style.removeProperty('display');
    if(typeof BattleUI!=='undefined')BattleUI.reset();
    cambiaSchermata('schermata-gioco','schermata-start');
    if(window.ArchipelagoMap){ArchipelagoMap.worldKey=null;ArchipelagoMap.sync();}
}

function avviaVeraChallengeFight() {
    if (isChallengeBattle || challengeDraftTeam.length === 0) return;
    // Reject unavailable bosses before touching the run, party or battle flags.
    if(currentChallengeBossId!=='reo'){
        mostraAvviso('Questo Boss non è ancora implementato. Puoi scegliere Reo oppure tornare alla lobby.');
        return;
    }

    if (confirm(`Sei sicuro di voler sfidare ${currentChallengeBossId.toUpperCase()} con questo team?`)) {
        runPrimaDellaChallenge={squadra:miaSquadra,zaino,monete,veloce:isRunVeloce,attivo:mioPokemon,nemico:nemicoPokemon,coda:nemiciIncontro,indice:indiceMioPokemonAttuale};
        if (typeof BattleUI !== "undefined") BattleUI.reset();
        isChallengeBattle = true;
        isBossFight = true;
        isRunVeloce=false;isSandboxAttiva=false;isAutoBattlePaused=false;zaino=[];
        haUsatoUltGiocatore = false;
        haUsatoUltNemico = false;
        resettaEffettiAttivi();
        currentChallengePhase = 1;
        
        if (document.getElementById("btn-fuga")) document.getElementById("btn-fuga").style.display = "none";

        // Clona la squadra draftata in miaSquadra, forzandoli al lv 100
        miaSquadra = challengeDraftTeam.map(pgBase => {
            const datiPG = pokemonDatabase.find(p => (p.id && pgBase.id && p.id === pgBase.id) || (p.nome === (pgBase.nome === "VESPER, LA TABULA RASA DEL CAPITALE" ? "Vesper Witch of Darkness" : pgBase.nome)));
            if(datiPG) {
                // Livello 100, mosse lvl 3
                return creaPokemon(datiPG, 100, 3, false);
            }
            return null;
        }).filter(p => p !== null);
        if(!miaSquadra.length){terminaChallengeAllaLobby();mostraAvviso('Nessun personaggio valido nella squadra selezionata.');return;}
        UltimateSystem.challengeRefill(miaSquadra);
        resettaItemFight();

        indiceMioPokemonAttuale = 0;
        
        // Avvia il boss
        initBossReo();

        // Imposta schermata battaglia
        const sg = document.getElementById("schermata-gioco");
        if (sg) {
            sg.style.backgroundImage = "url('../Sprite/UI/Combattimento/Combattimento1.png')";
            sg.style.backgroundSize = "cover";
            sg.style.backgroundPosition = "center";
        }
        cambiaSchermata("schermata-challenge-draft", "schermata-gioco");
        
        // Disattiva il pulsante scappa o cambialo
        document.getElementById("btn-fuga").style.display = "none";
        
        // Resetta console e avvia turno
        document.getElementById("console-log").innerHTML = "<strong style='color:#e74c3c; font-size: 18px;'>LA BOSS FIGHT HA INIZIO!</strong>";
        
        mandaInCampoMioPokemon();
        abilitaControlliGiocatore();
        aggiornaGrafica();
    }
}

// ------------------------------------------
// HOOKS (Richiamati da battaglia.js)
// ------------------------------------------

function eseguiTurnoBossChallenge() {
    if(currentChallengeBossId === 'reo') {
        turnoBossReo();
    }
}

function gestisciKOBossChallenge() {
    // Il boss è arrivato a 0 HP. Passa alla fase successiva se possibile
    avanzaFaseChallenge();
}

function gestisciKOGiocatoreChallenge() {
    document.getElementById("img-giocatore").classList.add("danno-subito");
    setTimeout(() => {
        const el = document.getElementById("img-giocatore");
        if (el) el.classList.remove("danno-subito");
    }, 500);
    document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'>" + "&#9760; Il tuo " + mioPokemon.nome + " e' esausto!";
    
    // Controlla se ci sono altri vivi
    const vivoIndex = miaSquadra.findIndex(p => p && p.hpAttuali > 0);
    if (vivoIndex !== -1) {
        indiceMioPokemonAttuale = vivoIndex;
        mandaInCampoMioPokemon();
    } else {
        // GAMEOVER CHALLENGE
        setTimeout(() => {
            alert("Sconfitta... Il Boss ha trionfato.");
            terminaChallengeAllaLobby();
        }, 1500);
    }
}

function controllaTriggerChallenge() {
    // Controllo speciale per Reo Fase 2 -> Fase 3 (60% hp)
    if(currentChallengeBossId === 'reo' && currentChallengePhase === 2) {
        if(nemicoPokemon.hpAttuali > 0 && nemicoPokemon.hpAttuali <= nemicoPokemon.hpMax * 0.6) {
            avanzaFaseChallenge();
            return true;
        }
    }
    return false;
}

// ------------------------------------------
// AVANZAMENTO FASE
// ------------------------------------------
function avanzaFaseChallenge() {
    const totalFasi = CHALLENGE_BOSSES[currentChallengeBossId].fasi;
    
    // Sblocca il frammento/pezzo corrispondente per le prossime partite
    let maxSbloccata = challengeProgress.bossMaxPhase[currentChallengeBossId] || 0;
    if (currentChallengePhase > maxSbloccata) {
        challengeProgress.bossMaxPhase[currentChallengeBossId] = currentChallengePhase;
        salvaProgressiChallenge();
    }

    if (currentChallengePhase >= totalFasi) {
        // Vittoria assoluta
        document.getElementById("console-log").innerHTML += "<hr style='border-color: #444; margin: 15px 0;'><strong style='color:#f1c40f; font-size: 24px;'>HAI SCONFITTO IL BOSS! COMPLIMENTI!</strong>";
        setTimeout(() => {
            alert("VITTORIA DELLA CHALLENGE!");
            terminaChallengeAllaLobby();
        }, 3000);
        return;
    }

    currentChallengePhase++;
    document.getElementById("console-log").innerHTML += `<hr style='border-color: #444; margin: 15px 0;'><strong style='color:#e74c3c; font-size: 20px;'>TRANSIZIONE ALLA FASE ${currentChallengePhase}...</strong>`;
    
    // Riproduce il video MP4, e al termine esegue la nuova fase
    riproduciVideoFase(currentChallengePhase, () => {
        if(currentChallengeBossId === 'reo') {
            applicaFaseReo(currentChallengePhase);
        }
    });
}
// ------------------------------------------
// GESTIONE VIDEO
// ------------------------------------------
function riproduciVideoFase(fase, callback) {
    const bossCapitalized = currentChallengeBossId.charAt(0).toUpperCase() + currentChallengeBossId.slice(1);
    const videoName = `${bossCapitalized}F${fase}.mp4`;
    const videoPath = `../Sprite/personaggi/${bossCapitalized}/${videoName}`;
    
    // Crea l'overlay video
    let overlay = document.getElementById("challenge-video-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "challenge-video-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "#000";
        overlay.style.zIndex = "9999";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <video id="challenge-video-player" style="width:100%; height:100%; object-fit:contain;" autoplay>
            <source src="${videoPath}" type="video/mp4">
        </video>
        <button id="btn-skip-video" style="position:absolute; bottom:20px; right:20px; padding:10px 20px; background:rgba(0,0,0,0.7); color:#fff; border:2px solid #fff; border-radius:5px; cursor:pointer; z-index:10000; font-family:monospace;">SALTA (>)</button>
    `;
    overlay.style.display = "flex";
    
    const videoEl = document.getElementById("challenge-video-player");
    const btnSkip = document.getElementById("btn-skip-video");
    
    let concluso = false;
    const concludiVideo = () => {
        if(concluso) return;
        concluso = true;
        overlay.style.display = "none";
        overlay.innerHTML = "";
        if(callback) callback();
    };

    videoEl.onended = concludiVideo;
    videoEl.onerror = () => {
        console.warn("Video non trovato: " + videoPath);
        concludiVideo(); // Se non c'è, skippa subito
    };
    
    btnSkip.onclick = concludiVideo;
}

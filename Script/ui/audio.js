// ==========================================================
// audio.js — Gestione audio e impostazioni sonore
// Estratto da script.js (righe 1418-1479)
// Dipendenze: stato.js (volumePrecedente, isAutoskipAbilitato, isSkipAttivo)
// ==========================================================

// Cambia la traccia musicale corrente (evita di riavviarla se è già in riproduzione)
function riproduciMusica(nomeFile) {
    const audio = document.getElementById("musica-gioco");
    if (!audio) return;
    
    const urlCorretto = "../Audio/" + nomeFile;
    if (audio.src.includes(nomeFile)) return;
    
    audio.src = urlCorretto;
    audio.play().catch(e => console.log("Audio in attesa di sblocco interazione utente."));
}

// Apre il pannello impostazioni
function apriModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "block";
}

// Chiude il pannello impostazioni
function chiudiModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "none";
}

// Callback del cursore volume: aggiorna il volume e deseleziona "muto" se il volume è > 0
function regolaVolume(valore) {
    const audio = document.getElementById("musica-gioco");
    if (audio) {
        audio.volume = valore;
        if (valore > 0) {
            document.getElementById("chk-muto").checked = false;
        }
    }
}

// Callback checkbox muto: azzera o ripristina il volume
function toggleMuto(isMuto) {
    const audio = document.getElementById("musica-gioco");
    const slider = document.getElementById("slider-volume");
    if (!audio) return;

    if (isMuto) {
        volumePrecedente = audio.volume;
        audio.volume = 0;
        slider.value = 0;
    } else {
        audio.volume = volumePrecedente > 0 ? volumePrecedente : 0.5;
        slider.value = audio.volume;
    }
}

// Callback checkbox autoskip
function toggleAutoskip(valore) {
    isAutoskipAbilitato = valore;
}

// Abilita la modalità skip rapido per il combattimento corrente
function attivaSkip() {
    isSkipAttivo = true;
    const btnSkip = document.getElementById("btn-skip");
    if (btnSkip) btnSkip.disabled = true;
}

// Sblocca retroattivo audio (alcuni browser richiedono interazione utente prima del play)
document.addEventListener("click", function() {
    const audio = document.getElementById("musica-gioco");
    if (audio && (!audio.src || audio.paused) && document.getElementById("schermata-start").classList.contains("attiva")) {
        riproduciMusica("lobby.mp3");
    }
}, { once: true });

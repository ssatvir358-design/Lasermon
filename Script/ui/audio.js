// ==========================================================
// audio.js \u2014 Gestione audio e impostazioni sonore
// Estratto da script.js (righe 1418-1479)
// Dipendenze: stato.js (volumePrecedente, isAutoskipAbilitato, isSkipAttivo)
// ==========================================================

// Cambia la traccia musicale corrente (evita di riavviarla se \u00e8 gi\u00e0 in riproduzione)
function riproduciMusica(nomeFile) {
    const audio = document.getElementById("musica-gioco");
    if (!audio) return;
    
    const urlCorretto = "../Audio/" + nomeFile;
    if (audio.src.includes(nomeFile)) {
        if (audio.paused) {
            audio.play().catch(e => console.log("Audio in attesa di sblocco:", e));
        }
        return;
    }
    
    audio.src = urlCorretto;
    audio.play().catch(e => console.log("Audio in attesa di sblocco:", e));
}

// Apre il pannello impostazioni
function apriModalImpostazioni() {
    const audio = document.getElementById("musica-gioco");
    if (audio) {
        const slider = document.getElementById("slider-volume");
        if (slider) slider.value = audio.volume;
        const chkMuto = document.getElementById("chk-muto");
        if (chkMuto) chkMuto.checked = (audio.volume === 0);
    }
    const chkAutoskip = document.getElementById("chk-autoskip");
    if (chkAutoskip) chkAutoskip.checked = isAutoskipAbilitato;

    document.getElementById("modal-impostazioni").style.display = "flex";
}

// Chiude il pannello impostazioni
function chiudiModalImpostazioni() {
    document.getElementById("modal-impostazioni").style.display = "none";
}

// Callback del cursore volume: aggiorna il volume e deseleziona "muto" se il volume \u00e8 > 0
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
        audio.volume = volumePrecedente > 0 ? volumePrecedente : 0.25;
        slider.value = audio.volume;
    }
}

// Callback checkbox autoskip
function toggleAutoskip(valore) {
    isAutoskipAbilitato = valore;
    isSkipAttivo = valore;
    const btn = document.getElementById("btn-skip-fixed");
    if (btn) btn.classList.toggle("attivo", valore);
}

// Abilita la modalit\u00e0 skip rapido per il combattimento corrente
function attivaSkip() {
    isSkipAttivo = true;
    const btnSkip = document.getElementById("btn-skip");
    if (btnSkip) btnSkip.disabled = true;
}

// Sblocca retroattivo audio (alcuni browser richiedono interazione utente prima del play)
document.addEventListener("click", function() {
    const audio = document.getElementById("musica-gioco");
    if (audio && audio.paused) {
        audio.play().catch(e => {});
    }
}, { once: true });

document.addEventListener("DOMContentLoaded", function() {
    const audio = document.getElementById("musica-gioco");
    if (audio) {
        audio.volume = 0.25; // Default iniziale dimezzato
    }
});

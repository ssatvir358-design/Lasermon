// 1. Funzione per gestire la visibilità dei campi stats
function toggleStats(prefix) {
    const isChecked = document.getElementById(`sb-${prefix}-manuale`).checked;
    const container = document.querySelector(`#sb-${prefix}-manuale`).closest('fieldset').querySelector('.input-stats');
    container.style.display = isChecked ? 'flex' : 'none';
}

//funzione per gestire la visibilità dei valori (Perk/Item)
function toggleValore(element, targetId) {
    const valoreInput = document.getElementById(targetId);
    // Mostra il campo solo se è selezionato qualcosa (valore diverso da "")
    valoreInput.style.display = element.value !== "" ? "block" : "none";
}

function aggiornaTooltip(selectElement, tipo) {
    const prefix = selectElement.id.split('-')[1];
    const selectedId = selectElement.value;
    const infoIcon = selectElement.nextElementSibling;
    const valInput = document.getElementById(`sb-${prefix}-val-${tipo}`);
    const valoreInserito = valInput ? valInput.value : "";
    
    let descrizione = "Seleziona un elemento per vedere l'effetto.";
    
    if (selectedId !== "") {
        const elemento = (tipo === 'perk') ? getPerkDaId(selectedId) : DB_OGGETTI.find(i => i.id === selectedId);
        
        if (elemento) {
            descrizione = elemento.descrizione;
            
            if (valoreInserito !== "") {
                // LOGICA DI SOSTITUZIONE MIGLIORATA
                // 1. Sostituisce i numeri percentuali (10%)
                descrizione = descrizione.replace(/\d+(?=%)/g, valoreInserito);
                
                // 2. Sostituisce numeri relativi a turni (es. "ogni 3 turni" -> "ogni 1 turni")
                // Cerca un numero che sia seguito dalla parola "turni"
                descrizione = descrizione.replace(/\d+(?=\s*turni)/gi, valoreInserito);
                
                // 3. Sostituisce numeri isolati che non sono seguiti da % o turni (es. "una volta" o "3 + ...")
                // NOTA: Usa questo solo se sei sicuro che il primo numero della descrizione sia quello da cambiare
                // Se hai descrizioni con più numeri, questa riga va limitata
                if (!descrizione.includes("%") && !descrizione.toLowerCase().includes("turni")) {
                    descrizione = descrizione.replace(/\b\d+\b/, valoreInserito);
                }
            }
        }
    }
    
    infoIcon.setAttribute("title", descrizione);
}

    // Verifica avvio sandbox
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('sandbox')) {
        isSandboxAttiva = true;
        setTimeout(() => {
            document.querySelectorAll('.schermata').forEach(s => s.style.display = 'none');
            document.getElementById('schermata-sandbox').style.display = 'flex';
            inizializzaSandbox(); 
        }, 500);
    }

    function calcolaStatsBase(pokemonBase, livello) {
        const moltiplicatori = CONFIG_STAT_ELEMENTO[pokemonBase.elemento] || { hp: 1, atk: 1, def: 1, vel: 1 };
        return {
            hp: Math.round((pokemonBase.hpBase + (pokemonBase.hpBase * 0.1 * livello)) * moltiplicatori.hp),
            atk: Math.round((pokemonBase.atkBase + (pokemonBase.atkBase * 0.1 * livello)) * moltiplicatori.atk),
            def: Math.round((pokemonBase.defBase + (pokemonBase.defBase * 0.1 * livello)) * moltiplicatori.def),
            vel: Math.round((pokemonBase.velBase + (pokemonBase.velBase * 0.1 * livello)) * moltiplicatori.vel)
        };
    }

    function inizializzaSandbox() {
    const selectGio = document.getElementById("sb-gio-nome");
    const selectNem = document.getElementById("sb-nem-nome");
    const selectPerk = document.querySelectorAll("[id$='-listaperk']"); 
    const selectItemGio = document.getElementById("sb-gio-item");

    selectGio.innerHTML = "";
    selectNem.innerHTML = "";

    pokemonDatabase.forEach(p => {
        selectGio.innerHTML += `<option value="${p.nome}">${p.nome}</option>`;
        selectNem.innerHTML += `<option value="${p.nome}">${p.nome}</option>`;
    });

    selectPerk.forEach(sel => {
        sel.innerHTML = '<option value="">Nessun Perk</option>';
        
        // Itera attraverso ogni categoria nel PERK_DB
        Object.values(PERK_DB).forEach(cat => {
            // Aggiungi Tier 1
            if(cat.tier1 && cat.tier1.opzioni) {
                cat.tier1.opzioni.forEach(o => sel.innerHTML += `<option value="${o.id}">${o.nome} (T1)</option>`);
            }
            // Aggiungi Tier 2
            if(cat.tier2) {
                Object.values(cat.tier2).forEach(o => sel.innerHTML += `<option value="${o.id}">${o.nome} (T2)</option>`);
            }
        });
    });

    selectItemGio.innerHTML = '<option value="">Nessun Oggetto</option>';
    DB_OGGETTI.filter(i => i.categoria === "equipaggiabile").forEach(i => {
        selectItemGio.innerHTML += `<option value="${i.id}">${i.nome}</option>`;
    });
}

    function avviaSandbox() {
        isSandboxAttiva = true;
        
        function creaPokemonSandbox(prefix) {
            const nome = document.getElementById(`sb-${prefix}-nome`).value;
            const lv = parseInt(document.getElementById(`sb-${prefix}-lvl`).value);
            const manuale = document.getElementById(`sb-${prefix}-manuale`).checked;
            const base = pokemonDatabase.find(x => x.nome === nome);
            
            let p = creaPokemon(base, lv, 3);
            
            if (manuale) {
                p.hpMax = parseInt(document.getElementById(`sb-${prefix}-hp`).value);
                p.atk = parseInt(document.getElementById(`sb-${prefix}-atk`).value);
                p.def = parseInt(document.getElementById(`sb-${prefix}-def`).value);
                p.vel = parseInt(document.getElementById(`sb-${prefix}-vel`).value);
            } else {
                const stats = calcolaStatsBase(base, lv);
                p.hpMax = stats.hp; p.atk = stats.atk; p.def = stats.def; p.vel = stats.vel;
            }
            
            p.hpAttuali = p.hpMax;
            p.perkId = document.getElementById(`sb-${prefix}-listaperk`).value || null;
            
            if(prefix === "gio") {
                const itemId = document.getElementById("sb-gio-item").value;
                if(itemId) p.item = DB_OGGETTI.find(i => i.id === itemId);
            }
            return p;
        }

        sandboxConfig.mioPokemon = creaPokemonSandbox("gio");
        sandboxConfig.nemicoPokemon = creaPokemonSandbox("nem");

        cambiaSchermata("schermata-sandbox", "schermata-gioco");
        preparaIncontroBattaglia("sandbox"); 
    }

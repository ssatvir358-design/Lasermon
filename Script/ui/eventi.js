// ==========================================================
// eventi.js — Gestione eventi speciali della mappa
// Estratto da script.js (righe 1820-2014)
// Dipendenze: stato.js, pokemon_factory.js, schermate.js
// ==========================================================

// ================= EVENTO POKEBALL =================

// Apre la schermata di selezione Pokéball (3 opzioni casuali)
function generaOpzioniPokeball() {
    cambiaSchermata("schermata-mappa", "schermata-selezione");
    
    let btnTornaLobby = document.getElementById("btn-torna-lobby");
    if (btnTornaLobby) btnTornaLobby.style.display = "none";
    
    let titolo = document.getElementById("titolo-selezione");
    if (titolo) titolo.innerText = "Una Pokéball! Scegli chi unire alla squadra o prosegui.";
    
    generaOpzioniPokemon(3, false);

    // Recupera o crea il bottone "No grazie"
    let contenitore = document.getElementById("opzioni-pokemon-container");
    if (!contenitore) {
        contenitore = document.getElementById("schermata-selezione");
        if (!contenitore) {
            console.error("Errore: contenitore schermata-selezione non trovato!");
            return;
        }
    }
    
    // Rimuove il vecchio tasto se presente (evita duplicati al secondo click)
    let vecchioBtn = document.getElementById("btn-annulla-pokeball");
    if (vecchioBtn) vecchioBtn.remove();

    let btnAnnulla = document.createElement("button");
    btnAnnulla.id = "btn-annulla-pokeball";
    btnAnnulla.className = "btn-battle";
    btnAnnulla.style.marginTop = "20px";
    btnAnnulla.style.backgroundColor = "#e74c3c";
    btnAnnulla.innerText = "No, Grazie";
    btnAnnulla.onclick = () => {
        cambiaSchermata("schermata-selezione", "schermata-mappa");
        generaMappaAlbero(); // Aggiorna i nodi della mappa per proseguire
        aggiornaSquadraMappa();
    };
    
    contenitore.appendChild(btnAnnulla);
}

// ================= EVENTO SCAMBIO =================

// Avvia la schermata dello scambio Pokémon (mostra la squadra selezionabile)
function avviaEventoScambio() {
    document.getElementById("scambio-fase-selezione").style.display = "block";
    document.getElementById("scambio-fase-risultato").style.display = "none";

    let contenitoreSquadra = document.getElementById("scambio-squadra-list");
    contenitoreSquadra.innerHTML = "";

    miaSquadra.forEach((p, index) => {
        let scheda = document.createElement("div");
        scheda.className = "scheda-disco-pokemon"; 
        scheda.style.backgroundColor = p.colore || "#ffffff";
        scheda.style.transform = "scale(0.8)";
        scheda.style.height = "auto";
        scheda.style.cursor = "pointer";
        scheda.onclick = () => eseguiScambioDiretto(index);
        
        scheda.innerHTML = `
            <div class="foto-disco-pkm"><img src="${p.immagine}"></div>
            <div class="info-disco-pkm">
                <div class="nome-disco-pkm" style="font-size: 16px;">${p.nome}</div>
                <div style="font-family: monospace;">Lvl. ${p.livello}</div>
            </div>
        `;
        contenitoreSquadra.appendChild(scheda);
    });

    cambiaSchermata("schermata-mappa", "schermata-scambio");
}

// Variabile globale nel file per tracciare il pokémon ottenuto dallo scambio
let _ultimoScambiato = null;

// Esegue il cambio diretto: rimuove il Pokémon scelto e aggiunge uno casuale di livello superiore
function eseguiScambioDiretto(indexDaScambiare) {
    let vecchioPkm = miaSquadra[indexDaScambiare];

    let bonusLivelli = 2; // Il nuovo Pokémon riceve +2 livelli rispetto a quello ceduto
    let nuovoLivello = vecchioPkm.livello + bonusLivelli;

    let nuovoInfoBase = pescaPokemonCasuale([vecchioPkm.nome]); 
    let mossaLvl = calcolaLivelloEMossaMappa(pianoAttuale).livelloMossa;
    let nuovoPkm = creaPokemon(nuovoInfoBase, nuovoLivello, mossaLvl);

    miaSquadra[indexDaScambiare] = nuovoPkm;
    _ultimoScambiato = nuovoPkm; // Salva per check perk in chiusura

    document.getElementById("scambio-fase-selezione").style.display = "none";
    document.getElementById("scambio-fase-risultato").style.display = "block";
    document.getElementById("testo-risultato-scambio").innerHTML = `Hai scambiato ${vecchioPkm.nome} (Lvl ${vecchioPkm.livello}) per un <strong>${nuovoPkm.nome} (Lvl ${nuovoPkm.livello})</strong>!`;

    let contenitoreCard = document.getElementById("card-nuovo-pokemon");
    contenitoreCard.innerHTML = `
        <div class="scheda-disco-pokemon" style="background-color: ${nuovoPkm.colore}; cursor: default; transform: scale(0.9); height: auto;">
            <div class="foto-disco-pkm"><img src="${nuovoPkm.immagine}"></div>
            <div class="info-disco-pkm">
                <div class="nome-disco-pkm">${nuovoPkm.nome}</div>
                <div style="font-family: monospace; font-size: 16px;">Lvl. ${nuovoPkm.livello}</div>
                <div style="font-size: 13px; color: #27ae60; font-weight: bold; margin-top: 5px;">TIPO: ${nuovoPkm.elemento.toUpperCase()}</div>
            </div>
        </div>
    `;
}

// Annulla lo scambio e torna alla mappa sbloccando i nodi successivi
function annullaScambio() {
    cambiaSchermata("schermata-scambio", "schermata-mappa");
    generaMappaAlbero();
}

// Chiude la schermata di scambio dopo aver confermato
// Se il nuovo Pokémon ha superato un level cap, avvia la selezione perk prima di tornare alla mappa.
function chiudiEventoScambio() {
    // Trova il Pokémon appena aggiunto (l'ultimo modificato nella squadra).
    // La funzione eseguiScambioDiretto salva il riferimento in _ultimoScambiato.
    const nuovoPkm = _ultimoScambiato;
    _ultimoScambiato = null;

    // Callback finale: chiude lo scambio e aggiorna la mappa
    const tornaAMappa = () => {
        cambiaSchermata("schermata-scambio", "schermata-mappa");
        aggiornaSquadraMappa();
        generaMappaAlbero();
    };

    if (nuovoPkm) {
        // Controlla se il nuovo Pokémon supera un level cap → mostra perk se necessario
        verificaPerkDopoEvento(nuovoPkm, tornaAMappa);
    } else {
        tornaAMappa();
    }
}

// ================= EVENTO MISTERIOSO =================

// Avvia un evento misterioso: pesca uno tra quelli abilitati per la mappa corrente
function avviaEventoMisterioso() {
    let numeroMappaCorrente = parseInt(mappaAttuale.replace("mappa", "")) || 1;
    let eventiFiltrati = DB_EVENTI_MISTERIOSI.filter(ev => ev.mappeAbilitate.includes(numeroMappaCorrente));
    
    if (eventiFiltrati.length === 0) eventiFiltrati = DB_EVENTI_MISTERIOSI;
    
    // Selezione pesata in base alle percentuali
    let sommaPercentuali = eventiFiltrati.reduce((sum, ev) => sum + ev.percentuale, 0);
    let rand = Math.random() * sommaPercentuali;
    let eventoEstratto = eventiFiltrati[0];
    let contatore = 0;
    
    for (let ev of eventiFiltrati) {
        contatore += ev.percentuale;
        if (rand <= contatore) {
            eventoEstratto = ev; break;
        }
    }
    
    document.getElementById("mistero-titolo-evento").innerText = eventoEstratto.nome;
    document.getElementById("mistero-descrizione").innerText = eventoEstratto.descrizione;
    
    // Applica l'effetto dell'evento (es. cura, boost atk, level up)
    if (eventoEstratto.azione) eventoEstratto.azione();
    
    cambiaSchermata("schermata-mappa", "schermata-mistero");
}

// Chiude la schermata evento misterioso e aggiorna la mappa
function chiudiEventoMistero() {
    cambiaSchermata("schermata-mistero", "schermata-mappa");
    aggiornaSquadraMappa();
    generaMappaAlbero();
}

// ----------------------------------------------------------
// EVENTO ITEM MAPPA
// ----------------------------------------------------------

function avviaEventoItem() {
    const contenitoreOpzioni = document.getElementById("evento-item-opzioni");
    if (!contenitoreOpzioni) return;
    contenitoreOpzioni.innerHTML = "";
    
    // Filtra gli oggetti che si trovano solo per terra (non acquistabili) e validi per la mappa attuale
    let numeroMappaCorrente = parseInt(mappaAttuale.replace("mappa", "")) || 1;
    const itemPerTerra = DB_OGGETTI.filter(o => 
        o.acquistabile === false && 
        o.categoria === "equipaggiabile" &&
        (o.mappeAbilitate.length === 0 || o.mappeAbilitate.includes(numeroMappaCorrente))
    );
    
    if (itemPerTerra.length === 0) {
        saltaEventoItem();
        return;
    }
    
    // Scegliamo 3 item casuali (senza duplicati se possibile)
    const scelti = [];
    let tentativi = 0;
    while(scelti.length < 3 && tentativi < 50) {
        let rndItem = itemPerTerra[Math.floor(Math.random() * itemPerTerra.length)];
        if (!scelti.find(i => i.id === rndItem.id)) {
            scelti.push(rndItem);
        }
        tentativi++;
    }
    
    scelti.forEach(item => {
        const div = document.createElement("div");
        div.className = "card-item-shop";
        div.style.cursor = "pointer";
        div.style.border = "2px solid #3498db";
        div.style.borderRadius = "10px";
        div.style.padding = "15px";
        div.style.width = "200px";
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.justifyContent = "space-between";
        div.style.backgroundColor = "#2c3e50"; 
        div.style.color = "white"; 
        div.innerHTML = `
            <div style="text-align: center; margin-bottom: 8px; flex-shrink: 0;">
                <img src="${item.icona}" style="width: 120px; height: 120px; min-width: 120px; min-height: 120px; object-fit: contain;" onerror="this.style.display='none'">
            </div>
            <div style="font-weight: bold; color: #3498db; text-align: center; font-size: 16px;">${item.nome}</div>
            <div style="font-size: 13px; margin: 10px 0; color: #ddd; text-align: center; flex-grow: 1;">${item.descrizione}</div>
            <button class="btn-scegli" style="background-color: #3498db; width: 100%; margin-top: auto;">PRENDI</button>
        `;
        div.onclick = () => selezionaItemEvento(item);
        contenitoreOpzioni.appendChild(div);
    });
    
    cambiaSchermata("schermata-mappa", "schermata-evento-item");
}

function selezionaItemEvento(item) {
    // Aggiungiamo l'oggetto allo zaino globale
    zaino.push(item);
    document.getElementById("console-log").innerHTML = `🎁 Hai trovato: ${item.nome}! Aggiunto allo zaino.`;
    
    // Torna alla mappa e riavanza
    cambiaSchermata("schermata-evento-item", "schermata-mappa");
    aggiornaSquadraMappa();
    generaMappaAlbero();
}

function saltaEventoItem() {
    cambiaSchermata("schermata-evento-item", "schermata-mappa");
    aggiornaSquadraMappa();
    generaMappaAlbero();
}

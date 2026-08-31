// ==========================================================
// eventi.js \u2014 Gestione eventi speciali della mappa
// Estratto da script.js (righe 1820-2014)
// Dipendenze: stato.js, pokemon_factory.js, schermate.js
// ==========================================================

// ================= EVENTO POKEBALL =================

// Apre la schermata di selezione Pok\u{00e9ba}ll (3 opzioni casuali)
function generaOpzioniPokeball() {
    cambiaSchermata("schermata-mappa", "schermata-selezione");
    
    let btnTornaLobby = document.getElementById("btn-torna-lobby");
    if (btnTornaLobby) btnTornaLobby.style.display = "none";
    
    let titolo = document.getElementById("titolo-selezione");
    if (titolo) titolo.innerText = "Una Pok\u{00e9ba}ll! Scegli chi unire alla squadra o prosegui.";
    
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

// Avvia la schermata dello scambio Pok\u00e9mon (mostra la squadra selezionabile)
function avviaEventoScambio() {
    document.getElementById("scambio-fase-selezione").style.display = "flex";
    document.getElementById("scambio-fase-risultato").style.display = "none";

    let contenitoreSquadra = document.getElementById("scambio-squadra-list");
    contenitoreSquadra.innerHTML = "";

    miaSquadra.forEach((p, index) => {
        let scheda = document.createElement("div");
        let lvlMossa = p.livelloMossa || 1;
        let nomeMossa = getNomeMossaAttuale(p);

        scheda.className = "scheda-disco-pokemon";
        scheda.style.backgroundColor = p.colore || "#ffffff";
        scheda.style.flexShrink = "0";
        scheda.style.minWidth = "180px";
        scheda.style.maxWidth = "220px";
        scheda.style.cursor = "pointer";

        scheda.onclick = () => eseguiScambioDiretto(index);
        
        scheda.innerHTML = `
            <img src="${p.immagine}" alt="${p.nome}" style="width:100%; max-height: 120px; object-fit: contain; border-radius:5px; margin-bottom:10px;">
            <div style="font-size:13px; text-align:left; color:#333; line-height: 1.4; padding: 5px; width: 100%; box-sizing: border-box;">
                <strong>${p.nome}</strong><br>
                Elemento: ${getHtmlElemento(p.elemento)}<br>
                Lvl: ${p.livello} | HP: ${p.hpAttuali}/${p.hpMax}<br>
                ATK: ${p.atk} DEF: ${p.def}<br>
                VEL: ${p.vel}<br>
                SP.ATK: ${p.atkSpec} SP.DEF: ${p.defSpec}<br>
                <div style="margin-top:8px; padding:4px; background:rgba(0,0,0,0.1); border-radius:3px; text-align:center; word-wrap: break-word;">
                    ${nomeMossa} (Lvl ${lvlMossa})
                </div>
            </div>
        `;
        contenitoreSquadra.appendChild(scheda);
    });

    document.getElementById("schermata-scambio").style.display = "flex";
}

// Variabile globale nel file per tracciare il pok\u00e9mon ottenuto dallo scambio
let _ultimoScambiato = null;

// Esegue il cambio diretto: rimuove il Pok\u00e9mon scelto e aggiunge uno casuale di livello superiore
function eseguiScambioDiretto(indexDaScambiare) {
    let vecchioPkm = miaSquadra[indexDaScambiare];

    // Restituisci gli oggetti equipaggiati allo zaino
    if (vecchioPkm.oggetti && vecchioPkm.oggetti.length > 0) {
        vecchioPkm.oggetti.forEach(ogg => {
            if (typeof aggiungiAZaino === "function" && ogg.id) {
                aggiungiAZaino(ogg.id);
            } else if (typeof aggiungiAZaino === "function" && ogg.dbId) {
                aggiungiAZaino(ogg.dbId);
            } else {
                zaino.push(ogg);
            }
        });
    }

    let bonusLivelli = 2; // Il nuovo Pokmon riceve +2 livelli rispetto a quello ceduto
    let nuovoLivello = Math.min(100, vecchioPkm.livello + bonusLivelli);

    let nuovoInfoBase = pescaPokemonCasuale([vecchioPkm.nome]); 
    let mossaLvl = calcolaLivelloEMossaMappa(pianoAttuale).livelloMossa;
    let nuovoPkm = creaPokemon(nuovoInfoBase, nuovoLivello, mossaLvl);

    miaSquadra[indexDaScambiare] = nuovoPkm;
    _ultimoScambiato = nuovoPkm; // Salva per check perk in chiusura

    document.getElementById("scambio-fase-selezione").style.display = "none";
    document.getElementById("scambio-fase-risultato").style.display = "flex";
    document.getElementById("testo-risultato-scambio").innerHTML = `Hai scambiato ${vecchioPkm.nome} (Lvl ${vecchioPkm.livello}) per un <strong>${nuovoPkm.nome} (Lvl ${nuovoPkm.livello})</strong>!`;

    let contenitoreCard = document.getElementById("card-nuovo-pokemon");
    let lvlMossa = nuovoPkm.livelloMossa || 1;
    let nomeMossa = getNomeMossaAttuale(nuovoPkm);

    contenitoreCard.innerHTML = `
        <div class="scheda-disco-pokemon" style="background-color: ${nuovoPkm.colore || '#ffffff'}; flex-shrink: 0; min-width: 180px; max-width: 220px; cursor: default;">
            <img src="${nuovoPkm.immagine}" alt="${nuovoPkm.nome}" style="width:100%; max-height: 120px; object-fit: contain; border-radius:5px; margin-bottom:10px;">
            <div style="font-size:13px; text-align:left; color:#333; line-height: 1.4; padding: 5px; width: 100%; box-sizing: border-box;">
                <strong>${nuovoPkm.nome}</strong> <br>
                Elemento: ${getHtmlElemento(nuovoPkm.elemento)}<br>
                Lvl: ${nuovoPkm.livello} | HP: ${nuovoPkm.hpAttuali}/${nuovoPkm.hpMax}<br>
                ATK: ${nuovoPkm.atk} DEF: ${nuovoPkm.def}<br>
                VEL: ${nuovoPkm.vel}<br>
                SP.ATK: ${nuovoPkm.atkSpec} SP.DEF: ${nuovoPkm.defSpec}<br>
                <div style="margin-top:8px; padding:4px; background:rgba(0,0,0,0.1); border-radius:3px; text-align:center; word-wrap: break-word;">
                    ${nomeMossa} (Lvl ${lvlMossa})
                </div>
            </div>
        </div>
    `;
}

// Annulla lo scambio e torna alla mappa sbloccando i nodi successivi
function annullaScambio() {
    document.getElementById("schermata-scambio").style.display = "none";
    generaMappaAlbero();
}

// Chiude la schermata di scambio dopo aver confermato
// Se il nuovo Pok\u00e9mon ha superato un level cap, avvia la selezione perk prima di tornare alla mappa.
function chiudiEventoScambio() {
    // Trova il Pok\u00e9mon appena aggiunto (l'ultimo modificato nella squadra).
    // La funzione eseguiScambioDiretto salva il riferimento in _ultimoScambiato.
    const nuovoPkm = _ultimoScambiato;
    _ultimoScambiato = null;

    // Callback finale: chiude lo scambio e aggiorna la mappa
    const tornaAMappa = () => {
        document.getElementById("schermata-scambio").style.display = "none";
        aggiornaSquadraMappa();
        generaMappaAlbero();
    };

    if (nuovoPkm) {
        // Controlla se il nuovo Pok\u00e9mon supera un level cap \u2192 mostra perk se necessario
        verificaPerkDopoEvento(nuovoPkm, tornaAMappa);
    } else {
        tornaAMappa();
    }
}

// ================= EVENTO MISTERIOSO =================

// Avvia un evento misterioso: pesca uno tra quelli abilitati per la mappa corrente
function avviaEventoMisterioso() {
    try {
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
        
        // Reset UI
        const scelteContainer = document.getElementById("mistero-scelte-container");
        const esitoTesto = document.getElementById("mistero-esitotesto");
        const btnContinua = document.getElementById("btn-mistero-continua");
        
        scelteContainer.innerHTML = "";
        esitoTesto.style.display = "none";
        btnContinua.style.display = "none";
        scelteContainer.style.display = "flex";
        
        if (eventoEstratto.scelte && eventoEstratto.scelte.length > 0) {
            eventoEstratto.scelte.forEach((scelta, index) => {
                const btn = document.createElement("button");
                btn.className = "btn-battle";
                btn.style.backgroundColor = "#2c3e50";
                btn.style.color = "white";
                btn.innerText = scelta.testo;
                btn.onclick = () => {
                    // Esegui azione e nascondi pulsanti
                    scelteContainer.style.display = "none";
                    if (scelta.azione) {
                        try {
                            scelta.azione();
                        } catch (err) {
                            console.error("Errore nell'azione scelta evento misterioso:", err);
                            monete += 10;
                            if (typeof aggiornaStatisticheHeader === 'function') aggiornaStatisticheHeader();
                            mostraEsitoMistero("C'è stato un errore imprevisto durante l'evento! Vieni ricompensato con 10 monete per il disagio.");
                        }
                    }
                };
                scelteContainer.appendChild(btn);
            });
        } else {
            // Fallback per vecchi eventi senza scelte
            if (eventoEstratto.azione) {
                try {
                    eventoEstratto.azione();
                    mostraEsitoMistero("Evento completato.");
                } catch (err) {
                    console.error("Errore nell'azione evento misterioso:", err);
                    monete += 10;
                    if (typeof aggiornaStatisticheHeader === 'function') aggiornaStatisticheHeader();
                    mostraEsitoMistero("C'è stato un errore imprevisto durante l'evento! Vieni ricompensato con 10 monete per il disagio.");
                }
            } else {
                mostraEsitoMistero("Evento completato.");
            }
        }
        
        cambiaSchermata("schermata-mappa", "schermata-mistero");
    } catch (err) {
        console.error("Errore critico in avviaEventoMisterioso:", err);
        const scelteContainer = document.getElementById("mistero-scelte-container");
        if (scelteContainer) scelteContainer.style.display = "none";
        
        document.getElementById("mistero-titolo-evento").innerText = "ERRORE DI SISTEMA";
        document.getElementById("mistero-descrizione").innerText = "Un glitch imprevisto ha interrotto l'evento misterioso.";
        
        monete += 10;
        if (typeof aggiornaStatisticheHeader === 'function') aggiornaStatisticheHeader();
        
        mostraEsitoMistero("C'è stato un errore imprevisto! Vieni ricompensato con 10 monete per il disagio.");
        cambiaSchermata("schermata-mappa", "schermata-mistero");
    }
}

function mostraEsitoMistero(testo, isFight = false, fightCallback = null) {
    const esitoTesto = document.getElementById("mistero-esitotesto");
    const btnContinua = document.getElementById("btn-mistero-continua");
    
    esitoTesto.innerText = testo;
    esitoTesto.style.display = "block";
    esitoTesto.style.backgroundColor = isFight ? "#e74c3c" : "#2ecc71";
    
    btnContinua.style.display = "block";
    
    if (isFight && fightCallback) {
        btnContinua.innerText = "Affronta il Nemico!";
        btnContinua.style.backgroundColor = "#e74c3c";
        btnContinua.onclick = () => {
            document.getElementById("schermata-mistero").style.display = "none";
            fightCallback();
        };
    } else {
        btnContinua.innerText = "Continua il Cammino";
        btnContinua.style.backgroundColor = "#9b59b6";
        btnContinua.onclick = chiudiEventoMistero;
    }
}

// Funzione generica per selezionare un bersaglio
function apriModaleBersaglio(titolo, callbackConIndice) {
    const modal = document.getElementById("modal-selezione-bersaglio");
    const titoloEl = document.getElementById("bersaglio-titolo");
    const container = document.getElementById("bersaglio-squadra-container");
    
    titoloEl.innerText = titolo;
    container.innerHTML = "";
    
    miaSquadra.forEach((pg, i) => {
        if (!pg) return;
        const btn = document.createElement("div");
        btn.style.background = "#34495e";
        btn.style.border = "2px solid #95a5a6";
        btn.style.borderRadius = "8px";
        btn.style.padding = "10px";
        btn.style.cursor = "pointer";
        btn.style.color = "white";
        btn.style.textAlign = "center";
        btn.style.minWidth = "120px";
        
        btn.innerHTML = `<img src="${pg.iconaChibi || pg.immagine}" style="width:60px; height:60px; object-fit:contain;"><br><b>${pg.nome}</b><br>Lv.${pg.livello}`;
        
        btn.onclick = () => {
            modal.style.display = "none";
            callbackConIndice(i);
        };
        
        container.appendChild(btn);
    });
    
    modal.style.display = "flex";
}

function avviaIncontroMiniBossOAllenatoreCasuale() {
    avviaIncontroAllenatore();
}

function avviaIncontroAllenatore() {
    document.getElementById("schermata-mistero").style.display = "none";
    cambiaSchermata("schermata-mistero", "schermata-gioco");
    document.getElementById("titolo-incontro").innerText = `ALLARME SCATTATO\n-- PIANO ${pianoAttuale} --`;
    preparaIncontroBattaglia("npc");
}

function avviaIncontroMiniBossElitè() {
    document.getElementById("schermata-mistero").style.display = "none";
    cambiaSchermata("schermata-mistero", "schermata-gioco");
    document.getElementById("titolo-incontro").innerText = `SCONTRO ELITÉ\n-- PIANO ${pianoAttuale} --`;
    
    // Configura un miniboss elitè
    let baseLvl = calcolaLivelloEMossaMappa(pianoAttuale, "miniboss").livello;
    let baseMossa = calcolaLivelloEMossaMappa(pianoAttuale, "miniboss").livelloMossa;
    
    // Usa il nome esatto dal DB (MAX F2 \u00e8 in maiuscolo nel database)
    // L'overpotenziamento avviene dopo preparaIncontroBattaglia
    
    // Hack: facciamo spawnare un boss invece per questo scontro, gestito tramite un override
    preparaIncontroBattaglia("miniboss");
    nemicoPokemon.hpMax = Math.round(nemicoPokemon.hpMax * 1.5);
    nemicoPokemon.hpAttuali = nemicoPokemon.hpMax;
    nemicoPokemon.atk += 2;
    nemicoPokemon.def += 2;
    nemicoPokemon.isElite = true; // Per raddoppiare l'oro a fine fight
    aggiornaGrafica();
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
    // Il giocatore può sempre prendere l'oggetto, finirà nello zaino.
    
    // Aggiungiamo l'oggetto allo zaino globale usando il suo ID
    if (item.id) {
        aggiungiAZaino(item.id, 1);
    } else {
        zaino.push({ dbId: item.id || item.nome, quantita: 1 });
    }
    document.getElementById("console-log").innerHTML = `\u{1f381} Hai trovato: ${item.nome}! Aggiunto allo zaino.`;
    
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

// Aggiunge un buff/debuff permanente (indicato come temporaneo negli eventi) a un pokemon
window.aggiungiBuffTemporaneoNextFight = function(idUnico, statKey, amount) {
    if (typeof miaSquadra === 'undefined') return;
    let p = miaSquadra.find(x => x && x.idUnico === idUnico);
    if (!p) {
        p = miaSquadra[0]; // fallback se id non corrisponde
        if (!p) return;
    }
    
    // Mappa le chiavi ('spd' -> 'vel', 'spa' -> 'atkSpec', ecc.)
    let keyMap = {
        'spd': 'vel',
        'spa': 'atkSpec',
        'atk': 'atk',
        'def': 'def'
    };
    let realKey = keyMap[statKey] || statKey;
    
    if (typeof p[realKey] !== 'undefined') {
        let oldVal = p[realKey];
        p[realKey] = Math.max(1, Math.round(p[realKey] * (1 + amount)));
        console.log(`[Buff Mistero] ${realKey} modificata da ${oldVal} a ${p[realKey]} (${Math.round(amount * 100)}%)`);
    }
};

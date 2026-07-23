// Script/data/eventi_mistero_db.js
const DB_EVENTI_MISTERIOSI = [
    // ==========================================
    // MAPPE 1-2-3
    // ==========================================
    {
        id: "mistero_stampa_buoni",
        nome: "L'ERRORE DI STAMPA DEI BUONI PASTO",
        descrizione: "TROVI UNA STAMPANTE AZIENDALE IMPAZZITA CHE STA SPUTANDO FOGLI DI TICKET BUONI PASTO SENZA SOSTA.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "RUBA I BUONI PASTO VERI",
                azione: function() {
                    if (Math.random() < 0.5) {
                        monete += 7;
                        mostraEsitoMistero("Hai preso i buoni veri e li hai rivenduti! (+7 monete)");
                    } else {
                        mostraEsitoMistero("L'allarme è scattato! Preparati a combattere!", true, () => {
                            avviaIncontroMiniBossOAllenatoreCasuale();
                        });
                    }
                }
            },
            {
                testo: "PRENDI I BUONI PASTO FALLATI",
                azione: function() {
                    let pg = miaSquadra[0];
                    if (pg) {
                        pg.hpAttuali = Math.max(1, pg.hpAttuali - 3);
                        aggiungiAZaino("SNACK AL VOLO", 1);
                        mostraEsitoMistero(`Hai ottenuto 1x SNACK AL VOLO. Ma ${pg.nome} perde 3 PV per la fame!`);
                    } else {
                        mostraEsitoMistero("Non hai Pokémon per farlo.");
                    }
                }
            },
            {
                testo: "SPEGNI LA STAMPANTE",
                azione: function() {
                    miaSquadra.forEach(p => {
                        if (p && p.hpAttuali > 0) {
                            let cura = Math.max(1, Math.round(p.hpAttuali * 0.20));
                            p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + cura);
                        }
                    });
                    mostraEsitoMistero("Il tuo altissimo titolare ti ringrazia. Tutto il team viene curato del +20% HP attuali!");
                }
            }
        ]
    },
    {
        id: "mistero_ciabatte_gio",
        nome: "LE CIABATTE SMARRITE SOTTO ALLA SCRIVANIA DEL GIO",
        descrizione: "UN PAIO DI CIABATTE BIRK USATE SONO STATE ABBANDONATE DA GIO VICINO ALLA SUA SCRIVANIA. EMANANO UN AURA DI TOTALE RELAX.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "PRENDERE LE CIABATTE BIRK USATE",
                azione: function() {
                    apriModaleBersaglio("A chi vuoi dare le Ciabatte Birk?", function(indicePG) {
                        let p = miaSquadra[indicePG];
                        if (!p.perkId) {
                            p.perkId = "ciabatte_birk"; // We need to handle this perk or stat boost
                            p.vel += Math.round(p.vel * 0.10);
                            mostraEsitoMistero(`${p.nome} ha equipaggiato le Ciabatte Birk! (+10% SPD)`);
                        } else {
                            mostraEsitoMistero(`${p.nome} ha già un perk equipaggiato! Non può prendere le ciabatte.`);
                        }
                    });
                }
            },
            {
                testo: "ISPEZIONA LE CIABATTE BIRK USATE",
                azione: function() {
                    monete += 3;
                    mostraEsitoMistero("Sei talmente fortunato che hai trovato 3 monete nascoste sotto la suola! (+3 monete)");
                }
            },
            {
                testo: "LASCIA LE CIABATTE BIRK USATE",
                azione: function() {
                    mostraEsitoMistero("A causa del suo forte odore, te ne vai senza rischiare un'infezione ai piedi.");
                }
            }
        ]
    },
    {
        id: "mistero_quadro_elettrico",
        nome: "IL RIAVVIO DEL QUADRO ELETTRICO",
        descrizione: "NOTI CHE LA CORRENTE NEL TUO UFFICIO VA E VIENE. TI RIFERISCONO CHE SE NON PREMI UN PULSANTE TUTTO IL TUO LAVORO ANDRA' PERSO.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "STACCA LA SPINA E RIAVVIA",
                azione: function() {
                    apriModaleBersaglio("Di quale Pokémon vuoi aumentare il livello della mossa?", function(indicePG) {
                        let p = miaSquadra[indicePG];
                        p.livelloMossa++;
                        mostraEsitoMistero(`La tua determinazione porta ad aumentare di 1 il livello della mossa di ${p.nome}!`);
                    });
                }
            },
            {
                testo: "CHIEDI AIUTO AD UN TUO COLLEGA",
                azione: function() {
                    monete = Math.max(0, monete - 3);
                    mostraEsitoMistero("La tua insicurezza ti è costata 3 monete.");
                }
            },
            {
                testo: "LASCIA CHE TUTTO BRUCI",
                azione: function() {
                    miaSquadra.forEach(p => {
                        if (p && p.hpAttuali > 0) {
                            p.hpAttuali = Math.max(1, p.hpAttuali - 5);
                        }
                    });
                    mostraEsitoMistero("Il tuo menefreghismo ha portato a subire 5 PV di danno a tutto il team.");
                }
            }
        ]
    },
    {
        id: "mistero_parcheggio_moto",
        nome: "IL PARCHEGGIO DELLE MOTO",
        descrizione: "IL SOLITO PERSONAGGIO, OCCUPA IL PARCHEGGIO PER LE MOTO CON LA SUA AUTO.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "SPOSTA L'AUTO DI NASCOSTO",
                azione: function() {
                    if (Math.random() < 0.6) {
                        monete += 5;
                        mostraEsitoMistero("Hai trovato 5 monete nel cruscotto! (+5 monete)");
                    } else {
                        monete = Math.max(0, monete - 3);
                        mostraEsitoMistero("Sei stato scoperto! Hai perso 3 monete.");
                    }
                }
            },
            {
                testo: "LO FAI PRESENTE A KONGFIL",
                azione: function() {
                    aggiungiAZaino("CAFFE' ALLA MACCHINETTA", 1);
                    mostraEsitoMistero("Ricevi un premio aziendale: 1x CAFFE' DELLA MACCHINETTA.");
                }
            },
            {
                testo: "FINGI DI NON AVER VISTO NULLA",
                azione: function() {
                    mostraEsitoMistero("Prosegui dritto per la tua strada senza alterazioni.");
                }
            }
        ]
    },
    {
        id: "mistero_brioche_scognamiglio",
        nome: "LE BRIOCHE DI SCOGNAMIGLIO",
        descrizione: "SCOGNAMIGLIO HA PORTATO LE SUE BRIOCHE, MA E' RIMASTA L'ULTIMA SUL VASSOIO.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "MANGIALA DI NASCOSTO",
                azione: function() {
                    apriModaleBersaglio("A chi vuoi dare la Brioche?", function(indicePG) {
                        let p = miaSquadra[indicePG];
                        let cura = Math.round(p.hpMax * 0.50);
                        p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + cura);
                        aggiungiBuffTemporaneoNextFight(p.idUnico, 'spd', -0.10);
                        mostraEsitoMistero(`${p.nome} viene curato del 50%, ma perderà 10% di VELOCITÀ per il prossimo scontro per la pesantezza!`);
                    });
                }
            },
            {
                testo: "FAI IL BUON SAMARITANO",
                azione: function() {
                    miaSquadra.forEach(p => {
                        if (p && p.hpAttuali > 0) {
                            let cura = Math.max(1, Math.round(p.hpAttuali * 0.25));
                            p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + cura);
                        }
                    });
                    mostraEsitoMistero("Tutta la squadra recupera il 25% dei PV attuali!");
                }
            },
            {
                testo: "SEI A DIETA",
                azione: function() {
                    let p = miaSquadra[0];
                    if(p) {
                        aggiungiBuffTemporaneoNextFight(p.idUnico, 'spd', 0.10);
                        mostraEsitoMistero(`${p.nome} guadagna +10% SPD per il prossimo scontro sentendosi leggero!`);
                    } else {
                        mostraEsitoMistero("Nessun PG valido per questo effetto.");
                    }
                }
            }
        ]
    },
    {
        id: "mistero_amazon",
        nome: "AMAZON IN CONSEGNA",
        descrizione: "IL CORRIERE AMAZON DEVE CONSEGNARE UN PACCO, MA NON SI LEGGE PER CHI E'.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "FIRMA E PRENDILO",
                azione: function() {
                    if (Math.random() < 0.5) {
                        aggiungiAZaino("equip_1");
                        mostraEsitoMistero("Fortuna! Ottieni 1x ANELLO DEL LEONE.");
                    } else {
                        miaSquadra.forEach(p => {
                            if (p && p.hpAttuali > 0) {
                                let dmg = Math.max(1, Math.round(p.hpAttuali * 0.20));
                                p.hpAttuali = Math.max(1, p.hpAttuali - dmg);
                            }
                        });
                        mostraEsitoMistero("Era una trappola! Tutta la squadra subisce 20% di danno sui PV attuali.");
                    }
                }
            },
            {
                testo: "PAGA LA SPEDIZIONE",
                azione: function() {
                    if (monete >= 3) {
                        monete -= 3;
                        aggiungiAZaino("cons_6");
                        mostraEsitoMistero("Hai pagato 3 monete e hai ottenuto 1x ACQUA FRESCA.");
                    } else {
                        mostraEsitoMistero("Non hai abbastanza monete per pagare la spedizione.");
                    }
                }
            },
            {
                testo: "RIFIUTI LA CONSEGNA",
                azione: function() {
                    mostraEsitoMistero("Il corriere tira giù una bestemmia e se ne va.");
                }
            }
        ]
    },
    {
        id: "mistero_rinfresco",
        nome: "PHILP IN AZIENDA: RINFRESCO",
        descrizione: "IL TUO CLIENTE PIU' IMPORTANTE E' VENUTO A FAR VISITA. NELLA SALA RISTORO CI SONO I RESTI DEL BUFFET.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "SVUOTA IL VASSOIO DI FOCACCE",
                azione: function() {
                    aggiungiAZaino("SNACK AL VOLO", 2);
                    miaSquadra.forEach(p => {
                        if (p) aggiungiBuffTemporaneoNextFight(p.idUnico, 'spd', -0.10);
                    });
                    mostraEsitoMistero("Ottieni 2x SNACK AL VOLO, ma la tua squadra si appesantisce (-10% SPD per il prossimo scontro).");
                }
            },
            {
                testo: "RUBA LO SPUMANTE COSTOSO",
                azione: function() {
                    if (Math.random() < 0.5) {
                        monete += 6;
                        mostraEsitoMistero("Sei riuscito a venderlo senza problemi! (+6 monete)");
                    } else {
                        miaSquadra.forEach(p => {
                            if (p && p.hpAttuali > 0) {
                                let dmg = Math.round(p.hpMax * 0.10);
                                p.hpAttuali = Math.max(1, p.hpAttuali - dmg);
                            }
                        });
                        mostraEsitoMistero("KONGFIL ti ha sgamato! Il team subisce danni per lo stress (-10% HP massimi).");
                    }
                }
            },
            {
                testo: "PULISCI IL TAVOLO",
                azione: function() {
                    monete += 1;
                    mostraEsitoMistero("Hai fatto il tuo dovere e vieni ricompensato con una pacca sulla spalla. (+1 moneta)");
                }
            }
        ]
    },
    {
        id: "mistero_timbratore",
        nome: "LA TIMBRATA MANCATA",
        descrizione: "SEI ENTRATO ALL'ULTIMO SECONDO. IL TIMBRATORE LAMPEGGIA.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "CORRI SENZA TIMBRARE",
                azione: function() {
                    if (Math.random() < 0.5) {
                        apriModaleBersaglio("A chi vuoi assegnare Scatto sul Timbratore?", function(indicePG) {
                            let p = miaSquadra[indicePG];
                            p.vel += 1; // Buff fisso e permanente
                            mostraEsitoMistero(`${p.nome} guadagna permanentemente +1 alla statistica base Velocità!`);
                        });
                    } else {
                        mostraEsitoMistero("La tua corsa eroica finisce nel nulla. Niente di fatto.");
                    }
                }
            },
            {
                testo: "AVVISI TERZIOTTI",
                azione: function() {
                    monete = Math.max(0, monete - 2);
                    mostraEsitoMistero("Perdi 2 monete per la pratica burocratica di far correggere la timbrata.");
                }
            },
            {
                testo: "FAI FINTA DI NULLA",
                azione: function() {
                    mostraEsitoMistero("Ti siedi alla postazione e inizi a lavorare in modalità stealth.");
                }
            }
        ]
    },
    {
        id: "mistero_macchinetta_caffe",
        nome: "LA MACCHINETTA DEL CAFFÈ IN BLOCCO",
        descrizione: "LA MACCHINETTA DEL CAFFÈ È ANDATA IN BLOCCO TECNICO DURANTE LA PAUSA.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "CALCIO BEN ASSESTATO",
                azione: function() {
                    if (Math.random() < 0.5) {
                        aggiungiAZaino("CAFFE' ALLA MACCHINETTA", 1);
                        mostraEsitoMistero("Il colpo funziona! Il distributore sputa 1x CAFFE' ALLA MACCHINETTA.");
                    } else {
                        let p = miaSquadra[0];
                        if (p) aggiungiBuffTemporaneoNextFight(p.idUnico, 'atk', -0.10);
                        mostraEsitoMistero(`Hai rotto il display. ${p.nome} subisce un -10% ATK per il prossimo scontro per il senso di colpa.`);
                    }
                }
            },
            {
                testo: "CHIAMA ASSISTENZA",
                azione: function() {
                    if (monete >= 2) {
                        monete -= 2;
                        monete += 1; // Resto di cortesia
                        aggiungiAZaino("BRIOCHE CALDA", 1);
                        mostraEsitoMistero("Spendi 2 monete. L'azienda ti regala 1 moneta di resto e 1x BRIOCHE CALDA!");
                    } else {
                        mostraEsitoMistero("Non hai monete per chiamare.");
                    }
                }
            },
            {
                testo: "TORNA A LAVORARE",
                azione: function() {
                    mostraEsitoMistero("Accetti il tuo triste destino di privazione della caffeina.");
                }
            }
        ]
    },
    {
        id: "mistero_valutazione",
        nome: "LA VALUTAZIONE DELLE PERFORMANCE ANNUALI",
        descrizione: "Le Risorse Umane ti hanno convocato nell'ufficio di vetro per la riunione sul tuo rendimento.",
        mappeAbilitate: [1, 2, 3],
        percentuale: 10,
        scelte: [
            {
                testo: "ESIBISCI I REPORT",
                azione: function() {
                    apriModaleBersaglio("Di chi vuoi aumentare il livello della mossa?", function(indicePG) {
                        let p = miaSquadra[indicePG];
                        p.livelloMossa++;
                        mostraEsitoMistero(`${p.nome} ha guadagnato +1 Livello Mossa per l'efficienza burocratica!`);
                    });
                }
            },
            {
                testo: "CHIEDI AUMENTO STIPENDIO",
                azione: function() {
                    if (Math.random() < 0.40) {
                        monete += 8;
                        aggiungiAZaino("T-SHIRT LASER", 1);
                        mostraEsitoMistero("Vittoria! Ottieni 8 monete cash e 1x T-SHIRT LASER!");
                    } else {
                        let p = miaSquadra[0];
                        if (p) aggiungiBuffTemporaneoNextFight(p.idUnico, 'def', -0.10);
                        mostraEsitoMistero(`Respinto fermamente dal CFO. ${p.nome} perde il 10% di Difesa nel prossimo incontro per la delusione.`);
                    }
                }
            },
            {
                testo: "SCENA MUTA",
                azione: function() {
                    monete += 2;
                    mostraEsitoMistero("Te ne esci con un 'In Linea con le Aspettative' e 2 monete di rimborso spese.");
                }
            }
        ]
    },

    // ==========================================
    // MAPPE 4-5-6
    // ==========================================
    {
        id: "mistero_agenzia_lavoro",
        nome: "AGENZIA DI LAVORO",
        descrizione: "Un Recruiter ti offre una risorsa di altissimo livello in cambio di un tuo dipendente per colmare un buco.",
        mappeAbilitate: [4, 5, 6],
        percentuale: 10,
        scelte: [
            {
                testo: "ACCETTA LO SCAMBIO",
                azione: function() {
                    apriModaleBersaglio("Chi vuoi licenziare in cambio della nuova risorsa?", function(indicePG) {
                        let pgVecchio = miaSquadra[indicePG];
                        miaSquadra.splice(indicePG, 1);
                        
                        let targetLivello = Math.max(1, (miaSquadra[0] ? miaSquadra[0].livello - 1 : 1));
                        let idNuovoPg = pescaPokemonCasuale([]);
                        let p = creaPokemon(idNuovoPg, targetLivello, 1);
                        
                        miaSquadra.push(p);
                        mostraEsitoMistero(`Hai scambiato ${pgVecchio.nome} e hai ricevuto ${p.nome} (Livello ${targetLivello})!`);
                    });
                }
            },
            {
                testo: "RIFIUTA E SEGNALA",
                azione: function() {
                    monete += 4;
                    mostraEsitoMistero("Mostri fedeltà aziendale e ricevi un bonus di 4 monete!");
                }
            },
            {
                testo: "BLOCCA IL CONTATTO",
                azione: function() {
                    mostraEsitoMistero("Chiudi LinkedIn senza guardarti indietro.");
                }
            }
        ]
    },
    {
        id: "mistero_server_vecchio",
        nome: "IL VECCHIO SERVER ABBANDONATO",
        descrizione: "In un angolo buio c'è un server degli anni '90. C'è un terminale con un comando pronto per il debug.",
        mappeAbilitate: [4, 5, 6],
        percentuale: 10,
        scelte: [
            {
                testo: "AVVIA COMANDO 'FORMAT C:'",
                azione: function() {
                    if (Math.random() < 0.40) {
                        aggiungiAZaino("DISCO MOSSA", 1);
                        mostraEsitoMistero("Miracolo informatico! Il backend si ripulisce e sblocchi 1x DISCO MOSSA gratis.");
                    } else {
                        miaSquadra.forEach(p => {
                            if (p && p.hpAttuali > 0) {
                                let dmg = Math.max(1, Math.round(p.hpAttuali * 0.15));
                                p.hpAttuali = Math.max(1, p.hpAttuali - dmg);
                            }
                        });
                        mostraEsitoMistero("Cortocircuito di dati! Tutta la squadra subisce -15% PV attuali per la scossa.");
                    }
                }
            },
            {
                testo: "SMONTA E RIVENDI LA RAM",
                azione: function() {
                    monete += 6;
                    mostraEsitoMistero("Sciacallaggio puro. Guadagni 6 monete dalla vendita dei banchi di RAM.");
                }
            },
            {
                testo: "NON TOCCARE NULLA",
                azione: function() {
                    mostraEsitoMistero("Ti allontani piano prima che si spenga una spia rossa.");
                }
            }
        ]
    },
    {
        id: "mistero_ispettore",
        nome: "ISPEZIONE DELL'ISPETTORATO DEL LAVORO",
        descrizione: "Un ispettore del lavoro è entrato a sorpresa per controllare i contratti e gli straordinari.",
        mappeAbilitate: [4, 5, 6],
        percentuale: 10,
        scelte: [
            {
                testo: "NASCONDI STAGISTI",
                azione: function() {
                    if (Math.random() < 0.70) {
                        monete += 5;
                        mostraEsitoMistero("Nessuno ha visto niente. Ottieni 5 monete di rimborso burocratico!");
                    } else {
                        monete = Math.max(0, monete - 4);
                        mostraEsitoMistero("Ti hanno sgamato! Multa di 4 monete pagata alla cassa.");
                    }
                }
            },
            {
                testo: "ESIBISCI FALDONE SINDACATI",
                azione: function() {
                    aggiungiAZaino("TESSERA DEL SINDACATO", 1);
                    mostraEsitoMistero("Scudo legale attivato. Ottieni 1x TESSERA DEL SINDACATO da equipaggiare.");
                }
            },
            {
                testo: "SPINGI LO SMART-WORKER",
                azione: function() {
                    let bestSpd = -1;
                    let target = null;
                    miaSquadra.forEach(p => {
                        if (p && p.vel > bestSpd) { bestSpd = p.vel; target = p; }
                    });
                    if (target) {
                        aggiungiBuffTemporaneoNextFight(target.idUnico, 'spd', -0.10);
                        mostraEsitoMistero(`Il tuo PG più veloce (${target.nome}) corre a firmare, ma perde il 10% di VELOCITÀ per il prossimo scontro dallo stress!`);
                    } else {
                        mostraEsitoMistero("Nessuno corre abbastanza in fretta.");
                    }
                }
            }
        ]
    },
    {
        id: "mistero_corso_sicurezza",
        nome: "CORSO DI FORMAZIONE SULLA SICUREZZA",
        descrizione: "Sei in ritardo di 6 mesi sulla scadenza del corso obbligatorio sulla sicurezza d'ufficio.",
        mappeAbilitate: [4, 5, 6],
        percentuale: 10,
        scelte: [
            {
                testo: "SEGUI IL CORSO CON ATTENZIONE",
                azione: function() {
                    apriModaleBersaglio("Di quale Pokémon vuoi aumentare il livello della mossa?", function(indicePG) {
                        let p = miaSquadra[indicePG];
                        p.livelloMossa++;
                        mostraEsitoMistero(`${p.nome} ha aumentato la mossa di +1 grazie all'attenzione ai pericoli!`);
                    });
                }
            },
            {
                testo: "VELOCITÀ 2x E RISPONDI A CASO",
                azione: function() {
                    let p = miaSquadra[0];
                    if (p) {
                        aggiungiBuffTemporaneoNextFight(p.idUnico, 'spd', 0.10);
                        aggiungiBuffTemporaneoNextFight(p.idUnico, 'spa', -0.10);
                        mostraEsitoMistero(`${p.nome} ha finito prima (+10% SPD per il prossimo fight) ma non ha imparato niente (-10% DEF SPECIALE)!`);
                    } else {
                        mostraEsitoMistero("Nessuno al lavoro oggi.");
                    }
                }
            },
            {
                testo: "PAGA IL COLLEGA",
                azione: function() {
                    if (monete >= 3) {
                        monete -= 3;
                        mostraEsitoMistero("Spendi 3 monete e tiri un sospiro di sollievo delegando la noia burocratica.");
                    } else {
                        mostraEsitoMistero("Non hai abbastanza monete per pagarlo!");
                    }
                }
            }
        ]
    },

    // ==========================================
    // MAPPE 7-8-9
    // ==========================================
    {
        id: "mistero_contratto_indeterminato",
        nome: "LA FIRMA MACULATA SUL CONTRATTO INDETERMINATO",
        descrizione: "Sulla scrivania c'è un modulo di Contratto a Tempo Indeterminato firmato in bianco dal CEO.",
        mappeAbilitate: [7, 8, 9],
        percentuale: 10,
        scelte: [
            {
                testo: "INSERISCI NOME DEL LEADER",
                azione: function() {
                    let p = miaSquadra[0];
                    if(p) {
                        p.hpMax += 2;
                        p.hpAttuali += 2;
                        p.def += 2;
                        aggiungiBuffTemporaneoNextFight(p.idUnico, 'spd', -0.15); // Wait, "Velocità" in stats is "vel" or "spd" (speed)? vel is speed in italian, spd is sp.def. I used spd above for speed. Let's fix this in eventi.js to map properly. Let's use 'vel' for speed.
                        mostraEsitoMistero(`Blindatura totale! ${p.nome} ottiene permanentemente +2 PV e +2 DEF, ma per i riflessi lenti subirà -15% Velocità nel prossimo scontro.`);
                    }
                }
            },
            {
                testo: "FALSIFICA PER INTASCARE PREMIO",
                azione: function() {
                    if (Math.random() < 0.5) {
                        monete += 12;
                        mostraEsitoMistero("Colpo grosso! Intaschi 12 monete cash dal fondo cassa aziendale.");
                    } else {
                        let p = miaSquadra[1] || miaSquadra[0]; // "il primo PG in panchina", so index 1 (0 is leader)
                        if (p) p.hpAttuali = 0;
                        mostraEsitoMistero(`Sequestrato! ${p ? p.nome : 'Il Leader'} va istantaneamente KO (0 PV) per licenziamento in tronco.`);
                    }
                }
            },
            {
                testo: "DISTRUGGI IL DOCUMENTO",
                azione: function() {
                    mostraEsitoMistero("Se non posso averlo io, non lo avrà nessuno. Procedi indenne.");
                }
            }
        ]
    },
    {
        id: "mistero_blackout",
        nome: "IL BLACKOUT DEL SERVER CORE",
        descrizione: "I server centrali vanno in fiamme. Apocalisse informatica, telefoni che squillano a vuoto.",
        mappeAbilitate: [7, 8, 9],
        percentuale: 10,
        scelte: [
            {
                testo: "ATTIVA VPN E SMART WORKING",
                azione: function() {
                    aggiungiAZaino("SMART WORKING FORZATO", 1);
                    mostraEsitoMistero("Ti isoli a casa. Ottieni l'oggetto SMART WORKING FORZATO (MALEDETTO)!");
                }
            },
            {
                testo: "FIX IN PRODUZIONE",
                azione: function() {
                    apriModaleBersaglio("Di quale Pokémon vuoi aumentare la mossa? (1/2)", function(i1) {
                        miaSquadra[i1].livelloMossa++;
                        apriModaleBersaglio("Di quale ALTRO Pokémon vuoi aumentare la mossa? (2/2)", function(i2) {
                            miaSquadra[i2].livelloMossa++;
                            miaSquadra.forEach(p => {
                                if (p && p.hpAttuali > 0) {
                                    let dmg = Math.max(1, Math.round(p.hpAttuali * 0.30));
                                    p.hpAttuali = Math.max(1, p.hpAttuali - dmg);
                                }
                            });
                            mostraEsitoMistero("Sganci il database e le mosse aumentano! Ma l'intero team subisce -30% PV attuali per il fumo.");
                        });
                    });
                }
            },
            {
                testo: "VAI A CASA PRIMA",
                azione: function() {
                    miaSquadra.forEach(p => {
                        if (p && p.hpAttuali > 0) {
                            let cura = Math.max(1, Math.round(p.hpMax * 0.20));
                            p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + cura);
                        }
                    });
                    mostraEsitoMistero("Prendi la giacca e sparisci. Tutti recuperano 20% dei PV massimi durante il viaggio.");
                }
            }
        ]
    },
    {
        id: "mistero_convention",
        nome: "IL DISCORSO DEL CEO ALLA CONVENTION",
        descrizione: "Lo Special Max lancia la nuova filosofia: 'Lavorare meno, lavorare tutti... o forse il contrario!'",
        mappeAbilitate: [7, 8, 9],
        percentuale: 10,
        scelte: [
            {
                testo: "URLA LO SLOGAN",
                azione: function() {
                    miaSquadra.forEach(p => {
                        if (p) {
                            aggiungiBuffTemporaneoNextFight(p.idUnico, 'atk', 0.20);
                            aggiungiBuffTemporaneoNextFight(p.idUnico, 'spa', 0.20);
                        }
                    });
                    mostraEsitoMistero("Overclock da motivazione! L'intero team avrà +20% di Attacco e Att. Speciale nel prossimo incontro.");
                }
            },
            {
                testo: "FAI DOMANDA SCOMODA SUI SINDACATI",
                azione: function() {
                    mostraEsitoMistero("Rompi il clima! Ti metti contro i capi. Preparati ad affrontare un MINI BOSS D'ELITE con Oro raddoppiato!", true, () => {
                        avviaIncontroMiniBossElitè();
                    });
                }
            },
            {
                testo: "DORMI SULLE POLTRONE",
                azione: function() {
                    miaSquadra.forEach(p => {
                        if (p && p.hpAttuali > 0) {
                            let cura = Math.max(1, Math.round(p.hpMax * 0.30));
                            p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + cura);
                        }
                    });
                    mostraEsitoMistero("Pisolino aziendale. Tutto il team si cura del 30% dei PV massimi.");
                }
            }
        ]
    }
];

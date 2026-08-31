// ==========================================
// BOSS: REO AI & STATS  (v2 - con sprite per fase)
// ==========================================

let reoHpFase2Base = 0;

// Mappa sprite per fase: idle + mosse con numero frame
const REO_SPRITE_BASE = "../Sprite/personaggi/Reo";
const REO_SPRITES = {
    1: {
        idle: REO_SPRITE_BASE + "/F1/ReoF1.jpeg",
        mosse: {
            "Pugni":   { base: REO_SPRITE_BASE + "/F1/ReoF1_Pugni",   frames: 3, ext: ".jpeg" },
            "Raggio":  { base: REO_SPRITE_BASE + "/F1/ReoF1_Raggio",  frames: 3, ext: ".jpeg" },
            "Sfera":   { base: REO_SPRITE_BASE + "/F1/ReoF1_Sfera",   frames: 4, ext: ".jpeg" },
            "Spada":   { base: REO_SPRITE_BASE + "/F1/ReoF1_Spada",   frames: 4, ext: ".jpeg" }
        }
    },
    2: {
        idle: REO_SPRITE_BASE + "/F2/ReoF2.jpeg",
        mosse: {
            "Raggio":  { base: REO_SPRITE_BASE + "/F2/ReoF2_Raggio",  frames: 4, ext: ".jpeg" },
            "Sfera":   { base: REO_SPRITE_BASE + "/F2/ReoF2_Sfera",   frames: 4, ext: ".jpeg" },
            "Spada":   { base: REO_SPRITE_BASE + "/F2/ReoF2_Spada",   frames: 4, ext: ".jpeg" },
            "Falce":   { base: REO_SPRITE_BASE + "/F2/ReoF2_Falce",   frames: 4, ext: ".jpeg" }
        }
    },
    3: {
        idle: REO_SPRITE_BASE + "/F3/ReoF3.jpeg",
        mosse: {
            "Falce Oscura":    { base: REO_SPRITE_BASE + "/F3/ReoF3_Falce",                frames: 4, ext: ".jpeg" },
            "Sfera Oscura":    { base: REO_SPRITE_BASE + "/F3/ReoF3_Sfera",                frames: 4, ext: ".jpeg" },
            "Meditazione":     { direct: REO_SPRITE_BASE + "/F3/ReoF3_Meditazione1.jpeg",  frames: 1 },
            "Counter":         { direct: REO_SPRITE_BASE + "/F3/ReoF3_Counter_Da_Meditazione_1.jpeg", frames: 1 }
        }
    },
    4: {
        idle: REO_SPRITE_BASE + "/F4/ReoF4.jpeg",
        mosse: {
            "Falce":           { base: REO_SPRITE_BASE + "/F4/ReoF4_Falce",               frames: 3, ext: ".jpeg" },
            "Marchio":         { direct: REO_SPRITE_BASE + "/F4/ReoF4_Marchio.jpeg",      frames: 1 },
            "Ciclo Vitale":    { direct: REO_SPRITE_BASE + "/F4/ReoF4_Ciclio_Vitale.jpeg", frames: 1 },
            "Divorare le Stelle": { direct: REO_SPRITE_BASE + "/F4/ReoF4_Divorare_Le_Stelle1.jpeg", frames: 1 }
        }
    }
};

// ==========================================
// INIT
// ==========================================
function initBossReo() {
    const baseReo = {
        id: "reo_boss",
        nome: "Reo",
        elemento: "buio",
        raritaTipo: "special",
        immagine: REO_SPRITES[1].idle,
        immagineAtk: REO_SPRITES[1].idle,
        hpBase: 4,
        atkBase: 4,
        defBase: 4,
        atkSpec: 9,
        defSpec: 6,
        velBase: 6,
        mossa1: "Attacco", mossa2: "Raggio", mossa3: "Sfera", mossa4: "Spada"
    };

    nemicoPokemon = creaPokemon(baseReo, 100, 3, true);
    nemicoPokemon.boss = true;
    nemicoPokemon.isImmune = 1; // Immune a DOT e debuff

    // Rimosso moltiplicatore x15, usa gli HP calcolati dalla factory.

    // Salva stats base per scaling tra fasi
    nemicoPokemon.base_atk     = nemicoPokemon.atk;
    nemicoPokemon.base_atkSpec = nemicoPokemon.atkSpec;
    nemicoPokemon.base_def     = nemicoPokemon.def;
    nemicoPokemon.base_defSpec = nemicoPokemon.defSpec;
    nemicoPokemon.base_hpMax   = nemicoPokemon.hpMax;
    nemicoPokemon.base_vel     = nemicoPokemon.vel;

    // Flag meccaniche
    nemicoPokemon.hasMeditazione = false;
    nemicoPokemon.isInvulnerable = false;
    nemicoPokemon.damageReduction = 0;

    applicaFaseReo(1);
}

// ==========================================
// APPLICA FASE (stats + sprite idle)
// ==========================================
function applicaFaseReo(fase) {
    const spriteData = REO_SPRITES[fase];
    if (!spriteData) return;

    // Cambia sprite idle
    nemicoPokemon.immagine = spriteData.idle;
    nemicoPokemon.immagineAtk = spriteData.idle;
    document.getElementById("img-nemico").src = spriteData.idle;

    if (fase === 1) {
        nemicoPokemon.hpMax = nemicoPokemon.base_hpMax;
        nemicoPokemon.hpAttuali = nemicoPokemon.hpMax;
        nemicoPokemon.atk     = nemicoPokemon.base_atk;
        nemicoPokemon.atkSpec = nemicoPokemon.base_atkSpec;
        nemicoPokemon.def     = nemicoPokemon.base_def;
        nemicoPokemon.defSpec = nemicoPokemon.base_defSpec;
    } else if (fase === 2) {
        nemicoPokemon.hpMax = nemicoPokemon.base_hpMax;
        nemicoPokemon.hpAttuali = nemicoPokemon.hpMax;
        reoHpFase2Base = nemicoPokemon.hpMax;
        nemicoPokemon.atkSpec = Math.floor(nemicoPokemon.base_atkSpec * 1.20);
        nemicoPokemon.atk     = Math.floor(nemicoPokemon.base_atk  * 1.10);
        nemicoPokemon.defSpec = Math.floor(nemicoPokemon.base_defSpec * 1.07);
        nemicoPokemon.def     = Math.floor(nemicoPokemon.base_def  * 1.05);
    } else if (fase === 3) {
        // NON resetta HP - continua dalla Fase 2
        nemicoPokemon.atkSpec = Math.floor(nemicoPokemon.base_atkSpec * 1.40);
        nemicoPokemon.atk     = Math.floor(nemicoPokemon.base_atk  * 1.18);
        nemicoPokemon.defSpec = Math.floor(nemicoPokemon.base_defSpec * 0.88);
        nemicoPokemon.def     = Math.floor(nemicoPokemon.base_def  * 0.85);
    } else if (fase === 4) {
        nemicoPokemon.hpMax = Math.floor(nemicoPokemon.base_hpMax * 1.55);
        nemicoPokemon.hpAttuali = nemicoPokemon.hpMax;
        nemicoPokemon.atkSpec = nemicoPokemon.base_atkSpec;
        nemicoPokemon.atk     = nemicoPokemon.base_atk;
        nemicoPokemon.defSpec = nemicoPokemon.base_defSpec;
        nemicoPokemon.def     = nemicoPokemon.base_def;
    }

    // Reset meccaniche
    nemicoPokemon.hasMeditazione = false;
    nemicoPokemon.isInvulnerable = false;
    nemicoPokemon.damageReduction = 0;

    aggiornaGrafica();

    // Dopo cambio fase, decidi chi inizia
    if (fase > 1) {
        setTimeout(() => {
            if (nemicoPokemon.vel > mioPokemon.vel) {
                turnoNemico();
            } else {
                abilitaControlliGiocatore();
            }
        }, 1500);
    }
}

// ==========================================
// ANIMAZIONE MOSSA BOSS
// ==========================================
function animaMossaReo(nomeMossa, callback) {
    const fase = currentChallengePhase;
    const spriteData = REO_SPRITES[fase];
    if (!spriteData || !spriteData.mosse[nomeMossa]) {
        // Nessuno sprite per questa mossa, esegui direttamente
        if (callback) callback();
        return;
    }

    const mossaData = spriteData.mosse[nomeMossa];
    // Usa il sistema di animazione del gioco base
    if (mossaData.direct) {
        // Sprite singolo con path diretto (nessun suffisso numerico)
        nemicoPokemon.immagineAtk = mossaData.direct;
        nemicoPokemon.frameAtk = 1;
    } else {
        nemicoPokemon.immagineAtk = mossaData.base + mossaData.ext;
        nemicoPokemon.frameAtk = mossaData.frames;
    }

    eseguiAnimazioneAttaccoNormale(nemicoPokemon, false, () => {
        // Torna all'idle della fase
        nemicoPokemon.immagine = spriteData.idle;
        nemicoPokemon.immagineAtk = spriteData.idle;
        nemicoPokemon.frameAtk = 1;
        document.getElementById("img-nemico").src = spriteData.idle;
        if (callback) callback();
    });
}

// ==========================================
// TURNO BOSS
// ==========================================
function turnoBossReo() {
    // Reset flag temporanei di turno
    nemicoPokemon.isInvulnerable = false;
    nemicoPokemon.damageReduction = 0;
    if (mioPokemon) mioPokemon.hasMarchioLupo = false;

    let rand = Math.random() * 100;
    let nomeMossa = "";
    let molt = 1;
    let usaAtkSp = false;
    let colore = "#8a2be2";
    let isLifesteal = false;
    let doPanchinaAfter = false;
    let panchinaPerc = 0;

    // ---- FASE 1 ----
    if (currentChallengePhase === 1) {
        if (rand < 25) {
            nomeMossa = "Pugni"; molt = 0.80; usaAtkSp = false; colore = "#f1c40f";
        } else if (rand < 55) {
            nomeMossa = "Raggio"; molt = 1.50; usaAtkSp = true; colore = "#e74c3c";
        } else if (rand < 80) {
            nomeMossa = "Sfera"; molt = 1.35; usaAtkSp = true; colore = "#e74c3c";
            doPanchinaAfter = true; panchinaPerc = 0.12;
        } else {
            nomeMossa = "Spada"; molt = 1.20; usaAtkSp = false; colore = "#f1c40f";
        }
    }
    // ---- FASE 2 ----
    else if (currentChallengePhase === 2) {
        if (rand < 35) {
            nomeMossa = "Raggio"; molt = 1.20; usaAtkSp = true; colore = "#e74c3c";
        } else if (rand < 65) {
            nomeMossa = "Sfera"; molt = 1.35; usaAtkSp = true; colore = "#e74c3c";
            doPanchinaAfter = true; panchinaPerc = 0.10;
        } else if (rand < 90) {
            nomeMossa = "Spada"; molt = 1.50; usaAtkSp = false; colore = "#f1c40f";
        } else {
            nomeMossa = "Falce"; molt = 2.00; usaAtkSp = true; colore = "#e74c3c";
        }
    }
    // ---- FASE 3 ----
    else if (currentChallengePhase === 3) {
        // Counter da Meditazione: se ha meditato il turno prima, fa il counter
        if (nemicoPokemon.hasMeditazione) {
            nemicoPokemon.hasMeditazione = false;
            nomeMossa = "Counter"; molt = 2.50; usaAtkSp = true; colore = "#9b59b6";
            logBoss("Reo scatena il Contrattacco dalla Meditazione!", colore);
            animaMossaReo("Counter", () => {
                let danno = calcolaDannoPuro(molt, true);
                applicaDannoAlGiocatore(danno, false);
            });
            return;
        }

        if (rand < 45) {
            nomeMossa = "Falce Oscura"; molt = 1.60; usaAtkSp = true; colore = "#e74c3c";
            isLifesteal = true;
        } else if (rand < 80) {
            nomeMossa = "Sfera Oscura"; molt = 1.20; usaAtkSp = true; colore = "#e74c3c";
            doPanchinaAfter = true; panchinaPerc = 0.09;
        } else {
            nomeMossa = "Meditazione"; molt = 0; colore = "#9b59b6";
            nemicoPokemon.hasMeditazione = true;
            logBoss("Reo medita... sta preparando qualcosa!", colore);
            animaMossaReo("Meditazione", () => {
                abilitaControlliGiocatore();
            });
            return;
        }
    }
    // ---- FASE 4 (Reo + Lupo) ----
    else if (currentChallengePhase === 4) {
        eseguiFase4Reo();
        return;
    }

    // Esegui mossa standard (fasi 1-3)
    logBoss("Reo usa " + nomeMossa + "!", colore);

    if (doPanchinaAfter) {
        applicaDannoPanchina(panchinaPerc);
    }

    animaMossaReo(nomeMossa, () => {
        let danno = calcolaDannoPuro(molt, usaAtkSp);
        applicaDannoAlGiocatore(danno, isLifesteal);
    });
}

// ==========================================
// FASE 4: TURNO COMBINATO REO + LUPO
// ==========================================
function eseguiFase4Reo() {
    let randReo = Math.random() * 100;
    let mossaReo = "";
    let moltReo = 0;

    if (randReo < 60) {
        mossaReo = "Falce"; moltReo = 0.60;
    } else if (randReo < 90) {
        mossaReo = "Marchio"; moltReo = 0;
    } else {
        mossaReo = "Ciclo Vitale"; moltReo = 0;
    }

    logBoss("Reo usa " + mossaReo + "!", "#f1c40f");

    animaMossaReo(mossaReo, () => {
        if (mossaReo === "Falce") {
            let dannoFalce = calcolaDannoPuro(moltReo, true);
            mioPokemon.hpAttuali -= dannoFalce;
            if (mioPokemon.hpAttuali < 0) mioPokemon.hpAttuali = 0;
            aggiornaGrafica();
            curaBoss(dannoFalce);
            logBoss("Reo ruba " + Math.round(dannoFalce) + " HP con la Falce!", "#2ecc71");
        } else if (mossaReo === "Marchio") {
            logConsole(mioPokemon.nome + " riceve il <em>Marchio del Lupo</em>!");
            mioPokemon.hasMarchioLupo = true;
            nemicoPokemon.damageReduction = 0.40;
        } else {
            logBoss("Reo diventa invulnerabile!", "#9b59b6");
            nemicoPokemon.isInvulnerable = true;
        }

        // Dopo Reo, attacca il Lupo
        setTimeout(() => {
            logBoss("Il Lupo usa Divorare le Stelle!", "#8a2be2");
            animaMossaReo("Divorare le Stelle", () => {
                let moltLupo = 1.80;
                if (mioPokemon.hasMarchioLupo) {
                    moltLupo *= 2.0;
                    logConsole("Il danno raddoppia per il Marchio del Lupo!");
                }
                let dannoLupo = calcolaDannoPuro(moltLupo, true);
                applicaDannoAlGiocatore(dannoLupo, false);
                if (Math.random() < 0.15) applicaTerrore();
            });
        }, 800);
    });
}

// ==========================================
// UTILITY: DANNO, CURA, LOG
// ==========================================
function calcolaDannoPuro(molt, usaAtkSp) {
    let atk = usaAtkSp ? nemicoPokemon.atkSpec : nemicoPokemon.atk;
    let def = usaAtkSp ? mioPokemon.defSpec : mioPokemon.def;
    let lvl = nemicoPokemon.livello;
    let potenzaBase = 50;
    let rnd = (Math.floor(Math.random() * 16) + 85) / 100;
    let danno = Math.floor(((((2 * lvl / 5) + 2) * potenzaBase * (atk / def)) / 50 + 2) * rnd * molt);
    return Math.max(1, danno);
}

function applicaDannoAlGiocatore(danno, isLifesteal) {
    document.getElementById("img-giocatore").classList.add("danno-subito");
    setTimeout(() => {
        const el = document.getElementById("img-giocatore");
        if (el) el.classList.remove("danno-subito");
    }, 500);

    mioPokemon.hpAttuali -= danno;
    if (mioPokemon.hpAttuali < 0) mioPokemon.hpAttuali = 0;
    aggiornaGrafica();

    logConsole(mioPokemon.nome + " subisce <strong>" + danno + "</strong> danni!");

    if (isLifesteal) {
        curaBoss(Math.floor(danno * 0.45));
    }

    if (mioPokemon.hpAttuali <= 0) {
        gestisciKOGiocatoreChallenge();
    } else {
        abilitaControlliGiocatore();
    }
}

function applicaDannoPanchina(percentuale) {
    let dannoInflitto = false;
    miaSquadra.forEach((pg, index) => {
        if (index !== indiceMioPokemonAttuale && pg && pg.hpAttuali > 0) {
            let danno = Math.floor(pg.hpMax * percentuale);
            pg.hpAttuali -= danno;
            if (pg.hpAttuali <= 0) {
                pg.hpAttuali = 0;
                logConsole("<span style='color:#e74c3c;'>Il tuo " + pg.nome + " e' andato KO in panchina!</span>");
            }
            dannoInflitto = true;
        }
    });
    if (dannoInflitto) {
        logConsole("<span style='color:#e67e22;'>La tua panchina ha subito danni!</span>");
    }
}

function curaBoss(ammontare) {
    ammontare = Math.floor(ammontare);
    nemicoPokemon.hpAttuali = Math.min(nemicoPokemon.hpMax, nemicoPokemon.hpAttuali + ammontare);
    logConsole("<strong style='color:#2ecc71;'>Il Boss recupera " + ammontare + " HP!</strong>");
    aggiornaGrafica();
}

function applicaTerrore() {
    logConsole("<strong style='color:#8a2be2;'>" + mioPokemon.nome + " e' preda del Terrore! Stats ridotte del 40%!</strong>");
    mioPokemon.atk     = Math.floor(mioPokemon.atk     * 0.6);
    mioPokemon.atkSpec = Math.floor(mioPokemon.atkSpec * 0.6);
    mioPokemon.def     = Math.floor(mioPokemon.def     * 0.6);
    mioPokemon.defSpec = Math.floor(mioPokemon.defSpec * 0.6);
}

function logBoss(testo, colore) {
    document.getElementById("console-log").innerHTML +=
        "<hr style='border-color: #444; margin: 15px 0;'><strong style='color:" + colore + ";'>" + testo + "</strong>";
}

function logConsole(testo) {
    document.getElementById("console-log").innerHTML += "<br>" + testo;
}

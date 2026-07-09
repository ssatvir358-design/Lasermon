// ==========================================================
// eventi_misteriosi.js — Database degli eventi misteriosi (nodi speciali sulla mappa)
// ==========================================================

const DB_EVENTI_MISTERIOSI = [
    {
        nome: "Antico Altare Energetico",
        descrizione: "Trovi una roccia fluttuante colma di rune. La squadra recupera istantaneamente il 30% degli HP massimi!",
        mappeAbilitate: [1, 2, 3],
        percentuale: 40,
        azione: () => {
            miaSquadra.forEach(p => {
                if(p) p.hpAttuali = Math.min(p.hpMax, p.hpAttuali + Math.round(p.hpMax * 0.30));
            });
        }
    },
    {
        nome: "Il Ladro di Monete",
        descrizione: "Un bizzarro figuro sbuca dalle ombre e ti regala un boost di potenza per il tuo primo Pokémon!",
        mappeAbilitate: [1, 2],
        percentuale: 35,
        azione: () => {
            if (miaSquadra[0]) {
                miaSquadra[0].atk += 2;
            }
        }
    },
    {
        nome: "Capsula del Tempo Smarrita",
        descrizione: "Trovi un vecchio contenitore tecnologico sigillato contenente caramelle rare.",
        mappeAbilitate: [2, 3],
        percentuale: 25,
        azione: () => {
            if (miaSquadra[0]) {
                miaSquadra[0].livello += 1;
            }
        }
    }
];

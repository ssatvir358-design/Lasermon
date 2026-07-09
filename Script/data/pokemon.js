// ==========================================================
// pokemon.js — Database di tutti i Pokémon del gioco
// Estratto da script.js (righe 1-62)
// ==========================================================

const pokemonDatabase = [
  { nome: "Fabio", hpBase: 4, atkBase: 3, defBase: 3, velBase: 2, raritaTipo: "comune", elemento: "erba", immagine: "../Sprite/personaggi/Fabio/Fabio.jpeg", immagineAtk: "../Sprite/personaggi/Fabio/Fabio_atk.jpeg", mossaLvl1: "Colpo Fabio", mossaLvl2: "Super Fabio", mossaLvl3: "Iper Fabio", boss: false },
  { nome: "Falco", hpBase: 3, atkBase: 2, defBase: 4, velBase: 3, raritaTipo: "comune", elemento: "acqua", immagine: "../Sprite/personaggi/Falco/Falco.jpeg", immagineAtk: "../Sprite/personaggi/Falco/Falco_atk.jpeg", mossaLvl1: "Mogging", mossaLvl2: "Riavviato pc ora ok", mossaLvl3: "Picchiata", boss: false },
  { nome: "Gian", hpBase: 3, atkBase: 4, defBase: 2, velBase: 3, raritaTipo: "comune", elemento: "fuoco", immagine: "../Sprite/personaggi/Gian/Gian.jpeg", immagineAtk: "../Sprite/personaggi/Gian/Gian_atk.jpeg", mossaLvl1: "Parlo", mossaLvl2: "Rido", mossaLvl3: "Snitcho", boss: false },
  { nome: "Monica", hpBase: 3, atkBase: 5, defBase: 3, velBase: 4, raritaTipo: "non comune", elemento: "fuoco", immagine: "../Sprite/personaggi/Monica/Monica.jpeg", immagineAtk: "../Sprite/personaggi/Monica/Monica_atk.jpeg", mossaLvl1: "Parlo", mossaLvl2: "Rido", mossaLvl3: "Snitcho", boss: false },
  { nome: "Ruggiero", hpBase: 4, atkBase: 3, defBase: 4, velBase: 3, raritaTipo: "non comune", elemento: "erba", immagine: "../Sprite/personaggi/Ruggiero/Ruggiero.jpeg", immagineAtk: "../Sprite/personaggi/Ruggiero/Ruggiero_atk.jpeg", mossaLvl1: "Invio corrispettivi", mossaLvl2: "Sfuriata mail", mossaLvl3: "Divieto di parcheggio", boss: false },
  { nome: "Bussolotti", hpBase: 4, atkBase: 2, defBase: 5, velBase: 2, raritaTipo: "non comune", elemento: "acqua", immagine: "../Sprite/personaggi/Bussolotti/Bussolotti.jpeg", immagineAtk: "../Sprite/personaggi/Bussolotti/Bussolotti_atk.jpeg", mossaLvl1: "Discord", mossaLvl2: "LOL Player", mossaLvl3: "Malattia", boss: false },
  { nome: "Bellini", hpBase: 4, atkBase: 2, defBase: 5, velBase: 4, raritaTipo: "non comune", elemento: "acqua", immagine: "../Sprite/personaggi/Bellini/Bellini.jpeg", immagineAtk: "../Sprite/personaggi/Bellini/Bellini_atk.jpeg", mossaLvl1: "Attacco snack", mossaLvl2: "Non sei un bodybuilder", mossaLvl3: "Richiesta consulenza tecn. interni", boss: false },
  { nome: "Tudor", hpBase: 6, atkBase: 3, defBase: 5, velBase: 5, raritaTipo: "raro", elemento: "erba", immagine: "../Sprite/personaggi/Tudor/Tudor.jpeg", immagineAtk: "../Sprite/personaggi/Tudor/Tudor_atk.jpeg", mossaLvl1: "Scoreggia", mossaLvl2: "Sono un tuo superiore", mossaLvl3: "Lancio di tessera", boss: true, mossaULT: "Tessera Nucleare", numFrameUlt: 3 },
  { nome: "Solieri", hpBase: 4, atkBase: 6, defBase: 4, velBase: 2, raritaTipo: "raro", elemento: "fuoco", immagine: "../Sprite/personaggi/Solieri/Solieri.jpeg", immagineAtk: "../Sprite/personaggi/Solieri/Solieri_atk.jpeg", mossaLvl1: "Isolamento", mossaLvl2: "Bestemmia", mossaLvl3: "Battuta di merda", boss: true, mossaULT: "Apocalisse Padana", numFrameUlt: 2 },
  { nome: "Donato", hpBase: 4, atkBase: 6, defBase: 3, velBase: 4, raritaTipo: "raro", elemento: "fuoco", immagine: "../Sprite/personaggi/Donato/Donato.jpeg", immagineAtk: "../Sprite/personaggi/Donato/Donato_atk.jpeg", mossaLvl1: "Falco rispondi!", mossaLvl2: "Da ora sei il suo referente", mossaLvl3: "Preventivo eccessivo", boss: true, mossaULT: "Referente Supremo", numFrameUlt: 3 },
  { nome: "Venturini", hpBase: 5, atkBase: 4, defBase: 7, velBase: 5, raritaTipo: "epico", elemento: "acqua", immagine: "../Sprite/personaggi/Venturini/Venturini.jpeg", immagineAtk: "../Sprite/personaggi/Venturini/Venturini_atk.jpeg", mossaLvl1: "Uscita da Tesla", mossaLvl2: "Pelata accecante", mossaLvl3: "Camminata finocchia", boss: false },
  { nome: "Carra", hpBase: 3, atkBase: 8, defBase: 4, velBase: 6, raritaTipo: "epico", elemento: "fuoco", immagine: "../Sprite/personaggi/Carra/Carra.jpeg", immagineAtk: "../Sprite/personaggi/Carra/Carra_atk.jpeg", mossaLvl1: "Corso sicurezza", mossaLvl2: "Raccolta di penna", mossaLvl3: "Sniffata", boss: false },
  { nome: "Giulio", hpBase: 7, atkBase: 4, defBase: 6, velBase: 4, raritaTipo: "epico", elemento: "acqua", immagine: "../Sprite/personaggi/Giulio/Giulio.jpeg", immagineAtk: "../Sprite/personaggi/Giulio/Giulio_atk.jpeg", mossaLvl1: "Impiccione", mossaLvl2: "Finta di fare chiamata", mossaLvl3: "Imparo a volare", boss: true, mossaULT: "Occhio Onnipresente", numFrameUlt: 4 },
  { nome: "Mattia", hpBase: 5, atkBase: 7, defBase: 4, velBase: 5, raritaTipo: "epico", elemento: "fuoco", immagine: "../Sprite/personaggi/Mattia/Mattia.jpeg", immagineAtk: "../Sprite/personaggi/Mattia/Mattia_atk.jpeg", mossaLvl1: "Non ti rispondo", mossaLvl2: "Chat GPT", mossaLvl3: "Non sono cazzi miei", boss: false },
  { nome: "Paolo", hpBase: 9, atkBase: 4, defBase: 8, velBase: 3, raritaTipo: "leggendario", elemento: "erba", immagine: "../Sprite/personaggi/Paolo/Paolo.jpeg", immagineAtk: "../Sprite/personaggi/Paolo/Paolo_atk.jpeg", mossaLvl1: "Giovaneehh il telefonoooh", mossaLvl2: "Forfora Beam", mossaLvl3: "Alitata", boss: true, mossaULT: "Urlo del Capo Supremo", numFrameUlt: 4 },
  { nome: "Lanza", hpBase: 5, atkBase: 5, defBase: 10, velBase: 4, raritaTipo: "leggendario", elemento: "acqua", immagine: "../Sprite/personaggi/Lanza/Lanza.jpeg", immagineAtk: "../Sprite/personaggi/Lanza/Lanza_atk.jpeg", mossaLvl1: "Lavata di capo", mossaLvl2: "Precedenza a Cagna", mossaLvl3: "Cago il cazzo", boss: true, mossaULT: "Rimprovero Infinito", numFrameUlt: 7 },
  { nome: "DiNicola", hpBase: 4, atkBase: 11, defBase: 4, velBase: 5, raritaTipo: "leggendario", elemento: "fuoco", immagine: "../Sprite/personaggi/DiNicola/DiNicola.jpeg", immagineAtk: "../Sprite/personaggi/DiNicola/DiNicola_atk.jpeg", mossaLvl1: "Stronzata micidiale", mossaLvl2: "Ingegneria fasulla", mossaLvl3: "Urlata in faccia", boss: true, mossaULT: "Collasso Strutturale", numFrameUlt: 3 },
  { nome: "Filippo", hpBase: 7, atkBase: 6, defBase: 6, velBase: 5, raritaTipo: "leggendario", elemento: "erba", immagine: "../Sprite/personaggi/Filippo/Filippo.jpeg", immagineAtk: "../Sprite/personaggi/Filippo/Filippo_atk.jpeg", mossaLvl1: "Scomparsa", mossaLvl2: "Sì Sì lo faremo", mossaLvl3: "Volere di donna come assistente", boss: true, mossaULT: "Promessa Eterna", numFrameUlt: 1 },
  { nome: "Nicolas", hpBase: 1, atkBase: 10, defBase: 1, velBase: 1, raritaTipo: "leggendario", elemento: "fuoco", immagine: "../Sprite/personaggi/Nicolas/Nicolas.jpeg", immagineAtk: "../Sprite/personaggi/Nicolas/Nicolas_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: false },
  { nome: "Max", hpBase: 7, atkBase: 7, defBase: 7, velBase: 7, raritaTipo: "special", elemento: "buio", immagine: "../Sprite/personaggi/Max/Max.jpeg", immagineAtk: "../Sprite/personaggi/Max/Max_atk.jpeg", mossaLvl1: "Nulla di scritto", mossaLvl2: "No Callbell", mossaLvl3: "Tutti al centralino", boss: true, mossaULT: "Centralino Universale", numFrameUlt: 4 },
  { nome: "Gio", hpBase: 4, atkBase: 10, defBase: 3, velBase: 0, raritaTipo: "bombers", elemento: "buio", immagine: "../Sprite/personaggi/Gio/Gio.jpeg", immagineAtk: "../Sprite/personaggi/Gio/Gio_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Bombardamento Totale", numFrameUlt: 2 },
  { nome: "Sat", hpBase: 5, atkBase: 11, defBase: 4, velBase: 6, raritaTipo: "bombers", elemento: "buio", immagine: "../Sprite/personaggi/Sat/Sat.jpeg", immagineAtk: "../Sprite/personaggi/Sat/Sat_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Maremoto del Bomber", numFrameUlt: 3 },
  { nome: "Kul", hpBase: 4, atkBase: 6, defBase: 6, velBase: 10, raritaTipo: "bombers", elemento: "luce", immagine: "../Sprite/personaggi/Kul/Kul.jpeg", immagineAtk: "../Sprite/personaggi/Kul/Kul_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Velocità Assoluta", numFrameUlt: 1 },
  { nome: "Edo", hpBase: 10, atkBase: 6, defBase: 7, velBase: 3, raritaTipo: "bombers", elemento: "luce", immagine: "../Sprite/personaggi/Edo/Edo.jpeg", immagineAtk: "../Sprite/personaggi/Edo/Edo_atk.jpeg", mossaLvl1: "Rifatta DLL ora ok", mossaLvl2: "Malattia", mossaLvl3: "Nicolassata", boss: true, mossaULT: "Esecuzione Lussuriosa", numFrameUlt: 4 }
];

// Database degli eventi misteriosi (nodi speciali sulla mappa)
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

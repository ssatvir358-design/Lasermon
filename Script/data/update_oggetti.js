const fs = require('fs');

const itemComprabiliStr = `
CAFFE' ALLA MACCHINETTA	2	1-2	RECUPERI 20 PV
ENERGY DRINK	5	3-4	RECUPERI 150 PV
SHAKE PROTEICO	10	5-6-7	RECUPERI 300 PV
INTEGRATORE AVANZATO	12	8-9	RECUPERI 450 PV
SNACK AL VOLO	3	3-4	RECUPERI IL 20% DEI PV MASSIMI
TRANCIO DI PIZZA	7	3-4	RECUPERI IL 40% DEI PV MASSIMI
ACQUA FRESCA	6	3-4	RECUPERI 50 PV E RIMUOVE LO STATUS BRUCIATURA
KEBAB	12	5-6-7	RECUPERI IL 60% DEI PV MASSIMI
CREATINA	10	5-6-7	RECUPERI 150 PV E RIMUOVE TUTTI I DEBUFF
GRIGLIATA AZIENDALE	25	8-9	RECUPERI IL 100% E TOGLIE QUALSIASI DEBUFF E ALTERAZIONE DELLE STATISTICHE
CONTRATTO DETERMINATO	15	7-9	IN BATTAGLIA, AUMENTA ATK 20% PER 3 TURNI
`.trim();

const itemTerraStr = `
Tastiera Meccanica	AUMENTA ATK +20	NO
Mouse Ergonomico	AUMENTA VEL +20	NO
Cuffie Isolanti	AUMENTA DEF +20	NO
Occhiali Riposanti	AUMENTA HP +50	NO
Borraccia Termica	AUMENTA HP +10%	NO
Tappetino Mouse Pro	AUMENTA ATK +10%	NO
Sedia da Gaming	AUMENTA DEF +10%	NO
SSD Esterno	AUMENTA VEL +10%	NO
Cavo LAN Placcato Oro	AUMENTA TUTTE LE STAT +10	NO
Cuscino Lombare	AUMENTA TUTTE LE STAT +5%	NO
Badge Vip	AUMENTA TUTTE LE STAT +20	NO
Distintivo dell'Impiegato del Mese	AUMENTA TUTTE LE STAT +10%	NO
Stampante Inceppata	AUMENTA ATK +50 MA DIMINUISCE LA VEL -20	SI
Caffè Sbagliato	AUMENTA VEL +50 MA DIMINUISCE LA DEF -20	SI
Monitor Sfarfallante	AUMENTA DEF +50 MA DIMINUISCE L'ATK -20	SI
Update di Windows Improvviso	AUMENTA ATK +30% MA RADDOPPIA I DANNI SUBITI	SI
`.trim();

const db = [];

function parseMappe(str) {
    if (!str) return [];
    return str.split('-').map(Number);
}

// Comprabili (consumabili)
itemComprabiliStr.split('\n').forEach((line, i) => {
    const [nome, costo, mappe, effetto] = line.split('\t');
    db.push(`    {
        id: "cons_${i}",
        nome: "${nome}",
        icona: "../Sprite/item/placeholder.png",
        iconaFallback: "💊",
        mappeAbilitate: [${parseMappe(mappe).join(', ')}],
        descrizione: "${effetto}",
        categoria: "consumabile",
        acquistabile: true,
        costo: ${costo},
        consumabile: true,
        effettoSpeciale: null,
        usabileInBattaglia: true,
        stat: "hp", // Da configurare nel dettaglio a seconda dell'effetto
        valore: 0,
        valoreType: "flat"
    }`);
});

// Terra (equipaggiabili)
itemTerraStr.split('\n').forEach((line, i) => {
    const [nome, effetto, maledetto] = line.split('\t');
    db.push(`    {
        id: "equip_${i}",
        nome: "${nome}",
        icona: "../Sprite/nodi/item.png",
        iconaFallback: "🎒",
        mappeAbilitate: [],
        descrizione: "${effetto}",
        categoria: "equipaggiabile",
        acquistabile: false,
        stat: "tutto", // Da configurare nel dettaglio
        valore: 0,
        valoreType: "flat",
        spawnPerc: 10,
        itemSpeciale: ${maledetto === 'SI'},
        raritaItem: "comune",
        maledetto: ${maledetto === 'SI'}
    }`);
});

const fileContent = \`// ==========================================================
// oggetti.js — Database completo di tutti gli oggetti del gioco
// ==========================================================

const DB_OGGETTI = [
\${db.join(',\\n')}
];
\`;

fs.writeFileSync('C:/Users/Utente/Desktop/sito laser poke/Script/data/oggetti.js', fileContent);

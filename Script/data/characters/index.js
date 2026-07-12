// Script/data/characters/index.js

// 1. Definiamo l'array inizialmente vuoto
const pokemonDatabase = [];

// 2. Usiamo una funzione per trovare tutti i personaggi caricati
function inizializzaDatabaseDinamico() {
    // Cicla tutte le proprietà dell'oggetto globale window
    for (const key in window) {
        // Controlla se la proprietà inizia con il prefisso dei tuoi personaggi
        if (key.startsWith("CHAR_")) {
            pokemonDatabase.push(window[key]);
        }
    }
    
    // Opzionale: puoi ordinarli per nome
    pokemonDatabase.sort((a, b) => a.nome.localeCompare(b.nome));
    
    console.log("Database caricato, totale Pokémon:", pokemonDatabase.length);
}

// 3. Eseguiamo la funzione subito dopo il caricamento degli script
inizializzaDatabaseDinamico();
// ==========================================================
// database_veloce.js — Stats override per la modalità Run Veloce
// In questa modalità esistono solo 4 statistiche: HP, ATK, DEF, VEL
// (atkSpec e defSpec non esistono, verranno uguali ad atk e def)
// ==========================================================

const STATS_RUN_VELOCE = {
    "VALEN":        { hpBase: 3, atkBase: 2, defBase: 6, velBase: 1 },
    "NYSSA":        { hpBase: 3, atkBase: 5, defBase: 1, velBase: 5 },
    "CASSIAN":      { hpBase: 6, atkBase: 2, defBase: 5, velBase: 1 },
    "KIORA":        { hpBase: 4, atkBase: 3, defBase: 3, velBase: 4 },
    "ZAREEN":       { hpBase: 3, atkBase: 5, defBase: 1, velBase: 7 },
    "ELYS":         { hpBase: 4, atkBase: 2, defBase: 7, velBase: 5 },
    "LUCIEN":       { hpBase: 2, atkBase: 4, defBase: 1, velBase: 5 },
    "VESPER":       { hpBase: 5, atkBase: 2, defBase: 3, velBase: 8 },
    "VESPER, LA TABULA RASA DEL CAPITALE": { hpBase: 5, atkBase: 7, defBase: 4, velBase: 4 },
    "RYDEN":        { hpBase: 4, atkBase: 5, defBase: 3, velBase: 2 },
    "VAN":          { hpBase: 2, atkBase: 4, defBase: 1, velBase: 5 },
    "MIREYA":       { hpBase: 4, atkBase: 1, defBase: 5, velBase: 6 },
    "DARIUS":       { hpBase: 6, atkBase: 7, defBase: 4, velBase: 1 },
    "RIVENA":       { hpBase: 4, atkBase: 3, defBase: 3, velBase: 4 },
    "ICER":         { hpBase: 4, atkBase: 1, defBase: 5, velBase: 2 },
    "EVREN":        { hpBase: 3, atkBase: 1, defBase: 5, velBase: 3 },
    "MAELIS":       { hpBase: 4, atkBase: 6, defBase: 1, velBase: 7 },
    "ELYRA":        { hpBase: 3, atkBase: 2, defBase: 4, velBase: 5 },
    "ASTER":        { hpBase: 4, atkBase: 1, defBase: 1, velBase: 6 },
    "BOB":          { hpBase: 5, atkBase: 4, defBase: 2, velBase: 1 },
    "SORAYA":       { hpBase: 3, atkBase: 4, defBase: 1, velBase: 4 },
    "NERYS":        { hpBase: 4, atkBase: 3, defBase: 5, velBase: 2 },
    "KIT":          { hpBase: 3, atkBase: 6, defBase: 1, velBase: 4 },
    "NELLY":        { hpBase: 4, atkBase: 4, defBase: 4, velBase: 4 },
    "VIREA":        { hpBase: 3, atkBase: 2, defBase: 4, velBase: 5 },
    "MAURO":        { hpBase: 6, atkBase: 4, defBase: 7, velBase: 1 },
    "CAELUM":       { hpBase: 3, atkBase: 3, defBase: 5, velBase: 3 },
    "Mariel":       { hpBase: 3, atkBase: 4, defBase: 1, velBase: 6 },
    "Fabio":        { hpBase: 3, atkBase: 3, defBase: 3, velBase: 3 },
    "Gian":         { hpBase: 3, atkBase: 5, defBase: 1, velBase: 3 },
    "Monica":       { hpBase: 4, atkBase: 1, defBase: 5, velBase: 2 },
    "Ruggiero":     { hpBase: 3, atkBase: 5, defBase: 2, velBase: 4 },
    "Bussolotti":   { hpBase: 4, atkBase: 2, defBase: 5, velBase: 1 },
    "Bellini":      { hpBase: 3, atkBase: 1, defBase: 4, velBase: 4 },
    "Tudor":        { hpBase: 5, atkBase: 4, defBase: 5, velBase: 2 },
    "Solieri":      { hpBase: 3, atkBase: 6, defBase: 3, velBase: 4 },
    "Donato":       { hpBase: 3, atkBase: 6, defBase: 2, velBase: 5 },
    "Venturini":    { hpBase: 4, atkBase: 2, defBase: 4, velBase: 8 },
    "Carra":        { hpBase: 4, atkBase: 7, defBase: 3, velBase: 4 },
    "Giulio":       { hpBase: 4, atkBase: 4, defBase: 4, velBase: 6 },
    "Paolo":        { hpBase: 9, atkBase: 5, defBase: 6, velBase: 0 },
    "Lanza":        { hpBase: 9, atkBase: 1, defBase: 5, velBase: 5 },
    "DiNicola":     { hpBase: 4, atkBase: 8, defBase: 2, velBase: 6 },
    "Filippo":      { hpBase: 6, atkBase: 3, defBase: 9, velBase: 2 },
    "Nicolas":      { hpBase: 3, atkBase: 6, defBase: 4, velBase: 7 },
    "Tania":        { hpBase: 1, atkBase: 4, defBase: 3, velBase: 6 },
    "Altimani":     { hpBase: 3, atkBase: 5, defBase: 3, velBase: 1 },
    "Saad":         { hpBase: 4, atkBase: 5, defBase: 3, velBase: 4 },
    "Arman":        { hpBase: 3, atkBase: 5, defBase: 3, velBase: 3 },
    "Manuela":      { hpBase: 4, atkBase: 2, defBase: 6, velBase: 2 },
    "Bacchi":       { hpBase: 3, atkBase: 6, defBase: 3, velBase: 6 },
    "Marini":       { hpBase: 3, atkBase: 4, defBase: 1, velBase: 4 },
    "Rauf":         { hpBase: 2, atkBase: 5, defBase: 3, velBase: 2 },
    "Telemaco":     { hpBase: 1, atkBase: 5, defBase: 2, velBase: 8 },
    "Salvatore":    { hpBase: 3, atkBase: 5, defBase: 3, velBase: 3 },
    "Nicolo":       { hpBase: 3, atkBase: 4, defBase: 0, velBase: 5 },
    "Alex":         { hpBase: 5, atkBase: 6, defBase: 4, velBase: 3 },
    "Matteo":       { hpBase: 5, atkBase: 5, defBase: 5, velBase: 5 },
    "Bottura":      { hpBase: 4, atkBase: 3, defBase: 5, velBase: 6 },
    "Graziani":     { hpBase: 5, atkBase: 2, defBase: 6, velBase: 5 },
    "Loconsole":    { hpBase: 4, atkBase: 2, defBase: 5, velBase: 1 },
    "Ghandu":       { hpBase: 3, atkBase: 2, defBase: 5, velBase: 2 },
    "Nico":         { hpBase: 2, atkBase: 5, defBase: 2, velBase: 3 },
    "Contini":      { hpBase: 3, atkBase: 3, defBase: 4, velBase: 4 },
    "Bottardi":     { hpBase: 3, atkBase: 3, defBase: 3, velBase: 3 },
    "Paola":        { hpBase: 3, atkBase: 3, defBase: 3, velBase: 9 },
    "Paroni":       { hpBase: 4, atkBase: 4, defBase: 4, velBase: 4 },
    "Carnevali":    { hpBase: 4, atkBase: 2, defBase: 5, velBase: 3 },
    "Valentina":    { hpBase: 4, atkBase: 2, defBase: 4, velBase: 2 },
    "Serghej":      { hpBase: 4, atkBase: 2, defBase: 4, velBase: 2 },
    "Babbo Natale": { hpBase: 5, atkBase: 4, defBase: 5, velBase: 2 },
    "Menza":        { hpBase: 4, atkBase: 3, defBase: 5, velBase: 6 },
    "Re e Merlino": { hpBase: 4, atkBase: 3, defBase: 6, velBase: 3 },
    "Mori":         { hpBase: 3, atkBase: 6, defBase: 3, velBase: 4 },
    "Bonacina":     { hpBase: 4, atkBase: 2, defBase: 4, velBase: 6 },
    "Capiluppi":    { hpBase: 3, atkBase: 5, defBase: 2, velBase: 8 },
    "Giulia":       { hpBase: 3, atkBase: 5, defBase: 3, velBase: 3 },
    "Falco":        { hpBase: 4, atkBase: 3, defBase: 3, velBase: 4 },
    "Falco Genryusai": { hpBase: 3, atkBase: 7, defBase: 2, velBase: 4 },
    "Falco Roshi":  { hpBase: 5, atkBase: 2, defBase: 6, velBase: 3 },
    "Falco Monkey": { hpBase: 3, atkBase: 2, defBase: 3, velBase: 8 },
    "Falcoaalk":    { hpBase: 2, atkBase: 6, defBase: 2, velBase: 6 },
    "Falco Majin":  { hpBase: 4, atkBase: 3, defBase: 5, velBase: 4 },
    "Falco Shoto":  { hpBase: 4, atkBase: 2, defBase: 6, velBase: 4 },
    "Falco Hero":   { hpBase: 3, atkBase: 6, defBase: 2, velBase: 5 },
    "Falco Chan":   { hpBase: 4, atkBase: 2, defBase: 5, velBase: 5 },
    "Falco Dragon": { hpBase: 4, atkBase: 6, defBase: 3, velBase: 3 },
    "Falconitsu":   { hpBase: 2, atkBase: 5, defBase: 2, velBase: 7 },
    "Falco Malfalk": { hpBase: 4, atkBase: 5, defBase: 5, velBase: 2 },
    "Falcosing":    { hpBase: 4, atkBase: 2, defBase: 5, velBase: 5 },
    "Maccioni":     { hpBase: 3, atkBase: 6, defBase: 1, velBase: 6 },
    "Maccione F2":  { hpBase: 5, atkBase: 2, defBase: 6, velBase: 5 },
    "Savina":       { hpBase: 4, atkBase: 5, defBase: 5, velBase: 2 },
    "Savina F2":    { hpBase: 3, atkBase: 6, defBase: 3, velBase: 6 },
    "Mattia":       { hpBase: 3, atkBase: 6, defBase: 3, velBase: 4 },
    "Mattia F2":    { hpBase: 4, atkBase: 7, defBase: 2, velBase: 5 },
    "Danilo":       { hpBase: 4, atkBase: 5, defBase: 2, velBase: 3 },
    "Danilo F2":    { hpBase: 4, atkBase: 6, defBase: 2, velBase: 4 },
    "Gio":          { hpBase: 4, atkBase: 6, defBase: 3, velBase: 9 },
    "Sat":          { hpBase: 5, atkBase: 9, defBase: 4, velBase: 4 },
    "Kul":          { hpBase: 6, atkBase: 4, defBase: 4, velBase: 8 },
    "Edo":          { hpBase: 8, atkBase: 3, defBase: 3, velBase: 8 },
    "MAX":          { hpBase: 6, atkBase: 4, defBase: 6, velBase: 8 },
    "MAX F2":       { hpBase: 6, atkBase: 8, defBase: 2, velBase: 8 },
    "MAX F3":       { hpBase: 8, atkBase: 3, defBase: 8, velBase: 5 },
    "Ilie":         { hpBase: 3, atkBase: 4, defBase: 2, velBase: 3 },
    "Mattia Sped":  { hpBase: 3, atkBase: 4, defBase: 1, velBase: 4 },
};

/**
 * Applica le statistiche della Run Veloce al pokemonDatabase.
 * Sovrascrive hpBase, atkBase, defBase, velBase e rende atkSpec=atkBase, defSpec=defBase.
 * Chiamata solo se isRunVeloce === true.
 */
function applicaOverrideRunVeloce() {
    if (typeof pokemonDatabase === "undefined") return;
    
    pokemonDatabase.forEach(entry => {
        const override = STATS_RUN_VELOCE[entry.nome];
        if (override) {
            entry.hpBase  = override.hpBase;
            entry.atkBase = override.atkBase;
            entry.defBase = override.defBase;
            entry.velBase = override.velBase;
            // In Run Veloce non esistono atkSpec/defSpec separati
            entry.atkSpec = override.atkBase;
            entry.defSpec = override.defBase;
        }
    });
    
    console.log("[Run Veloce] Stats override applicato a", pokemonDatabase.length, "personaggi.");
}

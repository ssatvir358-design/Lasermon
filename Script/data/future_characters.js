// Reserved DB records: no invented statistics/sprites, and no accidental spawns.
// Activate a record only after receiving its stats, canonical name and assets.
const FutureCharacterDatabase = (() => {
    const names=['Anselmo','Cammalleri','NYSSA EVO','KIORA EVO','CASSIAN EVO','BUSSO KING OF LOL','CHEF BELLINI','KIT EVO','MARIEL EVO','DANIELE E ALE FUSAR','CARRA EVO','CONIGLIO PASQUALE','SUPER GIAN','SHITTY GIAN','ILIE — MADRE NATURA','ILIE — ALTA MAREA','ILIE — INFERNO','ILIE — DRAGON KING'];
    return names.map(nome=>({
        id:UltimateCatalog.key(nome),nome,
        sesso:['NYSSA EVO','KIORA EVO','MARIEL EVO','ILIE — MADRE NATURA'].includes(nome)?'femmina':'maschio',
        implementato:false,reclutabile:false,statistichePendenti:true,
        hpBase:null,atkBase:null,atkSpec:null,defBase:null,defSpec:null,velBase:null,
        elemento:null,raritaTipo:null,immagine:null,immagineAtk:null,
        ultimate:UltimateCatalog.get(nome),
        note:nome.startsWith('ILIE —')?'Etichetta provvisoria per distinguere le quattro righe Ilie; nome canonico e forma da confermare.':'In attesa di statistiche e cartella sprite.'
    }));
})();
// The DB explicitly exposes both sets. Gameplay iterates only ready characters.
const CharacterRegistry={attivi:pokemonDatabase,riservati:FutureCharacterDatabase,
    find(nome){const k=UltimateCatalog.key(nome);return [...this.attivi,...this.riservati].find(p=>UltimateCatalog.key(p.nome)===k);}};
pokemonDatabase.forEach(p=>{p.implementato=true;p.ultimate=UltimateCatalog.get(p);});

pokemonDatabase.riservati=FutureCharacterDatabase;

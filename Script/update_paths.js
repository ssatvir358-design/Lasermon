const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Utente/Desktop/sito laser poke';
const scriptDir = path.join(baseDir, 'Script');

// 1. Fix pokemon.js
let pkmPath = path.join(scriptDir, 'data', 'pokemon.js');
let pkmContent = fs.readFileSync(pkmPath, 'utf8');

pkmContent = pkmContent.replace(/nome: "(.*?)",([^}]*)immagine: "(.*?)",([^}]*)immagineAtk: "(.*?)"/g, (match, nome, mid1, img, mid2, imgAtk) => {
    let folder = nome.replace(' Fase 2', 'F2').replace(' Fase 3', 'F3');
    // Rimuovi eventuali path già presenti per sicurezza
    img = img.split('/').pop();
    imgAtk = imgAtk.split('/').pop();
    return `nome: "${nome}",${mid1}immagine: "../Sprite/personaggi/${folder}/${img}",${mid2}immagineAtk: "../Sprite/personaggi/${folder}/${imgAtk}"`;
});
fs.writeFileSync(pkmPath, pkmContent);

// 2. Fix boss.js
let bossPath = path.join(scriptDir, 'data', 'boss.js');
let bossContent = fs.readFileSync(bossPath, 'utf8');
bossContent = bossContent.replace(/iconaChibi: "(.*?)",\s*immagine: "(.*?)"/g, (match, chibi, img) => {
    chibi = chibi.split('/').pop();
    img = img.split('/').pop();
    let folder = chibi.replace('Chibi.jpeg', '').replace('Boss.jpeg', '');
    return `iconaChibi: "../Sprite/personaggi/${folder}/${chibi}",\n        immagine: "../Sprite/personaggi/${folder}/${img}"`;
});
fs.writeFileSync(bossPath, bossContent);

// 3. Fix mappe.js
let mappePath = path.join(scriptDir, 'data', 'mappe.js');
let mappeContent = fs.readFileSync(mappePath, 'utf8');
mappeContent = mappeContent.replace(/sfondo: "(.*?)"/g, (match, img) => {
    img = img.split('/').pop();
    return `sfondo: "../Sprite/mappe/${img}"`;
});
fs.writeFileSync(mappePath, mappeContent);

console.log('Finito data files!');

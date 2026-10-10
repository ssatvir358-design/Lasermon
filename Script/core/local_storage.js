// Distribuzione locale: un solo giocatore, progressi nel browser.
const AppStorage = {
    getPrefix() { return 'guest_'; },
    getItem(key) { return localStorage.getItem(this.getPrefix() + key) ?? localStorage.getItem(key); },
    setItem(key, value) { localStorage.setItem(this.getPrefix() + key, value); },
    removeItem(key) { localStorage.removeItem(this.getPrefix() + key); localStorage.removeItem(key); }
};

function localMessage(message) {
    document.getElementById('local-message').textContent = message;
}
function apriImpostazioni() {
    const audio = document.getElementById('musica-gioco');
    document.getElementById('slider-volume').value = audio?.volume ?? .25;
    document.getElementById('chk-muto').checked = audio?.volume === 0;
    document.getElementById('chk-autoskip').checked = isAutoskipAbilitato;
    localMessage('');
    BattleUI.openModal('modal-impostazioni');
}
function chiudiImpostazioni() { BattleUI.closeModal('modal-impostazioni'); }
function switchImpostazioniTab(tab) {
    ['dati', 'gioco'].forEach(name => {
        const active = name === tab;
        document.getElementById('content-tab-' + name).hidden = !active;
        document.getElementById('tab-' + name).setAttribute('aria-selected', String(active));
    });
}
const LOCAL_SAVE_KEYS = new Set([
    'laserpoke_save_1', 'laserpoke_save_2', 'laserpoke_save_3', 'laserpoke_save_auto',
    'laserpoke_hall_of_fame', 'laserpoke_challenge_progress', 'laserpoke_interface',
    'laserpoke_pokedex_favorites', 'laserPoke_volume', 'laserPoke_autoskip'
]);
function esportaProgressiLocali() {
    try {
        salvaCheckpointLocale();
        const values = {};
        for (const key of LOCAL_SAVE_KEYS) {
            const value = AppStorage.getItem(key);
            if (value !== null) values[key] = value;
        }
        const blob = new Blob([JSON.stringify({format:'lasermon-local', version:1, values})], {type:'application/json'});
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = 'lasermon-progressi.json'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        localMessage('Backup esportato. Conservalo per trasferire i progressi.');
    } catch (error) { localMessage(error.message || 'Esportazione non riuscita.'); }
}
async function importaProgressiLocali(event) {
    const file = event.target.files[0]; event.target.value = '';
    if (!file) return;
    try {
        if (file.size > 5 * 1024 * 1024) throw new Error('Il file supera 5 MB.');
        const data = JSON.parse(await file.text());
        if (data.format !== 'lasermon-local' || data.version !== 1 || !data.values || typeof data.values !== 'object' || Array.isArray(data.values)) throw new Error('Backup locale non valido.');
        const entries = Object.entries(data.values);
        for (const [key,value] of entries) {
            if (!LOCAL_SAVE_KEYS.has(key) || typeof value !== 'string') throw new Error('Il backup contiene dati non riconosciuti.');
            JSON.parse(value);
        }
        if (!confirm('Sostituire i progressi locali con questo backup? Esporta prima i progressi da conservare.')) return;
        const previous = [...LOCAL_SAVE_KEYS].map(key => [key, localStorage.getItem('guest_' + key), localStorage.getItem(key)]);
        try {
            for (const key of LOCAL_SAVE_KEYS) AppStorage.removeItem(key);
            for (const [key,value] of entries) AppStorage.setItem(key,value);
        } catch(error) {
            for (const [key,prefixed,legacy] of previous) {
                if (prefixed === null) localStorage.removeItem('guest_' + key); else localStorage.setItem('guest_' + key,prefixed);
                if (legacy === null) localStorage.removeItem(key); else localStorage.setItem(key,legacy);
            }
            throw error;
        }
        sessionStorage.removeItem('laserpoke_resume');
        location.reload();
    } catch (error) { localMessage(error.message || 'Importazione non riuscita.'); }
}
document.addEventListener('DOMContentLoaded', () => {
    apriModalImpostazioni = apriImpostazioni;
    chiudiModalImpostazioni = chiudiImpostazioni;
});

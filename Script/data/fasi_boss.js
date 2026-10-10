// Optional explicit HP waves. Existing transformations are read from engine state.
const CONFIG_FASI_BOSS = {};
const COLORI_FASI_BOSS = ['#963ef0', '#a5ed35', '#fa4949', '#c7d9ec', '#f9bf35', '#37cbdc'];

function getStatoFasiBoss(enemy) {
    if (!enemy) return null;
    const custom = CONFIG_FASI_BOSS[enemy.nome];
    if (custom) return {colors:custom.fasi.map(phase => phase.colore), index:enemy.faseAttuale || 0};
    if (typeof isChallengeBattle !== 'undefined' && isChallengeBattle) {
        const count = CHALLENGE_BOSSES[currentChallengeBossId]?.fasi || 1;
        // The phase changes when its stats and sprite are actually applied, after the video.
        return count > 1 ? {colors:COLORI_FASI_BOSS.slice(0,count),index:enemy.faseAttuale || 0} : null;
    }
    if (!enemy.boss && !enemy.isMiniboss) return null;
    const name = enemy.nome.toLowerCase();
    const base = name.replace(/\s*(?:fase\s*|f)[23]$/i,'').trim();
    if (base === 'max') return {colors:COLORI_FASI_BOSS.slice(0,3),index:enemy.maxFase3 || /f3$/i.test(name) ? 2 : enemy.maxFase2 || /f2$/i.test(name) ? 1 : 0};
    const flag = {sat:'satInFase2',edo:'edoInFase2',gio:'gioInFase2'}[base];
    if (flag) return {colors:COLORI_FASI_BOSS.slice(0,2),index:enemy[flag] ? 1 : 0};
    const phase2 = pokemonDatabase.some(p => {
        const n = p.nome.toLowerCase();
        return n === base + ' f2' || n === base + ' fase 2';
    });
    if (phase2) return {colors:COLORI_FASI_BOSS.slice(0,2),index:enemy.inFase2 || /(?:f2|fase 2)$/i.test(name) ? 1 : 0};
    return null;
}

function aggiornaFasiBoss(enemy) {
    const container = document.getElementById('enemy-phase-dots');
    if (!container) return;
    const state = getStatoFasiBoss(enemy);
    container.hidden = !state;
    if (!state) { container.replaceChildren(); return; }
    const index = Math.min(state.colors.length - 1,Math.max(0,state.index));
    container.setAttribute('aria-label','Fase ' + (index+1) + ' di ' + state.colors.length);
    container.replaceChildren(...state.colors.map((color,i) => {
        const dot = document.createElement('span');
        dot.className = 'phase-dot' + (i < index ? ' spento' : i === index ? ' fase-attiva' : '');
        dot.style.setProperty('--phase-color',color);
        dot.title = 'Fase ' + (i+1) + (i < index ? ' · Completata' : i === index ? ' · Attuale' : ' · Successiva');
        return dot;
    }));
    const hp = document.getElementById('barra-nemico');
    hp.style.backgroundColor = state.colors[index];
    hp.dataset.phase = String(index+1);
}

// Battle HUD: views reuse the combat engine and its real inventory.
const BattleUI = {
    panel: 'log', turn: 1, playerTurns: 0, focusBeforeModal: null,
    escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    },
    canAct(kind = 'lotta') {
        const id = {lotta:'btn-attacco', squadra:'btn-pokemon', borsa:'btn-item'}[kind];
        return !!mioPokemon && mioPokemon.hpAttuali > 0 && !!document.getElementById(id) && !document.getElementById(id).disabled;
    },
    reset() {
        const details=document.getElementById('modal-battle-fighter');
        if(details)details.style.display='none';
        this.turn = 1;
        this.playerTurns = 0;
        this.show('log');
        this.refresh();
    },
    show(kind) {
        this.hideMoveHint();
        if (!['log', 'lotta', 'squadra', 'borsa'].includes(kind)) return;
        if (kind !== 'log' && !this.canAct(kind)) return;
        this.panel = kind;
        const moves = kind === 'lotta';
        const side = moves ? 'log' : kind;
        document.getElementById('battle-stage').dataset.action = moves ? 'moves' : 'menu';
        document.getElementById('right-panel').dataset.view = side;
        document.getElementById('right-panel').setAttribute('aria-label',side==='squadra'?'Squadra in combattimento':side==='borsa'?'Borsa in combattimento':'Log di combattimento');
        for (const panel of ['lotta','squadra','borsa']) {
            document.getElementById('panel-content-' + panel).classList.toggle('active', panel === kind);
        }
        document.getElementById('panel-content-log').hidden = side !== 'log';
        document.getElementById('btn-close-panel').hidden = side === 'log';
        document.getElementById('fight-button-label').textContent = moves ? 'INDIETRO' : 'LOTTA';
        const fightIcon=document.getElementById('fight-button-icon');
        if(!fightIcon.dataset.original)fightIcon.dataset.original=fightIcon.innerHTML;
        fightIcon.innerHTML=moves?'<path d="M20 12H4m6-6-6 6 6 6"/>':fightIcon.dataset.original;
        for (const id of ['btn-pokemon','btn-item','btn-fuga']) document.getElementById(id).hidden = moves;
        document.getElementById('btn-attacco').setAttribute('aria-label',moves?'Indietro alle azioni di combattimento':'Scegli una mossa');
        for (const [panel,id] of Object.entries({lotta:'btn-attacco',squadra:'btn-pokemon',borsa:'btn-item'})) {
            document.getElementById(id).setAttribute('aria-expanded', String(panel === kind));
        }
        if (kind === 'lotta') this.moves();
        if (kind === 'squadra') this.team();
        if (kind === 'borsa') this.bag();
    },
    moves() {
        const list = document.getElementById('lista-mosse');
        list.replaceChildren();
        if (!mioPokemon) return;
        const element = String(mioPokemon.elemento || 'normale').toLowerCase();
        const moveLevel = mioPokemon.livelloMossa || 1;
        const rows = this.moveRows ? this.moveRows() : [];
        rows.forEach(move => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'mossa-riga' + (move.ready ? '' : ' bloccata');
            row.dataset.moveKind = move.kind;
            const colors={acqua:'#64d4ff',buio:'#b29bdf',drago:'#a7a2ff',elettro:'#ffe16a',erba:'#9ce477',folletto:'#ffa2d6',fuoco:'#ff9467',ghiaccio:'#9aeef0',lotta:'#ef9f7b',luce:'#ffefac',normale:'#c5d0dd',psico:'#ff96bc',terra:'#ddbd83',veleno:'#d49aff',vento:'#a4e8d2'};
            row.style.setProperty('--move-color',colors[element]||colors.normale);
            row.disabled = !this.canAct();
            row.setAttribute('aria-disabled',String(!move.ready || !this.canAct()));
            if(move.description&&move.ready){row.title=move.description;row.addEventListener('pointerenter',()=>this.moveHint(row,move.description));row.addEventListener('pointerleave',()=>this.hideMoveHint());}
            if(!move.ready){
                row.setAttribute('aria-label',move.name+'. Bloccato. '+move.unlock);
                row.addEventListener('pointerenter',()=>this.moveHint(row,move.unlock));
                row.addEventListener('focus',()=>this.moveHint(row,move.unlock));
                row.addEventListener('pointerleave',()=>this.hideMoveHint());
                row.addEventListener('blur',()=>this.hideMoveHint());
            }
            const frame=move.kind==='auto'?'Base':move.kind==='elementale'?'Elementale':'Ultimate';
            row.style.backgroundImage = 'url("../Sprite/elementi/Righe mosse/'+frame+'Frame.svg")';
            row.innerHTML = '<span class="mossa-emblema" aria-hidden="true">'+(move.kind==='auto'?'Ⅰ':move.kind==='elementale'?'✦':'♛')+'</span><span class="mossa-info"><span class="mossa-rank">'+(move.kind==='auto'?'BASE':move.kind==='elementale'?this.escape(element.toUpperCase()):'LIMIT BREAK')+'</span><span class="mossa-nome">' + this.escape(move.name) + '</span><span class="mossa-tipo-text">' + this.escape(move.detail) + '</span></span><span class="mossa-usi" aria-label="'+(move.ready?'Disponibile':'Non disponibile')+'">' + (move.ready ? (move.kind==='auto'?'›':move.detail.match(/\d+\/\d+/)?.[0]||'›') : '⌑') + '</span>';
            if(!move.ready)row.insertAdjacentHTML('beforeend','<span class="move-lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/></svg></span>');
            row.addEventListener('click', () => {if(move.ready){this.hideMoveHint();scegliMossaUI(move.kind);}else this.moveHint(row,move.unlock);});
            list.append(row);
        });
    },
    team() {
        const list = document.getElementById('squadra-list');
        list.replaceChildren();
        miaSquadra.filter(Boolean).forEach(p => {
            const index = miaSquadra.indexOf(p);
            const current = p === mioPokemon;
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'lista-item-riga pokemon-row' + (current ? ' attivo' : '') + (p.hpAttuali <= 0 ? ' ko' : '');
            row.setAttribute('aria-label','Dettagli di '+p.nome);
            const pct = Math.max(0, Math.min(100, p.hpAttuali / p.hpMax * 100));
            row.innerHTML = '<img src="' + this.escape(p.immagine) + '" alt=""><span class="pokemon-row-info"><span class="pokemon-row-name"><strong>' + this.escape(p.nome) + '</strong><span>L. ' + p.livello + '</span></span><span class="team-hp-track"><span style="width:' + pct + '%"></span></span><span class="team-hp-value">' + Math.floor(p.hpAttuali) + '/' + p.hpMax + (current ? ' · IN CAMPO' : p.hpAttuali <= 0 ? ' · KO' : '') + '</span></span>';
            row.addEventListener('click', () => this.fighterDetails(index));
            list.append(row);
        });
    },
    moveHint(row,message) {
        let hint=document.getElementById('battle-move-tooltip');
        if(!hint){hint=document.createElement('div');hint.id='battle-move-tooltip';hint.role='tooltip';document.body.append(hint);}
        hint.textContent=message;hint.hidden=false;row.setAttribute('aria-describedby',hint.id);
        const r=row.getBoundingClientRect(),w=Math.min(320,innerWidth-24);
        hint.style.width=w+'px';hint.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2))+'px';
        hint.style.top=Math.max(12,r.top-hint.offsetHeight-12)+'px';
    },
    hideMoveHint(){const hint=document.getElementById('battle-move-tooltip');if(hint)hint.hidden=true;},
    fighterDetails(index) {
        const p=miaSquadra[index];if(!p)return;
        let modal=document.getElementById('modal-battle-fighter');
        if(!modal){modal=document.createElement('div');modal.id='modal-battle-fighter';modal.className='hud-modal';modal.innerHTML='<section class="hud-modal-dialog fighter-dialog" role="dialog" aria-modal="true" aria-labelledby="fighter-detail-title"><header class="hud-modal-header"><h2 id="fighter-detail-title"></h2><button type="button" aria-label="Chiudi dettagli" onclick="BattleUI.closeModal(\'modal-battle-fighter\')">×</button></header><div id="fighter-detail-body"></div></section>';modal.onclick=e=>{if(e.target===modal)this.closeModal(modal.id);};document.body.append(modal);}
        const esc=value=>this.escape(value),current=p===mioPokemon,ko=p.hpAttuali<=0;
        const stats=[['HP',Math.floor(p.hpAttuali)+' / '+p.hpMax],['ATK FS',Math.round(ItemSystem.stat(p,'atk'))],['DEF FS',Math.round(ItemSystem.stat(p,'def'))],['ATK SP',Math.round(ItemSystem.stat(p,'atkSpec'))],['DEF SP',Math.round(ItemSystem.stat(p,'defSpec'))],['VELOCITÀ',Math.round(ItemSystem.stat(p,'vel'))]];
        const equipment=ItemSystem.equipment(p);
        const lore=p.lore||pokemonDatabase.find(base=>base.nome===p.nome)?.lore||'';
        document.getElementById('fighter-detail-title').textContent=p.nome;
        document.getElementById('fighter-detail-body').innerHTML='<div class="fighter-summary"><img src="'+esc(p.immagine)+'" alt="'+esc(p.nome)+'"><div><span class="fighter-state">'+(current?'IN CAMPO':ko?'KO':'IN PANCHINA')+'</span><h3>'+esc(p.nome)+'</h3><p>'+esc(String(p.elemento).toUpperCase())+' · Livello '+p.livello+'</p><p>'+esc(p.raritaTipo||'')+'</p><div class="team-hp-track"><span style="width:'+Math.max(0,Math.min(100,p.hpAttuali/p.hpMax*100))+'%"></span></div><p>PS '+Math.floor(p.hpAttuali)+' / '+p.hpMax+'</p></div></div><dl class="fighter-stats">'+stats.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl><section class="fighter-section"><h3>Mosse</h3><p>'+esc(getNomeMossaAttuale(p))+' · Livello mossa '+(p.livelloMossa||1)+'</p><p>Attacco elementale: '+((p.livelloMossa||1)>=3?'disponibile':'richiede livello mossa 3')+'</p></section><section class="fighter-section"><h3>Equipaggiamento</h3>'+ (equipment.length?equipment.map(item=>'<div class="fighter-equipment"><img src="'+esc(item.icona)+'" alt=""><div><strong>'+esc(item.nome)+'</strong><p>'+esc(item.descrizione)+'</p></div></div>').join(''):'<p>Nessun oggetto equipaggiato.</p>')+'</section><button type="button" class="fighter-deploy" '+(current||ko||!this.canAct('squadra')?'disabled':'')+'>'+ (current?'GIÀ IN CAMPO':ko?'PERSONAGGIO KO':'MANDA IN CAMPO')+'</button>';
        const ultimate=UltimateSystem.move(p);if(ultimate){const section=document.createElement('section');section.className='fighter-section';section.innerHTML='<h3>Ultimate · '+esc(ultimate.name)+'</h3><p>'+esc(ultimate.description)+'</p><p>Livello 50 richiesto · '+(p.ultimateUses[ultimate.id]??ultimate.uses)+' / '+ultimate.uses+' utilizzi</p><p>Elementale: '+p.elementalUses+' / 10 utilizzi · Sesso: '+esc(p.sesso)+'</p>';modal.querySelector('.fighter-deploy').before(section);}
        if(lore){const section=document.createElement('section');section.className='fighter-section';section.innerHTML='<h3>Il personaggio</h3><p>'+esc(lore)+'</p>';modal.querySelector('.fighter-deploy').before(section);}
        modal.querySelector('.fighter-deploy').onclick=()=>{if(this.canAct('squadra')&&p!==mioPokemon&&p.hpAttuali>0){this.closeModal(modal.id);eseguiScambioBattagliaUI(miaSquadra.indexOf(p));}};
        this.openModal(modal.id);
    },
    bag() {
        const list = document.getElementById('borsa-list');
        list.replaceChildren();
        const items = zaino.filter(entry => entry.quantita > 0 && getOggettoDb(entry.dbId)?.usabileInBattaglia);
        if (!items.length) {
            list.textContent = 'Non hai oggetti utilizzabili in battaglia.';
            return;
        }
        items.forEach(entry => {
            const item = getOggettoDb(entry.dbId);
            const limitReached = item.limiteUtilizziPerFight != null && (itemUsatiInFight[item.id] || 0) >= item.limiteUtilizziPerFight;
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'lista-item-riga bag-row';
            row.disabled = !this.canAct('borsa') || limitReached || itemUsatiQuestoTurno;
            row.innerHTML = '<img src="' + this.escape(item.icona) + '" alt=""><span><strong>' + this.escape(item.nome) + ' ×' + entry.quantita + '</strong><small>' + this.escape(limitReached ? 'Limite di utilizzi raggiunto' : item.descrizione) + '</small></span>';
            row.addEventListener('click', () => this.itemTargets(item));
            list.append(row);
        });
    },
    itemTargets(item) {
        if (!this.canAct('borsa') || itemUsatiQuestoTurno) return;
        const list = document.getElementById('borsa-list');
        list.replaceChildren();
        const back = document.createElement('button');
        back.type = 'button'; back.className = 'panel-back'; back.textContent = '← Borsa · ' + item.nome;
        back.onclick = () => this.bag(); list.append(back);
        miaSquadra.forEach((p,index) => {
            if (!p) return;
            const reason = ItemSystem.validateUse(item,p,true);
            const valid = !reason;
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'lista-item-riga pokemon-row';
            button.disabled = !valid;
            button.innerHTML = '<img src="' + this.escape(p.immagine) + '" alt=""><span><strong>' + this.escape(p.nome) + '</strong><small>PS ' + Math.floor(p.hpAttuali) + '/' + p.hpMax + (valid ? '' : ' · ' + this.escape(reason)) + '</small></span>';
            button.onclick = () => {
                if (!this.canAct('borsa') || itemUsatiQuestoTurno || !valid) return;
                const cfg = getOggettoDb(item.id);
                if (cfg.limiteUtilizziPerFight != null && (itemUsatiInFight[cfg.id] || 0) >= cfg.limiteUtilizziPerFight) return;
                confermaUsoItemInBattaglia(item.id,index);
                this.show('log');
                this.refresh();
            };
            list.append(button);
        });
    },
    refresh() {
        document.getElementById('trainer-name').textContent = 'Giocatore';
        document.getElementById('trainer-avatar-img').src = mioPokemon?.immagine || '../Sprite/UI/Combattimento/leone.png';
        if(typeof GamePresentation !== 'undefined') GamePresentation.syncFighters();
        const balls = document.getElementById('trainer-pokeballs');
        balls.replaceChildren();
        miaSquadra.forEach(p => {
            if (!p) return;
            const dot = document.createElement('span');
            dot.className = 'team-ball' + (p.hpAttuali <= 0 ? ' fainted' : '') + (p === mioPokemon ? ' current' : '');
            dot.title = p.nome + (p.hpAttuali <= 0 ? ' · KO' : p === mioPokemon ? ' · In campo' : '');
            balls.append(dot);
        });
        document.getElementById('turn-number').textContent = String(this.turn).padStart(2,'0');
        for (const [side,action] of [['btn-menu-zaino','borsa'],['btn-menu-squadra','squadra']]) {
            document.getElementById(side).disabled = !this.canAct(action);
        }
        const text = document.getElementById('dialog-testo');
        text.textContent = mioPokemon ? (this.canAct() ? 'Cosa farà ' + mioPokemon.nome + '?' : 'Il combattimento è in corso…') : 'Preparati alla battaglia';
        if (this.panel !== 'log' && !this.canAct(this.panel)) this.show('log');
        aggiornaFasiBoss(nemicoPokemon);
    },
    entries() {
        const source = document.getElementById('console-log');
        const holder = document.createElement('div');
        holder.innerHTML = source.innerHTML.replace(/<div class="combat-entry" data-category="([^"]+)">/g, '\n[$1] ').replace(/<\/div>/g,'\n').replace(/<hr\b[^>]*>|<br\s*\/?\s*>/gi, '\n');
        // textContent preserves all messages, including older engine writes using += innerHTML.
        return holder.textContent.split(/\n+/).map(s => s.trim()).filter(Boolean).map((text,index) => {
            const norm = text.toLowerCase();
            const categories = [];
            const tagged=text.match(/^\[(buff|debuff|risorse|turni|cambi|mosse|status|danni|cure)\]/);if(tagged)categories.push(tagged[1]);
            if (/dann|infligg|subisc|per[sd][eo].*(ps|hp)|colp|critico/.test(norm)) categories.push('danni');
            if (/cur[aoe]|recuper|rigener|ripristin|reviv|rianim/.test(norm)) categories.push('cure');
            if (/bruci|bagnat|livido|shock|ipnot|congel|ombra|bened|ammali|velen|buff|debuff|immun|schiv|scudo|status|parali|statistic|effetto/.test(norm)) categories.push('status');
            if (/fase|trasform|forma|shift/.test(norm)) categories.push('fasi');
            return {text:text.replace(/^\[[^\]]+\] /,''),categories,index:index+1};
        });
    },
    diary() {
        const search = document.getElementById('diario-search').value.trim().toLocaleLowerCase('it');
        const category = document.getElementById('diario-filter').value;
        const all = this.entries();
        const filtered = all.filter(entry => entry.text.toLocaleLowerCase('it').includes(search) && (category === 'all' || entry.categories.includes(category)));
        const list = document.getElementById('diario-log-content');
        list.replaceChildren();
        filtered.forEach(entry => {
            const row = document.createElement('div'); row.className = 'diary-entry';
            const number = document.createElement('span'); number.className = 'diary-number'; number.textContent = String(entry.index).padStart(3,'0');
            const message = document.createElement('span'); message.textContent = entry.text;
            row.append(number,message); list.append(row);
        });
        if (!filtered.length) list.textContent = 'Nessun messaggio corrisponde ai filtri.';
        document.getElementById('diario-count').textContent = filtered.length + ' / ' + all.length + ' messaggi';
    },
    openModal(id) {
        const modal = document.getElementById(id);
        this.focusBeforeModal = document.activeElement;
        modal.style.display = 'flex';
        modal.querySelector('input,button,select')?.focus();
    },
    closeModal(id) {
        document.getElementById(id).style.display = 'none';
        this.focusBeforeModal?.focus();
    }
};

function getSfondoRigaMossa(elemento) {
    const allowed = ['acqua','buio','drago','elettro','erba','folletto','fuoco','ghiaccio','lotta','luce','normale','psico','terra','veleno','vento'];
    const el = allowed.includes(String(elemento).toLowerCase()) ? String(elemento).toLowerCase() : 'normale';
    return '../Sprite/elementi/Righe mosse/' + el.charAt(0).toUpperCase() + el.slice(1) + 'Riga.svg';
}
function apriPannelloDestro(tipo) { BattleUI.show(BattleUI.panel === tipo ? 'log' : tipo); }
function chiudiPannelloDestro() { BattleUI.show('log'); }
function renderListaMosse() { BattleUI.moves(); }
function renderSquadraPannelloDestro() { BattleUI.team(); }
function renderBorsaPannelloDestro() { BattleUI.bag(); }
function scegliMossaUI(tipo) {
    if (!BattleUI.canAct() || tipo === 'speciale' || (tipo === 'elementale' && mioPokemon.livelloMossa < 3)) return;
    BattleUI.show('log');
    eseguiSceltaAttacco(tipo);
}
function eseguiScambioBattagliaUI(index) {
    const target = miaSquadra[index];
    if (!BattleUI.canAct('squadra') || !target || target === mioPokemon || target.hpAttuali <= 0) return;
    // Use the actual active Pokémon, which is not always miaSquadra[0] after a KO.
    const previous = mioPokemon;
    const currentIndex = miaSquadra.indexOf(previous);
    if (currentIndex >= 0) { miaSquadra[currentIndex] = target; miaSquadra[index] = previous; }
    mioPokemon = target;
    if (typeof indiceMioPokemonAttuale !== 'undefined') indiceMioPokemonAttuale = miaSquadra.indexOf(target);
    BattleUI.show('log');
    document.getElementById('console-log').innerHTML += '<hr>' + BattleUI.escape(previous.nome) + ' torna indietro! Vai <strong>' + BattleUI.escape(target.nome) + '</strong>!';
    ['btn-attacco','btn-pokemon','btn-item','btn-fuga'].forEach(id => document.getElementById(id).disabled = true);
    aggiornaGrafica();
    setTimeout(turnoNemico, isSkipAttivo ? 500 : 1000);
}
function aggiungiLogBattaglia(testo) {
    const log = document.getElementById('console-log');
    log.innerHTML += '<br>' + testo;
}
function aggiornaDialog(testo) { document.getElementById('dialog-testo').textContent = testo; }
function apriDiario() { BattleUI.openModal('modal-diario'); BattleUI.diary(); }
function chiudiDiario() { BattleUI.closeModal('modal-diario'); }
function filtraDiario() { BattleUI.diary(); }
function aggiornaContenutoDiario() { BattleUI.diary(); }

// Load after every combat module, so old modal functions cannot overwrite these adapters.
apriPannelloSelezioneAttacco = () => BattleUI.show('lotta');
chiudiPannelloSelezioneAttacco = () => BattleUI.show('log');
apriSchermataPokemonBattaglia = () => BattleUI.show('squadra');
apriPannelloItemBattaglia = () => BattleUI.show('borsa');
chiudiPannelloItemBattaglia = () => BattleUI.show('log');

const aggiornaGraficaEngine = aggiornaGrafica;
aggiornaGrafica = function() { aggiornaGraficaEngine(); BattleUI.refresh(); };
const turnoGiocatoreEngine = turnoGiocatore;
turnoGiocatore = function() {
    if (!BattleUI.canAct()) return;
    BattleUI.playerTurns++;
    BattleUI.turn = Math.max(1,BattleUI.playerTurns);
    BattleUI.refresh();
    turnoGiocatoreEngine();
};
const preparaIncontroEngine = preparaIncontroBattaglia;
preparaIncontroBattaglia = function(...args) { BattleUI.reset(); preparaIncontroEngine(...args); };
const avviaBossEngine = avviaBossBattle;
avviaBossBattle = function(...args) { BattleUI.reset(); avviaBossEngine(...args); };

document.addEventListener('DOMContentLoaded', () => {
    const log = document.getElementById('console-log');
    new MutationObserver(() => {
        const nearBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 100;
        if (nearBottom || BattleUI.canAct()) log.scrollTop = log.scrollHeight;
        if (document.getElementById('modal-diario').style.display === 'flex') BattleUI.diary();
    }).observe(log,{childList:true,subtree:true,characterData:true});
    const hud = document.querySelector('.hex-buttons');
    new MutationObserver(() => BattleUI.refresh()).observe(hud,{subtree:true,attributes:true,attributeFilter:['disabled']});
    ['modal-diario','modal-impostazioni'].forEach(id => {
        const modal = document.getElementById(id);
        modal.addEventListener('click', event => { if (event.target === modal) BattleUI.closeModal(id); });
    });
    document.addEventListener('keydown', event => {
        const modal = ['modal-battle-fighter','modal-impostazioni','modal-diario'].map(id => document.getElementById(id)).find(el => el?.style.display === 'flex');
        if (event.key === 'Escape') {
            if (modal) BattleUI.closeModal(modal.id); else BattleUI.show('log');
        }
        if (event.key === 'Tab' && modal) {
            const nodes = Array.from(modal.querySelectorAll('button,input,select,a')).filter(el => !el.disabled && el.getClientRects().length);
            const first = nodes[0], last = nodes[nodes.length-1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    BattleUI.refresh();
});

function togglePannelloMappaMobile(panel) {
    const map = document.getElementById('schermata-mappa');
    const next = map.dataset.mobilePanel === panel ? '' : panel;
    map.dataset.mobilePanel = next;
    document.getElementById('map-mobile-team').setAttribute('aria-expanded',String(next === 'squadra'));
    document.getElementById('map-mobile-bag').setAttribute('aria-expanded',String(next === 'borsa'));
}

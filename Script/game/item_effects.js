// Catalogue v2. Runtime buffs live in a WeakMap and never mutate base statistics.
const ItemSystem = (() => {
    let runtime = new WeakMap();
    const negative = ['bruciatura','bagnato','livido','shock','congelato','ipnotizzato','ammaliato','veleno','ombra','benedizione','atkRidotto','defRidotta','velRidotta','confuso','sonno','stun','tentennamento','paralisi','blocco','future','sanguinamento','foglie','witch','ustione','iperveleno'];
    const norm = value => String(value || '').toLowerCase();
    const byId = value => DB_OGGETTI.find(x => x.id === (typeof value === 'string' ? value : value?.dbId || value?.id)) || null;
    const state = p => { if (!runtime.has(p)) runtime.set(p,{turns:0,incoming:0,enemyTurns:0,buffs:[],repeated:false}); return runtime.get(p); };
    const equipment = p => (p?.oggetti || []).map(byId).filter(x => x?.categoria === 'equipaggiabile');
    const eligible = (cfg,p,party = miaSquadra) => {
        if (!cfg || !p) return 'Oggetto o personaggio non disponibile.';
        if (cfg.restriction === 'drago' && norm(p.elemento) !== 'drago') return 'Equipaggiabile solo dai personaggi Drago.';
        if (cfg.restriction === 'party:luce' && !party.some(x => norm(x?.elemento) === 'luce')) return 'Serve un personaggio Luce in squadra.';
        return '';
    };
    const has = (p,passive) => equipment(p).some(x => x.passive === passive && !eligible(x,p));
    const status = p => (typeof UltimateSystem !== "undefined" && p) ? UltimateSystem.state(p).statuses : p === mioPokemon ? effettiAttivi.giocatore : p === nemicoPokemon ? effettiAttivi.nemico : p?.itemStatuses || {};
    const hasStatus = p => negative.some(key => !!status(p)[key]);
    const cleanse = p => { if(typeof UltimateSystem!=="undefined")UltimateSystem.cleanse(p); const s=status(p); negative.forEach(key => { s[key]=null; }); p.bruciato=false; p.hasMarchioLupo=false; };
    const isBattle = () => !!document.getElementById('schermata-gioco')?.classList.contains('attiva');
    const available = (category, map = Number(String(mappaAttuale).replace('mappa','')) || 1) => DB_OGGETTI.filter(x => (!category || x.categoria===category) && x.mappeAbilitate.includes(map));
    function reward(category) {
        const pool=available(category); const cfg=pool[Math.floor(Math.random()*pool.length)];
        if(cfg) aggiungiAZaino(cfg.id); return cfg;
    }
    function recalculate(p) {
        if(!p) return;
        const ratio = p.hpMax > 0 && Number.isFinite(p.hpAttuali) ? Math.max(0,Math.min(1,p.hpAttuali/p.hpMax)) : 1;
        p.oggetti=equipment(p);
        const mods={hp:0,atk:0,def:0,atkSpec:0,defSpec:0,vel:0};
        equipment(p).filter(x=>!eligible(x,p)).forEach(x=>Object.entries(x.modifiers||{}).forEach(([k,v])=>{mods[k]+=v;}));
        const growth=has(p,'dragon') ? Math.max(0,Number(p.dragonKills)||0)*.0025 : 0;
        p.bonus={};
        for(const [key,baseKey] of Object.entries({hp:'baseHpMax',atk:'baseAtk',def:'baseDef',atkSpec:'baseAtkSpec',defSpec:'baseDefSpec',vel:'baseVel'})){
            const actual=key==='hp'?'hpMax':key;
            const base=Number(p[baseKey]) || Number(p[actual]) || 1;
            const total=Math.max(1,Math.round(base*(1+mods[key])*(1+growth)));
            p[actual]=total; p.bonus[key]=total-base;
        }
        p.hpAttuali=ratio===0?0:Math.max(1,Math.min(p.hpMax,Math.round(p.hpMax*ratio)));
    }
    function validateUse(cfg,p,battle=isBattle()) {
        if(!cfg?.effect || !p) return 'Oggetto non utilizzabile.';
        const e=cfg.effect;
        if(e.kind==='revive') return p.hpAttuali>0?'Questo alleato non è KO.':'';
        if(p.hpAttuali<=0) return 'Questo alleato è KO: serve una Piuma della Rinascita o della Fenice.';
        if(e.kind==='heal' && p.hpAttuali>=p.hpMax && !(e.cleanse&&hasStatus(p))) return 'HP già al massimo.';
        if(e.kind==='cleanse' && !hasStatus(p)) return 'Nessuna alterazione di stato da rimuovere.';
        if(!['heal','revive','cleanse'].includes(e.kind)) {
            if(!battle) return 'Questo consumabile si usa durante un combattimento.';
            if(p!==mioPokemon) return 'Usalo sul personaggio attualmente in campo.';
        }
        if(e.kind==='bind' && !(isBossFight || nemicoPokemon?.boss || nemicoPokemon?.isMiniboss)) return 'Le Catene funzionano solo contro Boss e Mini Boss.';
        if(e.kind==='bind' && state(nemicoPokemon).bound>0) return 'Il nemico è già bloccato.';
        return '';
    }
    function use(cfg,p,battle=isBattle()) {
        const reason=validateUse(cfg,p,battle); if(reason) return {ok:false,message:reason};
        const e=cfg.effect, before=p.hpAttuali, s=state(p); let message=cfg.descrizione;
        if(e.kind==='heal') {p.hpAttuali=Math.min(p.hpMax,p.hpAttuali+(e.flat||Math.max(1,Math.round(p.hpMax*e.percent)))); if(e.cleanse)cleanse(p);message=`${p.nome} recupera ${p.hpAttuali-before} HP.${e.cleanse?' Stati rimossi.':''}`;}
        if(e.kind==='revive') {p.hpAttuali=Math.max(1,Math.round(p.hpMax*e.percent));cleanse(p);message=`${p.nome} torna in campo con ${p.hpAttuali} HP!`;}
        if(e.kind==='cleanse') cleanse(p);
        const addBuff=(stats,value,turns,clock='owner')=>{
            // A new dose refreshes the same group, without infinite potion stacking.
            const key=stats.join(':');s.buffs=s.buffs.filter(b=>b.key!==key);
            s.buffs.push({key,stats,value,remaining:turns,clock});
        };
        if(e.kind==='buff') addBuff(e.stats,e.value,e.turns,e.stats.includes('def')?'enemy':'owner');
        if(e.kind==='guard') addBuff(['guard'],e.value,e.turns,'enemy');
        if(e.kind==='gamble') {const win=Math.random()<.5;addBuff(['atk','atkSpec'],win?2:-.5,win?1:2);message=win?'CAOS FAVOREVOLE! Entrambi gli attacchi +200% per 1 turno.':'CAOS AVVERSO! Entrambi gli attacchi −50% per 2 turni.';}
        if(e.kind==='bind') {const win=Math.random()<e.chance; if(win)state(nemicoPokemon).bound=e.turns;message=win?`${nemicoPokemon.nome} è ancorato a terra per 2 turni!`:'Le catene si spezzano: il nemico resiste!';}
        if(window.BattleFX && p===mioPokemon && p.hpAttuali>before) BattleFX.heal('player',p.hpAttuali-before);
        return {ok:true,message};
    }
    function stat(p,key,value=p[key]) {
        let mult=1; for(const b of state(p).buffs) if(b.stats.includes(key)) mult+=b.value;
        // Fiamma Nera transfers the additional 20% to the source while Ombra lasts.
        const other=typeof UltimateSystem!=="undefined"?UltimateSystem.opponent(p):p===mioPokemon?nemicoPokemon:mioPokemon;
        const shadow=other?status(other).ombra:null;
        if(shadow?.source===p && shadow.durata>0) value+=Number(other[key]||0)*(.15+(shadow.extraSteal||0)+.15*(shadow.stack||0));
        return Math.max(1,value*Math.max(.05,mult));
    }
    function efficacy(p,target,base) {return has(p,'thorn')&&status(target).livido ? Math.max(2,base):base;}
    function damage(p,target,amount,efficacy,kind) {
        let mult=1;
        if(efficacy>1&&has(p,'eclipse'))mult*=1.15;
        if(kind==='ultimate'&&has(p,'titan'))mult*=1.15;
        if(has(p,'element:'+norm(p.elemento)))mult*=1.07;
        if(status(target).livido&&has(p,'bruise'))mult*=1.10;
        if(efficacy<=0)return 0;
        return Math.max(1,Math.round(amount*mult+(has(p,'blood')?target.hpMax*.015:0)));
    }
    function mitigation(p,amount) {const reduction=Math.max(0,...state(p).buffs.filter(b=>b.stats.includes('guard')).map(b=>b.value));return Math.max(0,Math.round(amount*(1-reduction)));}
    function evade(p,base,ultimate=false) {
        const s=state(p);s.incoming++;
        if(has(p,'sacred')&&s.enemyTurns===0) {log(`${p.nome} è protetto dalla Fiamma Sacra!`);return true;}
        if(has(p,'seer')&&s.incoming%4===0){log('Occhio del Veggente: quarto attacco schivato!');return true;}
        return !ultimate && Math.random()*100<Math.min(100,base+(has(p,'dodge')?5:0));
    }
    function beginTurn(p) {const s=state(p);s.turns++;s.repeated=false;}
    function repeat(p) {const s=state(p);if(has(p,'time')&&s.turns>0&&s.turns%5===0&&!s.repeated){s.repeated=true;log('Sfera del Tempo: un secondo attacco!');return true;}return false;}
    function finish(p,isEnemy) {
        if(!p)return;
        const tick=(q,clock)=>{const s=state(q);s.buffs=s.buffs.filter(b=>{if(b.clock===clock)b.remaining--;return b.remaining>0;});};
        tick(p,'owner');
        const defending=isEnemy?mioPokemon:nemicoPokemon;
        if(defending){tick(defending,'enemy');state(defending).enemyTurns++;}
    }
    function beginFight() {runtime=new WeakMap(); miaSquadra.filter(Boolean).forEach(recalculate);}
    function defeat(target) {if(!target||target._itemDefeatCredited)return;target._itemDefeatCredited=true;if(mioPokemon&&has(mioPokemon,'dragon')){mioPokemon.dragonKills=(Number(mioPokemon.dragonKills)||0)+1;recalculate(mioPokemon);log(`Cuore di Drago: ${mioPokemon.dragonKills} vittorie · +${(mioPokemon.dragonKills*.25).toLocaleString('it-IT')}% a tutte le statistiche.`);}}
    function stamp(p,target,key) {const s=status(target)[key];if(s){s.source=p;if(key==='bruciatura')s.itemMultiplier=has(p,'burn')?2:1;if(key==='veleno')s.itemMultiplier=has(p,'poison')?2:1;if(key==='ombra')s.extraSteal=has(p,'shadow')?.20:0;if(key==='bagnato')s.retainBonus=has(p,'wet')?.08:0;}}
    function immune(p,key) {return has(p,'resistance')&&['shock','congelato','ipnotizzato','ammaliato'].includes(key);}
    function skip(p,isEnemy) {const s=state(p);if(s.bound>0){s.bound--;log(`${p.nome} è bloccato dalle Catene del Colosso!`);return true;}return false;}
    function shock(p,isEnemy) {const other=isEnemy?mioPokemon:nemicoPokemon;if(other&&has(other,'battery')&&Math.random()<.5){state(other).battery=true;log('Batteria Fulminante: turno rubato!');}}
    function takeBattery(p) {const s=state(p);const result=!!s.battery;s.battery=false;return result;}
    function log(message) {const node=document.getElementById('console-log');if(node)node.innerHTML+='<br>✦ '+message;}
    // Explicit legacy conversions prevent old full item records reintroducing their effects.
    const oldEquipment={"equip_0": "eq_amuleto-vita", "equip_1": "eq_guanti-guerriero", "equip_2": "eq_bracciale-acciaio", "equip_3": "eq_cristallo-lunare", "equip_4": "eq_amuleto-vita", "equip_5": "eq_guanti-guerriero", "equip_6": "eq_bracciale-acciaio", "equip_7": "eq_cristallo-lunare", "equip_8": "eq_amuleto-vita", "equip_9": "eq_guanti-guerriero", "equip_10": "eq_bracciale-acciaio", "equip_11": "eq_cristallo-lunare", "equip_12": "eq_amuleto-vita", "equip_13": "eq_bracciale-acciaio", "equip_14": "eq_guanti-guerriero", "equip_15": "eq_cristallo-lunare", "equip_16": "eq_amuleto-vita", "equip_17": "eq_bracciale-acciaio", "equip_18": "eq_guanti-guerriero", "equip_19": "eq_cristallo-lunare", "equip_20": "eq_amuleto-vita", "equip_21": "eq_guanti-guerriero", "equip_22": "eq_amuleto-vita", "equip_23": "eq_bracciale-acciaio", "equip_24": "eq_guanti-guerriero", "equip_25": "eq_cristallo-lunare"};
    const oldConsumables=['pozione-minore','pozione-maggiore','nettare-vitale','elisir-alba','nettare-vitale','elisir-aurora','pozione-maggiore','elisir-aurora','rugiada-pura','elisir-alba','furia-berserker'];
    function migrateId(value) {
        const raw=typeof value==='string'?value:value?.dbId||value?.id;
        if(byId(raw))return raw;
        if(/^cons_\d+$/.test(raw||'')){const n=Number(raw.split('_')[1]);return 'co_'+(n===99?'piuma-rinascita':oldConsumables[n]||'pozione-minore');}
        if(/^equip_\d+$/.test(raw||'')){
            const stat=value?.stat;
            return oldEquipment[raw] || 'eq_'+({hp:'amuleto-vita',atk:'guanti-guerriero',atkSpec:'anello-arcano',def:'bracciale-acciaio',defSpec:'medaglione-arcano',vel:'cristallo-lunare'}[stat]||'amuleto-vita');
        }
        return DB_OGGETTI.find(x=>norm(x.nome)===norm(value?.nome||raw))?.id||null;
    }
    function migrateBag(entries) {const result=[];for(const entry of entries||[]){const id=migrateId(entry);if(!id)continue;const q=Math.max(1,Math.floor(Number(entry.quantita)||1));const found=result.find(x=>x.dbId===id);if(found)found.quantita+=q;else result.push({dbId:id,quantita:q});}return result;}
    function migrateEquipment(entries) {return (entries||[]).map(migrateId).map(byId).filter(x=>x?.categoria==='equipaggiabile');}
    return {byId,equipment,has,eligible,available,reward,recalculate,validateUse,use,stat,efficacy,damage,mitigation,evade,beginTurn,repeat,finish,beginFight,defeat,stamp,immune,skip,shock,takeBattery,log,status,cleanse,migrateId,migrateBag,migrateEquipment};
})();

// Shared rules for player and enemy moves. Runtime state belongs to each PG,
// never to a screen slot: switching freezes its timers instead of deleting them.
const UltimateSystem = (() => {
    let runtime = new WeakMap(), serial = 0, busy = false;
    let prepared = null;
    const ATK = ['atk','atkSpec'], DEF = ['def','defSpec'], ALL = ['atk','atkSpec','def','defSpec','vel','hpMax'];
    const bad = ['bruciatura','veleno','bagnato','livido','ombra','benedizione','witch','atkRidotto','defRidotta','velRidotta','shock','congelato','ipnotizzato','ammaliato','confuso','sonno','stun','tentennamento','paralisi','blocco','future','sanguinamento','foglie','ira','ustione','iperveleno'];
    function escape(v) {return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    function log(message,category='status') {
        const box=document.getElementById('console-log');
        if(box) box.insertAdjacentHTML('beforeend',`<div class="combat-entry" data-category="${category}">${escape(message)}</div>`);
    }
    function state(p) {
        if(!runtime.has(p)) runtime.set(p,{id:++serial,turn:0,buffs:[],statuses:{},hits:0,basic:new Map(),used:new Set(),healed:new Set(),flat:[],shield:null,pec:null,overheal:0});
        return runtime.get(p);
    }
    function init(p) {
        if(!p)return;
        p.sesso=p.sesso||p.infoBase?.sesso||'maschio';
        p.ultimateUses=p.ultimateUses&&typeof p.ultimateUses==='object'?p.ultimateUses:{};
        const m=move(p);
        if(m&&p.ultimateUses[m.id]===undefined)p.ultimateUses[m.id]=m.uses;
        if(p.elementalUses===undefined)p.elementalUses=10;
        return p;
    }
    function move(p,enemy=false) {
        if(!p)return null;
        // Reo's Challenge engine never uses this catalog.
        if(enemy&&typeof isChallengeBattle!=='undefined'&&isChallengeBattle)return null;
        if(enemy&&p.nome?.toLowerCase().startsWith('max')) {
            const phase=p.faseAttuale??(p.maxFase3||p.nome.includes('F3')?2:p.maxFase2||p.nome.includes('F2')?1:0);
            const el=String(p.elemento).toLowerCase();
            const phaseName=phase>=2||el==='acqua'?'MAX F3':phase===1||el==='fuoco'?'MAX F2':'MAX';
            return UltimateCatalog.get(phaseName);
        }
        return UltimateCatalog.get(p);
    }
    function team(p) {return miaSquadra.includes(p)?miaSquadra:[nemicoPokemon,...nemiciIncontro].filter(Boolean);}
    function opponent(p) {return miaSquadra.includes(p)?nemicoPokemon:mioPokemon;}
    function bench(p) {return team(p).filter(q=>q!==p&&q.hpAttuali>0);}
    function bind(p,enemy) {
        if(!p)return;
        const s=state(p), slot=enemy?'nemico':'giocatore';
        effettiAttivi[slot]=s.statuses;
    }
    function bindActive(){bind(mioPokemon,false);bind(nemicoPokemon,true);}
    function beginFight() {
        // Recalculate after cleanup in case a fight was interrupted by a screen change.
        endFight();runtime=new WeakMap();prepared=null;busy=false;
        [...miaSquadra,nemicoPokemon,...nemiciIncontro].filter(Boolean).forEach(p=>{init(p);state(p);});
        bindActive();
    }
    function refill(list,reason) {
        if(typeof isChallengeBattle!=='undefined'&&isChallengeBattle)return;
        list.filter(Boolean).forEach(p=>{init(p);p.elementalUses=10;Object.values(UltimateCatalog.moves).forEach(m=>{
            if(m.limit!=='run'&&(p.ultimateUses[m.id]!==undefined||move(p)?.id===m.id))p.ultimateUses[m.id]=m.uses;
        });log(`${p.nome}: utilizzi ripristinati (${reason}), anche se KO.`, 'risorse');});
    }
    function challengeRefill(list) {
        list.filter(Boolean).forEach(p=>{p.elementalUses=10;p.ultimateUses={};const m=move(p);if(m)p.ultimateUses[m.id]=m.uses;});
    }
    function availability(p,kind,enemy=false) {
        if(!p)return {ok:false,reason:'Nessun personaggio in campo.'};
        init(p);
        if(kind==='auto')return {ok:true};
        if(kind==='elementale')return p.livelloMossa<3?{ok:false,reason:'Richiede livello mossa 3: usa un Disco MT.'}:p.elementalUses<=0?{ok:false,reason:'Utilizzi elementali esauriti. Ricarica al centro medico o dopo il boss finale della mappa.'}:{ok:true};
        const m=move(p,enemy);
        if(!m||m.uses<=0)return {ok:false,reason:'Ultimate non disponibile per questo personaggio.'};
        if(p.livello<50)return {ok:false,reason:'Richiede livello personaggio 50.'};
        if(p.ultimateUses[m.id]===undefined)p.ultimateUses[m.id]=m.uses;
        if(p.ultimateUses[m.id]<=0)return {ok:false,reason:m.limit==='run'?'Già utilizzata in questa run. Non si ricarica.':'Utilizzi Ultimate esauriti. Ricarica al centro medico o dopo il boss finale della mappa.'};
        const s=state(p),target=opponent(p);
        if(m.limit==='battaglia'&&s.used.has(m.id))return {ok:false,reason:'Già utilizzata in questa battaglia.'};
        if(m.limit==='bersaglio'&&target&&s.used.has(m.id+':'+state(target).id))return {ok:false,reason:'Già utilizzata su questo bersaglio. Cambiare fase non azzera il limite.'};
        if(m.effect==='bottardi'&&(isBossFight||tipoEventoAttuale==='boss'||(typeof isChallengeBattle!=='undefined'&&isChallengeBattle)))return {ok:false,reason:'Non è possibile fuggire dai boss, nemmeno con questa Ultimate.'};
        if(m.effect==='telemaco'&&!bench(p).some(q=>!s.healed.has(state(q).id)))return {ok:false,reason:'Non ci sono altri alleati curabili: Telemaco non può curare sé stesso o lo stesso alleato due volte.'};
        if(['arman','cammalleri','menza'].includes(m.effect)&&(!bench(p).length||!canSwitch(p)&&m.effect!=='arman'))return {ok:false,reason:'Serve un alleato vivo in panchina e il cambio deve essere consentito.'};
        if(['monkey','chan','altimani','falco','rauf'].includes(m.effect)&&!targets(p,m).length)return {ok:false,reason:'Serve almeno un alleato vivo valido.'};
        return {ok:true};
    }
    function stat(p,key,value) {
        if(!p)return value;
        let mult=1;
        for(const b of state(p).buffs)if(b.keys.includes(key))mult+=b.value;
        return value*Math.max(key==='dodge'||key==='damage'||key==='vamp'?0:.05,mult);
    }
    function hpFactor(p){return Math.max(.05,1+state(p).buffs.filter(b=>b.keys.includes('hpMax')).reduce((n,b)=>n+b.value,0));}
    function buff(p,keys,value,turns,source,options={}) {
        if(!p||p.hpAttuali<=0&&options.aliveOnly)return;
        if((value<0||options.statusKey)&&(p.isImmune===1||state(p).shield?.kind==='gio')){log(`${p.nome}: il boss è immune al debuff ${source}.`);return;}
        const s=state(p),before=hpFactor(p),id=source+':'+keys.join(',');
        let b=s.buffs.find(x=>x.id===id);
        if(!b){b={id,keys,value,remaining:turns,born:s.turn,...options};s.buffs.push(b);}
        else Object.assign(b,{value,remaining:turns,born:s.turn,...options});
        if(keys.includes('hpMax')){const ratio=hpFactor(p)/before;p.hpMax=Math.max(1,Math.round(p.hpMax*ratio));p.hpAttuali=Math.max(0,Math.round(p.hpAttuali*ratio));}
        log(`${p.nome}: ${value>=0?'buff':'debuff'} ${keys.map(k=>({atk:'ATK FS',atkSpec:'ATK SP',def:'DEF FS',defSpec:'DEF SP',vel:'VEL',hpMax:'HP massimi e attuali',dodge:'evasione',accuracy:'precisione',damage:'danni finali',vamp:'omnivamp'})[k]||k).join(', ')} ${value>=0?'+':''}${Math.round(value*100)}% · ${Number.isFinite(turns)?turns+' turni':'fino a fine battaglia'} (${source}).`,value>=0?'buff':'debuff');
    }
    function status(p,key,turns,source,extras={}) {
        if(!p||p.hpAttuali<=0)return false;
        const immuneKey={paralisi:'shock',stun:'shock',sonno:'ipnotizzato'}[key]||key;
        if((p.isImmune===1&&key!=='rigenerazione'&&key!=='catene')||state(p).shield?.kind==='gio'||ItemSystem.immune(p,immuneKey)){log(`${p.nome}: immune a ${key}.`);return false;}
        const previous=state(p).statuses[key];
        if(previous&&previous.origin!==extras.origin&&['stun','sonno','blocco','paralisi','tentennamento'].includes(key))turns=Math.max(turns,previous.durata||0);
        state(p).statuses[key]={durata:turns,source,...extras};
        log(`${p.nome}: ${key} per ${turns} turni (${source.nome||source}).`);return true;
    }
    function heal(p,amount,label,over=false) {
        if(!p||p.hpAttuali<=0)return 0;
        const before=p.hpAttuali;p.hpAttuali=over?p.hpAttuali+Math.max(0,Math.round(amount)):Math.min(Math.max(p.hpMax,p.hpAttuali),p.hpAttuali+Math.max(0,Math.round(amount)));
        const actual=p.hpAttuali-before;
        if(over)state(p).overheal+=actual;
        log(`${p.nome}: cura ${actual} HP (${label})${over?' · può superare gli HP massimi fino a fine battaglia':''}.`,'cure');
        if(window.BattleFX&&(p===mioPokemon||p===nemicoPokemon)&&actual)BattleFX.heal(p===mioPokemon?'player':'enemy',actual);
        return actual;
    }
    function cleanse(p,keys=bad) {
        const s=state(p);for(const k of keys)if(s.statuses[k]){delete s.statuses[k];log(`${p.nome}: rimosso ${k}.`);}
        const before=hpFactor(p);s.buffs=s.buffs.filter(b=>{if((keys===bad&&b.value<0)||keys.includes(b.statusKey)){log(`${p.nome}: rimosso modificatore ${b.id}.`);return false;}return true;});const ratio=hpFactor(p)/before;if(ratio!==1){p.hpMax=Math.max(1,Math.round(p.hpMax*ratio));p.hpAttuali=Math.max(0,Math.round(p.hpAttuali*ratio));}
        if(keys===bad){p.bruciato=false;p.hasMarchioLupo=false;}
    }
    function canSwitch(p) {return !state(p).statuses.catene;}
    function fullBlock(p){const s=state(p).statuses;return ['shock','congelato','sonno','stun','tentennamento','paralisi','benedizione','aria'].some(k=>s[k]?.durata>0)||(s.blocco?.durata>0&&s.blocco.chance===undefined);}
    function switchTo(p,q) {
        if(!q||q===p||q.hpAttuali<=0)return false;
        if(!canSwitch(p)){log(`${p.nome}: CATENE LASER impedisce ogni sostituzione.`);return false;}
        if(miaSquadra.includes(p)){mioPokemon=q;indiceMioPokemonAttuale=miaSquadra.indexOf(q);}
        else {nemiciIncontro=nemiciIncontro.filter(x=>x!==q);nemiciIncontro.push(p);nemicoPokemon=q;}
        bindActive();log(`${p.nome} torna in panchina, entra ${q.nome}. Effetti e durate del PG ritirato rimangono congelati.`, 'cambi');return true;
    }
    function damage(source,target,amount,options={}) {
        if(!target||target.hpAttuali<=0||amount<=0)return 0;
        const ts=state(target),ss=source?state(source):null,element=String(options.element||source?.elemento||'normale').toLowerCase();
        if(ts.statuses.aria&&!options.periodic){log(`${target.nome}: in aria, può ricevere solo danni periodici.`);return 0;}
        if(ts.shield?.kind==='gio'){
            log(`${target.nome}: ANNUNCIO BOMBA annulla ${options.pure?'il danno puro':options.periodic?'il danno periodico':'il colpo'} e riflette il 300% dell’ATK SP.`);
            if(source&&!options.reflection)damage(target,source,ItemSystem.stat(target,'atkSpec')*3,{pure:true,reflection:true,label:'ANNUNCIO BOMBA'});
            return 0;
        }
        if(ts.shield?.kind==='pec'&&!options.pure&&!options.periodic){log(`${target.nome}: SMISTAMENTO PEC annulla l’attacco. DOT e danni puri restano esclusi.`);return 0;}
        if(target.isInvulnerable&&!options.periodic&&!options.pure){log(`${target.nome}: invulnerabile al colpo.`);return 0;}
        let value=amount;
        if(ts.statuses.witch)value*=1.15;
        if(element==='fuoco'&&ts.statuses.ustione)value*=2;
        if(element==='veleno'&&ts.statuses.iperveleno)value*=2;
        if(ss&&!options.reflection)value=stat(source,'damage',value);
        // Rivena's reserve is consumed by a different ally's attack, after every multiplier.
        if(source&&!options.periodic&&!options.reflection){
            for(const ally of team(source)){
                const as=state(ally);
                if(ally!==source&&as.flat.length){const flat=as.flat.reduce((n,v)=>n+v,0);value+=flat;as.flat=[];log(`${source.nome}: KISS FOR YOU aggiunge ${flat} danni finali da ${ally.nome}.`,'buff');}
            }
        }
        value=Math.max(0,Math.round(value));const actual=Math.min(target.hpAttuali,value);
        target.hpAttuali=Math.max(0,target.hpAttuali-value);
        log(`${target.nome} subisce ${actual} danni${options.pure?' puri':options.periodic?' periodici':''} (${options.label||source?.nome||'effetto'}).`, 'danni');
        if(!options.periodic){ts.hits++;if(UltimateCatalog.key(target.nome)==='edo')log(`${target.nome}: colpo ricevuto ${ts.hits}; SLIDE RE-VOLUZIONARIA ora al ${100+ts.hits*15}%.`, 'buff');}
        if(source&&options.basic){const id=ts.id;ss.basic.set(id,(ss.basic.get(id)||0)+1);if(UltimateCatalog.key(source.nome)==='falcoshoto')log(`${source.nome}: ${ss.basic.get(id)} autoattacchi su ${target.nome}; seconda porzione di COLD CALL +${ss.basic.get(id)*7}%.`,'buff');}
        if(source&&actual&&!options.reflection){const vampValue=ss.buffs.filter(b=>b.keys.includes('vamp')).reduce((n,b)=>n+b.value,0);if(vampValue>0)heal(source,actual*vampValue,'omnivamp');}
        if(window.BattleFX&&(target===mioPokemon||target===nemicoPokemon))BattleFX.hit({source:target===nemicoPokemon?'player':'enemy',element,damage:actual,kind:options.kind||'ultimate'});
        return actual;
    }
    function normalAmount(p,q,type='auto',multiplier=1,kind='ultimate') {
        const special=type==='speciale'||type==='auto'&&ItemSystem.stat(p,'atkSpec')>ItemSystem.stat(p,'atk');
        const ps=state(p).statuses,qs=state(q).statuses;
        const wet=s=>s.bagnato?Math.max(.5,1-.1*(s.bagnato.stack||1)):1;
        const shadow=s=>s.ombra?Math.max(.4,1-.15-(s.ombra.extraSteal||0)-.15*(s.ombra.stack||0)):1;
        const legacy=(value,b,buff)=>calcolaStatConEffetti(value,b,buff);
        let attack=legacy(ItemSystem.stat(p,special?'atkSpec':'atk')*wet(ps)*shadow(ps),ps.atkRidotto,ps.atkBoost);
        const defense=legacy(ItemSystem.stat(q,special?'defSpec':'def')*wet(qs)*shadow(qs),qs.defRidotta,qs.defBoost);
        if(ps.witch?.source&&state(ps.witch.source).id===state(q).id)attack*=.7;
        const efficacy=ItemSystem.efficacy(p,q,CONFIG_DEBOLEZZE[String(p.elemento).toLowerCase()]?.[String(q.elemento).toLowerCase()]??1);
        let modifier=1+(qs.livido?.stack||0)*.15;
        if(qs.congelato?.durata>0)modifier+=p.elemento==='lotta'?1:p.elemento==='fuoco'?.15:.20;
        if(qs.shock?.durata>0&&Math.random()<.5)modifier+=.22;
        if(q.nome==='Edo'&&['normale','luce','buio'].includes(String(p.elemento).toLowerCase()))modifier*=.5;
        let dragon=1;
        if(kind==='elementale'&&p.elemento==='drago'){const hp=p.hpAttuali/p.hpMax;dragon=hp<.02?2:hp<.30?1.50:hp<.50?1.35:hp<.80?1.15:1;}
        return ItemSystem.mitigation(q,ItemSystem.damage(p,q,attack*attack/(attack+defense)*efficacy*multiplier*modifier*dragon*(1-(q.damageReduction||0)),efficacy,kind));
    }
    function strike(p,q,type,multiplier,options={}) {
        const ps=state(p),qs=state(q),kind=options.kind||'ultimate';
        if(q.isInvulnerable||qs.statuses.aria){log(`${q.nome}: ${qs.statuses.aria?'in aria, riceve solo danni periodici':'invulnerabile al colpo'}.`);return {damage:0,hit:false};}
        const accuracy=options.accuracy??Math.max(0,stat(p,'accuracy',1));
        const dodge=calcolaSchivata(q);
        if(!options.infallible&&(Math.random()>accuracy||ItemSystem.evade(q,dodge,false,true))){log(`${p.nome}: ${options.label||'attacco'} manca o viene schivato da ${q.nome}.`, 'danni');if(window.BattleFX)BattleFX.hit({source:p===mioPokemon?'player':'enemy',label:'SCHIVATO'});return {damage:0,hit:false};}
        let amount=normalAmount(p,q,type,multiplier,kind);
        if(qs.statuses.ombra?.durata>0){
            if(Math.random()<.5){heal(q,amount*.24,'Ombra');return {damage:0,hit:true};}
            amount*=2;qs.statuses.ombra.stack=Math.min(3,(qs.statuses.ombra.stack||0)+1);log(`${q.nome}: Ombra raddoppia il danno e aumenta il furto di statistiche.`);
        }
        if(qs.statuses.scudoSabbia?.attiva){
            if(Math.random()<.60){const roll=Math.floor(Math.random()*20)+1,ratio=roll<=9?.08:roll<=17?.15:roll<=19?.50:1;damage(q,p,amount*ratio,{pure:true,reflection:true,element:'terra',label:'Scudo di Sabbia'});}
            delete qs.statuses.scudoSabbia;log(`${q.nome}: Scudo di Sabbia consumato.`);
        }
        const actual=damage(p,q,amount,{...options,kind,basic:kind==='auto'});
        if(qs.statuses.congelato){delete qs.statuses.congelato;log(`${q.nome}: il ghiaccio si infrange.`);if(p.elemento==='fuoco')status(q,'bagnato',2,p,{stack:1,turniSenzaBagnato:0});}
        return {damage:actual,hit:true};
    }
    function beginTurn(p,enemy) {
        bind(p,enemy);const s=state(p);s.turn++;
        let blocked=ItemSystem.skip(p,enemy);
        const reasons=[];
        for(const k of ['shock','congelato','sonno','stun','tentennamento','paralisi','blocco','benedizione']){
            const effect=s.statuses[k];
            if(!effect||effect.durata<=0)continue;
            if(ItemSystem.immune(p,k)){delete s.statuses[k];log(`${p.nome}: immune a ${k}.`);continue;}
            if(k==='blocco'&&effect.chance!==undefined&&Math.random()>=effect.chance){log(`${p.nome}: supera il rischio di blocco (${Math.round(effect.chance*100)}%).`);}else{blocked=true;reasons.push(k);if(k==='shock')ItemSystem.shock(p,enemy);}
            if(--effect.durata<=0){delete s.statuses[k];log(`${p.nome}: termina ${k}.`);}
        }
        if(s.statuses.aria){blocked=true;reasons.push('in aria');s.fall=s.statuses.aria;delete s.statuses.aria;}
        if(s.statuses.volo&&--s.statuses.volo.durata<=0){delete s.statuses.volo;p.isInvulnerable=false;log(`${p.nome}: termina il volo elementale.`);}
        // Elemental hypnosis keeps its probabilistic behavior, with the global confusion formula.
        if(s.statuses.ipnotizzato){const e=s.statuses.ipnotizzato;if(Math.random()<.4){blocked=true;reasons.push('ipnosi');}else if(Math.random()<2/3&&!blocked){damage(p,p,normalAmount(p,p,'auto',.75,'auto'),{label:'autocolpo da ipnosi'});blocked=true;reasons.push('autocolpo');}if(--e.durata<=0)delete s.statuses.ipnotizzato;}
        if(s.statuses.ammaliato){
            const e=s.statuses.ammaliato;if(!blocked){const r=Math.random(),q=opponent(p),allies=bench(q);
                if(allies.length&&r<.30){const a=allies[Math.floor(Math.random()*allies.length)];damage(p,a,ItemSystem.stat(p,'atk')*.30,{label:'ammaliamento'});blocked=true;}
                else if(r<(allies.length ? .40 : .50)){damage(p,q,ItemSystem.stat(p,'atk')*.10,{label:'ammaliamento'});blocked=true;}
                else if(r<(allies.length ? .70 : 1)){heal(q,ItemSystem.stat(p,'atk')*.30,'ammaliamento');blocked=true;}
                if(blocked)reasons.push('ammaliamento');}
            if(--e.durata<=0)delete s.statuses.ammaliato;
        }
        for(const [key,chance,mult] of [['confuso',.5,.75],['future',.25,1]]){
            const e=s.statuses[key];if(!e)continue;
            if(!blocked&&Math.random()<chance){damage(p,p,normalAmount(p,p,'auto',mult,'auto'),{label:key==='confuso'?'confusione':'FUTURE MESSAGE'});blocked=true;reasons.push(key);}
            if(--e.durata<=0){delete s.statuses[key];log(`${p.nome}: termina ${key}.`);}
        }
        if(blocked)log(`${p.nome} perde la propria azione: ${reasons.join(', ')||'blocco da item'}. I blocchi concorrenti scorrono nello stesso turno.`, 'turni');
        return blocked;
    }
    function finish(p,enemy) {
        if(!p)return;
        const s=state(p);
        for(const key of ['foglie','sanguinamento','rigenerazione','catene']){
            const e=s.statuses[key];if(!e)continue;
            if(key==='foglie'){const dealt=damage(e.source,p,e.amount,{pure:true,periodic:true,label:'FOGLIA DI PULIZIA'});if(e.source?.hpAttuali>0)heal(e.source,dealt/2,'FOGLIA DI PULIZIA');else log('FOGLIA DI PULIZIA: utilizzatore KO, nessuna cura.','cure');}
            if(key==='sanguinamento')damage(e.source,p,e.amount,{periodic:true,label:'sanguinamento'});
            if(key==='rigenerazione'||key==='catene')heal(p,p.hpMax*(e.ratio||.30),key==='catene'?'CATENE LASER':'Ringiovimento');
            if(--e.durata<=0){delete s.statuses[key];log(`${p.nome}: termina ${key}.`);}
        }
        if(s.fall){const f=s.fall;s.fall=null;log(`${p.nome}: cade al termine del turno perso.`, 'turni');damage(f.source,p,normalAmount(f.source,p,'fisico',1.20),{label:'STO VOLANDO JACK'});}
        const before=hpFactor(p);
        s.buffs=s.buffs.filter(b=>{
            if((b.born!==s.turn||b.countCurrent)&&Number.isFinite(b.remaining)){b.remaining--;}
            if(b.remaining<=0){log(`${p.nome}: termina ${b.id}.`,b.value>=0?'buff':'debuff');return false;}
            return true;
        });
        const ratio=hpFactor(p)/before;if(ratio!==1){p.hpMax=Math.max(1,Math.round(p.hpMax*ratio));p.hpAttuali=Math.max(0,Math.round(p.hpAttuali*ratio));log(`${p.nome}: HP massimi e attuali aggiornati alla scadenza del buff.`, 'status');}
        for(const key of ['witch','ustione','iperveleno'])if(s.statuses[key]&&--s.statuses[key].durata<=0){delete s.statuses[key];log(`${p.nome}: termina ${key}.`);}
        if(s.pec&&s.pec.readyTurn===s.turn){log(`${p.nome}: la carica di SMISTAMENTO PEC non è stata usata e scade.`, 'risorse');s.pec=null;}
        for(const key of ['atkRidotto','atkBoost','defRidotta','defBoost','velRidotta'])if(s.statuses[key]&&--s.statuses[key].durata<=0){delete s.statuses[key];log(`${p.nome}: termina ${key}.`);}
        const defender=opponent(p);
        if(defender){const shield=state(defender).shield;if(shield&&--shield.remaining<=0){state(defender).shield=null;log(`${defender.nome}: termina ${shield.kind==='gio'?'ANNUNCIO BOMBA':'SMISTAMENTO PEC'}.`);}}
    }
    function endFight() {
        if(typeof miaSquadra==='undefined')return;
        for(const p of [...miaSquadra,typeof nemicoPokemon!=='undefined'?nemicoPokemon:null,...(typeof nemiciIncontro!=='undefined'?nemiciIncontro:[])].filter(Boolean)){
            if(!runtime.has(p))continue;
            const s=state(p),ratio=1/hpFactor(p);
            if(ratio!==1){p.hpMax=Math.max(1,Math.round(p.hpMax*ratio));p.hpAttuali=Math.max(0,Math.round(p.hpAttuali*ratio));}
            if(s.overheal)p.hpAttuali=Math.min(p.hpMax,p.hpAttuali);
            s.buffs=[];s.statuses={};s.flat=[];s.shield=null;s.pec=null;s.overheal=0;
        }
    }
    function targets(p,m) {
        const allies=team(p).filter(q=>q.hpAttuali>0);
        if(['arman','cammalleri','menza','monkey'].includes(m.effect))return allies.filter(q=>q!==p);
        if(['altimani','falco','chan','telemaco','rauf'].includes(m.effect))return allies.filter(q=>q!==p&&(m.effect!=='telemaco'||!state(p).healed.has(state(q).id)));
        if(['nelly','loconsole'].includes(m.effect))return allies;
        return [];
    }
    function chooser(title,candidates,max=1) {
        return new Promise(resolve=>{
            let modal=document.getElementById('modal-ultimate-target');if(modal)modal.remove();
            modal=document.createElement('div');modal.id='modal-ultimate-target';modal.className='ultimate-target-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',title);
            const panel=document.createElement('section');panel.innerHTML=`<h2>${escape(title)}</h2><p>Seleziona ${max===1?'un bersaglio':'fino a '+max+' bersagli'}.</p>`;modal.append(panel);
            const selected=[];
            candidates.forEach(p=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<img src="${escape(p.immagine)}" alt=""><span>${escape(p.nome)}<small>HP ${Math.round(p.hpAttuali)} / ${p.hpMax}</small></span>`;b.onclick=()=>{if(selected.includes(p)){selected.splice(selected.indexOf(p),1);b.classList.remove('selected');}else if(selected.length<max){selected.push(p);b.classList.add('selected');}ok.disabled=!selected.length;};panel.append(b);});
            const ok=document.createElement('button');ok.className='ultimate-confirm';ok.textContent='Conferma';ok.disabled=true;ok.onclick=()=>{modal.remove();resolve(selected);};
            const cancel=document.createElement('button');cancel.textContent='Annulla';cancel.onclick=()=>{modal.remove();resolve(null);};panel.append(ok,cancel);document.body.append(modal);panel.querySelector('button')?.focus();
        });
    }
    async function preparePlayer() {
        const p=mioPokemon,m=move(p);if(busy||!availability(p,'speciale').ok)return false;
        busy=true;
        try{
            if(m.effect==='rivena'&&!bench(p).length&&!confirm('KISS FOR YOU: non ci sono alleati vivi. Sacrificherai il 50% fisso degli HP massimi senza un alleato che possa usare il bonus, anche andando KO. Vuoi continuare?'))return false;
            if(m.effect==='hero'&&p.hpAttuali>=p.hpMax*.30&&!confirm('ONE PUNCH FALCO: sei al 30% HP o sopra. Farai solo il 100% del danno normale e NON perderai la prossima azione. Vuoi usarla comunque?'))return false;
            if(m.effect==='manuela'&&!state(p).pec&&!confirm('SMISTAMENTO PEC: ora protegge solo dagli attacchi ordinari, NON da DOT/danni puri. Nel tuo prossimo turno devi selezionarla di nuovo per colpire, consumando un altro utilizzo; altrimenti la carica scade. Vuoi attivarla?'))return false;
            const candidates=targets(p,m),needs=['nelly','loconsole','altimani','arman','cammalleri','menza','monkey','chan','falco','rauf','telemaco'].includes(m.effect);
            let chosen=[];
            if(needs){chosen=await chooser(m.name,candidates,['monkey','chan','rauf'].includes(m.effect)?2:1);if(!chosen)return false;}
            prepared={p,m,chosen};return true;
        }finally{busy=false;}
    }
    function consume(p,m) {
        init(p);if(p.ultimateUses[m.id]===undefined)p.ultimateUses[m.id]=m.uses;
        p.ultimateUses[m.id]=Math.max(0,p.ultimateUses[m.id]-1);
        if(m.limit==='battaglia')state(p).used.add(m.id);
        if(m.limit==='bersaglio')state(p).used.add(m.id+':'+state(opponent(p)).id);
        log(`${p.nome} usa ${m.name}. Utilizzi: ${p.ultimateUses[m.id]}/${m.uses}${m.limit==='run'?' · non ricaricabile in questa run':''}.`, 'risorse');
    }
    function takePrepared(p){const result=prepared?.p===p?prepared:null;prepared=null;return result;}
    return {ATK,DEF,ALL,state,init,move,team,opponent,bench,bind,bindActive,beginFight,endFight,refill,challengeRefill,availability,stat,buff,status,heal,cleanse,canSwitch,fullBlock,switchTo,damage,normalAmount,strike,beginTurn,finish,log,targets,chooser,preparePlayer,consume,takePrepared,escape};
})();

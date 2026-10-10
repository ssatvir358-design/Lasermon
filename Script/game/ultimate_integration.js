// Installed after the existing combat/UI modules. Dedicated Bomber/Challenge
// scripts keep their move selection; all damage uses the same protection rules.
(() => {
    const U=UltimateSystem;
    const originalStat=ItemSystem.stat;
    ItemSystem.stat=(p,key,value=p?.[key])=>key==='hpMax'?originalStat(p,key,value):U.stat(p,key,originalStat(p,key,value));
    const originalDodge=calcolaSchivata;
    calcolaSchivata=p=>originalDodge({...p,vel:ItemSystem.stat(p,'vel')});
    const originalEvade=ItemSystem.evade;
    ItemSystem.evade=function(p,base,ultimate=false,skipAccuracy=false){
        const source=U.opponent(p);
        if(!skipAccuracy&&source&&Math.random()>U.stat(source,'accuracy',1)){U.log(`${source.nome}: manca il bersaglio per la riduzione di precisione.`, 'danni');return true;}
        const extra=U.state(p).buffs.filter(b=>b.keys.includes('dodge')).reduce((n,b)=>n+b.value*100,0);
        return originalEvade(p,base+extra,ultimate);
    };
    const originalEnable=abilitaControlliGiocatore;
    let blockedTurnTimer=0;
    abilitaControlliGiocatore=function(){
        clearTimeout(blockedTurnTimer);originalEnable();
        if(mioPokemon?.hpAttuali>0&&U.fullBlock(mioPokemon)){
            const p=mioPokemon;['btn-attacco','btn-pokemon','btn-item','btn-fuga'].forEach(id=>document.getElementById(id).disabled=true);BattleUI.refresh();
            blockedTurnTimer=setTimeout(()=>{if(mioPokemon!==p||!document.getElementById('schermata-gioco').classList.contains('attiva'))return;tipoAttaccoInCorso='auto';document.getElementById('btn-attacco').disabled=false;turnoGiocatore();},isSkipAttivo?350:700);
        }
    };
    const originalItemBegin=ItemSystem.beginFight;
    ItemSystem.beginFight=()=>{U.beginFight();originalItemBegin();};
    const originalStatuses=ItemSystem.status;
    ItemSystem.status=p=>p?U.state(p).statuses:originalStatuses(p);
    resettaEffettiSuTarget=slot=>U.bind(slot==='nemico'?nemicoPokemon:mioPokemon,slot==='nemico');
    const originalGraphics=aggiornaGrafica;
    aggiornaGrafica=function(){U.bindActive();originalGraphics();};
    processaEffettiInizioTurno=(p,enemy)=>U.beginTurn(p,enemy);
    processaEffettiFineTurno=function(p,enemy){
        if(!p)return;
        U.bind(p,enemy);const statuses=U.state(p).statuses;
        if(statuses.bruciatura?.durata>0){
            let amount=5;const hp=p.hpAttuali;
            if(hp>350)amount=Math.round(hp*.035);else if(hp>200)amount=Math.round(hp*.04);else if(hp>120)amount=Math.round(hp*.06);else if(hp>90)amount=14;else if(hp>60)amount=11;else if(hp>40)amount=8;
            U.damage(statuses.bruciatura.source||U.opponent(p),p,amount*(statuses.bruciatura.itemMultiplier||1),{periodic:true,element:'fuoco',label:'bruciatura'});
            if(--statuses.bruciatura.durata<=0){delete statuses.bruciatura;U.log(`${p.nome}: termina bruciatura.`);}
        }
        if(statuses.veleno?.durata>0){
            const ratio=p.hpAttuali/p.hpMax;
            const percentage=statuses.veleno.currentRatio;
            const amount=percentage!==undefined?p.hpAttuali*percentage:p.hpMax*(ratio<.20?.03:ratio<.50?.05:ratio<.70?.08:ratio<=.88?.10:.12);
            U.damage(statuses.veleno.source||U.opponent(p),p,Math.max(1,Math.round(amount))*(statuses.veleno.itemMultiplier||1),{periodic:true,element:'veleno',label:'veleno'});
            if(--statuses.veleno.durata<=0){delete statuses.veleno;U.log(`${p.nome}: termina veleno.`);}
        }
        if(statuses.bagnato&&statuses.bagnato.turniSenzaBagnato>=2&&Math.random()>=(statuses.bagnato.retainBonus||0)){delete statuses.bagnato;U.log(`${p.nome}: si asciuga, statistiche ripristinate.`);}
        if(statuses.ombra&&--statuses.ombra.durata<=0){delete statuses.ombra;U.log(`${p.nome}: termina Ombra.`);}
        U.finish(p,enemy);ItemSystem.finish(p,enemy);U.bindActive();aggiornaGrafica();
    };
    const originalElement=applicaEffettoElementaleLv3;
    applicaEffettoElementaleLv3=function(p,q,element){
        if(U.state(q).shield?.kind==='gio'){U.log(`${q.nome}: ANNUNCIO BOMBA impedisce gli stati elementali.`);return '';}
        U.bindActive();const result=originalElement(p,q,element);
        const st=U.state(q).statuses;
        // Every newly applied elemental effect carries its source for DOT/reflection.
        for(const value of Object.values(st))if(value&&typeof value==='object'&&!value.source)value.source=p;
        return result;
    };
    function normal(p,q,multiplier,name,kind,enemy){
        U.bindActive();U.log(`${p.nome} usa ${name}${kind==='elementale'?' (elementale)':''}.`, 'mosse');
        const result=U.strike(p,q,'auto',multiplier,{kind,label:name});
        if(result.hit&&kind==='elementale'&&q.hpAttuali>0){const html=applicaEffettoElementaleLv3(p,q,p.elemento);if(html)document.getElementById('console-log').insertAdjacentHTML('beforeend',html);}
        if(!enemy&&continuaAttaccoItem(multiplier,name))return;
        UltimateActions.complete(p,enemy);
    }
    calcolaEdEseguiDannoGiocatore=function(multiplier,name){normal(mioPokemon,nemicoPokemon,multiplier,name,tipoAttaccoInCorso,false);};
    const oldEnemyDamage=calcolaEdEseguiDannoNemico;
    calcolaEdEseguiDannoNemico=function(multiplier,name,extra){
        if(nemicoPokemon.raritaTipo==='bombers'||(typeof isChallengeBattle!=='undefined'&&isChallengeBattle))return oldEnemyDamage(multiplier,name,extra);
        normal(nemicoPokemon,mioPokemon,multiplier,name,nemicoPokemon._selectedMoveKind||'auto',true);
    };
    const oldEnemyNormal=eseguiAttaccoNormaleNemico;
    function updatePhase(p){
        let next=null;
        if(UltimateCatalog.key(p.nome).startsWith('max')){
            if(!p.maxFase3&&p.hpAttuali<=p.hpMax/3){next='MAX F3';p.maxFase3=true;}
            else if(!p.maxFase2&&!p.maxFase3&&p.hpAttuali<=p.hpMax*2/3){next='MAX F2';p.maxFase2=true;}
        }else if(p.isMiniboss&&!p.inFase2&&p.hpAttuali<=p.hpMax*.5){
            const found=pokemonDatabase.find(b=>b.nome===p.nome+' F2');if(found){next=found.nome;p.inFase2=true;}
        }
        if(!next)return;
        const base=pokemonDatabase.find(b=>b.nome===next);if(!base)return;
        const form=creaPokemon(base,p.livello,p.livelloMossa,true),ratio=p.hpAttuali/p.hpMax;
        const hpFactor=Math.max(.05,1+U.state(p).buffs.filter(b=>b.keys.includes('hpMax')).reduce((n,b)=>n+b.value,0));
        for(const key of ['nome','elemento','atk','atkSpec','def','defSpec','vel','baseHpMax','baseAtk','baseAtkSpec','baseDef','baseDefSpec','baseVel','immagine','immagineAtk','frameAtk','immagineVS','mossaLvl1','mossaLvl2','mossaLvl3','infoBase'])p[key]=form[key];
        p.hpMax=Math.round(form.hpMax*hpFactor);p.hpAttuali=Math.max(1,Math.round(p.hpMax*ratio));
        const m=U.move(p,true);if(m&&p.ultimateUses[m.id]===undefined)p.ultimateUses[m.id]=m.uses;
        U.log(`${p.nome}: nuova fase ${p.elemento.toUpperCase()} · Ultimate ${m?.name||'dedicata'}. Identità, blocchi, contatori e limiti per bersaglio conservati.`, 'fasi');
        document.getElementById('img-nemico')?.animate([{filter:'brightness(3)',opacity:.3},{filter:'brightness(1)',opacity:1}],{duration:600});aggiornaGrafica();
    }
    eseguiAttaccoNormaleNemico=function(){
        const p=nemicoPokemon;
        if(p.raritaTipo==='bombers'||(typeof isChallengeBattle!=='undefined'&&isChallengeBattle))return oldEnemyNormal();
        updatePhase(p);
        if(U.availability(p,'speciale',true).ok&&Math.random()<.30){UltimateActions.enemy(p);return;}
        const elemental=U.availability(p,'elementale',true).ok&&Math.random()<.40;
        p._selectedMoveKind=elemental?'elementale':'auto';
        if(elemental){p.elementalUses--;U.log(`${p.nome}: utilizzi elementali ${p.elementalUses}/10.`,'risorse');}
        eseguiAnimazioneAttaccoNormale(p,false,()=>calcolaEdEseguiDannoNemico(CONFIG_MOSSE[p.livelloMossa]||1,getNomeMossaAttuale(p),false),{kind:elemental?'elementale':'base'});
    };
    eseguiSceltaAttacco=async function(kind){
        if(!BattleUI.canAct()||!U.availability(mioPokemon,kind).ok)return;
        if(kind==='speciale'&&!await U.preparePlayer())return;
        if(!BattleUI.canAct())return;
        BattleUI.show('log');tipoAttaccoInCorso=kind;turnoGiocatore();
    };
    scegliMossaUI=kind=>eseguiSceltaAttacco(kind);
    const originalSwap=eseguiScambioBattagliaUI;
    eseguiScambioBattagliaUI=function(index){
        if(!U.canSwitch(mioPokemon)){U.log(`${mioPokemon.nome}: CATENE LASER impedisce ogni sostituzione.`);return;}
        // A manual switch is an action: blockers and DOT use the same turn clock.
        if(!BattleUI.canAct('squadra'))return;
        const p=mioPokemon,target=miaSquadra[index];if(!target||target===p||target.hpAttuali<=0)return;
        if(processaEffettiInizioTurno(p,false)){['btn-attacco','btn-pokemon','btn-item','btn-fuga'].forEach(id=>document.getElementById(id).disabled=true);UltimateActions.complete(p,false,false);return;}
        processaEffettiFineTurno(p,false);
        if(p.hpAttuali<=0){gestisciKOGiocatore();return;}
        originalSwap(index);U.bindActive();
    };
    eseguiCambioInBattagliaVero=index=>eseguiScambioBattagliaUI(index);
    const originalVictory=gestisciVittoriaIncontro;
    gestisciVittoriaIncontro=function(){U.endFight();if(isBossFight&&tipoEventoAttuale!=='miniboss')U.refill(miaSquadra,'boss finale della mappa');originalVictory();};
    const originalReturn=tornaAllaMappa;
    tornaAllaMappa=function(...args){U.endFight();tipoAttaccoInCorso='auto';return originalReturn(...args);};
    const originalCenter=scegliCura;
    scegliCura=function(){if(haCuratoInVisita)return;originalCenter();U.refill(miaSquadra,'centro medico');const label=document.getElementById('testo-cura-squadra');if(label)label.textContent='Squadra curata · utilizzi ripristinati';};
    // Keep identity, usage, counters and target locks when a phase swaps the object.
    U.inheritPhase=function(previous,next){
        if(!previous||!next||previous===next)return;
        const before=U.state(previous),after=U.state(next);
        Object.assign(after,before);
        next.ultimateUses={...previous.ultimateUses};next.elementalUses=previous.elementalUses;
        U.bind(next,true);
    };
    // Hint and move definitions in the HUD come from the exact same rules as execution.
    BattleUI.moveRows=function(){
        const p=mioPokemon,m=U.move(p),a=U.availability(p,'elementale'),b=U.availability(p,'speciale');
        return [
            {kind:'auto',name:'Autoattacco',detail:getNomeMossaAttuale(p),ready:true},
            {kind:'elementale',name:'Attacco elementale',detail:`${p.elemento.toUpperCase()} · ${p.elementalUses}/10 USI`,ready:a.ok,unlock:a.reason},
            {kind:'speciale',name:m?.name||'ULTIMATE',detail:`${m?.type?.toUpperCase()||'SPECIALE'} · ${m?p.ultimateUses[m.id]:0}/${m?.uses||0} USI`,ready:b.ok,unlock:b.reason,description:m?.description}
        ];
    };
})();

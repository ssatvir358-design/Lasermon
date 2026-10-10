const UltimateActions = (() => {
    const U=UltimateSystem;
    const chance=n=>Math.random()<n;
    const animate=(p,m)=>new Promise(resolve=>eseguiAnimazioneAttaccoNormale(p,miaSquadra.includes(p),resolve,{kind:'ultimate',move:m.name,duration:isSkipAttivo?800:1600}));
    async function execute(p,selection=null,enemy=false) {
        const m=selection?.m||U.move(p,enemy),q=U.opponent(p);
        if(!m||!q||!U.availability(p,'speciale',enemy).ok)return false;
        const s=U.state(p),t=U.state(q),e=m.effect;
        const candidates=U.targets(p,m);
        const chosen=selection?.chosen||candidates.slice().sort((a,b)=>a.hpAttuali/a.hpMax-b.hpAttuali/b.hpMax).slice(0,['rauf','monkey','chan'].includes(e)?2:1);
        const source=m.name,buf=(pg,keys,value,turns,opts)=>U.buff(pg,keys,value,turns,source,opts);
        const st=(pg,key,turns,extras)=>U.status(pg,key,turns,p,{origin:source,...extras});
        const block=(turns=1,probability)=>st(q,'blocco',turns,{chance:probability});
        const heal=(pg,amount)=>U.heal(pg,amount,source);
        const atk=U.ATK,def=U.DEF;
        const hpBefore=q.hpAttuali;
        const pecFollowup=e==='manuela'&&s.pec?.readyTurn===s.turn;
        U.consume(p,m);
        p._ultimateSupport=m.type==='supporto'&&!pecFollowup;
        p._ultimateEffect=m.effect;
        await animate(p,m);
        delete p._ultimateSupport;delete p._ultimateEffect;
        let mult=m.multiplier,hits=1,infallible=['infallibile','hero','kiora','kioraevo'].includes(e),accuracy;
        const poisoned=!!t.statuses.veleno;
        if(e==='lucien'&&(t.statuses.sonno||t.statuses.ipnotizzato)){mult*=2;delete t.statuses.sonno;delete t.statuses.ipnotizzato;U.log(`${q.nome}: si sveglia, il danno di ${source} raddoppia.`);}
        if(e==='vesper'&&poisoned){mult*=2;U.log(`${q.nome}: già avvelenato, danno doppio senza riapplicare veleno.`);}
        if(e==='hero'&&p.hpAttuali<p.hpMax*.30){mult=3;st(p,'blocco',1);U.log(`${source}: soglia attiva, danno ×3 e prossima azione saltata.`, 'buff');}
        if(e==='marini'){const heads=[chance(.5),chance(.5),chance(.5)].filter(Boolean).length;mult=1+.12*heads;U.log(`${source}: ${heads} teste, ${3-heads} croci; un solo colpo al ${Math.round(mult*100)}%.`,'buff');}
        if(e==='bussolotti'||e==='bussoking'){mult=chance(.5)?(e==='bussoking'?.25:.5):(e==='bussoking'?3:2);U.log(`${source}: estratto ${mult*100}% di danno.`,'buff');}
        if(e==='dragon'||e==='dragonking'){const count=U.team(p).filter(a=>a!==p&&String(a.elemento).toLowerCase()==='drago').length;mult*=1+count*(e==='dragonking'?1:.3);U.log(`${source}: ${count} altri Draghi, KO inclusi; danno totale ×${mult.toFixed(2)}.`,'buff');}
        if(e==='edo'){mult=1+.15*s.hits;U.log(`${source}: ${s.hits} colpi ricevuti, potenziamento a ${Math.round(mult*100)}%.`,'buff');}
        if(e==='remerlino'){hits=2;st(p,'blocco',1);}
        if(e==='capiluppi')accuracy=.5;
        if(e==='graziani')buf(p,atk,.35,2,{countCurrent:true});
        if(e==='sat'){buf(p,['vamp'],.5,5,{countCurrent:true});buf(p,['damage'],.05,5,{countCurrent:true});buf(p,def,.10,5,{countCurrent:true});}
        let total=0,hit=false;
        if(e==='babbo'||e==='coniglio'){
            const scale=chance(.5)?.5:e==='coniglio'?2:1.5;
            if(chance(.30)){heal(q,U.normalAmount(p,q,'fisico',scale));U.log(`${source}: il pacco cura il nemico, moltiplicatore ×${scale}.`,'cure');}
            else {const result=U.strike(p,q,'fisico',scale,{label:source});total=result.damage;hit=result.hit;}
        }else if(pecFollowup){
            s.pec=null;const result=U.strike(p,q,'fisico',.8,{label:source});total=result.damage;hit=result.hit;if(hit&&chance(.1))st(q,'veleno',3,{itemMultiplier:1});
        }else if(m.type!=='supporto'){
            for(let i=0;i<hits&&q.hpAttuali>0;i++){
                const result=U.strike(p,q,m.type,mult,{infallible,accuracy,kind:'ultimate',label:source+(hits>1?` · colpo ${i+1}/${hits}`:'')});
                total+=result.damage;hit=hit||result.hit;
            }
        }
        // Support moves resolve without a hit roll; damaging move riders require a hit.
        // Effects on the caster described as "after use" also resolve on a miss.
        if(e==='zareen'){buf(p,['vel'],.12,2);if(chance(.15)){st(p,'stun',1);U.log(`${p.nome}: OVERCHARGE, perderà la prossima azione.`);}}
        if(e==='elyra')buf(p,['vel'],.15,3);
        if(e==='virea')buf(p,['dodge'],.05,2);
        if(e==='darius')buf(p,atk,.07,1);
        if(e==='mauro')buf(p,atk,.25,1);
        if(e==='ruggiero')buf(p,atk,-.11,2);
        if(e==='nicolas')buf(p,def,-.30,1);
        if(e==='tania')buf(p,def,.35,3);
        if(e==='salvatore')U.team(p).forEach(a=>buf(a,['vel'],.15,5));
        if(e==='nicolo')buf(p,['dodge'],.13,2);
        if(e==='ilie')buf(p,def,.25,2);
        const applies=m.type==='supporto'||hit;
        if(applies){
            if(e.startsWith('burn')&&chance(parseInt(e.slice(4))/100))st(q,'bruciatura',3,{itemMultiplier:ItemSystem.has(p,'burn')?2:1});
            if(e.startsWith('confuse')&&chance(parseInt(e.slice(7))/100))st(q,'confuso',3);
            if(e.startsWith('freeze')&&chance(parseInt(e.slice(6))/100))st(q,'congelato',2);
            if(e.startsWith('flinch')&&chance(parseInt(e.slice(6))/100))st(q,'tentennamento',1);
            switch(e){
                case 'kiora':case 'kioraevo':st(q,'foglie',2,{amount:Math.round(ItemSystem.stat(p,'atkSpec')*(e==='kiora'?.07:.15))});break;
                case 'vesper':if(!poisoned)st(q,'veleno',3,{itemMultiplier:ItemSystem.has(p,'poison')?2:1});if(q.sesso==='maschio')buf(q,[...atk,...def],-.12,3);break;
                case 'witch':if(chance(.35))st(q,'witch',2);break;
                case 'ryden':U.team(q).forEach(a=>buf(a,['vel'],-.15,2));break;
                case 'van':{const allies=U.bench(p);if(allies.length)U.switchTo(p,allies[Math.floor(Math.random()*allies.length)]);else U.log(`${source}: nessun alleato vivo, rimane in campo.`);break;}
                case 'mireya':st(q,'future',2);break;
                case 'darius':if(chance(.15))buf(q,atk,-.20,1);break;
                case 'rivena':{const loss=Math.round(p.hpMax*.50);p.hpAttuali=Math.max(0,p.hpAttuali-loss);s.flat.push(loss);U.log(`${p.nome} sacrifica ${loss} HP fissi; bonus finale riservato a un altro alleato: ${s.flat.reduce((a,b)=>a+b,0)}.`, 'danni');break;}
                case 'icer':buf(q,['vel'],-.08,3);break;
                case 'skip50':if(chance(.5))block();break;
                case 'maelis':st(q,'sanguinamento',3,{amount:Math.round(hpBefore*.05)});break;
                case 'elyra':if(chance(.30))st(q,'paralisi',2);break;
                case 'recoil':U.damage(null,p,total*.25,{pure:true,label:'contraccolpo di '+source});break;
                case 'bob':if(chance(.10))buf(q,atk,-.21,2);break;
                case 'soraya':for(const a of U.bench(q))U.strike(p,a,'speciale',.15,{infallible:true,label:source+' · panchina'});break;
                case 'kit':case 'kitevo':block(1,e==='kit'?.23:.25);break;
                case 'nelly':chosen.forEach(a=>{heal(a,a.hpMax*.35);U.cleanse(a,['bruciatura','shock','paralisi','veleno']);});break;
                case 'virea':if(chance(.1))st(q,'confuso',3);break;
                case 'caelum':st(q,'veleno',3,{itemMultiplier:ItemSystem.has(p,'poison')?2:1});buf(q,U.ALL,-.05,4);break;
                case 'fabio':st(p,'catene',3,{ratio:.30});break;
                case 'gian':case 'supergian':buf(q,def,e==='gian'?-.17:-.30,e==='gian'?2:3);break;
                case 'monica':if(chance(.30))st(q,'veleno',2,{currentRatio:.08,itemMultiplier:ItemSystem.has(p,'poison')?2:1});break;
                case 'venturini':st(q,'paralisi',2);break;
                case 'carra':case 'carraevo':U.team(p).forEach(a=>buf(a,atk,e==='carra'?.25:.40,Infinity));break;
                case 'nicolas':buf(q,atk,-.23,1);break;
                case 'tania':buf(q,[...atk,...def,'vel'],.22,2,{statusKey:'ira'});st(q,'ira',2);break;
                case 'altimani':chosen.forEach(a=>heal(a,a.hpMax*.45));break;
                case 'saad':st(q,'veleno',3,{itemMultiplier:ItemSystem.has(p,'poison')?2:1});buf(q,def,-.07,5);break;
                case 'arman':if(chosen[0]){const amount=Math.max(0,p.hpAttuali-1);p.hpAttuali=1;U.log(`${p.nome}: trasferisce ${amount} HP e rimane a 1 HP.`, 'cure');U.heal(chosen[0],amount,source,true);}break;
                case 'manuela':if(!pecFollowup){s.shield={kind:'pec',remaining:1};s.pec={readyTurn:s.turn+1};U.log(`${p.nome}: protetto dagli attacchi ordinari fino alla prossima azione nemica. DOT e danno puro NON sono coperti. Seleziona di nuovo l’Ultimate nel prossimo turno.`, 'status');}break;
                case 'bacchi':U.team(p).forEach(a=>{buf(a,U.ALL,.10,Infinity);heal(a,a.hpMax*.23);});break;
                case 'rauf':chosen.forEach(a=>heal(a,a.hpMax*.33));break;
                case 'telemaco':if(chosen[0]){heal(chosen[0],total*.20);s.healed.add(U.state(chosen[0]).id);}break;
                case 'alex':U.bench(q).forEach(a=>U.damage(p,a,total*.07,{label:source+' · panchina'}));break;
                case 'cammalleri':if(chosen[0]){buf(chosen[0],U.ALL,1,1);U.switchTo(p,chosen[0]);}break;
                case 'loconsole':chosen.forEach(a=>{U.cleanse(a);ItemSystem.cleanse(a);});break;
                case 'ghandu':buf(p,def,1,4);break;
                case 'nico':{const hp=p.hpAttuali;U.damage(p,q,hp,{pure:true,label:source+' · sacrificio'});p.hpAttuali=0;U.log(`${p.nome}: va KO dopo il sacrificio.`,'danni');break;}
                case 'bottardi':U.team(p).forEach(a=>{const before=a.hpAttuali;a.hpAttuali=a.hpMax;U.log(`${a.nome}: cura completa, ${a.hpAttuali-before} HP recuperati, KO incluso.`,'cure');});if(!enemy){U.endFight();fugaBattaglia();return 'fuga';}break;
                case 'paola':if(q.hpAttuali<=0&&nemiciIncontro.length>1&&!enemy){const selected=await U.chooser('Scegli il prossimo avversario',nemiciIncontro.filter(a=>a.hpAttuali>0));if(selected?.[0]){nemiciIncontro=nemiciIncontro.filter(a=>a!==selected[0]);nemiciIncontro.unshift(selected[0]);U.log(`${source}: prossimo avversario ${selected[0].nome}.`, 'cambi');}}break;
                case 'carnevali':st(q,'sonno',2);break;
                case 'valentina':if(chance(.3))st(q,'confuso',3);if(chance(.07)){buf(q,[...atk,...def,'vel'],.22,1,{statusKey:'ira'});st(q,'ira',1);}break;
                case 'serghej':buf(q,['vel'],-.23,2);break;
                case 'menza':if(chosen[0]){buf(chosen[0],['dodge'],.50,2);U.switchTo(p,chosen[0]);}break;
                case 'anselmo':heal(p,total*.11);break;
                case 'bonacina':buf(p,atk,.40,3);buf(p,['accuracy'],-.15,3);break;
                case 'capiluppi':st(q,'confuso',1);break;
                case 'giulia':if(chance(.4))st(q,'veleno',2,{currentRatio:.08,itemMultiplier:ItemSystem.has(p,'poison')?2:1});break;
                case 'falco':chosen.forEach(a=>buf(a,atk,.30,Infinity));break;
                case 'genryusai':if(t.statuses.bruciatura)st(q,'ustione',4);else st(q,'bruciatura',3,{itemMultiplier:ItemSystem.has(p,'burn')?2:1});break;
                case 'roshi':buf(p,['defSpec'],1,3);break;
                case 'monkey':chosen.forEach(a=>heal(a,a.hpMax*.50));break;
                case 'faalk':st(q,'aria',1);break;
                case 'majin':if(t.statuses.veleno)st(q,'iperveleno',4);else st(q,'veleno',3,{itemMultiplier:ItemSystem.has(p,'poison')?2:1});break;
                case 'shoto':{const count=s.basic.get(t.id)||0;if(count){U.log(`${source}: seconda porzione al ${count*7}% (${count} autoattacchi).`,'buff');U.strike(p,q,'speciale',count*.07,{infallible:true,label:source+' · seconda porzione'});}break;}
                case 'chan':chosen.forEach(a=>buf(a,atk,.35,Infinity));break;
                case 'falconitsu':buf(p,['dodge'],.5,3);break;
                case 'malfalk':buf(p,['def'],2,2);break;
                case 'falcosing':st(q,'stun',2);break;
                case 'gio':U.cleanse(p);s.shield={kind:'gio',remaining:2};U.log(`${p.nome}: immune a tutti i danni e stati per le prossime 2 azioni nemiche; riflette anche danni puri e periodici.`);break;
                case 'kul':U.team(q).forEach(a=>buf(a,['accuracy'],-.30,3));break;
                case 'chef':if(chance(.2))block();heal(p,total*.30);break;
                case 'madrenatura':U.team(p).filter(a=>a!==p).forEach(a=>heal(a,total*.15));st(p,'rigenerazione',3,{ratio:.15});break;
                case 'altamarea':U.bench(q).forEach(a=>U.strike(p,a,'speciale',m.multiplier*.30,{infallible:true,label:source+' · panchina'}));block();break;
                case 'inferno':buf(p,['atkSpec','defSpec'],1,3);break;
                case 'bossguard':buf(p,def,.20,2);break;
                case 'bossdark':buf(q,atk,-.15,2);break;
                case 'bossslow':buf(q,['vel'],-.20,2);break;
                case 'bossconfuse':if(chance(.25))st(q,'confuso',2);break;
                case 'bossspeed':buf(p,['vel'],.20,2);break;
            }
        }
        aggiornaGrafica();return true;
    }
    function complete(p,enemy,allowRepeat=true) {
        if(allowRepeat&&!enemy&&p===mioPokemon&&p.hpAttuali>0&&nemicoPokemon.hpAttuali>0&&ItemSystem.repeat(p)){tipoAttaccoInCorso='auto';eseguiAnimazioneAttaccoNormale(p,true,()=>{U.strike(p,nemicoPokemon,'auto',CONFIG_MOSSE[p.livelloMossa]||1,{kind:'auto',label:getNomeMossaAttuale(p)});complete(p,false);});return;}
        processaEffettiFineTurno(p,enemy);U.bindActive();aggiornaGrafica();
        if(nemicoPokemon.hpAttuali<=0){
            if(mioPokemon.hpAttuali<=0){
                if(!miaSquadra.some(a=>a.hpAttuali>0)){gestisciKOGiocatore();return;}
                U.log(`${mioPokemon.nome} è KO dopo il proprio attacco; entra il prossimo alleato vivo.`, 'cambi');mandaInCampoMioPokemon();U.bindActive();
            }
            gestisciKONemico();return;
        }
        if(mioPokemon.hpAttuali<=0){gestisciKOGiocatore();return;}
        if(!enemy&&typeof isChallengeBattle!=='undefined'&&isChallengeBattle&&controllaTriggerChallenge())return;
        if(!enemy)tipoAttaccoInCorso='auto';
        if(enemy)abilitaControlliGiocatore();else setTimeout(turnoNemico,isSkipAttivo?500:1000);
    }
    function player(){const p=mioPokemon,selection=U.takePrepared(p);execute(p,selection,false).then(result=>{tipoAttaccoInCorso='auto';if(result!=='fuga')complete(p,false);});}
    function enemy(p){execute(p,null,true).then(result=>{if(result!=='fuga')complete(p,true);});}
    return {execute,complete,player,enemy};
})();

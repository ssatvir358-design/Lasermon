/* Presentation adapters. Load after game modules; game rules remain in their modules. */
const StudioIcons = {
    play:'<path d="m8 5 11 7-11 7Z"/>',
    swords:'<path d="m4 3 8 8M3 3l1 5 4-4-5-1Zm17 0-8 8m8-8-1 5-4-4 5-1ZM5 14l5 5m4-5 5 5M3 21l5-5m13 5-5-5"/>',
    trophy:'<path d="M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 3v6m-4 1h8"/>',
    dex:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 17h8"/><circle cx="12" cy="12" r="2"/>',
    book:'<path d="M3 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h6V4Z"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    settings:'<path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z"/><circle cx="12" cy="12" r="3"/>',
    future:'<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/>'
};
function studioIcon(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(StudioIcons[name]||StudioIcons.play)+'</svg>'; }

// Adding a mode requires a registry entry; the launcher layout expands automatically.
const GAME_MODES = [
    {id:'run',buttonId:'btn-start',title:'Modalità Run',art:'run-banner-v2.png',tag:'CLASSICA / VELOCE',icon:'swords',description:'Una mappa, infinite possibilità. Costruisci la squadra e raggiungi la vetta della Lega.',cta:'Parti per la run',className:'mode-run',action:()=>apriSelezioneModalita()},
    {id:'challenge',buttonId:'btn-challenge',title:'Challenge',art:'challenge-banner-v1.png',tag:'BOSS FIGHT',icon:'trophy',description:'Affronta i boss con i tuoi campioni. Scopri le fasi e perfeziona la tua strategia.',cta:'Scegli la tua sfida',className:'mode-challenge',action:()=>apriChallengeList()}
];
function registerGameMode(mode) {
    if(!mode || !/^[a-z][a-z0-9-]*$/.test(mode.id) || typeof mode.action!=='function' || typeof mode.title!=='string' || !mode.title.trim()) throw new Error('Una modalità richiede ID, titolo e una funzione action.');
    if(GAME_MODES.some(entry=>entry.id===mode.id || (mode.buttonId && entry.buttonId===mode.buttonId))) throw new Error('Modalità già registrata.');
    GAME_MODES.push(mode);
    if(document.getElementById('mode-catalogue')) StudioUI.renderModes();
}

const StudioUI = {
    prefs:{motion:'system',contrast:false,text:'normal'},modalStack:[],lastFocused:null,
    escape(value) { return BattleUI.escape(String(value ?? '')); },
    reducedMotion() { return this.prefs.motion==='reduced' || (this.prefs.motion!=='full' && matchMedia('(prefers-reduced-motion: reduce)').matches); },
    loadPreferences() {
        try {
            const stored=JSON.parse(AppStorage.getItem('laserpoke_interface')||'{}');
            this.prefs={motion:['system','full','reduced'].includes(stored.motion)?stored.motion:'system',contrast:stored.contrast===true,text:stored.text==='large'?'large':'normal'};
        } catch { this.prefs={motion:'system',contrast:false,text:'normal'}; }
        this.applyPreferences();
    },
    applyPreferences() {
        const body=document.body;
        body.dataset.uiMotion=this.prefs.motion;body.dataset.uiContrast=String(this.prefs.contrast);body.dataset.uiText=this.prefs.text;
        document.getElementById('pref-motion').value=this.prefs.motion;
        document.getElementById('pref-contrast').checked=this.prefs.contrast;
        document.getElementById('pref-text').value=this.prefs.text;
        document.querySelectorAll('.settings-tabs button').forEach(button=>button.tabIndex=button.getAttribute('aria-selected')==='true'?0:-1);
    },
    setPreference(key,value) {
        if(!['motion','contrast','text'].includes(key)) return;
        this.prefs[key]=value;this.applyPreferences();
        try { AppStorage.setItem('laserpoke_interface',JSON.stringify(this.prefs));document.getElementById('interface-message').textContent='Preferenze aggiornate.'; }
        catch { document.getElementById('interface-message').textContent='Impostazione applicata. Il browser non consente il salvataggio.'; }
    },
    async fullscreen() {
        const message=document.getElementById('interface-message');
        try {
            if(document.fullscreenElement) await document.exitFullscreen();
            else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
            else throw new Error('Lo schermo intero non è disponibile in questo browser.');
            message.textContent='Visualizzazione aggiornata.';
        } catch(error) { message.textContent=error.message || 'Schermo intero non disponibile.'; }
    },
    showLobbyTab(tab) {
        if(document.body.classList.contains('camp-theme')) {
            if(tab==='collection') apriModalInfo();
            return;
        }
        const collection=tab==='collection';
        document.getElementById('lobby-play-section').hidden=collection;
        document.getElementById('lobby-collection-section').hidden=!collection;
        document.querySelectorAll('[data-lobby-tab]').forEach(button=>{
            if(button.dataset.lobbyTab===tab) button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
        });
        this.reveal(collection?document.getElementById('lobby-collection-section'):document.getElementById('mode-catalogue'));
    },
    renderModes() {
        const catalogue=document.getElementById('mode-catalogue');catalogue.replaceChildren();
        const camp=document.body.classList.contains('camp-theme');
        const extra=document.getElementById('camp-extra-modes');
        if(camp)extra.replaceChildren();
        GAME_MODES.forEach(mode=>{
            if(camp) {
                const landmark=['run','challenge'].includes(mode.id);
                const button=document.createElement('button');button.type='button';
                button.className='camp-landmark '+(landmark?'landmark-'+mode.id:'landmark-extra');
                button.dataset.landmark=mode.id;if(mode.buttonId)button.id=mode.buttonId;
                const title=mode.id==='run'?'Nuova Run':mode.title;
                const description=mode.id==='run'?'Un nuovo percorso. La tua squadra.':mode.id==='challenge'?'Affronta i boss della Lega.':mode.description||'';
                button.innerHTML='<span class="camp-sign"><span class="camp-sign-title">'+studioIcon(mode.icon)+'<span>'+this.escape(title)+'</span></span><small>'+this.escape(description)+'</small><span class="camp-sign-hint">'+this.escape(mode.id==='run'?'Classica / Veloce':mode.cta||'Gioca')+' <b aria-hidden="true">→</b></span></span>';
                button.addEventListener('click',mode.action);(landmark?catalogue:extra).append(button);
                return;
            }
            const card=document.createElement('button');card.type='button';card.className='mode-card '+(mode.className||'');if(mode.buttonId)card.id=mode.buttonId;
            card.innerHTML=(mode.art?'<img class="mode-art" src="../Sprite/UI/TempestaCeleste/'+this.escape(mode.art)+'" alt="" decoding="async" '+(mode.id==='run'?'fetchpriority="high"':'loading="lazy"')+'>':'')+'<span class="mode-card-top"><span class="mode-card-icon">'+studioIcon(mode.icon)+'</span><span class="studio-badge">'+this.escape(mode.tag||'MODALITÀ')+'</span></span><h3>'+this.escape(mode.title)+'</h3><p>'+this.escape(mode.description)+'</p><span class="mode-card-bottom"><span>'+this.escape(mode.cta||'Gioca')+'</span><span aria-hidden="true">↗</span></span>';
            card.addEventListener('click',mode.action);catalogue.append(card);
        });
        if(camp)extra.hidden=!extra.children.length;else this.reveal(catalogue);
    },
    updateLobby() {
        document.getElementById('lobby-profile-name').textContent='Giocatore';
        document.getElementById('lobby-profile-avatar').src='../Sprite/UI/Combattimento/leone.png';
        document.getElementById('lobby-profile-status').textContent='Progressi su questo dispositivo';
        document.getElementById('lobby-roster-count').textContent=pokemonDatabase.filter(p=>!p.isEvoluzione).length;
        document.getElementById('lobby-champions-count').textContent=hallOfFameData.length;
        const auto=getSalvataggioInfo('auto');
        document.getElementById('lobby-checkpoint-status').textContent=auto?'Checkpoint disponibile · '+auto.mappa.replace('mappa','Mappa ')+' · Piano '+auto.piano:'Il prossimo viaggio ti aspetta.';
        aggiornaBottoneContinua();
    },
    reveal(root) {
        if(!root || this.reducedMotion())return;
        const nodes=root.matches('.launcher-hero')?root.querySelectorAll('.hero-copy,.hero-art'):root.children;
        Array.from(nodes).slice(0,24).forEach((node,i)=>{
            // Animate once per mount. Avoid changing transforms used by combat/map engines.
            if(node.dataset.studioRevealed)return;
            node.dataset.studioRevealed='true';node.style.setProperty('--reveal-delay',Math.min(i*45,320)+'ms');node.classList.add('studio-reveal');setTimeout(()=>node.classList.remove('studio-reveal'),1000);
        });
    },
    decorateScreen(screen) {
        const excluded=['schermata-start','schermata-mappa','schermata-gioco','schermata-sandbox','schermata-gameover','schermata-ult'];
        if(screen.classList.contains('schermata') && !excluded.includes(screen.id) && !screen.id.startsWith('modal-') && screen.id!=='custom-alert-modal') {
            screen.classList.add('studio-surface');
            screen.style.removeProperty('background');screen.style.removeProperty('background-color');
        }
    },
    dialogEntries() {
        return [
            ['modal-info',()=>chiudiModalInfo()],['modal-impostazioni',()=>chiudiImpostazioni()],['modal-diario',()=>chiudiDiario()],
            ['modal-selezione-modalita',()=>BattleUI.closeModal('modal-selezione-modalita')],['schermata-manuale',()=>chiudiManualeDiGioco()],
            ['schermata-salvataggi',()=>chiudiSchermataSlot()],['modal-challenge-saves',()=>chiudiSalvataggiChallenge()],
            ['modal-conferma-lobby',()=>document.getElementById('modal-conferma-lobby').style.display='none'],['custom-alert-modal',()=>chiudiAvviso()],
            ['modal-selezione-bersaglio',()=>document.getElementById('modal-selezione-bersaglio').style.display='none']
        ];
    },
    bindDialogs() {
        this.dialogEntries().forEach(([id,close])=>{
            const modal=document.getElementById(id);if(!modal)return;
            modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
            if(!modal.hasAttribute('aria-labelledby')) {
                const heading=modal.querySelector('h1,h2,h3');
                if(heading){if(!heading.id)heading.id=id+'-title';modal.setAttribute('aria-labelledby',heading.id);}
                else modal.setAttribute('aria-label','Messaggio di gioco');
            }
            let visible=modal.style.display && modal.style.display!=='none';
            new MutationObserver(()=>{
                const now=modal.style.display!==''&&modal.style.display!=='none';if(now===visible)return;visible=now;
                if(now) {
                    this.modalStack=this.modalStack.filter(entry=>entry.id!==id);
                    const restore=modal.__studioReturnFocus || (this.lastFocused && !modal.contains(this.lastFocused)?this.lastFocused:null);modal.__studioReturnFocus=null;
                    this.modalStack.push({id,close,restore,originalZ:modal.style.zIndex});modal.style.zIndex=String(10000100+this.modalStack.length);
                    requestAnimationFrame(()=>{const node=id==='modal-info'?document.getElementById('pokedex-search'):modal.querySelector('button:not([disabled]),input:not([hidden]),select');node?.focus();});
                } else {
                    const entry=this.modalStack.find(entry=>entry.id===id);this.modalStack=this.modalStack.filter(entry=>entry.id!==id);
                    if(entry)modal.style.zIndex=entry.originalZ;
                    if(entry?.restore?.isConnected && entry.restore.getClientRects().length)entry.restore.focus();
                }
            }).observe(modal,{attributes:true,attributeFilter:['style']});
            modal.addEventListener('click',event=>{if(event.target===modal)close();});
        });
        document.addEventListener('focusin',event=>{this.lastFocused=event.target;});
        document.addEventListener('keydown',event=>{
            const entry=this.modalStack[this.modalStack.length-1];if(!entry)return;
            const modal=document.getElementById(entry.id);
            if(event.key==='Escape') {
                event.preventDefault();event.stopImmediatePropagation();
                if(entry.id==='modal-info'&&!document.getElementById('pokedex-detail').hidden)StudioDex.closeDetail();else entry.close();
            }
            if(event.key==='Tab') {
                const nodes=Array.from(modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]')).filter(el=>el.getClientRects().length&&!el.closest('[hidden],[inert]')&&el.tabIndex!==-1);
                const first=nodes[0],last=nodes[nodes.length-1];if(!first)return;
                const inside=nodes.includes(document.activeElement);
                if(event.shiftKey&&(document.activeElement===first||!inside)){event.preventDefault();last.focus();}
                else if(!event.shiftKey&&(document.activeElement===last||!inside)){event.preventDefault();first.focus();}
                event.stopImmediatePropagation();
            }
        },true);
    },
    init() {
        this.loadPreferences();this.renderModes();this.updateLobby();
        document.querySelectorAll('[data-icon]').forEach(node=>node.innerHTML=studioIcon(node.dataset.icon));
        document.querySelectorAll('.schermata').forEach(screen=>{
            this.decorateScreen(screen);
            new MutationObserver(records=>{
                if(!screen.classList.contains('studio-surface'))this.decorateScreen(screen);
                const entered=records.some(record=>!(record.oldValue||'').split(' ').includes('attiva'))&&screen.classList.contains('attiva');
                if(entered){screen.scrollTop=0;if(screen.id==='schermata-start')this.updateLobby();this.reveal(screen.querySelector('.challenge-header')||screen.querySelector('#contenitore-starter')||screen.querySelector('.contenitore-disco-full')||screen.querySelector('.contenitore-selezione-retro'));}
            }).observe(screen,{attributes:true,attributeFilter:['class'],attributeOldValue:true});
        });
        this.reveal(document.querySelector('.launcher-hero'));this.bindDialogs();
        document.querySelector('.settings-tabs').addEventListener('keydown',event=>{
            if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
            const tabs=Array.from(document.querySelectorAll('.settings-tabs button'));let index=tabs.indexOf(document.activeElement);if(index<0)return;
            event.preventDefault();index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+tabs.length)%tabs.length;
            tabs[index].click();tabs[index].focus();
        });
        document.addEventListener('pointerdown',event=>{
            if(this.reducedMotion())return;
            const card=event.target.closest('.mode-card:not(.mode-future),.run-variant');if(!card)return;
            const rect=card.getBoundingClientRect(),ripple=document.createElement('span');ripple.className='studio-ripple';ripple.style.left=(event.clientX-rect.left)+'px';ripple.style.top=(event.clientY-rect.top)+'px';card.append(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});setTimeout(()=>ripple.remove(),800);
        });
    }
};

const StudioDex = {
    favorites:new Set(),onlyFavorites:false,selected:null,returnFocus:null,
    items() { return pokemonDatabase.map((p,index)=>({p,index})).filter(({p})=>!p.isEvoluzione); },
    image(p) { if(p.immagineVS)return p.immagineVS;const path=String(p.immagine||'').replaceAll('\\','/');const folder=path.slice(0,path.lastIndexOf('/'));return folder+'/'+folder.slice(folder.lastIndexOf('/')+1)+'VS.png'; },
    normalize(value) { return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); },
    open() {
        try{const saved=JSON.parse(AppStorage.getItem('laserpoke_pokedex_favorites')||'[]');this.favorites=new Set(Array.isArray(saved)?saved.filter(v=>typeof v==='string'):[]);}catch{this.favorites=new Set();}
        this.closeDetail(false);this.reset();BattleUI.openModal('modal-info');document.getElementById('pokedex-search').focus();
    },
    reset() {
        filtroRaritaPokedex='tutti';filtroElementoPokedex='tutti';this.onlyFavorites=false;
        document.getElementById('pokedex-search').value='';document.getElementById('filtro-elemento-pokedex').value='tutti';document.getElementById('pokedex-sort').value='rarity';
        document.getElementById('pokedex-favorites-toggle').setAttribute('aria-pressed','false');aggiornaTabsRaritaPokedex();this.render();
    },
    toggleFavorites() { this.onlyFavorites=!this.onlyFavorites;document.getElementById('pokedex-favorites-toggle').setAttribute('aria-pressed',String(this.onlyFavorites));this.render(); },
    favorite(index) {
        const p=pokemonDatabase[index];if(!p)return;
        const fromDetail=document.getElementById('pokedex-detail').contains(document.activeElement);
        if(this.favorites.has(p.nome))this.favorites.delete(p.nome);else this.favorites.add(p.nome);
        let saveError=false;try{AppStorage.setItem('laserpoke_pokedex_favorites',JSON.stringify([...this.favorites]));}catch{saveError=true;}
        this.render();if(saveError)document.getElementById('info-header').textContent='Preferiti non salvati: spazio esaurito.';if(this.selected===index)this.detail(index,false);
        const next=fromDetail?document.querySelector('#pokedex-detail .studio-button'):document.querySelector('[data-favorite="'+index+'"]');(next||document.getElementById('pokedex-search')).focus();
    },
    render() {
        const grid=document.getElementById('info-griglia-schede');if(!grid)return;
        const q=this.normalize(document.getElementById('pokedex-search').value.trim());const sort=document.getElementById('pokedex-sort').value;const all=this.items();
        const rarity=p=>SCALA_RARITA_MAPPA?.[String(p.raritaTipo).toLowerCase()]||0;
        const rows=all.filter(({p})=> (filtroRaritaPokedex==='tutti'||String(p.raritaTipo).toLowerCase()===filtroRaritaPokedex)&&(filtroElementoPokedex==='tutti'||String(p.elemento).toLowerCase()===filtroElementoPokedex)&&(!this.onlyFavorites||this.favorites.has(p.nome))&&(!q||this.normalize(p.nome).includes(q))).sort((a,b)=>sort==='name'?a.p.nome.localeCompare(b.p.nome,'it'):sort==='attack'?(b.p.atkBase||0)-(a.p.atkBase||0):sort==='speed'?(b.p.velBase||0)-(a.p.velBase||0):rarity(a.p)-rarity(b.p)||a.p.nome.localeCompare(b.p.nome,'it'));
        document.getElementById('info-header').textContent=rows.length+' / '+all.length+' personaggi';
        const escape=StudioUI.escape;
        grid.innerHTML=rows.map(({p,index})=>'<article class="dex-card'+(index===this.selected?' selected':'')+'"><button class="dex-card-main" data-character="'+index+'" onclick="StudioDex.detail('+index+')" aria-label="Apri scheda di '+escape(p.nome)+'"><span class="dex-portrait"><span class="dex-card-number">#'+String(index+1).padStart(3,'0')+'</span><img src="'+escape(this.image(p))+'" data-fallback="'+escape(p.immagine)+'" loading="lazy" decoding="async" alt=""></span><span class="dex-card-caption"><strong>'+escape(p.nome)+'</strong><span class="dex-meta"><span class="dex-element"><img src="../Sprite/elementi/'+escape(p.elemento)+'.png" alt="">'+escape(p.elemento)+'</span><span>'+escape(p.raritaTipo)+'</span></span></span></button><button class="dex-star" data-favorite="'+index+'" aria-label="'+(this.favorites.has(p.nome)?'Rimuovi dai':'Aggiungi ai')+' preferiti: '+escape(p.nome)+'" aria-pressed="'+this.favorites.has(p.nome)+'" onclick="StudioDex.favorite('+index+')">'+(this.favorites.has(p.nome)?'★':'☆')+'</button></article>').join('');
        if(!rows.length)grid.innerHTML='<div class="studio-empty"><span>'+studioIcon('search')+'</span><h3>Nessun personaggio trovato</h3><p>Prova un altro nome oppure azzera i filtri. Puoi aggiungere personaggi ai preferiti con la stella.</p><button class="studio-button" onclick="StudioDex.reset()">Azzera i filtri</button></div>';
        if(this.selected!==null&&!rows.some(row=>row.index===this.selected))this.closeDetail(false);
        StudioUI.reveal(grid);
    },
    detail(index,focus=true) {
        const p=pokemonDatabase[index];if(!p)return;
        const panel=document.getElementById('pokedex-detail'),escape=StudioUI.escape;
        if(focus)this.returnFocus=document.activeElement;this.selected=index;
        const stats=[['HP',p.hpBase],['ATK',p.atkBase],['DEF',p.defBase],['ATK SP.',p.atkSpec],['DEF SP.',p.defSpec],['VEL',p.velBase]];
        panel.innerHTML='<div class="dex-detail-top"><span class="studio-eyebrow">SCHEDA #'+String(index+1).padStart(3,'0')+'</span><button onclick="StudioDex.closeDetail()" aria-label="Chiudi la scheda">×</button></div><img class="dex-detail-image" src="'+escape(this.image(p))+'" data-fallback="'+escape(p.immagine)+'" alt="'+escape(p.nome)+'"><h3>'+escape(p.nome)+'</h3><span class="studio-badge">'+escape(p.elemento)+' · '+escape(p.raritaTipo)+'</span><p>'+escape(String(p.lore||'La storia di questo personaggio deve ancora essere raccontata.').replace(/<[^>]*>/g,''))+'</p><h4>Statistiche base</h4><div class="dex-stats">'+stats.map(([label,value])=>'<div class="dex-stat"><small>'+label+'</small><strong>'+escape(value??'—')+'</strong></div>').join('')+'</div><p>Valori base: le statistiche in gioco crescono con il livello, l’elemento e la rarità.</p><h4>Mosse</h4>'+[p.mossaLvl1,p.mossaLvl2,p.mossaLvl3].map((move,i)=>'<div class="dex-move"><span>LV '+(i+1)+'</span><strong>'+escape(move&&move!=='|'?move:'Non definita')+'</strong></div>').join('')+(p.ultimate?'<div class="dex-move"><span>LV 50</span><strong>'+escape(p.ultimate.name)+'</strong></div><p>'+escape(p.ultimate.description)+'</p><p>'+p.ultimate.uses+' utilizzi per PG · '+escape(p.sesso)+'</p>':p.mossaULT?'<div class="dex-move"><span>BOSS</span><strong>'+escape(p.mossaULT)+'</strong></div>':'')+'<button class="studio-button" style="margin-top:22px;width:100%" onclick="StudioDex.favorite('+index+')">'+(this.favorites.has(p.nome)?'★ Rimuovi dai preferiti':'☆ Aggiungi ai preferiti')+'</button>';
        panel.hidden=false;panel.scrollTop=0;
        document.querySelectorAll('.dex-card').forEach(card=>card.classList.toggle('selected',Number(card.querySelector('[data-character]')?.dataset.character)===index));
        document.getElementById('info-griglia-schede').inert=matchMedia('(max-width:600px)').matches;
        if(focus)panel.querySelector('button').focus();
    },
    closeDetail(focus=true) {
        document.getElementById('pokedex-detail').hidden=true;document.getElementById('info-griglia-schede').inert=false;
        this.selected=null;document.querySelectorAll('.dex-card.selected').forEach(card=>card.classList.remove('selected'));
        if(focus){if(this.returnFocus?.isConnected)this.returnFocus.focus();else document.getElementById('pokedex-search').focus();}
    }
};

// The archive shares the existing public navigation API.
apriModalInfo=()=>StudioDex.open();
chiudiModalInfo=()=>{StudioDex.closeDetail(false);BattleUI.closeModal('modal-info');};
applicaFiltriPokedex=()=>StudioDex.render();
aggiornaTabsRaritaPokedex=function() {
    const tabs=document.getElementById('pokedex-rarita-tabs');tabs.replaceChildren();
    const rarities=['tutti',...Object.keys(CONFIG_RARITA)];
    rarities.forEach(rarity=>{
        const button=document.createElement('button');button.className='btn-rarita-tab'+(filtroRaritaPokedex===rarity?' attivo':'');button.textContent=rarity==='tutti'?'Tutti':rarity==='special'?'Speciali':rarity;button.setAttribute('aria-pressed',String(filtroRaritaPokedex===rarity));button.onclick=()=>cambiaRaritaPokedex(rarity);tabs.append(button);
    });
};
const studioSettingsTab=switchImpostazioniTab;
switchImpostazioniTab=function(tab){studioSettingsTab(tab);document.querySelectorAll('.settings-tabs button').forEach(button=>button.tabIndex=button.getAttribute('aria-selected')==='true'?0:-1);};


renderChallengeCards=function() {
    const container=document.getElementById('challenge-cards-container');container.replaceChildren();
    Object.values(CHALLENGE_BOSSES).forEach(boss=>{
        const phase=challengeProgress.bossMaxPhase[boss.id]||0,card=document.createElement('button');card.type='button';card.className='challenge-card element-glow-'+boss.elemento;
        card.innerHTML='<span class="challenge-card-portrait">'+getBossImageHTML(boss.id)+'</span><span class="challenge-card-caption"><span class="studio-eyebrow">CHALLENGE · '+StudioUI.escape(boss.elemento)+'</span><h3>'+StudioUI.escape(boss.nome)+'</h3><span class="challenge-progress" aria-label="'+phase+' fasi raggiunte su '+boss.fasi+'">'+Array.from({length:boss.fasi},(_,i)=>'<i class="'+(phase>i?'done':'')+'"></i>').join('')+'</span><p>'+(phase?'Fase '+phase+' raggiunta. Riprendi la sfida.':'Un avversario da scoprire. Affrontalo per svelarne le fasi.')+'</p><span class="mode-card-bottom"><span>Scopri la sfida</span><span aria-hidden="true">↗</span></span></span>';
        card.onclick=()=>apriDettaglioChallenge(boss.id);container.append(card);
    });StudioUI.reveal(container);
};
renderHallOfFameGallery=function(){
    const container=document.getElementById('hof-gallery-container');
    if(!hallOfFameData.length)container.innerHTML='<div class="studio-empty"><span>'+studioIcon('trophy')+'</span><h3>Ogni leggenda ha un inizio.</h3><p>Completa una run classica per aggiungere la squadra vincente alla Hall of Fame. I campioni saranno disponibili nelle Challenge.</p><button class="studio-button primary" onclick="cambiaSchermata(&quot;schermata-hall-of-fame&quot;,&quot;schermata-start&quot;);apriSelezioneModalita()">Inizia una run</button></div>';
    else container.innerHTML=hallOfFameData.map(pg=>{const base=pokemonDatabase.find(p=>p.nome.toLowerCase()===String(pg.nome).toLowerCase())||pg;return '<article class="hof-card"><img src="'+StudioUI.escape(StudioDex.image(base))+'" data-fallback="'+StudioUI.escape(pg.immagine)+'" class="hof-pg-img" loading="lazy" alt="'+StudioUI.escape(pg.nome)+'"><div class="hof-pg-name">'+StudioUI.escape(pg.nome)+'</div><span class="studio-eyebrow">'+StudioUI.escape(pg.elemento||'Campione')+'</span></article>';}).join('');
    StudioUI.reveal(container);
};
const studioDraftRoster=renderDraftRoster;
renderDraftRoster=function(){
    studioDraftRoster();document.querySelectorAll('#draft-roster-container .draft-card').forEach((card,index)=>{
        const pg=hallOfFameData[index],disabled=card.classList.contains('draft-card-disabled');
        card.setAttribute('role','button');card.tabIndex=disabled?-1:0;card.setAttribute('aria-disabled',String(disabled));card.setAttribute('aria-label',(disabled?'Già in squadra: ':'Aggiungi alla squadra: ')+pg.nome);
        card.addEventListener('keydown',event=>{if(!disabled&&(event.key==='Enter'||event.key===' ')){event.preventDefault();card.click();}});
        const img=card.querySelector('img');if(img){img.removeAttribute('onerror');img.dataset.fallback=pg.immagine;img.alt=pg.nome;}
    });
};
const studioDraftTeam=renderDraftSquadra;
renderDraftSquadra=function(){
    studioDraftTeam();document.querySelectorAll('#draft-squadra-container .draft-slot').forEach((slot,index)=>{
        const pg=challengeDraftTeam[index];if(!pg){slot.setAttribute('aria-label','Posto libero '+(index+1));return;}
        slot.setAttribute('role','button');slot.tabIndex=0;slot.setAttribute('aria-label','Rimuovi dalla squadra: '+pg.nome);
        slot.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();slot.click();}});
        const img=slot.querySelector('img');if(img){img.removeAttribute('onerror');img.dataset.fallback=pg.immagine;img.alt=pg.nome;}
    });
};
const studioPartyRender=aggiornaSquadraMappa;
aggiornaSquadraMappa=function(){
    studioPartyRender();document.querySelectorAll('#griglia-squadra .icona-squadra').forEach((card,index)=>{
        const pg=miaSquadra[index];card.tabIndex=0;card.setAttribute('role','group');card.setAttribute('aria-label',pg.nome+', livello '+pg.livello);
        card.addEventListener('keydown',event=>{if(event.target===card&&(event.key==='Enter'||event.key===' ')){event.preventDefault();mostraDettaglioPokemon(index);}});
        const controls=document.createElement('div');controls.className='party-reorder';
        [-1,1].forEach(delta=>{
            const button=document.createElement('button');button.textContent=delta<0?'↑':'↓';button.setAttribute('aria-label',(delta<0?'Sposta su ':'Sposta giù ')+pg.nome);button.disabled=index+delta<0||index+delta>=miaSquadra.length;
            button.onclick=event=>{event.stopPropagation();if(!document.getElementById('schermata-mappa').classList.contains('attiva'))return;[miaSquadra[index],miaSquadra[index+delta]]=[miaSquadra[index+delta],miaSquadra[index]];aggiornaSquadraMappa();document.querySelectorAll('#griglia-squadra .icona-squadra')[index+delta]?.focus();};controls.append(button);
        });card.append(controls);
    });
};
const studioOpenModal=BattleUI.openModal;
BattleUI.openModal=function(id){document.getElementById(id).__studioReturnFocus=document.activeElement;studioOpenModal.call(this,id);};

// Reserve desktop room for the party and bag; mobile uses a native scrolling map.
window.removeEventListener('resize',adattaRisoluzioneGioco);window.removeEventListener('load',adattaRisoluzioneGioco);document.removeEventListener('DOMContentLoaded',adattaRisoluzioneGioco);
adattaRisoluzioneGioco=function(){
    if(window.ArchipelagoMap){document.getElementById('schermata-mappa').dataset.mapLayout='archipelago';ArchipelagoMap.request();return;}
    const container=document.getElementById('contenitore-mappa-gioco');if(!container)return;
    if(document.getElementById('map-scroll-viewport')) {
        const compact=innerWidth<1350||innerHeight<760;
        document.getElementById('schermata-mappa').dataset.mapLayout=compact?'compact':'wide';
        container.style.transform='none';
        document.documentElement.style.setProperty('--map-scaled-width',(compact?720:900)+'px');
        document.documentElement.style.setProperty('--map-scaled-height','1281px');
        return;
    }
    const mobile=innerWidth<=1100;const scale=mobile?1:Math.min((innerWidth-540)/900,(innerHeight-100)/1281,1);
    container.style.transform=mobile?'none':'translate(-50%, -50%) scale('+Math.max(.2,scale)+')';
    document.documentElement.style.setProperty('--map-scaled-width',(mobile?innerWidth:900*scale)+'px');document.documentElement.style.setProperty('--map-scaled-height',(mobile?1120:1281*scale)+'px');
};
window.addEventListener('resize',adattaRisoluzioneGioco);window.addEventListener('load',adattaRisoluzioneGioco);
window.addEventListener('resize',()=>{if(StudioDex.selected!==null)document.getElementById('info-griglia-schede').inert=matchMedia('(max-width:600px)').matches;});
// Safe artwork fallback: try each source once, then use the bundled emblem.
document.addEventListener('error',event=>{
    const img=event.target;if(!(img instanceof HTMLImageElement)||!img.hasAttribute('data-fallback'))return;
    const fallback=img.dataset.fallback;img.removeAttribute('data-fallback');img.src=fallback||'../Sprite/UI/Combattimento/leone.png';
    img.addEventListener('error',()=>{img.src='../Sprite/UI/Combattimento/leone.png';},{once:true});
},true);
document.addEventListener('DOMContentLoaded',()=>{
    const select=document.getElementById('filtro-elemento-pokedex');Object.keys(CONFIG_STAT_ELEMENTO).forEach(element=>{const option=document.createElement('option');option.value=element;option.textContent=element.charAt(0).toUpperCase()+element.slice(1);select.append(option);});
    StudioUI.init();adattaRisoluzioneGioco();
});
// Give illustrated map nodes meaningful labels for touch tooltips and assistive tech.
const studioMapRender=generaMappaAlbero;
generaMappaAlbero=function(){
    studioMapRender();document.querySelectorAll('#albero-container .nodo-bottone').forEach(node=>{
        const label=(node.dataset.tooltip||'Nodo del percorso').replaceAll('---','').trim();node.setAttribute('aria-label',label);node.title=label;
    });
};

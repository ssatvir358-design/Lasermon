/* Shared arena coordinates, responsive route viewport and VS identities. */
const GamePresentation={
    routeFrame:0,worldFrame:0,
    portrait(p){return p?(p.immagineVS||StudioDex.image(p)||p.immagine):'../Sprite/UI/Combattimento/leone.png';},
    setPortrait(id,p){
        const img=document.getElementById(id);if(!img)return;
        const source=this.portrait(p);
        if(img.dataset.fighterSource===source)return;
        img.dataset.fighterSource=source;img.dataset.fallback=p?.immagine||'../Sprite/UI/Combattimento/leone.png';img.src=source;
    },
    syncFighters(){
        this.setPortrait('player-hud-portrait',mioPokemon);this.setPortrait('enemy-hud-portrait',nemicoPokemon);
        for(const [side,p] of [['player',mioPokemon],['enemy',nemicoPokemon]]) {
            const element=String(p?.elemento||'normale').toLowerCase();
            const color=window.BattleFX?.colors[element]||(side==='player'?'#ff647a':'#43caff');
            document.querySelector('#intro-vs .vs-panel-'+side)?.style.setProperty('--vs-element',color);
            document.getElementById('vs-'+side+'-name').textContent=p?.nome||'—';
            document.getElementById('vs-'+side+'-element').textContent=p?String(p.elemento||'normale').toUpperCase()+' · L. '+p.livello:'';
        }
        document.getElementById('vs-battle-kind').textContent=isBossFight?'BOSS FIGHT':'SCONTRO';
    },
    syncBackdrop(){
        const challenge=typeof isChallengeBattle!=='undefined'&&isChallengeBattle;
        const id=BattleEnvironments.id(challenge?'mappa1':typeof mappaAttuale==='undefined'?'mappa1':mappaAttuale);
        const img=document.getElementById('battle-background'),world=document.getElementById('arena-world');
        const source=BattleEnvironments.background(id);
        if(img.dataset.source!==source){img.dataset.source=source;img.src=source;}
        if(world.dataset.biome!==id){
            world.dataset.biome=id;
            for(const side of ['player','enemy']){
                let platform=world.querySelector('.arena-platform-'+side);
                if(!platform){platform=document.createElement('div');platform.className='arena-platform arena-platform-'+side;platform.setAttribute('aria-hidden','true');world.append(platform);}
                platform.innerHTML=BattleEnvironments.platform(id);
            }
        }
        this.queueWorld();
    },
    queueWorld(){
        if(this.worldFrame)return;
        this.worldFrame=requestAnimationFrame(()=>{this.worldFrame=0;this.sizeWorld();});
    },
    fitSprite(img){
        if(!img?.complete||!img.naturalWidth)return;
        const box=img.parentElement,w=box.clientWidth,h=box.clientHeight;
        if(!w||!h)return;
        const path=decodeURIComponent(new URL(img.src,document.baseURI).pathname).slice(decodeURIComponent(BattleEnvironments.root.pathname).length).toLowerCase();
        const data=window.BattleSpriteBounds?.[path],size=data?.size||[img.naturalWidth,img.naturalHeight],crop=data?.crop||[0,0,...size];
        const [x,y,cw,ch]=crop,scale=Math.min(w/cw,h/ch);
        img.dataset.artFit='true';
        box.dataset.artHeight=String(ch*scale);
        for(const [key,value] of Object.entries({'width':size[0]*scale,'height':size[1]*scale,'left':(w-cw*scale)/2-x*scale,'top':h-ch*scale-y*scale}))img.style.setProperty('--art-'+key,value+'px');
    },
    sizeWorld(){
        const viewport=document.getElementById('battle-viewport'),world=document.getElementById('arena-world');
        if(!viewport.clientWidth||!viewport.clientHeight)return;
        world.style.width='100%';world.style.height='100%';
        for(const id of ['img-giocatore','img-nemico'])this.fitSprite(document.getElementById(id));
    },
    sizeRoute(){
        if(window.ArchipelagoMap){ArchipelagoMap.sync();return;}
        const canvas=document.getElementById('contenitore-mappa-gioco');
        const rows=canvas.querySelectorAll('.piano').length;
        const height=Math.max(1281,rows*92+140);
        if(canvas.style.height!==height+'px')canvas.style.height=height+'px';
        adattaRisoluzioneGioco();
        if(document.getElementById('schermata-mappa').classList.contains('attiva')&&rows)disegnaLineeMappa();
    },
    focusRoute(){
        if(window.ArchipelagoMap){ArchipelagoMap.focusRoute();return;}
        const viewport=document.getElementById('map-scroll-viewport');
        const nodes=[...document.querySelectorAll('#albero-container .nodo-selezionabile')];
        const target=nodes[Math.floor(nodes.length/2)]||document.querySelector('#albero-container .radice-mappa');
        if(!target)return;
        const r=target.getBoundingClientRect(),v=viewport.getBoundingClientRect();
        viewport.scrollTo({left:viewport.scrollLeft+r.left+r.width/2-v.left-viewport.clientWidth/2,top:viewport.scrollTop+r.top-v.top-viewport.clientHeight*.3,behavior:StudioUI.reducedMotion()?'auto':'smooth'});
    },
    queueRoute(focus=false){
        if(this.routeFrame)cancelAnimationFrame(this.routeFrame);
        this.routeFrame=requestAnimationFrame(()=>{this.routeFrame=0;this.sizeRoute();if(focus)this.focusRoute();});
    },
    init(){
        const screen=document.getElementById('schermata-gioco'),map=document.getElementById('schermata-mappa');
        new MutationObserver(()=>this.syncBackdrop()).observe(screen,{attributes:true,attributeFilter:['style','class']});
        new ResizeObserver(()=>this.queueWorld()).observe(document.getElementById('battle-viewport'));
        document.getElementById('battle-background').addEventListener('load',()=>this.queueWorld());
        new MutationObserver(()=>{if(map.classList.contains('attiva'))this.queueRoute(true);}).observe(map,{attributes:true,attributeFilter:['class']});
        new ResizeObserver(()=>this.queueRoute()).observe(document.getElementById('map-scroll-viewport'));
        const tree=document.getElementById('albero-container');
        new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.classList.contains('piano'))))this.queueRoute(true);}).observe(tree,{childList:true});
        for(const id of ['img-giocatore','img-nemico']){
            const img=document.getElementById(id);
            img.addEventListener('load',()=>this.fitSprite(img));
            new MutationObserver(()=>{this.fitSprite(img);}).observe(img,{attributes:true,attributeFilter:['src']});
        }
        this.syncBackdrop();this.syncFighters();this.queueRoute();
    }
};
document.addEventListener('DOMContentLoaded',()=>GamePresentation.init());

/* The real procedural run graph, presented as an archipelago. No replacement game state. */
window.ArchipelagoMap={
 scene:null,selected:null,worldKey:null,nodes:[],islands:[],bridges:[],focus:2,yaw:-.17,pitch:.68,zoom:1,overview:false,frame:0,lastFrame:0,animation:0,
 rand(n){const x=Math.sin(n*127.1+this.theme.seed)*43758.5453;return x-Math.floor(x);},
 reduced(){return typeof StudioUI!=='undefined'?StudioUI.reducedMotion():matchMedia('(prefers-reduced-motion:reduce)').matches;},
 available(n){return n.piano===pianoAttuale+1&&!!alberoMappa[pianoAttuale]?.[nodoSceltoAttuale]?.figli.includes(n.id);},
 active(){return document.getElementById('schermata-mappa')?.classList.contains('attiva')&&!document.hidden;},
 init(){
  const viewport=document.getElementById('map-scroll-viewport');
  viewport.insertAdjacentHTML('beforeend','<canvas id="archipelago-canvas" tabindex="0" aria-label="Arcipelago della run. Trascina in orizzontale per ruotare e in verticale per esplorare i piani. Tocca direttamente una destinazione."></canvas><div class="archipelago-heading"><span class="archipelago-kicker">RUN / ARCIPELAGO CELESTE</span><h2 id="archipelago-name"></h2><p id="archipelago-subtitle"></p></div><nav class="archipelago-camera" aria-label="Camera 3D"><button data-camera="left" aria-label="Ruota a sinistra">↶</button><button data-camera="right" aria-label="Ruota a destra">↷</button><button data-camera="out" aria-label="Allontana">−</button><button data-camera="in" aria-label="Avvicina">+</button><button data-camera="home">Centra</button><button data-camera="overview" id="archipelago-overview" aria-pressed="false">Panoramica</button></nav><div class="archipelago-travel"><button id="archipelago-prev" aria-label="Esplora i piani precedenti">‹</button><label for="archipelago-floor">Piano <output id="archipelago-floor-label">1</output></label><input id="archipelago-floor" type="range" min="0" max="14" value="2" step="0.1" aria-label="Esplora i piani della mappa"><button id="archipelago-next" aria-label="Esplora i prossimi piani">›</button></div><aside class="archipelago-inspector" aria-label="Destinazione selezionata"><span id="archipelago-status"></span><h3 id="archipelago-node-title"></h3><p id="archipelago-node-copy"></p><span class="archipelago-fixed-type">EVENTO FISSO · SCEGLI UN’ISOLA SULLA MAPPA</span><button id="archipelago-enter">Raggiungi l’isola →</button></aside><span class="archipelago-hint">Trascina per esplorare · tocca un’isola per i dettagli</span>');
  this.scene=new Laser3D.Scene(document.getElementById('archipelago-canvas'));
  this.spriteReady=()=>this.request();
  document.getElementById('schermata-mappa').dataset.map3d='true';
  document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{const a=b.dataset.camera;if(a==='left')this.yaw-=.25;if(a==='right')this.yaw+=.25;if(a==='out')this.zoom=Math.max(.6,this.zoom-.15);if(a==='in')this.zoom=Math.min(1.8,this.zoom+.15);if(a==='home')this.focusRoute();if(a==='overview'){this.overview=!this.overview;b.setAttribute('aria-pressed',String(this.overview));}this.request();});
  const range=document.getElementById('archipelago-floor');range.oninput=()=>{this.overview=false;this.focus=Number(range.value);this.request();};
  document.getElementById('archipelago-prev').onclick=()=>this.travel(-1);document.getElementById('archipelago-next').onclick=()=>this.travel(1);
  document.getElementById('archipelago-enter').onclick=()=>this.enter();
  const canvas=this.scene.canvas,pointers=new Map();let drag=null,pinch=null;
  canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,yaw:this.yaw,focus:this.focus,moved:false};if(pointers.size===2){const p=[...pointers.values()];pinch={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom:this.zoom};drag.moved=true;}});
  canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)){const h=this.hit(e);canvas.style.cursor=h?'pointer':'grab';if(this.hover!==h?.id){this.hover=h?.id;this.request();}return;}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const p=[...pointers.values()];this.zoom=Math.max(.6,Math.min(1.8,pinch.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/(pinch.distance||1)));drag.moved=true;}else if(drag&&!pinch){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;this.yaw=drag.yaw+dx*.006;this.focus=Math.max(0,Math.min(this.maxFloor,drag.focus+dy*.013));}this.request();});
  const release=e=>{const moved=drag?.moved||pinch;pointers.delete(e.pointerId);if(!moved){const n=this.hit(e);if(n)this.select(n.id);}if(!pointers.size){drag=null;pinch=null;}else if(drag)drag.moved=true;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',()=>{pointers.clear();drag=null;pinch=null;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey)this.zoom=Math.max(.6,Math.min(1.8,this.zoom-e.deltaY*.001));else{this.overview=false;this.focus=Math.max(0,Math.min(this.maxFloor,this.focus+e.deltaY*.006));}this.request();},{passive:false});
  canvas.addEventListener('keydown',e=>{const actions={ArrowLeft:()=>this.yaw-=.15,ArrowRight:()=>this.yaw+=.15,ArrowUp:()=>this.travel(1),ArrowDown:()=>this.travel(-1),'+':()=>this.zoom=Math.min(1.8,this.zoom+.1),'-':()=>this.zoom=Math.max(.6,this.zoom-.1),Home:()=>this.focusRoute()};if(actions[e.key]){e.preventDefault();actions[e.key]();this.request();}});
  new ResizeObserver(()=>this.request()).observe(viewport);
  new MutationObserver(()=>{if(this.active()){this.sync();this.start();}else this.stop();}).observe(document.getElementById('schermata-mappa'),{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>this.active()?this.start():this.stop());
  new MutationObserver(()=>{this.stop();this.request();if(this.active())this.start();}).observe(document.body,{attributes:true,attributeFilter:['data-ui-motion']});
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',()=>{this.stop();this.request();if(this.active())this.start();});
  this.sync();
 },
 travel(delta){this.overview=false;this.focus=Math.max(0,Math.min(this.maxFloor,this.focus+delta));this.request();},
 focusRoute(){this.overview=false;this.yaw=-.17;this.zoom=1;this.focus=Math.min(this.maxFloor,pianoAttuale+1.7);document.getElementById('archipelago-overview')?.setAttribute('aria-pressed','false');this.request();},
 sync(){
  if(!this.scene)return;this.theme=LaserMapThemes[mappaAttuale]||LaserMapThemes.mappa1;
  const key=mappaAttuale+'|'+JSON.stringify(alberoMappa.map(row=>row.map(n=>[n.id,n.tipo,n.elementoNpc,n.figli])));
  if(this.worldKey!==key){this.worldKey=key;this.loadPanorama();this.build();this.focusRoute();}
  const current=this.nodes.find(n=>n.id===this.selected);if(!current||(!this.available(current)&&current.piano<=pianoAttuale))this.selected=this.nodes.find(n=>this.available(n))?.id||this.nodes.at(-1)?.id;
  document.getElementById('archipelago-name').textContent=this.theme.name;document.getElementById('archipelago-subtitle').textContent=this.theme.subtitle;document.getElementById('archipelago-floor').max=this.maxFloor;
  this.updateInspector();this.request();if(this.active())this.start();
 },
 describe(n){
  const types={start:['Partenza','Il punto di partenza della tua squadra.'],npc:['Sfida allenatore','Combatti contro un avversario di tipo '+String(n.elementoNpc||'normale').toUpperCase()+'.'],cespuglio:['Erba alta','Un incontro selvatico e una nuova occasione per crescere.'],pokeball:['Reclutamento','Scegli un nuovo personaggio per la tua squadra.'],disco:['Macchina tecnica','Potenzia la mossa di un membro della squadra.'],scambio:['Scambio','Scopri una proposta di scambio.'],mistero:['Varco misterioso','Un evento sconosciuto ti attende su questa isola.'],item:['Scrigno degli strumenti','Raccogli uno strumento per il viaggio.'],miniboss:['Miniboss','Un incontro più impegnativo prima della sfida finale.'],'centro-medico':['Rifugio e negozio','Cura la squadra o acquista strumenti.'],boss:['Guardiano finale','L’ultima sfida di questa regione.']};
  let [title,copy]=types[n.tipo]||['Incontro','Esplora questa destinazione.'];if(n.tipo==='boss'){const boss=typeof ARCHIVIO_BOSS!=='undefined'?ARCHIVIO_BOSS[ARCHIVIO_MAPPE[mappaAttuale]?.idBoss]:null;title=mappaAttuale==='mappa9'?'I quattro Bombers':mappaAttuale==='mappa10'?'Santuario di Max':boss?.nome||title;}
  return {title,copy};
 },
 select(id,focus=false){const n=this.nodes.find(n=>n.id===id);if(!n)return;this.selected=id;if(focus){this.overview=false;this.focus=Math.min(this.maxFloor,n.piano+1);}this.updateInspector();this.request();},
 updateInspector(){const n=this.nodes.find(n=>n.id===this.selected);if(!n){document.getElementById('archipelago-enter').disabled=true;return;}const d=this.describe(n),available=this.available(n);document.getElementById('archipelago-status').textContent=available?'DESTINAZIONE RAGGIUNGIBILE':n.piano<=pianoAttuale?'PIANO SUPERATO':'DA RAGGIUNGERE';document.getElementById('archipelago-node-title').textContent=d.title;document.getElementById('archipelago-node-copy').textContent=d.copy;const button=document.getElementById('archipelago-enter');button.disabled=!available;button.textContent=available?'Raggiungi l’isola →':'Percorso non disponibile';},
 enter(){const n=this.nodes.find(n=>n.id===this.selected);if(!n||!this.available(n)||!this.active())return;document.getElementById('archipelago-enter').disabled=true;avviaEvento(n.piano,n.index,n.tipo);this.sync();this.focusRoute();},
 build(){
  this.maxFloor=Math.max(1,alberoMappa.length-1);this.nodes=[];this.islands=[];this.bridges=[];this.scenery=[];const bossIndex=mappaAttuale==='mappa10'?13:Number(ARCHIVIO_MAPPE[mappaAttuale]?.idBoss)||1;
  alberoMappa.forEach((row,p)=>row.forEach((node,i)=>{const variation=this.rand(p*13+i*71),x=(i-(row.length-1)/2)*3.65+Math.sin(p*.82)*.4+(variation-.5)*.4,y=p*.13+Math.sin(p*.7+i)*(this.theme.landmark==='citadel'?.5:.25),z=-p*3.75+Math.sin(i*1.4+p)*.3,r=node.tipo==='boss'?(mappaAttuale==='mappa10'?2.2:1.55):1.03+variation*.17;const n={...node,position:[x,y,z],radius:r};this.nodes.push(n);this.islands.push({node:n,mesh:this.island(n),model:node.tipo==='start'?LaserNodeModels.build('start'):null});}));
  // Distant terrain is decoration, never an extra selectable destination.
  for(let p=0;p<=this.maxFloor;p+=2)for(const side of [-1,1]){
   const radius=2.1+this.rand(p+side+400)*1.1,node={piano:p,index:side+9,radius,tipo:'scenery'};
   const mesh=this.island(node);if(p%4===0)this.landmark(mesh,radius);
   this.scenery.push({piano:p,mesh,position:[side*(10.6+this.rand(p+800)*2),-1.1-this.rand(p+600),-p*3.75-1]});
  }
  const byId=new Map(this.nodes.map(n=>[n.id,n]));for(const n of this.nodes)for(const id of n.figli){const b=byId.get(id);if(!b)continue;const mesh=new Laser3D.Mesh(),dx=b.position[0]-n.position[0],dz=b.position[2]-n.position[2],len=Math.hypot(dx,dz),trimA=n.radius*.78/len,trimB=b.radius*.78/len,a=n.position.map((v,i)=>v+(b.position[i]-v)*trimA),end=b.position.map((v,i)=>v+(n.position[i]-v)*trimB);a[1]+=.04;end[1]+=.04;mesh.bridge(a,end,.18,this.theme.landmark==='temple'?'#bfb697':'#a28a68');this.bridges.push({mesh,a:n,b});}
 },
 loadPanorama(){
  this.panorama=null;this.panoramaVersion=(this.panoramaVersion||0)+1;
  if(!window.BattleEnvironments)return;
  const id=mappaAttuale,image=new Image();image.onload=()=>{if(id!==mappaAttuale)return;this.panorama=image;this.panoramaVersion++;this.request();};image.src=BattleEnvironments.background(id);
 },
 island(n){const m=new Laser3D.Mesh(),t=this.theme,r=n.radius,seed=n.piano*53+n.index*17;
  const built=['temple','citadel','lighthouse'].includes(t.landmark),sides=built?8:11;
  const outline=Array.from({length:sides},(_,i)=>{const a=i/sides*Math.PI*2,rr=r*(built?1:.9+this.rand(seed+i)*.2);return [Math.cos(a)*rr,.05,Math.sin(a)*rr];});
  m.face([...outline].reverse(),t.top,false);
  // Layered, irregular cliff shelves rather than identical inverted cones.
  for(let i=0;i<sides;i++){
   const a=outline[i],b=outline[(i+1)%sides],low=p=>[p[0]*.93,-.35,p[2]*.93],tip=p=>[p[0]*.57,-1-this.rand(seed+i+90)*.6,p[2]*.57];
   m.face([a,b,low(b),low(a)],Laser3D.color(t.rock,i%2?1.13:.9));
   m.face([low(a),low(b),tip(b),tip(a)],t.rock);
   m.face([[a[0],-.08,a[2]],[b[0],-.08,b[2]],[b[0]*.97,-.13,b[2]*.97],[a[0]*.97,-.13,a[2]*.97]],Laser3D.color(t.top,.8),false);
  }
  // Small ground patches make the surface feel like the region's terrain.
  for(let i=0;i<16;i++){const a=this.rand(seed+i*7)*Math.PI*2,d=r*(.23+this.rand(seed+i*13)*.64),x=Math.cos(a)*d,z=Math.sin(a)*d,k=r*(built?.07:.035);
   m.face([[x-k,.065,z-k],[x+k,.065,z-k],[x+k,.065,z+k],[x-k,.065,z+k]],Laser3D.color(t.top,i%3===0?1.22:.83),false);}
  for(let i=0;i<(n.tipo==='scenery'?5:3);i++){const angle=3.7+i*.82,x=Math.cos(angle)*r*.8,z=Math.sin(angle)*r*.8,s=(n.tipo==='scenery'?.85:.5)+this.rand(seed+i)*.25;this.flora(m,x,.07,z,s);}
  if(t.water&&n.index%3===0){const water=t.landmark==='temple'?'#b6d8e5':'#65d5df';m.face([[r*.1,.075,-r*.8],[r*.34,.075,-r*.6],[r*.34,.075,r*.94],[r*.1,.075,r*.94]],water,false);m.face([[r*.1,.075,r*.94],[r*.34,.075,r*.94],[r*.3,-1.65,r*.9],[r*.14,-1.65,r*.9]],water,false);m.face([[r*.12,.08,r*.96],[r*.18,.08,r*.96],[r*.2,-1.4,r*.92],[r*.15,-1.4,r*.92]],'#b4f3ee',false);}
  if(['arch','ruins'].includes(t.landmark)&&n.index%3===1){m.cylinder(-r*.7,.06,r*.1,.13,.65,'#bdaa87',6).box(-r*.7,.65,r*.1,.34,.12,.32,'#c6b693');}
  if(t.landmark==='citadel'){m.box(0,.07,-r*.83,r*1.2,.4,.13,t.rock);for(let i=-1;i<=1;i++)m.box(i*r*.5,.47,-r*.83,.2,.18,.2,t.top);}
  if(t.landmark==='lighthouse'){m.box(r*.65,.07,r*.2,.3,.23,.3,'#9b7951').cylinder(-r*.7,.07,r*.4,.06,.35,'#415361',5);}
  if(t.landmark==='rift'){m.ring(-r*.6,.08,r*.15,.24,.06,'#ff9c41',false,8).cone(-r*.6,-.05,r*.15,.3,.18,'#f27031',7);}
  if(t.landmark==='temple'){m.ring(0,.075,0,r*.66,.025,'#d7b360',false,10);m.box(-r*.76,.05,-r*.3,.25,.45,.25,'#e7e4d4');}
  if(n.tipo==='boss')this.landmark(m,r);
  return m;
 },
 flora(m,x,y,z,s){const t=this.theme;
  switch(t.flora){
   case 'pine':m.cylinder(x,y,z,s*.09,s*.9,'#6b573f',5).cylinder(x,y+s*.65,z,s*.55,s*.3,'#35694a',7,s*.38).cone(x,y+s*.95,z,s*.45,s*.35,'#619342',7);break;
   case 'snowpine':m.cylinder(x,y,z,s*.07,s*.35,'#887156',5).cone(x,y+s*.2,z,s*.42,s*1.4,t.flora==='snowpine'?'#a7c4ba':'#396e5b',7).cone(x,y+s*.65,z,s*.3,s*1.1,t.flora==='snowpine'?'#dee0d3':'#4b8066',7);break;
   case 'mushroom':m.cylinder(x,y,z,s*.1,s*.6,'#9eaab3',6).cone(x,y+s*.6,z,s*.45,s*.25,'#6e97aa',7).sphere(x,y+s*.82,z,s*.08,'#a4e9cc',3,6);break;
   case 'palm':m.cylinder(x,y,z,s*.07,s*1.5,'#9b8863',6);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;m.face([[x,y+s*1.5,z],[x+Math.cos(a)*s*.8,y+s*1.7,z+Math.sin(a)*s*.8],[x+Math.cos(a+.4)*s*.6,y+s*1.25,z+Math.sin(a+.4)*s*.6]],'#59947c');}break;
   case 'cactus':m.cylinder(x,y,z,s*.13,s*1.1,'#6e9474',6).box(x-s*.22,y+s*.4,z,s*.3,s*.1,s*.14,'#668a6b').cylinder(x-s*.34,y+s*.4,z,s*.07,s*.3,'#7c9b70',6);break;
   case 'coral':for(let i=0;i<3;i++)m.cone(x+(i-1)*s*.17,y,z,s*.14,s*(.5+i*.2),['#db939f','#d1b3c6','#9cabc7'][i],5);break;
   case 'crystal':case 'gold':m.cone(x,y,z,s*.25,s,t.flora==='gold'?'#dcc281':'#caa67a',5);break;
   case 'ember':m.cone(x,y,z,s*.3,s*.6,'#302d42',6).cone(x,y+.06,z,s*.13,s*.45,'#dc7252',5);break;
  }
 },
 landmark(m,r){const t=this.theme;
  if(['temple','citadel','ruins','arch'].includes(t.landmark)){const white=t.landmark==='temple'?'#deded0':'#b6a180';for(const x of [-1,1])m.cylinder(x,.05,-.55,.16,1.5,white,7).box(x,1.5,-.55,.42,.18,.42,t.accent);m.box(0,1.67,-.55,2.4,.22,.45,white);if(t.landmark==='temple')m.cone(0,1.9,-.55,1.1,.55,'#cdb97f',4);}
  else if(t.landmark==='lighthouse'){m.cylinder(-.8,.05,-.65,.28,1.8,'#c5c7bf',8).cylinder(-.8,1.85,-.65,.35,.3,'#dbbd76',8).cone(-.8,2.15,-.65,.4,.35,'#5d7284',8);}
  else if(t.landmark==='rift'){m.ring(0,1.3,-.6,1,.15,'#91534c',true,12).ring(0,1.3,-.6,.83,.04,'#f19360',true,12);}
  else if(t.landmark==='peak'){m.cone(-.85,.05,-.5,.7,1.9,'#7f96a1',7).cone(-.85,1.4,-.5,.22,.55,'#e2e4d7',7);}
  else if(t.landmark==='crystal')m.cone(-.8,.1,-.7,.35,1.7,'#9fcfd4',5).cone(.8,.1,-.7,.35,1.4,'#d4a4c0',5);
 },
 hit(event){const r=this.scene.canvas.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top;return this.scene.hits.filter(h=>Math.hypot(h.x-x,(h.y-y)*1.2)<h.r).sort((a,b)=>b.depth-a.depth)[0]?.node;},
 request(){if(!this.frame)this.frame=requestAnimationFrame(t=>{this.frame=0;if(this.active())this.draw(t);});},
 start(){this.request();},
 stop(){cancelAnimationFrame(this.animation);this.animation=0;},
 draw(time){
  if(!this.scene||!this.theme)return;const scene=this.scene,t=this.theme,mobile=innerWidth<720,reduce=true;time=0;scene.resize();if(!scene.width)return;
  scene.area={x:0,y:mobile?125:75,width:Math.max(240,scene.width-(mobile?0:300)),height:Math.max(150,scene.height-(mobile?420:135))};
  scene.camera={yaw:this.yaw,pitch:this.pitch,zoom:this.zoom,target:[0,this.focus*.13,-this.focus*3.75]};
  if(this.overview){scene.camera.target=[0,this.maxFloor*.065,-this.maxFloor*1.875];scene.unit=Math.min(scene.area.width/22,scene.area.height/(this.maxFloor*3.5*.65+5))*this.zoom;}else scene.unit=Math.min(scene.area.width/(this.maxFloor<3?11:20),scene.area.height/(this.maxFloor<3?8:14))*this.zoom;
  scene.cacheKey=JSON.stringify([this.worldKey,pianoAttuale,scene.width,scene.height,scene.canvas.width,scene.unit,scene.camera,this.overview,this.panoramaVersion]);
  const floor=Math.max(0,Math.min(this.maxFloor,this.focus));document.getElementById('archipelago-floor').value=floor;document.getElementById('archipelago-floor-label').textContent=Math.round(floor);document.getElementById('archipelago-overview').setAttribute('aria-pressed',String(this.overview));
  scene.entries=[];const visible=n=>this.overview||Math.abs(n.piano-this.focus)<(mobile?4.1:4.7),bob=n=>reduce?0:Math.sin(time*.0008+n.index+n.piano*.8)*.045;
  for(const decoration of this.scenery)if(visible(decoration))scene.entries.push(decoration);
  for(const b of this.bridges)if(visible(b.a)||visible(b.b))scene.entries.push({mesh:b.mesh,opacity:b.b.piano<=pianoAttuale ? .55 : .9,gray:b.b.piano<=pianoAttuale});
  for(const island of this.islands){const n=island.node;if(!visible(n))continue;const pos=[n.position[0],n.position[1]+bob(n),n.position[2]],past=n.piano<=pianoAttuale;scene.entries.push({mesh:island.mesh,position:pos,opacity:past ? .78 : 1,gray:past});if(island.model)scene.entries.push({mesh:island.model,position:pos,scale:.85,gray:past});
   if(t.water&&n.index%3===0&&!reduce){const stream=new Laser3D.Mesh(),progress=(time*.00022+n.piano*.17)%1,r=n.radius;stream.face([[r*.22,-progress*1.25,r*.96],[r*.3,-progress*1.25,r*.96],[r*.3,-progress*1.25-.17,r*.94],[r*.22,-progress*1.25-.17,r*.94]],'#b8e6e7',false);scene.entries.push({mesh:stream,position:pos});}
  }
  scene.render((ctx,w,h)=>this.background(ctx,w,h,time),(ctx)=>{
   scene.hits=[];for(const n of [...this.nodes].sort((a,b)=>scene.project(a.position).depth-scene.project(b.position).depth)){
    if(!visible(n))continue;const p=scene.project(n.position),r=Math.max(14,n.radius*scene.unit*p.f),available=this.available(n),past=n.piano<=pianoAttuale,selected=n.id===this.selected,hover=n.id===this.hover;
    scene.hits.push({x:p.x,y:p.y-r*.5,r:r*1.3,depth:p.depth,node:n});
    if(available||selected||hover){
     ctx.save();ctx.strokeStyle=available?'#ffda62':past?'#9ca6ac':t.accent;ctx.lineWidth=available?4:2;
     if(available){ctx.shadowColor='#ffe16e';ctx.shadowBlur=16;ctx.fillStyle='#ffcd522e';}
     ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.04,r*.65,0,0,Math.PI*2);if(available)ctx.fill();ctx.stroke();ctx.shadowBlur=0;
     if(available){ctx.strokeStyle='#fff4b8';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.17,r*.75,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
    }
    if(n.tipo!=='start'){
     ctx.fillStyle='#08132866';ctx.beginPath();ctx.ellipse(p.x,p.y,r*.45,r*.13,0,0,Math.PI*2);ctx.fill();
     ctx.save();if(past){ctx.filter='grayscale(1) brightness(.7)';ctx.globalAlpha=.8;}
     MapSprites.draw(ctx,MapSprites.key(n,mappaAttuale),p.x,p.y+2,r*1.3,r*(n.tipo==='boss'?2.1:1.55),this.spriteReady);ctx.restore();
     const title=({npc:'ALLENATORE',cespuglio:'ERBA ALTA',disco:'DISCO MT',pokeball:'RECLUTAMENTO',mistero:'MISTERO',item:'STRUMENTO',scambio:'SCAMBIO','centro-medico':'RIFUGIO',miniboss:'MINIBOSS',boss:'BOSS'})[n.tipo]||n.tipo;
     ctx.font=(mobile?'16px':'18px')+' CampVT,monospace';ctx.textAlign='center';const width=ctx.measureText(title).width+18,y=p.y+r*.66;
     ctx.fillStyle=available?'#352912f5':'#07152bf2';ctx.fillRect(p.x-width/2,y,width,23);ctx.strokeStyle=past?'#7e8790':available?'#ffd262':t.accent;ctx.lineWidth=available?2:1;ctx.strokeRect(p.x-width/2,y,width,23);ctx.fillStyle=past?'#a1a8af':available?'#ffe9a3':'#d9f3f4';ctx.fillText(title,p.x,y+17);
     if(available){const badge=selected?'▼ SCEGLI':'SCEGLI';ctx.font='bold 15px CampVT,monospace';const bw=ctx.measureText(badge).width+16;ctx.fillStyle='#ffdc76';ctx.fillRect(p.x-bw/2,y+26,bw,20);ctx.fillStyle='#172338';ctx.fillText(badge,p.x,y+41);}
    }
   }

  });
 },
 background(ctx,w,h,time){const t=this.theme,g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,t.sky[0]);g.addColorStop(1,t.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  if(this.panorama){const img=this.panorama,scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;ctx.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih);}
  // Atmospheric veil keeps destination sprites readable over a detailed landscape.
  const veil=ctx.createLinearGradient(0,0,0,h);veil.addColorStop(0,'#06152b55');veil.addColorStop(.5,'#071c3466');veil.addColorStop(1,'#071a3199');ctx.fillStyle=veil;ctx.fillRect(0,0,w,h);
 }
};
document.addEventListener('DOMContentLoaded',()=>ArchipelagoMap.init());

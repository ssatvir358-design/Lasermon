/* Elemental combat presentation. The combat engine remains the source of damage and timing. */
window.BattleFX={
 canvas:null,ctx:null,effects:[],frame:0,hp:new WeakMap(),texts:new Set(),
 colors:{fuoco:'#ff9b4d',acqua:'#65d9ff',erba:'#9fe477',elettro:'#ffe37b',ghiaccio:'#b4f5ff',terra:'#d8b17b',vento:'#a9efd8',buio:'#b397ed',psico:'#fa92ce',veleno:'#cc93f3',folletto:'#ffc5e4',luce:'#fff0ae',drago:'#a598ff',lotta:'#ffa27c',normale:'#e6f1ff'},
 reduced(){return typeof StudioUI!=='undefined'?StudioUI.reducedMotion():matchMedia('(prefers-reduced-motion:reduce)').matches;},
 active(){const screen=document.getElementById('schermata-gioco');return !!screen&&!document.hidden&&(screen.classList.contains('attiva')||screen.style.display==='block')&&screen.getClientRects().length>0;},
 init(){
  if(this.canvas?.isConnected)return;
  const viewport=document.getElementById('battle-viewport');if(!viewport)return;
  const canvas=document.createElement('canvas');canvas.className='battle-fx-canvas';canvas.setAttribute('aria-hidden','true');viewport.append(canvas);this.canvas=canvas;this.ctx=canvas.getContext('2d');
  const numbers=document.createElement('div');numbers.className='battle-fx-numbers';numbers.setAttribute('aria-hidden','true');viewport.append(numbers);this.numbers=numbers;
  new ResizeObserver(()=>this.resize()).observe(viewport);this.resize();
  new MutationObserver(()=>{if(!this.active())this.clear();else this.observeHealth();}).observe(document.getElementById('schermata-gioco'),{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
 },
 resize(){if(!this.canvas)return;const r=this.canvas.parentElement.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);if(!r.width||!r.height)return;this.width=r.width;this.height=r.height;const w=Math.round(r.width*ratio),h=Math.round(r.height*ratio);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.ctx.setTransform(ratio,0,0,ratio,0,0);},
 anchor(side){const image=document.getElementById(side==='player'?'img-giocatore':'img-nemico'),box=image?.closest('.box-sprite-arena-grande'),r=(box||image)?.getBoundingClientRect(),v=this.canvas?.parentElement.getBoundingClientRect();if(!r||!v)return {x:0,y:0};const height=Number(box?.dataset.artHeight)||r.height;return {x:r.left+r.width*.5-v.left,y:r.bottom-height*.54-v.top};},
 remember(){for(const p of [mioPokemon,nemicoPokemon])if(p)this.hp.set(p,p.hpAttuali);},
 observeHealth(){if(!this.active())return;for(const [side,p] of [['player',mioPokemon],['enemy',nemicoPokemon]]){if(!p)continue;const old=this.hp.get(p);if(old!==undefined){const delta=p.hpAttuali-old;if(Math.abs(delta)>=.5)this.number(side,Math.round(Math.abs(delta)),delta>0?'heal':'damage');}this.hp.set(p,p.hpAttuali);}},
 cast(pokemon,isPlayer,duration=1500,kind='base',move=''){
  if(!this.canvas)this.init();if(!this.active()||!this.ctx)return;this.resize();this.observeHealth();const source=isPlayer?'player':'enemy',element=String(pokemon?.elemento||'normale').toLowerCase();
  this.effects.push({type:'cast',source,target:isPlayer?'enemy':'player',element,kind,move,support:!!pokemon?._ultimateSupport,ability:pokemon?._ultimateEffect,start:performance.now(),duration:Math.max(300,duration),reduced:this.reduced()});this.loop();
 },
 hit({source='player',element='normale',damage=0,efficacy=1,kind='base',target=null,label=null}={}){
  this.resize();
  if(!this.active()||!this.canvas)return;const side=target||(source==='player'?'enemy':'player');element=String(element).toLowerCase();
  if(label)this.number(side,label,'notice');else if(efficacy===0)this.number(side,'IMMUNE','notice');else if(damage>0)this.number(side,Math.round(damage),efficacy>1?'super':efficacy<1?'resist':'damage',efficacy>1?'SUPEREFFICACE':efficacy<1?'RESISTITO':'');else this.number(side,'ASSORBITO','notice');
  this.remember();
  if(!this.reduced()&&!label&&efficacy!==0){this.effects.push({type:'impact',target:side,element,kind,start:performance.now(),duration:kind==='ultimate'?1050:650});this.loop();const img=document.getElementById(side==='player'?'img-giocatore':'img-nemico');img?.animate([{filter:'brightness(1)'},{filter:'brightness(1.65) drop-shadow(0 0 10px '+(this.colors[element]||'#fff')+')'},{filter:'brightness(1)'}],{duration:280,easing:'ease-out'});}
 },
 heal(side,amount){if(amount>0&&this.active())this.number(side,Math.round(amount),'heal');this.remember();},
 number(side,value,type='damage',caption=''){
  if(!this.numbers||!this.active())return;const point=this.anchor(side),el=document.createElement('div');el.className='battle-float battle-float-'+type+(this.reduced()?' battle-float-reduced':'');
  const shift=[...this.texts].filter(n=>n.dataset.side===side).length;el.dataset.side=side;el.style.left=Math.max(45,Math.min(this.width-45,point.x+Math.sin(shift*2)*25))+'px';el.style.top=Math.max(28,Math.min(this.height-40,point.y-20-shift%3*24))+'px';const strong=document.createElement('strong');strong.textContent=typeof value==='number'?(type==='heal'?'+':'−')+value:value;el.append(strong);if(caption){const small=document.createElement('span');small.textContent=caption;el.append(small);}this.numbers.append(el);this.texts.add(el);const remove=()=>{this.texts.delete(el);el.remove();};el.addEventListener('animationend',remove,{once:true});setTimeout(remove,1600);
 },
 loop(){if(this.frame)return;const tick=time=>{if(!this.active()){this.clear();return;}this.ctx.clearRect(0,0,this.width,this.height);this.effects=this.effects.filter(e=>time-e.start<e.duration);for(const e of this.effects)this.draw(e,(time-e.start)/e.duration);this.frame=this.effects.length?requestAnimationFrame(tick):0;};this.frame=requestAnimationFrame(tick);},
 shape(element,x,y,size,angle=0,opacity=1){const ctx=this.ctx,color=this.colors[element]||this.colors.normale;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=opacity;ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,size*.12);ctx.shadowColor=color;ctx.shadowBlur=size*.65;
  const polygon=points=>{ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a*size,b*size):ctx.moveTo(a*size,b*size));ctx.closePath();ctx.fill();};
  switch(element){
   case 'fuoco':polygon([[0,-1.2],[.35,-.2],[.7,-.45],[.65,.55],[0,.9],[-.65,.55],[-.4,-.4],[-.1,0]]);ctx.fillStyle='#fff0b8';polygon([[0,-.15],[.3,.5],[0,.7],[-.3,.5]]);break;
   case 'acqua':ctx.beginPath();ctx.moveTo(0,-size);ctx.bezierCurveTo(size,0,size*.7,size*.8,0,size);ctx.bezierCurveTo(-size*.7,size*.8,-size,0,0,-size);ctx.fill();ctx.fillStyle='#d3f7ff';ctx.beginPath();ctx.arc(-size*.2,size*.25,size*.16,0,Math.PI*2);ctx.fill();break;
   case 'elettro':polygon([[.2,-1],[-.65,.15],[-.05,.1],[-.25,1],[.7,-.2],[.1,-.1]]);break;
   case 'erba':ctx.beginPath();ctx.moveTo(-size*.7,size*.6);ctx.quadraticCurveTo(-size,-size,size*.7,-size*.65);ctx.quadraticCurveTo(size,size,-size*.7,size*.6);ctx.fill();ctx.strokeStyle='#d8f5b1';ctx.beginPath();ctx.moveTo(-size*.5,size*.4);ctx.lineTo(size*.5,-size*.45);ctx.stroke();break;
   case 'ghiaccio':polygon([[0,-1.2],[.55,0],[0,1.2],[-.55,0]]);ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(0,size);ctx.stroke();break;
   case 'terra':polygon([[-.8,-.3],[-.3,-.8],[.55,-.55],[.8,.2],[.2,.8],[-.6,.5]]);ctx.fillStyle='#f2d1a1';polygon([[-.6,-.25],[-.2,-.6],[.25,-.4],[0,0]]);break;
   case 'vento':for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,0,size*(.5+i*.3),-.4,Math.PI*1.3);ctx.stroke();}break;
   case 'buio':ctx.beginPath();ctx.arc(0,0,size*.75,0,Math.PI*2);ctx.fill();ctx.fillStyle='#18142e';ctx.beginPath();ctx.arc(size*.3,-size*.25,size*.7,0,Math.PI*2);ctx.fill();break;
   case 'psico':ctx.scale(1,.55);for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,0,size*(.5+i*.35),0,Math.PI*2);ctx.stroke();}break;
   case 'veleno':for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(Math.cos(i*2.1)*size*.35,Math.sin(i*2.1)*size*.35,size*.45,0,Math.PI*2);ctx.fill();}break;
   case 'folletto':case 'luce':polygon([[0,-1],[.22,-.22],[1,0],[.22,.22],[0,1],[-.22,.22],[-1,0],[-.22,-.22]]);break;
   case 'drago':for(let i=-1;i<2;i++){ctx.beginPath();ctx.moveTo(-size*.7+i*size*.3,-size);ctx.quadraticCurveTo(size*.6+i*size*.3,0,-size*.2+i*size*.3,size);ctx.stroke();}break;
   case 'lotta':polygon([[-.7,-.7],[.15,-.85],[.7,-.1],[.5,.65],[-.4,.8],[-.8,.2]]);ctx.strokeStyle='#ffe3be';ctx.beginPath();ctx.moveTo(-size*.5,-size*.15);ctx.lineTo(size*.35,size*.15);ctx.stroke();break;
   default:polygon([[0,-1],[.25,-.2],[1,0],[.25,.2],[0,1],[-.25,.2],[-1,0],[-.25,-.2]]);
  }
  ctx.restore();
 },
 draw(e,t){const ctx=this.ctx,target=this.anchor(e.target),color=this.colors[e.element]||'#fff',power=e.kind==='elementale'?2.6:e.kind==='ultimate'?3.3:1,base=Math.max(8,Math.min(19,this.width*.017))*power;
  if(e.type==='cast'&&e.support){const a=this.anchor(e.source),fade=Math.sin(t*Math.PI);ctx.save();ctx.globalAlpha=fade;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=e.reduced?0:20;ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(a.x,a.y+base*.9,base*(1.1+i*.4+t*.2),base*(.35+i*.12),0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<(e.reduced?4:14);i++){const angle=i/14*Math.PI*2+t*2,r=base*(1.2+.5*Math.sin(t*Math.PI));this.shape(e.element,a.x+Math.cos(angle)*r,a.y+Math.sin(angle)*r-base*t,base*.16,angle,fade);}ctx.restore();return;}
  if(e.type==='cast'&&(e.kind!=='base'||e.move)){this.drawAbility(e,t);return;}
  if(e.reduced){this.drawReduced(e,t);return;}
  if(e.type==='cast'){const source=this.anchor(e.source),p=Math.max(0,Math.min(1,(t-.28)/.7)),x=source.x+(target.x-source.x)*p,y=source.y+(target.y-source.y)*p-Math.sin(p*Math.PI)*base*1.4;
   if(t<.4){const progress=t/.4;for(let i=0;i<7;i++){const angle=i/7*Math.PI*2+t*3,r=base*(2-progress);this.shape(e.element,source.x+Math.cos(angle)*r,source.y+Math.sin(angle)*r,base*.3,angle,.6);}}
   if(t>.26){for(let i=0;i<7;i++){const q=Math.max(0,p-i*.025),tx=source.x+(target.x-source.x)*q,ty=source.y+(target.y-source.y)*q-Math.sin(q*Math.PI)*base*1.4;this.shape(e.element,tx,ty,base*(1-i*.1),Math.atan2(target.y-source.y,target.x-source.x)+t*2,(1-i/8)*.8);}this.shape(e.element,x,y,base,t*5,1);}
   if(e.element==='elettro'&&t>.5){ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(source.x,source.y);for(let i=1;i<8;i++){const q=i/8*p;ctx.lineTo(source.x+(target.x-source.x)*q,source.y+(target.y-source.y)*q+Math.sin(i*4+t*35)*12);}ctx.lineTo(x,y);ctx.stroke();ctx.restore();}
  }else{const fade=1-t,count=e.kind==='ultimate'?28:e.kind==='elementale'?21:14;ctx.save();ctx.globalAlpha=fade;ctx.strokeStyle=color;ctx.lineWidth=3*fade;ctx.shadowColor=color;ctx.shadowBlur=15;ctx.beginPath();ctx.ellipse(target.x,target.y,base*(1+t*5),base*(.5+t*2.5),0,0,Math.PI*2);ctx.stroke();ctx.restore();for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+.2,r=base*(.3+t*(2.5+i%4));this.shape(e.element,target.x+Math.cos(angle)*r,target.y+Math.sin(angle)*r+t*t*20,base*(.25+i%3*.12)*fade,angle+t*2,fade);}if(t<.3)this.shape('luce',target.x,target.y,base*2*(1-t/.3),0,1-t/.3);}
 },
 drawReduced(e,t){const ctx=this.ctx,p=this.anchor(e.target),color=this.colors[e.element]||'#fff';ctx.save();ctx.globalAlpha=Math.sin(t*Math.PI)*.5;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(p.x,p.y,38,52,0,0,Math.PI*2);ctx.stroke();ctx.restore();},
 drawAbility(e,t){
  if(e.reduced){this.drawReduced(e,t);return;}
  const ctx=this.ctx,a=this.anchor(e.source),b=this.anchor(e.target),color=this.colors[e.element]||'#bc9aff';
  const size=Math.max(18,Math.min(45,this.width*.027))*(e.kind==='ultimate'?1.25:1),name=String(e.move||'').toLowerCase(),angle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y);
  const q=Math.max(0,Math.min(1,(t-.25)/.65)),fade=Math.min(1,t*8,(1-t)*7),pulse=Math.sin(Math.min(1,t/.3)*Math.PI/2);
  ctx.save();ctx.globalAlpha=fade;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=size*.55;
  const ring=(p,r,tilt=.5)=>{ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*tilt,0,0,Math.PI*2);ctx.stroke();};
  const line=(points,width,stroke=color)=>{ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  // Telegraph: energy gathers around the caster, with a rune circle on the platform.
  if(t<.4){ctx.lineWidth=3;ring(a,size*(.5+pulse*1.7));for(let i=0;i<9;i++){const r=size*(2.4-pulse),v=i*Math.PI*2/9+t*4;this.shape(e.element,a.x+Math.cos(v)*r,a.y+Math.sin(v)*r,size*.18,v,fade);}}
  if(/meditazione|ciclo|marchio/.test(name)){
   const p=/marchio/.test(name)?b:a;ctx.lineWidth=4;
   for(let i=0;i<3;i++)ring({x:p.x,y:p.y+size*(i-1)*.6},size*(.7+i*.4+pulse*.3),.45);
   for(let i=0;i<6;i++){const v=i*Math.PI/3+t*2;this.shape(/ciclo/.test(name)?'luce':'buio',p.x+Math.cos(v)*size*1.5,p.y+Math.sin(v)*size*1.5,size*.25,v,fade);}
  }else if(/raggio/.test(name)){
   if(t>.23){ctx.translate(a.x,a.y);ctx.rotate(angle);const reach=length*Math.min(1,q*2.5),w=size*(.3+Math.sin(t*Math.PI)*.7);
    const g=ctx.createLinearGradient(0,-w,0,w);g.addColorStop(0,'transparent');g.addColorStop(.25,color);g.addColorStop(.5,'#fff8f4');g.addColorStop(.75,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,-w,reach,w*2);
    line([[0,0],[reach,0]],w*.24,'#fff');for(let i=0;i<5;i++)line([[0,(i-2)*w*.35],[reach,(i-2)*w*.12]],2,color);
   }
  }else if(/spada|falce|counter/.test(name)){
   if(t>.25){const p={x:a.x+(b.x-a.x)*Math.min(1,q*2),y:a.y+(b.y-a.y)*Math.min(1,q*2)};
    ctx.translate(p.x,p.y);ctx.rotate(-1.1+q*2.3);ctx.strokeStyle=color;ctx.lineWidth=size*.4;ctx.beginPath();ctx.arc(0,0,size*1.9,-2.5,.9);ctx.stroke();
    if(/falce/.test(name)){line([[-size*.7,size*2],[-size*.7,-size*1.4]],size*.15,'#ddcba5');ctx.fillStyle='#f3deff';ctx.beginPath();ctx.moveTo(-size*.8,-size*1.4);ctx.quadraticCurveTo(size*2.8,-size*2.6,size*1.9,size*.8);ctx.quadraticCurveTo(size*1.3,-size*1.5,-size*.8,-size*1.1);ctx.fill();}
    else{ctx.fillStyle='#edfaff';ctx.beginPath();ctx.moveTo(0,-size*2.4);ctx.lineTo(size*.24,size*.8);ctx.lineTo(-size*.24,size*.8);ctx.closePath();ctx.fill();line([[-size*.65,size*.65],[size*.65,size*.65]],size*.16,'#ffce75');line([[0,size*.7],[0,size*1.4]],size*.23,'#8e679b');}
    if(/counter/.test(name)){ctx.rotate(Math.PI/2);line([[0,-size*2.5],[0,size*2.5]],size*.23,'#fff');}
   }
  }else if(/pugni/.test(name)){
   if(t>.3)for(let i=0;i<4;i++){const u=Math.max(0,Math.min(1,q*1.6-i*.12)),p={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u+Math.sin(i*2)*size*.6};this.shape('lotta',p.x,p.y,size*.7,angle,Math.sin(u*Math.PI)*.8+.2);line([[p.x-size*Math.cos(angle),p.y-size*Math.sin(angle)],[p.x,p.y]],5,'#ffd1a3');}
  }else if(/sfera|divorare/.test(name)){
   if(t>.22){const p={x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q},r=size*(/divorare/.test(name)?1.7:1.2);ctx.fillStyle='#1a0d38';ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.lineWidth=5;ring(p,r,1);this.shape('buio',p.x,p.y,r*.85,t*4);for(let i=0;i<8;i++){const v=i*Math.PI/4+t*5;this.shape('luce',p.x+Math.cos(v)*r*1.3,p.y+Math.sin(v)*r*1.3,size*.15,v,fade);}}
  }else{
   // Elemental abilities fill a broad attack corridor; the basic shot stays compact.
   if(t>.25){
    const head={x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q};
    for(let lane=-2;lane<=2;lane++)for(let i=0;i<7;i++){
     const u=Math.max(0,q-i*.038),spread=Math.sin(u*Math.PI)*size*(lane*.55),x=a.x+(b.x-a.x)*u-Math.sin(angle)*spread,y=a.y+(b.y-a.y)*u+Math.cos(angle)*spread;
     this.shape(e.element,x,y,size*(.5-i*.045),angle+t*2+lane,(1-i/8)*fade*.85);
    }
    if(e.element==='elettro'){for(let lane=-1;lane<=1;lane++){const pts=Array.from({length:11},(_,i)=>{const u=i/10*q;return[a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u+Math.sin(i*3.8+t*24+lane)*size*.5];});line(pts,6,color);line(pts,2,'#fff');}}
    if(['acqua','vento','psico'].includes(e.element)){ctx.lineWidth=4;for(let i=0;i<3;i++)ring({x:head.x-i*size*.6*Math.cos(angle),y:head.y-i*size*.6*Math.sin(angle)},size*(1.2-i*.15),.8);}
    if(q>.55){const strength=(q-.55)/.45;ctx.lineWidth=4;ring(b,size*(.5+strength*2));for(let i=0;i<7;i++){const v=i*Math.PI*2/7;this.shape(e.element,b.x+Math.cos(v)*size*strength*2,b.y+Math.sin(v)*size*strength*1.7,size*.55,v+t,fade);}}
   }
  }
  ctx.restore();
 },
 clear(){cancelAnimationFrame(this.frame);this.frame=0;this.effects=[];if(this.ctx)this.ctx.clearRect(0,0,this.width,this.height);for(const el of this.texts)el.remove();this.texts.clear();}
};
document.addEventListener('DOMContentLoaded',()=>BattleFX.init());

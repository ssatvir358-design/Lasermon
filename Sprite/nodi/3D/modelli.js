/* Editable, genuine XYZ models. No sprite planes. GLB exports can be rebuilt locally. */
(function(global){
 const colors={acqua:'#5dc5e4',buio:'#8873b5',drago:'#807adb',elettro:'#edcf62',erba:'#83b75e',folletto:'#e49bc1',fuoco:'#d66d50',ghiaccio:'#a5dee1',lotta:'#ba775a',luce:'#eedc9a',normale:'#a7b3bf',psico:'#cb80a9',terra:'#ba9a6b',veleno:'#a775c7',vento:'#8acbb9'};
 const bosses={1:['#c1a899','#3a2d27','#e0d7b6'],2:['#9c743e','#d6bf86','#385b57'],3:['#bf655c','#3c2932','#d6b378'],4:['#5fa5be','#f1d39f','#e1e4d7'],5:['#8171a9','#26283c','#d2a468'],6:['#c85a54','#583a31','#e6c768'],7:['#8e7fbd','#bebbd3','#e1c386'],8:['#bd9955','#3c364a','#cfab67'],9:['#bb494e','#292331','#f0c279'],10:['#c3ad6e','#e2e1d4','#f6d989'],11:['#3d7298','#222936','#c6d7dd'],12:['#8475ae','#473b3d','#dac9a7'],13:['#b64c60','#282437','#dfb562']};
 function pawn(mesh,element='normale',boss=false,index=1){const palette=boss?(bosses[index]||bosses[13]):[colors[element]||colors.normale,'#293243','#b6c4cf'],[coat,hair,trim]=palette,skin=boss?'#c79b7d':'#dab394';
  mesh.box(-.13,.05,0,.17,.52,.22,'#293649').box(.13,.05,0,.17,.52,.22,'#293649');mesh.box(-.13,0,.07,.21,.12,.35,'#182336').box(.13,0,.07,.21,.12,.35,'#182336');mesh.box(0,.48,0,.5,.6,.3,coat);mesh.box(0,.5,.17,.48,.09,.035,trim);
  mesh.box(-.34,.52,0,.17,.5,.22,coat).box(.34,.52,0,.17,.5,.22,coat).sphere(-.34,.51,.03,.105,skin,3,7).sphere(.34,.51,.03,.105,skin,3,7);
  mesh.sphere(0,1.28,0,.27,skin,5,10);mesh.sphere(0,1.42,-.035,.25,hair,4,9);mesh.box(0,1.45,-.16,.43,.12,.2,hair);mesh.box(-.105,1.3,.244,.064,.045,.018,'#16273a').box(.105,1.3,.244,.064,.045,.018,'#16273a');mesh.box(0,1.17,.26,.09,.025,.012,'#876a62');
  mesh.box(0,.86,.17,.12,.12,.035,trim);
  if(['fuoco','elettro','drago'].includes(element))mesh.cone(.34,1.01,.01,.13,.4,colors[element],5);
  if(['acqua','ghiaccio','psico','folletto','veleno','luce','buio'].includes(element))mesh.sphere(-.44,.82,.15,.14,colors[element],4,8);
  if(['terra','lotta','normale'].includes(element))mesh.box(.48,.48,.02,.13,.7,.13,trim);
  if(element==='erba'||element==='vento')mesh.cone(0,1.57,0,.25,.2,colors[element],5);
  if(boss){mesh.face([[-.27,1.02,-.17],[.27,1.02,-.17],[.45,.1,-.3],[-.45,.1,-.3]],coat);mesh.box(-.32,1.03,0,.28,.15,.38,trim).box(.32,1.03,0,.28,.15,.38,trim);mesh.ring(0,1.75,0,.32,.045,trim);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;mesh.cone(Math.cos(a)*.27,1.75,Math.sin(a)*.27,.07,.18,trim,4);}mesh.box(.53,.25,0,.08,1.15,.08,trim).box(.53,.85,0,.32,.06,.08,trim);}
  return mesh;
 }
 function build(type,element='normale',bossIndex=1){const m=new Laser3D.Mesh(),gold='#e7c47f',stone='#c5d3d4',dark='#293c52',accent=colors[element]||colors.normale;
  switch(type){
   case 'npc':pawn(m,element);break;
   case 'miniboss':pawn(m,element,true,5);m.ring(0,.03,0,.58,.05,accent);break;
   case 'boss':pawn(m,element,true,bossIndex);break;
   case 'bombers':for(let i=0;i<4;i++){const p=new Laser3D.Mesh();pawn(p,['buio','fuoco','psico','acqua'][i],true,[9,10,12,11][i]);m.add(p,[(i%2-.5)*.85,0,(Math.floor(i/2)-.5)*.65],.62);}break;
   case 'cespuglio':for(let i=0;i<9;i++){const a=i*2.4,r=i%3*.18;m.cone(Math.cos(a)*r,0,Math.sin(a)*r,.18,.45+(i%3)*.1,i%2?'#6b9d65':'#3f7762',5);}break;
   case 'centro-medico':m.box(0,0,0,1,.55,.75,'#a9c5bd').box(0,.55,0,1.15,.14,.9,'#b35d68');m.box(0,.65,0,.8,.32,.7,'#e3dfcd');m.box(0,.2,.39,.24,.34,.03,dark);m.box(-.32,.27,.39,.18,.17,.025,'#92dce1').box(.32,.27,.39,.18,.17,.025,'#92dce1');m.box(0,1,0,.13,.42,.06,'#edc2b9').box(0,1.15,0,.38,.12,.06,'#edc2b9');break;
   case 'pokeball':{const n=12,point=(a,b)=>[Math.cos(a)*Math.cos(b)*.4,.48+Math.sin(a)*.4,Math.cos(a)*Math.sin(b)*.4];for(let i=0;i<6;i++)for(let j=0;j<n;j++){const a=-Math.PI/2+i*Math.PI/6,b=j/n*Math.PI*2;m.face([point(a,b),point(a+Math.PI/6,b),point(a+Math.PI/6,b+Math.PI*2/n),point(a,b+Math.PI*2/n)],i>=3?'#ca555c':'#d5e0d6');}m.ring(0,.48,0,.405,.035,dark);m.cylinder(0,0,0,.47,.08,gold);m.sphere(0,.48,.4,.095,'#e6f2e4',3,8);break;}
   case 'item':m.box(0,0,0,.75,.4,.5,'#836550').box(0,.4,0,.8,.15,.55,'#ba8c56');m.box(-.27,0,.26,.065,.54,.02,gold).box(.27,0,.26,.065,.54,.02,gold).box(0,.23,.29,.15,.17,.035,gold);break;
   case 'disco':m.cylinder(0,0,0,.42,.12,dark);m.cylinder(0,.12,0,.34,.055,'#9daccd',14);m.ring(0,.18,0,.24,.025,'#84e3e0');m.cylinder(0,.18,0,.07,.025,dark);m.box(0,.12,-.25,.4,.5,.18,stone).box(0,.3,-.15,.25,.2,.025,'#62bfc7');break;
   case 'scambio':m.cylinder(0,0,0,.55,.14,dark);m.cone(-.23,.15,0,.16,.65,'#6dbeda',5).cone(.23,.15,0,.16,.65,'#ba91dc',5);m.ring(0,.55,0,.55,.035,gold);break;
   case 'mistero':m.cylinder(0,0,0,.48,.12,dark);m.ring(0,.68,0,.48,.09,'#9279c6',true,14).ring(0,.68,0,.35,.035,'#c4a6f2',true,14);m.sphere(0,.68,0,.13,'#d3bcf3',4,8);break;
   case 'start':m.cylinder(0,0,0,.55,.13,dark);m.box(0,.1,0,.09,1.1,.09,gold);m.face([[.05,1.15,0],[.55,1.05,0],[.05,.83,0]],'#8ecbd0');break;
   default:m.cone(0,0,0,.3,.8,accent,5);
  }
  return m;
 }
 global.LaserNodeModels={colors,bosses,build};
})(window);

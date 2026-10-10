/* Backgrounds and independent, equally sized arena platforms for every region. */
(function(){
 const root=new URL('../../',document.currentScript.src);
 const palettes=[
  ['#82b94d','#4f7336','#7a6041','#b7e77c'],['#487e69','#274e51','#34434a','#85e6c6'],
  ['#e3f0ea','#91b2b7','#596c82','#c8f5ff'],['#edd99b','#c7aa69','#866f50','#fff0bf'],
  ['#d6dfbd','#9bb3a3','#63818d','#f3b8dc'],['#839795','#566d76','#37424f','#eacb86'],
  ['#e8c183','#bd8c59','#8e604b','#ffe2a5'],['#cfa36c','#aa794e','#795340','#f1d193'],
  ['#594555','#332d40','#242239','#ff8b42'],['#eee9d7','#b9bbc0','#858ba0','#ffe09a']
 ];
 window.BattleEnvironments={
  root,palettes,
  id(id){return /^mappa(?:[1-9]|10)$/.test(id)?id:'mappa1';},
  background(id){return new URL('Sprite/UI/Biomes/'+this.id(id)+'-v1.png',root).href;},
  platform(id){
   const index=Number(this.id(id).replace('mappa',''))-1,[top,edge,rock,trim]=palettes[index];
   const stone=[2,5,7,8,9].includes(index),lava=index===8;
   let details='';
   for(let i=0;i<36;i++){
    const x=45+(i*67%310),y=29+(i*19%53);
    if(((x-200)/168)**2+((y-55)/36)**2>.86)continue;
    details+=`<path d="M${x} ${y}h${stone?16:5}m-3 2h${stone?9:3}" stroke="${i%3===0?trim:edge}" stroke-width="${stone?1.5:2}" opacity=".55"/>`;
   }
   if(stone)details+=`<path d="M65 52h270M90 69h220M105 34h190M155 22l-24 65M232 22l32 65" stroke="${edge}" opacity=".45" fill="none"/>`;
   if(lava)details+=`<path d="M70 66l52-12 34 12 44-20 39 12 52-18 38 12M154 66l-12 17m99-25 18 24" stroke="${trim}" stroke-width="3" fill="none"/>`;
   return `<svg viewBox="0 0 400 160" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><ellipse cx="200" cy="115" rx="178" ry="27" fill="#041021" opacity=".26"/><path d="M20 55Q200-18 380 55L368 94Q200 160 32 94Z" fill="${rock}" stroke="${edge}" stroke-width="3"/><path d="M32 83l35 15 0-25m41 39 0-28m50 40 0-33m56 36 0-34m56 26 0-31m52 15 0-28m36 8 0-22" fill="none" stroke="${edge}" stroke-width="3" opacity=".65"/><ellipse cx="200" cy="55" rx="180" ry="40" fill="${top}" stroke="${edge}" stroke-width="5"/><ellipse cx="200" cy="55" rx="169" ry="33" fill="none" stroke="${trim}" stroke-width="2" opacity=".65"/>${details}</svg>`;
  }
 };
})();

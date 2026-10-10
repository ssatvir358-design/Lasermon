/* Original artwork, normalized once for display. No source images or game state are modified. */
(function(global){
 'use strict';
 const root=new URL('../../',document.currentScript.src),cache=new Map();
 function key(node,map='mappa1'){
  if(node.tipo==='npc')return 'npc-'+(node.elementoNpc||'normale').toLowerCase();
  if(node.tipo==='boss'){
   if(map==='mappa9')return 'bombers';if(map==='mappa10')return 'boss-final';
   return 'boss-'+(typeof ARCHIVIO_MAPPE!=='undefined'?ARCHIVIO_MAPPE[map]?.idBoss:map.replace('mappa',''));
  }
  return node.tipo;
 }
 function load(id,ready){
  const asset=MapSpriteAssets[id]||MapSpriteAssets['npc-normale'];
  if(!asset)return null;
  let entry=cache.get(asset.src);
  if(!entry){
   entry={tile:null,listeners:new Set(),failed:false};cache.set(asset.src,entry);
   const img=new Image();img.onload=()=>{
    const [x,y,w,h]=asset.crop,s=Math.min(1,256/Math.max(w,h)),tile=document.createElement('canvas');
    tile.width=Math.max(1,Math.round(w*s));tile.height=Math.max(1,Math.round(h*s));
    const ctx=tile.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x,y,w,h,0,0,tile.width,tile.height);
    entry.tile=tile;for(const fn of entry.listeners)fn();entry.listeners.clear();
   };
   img.onerror=()=>{entry.failed=true;entry.listeners.clear();};img.src=new URL(asset.src,root).href;
  }
  if(!entry.tile&&!entry.failed&&ready)entry.listeners.add(ready);return entry.tile;
 }
 function draw(ctx,id,x,feet,maxWidth,maxHeight,ready){
  const tile=load(id,ready);if(!tile)return;
  const s=Math.min(maxWidth/tile.width,maxHeight/tile.height),w=tile.width*s,h=tile.height*s;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(tile,x-w/2,feet-h,w,h);ctx.restore();
 }
 function element(id,label=''){
  const canvas=document.createElement('canvas');canvas.className='original-sprite';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',label);canvas.width=1;canvas.height=1;
  const paint=()=>{const tile=load(id,paint);if(!tile)return;canvas.width=tile.width;canvas.height=tile.height;canvas.getContext('2d').drawImage(tile,0,0);};paint();return canvas;
 }
 global.MapSprites={key,load,draw,element};
})(window);

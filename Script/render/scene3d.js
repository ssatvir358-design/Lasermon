/* Shared XYZ geometry and perspective painter. Local, dependency-free and file:// compatible. */
(function(global){
 'use strict';
 const TAU=Math.PI*2,grayColors=new Map();
 const gray=hex=>{if(!grayColors.has(hex)){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),v=Math.round(rgb[0]*.21+rgb[1]*.72+rgb[2]*.07);grayColors.set(hex,'#'+v.toString(16).padStart(2,'0').repeat(3));}return grayColors.get(hex);};
 const color=(hex,f=1)=>{const h=hex.replace('#','');return '#'+[0,2,4].map(i=>Math.min(255,Math.max(0,Math.round(parseInt(h.slice(i,i+2),16)*f))).toString(16).padStart(2,'0')).join('');};
 class Mesh{
  constructor(){this.faces=[];}
  face(points,base,lit=true){
   let light=1;
   if(lit&&points.length>=3){const a=points[0],b=points[1],c=points[2],u=b.map((v,i)=>v-a[i]),v=c.map((p,i)=>p-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;light=.63+.37*Math.abs((n[0]*-.45+n[1]*.84+n[2]*.3)/length);}
   this.faces.push({points,color:color(base,light)});return this;
  }
  box(x,y,z,w,h,d,c){const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],e=[x-w/2,y,z+d/2],f=[x+w/2,y,z+d/2],aa=[a[0],y+h,a[2]],bb=[b[0],y+h,b[2]],ee=[e[0],y+h,e[2]],ff=[f[0],y+h,f[2]];
   this.face([aa,ee,ff,bb],c).face([a,b,bb,aa],c).face([b,f,ff,bb],c).face([f,e,ee,ff],c).face([e,a,aa,ee],c);return this;}
  cylinder(x,y,z,r,h,c,n=10,topR=r){const ring=(height,radius)=>Array.from({length:n},(_,i)=>[x+Math.cos(i/n*TAU)*radius,height,z+Math.sin(i/n*TAU)*radius]);const a=ring(y,r),b=ring(y+h,topR);this.face([...b].reverse(),c);for(let i=0;i<n;i++)this.face([a[i],a[(i+1)%n],b[(i+1)%n],b[i]],c);return this;}
  cone(x,y,z,r,h,c,n=8){return this.cylinder(x,y,z,r,h,c,n,0);}
  sphere(x,y,z,r,c,bands=6,slices=10){const point=(a,b)=>[x+Math.cos(a)*Math.cos(b)*r,y+Math.sin(a)*r,z+Math.cos(a)*Math.sin(b)*r];for(let i=0;i<bands;i++)for(let j=0;j<slices;j++){const a=-Math.PI/2+i/bands*Math.PI,b=j/slices*TAU;this.face([point(a,b),point(a+Math.PI/bands,b),point(a+Math.PI/bands,b+TAU/slices),point(a,b+TAU/slices)],c);}return this;}
  ring(x,y,z,r,t,c,vertical=false,n=16){for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU,point=(angle,radius,depth)=>vertical?[x+Math.cos(angle)*radius,y+Math.sin(angle)*radius,z+depth]:[x+Math.cos(angle)*radius,y+depth,z+Math.sin(angle)*radius];this.face([point(a,r+t,-t/2),point(b,r+t,-t/2),point(b,r-t,-t/2),point(a,r-t,-t/2)],c,false);this.face([point(a,r+t,-t/2),point(a,r+t,t/2),point(b,r+t,t/2),point(b,r+t,-t/2)],c);}return this;}
  add(other,offset=[0,0,0],scale=1){for(const f of other.faces)this.faces.push({points:f.points.map(p=>p.map((v,i)=>v*scale+offset[i])),color:f.color});return this;}
  bridge(a,b,width=.32,c='#a28a63',rail=true){const dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1,nx=-dz/len*width,nz=dx/len*width,point=(t,side,up=0)=>[a[0]+dx*t+nx*side,a[1]+(b[1]-a[1])*t+up,a[2]+dz*t+nz*side];this.face([point(0,1),point(1,1),point(1,-1),point(0,-1)],c);for(let i=0;i<Math.ceil(len*2);i++){const t=i/Math.ceil(len*2);this.face([point(t,1),point(Math.min(1,t+.025),1),point(Math.min(1,t+.025),-1),point(t,-1)],color(c,.65));}if(rail)for(const side of [-1,1]){this.face([point(0,side,.3),point(1,side,.3),point(1,side,.27),point(0,side,.27)],'#c2aa80');for(let i=0;i<=4;i++){const p=point(i/4,side);this.box(...p,.035,.32,.035,'#a69983');}}return this;}
 }
 class Scene{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.camera={yaw:-.2,pitch:.62,zoom:1,target:[0,0,0]};this.entries=[];this.hits=[];this.width=0;this.height=0;this.area=null;}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(global.devicePixelRatio||1,innerWidth<650?1.5:2);this.width=r.width;this.height=r.height;if(this.canvas.width!==Math.round(r.width*dpr)||this.canvas.height!==Math.round(r.height*dpr)){this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);}this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  project(p){const {yaw,pitch,target}=this.camera,a=this.area||{x:0,y:0,width:this.width,height:this.height},x=p[0]-target[0],y=p[1]-target[1],z=p[2]-target[2],rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=-x*Math.sin(yaw)+z*Math.cos(yaw),sy=y*Math.cos(pitch)-rz*Math.sin(pitch),depth=rz*Math.cos(pitch)+y*Math.sin(pitch),f=32/Math.max(5,32-depth),unit=this.unit||Math.min(a.width/20,a.height/14)*this.camera.zoom;return {x:a.x+a.width*.5+rx*unit*f,y:a.y+a.height*.53-sy*unit*f,depth,f};}
  render(background,after){this.resize();if(!this.width||!this.height)return;const ctx=this.ctx;
   if(this.cacheKey&&this.cached?.key===this.cacheKey){ctx.drawImage(this.cached.canvas,0,0,this.width,this.height);if(after)after(ctx);return;}
   ctx.clearRect(0,0,this.width,this.height);background(ctx,this.width,this.height);const faces=[];
   for(const e of this.entries){const rotation=e.rotation||0,co=Math.cos(rotation),si=Math.sin(rotation),s=e.scale||1,position=e.position||[0,0,0];for(const face of e.mesh.faces){const pts=face.points.map(p=>this.project([position[0]+(p[0]*co+p[2]*si)*s,position[1]+p[1]*s,position[2]+(-p[0]*si+p[2]*co)*s]));if(pts.every(p=>p.x<-40)||pts.every(p=>p.x>this.width+40)||pts.every(p=>p.y<-80)||pts.every(p=>p.y>this.height+80))continue;faces.push({pts,color:e.gray?gray(face.color):face.color,opacity:e.opacity??1,depth:pts.reduce((n,p)=>n+p.depth,0)/pts.length});}}
   faces.sort((a,b)=>a.depth-b.depth);ctx.lineWidth=.45;for(const f of faces){ctx.globalAlpha=f.opacity;ctx.fillStyle=f.color;ctx.strokeStyle=f.color;ctx.beginPath();f.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();}ctx.globalAlpha=1;
   if(this.cacheKey){const tile=this.cached?.canvas||document.createElement('canvas');if(tile.width!==this.canvas.width||tile.height!==this.canvas.height){tile.width=this.canvas.width;tile.height=this.canvas.height;}tile.getContext('2d').drawImage(this.canvas,0,0);this.cached={key:this.cacheKey,canvas:tile};}
   if(after)after(ctx);}
 }
 global.Laser3D={Mesh,Scene,color,TAU};
})(window);

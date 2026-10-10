/* Decorative pixel portal. No game state, audio or account data is changed here. */
(() => {
    'use strict';
    function initCamp() {
        const lobby=document.getElementById('schermata-start');
        const stage=document.getElementById('camp-stage');
        const canvas=document.getElementById('camp-portal');
        if(!lobby || !stage || !canvas)return;
        const ctx=canvas.getContext('2d',{alpha:false});
        if(!ctx)return;
        ctx.imageSmoothingEnabled=false;
        const media=matchMedia('(prefers-reduced-motion: reduce)');
        let frame=0,last=0,elapsed=0;
        const reduced=()=>typeof StudioUI!=='undefined'?StudioUI.reducedMotion():media.matches;
        const active=()=>lobby.classList.contains('attiva')&&!document.hidden;
        function draw(time) {
            const w=canvas.width,h=canvas.height,cx=w/2,cy=h*.55;
            ctx.fillStyle='#03102f';ctx.fillRect(0,0,w,h);
            // Stars behind the rotating spiral are deterministic, avoiding flicker.
            for(let i=0;i<28;i++) {
                const x=(i*37+13)%w,y=(i*59+7)%h;
                ctx.fillStyle=i%3?'#2055a0':'#61beff';ctx.fillRect(x,y,1,1);
            }
            const colors=['#063377','#0759c6','#1687ea','#27baff','#8feaff'];
            for(let arm=0;arm<3;arm++) {
                for(let n=0;n<150;n++) {
                    const r=n/150,angle=r*10.8-time*.48+arm*Math.PI*2/3;
                    const x=cx+Math.cos(angle)*r*43,y=cy+Math.sin(angle)*r*65;
                    const size=r>.7?2:1;
                    ctx.fillStyle=colors[(n+arm*2)%5];
                    ctx.fillRect(Math.round(x),Math.round(y),size,size);
                    if(n%3===0) {
                        ctx.fillStyle='#0b4089';
                        ctx.fillRect(Math.round(x+Math.cos(angle)*3),Math.round(y+Math.sin(angle)*4),2,2);
                    }
                }
            }
            ctx.fillStyle='#c3f5ff';ctx.fillRect(cx-1,cy-1,3,3);
            for(let i=0;i<9;i++) {
                const a=time*.3+i*2.4,r=.5+(i%5)*.09;
                ctx.fillStyle=i%3?'#81dcff':'#e7fbff';
                ctx.fillRect(Math.round(cx+Math.cos(a)*r*44),Math.round(cy+Math.sin(a)*r*65),1,2);
            }
        }
        function tick(now) {
            if(!active()||reduced()){frame=0;sync();return;}
            if(!last)last=now;
            const delta=now-last;
            if(delta>=1000/30){elapsed+=Math.min(delta,100)/1000;draw(elapsed);last=now;}
            frame=requestAnimationFrame(tick);
        }
        function sync() {
            const playing=active()&&!reduced();
            document.body.dataset.campPaused=String(!playing);
            if(playing&&!frame){last=0;frame=requestAnimationFrame(tick);}
            else if(!playing&&frame){cancelAnimationFrame(frame);frame=0;}
            if(!playing)draw(elapsed);
        }
        // Delegation also covers future modes registered after DOMContentLoaded.
        const hover=event=>{
            const target=event.target.closest('[data-landmark]');
            stage.dataset.hover=target&&!target.disabled&&stage.contains(target)?target.dataset.landmark:'';
        };
        stage.addEventListener('pointerover',hover);
        stage.addEventListener('focusin',hover);
        stage.addEventListener('pointermove',event=>{
            if(event.pointerType!=='mouse')return;
            const rect=stage.querySelector('.camp-world').getBoundingClientRect();
            const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
            const warm=String(x>.43&&x<.55&&y>.62&&y<.86);
            if(stage.dataset.fireWarm!==warm)stage.dataset.fireWarm=warm;
        },{passive:true});
        stage.addEventListener('pointerleave',()=>{
            stage.dataset.fireWarm='false';
            const focused=stage.querySelector('[data-landmark]:focus-visible');
            stage.dataset.hover=focused?.dataset.landmark||'';
        });
        stage.addEventListener('focusout',event=>{
            if(!stage.contains(event.relatedTarget))stage.dataset.hover='';
        });
        new MutationObserver(sync).observe(lobby,{attributes:true,attributeFilter:['class']});
        new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-ui-motion']});
        document.addEventListener('visibilitychange',sync);
        media.addEventListener('change',sync);
        window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
        window.addEventListener('pageshow',sync);
        draw(0);sync();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initCamp);else initCamp();
})();

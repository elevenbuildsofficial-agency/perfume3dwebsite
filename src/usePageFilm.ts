import { writeMotionStyle, writeMotionData, writeMotionInert, writeMotionAttribute } from './motionWrites';
import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { clamp, lerp } from './cinematic';
import { copyTravel } from './spatialMotion';

export function usePageFilm(count:number,paused:boolean) {
  const root=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),panels=useRef<(HTMLElement|null)[]>([]);
  const lenis=useRef<Lenis|null>(null),pause=useRef(paused),reduce=useRef(false);
  const navigation=useRef(0);
  const [active,setActive]=useState(0);
  useEffect(()=>{pause.current=paused;if(paused)lenis.current?.stop();else lenis.current?.start();},[paused]);
  useEffect(()=>{
    const node=root.current,stage=viewport.current;if(!node||!stage)return;
    const media=matchMedia('(prefers-reduced-motion:reduce)');
    let lastKey='',frame=0,focusFrame=0,previous=0,cursor=0,selected=-1,width=stage.clientWidth,height=stage.clientHeight,length=1,top=0,tx=0,ty=0,px=0,py=0;
    const measure=()=>{width=stage.clientWidth;height=stage.clientHeight;top=node.offsetTop;length=Math.max(1,node.offsetHeight-height);};
    const init=()=>{reduce.current=media.matches||new URLSearchParams(location.search).get('motion')==='reduce';writeMotionData(node,'reduced',String(reduce.current));lenis.current?.destroy();lenis.current=reduce.current?null:new Lenis({duration:1.05,smoothWheel:true,touchMultiplier:1});if(pause.current)lenis.current?.stop();measure();};
    const pointer=(event:PointerEvent)=>{if(event.pointerType==='touch')return;tx=event.clientX/width-.5;ty=event.clientY/height-.5;};
    const focus=(event:FocusEvent)=>{
      const target=event.target;if(!(target instanceof Element))return;
      const index=panels.current.findIndex(panel=>panel&&!panel.inert&&panel.contains(target));if(index<0)return;
      // Native focus can scroll a fixed-height scene back toward its DOM position.
      // Restore the settled camera without overriding a choice's next-scene action.
      const revision=navigation.current,anchor=top+length*index/(count-1);
      const restore=()=>{if(revision!==navigation.current)return;cursor=index;if(lenis.current)lenis.current.scrollTo(anchor,{immediate:true});else window.scrollTo({top:anchor,behavior:'instant'});};
      restore();cancelAnimationFrame(focusFrame);focusFrame=requestAnimationFrame(restore);
    };
    init();
    const draw=(time:number)=>{
      const dt=Math.min(.05,(time-previous)/1000||.016);previous=time;
      if(document.hidden||pause.current){frame=requestAnimationFrame(draw);return;}
      lenis.current?.raf(time);
      const target=clamp((scrollY-top)/length)*(count-1);
      cursor=reduce.current?target:lerp(cursor,target,1-Math.exp(-14*dt));
      px=lerp(px,tx,1-Math.exp(-5*dt));py=lerp(py,ty,1-Math.exp(-5*dt));
      const key=JSON.stringify([cursor,px,py,reduce.current,width,height]);
      if(key===lastKey){frame=requestAnimationFrame(draw);return;}lastKey=key;
      const nearest=Math.round(cursor);
      if(selected!==nearest){selected=nearest;setActive(nearest);}
      writeMotionData(stage,'scene',cursor.toFixed(4));writeMotionStyle(stage.style,'--film-progress',String(cursor/(count-1)));
      panels.current.forEach((panel,index)=>{
        if(!panel)return;
        const distance=index-cursor,visible=reduce.current?nearest===index:Math.abs(distance)<1.4;
        writeMotionStyle(panel.style,'visibility',visible?'visible':'hidden');writeMotionStyle(panel.style,'opacity','1');
        writeMotionStyle(panel.style,'transform','none');writeMotionData(panel,'motion','continuous');
        if(!visible){writeMotionInert(panel,true);writeMotionAttribute(panel,'aria-hidden','true');return;}
        const text=copyTravel(cursor,index,count-1,width,height,reduce.current),copy=Number(text.settled);
        // Forms and choices become interactive once the camera has settled.
        // Focusing a half-revealed input must not interrupt its scroll arrival.
        writeMotionInert(panel,nearest!==index||copy<.98);writeMotionAttribute(panel,'aria-hidden',String(panel.inert));
        writeMotionStyle(panel.style,'--copy-x',`${text.x}px`);writeMotionStyle(panel.style,'--copy-y',`${text.y}px`);
        writeMotionStyle(panel.style,'--camera-scale',String(reduce.current?1:1+Math.sin(cursor*.7)*.035));
        writeMotionStyle(panel.style,'--camera-x',`${reduce.current?0:Math.sin(distance)*width*.035+px*8}px`);
        writeMotionStyle(panel.style,'--camera-y',`${reduce.current?0:distance*height*.68+py*5}px`);
        writeMotionStyle(panel.style,'--object-turn',`${reduce.current?0:distance*5+px*3}deg`);
        writeMotionStyle(panel.style,'--object-scale',String(reduce.current?1:1+Math.sin(cursor*.7)*.045));
      });
      frame=requestAnimationFrame(draw);
    };
    addEventListener('resize',measure);addEventListener('pointermove',pointer,{passive:true});node.addEventListener('focusin',focus);media.addEventListener('change',init);frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(focusFrame);lenis.current?.destroy();removeEventListener('resize',measure);removeEventListener('pointermove',pointer);node.removeEventListener('focusin',focus);media.removeEventListener('change',init);};
  },[count]);
  const goTo=useCallback((index:number,immediate=false)=>{const node=root.current,stage=viewport.current;if(!node||!stage)return;navigation.current++;const target=node.offsetTop+(node.offsetHeight-stage.clientHeight)*clamp(index/(count-1));if(lenis.current)lenis.current.scrollTo(target,{duration:1.15,immediate});else window.scrollTo({top:target,behavior:'instant'});},[count]);
  return {root,viewport,panels,active,goTo};
}

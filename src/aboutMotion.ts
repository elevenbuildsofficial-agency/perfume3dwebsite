import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import type { StoryState } from './story';

type Pose = [number, number, number, number, number]; // centre x/y, viewport height, roll, opacity
const desktop: Pose[][] = [
  [[.73,.53,.76,12,1],[.12,.83,1.85,-24,1],[-.38,.55,.9,-42,0],[1.05,1.25,.9,28,0],[.50,.51,.46,-4,1]],
  [[1.2,.82,.35,-24,0],[1.25,.5,.6,-24,0],[1.22,.85,.65,26,0],[.70,.49,.65,-12,1],[.30,.56,.30,-10,1]],
  [[1.14,-.3,.42,-10,0],[1.25,.55,.7,15,0],[.66,.49,.72,8,1],[1.27,.86,.55,-28,0],[.70,.52,.37,8,1]],
];
const mobile: Pose[][] = [
  [[.57,.37,.43,9,1],[-.17,.33,1.12,-24,1],[-.45,.3,.8,-42,0],[1.2,.9,.8,28,0],[.50,.46,.32,-4,1]],
  [[1.3,.4,.3,-24,0],[1.35,.3,.6,-24,0],[1.25,.3,.6,26,0],[.50,.35,.37,-12,1],[.22,.49,.215,-10,1]],
  [[1.3,-.2,.3,-10,0],[1.3,.4,.6,15,0],[.59,.35,.45,8,1],[1.35,.4,.5,-28,0],[.78,.47,.265,8,1]],
];
const clamp = (n:number,a=0,b=1) => Math.max(a,Math.min(b,n));
const smooth = (n:number) => { const t=clamp(n); return t*t*(3-2*t); };
const peak = (stage:number,at:number,width=1) => 1-smooth(Math.abs(stage-at)/width);
const lerp = (a:number,b:number,t:number) => a+(b-a)*t;

export function useAboutMotion(paused:boolean) {
  const root=useRef<HTMLElement>(null);
  const panels=useRef<(HTMLElement|null)[]>([]);
  const bottles=useRef<(HTMLImageElement|null)[]>([]);
  const lenis=useRef<Lenis|null>(null);
  const isReduced=useRef(false);const pause=useRef(paused);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).get('motion')==='reduce');
  const [active,setActive]=useState(0);
  const story=useRef<StoryState>({target:0,stage:0,mix:0,from:0,to:1,x:0,slosh:0,mobile:innerWidth<=1000,reduced,paused,pointerX:0,pointerY:0});
  useEffect(()=>{pause.current=paused;story.current.paused=paused;if(paused)lenis.current?.stop();else lenis.current?.start();},[paused]);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,previous=0,stage=0,previousScene=-1,selected=-1;
    let width=innerWidth,height=innerHeight,range=1,dirty=true;
    let px=0,py=0,tx=0,ty=0;
    const measure=()=>{width=node.clientWidth;height=innerHeight;range=Math.max(1,node.offsetHeight-height);story.current.mobile=width<=1000;dirty=true;};
    const init=()=>{
      isReduced.current=media.matches||new URLSearchParams(location.search).get('motion')==='reduce';
      story.current.reduced=isReduced.current;setReduced(isReduced.current);lenis.current?.destroy();
      lenis.current=isReduced.current?null:new Lenis({duration:1.12,smoothWheel:true,touchMultiplier:1});
      if(pause.current)lenis.current?.stop();measure();dirty=true;
    };
    const pointer=(event:PointerEvent)=>{tx=event.clientX/width-.5;ty=event.clientY/height-.5;};
    const visibility=()=>{previous=0;dirty=true;};
    init();stage=clamp(scrollY/range)*4;
    const draw=(time:number)=>{
      const dt=Math.min((time-previous)/1000||.016,.05);previous=time;
      if(document.hidden||pause.current){frame=requestAnimationFrame(draw);return;}
      lenis.current?.raf(time);
      if(isReduced.current){frame=requestAnimationFrame(draw);return;}
      const target=clamp(scrollY/range)*4;stage=lerp(stage,target,1-Math.exp(-10*dt));
      if(Math.abs(stage-target)<.00002)stage=target;
      const from=Math.min(3,Math.floor(stage));
      // Hold each tableau briefly before the camera travels to the next composition.
      const t=smooth(clamp((stage-from-.12)/.76)),scene=from+t;
      px=lerp(px,tx,1-Math.exp(-4*dt));py=lerp(py,ty,1-Math.exp(-4*dt));
      story.current.stage=scene;story.current.pointerX=px;story.current.pointerY=py;
      const moving=Math.abs(px-tx)>.0001||Math.abs(py-ty)>.0001;
      if(scene===previousScene&&!dirty&&!moving){frame=requestAnimationFrame(draw);return;}
      previousScene=scene;dirty=false;
      const compact=width<=1000,nature=peak(scene,2,.95),material=peak(scene,3,.84),memory=peak(scene,4,.94);
      node.style.setProperty('--scene',String(scene));node.style.setProperty('--film-progress',String(stage/4));
      node.style.setProperty('--nature',String(nature));node.style.setProperty('--material',String(material));node.style.setProperty('--memory',String(memory));
      node.style.setProperty('--story-ink',material>.53?'#f4eddd':'#29372d');
      node.style.setProperty('--drift',`${-scene*7+px*5}vw`);
      node.style.setProperty('--portal-opacity',String(peak(scene,0,1.6)));
      node.style.setProperty('--portal-transform',`translate3d(${lerp(0,-width*.34,clamp(scene))}px,0,0) scale(${1+clamp(scene)*1.8}) rotate(${-scene*6}deg)`);
      node.style.setProperty('--branch-transform',`translate3d(${lerp(-38,0,nature)+px*2}vw,${lerp(15,-8,nature)}vh,0) rotate(${lerp(-45,-4,nature)}deg) scale(${lerp(1.4,1,nature)})`);
      node.style.setProperty('--scan',`${lerp(-80,150,clamp((scene-2.3)/1.4))}%`);
      node.style.setProperty('--orbit-turn',`${scene*35}deg`);
      node.style.setProperty('--nature-reveal',`${lerp(36,0,nature)}%`);
      node.style.setProperty('--macro-crop',`${compact?peak(scene,1,.8)*44:0}%`);
      const poses=compact?mobile:desktop;
      bottles.current.forEach((image,index)=>{
        if(!image)return;const a=poses[index][from],b=poses[index][from+1];
        const x=lerp(a[0],b[0],t)*width,y=lerp(a[1],b[1],t)*height;
        const h=lerp(a[2],b[2],t)*(compact&&height<740?.85:1),rotation=lerp(a[3],b[3],t);
        const orbit=Math.sin(t*Math.PI)*(index===1?-1:1)*(from===3?width*.12:width*.035);
        image.style.transform=`translate3d(${x+orbit+px*(index+1)*5}px,${y+py*7}px,0) translate(-50%,-50%) rotate(${rotation+px*2}deg) scale(${h})`;
        image.style.opacity=String(lerp(a[4],b[4],t));
      });
      const nearest=Math.round(scene);if(nearest!==selected){selected=nearest;setActive(nearest);}
      panels.current.forEach((panel,index)=>{
        if(!panel)return;const distance=Math.abs(scene-index),opacity=1-smooth((distance-.12)/.39);
        panel.style.opacity=String(opacity);panel.style.visibility=opacity<.001?'hidden':'visible';panel.style.transform=`translate3d(0,${(index-scene)*55}px,0)`;
        panel.inert=index!==nearest;panel.setAttribute('aria-hidden',String(index!==nearest));
      });
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);media.addEventListener('change',init);addEventListener('resize',measure);addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',visibility);
    const observer=new ResizeObserver(measure);observer.observe(node);
    return()=>{cancelAnimationFrame(frame);lenis.current?.destroy();lenis.current=null;media.removeEventListener('change',init);removeEventListener('resize',measure);removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);observer.disconnect();};
  },[]);
  const goTo=useCallback((index:number)=>{
    if(!root.current)return;
    if(isReduced.current){setActive(index);document.getElementById(`about-scene-${index}`)?.scrollIntoView({behavior:'instant'});return;}
    const top=(root.current.offsetHeight-innerHeight)*index/4;
    if(lenis.current)lenis.current.scrollTo(top,{duration:1.65});else scrollTo({top,behavior:'smooth'});
  },[]);
  return{root,panels,bottles,story,reduced,active,goTo};
}

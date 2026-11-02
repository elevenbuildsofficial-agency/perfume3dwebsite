import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { range } from './cinematic';
import { copyTravel, sceneArrival, sceneShot } from './spatialMotion';
import styles from './LifestyleStory.module.css';

export const dayMoments=[
  {id:'morning',time:'Morning / First Light',title:'A bright beginning.',body:'Open the window. Take your time. Let a little light into the everyday.',ink:'#29372d',imageAlt:'First Light on a limestone windowsill in morning sun, beside linen and bergamot peel'},
  {id:'evening',time:'Evening / Velvet Hour',title:'The softer hours.',body:'A familiar room. A slower evening. A little warmth to keep close.',ink:'#f8efdf',imageAlt:'Velvet Hour on a walnut table at blue hour, with a book, dark linen and rose petals'},
  {id:'outside',time:'Outside / Wild Ground',title:'The long way home.',body:'Leave a little room for nowhere in particular. Follow the green.',ink:'#29372d',imageAlt:'Wild Ground on a garden bench beneath olive and fig trees, beside a canvas tote and paperback'},
] as const;

export default function LifestyleStory({story,onFind,onContinue}:{story:MutableRefObject<StoryState>;onFind:()=>void;onContinue:()=>void}) {
  const root=useRef<HTMLDivElement>(null),panels=useRef<(HTMLElement|null)[]>([]);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    let frame=0,w=innerWidth,h=innerHeight,last=-1;
    const resize=()=>{w=innerWidth;h=innerHeight;};
    const draw=()=>{
      const s=story.current,v=s.dayVisibility??0,cursor=(s.dayProgress??0)*2,entry=s.dayEntry??0,returning=s.dayReturn??0;
      if(s.paused||document.hidden){frame=requestAnimationFrame(draw);return;}
      node.style.opacity='1';node.style.visibility=v>.00001?'visible':'hidden';node.style.display=v>.00001?'block':'none';node.inert=entry<.999||returning>.001;node.setAttribute('aria-hidden',String(node.inert));
      if(v>.00001){
        // Opaque photographic planes move past the lens, without blending shots.
        node.style.transform=`translateY(${(s.dayExit??0)*-h*1.08}px) ${sceneArrival(entry,w,h,false,s.reduced)}`;
        node.dataset.motion='spatial';
        const ui=s.reduced?1:range(entry,.85,1)*(1-range(returning,0,.16));
        node.style.setProperty('--day-ui-y',`${(1-ui)*h}px`);node.dataset.scene=cursor.toFixed(4);node.dataset.active=dayMoments[Math.round(cursor)].id;
        if(last!==Math.round(cursor)){last=Math.round(cursor);node.querySelectorAll('[data-moment]').forEach((button,i)=>{if(i===last)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});}
        panels.current.forEach((panel,i)=>{
          if(!panel)return;
          const shot=sceneShot(cursor,i,2,s.reduced),visible=shot.visible;
          panel.style.visibility=visible?'visible':'hidden';panel.style.opacity='1';
          panel.style.transform=i===2?`translateX(${s.reduced?0:(1-shot.entry)*w*1.12}px)`:sceneArrival(shot.entry,w,h,false,s.reduced);
          panel.inert=Math.round(cursor)!==i;panel.setAttribute('aria-hidden',String(Math.round(cursor)!==i));
          if(!visible)return;
          const arrival=s.reduced?0:i===0?0:1-range(cursor,i-.58,i),departure=s.reduced?0:i===2?0:range(cursor,i+.16,i+.82);
          panel.style.setProperty('--day-scale',String(1+arrival*.045+departure*.065));
          panel.style.setProperty('--day-x',`${s.reduced?0:(arrival*.012-departure*.015)*w+s.pointerX*7}px`);
          panel.style.setProperty('--day-y',`${s.reduced?0:(arrival*.01-departure*.01)*h}px`);
          const text=copyTravel(cursor,i,2,w,h,s.reduced);
          panel.style.setProperty('--day-copy-x',`${text.x}px`);
          panel.style.setProperty('--day-copy-y',`${text.y+(1-ui)*h}px`);
        });
      }
      frame=requestAnimationFrame(draw);
    };
    addEventListener('resize',resize);frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);};
  },[story]);
  const goToMoment=(i:number)=>{const section=document.getElementById('day');if(!section)return;section.dispatchEvent(new CustomEvent('ingredientnavigate',{bubbles:true,detail:section.offsetTop+(section.offsetHeight-innerHeight*1.8)*i/2}));};
  return <section id="day" className={styles.scrollSpace} aria-label="Make it part of your day"><div ref={root} className={styles.stage} inert aria-hidden="true">
    {dayMoments.map((moment,i)=><article ref={el=>{panels.current[i]=el;}} className={`${styles.panel} ${i===1?styles.evening:''}`} key={moment.id} style={{'--day-ink':moment.ink,'--day-desktop':`url(/images/day-${moment.id}${i===2?'-clean':''}.webp)`,'--day-mobile':`url(/images/day-${moment.id}${i===2?'-clean':''}-mobile.webp)`,zIndex:i+1} as CSSProperties} aria-label={moment.time} inert aria-hidden="true">
      <div className={styles.photo} role="img" aria-label={moment.imageAlt}/><div className={styles.reading}/>
      <div className={styles.headline}><p>Small rituals / Everyday Morrow</p><h2>Make it part<br/>of your day.</h2></div>
      <div className={styles.detail}><p className={styles.eyebrow}>0{i+1} / {moment.time}</p><h3>{moment.title}</h3><p>{moment.body}</p></div>
    </article>)}
    <nav className={styles.moments} aria-label="Daily rituals">{dayMoments.map((moment,i)=><button key={moment.id} data-moment={i} onClick={()=>goToMoment(i)}>{moment.id==='outside'?'Outside':moment.id==='morning'?'Morning':'Evening'}</button>)}</nav>
    <button className={styles.find} onClick={onFind}>Find your kind of Morrow<span>↗</span></button><button className={styles.continue} onClick={onContinue} aria-label="Continue to the collection">↓</button>
  </div></section>;
}

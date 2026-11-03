import { writeMotionStyle, writeMotionData, writeMotionInert, writeMotionAttribute } from './motionWrites';
import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { range } from './cinematic';
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
    let frame=0,w=node.clientWidth,h=node.clientHeight,last=-1,lastKey='',wasVisible:boolean|undefined;
    const resize=()=>{w=node.clientWidth;h=node.clientHeight;lastKey='';};
    const draw=()=>{
      const s=story.current,v=s.dayVisibility??0,cursor=(s.dayProgress??0)*2,entry=s.dayEntry??0,returning=s.dayReturn??0;
      if(s.paused||document.hidden){frame=requestAnimationFrame(draw);return;}
      if(v<.00001&&wasVisible===false){frame=requestAnimationFrame(draw);return;}
      const key=JSON.stringify([v,s.dayProgress,s.dayEntry,s.dayExit,s.dayReturn,s.pointerX,s.reduced,w,h]);
      if(key===lastKey){frame=requestAnimationFrame(draw);return;}lastKey=key;wasVisible=v>.00001;
      writeMotionStyle(node.style,'opacity',String(v));writeMotionStyle(node.style,'visibility',v>.00001?'visible':'hidden');writeMotionInert(node,v<.98||returning>.001);writeMotionAttribute(node,'aria-hidden',String(node.inert));
      if(v>.00001){
        // Every shot stays full-frame; scroll blends complete photographic scenes.
        const ui=s.reduced?1:range(entry,.85,1)*(1-range(returning,0,.16));
        writeMotionStyle(node.style,'--day-ui',String(ui));writeMotionData(node,'scene',cursor.toFixed(4));writeMotionData(node,'active',dayMoments[Math.round(cursor)].id);
        if(last!==Math.round(cursor)){last=Math.round(cursor);node.querySelectorAll('[data-moment]').forEach((button,i)=>{if(i===last)writeMotionAttribute(button,'aria-current','step');else button.removeAttribute('aria-current');});}
        panels.current.forEach((panel,i)=>{
          if(!panel)return;
          const reveal=s.reduced?Number(Math.round(cursor)===i):i===0?1:range(cursor,i-.58,i-.04),next=i===2?0:range(cursor,i+.42,i+.96);
          const visible=s.reduced?Math.round(cursor)===i:reveal>0&&next<1;
          writeMotionStyle(panel.style,'visibility',visible?'visible':'hidden');writeMotionStyle(panel.style,'opacity',String(reveal));
          writeMotionInert(panel,Math.round(cursor)!==i);writeMotionAttribute(panel,'aria-hidden',String(Math.round(cursor)!==i));
          if(!visible)return;
          const arrival=s.reduced?0:i===0?0:1-range(cursor,i-.58,i),departure=s.reduced?0:i===2?0:range(cursor,i+.16,i+.82);
          writeMotionStyle(panel.style,'--day-scale',String(1+arrival*.045+departure*.065));
          writeMotionStyle(panel.style,'--day-x',`${s.reduced?0:(arrival*.012-departure*.015)*w+s.pointerX*7}px`);
          writeMotionStyle(panel.style,'--day-y',`${s.reduced?0:(arrival*.01-departure*.01)*h}px`);
          const text=ui*(s.reduced?1:(i===0?1:range(cursor,i-.17,i-.02))*(1-(i===2?0:range(cursor,i+.15,i+.41))));
          writeMotionStyle(panel.style,'--day-copy',String(text));
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

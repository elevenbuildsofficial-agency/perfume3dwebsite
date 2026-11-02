import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { ingredientShot, range } from './cinematic';
import { ingredientSubject } from './referenceMotion';
import { collectionPaper, copyTravel, sceneArrival } from './spatialMotion';
import { content } from './content';
import { productGeometry } from './productGeometry';
import styles from './IngredientStory.module.css';

export const ingredientNotes = [
  {id:'citrus-peel',name:'Bergamot peel',character:'Bright / zesty / green',scent:'First Light',chapter:1,colour:'#eee2c5',ink:'#393b22',description:'A little sharp. A little sunlit. Bergamot peel gives First Light its bright, open-window feeling.',alt:'A fresh golden bergamot peel ribbon, curled to reveal its porous rind and white pith',count:3},
  {id:'rose-petal',name:'Rose petals',character:'Soft / floral / luminous',scent:'Velvet Hour',chapter:2,colour:'#eadbdd',ink:'#432d38',description:'Soft petals, with a deeper side. Rose brings a quiet floral warmth to Velvet Hour, softened by tea and amber.',alt:'A cupped dusty rose petal with a translucent curling edge and delicate veins',count:5},
  {id:'tea-leaf',name:'Black tea',character:'Dry / textured / warm',scent:'Velvet Hour',chapter:2,colour:'#e5ddcf',ink:'#3d3028',description:'Dark, dry and quietly textured. Black tea gives the rose in Velvet Hour a slower, more grounded rhythm.',alt:'A twisted dried black tea leaf with copper-brown ridges and fine papery texture',count:6},
  {id:'fig-leaf',name:'Fig leaf',character:'Green / earthy / familiar',scent:'Wild Ground',chapter:3,colour:'#dce3cf',ink:'#263d2c',description:'That just-crushed-leaf feeling. Fig leaf brings a vivid green edge to Wild Ground, resting on vetiver and cedarwood.',alt:'A sunlit five-lobed fig leaf with branching pale veins and naturally curling green edges',count:3},
] as const;

export default function IngredientStory({story,onScent,onCollection}:{story:MutableRefObject<StoryState>;onScent:(chapter:number)=>void;onCollection:()=>void}) {
  const root=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]),subjects=useRef<(HTMLDivElement|null)[]>([]),foreground=useRef<(HTMLImageElement|null)[]>([]);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    let frame=0,lastVisible=-1,lastActive=-1,width=innerWidth,height=innerHeight;
    const resize=()=>{width=innerWidth;height=innerHeight;};
    const animate=(time:number)=>{
      const s=story.current,visibility=s.ingredientVisibility??0,progress=s.ingredientProgress??0,cursor=progress*3;
      if(s.paused||document.hidden){frame=requestAnimationFrame(animate);return;}
      if(visibility!==lastVisible){
        node.style.opacity='1';node.style.visibility=visibility<.00001?'hidden':'visible';node.style.display=visibility<.00001?'none':'block';
        lastVisible=visibility;
      }
      node.inert=visibility<.98||(s.ingredientExit??0)>.01;node.setAttribute('aria-hidden',String(node.inert));
      if(visibility>.00001){
        const entry=s.ingredientEntry??1,exit=s.ingredientExit??0;
        node.style.transform=sceneArrival(entry,width,height,false,s.reduced);node.dataset.motion='spatial';
        const interfaceReveal=s.reduced?1:range(entry,.88,1)*(1-range(exit,0,.24));
        node.style.setProperty('--interface-y',`${(1-interfaceReveal)*height}px`);
        node.style.setProperty('--scene-exit',String(s.reduced?0:exit));
        node.dataset.progress=progress.toFixed(4);node.dataset.active=ingredientNotes[Math.round(cursor)].id;
        node.dataset.reduced=String(s.reduced);node.dataset.aperture=visibility.toFixed(4);
        subjects.current.forEach((subject,index)=>{
          if(!subject)return;const p=ingredientSubject(cursor,index,s.reduced),h=height*(s.mobile?.30:.49)*p.scale;
          subject.style.width=`${h*productGeometry[index].aspect}px`;subject.style.height=`${h}px`;
          subject.style.opacity='1';subject.style.visibility=p.alpha>.001?'visible':'hidden';
          subject.style.transform=`translate3d(${width*((s.mobile?.52:.73)+p.x-exit*1.3)+s.pointerX*9}px,${height*((s.mobile?.445:.54)+p.y-exit*.16)}px,0) translate(-50%,-50%) perspective(1000px) rotateY(${p.yaw-exit*28}deg) rotateZ(${p.roll-exit*20}deg) scale(${1-exit*.26})`;
        });
        foreground.current.forEach((image,index)=>{
          if(!image)return;const distance=cursor-index,travel=s.reduced?0:Math.max(-1,Math.min(1,-distance/.65)),turn=s.reduced?index*.8:cursor*.9+index*.8;
          image.style.opacity='1';image.style.visibility=(s.reduced?Math.round(cursor)===index:Math.abs(distance)<.8)?'visible':'hidden';
          image.style.transform=`translate3d(${width*((s.mobile?.50:.72)+Math.sin(turn)*(s.mobile?.36:.22)+travel*1.4-exit*1.8)}px,${height*((s.mobile?.44:.51)+Math.cos(turn)*.13-exit*.18)}px,0) translate(-50%,-50%) rotate(${s.reduced?0:cursor*37+index*23-exit*30}deg)`;
        });
        const active=Math.round(cursor);
        node.style.setProperty('--note-paper',active===3?collectionPaper(exit):ingredientNotes[active].colour);
        if(active!==lastActive){
          node.querySelectorAll<HTMLButtonElement>('[data-ingredient-step]').forEach((button,i)=>{
            if(i===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
          });
          lastActive=active;
        }
        cards.current.forEach((card,index)=>{
          if(!card)return;
          const shot=ingredientShot(cursor,index,s.reduced),distance=cursor-index;
          card.style.opacity='1';card.style.visibility=shot.visible?'visible':'hidden';
          card.style.transform=sceneArrival(shot.reveal,width,height,false,s.reduced);
          if(index===3)card.style.background=collectionPaper(exit);
          card.inert=!shot.visible||shot.copy<.5;card.setAttribute('aria-hidden',String(!shot.visible||shot.copy<.5));
          if(!shot.visible)return;
          const portalZoom=s.reduced?0:(1-entry)*.08+exit*.08;
          card.style.setProperty('--travel-scale',String(shot.scale+portalZoom));
          card.style.setProperty('--travel-x',`${s.reduced?0:(shot.x-exit*1.5)*width+s.pointerX*15}px`);
          card.style.setProperty('--travel-y',`${s.reduced?0:(shot.y-exit*.28)*height+s.pointerY*10}px`);
          card.style.setProperty('--travel-pitch',`${shot.pitch}deg`);
          card.style.setProperty('--travel-yaw',`${shot.yaw}deg`);
          card.style.setProperty('--travel-rotate',`${shot.roll}deg`);
          card.style.setProperty('--focus-blur',`${shot.focus}px`);
          const text=copyTravel(cursor,index,3,width,height,s.reduced);
          card.style.setProperty('--detail-x',`${text.x}px`);
          card.style.setProperty('--detail-y',`${text.y+(1-interfaceReveal)*height}px`);
          card.style.setProperty('--memory-y',`${s.reduced?0:-distance*height*.36}px`);
          card.style.setProperty('--memory-x',`${s.reduced?0:-exit*width*1.1}px`);
          card.style.setProperty('--memory-turn',`${s.reduced?0:index%2?-9+distance*16:9+distance*16}deg`);
          // Near specimens cross the lens faster than the subject, creating depth.
          card.style.setProperty('--satellite-depth',`${s.reduced?0:(shot.scale-1)*75}px`);
          card.style.setProperty('--satellite-x',`${s.reduced?0:Math.sin(time*.00024+index)*7+distance*width*.24}px`);
          card.style.setProperty('--satellite-y',`${s.reduced?0:Math.cos(time*.0003+index)*9-distance*height*.25}px`);
        });
      }
      frame=requestAnimationFrame(animate);
    };
    addEventListener('resize',resize);frame=requestAnimationFrame(animate);return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);};
  },[story]);

  const goToIngredient=(index:number)=>{
    const section=document.getElementById('ingredients');if(!section)return;
    const start=section.offsetTop,end=start+section.offsetHeight-innerHeight;
    // Dispatch through normal scrolling so Lenis and touch share one timeline.
    section.dispatchEvent(new CustomEvent('ingredientnavigate',{bubbles:true,detail:start+(end-start)*index/3}));
  };
  return <section id="ingredients" className={styles.scrollSpace} aria-label="The ingredient story">
    <div ref={root} className={styles.stage} aria-hidden="true" inert>
      <div className={styles.masthead}><span>The notes, up close</span><span>Morrow / An ingredient story</span></div>
      <h2 className={styles.title}>A world inside<br/>every bottle.</h2>
      {content.products.map((product,index)=><div ref={el=>{subjects.current[index]=el;}} className={styles.subject} key={product.id} aria-hidden="true"><span>{product.name}</span><img src={`/bottles/${product.id}-capon.webp`} alt=""/></div>)}
      {ingredientNotes.map((note,index)=><img ref={el=>{foreground.current[index]=el;}} className={styles.foregroundNote} key={note.id} src={`/ingredients/${note.id}.webp`} alt=""/>)}
      {ingredientNotes.map((note,index)=><article ref={el=>{cards.current[index]=el;}} key={note.id} className={`${styles.card} ${styles[note.id]}`} style={{'--ingredient-ink':note.ink,'--ingredient-paper':note.colour,zIndex:index+1} as CSSProperties} aria-label={note.name} inert aria-hidden="true">
        <div className={styles.daylight}/>
        <div className={styles.memory} aria-hidden="true"><img src={`/images/day-${index===0?'morning':index===3?'outside':'evening'}-mobile.webp`} alt=""/><span>{note.scent}</span></div>
        <div className={styles.specimens} aria-hidden="true">
          {Array.from({length:note.count},(_,part)=><div key={part} className={`${styles.specimen} ${part===0?styles.main:styles[`satellite${part}`]}`}><img src={`/ingredients/${note.id}.webp`} alt="" loading="eager" fetchPriority="low" decoding="async" style={{'--float-delay':`${part*-2.7-index}s`,'--float-duration':`${9+part*1.3}s`} as CSSProperties}/></div>)}
        </div>
        <div className={styles.detail}>
          <p className={styles.noteNumber}>0{index+1} / {note.character}</p>
          <h3>{note.name}<span>.</span></h3>
          <p className={styles.description}>{note.description}</p>
          <button className={styles.scentLink} onClick={()=>onScent(note.chapter)}>Discover {note.scent}<span aria-hidden="true">↗</span></button>
        </div>
        <span className={styles.srOnly}>{note.alt}</span>
      </article>)}
      <div className={styles.navigationShade} aria-hidden="true"/>
      <nav className={styles.steps} aria-label="Ingredient chapters">{ingredientNotes.map((note,i)=><button key={note.id} data-ingredient-step={i} onClick={()=>goToIngredient(i)}><span>0{i+1}</span>{note.name}<i/></button>)}</nav>
      <button className={styles.collection} onClick={onCollection}>Explore the collection<span aria-hidden="true">↓</span></button>
    </div>
  </section>;
}

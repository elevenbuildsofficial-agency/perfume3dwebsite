import { writeMotionStyle, writeMotionData, writeMotionInert, writeMotionAttribute } from './motionWrites';
import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { ingredientShot, range } from './cinematic';
import { ingredientSubject } from './referenceMotion';
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
    let frame=0,lastVisible=-1,lastActive=-1,width=node.clientWidth,height=node.clientHeight;
    const resize=()=>{width=node.clientWidth;height=node.clientHeight;};
    const animate=(time:number)=>{
      const s=story.current,visibility=s.ingredientVisibility??0,progress=s.ingredientProgress??0,cursor=progress*3;
      if(s.paused||document.hidden){frame=requestAnimationFrame(animate);return;}
      if(visibility<.00001&&lastVisible===0){frame=requestAnimationFrame(animate);return;}
      if(visibility!==lastVisible){
        writeMotionStyle(node.style,'opacity',String(visibility));writeMotionStyle(node.style,'visibility',visibility<.00001?'hidden':'visible');
        lastVisible=visibility;
      }
      writeMotionInert(node,visibility<.98||(s.ingredientExit??0)>.01);writeMotionAttribute(node,'aria-hidden',String(node.inert));
      if(visibility>.00001){
        const entry=s.ingredientEntry??1,exit=s.ingredientExit??0;
        const interfaceReveal=s.reduced?1:range(entry,.88,1)*(1-range(exit,0,.24));
        writeMotionStyle(node.style,'--interface-reveal',String(interfaceReveal));
        writeMotionStyle(node.style,'--title-reveal',String(interfaceReveal*(s.reduced?1:1-range(Math.abs(cursor-Math.round(cursor)),.10,.30))));
        writeMotionData(node,'progress',progress.toFixed(4));writeMotionData(node,'active',ingredientNotes[Math.round(cursor)].id);
        writeMotionData(node,'reduced',String(s.reduced));writeMotionData(node,'aperture',visibility.toFixed(4));
        subjects.current.forEach((subject,index)=>{
          if(!subject)return;const p=ingredientSubject(cursor,index,s.reduced),h=height*(s.mobile?.30:.49)*p.scale;
          writeMotionStyle(subject.style,'width',`${h*productGeometry[index].aspect}px`);writeMotionStyle(subject.style,'height',`${h}px`);
          writeMotionStyle(subject.style,'opacity',String(p.alpha*interfaceReveal));writeMotionStyle(subject.style,'visibility',p.alpha>.001?'visible':'hidden');
          writeMotionStyle(subject.style,'transform',`translate3d(${width*((s.mobile?.52:.73)+p.x)+s.pointerX*9}px,${height*((s.mobile?.445:.54)+p.y)}px,0) translate(-50%,-50%) perspective(1000px) rotateY(${p.yaw}deg) rotateZ(${p.roll}deg)`);
        });
        foreground.current.forEach((image,index)=>{
          if(!image)return;const distance=cursor-index,alpha=s.reduced?Number(Math.round(cursor)===index):1-range(Math.abs(distance),.15,.8),turn=s.reduced?index*.8:cursor*.9+index*.8;
          writeMotionStyle(image.style,'opacity',String(alpha*interfaceReveal*.92));writeMotionStyle(image.style,'visibility',alpha>.001?'visible':'hidden');
          writeMotionStyle(image.style,'transform',`translate3d(${width*((s.mobile?.50:.72)+Math.sin(turn)*(s.mobile?.36:.22))}px,${height*((s.mobile?.44:.51)+Math.cos(turn)*.13)}px,0) translate(-50%,-50%) rotate(${s.reduced?0:cursor*37+index*23}deg)`);
        });
        const active=Math.round(cursor);
        writeMotionStyle(node.style,'--note-paper',ingredientNotes[active].colour);
        if(active!==lastActive){
          node.querySelectorAll<HTMLButtonElement>('[data-ingredient-step]').forEach((button,i)=>{
            if(i===active)writeMotionAttribute(button,'aria-current','step');else button.removeAttribute('aria-current');
          });
          lastActive=active;
        }
        cards.current.forEach((card,index)=>{
          if(!card)return;
          const shot=ingredientShot(cursor,index,s.reduced),distance=cursor-index;
          writeMotionStyle(card.style,'opacity',String(shot.reveal));writeMotionStyle(card.style,'visibility',shot.visible?'visible':'hidden');
          writeMotionInert(card,!shot.visible||shot.copy<.5);writeMotionAttribute(card,'aria-hidden',String(!shot.visible||shot.copy<.5));
          if(!shot.visible)return;
          const portalZoom=s.reduced?0:(1-entry)*.08+exit*.08;
          writeMotionStyle(card.style,'--travel-scale',String(shot.scale+portalZoom));
          writeMotionStyle(card.style,'--travel-x',`${s.reduced?0:shot.x*width+s.pointerX*15}px`);
          writeMotionStyle(card.style,'--travel-y',`${s.reduced?0:shot.y*height+s.pointerY*10}px`);
          writeMotionStyle(card.style,'--travel-pitch',`${shot.pitch}deg`);
          writeMotionStyle(card.style,'--travel-yaw',`${shot.yaw}deg`);
          writeMotionStyle(card.style,'--travel-rotate',`${shot.roll}deg`);
          writeMotionStyle(card.style,'--focus-blur',`${shot.focus}px`);
          writeMotionStyle(card.style,'--copy-reveal',String(shot.copy*interfaceReveal));
          writeMotionStyle(card.style,'--detail-y',`${shot.copyY}px`);
          writeMotionStyle(card.style,'--memory-y',`${s.reduced?0:-distance*height*.36}px`);
          writeMotionStyle(card.style,'--memory-turn',`${s.reduced?0:index%2?-9+distance*16:9+distance*16}deg`);
          // Near specimens cross the lens faster than the subject, creating depth.
          writeMotionStyle(card.style,'--satellite-depth',`${s.reduced?0:(shot.scale-1)*75}px`);
          writeMotionStyle(card.style,'--satellite-x',`${s.reduced?0:Math.sin(time*.00024+index)*7+distance*width*.24}px`);
          writeMotionStyle(card.style,'--satellite-y',`${s.reduced?0:Math.cos(time*.0003+index)*9-distance*height*.25}px`);
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

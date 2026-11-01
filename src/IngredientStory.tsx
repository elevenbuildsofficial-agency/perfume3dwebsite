import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { ingredientWeight, lerp } from './cinematic';
import styles from './IngredientStory.module.css';

export const ingredientNotes = [
  {id:'citrus-peel',name:'Bergamot peel',character:'Bright / zesty / green',scent:'First Light',chapter:1,colour:'#eee2c5',ink:'#393b22',description:'A little sharp. A little sunlit. Bergamot peel gives First Light its bright, open-window feeling.',alt:'A fresh golden bergamot peel ribbon, curled to reveal its porous rind and white pith',count:3},
  {id:'rose-petal',name:'Rose petals',character:'Soft / floral / luminous',scent:'Velvet Hour',chapter:2,colour:'#eadbdd',ink:'#432d38',description:'Soft petals, with a deeper side. Rose brings a quiet floral warmth to Velvet Hour, softened by tea and amber.',alt:'A cupped dusty rose petal with a translucent curling edge and delicate veins',count:5},
  {id:'tea-leaf',name:'Black tea',character:'Dry / textured / warm',scent:'Velvet Hour',chapter:2,colour:'#e5ddcf',ink:'#3d3028',description:'Dark, dry and quietly textured. Black tea gives the rose in Velvet Hour a slower, more grounded rhythm.',alt:'A twisted dried black tea leaf with copper-brown ridges and fine papery texture',count:6},
  {id:'fig-leaf',name:'Fig leaf',character:'Green / earthy / familiar',scent:'Wild Ground',chapter:3,colour:'#dce3cf',ink:'#263d2c',description:'That just-crushed-leaf feeling. Fig leaf brings a vivid green edge to Wild Ground, resting on vetiver and cedarwood.',alt:'A sunlit five-lobed fig leaf with branching pale veins and naturally curling green edges',count:3},
] as const;

const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const colours=ingredientNotes.map(note=>rgb(note.colour));

export default function IngredientStory({story,onScent,onCollection}:{story:MutableRefObject<StoryState>;onScent:(chapter:number)=>void;onCollection:()=>void}) {
  const root=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    let frame=0,lastVisible=-1,lastActive=-1;
    const animate=(time:number)=>{
      const s=story.current,visibility=s.ingredientVisibility??0,progress=s.ingredientProgress??0,cursor=progress*3;
      if(s.paused||document.hidden){frame=requestAnimationFrame(animate);return;}
      if(visibility!==lastVisible){
        node.style.opacity=String(visibility);node.style.visibility=visibility<.001?'hidden':'visible';
        node.inert=visibility<.5;node.setAttribute('aria-hidden',String(visibility<.5));lastVisible=visibility;
      }
      if(visibility>.001){
        const colourCursor=s.reduced?Math.round(cursor):cursor;
        const from=Math.min(2,Math.floor(colourCursor)),mix=colourCursor-from;
        const colour=colours[from].map((v,i)=>Math.round(lerp(v,colours[from+1][i],mix)));
        node.style.setProperty('--ingredient-paper',`rgb(${colour.join(' ')})`);
        node.style.setProperty('--ingredient-progress',String(progress));
        node.dataset.progress=progress.toFixed(4);node.dataset.active=ingredientNotes[Math.round(cursor)].id;
        node.dataset.reduced=String(s.reduced);
        const active=Math.round(cursor);
        if(active!==lastActive){
          node.querySelectorAll<HTMLButtonElement>('[data-ingredient-step]').forEach((button,i)=>{
            if(i===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
          });
          lastActive=active;
        }
        cards.current.forEach((card,index)=>{
          if(!card)return;
          const weight=ingredientWeight(cursor,index,s.reduced),distance=cursor-index;
          card.style.opacity=String(weight);card.style.visibility=weight<.002?'hidden':'visible';
          card.inert=weight<.5;card.setAttribute('aria-hidden',String(weight<.5));
          const mobile=s.mobile;
          card.style.setProperty('--travel-x',`${s.reduced?0:distance*(mobile?-40:-100)+s.pointerX*18}px`);
          card.style.setProperty('--travel-y',`${s.reduced?0:distance*(mobile?-55:-100)+s.pointerY*12}px`);
          card.style.setProperty('--travel-rotate',`${s.reduced?0:distance*-16}deg`);
          card.style.setProperty('--detail-y',`${s.reduced?0:distance*-24}px`);
          // Satellites follow separate paths rather than moving as one flat picture.
          card.style.setProperty('--satellite-x',`${s.reduced?0:Math.sin(time*.00024+index)*7+distance*90}px`);
          card.style.setProperty('--satellite-y',`${s.reduced?0:Math.cos(time*.0003+index)*9-distance*80}px`);
        });
      }
      frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
  },[story]);

  const goToIngredient=(index:number)=>{
    const section=document.getElementById('ingredients');if(!section)return;
    const start=section.offsetTop,end=start+section.offsetHeight-innerHeight;
    // Dispatch through normal scrolling so Lenis and touch share one timeline.
    section.dispatchEvent(new CustomEvent('ingredientnavigate',{bubbles:true,detail:start+(end-start)*index/3}));
  };
  return <section id="ingredients" className={styles.scrollSpace} aria-label="The ingredient story">
    <div ref={root} className={styles.stage} aria-hidden="true" inert>
      <div className={styles.paper}/><div className={styles.daylight}/>
      <div className={styles.masthead}><span>The notes, up close</span><span>Morrow / An ingredient story</span></div>
      <h2 className={styles.title}>A world inside<br/>every bottle.</h2>
      {ingredientNotes.map((note,index)=><article ref={el=>{cards.current[index]=el;}} key={note.id} className={`${styles.card} ${styles[note.id]}`} style={{'--ingredient-ink':note.ink} as CSSProperties} aria-label={note.name} inert aria-hidden="true">
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
      <nav className={styles.steps} aria-label="Ingredient chapters">{ingredientNotes.map((note,i)=><button key={note.id} data-ingredient-step={i} onClick={()=>goToIngredient(i)}><span>0{i+1}</span>{note.name}<i/></button>)}</nav>
      <button className={styles.collection} onClick={onCollection}>Back to the collection<span aria-hidden="true">↓</span></button>
    </div>
  </section>;
}

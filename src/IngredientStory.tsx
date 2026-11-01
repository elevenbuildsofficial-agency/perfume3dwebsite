import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { ingredientAperture, ingredientLens, ingredientShot, lerp, range } from './cinematic';
import { ingredientMasks } from './ingredientMasks';
import styles from './IngredientStory.module.css';

export const ingredientNotes = [
  {id:'citrus-peel',name:'Bergamot peel',character:'Bright / zesty / green',scent:'First Light',chapter:1,colour:'#eee2c5',ink:'#393b22',description:'A little sharp. A little sunlit. Bergamot peel gives First Light its bright, open-window feeling.',alt:'A fresh golden bergamot peel ribbon, curled to reveal its porous rind and white pith',count:3},
  {id:'rose-petal',name:'Rose petals',character:'Soft / floral / luminous',scent:'Velvet Hour',chapter:2,colour:'#eadbdd',ink:'#432d38',description:'Soft petals, with a deeper side. Rose brings a quiet floral warmth to Velvet Hour, softened by tea and amber.',alt:'A cupped dusty rose petal with a translucent curling edge and delicate veins',count:5},
  {id:'tea-leaf',name:'Black tea',character:'Dry / textured / warm',scent:'Velvet Hour',chapter:2,colour:'#e5ddcf',ink:'#3d3028',description:'Dark, dry and quietly textured. Black tea gives the rose in Velvet Hour a slower, more grounded rhythm.',alt:'A twisted dried black tea leaf with copper-brown ridges and fine papery texture',count:6},
  {id:'fig-leaf',name:'Fig leaf',character:'Green / earthy / familiar',scent:'Wild Ground',chapter:3,colour:'#dce3cf',ink:'#263d2c',description:'That just-crushed-leaf feeling. Fig leaf brings a vivid green edge to Wild Ground, resting on vetiver and cedarwood.',alt:'A sunlit five-lobed fig leaf with branching pale veins and naturally curling green edges',count:3},
] as const;

export default function IngredientStory({story,onScent,onCollection}:{story:MutableRefObject<StoryState>;onScent:(chapter:number)=>void;onCollection:()=>void}) {
  const root=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    let frame=0,lastVisible=-1,lastActive=-1,width=node.clientWidth,height=node.clientHeight;
    const resize=()=>{width=node.clientWidth;height=node.clientHeight;};
    const aperture=(amount:number,x:number,y:number,mask=1,turn=0)=>{
      if(amount>=.99999)return 'none';
      if(amount<=0)return 'circle(0px)';
      const lens=ingredientAperture(width,height,amount,x,y);
      const scale=lens.radius*Math.sqrt(amount)*1.12,angle=(turn+(1-amount)*-14)*Math.PI/180;
      const points=ingredientMasks[mask].map(([px,py])=>[x+(px*Math.cos(angle)-py*Math.sin(angle))*scale,y+(px*Math.sin(angle)+py*Math.cos(angle))*scale]);
      const mid=(a:number[],b:number[])=>`${((a[0]+b[0])/2).toFixed(1)} ${((a[1]+b[1])/2).toFixed(1)}`;
      let path=`M${mid(points[points.length-1],points[0])}`;
      points.forEach((point,i)=>{path+=`Q${point[0].toFixed(1)} ${point[1].toFixed(1)} ${mid(point,points[(i+1)%points.length])}`;});
      return `path('${path}Z')`;
    };
    const animate=(time:number)=>{
      const s=story.current,visibility=s.ingredientVisibility??0,progress=s.ingredientProgress??0,cursor=progress*3;
      if(s.paused||document.hidden){frame=requestAnimationFrame(animate);return;}
      if(visibility!==lastVisible){
        node.style.opacity='1';node.style.visibility=visibility<.00001?'hidden':'visible';
        node.inert=visibility<.98;node.setAttribute('aria-hidden',String(visibility<.98));lastVisible=visibility;
      }
      if(visibility>.00001){
        const entry=s.ingredientEntry??1,exit=s.ingredientExit??0;
        const lens=ingredientLens(width,height,entry,s.ingredientOriginX,s.ingredientOriginY);
        node.style.clipPath=s.reduced?'none':aperture(visibility,lerp(lens.x,width*.5,exit),lerp(lens.y,height*.35,exit));
        const interfaceReveal=s.reduced?1:range(entry,.88,1)*(1-range(exit,0,.24));
        node.style.setProperty('--interface-reveal',String(interfaceReveal));
        node.style.setProperty('--title-reveal',String(interfaceReveal*(s.reduced?1:1-range(Math.abs(cursor-Math.round(cursor)),.10,.30))));
        node.dataset.progress=progress.toFixed(4);node.dataset.active=ingredientNotes[Math.round(cursor)].id;
        node.dataset.reduced=String(s.reduced);node.dataset.aperture=visibility.toFixed(4);
        const active=Math.round(cursor);
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
          card.style.clipPath=s.reduced?'none':aperture(shot.reveal,width*(s.mobile?.5:[.72,.72,.65,.70][index]),height*(s.mobile?.45:.49),index===1?0:1,index===2?65:index===3?-25:0);
          card.inert=!shot.visible||shot.copy<.5;card.setAttribute('aria-hidden',String(!shot.visible||shot.copy<.5));
          if(!shot.visible)return;
          const portalZoom=s.reduced?0:(1-entry)*2.4+exit*2.5;
          card.style.setProperty('--travel-scale',String(shot.scale+portalZoom));
          card.style.setProperty('--travel-x',`${s.reduced?0:shot.x*width+s.pointerX*15}px`);
          card.style.setProperty('--travel-y',`${s.reduced?0:shot.y*height+s.pointerY*10}px`);
          card.style.setProperty('--travel-pitch',`${shot.pitch}deg`);
          card.style.setProperty('--travel-yaw',`${shot.yaw}deg`);
          card.style.setProperty('--travel-rotate',`${shot.roll}deg`);
          card.style.setProperty('--focus-blur',`${shot.focus}px`);
          card.style.setProperty('--copy-reveal',String(shot.copy*interfaceReveal));
          card.style.setProperty('--detail-y',`${shot.copyY}px`);
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
      {ingredientNotes.map((note,index)=><article ref={el=>{cards.current[index]=el;}} key={note.id} className={`${styles.card} ${styles[note.id]}`} style={{'--ingredient-ink':note.ink,'--ingredient-paper':note.colour,zIndex:index+1} as CSSProperties} aria-label={note.name} inert aria-hidden="true">
        <div className={styles.daylight}/>
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

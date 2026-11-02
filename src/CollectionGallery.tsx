import { useEffect, useRef, type MutableRefObject } from 'react';
import { content } from './content';
import { range } from './cinematic';
import { galleryShot } from './referenceMotion';
import type { StoryState } from './story';
import styles from './CollectionGallery.module.css';

export default function CollectionGallery({story,onScent,onContinue}:{story:MutableRefObject<StoryState>;onScent:(index:number)=>void;onContinue:()=>void}) {
  const root=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]);
  useEffect(()=>{
    const node=root.current;if(!node)return;let frame=0;
    const draw=()=>{
      const s=story.current,v=s.galleryVisibility??0;
      if(s.paused||document.hidden){frame=requestAnimationFrame(draw);return;}
      node.style.opacity=String(v);node.style.visibility=v>.00001?'visible':'hidden';node.inert=v<.98||(s.galleryExit??0)>.01;node.setAttribute('aria-hidden',String(node.inert));
      if(v>.00001){
        const cursor=(s.galleryProgress??0)*2,w=node.clientWidth,h=node.clientHeight,ui=s.reduced?1:range(s.galleryEntry??0,.7,1)*(1-range(s.galleryExit??0,0,.3));
        node.dataset.cursor=cursor.toFixed(4);node.style.setProperty('--gallery-ui',String(ui));
        node.style.setProperty('--gallery-drift',`${s.reduced?0:-cursor*7}vw`);
        cards.current.forEach((card,i)=>{
          if(!card)return;const p=galleryShot(s.reduced?Math.round(cursor):cursor,i,w,h,s.reduced);
          card.style.visibility=p.visible?'visible':'hidden';card.style.width=`${p.width}px`;card.style.zIndex=String(5-Math.round(Math.abs(i-cursor)));
          card.style.transform=`translate3d(${p.x}px,${p.y}px,${p.z}px) translate(-50%,-50%) rotateY(${p.yaw}deg) rotateZ(${p.roll}deg) scale(${p.scale})`;
          const complete=p.x-p.width*p.scale*.5>=16&&p.x+p.width*p.scale*.5<=w-16;
          card.inert=!p.visible||!complete;card.setAttribute('aria-hidden',String(card.inert));
        });
        node.querySelectorAll('[data-gallery-stop]').forEach((button,i)=>{if(Math.round(cursor)===i)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
      }
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
  },[story]);
  const move=(i:number)=>{const section=document.getElementById('gallery');if(section)section.dispatchEvent(new CustomEvent('ingredientnavigate',{bubbles:true,detail:section.offsetTop+(section.offsetHeight-innerHeight)*i/2}));};
  return <section id="gallery" className={styles.space} aria-label="The collection, in motion"><div className={styles.stage} ref={root} inert aria-hidden="true">
    <div className={styles.backdrop} aria-hidden="true">Morrow.</div>
    <div className={styles.heading}><p>The collection / By instinct</p><h2>Three scents.<br/>One instinct.</h2></div>
    <div className={styles.track}>{content.products.map((product,i)=><article ref={el=>{cards.current[i]=el;}} className={styles.card} key={product.id} aria-label={product.name} style={{background:product.palette.bg}} inert aria-hidden="true">
      <span className={styles.number}>0{i+1} / Eau de parfum</span><img src={`/bottles/${product.id}-capon.webp`} alt={product.imageAlt}/><div className={styles.cardCopy}><h3>{product.name}</h3><p>{product.ingredients.join(' · ')}</p><button onClick={()=>onScent(i+1)} aria-label={`Explore ${product.name}`}>Explore this scent<span>↗</span></button></div>
    </article>)}</div>
    <nav className={styles.controls} aria-label="Collection gallery">{content.products.map((p,i)=><button key={p.id} data-gallery-stop onClick={()=>move(i)}>{p.name}</button>)}</nav>
    <button className={styles.continue} onClick={onContinue}>Make it part of your day<span>↓</span></button>
  </div></section>;
}

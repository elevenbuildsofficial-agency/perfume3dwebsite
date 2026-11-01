import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { collectionLayout } from './collectionLayout';
import { bottleRegistration } from './bottleAssets';
import { groundFrame, heroBeat, neckCamera } from './cinematic';
import styles from './GroundedPlate.module.css';

// The generated garden is a clean photo plate. Product motion still comes from
// the continuous renderer; no baked bottles or keyframe crossfades are used.
export default function GroundedPlate({story,reduced}:{story:MutableRefObject<StoryState>;reduced:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    let frame=0,width=innerWidth,height=innerHeight,hero=collectionLayout(width,height,'hero')[0],last='';
    const resize=()=>{width=node.clientWidth;height=node.clientHeight;hero=collectionLayout(width,height,'hero',innerWidth<=1000)[0];last='';};
    const animate=()=>{
      const s=story.current;
      const key=`${s.reduced}|${s.stage.toFixed(4)}|${(s.scroll??0).toFixed(4)}|${s.pointerX.toFixed(3)}|${s.pointerY.toFixed(3)}`;
      if(key!==last){
        last=key;const beat=heroBeat(s.scroll??0,s.reduced),g=groundFrame(width,height,s.pointerX,s.pointerY,s.stage,s.reduced);
        const neckY=hero.y+(bottleRegistration[0].nozzle[1]-.5)*hero.height,c=neckCamera(width,height,hero.x,neckY,beat.dolly);
        node.style.setProperty('--ledge-transform',`translate3d(${g.x}px,${g.y}px,0)`);
        node.style.setProperty('--hero-transform',`translate(${hero.x+c.x}px,${neckY+c.y}px) scale(${c.scale}) translate(${-hero.x}px,${-neckY}px)`);
        const inHero=!s.reduced&&(s.scroll??0)<.30;
        node.style.setProperty('--hero-opacity',String(inHero?1-beat.dissolve:0));
        node.style.setProperty('--world-opacity',String(inHero?beat.dissolve:1));
        const weight=(chapter:number)=>Math.max(0,1-Math.abs(s.stage-chapter));
        const left=Math.max(weight(1),weight(3)),right=weight(2);
        node.style.setProperty('--copy-left',String(inHero?0:left));
        node.style.setProperty('--copy-right',String(inHero?0:right));
        node.style.setProperty('--copy-mobile',String(inHero?0:Math.max(left,right)));
      }
      frame=requestAnimationFrame(animate);
    };
    resize();addEventListener('resize',resize);frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);};
  },[story]);
  return <div ref={root} className={styles.plate} data-reduced={reduced} aria-hidden="true" style={{'--garden-desktop':'url("/images/morrow-generated-garden.webp")','--garden-mobile':'url("/images/morrow-generated-garden-mobile.webp")'} as CSSProperties}>
    {[false,true].map(hero=><div key={String(hero)} className={`${styles.world} ${hero?styles.hero:styles.destination}`}><div className={styles.photograph}/></div>)}
    <div className={styles.readingLight}/>
    <div className={styles.copyLightLeft}/><div className={styles.copyLightRight}/><div className={styles.copyLightMobile}/>
  </div>;
}

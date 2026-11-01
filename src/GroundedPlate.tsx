import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { content } from './content';
import { collectionLayout } from './collectionLayout';
import { bottleRegistration } from './bottleAssets';
import { groundFrame, heroBeat, neckCamera } from './cinematic';
import styles from './GroundedPlate.module.css';

export default function GroundedPlate({story,reduced}:{story:MutableRefObject<StoryState>;reduced:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node=root.current;if(!node)return;
    let frame=0,width=innerWidth,height=innerHeight,hero=collectionLayout(width,height,'hero')[0],last='';
    const resize=()=>{width=node.clientWidth;height=node.clientHeight;hero=collectionLayout(width,height,'hero',innerWidth<=1000)[0];last='';};
    const animate=()=>{
      const s=story.current,beat=heroBeat(s.scroll??0,s.reduced),g=groundFrame(width,height,s.pointerX,s.pointerY,s.stage,s.reduced);
      const key=`${s.reduced}|${s.stage.toFixed(4)}|${(s.scroll??0).toFixed(4)}|${s.pointerX.toFixed(3)}|${s.pointerY.toFixed(3)}`;
      if(key===last){frame=requestAnimationFrame(animate);return;}last=key;
      const neckY=hero.y+(bottleRegistration[0].nozzle[1]-.5)*hero.height,c=neckCamera(width,height,hero.x,neckY,beat.dolly);
      node.style.setProperty('--ledge-transform',`translate3d(${g.x}px,${g.y}px,0)`);
      node.style.setProperty('--hero-transform',`translate(${hero.x+c.x}px,${neckY+c.y}px) scale(${c.scale}) translate(${-hero.x}px,${-neckY}px)`);
      node.style.setProperty('--far-transform',`translate3d(${s.reduced?0:s.pointerX*3-s.stage*.7}px,${s.reduced?0:s.pointerY*1.5}px,0)`);
      node.style.setProperty('--trees-transform',`translate3d(${s.reduced?0:s.pointerX*6-s.stage*1.2}px,${s.reduced?0:s.pointerY*3}px,0)`);
      node.style.setProperty('--leaves-transform',`translate3d(${s.reduced?0:s.pointerX*19}px,${s.reduced?0:s.pointerY*10}px,0)`);
      const inHero=!s.reduced&&(s.scroll??0)<.30;
      node.style.setProperty('--hero-opacity',String(inHero?1-beat.dissolve:0));
      node.style.setProperty('--world-opacity',String(inHero?beat.dissolve:1));
      frame=requestAnimationFrame(animate);
    };
    resize();addEventListener('resize',resize);frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);};
  },[story]);
  return <div ref={root} className={styles.plate} data-reduced={reduced} aria-hidden="true" style={{'--plate':`url("${content.scene.background.image}")`,'--canopy':`url("${content.scene.background.foliage}")`} as CSSProperties}>
    {[false,true].map(hero=><div key={String(hero)} className={`${styles.world} ${hero?styles.hero:styles.destination}`}>
      <div className={styles.far}/><div className={styles.trees}/><div className={styles.stone}/><div className={styles.canopy}/>
    </div>)}
    <div className={styles.dapple}/><div className={styles.grade}/>
    {!reduced&&<div className={styles.butterflies}>{[0,1].map(index=><div key={index} className={styles.butterfly} style={{'--i':index} as CSSProperties}><img src={content.scene.background.butterfly} alt=""/></div>)}</div>}
  </div>;
}

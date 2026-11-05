import { writeMotionStyle } from './motionWrites';
import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';
import type { StoryState } from './story';
import { collectionLayout, focusPose } from './collectionLayout';
import { bottleRegistration } from './bottleAssets';
import { groundFrame, heroHandoff, lerp, neckCamera } from './cinematic';
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
        last=key;const handoff=heroHandoff(s.scroll??0,s.reduced),g=groundFrame(width,height,s.pointerX,s.pointerY,s.stage,s.reduced);
        const focus=focusPose(width,height,0,s.mobile,s.reduced),subject={x:lerp(hero.x,focus.x,handoff.settle),y:lerp(hero.y,focus.y,handoff.settle),height:lerp(hero.height,focus.height,handoff.settle)};
        const neckY=subject.y+(bottleRegistration[0].nozzle[1]-.5)*subject.height,c=neckCamera(width,height,subject.x,neckY,handoff.camera);
        writeMotionStyle(node.style,'--ledge-transform',`translate3d(${g.x}px,${g.y}px,0)`);
        writeMotionStyle(node.style,'--hero-transform',`translate(${subject.x+c.x}px,${neckY+c.y}px) scale(${c.scale}) translate(${-subject.x}px,${-neckY}px)`);
      }
      frame=requestAnimationFrame(animate);
    };
    resize();addEventListener('resize',resize);frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);};
  },[story]);
  return <div ref={root} className={styles.plate} data-reduced={reduced} aria-hidden="true" style={{'--garden-desktop':'url("/images/morrow-generated-garden.webp")','--garden-mobile':'url("/images/morrow-generated-garden-mobile.webp")'} as CSSProperties}>
    <div className={`${styles.world} ${styles.hero}`}><div className={styles.photograph}/></div>
    <div className={styles.readingLight}/>
  </div>;
}

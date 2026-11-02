import type { CSSProperties } from 'react';
import { content } from './content';
import AmbientBackground from './AmbientBackground';
import { useAboutMotion } from './aboutMotion';
import styles from './AboutJourney.module.css';

const lines=(text:string)=>text.split('\n').map((line,index)=><span key={index}>{line}</span>);
const Arrow=()=> <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.3" /></svg>;

export default function AboutJourney({paused,onExplore}:{paused:boolean;onExplore:()=>void}) {
  const {root,panels,bottles,story,reduced,active,goTo}=useAboutMotion(paused);
  const c=content.about,chapters=c.film;
  return <main ref={root} className={styles.film} data-reduced={reduced} aria-label="The Morrow story">
    <div className={styles.stage} aria-hidden="true">
      <AmbientBackground story={story} reduced={reduced}/>
      <div className={styles.natureWindow}><img src={content.scene.background.image} alt=""/></div>
      <div className={styles.darkroom}/><div className={styles.paperLight}/>
      <div className={styles.portal}><span/><i/></div>
      <div className={styles.typography}>{c.filmBackdrop}</div>
      <div className={styles.orbits}><i/><i/><i/><span>{c.materialCaption}</span></div>
      <div className={styles.memories}>{['morning','evening','outside'].map((moment,index)=><div key={moment} data-about-memory={index}><img src={`/images/day-${moment}-mobile.webp`} alt=""/><span>{content.products[index].name}</span></div>)}</div>
      <div className={styles.products}>{content.products.map((product,index)=><img ref={image=>{bottles.current[index]=image;}} key={product.id} className={styles[`bottle${index}`]} src={product.image} srcSet={`${product.imageSmall} 480w, ${product.image} 1200w`} sizes="(max-width:1000px) 85vw, 65vw" alt="" fetchPriority={index===0?'high':'auto'} decoding="async"/>)}</div>
      <img className={styles.foreground} src={content.scene.background.foliage} alt=""/>
      <div className={styles.lightSweep}/><div className={styles.bottomLight}/><div className={styles.frame}><i/><i/><i/><i/></div>
    </div>
    <div className={styles.topline} aria-hidden="true"><span>{c.kicker}</span><span>{chapters[active].label}<i/> {String(active+1).padStart(2,'0')} / 05</span></div>
    <div className={styles.scenes}>
      {chapters.map((chapter,index)=><section key={chapter.label} id={`about-scene-${index}`} ref={element=>{panels.current[index]=element;}} className={`${styles.panel} ${styles[`scene${index}`]}`} aria-hidden={!reduced&&active!==index} inert={!reduced&&active!==index} aria-label={chapter.label}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span>{String(index+1).padStart(2,'0')}</span>{chapter.eyebrow}</p>
          {index===0?<h1>{lines(chapter.title)}</h1>:<h2>{lines(chapter.title)}</h2>}
          <p className={styles.description}>{chapter.body}</p>
          {index===4&&<a className={styles.explore} href="/#chapter-1" onClick={event=>{event.preventDefault();onExplore();}}>{content.ui.discover}<Arrow/></a>}
        </div>
        {index===0&&<div className={styles.openingNote}><span>{c.openingNote}</span><button onClick={()=>goTo(1)}>{c.journeyHint}<Arrow/></button></div>}
        {index===1&&<div className={styles.poem}>{c.poem.map((line,i)=><span key={line} style={{'--line':i} as CSSProperties}>{line}</span>)}</div>}
        {index===2&&<div className={styles.fieldnote}><span>F. 03 / {content.products[2].name}</span><i/><p>{c.fieldnote}</p></div>}
        {index===3&&<div className={styles.materialNote}><span>{c.materialDetailTitle}</span><p>{c.materialDetail}</p></div>}
        {index===4&&<div className={styles.signature}><span>{content.brand}.</span><p>{c.closing}</p></div>}
        {reduced&&<img className={styles.stillImage} src={content.products[chapter.product].image} alt={content.products[chapter.product].imageAlt}/>}
      </section>)}
    </div>
    <nav id="about-story-controls" tabIndex={-1} className={styles.controls} aria-label="About story chapters">
      <span className={styles.controlLabel}>{c.journeyHint}<span> ↓</span></span>
      <div className={styles.chapterButtons}>{chapters.map((chapter,index)=><button key={chapter.label} onClick={()=>goTo(index)} aria-current={active===index?'step':undefined} aria-label={`Chapter ${index+1}: ${chapter.label}`}><span>{String(index+1).padStart(2,'0')}</span><span>{chapter.label}</span><i/></button>)}</div>
      <button className={styles.next} onClick={()=>goTo(active===4?0:active+1)} aria-label={active===4?'Return to the opening':`${content.ui.next}: ${chapters[active+1].label}`}><Arrow/></button>
      <div className={styles.progress} role="progressbar" aria-label="About story progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={active+1}><span/></div>
    </nav>
    <footer className={styles.copyright}>{content.final.copyright}</footer>
  </main>;
}

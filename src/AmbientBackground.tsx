import { useEffect, useRef, useState, type MutableRefObject, type CSSProperties } from 'react';
import { content } from './content';
import type { StoryState } from './story';
import styles from './AmbientBackground.module.css';
import GroundedPlate from './GroundedPlate';

export default function AmbientBackground({story,reduced,grounded=false}:{story:MutableRefObject<StoryState>;reduced:boolean;grounded?:boolean}) {
  return grounded?<GroundedPlate story={story} reduced={reduced}/>:<OrchardBackground story={story} reduced={reduced}/>;
}

function OrchardBackground({ story, reduced }: { story: MutableRefObject<StoryState>; reduced: boolean }) {
  const background = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const mobile = matchMedia(`(max-width:${content.scene.mobileBreakpoint}px)`).matches;
  useEffect(() => {
    if (reduced) { video.current?.pause(); setVideoEnabled(false); setVideoPlaying(false); return; }
    let timeout = 0;
    const enable = () => { timeout = window.setTimeout(() => setVideoEnabled(true), 900); };
    if (document.readyState === 'complete') enable();
    else addEventListener('load', enable, { once: true });
    return () => { clearTimeout(timeout); removeEventListener('load', enable); video.current?.pause(); };
  }, [reduced]);
  useEffect(() => {
    const visibility = () => { if (document.hidden) video.current?.pause(); else if (videoEnabled && !reduced) video.current?.play().catch(() => {}); };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [videoEnabled, reduced]);
  useEffect(() => {
    let frame = 0; let x = 0; let y = 0; let previousX = 100; let previousY = 100;
    const animate = () => {
      const s = story.current;
      const targetX = s.reduced ? 0 : s.pointerX * 12 - s.stage * 3;
      const targetY = s.reduced ? 0 : s.pointerY * 8 + s.stage * 2;
      x += (targetX - x) * 0.045; y += (targetY - y) * 0.045;
      if (background.current && (Math.abs(x - previousX) > 0.05 || Math.abs(y - previousY) > 0.05)) {
        background.current.style.setProperty('--ambient-x', `${x.toFixed(2)}px`);
        background.current.style.setProperty('--ambient-y', `${y.toFixed(2)}px`);
        previousX = x; previousY = y;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [story]);
  return <div className={styles.ambient} ref={background} data-reduced={reduced} data-video-present={!reduced && !videoFailed} data-video-playing={videoPlaying} aria-hidden="true">
    <div className={styles.environment} style={{ '--environment-desktop': `url("${content.scene.background.image}")`, '--environment-mobile': `url("${content.scene.background.mobileImage}")` } as CSSProperties} />
    {!reduced && !videoFailed && <video ref={video} className={styles.video} src={videoEnabled ? (mobile ? content.scene.background.mobileVideo : content.scene.background.video) : undefined} poster={mobile ? content.scene.background.mobilePoster : content.scene.background.poster} autoPlay muted loop playsInline preload={videoEnabled ? 'auto' : 'none'} onCanPlay={() => { if (videoEnabled) { video.current!.muted = true; video.current?.play().catch(() => { setVideoFailed(true); setVideoPlaying(false); }); } }} onPlaying={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} onError={() => { setVideoFailed(true); setVideoPlaying(false); }} />}
    <div className={styles.tint} />
    {(reduced || videoFailed) && <><div className={styles.branchLeft}><img src={content.scene.background.foliage} alt="" /></div><div className={styles.branchRight}><img src={content.scene.background.foliage} alt="" /></div></>}
    <div className={styles.veil} />
    <svg className={styles.shadows} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <defs><path id="morrow-leaf-shadow" d="M0 0C-38-15-77-55-56-89-38-104-16-75-6-62-16-101-4-131 18-128 39-125 39-89 35-65 60-99 86-92 88-68 89-45 49-11 0 0Z" /></defs>
      <g transform="translate(100 220) rotate(-25)"><path d="M-80-220Q40 10 420 250" fill="none" stroke="currentColor" strokeWidth="7" /><use href="#morrow-leaf-shadow" transform="translate(50 30) rotate(40) scale(1.6)" /><use href="#morrow-leaf-shadow" transform="translate(140 110) rotate(155) scale(1.2)" /><use href="#morrow-leaf-shadow" transform="translate(225 165) rotate(30) scale(1.45)" /><use href="#morrow-leaf-shadow" transform="translate(340 220) rotate(150) scale(1.1)" /></g>
      <g transform="translate(1530 80) rotate(95) scale(1.3)"><path d="M-100-90Q130 20 410 270" fill="none" stroke="currentColor" strokeWidth="6" /><use href="#morrow-leaf-shadow" transform="translate(20 0) rotate(35) scale(1.5)" /><use href="#morrow-leaf-shadow" transform="translate(140 95) rotate(150) scale(1.4)" /><use href="#morrow-leaf-shadow" transform="translate(270 180) rotate(30) scale(1.3)" /></g>
    </svg>
    <div className={styles.daylight} />
    {(reduced || videoFailed) && <div className={styles.butterflies}>
      {[0, 1, 2].map(index => <div key={index} className={`${styles.butterflyFlight} ${styles[`flight${index}`]}`}>
        <div className={styles.butterfly} style={{ '--butterfly-image': `url("${content.scene.background.butterfly}")` } as CSSProperties}>
          <span className={styles.leftWing} /><span className={styles.rightWing} />
          <img className={styles.butterflyBody} src={content.scene.background.butterfly} alt="" />
        </div>
      </div>)}
    </div>}
  </div>;
}

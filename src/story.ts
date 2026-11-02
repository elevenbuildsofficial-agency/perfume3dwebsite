import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { content, worlds } from './content';
import { heroBeat, heroHandoff, range, ingredientBeat, ingredientLens, ingredientBottleStage, lifestyleBeat } from './cinematic';

gsap.registerPlugin(ScrollTrigger);
export type StoryState = { target: number; stage: number; mix: number; from: number; to: number; x: number; slosh: number; mobile: boolean; reduced: boolean; paused: boolean; pointerX: number; pointerY: number; scroll?: number; ingredientProgress?: number; ingredientVisibility?: number; ingredientEntry?:number; ingredientExit?:number; ingredientOriginX?:number; ingredientOriginY?:number; hasDay?:boolean; dayProgress?:number; dayVisibility?:number; dayEntry?:number; dayExit?:number; dayReturn?:number; dayOutside?:number; worldCovered?:boolean };
const rgb = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const palettes = worlds.map(world => ({ bg: rgb(world.bg), ink: rgb(world.ink), a: rgb(world.a), b: rgb(world.b) }));
const lightInk = rgb('#FFFFFF');
const darkInk = rgb('#000000');
const lum = (r: number, g: number, b: number) => {
  const linear = (v: number) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const smooth = (t: number) => t * t * (3 - 2 * t);

export function useStory(panels: RefObject<(HTMLElement | null)[]>, wordmark: RefObject<HTMLDivElement | null>) {
  const state = useRef<StoryState>({ target: 0, stage: 0, mix: 0, from: 0, to: 1, x: 0, slosh: 0, mobile: false, reduced: false, paused: false, pointerX: 0, pointerY: 0 });
  const lenis = useRef<Lenis | null>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia(`(max-width: ${content.scene.mobileBreakpoint}px)`);
    let frame = 0;
    let previous = 0;
    let currentActive = -1;
    let lastInk = '';
    let lastStage=-1,lastScroll=-1,lastMobile=false;
    let firstChapter=1,lastChapter=4,ingredientStart=4,ingredientEnd=4,dayStart=4,hasDay=false;
    const measure=()=>{
      firstChapter=(document.getElementById('chapter-1')?.offsetTop??innerHeight)/innerHeight;
      lastChapter=(document.getElementById('chapter-4')?.offsetTop??innerHeight*4)/innerHeight;
      ingredientStart=(document.getElementById('ingredients')?.offsetTop??lastChapter*innerHeight)/innerHeight;
      const ingredients=document.getElementById('ingredients'),day=document.getElementById('day');
      ingredientEnd=ingredients?(ingredients.offsetTop+ingredients.offsetHeight)/innerHeight:lastChapter;
      dayStart=day?day.offsetTop/innerHeight:lastChapter;hasDay=Boolean(day);
    };
    const initializeMotion = () => {
      const reduceMotion = motion.matches || new URLSearchParams(location.search).get('motion') === 'reduce';
      state.current.reduced = reduceMotion;
      setReduced(reduceMotion);
      lenis.current?.destroy();
      lenis.current = reduceMotion ? null : new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1, anchors: false });
      lenis.current?.on('scroll', ScrollTrigger.update);
    };
    const resize = () => { state.current.mobile = mobile.matches; measure(); ScrollTrigger.refresh(); };
    const ingredientNavigate=(event:Event)=>{
      const top=(event as CustomEvent<number>).detail;
      if(!Number.isFinite(top))return;
      if(lenis.current)lenis.current.scrollTo(top,{duration:1.2});
      else window.scrollTo({top,behavior:'instant'});
    };
    initializeMotion();
    state.current.mobile = mobile.matches;
    measure();
    const updateScroll = () => {
      const scroll=scrollY/innerHeight;
      state.current.target=ingredientBottleStage(scroll,firstChapter,ingredientStart,ingredientEnd,state.current.reduced);
    };
    const trigger = ScrollTrigger.create({
      start: 0, end: () => Math.max(1, document.getElementById('chapter-4')?.offsetTop ?? innerHeight * 4),
      onUpdate: updateScroll,
    });
    updateScroll();
    motion.addEventListener('change', initializeMotion);
    mobile.addEventListener('change', resize);
    addEventListener('resize',resize);
    addEventListener('ingredientnavigate',ingredientNavigate);
    const animate = (time: number) => {
      const dt = Math.min((time - previous) / 1000 || 0.016, 0.05);
      previous = time;
      lenis.current?.raf(time);
      const s = state.current;
      if (s.paused || document.hidden) { frame=requestAnimationFrame(animate); return; }
      updateScroll();
      const desiredScroll=scrollY/innerHeight;
      s.scroll=(s.scroll??desiredScroll)+(desiredScroll-(s.scroll??desiredScroll))*(s.reduced?1:1-Math.exp(-18*dt));
      const ingredients=ingredientBeat(s.scroll,ingredientStart,ingredientEnd,s.reduced);
      const day=lifestyleBeat(s.scroll,dayStart,lastChapter,s.reduced);
      s.hasDay=hasDay;s.dayProgress=day.progress;s.dayEntry=day.entry;s.dayExit=day.exit;s.dayVisibility=hasDay?day.visibility:0;
      s.dayReturn=hasDay?day.returning:0;
      s.dayOutside=hasDay?day.entry*(s.reduced?Number(Math.round(day.progress*2)===2):range(day.progress*2,1.42,1.96)):0;
      s.ingredientProgress=ingredients.progress;s.ingredientVisibility=hasDay?ingredients.entry*Number(ingredients.exit<1):ingredients.visibility;
      s.ingredientEntry=ingredients.entry;s.ingredientExit=ingredients.exit;
      s.worldCovered=(s.ingredientVisibility??0)>=.99999||(s.dayVisibility??0)>=.99999;
      s.stage += (s.target - s.stage) * (s.reduced ? 1 : 1 - Math.exp(-content.scene.scrollSmoothing * dt));
      if (Math.abs(s.target - s.stage) < 0.00001) s.stage = s.target;
      s.stage = Math.max(0, Math.min(4, s.stage));
      s.from = Math.min(3, Math.floor(s.stage));
      s.to = s.from + 1;
      s.mix = smooth(s.stage - s.from);
      s.x = content.scene.positions[s.from] + (content.scene.positions[s.to] - content.scene.positions[s.from]) * s.mix;
      s.slosh = s.reduced ? 0 : Math.max(-0.14, Math.min(0.14, (s.target - s.stage) * 9));
      const beat=heroBeat(s.scroll,s.reduced);
      if(s.stage===lastStage&&s.mobile===lastMobile&&Math.abs(s.scroll-lastScroll)<.00001){frame=requestAnimationFrame(animate);return;}
      lastStage=s.stage;lastScroll=s.scroll;lastMobile=s.mobile;
      const a = palettes[s.from]; const b = palettes[s.to]; const t = s.mix;
      const r = Math.round(a.bg[0] + (b.bg[0] - a.bg[0]) * t);
      const g = Math.round(a.bg[1] + (b.bg[1] - a.bg[1]) * t);
      const blue = Math.round(a.bg[2] + (b.bg[2] - a.bg[2]) * t);
      let ir = Math.round(a.ink[0] + (b.ink[0] - a.ink[0]) * t);
      let ig = Math.round(a.ink[1] + (b.ink[1] - a.ink[1]) * t);
      let ib = Math.round(a.ink[2] + (b.ink[2] - a.ink[2]) * t);
      const bgLum = lum(r, g, blue);
      if (contrast(bgLum, lum(ir, ig, ib)) < 4.7) {
        const ink = contrast(bgLum, lum(...darkInk as [number, number, number])) > contrast(bgLum, lum(...lightInk as [number, number, number])) ? darkInk : lightInk;
        [ir, ig, ib] = ink;
      }
      root.style.setProperty('--bg', `rgb(${r} ${g} ${blue})`);
      root.style.setProperty('--liquid-a', `rgb(${Math.round(a.a[0] + (b.a[0] - a.a[0]) * t)} ${Math.round(a.a[1] + (b.a[1] - a.a[1]) * t)} ${Math.round(a.a[2] + (b.a[2] - a.a[2]) * t)})`);
      root.style.setProperty('--liquid-b', `rgb(${Math.round(a.b[0] + (b.b[0] - a.b[0]) * t)} ${Math.round(a.b[1] + (b.b[1] - a.b[1]) * t)} ${Math.round(a.b[2] + (b.b[2] - a.b[2]) * t)})`);
      const ink = `rgb(${ir} ${ig} ${ib})`;
      if (ink !== lastInk) { root.style.setProperty('--ink', ink); lastInk = ink; }
      root.style.setProperty('--progress', String(Math.min(1,s.scroll/lastChapter)));
      root.style.setProperty('--bottle-visibility',(s.dayOutside??0)>.00001?'1':s.worldCovered?'0':'1');
      root.style.setProperty('--scene-layer',(s.dayOutside??0)>.00001?'8':'2');
      root.style.setProperty('--ingredient-camera',ingredientLens(innerWidth,innerHeight,ingredients.camera,s.ingredientOriginX,s.ingredientOriginY).transform);
      root.style.setProperty('--product-x', `${s.mobile ? 0 : s.x * 11}vw`);
      const nearest = Math.round(s.stage);
      const navigationStep=s.scroll>=lastChapter-.65?6:hasDay&&(day.entry>.15||s.scroll>=dayStart)?5:ingredients.entry>.15||s.scroll>=ingredientStart?4:Math.min(3,nearest);
      if (navigationStep !== currentActive) { currentActive = navigationStep; setActive(navigationStep); }
      panels.current.forEach((panel, index) => {
        if (!panel) return;
        const distance = Math.abs(s.stage - index);
        let opacity = 1 - smooth(Math.max(0, Math.min(1, (distance - 0.12) / 0.58)));
        if (!s.reduced && (s.scroll??0)<.76) opacity=index===0?beat.text:index===1?heroHandoff(s.scroll??0).copy:0;
        if (!s.reduced && index>1 && index<4) opacity*=range(s.stage,index-.36,index-.08);
        if(index===3)opacity*=1-range(ingredients.entry,.04,.28);
        const finalExit=hasDay?day.exit:ingredients.exit;
        if(index===4)opacity*=s.reduced?finalExit:range(finalExit,.68,1);
        panel.style.opacity = String(opacity);
        panel.style.visibility = opacity < 0.001 ? 'hidden' : 'visible';
        panel.style.transform = `translate3d(0,${index===0&&!s.reduced?-(1-beat.text)*75:(index-s.stage)*28}px,0)`;
        panel.inert = index !== nearest||(s.ingredientVisibility??0)>.01||(s.dayVisibility??0)>.01;
        panel.setAttribute('aria-hidden', String(index !== nearest||(s.ingredientVisibility??0)>.5||(s.dayVisibility??0)>.5));
      });
      if (wordmark.current) {
        wordmark.current.style.opacity = String(s.reduced?Math.max(0,1-s.stage*1.7):beat.text);
        wordmark.current.style.transform=s.mobile?'none':`translate3d(0,${s.reduced?0:-(1-beat.text)*120}px,0)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame); trigger.kill(); lenis.current?.destroy();
      motion.removeEventListener('change', initializeMotion); mobile.removeEventListener('change', resize);
      removeEventListener('resize',resize);
      removeEventListener('ingredientnavigate',ingredientNavigate);
      ['--bg', '--ink', '--progress', '--product-x', '--liquid-a', '--liquid-b','--bottle-visibility','--ingredient-camera','--scene-layer'].forEach(key => root.style.removeProperty(key));
    };
  }, [panels, wordmark]);

  const goTo = useCallback((index: number|'ingredients'|'day') => {
    const destination = document.getElementById(typeof index==='string'?index:`chapter-${index}`);
    if (!destination) return;
    if (lenis.current) lenis.current.scrollTo(destination, { duration: 1.35 });
    else destination.scrollIntoView({ behavior: 'instant' });
  }, []);
  return { state, active, reduced, goTo, lenis };
}

import {useEffect,useRef,useState,useCallback,type CSSProperties} from 'react';
import Header from './Header';
import ReservationDialog from './ReservationDialog';
import FilmCanvas,{type FilmState} from './FilmCanvas';
import {content} from './content';
import {film,clamp} from './sequence';
import styles from './Film.module.css';
type Props={cartCount?:number;cartOpen?:boolean;onOpenCart?:()=>void;onAddToBag?:(index:number)=>void;onNavigate?:(path:string,section?:number)=>void;initialSection?:number;navigationToken?:number};
export default function FilmApp({cartCount=0,cartOpen=false,onOpenCart=()=>{},onAddToBag=()=>{},onNavigate=path=>{location.href=path;},initialSection,navigationToken}:Props={}){
 const state=useRef<FilmState>({scroll:0,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches||new URLSearchParams(location.search).get('motion')==='reduce',paused:false});
 const panels=useRef<(HTMLElement|null)[]>([]),word=useRef<HTMLHeadingElement>(null);
 const [active,setActive]=useState(0),[selected,setSelected]=useState(0),[reserve,setReserve]=useState(false);
 const go=useCallback((index:number)=>document.getElementById(`chapter-${index}`)?.scrollIntoView({behavior:state.current.reduced?'instant':'smooth'}),[]);
 useEffect(()=>{if(initialSection!==undefined)go(initialSection);},[initialSection,navigationToken,go]);
 useEffect(()=>{state.current.paused=cartOpen||reserve;},[cartOpen,reserve]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion:reduce)');const change=()=>{state.current.reduced=media.matches||new URLSearchParams(location.search).get('motion')==='reduce';};media.addEventListener('change',change);
  let frame=0,lastActive=-1;const tick=()=>{const scroll=scrollY/innerHeight;state.current.scroll=scroll;
   const at=scroll<film.heroEnd?0:scroll<film.clips[2].range[1]?1:scroll<film.clips[3].range[1]?2:scroll<film.clips[4].range[1]?3:4;
   if(at!==lastActive){lastActive=at;setActive(at);}
   panels.current.forEach((panel,index)=>{if(!panel)return;const opacity=index===0?(state.current.reduced?Number(at===0):Number(scroll<film.textExit[1])):Number(index===at);panel.style.opacity=String(opacity);panel.style.transform=index===0&&!state.current.reduced?`translateY(${clamp((scroll-film.textExit[0])/(film.textExit[1]-film.textExit[0]))*260}px)`:'none';panel.style.visibility=opacity>.001?'visible':'hidden';panel.inert=index!==at||opacity<.5||(index===0&&!state.current.reduced&&scroll>film.textExit[0]);panel.setAttribute('aria-hidden',String(panel.inert));});
   if(word.current){const phase=state.current.reduced?0:clamp((scroll-film.textExit[0])/(film.textExit[1]-film.textExit[0]));word.current.style.visibility=at===0&&phase<1?'visible':'hidden';word.current.style.transform=`translateY(${-phase*220}px)`;}
   frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',change);};
 },[]);
 const open=(index=selected)=>{setSelected(index);setReserve(true);};
 const modalMotion=useCallback((paused:boolean)=>{state.current.paused=paused;},[]);
 return <div className={styles.app} data-active={active} style={{'--film-ink':film.clips[active===0?0:active+1].ink} as CSSProperties}><FilmCanvas state={state}/><a className={styles.skip} href="#chapter-4" onClick={e=>{e.preventDefault();go(4);}}>{content.ui.skip}</a><Header active={active} count={cartCount} onNavigate={(path,index)=>path==='/'?go(index??0):onNavigate(path,index)} onCart={onOpenCart} onReserve={active===4?undefined:()=>open()}/>
 <h1 ref={word} className={styles.wordmark}>{content.brand}.</h1>
 <main>{[0,1,2,3,4].map(index=><section id={`chapter-${index}`} key={index} className={styles.section} aria-label={index===0?'The collection':index===4?'Make it yours':content.products[index-1].name}>
 <div ref={element=>{panels.current[index]=element;}} className={`${styles.panel} ${index===0?styles.hero:index===4?styles.final:styles.chapter}`} inert={index!==active} aria-hidden={index!==active}>
 {index===0?<div className={styles.heroCopy}><div><h2>{content.hero.title.replace('\n',' ')}</h2><p>{content.hero.bottomLeft}</p></div><div><p>Bergamot and neroli. Rose and black tea. Fig leaf and vetiver. Three 50 ml eaux de parfum.</p><button className={styles.primary} onClick={()=>go(1)}>{content.ui.discover}</button><p className={styles.note}>{content.offer.collectionPriceLabel}. {content.offer.included}</p></div></div>:index===4?<div className={styles.finalCopy}><h2>{content.final.title.replace('\n',' ')}</h2><p>{content.products[selected].ingredients.join(', ')}. {content.offer.volume}. {content.offer.edition}.</p><label htmlFor="scent-picker">Choose your scent</label><select id="scent-picker" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{content.products.map((p,i)=><option key={p.id} value={i}>{p.name} — {p.priceLabel}</option>)}</select><p className={styles.price}>{content.products[selected].priceLabel} <span>{content.offer.volume}</span></p><p>{content.offer.included}</p><button className={styles.primary} onClick={()=>open()}>{content.ui.reserve}</button><button className={styles.textButton} onClick={()=>go(0)}>{content.ui.back}</button><p className={styles.note}>{content.final.copyright}</p></div>:<div className={styles.chapterCopy}><h2>{content.products[index-1].title.replace('\n',' ')}</h2><p>{content.products[index-1].description}</p><ul>{content.products[index-1].ingredients.map(ingredient=><li key={ingredient}>{ingredient}</li>)}</ul><button className={styles.primary} onClick={()=>onAddToBag(index-1)}>{content.ui.addToBag} — {content.products[index-1].priceLabel}</button><button className={styles.textButton} onClick={()=>go(index+1)}>{content.ui.next}</button></div>}
 </div></section>)}</main>
 <nav className={styles.chapters} aria-label={content.ui.chapters}>{content.products.map((product,index)=><button key={product.id} aria-current={active===index+1?'step':undefined} onClick={()=>go(index+1)}>{product.name}</button>)}</nav>
 <ReservationDialog open={reserve} onClose={()=>setReserve(false)} onOpenChange={modalMotion} productIndex={selected} onProductChange={setSelected}/></div>;
}


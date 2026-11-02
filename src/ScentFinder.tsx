import { useState } from 'react';
import Header from './Header';
import { content } from './content';
import { usePageFilm } from './usePageFilm';
import { matchScent, scentQuestions, type ScentAnswer } from './scentMatching';
import styles from './PageFilm.module.css';

const ingredients=['citrus-peel','rose-petal','fig-leaf'];
export default function ScentFinder({count,paused,onNavigate,onCart,onAdd}:{count:number;paused:boolean;onNavigate:(path:string,section?:number)=>void;onCart:()=>void;onAdd:(index:number)=>void}) {
  const film=usePageFilm(5,paused),[answers,setAnswers]=useState<ScentAnswer[]>([null,null,null]);
  const match=matchScent(answers),product=content.products[match??0];
  const answer=(question:number,choice:0|1|2)=>{setAnswers(previous=>previous.map((value,index)=>index===question?choice:value));film.goTo(question+2);};
  return <div className={styles.page}>
    <Header current="finder" count={count} onNavigate={onNavigate} onCart={onCart}/>
    <main ref={film.root} className={`${styles.scroll} ${styles.finderScroll}`}>
      <div ref={film.viewport} className={styles.viewport}>
        <section ref={el=>{film.panels.current[0]=el;}} className={`${styles.panel} ${styles.finderHero}`} aria-label="Find your kind of Morrow">
          <div className={styles.photo} style={{backgroundImage:'url(/images/morrow-generated-garden.webp)'}}/><div className={styles.reading}/>
          <div className={styles.copy}><p className={styles.eyebrow}>Your scent / By instinct</p><h1>Find your kind<br/>of Morrow.</h1><p className={styles.body}>Three small choices. One familiar feeling.<br/>Follow what draws you in.</p><button className={styles.primary} onClick={()=>film.goTo(1)}>Find my scent<span>↗</span></button></div>
          <div className={styles.finderBottles} aria-hidden="true">{[1,0,2].map(index=><img key={index} src={`/bottles/${content.products[index].id}-capon.webp`} alt=""/>)}</div>
          <p className={styles.introFoot}>A guide to our three scents. Your instinct has the final say.</p>
        </section>
        {scentQuestions.map((question,q)=><section ref={el=>{film.panels.current[q+1]=el;}} key={question.label} className={`${styles.panel} ${styles.questionScene}`} style={{background:content.products[q].palette.bg}} aria-label={`Question ${q+1}: ${question.label}`} inert aria-hidden="true">
          <img className={styles.questionArt} src={`/ingredients/${ingredients[q]}.webp`} alt=""/>
          <div className={`${styles.copy} ${styles.questionCopy}`}><p className={styles.eyebrow}>0{q+1} / {question.label}</p><h2>{question.title}</h2><p className={styles.body}>{question.prompt}</p>
            <div className={styles.choices} role="group" aria-label={question.prompt}>{question.choices.map((choice,i)=><button type="button" key={choice.label} onClick={()=>answer(q,i as 0|1|2)} aria-pressed={answers[q]===i}><span className={styles.choiceNumber}>0{i+1}</span><span><strong>{choice.label}</strong><small>{choice.detail}</small></span><span className={styles.choiceArrow}>↗</span></button>)}</div>
          </div>
        </section>)}
        <section ref={el=>{film.panels.current[4]=el;}} className={`${styles.panel} ${styles.resultScene}`} style={{background:product.palette.bg}} aria-label="Your scent result" inert aria-hidden="true">
          <img className={styles.resultBottle} src={`/bottles/${product.id}-capon.webp`} alt={match===null?'Morrow First Light bottle':product.imageAlt}/>
          <div className={`${styles.copy} ${styles.resultCopy}`}><p className={styles.eyebrow}>{match===null?'Your instinct is waiting':'Your Morrow / By instinct'}</p><h2>{match===null?<>A little more<br/>about you.</>:product.name+'.'}</h2><p className={styles.body}>{match===null?'Make your three choices to discover the scent that meets you where you are.':product.description}</p>
            {match===null?<button className={styles.primary} onClick={()=>film.goTo(answers.findIndex(value=>value===null)+1)}>Finish my choices<span>↗</span></button>:<><p className={styles.resultNotes}>{product.ingredients.join(' · ')}</p><button className={styles.primary} onClick={()=>onAdd(match)}>Add {product.name} to bag<span>{product.priceLabel}</span></button><button className={styles.textLink} onClick={()=>onNavigate('/',match+1)}>Explore this scent ↗</button></>}
            <button className={styles.textLink} onClick={()=>{setAnswers([null,null,null]);film.goTo(0);}}>Start again</button>
          </div>
        </section>
        <nav className={styles.controls} aria-label="Scent finder chapters">{['Begin','Feeling','Notes','Moment','Your scent'].map((label,i)=><button key={label} onClick={()=>film.goTo(i)} aria-current={film.active===i?'step':undefined}><span>0{i+1} / </span>{label}</button>)}</nav>
      </div>
    </main>
  </div>;
}

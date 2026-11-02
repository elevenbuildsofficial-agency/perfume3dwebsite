import { useRef, useState, type FormEvent } from 'react';
import Header from './Header';
import { usePageFilm } from './usePageFilm';
import styles from './PageFilm.module.css';

export default function Contact({count,paused,onNavigate,onCart}:{count:number;paused:boolean;onNavigate:(path:string,section?:number)=>void;onCart:()=>void}) {
  const film=usePageFilm(2,paused),form=useRef<HTMLFormElement>(null);
  const [status,setStatus]=useState<'idle'|'saved'|'error'>('idle');
  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const data=new FormData(event.currentTarget);
    try{localStorage.setItem('morrow-demo-enquiry-v1',JSON.stringify({name:data.get('name'),email:data.get('email'),topic:data.get('topic'),message:data.get('message'),savedAt:new Date().toISOString()}));setStatus('saved');}
    catch{setStatus('error');}
  };
  return <div className={styles.page}>
    <Header current="contact" count={count} onNavigate={onNavigate} onCart={onCart}/>
    <main ref={film.root} className={`${styles.scroll} ${styles.contactScroll}`}>
      <div ref={film.viewport} className={styles.viewport}>
        <section ref={el=>{film.panels.current[0]=el;}} className={`${styles.panel} ${styles.contactHero}`} aria-label="Contact Morrow">
          <div className={styles.photo}/><div className={styles.reading}/>
          <div className={styles.copy}><p className={styles.eyebrow}>Contact / Morrow</p><h1>Let’s talk<br/>Morrow.</h1><p className={styles.body}>A scent question. A small curiosity.<br/>A conversation waiting to happen.</p><button className={styles.primary} onClick={()=>film.goTo(1)}>Leave us a note<span>↗</span></button></div>
          <div className={styles.cornerNote}><span>A little curiosity. A good beginning.</span><span>Scroll to say hello ↓</span></div>
        </section>
        <section ref={el=>{film.panels.current[1]=el;}} className={`${styles.panel} ${styles.contactFormScene}`} aria-label="Contact form" inert aria-hidden="true">
          <img className={styles.contactLeaf} src="/ingredients/fig-leaf.webp" alt=""/>
          <div className={`${styles.copy} ${styles.formIntro}`}><p className={styles.eyebrow}>A conversation starts here</p><h2>A note,<br/> from you.</h2><p className={styles.body}>Tell us what’s on your mind.<br/>We’re all ears.</p><p className={styles.demoAddress}>support@morrow.example<span>Example address / demo website</span></p></div>
          <div className={styles.formCard} data-lenis-prevent>
            {status==='saved'?<div className={styles.success} role="status"><span>01 / A little anticipation</span><h3>Your note,<br/>previewed.</h3><p>Your demo enquiry is saved on this device. No email has been sent.</p><button className={styles.primary} onClick={()=>{setStatus('idle');form.current?.reset();}}>Write another note<span>↗</span></button></div>:<form ref={form} onSubmit={submit}>
              <div className={styles.formRow}><label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your name"/></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com"/></label></div>
              <label>What’s on your mind?<select name="topic"><option>Scent advice</option><option>The collection</option><option>Something else</option></select></label>
              <label>Your note<textarea name="message" required minLength={10} maxLength={3000} rows={4} placeholder="A little about what you’re looking for…"/></label>
              {status==='error'&&<p role="alert">Your browser couldn’t save this preview. Please try again.</p>}
              <button className={styles.primary} type="submit">Preview enquiry<span>↗</span></button><p className={styles.formNotice}>Demo contact: support@morrow.example. Your note stays on this device; no email is sent.</p>
            </form>}
          </div>
        </section>
        <nav className={styles.controls} aria-label="Contact chapters"><button onClick={()=>film.goTo(0)} aria-current={film.active===0?'step':undefined}>01 / Hello</button><button onClick={()=>film.goTo(1)} aria-current={film.active===1?'step':undefined}>02 / Your note</button><a href="/find-your-morrow/" onClick={e=>{e.preventDefault();onNavigate('/find-your-morrow/');}}>Find your scent ↗</a></nav>
      </div>
    </main>
  </div>;
}

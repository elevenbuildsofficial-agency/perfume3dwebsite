import { useEffect, useRef, useState } from 'react';
import { content } from './content';
import styles from './Header.module.css';

export function BagIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z" stroke="currentColor" strokeWidth="1.4" /><path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function Header({ current = 'home', active = 0, count, onNavigate, onCart, onReserve }: {
  current?: 'home' | 'about' | 'contact' | 'finder'; active?: number; count: number;
  onNavigate: (path: string, section?: number) => void; onCart: () => void; onReserve?: () => void;
}) {
  const [menuOpen,setMenuOpen]=useState(false),menu=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const dialog=menu.current;if(!dialog)return;
    if(!menuOpen){if(dialog.open)dialog.close();return;}
    dialog.showModal();const previous=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    return()=>{document.documentElement.style.overflow=previous;if(dialog.open)dialog.close();};
  },[menuOpen]);
  const navigate=(path:string,section?:number)=>{setMenuOpen(false);onNavigate(path,section);};
  const pageLinks=[{path:'/find-your-morrow/',label:'Find your scent',page:'finder'},{path:'/about/',label:content.ui.about,page:'about'},{path:'/contact/',label:'Contact',page:'contact'}];
  const links=<>{content.nav.slice(0,2).map(item=><a key={item.section} href={`/#chapter-${item.section}`} onClick={event=>{event.preventDefault();navigate('/',item.section);}} aria-current={current==='home'&&(item.section===active||(item.section===1&&active>0&&active<4))?'location':undefined}>{item.label}</a>)}{pageLinks.map(item=><a key={item.path} href={item.path} onClick={event=>{event.preventDefault();navigate(item.path);}} aria-current={current===item.page?'page':undefined}>{item.label}</a>)}</>;
  return <header className={styles.header}><div className={styles.bar}>
    <a className={styles.logo} href="/" onClick={event => { event.preventDefault(); onNavigate('/', 0); }} aria-label={content.ui.home}>{content.brand}<span /></a>
    <nav className={styles.nav} aria-label={content.ui.menu}>
      {links}
    </nav>
    <div className={styles.actions}>
      <button type="button" className={styles.menuButton} onClick={()=>setMenuOpen(true)} aria-label="Open navigation" aria-haspopup="dialog"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.5"/></svg></button>
      <button type="button" className={styles.bag} onClick={()=>{setMenuOpen(false);onCart();}} aria-label={`${content.ui.openBag}, ${count}`}><BagIcon /><span className={styles.bagWord}>{content.ui.bag}</span><span className={styles.count}>{count}</span></button>
      {onReserve && <button className={styles.reserve} onClick={onReserve}>{content.ui.reserve}<span /></button>}
    </div>
  </div><dialog ref={menu} className={styles.menuDialog} aria-labelledby="menu-title" onCancel={()=>setMenuOpen(false)} onClose={()=>setMenuOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setMenuOpen(false);}} data-lenis-prevent><div className={styles.menuSheet}><div className={styles.menuTop}><h2 id="menu-title">Morrow, by instinct.</h2><button onClick={()=>setMenuOpen(false)} aria-label="Close navigation">×</button></div><nav aria-label="Mobile navigation">{links}</nav><p>Three scents. One instinct.</p></div></dialog></header>;
}

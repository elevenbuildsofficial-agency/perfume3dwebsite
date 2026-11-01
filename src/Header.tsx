import { content } from './content';
import styles from './Header.module.css';

export function BagIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z" stroke="currentColor" strokeWidth="1.4" /><path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function Header({ current = 'home', active = 0, count, onNavigate, onCart, onReserve }: {
  current?: 'home' | 'about'; active?: number; count: number;
  onNavigate: (path: string, section?: number) => void; onCart: () => void; onReserve?: () => void;
}) {
  return <header className={styles.header}><div className={styles.bar}>
    <a className={styles.logo} href="/" onClick={event => { event.preventDefault(); onNavigate('/', 0); }} aria-label={content.ui.home}>{content.brand}<span /></a>
    <nav className={styles.nav} aria-label={content.ui.menu}>
      {content.nav.slice(0, 2).map(item => <a key={item.section} href={`/#chapter-${item.section}`} onClick={event => { event.preventDefault(); onNavigate('/', item.section); }} aria-current={current === 'home' && (item.section === active || (item.section === 1 && active > 0 && active < 4)) ? 'location' : undefined}>{item.label}</a>)}
      <a href="/about/" onClick={event => { event.preventDefault(); onNavigate('/about/'); }} aria-current={current === 'about' ? 'page' : undefined}>{content.ui.about}</a>
    </nav>
    <div className={styles.actions}>
      <a className={styles.mobileAbout} href="/about/" onClick={event => { event.preventDefault(); onNavigate('/about/'); }}>{content.ui.about}</a>
      <button type="button" className={styles.bag} onClick={onCart} aria-label={`${content.ui.openBag}, ${count}`}><BagIcon /><span className={styles.bagWord}>{content.ui.bag}</span><span className={styles.count}>{count}</span></button>
      {onReserve && <button className={styles.reserve} onClick={onReserve}>{content.ui.reserve}<span /></button>}
    </div>
  </div></header>;
}

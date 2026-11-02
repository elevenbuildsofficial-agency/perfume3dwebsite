import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { content } from './content';
import { useStory } from './story';
import PhotographicScene, { ProductFallback } from './PhotographicScene';
import AmbientBackground from './AmbientBackground';
import IngredientStory from './IngredientStory';
import LifestyleStory from './LifestyleStory';
import CollectionGallery from './CollectionGallery';
import Header, { BagIcon } from './Header';
import styles from './App.module.css';

const Scene = lazy(() => import('./Scene'));
const lines = (text: string) => text.split('\n').map((line, index) => <span key={index}>{line}</span>);

function Arrow({ down = false }: { down?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={down ? { transform: 'rotate(90deg)' } : undefined}><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

function Mark() {
  return <svg viewBox="0 0 42 42" aria-hidden="true" fill="none"><path d="M6 31V16c0-11 15-11 15 0v15-15c0-11 15-11 15 0v15" stroke="currentColor" strokeWidth="2.1" /><path d="M2 35h38" stroke="currentColor" strokeWidth="1" /></svg>;
}

function Botanical({ kind }: { kind: string }) {
  return <svg className={styles.botanical} viewBox="0 0 110 110" fill="none" stroke="currentColor" strokeWidth="0.9" aria-hidden="true">
    {kind === 'citrus' ? <>
      <circle cx="55" cy="60" r="33" /><circle cx="55" cy="60" r="28" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d="M55 60L55 33" transform={`rotate(${i * 40} 55 60)`} />)}
      <path d="M55 26C51 12 68 8 77 12 72 24 65 30 55 26ZM55 26l9-9" />
    </> : kind === 'flower' ? <>
      {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx="55" cy="34" rx="13" ry="23" transform={`rotate(${i * 72} 55 55)`} />)}
      <circle cx="55" cy="55" r="9" /><path d="M55 66v39M55 91c-19 0-27-9-25-18 14 1 25 8 25 18" />
    </> : <>
      <path d="M54 104l5-94M57 73L26 47M57 73l32-25M58 49L35 28M58 49l25-23M56 94L20 68M56 94l36-24" />
      {Array.from({ length: 5 }, (_, i) => <g key={i} transform={`translate(0 ${i * 11})`}><path d="M56 31l-12-5M58 32l14-7M56 33l-8 5M58 35l10 2" /></g>)}
    </>}
  </svg>;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <ProductFallback /> : this.props.children; }
}

function ReservationDialog({ open, onClose, onOpenChange, productIndex, onProductChange }: { open: boolean; onClose: () => void; onOpenChange: (open: boolean) => void; productIndex: number; onProductChange: (index: number) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const c = content.reservation;
  const product = content.products[productIndex];
  useEffect(() => { if (status === 'success') successHeading.current?.focus(); }, [status]);
  useEffect(() => {
    if (!open || !dialog.current) return;
    setStatus('idle'); setError('');
    const node = dialog.current;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    node.showModal(); onOpenChange(true);
    return () => { node.close(); document.documentElement.style.overflow = previous; onOpenChange(false); controller.current?.abort(); };
  }, [open, onOpenChange]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    setStatus('pending');
    if (!c.endpoint) {
      try { localStorage.setItem(c.storageKey, JSON.stringify({ email, product: product.sku, fragrance: product.name, savedAt: new Date().toISOString() })); setStatus('success'); }
      catch { setError(c.storageError); setStatus('error'); }
      return;
    }
    controller.current = new AbortController();
    try {
      const response = await fetch(c.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, product: product.sku }), signal: controller.current.signal });
      if (!response.ok) throw new Error(String(response.status));
      setStatus('success');
    } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) { setError(c.error); setStatus('error'); } }
  };
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="reserve-title" aria-describedby="reserve-description" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <button type="button" className={styles.close} onClick={onClose} aria-label={content.ui.close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.5" /></svg></button>
    <div className={styles.dialogMark}><Mark /></div>
    <p className={styles.dialogEdition}>{product.name} <span>{content.offer.descriptor}</span></p>
    <h2 id="reserve-title" ref={successHeading} tabIndex={-1}>{lines(status === 'success' ? c.successTitle : c.title)}</h2>
    <p id="reserve-description">{status === 'success' ? (c.endpoint ? c.liveSuccess : c.localSuccess) : c.description}</p>
    {status === 'success' ? <div role="status" className={styles.success}><span>✓</span>{c.successMark}<button className={styles.textLink} onClick={onClose}>{content.ui.back}</button></div> : <form onSubmit={submit}>
      <label htmlFor="reserve-fragrance">{c.productLabel}</label>
      <select id="reserve-fragrance" value={productIndex} onChange={event => onProductChange(Number(event.target.value))} disabled={status === 'pending'}>{content.products.map((item, index) => <option value={index} key={item.id}>{item.name} · {item.priceLabel}</option>)}</select>
      <label htmlFor="reserve-email">{c.emailLabel}</label>
      <input id="reserve-email" name="email" type="email" placeholder={c.emailPlaceholder} autoComplete="email" required maxLength={254} disabled={status === 'pending'} />
      <button type="submit" className={styles.primary} disabled={status === 'pending'}>{status === 'pending' ? c.pending : c.submit}<Arrow /></button>
      {status === 'error' && <p role="alert" className={styles.error}>{error}</p>}
      <small>{c.endpoint ? c.liveNotice : c.demoNotice}</small>
    </form>}
    <div className={styles.dialogOffer}><span>{content.offer.volume}</span><span>{product.priceLabel}</span></div>
  </dialog>;
}

export default function App({ heroModelUrl, cartCount = 0, cartOpen = false, onOpenCart = () => {}, onAddToBag = () => {}, onNavigate = path => { location.href = path; }, initialSection, navigationToken = 0 }: {
  heroModelUrl?: string; cartCount?: number; cartOpen?: boolean; onOpenCart?: () => void;
  onAddToBag?: (index: number) => void; onNavigate?: (path: string, section?: number) => void;
  initialSection?: number; navigationToken?: number;
} = {}) {
  const panels = useRef<(HTMLElement | null)[]>([]);
  const wordmark = useRef<HTMLDivElement>(null);
  const { state, active, reduced, goTo, lenis } = useStory(panels, wordmark);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [webglFailed, setWebglFailed] = useState(() => new URLSearchParams(location.search).has('fallback'));
  const failed = useCallback(() => setWebglFailed(true), []);
  const modalMotion = useCallback((open: boolean) => { state.current.paused = open; if (open) lenis.current?.stop(); else lenis.current?.start(); }, [state, lenis]);
  useEffect(() => { modalMotion(cartOpen); }, [cartOpen, modalMotion]);
  useEffect(() => { if (initialSection === undefined) return; const frame = requestAnimationFrame(() => goTo(initialSection)); return () => cancelAnimationFrame(frame); }, [initialSection, navigationToken, goTo]);
  const openReservation = (index = Math.max(0, Math.min(2, active - 1))) => { setSelectedProduct(index); setReserveOpen(true); };
  const register = (index: number) => (element: HTMLElement | null) => { panels.current[index] = element; };
  return <div className={styles.app} data-reduced-motion={reduced} style={{ '--font': `"${content.font.family}", ${content.font.fallback}` } as CSSProperties}>
    <AmbientBackground story={state} reduced={reduced} grounded />
    <a className={styles.skip} href="#chapter-0" onClick={() => goTo(0)}>{content.ui.skip}</a>
    <Header active={active} count={cartCount} onNavigate={(path, section) => { if (path === '/') goTo(section ?? 0); else onNavigate(path); }} onCart={onOpenCart} onReserve={() => openReservation()} />

    <div ref={wordmark} className={styles.wordmark} aria-hidden="true">{content.brand}</div>
    <div className={styles.scene} aria-hidden="true">
      {(!heroModelUrl && content.scene.renderMode === 'photographic') || webglFailed ? <PhotographicScene story={state} /> : <SceneBoundary><Suspense fallback={<ProductFallback />}><Scene story={state} modelUrl={heroModelUrl} onFailure={failed} /></Suspense></SceneBoundary>}
    </div>

    <main>
      <section id="chapter-0" className={styles.section} aria-label={content.nav[0].label} tabIndex={-1}>
        <div ref={register(0)} className={`${styles.panel} ${styles.hero}`}>
          <h1 className={styles.srOnly}>{content.brand}. {content.tagline}</h1>
          <p className={styles.heroKicker}><span className={styles.smallDot} />{content.hero.kicker}</p>
          <div className={styles.editionSeal} aria-hidden="true"><Mark /><span>{content.offer.edition}</span></div>
          <div className={styles.heroLeft}><h2>{lines(content.hero.title)}</h2><p>{content.hero.bottomLeft}</p></div>
          <div className={styles.heroRight}><div className={styles.offerHeading}><span>{content.offer.name}</span><span>{content.offer.volume}</span></div><p className={styles.heroDescription}>{lines(content.hero.description)}</p><button className={styles.primary} onClick={() => goTo(1)}>{content.ui.discover}<Arrow /></button><p className={styles.priceLine}>{content.offer.collectionPriceLabel}<span>{content.offer.included}</span></p></div>
          <button className={styles.scrollPrompt} onClick={() => goTo(1)}><span className={styles.scrollCircle}><Arrow down /></span><span>{content.ui.scroll}</span></button>
        </div>
      </section>

      {content.chapters.map((chapter, index) => <section id={`chapter-${index + 1}`} key={chapter.id} className={styles.section} aria-label={chapter.name}>
        <article ref={register(index + 1)} className={`${styles.panel} ${styles.chapter} ${chapter.side === 'right' ? styles.right : ''}`} inert aria-hidden="true">
          <div className={styles.chapterTop}><span>{content.ui.scrollHint}</span><span>{chapter.number} / {String(content.chapters.length).padStart(2, '0')}</span></div>
          <div className={styles.chapterCopy}>
            <div className={styles.chapterEyebrow}><span>{chapter.number}</span><span>{chapter.name}</span><Botanical kind={chapter.botanical} /></div>
            <h2>{lines(chapter.title)}</h2><p className={styles.chapterDescription}>{chapter.description}</p>
            <ul className={styles.ingredients}>{chapter.ingredients.map((ingredient, ingredientIndex) => <li key={ingredient}><span>0{ingredientIndex + 1}</span>{ingredient}</li>)}</ul>
            <div className={styles.chapterTime}><span className={styles.smallDot} /><span>{chapter.time}</span><button className={styles.chapterBuy} onClick={() => onAddToBag(index)} aria-label={`${content.ui.addToBag}: ${chapter.name}`}><span>{content.ui.addToBag}</span><span>{chapter.priceLabel}</span><BagIcon /></button></div>
          </div>
          <p className={styles.chapterNote}>{chapter.note}</p>
          <button className={styles.nextChapter} onClick={() => goTo(index < 2 ? index + 2 : 'ingredients')} aria-label={`${content.ui.next}: ${index < 2 ? content.chapters[index + 1].name : 'The ingredient story'}`}><Arrow down /></button>
        </article>
      </section>)}

      <IngredientStory story={state} onScent={goTo} onCollection={()=>goTo('gallery')} />
      <CollectionGallery story={state} onScent={goTo} onContinue={()=>goTo('day')}/>
      <LifestyleStory story={state} onFind={()=>onNavigate('/find-your-morrow/')} onContinue={()=>goTo(4)}/>

      <section id="chapter-4" className={styles.section} aria-label={content.nav[2].label}>
        <div ref={register(4)} className={`${styles.panel} ${styles.final}`} inert aria-hidden="true">
          <p className={styles.heroKicker}><span className={styles.smallDot} />{content.final.kicker}</p>
          <div className={styles.finalLeft}><h2>{lines(content.final.title)}</h2><p>{lines(content.final.description)}</p><a className={styles.finalFinder} href="/find-your-morrow/" onClick={e=>{e.preventDefault();onNavigate('/find-your-morrow/');}}>Find my scent <span>↗</span></a></div>
          <div className={styles.finalRight}><p className={styles.finalProduct}>{content.brand} <span>{content.offer.collectionCount}</span></p><p>{content.offer.details}</p><div className={styles.finalPrice}>{content.offer.collectionPriceLabel}<span>{content.offer.included}</span></div><button className={styles.primary} onClick={() => openReservation()}>{content.ui.reserve}<Arrow /></button><p className={styles.finalFootnote}>{content.final.footnote}</p></div>
          <footer className={styles.footer}><a href="#chapter-0" onClick={event => { event.preventDefault(); goTo(0); }}><Mark /><span>{content.ui.back}</span></a><span>{content.final.copyright}</span></footer>
        </div>
      </section>
    </main>

    <div className={styles.progress} role="progressbar" aria-label={content.ui.progress} aria-valuemin={0} aria-valuemax={7} aria-valuenow={active}><span /></div>
    <nav className={styles.chapterNav} aria-label={content.ui.chapters} inert={active>=4&&active<=6} aria-hidden={active>=4&&active<=6} style={{visibility:active>=4&&active<=6?'hidden':undefined}}>{content.chapters.map((chapter, index) => <button key={chapter.id} onClick={() => goTo(index + 1)} aria-label={chapter.short} aria-current={active === index + 1 ? 'step' : undefined}><span>{chapter.number}</span><i /></button>)}</nav>
    <div className={`${styles.pageIndex} ${active > 0 ? styles.hideIndex : ''}`} aria-hidden="true"><span>0{active + 1}</span><i />{String(content.chapters.length + 5).padStart(2, '0')}</div>
    <ReservationDialog open={reserveOpen} onClose={() => setReserveOpen(false)} onOpenChange={modalMotion} productIndex={selectedProduct} onProductChange={setSelectedProduct} />
  </div>;
}

import {useEffect,useRef,useState,type FormEvent} from 'react';
import {content} from './content';
import styles from './App.module.css';
const lines=(text:string)=>text.split('\n').map((line,index)=><span key={index}>{line}</span>);
function Mark() {
  return <svg viewBox="0 0 42 42" aria-hidden="true" fill="none"><path d="M6 31V16c0-11 15-11 15 0v15-15c0-11 15-11 15 0v15" stroke="currentColor" strokeWidth="2.1" /><path d="M2 35h38" stroke="currentColor" strokeWidth="1" /></svg>;
}


export default function ReservationDialog({ open, onClose, onOpenChange, productIndex, onProductChange }: { open: boolean; onClose: () => void; onOpenChange: (open: boolean) => void; productIndex: number; onProductChange: (index: number) => void }) {
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
      <button type="submit" className={styles.primary} disabled={status === 'pending'}>{status === 'pending' ? c.pending : c.submit}</button>
      {status === 'error' && <p role="alert" className={styles.error}>{error}</p>}
      <small>{c.endpoint ? c.liveNotice : c.demoNotice}</small>
    </form>}
    <div className={styles.dialogOffer}><span>{content.offer.volume}</span><span>{product.priceLabel}</span></div>
  </dialog>;
}


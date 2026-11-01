import { useEffect, useRef, useState, type FormEvent } from 'react';
import { content } from './content';
import { money, type CartState } from './cart';
import styles from './CartDrawer.module.css';

export default function CartDrawer({ open, cart, onClose, onContinue }: { open: boolean; cart: CartState; onClose: () => void; onContinue: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [reserve, setReserve] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const c = content.cart;
  useEffect(() => {
    if (!open || !dialog.current) return;
    const node = dialog.current; const overflow = document.documentElement.style.overflow;
    setReserve(false); setSaved(false); setError(false);
    document.documentElement.style.overflow = 'hidden'; node.showModal();
    return () => { node.close(); document.documentElement.style.overflow = overflow; };
  }, [open]);
  useEffect(() => { if (saved) heading.current?.focus(); }, [saved]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '').trim();
    try { localStorage.setItem(c.reservationKey, JSON.stringify({ email, items: cart.lines, subtotal: cart.total, savedAt: new Date().toISOString() })); setSaved(true); }
    catch { setError(true); }
  };
  return <dialog ref={dialog} className={styles.drawer} data-lenis-prevent aria-labelledby="bag-title" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <div className={styles.top}><span>{content.brand}</span><button aria-label={c.close} onClick={onClose}>×</button></div>
    <h2 id="bag-title" ref={heading} tabIndex={-1}>{saved ? c.saved : c.title}<span>{saved ? '' : String(cart.count).padStart(2, '0')}</span></h2>
    {saved ? <div className={styles.empty} role="status"><p>{c.success}</p><button className={styles.primary} onClick={onContinue}>{c.continue}</button></div> : cart.items.length === 0 ? <div className={styles.empty}><h3>{c.emptyTitle}</h3><p>{c.emptyCopy}</p><button className={styles.primary} onClick={onContinue}>{c.continue}</button></div> : <>
      <ul className={styles.items}>{cart.items.map(({ product, quantity }) => <li key={product.sku}>
        <img src={product.imageSmall} alt={product.imageAlt} />
        <div className={styles.itemInfo}><p className={styles.number}>{product.number} / {content.offer.descriptor}</p><h3>{product.name}</h3><p>{content.offer.volume}</p><div className={styles.controls}>
          <div className={styles.quantity}><button aria-label={`${c.decrease}: ${product.name}`} disabled={quantity === 1} onClick={() => cart.update(product.sku, quantity - 1)}>−</button><span aria-live="polite">{quantity}</span><button aria-label={`${c.increase}: ${product.name}`} disabled={quantity === 9} onClick={() => cart.update(product.sku, quantity + 1)}>+</button></div>
          <button className={styles.remove} onClick={() => cart.remove(product.sku)} aria-label={`${c.remove}: ${product.name}`}>{c.remove}</button>
        </div></div><span className={styles.itemPrice}>{money(product.price * quantity)}</span>
      </li>)}</ul>
      <div className={styles.summary}><div className={styles.total}><span>{c.subtotal}</span><strong>{money(cart.total)}</strong></div>
        {reserve ? <form onSubmit={submit}><label htmlFor="bag-email">{c.email}</label><input id="bag-email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder={c.placeholder} /><button className={styles.primary} type="submit">{c.submit}</button>{error && <p role="alert">{c.error}</p>}</form> : <button className={styles.primary} onClick={() => setReserve(true)}>{c.reserve}<span>↗</span></button>}
        <p className={styles.notice}>{c.notice}</p>
      </div>
    </>}
  </dialog>;
}

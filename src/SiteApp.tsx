import { useEffect, useState, type CSSProperties } from 'react';
import App from './App';
import About from './About';
import CartDrawer from './CartDrawer';
import { content } from './content';
import { useCart } from './cart';
import styles from './SiteApp.module.css';

const isAbout = () => location.pathname.replace(/\/+$/, '') === '/about';

export default function SiteApp() {
  const [route, setRoute] = useState({ about: isAbout(), section: undefined as number | undefined, token: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const cart = useCart();
  const navigate = (path: string, section?: number) => {
    const about = path.startsWith('/about');
    history.pushState({}, '', about ? '/about/' : section ? `/#chapter-${section}` : '/');
    if (about !== route.about) window.scrollTo({ top: 0, behavior: 'instant' });
    setCartOpen(false); setRoute(previous => ({ about, section, token: previous.token + 1 }));
  };
  useEffect(() => {
    const pop = () => { const parsed = Number(location.hash.replace('#chapter-', '')); setCartOpen(false); setRoute(previous => ({ about: isAbout(), section: Number.isFinite(parsed) ? parsed : undefined, token: previous.token + 1 })); };
    addEventListener('popstate', pop); return () => removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    const title = route.about ? content.about.seoTitle : content.seo.title;
    const description = route.about ? content.about.seoDescription : content.seo.description;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }, [route.about]);
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timeout); }, [toast]);
  const add = (index: number) => { const product = content.products[index]; cart.add(product.sku); setToast(`${product.name} ${content.cart.added}`); };
  return <div className={styles.shell} style={{ '--font': `"${content.font.family}", ${content.font.fallback}` } as CSSProperties}>
    {route.about ? <About count={cart.count} paused={cartOpen} onNavigate={navigate} onCart={() => setCartOpen(true)} /> : <App cartCount={cart.count} cartOpen={cartOpen} onOpenCart={() => setCartOpen(true)} onAddToBag={add} onNavigate={navigate} initialSection={route.section} navigationToken={route.token} />}
    <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onContinue={() => { setCartOpen(false); navigate('/', 1); }} />
    {toast && <div className={styles.toast} role="status"><span>{toast}</span><button onClick={() => { setToast(''); setCartOpen(true); }}>{content.ui.viewBag}</button></div>}
  </div>;
}

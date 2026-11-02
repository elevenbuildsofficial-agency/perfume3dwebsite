import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import App from './App';
import About from './About';
import CartDrawer from './CartDrawer';
import { content } from './content';
import { useCart } from './cart';
import styles from './SiteApp.module.css';
import { pageFromPath, pageMetadata } from './pageMetadata';

const Contact=lazy(()=>import('./Contact'));
const ScentFinder=lazy(()=>import('./ScentFinder'));
const initialSection=()=>{const match=location.hash.match(/^#chapter-(\d)$/);return match?Number(match[1]):undefined;};

export default function SiteApp() {
  const [route, setRoute] = useState({ page: pageFromPath(location.pathname), section: initialSection(), token: 0 });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const cart = useCart();
  const navigate = (path: string, section?: number) => {
    const page=pageFromPath(path);
    history.pushState({}, '', page==='home'&&section!==undefined?`/#chapter-${section}`:pageMetadata[page].path);
    if(page!==route.page)window.scrollTo({top:0,behavior:'instant'});
    setCartOpen(false);setRoute(previous=>({page,section,token:previous.token+1}));
  };
  useEffect(() => {
    const pop=()=>{setCartOpen(false);setRoute(previous=>({page:pageFromPath(location.pathname),section:initialSection(),token:previous.token+1}));};
    addEventListener('popstate', pop); return () => removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    const {title,description,path}=pageMetadata[route.page];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',content.seo.siteUrl+path);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',content.seo.siteUrl+path);
  }, [route.page]);
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timeout); }, [toast]);
  const add = (index: number) => { const product = content.products[index]; cart.add(product.sku); setToast(`${product.name} ${content.cart.added}`); };
  return <div className={styles.shell} style={{ '--font': `"${content.font.family}", ${content.font.fallback}` } as CSSProperties}>
    <Suspense fallback={<div className={styles.routeLoading}>Morrow<span>A little anticipation.</span></div>}>
      {route.page==='about'?<About count={cart.count} paused={cartOpen} onNavigate={navigate} onCart={()=>setCartOpen(true)}/>:route.page==='contact'?<Contact count={cart.count} paused={cartOpen} onNavigate={navigate} onCart={()=>setCartOpen(true)}/>:route.page==='finder'?<ScentFinder count={cart.count} paused={cartOpen} onNavigate={navigate} onCart={()=>setCartOpen(true)} onAdd={add}/>:<App cartCount={cart.count} cartOpen={cartOpen} onOpenCart={()=>setCartOpen(true)} onAddToBag={add} onNavigate={navigate} initialSection={route.section} navigationToken={route.token}/>}
    </Suspense>
    <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onContinue={() => { setCartOpen(false); navigate('/', 1); }} />
    {toast && <div className={styles.toast} role="status"><span>{toast}</span><button onClick={() => { setToast(''); setCartOpen(true); }}>{content.ui.viewBag}</button></div>}
  </div>;
}

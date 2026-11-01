import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { content } from './src/content';
import { fileURLToPath } from 'node:url';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export default defineConfig({
  plugins: [react(), {
    name: 'content-metadata',
    transformIndexHtml(_html, context) {
      const { seo, offer } = content;
      const about = context.path.startsWith('/about') || context.filename.replace(/\\/g, '/').includes('/about/');
      const title = about ? content.about.seoTitle : seo.title;
      const description = about ? content.about.seoDescription : seo.description;
      const url = `${seo.siteUrl}${about ? '/about/' : ''}`;
      return [
        { tag: 'title', children: title, injectTo: 'head' },
        ...Object.entries({ description, 'og:title': title, 'og:description': description, 'og:type': about ? 'website' : 'product', 'og:site_name': content.brand, 'og:locale': seo.locale, 'og:image': `${seo.siteUrl}${seo.image}`, ...(seo.siteUrl ? { 'og:url': url } : {}), 'twitter:card': 'summary_large_image' }).map(([name, value]) => ({ tag: 'meta', attrs: { [name.startsWith('og:') ? 'property' : 'name']: name, content: escape(value) }, injectTo: 'head' as const })),
        ...(seo.siteUrl ? [{ tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' as const }] : []),
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify({ '@context': 'https://schema.org', '@graph': content.products.map(product => ({ '@type': 'Product', name: `${content.brand} ${product.name}`, description: product.description, brand: { '@type': 'Brand', name: content.brand }, sku: product.sku, ...(seo.siteUrl ? { image: `${seo.siteUrl}${product.image}`, url: `${seo.siteUrl}/#chapter-${content.products.indexOf(product) + 1}` } : {}), offers: { '@type': 'Offer', price: product.price, priceCurrency: offer.currency, availability: 'https://schema.org/PreOrder' } })) }).replace(/</g, '\\u003c'), injectTo: 'head' },
      ];
    },
  }],
  build: {
    rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), about: fileURLToPath(new URL('./about/index.html', import.meta.url)) }, output: { manualChunks(id) {
      if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'react-vendor';
      if (id.includes('/three/build/three.core.js')) return 'three-core';
      if (id.includes('/node_modules/three/')) return 'three-webgl';
      if (id.includes('/@react-three/')) return 'react-three';
      if (id.includes('/gsap/') || id.includes('/lenis/')) return 'motion';
    } } },
  },
});

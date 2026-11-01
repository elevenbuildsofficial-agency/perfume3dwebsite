import { useEffect, useState } from 'react';
import { content } from './content';

export type CartLine = { sku: string; quantity: number };
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: content.offer.currency, maximumFractionDigits: 0 }).format(value);

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(content.cart.storageKey) || '[]');
      if (!Array.isArray(stored)) return [];
      const quantities = new Map<string, number>();
      stored.forEach(line => {
        if (content.products.some(product => product.sku === line?.sku) && Number.isInteger(line.quantity) && line.quantity > 0) quantities.set(line.sku, Math.min(9, line.quantity));
      });
      return [...quantities].map(([sku, quantity]) => ({ sku, quantity }));
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(content.cart.storageKey, JSON.stringify(lines)); } catch { /* The current-session bag still works without storage. */ } }, [lines]);
  const add = (sku: string) => setLines(previous => {
    const existing = previous.find(line => line.sku === sku);
    return existing ? previous.map(line => line.sku === sku ? { ...line, quantity: Math.min(9, line.quantity + 1) } : line) : [...previous, { sku, quantity: 1 }];
  });
  const update = (sku: string, quantity: number) => setLines(previous => previous.map(line => line.sku === sku ? { ...line, quantity: Math.max(1, Math.min(9, quantity)) } : line));
  const remove = (sku: string) => setLines(previous => previous.filter(line => line.sku !== sku));
  const items = lines.map(line => ({ ...line, product: content.products.find(product => product.sku === line.sku)! }));
  return { lines, items, add, update, remove, count: lines.reduce((sum, line) => sum + line.quantity, 0), total: items.reduce((sum, item) => sum + item.quantity * item.product.price, 0) };
}

export type CartState = ReturnType<typeof useCart>;

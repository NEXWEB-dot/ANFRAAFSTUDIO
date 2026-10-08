// Sanity catalog: bounded browser cache backed by the shared server CDN cache.

import { safeImageURL } from './safety.js';

const LS_KEY = 'catalog:sanity:v3';
const FRESH_MS = 15 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;
let inFlight;

export const DEFAULT_CATALOG = {count: 0, version: 2, source: 'sanity', generated_at: '1970-01-01T00:00:00Z', products: []};

export function normalizeCatalog(c) {
  if (!c || !Array.isArray(c.products) || !Number.isFinite(Date.parse(c.generated_at))) return null;
  const products = [];
  const ids = new Set();
  for (const p of c.products) {
    if (!p || typeof p.id !== 'string' || typeof p.slug !== 'string' ||
        typeof p.name !== 'string' || typeof p.price !== 'number' && typeof p.price !== 'string' ||
        !Number.isFinite(Number(p.price)) || Number(p.price) < 0) return null;
    if (ids.has(p.id) || p.is_active === false) continue;
    ids.add(p.id);
    products.push({ ...p, price: Number(p.price), name: p.name.slice(0, 200),
      description: typeof p.description === 'string' ? p.description : '',
      category: typeof p.category === 'string' ? p.category : '',
      in_stock: p.in_stock === true && (!p.track_stock || Number(p.stock) > 0),
      images: (Array.isArray(p.images) ? p.images : []).filter(Boolean).map((i) => ({
        url: safeImageURL(i.url), thumb: safeImageURL(i.thumb || i.thumb_url), alt: typeof i.alt === 'string' ? i.alt : p.name,
      })).filter((i) => i.url),
    });
  }
  return { ...c, count: products.length, products };
}



async function getJson(url, ms) {
  const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/** Retained for existing renderers; only normalizes the Sanity catalog. */
export function mergeAdminProducts(cat) {
  // Browser preview edits are never a source of truth for the storefront.
  return normalizeCatalog(cat);
}

/**
 * Load Sanity products with browser caching and concurrent request deduplication.
 */
export async function loadCatalog(render = () => {}) {
  let entry;
  try { entry = JSON.parse(localStorage.getItem(LS_KEY)); } catch {}
  const age = Date.now() - entry?.ts;
  const cached = age >= 0 && age < STALE_MS && entry?.data?.source === 'sanity' ? normalizeCatalog(entry.data) : null;
  if (cached) {
    render(cached, 'cache');
    if (age < FRESH_MS) return cached;
  }
  try {
    if (!inFlight) {
      inFlight = getJson('/api/catalog', 12000).then(raw => {
        const data = normalizeCatalog(raw);
        if (!data || data.source !== 'sanity') throw new Error('Invalid Sanity catalog');
        try { localStorage.setItem(LS_KEY, JSON.stringify({data, ts: Math.min(Date.now(), Date.parse(data.generated_at))})); } catch {}
        return data;
      }).finally(() => { inFlight = null; });
    }
    const data = await inFlight;
    render(data, 'live');
    return data;
  } catch {
    // Keep only a bounded last-known Sanity snapshot. Never resurrect demo/Supabase products.
    if (cached) return cached;
    const empty = {source: 'sanity', count: 0, products: [], generated_at: new Date().toISOString(), unavailable: true};
    render(empty, 'unavailable');
    return empty;
  }
}

export function getProductBySlug(catalog, slug) {
  const cat = mergeAdminProducts(catalog || DEFAULT_CATALOG);
  const list = cat?.products || DEFAULT_CATALOG.products;
  return list.find((p) => p.slug === slug) ?? null;
}

export function getByCategory(catalog, category) {
  const cat = mergeAdminProducts(catalog || DEFAULT_CATALOG);
  const list = cat?.products || DEFAULT_CATALOG.products;
  if (!category) return list;
  const key = (value) => value.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/^embroidery$/, 'embroidered');
  return list.filter((p) => (p.filters?.length ? p.filters : [p.category || '']).some(filter => key(filter) === key(category)));
}

export function getCategories(catalog) {
  const cat = mergeAdminProducts(catalog || DEFAULT_CATALOG);
  const list = cat?.products || DEFAULT_CATALOG.products;
  return [...new Set(list.flatMap((p) => p.filters?.length ? p.filters : [p.category]).filter(Boolean))];
}

// Public Sanity CDN reads work on static hosts, including GitHub Pages.
// Fresh snapshots last five minutes; outages may use a snapshot for 24 hours.

import { safeImageURL } from './safety.js';
import {sanityURL, normalizeSanity} from './sanity-source.js';

const LS_KEY   = 'catalog:sanity:v5';
const FRESH_MS = 5 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;

let inFlight;

export const DEFAULT_CATALOG = {
  count: 0, version: 2, source: 'sanity',
  generated_at: '1970-01-01T00:00:00Z', products: [],
};

export function normalizeCatalog(c) {
  if (!c || !Array.isArray(c.products) || !Number.isFinite(Date.parse(c.generated_at))) return null;
  const products = [];
  const ids = new Set();
  for (const p of c.products) {
    if (!p || typeof p.id !== 'string' || typeof p.slug !== 'string' ||
        typeof p.name !== 'string' ||
        (typeof p.price !== 'number' && typeof p.price !== 'string') ||
        !Number.isFinite(Number(p.price)) || Number(p.price) < 0) return null;
    if (ids.has(p.id) || p.is_active === false) continue;
    ids.add(p.id);
    products.push({
      ...p,
      price: Number(p.price),
      name: p.name.slice(0, 200),
      description: typeof p.description === 'string' ? p.description : '',
      category: typeof p.category === 'string' ? p.category : '',
      in_stock: p.in_stock === true && (!p.track_stock || Number(p.stock) > 0),
      images: (Array.isArray(p.images) ? p.images : [])
        .filter(Boolean)
        .map(i => ({
          url:   safeImageURL(i.url),
          thumb: safeImageURL(i.thumb || i.thumb_url),
          alt:   typeof i.alt === 'string' ? i.alt : p.name,
        }))
        .filter(i => i.url),
    });
  }
  return { ...c, count: products.length, products };
}

export function mergeAdminProducts(cat) { return normalizeCatalog(cat); }

export async function loadCatalog(render = () => {}) {
  // 1. Read localStorage
  let entry;
  try { entry = JSON.parse(localStorage.getItem(LS_KEY)); } catch {}
  const age = Date.now() - Math.min(entry?.ts ?? 0, Date.parse(entry?.data?.generated_at));
  const cached = age >= 0 && age < STALE_MS && entry?.data?.source === 'sanity'
    ? normalizeCatalog(entry.data) : null;
  const fresh  = cached && age < FRESH_MS;

  // 2. Serve from localStorage if fresh — zero network
  if (fresh) {
    render(cached, 'cache');
    return cached;
  }

  // 3. Render stale immediately while we revalidate
  if (cached) render(cached, 'cache');

  // 4. Stable published query, no token, cookies, custom headers or cache-busters.
  // The CDN handles HTTP caching; inFlight coalesces simultaneous page requests.
  try {
    if (!inFlight) {
      inFlight = fetch(sanityURL({}), {signal: AbortSignal.timeout(12000), credentials: 'omit'})
        .then(async r => {
          if (!r.ok) throw new Error(`catalog ${r.status}`);
          const raw = await r.json();
          const data = normalizeCatalog(normalizeSanity(raw.result, {}));
          if (!data) throw new Error('Invalid catalog');
          try { localStorage.setItem(LS_KEY, JSON.stringify({data, ts: Date.now()})); } catch {}
          return data;
        })
        .finally(() => { inFlight = null; });
    }

    const result = await inFlight;
    // Prices, sizes, availability and photos can change without changing slugs.
    // Always deliver the validated response, including an empty collection.
    render(result, 'live');
    return result;

  } catch {
    if (cached) return cached;
    const empty = {
      source: 'sanity', count: 0, products: [],
      generated_at: new Date().toISOString(), unavailable: true,
    };
    render(empty, 'unavailable');
    return empty;
  }
}

export function getProductBySlug(catalog, slug) {
  const list = mergeAdminProducts(catalog || DEFAULT_CATALOG)?.products || [];
  return list.find(p => p.slug === slug) ?? null;
}

export function getByCategory(catalog, category) {
  const list = mergeAdminProducts(catalog || DEFAULT_CATALOG)?.products || [];
  if (!category) return list;
  const key = v => v.toLowerCase().trim()
    .replace(/[\s_]+/g, '-')
    .replace(/^embroidery$/, 'embroidered');
  return list.filter(p =>
    (p.filters?.length ? p.filters : [p.category || '']).some(f => key(f) === key(category))
  );
}

export function getCategories(catalog) {
  const list = mergeAdminProducts(catalog || DEFAULT_CATALOG)?.products || [];
  return [...new Set(
    list.flatMap(p => p.filters?.length ? p.filters : [p.category]).filter(Boolean)
  )];
}

// public/js/catalog.js
// Loads the product catalog with 3 fallbacks and an unavailable state.
// NEVER contacts Supabase — only reads static files.

const LS_KEY = 'catalog:v1';
const CDN = window.STORE_CONFIG?.cdnOrigin ?? '';

const valid = (c) =>
  c && Array.isArray(c.products) && typeof c.generated_at === 'string';

async function getJson(url, ms) {
  const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/**
 * Load the catalog with multiple fallbacks. Calls render() potentially twice:
 * first with the cached copy (instant paint), then with the fresh copy.
 * @param {Function} render (data, source) — called with null on unavailable
 * @returns {Promise<object|null>} the freshest catalog, or null
 */
export async function loadCatalog(render) {
  let cached = null;
  try {
    cached = JSON.parse(localStorage.getItem(LS_KEY))?.data;
  } catch {}

  // Instant paint from cache
  if (valid(cached)) render(cached, 'cache');

  for (const [url, label] of [
    [`${CDN}/catalog/products.json`, 'live'],
    ['/data/products.fallback.json', 'fallback'],
  ]) {
    try {
      const data = await getJson(url, 4000);
      if (!valid(data)) continue;
      // Never replace a newer catalog with an older one (fallback can be stale)
      if (valid(cached) && Date.parse(data.generated_at) < Date.parse(cached.generated_at))
        return cached;
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() }));
      } catch {}
      render(data, label);
      return data;
    } catch { /* try next source */ }
  }

  if (!valid(cached)) render(null, 'unavailable');
  return cached;
}

/** Look up a product by slug in a catalog object */
export function getProductBySlug(catalog, slug) {
  return catalog?.products?.find((p) => p.slug === slug) ?? null;
}

/** Filter products by category */
export function getByCategory(catalog, category) {
  if (!catalog?.products) return [];
  if (!category) return catalog.products;
  return catalog.products.filter((p) => p.category === category);
}

/** Get all unique categories */
export function getCategories(catalog) {
  if (!catalog?.products) return [];
  return [...new Set(catalog.products.map((p) => p.category).filter(Boolean))];
}

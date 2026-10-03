// public/js/catalog.js
// Loads the product catalog with 4-stage fallback:
// 1. localStorage (instant paint)
// 2. Live CDN catalog from R2
// 3. Committed fallback JSON (/data/products.fallback.json)
// 4. Inlined default studio collection (ensures zero empty screen, even on file://)

import { safeImageURL } from './safety.js';

const LS_KEY = 'catalog:v1';
const CDN = window.STORE_CONFIG?.cdnOrigin ?? '';

export const DEFAULT_CATALOG = {
  count: 8,
  version: 1,
  generated_at: "2026-09-29T12:00:00.000Z",
  products: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "noir-floral-embroidered-set",
      name: "Noir Floral Embroidered Set",
      description: "Exquisitely tailored 3-piece embroidered cambric ensemble featuring delicate floral threadwork along the neckline, daman, and sleeves. Paired with a printed silk dupatta and dyed cambric trousers.\n\n• Shirt: Pure Cambric with Schiffli Embroidery (3.0m)\n• Dupatta: Printed Silk Organza (2.5m)\n• Trouser: Dyed Cambric (2.5m)\n• Care: Dry clean recommended.",
      price: 6950,
      compare_at_price: 8500,
      category: "Embroidered",
      in_stock: true,
      track_stock: true,
      stock: 14,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.54.30 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.54.16 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.54.16 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.54.16 PM.jpeg" },
        { url: "assets/WhatsApp_Image_2026-09-28_at_2.54.30_20260928155729 (1).jpg", thumb: "assets/WhatsApp_Image_2026-09-28_at_2.54.30_20260928155729 (1).jpg" }
      ]
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "teal-blossom-lawn-suit",
      name: "Teal Blossom Lawn Suit",
      description: "Summery vibrant teal 3-piece premium lawn collection with intricate pastel floral patterns. Lightweight, breathable, and designed for effortless all-day elegance.\n\n• Shirt: Digital Printed Swiss Lawn (3.0m)\n• Dupatta: Digital Printed Voile (2.5m)\n• Trouser: Dyed Cambric (2.5m)\n• Care: Machine wash cold inside out.",
      price: 6450,
      compare_at_price: 7500,
      category: "Lawn",
      in_stock: true,
      track_stock: true,
      stock: 18,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.57.21 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.56.45 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.56.45 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.56.45 PM.jpeg" },
        { url: "assets/WhatsApp_Image_2026-09-28_at_2.57.21_20260928161102 (1).jpg", thumb: "assets/WhatsApp_Image_2026-09-28_at_2.57.21_20260928161102 (1).jpg" }
      ]
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      slug: "rust-heritage-kurta-set",
      name: "Rust Heritage Kurta Set",
      description: "An archival formal statement in deep terracotta rust, adorned with traditional marori and tilla needlecraft. Perfect for festive soirees and heritage gatherings.\n\n• Shirt: Embroidered Cotton Net (3.0m)\n• Dupatta: Zari Stripe Jacquard (2.5m)\n• Trouser: Raw Silk Dyed (2.5m)\n• Care: Dry clean only.",
      price: 7250,
      compare_at_price: 9000,
      category: "Heritage",
      in_stock: true,
      track_stock: true,
      stock: 9,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.58.08 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.57.54 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.57.54 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.57.54 PM.jpeg" },
        { url: "assets/WhatsApp_Image_2026-09-28_at_2.58.08_20260928160928 (1).jpg", thumb: "assets/WhatsApp_Image_2026-09-28_at_2.58.08_20260928160928 (1).jpg" }
      ]
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      slug: "midnight-baroque-ensemble",
      name: "Midnight Baroque Ensemble",
      description: "Opulent midnight navy chiffon suit accented with monochromatic baroque sequins and resham thread embroidery. An iconic eveningwear silhouette.\n\n• Shirt: Embroidered Chiffon Front & Back (3.0m)\n• Dupatta: Embroidered Chiffon with Scalloped Borders (2.5m)\n• Trouser: Dyed Grip Silk (2.5m)\n• Care: Dry clean only.",
      price: 7850,
      compare_at_price: 9500,
      category: "Embroidered",
      in_stock: true,
      track_stock: true,
      stock: 12,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.58.51 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.58.37 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.58.37 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.58.37 PM.jpeg" },
        { url: "assets/WhatsApp_Image_2026-09-28_at_2.58.51_20260928155847 (1).jpg", thumb: "assets/WhatsApp_Image_2026-09-28_at_2.58.51_20260928155847 (1).jpg" }
      ]
    },
    {
      id: "55555555-5555-4555-8555-555555555555",
      slug: "midnight-sequin-kurta",
      name: "Midnight Sequin Kurta",
      description: "Stitched ready-to-wear kurta in deep midnight hue with delicate cutwork and micro-sequin motifs. Features a contemporary relaxed silhouette.\n\n• Fabric: Premium Slub Khaddar / Linen\n• Details: Mandarin collar, pearl button detailing\n• Care: Hand wash gently.",
      price: 6800,
      compare_at_price: null,
      category: "Ready to Wear",
      in_stock: true,
      track_stock: true,
      stock: 15,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.58.51 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.58.37 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.58.37 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.58.37 PM.jpeg" }
      ]
    },
    {
      id: "66666666-6666-4666-8666-666666666666",
      slug: "embroidered-cambric-set",
      name: "Embroidered Cambric Set",
      description: "Classic unstitched 3-piece featuring contrast ivory embroidery on jet black cambric base, accompanied by a digitally printed chiffon dupatta.\n\n• Shirt: Fine Cambric Embroidered (3.0m)\n• Dupatta: Chiffon (2.5m)\n• Trouser: Plain Cambric (2.5m)",
      price: 5950,
      compare_at_price: 8500,
      category: "Embroidered",
      in_stock: true,
      track_stock: true,
      stock: 7,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.54.30 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.54.16 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.54.16 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.54.16 PM.jpeg" }
      ]
    },
    {
      id: "77777777-7777-4777-8777-777777777777",
      slug: "floral-cambric-3-piece",
      name: "Floral Cambric 3-Piece",
      description: "Soft pastel botanical prints on rich teal cambric fabric. Complete with printed matching trousers and lightweight printed lawn dupatta.",
      price: 4950,
      compare_at_price: 7500,
      category: "Lawn",
      in_stock: true,
      track_stock: true,
      stock: 11,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.57.21 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.56.45 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.56.45 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.56.45 PM.jpeg" }
      ]
    },
    {
      id: "88888888-8888-4888-8888-888888888888",
      slug: "heritage-rust-ensemble",
      name: "Heritage Rust Ensemble",
      description: "Traditional Angrakha-style festive suit with vintage metallic zari borders and hand-embellished tassels.\n\n• Fabric: Jacquard Cotton & Organza\n• Dupatta: Organza with gold foil printing\n• Trouser: Plain Cotton Dyed",
      price: 5400,
      compare_at_price: 9000,
      category: "Heritage",
      in_stock: true,
      track_stock: true,
      stock: 6,
      is_active: true,
      images: [
        { url: "assets/WhatsApp Image 2026-09-28 at 2.58.08 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.57.54 PM.jpeg" },
        { url: "assets/WhatsApp Image 2026-09-28 at 2.57.54 PM.jpeg", thumb: "assets/WhatsApp Image 2026-09-28 at 2.57.54 PM.jpeg" }
      ]
    }
  ]
};

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
        url: safeImageURL(i.url), thumb: safeImageURL(i.thumb || i.thumb_url),
      })).filter((i) => i.url),
    });
  }
  return { ...c, count: products.length, products };
}

const valid = (c) => !!normalizeCatalog(c);

async function getJson(url, ms) {
  const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/**
 * Merge any products created or updated in the Admin Dashboard (stored in localStorage)
 * with the base catalog. Ensures new items appear immediately across the site.
 */
export function mergeAdminProducts(cat) {
  // Browser preview edits are never a source of truth for the storefront.
  return normalizeCatalog(cat);
}

/**
 * Load catalog with 4 fallbacks + CDN caching.
 */
export async function loadCatalog(render = () => {}) {
  let cached = null;
  try {
    cached = JSON.parse(localStorage.getItem(LS_KEY))?.data;
  } catch {}

  // 1. Instant paint from local cache (0ms latency)
  if (valid(cached)) render(mergeAdminProducts(cached), 'cache');

  // 2. Network sources (CDN live, then JSON file)
  const sources = [];
  if (CDN) sources.push([`${CDN}/catalog/products.json`, 'live']);
  sources.push(['./data/products.fallback.json', 'fallback']);
  sources.push(['/data/products.fallback.json', 'fallback-root']);

  for (const [url, label] of sources) {
    try {
      const data = await getJson(url, 3000);
      if (!valid(data)) continue;
      if (label !== 'live' && valid(cached) && Date.parse(data.generated_at) < Date.parse(cached.generated_at)) {
        return mergeAdminProducts(cached);
      }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() }));
      } catch {}
      const merged = mergeAdminProducts(data);
      render(merged, label);
      return merged;
    } catch { /* proceed to next fallback */ }
  }

  // 3. If network fails or file://, render DEFAULT_CATALOG
  if (!valid(cached)) {
    const fallbackMerged = mergeAdminProducts(DEFAULT_CATALOG);
    render(fallbackMerged, 'default');
    return fallbackMerged;
  }
  return mergeAdminProducts(cached);
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
  return list.filter((p) => key(p.category || '') === key(category));
}

export function getCategories(catalog) {
  const cat = mergeAdminProducts(catalog || DEFAULT_CATALOG);
  const list = cat?.products || DEFAULT_CATALOG.products;
  return [...new Set(list.map((p) => p.category).filter(Boolean))];
}

// public/js/cart.js
// Cart stored in localStorage. Stores {product_id, qty, size} only — no prices.
// Prices and names are derived from the catalog at display time.

const LS_KEY = 'anraf_cart:v2';
const SIZES = new Set(['Small', 'Medium', 'Large', 'XL']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const items = [];
  for (const item of value.slice(0, 100)) {
    if (!item || !UUID.test(item.product_id) || !Number.isInteger(item.qty) || item.qty < 1) continue;
    const size = item.size ?? 'Small';
    if (!SIZES.has(size)) continue;
    const existing = items.find((i) => i.product_id === item.product_id && i.size === size);
    if (existing) existing.qty = Math.min(20, existing.qty + item.qty);
    else if (items.length < 30) items.push({ product_id: item.product_id, qty: Math.min(20, item.qty), size });
  }
  return items;
}

function loadCart() {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(LS_KEY)));
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

export function getCart() {
  return loadCart();
}

export function getCartCount() {
  return loadCart().reduce((sum, item) => sum + (item.qty || 0), 0);
}

export function addToCart(productId, qty = 1, size = 'Small') {
  if (!UUID.test(productId) || !SIZES.has(size) || !Number.isInteger(qty) || qty < 1) return;
  const items = loadCart();
  const existing = items.find((i) => i.product_id === productId && (i.size || 'Small') === size);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 20);
  } else if (items.length < 30) {
    items.push({ product_id: productId, qty: Math.min(qty, 20), size });
  }
  saveCart(items);
}

export function removeFromCart(productId, size = 'Small') {
  saveCart(loadCart().filter((i) => !(i.product_id === productId && (i.size || 'Small') === size)));
}

export function updateQty(productId, qty, size = 'Small') {
  if (!Number.isInteger(qty)) return;
  if (qty < 1) {
    removeFromCart(productId, size);
    return;
  }
  const items = loadCart();
  const item = items.find((i) => i.product_id === productId && (i.size || 'Small') === size);
  if (item) {
    item.qty = Math.min(qty, 20);
    saveCart(items);
  }
}

export function clearCart() {
  saveCart([]);
}

/** Enrich cart items with product data from catalog */
export function enrichCart(cartItems, catalog) {
  const byId = new Map((catalog?.products ?? []).map((p) => [p.id, p]));
  return normalizeCart(cartItems)
    .map((item) => ({
      ...item,
      product: byId.get(item.product_id) || {
        id: item.product_id, slug: '', name: 'Unavailable product — please remove from bag',
        price: 0, in_stock: false, images: [],
      }
    }))
    .filter((item) => item.product);
}

export function cartTotal(enrichedItems) {
  return enrichedItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.qty,
    0
  );
}

/** Format PKR price */
export const formatPrice = (n) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-PK');

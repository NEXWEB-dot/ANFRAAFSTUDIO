// public/js/cart.js
// Cart stored in localStorage. Stores {product_id, qty} only — no prices.
// Prices are read from the catalog at display time; the server recomputes everything at checkout.

const LS_KEY = 'cart:v1';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
}

function saveCart(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
  dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

export function getCart() { return loadCart(); }

export function getCartCount() {
  return loadCart().reduce((s, i) => s + (i.qty || 0), 0);
}

export function addToCart(productId, qty = 1) {
  const items = loadCart();
  const existing = items.find((i) => i.product_id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 20);
  } else {
    items.push({ product_id: productId, qty: Math.min(qty, 20) });
  }
  saveCart(items);
}

export function removeFromCart(productId) {
  saveCart(loadCart().filter((i) => i.product_id !== productId));
}

export function updateQty(productId, qty) {
  if (qty < 1) { removeFromCart(productId); return; }
  const items = loadCart();
  const item = items.find((i) => i.product_id === productId);
  if (item) { item.qty = Math.min(qty, 20); saveCart(items); }
}

export function clearCart() { saveCart([]); }

/** Enrich cart items with product data from the catalog */
export function enrichCart(cartItems, catalog) {
  const byId = new Map((catalog?.products ?? []).map((p) => [p.id, p]));
  return cartItems
    .map((item) => ({ ...item, product: byId.get(item.product_id) }))
    .filter((item) => item.product); // remove items whose product no longer exists
}

export function cartTotal(enrichedItems) {
  return enrichedItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.qty,
    0
  );
}

/** Format PKR price */
export const formatPrice = (n) =>
  'PKR\u00a0' + Number(n).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

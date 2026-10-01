// public/js/cart.js
// Cart stored in localStorage. Stores {product_id, qty, size} only — no prices.
// Prices and names are derived from the catalog at display time.

const LS_KEY = 'anraf_cart:v2';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
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

export function addToCart(productId, qty = 1, size = 'Unstitched') {
  const items = loadCart();
  const existing = items.find((i) => i.product_id === productId && (i.size || 'Unstitched') === size);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 20);
  } else {
    items.push({ product_id: productId, qty: Math.min(qty, 20), size });
  }
  saveCart(items);
}

export function removeFromCart(productId, size = 'Unstitched') {
  saveCart(loadCart().filter((i) => !(i.product_id === productId && (i.size || 'Unstitched') === size)));
}

export function updateQty(productId, qty, size = 'Unstitched') {
  if (qty < 1) {
    removeFromCart(productId, size);
    return;
  }
  const items = loadCart();
  const item = items.find((i) => i.product_id === productId && (i.size || 'Unstitched') === size);
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
  return cartItems
    .map((item) => ({
      ...item,
      product: byId.get(item.product_id)
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


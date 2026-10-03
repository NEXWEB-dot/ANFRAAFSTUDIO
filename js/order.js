// Keep one reference for retries/reloads of the same order, without storing customer data.
let pendingMemory;
export async function submitOrder(payload) {
  const { turnstile_token, hp, client_ref, ...order } = payload;
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(order)));
  const fingerprint = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  let pending = pendingMemory;
  try { pending = JSON.parse(sessionStorage.getItem('anraf_pending_order')); } catch {}
  if (pending?.fingerprint !== fingerprint) {
    pending = { fingerprint, ref: crypto.randomUUID() };
    try { sessionStorage.setItem('anraf_pending_order', JSON.stringify(pending)); } catch {}
  }
  pendingMemory = pending;
  const response = await fetch('/api/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, client_ref: pending.ref }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.ok !== true || data.ref !== pending.ref ||
      data.total == null || !Number.isFinite(Number(data.total)) || Number(data.total) < 0) {
    throw new Error(data?.error || 'ORDER_FAILED');
  }
  return data;
}

export function finishOrder() {
  pendingMemory = undefined;
  try { sessionStorage.removeItem('anraf_pending_order'); } catch {}
}

export function orderErrorMessage(code) {
  return ({
    BAD_INPUT: 'Please check your contact details and shopping bag.',
    BOT_CHECK_FAILED: 'Please complete the security check again.',
    OUT_OF_STOCK: 'An item is out of stock. Please review your shopping bag.',
    PRODUCT_UNAVAILABLE: 'An item is no longer available. Please review your shopping bag.',
    CHECKOUT_PAUSED: 'Checkout is temporarily unavailable. Your shopping bag is saved.',
  })[code] || 'We could not confirm your order. Your shopping bag is saved. Please retry or contact us before placing another order.';
}

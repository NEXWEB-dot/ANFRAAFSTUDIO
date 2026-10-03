// public/js/checkout.js
// Checkout page logic.
// client_ref = one UUID per page load, reused on retries (idempotency key).

import { getCart, enrichCart, cartTotal, clearCart, formatPrice } from './cart.js';
import { loadCatalog } from './catalog.js';
import { submitOrder, finishOrder } from './order.js';

const API = '/api/checkout';

// Generate idempotency key once per page load
const clientRef = crypto.randomUUID();

let catalog = null;

async function init() {
  catalog = await loadCatalog((data) => { catalog = data; renderSummary(data); });
  renderSummary(catalog);
  setupForm();
}

function renderSummary(data) {
  const items = enrichCart(getCart(), data);
  const container = document.getElementById('cart-summary');
  if (!container) return;

  container.innerHTML = '';

  if (!items.length) {
    const msg = document.createElement('p');
    msg.className = 'empty-cart';
    msg.textContent = 'Your cart is empty.';
    container.appendChild(msg);
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = true;
    return;
  }

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'summary-row-item';

    const img = document.createElement('img');
    img.src = item.product.images?.[0]?.thumb || item.product.images?.[0]?.url || '';
    img.alt = item.product.name;
    img.width = 60;
    img.height = 80;
    img.className = 'summary-thumb';
    row.appendChild(img);

    const details = document.createElement('div');
    details.className = 'summary-item-details';

    const name = document.createElement('p');
    name.className = 'summary-item-name';
    name.textContent = item.product.name;
    details.appendChild(name);

    const qty = document.createElement('p');
    qty.className = 'summary-item-qty';
    qty.textContent = `× ${item.qty}`;
    details.appendChild(qty);

    row.appendChild(details);

    const price = document.createElement('p');
    price.className = 'summary-item-price';
    price.textContent = formatPrice(Number(item.product.price) * item.qty);
    row.appendChild(price);

    container.appendChild(row);
  }

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = formatPrice(cartTotal(items));
}

function setupForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submit-btn');
  const errorEl = document.getElementById('checkout-error');

  // Clear previous errors
  if (errorEl) errorEl.innerHTML = '';
  if (btn) { btn.disabled = true; btn.textContent = 'Placing Order…'; }

  const items = enrichCart(getCart(), catalog);
  if (!items.length) {
    if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
    return;
  }

  const turnstileToken =
    document.querySelector('[name="cf-turnstile-response"]')?.value ?? '';

  const payload = {
    client_ref: clientRef,
    name: form.querySelector('[name="name"]')?.value.trim() ?? '',
    phone: form.querySelector('[name="phone"]')?.value.trim() ?? '',
    address: form.querySelector('[name="address"]')?.value.trim() ?? '',
    notes: form.querySelector('[name="notes"]')?.value.trim() ?? '',
    items: items.map((i) => ({ product_id: i.product_id, qty: i.qty, size: i.size })),
    turnstile_token: turnstileToken,
    hp: form.querySelector('[name="hp"]')?.value ?? '',
  };

  try {
    const data = await submitOrder(payload);

    if (data.ok) {
      clearCart();
      finishOrder();
      const params = new URLSearchParams({
        ref: data.order_number ? String(data.order_number) : data.ref.slice(0, 8),
        total: String(data.total),
        offline: data.offline ? '1' : '0',
      });
      window.location.href = `/order-confirmed.html?${params}`;
      return;
    }

    showError(data);
  } catch (err) {
    showError({ error: err.message || 'NETWORK' });
    window.turnstile?.reset();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
  }
}

function showError(data) {
  const errorEl = document.getElementById('checkout-error');
  if (!errorEl) return;
  errorEl.innerHTML = '';

  const whatsapp = window.STORE_CONFIG?.whatsappUrl ?? '#';
  let msg = '';

  switch (data.error) {
    case 'BAD_INPUT':
      msg = 'Please check your details and try again.';
      break;
    case 'BOT_CHECK_FAILED':
      msg = 'Security check failed. Please reload the page and try again.';
      break;
    case 'OUT_OF_STOCK':
      msg = `Sorry, "${data.detail ?? 'a product'}" is out of stock. Please remove it from your cart.`;
      break;
    case 'PRODUCT_UNAVAILABLE':
      msg = 'One or more items in your cart are no longer available.';
      break;
    case 'CHECKOUT_PAUSED':
      msg = 'Checkout is temporarily paused. Please contact us on WhatsApp.';
      break;
    case 'ORDER_FAILED':
    case 'NETWORK':
      msg = 'Something went wrong. Your cart is saved — please try again or contact us via WhatsApp.';
      break;
    default:
      msg = 'An error occurred. Please try again.';
  }

  const p = document.createElement('p');
  p.className = 'error-text';
  p.textContent = msg;
  errorEl.appendChild(p);

  if (['CHECKOUT_PAUSED', 'ORDER_FAILED', 'NETWORK'].includes(data.error)) {
    const a = document.createElement('a');
    a.href = whatsapp;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn-whatsapp';
    a.textContent = 'Chat on WhatsApp';
    errorEl.appendChild(a);
  }
}

document.addEventListener('DOMContentLoaded', init);

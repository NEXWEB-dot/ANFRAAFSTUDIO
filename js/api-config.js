// Public setting only. Set the HTTPS backend origin when deploying checkout.
// Never put Resend or Turnstile secrets in browser files.
export const API_ORIGIN = '';

export function apiURL(path) {
  if (!['/api/config', '/api/checkout'].includes(path)) throw new Error('Invalid API path');
  if (!API_ORIGIN) {
    if (globalThis.location?.hostname?.endsWith('.github.io')) throw new Error('CHECKOUT_PAUSED');
    return path;
  }
  const url = new URL(API_ORIGIN);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('CHECKOUT_PAUSED');
  return new URL(path, url).href;
}

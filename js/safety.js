// Escape values used in HTML text and quoted attributes.
export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function safeImageURL(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, globalThis.location?.href || 'https://anrafstudio.com/');
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function normalizePhone(value) {
  const digits = String(value).replace(/[\s()+-]/g, '').replace(/^(?:0092|92|0)/, '');
  return /^3\d{9}$/.test(digits) ? `+92${digits}` : '';
}

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
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!/^[+\d\s()-]+$/.test(raw)) return '';
  const clean = raw.replace(/[\s()+-]/g, '');

  // Explicit country codes take precedence over local number shortcuts.
  if (raw.startsWith('+') || clean.startsWith('00')) {
    const digits = raw.startsWith('+') ? clean : clean.slice(2);
    if (!/^[1-9]\d{7,14}$/.test(digits) ||
        (digits.startsWith('92') && !/^923\d{9}$/.test(digits)) ||
        (raw.includes('+') && !/^\+[^+]*$/.test(raw))) return '';
    return `+${digits}`;
  }
  if (raw.includes('+')) return '';

  // 1. Pakistani format: 03001234567, 300 1234567, +92 300 1234567, 00923001234567
  const pkDigits = clean.replace(/^(?:0092|92|0)/, '');
  if (/^3\d{9}$/.test(pkDigits)) {
    return `+92${pkDigits}`;
  }

  // 2. UAE format: +971 50 123 4567, 00971501234567, 0501234567, 501234567
  const uaeDigits = clean.replace(/^(?:00971|971)/, '').replace(/^0/, '');
  if (/^5\d{8}$/.test(uaeDigits)) {
    return `+971${uaeDigits}`;
  }

  return '';
}

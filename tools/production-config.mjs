export function productionConfig(env) {
  const config = {};
  const errors = [];
  for (const key of ['SITE_ORIGIN','BACKEND_ORIGIN','PUBLIC_CDN_ORIGIN']) {
    try {
      const url = new URL(env[key]);
      if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' ||
          url.search || url.hash || /(?:example|localhost|your-)/i.test(url.hostname)) throw new Error();
      config[key] = url.origin;
    } catch { errors.push(`${key}: set a real HTTPS origin without a path`); }
  }
  if (config.SITE_ORIGIN && config.SITE_ORIGIN === config.BACKEND_ORIGIN)
    errors.push('BACKEND_ORIGIN must be the separate backend host');
  if (!/^https:\/\/wa\.me\/[1-9]\d{7,14}$/.test(env.WHATSAPP_URL || '') ||
      /923000000000|923001234567/.test(env.WHATSAPP_URL || '')) errors.push('WHATSAPP_URL: set the real business WhatsApp link');
  else config.WHATSAPP_URL = env.WHATSAPP_URL;
  if (errors.length) throw new Error(errors.join('\n'));
  return config;
}

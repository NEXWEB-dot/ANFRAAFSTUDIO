import fs from 'node:fs';

// Cloudflare Turnstile requires these domains in connect-src and frame-src.
// https://developers.cloudflare.com/turnstile/reference/content-security-policy/
// data: is needed by Turnstile for internal challenge data transfers.

const TURNSTILE_CONNECT = [
  'https://challenges.cloudflare.com',
  'https://*.challenges.cloudflare.com',
  'https://hagen.challenges.cloudflare.com',
  'https://brunhild.challenges.cloudflare.com',
  'data:',
].join(' ');

const TURNSTILE_FRAME = [
  'https://challenges.cloudflare.com',
  'https://*.challenges.cloudflare.com',
].join(' ');

let text = fs.readFileSync('_headers', 'utf8');

// Fix connect-src: add Turnstile required origins and data:
text = text.replace(
  /connect-src 'self' https:\/\/m7hktaor\.apicdn\.sanity\.io https:\/\/cdn\.anrafstudio\.com https:\/\/challenges\.cloudflare\.com https:\/\/static\.cloudflareinsights\.com https:\/\/cloudflareinsights\.com;/,
  `connect-src 'self' https://m7hktaor.apicdn.sanity.io https://cdn.anrafstudio.com https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://hagen.challenges.cloudflare.com https://brunhild.challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflareinsights.com data:;`
);

// Fix frame-src: allow all Turnstile challenge subdomains
text = text.replace(
  /frame-src 'self' https:\/\/challenges\.cloudflare\.com;/,
  `frame-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com;`
);

fs.writeFileSync('_headers', text);
console.log('Updated _headers with Turnstile CSP domains');
console.log('\nNew connect-src:');
const connectMatch = text.match(/connect-src [^;]+;/);
if (connectMatch) console.log(connectMatch[0]);

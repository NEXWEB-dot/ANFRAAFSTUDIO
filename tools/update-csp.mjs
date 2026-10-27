import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function updateCSP(directory, includeAdmin = true) {
  const root = directory instanceof URL ? fileURLToPath(directory) : directory;
  const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
  if (includeAdmin && fs.existsSync(path.join(root, 'admin')))
    files.push(...fs.readdirSync(path.join(root, 'admin')).filter(f => f.endsWith('.html')).map(f => 'admin/' + f));

  const hashes = new Set([
    // Cloudflare Web Analytics runtime beacon
    "'sha256-5W4Fqmt+snPPN2oO5RbEeG2E7dbp6J2V/CNlpg9t3RE='"
  ]);

  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const script of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(script[1]) || !script[2].trim()) continue;
      // HTML parsing normalizes CRLF before CSP hashes are evaluated.
      hashes.add(`'sha256-${createHash('sha256').update(script[2].replace(/\r\n?/g, '\n')).digest('base64')}'`);
    }
  }

  const headersPath = path.join(root, '_headers');
  let text = fs.readFileSync(headersPath, 'utf8');

  // Update script-src hashes
  text = text.replace(
    /script-src [^;]+;/,
    `script-src 'self' ${[...hashes].join(' ')} https://challenges.cloudflare.com https://cdn.tailwindcss.com https://static.cloudflareinsights.com;`
  );

  // Ensure Turnstile connect-src domains are always present
  if (!text.includes('https://*.challenges.cloudflare.com')) {
    text = text.replace(
      /connect-src 'self' ([^;]+);/,
      (m, rest) => `connect-src 'self' ${rest} https://*.challenges.cloudflare.com data:;`
    );
  }

  // Ensure Turnstile frame-src wildcard is present
  if (!text.includes('https://*.challenges.cloudflare.com')) {
    text = text.replace(
      /frame-src 'self' https:\/\/challenges\.cloudflare\.com;/,
      `frame-src 'self' https://challenges.cloudflare.com https://*.challenges.cloudflare.com;`
    );
  }

  fs.writeFileSync(headersPath, text);
  console.log(`Updated CSP hashes for ${files.length} pages.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  updateCSP(new URL('../', import.meta.url));

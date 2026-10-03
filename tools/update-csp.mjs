import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const files = fs.readdirSync(root).filter(f=>f.endsWith('.html'));
if (fs.existsSync(path.join(root,'admin'))) files.push(...fs.readdirSync(path.join(root,'admin')).filter(f=>f.endsWith('.html')).map(f=>'admin/'+f));
const hashes = new Set();
for (const file of files) {
  const source = fs.readFileSync(path.join(root,file),'utf8');
  for (const script of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(script[1]) || !script[2].trim()) continue;
    // HTML parsing normalizes CRLF before CSP hashes are evaluated.
    hashes.add(`'sha256-${createHash('sha256').update(script[2].replace(/\r\n?/g,'\n')).digest('base64')}'`);
  }
}
const headers = path.join(root,'_headers');
let text = fs.readFileSync(headers,'utf8');
text = text.replace(/script-src [^;]+;/, `script-src 'self' ${[...hashes].join(' ')} https://challenges.cloudflare.com https://cdn.tailwindcss.com;`);
fs.writeFileSync(headers,text);
console.log(`Updated CSP hashes for ${files.length} pages.`);

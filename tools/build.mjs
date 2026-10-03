import { cp, mkdir } from 'node:fs/promises';
const source = new URL('../',import.meta.url);
const output = new URL('../dist/',import.meta.url);
await import('./update-csp.mjs');
await mkdir(output,{recursive:true});
for (const item of ['index.html','store.html','product.html','cart.html','checkout.html','order-confirmed.html','_headers','robots.txt','sitemap.xml','js','css','assets','data']) {
  await cp(new URL(item,source),new URL(item,output),{recursive:true});
}
console.log('Static storefront built in dist/ (checkout also requires the backend API).');

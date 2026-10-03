import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { updateCSP } from './update-csp.mjs';
import { productionConfig } from './production-config.mjs';
const source = new URL('../',import.meta.url);
const output = new URL('../dist/',import.meta.url);
const config = process.env.LAUNCH_MODE === 'production' ? productionConfig(process.env) : null;
updateCSP(source);
await mkdir(output,{recursive:true});
for (const item of ['index.html','store.html','product.html','cart.html','checkout.html','order-confirmed.html','_headers','robots.txt','sitemap.xml','js','css','assets','data']) {
  await cp(new URL(item,source),new URL(item,output),{recursive:true});
}
await writeFile(new URL('_routes.json',output), JSON.stringify({version:1,include:['/api/*'],exclude:[]}));
if (config) {
  for (const file of await readdir(output)) {
    if (!/\.(html|xml|txt)$/.test(file) && file !== '_headers') continue;
    const target = new URL(file,output);
    let text = await readFile(target,'utf8');
    text = text.replaceAll('https://cdn.anrafstudio.com', config.PUBLIC_CDN_ORIGIN)
      .replaceAll('https://anrafstudio.com', config.SITE_ORIGIN)
      .replaceAll('https://anraafstudio.com', config.SITE_ORIGIN)
      .replaceAll('923000000000', config.WHATSAPP_URL.split('/').pop())
      .replaceAll('+92 300 0000000', '+' + config.WHATSAPP_URL.split('/').pop());
    await writeFile(target,text);
  }
}
updateCSP(output, false);
console.log(`Storefront built in dist/ (${config ? 'production settings applied' : 'preview; production settings not supplied'}). Deploy root functions/ with it.`);

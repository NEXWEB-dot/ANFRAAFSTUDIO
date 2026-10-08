import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const memory = () => {
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k), clear: () => data.clear() };
};
globalThis.localStorage = memory();
globalThis.sessionStorage = memory();
globalThis.window = { STORE_CONFIG: { cdnOrigin: 'https://cdn.example.test' }, dispatchEvent() {} };
globalThis.location = { href: 'https://shop.example.test/' };
const cart = await import('../js/cart.js');
const catalog = await import('../js/catalog.js');
const safety = await import('../js/safety.js');
const order = await import('../js/order.js');
const backendPresent = fs.existsSync('anraf backend/functions/api/checkout.js');
const backendTest = backendPresent ? test : test.skip;
const { onRequestPost: checkout } = backendPresent ? await import('../anraf backend/functions/api/checkout.js') : {};
const adminPresent = fs.existsSync('admin/js/api.js');
const { api } = adminPresent ? await import('../admin/js/api.js') : {};
const id = '11111111-1111-4111-8111-111111111111';
const ref = '22222222-2222-4222-8222-222222222222';
const product = { id, slug:'shirt', name:'Shirt', price:100, in_stock:true, images:[] };
const cat = { source:'sanity', generated_at:'2026-10-01T00:00:00Z', products:[product] };
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); order.finishOrder(); });

test('all application scripts and inline scripts parse', () => {
  const dirs = ['js','admin','anraf backend/functions','anraf backend/shared','anraf backend/workers','anraf backend/scripts'];
  const files = fs.readdirSync('.').filter(p => p.endsWith('.html'));
  const walk = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(d,e.name)) : [path.join(d,e.name)]);
  files.push(...dirs.filter(d=>fs.existsSync(d)).flatMap(walk).filter(p => /\.(m?js|html)$/.test(p)));
  for (const file of files) {
    const text = fs.readFileSync(file,'utf8');
    const scripts = file.endsWith('.html') ? [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => !m[1].includes('application/ld+json')).map(m => m[2]) : [text];
    for (const script of scripts) {
      assert.doesNotThrow(() => new vm.SourceTextModule(script),file);
    }
  }
});
test('CSP permits current scripts without allowing arbitrary inline script', () => {
  const headers=fs.readFileSync('_headers','utf8');
  const policy=headers.match(/Content-Security-Policy: ([^\r\n]+)/)[1];
  assert.ok(policy.length<2000,'Cloudflare header line size limit');
  assert.ok(!/script-src[^;]*unsafe-inline/.test(policy));
  const files=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
  if (adminPresent) files.push(...fs.readdirSync('admin').filter(f=>f.endsWith('.html')).map(f=>'admin/'+f));
  for (const file of files) {
    const html=fs.readFileSync(file,'utf8');
    assert.ok(!/\son(?:click|error|load|submit|change)\s*=/.test(html),file);
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(m[1]) || !m[2].trim()) continue;
      const hash=createHash('sha256').update(m[2].replace(/\r\n?/g,'\n')).digest('base64');
      assert.ok(policy.includes(`'sha256-${hash}'`), `${file}: refresh CSP hashes`);
    }
  }
});
test('removed products remain removable instead of disappearing from the bag', () => {
  cart.addToCart(id);
  const items=cart.enrichCart(cart.getCart(),{products:[]});
  assert.equal(items.length,1); assert.equal(items[0].product.in_stock,false);
  cart.removeFromCart(id); assert.equal(cart.getCartCount(),0);
});
test('malformed stored carts cannot crash pages', () => {
  for (const value of ['null','{}','"bad"','[null,{}, {"qty": "3"}]','invalid']) {
    localStorage.setItem('anraf_cart:v2',value);
    assert.deepEqual(cart.getCart(),[]);
    assert.equal(cart.getCartCount(),0);
  }
});
test('cart rejects hostile sizes, fractions, negative and non-finite quantities', () => {
  for (const qty of [-1,0,0.5,NaN,Infinity,'2']) cart.addToCart(id,qty);
  cart.addToCart(id,1,'<img src=x onerror=alert(1)>');
  assert.deepEqual(cart.getCart(),[]);
});
test('sizes stay distinct during quantity updates and removal', () => {
  cart.addToCart(id,1,'Small'); cart.addToCart(id,2,'Medium');
  cart.updateQty(id,4,'Medium'); cart.removeFromCart(id,'Small');
  assert.deepEqual(cart.getCart(),[{product_id:id,qty:4,size:'Medium'}]);
});
test('cart caps quantity and strips untrusted prices', () => {
  localStorage.setItem('anraf_cart:v2',JSON.stringify([{product_id:id,qty:100,size:'Small',price:1}]));
  assert.equal(cart.getCart()[0].qty,20);
  assert.equal(cart.cartTotal(cart.enrichCart(cart.getCart(),cat)),2000);
  assert.equal(cart.getCart()[0].price,undefined);
});
test('HTML escaping protects both attributes and text', () => {
  assert.equal(safety.escapeHTML('<img src="x" onerror=\'bad\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;');
  for (const url of ['javascript:alert(1)','data:text/html,<script>','file:///secret']) assert.equal(safety.safeImageURL(url),'');
});
test('Pakistani phone forms normalize to one valid number', () => {
  for (const p of ['03001234567','300 1234567','+92 300 1234567','00923001234567']) assert.equal(safety.normalizePhone(p),'+923001234567');
  assert.equal(safety.normalizePhone('300123'),'');
});
test('empty live catalog replaces cached inventory', async () => {
  localStorage.setItem('catalog:v1',JSON.stringify({data:cat}));
  globalThis.fetch = async () => Response.json({result:[]});
  let latest;
  const result = await catalog.loadCatalog(c => { latest = c; });
  assert.deepEqual(result.products,[]); assert.deepEqual(latest.products,[]);
});
test('catalog callback is optional and local admin data never overrides live data', async () => {
  localStorage.setItem('admin_local_products',JSON.stringify([{...product,price:1}]));
  globalThis.fetch = async () => Response.json({result:cat.products});
  assert.equal((await catalog.loadCatalog()).products[0].price,100);
});
test('catalog validates malformed products and excludes inactive products', () => {
  assert.equal(catalog.normalizeCatalog({...cat,products:[null]}),null);
  assert.deepEqual(catalog.normalizeCatalog({...cat,products:[{...product,is_active:false}]}).products,[]);
});
test('category URLs handle spaces and hyphens', () => {
  const c = {...cat,products:[{...product,category:'Ready to Wear'}]};
  assert.equal(catalog.getByCategory(c,'ready-to-wear').length,1);
});

test('products appear under each selected filter and unavailable sizes remain removable', () => {
  const p={...product,category:'Heritage',filters:['Lawn','Ready to Wear'],sizes:['Medium']};
  const c={...cat,products:[p]};
  assert.equal(catalog.getByCategory(c,'lawn').length,1);
  assert.equal(catalog.getByCategory(c,'ready-to-wear').length,1);
  assert.equal(catalog.getByCategory(c,'heritage').length,0);
  assert.deepEqual(catalog.getCategories(c),['Lawn','Ready to Wear']);
  cart.addToCart(id,1,'Small'); cart.addToCart(id,1,'Medium');
  const lines=cart.enrichCart(cart.getCart(),c);
  assert.equal(lines[0].product.in_stock,false); assert.equal(lines[1].product.in_stock,true);
  cart.removeFromCart(id,'Small'); assert.equal(cart.getCart().length,1);
});

test('Sanity browser cache skips requests while fresh and coalesces concurrent loads', async () => {
  let calls = 0;
  const current = {...cat,generated_at:new Date().toISOString()};
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(new URL(url).hostname, 'm7hktaor.apicdn.sanity.io');
    assert.equal(options.credentials, 'omit');
    return Response.json({result:current.products});
  };
  await Promise.all([catalog.loadCatalog(),catalog.loadCatalog(),catalog.loadCatalog()]);
  assert.equal(calls,1);
  await catalog.loadCatalog(); assert.equal(calls,1);
  localStorage.setItem('catalog:sanity:v5',JSON.stringify({data:current,ts:Date.now()-301000}));
  await catalog.loadCatalog(); assert.equal(calls,2);
});

test('browser cache expires and cannot resurrect the legacy demo catalog', async () => {
  globalThis.fetch = async () => {throw new Error('offline');};
  localStorage.setItem('catalog:v1',JSON.stringify({data:cat,ts:Date.now()}));
  assert.equal((await catalog.loadCatalog()).unavailable,true);
  const recent = {...cat,generated_at:new Date(Date.now()-301000).toISOString()};
  localStorage.setItem('catalog:sanity:v5',JSON.stringify({data:recent,ts:Date.now()-301000}));
  assert.equal((await catalog.loadCatalog()).products.length,1);
  localStorage.setItem('catalog:sanity:v5',JSON.stringify({data:recent,ts:Date.now()-86400001}));
  assert.equal((await catalog.loadCatalog()).products.length,0);
});

test('revalidation renders price, stock and image changes when the slug is unchanged', async () => {
  const old = {...cat,generated_at:new Date(Date.now()-301000).toISOString()};
  localStorage.setItem('catalog:sanity:v5',JSON.stringify({data:old,ts:Date.now()-301000}));
  globalThis.fetch=async()=>Response.json({result:[{...product,price:250,in_stock:false,images:[{asset:'image-abc123-800x1200-jpg',alt:'New photo'}]}]});
  const renders=[];
  await catalog.loadCatalog(value=>renders.push(value));
  assert.equal(renders.length,2);
  assert.equal(renders[1].products[0].price,250);
  assert.equal(renders[1].products[0].in_stock,false);
  assert.match(renders[1].products[0].images[0].url,/abc123/);
});

test('static Sanity outage snapshot is usable only while recent',async()=>{
  let snapshot={...cat,generated_at:new Date().toISOString()};
  globalThis.fetch=async url=>{
    if (String(url).includes('apicdn.sanity.io')) throw new Error('CDN unavailable');
    assert.match(String(url),/data\/sanity.snapshot.json$/);
    return Response.json(snapshot);
  };
  assert.equal((await catalog.loadCatalog()).products.length,1);
  snapshot={...snapshot,generated_at:new Date(Date.now()-86400001).toISOString()};
  assert.equal((await catalog.loadCatalog()).unavailable,true);
});

test('cart accepts generated Sanity IDs and rejects draft IDs', () => {
  cart.addToCart('SanityAutoId123',2,'Large');
  cart.addToCart('drafts.hidden');
  cart.addToCart(undefined); cart.addToCart(null); cart.addToCart(123);
  assert.deepEqual(cart.normalizeCart([{qty:1},{product_id:null,qty:1}]),[]);
  assert.deepEqual(cart.getCart(),[{product_id:'SanityAutoId123',qty:2,size:'Large'}]);
});

const payload = () => ({client_ref:ref,name:'Test Customer',phone:'+923001234567',address:'Test street, Karachi',notes:'',items:[{product_id:id,qty:1,size:'Medium'}],turnstile_token:'token'});
test('checkout client rejects HTTP failures, malformed and fake successes', async () => {
  cart.addToCart(id);
  for (const [status,data] of [[503,{ok:true}],[200,{ok:true}],[200,{ok:true,total:100,ref:'wrong'}]]) {
    globalThis.fetch=async()=>Response.json(data,{status});
    await assert.rejects(order.submitOrder(payload()));
    assert.equal(cart.getCartCount(),1);
  }
});
test('checkout client reuses refs on retry and rotates them for changed orders', async () => {
  const refs=[];
  globalThis.fetch=async(url,opts)=> { const p=JSON.parse(opts.body); refs.push(p.client_ref); return Response.json({ok:true,ref:p.client_ref,total:100}); };
  await order.submitOrder(payload()); await order.submitOrder({...payload(),turnstile_token:'new token'});
  await order.submitOrder({...payload(),address:'Changed street'});
  assert.equal(refs[0],refs[1]); assert.notEqual(refs[1],refs[2]);
});
test('admin never reports failed saves or uploads as success', {skip: !adminPresent}, async () => {
  globalThis.fetch=async()=>Response.json({error:'Unauthorized'},{status:401});
  await assert.rejects(api.products.create(product));
  await assert.rejects(api.uploadImage(new Blob(['test']),null));
  await assert.rejects(api.status());
  assert.equal(localStorage.getItem('admin_local_products'),null);
});


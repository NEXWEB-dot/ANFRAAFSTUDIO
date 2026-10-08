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
const { validateProduct } = backendPresent ? await import('../anraf backend/shared/validate.js') : {};
const { mustUseEmergency } = backendPresent ? await import('../anraf backend/shared/mode.js') : {};
const adminPresent = fs.existsSync('admin/js/api.js');
const { api } = adminPresent ? await import('../admin/js/api.js') : {};
const cron = backendPresent ? (await import('../anraf backend/workers/cron/index.js')).default : null;
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
  globalThis.fetch = async () => Response.json({source:'sanity',generated_at:'2026-09-01T00:00:00Z', products:[]});
  let latest;
  const result = await catalog.loadCatalog(c => { latest = c; });
  assert.deepEqual(result.products,[]); assert.deepEqual(latest.products,[]);
});
test('catalog callback is optional and local admin data never overrides live data', async () => {
  localStorage.setItem('admin_local_products',JSON.stringify([{...product,price:1}]));
  globalThis.fetch = async () => Response.json(cat);
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
  globalThis.fetch = async () => {calls++; return Response.json(current);};
  await Promise.all([catalog.loadCatalog(),catalog.loadCatalog(),catalog.loadCatalog()]);
  assert.equal(calls,1);
  await catalog.loadCatalog(); assert.equal(calls,1);
  localStorage.setItem('catalog:sanity:v3',JSON.stringify({data:current,ts:Date.now()-901000}));
  await catalog.loadCatalog(); assert.equal(calls,2);
});

test('browser cache expires and cannot resurrect the legacy demo catalog', async () => {
  globalThis.fetch = async () => {throw new Error('offline');};
  localStorage.setItem('catalog:v1',JSON.stringify({data:cat,ts:Date.now()}));
  assert.equal((await catalog.loadCatalog()).unavailable,true);
  localStorage.setItem('catalog:sanity:v3',JSON.stringify({data:cat,ts:Date.now()-901000}));
  assert.equal((await catalog.loadCatalog()).products.length,1);
  localStorage.setItem('catalog:sanity:v3',JSON.stringify({data:cat,ts:Date.now()-86400001}));
  assert.equal((await catalog.loadCatalog()).products.length,0);
});

test('cart accepts generated Sanity IDs and rejects draft IDs', () => {
  cart.addToCart('SanityAutoId123',2,'Large');
  cart.addToCart('drafts.hidden');
  cart.addToCart(undefined); cart.addToCart(null); cart.addToCart(123);
  assert.deepEqual(cart.normalizeCart([{qty:1},{product_id:null,qty:1}]),[]);
  assert.deepEqual(cart.getCart(),[{product_id:'SanityAutoId123',qty:2,size:'Large'}]);
});

const payload = () => ({client_ref:ref,name:'Test Customer',phone:'+923001234567',address:'Test street, Karachi',notes:'',items:[{product_id:id,qty:1,size:'Medium'}],turnstile_token:'token'});
function environment() {
  const objects = new Map();
  const bucket = {
    head: async k => objects.has(k) ? {} : null,
    get: async k => objects.has(k) ? {json:async()=>JSON.parse(objects.get(k))} : null,
    put: async (k,v,opts) => { if (opts?.onlyIf && objects.has(k)) return null; objects.set(k,v); return {}; },
    list: async () => ({objects:[]}),
  };
  return {SITE_ORIGIN:'https://shop.example.test',TURNSTILE_SECRET:'test',SUPABASE_SERVICE_KEY:'test',SUPABASE_URL:'https://db.example.test',PRIVATE:bucket,PUBLIC:{get:async()=>({json:async()=>cat})},objects};
}
async function call(body, env = environment(), origin = env.SITE_ORIGIN) {
  const tasks = [];
  const response = await checkout({request:new Request(env.SITE_ORIGIN+'/api/checkout',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)}),env,waitUntil:p=>tasks.push(p)});
  await Promise.allSettled(tasks);
  return response;
}
function mockBackend(capture = () => {}) {
  globalThis.fetch = async (url,options) => {
    if (String(url).includes('siteverify')) return Response.json({success:true,hostname:'shop.example.test'});
    if (String(url).includes('apicdn.sanity.io')) return Response.json({result:[product]});
    if (String(url).includes('place_sanity_order')) { capture(JSON.parse(options.body)); return Response.json({total:100,order_number:1001}); }
    return Response.json({});
  };
}
backendTest('checkout rejects wrong origin before any bot or database request', async () => {
  globalThis.fetch=()=>assert.fail('must not fetch');
  assert.equal((await call(payload(),environment(),'https://evil.test')).status,403);
});
backendTest('checkout rejects JSON null, arrays and oversized bodies', async () => {
  for (const p of [null,[], 'x'.repeat(21000)]) assert.ok([400,413].includes((await call(p)).status));
});
backendTest('checkout rejects missing bot token and wrong verification hostname', async () => {
  mockBackend(); assert.equal((await call({...payload(),turnstile_token:''})).status,403);
  globalThis.fetch=async()=>Response.json({success:true,hostname:'evil.test'});
  assert.equal((await call(payload())).status,403);
});
backendTest('checkout rejects null lines, fractions, excessive lines and invalid sizes', async () => {
  mockBackend();
  for (const items of [[null],[{product_id:id,qty:1.1}],Array(31).fill({product_id:id,qty:1}),[{product_id:id,qty:1,size:'invalid'}]]) {
    assert.equal((await call({...payload(),items})).status,400);
  }
});
backendTest('successful checkout uses Pages waitUntil and forwards sizes without client prices', async () => {
  let args;
  mockBackend(a => { args = a; });
  const body = payload(); body.items[0].price = 1; body.items[0].name = 'Forged';
  const response = await call(body);
  assert.equal(response.status,200); assert.equal((await response.json()).total,100);
  assert.deepEqual(args.p_items,[{product_id:id,qty:1,size:'Medium',name:'Shirt',price:100}]);
  assert.equal(args.p_force,false);
});
backendTest('offline order capture is durable and idempotent', async () => {
  mockBackend(); const env=environment();
  env.objects.set('state/mode.json',JSON.stringify({mode:'emergency',until:0}));
  assert.equal(await mustUseEmergency(env),true);
  assert.equal((await call(payload(),env)).status,200);
  const saved=JSON.parse(env.objects.get(`orders-pending/${ref}.json`));
  assert.equal(saved.items[0].size,'Medium'); assert.equal(saved.total,100);
  assert.equal(saved.catalog_source,'sanity');
  assert.equal((await (await call(payload(),env)).json()).total,100);
});

backendTest('checkout accepts Sanity IDs and fails closed for sold-out, removed or unavailable products', async () => {
  let saved;
  let result = [{...product,id:'SanityAutoId123'}];
  let fail = false;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('siteverify')) return Response.json({success:true,hostname:'shop.example.test'});
    if (String(url).includes('apicdn.sanity.io')) return fail ? Response.json({}, {status:503}) : Response.json({result});
    if (String(url).includes('place_sanity_order')) {saved=JSON.parse(options.body);return Response.json({total:100,order_number:1001});}
    return Response.json({});
  };
  const body={...payload(),items:[{product_id:'SanityAutoId123',qty:1,size:'Small',price:1}]};
  assert.equal((await call(body)).status,200);
  assert.equal(saved.p_items[0].price,100);
  result[0].discountPercent=20;
  result[0].sizes=['Small'];
  assert.equal((await call(body)).status,200);
  assert.equal(saved.p_items[0].price,80);
  const wrongSize={...body,items:[{...body.items[0],size:'Medium'}]};
  assert.equal((await (await call(wrongSize)).json()).error,'SIZE_UNAVAILABLE');
  result[0].in_stock=false;
  assert.equal((await (await call(body)).json()).error,'OUT_OF_STOCK');
  result=[];
  assert.equal((await (await call(body)).json()).error,'PRODUCT_UNAVAILABLE');
  fail=true;
  assert.equal((await call(body)).status,503);
});
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
backendTest('image validation rejects CDN prefix spoofing and unsafe thumbnails', () => {
  const p={...product,images:[{r2_key:'img/test.jpg',url:'https://cdn.example.test/img/test.jpg'}]};
  assert.equal(validateProduct(p,'https://cdn.example.test').images.length,1);
  for (const url of ['https://cdn.example.test.evil.test/img/test.jpg','javascript:alert(1)']) {
    assert.throws(()=>validateProduct({...p,images:[{...p.images[0],url}]},'https://cdn.example.test'));
  }
  assert.throws(()=>validateProduct({...p,images:[{...p.images[0],thumb_r2_key:'catalog/products.json',thumb_url:'https://cdn.example.test/catalog/products.json'}]},'https://cdn.example.test'));
});
backendTest('nightly backups use stable cursors and never overwrite earlier order batches', async () => {
  const env=environment();
  const queries=[];
  let run=0;
  env.PRIVATE.delete=async()=>{};
  env.PUBLIC.get=async()=>null;
  globalThis.fetch=async url=> {
    queries.push(String(url));
    if (String(url).includes('updated_at=lte')) return Response.json([{id,updated_at:'2026-10-01T00:00:00Z',total:100,run}]);
    return Response.json([], {headers:{'Content-Range':'0-0/0'}});
  };
  for (run=0;run<2;run++) {
    const tasks=[];
    cron.scheduled({cron:'0 3 * * *'},env,{waitUntil:p=>tasks.push(p)});
    await Promise.all(tasks);
  }
  const backups=[...env.objects.keys()].filter(k=>k.startsWith('backups/db/orders-'));
  assert.equal(backups.length,2);
  assert.equal(JSON.parse(env.objects.get('state/backup-cursor.json')).id,id);
  assert.ok(queries.some(q=>q.includes(`id.gt.${id}`)));
  assert.ok(queries.every(q=>!q.includes('offset=')));
});
test('admin never reports failed saves or uploads as success', {skip: !adminPresent}, async () => {
  globalThis.fetch=async()=>Response.json({error:'Unauthorized'},{status:401});
  await assert.rejects(api.products.create(product));
  await assert.rejects(api.uploadImage(new Blob(['test']),null));
  await assert.rejects(api.status());
  assert.equal(localStorage.getItem('admin_local_products'),null);
});

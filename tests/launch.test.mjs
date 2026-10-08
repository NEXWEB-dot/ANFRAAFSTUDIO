import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/[[path]].js';
import { productionConfig } from '../tools/production-config.mjs';

const env = { BACKEND_ORIGIN: 'https://api.shop.test' };
const request = (path, method='GET', origin='https://shop.test') => new Request('https://shop.test'+path, {
  method, headers:{Origin:origin,'Content-Type':'application/json'},
  ...(method==='POST' ? {body:'{"test":true}'} : {}),
});
test('API bridge fails closed without configuration and rejects unwanted routes/methods', async () => {
  assert.equal((await onRequest({request:request('/api/config'),env:{}})).status,503);
  assert.equal((await onRequest({request:request('/api/admin/orders'),env})).status,404);
  assert.equal((await onRequest({request:request('/api/checkout'),env})).status,405);
  assert.equal((await onRequest({request:request('/api/checkout','POST','https://evil.test'),env})).status,403);
});
test('API bridge rejects self-proxy loops and unsafe upstream configuration', async () => {
  for (const host of ['https://shop.test','http://api.shop.test','https://user:pass@api.shop.test','https://api.shop.test/path'])
    assert.equal((await onRequest({request:request('/api/config'),env:{BACKEND_ORIGIN:host}})).status,503);
});
test('API bridge forwards only allowed data and preserves failure responses', async () => {
  const previous=globalThis.fetch;
  try {
    let forwarded;
    globalThis.fetch=async(url,options)=>{
      forwarded={url:String(url),options};
      assert.equal(await new Response(options.body).text(),'{"test":true}');
      return Response.json({error:'OUT_OF_STOCK'},{status:409});
    };
    const req=request('/api/checkout','POST');
    req.headers.set('Authorization','must-not-forward');
    const response=await onRequest({request:req,env});
    assert.equal(response.status,409);
    assert.equal(response.headers.get('Cache-Control'),'no-store');
    assert.equal(forwarded.url,'https://api.shop.test/api/checkout');
    assert.equal(forwarded.options.headers.get('Origin'),'https://shop.test');
    assert.equal(forwarded.options.headers.get('Authorization'),null);
    assert.equal(forwarded.options.redirect,'manual');
  } finally {globalThis.fetch=previous;}
});
test('API bridge rejects redirects and HTML login/error pages', async () => {
  const previous=globalThis.fetch;
  try {
    for (const response of [new Response(null,{status:302}),new Response('<html>login</html>')]) {
      globalThis.fetch=async()=>response;
      assert.equal((await onRequest({request:request('/api/config'),env})).status,502);
    }
  } finally {globalThis.fetch=previous;}
});

test('API bridge preserves catalog cache lifetime but never caches checkout/config/errors', async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({products:[]},{headers:{'Cache-Control':'public, max-age=30, s-maxage=30'}});
    assert.equal((await onRequest({request:request('/api/catalog'),env})).headers.get('Cache-Control'),'public, max-age=30, s-maxage=30');
    assert.equal((await onRequest({request:request('/api/config'),env})).headers.get('Cache-Control'),'no-store');
    globalThis.fetch = async () => Response.json({error:'down'},{status:503,headers:{'Cache-Control':'public, max-age=60'}});
    assert.equal((await onRequest({request:request('/api/catalog'),env})).headers.get('Cache-Control'),'no-store');
  } finally {globalThis.fetch=previous;}
});
test('production build configuration rejects missing settings and placeholder contacts', () => {
  assert.throws(()=>productionConfig({}),/SITE_ORIGIN/);
  const settings={SITE_ORIGIN:'https://shop.test',BACKEND_ORIGIN:'https://api.shop.test',PUBLIC_CDN_ORIGIN:'https://cdn.shop.test',WHATSAPP_URL:'https://wa.me/923219876543'};
  assert.equal(productionConfig(settings).SITE_ORIGIN,settings.SITE_ORIGIN);
  assert.throws(()=>productionConfig({...settings,WHATSAPP_URL:'https://wa.me/923000000000'}));
  assert.throws(()=>productionConfig({...settings,BACKEND_ORIGIN:settings.SITE_ORIGIN}));
});

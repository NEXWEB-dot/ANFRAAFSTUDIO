// Same-origin bridge to the separately deployed backend. No admin routes here.
const routes = new Map([['/api/config', 'GET'], ['/api/catalog', 'GET'], ['/api/checkout', 'POST']]);
const json = (body, status) => Response.json(body, { status, headers: {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
} });
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const method = routes.get(url.pathname);
  if (!method) return json({ error: 'NOT_FOUND' }, 404);
  if (request.method !== method) return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  if (method === 'POST' && request.headers.get('Origin') !== url.origin)
    return json({ error: 'forbidden' }, 403);
  let backend;
  try {
    backend = new URL(env.BACKEND_ORIGIN);
    if (backend.protocol !== 'https:' || backend.username || backend.password ||
        backend.pathname !== '/' || backend.search || backend.hash || backend.origin === url.origin) throw new Error();
  } catch { return json({ error: 'CHECKOUT_PAUSED' }, 503); }
  try {
    const headers = new Headers();
    if (url.pathname === '/api/catalog' && request.headers.has('If-None-Match'))
      headers.set('If-None-Match', request.headers.get('If-None-Match'));
    if (method === 'POST') {
      headers.set('Origin', url.origin);
      headers.set('Content-Type', request.headers.get('Content-Type') || '');
    }
    const response = await fetch(new URL(url.pathname, backend), {
      method, headers, body: method === 'POST' ? request.body : undefined,
      redirect: 'manual', signal: AbortSignal.timeout(18000),
    });
    if (url.pathname === '/api/catalog' && response.status === 304) {
      return new Response(null, {status: 304, headers: {
        'ETag': response.headers.get('ETag') || '',
        'Cache-Control': response.headers.get('Cache-Control') || 'no-store',
        'X-Content-Type-Options': 'nosniff',
      }});
    }
    if ((response.status >= 300 && response.status < 400) ||
        !response.headers.get('Content-Type')?.includes('application/json'))
      return json({ error: 'ORDER_FAILED' }, 502);
    return new Response(response.body, { status: response.status, headers: {
      'Content-Type': 'application/json', 'Cache-Control': url.pathname === '/api/catalog' && response.ok
        ? response.headers.get('Cache-Control') || 'no-store' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(url.pathname === '/api/catalog' && response.ok && response.headers.has('ETag')
        ? {'ETag': response.headers.get('ETag')} : {}),
    } });
  } catch { return json({ error: 'ORDER_FAILED' }, 502); }
}

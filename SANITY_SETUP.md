# Sanity catalog and caching — 9 October 2026

The storefront reads published products directly from the public Sanity API CDN
(project m7hktaor, dataset production). This works on GitHub Pages; it needs no
Cloudflare API route, R2 bucket, Supabase database, or browser API token.

## Cache behavior
- Stable CDN query URL; published perspective; no timestamp cache-busters.
- Browser snapshot: five minutes without another catalog request on navigation.
- Expired snapshots render immediately while a single shared request refreshes them.
- A failed refresh can reuse a validated snapshot for at most 24 hours.
- A successful empty collection clears old products. Errors never overwrite good data.
- Every successful refresh renders all changes, including prices, sizes and pictures.
- Image URLs use Sanity's asset CDN with automatic formats, quality 80, and widths
  capped at 480px for thumbnails and 1200px for detail images.
- The optional backend catalog cache is five minutes per Cloudflare edge location.
- Server checkout has a separate 60-second edge cache. It does not trust browser
  prices or the browser outage fallback. Sanity CDN propagation adds its own delay.
- Backend catalog ETags hash the whole response. Checkout responses use no-store.

## Publishing
Publish product changes in Sanity. Reload/navigate after the five-minute browser
window to refresh the collection. No website rebuild is needed for product browsing.
Run `node tools/sync-sanity-seo.mjs` when publishing/removing products to refresh the
static sitemap, then publish the updated sitemap. Product metadata updates in JS;
full prerendered product pages are not implemented.

## Orders
Supabase/R2 code is archived outside the active deploy tree in security-audit.
The new backend validates Sanity prices and emails orders through Resend. Customer
names, phones and delivery addresses are never written to the public Sanity dataset.
The legacy database-backed dashboard and automatic stock counting are not used.
See LAUNCH_READINESS.md for the remaining live configuration.

The product JSON backup lives only in the backend repository under backups/. It is not a storefront fallback. During a CDN outage, only an existing browser snapshot (maximum age 24 hours) can keep products visible; first-time visitors see the unavailable message.

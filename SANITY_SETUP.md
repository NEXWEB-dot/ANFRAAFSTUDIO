# Sanity product catalog

## Product editor controls

- **Price before discount + Discount (%)**: enter e.g. 20 for 20% off. The storefront
  displays the original and reduced price; checkout charges the reduced price.
  Leave Original price empty when using a percentage. The older Original price field
  remains available as an alternative way to enter an explicit sale price.
- **Stock status / Sold out**: sold-out products remain visible in the shop but cannot be ordered.
- **Available sizes**: select Small, Medium, Large and/or XL. Only selected sizes can
  be ordered. Removing a size also makes existing bag lines for that size unavailable.
- **Gallery images**: up to eight photos, drag to reorder. First = main image,
  second = hover image, all = product gallery. Add image descriptions for accessibility.
- **Storefront filters**: select one or more of Lawn, Embroidered, Heritage and Ready
  to Wear. Products appear in every selected filter and All. Leaving this empty uses
  the primary Category. Category still supplies the product's displayed label.

Publish changes in Sanity. The existing caching windows still apply. Redeploy the
Studio and application code for new controls to be available on hosted versions.

Products are edited in `../anraf-studio`, project **m7hktaor**, dataset **production**.
Orders and the existing order dashboard remain on Supabase. No product rows need to
be created in Supabase. Legacy product-edit/upload API routes return 410 after admin
authentication. Old product editor pages now link to the Sanity project.

## Before deploying

1. Apply `anraf backend/supabase/migrations/003_sanity_orders.sql` in Supabase after
   migrations 001 and 002. This adds a separate Sanity order function and a text
   product identifier, preserving historical UUID product links and orders.
2. From `../anraf-studio`, run `npm run dev` to edit locally, or `npm run deploy`
   to publish the updated Studio. Create and **publish** a Product with images.
3. Deploy the updated backend, cron worker, storefront and admin files. The existing
   `BACKEND_ORIGIN` bridge configuration is still required for the storefront.
4. Keep the Sanity dataset public. Product reads need no token; do not add a write
   token to the storefront. Backend/cron `SANITY_PROJECT_ID` and `SANITY_DATASET`
   optionally override the configured defaults above. Both deployments must agree.
5. Place a staging order and verify its size, price and status in the order dashboard.

The live CDN query was verified on 2026-10-08 and returned zero published products.
No content import, remote schema deployment or production database migration is
performed by the local build. Old sample products are no longer a catalog fallback.

## Usage and freshness

- Stable, published-only GROQ GET queries go to **apicdn.sanity.io**, selecting only
  required fields. No subscriptions, per-product requests, tokens or cache-busters.
- Cloudflare Cache API shares the catalog for **15 minutes per edge location**;
  simultaneous misses within one worker are coalesced into one fetch. This is not a
  global singleton cache. Evictions, new locations and cold starts can add requests.
- Browser local storage uses the snapshot generation time, so navigating/reloading
  within that same 15-minute window does not request another catalog. HTTP cache
  headers use the remaining lifetime instead of extending stale snapshots.
- Only previously fetched Sanity data can survive a network failure, for at most
  **24 hours**. A successful empty catalog replaces older products. Failed responses
  are never stored as successful catalogs. Without a valid snapshot, the shop shows
  an empty/unavailable state instead of demo products.
- Checkout independently reads a **60-second** edge cache backed by Sanity's CDN,
  validates availability and supplies authoritative prices to the database. Sanity's
  own CDN freshness also applies. Checkout fails closed when Sanity is unavailable;
  if only Supabase is unavailable, validated orders are captured in private R2 and
  replayed with their original price/name/size snapshots.
- Images use Sanity's immutable asset CDN URLs, automatic format selection, quality
  80, and bounded widths (480px thumbnails / 1200px detail images). Uploading a new
  image changes its URL and avoids stale-image invalidation.

Availability is manually set to **In stock / Sold out** in Sanity. This phase does
not implement automatic stock reservation, counts or decrements. Legacy order
stock-restoration behavior remains limited to historical Supabase product IDs.
The dashboard's product summary now shows published availability, not stock counts.
Its existing order activity remains; expanded analytics are a separate phase.

The sync control/cron saves a backup of the cached Sanity catalog in R2; it does not
publish products or bypass the browsing TTL. Publish in Sanity and allow roughly
15 minutes plus upstream CDN propagation for all browsing caches to refresh.

Sanity reference: https://www.sanity.io/docs/content-lake/api-cdn

## Local verification

- 42 tests passed, covering discounts, size availability, collection filters, gallery
  mapping, SQL migrations/permissions, order snapshots, cache
  expiry/deduplication, empty catalogs, unsafe prices and unavailable products.
- Dashboard behavior check passed; storefront/backend builds, Studio build and
  Studio TypeScript checks passed.
- Visual browser check could not be completed: the browser tool timed out twice.
- Production deployment and a real staging order remain unverified.

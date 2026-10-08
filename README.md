# ANRAF Studio storefront

Products and images use Sanity's CDN. Checkout uses the separate Sanity + Resend
backend; no Supabase or R2 is needed in the active flow.

## Cloudflare Pages

- Repository: NEXWEB-dot/ANFRAAFSTUDIO; branch: main.
- Node: 22 or newer. Build: npm run build. Output: dist.
- Runtime BACKEND_ORIGIN: the separately deployed backend's HTTPS origin.
- Production build settings: see .env.example and LAUNCH_READINESS.md.
- Homepage: index.html. Keep functions/ at the repository root for the API bridge.

Run npm ci, npm test and npm run build. The build recreates dist from an allowlist;
source documentation, tests, development tools and secrets are not public assets.

## Included files

- HTML pages, css/ and js/: storefront and checkout UI.
- assets/: homepage photos and the product-image fallback still in use.
- Product JSON and image backups live only in the backend repository.
- functions/: Cloudflare same-origin checkout/config bridge.
- tools/, tests/, package files and wrangler.toml: build, validation and deployment.
- SANITY_SETUP.md: CDN and caching behavior.
- LAUNCH_READINESS.md: remaining live setup and acceptance checks.

Run node tools/sync-sanity-seo.mjs after publishing/removing products to regenerate
the sitemap. Set SITE_URL to the live base URL, ending in /.

Skeletons are shown while product data loads. Gallery thumbnails, hover photos,
related products and below-fold catalog images use native lazy loading; the main
product photo and first two catalog photos load promptly. Reduced-motion settings
turn off skeleton animation.

Checkout is not launch-ready until the backend, Resend sender/recipient, Turnstile,
real contact details and storefront domain are configured and tested end to end.

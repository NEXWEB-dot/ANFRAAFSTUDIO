# ANRAF Studio — Luxury E-Commerce Storefront

Official customer-facing website and luxury storefront for **ANRAF Studio**.

## 🛍️ Live Storefront Pages
- **[`index.html`](./index.html)** — Luxury brand homepage featuring the curated hero carousel, new arrivals, and collection showcases.
- **[`store.html`](./store.html)** — Interactive catalog page with responsive category filtering, sorting, and dynamic product grids.
- **[`product.html`](./product.html)** — Product details page with high-resolution image gallery, color/size picker, and instant add-to-bag.
- **[`cart.html`](./cart.html)** — Interactive shopping bag with quantity controls and real-time order pricing.
- **[`checkout.html`](./checkout.html)** — High-converting checkout with Cash on Delivery (COD) and real-time validation.
- **[`order-confirmed.html`](./order-confirmed.html)** — Post-checkout confirmation and invoice receipt.

## 📁 Directory Structure
```
/
├── assets/                  # Brand imagery, photography, and lookbooks
├── css/                     # Storefront styling (store.css)
├── js/                      # Frontend JavaScript modules (cart.js, catalog.js, checkout.js)
├── data/                    # Fallback catalog JSON (products.fallback.json)
├── index.html               # Main homepage
├── store.html               # Shop catalog
├── product.html             # Product view
├── cart.html                # Cart page
├── checkout.html            # Checkout page
├── order-confirmed.html     # Order success screen
├── robots.txt               # Search engine crawl directives
├── sitemap.xml              # SEO sitemap
└── _headers                 # Edge CDN caching & security headers
```

## 🚀 Deployment
Use Node.js 22+ and `npm ci`, then `npm test` and `npm run build`.
The static build output is `dist/`. Do not publish the workspace root: local backend,
administration, tooling and configuration folders are not public assets.

Deploy this repository as a Cloudflare Pages project with build command `npm run build`
and output `dist/`. Root `functions/` supplies the public API bridge; set its runtime
`BACKEND_ORIGIN` to the separately deployed backend Pages URL. The backend now builds
independently to its own `dist/`; no adjacent frontend or admin checkout is needed.
The admin dashboard remains a separate deployment and is not included in either build.

Set `LAUNCH_MODE=production` and the public settings in `.env.example` for a production
build. `npm run check:launch` checks those settings without revealing secrets. Builds
substitute the actual public domain, CDN and contact number, then regenerate CSP hashes.
Preview builds deliberately work without credentials and do not imply launch readiness.

After editing inline scripts, run `npm run update:csp` (also run by both builds). The
generated `_headers` uses hashes instead of permitting arbitrary inline JavaScript.
Hosts that do not support `_headers`, including GitHub Pages, require equivalent headers
configured separately.

See [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) for fixes, verification and rollout requirements.
The current deployment sequence and remaining blockers are in [LAUNCH_READINESS.md](./LAUNCH_READINESS.md).

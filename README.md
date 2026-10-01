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
├── public/                  # Static production build files
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
This repository is optimized for zero-dependency static edge hosting:
- **Cloudflare Pages** (Build output: `/` or `public`)
- **GitHub Pages**
- **Netlify / Vercel**

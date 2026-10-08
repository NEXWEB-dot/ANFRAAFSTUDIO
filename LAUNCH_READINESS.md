# Launch readiness — 9 October 2026

Product browsing uses Sanity directly and is compatible with GitHub Pages.
Online orders are NOT enabled until the following setup is completed and tested.

1. Deploy `anraf backend` to Cloudflare Pages (npm run build, output dist; include
   functions/). No R2 bindings, Supabase service, migrations or cron worker required.
2. Set SITE_ORIGIN=https://nexweb-dot.github.io. Set server-only RESEND_API_KEY,
   MAIL_FROM (verified sender), ADMIN_NOTIFY_EMAIL, TURNSTILE_SECRET and the public
   TURNSTILE_SITE_KEY. Set CHECKOUT_ENABLED=true only after configuration is ready.
3. Set API_ORIGIN in js/api-config.js to the deployed HTTPS backend origin. Add this
   origin to connect-src in _headers when deploying to Cloudflare Pages.
4. Verify the sending domain in Resend and allow the storefront hostname in Turnstile.
5. Place a real staging order and verify receipt in the receiving mailbox. Test retry,
   sold-out products, unavailable sizes and failed delivery with the bag retained.
6. Replace placeholder WhatsApp contacts. Confirm actual shipping, return and privacy
   terms before accepting customer traffic. Customer details are sent to Resend.
7. Configure edge rate limits for checkout. Turnstile is required server-side.

Resend acceptance is not guaranteed inbox delivery. Monitor Resend delivery events
and the order mailbox. Resend idempotency has a 24-hour window, not permanent order
storage. There is no private order database, historical order dashboard or inventory
reservation in this email-only flow. Preserve any previous production order records.

GitHub Pages ignores Cloudflare _headers. Header-based CSP and frame protection need
an appropriate hosting/proxy configuration; do not treat that file as active there.
SEO now points to the actual GitHub Pages base URL, omits cart/checkout/receipt pages
from indexing and uses a sitemap of published Sanity products. Update SITE_URL and
canonical URLs if switching to a custom domain. Search indexing is not guaranteed.

Security status: regression tests cover input limits, XSS escaping, server pricing,
bot checks, CORS, email failures, retries and cache expiry. Backend tooling was updated
to the patched Wrangler release. Sanity's dependency audit must be checked separately;
local tests do not establish that every vulnerability or production setting is resolved.

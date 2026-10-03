# Launch readiness — 3 October 2026

**Verdict: ready for deployment setup and staging, not ready to accept customer orders.**

## Prepared without credentials

- Independent frontend and backend Cloudflare Pages builds, each using `dist/`.
- Frontend bridge for `/api/config`, `/api/catalog` and `/api/checkout`. It rejects
  unwanted routes, wrong methods/origins, unsafe upstream URLs, redirects and HTML errors.
- Live catalog loading from the backend's public R2 catalog; browser code never receives
  database credentials. The committed fallback remains available for browsing outages.
- Production build settings for the store domain, CDN, backend origin and WhatsApp link.
  Invalid/missing settings block a production build; preview builds remain available.
- Generated CSP hashes after public configuration substitution, and limited function routes.
- Blank backend configuration template and public frontend settings template.
- Bank transfer disabled until actual payment instructions and a verification process exist.
- Existing checkout, cart, database permission, stock and recovery regression coverage.

## Deployment sequence

1. Create Supabase and run `001_init.sql` for a new database. On an existing installation,
   run `002_order_sizes.sql` instead of recreating the initial schema.
2. Create the R2 buckets `store-public` and `store-private`. Connect only the public bucket
   to the CDN domain; private order data and backups must remain private.
3. Deploy the backend repository to Pages: Node 22+, build `npm run build`, output `dist`.
   Configure the R2 bindings and settings in its `.env.example` / `wrangler.toml`.
4. Configure Turnstile for the shopper hostname, Access for backend admin APIs, and Resend
   with a verified sending domain. Configure and deploy the separate cron Worker with
   its own bindings and required secrets; Pages settings do not automatically configure it.
5. In the frontend Pages project set `BACKEND_ORIGIN` to the backend Pages URL at runtime.
   Set `LAUNCH_MODE=production`, `SITE_ORIGIN`, `PUBLIC_CDN_ORIGIN`, and `WHATSAPP_URL`
   for the build. Set Node 22+, build `npm run build`, output `dist`. Pages must compile
   the root `functions/` directory; a plain static upload alone cannot process orders.
6. Configure backend `SITE_ORIGIN` to match the frontend exactly. Configure `ADMIN_ORIGIN`
   to match the dashboard. Complete the separate dashboard deployment and authenticated
   API connectivity; dashboard fixes were intentionally not pushed in the prior request.
7. Populate and verify actual products, prices, sizes, stock and images in Supabase/R2,
   then publish the first catalog. Seed/fallback products are not a substitute for live inventory.
8. Verify DNS, HTTPS, security headers and the published public settings. Set appropriate
   Cloudflare rate limits for checkout. Complete the staging acceptance checks below.

## Business decisions still needed

- Final store domain, actual WhatsApp contact and customer-support email.
- Confirm actual catalog, prices, sizes, inventory and shipping charges.
- Approved delivery timelines, cancellation/returns/refunds terms and privacy information.
- Confirm claims such as free delivery and open-parcel verification before publishing them.
- Newsletter provider and actual social links, or hide these optional controls for launch.
- COD is the supported initial payment flow. Bank transfers need real instructions and
  reconciliation; selecting a preference is not payment verification.

## Required staging acceptance checks

- A real bot-verified test order saves once with the correct size, phone, price and stock.
- Retrying after a response interruption does not create another order.
- Failed/out-of-stock submissions retain the shopping bag and report a useful error.
- Admin Access permits only intended accounts and order processing works from the dashboard.
- New catalog changes appear on the storefront, including sold-out and removed products.
- Admin notification email arrives; cron recovery/backup jobs and alerts run successfully.
- Test both mobile and desktop with the deployed domains and production headers.
- Exercise cancellation/restocking and a controlled database outage in staging.

The offline recovery architecture does not reserve exact stock while Supabase is down;
coordinate fulfillment and recovery accordingly. Existing concurrency limitations are in
SECURITY_REVIEW.md. Passing configuration checks does not replace these integration tests.

## Local evidence

Both independent builds and both Pages Function bundles compiled successfully. The
regression suite passed 32 tests after the deployment preparation changes, including a
production build with test settings and a backend build in an isolated folder. Running
`npm run check:launch` without production settings correctly returns **NOT READY** and
lists the four missing public settings. No live services were configured or deployed.

Cloudflare references: [Pages routing](https://developers.cloudflare.com/pages/functions/routing/)
and [headers for Functions responses](https://developers.cloudflare.com/pages/configuration/headers/).

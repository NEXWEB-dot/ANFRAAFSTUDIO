# Security and bug review — 2 October 2026

**3 October deployment update:** the backend now builds independently to `dist/`, and
the frontend has a same-origin API bridge. The old adjacent-checkout/public-directory
build instructions below describe the original audit state; use LAUNCH_READINESS.md
for the current deployment sequence. No live integration or production launch is implied.

Reviewed the storefront, local admin dashboard, nested Cloudflare backend, SQL functions,
maintenance worker and dependencies. These are local fixes, not a production deployment
or a guarantee that every possible vulnerability has been eliminated.

## Fixed

- Checkout no longer fabricates order confirmations or clears the bag after failures.
  A successful response must include the matching order reference and a valid total.
- Wired the Turnstile widget and token to the backend, with token expiration/reset,
  verification timeout and hostname validation. Security checks fail closed.
- Corrected the Cloudflare Pages `waitUntil` call that could fail after an order was saved.
- Retained selected sizes through cart changes, checkout, offline capture, replay,
  database storage and admin display. Added the database migration for existing stores.
- Order retries reuse a reference across reloads of the tab; changed order details get
  a new reference. No customer details are persisted in the retry record.
- Escaped dynamic storefront/admin HTML, validated image protocols and enforced exact
  CDN object URLs for both full images and thumbnails.
- Replaced permissive inline-script CSP with hashes, removed inline event handlers,
  and changed caching of mutable JavaScript/CSS so fixes can reach returning visitors.
- Validated stored carts and catalog shape, disallowed invalid quantities/sizes,
  removed local admin overrides from shopper data, and handled empty live catalogs.
- Corrected category URL matching, unavailable-product behavior, the homepage cart
  counter, and cart actions that previously edited the wrong size.
- Bounded checkout/admin JSON input and rejected malformed bodies rather than crashing,
  silently truncating order lines or coercing invalid quantities.
- Hardened admin JWT configuration, allowed algorithms and required claims.
- Fixed the admin client syntax error and removed fake-success/offline sample responses
  for failed saves, uploads, status reads and order operations.
- Added direct order lookup so orders beyond the first results page can be opened.
- Preserved images until delayed cleanup confirms neither catalog references them;
  display publication warnings rather than silently reporting full success.
- Prevented normal catalog sync during pending emergency recovery.
- Backups now use a timestamp plus ID cursor, and unique order-batch files so repeated
  runs do not overwrite earlier batches or skip rows sharing a timestamp.
- Newsletter no longer claims to subscribe an email when no subscription service exists.
- Upgraded Wrangler to 4.147.0, added reproducible lockfiles, and supplied allowlisted
  static/full-site staging builds instead of publishing the workspace root.

## Verification

- `npm test`: 25 tests passed, 0 failed, 0 skipped in this complete local workspace.
- Tests parse all application JavaScript and inline scripts and verify CSP hashes.
- Local PostgreSQL engine applied both migrations and verified denied browser-role
  access, saved sizes, idempotency, stock rollback and one-time cancellation restocking.
- Mocked API tests cover bad origins, invalid tokens, hostname mismatch, malformed and
  oversized requests, offline persistence, order retries and admin failure handling.
- Browser smoke checks: Ready to Wear product discovery, Medium selection, checkout
  review and failure with the bag retained. Homepage navigation works with the stricter
  CSP, without browser console errors during that check.
- `npm run build`: static public assets staged successfully.
- Backend `npm run build`: full public assets staged successfully; CDN refresh retained
  the committed fallback because `PUBLIC_CDN_ORIGIN` is not configured locally.
- Cloudflare Pages Functions compile and maintenance-worker dry-run build pass.
- npm registry audit after the dependency upgrade reported **0 known vulnerabilities**;
  the initial backend audit reported 6 (4 high, 2 moderate).

## Before production rollout

1. Apply `anraf backend/supabase/migrations/002_order_sizes.sql` to the existing database
   before deploying the changed backend. New installations use the updated initial schema.
2. Configure the matching `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` and permitted hostname.
   Deploy `/api/config` and `/api/checkout` on the storefront origin. No secret is exposed
   by `/api/config`; it returns only the public site key.
3. Verify Cloudflare Access protects `/admin/*` as well as `/api/admin/*`, and confirm
   `ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, `ADMIN_EMAILS`, `SITE_ORIGIN`, R2 bindings and service
   credentials in the deployed environment. Add edge rate limits appropriate for checkout.
4. Set the actual catalog CDN origin in storefront configuration and backend settings,
   and replace the existing placeholder WhatsApp contact/bank-payment information.
   The bank-payment confirmation is a payment preference, not proof of payment.
5. Deploy all three sets of changed files: the tracked storefront, the separate backend
   repository, and the local admin folder. The existing root `.gitignore` excludes the
   latter two; their edits will not be included in a storefront-only commit.
6. Rebuild after HTML/script edits so CSP hashes match. Test one staging order end to end
   with real Turnstile, Access, R2, Supabase and email before enabling customer traffic.

## Limits and remaining operational risks

No live credentials, production requests, live migrations or deployments were used.
Cloudflare Access signature verification against the actual tenant, edge header delivery,
real bot challenges, email delivery and external database integration need staging checks.
Offline capture still uses catalog prices and cannot reserve exact database stock while
Supabase is unavailable. The existing multi-object R2 recovery design has not been proven
under overlapping recovery/admin writes; pause such writes during recovery or introduce
serialized coordination before relying on it at high concurrency. Browser confirmation
pages are display receipts; fulfillment must use the authenticated server-side order.
The newsletter needs a real subscription service before it can accept signups.

Backend/admin-dependent tests explicitly skip when those separate local folders are
absent; storefront-only clones can still build and run their frontend checks.

References: [Cloudflare Pages function context](https://developers.cloudflare.com/pages/functions/api-reference/),
[Turnstile client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

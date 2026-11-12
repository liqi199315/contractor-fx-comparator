# Production Launch and Affiliate Onboarding Checklist (`contractorfx.com`)

This runbook covers every manual (`[人工]`) and automated verification step required to take **ContractorFX** (`https://contractorfx.com`) live from `/Users/dake/Projects/aiapp/30_products/contractor-fx-comparator/` and onboard B2B partner programs.

## Live launch status (2026-11-12)

- Production: `https://contractorfx.com/`, Cloudflare Worker `contractor-fx-comparator`, version `e4a15f92-55da-4268-9cd7-c01ab4abe08a`; `www` redirects to the apex with HTTP `301`.
- GA4: property `564010676`, web stream `16325680671`, measurement ID `G-BMWC0P9PW2`. Retention is 14 months; site search and form interaction enhanced measurement are disabled. `payout_calc_export` is a key event counted once per event.
- Google Search Console: `sc-domain:contractorfx.com` verified by DNS; both `liqi199315@gmail.com` and `build-android@charged-sector-382503.iam.gserviceaccount.com` are verified owners. Sitemap `https://contractorfx.com/sitemap-index.xml` submitted with HTTP `204`, read back with HTTP `200`, pending processing.
- IndexNow: submitted 9 URLs, HTTP `202`.
- Production HTML contains the measurement ID and returned HTTP `200` for Googlebot, AdsBot-Google, Bingbot, OAI-SearchBot, ChatGPT-User, and PerplexityBot. Build, launch preflight, and SEO check passed.
- Email Routing: zone `102de3b1af4b76feef4793ac430604f9` is `active`. Routing is `enabled: true`, `status: ready`. `hello@contractorfx.com` and `privacy@contractorfx.com` forward to `liqi199315@gmail.com`. MX, SPF, and DKIM are locked, and `_dmarc` TXT is present.
- Bing Webmaster Tools: `IsVerified: true` via a Cloudflare unproxied `verify.bing.com` CNAME. Sitemap `https://contractorfx.com/sitemap-index.xml` submitted with `SubmitFeed`.
- Shared analytics: registered as `contractorfx` in `../../40_shared/analytics-sites.yaml` (`ga4_property_id: "564010676"`, `G-BMWC0P9PW2`, `sc-domain:contractorfx.com`, `https://contractorfx.com/`). `ga4-report.mjs`, `gsc-report.mjs`, `bing-report.mjs`, and `analytics-registry.test.mjs` each exited `0`.
- Repository: private GitHub repo `https://github.com/liqi199315/contractor-fx-comparator`.
- Still open `[人工]`: community launch posts from `LAUNCH_KIT.md` (Show HN, Reddit, X, Product Hunt) and affiliate applications (Wise Partnerize / Deel). Google sitemap processing is still pending. Live click totals are not copied into this file.

## 1. Run the local pre-launch verification gate

Before purchasing DNS records or deploying to Cloudflare, run the full local gate from `/Users/dake/Projects/aiapp/30_products/contractor-fx-comparator`:

```bash
npm run verify:all
```

Confirm all four stages pass with zero errors:

1. `npm test` passes all 27 Vitest calculation, CSV parser, and standalone CLI unit tests.
2. `npm run build` compiles all 9 content routes (6 calculator routes plus `/about/`, `/privacy/`, `/terms/`), bundles `bin/contractor-fx.mjs`, and copies static assets into `dist/`.
3. `npm run seo:check` validates `dist/` against `https://contractorfx.com`, confirming all 9 routes and 11 required static artifacts (`404.html`, `sitemap-index.xml`, `robots.txt`, `llms.txt`, `_headers`, `og-image.svg`, `og-image.png`, `github-social-preview.png`, `site.webmanifest`, `indexnow-key.txt`, `b7e3d1c84a924f508c6e23b9a1d05e42.txt`), valid PNG magic bytes and minimum 5 KB size, exact canonical URLs, `Organization`/`BreadcrumbList`/`WebApplication`/`FAQPage` JSON-LD, internal link resolution, preview domain `noindex` headers, and zero placeholders or dashes.
4. `npm run test:e2e` passes all 6 Playwright Chromium specs, including local `window.dataLayer` funnel tracking (`config` and `payout_calc_export` with 0 external requests) and `375x812` mobile layout verification.

## 2. Register `contractorfx.com` and configure zone via automated bootstrap (`[人工]`)

Affiliate compliance reviewers at Wise (Partnerize) and Deel inspect domain ownership and require a working domain email address before approving B2B publisher accounts.

Status (2026-11-12): complete. Zone `102de3b1af4b76feef4793ac430604f9` is `active`. Email Routing is `enabled: true`, `status: ready`, for `hello@contractorfx.com` and `privacy@contractorfx.com` (forward to `liqi199315@gmail.com`), with locked MX, SPF, DKIM, and `_dmarc` TXT.

1. Register `contractorfx.com` directly in Cloudflare Registrar (or point nameservers to your Cloudflare account).
2. Run the automated zone bootstrap utility to configure DNS, Email Routing, and Worker domain binding:
   ```bash
   node ../../_ops/research/indie-site-workflow-20261112/tools/cf-zone-bootstrap.mjs --domain contractorfx.com --email hello@contractorfx.com
   ```
   This script bootstraps zone DNS records, configures Cloudflare Email Routing for `hello@contractorfx.com`, sets up SSL/TLS encryption rules, and attaches custom worker routing.
3. Send a test email to `hello@contractorfx.com` and confirm receipt before submitting partner applications.
4. Verify trademark hygiene: keep brand naming strictly as **ContractorFX** (`contractorfx.com`) and retain the explicit non-affiliation notice on `/about/` and `/terms/`.

## 3. Deploy static assets to Cloudflare Workers (`[人工]` `PLAN_90DAY.md` task `P0-2`)

1. Set production build environment variables when building for live deployment (once your GA4 Measurement ID is created in Step 5):
   ```bash
   PUBLIC_SITE_URL=https://contractorfx.com \
   PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX \
   npm run cf:deploy
   ```
   If deploying before creating the GA4 stream, run `PUBLIC_SITE_URL=https://contractorfx.com npm run cf:deploy` first, then redeploy after Step 5.
2. In the Cloudflare dashboard under **Workers & Pages -> `contractor-fx-comparator` -> Settings -> Domains & Routes**:
   - Confirm custom domain `contractorfx.com` is active.
   - Optionally add a redirect rule forwarding `www.contractorfx.com/*` to `https://contractorfx.com/$1` with HTTP 301.
3. Run live HTTP smoke checks against the production edge:
   ```bash
   curl -I https://contractorfx.com/
   curl -I https://contractorfx.com/about/
   curl -I https://contractorfx.com/privacy/
   curl -I https://contractorfx.com/terms/
   curl -I https://contractorfx.com/sitemap-index.xml
   curl -I https://contractorfx.com/llms.txt
   curl -I https://contractorfx.com/indexnow-key.txt
   curl -I https://contractorfx.com/b7e3d1c84a924f508c6e23b9a1d05e42.txt
   curl -I https://contractorfx.com/og-image.png
   curl -I https://contractorfx.com/github-social-preview.png
   ```
   Confirm HTTP `200`, valid TLS certificate, and security response headers served via `dist/_headers`.

## 4. Register Google Search Console, Bing Webmaster Tools, and IndexNow (`[人工]` `PLAN_90DAY.md` task `P0-3`)

Status (2026-11-12): complete for registration and submission. Google Search Console domain verification, sitemap submit, and IndexNow HTTP `202` are recorded above. Bing Webmaster Tools is `IsVerified: true` (Cloudflare unproxied `verify.bing.com` CNAME) and `https://contractorfx.com/sitemap-index.xml` was submitted with `SubmitFeed`. Google sitemap processing is still pending.

1. **Google Search Console (`sc-domain:contractorfx.com`):**
   - Add domain property `contractorfx.com` in Google Search Console and complete Cloudflare DNS TXT verification.
   - Under **Settings -> Users and permissions**, grant `Full` user access to `build-android@charged-sector-382503.iam.gserviceaccount.com` per `../../40_shared/ANALYTICS.md`.
   - Submit `https://contractorfx.com/sitemap-index.xml` under **Sitemaps**.
   - Request indexing for `/`, `/wise-vs-payoneer-fee-calculator/`, `/deel-vs-wise-contractor-payouts/`, and `/batch-contractor-payout-csv-audit/`.
2. **Bing Webmaster Tools and IndexNow:**
   - Import `https://contractorfx.com/` from Google Search Console inside Bing Webmaster Tools (covered by the shared key in `40_shared/bing-webmaster.key`).
   - Submit `https://contractorfx.com/sitemap-index.xml`.
   - Confirm both `https://contractorfx.com/indexnow-key.txt` and `https://contractorfx.com/b7e3d1c84a924f508c6e23b9a1d05e42.txt` return HTTP `200`. Ping IndexNow with the 9 canonical URLs after first deploy.

## 5. Wire GA4 funnel analytics and shared reporting (`[人工]` + `[AI]` tasks `P0-3` & `P0-4`)

Status (2026-11-12): complete. Property `564010676`, measurement ID `G-BMWC0P9PW2`, and the `contractorfx` entry in `../../40_shared/analytics-sites.yaml` are live (`sc-domain:contractorfx.com`, `https://contractorfx.com/`). `ga4-report.mjs`, `gsc-report.mjs`, `bing-report.mjs`, and `analytics-registry.test.mjs` each exited `0`.

1. In Google Analytics 4, create a property named `ContractorFX` (`https://contractorfx.com`) and copy both the numeric **Property ID** (for API reporting) and the Web Data Stream **Measurement ID** (`G-...`).
2. Grant `Viewer` access on the GA4 property to `build-android@charged-sector-382503.iam.gserviceaccount.com`.
3. In GA4 **Admin -> Data collection and modification -> Data collection**, keep Google Signals disabled to match the `/privacy/` disclosure.
4. Register public IDs only (never secret keys) in `../../40_shared/analytics-sites.yaml` under key `contractorfx`:
   - Repo path: `30_products/contractor-fx-comparator`
   - GA4 numeric property ID
   - GSC site URL: `sc-domain:contractorfx.com`
   - Site URL: `https://contractorfx.com/`
5. Redeploy with `PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX` if not set during Step 3, then verify read access from this directory:
   ```bash
   npm run ga4:report
   npm run gsc:report
   npm run bing:report
   ```
6. Mark `payout_calc_export` (and outbound partner click events once Phase 2 activates) as key events in GA4. Confirm inside GA4 DebugView that zero invoice amounts or CSV strings appear in event payloads.

## 6. Apply to Wise Partnerize and Deel Affiliate programs (`[人工]` `PLAN_90DAY.md` task `P2-1`)

Submit partner applications only after Steps 2 through 4 are complete so human partner managers see a fast, live HTTPS utility with complete `/about/`, `/privacy/`, and `/terms/` disclosures. Use the pre-drafted application pitch blurbs in `LAUNCH_KIT.md`.

Status (2026-11-12): Steps 2 through 4 are complete (Google sitemap processing may still show pending). Wise Partnerize and Deel Affiliate applications remain `[人工]`, together with the Show HN, Reddit, X, and Product Hunt posts in `LAUNCH_KIT.md`.

### 6A. Wise Business Affiliate Program (via Partnerize)

1. **Prerequisites to verify before applying:**
   - `https://contractorfx.com/` and all 5 sub-calculators return HTTP `200`.
   - `https://contractorfx.com/about/` displays the Q4 2026 Tariff Modeling Methodology, Wise non-affiliation notice, and `hello@contractorfx.com` contact address.
   - `https://contractorfx.com/terms/` displays the FTC `16 CFR Part 255` disclosure.
2. **Application steps:**
   - Visit `https://wise.com/us/affiliate-program/` and select **Become a partner** to open the **Partnerize** publisher registration flow.
   - Register using your business entity details and `hello@contractorfx.com` so domain ownership auto-matches `contractorfx.com`.
   - **Promotional property URL:** `https://contractorfx.com/` (also list `/wise-vs-payoneer-fee-calculator/` and `/deel-vs-wise-contractor-payouts/` in the content description).
   - **Traffic and content model description:** Copy the pitch blurb from `LAUNCH_KIT.md` Section 5.3. State clearly that ContractorFX is an independent organic-search B2B financial calculator and browser-local CSV payout benchmarker for CFOs, controllers, and remote engineering teams comparing international contractor disbursement costs, with zero paid brand-keyword search bidding.
   - Complete tax form (W-8BEN / W-8BEN-E / W-9) and payout bank setup inside Partnerize.
3. **Compliance rules once approved:**
   - Never bid on "Wise", "TransferWise", or misspellings in Google Ads or Bing Ads.
   - Use only the official Partnerize tracking link assigned to `contractorfx.com` with `rel="sponsored noopener"`.
   - Keep `src/lib/fx-engine.ts` sorting strictly by lowest calculated `totalFeeDragUsd`.

### 6B. Deel Affiliate / Referral Partner Program

1. **Prerequisites to verify before applying:**
   - Confirm `/deel-vs-remote-contractor-calculator/`, `/deel-vs-wise-contractor-payouts/`, and `/deel-withdrawal-fee-calculator/` are live and accurately state Deel published `$49/contractor/month` Contractor Management list price and compliance scope.
   - Confirm `hello@contractorfx.com` receives external verification emails.
2. **Application steps:**
   - Visit `https://www.deel.com/partners/` (select the **Affiliate Partner** / **Referrals** track powered by Deel partner portal / PartnerStack).
   - Sign up with `hello@contractorfx.com` and list `https://contractorfx.com/` as your primary website.
   - **Audience and promotion summary:** Copy the pitch blurb from `LAUNCH_KIT.md` Section 5.4. Explain that ContractorFX serves startup finance teams and operations managers evaluating when to upgrade from direct bank wires to managed global contractor compliance ($49/month seat break-even calculator across 5+ headcount teams), acquired via organic search SEO and downloadable CFO routing memos.
3. **Compliance rules once approved:**
   - Never run paid search ads targeting "Deel" trademark queries or impersonate official Deel landing pages.
   - Clearly distinguish **Deel Contractor Management** (`$49/month` list rate) from **Deel EOR** in surrounding copy and disclaimers.
   - Hand the approved referral URL to the execution AI (`PLAN_90DAY.md` task `P2-2`) to wire `rel="sponsored noopener"` CTAs and GA4 outbound click tracking without altering calculator math.

## 7. Workspace index refresh (if repository path moved)

Whenever a repository is added or moved into `30_products/`, regenerate the workspace inventory from `/Users/dake/Projects/aiapp`:

```bash
python3 /Users/dake/Projects/aiapp/_ops/generate-project-index.py
```

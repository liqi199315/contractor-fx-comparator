# AGENTS.md

## Session startup order

Read these four files in order at the start of every session before you change code or copy:

1. `PLAN_90DAY.md`
2. `NOW.md`
3. `LAUNCH_CHECKLIST.md`
4. `AGENTS.md`

## Project scope and architecture

- **Site URL.** `https://contractorfx.com` (override with `PUBLIC_SITE_URL` when testing staging origins).
- **Editorial contact.** `hello@contractorfx.com`.
- **Workspace stage.** Formal independent product repository in `30_products/contractor-fx-comparator/`.
- **Tech stack.** Astro 5 (`output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`), Tailwind CSS v4, TypeScript (`astro/tsconfigs/strict`), Vitest, Playwright, Node CLI (`bin/contractor-fx.mjs`), and Cloudflare Workers Static Assets (`wrangler.jsonc`).
- **Fourteen content routes (11 calculator routes + 3 E-E-A-T trust routes).**
	- `/` (`dist/index.html`)
	- `/wise-vs-payoneer-fee-calculator/` (`dist/wise-vs-payoneer-fee-calculator/index.html`)
	- `/deel-vs-remote-contractor-calculator/` (`dist/deel-vs-remote-contractor-calculator/index.html`)
	- `/deel-vs-wise-contractor-payouts/` (`dist/deel-vs-wise-contractor-payouts/index.html`)
	- `/deel-withdrawal-fee-calculator/` (`dist/deel-withdrawal-fee-calculator/index.html`)
	- `/batch-contractor-payout-csv-audit/` (`dist/batch-contractor-payout-csv-audit/index.html`)
	- `/fx-markup-calculator/` (`dist/fx-markup-calculator/index.html`)
	- `/payoneer-fees-calculator-india/` (`dist/payoneer-fees-calculator-india/index.html`)
	- `/wise-vs-payoneer-philippines/` (`dist/wise-vs-payoneer-philippines/index.html`)
	- `/fiverr-payoneer-withdrawal-fee/` (`dist/fiverr-payoneer-withdrawal-fee/index.html`)
	- `/upwork-withdrawal-fee-payoneer/` (`dist/upwork-withdrawal-fee-payoneer/index.html`)
	- `/about/` (`dist/about/index.html`)
	- `/privacy/` (`dist/privacy/index.html`)
	- `/terms/` (`dist/terms/index.html`)
- **Auxiliary static outputs (11 files in `dist/`).** `404.html`, `sitemap-index.xml`, `robots.txt`, `llms.txt`, `_headers`, `og-image.svg`, `og-image.png`, `github-social-preview.png`, `site.webmanifest`, `indexnow-key.txt`, and `b7e3d1c84a924f508c6e23b9a1d05e42.txt`.
- **Standalone CLI.** `bin/contractor-fx.mjs` bundled via `npm run build:cli` using `esbuild`. Supports single corridor comparison, CSV batch audits, table/markdown/json outputs, and points to `https://contractorfx.com`.
- **Launch distribution assets.** `LAUNCH_KIT.md` compiles X native demo scripts, high-intent boolean search queries, Hacker News factual submission data notes, Reddit educational breakdowns, and directory copy.

## Non-negotiable red lines

1. **Browser-local zero-upload execution.** Every FX spread calculation, provider fee comparison, CSV audit, and Markdown or CSV memo export runs locally in the user browser. Never transmit contractor compensation, team payroll lists, or invoice figures across the network or inside analytics payloads.
2. **Privacy-safe GA4 funnel tracking.** Keep `window.dataLayer` active for funnel observability (`config`, `payout_calc_export`, and sanitized UI events) with IP anonymization enabled and zero external `googletagmanager.com` requests during local `127.0.0.1` verification.
3. **Transparent monetization disclosure.** Maintain strict `rel="sponsored noopener"` and FTC `16 CFR Part 255` disclosures on outbound affiliate links (Wise Partnerize, Deel Affiliate, and peers). Never inject deceptive affiliate redirects or unapproved affiliate tokens before formal partner approval, and never let commercial status change `totalFeeDragUsd` ranking order.
4. **Clean-room MIT licensing.** Keep all calculation models, CSV test fixtures, provider fee schedules, CLI scripts, and page copy original under the MIT License.
5. **Stable UI test contract.** Preserve the `data-testid` attributes required by `tests/e2e/comparator.spec.ts`: `tab-calculator`, `tab-csv`, `invoice-amount-input`, `billing-currency-select`, `payout-currency-select`, `funding-method-select`, `contractor-count-input`, `payouts-per-month-input`, `winner-banner` (with `data-winner`), `provider-comparison-table`, `download-memo-md-btn`, `download-memo-csv-btn`, `csv-input`, `csv-file-upload`, `load-sample-csv-btn`, `csv-status-banner` (with `data-status="ok"` or `data-status="error"`), and `csv-audit-summary`, plus visible footer navigation links to `/about/`, `/privacy/`, and `/terms/`.
6. **Copy hygiene.** Never leave template double-brace placeholders, unresolved action items, dummy Latin copy, em-dashes, or en-dashes in source copy, built HTML, `robots.txt`, `site.webmanifest`, or `llms.txt`. `scripts/seo-preflight.mjs` fails the build check on any match.
7. **Human gate respect.** Tasks marked `[人工]` in `PLAN_90DAY.md` and `LAUNCH_CHECKLIST.md` belong to dake. Never fabricate live metrics or bypass `[人工]` gates.

## Verification commands

Run all checks from `/Users/dake/Projects/aiapp/30_products/contractor-fx-comparator`:

```bash
npm test
npm run build
npm run seo:check
npm run test:e2e
npm run verify:all
```

A change is complete only when `npm run verify:all` exits 0 and both `PLAN_90DAY.md` and `NOW.md` reflect the current state.

## Analytics

This project is `contractorfx` in `../../40_shared/analytics-sites.yaml`.
Read `../../40_shared/ANALYTICS.md` before pulling numbers.
Use `npm run ga4:report`, `npm run gsc:report`, `npm run bing:report`.
Do not pass another site property ID.

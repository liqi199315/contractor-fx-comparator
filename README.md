# ContractorFX

[![Try it in browser](https://img.shields.io/badge/Try%20it%20in%20browser-zero%20upload-10b981?style=flat-square)](https://contractorfx.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro%205-ff5d01?style=flat-square)](https://astro.build)
[![Node CLI](https://img.shields.io/badge/CLI-contractor--fx-slate?style=flat-square)](bin/contractor-fx.mjs)

> Independent international contractor payout fee and FX spread comparator across Wise Business, Payoneer, Deel, Remote, and traditional bank SWIFT wires. Decomposes monthly SaaS seat subscriptions, funding rail charges, fixed withdrawal fees, and mid-market exchange rate markups locally in the browser or via CLI with zero payroll uploads.

---

## GitHub Repository Metadata

- **About description:** Browser-local international contractor payout fee and FX spread comparator across Wise, Payoneer, Deel, Remote, and SWIFT wires with zero payroll uploads.
- **Website:** https://contractorfx.com
- **Topics:** `contractor-payouts`, `payroll-calculator`, `fx-rates`, `currency-exchange`, `wise`, `payoneer`, `deel`, `remote-work`, `freelance`, `fintech`, `privacy-first`, `astro`, `typescript`

---

## Standalone CLI Usage (`contractor-fx`)

ContractorFX includes a standalone Node ESM CLI bundled in `bin/contractor-fx.mjs`.

### Installation and execution

Run directly using Node or link locally:

```bash
# Direct run from repo root
./bin/contractor-fx.mjs --help

# Or run via npm script
npm run build:cli
node bin/contractor-fx.mjs --amount 3500 --billing USD --payout INR --funding ach --contractors 1
```

### Single corridor comparison

Model contractor payout drag across Wise, Payoneer, Deel, Remote, and SWIFT bank wires:

```bash
# Default corridor: $3,500 USD to INR via ACH
./bin/contractor-fx.mjs --amount 3500 --billing USD --payout INR --funding ach --contractors 1

# Multi-contractor scenario formatted as Markdown memo
./bin/contractor-fx.mjs --amount 5000 --billing USD --payout EUR --contractors 8 --format md

# Machine-readable JSON output for automated pipelines
./bin/contractor-fx.mjs --amount 2000 --billing USD --payout PHP --format json
```

### Batch contractor CSV payroll audit

Audit an entire team roster for hidden FX markups and SaaS seat waste:

```bash
# Table summary
./bin/contractor-fx.mjs --csv sample-team.csv --format table

# Markdown executive audit report
./bin/contractor-fx.mjs --csv sample-team.csv --format md

# JSON output
./bin/contractor-fx.mjs --csv sample-team.csv --format json
```

CSV file format requirements (5 columns):

```csv
contractor,amount,billing_currency,payout_currency,current_provider
Aarav Mehta,4500,USD,INR,payoneer
Camille Reyes,2800,USD,PHP,payoneer
Elena Fischer,6000,USD,EUR,deel
Wei Lin,4800,USD,CNY,swift-wire
```

Interactive zero-upload browser equivalent: https://contractorfx.com/batch-contractor-payout-csv-audit/

---

## Privacy, Editorial, and Compliance Guarantees

- **100% browser-local execution.** Contractor names, invoice figures, custom mid-market rates, and uploaded team CSV rosters stay inside browser memory (`File.text()` and `Blob` URLs). Zero compensation records leave the user device.
- **Privacy-safe GA4 funnel telemetry.** Anonymized interaction events (`config`, `payout_calc_export`, and sanitized funnel signals) run without invoice numbers or roster PII, and emit zero external requests during local `127.0.0.1` verification.
- **Affiliate-ready E-E-A-T trust pages.** Dedicated `/about/`, `/privacy/`, and `/terms/` routes cover published Q4 2026 tariff methodology, non-affiliation trademark notices, GDPR and CCPA/CPRA disclosures, and FTC `16 CFR Part 255` commercial link policies.
- **Clean-room MIT License.** All mathematical formulas, CSV parsers, UI components, sample fixtures, and editorial copy are original MIT-licensed work.

---

## Built Routes and Static Artifacts

| Route | Built file | Primary role |
|---|---|---|
| `/` | `dist/index.html` | Wise vs Payoneer contractor payout calculator |
| `/wise-vs-payoneer-fee-calculator/` | `dist/wise-vs-payoneer-fee-calculator/index.html` | Wise vs Payoneer local bank withdrawal fee comparison |
| `/deel-vs-remote-contractor-calculator/` | `dist/deel-vs-remote-contractor-calculator/index.html` | Deel vs Remote multi-seat contractor cost calculator |
| `/deel-vs-wise-contractor-payouts/` | `dist/deel-vs-wise-contractor-payouts/index.html` | Deel vs Wise 8-contractor payout routing benchmark |
| `/deel-withdrawal-fee-calculator/` | `dist/deel-withdrawal-fee-calculator/index.html` | Deel withdrawal fee and FX spread breakdown |
| `/batch-contractor-payout-csv-audit/` | `dist/batch-contractor-payout-csv-audit/index.html` | Zero-upload team batch contractor payout CSV audit |
| `/about/` | `dist/about/index.html` | Editorial policy, tariff sources, spread math, and non-affiliation notice |
| `/privacy/` | `dist/privacy/index.html` | Zero-upload browser guarantee, GA4 policy, and GDPR/CCPA disclosures |
| `/terms/` | `dist/terms/index.html` | Informational disclaimer, corridor/KYC variance, and FTC `16 CFR Part 255` policy |

Auxiliary static outputs verified in `dist/`: `404.html`, `sitemap-index.xml`, `robots.txt`, `llms.txt`, `_headers`, `og-image.svg`, `og-image.png`, `github-social-preview.png`, `site.webmanifest`, `indexnow-key.txt`, and `b7e3d1c84a924f508c6e23b9a1d05e42.txt`.

---

## Local Development and Verification

Run these commands from `/Users/dake/Projects/aiapp/30_products/contractor-fx-comparator`:

```bash
npm run dev
npm test
npm run build
npm run seo:check
npm run preview
npm run test:e2e
npm run verify:all
npm run cf:preview
```

- `npm run dev` starts the local Astro server at `http://127.0.0.1:4326`.
- `npm test` runs the Vitest unit test suite covering `src/lib/fx-engine.ts` and `bin/contractor-fx.mjs`.
- `npm run build` compiles all nine static routes, builds the standalone CLI, and outputs to `dist/`.
- `npm run seo:check` runs `scripts/seo-preflight.mjs` against `dist/` (default origin `https://contractorfx.com`) to verify all routes, auxiliary static assets, unique `<title>` and `<meta name="description">`, exact canonical URLs, valid PNG `og:image` tags and binary magic bytes, single `<h1>`, `Organization` and `BreadcrumbList` JSON-LD plus `WebApplication` and `FAQPage` on every calculator route, internal link resolution, preview domain `noindex` headers, and zero placeholders or long dashes.
- `npm run test:e2e` starts `npm run preview` on `http://127.0.0.1:4326/` and runs all six Chromium specs in `tests/e2e/comparator.spec.ts`, including GA4 `window.dataLayer` verification with zero external requests and `375x812` mobile viewport responsiveness across trust pages.
- `npm run verify:all` runs unit tests, static build, SEO preflight, and Playwright E2E in sequence.

---

## Production Launch and Affiliate Onboarding

Follow [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) for step-by-step instructions covering:

1. `contractorfx.com` Cloudflare DNS, `hello@contractorfx.com` email routing, and `npm run cf:deploy`.
2. Google Search Console, Bing Webmaster Tools, IndexNow, and shared GA4 registration (`contractorfx` in `../../40_shared/analytics-sites.yaml`).
3. Post-launch **Wise Partnerize** and **Deel Affiliate** partner applications and compliant `rel="sponsored noopener"` link activation.

Launch marketing assets, X search templates, Hacker News factual notes, Reddit educational breakdowns, and directory submission copy are compiled in [`LAUNCH_KIT.md`](./LAUNCH_KIT.md).

---

## License

MIT

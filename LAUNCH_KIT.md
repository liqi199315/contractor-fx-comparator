# ContractorFX Launch Kit (`contractorfx.com`)

This playbook provides copy-paste distribution assets, search queries, community discussion notes, and directory copy for launching **ContractorFX** (`https://contractorfx.com`).

Strict policy reminders:
- Always use clean URLs (`https://contractorfx.com/`). Never attach `utm_` tags in public forum submissions or Reddit comments.
- Zero em-dashes and zero en-dashes across all public copy. Use standard ASCII hyphens (`-`).
- Human operator dake must write final Hacker News and Reddit posts in his own words per community rules.

---

## 1. X (Twitter) Organic Launch Asset Pack

X distribution strategy: Post the native demo video with zero links in the main tweet to avoid algorithmic suppression. Put the link in the immediate first reply.

### 1.1 Native 25-Second Demo Video Shot List

- **Target duration:** 25 seconds
- **Resolution:** 1080x1080 (1:1 square) or 1920x1080 (16:9 landscape)
- **Audio:** No voiceover required; subtle keystroke audio or clean lo-fi background beat.

| Timestamp | Screen action | Visual highlight | Caption text overlay |
|---|---|---|---|
| `00:00 - 00:04` | Open `contractorfx.com`. Enter `$3,500 USD` invoice, select `USD -> INR`, funding `ACH`. | The comparison table updates instantly in real time. | Most companies think payment rails charge flat wire fees. |
| `00:04 - 00:10` | Mouse hovers over Wise ($32.20 drag) vs Payoneer ($113.75 drag) vs Deel ($101.50 drag). | Green `[LOWEST DRAG]` badge next to Wise; red bar on traditional bank wire. | Hidden FX spreads and SaaS seat charges cost $80+ per invoice. |
| `00:10 - 00:16` | Switch tab to `Batch CSV Audit`. Click `Load Sample Roster (6 Contractors)`. | 6 international contractor rows parse instantly in browser memory. | What happens across an entire global remote team? |
| `00:16 - 00:21` | Scroll to audit totals: `$680.50 current` vs `$210.30 optimal` -> `$5,642.40 annual savings`. | Highlight the green annual savings callout card. | $5,642/year saved by routing payouts intelligently. |
| `00:21 - 00:25` | Click `Download CFO Memo (.md)`. File downloads instantly. Point cursor to `100% Local Payroll Privacy`. | Browser network tab shows 0 outbound network requests. | Zero server uploads. Invoices never leave your browser. |

### 1.2 Main Post Text (No Links)

```text
If you pay international contractors with Deel, Payoneer, or bank wires, you are probably leaking 2% to 5% per invoice in hidden exchange rate markups.

Here is the breakdown most finance teams miss:

1. Wise: Mid-market rate + 0.48% transparent fee. Zero monthly seat cost.
2. Payoneer: Zero seat fee, but slips in a 2.25% FX markup above mid-market.
3. Deel: $49/month per contractor seat + up to 1.5% withdrawal FX spread.
4. Traditional bank wires: $35 outgoing wire + $15 correspondent fee + 2.6% retail FX desk bite.

On a $3,500 monthly payment to an engineer in India:
- Wise costs ~$32 in total drag.
- Payoneer eats ~$114.
- Deel eats ~$102.
- A SWIFT wire eats ~$141.

Over 10 contractors, routing through the wrong rails burns $8,000+ every year.

I built a free tool to calculate exact corridor fees, SaaS seat break-evens, and audit team payroll CSV rosters locally in browser memory.

Demo video below:
```

### 1.3 Reply #1 Link Post

```text
Run your own team numbers or corridor breakdown here (100% browser-local, zero payroll uploads):
https://contractorfx.com

You can also audit an entire team CSV or download a clean Markdown routing memo for your finance lead.
```

---

## 2. High-Intent X Pain-Search Queries & Reply Templates

Search X twice weekly for operators experiencing payment friction. Provide factual math first before mentioning the tool.

### Query 1: Deel Contractor Fee or Withdrawal FX Pain
- **Search string:** `("deel fee" OR "deel withdrawal" OR "deel exchange rate" OR "deel fx") (expensive OR high OR rip OR hidden OR spread)`
- **Value-first reply template:**
  ```text
  Deel charges in two distinct places: the $49/contractor monthly SaaS seat fee on the company side, plus an estimated 1.25% to 1.5% currency conversion spread when the contractor withdraws in local currency. Unless you actively need their managed compliance shield or automated tax collection, running direct ACH payouts through Wise Business saves around $70 to $100 per contractor every month.
  ```

### Query 2: Payoneer Hidden Conversion Margin Pain
- **Search string:** `("payoneer rate" OR "payoneer fee" OR "payoneer fx") (bad OR low OR markup OR spread OR mid-market)`
- **Value-first reply template:**
  ```text
  Payoneer advertises zero account maintenance fees, but embeds an estimated 2% to 2.75% FX spread above interbank mid-market rates on local currency withdrawals. On a $3,000 invoice, that spread quietly costs $60 to $80 compared to mid-market rails. Always compare the net received amount against the interbank rate before confirming.
  ```

### Query 3: Wise vs Traditional Bank Wire International Contractor Payouts
- **Search string:** `(contractor OR freelance) ("wire transfer" OR "wise" OR "swift") fee (cheaper OR alternative OR recommendation)`
- **Value-first reply template:**
  ```text
  SWIFT bank wires hit you twice: a fixed $35 sending fee plus $15 to $25 in correspondent intermediary deductions, followed by a 2.5% to 3% retail bank FX desk markup. For cross-border payouts under $10,000, local payment rails (like Wise ACH to local bank) almost always beat wire transfers by 60% to 75% in total friction.
  ```

---

## 3. Hacker News Show HN Factual Data Notes

Per Hacker News guidelines, dake must draft and submit the final post in his own words. Do not copy paste marketing prose.

### Essential Hacker News Context Notes
- **Title format idea:** `Show HN: ContractorFX - Browser-local contractor payout and FX fee comparator`
- **Clean submission URL:** `https://contractorfx.com` (strictly zero `utm_` tags)
- **Key technical points for dake to emphasize:**
  1. **Zero-upload architecture:** Finance teams and contractors cannot safely paste compensation data into unknown cloud services. All calculations, custom mid-market rate adjustments, and CSV parsing run client-side using JavaScript `File` API and in-memory evaluation.
  2. **The hidden fee problem:** B2B payroll platforms market either flat seat fees ($49/mo) or zero fee structures, but mask the real cost in retail FX markups (1.5% to 2.75%) or intermediary correspondent banking charges ($15 to $50).
  3. **Multi-variable modeling:** The tool reconciles SaaS subscriptions, client funding rails (ACH vs wire vs card), withdrawal fixed costs, and currency conversion spreads across 8 major contractor payout currencies (EUR, GBP, INR, PHP, BRL, MXN, CNY, CAD).
  4. **Open source and CLI:** The full engine is MIT-licensed clean-room TypeScript, accompanied by a standalone Node CLI (`contractor-fx`) for CI/CD payroll pipeline auditing.

---

## 4. Reddit Educational Community Breakdown Notes

Share educational, high-signal data breakdowns. Never post generic promotional links. Only drop `https://contractorfx.com` if community members ask for the calculator.

### 4.1 r/freelance: "How international payment processors take 2% to 4% of your invoice"
- **Key insight:** Freelancers often look only at the transfer fee ($0 or $5) and ignore the exchange rate spread.
- **Concrete example:**
  - Invoice: $3,000 USD paid to an engineer in the Philippines (PHP).
  - Mid-market rate: 58.60 PHP per USD -> Fair value = 175,800 PHP.
  - Payoneer effective rate (~57.28 PHP): receives ~171,840 PHP (loss: ~3,960 PHP or ~$67 USD).
  - Wise effective rate (~58.32 PHP after 0.48% fee): receives ~174,950 PHP (loss: ~850 PHP or ~$14.50 USD).
  - Net difference: The contractor loses ~$52 USD every single month on the exact same invoice without seeing a line-item fee.

### 4.2 r/digitalnomad: "USD to local bank withdrawals: fixed fees vs spread"
- **Key insight:** Different corridors favor different rails.
- **Corridor rule of thumb:**
  - High fixed fee rails (SWIFT wires at $50 total bite) only make sense above $15,000 USD where a 0.5% spread would exceed $75.
  - For invoices between $1,000 and $8,000, percentage-based mid-market rails beat fixed wire costs every time.
  - Watch out for platforms advertising free local currency withdrawal: the account maintenance is free, but the FX spread is 2.25%.

### 4.3 r/smallbusiness: "When does a $49/month contractor compliance platform make financial sense?"
- **Key insight:** Evaluating Deel / Remote SaaS seat costs vs pure payment routing.
- **The break-even math:**
  - Deel costs $49 per contractor per month ($588/year) plus contractor-side FX spread.
  - Direct Wise Business costs $0 per month in seat fees with transparent ~0.48% conversion drag.
  - If you only use Deel as a payout rail, you are overpaying by $500+ per contractor annually.
  - Deel only breaks even when you genuinely need localized contract templates, automated tax form collection (W-8BEN), and contractor IP assignment protection.

---

## 5. Directory Submissions and Affiliate Pitch Blurbs

### 5.1 AlternativeTo Submission Copy

- **Name:** ContractorFX
- **URL:** https://contractorfx.com
- **Tagline:** Independent international contractor payout fee and FX spread comparator
- **License:** Open Source (MIT)
- **Platforms:** Web, Node.js CLI
- **Short description:**
  ContractorFX models monthly SaaS seat fees, funding rail charges, fixed withdrawal fees, and retail FX markups across Wise Business, Payoneer, Deel, Remote, and SWIFT wires. Runs 100% locally in browser memory with zero payroll data uploads.
- **Tags:** `currency-converter`, `payroll`, `freelance-tools`, `finance`, `open-source`

### 5.2 Uneed.best Submission Copy

- **Product name:** ContractorFX
- **Link:** https://contractorfx.com
- **One-liner:** Stop leaking 3% of international contractor payroll to hidden FX spreads.
- **Description:**
  A zero-upload financial workbench for startup founders, CFOs, and international contractors. Compare true payout costs across Wise, Payoneer, Deel, and bank wires in seconds, or drop your payroll CSV to discover immediate routing savings.

### 5.3 Wise Partnerize Application Pitch Blurb

```text
ContractorFX (https://contractorfx.com) is an independent B2B financial utility and browser-local payroll benchmarking tool for startup finance leads, operations managers, and international contractors. 

Our tool transparently compares total payout friction across Wise Business, Payoneer, Deel, Remote, and traditional SWIFT wires across major global currency corridors (USD, EUR, GBP to INR, PHP, BRL, MXN, CAD, CNY). Because Wise consistently offers the lowest fee drag on transparent mid-market rails, our objective mathematical comparison organically directs high-volume business customers to Wise Business accounts.

We do not run paid search ads against Wise trademarks. All traffic is acquired organically via search and direct CFO memo sharing. ContractorFX operates strictly in-browser with zero payroll data storage.
```

### 5.4 Deel Affiliate / Referral Application Pitch Blurb

```text
ContractorFX (https://contractorfx.com) provides objective contractor payout fee modeling for growing cross-border companies. 

Our specialized Deel calculator routes (including /deel-vs-remote-contractor-calculator/ and /deel-vs-wise-contractor-payouts/) help startup operators evaluate exactly when upgrading from ad-hoc bank transfers to Deel Contractor Management ($49/month) makes sense for international compliance, IP protection, and automated tax documentation. 

We drive qualified startup founders and finance leads who have reached the headcount threshold (5+ contractors) where managed compliance outweighs raw payment rail costs. We maintain strict FTC disclosures and do not bid on branded search terms.
```

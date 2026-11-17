import type { FxRoutePreset, PayoutScenarioInput } from './types';

export const FEE_SOURCE_VERIFIED_ON = '2026-11-13';

export interface MarketplaceWithdrawalPreset {
	id: string;
	label: string;
	fixedFeeUsd: number | null;
	sourceNote: string;
}

export const MARKETPLACE_WITHDRAWAL_PRESETS: readonly MarketplaceWithdrawalPreset[] = [
	{
		id: 'fiverr-payoneer-account',
		label: 'Fiverr to Payoneer Account ($3.00)',
		fixedFeeUsd: 3,
		sourceNote:
			'Both Fiverr help articles list a $3.00 USD fee to withdraw to a Payoneer Account, with a $10.00 USD minimum. Checked 2026-11-13.',
	},
	{
		id: 'fiverr-payoneer-usd-wire',
		label: 'Fiverr USD wire via Payoneer ($1.00)',
		fixedFeeUsd: 1,
		sourceNote:
			'The Payoneer setup article lists $1.00 USD for a USD wire to a local bank (minimum $20.00). The general withdrawals article also lists $1.00 USD for Bank Transfer via Payoneer. Checked 2026-11-13.',
	},
	{
		id: 'fiverr-local-currency-conflict',
		label: 'Fiverr local-currency bank (fee not auto-filled)',
		fixedFeeUsd: null,
		sourceNote:
			'The Payoneer setup article lists $3.00 USD for a local-currency bank transfer. The general withdrawals article lists $1.00 USD for Bank Transfer via Payoneer and does not split local currency from USD wire. No single figure is auto-filled. Type the fee on your Fiverr withdrawal screen.',
	},
	{
		id: 'upwork-payoneer-unpublished',
		label: 'Upwork to Payoneer (dollar fee not published)',
		fixedFeeUsd: null,
		sourceNote:
			'Upwork says it charges a small per-transfer fee to withdraw to Payoneer and does not publish the dollar amount on the public help page. This preset does not invent a number. Type the fee from your withdrawal screen.',
	},
	{
		id: 'upwork-local-bank',
		label: 'Upwork direct to local bank ($0.99)',
		fixedFeeUsd: 0.99,
		sourceNote:
			'Upwork publishes $0.99 USD per Direct to Local Bank withdrawal. That path is not Payoneer. The $0.99 figure is the only amount this preset applies.',
	},
];

export interface CorridorQuickPreset {
	id: string;
	label: string;
	scenario: PayoutScenarioInput;
}

export interface RouteCardMeta {
	corridorBadge: string;
	audienceTag: string;
	comparisonFocus: string;
	spreadRangeNote: string;
}

export const CORRIDOR_QUICK_PRESETS: readonly CorridorQuickPreset[] = [
	{
		id: 'usd-inr-solo',
		label: '$3.5k USD -> INR Solo',
		scenario: {
			invoiceAmount: 3500,
			billingCurrency: 'USD',
			payoutCurrency: 'INR',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
	},
	{
		id: 'usd-php-freelancer',
		label: '$2k USD -> PHP Freelancer',
		scenario: {
			invoiceAmount: 2000,
			billingCurrency: 'USD',
			payoutCurrency: 'PHP',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
	},
	{
		id: 'usd-eur-8seat',
		label: '$5k USD -> EUR 8-Seat Team',
		scenario: {
			invoiceAmount: 5000,
			billingCurrency: 'USD',
			payoutCurrency: 'EUR',
			fundingMethod: 'ach-bank',
			contractorCount: 8,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
	},
	{
		id: 'usd-cny-agency',
		label: '$4k USD -> CNY Agency',
		scenario: {
			invoiceAmount: 4000,
			billingCurrency: 'USD',
			payoutCurrency: 'CNY',
			fundingMethod: 'ach-bank',
			contractorCount: 6,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
	},
];

export const ROUTE_CARD_META: Readonly<Record<string, RouteCardMeta>> = {
	'/': {
		corridorBadge: 'USD -> INR | 1 Seat',
		audienceTag: 'Global Baseline',
		comparisonFocus: 'Full 5-provider spread, rail fee, and SaaS seat benchmark against interbank mid-market rates.',
		spreadRangeNote: '48 bps Wise vs 225 bps Payoneer',
	},
	'/wise-vs-payoneer-fee-calculator/': {
		corridorBadge: 'USD -> PHP | 1 Seat',
		audienceTag: 'Solo Freelancers',
		comparisonFocus: 'Isolates virtual USD receiving account fees from local bank withdrawal conversion markups.',
		spreadRangeNote: 'ACH funding + InstaPay/PESONet rails',
	},
	'/deel-vs-remote-contractor-calculator/': {
		corridorBadge: 'USD -> BRL | 5 Seats',
		audienceTag: 'Growing Startups',
		comparisonFocus: 'Models $49 Deel seats against $29 Remote seats combined with contractor BRL conversion drag.',
		spreadRangeNote: '$240/yr seat delta vs FX spread loss',
	},
	'/deel-vs-wise-contractor-payouts/': {
		corridorBadge: 'USD -> EUR | 8 Seats',
		audienceTag: 'Engineering Rosters',
		comparisonFocus: 'Quantifies $4,704 annual Deel subscription overhead against direct Wise Business SEPA batches.',
		spreadRangeNote: '$40k/mo volume break-even audit',
	},
	'/deel-withdrawal-fee-calculator/': {
		corridorBadge: 'USD -> MXN | Wire',
		audienceTag: 'Contractor Cash-Outs',
		comparisonFocus: 'Separates upstream wire funding charges from downstream local bank and SWIFT intermediary drag.',
		spreadRangeNote: '150 bps Deel vs 260 bps SWIFT desk',
	},
	'/batch-contractor-payout-csv-audit/': {
		corridorBadge: 'Multi-FX | 6+ Seats',
		audienceTag: 'Finance & Controllers',
		comparisonFocus: 'Audits an entire multi-currency payroll CSV locally in browser memory with zero network uploads.',
		spreadRangeNote: 'Row-by-row optimal rail routing',
	},
	'/fx-markup-calculator/': {
		corridorBadge: 'USD -> EUR | Formula',
		audienceTag: 'Rate Markup',
		comparisonFocus: 'Turns a mid rate and a bank or platform rate into a spread in bps, then exports the five-rail fee sheet.',
		spreadRangeNote: 'spread = (mid - actual) / mid',
	},
	'/payoneer-fees-calculator-india/': {
		corridorBadge: 'USD -> INR | Payee',
		audienceTag: 'Indian Payees',
		comparisonFocus: 'Prices what an Indian payee can verify from Payoneer India pricing before an automatic INR withdrawal.',
		spreadRangeNote: 'Official band 1% to 4%',
	},
	'/wise-vs-payoneer-philippines/': {
		corridorBadge: 'USD -> PHP | Payee',
		audienceTag: 'Philippines VAs',
		comparisonFocus: 'Helps a Philippines virtual assistant compare a Wise peso receipt with a Payoneer USD-to-PHP withdrawal.',
		spreadRangeNote: 'PHP conversion band 1.2% to 4%',
	},
	'/fiverr-payoneer-withdrawal-fee/': {
		corridorBadge: 'USD -> INR | Fiverr',
		audienceTag: 'Fiverr Sellers',
		comparisonFocus: 'Stacks the published Fiverr Payoneer withdrawal fee on top of the later Payoneer cash-out.',
		spreadRangeNote: 'Payoneer Account fee $3.00',
	},
	'/upwork-withdrawal-fee-payoneer/': {
		corridorBadge: 'USD -> PHP | Upwork',
		audienceTag: 'Upwork Freelancers',
		comparisonFocus: 'Separates Upwork published withdrawal fees from the Payoneer dollar fee the help page does not state.',
		spreadRangeNote: 'Local bank $0.99; Payoneer fee unpublished',
	},
	'/us-contractor-w8ben-tax-withholding-calculator/': {
		corridorBadge: 'USD -> Multi | W-8BEN',
		audienceTag: 'Tax & Compliance',
		comparisonFocus: 'Models 0% foreign-source vs 30% backup withholding alongside multi-rail payout fee drag.',
		spreadRangeNote: '0% with W-8BEN vs 30% missing',
	},
	'/usd-to-brl-pix-contractor-payout-guide/': {
		corridorBadge: 'USD -> BRL | PIX',
		audienceTag: 'Brazil Remote Devs',
		comparisonFocus: 'Compares instant PIX settlement against international SWIFT wire intermediary and IOF tax loss.',
		spreadRangeNote: '48 bps Wise PIX vs 260 bps SWIFT',
	},
	'/usd-to-mxn-spei-freelancer-payouts/': {
		corridorBadge: 'USD -> MXN | SPEI',
		audienceTag: 'Mexico Nearshoring',
		comparisonFocus: 'Benchmarks Deel $5 withdrawal fee against Wise 0.45% and local SPEI bank delivery.',
		spreadRangeNote: 'SPEI real-time clearing',
	},
	'/paypal-contractor-fx-fee-calculator/': {
		corridorBadge: 'USD -> EUR | PayPal',
		audienceTag: 'Freelance Invoices',
		comparisonFocus: 'Exposes PayPal 4.4% commercial fee + 3.5% to 4.5% hidden currency spread against Wise.',
		spreadRangeNote: '350 to 450 bps hidden FX markup',
	},
	'/usd-to-cad-contractor-payout-calculator/': {
		corridorBadge: 'USD -> CAD | EFT',
		audienceTag: 'Canada Remote Team',
		comparisonFocus: 'Evaluates local Canadian EFT direct deposit against Canadian bank wire receiving fees.',
		spreadRangeNote: 'EFT clearing vs bank wire',
	},
	'/contractor-payout-fail-rate-reconciliation-guide/': {
		corridorBadge: 'SWIFT | Audit',
		audienceTag: 'Treasury Ops',
		comparisonFocus: 'Audits intermediary correspondent lifting fees (OUR, BEN, SHA) and wire return costs.',
		spreadRangeNote: 'OUR / BEN / SHA fee reconciliation',
	},
};

export const ROUTE_PRESETS: FxRoutePreset[] = [
	{
		slug: '',
		path: '/',
		navLabel: 'Wise vs Payoneer',
		h1: 'Wise vs Payoneer Calculator and Global Contractor Payout Benchmark',
		seoTitle: 'Wise vs Payoneer Calculator | FX Spread & Payout Benchmark',
		metaDescription:
			'Compare net contractor take-home pay with our Wise vs Payoneer calculator. Audit FX spreads in bps, Deel and Remote seat fees, and SWIFT wire costs locally.',
		primaryKeyword: 'wise vs payoneer calculator',
		heroSummary:
			'Benchmark real take-home pay across Wise, Payoneer, Deel, Remote, and SWIFT bank wires before approving an international invoice. Every calculation separates monthly SaaS seat fees, funding rail charges, fixed withdrawal deductions, and hidden exchange rate markups against the interbank mid-market rate.',
		defaultInput: {
			invoiceAmount: 3500,
			billingCurrency: 'USD',
			payoutCurrency: 'INR',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'FX spread loss is measured as the percentage markup between the mid-market interbank reference rate and each provider retail conversion rate on the net convertible principal.',
			'Wise uses mid-market spot pricing with an explicit corridor variable fee plus fixed local payout rail charges such as INR IMPS or NEFT.',
			'Payoneer models zero-fee USD balance receipt via ACH alongside its published 2.0% to 3.0% currency conversion margin on local bank withdrawals.',
			'All figures run locally in your browser using Nov 2026 published schedule estimates without transmitting invoice amounts over the network.',
		],
		faqs: [
			{
				question: 'Why does FX spread usually cost more than fixed transfer fees on a $3,500 USD to INR invoice?',
				answer:
					'Fixed rail fees stay flat regardless of invoice size, whereas a percentage FX markup scales linearly with principal. On a $3,500 payout, a 2.0% retail conversion margin deducts $70.00 every month, exceeding a $3.00 or $5.00 local rail fee by more than tenfold.',
			},
			{
				question: 'How does funding via ACH compare against domestic wire or corporate card?',
				answer:
					'ACH bank debit is the lowest-cost USD funding rail across most payout platforms, often carrying zero or minimal flat fees. Domestic Fedwire adds $10 to $35 in bank initiation charges, while corporate card funding adds 2.5% to 3.5% in card processing surcharges.',
			},
			{
				question: 'When should a single contractor compare Wise and Payoneer against Deel or Remote?',
				answer:
					'Direct payment networks like Wise and Payoneer charge zero monthly seat subscriptions, making them cheaper when you already handle your own tax forms and contracts. Deel and Remote add $29 to $49 monthly per active contractor to bundle localized agreements and tax compliance.',
			},
			{
				question: 'Does changing payout frequency from monthly to biweekly double total fee drag?',
				answer:
					'Percentage FX spreads remain proportional to total monthly volume, so splitting $3,500 into two $1,750 transfers keeps FX spread dollars nearly identical. Fixed per-payout rail and SWIFT intermediary fees, however, multiply with each transfer event.',
			},
		],
		workedExample: {
			heading: 'Worked example: benchmarking a $3,500 USD to INR payout',
			formula: 'effective_drag = funding_fee + fixed_rail_fee + (gross_usd * fx_spread)',
			steps: [
				'Assume a gross invoice amount of $3,500.00 USD funded via ACH debit.',
				'Reference mid-market exchange rate is 1 USD = 84.50 INR ($3,500.00 = 295,750.00 INR gross equivalent).',
				'Wise applies a 48 bps FX markup ($16.80 USD) plus a 0.43% ACH fee ($15.05 USD) with zero withdrawal fee, delivering 293,059.00 INR (effective fee drag: 0.91% or $31.85 USD).',
				'Payoneer applies a 225 bps local bank withdrawal conversion margin ($78.75 USD) plus a 1.00% ACH credit fee ($35.00 USD), delivering 286,138.00 INR (effective fee drag: 3.25% or $113.75 USD).',
				'Annual take-home difference on 12 consecutive monthly disbursements equals $982.80 USD.',
			],
		},
		auditCallout:
			'Always audit the combination of upfront ACH funding charges, fixed local withdrawal fees, and retail FX spread markups before choosing an ongoing payout rail.',
		feeSources: [
			{
				publisher: 'Wise',
				pageTitle: 'Wise Pricing to Send Money',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise converts at the live interbank midpoint with an explicit variable fee and transparent local rail clearing such as Indian IMPS or NEFT.',
			},
			{
				publisher: 'Payoneer',
				pageTitle: 'Payoneer Fees and Pricing',
				url: 'https://www.payoneer.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Payoneer applies up to 3.00% above wholesale exchange rates when withdrawing USD balances to local currency bank accounts.',
			},
			{
				publisher: 'Deel',
				pageTitle: 'Deel Contractor Management Pricing',
				url: 'https://www.deel.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Deel charges a $49 per active contractor monthly seat subscription alongside local bank transfer currency conversion markups.',
			},
		],
		corridorContextNote:
			'For USD to INR disbursements, Wise routes directly via IMPS and NEFT, while Payoneer converts balances into recipient Indian bank accounts under RBI auto-withdrawal guidelines.',
		clearingRailInfo:
			'Local Indian clearing (IMPS/NEFT) delivers funds within hours, whereas SWIFT wires trigger intermediary charges and require Nostro reconciliation.',
	},
	{
		slug: 'wise-vs-payoneer-fee-calculator',
		path: '/wise-vs-payoneer-fee-calculator/',
		navLabel: 'Wise vs Payoneer Fees',
		h1: 'Wise vs Payoneer Fee Calculator for Cross-Border Invoices',
		seoTitle: 'Wise vs Payoneer Fee Calculator | Bank Withdrawal & FX Cost',
		metaDescription:
			'Use this Wise vs Payoneer fee calculator to benchmark ACH funding, 48 to 225 bps FX spreads, and net local bank withdrawals across 8 contractor currencies.',
		primaryKeyword: 'wise vs payoneer fee calculator',
		heroSummary:
			'Compare exact fee layers between Wise Business transfers and Payoneer local currency withdrawals on $2,000 USD to PHP and seven other contractor corridors. Inspect how Payoneer receiving account fees interact with withdrawal conversion markups compared to Wise transparent variable fees.',
		defaultInput: {
			invoiceAmount: 2000,
			billingCurrency: 'USD',
			payoutCurrency: 'PHP',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'For USD to PHP payouts, Wise routes funds over InstaPay or PESONet after deducting a transparent variable conversion percentage and a small fixed rail fee.',
			'Payoneer credits incoming USD ACH transfers into a virtual receiving balance and applies its conversion margin when the contractor withdraws funds to a Philippine peso bank account.',
			'Card funding surcharges are modeled separately from conversion spreads so finance teams can isolate treasury funding cost from contractor withdrawal loss.',
			'Annualized drag multiplies monthly per-contractor fee loss across 12 billing cycles to expose full-year compensation leakage.',
		],
		faqs: [
			{
				question: 'Does Payoneer charge a fee to receive USD from a US client via ACH?',
				answer:
					'Payoneer virtual US receiving accounts frequently waive fees on standard ACH bank credits from business clients, though small-ticket thresholds or card payments incur explicit percentages. The primary cost appears when converting that USD balance into local currency such as PHP, INR, or EUR.',
			},
			{
				question: 'How does Wise quote USD to PHP transfers differently than Payoneer?',
				answer:
					'Wise converts at the live mid-market rate and discloses the exact service fee upfront before funding. Payoneer embeds its margin inside a retail exchange rate below the interbank midpoint during bank withdrawal.',
			},
			{
				question: 'Which party absorbs the fee when a client pays the exact invoice nominal amount?',
				answer:
					'When the fee bearer is set to contractor, funding charges and conversion markups reduce the net target currency deposited into the contractor bank account. When set to client, the payer grosses up platform and funding costs while withdrawal FX spreads still affect local conversion.',
			},
			{
				question: 'Can freelancers hold USD in Payoneer or Wise to avoid conversion spreads?',
				answer:
					'Holding USD defers conversion if the contractor spends directly in USD on business expenses. Once funds are withdrawn to a domestic non-USD bank account for living expenses, local FX conversion applies.',
			},
		],
		workedExample: {
			heading: 'Worked example: converting a $2,000 USD invoice to PHP',
			formula: 'net_php = (gross_usd - funding_fee - fixed_withdrawal) * (mid_rate * (1 - fx_spread))',
			steps: [
				'Assume a $2,000.00 USD invoice converted to Philippine pesos at a mid-market rate of 1 USD = 58.70 PHP (gross mid value = 117,400.00 PHP).',
				'Wise routes over InstaPay/PESONet with a 0.48% conversion spread ($9.60 USD) and ACH funding ($8.95 USD), delivering 116,310.00 PHP (total drag: $18.55 USD or 93 bps).',
				'Payoneer virtual account ACH credit carries $20.00 USD (1.00%), and withdrawing USD balance to a Philippine bank carries a 2.25% conversion spread ($45.00 USD) plus $1.50 flat fee, delivering 113,500.00 PHP (total drag: $66.50 USD or 333 bps).',
				'Monthly take-home retained by the contractor via mid-market routing equals $47.95 USD ($575.40 USD per year).',
			],
		},
		auditCallout:
			'Solo contractors withdrawing into local currency accounts absorb FX markups on every transfer; inspect both receiving account rules and local withdrawal schedules.',
		feeSources: [
			{
				publisher: 'Wise',
				pageTitle: 'Wise USD to PHP Transfer Pricing',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise quotes live peso delivery over InstaPay and PESONet at mid-market spot plus corridor variable fee with zero receiving charges.',
			},
			{
				publisher: 'Payoneer',
				pageTitle: 'Payoneer Pricing Schedule',
				url: 'https://www.payoneer.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Payoneer applies a 2.0% to 3.0% currency conversion fee when transferring to local currency bank accounts in the Philippines.',
			},
		],
		corridorContextNote:
			'The Philippine corridor relies heavily on InstaPay (for real-time small amounts) and PESONet (for higher value transfers). Wise supports both rails directly.',
		clearingRailInfo:
			'InstaPay processes up to PHP 50,000 instantly, while PESONet handles same-day batches for larger compensation invoices.',
	},
	{
		slug: 'deel-vs-remote-contractor-calculator',
		path: '/deel-vs-remote-contractor-calculator/',
		navLabel: 'Deel vs Remote',
		h1: 'Deel vs Remote Calculator for Multi-Country Contractor Teams',
		seoTitle: 'Deel vs Remote Calculator | $49 vs $29 Seat & FX Fee Audit',
		metaDescription:
			'Run this Deel vs Remote calculator to compare $49 vs $29 monthly contractor seats, local FX withdrawal spreads, and annual team savings against Wise rails.',
		primaryKeyword: 'deel vs remote calculator',
		heroSummary:
			'Evaluate total cost of ownership between Deel ($49 per contractor monthly list price) and Remote Contractor Management ($29 per contractor monthly list price) on a 5-person team paid in BRL or local currencies. Compare SaaS seat overhead directly against secondary contractor withdrawal FX spreads.',
		defaultInput: {
			invoiceAmount: 4500,
			billingCurrency: 'USD',
			payoutCurrency: 'BRL',
			fundingMethod: 'ach-bank',
			contractorCount: 5,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Seat subscription math scales by active headcount each month, modeling Deel standard contractor management against Remote published per-contractor seat rate.',
			'Total fee drag combines employer-side monthly platform fees with contractor-side currency conversion spreads on USD to BRL local PIX or TED bank settlements.',
			'Wise, Payoneer, and SWIFT bank wires remain visible in the comparison table so finance leaders can measure the exact compliance premium of contractor SaaS.',
			'All 12-month projections assume steady monthly payout cadence and constant active seat count.',
		],
		faqs: [
			{
				question: 'Why compare Deel and Remote together with FX withdrawal spreads instead of seat price alone?',
				answer:
					'A $20 monthly difference in SaaS seat fees equals $240 per contractor per year, whereas a 0.75% difference in FX withdrawal spread on a $4,500 monthly invoice equals $405 per contractor per year. Evaluating SaaS invoices without contractor FX loss hides the larger cost driver.',
			},
			{
				question: 'How do Brazilian contractors receive USD invoices through Deel, Remote, or Wise?',
				answer:
					'Contractors in Brazil typically settle invoices into domestic BRL accounts via local rails or PIX after currency conversion from USD. Each platform applies its own spread or partner rail fee during the USD to BRL conversion step.',
			},
			{
				question: 'What compliance workflow justifies paying monthly contractor SaaS fees over direct Wise payouts?',
				answer:
					'Contractor management platforms automate country-specific independent contractor agreements, W-8BEN collection, milestone approvals, and consolidated mass invoicing. Teams without dedicated legal templates pay the monthly seat fee to standardize onboarding.',
			},
			{
				question: 'How does headcount change the break-even point between contractor platforms?',
				answer:
					'Because seat subscriptions scale per active contractor while bulk ACH funding stays flat, total SaaS cost grows linearly with team size. Exporting the routing memo lets finance teams compare annual SaaS spend against internal AP automation.',
			},
		],
		workedExample: {
			heading: 'Worked example: 5-contractor team in Brazil ($4,500 USD per person)',
			formula: 'team_annual_drag = ((monthly_seat_fee * count) + (gross_usd * fx_spread * count)) * 12',
			steps: [
				'Team volume equals 5 contractors * $4,500.00 USD = $22,500.00 USD monthly ($270,000.00 USD annually).',
				'Deel contractor list pricing adds $49.00 USD per seat ($245.00 USD monthly) plus an estimated 1.50% contractor BRL conversion spread ($337.50 USD monthly), totaling $582.50 USD monthly.',
				'Remote contractor list pricing adds $29.00 USD per seat ($145.00 USD monthly) plus an estimated 1.25% contractor BRL conversion spread ($281.25 USD monthly), totaling $426.25 USD monthly.',
				'SaaS seat delta alone saves $1,200.00 USD per year on Remote, while combined seat and FX spread delta totals $1,875.00 USD per year.',
			],
		},
		auditCallout:
			'Contractor management platform seat subscriptions scale linearly with headcount; always contrast seat fees against contractor FX conversion loss.',
		feeSources: [
			{
				publisher: 'Deel',
				pageTitle: 'Deel Contractor Management Pricing',
				url: 'https://www.deel.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Deel publishes $49 per contractor per month list price for onboarding, compliance agreements, and automated payments.',
			},
			{
				publisher: 'Remote',
				pageTitle: 'Remote Contractor Management Pricing',
				url: 'https://remote.com/pricing',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Remote publishes $29 per contractor per month list price for international contractor management and payments.',
			},
		],
		corridorContextNote:
			'In Brazil, contractor payouts require PIX or TED rail delivery and compliance with IOF tax regulations. Remote and Deel provide localized contracts.',
		clearingRailInfo:
			'PIX settles 24/7 in real-time, whereas TED operates on banking business hours and requires tax identification (CPF/CNPJ).',
	},
	{
		slug: 'deel-vs-wise-contractor-payouts',
		path: '/deel-vs-wise-contractor-payouts/',
		navLabel: 'Deel vs Wise',
		h1: 'Deel vs Wise Contractor Fee Calculator for Direct Bank Rails',
		seoTitle: 'Deel vs Wise Contractor Fee Calculator | SaaS vs Bank Rails',
		metaDescription:
			'Benchmark $49/seat SaaS billing against direct SEPA and ACH payouts with this Deel vs Wise contractor fee calculator and export CFO-ready routing memos.',
		primaryKeyword: 'deel vs wise contractor fee calculator',
		heroSummary:
			'Quantify the annual dollar gap between running an 8-contractor engineering roster on Deel versus batching direct payouts through Wise Business. See exact monthly SaaS seat overhead, EUR SEPA conversion spreads, and downloadable treasury routing memos.',
		defaultInput: {
			invoiceAmount: 5000,
			billingCurrency: 'USD',
			payoutCurrency: 'EUR',
			fundingMethod: 'ach-bank',
			contractorCount: 8,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'For 8 contractors billing $5,000 USD into EUR, total monthly disbursement volume reaches $40,000 USD before platform seat fees.',
			'EUR payouts settle over SEPA local rails, isolating the cost comparison to Deel monthly seat charges plus FX conversion spread versus Wise mid-market batch conversion.',
			'The comparison engine calculates a break-even note showing how much compliance admin time Deel must save per month to offset its fee premium over Wise.',
			'Markdown and CSV memo exports format the live scenario into an audit-ready artifact for CFO or controller sign-off.',
		],
		faqs: [
			{
				question: 'How much do 8 contractor seats on Deel cost per year before FX conversion?',
				answer:
					'At a $49 monthly per-contractor rate, 8 active seats cost $392 per month or $4,704 per year in SaaS subscription fees alone. Contractor withdrawal FX spreads on non-USD payouts add a second layer on top of that subscription cost.',
			},
			{
				question: 'Can Wise Business pay multiple international contractors in one batch?',
				answer:
					'Wise Business supports batch CSV payouts for up to hundreds of recipients once contractor bank details and W-8BEN records are collected outside the payment tool. Wise charges zero monthly per-seat subscription fees.',
			},
			{
				question: 'Does paying Deel contractors via Wise withdrawal eliminate Deel FX spread?',
				answer:
					'Withdrawing USD from a Deel balance into a USD Wise account can reduce conversion markups, though rail transfer fees or intermediary rules depend on corridor eligibility. Direct Wise Business batching skips the $49 monthly Deel seat cost entirely when SaaS contract hosting is unnecessary.',
			},
			{
				question: 'Why are USD to EUR spreads narrower than emerging market corridors?',
				answer:
					'USD/EUR is the deepest global FX pair with tight interbank liquidity and low-cost SEPA clearing. Even a 1.0% vs 0.4% spread difference on $40,000 monthly team volume still shifts $2,880 per year.',
			},
		],
		workedExample: {
			heading: 'Worked example: 8 engineering contractors paid $5,000 USD into EUR',
			formula: 'annual_delta = (deel_annual_seats + deel_annual_fx_drag) - wise_annual_sepa_drag',
			steps: [
				'Monthly disbursement volume equals 8 contractors * $5,000.00 USD = $40,000.00 USD ($480,000.00 USD annually).',
				'Deel charges $49.00 USD per contractor seat monthly ($392.00 USD / month or $4,704.00 USD / year) plus approximately 1.50% EUR withdrawal FX spread ($600.00 USD / month), totaling $992.00 USD / month ($11,904.00 USD / year).',
				'Wise Business charges $0 monthly seat subscriptions and approximately 0.48% SEPA batch conversion spread plus ACH debit ($210.00 USD / month or $2,520.00 USD / year).',
				'Net annual cash retained by executing direct SEPA batches through Wise Business equals $9,384.00 USD.',
			],
		},
		auditCallout:
			'If your company handles contractor tax forms and agreements internally, paying $49 per seat monthly introduces unnecessary overhead compared to direct bank batching.',
		feeSources: [
			{
				publisher: 'Deel',
				pageTitle: 'Deel Pricing Schedule',
				url: 'https://www.deel.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Deel charges $49 per active contractor seat monthly for international contract administration and multi-currency payouts.',
			},
			{
				publisher: 'Wise',
				pageTitle: 'Wise Business Pricing',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise Business charges zero monthly seat subscriptions and executes multi-currency batch payouts at transparent mid-market spot rates.',
			},
		],
		corridorContextNote:
			'USD to EUR payouts clear seamlessly across the European SEPA network, making batch conversion spreads the primary cost differentiator.',
		clearingRailInfo:
			'SEPA Instant transfers clear in under 10 seconds across Eurozone financial institutions at negligible network cost.',
	},
	{
		slug: 'deel-withdrawal-fee-calculator',
		path: '/deel-withdrawal-fee-calculator/',
		navLabel: 'Deel Withdrawal Fees',
		h1: 'Deel Withdrawal Fee Calculator for Contractor Cash-Outs',
		seoTitle: 'Deel Withdrawal Fee Calculator | FX Markup & Cash-Out Net',
		metaDescription:
			'Calculate exact net cash-out amounts with our Deel withdrawal fee calculator. Compare 150 bps FX spreads, wire deductions, Wise, and Payoneer side by side.',
		primaryKeyword: 'deel withdrawal fee calculator',
		heroSummary:
			'Calculate how much reaches your domestic bank account when withdrawing a $3,000 USD balance into MXN or seven other currencies. Compare wire funding and withdrawal deductions on Deel against Wise, Payoneer, Remote, and traditional SWIFT correspondent banking.',
		defaultInput: {
			invoiceAmount: 3000,
			billingCurrency: 'USD',
			payoutCurrency: 'MXN',
			fundingMethod: 'wire',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Default funding on this preset uses wire transfer to illustrate how upstream wire fees compound with downstream FX withdrawal spreads.',
			'USD to MXN settlements compare SPEI local bank delivery spreads against cross-border SWIFT USD wires that trigger Mexican bank receiving and conversion markups.',
			'Effective exchange rate reflects actual target currency units delivered divided by gross invoice billing units after all fixed and percentage deductions.',
			'Contractors can switch funding method to ACH bank debit to view pure withdrawal-side conversion drag.',
		],
		faqs: [
			{
				question: 'Why does a "zero withdrawal fee" local bank transfer still deliver less than Google mid-market MXN?',
				answer:
					'Many platforms advertise $0 fixed local bank transfer fees while applying a 1.25% to 2.5% forward markup on the USD to MXN exchange rate. On $3,000 USD, a 1.75% exchange spread deducts $52.50 in value even when the stated transfer fee is $0.',
			},
			{
				question: 'When is a USD SWIFT wire worse than local currency withdrawal?',
				answer:
					'Sending a $3,000 USD SWIFT wire incurs $20 to $45 in sender and correspondent intermediary fees, and if your domestic account is denominated in MXN, your local bank converts the incoming USD at retail desk spreads often exceeding 2.5% to 3.5%.',
			},
			{
				question: 'How do I verify my live Deel withdrawal spread before confirming a cash-out?',
				answer:
					'Open the withdrawal preview screen, divide the quoted target currency amount by your USD withdrawal balance, and compare that effective rate against the live interbank mid-market rate or enter that mid-rate directly in this calculator.',
			},
			{
				question: 'Does batching two biweekly invoices into one monthly withdrawal save money?',
				answer:
					'Consolidating withdrawals halves any fixed per-withdrawal rail or SWIFT fees, though percentage FX spreads apply to the total converted balance regardless of withdrawal count.',
			},
		],
		workedExample: {
			heading: 'Worked example: contractor withdrawing $3,000 USD to MXN',
			formula: 'net_mxn = (gross_usd - withdrawal_fixed_fee) * (mid_rate * (1 - fx_spread))',
			steps: [
				'Assume a contractor has a $3,000.00 USD balance on Deel and withdraws to a Mexican bank account.',
				'Reference mid-market exchange rate is 1 USD = 20.20 MXN (gross equivalent = 60,600.00 MXN).',
				'Deel applies approximately 1.50% conversion spread ($45.00 USD) on standard local bank rails with zero fixed local fee, delivering 59,691.00 MXN (loss: 909.00 MXN or $45.00 USD).',
				'Choosing cross-border SWIFT wire instead incurs a $5.00 USD platform fee plus $15.00 to $35.00 USD in intermediary correspondent deductions, plus local Mexican bank FX spreads of 2.50% to 3.50% ($75.00 to $105.00 USD).',
			],
		},
		auditCallout:
			'Always select local bank transfer over international wire whenever your domestic bank currency matches the target withdrawal currency to avoid correspondent bank deductions.',
		feeSources: [
			{
				publisher: 'Deel Help',
				pageTitle: 'Deel Withdrawal Fees by Method',
				url: 'https://help.deel.com/hc/en-us/articles/4407737733009-How-Much-Does-It-Cost-To-Withdraw-Money-From-Deel',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Deel details withdrawal fees by method including local bank transfers, digital wallets, and international SWIFT wires.',
			},
			{
				publisher: 'Banco de Mexico',
				pageTitle: 'SPEI Payment System Information',
				url: 'https://www.banxico.org.mx/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'SPEI enables real-time interbank electronic funds transfers within Mexico with low domestic transaction overhead.',
			},
		],
		corridorContextNote:
			'Mexican contractor cash-outs benefit directly from the SPEI network, allowing near-instant delivery into 18-digit CLABE bank accounts.',
		clearingRailInfo:
			'SPEI operates 24/7/365 with minute-level clearance; international SWIFT wires require manual bank intervention and currency conversion.',
	},
	{
		slug: 'batch-contractor-payout-csv-audit',
		path: '/batch-contractor-payout-csv-audit/',
		navLabel: 'Team CSV Audit',
		h1: 'International Contractor Payment FX Spread Calculator and Team CSV Audit',
		seoTitle: 'International Contractor Payment FX Spread Calculator | CSV',
		metaDescription:
			'Audit your global payroll roster in the browser with this international contractor payment FX spread calculator. Zero server uploads and instant CSV savings.',
		primaryKeyword: 'international contractor payment fx spread calculator',
		heroSummary:
			'Paste or upload your monthly contractor payout CSV to benchmark every contractor corridor in one pass with zero server uploads. Identify per-contractor monthly fee leakage across Payoneer, Deel, Remote, SWIFT wire, and Wise, and compute total annual savings across your global roster.',
		defaultInput: {
			invoiceAmount: 4000,
			billingCurrency: 'USD',
			payoutCurrency: 'CNY',
			fundingMethod: 'ach-bank',
			contractorCount: 6,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'csv-batch',
		methodologyNotes: [
			'CSV parsing and fee modeling execute 100% inside the browser JavaScript runtime; uploaded files are read via the local File API and never sent to any backend.',
			'Expected CSV columns are contractor, amount, billing_currency, payout_currency, and current_provider (wise, payoneer, deel, remote, or swift-wire).',
			'Each roster row is benchmarked independently using ACH bank funding and single-contractor monthly cadence to find the lowest-drag provider for that specific currency pair.',
			'Team savings totals aggregate current monthly fee drag, optimal monthly fee drag, and 12-month projected USD savings across all valid roster rows.',
		],
		faqs: [
			{
				question: 'Is uploaded contractor payroll CSV data sent to any external server or analytics tool?',
				answer:
					'No. CSV text and uploaded files stay strictly inside local browser memory. No compensation figures, contractor names, or CSV contents leave your device.',
			},
			{
				question: 'Which CSV header format does the batch contractor audit expect?',
				answer:
					'Include a header row with contractor, amount, billing_currency (USD, EUR, or GBP), payout_currency (EUR, GBP, INR, PHP, BRL, MXN, CNY, or CAD), and current_provider (wise, payoneer, deel, remote, or swift-wire). Click Load Sample CSV at any time to restore a verified working template.',
			},
			{
				question: 'Why might the optimal provider vary across rows in the same company CSV?',
				answer:
					'Different corridors carry different local clearing fees and spread schedules, and smaller invoices are penalized more heavily by fixed wire or seat fees than larger invoices. Per-row benchmarking surfaces exactly which corridors drive 80% of your FX leakage.',
			},
			{
				question: 'Can I switch between the Team CSV Audit and single-corridor calculator on this page?',
				answer:
					'Yes. Use the Single Invoice Calculator tab above the workbench to drill into funding rail options, custom mid-market rates, or downloadable Markdown routing memos for any individual corridor.',
			},
		],
		workedExample: {
			heading: 'Worked example: auditing a 6-contractor multi-currency payroll CSV',
			formula: 'total_monthly_leakage = sum(current_provider_fee - optimal_provider_fee)',
			steps: [
				'Upload or paste a CSV roster containing 6 contractors across EUR, BRL, INR, and MXN totaling $30,000.00 USD in monthly payouts.',
				'Current routing using traditional bank wires and default platforms results in $825.00 USD in monthly fee and FX spread drag.',
				'Auditing each row against lowest-cost corridor rails identifies optimal routes (Wise for EUR/INR, Deel/Remote local rails for BRL/MXN), reducing monthly drag to $245.00 USD.',
				'Net monthly savings equals $580.00 USD, projecting to $6,960.00 USD in annual cash retained with zero payroll roster data leaving your browser.',
			],
		},
		auditCallout:
			'All batch CSV parsing and savings computations execute 100% inside your browser memory; zero contractor names, salaries, or invoice records are uploaded over the network.',
		feeSources: [
			{
				publisher: 'Wise Business',
				pageTitle: 'Wise Multi-Currency Batch Payments',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise supports multi-currency batch CSV payouts at transparent mid-market spot rates with zero monthly platform seat charges.',
			},
			{
				publisher: 'Deel',
				pageTitle: 'Deel Contractor Management',
				url: 'https://www.deel.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Deel charges $49 monthly per seat for multi-country contractor management and compliance automation.',
			},
		],
		corridorContextNote:
			'Multi-currency contractor rosters experience compounding drag when routed through single-provider rails; optimal routing matches local clearing rails by country.',
		clearingRailInfo:
			'Decoupling payments by local rail (SEPA for Europe, PIX for Brazil, SPEI for Mexico, IMPS for India) bypasses correspondent SWIFT lifting fees entirely.',
	},
	{
		slug: 'fx-markup-calculator',
		path: '/fx-markup-calculator/',
		navLabel: 'FX Markup',
		h1: 'FX Markup Calculator for the Fee Hidden in an Exchange Rate',
		seoTitle: 'FX Markup Calculator | Hidden Exchange Rate Spread in bps',
		metaDescription:
			'Calculate the FX markup hidden in a bank or platform rate. Use spread = (mid rate - actual rate) / mid rate, then export a local fee memo.',
		primaryKeyword: 'fx markup calculator',
		heroSummary:
			'Measure the exchange-rate markup a bank or payout platform hides inside the rate you are offered. This page publishes the identity spread = (mid rate - actual rate) / mid rate, walks one arithmetic example, and lets you export a Markdown memo or CSV fee sheet from the same browser calculator.',
		defaultInput: {
			invoiceAmount: 1000,
			billingCurrency: 'USD',
			payoutCurrency: 'EUR',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'A basis point is 0.01 percentage point. Multiply the spread fraction by 10,000 to quote it in bps, or by 100 to quote it in percent.',
			'The Custom Mid-Rate Override replaces this site reference midpoint for the net-currency column. It does not rewrite each provider modeled spread.',
			'Provider bps badges on the chart are this site Q4 2026 model (Wise 0.48%, Payoneer 2.25%, Deel 1.50%, Remote 1.25%, SWIFT desk 2.60%), documented on the methodology page. They are not a rate read off a bank receipt.',
			'Wise states in public pricing that it uses the mid-market rate and a separate upfront fee, and that the fee changes with amount, currency, and how you pay. That page does not publish one markup that fits every corridor.',
		],
		workedExample: {
			heading: 'Worked example: 250 bps on a stated pair of rates',
			formula: 'spread = (mid rate - actual rate) / mid rate',
			steps: [
				'Stated mid rate: 0.920000 EUR per 1 USD. That is this site November 2026 reference midpoint for USD to EUR. It is not a live European Central Bank print.',
				'Stated actual rate: 0.897000 EUR per 1 USD. This figure is illustrative so the division is exact. It is not a quote from Wise, Payoneer, Deel, Remote, or a bank tariff.',
				'spread = (0.920000 - 0.897000) / 0.920000 = 0.023000 / 0.920000 = 0.025000 = 2.50% = 250 bps.',
				'On a $1,000.00 invoice, hidden FX loss at 250 bps is $1,000.00 x 0.025 = $25.00. Currency delivered at the stated actual rate is 1,000 x 0.897000 = 897.00 EUR.',
				'Check: ($1,000.00 - $25.00) x 0.920000 = 897.00 EUR. The identity closes. Paste a live mid into Custom Mid-Rate Override, then export the memo.',
			],
		},
		auditCallout:
			'If a provider will not show both the mid rate and the rate on your receipt, the spread cannot be calculated. Leave it unstated. Do not backfill a bps figure from memory.',
		feeSources: [
			{
				publisher: 'Wise',
				pageTitle: 'Wise fees for sending money',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise says it uses the live mid-market rate and a separate upfront fee, and that banks hide extra cost in the exchange rate. The public page does not publish one bps markup for every corridor. A fee table on that page moves with amount and currency, so this calculator does not copy a single Wise percent from it.',
			},
			{
				publisher: 'Wise',
				pageTitle: 'The mid-market exchange rate',
				url: 'https://wise.com/us/mid-market-rate',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise describes the mid-market rate as the midpoint between buy and sell prices used between banks, and warns that a 0% fee claim can still hide a margin inside the rate. No numeric bank tariff is published on that page.',
			},
			{
				publisher: 'ContractorFX',
				pageTitle: 'Editorial policy and tariff modeling methodology',
				url: '/about/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'The five-rail rows use the site model published on the methodology page: Wise 0.48%, Payoneer 2.25%, Deel 1.50%, Remote 1.25%, SWIFT desk 2.60%, plus the funding formulas listed there. Those percents are model assumptions, not fresh quotes from each provider pricing page.',
			},
		],
		relatedLinks: [
			{ href: '/about/', label: 'Fee methodology and model assumptions' },
			{ href: '/', label: 'USD to INR five-provider payout benchmark' },
			{ href: '/payoneer-fees-calculator-india/', label: 'Payoneer fees for an Indian payee' },
		],
		faqs: [
			{
				question: 'How do I turn two exchange rates into a markup in basis points?',
				answer:
					'Subtract the rate you were given from the mid rate, divide by the mid rate, then multiply by 10,000. A result of 0.025 is 2.50%, which is 250 bps. The worked example on this page uses 0.920000 and 0.897000 EUR per USD so you can check the arithmetic by hand.',
			},
			{
				question: 'Does the Custom Mid-Rate Override change the bps shown on each provider?',
				answer:
					'No. The override changes the reference midpoint used to convert net USD into the payout currency. Each provider spread percent stays on the site model until you replace this model in code. Use the override to line up the net-currency column with a live mid, then read the bps badges as model spreads.',
			},
			{
				question: 'Why is there no box to type my own bps?',
				answer:
					'The chart already converts each modeled spread into bps (percent times 100). The receipt formula on this page is the way to price a rate you were actually offered. Export the memo after you paste the live mid, and keep the bank receipt next to that file.',
			},
			{
				question: 'Is 0.48% the Wise fee for USD to EUR?',
				answer:
					'No. 0.48% is this site Wise model, carried on the methodology page. Wise public pricing says the upfront fee depends on the amount, the currencies, and how you pay, and that you see it before you send. Read the Wise quote screen for the transfer you are about to make.',
			},
		],
	},
	{
		slug: 'payoneer-fees-calculator-india',
		path: '/payoneer-fees-calculator-india/',
		navLabel: 'Payoneer India',
		h1: 'Payoneer Fees Calculator for Indian Payees Receiving INR',
		seoTitle: 'Payoneer Fees Calculator India | USD to INR Take-Home',
		metaDescription:
			'Indian payee Payoneer fees calculator for USD to INR. Official India pricing lists a 1% to 4% withdrawal band. Verify the exact percent in your account.',
		primaryKeyword: 'payoneer fees calculator india',
		heroSummary:
			'You are the person waiting on INR, not the client sending dollars. Payoneer India says a USD balance withdrawn to an Indian bank is charged 1% to 4% of the transaction amount, and that India customers are paid out to a local bank within 48 hours. This page shows that published band, a worked dollar example, and a browser export. It does not invent the exact percent inside the band.',
		defaultInput: {
			invoiceAmount: 1000,
			billingCurrency: 'USD',
			payoutCurrency: 'INR',
			fundingMethod: 'received-balance',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Funding is set to "Already in balance" so the table does not add a fresh client ACH fee on top of money you have already received.',
			'The Payoneer row still uses this site 2.25% cross-currency model. That point sits inside the published 1% to 4% India band and is not a rate Payoneer prints as the India fee. Read your Fees page before you withdraw.',
			'Payoneer global pricing says conversion rates are based on wholesale market rates and include the conversion fee where indicated. Do not subtract the 1% to 4% band and also subtract the 2.25% model as if both were extra charges on the same withdrawal.',
			'The $29.95 annual account fee applies only if receipts are under $6,000 in 12 consecutive months, and not in the first year of a paid annual plan. It is not included in the per-invoice total because it depends on yearly volume.',
		],
		workedExample: {
			heading: 'Worked example: $1,000 USD balance to an INR bank',
			formula: 'fee USD = balance USD x published percent; remainder = balance USD - fee USD',
			steps: [
				'Official India pricing, read 2026-11-13: withdraw in local currency from a balance in a different currency (example given: USD balance to an INR bank in India) costs 1% to 4% of the transaction amount. The exact percent depends on region and volume and is shown in the account.',
				'Low published end: $1,000.00 x 0.01 = $10.00 fee, $990.00 left before the exchange rate.',
				'High published end: $1,000.00 x 0.04 = $40.00 fee, $960.00 left before the exchange rate.',
				'Payoneer does not publish the INR units on that page. If you apply this site reference midpoint of 84.40 INR per USD to the post-fee dollars, with no further markup, the arithmetic is 990 x 84.40 = 83,556.00 INR at 1%, and 960 x 84.40 = 81,024.00 INR at 4%. Those INR figures are reference arithmetic, not a Payoneer quote.',
				'Set the invoice to your balance, keep payout currency on INR, and export the CSV. Replace the model spread with the percent shown in your Payoneer Fees page before you treat the export as a cash figure.',
			],
		},
		auditCallout:
			'India customers: Payoneer says payments received in the account are withdrawn automatically to your local Indian bank within 48 hours. You may not get a chance to hold USD and convert later. Check the fee on the withdrawal before it leaves.',
		feeSources: [
			{
				publisher: 'Payoneer India',
				pageTitle: 'Payoneer fees (India)',
				url: 'https://www.payoneer.com/en-in/about/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'USD balance to an INR bank in India: 1% to 4% of the transaction amount. India customers are auto-withdrawn to a local bank within 48 hours. Client card payments are listed at 2.90% + $0.49, ACH bank debit (US only) at 1%, and PayPal (US only) at 3.99% + $0.49. Marketplace fees are set by the marketplace. Receiving accounts in a non-local currency are a fixed fee or 1%, with a minimum possibly applying. Annual account fee $29.95 if you receive under $6,000 in any 12 consecutive months. The page does not stamp a single India conversion percent inside the 1% to 4% band.',
			},
			{
				publisher: 'Payoneer',
				pageTitle: 'Pricing (global)',
				url: 'https://www.payoneer.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Page states "Last updated on 1 January 2026." Withdrawals that convert currency are listed at 1.2% to 4%. Moving funds between Payoneer balances is 0.50%. India is not in the same-country local-currency $1.50 list on this global page. Currency conversion rates include the conversion fee where indicated.',
			},
			{
				publisher: 'Payoneer India Help',
				pageTitle: 'Fee update notice (answer 45313)',
				url: 'https://payoneer-in.custhelp.com/app/answers/detail/a_id/45313',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'The notice says fee updates differ by country and date and asks the reader to select a country. Signed-out on 2026-11-13, the India row did not render an effective date or an India-specific percent. This page does not treat any row on that notice as the current India rate.',
			},
		],
		relatedLinks: [
			{ href: '/fx-markup-calculator/', label: 'FX markup formula and worked bps example' },
			{ href: '/fiverr-payoneer-withdrawal-fee/', label: 'Fiverr withdrawal fee into Payoneer' },
			{ href: '/', label: 'USD to INR five-provider benchmark' },
		],
		faqs: [
			{
				question: 'What INR will I actually receive from a Payoneer USD balance?',
				answer:
					'Payoneer India publishes a 1% to 4% fee on a withdrawal from a non-INR balance to an INR bank, and says the exact percent is in your account. It does not publish the rupee amount. Use the worked example for the dollar band, then read the live withdrawal preview for the INR figure.',
			},
			{
				question: 'Does the calculator 2.25% Payoneer row match the India price list?',
				answer:
					'It is inside the published 1% to 4% band, and it is still only this site model. Payoneer did not publish 2.25% as the India fee on the pages checked on 2026-11-13. Do not add 2.25% on top of the 1% to 4% band.',
			},
			{
				question: 'Is there a separate fee to receive a client ACH into Payoneer in India?',
				answer:
					'The India pricing page lists ACH bank debit from a US payer at 1% when the client pays you directly. Marketplace payouts are "fees set by each marketplace." A fixed fee or 1% can apply when a receiving account is not in your local currency. Those are different lines from the 1% to 4% INR withdrawal. Your Fees page is the one that applies to the account.',
			},
			{
				question: 'Why might I not be able to keep USD in Payoneer and convert on a better day?',
				answer:
					'The India pricing page says payments received by customers based in India are automatically withdrawn to the local Indian bank within 48 hours. Plan the fee on that automatic withdrawal, not on an optional later conversion.',
			},
		],
	},
	{
		slug: 'wise-vs-payoneer-philippines',
		path: '/wise-vs-payoneer-philippines/',
		navLabel: 'Philippines VA',
		h1: 'Wise vs Payoneer for a Philippines Virtual Assistant',
		seoTitle: 'Wise vs Payoneer Philippines | VA Payee Payout Calculator',
		metaDescription:
			'Philippines VA payee guide to Wise vs Payoneer in PHP. Compare a mid-market Wise receipt with Payoneer 1.2% to 4% conversion and export locally.',
		primaryKeyword: 'wise vs payoneer philippines',
		heroSummary:
			'This page is for the virtual assistant in the Philippines who wants pesos in a local account. It is not a generic company buyer comparison. A client can pay your PHP bank through Wise at the mid-market rate plus the fee Wise shows before sending, or pay a USD balance that you later withdraw through Payoneer. Payoneer publishes a conversion band, not one peso rate.',
		defaultInput: {
			invoiceAmount: 1200,
			billingCurrency: 'USD',
			payoutCurrency: 'PHP',
			fundingMethod: 'received-balance',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Default size is a $1,200 USD monthly retainer into PHP, with funding set to "Already in balance," so the table speaks to money you are cashing out.',
			'The separate fee-layer page on this site defaults to $2,000 USD to PHP and splits payer funding from withdrawal. Use that page when you are pricing the client rail. Use this page when you are the payee choosing how the retainer arrives.',
			'Wise public pricing does not list a Philippines-only peso fee. The Wise row here uses the site 0.48% model plus $0 new funding fee on a received balance. Confirm the upfront fee on the Wise quote the client sends you.',
			'A $1.50 Payoneer withdrawal applies to same-country local-currency bank withdrawals in supported countries, and the global list includes the Philippines. That $1.50 line is for no currency conversion, for example PHP already in hand to a Philippine bank. A USD balance to a PHP bank is the 1.2% to 4% conversion line instead.',
		],
		workedExample: {
			heading: 'Worked example: $1,200 USD retainer into PHP',
			formula: 'conversion fee USD = balance x band percent; PHP reference = remainder x site mid',
			steps: [
				'Payoneer global pricing, last updated 1 January 2026 and read again on 2026-11-13, lists a currency-conversion bank withdrawal at 1.2% to 4%. The Philippines is named on the $1.50 same-country local-currency list, which is a different line.',
				'Low end of the conversion band on $1,200.00: $1,200.00 x 0.012 = $14.40, leaving $1,185.60.',
				'High end: $1,200.00 x 0.04 = $48.00, leaving $1,152.00.',
				'Payoneer does not publish the peso amount. This site reference midpoint is 58.60 PHP per USD. Applied to the post-fee dollars with no extra markup, that is 1,185.60 x 58.60 = 69,476.16 PHP at 1.2%, and 1,152.00 x 58.60 = 67,507.20 PHP at 4%. Those peso figures are reference arithmetic, not a Payoneer or Wise quote.',
				'Wise says the recipient gets the mid-market rate minus the upfront fee shown at send time. Ask the client for the Wise receipt. The peso figure on that receipt is the one to compare with your Payoneer withdrawal preview.',
			],
		},
		auditCallout:
			'You do not control the client checkout, but you do control which instructions you send. Ask for a Wise transfer into your PHP account when the client can send one, and keep a Payoneer USD balance only when the marketplace or client cannot pay any other way.',
		feeSources: [
			{
				publisher: 'Payoneer',
				pageTitle: 'Pricing (global), last updated 1 January 2026',
				url: 'https://www.payoneer.com/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Philippines is listed among countries where a same-country local-currency bank withdrawal is $1.50 USD (the worked example on the page is same-currency, such as USD to a USD account). A withdrawal in the recipient local currency with conversion, and a withdrawal that converts into a non-local currency, are both listed at 1.2% to 4%. Moving money between your own Payoneer balances is 0.50%. Receiving-account credits in a currency that is not your local currency are 1% with a $1.00 minimum.',
			},
			{
				publisher: 'Wise',
				pageTitle: 'Wise fees for sending money',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise says you always get the mid-market rate and a separate upfront fee, shown before the sender pays. No single USD-to-PHP percent is published as a standing tariff on that page.',
			},
			{
				publisher: 'Wise',
				pageTitle: 'The mid-market exchange rate',
				url: 'https://wise.com/us/mid-market-rate',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise says providers often keep the mid-market rate for themselves and hand the customer a worse rate. Use that test on any "zero fee" peso quote: write down the mid, write down the rate on the receipt, and run the markup formula.',
			},
		],
		relatedLinks: [
			{ href: '/fx-markup-calculator/', label: 'Markup formula for a peso receipt' },
			{ href: '/wise-vs-payoneer-fee-calculator/', label: 'Fee-layer breakdown (client funding plus withdrawal)' },
			{ href: '/upwork-withdrawal-fee-payoneer/', label: 'Upwork withdrawal fee if the client pays on Upwork' },
		],
		faqs: [
			{
				question: 'I am a Philippines VA. Which number should I compare, the Wise receipt or the Payoneer preview?',
				answer:
					'Compare pesos that will land in your bank. A Wise transfer into a PHP account shows that amount before the client pays. A Payoneer USD balance shows it on the withdrawal screen, inside the published 1.2% to 4% conversion band plus the wholesale rate. The $1.50 local withdrawal is the wrong line if the balance is still in USD.',
			},
			{
				question: 'Does this replace the generic Wise vs Payoneer fee calculator?',
				answer:
					'No. That calculator is the fee-layer view, defaulted to $2,000 USD to PHP, including how the client funds the payment. This page starts from a $1,200 retainer that is already yours and asks which instruction you give the client.',
			},
			{
				question: 'Can I hold dollars in Payoneer and only convert the pesos I need?',
				answer:
					'Payoneer lists a 0.50% fee to move funds between your own balances, and a 1.2% to 4% fee when a bank withdrawal converts currency. Whether a Philippines account is allowed to hold USD is on your Fees page. This site did not find a Philippines rule that matches the India 48-hour auto-withdrawal sentence.',
			},
			{
				question: 'What if the Wise row looks cheaper because of the 0.48% model?',
				answer:
					'0.48% is this site model, not a Wise peso tariff. Wise tells the sender the real fee at checkout. If that receipt is worse than your Payoneer preview, keep Payoneer for that retainer. The ranking on this page is a model until you paste the live mid and read both previews.',
			},
		],
	},
	{
		slug: 'fiverr-payoneer-withdrawal-fee',
		path: '/fiverr-payoneer-withdrawal-fee/',
		navLabel: 'Fiverr Withdrawal',
		h1: 'Fiverr Payoneer Withdrawal Fee Calculator',
		seoTitle: 'Fiverr Payoneer Withdrawal Fee | Stacked Payout Calculator',
		metaDescription:
			'Stack the Fiverr Payoneer withdrawal fee on the later Payoneer cash-out. Both help articles list $3 to a Payoneer Account. Export the memo locally.',
		primaryKeyword: 'fiverr payoneer withdrawal fee',
		heroSummary:
			'A cleared Fiverr order is not the amount that reaches your bank. Fiverr charges its own Payoneer withdrawal fee first. Payoneer can charge again when that balance becomes INR or another local currency. The preset box loads the published Fiverr fees. Where the two help articles disagree, the fee box stays empty.',
		defaultInput: {
			invoiceAmount: 200,
			billingCurrency: 'USD',
			payoutCurrency: 'INR',
			fundingMethod: 'received-balance',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
			marketplaceWithdrawalFeeUsd: 3,
		},
		mode: 'calculator',
		marketplacePresetIds: [
			'fiverr-payoneer-account',
			'fiverr-payoneer-usd-wire',
			'fiverr-local-currency-conflict',
		],
		defaultMarketplacePresetId: 'fiverr-payoneer-account',
		methodologyNotes: [
			'The $3.00 default is the Payoneer Account withdrawal fee, the one figure both Fiverr help articles state. It is deducted before provider percentage fees.',
			'Fiverr does not list Wise, Deel, or Remote as payout methods. A Wise win on the shared five-rail table is not a Fiverr cash-out option. Use the Payoneer row plus the marketplace fee box.',
			'After the $3.00 lands in Payoneer, an Indian seller still faces the India 1% to 4% USD-to-INR withdrawal band. That band is not typed in as a second invented percent. See the India calculator for the band arithmetic.',
			'The general withdrawals article also lists PayPal at $0 USD with a $1 USD minimum, and a discontinued Fiverr Revenue Card. PayPal is outside this batch and is not added as a provider.',
		],
		workedExample: {
			heading: 'Worked example: $200 cleared, Payoneer Account, then an INR bank',
			formula: 'Payoneer balance = cleared earnings - Fiverr withdrawal fee',
			steps: [
				'Both help articles, read 2026-11-13: Payoneer Account withdrawal fee $3.00 USD, minimum withdrawal $10.00 USD, arrival up to two business days.',
				'$200.00 - $3.00 = $197.00 reaching the Payoneer balance. The calculator starts from $200.00 and subtracts $3.00 before it applies percentage FX.',
				'Local-currency bank transfer is not given a single official fee. The Payoneer setup article says $3.00 USD (minimum $20.00, one to three business days) and says a currency conversion rate applies. The general withdrawals article lists Bank Transfer via Payoneer at $1.00 USD for both the local-currency timing and the USD wire timing. Leave that preset blank until the withdrawal screen shows the fee.',
				'USD wire via Payoneer is $1.00 USD on the setup article (minimum $20.00, five to seven business days). The general article $1.00 bank-transfer line agrees with that wire figure.',
				'India pricing then puts 1% to 4% on a USD balance sent to an INR bank. On the $197.00 that remains, 1% is $1.97 and 4% is $7.88. Payoneer does not publish the INR amount. Do not add those percents on top of the site 2.25% model as a second charge.',
			],
		},
		auditCallout:
			'Fiverr says you can withdraw up to $5,000 USD per transaction, you can link a Payoneer method to only one Fiverr account, and you must wait 24 hours after adding or changing that method. A new method under the minimum ($10 for a Payoneer Account, $20 for bank transfer) cannot be withdrawn.',
		feeSources: [
			{
				publisher: 'Fiverr Help',
				pageTitle: 'Setting up Payoneer as a payout method',
				url: 'https://help.fiverr.com/hc/en-us/articles/14257019400465-Setting-up-Payoneer-as-a-payout-method',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Table read 2026-11-13: local-currency bank transfer via Payoneer, $3.00 USD, minimum $20.00, one to three business days; USD wire via Payoneer, $1.00 USD, minimum $20.00, five to seven business days; Payoneer Account, $3.00 USD, minimum $10.00, up to two business days. The article says a currency conversion rate applies on local-currency bank transfer and does not publish that rate. The Fiverr Revenue Card was discontinued in December 2022.',
			},
			{
				publisher: 'Fiverr Help',
				pageTitle: 'Withdrawing your earnings and managing payout methods',
				url: 'https://help.fiverr.com/hc/en-us/articles/360010530058-Withdrawing-your-earnings-managing-payout-methods',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Table read 2026-11-13: PayPal $0 USD, minimum $1; Bank Transfer via Payoneer $1.00 USD, minimum $20, with local-currency timing of 1 to 3 business days or USD wire timing of 5 to 7 business days; Payoneer Account $3.00 USD, minimum $10, up to 2 business days. Withdrawals are capped at $5,000 USD per transaction. This $1.00 bank-transfer line conflicts with the $3.00 local-currency line on the Payoneer setup article.',
			},
			{
				publisher: 'Payoneer India',
				pageTitle: 'Payoneer fees (India)',
				url: 'https://www.payoneer.com/en-in/about/pricing/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'After Fiverr pays a Payoneer balance, an India withdrawal from USD to an INR bank is listed at 1% to 4%, with automatic payout within 48 hours for India customers. Marketplace fees themselves are "set by each marketplace."',
			},
		],
		relatedLinks: [
			{ href: '/payoneer-fees-calculator-india/', label: 'India 1% to 4% band after the Fiverr fee' },
			{ href: '/upwork-withdrawal-fee-payoneer/', label: 'Upwork withdrawal fee to Payoneer' },
			{ href: '/fx-markup-calculator/', label: 'How to measure the FX markup on the rate you are given' },
		],
		faqs: [
			{
				question: 'Which Fiverr Payoneer fee can I trust without opening the withdrawal screen?',
				answer:
					'The Payoneer Account fee of $3.00 USD. Both official articles list it, with a $10.00 minimum. The USD wire fee of $1.00 is also consistent across the setup article and the general bank-transfer line. The local-currency bank fee is listed as $3.00 on one article and is covered by a $1.00 line on the other, so this calculator will not pick one.',
			},
			{
				question: 'Does the $3 Fiverr fee include Payoneer exchange markup?',
				answer:
					'No. Fiverr says the Payoneer withdrawal fee is deducted from the transaction, and that a currency conversion rate applies on a local-currency bank transfer. Payoneer prices that conversion separately. For an Indian bank, the published band is 1% to 4% of the amount that actually arrives in Payoneer.',
			},
			{
				question: 'Why does Wise sometimes rank first if I cannot withdraw Fiverr earnings to Wise?',
				answer:
					'The table is the shared five-rail engine. Fiverr help lists PayPal, bank transfer via Payoneer, a Payoneer Account, and the old Revenue Card. It does not list Wise. Read the Payoneer row and the marketplace fee, then export. Ignore a Wise "best" badge as a Fiverr button you do not have.',
			},
			{
				question: 'What gets exported?',
				answer:
					'The Markdown memo and the CSV fee sheet include the marketplace withdrawal fee when a number is entered. If you leave the local-currency preset blank, the memo says the fee was not entered. That blank is intentional. It is not a claim that Fiverr charges $0.',
			},
		],
	},
	{
		slug: 'upwork-withdrawal-fee-payoneer',
		path: '/upwork-withdrawal-fee-payoneer/',
		navLabel: 'Upwork Withdrawal',
		h1: 'Upwork Withdrawal Fee to Payoneer Calculator',
		seoTitle: 'Upwork Withdrawal Fee to Payoneer | Net Payout Calculator',
		metaDescription:
			'Upwork Payoneer withdrawal calculator for freelancers outside India and the US. The help page does not publish the Payoneer dollar fee. Local bank is $0.99.',
		primaryKeyword: 'upwork withdrawal fee payoneer',
		heroSummary:
			'Upwork tells freelancers outside India and the United States that a Payoneer withdrawal usually arrives within 24 hours and that Upwork charges a small per-transfer fee. The same help page does not print that fee in dollars. This calculator will not invent it. Type the amount from your withdrawal screen, or load the published $0.99 Direct to Local Bank preset if that is the method you actually use.',
		defaultInput: {
			invoiceAmount: 800,
			billingCurrency: 'USD',
			payoutCurrency: 'PHP',
			fundingMethod: 'received-balance',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
			marketplaceWithdrawalFeeUsd: null,
		},
		mode: 'calculator',
		marketplacePresetIds: ['upwork-payoneer-unpublished', 'upwork-local-bank'],
		defaultMarketplacePresetId: 'upwork-payoneer-unpublished',
		methodologyNotes: [
			'The Payoneer preset leaves the fee box empty. Empty means "not entered." The export says so. It does not mean Upwork published a $0 Payoneer fee.',
			'Direct to Local Bank is a different method: $0.99 USD per withdrawal on the Upwork help page, plus any incoming fee your bank charges. Loading that preset applies only $0.99. It does not also invent a Payoneer FX percent.',
			'The Payoneer timing article is explicitly for freelancers outside India and the U.S. An Indian Upwork freelancer should use the withdrawal methods Upwork shows on their own account, including Direct to Local Bank where it is offered, and should not assume Payoneer is available.',
			'This page does not restate the Upwork freelancer service fee. That charge is taken before earnings are available to withdraw, and it was not the figure printed on the withdrawal help pages checked here.',
			'Provider percentage rows still use the site FX model after whatever marketplace fee you enter. Payoneer own conversion, if you withdraw onward to a local bank, is a second step. See the Philippines and India pages for the published Payoneer bands.',
		],
		workedExample: {
			heading: 'Worked example: $800 cleared, two different Upwork methods',
			formula: 'amount leaving Upwork = cleared balance - published withdrawal fee',
			steps: [
				'Direct to Local Bank, published fee: $800.00 - $0.99 = $799.01 leaves Upwork. Upwork says funds usually arrive within four business days, with a 12:00 UTC same-day cutoff. Load the $0.99 preset and export if this is your method.',
				'Payoneer, outside India and the U.S.: Upwork says the transfer typically arrives within 24 hours and that Upwork charges a small per-transfer fee. No dollar amount was on that page on 2026-11-13. Type only the amount printed on your own withdrawal screen. This page does not supply a substitute number.',
				'Whatever you type is deducted from the $800.00 before provider percentage fees, and the memo records that amount as your entry. Leave the box blank if the screen is not in front of you.',
				'A further Payoneer withdrawal from USD to PHP is in the 1.2% to 4% band on Payoneer global pricing (page last updated 1 January 2026). Direct to Wallet in the Philippines uses an exchange rate that already includes conversion, and Upwork says no additional conversion fee is deducted. The wallet withdrawal fee "varies," and no single peso rate was published on the page we checked.',
				'U.S. dollar wire on Upwork is published at $50.00 per transfer. Direct to U.S. Bank is free for a U.S. tax address and $2.99 for an international tax address effective 1 September 2026. Those are not Payoneer fees. They are listed so the Payoneer gap is obvious: other methods have numbers, Payoneer does not, on the pages checked.',
			],
		},
		auditCallout:
			'Payoneer on Upwork is described for freelancers outside India and the U.S. Philippines, Pakistan, Bangladesh, Indonesia, and Kenya are named on Direct to Wallet. This page does not add a PKR corridor. Pakistani freelancers can still use the fee box in USD and read the wallet note.',
		feeSources: [
			{
				publisher: 'Upwork Help',
				pageTitle: 'How quickly Payoneer pays and what fees apply',
				url: 'https://support.upwork.com/hc/en-us/articles/211064008-How-quickly-Payoneer-pays-and-what-fees-apply',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Scoped to freelancers outside India and the U.S. Transfers typically arrive within 24 hours. Upwork charges "a small per-transfer fee" to withdraw to Payoneer. Payoneer may charge activation, maintenance, currency conversion, ATM, and transfer fees, and may set minimums. The page tells you to open your Payoneer account for exact pricing. No Upwork dollar fee for Payoneer was stated.',
			},
			{
				publisher: 'Upwork Help',
				pageTitle: 'How to get paid on Upwork',
				url: 'https://support.upwork.com/hc/en-us/articles/211060918-How-to-get-paid-on-Upwork',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Published withdrawal prices on this page: Direct to Local Bank (outside the U.S.) $0.99 USD; U.S. dollar wire $50.00 USD; Instant Pay for U.S. freelancers $2.00 USD; Direct to U.S. Bank free for a U.S. tax address and $2.99 for an international tax address effective 1 September 2026. Payoneer is named for freelancers outside the U.S. with no dollar fee. Direct to Wallet is named for Bangladesh, Indonesia, Pakistan, Philippines, and Kenya.',
			},
			{
				publisher: 'Upwork Help',
				pageTitle: 'Direct to Local Bank fees, limits, and timing',
				url: 'https://support.upwork.com/hc/en-us/articles/211060578-What-are-the-fees-limits-and-timing-of-Direct-to-Local-Bank-payments',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Confirms $0.99 USD per Direct to Local Bank withdrawal, plus incoming fees at some banks. Arrival is usually within four business days. Same-day processing cutoff is 12:00 UTC.',
			},
			{
				publisher: 'Upwork Help',
				pageTitle: 'Direct to Wallet fees and timing',
				url: 'https://support.upwork.com/hc/en-us/articles/115001615787-What-are-the-fees-and-timing-of-Direct-to-Wallet-payments',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Upwork says the withdrawal fee varies by wallet. For local-currency withdrawals, the amount you receive uses an exchange rate that includes conversion costs, and no additional conversion fee is deducted. No single PHP, PKR, or other local rate was published in the text checked on 2026-11-13.',
			},
		],
		relatedLinks: [
			{ href: '/fiverr-payoneer-withdrawal-fee/', label: 'Fiverr Payoneer fees, where the dollars are published' },
			{ href: '/wise-vs-payoneer-philippines/', label: 'Philippines payee: Wise receipt vs Payoneer pesos' },
			{ href: '/payoneer-fees-calculator-india/', label: 'Payoneer India band, for payees who do hold a Payoneer balance' },
		],
		faqs: [
			{
				question: 'What is the Upwork fee to withdraw to Payoneer?',
				answer:
					'The public help page does not say. It says the fee is small and per transfer, and that Payoneer may charge more for conversion and account services. Type the number on your Upwork withdrawal screen into the fee box. Until you do, this page applies $0 in the math and labels the memo "not entered."',
			},
			{
				question: 'I am in the Philippines. Is $0.99 cheaper than Payoneer?',
				answer:
					'$0.99 is the published Direct to Local Bank fee, not a Payoneer fee. Payoneer can still cost 1.2% to 4% if you later convert USD to PHP, which on $800 is $9.60 to $32.00 before the exchange rate. Compare pesos received, not the $0.99 headline against an unknown Payoneer dollar fee.',
			},
			{
				question: 'Does this include the Upwork service fee on the contract?',
				answer:
					'No. The service fee is taken before the balance is available to withdraw. The withdrawal help pages checked on 2026-11-13 did not restate that percent, so this page does not repeat one. Start the invoice box from cleared earnings, after the service fee.',
			},
			{
				question: 'Can I use the same preset control as the Fiverr page?',
				answer:
					'Yes. Both pages use one marketplace-fee control. Fiverr presets fill $3.00 or $1.00 only where the help articles agree, and they leave the conflicting local-currency fee blank. Upwork presets fill $0.99 for local bank and leave Payoneer blank.',
			},
		],
	},
	{
		slug: 'us-contractor-w8ben-tax-withholding-calculator',
		path: '/us-contractor-w8ben-tax-withholding-calculator/',
		navLabel: 'W-8BEN Withholding',
		h1: 'US Contractor W-8BEN Tax Withholding Calculator and Non-Resident Compliance Guide',
		seoTitle: 'W-8BEN Contractor Tax Withholding Calculator | Non-Resident Guide',
		metaDescription:
			'Calculate US contractor tax withholding with our W-8BEN calculator. Compare 0% foreign source vs 30% default withholding and contractor payout fees locally.',
		primaryKeyword: 'w-8ben contractor tax withholding calculator',
		heroSummary:
			'Determine whether your international contractor payments require 0% or 30% US backup withholding. When non-resident alien independent contractors perform services entirely outside the United States, payments represent foreign-source income subject to 0% US tax withholding under IRS regulations once a valid Form W-8BEN is on file. Combine tax compliance rules with live FX fee comparisons across Wise, Deel, Remote, and bank wires.',
		defaultInput: {
			invoiceAmount: 4000,
			billingCurrency: 'USD',
			payoutCurrency: 'INR',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Under Internal Revenue Code Section 861 and 862, independent contractor personal services are sourced where the physical work is performed. When work occurs outside the US, the income is foreign-source and not subject to US withholding.',
			'Form W-8BEN certifies foreign status and beneficial ownership; without a signed form on file prior to payment, payers face 30% statutory withholding risk under Chapter 3 of the IRC.',
			'Deel and Remote collect and validate Form W-8BEN during automated contractor onboarding; direct bank transfers via Wise require maintaining manual records in accounts payable.',
			'All fee calculations benchmark the net after-tax disbursement across standard local payment rails.',
		],
		workedExample: {
			heading: 'Worked example: $4,000 USD payment to a non-resident contractor in India',
			formula:
				'net_disbursement = gross_invoice - (gross_invoice * withholding_rate) - platform_fx_drag',
			steps: [
				'Gross invoice amount is $4,000.00 USD for software engineering services performed entirely in India.',
				'With a valid Form W-8BEN certifying non-US tax residency and foreign-source service location, the applicable US withholding rate is 0.00% ($0.00 USD withheld).',
				'If Form W-8BEN is missing or invalid, statutory backup withholding of 30.00% applies ($1,200.00 USD withheld, remitted to IRS via Form 1042-S).',
				'On the compliant $4,000.00 USD net disbursement, routing via Wise mid-market rates incurs $35.40 USD total drag versus $130.00 USD via traditional wire markups.',
			],
		},
		auditCallout:
			'ContractorFX provides mathematical software models and educational information. Nothing on this page constitutes legal, tax, or accounting advice. Always consult a licensed CPA or tax attorney for cross-border withholding obligations.',
		feeSources: [
			{
				publisher: 'Internal Revenue Service',
				pageTitle: 'IRS Publication 515: Withholding of Tax on Nonresident Aliens',
				url: 'https://www.irs.gov/publications/p515',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'IRS Publication 515 outlines withholding of tax on non-resident aliens and foreign entities, specifying that services performed outside the US are foreign-source income.',
			},
			{
				publisher: 'Internal Revenue Service',
				pageTitle: 'Instructions for Form W-8BEN',
				url: 'https://www.irs.gov/instructions/iw8ben',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Form W-8BEN establishes foreign status and beneficial ownership of the payee to document exemption from 30% US tax withholding.',
			},
		],
		relatedLinks: [
			{ href: '/payoneer-fees-calculator-india/', label: 'Payoneer India fee calculator and INR auto-withdrawal' },
			{ href: '/deel-vs-wise-contractor-payouts/', label: 'Deel vs Wise contractor payouts: compliance vs direct rails' },
		],
		faqs: [
			{
				question: 'Do non-US independent contractors have to pay US taxes?',
				answer:
					'Generally no. When a non-resident alien independent contractor performs all services outside the United States, the compensation is classified as foreign-source income. As long as a valid Form W-8BEN is on file certifying their non-US status, the US client is not required to withhold federal taxes.',
			},
			{
				question: 'What happens if a US company does not collect Form W-8BEN before paying an overseas contractor?',
				answer:
					'If an IRS audit occurs and the payer cannot document foreign status with a valid Form W-8BEN, the payer may be held personally liable for the 30% statutory withholding tax plus penalties and interest under IRC Section 1461.',
			},
			{
				question: 'Does Form W-8BEN expire?',
				answer:
					'Form W-8BEN remains valid starting on the signature date and ending on the last day of the third succeeding calendar year (typically three years), unless a change in circumstances makes any information on the form incorrect.',
			},
			{
				question: 'Do platforms like Deel or Remote automatically generate Form 1099 or Form 1042-S?',
				answer:
					'Foreign contractors who complete Form W-8BEN do not receive a Form 1099-NEC. If payments represent foreign-source income with 0% withholding, Form 1042-S filing is generally not required for independent personal services.',
			},
		],
		corridorContextNote:
			'W-8BEN compliance guarantees zero US tax withholding on foreign-source contractor invoices, allowing 100% of gross funds to convert over optimal local clearing rails.',
		clearingRailInfo:
			'Compliant payouts settle directly over domestic clearing rails (IMPS in India, PIX in Brazil, SPEI in Mexico) with zero IRS withholding deductions.',
	},
	{
		slug: 'usd-to-brl-pix-contractor-payout-guide',
		path: '/usd-to-brl-pix-contractor-payout-guide/',
		navLabel: 'USD to BRL (PIX)',
		h1: 'USD to BRL Contractor Payout Guide and PIX Settlement Fee Calculator',
		seoTitle: 'USD to BRL Contractor Payout Guide | PIX vs Wire Fee Calculator',
		metaDescription:
			'Benchmark USD to BRL contractor payouts over PIX and TED rails. Compare IOF tax, Wise mid-market rates, Deel, Remote, and traditional bank spreads locally.',
		primaryKeyword: 'usd to brl contractor payout',
		heroSummary:
			'Benchmark net take-home pay for Brazilian remote contractors receiving USD invoices settled into Brazilian Reais (BRL). Compare instant PIX clearing and TED bank transfers against international SWIFT wires, factoring in Brazilian IOF tax (0.38% standard on inbound transfers) and hidden retail exchange rate markups across Wise, Deel, Remote, and traditional banks.',
		defaultInput: {
			invoiceAmount: 4500,
			billingCurrency: 'USD',
			payoutCurrency: 'BRL',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Brazilian Central Bank regulations require foreign exchange contracts (cambio) for incoming remittances, applying IOF tax (Imposto sobre Operacoes Financeiras) of 0.38% on standard business export services.',
			'PIX delivers funds 24/7/365 in seconds using the recipient CPF (individual) or CNPJ (business entity) key, replacing legacy TED and DOC transfers.',
			'Brazilian contractors operating as PJ (Pessoa Juridica) issue an NFS-e (Nota Fiscal de Servicos Eletronica) and pay domestic taxes under Simples Nacional or Lucro Presumido.',
			'Wise converts at mid-market spot pricing and settles directly over the domestic PIX rail with transparent spreads.',
		],
		workedExample: {
			heading: 'Worked example: $4,500 USD invoice converted to Brazilian Reais (BRL)',
			formula:
				'net_brl = (gross_usd - funding_fee) * (1 - iof_rate) * (mid_rate * (1 - fx_spread))',
			steps: [
				'Gross invoice is $4,500.00 USD. Reference interbank mid-rate is 1 USD = 5.75 BRL (gross equivalent = 25,875.00 BRL).',
				'Inbound foreign exchange into Brazil incurs 0.38% IOF tax ($17.10 USD equivalent).',
				'Wise delivers via PIX within seconds at a 0.48% conversion spread ($21.60 USD) and ACH funding ($19.70 USD), delivering 25,602.00 BRL.',
				'Traditional SWIFT wire incurs $35.00 outgoing wire fee, $15.00 intermediary bank fee, plus 2.60% Brazilian bank retail spread, delivering 24,520.00 BRL (loss of 1,082.00 BRL or $188.00 USD).',
			],
		},
		auditCallout:
			'Brazilian contractors operating as PJ (Pessoa Juridica) must issue a municipal NFS-e (Nota Fiscal de Servicos Eletronica) and account for Simples Nacional or Lucro Presumido taxes.',
		feeSources: [
			{
				publisher: 'Banco Central do Brasil',
				pageTitle: 'Regulamentacao do Sistema de Pagamentos Instantaneos (PIX)',
				url: 'https://www.bcb.gov.br/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Banco Central do Brasil establishes rules for PIX instant settlements, foreign exchange transaction registration, and reporting.',
			},
			{
				publisher: 'Wise',
				pageTitle: 'Wise USD to BRL Transfer Pricing',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise quotes transparent fees and mid-market rates for BRL payouts delivered via the domestic PIX rail.',
			},
		],
		relatedLinks: [
			{ href: '/deel-vs-remote-contractor-calculator/', label: 'Deel vs Remote 5-contractor BRL team benchmark' },
			{ href: '/fx-markup-calculator/', label: 'Calculate exact BRL exchange rate markup in bps' },
		],
		faqs: [
			{
				question: 'How fast do Brazilian contractors receive USD payments sent via PIX?',
				answer:
					'When the sender uses a platform integrated with local Brazilian clearing (such as Wise), funds settle into the contractor bank account via PIX within seconds once currency conversion is executed.',
			},
			{
				question: 'What is IOF tax on international contractor payments into Brazil?',
				answer:
					'IOF (Imposto sobre Operacoes Financeiras) is a federal tax levied by the Brazilian government on FX operations. For inbound payments representing exported services from a foreign client, the standard IOF rate is 0.38%.',
			},
			{
				question: 'Should Brazilian remote developers register as PJ or receive as an individual (PF)?',
				answer:
					'Receiving foreign compensation as an individual (Pessoa Fisica) can trigger progressive income tax rates up to 27.5% under Carne-Leao. Most full-time Brazilian remote workers form a legal entity (PJ) under the Simples Nacional regime to lower effective tax rates to between 6% and 15%.',
			},
			{
				question: 'Can Brazilian contractors hold a USD balance directly in Brazil?',
				answer:
					'Recent Brazilian foreign exchange framework modernization allows domestic banks to offer foreign currency accounts under specific conditions, but daily living expenses require converting to Reais (BRL) via domestic clearing.',
			},
		],
		corridorContextNote:
			'The Brazil corridor is defined by PIX instant clearance, municipal NFS-e invoicing, and federal 0.38% IOF tax on inbound service exports.',
		clearingRailInfo:
			'PIX functions 24 hours a day, 7 days a week, settling interbank BRL transfers in under 10 seconds without intermediary correspondent bank fees.',
	},
	{
		slug: 'usd-to-mxn-spei-freelancer-payouts',
		path: '/usd-to-mxn-spei-freelancer-payouts/',
		navLabel: 'USD to MXN (SPEI)',
		h1: 'USD to MXN Contractor Payout Calculator and SPEI Transfer Benchmark',
		seoTitle: 'USD to MXN Contractor Payout Calculator | SPEI Transfer Fees',
		metaDescription:
			'Calculate USD to MXN contractor payouts over SPEI rails. Compare Deel $5 withdrawal fee, Wise mid-market rates, Payoneer, and Mexican bank retail spreads.',
		primaryKeyword: 'usd to mxn contractor payout',
		heroSummary:
			'Calculate net Mexican Pesos (MXN) delivered on USD contractor invoices routed through Mexico SPEI (Sistema de Pagos Electronicos Interbancarios) instant clearing rail. Compare platform withdrawal charges from Deel ($5.00 USD non-ACH withdrawal fee), Wise transparent variable pricing, Payoneer conversion bands, and traditional bank correspondent deductions.',
		defaultInput: {
			invoiceAmount: 3000,
			billingCurrency: 'USD',
			payoutCurrency: 'MXN',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'SPEI is Mexico national interbank clearing rail operated by Banco de Mexico, executing Mexican Peso electronic transfers 24/7 across 18-digit CLABE account numbers.',
			'Mexican contractors registered under the SAT RESICO regime (Regimen Simplificado de Confianza) pay reduced income tax rates (1.0% to 2.5%) on exported services when issuing compliant CFDI invoices with 0% VAT.',
			'Deel applies a $5.00 USD non-ACH fixed fee on bank withdrawals alongside retail conversion markups.',
			'Wise converts at mid-market spot and deposits directly to recipient Mexican bank accounts via SPEI within minutes.',
		],
		workedExample: {
			heading: 'Worked example: $3,000 USD contractor invoice delivered via SPEI',
			formula:
				'net_mxn = (gross_usd - platform_fees) * (mid_rate * (1 - fx_spread))',
			steps: [
				'Gross invoice is $3,000.00 USD. Reference interbank mid-rate is 1 USD = 20.20 MXN (gross value = 60,600.00 MXN).',
				'Wise converts at mid-market spot with a 0.48% spread ($14.40 USD) and ACH funding ($13.25 USD), routing over SPEI directly into recipient Mexican CLABE bank account, delivering 59,980.00 MXN.',
				'Deel applies approximately 1.50% conversion spread ($45.00 USD) on local bank withdrawal, delivering 59,691.00 MXN.',
				'Payoneer applies a 2.25% conversion spread ($67.50 USD) plus a 1.00% ACH credit fee ($30.00 USD), delivering 58,630.00 MXN.',
			],
		},
		auditCallout:
			'Mexican contractors under the RESICO tax regime benefit from reduced income tax rates (1% to 2.5%) on exported services when verified with compliant CFDI invoices and wire documentation.',
		feeSources: [
			{
				publisher: 'Banco de Mexico',
				pageTitle: 'Sistema de Pagos Electronicos Interbancarios (SPEI)',
				url: 'https://www.banxico.org.mx/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'SPEI facilitates real-time interbank electronic funds transfers within Mexico with low domestic transaction overhead.',
			},
			{
				publisher: 'SAT Mexico',
				pageTitle: 'Regimen Simplificado de Confianza (RESICO)',
				url: 'https://www.sat.gob.mx/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Servicio de Administracion Tributaria rules for exporting digital services under the RESICO tax regime with 0% VAT rate.',
			},
		],
		relatedLinks: [
			{ href: '/deel-withdrawal-fee-calculator/', label: 'Deel withdrawal fee calculator for MXN cash-outs' },
			{ href: '/fx-markup-calculator/', label: 'Measure exact MXN exchange rate markup in bps' },
		],
		faqs: [
			{
				question: 'How do Mexican contractors receive international USD payments via SPEI?',
				answer:
					'Payout platforms with Mexican clearing integrations convert USD to MXN at their prevailing exchange rate and dispatch the Mexican Pesos over SPEI using the contractor 18-digit CLABE number, typically completing in under five minutes.',
			},
			{
				question: 'Do Mexican contractors charge VAT (IVA) to US or international clients?',
				answer:
					'Under Mexican VAT Law (Ley del IVA) Article 29, the export of independent personal services utilized entirely abroad is zero-rated (0% IVA), meaning Mexican contractors do not add 16% VAT to international invoices.',
			},
			{
				question: 'Why should Mexican contractors avoid international SWIFT wires into domestic USD accounts?',
				answer:
					'Unless you hold an authorized border-zone commercial account, Mexican banks convert incoming USD wires into MXN at retail bank counter rates that carry wide spreads (2.5% to 4.0%), in addition to charging $15 to $30 USD in incoming wire fees.',
			},
			{
				question: 'What is an 18-digit CLABE number in Mexico?',
				answer:
					'CLABE (Clave Bancaria Estandarizada) is the standard 18-digit bank account identifier in Mexico used to route SPEI payments. It encodes the bank code (3 digits), branch code (3 digits), account number (11 digits), and a check digit (1 digit).',
			},
		],
		corridorContextNote:
			'Mexico nearshoring relies on the SPEI 24/7 instant clearing rail and CFDI 4.0 invoicing with 0% export VAT under the SAT RESICO regime.',
		clearingRailInfo:
			'SPEI transfers clear in real time across all Mexican banks when addressed with a valid 18-digit CLABE number.',
	},
	{
		slug: 'paypal-contractor-fx-fee-calculator',
		path: '/paypal-contractor-fx-fee-calculator/',
		navLabel: 'PayPal FX Fees',
		h1: 'PayPal Contractor FX Fee Calculator and Hidden Currency Markup Benchmark',
		seoTitle: 'PayPal Contractor FX Fee Calculator | Hidden Exchange Rate Spread',
		metaDescription:
			'Uncover hidden FX markups in PayPal contractor payouts. Compare PayPal 3.5% to 4.5% conversion spreads and commercial fees against Wise and Payoneer rates.',
		primaryKeyword: 'paypal contractor fx fee calculator',
		heroSummary:
			'Measure the true cost of using PayPal for international contractor invoices. In addition to commercial receiving fees of 3.49% to 4.40% plus fixed charges, PayPal embeds an exchange rate markup between 3.50% and 4.50% above the wholesale interbank rate whenever balance is withdrawn into local non-USD bank accounts. Benchmark total fee drag against Wise mid-market rates and Payoneer.',
		defaultInput: {
			invoiceAmount: 2500,
			billingCurrency: 'USD',
			payoutCurrency: 'EUR',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'PayPal user agreements state that a currency conversion spread of 3.0% to 4.5% is added above the wholesale interbank rate for cross-currency transfers and local bank withdrawals.',
			'Commercial transactions from international buyers incur a 4.40% receiving fee plus a fixed currency charge, compounding with the conversion spread.',
			'Wise charges mid-market exchange rates with an upfront variable fee (typically 0.40% to 0.50% on major currencies).',
			'This calculator separates upfront merchant receiving fees from downstream currency conversion drag to reveal full transaction cost.',
		],
		workedExample: {
			heading: 'Worked example: $2,500 USD invoice paid via PayPal versus Wise',
			formula:
				'paypal_drag = (gross_usd * commercial_rate + fixed_fee) + (net_usd * fx_spread)',
			steps: [
				'Assume an international client sends $2,500.00 USD to a freelance developer in Europe (mid-market rate 1 USD = 0.9200 EUR, gross value = 2,300.00 EUR).',
				'PayPal commercial receiving fee is 4.40% + $0.49 USD = $110.49 USD, leaving a USD balance of $2,389.51 USD.',
				'Withdrawing that balance to a European EUR bank triggers PayPal currency conversion spread of approximately 4.00% ($95.58 USD FX loss), delivering 2,110.40 EUR (total fee drag: $189.60 USD or 7.58%).',
				'Wise Business ACH invoice payment incurs 0.48% conversion spread ($12.00 USD) and ACH funding ($11.10 USD), delivering 2,278.70 EUR (total fee drag: $23.10 USD or 0.92%).',
				'The contractor retains an additional 168.30 EUR ($166.50 USD) on a single invoice by skipping PayPal conversion.',
			],
		},
		auditCallout:
			'PayPal currency conversion markups are among the highest in fintech; international contractors should maintain USD balances or route via mid-market platforms like Wise to avoid 4% spread deductions.',
		feeSources: [
			{
				publisher: 'PayPal',
				pageTitle: 'PayPal Merchant Fees Schedule',
				url: 'https://www.paypal.com/us/webapps/mpp/merchant-fees',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'PayPal commercial transaction fees for receiving domestic and international payments range from 3.49% to 4.40% plus fixed currency fees.',
			},
			{
				publisher: 'PayPal Legal',
				pageTitle: 'PayPal User Agreement Currency Conversion',
				url: 'https://www.paypal.com/us/legalhub/useragreement-full',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'PayPal adds a currency conversion spread of 3.0% to 4.5% above wholesale interbank exchange rates depending on transaction type.',
			},
		],
		relatedLinks: [
			{ href: '/fx-markup-calculator/', label: 'Measure the exact hidden spread in any PayPal exchange rate' },
			{ href: '/wise-vs-payoneer-fee-calculator/', label: 'Wise vs Payoneer fee comparison for cross-border invoices' },
		],
		faqs: [
			{
				question: 'Why does PayPal charge both a transaction fee and an exchange rate fee?',
				answer:
					'PayPal treats payment processing and currency conversion as two separate revenue centers. The commercial transaction fee (up to 4.40%) covers payment gateway processing, while the 3.5% to 4.5% exchange rate markup is deducted when converting currencies.',
			},
			{
				question: 'Can international freelancers withdraw USD directly from PayPal to a local bank account?',
				answer:
					'In most countries, PayPal automatically forces conversion to the local bank national currency at PayPal internal exchange rate. Direct USD withdrawals to non-US bank accounts are either prohibited or subject to high fixed fees.',
			},
			{
				question: 'How do Wise and Payoneer compare to PayPal on a $2,500 USD invoice?',
				answer:
					'On a $2,500 invoice, PayPal fee drag often exceeds $175 to $200 USD (7% to 8%). Payoneer total drag is typically around $60 to $85 USD (2.5% to 3.4%), while Wise mid-market transfers total approximately $20 to $30 USD (under 1.2%).',
			},
			{
				question: 'Is PayPal Friends and Family an option for international contractor payments?',
				answer:
					'No. Paying contractors via Friends and Family violates PayPal Terms of Service for commercial work, eliminates buyer/seller protection, and fails to generate the required accounting and tax records for corporate audit trails.',
			},
		],
		corridorContextNote:
			'PayPal combines a 4.40% cross-border commercial receiving fee with an additional 3.5% to 4.5% retail exchange spread on bank cash-outs.',
		clearingRailInfo:
			'Modern alternatives route domestic clearing directly into local IBANs, saving up to 6% in combined payment processing and conversion markups.',
	},
	{
		slug: 'usd-to-cad-contractor-payout-calculator',
		path: '/usd-to-cad-contractor-payout-calculator/',
		navLabel: 'USD to CAD (EFT)',
		h1: 'USD to CAD Contractor Payout Calculator and Cross-Border EFT Fee Audit',
		seoTitle: 'USD to CAD Contractor Payout Calculator | Cross-Border EFT Fees',
		metaDescription:
			'Compare USD to CAD contractor payouts over local EFT rails. Benchmark Canadian bank wire fees, retail FX markups, Wise, Deel, and Remote side by side.',
		primaryKeyword: 'usd to cad contractor payout',
		heroSummary:
			'Benchmark net Canadian Dollars (CAD) received by Canadian remote workers on USD invoices. Compare Canadian bank (RBC, TD, BMO, Scotiabank, CIBC) incoming wire fees ($15.00 to $25.00 CAD) and retail currency markups (2.0% to 3.0%) against automated local EFT clearing via Wise Business, Deel, and Remote.',
		defaultInput: {
			invoiceAmount: 5000,
			billingCurrency: 'USD',
			payoutCurrency: 'CAD',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'Cross-border payments between the US and Canada can clear via SWIFT wire or domestic Canadian EFT (Electronic Funds Transfer) direct deposit through Payments Canada ACSS system.',
			'Major Canadian chartered banks charge $15 to $25 CAD incoming wire fees plus a 2.0% to 3.0% retail exchange spread on USD funds converted to CAD.',
			'Canadian sole proprietors providing services to non-resident US clients treat export services as zero-rated under CRA GST/HST rules.',
			'Wise converts at the interbank mid-market rate and deposits funds directly via local Canadian EFT within one business day.',
		],
		workedExample: {
			heading: 'Worked example: $5,000 USD contractor invoice delivered into Canadian Dollars',
			formula:
				'net_cad = (gross_usd - funding_fee) * (mid_rate * (1 - fx_spread)) - bank_receiving_fee',
			steps: [
				'Gross invoice is $5,000.00 USD. Reference interbank mid-rate is 1 USD = 1.3800 CAD (gross equivalent = 6,900.00 CAD).',
				'Wise converts at mid-market spot with a 0.48% spread ($24.00 USD) and ACH funding ($21.85 USD), clearing via local Canadian EFT direct deposit, delivering 6,836.70 CAD (effective drag: 63.30 CAD or 0.92%).',
				'Sending via SWIFT bank wire incurs $35.00 USD sender fee, $15.00 CAD recipient bank incoming wire fee, plus 2.50% Canadian bank retail FX markup ($125.00 USD), delivering 6,530.00 CAD (loss of 370.00 CAD or $268.00 USD).',
			],
		},
		auditCallout:
			'Canadian sole proprietors providing services to non-resident clients should treat export services as zero-rated under CRA GST/HST rules, meaning 0% tax is charged but input tax credits can be claimed.',
		feeSources: [
			{
				publisher: 'Payments Canada',
				pageTitle: 'Automated Clearing Settlement System (ACSS) Rules',
				url: 'https://www.payments.ca/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Payments Canada governs the ACSS system and clearing standards for direct deposit EFT transactions across Canadian financial institutions.',
			},
			{
				publisher: 'Wise',
				pageTitle: 'Wise USD to CAD Transfer Pricing',
				url: 'https://wise.com/us/pricing/send-money',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Wise provides transparent mid-market exchange rates and local Canadian EFT delivery without recipient incoming wire charges.',
			},
		],
		relatedLinks: [
			{ href: '/deel-vs-wise-contractor-payouts/', label: 'Deel vs Wise contractor payouts: comparing SaaS vs direct rails' },
			{ href: '/fx-markup-calculator/', label: 'Measure the exact CAD exchange rate spread in bps' },
		],
		faqs: [
			{
				question: 'How do Canadian banks handle incoming international US dollar wires?',
				answer:
					'If deposited into a standard CAD chequing account, the Canadian bank converts the USD at its retail foreign exchange spread (typically 2.0% to 3.0% below the mid-market rate) and deducts an incoming wire fee of $15 to $25 CAD.',
			},
			{
				question: 'Can Canadian contractors hold a USD account in Canada to avoid conversion?',
				answer:
					'Yes. Most Canadian banks offer USD-denominated accounts based in Canada. While this avoids automatic currency conversion, incoming international wire fees still apply, and moving funds from the USD account to a CAD account later will incur the bank retail conversion spread.',
			},
			{
				question: 'Do Canadian independent contractors need to charge GST/HST to US clients?',
				answer:
					'Under Canada Revenue Agency (CRA) guidelines, services provided to a non-resident individual or company are generally zero-rated for GST/HST purposes (0% tax rate), provided the service is performed for business purposes outside Canada.',
			},
			{
				question: 'What information does an employer need to send funds via Canadian EFT?',
				answer:
					'To deliver via local Canadian EFT, the sender requires the contractor 3-digit institution number, 5-digit transit (branch) number, and account number (7 to 12 digits), which can be found on a void cheque.',
			},
		],
		corridorContextNote:
			'The US to Canada corridor leverages domestic EFT clearing to bypass Canadian chartered bank international wire charges and retail FX spreads.',
		clearingRailInfo:
			'Canadian EFT direct deposit routes through Payments Canada ACSS, settling within 1 business day without intermediary deductions.',
	},
	{
		slug: 'contractor-payout-fail-rate-reconciliation-guide',
		path: '/contractor-payout-fail-rate-reconciliation-guide/',
		navLabel: 'Wire Fail & Reconciliation',
		h1: 'Contractor Payout Failure Reconciliation Guide and SWIFT Intermediary Fee Audit',
		seoTitle: 'Contractor Payout Failure Reconciliation Guide | SWIFT Wire Audit',
		metaDescription:
			'Troubleshoot failed international contractor wires and missing funds. Audit SWIFT intermediary bank lifting fees (OUR, BEN, SHA) and local clearing rails.',
		primaryKeyword: 'contractor payment rejected swift intermediary fees',
		heroSummary:
			'Diagnose and resolve missing funds, intermediary deductions, and rejected cross-border contractor wires. When sending international SWIFT bank transfers, intermediary correspondent banks deduct $15.00 to $50.00 in lifting fees depending on charge codes (OUR, BEN, SHA), while slight name mismatches or incorrect IBAN checksums cause costly returns. Benchmark SWIFT wire failure points against modern local clearing rails.',
		defaultInput: {
			invoiceAmount: 3500,
			billingCurrency: 'USD',
			payoutCurrency: 'EUR',
			fundingMethod: 'wire',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		},
		mode: 'calculator',
		methodologyNotes: [
			'SWIFT MT103 Field 71A defines charge allocation: OUR (sender pays all fees), BEN (beneficiary pays all fees), or SHA (shared, sender pays outgoing fee and beneficiary absorbs intermediary deductions).',
			'Correspondent banking networks route wires through one or more intermediary banks before reaching the beneficiary institution, each potentially deducting lifting fees.',
			'International wire returns incur reverse intermediary fees ($25 to $50 USD) and double-conversion foreign exchange losses.',
			'Modern payout networks replace correspondent SWIFT hops with pre-funded local clearing accounts in each recipient jurisdiction.',
		],
		workedExample: {
			heading: 'Worked example: reconciling an international wire with intermediary deductions',
			formula:
				'net_received = gross_sent - sender_bank_fee - correspondent_lifting_fee - recipient_fx_markup',
			steps: [
				'Sender dispatches $3,500.00 USD via SWIFT under the standard SHA (shared) charge code, paying a $30.00 USD initiation fee.',
				'The payment routes through two intermediary correspondent banks, which deduct $20.00 USD and $15.00 USD in transit lifting charges, reducing the principal to $3,465.00 USD.',
				'The recipient local bank in Europe rejects the wire because the beneficiary name on the invoice was a trade name instead of the contractor personal legal name.',
				'The wire is returned minus an additional $35.00 return processing fee and converted back at unfavorable retail bid/ask rates, generating an unrecoverable loss of $100.00+ USD and a 10-day delay.',
				'Routing over Wise or Deel local rails guarantees exact recipient net delivery with upfront IBAN/account validation.',
			],
		},
		auditCallout:
			'Always verify recipient beneficiary legal name matching and local clearing codes (ACH routing, UK sort code, Indian IFSC, Mexican CLABE) to avoid SWIFT intermediary rejections.',
		feeSources: [
			{
				publisher: 'SWIFT Standards',
				pageTitle: 'SWIFT MT103 Field 71A Charge Details',
				url: 'https://www.swift.com/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'SWIFT documentation defines Field 71A charge allocation codes (OUR, BEN, SHA) governing correspondent bank lifting fee deductions.',
			},
			{
				publisher: 'Federal Reserve',
				pageTitle: 'Foreign Remittance Transfer Disclosures and Protections',
				url: 'https://www.federalreserve.gov/',
				verifiedOn: FEE_SOURCE_VERIFIED_ON,
				finding:
					'Federal guidelines under the Dodd-Frank Act require disclosure of third-party fees and exchange rates for consumer international transfers.',
			},
		],
		relatedLinks: [
			{ href: '/fx-markup-calculator/', label: 'Measure the hidden FX markup in bank and wire transactions' },
			{ href: '/batch-contractor-payout-csv-audit/', label: 'Audit your full contractor team roster for wire fee leakage' },
		],
		faqs: [
			{
				question: 'What is the difference between OUR, BEN, and SHA in an international bank wire?',
				answer:
					'OUR means the sender pays all fees including intermediary charges. BEN means the recipient absorbs all sender, intermediary, and receiving charges. SHA (shared) means the sender pays outgoing bank fees, while intermediary correspondent deductions are subtracted from the transfer amount before delivery.',
			},
			{
				question: 'Why did my contractor receive $30 less than the nominal invoice amount?',
				answer:
					'Under the common SHA wire instruction, intermediary correspondent banks in the SWIFT path deduct lifting fees (typically $15 to $35 USD) directly from the principal in transit before the funds reach the destination bank.',
			},
			{
				question: 'What are the most common reasons an international contractor wire gets rejected?',
				answer:
					'The leading causes of wire rejection are: (1) beneficiary name mismatch (trade/business name vs personal legal bank account name), (2) incorrect IBAN or routing checksum, (3) missing intermediary/correspondent BIC code, and (4) local currency mismatches.',
			},
			{
				question: 'How do modern contractor platforms prevent intermediary wire losses?',
				answer:
					'Platforms like Wise, Deel, and Remote avoid SWIFT correspondent chains by maintaining pre-funded local bank accounts in dozens of countries. The payment clears through domestic ACH, SEPA, PIX, or SPEI rails, delivering exact net totals with zero intermediary lifting deductions.',
			},
		],
		corridorContextNote:
			'International SWIFT wire failures are driven by intermediary correspondent bank lifting deductions (Field 71A) and beneficiary account naming mismatches.',
		clearingRailInfo:
			'Migrating from SWIFT correspondent networks to domestic pre-funded clearing rails eliminates transit deductions and guarantees exact net invoice delivery.',
	},
];

export function getPresetBySlug(slug: string): FxRoutePreset | undefined {
	const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
	return ROUTE_PRESETS.find((preset) => preset.slug === normalized);
}

import type { FxRoutePreset, PayoutScenarioInput } from './types';

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
	},
];

export function getPresetBySlug(slug: string): FxRoutePreset | undefined {
	const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
	return ROUTE_PRESETS.find((preset) => preset.slug === normalized);
}

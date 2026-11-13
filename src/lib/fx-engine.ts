import type {
	BatchAuditResult,
	BatchCsvRowResult,
	BillingCurrency,
	ComparisonSummary,
	FeeBearer,
	FundingMethod,
	PayoutCurrency,
	PayoutScenarioInput,
	ProviderId,
	ProviderQuote,
} from './types';

export const REFERENCE_USD_RATES: Record<BillingCurrency | PayoutCurrency, number> = {
	USD: 1,
	EUR: 0.92,
	GBP: 0.79,
	CAD: 1.39,
	CNY: 7.24,
	INR: 84.4,
	PHP: 58.6,
	BRL: 5.78,
	MXN: 20.15,
};

interface ProviderPricingModel {
	providerId: ProviderId;
	providerName: string;
	seatFeePerContractorUsd: number;
	computeFundingFeeUsd: (grossUsd: number, fundingMethod: FundingMethod) => number;
	computeWithdrawalFixedFeeUsd: (
		grossUsd: number,
		fundingMethod: FundingMethod,
		isSameCurrency: boolean,
	) => number;
	crossCurrencySpreadPct: number;
	buildNotes: (isSameCurrency: boolean, fundingMethod: FundingMethod) => string;
}

const PROVIDER_MODELS: readonly ProviderPricingModel[] = [
	{
		providerId: 'wise',
		providerName: 'Wise Business',
		seatFeePerContractorUsd: 0,
		computeFundingFeeUsd: (grossUsd, method) => {
			if (grossUsd <= 0 || method === 'received-balance') return 0;
			if (method === 'ach-bank') return grossUsd * 0.0043 + 0.35;
			if (method === 'wire') return 6.11 + grossUsd * 0.0043;
			return grossUsd * 0.029 + 0.3;
		},
		computeWithdrawalFixedFeeUsd: () => 0,
		crossCurrencySpreadPct: 0.48,
		buildNotes: (isSameCurrency, fundingMethod) => {
			if (fundingMethod === 'received-balance') {
				return isSameCurrency
					? 'Balance already received: $0 new funding fee, 0% FX markup, and $0 monthly seat cost.'
					: 'Balance already received: $0 new funding fee. The 0.48% figure is this site FX model, not a live Wise quote.';
			}
			return isSameCurrency
				? 'Same-currency local bank transfer with 0% FX conversion markup and $0 monthly seat cost.'
				: 'Mid-market exchange rate with a transparent 0.48% conversion fee and $0 monthly seat cost.';
		},
	},
	{
		providerId: 'payoneer',
		providerName: 'Payoneer',
		seatFeePerContractorUsd: 0,
		computeFundingFeeUsd: (grossUsd, method) => {
			if (grossUsd <= 0 || method === 'received-balance') return 0;
			if (method === 'ach-bank') return grossUsd * 0.01;
			if (method === 'wire') return 15;
			return grossUsd * 0.03;
		},
		computeWithdrawalFixedFeeUsd: (grossUsd, _method, isSameCurrency) => {
			if (grossUsd <= 0 || !isSameCurrency) return 0;
			return Math.max(1.5, grossUsd * 0.02);
		},
		crossCurrencySpreadPct: 2.25,
		buildNotes: (isSameCurrency, fundingMethod) => {
			if (fundingMethod === 'received-balance') {
				return isSameCurrency
					? 'Balance already received: 0% FX spread, with the 2% same-currency bank withdrawal fee ($1.50 minimum).'
					: 'Balance already received: $0 new client funding fee. Cross-currency loss uses this site 2.25% FX model, not a Payoneer-published point rate.';
			}
			return isSameCurrency
				? '0% FX spread with a 2% same-currency bank withdrawal fee ($1.50 minimum) and $0 seat cost.'
				: '$0 monthly seat fee, client funding fee plus ~2.25% hidden FX spread above mid-market.';
		},
	},
	{
		providerId: 'deel',
		providerName: 'Deel',
		seatFeePerContractorUsd: 49,
		computeFundingFeeUsd: (grossUsd, method) => {
			if (grossUsd <= 0 || method === 'received-balance') return 0;
			if (method === 'card') return grossUsd * 0.035;
			return 0;
		},
		computeWithdrawalFixedFeeUsd: (grossUsd, method) => {
			if (grossUsd <= 0 || method === 'ach-bank' || method === 'received-balance') return 0;
			return 5;
		},
		crossCurrencySpreadPct: 1.5,
		buildNotes: (isSameCurrency, fundingMethod) => {
			if (fundingMethod === 'received-balance') {
				return isSameCurrency
					? 'Balance already received: $49/contractor monthly seat still applies, with 0% FX spread.'
					: 'Balance already received: $49/contractor monthly seat plus this site 1.50% FX model.';
			}
			return isSameCurrency
				? '$49/contractor monthly SaaS seat fee with 0% FX spread on same-currency withdrawals.'
				: '$49/contractor monthly SaaS seat fee plus ~1.5% contractor withdrawal FX spread.';
		},
	},
	{
		providerId: 'remote',
		providerName: 'Remote',
		seatFeePerContractorUsd: 29,
		computeFundingFeeUsd: (grossUsd, method) => {
			if (grossUsd <= 0 || method === 'received-balance') return 0;
			if (method === 'card') return grossUsd * 0.035;
			return 0;
		},
		computeWithdrawalFixedFeeUsd: () => 0,
		crossCurrencySpreadPct: 1.25,
		buildNotes: (isSameCurrency, fundingMethod) => {
			if (fundingMethod === 'received-balance') {
				return isSameCurrency
					? 'Balance already received: $29/contractor monthly seat still applies, with 0% FX spread.'
					: 'Balance already received: $29/contractor monthly seat plus this site 1.25% FX model.';
			}
			return isSameCurrency
				? '$29/contractor monthly SaaS seat fee with $0 ACH funding and 0% same-currency FX spread.'
				: '$29/contractor monthly SaaS seat fee plus ~1.25% FX conversion spread on payouts.';
		},
	},
	{
		providerId: 'swift-wire',
		providerName: 'Traditional Bank SWIFT',
		seatFeePerContractorUsd: 0,
		computeFundingFeeUsd: (grossUsd, method) => {
			if (grossUsd <= 0 || method === 'received-balance') return 0;
			return 35;
		},
		computeWithdrawalFixedFeeUsd: (grossUsd) => (grossUsd > 0 ? 15 : 0),
		crossCurrencySpreadPct: 2.6,
		buildNotes: (isSameCurrency, fundingMethod) => {
			if (fundingMethod === 'received-balance') {
				return isSameCurrency
					? 'Balance already received: the $35 outgoing wire is not applied. This model still includes the $15 correspondent fee and 0% FX spread.'
					: 'Balance already received: the $35 outgoing wire is not applied. This model still includes the $15 correspondent fee and the 2.60% FX desk assumption.';
			}
			return isSameCurrency
				? '$35 outgoing bank wire plus $15 correspondent bank fee ($50 fixed rail bite) and 0% FX spread.'
				: '$35 outgoing wire plus $15 correspondent bank fee ($50 fixed rail bite) and 2.6% bank FX desk spread.';
		},
	},
];

const VALID_BILLING_CURRENCIES = new Set<BillingCurrency>(['USD', 'EUR', 'GBP']);
const VALID_PAYOUT_CURRENCIES = new Set<PayoutCurrency>([
	'EUR',
	'GBP',
	'INR',
	'PHP',
	'BRL',
	'MXN',
	'CNY',
	'CAD',
]);
const VALID_PROVIDERS = new Set<ProviderId>(['wise', 'payoneer', 'deel', 'remote', 'swift-wire']);
const REQUIRED_CSV_COLUMNS = [
	'contractor',
	'amount',
	'billing_currency',
	'payout_currency',
	'current_provider',
] as const;

function round2(value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function round6(value: number): number {
	return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function formatMoney(value: number): string {
	return round2(value).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function computeNetUsdReachingContractor(
	grossUsd: number,
	fundingFeeUsd: number,
	withdrawalFixedFeeUsd: number,
	fxLossUsd: number,
	feeBearer: FeeBearer,
): number {
	const deductedUsd =
		feeBearer === 'contractor'
			? fundingFeeUsd + withdrawalFixedFeeUsd + fxLossUsd
			: withdrawalFixedFeeUsd + fxLossUsd;
	return Math.max(0, grossUsd - deductedUsd);
}

function buildDeelBreakEvenNote(
	quotes: ProviderQuote[],
	contractorCount: number,
): string {
	const wise = quotes.find((q) => q.providerId === 'wise')!;
	const deel = quotes.find((q) => q.providerId === 'deel')!;
	const payoneer = quotes.find((q) => q.providerId === 'payoneer')!;

	const wiseMonthlyUsd = round2(wise.annualFeeDragUsd / 12);
	const deelMonthlyUsd = round2(deel.annualFeeDragUsd / 12);
	const payoneerMonthlyUsd = round2(payoneer.annualFeeDragUsd / 12);

	const savedVsDeelMonthly = round2(deelMonthlyUsd - wiseMonthlyUsd);
	const savedVsDeelAnnual = round2(deel.annualFeeDragUsd - wise.annualFeeDragUsd);
	const savedVsPayoneerMonthly = round2(payoneerMonthlyUsd - wiseMonthlyUsd);
	const savedVsPayoneerAnnual = round2(payoneer.annualFeeDragUsd - wise.annualFeeDragUsd);

	const contractorLabel = contractorCount === 1 ? 'contractor' : 'contractors';

	return (
		`Direct Wise Business saves $${formatMoney(savedVsDeelMonthly)}/month ($${formatMoney(savedVsDeelAnnual)}/year) vs Deel ` +
		`and $${formatMoney(savedVsPayoneerMonthly)}/month ($${formatMoney(savedVsPayoneerAnnual)}/year) vs Payoneer across ${contractorCount} ${contractorLabel}. ` +
		`Deel charges $${formatMoney(deel.platformMonthlyUsd)}/month in SaaS seat fees before FX spread, which only breaks even when you require managed contract compliance or automated tax filing.`
	);
}

export function comparePayoutProviders(
	input: PayoutScenarioInput,
	customMidRate?: number,
): ComparisonSummary {
	const invoiceAmount = Math.max(0, input.invoiceAmount);
	const contractorCount = Math.max(1, Math.floor(input.contractorCount || 1));
	const payoutsPerMonth = Math.max(1, input.payoutsPerMonth || 1);
	const isSameCurrency = input.billingCurrency === input.payoutCurrency;

	const billingPerUsd = REFERENCE_USD_RATES[input.billingCurrency];
	const rawGrossUsd = invoiceAmount / billingPerUsd;

	const feeField = input.marketplaceWithdrawalFeeUsd;
	const marketplaceFeeDisclosure: ComparisonSummary['marketplaceFeeDisclosure'] =
		feeField === undefined
			? 'omitted'
			: feeField === null || !Number.isFinite(feeField)
				? 'not-entered'
				: 'applied';
	const requestedMarketplaceFeeUsd =
		marketplaceFeeDisclosure === 'applied' ? Math.max(0, feeField as number) : 0;
	const marketplaceWithdrawalFeeUsd = Math.min(rawGrossUsd, requestedMarketplaceFeeUsd);
	const principalUsd = Math.max(0, rawGrossUsd - marketplaceWithdrawalFeeUsd);

	const hasCustomMidRate =
		customMidRate !== undefined && Number.isFinite(customMidRate) && customMidRate > 0;
	const rawMidMarketRate = hasCustomMidRate
		? customMidRate
		: isSameCurrency
			? 1
			: REFERENCE_USD_RATES[input.payoutCurrency] / billingPerUsd;

	const targetPerUsd = billingPerUsd * rawMidMarketRate;

	const quotes: ProviderQuote[] = PROVIDER_MODELS.map((model) => {
		const platformMonthlyUsd = round2(model.seatFeePerContractorUsd * contractorCount);
		const proratedSeatPerInvoiceUsd = model.seatFeePerContractorUsd / payoutsPerMonth;

		const rawFundingFeeUsd = model.computeFundingFeeUsd(principalUsd, input.fundingMethod);
		const rawWithdrawalFeeUsd = model.computeWithdrawalFixedFeeUsd(
			principalUsd,
			input.fundingMethod,
			isSameCurrency,
		);
		const fxSpreadPct = isSameCurrency ? 0 : model.crossCurrencySpreadPct;
		const rawFxLossUsd = principalUsd * (fxSpreadPct / 100);

		const unroundedPerInvoiceDragUsd =
			marketplaceWithdrawalFeeUsd +
			proratedSeatPerInvoiceUsd +
			rawFundingFeeUsd +
			rawWithdrawalFeeUsd +
			rawFxLossUsd;
		const totalFeeDragUsd = round2(unroundedPerInvoiceDragUsd);
		const annualFeeDragUsd = round2(
			unroundedPerInvoiceDragUsd * payoutsPerMonth * contractorCount * 12,
		);
		const effectiveFeePct =
			rawGrossUsd > 0 ? round2((unroundedPerInvoiceDragUsd / rawGrossUsd) * 100) : 0;

		const netUsdReachingContractor = computeNetUsdReachingContractor(
			principalUsd,
			rawFundingFeeUsd,
			rawWithdrawalFeeUsd,
			rawFxLossUsd,
			input.feeBearer,
		);
		const rawNetTargetCurrency = Math.max(0, netUsdReachingContractor * targetPerUsd);
		const netReceivedTargetCurrency = round2(rawNetTargetCurrency);
		const effectiveExchangeRate =
			invoiceAmount > 0 && netReceivedTargetCurrency > 0
				? round6(rawNetTargetCurrency / invoiceAmount)
				: 0;

		return {
			providerId: model.providerId,
			providerName: model.providerName,
			platformMonthlyUsd,
			fundingFeeUsd: round2(rawFundingFeeUsd),
			withdrawalFixedFeeUsd: round2(rawWithdrawalFeeUsd),
			fxSpreadPct,
			fxLossUsd: round2(rawFxLossUsd),
			totalFeeDragUsd,
			effectiveFeePct,
			netReceivedTargetCurrency,
			effectiveExchangeRate,
			annualFeeDragUsd,
			notes: model.buildNotes(isSameCurrency, input.fundingMethod),
		};
	});

	quotes.sort((a, b) => a.totalFeeDragUsd - b.totalFeeDragUsd);

	const bestQuote = quotes[0]!;
	const worstQuote = quotes[quotes.length - 1]!;

	return {
		midMarketRate: round6(rawMidMarketRate),
		grossInvoiceUsdEquivalent: round2(rawGrossUsd),
		quotes,
		bestProviderId: bestQuote.providerId,
		worstProviderId: worstQuote.providerId,
		annualSavingsBestVsWorstUsd: round2(worstQuote.annualFeeDragUsd - bestQuote.annualFeeDragUsd),
		deelBreakEvenNote: buildDeelBreakEvenNote(quotes, contractorCount),
		marketplaceWithdrawalFeeUsd: round2(marketplaceWithdrawalFeeUsd),
		marketplaceFeeDisclosure,
	};
}

function parseCsvLine(line: string, lineNumber: number): { ok: true; cells: string[] } | { ok: false; error: string } {
	const cells: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i += 1) {
		const ch = line[i]!;
		if (inQuotes) {
			if (ch === '"') {
				if (line[i + 1] === '"') {
					current += '"';
					i += 1;
				} else {
					inQuotes = false;
				}
			} else {
				current += ch;
			}
		} else if (ch === '"') {
			if (current.trim().length > 0) {
				return { ok: false, error: `Line ${lineNumber} has an unexpected quote inside an unquoted field.` };
			}
			inQuotes = true;
		} else if (ch === ',') {
			cells.push(current.trim());
			current = '';
		} else {
			current += ch;
		}
	}

	if (inQuotes) {
		return { ok: false, error: `Line ${lineNumber} has an unclosed double quote.` };
	}

	cells.push(current.trim());
	return { ok: true, cells };
}

export function auditContractorCsv(
	csvText: string,
): BatchAuditResult | { ok: false; error: string } {
	const normalized = csvText.replace(/^\uFEFF/, '').trim();
	if (!normalized) {
		return { ok: false, error: 'CSV input is empty.' };
	}

	const rawLines = normalized
		.split(/\r?\n/)
		.map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
		.filter((entry) => entry.text.length > 0);

	if (rawLines.length < 2) {
		return {
			ok: false,
			error: 'CSV must include a header row and at least one contractor payout row.',
		};
	}

	const headerParsed = parseCsvLine(rawLines[0]!.text, rawLines[0]!.lineNumber);
	if (!headerParsed.ok) {
		return headerParsed;
	}

	const headerNormalized = headerParsed.cells.map((col) => col.toLowerCase());
	if (headerNormalized.length !== REQUIRED_CSV_COLUMNS.length) {
		return {
			ok: false,
			error:
				'CSV header must contain exactly 5 columns: contractor, amount, billing_currency, payout_currency, current_provider.',
		};
	}

	const columnIndex = new Map<string, number>();
	for (let i = 0; i < headerNormalized.length; i += 1) {
		columnIndex.set(headerNormalized[i]!, i);
	}

	for (const requiredCol of REQUIRED_CSV_COLUMNS) {
		if (!columnIndex.has(requiredCol)) {
			return {
				ok: false,
				error: `Missing required CSV column "${requiredCol}". Expected contractor, amount, billing_currency, payout_currency, current_provider.`,
			};
		}
	}

	const rows: BatchCsvRowResult[] = [];
	for (let rowIdx = 1; rowIdx < rawLines.length; rowIdx += 1) {
		const entry = rawLines[rowIdx]!;
		const parsed = parseCsvLine(entry.text, entry.lineNumber);
		if (!parsed.ok) {
			return parsed;
		}

		if (parsed.cells.length !== REQUIRED_CSV_COLUMNS.length) {
			return {
				ok: false,
				error: `Row ${rowIdx} (line ${entry.lineNumber}) has ${parsed.cells.length} columns instead of 5.`,
			};
		}

		const contractorName = parsed.cells[columnIndex.get('contractor')!] ?? '';
		const rawAmount = parsed.cells[columnIndex.get('amount')!] ?? '';
		const rawBilling = (parsed.cells[columnIndex.get('billing_currency')!] ?? '').toUpperCase();
		const rawPayout = (parsed.cells[columnIndex.get('payout_currency')!] ?? '').toUpperCase();
		const rawProvider = (parsed.cells[columnIndex.get('current_provider')!] ?? '').toLowerCase();

		if (!contractorName) {
			return {
				ok: false,
				error: `Row ${rowIdx} (line ${entry.lineNumber}) is missing a contractor name.`,
			};
		}

		if (!/^\d+(\.\d+)?$/.test(rawAmount)) {
			return {
				ok: false,
				error: `Row ${rowIdx} (${contractorName}) has an invalid invoice amount "${rawAmount}".`,
			};
		}

		const invoiceAmount = Number(rawAmount);
		if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0) {
			return {
				ok: false,
				error: `Row ${rowIdx} (${contractorName}) must have an invoice amount greater than 0.`,
			};
		}

		if (!VALID_BILLING_CURRENCIES.has(rawBilling as BillingCurrency)) {
			return {
				ok: false,
				error: `Row ${rowIdx} (${contractorName}) uses unsupported billing_currency "${rawBilling}". Supported values are USD, EUR, GBP.`,
			};
		}

		if (!VALID_PAYOUT_CURRENCIES.has(rawPayout as PayoutCurrency)) {
			return {
				ok: false,
				error: `Row ${rowIdx} (${contractorName}) uses unsupported payout_currency "${rawPayout}". Supported values are EUR, GBP, INR, PHP, BRL, MXN, CNY, CAD.`,
			};
		}

		if (!VALID_PROVIDERS.has(rawProvider as ProviderId)) {
			return {
				ok: false,
				error: `Row ${rowIdx} (${contractorName}) uses unsupported current_provider "${rawProvider}". Supported values are wise, payoneer, deel, remote, swift-wire.`,
			};
		}

		const billingCurrency = rawBilling as BillingCurrency;
		const payoutCurrency = rawPayout as PayoutCurrency;
		const currentProvider = rawProvider as ProviderId;

		const comparison = comparePayoutProviders({
			invoiceAmount,
			billingCurrency,
			payoutCurrency,
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		});

		const currentQuote = comparison.quotes.find((q) => q.providerId === currentProvider)!;
		const bestQuote = comparison.quotes[0]!;
		const monthlySavedUsd = round2(Math.max(0, currentQuote.totalFeeDragUsd - bestQuote.totalFeeDragUsd));

		rows.push({
			rowNumber: rowIdx,
			contractorName,
			invoiceAmount,
			billingCurrency,
			payoutCurrency,
			currentProvider,
			currentFeeUsd: currentQuote.totalFeeDragUsd,
			bestProvider: bestQuote.providerId,
			bestFeeUsd: bestQuote.totalFeeDragUsd,
			monthlySavedUsd,
		});
	}

	const totalMonthlyCurrentFeeUsd = round2(rows.reduce((sum, r) => sum + r.currentFeeUsd, 0));
	const totalMonthlyOptimalFeeUsd = round2(rows.reduce((sum, r) => sum + r.bestFeeUsd, 0));
	const annualSavingsUsd = round2((totalMonthlyCurrentFeeUsd - totalMonthlyOptimalFeeUsd) * 12);

	return {
		ok: true,
		rows,
		totalMonthlyCurrentFeeUsd,
		totalMonthlyOptimalFeeUsd,
		annualSavingsUsd,
	};
}

function escapeCsvCell(value: string | number): string {
	const text = String(value);
	if (/[",\r\n]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`;
	}
	return text;
}

export function exportComparisonReport(
	input: PayoutScenarioInput,
	summary: ComparisonSummary,
	format: 'csv' | 'md',
): string {
	if (format === 'csv') {
		const header = [
			'provider_id',
			'provider_name',
			'billing_currency',
			'payout_currency',
			'invoice_amount',
			'funding_method',
			'contractor_count',
			'payouts_per_month',
			'fee_bearer',
			'mid_market_rate',
			'platform_monthly_usd',
			'funding_fee_usd',
			'withdrawal_fixed_fee_usd',
			'fx_spread_pct',
			'fx_loss_usd',
			'total_fee_drag_usd',
			'effective_fee_pct',
			'net_received_target_currency',
			'effective_exchange_rate',
			'annual_fee_drag_usd',
			'notes',
			'marketplace_withdrawal_fee_usd',
			'marketplace_fee_status',
		];

		const csvRows = summary.quotes.map((quote) =>
			[
				quote.providerId,
				quote.providerName,
				input.billingCurrency,
				input.payoutCurrency,
				input.invoiceAmount.toFixed(2),
				input.fundingMethod,
				input.contractorCount,
				input.payoutsPerMonth,
				input.feeBearer,
				summary.midMarketRate,
				quote.platformMonthlyUsd.toFixed(2),
				quote.fundingFeeUsd.toFixed(2),
				quote.withdrawalFixedFeeUsd.toFixed(2),
				quote.fxSpreadPct.toFixed(2),
				quote.fxLossUsd.toFixed(2),
				quote.totalFeeDragUsd.toFixed(2),
				quote.effectiveFeePct.toFixed(2),
				quote.netReceivedTargetCurrency.toFixed(2),
				quote.effectiveExchangeRate,
				quote.annualFeeDragUsd.toFixed(2),
				quote.notes,
				summary.marketplaceFeeDisclosure === 'applied'
					? summary.marketplaceWithdrawalFeeUsd.toFixed(2)
					: '',
				summary.marketplaceFeeDisclosure,
			]
				.map(escapeCsvCell)
				.join(','),
		);

		return [header.join(','), ...csvRows].join('\r\n');
	}

	const bestQuote = summary.quotes[0]!;
	const worstQuote = summary.quotes[summary.quotes.length - 1]!;

	const lines: string[] = [
		'# Contractor Payout Routing Memo',
		'',
		'## Scenario Parameters',
		`- Corridor: ${input.billingCurrency} to ${input.payoutCurrency}`,
		`- Invoice Amount: ${formatMoney(input.invoiceAmount)} ${input.billingCurrency} ($${formatMoney(summary.grossInvoiceUsdEquivalent)} USD equivalent)`,
		`- Mid-Market Reference Rate: 1 ${input.billingCurrency} = ${summary.midMarketRate} ${input.payoutCurrency}`,
		`- Funding Rail: ${input.fundingMethod}`,
		`- Team Footprint: ${input.contractorCount} contractor(s), ${input.payoutsPerMonth} payout(s) per month`,
		`- Fee Bearer: ${input.feeBearer}`,
		...(summary.marketplaceFeeDisclosure === 'omitted'
			? []
			: [
					summary.marketplaceFeeDisclosure === 'applied'
						? `- Marketplace withdrawal fee: $${formatMoney(summary.marketplaceWithdrawalFeeUsd)} USD, deducted before provider percentage fees`
						: '- Marketplace withdrawal fee: not entered, so $0.00 was applied. Do not read a blank fee as a published zero charge',
				]),
		'',
		'## Executive Recommendation',
		`- Optimal Provider: ${bestQuote.providerName} ($${formatMoney(bestQuote.totalFeeDragUsd)} per invoice, $${formatMoney(bestQuote.annualFeeDragUsd)}/year)`,
		`- Highest-Cost Provider: ${worstQuote.providerName} ($${formatMoney(worstQuote.totalFeeDragUsd)} per invoice, $${formatMoney(worstQuote.annualFeeDragUsd)}/year)`,
		`- Annual Routing Savings (Best vs Worst): $${formatMoney(summary.annualSavingsBestVsWorstUsd)}/year`,
		`- SaaS Seat vs Direct FX Analysis: ${summary.deelBreakEvenNote}`,
		'',
		'## Provider Fee Comparison',
		'| Provider | Monthly SaaS (USD) | Funding Fee (USD) | Withdrawal Fee (USD) | FX Spread (%) | FX Loss (USD) | Per-Invoice Drag (USD) | Effective Fee (%) | Net Received | Effective Rate | Annual Drag (USD) |',
		'| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
		...summary.quotes.map(
			(q) =>
				`| ${q.providerName} | $${formatMoney(q.platformMonthlyUsd)} | $${formatMoney(q.fundingFeeUsd)} | $${formatMoney(q.withdrawalFixedFeeUsd)} | ${q.fxSpreadPct.toFixed(2)}% | $${formatMoney(q.fxLossUsd)} | $${formatMoney(q.totalFeeDragUsd)} | ${q.effectiveFeePct.toFixed(2)}% | ${formatMoney(q.netReceivedTargetCurrency)} ${input.payoutCurrency} | ${q.effectiveExchangeRate} | $${formatMoney(q.annualFeeDragUsd)} |`,
		),
		'',
	];

	return lines.join('\n');
}

export type BillingCurrency = 'USD' | 'EUR' | 'GBP';

export type PayoutCurrency = 'EUR' | 'GBP' | 'INR' | 'PHP' | 'BRL' | 'MXN' | 'CNY' | 'CAD';

export type FundingMethod = 'ach-bank' | 'wire' | 'card';

export type FeeBearer = 'contractor' | 'client';

export type ProviderId = 'wise' | 'payoneer' | 'deel' | 'remote' | 'swift-wire';

export interface PayoutScenarioInput {
	invoiceAmount: number;
	billingCurrency: BillingCurrency;
	payoutCurrency: PayoutCurrency;
	fundingMethod: FundingMethod;
	contractorCount: number;
	payoutsPerMonth: number;
	feeBearer: FeeBearer;
}

export interface ProviderQuote {
	providerId: ProviderId;
	providerName: string;
	platformMonthlyUsd: number;
	fundingFeeUsd: number;
	withdrawalFixedFeeUsd: number;
	fxSpreadPct: number;
	fxLossUsd: number;
	totalFeeDragUsd: number;
	effectiveFeePct: number;
	netReceivedTargetCurrency: number;
	effectiveExchangeRate: number;
	annualFeeDragUsd: number;
	notes: string;
}

export interface ComparisonSummary {
	midMarketRate: number;
	grossInvoiceUsdEquivalent: number;
	quotes: ProviderQuote[];
	bestProviderId: ProviderId;
	worstProviderId: ProviderId;
	annualSavingsBestVsWorstUsd: number;
	deelBreakEvenNote: string;
}

export interface BatchCsvRowResult {
	rowNumber: number;
	contractorName: string;
	invoiceAmount: number;
	billingCurrency: BillingCurrency;
	payoutCurrency: PayoutCurrency;
	currentProvider: ProviderId;
	currentFeeUsd: number;
	bestProvider: ProviderId;
	bestFeeUsd: number;
	monthlySavedUsd: number;
}

export interface BatchAuditResult {
	ok: true;
	rows: BatchCsvRowResult[];
	totalMonthlyCurrentFeeUsd: number;
	totalMonthlyOptimalFeeUsd: number;
	annualSavingsUsd: number;
}

export interface RouteFaqItem {
	question: string;
	answer: string;
}

export interface FxRoutePreset {
	slug: string;
	path: string;
	navLabel: string;
	h1: string;
	seoTitle: string;
	metaDescription: string;
	primaryKeyword: string;
	heroSummary: string;
	defaultInput: PayoutScenarioInput;
	mode: 'calculator' | 'csv-batch';
	methodologyNotes: string[];
	faqs: RouteFaqItem[];
}

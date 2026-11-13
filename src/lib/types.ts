export type BillingCurrency = 'USD' | 'EUR' | 'GBP';

export type PayoutCurrency = 'EUR' | 'GBP' | 'INR' | 'PHP' | 'BRL' | 'MXN' | 'CNY' | 'CAD';

export type FundingMethod = 'ach-bank' | 'wire' | 'card' | 'received-balance';

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
	/**
	 * Marketplace cash-out fee in USD, deducted before provider percentage fees.
	 * Omit on pages that do not ask for it. `null` means the control is visible
	 * and the reader has not entered a figure (do not treat that as a published $0).
	 */
	marketplaceWithdrawalFeeUsd?: number | null;
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

export type MarketplaceFeeDisclosure = 'omitted' | 'not-entered' | 'applied';

export interface ComparisonSummary {
	midMarketRate: number;
	grossInvoiceUsdEquivalent: number;
	quotes: ProviderQuote[];
	bestProviderId: ProviderId;
	worstProviderId: ProviderId;
	annualSavingsBestVsWorstUsd: number;
	deelBreakEvenNote: string;
	marketplaceWithdrawalFeeUsd: number;
	marketplaceFeeDisclosure: MarketplaceFeeDisclosure;
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

export interface FeeSourceCitation {
	publisher: string;
	pageTitle: string;
	url: string;
	verifiedOn: string;
	finding: string;
}

export interface WorkedExampleBlock {
	heading: string;
	formula: string;
	steps: string[];
}

export interface RelatedCalculatorLink {
	href: string;
	label: string;
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
	feeSources?: FeeSourceCitation[];
	workedExample?: WorkedExampleBlock;
	auditCallout?: string;
	relatedLinks?: RelatedCalculatorLink[];
	marketplacePresetIds?: string[];
	defaultMarketplacePresetId?: string;
}

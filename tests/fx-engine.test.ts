import { describe, expect, it } from 'vitest';
import {
	REFERENCE_USD_RATES,
	auditContractorCsv,
	comparePayoutProviders,
	exportComparisonReport,
} from '../src/lib/fx-engine';
import { SAMPLE_TEAM_CSV } from '../src/lib/sample-csv';
import type { PayoutScenarioInput } from '../src/lib/types';

const BASE_USD_INR_INPUT: PayoutScenarioInput = {
	invoiceAmount: 4000,
	billingCurrency: 'USD',
	payoutCurrency: 'INR',
	fundingMethod: 'ach-bank',
	contractorCount: 1,
	payoutsPerMonth: 1,
	feeBearer: 'contractor',
};

describe('fx-engine', () => {
	it('exports realistic USD mid-market reference rates for all supported currencies', () => {
		expect(REFERENCE_USD_RATES.USD).toBe(1);
		expect(REFERENCE_USD_RATES.EUR).toBeCloseTo(0.92, 2);
		expect(REFERENCE_USD_RATES.GBP).toBeCloseTo(0.79, 2);
		expect(REFERENCE_USD_RATES.CAD).toBeCloseTo(1.39, 2);
		expect(REFERENCE_USD_RATES.CNY).toBeCloseTo(7.24, 2);
		expect(REFERENCE_USD_RATES.INR).toBeCloseTo(84.4, 1);
		expect(REFERENCE_USD_RATES.PHP).toBeCloseTo(58.6, 1);
		expect(REFERENCE_USD_RATES.BRL).toBeCloseTo(5.78, 2);
		expect(REFERENCE_USD_RATES.MXN).toBeCloseTo(20.15, 2);
	});

	it('sorts all 5 provider quotes ascending by totalFeeDragUsd with Wise cheapest on standard cross-currency ACH', () => {
		const summary = comparePayoutProviders(BASE_USD_INR_INPUT);

		expect(summary.quotes).toHaveLength(5);
		for (let i = 1; i < summary.quotes.length; i += 1) {
			expect(summary.quotes[i]!.totalFeeDragUsd).toBeGreaterThanOrEqual(
				summary.quotes[i - 1]!.totalFeeDragUsd,
			);
		}

		expect(summary.bestProviderId).toBe('wise');
		expect(summary.worstProviderId).toBe(summary.quotes[4]!.providerId);
		expect(summary.annualSavingsBestVsWorstUsd).toBeCloseTo(
			summary.quotes[4]!.annualFeeDragUsd - summary.quotes[0]!.annualFeeDragUsd,
			2,
		);
	});

	it('computes exact Wise, Payoneer, Deel, Remote, and SWIFT fee components on cross-currency ACH', () => {
		const summary = comparePayoutProviders({
			...BASE_USD_INR_INPUT,
			invoiceAmount: 1000,
		});

		const byId = Object.fromEntries(summary.quotes.map((q) => [q.providerId, q]));

		expect(byId.wise!.fundingFeeUsd).toBe(4.65);
		expect(byId.wise!.fxSpreadPct).toBe(0.48);
		expect(byId.wise!.fxLossUsd).toBe(4.8);
		expect(byId.wise!.totalFeeDragUsd).toBe(9.45);

		expect(byId.payoneer!.fundingFeeUsd).toBe(10);
		expect(byId.payoneer!.fxSpreadPct).toBe(2.25);
		expect(byId.payoneer!.fxLossUsd).toBe(22.5);
		expect(byId.payoneer!.totalFeeDragUsd).toBe(32.5);

		expect(byId.deel!.platformMonthlyUsd).toBe(49);
		expect(byId.deel!.withdrawalFixedFeeUsd).toBe(0);
		expect(byId.deel!.fxSpreadPct).toBe(1.5);
		expect(byId.deel!.fxLossUsd).toBe(15);
		expect(byId.deel!.totalFeeDragUsd).toBe(64);

		expect(byId.remote!.platformMonthlyUsd).toBe(29);
		expect(byId.remote!.fxSpreadPct).toBe(1.25);
		expect(byId.remote!.fxLossUsd).toBe(12.5);
		expect(byId.remote!.totalFeeDragUsd).toBe(41.5);

		expect(byId['swift-wire']!.fundingFeeUsd).toBe(35);
		expect(byId['swift-wire']!.withdrawalFixedFeeUsd).toBe(15);
		expect(byId['swift-wire']!.fxSpreadPct).toBe(2.6);
		expect(byId['swift-wire']!.fxLossUsd).toBe(26);
		expect(byId['swift-wire']!.totalFeeDragUsd).toBe(76);
	});

	it('applies wire and card funding rail tariffs including Deel $5 non-local rail fee', () => {
		const wireSummary = comparePayoutProviders({
			...BASE_USD_INR_INPUT,
			invoiceAmount: 2000,
			fundingMethod: 'wire',
		});
		const wireById = Object.fromEntries(wireSummary.quotes.map((q) => [q.providerId, q]));

		expect(wireById.wise!.fundingFeeUsd).toBe(14.71);
		expect(wireById.payoneer!.fundingFeeUsd).toBe(15);
		expect(wireById.deel!.withdrawalFixedFeeUsd).toBe(5);

		const cardSummary = comparePayoutProviders({
			...BASE_USD_INR_INPUT,
			invoiceAmount: 2000,
			fundingMethod: 'card',
		});
		const cardById = Object.fromEntries(cardSummary.quotes.map((q) => [q.providerId, q]));

		expect(cardById.wise!.fundingFeeUsd).toBe(58.3);
		expect(cardById.payoneer!.fundingFeeUsd).toBe(60);
		expect(cardById.remote!.fundingFeeUsd).toBe(70);
		expect(cardById.deel!.fundingFeeUsd).toBe(70);
		expect(cardById.deel!.withdrawalFixedFeeUsd).toBe(5);
	});

	it('zeros FX spread on same-currency corridors while preserving Payoneer same-currency withdrawal fee', () => {
		const sameCurrency = comparePayoutProviders({
			invoiceAmount: 3000,
			billingCurrency: 'EUR',
			payoutCurrency: 'EUR',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		});

		expect(sameCurrency.midMarketRate).toBe(1);
		for (const quote of sameCurrency.quotes) {
			expect(quote.fxSpreadPct).toBe(0);
			expect(quote.fxLossUsd).toBe(0);
		}

		const payoneer = sameCurrency.quotes.find((q) => q.providerId === 'payoneer')!;
		expect(payoneer.withdrawalFixedFeeUsd).toBeGreaterThan(1.5);

		const tinySameCurrency = comparePayoutProviders({
			invoiceAmount: 20,
			billingCurrency: 'GBP',
			payoutCurrency: 'GBP',
			fundingMethod: 'ach-bank',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		});
		const tinyPayoneer = tinySameCurrency.quotes.find((q) => q.providerId === 'payoneer')!;
		expect(tinyPayoneer.withdrawalFixedFeeUsd).toBe(1.5);
	});

	it('overrides mid-market exchange rate cleanly via customMidRate parameter', () => {
		const defaultSummary = comparePayoutProviders(BASE_USD_INR_INPUT);
		const customSummary = comparePayoutProviders(BASE_USD_INR_INPUT, 90.0);

		expect(defaultSummary.midMarketRate).toBe(84.4);
		expect(customSummary.midMarketRate).toBe(90);

		const wiseDefault = defaultSummary.quotes.find((q) => q.providerId === 'wise')!;
		const wiseCustom = customSummary.quotes.find((q) => q.providerId === 'wise')!;
		expect(wiseCustom.netReceivedTargetCurrency).toBeGreaterThan(
			wiseDefault.netReceivedTargetCurrency,
		);
		expect(wiseCustom.effectiveExchangeRate).toBeGreaterThan(wiseDefault.effectiveExchangeRate);
	});

	it('prorates Deel and Remote monthly SaaS seat fees across payoutsPerMonth and scales annually by contractorCount', () => {
		const summary = comparePayoutProviders({
			invoiceAmount: 2000,
			billingCurrency: 'USD',
			payoutCurrency: 'PHP',
			fundingMethod: 'ach-bank',
			contractorCount: 5,
			payoutsPerMonth: 2,
			feeBearer: 'contractor',
		});

		const deel = summary.quotes.find((q) => q.providerId === 'deel')!;
		const remote = summary.quotes.find((q) => q.providerId === 'remote')!;

		expect(deel.platformMonthlyUsd).toBe(245);
		expect(deel.totalFeeDragUsd).toBe(54.5);
		expect(deel.annualFeeDragUsd).toBe(6540);

		expect(remote.platformMonthlyUsd).toBe(145);
		expect(remote.totalFeeDragUsd).toBe(39.5);
		expect(remote.annualFeeDragUsd).toBe(4740);
	});

	it('preserves exact annual SaaS seat totals even when payoutsPerMonth divides unevenly', () => {
		const summary = comparePayoutProviders({
			invoiceAmount: 1000,
			billingCurrency: 'EUR',
			payoutCurrency: 'EUR',
			fundingMethod: 'ach-bank',
			contractorCount: 2,
			payoutsPerMonth: 3,
			feeBearer: 'client',
		});

		const deel = summary.quotes.find((q) => q.providerId === 'deel')!;
		expect(deel.annualFeeDragUsd).toBe(1176);
	});

	it('clamps netReceivedTargetCurrency and effectiveExchangeRate to 0 on tiny $10 invoices when fixed fees exceed principal', () => {
		const tinySummary = comparePayoutProviders({
			invoiceAmount: 10,
			billingCurrency: 'USD',
			payoutCurrency: 'INR',
			fundingMethod: 'wire',
			contractorCount: 1,
			payoutsPerMonth: 1,
			feeBearer: 'contractor',
		});

		const swift = tinySummary.quotes.find((q) => q.providerId === 'swift-wire')!;
		const payoneer = tinySummary.quotes.find((q) => q.providerId === 'payoneer')!;
		const wise = tinySummary.quotes.find((q) => q.providerId === 'wise')!;

		expect(swift.netReceivedTargetCurrency).toBe(0);
		expect(swift.effectiveExchangeRate).toBe(0);
		expect(payoneer.netReceivedTargetCurrency).toBe(0);
		expect(wise.netReceivedTargetCurrency).toBeGreaterThan(0);
	});

	it('shifts funding fee burden between contractor and client via feeBearer', () => {
		const contractorBears = comparePayoutProviders({
			...BASE_USD_INR_INPUT,
			feeBearer: 'contractor',
		});
		const clientBears = comparePayoutProviders({
			...BASE_USD_INR_INPUT,
			feeBearer: 'client',
		});

		const wiseContractor = contractorBears.quotes.find((q) => q.providerId === 'wise')!;
		const wiseClient = clientBears.quotes.find((q) => q.providerId === 'wise')!;

		expect(wiseClient.netReceivedTargetCurrency).toBeGreaterThan(
			wiseContractor.netReceivedTargetCurrency,
		);
		expect(wiseClient.totalFeeDragUsd).toBe(wiseContractor.totalFeeDragUsd);
	});

	it('generates a crisp deelBreakEvenNote with monthly Wise savings vs Deel and Payoneer and zero long dashes', () => {
		const summary = comparePayoutProviders({
			...BASE_USD_INR_INPUT,
			contractorCount: 4,
		});

		expect(summary.deelBreakEvenNote).toContain('Wise');
		expect(summary.deelBreakEvenNote).toContain('Deel');
		expect(summary.deelBreakEvenNote).toContain('Payoneer');
		expect(summary.deelBreakEvenNote).toContain('4 contractors');
		expect(summary.deelBreakEvenNote).not.toMatch(/[\u2013\u2014]/);
	});

	it('audits SAMPLE_TEAM_CSV across all 6 global corridors and computes accurate monthly and annual savings', () => {
		const result = auditContractorCsv(SAMPLE_TEAM_CSV);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.rows).toHaveLength(6);
		const corridors = result.rows.map((r) => r.payoutCurrency);
		expect(corridors).toEqual(['INR', 'PHP', 'BRL', 'EUR', 'CNY', 'MXN']);

		for (const row of result.rows) {
			expect(row.bestProvider).toBe('wise');
			expect(row.currentFeeUsd).toBeGreaterThan(row.bestFeeUsd);
			expect(row.monthlySavedUsd).toBeCloseTo(row.currentFeeUsd - row.bestFeeUsd, 2);
		}

		const expectedCurrent = result.rows.reduce((sum, r) => sum + r.currentFeeUsd, 0);
		const expectedOptimal = result.rows.reduce((sum, r) => sum + r.bestFeeUsd, 0);
		expect(result.totalMonthlyCurrentFeeUsd).toBeCloseTo(expectedCurrent, 2);
		expect(result.totalMonthlyOptimalFeeUsd).toBeCloseTo(expectedOptimal, 2);
		expect(result.annualSavingsUsd).toBeCloseTo((expectedCurrent - expectedOptimal) * 12, 2);
	});

	it('supports quoted contractor names with commas and case-insensitive currency/provider tokens in CSV', () => {
		const quotedCsv = [
			'contractor,amount,billing_currency,payout_currency,current_provider',
			'"Gomez, Sofia ""La Jefa""",3500,usd,mxn,Payoneer',
			'Liam Connor,2500,gbp,eur,DEEL',
		].join('\r\n');

		const result = auditContractorCsv(quotedCsv);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.rows[0]!.contractorName).toBe('Gomez, Sofia "La Jefa"');
		expect(result.rows[0]!.billingCurrency).toBe('USD');
		expect(result.rows[0]!.payoutCurrency).toBe('MXN');
		expect(result.rows[0]!.currentProvider).toBe('payoneer');
		expect(result.rows[1]!.billingCurrency).toBe('GBP');
		expect(result.rows[1]!.currentProvider).toBe('deel');
	});

	it('returns structured errors for empty, missing-header, bad-amount, and unsupported-enum CSV inputs', () => {
		expect(auditContractorCsv('   ')).toEqual({
			ok: false,
			error: expect.stringContaining('empty'),
		});

		expect(auditContractorCsv('contractor,amount,billing_currency,payout_currency,current_provider')).toEqual({
			ok: false,
			error: expect.stringContaining('at least one contractor'),
		});

		expect(auditContractorCsv('name,amount,from,to,provider\nAlice,1000,USD,INR,wise')).toEqual({
			ok: false,
			error: expect.stringContaining('Missing required CSV column'),
		});

		expect(
			auditContractorCsv(
				'contractor,amount,billing_currency,payout_currency,current_provider\nAlice,-500,USD,INR,wise',
			),
		).toEqual({
			ok: false,
			error: expect.stringContaining('invalid invoice amount'),
		});

		expect(
			auditContractorCsv(
				'contractor,amount,billing_currency,payout_currency,current_provider\nAlice,1500,JPY,INR,wise',
			),
		).toEqual({
			ok: false,
			error: expect.stringContaining('unsupported billing_currency'),
		});

		expect(
			auditContractorCsv(
				'contractor,amount,billing_currency,payout_currency,current_provider\nAlice,1500,USD,INR,paypal',
			),
		).toEqual({
			ok: false,
			error: expect.stringContaining('unsupported current_provider'),
		});

		expect(
			auditContractorCsv(
				'contractor,amount,billing_currency,payout_currency,current_provider\n"Alice,1500,USD,INR,wise',
			),
		).toEqual({
			ok: false,
			error: expect.stringContaining('unclosed double quote'),
		});
	});

	it('exports clean RFC 4180 CSV with CRLF line endings and properly quoted notes', () => {
		const summary = comparePayoutProviders(BASE_USD_INR_INPUT);
		const csv = exportComparisonReport(BASE_USD_INR_INPUT, summary, 'csv');

		expect(csv).toContain('\r\n');
		expect(csv).not.toMatch(/[\u2013\u2014]/);

		const lines = csv.split('\r\n');
		expect(lines).toHaveLength(6);
		expect(lines[0]).toContain('provider_id,provider_name,billing_currency,payout_currency');
		expect(lines[1]).toMatch(/^wise,Wise Business,USD,INR,4000\.00/);
	});

	it('exports a CFO-ready Markdown routing memo containing scenario summary, winner, table, and zero long dashes', () => {
		const input: PayoutScenarioInput = {
			...BASE_USD_INR_INPUT,
			contractorCount: 8,
		};
		const summary = comparePayoutProviders(input);
		const markdown = exportComparisonReport(input, summary, 'md');

		expect(markdown).toContain('# Contractor Payout Routing Memo');
		expect(markdown).toContain('Wise Business');
		expect(markdown).toContain('8 contractor(s)');
		expect(markdown).toContain('| Provider | Monthly SaaS (USD) |');
		expect(markdown).not.toMatch(/[\u2013\u2014]/);
	});
});

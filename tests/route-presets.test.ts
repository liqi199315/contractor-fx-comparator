import { describe, expect, it } from 'vitest';
import {
	FEE_SOURCE_VERIFIED_ON,
	MARKETPLACE_WITHDRAWAL_PRESETS,
	ROUTE_PRESETS,
} from '../src/lib/route-presets';

const NEW_PATHS = [
	'/fx-markup-calculator/',
	'/payoneer-fees-calculator-india/',
	'/wise-vs-payoneer-philippines/',
	'/fiverr-payoneer-withdrawal-fee/',
	'/upwork-withdrawal-fee-payoneer/',
] as const;

describe('long-tail route presets', () => {
	it('keeps titles, descriptions, and paths unique', () => {
		const titles = ROUTE_PRESETS.map((preset) => preset.seoTitle);
		const descriptions = ROUTE_PRESETS.map((preset) => preset.metaDescription);
		const paths = ROUTE_PRESETS.map((preset) => preset.path);
		expect(new Set(titles).size).toBe(titles.length);
		expect(new Set(descriptions).size).toBe(descriptions.length);
		expect(new Set(paths).size).toBe(paths.length);
	});

	it('publishes fee sources and a worked example on every new page without inventing unpublished marketplace dollars', () => {
		for (const path of NEW_PATHS) {
			const preset = ROUTE_PRESETS.find((item) => item.path === path);
			expect(preset, path).toBeDefined();
			expect(preset!.feeSources?.length).toBeGreaterThan(0);
			expect(preset!.workedExample?.formula.length).toBeGreaterThan(0);
			for (const source of preset!.feeSources ?? []) {
				expect(source.verifiedOn).toBe(FEE_SOURCE_VERIFIED_ON);
				expect(source.url.startsWith('https://') || source.url.startsWith('/')).toBe(true);
				expect(source.finding.length).toBeGreaterThan(40);
			}
			const blob = JSON.stringify(preset);
			expect(blob).not.toMatch(/[\u2013\u2014]/);
		}
	});

	it('fills only marketplace fees that official help pages agree on', () => {
		const byId = Object.fromEntries(MARKETPLACE_WITHDRAWAL_PRESETS.map((item) => [item.id, item]));
		expect(byId['fiverr-payoneer-account']!.fixedFeeUsd).toBe(3);
		expect(byId['fiverr-payoneer-usd-wire']!.fixedFeeUsd).toBe(1);
		expect(byId['fiverr-local-currency-conflict']!.fixedFeeUsd).toBeNull();
		expect(byId['upwork-payoneer-unpublished']!.fixedFeeUsd).toBeNull();
		expect(byId['upwork-local-bank']!.fixedFeeUsd).toBe(0.99);

		const fiverr = ROUTE_PRESETS.find((item) => item.path === '/fiverr-payoneer-withdrawal-fee/')!;
		const upwork = ROUTE_PRESETS.find((item) => item.path === '/upwork-withdrawal-fee-payoneer/')!;
		expect(fiverr.defaultInput.marketplaceWithdrawalFeeUsd).toBe(3);
		expect(upwork.defaultInput.marketplaceWithdrawalFeeUsd).toBeNull();
		expect(fiverr.defaultMarketplacePresetId).toBe('fiverr-payoneer-account');
		expect(upwork.defaultMarketplacePresetId).toBe('upwork-payoneer-unpublished');
	});
});

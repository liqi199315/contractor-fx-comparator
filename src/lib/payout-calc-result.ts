import { trackToolEvent } from './analytics';
import type { ComparisonSummary, PayoutScenarioInput } from './types';

export const PAYOUT_CALC_RESULT_EVENT = 'payout_calc_result';

export type PayoutCalcResultParams = {
	route_count: number;
	payout: string;
};

/**
 * A comparison is a result only when the invoice amount is a positive finite
 * number and the engine returned at least one provider quote. Zero, blank,
 * and non-numeric amounts are not results.
 */
export function isSuccessfulComparisonResult(
	input: Pick<PayoutScenarioInput, 'invoiceAmount'>,
	summary: Pick<ComparisonSummary, 'quotes'>,
): boolean {
	return (
		Number.isFinite(input.invoiceAmount) &&
		input.invoiceAmount > 0 &&
		summary.quotes.length > 0
	);
}

export function payoutCalcResultParams(
	input: Pick<PayoutScenarioInput, 'payoutCurrency'>,
	summary: Pick<ComparisonSummary, 'quotes'>,
): PayoutCalcResultParams {
	return {
		route_count: summary.quotes.length,
		payout: input.payoutCurrency,
	};
}

/**
 * Sends `payout_calc_result` at most once for this page load. Later successful
 * comparisons, and any comparison that is not a result, do not send it again.
 * Returns whether this call sent the event.
 */
export function trackPayoutCalcResultOnce(
	alreadySent: boolean,
	input: Pick<PayoutScenarioInput, 'invoiceAmount' | 'payoutCurrency'>,
	summary: Pick<ComparisonSummary, 'quotes'>,
): boolean {
	if (alreadySent || !isSuccessfulComparisonResult(input, summary)) {
		return alreadySent;
	}
	trackToolEvent(PAYOUT_CALC_RESULT_EVENT, payoutCalcResultParams(input, summary));
	return true;
}

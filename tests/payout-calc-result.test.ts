import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackToolEvent } from '../src/lib/analytics';
import {
	PAYOUT_CALC_RESULT_EVENT,
	trackPayoutCalcResultOnce,
} from '../src/lib/payout-calc-result';
import type { ComparisonSummary, PayoutScenarioInput } from '../src/lib/types';

vi.mock('../src/lib/analytics', () => ({
	trackToolEvent: vi.fn(),
}));

const trackToolEventMock = vi.mocked(trackToolEvent);

function input(
	override: Partial<Pick<PayoutScenarioInput, 'invoiceAmount' | 'payoutCurrency'>> = {},
): Pick<PayoutScenarioInput, 'invoiceAmount' | 'payoutCurrency'> {
	return {
		invoiceAmount: 3500,
		payoutCurrency: 'PHP',
		...override,
	};
}

function summary(routeCount = 5): Pick<ComparisonSummary, 'quotes'> {
	return {
		quotes: Array.from({ length: routeCount }, () => ({}) as ComparisonSummary['quotes'][number]),
	};
}

describe('payout_calc_result', () => {
	afterEach(() => {
		trackToolEventMock.mockClear();
	});

	it.each([0, Number.NaN, Number.POSITIVE_INFINITY, -20])(
		'does not send an event for invoice amount %s',
		(invoiceAmount) => {
			expect(trackPayoutCalcResultOnce(false, true, input({ invoiceAmount }), summary())).toBe(
				false,
			);
			expect(trackToolEventMock).not.toHaveBeenCalled();
		},
	);

	it('does not send an event when there are no provider quotes', () => {
		expect(trackPayoutCalcResultOnce(false, true, input(), summary(0))).toBe(false);
		expect(trackToolEventMock).not.toHaveBeenCalled();
	});

	it('does not send the prefilled page-load comparison before the user interacts', () => {
		const pageLoad = trackPayoutCalcResultOnce(false, false, input(), summary(5));
		expect(pageLoad).toBe(false);
		expect(trackToolEventMock).not.toHaveBeenCalled();
	});

	it('sends payout_calc_result once after a user interaction, then ignores later successes', () => {
		const pageLoad = trackPayoutCalcResultOnce(false, false, input(), summary(5));
		const first = trackPayoutCalcResultOnce(pageLoad, true, input(), summary(5));
		const second = trackPayoutCalcResultOnce(
			first,
			true,
			input({ payoutCurrency: 'INR' }),
			summary(5),
		);
		const third = trackPayoutCalcResultOnce(
			second,
			true,
			input({ payoutCurrency: 'EUR' }),
			summary(4),
		);

		expect(first).toBe(true);
		expect(second).toBe(true);
		expect(third).toBe(true);
		expect(trackToolEventMock).toHaveBeenCalledTimes(1);
		expect(trackToolEventMock).toHaveBeenCalledWith(PAYOUT_CALC_RESULT_EVENT, {
			route_count: 5,
			payout: 'PHP',
		});
	});

	it('does not send an invalid user comparison, and still sends the later valid one once', () => {
		const blocked = trackPayoutCalcResultOnce(
			false,
			true,
			input({ invoiceAmount: 0 }),
			summary(),
		);
		expect(blocked).toBe(false);
		expect(trackToolEventMock).not.toHaveBeenCalled();

		const sent = trackPayoutCalcResultOnce(
			blocked,
			true,
			input({ payoutCurrency: 'MXN' }),
			summary(5),
		);
		expect(sent).toBe(true);
		expect(trackToolEventMock).toHaveBeenCalledTimes(1);
		expect(trackToolEventMock).toHaveBeenCalledWith(PAYOUT_CALC_RESULT_EVENT, {
			route_count: 5,
			payout: 'MXN',
		});
	});

	it('does not put the invoice amount or any other user text in the event params', () => {
		trackPayoutCalcResultOnce(false, true, input({ invoiceAmount: 12345.67 }), summary(3));
		const params = trackToolEventMock.mock.calls[0]?.[1] ?? {};
		expect(params).toEqual({ route_count: 3, payout: 'PHP' });
		expect(JSON.stringify(params)).not.toContain('12345.67');
	});
});

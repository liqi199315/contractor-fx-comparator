export type AnalyticsEventParams = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
	gtag?: (command: 'event', name: string, params?: AnalyticsEventParams) => void;
};

const BLOCKED_PARAM_KEY =
	/^(?:contractor_?name|employee_?name|recipient_?name|full_?name|name|email|csv|csv_?raw|csv_?rows?|csv_?text|raw_?csv|roster|salary|exact_?salary|invoice_?amount|exact_?amount|bank_?account|iban|swift_?code)$/i;

const SUSPICIOUS_VALUE = /[\r\n]|@|:\/\/|(?:token|password|secret|salary|iban)\s*=/i;

function sanitizeParams(params: AnalyticsEventParams): AnalyticsEventParams {
	const safe: AnalyticsEventParams = {};
	for (const [rawKey, rawValue] of Object.entries(params)) {
		const key = rawKey.trim();
		if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key) || BLOCKED_PARAM_KEY.test(key)) {
			continue;
		}
		if (typeof rawValue === 'boolean') {
			safe[key] = rawValue;
			continue;
		}
		if (typeof rawValue === 'number') {
			if (Number.isFinite(rawValue)) {
				safe[key] = rawValue;
			}
			continue;
		}
		if (typeof rawValue === 'string') {
			const trimmed = rawValue.trim();
			if (!trimmed || SUSPICIOUS_VALUE.test(trimmed) || trimmed.split(',').length >= 4) {
				continue;
			}
			safe[key] = trimmed.slice(0, 100);
		}
	}
	return safe;
}

export function trackToolEvent(
	eventName: string,
	params?: Record<string, string | number | boolean>,
): void {
	if (typeof window === 'undefined') {
		return;
	}
	const cleanName = eventName.trim();
	if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(cleanName)) {
		return;
	}
	const win = window as AnalyticsWindow;
	if (typeof win.gtag !== 'function') {
		return;
	}
	if (params === undefined) {
		win.gtag('event', cleanName);
		return;
	}
	win.gtag('event', cleanName, sanitizeParams(params));
}

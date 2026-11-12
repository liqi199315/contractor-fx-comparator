import { expect, test } from '@playwright/test';

test.describe('Contractor FX Comparator journeys', () => {
	test('loads home route with wise winner and dynamically updates calculations', async ({ page }) => {
		await page.goto('/');

		const winnerBanner = page.getByTestId('winner-banner');
		await expect(winnerBanner).toHaveAttribute('data-winner', 'wise');

		const table = page.getByTestId('provider-comparison-table');
		await expect(table).toBeVisible();

		const bodyRows = table.locator('tbody tr');
		if ((await bodyRows.count()) > 0) {
			await expect(bodyRows).toHaveCount(5);
		} else {
			await expect(table.locator('tr:not(:first-child)')).toHaveCount(5);
		}

		const initialText = await winnerBanner.innerText();

		const invoiceAmountInput = page.getByTestId('invoice-amount-input');
		const contractorCountInput = page.getByTestId('contractor-count-input');

		await invoiceAmountInput.fill('10000');
		await contractorCountInput.fill('5');

		await expect(winnerBanner).toHaveAttribute('data-winner', 'wise');
		await expect(winnerBanner).not.toHaveText(initialText);
	});

	test('loads deel vs wise route with 8 contractors and downloads markdown routing memo', async ({
		page,
	}) => {
		await page.goto('/deel-vs-wise-contractor-payouts/');

		const contractorCountInput = page.getByTestId('contractor-count-input');
		await expect(contractorCountInput).toHaveValue('8');

		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('download-memo-md-btn').click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toMatch(/\.md$/i);
		const stream = await download.createReadStream();
		expect(stream).not.toBeNull();

		const chunks: Buffer[] = [];
		for await (const chunk of stream!) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}
		const downloadedMd = Buffer.concat(chunks).toString('utf8');
		expect(downloadedMd.trim().length).toBeGreaterThan(0);
		expect(downloadedMd).toMatch(/wise|contractor|payout|memo|comparison/i);
	});

	test('audits batch contractor CSV with zero external network requests', async ({ page }) => {
		const externalRequests: string[] = [];
		page.on('request', (req) => {
			const url = req.url();
			if (!url.startsWith('http://127.0.0.1') && !url.startsWith('http://localhost') && !url.startsWith('data:')) {
				externalRequests.push(url);
			}
		});

		await page.goto('/batch-contractor-payout-csv-audit/');

		const statusBanner = page.getByTestId('csv-status-banner');
		await expect(statusBanner).toHaveAttribute('data-status', 'ok');

		const summary = page.getByTestId('csv-audit-summary');
		await expect(summary).toBeVisible();
		const initialSummaryText = await summary.innerText();
		expect(initialSummaryText.trim().length).toBeGreaterThan(0);

		const testCsv = `contractor,amount,billing_currency,payout_currency,current_provider
Elena Rostova,8500,USD,EUR,payoneer
Carlos Silva,6200,USD,BRL,deel
Aarav Patel,4500,USD,INR,swift-wire
Mateo Gomez,3800,USD,MXN,remote
Kavita Sharma,5100,USD,INR,payoneer`;
		const buffer = Buffer.from(testCsv, 'utf8');

		await page.getByTestId('csv-file-upload').setInputFiles({
			name: 'custom-team-roster.csv',
			mimeType: 'text/csv',
			buffer,
		});

		await expect(statusBanner).toHaveAttribute('data-status', 'ok');
		await expect(summary).toBeVisible();
		const updatedSummaryText = await summary.innerText();
		expect(updatedSummaryText.trim().length).toBeGreaterThan(0);

		expect(externalRequests).toHaveLength(0);
	});

	test('surfaces error on invalid CSV and recovers on sample load', async ({ page }) => {
		await page.goto('/batch-contractor-payout-csv-audit/');

		const csvInput = page.getByTestId('csv-input');
		const statusBanner = page.getByTestId('csv-status-banner');
		await expect(statusBanner).toHaveAttribute('data-status', 'ok');

		await csvInput.fill('invalid,csv,data\nnot,enough,columns');
		await expect(statusBanner).toHaveAttribute('data-status', 'error');

		await page.getByTestId('load-sample-csv-btn').click();
		await expect(statusBanner).toHaveAttribute('data-status', 'ok');
	});

	test('records GA4 config and payout_calc_export in window.dataLayer with zero external network requests', async ({
		page,
	}) => {
		const externalRequests: string[] = [];
		page.on('request', (req) => {
			const url = req.url();
			if (
				!url.startsWith('http://127.0.0.1') &&
				!url.startsWith('http://localhost') &&
				!url.startsWith('blob:') &&
				!url.startsWith('data:')
			) {
				externalRequests.push(url);
			}
		});

		await page.goto('/deel-vs-wise-contractor-payouts/');

		const downloadPromise = page.waitForEvent('download');
		await page.getByTestId('download-memo-md-btn').click();
		await downloadPromise;

		const dataLayerSnapshot = await page.evaluate(() => {
			const raw = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
			if (!Array.isArray(raw)) {
				return [];
			}
			return raw.map((item) => {
				if (Array.isArray(item)) {
					return item;
				}
				if (item && typeof item === 'object' && Symbol.iterator in item) {
					return Array.from(item as Iterable<unknown>);
				}
				return item;
			});
		});

		expect(dataLayerSnapshot.length).toBeGreaterThan(0);

		const hasConfig = dataLayerSnapshot.some((entry) =>
			Array.isArray(entry)
				? entry[0] === 'config'
				: Boolean(
						entry &&
							typeof entry === 'object' &&
							((entry as Record<string, unknown>).event === 'config' ||
								(entry as Record<string, unknown>).command === 'config'),
					),
		);
		const hasExportEvent = dataLayerSnapshot.some((entry) =>
			Array.isArray(entry)
				? (entry[0] === 'event' && entry[1] === 'payout_calc_export') ||
					entry.includes('payout_calc_export')
				: Boolean(
						entry &&
							typeof entry === 'object' &&
							((entry as Record<string, unknown>).event === 'payout_calc_export' ||
								(entry as Record<string, unknown>).action === 'payout_calc_export'),
					),
		);

		expect(hasConfig).toBe(true);
		expect(hasExportEvent).toBe(true);
		expect(externalRequests).toHaveLength(0);
	});

	test('fits 375x812 mobile viewport without horizontal scroll and navigates footer trust pages', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 375, height: 812 });

		const homeResponse = await page.goto('/');
		expect(homeResponse?.status()).toBe(200);
		await expect(page.locator('h1')).toBeVisible();

		const homeScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(homeScrollWidth).toBeLessThanOrEqual(375);

		const footerAboutLink = page.locator('footer a[href="/about/"], footer a[href$="/about/"]').first();
		await expect(footerAboutLink).toBeVisible();
		const [aboutResponse] = await Promise.all([
			page.waitForResponse(
				(res) =>
					new URL(res.url()).pathname.replace(/\/$/, '') === '/about' &&
					res.request().resourceType() === 'document',
			),
			footerAboutLink.click(),
		]);
		expect(aboutResponse.status()).toBe(200);
		await expect(page).toHaveURL(/\/about\/$/);
		await expect(page.locator('h1')).toBeVisible();

		const footerTermsLink = page.locator('footer a[href="/terms/"], footer a[href$="/terms/"]').first();
		await expect(footerTermsLink).toBeVisible();
		const [termsResponse] = await Promise.all([
			page.waitForResponse(
				(res) =>
					new URL(res.url()).pathname.replace(/\/$/, '') === '/terms' &&
					res.request().resourceType() === 'document',
			),
			footerTermsLink.click(),
		]);
		expect(termsResponse.status()).toBe(200);
		await expect(page).toHaveURL(/\/terms\/$/);
		await expect(page.locator('h1')).toBeVisible();
	});
});

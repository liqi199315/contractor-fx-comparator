import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
	auditContractorCsv,
	comparePayoutProviders,
	exportComparisonReport,
} from './lib/fx-engine';
import type {
	BillingCurrency,
	FeeBearer,
	FundingMethod,
	PayoutCurrency,
	PayoutScenarioInput,
} from './lib/types';

const CLI_VERSION = '0.1.0';
const FOOTER_PROMPT =
	'Zero-upload interactive comparison in your browser: https://contractorfx.com';

function printHelp(): void {
	const text = `ContractorFX CLI - International Contractor Payout and FX Spread Benchmark

USAGE:
  contractor-fx [options]
  contractor-fx --csv <path-to-csv> [options]

SINGLE CORRIDOR OPTIONS:
  -a, --amount <number>        Invoice gross amount in billing currency (default: 3500)
  -b, --billing <currency>     Billing currency: USD, EUR, GBP (default: USD)
  -p, --payout <currency>      Payout currency: EUR, GBP, INR, PHP, BRL, MXN, CNY, CAD (default: INR)
  -f, --funding <rail>         Funding rail: ach, ach-bank, wire, card (default: ach-bank)
  -c, --contractors <number>   Headcount footprint for SaaS seat fees (default: 1)
      --payouts <number>       Payouts per month per contractor (default: 1)
      --bearer <side>          Who absorbs transfer bite: contractor or client (default: contractor)

BATCH AUDIT OPTIONS:
      --csv <file>             Path to contractor payroll CSV for batch fee audit
                               CSV format: contractor,amount,billing_currency,payout_currency,current_provider

GENERAL OPTIONS:
      --format <type>          Output format: table, md, json (default: table)
  -v, --version                Show version number
  -h, --help                   Show this help message

EXAMPLES:
  contractor-fx --amount 3500 --billing USD --payout INR --funding ach --contractors 1
  contractor-fx --amount 5000 --billing USD --payout EUR --contractors 8 --format md
  contractor-fx --csv sample-team.csv --format table
  contractor-fx --csv payroll.csv --format json

${FOOTER_PROMPT}`;
	console.log(text);
}

function normalizeFunding(value: string): FundingMethod {
	const lowered = value.toLowerCase().trim();
	if (lowered === 'ach' || lowered === 'ach-bank' || lowered === 'bank') {
		return 'ach-bank';
	}
	if (lowered === 'wire') {
		return 'wire';
	}
	if (lowered === 'card') {
		return 'card';
	}
	throw new Error(`Unsupported funding method "${value}". Supported: ach, wire, card.`);
}

function normalizeBilling(value: string): BillingCurrency {
	const upper = value.toUpperCase().trim() as BillingCurrency;
	if (upper === 'USD' || upper === 'EUR' || upper === 'GBP') {
		return upper;
	}
	throw new Error(`Unsupported billing currency "${value}". Supported: USD, EUR, GBP.`);
}

function normalizePayout(value: string): PayoutCurrency {
	const upper = value.toUpperCase().trim() as PayoutCurrency;
	const valid = ['EUR', 'GBP', 'INR', 'PHP', 'BRL', 'MXN', 'CNY', 'CAD'];
	if (valid.includes(upper)) {
		return upper;
	}
	throw new Error(`Unsupported payout currency "${value}". Supported: ${valid.join(', ')}.`);
}

function normalizeBearer(value: string): FeeBearer {
	const lowered = value.toLowerCase().trim();
	if (lowered === 'client' || lowered === 'company') {
		return 'client';
	}
	if (lowered === 'contractor') {
		return 'contractor';
	}
	throw new Error(`Unsupported fee bearer "${value}". Supported: contractor, client.`);
}

function formatSingleTable(input: PayoutScenarioInput, summary: ReturnType<typeof comparePayoutProviders>): string {
	const best = summary.quotes[0]!;
	const worst = summary.quotes[summary.quotes.length - 1]!;

	const header = `ContractorFX - Single Corridor Comparison
Scenario: ${input.invoiceAmount.toFixed(2)} ${input.billingCurrency} to ${input.payoutCurrency} (Mid-market rate: ${summary.midMarketRate})
Funding Rail: ${input.fundingMethod} | Contractors: ${input.contractorCount} | Payouts/mo: ${input.payoutsPerMonth} | Fee Bearer: ${input.feeBearer}

Provider           Monthly SaaS   Funding Fee   Withdrawal Fee   FX Spread   FX Loss   Invoice Drag   Effective %   Annual Drag
---------------------------------------------------------------------------------------------------------------------------------`;

	const rows = summary.quotes.map((q) => {
		const isBest = q.providerId === summary.bestProviderId;
		const tag = isBest ? ' [LOWEST DRAG]' : '';
		const pName = q.providerName.padEnd(17);
		const saas = (`$${q.platformMonthlyUsd.toFixed(2)}`).padStart(12);
		const fund = (`$${q.fundingFeeUsd.toFixed(2)}`).padStart(13);
		const wdraw = (`$${q.withdrawalFixedFeeUsd.toFixed(2)}`).padStart(16);
		const spread = (`${q.fxSpreadPct.toFixed(2)}%`).padStart(11);
		const fxLoss = (`$${q.fxLossUsd.toFixed(2)}`).padStart(9);
		const drag = (`$${q.totalFeeDragUsd.toFixed(2)}`).padStart(14);
		const eff = (`${q.effectiveFeePct.toFixed(2)}%`).padStart(13);
		const annual = (`$${q.annualFeeDragUsd.toFixed(2)}`).padStart(13);
		return `${pName}${saas}${fund}${wdraw}${spread}${fxLoss}${drag}${eff}${annual}${tag}`;
	});

	const summaryBlock = `---------------------------------------------------------------------------------------------------------------------------------
Recommendation:
- Optimal Provider: ${best.providerName} ($${best.totalFeeDragUsd.toFixed(2)} per invoice, $${best.annualFeeDragUsd.toFixed(2)}/year)
- Highest-Cost Provider: ${worst.providerName} ($${worst.totalFeeDragUsd.toFixed(2)} per invoice, $${worst.annualFeeDragUsd.toFixed(2)}/year)
- Annual Routing Savings: $${summary.annualSavingsBestVsWorstUsd.toFixed(2)}/year

${FOOTER_PROMPT}`;

	return [header, ...rows, summaryBlock].join('\n');
}

function formatBatchTable(csvPath: string, result: Extract<ReturnType<typeof auditContractorCsv>, { ok: true }>): string {
	const header = `ContractorFX - Batch Contractor Payroll Audit
File: ${path.basename(csvPath)} | Contractors: ${result.rows.length}

Row  Contractor           Amount      Corridor    Current Provider   Current Fee   Optimal Provider   Optimal Fee   Monthly Saved
---------------------------------------------------------------------------------------------------------------------------------`;

	const rows = result.rows.map((r) => {
		const rowNum = String(r.rowNumber).padStart(3);
		const name = r.contractorName.slice(0, 18).padEnd(19);
		const amt = (`$${r.invoiceAmount.toFixed(2)}`).padStart(10);
		const corr = (`${r.billingCurrency}->${r.payoutCurrency}`).padStart(11);
		const curP = r.currentProvider.padEnd(18);
		const curFee = (`$${r.currentFeeUsd.toFixed(2)}`).padStart(12);
		const bestP = r.bestProvider.padEnd(18);
		const bestFee = (`$${r.bestFeeUsd.toFixed(2)}`).padStart(12);
		const saved = (`$${r.monthlySavedUsd.toFixed(2)}`).padStart(14);
		return `${rowNum}  ${name} ${amt} ${corr}  ${curP} ${curFee}  ${bestP} ${bestFee} ${saved}`;
	});

	const summaryBlock = `---------------------------------------------------------------------------------------------------------------------------------
Batch Audit Totals:
- Current Monthly Transfer Bite: $${result.totalMonthlyCurrentFeeUsd.toFixed(2)}
- Optimal Monthly Transfer Bite: $${result.totalMonthlyOptimalFeeUsd.toFixed(2)}
- Annual Potential Savings:      $${result.annualSavingsUsd.toFixed(2)}/year

${FOOTER_PROMPT}`;

	return [header, ...rows, summaryBlock].join('\n');
}

function formatBatchMd(csvPath: string, result: Extract<ReturnType<typeof auditContractorCsv>, { ok: true }>): string {
	const lines = [
		'# Contractor Payroll Batch Audit Report',
		'',
		`Source: \`${path.basename(csvPath)}\` (${result.rows.length} contractors audited)`,
		'',
		'## Executive Audit Summary',
		`- Current Monthly Fee Bite: $${result.totalMonthlyCurrentFeeUsd.toFixed(2)}`,
		`- Optimal Monthly Fee Bite: $${result.totalMonthlyOptimalFeeUsd.toFixed(2)}`,
		`- Annual Recoverable Waste: $${result.annualSavingsUsd.toFixed(2)}/year`,
		'',
		'## Line Item Breakdown',
		'| Row | Contractor | Invoice Amount | Corridor | Current Provider | Current Fee | Optimal Provider | Optimal Fee | Monthly Saved |',
		'| ---: | --- | ---: | :---: | --- | ---: | --- | ---: | ---: |',
		...result.rows.map(
			(r) =>
				`| ${r.rowNumber} | ${r.contractorName} | $${r.invoiceAmount.toFixed(2)} | ${r.billingCurrency}->${r.payoutCurrency} | ${r.currentProvider} | $${r.currentFeeUsd.toFixed(2)} | ${r.bestProvider} | $${r.bestFeeUsd.toFixed(2)} | $${r.monthlySavedUsd.toFixed(2)} |`,
		),
		'',
		`> ${FOOTER_PROMPT}`,
	];
	return lines.join('\n');
}

export function runCli(args: string[] = process.argv.slice(2)): { exitCode: number } {
	let parsed;
	try {
		parsed = parseArgs({
			args,
			options: {
				amount: { type: 'string', short: 'a' },
				billing: { type: 'string', short: 'b', default: 'USD' },
				payout: { type: 'string', short: 'p', default: 'INR' },
				funding: { type: 'string', short: 'f', default: 'ach-bank' },
				contractors: { type: 'string', short: 'c', default: '1' },
				payouts: { type: 'string', default: '1' },
				bearer: { type: 'string', default: 'contractor' },
				csv: { type: 'string' },
				format: { type: 'string', default: 'table' },
				help: { type: 'boolean', short: 'h', default: false },
				version: { type: 'boolean', short: 'v', default: false },
			},
			allowPositionals: true,
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error(`Error: ${msg}\nUse --help to view available options.`);
		return { exitCode: 1 };
	}

	const { values } = parsed;

	if (values.help) {
		printHelp();
		return { exitCode: 0 };
	}

	if (values.version) {
		console.log(`contractor-fx ${CLI_VERSION}`);
		return { exitCode: 0 };
	}

	const format = (values.format || 'table').toLowerCase();
	if (!['table', 'md', 'markdown', 'json'].includes(format)) {
		console.error(`Error: Invalid format "${values.format}". Choose table, md, or json.`);
		return { exitCode: 1 };
	}

	if (values.csv) {
		const resolvedPath = path.resolve(process.cwd(), values.csv);
		if (!existsSync(resolvedPath)) {
			console.error(`Error: CSV file not found: ${resolvedPath}`);
			return { exitCode: 1 };
		}
		let content = '';
		try {
			content = readFileSync(resolvedPath, 'utf8');
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`Error reading CSV file: ${msg}`);
			return { exitCode: 1 };
		}

		const audit = auditContractorCsv(content);
		if (!audit.ok) {
			console.error(`CSV Audit Error: ${audit.error}`);
			return { exitCode: 1 };
		}

		if (format === 'json') {
			console.log(JSON.stringify(audit, null, 2));
		} else if (format === 'md' || format === 'markdown') {
			console.log(formatBatchMd(resolvedPath, audit));
		} else {
			console.log(formatBatchTable(resolvedPath, audit));
		}
		return { exitCode: 0 };
	}

	try {
		const amountRaw = values.amount !== undefined ? values.amount : '3500';
		const invoiceAmount = Number(amountRaw);
		if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0) {
			throw new Error(`Amount must be a positive number, received "${amountRaw}".`);
		}

		const billingCurrency = normalizeBilling(values.billing || 'USD');
		const payoutCurrency = normalizePayout(values.payout || 'INR');
		const fundingMethod = normalizeFunding(values.funding || 'ach-bank');
		const contractorCount = Math.max(1, Math.floor(Number(values.contractors || '1')));
		const payoutsPerMonth = Math.max(1, Math.floor(Number(values.payouts || '1')));
		const feeBearer = normalizeBearer(values.bearer || 'contractor');

		const scenario: PayoutScenarioInput = {
			invoiceAmount,
			billingCurrency,
			payoutCurrency,
			fundingMethod,
			contractorCount,
			payoutsPerMonth,
			feeBearer,
		};

		const summary = comparePayoutProviders(scenario);

		if (format === 'json') {
			console.log(JSON.stringify({ scenario, summary }, null, 2));
		} else if (format === 'md' || format === 'markdown') {
			console.log(exportComparisonReport(scenario, summary, 'md'));
		} else {
			console.log(formatSingleTable(scenario, summary));
		}
		return { exitCode: 0 };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error(`Error: ${msg}`);
		return { exitCode: 1 };
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const res = runCli();
	process.exit(res.exitCode);
}

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_PATH = path.resolve(__dirname, '../bin/contractor-fx.mjs');

function runBin(args: string[]): { stdout: string; stderr: string; status: number } {
	try {
		const stdout = execFileSync('node', [CLI_PATH, ...args], {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'pipe'],
		});
		return { stdout, stderr: '', status: 0 };
	} catch (err: unknown) {
		const error = err as { stdout?: string; stderr?: string; status?: number };
		return {
			stdout: error.stdout ?? '',
			stderr: error.stderr ?? '',
			status: error.status ?? 1,
		};
	}
}

describe('bin/contractor-fx.mjs CLI', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(path.join(tmpdir(), 'contractor-fx-test-'));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	it('prints usage and zero-upload footer on --help', () => {
		const result = runBin(['--help']);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain('ContractorFX CLI');
		expect(result.stdout).toContain('--amount');
		expect(result.stdout).toContain('--csv');
		expect(result.stdout).toContain('https://contractorfx.com');
	});

	it('prints version on --version', () => {
		const result = runBin(['--version']);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain('contractor-fx 0.1.0');
	});

	it('computes single corridor comparison in table format by default', () => {
		const result = runBin([
			'--amount',
			'3500',
			'--billing',
			'USD',
			'--payout',
			'INR',
			'--funding',
			'ach',
			'--contractors',
			'1',
		]);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain('ContractorFX - Single Corridor Comparison');
		expect(result.stdout).toContain('Wise Business');
		expect(result.stdout).toContain('LOWEST DRAG');
		expect(result.stdout).toContain('https://contractorfx.com');
	});

	it('outputs valid JSON for single corridor comparison', () => {
		const result = runBin([
			'--amount',
			'2000',
			'--billing',
			'USD',
			'--payout',
			'PHP',
			'--format',
			'json',
		]);
		expect(result.status).toBe(0);
		const parsed = JSON.parse(result.stdout);
		expect(parsed.scenario.invoiceAmount).toBe(2000);
		expect(parsed.scenario.billingCurrency).toBe('USD');
		expect(parsed.scenario.payoutCurrency).toBe('PHP');
		expect(parsed.summary.quotes).toHaveLength(5);
		expect(parsed.summary.bestProviderId).toBe('wise');
	});

	it('outputs markdown memo for single corridor comparison', () => {
		const result = runBin([
			'--amount',
			'5000',
			'--billing',
			'USD',
			'--payout',
			'EUR',
			'--contractors',
			'8',
			'--format',
			'md',
		]);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain('# Contractor Payout Routing Memo');
		expect(result.stdout).toContain('## Executive Recommendation');
		expect(result.stdout).toContain('| Provider |');
	});

	it('audits batch contractor payroll CSV in table format', () => {
		const sampleCsv = `contractor,amount,billing_currency,payout_currency,current_provider
Aarav Mehta,4500,USD,INR,payoneer
Camille Reyes,2800,USD,PHP,payoneer
Elena Fischer,6000,USD,EUR,deel`;

		const csvFile = path.join(tempDir, 'team.csv');
		writeFileSync(csvFile, sampleCsv, 'utf8');

		const result = runBin(['--csv', csvFile, '--format', 'table']);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain('ContractorFX - Batch Contractor Payroll Audit');
		expect(result.stdout).toContain('Aarav Mehta');
		expect(result.stdout).toContain('Batch Audit Totals:');
		expect(result.stdout).toContain('Annual Potential Savings:');
		expect(result.stdout).toContain('https://contractorfx.com');
	});

	it('outputs valid JSON for batch CSV audit', () => {
		const sampleCsv = `contractor,amount,billing_currency,payout_currency,current_provider
Aarav Mehta,4500,USD,INR,payoneer
Sofia Morales,3400,USD,MXN,payoneer`;

		const csvFile = path.join(tempDir, 'payouts.csv');
		writeFileSync(csvFile, sampleCsv, 'utf8');

		const result = runBin(['--csv', csvFile, '--format', 'json']);
		expect(result.status).toBe(0);
		const parsed = JSON.parse(result.stdout);
		expect(parsed.ok).toBe(true);
		expect(parsed.rows).toHaveLength(2);
		expect(parsed.annualSavingsUsd).toBeGreaterThan(0);
	});

	it('outputs markdown report for batch CSV audit', () => {
		const sampleCsv = `contractor,amount,billing_currency,payout_currency,current_provider
Elena Fischer,6000,USD,EUR,deel`;

		const csvFile = path.join(tempDir, 'deel.csv');
		writeFileSync(csvFile, sampleCsv, 'utf8');

		const result = runBin(['--csv', csvFile, '--format', 'md']);
		expect(result.status).toBe(0);
		expect(result.stdout).toContain('# Contractor Payroll Batch Audit Report');
		expect(result.stdout).toContain('## Executive Audit Summary');
		expect(result.stdout).toContain('https://contractorfx.com');
	});

	it('fails gracefully when CSV file does not exist', () => {
		const result = runBin(['--csv', 'nonexistent-file.csv']);
		expect(result.status).toBe(1);
		expect(result.stderr).toContain('CSV file not found');
	});

	it('fails gracefully on malformed CSV data', () => {
		const badCsv = `contractor,amount,billing_currency,payout_currency,current_provider
Invalid Row,not-a-number,USD,INR,payoneer`;

		const csvFile = path.join(tempDir, 'bad.csv');
		writeFileSync(csvFile, badCsv, 'utf8');

		const result = runBin(['--csv', csvFile]);
		expect(result.status).toBe(1);
		expect(result.stderr).toContain('CSV Audit Error');
	});

	it('fails gracefully on invalid amount or currency in single corridor', () => {
		const badAmount = runBin(['--amount', '0']);
		expect(badAmount.status).toBe(1);
		expect(badAmount.stderr).toContain('Amount must be a positive number');

		const badCurrency = runBin(['--billing', 'XYZ']);
		expect(badCurrency.status).toBe(1);
		expect(badCurrency.stderr).toContain('Unsupported billing currency "XYZ"');
	});
});

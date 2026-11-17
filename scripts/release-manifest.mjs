#!/usr/bin/env node
// Project wrapper for release.json generation and live verification.
// Delegates to ../../40_shared/scripts/indie-release-manifest.mjs in the main monorepo
// checkout and provides a standalone fallback for linked git worktrees and CI runners.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_PROJECT = 'contractorfx';
const DEFAULT_SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://contractorfx.com').replace(
	/\/$/,
	'',
);
const DEFAULT_MEASUREMENT_ID =
	(process.env.PUBLIC_GA4_MEASUREMENT_ID || '').trim() || 'G-BMWC0P9PW2';
const SITEMAP_FILE = 'sitemap-0.xml';
const RELEASE_FILE = 'release.json';

function parseArgs(rawArgs) {
	const result = {};
	for (let i = 0; i < rawArgs.length; i += 1) {
		const arg = rawArgs[i];
		if (!arg.startsWith('--')) continue;
		const key = arg.slice(2);
		if (
			key === 'write' ||
			key === 'check-live' ||
			key === 'json' ||
			key === 'allow-pending-deploy'
		) {
			result[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = true;
			continue;
		}
		const value = rawArgs[i + 1];
		if (!value || value.startsWith('--')) {
			throw new Error(`Missing value for --${key}.`);
		}
		result[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
		i += 1;
	}
	return result;
}

function runGit(cwd, gitArgs) {
	return spawnSync('git', gitArgs, {
		cwd,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	});
}

function gitOrThrow(cwd, gitArgs, message) {
	const res = runGit(cwd, gitArgs);
	if (res.status !== 0) {
		const detail = String(res.stderr || res.stdout || '').trim();
		throw new Error(detail ? `${message}: ${detail}` : message);
	}
	return String(res.stdout || '').trim();
}

function findSharedManifestScript(cwd) {
	const directCandidate = resolve(cwd, '../../40_shared/scripts/indie-release-manifest.mjs');
	const expectedMainRepo = resolve(cwd, '../../30_products/contractor-fx-comparator');
	if (existsSync(directCandidate) && existsSync(expectedMainRepo)) {
		try {
			const isCanonicalRepo = realpathSync(cwd) === realpathSync(expectedMainRepo);
			return { path: directCandidate, isCanonicalRepo };
		} catch {
			return { path: directCandidate, isCanonicalRepo: false };
		}
	}

	const commonDirRes = runGit(cwd, ['rev-parse', '--git-common-dir']);
	if (commonDirRes.status === 0) {
		const rawCommon = String(commonDirRes.stdout || '').trim();
		if (rawCommon) {
			const absCommon = resolve(cwd, rawCommon);
			const worktreeCandidate = resolve(
				absCommon,
				'../../../40_shared/scripts/indie-release-manifest.mjs',
			);
			if (existsSync(worktreeCandidate)) {
				return { path: worktreeCandidate, isCanonicalRepo: false };
			}
		}
	}

	return null;
}

function normalizeRoute(value) {
	const raw = String(value || '').trim();
	if (!raw) return raw;
	try {
		const url = new URL(raw);
		let pathname = url.pathname || '/';
		if (!pathname.endsWith('/')) pathname = `${pathname}/`;
		return `${url.origin}${pathname}`;
	} catch {
		return raw;
	}
}

function parseSitemapUrls(xml) {
	const urls = [];
	const pattern = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
	for (const match of String(xml).matchAll(pattern)) {
		urls.push(normalizeRoute(match[1]));
	}
	return [...new Set(urls)].sort();
}

function sha256Text(text) {
	return createHash('sha256').update(text).digest('hex');
}

function routeHtmlPath(distDir, siteUrl, route) {
	const pathname = new URL(route, siteUrl).pathname;
	const file = pathname.endsWith('/')
		? `${pathname}index.html`
		: pathname.endsWith('.html')
			? pathname
			: `${pathname}/index.html`;
	return join(distDir, file.replace(/^\/+/, ''));
}

function assertMeasurementIdInHtml(distDir, siteUrl, routes, measurementId) {
	const missing = [];
	for (const route of routes) {
		const file = routeHtmlPath(distDir, siteUrl, route);
		if (!existsSync(file) || !readFileSync(file, 'utf8').includes(measurementId)) {
			missing.push(route);
		}
	}
	if (missing.length > 0) {
		const shown = missing.slice(0, 3).join(', ');
		const more = missing.length > 3 ? `, and ${missing.length - 3} more` : '';
		throw new Error(
			`GA4 measurement ID ${measurementId} is missing from ${missing.length} built route(s): ${shown}${more}. Rebuild with PUBLIC_GA4_MEASUREMENT_ID set before writing release.json.`,
		);
	}
}

function parsePorcelainPath(line) {
	const body = /^.. /.test(line) ? line.slice(3) : line;
	const parts = body.split(' -> ');
	return parts[parts.length - 1].replace(/^"|"$/g, '');
}

function readGitSource(cwd) {
	const toplevel = gitOrThrow(cwd, ['rev-parse', '--show-toplevel'], 'git rev-parse failed');
	const commit = gitOrThrow(toplevel, ['rev-parse', 'HEAD'], 'git rev-parse HEAD failed');
	const branch = gitOrThrow(toplevel, ['rev-parse', '--abbrev-ref', 'HEAD'], 'git branch failed');
	const upstreamResult = runGit(toplevel, [
		'rev-parse',
		'--abbrev-ref',
		'--symbolic-full-name',
		'@{upstream}',
	]);
	const upstream = upstreamResult.status === 0 ? String(upstreamResult.stdout || '').trim() : null;
	let ahead = 0;
	let behind = 0;
	if (upstream) {
		const countsRes = runGit(toplevel, ['rev-list', '--left-right', '--count', `${upstream}...HEAD`]);
		if (countsRes.status === 0) {
			const [behindText, aheadText] = String(countsRes.stdout || '').trim().split(/\s+/);
			behind = Number.parseInt(behindText, 10) || 0;
			ahead = Number.parseInt(aheadText, 10) || 0;
		}
	}
	const statusRes = runGit(toplevel, ['status', '--porcelain']);
	if (statusRes.status !== 0) {
		throw new Error('git status failed');
	}
	const dirtyPaths = String(statusRes.stdout || '')
		.replace(/\n$/, '')
		.split(/\n/)
		.filter((line) => line.length > 0)
		.map(parsePorcelainPath)
		.sort();

	return { commit, branch, upstream, ahead, behind, dirtyPaths };
}

function writeStandaloneManifest({ project, distDir, cwd }) {
	const dist = resolve(cwd, distDir);
	if (!existsSync(dist) || !statSync(dist).isDirectory()) {
		throw new Error(`Missing dist directory: ${dist}`);
	}
	const sitemapPath = join(dist, SITEMAP_FILE);
	if (!existsSync(sitemapPath)) {
		throw new Error(`Missing ${SITEMAP_FILE} in ${dist}.`);
	}
	const sitemapXml = readFileSync(sitemapPath, 'utf8');
	const routes = parseSitemapUrls(sitemapXml);
	if (routes.length === 0) {
		throw new Error(`${SITEMAP_FILE} has no <loc> URLs.`);
	}
	assertMeasurementIdInHtml(dist, DEFAULT_SITE_URL, routes, DEFAULT_MEASUREMENT_ID);
	const source = readGitSource(cwd);
	const manifest = {
		schemaVersion: 1,
		project,
		siteUrl: DEFAULT_SITE_URL,
		measurementId: DEFAULT_MEASUREMENT_ID,
		builtAt: new Date().toISOString(),
		source,
		routes,
		routeCount: routes.length,
		sitemapSha256: sha256Text(sitemapXml),
	};
	const outPath = join(dist, RELEASE_FILE);
	writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
	const rel = relative(cwd, outPath) || outPath;
	console.log(
		`${manifest.project} wrote ${rel}: ${manifest.routeCount} routes, commit ${manifest.source.commit.slice(0, 12)}`,
	);
	return { exitCode: 0, result: manifest };
}

async function checkStandaloneLive({ project, distDir, allowPendingDeploy, asJson, cwd }) {
	const localPath = join(resolve(cwd, distDir), RELEASE_FILE);
	if (!existsSync(localPath)) {
		throw new Error(`Missing local ${RELEASE_FILE} at ${localPath}. Run --write after astro build.`);
	}
	const localManifest = JSON.parse(readFileSync(localPath, 'utf8'));
	if (localManifest.project !== project) {
		throw new Error(
			`Local release.json project "${localManifest.project}" does not match --project ${project}.`,
		);
	}
	const sitemapUrl = `${DEFAULT_SITE_URL}/${SITEMAP_FILE}`;
	const releaseUrl = `${DEFAULT_SITE_URL}/${RELEASE_FILE}`;
	const sitemapRes = await fetch(sitemapUrl);
	if (!sitemapRes.ok) {
		throw new Error(`Failed to fetch ${sitemapUrl}: HTTP ${sitemapRes.status}`);
	}
	const liveSitemapXml = await sitemapRes.text();
	const releaseRes = await fetch(releaseUrl);
	let liveManifest = null;
	let liveManifestStatus = 'missing';
	if (releaseRes.status !== 404) {
		if (!releaseRes.ok) {
			throw new Error(`Failed to fetch ${releaseUrl}: HTTP ${releaseRes.status}`);
		}
		liveManifest = JSON.parse(await releaseRes.text());
		liveManifestStatus = 'present';
	}

	const localRoutes = [...localManifest.routes].map(normalizeRoute).sort();
	const liveRoutes = parseSitemapUrls(liveSitemapXml);
	const liveSet = new Set(liveRoutes);
	const localSet = new Set(localRoutes);
	const missingOnLive = localRoutes.filter((r) => !liveSet.has(r));
	const extraOnLive = liveRoutes.filter((r) => !localSet.has(r));

	const reasons = [];
	if (missingOnLive.length || extraOnLive.length) reasons.push('routes');

	let measurementIdMatch = null;
	if (liveManifest) {
		measurementIdMatch = liveManifest.measurementId === localManifest.measurementId;
		if (!measurementIdMatch) reasons.push('measurementId');
	}

	let commitMatch = null;
	let status = 'match';
	if (liveManifestStatus === 'missing') {
		status = 'pending_live_manifest';
		if (!allowPendingDeploy || reasons.length > 0) {
			reasons.push('pending_live_manifest');
		}
	} else {
		const liveCommit = liveManifest?.source?.commit || null;
		commitMatch = liveCommit === localManifest.source.commit;
		if (!commitMatch) {
			status = 'commit_mismatch';
			reasons.push('commit');
		} else if (reasons.length > 0) {
			status = 'mismatch';
		}
	}

	const ok = reasons.length === 0;
	const result = {
		ok,
		status: ok
			? status === 'pending_live_manifest'
				? status
				: 'match'
			: status === 'match'
				? 'mismatch'
				: status,
		project: localManifest.project,
		siteUrl: localManifest.siteUrl,
		routeCount: localRoutes.length,
		liveRouteCount: liveRoutes.length,
		routesMatch: missingOnLive.length === 0 && extraOnLive.length === 0,
		missingOnLive,
		extraOnLive,
		measurementId: localManifest.measurementId,
		liveMeasurementId: liveManifest ? (liveManifest.measurementId ?? null) : null,
		measurementIdMatch,
		localCommit: localManifest.source.commit,
		liveCommit: liveManifest?.source?.commit ?? null,
		commitMatch,
		allowPendingDeploy,
		reasons,
		sitemapUrl,
		releaseUrl,
	};

	if (asJson) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		const label = (v) => (v === true ? 'match' : v === false ? 'differ' : 'unchecked');
		const short = (c) => (c ? String(c).slice(0, 12) : '(none)');
		console.log(`${result.project} ${result.ok ? 'ok' : 'fail'} (${result.status})`);
		console.log(
			`routes ${result.routeCount} local / ${result.liveRouteCount} live (${result.routesMatch ? 'match' : 'differ'})`,
		);
		console.log(
			`measurementId ${result.measurementId} vs live ${result.liveMeasurementId ?? '(none)'} (${label(result.measurementIdMatch)})`,
		);
		console.log(
			`commit ${short(result.localCommit)} vs live ${short(result.liveCommit)} (${label(result.commitMatch)})`,
		);
	}

	return { exitCode: ok ? 0 : 1, result };
}

async function main() {
	const rawArgs = process.argv.slice(2);
	const args = parseArgs(rawArgs);
	const project = args.project || DEFAULT_PROJECT;
	const distDir = args.dist || 'dist';
	const cwd = process.cwd();

	const sharedInfo = findSharedManifestScript(cwd);
	if (sharedInfo && (sharedInfo.isCanonicalRepo || args.checkLive)) {
		const sharedModule = await import(pathToFileURL(sharedInfo.path).href);
		const { exitCode } = await sharedModule.runCli(rawArgs);
		if (exitCode) process.exit(exitCode);
		return;
	}

	if (args.write && args.checkLive) {
		throw new Error('Use either --write or --check-live, not both.');
	}
	if (!args.write && !args.checkLive) {
		throw new Error('Pass --write or --check-live.');
	}

	if (args.write) {
		const { exitCode } = writeStandaloneManifest({ project, distDir, cwd });
		if (exitCode) process.exit(exitCode);
		return;
	}

	const { exitCode } = await checkStandaloneLive({
		project,
		distDir,
		allowPendingDeploy: Boolean(args.allowPendingDeploy),
		asJson: Boolean(args.json),
		cwd,
	});
	if (exitCode) process.exit(exitCode);
}

const scriptPath = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && resolve(process.argv[1]).startsWith(scriptPath)) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	});
}

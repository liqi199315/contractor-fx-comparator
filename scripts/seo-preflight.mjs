import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE_ORIGIN = (process.env.PUBLIC_SITE_URL || 'https://contractorfx.com').replace(/\/$/, '');

function buildContentRoutes(origin = SITE_ORIGIN) {
	return [
		{
			route: '/',
			file: 'index.html',
			canonical: `${origin}/`,
			kind: 'tool',
		},
		{
			route: '/wise-vs-payoneer-fee-calculator/',
			file: 'wise-vs-payoneer-fee-calculator/index.html',
			canonical: `${origin}/wise-vs-payoneer-fee-calculator/`,
			kind: 'tool',
		},
		{
			route: '/deel-vs-remote-contractor-calculator/',
			file: 'deel-vs-remote-contractor-calculator/index.html',
			canonical: `${origin}/deel-vs-remote-contractor-calculator/`,
			kind: 'tool',
		},
		{
			route: '/deel-vs-wise-contractor-payouts/',
			file: 'deel-vs-wise-contractor-payouts/index.html',
			canonical: `${origin}/deel-vs-wise-contractor-payouts/`,
			kind: 'tool',
		},
		{
			route: '/deel-withdrawal-fee-calculator/',
			file: 'deel-withdrawal-fee-calculator/index.html',
			canonical: `${origin}/deel-withdrawal-fee-calculator/`,
			kind: 'tool',
		},
		{
			route: '/batch-contractor-payout-csv-audit/',
			file: 'batch-contractor-payout-csv-audit/index.html',
			canonical: `${origin}/batch-contractor-payout-csv-audit/`,
			kind: 'tool',
		},
		{
			route: '/about/',
			file: 'about/index.html',
			canonical: `${origin}/about/`,
			kind: 'trust',
		},
		{
			route: '/privacy/',
			file: 'privacy/index.html',
			canonical: `${origin}/privacy/`,
			kind: 'trust',
		},
		{
			route: '/terms/',
			file: 'terms/index.html',
			canonical: `${origin}/terms/`,
			kind: 'trust',
		},
	];
}

export const CONTENT_ROUTES = buildContentRoutes(SITE_ORIGIN);

export const EXTRA_REQUIRED_FILES = [
	'404.html',
	'sitemap-index.xml',
	'robots.txt',
	'llms.txt',
	'_headers',
	'og-image.svg',
	'og-image.png',
	'github-social-preview.png',
	'site.webmanifest',
	'indexnow-key.txt',
	'b7e3d1c84a924f508c6e23b9a1d05e42.txt',
];

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const LONG_DASH_PATTERN = /[\u2013\u2014]|&(?:mdash|ndash|#8211|#8212|#x2013|#x2014);/i;
const LOREM_PATTERN = new RegExp(['lor', 'em\\s+ip', 'sum'].join(''), 'i');
const TOKEN_DOUBLE_OPEN = ['{', '{'].join('');
const TOKEN_DOUBLE_CLOSE = ['}', '}'].join('');
const TOKEN_TD = ['TO', 'DO'].join('');
const TOKEN_FM = ['FIX', 'ME'].join('');

function isExistingFile(filePath) {
	try {
		return existsSync(filePath) && statSync(filePath).isFile();
	} catch {
		return false;
	}
}

function walkHtmlFiles(dirPath, rootDir = dirPath, acc = []) {
	if (!existsSync(dirPath)) {
		return acc;
	}
	for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			walkHtmlFiles(fullPath, rootDir, acc);
		} else if (entry.isFile() && entry.name.endsWith('.html')) {
			acc.push(path.relative(rootDir, fullPath).split(path.sep).join('/'));
		}
	}
	return acc.sort();
}

function parseAttributes(attrSource) {
	const attrs = {};
	const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
	let match;
	while ((match = attrRegex.exec(attrSource)) !== null) {
		const key = match[1].toLowerCase();
		const value = match[2] ?? match[3] ?? match[4] ?? '';
		attrs[key] = value;
	}
	return attrs;
}

function decodeBasicEntities(value) {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&#34;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

function stripTags(html) {
	return decodeBasicEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function stripScriptsStylesAndComments(html) {
	return html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

function extractHeadSection(html) {
	const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
	const raw = headMatch ? headMatch[1] : html;
	return stripScriptsStylesAndComments(raw).replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
}

function collectSchemaTypes(node, types) {
	if (Array.isArray(node)) {
		for (const item of node) {
			collectSchemaTypes(item, types);
		}
		return;
	}
	if (node && typeof node === 'object') {
		const rawType = node['@type'];
		if (typeof rawType === 'string') {
			types.add(rawType);
		} else if (Array.isArray(rawType)) {
			for (const entry of rawType) {
				if (typeof entry === 'string') {
					types.add(entry);
				}
			}
		}
		for (const value of Object.values(node)) {
			collectSchemaTypes(value, types);
		}
	}
}

function collectJsonStrings(node, strings) {
	if (typeof node === 'string') {
		strings.push(node);
		return;
	}
	if (Array.isArray(node)) {
		for (const item of node) {
			collectJsonStrings(item, strings);
		}
		return;
	}
	if (node && typeof node === 'object') {
		for (const [key, value] of Object.entries(node)) {
			strings.push(key);
			collectJsonStrings(value, strings);
		}
	}
}

function checkForbiddenText(text, label, errors, checkBraces = true) {
	if (checkBraces && text.includes(TOKEN_DOUBLE_OPEN)) {
		errors.push(`${label}: contains forbidden placeholder token "${TOKEN_DOUBLE_OPEN}"`);
	}
	if (checkBraces && text.includes(TOKEN_DOUBLE_CLOSE)) {
		errors.push(`${label}: contains forbidden placeholder token "${TOKEN_DOUBLE_CLOSE}"`);
	}
	if (text.includes(TOKEN_TD)) {
		errors.push(`${label}: contains forbidden token "${TOKEN_TD}"`);
	}
	if (text.includes(TOKEN_FM)) {
		errors.push(`${label}: contains forbidden token "${TOKEN_FM}"`);
	}
	if (LOREM_PATTERN.test(text)) {
		errors.push(`${label}: contains forbidden placeholder copy`);
	}
	if (LONG_DASH_PATTERN.test(text)) {
		errors.push(`${label}: contains forbidden em-dash or en-dash character`);
	}
}

function inspectHtmlForbiddenTokens(rawHtml, relFile, errors) {
	checkForbiddenText(rawHtml, relFile, errors, false);

	const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
	let scriptMatch;
	while ((scriptMatch = scriptRegex.exec(rawHtml)) !== null) {
		const attrs = parseAttributes(scriptMatch[1]);
		if ((attrs.type ?? '').toLowerCase() === 'application/ld+json') {
			try {
				const parsed = JSON.parse(scriptMatch[2].trim());
				const jsonStrings = [];
				collectJsonStrings(parsed, jsonStrings);
				for (const str of jsonStrings) {
					checkForbiddenText(str, `${relFile} (JSON-LD)`, errors, true);
				}
			} catch {
				checkForbiddenText(scriptMatch[2], `${relFile} (raw JSON-LD)`, errors, true);
			}
		}
	}

	let markupOnly = stripScriptsStylesAndComments(rawHtml);
	markupOnly = markupOnly.replace(
		/<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/gi,
		(fullMatch, attrPart, innerText) => {
			const decoded = decodeBasicEntities(innerText).trim();
			if (decoded.startsWith('{') || decoded.startsWith('[')) {
				try {
					const parsed = JSON.parse(decoded);
					const jsonStrings = [];
					collectJsonStrings(parsed, jsonStrings);
					for (const str of jsonStrings) {
						checkForbiddenText(str, `${relFile} (textarea JSON)`, errors, true);
					}
					return `<textarea${attrPart}></textarea>`;
				} catch {
					return fullMatch;
				}
			}
			return fullMatch;
		},
	);

	checkForbiddenText(markupOnly, relFile, errors, true);
}

function resolveInternalHref(distDir, href) {
	const rawPath = href.split('#')[0].split('?')[0];
	let decodedPath;
	try {
		decodedPath = decodeURIComponent(rawPath);
	} catch {
		return null;
	}

	const normalizedRoot = path.resolve(distDir);
	const rel = decodedPath.replace(/^\/+/, '');
	const candidates =
		decodedPath === '' || decodedPath === '/'
			? [path.resolve(normalizedRoot, 'index.html')]
			: decodedPath.endsWith('/')
				? [path.resolve(normalizedRoot, rel, 'index.html')]
				: [
						path.resolve(normalizedRoot, rel),
						path.resolve(normalizedRoot, rel, 'index.html'),
						path.resolve(normalizedRoot, `${rel}.html`),
					];

	for (const candidate of candidates) {
		const relative = path.relative(normalizedRoot, candidate);
		if (relative.startsWith('..') || path.isAbsolute(relative)) {
			return null;
		}
		if (isExistingFile(candidate)) {
			return candidate;
		}
	}
	return null;
}

function checkOgImageMeta(metaTags, routeFile, origin, distDir, errors) {
	const ogImageMetas = metaTags.filter(
		(attrs) => (attrs.property ?? attrs.name ?? '').toLowerCase() === 'og:image',
	);
	if (ogImageMetas.length !== 1) {
		errors.push(
			`${routeFile}: expected exactly 1 <meta property="og:image">, found ${ogImageMetas.length}`,
		);
		return;
	}

	const ogImageContent = decodeBasicEntities(ogImageMetas[0].content ?? '').trim();
	if (!ogImageContent) {
		errors.push(`${routeFile}: <meta property="og:image"> content must not be empty`);
		return;
	}

	if (!ogImageContent.endsWith('/og-image.png')) {
		errors.push(
			`${routeFile}: og:image "${ogImageContent}" must point to a PNG ending in "/og-image.png"`,
		);
	}

	let assetPath = '';
	if (ogImageContent.startsWith(`${origin}/`)) {
		assetPath = ogImageContent.slice(origin.length);
	} else if (ogImageContent.startsWith('/') && !ogImageContent.startsWith('//')) {
		assetPath = ogImageContent;
	} else {
		errors.push(
			`${routeFile}: og:image "${ogImageContent}" must start with "${origin}/" or "/"`,
		);
		return;
	}

	if (!resolveInternalHref(distDir, assetPath)) {
		errors.push(
			`${routeFile}: og:image asset "${assetPath}" does not resolve to a built file in dist/`,
		);
	}
}

export function inspectDist(distDir, siteOrigin = SITE_ORIGIN) {
	const normalizedOrigin = siteOrigin.replace(/\/$/, '');
	const routes = buildContentRoutes(normalizedOrigin);
	const errors = [];

	const requiredFiles = [
		...routes.map((entry) => entry.file),
		...EXTRA_REQUIRED_FILES,
	];

	for (const relFile of requiredFiles) {
		const absPath = path.join(distDir, relFile);
		if (!isExistingFile(absPath)) {
			errors.push(`Missing required built file: dist/${relFile}`);
		} else if (statSync(absPath).size === 0) {
			errors.push(`Built file is empty: dist/${relFile}`);
		}
	}

	// Verify PNG social preview binary validity and minimum size
	const ogPngPath = path.join(distDir, 'og-image.png');
	if (isExistingFile(ogPngPath)) {
		const stats = statSync(ogPngPath);
		if (stats.size <= 5120) {
			errors.push(`dist/og-image.png size is ${stats.size} bytes; expected > 5 KB (5120 bytes)`);
		}
		const buf = readFileSync(ogPngPath);
		if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_MAGIC)) {
			errors.push('dist/og-image.png does not have valid PNG magic bytes');
		}
	}

	const ghPngPath = path.join(distDir, 'github-social-preview.png');
	if (isExistingFile(ghPngPath)) {
		const stats = statSync(ghPngPath);
		if (stats.size <= 5120) {
			errors.push(
				`dist/github-social-preview.png size is ${stats.size} bytes; expected > 5 KB (5120 bytes)`,
			);
		}
		const buf = readFileSync(ghPngPath);
		if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_MAGIC)) {
			errors.push('dist/github-social-preview.png does not have valid PNG magic bytes');
		}
	}

	// Verify dual IndexNow key content
	const dualKeyFile = path.join(distDir, 'b7e3d1c84a924f508c6e23b9a1d05e42.txt');
	if (isExistingFile(dualKeyFile)) {
		const content = readFileSync(dualKeyFile, 'utf8').trim();
		if (content !== 'b7e3d1c84a924f508c6e23b9a1d05e42') {
			errors.push(
				`dist/b7e3d1c84a924f508c6e23b9a1d05e42.txt content "${content}" does not match IndexNow key`,
			);
		}
	}

	// Verify preview domain noindex header in _headers
	const headersPath = path.join(distDir, '_headers');
	if (isExistingFile(headersPath)) {
		const headersContent = readFileSync(headersPath, 'utf8');
		if (!headersContent.includes('X-Robots-Tag: noindex')) {
			errors.push('dist/_headers missing required preview domain rule "X-Robots-Tag: noindex"');
		}
	}

	const seenTitles = new Map();
	const seenDescriptions = new Map();

	for (const routeEntry of routes) {
		const absPath = path.join(distDir, routeEntry.file);
		if (!isExistingFile(absPath)) {
			continue;
		}
		const html = readFileSync(absPath, 'utf8');
		const head = extractHeadSection(html);

		const titleMatches = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
		if (titleMatches.length !== 1) {
			errors.push(`${routeEntry.file}: expected exactly 1 <title>, found ${titleMatches.length}`);
		} else {
			const titleText = stripTags(titleMatches[0][1]);
			if (!titleText) {
				errors.push(`${routeEntry.file}: <title> must not be empty`);
			} else if (seenTitles.has(titleText)) {
				errors.push(
					`${routeEntry.file}: duplicate <title> "${titleText}" (already used in ${seenTitles.get(titleText)})`,
				);
			} else {
				seenTitles.set(titleText, routeEntry.file);
			}
		}

		const metaTags = [...head.matchAll(/<meta\b([^>]*)>/gi)].map((m) => parseAttributes(m[1]));
		const descriptionMetas = metaTags.filter(
			(attrs) => (attrs.name ?? '').toLowerCase() === 'description',
		);
		if (descriptionMetas.length !== 1) {
			errors.push(
				`${routeEntry.file}: expected exactly 1 <meta name="description">, found ${descriptionMetas.length}`,
			);
		} else {
			const desc = decodeBasicEntities(descriptionMetas[0].content ?? '').trim();
			if (!desc) {
				errors.push(`${routeEntry.file}: <meta name="description"> content must not be empty`);
			} else if (seenDescriptions.has(desc)) {
				errors.push(
					`${routeEntry.file}: duplicate meta description (already used in ${seenDescriptions.get(desc)})`,
				);
			} else {
				seenDescriptions.set(desc, routeEntry.file);
			}
		}

		checkOgImageMeta(metaTags, routeEntry.file, normalizedOrigin, distDir, errors);

		const linkTags = [...head.matchAll(/<link\b([^>]*)>/gi)].map((m) => parseAttributes(m[1]));
		const canonicalLinks = linkTags.filter((attrs) =>
			(attrs.rel ?? '').toLowerCase().split(/\s+/).includes('canonical'),
		);
		if (canonicalLinks.length !== 1) {
			errors.push(
				`${routeEntry.file}: expected exactly 1 <link rel="canonical">, found ${canonicalLinks.length}`,
			);
		} else if (canonicalLinks[0].href !== routeEntry.canonical) {
			errors.push(
				`${routeEntry.file}: canonical href "${canonicalLinks[0].href ?? ''}" does not match expected "${routeEntry.canonical}"`,
			);
		}

		const bodyWithoutScripts = stripScriptsStylesAndComments(html);
		const h1Matches = [...bodyWithoutScripts.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
		if (h1Matches.length !== 1) {
			errors.push(`${routeEntry.file}: expected exactly 1 <h1>, found ${h1Matches.length}`);
		} else if (!stripTags(h1Matches[0][1])) {
			errors.push(`${routeEntry.file}: <h1> text must not be empty`);
		}

		const ldScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(
			(m) => (parseAttributes(m[1]).type ?? '').toLowerCase() === 'application/ld+json',
		);
		if (ldScripts.length === 0) {
			errors.push(`${routeEntry.file}: missing <script type="application/ld+json">`);
		} else {
			const schemaTypes = new Set();
			for (const block of ldScripts) {
				try {
					const parsed = JSON.parse(block[2].trim());
					collectSchemaTypes(parsed, schemaTypes);
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					errors.push(`${routeEntry.file}: invalid JSON-LD (${message})`);
				}
			}

			if (!schemaTypes.has('Organization')) {
				errors.push(`${routeEntry.file}: JSON-LD missing required @type "Organization"`);
			}
			if (routeEntry.route !== '/' && !schemaTypes.has('BreadcrumbList')) {
				errors.push(`${routeEntry.file}: JSON-LD missing required @type "BreadcrumbList"`);
			}
			if (routeEntry.kind === 'tool') {
				if (!schemaTypes.has('WebApplication')) {
					errors.push(`${routeEntry.file}: JSON-LD missing required @type "WebApplication"`);
				}
				if (!schemaTypes.has('FAQPage')) {
					errors.push(`${routeEntry.file}: JSON-LD missing required @type "FAQPage"`);
				}
			}
		}
	}

	const htmlFiles = walkHtmlFiles(distDir);
	let internalLinksChecked = 0;

	for (const relFile of htmlFiles) {
		const absPath = path.join(distDir, relFile);
		const html = readFileSync(absPath, 'utf8');
		inspectHtmlForbiddenTokens(html, `dist/${relFile}`, errors);

		const cleanHtml = stripScriptsStylesAndComments(html);
		for (const anchorMatch of cleanHtml.matchAll(/<a\b([^>]*)>/gi)) {
			const attrs = parseAttributes(anchorMatch[1]);
			const href = attrs.href;
			if (typeof href !== 'string' || !href.startsWith('/')) {
				continue;
			}
			if (href.startsWith('//')) {
				errors.push(`dist/${relFile}: protocol-relative internal link "${href}" is forbidden`);
				continue;
			}
			internalLinksChecked += 1;
			if (!resolveInternalHref(distDir, href)) {
				errors.push(`dist/${relFile}: internal link "${href}" does not resolve to a file in dist/`);
			}
		}
	}

	for (const textAsset of ['llms.txt', 'robots.txt', 'site.webmanifest']) {
		const assetPath = path.join(distDir, textAsset);
		if (isExistingFile(assetPath)) {
			const assetContent = readFileSync(assetPath, 'utf8');
			checkForbiddenText(assetContent, `dist/${textAsset}`, errors, true);
		}
	}

	return {
		ok: errors.length === 0,
		siteOrigin: normalizedOrigin,
		routesChecked: routes.length,
		extraFilesChecked: EXTRA_REQUIRED_FILES.length,
		htmlFilesChecked: htmlFiles.length,
		internalLinksChecked,
		errors,
	};
}

const isDirectExecution =
	Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
	const defaultDist = fileURLToPath(new URL('../dist', import.meta.url));
	const targetDist = process.argv[2] ? path.resolve(process.argv[2]) : defaultDist;
	const summary = inspectDist(targetDist);
	if (!summary.ok) {
		console.error(JSON.stringify(summary, null, 2));
		process.exit(1);
	}
	console.log(
		JSON.stringify(
			{
				ok: true,
				siteOrigin: summary.siteOrigin,
				routesChecked: summary.routesChecked,
				extraFilesChecked: summary.extraFilesChecked,
				htmlFilesChecked: summary.htmlFilesChecked,
				internalLinksChecked: summary.internalLinksChecked,
			},
			null,
			2,
		),
	);
}

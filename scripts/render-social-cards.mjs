import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const svgSourcePath = path.join(publicDir, 'og-image.svg');
const ogPngPath = path.join(publicDir, 'og-image.png');
const githubPngPath = path.join(publicDir, 'github-social-preview.png');

const rawSvg = readFileSync(svgSourcePath, 'utf8');

const browser = await chromium.launch();

try {
	// 1. Render og-image.png at exact 1200x630 px
	const ogPage = await browser.newPage({
		viewport: { width: 1200, height: 630 },
		deviceScaleFactor: 1,
	});

	const ogHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #020617;
  }
  svg {
    width: 1200px;
    height: 630px;
    display: block;
  }
</style>
</head>
<body>
${rawSvg}
</body>
</html>`;

	await ogPage.setContent(ogHtml, { waitUntil: 'load' });
	const ogBuffer = await ogPage.screenshot({ type: 'png' });
	writeFileSync(ogPngPath, ogBuffer);
	await ogPage.close();
	console.log(`Rendered ${ogPngPath} (1200x630)`);

	// 2. Render github-social-preview.png at exact 1280x640 px
	const ghPage = await browser.newPage({
		viewport: { width: 1280, height: 640 },
		deviceScaleFactor: 1,
	});

	let ghSvg = rawSvg
		.replace('width="1200" height="630" viewBox="0 0 1200 630"', 'width="1280" height="640" viewBox="0 0 1280 640"')
		.replace('x2="1200" y2="630"', 'x2="1280" y2="640"')
		.replaceAll('width="1200" height="630"', 'width="1280" height="640"');

	const marker = '<g transform="translate(72, 74)">';
	ghSvg = ghSvg.replace(marker, '<g transform="translate(40, 5)">' + marker);
	ghSvg = ghSvg.replace('</svg>', '</g></svg>');

	const ghHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1280px;
    height: 640px;
    overflow: hidden;
    background: #020617;
  }
  svg {
    width: 1280px;
    height: 640px;
    display: block;
  }
</style>
</head>
<body>
${ghSvg}
</body>
</html>`;

	await ghPage.setContent(ghHtml, { waitUntil: 'load' });
	const ghBuffer = await ghPage.screenshot({ type: 'png' });
	writeFileSync(githubPngPath, ghBuffer);
	await ghPage.close();
	console.log(`Rendered ${githubPngPath} (1280x640)`);
} finally {
	await browser.close();
}

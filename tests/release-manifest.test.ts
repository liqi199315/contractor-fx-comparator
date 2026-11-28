import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('records the actual pathname of a modified non-ASCII source file in standalone release metadata', () => {
	const repo = mkdtempSync(join(process.cwd(), '.release-test-'));
	const file = '报价说明.md';
	const dist = join(repo, 'dist');
	try {
		const git = (...args: string[]) => execFileSync('git', args, { cwd: repo });
		git('init', '--quiet');
		git('config', 'core.quotePath', 'true');
		writeFileSync(join(repo, '.gitignore'), 'dist/\n');
		writeFileSync(join(repo, file), 'original\n');
		git('add', '--', '.gitignore', file);
		git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgSign=false', 'commit', '--quiet', '-m', 'fixture');
		writeFileSync(join(repo, file), 'pending\n');
		mkdirSync(dist);
		writeFileSync(join(dist, 'sitemap-0.xml'), '<urlset><url><loc>https://contractorfx.com/</loc></url></urlset>');
		writeFileSync(join(dist, 'index.html'), '<html>G-BMWC0P9PW2</html>');

		execFileSync(process.execPath, [resolve('scripts/release-manifest.mjs'), '--project', 'contractorfx', '--dist', 'dist', '--write'], {
			cwd: repo,
			env: { ...process.env, PUBLIC_GA4_MEASUREMENT_ID: 'G-BMWC0P9PW2', PUBLIC_SITE_URL: 'https://contractorfx.com' },
		});
		const manifest = JSON.parse(readFileSync(join(dist, 'release.json'), 'utf8'));
		expect(manifest.source.dirtyPaths).toEqual([file]);
	} finally {
		rmSync(repo, { recursive: true, force: true });
	}
});

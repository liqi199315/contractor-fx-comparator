import { build } from 'esbuild';
import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const binDir = path.join(rootDir, 'bin');
const outFile = path.join(binDir, 'contractor-fx.mjs');

if (!existsSync(binDir)) {
	mkdirSync(binDir, { recursive: true });
}

await build({
	entryPoints: [path.join(rootDir, 'src/cli.ts')],
	bundle: true,
	platform: 'node',
	format: 'esm',
	target: 'node18',
	banner: {
		js: '#!/usr/bin/env node',
	},
	outfile: outFile,
});

chmodSync(outFile, 0o755);
console.log(`CLI built -> ${outFile}`);

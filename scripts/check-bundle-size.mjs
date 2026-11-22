// Pakai: node scripts/check-bundle-size.mjs <dist-dir>   (ADR D-007, PRD §8.1)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, relative, sep } from 'node:path';
import { BUDGET, evaluateBudget } from './lib/bundle-size.mjs';

const distDir = process.argv[2] ?? 'dist';
const gzipSize = (path) => gzipSync(readFileSync(path)).length;

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

function measureAll() {
  const sizes = {};
  for (const file of listFiles(distDir)) {
    sizes[relative(distDir, file).split(sep).join('/')] = gzipSize(file);
  }
  return sizes;
}

function imageErrors(sizes) {
  return Object.entries(sizes)
    .filter(([f, s]) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f) && s > BUDGET.image)
    .map(([f, s]) => `Gambar ${f} ${s} B > batas ${BUDGET.image} B`);
}

const kb = (n) => `${(n / 1024).toFixed(2)} KB`;

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(distDir, '.vite', 'manifest.json'), 'utf8'));
} catch {
  process.stderr.write(`Manifest tidak ditemukan di ${distDir}/.vite — jalankan "npm run build" dulu.\n`);
  process.exit(1);
}

const sizes = measureAll();
const result = evaluateBudget(manifest, sizes);
result.errors.push(...imageErrors(sizes));
process.stdout.write(
  `JS awal : ${kb(result.initialJs)} gzip (batas ${kb(BUDGET.initialJs)})\n` +
    `CSS awal: ${kb(result.initialCss)} gzip (batas ${kb(BUDGET.initialCss)})\n`,
);
if (result.errors.length > 0) {
  process.stderr.write(`GAGAL budget:\n- ${result.errors.join('\n- ')}\n`);
  process.exit(1);
}
process.stdout.write('Budget OK\n');

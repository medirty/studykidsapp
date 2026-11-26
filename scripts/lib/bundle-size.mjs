// Logika murni cek performance budget (PRD §8.1, ADR D-007).
const KB = 1024;

export const BUDGET = {
  initialJs: 120 * KB,
  initialCss: 25 * KB,
  gameChunk: 60 * KB,
  contentJson: 15 * KB,
  image: 50 * KB,
};

export function collectInitialChunks(manifest, entryKey) {
  if (!manifest[entryKey]) throw new Error(`Entry "${entryKey}" tidak ada di manifest`);
  const seen = new Set();
  const visit = (key) => {
    if (seen.has(key) || !manifest[key]) return;
    seen.add(key);
    (manifest[key].imports ?? []).forEach(visit);
  };
  visit(entryKey);
  return seen;
}

function sumSizes(files, sizes) {
  return files.reduce((total, file) => total + (sizes[file] ?? 0), 0);
}

function initialTotals(manifest, sizes, entryKey) {
  const chunks = [...collectInitialChunks(manifest, entryKey)].map((k) => manifest[k]);
  const jsFiles = chunks.map((c) => c.file);
  const cssFiles = [...new Set(chunks.flatMap((c) => c.css ?? []))];
  return { js: sumSizes(jsFiles, sizes), css: sumSizes(cssFiles, sizes) };
}

function chunkErrors(manifest, sizes, prefix, limit, label) {
  return Object.values(manifest)
    .filter((c) => c.src?.startsWith(prefix))
    .filter((c) => (sizes[c.file] ?? 0) > limit)
    .map((c) => `Chunk ${label} ${c.src} ${sizes[c.file]} B > batas ${limit} B`);
}

export function evaluateBudget(manifest, sizes, entryKey = 'index.html', budget = BUDGET) {
  const { js, css } = initialTotals(manifest, sizes, entryKey);
  const errors = [];
  if (js > budget.initialJs) errors.push(`JS awal ${js} B > batas ${budget.initialJs} B`);
  if (css > budget.initialCss) errors.push(`CSS awal ${css} B > batas ${budget.initialCss} B`);
  errors.push(...chunkErrors(manifest, sizes, 'src/games/', budget.gameChunk, 'game'));
  // Satu chunk per file konten (ADR D-014 i).
  errors.push(...chunkErrors(manifest, sizes, 'src/content/', budget.contentJson, 'konten'));
  return { ok: errors.length === 0, initialJs: js, initialCss: css, errors };
}

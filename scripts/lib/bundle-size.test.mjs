import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectInitialChunks, evaluateBudget, BUDGET } from './bundle-size.mjs';

const manifest = {
  'index.html': {
    file: 'assets/index-a.js',
    isEntry: true,
    src: 'index.html',
    imports: ['_vendor.js'],
    dynamicImports: ['src/games/memory.ts'],
    css: ['assets/index-a.css'],
  },
  '_vendor.js': { file: 'assets/vendor-b.js', imports: ['_shared.js'], css: ['assets/vendor-b.css'] },
  '_shared.js': { file: 'assets/shared-c.js' },
  'src/games/memory.ts': { file: 'assets/memory-d.js', isDynamicEntry: true, src: 'src/games/memory.ts' },
  'admin.html': { file: 'assets/admin-e.js', isEntry: true, src: 'admin.html' },
};

test('collectInitialChunks follows static imports recursively, ignores dynamic imports', () => {
  const keys = collectInitialChunks(manifest, 'index.html');
  assert.deepEqual([...keys].sort(), ['_shared.js', '_vendor.js', 'index.html']);
});

test('collectInitialChunks handles import cycles', () => {
  const m = { a: { file: 'a.js', imports: ['b'] }, b: { file: 'b.js', imports: ['a'] } };
  assert.equal(collectInitialChunks(m, 'a').size, 2);
});

test('collectInitialChunks throws when entry missing', () => {
  assert.throws(() => collectInitialChunks(manifest, 'nope.html'), /nope\.html/);
});

const sizes = {
  'assets/index-a.js': 1000,
  'assets/vendor-b.js': 2000,
  'assets/shared-c.js': 3000,
  'assets/index-a.css': 100,
  'assets/vendor-b.css': 200,
  'assets/memory-d.js': 5000,
  'assets/admin-e.js': 999999,
};

test('evaluateBudget passes when under budget; admin entry is not counted', () => {
  const r = evaluateBudget(manifest, sizes);
  assert.equal(r.ok, true);
  assert.equal(r.initialJs, 6000);
  assert.equal(r.initialCss, 300);
});

test('evaluateBudget fails when initial JS exceeds budget', () => {
  const r = evaluateBudget(manifest, { ...sizes, 'assets/shared-c.js': BUDGET.initialJs + 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /JS awal/);
});

test('evaluateBudget fails when initial CSS exceeds budget', () => {
  const r = evaluateBudget(manifest, { ...sizes, 'assets/index-a.css': BUDGET.initialCss + 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /CSS awal/);
});

test('evaluateBudget fails when a game chunk exceeds budget', () => {
  const r = evaluateBudget(manifest, { ...sizes, 'assets/memory-d.js': BUDGET.gameChunk + 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /memory/);
});

test('evaluateBudget fails when a content chunk exceeds 15 KB gzip (D-014 i)', () => {
  const m = {
    ...manifest,
    'src/content/math/g1/u1.json': { file: 'assets/u1-f.js', isDynamicEntry: true, src: 'src/content/math/g1/u1.json' },
  };
  assert.equal(evaluateBudget(m, { ...sizes, 'assets/u1-f.js': BUDGET.contentJson }).ok, true);
  const r = evaluateBudget(m, { ...sizes, 'assets/u1-f.js': BUDGET.contentJson + 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join('\n'), /konten src\/content\/math\/g1\/u1\.json/);
});

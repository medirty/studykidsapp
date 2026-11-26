// Every file in src/content/ is checked here automatically (ADR D-014 a, i).
import { describe, expect, it } from 'vitest';
import settings from '../services/public-settings.local.json';
import type { SubjectId } from '../services/types';
import { loadGradeIndex, loadUnit } from './content';
import { checkContentSet, checkIndex, checkUnit } from './content-check';
import type { GradeIndex, Unit } from './types';

const units = import.meta.glob<Unit>('../content/*/g*/u*.json', { eager: true, import: 'default' });
const indexes = import.meta.glob<GradeIndex>('../content/*/g*/index.json', {
  eager: true,
  import: 'default',
});
const raw = import.meta.glob<string>('../content/**/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
});

async function gzipSize(text: string): Promise<number> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}

describe('content files', () => {
  it('has content', () => {
    expect(Object.keys(units).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(units))('%s matches the schema', (path, unit) => {
    expect(checkUnit(unit, path)).toEqual([]);
  });

  it.each(Object.entries(indexes))('%s matches the schema', (path, index) => {
    expect(checkIndex(index, path)).toEqual([]);
  });

  it('ships demo units only, each listed in its index, skill ids unique (FR-10)', () => {
    const demo = { ...settings.demo, subjects: settings.demo.subjects as SubjectId[] };
    expect(checkContentSet(units, indexes, demo)).toEqual([]);
  });

  it.each(Object.entries(raw))('%s is ≤ 15 KB gzip (§8.1)', async (_path, text) => {
    expect(await gzipSize(text)).toBeLessThanOrEqual(15 * 1024);
  });
});

describe('content loader', () => {
  it('loads a unit and a grade index by id', async () => {
    expect((await loadUnit('math.g1.u1'))?.id).toBe('math.g1.u1');
    expect((await loadGradeIndex('math', 1))?.id).toBe('math.g1');
  });

  it('returns null for locked or unknown units', async () => {
    expect(await loadUnit('math.g1.u99')).toBeNull();
    expect(await loadUnit('bogus')).toBeNull();
    expect(await loadGradeIndex('music', 6)).toBeNull();
  });
});

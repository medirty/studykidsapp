import { describe, expect, it } from 'vitest';
import { createRng, cyrb53, fingerprint, rngFor } from './rng';

describe('cyrb53', () => {
  it('matches the reference values of the public-domain algorithm', () => {
    expect(cyrb53('a')).toBe(7929297801672961);
    expect(cyrb53('b')).toBe(8684336938537663);
    expect(cyrb53('revenge')).toBe(4051478007546757);
    expect(cyrb53('revenue')).toBe(8309097637345594);
  });
});

describe('createRng (mulberry32)', () => {
  it('is deterministic per seed and differs between seeds', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 5 }, () => a.next());
    expect(Array.from({ length: 5 }, () => b.next())).toEqual(seqA);
    expect(createRng(43).next()).not.toBe(seqA[0]);
  });

  it('next() stays in [0, 1) and int() in the inclusive range', () => {
    const rng = createRng(7);
    const ints = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const x = rng.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      ints.add(rng.int(3, 6));
    }
    expect([...ints].sort()).toEqual([3, 4, 5, 6]);
  });

  it('pick() returns an element and throws on an empty list', () => {
    const rng = createRng(1);
    expect(['x', 'y']).toContain(rng.pick(['x', 'y']));
    expect(() => rng.pick([])).toThrow();
  });

  it('shuffle() returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = createRng(5).shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...out].sort()).toEqual(input);
    expect(out).not.toEqual(input);
  });
});

describe('rngFor', () => {
  it('seeds from profileId|skillId|counter|index', () => {
    expect(rngFor('p1', 'math.g1.u1.s1', 3, 0).next()).toBe(
      createRng(cyrb53('p1|math.g1.u1.s1|3|0') >>> 0).next(),
    );
    expect(rngFor('p1', 's', 3, 0).next()).not.toBe(rngFor('p1', 's', 3, 1).next());
  });
});

describe('fingerprint', () => {
  it('is hex, independent of key order, and depends on type and values', () => {
    const f = fingerprint('arith.add', { a: 3, b: 4 });
    expect(f).toMatch(/^[0-9a-f]+$/);
    expect(fingerprint('arith.add', { b: 4, a: 3 })).toBe(f);
    expect(fingerprint('arith.add', { a: 4, b: 3 })).not.toBe(f);
    expect(fingerprint('arith.sub', { a: 3, b: 4 })).not.toBe(f);
  });
});

import { describe, expect, it } from 'vitest';
import { createRng } from '../../rng';
import type { Level, Question, QuestionOf } from '../../types';
import { add, parseNumber, type AddParams } from './add';

const q = (seed: number, params: AddParams, level: Level, format: 'mcq' | 'input' | 'tf') =>
  ({
    ...add.generate(createRng(seed), params, level, format),
    skillId: 's',
    generator: 'arith.add',
    fingerprint: 'f',
  }) as Question;

const sums = (params: AddParams, level: Level) =>
  Array.from(
    { length: 300 },
    (_, i) => q(i, params, level, 'input').core as { a: number; b: number },
  );

describe('arith.add', () => {
  it('respects digits and level (level 1 = one-digit second addend)', () => {
    for (const { a, b } of sums({ digits: 2 }, 1)) {
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeLessThanOrEqual(9);
    }
    expect(sums({ digits: 2 }, 2).some(({ b }) => b >= 10)).toBe(true);
  });

  it('regroup: true always carries, false never carries', () => {
    const carries = (a: number, b: number) =>
      (a % 10) + (b % 10) >= 10 || (a % 100) + (b % 100) >= 100;
    expect(sums({ digits: 2, regroup: true }, 3).every(({ a, b }) => carries(a, b))).toBe(true);
    expect(sums({ digits: 2, regroup: false }, 3).every(({ a, b }) => !carries(a, b))).toBe(true);
  });

  it('mcq: 4 unique choices, correct one included, "forgot to carry" distractor first-class', () => {
    for (let i = 0; i < 200; i++) {
      const m = q(i, { digits: 2, regroup: true }, 2, 'mcq') as QuestionOf<'mcq'>;
      const { a, b } = m.core as { a: number; b: number };
      const ids = m.choices.map((c) => c.id);
      expect(new Set(ids).size).toBe(4);
      expect(ids).toContain(String(a + b));
      const noCarry = Number(
        String(a)
          .padStart(3, '0')
          .split('')
          .map((d, k) => (Number(d) + Number(String(b).padStart(3, '0')[k])) % 10)
          .join(''),
      );
      expect(ids).toContain(String(noCarry));
      expect(ids.every((id) => Number(id) >= 0)).toBe(true);
    }
  });

  it('validates from core, not from q.answer', () => {
    const m = q(1, { digits: 1 }, 1, 'mcq');
    const right = String(Number(m.core.a) + Number(m.core.b));
    expect(add.validate({ ...m, answer: 'bogus' } as Question, right, { digits: 1 })).toBe(true);
    expect(add.validate(m, String(Number(right) + 1), { digits: 1 })).toBe(false);
  });

  it('input accepts spaces and comma decimals, rejects empty text', () => {
    const m = q(2, { digits: 1 }, 1, 'input');
    const right = Number(m.core.a) + Number(m.core.b);
    expect(add.validate(m, ` ${right} `, { digits: 1 })).toBe(true);
    expect(add.validate(m, `${right},0`, { digits: 1 })).toBe(true);
    expect(add.validate(m, '', { digits: 1 })).toBe(false);
    expect(parseNumber('   ')).toBeNaN();
  });

  it('tf shows a right or wrong sum and validates both ways', () => {
    const tfs = Array.from(
      { length: 100 },
      (_, i) => q(i, { digits: 1 }, 1, 'tf') as QuestionOf<'tf'>,
    );
    expect(new Set(tfs.map((t) => t.answer))).toEqual(new Set([true, false]));
    for (const t of tfs) {
      expect(add.validate(t, t.answer, { digits: 1 })).toBe(true);
      expect(add.validate(t, !t.answer, { digits: 1 })).toBe(false);
      expect(t.prompt.id).toBe(`${t.core.a} + ${t.core.b} = ${t.core.shown}`);
    }
  });

  it('throws on params that can never be satisfied', () => {
    expect(() => add.generate(createRng(1), { digits: 0 }, 1, 'mcq')).toThrow(/arith.add/);
    expect(() => add.generate(createRng(1), { digits: 1 }, 1, 'draw')).toThrow(/arith.add/);
  });
});

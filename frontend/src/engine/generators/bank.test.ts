import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import type { BankItem, BankParams, Level, Question, QuestionOf } from '../types';
import { bank } from './bank';

const t = (s: string) => ({ id: s, en: s });
const o = (s: string) => ({ text: t(s) });
const base = (id: string) => ({ id, prompt: t(`prompt ${id}`) });

const items: BankItem[] = [
  {
    ...base('m1'),
    format: 'mcq',
    correct: [o('A'), o('A2')],
    wrong: [o('B'), o('C'), o('D'), o('E')],
  },
  { ...base('m2'), format: 'mcq', level: 3, correct: [o('X')], wrong: [o('Y')] },
  { ...base('l1'), format: 'listen', correct: [o('cat')], wrong: [o('cap')], speak: t('cat') },
  { ...base('l2'), format: 'listen', correct: [o('dog')], wrong: [o('dot')] },
  { ...base('p1'), format: 'tap', correct: [o('▲'), o('△')], wrong: [o('●'), o('■')] },
  { ...base('i1'), format: 'input', accept: ['Jakarta', 'DKI Jakarta'] },
  { ...base('t1'), format: 'tf', answer: false },
  { ...base('o1'), format: 'order', sequence: [o('1'), o('2'), o('3'), o('4')] },
  {
    ...base('h1'),
    format: 'match',
    pairs: [
      [o('a'), o('1')],
      [o('b'), o('2')],
      [o('c'), o('3')],
    ],
  },
  {
    ...base('d1'),
    format: 'dragdrop',
    groups: [
      { target: o('fruit'), items: [o('apple'), o('mango')] },
      { target: o('animal'), items: [o('cat')] },
    ],
  },
  { ...base('w1'), format: 'draw', template: 'tpl.house' },
];
const params: BankParams = { items };

function gen<F extends BankItem['format']>(format: F, seed = 1, level: Level = 3) {
  const g = bank.generate(createRng(seed), params, level, format);
  return { ...g, skillId: 's', generator: 'bank', fingerprint: 'f' } as unknown as QuestionOf<F>;
}
const ok = (q: Question, given: unknown) => bank.validate(q, given as never, params);

describe('bank generator', () => {
  it('core = item id; filters by format and by level (fallback to all when none fits)', () => {
    const levelOne = Array.from({ length: 50 }, (_, i) => gen('mcq', i, 1).core.item);
    expect(new Set(levelOne)).toEqual(new Set(['m1']));
    const levelThree = Array.from({ length: 50 }, (_, i) => gen('mcq', i, 3).core.item);
    expect(new Set(levelThree)).toEqual(new Set(['m1', 'm2']));
    const onlyHigh = { items: [items[1] as BankItem] };
    expect(bank.generate(createRng(1), onlyHigh, 1, 'mcq').core.item).toBe('m2');
    expect(() => bank.generate(createRng(1), params, 1, 'input')).not.toThrow();
    expect(() => bank.generate(createRng(1), { items: [] }, 1, 'mcq')).toThrow();
  });

  it('mcq: one correct + up to 3 wrong, shuffled; exactly one choice validates', () => {
    const orders = new Set<string>();
    for (let s = 0; s < 40; s++) {
      const q = gen('mcq', s, 1);
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter((c) => ok(q, c.id))).toHaveLength(1);
      expect(ok(q, q.answer)).toBe(true);
      orders.add(q.choices.map((c) => c.id).join());
    }
    expect(orders.size).toBeGreaterThan(5);
  });

  it('listen speaks `speak`, falling back to the prompt', () => {
    const qs = Array.from({ length: 20 }, (_, i) => gen('listen', i));
    expect(qs.find((q) => q.core.item === 'l1')?.speak).toEqual(t('cat'));
    expect(qs.find((q) => q.core.item === 'l2')?.speak).toEqual(t('prompt l2'));
    for (const q of qs) expect(ok(q, q.answer)).toBe(true);
  });

  it('tap: the full set of correct ids validates, any subset or wrong pick does not', () => {
    const q = gen('tap');
    expect(q.choices).toHaveLength(4);
    expect(ok(q, q.answer)).toBe(true);
    expect(ok(q, [...q.answer].reverse())).toBe(true);
    expect(ok(q, [q.answer[0]])).toBe(false);
    expect(ok(q, [...q.answer, 'w0'])).toBe(false);
    expect(ok(q, 'c0')).toBe(false);
  });

  it('input: trim + case-insensitive against accept[]', () => {
    const q = gen('input');
    expect(q.inputMode).toBe('text');
    expect(ok(q, '  dki JAKARTA ')).toBe(true);
    expect(ok(q, 'Bandung')).toBe(false);
    expect(ok(q, true)).toBe(false);
  });

  it('tf, draw', () => {
    const tf = gen('tf');
    expect(ok(tf, false)).toBe(true);
    expect(ok(tf, true)).toBe(false);
    const draw = gen('draw');
    expect(draw.template).toBe('tpl.house');
    expect(ok(draw, 'done')).toBe(true);
  });

  it('order: shown shuffled, answer is the original sequence', () => {
    const q = gen('order', 3);
    expect(q.answer).toEqual(['o0', 'o1', 'o2', 'o3']);
    expect(ok(q, q.answer)).toBe(true);
    expect(ok(q, ['o1', 'o0', 'o2', 'o3'])).toBe(false);
    expect(ok(q, ['o0', 'o1', 'o2'])).toBe(false);
  });

  it('match and dragdrop: maps validated as a whole', () => {
    const m = gen('match');
    expect(m.answer).toEqual({ l0: 'r0', l1: 'r1', l2: 'r2' });
    expect(ok(m, m.answer)).toBe(true);
    expect(ok(m, { l0: 'r1', l1: 'r0', l2: 'r2' })).toBe(false);
    expect(ok(m, { l0: 'r0', l1: 'r1' })).toBe(false);
    expect(ok(m, ['r0'])).toBe(false);
    const d = gen('dragdrop');
    expect(d.targets.map((x) => x.id).sort()).toEqual(['t0', 't1']);
    expect(d.answer).toEqual({ g0i0: 't0', g0i1: 't0', g1i0: 't1' });
    expect(ok(d, d.answer)).toBe(true);
    expect(ok(d, { ...d.answer, g1i0: 't0' })).toBe(false);
  });

  it('rejects unknown items and format mismatch', () => {
    const q = gen('tf');
    expect(ok({ ...q, core: { item: 'nope' } }, false)).toBe(false);
    expect(ok({ ...q, format: 'mcq' } as unknown as Question, false)).toBe(false);
  });
});

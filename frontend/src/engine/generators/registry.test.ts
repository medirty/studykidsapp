import { describe, expect, it } from 'vitest';
import { fingerprint, rngFor } from '../rng';
import type { GeneratorRef } from '../types';
import { checkAnswer, getGenerator, makeQuestion } from './registry';

const ref: GeneratorRef = { type: 'arith.add', params: { digits: 1 }, formats: ['mcq', 'input'] };

describe('generator registry', () => {
  it('knows arith.add and bank, throws on unknown types', () => {
    expect(getGenerator('arith.add').type).toBe('arith.add');
    expect(getGenerator('bank').type).toBe('bank');
    expect(() => getGenerator('nope')).toThrow(/nope/);
  });

  it('makeQuestion adds skillId, generator and a format-independent fingerprint', () => {
    const mcq = makeQuestion('math.g1.u1.s1', ref, rngFor('p', 's', 0, 0), 1, 'mcq');
    const input = makeQuestion('math.g1.u1.s1', ref, rngFor('p', 's', 0, 0), 1, 'input');
    expect(mcq).toMatchObject({ skillId: 'math.g1.u1.s1', generator: 'arith.add' });
    expect(mcq.fingerprint).toBe(fingerprint('arith.add', mcq.core));
    expect(input.core).toEqual(mcq.core);
    expect(input.fingerprint).toBe(mcq.fingerprint);
  });

  it('checkAnswer validates through the generator with the ref params', () => {
    const q = makeQuestion('s', ref, rngFor('x'), 2, 'input');
    expect(checkAnswer(q, q.answer, ref)).toBe(true);
    expect(checkAnswer(q, '-1', ref)).toBe(false);
  });
});

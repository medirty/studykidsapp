// Generator harness (ADR D-014 j, AC FR-5): runs every skill in src/content/ automatically, plus a bank
// fixture that covers all 9 formats. New content is tested the moment its JSON file exists.
import { describe, expect, it } from 'vitest';
import { checkAnswer, makeQuestion } from './generators/registry';
import { rngFor } from './rng';
import type { BankItem, BankParams, GeneratorRef, Level, Question, Skill, Unit } from './types';

const TRIALS = 1000;
const units = import.meta.glob<Unit>('../content/*/g*/u*.json', { eager: true, import: 'default' });

const t = (s: string) => ({ id: s, en: s });
const o = (s: string) => ({ text: t(s) });
const fixtureItems: BankItem[] = [
  ...['a', 'b', 'c', 'd', 'e', 'f'].map((x, i): BankItem => ({
    id: `m${x}`,
    format: 'mcq',
    level: ((i % 3) + 1) as Level,
    prompt: t(`pick ${x}`),
    correct: [o(x)],
    wrong: [o('1'), o('2'), o('3'), o('4')],
  })),
  ...['l1', 'l2'].map((id): BankItem => ({
    id,
    format: 'listen',
    prompt: t(id),
    correct: [o('y')],
    wrong: [o('n')],
  })),
  ...['p1', 'p2'].map((id): BankItem => ({
    id,
    format: 'tap',
    prompt: t(id),
    correct: [o('y'), o('y2')],
    wrong: [o('n')],
  })),
  ...['i1', 'i2'].map((id): BankItem => ({ id, format: 'input', prompt: t(id), accept: ['Ya'] })),
  ...['t1', 't2'].map((id, i): BankItem => ({ id, format: 'tf', prompt: t(id), answer: i === 0 })),
  ...['o1', 'o2'].map((id): BankItem => ({
    id,
    format: 'order',
    prompt: t(id),
    sequence: [o('1'), o('2'), o('3')],
  })),
  {
    id: 'h1',
    format: 'match',
    prompt: t('h1'),
    pairs: [
      [o('a'), o('1')],
      [o('b'), o('2')],
    ],
  },
  {
    id: 'd1',
    format: 'dragdrop',
    prompt: t('d1'),
    groups: [
      { target: o('x'), items: [o('1')] },
      { target: o('y'), items: [o('2')] },
    ],
  },
  ...['w1', 'w2'].map((id): BankItem => ({ id, format: 'draw', prompt: t(id) })),
];
const fixture: Skill = {
  id: 'fixture.g1.u1.s1',
  title: t('fixture'),
  explain: t('fixture'),
  generators: [
    {
      type: 'bank',
      params: { items: fixtureItems } satisfies BankParams,
      formats: ['mcq', 'listen', 'tap', 'input', 'tf', 'order', 'match', 'dragdrop', 'draw'],
    },
  ],
};
const skills = [...Object.values(units).flatMap((u) => u.skills), fixture];

const level = (i: number) => ((i % 3) + 1) as Level;
const ask = (skill: Skill, ref: GeneratorRef, format: Question['format'], i: number) =>
  makeQuestion(skill.id, ref, rngFor('harness', skill.id, i), level(i), format);

/** Everything that is wrong with one question, as readable strings. */
function problems(q: Question, ref: GeneratorRef): string[] {
  const ok = (given: unknown) => checkAnswer(q, given as Question['answer'], ref);
  const out = ok(q.answer) ? [] : [`answer fails validate: ${q.fingerprint}`];
  if (q.format === 'mcq' || q.format === 'listen' || q.format === 'tap') {
    const ids = q.choices.map((c) => c.id);
    if (new Set(ids).size !== ids.length) out.push(`duplicate choice ids ${ids.join()}`);
    if (q.format !== 'tap' && (ids.length < 2 || ids.length > 4)) out.push(`${ids.length} choices`);
    if (q.format !== 'tap' && ids.filter((id) => ok(id)).length !== 1)
      out.push(`not exactly 1 right: ${ids.join()}`);
    if (q.format === 'tap' && ids.some((id) => !q.answer.includes(id) && ok([id])))
      out.push('wrong tap passes');
  }
  if (q.format === 'tf' && ok(!q.answer)) out.push('tf: opposite answer passes');
  return out;
}

const generatorCases = skills.flatMap((skill) =>
  skill.generators
    .filter((ref) => ref.type !== 'bank')
    .flatMap((ref) => ref.formats.map((format) => ({ skill, ref, format }))),
);

describe.each(generatorCases)('$skill.id $ref.type $format', ({ skill, ref, format }) => {
  const qs = Array.from({ length: TRIALS }, (_, i) => ask(skill, ref, format, i));

  it('≥ 50 unique fingerprints per 1,000 trials', () => {
    expect(new Set(qs.map((q) => q.fingerprint)).size).toBeGreaterThanOrEqual(50);
  });

  it('every question passes its own checks', () => {
    expect(qs.flatMap((q) => problems(q, ref))).toEqual([]);
  });

  it('same seed → same question', () => {
    expect(ask(skill, ref, format, 7)).toEqual(qs[7]);
  });
});

const bankSkills = skills.filter((s) => s.generators.some((ref) => ref.type === 'bank'));

describe.each(bankSkills)('bank $id', (skill) => {
  const refs = skill.generators.filter((ref) => ref.type === 'bank');
  const items = refs.flatMap((ref) => (ref.params as unknown as BankParams).items);
  const runs = Array.from({ length: TRIALS }, (_, i) => {
    const ref = refs[i % refs.length] as GeneratorRef;
    const format = ref.formats[Math.floor(i / 3) % ref.formats.length] as Question['format'];
    return { ref, q: ask(skill, ref, format, i) };
  });

  it('≥ 20 base items with unique ids (§6.5)', () => {
    expect(items.length).toBeGreaterThanOrEqual(20);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('every item appears and validates', () => {
    expect(new Set(runs.map(({ q }) => q.core.item)).size).toBe(items.length);
    expect(runs.flatMap(({ q, ref }) => problems(q, ref))).toEqual([]);
  });

  it('≥ 50 unique shown variants unless only draw/tf items', () => {
    const fixedOnly = items.every((i) => i.format === 'draw' || i.format === 'tf');
    const variants = new Set(runs.map(({ q }) => JSON.stringify(q))).size;
    expect(variants).toBeGreaterThanOrEqual(fixedOnly ? items.length : 50);
  });

  it('same seed → same question', () => {
    const { ref, q } = runs[11] as (typeof runs)[number];
    expect(ask(skill, ref, q.format, 11)).toEqual(q);
  });
});

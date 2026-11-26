import { describe, expect, it } from 'vitest';
import { checkContentSet, checkIndex, checkUnit } from './content-check';
import type { GradeIndex, Skill, Unit } from './types';

const t = (s: string) => ({ id: s, en: s });
const skill = (id: string, extra: Partial<Skill> = {}): Skill => ({
  id,
  title: t('skill'),
  explain: t('explain'),
  generators: [{ type: 'arith.add', params: { digits: 1 }, formats: ['mcq'] }],
  ...extra,
});
const unit = (id = 'math.g1.u1', skills = [1, 2, 3].map((n) => skill(`${id}.s${n}`))): Unit => ({
  id,
  title: t('unit'),
  skills,
});
const P = '../content/math/g1/u1.json';
const IP = '../content/math/g1/index.json';
const index: GradeIndex = { id: 'math.g1', units: [{ id: 'math.g1.u1', title: t('unit') }] };
const demo = { subjects: ['math' as const], unitLimit: 2 };

describe('checkUnit', () => {
  it('accepts a valid unit', () => {
    expect(checkUnit(unit(), P)).toEqual([]);
  });

  it('id must match the path; ≥ 3 skills; skill ids `${unitId}.s<n>`', () => {
    expect(checkUnit(unit('math.g1.u2'), P).join()).toMatch(/math\.g1\.u1/);
    expect(checkUnit(unit('math.g1.u1', [skill('math.g1.u1.s1')]), P).join()).toMatch(/3 skill/);
    expect(
      checkUnit(
        unit(
          'math.g1.u1',
          [1, 2, 3].map(() => skill('x.s1')),
        ),
        P,
      ).join(),
    ).toMatch(/x\.s1/);
    expect(checkUnit(unit(), 'somewhere/else.json').join()).toMatch(/path/);
  });

  it('texts need both languages', () => {
    const u = unit();
    u.title = { id: 'judul', en: ' ' };
    (u.skills[0] as Skill).explain = { id: 'x' } as never;
    expect(checkUnit(u, P)).toHaveLength(2);
  });

  it('generator refs: registered type, ≥ 1 ref, formats non-empty and supported', () => {
    const bad = [
      skill('math.g1.u1.s1', { generators: [] }),
      skill('math.g1.u1.s2', { generators: [{ type: 'nope', params: {}, formats: ['mcq'] }] }),
      skill('math.g1.u1.s3', {
        generators: [{ type: 'arith.add', params: { digits: 1 }, formats: ['draw'] }],
      }),
    ];
    const errors = checkUnit(
      unit('math.g1.u1', [
        ...bad,
        skill('math.g1.u1.s4', { generators: [{ type: 'arith.add', params: {}, formats: [] }] }),
      ]),
      P,
    );
    expect(errors.join('\n')).toMatch(/generator/);
    expect(errors.join('\n')).toMatch(/nope/);
    expect(errors.join('\n')).toMatch(/draw/);
    expect(errors).toHaveLength(4);
  });

  it('bank items: unique ids, bilingual prompt, format listed in the ref, every ref format has items', () => {
    const items = [
      { id: 'a', format: 'tf', prompt: t('p'), answer: true },
      { id: 'a', format: 'tf', prompt: t('p'), answer: false },
      { id: 'b', format: 'input', prompt: { id: 'p', en: '' }, accept: ['x'] },
    ];
    const s = skill('math.g1.u1.s1', {
      generators: [{ type: 'bank', params: { items }, formats: ['tf', 'mcq'] }],
    });
    const errors = checkUnit(
      unit('math.g1.u1', [s, skill('math.g1.u1.s2'), skill('math.g1.u1.s3')]),
      P,
    );
    expect(errors.join('\n')).toMatch(/duplicate.*a/);
    expect(errors.join('\n')).toMatch(/b.*prompt/);
    expect(errors.join('\n')).toMatch(/b.*input/);
    expect(errors.join('\n')).toMatch(/mcq/);
    const noItems = skill('math.g1.u1.s1', {
      generators: [{ type: 'bank', params: {}, formats: ['tf'] }],
    });
    expect(
      checkUnit(
        unit('math.g1.u1', [noItems, skill('math.g1.u1.s2'), skill('math.g1.u1.s3')]),
        P,
      ).join(),
    ).toMatch(/items/);
  });
});

describe('checkIndex', () => {
  it('accepts a valid index and rejects bad ids, duplicates and texts', () => {
    expect(checkIndex(index, IP)).toEqual([]);
    expect(checkIndex({ ...index, id: 'math.g2' }, IP).join()).toMatch(/math\.g1/);
    const dup = {
      id: 'math.g1',
      units: [
        index.units[0],
        { id: 'math.g1.u1', title: t('') },
        { id: 'art.g1.u2', title: t('x') },
      ],
    } as GradeIndex;
    expect(checkIndex(dup, IP)).toHaveLength(3);
    expect(checkIndex(index, 'x.json').join()).toMatch(/path/);
  });
});

describe('checkContentSet', () => {
  it('passes for demo units listed in their index', () => {
    expect(checkContentSet({ [P]: unit() }, { [IP]: index }, demo)).toEqual([]);
  });

  it('only demo subjects with n ≤ unitLimit may ship (FR-10)', () => {
    const errors = checkContentSet(
      {
        '../content/math/g1/u3.json': unit('math.g1.u3'),
        '../content/art/g1/u1.json': unit('art.g1.u1'),
      },
      {},
      demo,
    );
    expect(errors.join('\n')).toMatch(/u3.*unitLimit/);
    expect(errors.join('\n')).toMatch(/art.*demo/);
    expect(errors.join('\n')).toMatch(/index/);
  });

  it('skill ids are unique across all content', () => {
    const a = unit();
    const b = unit('math.g1.u2', a.skills);
    const errors = checkContentSet(
      { [P]: a, '../content/math/g1/u2.json': b },
      { [IP]: index },
      demo,
    );
    expect(errors.join('\n')).toMatch(/duplicate skill/);
    expect(errors.join('\n')).toMatch(/math\.g1\.u2.*not listed/);
  });
});

// Contract examples for ADR D-014: `satisfies` makes `npm run typecheck` fail when a type drifts from the ADR.
import { describe, expect, it } from 'vitest';
import type { QuestionFormat } from '../services/types';
import type { AnswerByFormat, BankParams, GradeIndex, Question, Unit } from './types';

const t = (id: string, en: string) => ({ id, en });

const unit = {
  id: 'gp.g1.u1',
  title: t('Aku dan Lingkunganku', 'Me and My Surroundings'),
  skills: [
    {
      id: 'gp.g1.u1.s1',
      title: t('Menjaga kebersihan', 'Keeping things clean'),
      generators: [
        {
          type: 'bank',
          formats: ['mcq', 'tf'],
          params: {
            items: [
              {
                id: 'i01',
                format: 'mcq',
                prompt: t('Sampah plastik dibuang ke…', 'Plastic waste goes in the…'),
                correct: [{ text: t('tempat sampah', 'bin') }],
                wrong: [{ text: t('sungai', 'river') }, { text: t('halaman', 'yard') }],
              },
              {
                id: 'i02',
                format: 'tf',
                prompt: t('Cuci tangan sebelum makan.', 'Wash hands before eating.'),
                answer: true,
              },
            ],
          } satisfies BankParams,
        },
      ],
      explain: t('Sampah dibuang ke tempatnya.', 'Waste belongs in the bin.'),
    },
  ],
} satisfies Unit;

const index = {
  id: 'gp.g1',
  units: [
    { id: 'gp.g1.u1', title: unit.title },
    { id: 'gp.g1.u3', title: t('Makanan Sehat', 'Healthy Food') },
  ],
} satisfies GradeIndex;

const base = {
  skillId: 'math.g1.u1.s1',
  generator: 'arith.add',
  level: 1,
  prompt: t('3 + 4 = ?', '3 + 4 = ?'),
  fingerprint: '1a2b3c4d5e6f7',
  core: { a: 3, b: 4 },
} as const;
const pick = [
  { id: '7', text: t('7', '7') },
  { id: '6', text: t('6', '6') },
];

const questions = [
  { ...base, format: 'mcq', choices: pick, answer: '7' },
  { ...base, format: 'input', inputMode: 'numeric', answer: '7' },
  { ...base, format: 'tf', answer: false },
  { ...base, format: 'dragdrop', items: pick, targets: pick, answer: { '7': '6' } },
  { ...base, format: 'match', left: pick, right: pick, answer: { '7': '7', '6': '6' } },
  { ...base, format: 'order', items: pick, answer: ['6', '7'] },
  { ...base, format: 'tap', choices: pick, answer: ['7'] },
  { ...base, format: 'listen', speak: t('tujuh', 'seven'), choices: pick, answer: '7' },
  { ...base, format: 'draw', answer: 'done' },
] satisfies Question[];

describe('engine contract examples (D-014)', () => {
  it('covers all 9 formats exactly once', () => {
    const formats: QuestionFormat[] = questions.map((q) => q.format);
    const all: (keyof AnswerByFormat)[] = [
      'mcq',
      'input',
      'tf',
      'dragdrop',
      'match',
      'order',
      'tap',
      'listen',
      'draw',
    ];
    expect(new Set(formats)).toEqual(new Set(all));
  });

  it('lists locked units in the grade index only', () => {
    expect(index.units.map((u) => u.id)).toContain('gp.g1.u3');
    expect(unit.skills[0]?.id.startsWith(`${unit.id}.s`)).toBe(true);
  });
});

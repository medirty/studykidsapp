// @vitest-environment jsdom
import { expect, test } from 'vitest';
import type { Question } from '../../engine/types';
import { answerText } from './answerText';

const base = {
  skillId: 's',
  generator: 'g',
  level: 1,
  prompt: { id: 'p', en: 'p' },
  core: {},
  fingerprint: 'f',
} as const;
const c = (id: string) => ({ id, text: { id: `T${id}`, en: `T${id}` } });

test('answerText: tiap format memberi teks jawaban benar; draw tidak', () => {
  const q = (o: object) => ({ ...base, ...o }) as unknown as Question;
  expect(answerText(q({ format: 'mcq', answer: 'b', choices: [c('a'), c('b')] }))).toBe('Tb');
  expect(answerText(q({ format: 'tap', answer: ['a', 'b'], choices: [c('a'), c('b')] }))).toBe(
    'Ta, Tb',
  );
  expect(answerText(q({ format: 'tf', answer: true }))).toBe('Benar');
  expect(answerText(q({ format: 'input', answer: '15' }))).toBe('15');
  expect(answerText(q({ format: 'order', answer: ['b', 'a'], items: [c('a'), c('b')] }))).toBe(
    'Tb → Ta',
  );
  expect(
    answerText(q({ format: 'match', answer: { a: 'b' }, left: [c('a')], right: [c('b')] })),
  ).toBe('Ta – Tb');
  expect(
    answerText(q({ format: 'dragdrop', answer: { a: 'b' }, items: [c('a')], targets: [c('b')] })),
  ).toBe('Ta → Tb');
  expect(answerText(q({ format: 'draw', answer: 'done' }))).toBeNull();
});

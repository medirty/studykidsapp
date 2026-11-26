// Generator registry (ADR D-014 b): content JSON names a type, this maps it to code.
import { fingerprint } from '../rng';
import type { Answer, Generator, GeneratorRef, Level, Question, Rng } from '../types';
import type { QuestionFormat } from '../../services/types';
import { bank } from './bank';
import { add } from './math/add';

const generators: Record<string, Generator<unknown>> = {
  [add.type]: add as Generator<unknown>,
  [bank.type]: bank as Generator<unknown>,
};

export function getGenerator(type: string): Generator<unknown> {
  const gen = generators[type];
  if (!gen) throw new Error(`Unknown generator type "${type}"`);
  return gen;
}

export function makeQuestion(
  skillId: string,
  ref: GeneratorRef,
  rng: Rng,
  level: Level,
  format: QuestionFormat,
): Question {
  const q = getGenerator(ref.type).generate(rng, ref.params, level, format);
  return {
    ...q,
    skillId,
    generator: ref.type,
    fingerprint: fingerprint(ref.type, q.core),
  } as Question;
}

/** One source of truth for grading: the UI and the tests both call this. */
export function checkAnswer(q: Question, given: Answer, ref: GeneratorRef): boolean {
  return getGenerator(ref.type).validate(q, given, ref.params);
}

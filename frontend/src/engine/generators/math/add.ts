// `arith.add`: a + b with distractors from common mistakes (FR-5 rule 4, ADR D-014 b).
import type { Generator, LocalizedText, Level, Rng } from '../../types';

export interface AddParams {
  digits: number; // 1–3, size of the first addend
  regroup?: boolean; // true = must carry, false = never carries, absent = either
}

type Core = { a: number; b: number };

const same = (s: string): LocalizedText => ({ id: s, en: s });
const range = (digits: number) =>
  [digits === 1 ? 0 : 10 ** (digits - 1), 10 ** digits - 1] as const;

/** Numeric answer typed by a child: trims, accepts `,` as decimal point; NaN when empty. */
export function parseNumber(text: string): number {
  const s = text.trim().replace(',', '.');
  return s === '' ? NaN : Number(s);
}

/** Column-wise sum without carrying: the "forgot to carry" answer. */
function noCarrySum(a: number, b: number): number {
  let out = 0;
  for (let place = 1; a > 0 || b > 0; place *= 10, a = Math.floor(a / 10), b = Math.floor(b / 10)) {
    out += (((a % 10) + (b % 10)) % 10) * place;
  }
  return out;
}

function operands(rng: Rng, { digits, regroup }: AddParams, level: Level): Core {
  if (!Number.isInteger(digits) || digits < 1 || digits > 3)
    throw new Error('arith.add: digits 1–3');
  const [lo, hi] = range(digits);
  const [blo, bhi] = range(level === 1 ? 1 : digits);
  for (let i = 0; i < 1000; i++) {
    const a = rng.int(lo, hi);
    const b = rng.int(blo, bhi);
    if (regroup === undefined || (noCarrySum(a, b) !== a + b) === regroup) return { a, b };
  }
  throw new Error('arith.add: no operands match params');
}

/** Three wrong sums: forgot to carry first, then off by one / wrong column (±1, ±10, ±2). */
function distractors(rng: Rng, { a, b }: Core): number[] {
  const sum = a + b;
  const near = rng
    .shuffle([1, -1, 10, -10])
    .concat([2, -2])
    .map((d) => sum + d);
  const all = [noCarrySum(a, b), ...near].filter((n) => n >= 0 && n !== sum);
  return [...new Set(all)].slice(0, 3);
}

export const add: Generator<AddParams> = {
  type: 'arith.add',
  formats: ['mcq', 'input', 'tf'],
  generate(rng, params, level, format) {
    const core = operands(rng, params, level);
    const sum = String(core.a + core.b);
    const wrong = distractors(rng, core);
    const prompt = same(`${core.a} + ${core.b} = ?`);
    if (format === 'mcq') {
      const choices = rng
        .shuffle([sum, ...wrong.map(String)])
        .map((id) => ({ id, text: same(id) }));
      return { format, level, prompt, core, choices, answer: sum };
    }
    if (format === 'input')
      return { format, level, prompt, core, inputMode: 'numeric', answer: sum };
    if (format === 'tf') {
      const shown = rng.next() < 0.5 ? Number(sum) : rng.pick(wrong);
      const tfPrompt = same(`${core.a} + ${core.b} = ${shown}`);
      return {
        format,
        level,
        prompt: tfPrompt,
        core: { ...core, shown },
        answer: shown === Number(sum),
      };
    }
    throw new Error(`arith.add: format ${format} not supported`);
  },
  validate(q, given) {
    const sum = Number(q.core.a) + Number(q.core.b);
    if (q.format === 'tf') return given === (Number(q.core.shown) === sum);
    if (q.format === 'input') return typeof given === 'string' && parseNumber(given) === sum;
    return given === String(sum);
  },
};

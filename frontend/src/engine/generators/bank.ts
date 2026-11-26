// `bank`: hand-written items, randomised by item, choices and order (PRD §6.5, ADR D-014 a, b).
// Choice ids: c<n> correct / w<n> wrong, o<n> order, l<n>/r<n> match, t<n>/g<n>i<k> dragdrop (n = index in the item).
import type {
  Answer,
  BankItem,
  BankOption,
  BankParams,
  Choice,
  GeneratedQuestion,
  Generator,
  Level,
  LocalizedText,
  Rng,
} from '../types';

type Base = { level: Level; prompt: LocalizedText; core: { item: string } };
type ItemOf<F extends BankItem['format']> = Extract<BankItem, { format: F }>;

const opts = (prefix: string, list: BankOption[]): Choice[] =>
  list.map((o, i) => ({ id: `${prefix}${i}`, ...o }));
const ids = (prefix: string, list: readonly unknown[]) => list.map((_, i) => `${prefix}${i}`);
const norm = (s: string) => s.trim().toLowerCase();

/** Answer map: match left → right, dragdrop item → target. */
function expectedMap(item: ItemOf<'match' | 'dragdrop'>): Record<string, string> {
  if (item.format === 'match')
    return Object.fromEntries(item.pairs.map((_, i) => [`l${i}`, `r${i}`]));
  return Object.fromEntries(
    item.groups.flatMap((g, gi) => g.items.map((_, k) => [`g${gi}i${k}`, `t${gi}`])),
  );
}

function pickItem(rng: Rng, items: BankItem[], level: Level, format: string): BankItem {
  const ofFormat = items.filter((i) => i.format === format);
  const fit = ofFormat.filter((i) => (i.level ?? 1) <= level);
  return rng.pick(fit.length > 0 ? fit : ofFormat);
}

function choiceQuestion(
  item: ItemOf<'mcq' | 'listen' | 'tap'>,
  rng: Rng,
  base: Base,
): GeneratedQuestion {
  const correct = opts('c', item.correct);
  const wrong = opts('w', item.wrong);
  if (item.format === 'tap') {
    return {
      ...base,
      format: 'tap',
      choices: rng.shuffle([...correct, ...wrong]),
      answer: ids('c', correct),
    };
  }
  const right = rng.pick(correct);
  const choices = rng.shuffle([right, ...rng.shuffle(wrong).slice(0, 3)]);
  if (item.format === 'mcq') return { ...base, format: 'mcq', choices, answer: right.id };
  return { ...base, format: 'listen', speak: item.speak ?? item.prompt, choices, answer: right.id };
}

function structuredQuestion(
  item: ItemOf<'order' | 'match' | 'dragdrop'>,
  rng: Rng,
  base: Base,
): GeneratedQuestion {
  if (item.format === 'order') {
    const items = opts('o', item.sequence);
    const shown = rng.shuffle(items);
    // Never show the sequence already solved.
    if (shown.every((c, i) => c.id === items[i]?.id)) shown.push(shown.shift() as Choice);
    return { ...base, format: 'order', items: shown, answer: ids('o', items) };
  }
  if (item.format === 'match') {
    const left = rng.shuffle(
      opts(
        'l',
        item.pairs.map((p) => p[0]),
      ),
    );
    const right = rng.shuffle(
      opts(
        'r',
        item.pairs.map((p) => p[1]),
      ),
    );
    return { ...base, format: 'match', left, right, answer: expectedMap(item) };
  }
  const targets = rng.shuffle(
    opts(
      't',
      item.groups.map((g) => g.target),
    ),
  );
  const items = item.groups.flatMap((g, gi) =>
    g.items.map((o, k) => ({ id: `g${gi}i${k}`, ...o })),
  );
  return {
    ...base,
    format: 'dragdrop',
    targets,
    items: rng.shuffle(items),
    answer: expectedMap(item),
  };
}

function build(item: BankItem, rng: Rng, base: Base): GeneratedQuestion {
  switch (item.format) {
    case 'mcq':
    case 'listen':
    case 'tap':
      return choiceQuestion(item, rng, base);
    case 'order':
    case 'match':
    case 'dragdrop':
      return structuredQuestion(item, rng, base);
    case 'input':
      return { ...base, format: 'input', inputMode: 'text', answer: item.accept[0] ?? '' };
    case 'tf':
      return { ...base, format: 'tf', answer: item.answer };
    case 'draw':
      return { ...base, format: 'draw', template: item.template, answer: 'done' };
  }
}

const sameSet = (given: Answer, expected: string[]) =>
  Array.isArray(given) &&
  given.length === expected.length &&
  expected.every((id) => given.includes(id));

const sameMap = (given: Answer, expected: Record<string, string>) =>
  typeof given === 'object' &&
  !Array.isArray(given) &&
  Object.keys(given).length === Object.keys(expected).length &&
  Object.entries(expected).every(([k, v]) => given[k] === v);

function matches(item: BankItem, given: Answer): boolean {
  switch (item.format) {
    case 'mcq':
    case 'listen':
      return typeof given === 'string' && ids('c', item.correct).includes(given);
    case 'tap':
      return sameSet(given, ids('c', item.correct));
    case 'input':
      return typeof given === 'string' && item.accept.some((a) => norm(a) === norm(given));
    case 'tf':
      return given === item.answer;
    case 'order':
      return Array.isArray(given) && given.join('|') === ids('o', item.sequence).join('|');
    case 'match':
    case 'dragdrop':
      return sameMap(given, expectedMap(item));
    case 'draw':
      return given === 'done';
  }
}

export const bank: Generator<BankParams> = {
  type: 'bank',
  formats: ['mcq', 'input', 'tf', 'dragdrop', 'match', 'order', 'tap', 'listen', 'draw'],
  generate(rng, { items }, level, format) {
    const item = pickItem(rng, items, level, format);
    return build(item, rng, { level, prompt: item.prompt, core: { item: item.id } });
  },
  validate(q, given, { items }) {
    const item = items.find((i) => i.id === q.core.item);
    return item !== undefined && item.format === q.format && matches(item, given);
  },
};

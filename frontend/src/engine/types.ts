// Engine & content contracts (ADR D-014). Types only, no runtime code.
// Implemented in T3.5 (rng, registry, loader), T3.6 (mastery), T3.7 (session), T3.22–T3.23 (games).
import type { Component } from 'svelte';
import type { Locale } from '../i18n';
import type { Grade, QuestionFormat, SubjectId } from '../services/types';

/** Both languages, always (PRD §6.4). */
export interface LocalizedText {
  id: string;
  en: string;
}

/** Key of a bundled illustration, resolved by the UI. Never a URL (base path, §17.5). */
export type AssetKey = string;

/** Adaptive difficulty; stored as `ProgressEvent.difficulty`. */
export type Level = 1 | 2 | 3;

// ---- Content JSON: src/content/{subject}/g{grade}/index.json + u{unit}.json (D-014 a, i) ----

export interface GeneratorRef {
  type: string; // registry key, e.g. 'arith.add', 'bank'
  params: Record<string, unknown>; // validated by the generator's own test
  formats: QuestionFormat[]; // non-empty subset of Generator.formats
}

export interface Skill {
  id: string; // `${unitId}.s${n}`
  title: LocalizedText;
  generators: GeneratorRef[]; // ≥ 1
  explain: LocalizedText; // shown after a wrong answer, default hint
}

/** `u{n}.json`: only units the demo may open live in src/content (FR-10). */
export interface Unit {
  id: string; // `${subject}.g${grade}.u${n}`
  title: LocalizedText;
  skills: Skill[]; // ≥ 3 (§6.5)
}

/** `index.json`: every unit of a grade, titles only; a unit without `u{n}.json` is locked. */
export interface GradeIndex {
  id: string; // `${subject}.g${grade}`
  units: { id: string; title: LocalizedText }[];
}

/** Answer option inside a bank item: text, picture, or both. */
export interface BankOption {
  text?: LocalizedText;
  image?: AssetKey;
}

interface BankItemBase {
  id: string; // unique within the skill; the item's fingerprint core
  prompt: LocalizedText;
  level?: Level; // default 1
}

export type BankItem = BankItemBase &
  (
    | {
        format: 'mcq' | 'listen' | 'tap';
        correct: BankOption[];
        wrong: BankOption[];
        speak?: LocalizedText;
      }
    | { format: 'input'; accept: string[] }
    | { format: 'tf'; answer: boolean }
    | { format: 'order'; sequence: BankOption[] }
    | { format: 'match'; pairs: [BankOption, BankOption][] }
    | { format: 'dragdrop'; groups: { target: BankOption; items: BankOption[] }[] }
    | { format: 'draw'; template?: AssetKey }
  );

/** `params` of a `{ "type": "bank" }` generator ref. */
export interface BankParams {
  items: BankItem[];
}

// ---- Question & Answer, 9 formats (D-014 c) ----

/** Choice ids are canonical values (generators) or `c<n>`/`w<n>` (bank): unique per question. */
export interface Choice {
  id: string;
  text?: LocalizedText;
  image?: AssetKey;
}

export interface AnswerByFormat {
  mcq: string; // choice id
  input: string;
  tf: boolean;
  dragdrop: Record<string, string>; // item id → target id
  match: Record<string, string>; // left id → right id
  order: string[]; // item ids, first to last
  tap: string[]; // all correct choice ids (set)
  listen: string; // choice id
  draw: 'done'; // not graded (FR-5)
}
export type Answer = AnswerByFormat[QuestionFormat];

interface FieldsByFormat {
  mcq: { choices: Choice[] };
  input: { inputMode: 'numeric' | 'text' };
  tf: Record<never, never>;
  dragdrop: { items: Choice[]; targets: Choice[] };
  match: { left: Choice[]; right: Choice[] };
  order: { items: Choice[] }; // shown shuffled
  tap: { choices: Choice[] };
  listen: { speak: LocalizedText; choices: Choice[] };
  draw: { template?: AssetKey };
}

interface QuestionBase {
  skillId: string;
  generator: string; // GeneratorRef.type
  level: Level;
  prompt: LocalizedText;
  hint?: LocalizedText; // falls back to Skill.explain
  core: Record<string, string | number | boolean>; // core params; fingerprint input
  fingerprint: string; // cyrb53(generator + sorted core) as hex
}

export type QuestionOf<F extends QuestionFormat> = QuestionBase & {
  format: F;
  answer: AnswerByFormat[F];
} & FieldsByFormat[F];
export type Question = { [F in QuestionFormat]: QuestionOf<F> }[QuestionFormat];

/** What a generator returns; the engine adds skillId, generator and fingerprint. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type GeneratedQuestion = DistributiveOmit<Question, 'skillId' | 'generator' | 'fingerprint'>;

// ---- Generator contract (D-014 b) ----

/** Seeded PRNG (mulberry32 over a cyrb53 seed). All randomness in the engine goes through it. */
export interface Rng {
  next(): number; // [0, 1)
  int(min: number, max: number): number; // inclusive
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export interface Generator<P = Record<string, unknown>> {
  type: string;
  formats: readonly QuestionFormat[];
  generate(rng: Rng, params: P, level: Level, format: QuestionFormat): GeneratedQuestion;
  /** Recomputes the truth from `q.core` + params, never from `q.answer`. */
  validate(q: Question, given: Answer, params: P): boolean;
}

// ---- Local state (Dexie v2 table `skillHistory`, D-014 d, f) ----

export interface SkillHistory {
  profileId: string;
  skillId: string;
  sessionCounter: number; // +1 when a session or game run starts
  recent: string[][]; // fingerprints per session, oldest first, max 5
}

/** Device-local calendar day `YYYY-MM-DD`. */
export type LocalDay = string;

/** Kept on the profile (T3.6). One missed day per ISO week is forgiven (FR-7). */
export interface StreakState {
  count: number;
  lastDay: LocalDay | null;
  restWeek: string | null; // ISO week `YYYY-Www` whose free day is used
}

// ---- Mini game contract (D-014 h) ----

export interface GameHost {
  locale: Locale;
  grade: Grade;
  reduceMotion: boolean;
  nextQuestion(): Question;
  /** Host validates, records the event (mastery, XP, sync queue) and returns correctness. */
  answer(q: Question, given: Answer, durationMs: number): Promise<boolean>;
  end(): void;
}

export interface GameProps {
  host: GameHost;
  paused: boolean; // host owns the pause button and overlay
}

/** Entry in games/registry.ts; `load` is the only import of the game's lazy chunk. */
export interface GameInfo {
  id: string;
  subject: SubjectId;
  format: QuestionFormat;
  load: () => Promise<{ default: Component<GameProps> }>;
}

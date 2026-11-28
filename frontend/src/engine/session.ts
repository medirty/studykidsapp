// Learning session (ADR D-014 d, e, f; PRD FR-5 rules 1–6). Pure: time, event ids and seeds are inputs.
// Caller flow: startSession → save historiesAfter (counter +1) → currentQuestion / answer, each event
// via api.recordProgress and historiesAfter saved again → until isDone.
import { checkAnswer, makeQuestion } from './generators/registry';
import { effectiveMastery } from './mastery';
import { rngFor } from './rng';
import type {
  Answer,
  GeneratorRef,
  Level,
  LocalizedText,
  Question,
  Rng,
  Skill,
  SkillHistory,
} from './types';
import type { Grade, ProgressEvent, QuestionFormat, SkillMastery } from '../services/types';

const RECENT_SESSIONS = 5; // anti-repeat window per skill (FR-5 rule 2)
const MAX_PER_SESSION = 10;
const TRIES = 20; // generate attempts before the "seen longest ago" fallback
const MAX_RUN = 3; // same format in a row (FR-5 rule 3)
const REVIEW_SHARE = 0.2; // FR-5 rule 6
const DECAY_DROP = 5; // points lost to decay that make a skill due for review

export interface PracticedSkill {
  skill: Skill;
  mastery: SkillMastery;
}

export interface SessionInput {
  profileId: string;
  grade: Grade;
  skill: Skill;
  mastery?: SkillMastery; // of `skill`; absent = never practiced
  others: PracticedSkill[]; // practiced skills of the same subject & grade
  histories: SkillHistory[]; // the profile's skillHistory rows
  now: Date;
}

/** `level: null` = main skill at the adaptive level; a number = review question at a fixed level. */
export interface SessionSlot {
  skill: Skill;
  level: Level | null;
}

export interface SessionState {
  profileId: string;
  skillId: string; // main skill
  counter: number; // already +1 for this session
  slots: SessionSlot[];
  index: number; // current question
  level: Level; // adaptive level of the main skill
  run: number; // +n correct / −n wrong in a row (main skill only)
  hint: boolean; // show the hint on the next main-skill question
  formats: QuestionFormat[]; // formats asked so far
  histories: Record<string, SkillHistory>; // rows as loaded (main counter +1), recent = before this session
  seen: Record<string, string[]>; // fingerprints asked this session per skill
}

export interface SessionQuestion {
  question: Question;
  ref: GeneratorRef;
  hint: LocalizedText | null;
}

export const sessionSize = (grade: Grade) => (grade <= 2 ? 8 : 10);
export const levelFor = (mastery: number): Level => (mastery < 40 ? 1 : mastery < 75 ? 2 : 3);
export const isDone = (s: SessionState) => s.index >= s.slots.length;

const effective = (m: SkillMastery, now: Date) =>
  effectiveMastery(m.mastery, m.lastPracticedAt, now);

/** Other practiced skills that lost ≥ 5 points to decay, lowest effective mastery first. */
export function reviewSkills(
  others: readonly PracticedSkill[],
  mainSkillId: string,
  now: Date,
  count: number,
): PracticedSkill[] {
  return others
    .filter((o) => o.skill.id !== mainSkillId)
    .filter((o) => o.mastery.mastery - effective(o.mastery, now) >= DECAY_DROP)
    .sort((a, b) => effective(a.mastery, now) - effective(b.mastery, now))
    .slice(0, count);
}

/** New session: counter +1, starting level from effective mastery, review slots anywhere but first. */
export function startSession(input: SessionInput): SessionState {
  const { profileId, skill, now } = input;
  const own = input.histories.filter((h) => h.profileId === profileId);
  const histories = Object.fromEntries(own.map((h) => [h.skillId, h]));
  const prev = histories[skill.id];
  const counter = (prev?.sessionCounter ?? 0) + 1;
  histories[skill.id] = {
    profileId,
    skillId: skill.id,
    sessionCounter: counter,
    recent: prev?.recent ?? [],
  };
  const size = sessionSize(input.grade);
  const reviews = reviewSkills(input.others, skill.id, now, Math.round(size * REVIEW_SHARE));
  const rng = rngFor(profileId, skill.id, counter, 'plan');
  return {
    ...{ profileId, skillId: skill.id, counter, histories, seen: {}, formats: [] },
    slots: planSlots(rng, size, skill, reviews, now),
    ...{ index: 0, run: 0, hint: false },
    level: input.mastery ? levelFor(effective(input.mastery, now)) : 1,
  };
}

function planSlots(
  rng: Rng,
  size: number,
  skill: Skill,
  reviews: PracticedSkill[],
  now: Date,
): SessionSlot[] {
  const slots: SessionSlot[] = Array.from({ length: size }, () => ({ skill, level: null }));
  const positions = rng.shuffle(Array.from({ length: size - 1 }, (_, i) => i + 1));
  reviews.forEach((r, i) => {
    slots[positions[i]!] = { skill: r.skill, level: levelFor(effective(r.mastery, now)) };
  });
  return slots;
}

/** The question at `state.index`; the same state always gives the same question. */
export function currentQuestion(s: SessionState): SessionQuestion {
  const slot = s.slots[s.index];
  if (!slot) throw new Error('session: no question left');
  // Review questions are seeded from the main session too: one (profile, skill, counter, index) tuple.
  const rng = rngFor(s.profileId, s.skillId, s.counter, s.index);
  const recent = s.histories[slot.skill.id]?.recent ?? [];
  const seen = s.seen[slot.skill.id] ?? [];
  const level = slot.level ?? s.level;
  const picked = pickQuestion(rng, slot.skill, level, bannedFormat(s.formats), recent, seen);
  const hint = slot.level === null && s.hint ? (picked.question.hint ?? slot.skill.explain) : null;
  return { ...picked, hint };
}

/** The format already asked 3× in a row, if any. */
function bannedFormat(formats: QuestionFormat[]): QuestionFormat | null {
  const last = formats.slice(-MAX_RUN);
  return last.length === MAX_RUN && last.every((f) => f === last[0]) ? last[0]! : null;
}

type Candidate = Omit<SessionQuestion, 'hint'>;

function candidate(rng: Rng, skill: Skill, level: Level, banned: QuestionFormat | null): Candidate {
  const ref = rng.pick(skill.generators);
  const allowed = ref.formats.filter((f) => f !== banned);
  const format = rng.pick(allowed.length > 0 ? allowed : ref.formats); // single-format skill: exempt
  return { question: makeQuestion(skill.id, ref, rng, level, format), ref };
}

/** ≤ 20 tries for a fingerprint outside recent ∪ seen; else seen longest ago; else the last try. */
function pickQuestion(
  rng: Rng,
  skill: Skill,
  level: Level,
  banned: QuestionFormat | null,
  recent: string[][],
  seen: string[],
): Candidate {
  const forbidden = new Set([...recent.flat(), ...seen]);
  const tried: Candidate[] = [];
  for (let i = 0; i < TRIES; i++) {
    const c = candidate(rng, skill, level, banned);
    if (!forbidden.has(c.question.fingerprint)) return c;
    tried.push(c);
  }
  const lastSeen = (c: Candidate) =>
    recent.reduce((at, fps, i) => (fps.includes(c.question.fingerprint) ? i : at), -1);
  const fresh = tried.filter((c) => !seen.includes(c.question.fingerprint));
  return fresh.sort((a, b) => lastSeen(a) - lastSeen(b))[0] ?? tried.at(-1)!;
}

/** Grades with the generator's validator, builds the event (§12.1, no fingerprint/seed), moves on. */
export function answer(
  s: SessionState,
  sq: SessionQuestion,
  given: Answer,
  durationMs: number,
  now: Date,
  clientEventId: string,
): { correct: boolean; event: ProgressEvent; state: SessionState } {
  const q = sq.question;
  const correct = checkAnswer(q, given, sq.ref);
  const event: ProgressEvent = {
    ...{ clientEventId, profileId: s.profileId, skillId: q.skillId, correct },
    ...{ format: q.format, difficulty: q.level, durationMs, createdAt: now.toISOString() },
  };
  const seen = { ...s.seen, [q.skillId]: [...(s.seen[q.skillId] ?? []), q.fingerprint] };
  const next = { ...s, index: s.index + 1, formats: [...s.formats, q.format], seen };
  const isMain = s.slots[s.index]?.level === null;
  return { correct, event, state: isMain ? adapt(next, correct) : next };
}

/** 2 correct in a row → level +1 (max 3); 2 wrong → level −1 (min 1) + hint next; then reset. */
function adapt(s: SessionState, correct: boolean): SessionState {
  const run = correct ? Math.max(s.run, 0) + 1 : Math.min(s.run, 0) - 1;
  if (run >= 2) return { ...s, level: Math.min(3, s.level + 1) as Level, run: 0, hint: false };
  if (run <= -2) return { ...s, level: Math.max(1, s.level - 1) as Level, run: 0, hint: true };
  return { ...s, run, hint: false };
}

/** Rows to save: loaded rows + this session's fingerprints (max 5 sessions × 10). Idempotent. */
export function historiesAfter(s: SessionState): SkillHistory[] {
  const skillIds = new Set([s.skillId, ...Object.keys(s.seen)]);
  return [...skillIds].map((skillId) => {
    const row = s.histories[skillId] ?? {
      profileId: s.profileId,
      skillId,
      sessionCounter: 0,
      recent: [],
    };
    const fps = s.seen[skillId];
    if (!fps) return row;
    return { ...row, recent: [...row.recent, fps.slice(-MAX_PER_SESSION)].slice(-RECENT_SESSIONS) };
  });
}

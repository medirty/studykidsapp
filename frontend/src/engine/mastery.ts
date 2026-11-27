// Mastery, stars, XP and streak (ADR D-014 g, PRD FR-7, FR-9). Pure: time is always a parameter.
// Phase 4 PHP recomputes the same numbers from the same events (§12.2) — keep both in step.
import type { IsoUtc, Profile, ProgressEvent, SkillMastery } from '../services/types';
import type { LocalDay, StreakState } from './types';

const WINDOW = 20; // newest graded events that count
const WEIGHT = 0.8; // weight of the k-th newest event = 0.8^k
const GRACE_DAYS = 3;
const HALF_LIFE_DAYS = 30;
const MIN_ATTEMPTS = 10; // FR-9 "not enough data yet" below this
const DAY_MS = 86_400_000;

const byTime = (a: ProgressEvent, b: ProgressEvent) =>
  a.createdAt.localeCompare(b.createdAt) || a.clientEventId.localeCompare(b.clientEventId);

/** Stored mastery (no decay): round(100 × Σ 0.8^k·correct_k / Σ 0.8^k) over ≤ 20 newest graded events. */
export function masteryOf(events: readonly ProgressEvent[]): { mastery: number; attempts: number } {
  const graded = events.filter((e) => e.format !== 'draw').sort(byTime);
  const recent = graded.slice(-WINDOW).reverse(); // k = 0 is the newest
  let sum = 0;
  let total = 0;
  recent.forEach((e, k) => {
    total += WEIGHT ** k;
    if (e.correct) sum += WEIGHT ** k;
  });
  return { mastery: total ? Math.round((100 * sum) / total) : 0, attempts: graded.length };
}

/** Read-time decay: round(mastery × 0.5^(max(0, d − 3) / 30)), d = full days since last practice. */
export function effectiveMastery(mastery: number, lastPracticedAt: IsoUtc, now: Date): number {
  const days = Math.floor((now.getTime() - Date.parse(lastPracticedAt)) / DAY_MS);
  return Math.round(mastery * 0.5 ** (Math.max(0, days - GRACE_DAYS) / HALF_LIFE_DAYS));
}

/** 0 = not practiced, 3 = mastery ≥ 85 with ≥ 10 answers, 2 = mastery ≥ 60, else 1. */
export function starsFor(mastery: number, attempts: number): number {
  if (attempts === 0) return 0;
  if (mastery >= 85 && attempts >= MIN_ATTEMPTS) return 3;
  return mastery >= 60 ? 2 : 1;
}

export const hasEnoughData = (attempts: number) => attempts >= MIN_ATTEMPTS;

/** Effort counts: correct or finished drawing 10, wrong 2. */
export const xpFor = (e: Pick<ProgressEvent, 'correct' | 'format'>) =>
  e.correct || e.format === 'draw' ? 10 : 2;

export const sessionXp = (events: readonly ProgressEvent[]) =>
  events.reduce((sum, e) => sum + xpFor(e), 0);

const pad = (n: number) => String(n).padStart(2, '0');
const dayMs = (day: LocalDay) => Date.parse(`${day}T00:00:00Z`);

/** Device calendar day `YYYY-MM-DD` (streaks follow the child's own clock). */
export const localDay = (d: Date): LocalDay =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** ISO 8601 week `YYYY-Www` (weeks start Monday; week 1 holds the year's first Thursday). */
export function isoWeek(day: LocalDay): string {
  const d = new Date(dayMs(day));
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7)); // Thursday of this week
  const year = d.getUTCFullYear();
  const week = Math.floor((d.getTime() - Date.UTC(year, 0, 1)) / (7 * DAY_MS)) + 1;
  return `${year}-W${pad(week)}`;
}

/** Same day keeps, next day +1, one missed day +1 once per ISO week, else a fresh start at 1. */
export function nextStreak(s: StreakState, day: LocalDay): StreakState {
  if (s.lastDay === null) return { ...s, count: 1, lastDay: day };
  const gap = Math.round((dayMs(day) - dayMs(s.lastDay)) / DAY_MS);
  if (gap <= 0) return s; // same day, or the device clock went back
  if (gap === 1) return { ...s, count: s.count + 1, lastDay: day };
  const missedWeek = isoWeek(new Date(dayMs(s.lastDay) + DAY_MS).toISOString().slice(0, 10));
  if (gap === 2 && missedWeek !== s.restWeek) {
    return { count: s.count + 1, lastDay: day, restWeek: missedWeek };
  }
  return { ...s, count: 1, lastDay: day };
}

/** New `skillMastery` row from all events of one skill; earned stars are kept (FR-7). */
export function nextSkillMastery(
  prev: SkillMastery | undefined,
  events: readonly ProgressEvent[],
): SkillMastery {
  const { profileId, skillId, createdAt } = [...events].sort(byTime).at(-1)!;
  const { mastery, attempts } = masteryOf(events);
  const before = prev ? (prev.stars ?? starsFor(prev.mastery, prev.attempts)) : 0;
  const stars = Math.max(before, starsFor(mastery, attempts));
  return { profileId, skillId, mastery, attempts, stars, lastPracticedAt: createdAt };
}

const NO_STREAK: StreakState = { count: 0, lastDay: null, restWeek: null };

/** Profile after one event: XP added, streak counted on the device day of the event. */
export function applyEventToProfile(profile: Profile, e: ProgressEvent): Profile {
  const day = localDay(new Date(e.createdAt));
  return {
    ...profile,
    xp: (profile.xp ?? 0) + xpFor(e),
    streak: nextStreak(profile.streak ?? NO_STREAK, day),
  };
}

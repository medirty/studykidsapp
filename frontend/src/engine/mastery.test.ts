import { describe, expect, it } from 'vitest';
import type { Profile, ProgressEvent, SkillMastery } from '../services/types';
import {
  applyEventToProfile,
  effectiveMastery,
  hasEnoughData,
  isoWeek,
  localDay,
  masteryOf,
  nextSkillMastery,
  nextStreak,
  sessionXp,
  starsFor,
  xpFor,
} from './mastery';
import type { StreakState } from './types';

const DAY = 86_400_000;
const T0 = Date.parse('2026-11-01T00:00:00.000Z');

/** Events in the given order, one minute apart; `true`/`false` = correct, `'draw'` = drawing done. */
function events(...marks: (boolean | 'draw')[]): ProgressEvent[] {
  return marks.map((m, i) => ({
    clientEventId: `e${String(i).padStart(3, '0')}`,
    profileId: 'p1',
    skillId: 'math.g1.u1.s1',
    correct: m !== false,
    format: m === 'draw' ? 'draw' : 'mcq',
    difficulty: 1,
    durationMs: 1000,
    createdAt: new Date(T0 + i * 60_000).toISOString(),
  }));
}

describe('masteryOf (window 20, weight 0.8^k, draw not graded)', () => {
  it.each([
    ['no events', [], 0, 0],
    ['one correct', [true], 100, 1],
    ['one wrong', [false], 0, 1],
    ['ADR example: 5 correct then 1 wrong', [true, true, true, true, true, false], 73, 6],
    ['ADR example reversed: 1 wrong then 5 correct', [false, true, true, true, true, true], 91, 6],
    ['draw is not graded', ['draw', true, 'draw'], 100, 1],
    ['only draw', ['draw', 'draw'], 0, 0],
  ] as const)('%s', (_, marks, mastery, attempts) => {
    expect(masteryOf(events(...marks))).toEqual({ mastery, attempts });
  });

  it('only the 20 newest graded events count; attempts counts all', () => {
    const marks = [...Array(5).fill(false), ...Array(20).fill(true)] as boolean[];
    expect(masteryOf(events(...marks))).toEqual({ mastery: 100, attempts: 25 });
    const old = [...Array(20).fill(false), true] as boolean[];
    expect(masteryOf(events(...old)).mastery).toBe(Math.round(100 / ((1 - 0.8 ** 20) / 0.2)));
  });

  it('orders by createdAt then clientEventId, not by input order', () => {
    const list = events(true, true, true, true, true, false);
    expect(masteryOf([...list].reverse()).mastery).toBe(73);
    const same = list.map((e) => ({ ...e, createdAt: list[0]!.createdAt }));
    expect(masteryOf([...same].reverse()).mastery).toBe(73);
  });
});

describe('effectiveMastery (3-day grace, then 30-day half-life)', () => {
  const last = new Date(T0).toISOString();
  it.each([
    [0, 80, 80],
    [3, 80, 80],
    [3.99, 80, 80], // only full days count
    [33, 80, 40],
    [63, 100, 25],
    [10, 0, 0],
    [-2, 70, 70], // clock behind lastPracticedAt: no decay
  ])('after %s days, %s → %s', (days, mastery, expected) => {
    expect(effectiveMastery(mastery, last, new Date(T0 + days * DAY))).toBe(expected);
  });
});

describe('starsFor & hasEnoughData', () => {
  it.each([
    [0, 0, 0],
    [0, 3, 1],
    [59, 30, 1],
    [60, 1, 2],
    [100, 9, 2], // 3 stars need ≥ 10 attempts
    [85, 10, 3],
    [84, 40, 2],
  ])('mastery %s, attempts %s → %s stars', (mastery, attempts, stars) => {
    expect(starsFor(mastery, attempts)).toBe(stars);
  });

  it('needs at least 10 graded answers before any conclusion (FR-9)', () => {
    expect(hasEnoughData(0)).toBe(false);
    expect(hasEnoughData(9)).toBe(false);
    expect(hasEnoughData(10)).toBe(true);
  });
});

describe('XP', () => {
  it('correct 10, wrong 2, finished drawing 10; session XP is the sum', () => {
    const [ok, wrong, draw] = [...events(true, false), ...events('draw')];
    expect([xpFor(ok!), xpFor(wrong!), xpFor(draw!)]).toEqual([10, 2, 10]);
    expect(sessionXp(events(true, false, true, 'draw'))).toBe(32);
    expect(sessionXp([])).toBe(0);
  });
});

describe('localDay & isoWeek', () => {
  it('uses the device calendar day', () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDay(new Date(2026, 10, 27, 0, 0))).toBe('2026-11-27');
  });

  it.each([
    ['2026-11-27', '2026-W48'],
    ['2026-01-01', '2026-W01'],
    ['2021-01-03', '2020-W53'],
    ['2024-12-30', '2025-W01'],
  ])('%s is in %s', (day, week) => {
    expect(isoWeek(day)).toBe(week);
  });
});

describe('nextStreak (one free day per ISO week, never a "lost" state)', () => {
  const empty: StreakState = { count: 0, lastDay: null, restWeek: null };
  const at = (count: number, lastDay: string, restWeek: string | null = null) => ({
    count,
    lastDay,
    restWeek,
  });

  it.each([
    ['first activity', empty, '2026-11-20', at(1, '2026-11-20')],
    ['same day again', at(4, '2026-11-20'), '2026-11-20', at(4, '2026-11-20')],
    ['next day', at(4, '2026-11-20'), '2026-11-21', at(5, '2026-11-21')],
    ['across months', at(2, '2026-11-30'), '2026-12-01', at(3, '2026-12-01')],
    [
      'one day missed: free day used',
      at(4, '2026-11-20'),
      '2026-11-22',
      at(5, '2026-11-22', '2026-W47'),
    ],
    [
      'second miss in the same week',
      at(6, '2026-11-18', '2026-W47'),
      '2026-11-20',
      at(1, '2026-11-20', '2026-W47'),
    ],
    [
      'miss in a new week',
      at(6, '2026-11-24', '2026-W47'),
      '2026-11-26',
      at(7, '2026-11-26', '2026-W48'),
    ],
    ['two days missed: fresh start', at(9, '2026-11-20'), '2026-11-23', at(1, '2026-11-23')],
    ['device clock went back', at(3, '2026-11-20'), '2026-11-19', at(3, '2026-11-20')],
  ] as const)('%s', (_, state, day, expected) => {
    expect(nextStreak(state, day)).toEqual(expected);
  });

  it('count is at least 1 after any activity', () => {
    let s: StreakState = empty;
    for (const day of ['2026-11-01', '2026-11-15', '2026-11-16', '2026-12-30']) {
      s = nextStreak(s, day);
      expect(s.count).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('nextSkillMastery (stars never go down)', () => {
  it('builds the row from the events of one skill', () => {
    const list = events(true, true, 'draw');
    expect(nextSkillMastery(undefined, list)).toEqual({
      profileId: 'p1',
      skillId: 'math.g1.u1.s1',
      mastery: 100,
      attempts: 2,
      stars: 2,
      lastPracticedAt: list[2]!.createdAt,
    });
  });

  it('keeps earned stars when mastery drops, also for an old row without stars', () => {
    const prev: SkillMastery = { ...nextSkillMastery(undefined, events(true)), stars: 3 };
    expect(nextSkillMastery(prev, events(false, false)).stars).toBe(3);
    const oldRow = { ...prev, mastery: 90, attempts: 12, stars: undefined } as unknown;
    expect(nextSkillMastery(oldRow as SkillMastery, events(false)).stars).toBe(3);
  });
});

describe('applyEventToProfile', () => {
  const base: Profile = {
    id: 'p1',
    serverId: null,
    nickname: 'Dina',
    grade: 1,
    avatarId: 'avatar-01',
    locale: 'id',
    prefs: { autoRead: false, reduceMotion: false },
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  };

  it('adds XP and counts the local day; old rows start at 0', () => {
    const [ok, wrong] = events(true, false) as [ProgressEvent, ProgressEvent];
    const once = applyEventToProfile(base, ok);
    const day = localDay(new Date(ok.createdAt));
    expect(once).toEqual({ ...base, xp: 10, streak: { count: 1, lastDay: day, restWeek: null } });
    expect(applyEventToProfile(once, wrong)).toMatchObject({ xp: 12, streak: { count: 1 } });
  });
});

// Session engine (ADR D-014 d, e, f; PRD FR-5 rules 1–6). Deterministic: seed, time and ids are inputs.
import { describe, expect, it } from 'vitest';
import { fingerprint } from './rng';
import {
  answer,
  currentQuestion,
  historiesAfter,
  isDone,
  levelFor,
  reviewSkills,
  sessionSize,
  startSession,
  type SessionInput,
  type SessionQuestion,
  type SessionState,
} from './session';
import type { Answer, BankItem, Question, Skill, SkillHistory } from './types';
import type { QuestionFormat, SkillMastery } from '../services/types';

const NOW = new Date('2026-11-28T08:00:00.000Z');
const t = (s: string) => ({ id: s, en: s });

const addSkill = (id: string, formats: QuestionFormat[] = ['mcq', 'input', 'tf']): Skill => ({
  id,
  title: t(id),
  explain: t(`explain ${id}`),
  generators: [{ type: 'arith.add', params: { digits: 1 }, formats }],
});

const bankItem = (id: string): BankItem => ({
  id,
  format: 'mcq',
  prompt: t(id),
  correct: [{ text: t('yes') }],
  wrong: [{ text: t('no') }],
});
const bankSkill = (id: string, itemIds: string[]): Skill => ({
  id,
  title: t(id),
  explain: t(`explain ${id}`),
  generators: [{ type: 'bank', params: { items: itemIds.map(bankItem) }, formats: ['mcq'] }],
});
const bankFp = (item: string) => fingerprint('bank', { item });

const mastery = (skillId: string, value: number, daysAgo: number): SkillMastery => ({
  profileId: 'p1',
  skillId,
  mastery: value,
  attempts: 12,
  stars: 2,
  lastPracticedAt: new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString(),
});

function input(over: Partial<SessionInput> = {}): SessionInput {
  return {
    profileId: 'p1',
    grade: 3,
    skill: addSkill('math.g3.u1.s1'),
    others: [],
    histories: [],
    now: NOW,
    ...over,
  };
}

function wrong(q: Question): Answer {
  if (q.format === 'tf') return !q.answer;
  if (q.format === 'mcq') return q.choices.find((c) => c.id !== q.answer)!.id;
  return '-1';
}

/** Plays a whole session; `ok(i)` decides whether answer i is correct. */
function play(state: SessionState, ok: (i: number) => boolean = () => true) {
  const asked: SessionQuestion[] = [];
  while (!isDone(state)) {
    const sq = currentQuestion(state);
    const given = ok(asked.length) ? sq.question.answer : wrong(sq.question);
    asked.push(sq);
    state = answer(state, sq, given, 1000, NOW, `e${asked.length}`).state;
  }
  return { state, asked, fps: asked.map((sq) => sq.question.fingerprint) };
}

/** Starts one session from saved rows, plays it and returns the rows to save. */
function playFrom(histories: SkillHistory[], over: Partial<SessionInput> = {}) {
  const result = play(startSession(input({ histories, ...over })));
  return { ...result, histories: historiesAfter(result.state) };
}

describe('session size and starting level', () => {
  it('grades 1–2 get 8 questions, grades 3–6 get 10', () => {
    expect([1, 2, 3, 6].map((g) => sessionSize(g as 1))).toEqual([8, 8, 10, 10]);
  });

  it('maps effective mastery to level: < 40 → 1, 40–74 → 2, ≥ 75 → 3', () => {
    expect([0, 39, 40, 74, 75, 100].map(levelFor)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('starts from the effective (decayed) mastery of the skill, 1 when never practiced', () => {
    const skill = addSkill('s');
    expect(startSession(input({ skill })).level).toBe(1);
    expect(startSession(input({ skill, mastery: mastery('s', 80, 1) })).level).toBe(3);
    expect(startSession(input({ skill, mastery: mastery('s', 50, 1) })).level).toBe(2);
    expect(startSession(input({ skill, mastery: mastery('s', 80, 100) })).level).toBe(1);
  });
});

describe('seed and session counter (FR-5 rule 1)', () => {
  it('same input → same questions', () => {
    expect(play(startSession(input())).asked).toEqual(play(startSession(input())).asked);
  });

  it('the counter goes up when a session starts and changes the questions', () => {
    const history = { profileId: 'p1', skillId: 'math.g3.u1.s1', sessionCounter: 4, recent: [] };
    const state = startSession(input({ histories: [history] }));
    expect(state.counter).toBe(5);
    expect(historiesAfter(state)).toEqual([{ ...history, sessionCounter: 5 }]);
    expect(play(state).fps).not.toEqual(play(startSession(input())).fps);
  });

  it('ignores history rows of other profiles or skills', () => {
    const other = { profileId: 'p2', skillId: 'math.g3.u1.s1', sessionCounter: 9, recent: [] };
    expect(startSession(input({ histories: [other] })).counter).toBe(1);
  });
});

describe('anti-repeat (FR-5 rule 2)', () => {
  it('no fingerprint twice in one session while the pool is large enough', () => {
    const { fps } = play(startSession(input()));
    expect(fps).toHaveLength(10);
    expect(new Set(fps).size).toBe(10);
  });

  it('no fingerprint from the last 5 sessions of the skill, over 7 sessions', () => {
    let histories: SkillHistory[] = [];
    const sessions: string[][] = [];
    for (let i = 0; i < 7; i++) {
      const run = playFrom(histories, { grade: 1 });
      const lastFive = new Set(sessions.slice(-5).flat());
      expect(run.fps.filter((fp) => lastFive.has(fp))).toEqual([]);
      sessions.push(run.fps);
      histories = run.histories;
    }
    expect(histories[0]!.sessionCounter).toBe(7);
    expect(histories[0]!.recent).toEqual(sessions.slice(-5)); // keeps max 5 sessions, oldest first
  });

  it('when every candidate was seen recently, picks the one seen longest ago', () => {
    const skill = bankSkill('gp.g1.u1.s1', ['a', 'b', 'c']);
    const recent = [[bankFp('b')], [bankFp('a')], [bankFp('c')]];
    const histories = [{ profileId: 'p1', skillId: skill.id, sessionCounter: 3, recent }];
    const { fps } = play(startSession(input({ skill, histories })));
    expect(fps.slice(0, 3)).toEqual([bankFp('b'), bankFp('a'), bankFp('c')]);
  });

  it('a pool smaller than the session still fills it (repeats only after the pool is used)', () => {
    const skill = bankSkill('gp.g1.u1.s2', ['a', 'b']);
    const { fps } = play(startSession(input({ skill, grade: 1 })));
    expect(fps).toHaveLength(8);
    expect(new Set(fps.slice(0, 2)).size).toBe(2);
  });
});

describe('format rotation (FR-5 rule 3)', () => {
  const longestRun = (formats: string[]) =>
    formats.reduce(
      (acc, f, i) => {
        const run = f === formats[i - 1] ? acc.run + 1 : 1;
        return { run, max: Math.max(acc.max, run) };
      },
      { run: 0, max: 0 },
    ).max;

  it('never more than 3 questions in a row with the same format', () => {
    for (let p = 0; p < 50; p++) {
      const formats = play(startSession(input({ profileId: `p${p}` }))).asked.map(
        (sq) => sq.question.format,
      );
      expect(longestRun(formats)).toBeLessThanOrEqual(3);
    }
  });

  it('a skill with a single format is the documented exception', () => {
    const skill = addSkill('only-input', ['input']);
    const formats = play(startSession(input({ skill }))).asked.map((sq) => sq.question.format);
    expect(longestRun(formats)).toBe(10);
  });
});

describe('adaptive level and hint (FR-5 rule 5)', () => {
  const skill = addSkill('adaptive', ['input']);
  const levels = (ok: (i: number) => boolean) =>
    play(startSession(input({ skill })), ok).asked.map((sq) => sq.question.level);

  it('2 correct in a row → level up, capped at 3', () => {
    expect(levels(() => true)).toEqual([1, 1, 2, 2, 3, 3, 3, 3, 3, 3]);
  });

  it('2 wrong in a row → level down (min 1) and the next question shows the hint', () => {
    const ok = (i: number) => i < 4; // reach level 3, then miss everything
    const { asked } = play(startSession(input({ skill })), ok);
    expect(asked.map((sq) => sq.question.level)).toEqual([1, 1, 2, 2, 3, 3, 2, 2, 1, 1]);
    expect(asked.map((sq) => sq.hint !== null)).toEqual([
      ...[false, false, false, false, false, false],
      ...[true, false, true, false],
    ]);
    expect(asked[6]!.hint).toEqual(skill.explain); // arith.add has no own hint
  });

  it('a wrong answer resets the correct run and vice versa', () => {
    expect(levels((i) => i % 2 === 0)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });
});

describe('spaced repetition 20% (FR-5 rule 6)', () => {
  const main = addSkill('math.g3.u2.s1', ['input']);
  const low = bankSkill('math.g3.u1.s2', ['a', 'b', 'c']);
  const mid = bankSkill('math.g3.u1.s3', ['a', 'b', 'c']);
  const fresh = bankSkill('math.g3.u1.s4', ['a', 'b', 'c']);
  const others = [
    { skill: mid, mastery: mastery(mid.id, 90, 40) },
    { skill: fresh, mastery: mastery(fresh.id, 30, 2) }, // no decay yet
    { skill: low, mastery: mastery(low.id, 60, 60) },
    { skill: main, mastery: mastery(main.id, 90, 60) }, // the session's own skill
  ];

  it('picks other practiced skills that decayed ≥ 5 points, lowest effective mastery first', () => {
    expect(reviewSkills(others, main.id, NOW, 2).map((r) => r.skill.id)).toEqual([low.id, mid.id]);
    expect(reviewSkills(others, main.id, NOW, 1).map((r) => r.skill.id)).toEqual([low.id]);
  });

  it('round(0.2 × size) review questions, never first, at their own level', () => {
    const { asked, state } = play(startSession(input({ skill: main, others })));
    const review = asked
      .map((sq, i) => [i, sq.question.skillId] as const)
      .filter(([, s]) => s !== main.id);
    expect(review).toHaveLength(2);
    expect(review.map(([i]) => i)).not.toContain(0);
    expect(review.map(([, s]) => s).sort()).toEqual([low.id, mid.id].sort());
    expect(asked.filter((sq) => sq.question.skillId === low.id)[0]!.question.level).toBe(1);
    const rows = historiesAfter(state);
    const lowRow = rows.find((h) => h.skillId === low.id)!;
    expect(lowRow.sessionCounter).toBe(0); // review does not start a session of that skill
    expect(lowRow.recent).toHaveLength(1);
  });

  it('without candidates every question comes from the main skill', () => {
    const { asked } = play(startSession(input({ skill: main, others: others.slice(1, 2) })));
    expect(asked.every((sq) => sq.question.skillId === main.id)).toBe(true);
  });

  it('review answers do not move the main skill level', () => {
    const state = startSession(input({ skill: main, others }));
    const { asked } = play(state, (i) => state.slots[i]!.level === null); // miss only review questions
    const mainLevels = asked
      .filter((sq) => sq.question.skillId === main.id)
      .map((sq) => sq.question.level);
    expect(mainLevels).toEqual([...mainLevels].sort());
    expect(asked.every((sq) => sq.hint === null)).toBe(true);
  });
});

describe('answer → ProgressEvent (§12.1, §8.4)', () => {
  it('grades with the generator validator and builds an event without fingerprint or seed', () => {
    const state = startSession(input({ skill: addSkill('ev', ['input']) }));
    const sq = currentQuestion(state);
    const ok = answer(state, sq, sq.question.answer, 2500, NOW, 'id-1');
    expect(ok.correct).toBe(true);
    expect(ok.event).toEqual({
      clientEventId: 'id-1',
      profileId: 'p1',
      skillId: 'ev',
      correct: true,
      format: 'input',
      difficulty: 1,
      durationMs: 2500,
      createdAt: NOW.toISOString(),
    });
    expect(ok.state.index).toBe(1);
    expect(answer(state, sq, '-1', 2500, NOW, 'id-2').correct).toBe(false);
    expect(state.index).toBe(0); // input state is not mutated
  });
});

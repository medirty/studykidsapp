import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { localApi } from '../../src/services/api';
import { openDb } from '../../src/services/db';
import type { Profile, ProgressEvent } from '../../src/services/types';
import unit from '../../src/content/math/g1/u1.json';
import {
  answer,
  currentQuestion,
  historiesAfter,
  isDone,
  startSession,
} from '../../src/engine/session';
import type { Unit } from '../../src/engine/types';

const now = '2026-11-26T00:00:00.000Z';

function profile(over: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    serverId: null,
    nickname: 'Dina',
    grade: 2,
    avatarId: 'avatar-01',
    locale: 'id',
    prefs: { autoRead: false, reduceMotion: false },
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

function event(over: Partial<ProgressEvent> = {}): ProgressEvent {
  return {
    clientEventId: 'e1',
    profileId: 'p1',
    skillId: 'math.add',
    correct: true,
    format: 'mcq',
    difficulty: 1,
    durationMs: 3000,
    createdAt: now,
    ...over,
  };
}

const persist = vi.fn(async () => true);

beforeEach(async () => {
  const db = await openDb();
  await Promise.all(db.tables.map((t) => t.clear()));
  persist.mockClear();
  vi.stubGlobal('navigator', { storage: { persist } });
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('network not allowed in local mode'))),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('localApi profiles', () => {
  it('creates, reads, updates and deletes a profile', async () => {
    await localApi.saveProfile(profile());
    expect(await localApi.listProfiles()).toEqual([profile()]);

    await localApi.saveProfile(profile({ nickname: 'Dina K', grade: 3 }));
    expect(await localApi.listProfiles()).toEqual([profile({ nickname: 'Dina K', grade: 3 })]);

    await localApi.deleteProfile('p1');
    expect(await localApi.listProfiles()).toEqual([]);
  });

  it('trims the nickname and rejects invalid nickname or grade', async () => {
    await localApi.saveProfile(profile({ nickname: '  Budi  ' }));
    expect((await localApi.listProfiles())[0].nickname).toBe('Budi');
    await expect(localApi.saveProfile(profile({ nickname: '   ' }))).rejects.toThrow();
    await expect(localApi.saveProfile(profile({ nickname: 'x'.repeat(21) }))).rejects.toThrow();
    await expect(localApi.saveProfile(profile({ grade: 7 as never }))).rejects.toThrow();
  });

  it('stores only the declared child fields (no email/phone/photo/location)', async () => {
    const extra = { ...profile(), email: 'a@b.c', phone: '08', photo: 'x', location: 'y' };
    await localApi.saveProfile(extra as Profile);
    expect(Object.keys((await localApi.listProfiles())[0]).sort()).toEqual(
      Object.keys(profile()).sort(),
    );
  });

  it('asks for persistent storage only when the first profile is created', async () => {
    await localApi.saveProfile(profile());
    await localApi.saveProfile(profile({ id: 'p2' }));
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('works when navigator.storage.persist is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(localApi.saveProfile(profile())).resolves.toBeUndefined();
  });

  it('deleting a profile removes its events, mastery, queue and active setting', async () => {
    await localApi.saveProfile(profile());
    await localApi.saveProfile(profile({ id: 'p2' }));
    await localApi.setSetting('activeProfileId', 'p1');
    await localApi.recordProgress(event());
    await localApi.recordProgress(event({ clientEventId: 'e2', profileId: 'p2' }));
    const history = (profileId: string) => ({
      profileId,
      skillId: 's1',
      sessionCounter: 1,
      recent: [],
    });
    await localApi.saveSkillHistory([history('p1'), history('p2')]);

    await localApi.deleteProfile('p1');
    expect(await localApi.listSkillHistory('p1')).toEqual([]);
    expect(await localApi.listSkillHistory('p2')).toEqual([history('p2')]);

    const db = await openDb();
    expect(await db.progressEvents.toArray()).toHaveLength(1);
    expect(await db.syncQueue.where('profileId').equals('p1').count()).toBe(0);
    expect(await localApi.listMastery('p1')).toEqual([]);
    expect(await localApi.listMastery('p2')).toHaveLength(1);
    expect(await localApi.getSetting('activeProfileId')).toBeNull();
  });
});

describe('localApi settings', () => {
  it('reads back what was written, undefined when unset', async () => {
    expect(await localApi.getSetting('locale')).toBeUndefined();
    await localApi.setSetting('locale', 'en');
    expect(await localApi.getSetting('locale')).toBe('en');
  });
});

describe('localApi recordProgress (idempotent queue)', () => {
  it('writes event and queue item, mastery recomputed from the skill events', async () => {
    await localApi.recordProgress(event());
    await localApi.recordProgress(
      event({ clientEventId: 'e2', correct: false, createdAt: '2026-11-26T00:01:00.000Z' }),
    );
    const db = await openDb();
    expect(await db.progressEvents.get('e1')).toEqual(event());
    expect(await db.syncQueue.get('e1')).toMatchObject({ profileId: 'p1', attempts: 0 });
    const lastPracticedAt = '2026-11-26T00:01:00.000Z';
    expect(await localApi.listMastery('p1')).toEqual([
      { profileId: 'p1', skillId: 'math.add', mastery: 44, attempts: 2, stars: 2, lastPracticedAt }, // 2 stars earned after e1 are kept
    ]);
  });

  it('adds XP and streak to the profile; saveProfile does not overwrite them', async () => {
    await localApi.saveProfile(profile());
    await localApi.recordProgress(event());
    await localApi.recordProgress(event({ clientEventId: 'e2', correct: false }));
    await localApi.saveProfile(profile({ nickname: 'Dina K' })); // stale copy without xp/streak
    const [p] = await localApi.listProfiles();
    expect(p).toMatchObject({ nickname: 'Dina K', xp: 12, streak: { count: 1 } });
  });

  it('a repeated clientEventId is a no-op (no duplicate, mastery and XP not reapplied)', async () => {
    await localApi.saveProfile(profile());
    await localApi.recordProgress(event());
    await localApi.recordProgress(event({ correct: false }));
    const db = await openDb();
    expect(await db.progressEvents.count()).toBe(1);
    expect(await db.syncQueue.count()).toBe(1);
    expect((await db.progressEvents.get('e1'))?.correct).toBe(true);
    expect((await localApi.listMastery('p1'))[0].mastery).toBe(100);
    expect((await localApi.listProfiles())[0].xp).toBe(10);
  });
});

describe('a whole session through localApi (T3.7, offline)', () => {
  it('saves the counter at start, records every answer and keeps fingerprints for anti-repeat', async () => {
    await localApi.saveProfile(profile({ grade: 1 }));
    const skill = (unit as Unit).skills[0];
    const start = { profileId: 'p1', grade: 1 as const, skill, others: [], now: new Date(now) };
    let state = startSession({ ...start, histories: await localApi.listSkillHistory('p1') });
    await localApi.saveSkillHistory(historiesAfter(state));
    expect((await localApi.listSkillHistory('p1'))[0]).toMatchObject({
      sessionCounter: 1,
      recent: [],
    });

    while (!isDone(state)) {
      const sq = currentQuestion(state);
      const done = answer(state, sq, sq.question.answer, 1000, new Date(now), `s${state.index}`);
      await localApi.recordProgress(done.event);
      await localApi.saveSkillHistory(historiesAfter(done.state));
      state = done.state;
    }

    const [row] = await localApi.listSkillHistory('p1');
    expect(row.recent).toHaveLength(1);
    expect(row.recent[0]).toHaveLength(8);
    expect(await localApi.listMastery('p1')).toMatchObject([{ skillId: skill.id, attempts: 8 }]);
    expect((await localApi.listProfiles())[0].xp).toBe(80);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('localApi config & network', () => {
  it('serves public settings and demo entitlement without any network request', async () => {
    const s = await localApi.getPublicSettings();
    expect(s.demo.unitLimit).toBe(2);
    expect(s.demo.subjects).toEqual(['math', 'gp', 'art']);
    expect(s.earlyBirdSlotsLeft).toBeNull();
    expect(await localApi.getEntitlement()).toEqual({ plan: 'demo', expiresAt: null });
    expect(fetch).not.toHaveBeenCalled();
  });
});

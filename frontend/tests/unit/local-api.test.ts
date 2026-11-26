import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { localApi } from '../../src/services/api';
import { openDb } from '../../src/services/db';
import type { Profile, ProgressEvent, SkillMastery } from '../../src/services/types';

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

function mastery(value: number, profileId = 'p1'): SkillMastery {
  return { profileId, skillId: 'math.add', mastery: value, attempts: 1, lastPracticedAt: now };
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
    await localApi.recordProgress(event(), mastery(10));
    await localApi.recordProgress(
      event({ clientEventId: 'e2', profileId: 'p2' }),
      mastery(5, 'p2'),
    );

    await localApi.deleteProfile('p1');

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
  it('writes event, mastery and queue item', async () => {
    await localApi.recordProgress(event(), mastery(20));
    const db = await openDb();
    expect(await db.progressEvents.get('e1')).toEqual(event());
    expect(await db.syncQueue.get('e1')).toMatchObject({ profileId: 'p1', attempts: 0 });
    expect(await localApi.listMastery('p1')).toEqual([mastery(20)]);
  });

  it('a repeated clientEventId is a no-op (no duplicate, mastery not reapplied)', async () => {
    await localApi.recordProgress(event(), mastery(20));
    await localApi.recordProgress(event({ correct: false }), mastery(99));
    const db = await openDb();
    expect(await db.progressEvents.count()).toBe(1);
    expect(await db.syncQueue.count()).toBe(1);
    expect((await db.progressEvents.get('e1'))?.correct).toBe(true);
    expect((await localApi.listMastery('p1'))[0].mastery).toBe(20);
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

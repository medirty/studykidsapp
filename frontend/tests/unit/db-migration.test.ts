// Dexie v1 → v2 (ADR D-014 f): only the new `skillHistory` table, existing rows untouched.
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { beforeEach, expect, it } from 'vitest';
import { StudyKidsDb } from '../../src/services/db';

const at = '2026-11-28T00:00:00.000Z';
const v1Rows = {
  profiles: { id: 'p1', nickname: 'Dina', grade: 2, xp: 30 },
  settings: { key: 'activeProfileId', value: 'p1' },
  progressEvents: { clientEventId: 'e1', profileId: 'p1', skillId: 's1', createdAt: at },
  skillMastery: { profileId: 'p1', skillId: 's1', mastery: 80 },
  syncQueue: { clientEventId: 'e1', profileId: 'p1', enqueuedAt: at, attempts: 0 },
};

beforeEach(() => Dexie.delete('studykids'));

it('opens a v1 database as v2 with all v1 data intact and a writable skillHistory', async () => {
  const v1 = new Dexie('studykids');
  v1.version(1).stores({
    profiles: 'id',
    settings: 'key',
    progressEvents: 'clientEventId, profileId, [profileId+skillId], createdAt',
    skillMastery: '[profileId+skillId], profileId',
    syncQueue: 'clientEventId, profileId, enqueuedAt',
  });
  for (const [table, row] of Object.entries(v1Rows)) await v1.table(table).add(row);
  v1.close();

  const db = new StudyKidsDb();
  await db.open();
  expect(db.verno).toBe(2);
  for (const [table, row] of Object.entries(v1Rows)) {
    expect(await db.table(table).toArray()).toEqual([row]);
  }
  const history = { profileId: 'p1', skillId: 's1', sessionCounter: 1, recent: [['ab']] };
  await db.skillHistory.put(history);
  expect(await db.skillHistory.where('profileId').equals('p1').toArray()).toEqual([history]);
  db.close();
});

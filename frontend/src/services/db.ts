// Local IndexedDB schema (ADR D-011 c). Never edit or remove a version: add version(n+1) with an upgrade.
import Dexie, { type EntityTable } from 'dexie';
import type { Profile, ProgressEvent, SettingRow, SkillMastery, SyncQueueItem } from './types';

export class StudyKidsDb extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  settings!: EntityTable<SettingRow, 'key'>;
  progressEvents!: EntityTable<ProgressEvent, 'clientEventId'>;
  skillMastery!: Dexie.Table<SkillMastery, [string, string]>;
  syncQueue!: EntityTable<SyncQueueItem, 'clientEventId'>;

  constructor() {
    super('studykids'); // fixed, not from brand.config.ts: renaming loses data
    this.version(1).stores({
      profiles: 'id',
      settings: 'key',
      progressEvents: 'clientEventId, profileId, [profileId+skillId], createdAt',
      skillMastery: '[profileId+skillId], profileId',
      syncQueue: 'clientEventId, profileId, enqueuedAt',
    });
  }
}

let db: StudyKidsDb | undefined;

/** Shared instance. Dexie closes it on `versionchange` (another tab upgrading). */
export async function openDb(): Promise<StudyKidsDb> {
  db ??= new StudyKidsDb();
  await db.open();
  return db;
}

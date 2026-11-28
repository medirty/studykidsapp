// Data contracts for the local data layer and api.ts (ADR D-011). Types only, no runtime code.
// PRD §8.4: child data = nickname, grade, avatar, progress. Never email, phone, photo or location.
import type { Locale } from '../i18n';
import type { SkillHistory, StreakState } from '../engine/types';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type SubjectId =
  'math' | 'english' | 'science' | 'gp' | 'wellbeing' | 'art' | 'music' | 'computing';
export type QuestionFormat =
  'mcq' | 'input' | 'tf' | 'dragdrop' | 'match' | 'order' | 'tap' | 'listen' | 'draw';

/** Timestamp as `Date.prototype.toISOString()` (UTC), sortable as a string. */
export type IsoUtc = string;

/** Per-child UI preferences. Local only: never synced (PRD §12.2 no. 3, client wins). */
export interface ProfilePrefs {
  autoRead: boolean; // FR-8
  reduceMotion: boolean; // §8.5; prefers-reduced-motion is always honoured on top of this
}

/** Dexie table `profiles`, PK `id`. */
export interface Profile {
  id: string; // client UUID v4
  serverId: number | null; // children.id once merged into a parent account (Phase 4)
  nickname: string; // trimmed, 1–20 chars, rendered as text only
  grade: Grade;
  avatarId: string; // one of the 12 bundled avatars, never an upload
  locale: Locale; // FR-3: language per profile
  prefs: ProfilePrefs;
  createdAt: IsoUtc;
  updatedAt: IsoUtc;
  // Owned by recordProgress (engine/mastery.ts), never by saveProfile; missing on old rows = 0 / empty.
  xp?: number;
  streak?: StreakState;
}

/** Device-wide values, Dexie table `settings` (key-value), PK `key`. */
export interface DeviceSettings {
  activeProfileId: string | null;
  locale: Locale; // used while no profile is active (landing, profile picker)
}
export type SettingKey = keyof DeviceSettings;
export interface SettingRow<K extends SettingKey = SettingKey> {
  key: K;
  value: DeviceSettings[K];
}

/** Dexie table `progressEvents`, PK `clientEventId`. Mirrors server `progress_events` (§12.1). */
export interface ProgressEvent {
  clientEventId: string; // UUID v4, idempotency key end to end
  profileId: string;
  skillId: string;
  correct: boolean;
  format: QuestionFormat;
  difficulty: number;
  durationMs: number;
  createdAt: IsoUtc;
}

/** Dexie table `skillMastery`, PK `[profileId+skillId]`. */
export interface SkillMastery {
  profileId: string;
  skillId: string;
  mastery: number; // 0–100 without decay, formula in engine/mastery.ts (ADR D-014 g)
  attempts: number; // graded events (draw excluded)
  stars: number; // 0–3, never goes down
  lastPracticedAt: IsoUtc;
}

/** Dexie table `syncQueue`, PK `clientEventId`. Removed after the server acknowledges it (Phase 4). */
export interface SyncQueueItem {
  clientEventId: string;
  profileId: string;
  enqueuedAt: IsoUtc;
  attempts: number;
}

/** Client copy for UI gating only; the server enforces access (FR-10). */
export interface Entitlement {
  plan: 'demo' | 'full';
  expiresAt: IsoUtc | null; // null for demo
}

/** Shape of GET /api/settings/public after mapping; local mode reads it from config. */
export interface PublicSettings {
  priceEarlyMonthly: number; // IDR
  priceNormalMonthly: number; // IDR
  yearlyMultiplier: number;
  earlyBirdSlotsLeft: number | null; // null in local mode: counter hidden (FR-1)
  demo: { subjects: SubjectId[]; unitLimit: number };
}

export type ApiMode = 'local' | 'api';

/** The only data gateway for stores. Both adapters write to IndexedDB first (offline-first). */
export interface Api {
  getPublicSettings(): Promise<PublicSettings>;
  getEntitlement(): Promise<Entitlement>;
  listProfiles(): Promise<Profile[]>;
  saveProfile(profile: Profile): Promise<void>;
  /** Also deletes the profile's events, mastery, queue items and skill history (PRD §8.4). */
  deleteProfile(id: string): Promise<void>;
  getSetting<K extends SettingKey>(key: K): Promise<DeviceSettings[K] | undefined>;
  setSetting<K extends SettingKey>(key: K, value: DeviceSettings[K]): Promise<void>;
  /**
   * One transaction: event + queue item, mastery recomputed from the skill's events, profile XP/streak.
   * A repeated clientEventId is a no-op.
   */
  recordProgress(event: ProgressEvent): Promise<void>;
  listMastery(profileId: string): Promise<SkillMastery[]>;
  /** Session counter + recent fingerprints per skill (ADR D-014 f). Device-local, never synced. */
  listSkillHistory(profileId: string): Promise<SkillHistory[]>;
  saveSkillHistory(rows: SkillHistory[]): Promise<void>;
}

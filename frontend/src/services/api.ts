// The only data gateway for stores (ADR D-011 d). Local mode = IndexedDB only, no network.
import localSettings from './public-settings.local.json';
import type { Api, Profile, PublicSettings } from './types';

// Dynamic: Dexie stays out of the initial bundle (PRD §8.1).
const db = () => import('./db').then((m) => m.openDb());

const GRADES = [1, 2, 3, 4, 5, 6];

/** Trust boundary for child data (PRD §8.4): copies only declared fields, validates them. */
function cleanProfile(p: Profile): Profile {
  const nickname = p.nickname.trim();
  if (nickname.length < 1 || nickname.length > 20) throw new Error('Invalid nickname');
  if (!GRADES.includes(p.grade)) throw new Error('Invalid grade');
  const { id, serverId, grade, avatarId, locale, createdAt, updatedAt } = p;
  const prefs = { autoRead: p.prefs.autoRead, reduceMotion: p.prefs.reduceMotion };
  return { id, serverId, nickname, grade, avatarId, locale, prefs, createdAt, updatedAt };
}

export const localApi: Api = {
  getPublicSettings: async () => localSettings as PublicSettings,
  getEntitlement: async () => ({ plan: 'demo', expiresAt: null }),
  listProfiles: async () => (await db()).profiles.toArray(),

  async saveProfile(profile) {
    const row = cleanProfile(profile);
    const d = await db();
    const isFirst = (await d.profiles.count()) === 0;
    // Merge into an existing row: xp/streak belong to recordProgress, a stale store copy must not reset them.
    await d.profiles.put({ ...(await d.profiles.get(row.id)), ...row });
    // Ask the browser not to evict data (Safari 7-day rule, ADR D-011 c); result is advisory.
    if (isFirst) await navigator.storage?.persist?.().catch(() => false);
  },

  async deleteProfile(id) {
    const d = await db();
    await d.transaction('rw', d.tables, async () => {
      await d.profiles.delete(id);
      for (const t of [d.progressEvents, d.skillMastery, d.syncQueue, d.skillHistory]) {
        await t.where('profileId').equals(id).delete();
      }
      if ((await d.settings.get('activeProfileId'))?.value === id) {
        await d.settings.put({ key: 'activeProfileId', value: null });
      }
    });
  },

  getSetting: async (key) => (await (await db()).settings.get(key))?.value as never,
  setSetting: async (key, value) => void (await (await db()).settings.put({ key, value })),

  async recordProgress(event) {
    const [d, { recordAndEnqueue }] = await Promise.all([db(), import('./sync')]);
    await recordAndEnqueue(d, event);
  },

  listMastery: async (profileId) =>
    (await db()).skillMastery.where('profileId').equals(profileId).toArray(),
  listSkillHistory: async (profileId) =>
    (await db()).skillHistory.where('profileId').equals(profileId).toArray(),
  saveSkillHistory: async (rows) => void (await (await db()).skillHistory.bulkPut(rows)),
};

const notYet = () => Promise.reject(new Error('API mode is not available until Phase 4'));

/**
 * Offline-first: device data goes to Dexie first (same as local), server-only reads reject.
 * shortcut: no HTTP yet, Phase 4 adds /api calls + the sync sender.
 */
export const remoteApi: Api = { ...localApi, getPublicSettings: notYet, getEntitlement: notYet };

export const api: Api = import.meta.env.VITE_API_MODE === 'api' ? remoteApi : localApi;

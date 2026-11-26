// Profile store (ADR D-011 b): runes class, write-through to Api, factory for test injection.
import { api as defaultApi } from '../services/api';
import type { Api, Grade, Profile } from '../services/types';
import { uuidV4 } from '../lib/uuid';
import type { Locale } from '../i18n';

const nowIso = () => new Date().toISOString();

export interface NewProfile {
  nickname: string;
  grade: Grade;
  avatarId: string;
  locale: Locale;
}

export class ProfileStore {
  list = $state<Profile[]>([]);
  activeId = $state<string | null>(null);
  /** True when IndexedDB could not be opened; the UI shows an i18n message. */
  failed = $state(false);
  /** Set by the settings store so the UI language follows the active profile. */
  onActiveChange: () => void = () => {};

  constructor(private api: Api) {}

  get active(): Profile | null {
    return this.list.find((p) => p.id === this.activeId) ?? null;
  }

  async load(): Promise<void> {
    try {
      this.list = await this.api.listProfiles();
      const id = (await this.api.getSetting('activeProfileId')) ?? null;
      this.activeId = this.list.some((p) => p.id === id) ? id : null;
      this.failed = false;
    } catch {
      this.failed = true;
    }
    this.onActiveChange();
  }

  async create(input: NewProfile): Promise<Profile> {
    const now = nowIso();
    const profile: Profile = {
      ...input,
      id: uuidV4(),
      serverId: null,
      prefs: { autoRead: false, reduceMotion: false },
      createdAt: now,
      updatedAt: now,
    };
    await this.api.saveProfile(profile);
    this.list = [...this.list, profile];
    await this.select(profile.id);
    return profile;
  }

  async select(id: string): Promise<void> {
    await this.api.setSetting('activeProfileId', id);
    this.activeId = id;
    this.onActiveChange();
  }

  async remove(id: string): Promise<void> {
    await this.api.deleteProfile(id); // also clears activeProfileId in Dexie
    this.list = this.list.filter((p) => p.id !== id);
    if (this.activeId === id) this.activeId = null;
    this.onActiveChange();
  }

  /** Persists a change to the active profile (used by the settings store). */
  async updateActive(patch: Partial<Pick<Profile, 'locale' | 'prefs'>>): Promise<void> {
    const current = this.active;
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: nowIso() };
    await this.api.saveProfile(next);
    this.list = this.list.map((p) => (p.id === next.id ? next : p));
  }
}

export const createProfileStore = (api: Api) => new ProfileStore(api);
export const profile = createProfileStore(defaultApi);

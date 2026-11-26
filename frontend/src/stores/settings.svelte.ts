// Settings store (ADR D-011 b): locale of the active profile (or device while none), prefs.
import { api as defaultApi } from '../services/api';
import type { Api, ProfilePrefs } from '../services/types';
import { setLocale, type Locale } from '../i18n';
import { profile as defaultProfile, type ProfileStore } from './profile.svelte';

const DEFAULT_PREFS: ProfilePrefs = { autoRead: false, reduceMotion: false };

export class SettingsStore {
  private deviceLocale = $state<Locale>('id');

  constructor(
    private api: Api,
    private profiles: ProfileStore,
  ) {
    profiles.onActiveChange = () => setLocale(this.locale);
  }

  get locale(): Locale {
    return this.profiles.active?.locale ?? this.deviceLocale;
  }

  get prefs(): ProfilePrefs {
    return this.profiles.active?.prefs ?? DEFAULT_PREFS;
  }

  async load(): Promise<void> {
    await this.profiles.load();
    const stored = await this.api.getSetting('locale').catch(() => undefined);
    if (stored) this.deviceLocale = stored;
    setLocale(this.locale);
  }

  async setLocale(locale: Locale): Promise<void> {
    if (this.profiles.active) await this.profiles.updateActive({ locale });
    else {
      await this.api.setSetting('locale', locale);
      this.deviceLocale = locale;
    }
    setLocale(locale);
  }

  async setPref<K extends keyof ProfilePrefs>(key: K, value: ProfilePrefs[K]): Promise<void> {
    await this.profiles.updateActive({ prefs: { ...this.prefs, [key]: value } });
  }
}

export const createSettingsStore = (api: Api, profiles: ProfileStore) =>
  new SettingsStore(api, profiles);
export const settings = createSettingsStore(defaultApi, defaultProfile);

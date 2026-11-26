// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { getLocale } from '../../src/i18n';
import { localApi } from '../../src/services/api';
import { openDb } from '../../src/services/db';
import { createEntitlementStore } from '../../src/stores/entitlement.svelte';
import { createProfileStore } from '../../src/stores/profile.svelte';
import { createSettingsStore } from '../../src/stores/settings.svelte';
import localSettings from '../../src/services/public-settings.local.json';

const kid = (nickname: string, locale: 'id' | 'en') => ({
  nickname,
  grade: 3 as const,
  avatarId: 'avatar-01',
  locale,
});

function fresh() {
  const profiles = createProfileStore(localApi);
  const settings = createSettingsStore(localApi, profiles);
  return { profiles, settings };
}

beforeEach(async () => {
  const db = await openDb();
  await Promise.all(db.tables.map((t) => t.clear()));
  localStorage.clear();
});

describe('profile + settings stores', () => {
  it('switching profile makes the locale follow it', async () => {
    const { profiles, settings } = fresh();
    const a = await profiles.create(kid('Dina', 'id'));
    const b = await profiles.create(kid('Alex', 'en'));
    expect(getLocale()).toBe('en');
    await profiles.select(a.id);
    expect(settings.locale).toBe('id');
    expect(getLocale()).toBe('id');
    await profiles.select(b.id);
    expect(getLocale()).toBe('en');
  });

  it('persists locale and prefs in Dexie and restores them after reload', async () => {
    const { profiles, settings } = fresh();
    await profiles.create(kid('Dina', 'id'));
    await settings.setLocale('en');
    await settings.setPref('autoRead', true);

    const again = fresh();
    await again.settings.load();
    expect(again.profiles.active?.nickname).toBe('Dina');
    expect(again.settings.locale).toBe('en');
    expect(again.settings.prefs).toEqual({ autoRead: true, reduceMotion: false });
    expect(getLocale()).toBe('en');
  });

  it('keeps the device locale while no profile is active', async () => {
    const { settings } = fresh();
    await settings.setLocale('en');
    const again = fresh();
    await again.settings.load();
    expect(again.profiles.active).toBeNull();
    expect(again.settings.locale).toBe('en');
  });

  it('removing the active profile clears the selection', async () => {
    const { profiles } = fresh();
    const p = await profiles.create(kid('Dina', 'id'));
    await profiles.remove(p.id);
    expect(profiles.active).toBeNull();
    expect(profiles.list).toEqual([]);
  });

  it('flags a storage failure instead of throwing', async () => {
    const broken = createProfileStore({
      ...localApi,
      listProfiles: () => Promise.reject(new Error('IndexedDB blocked')),
    });
    await broken.load();
    expect(broken.failed).toBe(true);
  });

  it('still switches language when saving fails (no unhandled rejection)', async () => {
    const profiles = createProfileStore({
      ...localApi,
      setSetting: () => Promise.reject(new Error('IndexedDB blocked')),
    });
    const settings = createSettingsStore(
      { ...localApi, setSetting: () => Promise.reject(new Error('blocked')) },
      profiles,
    );
    await settings.setLocale('en');
    expect(getLocale()).toBe('en');
    expect(settings.locale).toBe('en');
    expect(profiles.failed).toBe(true);
  });
});

describe('entitlement store', () => {
  it('local mode is demo with the unit limit from public settings', async () => {
    const store = createEntitlementStore(localApi);
    await store.load();
    expect(store.isFull).toBe(false);
    expect(store.unitLimit).toBe(localSettings.demo.unitLimit);
  });
});

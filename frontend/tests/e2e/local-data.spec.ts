import { expect, test, type Page } from '@playwright/test';
import { build, type Rolldown } from 'vite';

// No screen writes data yet (T2.11), so the real services/api.ts is bundled here and injected
// into the preview page: same origin = same IndexedDB the app uses.
let bundle = '';

test.beforeAll(async () => {
  const out = (await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      lib: { entry: 'src/services/api.ts', formats: ['es'], fileName: 'api' },
      rolldownOptions: { output: { codeSplitting: false } },
    },
  })) as Rolldown.RolldownOutput[];
  const chunk = out[0].output[0];
  bundle = chunk.type === 'chunk' ? chunk.code : '';
});

async function inject(page: Page) {
  await page.evaluate(async (code) => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    Object.assign(window, { __api: (await import(/* @vite-ignore */ url)).localApi });
  }, bundle);
}

test('profile and progress survive a reload, without network requests', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle'); // app's own startup requests are not ours to count
  await inject(page);
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));

  await page.evaluate(async () => {
    const api = (window as unknown as { __api: import('../../src/services/types').Api }).__api;
    const at = new Date().toISOString();
    await api.saveProfile({
      ...{ id: 'p-e2e', serverId: null, nickname: 'Kiko', grade: 1, avatarId: 'avatar-01' },
      ...{ locale: 'id', prefs: { autoRead: false, reduceMotion: false } },
      ...{ createdAt: at, updatedAt: at },
    });
    const event = {
      ...{ clientEventId: 'e-e2e', profileId: 'p-e2e', skillId: 'math.add', correct: true },
      ...{ format: 'mcq' as const, difficulty: 1, durationMs: 1000, createdAt: at },
    };
    await api.recordProgress(event);
    await api.recordProgress({ ...event, correct: false }); // same clientEventId: ignored
  });
  expect(requests).toEqual([]);

  await page.reload();
  await inject(page);
  const after = await page.evaluate(async () => {
    const api = (window as unknown as { __api: import('../../src/services/types').Api }).__api;
    return { profiles: await api.listProfiles(), mastery: await api.listMastery('p-e2e') };
  });
  expect(after.profiles.map((p) => p.nickname)).toEqual(['Kiko']);
  expect(after.mastery.map((m) => m.mastery)).toEqual([100]);
  expect(after.profiles[0].xp).toBe(10);
});

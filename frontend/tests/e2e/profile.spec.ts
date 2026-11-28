import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

test('buat profil → beranda dalam 3 tap; profil bertahan setelah reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Coba Gratis' }).click(); // tap 1
  await page.getByText('Kelas 3', { exact: true }).click(); // tap 2
  await page.getByLabel('Nama panggilan').fill('Dina');
  await page.getByRole('button', { name: 'Mulai belajar' }).click(); // tap 3
  await expect(page.getByRole('heading', { level: 2, name: 'Halo, Dina!' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 2, name: 'Halo, Dina!' })).toBeVisible();

  await page.goto('/#/start');
  await expect(page.getByRole('button', { name: /Dina/ })).toBeVisible();
});

test('profil tanpa nama ditolak dengan pesan ramah', async ({ page }) => {
  await page.goto('/#/start');
  await page.getByRole('button', { name: 'Mulai belajar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test('Pilih kelas & Beranda: tanpa scroll horizontal + axe bersih', async ({ page }) => {
  for (const hash of ['/#/start', null]) {
    if (hash) await page.goto(hash);
    else {
      await page.getByText('Kelas 1', { exact: true }).click();
      await page.getByLabel('Nama panggilan').fill('Dina');
      await page.getByRole('button', { name: 'Mulai belajar' }).click();
      await expect(page.getByRole('heading', { level: 2, name: 'Halo, Dina!' })).toBeVisible();
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad, JSON.stringify(bad, null, 2)).toEqual([]);
  }
});

test('bahasa pilihan bertahan setelah reload (tanpa dan dengan profil)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Ganti bahasa/ }).click();
  await expect(page.getByRole('button', { name: /Switch language/i })).toBeVisible(); // tersimpan
  await page.reload();
  await expect(page.getByRole('button', { name: /Switch language/i })).toBeVisible();

  await page.goto('/#/start');
  await page.getByText('Grade 3', { exact: true }).click();
  await page.getByLabel('Nickname').fill('Dina');
  await page.getByRole('button', { name: 'Start learning' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Hi, Dina!' })).toBeVisible();
  await page.getByRole('button', { name: /Switch language/i }).click();
  await expect(page.getByRole('button', { name: /Ganti bahasa/ })).toBeVisible(); // UI dulu
  await expect.poll(() => storedProfileLocale(page)).toBe('id'); // tunggu simpan ke IndexedDB
  await page.reload();
  await expect(page.getByRole('heading', { level: 2, name: 'Halo, Dina!' })).toBeVisible();
});

function storedProfileLocale(page: Page): Promise<string | undefined> {
  return page.evaluate(
    () =>
      new Promise<string | undefined>((resolve, reject) => {
        const open = indexedDB.open('studykids');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const all = open.result.transaction('profiles').objectStore('profiles').getAll();
          all.onsuccess = () => {
            open.result.close();
            resolve(all.result[0]?.locale);
          };
        };
      }),
  );
}

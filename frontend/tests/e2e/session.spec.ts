import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// E2 (Fase 3): coba demo → sesi → ringkasan, offline; progres bertahan setelah reload.
async function answerOne(page: Page) {
  const check = page.getByRole('button', { name: 'Periksa' });
  await expect(check).toBeVisible();
  // Pilihan / tombol keypad pertama: menerima mcq, input (angka), dan tf.
  await page
    .locator('main button:not([disabled]):not([aria-label="Dengarkan"])')
    .filter({ hasNotText: 'Periksa' })
    .first()
    .click();
  await check.click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
}

test('sesi offline: Beranda → Math → skill → 8 soal → ringkasan; progres bertahan', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/#/start');
  await page.getByText('Kelas 1', { exact: true }).click();
  await page.getByLabel('Nama panggilan').fill('Dina');
  await page.getByRole('button', { name: 'Mulai belajar' }).click();
  await page.getByRole('button', { name: /Math/ }).click();
  await page.getByRole('link', { name: /Menjumlah dua bilangan satu angka/ }).click();
  await expect(page.getByText('Soal 1 dari 8')).toBeVisible();
  // Seperti pengguna nyata: service worker sudah memegang halaman (precache lengkap) sebelum offline.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await expect(page.getByText('Soal 1 dari 8')).toBeVisible();

  await context.setOffline(true);
  const overflow = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
  expect(await overflow()).toBe(false);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

  for (let i = 0; i < 8; i++) await answerOne(page);
  await expect(page.getByRole('heading', { name: 'Kerja bagus, Dina!' })).toBeVisible();
  expect(await overflow()).toBe(false);

  const counts = () =>
    page.evaluate(
      () =>
        new Promise<[number, number]>((resolve, reject) => {
          const open = indexedDB.open('studykids');
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const tx = open.result.transaction(['progressEvents', 'syncQueue'], 'readonly');
            const a = tx.objectStore('progressEvents').count();
            const b = tx.objectStore('syncQueue').count();
            tx.oncomplete = () => resolve([a.result, b.result]);
          };
        }),
    );
  expect(await counts()).toEqual([8, 8]);

  await page.goto('/#/home'); // hash route, tanpa jaringan
  await expect(page.getByRole('link', { name: 'Lanjut belajar' })).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  expect(await counts()).toEqual([8, 8]);
  await expect(page.getByRole('link', { name: 'Lanjut belajar' })).toBeVisible();
});

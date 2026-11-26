import { expect, test } from '@playwright/test';

test('navigasi antar-route, back, 404 ramah, toggle bahasa', async ({ page }) => {
  const h1 = page.getByRole('heading', { level: 1 });
  await page.goto('/');
  await expect(h1).toBeVisible();

  await page.evaluate(() => (location.hash = '#/start'));
  await expect(h1).toHaveText(/Pilih kelas/);
  await page.evaluate(() => (location.hash = '#/home'));
  await expect(h1).toHaveText(/Beranda/);
  await page.goBack();
  await expect(h1).toHaveText(/Pilih kelas/);

  await page.evaluate(() => (location.hash = '#/tidak-ada'));
  await expect(h1).toHaveText(/tidak ketemu/);
  await page.getByRole('link', { name: /Kembali ke awal/ }).click();
  await expect(h1).toHaveText(/Kiko/);

  await page.getByRole('button', { name: /Ganti bahasa/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

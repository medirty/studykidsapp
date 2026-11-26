import { expect, test } from '@playwright/test';

test('landing: Coba Gratis → pilih kelas dalam 1 klik; harga tampil; meta SEO', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /kelas 1–6/);
  await expect(page.getByText(/Harga early bird Rp50\.000/)).toBeVisible();
  await page.getByRole('link', { name: 'Coba Gratis' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Pilih kelas/);
});

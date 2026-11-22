import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('hello-world tampil tanpa scroll horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test('aksesibilitas: 0 pelanggaran serius', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

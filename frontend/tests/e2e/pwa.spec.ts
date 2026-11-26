import { expect, test } from '@playwright/test';

test('PWA: manifest valid, service worker aktif, shell terbuka offline', async ({
  page,
  context,
}) => {
  await page.goto('/');
  const href = await page.evaluate(
    () => document.querySelector<HTMLLinkElement>('link[rel=manifest]')?.href,
  );
  expect(href).toBeTruthy();
  const manifest = await (await page.request.get(href!)).json();
  expect(manifest.name).toBe('StudyKids');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual([
    '192x192',
    '512x512',
    '512x512',
  ]);
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // dikontrol SW setelah kunjungan pertama
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

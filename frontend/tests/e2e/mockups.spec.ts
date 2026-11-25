import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Semua docs/mockups/*.html otomatis dicek (layar baru tidak perlu ubah spec).
// Cukup sekali (project desktop); viewport diatur sendiri per test.
const dir = resolve(process.cwd(), '../docs/mockups');
const pages = readdirSync(dir).filter((f) => f.endsWith('.html'));
const viewports = [
  { name: '360', width: 360, height: 740 },
  { name: '1280', width: 1280, height: 800 },
];

for (const file of pages) {
  for (const vp of viewports) {
    test(`mockup ${file} @${vp.name}: tanpa scroll horizontal & axe bersih`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'dicek sekali di project desktop');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(pathToFileURL(resolve(dir, file)).href);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
}

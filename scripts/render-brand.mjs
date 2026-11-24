// Render brand PNGs from SVG sources in docs/brand (needs Playwright's Chromium).
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../docs/brand/', import.meta.url));
const jobs = [
  ['favicon.svg', 'favicon-32.png', 32],
  ['favicon.svg', 'pwa-192.png', 192],
  ['favicon.svg', 'pwa-512.png', 512],
  ['maskable-source.svg', 'maskable-512.png', 512],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out, size] of jobs) {
  const svg = readFileSync(dir + src, 'utf8').replace(/ width="\d+" height="\d+"/, ` width="${size}" height="${size}"`);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
  writeFileSync(dir + out, await page.screenshot({ omitBackground: true }));
}
await browser.close();

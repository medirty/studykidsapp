import { defineConfig, devices } from '@playwright/test';

// Semua project memakai Chromium (hemat unduhan); viewport & UA mengikuti perangkat (PRD §15.1).
const chromium = { browserName: 'chromium' as const, defaultBrowserType: 'chromium' as const };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  projects: [
    { name: 'pixel-5', use: { ...devices['Pixel 5'], ...chromium } },
    { name: 'iphone-12', use: { ...devices['iPhone 12'], ...chromium } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

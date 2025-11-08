import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run sequentially for E2E tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run one test at a time

  // Global setup/teardown
  globalSetup: path.join(__dirname, 'e2e', 'global-setup.js'),
  globalTeardown: path.join(__dirname, 'e2e', 'global-teardown.js'),

  reporter: [
    ['html', { open: 'never' }], // Generate report but don't auto-serve (blocking)
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL
      || (process.env.VITE_PORT ? `http://localhost:${process.env.VITE_PORT}` : 'http://localhost:5174'),
    // Only record on failures to save ~40-50% test time
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Note: Start test servers manually with: pnpm test:e2e:start
  // Stop them with: pnpm test:e2e:stop
});

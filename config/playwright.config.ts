import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: path.join(projectRoot, 'tests', 'e2e', 'specs'),
  testMatch: '**/*.spec.{js,ts}', // Support both .js and .ts files
  fullyParallel: false, // Run sequentially for E2E tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run one test at a time

  // Global setup/teardown
  globalSetup: path.join(projectRoot, 'tests', 'e2e', 'support', 'global-setup.ts'),
  globalTeardown: path.join(projectRoot, 'tests', 'e2e', 'support', 'global-teardown.ts'),

  reporter: [
    [
      'html',
      { outputFolder: path.join(projectRoot, '.test-output', 'playwright-report'), open: 'never' },
    ], // Generate report but don't auto-serve (blocking)
    ['list'],
  ],

  outputDir: path.join(projectRoot, '.test-output', 'test-results'),

  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      (process.env.VITE_PORT
        ? `http://localhost:${process.env.VITE_PORT}`
        : 'http://localhost:5174'),
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

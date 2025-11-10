/**
 * Global setup for Playwright E2E tests
 * Resets test database and cleans up existing processes
 */
export default async function globalSetup(): Promise<void> {
  console.warn('🧪 Setting up E2E test environment...');
  console.warn('🧹 Cleaning test database...');

  // Database cleanup is handled by the test script before running Playwright
  // This runs inside the Docker container where docker CLI isn't available

  console.warn('🚀 Test environment ready');
}

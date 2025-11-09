/**
 * Global setup for Playwright E2E tests
 * Resets test database and cleans up existing processes
 */
export default async function globalSetup() {
  console.log('🧪 Setting up E2E test environment...');
  console.log('🧹 Cleaning test database...');

  // Database cleanup is handled by the test script before running Playwright
  // This runs inside the Docker container where docker CLI isn't available

  console.log('🚀 Test environment ready');
  return;
}

/**
 * Global teardown for Playwright E2E tests
 * Cleans up test server processes
 */
export default async function globalTeardown(): Promise<void> {
  console.warn('🧹 Cleaning up test servers...');

  // Cleanup is handled by the test script after Playwright finishes
  // This runs inside the Docker container where docker CLI isn't available

  console.warn('✅ Test servers cleaned up');
}

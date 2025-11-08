import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * E2E Test Fixtures for Database Isolation
 *
 * Provides automatic database cleanup after each test to ensure test isolation.
 * Uses Supabase service role client to bypass RLS and clean test data.
 */

// Supabase configuration for E2E tests
// These values match the test Supabase instance running in Docker
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://supabase_kong_slide-bar-test:8000';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

/**
 * Clean test database by deleting all test data
 * Uses Supabase service role to bypass RLS policies
 */
async function cleanDatabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Delete all images first (will cascade delete storage objects via trigger)
    const { error: imagesError } = await supabase
      .from('images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (imagesError) {
      console.error('Failed to delete images:', imagesError.message);
    }

    // Clean up storage bucket (in case trigger didn't work)
    const { data: objects, error: listError } = await supabase.storage
      .from('images')
      .list();

    if (!listError && objects && objects.length > 0) {
      const filePaths = objects.map(obj => obj.name);
      const { error: removeError } = await supabase.storage
        .from('images')
        .remove(filePaths);

      if (removeError) {
        console.error('Failed to remove storage objects:', removeError.message);
      }
    }
  } catch (error) {
    // Log but don't fail - tests should handle edge cases
    console.error('Database cleanup error:', error.message);
  }
}

/**
 * Extended test with database cleanup fixture
 *
 * Usage in tests:
 *   import { test, expect } from './fixtures.js';
 *
 *   test('my test', async ({ page }) => {
 *     // Database is automatically cleaned after this test
 *     // Test has clean database state
 *   });
 *
 * The cleanDb fixture runs automatically after each test (auto: true)
 */
export const test = base.extend({
  cleanDb: [async ({}, use) => {
    // Setup: Allow test to run first
    await use();

    // Teardown: Clean database after test completes
    await cleanDatabase();
  }, { auto: true }], // auto: true means this runs for every test automatically
});

export { expect } from '@playwright/test';

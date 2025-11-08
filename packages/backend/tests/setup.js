/**
 * Vitest setup file - runs before each test file
 *
 * This file sets up the test environment, including database cleanup
 * before each test to ensure test isolation.
 */

import { beforeEach, afterAll } from 'vitest';
import { truncateDatabase, disconnectDatabase } from './helpers/database.js';

// Ensure TEST_DATABASE_URL is set
if (!process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
  console.warn(
    '⚠️  WARNING: Neither TEST_DATABASE_URL nor DATABASE_URL is set. ' +
      'Tests will fail if they need database access.'
  );
}

// Truncate database before each test for isolation
beforeEach(async () => {
  await truncateDatabase();
});

// Disconnect from database after all tests in this file
afterAll(async () => {
  await disconnectDatabase();
});

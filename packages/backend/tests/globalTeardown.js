/**
 * Vitest global teardown - runs once after all tests
 *
 * This ensures proper cleanup of database connections.
 */

import { disconnectDatabase } from './helpers/database.js';

export default async function globalTeardown() {
  await disconnectDatabase();
  console.warn('✅ Database connections closed');
}

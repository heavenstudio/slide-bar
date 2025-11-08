/**
 * Vitest global setup - runs once before all tests
 *
 * This ensures the database is in a clean state before running any tests.
 */

import { PrismaClient } from '@prisma/client';

export default async function globalSetup() {
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn('⚠️  No database URL configured for tests');
    return;
  }

  const prisma = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });

  try {
    // Clean database before starting tests
    await prisma.$transaction(async (tx) => {
      await tx.image.deleteMany();
      await tx.user.deleteMany();
      await tx.organization.deleteMany();
    });

    console.warn('✅ Database cleaned for test run');
  } catch (error) {
    console.error('❌ Failed to clean database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

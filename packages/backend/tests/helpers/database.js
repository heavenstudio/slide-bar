import { PrismaClient } from '@prisma/client';

let prisma;

/**
 * Get or create Prisma client for test database
 * Uses TEST_DATABASE_URL if available, otherwise falls back to DATABASE_URL
 */
export function getPrismaClient() {
  if (!prisma) {
    const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('TEST_DATABASE_URL or DATABASE_URL must be set for tests');
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: process.env.DEBUG_PRISMA ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Truncate all tables in the test database automatically
 *
 * This uses a single transaction to delete all records from all tables,
 * respecting foreign key constraints by deleting in the correct order.
 *
 * This should be called in beforeEach hooks to ensure test isolation.
 */
export async function truncateDatabase() {
  const client = getPrismaClient();

  try {
    await client.$transaction(async (tx) => {
      // Delete in order that respects foreign key constraints
      // Children first, then parents
      await tx.image.deleteMany();
      await tx.user.deleteMany();
      await tx.organization.deleteMany();
    });
  } catch (error) {
    // Only log in debug mode to avoid noise in test output
    if (process.env.DEBUG_DB_CLEANUP) {
      console.error('[DB Cleanup] Error during truncation:', error.message);
    }
    // Don't throw - this might fail on first run if tables don't exist yet
  }
}

/**
 * Create a test organization for use in tests
 * Returns the created organization
 */
export async function createTestOrganization(name = 'Test Organization') {
  const client = getPrismaClient();
  return await client.organization.create({
    data: { name },
  });
}

/**
 * Create a test user for use in tests
 * Returns the created user
 */
export async function createTestUser(organizationId, data = {}) {
  const client = getPrismaClient();
  return await client.user.create({
    data: {
      email: data.email || 'test@example.com',
      password: data.password || 'hashed-password',
      name: data.name || 'Test User',
      organizationId,
    },
  });
}

/**
 * Disconnect Prisma client
 * Should be called in afterAll hook or global teardown
 */
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    globalSetup: './tests/globalSetup.js',
    globalTeardown: './tests/globalTeardown.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.config.js', '**/prisma/**'],
    },
    // Run tests sequentially to avoid database conflicts
    // Parallel execution requires per-worker database isolation which adds complexity
    // For now, sequential execution is the safest and simplest approach
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});

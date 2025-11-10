import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/config/setup.ts',
    include: ['tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'tests/e2e/**/*.spec.{js,ts}'],
    // Run tests sequentially to avoid database conflicts in integration tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './.test-output/coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    env: {
      // Supabase environment configuration
      // Defaults to TEST instance (port 55321) but can be overridden by shell env vars (e.g., CI uses 54321)
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:55321',
      VITE_SUPABASE_ANON_KEY:
        process.env.VITE_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
      SUPABASE_SERVICE_KEY:
        process.env.SUPABASE_SERVICE_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
    },
  },
});

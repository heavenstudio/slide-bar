-- Seed file for Supabase local development
-- This file is run after migrations to set up test data

-- Create demo organization (already in migration, but safe to run again)
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Note: We cannot create auth users via SQL INSERT in seed.sql
-- The demo user must be created via Supabase Admin API or signup
-- For E2E tests, we'll create the user programmatically in the test setup

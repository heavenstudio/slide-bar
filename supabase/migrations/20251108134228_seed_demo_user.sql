-- Seed demo user and organization
-- Created: 2025-11-08
-- This migration creates a demo organization and user for testing

-- Create demo organization
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Note: Demo user creation has been moved to a post-migration script
-- that uses Supabase Admin API to properly create authenticated users
-- See scripts/create-demo-user.sh for user creation logic

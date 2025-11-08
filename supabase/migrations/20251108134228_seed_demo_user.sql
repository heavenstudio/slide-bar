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

-- Create demo user in auth.users (Supabase Auth)
-- Note: This uses the auth schema which is managed by Supabase
-- Password: demo-password-123 (hashed with bcrypt)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  -- This is bcrypt hash of 'demo-password-123'
  -- Generated using: https://bcrypt-generator.com/ with 10 rounds
  '$2a$10$rRJvGVYKKvKxPHLs8ypXUeVKQkEqGqMHJqU.UqB.5yVYaXGxVqYDC',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo User"}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Create corresponding user record in public.users table
INSERT INTO users (id, email, password, name, organization_id, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'demo@example.com',
  '$2a$10$rRJvGVYKKvKxPHLs8ypXUeVKQkEqGqMHJqU.UqB.5yVYaXGxVqYDC',
  'Demo User',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create identity for the demo user (required for Supabase Auth)
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000002',
    'email', 'demo@example.com'
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Add RLS policies for users table
-- Created: 2025-11-08
-- This migration enables RLS on the users table and adds policies for authenticated users

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own user record
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow service_role to bypass RLS (for admin operations)
-- Note: service_role already has RLS bypass, but we make it explicit for clarity

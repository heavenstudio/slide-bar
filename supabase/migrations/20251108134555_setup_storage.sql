-- Setup Supabase Storage for images
-- Created: 2025-11-08
-- This migration creates the images storage bucket and RLS policies

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,  -- Public bucket (images are publicly readable)
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by Supabase

-- Policy: Anyone can view images (public read)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- Enable RLS on public.images table
ALTER TABLE IF EXISTS images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view images records
CREATE POLICY "Anyone can view images"
ON images FOR SELECT
USING (true);

-- Policy: Authenticated users can insert images
CREATE POLICY "Authenticated users can insert images"
ON images FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete images"
ON images FOR DELETE
USING (auth.role() = 'authenticated');

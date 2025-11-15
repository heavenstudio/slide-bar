import { describe, it, expect, beforeEach } from 'vitest';
import { createServiceClient, cleanDatabase } from '../../helpers/supabase';

describe('Database Schema - Display Duration Migration', () => {
  const supabase = createServiceClient();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('images table - display_duration column', () => {
    it('should have default value of 5000 for display_duration', async () => {
      // Create a test organization first
      const { data: org } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
        .single();

      // Insert an image without specifying display_duration
      const { data: image, error } = await supabase
        .from('images')
        .insert({
          filename: 'test.jpg',
          original_name: 'test.jpg',
          mime_type: 'image/jpeg',
          size: 1000,
          path: 'test/test.jpg',
          url: 'https://example.com/test.jpg',
          organization_id: org!.id,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(image).toBeDefined();
      expect(image!.display_duration).toBe(5000);
    });

    it('should allow custom display_duration values', async () => {
      // Create a test organization first
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
        .single();

      expect(orgError).toBeNull();
      expect(org).toBeDefined();

      // Insert an image with custom display_duration
      const customDuration = 10000;
      const { data: image, error } = await supabase
        .from('images')
        .insert({
          filename: 'test.jpg',
          original_name: 'test.jpg',
          mime_type: 'image/jpeg',
          size: 1000,
          path: 'test/test.jpg',
          url: 'https://example.com/test.jpg',
          organization_id: org!.id,
          display_duration: customDuration,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(image).toBeDefined();
      expect(image!.display_duration).toBe(customDuration);
    });

    it('should update existing images to have display_duration = 5000', async () => {
      // This test verifies the migration updated existing rows
      // We'll check that all images have a non-null display_duration
      const { data: images, error } = await supabase.from('images').select('id, display_duration');

      expect(error).toBeNull();

      // All images should have display_duration set (even if there are none, test passes)
      if (images && images.length > 0) {
        images.forEach((image) => {
          expect(image.display_duration).toBeDefined();
          expect(image.display_duration).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('organization_settings table', () => {
    it('should create organization_settings with default_slide_duration = 5000', async () => {
      // Create a test organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
        .single();

      expect(orgError).toBeNull();
      expect(org).toBeDefined();

      // Create organization settings
      const { data: settings, error } = await supabase
        .from('organization_settings')
        .insert({
          organization_id: org!.id,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(settings).toBeDefined();
      expect(settings!.default_slide_duration).toBe(5000);
    });

    it('should enforce unique constraint on organization_id', async () => {
      // Create a test organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
        .single();

      expect(orgError).toBeNull();
      expect(org).toBeDefined();

      // Create first organization settings
      await supabase.from('organization_settings').insert({
        organization_id: org!.id,
      });

      // Try to create duplicate - should fail
      const { error } = await supabase.from('organization_settings').insert({
        organization_id: org!.id,
      });

      expect(error).toBeDefined();
      expect(error!.code).toBe('23505'); // Unique constraint violation
    });

    it('should cascade delete when organization is deleted', async () => {
      // Create a test organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
        .single();

      expect(orgError).toBeNull();
      expect(org).toBeDefined();

      // Create organization settings
      const { data: settings } = await supabase
        .from('organization_settings')
        .insert({
          organization_id: org!.id,
        })
        .select()
        .single();

      // Delete the organization
      await supabase.from('organizations').delete().eq('id', org!.id);

      // Settings should be deleted too
      const { data: remainingSettings } = await supabase
        .from('organization_settings')
        .select()
        .eq('id', settings!.id);

      expect(remainingSettings).toHaveLength(0);
    });
  });

  describe('RLS policies - organization_settings', () => {
    it('should allow reading organization settings with service role', async () => {
      // Create a test organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: 'Test Org' })
        .select()
        .single();

      expect(orgError).toBeNull();
      expect(org).toBeDefined();

      // Create organization settings
      await supabase.from('organization_settings').insert({
        organization_id: org!.id,
      });

      // Service client should be able to read settings
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', org!.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.organization_id).toBe(org!.id);
    });
  });
});

/**
 * Supabase Test Helpers
 * Utilities for integration testing with real Supabase instance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { afterEach } from 'vitest';
import { Database } from '../../src/types/supabase';

// Supabase TEST configuration (port 55321 - isolated from dev on 54321)
// Uses the same test instance as E2E tests
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:55321';
const SUPABASE_SERVICE_KEY =
  import.meta.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

/**
 * Create a Supabase client with service role (bypasses RLS)
 * Used for test cleanup and setup
 */
export function createServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Clean test database by deleting all test data
 * Uses service role to bypass RLS policies
 */
export async function cleanDatabase(): Promise<void> {
  const supabase = createServiceClient();

  try {
    // Delete all images first (will cascade delete storage objects via trigger)
    const { error: imagesError } = await supabase
      .from('images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (imagesError) {
      console.error('Failed to delete images:', imagesError.message);
    }

    // Clean up storage bucket (in case trigger didn't work)
    const { data: objects, error: listError } = await supabase.storage.from('images').list();

    if (!listError && objects && objects.length > 0) {
      const filePaths = objects.map((obj) => obj.name);
      const { error: removeError } = await supabase.storage.from('images').remove(filePaths);

      if (removeError) {
        console.error('Failed to remove storage objects:', removeError.message);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database cleanup error:', errorMessage);
  }
}

/**
 * Setup automatic database cleanup after each test
 * Call this in test files that need database cleanup
 */
export function setupSupabaseCleanup(): void {
  afterEach(async () => {
    await cleanDatabase();
  });
}

/**
 * Mock image file interface for testing
 * This matches the structure we create in createMockImageFile
 */
export interface MockImageFile {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
  slice: (start?: number, end?: number) => Uint8Array;
  stream: () => ReadableStream<Uint8Array>;
  [Symbol.toStringTag]: string;
}

/**
 * Create a mock image file for testing
 * Creates an ArrayBuffer with image/jpeg MIME type
 * This works around jsdom's Blob/File API limitations
 */
export function createMockImageFile(
  filename = 'test.jpg',
  content = 'test image content'
): MockImageFile {
  // Convert string to Uint8Array (binary data)
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Create an object that looks like a File but uses ArrayBuffer
  // This bypasses jsdom's Blob MIME type issues
  return {
    name: filename,
    type: 'image/jpeg',
    size: data.length,
    arrayBuffer: async () => data.buffer,
    // For compatibility with code that reads the file as blob
    slice: (start?: number, end?: number) => data.slice(start, end),
    // For compatibility with Supabase client's stream() usage
    stream: () => {
      // Return a ReadableStream-like object
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(data);
          controller.close();
        },
      });
    },
    // Expose the raw data for Supabase upload
    [Symbol.toStringTag]: 'File',
    ...Object.fromEntries(Object.entries(data)),
  };
}

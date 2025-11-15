/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for use throughout the application.
 * Supports both local development and production environments.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// CRITICAL: Use test instance (port 55321) when running tests
// to prevent tests from modifying dev/production data
const isTest = import.meta.env.MODE === 'test' || import.meta.env.VITEST;

// Get Supabase configuration from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Override to test instance when running tests
if (isTest) {
  supabaseUrl = 'http://127.0.0.1:55321';
  supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
}

// Provide default values if not configured (allows module to load without errors)
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

/**
 * Supabase client instance
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(url, key, {
  auth: {
    // Auto-refresh tokens
    autoRefreshToken: true,
    // Persist auth session in localStorage
    persistSession: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
  },
});

export default supabase;

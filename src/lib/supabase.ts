/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for use throughout the application.
 * Supports both local development and production environments.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Get Supabase configuration from environment variables
// Tests explicitly set VITE_SUPABASE_URL to the test instance (port 55321)
// to prevent tests from modifying dev/production data
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

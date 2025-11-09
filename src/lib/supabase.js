/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for use throughout the application.
 * Supports both local development and production environments.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log what we got from env
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20));

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
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(url, key, {
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

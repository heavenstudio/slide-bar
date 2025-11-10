import { Database } from './supabase';

// Database table types
export type Image = Database['public']['Tables']['images']['Row'];
export type ImageInsert = Database['public']['Tables']['images']['Insert'];
export type ImageUpdate = Database['public']['Tables']['images']['Update'];

// API Response types
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type ImagesResponse = SupabaseResponse<Image[]>;
export type ImageResponse = SupabaseResponse<Image>;

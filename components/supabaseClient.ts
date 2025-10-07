import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Environment variables are exposed via `import.meta.env` in a Vite environment.
// FIX: Bypassing TypeScript error for import.meta.env due to missing Vite client types.
const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL;
// FIX: Bypassing TypeScript error for import.meta.env due to missing Vite client types.
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

// This flag allows the React components to check if the configuration is present
// before attempting to make any API calls.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

// Only create the client if the configuration is available.
// This prevents the application from crashing at startup if env vars are missing.
if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Provides access to the Supabase client instance.
 * Throws an error if the client is not initialized, ensuring that
 * attempts to use Supabase without proper configuration fail early and clearly.
 * This function should only be called *after* checking `isSupabaseConfigured`.
 * @returns {SupabaseClient} The initialized Supabase client.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }
  return supabaseInstance;
};
// FIX: Removed the non-functional vite/client reference and added a manual type declaration
// for import.meta.env to resolve type errors when vite/client types are not found.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    }
  }
}

// Environment variables are exposed via `import.meta.env` in a Vite environment.

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
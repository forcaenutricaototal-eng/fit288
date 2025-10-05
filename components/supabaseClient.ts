import { createClient } from '@supabase/supabase-js';

// Environment variables are exposed via Vite's `define` config.
// This approach is used for consistency with how the Gemini API key is handled
// and to avoid potential runtime issues with `import.meta.env`.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
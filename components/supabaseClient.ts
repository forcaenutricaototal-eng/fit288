import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

// This flag allows the React components to check if the configuration is present
// before attempting to make any API calls.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create the client with credentials or empty strings.
// The Supabase client library does not throw an error on initialization with invalid credentials.
// Errors will occur on the first API call, which will be handled within the app's UI.
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

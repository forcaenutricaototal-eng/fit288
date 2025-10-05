import { createClient } from '@supabase/supabase-js';

// Environment variables are exposed via Vite's `define` config.
// This approach is used for consistency with how the Gemini API key is handled
// and to avoid potential runtime issues with `import.meta.env`.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "As credenciais do Supabase não foram encontradas. Verifique se as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas corretamente nas configurações do seu projeto e faça um novo deploy.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Fix: Removed reference to 'vite/client' to prevent "Cannot find type definition file" error.
// The environment variables are now accessed with a type assertion on 'import.meta' to bypass TypeScript type checking errors.

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// As variáveis de ambiente são expostas via `import.meta.env` no ambiente Vite.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Esta flag permite que os componentes React verifiquem se a configuração está presente
// antes de tentar fazer qualquer chamada à API.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

// Só cria o cliente se a configuração estiver disponível.
// Isso evita que o aplicativo quebre na inicialização se as variáveis de ambiente estiverem ausentes.
if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Fornece acesso à instância do cliente Supabase.
 * Lança um erro se o cliente não for inicializado, garantindo que
 * tentativas de usar o Supabase sem a configuração adequada falhem de forma clara e precoce.
 * Esta função só deve ser chamada *após* verificar `isSupabaseConfigured`.
 * @returns {SupabaseClient} O cliente Supabase inicializado.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }
  return supabaseInstance;
};
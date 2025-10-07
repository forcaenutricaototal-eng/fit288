import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Fix: Declare process.env for TypeScript to recognize variables injected by Vite,
// and remove vite/client reference which was causing errors.
declare const process: {
  env: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
};

// As variáveis de ambiente são injetadas pelo Vite no build.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
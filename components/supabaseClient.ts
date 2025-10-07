// Fix: Add Vite client types to resolve 'import.meta.env' type errors.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
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
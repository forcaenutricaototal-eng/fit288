import { getSupabaseClient } from '../components/supabaseClient';
import type { UserProfile, CheckInData, AccessCode } from '../types';
import type { AuthError, Session, User } from '@supabase/js';

const PROFILES_TABLE = 'profiles';
const CHECKINS_TABLE = 'check_ins';
const ACCESS_CODES_TABLE = 'access_codes';
const PROFILE_COLUMNS = 'id, name, age, weight, height, dietary_restrictions, created_at, completed_items_by_day';

// Profile Functions
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
};

export const createProfile = async (userId: string, name: string): Promise<UserProfile> => {
  const newProfileData = {
    id: userId,
    name: name,
    completed_items_by_day: {}, // Explicitamente define o valor padrão para garantir a consistência.
  };
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .insert(newProfileData)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updatedData: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .update(updatedData)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return data;
};

// Check-in Functions
export const getCheckIns = async (userId: string): Promise<CheckInData[]> => {
  const { data, error } = await getSupabaseClient()
    .from(CHECKINS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('day', { ascending: true });
  if (error) throw error;
  return data;
};

export const addCheckInData = async (userId: string, checkInData: Omit<CheckInData, 'day' | 'user_id' | 'id'>, currentDay: number): Promise<CheckInData> => {
  const { data, error } = await getSupabaseClient()
    .from(CHECKINS_TABLE)
    .insert({ user_id: userId, day: currentDay, ...checkInData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Auth function with access code validation
export const signUpWithAccessCode = async (email: string, pass: string, name: string, accessCode: string): Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }> => {
  const supabase = getSupabaseClient();
  const trimmedCode = accessCode.trim();

  // Etapa 1: Validar o código de acesso ANTES de criar o usuário.
  try {
    const { data: codeData, error: selectError } = await supabase
      .from(ACCESS_CODES_TABLE)
      .select('is_used')
      .eq('code', trimmedCode)
      .single();

    if (selectError) {
      if (selectError.code === '42P01') { // undefined_table
        return { data: { user: null, session: null }, error: { name: 'TableNotFound', message: 'TABLE_NOT_FOUND' } as AuthError };
      }
      if (selectError.code === 'PGRST116') { // no rows found
         return { data: { user: null, session: null }, error: { name: 'InvalidCredentials', message: 'Código de acesso inválido ou não encontrado.' } as AuthError };
      }
      // Qualquer outro erro é provavelmente uma política RLS de SELECT faltando
      return { data: { user: null, session: null }, error: { name: 'RlsPolicyMissing', message: 'RLS_SELECT_POLICY_MISSING' } as AuthError };
    }

    if (codeData.is_used) {
      return { data: { user: null, session: null }, error: { name: 'InvalidCredentials', message: 'Este código de acesso já foi utilizado.' } as AuthError };
    }

  } catch (e: any) {
     return { data: { user: null, session: null }, error: { name: 'UnexpectedError', message: e.message || 'Erro inesperado ao validar o código.' } as AuthError };
  }

  // Etapa 2: Se o código for válido, criar o usuário.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { name } },
  });

  if (signUpError) {
    if (signUpError.message.includes("User already registered")) {
        const customError = {
            ...signUpError,
            message: "Este e-mail já está cadastrado. Por favor, faça o login ou use a opção 'Esqueceu a senha?' se necessário."
        };
        return { data: { user: null, session: null }, error: customError as AuthError };
    }
    return { data: { user: null, session: null }, error: signUpError };
  }


  // Etapa 3: Se o usuário foi criado, invalidar o código de acesso usando uma função RPC.
  if (signUpData.user) {
    // A função RPC 'claim_access_code' é a maneira mais segura de fazer isso do lado do cliente.
    const { data: rpcData, error: rpcError } = await supabase.rpc('claim_access_code', {
        code_to_claim: trimmedCode
    });
    
    if (rpcError || !rpcData || rpcData.length === 0) {
        console.error("ERRO CRÍTICO: Usuário criado mas falha ao reivindicar o código de acesso.", rpcError);
        // Informa ao usuário que a função RPC está faltando para que possa ser corrigida.
        if (rpcError && rpcError.message.includes('function claim_access_code') && rpcError.message.includes('does not exist')) {
             return { data: { user: null, session: null }, error: { name: 'RpcFunctionMissing', message: 'RPC_FUNCTION_MISSING' } as AuthError };
        }
        // Se a função existe mas falhou, é um problema sério, mas o cadastro do usuário já ocorreu.
        // Apenas logamos o erro para não bloquear o usuário.
    }
  }

  return { data: signUpData, error: null };
};


// Access Code Admin Functions
export const getAccessCodes = async (): Promise<AccessCode[]> => {
  const { data, error } = await getSupabaseClient()
    .from(ACCESS_CODES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createAccessCodes = async (count: number): Promise<AccessCode[]> => {
    const codes = Array.from({ length: count }, () => ({
        code: `MJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }));

    const { data, error } = await getSupabaseClient()
        .from(ACCESS_CODES_TABLE)
        .insert(codes)
        .select();
    
    if (error) throw error;
    return data;
};


export const deleteAccessCode = async (id: number): Promise<void> => {
    const { error } = await getSupabaseClient()
        .from(ACCESS_CODES_TABLE)
        .delete()
        .eq('id', id)
        .eq('is_used', false); // Safety check: only delete unused codes
    if (error) throw error;
};
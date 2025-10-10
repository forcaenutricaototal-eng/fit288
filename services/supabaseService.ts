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

export const updateProfile = async (userId: string, updatedData: Partial<UserProfile>): Promise<UserProfile> => {
  const profileData = {
    id: userId,
    ...updatedData,
  };

  // Etapa 1: Realiza o upsert. Esta operação cria o perfil se ele não existir
  // ou o atualiza se já existir.
  const { error: upsertError } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .upsert(profileData);

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError);
    // Lança o erro específico do Supabase para ser tratado na UI.
    throw upsertError;
  }
  
  // Etapa 2: Após o sucesso do upsert, busca explicitamente o perfil.
  // Isso é mais robusto do que um '.select()' encadeado, pois evita race conditions
  // com a aplicação de políticas RLS em registros recém-criados.
  const profile = await getProfile(userId);
  
  if (!profile) {
    // Se o perfil ainda não for encontrado, algo está fundamentalmente errado com as permissões.
    console.error("Profile not found after successful upsert for user:", userId);
    throw new Error("Falha ao recuperar o perfil após a atualização. Verifique as permissões (RLS) de SELECT na sua tabela de perfis.");
  }
  
  // Retorna o perfil completo e atualizado.
  return profile;
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
  const trimmedCode = accessCode.trim().toUpperCase();

  // Etapa 1: Validar o código de acesso usando RPC para bypassar RLS. É mais seguro e confiável.
  try {
    const { data: validationData, error: rpcError } = await supabase
      .rpc('validate_access_code', { code_to_validate: trimmedCode })
      .single();

    if (rpcError) {
      if (rpcError.message.includes('function validate_access_code') && rpcError.message.includes('does not exist')) {
        return { data: { user: null, session: null }, error: { name: 'RpcFunctionMissing', message: 'RPC_VALIDATE_FUNCTION_MISSING' } as AuthError };
      }
      console.error("RPC validation error:", rpcError);
      return { data: { user: null, session: null }, error: { name: 'UnexpectedError', message: 'Falha ao validar o código. Verifique sua conexão e tente novamente.' } as AuthError };
    }
    
    if (!validationData || !validationData.is_valid) {
      return { data: { user: null, session: null }, error: { name: 'InvalidCredentials', message: 'Código de acesso inválido ou não encontrado.' } as AuthError };
    }

    if (validationData.is_used) {
      return { data: { user: null, session: null }, error: { name: 'InvalidCredentials', message: 'Este código de acesso já foi utilizado.' } as AuthError };
    }

  } catch (e: any) {
     return { data: { user: null, session: null }, error: { name: 'UnexpectedError', message: e.message || 'Erro inesperado ao validar o código.' } as AuthError };
  }


  // Etapa 2: Se o código for válido, criar o usuário. O gatilho no DB cuidará da criação do perfil.
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
    // O erro "Database error saving new user" será capturado aqui se o gatilho falhar.
    if (signUpError.message.toLowerCase().includes('database error')) {
      const customError = { ...signUpError, message: 'Database error saving new user' };
      return { data: { user: null, session: null }, error: customError as AuthError };
    }
    return { data: { user: null, session: null }, error: signUpError };
  }


  // Etapa 3: Se o usuário foi criado, invalidar o código de acesso usando uma função RPC.
  if (signUpData.user) {
    const { data: rpcData, error: rpcError } = await supabase.rpc('claim_access_code', {
        code_to_claim: trimmedCode
    });
    
    if (rpcError || !rpcData || rpcData.length === 0) {
        console.error("ERRO CRÍTICO: Usuário criado mas falha ao reivindicar o código de acesso.", rpcError);
        if (rpcError && rpcError.message.includes('function claim_access_code') && rpcError.message.includes('does not exist')) {
             return { data: { user: null, session: null }, error: { name: 'RpcFunctionMissing', message: 'RPC_CLAIM_FUNCTION_MISSING' } as AuthError };
        }
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
import { getSupabaseClient } from '../components/supabaseClient';
import type { UserProfile, CheckInData, AccessCode } from '../types';
import type { AuthError, Session, User } from '@supabase/js';

const PROFILES_TABLE = 'profiles';
const CHECKINS_TABLE = 'check_ins';
const ACCESS_CODES_TABLE = 'access_codes';

// Helper to check table existence and basic accessibility
const checkTableExists = async (tableName: string): Promise<{ exists: boolean; error?: AuthError }> => {
    const { error } = await getSupabaseClient().from(tableName).select('id', { count: 'exact', head: true }).limit(0);
    if (error && error.code === '42P01') { // 42P01 = undefined_table
        return { exists: false, error: { name: 'TableNotFound', message: 'TABLE_NOT_FOUND' } as AuthError };
    }
    // Any other error could be RLS, but the table exists.
    return { exists: true };
};


// Profile Functions
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
};

export const createProfile = async (userId: string, name: string): Promise<UserProfile> => {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .insert({ id: userId, name: name }) // Only insert the bare essentials to prevent errors
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updatedData: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .update(updatedData)
    .eq('id', userId)
    .select()
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

  // Etapa 0: Verificar se a tabela de códigos de acesso existe.
  const tableCheck = await checkTableExists(ACCESS_CODES_TABLE);
  if (!tableCheck.exists) {
    return { data: { user: null, session: null }, error: tableCheck.error! };
  }

  // Etapa 1: Tentar "reservar" atomicamente o código de acesso.
  // Esta operação de UPDATE é a que falha se a política de RLS estiver ausente.
  const { data: reservedCode, error: reserveError } = await supabase
    .from(ACCESS_CODES_TABLE)
    .update({ is_used: true })
    .eq('code', trimmedCode)
    .eq('is_used', false)
    .select()
    .single();
  
  // Etapa 2: Diagnóstico da falha.
  // Se a reserva falhou (reservedCode é nulo), precisamos descobrir o porquê.
  if (!reservedCode) {
    // Vamos verificar se o código existe e está disponível.
    const { data: codeStatus, error: selectError } = await supabase
      .from(ACCESS_CODES_TABLE)
      .select('is_used')
      .eq('code', trimmedCode)
      .single();

    // NOVO: Detectar se a política de SELECT está faltando.
    if (selectError && (selectError.message.includes('security policy') || selectError.message.includes('violates row-level security'))) {
        return { data: { user: null, session: null }, error: { name: 'RLSError', message: 'RLS_SELECT_POLICY_MISSING' } as AuthError };
    }

    // Cenário Crítico: O código existe e está disponível, mas a atualização falhou.
    // Isso confirma com 100% de certeza que a política de UPDATE está faltando.
    if (codeStatus && !codeStatus.is_used) {
      return { data: { user: null, session: null }, error: { name: 'RLSError', message: 'RLS_UPDATE_POLICY_MISSING' } as AuthError };
    }
    
    // Outros cenários de erro.
    let message = '';
    if (!codeStatus) {
        message = `O código de acesso "${trimmedCode}" não foi encontrado. Verifique se você digitou corretamente.`;
    } else if (codeStatus.is_used) {
        message = `O código de acesso "${trimmedCode}" já foi utilizado por outra pessoa.`;
    } else {
        // Fallback genérico, embora improvável de ser alcançado com a nova lógica.
        message = 'Código de acesso inválido ou já utilizado.';
    }
    return { data: { user: null, session: null }, error: { name: 'InvalidOrUsedCode', message } as AuthError };
  }

  // Etapa 3: Se a reserva foi bem-sucedida, criar o usuário.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { name: name } },
  });

  // Se a criação do usuário falhar, precisamos reverter a reserva do código.
  if (signUpError) {
    await supabase
      .from(ACCESS_CODES_TABLE)
      .update({ is_used: false })
      .eq('code', trimmedCode);
    return { data: { user: null, session: null }, error: signUpError };
  }

  // Etapa 4: Se o usuário foi criado, vincular o ID do usuário ao código.
  if (signUpData.user) {
    await supabase
      .from(ACCESS_CODES_TABLE)
      .update({ used_by_user_id: signUpData.user.id })
      .eq('code', trimmedCode);
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
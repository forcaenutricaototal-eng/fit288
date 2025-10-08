import { getSupabaseClient } from '../components/supabaseClient';
import type { UserProfile, CheckInData, AccessCode } from '../types';
import type { AuthError, Session, User } from '@supabase/js';

const PROFILES_TABLE = 'profiles';
const CHECKINS_TABLE = 'check_ins';
const ACCESS_CODES_TABLE = 'access_codes';

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

  // Etapa 1: "Reservar" atomicamente o código de acesso.
  const { data: reservedCode, error: reserveError } = await supabase
    .from(ACCESS_CODES_TABLE)
    .update({ is_used: true })
    .eq('code', trimmedCode)
    .eq('is_used', false)
    .select()
    .single();

  if (reserveError) {
      if (reserveError.message.includes('violates row-level security policy')) {
          const rlsErrorMessage = 'RLS_UPDATE_POLICY_MISSING'; // Custom error message
          return { data: { user: null, session: null }, error: { name: 'RLSError', message: rlsErrorMessage } as AuthError };
      }
      if (reserveError.code !== 'PGRST116') { // Not a "no rows found" error, but something else
          return { data: { user: null, session: null }, error: reserveError as AuthError };
      }
  }

  if (!reservedCode) {
    const { data: codeStatus } = await supabase
      .from(ACCESS_CODES_TABLE)
      .select('is_used')
      .eq('code', trimmedCode)
      .single();
    
    let message = '';
    if (!codeStatus) {
        message = `O código de acesso "${trimmedCode}" não foi encontrado. Verifique se você digitou corretamente.`;
    } else if (codeStatus.is_used) {
        message = `O código de acesso "${trimmedCode}" já foi utilizado por outra pessoa.`;
    } else {
        message = 'Código de acesso inválido ou já utilizado.';
    }

    return { data: { user: null, session: null }, error: { name: 'InvalidOrUsedCode', message } as AuthError };
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { name: name } },
  });

  if (signUpError) {
    await supabase
      .from(ACCESS_CODES_TABLE)
      .update({ is_used: false })
      .eq('code', trimmedCode);
    return { data: { user: null, session: null }, error: signUpError };
  }

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
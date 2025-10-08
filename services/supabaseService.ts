import { getSupabaseClient } from '../components/supabaseClient';
import type { UserProfile, CheckInData } from '../types';
import type { AuthError, Session, User } from '@supabase/supabase-js';

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

  // 1. Validate the access code
  const { data: codeData, error: codeError } = await supabase
    .from(ACCESS_CODES_TABLE)
    .select('code, is_used')
    .eq('code', trimmedCode)
    .single();

  if (codeError || !codeData) {
    return { data: { user: null, session: null }, error: { name: 'InvalidCode', message: 'Código de acesso não encontrado.' } as AuthError };
  }

  if (codeData.is_used) {
    return { data: { user: null, session: null }, error: { name: 'UsedCode', message: 'Este código de acesso já foi utilizado.' } as AuthError };
  }
  
  // 2. If code is valid, proceed with user sign-up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (signUpError) {
    return { data: { user: null, session: null }, error: signUpError };
  }
  
  if (signUpData.user) {
    // 3. If sign-up is successful, mark the code as used
    const { error: updateError } = await supabase
      .from(ACCESS_CODES_TABLE)
      .update({ is_used: true, used_by_user_id: signUpData.user.id })
      .eq('code', trimmedCode);
      
    if (updateError) {
      // This is a mitigation step. If this fails, the user is created but the code isn't marked as used.
      // A more robust solution would involve an Edge Function to handle this atomically.
      console.error('CRITICAL: Failed to mark access code as used after signup:', updateError.message);
    }
  }
  
  return { data: signUpData, error: null };
};
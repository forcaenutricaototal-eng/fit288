import { getSupabaseClient } from '../components/supabaseClient';
import type { UserProfile, CheckInData, AccessCode } from '../types';
import type { AuthError, Session, User } from '@supabase/js';

const PROFILES_TABLE = 'profiles';
const CHECKINS_TABLE = 'check_ins';
const ACCESS_CODES_TABLE = 'access_codes';
const PROFILE_COLUMNS = 'id, name, age, weight, height, dietary_restrictions, created_at, completed_items_by_day';

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
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
};

export const createProfile = async (userId: string, name: string): Promise<UserProfile> => {
  const { data, error } = await getSupabaseClient()
    .from(PROFILES_TABLE)
    .insert({ id: userId, name: name }) // Only insert the bare essentials to prevent errors
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

  // Etapa 1: Criar o usuário primeiro. A validação do código de acesso agora é secundária e não-bloqueante.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { name: name } },
  });

  // Se a criação do usuário falhar (ex: e-mail já existe), retorne o erro imediatamente.
  if (signUpError) {
    return { data: { user: null, session: null }, error: signUpError };
  }

  // Etapa 2: Se o usuário foi criado, tente validar e usar o código de acesso.
  // Este processo é "best-effort" e não bloqueará o usuário se falhar.
  if (signUpData.user) {
    try {
        const { data: codeData, error: selectError } = await supabase
          .from(ACCESS_CODES_TABLE)
          .select('id, is_used')
          .eq('code', trimmedCode)
          .single();

        if (selectError || !codeData || codeData.is_used) {
            // O código é inválido, já foi usado ou as políticas de RLS impedem a leitura.
            // Apenas registramos um aviso no console e continuamos, pois o usuário já foi criado.
            console.warn(`Cadastro bem-sucedido para ${email}, mas o código de acesso "${trimmedCode}" é inválido ou não pôde ser validado.`, selectError?.message || 'Código não encontrado ou já em uso.');
        } else {
            // O código é válido, então tentamos atualizá-lo.
            const { error: updateError } = await supabase
              .from(ACCESS_CODES_TABLE)
              .update({ is_used: true, used_by_user_id: signUpData.user.id })
              .eq('code', trimmedCode);

            if (updateError) {
                // As políticas de RLS podem bloquear a atualização. Apenas registramos e continuamos.
                console.warn(`Cadastro bem-sucedido para ${email}, mas falhou ao marcar o código de acesso "${trimmedCode}" como usado.`, updateError.message);
            }
        }
    } catch(e) {
        console.error("Erro inesperado durante a validação do código de acesso pós-cadastro:", e);
    }
  }

  // Retorna o resultado da operação de cadastro, independentemente do sucesso da validação do código.
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
import { getSupabaseClient } from '../components/supabaseClient';
import type { UserProfile, CheckInData } from '../types';
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

  if (reserveError && reserveError.code !== 'PGRST116') {
    // Um erro real ocorreu (pode ser RLS, rede, etc.).
    // Repassa o erro para a UI para que ela possa exibir uma mensagem de ajuda.
    return { data: { user: null, session: null }, error: reserveError as AuthError };
  }

  if (!reservedCode) {
    // Este caso significa que nenhuma linha correspondeu aos critérios (código não encontrado ou is_used já era true).
    // Este é o erro de "código inválido".
    const message = 'Código de acesso inválido ou já utilizado.';
    return { data: { user: null, session: null }, error: { name: 'InvalidOrUsedCode', message } as AuthError };
  }


  // Etapa 2: Se o código foi reservado com sucesso, prosseguir com o cadastro do usuário.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        name: name,
      },
    },
  });

  // Etapa 3: Lidar com o resultado do cadastro.
  if (signUpError) {
    // IMPORTANTE: Se o cadastro falhar, devemos liberar o código reservado.
    console.error('Cadastro falhou, revertendo a reserva do código de acesso...');
    await supabase
      .from(ACCESS_CODES_TABLE)
      .update({ is_used: false })
      .eq('code', trimmedCode);
    return { data: { user: null, session: null }, error: signUpError };
  }

  if (signUpData.user) {
    // Etapa 4: Se o cadastro for bem-sucedido, vincular permanentemente o código ao novo usuário.
    const { error: updateError } = await supabase
      .from(ACCESS_CODES_TABLE)
      .update({ used_by_user_id: signUpData.user.id })
      .eq('code', trimmedCode);
      
    if (updateError) {
      // Isso não é crítico para o fluxo do usuário, mas deve ser registrado.
      // O código já está marcado como usado, isso apenas adiciona o link do ID do usuário.
      console.warn('Não foi possível vincular o ID do usuário ao código de acesso após o cadastro:', updateError.message);
    }
  }
  
  return { data: signUpData, error: null };
};

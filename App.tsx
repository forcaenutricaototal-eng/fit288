import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import type { UserProfile, CheckInData } from './types';
import { getSupabaseClient, isSupabaseConfigured } from './components/supabaseClient';
import { getProfile, updateProfile, addCheckInData, getCheckIns, signUpWithAccessCode } from './services/supabaseService';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import ProtocolsPage from './pages/ProtocolsPage';
import OnboardingPage from './pages/OnboardingPage';
import AdminPage from './pages/AdminPage';
import { ToastProvider, useToast } from './components/Toast';
import { AlertTriangle, LogOut, Database, ShieldOff, Copy, Check } from 'lucide-react';

interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isLoading: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signup: (email: string, pass: string, name: string, accessCode: string) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ error: AuthError | null; }>;
  updateUserProfile: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  checkIns: CheckInData[];
  addCheckIn: (data: Omit<CheckInData, 'day' | 'user_id' | 'id'>) => Promise<void>;
  planDuration: number;
  completedItemsByDay: { [day: number]: { [itemId: string]: boolean } };
  toggleItemCompletion: (day: number, itemId: string) => Promise<void>;
  resetDayCompletion: (day: number) => Promise<void>;
  dataLoadError: string | null;
  rawError: string | null;
  showDbSyncTool: boolean;
  setShowDbSyncTool: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [showDbSyncTool, setShowDbSyncTool] = useState(false);
  const { addToast } = useToast();

  const adminId = process.env.VITE_ADMIN_USER_ID;
  const isAdmin = useMemo(() => !!(user && adminId && user.id === adminId), [user, adminId]);

  const loadDataForUser = useCallback(async (currentUser: User) => {
    setDataLoadError(null);
    setRawError(null);
    try {
      let profile = await getProfile(currentUser.id);
      
      // The DB trigger might take a moment. We wait and retry once.
      if (!profile) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        profile = await getProfile(currentUser.id);
      }

      if (!profile) {
        throw new Error("DB_SYNC_ERROR: Profile not found.");
      }
      
      if (profile && (!profile.completed_items_by_day || typeof profile.completed_items_by_day !== 'object')) {
        await updateProfile(currentUser.id, { completed_items_by_day: {} });
        profile.completed_items_by_day = {};
      }
      
      setUserProfile(profile);

      const checkInsData = await getCheckIns(currentUser.id);
      setCheckIns(checkInsData);

    } catch (error: any) {
        const isCurrentUserAdmin = !!(currentUser && process.env.VITE_ADMIN_USER_ID && currentUser.id === process.env.VITE_ADMIN_USER_ID);

        if (isCurrentUserAdmin) {
          // Admin is logged in but their profile might be missing (e.g., after a DB reset).
          // We allow them to proceed to the app so they can access the Admin Panel and fix the DB.
          console.warn("Admin profile not found. Allowing access to Admin Panel for recovery.");
          setUserProfile(null);
          setCheckIns([]);
          // CRITICAL: DO NOT set dataLoadError for the admin to avoid the error screen loop.
        } else {
          // For regular users, this is a critical error. Show the error screen.
          console.error("Erro ao carregar dados do usuário:", error);
          
          setUserProfile(null);
          setCheckIns([]);
          setRawError(error.message || 'Ocorreu um erro desconhecido.');

          const errorMessage = error.message || '';
          if (errorMessage.includes("DB_SYNC_ERROR") || (errorMessage.includes("relation") && errorMessage.includes("does not exist")) || (errorMessage.includes("column") && errorMessage.includes("does not exist"))) {
              setDataLoadError('DB_SYNC_ERROR');
          } else if (errorMessage.includes('security policy') || errorMessage.includes('violates row-level security')) {
              setDataLoadError('RLS_POLICY_MISSING');
          } else {
              setDataLoadError('GENERIC_ERROR');
          }
        }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }
    
    const supabase = getSupabaseClient();
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loadDataForUser(currentUser);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        await loadDataForUser(newUser);
      } else {
        setUserProfile(null);
        setCheckIns([]);
        setDataLoadError(null);
        setRawError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDataForUser]);


  const login = async (email: string, pass: string) => {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signup = async (email: string, pass: string, name: string, accessCode: string) => {
    return signUpWithAccessCode(email, pass, name, accessCode);
  };

  const logout = useCallback(async () => {
    try {
        await getSupabaseClient().auth.signOut();
        setShowDbSyncTool(false);
    } catch (e) {
        console.error("An unexpected error occurred during logout:", e);
        addToast("Ocorreu um erro inesperado ao sair.", 'info');
    }
  }, [addToast]);
  
  const resetPassword = async (email: string) => {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, 
    });
    return { error };
  };

  const updateUserProfile = useCallback(async (updatedData: Partial<UserProfile>) => {
    const currentUser = user;
    if (!currentUser) {
        const err = new Error('Você precisa estar logado para atualizar o perfil.');
        addToast(err.message, 'info');
        throw err;
    }
    try {
        const updated = await updateProfile(currentUser.id, updatedData);
        setUserProfile(updated);
        addToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        addToast('Ocorreu um erro ao salvar seu perfil. Tente novamente.', 'info');
        throw error;
    }
  }, [user, addToast]);

  const addCheckIn = useCallback(async (data: Omit<CheckInData, 'day' | 'user_id' | 'id'>) => {
      const currentUser = user;
      if (!currentUser) {
          const err = new Error('Você precisa estar logado para fazer um check-in.');
          addToast(err.message, 'info');
          throw err;
      }
      try {
          const newCheckInData = await addCheckInData(currentUser.id, data, checkIns.length);
          setCheckIns(prev => [...prev, newCheckInData]);
          addToast('Check-in adicionado com sucesso!', 'success');
      } catch (error) {
          console.error("Erro ao adicionar check-in:", error);
          addToast('Ocorreu um erro ao salvar o check-in.', 'info');
          throw error;
      }
  }, [user, checkIns.length, addToast]);

 const toggleItemCompletion = async (day: number, itemId: string) => {
    if (!user || !userProfile) return;
    const currentCompleted = userProfile.completed_items_by_day || {};
    const dayItems = currentCompleted[day] || {};
    const isCompleted = dayItems[itemId];

    const newDayItems = { ...dayItems, [itemId]: !isCompleted };
    const newCompletedState = { ...currentCompleted, [day]: newDayItems };
    
    await updateUserProfile({ completed_items_by_day: newCompletedState });
  };

  const resetDayCompletion = async (day: number) => {
    if (!user || !userProfile) return;
    const currentCompleted = userProfile.completed_items_by_day || {};
    const newCompletedState = { ...currentCompleted };
    delete newCompletedState[day];
    await updateUserProfile({ completed_items_by_day: newCompletedState });
  };
  
  const completedItemsByDay = useMemo(() => userProfile?.completed_items_by_day || {}, [userProfile]);
  
  const planDuration = 28;

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    userProfile,
    isLoading,
    user,
    isAdmin,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    checkIns,
    addCheckIn,
    planDuration,
    completedItemsByDay,
    toggleItemCompletion,
    resetDayCompletion,
    dataLoadError,
    rawError,
    showDbSyncTool,
    setShowDbSyncTool,
  }), [user, userProfile, isLoading, checkIns, completedItemsByDay, isAdmin, updateUserProfile, addCheckIn, logout, dataLoadError, rawError, showDbSyncTool]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const App: React.FC = () => (
  <ToastProvider>
    <AppProvider>
      <Main />
    </AppProvider>
  </ToastProvider>
);

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

const ConfigErrorMessage: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4 font-sans">
        <div className="text-center bg-white p-8 rounded-lg shadow-soft max-w-2xl border-t-4 border-yellow-500">
            <div className="flex justify-center mb-4">
                <AlertTriangle className="text-yellow-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Configuração Incompleta</h2>
            <p className="text-neutral-800 mb-6">
                O aplicativo não conseguiu se conectar aos serviços essenciais. Isso geralmente acontece quando as chaves de API não estão configuradas corretamente no ambiente de deploy (Vercel).
            </p>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver:</h3>
            <div className="space-y-6 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Adicione as Chaves na Vercel:</p>
                     <p className="text-sm text-neutral-800 mb-3">No seu projeto Vercel, vá para <code className="bg-neutral-200 px-1 rounded">Settings → Environment Variables</code>. Crie as três variáveis com os nomes <strong>exatos</strong> e os valores correspondentes. <strong>Atenção:</strong> Todas as chaves DEVEM começar com o prefixo <code className="bg-neutral-200 px-1 rounded">VITE_</code> para funcionar.</p>
                    <div className="font-mono bg-gray-800 text-white p-4 rounded-md text-sm space-y-1">
                        <p>VITE_SUPABASE_URL=<span className="text-gray-400">[URL do seu projeto Supabase]</span></p>
                        <p>VITE_SUPABASE_ANON_KEY=<span className="text-gray-400">[Chave 'anon public' do Supabase]</span></p>
                        <p>VITE_API_KEY=<span className="text-gray-400">[Sua chave da API do Google Gemini]</span></p>
                    </div>
                     <p className="text-xs text-neutral-800 mt-2"><strong>Dica:</strong> Para habilitar o painel de admin, adicione também a variável <code className="bg-neutral-200 px-1 rounded">VITE_ADMIN_USER_ID</code> com o seu User ID do Supabase.</p>
                </div>
                 <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">2. Faça o Redeploy:</p>
                    <p className="text-sm text-neutral-800">
                        Após salvar as variáveis, vá para a aba <code className="bg-neutral-200 px-1 rounded">Deployments</code> na Vercel, encontre o deploy mais recente, clique no menu (•••) e selecione <strong>"Redeploy"</strong>. Isso é <strong>essencial</strong> para que as novas variáveis sejam aplicadas.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const DatabaseSyncError: React.FC = () => {
    const { user } = useApp();
    const [copied, setCopied] = useState(false);
    
    const fullResetScript = `-- SCRIPT DE RESET COMPLETO E DEFINITIVO

-- AVISO: O User ID abaixo precisa ser o da SUA conta de administrador.
-- Encontre-o na seção 'Authentication' do Supabase e substitua o valor.
-- PASSO 1: CONFIGURE SEU ID DE ADMIN AQUI (OBRIGATÓRIO)
CREATE OR REPLACE FUNCTION get_admin_user_id()
RETURNS uuid AS $$
BEGIN
  -- COLE O SEU USER ID DE ADMIN AQUI DENTRO DAS ASPAS SIMPLES:
  RETURN '${user?.id || 'COLE_SEU_USER_ID_DE_ADMIN_AQUI'}';
END;
$$ LANGUAGE plpgsql;

-- O restante do script usa esta função para configurar as permissões.

-- 2. APAGA TUDO EM ORDEM PARA UM RESET LIMPO
DROP POLICY IF EXISTS "Admin can delete unused codes" ON public.access_codes;
DROP POLICY IF EXISTS "Admin can create new codes" ON public.access_codes;
DROP POLICY IF EXISTS "Admin can read all codes" ON public.access_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.access_codes;
DROP POLICY IF EXISTS "Enable insert for users based on their UID" ON public.check_ins;
DROP POLICY IF EXISTS "Enable read access for users based on their UID" ON public.check_ins;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on their UID" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on their UID" ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
-- A função get_admin_user_id() não é apagada aqui, pois a criamos/atualizamos no Passo 1.
DROP FUNCTION IF EXISTS public.claim_access_code(text);
DROP FUNCTION IF EXISTS public.validate_access_code(text);
DROP TABLE IF EXISTS public.check_ins CASCADE;
DROP TABLE IF EXISTS public.access_codes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. CRIA A TABELA DE PERFIS (PROFILES)
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  weight double precision,
  height double precision,
  dietary_restrictions text[],
  completed_items_by_day jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIA A TABELA DE CHECK-INS
CREATE TABLE public.check_ins (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day integer NOT NULL,
  weight double precision NOT NULL,
  water_intake double precision,
  fluid_retention integer,
  waist double precision,
  hips double precision,
  neck double precision,
  right_arm double precision,
  left_arm double precision,
  right_thigh double precision,
  left_thigh double precision,
  observations text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- 5. CRIA A TABELA DE CÓDIGOS DE ACESSO
CREATE TABLE public.access_codes (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE,
  is_used boolean DEFAULT false NOT NULL,
  used_by_user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- 6. CRIA O GATILHO PARA PERFIS AUTOMÁTICOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, completed_items_by_day)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', '{}'::jsonb);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. CRIA AS FUNÇÕES RPC
CREATE OR REPLACE FUNCTION claim_access_code(code_to_claim TEXT)
RETURNS SETOF access_codes AS $$
BEGIN
  RETURN QUERY
  UPDATE public.access_codes
  SET
    is_used = TRUE,
    used_by_user_id = auth.uid()
  WHERE code = code_to_claim AND is_used = FALSE
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_access_code(code_to_validate TEXT)
RETURNS TABLE(is_valid BOOLEAN, is_used BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (count(*) > 0),
    (bool_or(ac.is_used))
  FROM public.access_codes ac
  WHERE trim(upper(ac.code)) = trim(upper(code_to_validate));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CONCEDE PERMISSÕES DE EXECUÇÃO PARA AS FUNÇÕES
GRANT EXECUTE ON FUNCTION public.validate_access_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_access_code(text) TO authenticated;

-- 9. CRIA TODAS AS POLÍTICAS DE SEGURANÇA (RLS)
-- Políticas para 'profiles'
CREATE POLICY "Enable read access for users based on their UID" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Enable update for users based on their UID" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Políticas para 'check_ins'
CREATE POLICY "Enable read access for users based on their UID" ON public.check_ins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users based on their UID" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Políticas para 'access_codes'
CREATE POLICY "Enable read access for all users" ON public.access_codes FOR SELECT USING (true);
CREATE POLICY "Admin can read all codes" ON public.access_codes FOR SELECT TO authenticated USING (auth.uid() = get_admin_user_id());
CREATE POLICY "Admin can create new codes" ON public.access_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = get_admin_user_id());
CREATE POLICY "Admin can delete unused codes" ON public.access_codes FOR DELETE TO authenticated USING (auth.uid() = get_admin_user_id() AND is_used = false);
`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(fullResetScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="space-y-6 text-left">
            <p className="text-neutral-800 mb-4 text-sm text-left">
                Este erro crítico acontece quando a estrutura do seu banco de dados no Supabase está desatualizada ou incompleta. A solução definitiva é resetar as tabelas, funções e permissões do aplicativo para garantir que estejam 100% corretas.
            </p>
             <div className="bg-neutral-100 p-4 rounded-md">
                <p className="font-bold mb-2">Passo 1: Limpe os Usuários de Teste (Recomendado)</p>
                <p className="text-sm text-neutral-800">Para evitar conflitos, apague os usuários criados durante os testes. No seu painel Supabase, vá para a seção <code className="bg-neutral-200 px-1 rounded">Authentication</code>, selecione os usuários de teste e clique em "Delete".</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                <p className="font-bold mb-2 text-orange-800">Passo 2: Configure seu ID de Administrador (Obrigatório)</p>
                <p className="text-sm text-orange-700">O script precisa saber qual é o seu User ID para lhe dar permissões de admin. Se o ID abaixo estiver incorreto ou mostrando um placeholder, encontre o ID correto na seção <code className="bg-neutral-200 px-1 rounded">Authentication</code> do Supabase e cole-o no lugar certo dentro do script antes de copiar.</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-md">
                <p className="font-bold mb-2">Passo 3: Execute o Script de Setup Completo</p>
                <p className="text-sm text-neutral-800 mb-3">Clique no botão abaixo para copiar o script completo. Depois, no seu painel Supabase, vá para <code className="bg-neutral-200 px-1 rounded">SQL Editor → New query</code>, cole o script e clique em "RUN".</p>
                <div className="relative font-mono bg-gray-800 text-white p-4 rounded-md text-xs space-y-1 overflow-x-auto">
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-sans text-xs font-semibold py-1 px-2 rounded-md transition-all"
                    >
                        {copied ? (
                            <> <Check size={14} className="text-green-400"/> Copiado! </>
                        ) : (
                            <> <Copy size={14} /> Copiar Script </>
                        )}
                    </button>
                    <pre className="whitespace-pre-wrap pr-24"><code>{fullResetScript}</code></pre>
                </div>
            </div>
             <div className="bg-neutral-100 p-4 rounded-md">
                <p className="font-bold mb-2">Passo 4: Tente Novamente</p>
                <p className="text-sm text-neutral-800">Após executar o script com sucesso, o banco de dados estará 100% sincronizado. Clique no botão "Sair e Tentar Novamente" para fazer o login.</p>
            </div>
        </div>
    );
};


const DataLoadErrorComponent: React.FC<{ errorType: string; onLogout: () => void; rawError: string | null }> = ({ errorType, onLogout, rawError }) => {
    const RlsError = () => (
        <>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver:</h3>
            <p className="text-neutral-800 mb-4 text-sm text-left">Para que o app possa carregar e salvar seus dados, a tabela <code className="bg-neutral-200 px-1 rounded">profiles</code> precisa de <strong>TRÊS</strong> regras de segurança (Policies). Crie-as no seu painel Supabase:</p>
            <div className="space-y-4 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Política de Leitura (SELECT):</p>
                    <p className="text-sm text-neutral-800">Vá para <code className="bg-neutral-200 px-1 rounded">Authentication → Policies</code>, selecione a tabela <code className="bg-neutral-200 px-1 rounded">profiles</code> e crie uma política com o template: <strong>"Enable read access for users based on their UID"</strong>.</p>
                </div>
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">2. Política de Atualização (UPDATE):</p>
                    <p className="text-sm text-neutral-800">Crie outra política com o template: <strong>"Enable update access for users based on their UID"</strong>.</p>
                </div>
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">3. Política de Criação (INSERT):</p>
                    <p className="text-sm text-neutral-800">Crie a terceira política com o template: <strong>"Enable insert for authenticated users only"</strong>.</p>
                </div>
            </div>
        </>
    );

    const GenericError = () => (
         <>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver:</h3>
            <p className="text-neutral-800 mb-4 text-sm text-left">
                Ocorreu um erro inesperado que o aplicativo não conseguiu identificar automaticamente. A causa mais comum é um problema de rede.
            </p>
            <div className="space-y-4 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Tente Novamente:</p>
                    <p className="text-sm text-neutral-800">Clique no botão "Sair e Tentar Novamente" abaixo e faça o login mais uma vez. Muitas vezes, o problema é temporário.</p>
                </div>
                {rawError && (
                    <div className="bg-neutral-100 p-4 rounded-md">
                        <p className="font-bold mb-2">2. Analise os Detalhes Técnicos:</p>
                        <p className="text-sm text-neutral-800 mb-2">O erro específico retornado pelo sistema está abaixo. Isso pode ajudar a identificar a causa.</p>
                        <div className="text-xs text-neutral-800 font-mono bg-neutral-200 p-2 rounded-md whitespace-pre-wrap break-words">
                            {rawError}
                        </div>
                    </div>
                )}
                 <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">{rawError ? '3. Verifique o Console:' : '2. Verifique o Console:'}</p>
                    <p className="text-sm text-neutral-800">Se o erro persistir, verifique o console de desenvolvedor do seu navegador (F12) para mensagens de erro mais detalhadas que possam ajudar a identificar a causa.</p>
                </div>
            </div>
        </>
    );

    const errorDetails = {
        'DB_SYNC_ERROR': {
            icon: Database,
            title: "Erro Crítico de Sincronização do Banco de Dados",
            description: "Não foi possível carregar seu perfil pois a estrutura do banco de dados está desatualizada. Siga os passos abaixo para resetar e corrigir o problema de forma definitiva.",
            content: <DatabaseSyncError />
        },
        'RLS_POLICY_MISSING': {
            icon: ShieldOff,
            title: "Erro de Permissão (RLS)",
            description: "O login falhou porque o aplicativo não tem permissão para ler seus dados do perfil. Isso é resolvido configurando as Políticas de Segurança de Nível de Linha (RLS) no Supabase.",
            content: <RlsError />
        },
        'GENERIC_ERROR': {
            icon: AlertTriangle,
            title: "Erro ao Carregar Dados",
            description: "Não foi possível carregar as informações do seu perfil após o login. O serviço pode estar temporariamente indisponível.",
            content: <GenericError />
        }
    };
    
    const details = errorDetails[errorType as keyof typeof errorDetails] || errorDetails['GENERIC_ERROR'];

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4 font-sans">
            <div className="text-center bg-white p-8 rounded-lg shadow-soft max-w-3xl border-t-4 border-yellow-500">
                <div className="flex justify-center mb-4">
                    <details.icon className="text-yellow-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">{details.title}</h2>
                <p className="text-neutral-800 mb-6">{details.description}</p>
                
                {details.content}

                <div className="mt-8 border-t pt-6">
                    <p className="text-sm text-neutral-800 mb-4">Após aplicar a correção no seu painel Supabase, saia e tente fazer o login novamente.</p>
                    <button onClick={onLogout} className="bg-primary text-white font-bold py-2.5 px-6 rounded-md hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mx-auto">
                        <LogOut size={18} />
                        Sair e Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
};


const Main: React.FC = () => {
    const { isAuthenticated, isLoading, userProfile, isAdmin, dataLoadError, logout, rawError, showDbSyncTool } = useApp();
    
    if (!isSupabaseConfigured) {
        return <ConfigErrorMessage />;
    }

    if (isLoading) return <LoadingSpinner />;

    if ((dataLoadError && !isAdmin) || showDbSyncTool) {
        return <DataLoadErrorComponent errorType={dataLoadError || 'DB_SYNC_ERROR'} onLogout={logout} rawError={rawError} />;
    }

    const hasCompletedOnboarding = !!(userProfile?.age && userProfile?.weight && userProfile?.height);

    return (
        <div className="bg-neutral-100 min-h-screen">
            <HashRouter>
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (!hasCompletedOnboarding && !isAdmin) ? (
                        <>
                            <Route path="/onboarding" element={<OnboardingPage />} />
                            <Route path="*" element={<Navigate to="/onboarding" />} />
                        </>
                    ) : (
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Navigate to="/chat" />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="chat" element={<ChatPage />} />
                            <Route path="meal-plan" element={<PlanPage />} />
                            <Route path="meal-plan/day/:day" element={<PlanPage />} />
                            <Route path="protocols" element={<ProtocolsPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            {isAdmin && <Route path="admin" element={<AdminPage />} />}
                            <Route path="*" element={<Navigate to="/chat" />} />
                        </Route>
                    )}
                </Routes>
            </HashRouter>
        </div>
    );
}

export default App;

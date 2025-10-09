
import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import type { UserProfile, CheckInData } from './types';
import { getSupabaseClient, isSupabaseConfigured } from './components/supabaseClient';
import { getProfile, createProfile, updateProfile, addCheckInData, getCheckIns, signUpWithAccessCode } from './services/supabaseService';

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
import { AlertTriangle, LogOut, Database, ShieldOff } from 'lucide-react';

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
  const { addToast } = useToast();

  const adminId = process.env.VITE_ADMIN_USER_ID;
  const isAdmin = useMemo(() => !!(user && adminId && user.id === adminId), [user, adminId]);

  const loadUserProfileAndData = useCallback(async (currentUser: User | null) => {
    setDataLoadError(null);
    setRawError(null);
    if (!currentUser) {
      setUser(null);
      setUserProfile(null);
      setCheckIns([]);
      return;
    }

    try {
      let profile = await getProfile(currentUser.id);
      if (!profile) {
        const initialName = currentUser.user_metadata?.name || 'Novo Usuário';
        profile = await createProfile(currentUser.id, initialName);
      }
      
      if (profile && (!profile.completed_items_by_day || typeof profile.completed_items_by_day !== 'object')) {
        profile.completed_items_by_day = {};
        await updateProfile(currentUser.id, { completed_items_by_day: {} });
      }
      
      setUser(currentUser);
      setUserProfile(profile);

      const checkInsData = await getCheckIns(currentUser.id);
      setCheckIns(checkInsData);

    } catch (error: any) {
        console.error("Erro ao carregar dados do usuário:", error);
        
        setUser(currentUser);
        setUserProfile(null);
        setCheckIns([]);
        setRawError(error.message || 'Ocorreu um erro desconhecido.');

        const errorMessage = error.message || '';
        if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
            setDataLoadError('TABLE_NOT_FOUND');
        } else if (errorMessage.includes("Could not find") && errorMessage.includes("column")) {
            setDataLoadError('COLUMN_MISSING');
        } else if (errorMessage.includes('security policy') || errorMessage.includes('violates row-level security')) {
            setDataLoadError('RLS_POLICY_MISSING');
        } else {
            setDataLoadError('GENERIC_ERROR');
        }
    }
  }, [addToast]);
  
  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }
    
    const supabase = getSupabaseClient();
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await loadUserProfileAndData(session?.user ?? null);
      setIsLoading(false);
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfileAndData(session.user);
      } else {
        await loadUserProfileAndData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfileAndData]);


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
        setUser(null);
        setUserProfile(null);
        setCheckIns([]);
        setDataLoadError(null);
        setRawError(null);
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
  }), [user, userProfile, isLoading, checkIns, completedItemsByDay, isAdmin, updateUserProfile, addCheckIn, logout, dataLoadError, rawError]);

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
                     <p className="text-sm text-neutral-800 mb-3">No seu projeto Vercel, vá para <code className="bg-neutral-200 px-1 rounded">Settings → Environment Variables</code>. Crie as três variáveis com os nomes <strong>exatos</strong> e os valores correspondentes:</p>
                    <div className="font-mono bg-gray-800 text-white p-4 rounded-md text-sm space-y-1">
                        <p>VITE_SUPABASE_URL=<span className="text-gray-400">[URL do seu projeto Supabase]</span></p>
                        <p>VITE_SUPABASE_ANON_KEY=<span className="text-gray-400">[Chave 'anon public' do Supabase]</span></p>
                        <p>CHAVE_API=<span className="text-gray-400">[Sua chave da API do Google Gemini]</span></p>
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


const DataLoadErrorComponent: React.FC<{ errorType: string; onLogout: () => void; rawError: string | null }> = ({ errorType, onLogout, rawError }) => {
    const ColumnError = () => (
        <>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver:</h3>
            <div className="space-y-6 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Adicione a Coluna que Falta:</p>
                    <p className="text-sm text-neutral-800 mb-3">No seu projeto Supabase, vá para <code className="bg-neutral-200 px-1 rounded">SQL Editor → New query</code> e execute o comando abaixo para garantir que a coluna <code className="bg-neutral-200 px-1 rounded">completed_items_by_day</code> exista na sua tabela <code className="bg-neutral-200 px-1 rounded">profiles</code>.</p>
                    <div className="font-mono bg-gray-800 text-white p-4 rounded-md text-sm space-y-1">
                        <p>ALTER TABLE public.profiles</p>
                        <p>ADD COLUMN IF NOT EXISTS completed_items_by_day jsonb NOT NULL DEFAULT '{{}}';</p>
                    </div>
                </div>
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">2. Atualize o Cache do Supabase (se a coluna já existe):</p>
                    <p className="text-sm text-neutral-800">Às vezes, o Supabase não "vê" a nova coluna imediatamente. Para forçar uma atualização do cache:</p>
                    <ul className="list-disc list-inside mt-2 text-sm text-neutral-800 space-y-1">
                        <li>Vá para <code className="bg-neutral-200 px-1 rounded">Table Editor → tabela profiles</code>.</li>
                        <li>Clique em qualquer coluna (ex: 'name') e selecione "Edit column".</li>
                        <li>Adicione uma descrição temporária e salve. Depois pode remover a descrição.</li>
                        <li>Isso força o Supabase a recarregar o schema.</li>
                    </ul>
                </div>
            </div>
        </>
    );

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

    const TableError = () => (
        <>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver:</h3>
            <p className="text-neutral-800 mb-4 text-sm text-left">
                O aplicativo não encontrou uma ou mais tabelas essenciais (`profiles`, `check_ins`, `access_codes`) no seu banco de dados. Para corrigir, execute os seguintes comandos SQL no seu painel Supabase.
            </p>
            <div className="space-y-4 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Vá para o Editor SQL:</p>
                    <p className="text-sm text-neutral-800">No seu projeto Supabase, clique em <code className="bg-neutral-200 px-1 rounded">SQL Editor</code> na barra lateral e depois em <code className="bg-neutral-200 px-1 rounded">New query</code>.</p>
                </div>
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">2. Crie as Tabelas Essenciais:</p>
                    <p className="text-sm text-neutral-800 mb-2">Copie e cole TODO o bloco de código abaixo no editor SQL e clique em "RUN". Isso criará as três tabelas com a estrutura correta.</p>
                    <div className="font-mono bg-gray-800 text-white p-4 rounded-md text-xs space-y-1 overflow-x-auto">
                        <pre className="whitespace-pre-wrap"><code>
{`-- 1. Tabela de Perfis de Usuários (profiles)
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

-- 2. Tabela de Check-ins (check_ins)
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

-- 3. Tabela de Códigos de Acesso (access_codes)
CREATE TABLE public.access_codes (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE,
  is_used boolean DEFAULT false NOT NULL,
  used_by_user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;`}
                        </code></pre>
                    </div>
                </div>
                 <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">3. Configure as Permissões (RLS Policies):</p>
                    <p className="text-sm text-neutral-800">Após criar as tabelas, você precisará configurar as permissões (Políticas de Segurança) para cada uma delas, como orientado nas outras telas de erro. Sem as permissões, o erro persistirá.</p>
                </div>
            </div>
        </>
    );

    const GenericError = () => (
         <>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver:</h3>
            <p className="text-neutral-800 mb-4 text-sm text-left">
                Ocorreu um erro inesperado que o aplicativo não conseguiu identificar automaticamente. A causa mais comum é uma configuração incompleta no seu painel Supabase ou um problema de rede.
            </p>
            <div className="space-y-4 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Tente Novamente:</p>
                    <p className="text-sm text-neutral-800">Clique no botão "Sair e Tentar Novamente" abaixo e faça o login mais uma vez. Muitas vezes, o problema é temporário.</p>
                </div>
                {rawError && (
                    <div className="bg-neutral-100 p-4 rounded-md">
                        <p className="font-bold mb-2">2. Analise os Detalhes Técnicos:</p>
                        <p className="text-sm text-neutral-800 mb-2">O erro específico retornado pelo sistema está abaixo. Isso pode ajudar a identificar o problema exato na sua configuração Supabase (por exemplo, uma permissão RLS ausente em uma tabela secundária).</p>
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
        'TABLE_NOT_FOUND': {
            icon: Database,
            title: "Erro de Configuração do Banco de Dados",
            description: "Uma ou mais tabelas essenciais (como 'profiles') não foram encontradas. Siga as instruções para criar a estrutura necessária no seu projeto Supabase.",
            content: <TableError />
        },
        'COLUMN_MISSING': {
            icon: Database,
            title: "Erro de Banco de Dados",
            description: "Não foi possível carregar seu perfil porque uma coluna essencial (`completed_items_by_day`) está faltando na tabela `profiles` ou o cache do Supabase está desatualizado.",
            content: <ColumnError />
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
    const { isAuthenticated, isLoading, userProfile, isAdmin, dataLoadError, logout, rawError } = useApp();
    
    if (!isSupabaseConfigured) {
        return <ConfigErrorMessage />;
    }

    if (isLoading) return <LoadingSpinner />;

    if (dataLoadError) {
        return <DataLoadErrorComponent errorType={dataLoadError} onLogout={logout} rawError={rawError} />;
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
                    ) : !hasCompletedOnboarding ? (
                        <>
                            <Route path="/onboarding" element={<OnboardingPage />} />
                            <Route path="*" element={<Navigate to="/onboarding" />} />
                        </>
                    ) : (
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Navigate to="/dashboard" />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="chat" element={<ChatPage />} />
                            <Route path="meal-plan" element={<PlanPage />} />
                            <Route path="meal-plan/day/:day" element={<PlanPage />} />
                            <Route path="protocols" element={<ProtocolsPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            {isAdmin && <Route path="admin" element={<AdminPage />} />}
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Route>
                    )}
                </Routes>
            </HashRouter>
        </div>
    );
}

export default App;

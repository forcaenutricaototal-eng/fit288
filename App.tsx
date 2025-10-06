

import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import type { UserProfile, CheckInData } from './types';
import { getSupabaseClient, isSupabaseConfigured } from './components/supabaseClient';
import { getProfile, createProfile, updateProfile, addCheckInData, getCheckIns } from './services/supabaseService';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import ProtocolsPage from './pages/ProtocolsPage';
import OnboardingPage from './pages/OnboardingPage';
import { ToastProvider, useToast } from './components/Toast';
import { AlertTriangle } from 'lucide-react';

interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isLoading: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signup: (email: string, pass: string, name: string) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ error: AuthError | null; }>;
  updateUserProfile: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  checkIns: CheckInData[];
  addCheckIn: (data: Omit<CheckInData, 'day' | 'user_id' | 'id'>) => Promise<void>;
  planDuration: number;
  completedItemsByDay: { [day: number]: { [itemId: string]: boolean } };
  toggleItemCompletion: (day: number, itemId: string) => Promise<void>;
  resetDayCompletion: (day: number) => Promise<void>;
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
  const { addToast } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }
    
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setUserProfile(null);
        setCheckIns([]);
        setIsLoading(false);
        return;
      }

      try {
        let profile = await getProfile(currentUser.id);

        // If there is no profile, create a barebones one.
        // The Onboarding page will be forced and will handle populating it with correct details.
        if (!profile) {
          const initialName = currentUser.user_metadata?.name || 'Novo Usuário';
          profile = await createProfile(currentUser.id, initialName);
        }
        
        // Safety check for `completed_items_by_day`
        if (profile && (!profile.completed_items_by_day || typeof profile.completed_items_by_day !== 'object')) {
            profile.completed_items_by_day = {}; 
            // Fire-and-forget update to the DB. Don't wait for it.
            updateProfile(currentUser.id, { completed_items_by_day: {} }).catch(patchError => {
                console.error("Falha não-crítica ao inicializar completed_items_by_day:", patchError);
            });
        }
        
        setUserProfile(profile);
        
      } catch (error) {
        console.error("Erro no processo de autenticação e perfil:", error);
        addToast("Ocorreu um erro ao carregar seus dados. Por favor, tente novamente.", 'info');
        setUserProfile(null);
        setCheckIns([]);
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);

  useEffect(() => {
    if (user) {
        let isMounted = true;
        const fetchCheckIns = async () => {
            try {
                const checkInsData = await getCheckIns(user.id);
                if (isMounted) setCheckIns(checkInsData);
            } catch (error) {
                console.error("Erro ao carregar check-ins:", error);
                if (isMounted) setCheckIns([]);
            }
        };
        fetchCheckIns();
        return () => { isMounted = false; };
    }
  }, [user, addToast]);


  const login = async (email: string, pass: string) => {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signup = async (email: string, pass: string, name: string) => {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name,
        },
      },
    });
    return { data, error };
  };

  const logout = async () => {
    await getSupabaseClient().auth.signOut();
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, 
    });
    return { error };
  };

  const updateUserProfile = useCallback(async (updatedData: Partial<UserProfile>) => {
    if (!user) {
        const err = new Error('Você precisa estar logado para atualizar o perfil.');
        addToast(err.message, 'info');
        throw err;
    }
    try {
        const updated = await updateProfile(user.id, updatedData);
        setUserProfile(updated);
        addToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        addToast('Ocorreu um erro ao salvar seu perfil. Tente novamente.', 'info');
        throw error;
    }
  }, [user, addToast]);

  const addCheckIn = useCallback(async (data: Omit<CheckInData, 'day' | 'user_id' | 'id'>) => {
      if (!user) {
          const err = new Error('Você precisa estar logado para fazer um check-in.');
          addToast(err.message, 'info');
          throw err;
      }
      try {
          const newCheckInData = await addCheckInData(user.id, data, checkIns.length);
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

  const value = useMemo(() => ({
    isAuthenticated: !!user,
    userProfile,
    isLoading,
    user,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    checkIns,
    addCheckIn,
    planDuration: 28,
    completedItemsByDay,
    toggleItemCompletion,
    resetDayCompletion,
  }), [user, userProfile, isLoading, checkIns, completedItemsByDay, updateUserProfile, addCheckIn]);

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
                O aplicativo não conseguiu se conectar aos serviços essenciais (Supabase e Google Gemini). Isso acontece quando as chaves da API não estão configuradas corretamente no ambiente de deploy (Vercel).
            </p>
            <h3 className="font-bold text-lg text-neutral-900 mb-4">Como Resolver em 3 Passos:</h3>
            <div className="space-y-6 text-left">
                <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">1. Obtenha suas Chaves:</p>
                    <ul className="list-disc list-inside text-sm space-y-2 text-neutral-800">
                        <li><strong>Supabase:</strong> No seu projeto, vá em <code className="bg-neutral-200 px-1 rounded">Project Settings → API</code> e copie a <code className="bg-neutral-200 px-1 rounded">URL</code> e a chave <code className="bg-neutral-200 px-1 rounded">anon public</code>.</li>
                        <li><strong>Google Gemini:</strong> Vá para o <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-dark font-semibold underline">Google AI Studio</a> e copie sua <code className="bg-neutral-200 px-1 rounded">API Key</code>.</li>
                    </ul>
                </div>
                 <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">2. Adicione as Chaves na Vercel:</p>
                     <p className="text-sm text-neutral-800 mb-3">No seu projeto na Vercel, vá em <code className="bg-neutral-200 px-1 rounded">Settings → Environment Variables</code>. Crie as três variáveis com os nomes <strong>exatos</strong> abaixo:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 font-mono bg-gray-800 text-white p-3 rounded-md">
                        <li>VITE_SUPABASE_URL=[cole sua URL aqui]</li>
                        <li>VITE_SUPABASE_ANON_KEY=[cole sua chave anon aqui]</li>
                        <li>VITE_GEMINI_API_KEY=[cole sua chave Gemini aqui]</li>
                    </ul>
                    <p className="text-xs text-neutral-800 mt-2">
                        <strong>Atenção:</strong> Se você usava <code className="bg-neutral-200 px-1 rounded">CHAVE_API_VITE</code>, por favor, renomeie para <code className="bg-neutral-200 px-1 rounded">VITE_GEMINI_API_KEY</code> para seguir o novo padrão.
                    </p>
                </div>
                 <div className="bg-neutral-100 p-4 rounded-md">
                    <p className="font-bold mb-2">3. Faça o Redeploy:</p>
                    <p className="text-sm text-neutral-800">
                        Na Vercel, vá para a aba <code className="bg-neutral-200 px-1 rounded">Deployments</code>, encontre o deploy mais recente e clique no menu de três pontos (•••) e depois em <strong>"Redeploy"</strong> para que as novas variáveis sejam aplicadas.
                    </p>
                </div>
            </div>
        </div>
    </div>
);


const Main: React.FC = () => {
    const { isAuthenticated, isLoading, userProfile } = useApp();
    
    if (!isSupabaseConfigured) {
        return <ConfigErrorMessage />;
    }

    if (isLoading) return <LoadingSpinner />;

    // A user has completed onboarding if their core physical stats are present.
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
                            {/* Force authenticated but non-onboarded users to this page */}
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
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Route>
                    )}
                </Routes>
            </HashRouter>
        </div>
    );
}

export default App;

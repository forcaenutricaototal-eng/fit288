
import React, { useState, createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import type { UserProfile, CheckInData } from './types';
import { supabase, isSupabaseConfigured } from './components/supabaseClient';
import { getProfile, getCheckIns, createProfile, updateProfile, addCheckInData } from './services/supabaseService';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import ProtocolsPage from './pages/ProtocolsPage';
import { ToastProvider, useToast } from './components/Toast';

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
  const isProcessingAuthRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isProcessingAuthRef.current) return;
      isProcessingAuthRef.current = true;
      setIsLoading(true);

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setUserProfile(null);
        setCheckIns([]);
        setIsLoading(false);
        isProcessingAuthRef.current = false;
        return;
      }

      try {
        let profile = await getProfile(currentUser.id);

        if (!profile) {
          const name = currentUser.user_metadata.name || 'Novo Usuário';
          profile = await createProfile(currentUser.id, name);
          if (!profile) {
            throw new Error("Falha crítica ao CRIAR o perfil do usuário.");
          }
        }
        
        let needsDbPatch = false;
        // Defensively ensure the profile object in the app's state is valid before rendering.
        // This prevents the UI from crashing if the database schema is outdated.
        if (!profile.completed_items_by_day || typeof profile.completed_items_by_day !== 'object') {
          profile = { ...profile, completed_items_by_day: {} }; // Fix in-memory object FIRST.
          needsDbPatch = true;
        }
        
        // Set the valid profile immediately so the UI can render without errors.
        setUserProfile(profile);

        // If a patch was needed, attempt to update the DB in the background.
        // This is a "fire-and-forget" operation; its failure won't block the user.
        if (needsDbPatch) {
          updateProfile(currentUser.id, { completed_items_by_day: {} }).catch(patchError => {
            console.error("Falha não-crítica ao tentar atualizar o perfil no DB:", patchError);
          });
        }
        
      } catch (error) {
        console.error("Erro no processo de autenticação e perfil:", error);
        addToast("Ocorreu um erro ao carregar seus dados. Por favor, tente novamente.", 'info');
        setUserProfile(null);
        setCheckIns([]);
      } finally {
        setIsLoading(false);
        isProcessingAuthRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);

  // Separate effect for loading non-critical data like check-ins
  useEffect(() => {
    if (userProfile && user) {
        let isMounted = true;
        const fetchCheckIns = async () => {
            try {
                const checkInsData = await getCheckIns(user.id);
                if (isMounted) {
                    setCheckIns(checkInsData);
                }
            } catch (error) {
                console.error("Erro ao carregar check-ins:", error);
                addToast("Não foi possível carregar seu histórico de evolução.", 'info');
                 if (isMounted) {
                    setCheckIns([]);
                }
            }
        };
        fetchCheckIns();
        return () => { isMounted = false; };
    }
  }, [userProfile, user, addToast]);


  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signup = async (email: string, pass: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
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
    await supabase.auth.signOut();
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, 
    });
    return { error };
  };

  const updateUserProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const updated = await updateProfile(user.id, updatedData);
    setUserProfile(updated);
  };

  const addCheckIn = async (data: Omit<CheckInData, 'day' | 'user_id' | 'id'>) => {
    if (!user) return;
    
    if (userProfile && data.weight) {
        await updateProfile(user.id, { weight: data.weight });
        setUserProfile(prev => prev ? { ...prev, weight: data.weight! } : null);
    }
    
    const newCheckInData = await addCheckInData(user.id, data, checkIns.length);
    setCheckIns(prev => [...prev, newCheckInData]);
  };

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
  }), [user, userProfile, isLoading, checkIns, completedItemsByDay]);

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
        <div className="text-center bg-white p-8 rounded-lg shadow-soft max-w-lg border-t-4 border-red-500">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erro de Configuração</h2>
            <p className="text-neutral-800 mb-2">As chaves do Supabase não foram encontradas no aplicativo.</p>
            <p className="text-neutral-800 mb-6">Isso geralmente acontece quando as variáveis de ambiente não foram aplicadas ao último deploy.</p>
            <h3 className="font-semibold text-neutral-900 mb-3">Ação Necessária:</h3>
            <div className="bg-green-50 p-4 rounded-md text-left text-green-900">
                <p className="font-bold mb-2">1. Verifique as Variáveis de Ambiente na Vercel:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><code>VITE_SUPABASE_URL</code></li>
                    <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                    <li><code>VITE_GEMINI_API_KEY</code> (ou <code>CHAVE_API_VITE</code>)</li>
                </ul>
                 <p className="font-bold mt-4 mb-2">2. Faça o Redeploy:</p>
                 <p className="text-sm">Vá até o painel do seu projeto na Vercel, clique na aba "Deployments", encontre o deploy mais recente e clique em "Redeploy" para aplicar as variáveis.</p>
            </div>
        </div>
    </div>
);

const Main: React.FC = () => {
    const { isAuthenticated, isLoading } = useApp();
    
    if (!isSupabaseConfigured) {
        return <ConfigErrorMessage />;
    }

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="bg-neutral-100 min-h-screen">
            <HashRouter>
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
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


import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import type { UserProfile, CheckInData, GamificationData, Badge, DailyPlan } from './types';
import { supabase } from './components/supabaseClient';
import { getProfile, getCheckIns, getGamification, createProfile, updateProfile, addCheckInData, updateGamificationData, updateCompletedItems, createGamificationData } from './services/supabaseService';
import { checkAndAwardBadges } from './services/gamificationService';
import { ALL_BADGES } from './data/badges';

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
  gamification: GamificationData | null;
  completedItemsByDay: { [day: number]: { [itemId: string]: boolean } };
  toggleItemCompletion: (day: number, itemId: string, itemType: 'meal' | 'task', plan: DailyPlan | null) => Promise<void>;
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
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [completedItemsByDay, setCompletedItemsByDay] = useState<{ [day: number]: { [itemId: string]: boolean }}>({});
  const { addToast } = useToast();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setUserProfile(null);
        setCheckIns([]);
        setGamification(null);
        setCompletedItemsByDay({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let profile = await getProfile(currentUser.id);
        let gamificationData = await getGamification(currentUser.id);

        if (!profile) {
          const name = currentUser.user_metadata.name || 'Novo Usuário';
          try {
            profile = await createProfile(currentUser.id, name);
            if (!profile) throw new Error("Falha ao criar e recuperar o perfil do usuário.");
            
            if (currentUser.user_metadata.name) {
              addToast(`Bem-vindo, ${name}!`, 'success');
            }
          } catch (creationError) {
            console.error("Critical error: Failed to create profile for user:", creationError);
            addToast("Erro crítico ao criar seu perfil. Tente recarregar a página.", 'info');
            setUserProfile(null);
            setGamification(null);
            setIsLoading(false);
            return;
          }
        }
        
        if (!gamificationData) {
            try {
                gamificationData = await createGamificationData(currentUser.id);
                if (!gamificationData) throw new Error("Falha ao criar e recuperar os dados de gamificação.");
            } catch (creationError) {
                console.error("Critical error: Failed to create gamification data for user:", creationError);
                addToast("Erro crítico ao inicializar seus dados de progresso. Tente recarregar.", 'info');
                setUserProfile(profile);
                setGamification(null);
                setIsLoading(false);
                return;
            }
        }
        
        const checkInsData = await getCheckIns(currentUser.id);
        setUserProfile(profile);
        setGamification(gamificationData);
        setCheckIns(checkInsData);
        setCompletedItemsByDay(gamificationData.completed_items_by_day || {});

      } catch (error) {
        console.error("An error occurred during auth state change processing:", error);
        addToast("Ocorreu um erro ao carregar seus dados. Por favor, recarregue.", 'info');
        setUserProfile(null);
        setGamification(null);
        setCheckIns([]);
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);


  useEffect(() => {
    if (!userProfile || !gamification || isLoading) return;

    const currentBadges = gamification.badges || [];
    const potentialNewBadges = checkAndAwardBadges(gamification, userProfile, checkIns);
    const newBadges = potentialNewBadges.filter(
        (potentialBadge) => !currentBadges.some((b) => b.id === potentialBadge.id)
    );
    
    if (newBadges.length > 0 && user) {
        const updatedBadges = [...currentBadges, ...newBadges];
        updateGamificationData(user.id, { badges: updatedBadges }).then(() => {
             setGamification(prev => prev ? { ...prev, badges: updatedBadges } : null);
             newBadges.forEach(badge => addToast(`Nova Conquista: ${badge.name}!`, 'success'));
        });
    }
  }, [gamification, userProfile, checkIns, isLoading, user, addToast]);


  const addPoints = useCallback(async (amount: number, message: string) => {
    if (!user || !gamification) return;
    addToast(message, 'info');
    const newPoints = (gamification.points || 0) + amount;
    await updateGamificationData(user.id, { points: newPoints });
    setGamification(prev => prev ? { ...prev, points: newPoints } : null);
  }, [user, gamification, addToast]);

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
    if (!user || !gamification) return;
    
    const today = new Date().toISOString().split('T')[0];
    let newStreak = gamification.streak;
    let newLongestStreak = gamification.longest_streak;

    if (gamification.last_check_in_date) {
        const lastDate = new Date(gamification.last_check_in_date);
        const currentDate = new Date(today);
        const diffDays = Math.ceil((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
    } else {
        newStreak = 1;
    }
    if (newStreak > newLongestStreak) newLongestStreak = newStreak;

    await updateGamificationData(user.id, { streak: newStreak, longest_streak: newLongestStreak, last_check_in_date: today });
    setGamification(prev => prev ? { ...prev, streak: newStreak, longest_streak: newLongestStreak, last_check_in_date: today } : null);
    
    addPoints(20, "+20 Pontos pelo Check-in!");

    if (userProfile && data.weight) {
        await updateProfile(user.id, { weight: data.weight });
        setUserProfile(prev => prev ? { ...prev, weight: data.weight! } : null);
    }
    
    const newCheckInData = await addCheckInData(user.id, data, checkIns.length);
    setCheckIns(prev => [...prev, newCheckInData]);
  };

 const toggleItemCompletion = async (day: number, itemId: string, itemType: 'meal' | 'task', plan: DailyPlan | null) => {
    if (!user || !gamification) return;
    const dayItems = completedItemsByDay[day] || {};
    const isCompleted = dayItems[itemId];

    if (!isCompleted) {
        const points = itemType === 'meal' ? 10 : 5;
        await addPoints(points, `+${points} Pontos!`);
    }

    const newDayItems = { ...dayItems, [itemId]: !isCompleted };
    const newCompletedState = { ...completedItemsByDay, [day]: newDayItems };
    
    await updateCompletedItems(user.id, newCompletedState);
    setCompletedItemsByDay(newCompletedState);

    if (plan && !isCompleted) {
        const allItemIds = ['breakfast', 'lunch', 'dinner', 'snack', ...plan.tasks.map((_, i) => `task-${i}`)];
        if (allItemIds.every(id => newDayItems[id])) {
            const currentBadges = gamification.badges || [];
            const hasBadge = currentBadges.some(b => b.id === 'perfectDay');
            if (!hasBadge) {
                const perfectDayBadge = { ...ALL_BADGES.perfectDay, earnedOn: new Date().toISOString() };
                const updatedBadges = [...currentBadges, perfectDayBadge];
                await updateGamificationData(user.id, { badges: updatedBadges });
                setGamification(prev => prev ? { ...prev, badges: updatedBadges } : null);
                addToast("Nova Conquista: Dia Perfeito!", 'success');
            }
        }
    }
  };

  const resetDayCompletion = async (day: number) => {
    if (!user) return;
    const newCompletedState = { ...completedItemsByDay };
    delete newCompletedState[day];
    await updateCompletedItems(user.id, newCompletedState);
    setCompletedItemsByDay(newCompletedState);
  };

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
    gamification,
    completedItemsByDay,
    toggleItemCompletion,
    resetDayCompletion,
  }), [user, userProfile, isLoading, checkIns, gamification, completedItemsByDay, addPoints, toggleItemCompletion, resetDayCompletion, updateUserProfile, addCheckIn, login, signup, logout, resetPassword]);

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
    const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;

    if (!isSupabaseConfigured) {
        return (
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
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

const Main: React.FC = () => {
    const { isAuthenticated, isLoading } = useApp();

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
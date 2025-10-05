import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, AuthError } from '@supabase/supabase-js';
import type { UserProfile, CheckInData, GamificationData, Badge, DailyPlan } from './types';
import { supabase } from './components/supabaseClient';
import { getProfile, getCheckIns, getGamification, createProfile, updateProfile, addCheckInData, updateGamificationData, updateCompletedItems } from './services/supabaseService';
import { checkAndAwardBadges } from './services/gamificationService';
import { ALL_BADGES } from './data/badges';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
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
  signup: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  logout: () => void;
  completeOnboarding: (profile: Omit<UserProfile, 'user_id' | 'created_at'>) => Promise<void>;
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
      setIsLoading(true);
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        try {
          const profile = await getProfile(currentUser.id);
          setUserProfile(profile);
          if (profile) {
            const [checkInsData, gamificationData] = await Promise.all([
              getCheckIns(currentUser.id),
              getGamification(currentUser.id)
            ]);
            setCheckIns(checkInsData);
            setGamification(gamificationData);
            setCompletedItemsByDay(gamificationData?.completed_items_by_day || {});
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          setUserProfile(null); // Reset on error
        }
      } else {
        setUserProfile(null);
        setCheckIns([]);
        setGamification(null);
        setCompletedItemsByDay({});
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userProfile || !gamification || isLoading) return;

    const potentialNewBadges = checkAndAwardBadges(gamification, userProfile, checkIns);
    const newBadges = potentialNewBadges.filter(
        (potentialBadge) => !gamification.badges.some((b) => b.id === potentialBadge.id)
    );
    
    if (newBadges.length > 0 && user) {
        const updatedBadges = [...gamification.badges, ...newBadges];
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

  const signup = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  const completeOnboarding = async (profileData: Omit<UserProfile, 'user_id' | 'created_at'>) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const newProfile = await createProfile(user.id, profileData);
    setUserProfile(newProfile);
    // Initial check-in and gamification data will be created by database triggers/defaults.
    // Fetch them to update the state.
    const [checkInsData, gamificationData] = await Promise.all([
        getCheckIns(user.id),
        getGamification(user.id)
    ]);
    setCheckIns(checkInsData);
    setGamification(gamificationData);
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
            const hasBadge = gamification.badges.some(b => b.id === 'perfectDay');
            if (!hasBadge) {
                const perfectDayBadge = { ...ALL_BADGES.perfectDay, earnedOn: new Date().toISOString() };
                const updatedBadges = [...gamification.badges, perfectDayBadge];
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
    isAuthenticated: !!user && !!userProfile,
    userProfile,
    isLoading,
    user,
    login,
    signup,
    logout,
    completeOnboarding,
    updateUserProfile,
    checkIns,
    addCheckIn,
    planDuration: 28,
    gamification,
    completedItemsByDay,
    toggleItemCompletion,
    resetDayCompletion,
  }), [user, userProfile, isLoading, checkIns, gamification, completedItemsByDay]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const App: React.FC = () => (
  <ToastProvider>
    <AppProvider>
      <Main />
    </AppProvider>
  </ToastProvider>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const Main: React.FC = () => {
    const { isAuthenticated, isLoading, userProfile } = useApp();

    if (isLoading) return <LoadingSpinner />;

    const needsOnboarding = isAuthenticated && !userProfile;

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
                        needsOnboarding ? (
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
                                <Route path="*" element={<Navigate to="/dashboard" />} />
                            </Route>
                        )
                    )}
                </Routes>
            </HashRouter>
        </div>
    );
}

export default App;
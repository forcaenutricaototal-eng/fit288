import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { UserProfile, CheckInData, GamificationData, Badge, DailyPlan } from './types';
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
  logout: () => void;
  completeOnboarding: (profile: UserProfile) => void;
  updateUserProfile: (updatedProfile: Partial<UserProfile>) => void;
  checkIns: CheckInData[];
  addCheckIn: (data: Omit<CheckInData, 'day'>) => void;
  planDuration: number;
  gamification: GamificationData;
  completedItemsByDay: { [day: number]: { [itemId: string]: boolean } };
  toggleItemCompletion: (day: number, itemId: string, itemType: 'meal' | 'task', plan: DailyPlan | null) => void;
  resetDayCompletion: (day: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gamification, setGamification] = useState<GamificationData>({
    points: 0,
    streak: 0,
    longestStreak: 0,
    lastCheckInDate: null,
    badges: [],
  });
  const [completedItemsByDay, setCompletedItemsByDay] = useState<{ [day: number]: { [itemId: string]: boolean }}>({});
  const { addToast } = useToast();

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('fit28_userProfile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
        
        const storedCheckIns = localStorage.getItem('fit28_checkIns');
        if (storedCheckIns) setCheckIns(JSON.parse(storedCheckIns));
        
        const storedGamification = localStorage.getItem('fit28_gamification');
        if (storedGamification) setGamification(JSON.parse(storedGamification));
        
        const storedCompletedItems = localStorage.getItem('fit28_completedItems');
        if (storedCompletedItems) setCompletedItemsByDay(JSON.parse(storedCompletedItems));

      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      localStorage.removeItem('fit28_userProfile');
      localStorage.removeItem('fit28_checkIns');
      localStorage.removeItem('fit28_gamification');
      localStorage.removeItem('fit28_completedItems');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Effect to check for new badges whenever relevant data changes
  useEffect(() => {
    if (!userProfile || isLoading) return;

    const potentialNewBadges = checkAndAwardBadges(gamification, userProfile, checkIns);
    
    const newBadges = potentialNewBadges.filter(
        (potentialBadge) => !gamification.badges.some((b) => b.id === potentialBadge.id)
    );
    
    if (newBadges.length > 0) {
        setGamification(prev => {
            const finalState = { ...prev, badges: [...prev.badges, ...newBadges] };
            localStorage.setItem('fit28_gamification', JSON.stringify(finalState));
            return finalState;
        });
        newBadges.forEach(badge => {
            addToast(`Nova Conquista: ${badge.name}!`, 'success');
        });
    }
  }, [gamification, userProfile, checkIns, isLoading, addToast]);

  const addPoints = useCallback((amount: number, message: string) => {
    addToast(message, 'info');
    setGamification(prev => {
        const newState = { ...prev, points: prev.points + amount };
        localStorage.setItem('fit28_gamification', JSON.stringify(newState));
        return newState;
    });
  }, [addToast]);


  const isAuthenticated = useMemo(() => userProfile !== null, [userProfile]);
  const planDuration = 28;
  
  const logout = useCallback(() => {
    setUserProfile(null);
    setCheckIns([]);
    setGamification({ points: 0, streak: 0, longestStreak: 0, lastCheckInDate: null, badges: [] });
    setCompletedItemsByDay({});
    localStorage.removeItem('fit28_userProfile');
    localStorage.removeItem('fit28_checkIns');
    localStorage.removeItem('fit28_gamification');
    localStorage.removeItem('fit28_completedItems');
  }, []);
  
  const completeOnboarding = useCallback((profile: UserProfile) => {
    const initialCheckin = { 
      day: 0, 
      weight: profile.weight, 
      waterIntake: 0, 
      fluidRetention: 1,
    };
    const initialGamificationState = {
        points: 0,
        streak: 0,
        longestStreak: 0,
        lastCheckInDate: null,
        badges: [],
    };
    setUserProfile(profile);
    setCheckIns([initialCheckin]);
    setGamification(initialGamificationState);
    setCompletedItemsByDay({});
    localStorage.setItem('fit28_userProfile', JSON.stringify(profile));
    localStorage.setItem('fit28_checkIns', JSON.stringify([initialCheckin]));
    localStorage.setItem('fit28_gamification', JSON.stringify(initialGamificationState));
    localStorage.setItem('fit28_completedItems', JSON.stringify({}));
  }, []);

  const updateUserProfile = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (prev) {
        const newProfile = { ...prev, ...updatedProfile };
        localStorage.setItem('fit28_userProfile', JSON.stringify(newProfile));
        // The useEffect hook will automatically check for the 'goalReached' badge.
        return newProfile;
      }
      return null;
    });
  }, []);

  const addCheckIn = useCallback((data: Omit<CheckInData, 'day'>) => {
    const today = new Date().toISOString().split('T')[0];
    
    setGamification(prev => {
        let newStreak = prev.streak;
        let newLongestStreak = prev.longestStreak;
        
        if (prev.lastCheckInDate) {
            const lastDate = new Date(prev.lastCheckInDate);
            const currentDate = new Date(today);
            const diffTime = currentDate.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }
        
        if (newStreak > newLongestStreak) {
            newLongestStreak = newStreak;
        }

        const finalState = { ...prev, streak: newStreak, longestStreak: newLongestStreak, lastCheckInDate: today };
        localStorage.setItem('fit28_gamification', JSON.stringify(finalState));
        return finalState;
    });

    addPoints(20, "+20 Pontos pelo Check-in!");

    setCheckIns(prev => {
        if (prev.length >= planDuration) return prev;
        const newCheckIn: CheckInData = {
          day: prev.length,
          ...data,
        };
        const newCheckIns = [...prev, newCheckIn];
        localStorage.setItem('fit28_checkIns', JSON.stringify(newCheckIns));
        return newCheckIns;
    });
    
    setUserProfile(prev => {
      if (prev) {
        const newProfile = { ...prev, weight: data.weight };
        localStorage.setItem('fit28_userProfile', JSON.stringify(newProfile));
        return newProfile;
      }
      return null;
    });
  }, [planDuration, addPoints]);

 const toggleItemCompletion = useCallback((day: number, itemId: string, itemType: 'meal' | 'task', plan: DailyPlan | null) => {
    setCompletedItemsByDay(prev => {
        const dayItems = prev[day] || {};
        const isCompleted = dayItems[itemId];

        if (!isCompleted) {
            const points = itemType === 'meal' ? 10 : 5;
            addPoints(points, `+${points} Pontos!`);
        }

        const newDayItems = { ...dayItems, [itemId]: !isCompleted };
        const newState = { ...prev, [day]: newDayItems };
        localStorage.setItem('fit28_completedItems', JSON.stringify(newState));

        // Exception: Check for Perfect Day badge here, as it depends on the daily plan context.
        if (plan && !isCompleted) {
            const mealIds = ['breakfast', 'lunch', 'dinner', 'snack'];
            const taskIds = plan.tasks.map((_, i) => `task-${i}`);
            const allItemIds = [...mealIds, ...taskIds];
            
            const allComplete = allItemIds.every(id => newDayItems[id]);

            if (allComplete) {
                setGamification(prevGam => {
                    const hasBadge = prevGam.badges.some(b => b.id === 'perfectDay');
                    if (!hasBadge) {
                        addToast("Nova Conquista: Dia Perfeito!", 'success');
                        const perfectDayBadge = {
                            ...ALL_BADGES['perfectDay'],
                            earnedOn: new Date().toISOString()
                        };
                        const finalState = { ...prevGam, badges: [...prevGam.badges, perfectDayBadge] };
                        localStorage.setItem('fit28_gamification', JSON.stringify(finalState));
                        return finalState;
                    }
                    return prevGam;
                });
            }
        }
        return newState;
    });
  }, [addPoints, addToast]);

  const resetDayCompletion = useCallback((day: number) => {
    setCompletedItemsByDay(prev => {
        const newState = { ...prev };
        delete newState[day];
        localStorage.setItem('fit28_completedItems', JSON.stringify(newState));
        return newState;
    });
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    userProfile,
    isLoading,
    logout,
    completeOnboarding,
    updateUserProfile,
    checkIns,
    addCheckIn,
    planDuration,
    gamification,
    completedItemsByDay,
    toggleItemCompletion,
    resetDayCompletion,
  }), [isAuthenticated, userProfile, isLoading, checkIns, gamification, completedItemsByDay, logout, completeOnboarding, updateUserProfile, addCheckIn, toggleItemCompletion, resetDayCompletion]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <Main />
      </AppProvider>
    </ToastProvider>
  );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const Main: React.FC = () => {
    const { isAuthenticated, isLoading } = useApp();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-neutral-100 min-h-screen">
            <HashRouter>
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/onboarding" element={<OnboardingPage />} />
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
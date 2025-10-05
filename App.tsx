

import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { UserProfile, CheckInData } from './types';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ChatPage from './pages/ChatPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import ProtocolsPage from './pages/ProtocolsPage';


interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: () => boolean;
  logout: () => void;
  completeOnboarding: (profile: UserProfile) => void;
  updateUserProfile: (updatedProfile: Partial<UserProfile>) => void;
  checkIns: CheckInData[];
  addCheckIn: (data: Omit<CheckInData, 'day'>) => void;
  planDuration: number;
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

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('fit28_userProfile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
        const storedCheckIns = localStorage.getItem('fit28_checkIns');
        if (storedCheckIns) {
          setCheckIns(JSON.parse(storedCheckIns));
        }
      }
    } catch {
      localStorage.removeItem('fit28_userProfile');
      localStorage.removeItem('fit28_checkIns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = useMemo(() => userProfile !== null, [userProfile]);
  const planDuration = 28;
  
  const logout = useCallback(() => {
    setUserProfile(null);
    setCheckIns([]);
    localStorage.removeItem('fit28_userProfile');
    localStorage.removeItem('fit28_checkIns');
  }, []);

  const login = useCallback(() => {
    const storedProfile = localStorage.getItem('fit28_userProfile');
    
    if (storedProfile) {
        try {
            const profile = JSON.parse(storedProfile);
            setUserProfile(profile);
            
            const storedCheckIns = localStorage.getItem('fit28_checkIns');
            if (storedCheckIns) {
                setCheckIns(JSON.parse(storedCheckIns));
            }
            return true;
        } catch (e) {
            logout();
            return false;
        }
    }
    return false;
  }, [logout]);
  
  const completeOnboarding = useCallback((profile: UserProfile) => {
    const initialCheckin = { 
      day: 0, 
      weight: profile.weight, 
      waterIntake: 0, 
      fluidRetention: 1,
    };
    setUserProfile(profile);
    setCheckIns([initialCheckin]);
    localStorage.setItem('fit28_userProfile', JSON.stringify(profile));
    localStorage.setItem('fit28_checkIns', JSON.stringify([initialCheckin]));
  }, []);

  const updateUserProfile = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (prev) {
        const newProfile = { ...prev, ...updatedProfile };
        localStorage.setItem('fit28_userProfile', JSON.stringify(newProfile));
        return newProfile;
      }
      return null;
    });
  }, []);

  const addCheckIn = useCallback((data: Omit<CheckInData, 'day'>) => {
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
  }, [planDuration]);


  const value = useMemo(() => ({
    isAuthenticated,
    userProfile,
    isLoading,
    login,
    logout,
    completeOnboarding,
    updateUserProfile,
    checkIns,
    addCheckIn,
    planDuration,
  }), [isAuthenticated, userProfile, isLoading, checkIns, login, logout, completeOnboarding, updateUserProfile, addCheckIn]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
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
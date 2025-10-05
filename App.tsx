
import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true); // New loading state

  // Effect to load user from localStorage on initial mount
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
      // If data is corrupt, treat as logged out and clean storage.
      localStorage.removeItem('fit28_userProfile');
      localStorage.removeItem('fit28_checkIns');
    } finally {
      setIsLoading(false); // Finished loading attempt
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const isAuthenticated = useMemo(() => userProfile !== null, [userProfile]);
  const planDuration = 28;


  // This effect persists the user's profile to localStorage whenever it changes.
  useEffect(() => {
    // Only save after the initial load is complete to avoid race conditions.
    if (!isLoading) {
        if (userProfile) {
          localStorage.setItem('fit28_userProfile', JSON.stringify(userProfile));
        } else {
          localStorage.removeItem('fit28_userProfile');
        }
    }
  }, [userProfile, isLoading]);
  
  // This effect persists the check-in data.
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('fit28_checkIns', JSON.stringify(checkIns));
    }
  }, [checkIns, isLoading]);

  const login = () => {
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
  };
  
  const logout = () => {
    setUserProfile(null);
    setCheckIns([]);
    localStorage.removeItem('fit28_isAuthenticated');
    localStorage.removeItem('fit28_userProfile');
    localStorage.removeItem('fit28_checkIns');
  };
  
  const completeOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setCheckIns([{ 
      day: 0, 
      weight: profile.weight, 
      waterIntake: 0, 
      fluidRetention: 1,
    }]);
  };

  const updateUserProfile = (updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  };

  const addCheckIn = (data: Omit<CheckInData, 'day'>) => {
    if (checkIns.length > planDuration) return;

    const newCheckIn: CheckInData = {
      day: checkIns.length,
      ...data,
    };
    setCheckIns(prev => [...prev, newCheckIn]);
    
    setUserProfile(prev => prev ? { ...prev, weight: data.weight } : null);
  };


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
  }), [isAuthenticated, userProfile, isLoading, checkIns]);

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

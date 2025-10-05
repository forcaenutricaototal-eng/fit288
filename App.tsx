

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const storedProfile = localStorage.getItem('fit28_userProfile');
      // If a profile exists in storage, the user is considered logged in.
      // This acts as our automatic login on app load.
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch {
      // If data is corrupted, treat as logged out.
      return null;
    }
  });
  
  const [checkIns, setCheckIns] = useState<CheckInData[]>(() => {
    try {
      // Only load check-ins if a profile is also present.
      if (localStorage.getItem('fit28_userProfile')) {
        const storedCheckIns = localStorage.getItem('fit28_checkIns');
        return storedCheckIns ? JSON.parse(storedCheckIns) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Authentication status is now derived directly from the userProfile state.
  const isAuthenticated = useMemo(() => userProfile !== null, [userProfile]);
  const planDuration = 28;


  useEffect(() => {
    // This effect persists the user's session.
    if (userProfile) {
      localStorage.setItem('fit28_userProfile', JSON.stringify(userProfile));
    } else {
      // This case is primarily handled by the logout function.
      localStorage.removeItem('fit28_userProfile');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('fit28_checkIns', JSON.stringify(checkIns));
  }, [checkIns]);

  const login = () => {
    // This function is for the manual login button on the landing page.
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
            // If the stored profile is corrupt, perform a full logout to clean up.
            logout();
            return false;
        }
    }
    return false;
  };
  
  const logout = () => {
    setUserProfile(null);
    setCheckIns([]);
    localStorage.removeItem('fit28_isAuthenticated'); // Keep for legacy cleanup
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
    // Plan days are 1-28. With day 0, length can go to 29.
    if (checkIns.length > planDuration) return;

    const newCheckIn: CheckInData = {
      day: checkIns.length,
      ...data,
    };
    setCheckIns(prev => [...prev, newCheckIn]);
    
    // Also update the user's current weight in their profile
    setUserProfile(prev => prev ? { ...prev, weight: data.weight } : null);
  };


  const value = useMemo(() => ({
    isAuthenticated,
    userProfile,
    login,
    logout,
    completeOnboarding,
    updateUserProfile,
    checkIns,
    addCheckIn,
    planDuration,
  }), [isAuthenticated, userProfile, checkIns]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

const Main: React.FC = () => {
    const { isAuthenticated, userProfile } = useApp();

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

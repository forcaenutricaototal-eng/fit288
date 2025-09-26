
import React, { useState, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { UserProfile, CheckInData } from './types';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ChatPage from './pages/ChatPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';


interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: () => void;
  logout: () => void;
  completeOnboarding: (profile: UserProfile, initialMeasurements: Pick<CheckInData, 'waist' | 'hips' | 'neck' | 'rightArm' | 'leftArm' | 'rightThigh' | 'leftThigh'>) => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const planDuration = 28;
  
  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setCheckIns([]); // Reset progress on logout
  };
  const completeOnboarding = (profile: UserProfile, initialMeasurements: Pick<CheckInData, 'waist' | 'hips' | 'neck' | 'rightArm' | 'leftArm' | 'rightThigh' | 'leftThigh'>) => {
    setUserProfile(profile);
    // Add initial state as the starting point (Day 0)
    setCheckIns([{ 
      day: 0, 
      weight: profile.weight, 
      waterIntake: 0, 
      fluidRetention: 1,
      ...initialMeasurements
    }]);
    setIsAuthenticated(true);
  };

  const addCheckIn = (data: Omit<CheckInData, 'day'>) => {
    // Plan days are 1-28. With day 0, length can go to 29.
    if (checkIns.length > planDuration) return;

    const newCheckIn: CheckInData = {
      day: checkIns.length, // Day 1 will be at index 1 and have length 2 (day 0 + day 1)
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
        <div className="bg-gray-50 min-h-screen">
            <HashRouter>
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/onboarding" element={<OnboardingPage />} />
                            <Route path="/" element={<LandingPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : !userProfile ? (
                         <>
                            <Route path="/onboarding" element={<OnboardingPage />} />
                            <Route path="*" element={<Navigate to="/onboarding" />} />
                        </>
                    ) : (
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Navigate to="/dashboard" />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="chat" element={<ChatPage />} />
                            <Route path="plan" element={<PlanPage />} />
                            <Route path="plan/dia/:id" element={<PlanPage />} />
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

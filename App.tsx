
import React, { useState, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { UserProfile } from './types';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ChatPage from './pages/ChatPage';
import PlanPage from './pages/PlanPage';
import RecipesPage from './pages/RecipesPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';


interface AppContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: () => void;
  logout: () => void;
  completeOnboarding: (profile: UserProfile) => void;
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
  
  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
  };
  const completeOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const value = useMemo(() => ({
    isAuthenticated,
    userProfile,
    login,
    logout,
    completeOnboarding,
  }), [isAuthenticated, userProfile]);

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
                            <Route path="recipes" element={<RecipesPage />} />
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

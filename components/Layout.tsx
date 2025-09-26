
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart2, MessageSquare, Calendar, User } from 'lucide-react';
import { useApp } from '../App';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
  { name: 'Plano', path: '/plan', icon: Calendar },
  { name: 'Chat', path: '/chat', icon: MessageSquare },
  { name: 'Perfil', path: '/profile', icon: User },
];

const Layout: React.FC = () => {
  const { userProfile } = useApp();
    
   const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-xs flex-1 ${
      isActive
        ? 'text-emerald-600'
        : 'text-gray-500 hover:bg-emerald-50'
    }`;
    
  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 my-1 rounded-lg transition-colors ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-emerald-700">Fit28</h1>
        </div>
        <div className="p-4">
            <p className="text-gray-700 font-semibold">{userProfile?.name}</p>
            <p className="text-sm text-gray-500">Seu plano de 28 dias</p>
        </div>
        <nav className="flex-1 px-4">
            {navItems.map((item) => (
            <NavLink key={item.name} to={item.path} className={desktopNavLinkClasses}>
                <item.icon size={20} className="mr-3" />
                <span>{item.name}</span>
            </NavLink>
            ))}
        </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      
      {/* Bottom Nav for mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-50">
          <nav className="flex justify-around items-center h-16">
              {navItems.map((item) => (
                  <NavLink key={item.name} to={item.path} className={mobileNavLinkClasses}>
                      <item.icon size={24} />
                      <span>{item.name}</span>
                  </NavLink>
              ))}
          </nav>
      </footer>
    </div>
  );
};

export default Layout;
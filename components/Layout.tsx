import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart2, User } from 'lucide-react';
import { useApp } from '../App';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
  { name: 'Perfil', path: '/profile', icon: User },
];

const Layout: React.FC = () => {
  const { userProfile } = useApp();
    
   const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-xs flex-1 ${
      isActive
        ? 'text-primary-dark'
        : 'text-neutral-800 hover:bg-neutral-100'
    }`;
    
  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 my-1 rounded-md transition-colors font-medium ${
      isActive
        ? 'bg-primary text-white'
        : 'text-neutral-900 hover:bg-neutral-100 hover:text-primary-dark'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h1 className="text-2xl font-bold text-primary-dark">Fit28</h1>
        </div>
        <div className="p-4">
            <p className="text-neutral-900 font-semibold">{userProfile?.name}</p>
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
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-200">
        {sidebarContent}
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      
      {/* Bottom Nav for mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
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
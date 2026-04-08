import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { navigationConfig } from '../../config/navigation';
import { cn } from '../../lib/utils';
import { Scale } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filteredNav = navigationConfig.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2 border-b">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Scale className="text-white w-5 h-5" />
        </div>
        <span className="font-semibold text-xl tracking-tight">LexFlow</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Current Role
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {user?.role}
          </p>
        </div>
      </div>
    </aside>
  );
};

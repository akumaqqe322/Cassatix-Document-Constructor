import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-gray-500">
          Welcome back, <span className="text-gray-900 font-semibold">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border">
            <UserIcon className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 leading-none">{user?.name}</span>
            <span className="text-xs text-gray-500 mt-1">{user?.email}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="ml-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for stubbed auth
const MOCK_USERS: Record<UserRole, User> = {
  [UserRole.ADMIN]: {
    id: '1',
    email: 'admin@firm.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  [UserRole.LAWYER]: {
    id: '2',
    email: 'lawyer@firm.com',
    name: 'Lawyer User',
    role: UserRole.LAWYER,
  },
  [UserRole.PARTNER]: {
    id: '3',
    email: 'partner@client.com',
    name: 'Partner User',
    role: UserRole.PARTNER,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Simulate checking session
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      setState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (role: UserRole) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const user = MOCK_USERS[role];
    localStorage.setItem('mock_user', JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('mock_user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

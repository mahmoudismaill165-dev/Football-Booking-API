import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { mockUsers } from '../services/mockData';
import { setAuthToken, clearAuthToken, getAuthToken } from '../services/api';
import { footballApi } from '../services/footballApi';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'PLAYER',
  token: null,
  isAuthenticated: false,
  isDemoMode: true,
  setDemoMode: () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
  switchRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => footballApi.isDemoMode());
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockUsers[3]; // default player Omar
      }
    }
    return mockUsers[3]; // default to Omar (PLAYER)
  });

  const [token, setToken] = useState<string | null>(() => getAuthToken() || 'demo-token');

  const setDemoMode = (enabled: boolean) => {
    footballApi.setDemoMode(enabled);
    setIsDemoModeState(enabled);
  };

  const role = user?.role || 'PLAYER';

  useEffect(() => {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const res = await footballApi.login({ email, password: pass });
    setUser(res.user);
    if (res.token) {
      setToken(res.token);
      setAuthToken(res.token);
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    const res = await footballApi.register({ name, email, password: pass, phone });
    setUser(res.user);
    const token = (res as any).token;
    if (token) {
      setToken(token);
      setAuthToken(token);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthToken();
  };

  const switchRole = (newRole: Role) => {
    const match = mockUsers.find((u) => u.role === newRole);
    if (match) {
      setUser(match);
      setToken('demo-token-' + newRole);
    } else if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        isDemoMode,
        setDemoMode,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

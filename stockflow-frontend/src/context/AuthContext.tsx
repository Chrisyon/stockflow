import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LoginRequest } from '../types';
import { authApi } from '../services/api';
import { initialUsers } from '../data/dummyData';

interface AuthContextType {
  user: User | null;
  loginWithCredentials: (request: LoginRequest) => Promise<void>;
  loginDemoRole: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(initialUsers[0]); // Default Admin
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check stored JWT token on startup
    const token = localStorage.getItem('stockflow_token');
    if (token) {
      setIsLoading(true);
      authApi.getCurrentUser()
        .then(profile => {
          setUser({
            id: profile.id,
            username: profile.username,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
            isActive: profile.isActive,
            createdAt: profile.createdAt,
          });
        })
        .catch(() => {
          // Token expired or server offline, clear token
          localStorage.removeItem('stockflow_token');
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const loginWithCredentials = async (request: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(request);
      localStorage.setItem('stockflow_token', res.accessToken);
      setUser({
        id: res.id,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal login. Periksa username & password.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoRole = (role: UserRole) => {
    const target = initialUsers.find(u => u.role === role) || initialUsers[0];
    setUser(target);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('stockflow_token');
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    loginDemoRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithCredentials,
        loginDemoRole,
        logout,
        switchRole,
        isAuthenticated: !!user,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

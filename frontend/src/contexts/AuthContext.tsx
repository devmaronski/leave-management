import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loginUser, getCurrentUser } from '@/api/auth.api';
import type { User, LoginRequest } from '@/types/models';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // TanStack Query for /auth/me - restore session on mount
  const { data: currentUser, isLoading: isFetchingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(isFetchingUser);
  }, [currentUser, isFetchingUser]);

  // Listen for 401 logout event from axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [queryClient]);

  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      const { accessToken } = await loginUser(credentials);
      localStorage.setItem('access_token', accessToken);
      const userData = await getCurrentUser();
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      return userData;
    } catch (error) {
      // Clean up on login failure
      localStorage.removeItem('access_token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    queryClient.clear();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

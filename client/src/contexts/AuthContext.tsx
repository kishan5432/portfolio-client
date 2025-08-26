import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      apiClient.setToken(storedToken);
      // Verify token with backend
      verifyToken(storedToken);
    } else {
      if (storedToken) {
        // Token is expired, remove it
        localStorage.removeItem('auth_token');
      }
      apiClient.setToken(null);
      setIsLoading(false);
    }
  }, []);

  // Set up periodic token refresh
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        refreshToken();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [token]);

  // Update API client token whenever token changes
  useEffect(() => {
    console.log('🔐 AuthContext: Token changed, updating API client:', token ? `${token.substring(0, 20)}...` : 'null');
    apiClient.setToken(token);
  }, [token]);

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const verifyToken = async (authToken: string) => {
    try {
      const response = await apiClient.verifyToken();
      if (response.success) {
        setUser(response.data);
        setToken(authToken);
      } else {
        // Token is invalid, try to refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Try to refresh token before giving up
      await refreshToken();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      if (response.success) {
        const { token: newToken } = response.data;
        setToken(newToken);
        apiClient.setToken(newToken);
        localStorage.setItem('auth_token', newToken);
        // Verify the new token
        await verifyToken(newToken);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear everything and redirect to login
      localStorage.removeItem('auth_token');
      setToken(null);
      apiClient.setToken(null);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login...');
      const response = await apiClient.login({ email, password });
      console.log('🔐 Login successful');

      const { token: authToken, user: userData } = response.data;

      setToken(authToken);
      apiClient.setToken(authToken);
      setUser(userData);
      localStorage.setItem('auth_token', authToken);
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error && error.message.includes('Rate limit')) {
        console.log('🔄 Rate limited - request will be retried automatically');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');

    // Call logout endpoint to clear server-side session
    apiClient.logout().catch(console.error);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

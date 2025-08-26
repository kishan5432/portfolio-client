import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ApiResponse,
} from '@portfolio/types';
import { apiClient } from '@/lib/api';

// Token management utilities
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');
const setRefreshToken = (refreshToken: string) => localStorage.setItem('refresh_token', refreshToken);
const getToken = () => localStorage.getItem('auth_token');

// Auth state interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
  sessionExpiry: number | null;
}

// Auth store interface
interface AuthStore extends AuthState {
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  logout: () => void;
  clearAuth: () => void;

  // Session management
  isSessionValid: () => boolean;
  getTimeUntilExpiry: () => number;
  extendSession: () => void;
}

// Default state
const defaultState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  lastActivity: Date.now(),
  sessionExpiry: null,
};

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Create the auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      ...defaultState,

      setUser: (user: AuthUser | null) => {
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
          if (user) {
            state.lastActivity = Date.now();
            // Set session expiry (24 hours default)
            state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
          } else {
            state.sessionExpiry = null;
          }
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      updateLastActivity: () => {
        set((state) => {
          state.lastActivity = Date.now();
        });
      },

      logout: () => {
        removeToken();
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.sessionExpiry = null;
        });
      },

      clearAuth: () => {
        removeToken();
        set(() => defaultState);
      },

      isSessionValid: () => {
        const { sessionExpiry, lastActivity } = get();
        const now = Date.now();

        if (!sessionExpiry) return false;
        if (now > sessionExpiry) return false;
        if (now - lastActivity > SESSION_TIMEOUT) return false;

        return true;
      },

      getTimeUntilExpiry: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return 0;
        return Math.max(0, sessionExpiry - Date.now());
      },

      extendSession: () => {
        set((state) => {
          state.lastActivity = Date.now();
          state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
        });
      },
    })),
    {
      name: 'portfolio-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
        lastActivity: state.lastActivity,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.isSessionValid()) {
          state.clearAuth();
        }
      },
    }
  )
);

// API functions
const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/me');
    return response.data!;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/auth/change-password', data);
  },

  refreshToken: async (): Promise<{ token: string; expiresIn: number }> => {
    const response = await apiClient.post<{ token: string; expiresIn: number }>('/auth/refresh');
    return response.data!;
  },
};

// React Query hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      const { user, token, refreshToken } = data;

      // Store tokens
      setToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Update auth state
      setUser(user);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Clear auth state and tokens
      logout();

      // Clear all cached data
      queryClient.clear();

      // Redirect to login page
      window.location.href = '/admin';
    },
  });
};

export const useCurrentUser = () => {
  const { user, isAuthenticated, isSessionValid } = useAuthStore();
  const { setUser, clearAuth, updateLastActivity } = useAuthStore();

  const query = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated && isSessionValid() && !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle success and error cases
  React.useEffect(() => {
    if (query.data) {
      setUser(query.data);
      updateLastActivity();
    }
  }, [query.data, setUser, updateLastActivity]);

  React.useEffect(() => {
    if (query.error) {
      clearAuth();
    }
  }, [query.error, clearAuth]);

  return query;
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      // Optionally show success message or logout user
    },
  });
};

export const useRefreshToken = () => {
  const { setUser, extendSession } = useAuthStore();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      const { token } = data;
      setToken(token);
      extendSession();
    },
    onError: () => {
      useAuthStore.getState().clearAuth();
    },
  });
};

// Custom hooks for auth state
export const useAuth = () => {
  const store = useAuthStore();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  return {
    ...store,
    user: currentUser || store.user,
    isLoading: store.isLoading || isUserLoading,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isSessionValid, clearAuth } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && !isSessionValid()) {
      clearAuth();
    }
  }, [isAuthenticated, isSessionValid, clearAuth]);

  return { isAuthenticated: isAuthenticated && isSessionValid() };
};

// Session management hook
export const useSessionManager = () => {
  const { isAuthenticated, updateLastActivity, isSessionValid, clearAuth } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated) return;

    // Update activity on user interactions
    const handleActivity = () => {
      updateLastActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check session validity every minute
    const sessionCheckInterval = setInterval(() => {
      if (!isSessionValid()) {
        clearAuth();
      }
    }, 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [isAuthenticated, updateLastActivity, isSessionValid, clearAuth]);
};

// Permission checking hook
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const canEdit = () => {
    return isAdmin();
  };

  const canDelete = () => {
    return isAdmin();
  };

  const canCreate = () => {
    return isAdmin();
  };

  return {
    hasRole,
    isAdmin,
    canEdit,
    canDelete,
    canCreate,
  };
};

// Auth guards for components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const { isAuthenticated } = useRequireAuth();

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-text/70 mb-4">You need to be logged in to access this page.</p>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string
): React.ComponentType<P> => {
  return (props: P) => {
    const { hasRole } = usePermissions();

    if (!hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-text/70">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Selectors for better performance
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthUser = () => useAuthStore(state => state.user);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);

export default useAuthStore;


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  fullName?: string;
  bio?: string;
  avatar?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  registerMutation: {
    mutateAsync: (data: RegisterData) => Promise<any>;
    isPending: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/status', {
        credentials: 'include', // Include cookies for cross-site deployments
      });
      
      if (response.ok) {
        const data = await response.json();
        const isAuth = (data?.authenticated ?? data?.isAuthenticated) === true;
        if (isAuth) {
          if (import.meta.env?.DEV) {
            console.log('[Auth] User authenticated:', data.user);
          }
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Auth check error:', error);
      setUser(null);
    } finally {
      setIsAuthReady(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Helper to fetch CSRF token for protected POST routes (e.g., logout)
  const fetchCsrfToken = async (): Promise<string> => {
    try {
      const resp = await fetch('/api/csrf-token', { credentials: 'include' });
      if (!resp.ok) return '';
      const data = await resp.json();
      return (data?.csrfToken as string) || '';
    } catch {
      return '';
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (import.meta.env?.DEV) {
        console.log('[Auth] Attempting login with credentials:', { email, rememberMe });
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for ensuring cookies are sent
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Auth] Login failed with status:', response.status);
        throw new Error(data.message || 'Login failed');
      }
      
      if (import.meta.env?.DEV) {
        console.log('[Auth] Login successful:', data);
      }
      // Backend returns { success, user, message }; store the user object
      setUser(data.user ?? data);
      try {
        if (data?.token) localStorage.setItem('auth_token', data.token);
      } catch {}
      return data.user ?? data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('[Auth] Login error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsRegistering(true);
    setError(null);
    
    try {
      if (import.meta.env?.DEV) {
        console.log('[Auth] Attempting registration:', { email: data.email, username: data.username });
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for ensuring cookies are sent
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('[Auth] Registration failed with status:', response.status);
        throw new Error(responseData.message || 'Registration failed');
      }
      
      if (import.meta.env?.DEV) {
        console.log('[Auth] Registration successful:', responseData);
      }
      // Backend returns { success, user, message }; store the user object
      setUser(responseData.user ?? responseData);
      try {
        if (responseData?.token) localStorage.setItem('auth_token', responseData.token);
      } catch {}
      return responseData.user ?? responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('[Auth] Registration error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // CSRF token required for logout POST in production
      const csrfToken = await fetchCsrfToken();
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        let message = 'Logout failed';
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {}
        throw new Error(message);
      }
      
      setUser(null);
      try { localStorage.removeItem('auth_token'); } catch {}
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Logout error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Registration mutation with proper isPending property
  const registerMutation = {
    mutateAsync: register,
    isPending: isRegistering
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAuthReady,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    registerMutation
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
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
      const response = await fetch('/api/auth/status');
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          // Ensure we have the latest user data with all fields
          console.log('[Auth] User authenticated:', data.user);
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

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Auth] Attempting login with credentials:', { email, rememberMe });
      
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
      
      console.log('[Auth] Login successful:', data);
      setUser(data);
      return data;
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
      console.log('[Auth] Attempting registration:', { email: data.email, username: data.username });
      
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
      
      console.log('[Auth] Registration successful:', responseData);
      setUser(responseData);
      return responseData;
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
      const response = await fetch('/api/auth/logout', {
        credentials: 'include' // Important for ensuring cookies are sent
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }
      
      setUser(null);
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
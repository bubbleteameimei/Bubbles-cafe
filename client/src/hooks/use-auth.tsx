import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getApiBaseUrl } from '@/lib/asset-path';
import { fetchCsrfTokenIfNeeded, createCSRFRequest } from '@/lib/csrf-token';

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
      const API_BASE = getApiBaseUrl();
      const url = API_BASE ? `${API_BASE}/api/auth/status` : '/api/auth/status';
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const isAuth = (data?.authenticated ?? data?.isAuthenticated) === true;
        if (isAuth) {
          setUser(data.user);
        } else {
          // Attempt to re-establish a server session from Supabase if available
          try {
            const { data: s } = await supabase.auth.getSession();
            const token = s?.session?.access_token;
            if (token) {
              await finalizeServerSession(token);
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        }
      } else {
        // Non-200 response: try to finalize from Supabase token as a fallback
        try {
          const { data: s } = await supabase.auth.getSession();
          const token = s?.session?.access_token;
          if (token) {
            await finalizeServerSession(token);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
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

  const finalizeServerSession = async (access_token: string, rememberMe?: boolean) => {
    const API_BASE = getApiBaseUrl();
    const url = API_BASE ? `${API_BASE}/api/auth/supabase/login` : '/api/auth/supabase/login';
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ access_token, rememberMe: !!rememberMe }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const message = (data as any)?.error || (data as any)?.message || 'Failed to create server session';
      const detailed = `Server session creation failed (status ${resp.status}): ${message}`;
      setError(detailed);
      throw new Error(detailed);
    }
    setUser((data as any)?.user ?? null);
    return (data as any)?.user;
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabaseConfigured = Boolean((import.meta as any)?.env?.VITE_SUPABASE_URL && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY);

      if (supabaseConfigured) {
        if (import.meta.env?.DEV) {
          console.log('[Auth] Supabase signInWithPassword:', { email });
        }
        const { data, error: sError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (sError) {
          const detailed = `Supabase login error: ${sError.message}`;
          setError(detailed);
          throw new Error(detailed);
        }
        const access_token = data.session?.access_token;
        if (!access_token) {
          const detailed = 'Supabase login succeeded but no session token was returned';
          setError(detailed);
          throw new Error(detailed);
        }
        const serverUser = await finalizeServerSession(access_token, rememberMe);
        return serverUser;
      }

      // Fallback: use local server auth when Supabase is not configured
      const API_BASE = getApiBaseUrl();
      const url = API_BASE ? `${API_BASE}/api/auth/login` : '/api/auth/login';
      await fetchCsrfTokenIfNeeded();
      const resp = await fetch(url, createCSRFRequest('POST', { email, password, rememberMe }));
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const message = (data as any)?.error || (data as any)?.message || 'Login failed';
        const detailed = `Login failed (status ${resp.status}): ${message}`;
        setError(detailed);
        throw new Error(detailed);
      }
      const user = (data as any)?.user || null;
      setUser(user);
      return user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('[Auth] Login error:', msg);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterData) => {
    setIsRegistering(true);
    setError(null);
    try {
      const supabaseConfigured = Boolean((import.meta as any)?.env?.VITE_SUPABASE_URL && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY);

      if (supabaseConfigured) {
        if (import.meta.env?.DEV) {
          console.log('[Auth] Supabase signUp:', { email: payload.email, username: payload.username });
        }
        const { data, error: sError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: { username: payload.username },
          emailRedirectTo: `${window.location.origin}/auth/success`,
        },
      });
      if (sError) {
        const detailed = `Supabase registration error: ${sError.message}`;
        setError(detailed);
        throw new Error(detailed);
      }
      // Depending on Supabase settings, signUp may require email confirmation (no session)
      const access_token = data.session?.access_token;
      if (access_token) {
        const serverUser = await finalizeServerSession(access_token);
        return serverUser;
      } else {
        // No immediate session; prompt the user to verify email
        return { message: 'Check your email to confirm your account.' };
      };
        }
      }

      // Fallback: local server registration when Supabase is not configured
      const API_BASE = getApiBaseUrl();
      const url = API_BASE ? `${API_BASE}/api/auth/register` : '/api/auth/register';
      await fetchCsrfTokenIfNeeded();
      const resp = await fetch(url, createCSRFRequest('POST', payload));
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const message = (data as any)?.error || (data as any)?.message || 'Registration failed';
        const detailed = `Registration failed (status ${resp.status}): ${message}`;
        setError(detailed);
        throw new Error(detailed);
      }
      const user = (data as any)?.user || null;
      setUser(user);
      return user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('[Auth] Registration error:', msg);
      setError(msg);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear Supabase session (no-op if not configured)
      try { await supabase.auth.signOut(); } catch {}

      // Clear server session with CSRF protection
      const API_BASE = getApiBaseUrl();
      const url = API_BASE ? `${API_BASE}/api/auth/logout` : '/api/auth/logout';
      await fetchCsrfTokenIfNeeded();
      const response = await fetch(url, createCSRFRequest('POST'));
      if (!response.ok) {
        let message = 'Logout failed';
        try {
          const data = await response.json();
          message = (data as any).message || message;
        } catch {}
        throw new Error(message);
      }

      setUser(null);
      try { localStorage.removeItem('auth_token'); } catch {}
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
      console.error('Logout error:', msg);
    } finally {
      setIsLoading(false);
    }
  };

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
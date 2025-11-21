import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, initSupabase } from '@/lib/supabase';

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

  const finalizeServerSession = useCallback(async (access_token: string, rememberMe?: boolean) => {
    // Use relative path; getApiBaseUrl already resolves to the API domain when needed
    const resp = await fetch('/api/auth/supabase/login', {
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
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const ready = await initSupabase();
      if (!ready) {
        setUser(null);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[Auth] Supabase session error:', sessionError.message);
        setUser(null);
        return;
      }

      const token = data?.session?.access_token;
      if (token) {
        try {
          await finalizeServerSession(token);
        } catch (e) {
          console.error('[Auth] finalizeServerSession error:', e);
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
  }, [finalizeServerSession]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const ready = await initSupabase();
      if (!ready) {
        const detailed = 'Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or server SUPABASE_URL/SUPABASE_ANON_KEY) to use email/password sign-in.';
        setError(detailed);
        throw new Error(detailed);
      }

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
      const ready = await initSupabase();
      if (!ready) {
        const detailed = 'Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or server SUPABASE_URL/SUPABASE_ANON_KEY) to use email/password sign-up.';
        setError(detailed);
        throw new Error(detailed);
      }

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
      }
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
    setError(null);
    try {
      const ready = await initSupabase();
      if (ready) {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore Supabase sign-out errors on client
        }
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
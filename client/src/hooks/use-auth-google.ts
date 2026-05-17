import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const TOKENS_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

/**
 * Hook for Google OAuth + JWT authentication
 * Replaces Supabase auth with direct Google OAuth + JWT
 */
export function useAuthGoogle() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem(TOKENS_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedTokens && savedUser) {
      try {
        setTokens(JSON.parse(savedTokens));
        setUser(JSON.parse(savedUser));
      } catch {
        // Clear if corrupted
        localStorage.removeItem(TOKENS_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Get Google authorization URL
  const getGoogleAuthUrl = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/google/authorize');
      const data = await response.json();
      return data.authUrl;
    } catch (err) {
      setError('Failed to get Google auth URL');
      throw err;
    }
  }, []);

  // Login with email/password
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Login failed');
        }

        const data = await response.json();
        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setUser(data.user);

        localStorage.setItem(TOKENS_KEY, JSON.stringify(data));
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Handle Google OAuth callback
  const handleGoogleCallback = useCallback(
    async (accessToken: string, refreshToken: string) => {
      try {
        setError(null);

        // Fetch user info with access token
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        const authData = { accessToken, refreshToken, user: userData };

        setTokens({ accessToken, refreshToken });
        setUser(userData);

        localStorage.setItem(TOKENS_KEY, JSON.stringify({ accessToken, refreshToken }));
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        return authData;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Refresh access token
  const refreshToken = useCallback(async () => {
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newTokens = { ...tokens, accessToken: data.accessToken };

      setTokens(newTokens);
      localStorage.setItem(TOKENS_KEY, JSON.stringify(newTokens));

      return newTokens;
    } catch (err) {
      // Clear tokens on refresh failure
      logout();
      throw err;
    }
  }, [tokens]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (tokens?.refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem(TOKENS_KEY);
      localStorage.removeItem(USER_KEY);
      queryClient.clear();
    }
  }, [tokens, queryClient]);

  return {
    user,
    tokens,
    loading,
    error,
    getGoogleAuthUrl,
    loginWithEmail,
    handleGoogleCallback,
    refreshToken,
    logout,
    isAuthenticated: !!user && !!tokens,
  };
}

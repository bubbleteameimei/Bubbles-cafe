import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { insertUserSchema } from '@shared/schema';

// Types
type SelectUser = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatar?: string | null;
  fullName?: string | null;
  bio?: string | null;
};

type SocialUser = {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  provider: string;
  token?: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  socialLoginMutation: UseMutationResult<SelectUser, Error, SocialUser>;
};

// Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof insertUserSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: userData, isLoading: isLoadingAuth } = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: async () => {
      try {
        return await apiRequest<{ isAuthenticated: boolean; user?: SelectUser }>('/api/auth/status');
      } catch (error) {
        console.error('Error fetching auth status:', error);
        return { isAuthenticated: false };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      setIsLoading(false);
      if (userData?.isAuthenticated && userData.user) {
        setUser(userData.user);
      } else {
        setUser(null);
      }
    }
  }, [isLoadingAuth, userData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await apiRequest<SelectUser>('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (user: SelectUser) => {
      setUser(user);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error: Error) => {
      setError(error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      return await apiRequest<SelectUser>('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (user: SelectUser) => {
      setUser(user);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error: Error) => {
      setError(error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error: Error) => {
      setError(error);
    },
  });

  // Social login mutation
  const socialLoginMutation = useMutation({
    mutationFn: async (socialUserData: SocialUser) => {
      return await apiRequest<SelectUser>('/api/auth/social-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: socialUserData.id,
          email: socialUserData.email,
          displayName: socialUserData.name,
          photoURL: socialUserData.photoURL,
          provider: socialUserData.provider,
          token: socialUserData.token
        }),
      });
    },
    onSuccess: (user: SelectUser) => {
      setUser(user);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error: Error) => {
      console.error('Social login error:', error);
      setError(error);
    },
  });

  // Login convenience method
  const login = useCallback(async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }, [loginMutation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        loginMutation,
        logoutMutation,
        registerMutation,
        socialLoginMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
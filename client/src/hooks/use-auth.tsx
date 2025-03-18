import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { insertUserSchema, loginSchema } from '@shared/schema';

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

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string, remember?: boolean) => Promise<SelectUser | void>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

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
        console.log('[Auth] Fetching auth status from server');
        const response = await apiRequest<{ isAuthenticated: boolean; user?: SelectUser }>('/api/auth/status');
        
        if (response?.isAuthenticated && response?.user) {
          console.log('[Auth] User is authenticated:', {
            id: response.user.id,
            username: response.user.username,
            isAdmin: response.user.isAdmin
          });
        } else {
          console.log('[Auth] User is not authenticated');
        }
        
        return response;
      } catch (error) {
        console.error('[Auth] Error fetching auth status:', error);
        // Log more details about the error for debugging
        if (error instanceof Error) {
          console.error('[Auth] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
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

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      console.log('[Auth] Initiating registration request', { 
        email: credentials.email,
        hasUsername: !!credentials.username,
        hasPassword: !!credentials.password 
      });

      try {
        const response = await apiRequest<SelectUser>('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        
        console.log('[Auth] Registration request successful', { userId: response.id });
        return response;
      } catch (error) {
        console.error('[Auth] Registration request failed', error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log('[Auth] Registration mutation successful, updating state');
      setUser(user);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error: Error) => {
      console.error('[Auth] Registration mutation error:', error);
      setError(error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('[Auth] Initiating logout request');
      
      try {
        await apiRequest('/api/auth/logout');
        console.log('[Auth] Logout request successful');
      } catch (error) {
        console.error('[Auth] Logout request failed', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[Auth] Logout mutation successful, clearing user state');
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
    },
    onError: (error: Error) => {
      console.error('[Auth] Logout mutation error:', error);
      setError(error);
    },
  });

  // Login convenience method
  const login = useCallback(async (email: string, password: string, remember?: boolean) => {
    console.log('[Auth] Invoking login method', { 
      hasEmail: !!email, 
      hasPassword: !!password,
      remember
    });
    
    try {
      console.log('[Auth] Attempting to login');
      
      const response = await apiRequest<SelectUser>('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
      });
      
      console.log('[Auth] Login successful', { userId: response?.id });
      setUser(response);
      setError(null);
      
      // Force re-fetch of auth status to update UI
      queryClient.invalidateQueries({ queryKey: ['auth', 'status'] });
      
      // Log the successful authentication event
      console.log('[Auth] User authenticated successfully, updating authentication state');
      
      return response;
    } catch (error) {
      console.error('[Auth] Login failed', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('[Auth] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setError(error);
        throw error;
      }
      
      const unknownError = new Error('Login failed with an unknown error');
      console.error('[Auth] Unknown error occurred during login');
      setError(unknownError);
      throw unknownError;
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logoutMutation,
        registerMutation,
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
  
  // Add a derived state to check if the user is authenticated
  const isAuthenticated = !!context.user;
  
  // Add a method to check if auth state is fully loaded and user is authenticated
  const isAuthReady = !context.isLoading;
  
  return {
    ...context,
    isAuthenticated,
    isAuthReady
  };
}